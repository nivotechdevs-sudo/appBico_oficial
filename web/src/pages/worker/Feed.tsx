import { useRef, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Icon, type IconName } from '../../components/icons/Icon';
import { Input } from '../../components/Input';
import { JobTile } from '../../components/JobTile';
import { Logo } from '../../components/Logo';
import { Sheet } from '../../components/Modal';
import { Switch } from '../../components/Radio';
import { Rating } from '../../components/Rating';
import { Tag } from '../../components/Tag';
import { NotificationBell } from '../../components/TopBar';
import { TIPOS_SERVICO } from '../../data/seed';
import { useDb, useRole, useUI } from '../../hooks/useStore';
import { navigate } from '../../services/router';
import {
  activeJobs,
  allCompanies,
  allWorkers,
  companyOf,
  getCompany,
  isJobClosed,
  isJobSaved,
  isMine
} from '../../services/selectors';
import { setUI, toggleSavedJob } from '../../services/store';
import type { Database, Job, Role } from '../../types/models';
import { nearestCity, searchCities } from '../../utils/cidades';
import { cx } from '../../utils/cx';

const KEY = 'feed';

type Sort = 'perto' | 'valor' | 'cedo';
type Geo = null | 'loading' | 'denied' | 'error';

interface FeedUI {
  search: string;
  location: string;
  filtersOpen: boolean;
  pickerOpen: boolean;
  cityQuery: string;
  geo: Geo;
  tipo: string | null;
  dist: string;
  quando: string | null;
  sort: Sort;
  notifyUrgent: boolean;
}

// Every seed job is in the city of São Paulo; a job may name another city in `city`.
const DEFAULT_CITY = 'São Paulo, SP';
const jobCity = (job: Job) => job.city || DEFAULT_CITY;
const NO_FILTERS: Partial<FeedUI> = { tipo: null, dist: 'Toda a cidade', quando: null, location: DEFAULT_CITY };
const SORTS: { id: Sort; label: string }[] = [
  { id: 'perto', label: 'Mais perto' },
  { id: 'valor', label: 'Maior valor' },
  { id: 'cedo', label: 'Mais cedo' }
];
const FEED_DEFAULTS: FeedUI = {
  search: '',
  location: DEFAULT_CITY,
  filtersOpen: false,
  pickerOpen: false,
  cityQuery: '',
  geo: null,
  tipo: null,
  dist: 'Toda a cidade',
  quando: null,
  sort: 'perto',
  notifyUrgent: true
};

const set = (patch: Partial<FeedUI>) => setUI<FeedUI>(KEY, patch);

function km(distance: string | undefined) {
  return parseFloat(String(distance || '0').replace(',', '.')) || 0;
}
function payNum(job: Job) {
  return job.pay == null ? -1 : job.pay;
}
// Earliest first: today, tomorrow, any other date, then jobs whose date is still open.
function soon(job: Job) {
  return job.date === 'Hoje' ? 0 : job.date === 'Amanhã' ? 1 : job.date ? 2 : 3;
}

// The "Quando" filter: a specific day matches the date; a part of the week matches the days the job
// can happen on.
function matchesQuando(job: Job, quando: string | null) {
  if (!quando) return true;
  if (quando === 'Durante a semana') return job.dias === 'semana' || job.dias === 'qualquer';
  if (quando === 'Fim de semana') return job.dias === 'fimdesemana' || job.dias === 'qualquer';
  return job.date === quando;
}

// Recruiters see their own jobs first, then boosted jobs, then the rest in the chosen order.
function orderJobs(jobs: Job[], role: Role, sort: Sort = 'perto') {
  const rank = (j: Job) => (role === 'recrutador' && isMine(j) ? 0 : j.urgent ? 1 : 2);
  const by =
    sort === 'valor'
      ? (a: Job, b: Job) => payNum(b) - payNum(a)
      : sort === 'cedo'
        ? (a: Job, b: Job) => soon(a) - soon(b) || km(a.distance) - km(b.distance)
        : (a: Job, b: Job) => km(a.distance) - km(b.distance);
  return jobs.slice().sort((a, b) => rank(a) - rank(b) || by(a, b));
}

function passesFilters(j: Job, ui: FeedUI) {
  return (
    jobCity(j) === ui.location &&
    (!ui.tipo || j.role === ui.tipo) &&
    (ui.dist === 'Toda a cidade' || km(j.distance) <= parseInt(ui.dist.replace(/\D/g, ''), 10)) &&
    matchesQuando(j, ui.quando)
  );
}

