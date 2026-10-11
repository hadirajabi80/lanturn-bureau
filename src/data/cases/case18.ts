import type { CaseFile } from '../types';

/**
 * CASE 18 — "The Mirror Twins"
 * Extreme tier · The Cartographer arc, part three.
 * A judge's bribery ledger leaves a hotel safe-deposit room at 03:05.
 * The CCTV shows "a Marlowe". There are two of them, and they are identical
 * in every respect but one hand.
 */
export const case18: CaseFile = {
  id: 'case-18',
  number: 18,
  title: 'The Mirror Twins',
  difficulty: 'extreme',
  tagline: 'Two faces, one key, and a watch on the wrong wrist.',
  location: 'Greywick Grand Hotel — night shift',
  time: '03:00 – 03:20',
  crime:
    "Judge Ambrose Whitlock's private ledger was removed from the hotel's safe-deposit room at 03:05, opened with the night manager's key; the Gazette printed the ledger — a record of bribes — the following morning.",
  palette: { from: '#1A1420', to: '#3A2A1E', glow: '#C9A227' },

  briefing: [
    "The Greywick Grand is the kind of hotel that still has a night manager, a brass bell on the desk and a safe-deposit room with a mahogany door. At 22:00 Judge Ambrose Whitlock, in town for a judicial dinner, deposited a slim leather ledger there and asked for it to be treated as “personal papers”. At 03:05 the deposit log records the room being opened with the manager's key. At 06:30 the Greywick Gazette's early edition carried extracts from the ledger: dates, sums, and the names of men whose cases had gone unexpectedly well in Whitlock's court.",
    "The hotel's night managers are Castor and Pollux Marlowe, identical twins, thirty-four, who have shared the shift for six years and are famous among the staff for being indistinguishable by anyone but their mother. The CCTV in the deposit corridor shows one of them at 03:05, key in hand, face turned from the camera. The desk login for the whole night is Castor's. Pollux, everyone agrees, was on his rounds.",
    "There is a complication. Yesterday afternoon Pollux Marlowe burned his right hand on a kitchen hot-plate — a dressing the size of a mitten, logged in the hotel's incident book. There is a second complication: a guest named Gregor Halloran, slightly drunk and extremely observant, checked in at 03:04, one minute before the deposit room opened, and spent the time remembering things.",
    "Left on the deposit room shelf where the ledger had been was a hand-drawn map of Greywick with a compass rose missing its north point, and a typed riddle: “I have towns but no houses, mountains but no trees, water but no fish. What am I?” The lowercase e sits a shade low on every line. Otto looked at it for a long time.",
    "Judge Whitlock wants his papers back and the Gazette prosecuted. His wife Birgitta wants to go home. Security chief Nadia Ferrante wants to know which of her night managers she is about to lose. The Bureau wants a mirror held up to a mirror.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Hotel. Judge. Ledger. Twins. I already have a headache.', mood: 'neutral' },
    { speaker: 'nia', text: 'Identical twins who share a job and, apparently, a login. The desk system thinks Castor worked all night. The desk system has never met Pollux.', mood: 'smug' },
    { speaker: 'quill', text: 'The Gazette ledger is Whitlock’s hand. Bribes, Rookie. Our Cartographer has moved from forgers and harbourmasters to the bench. The targets are climbing.', mood: 'thinking' },
    { speaker: 'otto', text: 'And another typed note. Look at the e. It drops. Our archive Remington does that.', mood: 'thinking' },
    { speaker: 'hestia', text: 'Half the typewriters in Greywick do, Ottoline.', mood: 'neutral' },
    { speaker: 'otto', text: 'Hm.', mood: 'neutral' },
    { speaker: 'nia', text: 'Riddle on the note too. Towns, mountains, water. I know the answer and I am not telling you because Otto said I spoil things.', mood: 'happy' },
    { speaker: 'you', text: 'How do you tell twins apart on a camera that cannot see their faces?', mood: 'neutral' },
    { speaker: 'quill', text: 'By what the hands are doing, dear Rookie. Faces lie. Hands merely work.', mood: 'smug' },
  ],

  scenes: [
    {
      id: 'lobby',
      name: 'Front Desk',
      description:
        'A marble lobby at four in the morning: brass bell, guest ledger, a terminal glowing with a single login. The night smells of lilies and floor wax.',
      palette: ['#1A1420', '#2E2436', '#C9A227'],
      props: ['Bell', 'Hotel', 'KeyRound', 'Lamp', 'BookOpen'],
      hotspots: [
        { id: 'terminal', x: 46, y: 50, label: 'Desk terminal — session log', clueId: 'desk-log' },
        { id: 'note-tray', x: 66, y: 58, label: 'Typed note in the key tray', clueId: 'typed-note' },
        { id: 'bell', x: 30, y: 46, label: 'Brass bell', flavor: 'Polished to a mirror. In it, two of you. Neither one is helpful.' },
        { id: 'lilies', x: 84, y: 40, label: 'Vase of lilies', flavor: 'Replaced every morning at six. These are yesterday’s. They look guilty of nothing.' },
      ],
    },
    {
      id: 'deposit',
      name: 'Safe-Deposit Room',
      description:
        'A mahogany door, a wall of numbered brass boxes, one of them open. On the shelf where a ledger lay, a hand-drawn map of the city and a typed riddle.',
      palette: ['#12100E', '#2A2218', '#D4A857'],
      props: ['Vault', 'Lock', 'Map', 'ScrollText'],
      hotspots: [
        { id: 'deposit-book', x: 26, y: 62, label: 'Deposit room log', clueId: 'deposit-log' },
        { id: 'open-box', x: 60, y: 40, label: 'Box 14, open', flavor: 'Whitlock’s box. Empty but for a Gazette-shaped absence and the smell of good leather.' },
        { id: 'corridor-cam', x: 88, y: 18, label: 'Corridor camera housing', flavor: 'Angled at the door, as it should be. It saw a Marlowe. It did not say which.' },
        { id: 'map-shelf', x: 54, y: 70, label: 'The hand-drawn map', flavor: 'Greywick in confident ink. The compass rose has east, south, west — and a blank where north should be.' },
      ],
    },
    {
      id: 'security',
      name: 'Security Office',
      description:
        'A windowless room of monitors and filing cabinets. Nadia Ferrante’s desk is bare except for a mug reading WORLD’S OKAYEST BOSS and a still frame frozen on screen three.',
      palette: ['#101418', '#1E2A30', '#2EC4B6'],
      props: ['Cctv', 'Monitor', 'FileText', 'ShieldCheck'],
      hotspots: [
        { id: 'still', x: 50, y: 36, label: 'Frozen CCTV frame, 03:05', clueId: 'cctv-still' },
        { id: 'incident-book', x: 22, y: 64, label: 'Staff incident book', clueId: 'incident-report' },
        { id: 'mug', x: 80, y: 68, label: 'Nadia’s mug', flavor: 'A gift from the twins. She has never established which one chose the wording.' },
      ],
    },
    {
      id: 'twins-office',
      name: "Night Managers' Office",
      description:
        'A cramped back office shared by two people who have shared everything. Two chairs, one desk, a framed photograph of a seaside hotel with a court notice tucked behind the glass.',
      palette: ['#1E1A14', '#3A3024', '#C9A227'],
      props: ['Users', 'Frame', 'Coffee', 'Watch'],
      hotspots: [
        { id: 'framed-photo', x: 48, y: 36, label: 'Framed photograph: “Hotel Marlowe, 1987–2019”', clueId: 'motive-2019' },
        { id: 'two-mugs', x: 24, y: 66, label: 'Two identical mugs', flavor: 'C and P, painted on by hand. The paint on P has been touched up. Castor has been drinking from both.' },
        { id: 'watch-hook', x: 76, y: 56, label: 'Watch hook by the door', flavor: 'Two hooks. Two watches. One strap is worn on the left side of the buckle, the other on the right.' },
        { id: 'rota', x: 82, y: 24, label: 'Night rota', flavor: '“Desk: C. Rounds: P.” Written in the same handwriting every single week.' },
      ],
    },
  ],

  clues: [
    {
      id: 'typed-note',
      name: 'The typed riddle',
      kind: 'document',
      icon: 'ScrollText',
      initial: true,
      description:
        '“I have towns but no houses, mountains but no trees, water but no fish. What am I?” Typed on heavy paper; the lowercase e sits low on every line. Found beside a hand-drawn map of Greywick whose compass rose has no north point.',
      detail: 'A riddle a child could answer, left by someone who wants to be understood rather than caught.',
    },
    {
      id: 'ledger-gazette',
      name: 'The Gazette’s ledger',
      kind: 'document',
      icon: 'Newspaper',
      initial: true,
      description:
        'The Greywick Gazette, early edition: facsimile pages from Judge Whitlock’s ledger. Dates, sums, initials; beside each, a case number. Nia has matched eleven of them to verdicts that went the way of the money.',
      detail: 'Whitlock calls them “personal papers”. They are personal to a great many people.',
    },
    {
      id: 'deposit-log',
      name: 'Deposit room log',
      kind: 'document',
      icon: 'Vault',
      description:
        'The deposit room door log: 22:00 opened with manager key (Whitlock deposit, box 14); 03:05 opened with manager key; closed 03:07. No guest key was used.',
      detail: 'There is one manager key. It lives on a chain at the desk — whoever is at the desk.',
    },
    {
      id: 'cctv-still',
      name: 'CCTV still, 03:05',
      kind: 'photo',
      icon: 'Cctv',
      description:
        'A Marlowe at the deposit room door, face turned away. The key is held in the LEFT hand. A wristwatch sits on the RIGHT wrist. Both hands are bare — no dressing, no bandage.',
      detail: 'Faces lie; hands work. These hands are unhurt, and the left one is doing the job.',
    },
    {
      id: 'handedness',
      name: 'Which twin is the lefty',
      kind: 'testimony',
      icon: 'Hand',
      description:
        'Nadia: “Castor is the left-hander. Wears his watch on the right wrist, like all lefties. Pollux is right-handed, watch on the left. It is the only way I have ever told them apart.”',
    },
    {
      id: 'incident-report',
      name: 'Incident report — kitchen burn',
      kind: 'document',
      icon: 'Flame',
      description:
        'Yesterday, 16:40: Pollux Marlowe burned his right hand on the pass hot-plate. Dressed by the duty first-aider; “bulky gauze dressing, right hand, to remain 72 hours.”',
      detail: 'Whoever is wearing a mitten of gauze tonight is Pollux. Whoever is not, is not.',
    },
    {
      id: 'desk-log',
      name: 'Desk terminal session',
      kind: 'digital',
      icon: 'Monitor',
      description:
        'One session all night: login CASTOR.M from 22:00. Check-in processed at 03:04 for G. Halloran, room 212 — typed slowly, with four corrections.',
      detail: 'A login proves whose password was typed. It does not prove whose fingers typed it.',
    },
    {
      id: 'halloran-saw',
      name: 'What Halloran saw',
      kind: 'testimony',
      icon: 'Eye',
      description:
        'Halloran: the manager who checked him in at 03:04 had a bandaged right hand and typed with his left, slowly, apologising. “Big white mitten. You do not forget a mitten.”',
    },
    {
      id: 'nadia-round',
      name: 'Nadia’s 03:20 round',
      kind: 'testimony',
      icon: 'Footprints',
      description:
        'Nadia passed the desk at 03:20 on her round. Castor was at the desk, both hands bare, watch on his right wrist. No bandage anywhere in sight.',
    },
    {
      id: 'motive-2019',
      name: 'Hotel Marlowe, 1987–2019',
      kind: 'document',
      icon: 'Frame',
      description:
        'Behind the glass of the framed photograph: a court notice. In 2019 Judge Ambrose Whitlock ruled against the Marlowe family in a lease dispute with a developer. The family hotel closed within the year. The developer’s initials appear in the Gazette ledger.',
      detail: 'Castor and Pollux grew up in that building. Their father died eight months after it closed.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c18-castor',
        name: 'Castor Marlowe',
        role: 'Night manager',
        age: 34,
        tagline: 'Good evening. Or morning. At the Grand it is always evening.',
        personality: 'Composed, courteous, fiercely protective of his brother; a planner.',
        quirk: 'Checks his watch — on his right wrist — by turning the whole forearm.',
        voice: 'Smooth hotel courtesy with a dry edge; never raises his voice.',
        avatar: { skin: '#E8C4A2', hair: 'slick', hairColor: '#2B1F17', eyes: 'narrow', brows: 'flat', mouth: 'neutral', accessory: 'tie', facial: 'none', outfit: '#1F1A2E', accent: '#C9A227' },
      },
      relation: 'Night manager; his login ran the desk all night. Left-handed.',
      alibi: 'At the front desk from 22:00 to 06:00; checked in Mr Halloran at 03:04.',
      motive: 'Whitlock’s 2019 ruling closed the Marlowe family hotel.',
      greeting: 'Detective. Welcome to the Grand. I would offer you a room, but I suspect you want the deposit room.',
      statements: [
        {
          id: 's1',
          text: 'I was at the desk all night. I checked in Mr Halloran at 03:04, under my login. You can see the session.',
          contradictedBy: 'halloran-saw',
          pressReply: 'Halloran was drunk. He had been at the judicial dinner. He would not have noticed if I had checked him in wearing a diving suit.',
          wrongPressReply: 'That does not move me from my desk.',
        },
        {
          id: 's2',
          text: 'Pollux was on rounds. With that bandage he would hardly be opening doors — he can barely hold a pen.',
        },
        {
          id: 's3',
          text: 'I had never heard of Judge Whitlock before tonight. A guest is a guest. We do not read their luggage.',
          contradictedBy: 'motive-2019',
          pressReply: 'He ruined Dad. He sat in a courtroom and read a developer’s cheque and called it law. We lost the hotel in a year and Dad in two. Yes, I had heard of him.',
          wrongPressReply: 'Guests are names on a register, Detective. Nothing more.',
        },
        {
          id: 's4',
          text: 'The manager key is kept on a chain at the desk. Whoever is at the desk has it. That is the system.',
        },
      ],
      accusedWrong: 'Then explain the login, Detective. The desk does not lie. It only knows one password tonight.',
      accusedRight:
        'Leave Pollux out of it. He sat at my desk because I asked him to, and he hates computers, and he did it anyway with one hand because he is my brother. The ledger was mine to take. Whitlock sat in a courtroom and sold our father’s life for a line in that book, and nobody — not you, not the Bureau — ever opened it. I did not know who sent me the note telling me which box, and I did not care. I would carry that key in my left hand again tomorrow.',
    },
    {
      character: {
        id: 'c18-pollux',
        name: 'Pollux Marlowe',
        role: 'Night manager',
        age: 34,
        tagline: 'I am the other one.',
        personality: 'Warmer, clumsier, a poor liar who lies anyway for his brother.',
        quirk: 'Tucks his bandaged right hand behind his back when it is mentioned.',
        voice: 'Same courtesy as Castor, less polish; stumbles when cornered.',
        avatar: { skin: '#E8C4A2', hair: 'slick', hairColor: '#2B1F17', eyes: 'round', brows: 'worried', mouth: 'smile', accessory: 'tie', facial: 'none', outfit: '#1F1A2E', accent: '#D4A857' },
      },
      relation: 'Night manager; Castor’s twin. Right-handed, right hand bandaged.',
      alibi: 'On rounds of the upper floors from 02:30 to 03:30.',
      motive: 'The same 2019 ruling — but his hand rules him out of the deposit room.',
      greeting: 'Hello. Yes, I am Pollux. The bandage is the giveaway. Everyone says so.',
      statements: [
        {
          id: 's1',
          text: 'I did the rounds; Castor was at the desk. That is the rota. It is always the rota.',
          contradictedBy: 'halloran-saw',
          pressReply: 'Nobody can tell us apart. Nobody. The man was drunk — he saw a Marlowe, that is all.',
          wrongPressReply: 'I was upstairs. That proves nothing about where I was.',
        },
        {
          id: 's2',
          text: 'The one in the footage could be either of us. We have the same hands. The same everything.',
          contradictedBy: 'cctv-still',
          pressReply: '...Castor. Those are Castor’s hands. Key in the left, watch on the right. And no — no dressing. Oh, Cas.',
          wrongPressReply: 'You are looking at a Marlowe. Congratulations. There are two.',
        },
        {
          id: 's3',
          text: 'I burned my hand on the pass yesterday. It is in the incident book. It hurts like anything. I cannot grip.',
        },
      ],
      accusedWrong: 'With this hand? Detective, I could not open a jar tonight, never mind a deposit room.',
    },
    {
      character: {
        id: 'c18-whitlock',
        name: 'Judge Ambrose Whitlock',
        role: 'Circuit judge',
        age: 63,
        tagline: 'The bench does not explain itself.',
        personality: 'Imperious, cold, accustomed to being the last word in every room.',
        quirk: 'Taps a signet ring against whatever surface is nearest when displeased.',
        voice: 'Judicial, Latin tags, speaks in rulings.',
        avatar: { skin: '#F1D2B6', hair: 'short', hairColor: '#B8B8B8', eyes: 'narrow', brows: 'angry', mouth: 'frown', accessory: 'monocle', facial: 'none', outfit: '#2B1F2E', accent: '#C8323C', age: 'old' },
      },
      relation: 'Owner of the ledger; victim of the theft and author of its contents.',
      alibi: 'Asleep in the Royal Suite from midnight.',
      greeting: 'Detective. I expect my property recovered and the newspaper restrained. In that order.',
      statements: [
        {
          id: 's1',
          text: 'Personal papers. Private correspondence of a confidential character. Nothing of public interest whatsoever.',
          contradictedBy: 'ledger-gazette',
          pressReply: 'A forgery. A fabrication by a gutter press. I will have an injunction by noon and the editor by evening.',
          wrongPressReply: 'That has no bearing on the nature of my papers.',
        },
        { id: 's2', text: 'I deposited the box at ten and retired at midnight. My wife will confirm it. She confirms most things.' },
        { id: 's3', text: 'The hotel has a duty of care. I intend to see it discharged, ruinously.' },
      ],
      accusedWrong: 'Steal my own ledger and give it to the Gazette? Res ipsa loquitur, Detective: you are a fool.',
    },
    {
      character: {
        id: 'c18-nadia',
        name: 'Nadia Ferrante',
        role: 'Head of security',
        age: 31,
        tagline: 'I watch the cameras. The cameras watch everyone else.',
        personality: 'Dry, competent, fond of the twins and furious about it.',
        quirk: 'Rewinds footage with a single finger, never looking at the controls.',
        voice: 'Flat, factual, deadpan jokes delivered without a flicker.',
        avatar: { skin: '#6B3F2A', hair: 'buzz', hairColor: '#1B1B1B', eyes: 'sharp', brows: 'flat', mouth: 'neutral', accessory: 'headset', facial: 'none', outfit: '#1E2A30', accent: '#2EC4B6' },
      },
      relation: 'Head of hotel security; made the 03:20 round.',
      alibi: 'In the security office until 03:15; walked her round 03:15–03:35.',
      greeting: 'Ferrante. Security. I have the footage, the logs and about six hours of sleep debt. Go.',
      statements: [
        {
          id: 's1',
          text: 'I passed the desk at 03:20. Castor was there. Both hands bare, watch on the right. No bandage anywhere.',
          revealClueId: 'nadia-round',
          revealOnRead: true,
        },
        {
          id: 's2',
          text: 'Castor is the lefty. Watch on the right wrist. Pollux is right-handed, watch on the left. It is the only tell, and it has never failed me.',
          revealClueId: 'handedness',
          revealOnRead: true,
        },
        { id: 's3', text: 'The deposit corridor camera is angled for the door, not for faces. Management wanted guests to feel “unobserved”. Management is an idiot.' },
      ],
      accusedWrong: 'I am the only person in this building who can prove where she was every single minute. Check my own cameras.',
    },
    {
      character: {
        id: 'c18-halloran',
        name: 'Gregor Halloran',
        role: 'Guest, room 212',
        age: 49,
        tagline: 'Three brandies and a photographic memory.',
        personality: 'Tipsy, garrulous, maddeningly accurate about details.',
        quirk: 'Closes his eyes to remember and describes things as if reading them off the lids.',
        voice: 'Rambling, warm, circles back to the point with uncanny precision.',
        avatar: { skin: '#E8B48C', hair: 'wavy', hairColor: '#8B5A2B', eyes: 'sleepy', brows: 'raised', mouth: 'grin', accessory: 'scarf', facial: 'stubble', outfit: '#4A3A2A', accent: '#D4A857' },
      },
      relation: 'Checked in at 03:04, one minute before the deposit room opened.',
      alibi: 'In a taxi until 03:00; at the desk 03:02–03:08; in room 212 thereafter.',
      greeting: 'Ah, the detective! Sit, sit. I remember everything. It is a curse. Ask me what the taxi driver was humming.',
      statements: [
        {
          id: 's1',
          text: 'The chap who checked me in had a bandaged right hand. Great white mitten. Typed with his left, one finger, apologising. Took an age. I remember thinking: poor devil.',
          revealClueId: 'halloran-saw',
          revealOnRead: true,
        },
        { id: 's2', text: 'I went up at 03:08. The lift smelled of lilies. The corridor smelled of lilies. The whole hotel is a lily.' },
        { id: 's3', text: 'I did see a second one — a second manager — crossing the lobby towards the back as I waited. No bandage on that one. Same face. I assumed I was drunker than I was.' },
      ],
      accusedWrong: 'My dear fellow, I could not have found the deposit room with a map. Though I gather someone left one.',
    },
    {
      character: {
        id: 'c18-birgitta',
        name: 'Birgitta Lund-Whitlock',
        role: "Judge's wife",
        age: 55,
        tagline: 'I have been asleep for thirty years.',
        personality: 'Icy, immaculate, deeply uninterested in her husband’s affairs.',
        quirk: 'Smooths a non-existent crease from her sleeve when bored.',
        voice: 'Brief, glacial, Scandinavian precision.',
        avatar: { skin: '#F2DCC4', hair: 'bun', hairColor: '#E0D6C8', eyes: 'narrow', brows: 'flat', mouth: 'neutral', accessory: 'pearls', facial: 'none', outfit: '#2E2E3A', accent: '#B9A3D6' },
      },
      relation: 'Shared the Royal Suite with the judge.',
      alibi: 'Asleep from 23:30; did not wake until the Gazette was slid under the door.',
      greeting: 'Yes? I was asleep. I am frequently asleep. It is the only time Ambrose is quiet.',
      statements: [
        { id: 's1', text: 'I was asleep. I take a tablet at eleven and nothing wakes me, not even Ambrose reading his own judgments aloud.' },
        { id: 's2', text: 'The ledger? I have never read it. I knew it existed in the way one knows a house has drains.' },
        { id: 's3', text: 'If it is true, I shall be in Copenhagen by Friday. If it is false, I shall be in Copenhagen by Saturday.' },
      ],
      accusedWrong: 'I have not left a bed voluntarily before nine o’clock since 1994, Detective.',
    },
  ],

  puzzles: [
    {
      type: 'code',
      id: 'typed-riddle',
      title: 'The typed riddle',
      prompt:
        'Left on the deposit room shelf, typed with a dropped lowercase e:\n\n*“I have towns but no houses, mountains but no trees, water but no fish. What am I?”*\n\nAnswer the Cartographer.',
      inputLabel: 'What am I?',
      answers: ['map', 'a map', 'the map'],
      hint: 'Something that shows all those things without containing any of them. Something the Cartographer keeps leaving behind.',
      explanation:
        'A map has towns, mountains and water drawn upon it, and none of the living things inside them. The Cartographer is telling the Bureau, as plainly as a riddle can, what they are: a map-maker. And every map so far has pointed at someone who should have been caught long ago.',
    },
    {
      type: 'order',
      id: 'the-swap',
      title: 'The swap',
      prompt:
        'Two identical men, one key, one login and one bandage. Put the night’s events in the order they actually happened.',
      items: [
        { id: 'burn', text: 'Pollux burns his right hand on the kitchen hot-plate (yesterday afternoon)' },
        { id: 'deposit', text: 'Judge Whitlock deposits the ledger in box 14 (22:00)' },
        { id: 'swap-in', text: 'Pollux takes the front desk under Castor’s login (around 03:00)' },
        { id: 'checkin', text: 'Halloran checks in, served by a manager with a bandaged right hand (03:04)' },
        { id: 'door', text: 'The deposit room is opened by an unbandaged, left-handed figure (03:05)' },
        { id: 'swap-back', text: 'The twins swap back; Nadia sees Castor at the desk with no bandage (03:20)' },
      ],
      correctOrder: ['burn', 'deposit', 'swap-in', 'checkin', 'door', 'swap-back'],
      hint: 'The burn came first — it is what makes the twins tellable apart. Then follow the bandage: where it is, and where it is not.',
      explanation:
        'Pollux’s burn yesterday gave the twins one visible difference. Whitlock deposited the ledger at 22:00. Around 03:00 Pollux sat at the desk under Castor’s login and checked Halloran in one-handed at 03:04 — while Castor, both hands bare, key in his left, opened the deposit room at 03:05. By 03:20 Castor was back at the desk for Nadia to see, and Pollux back on his rounds.',
    },
  ],

  hints: [
    'The desk login tells you whose password was used, not whose hands were on the keys. Find a witness who saw the hands.',
    'Pollux’s bandage is the only thing that tells the twins apart tonight. Where is it at 03:04? Where is it at 03:05? Where is it at 03:20?',
    'The CCTV figure holds the key in the left hand, wears the watch on the right and has no dressing. Ask Nadia which twin is the lefty, then show Pollux the still.',
  ],

  culpritId: 'c18-castor',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Which physical details identify Castor as the figure in the 03:05 footage?',
      options: [
        { id: 'a', text: 'Key in the left hand, watch on the right wrist, no bandage' },
        { id: 'b', text: 'A bandaged right hand and a name badge reading C' },
        { id: 'c', text: 'His face, turned briefly toward the camera' },
        { id: 'd', text: 'The smell of lilies, which only Castor wears' },
      ],
      correct: 'a',
      explanation: 'Castor is the left-hander who wears his watch on the right wrist; Pollux is right-handed with his right hand in a gauze mitten. The figure at the door is left-handed, right-wristed and unhurt.',
    },
    {
      id: 'q2',
      prompt: 'Why does the desk terminal’s all-night CASTOR.M session not clear Castor?',
      options: [
        { id: 'a', text: 'The terminal clock was wrong by fifteen minutes' },
        { id: 'b', text: 'Pollux worked the desk under Castor’s login during the theft' },
        { id: 'c', text: 'Castor never logged in at all — Nadia did' },
        { id: 'd', text: 'The session was created by the Cartographer remotely' },
      ],
      correct: 'b',
      explanation: 'A login proves a password, not a person. Halloran was checked in at 03:04 by a bandaged, one-handed manager — Pollux — typing slowly under his brother’s credentials.',
    },
    {
      id: 'q3',
      prompt: 'Who was actually at the front desk at 03:04?',
      options: [
        { id: 'a', text: 'Castor Marlowe' },
        { id: 'b', text: 'Nadia Ferrante' },
        { id: 'c', text: 'Pollux Marlowe' },
        { id: 'd', text: 'Nobody — Halloran checked himself in' },
      ],
      correct: 'c',
      explanation: 'Halloran’s manager had a bandaged right hand; the incident book puts that bandage on Pollux. Castor was on his way to the deposit room.',
    },
    {
      id: 'q4',
      prompt: 'What is the answer to the Cartographer’s typed riddle?',
      options: [
        { id: 'a', text: 'A ledger' },
        { id: 'b', text: 'A mirror' },
        { id: 'c', text: 'A map' },
        { id: 'd', text: 'A hotel' },
      ],
      correct: 'c',
      explanation: 'Towns without houses, mountains without trees, water without fish: a map. The Cartographer is naming their own trade.',
    },
  ],

  solution: [
    'Identical twins defeat a camera. They do not defeat a bandage. Yesterday afternoon Pollux Marlowe burned his right hand on the kitchen hot-plate, and the duty first-aider wrapped it in a gauze dressing the size of a mitten. From that moment there was exactly one way to tell the Marlowes apart, and the whole case turns on where that mitten was at three different minutes.',
    'At 03:04 Gregor Halloran was checked in by a night manager with a bandaged right hand who typed with his left, one slow finger at a time, under the desk login CASTOR.M. That was Pollux, sitting at his brother’s desk under his brother’s password. The desk terminal proves which password was used and nothing about which twin used it.',
    'At 03:05 the deposit room door opened with the manager key. The corridor camera shows a Marlowe, face turned away: key in the LEFT hand, watch on the RIGHT wrist, both hands bare. Nadia Ferrante has told the twins apart for six years by one tell — Castor is the left-hander who wears his watch on the right. The hands at the door are Castor’s. Pollux, shown the still, said so himself.',
    'At 03:20 Nadia passed the desk on her round and saw Castor, bare-handed, watch on the right. By then the twins had swapped back: Pollux upstairs on his rounds, Castor behind the desk where the login said he had been all along. Halloran, waiting for his key at 03:04, even saw the second manager — no bandage — crossing the lobby towards the back. He assumed he was drunk. He was, slightly. He was also right.',
    'The motive was behind glass in their own office. “Hotel Marlowe, 1987–2019” — the family hotel on the coast, and behind the photograph a court notice: Judge Ambrose Whitlock’s 2019 ruling in favour of a developer whose initials, with a sum beside them, appear in the ledger the Gazette printed this morning. The Marlowes lost the hotel in a year and their father in two. Castor said he had never heard of Whitlock. He had thought of little else.',
    'Castor stole the ledger; Pollux lied for him and would have gone on lying. Whitlock will keep neither his papers nor his bench. And again the author stood behind the actor: a note told Castor which box and which hour, and a map was left on the shelf with its compass rose missing north — typed, Otto noticed, on a machine whose lowercase e drops exactly like the archive Remington’s. Hestia says half the typewriters in Greywick do that. Otto said Hm.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. The lefty. Brother sat at the desk one-handed so the login would say what it said. Loyal. Stupid. Loyal.', mood: 'neutral' },
    { speaker: 'nia', text: 'Eleven verdicts cross-matched to the ledger so far. Whitlock’s injunction was refused by a judge who, I am told, read the Gazette over breakfast and laughed.', mood: 'happy' },
    { speaker: 'quill', text: 'Three maps, Chief Inspector. A forger, a harbourmaster, a judge. Each one left exposed by someone who then walked away from the prize. This is not theft. This is curation.', mood: 'thinking' },
    { speaker: 'you', text: 'Towns but no houses. The Cartographer wanted us to say the word.', mood: 'neutral' },
    { speaker: 'otto', text: 'And the typing. That dropped e. Nia, pull every typed note from sixteen and seventeen and put them next to this one.', mood: 'thinking' },
    { speaker: 'hestia', text: 'I shall fetch them from the archive, dear. They are filed together. Everything is filed.', mood: 'neutral' },
    { speaker: 'otto', text: 'Hm. Thank you, Hestia.', mood: 'neutral' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'neutral' },
  ],
};
