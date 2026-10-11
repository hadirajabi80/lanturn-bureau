# CHARACTERS — the Lantern Bureau cast bible

> Spoilers for the whole game, including the finale. Writers and designers only.

## Design language

Every character in the game is drawn by one procedural SVG component from an `AvatarSpec`
(skin, hair style & colour, eyes, brows, mouth, accessory, facial hair, outfit colour, accent glow, age).
Rules of thumb for memorable silhouettes:

- **One signature accessory per character** (monocle, headphones, bandana…). Never two.
- **Outfit colour = personality**: brass/gold for vanity, teal for intellect, crimson for danger, lilac for warmth.
- **Accent glow** is the character's "aura" behind the portrait and on their dialogue plate. Suspects within a case must have distinct accents.
- **Mood** (neutral, happy, angry, surprised, smug, sad, thinking) is applied at runtime from dialogue lines — write dialogue with mood changes in mind.
- Voice lines are short. Personality lives in *how* they lie, not in paragraphs.

---

## The Bureau (recurring)

### Rookie — `you`
The player. 27, newest detective. Speaks rarely and dryly; taps a pencil twice before writing a name. Wears the lilac scarf Hestia knits in Case 01 for the rest of the game (this matters in Case 20: the wool fibre is not decisive, because everybody owns one).

### Chief Inspector Ottoline "Otto" Marsh — `otto`
58. Grey, gruff, tie slightly loose, tea stirred exactly three times. Says **"Hm."** before every verdict. Economical praise ("Not bad.") is the highest honour in the Bureau. Joined in 1989; as a 23-year-old constable she arrested Tobias Vane on evidence that turned out to be forged. She has never spoken about it. Case 20 makes her.

### Dr. Felix Aurelio Quill — `quill`
44. Forensic scientist. Curly auburn hair, round glasses, goatee, cream lab coat, teal aura. Treats every fibre as a character in a play ("Well, hello, little rosin."), misquotes Shakespeare on purpose, is always technically right. **Left-handed** ("my left hand is the honest one") — this clears him in the finale.

### Nia Okonkwo-Reyes — `nia`
29. Data & digital analyst. Braids, headphones, teal jacket, violet aura. Three energy drinks, two fingers, impossible typing speed. Finds any timestamp in under a minute, then makes a database pun. Born 1997 — she had to look up the pre-1998 file numbering. She was in Lisbon the night of *Tide Tables*.

### Mrs. Hestia Vane — `hestia`
71. Archivist. Soft grey bun, glasses, lilac cardigan. Calls everyone "dear"; remembers every date; knits lilac scarves for the whole Bureau; still types index cards on a 1962 Remington whose lowercase *e* sits low. **She is The Cartographer.** Her brother Tobias Vane was convicted in 1991 (file GB-1991-0417) for the Lantern Street arson on forged expert evidence and died in prison in 1994. She joined the archive in 1992 to find out why. Thirty years later she draws maps that lead detectives to the people who did it: Kessler (forged the evidence), Crane (paid the witnesses), Judge Whitlock (took the bribe), Councillor Ashgrove (ordered the fire). She never keeps anything she takes. Her tell: she goes quiet and offers tea.

### Lucien Delacroix-Hart — `lucien`
38. Rival private detective. Slick black hair, bowtie, stubble, smirk, burgundy coat, crimson aura. Polishes a pocket watch he never reads; corrects grammar; is annoyingly right about exactly one thing per case. Never allowed past the Bureau kettle — which is why he can't be the Cartographer (the Case 19 note knew the briefing-room plan).

### Pip — `pip`
Bureau cat. Cream with grey-brown points, red collar. Sits on evidence, knocks one clue card over per case, solves nothing, is beloved. Final shot of the game: Pip asleep on Hestia's knitting.

---

## Tier casts (summary — full data lives in `src/data/cases/`)

