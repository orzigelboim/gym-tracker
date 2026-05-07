import React from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'icon'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-lime text-bg font-semibold hover:bg-lime-dim active:bg-lime-dim focus-visible:ring-2 focus-visible:ring-lime/50',
  ghost:
    'bg-transparent text-muted border border-transparent hover:border-border2 hover:text-text hover:bg-surface3 focus-visible:ring-2 focus-visible:ring-border2',
  danger:
    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 focus-visible:ring-2 focus-visible:ring-danger/50',
  icon: 'bg-transparent text-muted hover:text-text hover:bg-surface3 focus-visible:ring-2 focus-visible:ring-border2',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
}

const iconSizeClasses: Record<Size, string> = {
  sm: 'p-1.5 rounded-md',
  md: 'p-2 rounded-lg',
  lg: 'p-3 rounded-lg',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', className = '', children, ...props }, ref) => {
    const sizeClass =
      variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size]

    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:pointer-events-none',
          'outline-none',
          variantClasses[variant],
          sizeClass,
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
