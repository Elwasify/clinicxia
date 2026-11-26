import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicApi } from '../../api';
import { ApiError, ClinicProfile, ClinicProfileInput } from '../../types';

const clinicProfileKey = ['clinic-profile'] as const;

interface ClinicContextValue {
  profile: ClinicProfile | null;
  isLoading: boolean;
  isError: boolean;
  isNotFound: boolean;
  error?: ApiError;
  refetch: () => Promise<unknown>;
  saveProfile: (data: ClinicProfileInput) => Promise<ClinicProfile>;
  uploadLogo: (file: File) => Promise<ClinicProfile>;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: clinicProfileKey,
    queryFn: clinicApi.getProfile,
    retry: (failureCount, error) => (error as ApiError).status !== 404 && failureCount < 1,
  });

  useEffect(() => {
    document.title = query.data?.name
      ? `${query.data.name} | CLINICXIA`
      : 'CLINICXIA | نظام إدارة العيادات';
  }, [query.data?.name]);

  const saveProfile = useCallback(async (data: ClinicProfileInput) => {
    const existing = query.data ?? queryClient.getQueryData<ClinicProfile>(clinicProfileKey);
    const payload = { ...data, logoUrl: data.logoUrl ?? existing?.logoUrl };
    const profile = existing
      ? await clinicApi.updateProfile(payload)
      : await clinicApi.createProfile(payload);
    queryClient.setQueryData(clinicProfileKey, profile);
    return profile;
  }, [query.data, queryClient]);

  const uploadLogo = useCallback(async (file: File) => {
    const existing = queryClient.getQueryData<ClinicProfile>(clinicProfileKey);
    if (!existing) throw new Error('احفظ بيانات العيادة أولاً قبل رفع الشعار.');
    const { logoUrl } = await clinicApi.uploadLogo(file);
    const profile = { ...existing, logoUrl };
    queryClient.setQueryData(clinicProfileKey, profile);
    return profile;
  }, [queryClient]);

  const error = query.error as ApiError | null;
  const value = useMemo<ClinicContextValue>(() => ({
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    isNotFound: error?.status === 404,
    error: error ?? undefined,
    refetch: query.refetch,
    saveProfile,
    uploadLogo,
  }), [query.data, query.isLoading, query.isError, query.refetch, error, saveProfile, uploadLogo]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within ClinicProvider');
  return context;
}
