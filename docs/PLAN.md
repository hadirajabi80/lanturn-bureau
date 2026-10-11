# LANTERN BUREAU — Enigmatic Crime Puzzle Cases
### Product & Engineering Plan (v1.0)

> You are the Rookie, newest detective at the Lantern Bureau in the fog-bound city of **Greywick**.
> Twenty case files sit on your desk. Five are warm-ups. Five will make you think. Five will make you sweat.
> The last five were drawn by someone who calls themselves **The Cartographer** — and the final map leads home.

---

## 1. Vision

A browser game of **pure deduction**. No dice, no timers, no grinding. Every case is a self-contained
puzzle with a unique, provable answer. The player gathers clues from illustrated scenes, interrogates
suspects, catches lies by **presenting evidence against statements** (Ace-Attorney style), solves
embedded mini-puzzles (ciphers, timelines, logic grids), then **accuses** and **proves it**.

Tone: witty neo-noir. Warm, funny recurring cast; distinctive suspects; tragic-elegant finale.
Presentation: cinematic animation everywhere — but never between the player and the logic.

### Difficulty ladder (20 cases)

| Tier | Cases | Suspects | What's new | Prove-it questions |
|---|---|---|---|---|
| Easy | 1–5 | 3 | one clear contradiction; tutorial of each mechanic | 3 |
| Medium | 6–10 | 4 | two-step inference, one red herring, timelines, mirror/time tricks | 3 |
| Hard | 11–15 | 5 | frame-ups, false confessions, innocent liars, 1 mini-puzzle | 4 |
| Extreme | 16–20 | 5–6 | The Cartographer arc, 2 mini-puzzles per case, cross-case clues, insider twist | 4–5 |

Scoring per case starts at **1000**: −100 wrong accusation, −60 wrong prove-it answer, −80 per hint,
−10 wrong press (min 0 per category). Rank: S ≥ 950, A ≥ 800, B ≥ 600, C otherwise. Cases unlock
sequentially; a tier's badge is awarded when all 5 are solved.

---

## 2. Stack decision

**Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Zustand (persist) + React Router 7.**

Why not Next.js/Angular/Node/Go/.NET: the game is 100% client-side (content is static data, progress is
local). A server adds deploy cost, latency and nothing the player sees. Vite gives the fastest dev loop and
a static `dist/` that deploys anywhere (Vercel, Netlify, GitHub Pages, nginx). If online leaderboards are
ever wanted, a tiny Go or Node service can be added without touching the client architecture.

Other libraries: `lucide-react` (icons used as scene props & clue icons), `canvas-confetti`, `clsx`.
No image assets: **all art is procedural SVG/CSS** (avatars, scenes, effects) so the repo stays tiny and
every character can be generated from an `AvatarSpec`.

---

## 3. Architecture

```
C:\Game
├─ docs/                 PLAN.md, CHARACTERS.md, CASE-DESIGNS.md
├─ index.html
├─ package.json, vite.config.ts, tsconfig.json
├─ src/
│  ├─ main.tsx, App.tsx (router + global providers), index.css (tailwind + tokens)
│  ├─ data/
│  │  ├─ types.ts            ← THE CONTRACT (already written)
│  │  ├─ bureau.ts           ← recurring cast (already written)
│  │  ├─ cases/case01.ts … case20.ts   each `export const case01: CaseFile`
│  │  └─ index.ts            ← `export const CASES: CaseFile[]` + helpers (getCase, tierOf)
│  ├─ engine/
│  │  ├─ store.ts            Zustand store: progress (persisted) + active-case session state
│  │  ├─ scoring.ts          score/rank math (pure)
│  │  ├─ validate.ts         dev-time integrity checker for case data (ids, references, answers)
│  │  └─ audio.ts            Web-Audio synthesized SFX (blip, reveal, contradiction, success) — no assets
│  ├─ components/
│  │  ├─ avatar/Avatar.tsx   parameterized SVG portrait from AvatarSpec (+ Mood, size, animated blink)
│  │  ├─ scene/SceneView.tsx illustrated gradient backdrop + lucide silhouettes + pulsing hotspots + spotlight cursor
│  │  ├─ fx/                 Typewriter, ContradictionFlash ("OBJECTION"-style shatter), Fog, Confetti, PageTransition, GlowCard, Stamp
│  │  ├─ ui/                 Button, Panel, Tabs, Modal, Toast, ProgressRing, Badge
│  │  └─ game/               EvidenceDrawer, StatementCard, PressModal, PuzzleCode, PuzzleOrder, PuzzleGrid, AccuseBoard, ProveIt
│  └─ screens/
│     ├─ Landing.tsx         cinematic title, fog, lantern, "Open the files"
│     ├─ CaseSelect.tsx      20 case cards grouped by tier, locks, ranks, badges
│     ├─ CaseIntro.tsx       briefing + opening dialogue (typewriter)
│     ├─ Investigation.tsx   tabs: Scenes | Suspects | Evidence | Puzzles | Accuse
│     ├─ Verdict.tsx         accusation result, prove-it chain, solution, closing dialogue, rank reveal
│     └─ Codex.tsx           characters gallery + solved-case archive
```

