import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const control = [
  'w-full rounded-lg border border-line bg-hover/40 px-3.5 py-3 text-sm text-ink',
  'transition-colors duration-200 placeholder:text-ink-3',
  'focus:border-line-strong focus:bg-hover focus:outline-none',
  'aria-invalid:border-alerta',
].join(' ');

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(control, 'cursor-pointer', className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(control, 'resize-y', className)} {...props} />;
  },
);

/** Etiqueta + control + mensaje de error, con los ids ya conectados. */
export function Field({
  id,
  label,
  error,
  requerido = false,
  ayuda,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  requerido?: boolean;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid content-start gap-1.5', className)}>
      <label htmlFor={id} className="eyebrow tracking-[0.11em]">
        {label}
        {requerido && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {ayuda && !error && <p className="text-xs text-ink-3">{ayuda}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-alerta">
          {error}
        </p>
      )}
    </div>
  );
}
