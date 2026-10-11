# CASE DESIGNS — the 20 puzzles (author: Fable)

This document is the **logic bible**. Writer agents expand each design into `src/data/cases/caseNN.ts`
following `src/data/types.ts`. The deduction logic below is final and must not be altered; prose,
flavor hotspots, extra truthful statements, jokes and personality may be added freely.

Global rules for writers:
- Character ids: `cNN-firstname` (e.g. `c07-mireille`). Bureau ids: `otto`, `quill`, `nia`, `hestia`, `lucien`, `pip`, `you`.
- Every clue must be reachable (initial / hotspot / statement reveal / puzzle reveal). Every `contradictedBy` must point at a clue the player can obtain **before** needing it.
- Each suspect: 3–4 statements. The culprit has 2–3 contradictable statements; innocents may have one innocent lie where the design says so.
- Each case: 2–4 scenes, each with 3–6 hotspots (at least one flavor-only joke hotspot).
- `openingDialogue` 5–8 lines (bureau banter + briefing), `closingDialogue` 4–8 lines. Hestia-related plants are marked **[PLANT]** and must appear verbatim in spirit.
- `hints`: 3 progressive (nudge → pointer → near-answer).
- Code answers: normalized comparison (lowercase, strip non-alphanumerics), so list variants.
- Prose style: witty neo-noir, short paragraphs, no gore (thefts, frauds, sabotage — nobody dies).

Recurring world: city of **Greywick** (foggy, canals, trams, brass lanterns). Bureau HQ on Lantern Street.
Newspaper: *The Greywick Gazette*. Hospital: St. Jude's. Pub: The Hanged Man. Neighbouring towns: Hollowmere, Dunmere, Harrow Point, Saltmarsh.

---

## EASY TIER

