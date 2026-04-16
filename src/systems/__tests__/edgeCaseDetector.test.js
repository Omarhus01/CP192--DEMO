import { describe, it, expect } from 'vitest'
import {
  analyzeWrongCode,
  outcomeToNarratorTrigger,
  isUnrecognizedSolution,
  getIdleTrigger,
} from '../edgeCaseDetector.js'

const level1 = { id: 1, functionName: 'climb', paramName: 'floors' }
const level2 = { id: 2, functionName: 'count', paramName: 'coins'  }
const level3 = { id: 3, functionName: 'fib',   paramName: 'n'      }

// ── analyzeWrongCode ──────────────────────────────────────────────────────────

describe('analyzeWrongCode — level 1', () => {
  it('returns missingCondition when no if statement', () => {
    expect(analyzeWrongCode('return climb(floors - 1)', level1, null, 1)).toBe('missingCondition')
  })

  it('returns missingRecursion when no recursive call', () => {
    expect(analyzeWrongCode('if floors <= 1:\n    return True', level1, null, 1)).toBe('missingRecursion')
  })

  it('returns infiniteArg when recursive call passes same argument', () => {
    expect(analyzeWrongCode('if floors <= 1:\n    return True\nreturn climb(floors)', level1, null, 99)).toBe('infiniteArg')
  })

  it('returns infiniteArg with extra whitespace around the arg', () => {
    expect(analyzeWrongCode('if floors <= 1:\n    return True\nreturn climb( floors )', level1, null, 99)).toBe('infiniteArg')
  })

  it('returns wrongResult as fallback when if + call are present and not infinite', () => {
    expect(analyzeWrongCode('if floors <= 2:\n    return True\nreturn climb(floors - 1)', level1, null, 1)).toBe('wrongResult')
  })
})

describe('analyzeWrongCode — level 2', () => {
  it('returns missingRecursion when no count( call', () => {
    expect(analyzeWrongCode('if coins == 0:\n    return 0\nreturn 1', level2, 1, 1)).toBe('missingRecursion')
  })

  it('returns discardedReturn when call present but no + operator', () => {
    expect(analyzeWrongCode('if coins == 0:\n    return 0\ncount(coins - 1)', level2, 1, 5)).toBe('discardedReturn')
  })

  it('returns baseCaseOnly when result is 0', () => {
    expect(analyzeWrongCode('if coins == 0:\n    return 0\nreturn 1 + count(coins - 1)', level2, 0, 1)).toBe('baseCaseOnly')
  })

  it('returns wrongArithmetic as fallback', () => {
    expect(analyzeWrongCode('if coins == 0:\n    return 0\nreturn 2 + count(coins - 1)', level2, 10, 5)).toBe('wrongArithmetic')
  })
})

describe('analyzeWrongCode — level 3', () => {
  it('returns missingBranch when fewer than 2 fib( calls', () => {
    expect(analyzeWrongCode('if n <= 1:\n    return n\nreturn fib(n-1)', level3, 3, 3)).toBe('missingBranch')
  })

  it('returns wrongBaseReturn when result === 8', () => {
    expect(analyzeWrongCode('if n <= 1:\n    return 1\nreturn fib(n-1) + fib(n-2)', level3, 8, 15)).toBe('wrongBaseReturn')
  })

  it('returns wrongResult as fallback with 2 calls and wrong answer', () => {
    expect(analyzeWrongCode('if n <= 1:\n    return n\nreturn fib(n-1) + fib(n-2)', level3, 4, 15)).toBe('wrongResult')
  })
})

// ── outcomeToNarratorTrigger ──────────────────────────────────────────────────

describe('outcomeToNarratorTrigger', () => {
  it('success first attempt → correctFirstTry', () => {
    expect(outcomeToNarratorTrigger('success', true, 1)).toBe('correctFirstTry')
  })

  it('success after retries → correct', () => {
    expect(outcomeToNarratorTrigger('success', false, 1)).toBe('correct')
  })

  it('overflow → noBaseCase', () => {
    expect(outcomeToNarratorTrigger('overflow', false, 1)).toBe('noBaseCase')
  })

  it('earlyExit on L1 → earlyExit', () => {
    expect(outcomeToNarratorTrigger('earlyExit', false, 1)).toBe('earlyExit')
  })

  it('earlyExit on L3 → level3EarlyExit', () => {
    expect(outcomeToNarratorTrigger('earlyExit', false, 3)).toBe('level3EarlyExit')
  })

  it('wrongDepth → wrongDepth', () => {
    expect(outcomeToNarratorTrigger('wrongDepth', false, 2)).toBe('wrongDepth')
  })

  it('wrongResult on L2 → wrongResult', () => {
    expect(outcomeToNarratorTrigger('wrongResult', false, 2)).toBe('wrongResult')
  })

  it('wrongResult on L3 → level3WrongResult', () => {
    expect(outcomeToNarratorTrigger('wrongResult', false, 3)).toBe('level3WrongResult')
  })

  it('unknown outcome → correct (default)', () => {
    expect(outcomeToNarratorTrigger('somethingElse', false, 1)).toBe('correct')
  })
})

// ── isUnrecognizedSolution ────────────────────────────────────────────────────

describe('isUnrecognizedSolution', () => {
  it('L1: known base case keys are not unrecognized', () => {
    expect(isUnrecognizedSolution('bc_correct',  null, 1)).toBe(false)
    expect(isUnrecognizedSolution('bc_never',    null, 1)).toBe(false)
    expect(isUnrecognizedSolution('bc_toobig',   null, 1)).toBe(false)
  })

  it('L1: unknown base case key is unrecognized', () => {
    expect(isUnrecognizedSolution('bc_custom', null, 1)).toBe(true)
  })

  it('L2: both known keys → not unrecognized', () => {
    expect(isUnrecognizedSolution('bc2_correct', 'ra2_correct', 2)).toBe(false)
  })

  it('L2: unknown base case key → unrecognized', () => {
    expect(isUnrecognizedSolution('bc2_custom', 'ra2_correct', 2)).toBe(true)
  })

  it('L2: unknown recursive action key → unrecognized', () => {
    expect(isUnrecognizedSolution('bc2_correct', 'ra2_custom', 2)).toBe(true)
  })

  it('L3: always returns false (not tracked)', () => {
    expect(isUnrecognizedSolution('anything', 'anything', 3)).toBe(false)
  })
})

// ── getIdleTrigger ────────────────────────────────────────────────────────────

describe('getIdleTrigger', () => {
  it('returns null at 0 seconds', () => {
    expect(getIdleTrigger(0)).toBeNull()
  })

  it('returns null at 29 seconds', () => {
    expect(getIdleTrigger(29)).toBeNull()
  })

  it('returns idle30 at exactly 30 seconds', () => {
    expect(getIdleTrigger(30)).toBe('idle30')
  })

  it('returns idle30 at 45 seconds', () => {
    expect(getIdleTrigger(45)).toBe('idle30')
  })

  it('returns idle60 at exactly 60 seconds', () => {
    expect(getIdleTrigger(60)).toBe('idle60')
  })

  it('returns idle60 at 120 seconds', () => {
    expect(getIdleTrigger(120)).toBe('idle60')
  })
})
