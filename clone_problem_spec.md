# "The Clone Problem" — Claude Code Spec

## Project Overview

A React-based educational puzzle game that teaches recursion through a surreal, narrative-driven experience. The tone is inspired by Superliminal and the fever meme: a narrator who starts calm and clinical, then progressively loses his mind as the player makes mistakes, triggers edge cases, or causes infinite recursion. The game is meant to be funny, slightly unhinged, and genuinely educational.

---

## Tech Stack

- React (no Next.js, plain React with hooks)
- CSS Modules or styled-components for styling
- No backend — all state is managed in React
- Voice: use the browser's built-in Web Speech API (`window.speechSynthesis`) — no external library, no API key needed
- Fonts: something characterful (not Inter, not Roboto) — suggest "Space Mono" for the clinical/glitchy feel or "DM Serif Display" for the narrator's voice
- Color palette: dark background, clinical white text, glitchy neon green accents — think "government facility going wrong"

---

## Game Structure

### Screens
1. **Title Screen** — Game title, start button, brief narrator intro line
2. **Level Screen** — The actual puzzle gameplay
3. **Level Complete Screen** — Narrator reacts to how you solved it
4. **Game Over / Stack Overflow Screen** — Triggered when recursion goes infinite
5. **Credits Screen** — Short, narrator breaks the fourth wall

### Levels (build 2 for the demo)

**Level 1: "The Simple Job"**
- Goal: Teach base case
- Puzzle: Player must get a character to a coin across a gap
- Mechanic: Player can summon a clone. The clone faces the same gap. Player must define: what does the clone do when the gap is small enough to jump? (base case)
- Win condition: Player correctly identifies the base case and the chain resolves
- Fail condition: Player keeps cloning without a base case → stack overflow screen

**Level 2: "It Gets Worse"**
- Goal: Teach recursive step + return value
- Puzzle: A staircase of 5 steps. Character can only climb 1 step alone. Must clone itself to climb the rest.
- Mechanic: Each clone handles one step, passes the result (position) back up
- Win condition: Chain resolves correctly, character reaches the top
- Fail condition: Player tries to skip steps or clone infinitely

---

## Inputs

### Player Inputs (per level)
- **Base case selector**: A UI element (dropdown or clickable condition) where the player chooses when to stop recursing
  - Options vary per level (e.g., "when gap = 0", "when gap = 1", "never stop")
- **Recursive action selector**: What the clone does each step
  - Options vary per level
- **"Call Clone" button**: Triggers the recursive call visually
- **"Run" button**: Executes the full recursive chain with the player's chosen inputs
- **"Reset" button**: Resets the level without narrator comment (or with one if done too many times)

### System Inputs (internal)
- Current recursion depth (integer, starts at 0)
- Player's selected base case (string key)
- Player's selected recursive action (string key)
- Number of attempts on current level (integer)
- List of actions player has taken this session (for easter egg detection)

---

## Outputs

### Visual Outputs
- **Clone stack visualization**: Each recursive call spawns a smaller, slightly glitchier version of the character, stacked visually on screen. Deeper = smaller + more distorted.
- **Call stack panel**: A sidebar showing the actual call stack as text, updating in real time as clones are spawned (e.g., `solve(5)` → `solve(4)` → `solve(3)`)
- **Narrator text box**: Fixed at the bottom of screen. Shows narrator dialogue. Has a character portrait that changes expression (calm → stressed → unhinged).
- **Result animation**: When the chain resolves correctly, results "bubble up" visually from the deepest clone back to the original

### Narrator Outputs (text + voice)
See Narrator Dialogue System section below. Every narrator line that appears in the text box must also be spoken aloud using the Web Speech API.

---

## Constraints

### Technical
- Max recursion depth rendered on screen: 8 (beyond this, trigger stack overflow screen regardless of correctness — visual budget)
- All puzzle logic must be solvable with correct inputs — no unsolvable levels
- Game must run entirely in browser, no server calls
- Mobile is not a priority — optimize for laptop/desktop presentation
- Load time must be fast — no heavy assets, use CSS animations over video

