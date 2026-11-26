import {
  mockActivity,
  mockDoctors,
  mockPatients,
  mockVisits,
  mockUsers,
  mockClinicProfile,
  setMockClinicProfile,
  demoSeed,
  resetMockData,
} from './data';
import { ActivityEvent, ClinicProfileInput, CreatePatientInput, ExaminationData, QueueStatus } from '../../types';

const issuedTokens = new Map<string, string>();
let originalFetch: typeof window.fetch | undefined;

const jsonResponse = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

const today = () => new Date().toISOString().slice(0, 10);

function appendActivity(event: Omit<ActivityEvent, 'id' | 'createdAt'>) {
  mockActivity.unshift({ id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString(), ...event });
}

export function setupMockServer() {
  if (typeof window === 'undefined' || originalFetch) return;
  originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (!urlString.includes('/api/')) return originalFetch!(input, init);

    const url = new URL(urlString, window.location.origin);
    const pathname = url.pathname.replace(/^\/api/, '');
    const method = (init?.method || 'GET').toUpperCase();
    const body = () => JSON.parse((init?.body as string) || '{}');
    const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

    await new Promise((resolve) => setTimeout(resolve, 60));

    if (pathname === '/auth/login' && method === 'POST') {
      if (!demoMode) return jsonResponse({ message: 'البيانات التجريبية غير مفعّلة.' }, 503);
      const inputBody = body();
      const user = mockUsers.find((candidate) => candidate.username.toLowerCase() === inputBody.username?.trim().toLowerCase());
      if (!user || inputBody.password !== demoSeed.credentials.password) return jsonResponse({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, 401);
      const token = `mock-session-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      issuedTokens.set(token, user.id);
      return jsonResponse({ token, user });
    }

    if (pathname === '/clinic/profile' && method === 'GET') {
      if (!demoMode || !mockClinicProfile) return jsonResponse({ message: 'بيانات العيادة غير مُعدة.' }, 404);
      return jsonResponse(mockClinicProfile);
    }

    if (pathname === '/public/summary' && method === 'GET') {
      if (!demoMode) return jsonResponse({ totalPatients: 0, visitsToday: 0, completedExaminations: 0 });
      return jsonResponse({
        totalPatients: mockPatients.length,
        visitsToday: mockVisits.filter((visit) => visit.visitDate === today() && visit.status !== 'cancelled').length,
        completedExaminations: mockVisits.filter((visit) => visit.visitDate === today() && visit.examinationStatus === 'approved').length,
      });
    }

    const authorization = new Headers(init?.headers).get('Authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const currentUserId = issuedTokens.get(token);
    const currentUser = mockUsers.find((candidate) => candidate.id === currentUserId);
    if (!currentUser) return jsonResponse({ message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.' }, 401);

    if (pathname === '/auth/logout' && method === 'POST') {
      issuedTokens.delete(token);
      return jsonResponse({ message: 'تم تسجيل الخروج بنجاح' });
    }
    if (pathname === '/auth/me' && method === 'GET') return jsonResponse(currentUser);

    const isAdmin = currentUser.role === 'ADMIN';
    const isDoctor = currentUser.role === 'DOCTOR';
    const isReceptionist = currentUser.role === 'RECEPTIONIST';
    const deny = () => jsonResponse({ message: 'لا تملك الصلاحية لتنفيذ هذا الإجراء' }, 403);

    if (pathname.startsWith('/admin/') && !isAdmin) return deny();
    if (/^\/visits\/[^/]+\/(draft|approve|addendum)$/.test(pathname) && !isDoctor) return deny();
    if (pathname === '/voice/transcribe' && !isDoctor && !isAdmin) return deny();
    if (pathname === '/visits' && method === 'POST' && !isReceptionist && !isAdmin) return deny();
    if (/^\/patients(?:\/[^/]+)?$/.test(pathname) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !isReceptionist && !isAdmin) return deny();
    if (/^\/visits\/[^/]+\/status$/.test(pathname) && !isReceptionist && !isDoctor && !isAdmin) return deny();

    if (pathname === '/auth/change-password' && method === 'POST') {
      if (body().oldPassword !== demoSeed.credentials.password) return jsonResponse({ message: 'كلمة المرور الحالية غير صحيحة' }, 400);
      return jsonResponse({ message: 'تم تحديث كلمة المرور بنجاح' });
    }

    if (pathname === '/clinic/profile' && ['POST', 'PUT'].includes(method)) {
      if (!isAdmin) return deny();
      if (!demoMode) return jsonResponse({ message: 'لا يمكن تعديل بيانات العيادة في وضع الخادم التجريبي.' }, 403);
      const input = body() as ClinicProfileInput;
      const existing = mockClinicProfile;
      if (method === 'POST' && existing) return jsonResponse({ message: 'بيانات العيادة مُعدة بالفعل.' }, 409);
      if (method === 'PUT' && !existing) return jsonResponse({ message: 'بيانات العيادة غير مُعدة.' }, 404);
      if (!input.name?.trim() || !input.specialty?.trim() || !input.address?.trim() || !input.phoneNumbers?.length || !input.workingHours?.trim()) {
        return jsonResponse({ message: 'يرجى استكمال بيانات العيادة المطلوبة.' }, 400);
      }
      const profile = { ...input, logoUrl: input.logoUrl ?? existing?.logoUrl };
      setMockClinicProfile(profile);
      return jsonResponse(profile, method === 'POST' ? 201 : 200);
    }

    if (pathname === '/clinic/profile/logo' && method === 'POST') {
      if (!isAdmin) return deny();
      if (!demoMode) return jsonResponse({ message: 'وضع العرض التجريبي غير مفعّل.' }, 403);
      if (!mockClinicProfile) return jsonResponse({ message: 'احفظ بيانات العيادة أولاً.' }, 404);
      const formData = init?.body instanceof FormData ? init.body : null;
      const file = formData?.get('file');
      if (!(file instanceof File) || !file.type.startsWith('image/')) return jsonResponse({ message: 'يرجى اختيار ملف صورة صالح.' }, 400);
      const logoUrl = URL.createObjectURL(file);
      setMockClinicProfile({ ...mockClinicProfile, logoUrl });
      return jsonResponse({ logoUrl });
    }

    if (pathname === '/dashboard/summary' && method === 'GET') {
      const date = new Date(`${today()}T12:00:00`);
      const days = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(date);
        day.setDate(day.getDate() - (6 - index));
        const dateKey = day.toISOString().slice(0, 10);
        return {
          date: dateKey,
          label: day.toLocaleDateString('ar-EG', { weekday: 'short' }),
          count: mockVisits.filter((visit) => visit.visitDate === dateKey && visit.status !== 'cancelled').length,
        };
      });
      return jsonResponse({
        totalPatients: mockPatients.length,
        visitsToday: mockVisits.filter((visit) => visit.visitDate === today() && visit.status !== 'cancelled').length,
        waitingPatients: mockVisits.filter((visit) => visit.visitDate === today() && visit.status === 'waiting').length,
        completedExaminations: mockVisits.filter((visit) => visit.visitDate === today() && visit.examinationStatus === 'approved').length,
        doctorCount: mockDoctors.length,
        staffCount: mockUsers.filter((user) => user.role === 'RECEPTIONIST').length,
        visitsByDay: days,
        recentActivity: mockActivity.slice(0, 6),
      });
    }

    if (pathname === '/admin/users' && method === 'GET') return jsonResponse(mockUsers);
    if (pathname === '/admin/reset-demo' && method === 'POST') {
      if (!demoMode) return jsonResponse({ message: 'وضع العرض التجريبي غير مفعّل' }, 403);
      resetMockData();
      return jsonResponse({ message: 'تمت إعادة بيانات العرض إلى حالتها الأولى' });
    }

    if (pathname === '/doctors' && method === 'GET') return jsonResponse(demoMode ? mockDoctors : []);

    if (pathname === '/patients' && method === 'GET') {
      const query = url.searchParams.get('query')?.toLowerCase() || '';
      const list = mockPatients.filter((patient) => !query || patient.name.toLowerCase().includes(query) || patient.phone.includes(query) || patient.code.toLowerCase().includes(query));
      return jsonResponse({ items: list, total: list.length });
    }

    if (pathname === '/patients' && method === 'POST') {
      const input = body() as CreatePatientInput;
      const existing = mockPatients.find((patient) => patient.phone === input.phone);
      if (existing) return jsonResponse({ message: `رقم الهاتف مسجل بالفعل للمريض (${existing.name}) بكود ${existing.code}` }, 409);
      const birthYear = new Date(input.dateOfBirth).getFullYear();
      const patient = {
        id: `p-${Date.now()}`, code: `DEMO-${String(100 + mockPatients.length + 1).padStart(3, '0')}`,
        name: input.name, phone: input.phone, gender: input.gender, dateOfBirth: input.dateOfBirth,
        age: Number.isNaN(birthYear) ? undefined : new Date().getFullYear() - birthYear,
        drugAllergies: input.drugAllergies || [], chronicDiseases: input.chronicDiseases || [],
        lastVisitDate: undefined, visitCount: 0, createdAt: new Date().toISOString(),
      };
      mockPatients.unshift(patient);
      appendActivity({ type: 'patient_registered', description: 'تم تسجيل مريض', actorName: currentUser.fullName, patientName: patient.name });
      return jsonResponse(patient, 201);
    }

    const patientMatch = pathname.match(/^\/patients\/([^/]+)$/);
    if (patientMatch) {
      const patient = mockPatients.find((item) => item.id === patientMatch[1]);
      if (!patient) return jsonResponse({ message: 'المريض غير موجود' }, 404);
      if (method === 'GET') {
        const patientVisits = mockVisits.filter((visit) => visit.patientId === patient.id).map((visit) => ({
          id: visit.id, date: visit.visitDate, doctorName: visit.doctorName,
          diagnosis: visit.examination?.diagnosis || 'كشف قيد الانتظار', status: visit.status,
        }));
        return jsonResponse({ ...patient, visits: patientVisits });
      }
      if (method === 'PUT') {
        Object.assign(patient, body());
        return jsonResponse(patient);
      }
    }

    if (pathname === '/visits' && method === 'GET') {
      const doctorId = url.searchParams.get('doctorId');
      return jsonResponse(doctorId ? mockVisits.filter((visit) => visit.doctorId === doctorId) : mockVisits);
    }

    if (pathname === '/visits' && method === 'POST') {
      const input = body();
      const patient = mockPatients.find((item) => item.id === input.patientId);
      const doctor = mockDoctors.find((item) => item.id === input.doctorId);
      if (!patient || !doctor) return jsonResponse({ message: 'بيانات المريض أو الطبيب غير صحيحة' }, 400);
      patient.visitCount = (patient.visitCount || 0) + 1;
      patient.lastVisitDate = today();
      const now = new Date();
      const visit = {
        id: `v-${Date.now()}`, queueNumber: String(mockVisits.length + 1).padStart(2, '0'),
        patientId: patient.id, patientName: patient.name, patientPhone: patient.phone, patientCode: patient.code,
        patientGender: patient.gender, patientAge: patient.age, drugAllergies: patient.drugAllergies,
        chronicDiseases: patient.chronicDiseases, doctorId: doctor.id, doctorName: doctor.name,
        visitType: input.visitType || 'new', status: 'waiting' as const, examinationStatus: 'pending' as const,
        arrivalTime: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), visitDate: today(),
      };
      mockVisits.push(visit);
      appendActivity({ type: 'visit_created', description: 'تم تسجيل زيارة في الطابور', actorName: currentUser.fullName, patientName: patient.name });
      return jsonResponse(visit, 201);
    }

    const statusMatch = pathname.match(/^\/visits\/([^/]+)\/status$/);
    if (statusMatch && method === 'PATCH') {
      const visit = mockVisits.find((item) => item.id === statusMatch[1]);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);
      const status = body().status as QueueStatus;
      if (isDoctor && status !== 'in_consultation' && status !== 'completed') return deny();
      visit.status = status;
      if (status === 'in_consultation') appendActivity({ type: 'consultation_started', description: 'بدأ الكشف', actorName: currentUser.fullName, patientName: visit.patientName });
      if (status === 'completed') appendActivity({ type: 'visit_completed', description: 'اكتملت الزيارة', actorName: currentUser.fullName, patientName: visit.patientName });
      return jsonResponse(visit);
    }

    const draftMatch = pathname.match(/^\/visits\/([^/]+)\/draft$/);
    if (draftMatch && method === 'PUT') {
      const visit = mockVisits.find((item) => item.id === draftMatch[1]);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);
      if (visit.examinationStatus === 'approved') return jsonResponse({ message: 'هذا الكشف معتمد مسبقاً وغير قابل للتعديل المباشر' }, 403);
      visit.examination = { ...(body() as ExaminationData), updatedAt: new Date().toISOString() };
      visit.examinationStatus = 'draft';
      appendActivity({ type: 'draft_saved', description: 'تم حفظ مسودة الكشف', actorName: currentUser.fullName, patientName: visit.patientName });
      return jsonResponse(visit);
    }

    const approveMatch = pathname.match(/^\/visits\/([^/]+)\/approve$/);
    if (approveMatch && method === 'POST') {
      const visit = mockVisits.find((item) => item.id === approveMatch[1]);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);
      visit.examination = { ...(body() as ExaminationData), approvedAt: new Date().toISOString() };
      const approvedBy = mockDoctors.find((doctor) => doctor.id === currentUser.doctorId);
      visit.approvedByDoctorId = currentUser.doctorId;
      visit.approvedByName = currentUser.fullName;
      visit.approvedBySpecialty = approvedBy?.specialty;
      visit.examinationStatus = 'approved';
      visit.status = 'completed';
      appendActivity({ type: 'exam_approved', description: 'تم اعتماد الكشف وإنهاء الزيارة', actorName: currentUser.fullName, patientName: visit.patientName });
      return jsonResponse(visit);
    }

    const addendumMatch = pathname.match(/^\/visits\/([^/]+)\/addendum$/);
    if (addendumMatch && method === 'POST') {
      const visit = mockVisits.find((item) => item.id === addendumMatch[1]);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);
      const addendum = { id: `add-${Date.now()}`, note: body().note, authorName: currentUser.fullName, createdAt: new Date().toLocaleString('ar-EG') };
      visit.addenda = [...(visit.addenda || []), addendum];
      return jsonResponse(addendum, 201);
    }

    const visitMatch = pathname.match(/^\/visits\/([^/]+)$/);
    if (visitMatch && method === 'GET') {
      const visit = mockVisits.find((item) => item.id === visitMatch[1]);
      return visit ? jsonResponse(visit) : jsonResponse({ message: 'الكشف غير موجود' }, 404);
    }

    if (pathname === '/voice/transcribe' && method === 'POST') {
      return jsonResponse({ text: 'نص تفريغ توضيحي للبيانات التجريبية.', confidence: 0.96 });
    }

    return originalFetch!(input, init);
  };
}