interface ActiveFilter {
  label: string;
  icon: IconName;
  remove: () => void;
}

function activeFilters(ui: FeedUI): ActiveFilter[] {
  return [
    ui.location !== DEFAULT_CITY
      ? { label: ui.location, icon: 'map-pin', remove: () => set({ location: DEFAULT_CITY }) }
      : null,
    ui.tipo ? { label: ui.tipo, icon: 'hard-hat', remove: () => set({ tipo: null }) } : null,
    ui.dist !== 'Toda a cidade'
      ? { label: ui.dist, icon: 'map-pin', remove: () => set({ dist: 'Toda a cidade' }) }
      : null,
    ui.quando ? { label: ui.quando, icon: 'calendar', remove: () => set({ quando: null }) } : null
  ].filter((f): f is ActiveFilter => Boolean(f));
}

function searchMatches(db: Database, open: Job[], q: string) {
  return {
    jobs: open.filter((j) => (j.role + ' ' + companyOf(db, j).name + ' ' + j.location).toLowerCase().includes(q)),
    companies: allCompanies(db).filter((c) => (c.name + ' ' + c.location).toLowerCase().includes(q)),
    workers: allWorkers(db).filter((w) => (w.name + ' ' + w.role + ' ' + w.region).toLowerCase().includes(q))
  };
}

export default function Feed() {
  const db = useDb();
  const role = useRole();
  const [ui] = useUI<FeedUI>(KEY, FEED_DEFAULTS);
  const open = activeJobs(db).filter((j) => !isJobClosed(db, j));
  const filtered = open.filter((j) => passesFilters(j, ui));
  return (
    <div>
      <MobileFeed db={db} role={role} ui={ui} open={open} filtered={filtered} />
      <DesktopFeed db={db} role={role} ui={ui} open={open} filtered={filtered} />
      {/* One filter panel for both layouts: a bottom sheet on phones, a dialog on desktop. */}
      <FiltersSheet ui={ui} count={filtered.length} />
      <CityPicker ui={ui} />
    </div>
  );
}

interface FeedPartProps {
  db: Database;
  role: Role;
  ui: FeedUI;
  open: Job[];
  filtered: Job[];
}

// The mural's one grid of job tiles.
function TileGridOf({ db, role, jobs }: { db: Database; role: Role; jobs: Job[] }) {
  return (
    <div className="tile-grid">
      {jobs.map((job) => (
        <JobTile
          key={job.id}
          job={job}
          company={getCompany(db, job.companyId)}
          onClick={() =>
            navigate(role === 'recrutador' && isMine(job) ? '/vaga-gerenciar/' + job.id : '/vaga/' + job.id)
          }
          mine={role === 'recrutador' && isMine(job)}
          saved={isJobSaved(db, job.id)}
          onToggleSave={role === 'trabalhador' ? () => toggleSavedJob(job.id) : null}
        />
      ))}
    </div>
  );
}

function FilterGroup({
  title,
  options,
  active,
  onSelect
}: {
  title: string;
  options: string[];
  active: string | null;
  onSelect: (o: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Tag key={o} label={o} selected={active === o} onClick={() => onSelect(o)} />
        ))}
      </div>
    </div>
  );
}

