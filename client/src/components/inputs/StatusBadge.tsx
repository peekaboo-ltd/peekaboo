import { Check, Circle, Clock3, LoaderCircle, X } from 'lucide-react';
import { capitalizeString } from '@/utils/strings.util';

type StatusMeaning = 'active' | 'completed' | 'pending' | 'failed' | 'inactive';

const completed = new Set(['COMPLETED', 'ACCEPTED', 'DELIVERED', 'PAID', 'PAYMENT_DEFERRED', 'SUCCESSFUL']);
const pending = new Set(['CONFIRMED', 'PENDING', 'WAITING', 'PROCESSING']);
const active = new Set(['IN_TRANSIT', 'IN_PROGRESS', 'ASSIGNED', 'ACTIVE']);
const failed = new Set(['CANCELLED', 'REJECTED', 'FAILED']);

const getMeaning = (status?: string): StatusMeaning => {
  if (!status) return 'inactive';
  if (completed.has(status)) return 'completed';
  if (pending.has(status)) return 'pending';
  if (active.has(status)) return 'active';
  if (failed.has(status)) return 'failed';
  return 'inactive';
};

const treatments = {
  active: { icon: LoaderCircle, className: 'border-transparent bg-(--ink) text-(--paper)' },
  completed: { icon: Check, className: 'border-(--ink) bg-transparent text-(--ink)' },
  pending: { icon: Clock3, className: 'border-dashed border-(--line-strong) bg-transparent text-(--muted)' },
  failed: { icon: X, className: 'border-(--ink) bg-transparent text-(--ink) line-through' },
  inactive: { icon: Circle, className: 'border-transparent bg-(--surface) text-(--muted)' },
};

export const StatusBadge = ({ status }: { status?: string }) => {
  const meaning = getMeaning(status);
  const treatment = treatments[meaning];
  const Icon = treatment.icon;

  return (
    <span className={`inline-flex h-6 w-fit items-center gap-1.5 rounded-(--radius-pill) border px-2.5 text-xs font-medium ${treatment.className}`}>
      <Icon className="size-3" aria-hidden="true" />
      {capitalizeString(status || 'inactive')}
    </span>
  );
};
