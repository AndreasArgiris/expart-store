interface PlayerControlsProps {
  playing: boolean
  onPrev: () => void
  onTogglePlay: () => void
  onNext: () => void
}

const icon = { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }

export function PlayerControls({ playing, onPrev, onTogglePlay, onNext }: PlayerControlsProps) {
  return (
    <div className="d-flex align-items-center gap-3 pb-2">
      <button type="button" className="ctrl" onClick={onPrev} aria-label="Previous track">
        <svg {...icon}>
          <path d="M8 4 4 8l4 4M13 4 9 8l4 4" />
        </svg>
      </button>
      <button type="button" className="ctrl" onClick={onTogglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        <svg {...icon}>
          {playing ? <path d="M5.5 3v10M10.5 3v10" /> : <path d="M5 3v10l8-5z" fill="currentColor" />}
        </svg>
      </button>
      <button type="button" className="ctrl" onClick={onNext} aria-label="Next track">
        <svg {...icon}>
          <path d="M3 4l4 4-4 4M8 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  )
}
