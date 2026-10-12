# EXTRA EXTREME — the sealed attic (tier id `ultra`)

The hardest floor of every district: 10 cases per district (110 total), 8×8 → 12×12.
The rules of the game don't change (N×N, one person per row and per column, scenario rule decides the killer).
What changes is the **clues**: nothing tells you where someone is. Everything tells you how people relate to
each other, to the furniture and to the rooms — and every case needs real chains of deduction.

## 1. Banned in this tier
No clue may mention a coordinate or the map's frame:
`row`, `notRow`, `col`, `notCol`, `corner`, `edge`, "top row", "left column", "row 3", "along the outer edge".
No clue may on its own pin a person to a single cell, a single row or a single column (checked by the generator).

## 2. Clue families (new predicates marked ★)

| Family | Example sentences (player-facing) |
|---|---|
| Witness sight | "From where she stood, she could see Leonard — but not Ivy." · ★ "Exactly two people could see her." · ★ "Nobody could see him." |
| Company | "She shared a room with Arthur." · ★ "Her room was more crowded than Felix's." · ★ "He was the only one in his room standing on furniture." |
| Neighbours | "He and Margot were diagonal neighbours." · ★ "Nobody stood diagonally next to her." |
| Order | "He was somewhere north of Grace and west of Oliver." · "She stood between Daniel and Clara." |
| Distance | "She was exactly three steps from Henry." · ★ "He was closer to the piano than Vivian was." · ★ "She was the person closest to the fireplace." |
| Furniture | "She was beside a bin." · ★ "Every piece of furniture in his room was something you could sit on." · ★ "Her room had a piano but no bookshelf." |
| Rooms | ★ "He was in the largest room that had a fireplace." · ★ "Her room touched the Ballroom." · "He was never in the Cellar." |
| Conditionals ★ | "If she was in the Library, she was sitting down." · "If he could see the victim, he was standing on a rug." |
| Either/or | "She was either beside the piano or in the same room as Felix — not both." (exclusive or ★) |
| Negatives | "He was not beside any table." · "She couldn't see a single armchair." ★ |

Phrasing: written like testimony, varied, with names — "Leonard swears he spent the night by the piano.",
"Ivy remembers only the back of Margot's head." Each sentence must map 1:1 to a precise predicate; the help
modal explains "see" (clear sight line along a row, column or diagonal, blocked by blocking furniture; people don't block).

## 3. Difficulty contract (enforced by the generator)
Measured with the human-style deduction engine (filtering + row/column ownership + relational propagation + bounded what-if):
- **No free start:** after applying only unary clues + row/column rules to an empty board, no person may be fixed.
- **Depth:** solving requires ≥ 3 what-if (hypothesis) steps, at least one of depth 2, and ≥ 40% of all clues must be relational.
- **Every clue matters:** after minimisation each clue is necessary (removing it breaks uniqueness).
- **Interesting:** at least 3 different clue families per case, ≥ 2 ★ families, ≤ 1 either/or per person, ≤ 3 clues per person.
- Uniqueness verified by full search; Otto (Ask Otto) must still be able to explain the case end-to-end with what-if steps.
- Variants: classic, accomplice, lockedRoom, sniper, liar, double (`VARIANTS_BY_TIER.ultra`) — mixed so that ~half the cases are classic/accomplice and half have a twist.

## 4. UI
- Floor name: **The sealed attic**, tier label **Extra Extreme**, a distinct crimson-black badge with a skull-key glyph.
- First visit shows a short explainer card: "No coordinates. Read the room."
- XP ×2.2 base over Mastermind; achievements: *Attic Dweller* (solve 1), *Sealed Shut* (all 10 in a district), *No Coordinates Needed* (20), *Grand Attic* (all 110).
