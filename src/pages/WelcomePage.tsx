import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowLeft, ArrowUpLeft, ClipboardCheck, ClipboardPlus, FileHeart,
  ShieldCheck, Stethoscope, UsersRound,
} from 'lucide-react';
import { dashboardApi } from '../api';
import { ClinicIdentity } from '../components/ui/ClinicIdentity';
import { useClinic } from '../features/clinic/ClinicContext';

const roles = [
  { role: 'DOCTOR', title: 'Doctor Dashboard', arabic: 'الطبيب', description: 'غرفة كشف متكاملة، توثيق ذكي، ووصفة طبية محفوظة.', icon: Stethoscope, color: 'text-cyan-800 bg-cyan-50' },
  { role: 'RECEPTIONIST', title: 'Reception Dashboard', arabic: 'الاستقبال', description: 'تسجيل المريض، تنظيم الطابور، ومتابعة الزيارة.', icon: ClipboardPlus, color: 'text-teal-800 bg-teal-50' },
  { role: 'ADMIN', title: 'Admin Dashboard', arabic: 'الإدارة', description: 'رؤية موحدة لنشاط العيادة وفريق العمل.', icon: ShieldCheck, color: 'text-indigo-800 bg-indigo-50' },
];

const workflow = [
  { title: 'استقبال منظّم', description: 'تسجيل الملف والزيارة في الطابور من قاعدة موحدة.', icon: UsersRound },
  { title: 'رعاية مترابطة', description: 'يرى الطبيب حالة المريض وتنبيهاته وتاريخه الطبي.', icon: FileHeart },
  { title: 'توثيق آمن', description: 'حفظ المسودة واعتماد الكشف وتحديث سجل الزيارة.', icon: ClipboardCheck },
];

function Count({ value, loading }: { value?: number; loading: boolean }) {
  return <span className="font-mono text-lg font-black text-clinic-navy" dir="ltr">{loading ? '···' : (value ?? 0).toLocaleString('ar-EG')}</span>;
}

function LandingStats({ data, isLoading, isError, onRetry }: {
  data?: Awaited<ReturnType<typeof dashboardApi.getPublicSummary>>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isError) return <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">تعذر الاتصال بمصدر بيانات العيادة. <button type="button" onClick={onRetry} className="font-bold underline">أعد المحاولة</button></div>;

  return <div>
    <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-200">
      <div className="px-3 first:pe-0"><Count value={data?.totalPatients} loading={isLoading} /><p className="mt-1 text-[10px] font-semibold text-slate-500 sm:text-xs">ملفات المرضى</p></div>
      <div className="px-3"><Count value={data?.visitsToday} loading={isLoading} /><p className="mt-1 text-[10px] font-semibold text-slate-500 sm:text-xs">زيارات اليوم</p></div>
      <div className="px-3 last:ps-0"><Count value={data?.completedExaminations} loading={isLoading} /><p className="mt-1 text-[10px] font-semibold text-slate-500 sm:text-xs">كشوفات مكتملة</p></div>
    </div>
    {!isLoading && data && data.totalPatients === 0 && data.visitsToday === 0 && <p className="mt-3 text-[10px] text-slate-500">سيظهر نشاط العيادة هنا عند تسجيل البيانات.</p>}
  </div>;
}

function HeroImage() {
  return <div className="relative mx-auto w-full max-w-[570px] px-1 py-4 sm:px-6 sm:py-8">
    <div aria-hidden="true" className="absolute inset-x-8 bottom-6 top-8 rounded-[42%] bg-gradient-to-br from-cyan-100 via-sky-50 to-teal-100" />
    <div className="relative overflow-hidden rounded-[1.75rem] border-[6px] border-white bg-white shadow-[0_28px_60px_-20px_rgba(11,37,69,0.38)] sm:rounded-[2rem] sm:border-[9px]">
      <img
        src="/doctor-hero.jpg"
        alt="طبيب داخل عيادة، صورة توضيحية"
        fetchPriority="high"
        className="aspect-[4/3] w-full object-cover object-center"
      />
    </div>
    <div className="absolute bottom-0 end-0 flex items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur sm:bottom-1 sm:end-1 sm:px-4 sm:py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-clinic-teal"><Stethoscope size={18} aria-hidden="true" /></span>
      <div><p className="text-[10px] font-black text-clinic-navy sm:text-xs">منظومة واحدة</p><p className="text-[9px] text-slate-500 sm:text-[10px]">لفريق الرعاية بالكامل</p></div>
    </div>
  </div>;
}

