import { h, cx } from '../dom.js';
import { Icon } from '../utils/icons.js';

// Illustrated cover for jobs whose recruiter hasn't uploaded a photo: a trade-specific
// gradient, blueprint texture and icon, so a row of jobs reads as varied as photos do.
const COVERS = [
  { test: /eletric/i, icon: 'plug-zap', from: '#2F4BB5', to: '#0A1A54' },
  { test: /pint/i, icon: 'paint-roller', from: '#2AA096', to: '#08514A' },
  { test: /azulej|porcelan|revest/i, icon: 'layout-grid', from: '#6E8DF5', to: '#1D3FB8' },
  { test: /encanad|hidr/i, icon: 'droplets', from: '#3AA9D1', to: '#0C5F80' },
  { test: /armador|ferr/i, icon: 'construction', from: '#5C6672', to: '#161C24' },
  { test: /carpint|marcen/i, icon: 'hammer', from: '#C08A4A', to: '#6E4015' },
  { test: /gess/i, icon: 'ruler', from: '#8E9DB5', to: '#46546B' },
  { test: /telhad|telhado/i, icon: 'house', from: '#E0A24A', to: '#94540F' },
  { test: /mestre/i, icon: 'hard-hat', from: '#3F63F0', to: '#0E2472' },
  { test: /servente|ajudante/i, icon: 'shovel', from: '#9AA3AE', to: '#3F4852' },
  { test: /pedreiro|alvenaria|reboco|acabamento/i, icon: 'brick-wall', from: '#D9774B', to: '#842F12' }
];
const DEFAULT_COVER = { icon: 'hard-hat', from: '#1D4BED', to: '#0A1A54' };

function coverFor(role) {
  return COVERS.find((c) => c.test.test(role)) || DEFAULT_COVER;
}

export function JobCover({ job, muted = false }) {
  const c = coverFor(job.role || '');
  return h('div', {
    class: cx('absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.04]', muted ? 'grayscale' : ''),
    style: { background: `linear-gradient(145deg, ${c.from}, ${c.to})` }
  },
    h('div', { class: 'absolute inset-0 job-cover-grid' }),
    h('div', { class: 'absolute inset-0', style: { background: 'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.22), transparent 58%)' } }),
    h('span', { class: 'absolute -right-8 -bottom-8 opacity-[0.13] -rotate-12' }, Icon(c.icon, { size: 168, color: '#fff' })),
    h('div', { class: 'absolute inset-0 flex items-center justify-center' },
      h('span', { class: 'inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 ring-1 ring-white/30 shadow-raised', style: { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } },
        Icon(c.icon, { size: 30, color: '#fff' })
      )
    )
  );
}

function SaveFlag({ saved, onToggle, label }) {
  return h('button', {
    type: 'button', 'aria-label': label, 'aria-pressed': saved ? 'true' : 'false', title: label,
    class: 'absolute top-2 right-2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full transition-transform active:scale-90 hover:scale-110',
    onClick: (e) => { e.stopPropagation(); onToggle(); }
  },
    h('span', { class: 'relative inline-flex w-6 h-6', style: { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' } },
      Icon('bookmark-solid', { size: 24, color: saved ? 'var(--brand)' : 'rgba(16,20,24,0.32)', className: 'absolute inset-0' }),
      Icon('bookmark', { size: 24, color: '#fff', className: 'absolute inset-0' })
    )
  );
}

const PILL_TONES = {
  neutral: 'var(--gray-700)', danger: 'var(--red-500)', brand: 'var(--blue-600)',
  success: 'var(--green-500)', warning: 'var(--amber-500)', accent: 'var(--teal-600)'
};

/**
 * Desktop/tablet job card (Airbnb-style): large rounded image, info lines underneath,
 * an optional status pill top-left and an optional save flag top-right. The title is a
 * stretched button, so the whole card is clickable while the flag stays its own control.
 */
export function JobTile({ job, title, lines = [], onClick, pill = null, saved = false, onToggleSave = null, muted = false }) {
  return h('div', { class: 'group relative flex flex-col gap-3 min-w-0' },
    h('div', { class: 'relative w-full aspect-[20/19] rounded-2xl overflow-hidden bg-concrete-100' },
      job.photo
        ? h('img', { src: job.photo, alt: '', class: cx('absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]', muted ? 'grayscale' : '') })
        : JobCover({ job, muted }),
      pill ? h('span', { class: cx('absolute top-3 left-3 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white/95 shadow-raised text-xs font-semibold text-concrete-900', onToggleSave ? 'max-w-[calc(100%-4rem)]' : 'max-w-[calc(100%-1.5rem)]') },
        pill.icon ? Icon(pill.icon, { size: 13, color: PILL_TONES[pill.tone] || PILL_TONES.neutral }) : null,
        h('span', { class: 'truncate' }, pill.label)
      ) : null,
      onToggleSave ? SaveFlag({ saved, onToggle: onToggleSave, label: saved ? 'Remover dos salvos' : 'Salvar vaga' }) : null
    ),
    h('div', { class: 'flex flex-col gap-0.5 min-w-0' },
      h('button', {
        type: 'button',
        class: "text-left font-semibold text-[0.9375rem] leading-snug text-concrete-900 truncate after:content-[''] after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-500 focus-visible:after:ring-offset-4",
        onClick
      }, title || job.role),
      ...lines.map((line) => h('span', { class: 'text-sm text-concrete-500 truncate' }, line))
    )
  );
}

/** Dashed tile that sits first in the recruiter's own-jobs row. */
export function PublishTile({ onClick }) {
  return h('button', {
    type: 'button', onClick,
    class: 'group flex flex-col gap-3 min-w-0 text-left'
  },
    h('span', { class: 'relative w-full aspect-[20/19] rounded-2xl border-2 border-dashed border-concrete-300 bg-concrete-25 flex flex-col items-center justify-center gap-3 transition-colors group-hover:border-brand-400 group-hover:bg-brand-50' },
      h('span', { class: 'inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-500 shadow-raised transition-transform group-hover:scale-105' }, Icon('plus', { size: 26, color: '#fff' })),
      h('span', { class: 'font-semibold text-concrete-900' }, 'Publicar nova vaga')
    ),
    h('span', { class: 'text-sm text-concrete-500' }, 'Leva menos de dois minutos.')
  );
}
