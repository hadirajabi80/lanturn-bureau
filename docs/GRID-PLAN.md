# CRIME FILES — grid-placement puzzle mode (v1)

The main game mode. Reference: the mobile game shown in the user's screenshots (grid floor plan, rooms,
furniture, suspect carousel with clue sentences, Notes/Place/Erase/Hint tools, timer, seasons × tiers × 40 cases).
We build the same experience but **more polished and harder**: richer clue grammar, five killer rules,
line-of-sight deductions, procedurally generated cases with a **proven unique solution**, stars, daily case.

The existing narrative game (20 story cases) stays as "Story Cases", secondary entry on the landing page.

---

## 1. Rules of the puzzle

- The map is an **N×N** grid partitioned into named **rooms** (orthogonally connected regions of ≥ 3 cells, thick walls between rooms, label chip at the bottom of each room).
- **Furniture** sits on cells. Occupiable pieces (chair, armchair, sofa, rug, bed, stool, bench, bathtub) can be stood/sat ON; everything else (table, crate, barrel, bin, plant, bananas, piano…) **blocks** the cell. Every row and column keeps ≥ 2 free cells.
- There are exactly **N people** (N−1 suspects + the victim). **Exactly one person per row and exactly one per column** — a hard, always-on rule stated in the help. The solver, the deduction engine and the clue selector all use it, so very few clues are needed.
- Each suspect has 1–3 short **clue sentences** describing their position. The victim's only sentence is the killer rule: "The victim. {He} was alone with the killer." — i.e. the victim's room holds **exactly two people** (backed by the predicate `roomCount exactly 2`, a real constraint). The victim gets no position clues of their own unless no deducible clue set exists otherwise (≈ 1% of cases); they are pinned through everybody else.
- All clues + the row/column rule admit exactly **one** placement. After placing everyone, the player names the killer: **the one other person in the victim's room** (killer rule `aloneWithVictim`; the other rule types still compile but are never generated).
- Clue semantics (precise, implemented in `src/grid/engine/predicates.ts`):
  - "beside {furniture}" = orthogonally adjacent (4-neighbourhood). "on" = same cell as an occupiable piece.
  - "diagonally beside X" (`besidePerson`) = touching corner to corner — two people can never be orthogonal neighbours.
  - "top row" = row 0, "bottom row" = last, "left column" = col 0, "right column" = last. "row 3" = 1-based from the top in text (predicate stores 0-based).
  - "north of X" = smaller row index than X (any column). Similarly south/east/west. (`directlyDirOf`, `sameRowAs`, `sameColAs`, `between` need two people on one line, so they are never generated.)
  - "alone in the room" = no other person in the same room. "a room with exactly two people" counts self.
  - "line of sight" = same row, column or diagonal with no blocking furniture strictly between; people do not block. Between two people this is always a diagonal.
  - "corner" = one of the four grid corners. "edge" = any border cell. "steps" = Manhattan distance.
- Structural mistakes (two people in one row/column/cell, someone on blocking furniture) are reported by `checkPlacement` with clueIndex −1; `candidateCells` skips rows/columns already used.
- Hints: 5 per case. A hint reveals one unplaced (or wrongly placed) person's correct cell. Each hint costs a star threshold (see §5).

## 2. Difficulty ladder

Board size N (map N×N, N people) by case index within the 40-case tier — `gridSizeFor(tier, index)`:

| Tier | Sizes (case index) | Rooms | Furniture | Clue types | Clues/suspect | Deduction model |
|---|---|---|---|---|---|---|
| Easy | 4×4 (1–20) → 5×5 (21–40) | N−1 … N+1 (≥ 3 cells each) | ≈ 1.0–1.3 N | inRoom, onFurniture, besideFurniture, row/col, corner, notOn/notBeside furniture | 1–2 (avg ≈ 1.5) | filtering + row/col exclusion |
| Medium | 5×5 (1–20) → 6×6 (21–40) | N−1 … N+1 | ≈ 1.2–1.5 N | + notInRoom, edge, notRow/notCol, on/beside any furniture, occasional sameRoomAs / north-of | 1–2 | filtering + row/col exclusion + relational |
| Hard | 6×6 (1–15) → 7×7 (16–30) → 8×8 (31–40) | N−1 … N+1 | ≈ 1.4–1.7 N | + differentRoomFrom, diagonally beside, aloneInRoom, roomCount, distance, roomHasFurniture, corner/edge false | 1–3 | + shallow what-if (≤ 2–3 cells) |
| Extreme | 8×8 (1–10) → 9×9 → 10×10 → 11×11 (31–35) → 12×12 (36–40) | N−1 … N+1 | ≈ 1.5–1.9 N | + lineOfSight, or, roomSizeCmp; more relational chains | 1–3 (avg ≈ 1.9) | + what-if (≤ 3–4 cells) |

