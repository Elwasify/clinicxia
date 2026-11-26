import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { setupMockServer } from './api/mocks/handlers';
import { ClinicProvider } from './features/clinic/ClinicContext';
import { registerAuthCacheCleanup, useAuthStore } from './features/auth/useAuthStore';
import { setOnUnauthorized } from './api/client';
import '@fontsource-variable/cairo';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/material-symbols-outlined';
import './styles/index.css';

// Initialize mock server in dev/test when enabled
if (import.meta.env.VITE_USE_MOCKS === 'true') {
  setupMockServer();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

registerAuthCacheCleanup(() => queryClient.clear());
setOnUnauthorized(() => {
  useAuthStore.getState().logout();
  window.dispatchEvent(new Event('clinicxia:session-expired'));
});

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ClinicProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ClinicProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
