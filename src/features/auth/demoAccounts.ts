import { Role } from '../../types';
import { demoSeed } from '../../api/mocks/data';

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const DEMO_PASSWORD = demoSeed.credentials.password;

const labelByRole: Record<Role, string> = { DOCTOR: 'الطبيب', RECEPTIONIST: 'الاستقبال', ADMIN: 'المدير' };
export const demoAccounts = (['DOCTOR', 'RECEPTIONIST', 'ADMIN'] as Role[]).map((role) => ({
  role,
  username: demoSeed.users.find((user) => user.role === role)!.username,
  label: labelByRole[role],
}));
