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
 * Returns the narrator trigger key for a given simulation outcome.
 */
export function outcomeToNarratorTrigger(outcome, isFirstAttempt) {
  switch (outcome) {
    case 'success':     return isFirstAttempt ? 'correctFirstTry' : 'correct'
    case 'overflow':    return 'noBaseCase'
    case 'earlyExit':   return 'earlyExit'
    case 'wrongDepth':  return 'wrongDepth'
    case 'wrongResult': return 'wrongResult'
    default:            return 'correct'
  }
}
