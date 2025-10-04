import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import auditLogService, { AuditLogFilters, AuditLogsResponse } from '../../services/auditLog.service';
import type { AuditLog } from '../../services/auditLog.service';

interface UseAuditLogsResult {
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  pageCount: number;
  filters: AuditLogFilters;
  setFilters: (filters: AuditLogFilters) => void;
  refetch: () => Promise<void>;
}

export const useAuditLogs = (initialFilters: AuditLogFilters = {}): UseAuditLogsResult => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: AuditLogsResponse = await auditLogService.getAuditLogs(filters);
      setAuditLogs(response.data);
      setPageCount(response.totalPages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch audit logs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return {
    auditLogs,
    isLoading,
    error,
    pageCount,
    filters,
    setFilters,
    refetch: fetchAuditLogs,
  };
};