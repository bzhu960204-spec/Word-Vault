import { useState } from 'react'
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
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    let json
    try {
      json = JSON.parse(text)
    } catch (e) {
      setError('JSON 格式错误: ' + e.message)
      return
    }
    setLoading(true)
    try {
      const result = await onImport(json)
      setSuccess(`成功导入 ${result.length} 个单词`)
      setTimeout(() => onClose(), 1200)
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
          <h2>导入 JSON</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={EXAMPLE}
            autoFocus
          />
          <div className={styles.hint}>
            支持单个对象 <code>{'{...}'}</code> 或数组 <code>{'[{...}, {...}]'}</code>。
            必填字段: <code>text</code>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
        </div>
        <div className={styles.footer}>
          <button onClick={onClose} disabled={loading}>
            取消
          </button>
          <button className="primary" onClick={handleSubmit} disabled={loading || !text.trim()}>
            {loading ? '导入中...' : '导入'}
          </button>
        </div>
      </div>
    </div>
  )
}
