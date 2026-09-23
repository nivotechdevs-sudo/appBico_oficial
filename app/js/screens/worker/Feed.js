import { h, cx } from '../../dom.js';
import { NotificationBell } from '../../components/TopBar.js';
import { Tag } from '../../components/Tag.js';
import { Switch } from '../../components/Radio.js';
import { Button } from '../../components/Button.js';
import { Card } from '../../components/Card.js';
import { Rating } from '../../components/Rating.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Sheet } from '../../components/Modal.js';
import { JobTile } from '../../components/JobTile.js';
import { Icon } from '../../utils/icons.js';
import * as store from '../../store.js';
import { LOCAIS_BAIRRO, TIPOS_SERVICO } from '../../data/seed.js';

const KEY = 'feed';

function openJob(navigate, role, job) {
  return () => navigate(role === 'recrutador' && store.isMine(job) ? '/vaga-gerenciar/' + job.id : '/vaga/' + job.id);
}

function km(distance) { return parseFloat(String(distance || '0').replace(',', '.')) || 0; }
function payNum(job) { return job.pay == null ? -1 : job.pay; }
// Earliest first: today, tomorrow, any other date, then jobs whose date is still open.
function soon(job) { return job.date === 'Hoje' ? 0 : job.date === 'Amanhã' ? 1 : job.date ? 2 : 3; }

// The "Quando" filter: a specific day matches the date; a part of the week matches the
// days the job can happen on.
function matchesQuando(job, quando) {
  if (!quando) return true;
  if (quando === 'Durante a semana') return job.dias === 'semana' || job.dias === 'qualquer';
  if (quando === 'Fim de semana') return job.dias === 'fimdesemana' || job.dias === 'qualquer';
  return job.date === quando;
}

// Recruiters see their own jobs first, then boosted jobs, then the rest in the chosen order.
function orderJobs(jobs, role, sort = 'perto') {
  const rank = (j) => (role === 'recrutador' && store.isMine(j) ? 0 : j.urgent ? 1 : 2);
  const by = sort === 'valor' ? (a, b) => payNum(b) - payNum(a)
    : sort === 'cedo' ? (a, b) => soon(a) - soon(b) || km(a.distance) - km(b.distance)
    : (a, b) => km(a.distance) - km(b.distance);
  return jobs.slice().sort((a, b) => rank(a) - rank(b) || by(a, b));
}

function tileFor(navigate, role, job) {
  return JobTile({
    job, company: store.getCompany(job.companyId), onClick: openJob(navigate, role, job),
    mine: role === 'recrutador' && store.isMine(job),
    saved: store.isJobSaved(job.id),
    onToggleSave: role === 'trabalhador' ? () => store.toggleSavedJob(job.id) : null
  });
}

// The mural's one grid of job tiles, 2 columns on a phone up to 7 on a wide monitor.
function tileGrid(navigate, role, jobs) {
  return h('div', { class: 'card-grid' }, ...jobs.map((j) => tileFor(navigate, role, j)));
}

export default function renderFeed(navigate) {
  const role = store.getRole();
  const ui = store.getUI(KEY, { search: '', location: 'Tatuapé, SP', locationOpen: false, filtersOpen: false, tipo: null, dist: 'Toda a cidade', quando: null, sort: 'perto', notifyUrgent: true });
  return h('div', {}, mobileFeed(navigate, role, ui), desktopFeed(navigate, role, ui));
}

