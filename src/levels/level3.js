// ═══════════════════════════════════════════════════════════════════════════
//  level3.js — "The Split"
//  Teaches: multiple recursive calls (branching recursion)
// ═══════════════════════════════════════════════════════════════════════════

export const level3 = {
  id: 3,
  title: 'The Split',
  subtitle: 'Every call spawns two more.',
  functionName: 'fib',
  paramName: 'n',
  initialValue: 5,
  expectedResult: 5,

  // ── Guided phase ──────────────────────────────────────────────────────────
  guidedSteps: [
    { text: "The Fibonacci sequence: 0, 1, 1, 2, 3, 5... Your function needs to find fib(5). The answer is 5. But unlike before, this function calls itself TWICE on every step — the call tree doesn't grow in a line, it branches.", highlight: 'scene' },
    { text: "This time your function calls itself TWICE. fib(n) calls fib(n-1) and fib(n-2), then adds the results. Watch the tree — it doesn't build a single chain. It splits. Every call spawns two more. The tree explodes.", highlight: 'scene' },
    { text: "You need a base case that handles both fib(0) and fib(1). If n is less than or equal to 1, return n — that gives you 0 for fib(0) and 1 for fib(1). Then the recursive case: return fib(n-1) plus fib(n-2). Both calls. Not one.", highlight: 'editor' },
    { text: "The tree on the screen shows every branch. Watch each node light up as it's called — left branch fib(n-1), right branch fib(n-2). Each node turns green from the bottom up. When both sub-branches finish, the answers combine at the top. That is branching recursion.", highlight: null },
  ],

  scaffoldIntroLine: "You've seen it branch. Now fill in the four blanks: the threshold, the base return, and the two recursive arguments.",
  scaffoldTemplate: "if n <= ___:\n    return ___  # fib(0)=0, fib(1)=1 — return n itself\nreturn fib(___) + fib(___)",
  scaffoldWrongLine: "Check your blanks. The threshold is 1. The return value is n itself — fib(0) returns 0 and fib(1) returns 1, so you return n. The two recursive calls are n-1 and n-2.",
  freePhaseIntro: "You've seen the branch. Now write the full function — both base case and both recursive calls.",

  starterCode: `    # fib(0) = 0, fib(1) = 1
    # fib(n) = fib(n-1) + fib(n-2)
    pass
`,

  successExplanation: `fib(5) split into fib(4) and fib(3). Each of those split again.
All the way down to fib(1) and fib(0) — the base cases that return immediately.

Every branch waited for both its children before it could return its own value.
That is branching recursion.`,

  hint: `The base case: if n <= 1, return n. This handles both fib(0) = 0 and fib(1) = 1 in one line. The recursive case: return fib(n - 1) + fib(n - 2). Two separate calls, added together. Both are required. That is the complete function. You now have it.`,

  hints: {
    missingBranch: "Fibonacci needs two recursive calls: return fib(n-1) + fib(n-2). Both are required — one for the left branch, one for the right. One call gives the wrong answer.",
    wrongBaseReturn: "Your base case should be: if n <= 1: return n. This gives fib(0)=0 and fib(1)=1 automatically. Using return 1 for both base cases adds an extra 1 to every path.",
  },

  scene: {
    type: 'fib',
  },
}
