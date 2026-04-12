import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebaseConfig.js'

export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return { progress: [], checkpoints: {} }
  const data = snap.data()
  return {
    progress:    data.progress    ?? [],
    checkpoints: data.checkpoints ?? {},
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
