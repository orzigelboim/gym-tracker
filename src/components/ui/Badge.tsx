import React from 'react'

type BadgeVariant = 'default' | 'pr' | 'day'

interface BadgeProps {
  variant?: BadgeVariant
  color?: string
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', color, children, className = '' }: BadgeProps) {
  let baseClasses = 'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full'

  let variantClasses = ''
  if (variant === 'default') {
    variantClasses = 'bg-surface3 text-muted'
  } else if (variant === 'pr') {
    variantClasses = 'bg-gold/20 text-gold border border-gold/30'
  } else if (variant === 'day') {
    // color passed as inline style hex
    variantClasses = 'text-white'
  }

  const style: React.CSSProperties =
    variant === 'day' && color
      ? { backgroundColor: `${color}33`, color, borderColor: `${color}66`, borderWidth: 1 }
      : {}

  return (
    <span
      className={[baseClasses, variantClasses, className].join(' ')}
      style={style}
    >
      {children}
    </span>
  )
}
