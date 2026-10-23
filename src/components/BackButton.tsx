import { useNavigate } from 'react-router-dom'
import styles from './BackButton.module.css'

interface BackButtonProps {
  to?: string
  label?: string
}

export default function BackButton({ to, label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate()

  function handleClick() {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button className={styles.btn} onClick={handleClick} aria-label={label}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}
