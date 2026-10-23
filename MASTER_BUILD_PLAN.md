# Imposter Party Game — Master Build Plan

## Project rules

- Build a new project from scratch. Do not copy the source code, assets, branding, or proprietary word bank of the reference app.
- Use Google Antigravity as the coding agent.
- Use React + TypeScript + Vite.
- Target mobile-first responsive web, with desktop support.
- All UI text must be in English for now. Words and hints can contain Malayalam transliteration when appropriate.
- The game must work offline after its first successful load and caching.
- Use a clean, minimal dark design with restrained lime accents.
- Complete one phase at a time. Verify the phase, update project documentation, and wait for my approval before proceeding.
- Do not replace working code unnecessarily or regenerate entire files when a targeted edit is sufficient.
- Never claim a test, build, or deployment succeeded unless you actually ran and verified it.
- Do not implement online multiplayer until the offline game is complete and stable.

---

# PHASE 0 — Project foundation and specification

Before coding the full application, inspect the available environment and create the project foundation.

### Requirements

1. Initialize a React + TypeScript + Vite project.
2. Set up a sensible folder structure:

   - `src/components/`
   - `src/pages/`
   - `src/game/`
   - `src/data/`
   - `src/hooks/`
   - `src/storage/`
   - `src/styles/`
   - `src/types/`
   - `src/utils/`

3. Create these project documents:
   - `PRODUCT_SPEC.md`
   - `IMPLEMENTATION_PLAN.md`
   - `PROGRESS.md`
   - `TEST_PLAN.md`
   - `CONTENT_GUIDELINES.md`

4. Define the game rules, data structures, state transitions, content format, and acceptance criteria before implementing complex features.
5. Add scripts for development, production build, and tests.
6. Set up Git if available, and make an initial checkpoint.

### Important

Do not attempt to build the entire application in this phase. Establish the architecture and make sure the development environment works.

### Completion criteria

- The development server starts.
- The initial application loads.
- The project structure and documentation exist.
- The production build works.
- `PROGRESS.md` clearly describes what has and has not been completed.

Stop and report the results.

---

# PHASE 1 — Minimal premium UI and navigation

Build the visual foundation of the game before implementing complicated game logic.

## Design direction

Create a modern, minimal, dark-mode party game.

### Visual system

- Background: deep charcoal, approximately `#101110`.
- Card surfaces: slightly lighter charcoal, approximately `#191B19`.
- Primary text: warm off-white, approximately `#F3F3EF`.
- Secondary text: muted grey, approximately `#969B95`.
- Accent: restrained lime green, approximately `#C6F36A`.
- Borders: subtle dark-grey lines.
- Corners: consistently rounded, around 12–20px depending on component.
- Typography: clean sans-serif, such as Inter or a similar locally available font.
- Use generous spacing and clear visual hierarchy.
- Use the accent colour for primary actions, selected states, and important game indicators only.

Avoid:
- Excessive gradients.
- Rainbow colours.
- Unnecessary illustrations.
- Excessive borders and shadows.
- Emoji used as a replacement for a proper design system.
- Tiny text, cramped cards, or generic dashboard layouts.
- Excessive animations.

### Screens to build

1. Home screen.
2. New game setup.
3. Player name entry.
4. Category selection.
5. Game settings.
6. Secret role reveal.
7. Discussion screen.
8. Voting screen.
9. Results screen.
10. Multi-round score screen.
11. Custom word management.
12. Preferences.

### Home screen

Include:
- App name placeholder: `IMPOSTER`.
- A short subtitle, such as `One word. One liar. No trust.`
- Primary action: `New Game`.
- Secondary actions: `Custom Words`, `Settings`.
- A small, unobtrusive statistics section if local stats are available.

### Interaction requirements

- Every button must perform a real action or be clearly marked as not yet implemented.
- Use consistent button heights and spacing.
- Support mobile screens first.
- Use subtle transitions for screen changes and selected states.
- Respect reduced-motion preferences.
- Make interactive controls accessible by keyboard and screen reader.

For this phase, use mock data where needed. Do not fake completed gameplay.

### Completion criteria

All main screens have a consistent visual foundation, responsive layouts, reusable components, and working navigation.

Run the build and report the results. Stop for approval.

---

# PHASE 2 — Game engine and rules

Implement the game engine independently of the visual components.

## Players

- Minimum: 3 players.
- Maximum: 20 players.
- Each player has a name and unique ID.
- Prevent empty names and duplicate player IDs.
- Support configurable imposter counts.
- Prevent impossible configurations, such as having no regular players.
- Clearly explain invalid configurations.

## Game setup

Allow the host to configure:

