// ═══════════════════════════════════════════════════════════════════════════
//  edgeCaseDetector.js
//
//  Pure functions that check for special edge-case conditions.
//  No React, no side effects — returns booleans / trigger keys.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if the current solution combination is "unrecognized" —
 * i.e. not in the known correct list AND not obviously wrong (overflow).
 * Used to trigger the "Adding to database" narrator line.
 */
export function isUnrecognizedSolution(baseCaseKey, recursiveActionKey, levelId) {
  if (levelId === 1) {
    const known = new Set(['bc_correct', 'bc_never', 'bc_toobig'])
    return !known.has(baseCaseKey)
  }
  if (levelId === 2) {
    const knownBase   = new Set(['bc2_correct', 'bc2_never', 'bc2_tooearly'])
    const knownAction = new Set(['ra2_correct', 'ra2_same'])
    return !knownBase.has(baseCaseKey) || !knownAction.has(recursiveActionKey)
  }
  return false
}

/**
 * Check if the player never interacted with the call stack panel.
 * Only relevant for Level 2 (per spec).
 */
export function didIgnoreCallStack(levelId, callStackInteracted) {
  return levelId === 2 && !callStackInteracted
}

/**
 * Determine which idle narrator trigger to fire based on elapsed seconds.
 * Returns a trigger key string, or null if no trigger applies.
 */
export function getIdleTrigger(idleSeconds) {
  if (idleSeconds >= 60) return 'idle60'
  if (idleSeconds >= 30) return 'idle30'
  return null
}

/**
 * Inspects the player's code string and returns a specific mistake key.
 * Only called after a non-success, non-overflow, non-syntax outcome.
 */
export function analyzeWrongCode(userCode, level, result, callCount) {
  const code = userCode ?? ''
  const fn   = level.functionName + '('

  if (level.id === 1) {
    if (!code.includes('if')) return 'missingCondition'
    if (!code.includes(fn))   return 'missingRecursion'
    const infiniteRe = new RegExp(level.functionName + '\\(\\s*' + level.paramName + '\\s*\\)')
    if (infiniteRe.test(code)) return 'infiniteArg'
    return 'wrongResult'
  }

  if (level.id === 2) {
    if (!code.includes(fn))   return 'missingRecursion'
    if (!code.includes('+'))  return 'discardedReturn'
    if (result === 0)         return 'baseCaseOnly'
    return 'wrongArithmetic'
  }

  if (level.id === 3) {
    const count = (code.split(fn).length - 1)
    if (count < 2)     return 'missingBranch'
    if (result === 8)  return 'wrongBaseReturn'
    return 'wrongResult'
  }

  return 'wrongResult'
}

/**
 * Returns the narrator trigger key for a given simulation outcome.
 */
export function outcomeToNarratorTrigger(outcome, isFirstAttempt, levelId) {
  switch (outcome) {
    case 'success':     return isFirstAttempt ? 'correctFirstTry' : 'correct'
    case 'overflow':    return 'noBaseCase'
    case 'earlyExit':   return levelId === 3 ? 'level3EarlyExit' : 'earlyExit'
    case 'wrongDepth':  return 'wrongDepth'
    case 'wrongResult': return levelId === 3 ? 'level3WrongResult' : 'wrongResult'
    default:            return 'correct'
  }
}
