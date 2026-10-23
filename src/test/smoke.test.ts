import { describe, it, expect } from 'vitest'
import { DEFAULT_SETTINGS } from '../types'

// Phase 1 smoke tests — verifies that the type system and defaults are sane.
// Comprehensive engine tests are in Phase 2.

describe('DEFAULT_SETTINGS', () => {
  it('has a valid imposter count', () => {
    expect(DEFAULT_SETTINGS.imposterCount).toBeGreaterThanOrEqual(1)
  })

  it('has a valid timer duration', () => {
    expect(DEFAULT_SETTINGS.timerSeconds).toBeGreaterThan(0)
  })

  it('imposterMode is one of the accepted values', () => {
    expect(['no_word', 'vague_hint', 'category_reveal']).toContain(DEFAULT_SETTINGS.imposterMode)
  })

  it('revealStyle is one of the accepted values', () => {
    expect(['tap', 'hold']).toContain(DEFAULT_SETTINGS.revealStyle)
  })

  it('voteOutcome is one of the accepted values', () => {
    expect(['reveal_and_end', 'eliminate_and_continue']).toContain(DEFAULT_SETTINGS.voteOutcome)
  })

  it('gameMode is single by default', () => {
    expect(DEFAULT_SETTINGS.gameMode).toBe('single')
  })
})
