import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import styles from './CategorySelectionPage.module.css'

export default function CategorySelectionPage() {
  const navigate = useNavigate()
  const { updateSettings, allWords, allCategories } = useGame()
  const [selected, setSelected] = useState<Set<string>>(new Set(allCategories.map(c => c.id)))

  // Live dynamic count of words per category
  const wordCountByCat = useMemo(() => {
    const map: Record<string, number> = {}
    allWords.forEach(w => {
      map[w.category] = (map[w.category] || 0) + 1
    })
    return map
  }, [allWords])

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(allCategories.map(c => c.id)))
  }

  function clearAll() {
    setSelected(new Set())
  }

  function handleContinue() {
    updateSettings({ enabledCategories: [...selected] })
    navigate('/settings')
  }

  const canContinue = selected.size > 0

  return (
    <PageLayout
      header={<BackButton to="/players" />}
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue
          {selected.size > 0 && ` (${selected.size} selected)`}
        </Button>
      }
    >
      <div className={styles.intro}>
        <h2 className={styles.heading}>Categories</h2>
        <div className={styles.subRow}>
          <p className={styles.sub}>Pick one or more word categories.</p>
          <div className={styles.bulkBtns}>
            <button className={styles.bulkBtn} onClick={selectAll}>
              All
            </button>
            <button className={styles.bulkBtn} onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <ul className={styles.grid}>
        {allCategories.map(cat => {
          const isSelected = selected.has(cat.id)
          const count = wordCountByCat[cat.id] || 0
          return (
            <li key={cat.id}>
              <button
                className={[styles.catCard, isSelected ? styles.selected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => toggle(cat.id)}
                aria-pressed={isSelected}
              >
                <div className={styles.catTop}>
                  <span className={styles.catName}>{cat.name}</span>
                  <div className={styles.catMeta}>
                    <span
                      className={[
                        styles.catCountBadge,
                        isSelected ? styles.catCountSelected : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {count} {count === 1 ? 'word' : 'words'}
                    </span>
                    {isSelected && (
                      <span className={styles.checkmark} aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2.5 7L5.5 10L11.5 4"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <p className={styles.catDesc}>{cat.description}</p>
              </button>
            </li>
          )
        })}
      </ul>
    </PageLayout>
  )
}
