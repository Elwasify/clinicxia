import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import LegacyApp from './LegacyApp.jsx';
import LoginPage from './pages/LoginPage.jsx';
import './login.css';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Unable to find the React root element.');
}

const root = createRoot(rootElement);
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const authMode = new URLSearchParams(window.location.search).get('auth');
const isAuthRoute = ['/login', '/signup'].includes(pathname)
  || ['login', 'signup', 'reset'].includes(authMode);
const initialAuthMode = authMode === 'signup' || pathname === '/signup'
  ? 'signup'
  : authMode === 'reset'
    ? 'reset'
    : 'login';

flushSync(() => {
  root.render(
    isAuthRoute
      ? <LoginPage initialMode={initialAuthMode} />
      : <LegacyApp />,
  );
});
