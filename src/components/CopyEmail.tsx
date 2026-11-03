import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const SHOW_MS = 2000

/** Email address that copies itself on click, with a brief "Copied ✓" note beside it. */
export function CopyEmail({ email }: { email: string }) {
  // Bumped on every copy, so repeated clicks restart the note.
  const [copiedAt, setCopiedAt] = useState(0)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // Clipboard blocked (e.g. insecure context): fall back to a hidden textarea.
      const field = document.createElement('textarea')
      field.value = email
      document.body.append(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setCopiedAt(Date.now())
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopiedAt(0), SHOW_MS)
  }

  return (
    <span className="copy-email">
      <button type="button" className="text-link text-lowercase" onClick={copy} title="Copy email">
        {email}
      </button>
      <AnimatePresence>
        {copiedAt > 0 && (
          <motion.span
            key={copiedAt}
            className="copy-email-note"
            role="status"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 0.2 }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2.5 8.5l3.5 3.5 7.5-8" />
            </svg>
            Copied
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
