import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Character from './Character.jsx'
import styles from './SceneView.module.css'

// ── Level 1 scene ──────────────────────────────────────────────────────────────

function Level1Scene({ clones, characterAtEnd }) {
  const [charState,  setCharState]  = useState('idle')
  const [charX,      setCharX]      = useState(16)
  const [coinCaught, setCoinCaught] = useState(false)

  useEffect(() => {
    if (characterAtEnd) {
      setCharState('walk')
      const t1 = setTimeout(() => setCharX(71), 50)
      const t2 = setTimeout(() => { setCharState('idle'); setCoinCaught(true) }, 950)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [characterAtEnd])

  // Show at most 7 clones on-screen; extras trigger overflow visual
  const visibleClones  = clones.slice(0, 7)
  const overflowClones = clones.slice(7, 14)

  return (
    <div className={styles.scene}>

      {/* ── 3-layer background ── */}
      <div className={styles.bgSky} />
      <div className={styles.bgMid} />

      {/* ── Left platform ── */}
      <div className={styles.platformLeft}>
        <div className={styles.platformSurface} />
        <div className={styles.platformBody} />

        {/* Clones stack left-to-right from the character's position */}
        <div className={styles.cloneStack}>
          {visibleClones.map((c, i) => (
            <div
              key={c.depth}
              className={styles.cloneSlot}
              style={{ zIndex: 10 - i, transform: `translateX(${i * 8}px)` }}
            >
              <Character state="clone" depth={c.depth} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Gap ── */}
      <div className={styles.gap}>
        <div className={styles.gapWall} />
        <div className={styles.gapFloor} />
        <div className={styles.gapFog} />
      </div>

      {/* ── Right platform ── */}
      <div className={styles.platformRight}>
        <div className={styles.platformSurface} />
        <div className={styles.platformBody} />

        {/* Spinning coin */}
        <AnimatePresence>
          {!coinCaught && (
            <motion.div
              className={styles.coin}
              exit={{ scale: 2.5, opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className={styles.coinSpin}>🪙</div>
            </motion.div>
          )}
        </AnimatePresence>

        {coinCaught && (
          <motion.div
            className={styles.coinSplash}
            initial={{ scale: 0.4, opacity: 0, y: 0 }}
            animate={{ scale: 2, opacity: [0, 1, 0], y: -36 }}
            transition={{ duration: 0.55 }}
          >
            ✨+1
          </motion.div>
        )}
      </div>

      {/* ── Overflow clones flying off screen ── */}
      {overflowClones.map((c, i) => (
        <motion.div
          key={`ov-${c.depth}`}
          className={styles.overflowClone}
          initial={{ x: '40%', y: 0, opacity: 0 }}
          animate={{
            x: `${(Math.random() - 0.5) * 120}%`,
            y:  -(60 + Math.random() * 140),
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
        animate={{ left: `${charX}%` }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        <Character state={charState} depth={0} />
      </motion.div>

    </div>
  )
}

// ── Level 2 scene ──────────────────────────────────────────────────────────────

function Level2Scene({ clones, characterAtEnd, level }) {
  const numSteps = level.scene?.stairCount ?? 5
  const [charStep,  setCharStep]  = useState(0)
  const [charState, setCharState] = useState('idle')

  useEffect(() => {
    if (!characterAtEnd) return
    let s = 0
    const interval = setInterval(() => {
      s++
      if (s <= numSteps) {
        setCharState('walk')
        setCharStep(s)
      } else {
        setCharState('idle')
        clearInterval(interval)
      }
    }, 240)
    return () => clearInterval(interval)
  }, [characterAtEnd, numSteps])

  // Step geometry: each stair is 12% wide, bottom rises 8% per step
  const stepW  = 80 / (numSteps + 1)  // % of scene width
  const startX = 4                    // % from left for step 0

  function stepLeft(i)   { return `${startX + i * stepW}%` }
  function stepBottom(i) { return `${14 + i * 8}%` }

  return (
    <div className={styles.scene}>
      <div className={styles.bgSky} />
      <div className={styles.bgMid} />

      {/* Ground */}
      <div className={styles.groundBar} />

      {/* Stair steps */}
      {Array.from({ length: numSteps }, (_, i) => (
        <div
          key={i}
          className={styles.stair}
          style={{ left: stepLeft(i + 1), bottom: stepBottom(i) }}
        />
      ))}

      {/* Flag at top step */}
      <div
        className={styles.flag}
        style={{ left: stepLeft(numSteps + 0.3), bottom: `calc(${stepBottom(numSteps)} + 36px)` }}
      >
        🏁
      </div>

      {/* Clone characters on each step */}
      {clones.map((c, i) => (
        <div
          key={c.depth}
          className={styles.stairChar}
          style={{ left: stepLeft(i + 1), bottom: `calc(${stepBottom(i)} + 4px)` }}
        >
          <Character state="clone" depth={c.depth} />
        </div>
      ))}

      {/* Main character */}
      <motion.div
        className={styles.stairChar}
        animate={{
          left:   stepLeft(charStep),
          bottom: `calc(${stepBottom(Math.max(0, charStep - 1))} + 4px)`,
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{ position: 'absolute' }}
      >
        <Character state={charState} depth={0} />
      </motion.div>
    </div>
  )
}

// ── SceneView ──────────────────────────────────────────────────────────────────

export default function SceneView({ level, clones, characterAtEnd }) {
  if (level.id === 1) {
    return <Level1Scene clones={clones} characterAtEnd={characterAtEnd} />
  }
  return <Level2Scene clones={clones} characterAtEnd={characterAtEnd} level={level} />
}
