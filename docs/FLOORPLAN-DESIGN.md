# FLOORPLAN MYSTERIES — v2 design brief (Lantern Bureau)

The grid-placement mode is rebuilt with an **original identity**. Nothing may look like the reference
mobile app anymore: no cream background, no folder-tab cards, no "Crime Files / Seasons / Choose difficulty"
wording, no rounded white tiles with a bottom-sheet suspect carousel, no "Notes / Place / Erase / Hint" row.
The rules stay (N×N plan, one person per row and column), everything else is ours.

## 1. Identity

**Name:** *Floorplan Mysteries* — a Lantern Bureau casebook. Route prefix `/plans`. The old `/files/*` routes redirect to `/plans`.

**Fantasy:** it is night at the Bureau. You sit at a drafting desk under a brass lamp. Case files arrive as
architectural floor plans of buildings around Greywick; every district is a building with its own drawing
style. You pin suspects' photographs onto the plan with brass pins, cross out impossible squares with a red
grease pencil, and stamp CLOSED when you are sure.

**Look:** dark, warm, cinematic. Page background is the district's `palette.bg` with a lamp-light radial
vignette that follows the cursor slightly, faint paper grain, and a subtle animated dust-mote layer.
Typography: Playfair Display (display), Inter (UI), JetBrains Mono (case numbers, times, codes).
Panels: `palette.panel` with 1px inner hairline in `accent` at 18% and soft shadows; corners 10 px (not 20).
Buttons: brass-plate style (gradient + engraved text) for primary, ghost outline for secondary.
Motion: everything enters with short staggered springs; page transitions are a horizontal "file slide";
stamps thud; pins drop with a tiny bounce; crosses are drawn as two strokes (stroke-dashoffset).

## 2. Information architecture & routes

| Route | Screen | Notes |
|---|---|---|
| `/plans` | **The Bureau** (hub) | Greywick night skyline made of the 8 districts' facades. Each facade's windows light up = solved cases. Hover/tap a building to see its card. Side rail: Today's case, Modes, Profile chip (rank + XP bar), Streak flame. |
| `/plans/d/:district` | **District** | Large procedural facade of the building, floors stacked bottom→top: Rookie (ground), Detective, Inspector, Chief, Mastermind (roof). Each floor shows progress and the variants it contains. An elevator indicator animates when you pick a floor. |
| `/plans/d/:district/:tier` | **Case rack** | A board of brass key tags (number, mono font, title on hover, size badge `7×7`, variant glyph, stars stamped once solved). Filters: All / Unsolved / Solved / Variant. Responsive grid (3 cols phone → 8 cols desktop). |
| `/plans/d/:district/:tier/:n` | **Case desk** | the play screen (§5). |
| `/plans/daily` | Today's case | rotating district & tier; streak. |
| `/plans/modes` | Modes | cards for Blitz, Gauntlet, Weekly Mastermind, Zen, Custom/Code. |
| `/plans/blitz` | Blitz | 3:00 countdown; small classic cases back-to-back; +time for clean solves. |
| `/plans/gauntlet` | Gauntlet | 7 cases of rising difficulty & variants, one wrong submit/accusation ends the run; no hints; best floor reached saved. |
| `/plans/weekly` | Weekly Mastermind | one giant 14×14 liarDouble per ISO week; global-feel leaderboard is local only (your best). |
| `/plans/zen` | Zen | random case of chosen tier, no timer, no stars, unlimited "Ask Otto". |
| `/plans/custom` | Custom & codes | builder (district, tier, size 4–14, variant, seed) + "enter case code". |
| `/plans/code/:code` | opens a case by code | |
| `/plans/profile` | Detective profile | rank, XP, stats, achievements, history. |

All levels are open (no unlock gating).

## 3. Districts (seasons) — each a different building

Data: `src/grid/skins/districts.ts` (palettes, layout, walls, sheet, facade, ambience). Summary:

| # | District | Layout | Walls | Sheet | Mood |
|---|---|---|---|---|---|
| I | Ashcombe Manor | organic | inked double line w/ hatch | aged parchment | candle & clock ticks |
| II | Harrow Point Docks | docks (thin water-edge rooms) | thick rope + bollards | nautical chart w/ depth lines | waves, gulls |
| III | The Gilded Meridian | corridor through the middle | gold Deco double rule, stepped corners | black lacquer | soft jazz |
| IV | Museum of Curiosities | wings (mirrored) | thick marble w/ shadow | gallery plaster | hush, footsteps |
| V | The Neon Quarter | blocks + alleys | glowing neon tubes (bloom) | wet asphalt w/ reflections | rain |
| VI | Hollowmere Academy | courtyard ring | chalk strokes | green chalkboard | distant bells |
| VII | The Midnight Express | carriages (horizontal bands) | riveted steel | brushed steel | rail rhythm |
| VIII | Frostmere Observatory | concentric rings | crisp blueprint lines w/ dimension ticks | blueprint blue | wind |

