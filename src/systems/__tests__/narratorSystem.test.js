import { describe, it, expect } from 'vitest'
import {
  getLine,
  getExpression,
  getSyntaxRepeatLine,
  LINES,
} from '../narratorSystem.js'

const baseState = {
  attemptCount: 0,
  lastMistakeType: null,
  unrecognizedSolutionsFound: [],
  idleSeconds: 0,
  playerSolvedFastCount: 0,
  level1Perfect: false,
}

// ── getLine — rotation ────────────────────────────────────────────────────────

describe('getLine — rotation via lineTracker', () => {
  it('returns first line and advances tracker', () => {
    const { text, nextTracker } = getLine('earlyExit', baseState, {})
    expect(text).toBe(LINES.earlyExit[0])
    expect(nextTracker.earlyExit).toBe(1)
  })

  it('returns second line when tracker is at 1', () => {
    const { text } = getLine('earlyExit', baseState, { earlyExit: 1 })
    expect(text).toBe(LINES.earlyExit[1])
  })

  it('wraps around after exhausting all lines', () => {
    const len = LINES.earlyExit.length
    const { text } = getLine('earlyExit', baseState, { earlyExit: len })
    expect(text).toBe(LINES.earlyExit[0])
  })

  it('returns null text for a non-existent trigger key', () => {
    const { text } = getLine('nonExistentKey', baseState, {})
    expect(text).toBeNull()
  })
})

describe('getLine — noBaseCase escalation by attemptCount', () => {
  it('attempt 0 → first noBaseCase line', () => {
    const { text } = getLine('noBaseCase', { ...baseState, attemptCount: 0 }, {})
    expect(text).toBe(LINES.noBaseCase[0])
  })

  it('attempt 2 → third noBaseCase line', () => {
    const { text } = getLine('noBaseCase', { ...baseState, attemptCount: 2 }, {})
    expect(text).toBe(LINES.noBaseCase[2])
  })

  it('attempt beyond array length → clamps to last line', () => {
    const last = LINES.noBaseCase.length - 1
    const { text } = getLine('noBaseCase', { ...baseState, attemptCount: 100 }, {})
    expect(text).toBe(LINES.noBaseCase[last])
  })

  it('lineTracker is not advanced for noBaseCase', () => {
    const tracker = { noBaseCase: 2 }
    const { nextTracker } = getLine('noBaseCase', { ...baseState, attemptCount: 1 }, tracker)
    expect(nextTracker).toEqual(tracker)
  })
})

describe('getLine — correct tier selection by attemptCount', () => {
  it('attemptCount 0 → index 0', () => {
    const { text } = getLine('correct', { ...baseState, attemptCount: 0 }, {})
    expect(text).toBe(LINES.correct[0])
  })

  it('attemptCount 3 → index 1', () => {
    const { text } = getLine('correct', { ...baseState, attemptCount: 3 }, {})
    expect(text).toBe(LINES.correct[1])
  })

  it('attemptCount 6 → index 2', () => {
    const { text } = getLine('correct', { ...baseState, attemptCount: 6 }, {})
    expect(text).toBe(LINES.correct[2])
  })

  it('attemptCount 10 → index 3', () => {
    const { text } = getLine('correct', { ...baseState, attemptCount: 10 }, {})
    expect(text).toBe(LINES.correct[3])
  })
})

// ── getExpression ─────────────────────────────────────────────────────────────

describe('getExpression', () => {
  it('neutral at 0 attempts', () => {
    expect(getExpression({ ...baseState, attemptCount: 0 })).toBe('neutral')
  })

  it('neutral at 2 attempts', () => {
    expect(getExpression({ ...baseState, attemptCount: 2 })).toBe('neutral')
  })

  it('stressed at 3 attempts', () => {
    expect(getExpression({ ...baseState, attemptCount: 3 })).toBe('stressed')
  })

  it('stressed at 4 attempts', () => {
    expect(getExpression({ ...baseState, attemptCount: 4 })).toBe('stressed')
  })

  it('gone at 5 attempts', () => {
    expect(getExpression({ ...baseState, attemptCount: 5 })).toBe('gone')
  })

  it('gone at 10 attempts', () => {
    expect(getExpression({ ...baseState, attemptCount: 10 })).toBe('gone')
  })
})

// ── getSyntaxRepeatLine ───────────────────────────────────────────────────────

describe('getSyntaxRepeatLine', () => {
  it('count 3 → first repeat line (index 0)', () => {
    const line = getSyntaxRepeatLine(3)
    expect(typeof line).toBe('string')
    expect(line.length).toBeGreaterThan(0)
  })

  it('count 4 → second repeat line', () => {
    expect(getSyntaxRepeatLine(4)).not.toBe(getSyntaxRepeatLine(3))
  })

  it('count 5 → third repeat line', () => {
    expect(getSyntaxRepeatLine(5)).not.toBe(getSyntaxRepeatLine(4))
  })

  it('clamps at last line for very high counts', () => {
    expect(getSyntaxRepeatLine(100)).toBe(getSyntaxRepeatLine(5))
  })
})
