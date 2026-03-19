import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Character from './Character.jsx'
import styles from './SceneView.module.css'

// ── Level 1 scene — The Floors (Building) ─────────────────────────────────────

function Level1Scene({ clones, characterAtEnd, level }) {
  const numFloors = level.scene?.floorCount ?? 5

  const [charLeft,     setCharLeft]     = useState(-12)  // % from left
  const [charBottom,   setCharBottom]   = useState(14)   // % from bottom
  const [walkDuration, setWalkDuration] = useState(1.0)
  const [charState,    setCharState]    = useState('idle')
  const [doorGlow,     setDoorGlow]     = useState(false)

  // Building geometry — all in scene-% coordinates
  const GROUND_PCT = 14                         // ground bar height
  const BLDG_TOP   = 94                         // building reaches to 94% from bottom
  const BLDG_H     = BLDG_TOP - GROUND_PCT      // 80% of scene height
  const FLOOR_H    = BLDG_H / numFloors         // each floor's height in scene-%

  // Bottom edge of clone/character for a given depth (0 = first floor)
  function floorBottom(depth) {
    return GROUND_PCT + depth * FLOOR_H
  }

  // Walk in from left on mount
  useEffect(() => {
    const t = setTimeout(() => { setWalkDuration(1.0); setCharLeft(12) }, 80)
    return () => clearTimeout(t)
  }, [])

  // Climb building on success
  useEffect(() => {
    if (!characterAtEnd) return
    const timers = []
    setCharState('walk')

    // Walk to building entrance
    timers.push(setTimeout(() => { setWalkDuration(0.85); setCharLeft(57) }, 50))

    // Step up floor by floor
    for (let f = 0; f < numFloors; f++) {
      const bottom = floorBottom(f)
      timers.push(setTimeout(() => {
        setWalkDuration(0.32)
        setCharLeft(63)
        setCharBottom(bottom)
      }, 1050 + f * 400))
    }

    // Arrive at top — door glows
    timers.push(setTimeout(() => {
      setCharState('idle')
      setDoorGlow(true)
    }, 1050 + numFloors * 400 + 120))

    return () => timers.forEach(clearTimeout)
  }, [characterAtEnd]) // eslint-disable-line

  const visibleClones  = clones.slice(0, 8)
  const overflowClones = clones.slice(8)

  return (
    <div className={styles.scene}>
      <div className={styles.bgSky} />
      <div className={styles.bgMid} />
      <div className={styles.groundBar} />

      {/* ── Building ── */}
      <div className={styles.building}>
        {Array.from({ length: numFloors }, (_, i) => (
          <div
            key={i}
            className={styles.buildingFloor}
            style={{
              bottom: `${(i / numFloors) * 100}%`,
              height: `${100 / numFloors}%`,
            }}
          >
            <div className={styles.buildingFloorLine} />
            <div className={styles.buildingWindow} />
          </div>
        ))}

        {/* Exit door at top */}
        <div className={`${styles.buildingDoor} ${doorGlow ? styles.buildingDoorActive : ''}`}>
          🚪
        </div>
      </div>

      {/* ── Clones on building floors ── */}
      {visibleClones.map((c) => (
        <div
          key={c.depth}
          className={styles.buildingClone}
          style={{
            bottom: `${floorBottom(c.depth)}%`,
            opacity: Math.max(0.38, 1 - c.depth * 0.12),
          }}
        >
          {/* Returning wrapper keeps parent/child relationship for CSS selector */}
          <div className={c.isReturning ? styles.cloneReturning : ''}>
            <div className={`${styles.cloneSpawnAnim} ${c.isBase ? styles.baseCaseClone : ''}`}>
              <Character state="clone" depth={c.depth} />
              {c.isReturning && c.returnValue != null && (
                <div className={styles.returnBubble}>{String(c.returnValue)}</div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ── Overflow clones flying off ── */}
      {overflowClones.map((c, i) => (
        <motion.div
          key={`ov-${c.depth}`}
          className={styles.overflowClone}
          initial={{ x: '40%', y: 0, opacity: 0 }}
          animate={{
            x: `${(Math.random() - 0.5) * 120}%`,
            y: -(60 + Math.random() * 140),
            opacity: [0, 0.9, 0],
            rotate: (Math.random() - 0.5) * 200,
          }}
          transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
        >
          <Character state="clone" depth={c.depth + 2} />
        </motion.div>
      ))}

      {/* ── Main character ── */}
      <motion.div
        className={styles.buildingMainChar}
        initial={{ left: '-12%', bottom: `${GROUND_PCT}%` }}
        animate={{ left: `${charLeft}%`, bottom: `${charBottom}%` }}
        transition={{ duration: walkDuration, ease: 'easeInOut' }}
      >
        <Character state={charState} depth={0} />
      </motion.div>
    </div>
  )
}

// ── Level 2 scene — The Coin Stack ────────────────────────────────────────────

function Level2Scene({ clones, characterAtEnd, level }) {
  const coinCount = level.scene?.coinCount ?? 5
  const remainingCoins = Math.max(0, coinCount - clones.length)

  const [charState,  setCharState]  = useState('idle')
  const [charX,      setCharX]      = useState(-12)
  const [walkDur,    setWalkDur]    = useState(1.0)
  const [showTotal,  setShowTotal]  = useState(false)

  // Walk in from left on mount
  useEffect(() => {
    const t = setTimeout(() => setCharX(8), 80)
    return () => clearTimeout(t)
  }, [])

  // Success: character walks forward, total pops up
  useEffect(() => {
    if (!characterAtEnd) return
    setCharState('walk')
    setWalkDur(1.1)
    const t1 = setTimeout(() => setCharX(20), 50)
    const t2 = setTimeout(() => { setCharState('idle'); setShowTotal(true) }, 1300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [characterAtEnd])

  const visibleClones  = clones.slice(0, 7)
  const overflowClones = clones.slice(7)

  return (
    <div className={styles.scene}>
      <div className={styles.bgSky} />
      <div className={styles.bgMid} />

      {/* ── Left platform — character + clones ── */}
      <div className={styles.platformLeft}>
        <div className={styles.platformSurface} />
        <div className={styles.platformBody} />

        <div className={styles.cloneStack}>
          {visibleClones.map((c, i) => (
            <div
              key={c.depth}
              className={styles.cloneSlot}
              style={{ zIndex: 10 - i, transform: `translateX(${i * 8}px)` }}
            >
              <div className={c.isReturning ? styles.cloneReturning : ''}>
                <div className={`${styles.cloneSpawnAnim} ${c.isBase ? styles.baseCaseClone : ''}`}>
                  <Character state="clone" depth={c.depth} />
                  <div className={styles.cloneCoinBadge}>🪙</div>
                  {c.isReturning && c.returnValue != null && (
                    <div className={styles.returnBubble}>{String(c.returnValue)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right platform — coin pile ── */}
      <div className={styles.platformRight}>
        <div className={styles.platformSurface} />
        <div className={styles.platformBody} />

        {/* Stacked coin discs — shrink from top as clones pick them up */}
        <div className={styles.coinPile}>
          <AnimatePresence>
            {Array.from({ length: remainingCoins }, (_, i) => (
              <motion.div
                key={i}
                className={styles.coinDisc}
                style={{ bottom: `${i * 14}px` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.2, opacity: 0, y: -24 }}
                transition={{ duration: 0.28 }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Success total */}
        <AnimatePresence>
          {showTotal && (
            <motion.div
              className={styles.coinTotal}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              ✓ {coinCount}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Overflow clones ── */}
      {overflowClones.map((c, i) => (
        <motion.div
          key={`ov-${c.depth}`}
          className={styles.overflowClone}
          initial={{ x: '40%', y: 0, opacity: 0 }}
          animate={{
            x: `${(Math.random() - 0.5) * 120}%`,
            y: -(60 + Math.random() * 140),
            opacity: [0, 0.9, 0],
            rotate: (Math.random() - 0.5) * 200,
          }}
          transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
        >
          <Character state="clone" depth={c.depth + 2} />
        </motion.div>
      ))}

      {/* ── Main character ── */}
      <motion.div
        className={styles.mainChar}
        initial={{ left: '-12%' }}
        animate={{ left: `${charX}%` }}
        transition={{ duration: walkDur, ease: 'easeInOut' }}
      >
        <Character state={charState} depth={0} />
      </motion.div>
    </div>
  )
}

// ── SceneView router ──────────────────────────────────────────────────────────

export default function SceneView({ level, clones, characterAtEnd }) {
  if (level.id === 1) {
    return <Level1Scene clones={clones} characterAtEnd={characterAtEnd} level={level} />
  }
  return <Level2Scene clones={clones} characterAtEnd={characterAtEnd} level={level} />
}
