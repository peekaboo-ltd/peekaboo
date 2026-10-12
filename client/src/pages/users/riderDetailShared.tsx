import Button from '@/components/inputs/Button';
import { LoadingItem } from '@/components/ui/loading-item';
import { InternalPage } from '@/components/layout/InternalPage';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRiderManagementBack = () => {
  const navigate = useNavigate();

  return useCallback(() => {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }
    navigate('/rider-management');
  }, [navigate]);
};

export const RiderDetailFallback = ({
  loading,
  message,
  backLabel,
  onBack,
}: {
  loading?: boolean;
  message: string;
  backLabel: string;
  onBack: () => void;
}) => {
  if (loading) {
    return (
      <InternalPage className="min-h-[50vh] items-center justify-center">
        <LoadingItem title={message} />
      </InternalPage>
    );
  }

  return (
    <InternalPage>
      <p className="text-sm text-(--muted)">{message}</p>
      <menu className="flex items-center gap-3">
        <Button type="button" onClick={onBack}>
          {backLabel}
        </Button>
      </menu>
    </InternalPage>
  );
};
