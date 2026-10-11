import type { CaseFile } from '../types';

/**
 * CASE 13 — "Five Masks, One Vault"  (hard)
 * A masked ball, a burned room sheet and a sapphire that flew out over the hedge maze.
 * The grid puzzle rebuilds the room assignments; Room 3 was Vikram's.
 */
export const case13: CaseFile = {
  id: 'case-13',
  number: 13,
  title: 'Five Masks, One Vault',
  difficulty: 'hard',
  tagline: 'Everyone took their mask off at midnight. One of them had already left the room.',
  location: 'Ravensmere Hall, the Hollowmere road',
  time: '11:50 PM – 12:15 AM',
  crime:
    'The Ravensmere Sapphire was taken from the Hall\'s vault during the midnight unmasking; the vault\'s spare key was lifted from a locked bureau in Guest Room 3, and the room-assignment sheet was burned.',
  palette: { from: '#0E1240', to: '#2A1E5C', glow: '#5B8CFF' },

  briefing: [
    'Ravensmere Hall holds a masked ball every autumn, and every autumn the Ravensmere Sapphire—forty carats, the colour of a canal at dusk—is brought up from the vault to be admired at the unmasking. This year the unmasking happened and the sapphire did not. When the butler went down to fetch it at 12:05, the vault stood open on its mechanical override and the velvet cushion was bare.',
    'The vault has two keys. Lady Octavia Ravensmere-Blount wears one on a chain. The spare lives in a locked bureau in one of the five guest rooms along the east corridor—a different room each year, chosen by the housekeeper and recorded on a single sheet of paper. That sheet was found in the ballroom fireplace, reduced to a curl of ash. Everyone agrees the spare was in Room 3. Nobody will agree who was sleeping in Room 3.',
    'Five guests stayed overnight: Lady Octavia herself; Captain Idris Mallory, ex-navy, bad knee; Sister Perpetua Nkemelu of the Hollowmere Mission; Vikram Sethi-Lancaster, who inherited a software fortune and seems bored by it; and Coralie Dubois-Ferrand, the soprano engaged to sing the midnight high C. Every one of them has an opinion about where they slept. Put together, the opinions are a floor plan.',
    'The gate staff searched every bag and every guest on the way out. Nothing. Whatever left Ravensmere Hall did not leave through the gate. Otto\'s note: "Rooms first. The stone followed the key, and the key followed the room."',
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Masked ball. Sapphire gone at midnight. Five guests, five rooms, one sheet of paper somebody burned. Hm.', mood: 'neutral' },
    { speaker: 'nia', text: 'Burning the only copy of the room list is very dramatic and very stupid. Every guest remembers who they were next to. People always remember who kept them awake.', mood: 'smug' },
    { speaker: 'quill', text: 'The ash is useless, Rookie; the ash is the point. Somebody wanted you not to know which room held the spare key. Which means the room is the whole confession.', mood: 'thinking' },
    { speaker: 'hestia', text: 'The Ravensmeres have filed their guest lists with the county since 1820, dear. Not this year. The housekeeper says Her Ladyship "went modern". One sheet. Imagine.', mood: 'sad' },
    { speaker: 'lucien', text: 'I was invited, naturally. I declined. Masks are for people with something to hide, and I hide nothing but my methods. Do try the hedge maze—I\'m told it\'s instructive.', mood: 'smug' },
    { speaker: 'otto', text: 'Five statements about rooms. One of them is wrong on purpose. Build the corridor, Rookie, and the liar falls out of it.', mood: 'neutral' },
    { speaker: 'you', text: 'Stairs at one end, chapel at the other. I\'ll start with the ends.', mood: 'thinking' },
  ],

  scenes: [
    {
      id: 'ballroom',
      name: 'The Ballroom',
      description:
        'Chandeliers dimmed to a hangover, a fireplace still warm, and a butler at the door who has stood there for thirty years and noticed every one of them.',
      palette: ['#120F2E', '#2E2457', '#D4A857'],
      props: ['Wine', 'Music', 'Flame', 'Clock', 'Drama'],
      hotspots: [
        {
          id: 'butler-post',
          x: 10,
          y: 50,
          label: 'Hargreaves, the butler',
          clueId: 'butler',
        },
        {
          id: 'fireplace',
          x: 78,
          y: 60,
          label: 'Fireplace grate',
          clueId: 'ash',
        },
        {
          id: 'champagne-tower',
          x: 46,
          y: 68,
          label: 'Champagne tower',
          flavor: 'Three hundred glasses, mostly empty. One has a lipstick print and a note under it: "High C — don\'t breathe, just sing. C." Coralie leaves notes to herself.',
        },
        {
          id: 'unmasking-clock',
          x: 56,
          y: 24,
          label: 'The unmasking clock',
          flavor: 'Stopped at midnight, by tradition. The Ravensmeres stop a clock once a year; it is the only thing in the Hall that runs on time.',
        },
        {
          id: 'orchestra-dais',
          x: 28,
          y: 34,
          label: 'Orchestra dais',
          flavor: 'Sheet music for a waltz, a tango and something marked "FOR THE HIGH C — HOLD, HOLD, HOLD". The cellist has written "help" in the margin.',
        },
      ],
    },
    {
      id: 'corridor',
      name: 'The East Corridor',
      description:
        'Five guest-room doors in a row. At one end the great staircase; at the other, the chapel door with its smell of beeswax. Between them, a framed plan and a linen cupboard.',
      palette: ['#1A1428', '#3C2F57', '#8B7AA8'],
      props: ['DoorOpen', 'Map', 'Lamp', 'Church', 'Key'],
      hotspots: [
        {
          id: 'framed-plan',
          x: 50,
          y: 22,
          label: 'Framed corridor plan',
          clueId: 'corridor-plan',
        },
        {
          id: 'linen-cupboard',
          x: 88,
          y: 56,
          label: 'Housekeeper\'s linen cupboard',
          clueId: 'housekeeper-note',
        },
        {
          id: 'room-three-door',
          x: 50,
          y: 60,
          label: 'Guest Room 3 — the bureau',
          clueId: 'bureau',
        },
        {
          id: 'walking-stick',
          x: 12,
          y: 66,
          label: 'Walking stick by the stairs',
          flavor: 'A naval cane with a brass knob, leaning by the first door. Someone with a bad knee wanted the shortest walk to bed.',
        },
        {
          id: 'chapel-door',
          x: 96,
          y: 40,
          label: 'Chapel door',
          flavor: 'Open a crack. Inside, a kneeler is still warm and a rosary hangs on the rail. The chapel\'s nearest neighbour went to bed late and prayed early.',
        },
      ],
    },
    {
      id: 'vault',
      name: 'The Vault',
      description:
        'A cellar room with a door like a bank\'s and a cushion like a jeweller\'s. The door stands open; a brass dial records the last thing anyone did to it.',
      palette: ['#0B0E1A', '#1E2340', '#5B8CFF'],
      props: ['Vault', 'Gem', 'Lock', 'ScrollText', 'Lightbulb'],
      hotspots: [
        {
          id: 'override-dial',
          x: 32,
          y: 48,
          label: 'Mechanical override dial',
          clueId: 'vault-log',
        },
        {
          id: 'velvet-cushion',
          x: 62,
          y: 62,
          label: 'Empty velvet cushion',
          flavor: 'Midnight-blue velvet with a sapphire-shaped dent in it and, around the dent, a faint ring of dust where the stone kept the cushion clean for a year.',
        },
        {
          id: 'earl-portrait',
          x: 80,
          y: 28,
          label: 'Portrait of the First Earl',
          flavor: 'The First Earl of Ravensmere, painted holding the sapphire with the expression of a man who did not pay for it either.',
        },
        {
          id: 'wine-rack',
          x: 12,
          y: 70,
          label: 'Wine rack',
          flavor: 'Behind the vault, a 1961 that Lady Octavia is "saving". For what, nobody has dared ask.',
        },
      ],
    },
    {
      id: 'maze',
      name: 'The Hedge Maze',
      description:
        'Yew walls eight feet high, a fountain at the centre and, in a dead end nobody has swept for a decade, something small and plastic with four rotors.',
      palette: ['#0A1A12', '#1E4A30', '#6FBF8A'],
      props: ['TreeDeciduous', 'Droplets', 'Moon', 'Plane', 'Footprints'],
      hotspots: [
        {
          id: 'drone-dead-end',
          x: 70,
          y: 58,
          label: 'Something in the dead end',
          clueId: 'drone',
        },
        {
          id: 'fountain',
          x: 46,
          y: 50,
          label: 'Central fountain',
          flavor: 'A stone heron spitting water. Three champagne glasses in the basin and a mask that belonged to somebody\'s Zorro.',
        },
        {
          id: 'balcony-view',
          x: 20,
          y: 24,
          label: 'View of the east wing',
          flavor: 'From here you can count five balconies above the corridor. Four are swallowed in ivy. The middle one—the third from the stairs—is bare, with a good clear drop to the maze.',
        },
        {
          id: 'search-table',
          x: 12,
          y: 76,
          label: 'Gate search table',
          flavor: 'The gate staff\'s table: every clutch bag opened, every pocket turned, a confiscated hip flask. Nothing bigger than a sugared almond left the Hall by this route.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'ash',
      name: 'Burned room sheet',
      kind: 'physical',
      icon: 'Flame',
      description: 'The room-assignment sheet, burned to a curl in the ballroom grate during the ball. One legible fragment: "...oom 3 — spare ke..."',
      detail:
        'Quill: the paper was fed in deliberately, folded once, around 11:50 by the ember pattern. Whoever burned it wanted nobody to know who slept beside the spare key. They succeeded with the paper and failed with the people.',
    },
    {
      id: 'corridor-plan',
      name: 'Corridor plan',
      kind: 'document',
      icon: 'Map',
      description: 'The framed east-wing plan: Guest Rooms 1 to 5 in a row. Room 1 is beside the great staircase; Room 5 is beside the chapel. Each room has a balcony over the gardens.',
      detail: 'The rooms are numbered in order along the corridor, so "two doors from" means two numbers apart, and "between" means between. Room 3 is the middle room, with the only balcony the ivy has not reached.',
    },
    {
      id: 'bureau',
      name: 'Room 3 bureau',
      kind: 'physical',
      icon: 'KeyRound',
      description: 'The bureau in Guest Room 3, opened with its own small key—which sits in the lock. The drawer that held the vault\'s spare key is empty.',
      detail:
        'The bureau key is kept on the room\'s key ring, handed to whoever sleeps there. No forcing. Whoever opened it was given the key by the housekeeper at check-in. The balcony door beside the bureau was unlatched.',
    },
    {
      id: 'vault-log',
      name: 'Vault override record',
      kind: 'digital',
      icon: 'Vault',
      description: 'The vault\'s brass counter stamps every operation. Last entry: MECHANICAL OVERRIDE — SPARE KEY — 00:03.',
      detail: 'Lady Octavia\'s own key was round her neck at the unmasking in full view of two hundred people. The spare opened the door at three minutes past midnight, while the ballroom was still cheering the high C.',
    },
    {
      id: 'butler',
      name: 'The butler\'s account',
      kind: 'testimony',
      icon: 'UserRound',
      description: 'Hargreaves, at the ballroom door all night: Mr Sethi-Lancaster left at 23:58, "quite briskly", and returned at 00:09 with his mask back on. Nobody else of the five left between 23:30 and 00:15.',
      detail: 'Hargreaves has stood at that door for thirty-one autumns and keeps a mental tally of who is in the room, "the way one counts spoons". Eleven minutes, out and back, spanning the override at 00:03.',
    },
    {
      id: 'housekeeper-note',
      name: 'Housekeeper\'s note',
      kind: 'document',
      icon: 'StickyNote',
      description: 'A card pinned in the linen cupboard, in the housekeeper\'s hand: "Her Ladyship INSISTS on an even-numbered room. Every year. Do not argue."',
      detail: 'Underlined three times. Lady Octavia regards odd numbers as "vulgar" and once moved rooms at two in the morning rather than sleep in a 3.',
    },
    {
      id: 'drone',
      name: 'Drone in the maze',
      kind: 'physical',
      icon: 'Plane',
      description: 'A palm-sized drone, battery flat, in a dead end of the hedge maze. Beneath it, a velvet pouch, empty. Quill: blue silk fibres inside matching the sapphire\'s vault wrap.',
      detail:
        'A short flight from the east-wing balconies to the maze, a long walk for anyone searched at the gate. The drone carried the stone out; a confederate—or the thief on a morning stroll—was meant to collect it. The battery died in the wrong dead end.',
    },
    {
      id: 'controller',
      name: 'Drone controller',
      kind: 'physical',
      icon: 'Gamepad2',
      description: 'A slim drone controller in the inside pocket of Vikram Sethi-Lancaster\'s dinner jacket, paired—Nia checked—to the drone in the maze.',
      detail: 'Last flight logged 00:06, forty seconds, from a start point sixty metres east of the maze at second-floor height. The Room 3 balcony.',
    },
    {
      id: 'room-three',
      name: 'Room 3 was Vikram\'s',
      kind: 'document',
      icon: 'DoorOpen',
      description: 'Reconstructed from the guests\' own accounts: Captain Mallory in Room 1, Lady Octavia in Room 2, Vikram in Room 3, Coralie in Room 4, Sister Perpetua in Room 5.',
      detail: 'The spare vault key was in Room 3. Room 3\'s bureau key was handed to its occupant. The occupant was Vikram Sethi-Lancaster, whatever he says about being tipsy.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c13-octavia',
        name: 'Lady Octavia Ravensmere-Blount',
        role: 'Hostess, owner of the sapphire',
        age: 70,
        tagline: 'I heard that. I chose not to.',
        personality: 'Grand, selectively deaf, sharper than she pretends.',
        quirk: 'Cups a hand to her ear only for questions she dislikes.',
        voice: 'Aristocratic drawl, pronouncements rather than answers; "one" instead of "I".',
        avatar: {
          skin: '#F2DCC4', hair: 'bun', hairColor: '#E8E8E8', eyes: 'sleepy', brows: 'arched', mouth: 'pout',
          accessory: 'pearls', facial: 'none', outfit: '#4A1E5C', accent: '#5B8CFF', age: 'old',
        },
      },
      relation: 'Hostess of the ball and owner of the Ravensmere Sapphire; wore the main vault key all night.',
      alibi: 'In the ballroom receiving guests from eight until the unmasking and after.',
      motive: 'Insured, of course. One does not mention it.',
      greeting: 'The Bureau. How quaint. Speak up, young person, and do not say "vibe".',
      statements: [
        {
          id: 's1',
          text: 'One always has an even-numbered room. Odd numbers are vulgar. The housekeeper knows this; the housekeeper has been told this annually since 1988.',
        },
        {
          id: 's2',
          text: 'One did not leave the ballroom. One was the ballroom. Two hundred people watched one remove a mask at midnight; it would have been remarked upon had one been in a cellar.',
        },
        {
          id: 's3',
          text: 'The young Sethi-Lancaster boy was invited because his father was useful. He spent the evening looking at his wristwatch as though it owed him money.',
        },
      ],
      accusedWrong: 'One has been accused of stealing one\'s own sapphire from one\'s own vault during one\'s own ball. One is going to lie down.',
    },
    {
      character: {
        id: 'c13-mallory',
        name: 'Captain Idris Mallory',
        role: 'Retired naval officer',
        age: 45,
        tagline: 'Bad knee, good memory, loud about both.',
        personality: 'Jovial, booming, a reliable witness because he never stops narrating.',
        quirk: 'Slaps his knee when he laughs, then winces.',
        voice: 'Hearty, nautical metaphors, volume set to deck; honest to the point of tactless.',
        avatar: {
          skin: '#8A5A3C', hair: 'short', hairColor: '#1B1B1B', eyes: 'round', brows: 'thick', mouth: 'grin',
          accessory: 'bowtie', facial: 'beard', outfit: '#1E3A5C', accent: '#D4A857',
        },
      },
      relation: 'Old friend of the family; spent the evening at the bar telling the orchestra how to play.',
      alibi: 'Ballroom all night, within earshot of everybody.',
      greeting: 'Captain Mallory! Sit down, sit down—no, I\'ll stand, the knee prefers it. Ask away, I\'ve a memory like a ship\'s log and a voice to match.',
      statements: [
        {
          id: 's1',
          text: 'They gave me the room by the stairs, bless them. Knee. I can\'t be marching the length of a corridor at my age; the first door, straight up and in.',
        },
        {
          id: 's2',
          text: 'Young Sethi was two doors down from me. His gadgets beeped all night—little chirps, like a bosun\'s whistle with a cold. I nearly went and sat on them.',
        },
        {
          id: 's3',
          text: 'I didn\'t see him go, but I heard the beeping stop around midnight. Thought: good, he\'s finally asleep. Turns out he\'d taken the beeps with him.',
        },
      ],
      accusedWrong: 'Me? With this knee? I couldn\'t steal a biscuit from the cellar without the whole house hearing me come down the stairs. Ask the stairs!',
    },
    {
      character: {
        id: 'c13-perpetua',
        name: 'Sister Perpetua Nkemelu',
        role: 'Nun; director, Hollowmere Mission',
        age: 50,
        tagline: 'God sees everything. I only see most of it.',
        personality: 'Gentle, patient, shrewd; notices lateness the way others notice weather.',
        quirk: 'Counts on her fingers while giving times, as if on a rosary.',
        voice: 'Soft, exact, a little dry; moral observations that land like facts.',
        avatar: {
          skin: '#6B3F2A', hair: 'short', hairColor: '#1B1B1B', eyes: 'round', brows: 'flat', mouth: 'smile',
          accessory: 'headscarf', facial: 'none', outfit: '#2B2B2B', accent: '#F3E9D2',
        },
      },
      relation: 'Guest of honour on behalf of the Mission, which the ball raises funds for.',
      alibi: 'Ballroom until the unmasking; chapel for a few minutes after.',
      greeting: 'Good evening, detective. I asked for the room beside the chapel. I did not ask for a mystery, but we take what we are sent.',
      statements: [
        {
          id: 's1',
          text: 'My room is beside the chapel. I asked for it so that I could pray early without waking anyone. The housekeeper was very kind about it.',
        },
        {
          id: 's2',
          text: 'The young man left during the countdown—ten, nine, and he was gone at about eight. Nature, he said afterwards, had called. Nature took eleven minutes. I counted.',
        },
        {
          id: 's3',
          text: 'The soprano was on my other side. A lovely voice, and she practised it. I offered up the Hail Marys with slightly more volume than usual.',
        },
      ],
      accusedWrong: 'I have taken a vow of poverty, detective. A forty-carat sapphire would be an administrative nightmare.',
    },
    {
      character: {
        id: 'c13-vikram',
        name: 'Vikram Sethi-Lancaster',
        role: 'Tech heir',
        age: 33,
        tagline: 'Bored of money. Not bored of more.',
        personality: 'Clever, languid, contemptuous of anyone slower than him—which he assumes is everyone.',
        quirk: 'Checks a smartwatch and then pretends he didn\'t.',
        voice: 'Smooth, ironic, dismissive; tech jargon as a put-down; charming until contradicted, then clipped.',
        avatar: {
          skin: '#C9956B', hair: 'slick', hairColor: '#1F1A17', eyes: 'narrow', brows: 'arched', mouth: 'smirk',
          accessory: 'none', facial: 'stubble', outfit: '#111827', accent: '#5B8CFF',
        },
      },
      relation: 'Son of the late Hall benefactor; invited annually and visibly bored by it.',
      alibi: 'In the ballroom throughout the unmasking.',
      motive: 'A trust fund that pays less than his tastes, and a buyer in Hollowmere who likes blue.',
      greeting: 'Detective. Let\'s do this efficiently—I have a thing. I had a room, I had a mask, I had a glass of something. Which of those is the crime?',
      statements: [
        {
          id: 's1',
          text: 'I had Room 2, next to the Captain. Heard him snore through the wall like a tugboat. Charming man. Terrible neighbour.',
          contradictedBy: 'room-three',
          pressReply:
            'Rooms, numbers... I was tipsy. Two, three—it\'s a corridor, they all look the same. If the Captain says two doors, fine, two doors. It hardly matters where I slept.',
          wrongPressReply: 'That has nothing to do with which room I was given. Ask the housekeeper. Oh—the sheet. Shame.',
        },
        {
          id: 's2',
          text: 'I never left the ballroom. Stood by the champagne tower through the whole tedious countdown, unmasked on cue, applauded the soprano. Model guest.',
          contradictedBy: 'butler',
          pressReply: 'Fine. The loo. Eleven minutes, Hargreaves says? He counts spoons for a living. I had a long day and a lot of champagne.',
          wrongPressReply: 'I was in the ballroom. Two hundred people in masks—one of them was me.',
        },
        {
          id: 's3',
          text: 'Drone? I\'m a software man, not a hobbyist. I write the things that fly the things; I don\'t stand in fields with a controller like a child.',
          contradictedBy: 'drone',
          pressReply:
            '...A drone in the maze. How curious. Anyone could have—it\'s a consumer model, they sell them in Greywick, there must be dozens—would you like to search my jacket? You\'re going to, aren\'t you.',
          wrongPressReply: 'I don\'t see a drone in that. I see you fishing.',
          revealClueId: 'controller',
        },
      ],
      accusedWrong: 'Based on what—that I was bored? Everyone was bored. Boredom isn\'t a motive, it\'s the Ravensmere brand.',
      accusedRight:
        'Room 3. Yes. The housekeeper handed me the key ring at check-in and said, "Mind the bureau, sir, it\'s got the spare in it," as if I were the sort of person who doesn\'t listen. I burned the sheet, left during the countdown, opened the vault at three minutes past, and flew the stone out of my balcony window while two hundred people clapped a high C. The battery was meant to last to the gate. Consumer hardware. I should have written it myself.',
    },
    {
      character: {
        id: 'c13-coralie',
        name: 'Coralie Dubois-Ferrand',
        role: 'Soprano',
        age: 28,
        tagline: 'The high C was perfect. Ask anyone. Ask me.',
        personality: 'Dramatic, generous, incapable of a short answer or a quiet entrance.',
        quirk: 'Gestures with both hands as if conducting her own sentences.',
        voice: 'Breathless, italicised, French endearments; every statement a small aria.',
        avatar: {
          skin: '#F1D2B6', hair: 'long', hairColor: '#8B1E3F', eyes: 'wide', brows: 'raised', mouth: 'o',
          accessory: 'flower', facial: 'none', outfit: '#C8323C', accent: '#FFB347',
        },
      },
      relation: 'Engaged to sing at the unmasking; stayed the night in the east corridor.',
      alibi: 'On the dais singing at midnight, in front of everyone.',
      greeting: 'Chérie! A detective! Sit, sit—no, stand, you look better standing. Ask me anything, I hide nothing, it is terrible for the voice.',
      statements: [
        {
          id: 's1',
          text: 'My room was between the boy and the nun. Beeping on one side, Hail Marys on the other. I did not sleep, chérie. I meditated. Loudly.',
        },
        {
          id: 's2',
          text: 'At midnight I sang the high C. Held it for nine seconds. Everybody was looking at me, as is proper. If anybody left during it, they have no soul and I forgive them.',
        },
        {
          id: 's3',
          text: 'The beeping stopped just before I went up to sing. I remember because I thought: at last, the universe is clearing the stage for me.',
        },
      ],
      accusedWrong: 'Moi? I was on a dais, in a spotlight, holding a C above two hundred people! If I had also been robbing a vault I would like a medal, not a charge.',
    },
  ],

  puzzles: [
    {
      type: 'grid',
      id: 'room-grid',
      title: 'Who slept where?',
      prompt:
        'The room sheet is ash, but the guests remember their neighbours. Rooms 1 to 5 run in order along the east corridor: Room 1 is beside the great staircase and Room 5 is beside the chapel. Use their five statements to assign each guest a room.',
      rows: ['Captain Mallory', 'Lady Octavia', 'Vikram', 'Coralie', 'Sister Perpetua'],
      cols: ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5'],
      clues: [
        'The Captain\'s room is beside the stairs.',
        'Sister Perpetua\'s room is beside the chapel.',
        'Coralie\'s room is directly between Vikram\'s and Sister Perpetua\'s.',
        'Lady Octavia insists on an even-numbered room.',
        'Vikram\'s room is two doors from the Captain\'s.',
      ],
      solution: {
        'Captain Mallory': 'Room 1',
        'Lady Octavia': 'Room 2',
        'Vikram': 'Room 3',
        'Coralie': 'Room 4',
        'Sister Perpetua': 'Room 5',
      },
      hint: 'Fix the two ends first: the stairs are by Room 1 and the chapel by Room 5. Then count two doors from the Captain.',
      explanation:
        'Room 1 is beside the stairs, so the Captain has Room 1. Room 5 is beside the chapel, so Sister Perpetua has Room 5. Vikram is two doors from the Captain: Room 3. Coralie is directly between Vikram (3) and Perpetua (5): Room 4. That leaves Room 2 for Lady Octavia—even, as she insists. The spare vault key was in Room 3. Room 3 was Vikram\'s.',
      revealClueId: 'room-three',
    },
  ],

  hints: [
    'The sheet is gone, but five people each told you something about where they slept. Fix the rooms at the ends of the corridor first.',
    'Once you know who had Room 3, check that person\'s claims against the butler, who counts guests the way he counts spoons.',
    'A gate search stops pockets, not the sky. Find what landed in the maze, then put it to the man who insists he is "a software man".',
  ],

  culpritId: 'c13-vikram',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Who occupied Guest Room 3, where the spare vault key was kept?',
      options: [
        { id: 'a', text: 'Lady Octavia' },
        { id: 'b', text: 'Captain Mallory' },
        { id: 'c', text: 'Vikram Sethi-Lancaster' },
        { id: 'd', text: 'Coralie Dubois-Ferrand' },
      ],
      correct: 'c',
      explanation: 'Captain in 1, Perpetua in 5, Vikram two doors from the Captain in 3, Coralie between Vikram and Perpetua in 4, Octavia in even-numbered 2.',
    },
    {
      id: 'q2',
      prompt: 'How did the sapphire leave the Hall despite the gate search?',
      options: [
        { id: 'a', text: 'Hidden inside the champagne tower' },
        { id: 'b', text: 'Flown out by drone from the Room 3 balcony into the hedge maze' },
        { id: 'c', text: 'Carried out by the butler in his waistcoat' },
        { id: 'd', text: 'It never left; it was in the chapel' },
      ],
      correct: 'b',
      explanation: 'The drone in the maze carried a velvet pouch with sapphire-wrap fibres; the controller in Vikram\'s jacket logged a flight at 00:06 from the height and position of the Room 3 balcony.',
    },
    {
      id: 'q3',
      prompt: 'What timing shows Vikram had the opportunity?',
      options: [
        { id: 'a', text: 'He left the ballroom at 23:58 and returned at 00:09; the vault override is stamped 00:03' },
        { id: 'b', text: 'He arrived at the Hall at 7 PM' },
        { id: 'c', text: 'He sang at midnight' },
        { id: 'd', text: 'He went to bed at 1 AM' },
      ],
      correct: 'a',
      explanation: 'Hargreaves logged him out at 23:58 and back at 00:09. The override at 00:03 falls neatly inside those eleven minutes that Sister Perpetua also counted.',
    },
    {
      id: 'q4',
      prompt: 'Which clue fixes Lady Octavia\'s room?',
      options: [
        { id: 'a', text: 'The vault override record' },
        { id: 'b', text: 'The housekeeper\'s note that Her Ladyship insists on an even-numbered room' },
        { id: 'c', text: 'The burned sheet' },
        { id: 'd', text: 'The drone\'s flight log' },
      ],
      correct: 'b',
      explanation: 'With Rooms 1, 3, 4 and 5 fixed by the other statements, Room 2 remained—and the housekeeper\'s note confirms Octavia will only sleep in an even number.',
    },
  ],

  solution: [
    'The burned sheet was meant to bury one fact: who was given Guest Room 3, and with it the small key to the bureau holding the vault\'s spare. But five guests had five neighbours and five complaints. The Captain\'s knee put him beside the stairs in Room 1. Sister Perpetua asked for the chapel\'s neighbour, Room 5. The Captain heard Vikram\'s gadgets two doors down: Room 3. Coralie lay between beeps and Hail Marys: Room 4. Lady Octavia took the only even room left, Room 2, as she has since 1988.',
    'Vikram said he had Room 2, next to the Captain. He did not. Room 3 was his—and Room 3 held the spare key, in a bureau opened with its own key, which the housekeeper handed him at check-in. He burned the sheet in the ballroom grate at about 11:50, when the fire was hot and the guests were drunk.',
    'The butler, who counts spoons and people, logged Vikram out of the ballroom at 23:58—during the countdown, as Sister Perpetua also noticed—and back at 00:09. The vault override is stamped 00:03. Eleven minutes: up the stairs, bureau, down to the cellar, open the vault, back up to Room 3.',
    'The gate search caught nothing because nothing went through the gate. From the Room 3 balcony—the only one clear of ivy—a palm-sized drone carried the sapphire in a velvet pouch over the lawn towards the hedge maze, where it was to be collected in the morning. The battery gave out in a dead end. The controller, paired to that drone, was in Vikram\'s dinner jacket with a flight logged at 00:06.',
    'Lady Octavia never left her own party. The Captain could not take the stairs quietly. Sister Perpetua was counting, Coralie was singing, and Hargreaves was watching. Only one guest was bored enough, clever enough and absent at the right time—and he told you the wrong room number with a straight face.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. He burned the paper and forgot the people. They always forget the people.', mood: 'neutral' },
    { speaker: 'nia', text: 'The drone\'s firmware logged every flight since he bought it. Three practice runs over the maze last week. He flew a test pattern that spelled his initials. I\'m not joking.', mood: 'happy' },
    { speaker: 'quill', text: 'Sapphire fibres in a velvet pouch, Rookie. "Blue, blue, thou art a liar." I may be misquoting.', mood: 'happy' },
    { speaker: 'lucien', text: 'Instructive maze, as I said. I do hope you thanked the butler. Men who count spoons are the backbone of detection.', mood: 'smug' },
    { speaker: 'hestia', text: 'Her Ladyship has asked me to file next year\'s guest list with the county. In triplicate, dear. One learns.', mood: 'happy' },
    { speaker: 'otto', text: 'The stone goes back on its cushion. The boy goes somewhere with no balcony. Rookie—good corridor.', mood: 'neutral' },
    { speaker: 'you', text: 'Room 3. It was always Room 3.', mood: 'neutral' },
  ],
};
