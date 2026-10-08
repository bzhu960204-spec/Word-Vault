import styles from './EmptyState.module.css'

export default function EmptyState({ title, hint, action }) {
  return (
    <div className={styles.empty}>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  )
}
