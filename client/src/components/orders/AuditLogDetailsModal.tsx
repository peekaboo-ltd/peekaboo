import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import type { AuditLog } from '../../services/auditLog.service';

interface AuditLogDetailsModalProps {
  log: AuditLog;
  open: boolean;
  onClose: () => void;
}

export const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  log,
  open,
  onClose,
}) => {
  const renderJsonDiff = () => {
    if (!log.changes || !log.changes.before || !log.changes.after) {
      return null;
    }

    const allKeys = new Set([
      ...Object.keys(log.changes.before),
      ...Object.keys(log.changes.after),
    ]);

    return (
      <div className="space-y-2">
        {Array.from(allKeys).map((key) => {
          const before = log.changes.before[key];
          const after = log.changes.after[key];
          const changed = JSON.stringify(before) !== JSON.stringify(after);

          if (!changed) return null;

          return (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium">{key}:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-red-50 p-2">
                  <p className="text-xs text-red-600">Before</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(before, null, 2)}
                  </pre>
                </div>
                <div className="rounded-md bg-green-50 p-2">
                  <p className="text-xs text-green-600">After</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(after, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            View detailed information about this audit log entry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Action</p>
              <Badge variant="outline" className="mt-1">
                {log.action}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
              <p className="text-sm mt-1">
                {format(new Date(log.createdAt), 'PPpp')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
              <p className="text-sm mt-1">{log.entityType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
              <p className="text-sm font-mono mt-1">{log.entityId}</p>
            </div>
          </div>

          {/* User Information */}
          {log.user && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Performed By</h4>
                <div className="space-y-1">
                  <p className="text-sm">{log.user.name}</p>
                  <p className="text-sm text-muted-foreground">{log.user.email}</p>
                </div>
              </div>
            </>
          )}

          {/* Changes */}
          {log.changes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Changes</h4>
                {renderJsonDiff()}
              </div>
            </>
          )}

          {/* Additional Details */}
          {log.details && Object.keys(log.details).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                <pre className="text-xs bg-gray-50 rounded-md p-3 overflow-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};