- Player names.
- Number of imposters.
- Selected categories.
- Random word selection.
- Imposter information mode.
- Discussion timer.
- Voting and elimination rules.
- Single-round or multi-round session.

## Imposter information modes

Support three modes:

1. **No Word:** the imposter receives no secret word.
2. **Vague Hint:** the imposter receives a deliberately indirect hint related to the secret word.
3. **Related Word:** the imposter receives a different but related word.

Regular players receive the same secret word.

The secret word must be selected from the chosen categories, and the selected hint must match that word.

## Voting and victory rules

- Every active player votes, including imposters.
- A player can submit only one vote per round.
- A player cannot vote twice by reopening the screen.
- Handle ties explicitly.
- Support configurable post-vote rules:
  - Reveal the outcome and end the round.
  - Eliminate the leading candidate and continue if appropriate.
- Define a deterministic rule for multiple imposters.
- Default imposter victory: the imposter wins if the voting outcome does not correctly identify and eliminate all required imposters.
- Make the exact victory conditions visible in the rules/settings screen.

## State management

Use a well-defined state machine rather than scattered UI booleans.

Suggested states:

`setup → role_reveal → discussion → voting → vote_result → round_result → next_round`

Support cancellation, restart, invalid-state prevention, and recovery from accidental navigation.

## Testing

Write unit tests for:

- Valid and invalid player counts.
- Imposter assignment.
- Secret word selection.
- Category restrictions.
- Duplicate voting.
- Vote ties.
- Elimination.
- Multiple imposters.
- Victory conditions.
- Score calculations.
- Restart and next-round transitions.

Never expose secret roles or words through public UI state, debug text, or unnecessary logs.

Stop after the engine and tests are working.

---

# PHASE 3 — Complete the playable game

Connect the game engine to the UI.

## Secret role reveal

Implement a pass-the-phone flow.

1. Display the current player's name.
2. Tell the player to keep the screen private.
3. Let them reveal their role.
4. Display the secret word to regular players.
5. Display the configured information to the imposter.
6. Let the player hide the information.
7. Pass the phone to the next player.
8. Repeat until all players have seen their role.

Support both reveal styles:

- Tap to reveal and tap to hide.
- Press and hold to reveal, releasing to hide.

Make the reveal style configurable in settings.

The role must be hidden before the next player receives the phone. Avoid accidental visibility during navigation, browser restoration, or screen transitions.

## Discussion

- Show the discussion timer if enabled.
- Provide a clear countdown.
- Allow the host to continue when the timer expires.
- If the timer is disabled, provide a manual continue button.
- Do not force players to enter discussion text.

## Voting

- Show eligible players.
- Record one vote per player.
- Provide a clear confirmation step.
- Prevent accidental duplicate submissions.
- Reveal the vote outcome only when the voting phase is complete.

## Results

Display:
- Vote totals.
- Ties, where applicable.
- Eliminated player, if any.
- Whether the imposter won.
- The secret word and role reveal.
- Round scores.
- Actions for `Play Again`, `Next Round`, and `Back to Home`.

## Multi-round sessions

- Track points across rounds.
- Allow configurable round count or manual continuation.
- Show a final leaderboard.
- Allow rematches using the same players and settings.

Test the full experience using 3, 4, 10, and 20 players.

Stop and report any unresolved gameplay issues.

---

# PHASE 4 — Settings, custom words, and persistence

Implement functional settings and local storage.

## Settings

Support:

- Player count and player names.
- Imposter count.
- Category selection.
- Imposter information mode.
- Discussion timer duration.
- Reveal interaction style.
- Voting and elimination mode.
- Multi-round score tracking.
- Skip current word.
- Change settings before each round.
- Restart game.
- Reset preferences.

## Custom word lists

Allow users to:

- Create custom categories.
- Add words and optional hints.
- Edit and delete entries.
- Import and export word lists as JSON.
- Enable or disable individual categories.
- Skip the current word without ending the game.

Validate imported JSON and provide readable error messages. Never overwrite existing custom lists silently.

## Persistence

Persist locally:

- User preferences.
- Custom categories and word lists.
- Optional game statistics.
- Selected display preferences.

Use versioned storage and handle missing, outdated, or corrupted data gracefully.

Do not store actual player secrets unnecessarily after a round finishes.

The game must remain playable without signing in or connecting to a server.

Stop after testing persistence and settings.

---

# PHASE 5 — Add the complete word bank and categories

This phase is essential. Create the original word bank below in structured data files. Do not invent celebrity-name categories, actor nicknames, or direct answer-giving hints.

## Content rules

