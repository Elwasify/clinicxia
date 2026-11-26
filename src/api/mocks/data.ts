import { ActivityEvent, Doctor, Patient, User, Visit } from '../../types';

const today = () => new Date().toISOString().slice(0, 10);
const timeAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const clone = <T,>(value: T): T => structuredClone(value);

// A single synthetic seed feeds every screen when VITE_USE_MOCKS is enabled.
// All patient names, phone numbers, and records below are fabricated for demos.
export const demoSeed = {
  users: [
    { id: 'u-doctor', username: 'doctor.demo', fullName: 'أ.د. عفيفي فهمي', role: 'DOCTOR' as const, doctorId: 'doc-1' },
    { id: 'u-reception', username: 'reception.demo', fullName: 'موظف الاستقبال التجريبي', role: 'RECEPTIONIST' as const },
    { id: 'u-admin', username: 'admin.demo', fullName: 'مدير العيادة التجريبي', role: 'ADMIN' as const },
  ] satisfies User[],
  doctors: [
    { id: 'doc-1', name: 'أ.د. عفيفي فهمي', title: 'طبيب العيادة', specialty: 'الأمراض الباطنية', availableToday: true },
    { id: 'doc-2', name: 'د. طبيب العرض الثاني', title: 'طبيب تجريبي', specialty: 'باطنة عامة', availableToday: true },
  ] satisfies Doctor[],
  patients: [
    { id: 'p-demo-1', code: 'DEMO-001', name: 'سليم مثال تجريبي', phone: '01000000001', gender: 'male', dateOfBirth: '1982-05-14', age: 44, drugAllergies: ['بنسلين (Penicillin)'], chronicDiseases: ['ارتفاع ضغط الدم'], lastVisitDate: today(), visitCount: 3, createdAt: timeAgo(120) },
    { id: 'p-demo-2', code: 'DEMO-002', name: 'ليلى بيانات تجريبية', phone: '01000000002', gender: 'female', dateOfBirth: '1990-03-08', age: 36, drugAllergies: [], chronicDiseases: ['سكري من النوع الثاني'], lastVisitDate: today(), visitCount: 2, createdAt: timeAgo(90) },
    { id: 'p-demo-3', code: 'DEMO-003', name: 'مروان نموذج تجريبي', phone: '01000000003', gender: 'male', dateOfBirth: '1975-11-20', age: 51, drugAllergies: ['سلفا (Sulfonamides)'], chronicDiseases: [], lastVisitDate: today(), visitCount: 1, createdAt: timeAgo(70) },
    { id: 'p-demo-4', code: 'DEMO-004', name: 'نور حالة تجريبية', phone: '01000000004', gender: 'female', dateOfBirth: '1995-12-05', age: 31, drugAllergies: [], chronicDiseases: [], lastVisitDate: today(), visitCount: 1, createdAt: timeAgo(45) },
  ] satisfies Patient[],
  visits: [
    {
      id: 'v-demo-1', queueNumber: '01', patientId: 'p-demo-1', patientName: 'سليم مثال تجريبي', patientPhone: '01000000001', patientCode: 'DEMO-001', patientGender: 'male', patientAge: 44,
      drugAllergies: ['بنسلين (Penicillin)'], chronicDiseases: ['ارتفاع ضغط الدم'], doctorId: 'doc-1', doctorName: 'أ.د. عفيفي فهمي', visitType: 'follow_up', status: 'in_consultation', examinationStatus: 'draft', arrivalTime: '09:15 ص', visitDate: today(),
      examination: { chiefComplaint: 'بيانات توضيحية لشكوى المريض التجريبي.', clinicalExamination: 'فحص تجريبي لأغراض العرض فقط.', diagnosis: 'تشخيص تجريبي غير حقيقي', treatmentPlan: 'خطة علاج توضيحية فقط.', prescription: [], updatedAt: timeAgo(15) },
    },
    {
      id: 'v-demo-2', queueNumber: '02', patientId: 'p-demo-2', patientName: 'ليلى بيانات تجريبية', patientPhone: '01000000002', patientCode: 'DEMO-002', patientGender: 'female', patientAge: 36,
      drugAllergies: [], chronicDiseases: ['سكري من النوع الثاني'], doctorId: 'doc-1', doctorName: 'أ.د. عفيفي فهمي', visitType: 'consultation', status: 'waiting', examinationStatus: 'pending', arrivalTime: '09:40 ص', visitDate: today(),
    },
    {
      id: 'v-demo-3', queueNumber: '03', patientId: 'p-demo-3', patientName: 'مروان نموذج تجريبي', patientPhone: '01000000003', patientCode: 'DEMO-003', patientGender: 'male', patientAge: 51,
      drugAllergies: ['سلفا (Sulfonamides)'], chronicDiseases: [], doctorId: 'doc-2', doctorName: 'د. طبيب العرض الثاني', visitType: 'new', status: 'waiting', examinationStatus: 'pending', arrivalTime: '10:05 ص', visitDate: today(),
    },
    {
      id: 'v-demo-4', queueNumber: '04', patientId: 'p-demo-4', patientName: 'نور حالة تجريبية', patientPhone: '01000000004', patientCode: 'DEMO-004', patientGender: 'female', patientAge: 31,
      drugAllergies: [], chronicDiseases: [], doctorId: 'doc-1', doctorName: 'أ.د. عفيفي فهمي', visitType: 'new', status: 'completed', examinationStatus: 'approved', arrivalTime: '08:30 ص', visitDate: today(),
      examination: { chiefComplaint: 'فحص تجريبي.', clinicalExamination: 'معلومات صحية تجريبية.', diagnosis: 'حالة تجريبية سليمة', treatmentPlan: 'لا توجد خطة علاج فعلية.', prescription: [], updatedAt: timeAgo(40), approvedAt: timeAgo(38) },
    },
  ] satisfies Visit[],
  activity: [
    { id: 'event-demo-1', type: 'exam_approved', description: 'تم اعتماد كشف تجريبي', actorName: 'أ.د. عفيفي فهمي', patientName: 'نور حالة تجريبية', createdAt: timeAgo(38) },
    { id: 'event-demo-2', type: 'consultation_started', description: 'بدأ كشف تجريبي', actorName: 'أ.د. عفيفي فهمي', patientName: 'سليم مثال تجريبي', createdAt: timeAgo(30) },
    { id: 'event-demo-3', type: 'visit_created', description: 'سُجلت زيارة تجريبية', actorName: 'موظف الاستقبال التجريبي', patientName: 'ليلى بيانات تجريبية', createdAt: timeAgo(25) },
    { id: 'event-demo-4', type: 'patient_registered', description: 'سُجل ملف مريض تجريبي', actorName: 'موظف الاستقبال التجريبي', patientName: 'مروان نموذج تجريبي', createdAt: timeAgo(20) },
  ] satisfies ActivityEvent[],
};

export const mockUsers: User[] = clone(demoSeed.users);
export const mockDoctors: Doctor[] = clone(demoSeed.doctors);
export const mockPatients: Patient[] = clone(demoSeed.patients);
export const mockVisits: Visit[] = clone(demoSeed.visits);
export const mockActivity: ActivityEvent[] = clone(demoSeed.activity);

export function resetMockData() {
  mockUsers.splice(0, mockUsers.length, ...clone(demoSeed.users));
  mockDoctors.splice(0, mockDoctors.length, ...clone(demoSeed.doctors));
  mockPatients.splice(0, mockPatients.length, ...clone(demoSeed.patients));
  mockVisits.splice(0, mockVisits.length, ...clone(demoSeed.visits));
  mockActivity.splice(0, mockActivity.length, ...clone(demoSeed.activity));
}
