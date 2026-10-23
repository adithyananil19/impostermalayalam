import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Badge from '../components/Badge'
import styles from './CategorySelectionPage.module.css'

// Phase 5 will load these from the real data module.
// For Phase 1, we use representative mock categories.
const MOCK_CATEGORIES = [
  { id: 'kerala-slang', name: 'Kerala Slang', description: 'Everyday Malayalam culture', count: 10 },
  { id: 'college-life', name: 'College Life', description: 'Campus struggles & wins', count: 10 },
  { id: 'food-bakery', name: 'Food & Bakery', description: 'Kerala eats and treats', count: 10 },
  { id: 'memes-trends', name: 'Memes & Trends', description: 'Viral internet culture', count: 10 },
  { id: 'places-kerala', name: 'Places in Kerala', description: 'Towns and cities', count: 10 },
  { id: 'everyday-objects', name: 'Everyday Objects', description: 'Things around you', count: 10 },
  { id: 'politics', name: 'Politics & Public Life', description: 'Playful political humour', count: 10 },
  { id: 'relationships', name: 'Relationships', description: 'Love, friendship, drama', count: 10 },
  { id: 'tricky-words', name: 'Tricky Words', description: 'Deceptively similar answers', count: 10 },
  { id: 'sports-games', name: 'Sports & Games', description: 'Football, cricket and more', count: 10 },
  { id: 'malayalam-movies', name: 'Malayalam Movies', description: 'Famous films & classics', count: 81 },
]

export default function CategorySelectionPage() {
  const navigate = useNavigate()
  const { updateSettings } = useGame()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(MOCK_CATEGORIES.map(c => c.id)))
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
        {MOCK_CATEGORIES.map(cat => {
          const isSelected = selected.has(cat.id)
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
                  <Badge variant={isSelected ? 'accent' : 'default'}>{cat.count} words</Badge>
                </div>
                <p className={styles.catDesc}>{cat.description}</p>
                {isSelected && (
                  <div className={styles.checkmark} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </PageLayout>
  )
}
