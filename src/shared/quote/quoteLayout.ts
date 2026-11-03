import { GAP_EM } from './QuoteWord'

const SAME_LINE_TOLERANCE = 2 // px of vertical difference still treated as the same line

const wordSpans = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('.quote-word'))
const spacedThreshold = (root: HTMLElement) => parseFloat(getComputedStyle(root).fontSize) * GAP_EM

/** Indices of words that border an unusually wide justified gap on their line (for an already-justified quote). */
export function findSpacedWords(root: HTMLElement): number[] {
  const rects = wordSpans(root).map((s) => s.getBoundingClientRect())
  const threshold = spacedThreshold(root)
  const spaced = new Set<number>()

  for (let i = 0; i < rects.length - 1; i++) {
    const isSameLine = Math.abs(rects[i].top - rects[i + 1].top) < SAME_LINE_TOLERANCE
    if (isSameLine && rects[i + 1].left - rects[i].right > threshold) {
      spaced.add(i)
      spaced.add(i + 1)
    }
  }
  return [...spaced]
}

export interface SpreadLayout {
  /** Extra px each word moves right when fully spread (justified position − natural position). */
  offsets: number[]
  /** Words on lines whose gaps open wide enough to count as "spaced". */
  spaced: number[]
}

/**
 * For left-aligned text: works out, per word, how far it must move to reach its justified position.
 * Uses offsetLeft/offsetWidth, which ignore the transforms we apply.
 */
export function measureSpread(root: HTMLElement): SpreadLayout {
  const spans = wordSpans(root)
  const width = root.clientWidth
  const threshold = spacedThreshold(root)
  const offsets = spans.map(() => 0)
  const spaced: number[] = []

  const lines: number[][] = []
  spans.forEach((s, i) => {
    const line = lines[lines.length - 1]
    if (line && Math.abs(spans[line[0]].offsetTop - s.offsetTop) < SAME_LINE_TOLERANCE) line.push(i)
    else lines.push([i])
  })

  // Every line but the last gets justified, like text-align: justify would.
  lines.slice(0, -1).forEach((line) => {
    if (line.length < 2) return
    const last = spans[line[line.length - 1]]
    const extra = width - (last.offsetLeft + last.offsetWidth)
    const perGap = extra / (line.length - 1)
    line.forEach((idx, k) => (offsets[idx] = k * perGap))
    if (perGap > threshold) spaced.push(...line)
  })

  return { offsets, spaced }
}
