import { useState, useEffect, useRef, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { speak } from '../systems/narratorSystem.js'
import Character from './Character.jsx'
import styles from './ConceptScreen.module.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const NUM_FIGURES = 5

const STEP_LABELS = [
  'The Hook',
  'A Queue',
  'Name the Parts',
  'The Return',
  'In Python',
  'Quick Check',
  'Ready',
]

const STEP_EXPRESSIONS = [
  'neutral', 'neutral', 'engaged', 'engaged',
  'professional', 'stern', 'warm',
]

const STEP_BG = [
  '#fff9f5', '#f0f4ff', '#f0f4ff', '#f0fdf4',
  '#f5f5f8', '#fffbf0', '#fff9f5',
]

const STEP_LINES = [
  "Imagine someone hands you a box. Inside that box is another box. Inside that box is another box. This continues until you find one small enough to open directly. That's not a metaphor. That is exactly how recursion works.",
  "You're at the back of a queue. You want to know how many people are ahead of you. You ask the person in front. They don't know either. So they ask the person in front of them. This continues until someone at the front says: nobody is ahead of me. Zero. Then the answer travels back.",
  "The person at the front — the one who says zero without asking anyone — that's the base case. The stopping condition. Without it, everyone asks forever and the answer never comes. The rest of them, the ones who ask and wait — that's the recursive case.",
  "Once the answer starts traveling back, each person adds one and passes it on. The person at the back gets the full count. That journey back — that is the return chain. Every recursive function has one.",
  "Here is the same logic in Python. A function that counts how many people are in the queue ahead of you. Read each line.",
  "Before we go any further. One question.",
  "Good. You understand the concept. What comes next is the same logic — base case, recursive call, return chain — except you're writing it. The levels ahead will not explain it again.",
]

const LINE_7B = "One more thing. The call stack panel — that panel on the right in the game — shows every function call as it happens. Everything I just explained will be visible there in real time. Do not ignore it."

const STEP_BUTTON_LABELS = [
  'I see it',
  'Got it',
  'Confirmed',
  'I understand',
  'I think I get it',
  'Continue →',
  'BEGIN →',
]

// ── Shared: Stick Figure ───────────────────────────────────────────────────────

const FIGURE_COLORS = {
  idle:      '#94a3b8',
  question:  '#2563eb',
  baseCase:  '#16a34a',
  recursive: '#2563eb',
  returning: '#16a34a',
  dim:       '#e2e8f0',
  done:      '#64748b',
}

function StickFigure({ variant = 'idle', size = 48, onClick }) {
  const color = FIGURE_COLORS[variant] || FIGURE_COLORS.idle
  const cx = size / 2
  const headR = size * 0.17

  return (
    <motion.div
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      whileHover={onClick ? { scale: 1.12 } : {}}
      whileTap={onClick ? { scale: 0.9 } : {}}
    >
      <svg width={size} height={size * 1.4} viewBox={`0 0 ${size} ${size * 1.4}`} overflow="visible">
        <circle cx={cx} cy={headR + 2} r={headR} fill="none" stroke={color} strokeWidth="2.5" />
        <line x1={cx} y1={headR * 2 + 2} x2={cx} y2={size * 0.78} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={cx - size * 0.22} y1={size * 0.52} x2={cx + size * 0.22} y2={size * 0.52} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={cx} y1={size * 0.78} x2={cx - size * 0.18} y2={size * 1.32} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={cx} y1={size * 0.78} x2={cx + size * 0.18} y2={size * 1.32} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

// ── Step 1: Gift Box (recursive nested boxes) ─────────────────────────────────

// A recursive component — fittingly
function NestBox({ phase, depth }) {
  const BOX_SIZES  = [[170, 120], [116, 82], [74, 52]]
  const COLORS     = ['#f97316', '#3b82f6', '#22c55e']
  const LID_HEIGHT = [28, 22, 16]

  if (depth >= 3) return null

  const [w, h]   = BOX_SIZES[depth]
  const color    = COLORS[depth]
  const lidH     = LID_HEIGHT[depth]
  const lidOpen  = phase > depth
  const showInner = phase > depth

  return (
    <div
      className={styles.nestBox}
      style={{ width: w, height: h, borderColor: color }}
    >
      {/* Lid lifts when opened */}
      <motion.div
        className={styles.nestLid}
        style={{ height: lidH, background: color }}
        animate={lidOpen ? { y: -(lidH + 8), opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Inner content */}
      <div className={styles.nestInner}>
        <AnimatePresence>
          {showInner && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.38, type: 'spring', stiffness: 200 }}
            >
              {depth < 2 ? (
                <NestBox phase={phase} depth={depth + 1} />
              ) : (
                <AnimatePresence>
                  {phase >= 3 && (
                    <motion.div
                      className={styles.baseLabel}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.2 }}
                    >
                      ★ base case
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function GiftBoxStep({ onUnlock }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    onUnlock() // button available immediately
    const t = [
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 1900),
      setTimeout(() => setPhase(3), 2900),
    ]
    return () => t.forEach(clearTimeout)
  }, []) // eslint-disable-line

  return (
    <div className={styles.giftScene}>
      <motion.div
        animate={phase === 0 ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <NestBox phase={phase} depth={0} />
      </motion.div>

      <AnimatePresence>
        {phase >= 3 && (
          <motion.p
            className={styles.giftCaption}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Small enough to open directly. That is the base case.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Step 2: Queue — pass question forward ─────────────────────────────────────

function QueueForwardStep({ onUnlock }) {
  // arrowProgress: how many figures have received the question (from the back, i=4 first)
  const [arrowProgress, setArrowProgress] = useState(0)
  const [phase, setPhase]   = useState('auto')  // 'auto' | 'interactive' | 'returning' | 'done'
  const [clicked, setClicked] = useState(new Set())
  const [returnStep, setReturnStep] = useState(-1)

  // Auto arrow phase
  useEffect(() => {
    if (phase !== 'auto') return
    if (arrowProgress >= NUM_FIGURES) {
      setTimeout(() => setPhase('interactive'), 400)
      return
    }
    const t = setTimeout(() => setArrowProgress(p => p + 1), 420)
    return () => clearTimeout(t)
  }, [phase, arrowProgress])

  // Return chain phase
  useEffect(() => {
    if (phase !== 'returning') return
    if (returnStep >= NUM_FIGURES - 1) {
      setPhase('done')
      onUnlock()
      return
    }
    const t = setTimeout(() => setReturnStep(s => s + 1), 520)
    return () => clearTimeout(t)
  }, [phase, returnStep]) // eslint-disable-line

  function handleClick(i) {
    if (phase !== 'interactive') return
    if (clicked.has(i)) return
    const next = new Set(clicked)
    next.add(i)
    setClicked(next)
    if (next.size === NUM_FIGURES) {
      setTimeout(() => { setPhase('returning'); setReturnStep(0) }, 700)
    }
  }

  // i=0 is FRONT (left), i=4 is BACK/YOU (right)
  // question travels right→left (from i=4 to i=0)
  // Figure i is "lit" in auto phase when arrowProgress >= (NUM_FIGURES - i)
  function figureVariant(i) {
    if (phase === 'auto') {
      return arrowProgress >= NUM_FIGURES - i ? 'question' : 'idle'
    }
    if (phase === 'interactive') {
      return clicked.has(i) ? 'done' : 'idle'
    }
    if (phase === 'returning' || phase === 'done') {
      return returnStep >= i ? 'baseCase' : 'idle'
    }
    return 'idle'
  }

  // Arrow segment between i and i+1 (gap g = i, between figure i and i+1)
  // lights up when arrowProgress >= (NUM_FIGURES - 1 - i)
  function arrowLit(i) {
    return phase === 'auto' && arrowProgress >= NUM_FIGURES - 1 - i
  }

  return (
    <div className={styles.queueScene}>
      <div className={styles.figureRow}>
        {Array.from({ length: NUM_FIGURES }).map((_, i) => (
          <Fragment key={i}>
            <div className={styles.figureCol}>
              <div className={styles.figureTop}>
                {phase === 'interactive' && !clicked.has(i) && (
                  <motion.div
                    className={styles.questionBadge}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >?</motion.div>
                )}
                {phase === 'interactive' && clicked.has(i) && (
                  <motion.div
                    className={styles.checkBadge}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                  >✓</motion.div>
                )}
                {(phase === 'returning' || phase === 'done') && returnStep >= i && (
                  <motion.div
                    className={styles.returnVal}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >{i}</motion.div>
                )}
              </div>
              <StickFigure
                variant={figureVariant(i)}
                size={44}
                onClick={phase === 'interactive' && !clicked.has(i) ? () => handleClick(i) : null}
              />
              <div className={styles.figureLabel}>
                {i === 0 ? 'FRONT' : i === 4 ? 'YOU' : ''}
              </div>
            </div>

            {/* Arrow gap between figure i and i+1 */}
            {i < NUM_FIGURES - 1 && (
              <div className={`${styles.arrowGap} ${arrowLit(i) ? styles.arrowGapLit : ''}`}>
                {phase === 'returning' || phase === 'done' ? '→' : '←'}
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <div className={styles.queueCaption}>
        {phase === 'auto'        && 'Question passes forward…'}
        {phase === 'interactive' && `Click each person to pass the question (${clicked.size} / ${NUM_FIGURES})`}
        {phase === 'returning'   && 'Answer travels back…'}
        {phase === 'done'        && '4 people are ahead of you. Return chain complete.'}
      </div>
    </div>
  )
}

// ── Step 3: Label assignment ───────────────────────────────────────────────────

function LabelStep({ onUnlock, onNarrate, isMuted }) {
  const isMutedRef = useRef(isMuted)
  isMutedRef.current = isMuted

  const [selected,       setSelected]       = useState(null)  // null | 'base' | 'recursive'
  const [basePlaced,     setBasePlaced]      = useState(false)
  const [recursivePlaced, setRecursivePlaced] = useState(false)
  const [shake,          setShake]           = useState(null)  // which chip to shake

  useEffect(() => {
    if (basePlaced && recursivePlaced) onUnlock()
  }, [basePlaced, recursivePlaced]) // eslint-disable-line

  function triggerShake(chip) {
    setShake(chip)
    setTimeout(() => setShake(null), 500)
  }

  function handleChipClick(chip) {
    if (chip === 'base'      && basePlaced)      return
    if (chip === 'recursive' && recursivePlaced) return
    setSelected(prev => prev === chip ? null : chip)
  }

  function handleFigureClick(i) {
    if (!selected) return

    if (selected === 'base') {
      if (i === 0) {
        setBasePlaced(true)
        setSelected(null)
      } else {
        const msg = "No. The base case is the one who already has the answer — the person at the front who doesn't need to ask anyone."
        onNarrate(msg)
        speak(msg, isMutedRef.current)
        triggerShake('base')
        setSelected(null)
      }
    } else if (selected === 'recursive') {
      if (i !== 0) {
        setRecursivePlaced(true)
        setSelected(null)
      } else {
        const msg = "No. The recursive case is everyone who asks the person ahead of them. That's everyone except the front person."
        onNarrate(msg)
        speak(msg, isMutedRef.current)
        triggerShake('recursive')
        setSelected(null)
      }
    }
  }

  function figureVariant(i) {
    if (i === 0) return basePlaced ? 'baseCase' : 'idle'
    return recursivePlaced ? 'recursive' : 'dim'
  }

  return (
    <div className={styles.labelScene}>
      {/* Chips */}
      <div className={styles.chipRow}>
        <motion.button
          className={`${styles.chip} ${styles.chipBase}
            ${selected === 'base'      ? styles.chipSelected : ''}
            ${basePlaced               ? styles.chipPlaced   : ''}
            ${shake === 'base'         ? styles.chipShake    : ''}`}
          onClick={() => handleChipClick('base')}
          whileHover={!basePlaced ? { scale: 1.05 } : {}}
          animate={shake === 'base' ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {basePlaced ? '✓ ' : ''}BASE CASE
        </motion.button>

        <motion.button
          className={`${styles.chip} ${styles.chipRecursive}
            ${selected === 'recursive' ? styles.chipSelected : ''}
            ${recursivePlaced          ? styles.chipPlaced   : ''}
            ${shake === 'recursive'    ? styles.chipShake    : ''}`}
          onClick={() => handleChipClick('recursive')}
          whileHover={!recursivePlaced ? { scale: 1.05 } : {}}
          animate={shake === 'recursive' ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {recursivePlaced ? '✓ ' : ''}RECURSIVE CASE
        </motion.button>
      </div>

      {selected && (
        <motion.div
          className={styles.labelHint}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          Now click the correct person ↓
        </motion.div>
      )}

      {/* Queue */}
      <div className={styles.figureRow}>
        {Array.from({ length: NUM_FIGURES }).map((_, i) => (
          <Fragment key={i}>
            <div className={styles.figureCol}>
              <div className={styles.figureTop}>
                {i === 0 && basePlaced && (
                  <motion.div className={`${styles.placedLabel} ${styles.placedBase}`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    BASE CASE
                  </motion.div>
                )}
                {i > 0 && recursivePlaced && (
                  <motion.div className={`${styles.placedLabel} ${styles.placedRecursive}`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    RECURSIVE
                  </motion.div>
                )}
              </div>
              <StickFigure
                variant={figureVariant(i)}
                size={44}
                onClick={selected ? () => handleFigureClick(i) : null}
              />
              <div className={styles.figureLabel}>
                {i === 0 ? 'FRONT' : i === 4 ? 'YOU' : ''}
              </div>
            </div>
            {i < NUM_FIGURES - 1 && <div className={styles.arrowGapDim}>←</div>}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

// ── Step 4: Return chain — click to pass the answer back ──────────────────────

function QueueReturnStep({ onUnlock }) {
  const [activeIdx, setActiveIdx] = useState(0) // which figure is waiting to be clicked (0=front)

  function handleClick(i) {
    if (i !== activeIdx) return
    if (activeIdx < NUM_FIGURES - 1) {
      setActiveIdx(i + 1)
    } else {
      onUnlock()
      setActiveIdx(NUM_FIGURES) // done
    }
  }

  const isDone = activeIdx >= NUM_FIGURES

  return (
    <div className={styles.queueScene}>
      <div className={styles.figureRow}>
        {Array.from({ length: NUM_FIGURES }).map((_, i) => {
          const isPast    = activeIdx > i
          const isCurrent = activeIdx === i

          return (
            <Fragment key={i}>
              <div className={styles.figureCol}>
                <div className={styles.figureTop}>
                  {isPast && (
                    <motion.div className={styles.returnVal}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                      {i}
                    </motion.div>
                  )}
                  {isCurrent && (
                    <motion.div className={styles.clickPrompt}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1 }}>
                      click
                    </motion.div>
                  )}
                </div>
                <StickFigure
                  variant={isPast ? 'done' : isCurrent ? 'baseCase' : 'idle'}
                  size={44}
                  onClick={isCurrent ? () => handleClick(i) : null}
                />
                <div className={styles.figureLabel}>
                  {i === 0 ? 'FRONT' : i === 4 ? 'YOU' : ''}
                </div>
              </div>
              {i < NUM_FIGURES - 1 && (
                <div className={`${styles.arrowGap} ${isPast ? styles.arrowGapLit : ''}`}>
                  →
                </div>
              )}
            </Fragment>
          )
        })}
      </div>

      <div className={styles.queueCaption}>
        {isDone
          ? 'Return chain complete. 4 people are ahead of you.'
          : activeIdx === 0
            ? 'P0 knows: "nobody ahead of me — the answer is 0". Click to pass it back.'
            : `Click P${activeIdx} to pass the answer (${activeIdx}) further back.`
        }
      </div>
    </div>
  )
}

// ── Step 5: Code block ────────────────────────────────────────────────────────

const CODE_LINES = [
  { text: 'def count_ahead(position):',                              type: 'def',    note: 'The function takes a position — how far from the front you are.' },
  { text: '    if position == 0:',                                   type: 'base',   note: "If your position is zero, you're at the front. Nobody is ahead of you. Return zero — that's your base case.", comment: '# base case',     commentKey: 'base' },
  { text: '        return 0',                                        type: 'return', note: null },
  { text: '    return 1 + count_ahead(position - 1)',                type: 'recurse', note: 'Otherwise: one person is directly ahead of you, plus however many are ahead of them. That is 1 plus count_ahead of position minus 1.', comment: '# recursive case', commentKey: 'recursive' },
]

function CodeStep({ onUnlock, onNarrate, isMuted }) {
  const isMutedRef = useRef(isMuted)
  isMutedRef.current = isMuted

  const [visibleLines,    setVisibleLines]    = useState(0)
  const [clickedComments, setClickedComments] = useState(new Set())

  const allVisible = visibleLines >= CODE_LINES.length

  // Reveal lines one by one, gated on audio completion
  useEffect(() => {
    if (visibleLines >= CODE_LINES.length) return
    let cancelled = false
    async function revealNext() {
      // First line: let the step-intro audio start before interrupting it
      if (visibleLines === 0) await new Promise(r => setTimeout(r, 950))
      if (cancelled) return
      const line = CODE_LINES[visibleLines]
      if (line?.note) {
        onNarrate(line.note)
        await speak(line.note, isMutedRef.current)
      } else {
        await new Promise(r => setTimeout(r, 400))
      }
      if (!cancelled) setVisibleLines(v => v + 1)
    }
    revealNext()
    return () => { cancelled = true }
  }, [visibleLines]) // eslint-disable-line

  // Unlock when both comments clicked
  useEffect(() => {
    if (clickedComments.size >= 2) onUnlock()
  }, [clickedComments]) // eslint-disable-line

  function handleCommentClick(key) {
    if (!allVisible) return
    setClickedComments(prev => new Set([...prev, key]))
  }

  return (
    <div className={styles.codeScene}>
      <div className={styles.codeBlock}>
        {CODE_LINES.map((line, i) => (
          <AnimatePresence key={i}>
            {i < visibleLines && (
              <motion.div
                className={`${styles.codeLine} ${styles[`codeType_${line.type}`]}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
              >
                {line.comment ? (
                  <>
                    <span>{line.text + '  '}</span>
                    <motion.span
                      className={`
                        ${styles.codeComment}
                        ${allVisible && !clickedComments.has(line.commentKey) ? styles.commentPulse : ''}
                        ${clickedComments.has(line.commentKey) ? styles.commentClicked : ''}
                      `}
                      onClick={() => handleCommentClick(line.commentKey)}
                      whileHover={allVisible ? { scale: 1.05 } : {}}
                    >
                      {line.comment}
                    </motion.span>
                  </>
                ) : (
                  line.text
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <AnimatePresence>
        {allVisible && clickedComments.size < 2 && (
          <motion.p className={styles.codeHint}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Click both comments to continue
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Step 6: Quiz ──────────────────────────────────────────────────────────────

const QUIZ_OPTIONS = [
  { id: 'A', text: 'The function returns 0 immediately',             correct: false },
  { id: 'B', text: 'The function calls itself forever and crashes',  correct: true  },
  { id: 'C', text: 'The function skips the recursive case',          correct: false },
]

function QuizStep({ onUnlock, onNarrate, isMuted }) {
  const isMutedRef = useRef(isMuted)
  isMutedRef.current = isMuted

  const [selected, setSelected] = useState(null)
  const [status,   setStatus]   = useState('idle') // 'idle' | 'wrong' | 'correct'

  function handleSelect(option) {
    if (status === 'correct') return
    setSelected(option.id)

    if (option.correct) {
      setStatus('correct')
      const msg = "Correct. That's a stack overflow. Python calls it a RecursionError. You're about to see one. I apologize in advance."
      onNarrate(msg)
      speak(msg, isMutedRef.current)
      setTimeout(() => onUnlock(), 1100)
    } else {
      setStatus('wrong')
      const msg = "No. Think about it. If there's no stopping condition — no base case — what stops the function from calling itself?"
      onNarrate(msg)
      speak(msg, isMutedRef.current)
      setTimeout(() => { setSelected(null); setStatus('idle') }, 1500)
    }
  }

  return (
    <div className={styles.quizScene}>
      <motion.div
        className={styles.quizQuestion}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        What happens if you remove the base case?
      </motion.div>

      <div className={styles.quizOptions}>
        {QUIZ_OPTIONS.map((opt, idx) => {
          const isSelected = selected === opt.id
          const isWrong    = isSelected && status === 'wrong'
          const isCorrect  = isSelected && status === 'correct'

          return (
            <motion.button
              key={opt.id}
              className={`${styles.quizOption}
                ${isCorrect ? styles.optionCorrect : ''}
                ${isWrong   ? styles.optionWrong   : ''}
              `}
              onClick={() => handleSelect(opt)}
              initial={{ opacity: 0, x: -12 }}
              animate={{
                opacity: 1,
                x: isWrong ? [0, -8, 8, -8, 8, 0] : 0,
              }}
              transition={{ delay: idx * 0.12 + 0.3, duration: isWrong ? 0.35 : 0.25 }}
              whileHover={status !== 'correct' ? { x: 6 } : {}}
            >
              <span className={styles.optionId}>{opt.id}</span>
              <span className={styles.optionText}>{opt.text}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 7: Ready ─────────────────────────────────────────────────────────────

function ReadyStep({ onUnlock, onNarrate, isMuted }) {
  const isMutedRef = useRef(isMuted)
  isMutedRef.current = isMuted

  const [showSecond, setShowSecond] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => {
      setShowSecond(true)
      onNarrate(LINE_7B)
      speak(LINE_7B, isMutedRef.current)
    }, 2800)
    const t2 = setTimeout(() => onUnlock(), 4600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line

  return (
    <div className={styles.readyScene}>
      <div className={styles.readyStage}>
        <motion.div
          className={styles.readyChar}
          initial={{ left: '-15%' }}
          animate={{ left: '32%' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <Character state="idle" depth={0} />
        </motion.div>
      </div>

      <AnimatePresence>
        {showSecond && (
          <motion.div
            className={styles.readyNote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            The call stack panel shows everything I just explained — in real time.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main ConceptScreen ────────────────────────────────────────────────────────

export default function ConceptScreen({ isMuted, onComplete, setNarratorLine, onExpressionChange }) {
  const [stepIndex,   setStepIndex]   = useState(0)
  const [canAdvance,  setCanAdvance]  = useState(false)
  const [bgColor,     setBgColor]     = useState(STEP_BG[0])

  // Fire narrator + expression on each step
  useEffect(() => {
    const text = STEP_LINES[stepIndex]
    setNarratorLine(text)
    speak(text, isMuted)
    onExpressionChange(STEP_EXPRESSIONS[stepIndex])
    setBgColor(STEP_BG[stepIndex])
  }, [stepIndex]) // eslint-disable-line

  function handleUnlock() { setCanAdvance(true) }

  function handleNarrate(text) { setNarratorLine(text) }

  function handleAdvance() {
    if (!canAdvance) return
    // Reset before the next step mounts so its unlock logic starts fresh
    setCanAdvance(false)
    if (stepIndex >= 6) {
      onComplete()
    } else {
      setStepIndex(i => i + 1)
    }
  }

  const stepProps = {
    onUnlock: handleUnlock,
    onNarrate: handleNarrate,
    isMuted,
  }

  return (
    <div
      className={styles.screen}
      style={{ background: bgColor, transition: 'background 0.6s ease' }}
    >
      {/* Progress dots */}
      <div className={styles.progress}>
        {STEP_LINES.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot}
              ${i === stepIndex ? styles.dotCurrent : ''}
              ${i  < stepIndex  ? styles.dotDone    : ''}
            `}
          />
        ))}
      </div>

      {/* Step header */}
      <div className={styles.stepHeader}>
        <span className={styles.stepNum}>{stepIndex + 1} / 7</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIndex}
            className={styles.stepTitle}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {STEP_LABELS[stepIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Step body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          className={styles.stepBody}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -22 }}
          transition={{ duration: 0.32 }}
        >
          {stepIndex === 0 && <GiftBoxStep {...stepProps} />}
          {stepIndex === 1 && <QueueForwardStep {...stepProps} />}
          {stepIndex === 2 && <LabelStep {...stepProps} />}
          {stepIndex === 3 && <QueueReturnStep {...stepProps} />}
          {stepIndex === 4 && <CodeStep {...stepProps} />}
          {stepIndex === 5 && <QuizStep {...stepProps} />}
          {stepIndex === 6 && <ReadyStep {...stepProps} />}
        </motion.div>
      </AnimatePresence>

      {/* Advance button */}
      <AnimatePresence>
        {canAdvance && (
          <motion.button
            className={`${styles.nextBtn} ${stepIndex === 6 ? styles.beginBtn : ''}`}
            onClick={handleAdvance}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {STEP_BUTTON_LABELS[stepIndex]}
          </motion.button>
        )}
      </AnimatePresence>

      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />
    </div>
  )
}
