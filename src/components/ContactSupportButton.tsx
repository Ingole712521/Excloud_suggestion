import { useState, useRef, useCallback, useEffect } from 'react'
import './ContactSupportButton.css'

const FULL_TEXT = 'Contact Support'
const TYPE_INTERVAL_MS = 60
const ERASE_INTERVAL_MS = 60
const SHOW_DURATION_MS = 2500
const INITIAL_SHOW_MS = 3000

function ChatBubbleIcon() {
  return (
    <svg
      className="contact-support-button__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
    </svg>
  )
}

export function ContactSupportButton() {
  const [visibleLength, setVisibleLength] = useState(FULL_TEXT.length)
  const timersRef = useRef<{
    typeIn: ReturnType<typeof setInterval> | null
    erase: ReturnType<typeof setInterval> | null
    show: ReturnType<typeof setTimeout> | null
    initialShow: ReturnType<typeof setTimeout> | null
  }>({
    typeIn: null,
    erase: null,
    show: null,
    initialShow: null,
  })

  const clearAllTimers = useCallback(() => {
    if (timersRef.current.typeIn) {
      clearInterval(timersRef.current.typeIn)
      timersRef.current.typeIn = null
    }
    if (timersRef.current.erase) {
      clearInterval(timersRef.current.erase)
      timersRef.current.erase = null
    }
    if (timersRef.current.show) {
      clearTimeout(timersRef.current.show)
      timersRef.current.show = null
    }
    if (timersRef.current.initialShow) {
      clearTimeout(timersRef.current.initialShow)
      timersRef.current.initialShow = null
    }
  }, [])

  const startErase = useCallback(() => {
    if (timersRef.current.erase) return
    timersRef.current.erase = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev <= 0) {
          if (timersRef.current.erase) {
            clearInterval(timersRef.current.erase)
            timersRef.current.erase = null
          }
          return 0
        }
        return prev - 1
      })
    }, ERASE_INTERVAL_MS)
  }, [])

  const startTypeIn = useCallback(() => {
    clearAllTimers()
    setVisibleLength(0)

    timersRef.current.typeIn = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev >= FULL_TEXT.length) {
          if (timersRef.current.typeIn) {
            clearInterval(timersRef.current.typeIn)
            timersRef.current.typeIn = null
          }
          timersRef.current.show = setTimeout(() => {
            timersRef.current.show = null
            startErase()
          }, SHOW_DURATION_MS)
          return FULL_TEXT.length
        }
        return prev + 1
      })
    }, TYPE_INTERVAL_MS)
  }, [clearAllTimers, startErase])

  // On page load: show full text for ~3 seconds, then typewriter-erase to icon only
  useEffect(() => {
    timersRef.current.initialShow = setTimeout(() => {
      timersRef.current.initialShow = null
      startErase()
    }, INITIAL_SHOW_MS)
    return clearAllTimers
  }, [clearAllTimers, startErase])

  const handleMouseEnter = () => {
    clearAllTimers()
    startTypeIn()
  }

  const handleMouseLeave = () => {
    clearAllTimers()
    if (visibleLength > 0) {
      startErase()
    }
  }

  const displayText = FULL_TEXT.slice(0, visibleLength)

  return (
    <button
      type="button"
      className="contact-support-button"
      aria-label="Contact Support"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ChatBubbleIcon />
      {displayText && (
        <span className="contact-support-button__text">
          {displayText}
        </span>
      )}
    </button>
  )
}
