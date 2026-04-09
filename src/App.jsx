import { useState, useCallback, useEffect, useRef } from 'react'
import TitleScreen     from './components/TitleScreen.jsx'
import LevelScreen     from './components/LevelScreen.jsx'
import StackOverflow   from './components/StackOverflow.jsx'
import NarratorBox     from './components/NarratorBox.jsx'
import OnboardingQuiz  from './components/OnboardingQuiz.jsx'
import ConceptScreen   from './components/ConceptScreen.jsx'
import CreditsScreen   from './components/CreditsScreen.jsx'
import LoginScreen     from './components/LoginScreen.jsx'
import DashboardScreen from './components/DashboardScreen.jsx'
import { level1 }     from './levels/level1.js'
import { level2 }     from './levels/level2.js'
import { getLine, getExpression, speak, stopAudio, LINES } from './systems/narratorSystem.js'
import { initMusic, playTrack, fadeInTrack, setMuted as setMusicMuted, playNarratorClick } from './systems/audioSystem.js'
import styles from './App.module.css'

const LEVELS = [level1, level2]

const INITIAL_NARRATOR = {
  attemptCount:               0,
  lastMistakeType:            null,
  unrecognizedSolutionsFound: [],
  idleSeconds:                0,
  playerSolvedFastCount:      0,
  level1Perfect:              false,
}

