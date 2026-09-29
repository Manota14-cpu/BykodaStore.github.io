import { useToastStore } from '@/store/toast';
import { cn } from '@/lib/cn';

export function Toast() {
  const { message, type } = useToastStore();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[3000] flex justify-center px-4 md:bottom-8"
    >
      {message && (
        <div
          className={cn(
            'pointer-events-auto max-w-[min(28rem,100%)] rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md',
            'animate-[toast-in_0.3s_var(--ease-suave)]',
            type === 'error' && 'border-alerta/50 bg-alerta/15 text-ink',
            type === 'success' && 'border-exito/50 bg-exito/15 text-ink',
            type === 'default' && 'border-line bg-surface/95 text-ink',
          )}
        >
          {message}
        </div>
      )}
    </div>
  );
}
