import { startTransition, Suspense, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { AppShell } from './layouts/AppShell';
import { MENU_KEY, type MenuUI } from './layouts/AppNav';
import { isAuthFlow, preloadAllScreens, ROUTES } from './routes';
import { getLocation, matchRoute, navigate, subscribe } from './services/router';
import { getUI, setUI } from './services/store';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center px-6">
      <h1 className="font-display font-bold text-2xl text-concrete-900">Página não encontrada</h1>
      <p className="text-concrete-500">Volte para o início.</p>
    </div>
  );
}

/** Tracks the hash route. Every dispatch scrolls to the top and closes the account menu first. */
function useLocation() {
  const [location, setLocation] = useState(getLocation);
  useEffect(
    () =>
      subscribe(() => {
        const next = getLocation();
        window.scrollTo(0, 0);
        if (getUI<MenuUI>(MENU_KEY, { menuOpen: false }).menuOpen) setUI<MenuUI>(MENU_KEY, { menuOpen: false });
        if (next.path === '/') return navigate('/splash', { replace: true });
        const match = matchRoute(ROUTES, next.path);
        // A screen whose chunk is already here renders synchronously (no frame with the old screen);
        // otherwise the old screen stays up until the new one has loaded.
        if (!match || match.route.value.isLoaded()) flushSync(() => setLocation(next));
        else startTransition(() => setLocation(next));
      }),
    []
  );
  return location;
}

export function App() {
  const location = useLocation();

  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb: () => void) => window.setTimeout(cb, 200));
    idle(() => preloadAllScreens());
  }, []);

  const { path, seq } = location;
  if (path === '/') return null;
  const match = matchRoute(ROUTES, path);
  if (!match) return <NotFound />;

  const { Component } = match.route.value;
  const screen = <Component key={path} params={match.params} />;
  return (
    <Suspense fallback={null}>
      {isAuthFlow(path) ? (
        screen
      ) : (
        <AppShell path={path} pattern={match.route.pattern} navKey={seq}>
          {screen}
        </AppShell>
      )}
    </Suspense>
  );
}