### Case 01 — "The Vanishing Macaron Tower"  (easy · tutorial)
**Location** Pâtisserie Sucré, Lantern Street · **Time** 7:00–7:30 AM · **Victim** Margaux Delaroux (owner; appears in dialogue, not a suspect).
**Crime** Competition macaron tower stolen from the walk-in fridge two hours before the Greywick Bake-Off.
**Suspects**
- `c01-teodor` Teodor Vasquez-Lind, 22, apprentice. Nervous, sweet, apologizes to furniture. Curly dark hair, flour-white apron.
- `c01-ines` Ines Farrow, 35, flour delivery driver. Blunt, gum-chewing, time-obsessed (big watch). Ponytail, cap.
- `c01-rupert` Rupert Ashcombe-Pell, 61, food critic. Pompous, long camel coat, white gloves, monocle, bowtie. **CULPRIT.** Motive: secretly owns 30% of rival bakery Maison Dorée.
**Scenes** Kitchen (stove, walk-in fridge, back door), Alley (van, flour sacks), Front shop (bench, newspaper, Rupert's gloves).
**Clues**
- `coulis-pot` (physical, kitchen): raspberry-cardamom coulis started 6:45 per Teodor's prep sheet; made only for the competition, never served, never left the kitchen.
- `fridge-handle` (physical): coulis smear on fridge handle (Teodor admits fetching cream at 7:00 — innocent; fixes the window: tower present at 7:00).
- `crumbs` (physical): pistachio crumbs from fridge toward back door.
- `van-clipboard` (document, alley): Ines's unloading log "07:05 start".
- `newspaper` (document, front): Bake-Off page with "Maison Dorée" circled, on the bench where Rupert sat.
- `white-glove` (physical, front, zoom on Rupert): faint pink-red smear on left glove fingertips.
- `long-coat` (testimony; revealOnRead from Ines S2): "Someone in a long coat at the back door, 7:10."
- `lab-smear` (forensic; revealed by breaking Rupert S2): Quill confirms glove smear = raspberry-cardamom coulis, not jam.
- `maison-doree` (digital; revealed by breaking Rupert S3): Nia: company registry shows Rupert owns 30% of Maison Dorée.
**Statements**
- Teodor: S1 at stove from 6:45, coulis burns if you blink (true). S2 fetched cream 7:00, tower was there (true). S3 back to the door all morning, saw nobody.
- Ines: S1 unloading from 7:05, see clipboard. S2 back door opened a crack at 7:10, long coat → `revealOnRead: long-coat`. S3 "Me, steal a cake? I'm lactose intolerant."
- Rupert: S1 "Arrived 7:25, sat on the bench. A critic is punctual." contradictedBy `long-coat` → "A coat is a coat. Half of Greywick owns one." (no reveal). S2 "I have never been past the counter. I would not sully my gloves in a working kitchen." contradictedBy `white-glove` → "That? Jam. From breakfast." → reveal `lab-smear`. S3 "I have no interest in who wins. A critic is impartial." contradictedBy `newspaper` → "Circling is a reading habit." → reveal `maison-doree`.
**Puzzles** none (tutorial). **Culprit** Rupert.
**Prove it** Q1 Which clue puts Rupert inside the kitchen? → white glove smear (distractors: crumbs, fridge handle, newspaper). Q2 Why can the smear only have come from the kitchen? → coulis was made at 6:45 for the competition and never served. Q3 Motive? → stake in Maison Dorée.
**Solution/Epilogue** Tower found in Rupert's car boot, slightly listing. Margaux wins with an emergency tower; Teodor cries; Pip eats a macaron.
**Opening dialogue** Otto hands the Rookie the file ("Pastry. Start small."); Nia teaches the press mechanic in one line; Hestia gives the Rookie a lilac scarf **[PLANT: "Knitted it myself, dear. Everyone gets one eventually."]**.

### Case 02 — "Darkness at the Dome"  (easy)
**Location** Greywick Observatory rotunda · **Time** power cut 9:12–9:20 PM · **Victim** the Observatory (1680 Hevelius star atlas leaf stolen from a display case).
**Suspects**
- `c02-adaeze` Prof. Adaeze Nwachukwu, 52, director. Brisk, brilliant, impatient. Bun, glasses.
- `c02-milo` Milo Brankovic, 24, grad student. Sleepy hoodie, anxious, headphones.
- `c02-gus` Gus Tremonte, 47, night custodian. Folksy, chatty, "seen it all". Cap, mustache. **CULPRIT.** Motive: gambling debt; a collector offered cash.
**Scenes** Rotunda (display case, dark dome), Control room (maintenance log, badge system), Basement (breaker panel, sign-in sheet), Stairwell (Milo's spot).
**Clues**
- `maintenance-log` (document, control room): emergency lights in the rotunda removed Tuesday for rewiring — "rotunda fully dark during any outage".
- `case-lock` (physical, rotunda): display case opened with a key; no pry marks.
- `key-policy` (document; revealOnRead from Adaeze S2): only the director and the custodian hold display-case keys.
- `breaker` (physical, basement): main breaker lever pulled by hand; no fault recorded — the blackout was manual.
- `phone-log` (digital; revealOnRead from Milo S1): 14-min call to his mother 9:08–9:22.
- `badge-log` (digital; revealed by breaking Gus S2): Nia: Gus's badge opened the breaker room at 9:09.
- `glow-tape` (physical, rotunda, flavor-ish): glow tape only in corridors, none in rotunda.
**Statements**
- Adaeze: S1 in office writing a grant, stayed put in the dark. S2 only she and Gus hold keys → reveal `key-policy`. S3 "The outage was no accident; our grid is new."
- Milo: S1 on the phone with mum in the stairwell → reveal `phone-log`. S2 "I'm scared of the dark, honestly." S3 "Gus says he saw me? I wasn't there."
- Gus: S1 mopping east corridor when it went black. S2 "I saw Milo at the case, clear as day, about 9:15, hands on the glass." contradictedBy `maintenance-log` → "Well—I saw a shape. A hoodie shape." → reveal `badge-log`. S3 "Never went downstairs tonight. No reason to." contradictedBy `badge-log` → "Must've been checking the boiler."
**Culprit** Gus. **Prove it** Q1 Why is Gus's sighting impossible? → rotunda had no emergency lights, pitch dark. Q2 Who could open the case without forcing it? → key holders Adaeze and Gus. Q3 What shows Gus caused the blackout? → badge log, breaker room 9:09.
**Epilogue** Atlas leaf found in Gus's mop bucket's false bottom. Otto: "Hm. A mop."

### Case 03 — "Dry as a Bone"  (easy)
**Location** Lyceum Theatre · **Time** rehearsal 2:00–3:00 PM; rain 2:05–2:35 (heavy) · **Victim** Carlotta Vexley-Moon, leading lady (emerald brooch from dressing room 1).
**Suspects**
- `c03-delphine` Delphine Arquette, 27, understudy. Ambitious, honeyed voice. Bob.
- `c03-marcus` Marcus Oyelaran, 33, flyman. Calm, few words. Bandana.
- `c03-hugo` Hugo Brandt, 50, Carlotta's agent. Charming, sweaty, in debt. Slick hair, scarf. **CULPRIT.**
**Scenes** Dressing room (window latched inside, jewelry box), Stage (director's table, fly ladder), Lobby (coat rack with Hugo's dry coat & strapped umbrella).
**Clues** `rain-log` (initial; Nia: heavy rain 2:05–2:35), `dry-coat` (lobby: Hugo's coat & umbrella bone dry, umbrella still strapped), `rehearsal-notes` (stage: Delphine on stage 2:00–2:50 continuously), `cue-sheet` (stage: Marcus signed every cue 2:00–3:00; only exit from fly gallery is the ladder beside the director's table), `window-latch` (dressing room: latched inside), `pawn-ticket` (revealed by breaking Hugo S1: a ticket from Grimsby & Sons, today 2:40, falls from his pocket), `pawn-item` (revealed by breaking Hugo S2: Nia calls Grimsby — item pawned is an emerald brooch).
**Statements** Delphine S1 dying beautifully on stage for 50 minutes; S2 "Fake emeralds, darling" (she's wrong, fun). Marcus S1 "Fly gallery. Every cue signed." S2 only way down is the ladder by the director. Hugo S1 "Stepped out at two, walked the embankment until three. Needed air." contradictedBy `dry-coat` → "I stood under an awning. The whole time." → reveal `pawn-ticket`. S2 "I'd never steal from Carlotta; she is my meal ticket." contradictedBy `pawn-ticket` → "That's for my watch!" → reveal `pawn-item`. S3 "Carlotta trusts me with everything." (no contradiction, just sad).
**Prove it** Q1 What proves Hugo wasn't walking outside? → dry coat & strapped umbrella in heavy rain. Q2 Why are Delphine and Marcus cleared? → continuously observed by the director. Q3 What was pawned at 2:40? → the brooch. (Note: rain stopped 2:35; he pawned it after.)

### Case 04 — "Five Cups, Four Sleepers"  (easy)
**Location** Wren House, study · **Time** book club, 8–10 PM · **Victim** Mrs. Prudence Ashby-Wren (host; first edition *Frankenstein* stolen while guests dozed — chamomile pot laced with valerian concentrate).
**Suspects**
- `c04-agnes` Agnes Trellaway, 68, retired schoolmistress. Prim, "young detective". Pearls. **CULPRIT.** Motive: Prudence outbid her for the book 40 years ago.
- `c04-bart` Bartholomew Quince, 40, antiquarian bookseller. Jittery, obviously suspicious (red herring).
- `c04-saoirse` Saoirse Lennon, 31, poet. Dreamy, barefoot, flower in hair.
**Clues** `teapot` (Quill: sedative in the pot; everyone poured from it), `cups` (five cups; four drained; the **blue willow** cup full and cold), `cup-photo` (framed photo from last month: Agnes holding the blue willow cup; caption "everyone has their own cup — tradition"), `host-note` (revealOnRead/ initial from Prudence in briefing: "Agnes always the blue willow, Bart the brown, Saoirse the cracked one"), `bart-card` (Bart's card: "F. 1818 — buyer waiting"; red herring — legitimate offer), `window-latch` (study window latched inside), `handbag` (revealed by breaking Agnes S1: rectangular bulge in her handbag — "knitting").
**Statements** Agnes S1 "I drank my tea like everyone and woke with a crick." contradictedBy `cups` → "Perhaps I used another cup tonight." → reveal `handbag`. S2 "My handbag? Knitting." contradictedBy `cup-photo`? No — contradictedBy `host-note` is wrong too; make S2 contradictedBy `handbag` only after S1 → "...It is a book-shaped scarf." S3 "Mary Shelley is overrated anyway." Bart S1 legitimate buyer, Prudence refused. S2 "Slept like the dead; drooled on the ottoman." Saoirse S1 dreamt of a lighthouse; S2 drank two cups, lovely chamomile.
**Prove it** Q1 Which cup was untouched? → blue willow. Q2 Whose cup is it? → Agnes (photo + host). Q3 Why does an untouched cup matter? → sedative was in the pot; whoever didn't drink stayed awake.

### Case 05 — "The 4:15 to Hollowmere"  (easy)
**Location** Greywick Central Station café · **Time** 4:00–4:30 PM · **Victim** charity drive cashbox stolen from the café counter.
**Suspects**
- `c05-stanley` Stanley Okafor, 45, accordion busker. Jolly, speaks in near-rhymes.
- `c05-priya` Priya Venkataraman, 29, consultant commuter. Brisk, phone-glued. **CULPRIT** (impulse theft to cover a gambling-app hole).
- `c05-dermot` Dermot Flynn, 38, off-duty ticket inspector. Quotes rules and timetables.
**Clues** `departure-board` (photo: 16:15 HOLLOWMERE — CANCELLED, signal failure), `ticket-stub` (counter: Hollowmere ticket bought 15:58 for the 16:15), `tourist-video` (revealOnRead Stanley S2: timestamped video of Stanley playing 4:10–4:25), `staff-room-log` (Dermot signed in 16:05–16:35 to file a complaint), `cafe-receipt` (revealed by breaking Priya S1: card payment at the café 16:14), `cashbox-spot` (counter: receipt spike knocked over).
**Statements** Priya S1 "Caught the 4:15 to Hollowmere, doors shut behind me, came back on the 4:40." contradictedBy `departure-board` → "Then it was the 4:25. Trains blur." → reveal `cafe-receipt`. S2 "I never set foot in the café." contradictedBy `cafe-receipt` → caught. S3 "I'm a consultant; I don't need charity money." Dermot S1 watched the 4:15 get cancelled — signal failure at Marrow Junction; S2 in staff room filing a complaint → reveal `staff-room-log`. Stanley S1 played 'Greywick Blues' till fingers froze; S2 "Some kid filmed me!" → reveal `tourist-video`.
**Prove it** Q1 Why is Priya's alibi impossible? → the 4:15 was cancelled. Q2 What puts Priya in the café during the theft? → receipt 16:14. Q3 Why is Stanley cleared? → the video.

---

## MEDIUM TIER

### Case 06 — "Intermission"  (medium)
**Location** Greywick Conservatory · **Time** intermission 8:40–8:52 PM · **Victim** soloist Imogen Castellane; her violin "the Marigold" swapped for a replica (she notices a wolf tone two bars into Act II).
**Suspects**
- `c06-bram` Bram Vandersloot, 55, conductor. Imperious, Dutch idioms.
- `c06-yevgenia` Yevgenia Orlova, 34, pianist. Icy, precise, dry.
- `c06-kasimir` Kasimir Dufresne, 29, principal cellist. Charming gambler, nervous laugh. **CULPRIT.**
- `c06-ottilie` Ottilie Finch, 41, stage manager. Clipboard, headset, "places, people!"
**Logic** The real violin is not in the building (searched) → it left during intermission → only one person left the building then, carrying a cello case. Rosin traces seal it.
**Clues** `stage-door-log` (Bram green room 8:41–8:50; Kasimir out 8:43 "smoke", back 8:51 with cello case; Yevgenia at the piano on stage; Ottilie backstage), `headset-log` (Ottilie cue calls 8:42/8:45/8:48/8:51), `search` (revealOnRead Ottilie S3: building searched, Marigold not inside), `replica` (varnish tacky, made within 24 h; label copied from insurance photos circulated to section principals and the conductor), `cello-case` (pit: padded compartment; traces of dark rosin), `night-amber` (Imogen/briefing: her custom "Night Amber" rosin — nobody else uses it; cellists use light rosin), `rosin-match` (revealed by breaking Kasimir S3: Quill confirms Night Amber in the case), `debt-letter` (locker room hotspot: bookmaker's letter), `ottilie-saw` (revealOnRead Ottilie S2: Kasimir never takes the case to smoke).
**Statements** Bram S1 green room 12 minutes composing himself; S2 "Kasimir? Reliable as a metronome"; S3 never touches another's instrument. Yevgenia S1 at the piano, 400 people watched her scales; S2 replica sounds like a cat in a bucket; S3 Kasimir borrowed money in March, never repaid. Kasimir S1 stepped out for a cigarette as always; S2 "Took my case—never leave a cello unattended, ha." S3 "Never touched the Marigold; Imogen guards it like a dragon." contradictedBy `cello-case` → "Rosin dust gets everywhere in a pit!" → reveal `rosin-match`. S4 "I don't gamble anymore." contradictedBy `debt-letter`. Ottilie S1 cue calls every three minutes; S2 saw Kasimir leave with case, odd → reveal `ottilie-saw`; S3 searched every cupboard → reveal `search`.
**Prove it** Q1 Why must the Marigold have left the building during intermission? → searched & not found; swap happened before Act II. Q2 Who alone left the building then? → Kasimir. Q3 What links his case to the Marigold? → Night Amber rosin.

### Case 07 — "The Locked Greenhouse"  (medium)
**Location** Thornfield Botanical Gardens, Glasshouse 3 · **Time** discovered 7:58 AM; swap actually 2:30–3:30 PM the day before · **Victim** the Gardens (the "Ghost Orchid of Harrow").
**Suspects**
- `c07-fenwick` Fenwick Abernathy, 63, head gardener. Grumbles in Latin, loves the orchid like a child.
- `c07-mireille` Mireille Saint-Clair, 45, rival collector. Elegant, gloved, competitive. **CULPRIT.**
- `c07-hurst` Dr. Tobias Hurst, 38, botanist/authenticator. Pedantic, sneezes. (Note: first name shared with the arc's "Tobias" — Hestia reacts slightly in dialogue **[PLANT: Hestia: "Tobias. Hm. A good name." then changes subject]**.)
- `c07-jojo` Jojo Mbeki, 19, summer intern. Bubbly, films everything, late.
**Logic** Locked room is a red herring: the plant in the pot is a dyed lookalike, in place by 3:50 PM (Jojo's video). Only Mireille (private viewing 2:10–3:30, alone 2:30–3:00 while Fenwick dealt with a school group) had access AND a source for the lookalike (her nursery sells that hybrid, bundled with "Ivory Ghost" petal spray). Her gloves carry fresh potting mix + spray.
**Clues** `alarm-log` (armed 5:02 PM, no events until 7:58), `fake-orchid` (Hurst: wrong species, dyed petals, repotted within a day), `visitor-log` (Mireille 2:10–3:30; school group 2:30–3:00; Jojo 3:45), `jojo-video` (revealOnRead Jojo S1: 3:50 clip shows the orchid already with wrong spotting), `nursery-catalogue` (revealed by breaking Mireille S3: Nia finds her nursery's "Harrow lookalike" hybrid + Ivory Ghost spray bundle), `gloves` (gift-shop lost-property hotspot: Mireille's gloves, potting mix + ivory spray residue), `hurst-ticket` (conference in Dunmere yesterday), `fenwick-absence` (revealOnRead Fenwick S3).
**Statements** Fenwick S1 locked at five, nobody in overnight (true); S2 Mireille wanted it for twenty years; S3 left her alone only when the school children knocked over the ferns, half an hour → reveal `fenwick-absence`. Mireille S1 "I admired it; I did not touch it." contradictedBy `gloves` → "Gloves get dirty in a garden." S2 "I left at 3:30 and it was perfectly itself." (contradictable only via inference; leave uncontradictable). S3 "I do not grow lookalikes; the idea is vulgar." contradictedBy `fake-orchid`? No → contradictedBy `nursery-catalogue` is circular. Fix: S3 contradictedBy `fake-orchid` (Hurst identified the species as the commercial hybrid *she* breeds — include that in `fake-orchid` detail) → "A… commercial line. For amateurs." → reveal `nursery-catalogue`. Hurst S1 it is not the Ghost; S2 conference in Dunmere → reveal `hurst-ticket`. Jojo S1 late, filmed a tour at 3:50 → reveal `jojo-video`; S2 "Fenwick would literally bury me."
**Prove it** Q1 Why is the locked room irrelevant? → swap happened during open hours; fake already in place at 3:50. Q2 Where did the lookalike come from? → Mireille's nursery line. Q3 What shows Mireille handled the pot? → gloves with potting mix and spray.

### Case 08 — "The Dog That Wasn't There"  (medium)
**Location** Cresswell Mansions, flat 4B (Dr. Lydia Marchetti, watch collector) · **Time** 6:00–6:20 PM while Lydia walked Biscuit · **Crime** vintage Patek taken; balcony door forced.
**Suspects**
- `c08-colin` Colin Hartigan, 52, neighbour 4A. Nosy, "I hear everything through these walls." **CULPRIT.**
- `c08-ravi` Ravi Chandrasekar, 30, courier. Cheerful.
- `c08-edna` Mrs. Edna Pruitt, 79, flat 3B. Lively, cats, hears footsteps.
- `c08-jake` Jake Marchetti, 22, Lydia's nephew with a key. Gamer slacker — obvious suspect (red herring).
**Clues** `step-tracker` (Lydia out 6:00–6:20), `park-camera` (Ferris Park camera: Lydia & Biscuit 6:04–6:17), `balcony-marks` (scuffs across the 4A/4B balcony divider from the 4A side; 4B balcony door jimmied), `courier-photo` (parcel photo 6:05; GPS onward 6:07), `game-log` (revealOnRead Jake S1: voice chat 5–8 PM continuous), `edna-footsteps` (revealOnRead Edna S1: heavy footsteps on the balcony above at ~6:10), `watch-forum` (revealed by breaking Colin S2: Nia finds Colin's 7:30 PM forum post offering a "Marchetti-style Patek, discreet").
**Statements** Colin S1 home all evening with the radio. S2 "Heard Biscuit yapping about ten past six—that dog never stops." contradictedBy `park-camera` → "Must've been the telly. Or Edna's cat." → reveal `watch-forum`. S3 "I never use the balcony; heights." contradictedBy `balcony-marks` → "Those are from my planters." S4 "I don't know a Patek from a potato." contradictedBy `watch-forum`. Jake S1 raiding with his guild from five → reveal `game-log`; S2 "Aunt Lydia gave me a key. Why would I break the balcony door?" Ravi S1 dropped parcel 6:05, photo, gone by 6:07; S2 "A bloke was watching through next door's peephole." Edna S1 footsteps above at ten past → reveal `edna-footsteps`; S2 "Biscuit was out with Lydia—I waved to them at six."
**Prove it** Q1 Why is Colin's dog story a lie? → Biscuit was in the park 6:04–6:17. Q2 How did the burglar enter? → across the shared balcony from 4A. Q3 Why is Jake cleared? → continuous voice chat 5–8.

### Case 09 — "Zugzwang"  (medium)
**Location** Greywick Chess Club · **Time** Round 3, 7:00–7:40 PM; theft discovered 7:35 · **Crime** £2,400 prize fund taken from the treasurer's locked drawer; key was in the treasurer's coat on the corridor rack.
Club rule: leaving the hall during your game = forfeit; arbiter confirms no forfeits.
**Suspects**
- `c09-nikolai` Nikolai Zhdanov, 67, former champion. Grumpy. Board 1 (lost to Wendy, 19:38).
- `c09-wendy` Wendy Achterberg, 16, prodigy. Bubbly. Board 1.
- `c09-ferdinand` Ferdinand Oyelowo-Marsh, 44, accountant & club treasurer's assistant… make him **club accountant**. Smooth. Board 2 (draw 19:12). **CULPRIT.** Motive: covering £2,400 he embezzled before the audit.
- `c09-beatrix` Beatrix Kowalczyk, 38, librarian & chess blogger. Board 2.
**Clues** `scoresheets` (B1: 1.e4 e6 2.d4 d5 … signed 19:38; B2: draw by repetition, signed 19:12), `opening-poster` (club wall: "Opening of the Month — The French Defence: 1.e4 e6"; also explains Sicilian = 1.e4 c5), `arbiter-log` (no forfeits; nobody left during their game), `demo-board` (analysis room: demonstration board mirrors Board 1 live — showed the French all evening), `drawer` (office: opened with key, not forced), `coat-rack`, `beatrix-saw` (revealOnRead Beatrix S1: Ferdinand said "smoke" and left — he has never smoked), `club-accounts` (revealed by breaking Ferdinand S3: Nia — club account £2,400 short before tonight).
**Statements** Nikolai S1 played until 7:38 like a gentleman, then lost to a child; S2 "French Defence. I hate the French." Wendy S1 won, at the board till 7:38; S2 "Mr. Oyelowo-Marsh didn't come watch; he always watches me." Ferdinand S1 "After our draw I went to the analysis room with Beatrix and went through board one's Sicilian." contradictedBy `demo-board` → "Sicilian, French—openings blur." S2 "I never left the analysis room." contradictedBy `beatrix-saw` → "Beatrix misremembers." S3 "The club accounts are immaculate; I keep them myself." contradictedBy `club-accounts`. Beatrix S1 analysed alone; Ferdinand said smoke → reveal `beatrix-saw`; S2 "The demo board showed Nikolai's French the whole time."
**Prove it** Q1 Why does the "Sicilian" slip matter? → the demo board showed Board 1's French; anyone in the analysis room would have seen it. Q2 Who was free during the theft window? → Ferdinand and Beatrix (Board 2 ended 7:12). Q3 Motive? → covering embezzlement.

### Case 10 — "The Mirror Clock"  (medium)
**Location** Halvorsen Gallery, Monday private reception · **Time** sketch taken ~8:15–8:25 PM · **Crime** small Dutch master sketch unscrewed from its frame.
**Suspects**
- `c10-anouk` Anouk Halvorsen, 36, owner's daughter. Jaded, vapes.
- `c10-simeon` Simeon Brightwater, 41, art influencer. "Content." **CULPRIT.**
- `c10-ingeborg` Ingeborg Lund, 58, insurer. Stern.
- `c10-dante` Dante Ferreira, 27, caterer. Flirtatious, observant.
**Logic** Simeon's alibi selfie "Café Nocturne, 3:40" shows, in the mirror behind him, a clock reading 3:40 **mirrored** → real time 8:20 — and the gallery's peacock wallpaper. EXIF confirms 20:21. He left at 8:25 with a poster tube fatter than when he arrived.
**Clues** `selfie` (post, caption "Café Nocturne 3:40 — sketching ideas"), `mirror-clock` (zoom: the clock is seen in a mirror; mirrored 3:40 = 8:20), `peacock-corridor` (gallery restroom corridor: peacock wallpaper, mirror, clock), `cafe-closed` (Nia: Café Nocturne is closed on Mondays), `guest-list` (Simeon 7:50–8:25 "to catch a train"), `tube` (revealOnRead Dante S1: came with a thin tube, left with a fat one), `exif` (revealed by breaking Simeon S1: photo taken 20:21), `empty-frame` (screws removed).
**Statements** Simeon S1 "I was at Café Nocturne at 3:40, sketching. Posted the proof." contradictedBy `peacock-corridor` → "Every café has wallpaper." → reveal `exif`. S2 "Left at 8:25 for the 8:40 train with the same tube I came with—posters." contradictedBy `tube` → "Dante was flirting, not observing." S3 "I never touch art. I only photograph it." contradictedBy `exif`? no — leave uncontradictable, or contradictedBy `cafe-closed` applied to S1 as alternative (engine supports one clue; keep `peacock-corridor`). Add S4 "Café Nocturne does a wonderful Monday espresso." contradictedBy `cafe-closed` → "...Tuesday espresso." Anouk S1 bored, at the bar; S2 "Simeon took forty selfies. Forty." Ingeborg S1 insured value, stern; S2 the screws were removed with a coin. Dante S1 the tube → reveal `tube`; S2 "He asked me where the restroom corridor was. Twice."
**Prove it** Q1 What real time does the mirrored clock show? → 8:20 (distractors 3:40, 9:20, 4:20). Q2 Which detail places the selfie in the gallery? → peacock wallpaper. Q3 How did the sketch leave? → the poster tube.

---

## HARD TIER

### Case 11 — "The Planted Scarf"  (hard)
**Location** Bellwether Yard studios, Rosalind Achebe-Thorne's sculpture studio · **Time** 9:00–11:40 PM; rain 8:30–10:30 · **Crime** bronze maquette "The Gull" stolen; window broken; Ingrid's silk scarf found **dry** on wet gravel on top of the shards.
**Suspects**
- `c11-ingrid` Ingrid Solvang, 39, rival sculptor. Fierce, honest to a fault. **Framed.**
- `c11-percival` Percival Dunmore, 48, studio manager. Fussy, keys to everything. **CULPRIT.** Motive: insurance fraud (raised valuation 2 weeks ago) + private sale.
- `c11-caspian` Caspian Reyes-Oduya, 26, foundry apprentice. Tired, loyal. Innocent liar (covering Thea).
- `c11-honore` Honoré Blanc, 60, dealer. Oily; wanted the piece; airtight auction alibi.
- `c11-thea` Thea Marchbanks, 33, Rosalind's ex. Bitter, witty. Innocent liar (with Caspian).
**Clues** `rain-log` (initial), `scarf-dry` (dry scarf on wet gravel, lying on top of glass), `glass-outward` (shards outside → broken from inside), `door-lock` (studio door not forced), `key-register` (studio keys: Rosalind, Percival; locker master key: Percival), `locker` (Ingrid's locker unforced; she says scarf was inside since Tuesday), `gate-cctv` (Yard gate: Percival's car enters 10:48 PM), `insurance-memo` (revealed by breaking Percival S3), `auction-receipt` (Honoré: Dunmere auction paddle till 11), `texts` (revealed by breaking Caspian S1: Thea's texts "don't tell them I was with you").
**Puzzle** `order` "Reconstruct the night": Rain begins (8:30) → Rain ends (10:30) → Percival's car enters the Yard (10:48) → Window broken from inside → Scarf placed on the shards → Rosalind discovers the break-in (11:40). Uniqueness: scarf dry ⇒ after rain; scarf on top of glass ⇒ after window; Percival's entry precedes both (he's the only one inside); Rosalind last.
**Statements** Ingrid S1 scarf in locker since Tuesday; S2 home alone, "I know how that sounds"; S3 "I'd rather beat The Gull than steal it." Percival S1 "Arrived at midnight after Rosalind rang." contradictedBy `gate-cctv` → "I may have driven past earlier. Insomnia." S2 "Only Rosalind and I hold studio keys—clearly the thief came through the window." contradictedBy `glass-outward` → "Glass flies everywhere in a storm!" S3 "The insurance is standard; haven't touched the policy in years." contradictedBy `insurance-memo`… (reveal order: make S3 contradictedBy `key-register`? No.) Final: S3 "Each artist has their own locker key; nobody else can open Ingrid's." contradictedBy `key-register` → "The master key is for emergencies!" → reveal `insurance-memo`. S4 "I haven't touched the policy in years." contradictedBy `insurance-memo`. Caspian S1 "Foundry till eleven, alone." contradictedBy `texts` → "Okay—Thea was with me. She asked me not to say." Honoré S1 Dunmere auction, paddle receipt → reveal `auction-receipt`; S2 offered a fortune, Rosalind laughed. Thea S1 "Home. Wine. Bad television." contradictedBy `texts` → "Fine. I was with Caspian."
**Prove it** Q1 Why was the scarf placed after 10:30? → dry on wet gravel after the rain. Q2 What shows the window was staged? → shards outside. Q3 Who could access both studio and Ingrid's locker? → Percival. Q4 Who lied but is innocent? → Caspian and Thea.

### Case 12 — "The Harrow Point Lamp"  (hard)
**Location** Harrow Point lighthouse · **Time** night; lamp dark 22:10 · **Crime** lighthouse lamp sabotaged so the ketch *Mayflower* grounded on Harrow Shoal and its "priceless antiquities" (replicas, insured ×10) were "lost" — insurance fraud.
**Suspects**
- `c12-ailsa` Ailsa Craigmyle, 57, keeper. Stoic, logbook, "clear as gin".
- `c12-rhys` Rhys Pengelly, 24, apprentice keeper. Gadget-lover, debts. **CULPRIT** (saboteur, paid).
- `c12-teddy` Teddy Brannigan, 30, supply-boat skipper. Cheeky, superstitious.
- `c12-cornelius` Cornelius Vane-Strutt, 62, cargo owner/exporter. Pompous. Paymaster (exposed in prove-it, not the accused).
- `c12-marguerite` Marguerite Doyle, 48, coastguard radio operator. Crisp jargon.
**Puzzle** `order` "The night at Harrow Point": Supply boat leaves the jetty (Teddy: lamp still shining) → Lamp fails (Ailsa: 22:10, stars clear) → Fog bank arrives (Ailsa: 15 min later) → Foghorn starts automatically (Marguerite: fog sensor trips it; logged 22:26) → *Mayflower* mayday (Marguerite: 25 min after horn). Rhys claims he went to bed after the horn and the lamp failed while he slept ⇒ claims horn before lamp ⇒ false.
**Clues** `keepers-log` (22:10 lamp dark, stars visible; 22:25 fog; 22:26 horn auto), `fuse` (Quill: fuse in the controller was already blown when installed — swapped in; spare box missing one good fuse), `rhys-kit` (Rhys's toolkit: a good fuse of that exact rating), `manifest` (Teddy departed 21:55), `coastguard-log` (horn 22:26, mayday 22:51), `horn-auto` (revealOnRead Marguerite S2), `bank-transfer` (revealed by breaking Rhys S3: Nia — £4,000 from a shell company linked to Vane-Strutt Exports), `cargo-appraisal` (Nia/Quill: cargo = replicas, insured ×10).
**Statements** Rhys S1 "Went to bed after Teddy's boat left and after the horn started; I was asleep when the lamp failed." contradictedBy `keepers-log` → "Ailsa must've mixed up the times." S2 "Fuse just blew. Old kit." contradictedBy `fuse` → "I keep spares, so what." S3 "I don't know any Vane-Strutt." contradictedBy `bank-transfer`. Ailsa S1 lamp dark at ten past ten, stars clear, fog fifteen minutes later; S2 on the gallery the whole time, saw the ketch heading for the shoal; S3 "Rhys? Good lad. Too fond of his phone." Teddy S1 left at five to ten, lamp shining like a wedding; horn started as he rounded the point; S2 "Never look back at a lighthouse… I did. It was dark by then." Cornelius S1 "My cargo was priceless, insured appropriately." contradictedBy `cargo-appraisal` → "Appraisals vary." S2 never set foot on Harrow Point. Marguerite S1 horn 22:26, mayday 22:51, skipper said the light simply wasn't there; S2 horn is automatic, fog sensor, no human hand → reveal `horn-auto`.
**Prove it** Q1 Why does Rhys's bedtime story fail? → lamp failed before the horn; he was awake. Q2 What shows the failure was deliberate? → a pre-blown fuse was installed. Q3 Who paid Rhys? → Cornelius. Q4 Real purpose? → insurance fraud on replicas.

### Case 13 — "Five Masks, One Vault"  (hard)
**Location** Ravensmere Hall, masked ball · **Time** midnight unmasking; vault override 00:03 · **Crime** the Ravensmere Sapphire taken; the vault's spare key was in a locked bureau in **Guest Room 3**; the room-assignment sheet was burned.
Corridor: Rooms 1–5 in a row; Room 1 beside the stairs, Room 5 beside the chapel.
**Suspects**
- `c13-octavia` Lady Octavia Ravensmere-Blount, 70. Grand, selectively deaf.
- `c13-mallory` Captain Idris Mallory, 45, ex-navy. Jovial, loud, bad knee.
- `c13-perpetua` Sister Perpetua Nkemelu, 50, nun, charity director. Gentle, shrewd.
- `c13-vikram` Vikram Sethi-Lancaster, 33, tech heir. Bored, clever, drone hobbyist. **CULPRIT.**
- `c13-coralie` Coralie Dubois-Ferrand, 28, soprano. Dramatic.
**Puzzle** `grid` rows = five guests, cols = Rooms 1–5. Clues: (1) The Captain's room is beside the stairs. (2) Sister Perpetua's room is beside the chapel. (3) Coralie's room is directly between Vikram's and Perpetua's. (4) Lady Octavia insists on an even-numbered room. (5) Vikram's room is two doors from the Captain's. Solution: Mallory 1, Octavia 2, Vikram 3, Coralie 4, Perpetua 5. Reveal clue `room-three` ("Room 3 was Vikram's").
**Clues** `ash` (burned sheet), `corridor-plan`, `bureau` (Room 3 bureau opened with its own key; vault spare key gone), `vault-log` (mechanical override 00:03), `butler` (Vikram left ballroom 23:58, returned 00:09), `housekeeper-note` (Her Ladyship insists on even numbers), `drone` (hedge maze: small drone with a velvet pouch & sapphire fibres), `controller` (revealed by breaking Vikram S3: in his jacket), `room-three` (puzzle reveal).
**Statements** Octavia S1 even room, odd numbers vulgar; S2 didn't leave the ballroom. Mallory S1 room by the stairs, knee; S2 "Sethi was two doors down; his gadgets beeped all night." Perpetua S1 beside the chapel, asked for it; S2 "The young man left during the countdown. Nature took eleven minutes." Coralie S1 between the boy and the nun—beeps one side, Hail Marys the other; S2 sang the high C at midnight. Vikram S1 "I had Room 2, next to the Captain." contradictedBy `room-three` → "Rooms, numbers… I was tipsy." S2 "I never left the ballroom." contradictedBy `butler` → "Fine. The loo." S3 "Drone? I'm a software man, not a hobbyist." contradictedBy `drone` → reveal `controller`.
**Prove it** Q1 Who occupied Room 3? → Vikram. Q2 How did the sapphire leave despite the gate search? → drone from the Room 3 balcony. Q3 What timing shows his opportunity? → absent 23:58–00:09; override 00:03. Q4 Which clue fixes Octavia's room? → the even-number note.

### Case 14 — "Dead Letter"  (hard)
**Location** Greywick Philatelic Society · **Crime** President Augustin Ferrer-Moss's rare "Inverted Lantern" stamp taken; a blackmail note in cipher in his desk; he won't talk.
**Cipher** Caesar shift 7 (the note bears a 7p stamp; hint "the key is on the face of it"):
`SLHCL AOL SHUALYU BUKLY WPLY UPUL HA ALU. ALSS UV VUL. — OLYVU`
= "LEAVE THE LANTERN UNDER PIER NINE AT TEN. TELL NO ONE. — HERON".
**Suspects**
- `c14-winifred` Winifred Okoro, 59, newsletter editor; her column is "The Heron's Perch". Warm, scatterbrained. **Framed.**
- `c14-desmond` Desmond Achterberg, 52, treasurer, yacht owner (pier fob 4). Bluff.
- `c14-lotte` Lotte Vandermeer, 44, auction-house rep (pier fob 2). Slick. **CULPRIT.**
- `c14-felix` Felix Nakamura-Grant, 35, cipher hobbyist. Eager (red herring; taught everyone Caesar).
- `c14-barnaby` Barnaby Quist, 70, Augustin's oldest friend. Gossip.
**Puzzles** `code` #1 "Where and when is the drop?" answers: ["pier nine at ten","pier 9 at 10","under pier nine at ten","pier nine","pier 9"]. `code` #2 "Who signs the note?" answers ["heron","the heron"]. Reveal `decoded-note`.
**Clues** `cipher-note`, `stamp-7p`, `heron-column` (everyone knows Heron = Winifred), `hospital-log` (Winifred at St. Jude's 21:30–22:30), `pier-gate-log` (fob 2 at 21:52; fob 4 at 18:30 & 19:10), `fob-register` (2 = Lotte, 4 = Desmond), `viewing-hours` (auction late viewing ended 21:00), `auction-listing` (revealed by breaking Lotte S3: an "Inverted Lantern" scheduled for private sale next week), `barnaby-gossip` (revealOnRead: he told Lotte Augustin's secret over sherry), `cipher-night` (revealOnRead Felix S1: all members attended his Caesar workshop).
**Statements** Lotte S1 "Late viewing until eleven." contradictedBy `viewing-hours` → "Eleven, nine—who looks at clocks." S2 "Haven't been near the harbour in weeks." contradictedBy `pier-gate-log` → "Someone borrowed my fob." S3 "My house has no interest in Augustin's collection." contradictedBy `decoded-note`? no → contradictedBy `fob-register`? no. Make S3 contradictedBy `barnaby-gossip` ("You knew exactly what he had and how he got it") → "Barnaby talks." → reveal `auction-listing`. S4 "We have nothing like it coming to sale." contradictedBy `auction-listing`. Winifred S1 Heron is her column, she'd hardly sign with it; S2 St. Jude's with sister → reveal `hospital-log`. Desmond S1 lines at half six and seven; S2 fob four never lent. Felix S1 Caesar, 7p = shift 7, taught it in March, everyone came → reveal `cipher-night`; S2 home blogging about Vigenère. Barnaby S1 the secret ("acquired" in '79), told Lotte over sherry → reveal `barnaby-gossip`.
**Prove it** Q1 Why is "Heron" a frame? → Winifred's logged alibi + everyone knows her pen-name. Q2 Who opened the pier gate before ten? → Lotte, fob 2 at 21:52. Q3 How did Lotte learn the secret? → Barnaby. Q4 Why doesn't cipher skill single out Felix? → every member attended his workshop.

### Case 15 — "The Confession"  (hard)
**Location** Marlowe Rowing Club trophy room · **Time** 02:14–02:31 · **Crime** the solid-silver Greywick Cup (60 cm) stolen. Marguerite Lindqvist confesses. Her brother did it.
**Suspects**
- `c15-marguerite` Marguerite Lindqvist, 24, captain. Proud, protective. **False confessor.**
- `c15-josef` Josef Lindqvist, 19, junior rower. Cocky, nail-biter. **CULPRIT.**
- `c15-dunstan` Coach Dunstan Whitlock, 58. Booming.
- `c15-tamsin` Tamsin Oyelaran-Beck, 31, treasurer. Precise, suspicious of everyone.
- `c15-len` "Lucky" Len Garrity, 66, groundskeeper. Paints things, naps.
**Clues** `window-paint` (Len painted the window shut at 3 PM; seal unbroken), `alarm-log` (disarmed 02:14 with the **new** code; re-armed 02:31), `code-memo` (coach changed the code at 9 AM; told Marguerite, Josef, himself), `kit-bag` (Marguerite's bag is 40 cm; cup is 60 cm), `marguerite-phone` (home 11 PM–7 AM), `coach-alibi` (St. Jude's with wife, logged), `josef-phone` (revealed by breaking Josef S2: phone off 01:50–02:50), `scrap-sale` (revealed by `code` puzzle: Harker's Scrap bought 2.1 kg silver at 08:00 from "J. Lindqvist", ID photo), `len-footsteps` (revealOnRead Len S2: light footsteps, trainers, around two).
**Puzzle** `code` "Josef's locker": Tamsin says his code is the club's founding year ("he's not imaginative"); the trophy-room plaque reads "Est. 1887". Answers ["1887"]. Reveal `scrap-sale`.
**Statements** Marguerite S1 "I did it. Through the window." contradictedBy `window-paint` → "Then—the door." S2 "I used the old code, 4-4-1-9." contradictedBy `alarm-log` → "I meant the new one." S3 "Carried it out in my kit bag." contradictedBy `kit-bag` → silence. S4 "Leave Josef out of this." Josef S1 "Sis says she did it. Who am I to argue." S2 "Asleep in the boathouse dorm, phone on the charger." contradictedBy `josef-phone` → "It… died." S3 "Never heard of Harker." contradictedBy `scrap-sale`. Dunstan S1 changed code at nine, told three people → reveal `code-memo`; S2 St. Jude's all night → reveal `coach-alibi`. Tamsin S1 doesn't even have the code; S2 "She'd never fit a sixty-centimetre cup in that bag." Len S1 painted it shut at three → reveal `window-paint`; S2 footsteps around two → reveal `len-footsteps`.
**Prove it** Q1 Which detail breaks the confession first? → window painted shut. Q2 Who could disarm the alarm at 02:14? → the three code-holders; coach and Marguerite have alibis → Josef. Q3 What ties Josef to the sale? → Harker's record at 8 AM. Q4 Why did Marguerite confess? → protecting her brother.

---

## EXTREME TIER — THE CARTOGRAPHER ARC
Every case leaves a hand-drawn map of Greywick with a **compass rose missing its north point**. Each crime exposes someone corrupt. In case 20 the player learns the Cartographer is **Hestia Vane**, avenging her brother Tobias Vane, wrongly convicted in 1991 (file GB-1991-0417, the Lantern Street arson) and dead in prison in 1994. Otto was the arresting constable. Targets: Kessler forged the arson evidence; Crane's ledger paid witnesses; Judge Whitlock took the bribe; Councillor Ashgrove ordered the fire for redevelopment.
Cross-case plants (must appear):
- **16**: the Cartographer's note to Oona cites "see GB-1991-0417". Dialogue: Nia "Our files are GWB-####?" Hestia: "Pre-'98 format, dear. Nobody uses it anymore." Otto: "Hm."
- **17**: Atbash decodes to TOBIAS. Hestia: "A common enough name, dear." (goes quiet).
- **18**: notes typed with a dropped lowercase 'e'. Otto: "Our archive Remington does that." Hestia: "Half the typewriters in Greywick do, Ottoline."
- **19**: the note anticipates the Bureau's plan ("You'll see the clockmaker first. Good.") discussed only in the briefing room (present: Otto, Nia, Quill, Hestia — Lucien absent). A **lilac wool fibre** at the window latch.
- Early plants: Hestia gives lilac scarves to the Rookie (case 1), Nia (case 6), Otto (case 11). Quill is left-handed (case 2 banter: "my left hand is the honest one").

### Case 16 — "The First Map"  (extreme)
**Location** Greywick Museum, Cartography Wing gala · **Time** director's speech 21:18–21:30 · **Crime** the 1569 "Mercator Lantern" map leaf taken from its case; a hand-drawn map left in its place with a coded string. X marks Alderman Kessler's townhouse, whose basement holds forged Mercators and the stolen leaf (delivered anonymously).
**Suspects**
- `c16-oona` Oona Blackwood, 41, registrar. Meticulous, haunted, cardigan. **CULPRIT** (coerced: the Cartographer knows she falsified a provenance in Lisbon).
- `c16-falk` Director Hieronymus Falk, 60. Vain speech-giver.
- `c16-benedikt` Benedikt Strauss, 37, conservator. Gentle giant, loading dock.
- `c16-pavel` Pavel Novotný, 29, guard. Earnest, radio.
- `c16-kessler` Alderman Petrus Kessler, 66, patron. Bluster. Exposed forger, not the thief.
- `c16-sabine` Sabine Kessler-Roux, 34, gala organiser, his daughter. Brittle.
**Puzzle 1** `code` "Map cipher": string `D4 A1 F2 B3 E5 C6 G1`; legend table (grid ref → street): A1 Elm Walk, A2 Birch Row, B1 Mallow Street, B3 Saltmarket, C2 Harrow Road, C6 Ember Court, D1 Pike Lane, D4 Kingfisher Lane, E2 Wren Close, E5 Lantern Street, F2 Sorrow Street, F5 Tanner Yard, G1 Rook Alley, G3 Osprey Walk. First letters → KESSLER. Answers ["kessler"]. Reveal `kessler-basement`.
**Puzzle 2** `order` "Shredded instructions" (reassembled by Nia): strips: "First, when the lights go down for the speech," → "radio the East Gallery guard to the loading dock." → "Only then use your card on the case." → "Leave my map where the leaf was." → "Finally, walk. Never run." → "— see GB-1991-0417". Reveal `instructions` clue (which includes the old file number).
**Clues** `left-map`, `access-log` (card REG-02 at 21:24), `card-register` (REG-02 = registrar), `radio-log` (call to Pavel at 21:21 from handset R-07), `handset-register` (R-07 = registrar's office), `lab-badge` (Oona out of the conservation lab 21:19–21:29), `kessler-basement` (puzzle 1), `instructions` (puzzle 2), `provenance` (revealed by breaking Oona S3: the Lisbon file), `dock-empty` (revealOnRead Benedikt S1).
**Statements** Oona S1 "In the conservation lab for the whole speech." contradictedBy `lab-badge` → "I stepped out for air." S2 "My card never left my lanyard." contradictedBy `access-log` → "Someone cloned it." S3 "I never touched the radio base." contradictedBy `handset-register` → breaks: "They knew about Lisbon. They said they'd end me." → reveal `provenance`. Falk S1 spoke twelve magnificent minutes; S2 "Generous patrons are never criminals." Benedikt S1 nobody at the dock called anyone → reveal `dock-empty`; S2 Oona not herself for weeks. Pavel S1 radio said dock, now; nobody there but Benedikt and bubbles; S2 came back, case open, no alarm — override. Kessler S1 "Forgeries? Study pieces." contradictedBy `kessler-basement` → bluster. S2 someone left that leaf to destroy me (true). Sabine S1 father collector not criminal; S2 at the ballroom door with the guest list all night.
**Prove it** Q1 Which card opened the case? → REG-02, Oona's. Q2 Where did the fake radio call come from? → registrar's office handset. Q3 Why did Oona comply? → blackmail over Lisbon provenance. Q4 What was the Cartographer's purpose? → expose Kessler's forgery ring.

### Case 17 — "Tide Tables"  (extreme)
**Location** Saltmarsh, the Gullet sea-cave · **Tides** low water 15:40 (cave reachable 14:40–16:40) and 03:12 (02:12–04:12) · **Crime** Harbourmaster Silas Crane's hidden ledger (bribes, false deportation reports) and forged passports taken from his "gear store" in the cave; ledger mailed to the Gazette. Crane checked the store at 15:00 (present) and again at 02:30 after an anonymous note (gone).
**Suspects**
- `c17-crane` Silas Crane, 55, harbourmaster. Oily; victim and villain.
- `c17-maren` Maren Holt, 38, fisherwoman. Taciturn. **CULPRIT.** Motive: Crane's false report deported her brother.
- `c17-pym` Rev. Aldous Pym, 70, vicar & birdwatcher. Logs everything with times.
- `c17-kit` Kit Ashworth, 24, kayak guide. Sunny.
- `c17-dolores` Dolores Crane, 52, Silas's wife. Frosty.
- `c17-yusuf` Yusuf Demir, 45, customs officer. By the book.
**Puzzle 1** `code` "Read the tide table": low water 15:40, reachable one hour either side; "Until what time was the cave reachable in the afternoon?" answers ["16:40","1640","4:40 pm","440pm","4:40"]. Reveal `window` clue.
**Puzzle 2** `code` "Mirror of the tide": the note reads `GLYRZH`, hint "what rises, falls; A becomes Z" (Atbash). Answer ["tobias"]. Reveal `tobias` clue.
**Clues** `tide-table`, `crane-check` (15:00 all present), `pym-log` (16:15 lone figure in oilskins enters the Gullet, "tide on the turn"), `kit-gps` (tour 14:00–17:00, six tourists, no cave), `maren-ais` (her boat anchored off the cove 15:50–16:35), `yusuf-sheet` (customs house 14:00–22:00), `spa-receipt`, `oilskins` (Maren's: cave's distinctive green algae), `brother` (revealed by breaking Maren S3), `gazette-ledger` (initial: Gazette received the ledger in Crane's hand), `crane-note` (the Cartographer's note telling Crane to check at 02:30), `window`, `tobias`.
**Statements** Crane S1 "Fishing gear stolen. Just gear." contradictedBy `gazette-ledger` → "Forgeries!" S2 checked at three in the afternoon, all present. Maren S1 "Hauling pots off Dunmere Bank, one till six. Alone." contradictedBy `maren-ais` → "AIS drifts." S2 "Haven't set foot in the Gullet since I was a girl." contradictedBy `oilskins` → "Algae's algae." S3 "No quarrel with Crane." contradictedBy `brother`?? circular → S3 contradictedBy `crane-note`? no. Fix: `brother` comes from Yusuf S2 revealOnRead ("Her brother was deported on Crane's report—false, I'd bet my badge"); then Maren S3 contradictedBy `brother` → "He put my brother on a boat for nothing. Nothing." Pym S1 quarter past four, oilskins, reckless → reveal `pym-log`; S2 "I log everything. Birds, boats, sins." Kit S1 six tourists, zero cave visits. Dolores S1 spa, seaweed wrap, ironic. Yusuf S1 customs house sign-in → reveal `yusuf-sheet`; S2 Crane's store on his radar; Maren's brother → reveal `brother`.
**Prove it** Q1 Who was anchored off the cove during the window? → Maren. Q2 What does Pym's 16:15 sighting fit? → Maren's AIS window. Q3 Physical evidence? → algae on oilskins. Q4 What does the Atbash note say? → TOBIAS.

### Case 18 — "The Mirror Twins"  (extreme)
**Location** Greywick Grand Hotel · **Time** 03:00–03:20 · **Crime** Judge Ambrose Whitlock's bribery ledger taken from the safe-deposit room, opened with the manager key at 03:05. Identical twin night managers; CCTV shows "a Marlowe".
**Suspects**
- `c18-castor` Castor Marlowe, 34, night manager. Left-handed (watch on right wrist). **CULPRIT.** Motive: Whitlock's 2019 ruling bankrupted the family hotel.
- `c18-pollux` Pollux Marlowe, 34, night manager. Right-handed; burned right hand yesterday (bandaged). Covers for Castor by working the desk under Castor's login.
- `c18-whitlock` Judge Ambrose Whitlock, 63. Victim/villain.
- `c18-nadia` Nadia Ferrante, 31, security chief. Dry.
- `c18-halloran` Gregor Halloran, 49, guest who checked in at 03:04. Tipsy, observant.
- `c18-birgitta` Birgitta Lund-Whitlock, 55, judge's wife. Icy.
**Puzzle 1** `code` "The typed riddle" (dropped-e typewriter): "I have towns but no houses, mountains but no trees, water but no fish. What am I?" answers ["map","a map","the map"].
**Puzzle 2** `order` "The swap": Pollux burns his hand in the kitchen (yesterday) → Judge deposits the ledger (22:00) → Pollux takes the desk under Castor's login (~03:00) → Halloran checks in, served by a bandaged manager (03:04) → Deposit room opened by an unbandaged, left-handed figure (03:05) → Twins swap back; Nadia sees Castor at the desk, no bandage (03:20).
**Clues** `deposit-log` (manager key 03:05), `cctv-still` (figure holds key in **left** hand, watch on right wrist, both hands unbandaged), `handedness` (revealOnRead Nadia S2: Castor's the lefty — watch on right wrist), `incident-report` (Pollux's right-hand burn yesterday), `desk-log` (login Castor; Halloran check-in 03:04), `halloran-saw` (revealOnRead: the manager who checked him in had a bandaged right hand), `nadia-round` (03:20: Castor at desk, no bandage), `typed-note`, `motive-2019` (revealed by breaking Castor S3), `ledger-gazette` (Gazette prints the ledger).
**Statements** Castor S1 "At the desk all night—checked in Halloran at 03:04, under my login." contradictedBy `halloran-saw` → "Halloran was drunk." S2 "Pollux was on rounds; with that bandage he'd hardly be opening doors." S3 "Never heard of Whitlock before tonight." contradictedBy `motive-2019` → "He ruined Dad." Pollux S1 "I did the rounds; Castor was at the desk." contradictedBy `halloran-saw` → "Nobody can tell us apart." S2 "The one in the footage could be either of us." contradictedBy `cctv-still` → "...Castor. Those are Castor's hands." Whitlock S1 "Personal papers." contradictedBy `ledger-gazette`. Nadia S1 passed the desk at 03:20, Castor, no bandage → reveal `nadia-round`; S2 handedness → reveal `handedness`. Halloran S1 bandaged right hand, slow typist → reveal `halloran-saw`. Birgitta S1 asleep.
How does `motive-2019` get revealed if Castor S3 needs it? → from a hotspot: the twins' office has a framed photo of "Hotel Marlowe, 1987–2019" with a court notice (`motive-2019`). Good.
**Prove it** Q1 Which physical details identify Castor in the footage? → left-hand key, watch on right wrist, no bandage. Q2 Why doesn't the desk login clear Castor? → Pollux worked the desk under his login. Q3 Who was at the desk at 03:04? → Pollux. Q4 Riddle answer? → a map.

### Case 19 — "The Clockmaker's Paradox"  (extreme)
**Location** Councillor Vivienne Ashgrove's townhouse study · **Date** the week after UK clocks go back but before US clocks do (New York only **4 hours** behind) · **Time** drive placed on desk 21:00 (by phone), gone 21:15 · **Crime** a hard drive of bribe records taken.
**Suspects**
- `c19-ashgrove` Councillor Vivienne Ashgrove, 54. Victim/villain.
- `c19-julian` Julian Perrault, 29, aide. Innocent liar (video-call alibi is wrong; was secretly with partner Theo).
- `c19-elspeth` Elspeth Marr, 61, horologist servicing the study longcase clock 20:30–21:30. **CULPRIT.** Motive: Ashgrove's planning vote demolished her workshop.
- `c19-agnieszka` Mrs. Agnieszka Wolska, 58, housekeeper. Trusts clocks, not phones.
- `c19-rafe` Rafe Ashgrove, 23, son. Crypto.
- `lucien` Lucien (hired by Ashgrove; alibi: darts with Otto at The Hanged Man) — use the bureau character directly.
**Logic** Elspeth set the study clock **15 minutes fast** while "regulating" it. She and Agnieszka had tea in the kitchen until the study clock struck nine — really 20:45. Elspeth then returned to the study alone (20:45–21:30), covering the real 21:00–21:15 window. Her service notes say she'd reset it before leaving; it still reads +15.
Julian: "On a call with Dana in New York at nine; her clock shows four; five hours behind." That week NY is 4 hours behind → the call was at 20:00. Innocent lie (with Theo at nine).
**Puzzle 1** `code` "Time zones": given Nia's DST fact and the recording's NY clock at 4:00 PM, "What time was it in Greywick during the call?" answers ["8 pm","8pm","20:00","2000","eight","8:00 pm","800pm","8"].
**Puzzle 2** `order` "Two clocks": Elspeth arrives (20:30) → Elspeth sets the study clock 15 min fast → Study clock strikes "nine" (really 20:45); Elspeth returns to the study alone → Ashgrove places the drive on the desk (21:00 by phone) → Ashgrove returns; drive gone (21:15) → Elspeth leaves (21:30).
**Clues** `dst-fact` (Nia), `call-recording` (NY clock 4:00 PM), `study-clock` (reads 15 min ahead of the hall clock and Nia's phone), `service-notes` ("regulated +15 for test — return to true time before leaving"), `tea` (revealOnRead Agnieszka S1), `drive-timeline` (Ashgrove's phone), `theo` (revealed by breaking Julian S1), `workshop` (revealed by breaking Elspeth S3; hotspot alt: a planning-notice clipping in her toolbox), `wool-fibre` (window latch: lilac merino), `typed-note` ("You'll see the clockmaker first. Good." dropped e), `darts` (Lucien's alibi).
**Statements** Elspeth S1 "In the kitchen with Agnieszka until the clock struck nine, then back to the study—where the drive had already gone." contradictedBy `study-clock` → "Regulating a clock is not a crime." S2 "I returned it to true time before leaving, as my notes say." contradictedBy `service-notes`?? (notes say she should have) → use `study-clock` for S2 and `service-notes` for S1: S1 contradictedBy `service-notes` ("+15 for test" ⇒ the nine o'clock chime was 20:45) → "A test, nothing more." S2 contradictedBy `study-clock` (still +15) → silence. S3 "I bear the Councillor no grudge." contradictedBy `workshop` → "She voted my life into rubble." Julian S1 "Nine o'clock, call with Dana in New York; her clock says four; five hours behind. QED." contradictedBy `dst-fact` → "...Fine. It was eight. At nine I was with Theo. Vivienne doesn't know about Theo." → reveal `theo`. Agnieszka S1 tea till the study clock struck nine, then she went back to the clock → reveal `tea`; S2 "I trust clocks, not phones." Rafe S1 shorting a coin, timestamps, bro. Lucien S1 darts with your Chief Inspector; "she cheats." → reveal `darts`. Ashgrove S1 "Constituency correspondence." (uncontradictable here).
**Prove it** Q1 True time when the study clock struck nine? → 8:45. Q2 Why is Julian's alibi wrong but innocent? → 4-hour gap that week; he was with Theo. Q3 Who was alone in the study 8:45–9:30? → Elspeth. Q4 What suggests the Cartographer has been inside the Bureau? → the note knew the briefing-room plan.

### Case 20 — "The Cartographer"  (extreme · finale)
**Location** The Lantern Bureau itself · A final map arrives: X marks the Bureau. Note: "You have the map. Name the cartographer."
**Suspects** (bureau cast used directly): `otto`, `quill`, `nia`, `hestia`, `lucien`. **CULPRIT: `hestia`.**
**Puzzle 1** `code` "The last note" — six lines; first letters spell HESTIA:
"Hear the city breathe beneath its paper skin, / Every map I drew was a door you walked in. / Sand and tide and brass and ink: I showed you where to look, / Time was never on my side; I borrowed it from a book. / In the end a lantern burns for one who was not heard— / All roads end at your own door. Now say the final word." Hint: first letters. Answers ["hestia","hestia vane"].
**Puzzle 2** `order` "The Vane file": Lantern Street fire (March 1991) → Constable Marsh arrests Tobias Vane (April 1991) → Tobias convicted on Kessler's "expert" evidence (Nov 1991) → Hestia Vane hired as Bureau archivist (Feb 1992) → Tobias dies in prison (1994) → Archive renumbered GB→GWB (1998) → First Cartographer map (this year).
**Clues (recap + new)** `old-numbering` (GB-1991-0417 pre-1998; staff then: Otto since 1989, Hestia since 1992), `tobias-file` (archive: Tobias Vane, arson, GB-1991-0417; sign-out card: checked out 14 times this year by "H.V."), `typewriter` (archive Remington, dropped e; test page matches), `wool` (lilac merino — Hestia knits for everyone: Otto, Nia, Rookie all own one ⇒ not decisive alone), `briefing-room` (plan discussed with Otto, Nia, Quill, Hestia; Lucien absent — gate log), `handedness` (maps drawn right-handed per Quill's stroke analysis; Quill is left-handed), `nia-lisbon` (Nia at a conference in Lisbon the night of Tide Tables — flight record), `otto-arrest` (Otto was the arresting constable — target, not author), `compass-rose` (Quill: "a vane without its north — a weathervane. Vane."), `confession-letter` (revealed on accusation).
**Statements** Otto S1 "I arrested Tobias Vane. I was twenty-three. The evidence was Kessler's." (true, revealOnRead `otto-arrest`) S2 "I don't type. Never learned." Quill S1 "The maps are a right-hander's—look at the shading strokes. My left hand is the honest one." (reveal `handedness`) S2 "A vane without its north." (reveal `compass-rose`) Nia S1 Lisbon, flight record (reveal `nia-lisbon`); S2 "GB numbering? I had to look it up." Hestia S1 "I file things, dear. I don't draw them." contradictedBy `tobias-file` → "Anyone may sign H.V." S2 "That old Remington hasn't been used in years." contradictedBy `typewriter` → "...The e. Yes." S3 "Tobias is a common name." contradictedBy `old-numbering`? no → contradictedBy `otto-arrest`? Make S3 "I never knew anyone called Tobias Vane." contradictedBy `tobias-file` (same clue acceptable) — better give `confession` path: S3 contradictedBy `compass-rose` → "My brother made weathervanes. Before." Lucien S1 "I was never in your briefing room; your Chief Inspector wouldn't let me past the kettle." (reveal `briefing-room`).
**Prove it** Q1 Which clue excludes Lucien? → never in the briefing room. Q2 Which excludes Quill? → left-handed; maps right-handed. Q3 Which excludes Nia? → in Lisbon during Tide Tables. Q4 Why Hestia rather than Otto? → Otto was the arresting constable (the target, not the author); H.V. sign-outs; her Remington. Q5 Meaning of the compass rose? → a Vane without its north.
**Closing** Hestia confesses gently; she never kept anything; every target framed Tobias. Otto reopens GB-1991-0417. Hestia: "File it properly, dear." Pip sits on her knitting. Final line, Otto: "Hm. Rookie. You're not a rookie anymore."
