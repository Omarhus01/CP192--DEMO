// ═══════════════════════════════════════════════════════════════════════════
//  firestoreService.js
//
//  All Firestore read/write operations for the game.
//  User document schema: { name, email, progress: number[], checkpoints: {}, bestTimes: {} }
//  bestTimes values: { time: number, setAt: number } — older records may be plain numbers.
// ═══════════════════════════════════════════════════════════════════════════

import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebaseConfig.js'

/**
 * Normalises a bestTimes entry to a plain number of seconds.
 * Handles both legacy plain-number records and the current { time, setAt } format.
 * @param {number|{time:number,setAt:number}|null} val
 * @returns {number|null}
 */
function normalizeBestTime(val) {
  if (val == null) return null
  if (typeof val === 'object') return val.time ?? null
  return val
}

/**
 * Loads a user's full game data from Firestore.
 * Normalises all bestTimes entries on the way out.
 * @param {string} uid
 * @returns {Promise<{ progress: number[], checkpoints: object, bestTimes: object }>}
 */
export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return { progress: [], checkpoints: {}, bestTimes: {} }
  const data = snap.data()
  const rawBestTimes = data.bestTimes ?? {}
  const bestTimes = {}
  for (const [k, v] of Object.entries(rawBestTimes)) {
    const n = normalizeBestTime(v)
    if (n !== null) bestTimes[k] = n
  }
  return {
    progress:    data.progress    ?? [],
    checkpoints: data.checkpoints ?? {},
    bestTimes,
  }
}

/**
 * Creates or updates the user document with profile fields.
 * @param {string} uid
 * @param {string} name
 * @param {string} email
 * @param {number[]} [progress=[]]
 * @param {object}  [checkpoints={}]
 */
export async function saveUserProfile(uid, name, email, progress = [], checkpoints = {}) {
  await setDoc(doc(db, 'users', uid), { name, email, progress, checkpoints }, { merge: true })
}

/**
 * Persists the player's completed-level index array.
 * @param {string}   uid
 * @param {number[]} completedLevels
 */
export async function saveProgress(uid, completedLevels) {
  await setDoc(doc(db, 'users', uid), { progress: completedLevels }, { merge: true })
}

/**
 * Saves which phase the player reached on a given level (guided / scaffold / free).
 * @param {string} uid
 * @param {number} levelIdx — 0-based level index
 * @param {'guided'|'scaffold'|'free'} phase
 */
export async function saveCheckpoint(uid, levelIdx, phase) {
  await setDoc(
    doc(db, 'users', uid),
    { checkpoints: { [String(levelIdx)]: phase } },
    { merge: true }
  )
}

/**
 * Reads the player's best time for a level. Returns null if none recorded.
 * @param {string} uid
 * @param {number} levelId — 1-based level id
 * @returns {Promise<number|null>}
 */
export async function getBestTime(uid, levelId) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return normalizeBestTime(data.bestTimes?.[String(levelId)] ?? null)
}

/**
 * Conditionally updates the player's best time for a level.
 * Only writes if timeSeconds is strictly better than the current record.
 * Stores { time, setAt } so the leaderboard can show the date.
 * @param {string} uid
 * @param {number} levelId — 1-based level id
 * @param {number} timeSeconds
 * @returns {Promise<{ isNewBest: boolean, previousBest: number|null }>}
 */
export async function setBestTime(uid, levelId, timeSeconds) {
  const snap = await getDoc(doc(db, 'users', uid))
  const existing    = snap.exists() ? (snap.data().bestTimes ?? {}) : {}
  const previousBest = normalizeBestTime(existing[String(levelId)] ?? null)
  const isNewBest    = previousBest === null || timeSeconds < previousBest

  if (isNewBest) {
    await setDoc(
      doc(db, 'users', uid),
      { bestTimes: { ...existing, [String(levelId)]: { time: timeSeconds, setAt: Date.now() } } },
      { merge: true }
    )
  }

  return { isNewBest, previousBest }
}

/**
 * Fetches all users and returns sorted leaderboard entries for a given level.
 * Handles both legacy (plain number) and current ({ time, setAt }) bestTimes formats.
 * @param {number} levelId — 1-based level id
 * @returns {Promise<Array<{ uid: string, name: string, time: number, setAt: number|null }>>}
 */
export async function getLeaderboard(levelId) {
  const snap    = await getDocs(collection(db, 'users'))
  const results = []
  snap.forEach(d => {
    const data = d.data()
    const raw  = data.bestTimes?.[String(levelId)]
    if (raw == null) return
    const time  = typeof raw === 'object' ? raw.time  : raw
    const setAt = typeof raw === 'object' ? raw.setAt : null
    if (time == null) return
    results.push({ uid: d.id, name: data.name ?? 'Guest', time, setAt })
  })
  results.sort((a, b) => a.time - b.time)
  return results
}