Killer rule in every tier: `aloneWithVictim`. Daily Case: tier by weekday; daily extreme uses 9×9–12×12 at random.
Par time: easy 90 s, medium 180 s, hard 300 s, extreme 480 s at the reference size (4.5 / 5.5 / 7 / 10 people), scaled by people count.
Measured (`npm run grid:test -- --all`, 847 cases): generation avg ≈ 1 ms (4×4) … 50 ms (10×10) … 185 ms (12×12); `countSolutions` ≤ 5 ms everywhere.

## 3. Generation (engine) — deterministic, seeded

`generatePuzzle(seasonId, tier, index): Puzzle` must be pure and deterministic from `seed = hash(seasonId, tier, index)`.
Pipeline:
1. **Rooms**: pick size; seed k room anchors; grow regions (random BFS) until the grid is partitioned; ensure every room ≥ 3 cells and connected; name & floor from theme.
2. **Furniture**: per room place 1–3 pieces from the theme pool; 2-cell pieces must lie inside one room; blocking pieces keep ≥ 2 open cells per room and ≥ 2 free cells in every row and column.
3. **Solution**: a random row→column permutation on free cells (biased onto occupiable furniture); pick a room holding exactly two people — one is the victim, the other the killer (resample otherwise).
4. **Clue candidates**: evaluate every predicate template against the solution → list of TRUE predicates per person (dozens). Filter out tier-disallowed types. Score each by "informativeness" (how many cells it eliminates) and by tier preference (hard tiers prefer relational clues).
5. **Clue selection**: greedy + randomness: start empty; repeatedly add the clue that most reduces the solver's solution count (or a random high-scoring one), until the solver reports exactly ONE solution. Then **minimize**: try removing each clue; keep removal if still unique. Guarantee every person has ≥ 1 clue (victim gets the killer-rule sentence only; the victim's position is itself constrained by others' clues — if the victim is unconstrained, add 1–2 clues for the victim too, phrased as "The victim was found…").
6. **Verify**: solver returns exactly one solution equal to the intended one; killer unique. If not, bump a retry counter into the seed and regenerate (deterministic).
7. **Title**: "The {a} {b}" from theme word pools, seeded. Names/avatars: from a pool of 24 characters (12 names each pronoun) with fixed AvatarSpecs, seeded pick.

**Solver** (`countSolutions(puzzle, clues, 2)`): candidate cells per person from unary predicates, sound propagation (row/column exclusion: a person confined to one row/column owns it, a row/column only one person can reach is theirs; relational arc consistency; room occupancy), then backtracking over people (MRV) with row/column exclusion, relational/global predicates checked once their people are placed, and row/column coverage pruning; early exit at 2. 12×12 in ≈ 1 ms typical, ≤ 5 ms worst.

Performance budget: `generatePuzzle` < 300 ms average for 12×12; memoize by id.

## 4. Clue text

Templates per predicate with pronoun substitution and variety (2–3 phrasings each, seeded), e.g.
- onFurniture(chair): "{He} was on a chair." / "{He} was sitting on a chair."
- notBesideFurniture(table): "{He} was not beside any table."
- row(0): "{He} was in the top row." · col(last): "{He} was in the right column." · row(2): "{He} was in row 3."
- sameRoomAs(X): "{He} was in the same room as X." · differentRoomFrom: "{He} was not in the same room as X."
- dirOf(X,'north'): "{He} was somewhere north of X." · directlyDirOf: "{He} was directly north of X."
- distance(X,'exactly',2): "{He} was exactly two steps from X." (Manhattan) · atMost: "…no more than two steps…"
- lineOfSight(X,true): "{He} could see X." / false: "{He} could not see X."
- between(A,B): "{He} was between A and B."
- or: "{He} was either on a rug or beside a plant."
- roomHasFurniture(piano,true): "{He} was in a room with a piano." · roomSizeCmp: "{He} was in the largest room." (only emit when unique)
Multiple clues for one person are joined as separate sentences in one paragraph, like the reference.

## 5. Stars, progress, seasons

