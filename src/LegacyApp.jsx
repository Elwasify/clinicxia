import { useLayoutEffect } from 'react';
import legacyDocument from './legacy-runtime.html?raw';
import ClinicFooter from './components/ClinicFooter.jsx';
import ClinicHeader from './components/ClinicHeader.jsx';
import PageOutlet from './components/PageOutlet.jsx';
import PrimaryNavigation from './components/PrimaryNavigation.jsx';
import SharedOverlays from './components/SharedOverlays.jsx';

const parsedDocument = new DOMParser().parseFromString(legacyDocument, 'text/html');
const legacyScripts = Array.from(parsedDocument.scripts, (script) => ({
  attributes: Array.from(script.attributes, ({ name, value }) => [name, value]),
  source: script.textContent,
}));

parsedDocument.querySelectorAll('script').forEach((script) => script.remove());

function LegacyApp() {
  useLayoutEffect(() => {
    document.documentElement.lang = parsedDocument.documentElement.lang || 'ar';
    document.documentElement.dir = parsedDocument.documentElement.dir || 'rtl';
    document.title = parsedDocument.title || document.title;

    Array.from(parsedDocument.body.attributes).forEach(({ name, value }) => {
      document.body.setAttribute(name, value);
    });

    Array.from(parsedDocument.head.children).forEach((element) => {
      if (element.matches('link, style')) {
        document.head.appendChild(element.cloneNode(true));
      }
    });

    legacyScripts.forEach(({ attributes, source }) => {
      const script = document.createElement('script');

      attributes.forEach(([name, value]) => script.setAttribute(name, value));
      script.textContent = source;
      document.body.appendChild(script);
    });
  }, []);

  return (
    <div id="clinicxia-app">
      <ClinicHeader />
      <PrimaryNavigation />
      <PageOutlet />
      <SharedOverlays />
      <ClinicFooter />
    </div>
  );
}

export default LegacyApp;
