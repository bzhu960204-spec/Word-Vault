import { useMemo, useState } from 'react'
import { previewImport } from '../api/words.js'
import styles from './ImportModal.module.css'

const EXAMPLE = `[
  {
    "text": "resilient",
    "translation": "有弹性的；能恢复的",
    "partOfSpeech": "adj.",
    "exampleEn": "She is remarkably resilient.",
    "exampleCn": "她非常有韧性。",
    "tags": "gre,adj",
    "familiarity": 0
  }
]`

export default function ImportModal({ onClose, onImport }) {
  const [step, setStep] = useState('paste') // 'paste' | 'review'
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([]) // { word, selected, duplicate, dupInBatch }
  const [filter, setFilter] = useState('')

  const handleParse = async () => {
    setError(null)
    let json
    try {
      json = JSON.parse(text)
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
      return
    }
    const list = Array.isArray(json) ? json : [json]
    const items = list.filter((w) => w && typeof w === 'object')
    const valid = items.filter((w) => typeof w.text === 'string' && w.text.trim())
    if (valid.length === 0) {
      setError('没有找到有效的单词（每个对象需包含非空的 text 字段）。')
      return
    }

    setLoading(true)
    try {
      const texts = valid.map((w) => w.text.trim())
      let existing = new Set()
      try {
        const res = await previewImport(texts)
        existing = new Set((res || []).map((t) => t.toLowerCase()))
      } catch {
        // 查重失败不阻断流程，仅跳过数据库查重
      }

      const seen = new Set()
      const built = valid.map((w) => {
        const key = w.text.trim().toLowerCase()
        const dupInBatch = seen.has(key)
        seen.add(key)
        const duplicate = existing.has(key)
        return {
          word: w,
          duplicate,
          dupInBatch,
          selected: !duplicate && !dupInBatch,
        }
      })
      setRows(built)
      setStep('review')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return rows.map((r, i) => ({ r, i }))
    return rows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => {
        const w = r.word
        return (
          (w.text || '').toLowerCase().includes(f) ||
          (w.translation || '').toLowerCase().includes(f) ||
          (w.tags || '').toLowerCase().includes(f)
        )
      })
  }, [rows, filter])

  const selectedCount = rows.filter((r) => r.selected).length
  const dupCount = rows.filter((r) => r.duplicate || r.dupInBatch).length

  const toggle = (idx) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)))
  }

  const setAllVisible = (value) => {
    const visibleIdx = new Set(filtered.map(({ i }) => i))
    setRows((prev) => prev.map((r, i) => (visibleIdx.has(i) ? { ...r, selected: value } : r)))
  }

  const deselectDuplicates = () => {
    setRows((prev) => prev.map((r) => (r.duplicate || r.dupInBatch ? { ...r, selected: false } : r)))
  }

  const handleImport = async () => {
    setError(null)
    setSuccess(null)
    const chosen = rows.filter((r) => r.selected).map((r) => r.word)
    if (chosen.length === 0) {
      setError('请至少选择一个单词。')
      return
    }
    setLoading(true)
    try {
      const result = await onImport(chosen)
      setSuccess(`成功导入 ${result.length} 个单词`)
      setTimeout(() => onClose(), 1000)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{step === 'paste' ? '导入 JSON' : '确认导入'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {step === 'paste' ? (
          <>
            <div className={styles.body}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={EXAMPLE}
                autoFocus
              />
              <div className={styles.hint}>
                支持单个对象 <code>{'{...}'}</code> 或数组 <code>{'[{...}, {...}]'}</code>。
                必填字段: <code>text</code>。下一步可勾选需要导入的单词。
              </div>
              {error && <div className={styles.error}>{error}</div>}
            </div>
            <div className={styles.footer}>
              <button onClick={onClose} disabled={loading}>
                取消
              </button>
              <button
                className="primary"
                onClick={handleParse}
                disabled={loading || !text.trim()}
              >
                {loading ? '解析中...' : '下一步'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.reviewBar}>
              <input
                className={styles.search}
                placeholder="筛选单词 / 释义 / 标签..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <div className={styles.reviewActions}>
                <button onClick={() => setAllVisible(true)}>全选</button>
                <button onClick={() => setAllVisible(false)}>全不选</button>
                {dupCount > 0 && (
                  <button onClick={deselectDuplicates}>取消重复项</button>
                )}
              </div>
            </div>

            <div className={styles.reviewBody}>
              <table className={styles.reviewTable}>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th>单词</th>
                    <th>释义</th>
                    <th style={{ width: 90 }}>标签</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ r, i }) => (
                    <tr
                      key={i}
                      className={r.duplicate || r.dupInBatch ? styles.dupRow : ''}
                      onClick={() => toggle(i)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={r.selected}
                          onChange={() => toggle(i)}
                        />
                      </td>
                      <td>
                        <div className={styles.wText}>
                          {r.word.text}
                          {r.duplicate && <span className={styles.badge}>已存在</span>}
                          {!r.duplicate && r.dupInBatch && (
                            <span className={styles.badge}>本次重复</span>
                          )}
                        </div>
                        {r.word.partOfSpeech && (
                          <div className={styles.wPos}>{r.word.partOfSpeech}</div>
                        )}
                      </td>
                      <td className={styles.wTrans}>{r.word.translation}</td>
                      <td className={styles.wTags}>{r.word.tags}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && <div className={styles.error} style={{ padding: '0 20px' }}>{error}</div>}
            {success && <div className={styles.success} style={{ padding: '0 20px' }}>{success}</div>}

            <div className={styles.footer}>
              <span className={styles.counter}>
                已选 {selectedCount} / {rows.length}
                {dupCount > 0 && `（重复 ${dupCount}）`}
              </span>
              <button onClick={() => setStep('paste')} disabled={loading}>
                返回
              </button>
              <button
                className="primary"
                onClick={handleImport}
                disabled={loading || selectedCount === 0}
              >
                {loading ? '导入中...' : `导入 ${selectedCount} 个`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

