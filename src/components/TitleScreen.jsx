import { useEffect, useState } from 'react'
import styles from './TitleScreen.module.css'

export default function TitleScreen({ onStart }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`${styles.screen} ${visible ? styles.visible : ''}`}>
      {/* Decorative corner brackets */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      <div className={styles.content}>
        <div className={styles.classification}>CLASSIFIED // LEVEL-Ω CLEARANCE</div>

        <h1 className={styles.title}>
          THE CLONE
          <br />
          <span className={styles.titleAccent}>PROBLEM</span>
        </h1>

        <div className={styles.subtitle}>
          A theoretical exercise in recursive self-replication.
          <br />
          Dr. Callum Stack, presiding.
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerDot} />
          <span className={styles.dividerLine} />
        </div>

        <p className={styles.introText}>
          You will be given a problem.<br />
          You will solve it by solving a smaller version of it.<br />
          The smaller version will solve an even smaller version.<br />
          This continues until it stops.<br />
          <span className={styles.dim}>That stopping condition is important. Remember that.</span>
        </p>

        <button className={styles.startBtn} onClick={onStart}>
          BEGIN ORIENTATION
        </button>

        <div className={styles.footer}>
          FACILITY ID: CP-192 &nbsp;|&nbsp; RECURSION DIVISION &nbsp;|&nbsp; ALL CLONES SUPERVISED
        </div>
      </div>
    </div>
  )
}