export function WelcomePage() {
  const { profile } = useClinic();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-clinic-summary'],
    queryFn: dashboardApi.getPublicSummary,
    retry: 0,
  });

  return <main id="top" dir="rtl" className="min-h-screen overflow-hidden bg-white text-right text-slate-800">
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <a href="#top" aria-label="CLINICXIA - الرئيسية" className="flex shrink-0 items-center gap-3">
          <ClinicIdentity variant="icon-only" size="md" showSubtitle={false} showClinicName={false} className="sm:hidden" />
          <ClinicIdentity size="md" showSubtitle={false} clinicNameClassName="hidden sm:inline" className="hidden sm:flex" />
        </a>
        <Link to="/login" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-clinic-navy px-3 py-2.5 text-xs font-black text-clinic-navy transition hover:bg-clinic-navy hover:text-white sm:px-5 sm:text-sm">
          تسجيل الدخول <ArrowLeft size={15} aria-hidden="true" />
        </Link>
      </div>
    </header>

    <section aria-labelledby="welcome-title" className="relative mx-auto grid max-w-7xl items-center gap-2 px-4 pb-9 pt-5 sm:px-8 sm:pb-14 sm:pt-10 lg:min-h-[600px] lg:grid-cols-[1.05fr_.95fr] lg:gap-0 lg:pb-14 lg:pt-8">
      <div aria-hidden="true" className="pointer-events-none absolute -end-48 top-20 h-96 w-96 rounded-full bg-cyan-50 blur-3xl" />
      <div className="relative z-10 order-1 py-4 lg:order-2 lg:py-0">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50/80 px-3.5 py-2 text-xs font-bold text-teal-900">
          <span className="h-2 w-2 rounded-full bg-clinic-teal" /> أهلاً بكم{profile?.name ? ` في ${profile.name}` : ' في CLINICXIA'}
        </span>
        <h1 id="welcome-title" className="mt-6 max-w-2xl text-[2.35rem] font-black leading-[1.25] tracking-tight text-clinic-navy sm:text-5xl lg:text-[3.65rem]">
          إدارة أذكى..<br /><span className="text-clinic-teal">رعاية طبية أفضل.</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
          نظام واحد يربط فريق الاستقبال بالطبيب والملفات الطبية؛ لتظل رحلة المريض واضحة من التسجيل وحتى توثيق الزيارة.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-clinic-navy px-5 py-3 text-sm font-black text-white shadow-lg shadow-clinic-navy/15 transition hover:-translate-y-0.5 hover:bg-clinic-teal">
            ابدأ استخدام النظام <ArrowLeft size={17} aria-hidden="true" />
          </Link>
          <a href="#workspaces" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-clinic-navy">
            تعرّف على مساحات العمل <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="mt-8 max-w-lg border-t border-slate-200 pt-5">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400">منظومة موحدة لفريق العيادة</p>
          <LandingStats data={data} isLoading={isLoading} isError={isError} onRetry={() => void refetch()} />
        </div>
      </div>
      <div className="relative order-2 lg:order-1">
        <HeroImage />
      </div>
    </section>

    <section aria-label="مزايا المنصة" className="mx-auto max-w-7xl px-4 pb-10 sm:px-8 sm:pb-16">
      <div className="grid overflow-hidden rounded-3xl border border-cyan-100 bg-[#f2f7ff] sm:grid-cols-3">
        {workflow.map(({ title, description, icon: Icon }, index) => <article key={title} className={`flex items-start gap-4 px-5 py-5 sm:px-6 sm:py-7 ${index ? 'border-t border-slate-200 sm:border-t-0 sm:border-e' : ''}`}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-clinic-teal shadow-sm"><Icon size={22} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-black text-clinic-navy">{title}</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p></div>
        </article>)}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-11 sm:px-8 sm:pb-16">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-clinic-teal">رحلة مترابطة</p>
        <h2 className="text-xl font-black text-clinic-navy sm:text-2xl">كل خطوة تكمل ما بعدها</h2>
        <p className="mx-auto max-w-xl text-xs leading-6 text-slate-500">تصل بيانات الزيارة لفريق الرعاية عبر مصدر واحد، مع توثيق انتقالها بين الاستقبال والطبيب.</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-600 sm:gap-3">
        {['تسجيل المريض', 'الانتظار', 'بدء الكشف', 'التشخيص والعلاج', 'إنهاء الزيارة', 'حفظ التاريخ'].map((step, index) => <div key={step} className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-xs">{step}</span>
          {index < 5 && <ArrowUpLeft size={14} className="text-clinic-teal" aria-hidden="true" />}
        </div>)}
      </div>
    </section>

    <section id="workspaces" className="scroll-mt-24 border-t border-slate-100 bg-slate-50/70 py-11 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[.22em] text-clinic-teal">CLINICXIA WORKSPACES</p><h2 className="mt-1.5 text-xl font-black text-clinic-navy sm:text-2xl">لكل فريق مساحة عمل تناسب دوره</h2></div>
          <p className="max-w-md text-xs leading-5 text-slate-500">اختر مساحة للدخول؛ هذا الاختيار يجهز نموذج الدخول فقط، بينما يحدد الحساب الموثق صلاحيات المستخدم.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {roles.map(({ role, title, arabic, description, icon: Icon, color }) => <article key={role} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}><Icon size={23} aria-hidden="true" /></span>
              <span className="font-mono text-[10px] font-bold tracking-wider text-slate-300" dir="ltr">{role}</span>
            </div>
            <h3 className="mt-4 text-base font-black text-clinic-navy">{arabic}</h3>
            <p className="mt-1 text-[10px] font-semibold text-slate-400" dir="ltr">{title}</p>
            <p className="mt-3 min-h-10 text-xs leading-5 text-slate-500">{description}</p>
            <Link aria-label={`دخول ${arabic}`} to={`/login?role=${role}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-clinic-navy transition group-hover:border-clinic-navy group-hover:bg-clinic-navy group-hover:text-white">
              الدخول إلى مساحة العمل <ArrowLeft size={14} aria-hidden="true" />
            </Link>
          </article>)}
        </div>
      </div>
    </section>

    <footer className="border-t border-slate-200 bg-white px-4 py-5 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2"><span>CLINICXIA{profile?.name ? ` · ${profile.name}` : ''}</span></div>
        <p>منظومة موحدة لإدارة الزيارات وتوثيق الرعاية الطبية.</p>
        <Link to="/login" className="font-bold text-clinic-teal hover:underline">تسجيل الدخول</Link>
      </div>
    </footer>
  </main>;
}
