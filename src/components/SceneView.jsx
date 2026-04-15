import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Character from './Character.jsx'
import styles from './SceneView.module.css'

// ── Ambient floating code symbols ─────────────────────────────────────────────

const PARTICLES = [
  { sym: '{}', left: '8%',  top: '15%', dur: 5.5 },
  { sym: '()', left: '23%', top: '62%', dur: 4.2 },
  { sym: '=>', left: '35%', top: '28%', dur: 6.8 },
  { sym: '//', left: '54%', top: '70%', dur: 4.8 },
  { sym: '∞',  left: '66%', top: '20%', dur: 7.1 },
  { sym: 'λ',  left: '78%', top: '52%', dur: 5.2 },
  { sym: '↩',  left: '88%', top: '38%', dur: 6.0 },
  { sym: '0',  left: '14%', top: '80%', dur: 4.5 },
]

function AmbientParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 0.09, y: 15 }}
          transition={{ duration: p.dur, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            fontFamily: 'Space Mono, monospace',
            fontSize: '11px',
            color: '#7dd3fc',
            userSelect: 'none',
          }}
        >
          {p.sym}
        </motion.span>
      ))}
    </div>
  )
}

// ── Level 1 scene — The Floors (Building) ─────────────────────────────────────

function Level1Scene({ clones, characterAtEnd, level }) {
  const numFloors = level.scene?.floorCount ?? 5

  const [charLeft,     setCharLeft]     = useState(-12)  // % from left
  const [charBottom,   setCharBottom]   = useState(14)   // % from bottom
  const [walkDuration, setWalkDuration] = useState(1.0)
  const [charState,    setCharState]    = useState('idle')
  const [doorGlow,     setDoorGlow]     = useState(false)
  const [maxCalls,     setMaxCalls]     = useState(0)
  const maxCallsRef = useRef(0)

  useEffect(() => {
    if (clones.length > maxCallsRef.current) {
      maxCallsRef.current = clones.length
      setMaxCalls(clones.length)
    }
  }, [clones])

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
      <AmbientParticles />
      {maxCalls > 0 && <div className={styles.callsCounterLeft}>CALLS: {maxCalls}</div>}

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
  const [maxCalls,   setMaxCalls]   = useState(0)
  const maxCallsRef = useRef(0)

  useEffect(() => {
    if (clones.length > maxCallsRef.current) {
      maxCallsRef.current = clones.length
      setMaxCalls(clones.length)
    }
  }, [clones])

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
      <AmbientParticles />
      {maxCalls > 0 && <div className={styles.callsCounterLeft}>CALLS: {maxCalls}</div>}

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

// ── Level 3: Full fib(5) tree — 15 nodes, 5 rows ─────────────────────────────

const FIB_TREE = [
  { id: 0,  label: 'fib(5)', value: 5, x: 50, y: 6,  isBase: false },
  { id: 1,  label: 'fib(4)', value: 3, x: 28, y: 22, isBase: false },
  { id: 2,  label: 'fib(3)', value: 2, x: 72, y: 22, isBase: false },
  { id: 3,  label: 'fib(3)', value: 2, x: 14, y: 38, isBase: false },
  { id: 4,  label: 'fib(2)', value: 1, x: 36, y: 38, isBase: false },
  { id: 5,  label: 'fib(2)', value: 1, x: 60, y: 38, isBase: false },
  { id: 6,  label: 'fib(1)', value: 1, x: 82, y: 38, isBase: true  },
  { id: 7,  label: 'fib(2)', value: 1, x: 11, y: 56, isBase: false },
  { id: 8,  label: 'fib(1)', value: 1, x: 22, y: 56, isBase: true  },
  { id: 9,  label: 'fib(1)', value: 1, x: 42, y: 56, isBase: true  },
  { id: 10, label: 'fib(0)', value: 0, x: 54, y: 56, isBase: true  },
  { id: 11, label: 'fib(1)', value: 1, x: 66, y: 56, isBase: true  },
  { id: 12, label: 'fib(0)', value: 0, x: 78, y: 56, isBase: true  },
  { id: 13, label: 'fib(1)', value: 1, x: 5,  y: 74, isBase: true  },
  { id: 14, label: 'fib(0)', value: 0, x: 16, y: 74, isBase: true  },
]

const FIB_EDGES = [
  [0,1],[0,2],
  [1,3],[1,4],[2,5],[2,6],
  [3,7],[3,8],[4,9],[4,10],[5,11],[5,12],
  [7,13],[7,14],
]

const CALL_ORDER   = [0,1,3,7,13,14,8,4,9,10,2,5,11,12,6]
const RETURN_ORDER = [13,14,7,8,3,9,10,4,11,12,5,6,2,1,0]
const NODE_ROW     = [0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4]

// ── Level 3 scene — The Split (Fibonacci Game) ────────────────────────────────

function Level3Scene({ clones, characterAtEnd, simOutcome, simResult, resetCount }) {
  const [nodeStatuses, setNodeStatuses] = useState(Array(15).fill('hidden'))
  const [nodeValues,   setNodeValues]   = useState(Array(15).fill(null))
  const [calledCount,  setCalledCount]  = useState(0)
  const [charState,    setCharState]    = useState('idle')
  const [charX,        setCharX]        = useState(-12)
  const [rippling,     setRippling]     = useState(false)
  const [showStars,    setShowStars]    = useState(false)
  const prevClonesLen = useRef(0)
  const calledIdx     = useRef(0)
  const resolvedIdx   = useRef(0)
  const wrongRef      = useRef(false)

  // Walk in on mount
  useEffect(() => {
    const t = setTimeout(() => setCharX(6), 80)
    return () => clearTimeout(t)
  }, [])

  // Success: walk + ripple wave + stars
  useEffect(() => {
    if (!characterAtEnd) return
    setCharState('walk')
    const t1 = setTimeout(() => setCharX(18), 50)
    const t2 = setTimeout(() => setCharState('idle'), 1300)
    const t3 = setTimeout(() => setRippling(true), 300)
    const t4 = setTimeout(() => setShowStars(true), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [characterAtEnd])

  // Wrong result: lock clones processing (scene shows red via simOutcome prop)
  useEffect(() => {
    if (simOutcome !== 'wrongResult') return
    wrongRef.current = true
  }, [simOutcome])

  // Overflow: glitch all currently active nodes
  useEffect(() => {
    if (simOutcome !== 'overflow') return
    wrongRef.current = true
    setNodeStatuses(s => s.map(v => v === 'active' ? 'overflow' : v))
  }, [simOutcome])

  // Reset all visual state when LevelScreen dispatches RESET
  useEffect(() => {
    if (resetCount === 0) return
    setNodeStatuses(Array(15).fill('hidden'))
    setNodeValues(Array(15).fill(null))
    setCalledCount(0)
    setCharState('idle')
    setCharX(6)
    setRippling(false)
    setShowStars(false)
    prevClonesLen.current = 0
    calledIdx.current = 0
    resolvedIdx.current = 0
    wrongRef.current = false
  }, [resetCount]) // eslint-disable-line

  // Tree animation: push → activate node, pop → resolve node
  useEffect(() => {
    if (wrongRef.current) return
    const prev = prevClonesLen.current
    const curr = clones.length

    if (curr > prev) {
      const nodeIdx = CALL_ORDER[calledIdx.current]
      if (nodeIdx !== undefined) {
        setNodeStatuses(s => s.map((v, i) => i === nodeIdx ? 'active' : v))
        setCalledCount(c => c + 1)
        calledIdx.current += 1
      }
    } else if (curr < prev) {
      const nodeIdx = RETURN_ORDER[resolvedIdx.current]
      if (nodeIdx !== undefined) {
        setNodeStatuses(s => s.map((v, i) => i === nodeIdx ? 'resolved' : v))
        setNodeValues(v => v.map((x, i) => i === nodeIdx ? FIB_TREE[nodeIdx].value : x))
        resolvedIdx.current += 1
      }
    }

    prevClonesLen.current = curr
  }, [clones]) // eslint-disable-line

  const isWrong = simOutcome === 'wrongResult'
  const stars   = calledCount <= 15 ? 3 : calledCount <= 20 ? 2 : 1

  return (
    <div className={styles.scene}>
      <div className={styles.bgSky} />
      <div className={styles.bgMid} />
      <AmbientParticles />

      {/* Connector lines */}
      <svg className={styles.fibTreeSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        {FIB_EDGES.map(([a, b]) => {
          const aStatus  = nodeStatuses[a]
          const bStatus  = nodeStatuses[b]
          const resolved = aStatus === 'resolved' && bStatus === 'resolved'
          const active   = aStatus !== 'hidden'   && bStatus !== 'hidden'
          return (
            <line
              key={`${a}-${b}`}
              x1={FIB_TREE[a].x} y1={FIB_TREE[a].y + 4}
              x2={FIB_TREE[b].x} y2={FIB_TREE[b].y}
              stroke={resolved ? '#4ade80' : active ? '#818cf8' : '#1e293b'}
              strokeWidth="0.8"
              strokeDasharray={active && !resolved ? '2,2' : 'none'}
            />
          )
        })}
      </svg>

      {/* Tree nodes */}
      {FIB_TREE.map((node, i) => {
        const status    = nodeStatuses[i]
        const isSuccess = characterAtEnd && i === 0
        const wrongRoot = isWrong && i === 0
        const classNames = [
          styles.fibNode,
          status === 'hidden'                                  ? styles.fibNodeHidden   : '',
          status === 'active'  && !wrongRoot                   ? styles.fibNodeActive   : '',
          status === 'overflow'                                ? styles.fibNodeGlitch   : '',
          status === 'resolved' && node.isBase                 ? styles.fibNodeBase     : '',
          status === 'resolved' && !node.isBase && !isSuccess  ? styles.fibNodeResolved : '',
          isSuccess                                            ? styles.fibNodeGold     : '',
          wrongRoot                                            ? styles.fibNodeWrong    : '',
          rippling                                             ? styles.fibNodeRipple   : '',
        ].filter(Boolean).join(' ')
        return (
          <div
            key={i}
            className={classNames}
            style={{
              left: `${node.x}%`,
              top:  `${node.y}%`,
              ...(rippling ? { animationDelay: `${NODE_ROW[i] * 80}ms` } : {}),
            }}
          >
            <div className={styles.fibNodeLabel}>{node.label}</div>
            <div className={`${styles.fibNodeValue} ${wrongRoot ? styles.fibNodeValueWrong : ''}`}>
              {wrongRoot
                ? simResult
                : (status === 'resolved' || isSuccess)
                  ? (nodeValues[i] ?? node.value)
                  : '?'
              }
            </div>
          </div>
        )
      })}


      {/* Star rating on success */}
      <AnimatePresence>
        {showStars && (
          <motion.div
            className={styles.fibStarRow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className={styles.fibStarIcons}>
              {[1, 2, 3].map(s => (
                <motion.span
                  key={s}
                  className={`${styles.fibStar} ${s <= stars ? styles.fibStarActive : ''}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: s * 0.12, type: 'spring', stiffness: 300, damping: 15 }}
                >
                  ★
                </motion.span>
              ))}
            </div>
            <div className={styles.fibStarLabel}>
              {stars === 3 ? 'PERFECT — 15 CALLS' : stars === 2 ? `${calledCount} CALLS` : `${calledCount} CALLS — INEFFICIENT`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call counter HUD */}
      <motion.div
        className={styles.fibCallCounter}
        animate={{ color: characterAtEnd ? '#4ade80' : '#7dd3fc' }}
      >
        CALLS: {calledCount} / 15
      </motion.div>

      {/* Character */}
      <motion.div
        className={styles.fibMainChar}
        initial={{ left: '-12%' }}
        animate={{ left: `${charX}%` }}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
      >
        <Character state={charState} depth={0} />
      </motion.div>
    </div>
  )
}

// ── SceneView router ──────────────────────────────────────────────────────────

export default function SceneView({ level, clones, characterAtEnd, simOutcome, simResult, resetCount }) {
  if (level.id === 1) return <Level1Scene clones={clones} characterAtEnd={characterAtEnd} level={level} />
  if (level.id === 3) return <Level3Scene clones={clones} characterAtEnd={characterAtEnd} simOutcome={simOutcome} simResult={simResult} resetCount={resetCount} />
  return <Level2Scene clones={clones} characterAtEnd={characterAtEnd} level={level} />
}
