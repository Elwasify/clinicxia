import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import LegacyApp from './LegacyApp.jsx';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Unable to find the React root element.');
}

const root = createRoot(rootElement);

flushSync(() => {
  root.render(<LegacyApp />);
});
