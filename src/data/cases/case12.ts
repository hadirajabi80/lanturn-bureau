import type { CaseFile } from '../types';

/**
 * CASE 12 — "The Harrow Point Lamp"  (hard)
 * A lighthouse goes dark, a ketch full of "priceless antiquities" grounds on the shoal,
 * and the apprentice keeper's bedtime story has the horn before the lamp.
 * The saboteur is Rhys; the paymaster is Cornelius; the cargo was never worth insuring.
 */
export const case12: CaseFile = {
  id: 'case-12',
  number: 12,
  title: 'The Harrow Point Lamp',
  difficulty: 'hard',
  tagline: 'The light went out. The paperwork lit up.',
  location: 'Harrow Point Lighthouse and Harrow Shoal, north of Greywick',
  time: '9:55 – 10:51 PM',
  crime:
    'The Harrow Point lamp was sabotaged; the ketch Mayflower ran onto Harrow Shoal in the dark and her cargo of insured "antiquities" was lost overboard.',
  palette: { from: '#0B1A2A', to: '#163B4E', glow: '#FFB347' },

  briefing: [
    'Harrow Point has had a light since 1853 and a logbook since 1854. Last night, at ten past ten, the light stopped and the logbook did not. Keeper Ailsa Craigmyle wrote the time in pencil, as she writes everything, and then watched a ketch called the Mayflower come round the headland under sail and run straight onto Harrow Shoal.',
    'Nobody drowned. The crew of three waded ashore. What went into the water, according to owner Cornelius Vane-Strutt of Vane-Strutt Exports, was "a collection of priceless antiquities bound for a private museum in Hollowmere", insured with Cadwallader & Pike for a sum that made Nia whistle through her teeth.',
    'The lamp\'s controller had blown a fuse. Fuses blow. But Quill went up the tower this morning and came down looking the way he does when a piece of evidence has started a conversation with him. Meanwhile the apprentice keeper, Rhys Pengelly, says he slept through the whole thing and seems very sure about the order in which he slept through it.',
    'The coastguard logged the foghorn at 22:26 and the mayday at 22:51. The fog arrived, by the keeper\'s pencil, at 22:25. The stars were out when the lamp died. Hold on to that; it matters more than it looks.',
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Lighthouse went dark. Boat hit the rocks. Cargo "lost". Nobody hurt, everybody insured. Hm.', mood: 'neutral' },
    { speaker: 'nia', text: 'Insured for ten times what a sane person would pay, by a man whose company name has a hyphen in it. I\'m not saying that\'s evidence. I\'m saying it\'s a pattern.', mood: 'smug' },
    { speaker: 'quill', text: 'The fuse, Rookie. I introduced myself to it this morning. It had been dead for some time before anyone asked it to die. Ponder that.', mood: 'thinking' },
    { speaker: 'hestia', text: 'Harrow Point\'s lamp has failed twice since 1911, dear. Both times are in the log. Keepers write everything down. Trust the pencil.', mood: 'happy' },
    { speaker: 'lucien', text: 'The apprentice slept through it, I\'m told. How restful. I\'d check what he fell asleep after. Sequence is everything, to those of us who have it.', mood: 'smug' },
    { speaker: 'otto', text: 'The paymaster won\'t be the one who climbed the stairs. Find the one who climbed. Then find who paid for the climb.', mood: 'neutral' },
    { speaker: 'you', text: 'Lamp, fog, horn, mayday. I\'ll start with the order.', mood: 'thinking' },
  ],

  scenes: [
    {
      id: 'lamp-room',
      name: 'The Lamp Room',
      description:
        'Brass, glass and a smell of hot dust. The great lens stands dark in daylight; below it, the controller cabinet hangs open where Quill left it, like a confession mid-sentence.',
      palette: ['#0F1C2A', '#2A4A5E', '#D4A857'],
      props: ['Lightbulb', 'Zap', 'Telescope', 'Compass', 'BookOpen'],
      hotspots: [
        {
          id: 'controller',
          x: 30,
          y: 58,
          label: 'Lamp controller cabinet',
          clueId: 'fuse',
        },
        {
          id: 'keepers-desk',
          x: 72,
          y: 62,
          label: 'Keeper\'s logbook',
          clueId: 'keepers-log',
        },
        {
          id: 'great-lens',
          x: 50,
          y: 26,
          label: 'The lens',
          flavor: 'Second-order Fresnel, 1853, polished every Sunday by Ailsa and never by Rhys. In daylight it holds a tiny upside-down Rookie.',
        },
        {
          id: 'spare-box',
          x: 14,
          y: 42,
          label: 'Spare fuse box',
          flavor: 'Six slots for fuses. Five fuses. The sixth slot has a clean rectangle in the dust where a good one sat until recently.',
        },
        {
          id: 'brass-telescope',
          x: 88,
          y: 40,
          label: 'Brass telescope',
          flavor: 'Trained on Harrow Shoal, where the Mayflower lies at a drunken angle. Through the eyepiece you can read her name. Someone painted it very recently.',
        },
      ],
    },
    {
      id: 'quarters',
      name: 'Keepers\' Quarters',
      description:
        'Two bunks, one tidy, one buried under chargers, cables and the glow of a phone that never quite goes to sleep.',
      palette: ['#15181F', '#2E3340', '#7C5CFF'],
      props: ['Bed', 'Smartphone', 'Wrench', 'Coffee', 'Mail'],
      hotspots: [
        {
          id: 'rhys-toolkit',
          x: 68,
          y: 64,
          label: 'Rhys\'s toolkit',
          clueId: 'rhys-kit',
        },
        {
          id: 'charger-nest',
          x: 80,
          y: 36,
          label: 'Nest of chargers',
          flavor: 'Four cables, two power banks, a smartwatch and a drone battery. The lighthouse has one socket. Rhys has colonised it.',
        },
        {
          id: 'ailsa-kettle',
          x: 20,
          y: 56,
          label: 'Ailsa\'s kettle',
          flavor: 'A cast-iron kettle older than the Bureau. A tin beside it labelled TEA and a smaller one labelled GIN, NOT FOR RHYS.',
        },
        {
          id: 'red-letters',
          x: 42,
          y: 30,
          label: 'Pile of post',
          flavor: 'Three envelopes with red edges addressed to R. Pengelly. FINAL REMINDER. FINAL FINAL REMINDER. One simply says NOW. Debt, not evidence—but motive has a postcode.',
        },
      ],
    },
    {
      id: 'shoal',
      name: 'The Jetty and Harrow Shoal',
      description:
        'A wooden jetty, a tide line of foam and, out on the rocks, a ketch leaning like a tired horse. Salvage crates have washed in with the morning tide.',
      palette: ['#0D1F2A', '#1F5A6A', '#A8C8D0'],
      props: ['Anchor', 'Ship', 'Waves', 'Package', 'Fish'],
      hotspots: [
        {
          id: 'supply-manifest',
          x: 18,
          y: 50,
          label: 'Supply boat manifest board',
          clueId: 'manifest',
        },
        {
          id: 'salvaged-crate',
          x: 62,
          y: 66,
          label: 'Washed-up cargo crate',
          clueId: 'cargo-appraisal',
        },
        {
          id: 'horseshoe',
          x: 10,
          y: 28,
          label: 'Horseshoe on the jetty post',
          flavor: 'Nailed points-up by Teddy "so the luck doesn\'t pour out". Beside it, a sprig of something. Teddy would like you to know it is not evidence, it is rosemary.',
        },
        {
          id: 'seal',
          x: 84,
          y: 80,
          label: 'Seal on the rocks',
          flavor: 'A grey seal watching the salvage with the expression of a landlord. It saw everything. It is not talking.',
        },
        {
          id: 'mayflower',
          x: 78,
          y: 34,
          label: 'The Mayflower',
          flavor: 'Hull sound, keel scraped, name freshly painted over something that used to begin with an S. Boats, like people, have previous names.',
        },
      ],
    },
    {
      id: 'coastguard',
      name: 'Coastguard Radio Room, Saltmarsh',
      description:
        'Marguerite Doyle\'s domain: three screens, one clock set to the second, and a printed log that nobody has ever caught in a mistake.',
      palette: ['#101820', '#1E3A4A', '#2EC4B6'],
      props: ['Radio', 'Headphones', 'Clock', 'Map', 'Siren'],
      hotspots: [
        {
          id: 'incident-log',
          x: 40,
          y: 56,
          label: 'Printed incident log',
          clueId: 'coastguard-log',
        },
        {
          id: 'fog-sensor',
          x: 72,
          y: 40,
          label: 'Fog sensor readout',
          flavor: 'Visibility at Harrow Point, last night: 9 miles at 22:20, 400 metres at 22:25. The sensor does not have opinions. It has thresholds.',
        },
        {
          id: 'wall-chart',
          x: 14,
          y: 38,
          label: 'Wall chart',
          flavor: 'Harrow Shoal is marked in red with a note in Marguerite\'s hand: "ONLY IDIOTS AND INSURANCE".',
        },
        {
          id: 'mug',
          x: 86,
          y: 76,
          label: 'Mug',
          flavor: '"WORLD\'S OKAYEST RADIO OPERATOR". A gift from Teddy. She drinks from it to spite him.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'keepers-log',
      name: 'Keeper\'s log',
      kind: 'document',
      icon: 'BookOpen',
      description: 'Ailsa\'s pencil: "22:10 lamp dark. Stars visible, sea calm. 22:25 fog bank from the NW. 22:26 horn (auto). 22:51 vessel on shoal, mayday heard."',
      detail:
        'The entries are in one hand, one pencil, in order. The lamp died a full sixteen minutes before the horn sounded, under a clear sky. Anyone who went to bed after the horn was awake when the lamp failed.',
    },
    {
      id: 'fuse',
      name: 'The pre-blown fuse',
      kind: 'forensic',
      icon: 'Zap',
      description: 'Quill: the fuse in the controller had already blown before it was installed—old oxidation on the break, fresh fingerprints on the cap. It was swapped in dead. The spare box is missing one good fuse.',
      detail:
        '"Well, hello, little fuse. You did not die in service; you were buried in uniform." A fuse that fails in use shows a bright, fresh fracture. This one was tarnished through—it had been broken for weeks and kept. Somebody pulled the working fuse, put in the corpse, and the lamp went out on cue.',
    },
    {
      id: 'rhys-kit',
      name: 'Rhys\'s toolkit',
      kind: 'physical',
      icon: 'Wrench',
      description: 'In Rhys\'s toolkit, under a multimeter: one good fuse, 32-amp ceramic, the exact rating of the lamp controller. The one missing from the spare box.',
      detail: 'Fresh from the box, a dust-free twin of the five still in the tray upstairs. An apprentice keeper carrying the lamp\'s only working spare in his personal kit, on the night the lamp failed.',
    },
    {
      id: 'manifest',
      name: 'Supply boat manifest',
      kind: 'document',
      icon: 'ClipboardList',
      description: 'The jetty board, Teddy\'s hand: "Dep. 21:55. Cargo off: paraffin, bread, 1x parcel for R.P. Lamp lit." He initials the lamp every trip.',
      detail: 'Teddy left fifteen minutes before the lamp went out and was well clear when the horn started. The parcel for R.P. was a drone battery. Rhys\'s hobbies arrive by boat.',
    },
    {
      id: 'coastguard-log',
      name: 'Coastguard incident log',
      kind: 'document',
      icon: 'Radio',
      description: 'Saltmarsh Coastguard: "22:26 Harrow Point horn active (auto trigger). 22:51 MAYDAY Mayflower, aground Harrow Shoal, 3 POB, no injuries. Skipper reports: no light."',
      detail: 'Twenty-five minutes between horn and mayday. The skipper\'s words, as Marguerite typed them: "the light simply wasn\'t there." Not dim. Not fogged. Gone.',
    },
    {
      id: 'horn-auto',
      name: 'Horn is automatic',
      kind: 'testimony',
      icon: 'Siren',
      description: 'Marguerite: the Harrow Point foghorn is tripped by a visibility sensor. Nobody switches it on. It started at 22:26 because fog arrived at 22:25.',
      detail: 'So the horn is a clock the fog winds. If someone says they went to bed after the horn, they went to bed after 22:26—sixteen minutes after the lamp died under clear stars.',
    },
    {
      id: 'bank-transfer',
      name: 'Bank transfer',
      kind: 'digital',
      icon: 'Banknote',
      description: 'Nia: £4,000 landed in Rhys Pengelly\'s account three days ago from "Harrowgate Holdings Ltd"—a shell whose only director is a company secretary for Vane-Strutt Exports.',
      detail:
        'Nia: "Two hops through a shell company is not laundering, it\'s a stroll. Harrowgate Holdings has one asset, one director and one outgoing payment, and that payment went to a lad with a drone battery and three red letters."',
    },
    {
      id: 'cargo-appraisal',
      name: 'Cargo appraisal',
      kind: 'forensic',
      icon: 'Package',
      description: 'The washed-up crate: six "Roman" oil lamps and a "Ming" bowl. Quill: resin casts and modern glaze, retail value under £400. Insured as a lot for £380,000.',
      detail:
        'Nia pulled the policy: forty-one items, declared "museum-grade antiquities", insured at ten times a generous valuation of the originals they imitate. Replicas lost at sea are worth whatever the paperwork says, right up until a crate floats back.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c12-ailsa',
        name: 'Ailsa Craigmyle',
        role: 'Lighthouse keeper',
        age: 57,
        tagline: 'Clear as gin. I wrote it down.',
        personality: 'Stoic, exact, unimpressed by weather or detectives.',
        quirk: 'Taps her pencil on the logbook when someone gets a time wrong.',
        voice: 'Spare northern cadence, times to the minute, no adjectives she can\'t prove.',
        avatar: {
          skin: '#E8C4A2', hair: 'short', hairColor: '#9A9A9A', eyes: 'narrow', brows: 'flat', mouth: 'neutral',
          accessory: 'cap', facial: 'none', outfit: '#1F3F5A', accent: '#A8C8D0',
        },
      },
      relation: 'Principal keeper at Harrow Point for nineteen years; logged the failure as it happened.',
      alibi: 'On the gallery outside the lamp room from 22:00, watching the sea.',
      greeting: 'Ten past ten. Stars out. Lamp dark. It\'s in the book. What else do you need?',
      statements: [
        {
          id: 's1',
          text: 'The lamp went dark at ten past ten. Sky clear as gin—I could see the Plough. Fog came rolling in from the north-west fifteen minutes later, and the horn went on its own a minute after that.',
        },
        {
          id: 's2',
          text: 'I was on the gallery the whole time, trying the manual override and swearing at it. Saw the ketch come round the head under sail and go straight for the shoal. Nothing I could do but watch and write.',
        },
        {
          id: 's3',
          text: 'Rhys? Good lad. Too fond of his phone. He asked me last week how the controller was fused. I thought he was taking an interest.',
        },
      ],
      accusedWrong:
        'Nineteen years I\'ve kept that light. You think I\'d put it out and then write down the time I did it? Go and read the book again. Slowly.',
    },
    {
      character: {
        id: 'c12-rhys',
        name: 'Rhys Pengelly',
        role: 'Apprentice keeper',
        age: 24,
        tagline: 'I was asleep. Honestly. Probably.',
        personality: 'Bright, restless, in debt to three different envelopes; thinks gadgets can fix anything, including himself.',
        quirk: 'Checks his phone every time a question gets hard.',
        voice: 'Quick, defensive, techie slang; over-explains; blames "old kit" for everything.',
        avatar: {
          skin: '#F1D2B6', hair: 'mohawk', hairColor: '#2B6F8A', eyes: 'wide', brows: 'raised', mouth: 'smirk',
          accessory: 'headset', facial: 'none', outfit: '#7C5CFF', accent: '#2EC4B6', age: 'young',
        },
      },
      relation: 'Apprentice keeper, six months in; on duty with Ailsa the night of the failure.',
      alibi: 'Went to bed after the supply boat left and after the horn started; slept through the lamp failure.',
      motive: 'Debts, and a four-thousand-pound deposit from a shell company.',
      greeting: 'Look, the kit up there is older than my gran. Fuses go. It\'s not, like, a conspiracy. Can I check my phone?',
      statements: [
        {
          id: 's1',
          text: 'I went to bed after Teddy\'s boat left and after the horn started. I was out cold when the lamp failed—Ailsa woke me banging on the controller.',
          contradictedBy: 'keepers-log',
          pressReply:
            'Ailsa must\'ve mixed up the times. Pencil, right? Easy to—okay, she doesn\'t mix up times. But I was definitely asleep at some point.',
          wrongPressReply: 'That\'s not about when I went to bed. I know when I went to bed. Roughly.',
        },
        {
          id: 's2',
          text: 'The fuse just blew. Old kit, salt air, forty years of damp. It was always going to go. I said so in my first week.',
          contradictedBy: 'fuse',
          pressReply:
            'So I keep spares, so what? Any decent apprentice keeps spares. Thirty-two amp, it\'s a common rating. You can\'t—it\'s not illegal to own a fuse.',
          wrongPressReply: 'A fuse is a fuse. It blew. End of story.',
          revealClueId: 'bank-transfer',
        },
        {
          id: 's3',
          text: 'Vane-Strutt? Don\'t know any Vane-Strutt. Sounds like a gin. Never met the man, never heard the name till the boat hit the rocks.',
          contradictedBy: 'bank-transfer',
          pressReply:
            '...Harrowgate Holdings. He said it was a consultancy fee. For "advice on coastal lighting". I thought nobody would get hurt. Nobody did get hurt! It was just a boat.',
          wrongPressReply: 'That doesn\'t prove I know him. I don\'t know loads of people.',
        },
      ],
      accusedWrong: 'Me? I\'m the apprentice! I don\'t even get a key to the gin tin!',
      accusedRight:
        'Four grand. That\'s what it took. He told me which night, told me the ketch would be "unlucky", told me the cargo was rubbish and nobody\'d lose a thing but an insurer. I swapped the fuse at ten past ten and watched the stars come out like nothing had happened. Then the fog came and the horn started and I thought—if I say I slept after the horn, I\'m clear. I didn\'t think about the pencil. Nobody thinks about the pencil.',
    },
    {
      character: {
        id: 'c12-teddy',
        name: 'Teddy Brannigan',
        role: 'Supply-boat skipper',
        age: 30,
        tagline: 'Never look back at a lighthouse. I looked.',
        personality: 'Cheeky, superstitious, fundamentally honest in the way of people who fear being cursed.',
        quirk: 'Touches the horseshoe on his cap before answering anything serious.',
        voice: 'Salty banter, sailor\'s rhythm, omens and old sayings; jokes until it matters.',
        avatar: {
          skin: '#C9956B', hair: 'wavy', hairColor: '#C0623A', eyes: 'round', brows: 'arched', mouth: 'grin',
          accessory: 'hat', facial: 'bigBeard', outfit: '#E0B04A', accent: '#1F5A6A',
        },
      },
      relation: 'Runs the weekly supply boat to Harrow Point; last to leave the jetty before the failure.',
      alibi: 'Cast off at 21:55 and was rounding the point when the horn started.',
      greeting: 'Skipper Brannigan. I\'ve been at sea twelve years and never once seen a light go out like that. Touch wood. Touch the horseshoe too, go on.',
      statements: [
        {
          id: 's1',
          text: 'Left at five to ten, lamp shining like a wedding. I always initial it—"lamp lit"—it\'s on the board. Horn started as I was rounding the point, so I knew the fog was coming before I saw it.',
        },
        {
          id: 's2',
          text: 'You never look back at a lighthouse. Bad luck. I looked. It was dark by then—black as a bag. I said a word my mother wouldn\'t like and kept going.',
        },
        {
          id: 's3',
          text: 'I brought the lad a parcel last night. Drone battery. Second one this month. Where an apprentice keeper gets money for drone batteries I couldn\'t tell you, but it isn\'t from keeping.',
        },
      ],
      accusedWrong:
        'I was a mile out when it went dark! You want to pin a lighthouse on a man in a boat? The seal\'s got a better alibi than you\'ve got a case.',
    },
    {
      character: {
        id: 'c12-cornelius',
        name: 'Cornelius Vane-Strutt',
        role: 'Cargo owner, Vane-Strutt Exports',
        age: 62,
        tagline: 'Priceless. Insured appropriately.',
        personality: 'Pompous, aggrieved, allergic to the word "replica".',
        quirk: 'Adjusts his cufflinks before every evasion.',
        voice: 'Orotund, lawyerly, long words used slightly wrong; refers to himself in the third person when cornered.',
        avatar: {
          skin: '#F2DCC4', hair: 'slick', hairColor: '#D0D0D0', eyes: 'sleepy', brows: 'thick', mouth: 'pout',
          accessory: 'tie', facial: 'mustache', outfit: '#2B1F3A', accent: '#D4A857', age: 'old',
        },
      },
      relation: 'Owner of the Mayflower\'s cargo and the policy that covered it.',
      alibi: 'At his club in Greywick all evening; never set foot on Harrow Point.',
      motive: 'A cargo of replicas insured for ten times its value, lost in circumstances nobody could blame on him.',
      greeting: 'Detective. Vane-Strutt Exports has suffered a catastrophic loss and I expect the Bureau to treat it with the gravity it—do sit down, you\'re looming.',
      statements: [
        {
          id: 's1',
          text: 'My cargo was priceless. Roman lamps, a Ming bowl, items of profound provenance. Insured appropriately—one does not under-insure antiquity.',
          contradictedBy: 'cargo-appraisal',
          pressReply:
            'Appraisals vary. One expert\'s "resin cast" is another\'s "faithful reproduction of significant cultural value". Vane-Strutt Exports relied upon its advisers in good faith.',
          wrongPressReply: 'I fail to see how that pertains to the valuation of my property.',
        },
        {
          id: 's2',
          text: 'I have never set foot on Harrow Point. I wouldn\'t know the apprentice from the keeper from the seal. My connection to that rock is a loss adjuster\'s telephone number.',
        },
        {
          id: 's3',
          text: 'The Mayflower was chartered through a broker. Her route, her timing, her skipper—all handled at arm\'s length. Vane-Strutt does not micro-manage boats.',
        },
      ],
      accusedWrong:
        'Preposterous. I was at my club with a brandy and a bishop. Vane-Strutt Exports is the victim here, and will be writing to your superior.',
    },
    {
      character: {
        id: 'c12-marguerite',
        name: 'Marguerite Doyle',
        role: 'Coastguard radio operator',
        age: 48,
        tagline: 'Twenty-two twenty-six. I don\'t round.',
        personality: 'Crisp, procedural, quietly funny; has heard every mayday and believes about half.',
        quirk: 'Says times as four digits and corrects anyone who says "about".',
        voice: 'Radio jargon, clipped, precise; dry asides delivered deadpan.',
        avatar: {
          skin: '#6B3F2A', hair: 'ponytail', hairColor: '#1B1B1B', eyes: 'sharp', brows: 'flat', mouth: 'neutral',
          accessory: 'headset', facial: 'none', outfit: '#2EC4B6', accent: '#FFB347',
        },
      },
      relation: 'Logged the horn and the mayday from Saltmarsh station; knows the Point\'s systems cold.',
      alibi: 'On shift at Saltmarsh Coastguard all night; every word logged.',
      greeting: 'Saltmarsh Coastguard. Twenty-two twenty-six, horn. Twenty-two fifty-one, mayday. Everything else is commentary. Go ahead.',
      statements: [
        {
          id: 's1',
          text: 'Horn active twenty-two twenty-six. Mayday twenty-two fifty-one, Mayflower, three persons on board, aground Harrow Shoal. Skipper\'s words: "the light simply wasn\'t there." I typed it as he said it.',
        },
        {
          id: 's2',
          text: 'The horn at Harrow Point is automatic. Visibility sensor trips it below five hundred metres. No human hand required—or possible. If the horn started, fog had arrived. Full stop.',
          revealOnRead: true,
          revealClueId: 'horn-auto',
        },
        {
          id: 's3',
          text: 'Off the record: nobody sails a ketch at Harrow Shoal at night unless they\'ve been told the shoal is where they\'re going. I\'ve typed up four groundings there. All insured. Say "about" to me and I\'ll end the interview.',
        },
      ],
      accusedWrong:
        'Negative. I was eleven miles away wearing a headset, and every word I said is on a server with a timestamp. Try again. Over.',
    },
  ],

  puzzles: [
    {
      type: 'order',
      id: 'harrow-night',
      title: 'The night at Harrow Point',
      prompt:
        'Put the five events in order, first to last. Use what you know: Teddy cast off at 21:55 with the lamp still lit; Ailsa logged the lamp dark at 22:10 under clear stars; the fog bank arrived fifteen minutes after the lamp failed; the horn is tripped automatically by the fog sensor and was logged at 22:26; the Mayflower\'s mayday came twenty-five minutes after the horn.',
      items: [
        { id: 'supply-leaves', text: 'The supply boat leaves the jetty, lamp still shining' },
        { id: 'lamp-fails', text: 'The lamp fails under a clear sky' },
        { id: 'fog-arrives', text: 'The fog bank rolls in from the north-west' },
        { id: 'horn-starts', text: 'The foghorn starts automatically' },
        { id: 'mayday', text: 'The Mayflower sends her mayday from the shoal' },
      ],
      correctOrder: ['supply-leaves', 'lamp-fails', 'fog-arrives', 'horn-starts', 'mayday'],
      hint: 'The horn cannot sound before the fog, and the fog came after the stars went out over a dead lamp.',
      explanation:
        'Teddy left at 21:55 with the light on. The lamp died at 22:10, stars visible. Fog arrived at 22:25 and tripped the horn at 22:26. The mayday followed at 22:51. Rhys claims he went to bed after the horn and slept through the failure—but the failure was sixteen minutes before the horn. He was awake, and he was in the tower.',
    },
  ],

  hints: [
    'Read the keeper\'s log and the coastguard log side by side. One of the suspects has the horn and the lamp in the wrong order.',
    'Quill says the fuse was dead before it was installed. Who has the lamp\'s missing good fuse in his kit—and why?',
    'Break Rhys\'s "old kit" story with the fuse; Nia will follow his money. Then hold the cargo appraisal against the man who insured replicas as antiquities.',
  ],

  culpritId: 'c12-rhys',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Why does Rhys\'s bedtime story fail?',
      options: [
        { id: 'a', text: 'Teddy saw him on the jetty at eleven' },
        { id: 'b', text: 'The lamp failed at 22:10, sixteen minutes before the horn at 22:26—so if he went to bed after the horn, he was awake when the lamp died' },
        { id: 'c', text: 'The quarters have no beds' },
        { id: 'd', text: 'Ailsa says he never sleeps' },
      ],
      correct: 'b',
      explanation: 'The horn is automatic and started with the fog at 22:26. The lamp died under clear stars at 22:10. Nobody who went to bed after the horn slept through the lamp.',
    },
    {
      id: 'q2',
      prompt: 'What shows the lamp failure was deliberate?',
      options: [
        { id: 'a', text: 'The fuse in the controller had blown long before it was installed—it was swapped in dead' },
        { id: 'b', text: 'The lens was dirty' },
        { id: 'c', text: 'The mayday mentioned sabotage' },
        { id: 'd', text: 'The lamp had never failed before' },
      ],
      correct: 'a',
      explanation: 'Quill found old oxidation on the break and fresh prints on the cap. Someone pulled the good fuse—now in Rhys\'s kit—and installed a corpse.',
    },
    {
      id: 'q3',
      prompt: 'Who paid Rhys?',
      options: [
        { id: 'a', text: 'Teddy Brannigan, through drone batteries' },
        { id: 'b', text: 'Ailsa Craigmyle, from the gin tin' },
        { id: 'c', text: 'Cornelius Vane-Strutt, through the shell company Harrowgate Holdings' },
        { id: 'd', text: 'The Mayflower\'s skipper' },
      ],
      correct: 'c',
      explanation: 'Nia traced £4,000 from Harrowgate Holdings, a shell whose sole director works for Vane-Strutt Exports, into Rhys\'s account three days before the grounding.',
    },
    {
      id: 'q4',
      prompt: 'What was the real purpose of the grounding?',
      options: [
        { id: 'a', text: 'To test the new foghorn' },
        { id: 'b', text: 'Insurance fraud: a cargo of replicas insured at ten times its value, "lost" at sea' },
        { id: 'c', text: 'To embarrass the coastguard' },
        { id: 'd', text: 'Smuggling gin to Harrow Point' },
      ],
      correct: 'b',
      explanation: 'The washed-up crate held resin lamps and a modern bowl, worth a few hundred pounds, insured as a lot for £380,000. Sunk in the dark, nobody would ever check.',
    },
  ],

  solution: [
    'The lie was a matter of sixteen minutes. Rhys Pengelly said he went to bed after the supply boat left and after the horn started, and slept through the lamp failing. But the horn at Harrow Point is automatic—fog trips it—and the fog arrived at 22:25. Ailsa\'s pencil has the lamp dark at 22:10 under clear stars. Anyone awake for the horn was awake for the lamp.',
    'The fuse told the rest. Quill found that the fuse in the controller had been blown for weeks before it was installed: oxidised fracture, fresh prints. Somebody removed the lamp\'s working fuse, dropped in a dead one, and the light went out at exactly the moment it was wanted. The missing good fuse was in Rhys\'s toolkit, under his multimeter.',
    'Why would an apprentice keeper put out his own light? Three red-edged envelopes on his bunk and a four-thousand-pound deposit from Harrowgate Holdings, a shell company with one director—who happens to be company secretary for Vane-Strutt Exports. Cornelius Vane-Strutt, who "never set foot on Harrow Point", paid for the stairs to be climbed.',
    'The cargo was the point. The Mayflower carried forty-one "museum-grade antiquities" insured for £380,000. The one crate that floated back held resin Roman lamps and a bowl with a modern glaze—a few hundred pounds of gift-shop. Lost in the dark on a shoal the coastguard calls "only idiots and insurance", nobody would have looked. The sea, inconveniently, returned a sample.',
    'Teddy left at 21:55 with the lamp lit and was a mile out when it died. Ailsa was on the gallery, writing it all down. Marguerite was eleven miles away with a headset and a server. Rhys swapped the fuse; Cornelius bought the darkness. The apprentice goes in the file as culprit, and the exporter goes to the fraud squad with Nia\'s diagram, which has arrows.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. Sixteen minutes. The lad built an alibi and forgot the horn had a clock.', mood: 'neutral' },
    { speaker: 'quill', text: 'A fuse buried in uniform, Rookie. I shall be dining out on that phrase for a month.', mood: 'happy' },
    { speaker: 'nia', text: 'Harrowgate Holdings has already filed for dissolution. Filed at 9 AM. Someone reads the Gazette very early.', mood: 'smug' },
    { speaker: 'lucien', text: 'Vane-Strutt will say he was defrauded by his own apprentice. He has a lawyer whose hyphen is longer than his.', mood: 'smug' },
    { speaker: 'hestia', text: 'The lamp\'s relit, dear. Ailsa wrote the time. Twenty-three hundred, in pencil, underlined twice.', mood: 'happy' },
    { speaker: 'otto', text: 'Send the fraud file to Cadwallader & Pike with my compliments. And tell the seal it\'s free to go.', mood: 'neutral' },
    { speaker: 'you', text: 'Trust the pencil.', mood: 'neutral' },
  ],
};
