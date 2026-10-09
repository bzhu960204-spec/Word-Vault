import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCards, resetCard, batchSetEnabled } from '../api/cards.js'
import EmptyState from '../components/EmptyState.jsx'
import styles from './CardPool.module.css'

export default function CardPool() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [filter, setFilter] = useState({ state: '', enabled: '', tag: '', q: '' })
  const navigate = useNavigate()

  const load = useCallback(() => {
    setLoading(true)
    listCards()
      .then(setCards)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Filtered cards
  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (filter.state && c.state !== filter.state) return false
      if (filter.enabled === 'true' && !c.enabled) return false
      if (filter.enabled === 'false' && c.enabled) return false
      if (filter.tag && !(c.tags || '').toLowerCase().includes(filter.tag.toLowerCase())) return false
      if (filter.q && !(c.wordText || '').toLowerCase().includes(filter.q.toLowerCase()) &&
          !(c.translation || '').toLowerCase().includes(filter.q.toLowerCase())) return false
      return true
    })
  }, [cards, filter])

  // All unique tags from cards
  const allTags = useMemo(() => {
    const set = new Set()
    cards.forEach((c) => {
      if (c.tags) c.tags.split(',').filter(Boolean).forEach((t) => set.add(t.trim()))
    })
    return [...set].sort()
  }, [cards])

  // Selection helpers
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(filtered.map((c) => c.id)))
  }

  const selectNone = () => setSelected(new Set())

  const invertSelection = () => {
    const filteredIds = new Set(filtered.map((c) => c.id))
    setSelected((prev) => {
      const next = new Set()
      filteredIds.forEach((id) => { if (!prev.has(id)) next.add(id) })
      return next
    })
  }

  // Bulk enable/disable
  const bulkSetEnabled = async (enabled) => {
    const ids = [...selected]
    if (ids.length === 0) return
    try {
      const updated = await batchSetEnabled(ids, enabled)
      const map = new Map(updated.map((c) => [c.id, c]))
      setCards((prev) => prev.map((c) => map.has(c.id) ? map.get(c.id) : c))
      setSelected(new Set())
    } catch (err) {
      alert(err.message)
    }
  }

  const onReset = async (e, cardId) => {
    e.stopPropagation()
    if (!confirm('确认重置该卡片？状态将回到 NEW，间隔和 ease 恢复初始值。')) return
    try {
      const updated = await resetCard(cardId)
      setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <p className="muted">加载中...</p>

  const enabledCount = cards.filter((c) => c.enabled).length

  return (
    <div>
      <div className={styles.header}>
        <h1>练习卡片池</h1>
        <span className="muted">共 {cards.length} 张卡片，已启用 {enabledCount} 张</span>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="搜索单词..."
          value={filter.q}
          onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
          className={styles.filterInput}
        />
        <select value={filter.state} onChange={(e) => setFilter((f) => ({ ...f, state: e.target.value }))}>
          <option value="">全部状态</option>
          <option value="NEW">NEW</option>
          <option value="LEARNING">LEARNING</option>
          <option value="REVIEW">REVIEW</option>
        </select>
        <select value={filter.enabled} onChange={(e) => setFilter((f) => ({ ...f, enabled: e.target.value }))}>
          <option value="">全部（启用/禁用）</option>
          <option value="true">已启用</option>
          <option value="false">未启用</option>
        </select>
        {allTags.length > 0 && (
          <select value={filter.tag} onChange={(e) => setFilter((f) => ({ ...f, tag: e.target.value }))}>
            <option value="">全部标签</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Bulk actions */}
      <div className={styles.bulkBar}>
        <button type="button" onClick={selectAll}>全选</button>
        <button type="button" onClick={invertSelection}>反选</button>
        <button type="button" onClick={selectNone}>取消</button>
        <span className="muted" style={{ marginLeft: 8 }}>已选 {selected.size} 项</span>
        <button type="button" className="primary" onClick={() => bulkSetEnabled(true)} disabled={selected.size === 0}>
          批量启用
        </button>
        <button type="button" onClick={() => bulkSetEnabled(false)} disabled={selected.size === 0}>
          批量禁用
        </button>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="练习池为空"
          hint="前往单词库添加单词，新单词会自动进入练习池。"
        />
      ) : filtered.length === 0 ? (
        <p className="muted">当前筛选条件下没有卡片</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((c) => selected.has(c.id))}
                  onChange={(e) => e.target.checked ? selectAll() : selectNone()}
                />
              </th>
              <th>启用</th>
              <th>单词</th>
              <th>状态</th>
              <th>下次复习</th>
              <th>间隔</th>
              <th>ease</th>
              <th>重复次数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className={!c.enabled ? styles.disabled : ''}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                  />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    onChange={async () => {
                      try {
                        const updated = await batchSetEnabled([c.id], !c.enabled)
                        const map = new Map(updated.map((u) => [u.id, u]))
                        setCards((prev) => prev.map((x) => map.has(x.id) ? map.get(x.id) : x))
                      } catch (err) { alert(err.message) }
                    }}
                  />
                </td>
                <td onClick={() => navigate(`/words/${c.wordId}`)}>
                  <div className={styles.wordText}>{c.wordText}</div>
                  {c.translation && <div className={styles.translation}>{c.translation}</div>}
                </td>
                <td>
                  <span className={styles.stateBadge} data-state={c.state}>
                    {c.state}
                  </span>
                </td>
                <td className={styles.meta}>{c.dueDate}</td>
                <td className={styles.meta}>{c.intervalDays} 天</td>
                <td className={styles.meta}>{c.easeFactor?.toFixed(2)}</td>
                <td className={styles.meta}>{c.repetitions}</td>
                <td>
                  <div className={styles.actions}>
                    <button onClick={(e) => onReset(e, c.id)}>
                      重置
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
