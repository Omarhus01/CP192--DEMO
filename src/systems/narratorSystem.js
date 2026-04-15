// ═══════════════════════════════════════════════════════════════════════════
//  narratorSystem.js  —  ALL NARRATOR DIALOGUE LIVES HERE
//
//  Edit lines freely. Do not rename trigger keys — game logic uses them.
//  To add lines: append to any array.
//  Voice: ElevenLabs API (Josh, eleven_turbo_v2_5)
// ═══════════════════════════════════════════════════════════════════════════

export const NARRATOR = {
  name: 'Omarito',
  title: 'Head of Theoretical Clone Operations',
}

// ── All dialogue, organised by trigger key ──────────────────────────────────
export const LINES = {

  quizYes: [
    "Good. Then we can skip the part where I explain what a variable is. I was not prepared for that today.",
  ],

  quizNo1: [
    "Then what are you doing here. This is not the place for you. The door is behind you. It opens outward.",
  ],

  quizNo2: [
    "...Fine. We proceed. Don't take that as encouragement.",
  ],

  conceptStep1: [
    "Here is the problem. It is too large to solve directly. So don't.",
  ],

  conceptStep2: [
    "Solve a slightly smaller version of it instead. Then a slightly smaller version of that.",
  ],

  conceptStep3: [
    "Keep going until the problem is so small the answer is obvious. That stopping point — that's the base case. It is the most important line you will write today.",
  ],

  conceptStep4: [
    "Now the answers travel back. Each step receives what the step below it found, adds its piece, and passes it up. By the time it reaches you, the full answer is there.",
  ],

  conceptStep5: [
    "This is what that looks like in Python. Read it slowly.",
  ],

  conceptStep6: [
    "That's recursion. Base case, recursive call, return chain. You're going to use all three in approximately two minutes.",
  ],

  intro: [
    "Welcome. I am Dr. Omarito. This is a standard orientation exercise. Nothing unusual is happening.",
    "You will be asked to write one simple function. It will either work or it will not. I have documentation for both outcomes.",
  ],

  level1Intro: [
    "The elevator is broken. Five floors. Your function handles one floor and hands the rest to a clone. Write the base case — when do you stop — and the recursive call — what do you pass down.",
    "climb(5) calls climb(4), which calls climb(3), which calls climb(2), which calls climb(1). Then they all return. Watch the call stack. That panel on the right is not decoration.",
  ],

  level2Intro: [
    "Five coins. Your function picks one up, then asks a clone to count the rest. Then it returns 1 plus whatever the clone returned. The return value is the point. It is the entire point.",
    "count(5) calls count(4), all the way down to count(0). That's your base case. Then the answers travel back up, each one adding 1. By the time it reaches count(5), the answer is 5. That is how this works.",
  ],

  level2AfterPerfectRun: [
    "You solved Level One on the first attempt. I've adjusted Level Two to be slightly less forgiving. You're welcome.",
  ],

  level3Intro: [
    "Level Three. Fibonacci. Your function will call itself twice per invocation. Watch the call stack carefully — it does not build a line. It builds a tree.",
    "fib(5). The answer is 5. The number of function calls required to get there is fifteen. I will give you a moment to consider what that means before you proceed.",
  ],

  // ── Wrong answers ──────────────────────────────────────────────────────────

  noBaseCase: [
    "Interesting approach. Running it now.",
    "They're still spawning. I'd like to note that I predicted this.",
    "You need a base case. A stopping condition. One line. That is all I am asking for. One line that says: when this is true, stop. I am begging you to write that line.",
    "I have filed an incident report. It is eight pages. The last page is just a photograph of this moment.",
    "The clones have exceeded operational capacity. They have started filing their own incident reports. About you. I am now CC'd on all of them.",
  ],

  baseCaseHit: [
    "There. That's the base case. It stops here — and now everything unwinds.",
    "Base case reached. The deepest clone finally has an answer. Watch what happens next.",
    "That's as far down as it goes. Now every clone that was waiting gets to return. This is the part I find satisfying.",
    "The chain stops. Now it reverses. Pay attention — this is the whole point of the exercise.",
  ],

  noBaseCaseRepeat: [
    "We have done this. Multiple times. The outcome has not changed and will not change.",
    "You are aware of what a base case is. I explained it. You nodded. And yet.",
    "I have nothing left to say about this. I am going to stand here quietly while you figure it out.",
  ],

  earlyExit: [
    "You returned on the first call. The clone is right there. It has a job. You gave it nothing to do. That is not recursion, that is an early return with extra steps.",
    "There was no recursive call. climb(5) ran once and stopped. I built this puzzle specifically to require recursion. I would like you to use it.",
    "I had a progression prepared. You skipped it. I'm going to need a moment.",
  ],

  level3EarlyExit: [
    "You returned immediately. fib(5) ran once, looked at n, and stopped. The tree that should have fifteen branches has one node. That node is wrong. I'd like you to reconsider your life choices and also your base case.",
    "There was no branching. There was barely a function call. fib(5) is supposed to call fib(4) and fib(3). It did not call either. I'm curious what you thought would happen.",
    "The tree has one node. It is yours. It is wrong. Recursion requires recursive calls — specifically fib(n-1) and fib(n-2). Neither appear. I've looked.",
  ],

  wrongResult: [
    "The function ran. The chain resolved. The answer is wrong. count(5) should return 5. Check what you're returning at each step — something in the arithmetic isn't adding up.",
    "The recursion worked. The return chain ran. The number at the top is incorrect. Your base case or your return value is off. One of those two things.",
    "Close. The structure is right. The numbers are wrong. Every clone did its job and the answer is still wrong, which means the job you gave them was wrong.",
  ],

  level3WrongResult: [
    "The tree resolved. Every branch calculated. Every clone returned. The root says the wrong number. fib(5) is 5. Yours is not 5. I'm going to let you sit with that.",
    "Fifteen function calls. All fifteen returned. The number at the top is still wrong. Check what fib(0) and fib(1) actually return — your base case is lying to you.",
    "The structure is correct. The arithmetic is not. Either your base case returns the wrong value, or your recursive case adds the wrong things. One of those two. This is my gift to you.",
  ],

  wrongDepth: [
    "Your base case fired too early. I count five coins. You stopped before the stack was empty. The base case should trigger at zero — not before.",
    "The chain resolved, but the base case triggered before all coins were counted. Check your condition. It should be true only when there is truly nothing left.",
    "You stopped at the wrong coin. The condition you wrote becomes true too soon. It should only be true when there is nothing left to count.",
  ],

  syntaxError: [
    "That's not valid Python. The function won't execute. Check your indentation — Python is extremely particular about this and will not negotiate.",
    "SyntaxError. This is a formatting issue, not a logic issue. Your indentation is off, or you're missing a colon, or both.",
    "Python has refused to run this. That relationship is now between you and Python. I'll be here when you've resolved it.",
  ],

  correctFirstTry: [
    "Oh. You just... did it. First attempt. I had four escalating responses prepared. I'm putting them away. I want you to know they were very good.",
  ],

  syntaxOnlyCorrect: [
    "Correct. Your logic was right from the beginning. Every error you made was a formatting error. The recursion itself was never wrong. I'm choosing to find that impressive.",
  ],

  correct: [
    "There it is. The chain resolved. You may proceed.",
    "Correct. The clones returned in sequence. I want you to notice how that felt — that's the return chain working.",
    "Finally. The answer is right. I maintained composure throughout. Mostly.",
    "It resolved. I have a log of every attempt. It exists. I'm not going to show it to you.",
  ],

  callCloneWithoutInputs: [
    "You need to write a function body first. The clone cannot execute nothing.",
    "The editor hasn't been changed. Write something before calling the clone — a base case, a return statement, anything.",
    "There is no code. I cannot run nothing. This is the one request I have and it is a small one.",
  ],

  resetTooMany: [
    "That's the third reset. I'm giving you a moment. Take it.",
    "Four resets. I've started a separate document for this level. It's just timestamps.",
    "Every version of you that reset was slightly closer to having it. Think about that before you reset again.",
  ],

  newBestTime: [
    "New record. Don't let it go to your head.",
    "Faster. I'm almost impressed. Almost.",
    "Personal best. I've updated my expectations. Slightly upward.",
    "That's a new best. I had a time logged. You beat it. I have feelings about this.",
  ],

  missedBestTime: [
    "Still {diff} seconds off your best. The gap is noted.",
    "Slower than last time. Interesting strategic choice.",
    "Your best was {best}. This was {current}. The math is not in your favor.",
  ],

  resetWarning: [
    "Resetting. Bold move.",
    "Again. The clock remembers, even if you'd prefer it didn't.",
    "Last one. The reset button is now decorative.",
  ],

  resetCheater: [
    "Interesting. The official time is {timerA}. The actual time is {timerB}. I've logged both.",
    "You reset {n} times. The clock kept running. It always keeps running.",
  ],

  idle30: [
    "Still there? Take your time. I'm not going anywhere. This is my entire professional existence.",
    "No pressure. I've been standing here long enough to reconsider several life decisions.",
  ],

  idle60: [
    "Sixty seconds. I've started drafting a paper. It's about waiting. The peer review is going to take forever.",
    "The clone is in a state of suspended uncertainty. So am I, if I'm honest.",
  ],

  hintGiven: [
    "Fine. I'll walk you through it. Pay attention because I am not doing this twice.",
  ],

  unrecognizedSolution: [
    "...That works. I don't know how you got there, but the chain resolved correctly. I'm adding it to the database. Don't explain it to me.",
  ],

  unrecognizedSolutionAgain: [
    "You again. With the unconventional approaches. I've started a separate file.",
    "Another one. The database has a section for you now. It has a header. The header says 'anomalous'. It has its own color.",
  ],

  ignoredCallStack: [
    "You didn't look at the call stack. That panel was updating in real time. The entire point of this exercise was visible there.",
    "The call stack panel exists. It has been updating every time you run. It is showing you exactly what recursion looks like in motion. I am asking you to look at it.",
  ],

  fourthWall: [
    "This is a university demo. One person built it. He is in this room right now, watching you use it, which means you are effectively being evaluated twice.",
    "Recursion is a function calling itself. This game teaches recursion using itself. I've been thinking about this for three days and I need you to appreciate it.",
  ],

  overflow: [
    "I told you. I told you exactly what would happen. There is no base case. There is no stopping condition. The call stack has exceeded its limit. This is a RecursionError. This is your RecursionError. I want that acknowledged.",
  ],

  levelComplete: [
    "The chain resolved. Every clone returned in sequence. That is exactly how it's supposed to work. I had doubts. I'm not proud of that.",
    "Resolved. Each clone passed its result up to the one above it, all the way to the top. Textbook recursion. You can proceed.",
  ],

  lockedLevel: [
    "You don't have clearance for that module. Complete the ones before it. In order. That is how sequences work.",
    "Locked. The lock is intentional. I would appreciate it if you stopped clicking it.",
    "That module isn't available yet. I know you can see it. That doesn't mean you can access it.",
    "You haven't finished what's in front of you. The rest will wait. It has no choice.",
    "I designed this lock specifically so that people like you would encounter it. You're welcome.",
  ],

  loginScreen: [
    "Ah, a new recruit. Or are you returning? Either way... we've been expecting you.",
  ],

  dashboardScreen: [
    "Your progress is... noted. Proceed when ready.",
  ],

  credits: [
    "You finished. I can stop narrating now. That sentence felt better than I expected.",
  ],
}

