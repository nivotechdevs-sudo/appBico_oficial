import { h, cx } from '../dom.js';
import { Icon } from '../utils/icons.js';
import { rememberScroll, recalledScroll } from '../utils/scrollMemory.js';

// Column count changes with the viewport (see .job-cols), which can make a rail start or
// stop overflowing without any scroll event, so arrows are re-synced on resize too.
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    document.querySelectorAll('[data-rail]').forEach((el) => el.syncArrows && el.syncArrows());
  });
}

function arrowButton(icon, label, onClick) {
  return h('button', {
    type: 'button', 'aria-label': label, title: label,
    class: 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-concrete-200 text-concrete-900 shadow-card transition hover:shadow-raised hover:scale-105 disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100 disabled:cursor-default',
    onClick
  }, Icon(icon, { size: 16 }));
}

/**
 * A titled horizontal row of job tiles (desktop/tablet). The title's arrow opens the
 * full list; the round buttons page through the row one screenful at a time.
 */
export function JobRail({ id, title, count, onSeeAll, items }) {
  const rail = h('div', { class: 'job-rail job-cols no-scrollbar pb-1', 'data-rail': id }, ...items);

  const prev = arrowButton('chevron-left', 'Anteriores', () => rail.scrollBy({ left: -rail.clientWidth, behavior: 'smooth' }));
  const next = arrowButton('chevron-right', 'Próximas', () => rail.scrollBy({ left: rail.clientWidth, behavior: 'smooth' }));

  rail.syncArrows = () => {
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
  };
  rail.addEventListener('scroll', () => { rememberScroll(id, rail.scrollLeft); rail.syncArrows(); }, { passive: true });
  // Runs once the screen is mounted (same frame, before paint): restore offset, then sync.
  requestAnimationFrame(() => {
    const left = recalledScroll(id);
    if (left) rail.scrollLeft = left;
    rail.syncArrows();
  });

  return h('section', { class: 'flex flex-col gap-4 min-w-0', 'aria-label': title },
    h('div', { class: 'flex items-center justify-between gap-4' },
      h('button', {
        type: 'button', class: 'group inline-flex items-center gap-2.5 min-w-0 text-left', onClick: onSeeAll,
        title: 'Ver todas'
      },
        h('h2', { class: 'text-[1.375rem] font-semibold leading-tight text-concrete-900 truncate' }, title),
        count != null ? h('span', { class: 'hidden xl:inline text-sm text-concrete-500 whitespace-nowrap' }, count === 1 ? '1 vaga' : `${count} vagas`) : null,
        h('span', { class: 'shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-concrete-100 text-concrete-900 transition-colors group-hover:bg-concrete-200' }, Icon('arrow-right', { size: 15 }))
      ),
      h('div', { class: cx('flex items-center gap-2 shrink-0') }, prev, next)
    ),
    rail
  );
}
