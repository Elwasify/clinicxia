import LegacyMarkup from '../components/LegacyMarkup.jsx';
import markup from '../legacy/patient-database-page.html?raw';

function PatientDatabasePage() {
  return <LegacyMarkup markup={markup} />;
}

export default PatientDatabasePage;
