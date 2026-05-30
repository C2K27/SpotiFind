import { memo, type CSSProperties } from 'react'
import { cn } from '../../lib/cn'
import styles from './AlbumArt.module.css'

type Size = 'sm' | 'md' | 'lg'

interface AlbumArtProps {
  hue: number
  title: string
  size?: Size
  className?: string
}

function AlbumArtComponent({
  hue,
  title,
  size = 'md',
  className,
}: AlbumArtProps) {
  return (
    <div
      className={cn(styles.art, styles[size], className)}
      style={{ '--hue': hue } as CSSProperties}
      role="img"
      aria-label={`Album art for ${title}`}
    >
      <div className={styles.gradient} />
    </div>
  )
}

export const AlbumArt = memo(AlbumArtComponent)
