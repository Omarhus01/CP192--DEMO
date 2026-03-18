import styles from './PuzzleControls.module.css'

export default function PuzzleControls({
  level,
  baseCaseSelection,
  recursiveActionSelection,
  onSelectBaseCase,
  onSelectRecursiveAction,
  onRun,
  onCallClone,
  onReset,
  isAnimating,
}) {
  const hasBaseCase = baseCaseSelection !== null

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>FUNCTION BEING CALLED</div>
        <div className={styles.codeBlock}>
          <span className={styles.kw}>function</span>{' '}
          <span className={styles.fn}>{level.functionName}</span>
          <span className={styles.punct}>(</span>
          <span className={styles.param}>{level.paramName}</span>
          <span className={styles.punct}>) {'{'}</span>
        </div>
      </div>

      {/* Base case selector */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          BASE CASE <span className={styles.required}>*</span>
        </div>
        <div className={styles.options}>
          {level.baseCaseOptions.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.optionBtn} ${baseCaseSelection === opt.id ? styles.optionSelected : ''}`}
              onClick={() => onSelectBaseCase(opt.id)}
              disabled={isAnimating}
            >
              <span className={styles.optionCode}>{opt.label}</span>
              <span className={styles.optionDesc}>{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recursive action — locked in Level 1, selectable in Level 2 */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          RECURSIVE ACTION
          {level.lockedRecursiveAction && (
            <span className={styles.locked}> [locked]</span>
          )}
        </div>

        {level.lockedRecursiveAction ? (
          <div className={styles.lockedAction}>
            <span className={styles.optionCode}>{level.lockedRecursiveAction.label}</span>
            <span className={styles.optionDesc}>{level.lockedRecursiveAction.description}</span>
          </div>
        ) : (
          <div className={styles.options}>
            {level.recursiveActions.map((opt) => (
              <button
                key={opt.id}
                className={`${styles.optionBtn} ${recursiveActionSelection === opt.id ? styles.optionSelected : ''}`}
                onClick={() => onSelectRecursiveAction(opt.id)}
                disabled={isAnimating}
              >
                <span className={styles.optionCode}>{opt.label}</span>
                <span className={styles.optionDesc}>{opt.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.codeBlock} style={{ marginTop: -6 }}>
        <span className={styles.punct}>{'}'}</span>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          className={styles.btnSecondary}
          onClick={onCallClone}
          disabled={isAnimating}
          title="Manually call one clone"
        >
          CALL CLONE
        </button>

        <button
          className={`${styles.btnPrimary} ${!hasBaseCase ? styles.btnDisabled : ''}`}
          onClick={onRun}
          disabled={isAnimating}
          title={!hasBaseCase ? 'Select a base case first' : 'Run the full chain'}
        >
          ▶ RUN
        </button>

        <button
          className={styles.btnReset}
          onClick={onReset}
          disabled={isAnimating}
          title="Reset the level"
        >
          RESET
        </button>
      </div>
    </div>
  )
}