function mobileFeed(navigate, role, ui) {

  const q = ui.search.trim().toLowerCase();
  const searching = q.length > 0;

  const openJobs = store.activeJobs().filter((j) => !store.isJobClosed(j));
  const matches = (j) => !q || (j.role + ' ' + store.getCompany(j.companyId).name + ' ' + j.location).toLowerCase().includes(q);
  const passesFilters = (j) => (!ui.tipo || j.role === ui.tipo) && (ui.dist === 'Toda a cidade' || km(j.distance) <= parseInt(ui.dist)) && matchesQuando(j, ui.quando);

  const filtered = openJobs.filter(matches).filter(passesFilters);
  const ordered = orderJobs(filtered, role, ui.sort);

  const jobResults = searching ? openJobs.filter(matches) : [];
  const companyResults = searching ? store.allCompanies().filter((c) => (c.name + ' ' + c.location).toLowerCase().includes(q)) : [];
  const workerResults = searching ? store.allWorkers().filter((w) => (w.name + ' ' + w.role + ' ' + w.region).toLowerCase().includes(q)) : [];
  const noResults = searching && jobResults.length === 0 && companyResults.length === 0 && workerResults.length === 0;

  const activeChips = [
    ui.tipo ? { label: ui.tipo, icon: 'hard-hat', remove: () => store.setUI(KEY, { tipo: null }) } : null,
    ui.dist !== 'Toda a cidade' ? { label: ui.dist, icon: 'map-pin', remove: () => store.setUI(KEY, { dist: 'Toda a cidade' }) } : null,
    ui.quando ? { label: ui.quando, icon: 'calendar', remove: () => store.setUI(KEY, { quando: null }) } : null
  ].filter(Boolean);
  const activeCount = activeChips.length;

  const header = h('div', { class: 'sticky top-0 z-20 flex flex-col gap-2 px-4 pt-2 pb-3.5 bg-white border-b border-concrete-200' },
    h('div', { class: 'flex items-center justify-between gap-2' },
      h('button', {
        type: 'button', class: 'flex items-center gap-2 min-h-12 -ml-1.5 px-1.5 rounded-control',
        onClick: () => store.setUI(KEY, { locationOpen: true })
      },
        Icon('map-pin', { size: 20, color: 'var(--brand)' }),
        h('span', { class: 'flex flex-col items-start' },
          h('span', { class: 'text-xs text-concrete-500' }, 'Bicos perto de'),
          h('span', { class: 'font-semibold text-concrete-900 max-w-[9.5rem] truncate' }, ui.location)
        ),
        Icon('chevron-down', { size: 16, color: 'var(--text-muted)' })
      ),
      NotificationBell({ count: role === 'recrutador' ? 3 : 2, onClick: () => navigate('/notificacoes') })
    ),
    SearchPill({ id: 'feed-search', role, ui, compact: true })
  );

  const searchResults = h('div', { class: 'flex flex-col gap-5' },
    jobResults.length ? h('div', { class: 'flex flex-col gap-3' },
      h('div', { class: 'text-xs font-bold tracking-[0.08em] uppercase text-concrete-500' }, 'Vagas'),
      tileGrid(navigate, role, orderJobs(jobResults, role))
    ) : null,
    companyResults.length ? h('div', { class: 'flex flex-col gap-2' },
      h('div', { class: 'text-xs font-bold tracking-[0.08em] uppercase text-concrete-500' }, 'Construtoras'),
      ...companyResults.map((c) => Card({ padding: 'md', onClick: () => navigate('/construtora/' + c.id) },
        h('div', { class: 'flex items-center gap-3' },
          h('span', { class: 'inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 shrink-0' }, Icon('building-2', { size: 20, color: 'var(--brand)' })),
          h('div', { class: 'flex-1 min-w-0 flex flex-col' },
            h('span', { class: 'font-semibold text-concrete-900 truncate' }, c.name),
            h('span', { class: 'text-sm text-concrete-500 truncate' }, c.location)
          ),
          Rating({ value: c.rating, count: c.reviewCount })
        )
      ))
    ) : null,
    workerResults.length ? h('div', { class: 'flex flex-col gap-2' },
      h('div', { class: 'text-xs font-bold tracking-[0.08em] uppercase text-concrete-500' }, 'Trabalhadores'),
      ...workerResults.map((w) => Card({ padding: 'md' },
        h('div', { class: 'flex items-center gap-3' },
          h('span', { class: 'inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-50 text-accent-600 font-bold text-sm shrink-0' }, w.initials),
          h('div', { class: 'flex-1 min-w-0 flex flex-col' },
            h('span', { class: 'font-semibold text-concrete-900 truncate' }, w.name),
            h('span', { class: 'text-sm text-concrete-500 truncate' }, `${w.role} · ${w.region}`)
          ),
          Rating({ value: w.rating, count: w.jobsDone })
        )
      ))
    ) : null,
    noResults ? EmptyState({ icon: 'search-x', title: 'Nenhum resultado para essa busca', description: 'Confira a grafia ou tente um termo mais curto.', actionLabel: 'Limpar busca', onAction: () => store.setUI(KEY, { search: '' }) }) : null
  );

  const browseResults = h('div', { class: 'flex flex-col gap-4' },
    h('div', { class: 'flex flex-wrap items-center gap-2' },
      Tag({ label: activeCount ? `Filtros · ${activeCount}` : 'Filtros', icon: 'sliders-horizontal', onClick: () => store.setUI(KEY, { filtersOpen: true }) }),
      ...activeChips.map((c) => Tag({ label: c.label, icon: c.icon, selected: true, onRemove: c.remove }))
    ),
    h('div', { class: 'flex bg-concrete-100 rounded-full p-1 gap-1' }, ...[
      { id: 'perto', label: 'Mais perto' }, { id: 'valor', label: 'Maior valor' }, { id: 'cedo', label: 'Mais cedo' }
    ].map((o) => h('button', {
      type: 'button',
      class: `flex-1 h-10 rounded-full text-sm font-bold transition-colors ${ui.sort === o.id ? 'bg-white text-brand-600 shadow-card' : 'text-concrete-500'}`,
      onClick: () => store.setUI(KEY, { sort: o.id })
    }, o.label))),
    ordered.length
      ? tileGrid(navigate, role, ordered)
      : EmptyState({ icon: 'search-x', title: 'Nenhuma vaga com esse filtro', description: 'Tire um filtro ou aumente a distância para ver mais bicos.', actionLabel: 'Limpar filtros', onAction: () => store.setUI(KEY, { tipo: null, dist: 'Toda a cidade', quando: null }) })
  );

  return h('div', { class: 'flex flex-col lg:hidden' },
    header,
    h('div', { class: 'px-4 pt-4 pb-6 flex flex-col gap-5' }, searching ? searchResults : browseResults),

    Sheet({ open: ui.locationOpen, title: 'Onde você quer trabalhar', onClose: () => store.setUI(KEY, { locationOpen: false }) },
      Button({ label: 'Usar minha localização agora', variant: 'secondary', fullWidth: true, iconLeft: 'locate-fixed', onClick: () => store.setUI(KEY, { location: 'Tatuapé, SP', locationOpen: false }) }),
      h('div', { class: 'flex flex-col' }, ...LOCAIS_BAIRRO.concat(['Toda São Paulo']).map((l) => {
        const active = ui.location === l;
        const bairro = l.split(',')[0];
        const count = l === 'Toda São Paulo' ? openJobs.length : openJobs.filter((j) => j.location.indexOf(bairro) === 0).length;
        return h('button', {
          type: 'button', class: 'flex items-center gap-3 min-h-12 py-1 border-b border-concrete-200 last:border-0 text-left',
          onClick: () => store.setUI(KEY, { location: l, locationOpen: false })
        },
          Icon('map-pin', { size: 20, color: active ? 'var(--brand)' : 'var(--text-subtle)' }),
          h('span', { class: `flex-1 ${active ? 'font-bold text-brand-600' : 'text-concrete-900'}` }, l),
          h('span', { class: 'text-sm text-concrete-500' }, count === 1 ? '1 bico' : `${count} bicos`)
        );
      })),
      h('span', { class: 'text-xs text-concrete-500' }, 'A distância de cada bico é contada a partir daqui.')
    ),

    Sheet({ open: ui.filtersOpen, title: 'Filtros', onClose: () => store.setUI(KEY, { filtersOpen: false }) },
      filterGroup('Tipo de serviço', TIPOS_SERVICO, ui.tipo, (v) => store.setUI(KEY, { tipo: ui.tipo === v ? null : v })),
      filterGroup('Distância de casa', ['5', '10', '20', 'Toda a cidade'].map((d) => d === 'Toda a cidade' ? d : `Até ${d} km`), ui.dist, (v) => store.setUI(KEY, { dist: v })),
      filterGroup('Quando', ['Hoje', 'Amanhã', 'Durante a semana', 'Fim de semana'], ui.quando, (v) => store.setUI(KEY, { quando: ui.quando === v ? null : v })),
      h('div', { class: 'flex flex-col gap-1 pt-1 border-t border-concrete-200' },
        Switch({ label: 'Avisar quando aparecer bico urgente', description: 'Chega uma notificação quando surgir vaga com esses filtros perto de você.', checked: ui.notifyUrgent, onChange: (v) => store.setUI(KEY, { notifyUrgent: v }) })
      ),
      h('div', { class: 'flex gap-3 pt-1' },
        Button({ label: 'Limpar', variant: 'secondary', className: 'flex-1', onClick: () => store.setUI(KEY, { tipo: null, dist: 'Toda a cidade', quando: null }) }),
        Button({ label: `Ver ${filtered.length === 1 ? '1 vaga' : filtered.length + ' vagas'}`, className: 'flex-[1.4]', onClick: () => store.setUI(KEY, { filtersOpen: false }) })
      )
    )
  );
}

