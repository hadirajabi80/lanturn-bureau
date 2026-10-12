# Floorplan Mysteries — "Printed case file" UI (v3)

QA feedback on v2: "the UI has a strong AI vibe". v3 replaces the lamp-lit brass night desk with a flat,
printed puzzle-book look. **The floor-plan boards (src/grid/board/**) and the facade illustrations keep
their art.** Everything around them (pages, panels, buttons, text, the desk chrome) follows this sheet.

## Look

- **Paper and ink.** Page `#F1F1EC` (neutral, never cream/yellowish) with a faint graph-paper grid; cards are
  white with a **2px ink border** (`#141414`), corners 6–8px.
- **One accent: red** `#D7261E` (primary buttons, the current item, the victim, mistakes).
  **Highlighter yellow** `#FFD84D` marks what is selected / new / important, like a marker on paper.
  Blue `#2350D8` only for pencil notes and links. Green `#1E8A4C` only for "solved".
- **District colour** (`--fp-district`) is an identity swatch only: a stripe, a tab, a dot next to the
  building's name. Never a background wash, never a glow.
- **Hard offset shadows** (`3px 3px 0 #141414`) only on things you can press (primary buttons, case cards).
  Pressing moves the element into its shadow. Static panels have a border and no shadow.

## Type

- Headings: **Archivo** 800–900, tight tracking (-0.02em). Big titles may use the condensed width
  (`font-stretch: 75%`) in caps, like a newspaper headline.
- Body/UI: **IBM Plex Sans** 400/500/600, 15–16px body, never below 12px.
- Numbers only: **IBM Plex Mono** (case codes, timers, counts, grid sizes).
- Sentence case everywhere. Small labels are 12–13px semibold muted text, **not** letter-spaced caps.

## Banned (these are what read as "AI-made")

- Radial glows, lamp vignettes, bloom, glowing text-shadows, dust/particles, shimmer text, gradient fills
  on buttons/chips/text, glassmorphism and `backdrop-blur`.
- Letter-spaced uppercase mono "eyebrows" (`tracking-[0.2em]+ uppercase font-mono text-[10px]`).
- Em dashes in UI copy, marketing tone ("Step into…", "Unleash…"), decorative emoji.
- Idle pulsing / breathing / hum animations. Motion is feedback only: press, pin drop, cross stroke,
  stamp thud, page slide. Keep it short (≤ 250 ms) and springy, not floaty.
- Grids of identical soft-shadowed rounded cards with an icon in a circle on each.
- An icon on every label. Use icons where they carry meaning (tools, back, settings).

## Do

- Left-aligned layouts with clear hierarchy, numbered steps, tables and rules (`1px #D9D9D2`) like a
  printed booklet. Section titles can carry a short ink underline or a red index number.
- Selected state = yellow highlighter fill + ink border. Disabled = grey `#C9C9C3` fill, grey text.
- Focus ring: `outline: 3px solid #2350D8; outline-offset: 2px`.
- Write copy like a puzzle book: short, concrete, a little dry. "Pin everyone. Then name the killer."

## Tokens (set by `<SkinProvider>` on `.fp-root`)

| Var | Value | Use |
| --- | --- | --- |
| `--fp-bg` | `#F1F1EC` | page |
| `--fp-panel` | `#FFFFFF` | cards |
| `--fp-ink` | `#141414` | text, borders |
| `--fp-muted` | `#5E5E5A` | secondary text |
| `--fp-accent` / `--fp-hi` | `#D7261E` | primary, current |
| `--fp-accent2` | `#A51A14` | red text on white, pressed red |
| `--fp-hl` | `#FFD84D` | highlighter |
| `--fp-blue` | `#2350D8` | notes, links, focus |
| `--fp-green` | `#1E8A4C` | solved |
| `--fp-danger` | `#D7261E` | victim, errors |
| `--fp-hair` | `#D9D9D2` | rules, light borders |
| `--fp-hair-strong` | `#141414` | ink borders |
| `--fp-shadow` | `3px 3px 0 #141414` | pressable things |
| `--fp-glow` | `#D7261E` | legacy name; do not use for glows |
| `--fp-district`, `--fp-district-bg` | district accent / bg | identity swatch only |
| `--fp-sheet`, `--fp-wall` | district | board only |

Classes in `src/grid/ui/fp.css`: `fp-panel` (`--inset`, `--glow` = emphasised), `fp-brass` (primary
button, red), `fp-ghost` (secondary, white outlined), `fp-chip`, `fp-plate` (label tag), `fp-filament`
(progress bar), `fp-keytag` (case card), `fp-display` (headline). Component names stay the same so
existing screens keep working (`BrassButton` is now the red primary button).
