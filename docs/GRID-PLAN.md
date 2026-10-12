# FLOORPLAN MYSTERIES — engine rules (v2)

Grid-placement logic cases for the Lantern Bureau. Identity, screens and modes: `docs/FLOORPLAN-DESIGN.md`.
This file is the engine contract (`src/grid/engine/**`, types in `src/grid/types.ts`).

---

## 1. Core rule

- An **N×N** plan partitioned into named **rooms** (orthogonally connected, ≥ 3 cells each).
- **Furniture**: occupiable pieces (chair, armchair, sofa, rug, bed, stool, bench, bathtub) can be stood/sat on; every
  other kind **blocks** its cell and sight lines. Every row and column keeps ≥ 2 free cells.
- **N people** (suspects + victim(s)), **exactly one per row and per column**.
- Clues + the scenario rule admit exactly **one** placement (summed over every liar hypothesis), and a human can find it
  by deduction: the generator certifies each case with a deduction engine (unary filtering, row/column exclusion,
  relational arc consistency, room-occupancy + scenario-rule reasoning, bounded what-if probing on people with ≤ k cells).
- Clue semantics: `predicates.ts` (single source of truth). "beside furniture" = orthogonally adjacent; "diagonally
  beside" a person = corner-touching; "north of X" = smaller row index; "steps" = Manhattan; "line of sight" = same
  row/column/diagonal with no blocking furniture strictly between (people never block — between two people it is always
  a diagonal).

## 2. Scenarios (`Variant`, semantics in `engine/rules.ts`)

| Variant | Rule on positions | Culprits |
|---|---|---|
| classic | victim's room holds exactly 2 | killer = the other one |
| accomplice | victim's room holds exactly 3; the two others are at different Manhattan distances | killer = closer, accomplice = farther |
| lockedRoom | victim alone in a room; exactly one person in the rooms sharing a wall with it | killer = that person |
| poison | `poisonKind` present ≥ 2×; exactly one person orthogonally beside a piece of it; the victim is not beside one | killer = that person |
| sniper | exactly one suspect has a clear sight line (diagonal) to the victim | killer = that person |
| liar | classic + exactly one suspect's sentences are ALL false; the liar is the killer | killer (= liar) |
| double | two victims, each room holds exactly that victim + one killer (different rooms) | killerIds[i] ↔ victimIds[i] |
| liarDouble | double + one of the two killers is the liar | both killers |
| accompliceLiar | accomplice + the accomplice is the liar | killer + accomplice |

- **Liar worlds** (`worlds.ts`): one solver world per suspect L — L's sentences negated, everyone else's true, plus "L is
  the killer / one of the killers / the accomplice". A valid case has exactly one solution over all worlds; the
  deduction engine must *solve* the true world and reach a *contradiction* in every other one ("assume X lies → …").
  The liar always has ≥ 2 sentences, each the exact negation of a true fact (`negatePred`), jointly satisfiable, so a
  lie is never self-evident.
- The victim's first clue is the rule sentence (brief §4); `isKillerRuleClue` / `ruleClueIndex` find it.
- Schedule (`variantFor(tier, index, seed?)`, deterministic, same in every district): Rookie always classic;
  Detective 1–5 classic, lockedRoom from 6, poison from 11; Inspector 1–3 classic, then lockedRoom/poison/accomplice
  (6)/sniper (9), **liar from 16**; Chief: accomplice/sniper/poison/liar, **double from 16**; Mastermind:
  liar/double/liarDouble/accompliceLiar (3+). Classic(-like) share ramps from ~55 % to ~25 % along a tier.

## 3. Ladder

