import { useCallback, useEffect, useRef, useState } from 'react'
import { wrapIndex } from '../../shared/carousel'
import { useArrowKeys } from '../../shared/hooks/useArrowKeys'
import { releases } from './releases'

const wrap = (i: number) => wrapIndex(i, releases.length)

/** "The source changed mid-load": expected while skipping tracks, not a real playback failure. */
const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError'

/**
 * The vinyl page's state: which release is on the turntable, whether its preview is playing (driving the
 * `<audio>` at `audioRef`), and whether its cover is revealed. Changing release hides the cover.
 */
export function useVinylPlayer() {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCoverShown, setIsCoverShown] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const select = useCallback((i: number) => {
    setIndex(wrap(i))
    setIsCoverShown(false)
  }, [])

  const step = useCallback((delta: number) => {
    setIndex((i) => wrap(i + delta))
    setIsCoverShown(false)
  }, [])

  useArrowKeys(step)

  // Keep the <audio> element in step with the play state, and with the current track.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch((err: unknown) => {
        if (!isAbort(err)) setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, index])

  // Warm the neighbouring covers so revealing one after stepping doesn't wait on the network.
  useEffect(() => {
    for (const i of [index - 1, index + 1]) new Image().src = releases[wrap(i)].cover
  }, [index])

  return {
    index,
    current: releases[index],
    isPlaying,
    isCoverShown,
    audioRef,
    select,
    step,
    togglePlay: () => setIsPlaying((p) => !p),
    toggleCover: () => setIsCoverShown((s) => !s),
    handleEnded: () => setIsPlaying(false),
  }
}

export type VinylPlayer = ReturnType<typeof useVinylPlayer>
