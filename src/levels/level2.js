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
    { text: "Five coins. Your function picks one up, then asks a clone to count the rest. Each clone does the same — picks one up, asks the next clone to count what's left. This continues until there are no coins left.", highlight: 'scene' },
    { text: "This time, your function has to return something — the number of coins counted. Each clone returns 1 plus what the clone below it returned. The base case returns 0. Pay attention to what travels back up.", highlight: 'callstack' },
    { text: "Base case: if coins equals zero, return 0. There's nothing left to count. Recursive case: return 1 plus count(coins minus 1). One coin here, plus however many are below. That's the whole structure.", highlight: 'editor' },
  ],

  scaffoldIntroLine: "You've seen it run. Now fill in the four blanks. Think about what each position needs to be.",
  scaffoldTemplate: "if coins == ___:\n    return ___\nreturn ___ + count(___)",
  scaffoldWrongLine: "Not quite. count(0) returns 0. The recursive case returns 1 plus count of a smaller number. Check both.",
  freePhaseIntro: "You've seen the structure. Now write it yourself.",

  starterCode: `    # count(5) should return 5
    # count(0) is your base case — return 0
    # Each recursive call should return 1 + count(coins - 1)
    pass
`,

  successExplanation: `This time, each clone didn't just stop — it handed a number back up the chain.

count(5) called count(4), which called count(3)... down to count(0) — the base case, which returned 0.

Then the returns bubbled up: count(0) returned 0, count(1) returned 1, count(2) returned 2... all the way to count(5) returning 5.

Each call waited for the one below it, then added 1 to the result. That is how recursive functions return values.`,

  hint: `The base case is: if coins == 0, return 0. No coins left means nothing to count. The recursive case is: return 1 + count(coins - 1). You're holding one coin, and a clone is counting the rest. Add them together. That is the entire function. You now have the answer. Use it.`,

  hints: {
    missingRecursion: "You need: return 1 + count(coins - 1). The 1 is this clone's contribution. count(coins - 1) is the clone below doing the rest.",
    discardedReturn: "You called count(coins - 1) but didn't use the result. You need: return 1 + count(coins - 1) — add 1 to whatever came back from below.",
    wrongArithmetic: "Each clone returns 1 + count(coins - 1). Check every return statement — the 1 must be added at every step except the base case.",
    baseCaseOnly: "Your recursive case isn't returning the right value. It should be: return 1 + count(coins - 1). The base case handles coins==0, everything else accumulates.",
  },

  scene: {
    coinCount: 5,
  },
}
