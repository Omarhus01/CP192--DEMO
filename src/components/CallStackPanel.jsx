import styles from './CallStackPanel.module.css'

const STATUS_LABEL = {
  active:     '▶',
  baseCase:   '★',
  returning:  '◀',
}

const STATUS_CLASS = {
  active:    styles.entryActive,
  baseCase:  styles.entryBase,
  returning: styles.entryReturn,
}

export default function CallStackPanel({ entries, functionName, onInteract }) {
  return (
    <div
      className={styles.panel}
      onMouseEnter={onInteract}
      onClick={onInteract}
    >
      <div className={styles.header}>CALL STACK</div>

      <div className={styles.stack}>
        {entries.length === 0 ? (
          <div className={styles.empty}>// awaiting execution</div>
        ) : (
          // Show deepest call at top (most recent first — like a real call stack)
          // key includes status so re-mount fires the correct animation per state
          [...entries].reverse().map((entry, i) => (
            <div
              key={`${entry.depth}-${entry.status}`}
              className={`${styles.entry} ${STATUS_CLASS[entry.status] || styles.entryActive}`}
            >
              <span className={styles.statusIcon}>
                {STATUS_LABEL[entry.status] || '▶'}
              </span>
              <span className={styles.label}>{entry.label}</span>
              <span className={styles.depth}>d:{entry.depth}</span>
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        {/* key={entries.length} forces re-mount (and tick animation) on depth change */}
        <span key={entries.length} className={styles.depthCount}>
          depth: {entries.length} / 8
        </span>
        <div
          className={styles.depthBar}
          style={{ '--fill': `${(entries.length / 8) * 100}%` }}
        />
      </div>
    </div>
  )
}
