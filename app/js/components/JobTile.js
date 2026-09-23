import { h, cx } from '../dom.js';
import { Icon } from '../utils/icons.js';
import { JobCover, SaveFlag, jobPhotos } from './JobCover.js';
import { formatBRL } from '../utils/format.js';

/**
 * Mural tile, listing-style: a rounded photo with the badges and save flag on top, and
 * three compact single-line rows of text underneath — no card chrome. Every row truncates,
 * so all tiles in a grid are exactly the same size whatever their content.
 */
export function JobTile({ job, company, onClick, urgent = false, mine = false, saved = false, onToggleSave = null }) {
  const cover = jobPhotos(job)[0];
  const count = jobPhotos(job).length;
  const bairro = String(job.location || '').split(',')[0];
  const when = [bairro, job.date, job.hours].filter(Boolean).join(' · ');

  const pill = (children, className = '') => h('span', {
    class: cx('inline-flex items-center gap-1 h-6 sm:h-7 px-2 sm:px-2.5 rounded-full bg-white text-[0.6875rem] sm:text-xs font-semibold shadow-[0_1px_3px_rgba(16,20,24,0.18)] whitespace-nowrap', className || 'text-concrete-900')
  }, children);

  const photo = h('div', { class: 'relative aspect-[20/19] rounded-xl sm:rounded-2xl overflow-hidden bg-concrete-200' },
    cover
      ? h('img', { src: cover, alt: '', loading: 'lazy', draggable: 'false', class: 'absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]' })
      : JobCover({ job }),
    h('div', { class: 'absolute top-2 left-2 sm:top-3 sm:left-3 right-12 flex flex-wrap gap-1.5 pointer-events-none' },
      urgent ? pill([Icon('zap', { size: 12, color: 'var(--text-danger)' }), 'Urgente']) : null,
      mine ? pill('Sua vaga', 'text-brand-600') : null
    ),
    count > 1 ? h('span', { class: 'absolute bottom-2 right-2 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-black/55 text-white text-[0.6875rem] font-semibold pointer-events-none' },
      Icon('images', { size: 12, color: '#fff' }), String(count)) : null,
    onToggleSave ? SaveFlag({ saved, onToggle: onToggleSave }) : null
  );

  const text = h('div', { class: 'flex flex-col pt-2 sm:pt-2.5 text-[0.8125rem] sm:text-sm leading-[1.35]' },
    h('span', { class: 'truncate font-semibold text-concrete-900 sm:text-[0.9375rem]' }, job.role),
    h('span', { class: 'truncate text-concrete-500' }, when),
    h('span', { class: 'truncate text-concrete-900 pt-0.5' },
      job.pay == null
        ? h('span', { class: 'font-semibold' }, 'A combinar')
        : [h('span', { class: 'font-semibold' }, formatBRL(job.pay)), h('span', { class: 'text-concrete-500' }, ' por diária')]
    )
  );

  return h('div', {
    role: 'link', tabindex: '0', 'aria-label': [job.role, company && company.name, when].filter(Boolean).join(', '),
    class: 'group min-w-0 cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
    onClick,
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }
  }, photo, text);
}
