import styles from './LevelComplete.module.css'

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

  return (
    <div className={styles.screen}>
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
