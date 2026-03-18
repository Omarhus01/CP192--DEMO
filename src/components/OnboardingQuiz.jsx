import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './OnboardingQuiz.module.css'

export default function OnboardingQuiz({ onAnswer }) {
  const [answered, setAnswered] = useState(false)

  function handleClick(wasYes) {
    if (answered) return
    setAnswered(true)
    onAnswer(wasYes)
  }

  return (
    <motion.div
      className={styles.screen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.badge}>CP-192 · ORIENTATION</div>

        <motion.h1
          className={styles.question}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Do you know Python?
        </motion.h1>

        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <button
            className={`${styles.btn} ${styles.btnYes}`}
            onClick={() => handleClick(true)}
            disabled={answered}
          >
            Yes
          </button>
          <button
            className={`${styles.btn} ${styles.btnNo}`}
            onClick={() => handleClick(false)}
            disabled={answered}
          >
            No
          </button>
        </motion.div>

        {answered && (
          <motion.div
            className={styles.waiting}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            — Dr. Stack is processing your answer —
          </motion.div>
        )}
      </motion.div>

      {/* Corner decorations */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />
    </motion.div>
  )
}
