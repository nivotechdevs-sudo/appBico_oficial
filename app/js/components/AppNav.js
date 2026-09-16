import { h, cx } from '../dom.js';
import { Icon } from '../utils/icons.js';

const ITEMS = {
  trabalhador: [
    { id: 'mural', icon: 'hammer', label: 'Vagas', path: '/mural' },
    { id: 'minhas-candidaturas', icon: 'file-check', label: 'Minhas', path: '/minhas-candidaturas' },
    { id: 'perfil', icon: 'user', label: 'Perfil', path: '/perfil' }
  ],
  recrutador: [
    { id: 'mural', icon: 'hammer', label: 'Início', path: '/mural' },
    { id: 'criar-vaga', icon: 'plus', label: 'Publicar', path: '/criar-vaga' },
    { id: 'empresa', icon: 'building-2', label: 'Perfil', path: '/empresa' }
  ]
};

/**
 * The app's single navigation component. Bottom floating tab bar on mobile/tablet,
 * left sidebar on desktop — same items, same active/badge logic, chosen with
 * responsive Tailwind classes rather than two separate components.
 */
export function AppNav({ role, active, navigate, badges = {}, showMobilePill = true }) {
  const items = ITEMS[role] || ITEMS.trabalhador;

  const mobile = showMobilePill ? h('nav', {
    'aria-label': 'Navegação principal',
    class: 'lg:hidden fixed left-1/2 -translate-x-1/2 z-30 flex items-center gap-3.5 rounded-full px-5 py-2 shadow-raised border border-white/60',
    style: { bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))', backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px) saturate(1.6)', WebkitBackdropFilter: 'blur(16px) saturate(1.6)' }
  }, ...items.map((it) => navPill(it, active, navigate, badges))) : null;

  const desktop = h('nav', {
    'aria-label': 'Navegação principal',
    class: 'hidden lg:flex lg:flex-col lg:gap-1 lg:w-56 lg:shrink-0 lg:sticky lg:top-6 lg:self-start lg:py-6 lg:pr-4'
  },
    h('div', { class: 'flex items-center gap-2 px-3 pb-6' },
      h('span', { class: 'font-display font-bold text-2xl text-concrete-900 tracking-tight' }, 'Bicos')
    ),
    ...items.map((it) => sidebarLink(it, active, navigate, badges))
  );

  return h('div', { class: 'contents' }, mobile, desktop);
}

function navPill(it, active, navigate, badges) {
  const isActive = active === it.id;
  return h('button', {
    type: 'button', 'aria-label': it.label, 'aria-current': isActive ? 'page' : null,
    class: 'inline-flex items-center justify-center w-11 h-11 shrink-0',
    onClick: () => navigate(it.path)
  },
    h('span', { class: cx('relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors', isActive ? 'bg-brand-500' : '') },
      Icon(it.icon, { size: 22, color: isActive ? '#fff' : 'var(--gray-500)' }),
      badges[it.id] ? h('span', { class: 'absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 rounded-full bg-danger-500 text-white text-[0.625rem] font-bold leading-4 text-center' }, String(badges[it.id])) : null
    )
  );
}

function sidebarLink(it, active, navigate, badges) {
  const isActive = active === it.id;
  return h('button', {
    type: 'button', 'aria-current': isActive ? 'page' : null,
    class: cx('flex items-center gap-3 px-3 h-12 rounded-control text-left font-semibold transition-colors', isActive ? 'bg-brand-50 text-brand-600' : 'text-concrete-700 hover:bg-concrete-100'),
    onClick: () => navigate(it.path)
  },
    Icon(it.icon, { size: 20, color: isActive ? 'var(--brand)' : 'var(--gray-500)' }),
    h('span', { class: 'flex-1' }, it.label),
    badges[it.id] ? h('span', { class: 'px-2 h-5 inline-flex items-center rounded-full bg-danger-500 text-white text-xs font-bold' }, String(badges[it.id])) : null
  );
}
