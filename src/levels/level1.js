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
    { text: "The elevator is broken. Five floors. The character needs to reach the top. They can only climb one floor at a time — which means this is a job for clones.", highlight: 'scene' },
    { text: "Your function is called climb. It takes one argument: the number of floors still to go. Each clone handles one floor and passes the rest down. Your job is to write when it stops and what it passes.", highlight: 'editor' },
    { text: "Watch this panel as the function runs. Every time climb calls climb, a new entry appears here. This is the call stack. It's not decoration — it's the entire lesson.", highlight: 'callstack' },
    { text: "You need two things: a base case — when is the floor count small enough to handle directly — and a recursive call that passes a smaller number to the next clone. Both need to be in your function.", highlight: null },
  ],

  scaffoldIntroLine: "Good. Now fill in the two blanks. First: when is the floor count small enough to stop? Second: what do you pass to the clone?",
  scaffoldTemplate: "if floors <= ___:\n    return True\nreturn climb(___)",
  scaffoldWrongLine: "Not quite. First blank is the threshold — one floor is close enough. Second blank is what you hand down — one less floor than you have.",
  freePhaseIntro: "Good. Now write it from scratch. No blanks to fill. Just the function.",

  starterCode: `    # When is the floor count small enough to climb directly?
    # What should the clone handle?
    pass
`,

  successExplanation: `You just used recursion.

Each clone handled a slightly smaller version of the same problem — floors minus one — until the floor count was small enough to climb directly.

That stopping condition ("when floors ≤ 1, return True") is the **base case**. Without it, the clones never stop spawning.

The function called itself with a smaller input each time, until it hit the base case. That's recursion.`,

  hint: `The base case is: if floors <= 1, return True. When there's one floor left, you're already close enough — stop there. The recursive call is: climb(floors - 1). One less floor each time, all the way down to one. That is the complete function. I have now given you the answer. Please write it.`,

  scene: {
    floorCount: 5,
  },
}
