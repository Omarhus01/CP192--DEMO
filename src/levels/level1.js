// ═══════════════════════════════════════════════════════════════════════════
//  level1.js — "The Floors"
//  Teaches: base case
// ═══════════════════════════════════════════════════════════════════════════

export const level1 = {
  id: 1,
  title: 'The Floors',
  subtitle: 'The elevator is broken.',
  functionName: 'climb',
  paramName: 'floors',
  initialValue: 5,

  // ── Guided phase ──────────────────────────────────────────────────────────
  guidedSteps: [
    { text: "The elevator is broken. The character is at the bottom and needs to reach the top floor. They can only climb one floor at a time.", highlight: 'scene' },
    { text: "You will write a function called climb. It takes the number of floors remaining. Your job is to make the character reach the top.", highlight: 'editor' },
    { text: "Watch this panel as your function runs. Every recursive call adds an entry here. This is the call stack. climb(5) calls climb(4), which calls climb(3)... look at it.", highlight: 'callstack' },
    { text: "Your function needs two things: a stopping condition — when floors is small enough to climb directly — and a recursive call that handles one floor and passes the rest to a clone.", highlight: null },
  ],

  scaffoldIntroLine: "Good. Now fill in the blanks. Two values. When is the floor count small enough? What do you pass to the clone?",
  scaffoldTemplate: "if floors <= ___:\n    return True\nreturn climb(___)",
  scaffoldWrongLine: "Not quite. First blank: the threshold — when is it close enough to climb directly? Second blank: the smaller problem you hand to the clone.",
  freePhaseIntro: "Good. Now write it yourself. From scratch. No hints.",

  starterCode: `    # When is the floor count small enough to climb directly?
    # What should the clone handle?
    pass
`,

  successExplanation: `You just used recursion.

Each clone handled a slightly smaller version of the same problem — floors minus one — until the floor count was small enough to climb directly.

That stopping condition ("when floors ≤ 1, return True") is the **base case**. Without it, the clones never stop spawning.

The function called itself with a smaller input each time, until it hit the base case. That's recursion.`,

  hint: `    if floors <= ___:   # when is it close enough?
        return True
    climb(floors - ___)  # what do you pass to the next clone?`,

  scene: {
    floorCount: 5,
  },
}
