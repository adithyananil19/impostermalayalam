# Content Guidelines

## Word and hint quality rules

1. Words and hints should feel like something college students would actually say.
2. Hints are usually one or two words, occasionally three.
3. Hints must be indirect, funny, casual, and culturally recognizable.
4. Avoid formal descriptions, dictionary definitions, and full sentences as hints.
5. Never repeat the answer word in the hint.
6. Never use the answer as a nickname or an obvious synonym.
7. Include easy, medium, and hard difficulty levels across each category.
8. Hint must not reveal the answer too directly.

## What to avoid

- Celebrity names, actor nicknames, or real-person trivia unless clearly indirect.
- Answers that are also hints (e.g. `Chai — Tea`).
- Offensive, defamatory, or unverified claims about real people.
- Political humour that could be read as partisan attack rather than gentle satire.

## Entry format

```ts
{
  id: string,       // e.g. "kslang-001"  — category prefix + sequential number
  word: string,     // The secret word
  hint: string,     // Imposter's clue (vague_hint mode)
  category: string, // Category ID
  difficulty: 'easy' | 'medium' | 'hard',
  tags?: string[],  // Optional sub-grouping tags
}
```

## ID naming convention

| Category | Prefix |
|---|---|
| Kerala Slang | `kslang-` |
| College Life | `college-` |
| Food & Bakery | `food-` |
| Memes & Trends | `memes-` |
| Places in Kerala | `places-` |
| Everyday Objects | `objects-` |
| Politics & Public Life | `politics-` |
| Relationships | `rel-` |
| Tricky Words | `tricky-` |
| Sports & Games | `sports-` |
| Malayalam Movies | `movie-` |
| Custom (user-created) | `custom-` |

## Movie category notes

- Hints must evoke plot, setting, situation, or general vibe — not character names.
- Difficulty:
  - **Easy:** widely known, mainstream release.
  - **Medium:** plot or setting reference.
  - **Hard:** indirect or obscure reference.
- Multiple sub-group tags allowed without duplicating entries.
- Flag any hint that could be interpreted as a direct answer for review.

## Content review checklist

Before adding entries:
- [ ] ID is unique across all categories.
- [ ] Word field is non-empty.
- [ ] Hint field is non-empty and does not repeat the answer.
- [ ] Category matches a known category ID.
- [ ] Difficulty is one of: `easy`, `medium`, `hard`.
- [ ] For movies: hint references a story element, not a character's real name.
