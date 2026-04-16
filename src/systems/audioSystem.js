// ═══════════════════════════════════════════════════════════════════════════
//  audioSystem.js
//  Simple HTML Audio for background music + Web Audio API for SFX.
//
//  Music API:
//    initMusic()              — call once on first user interaction
//    playTrack(key)           — 'title' | 'level' | 'levelComplete' | 'overflow'
//    setMuted(bool)           — mute/unmute all music
//
//  SFX API:
//    playSpawnSound(muted)
//    playSuccessSound(muted)
//    playOverflowSound(muted)
//    playNarratorClick(muted)
// ═══════════════════════════════════════════════════════════════════════════

// ── Track config ──────────────────────────────────────────────────────────────

const TRACKS = {
  title:         { src: '/sounds/Clouds (Pause Menu).mp3',  loop: true,  volume: 0.15 },
  level:         { src: '/sounds/Darklight Escape.mp3',     loop: true,  volume: 0.15 },
  levelComplete: { src: '/sounds/Indefinity.mp3',           loop: false, volume: 0.3  },
  overflow:      { src: '/sounds/Alarming.mp3',             loop: false, volume: 0.4  },
  credits:       { src: '/sounds/Indefinity.mp3',           loop: true,  volume: 0.18 },
}

// ── Music state ───────────────────────────────────────────────────────────────

let musicEl       = null   // single persistent HTMLAudioElement
let currentKey    = null
let isMutedGlobal = false
let audioReady    = false
let pendingKey    = null

// ── Public music API ──────────────────────────────────────────────────────────

export function initMusic() {
  if (audioReady) return
  audioReady = true

  // Create the single music element
  musicEl = new Audio()

  // Init Web Audio API for SFX
  ctx = new (window.AudioContext || window.webkitAudioContext)()

  // Play any track queued before the user interacted
  if (pendingKey) {
    const k = pendingKey
    pendingKey = null
    _startTrack(k)
  }
}

export function playTrack(key) {
  if (key === currentKey) return   // already playing this track
  if (!audioReady) {
    pendingKey = key               // queue it — play on initMusic()
    return
  }
  _startTrack(key)
}

export function setMuted(muted) {
  isMutedGlobal = muted
  if (!musicEl) return
  const cfg = TRACKS[currentKey]
  musicEl.volume = muted ? 0 : (cfg?.volume ?? 0.15)
}

export function fadeInTrack(key) {
  if (!audioReady) { pendingKey = key; return }
  const cfg = TRACKS[key]
  if (!cfg || !musicEl) return
  if (currentKey === key) return
  currentKey          = key
  musicEl.src         = cfg.src
  musicEl.loop        = cfg.loop
  musicEl.volume      = 0
  musicEl.currentTime = 0
  musicEl.play().catch(() => {})
  const target = isMutedGlobal ? 0 : cfg.volume
  const steps  = 40
  let   step   = 0
  const id = setInterval(() => {
    step++
    if (!musicEl || step >= steps) { if (musicEl) musicEl.volume = target; clearInterval(id); return }
    musicEl.volume = Math.min((step / steps) * target, target)
  }, 100)
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _startTrack(key) {
  const cfg = TRACKS[key]
  if (!cfg || !musicEl) return

  currentKey         = key
  musicEl.src        = cfg.src
  musicEl.loop       = cfg.loop
  musicEl.volume     = isMutedGlobal ? 0 : cfg.volume
  musicEl.currentTime = 0
  musicEl.play().catch(() => {})
}

// ── Web Audio context (SFX only) ──────────────────────────────────────────────

let ctx = null

function ensureCtx() {
  if (!ctx) return false
  if (ctx.state === 'suspended') ctx.resume()
  return true
}

function sfxGain(volume) {
  const g = ctx.createGain()
  g.gain.value = volume
  g.connect(ctx.destination)
  return g
}

// ── Sound effects ─────────────────────────────────────────────────────────────

/** Short glitchy descending tone — clone spawns */
export function playSpawnSound(isMuted) {
  if (isMuted || !ensureCtx()) return
  const now  = ctx.currentTime
  const osc  = ctx.createOscillator()
  const gain = sfxGain(0)

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(900, now)
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.14)

  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

  osc.connect(gain)
  osc.start(now); osc.stop(now + 0.16)
}

/** Clean ascending chime — correct solution */
export function playSuccessSound(isMuted) {
  if (isMuted || !ensureCtx()) return
  const now   = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5]   // C5 E5 G5 C6

  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator()
    const gain = sfxGain(0)
    const t    = now + i * 0.13

    osc.type = 'sine'; osc.frequency.value = freq
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)

    osc.connect(gain)
    osc.start(t); osc.stop(t + 0.6)
  })
}

/** Loud dissonant burst — stack overflow */
export function playOverflowSound(isMuted) {
  if (isMuted || !ensureCtx()) return
  const now = ctx.currentTime

  ;[55, 58.27, 73.42, 92.5, 116.54].forEach(freq => {
    const osc  = ctx.createOscillator()
    const gain = sfxGain(0)

    osc.type = 'sawtooth'; osc.frequency.value = freq
    gain.gain.setValueAtTime(0.32, now)
    gain.gain.setValueAtTime(0.32, now + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4)

    osc.connect(gain)
    osc.start(now); osc.stop(now + 1.5)
  })
}

/** Short descending dissonant buzz — wrong answer */
export function playWrongSound(isMuted) {
  if (isMuted || !ensureCtx()) return
  const now = ctx.currentTime
  ;[300, 318].forEach(freq => {
    const osc  = ctx.createOscillator()
    const gain = sfxGain(0)
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.linearRampToValueAtTime(160, now + 0.2)
    gain.gain.setValueAtTime(0.13, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc.connect(gain)
    osc.start(now); osc.stop(now + 0.27)
  })
}

/** Light ping — base case reached */
export function playBaseCaseSound(isMuted) {
  if (isMuted || !ensureCtx()) return
  const now  = ctx.currentTime
  const osc  = ctx.createOscillator()
  const gain = sfxGain(0)
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.10, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  osc.connect(gain)
  osc.start(now); osc.stop(now + 0.35)
}

/** Two-note ascending chime — new best time */
export function playNewBestSound(isMuted) {
  if (isMuted || !ensureCtx()) return
  const now   = ctx.currentTime
  ;[783.99, 1046.5].forEach((freq, i) => {
    const osc  = ctx.createOscillator()
    const gain = sfxGain(0)
    const t    = now + i * 0.1
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.16, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc.connect(gain)
    osc.start(t); osc.stop(t + 0.45)
  })
}

/** Subtle UI click — narrator begins speaking */
export function playNarratorClick(isMuted) {
  if (isMuted || !ensureCtx()) return
  const now  = ctx.currentTime
  const osc  = ctx.createOscillator()
  const gain = sfxGain(0)

  osc.type = 'square'; osc.frequency.value = 1400
  gain.gain.setValueAtTime(0.06, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)

  osc.connect(gain)
  osc.start(now); osc.stop(now + 0.03)
}
