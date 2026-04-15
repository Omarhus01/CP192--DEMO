import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebaseConfig.js'

export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return { progress: [], checkpoints: {}, bestTimes: {} }
  const data = snap.data()
  return {
    progress:    data.progress    ?? [],
    checkpoints: data.checkpoints ?? {},
    bestTimes:   data.bestTimes   ?? {},
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
  return data.bestTimes?.[String(levelId)] ?? null
}

export async function setBestTime(uid, levelId, timeSeconds) {
  const snap = await getDoc(doc(db, 'users', uid))
  const existing = snap.exists() ? (snap.data().bestTimes ?? {}) : {}
  const previousBest = existing[String(levelId)] ?? null
  const isNewBest = previousBest === null || timeSeconds < previousBest

  if (isNewBest) {
    await setDoc(
      doc(db, 'users', uid),
      { bestTimes: { ...existing, [String(levelId)]: timeSeconds } },
      { merge: true }
    )
  }

  return { isNewBest, previousBest }
}
