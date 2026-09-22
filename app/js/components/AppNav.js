import { h, cx } from '../dom.js';
import { Icon } from '../utils/icons.js';
import { getUI, setUI } from '../store.js';

const ITEMS = {
  trabalhador: [
    { id: 'mural', icon: 'hammer', label: 'Vagas', path: '/mural' },
    { id: 'minhas-candidaturas', icon: 'file-check', label: 'Minhas', desktopLabel: 'Candidaturas', path: '/minhas-candidaturas' },
    { id: 'perfil', icon: 'user', label: 'Perfil', path: '/perfil' }
  ],
  recrutador: [
    { id: 'mural', icon: 'hammer', label: 'Início', path: '/mural' },
    { id: 'criar-vaga', icon: 'plus', label: 'Publicar', desktopLabel: 'Publicar vaga', path: '/criar-vaga' },
    { id: 'empresa', icon: 'building-2', label: 'Perfil', path: '/empresa' }
  ]
};

const MENU = {
  trabalhador: [
    { icon: 'user', label: 'Meu perfil', path: '/perfil' },
    { icon: 'bookmark', label: 'Vagas salvas', path: '/vagas-salvas' },
    { icon: 'bell', label: 'Notificações', path: '/notificacoes' },
    { icon: 'settings', label: 'Configurações', path: '/configuracoes' }
  ],
  recrutador: [
    { icon: 'building-2', label: 'Minha empresa', path: '/empresa' },
    { icon: 'history', label: 'Bicos fechados', path: '/historico' },
    { icon: 'bell', label: 'Notificações', path: '/notificacoes' },
    { icon: 'settings', label: 'Configurações', path: '/configuracoes' }
  ]
};

const MENU_KEY = 'app-nav';

if (typeof window !== 'undefined') {
  // One listener for the lifetime of the page: the header element itself is rebuilt on
  // every render, so it's looked up rather than captured.
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.app-header');
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && getUI(MENU_KEY, { menuOpen: false }).menuOpen) setUI(MENU_KEY, { menuOpen: false });
  });
}

/**
 * The app's single navigation component. Floating tab pill on phones; on tablet and
 * desktop (>= 770px) a full-width top bar with the logo, the same tabs centered, and
 * notifications + account menu on the right.
 */
export function AppNav({ role, active, navigate, badges = {}, showMobilePill = true, flush = false, notifications = 0, account = {} }) {
  const items = ITEMS[role] || ITEMS.trabalhador;

  const mobile = showMobilePill ? h('nav', {
    'aria-label': 'Navegação principal',
    class: 'lg:hidden fixed left-1/2 -translate-x-1/2 z-30 flex items-center gap-3.5 rounded-full px-5 py-2 shadow-raised border border-white/60',
    style: { bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))', backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px) saturate(1.6)', WebkitBackdropFilter: 'blur(16px) saturate(1.6)' }
  }, ...items.map((it) => navPill(it, active, navigate, badges))) : null;

  return h('div', { class: 'contents' }, mobile, topBar({ role, items, active, navigate, badges, flush, notifications, account }));
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

