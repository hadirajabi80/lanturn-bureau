import type { CaseFile } from '../types';

/**
 * CASE 08 — "The Dog That Wasn't There"  (medium)
 * A vintage Patek vanishes from flat 4B while its owner walks the dog.
 * Logic: Colin (4A) claims to have heard the dog at 6:10 — but the dog was in Ferris Park on camera.
 * The balcony divider was crossed from the 4A side. The obvious suspect (the nephew with a key) is cleared by a continuous voice chat.
 */
export const case08: CaseFile = {
  id: 'case-08',
  number: 8,
  title: "The Dog That Wasn't There",
  difficulty: 'medium',
  tagline: 'He heard the dog barking. The dog was two streets away.',
  location: 'Cresswell Mansions, flat 4B',
  time: '6:00 – 6:20 PM',
  crime: "Dr. Lydia Marchetti's vintage Patek Philippe was taken from her flat while she walked her dog; the balcony door was forced.",
  palette: { from: '#1C2233', to: '#2E3A55', glow: '#F4C878' },

  briefing: [
    "Cresswell Mansions is the kind of red-brick block where everyone knows everyone's business and the walls are thin enough to confirm it. Dr. Lydia Marchetti lives in 4B with a small, loud dog called Biscuit and a collection of vintage watches that she keeps, with a collector's optimism, in a glass-fronted case in her sitting room.",
    "At six o'clock sharp she clipped Biscuit to his lead and walked to Ferris Park, as she does every evening. Her fitness tracker logs the door at 6:00 and again at 6:20. In those twenty minutes somebody forced her balcony door, opened the case and took exactly one thing: a 1952 Patek Philippe worth more than the flat. The rest of the collection was untouched. The burglar knew what they wanted.",
    "The fourth floor has two flats. 4A belongs to Colin Hartigan, a retired loss-adjuster who tells anyone who will listen that he hears everything through the walls. Below, in 3B, Mrs. Edna Pruitt lives with four cats and a precise ear for footsteps. A courier dropped a parcel at 4B's door around 6:05. And Lydia's nephew Jake, who has a key and no visible income, lives three streets away and has already been described to you by two neighbours as 'that boy'.",
    "Otto's instruction was brief: 'Hm. Everyone's decided it's the nephew. Find out whether they're right before you agree with them.' Start with the balcony.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Hm. Watch collector, dog walk, balcony door forced. Twenty minutes. The nephew has a key and no job. Everybody in that building has already convicted him.', mood: 'neutral' },
    { speaker: 'nia', text: 'Which is why I pulled Ferris Park’s camera feed before anyone asked. Lydia and Biscuit are on it, 6:04 to 6:17, doing laps of the duck pond. The dog has strong opinions about ducks.', mood: 'smug' },
    { speaker: 'quill', text: 'The balcony divider between 4A and 4B is a lattice of wrought iron and, this evening, of scuff marks. Scuff marks have a direction, Rookie. They are the footprints of the clumsy.', mood: 'happy' },
    { speaker: 'lucien', text: 'A Patek taken and a Rolex left behind. Our burglar has taste. That already rules out most of Greywick and all of its nephews.', mood: 'smug' },
    { speaker: 'hestia', text: 'Mr. Hartigan has written to the Bureau eleven times about noise, dear. I have the letters. He hears a great deal. Mostly things that aren’t there.', mood: 'neutral' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'neutral' },
    { speaker: 'otto', text: 'Four names. Clear the obvious one properly or hang him properly. Go.', mood: 'neutral' },
  ],

  scenes: [
    {
      id: 'flat-4b',
      name: 'Flat 4B — Sitting Room & Balcony',
      description: "Lydia's sitting room: a glass watch case with one empty velvet slot, a dog bed shaped like a croissant, and a balcony door hanging slightly wrong on its hinges.",
      palette: ['#1B2130', '#2F3C5C', '#F4C878'],
      props: ['Watch', 'Dog', 'DoorOpen', 'Armchair', 'Lamp'],
      hotspots: [
        {
          id: 'balcony-divider',
          x: 82, y: 45,
          label: 'Balcony divider & forced door',
          clueId: 'balcony-marks',
        },
        {
          id: 'watch-case',
          x: 30, y: 40,
          label: 'Glass watch case',
          flavor: 'Eleven watches and one empty velvet slot. The empty one has a little brass label: “Patek — 1952 — DO NOT WIND, JAKE.” Family tensions, in brass.',
        },
        {
          id: 'dog-bed',
          x: 20, y: 75,
          label: "Biscuit's bed",
          flavor: 'A croissant-shaped bed containing three tennis balls, a chewed TV remote and what used to be a slipper. Biscuit has strong opinions about slippers, too.',
        },
        {
          id: 'hall-table',
          x: 55, y: 70,
          label: 'Hall table',
          flavor: 'Keys, a lead, a tin of dog treats and a “Neighbourhood Watch” leaflet with “COLIN — SEE ME” written on it in Lydia’s hand. Underlined twice.',
        },
        {
          id: 'shared-wall',
          x: 8, y: 30,
          label: 'Wall shared with 4A',
          flavor: 'You tap it. It sounds like cardboard. From the other side, immediately, a cough. Colin does hear everything.',
        },
      ],
    },
    {
      id: 'landing',
      name: 'Fourth-Floor Landing & Lobby',
      description: 'A tiled landing, two front doors eight feet apart, a cardboard parcel still propped against 4B, and a brass peephole in 4A that catches the light.',
      palette: ['#23262F', '#3B4150', '#D9B26F'],
      props: ['Package', 'Mail', 'Building', 'Lightbulb', 'Cat'],
      hotspots: [
        {
          id: 'parcel',
          x: 40, y: 65,
          label: 'Parcel against the door of 4B',
          clueId: 'courier-photo',
        },
        {
          id: 'peephole',
          x: 70, y: 38,
          label: "4A's peephole",
          flavor: 'Polished to a mirror shine. The only brass in the building that gets regular use. You feel watched. You are watched.',
        },
        {
          id: 'noise-notices',
          x: 15, y: 30,
          label: 'Noticeboard',
          flavor: '“PLEASE KEEP DOGS QUIET AFTER 9PM — C. Hartigan, 4A.” Underneath, in a different pen: “PLEASE KEEP COLIN QUIET AT ALL TIMES — Everyone.”',
        },
        {
          id: 'stairs',
          x: 55, y: 85,
          label: 'Stairs to 3B',
          flavor: 'Each step creaks in a different key. Mrs. Pruitt could probably name the tune.',
        },
      ],
    },
    {
      id: 'ferris-park',
      name: 'Ferris Park, Duck Pond',
      description: 'A municipal pond, an iron bench, a litter bin with ambitions, and a council camera on a pole that has been pointed at the ducks for reasons nobody can remember.',
      palette: ['#14261F', '#2A4A3A', '#A8D8B9'],
      props: ['Trees', 'Cctv', 'Bird', 'Footprints', 'Bone'],
      hotspots: [
        {
          id: 'camera-post',
          x: 75, y: 25,
          label: 'Council camera on the lamp post',
          clueId: 'park-camera',
        },
        {
          id: 'bench',
          x: 30, y: 60,
          label: 'Iron bench',
          flavor: 'Plaque: “In memory of Harold, who sat here.” Someone has added, in marker, “He is still here in spirit and in chewing gum.”',
        },
        {
          id: 'ducks',
          x: 55, y: 75,
          label: 'The ducks',
          flavor: 'Six ducks. They regard you with the specific contempt of birds who have met Biscuit. One quacks. It sounds like an accusation.',
        },
        {
          id: 'bin',
          x: 12, y: 40,
          label: 'Litter bin',
          flavor: 'A dog-treat wrapper, a coffee cup and a flyer for “Greywick Watch & Clock Fair — Discreet Sales Welcome”. You note the word discreet.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'step-tracker',
      name: "Lydia's fitness tracker",
      kind: 'digital',
      initial: true,
      icon: 'Activity',
      description: "Lydia's wrist tracker logs her leaving the flat at 6:00 PM and returning at 6:20 PM — 1,900 steps, a round trip to Ferris Park and back.",
      detail: 'The theft happened inside those twenty minutes. Biscuit was with her the whole time; he does not walk himself.',
    },
    {
      id: 'park-camera',
      name: 'Ferris Park camera footage',
      kind: 'digital',
      icon: 'Cctv',
      description: 'The council camera over the duck pond shows Lydia and Biscuit arriving at 6:04 PM and leaving at 6:17 PM. Biscuit spends most of the thirteen minutes barking at ducks.',
      detail: 'Between 6:04 and 6:17 the dog was two streets away. Nobody at Cresswell Mansions could have heard him bark at ten past six — not through a wall, not through anything.',
    },
    {
      id: 'balcony-marks',
      name: 'Balcony divider scuffs',
      kind: 'physical',
      icon: 'Footprints',
      description: 'The wrought-iron divider between the 4A and 4B balconies carries fresh scuff marks and a scrape of grey sole rubber — all on the 4A side, where someone climbed up, with a matching drop-mark on the 4B side where they landed. The 4B balcony door was then jimmied with a flat tool.',
      detail: 'The marks run one direction: from 4A to 4B. Whoever broke into 4B started on Colin Hartigan’s balcony. No other balcony connects to 4B; it is four floors up.',
    },
    {
      id: 'courier-photo',
      name: "Courier's delivery photo",
      kind: 'photo',
      icon: 'Camera',
      description: 'Ravi’s delivery app photographed the parcel against 4B’s door at 6:05 PM. His GPS shows him back on his bike and two streets away by 6:07.',
      detail: 'The photo also catches, in the corner, the brass peephole of 4A — and a shadow behind it. Ravi was gone in two minutes; whoever was behind that peephole was not.',
    },
    {
      id: 'game-log',
      name: "Jake's voice-chat log",
      kind: 'digital',
      icon: 'Gamepad2',
      description: 'Nia confirms Jake’s guild server logs: continuous voice chat from 5:02 PM to 8:14 PM, with Jake talking, shouting, and at one point apologising to someone called “Void_Daddy” at 6:11 PM.',
      detail: 'Three hours of unbroken audio from Jake’s flat, three streets away. He could not have been on a fourth-floor balcony at ten past six.',
    },
    {
      id: 'edna-footsteps',
      name: "Edna's footsteps",
      kind: 'testimony',
      icon: 'Footprints',
      description: 'Mrs. Pruitt heard heavy footsteps on the balcony directly above her at about ten past six — a thump, then two or three steps, then the balcony door “complaining”. Her flat is directly beneath 4B.',
      detail: 'Someone was on 4B’s balcony at 6:10, when Lydia and Biscuit were at the duck pond. Edna is sure of the time because her radio had just started the ten-past bulletin.',
    },
    {
      id: 'watch-forum',
      name: 'Forum listing',
      kind: 'digital',
      icon: 'Globe',
      description: 'Nia finds a post on a collectors’ forum at 7:30 PM tonight, under a username registered to Colin’s email: “Marchetti-style Patek, 1952, discreet sale, serious offers only. No time-wasters.”',
      detail: 'Posted ninety minutes after the theft by a man who claims not to know a Patek from a potato — and who used the owner’s own name as the selling point.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c08-colin',
        name: 'Colin Hartigan',
        role: 'Neighbour, flat 4A',
        age: 52,
        tagline: 'I hear everything through these walls.',
        personality: 'Nosy, aggrieved, convinced the building is a conspiracy against his peace.',
        quirk: 'Tilts his head toward the wall whenever he mentions a noise.',
        voice: 'Grumbling, over-detailed, builds every sentence toward a complaint; “I’m not one to gossip, but”.',
        avatar: {
          skin: '#EFC9A9', hair: 'short', hairColor: '#7A6A5A', eyes: 'narrow', brows: 'angry', mouth: 'frown',
          accessory: 'glasses', facial: 'mustache', outfit: '#6E5A3A', accent: '#D9B26F', age: 'adult',
        },
      },
      relation: 'Next-door neighbour; shares a wall and a balcony divider with 4B.',
      alibi: 'Home all evening, listening to the radio.',
      motive: 'Retired early on a bad pension; has priced Lydia’s collection through the wall for years.',
      greeting: 'About time. I’ve told the council, I’ve told the landlord, I’ve told the Bureau eleven times. That dog. That boy. This building.',
      statements: [
        {
          id: 's1',
          text: 'I was home all evening with the radio on. Where else would I be? I don’t go out. Going out is how you miss things.',
        },
        {
          id: 's2',
          text: 'I heard Biscuit yapping about ten past six — through the wall, clear as a bell. That dog never stops. Yap, yap, yap. I made a note of it. I make notes.',
          contradictedBy: 'park-camera',
          pressReply: 'Well — must’ve been the telly, then. Or Edna’s cat. They all sound the same through plaster. I’m not one to gossip, but Edna’s cats are very vocal —',
          wrongPressReply: 'That’s nothing to do with what I heard. I know what I heard. I have very good ears. Ask anyone. They’ll tell you I never stop hearing things.',
          revealClueId: 'watch-forum',
        },
        {
          id: 's3',
          text: 'I never use the balcony. Heights. Haven’t set foot on it since I moved in. The planters out there are purely decorative — I water them through the window.',
          contradictedBy: 'balcony-marks',
          pressReply: 'Those are from my planters. Dragging them about. Very heavy, terracotta. Or the window cleaner — he’s very careless —',
          wrongPressReply: 'I don’t see what that proves about my balcony. My balcony is my business, and I have no business on it.',
        },
        {
          id: 's4',
          text: 'And I’ll tell you now, I don’t know a Patek from a potato. Watches. Who cares? I’ve had the same Casio since 1998. Keeps perfect time, unlike that dog.',
          contradictedBy: 'watch-forum',
          pressReply: '…That account was hacked. Hackers. It’s all hackers these days, you read about it. I’m not one to gossip, but I should think the boy did it. He’s good with computers.',
          wrongPressReply: 'You can wave paper at me all day. I know what I know, and what I know is I know nothing about watches.',
        },
      ],
      accusedWrong: 'Me! I’ve lived in this building nineteen years and the only thing I’ve ever taken is minutes. Of the residents’ meeting. Which nobody attends. Go and arrest the boy — he’s got a key, hasn’t he?',
      accusedRight: 'Nineteen years of that dog through that wall, and her with a cabinet full of money she never even winds. I climbed over at ten past, I was back in my chair by quarter past, and I’d have been fine if I hadn’t opened my mouth about the barking. I hear everything through these walls. Turns out I hear things that aren’t even there.',
    },
    {
      character: {
        id: 'c08-ravi',
        name: 'Ravi Chandrasekar',
        role: 'Bicycle courier',
        age: 30,
        tagline: 'Delivered. Photographed. Gone.',
        personality: 'Cheerful, efficient, narrates his day like a sports commentator.',
        quirk: 'Checks the time on his phone every few sentences out of habit.',
        voice: 'Upbeat, quick, uses delivery jargon; genuinely enjoys being helpful.',
        avatar: {
          skin: '#9B6B45', hair: 'buzz', hairColor: '#1B1B1B', eyes: 'round', brows: 'raised', mouth: 'smile',
          accessory: 'cap', facial: 'stubble', outfit: '#2EC4B6', accent: '#F4C878', age: 'adult',
        },
      },
      relation: 'Delivered a parcel to 4B at 6:05 PM.',
      alibi: 'Dropped the parcel, photographed it, back on the bike by 6:07 with GPS to prove it.',
      greeting: 'Hi! Yeah, 4B, 6:05, photo, gone. I do forty of those a day. Ask me anything, I’ve got a timestamp for it.',
      statements: [
        {
          id: 's1',
          text: 'I dropped the parcel at 6:05, took the proof photo, and I was back on the bike by 6:07. The app tracks every second — the GPS has me two streets over before the lift even got back down.',
        },
        {
          id: 's2',
          text: 'Weird thing, though — there was a bloke watching me through the peephole next door. 4A. You can tell when it goes dark. Stood there the whole time I was on the landing. Didn’t open the door, didn’t say hello.',
        },
        {
          id: 's3',
          text: 'No dog, by the way. Usually when I do 4B there’s a dog going mental behind the door. Tonight — silence. I actually checked the address twice.',
        },
      ],
      accusedWrong: 'Mate, I was on the landing for ninety seconds and I’ve got a GPS trail that says so. If I’d gone over a balcony I’d have had to leave the bike, and nobody leaves the bike.',
    },
    {
      character: {
        id: 'c08-edna',
        name: 'Mrs. Edna Pruitt',
        role: 'Neighbour, flat 3B',
        age: 79,
        tagline: 'Four cats, two ears, one radio. I miss nothing.',
        personality: 'Lively, sharp, delighted by any excuse to talk to a visitor.',
        quirk: 'Addresses her cats as witnesses (“Isn’t that right, Marmalade?”).',
        voice: 'Chatty, warm, wanders off-topic and snaps back with surprising precision about times.',
        avatar: {
          skin: '#F5DCC8', hair: 'curly', hairColor: '#E8E8E8', eyes: 'wide', brows: 'raised', mouth: 'smile',
          accessory: 'pearls', facial: 'none', outfit: '#8E4A7A', accent: '#FFB7C5', age: 'old',
        },
      },
      relation: 'Lives directly beneath 4B.',
      alibi: 'Home with the cats and the six o’clock radio.',
      greeting: 'Oh, a detective! Come in, mind Marmalade. I’ve been waiting all evening for someone to ask me. Nobody ever asks me.',
      statements: [
        {
          id: 's1',
          text: 'Ten past six — the radio had just gone to the bulletin — and there were footsteps on the balcony right over my head. Heavy ones. A thump, then steps, then that door of hers complaining. Isn’t that right, Marmalade? She heard it too.',
          revealOnRead: true,
          revealClueId: 'edna-footsteps',
        },
        {
          id: 's2',
          text: 'Biscuit was out with Lydia — I waved to them from my window at six on the dot. He was pulling her toward the park like a little steam engine. He wasn’t in that flat, dear. He was off bothering ducks.',
        },
        {
          id: 's3',
          text: 'The boy, Jake? He’s a lump but he’s a kind lump. Carried my shopping up once without being asked. Anyone who says he did this hasn’t met him, or has met Colin.',
        },
      ],
      accusedWrong: 'Me? Dear, I can’t get up on a chair without Marmalade supervising. If I’d climbed a balcony the whole building would have heard it, and so would St. Jude’s.',
    },
    {
      character: {
        id: 'c08-jake',
        name: 'Jake Marchetti',
        role: "Lydia's nephew",
        age: 22,
        tagline: 'I have a key. Why would I use a window?',
        personality: 'Slack, defensive, smarter than he lets on; tired of being the obvious suspect.',
        quirk: 'Keeps one earbud in at all times, as if a raid might start without him.',
        voice: 'Flat, mumbly, gamer slang; sparks into eloquence only when indignant.',
        avatar: {
          skin: '#D9A57F', hair: 'mohawk', hairColor: '#2B1F17', eyes: 'sleepy', brows: 'flat', mouth: 'pout',
          accessory: 'headphones', facial: 'none', outfit: '#2B2B2B', accent: '#7C5CFF', age: 'young',
        },
      },
      relation: 'Nephew with a key to 4B; the building’s favourite suspect.',
      alibi: 'In his own flat three streets away, raiding with his guild on voice chat from 5 PM.',
      motive: 'No visible income and an aunt who refuses to “lend” him money. The building has decided this is enough.',
      greeting: '…Yeah. I know. The nephew. With the key. Go on, do your thing.',
      statements: [
        {
          id: 's1',
          text: 'I was raiding with my guild from five. Voice chat the whole time — you can hear me, like, constantly. There’s a log. I was yelling at a guy called Void_Daddy about a healing rotation at ten past six. Not my finest hour but it’s timestamped.',
          revealOnRead: true,
          revealClueId: 'game-log',
        },
        {
          id: 's2',
          text: 'Aunt Lydia gave me a key. A key. Why would I go over a balcony and break the door when I could just… open the door? I’m lazy, not stupid.',
        },
        {
          id: 's3',
          text: 'Colin’s been telling everyone it’s me since before the police turned up. Guy’s got a peephole and a grudge. He asked me once what the Patek was worth. I said I didn’t know. He did. He knew to the pound.',
        },
      ],
      accusedWrong: 'Yeah, see, this is what I said would happen. Three hours of voice chat, a key in my pocket, and I still get accused because I don’t own a tie. Check the log. Then check Colin’s balcony.',
    },
  ],

  puzzles: [],

  hints: [
    'Everyone is pointing at the nephew. Before you agree with them, check where he actually was — and where the dog was.',
    'Colin says he heard Biscuit barking at ten past six. Where does the Ferris Park camera put Biscuit at ten past six?',
    'The scuff marks on the balcony divider run in one direction. Press Colin on his balcony, then on the dog, and see what Nia finds in his name.',
  ],

  culpritId: 'c08-colin',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Why is Colin’s story about hearing Biscuit a lie?',
      options: [
        { id: 'a', text: 'Because Biscuit is a quiet dog who never barks.' },
        { id: 'b', text: 'Because Biscuit was on camera in Ferris Park with Lydia from 6:04 to 6:17 — two streets away from Colin’s wall.' },
        { id: 'c', text: 'Because Colin is hard of hearing.' },
        { id: 'd', text: 'Because the radio was too loud for him to hear anything.' },
      ],
      correct: 'b',
      explanation: 'Colin claimed to hear Biscuit through the wall at ten past six. The park camera shows the dog at the duck pond from 6:04 to 6:17. Colin invented the barking to prove he was home listening — and proved instead that he was not listening at all.',
    },
    {
      id: 'q2',
      prompt: 'How did the burglar get into 4B?',
      options: [
        { id: 'a', text: 'With Jake’s key, through the front door.' },
        { id: 'b', text: 'Hidden inside the courier’s parcel.' },
        { id: 'c', text: 'Across the shared balcony divider from 4A, then by jimmying 4B’s balcony door.' },
        { id: 'd', text: 'Up the drainpipe from Edna’s balcony in 3B.' },
      ],
      correct: 'c',
      explanation: 'The scuffs on the wrought-iron divider run from the 4A side to the 4B side, and the 4B balcony door was forced from outside. The only balcony that touches 4B belongs to Colin.',
    },
    {
      id: 'q3',
      prompt: 'Why is Jake, the obvious suspect, cleared?',
      options: [
        { id: 'a', text: 'Because he is too lazy to climb a balcony.' },
        { id: 'b', text: 'Because Edna says he is a kind lump.' },
        { id: 'c', text: 'Because the guild server logs him in continuous voice chat from 5:02 to 8:14 PM, three streets away.' },
        { id: 'd', text: 'Because he had a key and therefore could not have wanted the watch.' },
      ],
      correct: 'c',
      explanation: 'Jake’s voice-chat log is unbroken through the whole theft window, with him audibly speaking at 6:11. Having a key makes the balcony break-in pointless for him, but the log is what actually proves he was elsewhere.',
    },
  ],

  solution: [
    'The whole building wanted it to be Jake: the nephew with a key, no job and an earbud permanently in place. But a man with a key does not climb a balcony and force a door, and more to the point, Jake was three streets away shouting at a stranger about healing rotations. His guild’s voice-chat log runs unbroken from 5:02 to 8:14 PM. The obvious suspect is the one person who certainly did not do it.',
    'The balcony tells you who did. The wrought-iron divider between 4A and 4B is scuffed and scraped on the 4A side where someone climbed, with a landing mark on the 4B side, and 4B’s balcony door was jimmied from outside. Four floors up, 4B’s balcony touches exactly one other: Colin Hartigan’s. Edna, directly below, heard the thump and the footsteps at ten past six, just as her radio went to the bulletin.',
    'Colin undid himself by being Colin. Asked to account for his evening, he volunteered a detail: he heard Biscuit yapping through the wall at ten past six. But the Ferris Park camera shows Lydia and Biscuit at the duck pond from 6:04 to 6:17. The dog was two streets away. Colin invented the barking to prove he was sitting at home listening — the alibi of a man who did not realise the dog had gone with its owner.',
    'Pressed on it, he blamed the television and Edna’s cats, and Nia found the rest: a forum post at 7:30 PM from an account tied to his own email, offering a “Marchetti-style Patek, discreet sale” — from a man who insisted he did not know a Patek from a potato, and who, as Jake remembered, had once asked exactly what the watch was worth. The scuffs are not from his planters. He waters those through the window.',
    'The Patek was in Colin’s airing cupboard, wrapped in a tea towel, still keeping perfect time. Lydia has forgiven Jake for nothing, because there was nothing to forgive, and has rewritten the brass label on the empty slot. Biscuit continues to bark at ducks, who continue to deserve it.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. He heard a dog that wasn’t there. That’s the whole case, Rookie. Everything else is paperwork.', mood: 'neutral' },
    { speaker: 'nia', text: 'He posted the listing from his own email ninety minutes after the job. “No time-wasters.” Sir, you are the time-waster. You are the entire waste of time.', mood: 'smug' },
    { speaker: 'quill', text: 'Grey sole rubber on wrought iron — “the lady doth protest too much” and so, it transpires, doth her neighbour’s trainers.', mood: 'happy' },
    { speaker: 'lucien', text: 'I did say the thief had taste. I did not say the thief had sense. These are rarely found in the same flat.', mood: 'smug' },
    { speaker: 'hestia', text: 'Mrs. Pruitt sent a thank-you note, dear, with a paw print from Marmalade. It is now in the file and, I’m afraid, on Pip.', mood: 'happy' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'angry' },
    { speaker: 'otto', text: 'Good work. Next time someone tells you who did it before you’ve asked — hm. You know.', mood: 'happy' },
  ],
};