| Tier (display) | Cases | Sizes (case index) | Rooms | Clues / suspect | Probe depth |
|---|---|---|---|---|---|
| easy (Rookie) | 30 | 4 (1–15) → 5 | N−1 … N+2 | 1–2 | none |
| medium (Detective) | 30 | 5 (1–10) → 6 (11–20) → 7 | N−1 … N+2 | 1–2 | 0 → 2 |
| hard (Inspector) | 30 | 7 (1–10) → 8 (11–20) → 9 | N−1 … N+2 | 1–3 | 2 → 3 |
| extreme (Chief) | 30 | 9 (1–8) → 10 (9–16) → 11 (17–24) → 12 | N−1 … N+2 | 1–3 | 3 → 4 |
| mastermind | 10 | 12 (1–4) → 13 (5–7) → 14 (8–10) | N−1 … N+3 | 1–3 | 4 |
| ultra (Extra Extreme) | 10 | 8, 9, 9, 10, 10, 11, 11, 12, 12, 12 | N−1 … N+2 | 1–3 | depth 2 (§7) |

11 districts × 140 = 1,540 cases. Daily: district = day mod districts, tier by weekday (Sun Chief, Mon Rookie, Tue
Detective, Wed Inspector, Thu Detective, Fri Inspector, Sat Chief), size random within the tier range. Weekly: 14×14
liarDouble (Mastermind) per ISO week. Custom: any district/tier/variant, size 4–14 (clamped up to the variant minimum:
sniper/liar/double 5, liarDouble/accompliceLiar 6).

## 4. Layout styles (`engine/layouts.ts`, district `layout`)

organic (free region growth) · corridor (one 1-wide hallway through the middle, rooms on both sides) · carriages
(horizontal bands 1–2 rows, 2–4 compartments each; one 3-row car when an accomplice room is needed) · wings (mirrored
left/right wings around a central hall column, hall may be split) · courtyard (central square ringed by rooms; caps or
pinwheel ring) · docks (1–2 one-wide piers along an edge + organic warehouses) · blocks (rectangular blocks split by
1-wide alley rooms) · rings (concentric square rings of width 1–2, each 2–4 arcs, centre room). Structural rooms get
role names (`ROLE_NAMES`: corridor / hall / pier / alley / center). If a style cannot carve a size the carver falls back
to organic and `puzzle.layout` says so.

## 5. Generation pipeline (`engine/generator.ts`)

seed = hash(district, tier, index, attempt) → rooms (carver) → furniture (poison forces a kind twice) → placement
realising the scenario (`placeRoles`, verified by `rules.ts`) → candidate clues (true facts; liar candidates restricted to
plainly negatable facts) → greedy selection by propagation → minimisation with full deduction (probing) → top-up
(every suspect ≥ 1 clue, liar ≥ 2) → liar variants: add clues until every wrong liar world contradicts → exhaustive
uniqueness check. Failed attempts bump the seed. Memoised per id.

Measured (`npm run grid:test`, tsx): avg ≈ 2 ms (5×5), 20 ms (9×9), 110 ms (12×12), 180 ms (13×13), 370 ms (14×14);
solver avg ≤ 6 ms, max ≈ 18 ms.

## 6. Public API (`engine/index.ts`)

```ts
generatePuzzle(districtId, tier, index): Puzzle      // also legacy ids files…files5/academy; memoised
generateCustom({ districtId, tier, size, variant, seed }): Puzzle
dailyPuzzle(dateISO), weeklyPuzzle('2026-W41'), isoWeekOf(dateISO)
gridSizeFor(tier, index), variantFor(tier, index, seed?), puzzleTitle(districtId, tier, index)   // cheap
checkPlacement(p, placements) → { ok, violations[{ personId, clueIndex }] }   // never throws; -1 = structural
checkAccusation(p, { killers, accomplice?, pairs? }) → boolean
culpritsFor(p, placements), killerFor(p, placements), candidateCells(p, personId, placements)
codeFor(p) / parseCode(code) → { kind, puzzle(), label }   // ASH-I-12, DAILY-20261011, WEEK-2026W41, C-ASH-I-9-liar-42
countSolutions(p, clues?, limit?) → { count, first?, liarId? }, puzzleWorlds(p), deduceWorlds(p, probeMax)
SEASONS (derived from DISTRICTS), THEMES
```

