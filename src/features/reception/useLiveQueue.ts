import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsApi } from '../../api';
import { QueueCounters, QueueStatus, Visit } from '../../types';

export function useLiveQueue(doctorId?: string) {
  const queryClient = useQueryClient();

  const {
    data: visits = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['visits', doctorId],
    queryFn: () => visitsApi.getQueue(doctorId),
    // Polling interval for live sync across local network
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueStatus }) =>
      visitsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: visitsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  // Calculate live counters
  const counters: QueueCounters = {
    totalToday: visits.length,
    waiting: visits.filter((v: Visit) => v.status === 'waiting').length,
    inConsultation: visits.filter((v: Visit) => v.status === 'in_consultation').length,
    completed: visits.filter((v: Visit) => v.status === 'completed').length,
  };

  return {
    visits,
    counters,
    isLoading,
    isError,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    createVisit: createVisitMutation.mutateAsync,
    isCreating: createVisitMutation.isPending,
  };
}
