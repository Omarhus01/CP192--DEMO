import styles from './PhaseIndicator.module.css'

const PHASES = ['guided', 'scaffold', 'free']
const LABELS = ['Guided', 'Scaffolded', 'Free']

export default function PhaseIndicator({ phase }) {
  const currentIndex = PHASES.indexOf(phase)

  return (
    <div className={styles.bar}>
      {PHASES.map((p, i) => (
        <div key={p} className={styles.stepWrapper}>
          <div className={[
            styles.step,
            i === currentIndex ? styles.active : '',
            i < currentIndex   ? styles.done   : '',
          ].filter(Boolean).join(' ')}>
            {i < currentIndex && <span className={styles.check}>✓ </span>}
            {LABELS[i]}
          </div>
          {i < PHASES.length - 1 && (
            <span className={styles.arrow}>→</span>
          )}
        </div>
      ))}
    </div>
  )
}
