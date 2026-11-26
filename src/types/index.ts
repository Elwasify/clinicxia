export type Role = 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  doctorId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  availableToday: boolean;
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  phone: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  age?: number;
  drugAllergies: string[];
  chronicDiseases: string[];
  lastVisitDate?: string;
  visitCount?: number;
  createdAt?: string;
}

export interface CreatePatientInput {
  name: string;
  phone: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  drugAllergies: string[];
  chronicDiseases: string[];
}

export type QueueStatus = 'waiting' | 'in_consultation' | 'completed' | 'cancelled';
export type VisitType = 'new' | 'follow_up' | 'consultation';
export type ExaminationStatus = 'pending' | 'draft' | 'approved';

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ExaminationData {
  chiefComplaint: string;
  clinicalExamination: string;
  diagnosis: string;
  treatmentPlan: string;
  followUpDate?: string;
  additionalNotes?: string;
  prescription: PrescriptionItem[];
  updatedAt?: string;
  approvedAt?: string;
}

export interface Addendum {
  id: string;
  note: string;
  authorName: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  queueNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientCode: string;
  patientGender: 'male' | 'female';
  patientAge?: number;
  drugAllergies: string[];
  chronicDiseases: string[];
  doctorId: string;
  doctorName: string;
  visitType: VisitType;
  status: QueueStatus;
  examinationStatus: ExaminationStatus;
  arrivalTime: string;
  visitDate: string;
  examination?: ExaminationData;
  addenda?: Addendum[];
}

export interface ActivityEvent {
  id: string;
  type: 'patient_registered' | 'visit_created' | 'consultation_started' | 'draft_saved' | 'exam_approved' | 'visit_completed';
  description: string;
  actorName: string;
  patientName?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalPatients: number;
  visitsToday: number;
  waitingPatients: number;
  completedExaminations: number;
  doctorCount: number;
  staffCount: number;
  visitsByDay: { date: string; label: string; count: number }[];
  recentActivity: ActivityEvent[];
}

export interface QueueCounters {
  totalToday: number;
  waiting: number;
  inConsultation: number;
  completed: number;
}

export interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}
