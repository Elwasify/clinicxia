import LegacyMarkup from './LegacyMarkup.jsx';
import markup from '../legacy/clinic-header.html?raw';

const brandedMarkup = markup.replace(
  /(<img alt="CLINICXIA"[^>]*src=")[^"]+(")/,
  '$1/clinicxia-logo.svg$2',
);

function ClinicHeader() {
  return <LegacyMarkup markup={brandedMarkup} />;
}

export default ClinicHeader;
