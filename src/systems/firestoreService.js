import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebaseConfig.js'

function normalizeBestTime(val) {
  if (val == null) return null
  if (typeof val === 'object') return val.time ?? null
  return val
}

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

export async function saveUserProfile(uid, name, email, progress = [], checkpoints = {}) {
  await setDoc(doc(db, 'users', uid), { name, email, progress, checkpoints }, { merge: true })
}

export async function saveProgress(uid, completedLevels) {
  await setDoc(doc(db, 'users', uid), { progress: completedLevels }, { merge: true })
}

export async function saveCheckpoint(uid, levelIdx, phase) {
  await setDoc(
    doc(db, 'users', uid),
    { checkpoints: { [String(levelIdx)]: phase } },
    { merge: true }
  )
}

export async function getBestTime(uid, levelId) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return normalizeBestTime(data.bestTimes?.[String(levelId)] ?? null)
}

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
