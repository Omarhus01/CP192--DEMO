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

const ACTUAL_LEVELS = 3

function formatTime(s) {
  if (s == null) return null
  const mins = Math.floor(s / 60)
  const secs = (s % 60).toFixed(1).padStart(4, '0')
  return `${mins}:${secs}`
}

function getStatus(levelIdx, completedLevels) {
  if (completedLevels.includes(levelIdx)) return 'complete'
  if (levelIdx < ACTUAL_LEVELS && levelIdx === completedLevels.length) return 'active'
  return 'locked'
}

function getPhaseProgress(levelIdx, completedLevels, checkpoints) {
  if (completedLevels.includes(levelIdx)) return 3
  const cp = checkpoints[String(levelIdx)]
  if (cp === 'free')     return 2
  if (cp === 'scaffold') return 1
  return 0
}

const TOTAL = LEVELS_DATA.length

export default function DashboardScreen({ completedLevels = [], checkpoints = {}, bestTimes = {}, onContinue, onLevelSelect, onLockedLevel }) {
  const [visible, setVisible] = useState(false)
  const [selectedPhases, setSelectedPhases] = useState({})

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
            const idx        = level.id - 1
            const status     = getStatus(idx, completedLevels)
            const phases     = getPhaseProgress(idx, completedLevels, checkpoints)
            const phasePct   = Math.round(phases / 3 * 100)
            const inProgress = status === 'active' && phases > 0
            const bestTime   = bestTimes[String(level.id)] ?? null
            const selPhase   = selectedPhases[level.id] ?? 'free'

            return (
              <div
                key={level.id}
                className={`${styles.card} ${styles[status]}`}
                onClick={() => {
                  if (status === 'active') onLevelSelect(idx)
                  else if (status === 'locked') onLockedLevel()
                }}
              >
                <div className={styles.cardNum}>L{String(level.id).padStart(2, '0')}</div>
                <div className={styles.cardName}>{level.name}</div>
                <div className={styles.cardTopic}>{level.topic}</div>

                {status === 'complete' && (
                  <>
                    <div className={styles.cardStatus}>
                      <span className={styles.badge}>✓ COMPLETE</span>
                    </div>
                    {bestTime != null && (
                      <div className={styles.bestTimeChip}>
                        ⏱ BEST {formatTime(bestTime)}
                      </div>
                    )}
                    <div
                      className={styles.phaseSelector}
                      onClick={e => e.stopPropagation()}
                    >
                      {['guided', 'scaffold', 'free'].map(p => (
                        <button
                          key={p}
                          className={`${styles.phaseBtn} ${selPhase === p ? styles.phaseBtnActive : ''}`}
                          onClick={() => setSelectedPhases(prev => ({ ...prev, [level.id]: p }))}
                        >
                          {p === 'guided' ? 'GD' : p === 'scaffold' ? 'SC' : 'FR'}
                        </button>
                      ))}
                    </div>
                    <button
                      className={styles.replayBtn}
                      onClick={e => { e.stopPropagation(); onLevelSelect(idx, selPhase) }}
                    >
                      REPLAY
                    </button>
                  </>
                )}

                {status === 'active' && (
                  <div className={styles.cardStatus}>
                    {!inProgress && <span className={styles.badgeActive}>▶ START</span>}
                  </div>
                )}

                {status === 'locked' && (
                  <div className={styles.cardStatus}>
                    <span className={styles.lockIcon}>⬛</span>
                  </div>
                )}

                {inProgress && (
                  <>
                    <div className={styles.phaseBar}>
                      <div className={styles.phaseBarFill} style={{ width: `${phasePct}%` }} />
                      <span className={styles.phaseLabel}>{phases}/3 PHASES — {phasePct}%</span>
                    </div>
                    <button
                      className={styles.resumeBtn}
                      onClick={e => { e.stopPropagation(); onLevelSelect(idx) }}
                    >
                      RESUME
                    </button>
                  </>
                )}
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
