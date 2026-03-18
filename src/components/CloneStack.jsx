import styles from './CloneStack.module.css'

// ── Single character/clone ────────────────────────────────────────────────────

function Character({ depth = 0, isBase = false, label, value, levelId }) {
  const scale    = Math.max(0.3, 1 - depth * 0.1)
  const blur     = depth * 0.4
  const hue      = depth * 18
  const opacity  = Math.max(0.4, 1 - depth * 0.06)

  return (
    <div
      className={`${styles.characterWrap} ${isBase ? styles.baseCase : ''}`}
      style={{
        '--scale':   scale,
        '--blur':    `${blur}px`,
        '--hue':     `${hue}deg`,
        '--opacity': opacity,
        '--depth':   depth,
      }}
    >
      {/* Depth indent */}
      <div className={styles.indent} style={{ width: depth * 24 }} />

      {/* Call label */}
      <div className={styles.callLabel}>{label}</div>

      {/* The character */}
      <div className={styles.charOuter}>
        <div className={styles.charFace}>
          <div className={styles.charEyes}>
            <div className={styles.charEye} />
            <div className={styles.charEye} />
          </div>
          <div className={`${styles.charMouth} ${isBase ? styles.charMouthBase : ''}`} />
        </div>

        {/* Level 1: show gap bar */}
        {levelId === 1 && value !== undefined && (
          <div className={styles.gapBar}>
            <div className={styles.gapFill} style={{ '--gap': value }} />
            <span className={styles.gapLabel}>gap:{value}</span>
          </div>
        )}

        {/* Level 2: show step count */}
        {levelId === 2 && value !== undefined && (
          <div className={styles.stepBadge}>steps:{value}</div>
        )}
      </div>

      {isBase && <div className={styles.baseCaseTag}>BASE CASE</div>}
    </div>
  )
}

// ── CloneStack component ──────────────────────────────────────────────────────

export default function CloneStack({ clones, characterAtEnd, levelId }) {
  return (
    <div className={styles.container}>
      {/* Original character at top, always present */}
      <Character
        depth={0}
        label={clones.length === 0 ? 'YOU' : clones[0]?.label ?? 'YOU'}
        value={clones[0]?.value}
        levelId={levelId}
      />

      {/* Spawned clones */}
      {clones.slice(1).map((clone) => (
        <Character
          key={clone.depth}
          depth={clone.depth}
          label={clone.label}
          value={clone.value}
          isBase={clone.isBase}
          levelId={levelId}
        />
      ))}

      {/* Success indicator */}
      {characterAtEnd && (
        <div className={styles.successBurst}>
          <span>✓ REACHED GOAL</span>
        </div>
      )}
    </div>
  )
}
