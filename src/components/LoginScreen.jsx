import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../systems/firebaseConfig.js'
import { saveUserProfile } from '../systems/firestoreService.js'
import styles from './LoginScreen.module.css'

const ERROR_MAP = {
  'auth/user-not-found':      'No account found with this email.',
  'auth/wrong-password':      'Incorrect password.',
  'auth/invalid-credential':  'Incorrect email or password.',
  'auth/email-already-in-use':'An account with this email already exists.',
  'auth/weak-password':       'Password must be at least 6 characters.',
  'auth/invalid-email':       'Please enter a valid email address.',
  'auth/too-many-requests':   'Too many attempts. Please try again later.',
}

function friendlyError(code) {
  return ERROR_MAP[code] ?? 'Something went wrong. Please try again.'
}

export default function LoginScreen({ onLogin, onSignUp, onGuest }) {
  const [visible,      setVisible]      = useState(false)
  const [tab,          setTab]          = useState('login')
  const [name,         setName]         = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [resetSent,    setResetSent]    = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  function switchTab(t) {
    setTab(t)
    setError('')
    setResetSent(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      onLogin(cred.user)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await saveUserProfile(cred.user.uid, name.trim(), email, [], {})
      onSignUp(cred.user, name.trim(), email, null)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) { setError('Enter your email above first.'); return }
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(true)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.screen} ${visible ? styles.visible : ''}`}>
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      <div className={styles.content}>
        <div className={styles.classification}>FACILITY ID: CP-192 // RECRUIT AUTHENTICATION</div>

        <h1 className={styles.title}>
          PERSONNEL<br />
          <span className={styles.accent}>ACCESS</span>
        </h1>

        <div className={styles.card}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchTab('login')}
            >LOG IN</button>
            <button
              className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
              onClick={() => switchTab('signup')}
            >SIGN UP</button>
          </div>

          {tab === 'login' && (
            <form className={styles.form} onSubmit={handleLogin}>
              <label className={styles.label}>EMAIL</label>
              <input
                className={styles.input}
                type="email"
                placeholder="recruit@facility.gov"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label className={styles.label}>PASSWORD</label>
              <div className={styles.passwordRow}>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                >{showPassword ? '🙈' : '👁'}</button>
              </div>
              {resetSent && <div className={styles.success}>Reset email sent. Check your inbox.</div>}
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'LOGGING IN…' : 'LOG IN'}
              </button>
              <button
                className={styles.forgotLink}
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
              >Forgot password?</button>
            </form>
          )}

          {tab === 'signup' && (
            <form className={styles.form} onSubmit={handleSignUp}>
              <label className={styles.label}>NAME</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <label className={styles.label}>EMAIL</label>
              <input
                className={styles.input}
                type="email"
                placeholder="recruit@facility.gov"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label className={styles.label}>PASSWORD</label>
              <div className={styles.passwordRow}>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                >{showPassword ? '🙈' : '👁'}</button>
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'CREATING…' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}
        </div>

        <button className={styles.guestBtn} onClick={onGuest} disabled={loading}>
          CONTINUE AS GUEST
        </button>

        <div className={styles.footer}>
          UNAUTHORIZED ACCESS WILL BE LOGGED &nbsp;|&nbsp; ALL CLONES SUPERVISED
        </div>
      </div>
    </div>
  )
}
