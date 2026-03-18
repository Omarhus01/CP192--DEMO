import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { speak, LINES } from '../systems/narratorSystem.js'
import styles from './ConceptScreen.module.css'

// ── Step content ──────────────────────────────────────────────────────────────

function StepProblems({ sizes, lit }) {
  return (
    <div className={styles.problemChain}>
      {sizes.map((size, i) => (
        <motion.div
          key={i}
          className={`${styles.problemBox} ${lit ? styles.problemLit : ''}`}
          style={{ width: size, height: size * 0.55, fontSize: Math.max(9, size * 0.18) }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.18, duration: 0.35, type: 'spring', stiffness: 200 }}
        >
          {lit ? `+${size / 20}` : `problem(${size / 20})`}
        </motion.div>
      ))}
    </div>
  )
}

// Typewriter code block for step 5
const CODE_LINES = [
  { text: 'def solve(problem):', type: 'def' },
  { text: '    if problem is small enough:  # base case', type: 'base' },
  { text: '        return answer', type: 'return' },
  { text: '    return solve(smaller problem)  # recursive call', type: 'recurse' },
]

function CodeReveal() {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount >= CODE_LINES.length) return
    const t = setTimeout(() => setVisibleCount(v => v + 1), 700)
    return () => clearTimeout(t)
  }, [visibleCount])

  return (
    <motion.div
      className={styles.codeBlock}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {CODE_LINES.map((line, i) => (
        <motion.div
          key={i}
          className={`${styles.codeLine} ${styles[`code_${line.type}`]}`}
          initial={{ opacity: 0, x: -8 }}
          animate={i < visibleCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ duration: 0.3 }}
        >
          {line.text}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  {
    narratorKey: 'conceptStep1',
    label: 'The Problem',
    content: () => (
      <div className={styles.stepContent}>
        <motion.div
          className={styles.bigProblem}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          problem(5)
        </motion.div>
        <motion.div
          className={styles.tooBig}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ↑ too big to solve directly
        </motion.div>
      </div>
    ),
  },
  {
    narratorKey: 'conceptStep2',
    label: 'Break It Down',
    content: () => (
      <div className={styles.stepContent}>
        <StepProblems sizes={[140, 110, 80]} />
        <motion.div
          className={styles.hint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          each call handles a smaller version
        </motion.div>
      </div>
    ),
  },
  {
    narratorKey: 'conceptStep3',
    label: 'Base Case',
    content: () => (
      <div className={styles.stepContent}>
        <StepProblems sizes={[140, 110, 80, 50]} />
        <motion.div
          className={styles.baseCase}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
        >
          🔑 base case — answer is obvious here
        </motion.div>
      </div>
    ),
  },
  {
    narratorKey: 'conceptStep4',
    label: 'Results Bubble Up',
    content: () => (
      <div className={styles.stepContent}>
        <StepProblems sizes={[50, 80, 110, 140]} lit />
        <motion.div
          className={styles.hint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          ↑ each return passes its value back up the chain
        </motion.div>
      </div>
    ),
  },
  {
    narratorKey: 'conceptStep5',
    label: 'The Pattern',
    content: () => <CodeReveal />,
  },
  {
    narratorKey: 'conceptStep6',
    label: 'Your Turn',
    content: () => (
      <motion.div
        className={styles.finalStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.finalIcon}>⚙️</div>
        <p className={styles.finalText}>
          You've seen the pattern. Now write it yourself.
        </p>
      </motion.div>
    ),
  },
]

// ── ConceptScreen ─────────────────────────────────────────────────────────────

export default function ConceptScreen({ isMuted, onComplete, setNarratorLine }) {
  const [stepIndex, setStepIndex] = useState(0)

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  // Speak narrator line when step changes
  useEffect(() => {
    const text = LINES[step.narratorKey]?.[0]
    if (text) {
      setNarratorLine(text)
      speak(text, isMuted)
    }
  }, [stepIndex]) // eslint-disable-line

  function handleNext() {
    if (isLast) {
      onComplete()
    } else {
      setStepIndex(i => i + 1)
    }
  }

  return (
    <div className={styles.screen}>
      {/* Progress dots */}
      <div className={styles.progress}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i <= stepIndex ? styles.dotActive : ''}`}
          />
        ))}
      </div>

      {/* Step label */}
      <div className={styles.stepLabel}>
        <span className={styles.stepNum}>{stepIndex + 1} / {STEPS.length}</span>
        <span className={styles.stepTitle}>{step.label}</span>
      </div>

      {/* Animated step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          className={styles.stepBody}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35 }}
        >
          {step.content()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <motion.button
        className={`${styles.nextBtn} ${isLast ? styles.beginBtn : ''}`}
        onClick={handleNext}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {isLast ? 'BEGIN →' : 'NEXT →'}
      </motion.button>

      {/* Corner decorations */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />
    </div>
  )
}
