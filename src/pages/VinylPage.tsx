import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { releases } from '../data/releases'
import { ReleaseStage } from '../components/ReleaseStage'

const count = releases.length
const wrap = (i: number) => ((i % count) + count) % count

export function VinylPage() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const select = useCallback((i: number) => {
    setIndex(wrap(i))
    setShowInfo(false)
  }, [])

  const step = useCallback((delta: number) => {
    setIndex((i) => wrap(i + delta))
    setShowInfo(false)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.play().catch((err: DOMException) => {
        // AbortError just means the source changed mid-load.
        if (err.name !== 'AbortError') setPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [playing, index])

  // Warm the neighbouring covers so revealing one after stepping doesn't wait on the network.
  useEffect(() => {
    for (const i of [index - 1, index + 1]) new Image().src = releases[wrap(i)].cover
  }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  return (
    <>
      <main className="flex-grow-1 d-flex align-items-center justify-content-center">
        <ReleaseStage
          releases={releases}
          index={index}
          playing={playing}
          showInfo={showInfo}
          onSelect={select}
          onStep={step}
          onSkip={() => step(1)}
          onTogglePlay={() => setPlaying((p) => !p)}
          onToggleInfo={() => setShowInfo((s) => !s)}
        />
      </main>

      <footer className="row g-0 align-items-end gy-4">
        <div className="col-12 col-md-4">
          <div className="sq-label mb-4">Vinyl</div>
          <p className="intro mb-0">
            Independent vinyl, hand-picked. Every record on our shelves is chosen for the way it sounds, not
            the way it sells.
          </p>
        </div>

        <div className="col-12 col-md-4 d-flex justify-content-center align-items-center gap-4 pager">
          <button type="button" className="text-link" onClick={() => step(-1)}>
            ‹ Prev
          </button>
          <span className="d-inline-flex gap-2" aria-live="polite">
            <span className="pager-num">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={index}
                  className="d-inline-block"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {index + 1}
                </motion.span>
              </AnimatePresence>
            </span>
            / {count}
          </span>
          <button type="button" className="text-link" onClick={() => step(1)}>
            Next ›
          </button>
        </div>
      </footer>

      <audio ref={audioRef} src={releases[index].preview} preload="none" onEnded={() => setPlaying(false)} />
    </>
  )
}
