import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Eye, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import auditLogService, { AuditLog } from '../../services/auditLog.service';
import { DataTable } from '../tables/DataTable';
import type { Column } from '../../types/table.types';
import { AuditLogDetailsModal } from './AuditLogDetailsModal';

interface AuditLogsSectionProps {
  entityType: string;
  entityId: string;
}

export const AuditLogsSection: React.FC<AuditLogsSectionProps> = ({
  entityType,
  entityId,
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    fetchAuditLogs();
  }, [entityType, entityId, page]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const response = await auditLogService.getAuditLogs({
        entityType,
        entityId,
        page: page + 1,
        limit: 10,
      });
      setAuditLogs(response.data);
      setPageCount(response.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      id: 'action',
      header: 'Action',
      accessor: 'action',
      cell: ({ value }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {value}
        </Badge>
      ),
    },
    {
      id: 'user',
      header: 'User',
      accessor: (row) => row.user?.name || 'System',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.user?.name || 'System'}</p>
          {row.user?.email && (
            <p className="text-xs text-muted-foreground">{row.user.email}</p>
          )}
        </div>
      ),
    },
    {
      id: 'timestamp',
      header: 'Timestamp',
      accessor: 'createdAt',
      cell: ({ value }) => (
        <span className="text-sm">
          {format(new Date(value), 'MMM dd, yyyy HH:mm:ss')}
        </span>
      ),
    },
    {
      id: 'details',
      header: 'Details',
      accessor: 'details',
      cell: ({ row }) => {
        const hasChanges = row.changes && Object.keys(row.changes).length > 0;
        return (
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                {Object.keys(row.changes.after).length} changes
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLog(row)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Track all changes and actions performed on this {entityType}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={auditLogs}
            columns={columns}
            pageCount={pageCount}
            pageIndex={page}
            pageSize={10}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyMessage="No audit logs found"
          />
        </CardContent>
      </Card>

      {selectedLog && (
        <AuditLogDetailsModal
          log={selectedLog}
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
};