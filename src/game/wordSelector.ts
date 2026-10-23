import type { WordEntry } from '../types'

/**
 * Selects a word from available words based on enabled categories,
 * prioritizing unused words in the current session.
 */
export function selectSecretWord(
  allWords: WordEntry[],
  enabledCategories: string[],
  usedWordIds: string[] = []
): WordEntry | null {
  if (!allWords || allWords.length === 0 || !enabledCategories || enabledCategories.length === 0) {
    return null
  }

  // Filter words by enabled categories
  const categoryWords = allWords.filter(w => enabledCategories.includes(w.category))
  if (categoryWords.length === 0) {
    return null
  }

  // Filter out already used words
  const unusedWords = categoryWords.filter(w => !usedWordIds.includes(w.id))

  // If all words in these categories have been used, recycle the pool
  const pool = unusedWords.length > 0 ? unusedWords : categoryWords

  const randomIndex = Math.floor(Math.random() * pool.length)
  return pool[randomIndex]
}

/**
 * Skips the current word and selects an alternative valid word
 * without changing player roles or resetting the round.
 */
export function skipCurrentWord(
  allWords: WordEntry[],
  enabledCategories: string[],
  currentWordId: string,
  usedWordIds: string[] = []
): WordEntry | null {
  const updatedUsed = [...usedWordIds]
  if (!updatedUsed.includes(currentWordId)) {
    updatedUsed.push(currentWordId)
  }

  // Try to find a word that is not the current word
  const nextWord = selectSecretWord(allWords, enabledCategories, updatedUsed)
  if (nextWord && nextWord.id !== currentWordId) {
    return nextWord
  }

  // If pool only has 1 word, we can only return that word
  const categoryWords = allWords.filter(
    w => enabledCategories.includes(w.category) && w.id !== currentWordId
  )
  if (categoryWords.length > 0) {
    return categoryWords[Math.floor(Math.random() * categoryWords.length)]
  }

  return nextWord
}
