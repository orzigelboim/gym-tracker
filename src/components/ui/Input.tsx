import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg px-3 py-2 text-sm',
            'bg-surface2 border border-border2 text-text',
            'placeholder:text-muted2',
            'transition-colors duration-150',
            'focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20',
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-muted2">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