### Design
- Every wrong answer must trigger a narrator reaction — no silent failures
- The narrator must have at least 3 different lines per failure type so it doesn't feel repetitive
- The game must be completable in under 5 minutes for demo purposes
- Narrator tone escalates with attempt count — attempt 1 is calm, attempt 3+ is unhinged

### Educational
- The call stack panel must always be visible during gameplay — this is the core learning artifact
- Level complete screen must show a plain-English explanation of what just happened recursively
- The game must never use the word "recursion" in the first level — let the player experience it first, name it second

---

## Edge Cases

### Player-triggered edge cases (with narrator responses)

**1. No base case selected / "never stop" selected**
- Trigger: Player hits Run with no base case
- Visual: Clones spawn rapidly, screen fills up, gets glitchy
- Narrator: Escalating panic
  - Attempt 1: *"Interesting choice. Let's see where this goes."*
  - Attempt 2: *"They're still spawning. This is fine."*
  - Attempt 3: *"STOP. STOP CALLING YOURSELVES. I AM BEGGING YOU."*
- Outcome: Stack overflow screen

**2. Correct answer found on first try**
- Narrator (surprised): *"Oh. You just... got it. I had three more hints prepared. Okay then."*

**3. Player resets more than 3 times**
- Narrator: *"You know what, I'm going to redesign this level. Give me a second."* → level visually "rearranges" slightly (just a CSS animation, same puzzle)

**4. Player finds an unrecognized solution combination**
- Trigger: Player selects inputs that aren't in the expected solution set but aren't obviously wrong either
- Narrator: *"...Huh. That's not how I designed this. Adding it to the database. Don't tell anyone."*
- Outcome: Flag the combination in state, show it in a secret "Uncharted Solutions" list at the end
- Second time: *"You again. With the weird solutions. I've filed a formal report."*

**5. Player solves Level 2 before engaging with the call stack panel**
- Detect: If player never looked at the call stack (no hover/interaction)
- Narrator: *"Did you even look at the call stack? That's literally the whole point."* → briefly highlights the panel

**6. Player clicks "Call Clone" repeatedly without selecting inputs**
- Narrator: *"You need to tell the clone what to do. It's not psychic. Unlike me."*

**7. Player idles for more than 30 seconds**
- Narrator: *"Still there? Take your time. I'm just... standing here. In the void."*
- At 60 seconds: *"I've started writing a novel. It's about waiting."*

**8. Player reaches Level 2 without making any mistakes in Level 1**
- Narrator: *"Perfect score on Level 1. I've adjusted Level 2 accordingly."* → nothing actually changes, narrator is just messing with them

---

## Narrator Dialogue System

