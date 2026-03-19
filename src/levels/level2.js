// ═══════════════════════════════════════════════════════════════════════════
//  level2.js — "The Coin Stack"
//  Teaches: recursive step + return value
// ═══════════════════════════════════════════════════════════════════════════

export const level2 = {
  id: 2,
  title: 'The Coin Stack',
  subtitle: 'Count every coin.',
  functionName: 'count',
  paramName: 'coins',
  initialValue: 5,

  // ── Guided phase ──────────────────────────────────────────────────────────
  guidedSteps: [
    { text: "Five coins. Your function picks up one coin at a time. Each clone picks one up and asks the clone below it to count the rest.", highlight: 'scene' },
    { text: "This time your function must return a value — the number of coins counted. Each clone adds 1 to what the clone below returned. Watch what travels back up.", highlight: 'callstack' },
    { text: "Base case: if there are zero coins, return 0. Recursive case: return 1 plus count of coins minus 1. Think about why those two pieces produce the total.", highlight: 'editor' },
  ],

  scaffoldIntroLine: "You've seen how it works. Fill in the four blanks. Think carefully about what each one should be.",
  scaffoldTemplate: "if coins == ___:\n    return ___\nreturn ___ + count(___)",
  scaffoldWrongLine: "Not quite. Check your return values. count(0) should return 0, and the recursive case should return 1 + count of a smaller input.",
  freePhaseIntro: "You've seen it. Now write it yourself without the scaffolding.",

  starterCode: `    # count(5) should return 5
    # count(0) is your base case — return 0
    # Each recursive call should return 1 + count(coins - 1)
    pass
`,

  successExplanation: `This time, each clone didn't just stop — it handed a number back up the chain.

count(5) called count(4), which called count(3)... down to count(0) — the base case, which returned 0.

Then the returns bubbled up: count(0) returned 0, count(1) returned 1, count(2) returned 2... all the way to count(5) returning 5.

Each call waited for the one below it, then added 1 to the result. That is how recursive functions return values.`,

  hint: `    if coins == ___:   # base case: no coins left
        return ___          # nothing to count
    return ___ + count(coins - ___)  # one coin plus the rest`,

  scene: {
    coinCount: 5,
  },
}
