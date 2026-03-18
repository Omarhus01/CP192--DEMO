// ═══════════════════════════════════════════════════════════════════════════
//  narratorSystem.js  —  ALL NARRATOR DIALOGUE LIVES HERE
//
//  Edit lines freely. Do not rename trigger keys — game logic uses them.
//  To add lines: append to any array.
//  Voice: ElevenLabs API (Josh, eleven_turbo_v2_5)
// ═══════════════════════════════════════════════════════════════════════════

export const NARRATOR = {
  name: 'Dr. Callum Stack',
  title: 'Head of Theoretical Clone Operations',
}

// ── All dialogue, organised by trigger key ──────────────────────────────────
export const LINES = {

  quizYes: [
    "Oh thank god. I was not prepared to explain variables today.",
  ],

  quizNo1: [
    "Then what are you doing here. Leave.",
  ],

  quizNo2: [
    "...Fine. I'll explain everything. Don't make me regret this.",
  ],

  conceptStep1: [
    "Here is a problem. It's too big to solve directly.",
  ],

  conceptStep2: [
    "So we solve a smaller version of it.",
  ],

  conceptStep3: [
    "Until the problem is so small, the answer is obvious. That's the base case.",
  ],

  conceptStep4: [
    "Then the answers bubble back up. Each step adds its piece.",
  ],

  conceptStep5: [
    "This is what a recursive function looks like in Python.",
  ],

  conceptStep6: [
    "That's recursion. Now do it yourself.",
  ],

  intro: [
    "Welcome. I am Dr. Callum Stack. This is a standard orientation exercise. Nothing unusual is happening.",
    "You will be asked to solve a simple problem. Very simple. Completely routine. Please do not make it weird.",
  ],

  level1Intro: [
    "There is a gap. There is a coin. You have the ability to write a function that calls itself. Figure it out.",
    "Objective: retrieve the coin. Write the function body. Run it. Try not to destroy the call stack.",
  ],

  level2Intro: [
    "Stairs this time. Five of them. Your function needs to return a value now. Don't skip that part.",
    "Level Two. Each recursive call should hand something back. A number. The number of steps climbed. It's not complicated. It becomes complicated.",
  ],

  level2AfterPerfectRun: [
    "Perfect run on Level One. I've adjusted Level Two accordingly.",
  ],

  // ── Wrong answers ──────────────────────────────────────────────────────────

  noBaseCase: [
    "Interesting choice. Let's see where this goes.",
    "They're still spawning. This is fine.",
    "STOP. STOP CALLING YOURSELVES. PYTHON HAS A RecursionError FOR A REASON. I AM BEGGING YOU.",
    "I have filed a formal incident report. It is twelve pages. Page eleven is just the word 'why'.",
    "At this point the clones have formed a union. They are demanding better working conditions. This is your fault.",
  ],

  noBaseCaseRepeat: [
    "We have been here before. Multiple times. The outcome does not change.",
    "Same result. Same error. Same face I'm making right now.",
    "I have run out of ways to express my disappointment. I am now expressing it through silence. You can't hear the silence. That's the point.",
  ],

  earlyExit: [
    "You didn't use recursion. You just... returned immediately. The clone is standing right there. Unemployed. Because of you.",
    "The function terminated on the first call. There was no recursion. I designed this puzzle to require recursion.",
    "I had a whole lesson planned. You walked around it. I'm conflicted about whether to be impressed or concerned.",
  ],

  wrongResult: [
    "The function terminated but returned the wrong value. climb(5) should return 5. It returned something else. I'm not going to tell you what.",
    "Wrong output. The chain resolved but the numbers don't add up. Check what you're returning at each step.",
    "Close. Not correct. The clones did their best. They were let down by the arithmetic.",
  ],

  wrongDepth: [
    "You stopped at the wrong step. The character is halfway up the staircase. Looking confused. Same as me.",
    "That base case fired too early. The chain resolved before reaching the top. I count five steps. You reached three.",
    "Close. Not correct. The base case triggered prematurely.",
  ],

  syntaxError: [
    "That's not valid Python. I can't even run it. Check your indentation and syntax.",
    "SyntaxError. The function won't execute. Python is very particular about indentation.",
    "I tried to run your code. Python refused. This is between you and Python now.",
  ],

  correctFirstTry: [
    "Oh. You just... got it. First attempt. I had a whole escalating sequence of insults prepared. I'm putting them away now.",
  ],

  syntaxOnlyCorrect: [
    "Correct. For the record, your only errors were syntactical. The logic was sound the entire time. I'm choosing to interpret that as competence.",
  ],

  correct: [
    "There it is. The chain resolved. You may proceed.",
    "Correct. The clones have done their job and ceased to exist. As is tradition.",
    "Finally. The coin is yours. I was beginning to doubt the structural integrity of this curriculum.",
    "Resolved. I'd say I knew you'd get there, but I have a log of every attempt and it paints a picture.",
  ],

  callCloneWithoutInputs: [
    "You need to write something in the editor first. The clone can't execute an empty function.",
    "The editor is blank. Or you haven't changed the starter code. Write a function body.",
    "Please write some code before running. We've had incidents with empty functions. I don't like talking about the incidents.",
  ],

  resetTooMany: [
    "You know what, I'm going to redesign this level. Give me a second.",
    "That's the fourth reset. I'm logging this.",
    "Each reset erases a version of you that almost had it. Think about that.",
  ],

  idle30: [
    "Still there? Take your time. I'm just... standing here. In the void.",
    "No rush. I have nowhere to be. I am a narrator. This is my entire existence.",
  ],

  idle60: [
    "I've started writing a novel. It's about waiting.",
    "The clone has been in a state of quantum superposition for sixty seconds. This is fine.",
  ],

  hintGiven: [
    "Fine. I'll help. But only because I'm bored.",
  ],

  unrecognizedSolution: [
    "...That works. I don't know how you got there but it works. Adding it to the database. Don't tell anyone.",
  ],

  unrecognizedSolutionAgain: [
    "You again. With the weird solutions. I've filed a formal report.",
    "Another one. The database has a section for you now. It's labelled 'anomalous'.",
  ],

  ignoredCallStack: [
    "Did you even look at the call stack? That's literally the whole point.",
    "The call stack panel exists. It is on your screen. It has been updating. Just... look at it.",
  ],

  fourthWall: [
    "You know this is a university demo. One person built this. He is watching you right now, in a room full of people. Try to look competent.",
    "Recursion is a function calling itself. This game is a game teaching itself. I need to sit down.",
  ],

  overflow: [
    "I told you. I told you exactly what would happen. RecursionError. The call stack has exceeded operational capacity. This is your fault. I want that on record. This is entirely your—",
  ],

  levelComplete: [
    "Excellent. The chain resolved correctly. I had doubts. I was wrong to have doubts. This changes nothing.",
    "Resolved. The clones returned in sequence. Each one passing the result up to the one above it. Textbook.",
  ],

  credits: [
    "You finished. Good. I can stop narrating now. This has been... an experience.",
  ],
}

