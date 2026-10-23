import styles from './Toggle.module.css'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={[styles.wrapper, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
      <div className={[styles.track, checked ? styles.on : ''].filter(Boolean).join(' ')}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className={styles.thumb} />
      </div>
    </label>
  )
}
