import { useEffect, useState, useCallback } from 'react'
import { practiceCards, submitReview } from '../api/review.js'
import { listTags } from '../api/words.js'
import styles from './Review.module.css'

const RATINGS = [
  { key: 'AGAIN', label: 'Again', hint: '忘记 (1)', shortcut: '1' },
  { key: 'HARD', label: 'Hard', hint: '困难 (2)', shortcut: '2' },
  { key: 'GOOD', label: 'Good', hint: '记住 (3)', shortcut: '3' },
  { key: 'EASY', label: 'Easy', hint: '简单 (4)', shortcut: '4' },
]

export default function Practice() {
  const [tags, setTags] = useState([])
  const [config, setConfig] = useState({ tag: '', limit: 20 })
  const [queue, setQueue] = useState(null) // null = not started
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    listTags().then(setTags).catch(() => {})
  }, [])

  const startSession = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (config.tag) params.tag = config.tag
      if (config.limit) params.limit = config.limit
      const cards = await practiceCards(params)
      if (cards.length === 0) {
        setError('没有可练习的卡片，请先在单词库中为单词生成卡片。')
        setQueue(null)
      } else {
        setQueue(cards)
        setIndex(0)
        setShowBack(false)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const current = queue ? queue[index] : null

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
    if (!queue) return
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
  }, [current, showBack, rate, queue])

  // Not started yet - show config
  if (queue === null) {
    return (
      <div className={styles.wrap}>
        <h1 style={{ textAlign: 'center' }}>自由练习</h1>
        <div className={styles.card} style={{ padding: '32px' }}>
          <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>
                标签筛选（可选）
              </label>
              <select
                value={config.tag}
                onChange={(e) => setConfig((c) => ({ ...c, tag: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="">全部卡片</option>
                {tags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>
                练习数量
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={config.limit}
                onChange={(e) => setConfig((c) => ({ ...c, limit: Number(e.target.value) || 20 }))}
                style={{ width: '100%' }}
              />
            </div>
            {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}
            <button
              className="primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={startSession}
              disabled={loading}
            >
              {loading ? '加载中...' : '开始练习'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Session complete
  if (!current) {
    return (
      <div className={styles.done}>
        <h2>🎉 练习完成</h2>
        <p className="muted">本轮 {queue.length} 张卡片已全部练习完毕。</p>
        <button className="primary" onClick={() => setQueue(null)} style={{ marginTop: 16 }}>
          再来一轮
        </button>
      </div>
    )
  }

  // Active session
  return (
    <div className={styles.wrap}>
      <div className={styles.progress}>
        {index + 1} / {queue.length}
        <button
          onClick={() => setQueue(null)}
          style={{ marginLeft: 12, fontSize: 12, padding: '2px 8px' }}
        >
          结束练习
        </button>
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
