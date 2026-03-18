import { useReducer, useEffect, useRef } from 'react'
import SceneView      from './SceneView.jsx'
import CallStackPanel from './CallStackPanel.jsx'
import CodeEditor     from './CodeEditor.jsx'
import NarratorBox    from './NarratorBox.jsx'
import { executeCode, isUnrecognizedCode } from '../systems/codeExecutor.js'
import { didIgnoreCallStack, getIdleTrigger, outcomeToNarratorTrigger } from '../systems/edgeCaseDetector.js'
import { getLine, getExpression, speak, getSyntaxRepeatLine, LINES } from '../systems/narratorSystem.js'
import { playSpawnSound, playSuccessSound, playOverflowSound, playNarratorClick } from '../systems/audioSystem.js'
import styles from './LevelScreen.module.css'

// ── Reducer ───────────────────────────────────────────────────────────────────

function makeInitial(level) {
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
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CODE':       return { ...state, userCode: action.payload, errorLine: null }
    case 'START_ANIM':     return { ...state, phase: 'animating', callStack: [], clones: [], animSteps: action.steps, stepIndex: 0, characterAtEnd: false, errorLine: null }
    case 'PUSH_CALL':      return { ...state, callStack: [...state.callStack, { depth: action.depth, label: action.label, status: 'active' }], clones: [...state.clones, { depth: action.depth, label: action.label, value: action.value, isBase: false }] }
    case 'MARK_BASE':      return { ...state, callStack: state.callStack.map((e,i) => i === state.callStack.length-1 ? {...e, status:'baseCase'} : e), clones: state.clones.map((c,i) => i === state.clones.length-1 ? {...c, isBase:true} : c) }
    case 'MARK_RETURN':    return { ...state, callStack: state.callStack.map(e => e.depth===action.depth ? {...e,status:'returning'} : e) }
    case 'POP_DEPTH':      return { ...state, callStack: state.callStack.filter(e=>e.depth!==action.depth), clones: state.clones.filter(c=>c.depth!==action.depth) }
    case 'ADVANCE_STEP':   return { ...state, stepIndex: state.stepIndex + 1 }
    case 'SET_PHASE':      return { ...state, phase: action.payload }
    case 'CHAR_AT_END':    return { ...state, characterAtEnd: true }
    case 'WRONG_STREAK':   return { ...state, wrongStreak: state.wrongStreak + 1 }
    case 'OPEN_HINT':      return { ...state, hintOpen: true }
    case 'RESET':          return { ...makeInitial(action.level), resetCount: state.resetCount + 1 }
    case 'STACK_INTERACT': return { ...state, callStackInteracted: true }
    case 'SET_ERROR':      return { ...state, errorLine: action.payload, phase: 'idle' }
    default:               return state
  }
}

// ── LevelScreen ───────────────────────────────────────────────────────────────

export default function LevelScreen({
  level, narratorState, lineTracker, isMuted,
  onNarratorLine, onOverflow, onLevelComplete, onWrongAttempt,
}) {
  const [state, dispatch] = useReducer(reducer, level, makeInitial)

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
  stateRef.current          = state
  narratorStateRef.current  = narratorState
  lineTrackerRef.current    = lineTracker
  isMutedRef.current        = isMuted
  onNarratorLineRef.current = onNarratorLine

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

  // ── Level intro ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const key = level.id === 1 ? 'level1Intro' : 'level2Intro'
    const t = setTimeout(() => fireNarrator(key), 1200)
    return () => clearTimeout(t)
  }, [level.id]) // eslint-disable-line

  // ── Animation engine ────────────────────────────────────────────────────────

  useEffect(() => {
    if (state.phase !== 'animating') return
    if (state.stepIndex >= state.animSteps.length) return

    clearTimeout(animTimerRef.current)
    animTimerRef.current = setTimeout(() => {
      const s = stateRef.current
      const step = s.animSteps[s.stepIndex]
      if (step) processStep(step)
    }, 560)

    return () => clearTimeout(animTimerRef.current)
  }, [state.phase, state.stepIndex]) // eslint-disable-line

  function processStep(step) {
    switch (step.type) {
      case 'call':
        dispatch({ type: 'PUSH_CALL', depth: step.depth, label: step.label, value: step.value })
        playSpawnSound(isMutedRef.current)
        dispatch({ type: 'ADVANCE_STEP' })
        break

      case 'baseCase':
        dispatch({ type: 'MARK_BASE' })
        dispatch({ type: 'ADVANCE_STEP' })
        break

      case 'return':
        dispatch({ type: 'MARK_RETURN', depth: step.depth })
        setTimeout(() => dispatch({ type: 'POP_DEPTH', depth: step.depth }), 320)
        dispatch({ type: 'ADVANCE_STEP' })
        break

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
        setTimeout(() => onOverflow(), 1600)
        break

      case 'complete': {
        const outcome = simResultRef.current?.outcome
        dispatch({ type: 'SET_PHASE', payload: 'done' })
        if (outcome === 'success') {
          dispatch({ type: 'CHAR_AT_END' })
          playSuccessSound(isMutedRef.current)
          handleSuccess()
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

  // ── Outcome handlers ─────────────────────────────────────────────────────────

  function handleSuccess() {
    const ns      = narratorStateRef.current
    const lt      = lineTrackerRef.current
    const isFirst = ns.attemptCount === 0
    const s       = stateRef.current
    const unrecog = isUnrecognizedCode(s.userCode ?? '', level.functionName)

    let text, nextTracker
    if (unrecog) {
      // Unrecognized but correct — special win line, still advance
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

    setTimeout(() => {
      onLevelComplete({ outcome: 'success', narratorLine: text, ignoredStack: ignored, unrecognized: unrecog })
    }, 1600)
  }

  function handleWrongResult(outcome) {
    onWrongAttempt?.()
    onlySyntaxErrorsRef.current = false
    dispatch({ type: 'WRONG_STREAK' })
    const trigger = outcomeToNarratorTrigger(outcome, false)
    fireNarrator(trigger)
    document.body.classList.add('shake')
    setTimeout(() => document.body.classList.remove('shake'), 450)
    setTimeout(() => { dispatch({ type: 'RESET', level }); simResultRef.current = null }, 2400)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const expression = getExpression(narratorState)

  return (
    <div className={styles.screen} onMouseMove={resetIdle}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.levelTag}>LEVEL {level.id}</span>
          <span className={styles.levelTitle}>{level.title}</span>
        </div>
        <span className={styles.levelSubtitle}>{level.subtitle}</span>
      </div>

      {/* 3-column layout */}
      <div className={styles.main} id="puzzle-scene">
        <SceneView
          level={level}
          clones={state.clones}
          characterAtEnd={state.characterAtEnd}
        />

        <CallStackPanel
          entries={state.callStack}
          functionName={level.functionName}
          onInteract={() => dispatch({ type: 'STACK_INTERACT' })}
        />

        {/* Right panel: editor + buttons */}
        <div className={styles.rightPanel}>
          <CodeEditor
            level={level}
            onChange={code => dispatch({ type: 'SET_CODE', payload: code })}
            disabled={state.phase === 'animating'}
            errorLine={state.errorLine}
          />

          <div className={styles.actions}>
            <button
              className={styles.btnRun}
              onClick={handleRun}
              disabled={state.phase === 'animating' || state.phase === 'running'}
            >
              {state.phase === 'running' ? '⏳ RUNNING…' : '▶ RUN'}
            </button>
            <button
              className={styles.btnReset}
              onClick={handleReset}
              disabled={state.phase === 'animating' || state.phase === 'running'}
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