- Words and hints should feel like something college students would actually say.
- Hints should usually be one or two words.
- Hints should be indirect, funny, casual, and culturally recognizable.
- Avoid formal descriptions, dictionary definitions, and full sentences.
- Avoid simply repeating the answer.
- Avoid using the answer as a nickname or an obvious synonym.
- Include easy, medium, and hard difficulty levels.
- Keep word and hint text in separate fields.
- Every word must have a unique ID and category.
- Hints must not reveal the answer too directly.
- The examples below are the initial seed bank. Preserve them and add carefully reviewed entries if more content is needed.
- Do not claim this is the original reference app's word bank.

## Recommended data format

Each entry should follow this structure:

`{ id, word, hint, category, difficulty, tags }`

Create separate data files for the categories or a single well-organized TypeScript data module.

## Category 1 — Kerala slang and everyday culture

- Vayannoki — Roadside Romeo
- Ammavan — Unsolicited advice
- Naattukaar — CCTV network
- Chali — Cringe king
- Thallu — Unlimited edition
- Jaada — Fake celebrity
- Show off — Attention seeker
- Kuliru — Romantic weather
- Oola — Walking disaster
- Pani paali — Mission failed

## Category 2 — College life

- Bunk — Attendance suicide
- Mass bunk — Empty classroom
- Supply — Academic DLC
- Viva — Verbal execution
- Record book — Last-minute masterpiece
- Lab exam — Random panic
- Assignment — Copy-paste marathon
- Backlog — Unfinished business
- Proxy — Attendance jugaad
- Internal marks — Lecturer's mercy

## Category 3 — Food and bakery

- Porotta — Layered addiction
- Beef fry — Gym enemy
- Pazhampori — Chaya partner
- Puttu — Breakfast tower
- Kappa — Fish curry's bestie
- Unniyappam — Temple snack
- Kozhukkatta — Sweet surprise
- Sulaimani — No-milk gang
- Shawarma — Midnight decision
- Lime juice — Summer saviour

## Category 4 — Memes and viral trends

- Rickroll — Internet trap
- Sigma male — Lone wolf edit
- Skibidi — Brainrot anthem
- NPC — Scripted human
- Troll — Comment-section warrior
- Cringe — Second-hand embarrassment
- Viral reel — Fifteen-second fame
- Rage bait — Comment farming
- Delulu — Self-made reality
- Aura points — Imaginary respect

## Category 5 — Places in Kerala

- Kozhikode — Halwa capital
- Thrissur — Pooram town
- Kochi — Traffic simulator
- Alappuzha — Boat-life
- Munnar — Blanket weather
- Wayanad — Weekend escape
- Kannur — Theyyam land
- Malappuram — Football fever
- Palakkad — Heat chamber
- Thiruvananthapuram — Capital scene

## Category 6 — Everyday objects

- Umbrella — Monsoon shield
- Pressure cooker — Whistle machine
- Mosquito bat — Night weapon
- Extension box — Socket shortage
- Charger — Lifeline
- Earphones — Public isolation
- Ceiling fan — Summer MVP
- Plastic chair — Function VIP
- Water bottle — Hydration prop
- Remote control — Family battlefield

## Category 7 — Politics and public life

- Election — Promise season
- Campaign — Loudspeaker marathon
- Hartal — Unexpected holiday
- Manifesto — Wish list
- Press meet — Question dodge
- Assembly — Shouting arena
- Poster campaign — Wall takeover
- Road inauguration — Ribbon moment
- Political debate — Everyone yelling
- Opinion poll — Guessing contest

Keep political humour playful and non-defamatory. Do not present unverified allegations about real people as facts.

## Category 8 — Relationships and friendship

- Best friend — Free therapist
- Crush — Eye-contact Olympics
- Situationship — Undefined subscription
- Friendzone — Emotional waiting room
- Ex — Archived chapter
- Wingman — Romance manager
- Green flag — Keeper material
- Red flag — Run, bro
- Third wheel — Uninvited passenger
- Ghosting — Sudden disappearance

## Category 9 — Tricky everyday words

- Tea — Evening gossip
- Coffee — Deadline fuel
- Rain — Umbrella emergency
- Thunder — Sky's bass boost
- River — Flowing waterbody
- Lake — Still water
- Bus — Route roulette
- Train — Platform panic
- Hotel — Food destination
- Restaurant — Menu confusion

## Category 10 — Sports and games

- Football — Ninety-minute drama
- Cricket — Tea-break sport
- FIFA — Controller rage
- Penalty — Goalkeeper's gamble
- Offside — Linesman's headache
- Hat-trick — Three-piece flex
- VAR — Replay police
- Red card — Early shower
- Last-minute goal — Heart attack
- Golden boot — Striker's trophy

