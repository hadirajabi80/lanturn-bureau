import type { CaseFile } from '../types';

/**
 * CASE 11 — "The Planted Scarf"  (hard)
 * A frame-up at Bellwether Yard. The dry scarf on wet gravel is the tell;
 * the studio manager with keys to everything is the thief.
 * Hestia gives Otto a lilac scarf in the opening dialogue [PLANT].
 */
export const case11: CaseFile = {
  id: 'case-11',
  number: 11,
  title: 'The Planted Scarf',
  difficulty: 'hard',
  tagline: 'The rain stopped at half past ten. The lie didn\'t.',
  location: 'Bellwether Yard Studios, Canal District, Greywick',
  time: '9:00 – 11:40 PM',
  crime:
    'The bronze maquette "The Gull" was stolen from Rosalind Achebe-Thorne\'s studio through a broken window; her rival\'s silk scarf was left draped across the glass.',
  palette: { from: '#1B2436', to: '#3A2E4F', glow: '#C9B6E4' },

  briefing: [
    'Bellwether Yard is a horseshoe of converted tram sheds on the Canal District where Greywick\'s sculptors rent space by the square metre and the grudge. Last night, from Studio 4, somebody took Rosalind Achebe-Thorne\'s bronze maquette "The Gull": forty centimetres of wing and spite, the study for a public commission worth more than the Yard it sits in.',
    'Rosalind came back at 11:40 PM for a forgotten sketchbook and found the studio window in pieces, the plinth empty, and—outside on the gravel, laid neatly across the shards like a bookmark—a sea-green silk scarf. Everyone in the Yard knows that scarf. It belongs to Ingrid Solvang, the only other sculptor in the city with a chance at the same commission.',
    'The Met log is in the file: rain from 8:30 to 10:30 PM, hard and steady. The gravel was still soaked when the constables arrived. The scarf was not. Nobody has yet explained how silk stays dry in a downpour, and nobody seems keen to try.',
    'Studio manager Percival Dunmore has been very helpful. He has given a statement, a theory and a name, in that order, before anyone asked him for any of the three.',
    'Otto\'s note, clipped to the cover: "Too neat. Rookie—when the evidence hands you a name, find out who handed it."',
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Bellwether Yard. Sculpture. Somebody\'s bronze gull has flown.', mood: 'neutral' },
    { speaker: 'nia', text: 'And the thief left the rival\'s scarf on the glass. Honestly, if I were framing someone I\'d at least try a little subtlety. Leave a monogrammed glove. Something.', mood: 'smug' },
    { speaker: 'quill', text: 'A dry scarf, Rookie, upon wet gravel. Attend to the adjective. Adjectives are where the guilty live.', mood: 'happy' },
    { speaker: 'hestia', text: 'Before you go, Ottoline. Lilac. Knitted it myself, dear. Everyone gets one eventually, and you were the last holdout.', mood: 'happy' },
    { speaker: 'otto', text: 'Hm. ...It\'s warm. Tell no one.', mood: 'neutral' },
    { speaker: 'lucien', text: 'I\'d solve this for you, but the studio manager has already done it. He had a culprit ready before the glass stopped tinkling. How very convenient.', mood: 'smug' },
    { speaker: 'you', text: 'Who gains from the gull being gone—and from Ingrid being blamed for it?', mood: 'thinking' },
    { speaker: 'otto', text: 'That\'s the case. Go and stand in the rain that isn\'t falling anymore.', mood: 'neutral' },
  ],

  scenes: [
    {
      id: 'studio',
      name: 'Studio 4 — Rosalind\'s Studio',
      description:
        'Clay dust, cold tea and a plinth with nothing on it. The window frame gapes onto the yard; the sill inside is suspiciously clean.',
      palette: ['#1E2538', '#3B3350', '#6B5B8A'],
      props: ['Hammer', 'Paintbrush', 'Lamp', 'Frame', 'Coffee'],
      hotspots: [
        {
          id: 'window-frame',
          x: 72,
          y: 34,
          label: 'Broken window frame',
          clueId: 'glass-outward',
        },
        {
          id: 'studio-door',
          x: 10,
          y: 52,
          label: 'Studio door and deadbolt',
          clueId: 'door-lock',
        },
        {
          id: 'empty-plinth',
          x: 44,
          y: 62,
          label: 'Empty plinth',
          flavor:
            'A square of dust-free felt where The Gull stood. Someone has left a sticky note: "DO NOT TOUCH — R." Somebody touched.',
        },
        {
          id: 'cold-tea',
          x: 28,
          y: 76,
          label: 'Mug of cold tea',
          flavor: 'Half-drunk, skin on top, a thumbprint in clay on the handle. Rosalind\'s. Nobody steals a bronze and stops for tea.',
        },
        {
          id: 'cat-maquette',
          x: 86,
          y: 78,
          label: 'Small clay cat',
          flavor: 'A clay study of a cat sitting on a folder. Pip would approve. Pip would also knock it over.',
        },
      ],
    },
    {
      id: 'yard',
      name: 'The Yard',
      description:
        'Wet gravel, a glass constellation under the broken window, and a gatehouse with one tired camera blinking at the canal.',
      palette: ['#141A28', '#26324A', '#4C6A8A'],
      props: ['CloudRain', 'Camera', 'Car', 'Fence', 'Lightbulb'],
      hotspots: [
        {
          id: 'scarf-on-glass',
          x: 48,
          y: 58,
          label: 'Silk scarf on the shards',
          clueId: 'scarf-dry',
        },
        {
          id: 'gatehouse-monitor',
          x: 12,
          y: 40,
          label: 'Gatehouse camera monitor',
          clueId: 'gate-cctv',
        },
        {
          id: 'puddle',
          x: 66,
          y: 80,
          label: 'Puddle',
          flavor: 'A puddle the size of a tram tyre. Still there at noon. The Yard\'s drainage is a long-running sculpture of its own.',
        },
        {
          id: 'bins',
          x: 88,
          y: 66,
          label: 'Bins',
          flavor: 'Three bins labelled CLAY, METAL and "PERCIVAL\'S — DO NOT USE". The third is empty and spotless.',
        },
      ],
    },
    {
      id: 'office',
      name: 'Manager\'s Office & Locker Corridor',
      description:
        'A glass-walled cubby where Percival labels things, and beyond it the row of artists\' lockers, each padlock a different brand of distrust.',
      palette: ['#1C1F2A', '#34303F', '#6E5A4E'],
      props: ['KeyRound', 'Lock', 'ClipboardList', 'Printer', 'Stamp'],
      hotspots: [
        {
          id: 'key-board',
          x: 24,
          y: 36,
          label: 'Key register and hook board',
          clueId: 'key-register',
        },
        {
          id: 'locker-nine',
          x: 70,
          y: 50,
          label: 'Locker 9 — I. Solvang',
          clueId: 'locker',
        },
        {
          id: 'label-maker',
          x: 40,
          y: 70,
          label: 'Label maker',
          flavor: 'Percival has labelled the label maker "LABEL MAKER". Beneath that, a smaller label: "PROPERTY OF P. DUNMORE".',
        },
        {
          id: 'kettle',
          x: 10,
          y: 74,
          label: 'Office kettle',
          flavor: 'A kettle with a laminated rota taped to it. Thursday is Percival\'s day. It is always, somehow, Thursday.',
        },
        {
          id: 'suggestion-box',
          x: 88,
          y: 30,
          label: 'Suggestion box',
          flavor: 'Padlocked. A folded note sticks out: "Fire Percival." The handwriting is Thea\'s. The padlock is Percival\'s.',
        },
      ],
    },
    {
      id: 'foundry',
      name: 'The Foundry Shed',
      description:
        'Sand moulds, a cold crucible and the smell of burnt wax. Caspian\'s overalls hang on a nail; his phone charges on the bench, lighting up now and then.',
      palette: ['#1A1612', '#4A2E1A', '#C0623A'],
      props: ['Flame', 'Wrench', 'Smartphone', 'HardHat', 'Thermometer'],
      hotspots: [
        {
          id: 'bench-phone',
          x: 62,
          y: 56,
          label: 'Caspian\'s phone on the bench',
          clueId: 'texts',
        },
        {
          id: 'crucible',
          x: 30,
          y: 48,
          label: 'Crucible',
          flavor: 'Stone cold. Nothing was poured last night. Whatever Caspian was doing till eleven, it wasn\'t bronze.',
        },
        {
          id: 'timecard',
          x: 14,
          y: 30,
          label: 'Timecard rack',
          flavor: 'Caspian clocked in at 2 PM and never clocked out. The card for "P. DUNMORE" is pristine. Managers don\'t clock.',
        },
        {
          id: 'two-mugs',
          x: 82,
          y: 74,
          label: 'Two mugs on the sand bench',
          flavor: 'Two mugs, both with lipstick on only one of them. Alone till eleven, he says. Alone with company.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'rain-log',
      name: 'Met Office rain log',
      kind: 'document',
      initial: true,
      icon: 'CloudRain',
      description: 'Greywick Met Office, Canal District station: steady rain from 8:30 PM to 10:30 PM. Dry thereafter.',
      detail:
        '12.4 mm in two hours. Wind south-westerly, light. The gravel at Bellwether Yard was still wet at 11:50 PM when the first constable arrived. Anything placed outside before 10:30 PM would have been soaked.',
    },
    {
      id: 'scarf-dry',
      name: 'The dry scarf',
      kind: 'physical',
      icon: 'Shirt',
      description: 'Ingrid Solvang\'s sea-green silk scarf, lying on top of the broken glass on wet gravel. Completely dry.',
      detail:
        'Silk takes water like a sponge; this one is pristine, not a water-mark on it. It lies across the shards, not under them. So: it was placed after the rain stopped at 10:30 PM, and after the window was broken.',
    },
    {
      id: 'glass-outward',
      name: 'Glass fell outward',
      kind: 'forensic',
      icon: 'Sparkles',
      description: 'Nearly every shard lies on the gravel outside. The sill and floor inside are clean. The window was broken from inside the studio.',
      detail:
        'Quill: "Glass, like gossip, travels in the direction it is pushed. A brick from the yard would shower the studio floor. This window was struck from within—by someone already standing in the room with a key in their pocket."',
    },
    {
      id: 'door-lock',
      name: 'Studio door intact',
      kind: 'physical',
      icon: 'DoorClosed',
      description: 'The studio door was found locked. No scratches on the deadbolt, no tool marks on the frame. Whoever was inside used a key.',
      detail: 'The deadbolt is a five-lever mortice, recently oiled. Rosalind confirms she locked it at 9:00 PM when she left.',
    },
    {
      id: 'key-register',
      name: 'Key register',
      kind: 'document',
      icon: 'KeyRound',
      description: 'Studio 4 keys: R. Achebe-Thorne and P. Dunmore. Locker master key: P. Dunmore only.',
      detail:
        'Percival\'s own neat hand, in Percival\'s own neat ledger. One person in the Yard can open both the studio door and any artist\'s locker, and he wrote it down himself.',
    },
    {
      id: 'locker',
      name: 'Ingrid\'s locker',
      kind: 'physical',
      icon: 'Lock',
      description: 'Locker 9, Ingrid\'s. Padlock intact, hinges unmarked. Ingrid says the scarf has been inside since Tuesday.',
      detail:
        'No forcing. If the scarf really was in here, it came out through a lock that was opened properly—with Ingrid\'s key, or with the master key hanging on Percival\'s board.',
    },
    {
      id: 'gate-cctv',
      name: 'Gate camera footage',
      kind: 'digital',
      icon: 'Camera',
      description: 'The Yard gate camera: Percival Dunmore\'s grey saloon enters at 10:48 PM. No other vehicle or pedestrian between 9:00 and 11:40.',
      detail:
        'Timestamp 22:48:11. Headlights off before the gate. Rosalind\'s bicycle appears at 23:39. Percival\'s car does not leave until the constables arrive, which matches his story of "arriving at midnight" only if midnight begins at ten to eleven.',
    },
    {
      id: 'insurance-memo',
      name: 'Insurance memo',
      kind: 'document',
      icon: 'FileText',
      description: 'Cadwallader & Pike Insurers: valuation of "The Gull" raised from £18,000 to £95,000 two weeks ago, at the request of P. Dunmore, policy administrator.',
      detail:
        'Attached: a draft email from Percival to an unnamed collector, subject line "DISCREET", offering "the original study, no paperwork, cash." Theft pays twice if you sell what you have insured.',
    },
    {
      id: 'auction-receipt',
      name: 'Dunmere auction receipt',
      kind: 'document',
      icon: 'Receipt',
      description: 'Dunmere Auction Rooms, paddle 41 issued to H. Blanc. Bids logged from 8:15 PM to 11:02 PM. Dunmere is forty minutes from the Yard.',
      detail: 'Honoré bought a dreadful landscape at 10:57 PM. He was, regrettably for the plot, exactly where he says he was.',
    },
    {
      id: 'texts',
      name: 'Thea\'s texts',
      kind: 'digital',
      icon: 'MessageSquare',
      description: 'Caspian\'s lock screen: Thea Marchbanks, 9:14 PM "still at the foundry? coming over." and 11:52 PM "don\'t tell them I was with you. please. x"',
      detail:
        'Two people claim to have been alone last night. They were alone together in a foundry shed with two mugs. Awkward, deceitful—and nothing to do with a bronze gull.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c11-ingrid',
        name: 'Ingrid Solvang',
        role: 'Sculptor (rival)',
        age: 39,
        tagline: 'I\'d rather beat her than rob her.',
        personality: 'Fierce, blunt, honest to the point of self-harm.',
        quirk: 'Cracks her knuckles one at a time while thinking.',
        voice: 'Short declaratives. No hedging. Says the damaging thing first because it is true.',
        avatar: {
          skin: '#F1D2B6', hair: 'buzz', hairColor: '#C7B299', eyes: 'sharp', brows: 'angry', mouth: 'frown',
          accessory: 'earring', facial: 'none', outfit: '#2F6F6A', accent: '#2EC4B6',
        },
      },
      relation: 'Rosalind\'s only serious rival for the Harbour Commission; owner of the scarf found on the glass.',
      alibi: 'Home alone in her flat above the chandler\'s from 8 PM.',
      motive: 'Remove the competing maquette before the commission jury meets.',
      greeting: 'Yes, it\'s my scarf. No, I didn\'t do it. Ask the rest quickly; I\'ve got a kiln going.',
      statements: [
        {
          id: 's1',
          text: 'That scarf has been in my locker since Tuesday. I left it there after the clay got on it. Locker 9. Nobody has my key but me.',
        },
        {
          id: 's2',
          text: 'Last night I was home, alone, with the radio. I know exactly how that sounds, and I\'m not going to invent a dinner party to improve it.',
        },
        {
          id: 's3',
          text: 'The Gull is good. Infuriatingly good. I\'d rather beat it in front of the jury than steal it. Stealing it would mean admitting I couldn\'t.',
        },
      ],
      accusedWrong:
        'Of course. The scarf says Ingrid, so it must be Ingrid. Tell me, detective—did the scarf also say how it stayed dry in two hours of rain? Because I\'d love to know.',
    },
    {
      character: {
        id: 'c11-percival',
        name: 'Percival Dunmore',
        role: 'Studio manager',
        age: 48,
        tagline: 'Everything in its place. Including the blame.',
        personality: 'Fussy, officious, quietly resentful of the artists he serves.',
        quirk: 'Straightens any object within reach while talking; keeps a key on a retractable reel.',
        voice: 'Precise, clerical, over-helpful; volunteers theories; says "clearly" when things are not clear.',
        avatar: {
          skin: '#E8C4A2', hair: 'slick', hairColor: '#4A3B2F', eyes: 'narrow', brows: 'raised', mouth: 'neutral',
          accessory: 'glasses', facial: 'mustache', outfit: '#5B5F6B', accent: '#D4A857',
        },
      },
      relation: 'Manages Bellwether Yard, holds the keys, and administers the artists\' group insurance policy.',
      alibi: 'At home until Rosalind rang after the discovery; drove in around midnight.',
      motive: 'A quietly inflated insurance valuation and a private buyer who prefers no paperwork.',
      greeting: 'Detective. I\'ve prepared a summary for you. It\'s all rather clear, I\'m afraid. Poor Ingrid.',
      statements: [
        {
          id: 's1',
          text: 'I was at home all evening. Rosalind rang me in a state, and I drove in—arrived at midnight, give or take. The constables were already here.',
          contradictedBy: 'gate-cctv',
          pressReply:
            'The gate camera. Yes. I—may have driven past earlier. Insomnia. I sit in the car sometimes, in the Yard. It\'s calming. I didn\'t go in.',
          wrongPressReply: 'I don\'t see what that has to do with the time I arrived. Check the gate if you doubt me.',
        },
        {
          id: 's2',
          text: 'Only Rosalind and I hold keys to Studio 4, and I was at home. Clearly the thief came in through the window. That\'s what windows are for, in these matters.',
          contradictedBy: 'glass-outward',
          pressReply:
            'Glass flies everywhere in a storm! The wind, the—there was weather, detective. You can hardly expect shards to fall tidily.',
          wrongPressReply: 'The window is broken. One does not need forensics for that. Someone came through it.',
        },
        {
          id: 's3',
          text: 'Each artist has their own locker key. Nobody else can open Ingrid\'s locker. If the scarf was in there, she took it out herself.',
          contradictedBy: 'key-register',
          pressReply:
            'The master key is for emergencies! Floods, fires, forgotten lunches. I have never—I would never—well. I\'d like a cup of tea now, if that\'s permitted.',
          wrongPressReply: 'The lockers are the artists\' responsibility. It\'s in the tenancy agreement. Paragraph nine.',
          revealClueId: 'insurance-memo',
        },
        {
          id: 's4',
          text: 'The group policy is standard. I administer it as a courtesy. I haven\'t touched the valuations in years—there\'s simply been no reason to.',
          contradictedBy: 'insurance-memo',
          pressReply:
            'Prudence! The commission raised the piece\'s profile. Any administrator would—the email is a draft. Drafts aren\'t crimes. ...Are they?',
          wrongPressReply: 'Insurance is paperwork, detective. Paperwork is my department, and mine is in order.',
        },
      ],
      accusedWrong: 'Me? I\'ve done nothing but help. I handed you the culprit on a plate. Really, this is what one gets for being organised.',
      accusedRight:
        'Fine. Yes. Eighteen thousand pounds of bronze that she wouldn\'t let me insure properly until I did it myself—and a collector who\'d pay ninety for it quietly. I let myself in with my own key, broke the window from inside like a fool, and fetched Ingrid\'s scarf from her locker because everyone would believe it. I waited for the rain to stop so I wouldn\'t get wet. I\'m told that was the mistake.',
    },
    {
      character: {
        id: 'c11-caspian',
        name: 'Caspian Reyes-Oduya',
        role: 'Foundry apprentice',
        age: 26,
        tagline: 'I pour bronze. I don\'t pour lies. Usually.',
        personality: 'Tired, loyal, decent; a bad liar who lies anyway when asked nicely.',
        quirk: 'Yawns mid-sentence and apologises for it.',
        voice: 'Low-energy, honest cadence; trails off when the truth is close; says "look" a lot.',
        avatar: {
          skin: '#8A5A3C', hair: 'curly', hairColor: '#1B1B1B', eyes: 'sleepy', brows: 'worried', mouth: 'neutral',
          accessory: 'bandana', facial: 'stubble', outfit: '#B65A2E', accent: '#FFB347',
        },
      },
      relation: 'Casts Rosalind\'s bronzes; was in the foundry shed across the Yard all evening.',
      alibi: 'Working in the foundry until eleven, alone.',
      greeting: 'Sorry—long night. Look, I didn\'t see anyone. I was in the shed. Ask me whatever.',
      statements: [
        {
          id: 's1',
          text: 'I was in the foundry till eleven, on my own. Cleaning moulds. Nobody came in, nobody went out. Just me and the radio.',
          contradictedBy: 'texts',
          pressReply:
            'Okay. Okay—Thea was with me. From about half nine. She asked me not to say, because of Rosalind, because of... everything. Look, we had tea and talked. That\'s the whole crime.',
          wrongPressReply: 'That doesn\'t change where I was. I was in the shed.',
        },
        {
          id: 's2',
          text: 'Around quarter to eleven I heard a car in the Yard. I figured it was Percival—he comes in at odd hours to re-label things. I didn\'t look.',
        },
        {
          id: 's3',
          text: 'The Gull? I cast it. Took three pours to get the wing right. Whoever took it had better not drop it—there\'s a hairline on the left foot that only I know how to fix.',
        },
      ],
      accusedWrong:
        'Me? I made the thing. You don\'t steal your own best work and leave it with—look, I lied about one thing, and it wasn\'t that.',
    },
    {
      character: {
        id: 'c11-honore',
        name: 'Honoré Blanc',
        role: 'Art dealer',
        age: 60,
        tagline: 'Everything is for sale. The price is the only mystery.',
        personality: 'Oily, charming, utterly unbothered by suspicion because he has receipts.',
        quirk: 'Produces receipts from an inner pocket like a magician producing doves.',
        voice: 'Purring, French-inflected, flatters while deflecting; uses "my dear detective".',
        avatar: {
          skin: '#D9A57F', hair: 'bald', hairColor: '#8B8B8B', eyes: 'narrow', brows: 'arched', mouth: 'smirk',
          accessory: 'monocle', facial: 'goatee', outfit: '#3A2A4F', accent: '#C8323C', age: 'old',
        },
      },
      relation: 'Has been trying to buy The Gull for months; Rosalind kept refusing.',
      alibi: 'Bidding at Dunmere Auction Rooms from 8:15 PM until past eleven.',
      motive: 'Wanted the piece badly and was told no.',
      greeting: 'My dear detective. Before you ask: I was at Dunmere, I have the paddle receipt, and I bought something hideous to prove it.',
      statements: [
        {
          id: 's1',
          text: 'Dunmere Auction Rooms, paddle forty-one, eight-fifteen until the hammer fell at two minutes past eleven. Here is the receipt. Here is the hideous landscape. I keep everything.',
          revealOnRead: true,
          revealClueId: 'auction-receipt',
        },
        {
          id: 's2',
          text: 'I offered Rosalind a fortune for The Gull. Twice. She laughed both times—the second time she had the decency to do it in private.',
        },
        {
          id: 's3',
          text: 'If you want a motive, look for someone who needs the piece to vanish rather than someone who wants it on a shelf. A dealer cannot sell a stolen gull. A fraudster, my dear, only has to lose one.',
        },
      ],
      accusedWrong:
        'Accused by a detective while holding a timestamped receipt. How wonderfully Greywick. Shall I frame the accusation beside the landscape?',
    },
    {
      character: {
        id: 'c11-thea',
        name: 'Thea Marchbanks',
        role: 'Rosalind\'s ex-partner',
        age: 33,
        tagline: 'I\'ve already been accused of worse by better.',
        personality: 'Bitter, witty, braver about her feelings than she lets on.',
        quirk: 'Twists a ring on a finger that no longer has a ring.',
        voice: 'Dry one-liners as armour; a sudden sincere sentence when cornered, then back to jokes.',
        avatar: {
          skin: '#C9956B', hair: 'bob', hairColor: '#7A2E2E', eyes: 'round', brows: 'arched', mouth: 'smirk',
          accessory: 'scarf', facial: 'none', outfit: '#6B2D5C', accent: '#B9A3D6',
        },
      },
      relation: 'Rosalind\'s former partner; still rents a corner of the Yard and still has opinions.',
      alibi: 'Home with wine and bad television.',
      motive: 'A messy breakup and a public one; The Gull was begun the week they split.',
      greeting: 'Let me guess: the ex did it. Save yourself an hour—I\'m much more fun to interview than Percival, and I\'ve got better alibis. Well. Alibi. Singular.',
      statements: [
        {
          id: 's1',
          text: 'Home. Wine. Bad television—the one where strangers renovate a barn and cry. Thrilling evening. Nobody saw me, which is the point of staying in.',
          contradictedBy: 'texts',
          pressReply:
            'Fine. I was with Caspian. In the foundry, drinking terrible tea, from half nine until gone eleven. I asked him to keep quiet because Rosalind would make it about her. It isn\'t about her. For once.',
          wrongPressReply: 'That\'s a lovely piece of evidence, detective. It isn\'t about me.',
        },
        {
          id: 's2',
          text: 'Percival has hated Rosalind since she called his key board "a shrine to control". He underlined it in the minutes. He underlines everything.',
        },
        {
          id: 's3',
          text: 'The Gull is the best thing she ever made. She started it the week we split, so make of that what you like. I\'d never damage it. I\'d quite like to be in it.',
        },
      ],
      accusedWrong:
        'Of course. Bitter ex, no alibi, a motive you could spot from the tram. I lied about where I was, detective, not about what I\'d do. Try the man with the keys.',
    },
  ],

  puzzles: [
    {
      type: 'order',
      id: 'night-order',
      title: 'Reconstruct the night',
      prompt:
        'Put the events of the night in order, first to last. Use the facts: the Met log has rain from 8:30 to 10:30 PM; the gate camera shows Percival\'s car entering at 10:48 PM and nobody else between 9:00 and 11:40; the glass fell outward, so the window was broken by someone already inside the studio; the scarf lies on top of the shards and is dry on wet gravel; Rosalind found the break-in at 11:40 PM.',
      items: [
        { id: 'rain-begins', text: 'Rain begins over the Canal District' },
        { id: 'rain-ends', text: 'Rain stops; the gravel is left soaked' },
        { id: 'percival-enters', text: 'Percival\'s car enters the Yard' },
        { id: 'window-broken', text: 'The studio window is broken from inside' },
        { id: 'scarf-placed', text: 'Ingrid\'s scarf is laid on the shards' },
        { id: 'rosalind-discovers', text: 'Rosalind discovers the break-in' },
      ],
      correctOrder: ['rain-begins', 'rain-ends', 'percival-enters', 'window-broken', 'scarf-placed', 'rosalind-discovers'],
      hint: 'A dry scarf cannot have been outside while it was raining. A scarf on top of glass cannot have been placed before the glass fell.',
      explanation:
        'Rain fell 8:30–10:30. The scarf is dry, so it went down after 10:30. It lies on top of the shards, so the window broke before the scarf was placed. The window was broken from inside, and the only person to enter the Yard after the rain was Percival at 10:48—so his arrival precedes the break and the plant. Rosalind, at 11:40, comes last.',
    },
  ],

  hints: [
    'The Met log says the rain stopped at 10:30. Look at everything in the yard that is wet—and the one thing that isn\'t.',
    'Glass falls the way it is pushed. If the window was broken from inside, the thief had a key. Who holds keys to Studio 4—and to the lockers?',
    'Hold the gate footage against Percival\'s "midnight". Then break his claim about locker keys with his own register, and read what it unlocks about the insurance.',
  ],

  culpritId: 'c11-percival',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Why must the scarf have been placed after 10:30 PM?',
      options: [
        { id: 'a', text: 'Because the gate camera shows Ingrid arriving at 10:35' },
        { id: 'b', text: 'Because it was dry, lying on gravel that was still wet from rain that stopped at 10:30' },
        { id: 'c', text: 'Because Rosalind locked the studio at 10:30' },
        { id: 'd', text: 'Because silk scarves are only sold after dark' },
      ],
      correct: 'b',
      explanation: 'Rain fell until 10:30. Anything outside before then was soaked. The scarf was bone-dry on wet gravel, so it arrived after the rain ended.',
    },
    {
      id: 'q2',
      prompt: 'What shows the broken window was staged?',
      options: [
        { id: 'a', text: 'The shards lie outside; the window was broken from within the studio' },
        { id: 'b', text: 'The window was too small for a person' },
        { id: 'c', text: 'The scarf was knotted around the frame' },
        { id: 'd', text: 'Honoré\'s receipt mentions a window' },
      ],
      correct: 'a',
      explanation: 'Glass falls in the direction of the blow. Shards on the gravel and a clean sill inside mean the window was struck from inside by someone who had entered with a key.',
    },
    {
      id: 'q3',
      prompt: 'Who could open both Studio 4 and Ingrid\'s locker without force?',
      options: [
        { id: 'a', text: 'Caspian, who has foundry keys' },
        { id: 'b', text: 'Thea, who used to live with Rosalind' },
        { id: 'c', text: 'Percival, who holds a Studio 4 key and the locker master key' },
        { id: 'd', text: 'Honoré, who bought a key at auction' },
      ],
      correct: 'c',
      explanation: 'The key register, in Percival\'s own hand, lists him as the only person with both a Studio 4 key and the locker master key.',
    },
    {
      id: 'q4',
      prompt: 'Who lied about last night but is innocent of the theft?',
      options: [
        { id: 'a', text: 'Ingrid and Honoré' },
        { id: 'b', text: 'Caspian and Thea' },
        { id: 'c', text: 'Percival and Ingrid' },
        { id: 'd', text: 'Nobody; only the culprit lied' },
      ],
      correct: 'b',
      explanation: 'Caspian and Thea both claimed to be alone. Thea\'s texts show they were together in the foundry—embarrassing, and irrelevant to the gull.',
    },
  ],

  solution: [
    'The scarf was the whole case. Silk left on gravel during two hours of rain comes up sodden; this one was dry, so it was placed after 10:30 PM. It lay on top of the glass, so the window was already broken by then. Whoever planted it was in the Yard after the rain stopped—and the gate camera shows exactly one arrival in that window: Percival Dunmore\'s grey saloon at 10:48 PM.',
    'The window itself was theatre. The shards fell outward onto the gravel and the sill inside was clean, so it was struck from within the studio. The door was locked and unforced. The thief let himself in with a key, took The Gull, and broke the glass from the wrong side to make it look like a burglary.',
    'Only two people held Studio 4 keys: Rosalind and Percival. Only one person held the locker master key: Percival. Ingrid\'s locker was unforced and her scarf had been inside since Tuesday. The register that proves all this is in Percival\'s own handwriting, because Percival cannot help writing things down.',
    'The motive came out when his locker-key story collapsed: two weeks ago he raised The Gull\'s insured value from £18,000 to £95,000, and he had a draft email offering the "original study, no paperwork" to a private collector. Steal it, claim it, sell it—and let the rival with the famous scarf take the blame.',
    'Caspian and Thea both lied about being alone. They were together in the foundry shed, drinking bad tea, hiding from Rosalind\'s opinions. Honoré was forty minutes away at Dunmere, buying a landscape he will never hang. Ingrid told the truth throughout, which in Greywick is almost a confession in itself.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. Insurance. It\'s always insurance or love.', mood: 'neutral' },
    { speaker: 'quill', text: 'And glass, Rookie, is a poor liar. It falls where it is pushed. Would that people did the same.', mood: 'happy' },
    { speaker: 'nia', text: 'Percival\'s buyer email had the subject line DISCREET. In capitals. I\'ve pinned it above my desk.', mood: 'happy' },
    { speaker: 'lucien', text: 'I did say "convenient". You may quote me in the report. Spell my name with both hyphens.', mood: 'smug' },
    { speaker: 'hestia', text: 'Poor Ingrid, dear. I\'ll knit her something. Not a scarf—she\'s had quite enough of those.', mood: 'sad' },
    { speaker: 'otto', text: 'The apprentice and the ex get a lecture, not a charge. Lying for love is still lying. Hm. Nice scarf, Hestia.', mood: 'neutral' },
    { speaker: 'you', text: 'Filed.', mood: 'neutral' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'happy' },
  ],
};