function FiltersSheet({ ui, count }: { ui: FeedUI; count: number }) {
  return (
    <Sheet open={ui.filtersOpen} title="Filtros" onClose={() => set({ filtersOpen: false })}>
      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Onde você quer trabalhar</div>
        <button
          type="button"
          aria-haspopup="dialog"
          className="flex items-center gap-3 w-full p-3 rounded-card border border-concrete-300 bg-white text-left transition-colors hover:bg-concrete-50 hover:border-concrete-400"
          onClick={() => set({ pickerOpen: true, cityQuery: '', geo: null })}
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 shrink-0">
            <Icon name="map-pin" size={20} color="var(--brand)" />
          </span>
          <span className="flex-1 min-w-0 flex flex-col">
            <span className="text-xs text-concrete-500">Cidade</span>
            <span className="font-semibold text-concrete-900 truncate">{ui.location}</span>
          </span>
          <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 shrink-0">
            Escolher
            <Icon name="chevron-right" size={16} color="var(--text-brand)" />
          </span>
        </button>
      </div>
      {/* The phone has these as a segmented control on the mural itself. */}
      <div className="hidden lg:flex flex-col gap-2.5">
        <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Ordenar por</div>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((o) => (
            <Tag key={o.id} label={o.label} selected={ui.sort === o.id} onClick={() => set({ sort: o.id })} />
          ))}
        </div>
      </div>
      <FilterGroup
        title="Tipo de serviço"
        options={TIPOS_SERVICO}
        active={ui.tipo}
        onSelect={(v) => set({ tipo: ui.tipo === v ? null : v })}
      />
      <FilterGroup
        title={'Distância do centro de ' + ui.location.split(',')[0]}
        options={['5', '10', '20', 'Toda a cidade'].map((d) => (d === 'Toda a cidade' ? d : `Até ${d} km`))}
        active={ui.dist}
        onSelect={(v) => set({ dist: v })}
      />
      <FilterGroup
        title="Quando"
        options={['Hoje', 'Amanhã', 'Durante a semana', 'Fim de semana']}
        active={ui.quando}
        onSelect={(v) => set({ quando: ui.quando === v ? null : v })}
      />
      <div className="flex flex-col gap-1 pt-1 border-t border-concrete-200">
        <Switch
          label="Avisar quando aparecer bico novo"
          description="Chega uma notificação quando surgir vaga com esses filtros perto de você."
          checked={ui.notifyUrgent}
          onChange={(v) => set({ notifyUrgent: v })}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <Button label="Limpar" variant="secondary" className="flex-1" onClick={() => set(NO_FILTERS)} />
        <Button
          label={`Ver ${count === 1 ? '1 vaga' : count + ' vagas'}`}
          className="flex-[1.4]"
          onClick={() => set({ filtersOpen: false })}
        />
      </div>
    </Sheet>
  );
}

