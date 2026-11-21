import LegacyMarkup from './LegacyMarkup.jsx';
import markup from '../legacy/primary-navigation.html?raw';

function PrimaryNavigation() {
  return <LegacyMarkup markup={markup} />;
}

export default PrimaryNavigation;
