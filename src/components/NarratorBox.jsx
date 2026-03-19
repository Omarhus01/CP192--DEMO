import { useState, useEffect, useRef } from 'react'
import styles from './NarratorBox.module.css'

// ── Portrait — pure CSS art ────────────────────────────────────────────────────

function Portrait({ expression, bobbing }) {
  const eyeClass =
    expression === 'stressed'     ? styles.eyeStressed  :
    expression === 'warm'         ? styles.eyeWarm      :
    expression === 'engaged'      ? styles.eyeEngaged   :
    expression === 'unhinged'     ? styles.eyeUnhinged  : ''

  const squintEye =
    expression === 'professional' || expression === 'stern'
      ? styles.eyeSquint : ''

  return (
    <div className={`${styles.portrait} ${styles[`portrait_${expression}`]}`}>
      <div className={`${styles.portraitFace} ${bobbing ? styles.portraitBobbing : ''}`}>
        {expression !== 'gone' ? (
          <>
            <div className={styles.eyes}>
              <div className={`${styles.eye} ${eyeClass} ${squintEye}`} />
              <div className={`${styles.eye} ${eyeClass} ${squintEye}`} />
            </div>
            <div className={`${styles.mouth} ${styles[`mouth_${expression}`]}`} />
          </>
        ) : (
          <div className={styles.static} />
        )}
      </div>
      <div className={styles.portraitLabel}>OMARITO</div>
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

export default function NarratorBox({
  line,
  expression = 'neutral',
  expressionOverride = null,
  isMuted,
  onToggleMute,
}) {
  const resolvedExpression = expressionOverride ?? expression

  const [bobbing, setBobbing] = useState(false)

  // Bob portrait whenever a new line arrives
  useEffect(() => {
    if (!line) return
    setBobbing(true)
    const t = setTimeout(() => setBobbing(false), 700)
    return () => clearTimeout(t)
  }, [line])

  return (
    <div className={`${styles.box} ${line ? styles.boxActive : ''}`}>
      <Portrait expression={resolvedExpression} bobbing={bobbing} />

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
