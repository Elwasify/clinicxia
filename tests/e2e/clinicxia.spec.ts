import { expect, test, Page } from '@playwright/test';
import { demoSeed } from '../../src/api/mocks/data';

const profiles = {
  DOCTOR: { button: 'دخول كـ الطبيب', heading: 'غرفة الكشف الطبي' },
  RECEPTIONIST: { button: 'دخول كـ الاستقبال', heading: 'طابور اليوم' },
  ADMIN: { button: 'دخول كـ المدير', heading: 'ملخص نشاط العيادة' },
} as const;

async function loginAs(page: Page, role: keyof typeof profiles) {
  const currentPath = await page.evaluate(() => window.location.pathname).catch(() => '');
  if (currentPath !== '/login') await page.goto(`/login?role=${role}`);
  await page.getByRole('button', { name: profiles[role].button }).click();
  await expect(page.getByRole('heading', { name: profiles[role].heading })).toBeVisible();
}

async function loginWithCredentials(page: Page, username: string) {
  const currentPath = await page.evaluate(() => window.location.pathname).catch(() => '');
  if (currentPath !== '/login') await page.goto('/login');
  await page.getByLabel('اسم المستخدم').fill(username);
  await page.getByLabel('كلمة المرور').fill(demoSeed.credentials.password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await expect(page.getByRole('heading', { name: profiles.DOCTOR.heading })).toBeVisible();
}

async function logout(page: Page) {
  await page.locator('header button[aria-haspopup="menu"]').first().click();
  await page.getByRole('menuitem', { name: 'تسجيل الخروج' }).click();
  await expect(page).toHaveURL(/\/login/);
}

async function clickMoreItem(page: Page, label: string) {
  await page.getByRole('button', { name: 'المزيد' }).click();
  await page.getByRole('menuitem', { name: label }).click();
}

async function expectNoSidebar(page: Page) {
  await expect(page.locator('aside, [data-side-drawer]')).toHaveCount(0);
}

async function expectHeaderFits(page: Page) {
  const contentFits = await page.locator('header a:visible, header button:visible').evaluateAll((elements) =>
    elements.every((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= window.innerWidth;
    })
  );
  expect(contentFits).toBe(true);
}

test('welcome page routes all roles and every displayed navigation link opens a working screen', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'إدارة أذكى.. رعاية طبية أفضل.' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'طبيب داخل عيادة، صورة توضيحية' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' })).toHaveCount(0);
  await expectNoSidebar(page);
  await expect(page.getByText(demoSeed.clinicProfile.name, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'دخول الطبيب' }).click();
  await expect(page).toHaveURL(/role=DOCTOR/);
  await page.getByRole('button', { name: profiles.DOCTOR.button }).click();
  await expect(page.getByRole('heading', { name: profiles.DOCTOR.heading })).toBeVisible();
  await expectNoSidebar(page);
  await page.getByRole('link', { name: 'غرفة الكشف' }).click();
  await expect(page).toHaveURL(/\/examination$/);
  await expectNoSidebar(page);
  await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('link', { name: 'المرضى', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'قاعدة بيانات المرضى' })).toBeVisible();
  await expectNoSidebar(page);
  await clickMoreItem(page, 'سجل اليوم');
  await expect(page.getByRole('heading', { name: 'سجل اليوم' })).toBeVisible();
  await expectNoSidebar(page);

  await logout(page);
  await loginAs(page, 'RECEPTIONIST');
  await expectNoSidebar(page);
  await page.getByRole('link', { name: 'طابور اليوم' }).click();
  await expect(page.getByRole('heading', { name: 'سجل اليوم' })).toBeVisible();
  await expectNoSidebar(page);
  await page.getByRole('link', { name: 'تسجيل مريض' }).click();
  await expect(page).toHaveURL(/\/patients\/new$/);
  await expect(page.getByRole('heading', { name: 'تسجيل مريض جديد' })).toBeVisible();
  await expectNoSidebar(page);
  await page.getByRole('button', { name: 'إلغاء' }).click();
  await clickMoreItem(page, 'قاعدة المرضى');
  await expect(page.getByRole('heading', { name: 'قاعدة بيانات المرضى' })).toBeVisible();
  await expectNoSidebar(page);

  await logout(page);
  await loginAs(page, 'ADMIN');
  await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('link', { name: 'الأطباء', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'الأطباء' })).toBeVisible();
  await expectNoSidebar(page);
  await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('link', { name: 'الموظفون', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'الموظفون' })).toBeVisible();
  await expectNoSidebar(page);
  await clickMoreItem(page, 'المرضى');
  await expect(page.getByRole('heading', { name: 'قاعدة بيانات المرضى' })).toBeVisible();
  await expectNoSidebar(page);
  await clickMoreItem(page, 'سجل اليوم');
  await expect(page.getByRole('heading', { name: 'سجل اليوم' })).toBeVisible();
  await expectNoSidebar(page);

  expect(consoleErrors).toEqual([]);
});