### Character
- Name: **Dr. Callum Stack** (yes, the name is a pun, yes he's aware of it and hates that you noticed)
- Visual: Small portrait in corner of text box. Three states: Neutral, Stressed, Gone (just static/glitch where face was)
- Tone progression:
  - Attempts 1-2: Professional, slightly condescending
  - Attempts 3-4: Cracks showing, passive aggressive
  - Attempts 5+: Full breakdown, existential, fourth-wall breaking

### Dialogue triggers (implement as a state machine)
```
narratorState = {
  attemptCount: 0,
  lastMistakeType: null,
  unrecognizedSolutionsFound: [],
  idleSeconds: 0,
  playerSolvedFastCount: 0
}
```

Each trigger checks narratorState and picks dialogue accordingly. Rotate through options so the same line doesn't repeat consecutively.

### Voice Implementation (Web Speech API)
Use `window.speechSynthesis` — no install, works in all modern browsers.

```js
// narratorSystem.js
export function speak(text, narratorState) {
  window.speechSynthesis.cancel(); // stop any current speech before speaking
  const utterance = new SpeechSynthesisUtterance(text);

  // Voice: pick a deep, slightly robotic voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes("Daniel") || v.name.includes("Google UK English Male"));
  if (preferred) utterance.voice = preferred;

  // Tone escalates with attempt count
  if (narratorState.attemptCount <= 2) {
    utterance.rate = 0.85;   // slow, calm
    utterance.pitch = 0.9;   // slightly low
  } else if (narratorState.attemptCount <= 4) {
    utterance.rate = 1.05;   // slightly faster
    utterance.pitch = 1.0;
  } else {
    utterance.rate = 1.3;    // fast, unhinged
    utterance.pitch = 1.2;   // higher, stressed
  }

  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}
```

- Call `speak(line, narratorState)` every time a narrator line is triggered
- Cancel previous speech before starting a new line so lines don't stack up
- On the stack overflow screen, voice should speak at max rate + pitch, then cut out abruptly mid-sentence
- Add a mute toggle button (🔊 / 🔇) in the top corner — respect it by checking a `isMuted` flag before calling `speak()`
- Voice must load after a user interaction (browser blocks autoplay) — the Start button click on the title screen counts as the first interaction, so voice works from that point on

### Fourth wall moments (use sparingly, max 2 per playthrough)
- *"You know this is a university project, right? He's presenting this on Thursday. No pressure."*
- *"Recursion is a function calling itself. This game is a game teaching itself. I need to sit down."*

---

## Visual Design Direction

- **Aesthetic**: Clinical government facility gone wrong. Think SCP Foundation meets early 2000s educational software having an existential crisis.
- **Background**: Very dark navy/black, subtle grid lines, occasional glitch flicker on errors
- **Character**: Simple geometric shape (circle with eyes is fine) — gets smaller and more distorted with each recursive depth level
- **Call stack panel**: Monospace font, green text on dark background, like a terminal. Grows downward with each call, shrinks back up on return.
- **Narrator box**: Fixed bottom bar, portrait on left, text on right. Text types out (typewriter effect). Portrait expression changes based on narratorState.
- **Transitions**: Glitchy, not smooth. Wrong answers should feel slightly wrong visually — screen shake, color shift.
- **Stack overflow screen**: Full screen red tint, clones everywhere at random sizes, narrator portrait just static

---

## File Structure (suggested)

```
src/
  components/
    NarratorBox.jsx         # Portrait + dialogue display
    CloneStack.jsx          # Visual clone spawning
    CallStackPanel.jsx      # Terminal-style call stack sidebar
    PuzzleControls.jsx      # Base case + action selectors + buttons
    LevelComplete.jsx       # Post-level screen
    StackOverflow.jsx       # Infinite recursion death screen
  levels/
    level1.js               # Level config: puzzle setup, valid solutions, narrator lines
    level2.js
  systems/
    narratorSystem.js       # State machine for narrator dialogue selection + speak() voice function
    recursionEngine.js      # Core logic: validates player input, simulates recursion
    edgeCaseDetector.js     # Watches for unrecognized solutions, idle time, etc.
  App.jsx
  index.js
```

---

## What "Done" Looks Like for the Demo

- Title screen loads, narrator introduces himself
- Level 1 is fully playable with at least 3 failure states triggering narrator reactions
- Level 2 is fully playable
- At least 2 edge cases (unrecognized solution + infinite recursion) are implemented
- Call stack panel visible and updating in real time
- Level complete screen shows plain-English recursion explanation
- Narrator portrait has at least 2 expression states
- Narrator speaks every line aloud using Web Speech API, with rate/pitch escalating based on attempt count
- Mute toggle button works
- No crashes, no console errors during normal play

---

## What to Tell Claude Code

Paste this entire document. Then add:

> "Build this step by step. Start with the core game loop and Level 1 fully working before touching Level 2. Use React hooks for all state. Keep the narrator system in a separate file so I can edit dialogue easily without touching game logic. Ask me before making any major design decisions not covered in this spec."
