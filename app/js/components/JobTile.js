import { h, cx } from '../dom.js';
import { Icon } from '../utils/icons.js';
import { JobCover, SaveFlag, jobPhotos } from './JobCover.js';
import { formatBRL } from '../utils/format.js';
import { diasInfo, whenText } from '../utils/jobInfo.js';

// Icon colour for a status badge on the photo, by tone.
const TONE_COLOR = { brand: 'var(--text-brand)', success: 'var(--green-500)', warning: 'var(--amber-500)', danger: 'var(--red-500)', accent: 'var(--text-brand)', neutral: 'var(--gray-500)' };

/**
 * Mural tile, listing-style: a rounded photo with the badges and save flag on top, and
 * compact single-line rows underneath (role; neighbourhood and days of the week; date and
 * hours; pay) — no card chrome. Every row truncates, so all tiles in a grid are exactly
 * the same size whatever their content. `badge` ({ label, icon, tone }) shows a status on
 * the photo (used on "Minhas candidaturas"); `muted` greys out a closed one.
 */
export function JobTile({ job, company, onClick, badge = null, mine = false, muted = false, saved = false, onToggleSave = null }) {
  const cover = jobPhotos(job)[0];
  const count = jobPhotos(job).length;
  const bairro = String(job.location || '').split(',')[0];
  const dias = diasInfo(job);
  const where = [bairro, dias && dias.short].filter(Boolean).join(' · ');
  const when = whenText(job);

  const pill = (children, className = '') => h('span', {
    class: cx('inline-flex items-center gap-1 h-6 sm:h-7 px-2 sm:px-2.5 rounded-full bg-white text-[0.6875rem] sm:text-xs font-semibold shadow-[0_1px_3px_rgba(16,20,24,0.18)] whitespace-nowrap', className || 'text-concrete-900')
  }, children);

  const photo = h('div', { class: cx('relative aspect-[20/19] rounded-xl sm:rounded-2xl overflow-hidden bg-concrete-200', muted ? 'grayscale opacity-70' : '') },
    cover
      ? h('img', { src: cover, alt: '', loading: 'lazy', draggable: 'false', class: 'absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]' })
      : JobCover({ job }),
    h('div', { class: 'absolute top-2 left-2 sm:top-3 sm:left-3 right-12 flex flex-wrap gap-1.5 pointer-events-none' },
      badge ? pill([badge.icon ? Icon(badge.icon, { size: 12, color: TONE_COLOR[badge.tone] || TONE_COLOR.neutral }) : null, badge.label]) : null,
      mine ? pill('Sua vaga', 'text-brand-600') : null
    ),
    count > 1 ? h('span', { class: 'absolute bottom-2 right-2 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-black/55 text-white text-[0.6875rem] font-semibold pointer-events-none' },
      Icon('images', { size: 12, color: '#fff' }), String(count)) : null,
    onToggleSave ? SaveFlag({ saved, onToggle: onToggleSave }) : null
  );

  const text = h('div', { class: 'flex flex-col pt-2 sm:pt-2.5 text-[0.8125rem] sm:text-sm leading-[1.35]' },
    h('span', { class: cx('truncate font-semibold sm:text-[0.9375rem]', muted ? 'text-concrete-500' : 'text-concrete-900') }, job.role),
    h('span', { class: 'truncate text-concrete-500' }, where),
    h('span', { class: 'truncate text-concrete-500' }, when),
    h('span', { class: cx('truncate pt-0.5', muted ? 'text-concrete-500' : 'text-concrete-900') },
      job.pay == null
        ? h('span', { class: 'font-semibold' }, 'A combinar')
        : [h('span', { class: 'font-semibold' }, formatBRL(job.pay)), h('span', { class: 'text-concrete-500' }, ' por diária')]
    )
  );

  return h('div', {
    role: 'link', tabindex: '0', 'aria-label': [job.role, badge && badge.label, company && company.name, where, when].filter(Boolean).join(', '),
    class: 'group min-w-0 cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
    onClick,
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }
  }, photo, text);
}
