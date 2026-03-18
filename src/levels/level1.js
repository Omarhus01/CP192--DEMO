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

  // ── Guided phase ──────────────────────────────────────────────────────────
  guidedSteps: [
    { text: "Look at the gap. The character cannot jump it alone. The gap is too large.", highlight: 'scene' },
    { text: "You will write a function called solve. It takes the gap size as input. Your job is to make the character reach the other side.", highlight: 'editor' },
    { text: "Watch this panel. Every time your function calls itself, a new entry appears here. This is the call stack. It is important. Look at it.", highlight: 'callstack' },
    { text: "There are two things your function needs. A stopping condition — when the gap is small enough to jump directly. And a recursive call — for when it isn't. You will write both.", highlight: null },
  ],

  scaffoldIntroLine: "Good. You understand the problem. Now try filling in the blanks. The function is mostly there — you just need to provide two values.",
  scaffoldTemplate: "if gap <= ___:\n    return True\nreturn solve(___)",
  scaffoldWrongLine: "Not quite. The first blank is the threshold — when is the gap small enough? The second blank is the smaller version of the problem.",
  freePhaseIntro: "Good. Now write it yourself. From scratch. No hints.",

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