function topBar({ role, items, active, navigate, badges, flush, notifications, account }) {
  const menu = getUI(MENU_KEY, { menuOpen: false });
  const go = (path) => { setUI(MENU_KEY, { menuOpen: false }); navigate(path); };

  const logo = h('button', { type: 'button', class: 'inline-flex items-center gap-2.5 rounded-control', 'aria-label': 'Bicos, ir para o início', onClick: () => go('/mural') },
    h('span', { class: 'inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 shadow-raised' }, Icon('hammer', { size: 21, color: '#fff' })),
    h('span', { class: 'font-display font-bold text-[1.625rem] leading-none tracking-tight text-brand-500' }, 'Bicos')
  );

  const tabs = h('nav', { 'aria-label': 'Navegação principal', class: 'flex items-stretch self-stretch gap-1 xl:gap-3' },
    ...items.map((it) => topTab(it, active, go, badges))
  );

  const bell = h('button', {
    type: 'button', 'aria-label': notifications ? `Notificações, ${notifications} novas` : 'Notificações', title: 'Notificações',
    class: 'relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-concrete-100 text-concrete-900 transition-colors hover:bg-concrete-200',
    onClick: () => go('/notificacoes')
  },
    Icon('bell', { size: 18 }),
    notifications ? h('span', { class: 'absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-danger-500 text-white text-[0.625rem] font-bold leading-[1.125rem] text-center ring-2 ring-white' }, String(notifications)) : null
  );

  const avatar = h('span', { class: cx('inline-flex items-center justify-center w-8 h-8 rounded-full overflow-hidden text-xs font-bold', role === 'recrutador' ? 'bg-brand-50' : 'bg-accent-50 text-accent-600') },
    account.photo ? h('img', { src: account.photo, alt: '', class: 'w-full h-full object-cover' })
      : role === 'recrutador' ? Icon('building-2', { size: 16, color: 'var(--brand)' }) : (account.initials || '')
  );

  const menuButton = h('button', {
    type: 'button', 'aria-label': 'Menu da conta', 'aria-haspopup': 'menu', 'aria-expanded': menu.menuOpen ? 'true' : 'false',
    class: cx('inline-flex items-center gap-2.5 h-11 pl-3.5 pr-1.5 rounded-full border bg-white transition-shadow hover:shadow-raised', menu.menuOpen ? 'border-concrete-300 shadow-raised' : 'border-concrete-200'),
    onClick: () => setUI(MENU_KEY, { menuOpen: !menu.menuOpen })
  }, Icon('menu', { size: 18, color: 'var(--gray-700)' }), avatar);

  const dropdown = menu.menuOpen ? [
    h('div', { class: 'fixed inset-0 z-40', 'aria-hidden': 'true', onClick: () => setUI(MENU_KEY, { menuOpen: false }) }),
    h('div', { role: 'menu', class: 'absolute right-0 top-full mt-3 z-50 w-72 py-2 bg-white rounded-2xl border border-concrete-200 shadow-float animate-fade-in' },
      h('div', { class: 'flex items-center gap-3 px-4 pt-2 pb-3' },
        h('span', { class: cx('inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shrink-0 text-sm font-bold', role === 'recrutador' ? 'bg-brand-50' : 'bg-accent-50 text-accent-600') },
          account.photo ? h('img', { src: account.photo, alt: '', class: 'w-full h-full object-cover' })
            : role === 'recrutador' ? Icon('building-2', { size: 20, color: 'var(--brand)' }) : (account.initials || '')
        ),
        h('div', { class: 'flex flex-col min-w-0' },
          h('span', { class: 'font-semibold text-concrete-900 truncate' }, account.name || ''),
          h('span', { class: 'text-sm text-concrete-500 truncate' }, role === 'recrutador' ? 'Conta de recrutador' : 'Conta de trabalhador')
        )
      ),
      h('div', { class: 'h-px bg-concrete-200 my-1' }),
      ...(MENU[role] || MENU.trabalhador).map((m) => menuItem(m, () => go(m.path))),
      h('div', { class: 'h-px bg-concrete-200 my-1' }),
      menuItem({ icon: 'log-out', label: 'Sair da conta', danger: true }, () => go('/login'))
    )
  ] : [];

  return h('header', { class: cx('app-header hidden lg:block sticky top-0 z-30 bg-white transition-shadow', flush ? '' : 'border-b border-concrete-200', window.scrollY > 8 ? 'is-scrolled' : '') },
    h('div', { class: 'page-x h-20 flex items-center gap-6' },
      h('div', { class: 'flex-1 min-w-0 flex items-center' }, logo),
      tabs,
      h('div', { class: 'flex-1 flex items-center justify-end gap-2.5' },
        bell,
        h('div', { class: 'relative' }, menuButton, ...dropdown)
      )
    )
  );
}

function topTab(it, active, go, badges) {
  const isActive = active === it.id;
  return h('button', {
    type: 'button', 'aria-current': isActive ? 'page' : null,
    class: cx('group relative inline-flex items-center gap-2.5 px-3 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors', isActive ? 'text-concrete-900' : 'text-concrete-500 hover:text-concrete-900'),
    onClick: () => go(it.path)
  },
    h('span', {
      class: cx('relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all',
        isActive ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-raised' : 'bg-concrete-100 text-concrete-600 group-hover:bg-concrete-200')
    },
      Icon(it.icon, { size: 19 }),
      badges[it.id] ? h('span', { class: 'absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-danger-500 text-white text-[0.625rem] font-bold leading-[1.125rem] text-center ring-2 ring-white' }, String(badges[it.id])) : null
    ),
    it.desktopLabel || it.label,
    h('span', { class: cx('absolute left-3 right-3 bottom-0 h-[3px] rounded-t-full transition-colors', isActive ? 'bg-brand-500' : 'bg-transparent group-hover:bg-concrete-200') })
  );
}

function menuItem(m, onClick) {
  return h('button', {
    type: 'button', role: 'menuitem',
    class: cx('w-full flex items-center gap-3 px-4 h-11 text-left text-[0.9375rem] transition-colors hover:bg-concrete-50', m.danger ? 'text-danger-500 font-semibold' : 'text-concrete-800'),
    onClick
  }, Icon(m.icon, { size: 18, color: m.danger ? 'var(--red-500)' : 'var(--gray-500)' }), m.label);
}