export default function App() {
  const [screen,         setScreen]         = useState('login')
  const [levelIndex,     setLevelIndex]      = useState(0)
  const [isMuted,        setIsMuted]         = useState(false)
  const [narratorState,  setNarratorState]   = useState(INITIAL_NARRATOR)
  const [lineTracker,    setLineTracker]      = useState({})
  const [narratorLine,    setNarratorLine]   = useState(null)
  const [completedLevels, setCompletedLevels] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp192_progress') || '[]') }
    catch { return [] }
  })
  const [transitioning,        setTransitioning]        = useState(false)
  const [conceptExpression,    setConceptExpression]    = useState(null)
  const [overflowReturnPhase,  setOverflowReturnPhase]  = useState('guided')

  const currentLevel      = LEVELS[levelIndex]
  const startingRef       = useRef(false)
  const pendingScreenRef  = useRef(null)
  const lastNarratorTime  = useRef(0)

  // ── Screen crossfade helper ────────────────────────────────────────────────
  function navigateTo(newScreen) {
    pendingScreenRef.current = newScreen
    setTransitioning(true)
    setTimeout(() => {
      setScreen(pendingScreenRef.current)
      setTransitioning(false)
    }, 500)
  }

  // ── Glitch level ──────────────────────────────────────────────────────────────
  const glitchLevel =
    narratorState.attemptCount >= 5 ? '2' :
    narratorState.attemptCount >= 3 ? '1' : '0'

  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-glitch', glitchLevel)
  }, [glitchLevel])

  // ── Screen → music ────────────────────────────────────────────────────────────
  useEffect(() => {
    const MAP = {
      quiz:      'title',
      concept:   'title',
      title:     'title',
      login:     'title',
      dashboard: 'title',
      level:     'level',
      overflow:  'overflow',
    }
    const key = MAP[screen]
    if (key) playTrack(key)
    if (screen === 'credits') fadeInTrack('credits')
  }, [screen])

  // ── Mute sync ─────────────────────────────────────────────────────────────────
  useEffect(() => { setMusicMuted(isMuted) }, [isMuted])

  // ── Clear concept expression when leaving concept screen ──────────────────────
  useEffect(() => {
    if (screen !== 'concept') setConceptExpression(null)
  }, [screen])

  // ── Narrator line callback — min 300ms between lines ─────────────────────────
  const handleNarratorLine = useCallback((text, nextTracker) => {
    const now     = Date.now()
    const elapsed = now - lastNarratorTime.current
    const delay   = elapsed < 300 ? 300 - elapsed : 0
    lastNarratorTime.current = now + delay
    if (delay > 0) {
      setTimeout(() => {
        setNarratorLine(text)
        if (nextTracker) setLineTracker(nextTracker)
      }, delay)
    } else {
      setNarratorLine(text)
      if (nextTracker) setLineTracker(nextTracker)
    }
  }, [])

  // ── Quiz answer ───────────────────────────────────────────────────────────────
  async function handleQuizAnswer(wasYes) {
    initMusic()          // first user gesture — unlocks audio
    playTrack('title')

    if (wasYes) {
      const text = LINES.quizYes[0]
      setNarratorLine(text)
      await speak(text, isMuted)
      navigateTo('concept')
    } else {
      const text1 = LINES.quizNo1[0]
      setNarratorLine(text1)
      speak(text1, isMuted)
      // 3-second stare, then second line, then transition
      setTimeout(() => {
        const text2 = LINES.quizNo2[0]
        setNarratorLine(text2)
        speak(text2, isMuted)
        setTimeout(() => navigateTo('concept'), 2500)
      }, 3000)
    }
  }

  // ── Concept screen done ───────────────────────────────────────────────────────
  function handleConceptDone() {
    navigateTo('title')
  }

  // ── Title → Login ─────────────────────────────────────────────────────────────
  async function handleStart() {
    if (startingRef.current) return
    startingRef.current = true
    const { text, nextTracker } = getLine('intro', narratorState, lineTracker)
    setNarratorLine(text)
    setLineTracker(nextTracker)
    playNarratorClick(isMuted)
    await speak(text, isMuted)
    navigateTo('level')
  }

  // ── Login: Log In button ──────────────────────────────────────────────────────
  function handleLoginSubmit(email) {
    const saved = localStorage.getItem('cp192_progress')
    const progress = saved ? JSON.parse(saved) : []
    setCompletedLevels(progress)
    setNarratorLine(LINES.dashboardScreen[0])
    navigateTo('dashboard')
  }

  // ── Login: Sign Up button → save user + start orientation ────────────────────
  function handleSignUpSubmit(name, email) {
    localStorage.setItem('cp192_user', JSON.stringify({ name, email }))
    localStorage.setItem('cp192_progress', '[]')
    setCompletedLevels([])
    navigateTo('quiz')
  }

  // ── Login: Continue as Guest → orientation, no save ──────────────────────────
  function handleGuestContinue() {
    setCompletedLevels([])
    navigateTo('quiz')
  }

  // ── Dashboard "ENTER FACILITY" → full orientation ────────────────────────────
  function handleDashboardContinue() {
    navigateTo('quiz')
  }

  // ── Dashboard level card click → jump to that level ──────────────────────────
  function handleDashboardLevelSelect(idx) {
    setLevelIndex(idx)
    setNarratorState(prev => ({ ...prev, attemptCount: 0 }))
    setOverflowReturnPhase('guided')
    navigateTo('level')
  }

  // ── Dashboard locked level click → funny narrator line ───────────────────────
  function handleLockedLevel() {
    const { text, nextTracker } = getLine('lockedLevel', narratorState, lineTracker)
    setNarratorLine(text)
    setLineTracker(nextTracker)
  }

  // ── In-level callbacks ────────────────────────────────────────────────────────
  function handleWrongAttempt() {
    setNarratorState(prev => ({ ...prev, attemptCount: prev.attemptCount + 1 }))
  }

  function handleOverflow(phase) {
    setNarratorState(prev => ({ ...prev, attemptCount: prev.attemptCount + 1 }))
    setOverflowReturnPhase(phase ?? 'guided')
    navigateTo('overflow')
  }

  function handleLevelComplete(data) {
    setCompletedLevels(prev => {
      if (prev.includes(levelIndex)) return prev
      const updated = [...prev, levelIndex]
      localStorage.setItem('cp192_progress', JSON.stringify(updated))
      return updated
    })
    const wasFirst = narratorState.attemptCount === 0
    if (currentLevel.id === 1 && wasFirst) {
      setNarratorState(prev => ({ ...prev, level1Perfect: true }))
    }
    if (data?.unrecognized) {
      setNarratorState(prev => ({
        ...prev,
        unrecognizedSolutionsFound: [...prev.unrecognizedSolutionsFound, data.outcome],
      }))
    }
    const next = levelIndex + 1
    if (next < LEVELS.length) {
      if (wasFirst && currentLevel.id === 1) {
        const { text, nextTracker } = getLine('level2AfterPerfectRun', narratorState, lineTracker)
        setNarratorLine(text)
        setLineTracker(nextTracker)
        speak(text, isMuted)
      }
      setNarratorState(prev => ({ ...prev, attemptCount: 0 }))
      setOverflowReturnPhase('guided')
      setLevelIndex(next)
      navigateTo('level')
    } else {
      stopAudio()
      navigateTo('credits')
    }
  }

  function handleRestartFromOverflow() {
    navigateTo('level')
  }

  const expression = getExpression(narratorState)
  const levelKey   = `level-${levelIndex}-${screen}`

  return (
    <div className={styles.app}>
      {/* ── Mute toggle ── */}
      <button
        className={styles.muteCorner}
        onClick={() => setIsMuted(m => !m)}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {screen === 'quiz' && (
        <OnboardingQuiz onAnswer={handleQuizAnswer} />
      )}

      {screen === 'concept' && (
        <ConceptScreen
          isMuted={isMuted}
          onComplete={handleConceptDone}
          setNarratorLine={setNarratorLine}
          onExpressionChange={setConceptExpression}
        />
      )}

      {screen === 'title' && (
        <TitleScreen onStart={handleStart} />
      )}

      {screen === 'login' && (
        <LoginScreen
          onLogin={handleLoginSubmit}
          onSignUp={handleSignUpSubmit}
          onGuest={handleGuestContinue}
        />
      )}

      {screen === 'dashboard' && (
        <DashboardScreen
          completedLevels={completedLevels}
          onContinue={handleDashboardContinue}
          onLevelSelect={handleDashboardLevelSelect}
          onLockedLevel={handleLockedLevel}
        />
      )}

      {screen === 'level' && (
        <LevelScreen
          key={levelKey}
          level={currentLevel}
          initialPhase={overflowReturnPhase}
          hasNextLevel={levelIndex + 1 < LEVELS.length}
          narratorState={narratorState}
          lineTracker={lineTracker}
          isMuted={isMuted}
          onNarratorLine={handleNarratorLine}
          onOverflow={handleOverflow}
          onLevelComplete={handleLevelComplete}
          onWrongAttempt={handleWrongAttempt}
        />
      )}

      {screen === 'overflow' && (
        <StackOverflow onRestart={handleRestartFromOverflow} isMuted={isMuted} attemptCount={narratorState.attemptCount} />
      )}

      {screen === 'credits' && (
        <CreditsScreen isMuted={isMuted} />
      )}

      {/* ── Crossfade overlay for screen transitions ── */}
      {transitioning && <div className={styles.fadeOverlay} />}

      {/* Narrator bar — everywhere except overflow and credits (credits has its own) */}
      {screen !== 'overflow' && screen !== 'credits' && (
        <NarratorBox
          line={narratorLine}
          expression={expression}
          expressionOverride={conceptExpression}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(m => !m)}
        />
      )}
    </div>
  )
}
