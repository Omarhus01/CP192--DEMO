import { useState, useEffect } from 'react'
import styles from './DashboardScreen.module.css'

const LEVELS_DATA = [
  { id: 1, name: 'THE FLOORS',       topic: 'Recursion: Base Case'     },
  { id: 2, name: 'THE COIN STACK',   topic: 'Recursion: Return Values' },
  { id: 3, name: 'FIBONACCI',        topic: 'Multiple Recursive Calls' },
  { id: 4, name: 'BINARY SEARCH',    topic: 'Divide & Conquer'         },
  { id: 5, name: 'TREE TRAVERSAL',   topic: 'Branching Recursion'      },
  { id: 6, name: 'MERGE SORT',       topic: 'Recursive Sorting'        },
  { id: 7, name: 'MEMOIZATION',      topic: 'Optimized Recursion'      },
  { id: 8, name: 'FINAL ASSESSMENT', topic: 'Full Application'         },
]

const ACTUAL_LEVELS = 2 // levels that actually exist in the game

function getStatus(levelIdx, completedLevels) {
  if (completedLevels.includes(levelIdx)) return 'complete'
  if (levelIdx < ACTUAL_LEVELS && levelIdx === completedLevels.length) return 'active'
  return 'locked'
}

const TOTAL = LEVELS_DATA.length

export default function DashboardScreen({ completedLevels = [], onContinue, onLevelSelect, onLockedLevel }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const completed = completedLevels.length

  return (
    <div className={`${styles.screen} ${visible ? styles.visible : ''}`}>
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      <div className={styles.content}>
        <div className={styles.classification}>FACILITY ID: CP-192 // ORIENTATION PROGRESS</div>

        <h1 className={styles.title}>
          TRAINING<br />
          <span className={styles.accent}>DASHBOARD</span>
        </h1>

        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>{completed} / {TOTAL} MODULES COMPLETE</span>
            <span className={styles.progressPct}>{Math.round(completed / TOTAL * 100)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completed / TOTAL * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.grid}>
          {LEVELS_DATA.map(level => {
            const idx    = level.id - 1
            const status = getStatus(idx, completedLevels)
            return (
              <div
                key={level.id}
                className={`${styles.card} ${styles[status]}`}
                onClick={() => {
                  if (status === 'complete' || status === 'active') onLevelSelect(idx)
                  else onLockedLevel()
                }}
              >
                <div className={styles.cardNum}>L{String(level.id).padStart(2, '0')}</div>
                <div className={styles.cardName}>{level.name}</div>
                <div className={styles.cardTopic}>{level.topic}</div>
                <div className={styles.cardStatus}>
                  {status === 'complete' && <span className={styles.badge}>✓ COMPLETE</span>}
                  {status === 'active'   && <span className={styles.badgeActive}>▶ START</span>}
                  {status === 'locked'   && <span className={styles.lockIcon}>⬛</span>}
                </div>
              </div>
            )
          })}
        </div>

        <button className={styles.continueBtn} onClick={onContinue}>
          ENTER FACILITY
        </button>

        <div className={styles.footer}>
          CLEARANCE LEVEL: ORIENTATION &nbsp;|&nbsp; ALL CLONES SUPERVISED
        </div>
      </div>
    </div>
  )
}
