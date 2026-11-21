import DashboardPage from '../pages/DashboardPage.jsx';
import DailyRecordPage from '../pages/DailyRecordPage.jsx';
import PatientDatabasePage from '../pages/PatientDatabasePage.jsx';
import LegacyMarkup from './LegacyMarkup.jsx';
import toastMarkup from '../legacy/toast.html?raw';

function PageOutlet() {
  return (
    <main
      className="flex-1 w-full max-w-[1560px] mx-auto px-6 flex flex-col py-6"
      id="page-outlet"
    >
      <div className="flex flex-col w-full">
        <LegacyMarkup markup={toastMarkup} />
        <DashboardPage />
        <DailyRecordPage />
        <PatientDatabasePage />
      </div>
    </main>
  );
}

export default PageOutlet;
