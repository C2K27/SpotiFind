import { memo } from 'react'
import { cn } from '../../lib/cn'
import styles from './Badge.module.css'

type BadgeVariant = 'beta' | 'internal' | 'explicit'

interface BadgeProps {
  variant: BadgeVariant
  className?: string
  label?: string
}

function BadgeComponent({ variant, className, label }: BadgeProps) {
  const text =
    label ??
    (variant === 'beta'
      ? 'Beta'
      : variant === 'internal'
        ? 'Internal'
        : 'E')

  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {text}
    </span>
  )
}

export const Badge = memo(BadgeComponent)
