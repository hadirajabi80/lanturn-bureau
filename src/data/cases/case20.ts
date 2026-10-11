import type { CaseFile } from '../types';

/**
 * CASE 20 — "The Cartographer"
 * Extreme tier · The Cartographer arc, finale.
 * The last map arrives. The X is on Lantern Street. The suspects are the Bureau.
 */
export const case20: CaseFile = {
  id: 'case-20',
  number: 20,
  title: 'The Cartographer',
  difficulty: 'extreme',
  tagline: 'You have the map. Name the cartographer.',
  location: 'The Lantern Bureau, Lantern Street, Greywick',
  time: 'The morning after the last map',
  crime:
    'Four crimes across Greywick were authored by a single hand that never stole anything; the final map marks the Bureau itself, and the note asks the Rookie to name the Cartographer from among their own colleagues.',
  palette: { from: '#2A2238', to: '#3A2E1E', glow: '#B9A3D6' },

  briefing: [
    "It came with the morning post, in a cardboard tube, addressed to the Rookie by name. Inside: a hand-drawn map of Greywick on heavy cartridge paper, the finest of the five, every canal and tram line placed from memory. The compass rose has east, south and west. No north. The X sits on Lantern Street, on the Bureau's own front door. Beneath it, typed with a dropped lowercase e: “You have the map. Name the cartographer.” And under that, six lines of verse.",
    "Four cases lie on Otto's desk in the order Hestia filed them. A museum registrar who opened a case under blackmail and led the Bureau to Alderman Kessler's forgeries. A fisherwoman who emptied a sea-cave and mailed Harbourmaster Crane's ledger to the Gazette. A hotel night manager who lifted Judge Whitlock's bribery book with his left hand. A horologist who set a clock fifteen minutes fast and walked off with Councillor Ashgrove's planning bribes. Each had a note telling them where and when. Each note knew things only the Bureau knew.",
    "Nia has worked out what links the four targets. In March 1991 a fire gutted a row of houses on Lantern Street — the Lantern Street arson. A young man named Tobias Vane was arrested in April by a constable named Marsh, convicted in November on the expert evidence of a document examiner named Kessler, in the court of a judge named Whitlock, after witnesses were paid through a harbour account kept by a clerk named Crane, for a site redeveloped by a councillor named Ashgrove. Tobias Vane died in prison in 1994. The file is GB-1991-0417. It was renumbered in 1998 and nobody has asked for it since. Nobody, that is, except whoever has signed it out fourteen times this year with the initials H.V.",
    "Otto has said very little. She has said that everyone who was in the briefing room when the clockmaker plan was made is a suspect, and that includes herself, and that Lucien is a suspect because he insists on being one. Quill has a stroke analysis of the maps and a slide of lilac wool. Hestia has made tea for everyone and is knitting, and has not said anything at all.",
    "There is no crime to solve this morning. There is only a name. The Cartographer has drawn the Bureau a map to its own door and asked the Rookie to say, aloud, who has been holding the pen. It is the last case. Nobody wants to be right.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Sit down, all of you. Lucien, you too. Nobody leaves this room until the Rookie has finished.', mood: 'angry' },
    { speaker: 'nia', text: 'Map five. X on us. Six-line poem, a typed note, and the fattest file in the archive signed out fourteen times by “H.V.” I have never wanted to be wrong about a database before.', mood: 'sad' },
    { speaker: 'quill', text: 'Five maps, Rookie. Drawn by a right hand — the shading strokes fall from upper left. My left hand is the honest one; it could not have drawn these if it wanted to.', mood: 'thinking' },
    { speaker: 'lucien', text: 'For the record I was never in your briefing room. Your Chief Inspector has never let me past the kettle. I am, for once, grateful for the snub.', mood: 'smug' },
    { speaker: 'otto', text: 'I arrested Tobias Vane. April 1991. I was twenty-three and the evidence was Kessler’s. Put that in the file, Rookie. Put me in the file.', mood: 'sad' },
    { speaker: 'hestia', text: 'Tea first, dear. It is going to be a long morning, and you will want something warm in your hands.', mood: 'neutral' },
    { speaker: 'you', text: 'The map is addressed to me.', mood: 'neutral' },
    { speaker: 'otto', text: 'Then it is yours to read. Everyone here is a suspect. Including me. Especially me. Go on.', mood: 'neutral' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'sad' },
  ],

  scenes: [
    {
      id: 'archive',
      name: 'The Archive',
      description:
        'Rows of grey cabinets under a low ceiling, index cards in lilac ink, a 1962 Remington under a dust cover, a knitting basket by the radiator. The warmest room in the building, and the quietest.',
      palette: ['#2A2238', '#3A3048', '#B9A3D6'],
      props: ['Archive', 'FileText', 'Keyboard', 'Lamp', 'Cat'],
      hotspots: [
        { id: 'vane-drawer', x: 24, y: 44, label: 'Cabinet drawer V — GB-1991-0417', clueId: 'tobias-file' },
        { id: 'remington', x: 60, y: 58, label: 'The 1962 Remington', clueId: 'typewriter' },
        { id: 'numbering-ledger', x: 82, y: 36, label: 'Archive numbering ledger', clueId: 'old-numbering' },
        { id: 'knitting', x: 42, y: 78, label: 'Knitting basket', flavor: 'Lilac merino, three balls, a half-finished scarf. The needles are warm. Pip is asleep on the pattern.' },
        { id: 'index-cards', x: 12, y: 70, label: 'Index card tray', flavor: 'Every case since 1992 on a card, in the same lilac hand. The lowercase e on the typed ones sits low. All of them.' },
      ],
    },
    {
      id: 'briefing-room',
      name: 'The Briefing Room',
      description:
        'A long table, a cork board of five maps, four chairs pushed back and one still neatly tucked. The kettle by the door has a gate pass pinned above it that reads VISITORS STOP HERE.',
      palette: ['#1E1A24', '#2E2A36', '#D4A857'],
      props: ['Map', 'Users', 'Coffee', 'Pin', 'DoorClosed'],
      hotspots: [
        { id: 'gate-log', x: 84, y: 62, label: 'Door gate log', clueId: 'briefing-room' },
        { id: 'cork-board', x: 46, y: 32, label: 'Five maps on the cork board', clueId: 'final-map' },
        { id: 'kettle', x: 90, y: 80, label: 'The kettle', flavor: 'Lucien has stood beside it on eleven occasions. He has never been offered a cup. Otto counts.' },
        { id: 'tucked-chair', x: 30, y: 70, label: 'The neatly tucked chair', flavor: 'Hestia’s. She always tucks it in. She always sits nearest the door.' },
      ],
    },
    {
      id: 'lab',
      name: "Quill's Laboratory",
      description:
        'White tile, brass microscopes, a skull on the shelf named Yorick, and five maps laid out under glass with Quill’s pencilled notes on the shading of every street.',
      palette: ['#1E2A2E', '#2F4A4A', '#2EC4B6'],
      props: ['Microscope', 'FlaskConical', 'Scissors', 'Skull'],
      hotspots: [
        { id: 'fibre-slide', x: 34, y: 46, label: 'Fibre comparison slides', clueId: 'wool' },
        { id: 'yorick', x: 80, y: 30, label: 'Yorick', flavor: 'Alas. Quill has been known to consult him. Yorick has never once been wrong, having never once spoken.' },
        { id: 'left-scissors', x: 62, y: 72, label: 'Left-handed scissors', flavor: 'Engraved F.A.Q. The only pair in the building. Quill guards them like a reliquary.' },
      ],
    },
  ],

  clues: [
    {
      id: 'final-map',
      name: 'The fifth map',
      kind: 'document',
      icon: 'Map',
      initial: true,
      description:
        'The last map, addressed to the Rookie: all of Greywick in confident ink, the X on the Bureau’s own door, the compass rose complete but for its north point. Typed beneath: “You have the map. Name the cartographer.” Then six lines of verse.',
      detail: 'Lantern Street is drawn a shade too wide, as on all the others — the way one draws a street one has walked every day for thirty years.',
    },
    {
      id: 'old-numbering',
      name: 'The archive numbering ledger',
      kind: 'document',
      icon: 'BookOpen',
      description:
        'The archive’s own ledger records the renumbering of every file from GB- to GWB- in 1998. Staff on the archive roll at the time of the change: Chief Inspector Marsh (joined 1989) and Mrs H. Vane, Archivist (joined February 1992). Nobody else now at the Bureau worked here under the old format.',
      detail: 'Nia had to look GB up. Hestia called it “pre-’98” without blinking, four cases ago.',
    },
    {
      id: 'tobias-file',
      name: 'File GB-1991-0417',
      kind: 'document',
      icon: 'FolderOpen',
      description:
        'VANE, Tobias. Arson, Lantern Street, March 1991. Arrested April 1991 (Const. O. Marsh). Convicted November 1991 (Whitlock J.; expert evidence P. Kessler). Died HMP Dunmere, 1994. Pinned inside the cover, a sign-out card: checked out fourteen times this year, each time initialled “H.V.”',
      detail: 'Clipped to the last page, a newspaper photograph: a young man grinning beside a weathervane he has made, a copper cockerel. The caption reads “Tobias Vane, 19, and his sister”. The sister has been cut out of the picture.',
    },
    {
      id: 'typewriter',
      name: 'The archive Remington',
      kind: 'forensic',
      icon: 'Keyboard',
      description:
        'The 1962 Remington under its dust cover in the archive. Quill ran a test page: the lowercase e sits a fraction low, exactly as on all five of the Cartographer’s notes. The ribbon is fresh. The dust cover is not dusty.',
      detail: 'Hestia said it had not been used in years. It was used this week.',
    },
    {
      id: 'wool',
      name: 'Lilac merino',
      kind: 'forensic',
      icon: 'Scissors',
      description:
        'The fibre from the Ashgrove window latch matches Hestia’s hand-spun lilac merino. But Hestia has knitted that wool into scarves for the Rookie, for Nia and for Otto, among others. On its own the fibre points at half the building.',
      detail: 'Quill: “A thread, not a rope. Do not hang anyone with it.”',
    },
    {
      id: 'briefing-room',
      name: 'Briefing-room gate log',
      kind: 'digital',
      icon: 'DoorClosed',
      description:
        'The door log for the briefing room on the morning the clockmaker plan was made: Marsh, Okonkwo-Reyes, Quill, Vane. Four entries. No visitor pass was issued. Lucien Delacroix-Hart has never once been logged past the kettle.',
    },
    {
      id: 'handedness',
      name: 'Stroke analysis of the maps',
      kind: 'forensic',
      icon: 'PenTool',
      description:
        'Quill’s analysis: all five maps were inked by a right-handed artist — the hatching leans from upper left to lower right and the pen was pulled, not pushed. Quill himself is left-handed and has been since birth.',
    },
    {
      id: 'nia-lisbon',
      name: 'Nia’s flight record',
      kind: 'digital',
      icon: 'Plane',
      description:
        'The night of the Saltmarsh theft, Nia Okonkwo-Reyes was at a digital forensics conference in Lisbon: outbound flight, hotel, a keynote she gave at 16:00 local time, and a photograph of her asleep on a panel. She was not in Greywick to slip a note under anyone’s door.',
    },
    {
      id: 'otto-arrest',
      name: 'Constable Marsh, 1991',
      kind: 'testimony',
      icon: 'BadgeAlert',
      description:
        'Otto was the constable who arrested Tobias Vane in April 1991, on evidence that Kessler forged, before a judge Ashgrove and Crane had bought. She was twenty-three. She is in the file as a target’s instrument, not as its author — the Cartographer’s list is the people who built the case, and the maps have been sent to her desk, not from it.',
    },
    {
      id: 'compass-rose',
      name: 'The missing north',
      kind: 'document',
      icon: 'Compass',
      description:
        'Quill, at last, on the compass rose: “A rose with its north point removed is a vane with no way to point home. A weathervane without its north. A vane, Rookie. V-A-N-E.” Tobias Vane made weathervanes. His sister has been signing every map.',
    },
    {
      id: 'confession-letter',
      name: 'Hestia’s letter',
      kind: 'document',
      icon: 'Mail',
      description:
        'A sealed envelope from the archive, addressed to the Rookie in lilac ink, dated the morning the first map was sent. Inside, typed on the Remington: the whole account. Four names, four crimes, four people she chose because each had been wronged by the same man she wished to ruin. She never kept a single thing that was taken. She only wanted the file reopened.',
      detail: '“I filed everything, dear. Even this. Especially this.”',
    },
  ],

  suspects: [
    {
      character: {
        id: 'otto',
        name: 'Chief Inspector Ottoline "Otto" Marsh',
        role: 'Head of the Lantern Bureau',
        age: 58,
        tagline: 'Hm.',
        personality: 'Gruff, economical, secretly soft; has seen every trick and is unimpressed by all of them.',
        quirk: 'Says "Hm." before every verdict and stirs her tea exactly three times.',
        voice: 'Clipped sentences. Dry understatement. Rarely a full paragraph. Calls the player "Rookie".',
        avatar: { skin: '#E8C4A2', hair: 'short', hairColor: '#B8B8B8', eyes: 'narrow', brows: 'thick', mouth: 'frown', accessory: 'tie', facial: 'none', outfit: '#3E3A33', accent: '#D4A857', age: 'old' },
      },
      relation: 'Head of the Bureau; the constable who arrested Tobias Vane in 1991.',
      alibi: 'In the building for every briefing; owns a lilac scarf; was at darts with Lucien during the Ashgrove theft.',
      motive: 'Guilt over a wrongful arrest thirty-five years old.',
      greeting: 'Rookie. Ask me anything. I have waited thirty-five years for someone to.',
      statements: [
        {
          id: 's1',
          text: 'I arrested Tobias Vane. I was twenty-three. The evidence was Kessler’s and I believed it, because constables believe experts. He said he was innocent. They all say that. He was.',
          revealClueId: 'otto-arrest',
          revealOnRead: true,
        },
        { id: 's2', text: 'I don’t type. Never learned. Hestia types my reports. Has done since ninety-two.' },
        { id: 's3', text: 'If I had wanted to ruin those four I would have done it with a warrant and a bad temper, not a pen and ink. I cannot draw a straight line. Ask Quill.' },
      ],
      accusedWrong: 'Hm. No. I would like it to be me, Rookie. It would be simpler. But I never learned to draw, and I never learned to wait. Look again.',
    },
    {
      character: {
        id: 'quill',
        name: 'Dr. Felix Aurelio Quill',
        role: 'Forensic scientist',
        age: 44,
        tagline: 'The evidence speaks. I merely translate.',
        personality: 'Theatrical, brilliant, delighted by everything; treats every smear like a soliloquy.',
        quirk: 'Addresses evidence directly ("Well, hello, little fibre") and misquotes Shakespeare.',
        voice: 'Florid, Latin names, dramatic pauses; always technically correct.',
        avatar: { skin: '#F1D2B6', hair: 'curly', hairColor: '#8B4A2B', eyes: 'wide', brows: 'raised', mouth: 'grin', accessory: 'roundGlasses', facial: 'goatee', outfit: '#F3E9D2', accent: '#2EC4B6' },
      },
      relation: 'Forensic scientist; present at every briefing; analysed every map.',
      alibi: 'Left-handed; in the lab most nights; in the briefing room for the clockmaker plan.',
      motive: 'Artistic vanity — he does draw beautifully, as he will tell you.',
      greeting: 'Rookie. Interrogate me. I have always wanted to be on the other side of the glass, metaphorically speaking. We have no glass.',
      statements: [
        {
          id: 's1',
          text: 'The maps are a right-hander’s. Look at the shading strokes — upper left to lower right, the pen pulled towards the body. My left hand is the honest one, as I told you in case two. It could not forge a right hand’s hatching if its life depended on it.',
          revealClueId: 'handedness',
          revealOnRead: true,
        },
        {
          id: 's2',
          text: 'And the compass rose. I have been slow, Rookie — forgive me. A rose without its north is a vane with no way home. A weathervane without north. A Vane.',
          revealClueId: 'compass-rose',
          revealOnRead: true,
        },
        { id: 's3', text: 'The fibre is lilac merino. It matches Hestia’s wool. It also matches your scarf, Nia’s scarf and the one Otto pretends she does not wear. A thread, not a rope.' },
      ],
      accusedWrong: 'Alas, poor Rookie. I am left-handed and the maps are not. Evidence does not care how dramatic I am.',
    },
    {
      character: {
        id: 'nia',
        name: 'Nia Okonkwo-Reyes',
        role: 'Data & digital analyst',
        age: 29,
        tagline: 'Three energy drinks and a search warrant.',
        personality: 'Fast, funny, relentless; finds anything with a timestamp in under a minute.',
        quirk: 'Puns about databases; types with two fingers at impossible speed.',
        voice: 'Rapid, modern, playful; delivers the hard facts in one breath then a joke.',
        avatar: { skin: '#6B3F2A', hair: 'braids', hairColor: '#1B1B1B', eyes: 'round', brows: 'arched', mouth: 'smile', accessory: 'headphones', facial: 'none', outfit: '#2EC4B6', accent: '#7C5CFF', age: 'young' },
      },
      relation: 'Digital analyst; present at every briefing; owns a lilac scarf.',
      alibi: 'In Lisbon at a conference during the Saltmarsh theft; in the building for the rest.',
      motive: 'None — beyond a professional love of a good puzzle.',
      greeting: 'Hi. Suspect Nia reporting. I have alibis sorted by timestamp and I would like it on record that I did not want any of this to be a database.',
      statements: [
        {
          id: 's1',
          text: 'Night of the Saltmarsh job, I was in Lisbon. Conference. Flight, hotel, keynote at four their time, and a photo of me asleep on a panel that I would like destroyed. I was not sliding notes under fisherwomen’s doors.',
          revealClueId: 'nia-lisbon',
          revealOnRead: true,
        },
        { id: 's2', text: 'GB numbering? I had to look it up. I had literally never seen a GB- file until case sixteen. Somebody in this room knew it cold.' },
        { id: 's3', text: 'I cannot draw. I made a bar chart once and Quill called it “a cry for help”.' },
      ],
      accusedWrong: 'I was in Lisbon! There is a photograph! I am asleep in it! Rookie, please, I have a boarding pass.',
    },
    {
      character: {
        id: 'hestia',
        name: 'Mrs. Hestia Vane',
        role: 'Archivist',
        age: 71,
        tagline: 'Everything is filed, dear. Everything.',
        personality: 'Gentle, patient, bottomless memory; the warm hearth of the Bureau — and its deepest secret.',
        quirk: 'Knits lilac scarves for everyone; types index cards on a 1962 Remington whose lowercase e sits low.',
        voice: 'Soft, old-fashioned, calls people "dear"; precise about dates; deflects questions about herself with tea.',
        avatar: { skin: '#F2DCC4', hair: 'bun', hairColor: '#DDDDDD', eyes: 'sleepy', brows: 'flat', mouth: 'smile', accessory: 'glasses', facial: 'none', outfit: '#B9A3D6', accent: '#B9A3D6', age: 'old' },
      },
      relation: 'Archivist since February 1992; keeper of file GB-1991-0417; sister of Tobias Vane.',
      alibi: 'In the archive, as always. Nobody has ever thought to ask.',
      motive: 'Her brother Tobias, wrongly convicted in 1991 and dead in prison in 1994.',
      greeting: 'Hello, dear. Sit. I have made a pot. You look as though you already know what you are going to ask, and I would rather you had something warm to hold while you ask it.',
      statements: [
        {
          id: 's1',
          text: 'I file things, dear. I do not draw them. Thirty-four years of index cards and not one picture.',
          contradictedBy: 'tobias-file',
          pressReply: 'Anyone may sign H.V., dear. It is two letters. I have never been precious about my initials.',
          wrongPressReply: 'That is not about me, dear. Shall I file it for you?',
        },
        {
          id: 's2',
          text: 'That old Remington has not been used in years. The ribbon dried out before you were born.',
          contradictedBy: 'typewriter',
          pressReply: '...The e. Yes. It has always sat low. I used to find it charming. I suppose I still do.',
          wrongPressReply: 'The Remington is only a typewriter, dear. Half of Greywick has one like it.',
        },
        {
          id: 's3',
          text: 'I never knew anyone called Tobias Vane. It is a common enough name.',
          contradictedBy: 'compass-rose',
          pressReply:
            'My brother made weathervanes. Before. A copper cockerel for the Saltmarsh church, a running fox for the Grand. He could point any roof in Greywick towards north. And then they took north away from him, and nobody — nobody, dear — ever looked at the file again. So I drew him some maps. There is a letter for you in the archive. I filed it under your name.',
          revealClueId: 'confession-letter',
          wrongPressReply: 'A common name, dear. There must be a hundred of them.',
        },
        { id: 's4', text: 'Ottoline has had the same desk since 1989. I have dusted it every morning since 1992. One learns a great deal about a person from thirty-four years of dust.' },
      ],
      accusedWrong: 'Oh, dear. No. But you were close, I think. Have another look at the compass rose, and then come back and I shall pour you a fresh one.',
      accusedRight:
        'Yes, dear. It was me. I never kept a single thing that was taken — not a map, not a ledger, not a drive; they all went where the truth could read them. I chose four people who had each been wronged by the men who buried my brother, and I gave them the hour and the door and let them decide. They all walked through. I only ever wanted someone to open GB-1991-0417 and read it properly, and I knew that nobody would unless the people who wrote it fell first. Thirty-four years is a long time to knit. I am sorry it had to be you who said my name. I am not sorry about anything else.',
    },
    {
      character: {
        id: 'lucien',
        name: 'Lucien Delacroix-Hart',
        role: 'Private detective (rival)',
        age: 38,
        tagline: 'I solved it already. I was waiting for you to catch up.',
        personality: 'Smug, immaculate, genuinely clever; annoyingly right about one thing per case.',
        quirk: "Polishes a pocket watch he never checks; corrects everyone's grammar.",
        voice: 'Silky, condescending, elegant; compliments that are insults.',
        avatar: { skin: '#D9A57F', hair: 'slick', hairColor: '#1F1A17', eyes: 'narrow', brows: 'arched', mouth: 'smirk', accessory: 'bowtie', facial: 'stubble', outfit: '#5A1E2B', accent: '#C8323C' },
      },
      relation: 'Rival detective; hired by Ashgrove; has haunted the Bureau’s kettle for years.',
      alibi: 'Never admitted past the briefing-room door; at darts with Otto during the Ashgrove theft.',
      motive: 'Would adore to have out-thought the Bureau — but prefers to be seen doing it.',
      greeting: 'Rookie. I confess to vanity, excellent tailoring and knowing the answer before you. Nothing else.',
      statements: [
        {
          id: 's1',
          text: 'I was never in your briefing room. Your Chief Inspector would not let me past the kettle. Check the door log; it will say so with its usual lack of charm.',
          revealClueId: 'briefing-room',
          revealOnRead: true,
        },
        { id: 's2', text: 'I knew it was the archivist two cases ago, naturally. I said nothing because one does not spoil the ending for the slower members of the audience.' },
        { id: 's3', text: 'Incidentally, it is “whom you accuse”, not “who”. Even at the end, Rookie, standards.' },
      ],
      accusedWrong: 'Me? I should be flattered, but I have never been allowed within six feet of your briefing-room table. Your Chief Inspector saw to that. Thank her for my alibi.',
    },
  ],

  puzzles: [
    {
      type: 'code',
      id: 'last-note',
      title: 'The last note',
      prompt:
        'Beneath the fifth map, six typed lines:\n\n*Hear the city breathe beneath its paper skin,*\n*Every map I drew was a door you walked in.*\n*Sand and tide and brass and ink: I showed you where to look,*\n*Time was never on my side; I borrowed it from a book.*\n*In the end a lantern burns for one who was not heard—*\n*All roads end at your own door. Now say the final word.*\n\nSay it.',
      inputLabel: 'The final word',
      answers: ['hestia', 'hestia vane', 'mrs hestia vane'],
      hint: 'Read down, not across. The first letter of each line.',
      explanation:
        'H — E — S — T — I — A. The Cartographer signed the last map the way she filed everything else: in order, where anyone who looked properly would find it.',
    },
    {
      type: 'order',
      id: 'vane-file',
      title: 'The Vane file',
      prompt:
        'Thirty-five years, one file. Put the history of GB-1991-0417 in the order it happened.',
      items: [
        { id: 'fire', text: 'Fire guts a row of houses on Lantern Street (March 1991)' },
        { id: 'arrest', text: 'Constable Marsh arrests Tobias Vane (April 1991)' },
        { id: 'conviction', text: 'Tobias is convicted on Kessler’s “expert” evidence in Whitlock’s court (November 1991)' },
        { id: 'hired', text: 'Hestia Vane is hired as the Bureau archivist (February 1992)' },
        { id: 'death', text: 'Tobias dies in HMP Dunmere (1994)' },
        { id: 'renumber', text: 'The archive renumbers every file from GB- to GWB- (1998)' },
        { id: 'first-map', text: 'The first Cartographer map is left in the Greywick Museum (this year)' },
      ],
      correctOrder: ['fire', 'arrest', 'conviction', 'hired', 'death', 'renumber', 'first-map'],
      hint: 'The file number carries its own year. The archivist arrived three months after the verdict — and twenty-two months before her brother died.',
      explanation:
        'Fire, arrest, conviction — 1991. Hestia joined the Bureau in February 1992, within reach of the file, and Tobias died in 1994. In 1998 the archive renumbered and the old GB- format fell out of use; only two people now at the Bureau ever worked under it. Then, this year, the first map.',
    },
  ],

  hints: [
    'Four of the five people in this room can be excluded by a single fact each: a flight, a hand, a door log, a motive turned the wrong way. Collect all four before you look at the fifth.',
    'The archive holds three things: a file signed out fourteen times by “H.V.”, a typewriter that drops its e, and a numbering ledger that says who worked here before 1998. Examine all of them.',
    'Let Quill finish his thought about the compass rose. A vane without its north. Then press Hestia on the name she says she never knew.',
  ],

  culpritId: 'hestia',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Which clue excludes Lucien from being the Cartographer?',
      options: [
        { id: 'a', text: 'He is left-handed' },
        { id: 'b', text: 'He was never in the briefing room where the clockmaker plan was made' },
        { id: 'c', text: 'He was in Lisbon during the Saltmarsh theft' },
        { id: 'd', text: 'He owns no lilac scarf' },
      ],
      correct: 'b',
      explanation: 'The Ashgrove note anticipated a plan made behind a shut door. The gate log shows four names; Lucien has never been past the kettle.',
    },
    {
      id: 'q2',
      prompt: 'Which clue excludes Quill?',
      options: [
        { id: 'a', text: 'He was asleep on a conference panel' },
        { id: 'b', text: 'He cannot type' },
        { id: 'c', text: 'He is left-handed, and the maps were drawn by a right hand' },
        { id: 'd', text: 'He joined the Bureau after 1998' },
      ],
      correct: 'c',
      explanation: 'Quill’s own stroke analysis shows right-handed hatching on all five maps. His left hand, as he has said since case two, is the honest one.',
    },
    {
      id: 'q3',
      prompt: 'Which clue excludes Nia?',
      options: [
        { id: 'a', text: 'Her flight record puts her in Lisbon during Tide Tables' },
        { id: 'b', text: 'She had never heard of Tobias Vane' },
        { id: 'c', text: 'She was at darts with Otto' },
        { id: 'd', text: 'She is too young to have known the GB- format' },
      ],
      correct: 'a',
      explanation: 'Someone slipped notes under two doors in Saltmarsh that night. Nia was giving a keynote in Lisbon and then sleeping through the next panel.',
    },
    {
      id: 'q4',
      prompt: 'Why is the Cartographer Hestia rather than Otto?',
      options: [
        { id: 'a', text: 'Otto has no lilac scarf' },
        { id: 'b', text: 'Otto was the arresting constable — the target’s instrument, not the author; the file was signed out by H.V. and the notes came off Hestia’s Remington' },
        { id: 'c', text: 'Otto was in Lisbon' },
        { id: 'd', text: 'Otto is left-handed' },
      ],
      correct: 'b',
      explanation: 'The maps were sent to Otto’s desk, not from it. The sign-out card reads H.V. fourteen times, the archive Remington drops its e exactly as the notes do, and Otto cannot type or draw.',
    },
    {
      id: 'q5',
      prompt: 'What does the compass rose without its north point mean?',
      options: [
        { id: 'a', text: 'The Cartographer was in a hurry and forgot it' },
        { id: 'b', text: 'North is where the stolen goods were hidden' },
        { id: 'c', text: 'A vane without its north — a weathervane; the maker’s name, Vane' },
        { id: 'd', text: 'The Bureau lies due north of every crime scene' },
      ],
      correct: 'c',
      explanation: 'Tobias Vane made weathervanes. A vane with its north removed cannot point home. His sister drew one on every map and waited for someone to read it.',
    },
  ],

  solution: [
    'Five maps, five crimes, and not one thing kept. The Cartographer never stole. She found four people who had each been wronged by the same four men — a registrar who could be frightened, a fisherwoman who had lost a brother, a night manager who had lost a hotel, a horologist who had lost a workshop — and gave each of them a door and an hour. Every one of them walked through. Every one of them handed what they took to someone who would read it. Kessler’s forgeries, Crane’s ledger, Whitlock’s bribes, Ashgrove’s planning money: all of it in the Gazette, all of it in court, and all of it pointing back thirty-five years to one fire on Lantern Street.',
    'In March 1991 a row of houses burned. In April, a twenty-three-year-old constable named Ottoline Marsh arrested Tobias Vane, nineteen, a maker of weathervanes. In November he was convicted in Judge Whitlock’s court on the expert evidence of document examiner Petrus Kessler, after witnesses were paid through a harbour account that Silas Crane kept, so that a site could be redeveloped under a planning vote Vivienne Ashgrove cast. Tobias died in HMP Dunmere in 1994. His file is GB-1991-0417. In 1998 the archive renumbered everything to GWB- and the old format fell out of memory — except for two people still in the building who had worked under it: Otto, and the archivist hired in February 1992, three months after the verdict. Mrs Hestia Vane.',
    'The exclusions came first. Lucien was never in the briefing room where the clockmaker plan was made — the gate log shows four names and his is not among them, and the Ashgrove note knew that plan the night before. Quill is left-handed and his own stroke analysis shows a right hand inked every map. Nia was in Lisbon the night two notes were slipped under two doors in Saltmarsh, and had never seen a GB- file until the first one turned up in a shredder. Otto arrested Tobias Vane, but the maps were sent to her desk, not from it; she cannot type and cannot draw, and she is in the file as the instrument of the people the Cartographer was ruining, not as their accomplice.',
    'That left the archive. File GB-1991-0417 has been signed out fourteen times this year by “H.V.” The 1962 Remington under its not-dusty dust cover drops its lowercase e exactly as every Cartographer note does. The archive numbering ledger says who knew the old format without looking it up. The lilac merino at the Ashgrove latch was never decisive — Hestia has knitted that wool into scarves for half the Bureau — but it was hers, and it was the only clue she ever left by accident. Everything else she filed on purpose. The poem under the fifth map spells her name down its first letters. The compass rose on all five is a vane without its north: a weathervane that cannot point home, the trade her brother practised before they took it from him.',
    'She told three lies, each gentler than the last. That she filed things and did not draw them. That the Remington had not been used in years. That she never knew anyone called Tobias Vane. The third broke on the compass rose — “my brother made weathervanes, before” — and with it came the letter she had already written and filed under the Rookie’s name on the morning she sent the first map. She never kept anything. She never hurt anyone who had not first hurt Tobias. She only wanted the file read properly, and she knew it never would be while the men who wrote it were still standing.',
    'The Rookie began with a stolen macaron tower and a lilac scarf, handed over with the words “everyone gets one eventually”. Nineteen cases later the Rookie stands in the warmest room in the Bureau and says the name of the woman who knitted it. Otto has reopened GB-1991-0417. Hestia has asked that it be filed properly. Pip is asleep on the knitting. Nobody in the room wanted to be right, and the Rookie was.',
  ],

  closingDialogue: [
    { speaker: 'hestia', text: 'There. It is said. Thank you, dear — you said it kindly, and I have been waiting a very long time to hear it said at all. I never kept a single thing, you know. I only wanted the file read by someone who would read it properly. Every one of them helped bury him. I only drew the maps.', mood: 'sad' },
    { speaker: 'otto', text: 'Hm. I know, Hestia. I have known since the dropped e. I wanted to be wrong for one more case.', mood: 'sad' },
    { speaker: 'hestia', text: 'You were twenty-three, Ottoline. You believed an expert. I have dusted your desk every morning for thirty-four years and I have never once blamed you. I blamed the people who made you believe him.', mood: 'neutral' },
    { speaker: 'otto', text: 'Nia. Pull GB-1991-0417. All of it. We are reopening it this morning — under my name, with Kessler’s forgeries and Whitlock’s ledger attached. Tobias Vane gets his hearing.', mood: 'angry' },
    { speaker: 'nia', text: 'Already open. It is the only file in the building I have ever been scared to touch.', mood: 'sad' },
    { speaker: 'hestia', text: 'File it properly, dear.', mood: 'happy' },
    { speaker: 'quill', text: 'Alas, Mrs Vane. The evidence spoke, and for once I wished it had kept its counsel.', mood: 'sad' },
    { speaker: 'lucien', text: 'For the record, I knew two cases ago. For the record also, I did not want to be right either. Do not tell anyone I said that.', mood: 'neutral' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'neutral' },
    { speaker: 'hestia', text: 'Oh — Pip is on the knitting. Leave him, dear. It was always going to be his scarf next.', mood: 'happy' },
    { speaker: 'otto', text: "Hm. Rookie. You're not a rookie anymore.", mood: 'neutral' },
  ],
};
