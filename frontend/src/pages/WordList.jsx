import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listWords, listTags, importWords, deleteWord, deleteWords } from '../api/words.js'
import FilterBar from '../components/FilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ImportModal from '../components/ImportModal.jsx'
import styles from './WordList.module.css'

export default function WordList() {
  const [filters, setFilters] = useState({ q: '', tag: '', familiarity: '' })
  const [words, setWords] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const navigate = useNavigate()

  const exitSelection = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filters.q) params.q = filters.q
    if (filters.tag) params.tag = filters.tag
    if (filters.familiarity !== '') params.familiarity = filters.familiarity
    listWords(params)
      .then((data) => {
        setWords(data)
        setSelectedIds(new Set())
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    const id = setTimeout(load, 200)
    return () => clearTimeout(id)
  }, [load])

  useEffect(() => {
    listTags().then(setTags).catch(() => {})
  }, [words.length])

  const onDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('确认删除该单词？将同时移出练习池并删除其所有卡片与复习记录。')) return
    try {
      await deleteWord(id)
      setWords((prev) => prev.filter((w) => w.id !== id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleSelect = (e, id) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === words.length ? new Set() : new Set(words.map((w) => w.id))
    )
  }

  const onBatchDelete = async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    if (!confirm(`确认删除选中的 ${ids.length} 个单词？将同时移出练习池并删除其所有卡片与复习记录。`)) return
    try {
      await deleteWords(ids)
      const idSet = new Set(ids)
      setWords((prev) => prev.filter((w) => !idSet.has(w.id)))
      setSelectedIds(new Set())
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>单词库</h1>
        <div className={styles.actions}>
          {selectionMode ? (
            <button onClick={exitSelection}>退出多选</button>
          ) : (
            <button onClick={() => setSelectionMode(true)}>批量管理</button>
          )}
          <button onClick={() => setShowImport(true)}>导入 JSON</button>
          <Link to="/words/new">
            <button className="primary">+ 新增单词</button>
          </Link>
        </div>
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={async (words) => {
            const result = await importWords(words)
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

      {selectedIds.size > 0 && (
        <div className={styles.batchBar}>
          <span>已选 {selectedIds.size} 个</span>
          <div className={styles.batchActions}>
            <button onClick={() => setSelectedIds(new Set())}>取消选择</button>
            <button className="danger" onClick={onBatchDelete}>删除选中</button>
          </div>
        </div>
      )}

      {!loading && words.length === 0 ? (
        <EmptyState
          title="还没有单词"
          hint="点击右上角新增第一个单词，开始你的词汇之旅。"
        />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {selectionMode && (
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={words.length > 0 && selectedIds.size === words.length}
                    ref={(el) => {
                      if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < words.length
                    }}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th>单词</th>
              <th>词性</th>
              <th>标签</th>
              <th>熟悉度</th>
              <th style={{ width: 190 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w) => {
              return (
              <tr key={w.id} onClick={() => navigate(`/words/${w.id}`)}>
                {selectionMode && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(w.id)}
                      onChange={(e) => toggleSelect(e, w.id)}
                    />
                  </td>
                )}
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
                  <div className={styles.actions}>
                    <button className="danger" onClick={(e) => onDelete(e, w.id)}>删除</button>
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
