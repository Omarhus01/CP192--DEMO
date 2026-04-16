import { describe, it, expect } from 'vitest'
import { simulate } from '../recursionEngine.js'

const level1Config = { initialValue: 5 }
const level2Config = { initialValue: 5 }

// ── Level 1 ───────────────────────────────────────────────────────────────────

describe('simulate level 1 — bc_correct', () => {
  const { outcome, steps } = simulate(1, 'bc_correct', null, level1Config)

  it('outcome is success', () => {
    expect(outcome).toBe('success')
  })

  it('produces 5 call steps for initialValue=5', () => {
    const calls = steps.filter(s => s.type === 'call')
    expect(calls).toHaveLength(5)
  })

  it('base case fires at depth 4 (floors=1)', () => {
    const bc = steps.find(s => s.type === 'baseCase')
    expect(bc).toBeDefined()
    expect(bc.depth).toBe(4)
    expect(bc.value).toBe(1)
  })

  it('ends with a complete step', () => {
    expect(steps[steps.length - 1].type).toBe('complete')
  })

  it('first step is a call', () => {
    expect(steps[0].type).toBe('call')
  })
})

describe('simulate level 1 — bc_never', () => {
  const { outcome, steps } = simulate(1, 'bc_never', null, level1Config)

  it('outcome is overflow', () => {
    expect(outcome).toBe('overflow')
  })

  it('contains an overflow step', () => {
    expect(steps.some(s => s.type === 'overflow')).toBe(true)
  })

  it('does not contain a complete step', () => {
    expect(steps.some(s => s.type === 'complete')).toBe(false)
  })
})

describe('simulate level 1 — bc_toobig', () => {
  const { outcome, steps } = simulate(1, 'bc_toobig', null, level1Config)

  it('outcome is earlyExit', () => {
    expect(outcome).toBe('earlyExit')
  })

  it('base case fires at depth 0 (floors=5 ≤ 5)', () => {
    const bc = steps.find(s => s.type === 'baseCase')
    expect(bc).toBeDefined()
    expect(bc.depth).toBe(0)
  })

  it('ends with complete (no overflow)', () => {
    expect(steps[steps.length - 1].type).toBe('complete')
  })
})

// ── Level 2 ───────────────────────────────────────────────────────────────────

describe('simulate level 2 — bc2_correct + ra2_correct', () => {
  const { outcome, steps } = simulate(2, 'bc2_correct', 'ra2_correct', level2Config)

  it('outcome is success', () => {
    expect(outcome).toBe('success')
  })

  it('produces 6 call steps for initialValue=5 (0..5 inclusive)', () => {
    const calls = steps.filter(s => s.type === 'call')
    expect(calls).toHaveLength(6)
  })

  it('ends with complete', () => {
    expect(steps[steps.length - 1].type).toBe('complete')
  })
})

describe('simulate level 2 — bc2_never + ra2_same (infinite loop)', () => {
  const { outcome, steps } = simulate(2, 'bc2_never', 'ra2_same', level2Config)

  it('outcome is overflow', () => {
    expect(outcome).toBe('overflow')
  })

  it('contains overflow step', () => {
    expect(steps.some(s => s.type === 'overflow')).toBe(true)
  })
})

describe('simulate level 2 — bc2_correct + ra2_same (base hit but arg unchanged)', () => {
  const { outcome } = simulate(2, 'bc2_correct', 'ra2_same', level2Config)

  it('outcome is overflow (n never decreases to 0)', () => {
    expect(outcome).toBe('overflow')
  })
})

describe('simulate level 2 — bc2_tooearly + ra2_correct', () => {
  const { outcome } = simulate(2, 'bc2_tooearly', 'ra2_correct', level2Config)

  it('outcome is wrongResult (stops too soon)', () => {
    expect(outcome).toBe('wrongResult')
  })
})

// ── Level 3 (not implemented) ────────────────────────────────────────────────

describe('simulate level 3', () => {
  it('returns outcome unknown', () => {
    const { outcome } = simulate(3, 'any', 'any', { initialValue: 5 })
    expect(outcome).toBe('unknown')
  })

  it('returns empty steps array', () => {
    const { steps } = simulate(3, 'any', 'any', { initialValue: 5 })
    expect(steps).toEqual([])
  })
})

// ── Structural invariants ─────────────────────────────────────────────────────

describe('structural invariants across all L1/L2 runs', () => {
  const runs = [
    simulate(1, 'bc_correct', null,        level1Config),
    simulate(1, 'bc_never',   null,        level1Config),
    simulate(1, 'bc_toobig',  null,        level1Config),
    simulate(2, 'bc2_correct', 'ra2_correct', level2Config),
    simulate(2, 'bc2_never',  'ra2_same',  level2Config),
  ]

  it('first step is always type call', () => {
    for (const { steps } of runs) {
      expect(steps[0].type).toBe('call')
    }
  })

  it('overflow step is never followed by complete', () => {
    for (const { steps } of runs) {
      const overflowIdx = steps.findIndex(s => s.type === 'overflow')
      if (overflowIdx !== -1) {
        const after = steps.slice(overflowIdx + 1)
        expect(after.some(s => s.type === 'complete')).toBe(false)
      }
    }
  })

  it('return step depths match a prior call step depth', () => {
    for (const { steps } of runs) {
      const callDepths = new Set(steps.filter(s => s.type === 'call').map(s => s.depth))
      const returnSteps = steps.filter(s => s.type === 'return')
      for (const r of returnSteps) {
        expect(callDepths.has(r.depth)).toBe(true)
      }
    }
  })
})
