import type { CaseFile } from '../types';

/**
 * CASE 16 — "The First Map"
 * Extreme tier · The Cartographer arc, part one.
 * A 1569 map leaf vanishes during a gala speech; a hand-drawn map of Greywick
 * is left in its place, its compass rose missing its north point.
 */
export const case16: CaseFile = {
  id: 'case-16',
  number: 16,
  title: 'The First Map',
  difficulty: 'extreme',
  tagline: 'Someone drew Greywick by hand and forgot which way was north.',
  location: 'Greywick Museum, Cartography Wing — gala night',
  time: "Director's speech, 21:18 – 21:30",
  crime:
    "The 1569 “Mercator Lantern” map leaf was lifted from its case during the director's speech and replaced with a hand-drawn map of Greywick carrying a coded string.",
  palette: { from: '#1B1F2E', to: '#3A2E22', glow: '#D4A857' },

  briefing: [
    "The Cartography Wing of the Greywick Museum smells of champagne, floor polish and four hundred years of paper. Tonight it hosted the autumn gala: two hundred guests, one string quartet, and the single most valuable leaf in the building — the 1569 “Mercator Lantern”, a hand-coloured sheet from the first edition of the world map that taught sailors how to draw straight lines across a curved sea.",
    "At 21:18 Director Hieronymus Falk stepped to the lectern, the gallery lights dimmed to a respectful amber, and he spoke for twelve minutes about vision, patronage and himself. When the lights came up at 21:30, the Mercator's case stood open. No alarm. No broken glass. Inside, where the leaf had been, lay a sheet of fresh cartridge paper: a hand-drawn map of Greywick, exquisite, confident, and wrong in one small particular. Its compass rose had no north point.",
    "Across the bottom margin, in a careful hand, someone had written a string of grid references: D4 A1 F2 B3 E5 C6 G1. The map's legend lists fourteen streets by grid square. Nothing else. No demand, no signature. The museum's security chief swears the case can only be opened by a staff access card and that the alarm was overridden from inside the system, not cut.",
    "Six people had reason to be near the case: Falk, who was speaking in front of it; Oona Blackwood, the registrar, who says she spent the speech in the conservation lab; Benedikt Strauss, the conservator, who was at the loading dock with a crate of bubble wrap; Pavel Novotný, the East Gallery guard, who left his post because his radio told him to; and the evening's patrons, Alderman Petrus Kessler and his daughter Sabine, who organised the gala and guarded the guest list like a dragon.",
    "Otto wants to know who opened the case. Nia wants to know what the grid references spell. Quill wants to know why anyone would draw a compass rose and leave out north. Hestia, for once, said nothing at all, and poured the tea.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Museum. Gala. Map worth more than this building. Gone during a speech.', mood: 'neutral' },
    { speaker: 'nia', text: "And the thief left a map in exchange, which is either very polite or very rude. There's a code on it. Grid refs. I love grid refs.", mood: 'happy' },
    { speaker: 'quill', text: 'Observe the compass rose, Rookie. East, south, west — rendered with love. North: absent. One does not forget north. One omits it.', mood: 'thinking' },
    { speaker: 'hestia', text: "Cartridge paper, dear. Heavy, acid-free. The sort an archivist would use.", mood: 'neutral' },
    { speaker: 'otto', text: 'Hm. Six suspects. The case opened with a staff card and the alarm was told to look away. Someone inside did this.', mood: 'neutral' },
    { speaker: 'nia', text: "Security also found a shredder bin in the registrar's office full of very interesting confetti. I'm putting it back together. Give me an hour and a lot of sticky tape.", mood: 'smug' },
    { speaker: 'you', text: 'Who benefits from a stolen Mercator?', mood: 'neutral' },
    { speaker: 'otto', text: "Nobody who wants to sell it. It's too famous. So ask the other question: who gets hurt if it's found somewhere it shouldn't be?", mood: 'thinking' },
    { speaker: 'hestia', text: 'Mind the step on the gallery stairs, dear. It has been loose since 1991.', mood: 'neutral' },
  ],

  scenes: [
    {
      id: 'gallery',
      name: 'Cartography Wing',
      description:
        'A long amber gallery of glass cases and gilt frames. The Mercator case stands open at the far end, a sheet of fresh paper lying where four centuries used to be.',
      palette: ['#1B1F2E', '#2E2A3C', '#D4A857'],
      props: ['Map', 'Compass', 'Globe', 'Frame', 'Wine'],
      hotspots: [
        { id: 'open-case', x: 50, y: 42, label: 'The open Mercator case', clueId: 'left-map' },
        { id: 'case-reader', x: 63, y: 55, label: 'Card reader on the case plinth', clueId: 'access-log' },
        { id: 'security-kiosk', x: 14, y: 68, label: 'Security kiosk radio log', clueId: 'radio-log' },
        { id: 'champagne', x: 82, y: 72, label: 'Champagne tower', flavor: 'Two hundred glasses, four still full. Whoever drank the rest did not notice a theft.' },
        { id: 'lectern', x: 36, y: 60, label: "Director's lectern", flavor: 'Twelve pages of speech. Page nine is underlined in three colours: “my vision”.' },
      ],
    },
    {
      id: 'registrar',
      name: "Registrar's Office",
      description:
        'A small square room of ledgers and index cards, a cardigan over the chair, a radio base station blinking green on the shelf. Everything is labelled. Nothing is out of place, which is itself out of place.',
      palette: ['#2B2520', '#4A3A2A', '#B9A3D6'],
      props: ['BookOpen', 'Radio', 'FileText', 'Coffee', 'Archive'],
      hotspots: [
        { id: 'card-binder', x: 24, y: 48, label: 'Access card register', clueId: 'card-register' },
        { id: 'radio-base', x: 70, y: 36, label: 'Radio base station, handset R-07', clueId: 'handset-register' },
        { id: 'shredder', x: 84, y: 76, label: 'Shredder bin', flavor: 'Emptied by Nia. A single strip remains: “— Never run.”' },
        { id: 'cardigan', x: 42, y: 70, label: 'Grey cardigan on the chair', flavor: 'Pockets: a pencil stub, a museum mint, and a tissue folded eight times.' },
      ],
    },
    {
      id: 'lab',
      name: 'Conservation Lab',
      description:
        'Cold white light, humidity gauges, trays of brushes laid out like surgical tools. A badge reader by the door counts every entry and exit with a small, honest beep.',
      palette: ['#1E2A2E', '#2F4A4A', '#2EC4B6'],
      props: ['Microscope', 'Thermometer', 'Brush', 'Droplets'],
      hotspots: [
        { id: 'badge-reader', x: 12, y: 50, label: 'Door badge reader', clueId: 'lab-badge' },
        { id: 'humidity', x: 60, y: 30, label: 'Humidity gauge', flavor: 'Forty-eight percent. The paper is happier than anyone in the building.' },
        { id: 'brush-tray', x: 74, y: 66, label: 'Tray of brushes', flavor: 'Sable, squirrel, goat. Each has a name tag. One is called Gerald.' },
      ],
    },
    {
      id: 'dock',
      name: 'Loading Dock',
      description:
        'A concrete apron behind the museum, lit by one humming lamp. Crates, bubble wrap, a van with its doors open, and the sea-fog creeping in from the canal.',
      palette: ['#15181F', '#2A2E38', '#8D7B68'],
      props: ['Truck', 'Package', 'Box', 'Warehouse'],
      hotspots: [
        { id: 'bubble-wrap', x: 40, y: 60, label: 'Crate of bubble wrap', flavor: 'Benedikt has popped a neat row of twelve. Nervous, or tidy. Possibly both.' },
        { id: 'dock-radio', x: 68, y: 40, label: 'Wall-mounted dock radio', flavor: 'Switched off. It has been switched off since the battery died in July.' },
        { id: 'van', x: 20, y: 48, label: 'Museum van', flavor: 'Empty. A mileage log reads 0.0 for today. Nobody drove anywhere.' },
      ],
    },
  ],

  clues: [
    {
      id: 'left-map',
      name: 'The hand-drawn map',
      kind: 'document',
      icon: 'Map',
      initial: true,
      description:
        'A beautifully inked map of Greywick on heavy cartridge paper, left in the Mercator case. A compass rose in the corner shows east, south and west — and no north point. The margin reads: D4 A1 F2 B3 E5 C6 G1.',
      detail:
        'The streets are drawn from memory rather than survey — Lantern Street is a shade too wide, as if the artist knew it better than the rest. The legend assigns fourteen streets to grid squares. Someone wants to be followed.',
    },
    {
      id: 'access-log',
      name: 'Case access log',
      kind: 'digital',
      icon: 'KeyRound',
      description:
        'The Mercator case was opened at 21:24 by staff card REG-02, with the alarm set to “maintenance” thirty seconds earlier from the same credential.',
      detail: 'No other card touched the reader all evening. REG-02 is a registrar-series card.',
    },
    {
      id: 'card-register',
      name: 'Access card register',
      kind: 'document',
      icon: 'BookOpen',
      description:
        "The museum's card register, in Oona Blackwood's own neat hand: REG-01 Deputy Registrar (on leave); REG-02 Registrar — O. Blackwood.",
      detail: 'Issued 2016. Never reported lost. Never reissued.',
    },
    {
      id: 'radio-log',
      name: 'Security radio log',
      kind: 'digital',
      icon: 'Radio',
      description:
        'The base station logged one call at 21:21: handset R-07 to the East Gallery guard (Pavel), eleven seconds long. Pavel left his post immediately afterwards.',
      detail: 'Every handset has an ID. R-07 is not one of the security team’s.',
    },
    {
      id: 'handset-register',
      name: 'Handset register',
      kind: 'document',
      icon: 'Radio',
      description:
        "The handset register lists R-07 as the base station in the Registrar's Office. It has not been moved in six years; the shelf dust proves it.",
      detail: 'Whoever sent Pavel to the dock did it from Oona Blackwood’s shelf.',
    },
    {
      id: 'lab-badge',
      name: 'Conservation lab badge log',
      kind: 'digital',
      icon: 'DoorOpen',
      description:
        'The lab badge reader shows Oona Blackwood leaving at 21:19 and returning at 21:29. Ten minutes absent — the whole of the speech.',
      detail: 'She was the only person in the lab that evening. The reader does not lie, and it does not blink.',
    },
    {
      id: 'kessler-basement',
      name: "Kessler's basement",
      kind: 'photo',
      icon: 'Home',
      description:
        "The grid references spell KESSLER. Otto obtained a warrant; the Alderman's townhouse basement held eleven forged Mercator leaves in various stages of ageing — and the real one, delivered anonymously in a tube that morning.",
      detail: "Kessler's hands were shaking before anyone said a word. The forgeries are good. The irony is better.",
    },
    {
      id: 'instructions',
      name: 'Reassembled instructions',
      kind: 'document',
      icon: 'Scissors',
      description:
        "Nia's reconstruction of the shredded note from the registrar's office. Typed instructions for the theft, step by step — ending with the line “— see GB-1991-0417”.",
      detail: 'The lowercase e sits a fraction low on every line. The final line is a file reference in a format nobody at the Bureau uses any more.',
    },
    {
      id: 'provenance',
      name: 'The Lisbon provenance',
      kind: 'testimony',
      icon: 'FileWarning',
      description:
        'Oona admits that in 2014 she signed a false provenance for a Lisbon portolan chart to save an acquisition — and her career. The Cartographer knew. The note threatened to send the file to the Gazette.',
      detail: 'She was not paid. She was cornered.',
    },
    {
      id: 'dock-empty',
      name: 'Nobody at the dock',
      kind: 'testimony',
      icon: 'Truck',
      description:
        "Benedikt was alone at the loading dock throughout the speech and radioed nobody. The dock radio has been dead since July. The call that moved Pavel did not come from the dock.",
    },
  ],

  suspects: [
    {
      character: {
        id: 'c16-oona',
        name: 'Oona Blackwood',
        role: 'Registrar',
        age: 41,
        tagline: 'Everything in its place. Including me.',
        personality: 'Meticulous, haunted, quietly kind; carries a guilt older than tonight.',
        quirk: 'Pulls her cardigan sleeves over her hands when asked a direct question.',
        voice: 'Precise, soft, formal; answers the question asked and not one word more — until she breaks.',
        avatar: { skin: '#E8C4A2', hair: 'bob', hairColor: '#4A3728', eyes: 'sleepy', brows: 'worried', mouth: 'neutral', accessory: 'glasses', facial: 'none', outfit: '#7A7A8C', accent: '#B9A3D6' },
      },
      relation: 'Registrar; holder of card REG-02; custodian of the Mercator’s paperwork.',
      alibi: 'In the conservation lab for the whole of the speech, checking a humidity reading.',
      motive: 'None visible — until the Lisbon file surfaces.',
      greeting: "Detective. I've prepared the case documentation for you. It's all in order. Everything is in order.",
      statements: [
        {
          id: 's1',
          text: 'I was in the conservation lab for the whole speech. I find speeches difficult. I prefer paper.',
          contradictedBy: 'lab-badge',
          pressReply: 'I... stepped out for air. Ten minutes. The lab is airless. That is not a crime.',
          wrongPressReply: 'That does not place me anywhere but where I said I was.',
        },
        {
          id: 's2',
          text: 'My card never left my lanyard. I wear it against my sternum. I would notice.',
          contradictedBy: 'access-log',
          pressReply: 'Then someone cloned it. These things are cloned. I read about it.',
          wrongPressReply: 'I do not see what that has to do with my card.',
        },
        {
          id: 's3',
          text: 'I never touched the radio base. It belongs to security. I would not know which button to press.',
          contradictedBy: 'handset-register',
          pressReply:
            "...It's on my shelf. It has always been on my shelf. They knew that too. They knew about Lisbon. They said they would end me — the Gazette, the board, everything. They told me exactly what to do and when, and I did it, and I hate myself.",
          revealClueId: 'provenance',
          wrongPressReply: 'The radio is not mine. I have said so.',
        },
        {
          id: 's4',
          text: 'The Mercator was fully documented. Condition report, provenance, insurance. I am very thorough about provenance.',
        },
      ],
      accusedWrong: 'I — no. I keep the records. I would never. Please check the records.',
      accusedRight:
        "Yes. Yes, it was me. The card, the radio, the case — all of it, exactly as the note said. I didn't want the map. I don't know who did. They knew about Lisbon and they knew about my shelf and they knew when the lights would go down, and I was so frightened I could barely hold the card steady. Please — whoever they are, they are not finished. The note said so.",
    },
    {
      character: {
        id: 'c16-falk',
        name: 'Director Hieronymus Falk',
        role: 'Museum director',
        age: 60,
        tagline: 'A speech is a gift. You are welcome.',
        personality: 'Vain, florid, genuinely devoted to the collection as an extension of himself.',
        quirk: 'Checks his reflection in every glass case he passes.',
        voice: 'Grand, rolling, third-person about his own achievements.',
        avatar: { skin: '#F1D2B6', hair: 'slick', hairColor: '#9A9A9A', eyes: 'narrow', brows: 'raised', mouth: 'smile', accessory: 'bowtie', facial: 'mustache', outfit: '#2C2C3A', accent: '#D4A857', age: 'old' },
      },
      relation: 'Director; was speaking at the lectern in front of the case throughout.',
      alibi: 'At the lectern, speaking, with two hundred witnesses and a spotlight.',
      greeting: 'Detective. You missed the speech. It was, by common consent, magnificent.',
      statements: [
        { id: 's1', text: 'I spoke for twelve magnificent minutes. Twelve. I timed it. One cannot steal a map and deliver an ovation simultaneously.' },
        { id: 's2', text: 'Generous patrons are never criminals, Detective. The Alderman has given this museum half a million. Criminals do not give; they take.' },
        { id: 's3', text: 'The lights were dimmed for atmosphere. My idea. I confess I did not consider that darkness has other uses.' },
      ],
      accusedWrong: 'Accuse me? I was the only person in the room every single eye was upon. Ask them. Ask all two hundred.',
    },
    {
      character: {
        id: 'c16-benedikt',
        name: 'Benedikt Strauss',
        role: 'Conservator',
        age: 37,
        tagline: 'Paper is patient. People are not.',
        personality: 'Gentle, enormous, slow to speak and impossible to rush.',
        quirk: 'Pops bubble wrap in neat rows when thinking.',
        voice: 'Low, careful, long pauses; literal to a fault.',
        avatar: { skin: '#D9A57F', hair: 'buzz', hairColor: '#3B2A1E', eyes: 'round', brows: 'flat', mouth: 'neutral', accessory: 'none', facial: 'beard', outfit: '#5B6B4A', accent: '#8D7B68' },
      },
      relation: 'Conservator; receiving a late crate at the loading dock.',
      alibi: 'At the loading dock from 21:00 to 21:40 with a crate of bubble wrap and no company.',
      greeting: 'Evening. I was at the dock. I can show you the crate, if that helps. It is a good crate.',
      statements: [
        {
          id: 's1',
          text: 'Nobody at the dock called anyone. The dock radio has been dead since July. I was alone with the bubble wrap.',
          revealClueId: 'dock-empty',
          revealOnRead: true,
        },
        { id: 's2', text: "Oona has not been herself for weeks. She re-files things that are already filed. She stopped eating lunch." },
        { id: 's3', text: 'Pavel came running down at twenty-two minutes past. He looked for whoever had called him. There was only me. Then he ran back.' },
      ],
      accusedWrong: 'I was with a crate. The crate cannot speak for me, but the guard can.',
    },
    {
      character: {
        id: 'c16-pavel',
        name: 'Pavel Novotný',
        role: 'Gallery guard',
        age: 29,
        tagline: 'I followed procedure. Procedure did not follow me.',
        personality: 'Earnest, anxious, desperately keen to have done the right thing.',
        quirk: 'Keeps his radio in his hand even when it is clipped to his belt — holds the clip.',
        voice: 'Quick, apologetic, repeats times to the minute.',
        avatar: { skin: '#F2DCC4', hair: 'short', hairColor: '#8B5A2B', eyes: 'wide', brows: 'worried', mouth: 'o', accessory: 'cap', facial: 'none', outfit: '#1F2A44', accent: '#2EC4B6', age: 'young' },
      },
      relation: 'East Gallery guard; left his post on a radio instruction at 21:21.',
      alibi: 'Posted at the East Gallery door until 21:21; at the loading dock 21:22–21:27; back by 21:28.',
      greeting: "Detective, I want to say first — the radio said dock, now. I went. I'm sorry. I went.",
      statements: [
        { id: 's1', text: "The radio said: East Gallery, loading dock, now. A voice, low. I went down. Nobody there but Benedikt and his bubbles." },
        { id: 's2', text: 'I came back at 21:28 and the case was open and no alarm. None. The panel said MAINTENANCE. Someone overrode it from inside.' },
        { id: 's3', text: 'I did not recognise the voice. It was not Marta on security. It was — careful. Like someone reading.' },
      ],
      accusedWrong: "Me? I left my post because I was told to. I'd never — I'd lose my job. I may lose it anyway.",
    },
    {
      character: {
        id: 'c16-kessler',
        name: 'Alderman Petrus Kessler',
        role: 'Patron and collector',
        age: 66,
        tagline: 'I have given this city more than it deserves.',
        personality: 'Bluster over fear; a bully who has never been caught before tonight.',
        quirk: 'Jabs the air with a fat cigar he is not permitted to light indoors.',
        voice: 'Loud, aggrieved, speaks in donations and lawyers.',
        avatar: { skin: '#E8B48C', hair: 'bald', hairColor: '#777777', eyes: 'narrow', brows: 'angry', mouth: 'frown', accessory: 'monocle', facial: 'bigBeard', outfit: '#3A1F1F', accent: '#C8323C', age: 'old' },
      },
      relation: 'Gala patron; the hand-drawn map leads to his townhouse.',
      alibi: 'Seated front row for the speech, then at the bar. Several guests confirm.',
      motive: 'None for the theft — but every reason to fear the map.',
      greeting: 'Detective. I expect this to be resolved tonight and my name kept out of it. Both.',
      statements: [
        {
          id: 's1',
          text: 'Forgeries? Study pieces. Reference copies for scholarship. Any serious collector owns them.',
          contradictedBy: 'kessler-basement',
          pressReply:
            'Eleven! Eleven — in different stages of — that proves nothing, that proves a man takes an interest in — I want my lawyer. I want two lawyers.',
          wrongPressReply: 'That has nothing to do with my collection, and I resent the insinuation.',
        },
        { id: 's2', text: 'Someone left that leaf in my house to destroy me. Delivered in a tube like a — like a poster. I never asked for it. I never wanted it.' },
        { id: 's3', text: 'I was in the front row for every word of that speech. Falk saw me nodding. I nod in all the right places.' },
      ],
      accusedWrong: "Steal my own donation's centrepiece? Have you any idea what I have given this museum? Idiot.",
    },
    {
      character: {
        id: 'c16-sabine',
        name: 'Sabine Kessler-Roux',
        role: 'Gala organiser',
        age: 34,
        tagline: 'If your name is not on the list, you are not here.',
        personality: 'Brittle, efficient, loyal to her father in the way one is loyal to a fault line.',
        quirk: 'Clicks a pen in rhythm with whoever is speaking.',
        voice: 'Clipped, defensive, event-planner precision.',
        avatar: { skin: '#F1D2B6', hair: 'ponytail', hairColor: '#2B1F17', eyes: 'sharp', brows: 'arched', mouth: 'pout', accessory: 'earring', facial: 'none', outfit: '#1F1F2E', accent: '#D4A857' },
      },
      relation: "Gala organiser; the Alderman's daughter.",
      alibi: 'At the ballroom door with the guest list all evening.',
      motive: 'Protecting her father’s reputation — which the map destroys.',
      greeting: 'I have the guest list, the seating plan and the timings to the minute. What I do not have is time. Ask.',
      statements: [
        { id: 's1', text: 'My father is a collector, not a criminal. He has lent to this museum for thirty years.' },
        { id: 's2', text: 'I was at the ballroom door with the guest list all night. Two hundred and six names. I ticked every one.' },
        { id: 's3', text: 'The registrar asked me the exact start time of the speech. Twice. I thought she was just thorough.' },
      ],
      accusedWrong: 'I spent the evening preventing people from getting in. I did not spend it getting anything out.',
    },
  ],

  puzzles: [
    {
      type: 'code',
      id: 'map-cipher',
      title: 'The map cipher',
      prompt:
        "The hand-drawn map carries a string of grid references across its margin:\n\n**D4 A1 F2 B3 E5 C6 G1**\n\nIts legend lists fourteen streets by grid square:\n\n| Ref | Street | Ref | Street |\n|---|---|---|---|\n| A1 | Elm Walk | D4 | Kingfisher Lane |\n| A2 | Birch Row | E2 | Wren Close |\n| B1 | Mallow Street | E5 | Lantern Street |\n| B3 | Saltmarket | F2 | Sorrow Street |\n| C2 | Harrow Road | F5 | Tanner Yard |\n| C6 | Ember Court | G1 | Rook Alley |\n| D1 | Pike Lane | G3 | Osprey Walk |\n\nThe X on the map sits on none of these streets. Where is the Cartographer sending you?",
      inputLabel: 'The name the map spells',
      answers: ['kessler', 'alderman kessler', 'petrus kessler', 'kessler townhouse'],
      hint: 'Look up each reference in the legend and take only the first letter of the street.',
      explanation:
        'D4 Kingfisher, A1 Elm, F2 Sorrow, B3 Saltmarket, E5 Lantern, C6 Ember, G1 Rook — K-E-S-S-L-E-R. The X marks Alderman Kessler’s townhouse. Otto’s warrant found eleven forged Mercator leaves in the basement, and the real one in a tube.',
      revealClueId: 'kessler-basement',
    },
    {
      type: 'order',
      id: 'shredded-instructions',
      title: 'Shredded instructions',
      prompt:
        "Nia has taped the strips from the registrar's shredder bin back into six legible lines. Put the Cartographer's instructions back in the order they were meant to be followed.",
      items: [
        { id: 'lights', text: 'First, when the lights go down for the speech,' },
        { id: 'radio', text: 'radio the East Gallery guard to the loading dock.' },
        { id: 'card', text: 'Only then use your card on the case.' },
        { id: 'leave-map', text: 'Leave my map where the leaf was.' },
        { id: 'walk', text: 'Finally, walk. Never run.' },
        { id: 'file', text: '— see GB-1991-0417' },
      ],
      correctOrder: ['lights', 'radio', 'card', 'leave-map', 'walk', 'file'],
      hint: '“First”, “only then”, “finally” — the Cartographer writes in steps. The file reference is a postscript.',
      explanation:
        'The note is a script: wait for the lights, clear the guard with a fake radio call, open the case, leave the map, walk away. The postscript is a file number — GB-1991-0417 — in a format the Bureau abandoned in 1998.',
      revealClueId: 'instructions',
    },
  ],

  hints: [
    'Three systems kept a record tonight: the case reader, the lab badge reader and the radio base. Find all three before you talk to anyone twice.',
    'The card that opened the case and the handset that moved the guard both belong to the same small office. Compare the registers.',
    'Oona lied three times — about the lab, the card and the radio. Press the radio last; that is where she breaks, and where the real question begins.',
  ],

  culpritId: 'c16-oona',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Which access card opened the Mercator case at 21:24?',
      options: [
        { id: 'a', text: "REG-02 — the registrar's card, Oona Blackwood's" },
        { id: 'b', text: "SEC-04 — Pavel Novotný's guard card" },
        { id: 'c', text: "DIR-01 — Director Falk's master card" },
        { id: 'd', text: 'No card — the glass was lifted from its frame' },
      ],
      correct: 'a',
      explanation: 'The case access log records REG-02 at 21:24 with a maintenance override; the card register names REG-02 as Oona Blackwood’s.',
    },
    {
      id: 'q2',
      prompt: 'Where did the radio call that moved Pavel to the loading dock come from?',
      options: [
        { id: 'a', text: 'The dock radio — Benedikt called him down' },
        { id: 'b', text: "Handset R-07 — the base station on the registrar's office shelf" },
        { id: 'c', text: 'The security kiosk in the gallery' },
        { id: 'd', text: "Director Falk's lapel microphone" },
      ],
      correct: 'b',
      explanation: 'The radio log shows R-07 at 21:21; the handset register places R-07 in the registrar’s office. The dock radio has been dead since July.',
    },
    {
      id: 'q3',
      prompt: 'Why did Oona comply with the Cartographer’s instructions?',
      options: [
        { id: 'a', text: 'She was paid a share of the Mercator’s sale price' },
        { id: 'b', text: 'She wanted revenge on Director Falk' },
        { id: 'c', text: 'She was blackmailed over a false Lisbon provenance she signed in 2014' },
        { id: 'd', text: 'She is the Cartographer herself' },
      ],
      correct: 'c',
      explanation: 'Breaking her statement about the radio produced the confession: the Cartographer knew about the Lisbon file and threatened to send it to the Gazette.',
    },
    {
      id: 'q4',
      prompt: 'What was the Cartographer’s purpose in staging the theft?',
      options: [
        { id: 'a', text: 'To sell the Mercator on the black market' },
        { id: 'b', text: 'To expose Alderman Kessler’s forgery ring by leading the Bureau to his basement' },
        { id: 'c', text: 'To embarrass Director Falk during his speech' },
        { id: 'd', text: 'To test the museum’s security systems' },
      ],
      correct: 'b',
      explanation: 'The map spelled Kessler, the leaf was delivered to his house, and the basement held eleven forgeries. The theft was a lantern held up to a crime nobody had looked at.',
    },
  ],

  solution: [
    'The Mercator was never the point. The hand-drawn map was. Its grid references — D4 A1 F2 B3 E5 C6 G1 — read through the legend spell KESSLER, and the X sits on the Alderman’s townhouse. Otto’s warrant turned up eleven forged Mercator leaves in his basement and the stolen original delivered that morning in a cardboard tube. The thief did not want the map. The thief wanted Kessler’s cellar opened in front of witnesses.',
    'The mechanics of the theft all point at one small office. The case was opened at 21:24 by card REG-02; the card register, in Oona Blackwood’s own writing, assigns REG-02 to the registrar. The call that sent Pavel to the loading dock at 21:21 came from handset R-07; the handset register places R-07 on the shelf in the registrar’s office. Benedikt, alone at the dock with a dead radio, called nobody.',
    'Oona claimed to have spent the speech in the conservation lab. The lab badge reader shows her leaving at 21:19 and returning at 21:29 — the exact span of the theft. She said her card never left her lanyard; the access log says otherwise. She said she never touched the radio; it lives on her shelf. Three lies, each one smaller than the last, until the third broke her.',
    'What she confessed was not greed. In 2014 she falsified a provenance for a Lisbon portolan chart to save an acquisition and, with it, her career. Someone knew. A typed note — later recovered from her shredder and reassembled by Nia — laid out the theft step by step and promised the Lisbon file to the Gazette if she refused. She was a coerced hand, not an author.',
    'The author left two signatures. The first is a compass rose without a north point, drawn on the map with the same confidence as everything else — an omission, not an error. The second is the note’s postscript: “— see GB-1991-0417”, a file reference in the format the Bureau stopped using in 1998. Nia had never seen it. Hestia recognised it instantly, and said only that nobody uses it any more.',
    'Falk spoke, Benedikt popped bubble wrap, Pavel followed procedure off a cliff, Sabine ticked names at the door. Kessler, who stole nothing tonight, will lose everything, and Greywick is better for it. Oona Blackwood opened a case under duress and will face what that means. The person who wrote her instructions, drew her map, and left out north — that person is still drawing.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. Registrar did it. Didn’t want to. Kessler didn’t do it and deserved to. Tidy, in an untidy way.', mood: 'neutral' },
    { speaker: 'nia', text: 'The shredded note is the weird bit. Last line: “see GB-1991-0417”. Our files are GWB-####? What’s GB?', mood: 'thinking' },
    { speaker: 'hestia', text: "Pre-'98 format, dear. Nobody uses it anymore.", mood: 'neutral' },
    { speaker: 'otto', text: 'Hm.', mood: 'thinking' },
    { speaker: 'quill', text: 'And the compass rose, Chief Inspector. Someone who draws that well does not forget north. Someone who draws that well is telling us something about north.', mood: 'thinking' },
    { speaker: 'you', text: 'Oona said they are not finished.', mood: 'neutral' },
    { speaker: 'otto', text: 'No. They are not. Whoever this is picked a target the city should have caught thirty years ago and made us catch them tonight. I do not like being handed a map.', mood: 'angry' },
    { speaker: 'hestia', text: 'More tea, Ottoline? You have had a long evening.', mood: 'happy' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'smug' },
  ],
};
