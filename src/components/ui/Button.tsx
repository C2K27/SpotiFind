import { memo, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'surface' | 'ghost'
type Size = 'md' | 'sm' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

function ButtonComponent({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        styles.button,
        styles[variant],
        size === 'sm' && styles.sm,
        size === 'icon' && styles.iconOnly,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const Button = memo(ButtonComponent)
