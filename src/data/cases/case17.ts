import type { CaseFile } from '../types';

/**
 * CASE 17 — "Tide Tables"
 * Extreme tier · The Cartographer arc, part two.
 * A harbourmaster's hidden ledger vanishes from a sea-cave that is only
 * reachable two hours a tide. The cave keeps its own time; so does the thief.
 */
export const case17: CaseFile = {
  id: 'case-17',
  number: 17,
  title: 'Tide Tables',
  difficulty: 'extreme',
  tagline: 'The sea opened the door twice. Someone walked through once.',
  location: 'Saltmarsh — the Gullet sea-cave and the harbour',
  time: 'Low water 15:40 (cave reachable 14:40–16:40) and 03:12 (02:12–04:12)',
  crime:
    "Harbourmaster Silas Crane's hidden ledger of bribes and false deportation reports, with a bundle of forged passports, was taken from his “gear store” in the Gullet sea-cave; the ledger reached the Greywick Gazette by the morning post.",
  palette: { from: '#14222B', to: '#2E3A2A', glow: '#9BC4A8' },

  briefing: [
    "Saltmarsh is a town built for tides. Its harbour dries to mud twice a day, its clocks are set to the Admiralty tables, and its sea-cave — the Gullet — can be walked into for an hour either side of low water and not one minute more. Yesterday low water fell at 15:40 and again at 03:12. Those were the only two doors the sea opened.",
    "Harbourmaster Silas Crane kept what he called a gear store at the back of the Gullet: a tin trunk bolted to the rock, above the high-water line. He visited it at 15:00 and found everything present. At 02:30 he visited again — because an anonymous note had told him to — and found the trunk open and empty. He reported the theft of “fishing gear”. By then the Greywick Gazette already had a parcel in Crane’s own handwriting: a ledger of harbour bribes and a list of people reported to Customs as illegal arrivals who were nothing of the kind.",
    "Six people stood near the water that afternoon. Crane himself, oily and indignant. Maren Holt, fisherwoman, who says she was hauling pots off Dunmere Bank alone from one until six. The Reverend Aldous Pym, who watches birds from the headland and writes down everything he sees with a time beside it. Kit Ashworth, who led six tourists round the cove by kayak. Dolores Crane, the harbourmaster’s wife, who was having seaweed pressed onto her at the spa. And Yusuf Demir, the customs officer who has had Crane’s store on his radar for a year and has never once been allowed to open it.",
    "Tucked inside the empty trunk was a hand-drawn map of Saltmarsh and its headland, inked with the same quiet confidence as the one left in the Greywick Museum. The compass rose has no north point. Written beneath the Gullet, in small block capitals: GLYRZH. Nia says it is a cipher. Quill says it is a signature. Otto says Hm.",
    "Crane wants his gear back. The Gazette wants a front page. The Bureau wants to know who walked into a cave during the one hour that mattered, and why the Cartographer keeps sending maps to the people who least deserve rescuing.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Saltmarsh. Sea-cave. A harbourmaster says fishing gear was stolen. The Gazette says otherwise.', mood: 'neutral' },
    { speaker: 'nia', text: 'Ledger of bribes, forged passports, false deportation reports. The Gazette editor cried actual tears of joy. I have the scans.', mood: 'happy' },
    { speaker: 'quill', text: 'And another map, Rookie. Same hand, same heavy paper, same compass rose with its north politely removed. Our Cartographer is a serialist.', mood: 'thinking' },
    { speaker: 'hestia', text: 'Mind the tides, dear. Saltmarsh does not forgive people who are late.', mood: 'neutral' },
    { speaker: 'otto', text: 'Low water 15:40. An hour each side. Crane saw the trunk at three; by half two in the morning it was empty. The afternoon window is where the thief was.', mood: 'thinking' },
    { speaker: 'nia', text: 'Also there is a code. GLYRZH. Six letters, no vowels worth the name. I have a feeling about it and the feeling is “mirror”.', mood: 'smug' },
    { speaker: 'you', text: 'Who told Crane to check at half past two?', mood: 'neutral' },
    { speaker: 'otto', text: 'A note. Typed. Through his letterbox. Someone wanted him to find it gone and report it. Someone wanted him to lie about what it was. Hm.', mood: 'neutral' },
    { speaker: 'hestia', text: "I have packed you a flask, dear. The headland wind is unkind.", mood: 'happy' },
  ],

  scenes: [
    {
      id: 'gullet',
      name: 'The Gullet',
      description:
        'A throat of black rock breathing cold air and brine. Green algae slicks every surface below the tideline; at the back, above it, a tin trunk stands open and empty, bolted to the stone.',
      palette: ['#0F1A1F', '#1E3A2E', '#9BC4A8'],
      props: ['Waves', 'Anchor', 'Box', 'Fish', 'Shell'],
      hotspots: [
        { id: 'trunk', x: 72, y: 46, label: 'The open trunk', clueId: 'crane-note' },
        { id: 'tide-mark', x: 30, y: 70, label: 'High-water line', clueId: 'tide-table' },
        { id: 'algae', x: 52, y: 80, label: 'Green algae on the rock', flavor: 'Enteromorpha, says Quill, who had to be stopped from naming it individually. It grows nowhere else on this coast.' },
        { id: 'cave-mouth', x: 12, y: 40, label: 'Cave mouth', flavor: 'Already ankle-deep. The sea is not interested in your investigation.' },
      ],
    },
    {
      id: 'harbour-office',
      name: "Harbourmaster's Office",
      description:
        'Brass fittings, tobacco, a wall of tide tables and an AIS screen glowing with little green triangles. Crane’s desk is tidy in the way of a man who has recently removed everything incriminating from it.',
      palette: ['#1E1A14', '#3C2E1E', '#D4A857'],
      props: ['Ship', 'Radar', 'Clock', 'Newspaper', 'BookOpen'],
      hotspots: [
        { id: 'ais-screen', x: 66, y: 34, label: 'AIS vessel-tracking screen', clueId: 'maren-ais' },
        { id: 'store-log', x: 30, y: 52, label: "Crane's inspection log", clueId: 'crane-check' },
        { id: 'wastebasket', x: 84, y: 78, label: 'Wastepaper basket', clueId: 'spa-receipt' },
        { id: 'gazette', x: 16, y: 72, label: "Today's Gazette", clueId: 'gazette-ledger' },
        { id: 'barometer', x: 48, y: 22, label: 'Barometer', flavor: 'Set to CHANGE. It has been set to CHANGE since the brass was new.' },
      ],
    },
    {
      id: 'quay',
      name: 'The Quay',
      description:
        'Mud at low water, fishing boats leaning on their keels, a kayak hut painted an optimistic yellow. Maren Holt’s boat, the Kestrel, sits furthest out with her oilskins hung to dry on the rail.',
      palette: ['#1C2228', '#3A4A52', '#F0C060'],
      props: ['Sailboat', 'Bird', 'Umbrella', 'LifeBuoy', 'Tent'],
      hotspots: [
        { id: 'oilskins', x: 70, y: 48, label: "Oilskins on the Kestrel's rail", clueId: 'oilskins' },
        { id: 'kayak-hut', x: 22, y: 56, label: 'Kayak hut GPS tracker', clueId: 'kit-gps' },
        { id: 'pots', x: 50, y: 78, label: 'Stack of lobster pots', flavor: 'Empty. The lobsters of Dunmere Bank had an unexpectedly good day.' },
        { id: 'headland-hide', x: 88, y: 20, label: "Pym's birdwatching hide", flavor: 'A folding chair, a flask, a notebook with a lock. Pym keeps the key on a string round his neck.' },
      ],
    },
  ],

  clues: [
    {
      id: 'tide-table',
      name: 'Admiralty tide table',
      kind: 'document',
      icon: 'Waves',
      initial: true,
      description:
        'Saltmarsh tide table for the day: low water 15:40 and 03:12. Local rule, painted on the harbour wall: the Gullet is reachable for one hour either side of low water, and not a minute more.',
      detail: 'The afternoon door: 14:40–16:40. The night door: 02:12–04:12. Nothing walks in between.',
    },
    {
      id: 'gazette-ledger',
      name: "The Gazette's parcel",
      kind: 'document',
      icon: 'Newspaper',
      initial: true,
      description:
        "The Greywick Gazette received, by first post, a leather ledger in Silas Crane's handwriting: harbour bribes by date, and a list of arrivals reported to Customs as illegal. Several were not. The Gazette's lawyers are delighted.",
      detail: 'Also in the parcel: six forged passports, and nothing else. No note. The Gazette was not the one being written to.',
    },
    {
      id: 'crane-check',
      name: "Crane's inspection log",
      kind: 'document',
      icon: 'ClipboardCheck',
      description:
        "Crane's own log of visits to the store. Yesterday: “15:00 — all present.” Then: “02:30 — trunk open. EMPTY.” Written so hard the pen went through the page.",
      detail: 'The theft happened after 15:00 — inside the afternoon window, or in the night one before 02:30.',
    },
    {
      id: 'pym-log',
      name: "Pym's field log",
      kind: 'testimony',
      icon: 'Binoculars',
      description:
        'The Reverend Pym’s notebook, 16:15: “Lone figure in green oilskins enters the Gullet on foot. Tide on the turn. Reckless. No birds.”',
      detail: 'Pym writes the time before he writes anything else. He has done so for forty years.',
    },
    {
      id: 'kit-gps',
      name: 'Kayak tour GPS track',
      kind: 'digital',
      icon: 'MapPin',
      description:
        "Kit Ashworth's group tracker: six tourists and one guide, 14:00–17:00, around the cove and out to the seal rocks. The track never enters the Gullet. Kit was in the water the whole time.",
    },
    {
      id: 'maren-ais',
      name: 'AIS record — the Kestrel',
      kind: 'digital',
      icon: 'Radar',
      description:
        "Maren Holt's boat, the Kestrel, broadcast an anchored position off the Gullet cove from 15:50 to 16:35 — forty-five minutes inside the afternoon window. Dunmere Bank is eleven miles away.",
      detail: 'AIS positions are GPS-derived. They do not drift eleven miles.',
    },
    {
      id: 'yusuf-sheet',
      name: 'Customs house sign-in sheet',
      kind: 'document',
      icon: 'ClipboardList',
      description:
        'Yusuf Demir signed into the customs house at 14:00 and out at 22:00. Three colleagues countersign. He was nowhere near the cave.',
    },
    {
      id: 'spa-receipt',
      name: 'Spa receipt',
      kind: 'document',
      icon: 'Receipt',
      description:
        'Dolores Crane: Saltmarsh Thalasso Spa, Seaweed Wrap Deluxe, 14:30–17:00, paid on the harbourmaster’s card. The receipt was in his wastebasket, crumpled with some force.',
    },
    {
      id: 'oilskins',
      name: "Maren's oilskins",
      kind: 'forensic',
      icon: 'Shirt',
      description:
        "Green oilskins from the Kestrel's rail. Quill found a bright smear of Enteromorpha algae on both knees — the species that grows only in the Gullet. Fresh. Yesterday's.",
      detail: 'Someone knelt on the cave floor in these, within the last twenty-four hours.',
    },
    {
      id: 'brother',
      name: "Maren's brother",
      kind: 'testimony',
      icon: 'UserMinus',
      description:
        "Yusuf confirms: Maren's brother Anders was deported two years ago on a Customs report filed by Crane. Yusuf believes it was false. Anders's name appears in the ledger, with a sum beside it.",
    },
    {
      id: 'crane-note',
      name: 'The note to Crane',
      kind: 'document',
      icon: 'Mail',
      description:
        'A typed slip pushed through Crane’s letterbox yesterday evening: “Check your store at 02:30. Bring a lantern.” The lowercase e sits a shade low. Folded inside it, a hand-drawn map of the headland, compass rose without north, and beneath the Gullet the letters GLYRZH.',
      detail: 'The Cartographer wanted Crane in the cave at night, finding it empty, forced to report it. The map was for us.',
    },
    {
      id: 'window',
      name: 'The afternoon window',
      kind: 'document',
      icon: 'Hourglass',
      description:
        'Working the table: the cave was reachable from 14:40 until 16:40. Crane saw the trunk full at 15:00. The thief therefore entered between 15:00 and 16:40 — or in the night window before 02:30.',
      detail: 'Pym’s 16:15 figure and the Kestrel at anchor 15:50–16:35 both sit squarely inside it.',
    },
    {
      id: 'tobias',
      name: 'TOBIAS',
      kind: 'document',
      icon: 'Key',
      description:
        'GLYRZH, read through an Atbash mirror (A↔Z, B↔Y…), is TOBIAS. A name. Nobody in Saltmarsh is called Tobias. The Cartographer is signing with somebody else’s name.',
      detail: 'Hestia said it was a common enough name, and then said nothing for the rest of the afternoon.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c17-crane',
        name: 'Silas Crane',
        role: 'Harbourmaster',
        age: 55,
        tagline: 'This harbour runs on my say-so.',
        personality: 'Oily, aggrieved, a small tyrant discovering that the tide has turned.',
        quirk: 'Smooths his moustache with the back of a thumb when lying.',
        voice: 'Blustering, officious, falls back on his title.',
        avatar: { skin: '#E8B48C', hair: 'slick', hairColor: '#4A3A2A', eyes: 'narrow', brows: 'thick', mouth: 'frown', accessory: 'hat', facial: 'mustache', outfit: '#1F2A44', accent: '#D4A857' },
      },
      relation: 'Owner of the “gear store”; victim of the theft and author of the ledger.',
      alibi: 'In his office all afternoon; checked the store at 15:00 and again at 02:30.',
      motive: 'None for the theft — every reason to lie about what was taken.',
      greeting: 'Harbourmaster Crane. Some gear was taken from my store and I expect it recovered. Quietly.',
      statements: [
        {
          id: 's1',
          text: 'Fishing gear stolen. Just gear. Nets, a few floats. Sentimental value, nothing more.',
          contradictedBy: 'gazette-ledger',
          pressReply: 'Forgeries! That ledger is a forgery — my handwriting is easy to — I want it withdrawn. I want the Gazette sued.',
          wrongPressReply: 'That is nothing to do with my store.',
        },
        { id: 's2', text: 'I checked the store at three in the afternoon. All present. I check it every day, like a lighthouse keeper.' },
        { id: 's3', text: 'Somebody put a note through my door telling me to go at half two in the morning. I went. Trunk open. Empty. I do not know who wrote it.' },
      ],
      accusedWrong: 'Steal from myself? You people are as useless as the Gazette.',
    },
    {
      character: {
        id: 'c17-maren',
        name: 'Maren Holt',
        role: 'Fisherwoman',
        age: 38,
        tagline: 'The sea does not ask. Neither do I.',
        personality: 'Taciturn, weather-beaten, carries a grief she has turned into a tool.',
        quirk: 'Ties and unties a knot in a length of cord while listening.',
        voice: 'Short sentences. Flat. Says less than she knows and means every word.',
        avatar: { skin: '#D9A57F', hair: 'braids', hairColor: '#8B4A2B', eyes: 'sharp', brows: 'flat', mouth: 'neutral', accessory: 'bandana', facial: 'none', outfit: '#2E5B4A', accent: '#9BC4A8' },
      },
      relation: 'Fisherwoman; her brother was deported on a report Crane filed.',
      alibi: 'Hauling pots off Dunmere Bank, alone, from one until six.',
      motive: 'Crane’s false Customs report deported her brother Anders.',
      greeting: "Ask what you've come to ask. I've pots to mend.",
      statements: [
        {
          id: 's1',
          text: 'Hauling pots off Dunmere Bank, one till six. Alone. Nobody to vouch for me but the lobsters.',
          contradictedBy: 'maren-ais',
          pressReply: 'AIS drifts. Everyone knows that. Salt in the aerial.',
          wrongPressReply: 'That puts me nowhere.',
        },
        {
          id: 's2',
          text: "Haven't set foot in the Gullet since I was a girl. Not since my brother and I used to dare each other at the turn of the tide.",
          contradictedBy: 'oilskins',
          pressReply: "Algae's algae. Grows on every rock in this harbour.",
          wrongPressReply: 'You can wave that about all you like. It does not put me in a cave.',
        },
        {
          id: 's3',
          text: 'No quarrel with Crane. He runs the harbour. I run a boat. We nod.',
          contradictedBy: 'brother',
          pressReply:
            'He put my brother on a boat for nothing. Nothing. Anders had papers. Crane had a price. Two years I have been nodding at that man.',
          wrongPressReply: 'We nod. That is all there is to say.',
        },
        { id: 's4', text: 'Tide was on the turn around four. Anyone in that cave after that was either a fool or in a hurry.' },
      ],
      accusedWrong: 'Prove it. Or get off my boat.',
      accusedRight:
        'Yes. I anchored off the cove, waded in at the turn and took the trunk. I posted the ledger to the Gazette myself because Customs would have buried it and so would you. Anders is in a room in a city he has never been to, because that man wrote a number next to his name. I did not know who left the note under my door telling me where the trunk was and when Crane would be gone. I did not care. I would do it again tonight.',
    },
    {
      character: {
        id: 'c17-pym',
        name: 'Rev. Aldous Pym',
        role: 'Vicar and birdwatcher',
        age: 70,
        tagline: 'Everything observed. Everything recorded. Judgement reserved.',
        personality: 'Gentle, pedantic, sees sin and sandpipers with the same calm eye.',
        quirk: 'Writes the time in the air with one finger before speaking.',
        voice: 'Measured, timestamped, mildly sermonising.',
        avatar: { skin: '#F2DCC4', hair: 'bald', hairColor: '#CCCCCC', eyes: 'sleepy', brows: 'raised', mouth: 'smile', accessory: 'roundGlasses', facial: 'none', outfit: '#2B2B2B', accent: '#9BC4A8', age: 'old' },
      },
      relation: 'Watched the cove from the headland hide all afternoon.',
      alibi: 'In his hide from 13:30 to 18:00, logging birds and boats.',
      greeting: 'Good afternoon. Fourteen species, three boats, one sin. Which would you like first?',
      statements: [
        {
          id: 's1',
          text: 'Quarter past four — a figure in green oilskins walked into the Gullet. Tide on the turn. Reckless. I wrote it down.',
          revealClueId: 'pym-log',
          revealOnRead: true,
        },
        { id: 's2', text: 'I log everything. Birds, boats, sins. The first two for science, the third for Sunday.' },
        { id: 's3', text: 'A fishing boat lay at anchor off the cove most of the second half of the afternoon. I did not note the name. I note birds, not boats, unless they frighten the birds.' },
      ],
      accusedWrong: 'I am seventy and I was in a folding chair. The chair can confirm it; it still has the imprint.',
    },
    {
      character: {
        id: 'c17-kit',
        name: 'Kit Ashworth',
        role: 'Kayak guide',
        age: 24,
        tagline: 'Paddle on the left, paddle on the right, don’t fall in.',
        personality: 'Sunny, breezy, genuinely delighted to be interviewed.',
        quirk: 'Mimes paddling when explaining anything.',
        voice: 'Upbeat, informal, full of “honestly” and “so”.',
        avatar: { skin: '#C9956B', hair: 'curly', hairColor: '#E0B060', eyes: 'round', brows: 'arched', mouth: 'grin', accessory: 'goggles', facial: 'none', outfit: '#F0C060', accent: '#2EC4B6', age: 'young' },
      },
      relation: 'Led a kayak tour round the cove during the afternoon window.',
      alibi: 'On the water with six tourists 14:00–17:00; GPS-tracked.',
      greeting: 'Hi! Oh, a detective. Honestly, cool. So — I was on the water, I can show you the track, it does a little loop.',
      statements: [
        { id: 's1', text: 'Six tourists, zero cave visits. We do not go in the Gullet. Insurance. Also it smells.' },
        { id: 's2', text: 'We passed the Kestrel at anchor around four, I think? Nobody on deck. I waved anyway. I always wave.' },
        { id: 's3', text: 'Crane fines me every month for something. Last month it was “excessive cheerfulness near a working harbour”. I think he made that one up.' },
      ],
      accusedWrong: 'I was literally in a kayak. With six Germans. They have photos. So many photos.',
    },
    {
      character: {
        id: 'c17-dolores',
        name: 'Dolores Crane',
        role: "Harbourmaster's wife",
        age: 52,
        tagline: 'I married a harbour. I did not read the small print.',
        personality: 'Frosty, elegant, privately thrilled by her husband’s downfall.',
        quirk: 'Examines her nails whenever Silas is mentioned.',
        voice: 'Cool, ironic, surgically polite.',
        avatar: { skin: '#F1D2B6', hair: 'bob', hairColor: '#1F1A17', eyes: 'narrow', brows: 'arched', mouth: 'smirk', accessory: 'pearls', facial: 'none', outfit: '#4A2E3A', accent: '#B9A3D6' },
      },
      relation: 'Wife of the harbourmaster; knew about the store, loathed the man.',
      alibi: 'Saltmarsh Thalasso Spa, seaweed wrap, 14:30–17:00.',
      motive: 'Twenty years of marriage to Silas Crane.',
      greeting: 'Detective. If you are here to tell me what my husband keeps in a cave, I assure you I had guessed.',
      statements: [
        { id: 's1', text: 'I was at the spa. Seaweed wrap. Rather ironic, given the week he has had. I enjoyed it enormously.' },
        { id: 's2', text: 'Silas has kept that trunk for eleven years. He told me it was fishing gear. Silas does not fish.' },
        { id: 's3', text: 'If I had wanted to ruin him, I would have done it from the comfort of a solicitor’s office. Caves are for the young.' },
      ],
      accusedWrong: 'I was wrapped in kelp, dear. Immobile. It is on the receipt he so kindly paid for.',
    },
    {
      character: {
        id: 'c17-yusuf',
        name: 'Yusuf Demir',
        role: 'Customs officer',
        age: 45,
        tagline: 'By the book. Even when the book is wrong.',
        personality: 'Upright, frustrated, quietly furious at a system he serves.',
        quirk: 'Straightens his lanyard every time he mentions a regulation.',
        voice: 'Formal, careful, citing sections; warmth leaks through the cracks.',
        avatar: { skin: '#C9956B', hair: 'short', hairColor: '#1B1B1B', eyes: 'sharp', brows: 'flat', mouth: 'neutral', accessory: 'tie', facial: 'stubble', outfit: '#1F2A44', accent: '#D4A857' },
      },
      relation: 'Customs officer who suspected Crane’s store for a year.',
      alibi: 'Customs house, 14:00–22:00, countersigned.',
      motive: 'Wanted Crane exposed — but by the proper channels.',
      greeting: 'Officer Demir. I will answer anything within my remit, and some things outside it.',
      statements: [
        {
          id: 's1',
          text: 'Customs house, fourteen hundred to twenty-two hundred. Sign-in sheet, three countersignatures. I never left the building.',
          revealClueId: 'yusuf-sheet',
          revealOnRead: true,
        },
        {
          id: 's2',
          text: "Crane's store has been on my radar for a year. I could never get a warrant. And Maren Holt's brother was deported on Crane's report — false, I would bet my badge on it. His name is in that ledger with a figure beside it.",
          revealClueId: 'brother',
          revealOnRead: true,
        },
        { id: 's3', text: 'Whoever sent that ledger to the Gazette did my job for me. I am not permitted to be grateful. Consider me not grateful.' },
      ],
      accusedWrong: 'Section four, paragraph two: I was at my desk, and three officers signed to say so. Try again.',
    },
  ],

  puzzles: [
    {
      type: 'code',
      id: 'tide-window',
      title: 'Read the tide table',
      prompt:
        'The Admiralty table gives low water at **15:40**. The harbour-wall rule says the Gullet is reachable for **one hour either side** of low water and not a minute more.\n\nCrane saw the trunk full at 15:00.\n\nUntil what time was the cave still reachable in the afternoon?',
      inputLabel: 'Afternoon window closes at',
      answers: ['16:40', '1640', '4:40 pm', '440pm', '4:40'],
      hint: 'One hour after low water. The sea does not round to the nearest half hour.',
      explanation:
        'Low water 15:40 plus one hour is 16:40. The afternoon window therefore ran 14:40–16:40, and the theft happened between Crane’s 15:00 check and 16:40 — or during the night window, before his 02:30 visit. Pym’s 16:15 figure and the Kestrel’s 15:50–16:35 anchorage both fit the afternoon.',
      revealClueId: 'window',
    },
    {
      type: 'code',
      id: 'atbash',
      title: 'Mirror of the tide',
      prompt:
        'Beneath the Gullet on the Cartographer’s map, in block capitals:\n\n**GLYRZH**\n\nAnd under it, smaller: *“What rises, falls. A becomes Z.”*\n\nDecode the word.',
      inputLabel: 'Decoded word',
      answers: ['tobias', 'tobias.', 't o b i a s'],
      hint: 'Reflect the alphabet: A↔Z, B↔Y, C↔X… G becomes T.',
      explanation:
        'An Atbash mirror maps each letter to its opposite: G→T, L→O, Y→B, R→I, Z→A, H→S. TOBIAS. A name — and nobody in Saltmarsh carries it.',
      revealClueId: 'tobias',
    },
  ],

  hints: [
    'Solve the tide window first. Then ask: whose afternoon puts them inside it, and whose evidence says they were elsewhere?',
    'The AIS screen in the harbour office is the sharpest record. Compare it with what Maren claims about Dunmere Bank.',
    'Maren lies about her boat, her boots and her brother. Yusuf will give you the brother; the Kestrel’s rail will give you the boots. Press her in that order.',
  ],

  culpritId: 'c17-maren',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Whose boat was anchored off the Gullet cove during the afternoon window?',
      options: [
        { id: 'a', text: "Kit Ashworth's kayak group" },
        { id: 'b', text: "Maren Holt's Kestrel" },
        { id: 'c', text: "Silas Crane's harbour launch" },
        { id: 'd', text: 'A visiting trawler, name unknown' },
      ],
      correct: 'b',
      explanation: 'The AIS record shows the Kestrel at anchor off the cove from 15:50 to 16:35 — eleven miles from where Maren claimed to be.',
    },
    {
      id: 'q2',
      prompt: 'Which record does Pym’s 16:15 sighting of a figure in oilskins fit?',
      options: [
        { id: 'a', text: "Kit's GPS track, which loops past the cave mouth" },
        { id: 'b', text: "Yusuf's sign-in sheet at the customs house" },
        { id: 'c', text: "The Kestrel's AIS anchorage, 15:50–16:35" },
        { id: 'd', text: "Dolores's spa appointment" },
      ],
      correct: 'c',
      explanation: 'A figure walks into the Gullet at 16:15; the Kestrel sits at anchor off the cove from 15:50 to 16:35. The one explains the other.',
    },
    {
      id: 'q3',
      prompt: 'What physical evidence puts Maren inside the cave?',
      options: [
        { id: 'a', text: 'Gullet algae on the knees of her oilskins' },
        { id: 'b', text: 'Her fingerprints on the trunk' },
        { id: 'c', text: 'A lobster pot left at the cave mouth' },
        { id: 'd', text: 'Sand in her boots matching the quay' },
      ],
      correct: 'a',
      explanation: 'Quill identified Enteromorpha from the Gullet on both knees of the oilskins drying on the Kestrel — fresh, within twenty-four hours.',
    },
    {
      id: 'q4',
      prompt: 'What does the Atbash note on the map decode to?',
      options: [
        { id: 'a', text: 'GULLET' },
        { id: 'b', text: 'TOBIAS' },
        { id: 'c', text: 'ANDERS' },
        { id: 'd', text: 'LANTERN' },
      ],
      correct: 'b',
      explanation: 'GLYRZH through the mirror alphabet is TOBIAS — a name nobody in Saltmarsh owns, and one the Cartographer seems to be writing for.',
    },
  ],

  solution: [
    'The sea sets the timetable. Low water at 15:40 opened the Gullet from 14:40 until 16:40; Crane saw the trunk full at 15:00; by his 02:30 night visit it was empty. The thief entered either between 15:00 and 16:40 or in the night window before Crane arrived — and only one suspect’s afternoon lines up with the first.',
    'Maren Holt said she was hauling pots off Dunmere Bank, alone, from one until six. The Kestrel’s AIS beacon says she was anchored off the Gullet cove from 15:50 to 16:35. At 16:15 the Reverend Pym logged a lone figure in green oilskins walking into the cave with the tide on the turn. Kit’s kayakers waved at an empty deck around four. Three independent records, one boat, one hour.',
    'Her oilskins finished it. Quill found Enteromorpha — the bright green algae that grows in the Gullet and nowhere else on this coast — smeared on both knees, fresh from the previous day. Maren said she had not set foot in the cave since she was a girl. Algae is not algae, and this algae is particular.',
    'The motive was two years old. Crane’s ledger lists harbour bribes and a column of names he reported to Customs as illegal arrivals. Among them is Anders Holt, Maren’s brother, who had papers and was deported anyway, with a sum written beside his name. Yusuf Demir had suspected the report was false for a year and could never get a warrant. Maren did not wait for one. She posted the ledger to the Gazette because she trusted no one else to open it.',
    'Everyone else is where their paper says they were. Yusuf at the customs house with three countersignatures; Dolores in seaweed at the spa on her husband’s card; Kit on the water with six tourists and a GPS loop that never touches the cave; Pym in his folding chair writing the time before every sentence. Crane himself stole nothing and lied about everything — “just gear” — because the truth was a leather ledger in his own hand.',
    'And the Cartographer? Someone slipped a note under Maren’s door telling her where the trunk was and when Crane would be away, and a second note through Crane’s letterbox telling him to check at 02:30 so that he would have to report a theft he could not describe honestly. Inside Crane’s note was the map: the same heavy paper, the same compass rose without a north point, and six block capitals — GLYRZH — which, mirrored through Atbash, spell TOBIAS. Nobody in Saltmarsh carries that name. Someone in Greywick does, or did, and the Cartographer wants the Bureau to remember.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. Fisherwoman. Didn’t deny it once I’d laid it out. Didn’t apologise either.', mood: 'neutral' },
    { speaker: 'nia', text: 'Crane is being interviewed by three newspapers and one actual prosecutor. The Gazette ran the ledger across pages one to four. Yusuf bought a cake and refuses to say why.', mood: 'happy' },
    { speaker: 'quill', text: 'The cipher, though. GLYRZH. A mirror, as Nia divined — and in the mirror, TOBIAS. Our Cartographer is signing with a borrowed name.', mood: 'thinking' },
    { speaker: 'hestia', text: 'A common enough name, dear.', mood: 'neutral' },
    { speaker: 'otto', text: 'Hm.', mood: 'thinking' },
    { speaker: 'you', text: 'Two maps. Two corrupt men. Two people who did not want to steal anything.', mood: 'neutral' },
    { speaker: 'otto', text: 'Two notes that knew exactly who to push and where. Kessler, Crane. Someone is working through a list. I want to know who wrote the list.', mood: 'angry' },
    { speaker: 'nia', text: 'Hestia? You went quiet. Is the tea cold? I can — Hestia?', mood: 'surprised' },
    { speaker: 'hestia', text: 'Only thinking, dear. It has been a long time since I heard that name said aloud.', mood: 'sad' },
  ],
};
