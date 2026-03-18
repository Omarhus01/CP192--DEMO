import { useState, useEffect, useRef } from 'react'
import styles from './NarratorBox.module.css'

// ── Portrait — pure CSS art, three expression states ─────────────────────────

function Portrait({ expression }) {
  return (
    <div className={`${styles.portrait} ${styles[`portrait_${expression}`]}`}>
      <div className={styles.portraitFace}>
        {expression !== 'gone' ? (
          <>
            <div className={styles.eyes}>
              <div className={`${styles.eye} ${expression === 'stressed' ? styles.eyeStressed : ''}`} />
              <div className={`${styles.eye} ${expression === 'stressed' ? styles.eyeStressed : ''}`} />
            </div>
            <div className={`${styles.mouth} ${styles[`mouth_${expression}`]}`} />
          </>
        ) : (
          <div className={styles.static} />
        )}
      </div>
      <div className={styles.portraitLabel}>DR. CALLUM STACK</div>
    </div>
  )
}

// ── Typewriter text ───────────────────────────────────────────────────────────

function TypewriterText({ text, speed = 28 }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!text) {
      setDisplayed('')
      setDone(false)
      return
    }
    // Reset
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    function tick() {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current < text.length) {
        timerRef.current = setTimeout(tick, speed)
      } else {
        setDone(true)
      }
    }

    timerRef.current = setTimeout(tick, 120) // small initial delay
    return () => clearTimeout(timerRef.current)
  }, [text, speed])

  return (
    <span className={styles.typewriter}>
      {displayed}
      {!done && <span className={styles.cursor}>▋</span>}
    </span>
  )
}

// ── Main NarratorBox component ────────────────────────────────────────────────

export default function NarratorBox({ line, expression = 'neutral', isMuted, onToggleMute }) {
  return (
    <div className={`${styles.box} ${line ? styles.boxActive : ''}`}>
      <Portrait expression={expression} />

      <div className={styles.dialogue}>
        {line ? (
          <TypewriterText key={line} text={line} />
        ) : (
          <span className={styles.idle}>...</span>
        )}
      </div>

      <button
        className={styles.muteBtn}
        onClick={onToggleMute}
        title={isMuted ? 'Unmute narrator' : 'Mute narrator'}
        aria-label={isMuted ? 'Unmute narrator' : 'Mute narrator'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
