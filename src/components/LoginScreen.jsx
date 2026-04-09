import { useState, useEffect } from 'react'
import styles from './LoginScreen.module.css'

export default function LoginScreen({ onLogin, onSignUp, onGuest }) {
  const [visible,  setVisible]  = useState(false)
  const [tab,      setTab]      = useState('login')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  function switchTab(t) {
    setTab(t)
    setError('')
  }

  function handleLogin(e) {
    e.preventDefault()
    const saved = localStorage.getItem('cp192_user')
    if (!saved) {
      setError('No account found. Please sign up first.')
      return
    }
    onLogin(email)
  }

  function handleSignUp(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields.')
      return
    }
    onSignUp(name.trim(), email.trim())
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
              />
              <label className={styles.label}>PASSWORD</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.submitBtn} type="submit">LOG IN</button>
              <button className={styles.forgotLink} type="button">Forgot password?</button>
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
              />
              <label className={styles.label}>EMAIL</label>
              <input
                className={styles.input}
                type="email"
                placeholder="recruit@facility.gov"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <label className={styles.label}>PASSWORD</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.submitBtn} type="submit">CREATE ACCOUNT</button>
            </form>
          )}
        </div>

        <button className={styles.guestBtn} onClick={onGuest}>
          CONTINUE AS GUEST
        </button>

        <div className={styles.footer}>
          UNAUTHORIZED ACCESS WILL BE LOGGED &nbsp;|&nbsp; ALL CLONES SUPERVISED
        </div>
      </div>
    </div>
  )
}
