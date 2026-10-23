import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  selected?: boolean
  as?: 'div' | 'button' | 'li'
}

export default function Card({
  children,
  className = '',
  onClick,
  selected = false,
  as: Tag = 'div',
}: CardProps) {
  const classes = [
    styles.card,
    selected ? styles.selected : '',
    onClick ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </Tag>
  )
}
