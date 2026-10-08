import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listWords, listTags, createCardForWord, importWords } from '../api/words.js'
import { listCards } from '../api/cards.js'
import FilterBar from '../components/FilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ImportModal from '../components/ImportModal.jsx'
import styles from './WordList.module.css'

export default function WordList() {
  const [filters, setFilters] = useState({ q: '', tag: '', familiarity: '' })
  const [words, setWords] = useState([])
  const [tags, setTags] = useState([])
  const [cardWordIds, setCardWordIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const navigate = useNavigate()

  const loadCards = useCallback(() => {
    listCards().then((cards) => {
      setCardWordIds(new Set(cards.map((c) => c.wordId)))
    }).catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filters.q) params.q = filters.q
    if (filters.tag) params.tag = filters.tag
    if (filters.familiarity !== '') params.familiarity = filters.familiarity
    listWords(params)
      .then(setWords)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    const id = setTimeout(load, 200)
    return () => clearTimeout(id)
  }, [load])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  useEffect(() => {
    listTags().then(setTags).catch(() => {})
  }, [words.length])

  const addCard = async (e, id) => {
    e.stopPropagation()
    try {
      await createCardForWord(id)
      setCardWordIds((prev) => new Set([...prev, id]))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>单词库</h1>
        <div className={styles.actions}>
          <button onClick={() => setShowImport(true)}>导入 JSON</button>
          <Link to="/words/new">
            <button className="primary">+ 新增单词</button>
          </Link>
        </div>
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={async (json) => {
            const data = Array.isArray(json) ? json : [json]
            const result = await importWords(data)
            load()
            return result
          }}
        />
      )}

      <FilterBar
        q={filters.q}
        tag={filters.tag}
        familiarity={filters.familiarity}
        tags={tags}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
      />

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {!loading && words.length === 0 ? (
        <EmptyState
          title="还没有单词"
          hint="点击右上角新增第一个单词，开始你的词汇之旅。"
        />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>单词</th>
              <th>词性</th>
              <th>标签</th>
              <th>熟悉度</th>
              <th>卡片</th>
              <th style={{ width: 120 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w) => {
              const hasCard = cardWordIds.has(w.id)
              return (
              <tr key={w.id} onClick={() => navigate(`/words/${w.id}`)}>
                <td>
                  <div className={styles.wordText}>{w.text}</div>
                  {w.translation && <div className={styles.translation}>{w.translation}</div>}
                </td>
                <td className="muted">{w.partOfSpeech || '-'}</td>
                <td>
                  {(w.tags || '')
                    .split(',')
                    .filter(Boolean)
                    .map((t) => (
                      <span key={t} className="tag">
                        {t.trim()}
                      </span>
                    ))}
                </td>
                <td>
                  <span className={styles.familiarity} data-level={w.familiarity}>
                    {w.familiarity}
                  </span>
                </td>
                <td>
                  {hasCard ? (
                    <span className={styles.cardBadge}>已加入</span>
                  ) : (
                    <span className={styles.cardBadgeNone}>未加入</span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    {hasCard ? (
                      <button disabled style={{ opacity: 0.5 }}>已在池中</button>
                    ) : (
                      <button onClick={(e) => addCard(e, w.id)}>+ 卡片</button>
                    )}
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