Every district: 30 Rookie, 30 Detective, 30 Inspector, 30 Chief, 10 Mastermind = **130 cases**, **1,040 total**.
Furniture is drawn per skin (e.g. a chair in the Neon Quarter is a chrome bar stool with a glow rim; in the
Academy it is chalk-outlined), from the same `FurnitureKind` set.

## 4. Scenarios (variants) — `Variant` in `src/grid/types.ts`

| Variant | Victim sentence (player-facing) | Accusation |
|---|---|---|
| classic | "The victim. {He} was alone with the killer." | name the killer |
| accomplice | "The victim. Two people were in the room with {him}: the killer stood closer." | name killer **and** accomplice |
| lockedRoom | "The victim. {He} was alone behind a locked door. The killer was the only person in a room next to {his}." | killer |
| poison | "The victim. The poison was in the {kind}. The killer was the only person beside one." | killer |
| sniper | "The victim. Only the killer had a clear line of sight to {him}." | killer |
| liar | "The victim. {He} was alone with the killer. One suspect is lying — every word." | killer (= the liar) |
| double | two victims, each "…alone with {his} killer." | two killers, matched to victims |
| liarDouble | double + one killer lies | both killers |
| accompliceLiar | accomplice + the accomplice lies | killer + accomplice |

Variant intro: the first time a player meets a variant, an animated "New scenario" card explains it with a mini plan.

## 5. Case desk (play screen) — original layout

**Desktop / tablet (≥ 900 px):** three zones on a dark desk.
- **Left rail — Dossier:** vertical stack of suspect *polaroids* (avatar, name, a tiny pin icon if placed, red X if you marked them as cleared). Selecting one slides out their **testimony slip** (typewriter font on paper, each sentence on its own line with a small checkbox the player can tick off). Victim(s) pinned at the top with a red string.
- **Centre — the Plan:** the floor plan sheet in the district's skin, lit by the desk lamp; slight 3D tilt on hover (≤ 2°).
- **Right rail — Instruments:** vertical tool column: **Pin** (place), **Pencil** (candidate note), **Grease pencil** (cross out — a red X for the selected person, or for everyone with Alt/long-press), **Rubber** (erase), then **Ask Otto** (explained hint), **Reveal** (place one suspect), **Undo/Redo**, timer (mono, brass), and the **CLOSE THE CASE** stamp lever at the bottom.
**Phone:** plan on top (fills width, pinch-zoom for ≥ 9×9), a horizontal "film strip" of polaroids under it, the selected testimony slip under that, and a bottom dock with the 4 tools + Otto + stamp. It must not look like the reference: dark desk, polaroids, paper slip, brass dock.

**Freedom & burning (user rule):** the desk NEVER blocks a move. You may pin two people in the same row or column, on top of a crossed cell, anywhere except on blocking furniture or a cell already holding someone. Mistakes are only judged when you pull the **CLOSE THE CASE** lever (or make the accusation): if the plan is wrong or the accusation is wrong, the case file **burns** — a full-screen burn animation (paper curls, embers, ash), sound, and the attempt is over: time and pins are lost, the case shows a scorch mark on its key tag, and you can **Reopen** it fresh (a burned attempt still counts in stats as a failure). Zen mode never burns (it just highlights the first contradiction). Gauntlet: a burn ends the run. Auto-cross stays an optional helper, off by default.

**Marks:** per cell per person — pins (placement), pencil notes, red X crosses. Option **Auto-cross** (settings): when you pin someone, auto-X their row & column for everyone else; when a person has a single uncrossed cell left, it pulses.

**Ask Otto (explained hint):** finds the next *logical* deduction from the current marks and explains it in one or two sentences in Otto's voice, highlighting the cells involved ("Hm. Only two squares in the Cellar are free of furniture, and row 3 is already taken. Margot must be at C5."). Costs a little; the old Reveal costs more. Engine API in §7.

**Accusation:** once everyone is pinned and consistent, the stamp lever unlocks → full-screen **Line-up**: suspects stand in a row under a spotlight; pick the killer (and accomplice / second killer, depending on variant); the wrong pick flickers the lights. Right → **CASE CLOSED** stamp on the plan, red string connects killer to victim, time, stars, XP gained, rank-up if any, achievements unlocked, **Replay** (a 6-second animated replay of your pins in order) and **Share** (case code + emoji grid of time/stars).

## 6. Progression & meta

