import LegacyMarkup from '../components/LegacyMarkup.jsx';
import markup from '../legacy/daily-record-page.html?raw';

function DailyRecordPage() {
  return <LegacyMarkup markup={markup} />;
}

export default DailyRecordPage;