test('landing and authenticated navigation work at mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'طبيب داخل عيادة، صورة توضيحية' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'فتح قائمة الموقع' })).toHaveCount(0);
  const imageLoads = await page.getByRole('img', { name: 'طبيب داخل عيادة، صورة توضيحية' }).evaluate((image) => (image as HTMLImageElement).naturalWidth > 0);
  expect(imageLoads).toBe(true);

  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expectHeaderFits(page);
  }

  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole('link', { name: 'تعرّف على مساحات العمل' }).click();
  await expect(page).toHaveURL(/#workspaces$/);
  await expect(page.locator('#workspaces')).toBeInViewport();
  await page.locator('header').getByRole('link', { name: 'تسجيل الدخول' }).click();
  await loginAs(page, 'DOCTOR');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expectHeaderFits(page);
  await page.getByRole('button', { name: 'فتح قائمة التنقل' }).click();
  const appNavigation = page.getByRole('navigation', { name: 'التنقل الرئيسي' });
  await expect(appNavigation.getByRole('link', { name: 'غرفة الكشف' })).toBeVisible();
  await expectHeaderFits(page);
  await appNavigation.getByRole('link', { name: 'غرفة الكشف' }).click();
  await expect(page).toHaveURL(/\/examination$/);
  await expect(page.getByRole('heading', { name: profiles.DOCTOR.heading })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('route guards return 403 for every cross-role dashboard pair', async ({ page }) => {
  const cases = [
    { role: 'DOCTOR', path: '/admin/staff' },
    { role: 'DOCTOR', path: '/admin/clinic-profile' },
    { role: 'DOCTOR', path: '/patients/new' },
    { role: 'RECEPTIONIST', path: '/examination' },
    { role: 'RECEPTIONIST', path: '/admin/staff' },
    { role: 'RECEPTIONIST', path: '/admin/clinic-profile' },
    { role: 'ADMIN', path: '/examination' },
    { role: 'ADMIN', path: '/patients/new' },
  ] as const;

  for (const { role, path } of cases) {
    await loginAs(page, role);
    await page.evaluate((target) => {
      window.history.pushState({}, '', target);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
    await expect(page.getByText('403')).toBeVisible();
    await logout(page);
  }
});

test('receptionist to doctor visit flow saves examination and appears in the patient history', async ({ page }) => {
  const patientName = 'رحلة العرض التجريبية';
  const diagnosis = 'تشخيص آلي تجريبي';
  const clinicName = `${demoSeed.clinicProfile.name} - نسخة اختبار`;
  const firstDoctor = demoSeed.doctors[0];
  const secondDoctor = demoSeed.doctors[1];
  const secondDoctorUser = demoSeed.users.find((user) => user.doctorId === secondDoctor.id)!;
  const secondDoctorVisit = demoSeed.visits.find((visit) => visit.doctorId === secondDoctor.id && visit.status === 'waiting')!;
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await loginAs(page, 'ADMIN');
  await clickMoreItem(page, 'بيانات العيادة');
  await page.getByLabel('اسم العيادة').fill(clinicName);
  await page.locator('input[type="file"]').setInputFiles({
    name: 'clinic-logo.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#0f7c82"/></svg>'),
  });
  await page.getByRole('button', { name: 'حفظ بيانات العيادة' }).click();
  await expect(page.getByText('تم حفظ بيانات العيادة.')).toBeVisible();
  await expect(page.getByRole('banner')).toContainText(clinicName);
  await expect(page.getByRole('banner').getByRole('img', { name: `شعار ${clinicName}` })).toBeVisible();
  await expect(page).toHaveTitle(`${clinicName} | CLINICXIA`);
  await logout(page);
  await page.getByRole('link', { name: 'العودة للصفحة الرئيسية' }).click();
  await expect(page.getByText(clinicName, { exact: true })).toBeVisible();
  await expect(page).toHaveTitle(`${clinicName} | CLINICXIA`);

  await page.locator('header').getByRole('link', { name: 'تسجيل الدخول' }).click();
  await page.getByRole('button', { name: profiles.RECEPTIONIST.button }).click();
  await expect(page.getByRole('heading', { name: profiles.RECEPTIONIST.heading })).toBeVisible();
  await page.getByRole('button', { name: 'مريض جديد' }).click();
  await page.getByRole('button', { name: 'تسجيل مريض جديد' }).click();
  await page.getByLabel('الاسم الكامل').fill(patientName);
  await page.getByLabel('رقم الهاتف').fill('01000000999');
  await page.getByRole('button', { name: 'حفظ المريض واختياره' }).click();
  await page.getByRole('button', { name: 'إدخال إلى الطابور الحي' }).click();
  await expect(page.getByRole('row', { name: new RegExp(patientName) })).toBeVisible();

  await logout(page);
  await loginAs(page, 'DOCTOR');
  await expect(page.getByText(patientName, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'بدء الكشف' }).last().click();
  await expect(page.getByRole('heading', { name: patientName })).toBeVisible();
  await page.getByLabel('الشكوى الرئيسية').fill('شكوى تجريبية لغرض اختبار الرحلة.');
  await page.getByLabel('الفحص السريري').fill('فحص تجريبي محفوظ عبر الـAPI.');
  await page.getByLabel('التشخيص الطبي السريري').fill(diagnosis);
  await page.getByLabel('خطة العلاج والملاحظات').fill('خطة علاج تجريبية للاختبار فقط.');
  await expect(page.getByText('المسودة محفوظة')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'اعتماد الكشف وإنهاؤه' }).click();
  await page.getByRole('button', { name: 'نعم، إنهاء الكشف' }).click();
  await expect(page.getByRole('button', { name: 'طباعة الروشتة الرسمية' })).toBeVisible();
  await page.getByRole('button', { name: 'طباعة الروشتة الرسمية' }).click();
  const firstPrescription = page.locator('.print-container');
  await expect(firstPrescription).toContainText(clinicName);
  await expect(firstPrescription).toContainText(firstDoctor.name);
  await page.getByRole('button', { name: 'إغلاق', exact: true }).click();
  await page.getByRole('button', { name: 'الرجوع للقائمة' }).click();

  await logout(page);
  await loginAs(page, 'RECEPTIONIST');
  await page.getByRole('link', { name: 'طابور اليوم' }).click();
  const visitRow = page.getByRole('row', { name: new RegExp(patientName) });
  await expect(visitRow).toContainText('مكتمل');
  await expect(visitRow).toContainText(diagnosis);
  await clickMoreItem(page, 'قاعدة المرضى');
  const patientRow = page.getByRole('row', { name: new RegExp(patientName) });
  await patientRow.getByRole('button', { name: 'عرض الملف' }).click();
  await expect(page.getByText(diagnosis, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'إغلاق', exact: true }).click();

  await logout(page);
  await loginWithCredentials(page, secondDoctorUser.username);
  await expect(page.getByText(secondDoctorVisit.patientName, { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: `إدخال (${secondDoctorVisit.patientName})` }).click();
  await expect(page.getByRole('heading', { name: secondDoctorVisit.patientName })).toBeVisible();
  await page.getByLabel('الشكوى الرئيسية').fill('شكوى توثيق للطبيب الثاني.');
  await page.getByLabel('الفحص السريري').fill('نتائج فحص توضيحية.');
  await page.getByLabel('التشخيص الطبي السريري').fill('تشخيص الزيارة الثانية.');
  await page.getByLabel('خطة العلاج والملاحظات').fill('خطة متابعة توضيحية.');
  await expect(page.getByText('المسودة محفوظة')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'اعتماد الكشف وإنهاؤه' }).click();
  await page.getByRole('button', { name: 'نعم، إنهاء الكشف' }).click();
  await page.getByRole('button', { name: 'طباعة الروشتة الرسمية' }).click();
  const secondPrescription = page.locator('.print-container');
  await expect(secondPrescription).toContainText(clinicName);
  await expect(secondPrescription).toContainText(secondDoctor.name);
  await expect(secondPrescription).not.toContainText(firstDoctor.name);
  await page.getByRole('button', { name: 'إغلاق', exact: true }).click();

  await logout(page);
  await loginAs(page, 'ADMIN');
  await page.getByRole('button', { name: 'إعادة ضبط بيانات العرض' }).click();
  await expect(page.getByText('تمت إعادة الضبط')).toBeVisible();
  await expect(page.getByRole('banner')).toContainText(demoSeed.clinicProfile.name);
  expect(consoleErrors).toEqual([]);
});

test('admin reset restores the central demo seed and tablet navigation stays horizontal', async ({ page }) => {
  await loginAs(page, 'ADMIN');
  await clickMoreItem(page, 'المرضى');
  await page.getByRole('button', { name: 'تسجيل مريض جديد' }).click();
  await page.getByLabel('الاسم بالكامل').fill('سجل مؤقت للعرض');
  await page.getByLabel('رقم الهاتف').fill('01000000888');
  await page.getByRole('button', { name: 'تسجيل المريض' }).click();
  await expect(page.getByRole('row', { name: /سجل مؤقت للعرض/ })).toBeVisible();
  await page.getByRole('button', { name: 'إعادة ضبط بيانات العرض' }).click();
  await expect(page.getByText('تمت إعادة الضبط')).toBeVisible();
  await expect(page.getByRole('row', { name: /سجل مؤقت للعرض/ })).toHaveCount(0);

  await page.setViewportSize({ width: 900, height: 1000 });
  await expect(page.locator('aside')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'فتح قائمة التنقل' })).toBeVisible();
  await page.getByRole('button', { name: 'فتح قائمة التنقل' }).click();
  await expect(page.getByRole('navigation', { name: 'التنقل الرئيسي' })).toBeVisible();
  await expect(page.locator('aside')).toHaveCount(0);
});

