// ═══════════════════════════════════════════════════════════════════════════
//  level1.js — "The Simple Job"
//  Teaches: base case
// ═══════════════════════════════════════════════════════════════════════════

export const level1 = {
  id: 1,
  title: 'The Simple Job',
  subtitle: 'Get to the coin.',
  functionName: 'solve',
  paramName: 'gap',
  initialValue: 4,

  // Pre-filled in the editor (read-only signature, editable body)
  starterCode: `    # When is the gap small enough to jump?
    # When it isn't, what should the clone do?
    pass
`,

  successExplanation: `You just used recursion.

Each clone handled a slightly smaller version of the same problem — gap minus one — until the gap was small enough to jump across.

That stopping condition ("when gap ≤ 1, return") is called the **base case**. Without it, the clones would never stop spawning.

The function called itself with a smaller input, until it hit the base case. That's recursion.`,

  hint: `    if gap <= ___:   # when is the gap small enough?
        return
    solve(gap - ___)  # what do you pass to the next clone?`,

  scene: {
    gapSize: 4,
    characterLabel: 'YOU',
    goalLabel: '🪙',
  },
}
