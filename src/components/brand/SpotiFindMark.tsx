import { memo } from 'react'
import { cn } from '../../lib/cn'

interface SpotiFindMarkProps {
  className?: string
}

function SpotiFindMarkComponent({ className }: SpotiFindMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <circle cx="14.5" cy="13" r="8.5" stroke="#1DB954" strokeWidth="2.8" fill="none" />
      <path
        d="M8.5 18.5 L5 22"
        stroke="#1DB954"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="14.5" cy="13" r="5" fill="#1DB954" />
      <path
        d="M10.5 11.5 C12 11 17 11 18.5 11.5"
        stroke="#0a0a0a"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M11.2 13 C12.3 12.5 16.7 12.5 17.8 13"
        stroke="#0a0a0a"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 14.5 C12.7 14.2 16.3 14.2 17 14.5"
        stroke="#0a0a0a"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export const SpotiFindMark = memo(SpotiFindMarkComponent)
