import { useEffect, useState, useCallback } from 'react'
import { dueCards, submitReview } from '../api/review.js'
import styles from './Review.module.css'

const RATINGS = [
  { key: 'AGAIN', label: 'Again', hint: '忘记 (1)', shortcut: '1' },
  { key: 'HARD', label: 'Hard', hint: '困难 (2)', shortcut: '2' },
  { key: 'GOOD', label: 'Good', hint: '记住 (3)', shortcut: '3' },
  { key: 'EASY', label: 'Easy', hint: '简单 (4)', shortcut: '4' },
]

export default function Review() {
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dueCards()
      .then((list) => {
        setQueue(list)
        setIndex(0)
        setShowBack(false)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const current = queue[index]

  const rate = useCallback(
    async (rating) => {
      if (!current) return
      try {
        await submitReview(current.id, rating)
        setShowBack(false)
        setIndex((i) => i + 1)
      } catch (e) {
        alert(e.message)
      }
    },
    [current]
  )

  useEffect(() => {
    const onKey = (e) => {
      if (!current) return
      if (!showBack && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setShowBack(true)
        return
      }
      if (showBack) {
        const r = RATINGS.find((x) => x.shortcut === e.key)
        if (r) {
          e.preventDefault()
          rate(r.key)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, showBack, rate])

  if (loading) return <p className="muted">加载中...</p>
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>

  if (!current) {
    return (
      <div className={styles.done}>
        <h2>🎉 今日已清空</h2>
        <p className="muted">所有到期卡片都复习完了，明天再来吧。</p>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.progress}>
        {index + 1} / {queue.length}
      </div>
      <div className={styles.card}>
        <div className={styles.front}>{current.wordText}</div>

        {!showBack ? (
          <div className={styles.actions}>
            <button className="primary" onClick={() => setShowBack(true)}>
              显示答案 (空格)
            </button>
          </div>
        ) : (
          <>
            <div className={styles.divider} />
            <div className={styles.back}>
              {current.partOfSpeech && (
                <div className={styles.backRow}>
                  <div className={styles.backLabel}>词性</div>
                  <div>{current.partOfSpeech}</div>
                </div>
              )}
              {current.translation && (
                <div className={styles.backRow}>
                  <div className={styles.backLabel}>中文含义</div>
                  <div>{current.translation}</div>
                </div>
              )}
              {current.exampleEn && (
                <div className={styles.backRow}>
                  <div className={styles.backLabel}>英文例句</div>
                  <div>{current.exampleEn}</div>
                </div>
              )}
              {current.exampleCn && (
                <div className={styles.backRow}>
                  <div className={styles.backLabel}>例句翻译</div>
                  <div>{current.exampleCn}</div>
                </div>
              )}
              {current.usageNote && (
                <div className={styles.backRow}>
                  <div className={styles.backLabel}>用法说明</div>
                  <div>{current.usageNote}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showBack && (
        <>
          <div className={styles.ratingRow}>
            {RATINGS.map((r) => (
              <button
                key={r.key}
                className={styles.ratingBtn}
                data-rating={r.key}
                onClick={() => rate(r.key)}
              >
                <span>{r.label}</span>
                <small>{r.hint}</small>
              </button>
            ))}
          </div>
          <div className={styles.hint}>键盘快捷键：1 Again · 2 Hard · 3 Good · 4 Easy</div>
        </>
      )}
    </div>
  )
}
