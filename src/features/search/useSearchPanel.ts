import { useCallback, useEffect, useRef, useState } from 'preact/hooks'

/**
 * Manages open/close state and focus restoration for the search panel.
 * When the panel closes, focus returns to the trigger button.
 */
export const useSearchPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldFocusTrigger, setShouldFocusTrigger] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    setIsOpen(false)
    setShouldFocusTrigger(true)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  // Focus trigger after close — runs when trigger re-mounts
  useEffect(() => {
    if (!isOpen && shouldFocusTrigger && triggerRef.current) {
      triggerRef.current.focus()
      setShouldFocusTrigger(false)
    }
  }, [isOpen, shouldFocusTrigger])

  return { isOpen, open, close, triggerRef, inputRef }
}
