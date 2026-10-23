import { useState, useRef } from 'react'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useGame } from '../hooks/useGame'
import type { WordEntry } from '../types'
import styles from './CustomWordsPage.module.css'

type Tab = 'categories' | 'words' | 'import-export'

export default function CustomWordsPage() {
  const {
    allCategories,
    customCategories,
    customWords,
    addCustomCategory,
    deleteCustomCategory,
    addCustomWord,
    editCustomWord,
    deleteCustomWord,
    importCustomData,
    exportCustomData,
  } = useGame()

  const [activeTab, setActiveTab] = useState<Tab>('categories')

  // Category Form State
  const [showAddCat, setShowAddCat] = useState(false)
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catError, setCatError] = useState<string | null>(null)

  // Word Form State
  const [showAddWord, setShowAddWord] = useState(false)
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [wordText, setWordText] = useState('')
  const [wordHint, setWordHint] = useState('')
  const [wordRelated, setWordRelated] = useState('')
  const [wordCat, setWordCat] = useState(allCategories[0]?.id || 'kerala-slang')
  const [wordDiff, setWordDiff] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [wordError, setWordError] = useState<string | null>(null)

  // Import / Export State
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    setCatError(null)
    const id = catName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    const res = addCustomCategory({
      id,
      name: catName,
      description: catDesc,
    })

    if (!res.success) {
      setCatError(res.error || 'Failed to create category.')
      return
    }

    setCatName('')
    setCatDesc('')
    setShowAddCat(false)
  }

  function handleSaveWord(e: React.FormEvent) {
    e.preventDefault()
    setWordError(null)

    if (editingWordId) {
      const res = editCustomWord(editingWordId, {
        word: wordText,
        hint: wordHint,
        relatedWord: wordRelated || undefined,
        category: wordCat,
        difficulty: wordDiff,
      })
      if (!res.success) {
        setWordError(res.error || 'Failed to update word.')
        return
      }
    } else {
      const res = addCustomWord({
        word: wordText,
        hint: wordHint,
        relatedWord: wordRelated || undefined,
        category: wordCat,
        difficulty: wordDiff,
      })
      if (!res.success) {
        setWordError(res.error || 'Failed to add word.')
        return
      }
    }

    // Reset word form
    setWordText('')
    setWordHint('')
    setWordRelated('')
    setEditingWordId(null)
    setShowAddWord(false)
  }

  function handleStartEditWord(word: WordEntry) {
    setEditingWordId(word.id)
    setWordText(word.word)
    setWordHint(word.hint)
    setWordRelated(word.relatedWord || '')
    setWordCat(word.category)
    setWordDiff(word.difficulty)
    setShowAddWord(true)
    setActiveTab('words')
  }

  function handleExportDownload() {
    const data = exportCustomData()
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `imposter-custom-words-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function handleExportCopy() {
    const data = exportCustomData()
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setImportStatus({
      type: 'success',
      message: 'Custom categories & words copied to clipboard as JSON!',
    })
  }

  function handleImportSubmit() {
    setImportStatus(null)
    if (!importText.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste JSON content to import.' })
      return
    }

    const res = importCustomData(importText)
    if (!res.success) {
      setImportStatus({ type: 'error', message: res.error || 'Import failed.' })
      return
    }

    setImportText('')
    setImportStatus({
      type: 'success',
      message: `Successfully imported ${res.count?.categories || 0} categories and ${res.count?.words || 0} words!`,
    })
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const content = event.target?.result as string
      setImportText(content)
      const res = importCustomData(content)
      if (!res.success) {
        setImportStatus({ type: 'error', message: res.error || 'Import failed.' })
      } else {
        setImportStatus({
          type: 'success',
          message: `Successfully imported ${res.count?.categories || 0} categories and ${res.count?.words || 0} words from file!`,
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <PageLayout header={<BackButton to="/" label="Home" />}>
      <div className={styles.content}>
        <div className={styles.intro}>
          <h2 className={styles.heading}>Custom Content</h2>
          <p className={styles.sub}>
            Create your own Malayalam word packs, custom hints, and categories.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabBar} role="tablist">
          <button
            type="button"
            className={[styles.tabBtn, activeTab === 'categories' ? styles.tabBtnActive : ''].join(' ')}
            onClick={() => setActiveTab('categories')}
          >
            Categories ({customCategories.length})
          </button>
          <button
            type="button"
            className={[styles.tabBtn, activeTab === 'words' ? styles.tabBtnActive : ''].join(' ')}
            onClick={() => setActiveTab('words')}
          >
            Words ({customWords.length})
          </button>
          <button
            type="button"
            className={[styles.tabBtn, activeTab === 'import-export' ? styles.tabBtnActive : ''].join(' ')}
            onClick={() => setActiveTab('import-export')}
          >
            Import / Export
          </button>
        </div>

        {/* ── TAB 1: CATEGORIES ── */}
        {activeTab === 'categories' && (
          <div>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Custom Categories</span>
              <Button
                variant={showAddCat ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setShowAddCat(s => !s)}
              >
                {showAddCat ? 'Cancel' : '+ New Category'}
              </Button>
            </div>

            {showAddCat && (
              <form className={styles.formCard} onSubmit={handleCreateCategory}>
                <h4 className={styles.formTitle}>Add New Category</h4>
                {catError && <div className={styles.alertError}>⚠️ {catError}</div>}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Category Name *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. Kozhikode Food Trail"
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Description (Optional)</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Brief description for players"
                    value={catDesc}
                    onChange={e => setCatDesc(e.target.value)}
                  />
                </div>
                <div className={styles.formBtns}>
                  <Button variant="primary" size="md" type="submit">
                    Save Category
                  </Button>
                  <Button variant="ghost" size="md" type="button" onClick={() => setShowAddCat(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {customCategories.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No custom categories yet</p>
                <p className={styles.emptyBody}>
                  Create your own categories to organize personal friends group words, college in-jokes, or local slang.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setShowAddCat(true)}>
                  Create Your First Category
                </Button>
              </div>
            ) : (
              <div className={styles.itemList}>
                {customCategories.map(cat => {
                  const wordsInCat = customWords.filter(w => w.category === cat.id).length
                  return (
                    <div key={cat.id} className={styles.itemCard}>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemName}>{cat.name}</span>
                          <Badge variant="accent">
                            {wordsInCat} {wordsInCat === 1 ? 'word' : 'words'}
                          </Badge>
                        </div>
                        {cat.description && <p className={styles.itemDesc}>{cat.description}</p>}
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.deleteBtn}`}
                          title="Delete category"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}" and all its words?`)) {
                              deleteCustomCategory(cat.id)
                            }
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: WORDS ── */}
        {activeTab === 'words' && (
          <div>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Custom Words</span>
              <Button
                variant={showAddWord ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  if (showAddWord) {
                    setEditingWordId(null)
                    setShowAddWord(false)
                  } else {
                    setEditingWordId(null)
                    setWordText('')
                    setWordHint('')
                    setWordRelated('')
                    setShowAddWord(true)
                  }
                }}
              >
                {showAddWord ? 'Cancel' : '+ New Word'}
              </Button>
            </div>

            {showAddWord && (
              <form className={styles.formCard} onSubmit={handleSaveWord}>
                <h4 className={styles.formTitle}>
                  {editingWordId ? 'Edit Custom Word' : 'Add New Secret Word'}
                </h4>
                {wordError && <div className={styles.alertError}>⚠️ {wordError}</div>}

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Secret Word *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Kattan Chaya"
                      value={wordText}
                      onChange={e => setWordText(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Imposter's Hint *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Glass tumbler"
                      value={wordHint}
                      onChange={e => setWordHint(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Category *</label>
                    <select
                      className={styles.selectField}
                      value={wordCat}
                      onChange={e => setWordCat(e.target.value)}
                    >
                      {allCategories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.isCustom ? '(Custom)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Related Word (Optional)</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="For related_word mode"
                      value={wordRelated}
                      onChange={e => setWordRelated(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Difficulty</label>
                  <select
                    className={styles.selectField}
                    value={wordDiff}
                    onChange={e => setWordDiff(e.target.value as 'easy' | 'medium' | 'hard')}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className={styles.formBtns}>
                  <Button variant="primary" size="md" type="submit">
                    {editingWordId ? 'Update Word' : 'Save Word'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    type="button"
                    onClick={() => {
                      setShowAddWord(false)
                      setEditingWordId(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {customWords.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No custom words added yet</p>
                <p className={styles.emptyBody}>
                  Add secret words with funny, subtle Malayalam hints. Custom words are automatically included in game rounds!
                </p>
                <Button variant="secondary" size="sm" onClick={() => setShowAddWord(true)}>
                  Add Your First Word
                </Button>
              </div>
            ) : (
              <div className={styles.itemList}>
                {customWords.map(w => {
                  const cat = allCategories.find(c => c.id === w.category)
                  return (
                    <div key={w.id} className={styles.itemCard}>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemName}>{w.word}</span>
                          <Badge variant="accent">{cat ? cat.name : w.category}</Badge>
                        </div>
                        <p className={styles.itemHint}>
                          Hint: <em>"{w.hint}"</em>
                          {w.relatedWord && ` · Related: "${w.relatedWord}"`}
                        </p>
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="Edit word"
                          onClick={() => handleStartEditWord(w)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.deleteBtn}`}
                          title="Delete word"
                          onClick={() => {
                            if (window.confirm(`Delete "${w.word}"?`)) {
                              deleteCustomWord(w.id)
                            }
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: IMPORT / EXPORT ── */}
        {activeTab === 'import-export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {importStatus && (
              <div
                className={importStatus.type === 'success' ? styles.alertSuccess : styles.alertError}
              >
                {importStatus.type === 'success' ? '✓ ' : '⚠️ '}
                {importStatus.message}
              </div>
            )}

            {/* Export */}
            <div className={styles.ioCard}>
              <h4 className={styles.ioTitle}>Export Word Bank</h4>
              <p className={styles.ioDesc}>
                Download your custom words and categories as a backup JSON file or copy to share with friends.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Button variant="primary" size="md" onClick={handleExportDownload}>
                  Download JSON File 📥
                </Button>
                <Button variant="secondary" size="md" onClick={handleExportCopy}>
                  Copy to Clipboard 📋
                </Button>
              </div>
            </div>

            {/* Import */}
            <div className={styles.ioCard}>
              <h4 className={styles.ioTitle}>Import Word Bank</h4>
              <p className={styles.ioDesc}>
                Upload a valid JSON word pack or paste JSON text below. New entries will be merged safely without deleting existing words.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <Button
                variant="secondary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload .JSON File 📂
              </Button>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Or paste JSON directly:</label>
                <textarea
                  className={styles.textareaField}
                  placeholder='{"categories": [...], "words": [...]}'
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                />
              </div>

              <div>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!importText.trim()}
                  onClick={handleImportSubmit}
                >
                  Import Pasted JSON
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
