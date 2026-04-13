import styles from './Character.module.css'

/**
 * 2D CSS/SVG character with animated states.
 *
 * Props:
 *   state  — 'idle' | 'walk' | 'jump' | 'fail' | 'clone'
 *   depth  — clone depth (0 = main character)
 *   facing — 'right' | 'left'  (default 'right')
 */
export default function Character({ state = 'idle', depth = 0, facing = 'right' }) {
  const isClone   = state === 'clone' || depth > 0
  const scale     = isClone ? Math.max(0.45, 1 - depth * 0.1)   : 1
  const opacity   = isClone ? Math.max(0.25, 1 - depth * 0.13)  : 1
  const hueShift  = isClone ? depth * 22 : 0
  const blur      = isClone && depth > 4 ? depth - 4 : 0

  const stateClass = styles[`char_${state}`] ?? styles.char_idle
  const flipClass  = facing === 'left' ? styles.flipped : ''

  return (
    <div
      className={`${styles.root} ${stateClass} ${flipClass}`}
      style={{
        transform: `scale(${scale}) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
        opacity,
        filter: `hue-rotate(${hueShift}deg)${blur > 0 ? ` blur(${blur}px)` : ''}`,
      }}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 40 72"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        {/* ── Shadow ── */}
        <ellipse cx="20" cy="70" rx="11" ry="3" className={styles.shadow} />

        {/* ── Left leg ── */}
        <g className={styles.legL}>
          <rect x="11" y="46" width="7" height="16" rx="3" className={styles.pants} />
          <rect x="9"  y="58" width="10" height="7" rx="2" className={styles.shoe} />
        </g>

        {/* ── Right leg ── */}
        <g className={styles.legR}>
          <rect x="22" y="46" width="7" height="16" rx="3" className={styles.pants} />
          <rect x="20" y="58" width="10" height="7" rx="2" className={styles.shoe} />
        </g>

        {/* ── Torso (lab coat) ── */}
        <rect x="10" y="24" width="20" height="24" rx="4" className={styles.torso} />
        <rect x="15" y="26" width="10" height="20" rx="2" className={styles.shirt} />
        <rect x="12" y="28" width="4"  height="3"  rx="1" className={styles.pocket} />

        {/* ── Left arm ── */}
        <g className={styles.armL}>
          <rect x="3" y="24" width="7" height="18" rx="3" className={styles.sleeve} />
          <rect x="2" y="39" width="8" height="5"  rx="2" className={styles.hand} />
        </g>

        {/* ── Right arm ── */}
        <g className={styles.armR}>
          <rect x="30" y="24" width="7" height="18" rx="3" className={styles.sleeve} />
          <rect x="30" y="39" width="8" height="5"  rx="2" className={styles.hand} />
        </g>

        {/* ── Head ── */}
        <g className={styles.head}>
          {/* Head base */}
          <rect x="7" y="4" width="26" height="22" rx="9" className={styles.skin} />

          {/* Hair */}
          <rect x="7" y="4" width="26" height="9" rx="7" className={styles.hair} />

          {/* Eyes */}
          <ellipse cx="15" cy="14" rx="3" ry="3.5" className={styles.eyeWhite} />
          <ellipse cx="25" cy="14" rx="3" ry="3.5" className={styles.eyeWhite} />
          <circle  cx="15.8" cy="14.5" r="2"   className={styles.pupil} />
          <circle  cx="25.8" cy="14.5" r="2"   className={styles.pupil} />
          <circle  cx="16.4" cy="13.8" r="0.7" fill="white" />
          <circle  cx="26.4" cy="13.8" r="0.7" fill="white" />

          {/* Mouth — changes per state */}
          <path
            className={`${styles.mouth} ${styles[`mouth_${state}`]}`}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Lab coat collar */}
          <polygon points="16,26 20,22 24,26" className={styles.collar} />
        </g>
      </svg>

      {/* Glitch overlay for clones */}
      {isClone && depth > 0 && (
        <div className={styles.glitch} />
      )}
    </div>
  )
}
