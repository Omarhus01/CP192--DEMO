import { useReducer, useEffect, useRef, useState } from 'react'
import SceneView       from './SceneView.jsx'
import CallStackPanel  from './CallStackPanel.jsx'
import CodeEditor      from './CodeEditor.jsx'
import NarratorBox     from './NarratorBox.jsx'
import PhaseIndicator  from './PhaseIndicator.jsx'
import ScaffoldEditor  from './ScaffoldEditor.jsx'
import { executeCode, isUnrecognizedCode } from '../systems/codeExecutor.js'
import { didIgnoreCallStack, getIdleTrigger, outcomeToNarratorTrigger } from '../systems/edgeCaseDetector.js'
import { getLine, getExpression, speak, getSyntaxRepeatLine, LINES } from '../systems/narratorSystem.js'
import { playSpawnSound, playSuccessSound, playOverflowSound, playNarratorClick } from '../systems/audioSystem.js'
import styles from './LevelScreen.module.css'

// ── Speed config ──────────────────────────────────────────────────────────────

const SPEED_CONFIG = {
  slow:   { spawnDelay: 1200, returnDelay: 1200, baseCasePause: 1200, baseCaseNarratorDelay: 800 },
  normal: { spawnDelay: 650,  returnDelay: 430,  baseCasePause: 800,  baseCaseNarratorDelay: 380 },
  fast:   { spawnDelay: 300,  returnDelay: 300,  baseCasePause: 400,  baseCaseNarratorDelay: 200 },
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function makeInitial(level, initialPhase = 'guided') {
  return {
    userCode:       level.starterCode ?? '',
    phase:          'idle',
    callStack:      [],
    clones:         [],
    animSteps:      [],
    stepIndex:      0,
    resetCount:     0,
    wrongStreak:    0,
    hintOpen:       false,
    callStackInteracted: false,
    characterAtEnd: false,
    errorLine:      null,
    levelPhase:     initialPhase,
    guidedStep:     0,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CODE':       return { ...state, userCode: action.payload, errorLine: null }
    case 'START_ANIM':     return { ...state, phase: 'animating', callStack: [], clones: [], animSteps: action.steps, stepIndex: 0, characterAtEnd: false, errorLine: null }
    case 'PUSH_CALL':      return { ...state, callStack: [...state.callStack, { depth: action.depth, label: action.label, status: 'active' }], clones: [...state.clones, { depth: action.depth, label: action.label, value: action.value, isBase: false }] }
    case 'MARK_BASE':      return { ...state, callStack: state.callStack.map((e,i) => i === state.callStack.length-1 ? {...e, status:'baseCase'} : e), clones: state.clones.map((c,i) => i === state.clones.length-1 ? {...c, isBase:true} : c) }
    case 'MARK_RETURN':    return { ...state, callStack: state.callStack.map(e => e.depth===action.depth ? {...e,status:'returning'} : e), clones: state.clones.map(c => c.depth===action.depth ? {...c, isReturning:true, returnValue:action.value} : c) }
    case 'POP_DEPTH':      return { ...state, callStack: state.callStack.filter(e=>e.depth!==action.depth), clones: state.clones.filter(c=>c.depth!==action.depth) }
    case 'ADVANCE_STEP':   return { ...state, stepIndex: state.stepIndex + 1 }
    case 'SET_PHASE':      return { ...state, phase: action.payload }
    case 'CHAR_AT_END':    return { ...state, characterAtEnd: true }
    case 'WRONG_STREAK':   return { ...state, wrongStreak: state.wrongStreak + 1 }
    case 'OPEN_HINT':      return { ...state, hintOpen: true }
    case 'RESET':           return { ...makeInitial(action.level), resetCount: state.resetCount + 1, levelPhase: state.levelPhase, guidedStep: state.levelPhase === 'guided' ? state.guidedStep : 0 }
    case 'NEXT_GUIDED_STEP': return { ...state, guidedStep: state.guidedStep + 1 }
    case 'SET_LEVEL_PHASE':  return { ...state, levelPhase: action.payload }
    case 'SCAFFOLD_SUCCESS': return { ...makeInitial(action.level), resetCount: state.resetCount + 1, levelPhase: 'free' }
    case 'STACK_INTERACT':  return { ...state, callStackInteracted: true }
    case 'SET_ERROR':      return { ...state, errorLine: action.payload, phase: 'idle' }
    default:               return state
  }
}

// ── LevelScreen ───────────────────────────────────────────────────────────────

export default function LevelScreen({
  level, initialPhase = 'guided', hasNextLevel = false, narratorState, lineTracker, isMuted,
  onNarratorLine, onOverflow, onLevelComplete, onWrongAttempt,
}) {
  const [state, dispatch] = useReducer(reducer, initialPhase, (phase) => makeInitial(level, phase))
  const [speed, setSpeed] = useState('slow')
  const [successOverlay, setSuccessOverlay] = useState(false)
  const [showNextBtn,    setShowNextBtn]    = useState(false)
  const pendingCompletionRef = useRef(null)

  const animTimerRef      = useRef(null)
  const simResultRef      = useRef(null)
  const idleTimerRef      = useRef(null)
  const idleSecondsRef    = useRef(0)
  const fourthWallUsed    = useRef(0)
  // Emotion tracking refs
  const syntaxErrorCountRef = useRef(0)
  const noBaseCaseCountRef  = useRef(0)
  const onlySyntaxErrorsRef = useRef(true)
  // Refs for fresh values inside timeouts
  const stateRef          = useRef(state)
  const narratorStateRef  = useRef(narratorState)
  const lineTrackerRef    = useRef(lineTracker)
  const isMutedRef        = useRef(isMuted)
  const onNarratorLineRef = useRef(onNarratorLine)
  const speedRef          = useRef(speed)
  stateRef.current          = state
  narratorStateRef.current  = narratorState
  lineTrackerRef.current    = lineTracker
  isMutedRef.current        = isMuted
  onNarratorLineRef.current = onNarratorLine
  speedRef.current          = speed

  // ── Narrator helper ─────────────────────────────────────────────────────────

  function fireNarrator(triggerKey) {
    const ns  = narratorStateRef.current
    const lt  = lineTrackerRef.current
    const mut = isMutedRef.current
    const { text, nextTracker } = getLine(triggerKey, ns, lt)
    if (!text) return
    onNarratorLineRef.current(text, nextTracker)
    playNarratorClick(mut)
    speak(text, mut, ns.attemptCount)
  }

  // ── Idle timer ──────────────────────────────────────────────────────────────

  function resetIdle() { idleSecondsRef.current = 0 }

  useEffect(() => {
    idleTimerRef.current = setInterval(() => {
      if (stateRef.current.phase === 'animating') { idleSecondsRef.current = 0; return }
      idleSecondsRef.current += 1
      const trigger = getIdleTrigger(idleSecondsRef.current)
      if (trigger && idleSecondsRef.current % 30 === 0) fireNarrator(trigger)
    }, 1000)
    return () => clearInterval(idleTimerRef.current)
  }, []) // eslint-disable-line

  // ── Level intro (only when no guided steps) ─────────────────────────────────

  useEffect(() => {
    if (level.guidedSteps?.length > 0) return
    const key = level.id === 1 ? 'level1Intro' : 'level2Intro'
    const t = setTimeout(() => fireNarrator(key), 1200)
    return () => clearTimeout(t)
  }, [level.id]) // eslint-disable-line

  // ── Guided phase: fire narrator for current step ─────────────────────────────

  useEffect(() => {
    if (state.levelPhase !== 'guided') return
    const steps = level.guidedSteps ?? []
    const step  = steps[state.guidedStep]
    if (!step) return
    const delay = state.guidedStep === 0 ? 800 : 300
    const t = setTimeout(() => {
      const mut = isMutedRef.current
      onNarratorLineRef.current(step.text, lineTrackerRef.current)
      playNarratorClick(mut)
      speak(step.text, mut, narratorStateRef.current.attemptCount)
    }, delay)
    return () => clearTimeout(t)
  }, [state.levelPhase, state.guidedStep]) // eslint-disable-line

  // ── Animation engine ────────────────────────────────────────────────────────

  function getStepDelay(step) {
    if (!step) return 320
    const cfg = SPEED_CONFIG[speedRef.current]
    switch (step.type) {
      case 'call':     return cfg.spawnDelay
      case 'return':   return cfg.returnDelay
      case 'baseCase': return 200   // quick to render; internal pause follows inside processStep
      default:         return 320
    }
  }

  useEffect(() => {
    if (state.phase !== 'animating') return
    if (state.stepIndex >= state.animSteps.length) return

    clearTimeout(animTimerRef.current)
    const nextStep = state.animSteps[state.stepIndex]
    const delay    = getStepDelay(nextStep)

    animTimerRef.current = setTimeout(() => {
      const s = stateRef.current
      const step = s.animSteps[s.stepIndex]
      if (step) processStep(step)
    }, delay)

    return () => clearTimeout(animTimerRef.current)
  }, [state.phase, state.stepIndex]) // eslint-disable-line

  function processStep(step) {
    switch (step.type) {
      case 'call':
        dispatch({ type: 'PUSH_CALL', depth: step.depth, label: step.label, value: step.value })
        playSpawnSound(isMutedRef.current)
        dispatch({ type: 'ADVANCE_STEP' })
        break

      case 'baseCase': {
        dispatch({ type: 'MARK_BASE' })
        // Trigger success overlay labels as soon as base case fires
        if (simResultRef.current?.outcome === 'success' && stateRef.current.levelPhase === 'free') {
          setSuccessOverlay(true)
        }
        // Dramatic pause — deepest clone glows, stack entry turns green
        // Then narrator fires, then results start bubbling
        const cfg = SPEED_CONFIG[speedRef.current]
        setTimeout(() => {
          fireNarrator('baseCaseHit')
          setTimeout(() => dispatch({ type: 'ADVANCE_STEP' }), cfg.baseCaseNarratorDelay)
        }, cfg.baseCasePause)
        // No immediate ADVANCE_STEP — timeout above handles it
        break
      }

      case 'return': {
        dispatch({ type: 'MARK_RETURN', depth: step.depth, value: step.value })
        // Hold the returning state so player can see the green flash
        const retDelay = SPEED_CONFIG[speedRef.current].returnDelay
        setTimeout(() => dispatch({ type: 'POP_DEPTH', depth: step.depth }), retDelay)
        dispatch({ type: 'ADVANCE_STEP' })
        break
      }

      case 'overflow':
        dispatch({ type: 'SET_PHASE', payload: 'done' })
        playOverflowSound(isMutedRef.current)
        onlySyntaxErrorsRef.current = false
        noBaseCaseCountRef.current++
        if (noBaseCaseCountRef.current > LINES.noBaseCase.length) {
          fireNarrator('noBaseCaseRepeat')
        } else {
          fireNarrator('noBaseCase')
        }
        setTimeout(() => onOverflow(stateRef.current.levelPhase), 1600)
        break

      case 'complete': {
        const outcome = simResultRef.current?.outcome
        dispatch({ type: 'SET_PHASE', payload: 'done' })
        if (outcome === 'success') {
          playSuccessSound(isMutedRef.current)
          // Character only moves after all clones have resolved and disappeared
          setTimeout(() => dispatch({ type: 'CHAR_AT_END' }), 550)
          setTimeout(() => handleSuccess(), 750)
        } else {
          handleWrongResult(outcome)
        }
        break
      }

      default:
        dispatch({ type: 'ADVANCE_STEP' })
    }
  }

  // ── Run ─────────────────────────────────────────────────────────────────────

  const isRunningRef = useRef(false)

  async function handleRun() {
    if (isRunningRef.current) return
    resetIdle()

    const code = stateRef.current.userCode?.trim() ?? ''
    if (!code || code === (level.starterCode ?? '').trim()) {
      fireNarrator('callCloneWithoutInputs')
      return
    }

    isRunningRef.current = true
    dispatch({ type: 'SET_PHASE', payload: 'running' })

    let result
    try {
      result = await executeCode(level, code)
    } finally {
      isRunningRef.current = false
    }

    simResultRef.current = result

    if (result.outcome === 'syntaxError') {
      dispatch({ type: 'SET_ERROR', payload: result.error })
      syntaxErrorCountRef.current++
      if (syntaxErrorCountRef.current >= 3) {
        const ns   = narratorStateRef.current
        const mut  = isMutedRef.current
        const text = getSyntaxRepeatLine(syntaxErrorCountRef.current)
        onNarratorLineRef.current(text, lineTrackerRef.current)
        playNarratorClick(mut)
        speak(text, mut, ns.attemptCount)
      } else {
        fireNarrator('syntaxError')
      }
      return
    }

    dispatch({ type: 'START_ANIM', steps: result.steps })
  }

  function handleReset() {
    resetIdle()
    clearTimeout(animTimerRef.current)
    const newCount = stateRef.current.resetCount + 1
    dispatch({ type: 'RESET', level })
    simResultRef.current = null
    if (newCount >= 3) {
      fireNarrator('resetTooMany')
      const scene = document.getElementById('puzzle-scene')
      if (scene) { scene.classList.add('glitch'); setTimeout(() => scene.classList.remove('glitch'), 500) }
    }
  }

  function handleHint() {
    fireNarrator('hintGiven')
    dispatch({ type: 'OPEN_HINT' })
  }

  // ── Guided / scaffold phase handlers ─────────────────────────────────────────

  function handleGuidedNext() {
    const steps = level.guidedSteps ?? []
    if (state.guidedStep < steps.length - 1) {
      dispatch({ type: 'NEXT_GUIDED_STEP' })
    } else {
      dispatch({ type: 'SET_LEVEL_PHASE', payload: 'scaffold' })
      if (level.scaffoldIntroLine) {
        setTimeout(() => {
          const mut = isMutedRef.current
          onNarratorLineRef.current(level.scaffoldIntroLine, lineTrackerRef.current)
          playNarratorClick(mut)
          speak(level.scaffoldIntroLine, mut, narratorStateRef.current.attemptCount)
        }, 400)
      }
    }
  }

  function fireScaffoldLine(text) {
    const mut = isMutedRef.current
    onNarratorLineRef.current(text, lineTrackerRef.current)
    playNarratorClick(mut)
    speak(text, mut, narratorStateRef.current.attemptCount)
  }

  async function handleScaffoldRun(filledCode) {
    if (isRunningRef.current) return
    resetIdle()
    isRunningRef.current = true
    dispatch({ type: 'SET_PHASE', payload: 'running' })

    let result
    try {
      result = await executeCode(level, filledCode)
    } finally {
      isRunningRef.current = false
    }

    simResultRef.current = result

    if (result.outcome === 'syntaxError') {
      dispatch({ type: 'SET_ERROR', payload: result.error })
      fireScaffoldLine(level.scaffoldWrongLine ?? "Not quite. Check your blanks.")
      return
    }

    dispatch({ type: 'START_ANIM', steps: result.steps })
  }

  // ── Outcome handlers ─────────────────────────────────────────────────────────

  function handleSuccess() {
    const ns      = narratorStateRef.current
    const lt      = lineTrackerRef.current
    const isFirst = ns.attemptCount === 0
    const s       = stateRef.current

    // ── Scaffold phase success: transition to free ─────────────────────────────
    if (s.levelPhase === 'scaffold') {
      const text = level.freePhaseIntro ?? "Good. Now write it yourself."
      fireScaffoldLine(text)
      setTimeout(() => dispatch({ type: 'SCAFFOLD_SUCCESS', level }), 1800)
      return
    }

    const unrecog = isUnrecognizedCode(s.userCode ?? '', level.functionName)

    let text, nextTracker
    if (unrecog) {
      const times = ns.unrecognizedSolutionsFound?.length ?? 0
      ;({ text, nextTracker } = getLine(
        times > 0 ? 'unrecognizedSolutionAgain' : 'unrecognizedSolution', ns, lt
      ))
    } else if (!isFirst && fourthWallUsed.current < 2 && Math.random() < 0.2) {
      ;({ text, nextTracker } = getLine('fourthWall', ns, lt))
      fourthWallUsed.current++
    } else if (isFirst) {
      ;({ text, nextTracker } = getLine('correctFirstTry', ns, lt))
    } else if (onlySyntaxErrorsRef.current && syntaxErrorCountRef.current > 0) {
      ;({ text, nextTracker } = getLine('syntaxOnlyCorrect', ns, lt))
    } else {
      ;({ text, nextTracker } = getLine('correct', ns, lt))
    }

    onNarratorLineRef.current(text, nextTracker)
    playNarratorClick(isMutedRef.current)
    speak(text, isMutedRef.current, ns.attemptCount)

    const ignored = didIgnoreCallStack(level.id, s.callStackInteracted)
    if (ignored) setTimeout(() => fireNarrator('ignoredCallStack'), 200)

    // Save completion data — delivered when player clicks the in-scene Next button
    pendingCompletionRef.current = {
      outcome:     'success',
      narratorLine: text,
      ignoredStack: ignored,
      unrecognized: unrecog,
    }

    // Fire explanation voiceover, then reveal Next Level button
    setTimeout(() => {
      const explanationLine = level.id === 1
        ? "There it is. The base case fired. True is traveling back up through every clone that was waiting. That is the return chain."
        : "Each clone added 1 to what the clone below returned. Zero became one, one became two, all the way to five. That is how recursive functions return values."
      onNarratorLineRef.current(explanationLine, lineTrackerRef.current)
      playNarratorClick(isMutedRef.current)
      speak(explanationLine, isMutedRef.current, narratorStateRef.current.attemptCount)
      setTimeout(() => setShowNextBtn(true), 5000)
    }, 800)
  }

  function handleNextLevelClick() {
    onLevelComplete(pendingCompletionRef.current)
  }

  function handleWrongResult(outcome) {
    // ── Scaffold phase: don't escalate narrator, just give scaffold hint ───
    if (stateRef.current.levelPhase === 'scaffold') {
      const scene = document.getElementById('puzzle-scene')
      if (scene) { scene.classList.add('wrongShake'); setTimeout(() => scene.classList.remove('wrongShake'), 250) }
      fireScaffoldLine(level.scaffoldWrongLine ?? "Not quite. Check your blanks.")
      setTimeout(() => { dispatch({ type: 'RESET', level }); simResultRef.current = null }, 2400)
      return
    }

    onWrongAttempt?.()
    onlySyntaxErrorsRef.current = false
    dispatch({ type: 'WRONG_STREAK' })
    const trigger = outcomeToNarratorTrigger(outcome, false)
    fireNarrator(trigger)
    const scene = document.getElementById('puzzle-scene')
    if (scene) { scene.classList.add('wrongShake'); setTimeout(() => scene.classList.remove('wrongShake'), 250) }
    setTimeout(() => { dispatch({ type: 'RESET', level }); simResultRef.current = null }, 2400)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const expression       = getExpression(narratorState)
  const successLabel = (() => {
    if (!successOverlay) return null
    if (state.characterAtEnd) {
      if (level.id === 1) return { type: 'text', text: 'chain resolved — all floors climbed' }
      if (level.id === 2) return { type: 'number', value: level.initialValue }
    }
    const ret = state.clones.find(c => c.isReturning)
    if (!ret) return null
    if (ret.isBase) {
      if (level.id === 1) return { type: 'text', text: 'base case — climb(1) returned True' }
      if (level.id === 2) return { type: 'text', text: 'base case — count(0) returned 0' }
    }
    if (level.id === 1) return { type: 'text', text: 'passing True up...' }
    if (level.id === 2) return { type: 'text', text: `count(${ret.depth}) = ${ret.returnValue}` }
    return null
  })()
  const hasGuided        = (level.guidedSteps?.length ?? 0) > 0
  const currentHighlight = state.levelPhase === 'guided'
    ? (level.guidedSteps?.[state.guidedStep]?.highlight ?? null)
    : null
  const isAnimBusy = state.phase === 'animating' || state.phase === 'running'

  return (
    <div className={styles.screen} onMouseMove={resetIdle}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.levelTag}>LEVEL {level.id}</span>
          <span className={styles.levelTitle}>{level.title}</span>
        </div>
        <span className={styles.levelSubtitle}>{level.subtitle}</span>
        <div className={styles.speedControl}>
          <div className={styles.speedLabel}>SPEED</div>
          <div className={styles.speedBtns}>
            {['slow', 'normal', 'fast'].map(s => (
              <button
                key={s}
                className={`${styles.speedBtn} ${speed === s ? styles.speedBtnActive : ''}`}
                onClick={() => setSpeed(s)}
                disabled={isAnimBusy}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Phase indicator ── */}
      {hasGuided && <PhaseIndicator phase={state.levelPhase} />}

      {/* ── 3-column layout ── */}
      <div className={styles.main} id="puzzle-scene">

        {/* Scene column */}
        <div className={`${styles.sceneWrapper} ${currentHighlight === 'scene' ? styles.colHighlighted : ''}`}>
          <SceneView
            level={level}
            clones={state.clones}
            characterAtEnd={state.characterAtEnd}
          />

          {/* Success overlay — contextual labels + next level button */}
          {successOverlay && (
            <div className={styles.successOverlay}>
              {successLabel && (
                successLabel.type === 'number'
                  ? <div className={styles.successNumber}>✓ {successLabel.value}</div>
                  : <div className={styles.successLabelText}>{successLabel.text}</div>
              )}
              {showNextBtn && (
                <button className={styles.nextSceneBtn} onClick={handleNextLevelClick}>
                  {hasNextLevel ? 'NEXT LEVEL →' : 'FINISH →'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Call stack column */}
        <div className={`${styles.stackWrapper} ${currentHighlight === 'callstack' ? styles.colHighlighted : ''}`}>
          <CallStackPanel
            entries={state.callStack}
            functionName={level.functionName}
            onInteract={() => dispatch({ type: 'STACK_INTERACT' })}
          />
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>

          {state.levelPhase === 'scaffold' ? (
            /* ── Scaffold phase: template with blanks ── */
            <ScaffoldEditor
              template={level.scaffoldTemplate}
              functionName={level.functionName}
              paramName={level.paramName}
              onRun={handleScaffoldRun}
              running={isAnimBusy}
            />
          ) : (
            <>
              {/* Editor with lock overlay in guided phase */}
              <div className={`${styles.editorWrapper} ${currentHighlight === 'editor' ? styles.colHighlighted : ''}`}>
                <CodeEditor
                  level={level}
                  onChange={code => dispatch({ type: 'SET_CODE', payload: code })}
                  disabled={state.levelPhase === 'guided' || state.phase === 'animating'}
                  errorLine={state.errorLine}
                  resetKey={`${state.levelPhase}-${state.resetCount}`}
                />
                {state.levelPhase === 'guided' && (
                  <div className={styles.editorLock}>
                    <span className={styles.lockLabel}>LOCKED</span>
                  </div>
                )}
              </div>

              {/* Controls: guided nav vs free run/reset */}
              {state.levelPhase === 'guided' ? (
                <div className={styles.guidedActions}>
                  <span className={styles.stepCounter}>
                    Step {state.guidedStep + 1} of {level.guidedSteps?.length ?? 0}
                  </span>
                  <button className={styles.btnNext} onClick={handleGuidedNext}>
                    {state.guidedStep < (level.guidedSteps?.length ?? 0) - 1
                      ? 'NEXT →'
                      : 'GOT IT, LET ME TRY'}
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.actions}>
                    <button
                      className={styles.btnRun}
                      onClick={handleRun}
                      disabled={isAnimBusy}
                    >
                      {state.phase === 'running' ? '⏳ RUNNING…' : '▶ RUN'}
                    </button>
                    <button
                      className={styles.btnReset}
                      onClick={handleReset}
                      disabled={isAnimBusy}
                    >
                      RESET
                    </button>
                    {state.wrongStreak >= 2 && !state.hintOpen && (
                      <button
                        className={styles.btnHint}
                        onClick={handleHint}
                        disabled={state.phase === 'animating'}
                      >
                        💡 HINT
                      </button>
                    )}
                  </div>

                  {state.hintOpen && level.hint && (
                    <div className={styles.hintBox}>
                      <div className={styles.hintLabel}>— DR. STACK'S HINT —</div>
                      <pre className={styles.hintCode}>{`def ${level.functionName}(${level.paramName}):\n${level.hint}`}</pre>
                      <div className={styles.hintNote}>Fill in the blanks. ___ marks what you need to figure out.</div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Narrator */}
      <NarratorBox
        line={null /* line managed by App */}
        expression={expression}
        isMuted={isMuted}
        onToggleMute={() => {}}
      />
    </div>
  )
}
