import { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { DemoTour } from './DemoTour';
import { LayoutContext } from './LayoutContext';
import { ToastContainer } from '../ui/Toast';

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [focusMode, setFocusMode] = useState(false);
  return (
    <LayoutContext.Provider value={{ focusMode, setFocusMode }}>
      <div dir="rtl" className="min-h-screen bg-clinic-bg text-right text-slate-800">
        <Header focusMode={focusMode} />
        {!focusMode && <DemoTour />}
        <main className={`mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 ${focusMode ? 'py-4 sm:py-5' : 'py-6 sm:py-8 lg:py-10'}`}>
          {children || <Outlet />}
        </main>
        <ToastContainer />
      </div>
    </LayoutContext.Provider>
  );
}