test('expired-session signal returns the user to login with a clear message', async ({ page }) => {
  await loginAs(page, 'DOCTOR');
  await page.evaluate(() => window.dispatchEvent(new Event('clinicxia:session-expired')));
  await expect(page).toHaveURL(/reason=session-expired/);
  await expect(page.getByRole('alert')).toContainText('انتهت صلاحية الجلسة');
});

test('welcome page shows a connection error and recovers after retry', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ملفات المرضى')).toBeVisible();
  await page.waitForTimeout(2100);
  await page.evaluate(() => {
    const browserWindow = window as Window & { __clinicxiaOriginalFetch?: typeof window.fetch };
    browserWindow.__clinicxiaOriginalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes('/api/public/summary')) throw new TypeError('Failed to fetch');
      return browserWindow.__clinicxiaOriginalFetch!(input, init);
    };
  });

  await page.locator('header').getByRole('link', { name: 'تسجيل الدخول' }).click();
  await page.getByRole('link', { name: 'العودة للصفحة الرئيسية' }).click();
  await expect(page.getByRole('alert')).toContainText('تعذر الاتصال بمصدر بيانات العيادة');

  await page.evaluate(() => {
    const browserWindow = window as Window & { __clinicxiaOriginalFetch?: typeof window.fetch };
    if (browserWindow.__clinicxiaOriginalFetch) window.fetch = browserWindow.__clinicxiaOriginalFetch;
  });
  await page.getByRole('button', { name: 'أعد المحاولة' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('ملفات المرضى')).toBeVisible();
});