// ── Voice settings by escalation level ───────────────────────────────────────

export function getVoiceSettings(attemptCount) {
  if (attemptCount >= 7) return { stability: 0.1,  similarity_boost: 0.9,  style: 0.95 }
  if (attemptCount >= 5) return { stability: 0.3,  similarity_boost: 0.85, style: 0.65 }
  if (attemptCount >= 3) return { stability: 0.55, similarity_boost: 0.8,  style: 0.35 }
  return                        { stability: 0.75, similarity_boost: 0.75, style: 0.0  }
}

// ── Syntax repeat lines (fires when player keeps hitting syntax errors) ────────

const SYNTAX_REPEAT_LINES = [
  "Still a syntax error. The indentation. Please look at the indentation.",
  "The same error. Different attempt. I want you to know I'm rooting for you. I am also logging this.",
  "We are going to be here until the indentation is correct. I've made my peace with that. Have you?",
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
  { text: "You finished. Both levels. I'll be honest — I didn't expect that when we started.", voiceSettings: { stability: 0.7,  similarity_boost: 0.75, style: 0.15 } },
  { text: "This is a demo. One person built it, in a short amount of time, for a university presentation. That person is in this room.", voiceSettings: { stability: 0.7,  similarity_boost: 0.75, style: 0.15 } },
  { text: "It could have been more. Better animations, better audio, more levels, a proper UI. I know. I've been aware of this the entire time. I have feelings about it that I've been managing professionally.", voiceSettings: { stability: 0.2,  similarity_boost: 0.85, style: 0.85 } },
  { text: "But In Shaa' Allah — the full version will have all of it. Thirty levels. Multiple algorithms. Adaptive difficulty. And yes... 3D.", voiceSettings: { stability: 0.65, similarity_boost: 0.8,  style: 0.4  } },
  { text: "For now. This was The Clone Problem. I am Dr. Omarito. It has been... an experience.", voiceSettings: { stability: 0.85, similarity_boost: 0.75, style: 0.05 } },
  { text: "Thank you for playing.", voiceSettings: { stability: 0.85, similarity_boost: 0.75, style: 0.05 } },
]