### State (Zustand)
```ts
progress: { [caseId]: { solved: boolean; score: number; rank: 'S'|'A'|'B'|'C'; hintsUsed: number } }  // persisted
session: {   // per active case, also persisted so refresh doesn't lose progress
  caseId; foundClues: string[]; readStatements: string[]; brokenStatements: string[];
  solvedPuzzles: string[]; hintsUsed: number; wrongAccusations: number; wrongProveIt: number; wrongPresses: number;
  phase: 'intro'|'investigate'|'accuse'|'prove'|'solved'
}
```

### Game loop (Investigation screen)
1. **Scenes** — click hotspots → clue added with a "stamp" animation + sound. Flavor hotspots give jokes.
2. **Suspects** — pick a suspect → avatar + greeting → statements appear one by one (typewriter).
   Each statement has **Press** (present a clue). Correct clue → `ContradictionFlash`, statement
   marked broken, `pressReply` typed out, optional clue revealed. Wrong clue → `wrongPressReply`, −10.
   Statements with `revealOnRead` add a testimony clue as soon as they're read.
3. **Evidence** — drawer of found clues with kind icons; examine for `detail`.
4. **Puzzles** — gates. Code: text input (normalize: lowercase, strip spaces/punctuation, compare to `answers`).
   Order: drag-and-drop list (Framer Motion `Reorder`). Grid: click cells to mark ✓/✗; "Check" compares to `solution`.
5. **Accuse** — enabled only when all puzzles solved. Pick a suspect. Wrong → their `accusedWrong`, −100,
   stay in investigation. Right → `accusedRight` → **Prove It** chain of multiple-choice questions
   (wrong → −60 + explanation shown, continue). Then solution text, closing dialogue, rank reveal with confetti.
6. **Hints** — 3 progressive hints per case (−80 each) in a lantern button.

---

## 4. Visual identity & animation spec

- **Palette**: ink `#0B0E14`, fog `#1A2030`, paper `#F3E9D2`, brass `#D4A857`, lantern `#FFB347`,
  crimson `#C8323C`, teal `#2EC4B6`. Each case has its own `palette.from/to/glow` used on its card & scenes.
- **Type**: display "Playfair Display" (headings, case titles), body "Inter", mono "JetBrains Mono" for ciphers/logs — via Google Fonts.
- **Landing**: full-screen fog layers (CSS/SVG animated), swinging lantern casting a radial light that follows the mouse, title letters fall in with stagger; "Open the files" button hums.
- **Case select**: cards fan in with stagger; hover tilts (3D perspective), glow in case palette; locked cards show a padlock that rattles on click; tier badges.
- **Briefing**: paper document slides in with a stamp "CASE FILE Nº 07" (Stamp component: scale 1.6→1 with slight rotation and a thud).
- **Dialogue**: speaker avatar bobs on speak; typewriter text; mood changes brows/mouth of the Avatar.
- **Scenes**: parallax layers moving with the mouse; hotspots pulse; found hotspot gets a brass pin.
- **Contradiction**: screen shake 300 ms, red flash, text "CONTRADICTION!" slams in, glass-shard particles, statement card cracks.
- **Clue found**: card flips into the evidence drawer; drawer badge bounces.
- **Accusation**: spotlight narrows onto the chosen suspect; drumroll (synth). Wrong → spotlight snaps off. Right → gold confetti.
- **Rank reveal**: letter stamps in, counts up score with spring.
- **Reduced motion**: honour `prefers-reduced-motion` (Framer `useReducedMotion`).
- Responsive: desktop-first but fully usable at 390 px (tabs collapse to bottom bar).

