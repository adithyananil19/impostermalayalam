import styles from './Divider.module.css'

export default function Divider({ label }: { label?: string }) {
  if (!label) return <hr className={styles.line} />
  return (
    <div className={styles.labeled}>
      <span className={styles.rule} />
      <span className={styles.text}>{label}</span>
      <span className={styles.rule} />
    </div>
  )
}