// ---------- Desktop / tablet (>= 770px) ----------

function desktopFeed(navigate, role, ui) {
  const open = store.activeJobs().filter((j) => !store.isJobClosed(j));
  const q = ui.search.trim().toLowerCase();
  const body = q ? desktopSearchResults(navigate, role, ui, open) : tileGrid(navigate, role, orderJobs(open, role));

  return h('div', { class: 'hidden lg:block min-h-[calc(100vh-5rem)] bg-white' },
    h('div', { class: 'page-x pt-1 pb-8 border-b border-concrete-200' },
      h('div', { class: 'max-w-[52rem] mx-auto' }, SearchPill({ id: 'feed-search-desktop', role, ui }))
    ),
    h('div', { class: 'page-x pt-8 pb-20' }, body)
  );
}

// Search field shared by the phone and desktop murals: a pill with the blue search button
// on the left and no visible label (the placeholder says what can be searched).
function SearchPill({ id, role, ui, compact = false }) {
  const input = h('input', {
    id, 'data-focus-id': id, type: 'search', autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'search',
    'aria-label': 'Buscar bicos',
    placeholder: role === 'recrutador' ? 'Buscar vaga, construtora ou trabalhador' : 'Buscar por serviço, bairro ou construtora',
    value: ui.search,
    class: cx('w-full min-w-0 bg-transparent outline-none text-concrete-900 placeholder:text-concrete-500 [&::-webkit-search-cancel-button]:hidden', compact ? 'text-[0.9375rem]' : 'text-base'),
    oninput: (e) => store.setUI(KEY, { search: e.target.value }),
    onkeydown: (e) => { if (e.key === 'Escape') store.setUI(KEY, { search: '' }); if (e.key === 'Enter') e.target.blur(); }
  });
  return h('div', {
    role: 'search',
    class: cx('flex items-center rounded-full bg-white border border-concrete-200 shadow-float transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100',
      compact ? 'gap-3 h-14 pl-1.5 pr-2' : 'gap-4 h-[4.25rem] pl-2 pr-3')
  },
    h('button', {
      type: 'button', 'aria-label': 'Buscar', title: 'Buscar',
      class: cx('shrink-0 inline-flex items-center justify-center rounded-full bg-brand-500 shadow-raised transition hover:bg-brand-600 active:scale-95', compact ? 'w-11 h-11' : 'w-[3.25rem] h-[3.25rem]'),
      onClick: () => { const el = document.getElementById(id); if (el) el.focus(); }
    }, Icon('search', { size: compact ? 20 : 22, color: '#fff' })),
    h('div', { class: 'flex-1 min-w-0 flex items-center' }, input),
    ui.search ? h('button', {
      type: 'button', 'aria-label': 'Limpar busca', title: 'Limpar busca',
      class: 'shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-concrete-500 transition-colors hover:bg-concrete-100 hover:text-concrete-900',
      onClick: () => store.setUI(KEY, { search: '' })
    }, Icon('x', { size: 18 })) : null
  );
}