- **XP & rank:** Constable → Sergeant → Detective → Inspector → Chief Inspector → Superintendent → Commissioner → Legend. XP by tier × stars × variant multiplier; first-solve bonus; daily bonus.
- **Stars:** 3 = no Reveal, ≤ 1 Ask Otto, under par. 2 = ≤ 1 Reveal, under 2× par. 1 = solved.
- **Streak:** daily case streak with flame; 14-day calendar on the profile.
- **Achievements (30):** e.g. First Pin, Clean Sweep (30 three-stars), Liar Liar (10 liar cases), Partners in Crime (10 accomplice), Double Trouble, Locked In, Poison Pen, Eagle Eye (10 sniper), Mastermind, Night Shift (00:00–05:00), Speed of Thought (< 50% par on 9×9+), No Pencil Needed, Gauntlet Survivor, Blitz 10, District Complete ×8, 1,000 cases…
- **Stats:** solves per tier/district/variant, best and average times, accuracy, 30-day activity chart.
- **Case codes:** `ASH-H-12`, `NEO-X-30`, `EXP-M-4`, `DAILY-20261011`, `WEEK-2026W41`, custom `C-<district3>-<tier1>-<size>-<variant>-<seed>`.

## 7. Engineering contracts

- Types: `src/grid/types.ts` (Tier now includes `mastermind`; `Variant`, `VARIANTS_BY_TIER`, `LayoutStyle`, `PlayMode`, `CellMarks`, Puzzle fields `variant, liarId, accompliceId, poisonKind, killerIds, victimIds, layout, skinId`).
- Skins: `src/grid/skins/types.ts`, `src/grid/skins/districts.ts` (`DISTRICTS`, `getDistrict`, `TIER_INFO`).
- Engine public API (`src/grid/engine/index.ts`), additions:
  ```ts
  generatePuzzle(districtId: string, tier: Tier, index: number): Puzzle        // districtId = DISTRICTS[i].id (also accepts legacy season ids)
  generateCustom(opts: { districtId: string; tier: Tier; size: number; variant: Variant; seed: number }): Puzzle
  gridSizeFor(tier: Tier, index: number): number
  variantFor(tier: Tier, index: number, seed?: number): Variant                 // cheap
  puzzleTitle(districtId, tier, index): string                                  // cheap
  dailyPuzzle(dateISO: string): Puzzle;  weeklyPuzzle(isoWeek: string): Puzzle  // weekly = 14×14 liarDouble
  checkPlacement(p, placements): { ok: boolean; violations: { personId: string; clueIndex: number }[] }
  checkAccusation(p, accusation: { killers: string[]; accomplice?: string; pairs?: Record<string /*victimId*/, string /*killerId*/> }): boolean
  candidateCells(p, personId, placements): Cell[]
  parseCode(code: string): { kind: 'case' | 'daily' | 'weekly' | 'custom'; puzzle: () => Puzzle; label: string } | null
  codeFor(p: Puzzle): string
  // explain.ts
  nextDeduction(p, state: { placements: Record<string, Cell|null>; crosses: Record<string, string[]> }):
     { kind: 'place' | 'cross'; personId: string; cells: Cell[]; reasonCells: Cell[]; text: string } | null
  ```
- Board (`src/grid/board`): `Board` props gain `skinId: string`, `marks: CellMarks`, `crossesVisibleFor: string | 'all'`, `accusationLines?: { from: string; to: string }[]` (red strings after solving), `lampFollow?: boolean`. Skin rendering lives in `src/grid/board/skins/**` (walls, sheet, floors, label plates, frame per WallStyle/SheetStyle). Sprites: `src/grid/board/sprites/**` gain a `skin` prop to restyle per district.
- Store (`src/grid/store.ts`, key `floorplan-v2`, migrate progress from `crime-files-v1` by mapping old season ids `files→ashcombe, files2→harrow, files3→meridian, files4→curiosities, files5→neon, academy→hollowmere` and dropping indices > 30).
- Meta (`src/grid/meta/**`): separate persisted store `bureau-profile-v1`; `recordSolve(result: SolveRecord)` returns `{ xpGained, rankUp?, achievements: Achievement[] }`.
- Audio (`src/grid/audio/**`): `ambience.play(id)`, `ambience.stop()`, `sfx2.pin() cross() pencil() stamp() lever() spotlight() otto()` — synthesized, respects mute.

## 8. Ownership for the build (parallel agents)

| Agent | Owns |
|---|---|
| Engine | `src/grid/engine/**` except `explain.ts`; `docs/GRID-PLAN.md` |
| Otto (explain) | `src/grid/engine/explain.ts` + its test (uses only exported engine API) |
| Skin renderer | `src/grid/board/**` except `sprites/**` |
| Sprites | `src/grid/board/sprites/**` |
| Hub & design system | `src/grid/ui/**`, `src/grid/screens/hub/**`, `src/App.tsx`, `src/screens/Landing.tsx` |
| Case desk & modes | `src/grid/store.ts`, `src/grid/screens/desk/**`, `src/grid/screens/modes/**` |
| Meta | `src/grid/meta/**` |
| Audio & PWA | `src/grid/audio/**`, `public/**`, `index.html`, `vite.config.ts`, `src/pwa/**` |

Old `src/grid/screens/*.tsx` and `src/grid/components/**` are legacy: the desk agent may reuse code from them but the
final app must not route to them; the integrator deletes them at the end.
