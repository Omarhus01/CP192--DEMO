// ═══════════════════════════════════════════════════════════════════════════
//  level2.js — "It Gets Worse"
//  Teaches: recursive step + return value
// ═══════════════════════════════════════════════════════════════════════════

export const level2 = {
  id: 2,
  title: 'It Gets Worse',
  subtitle: 'Climb the staircase. All of it.',
  functionName: 'climb',
  paramName: 'steps',
  initialValue: 5,

  starterCode: `    # climb(5) should return 5
    # Each recursive call should return a value
    # climb(1) is your base case
    pass
`,

  successExplanation: `This time, each clone didn't just stop — it handed a result back up the chain.

climb(5) called climb(4), which called climb(3), which called climb(2), which called climb(1) — the base case.

Then the returns bubbled up: climb(1) returned 1, climb(2) returned 2, climb(3) returned 3... all the way back.

This is how recursive functions return values. Each call waits for the one below it, then uses the result.`,

  hint: `    if steps == ___:   # base case: when to stop?
        return ___
    return ___ + climb(steps - ___)  # build up the answer`,

  scene: {
    stairCount: 5,
    characterLabel: 'YOU',
    goalLabel: '🏁',
  },
}
