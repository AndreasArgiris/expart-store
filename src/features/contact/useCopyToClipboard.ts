import { useEffect, useRef, useState } from 'react'

const SHOW_MS = 2000 // how long the "copied" note stays up

/** Copies text, falling back to a hidden textarea where the Clipboard API is blocked (e.g. insecure contexts). */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    document.body.append(field)
    field.select()
    document.execCommand('copy')
    field.remove()
  }
}

/**
 * Copies `text` on `copy()`. `copiedAt` is the time of the last copy for `SHOW_MS` afterwards, else 0, so
 * it can key a note that restarts on repeated clicks.
 */
export function useCopyToClipboard(text: string) {
  const [copiedAt, setCopiedAt] = useState(0)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    await copyText(text)
    setCopiedAt(Date.now())
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopiedAt(0), SHOW_MS)
  }

  return { copiedAt, copy }
}
