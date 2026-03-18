// ═══════════════════════════════════════════════════════════════════════════
//  recursionEngine.js
//
//  Simulates the recursive chain for a given level + player inputs.
//  Returns a structured array of animation steps — no React, no side effects.
// ═══════════════════════════════════════════════════════════════════════════

const MAX_DEPTH = 8  // visual budget + overflow trigger

/**
 * Run the simulation for a level.
 *
 * @param {number} levelId
 * @param {string} baseCaseKey
 * @param {string} recursiveActionKey
 * @param {object} levelConfig
 * @returns {{ outcome: string, steps: Step[] }}
 *
 * outcome: 'success' | 'overflow' | 'earlyExit' | 'wrongDepth' | 'unknown'
 *
 * Step shapes:
 *   { type: 'call',     depth, label, value }
 *   { type: 'baseCase', depth, label, value }
 *   { type: 'return',   depth, label, value }
 *   { type: 'overflow', depth }
 *   { type: 'complete' }
 */
export function simulate(levelId, baseCaseKey, recursiveActionKey, levelConfig) {
  if (levelId === 1) return simulateLevel1(baseCaseKey, levelConfig.initialValue)
  if (levelId === 2) return simulateLevel2(baseCaseKey, recursiveActionKey, levelConfig.initialValue)
  return { outcome: 'unknown', steps: [] }
}

// ── Level 1: solve(gap) — teach base case ────────────────────────────────────

function simulateLevel1(baseCaseKey, initialGap) {
  const steps = []
  let overflowed = false

  function recurse(gap, depth) {
    if (overflowed) return

    steps.push({ type: 'call', depth, label: `solve(${gap})`, value: gap })

    if (depth >= MAX_DEPTH) {
      steps.push({ type: 'overflow', depth })
      overflowed = true
      return
    }

    const atBase = checkBaseCase1(baseCaseKey, gap)

    if (atBase) {
      steps.push({ type: 'baseCase', depth, label: `solve(${gap}) → jump!`, value: gap })
      steps.push({ type: 'return',   depth, label: `return (jumped)`, value: gap })
      return
    }

    // Recursive case: solve(gap - 1)
    recurse(gap - 1, depth + 1)

    if (!overflowed) {
      steps.push({ type: 'return', depth, label: `return from solve(${gap})`, value: gap })
    }
  }

  recurse(initialGap, 0)

  if (!overflowed) {
    steps.push({ type: 'complete' })
  }

  let outcome
  if (overflowed) {
    outcome = 'overflow'
  } else if (baseCaseKey === 'bc_correct') {
    outcome = 'success'
  } else if (baseCaseKey === 'bc_toobig') {
    // Base case fired immediately — no recursion
    outcome = 'earlyExit'
  } else {
    outcome = 'unknown'
  }

  return { outcome, steps }
}

function checkBaseCase1(key, gap) {
  switch (key) {
    case 'bc_correct': return gap <= 1
    case 'bc_never':   return false
    case 'bc_toobig':  return gap <= 5   // gap=4 satisfies this immediately
    default:           return false
  }
}

// ── Level 2: climb(steps) — teach recursive step + return value ──────────────

function simulateLevel2(baseCaseKey, recursiveActionKey, initialSteps) {
  const steps = []
  let overflowed = false

  function recurse(n, depth) {
    if (overflowed) return

    steps.push({ type: 'call', depth, label: `climb(${n})`, value: n })

    if (depth >= MAX_DEPTH) {
      steps.push({ type: 'overflow', depth })
      overflowed = true
      return
    }

    const atBase = checkBaseCase2(baseCaseKey, n)

    if (atBase) {
      steps.push({ type: 'baseCase', depth, label: `climb(${n}) → climb 1 step!`, value: n })
      steps.push({ type: 'return',   depth, label: `return 1`, value: 1 })
      return
    }

    const nextN = getNextN2(recursiveActionKey, n)
    recurse(nextN, depth + 1)

    if (!overflowed) {
      steps.push({ type: 'return', depth, label: `return (step ${n} done)`, value: n })
    }
  }

  recurse(initialSteps, 0)

  if (!overflowed) {
    steps.push({ type: 'complete' })
  }

  let outcome
  if (overflowed) {
    outcome = 'overflow'
  } else if (baseCaseKey === 'bc2_correct' && recursiveActionKey === 'ra2_correct') {
    outcome = 'success'
  } else if (!overflowed) {
    // Resolved but wrong — base case fired too early
    outcome = 'wrongDepth'
  } else {
    outcome = 'unknown'
  }

  return { outcome, steps }
}

function checkBaseCase2(key, n) {
  switch (key) {
    case 'bc2_correct':   return n <= 1
    case 'bc2_never':     return false
    case 'bc2_tooearly':  return n <= 3   // fires at depth 2 instead of 4
    default:              return false
  }
}

function getNextN2(key, n) {
  switch (key) {
    case 'ra2_correct': return n - 1   // terminates
    case 'ra2_same':    return n       // infinite loop
    default:            return n - 1
  }
}
