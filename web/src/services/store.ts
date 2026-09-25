// The app's single source of truth — a typed port of the legacy in-memory store (app/js/store.js).
//
// There is no backend: the "database" is seeded from data/seed.ts and lives only in memory, exactly
// like the legacy app (a reload brings the seed back). Unlike the legacy store, every update here is
// immutable, so React components subscribe to just the slice they read (see hooks/useStore.ts) and
// re-render only when that slice changes.
import * as seed from '../data/seed';
import type { Application, Database, Decision, Job, Role, WorkerPost } from '../types/models';
import { applicationFor, applicationsForJob, approvedCount } from './selectors';

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

interface State {
  /** Demo account switch — which side of the marketplace is "logged in". */
  role: Role;
  db: Database;
  /** Screen-local UI state, keyed per screen. It survives navigation, like the legacy `ui` bag. */
  ui: Record<string, object>;
}

let state: State = {
  role: 'trabalhador',
  db: {
    companies: clone(seed.COMPANIES),
    workers: clone(seed.WORKERS),
    jobs: clone(seed.JOBS),
    applications: clone(seed.APPLICATIONS),
    savedJobIds: [...seed.SAVED_JOB_IDS],
    deletedJobIds: [],
    workerPosts: clone(seed.WORKER_POSTS)
  },
  ui: {}
};

const listeners = new Set<() => void>();
let version = 0;

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  version++;
  listeners.forEach((fn) => fn());
}

/** Increments on every store change (see components/LegacyRerender.tsx and layouts/AppShell.tsx). */
export function getVersion(): number {
  return version;
}

export function getRole(): Role {
  return state.role;
}

export function getDb(): Database {
  return state.db;
}

export function setRole(role: Role): void {
  state = { ...state, role };
  notify();
}

// ---- screen UI state ----

export type UIDefaults<T extends object> = T | (() => T);

/** Returns the UI bag for `key`, creating it from `defaults` the first time (without notifying). */
export function getUI<T extends object>(key: string, defaults: UIDefaults<T>): T {
  if (!(key in state.ui)) {
    state.ui[key] = typeof defaults === 'function' ? (defaults as () => T)() : Object.assign({}, defaults);
  }
  return state.ui[key] as T;
}

export type UIPatch<T> = Partial<T> | ((current: T) => Partial<T>);

export function setUI<T extends object>(key: string, patch: UIPatch<T>): void {
  const cur = (state.ui[key] || {}) as T;
  const next = Object.assign({}, cur, typeof patch === 'function' ? patch(cur) : patch);
  state = { ...state, ui: { ...state.ui, [key]: next } };
  notify();
}

export function resetUI(key: string): void {
  const ui = { ...state.ui };
  delete ui[key];
  state = { ...state, ui };
  notify();
}

// ---- data mutations ----

function updateDb(recipe: (db: Database) => Database): void {
  state = { ...state, db: recipe(state.db) };
  notify();
}

export function createJob(job: Job): string {
  updateDb((db) => ({ ...db, jobs: { ...db.jobs, [job.id]: job } }));
  return job.id;
}

export function deleteJobPost(jobId: string): void {
  updateDb((db) => ({ ...db, deletedJobIds: [...db.deletedJobIds, jobId] }));
}

export function updateJob(jobId: string, patch: Partial<Job>): void {
  const job = state.db.jobs[jobId];
  if (job) updateDb((db) => ({ ...db, jobs: { ...db.jobs, [jobId]: { ...job, ...patch } } }));
}

export function updateCompany(companyId: string, patch: Partial<Database['companies'][string]>): void {
  const company = state.db.companies[companyId];
  if (company) updateDb((db) => ({ ...db, companies: { ...db.companies, [companyId]: { ...company, ...patch } } }));
}

export function updateWorker(workerId: string, patch: Partial<Database['workers'][string]>): void {
  const worker = state.db.workers[workerId];
  if (worker) updateDb((db) => ({ ...db, workers: { ...db.workers, [workerId]: { ...worker, ...patch } } }));
}

const isPending = (a: Application) => a.status === 'enviada' || a.status === 'em_analise';

export function closeJob(jobId: string): void {
  const job = state.db.jobs[jobId];
  if (!job) return;
  const hired = approvedCount(state.db, jobId) > 0;
  const closedJob: Job = { ...job, closed: true, ...(hired ? {} : { semContratacao: true }) };
  updateDb((db) => ({
    ...db,
    jobs: { ...db.jobs, [jobId]: closedJob },
    applications: db.applications.map((a) =>
      a.jobId === jobId && isPending(a) ? { ...a, status: 'nao_selecionado' } : a
    )
  }));
}

export function applyToJob(jobId: string, workerId: string): void {
  updateDb((db) =>
    applicationFor(db, jobId, workerId)
      ? db
      : { ...db, applications: [...db.applications, { id: 'a' + Date.now(), jobId, workerId, status: 'enviada' }] }
  );
}

export function cancelApplication(jobId: string, workerId: string): void {
  const i = state.db.applications.findIndex((a) => a.jobId === jobId && a.workerId === workerId);
  if (i >= 0) updateDb((db) => ({ ...db, applications: db.applications.filter((_, k) => k !== i) }));
}

export function decideApplication(jobId: string, workerId: string, decision: Decision): void {
  const app = applicationFor(state.db, jobId, workerId);
  if (!app) return;
  const status =
    decision === 'aprovado' ? 'pre_selecionado' : decision === 'recusado' ? 'nao_selecionado' : 'em_analise';
  let db: Database = {
    ...state.db,
    applications: state.db.applications.map((a) => (a === app ? { ...a, status } : a))
  };
  const job = db.jobs[jobId];
  // Filling the last slot turns every still-pending candidate down.
  if (decision === 'aprovado' && job && approvedCount(db, jobId) >= (job.slots || 1)) {
    const pending = new Set(applicationsForJob(db, jobId).filter(isPending));
    db = {
      ...db,
      applications: db.applications.map((a) => (pending.has(a) ? { ...a, status: 'nao_selecionado' } : a))
    };
  }
  updateDb(() => db);
}

export function markReviewed(jobId: string, workerId: string): void {
  const app = applicationFor(state.db, jobId, workerId);
  if (app) {
    updateDb((db) => ({
      ...db,
      applications: db.applications.map((a) => (a === app ? { ...a, status: 'avaliada' } : a))
    }));
  }
}

export function toggleSavedJob(jobId: string): void {
  updateDb((db) => ({
    ...db,
    savedJobIds: db.savedJobIds.includes(jobId)
      ? db.savedJobIds.filter((id) => id !== jobId)
      : [...db.savedJobIds, jobId]
  }));
}

export function addWorkerPost(
  workerId: string,
  { mediaUrl, mediaType, caption }: Pick<WorkerPost, 'mediaUrl' | 'mediaType' | 'caption'>
): void {
  const post: WorkerPost = {
    id: 'wp' + Date.now(),
    workerId,
    mediaUrl,
    mediaType,
    caption,
    date: new Date().toISOString().slice(0, 10)
  };
  updateDb((db) => ({ ...db, workerPosts: [post, ...db.workerPosts] }));
}

export function deleteWorkerPost(postId: string): void {
  const i = state.db.workerPosts.findIndex((p) => p.id === postId);
  if (i >= 0) updateDb((db) => ({ ...db, workerPosts: db.workerPosts.filter((_, k) => k !== i) }));
}
