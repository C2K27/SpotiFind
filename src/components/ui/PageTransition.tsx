import { memo, type ReactNode } from 'react'
import styles from './PageTransition.module.css'

interface PageTransitionProps {
  pageKey: string
  children: ReactNode
}

function PageTransitionComponent({ pageKey, children }: PageTransitionProps) {
  return (
    <div key={pageKey} className={styles.page}>
      {children}
    </div>
  )
}

export const PageTransition = memo(PageTransitionComponent)
