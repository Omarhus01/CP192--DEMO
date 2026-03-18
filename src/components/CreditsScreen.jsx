import { useEffect, useRef, useState } from 'react'
import { speak, FINALE_LINES } from '../systems/narratorSystem.js'
import NarratorBox from './NarratorBox.jsx'
import styles from './CreditsScreen.module.css'

export default function CreditsScreen({ isMuted, onPlayAgain }) {
  const [narratorLine,  setNarratorLine]  = useState(null)
  const [showButtons,   setShowButtons]   = useState(false)
  const [exited,        setExited]        = useState(false)
  const isMutedRef = useRef(isMuted)
  const ranRef     = useRef(false)

  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true
    runSequence()
  }, []) // eslint-disable-line

  async function runSequence() {
    for (const item of FINALE_LINES) {
      const text = typeof item === 'string' ? item : item.text
      const vs   = typeof item === 'string' ? null  : item.voiceSettings
      setNarratorLine(text)
      await speak(text, isMutedRef.current, 0, vs)
      await new Promise(r => setTimeout(r, 1500))
    }
    setShowButtons(true)
  }

  if (exited) {
    return (
      <div className={styles.exitScreen}>
        <div className={styles.exitFace}>
          <div className={styles.exitEyes}>
            <div className={styles.exitEye} />
            <div className={styles.exitEye} />
          </div>
          <div className={styles.exitMouth} />
        </div>
        <div className={styles.exitLabel}>DR. CALLUM STACK</div>
        <p className={styles.exitText}>Close the tab.</p>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <span className={styles.tag}>END OF DEMO // FACILITY ID: CP-192</span>

      <div className={styles.portrait}>
        <div className={styles.portraitFace}>
          <div className={styles.eyes}>
            <div className={styles.eye} />
            <div className={styles.eye} />
          </div>
          <div className={styles.mouth} />
        </div>
        <div className={styles.portraitName}>Dr. Callum Stack</div>
        <div className={styles.portraitTitle}>Head of Theoretical Clone Operations</div>
      </div>

      {showButtons && (
        <div className={styles.buttons}>
          <button className={styles.btnPrimary}   onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className={styles.btnSecondary} onClick={() => setExited(true)}>EXIT</button>
        </div>
      )}

      <NarratorBox
        line={narratorLine}
        expression="neutral"
        isMuted={isMuted}
        onToggleMute={() => {}}
      />
    </div>
  )
}
