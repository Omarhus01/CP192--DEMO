import { useEffect, useState } from 'react'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.label}>INITIALIZING PYTHON RUNTIME{dots}</div>
        <div className={styles.bar}>
          <div className={styles.fill} />
        </div>
        <div className={styles.sub}>Loading Pyodide — this only happens once</div>
      </div>
    </div>
  )
}
