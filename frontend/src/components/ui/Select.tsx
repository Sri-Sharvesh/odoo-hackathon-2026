import { ChevronDown } from 'lucide-react'
import { useId, type ComponentProps } from 'react'
import type { Option } from '@/types/common'
import { cn } from '@/utils/cn'

export interface SelectProps extends Omit<ComponentProps<'select'>, 'children'> {
  label?: string
  error?: string
  hint?: string
  options: Option[]
  placeholder?: string
}

/** Outlined native select with the same label/error/hint contract as `Input`. */
export function Select({
  id,
  label,
  error,
  hint,
  required,
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const describedBy = error
    ? `${selectId}-error`
    : hint
      ? `${selectId}-hint`
      : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-9 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-8 text-sm text-slate-900 transition-colors',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