## Category 11 — Famous and popular Malayalam movies

This category contains movie titles only. Do not add a celebrity or actor-name category. The hints must evoke a plot, situation, iconic element, or general movie vibe without simply repeating the title.

### Movie words and hints

- Pulival Kalyanam — Wedding mess
- Joji — Property
- Drishyam — Evidence gone
- Manichitrathazhu — Locked room
- Premam — Three stages
- Bangalore Days — Cousin gang
- Aavesham — College rowdies
- Romancham — Spirit board
- Kumbalangi Nights — Family chaos
- Lucifer — Power game
- Thudarum — Taxi trouble
- Neram — Wrong timing
- Mumbai Police — Missing memory
- Memories — Case files
- Anjaam Pathiraa — Midnight killer
- Traffic — Race against time
- Ustad Hotel — Beachside biryani
- Charlie — Missing artist
- Maheshinte Prathikaaram — Revenge slippers
- Android Kunjappan — Robot appachan
- Home — Tech family
- Nna Thaan Case Kodu — Court case
- Jana Gana Mana — College controversy
- Nayattu — Political pressure
- Kurup — Fake identity
- Rorschach — Revenge obsession
- Kishkindha Kaandam — Missing bullets
- Ela Veezha Poonchira — Hill mystery
- Bramayugam — Black and white
- Manjummel Boys — Guna cave
- 2018 — Flood rescue
- Aadujeevitham — Desert survival
- Minnal Murali — Local superhero
- Thallumaala — Chain reaction
- Premalu — Hyderabad crush
- Super Sharanya — Engineering hostel
- June — School memories
- Hridayam — College romance
- Thanneer Mathan Dinangal — School crush
- Niram — Bestie confusion
- Chronic Bachelor — Commitment issues
- Punjabi House — Fake identity
- In Harihar Nagar — Bachelor gang
- Godfather — Family rivalry
- Ramji Rao Speaking — Phone scam
- Kilukkam — Tourist trouble
- Nadodikattu — Gulf dreams
- Sandesham — Political family
- In Ghost House Inn — Haunted mansion
- CID Moosa — Detective comedy
- Vettam — Suitcase trouble
- Meesha Madhavan — Village thief
- Thenmavin Kombath — Village rivalry
- Vietnam Colony — Land trouble
- Spadikam — Ray-ban mass
- Narasimham — Courtroom mass
- Ayyappanum Koshiyum — Ego clash
- Driving Licence — Fan versus star
- Classmates — Reunion secrets
- Oru Vadakkan Veeragatha — Chandu's story
- Devasuram — Feudal attitude
- Kireedam — Broken dreams
- Thoovanathumbikal — Rain romance
- Ee.Ma.Yau. — Funeral chaos
- Sudani from Nigeria — Football family
- Vellimoonga — Election tricks
- Aadu — Goat gang
- Aadu 2 — Goat trouble
- Kalyanaraman — Wedding chaos
- Two Countries — Visa marriage
- My Boss — Office romance
- Udayananu Tharam — Fake superstar
- 4 the People — Campus rebels
- Big B — Revenge squad
- Puthiya Mukham — Campus transformation
- Twenty:20 — Star-studded showdown

### Movie content quality requirements

1. Keep both `Famous Malayalam Movies` and `Popular Malayalam Movies` as selectable labels if useful, but do not duplicate entries unnecessarily.
2. Organize movie entries into these groups where appropriate:
   - Classics and cult favourites.
   - Comedy and family entertainers.
   - Romance and coming-of-age.
   - Thrillers and mysteries.
   - Action and mass entertainers.
   - Recent popular movies.
3. A movie can belong to multiple groups through tags without duplicating the actual word entry.
4. Review hints for directness. For example, `Aadu — Goat gang` is preferable to a character's name.
5. Do not invent plot details just to create a hint. If a hint is questionable, flag it for review rather than asserting false information.
6. Allow custom hints and custom words to override the bundled content locally.
7. Provide difficulty labels:
   - Easy: widely recognizable association.
   - Medium: plot, setting, or memorable situation.
   - Hard: indirect reference requiring more knowledge.
8. Include an internal content review script or test that checks IDs, empty fields, duplicate entries, and missing hints.

### Category-selection UI

- Display categories as clean, selectable cards.
- Show category name and word count.
- Support selecting multiple categories.
- Include Select All and Clear All.
- Do not allow starting a game with zero usable words.
- Show a warning if a selected category has too few usable entries.
- Add category descriptions without overcrowding the screen.

### Word selection

