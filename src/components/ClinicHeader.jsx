import LegacyMarkup from './LegacyMarkup.jsx';
import markup from '../legacy/clinic-header.html?raw';

const brandedMarkup = markup
  .replace(/<div class="w-14 h-14[^"]*"><img alt="شعار العيادة الطبي"[^>]*><\/div>/, '')
  .replace(
    /<div class="h-8 flex items-center"><img alt="CLINICXIA"[^>]*><\/div>/,
    '<div class="h-8 flex items-center"><span class="text-xl font-extrabold tracking-wide text-[#0B2545] ltr-text">CLINICXIA</span></div>',
  );

function ClinicHeader() {
  return <LegacyMarkup markup={brandedMarkup} />;
}

export default ClinicHeader;
