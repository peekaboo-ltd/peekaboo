import { useState, useCallback, useEffect } from 'react';
import { auditLogService, AuditLogFilters, AuditLog } from '../../services/auditLog.service';
import { toast } from 'sonner';

interface UseAuditLogsResult {
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  total: number;
  pageCount: number;
  filters: AuditLogFilters;
  setFilters: (filters: AuditLogFilters) => void;
  refetch: () => Promise<void>;
}

export const useAuditLogs = (initialFilters: AuditLogFilters = {}): UseAuditLogsResult => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 10,
    ...initialFilters
  });

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await auditLogService.getAuditLogs(filters);
      setAuditLogs(response.data);
      setTotal(response.total);
      setPageCount(response.totalPages);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch audit logs');
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
    total,
    pageCount,
    filters,
    setFilters,
    refetch: fetchAuditLogs
  };
};

// Hook for entity-specific audit logs
export const useEntityAuditLogs = (entityType: string, entityId: string): UseAuditLogsResult => {
  return useAuditLogs({
    entityType,
    entityId
  });
};

// Hook for single audit log
interface UseAuditLogResult {
  auditLog: AuditLog | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAuditLog = (auditLogId: string): UseAuditLogResult => {
  const [auditLog, setAuditLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(async () => {
    if (!auditLogId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const log = await auditLogService.getAuditLogById(auditLogId);
      setAuditLog(log);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to fetch audit log');
    } finally {
      setIsLoading(false);
    }
  }, [auditLogId]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  return {
    auditLog,
    isLoading,
    error,
    refetch: fetchAuditLog
  };
};