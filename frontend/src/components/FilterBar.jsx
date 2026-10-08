import styles from './FilterBar.module.css'

export default function FilterBar({ q, tag, familiarity, tags, onChange }) {
  return (
    <div className={styles.bar}>
      <input
        className={styles.search}
        type="search"
        placeholder="搜索英文或中文..."
        value={q}
        onChange={(e) => onChange({ q: e.target.value })}
      />
      <select value={tag} onChange={(e) => onChange({ tag: e.target.value })}>
        <option value="">全部标签</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={familiarity === '' ? '' : String(familiarity)}
        onChange={(e) => onChange({ familiarity: e.target.value })}
      >
        <option value="">全部熟悉度</option>
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <option key={v} value={v}>
            熟悉度 {v}
          </option>
        ))}
      </select>
    </div>
  )
}