// "Onde você quer trabalhar": GPS or typing any Brazilian city. Opens over the filters.
function CityPicker({ ui }: { ui: FeedUI }) {
  const choose = (label: string) => set({ location: label, pickerOpen: false, cityQuery: '', geo: null });
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      set({ geo: 'error' });
      return;
    }
    set({ geo: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (c) choose(c.label);
        else set({ geo: 'error' });
      },
      (err) => set({ geo: err && err.code === 1 ? 'denied' : 'error' }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };
  const q = ui.cityQuery.trim();
  const results = ui.pickerOpen ? searchCities(q, 8) : [];
  const geoMsg =
    ui.geo === 'denied'
      ? 'Seu navegador não liberou a localização. Digite a cidade abaixo.'
      : ui.geo === 'error'
        ? 'Não conseguimos achar sua localização agora. Digite a cidade abaixo.'
        : null;

  return (
    <Sheet open={ui.pickerOpen} title="Onde você quer trabalhar" onClose={() => set({ pickerOpen: false, geo: null })}>
      <Button
        label={ui.geo === 'loading' ? 'Buscando sua localização…' : 'Usar minha localização'}
        variant="secondary"
        fullWidth
        iconLeft="locate-fixed"
        loading={ui.geo === 'loading'}
        onClick={useMyLocation}
      />
      {geoMsg ? (
        <span className="flex items-start gap-2 text-sm text-concrete-700 -mt-1">
          <Icon name="circle-alert" size={16} color="var(--amber-500)" />
          {geoMsg}
        </span>
      ) : null}
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-concrete-400">
        <span className="flex-1 h-px bg-concrete-200" />
        ou
        <span className="flex-1 h-px bg-concrete-200" />
      </div>
      <Input
        id="city-search"
        placeholder="Digite o nome da cidade"
        icon="search"
        value={ui.cityQuery}
        autoFocus
        onInput={(v) => set({ cityQuery: v })}
      />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500 pb-1">
          {q ? 'Cidades encontradas' : 'Cidades mais procuradas'}
        </span>
        {results.length ? (
          <div className="flex flex-col" role="listbox" aria-label="Cidades">
            {results.map((c) => {
              const active = c.label === ui.location;
              return (
                <button
                  key={c.label}
                  type="button"
                  role="option"
                  aria-selected={active ? 'true' : 'false'}
                  className={cx(
                    'flex items-center gap-3 min-h-12 px-2 -mx-2 rounded-control text-left transition-colors hover:bg-concrete-50',
                    active ? 'text-brand-600' : 'text-concrete-900'
                  )}
                  onClick={() => choose(c.label)}
                >
                  <Icon name="map-pin" size={18} color={active ? 'var(--brand)' : 'var(--text-subtle)'} />
                  <span className="flex-1 min-w-0 truncate">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-concrete-500">{' · ' + c.uf}</span>
                  </span>
                  {active ? <Icon name="check" size={18} color="var(--brand)" /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="py-3 text-sm text-concrete-500">{`Nenhuma cidade com “${q}”. Confira a grafia.`}</span>
        )}
      </div>
    </Sheet>
  );
}

function MobileFeed({ db, role, ui, open, filtered }: FeedPartProps) {
  const q = ui.search.trim().toLowerCase();
  const searching = q.length > 0;
  const ordered = orderJobs(filtered, role, ui.sort);
  const found = searching ? searchMatches(db, open, q) : { jobs: [], companies: [], workers: [] };
  const noResults = searching && found.jobs.length === 0 && found.companies.length === 0 && found.workers.length === 0;
  const activeChips = activeFilters(ui);
  const activeCount = activeChips.length;

  const searchResults = (
    <div className="flex flex-col gap-5">
      {found.jobs.length ? (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Vagas</div>
          <TileGridOf db={db} role={role} jobs={orderJobs(found.jobs, role)} />
        </div>
      ) : null}
      {found.companies.length ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Construtoras</div>
          {found.companies.map((c) => (
            <Card key={c.id} padding="md" onClick={() => navigate('/construtora/' + c.id)}>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 shrink-0">
                  <Icon name="building-2" size={20} color="var(--brand)" />
                </span>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="font-semibold text-concrete-900 truncate">{c.name}</span>
                  <span className="text-sm text-concrete-500 truncate">{c.location}</span>
                </div>
                <Rating value={c.rating} count={c.reviewCount} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {found.workers.length ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold tracking-[0.08em] uppercase text-concrete-500">Trabalhadores</div>
          {found.workers.map((w) => (
            <Card key={w.id} padding="md">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-50 text-accent-600 font-bold text-sm shrink-0">
                  {w.initials}
                </span>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="font-semibold text-concrete-900 truncate">{w.name}</span>
                  <span className="text-sm text-concrete-500 truncate">{`${w.role} · ${w.region}`}</span>
                </div>
                <Rating value={w.rating} count={w.jobsDone} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {noResults ? (
        <EmptyState
          icon="search-x"
          title="Nenhum resultado para essa busca"
          description="Confira a grafia ou tente um termo mais curto."
          actionLabel="Limpar busca"
          onAction={() => set({ search: '' })}
        />
      ) : null}
    </div>
  );

  const browseResults = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tag
          label={activeCount ? `Filtros · ${activeCount}` : 'Filtros'}
          icon="sliders-horizontal"
          onClick={() => set({ filtersOpen: true })}
        />
        {activeChips.map((c) => (
          <Tag key={c.label + c.icon} label={c.label} icon={c.icon} selected onRemove={c.remove} />
        ))}
      </div>
      <div className="flex bg-concrete-100 rounded-full p-1 gap-1">
        {SORTS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`flex-1 h-10 rounded-full text-sm font-bold transition-colors ${ui.sort === o.id ? 'bg-white text-brand-600 shadow-card' : 'text-concrete-500'}`}
            onClick={() => set({ sort: o.id })}
          >
            {o.label}
          </button>
        ))}
      </div>
      {ordered.length ? <TileGridOf db={db} role={role} jobs={ordered} /> : <NoJobsState ui={ui} />}
    </div>
  );

  return (
    <div className="flex flex-col lg:hidden">
      <div className="sticky top-0 z-20 flex flex-col gap-2 px-4 pt-2 pb-3.5 bg-white border-b border-concrete-200">
        <div className="flex items-center justify-between gap-2 min-h-12">
          <h1 className="inline-flex" aria-label="Bicos">
            <Logo compact />
          </h1>
          <NotificationBell count={role === 'recrutador' ? 3 : 2} onClick={() => navigate('/notificacoes')} />
        </div>
        <SearchPill id="feed-search" role={role} ui={ui} compact />
      </div>
      <div className="px-4 pt-4 pb-6">
        <div className="mural-frame flex flex-col gap-5">{searching ? searchResults : browseResults}</div>
      </div>
    </div>
  );
}

// ---------- Desktop / tablet (>= 770px) ----------

function DesktopFeed({ db, role, ui, open, filtered }: FeedPartProps) {
  const q = ui.search.trim().toLowerCase();
  const chips = activeFilters(ui);
  const count = chips.length;
  const browse = (
    <div className="flex flex-col gap-6">
      {chips.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-concrete-500">
            {filtered.length === 1 ? '1 vaga com' : `${filtered.length} vagas com`}
          </span>
          {chips.map((c) => (
            <Tag key={c.label + c.icon} label={c.label} icon={c.icon} selected onRemove={c.remove} />
          ))}
          <Button label="Limpar filtros" variant="ghost" size="sm" onClick={() => set(NO_FILTERS)} />
        </div>
      ) : null}
      {filtered.length ? (
        <TileGridOf db={db} role={role} jobs={orderJobs(filtered, role, ui.sort)} />
      ) : (
        <NoJobsState ui={ui} />
      )}
    </div>
  );

  return (
    <div className="hidden lg:block min-h-[calc(100vh-5rem)] bg-white">
      <div className="page-x pt-1 pb-8 border-b border-concrete-200">
        <div className="max-w-[60rem] mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <SearchPill id="feed-search-desktop" role={role} ui={ui} />
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            className={cx(
              'relative shrink-0 inline-flex items-center gap-2.5 h-[4.25rem] px-6 rounded-full bg-white border shadow-float font-semibold text-concrete-900 transition hover:border-concrete-300 hover:shadow-raised',
              count ? 'border-brand-500' : 'border-concrete-200'
            )}
            onClick={() => set({ filtersOpen: true })}
          >
            <Icon name="sliders-horizontal" size={20} />
            Filtros
            {count ? (
              <span className="inline-flex items-center justify-center min-w-[1.375rem] h-[1.375rem] px-1.5 rounded-full bg-brand-500 text-white text-xs font-bold">
                {String(count)}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      <div className="page-x pt-8 pb-20">
        <div className="mural-frame">
          {q ? <DesktopSearchResults db={db} role={role} ui={ui} open={open} /> : browse}
        </div>
      </div>
    </div>
  );
}

// Search field shared by the phone and desktop murals: a pill with the blue search button on the left
// and no visible label (the placeholder says what can be searched).
function SearchPill({ id, role, ui, compact = false }: { id: string; role: Role; ui: FeedUI; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      role="search"
      className={cx(
        'flex items-center rounded-full bg-white border border-concrete-200 shadow-float transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100',
        compact ? 'gap-3 h-14 pl-1.5 pr-2' : 'gap-4 h-[4.25rem] pl-2 pr-3'
      )}
    >
      <button
        type="button"
        aria-label="Buscar"
        title="Buscar"
        className={cx(
          'shrink-0 inline-flex items-center justify-center rounded-full bg-brand-500 shadow-raised transition hover:bg-brand-600 active:scale-95',
          compact ? 'w-11 h-11' : 'w-[3.25rem] h-[3.25rem]'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Icon name="search" size={compact ? 20 : 22} color="#fff" />
      </button>
      <div className="flex-1 min-w-0 flex items-center">
        <input
          ref={inputRef}
          id={id}
          data-focus-id={id}
          type="search"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-label="Buscar bicos"
          placeholder={
            role === 'recrutador'
              ? 'Buscar vaga, construtora ou trabalhador'
              : 'Buscar por serviço, bairro ou construtora'
          }
          value={ui.search}
          className={cx(
            'w-full min-w-0 bg-transparent outline-none text-concrete-900 placeholder:text-concrete-500 [&::-webkit-search-cancel-button]:hidden',
            compact ? 'text-[0.9375rem]' : 'text-base'
          )}
          onChange={(e) => set({ search: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Escape') set({ search: '' });
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
      </div>
      {ui.search ? (
        <button
          type="button"
          aria-label="Limpar busca"
          title="Limpar busca"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-concrete-500 transition-colors hover:bg-concrete-100 hover:text-concrete-900"
          onClick={() => set({ search: '' })}
        >
          <Icon name="x" size={18} />
        </button>
      ) : null}
    </div>
  );
}

function DesktopSearchResults({ db, role, ui, open }: Omit<FeedPartProps, 'filtered'>) {
  const q = ui.search.trim().toLowerCase();
  const { jobs, companies, workers } = searchMatches(db, open, q);
  const parts = [
    jobs.length ? (jobs.length === 1 ? '1 vaga' : `${jobs.length} vagas`) : null,
    companies.length ? (companies.length === 1 ? '1 construtora' : `${companies.length} construtoras`) : null,
    workers.length ? (workers.length === 1 ? '1 trabalhador' : `${workers.length} trabalhadores`) : null
  ].filter(Boolean);

  const heading = (
    <div className="flex items-baseline gap-3 flex-wrap">
      <h1 className="text-[1.75rem] font-semibold leading-tight text-concrete-900">{`Resultados para “${ui.search.trim()}”`}</h1>
      {parts.length ? <span className="text-concrete-500">{parts.join(' · ')}</span> : null}
    </div>
  );

  if (!parts.length) {
    return (
      <div className="flex flex-col gap-4">
        {heading}
        <EmptyState
          icon="search-x"
          title="Nenhum resultado para essa busca"
          description="Confira a grafia ou tente um termo mais curto, como o nome do serviço ou do bairro."
          actionLabel="Limpar busca"
          onAction={() => set({ search: '' })}
        />
      </div>
    );
  }

  const group = (title: string, content: ReactNode) => (
    <section className="flex flex-col gap-4">
      <h2 className="text-[1.375rem] font-semibold text-concrete-900">{title}</h2>
      {content}
    </section>
  );

  return (
    <div className="flex flex-col gap-12">
      {heading}
      {jobs.length ? group('Vagas', <TileGridOf db={db} role={role} jobs={orderJobs(jobs, role)} />) : null}
      {companies.length
        ? group(
            'Construtoras',
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]">
              {companies.map((c) => (
                <PersonCard
                  key={c.id}
                  avatar={
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 shrink-0">
                      <Icon name="building-2" size={22} color="var(--brand)" />
                    </span>
                  }
                  name={c.name}
                  meta={c.location}
                  rating={<Rating value={c.rating} count={c.reviewCount} />}
                  onClick={() => navigate('/construtora/' + c.id)}
                />
              ))}
            </div>
          )
        : null}
      {workers.length
        ? group(
            'Trabalhadores',
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]">
              {workers.map((w) => (
                <PersonCard
                  key={w.id}
                  avatar={
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-50 text-accent-600 font-bold shrink-0">
                      {w.initials}
                    </span>
                  }
                  name={w.name}
                  meta={`${w.role} · ${w.region}`}
                  rating={<Rating value={w.rating} count={w.jobsDone} />}
                  onClick={role === 'recrutador' ? () => navigate('/trabalhador/' + w.id) : null}
                />
              ))}
            </div>
          )
        : null}
    </div>
  );
}

interface PersonCardProps {
  avatar: ReactNode;
  name: string;
  meta: string;
  rating: ReactNode;
  onClick: (() => void) | null;
}

function PersonCard({ avatar, name, meta, rating, onClick }: PersonCardProps) {
  const className = cx(
    'flex items-center gap-4 p-4 rounded-2xl border border-concrete-200 bg-white text-left',
    onClick ? 'transition hover:shadow-raised hover:border-concrete-300' : ''
  );
  const content = (
    <>
      {avatar}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="font-semibold text-concrete-900 truncate">{name}</span>
        <span className="text-sm text-concrete-500 truncate">{meta}</span>
        {rating}
      </div>
    </>
  );
  return onClick ? (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

function NoJobsState({ ui }: { ui: FeedUI }) {
  if (ui.location !== DEFAULT_CITY) {
    return (
      <EmptyState
        icon="map-pin"
        title={`Ainda não tem bico em ${ui.location.split(',')[0]}`}
        description="Assim que uma construtora publicar uma vaga nessa cidade, ela aparece aqui."
        actionLabel={`Ver bicos em ${DEFAULT_CITY.split(',')[0]}`}
        onAction={() => set({ location: DEFAULT_CITY })}
      />
    );
  }
  return (
    <EmptyState
      icon="search-x"
      title="Nenhuma vaga com esse filtro"
      description="Tire um filtro ou aumente a distância para ver mais bicos."
      actionLabel="Limpar filtros"
      onAction={() => set(NO_FILTERS)}
    />
  );
}
