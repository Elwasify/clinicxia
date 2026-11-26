import { Role } from '../../types';

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const DEMO_PASSWORD = '123456';

export const demoAccounts: { role: Role; label: string; username: string }[] = [
  { role: 'DOCTOR', label: 'الطبيب', username: 'doctor.demo' },
  { role: 'RECEPTIONIST', label: 'الاستقبال', username: 'reception.demo' },
  { role: 'ADMIN', label: 'المدير', username: 'admin.demo' },
];
