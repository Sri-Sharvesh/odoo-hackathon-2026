import { useId, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends ComponentProps<'input'> {
  label?: string
  error?: string
  hint?: string
}

/**
 * Outlined text input with an accessible label, required indicator and inline error.
 * Wires up `id`/`aria-describedby`/`aria-invalid` automatically for screen readers.
 */
export function Input({
  id,
  label,
  error,
  hint,
  required,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-subtle transition-colors',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-foreground-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
