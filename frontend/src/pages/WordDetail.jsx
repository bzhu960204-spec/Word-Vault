import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getWord, deleteWord } from '../api/words.js'
import { listCards } from '../api/cards.js'
import styles from './WordDetail.module.css'

export default function WordDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [word, setWord] = useState(null)
  const [cards, setCards] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    getWord(id).then(setWord).catch((e) => setError(e.message))
    listCards({ wordId: id }).then(setCards).catch(() => {})
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const onDelete = async () => {
    if (!confirm('确认删除该单词及其所有卡片？')) return
    await deleteWord(id)
    navigate('/words')
  }

  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>
  if (!word) return <p className="muted">加载中...</p>

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{word.text}</h1>
            <div className={styles.subtitle}>
              {word.partOfSpeech && <span>{word.partOfSpeech} · </span>}
              熟悉度 {word.familiarity}
            </div>
          </div>
          <div className={styles.actions}>
            <Link to={`/words/${id}/edit`}>
              <button>编辑</button>
            </Link>
            <button className="danger" onClick={onDelete}>
              删除
            </button>
          </div>
        </div>

        {word.translation && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>中文含义</div>
            <div>{word.translation}</div>
          </div>
        )}
        {word.exampleEn && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>英文例句</div>
            <div>{word.exampleEn}</div>
          </div>
        )}
        {word.exampleCn && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>例句翻译</div>
            <div>{word.exampleCn}</div>
          </div>
        )}
        {word.usageNote && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>用法说明</div>
            <div>{word.usageNote}</div>
          </div>
        )}
        {word.source && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>来源</div>
            <div>{word.source}</div>
          </div>
        )}
        {word.tags && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>标签</div>
            <div>
              {word.tags.split(',').filter(Boolean).map((t) => (
                <span key={t} className="tag">{t.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2 style={{ margin: 0 }}>练习卡片</h2>
          <Link to="/cards">
            <button>前往卡片池</button>
          </Link>
        </div>
        {cards.length === 0 ? (
          <p className="muted">卡片加载中...</p>
        ) : (
          cards.map((c) => (
            <div key={c.id} className={styles.cardItem}>
              <div>
                <strong>{c.type}</strong>
                <div className={styles.cardMeta}>
                  {c.enabled ? '已启用' : '已禁用'} · 状态 {c.state} · 下次复习 {c.dueDate} · 间隔 {c.intervalDays}天 ·
                  ease {c.easeFactor?.toFixed(2)} · 重复 {c.repetitions}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
