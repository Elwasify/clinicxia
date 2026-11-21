import LegacyMarkup from '../components/LegacyMarkup.jsx';
import markup from '../legacy/dashboard-page.html?raw';

function DashboardPage() {
  return <LegacyMarkup markup={markup} />;
}

export default DashboardPage;
