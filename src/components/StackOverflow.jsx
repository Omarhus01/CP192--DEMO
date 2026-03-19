import { useEffect, useRef } from 'react'
import { speakOverflow } from '../systems/narratorSystem.js'
import styles from './StackOverflow.module.css'

// Random clones scattered across the screen
function ScatteredClones() {
  const clones = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    top:    Math.random() * 85,
    left:   Math.random() * 90,
    scale:  0.2 + Math.random() * 1.2,
    hue:    Math.random() * 360,
    delay:  Math.random() * 0.5,
    rotate: (Math.random() - 0.5) * 60,
  }))

  return (
    <>
      {clones.map(c => (
        <div
          key={c.id}
          className={styles.scatteredClone}
          style={{
            top:    `${c.top}%`,
            left:   `${c.left}%`,
            transform: `scale(${c.scale}) rotate(${c.rotate}deg)`,
            filter: `hue-rotate(${c.hue}deg) blur(${c.scale < 0.5 ? 1 : 0}px)`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <div className={styles.miniEyes}>
            <div className={styles.miniEye} />
            <div className={styles.miniEye} />
          </div>
        </div>
      ))}
    </>
  )
}

export default function StackOverflow({ onRestart, isMuted, attemptCount = 0 }) {
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    document.body.classList.add('shake')
    const t1 = setTimeout(() => document.body.classList.remove('shake'), 500)
    speakOverflow(isMuted, attemptCount)
    return () => clearTimeout(t1)
  }, []) // eslint-disable-line

  return (
    <div className={styles.screen}>
      <ScatteredClones />

      <div className={styles.content}>
        <div className={styles.errorCode}>ERR_STACK_OVERFLOW</div>
        <h1 className={styles.title}>MAXIMUM DEPTH EXCEEDED</h1>
        <p className={styles.subtitle}>
          The call stack has been exhausted.<br />
          The clones have nowhere left to go.<br />
          This is your fault. It has been logged.
        </p>

        <div className={styles.stackTrace}>
          <div className={styles.traceHeader}>// stack trace (partial)</div>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.traceEntry} style={{ animationDelay: `${i * 60}ms` }}>
              <span className={styles.traceDepth}>at depth {i}:</span>
              <span className={styles.traceFn}>solve({4 - (i % 4)})</span>
            </div>
          ))}
          <div className={styles.traceEntry}>
            <span className={styles.traceDots}>... (infinite)</span>
          </div>
        </div>

        <button className={styles.restartBtn} onClick={onRestart}>
          TRY AGAIN
        </button>
      </div>
    </div>
  )
}