---

## 5. Content contract (summary of `src/data/types.ts`)

- `Character.id` must be **globally unique** (prefix with case: `c07-mireille`). Bureau ids: `otto`, `quill`, `nia`, `hestia`, `lucien`, `pip`, `you`.
- Every `contradictedBy`, `revealClueId`, `hotspot.clueId`, `puzzle.revealClueId` must reference a clue in the same case.
- Every clue must be reachable: `initial`, a hotspot, a statement reveal, or a puzzle reveal.
- `culpritId` must be a suspect's character id. `proveIt[].correct` must be an option id.
- Code answers: at least 3 accepted spellings. Order/grid solutions must be uniquely determined by the given clues.
- `engine/validate.ts` enforces all of this at startup in dev and in `npm run validate`.

---

## 6. Work breakdown (parallel agents)

| Agent | Model | Scope (owns these paths only) |
|---|---|---|
| Writers W1–W4 | Fable | `src/data/cases/case01-05`, `06-10`, `11-15`, `16-20` from `docs/CASE-DESIGNS.md` |
| Engine | Opus | `src/engine/*`, `src/data/index.ts`, `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/screens/*`, `src/components/ui/*`, `src/components/game/*` |
| Art | Opus | `src/components/avatar/*`, `src/components/scene/*` |
| FX | Opus | `src/components/fx/*`, `src/engine/audio.ts` |
| Integrator | Opus | wires everything, `npm run build`, `npm run validate`, browser QA, fixes |

Interface contracts between agents are the exported component props documented in §7.

---

## 7. Component contracts (for parallel work)

```ts
// components/avatar/Avatar.tsx
export interface AvatarProps { spec: AvatarSpec; size?: number; mood?: Mood; speaking?: boolean; className?: string }
export function Avatar(props: AvatarProps): JSX.Element

// components/scene/SceneView.tsx
export interface SceneViewProps {
  scene: Scene; foundClueIds: string[];
  onHotspot: (h: Hotspot) => void;   // engine handles clue add + flavor toast
  className?: string
}
export function SceneView(props: SceneViewProps): JSX.Element

// components/fx
export function Typewriter({ text, speed = 18, onDone, className }: { text: string; speed?: number; onDone?: () => void; className?: string })
export function ContradictionFlash({ show, onDone }: { show: boolean; onDone?: () => void })
export function Fog({ intensity = 0.5 }: { intensity?: number })             // absolute, pointer-events none
export function Stamp({ text, show, color }: { text: string; show: boolean; color?: string })
export function PageTransition({ children }: { children: React.ReactNode })   // wraps route element
export function GlowCard({ glow, children, className, onClick }: ...)
export function Spotlight({ x, y, radius }: { x: number; y: number; radius: number }) // radial overlay
export function fireConfetti(kind: 'solve'|'rank'): void

// engine/audio.ts
export const sfx: { blip(): void; reveal(): void; contradiction(): void; wrong(): void; success(): void; stamp(): void; drumroll(): void; setMuted(m: boolean): void }
```

---

## 8. Acceptance criteria

1. `npm run build` passes with zero TypeScript errors; `npm run validate` reports 20 valid cases.
2. Every case is completable: all clues reachable, every contradiction findable, puzzles solvable with given text, culprit provable.
3. Progress survives refresh; "Reset progress" exists in settings.
4. Landing → Case Select → Intro → Investigation → Verdict flows with page transitions; no console errors.
5. Lighthouse-level sanity: first load < 1.5 MB JS gzipped; 60 fps animations on a laptop.
6. Works at 390 px width.
7. All text in English; UI copy witty but clear. Keyboard: Esc closes modals, Enter submits codes.

---

## 9. Later (not in v1)
Farsi (RTL) localization layer, online leaderboard (Go), daily-case mode, accessibility audit with screen reader, achievements, PWA offline.
