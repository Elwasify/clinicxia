import LegacyMarkup from './LegacyMarkup.jsx';
import markup from '../legacy/clinic-header.html?raw';

function ClinicHeader() {
  return <LegacyMarkup markup={markup} />;
}

export default ClinicHeader;
