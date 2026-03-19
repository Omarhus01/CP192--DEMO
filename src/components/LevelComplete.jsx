import { useMemo } from 'react'
import styles from './LevelComplete.module.css'

const CONFETTI_COLORS = ['#f97316', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#ec4899']

export default function LevelComplete({ level, narratorLine, onNext, hasNextLevel }) {
  // Split explanation on **bold** markers for basic rich text
  function renderExplanation(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  // Confetti dots — stable random positions
  const confetti = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      left:   `${4 + (i * 3.8) % 92}%`,
      delay:  `${(i * 0.083) % 0.9}s`,
      color:  CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size:   `${4 + (i % 4)}px`,
      dur:    `${1.6 + (i % 3) * 0.25}s`,
    }))
  , [])

  return (
    <div className={styles.screen}>
      {/* Confetti — 2 seconds of falling dots */}
      <div className={styles.confettiContainer} aria-hidden="true">
        {confetti.map((dot, i) => (
          <div
            key={i}
            className={styles.confettiDot}
            style={{
              left:             dot.left,
              width:            dot.size,
              height:           dot.size,
              background:       dot.color,
              animationDelay:   dot.delay,
              animationDuration: dot.dur,
            }}
          />
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.badge}>LEVEL COMPLETE</div>
        <h2 className={styles.title}>{level.title}</h2>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionLabel}>WHAT JUST HAPPENED</div>
          <div className={styles.explanation}>
            {level.successExplanation.split('\n\n').map((para, i) => (
              <p key={i}>{renderExplanation(para)}</p>
            ))}
          </div>
        </div>

        {narratorLine && (
          <div className={styles.narratorQuote}>
            <span className={styles.narratorName}>DR. CALLUM STACK —</span>{' '}
            <em>{narratorLine}</em>
          </div>
        )}

        <button
          className={styles.nextBtn}
          onClick={onNext}
        >
          {hasNextLevel ? '▶ NEXT LEVEL' : '▶ FINISH'}
        </button>
      </div>
    </div>
  )
}
