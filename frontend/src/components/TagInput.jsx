import { useState } from 'react'
import styles from './TagInput.module.css'

export default function TagInput({ value, onChange }) {
  const tags = value
    ? value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []
  const [draft, setDraft] = useState('')

  const commit = (raw) => {
    const t = raw.trim().replace(/,/g, '')
    if (!t) return
    if (tags.includes(t)) {
      setDraft('')
      return
    }
    onChange([...tags, t].join(','))
    setDraft('')
  }

  const remove = (t) => {
    onChange(tags.filter((x) => x !== t).join(','))
  }

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1).join(','))
    }
  }

  return (
    <div className={styles.tagInput}>
      {tags.map((t) => (
        <span key={t} className={styles.chip}>
          {t}
          <button type="button" onClick={() => remove(t)} aria-label={`remove ${t}`}>
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => commit(draft)}
        placeholder={tags.length === 0 ? '输入标签，按回车添加' : ''}
      />
    </div>
  )
}
