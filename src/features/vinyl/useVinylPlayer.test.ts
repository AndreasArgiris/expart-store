import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { releases } from './releases'
import { useVinylPlayer } from './useVinylPlayer'

describe('useVinylPlayer', () => {
  it('starts on the first release with the cover hidden', () => {
    const { result } = renderHook(() => useVinylPlayer())
    expect(result.current.current).toBe(releases[0])
    expect(result.current.isCoverShown).toBe(false)
  })

  it('hides the revealed cover when moving to another release', () => {
    const { result } = renderHook(() => useVinylPlayer())
    act(() => result.current.toggleCover())
    expect(result.current.isCoverShown).toBe(true)

    act(() => result.current.step(1))
    expect(result.current.current).toBe(releases[1])
    expect(result.current.isCoverShown).toBe(false)
  })

  it('loops round past either end', () => {
    const { result } = renderHook(() => useVinylPlayer())
    act(() => result.current.step(-1))
    expect(result.current.current).toBe(releases[releases.length - 1])
    act(() => result.current.select(releases.length))
    expect(result.current.current).toBe(releases[0])
  })
})
