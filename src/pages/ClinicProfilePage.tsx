import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicProfileInput } from '../types';
import { useClinic } from '../features/clinic/ClinicContext';
import { Button } from '../components/ui/Button';

export function ClinicProfilePage() {
  const { profile, isLoading, isError, isNotFound, error, refetch, saveProfile, uploadLogo } = useClinic();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setSpecialty(profile.specialty);
    setAddress(profile.address);
    setPhoneNumbers(profile.phoneNumbers.join(', '));
    setWorkingHours(profile.workingHours);
  }, [profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstRun = !profile;
    const payload: ClinicProfileInput = {
      name: name.trim(),
      specialty: specialty.trim(),
      address: address.trim(),
      phoneNumbers: phoneNumbers.split(/[\n,،]+/).map((phone) => phone.trim()).filter(Boolean),
      workingHours: workingHours.trim(),
    };
    setFormError('');
    setSuccess('');
    setSaving(true);
    try {
      await saveProfile(payload);
      if (logoFile) await uploadLogo(logoFile);
      await refetch();
      setLogoFile(null);
      setSuccess('تم حفظ بيانات العيادة.');
      if (firstRun) navigate('/', { replace: true });
    } catch (saveError) {
      setFormError((saveError as { message?: string }).message || 'تعذر حفظ بيانات العيادة. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">جارٍ تحميل بيانات العيادة…</div>;
  if (isError && !isNotFound) return <section className="rounded-2xl border border-amber-200 bg-white p-8 text-center"><p role="alert" className="text-sm text-amber-900">{error?.message || 'تعذر تحميل بيانات العيادة.'}</p><button type="button" onClick={() => void refetch()} className="mt-4 font-bold text-clinic-teal underline">إعادة المحاولة</button></section>;

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8">
      <header className="mb-7 border-b border-slate-100 pb-5">
        <p className="text-xs font-black text-clinic-teal">إعدادات المنشأة</p>
        <h1 className="mt-1 text-2xl font-black text-clinic-navy">{profile ? 'بيانات العيادة' : 'إعداد العيادة لأول مرة'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">أدخل بيانات التواصل وساعات العمل التي ستظهر في النظام والمستندات المطبوعة.</p>
      </header>

      {formError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
      {success && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700 sm:col-span-2">
          اسم العيادة
          <input required value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal focus-visible:outline-3 focus-visible:outline-clinic-teal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
          التخصص أو التخصصات
          <input required value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal focus-visible:outline-3 focus-visible:outline-clinic-teal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
          العنوان
          <input required value={address} onChange={(event) => setAddress(event.target.value)} className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal focus-visible:outline-3 focus-visible:outline-clinic-teal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
          أرقام التواصل
          <input required value={phoneNumbers} onChange={(event) => setPhoneNumbers(event.target.value)} placeholder="افصل بين الأرقام بفاصلة" className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal focus-visible:outline-3 focus-visible:outline-clinic-teal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
          ساعات العمل
          <input required value={workingHours} onChange={(event) => setWorkingHours(event.target.value)} className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal focus-visible:outline-3 focus-visible:outline-clinic-teal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700 sm:col-span-2">
          شعار العيادة (اختياري)
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-normal file:me-3 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:font-bold file:text-clinic-teal" />
          {profile?.logoUrl && !logoFile && <img src={profile.logoUrl} alt={profile.name ? `شعار ${profile.name}` : 'شعار العيادة'} className="mt-2 h-16 max-w-48 rounded-xl border border-slate-200 bg-white p-2 object-contain" />}
          {logoFile && <span className="text-xs font-normal text-slate-500">{logoFile.name}</span>}
        </label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
          <Button type="submit" variant="teal" size="md" isLoading={saving}>حفظ بيانات العيادة</Button>
        </div>
      </form>
    </section>
  );
}
