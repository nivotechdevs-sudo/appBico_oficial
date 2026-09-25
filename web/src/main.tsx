import { createRoot } from 'react-dom/client';
import { App } from './App';
import { currentPath, navigate, startRouter } from './services/router';
import './styles/tokens.css';
import './styles/base.css';
import './styles/tailwind.css';
import './styles/legacy-rerender.css';

startRouter();
// "/" (no hash) opens the splash screen, replacing the entry like the legacy router did.
if (currentPath() === '/') navigate('/splash', { replace: true });

// No <StrictMode>: its development-only double effects would restart the navigation's slide
// animations, which are driven imperatively (see layouts/AppNav.tsx).
createRoot(document.getElementById('app')!).render(<App />);
