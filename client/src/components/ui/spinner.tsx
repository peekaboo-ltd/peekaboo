import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'size-4 animate-spin rounded-full border-[0.125rem] border-current border-t-transparent motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
