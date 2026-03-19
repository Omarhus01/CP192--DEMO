// ═══════════════════════════════════════════════════════════════════════════
//  recursionEngine.js
//
//  Simulates the recursive chain for a given level + player inputs.
//  Returns a structured array of animation steps — no React, no side effects.
//
//  NOTE: Runtime execution uses codeExecutor.js (Skulpt). This file is kept
//  for consistency and reference but is not called during gameplay.
// ═══════════════════════════════════════════════════════════════════════════

const MAX_DEPTH = 8

/**
 * @param {number} levelId
 * @param {string} baseCaseKey
 * @param {string} recursiveActionKey
 * @param {object} levelConfig
 * @returns {{ outcome: string, steps: Step[] }}
 */
export function simulate(levelId, baseCaseKey, recursiveActionKey, levelConfig) {
  if (levelId === 1) return simulateLevel1(baseCaseKey, levelConfig.initialValue)
  if (levelId === 2) return simulateLevel2(baseCaseKey, recursiveActionKey, levelConfig.initialValue)
  return { outcome: 'unknown', steps: [] }
}

// ── Level 1: climb(floors) — teach base case ─────────────────────────────────

function simulateLevel1(baseCaseKey, initialFloors) {
  const steps = []
  let overflowed = false

  function recurse(floors, depth) {
    if (overflowed) return

    steps.push({ type: 'call', depth, label: `climb(${floors})`, value: floors })

    if (depth >= MAX_DEPTH) {
      steps.push({ type: 'overflow', depth })
      overflowed = true
      return
    }

    const atBase = checkBaseCase1(baseCaseKey, floors)

    if (atBase) {
      steps.push({ type: 'baseCase', depth, label: `climb(${floors}) → climb directly!`, value: floors })
      steps.push({ type: 'return',   depth, label: `return True`, value: true })
      return
    }

    recurse(floors - 1, depth + 1)

    if (!overflowed) {
      steps.push({ type: 'return', depth, label: `return from climb(${floors})`, value: true })
    }
  }

  recurse(initialFloors, 0)
  if (!overflowed) steps.push({ type: 'complete' })

  let outcome
  if (overflowed)                    outcome = 'overflow'
  else if (baseCaseKey === 'bc_correct') outcome = 'success'
  else if (baseCaseKey === 'bc_toobig')  outcome = 'earlyExit'
  else                               outcome = 'unknown'

  return { outcome, steps }
}

function checkBaseCase1(key, floors) {
  switch (key) {
    case 'bc_correct': return floors <= 1
    case 'bc_never':   return false
    case 'bc_toobig':  return floors <= 5   // fires immediately on floors=5
    default:           return false
  }
}

// ── Level 2: count(coins) — teach recursive step + return value ───────────────

function simulateLevel2(baseCaseKey, recursiveActionKey, initialCoins) {
  const steps = []
  let overflowed = false

  function recurse(n, depth) {
    if (overflowed) return

    steps.push({ type: 'call', depth, label: `count(${n})`, value: n })

    if (depth >= MAX_DEPTH) {
      steps.push({ type: 'overflow', depth })
      overflowed = true
      return
    }

    const atBase = checkBaseCase2(baseCaseKey, n)

    if (atBase) {
      steps.push({ type: 'baseCase', depth, label: `count(${n}) → base case!`, value: n })
      steps.push({ type: 'return',   depth, label: `return 0`, value: 0 })
      return
    }

    const nextN = getNextN2(recursiveActionKey, n)
    recurse(nextN, depth + 1)

    if (!overflowed) {
      // return value = n (correct when base case is coins==0 and step is coins-1)
      steps.push({ type: 'return', depth, label: `return ${n}`, value: n })
    }
  }

  recurse(initialCoins, 0)
  if (!overflowed) steps.push({ type: 'complete' })

  let outcome
  if (overflowed) {
    outcome = 'overflow'
  } else if (baseCaseKey === 'bc2_correct' && recursiveActionKey === 'ra2_correct') {
    outcome = 'success'
  } else {
    outcome = 'wrongResult'
  }

  return { outcome, steps }
}

function checkBaseCase2(key, n) {
  switch (key) {
    case 'bc2_correct':  return n === 0
    case 'bc2_never':    return false
    case 'bc2_tooearly': return n <= 3   // fires early, wrong total
    default:             return false
  }
}

function getNextN2(key, n) {
  switch (key) {
    case 'ra2_correct': return n - 1   // terminates correctly
    case 'ra2_same':    return n       // infinite loop
    default:            return n - 1
  }
}