function desktopSearchResults(navigate, role, ui, open) {
  const q = ui.search.trim().toLowerCase();
  const jobs = open.filter((j) => (j.role + ' ' + store.getCompany(j.companyId).name + ' ' + j.location).toLowerCase().includes(q));
  const companies = store.allCompanies().filter((c) => (c.name + ' ' + c.location).toLowerCase().includes(q));
  const workers = store.allWorkers().filter((w) => (w.name + ' ' + w.role + ' ' + w.region).toLowerCase().includes(q));
  const parts = [
    jobs.length ? (jobs.length === 1 ? '1 vaga' : `${jobs.length} vagas`) : null,
    companies.length ? (companies.length === 1 ? '1 construtora' : `${companies.length} construtoras`) : null,
    workers.length ? (workers.length === 1 ? '1 trabalhador' : `${workers.length} trabalhadores`) : null
  ].filter(Boolean);

  const heading = h('div', { class: 'flex items-baseline gap-3 flex-wrap' },
    h('h1', { class: 'text-[1.75rem] font-semibold leading-tight text-concrete-900' }, `Resultados para “${ui.search.trim()}”`),
    parts.length ? h('span', { class: 'text-concrete-500' }, parts.join(' · ')) : null
  );

  if (!parts.length) {
    return h('div', { class: 'flex flex-col gap-4' }, heading,
      EmptyState({ icon: 'search-x', title: 'Nenhum resultado para essa busca', description: 'Confira a grafia ou tente um termo mais curto, como o nome do serviço ou do bairro.', actionLabel: 'Limpar busca', onAction: () => store.setUI(KEY, { search: '' }) })
    );
  }

  const group = (title, content) => h('section', { class: 'flex flex-col gap-4' }, h('h2', { class: 'text-[1.375rem] font-semibold text-concrete-900' }, title), content);
  const personGrid = (children) => h('div', { class: 'grid gap-4 grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]' }, ...children);
  const personCard = ({ avatar, name, meta, rating, onClick }) => h(onClick ? 'button' : 'div', {
    type: onClick ? 'button' : null, onClick,
    class: cx('flex items-center gap-4 p-4 rounded-2xl border border-concrete-200 bg-white text-left', onClick ? 'transition hover:shadow-raised hover:border-concrete-300' : '')
  },
    avatar,
    h('div', { class: 'flex-1 min-w-0 flex flex-col gap-0.5' },
      h('span', { class: 'font-semibold text-concrete-900 truncate' }, name),
      h('span', { class: 'text-sm text-concrete-500 truncate' }, meta),
      rating
    )
  );

  return h('div', { class: 'flex flex-col gap-12' },
    heading,
    jobs.length ? group('Vagas', tileGrid(navigate, role, orderJobs(jobs, role))) : null,
    companies.length ? group('Construtoras', personGrid(companies.map((c) => personCard({
      avatar: h('span', { class: 'inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 shrink-0' }, Icon('building-2', { size: 22, color: 'var(--brand)' })),
      name: c.name, meta: c.location, rating: Rating({ value: c.rating, count: c.reviewCount }),
      onClick: () => navigate('/construtora/' + c.id)
    })))) : null,
    workers.length ? group('Trabalhadores', personGrid(workers.map((w) => personCard({
      avatar: h('span', { class: 'inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-50 text-accent-600 font-bold shrink-0' }, w.initials),
      name: w.name, meta: `${w.role} · ${w.region}`, rating: Rating({ value: w.rating, count: w.jobsDone }),
      onClick: role === 'recrutador' ? () => navigate('/trabalhador/' + w.id) : null
    })))) : null
  );
}

function filterGroup(title, options, active, onSelect) {
  return h('div', { class: 'flex flex-col gap-2.5' },
    h('div', { class: 'text-xs font-bold tracking-[0.08em] uppercase text-concrete-500' }, title),
    h('div', { class: 'flex flex-wrap gap-2' }, ...options.map((o) => Tag({ label: o, selected: active === o, onClick: () => onSelect(o) })))
  );
}
