import { useEffect, useRef, useState } from 'react'
import { speak, FINALE_LINES } from '../systems/narratorSystem.js'
import styles from './CreditsScreen.module.css'

// ── Typewriter text ────────────────────────────────────────────────────────────

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

// ── Big portrait ───────────────────────────────────────────────────────────────

function BigPortrait({ expression }) {
  const isWarm     = expression === 'warm'
  const isUnhinged = expression === 'unhinged'

  return (
    <div className={styles.portrait}>
      <div className={[
        styles.portraitFace,
        isWarm     ? styles.portraitFaceWarm     : '',
        isUnhinged ? styles.portraitFaceUnhinged : '',
      ].join(' ')}>
        <div className={styles.eyes}>
          <div className={[
            styles.eye,
            isWarm     ? styles.eyeWarm     : '',
            isUnhinged ? styles.eyeUnhinged : '',
          ].join(' ')} />
          <div className={[
            styles.eye,
            isWarm     ? styles.eyeWarm     : '',
            isUnhinged ? styles.eyeUnhinged : '',
          ].join(' ')} />
        </div>
        <div className={[
          styles.mouth,
          isWarm     ? styles.mouthWarm     : '',
          isUnhinged ? styles.mouthUnhinged : '',
        ].join(' ')} />
      </div>
      <div className={styles.portraitName}>Dr. Callum Stack</div>
      <div className={styles.portraitTitle}>Head of Theoretical Clone Operations</div>
    </div>
  )
}

// ── CreditsScreen ──────────────────────────────────────────────────────────────

export default function CreditsScreen({ isMuted }) {
  const [creditsLine,        setCreditsLine]        = useState(null)
  const [portraitExpression, setPortraitExpression] = useState('neutral')
  const [showPlayAgain,      setShowPlayAgain]      = useState(false)
  const [showExit,           setShowExit]           = useState(false)
  const [exited,             setExited]             = useState(false)
  const isMutedRef = useRef(isMuted)
  const ranRef     = useRef(false)

  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true
    runSequence()
  }, []) // eslint-disable-line

  async function runSequence() {
    for (let i = 0; i < FINALE_LINES.length; i++) {
      const item = FINALE_LINES[i]
      const text = typeof item === 'string' ? item : item.text
      const vs   = typeof item === 'string' ? null  : item.voiceSettings
      // Warm expression on the last line
      if (i === FINALE_LINES.length - 1) setPortraitExpression('warm')
      setCreditsLine(text)
      await speak(text, isMutedRef.current, 0, vs)
      await new Promise(r => setTimeout(r, 1000))
    }
    setShowPlayAgain(true)
    setShowExit(true)
  }

  async function handlePlayAgain() {
    setShowPlayAgain(false)
    setShowExit(false)
    setPortraitExpression('unhinged')
    const line1 = "Again? AGAIN? Did you not just hear what I said? This is a DEMO. Close the tab. Come back when we are done."
    setCreditsLine(line1)
    await speak(line1, isMutedRef.current, 0)
    await new Promise(r => setTimeout(r, 2000))
    const line2 = "...I'm serious. Close it."
    setCreditsLine(line2)
    await speak(line2, isMutedRef.current, 0)
    await new Promise(r => setTimeout(r, 500))
    setShowExit(true)
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

      <BigPortrait expression={portraitExpression} />

      <div className={styles.dialogueArea}>
        {creditsLine && <TypewriterText key={creditsLine} text={creditsLine} />}
      </div>

      {(showPlayAgain || showExit) && (
        <div className={styles.buttons}>
          {showPlayAgain && (
            <button className={styles.btnPrimary} onClick={handlePlayAgain}>
              PLAY AGAIN
            </button>
          )}
          {showExit && (
            <button className={styles.btnSecondary} onClick={() => setExited(true)}>
              EXIT
            </button>
          )}
        </div>
      )}
    </div>
  )
}
