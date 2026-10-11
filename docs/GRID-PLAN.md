# CRIME FILES — grid-placement puzzle mode (v1)

The main game mode. Reference: the mobile game shown in the user's screenshots (grid floor plan, rooms,
furniture, suspect carousel with clue sentences, Notes/Place/Erase/Hint tools, timer, seasons × tiers × 40 cases).
We build the same experience but **more polished and harder**: richer clue grammar, five killer rules,
line-of-sight deductions, procedurally generated cases with a **proven unique solution**, stars, daily case.

The existing narrative game (20 story cases) stays as "Story Cases", secondary entry on the landing page.

---

## 1. Rules of the puzzle

- A grid (rows × cols) is partitioned into named **rooms** (orthogonally connected regions, thick walls between rooms, label chip at the bottom of each room).
- **Furniture** sits on cells. Occupiable pieces (chair, armchair, sofa, rug, bed, stool, bench, bathtub) can be stood/sat ON; everything else (table, crate, barrel, bin, plant, bananas, piano…) **blocks** the cell.
- Each **person** (suspects + one victim) occupies exactly one free cell (no two people share a cell).
- Each person has 1–3 **clue sentences** describing their position. The victim's sentence states the **killer rule**.
- All clues together admit exactly **one** placement. After placing everyone, the player names the killer; the killer is the unique person satisfying the rule relative to the victim.
- Clue semantics (precise, implemented in `src/grid/engine/predicates.ts`):
  - "beside" = orthogonally adjacent (4-neighbourhood). "on" = same cell as an occupiable piece.
  - "top row" = row 0, "bottom row" = last, "left column" = col 0, "right column" = last. "row 3" = 1-based from the top in text (predicate stores 0-based).
  - "north of X" = smaller row index than X (any column); "directly north of X" = same column and smaller row. Similarly south/east/west.
  - "alone in the room" = no other person in the same room. "a room with exactly two people" counts self.
  - "line of sight" = same row or column with no blocking (non-occupiable) furniture between them; people do not block.
  - "between A and B" = same row (or column) as both, strictly between.
  - "corner" = one of the four grid corners. "edge" = any border cell.
- Hints: 5 per case. A hint reveals one unplaced (or wrongly placed) person's correct cell. Each hint costs a star threshold (see §5).

## 2. Difficulty ladder

| Tier | Grid | People | Rooms | Furniture | Clue types | Clues/person | Killer rule |
|---|---|---|---|---|---|---|---|
| Easy | 4×4–5×5 | 3–4 (+victim) | 3–4 | 4–6 | inRoom, onFurniture, besideFurniture, row/col, corner | 1–2 | aloneWithVictim |
| Medium | 5×5–6×6 | 4–5 | 4–5 | 6–9 | + notInRoom, sameRoomAs, besidePerson, edge, dirOf | 1–2 | aloneWithVictim / besideVictim |
| Hard | 6×6–7×7 | 5–6 | 5–6 | 8–12 | + differentRoomFrom, sameRowAs/ColAs, directlyDirOf, aloneInRoom, roomCount, distance, not-* | 2–3 | + closest / sameRowOrCol |
| Extreme | 7×7–8×8 | 6–8 | 6–8 | 10–16 | + lineOfSight, between, or, roomHasFurniture, roomSizeCmp | 2–3, fewer direct clues | + lineOfSight |

Within a tier, difficulty ramps with the index (case 1 of 40 is gentler than case 40): larger grids and more people as index grows.
Par time: easy 90 s, medium 180 s, hard 300 s, extreme 480 s (scaled by people count).

## 3. Generation (engine) — deterministic, seeded

`generatePuzzle(seasonId, tier, index): Puzzle` must be pure and deterministic from `seed = hash(seasonId, tier, index)`.
Pipeline:
1. **Rooms**: pick size; seed k room anchors; grow regions (random BFS) until the grid is partitioned; ensure every room ≥ 3 cells and connected; name & floor from theme.
2. **Furniture**: per room place 1–3 pieces from the theme pool; 2-cell pieces must lie inside one room; ensure at least `people + 2` free (non-blocked) cells overall and ≥ 1 free cell per room.
3. **Solution**: place people on distinct free cells, ensuring the killer rule yields a **unique** killer (resample otherwise).
4. **Clue candidates**: evaluate every predicate template against the solution → list of TRUE predicates per person (dozens). Filter out tier-disallowed types. Score each by "informativeness" (how many cells it eliminates) and by tier preference (hard tiers prefer relational clues).
5. **Clue selection**: greedy + randomness: start empty; repeatedly add the clue that most reduces the solver's solution count (or a random high-scoring one), until the solver reports exactly ONE solution. Then **minimize**: try removing each clue; keep removal if still unique. Guarantee every person has ≥ 1 clue (victim gets the killer-rule sentence only; the victim's position is itself constrained by others' clues — if the victim is unconstrained, add 1–2 clues for the victim too, phrased as "The victim was found…").
6. **Verify**: solver returns exactly one solution equal to the intended one; killer unique. If not, bump a retry counter into the seed and regenerate (deterministic).
7. **Title**: "The {a} {b}" from theme word pools, seeded. Names/avatars: from a pool of 24 characters (12 names each pronoun) with fixed AvatarSpecs, seeded pick.

**Solver** (`solve(puzzle, clues) => Cell[][] | count`): backtracking over people with constraint propagation: for each person compute candidate cells from unary predicates (inRoom, row, furniture…), order people by fewest candidates, assign, check binary/global predicates incrementally, count solutions with early exit at 2. Must handle 8×8 with 8 people in < 30 ms typical.

Performance budget: `generatePuzzle` < 150 ms on a laptop for extreme; memoize by id.

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
export function checkPlacement(p: Puzzle, placements: Record<string, Cell|null>): { ok: boolean; violations: { personId: string; clueIndex: number }[] }
export function killerFor(p: Puzzle, placements: Record<string, Cell>): string | null
export function candidateCells(p: Puzzle, personId: string, placements: Record<string, Cell|null>): Cell[] // cells consistent with that person's own clues given current placements (for assist mode / hints)
export const SEASONS: Season[]
export const THEMES: Record<string, Theme>
// board/Board.tsx
export interface BoardProps { puzzle: Puzzle; placements: Record<string, Cell|null>; notes: Record<string, string[]>; selectedPersonId: string | null; tool: 'notes'|'place'|'erase'; highlightCells?: Cell[]; violations?: string[] /* personIds */; onCellTap: (cell: Cell) => void; className?: string }
export function Board(props: BoardProps): JSX.Element
```
