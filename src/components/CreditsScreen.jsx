import { useEffect, useRef, useState } from 'react'
import { speak, FINALE_LINES } from '../systems/narratorSystem.js'
import NarratorBox from './NarratorBox.jsx'
import styles from './CreditsScreen.module.css'

// ── Typewriter for Play Again mode ────────────────────────────────────────────

function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('')
  const [done,      setDone]      = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!text) { setDisplayed(''); setDone(false); return }
    setDisplayed(''); setDone(false)
    let i = 0
    function tick() {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) timerRef.current = setTimeout(tick, 28)
      else setDone(true)
    }
    timerRef.current = setTimeout(tick, 120)
    return () => clearTimeout(timerRef.current)
  }, [text])

  return (
    <span>
      {displayed}
      {!done && <span className={styles.cursor}>▋</span>}
    </span>
  )
}

// ── Reactive big portrait (Play Again mode only) ───────────────────────────────

function UnhingedPortrait() {
  return (
    <div className={styles.portrait}>
      <div className={`${styles.portraitFace} ${styles.portraitFaceUnhinged}`}>
        <div className={styles.eyes}>
          <div className={`${styles.eye} ${styles.eyeUnhinged}`} />
          <div className={`${styles.eye} ${styles.eyeUnhinged}`} />
        </div>
        <div className={`${styles.mouth} ${styles.mouthUnhinged}`} />
      </div>
      <div className={styles.portraitName}>Omarito</div>
      <div className={styles.portraitTitle}>Head of Theoretical Clone Operations</div>
    </div>
  )
}

// ── CreditsScreen ──────────────────────────────────────────────────────────────

export default function CreditsScreen({ isMuted }) {
  const [narratorLine,  setNarratorLine]  = useState(null)
  const [showButtons,   setShowButtons]   = useState(false)
  const [playAgainMode, setPlayAgainMode] = useState(false)
  const [playAgainLine, setPlayAgainLine] = useState(null)
  const [showExit,      setShowExit]      = useState(false)
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

  async function handlePlayAgain() {
    setShowButtons(false)
    setPlayAgainMode(true)
    const angryEmotion = { stability: 0.05, similarity_boost: 0.9, style: 1.0 }
    const line1 = "Again? …AGAIN???! Did you not just hear what I said? This is a DEMO. Close the tab. Come back when we are done."
    setPlayAgainLine(line1)
    await speak(line1, isMutedRef.current, 0, angryEmotion)
    await new Promise(r => setTimeout(r, 2000))
    const line2 = "...I'm serious. Close it."
    setPlayAgainLine(line2)
    await speak(line2, isMutedRef.current, 0, angryEmotion)
    await new Promise(r => setTimeout(r, 500))
    setShowExit(true)
  }

  // ── Exit screen: plain, nothing ───────────────────────────────────────────
  if (exited) {
    return (
      <div className={styles.exitScreen}>
        <p className={styles.exitText}>END OF DEMO</p>
      </div>
    )
  }

  // ── Play Again mode: big unhinged portrait takes over ─────────────────────
  if (playAgainMode) {
    return (
      <div className={styles.screen}>
        <UnhingedPortrait />
        <div className={styles.playAgainDialogue}>
          {playAgainLine && <TypewriterText key={playAgainLine} text={playAgainLine} />}
        </div>
        {showExit && (
          <button className={styles.btnSecondary} onClick={() => setExited(true)}>EXIT</button>
        )}
      </div>
    )
  }

  // ── Normal sequence mode: static portrait + NarratorBox at bottom ─────────
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
        <div className={styles.portraitName}>Omarito</div>
        <div className={styles.portraitTitle}>Head of Theoretical Clone Operations</div>
      </div>

      {showButtons && (
        <div className={styles.buttons}>
          <button className={styles.btnPrimary}   onClick={handlePlayAgain}>PLAY AGAIN</button>
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
