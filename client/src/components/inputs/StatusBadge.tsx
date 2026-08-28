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

// Only the two terminal states are colored. In-flight and pending work has not
// resolved into anything yet, so it stays monochrome — that is what makes a
// green or red row in a long table worth looking at. Every treatment keeps its
// icon: color is never the only thing carrying the meaning.
const treatments = {
  active: { icon: LoaderCircle, className: 'invert-surface border-transparent' },
  completed: { icon: Check, className: 'border-(--approve-line) bg-(--approve-surface) text-(--approve)' },
  pending: { icon: Clock3, className: 'border-dashed border-(--line-strong) bg-transparent text-(--muted)' },
  failed: { icon: X, className: 'border-(--danger-line) bg-(--danger-surface) text-(--danger)' },
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
