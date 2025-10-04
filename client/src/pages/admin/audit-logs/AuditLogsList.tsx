import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { DataTable } from '../../../components/tables/DataTable';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Filter, Download, Eye, Calendar } from 'lucide-react';
import { useAuditLogs } from '../../../hooks/audit/useAuditLogs';
import { AuditLogDetails } from '../../../components/audit/AuditLogDetails';
import type { Column } from '../../../types/table.types';
import type { AuditLog } from '../../../services/auditLog.service';
import { toast } from 'sonner';

const entityTypes = [
  { value: 'order', label: 'Order' },
  { value: 'user', label: 'User' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'orderActivity', label: 'Order Activity' },
  { value: 'role', label: 'Role' },
];

const actionTypes = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'status_change', label: 'Status Change' },
  { value: 'assignment_created', label: 'Assignment Created' },
  { value: 'assignment_accepted', label: 'Assignment Accepted' },
  { value: 'assignment_rejected', label: 'Assignment Rejected' },
  { value: 'assignment_completed', label: 'Assignment Completed' },
];

export const AuditLogsList: React.FC = () => {
  const [, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const {
    auditLogs,
    isLoading,
    pageCount,
    filters,
    setFilters,
  } = useAuditLogs();

  const columns: Column<AuditLog>[] = useMemo(() => [
    {
      id: 'action',
      header: 'Action',
      accessor: 'action',
      sortable: true,
      cell: ({ value }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {value}
        </Badge>
      ),
    },
    {
      id: 'entityType',
      header: 'Entity Type',
      accessor: 'entityType',
      sortable: true,
      cell: ({ value }) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      id: 'entityId',
      header: 'Entity ID',
      accessor: 'entityId',
      cell: ({ value }) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      id: 'user',
      header: 'User',
      accessor: (row) => row.user?.name || 'System',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.user?.name || 'System'}</p>
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
      sortable: true,
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
        const hasChanges = row.changes && 
          row.changes.before && 
          row.changes.after && 
          Object.keys(row.changes.before).length > 0 &&
          Object.keys(row.changes.after).length > 0;
        
        return (
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                {Object.keys(row.changes?.after || {}).length} changes
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLog(row);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], []);

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page: page + 1 });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ ...filters, limit: size, page: 1 });
  };

  const handleSearchChange = () => {
    const newFilters: Record<string, string | number | boolean> = { ...filters, page: 1 };

    if (entityTypeFilter && entityTypeFilter !== 'all') newFilters.entityType = entityTypeFilter;
    else delete newFilters.entityType;

    if (actionFilter && actionFilter !== 'all') newFilters.action = actionFilter;
    else delete newFilters.action;

    if (startDate) newFilters.startDate = startDate;
    else delete newFilters.startDate;

    if (endDate) newFilters.endDate = endDate;
    else delete newFilters.endDate;

    setFilters(newFilters);
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setEntityTypeFilter('all');
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
    setFilters({ page: 1, limit: filters.limit || 20 });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Entity Type</label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All entity types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entity types</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearchChange}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={auditLogs?.rows || []}
            columns={columns}
            pageCount={pageCount}
            pageIndex={(filters.page || 1) - 1}
            pageSize={filters.limit || 20}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
            emptyMessage="No audit logs found"
          />
        </CardContent>
      </Card>

      {/* Audit Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              View detailed information about this audit log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && <AuditLogDetails log={selectedLog} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};