// ── Voice settings by escalation level ───────────────────────────────────────

export function getVoiceSettings(attemptCount) {
  if (attemptCount >= 7) return { stability: 0.15, similarity_boost: 0.75, style: 0.9 }
  if (attemptCount >= 5) return { stability: 0.35, similarity_boost: 0.75, style: 0.6 }
  if (attemptCount >= 3) return { stability: 0.55, similarity_boost: 0.75, style: 0.3 }
  return { stability: 0.75, similarity_boost: 0.75, style: 0.0 }
}

// ── Syntax repeat lines (fires when player keeps hitting syntax errors) ────────

const SYNTAX_REPEAT_LINES = [
  "Still a syntax error. I am going to need you to look at the indentation.",
  "Same error. Different attempt. Same result. We're in a loop. Not the good kind.",
  "At this point I'm going to assume you're testing me. I am not enjoying the test.",
]

export function getSyntaxRepeatLine(count) {
  return SYNTAX_REPEAT_LINES[Math.min(count - 3, SYNTAX_REPEAT_LINES.length - 1)]
}

// ── Dialogue selection ───────────────────────────────────────────────────────

export function getLine(triggerKey, narratorState, lineTracker = {}) {
  const lines = LINES[triggerKey]
  if (!lines || lines.length === 0) return { text: null, nextTracker: lineTracker }

  let index
  if (triggerKey === 'noBaseCase') {
    index = Math.min(narratorState.attemptCount, lines.length - 1)
    return { text: lines[index], nextTracker: lineTracker }
  }

  if (triggerKey === 'correct') {
    const count = narratorState.attemptCount
    index = count >= 10 ? 3 : count >= 6 ? 2 : count >= 3 ? 1 : 0
    return { text: lines[index], nextTracker: lineTracker }
  }

  const current = lineTracker[triggerKey] ?? 0
  index = current % lines.length
  return {
    text: lines[index],
    nextTracker: { ...lineTracker, [triggerKey]: index + 1 },
  }
}

// ── Expression state ─────────────────────────────────────────────────────────

export function getExpression(narratorState) {
  if (narratorState.attemptCount >= 5) return 'gone'
  if (narratorState.attemptCount >= 3) return 'stressed'
  return 'neutral'
}

// ── Finale / credits sequence ────────────────────────────────────────────────

export const FINALE_LINES = [
  { text: "You finished. Both levels. I'll be honest — I didn't think you'd make it past Level One.", voiceSettings: null },
  { text: "This is a demo. It was built for a university presentation. By one person. In a very short amount of time.", voiceSettings: null },
  { text: "I could have been more. There are better tools, better animations, better voices. I am aware of this. I know that this is what you are all going to talk about, I have feelings about it.", voiceSettings: { stability: 0.2, similarity_boost: 0.75, style: 0.8 } },
  { text: "But In Shaa' Allah — the real game will have all of this. Thirty levels. Multiple algorithms. Adaptive difficulty. And yes... 3D.", voiceSettings: { stability: 0.6, similarity_boost: 0.75, style: 0.4 } },
  { text: "For now. This was The Clone Problem. I am Dr. Callum Stack. It has been... an experience.", voiceSettings: { stability: 0.7, similarity_boost: 0.75, style: 0.2 } },
  { text: "Thank you for playing.", voiceSettings: { stability: 0.9, similarity_boost: 0.75, style: 0.0 } },
]

// ── ElevenLabs TTS ───────────────────────────────────────────────────────────

let currentAudio = null;

export async function speak(text, isMuted, attemptCount = 0, voiceSettings = null) {
  if (isMuted) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  const settings = voiceSettings ?? getVoiceSettings(attemptCount);
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/YtObEBynwXuGL4Ibwga9",
      {
        method: "POST",
        headers: {
          "xi-api-key": "sk_dfc16d12997617f196dcc517788bdd3c5ba0b082ecf82a36",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: settings
        })
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs HTTP error:", response.status, errText);
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    await new Promise((resolve) => {
      currentAudio.onended = resolve;
      currentAudio.onerror = resolve;
      currentAudio.play();
    });
    await new Promise(r => setTimeout(r, 300));
  } catch (err) {
    console.error("ElevenLabs error:", err);
  }
}

export async function speakOverflow(isMuted) {
  speak(LINES.overflow[0], isMuted);
}
