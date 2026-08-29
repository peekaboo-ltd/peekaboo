import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import type { AuditLog } from '@/services/auditLog.service';
import { useI18n } from '@/i18n/i18n';

interface AuditLogDetailsProps {
  log: AuditLog;
}

export const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ log }) => {
  const { t } = useI18n();
  const renderJsonDiff = () => {
    if (!log.changes || !log.changes.before || !log.changes.after) {
      return null;
    }

    const allKeys = new Set([
      ...Object.keys(log.changes.before),
      ...Object.keys(log.changes.after),
    ]);

    return (
      <div className="space-y-4">
        {Array.from(allKeys).map((key) => {
          const before = log.changes.before[key];
          const after = log.changes.after[key];
          const changed = JSON.stringify(before) !== JSON.stringify(after);

          if (!changed) return null;

          return (
            <div key={key} className="space-y-2">
              <h5 className="text-sm font-normal capitalize">
                {key.replace(/_/g, ' ')}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-(--surface) p-3">
                  <p className="text-xs font-normal text-(--ink) mb-1">{t('audit.before')}</p>
                  <pre className="text-xs text-(--ink) overflow-auto whitespace-pre-wrap">
                    {typeof before === 'object' 
                      ? JSON.stringify(before, null, 2)
                      : String(before ?? 'null')}
                  </pre>
                </div>
                <div className="rounded-md bg-(--surface) p-3">
                  <p className="text-xs font-normal text-(--ink) mb-1">{t('audit.after')}</p>
                  <pre className="text-xs text-(--ink) overflow-auto whitespace-pre-wrap">
                    {typeof after === 'object'
                      ? JSON.stringify(after, null, 2)
                      : String(after ?? 'null')}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetails = () => {
    if (!log.details || Object.keys(log.details).length === 0) {
      return null;
    }

    return (
      <div className="rounded-md bg-(--surface) p-4">
        <pre className="text-xs overflow-auto whitespace-pre-wrap">
          {JSON.stringify(log.details, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('audit.information')}</CardTitle>
          <CardDescription>
            {t('audit.informationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-normal text-muted-foreground">{t('audit.action')}</p>
              <Badge variant="outline" className="mt-1">
                {log.action}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-normal text-muted-foreground">{t('audit.timestamp')}</p>
              <p className="text-sm mt-1">
                {format(new Date(log.createdAt), 'PPpp')}
              </p>
            </div>
            <div>
              <p className="text-sm font-normal text-muted-foreground">{t('audit.entityType')}</p>
              <p className="text-sm mt-1 capitalize">{log.entityType}</p>
            </div>
            <div>
              <p className="text-sm font-normal text-muted-foreground">{t('audit.entityId')}</p>
              <p className="text-sm mt-1">{log.entityId}</p>
            </div>
          </div>

          {/* User Information */}
          {log.user && (
            <>
              <Separator />
              <div>
                <h4 className="type-label mb-2">{t('audit.performedBy')}</h4>
                <div className="space-y-1">
                  <p className="text-sm">{log.user.name}</p>
                  <p className="text-sm text-muted-foreground">{log.user.email}</p>
                  <p className="text-sm text-muted-foreground">ID: {log.userId}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Changes */}
      {log.changes && (
        <Card>
          <CardHeader>
            <CardTitle>{t('audit.changes')}</CardTitle>
            <CardDescription>
              {t('audit.changesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderJsonDiff()}
          </CardContent>
        </Card>
      )}

      {/* Additional Details */}
      {log.details && Object.keys(log.details).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('audit.additionalDetails')}</CardTitle>
            <CardDescription>
              {t('audit.additionalDetailsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderDetails()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
