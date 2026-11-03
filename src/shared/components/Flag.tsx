import { useId } from 'react'
import type { CountryCode } from '../../features/events/events'

export type FlagCode = CountryCode | 'GR' | 'GB' | 'IE'

/** Small flat flags (emoji flags don't render on Windows). */
export function Flag({ code, className = '' }: { code: FlagCode; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  return (
    <svg className={`flag ${className}`} viewBox="0 0 16 11" aria-hidden="true">
      {code === 'GR' && (
        <svg width="16" height="11" viewBox="0 0 27 18" preserveAspectRatio="none">
          <rect width="27" height="18" fill="#0d5eaf" />
          {[2, 6, 10, 14].map((y) => (
            <rect key={y} y={y} width="27" height="2" fill="#fff" />
          ))}
          <rect width="10" height="10" fill="#0d5eaf" />
          <rect x="4" width="2" height="10" fill="#fff" />
          <rect y="4" width="10" height="2" fill="#fff" />
        </svg>
      )}
      {code === 'IE' && (
        <>
          <rect width="5.34" height="11" fill="#169b62" />
          <rect x="5.33" width="5.34" height="11" fill="#fff" />
          <rect x="10.66" width="5.34" height="11" fill="#ff883e" />
        </>
      )}
      {code === 'GB' && (
        <svg width="16" height="11" viewBox="0 0 60 30" preserveAspectRatio="none">
          <clipPath id={`${id}-t`}>
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#c8102e" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
        </svg>
      )}
      {code === 'MT' && (
        <>
          <rect width="8" height="11" fill="#fff" />
          <rect x="8" width="8" height="11" fill="#cf142b" />
          <rect x="1.5" y="1.5" width="2" height="2" fill="#9a9a9a" />
        </>
      )}
      {code === 'HR' && (
        <>
          <rect width="16" height="3.67" fill="#ff0000" />
          <rect y="3.67" width="16" height="3.67" fill="#fff" />
          <rect y="7.33" width="16" height="3.67" fill="#171796" />
          <rect x="6" y="2.6" width="4" height="4.6" fill="#fff" stroke="#ff0000" strokeWidth="0.6" />
          <path d="M6 2.6h1.33v1.15H6zM8.67 2.6H10v1.15H8.67zM7.33 3.75h1.34v1.15H7.33zM6 4.9h1.33v1.15H6zM8.67 4.9H10v1.15H8.67zM7.33 6.05h1.34V7.2H7.33z" fill="#ff0000" />
        </>
      )}
      {code === 'DE' && (
        <>
          <rect width="16" height="3.67" fill="#000" />
          <rect y="3.67" width="16" height="3.67" fill="#dd0000" />
          <rect y="7.33" width="16" height="3.67" fill="#ffce00" />
        </>
      )}
      <rect width="16" height="11" fill="none" stroke="rgb(0 0 0 / 0.15)" strokeWidth="0.5" />
    </svg>
  )
}