- Randomly choose from enabled categories.
- Avoid using the same word repeatedly in a session where possible.
- Skip Word should select a new valid word without changing player roles or ending the round.
- Make sure the imposter's hint, if any, corresponds to the currently selected word.
- Do not expose the complete word bank to players during a round.

### Content testing

Test that:
- Every entry has a unique ID.
- Every entry has a non-empty word, hint, and category.
- Category filters work correctly.
- Word selection respects enabled categories.
- Skip Word works.
- Custom entries integrate with built-in entries.
- Word and hint are not accidentally displayed before role reveal.

Stop and report the number of valid entries per category.

---

# PHASE 6 — Offline support, accessibility, and final polish

Make the application robust enough for real parties.

## Offline support

- Add a service worker and PWA manifest.
- Cache the application shell and required local assets.
- Bundle the built-in word bank locally.
- Make offline gameplay work after the initial successful load.
- Ensure the application can reopen without an internet connection.
- Do not make the core game depend on an API or authentication service.

Do not cache private multiplayer data in public caches if online mode is added later.

## Responsive design

Test:
- Small phones.
- Large phones.
- Tablets.
- Desktop browsers.
- Portrait and landscape layouts.

Ensure buttons are easy to tap, text is readable, and secret roles cannot be exposed by layout overflow.

## Accessibility and UX

- Keyboard navigation.
- Accessible labels.
- Visible focus states.
- Adequate contrast.
- Reduced-motion support.
- Clear validation and error messages.
- Confirmation before destructive actions.
- Recovery from accidental refreshes where safe.

## Final QA

Run all unit tests, relevant integration tests, and the production build.

Test complete games with:
- 3 players and 1 imposter.
- Larger groups with multiple imposters.
- Every imposter information mode.
- Different category combinations.
- Timer enabled and disabled.
- Tied votes.
- Elimination mode.
- Multi-round scores.
- Custom words.
- Skip Word.
- Corrupted local storage.
- Offline reload after caching.

Fix real errors before declaring the phase complete.

Stop and provide a concise QA report.

---

# PHASE 7 — Deployment and handoff

Deploy the offline-capable version only after Phase 6 is complete.

## Deployment

Use Cloudflare Pages or another suitable free static hosting provider.

- Configure the correct build command.
- Set the build output directory to `dist`.
- Configure SPA routing correctly.
- Confirm direct navigation and refresh work.
- Verify the deployed site loads on mobile.
- Test offline operation after a successful initial load.

Do not put secrets in client-side source code or commit `.env` files.

## Documentation

Create or update:

- `README.md`
- `PRODUCT_SPEC.md`
- `IMPLEMENTATION_PLAN.md`
- `PROGRESS.md`
- `TEST_PLAN.md`

Include setup instructions, local development commands, build commands, test commands, deployment instructions, known limitations, and the custom word-bank format.

Do not claim deployment is complete unless the deployment actually succeeded and the deployed site was verified.

Stop and report the live URL if one exists.

---

# PHASE 8 — Optional online multiplayer

Do not begin this phase until the offline game is complete, tested, and deployed.

Evaluate Supabase or another suitable backend for optional online rooms.

Potential features:
- Create room.
- Join with room code.
- Online player list.
- Server-controlled game state.
- Private role assignment.
- Voting and results.
- Disconnect and reconnect handling.
- Room expiration and cleanup.

### Security requirements

- Never broadcast all secret roles or the secret word to every player.
- Send each player only the information that player is allowed to see.
- Validate votes and state transitions on the server.
- Prevent duplicate votes and unauthorized state changes.
- Use proper access controls and row-level security where applicable.
- Room codes are identifiers, not sufficient authorization on their own.
- Do not expose backend service-role keys in the frontend.
- Keep offline play fully functional if the online service is unavailable.

Write and test the security model before building the multiplayer UI.

---

# Rules for working across all phases

1. Finish only the requested phase.
2. Read `PROGRESS.md` before resuming work.
3. Preserve existing working functionality.
4. Keep the word bank in structured data files, not scattered across UI components.
5. Separate game logic from UI.
6. Use reusable components and consistent types.
7. Prefer small, reviewable changes.
8. Run the relevant tests and build before declaring completion.
9. Update documentation and progress after each phase.
10. Report completed work, tests actually run, failures, and remaining tasks.
11. If context or credits run low, stop at a coherent checkpoint and update `PROGRESS.md`.
12. Ask for my approval before moving to the next phase.

## Definition of done

The project is complete when a group of 3–20 people can configure a game, secretly view their roles, discuss, vote, see the outcome, play additional rounds, track scores, choose categories, use custom words, and replay the game on a polished mobile-friendly interface that works offline after caching.

Begin with Phase 0 only.
