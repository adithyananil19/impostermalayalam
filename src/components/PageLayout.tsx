import type { ReactNode } from 'react'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: string
  centered?: boolean
}

export default function PageLayout({
  children,
  header,
  footer,
  className = '',
  centered = false,
}: PageLayoutProps) {
  return (
    <div className={[styles.page, className].filter(Boolean).join(' ')}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={[styles.main, centered ? styles.centered : ''].filter(Boolean).join(' ')}>
        {children}
      </main>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}