- Solve → 1 star. ≤ 1 hint and under 2× par → 2 stars. 0 hints and under par → 3 stars.
- Progress persisted per puzzle id: `{ solved, stars, bestTimeMs, inProgress: PlacementState | null }`.
- Seasons (all generated, 4 tiers × 40 = 160 each): `files` "Crime Files" (mansion theme), `files2` "Crime Files 2" (market/town), `files3` "Crime Files 3" (ocean liner), `files4` "Crime Files 4" (museum), `files5` "Crime Files 5" (grand hotel). Plus **Daily Case** (seed = date, tier rotates) and **Hollowmere Academy** special season (academy theme, 40 cases, unlocked for free — no shop).
- Tier list screen shows the 40 cases with status NEW / IN PROGRESS / SOLVED (stars), header progress "n/40", and the size ramp indicator (e.g. "6×6 ────── 10").

## 6. UI (match the reference, then exceed it)

Screens (routes under `/files`):
- `/files` Seasons list (cards with icon, progress bar, %).
- `/files/:season` Choose difficulty (4 cards with icon, n/40, bar).
- `/files/:season/:tier` Case list (Pending/All filter, numbered rows, status, chevron).
- `/files/:season/:tier/:n` **Case screen**:
  - Top bar: back, help (rules modal), timer pill (pauses when hidden), undo, pause (overlay hides the board).
  - Board: square-ish grid filling width; rooms drawn with floor patterns + thick walls (2–3 px dark) between different rooms; room label chips; furniture SVGs; placed people as round avatar tokens; notes as tiny avatar dots in cell corners; selected suspect's clue-satisfying cells optionally highlighted when "assist" is on (settings; off by default).
  - Tools row: Notes · Place (default, dark) · Erase · Hint (badge with remaining count).
  - Suspect carousel: horizontally scrollable avatar chips with names, selected one outlined in orange; clue paragraph below; placed suspects show a small check.
  - Submit solution (enabled when everyone placed). Wrong → shake + "Something doesn't add up" + highlight the first violated clue's person (no penalty besides time). Right → killer phase: "Who is the killer?" pick from suspects → result sheet: CASE CLOSED stamp, time, stars with animation, confetti, Next case.
- Landing page gains a primary "Crime Files" button; the old game becomes "Story Cases".
- Mobile-first (390 px), also fine on desktop (board max 640 px, centered).

## 7. Ownership (parallel agents)

| Agent | Owns |
|---|---|
| Engine (Opus) | `src/grid/engine/**` (rng, hash, themes, names, predicates, text, solver, generator, index), `src/grid/engine/__tests__` via a `npm run grid:test` tsx script |
| Board/Art (Opus) | `src/grid/board/**` (Board, Cell, RoomLayer, Walls, FurnitureSprite + 30 SVG sprites, PersonToken, NoteDots) |
| Screens (Opus) | `src/grid/store.ts`, `src/grid/screens/**` (Seasons, Tiers, CaseList, CaseScreen, ResultSheet, HelpModal, PauseOverlay, ToolBar, SuspectBar, Timer), route wiring in `src/App.tsx`, landing button in `src/screens/Landing.tsx` |

Contracts: `src/grid/types.ts` plus
```ts
// engine/index.ts
export function generatePuzzle(seasonId: string, tier: Tier, index: number): Puzzle   // memoized
export function puzzleTitle(seasonId: string, tier: Tier, index: number): string       // cheap, no full gen
export function dailyPuzzle(dateISO: string): Puzzle
export function gridSizeFor(tier: Tier, index: number): number                       // board size N (N×N, N people) for case index; cheap, for the size ramp UI
export function checkPlacement(p: Puzzle, placements: Record<string, Cell|null>): { ok: boolean; violations: { personId: string; clueIndex: number }[] }
export function killerFor(p: Puzzle, placements: Record<string, Cell>): string | null
export function candidateCells(p: Puzzle, personId: string, placements: Record<string, Cell|null>): Cell[] // cells consistent with that person's own clues given current placements (for assist mode / hints)
export const SEASONS: Season[]
export const THEMES: Record<string, Theme>
// board/Board.tsx
export interface BoardProps { puzzle: Puzzle; placements: Record<string, Cell|null>; notes: Record<string, string[]>; selectedPersonId: string | null; tool: 'notes'|'place'|'erase'; highlightCells?: Cell[]; violations?: string[] /* personIds */; onCellTap: (cell: Cell) => void; className?: string }
export function Board(props: BoardProps): JSX.Element
```
