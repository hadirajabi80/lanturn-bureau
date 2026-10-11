# تخته نرد — Takhte Nard

A 3D backgammon game with a Persian (RTL) UI — two players on one device, or one player against the computer.

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # rules self-test (cross-checked against brute force)
npx tsx src/engine/aitest.ts   # AI strength / timing check (levels play each other)
npm run build     # static build in dist/
```

- **Rules:** complete standard rules — bar entry, playing the maximum number of dice, larger-die rule, doubles, bearing off, mars (gammon) and full mars (backgammon), matches to 1/3/5/7 points.
- **Physics dice:** each throw is simulated in Rapier and recorded; a cube rotation makes the fair random result (`crypto.getRandomValues`) the face that lands on top. Dice sounds are synced to the actual physical impacts.
- **Animation:** every checker has a stable identity; arc flights, leaning into the motion, standing on edge in the tray, hits with sparks and a shockwave, and an animated board setup.
- **Computer opponent:** three levels (easy / medium / hard). Every distinct end-of-turn position is scored by a positional evaluation (pips, made points, primes, blot exposure to the next roll, bar, race efficiency); lower levels add noise. Runs in a Web Worker so animation never stutters. In self-play: hard beats medium ~61%, medium beats easy ~89%.
- **Controls:** tap/click to select and to move, drag and drop, double tap for a quick move; Space to roll, Enter to end the turn, Ctrl+Z to undo.
- **No image assets:** walnut, khatam inlay, leather, triangles and the rosette are all procedurally generated on canvas; sounds are synthesized with Web Audio.
- Auto-save and resume, three board themes, portrait mobile view (board rotates), optional board rotation for each player.

Plan: `docs/PLAN.md` · Rules: `src/engine/rules.ts` · AI: `src/engine/ai.ts` · Game director: `src/store/game.ts` · Scene: `src/scene/`
