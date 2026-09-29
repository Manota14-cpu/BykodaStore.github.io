import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-6 animate-spin rounded-full border-2 border-line border-t-ink',
        className,
      )}
    />
  );
}
