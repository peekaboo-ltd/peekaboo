import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

export type StepState = 'done' | 'current' | 'upcoming';

export interface TrailStep {
  key: string;
  label: string;
  description?: string;
  icon?: IconProp;
  /** Already formatted for display — this component does no date work. */
  timestamp?: string;
  state: StepState;
}

interface StepTrailProps {
  steps: TrailStep[];
  /** Accessible name for the ordered list. */
  label: string;
  className?: string;
}

/**
 * One ordered sequence of milestones, used by order tracking and by both
 * payment outcome screens. Those four screens each carried their own rail —
 * two of them inside the same file, one for mobile and one for desktop, with
 * the step-state logic written twice.
 *
 * It is vertical at every width on purpose. A horizontal rail cannot show a
 * description or a timestamp without truncating them, which is most of what a
 * person tracking a delivery came to read.
 *
 * State is carried by fill, by border style, and by the glyph — never by
 * colour alone — so it reads the same in greyscale.
 */
const StepTrail = ({ steps, label, className }: StepTrailProps) => (
  <ol className={cn('relative flex flex-col', className)} aria-label={label}>
    {steps.map((step, index) => {
      const isLast = index === steps.length - 1;
      const done = step.state === 'done';
      const current = step.state === 'current';

      return (
        <li key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
          {/* Connector runs between markers, not behind them. */}
          {!isLast && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-4 top-9 -ml-px h-[calc(100%-1.75rem)] w-px',
                done ? 'bg-(--ink)' : 'bg-(--line)'
              )}
            />
          )}

          <span
            aria-hidden="true"
            className={cn(
              'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-(--radius-pill) border bg-(--paper)',
              current && 'border-(--ink) bg-(--ink) text-(--paper)',
              done && 'border-(--ink) text-(--ink)',
              !done && !current && 'border-dashed border-(--line-strong) text-(--muted)'
            )}
          >
            {/* A check on a step that has not happened yet reads as done.
                Anything still ahead falls back to a neutral dot. */}
            <FontAwesomeIcon
              icon={done ? faCheck : (step.icon ?? faCircle)}
              className={done || current ? 'size-3.5' : 'size-2'}
            />
          </span>

          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  'type-label',
                  !done && !current && 'font-normal text-(--muted)'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="type-meta mt-0.5">{step.description}</p>
              )}
            </div>

            <div className="shrink-0 text-right">
              {current && (
                <span className="invert-surface inline-flex h-6 items-center rounded-(--radius-pill) px-2.5 text-xs font-medium">
                  Now
                </span>
              )}
              {step.timestamp && (
                <time className="type-meta mt-1 block">{step.timestamp}</time>
              )}
            </div>
          </div>
        </li>
      );
    })}
  </ol>
);

export default StepTrail;
