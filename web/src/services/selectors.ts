// Read-only queries over the mock database — the same queries the legacy store exposed, as pure
// functions of a Database snapshot (so components can memoize on it).
import { CURRENT_COMPANY_ID, CURRENT_WORKER_ID } from '../data/seed';
import type { Application, Company, Database, Job, Worker, WorkerPost } from '../types/models';

// ---- companies & workers ----
export const getCompany = (db: Database, id: string): Company | undefined => db.companies[id];
export const allCompanies = (db: Database): Company[] => Object.values(db.companies);
export const currentCompany = (db: Database): Company => db.companies[CURRENT_COMPANY_ID];
export const currentCompanyId = (): string => CURRENT_COMPANY_ID;

export const getWorker = (db: Database, id: string): Worker | undefined => db.workers[id];
export const allWorkers = (db: Database): Worker[] => Object.values(db.workers);
export const currentWorker = (db: Database): Worker => db.workers[CURRENT_WORKER_ID];
export const currentWorkerId = (): string => CURRENT_WORKER_ID;

// ---- jobs ----
export const allJobs = (db: Database): Job[] => Object.values(db.jobs);
export const getJob = (db: Database, id: string): Job | undefined => db.jobs[id];
export const activeJobs = (db: Database): Job[] => allJobs(db).filter((j) => db.deletedJobIds.indexOf(j.id) < 0);
export const isMine = (job: Job): boolean => job.companyId === CURRENT_COMPANY_ID;

export function successfulJobsForCompany(db: Database, companyId: string): number {
  return allJobs(db).filter((j) => j.companyId === companyId && j.closed && !j.semContratacao).length;
}

// ---- applications ----
export const applicationsForJob = (db: Database, jobId: string): Application[] =>
  db.applications.filter((a) => a.jobId === jobId);
export const applicationsForWorker = (db: Database, workerId: string): Application[] =>
  db.applications.filter((a) => a.workerId === workerId);
export const applicationFor = (db: Database, jobId: string, workerId: string): Application | null =>
  db.applications.find((a) => a.jobId === jobId && a.workerId === workerId) || null;

export function approvedCount(db: Database, jobId: string): number {
  return db.applications.filter(
    (a) => a.jobId === jobId && (a.status === 'pre_selecionado' || a.status === 'contratado')
  ).length;
}
export function pendingCount(db: Database, jobId: string): number {
  return db.applications.filter((a) => a.jobId === jobId && (a.status === 'enviada' || a.status === 'em_analise'))
    .length;
}
export const isJobFull = (db: Database, job: Job): boolean => approvedCount(db, job.id) >= (job.slots || 1);
export const isJobClosed = (db: Database, job: Job): boolean => Boolean(job.closed) || isJobFull(db, job);

// ---- saved jobs ----
export const isJobSaved = (db: Database, jobId: string): boolean => db.savedJobIds.indexOf(jobId) >= 0;
export const savedJobs = (db: Database): Job[] =>
  db.savedJobIds.map((id) => getJob(db, id)).filter((j): j is Job => Boolean(j));

// ---- worker portfolio posts (photo/video, Instagram-style, no likes/comments) ----
export function postsForWorker(db: Database, workerId: string): WorkerPost[] {
  return db.workerPosts.filter((p) => p.workerId === workerId).sort((a, b) => (a.date < b.date ? 1 : -1));
}
