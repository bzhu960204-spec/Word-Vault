import { useEffect, useState } from 'react'
import { summary, daily } from '../api/stats.js'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [s, setS] = useState(null)
  const [d, setD] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([summary(), daily(30)])
      .then(([sum, dly]) => {
        setS(sum)
        setD(dly)
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>
  if (!s || !d) return <p className="muted">加载中...</p>

  const max = Math.max(1, ...d.points.map((p) => p.count))

  return (
    <div>
      <h1>仪表盘</h1>

      <div className={styles.grid}>
        <Stat label="总单词" value={s.totalWords} />
        <Stat label="总卡片" value={s.totalCards} />
        <Stat label="今日待复习" value={s.dueToday} />
        <Stat label="今日已复习" value={s.reviewedToday} />
        <Stat label="连续天数" value={`${s.streakDays} 天`} />
      </div>

      <div className={styles.chartCard}>
        <h2 style={{ marginBottom: 0 }}>近 30 天复习量</h2>
        <div className={styles.chart}>
          {d.points.map((p) => {
            const h = (p.count / max) * 100
            return (
              <div
                key={p.date}
                className={`${styles.bar} ${p.count === 0 ? styles.zero : ''}`}
                style={{ height: `${Math.max(2, h)}%` }}
                data-count={p.count}
                data-date={p.date}
              />
            )
          })}
        </div>
        <div className={styles.axis}>
          <span>{d.points[0]?.date}</span>
          <span>{d.points[d.points.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  )
}
