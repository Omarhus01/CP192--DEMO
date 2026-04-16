import { useState, useEffect } from 'react'
import { getLeaderboard } from '../systems/firestoreService.js'
import styles from './LeaderboardScreen.module.css'

function formatTime(s) {
  if (s == null) return '--:--'
  const m   = Math.floor(s / 60)
  const sec = (s % 60).toFixed(1)
  return m + ':' + sec.padStart(4, '0')
}

function formatDate(ts) {
  if (!ts) return '—'
  const d      = new Date(ts)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function LeaderboardScreen({ currentUser, onBack }) {
  const [activeLevel, setActiveLevel] = useState(1)
  const [entries,     setEntries]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getLeaderboard(activeLevel)
      .then(data => { setEntries(data); setLoading(false) })
      .catch(() => { setError('Failed to load. Try again.'); setLoading(false) })
  }, [activeLevel])

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← DASHBOARD</button>
        <div className={styles.title}>LEADERBOARD</div>
        <div />
      </div>

      <div className={styles.tabs}>
        {[1, 2, 3].map(lvl => (
          <button
            key={lvl}
            className={`${styles.tab} ${activeLevel === lvl ? styles.tabActive : ''}`}
            onClick={() => setActiveLevel(lvl)}
          >
            LEVEL {lvl}
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        {loading && (
          <div className={styles.loading}>FETCHING DATA...</div>
        )}

        {!loading && error && (
          <div className={styles.empty}>{error}</div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className={styles.empty}>No times recorded yet. Be the first.</div>
        )}

        {!loading && !error && entries.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.rank}>RANK</th>
                <th className={styles.player}>PLAYER</th>
                <th className={styles.time}>TIME</th>
                <th className={styles.date}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.uid}
                  className={`${styles.row} ${entry.uid === currentUser?.uid ? styles.rowSelf : ''}`}
                >
                  <td className={styles.rank}>{i + 1}</td>
                  <td className={styles.player}>{entry.name}</td>
                  <td className={styles.time}>{formatTime(entry.time)}</td>
                  <td className={styles.date}>{formatDate(entry.setAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