Puzzle v2 fields: `variant, killerIds, victimIds, liarId?, accompliceId?, poisonKind?, layout, skinId (= district id)`.
`killerId = killerIds[0]`. The liar is never flagged in clue data; only `liarId` tells.

District codes: ASH HAR MER CUR NEO HOL EXP FRO ROS LAC CAN (new districts default to their first three letters).
Tier letters R D I C M U (U = Extra Extreme); parsing also accepts legacy E / H / X (M always means Mastermind, X legacy extreme).
Extra Extreme extras: `difficultyReport(p)` (families, ★ families, relational %, what-if count / depth-2 count, clue
count, contract `ok` + `problems`), `deduceDeep`, `gradedSolve`, `searchMAC`, `ULTRA_K1/K2`, `BANNED_ULTRA`, `STAR_TYPES`.

## 7. Extra Extreme (tier `ultra`, docs/EXTRA-EXTREME.md)

- Ladder: `variantFor('ultra', i)` = classic, accomplice, sniper, classic, lockedRoom, accomplice, liar, classic, double,
  sniper (seeded daily/custom: 50 % classic/accomplice). Code letter **U** (`ASH-U-3`).
- New predicates (types.ts, semantics in predicates.ts; global revisers shared by solver + Otto in `engine/extra.ts`):
  seeCount, seenByNobody, crowdedThan, onlyOnFurnitureInRoom, noDiagonalNeighbour (count-type / room-bound globals);
  closerToKindThan (binary); roomAllOccupiable, roomHasButNot, largestRoomWith, roomTouches, canSeeKind / cannotSeeKind
  (unary); ifThen, xor, and (compound). "See a piece" = a cell of that kind in clear sight along a row, column or diagonal
  (blocking furniture strictly between blocks; the piece stood on does not count). Distances to furniture = steps to
  the nearest cell of that kind.
- Never generated: row / notRow / col / notCol / corner / edge (and `or` — the tier uses `xor` "not both"). No single
  sentence may pin a person to one cell, row or column on an empty board.
- Deduction engine: propagation + depth-1 what-if on people with ≤ K1 = 8 cells + depth-2 what-if (trial pin on a person
  with ≤ K2 = 6 cells; refuted when some person with ≤ K1 cells then has no workable square). Liar cases: refuting a
  wrong "X is the liar" reading counts as one what-if, one level above the deepest step it needs.
- Pipeline additions: ★ candidates → greedy → minimise (depth-1, k = 3) → liar collapse (deep engine) → **every clue
  necessary**: a clue the deep engine can do without is dropped; every remaining clue must be shown necessary for
  uniqueness by a MAC search over every liar reading (true solution tried first, then randomised restarts) — a clue the
  case stays unique without but the engine still needs fails the attempt → no free start → `gradedSolve`: ≥ 3 what-if steps, ≥ 1 of depth 2 →
  (non-liar cases) suspects left without a sentence receive a symmetric fact someone else carried (re-owned) and compatible pairs merge into
  one `and` sentence ("could see Leonard, but not Ivy") → ≥ 40 % relational facts, ≥ 3 families, ≥ 2 ★ families, ≤ 3
  sentences and ≤ 1 xor/ifThen per person, ≤ ⌈n/4⌉ uses of one predicate type → `difficultyReport` re-check.
- Safety net: attempts ≥ 90 (of 130) relax the depth / necessity requirements; no shipped case uses it.
- Measured (`grid:test -- --all`, tsx, one core): see the "Extra Extreme generation" table — 8×8 ≈ 0.5 s, 12×12 median
  ≈ 2–2.5 s, liar 11×11 the slowest (several seconds); the desk generates in a worker behind the lantern loader.
- Text: `TextCtx.tier = 'ultra'` switches to named testimony templates (≥ 3 per predicate, seeded).
- Otto: new globals explained in room-count style ("Nobody could see Margot; she's at D4, so …"); when the basic
  techniques and the bounded what-if stall, a solver-backed what-if (depth 1 on anyone, then depth 2: "If Felix stood at
  C3, Ivy would be stuck …") — exactly the generator's certificate, so Otto never stalls on a valid board.