| # | Case | Culprit | Memorable suspects |
|---|---|---|---|
| 01 | The Vanishing Macaron Tower | Rupert Ashcombe-Pell, critic with coulis on his white glove | Teodor (apologises to furniture), Ines (lactose intolerant) |
| 02 | Darkness at the Dome | Gus Tremonte, custodian who "saw" in total darkness | Prof. Adaeze, Milo (scared of the dark) |
| 03 | Dry as a Bone | Hugo Brandt, agent with a bone-dry umbrella | Delphine ("fake emeralds, darling"), Marcus the flyman |
| 04 | Five Cups, Four Sleepers | Agnes Trellaway, whose blue-willow cup stayed full | Bart the jittery bookseller, Saoirse the barefoot poet |
| 05 | The 4:15 to Hollowmere | Priya Venkataraman, who rode a cancelled train | Stanley the rhyming busker, Dermot who quotes timetables |
| 06 | Intermission | Kasimir Dufresne, cellist with a violin-sized secret | Bram the conductor, Yevgenia the icy pianist, Ottilie on headset |
| 07 | The Locked Greenhouse | Mireille Saint-Clair, who swapped the orchid in daylight | Fenwick (Latin grumbles), Dr. Tobias Hurst (sneezes), Jojo (films everything) |
| 08 | The Dog That Wasn't There | Colin Hartigan, who heard a dog that was in the park | Jake the gamer nephew (red herring), Edna who hears footsteps |
| 09 | Zugzwang | Ferdinand Oyelowo-Marsh, who analysed a Sicilian that was a French | Nikolai (hates the French), Wendy (16, won), Beatrix the blogger |
| 10 | The Mirror Clock | Simeon Brightwater, whose selfie told the time backwards | Anouk (vapes), Ingeborg (stern), Dante (observant caterer) |
| 11 | The Planted Scarf | Percival Dunmore, manager with the master key and a dry scarf | Ingrid (framed), Caspian & Thea (innocent liars), Honoré (airtight) |
| 12 | The Harrow Point Lamp | Rhys Pengelly, apprentice who slept through a lamp that failed before the horn | Ailsa ("clear as gin"), Teddy (looked back), Cornelius the paymaster |
| 13 | Five Masks, One Vault | Vikram Sethi-Lancaster, Room 3, with a drone | Lady Octavia (even numbers only), Capt. Mallory (knee), Sister Perpetua, Coralie (high C) |
| 14 | Dead Letter | Lotte Vandermeer, fob 2 at the pier at 21:52 | Winifred "Heron" (framed), Felix the cipher hobbyist, Barnaby the gossip |
| 15 | The Confession | Josef Lindqvist — his sister Marguerite confessed for him | Coach Dunstan, Tamsin the treasurer, Lucky Len who paints windows shut |
| 16 | The First Map | Oona Blackwood, blackmailed registrar | Alderman Kessler (exposed forger), Pavel the guard, Benedikt at the dock |
| 17 | Tide Tables | Maren Holt, anchored off the cove at low water | Silas Crane (victim/villain), Rev. Pym (logs sins), Yusuf the customs officer |
| 18 | The Mirror Twins | Castor Marlowe — left-handed, unbandaged | Pollux (right hand burned, covering), Judge Whitlock, Halloran the tipsy guest |
| 19 | The Clockmaker's Paradox | Elspeth Marr, who set the study clock 15 minutes fast | Julian (innocent liar, four hours not five), Agnieszka (trusts clocks), Lucien (darts) |
| 20 | The Cartographer | Hestia Vane | Otto, Quill, Nia, Lucien |

---

## The Cartographer's signature
A hand-drawn map of Greywick in sepia ink, a compass rose **missing its north point** — a vane without a north.
Notes are typed on a Remington with a dropped *e*. Ciphers escalate: grid-reference acrostic (16), Atbash (17), riddle (18), time (19), acrostic poem (20).
The maps never point to the stolen thing. They point to the person who should be ashamed.
