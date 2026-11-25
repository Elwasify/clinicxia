import {
  mockDoctors,
  mockPatients,
  mockVisits,
  mockUsers,
} from './data';
import { CreatePatientInput, ExaminationData, QueueStatus } from '../../types';

export function setupMockServer() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Only intercept /api calls if mock is enabled
    if (!urlString.includes('/api/')) {
      return originalFetch(input, init);
    }

    const url = new URL(urlString, window.location.origin);
    const pathname = url.pathname.replace(/^\/api/, '');
    const method = (init?.method || 'GET').toUpperCase();

    // Helper for JSON responses
    const jsonResponse = (data: unknown, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    // Small simulated network latency
    await new Promise((r) => setTimeout(r, 60));

    // 1. Auth: /auth/login
    if (pathname === '/auth/login' && method === 'POST') {
      const body = JSON.parse((init?.body as string) || '{}');
      const user = mockUsers.find(
        (u) => u.username.toLowerCase() === body.username?.trim().toLowerCase()
      );

      if (user && body.password === '123456') {
        return jsonResponse({
          token: `mock-jwt-token-${user.id}-${Date.now()}`,
          user,
        });
      }

      return jsonResponse({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, 401);
    }

    // 2. Auth: /auth/me
    if (pathname === '/auth/me' && method === 'GET') {
      const authHeader = (init?.headers as Record<string, string>)?.[
        'Authorization'
      ] || '';
      if (!authHeader.startsWith('Bearer ')) {
        return jsonResponse({ message: 'غير مصرح به' }, 401);
      }
      return jsonResponse(mockUsers[0]);
    }

    // 3. Auth: /auth/change-password
    if (pathname === '/auth/change-password' && method === 'POST') {
      const body = JSON.parse((init?.body as string) || '{}');
      if (body.oldPassword !== '123456') {
        return jsonResponse({ message: 'كلمة المرور الحالية غير صحيحة' }, 400);
      }
      return jsonResponse({ message: 'تم تحديث كلمة المرور بنجاح' });
    }

    // 4. Doctors: /doctors
    if (pathname === '/doctors' && method === 'GET') {
      return jsonResponse(mockDoctors);
    }

    // 5. Patients: /patients
    if (pathname === '/patients' && method === 'GET') {
      const query = url.searchParams.get('query')?.toLowerCase() || '';
      let list = [...mockPatients];
      if (query) {
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.phone.includes(query) ||
            p.code.toLowerCase().includes(query)
        );
      }
      return jsonResponse({ items: list, total: list.length });
    }

    // Patients: create
    if (pathname === '/patients' && method === 'POST') {
      const inputData = JSON.parse((init?.body as string) || '{}') as CreatePatientInput;

      // Duplicate detection warning (same phone)
      const existing = mockPatients.find((p) => p.phone === inputData.phone);
      if (existing) {
        return jsonResponse(
          {
            message: `رقم الهاتف مسجل بالفعل للمريض (${existing.name}) بكود ${existing.code}`,
          },
          409
        );
      }

      const birthYear = new Date(inputData.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = !isNaN(birthYear) ? currentYear - birthYear : undefined;

      const newPatient = {
        id: `p-${Date.now()}`,
        code: `CX-${1040 + mockPatients.length + 1}`,
        name: inputData.name,
        phone: inputData.phone,
        gender: inputData.gender,
        dateOfBirth: inputData.dateOfBirth,
        age,
        drugAllergies: inputData.drugAllergies || [],
        chronicDiseases: inputData.chronicDiseases || [],
        lastVisitDate: '-',
        visitCount: 0,
      };

      mockPatients.unshift(newPatient);
      return jsonResponse(newPatient, 201);
    }

    // Patients: by ID
    const patientMatch = pathname.match(/^\/patients\/([^/]+)$/);
    if (patientMatch) {
      const pId = patientMatch[1];
      const patient = mockPatients.find((p) => p.id === pId);
      if (!patient) return jsonResponse({ message: 'المريض غير موجود' }, 404);

      if (method === 'GET') {
        const patientVisits = mockVisits
          .filter((v) => v.patientId === pId)
          .map((v) => ({
            id: v.id,
            date: v.examination?.updatedAt?.split('T')[0] || '2026-09-26',
            doctorName: v.doctorName,
            diagnosis: v.examination?.diagnosis || 'كشف قيد الانتظار',
            status: v.status,
          }));

        return jsonResponse({ ...patient, visits: patientVisits });
      }

      if (method === 'PUT') {
        const updates = JSON.parse((init?.body as string) || '{}');
        Object.assign(patient, updates);
        return jsonResponse(patient);
      }
    }

    // 6. Visits: /visits
    if (pathname === '/visits' && method === 'GET') {
      const doctorId = url.searchParams.get('doctorId');
      let visits = [...mockVisits];
      if (doctorId) {
        visits = visits.filter((v) => v.doctorId === doctorId);
      }
      return jsonResponse(visits);
    }

    // Visits: create new visit in queue
    if (pathname === '/visits' && method === 'POST') {
      const body = JSON.parse((init?.body as string) || '{}');
      const patient = mockPatients.find((p) => p.id === body.patientId);
      const doctor = mockDoctors.find((d) => d.id === body.doctorId);

      if (!patient || !doctor) {
        return jsonResponse({ message: 'بيانات المريض أو الطبيب غير صحيحة' }, 400);
      }

      patient.visitCount = (patient.visitCount || 0) + 1;
      patient.lastVisitDate = new Date().toISOString().split('T')[0];

      const queueNumber = String(mockVisits.length + 1).padStart(2, '0');
      const now = new Date();
      const arrivalTime = now.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const newVisit = {
        id: `v-${Date.now()}`,
        queueNumber,
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientCode: patient.code,
        patientGender: patient.gender,
        patientAge: patient.age,
        drugAllergies: patient.drugAllergies,
        chronicDiseases: patient.chronicDiseases,
        doctorId: doctor.id,
        doctorName: doctor.name,
        visitType: body.visitType || 'new',
        status: 'waiting' as QueueStatus,
        examinationStatus: 'pending' as const,
        arrivalTime,
        examination: {
          chiefComplaint: '',
          clinicalExamination: '',
          diagnosis: '',
          treatmentPlan: '',
          prescription: [],
        },
      };

      mockVisits.push(newVisit);
      return jsonResponse(newVisit, 201);
    }

    // Visits: /visits/:id/status
    const statusMatch = pathname.match(/^\/visits\/([^/]+)\/status$/);
    if (statusMatch && method === 'PATCH') {
      const visitId = statusMatch[1];
      const body = JSON.parse((init?.body as string) || '{}');
      const visit = mockVisits.find((v) => v.id === visitId);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);

      visit.status = body.status;
      return jsonResponse(visit);
    }

    // Visits: /visits/:id/draft
    const draftMatch = pathname.match(/^\/visits\/([^/]+)\/draft$/);
    if (draftMatch && method === 'PUT') {
      const visitId = draftMatch[1];
      const examData = JSON.parse((init?.body as string) || '{}') as ExaminationData;
      const visit = mockVisits.find((v) => v.id === visitId);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);

      if (visit.examinationStatus === 'approved') {
        return jsonResponse(
          { message: 'هذا الكشف معتمد مسبقاً وغير قابل للتعديل المباشر' },
          403
        );
      }

      visit.examination = {
        ...examData,
        updatedAt: new Date().toISOString(),
      };
      visit.examinationStatus = 'draft';
      return jsonResponse(visit);
    }

    // Visits: /visits/:id/approve
    const approveMatch = pathname.match(/^\/visits\/([^/]+)\/approve$/);
    if (approveMatch && method === 'POST') {
      const visitId = approveMatch[1];
      const examData = JSON.parse((init?.body as string) || '{}') as ExaminationData;
      const visit = mockVisits.find((v) => v.id === visitId);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);

      visit.examination = {
        ...examData,
        approvedAt: new Date().toISOString(),
      };
      visit.examinationStatus = 'approved';
      visit.status = 'completed';
      return jsonResponse(visit);
    }

    // Visits: /visits/:id/addendum
    const addendumMatch = pathname.match(/^\/visits\/([^/]+)\/addendum$/);
    if (addendumMatch && method === 'POST') {
      const visitId = addendumMatch[1];
      const body = JSON.parse((init?.body as string) || '{}');
      const visit = mockVisits.find((v) => v.id === visitId);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);

      const addendum = {
        id: `add-${Date.now()}`,
        note: body.note,
        authorName: 'أ.د. عفيفي فهمي عفيفي أحمد',
        createdAt: new Date().toLocaleString('ar-EG'),
      };

      if (!visit.addenda) visit.addenda = [];
      visit.addenda.push(addendum);
      return jsonResponse(addendum, 201);
    }

    // Visits: by ID
    const singleVisitMatch = pathname.match(/^\/visits\/([^/]+)$/);
    if (singleVisitMatch && method === 'GET') {
      const visitId = singleVisitMatch[1];
      const visit = mockVisits.find((v) => v.id === visitId);
      if (!visit) return jsonResponse({ message: 'الكشف غير موجود' }, 404);
      return jsonResponse(visit);
    }

    // 7. Voice Transcription: /voice/transcribe
    if (pathname === '/voice/transcribe' && method === 'POST') {
      // Mock transcription response
      return jsonResponse({
        text: 'يعاني المريض من تقلصات متكررة في المعدة مع شعور بالغثيان بعد الأكل.',
        confidence: 0.96,
      });
    }

    return originalFetch(input, init);
  };
}
