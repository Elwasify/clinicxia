import LegacyMarkup from './LegacyMarkup.jsx';
import markup from '../legacy/shared-overlays.html?raw';

function SharedOverlays() {
  return <LegacyMarkup markup={markup} />;
}

export default SharedOverlays;
