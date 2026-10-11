# Lantern Bureau — Enigmatic Crime Puzzle Cases

Twenty deduction cases in the fog-bound city of Greywick. Gather clues, catch lies by presenting evidence,
crack ciphers and timelines, then accuse — and prove it.

```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # integrity check of all 20 case files
npm run build      # static build in dist/
```

- Design & engineering plan: `docs/PLAN.md`
- Puzzle logic bible (spoilers): `docs/CASE-DESIGNS.md`
- Cast bible (spoilers): `docs/CHARACTERS.md`
- Content schema: `src/data/types.ts`

Stack: Vite · React 19 · TypeScript · Tailwind v4 · Framer Motion · Zustand. No backend, no image assets —
every portrait and scene is procedural SVG.
