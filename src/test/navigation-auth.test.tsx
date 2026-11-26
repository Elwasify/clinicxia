import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { DemoLogin } from '../features/auth/DemoLogin';
import { useAuthStore } from '../features/auth/useAuthStore';
import { mockUsers } from '../api/mocks/data';

describe('role navigation and demo access', () => {
  beforeEach(() => useAuthStore.getState().logout());

  it('renders role navigation and closes its dropdown with Escape', () => {
    useAuthStore.getState().login(mockUsers[2], 'admin-test-token');
    render(<MemoryRouter initialEntries={['/patients']}><Navigation /></MemoryRouter>);

    const more = screen.getByRole('button', { name: /المزيد/ });
    fireEvent.click(more);
    const patientsLink = screen.getByRole('menuitem', { name: /المرضى/ });
    expect(patientsLink).toHaveAttribute('aria-current', 'page');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders the authenticated user in the responsive header without a sidebar', () => {
    useAuthStore.getState().login(mockUsers[1], 'reception-test-token');
    const { container } = render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText(mockUsers[1].fullName)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'فتح قائمة التنقل' })).toBeInTheDocument();
    expect(container.querySelector('aside')).toBeNull();
  });

  it('shows a 403 screen when an authenticated role opens a restricted route', () => {
    useAuthStore.getState().login(mockUsers[0], 'doctor-test-token');
    render(
      <MemoryRouter initialEntries={['/admin/staff']}>
        <Routes>
          <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['ADMIN']}><div>سجلات الإدارة</div></ProtectedRoute>} />
          <Route path="/login" element={<div>تسجيل الدخول</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.queryByText('سجلات الإدارة')).not.toBeInTheDocument();
  });

  it('submits demo buttons through the supplied authentication callback', () => {
    const onLogin = vi.fn();
    render(<DemoLogin enabled loading={false} onLogin={onLogin} />);
    fireEvent.click(screen.getByRole('button', { name: 'دخول كـ المدير' }));
    expect(onLogin).toHaveBeenCalledWith('admin.demo', '123456');
  });
});