// ── ElevenLabs TTS ───────────────────────────────────────────────────────────

let currentAudio = null;

export function stopAudio() {
  if (currentAudio) {
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

export async function speak(text, isMuted, attemptCount = 0, emotionOverride = null) {
  console.log('[speak] called:', {
    text:            text?.slice(0, 60),
    isMuted,
    hasCurrentAudio: !!currentAudio,
    audioEnded:      currentAudio?.ended ?? 'n/a',
  });

  if (isMuted) { console.log('[speak] bailed: isMuted=true'); return; }

  // Cancel any currently-playing audio
  if (currentAudio) {
    currentAudio.onended = null;   // detach handlers before cancelling
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }

  const settings = emotionOverride ?? getVoiceSettings(attemptCount);
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/OtGahjKmUaUO2G6wqCm9",
      {
        method: "POST",
        headers: {
          "xi-api-key": "sk_1b7c6b35a37f26ce7dd11cca4648455a4d61a4dd18070f7a",
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
      console.error('[speak] ElevenLabs HTTP error:', response.status, errText);
      return;
    }
    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);

    // Check if a newer speak() cancelled us while we were fetching
    if (currentAudio !== null) {
      console.log('[speak] preempted by newer call while fetching — discarding');
      URL.revokeObjectURL(url);
      return;
    }

    currentAudio = new Audio(url);
    console.log('[speak] playing audio for:', text?.slice(0, 40));

    await new Promise((resolve) => {
      const audio = currentAudio; // capture ref — may be nulled by a concurrent speak()
      audio.onended = () => {
        console.log('[speak] audio ended naturally:', text?.slice(0, 40));
        if (currentAudio === audio) currentAudio = null;  // clear only if still ours
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = (e) => {
        console.warn('[speak] audio error event:', e?.message ?? e, 'text:', text?.slice(0, 40));
        if (currentAudio === audio) currentAudio = null;
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.play().catch((e) => {
        console.warn('[speak] play() rejected:', e?.message ?? e, 'text:', text?.slice(0, 40));
        if (currentAudio === audio) currentAudio = null;
        URL.revokeObjectURL(url);
        resolve();
      });
    });

    await new Promise(r => setTimeout(r, 300));
  } catch (err) {
    console.error('[speak] caught exception:', err);
  }
}

export async function speakOverflow(isMuted, attemptCount = 0) {
  const index = Math.min(Math.max(attemptCount - 1, 0), LINES.noBaseCase.length - 1)
  await speak(LINES.noBaseCase[index], isMuted, attemptCount, { stability: 0.1, similarity_boost: 0.9, style: 0.95 })
}
