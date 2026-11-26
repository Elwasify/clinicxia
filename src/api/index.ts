import { apiClient } from './client';
import {
  AuthResponse,
  ClinicProfile,
  ClinicProfileInput,
  CreatePatientInput,
  DashboardSummary,
  Doctor,
  ExaminationData,
  Patient,
  QueueStatus,
  User,
  Visit,
} from '../types';

export const authApi = {
  login: (data: { username: string; password: string }) =>
    apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => apiClient<User>('/auth/me'),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
};

export const doctorsApi = {
  list: () => apiClient<Doctor[]>('/doctors'),
};

export const clinicApi = {
  getProfile: () => apiClient<ClinicProfile>('/clinic/profile'),

  createProfile: (data: ClinicProfileInput) =>
    apiClient<ClinicProfile>('/clinic/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProfile: (data: ClinicProfileInput) =>
    apiClient<ClinicProfile>('/clinic/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<{ logoUrl: string }>('/clinic/profile/logo', {
      method: 'POST',
      body: formData,
    });
  },
};

export const dashboardApi = {
  getSummary: () => apiClient<DashboardSummary>('/dashboard/summary'),
  getPublicSummary: () => apiClient<Pick<DashboardSummary, 'totalPatients' | 'visitsToday' | 'completedExaminations'>>('/public/summary'),
};

export const adminApi = {
  listUsers: () => apiClient<User[]>('/admin/users'),
  resetDemo: () => apiClient<{ message: string }>('/admin/reset-demo', { method: 'POST' }),
};

export const patientsApi = {
  list: (query = '', page = 1) =>
    apiClient<{ items: Patient[]; total: number }>(
      `/patients?query=${encodeURIComponent(query)}&page=${page}`
    ),

  getById: (id: string) => apiClient<Patient & { visits?: { id: string; date: string; doctorName: string; diagnosis: string; status: string }[] }>(`/patients/${id}`),

  create: (data: CreatePatientInput) =>
    apiClient<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreatePatientInput>) =>
    apiClient<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const visitsApi = {
  getQueue: (doctorId?: string) =>
    apiClient<Visit[]>(`/visits${doctorId ? `?doctorId=${doctorId}` : ''}`),

  getById: (id: string) => apiClient<Visit>(`/visits/${id}`),

  create: (data: { patientId: string; doctorId: string; visitType: string }) =>
    apiClient<Visit>('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: QueueStatus) =>
    apiClient<Visit>(`/visits/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  saveDraft: (id: string, data: ExaminationData) =>
    apiClient<Visit>(`/visits/${id}/draft`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  approve: (id: string, data: ExaminationData) =>
    apiClient<Visit>(`/visits/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addAddendum: (id: string, note: string) =>
    apiClient<{ id: string; note: string; authorName: string; createdAt: string }>(
      `/visits/${id}/addendum`,
      {
        method: 'POST',
        body: JSON.stringify({ note }),
      }
    ),
};

export const voiceApi = {
  transcribe: async (audioBlob: Blob, language: 'ar-EG' | 'en-US') => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', language);

    return apiClient<{ text: string; confidence: number }>('/voice/transcribe', {
      method: 'POST',
      body: formData,
    });
  },
};
