import { h, cx } from '../dom.js';
import { Icon } from '../utils/icons.js';
import { JobCover, jobPhotos } from './JobCover.js';

const shownPhoto = new Map();

/**
 * A job's photos, swiped (or paged with the arrows) horizontally — the one place in the
 * app that scrolls sideways. Without photos it shows the same placeholder the job card
 * shows at that screen size.
 */
export function PhotoCarousel({ job }) {
  const photos = jobPhotos(job);
  const n = photos.length;
  const frame = 'relative w-full h-56 sm:h-72 lg:h-[26rem] rounded-card overflow-hidden bg-concrete-200';

  if (!n) {
    return h('div', { class: frame },
      h('div', { class: 'lg:hidden w-full h-full flex flex-col items-center justify-center gap-1.5 text-concrete-400' },
        Icon('camera', { size: 24 }), h('span', { class: 'text-xs' }, 'Foto do canteiro')
      ),
      h('div', { class: 'hidden lg:block absolute inset-0' }, JobCover({ job, large: true }))
    );
  }

  const track = h('div', { class: 'flex h-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar', 'aria-label': 'Fotos do bico' },
    ...photos.map((src, i) => h('div', { class: 'shrink-0 w-full h-full snap-center' },
      h('img', { src, alt: `Foto ${i + 1} de ${n}`, draggable: 'false', class: 'w-full h-full object-cover select-none' })
    ))
  );
  if (n === 1) return h('div', { class: frame }, track);

  const arrow = (icon, label, dir, side) => h('button', {
    type: 'button', 'aria-label': label, title: label,
    class: cx('absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-concrete-900 shadow-raised transition hover:bg-white hover:scale-105 disabled:opacity-0 disabled:pointer-events-none', side),
    onClick: () => track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' })
  }, Icon(icon, { size: 18 }));
  const prev = arrow('chevron-left', 'Foto anterior', -1, 'left-3');
  const next = arrow('chevron-right', 'Próxima foto', 1, 'right-3');
  const dots = photos.map(() => h('span', { class: 'h-1.5 rounded-full transition-all duration-200' }));
  const counter = h('span', { class: 'absolute bottom-3 right-3 inline-flex items-center h-6 px-2.5 rounded-full bg-black/60 text-white text-xs font-semibold' });

  const show = (i) => {
    counter.textContent = `${i + 1} / ${n}`;
    dots.forEach((d, k) => { d.className = cx('h-1.5 rounded-full transition-all duration-200', k === i ? 'w-4 bg-white' : 'w-1.5 bg-white/60'); });
    prev.disabled = i === 0;
    next.disabled = i === n - 1;
  };
  // The whole screen re-renders on every store change; remember which photo was showing.
  const start = Math.min(n - 1, shownPhoto.get(job.id) || 0);
  let width = 0;
  track.addEventListener('scroll', () => {
    // A resize also scrolls the track; keep the same photo instead of re-deriving it.
    if (track.clientWidth !== width) { width = track.clientWidth; track.scrollLeft = (shownPhoto.get(job.id) || 0) * width; return; }
    const i = Math.min(n - 1, Math.max(0, Math.round(track.scrollLeft / (width || 1))));
    shownPhoto.set(job.id, i);
    show(i);
  }, { passive: true });
  show(start);
  requestAnimationFrame(() => { width = track.clientWidth; if (start) track.scrollLeft = start * width; });

  return h('div', { class: frame },
    track, prev, next,
    h('div', { class: 'absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5' }, ...dots),
    counter
  );
}

/** Editable grid of a job's photos (first one is the cover), with an "add" tile. */
export function PhotoManager({ photos, onChange, max = 6 }) {
  const add = h('label', {
    class: 'relative aspect-square flex flex-col items-center justify-center gap-1.5 rounded-control border-2 border-dashed border-concrete-300 bg-concrete-25 text-concrete-500 cursor-pointer transition-colors hover:border-brand-400 hover:text-brand-600'
  },
    h('input', {
      type: 'file', accept: 'image/*', multiple: true, class: 'sr-only',
      onchange: (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) onChange(photos.concat(files.map((f) => URL.createObjectURL(f))).slice(0, max));
      }
    }),
    Icon('camera', { size: 22 }),
    h('span', { class: 'text-xs font-semibold text-center px-2' }, photos.length ? 'Adicionar foto' : 'Escolher fotos')
  );

  return h('div', { class: 'grid grid-cols-3 sm:grid-cols-4 gap-2' },
    ...photos.map((src, i) => h('div', { class: 'relative aspect-square rounded-control overflow-hidden bg-concrete-200' },
      h('img', { src, alt: `Foto ${i + 1}`, class: 'w-full h-full object-cover' }),
      i === 0 ? h('span', { class: 'absolute bottom-1.5 left-1.5 px-2 h-5 inline-flex items-center rounded-full bg-black/60 text-white text-[0.625rem] font-bold uppercase tracking-wide' }, 'Capa') : null,
      h('button', {
        type: 'button', 'aria-label': `Remover foto ${i + 1}`, title: 'Remover foto',
        class: 'absolute top-1.5 right-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-concrete-900 shadow-raised hover:bg-white',
        onClick: () => onChange(photos.filter((_, k) => k !== i))
      }, Icon('x', { size: 14 }))
    )),
    photos.length < max ? add : null
  );
}
