import type { CaseFile } from '../types';

/**
 * CASE 07 — "The Locked Greenhouse"  (medium)
 * The Ghost Orchid of Harrow is found replaced in a glasshouse that was armed and sealed all night.
 * Logic: the locked room is a red herring — the fake was already in the pot at 3:50 PM the day before.
 * Only Mireille had unsupervised access (2:30–3:00) AND a source for the lookalike (her own nursery line).
 */
export const case07: CaseFile = {
  id: 'case-07',
  number: 7,
  title: 'The Locked Greenhouse',
  difficulty: 'medium',
  tagline: 'The alarm never blinked. The orchid was already gone.',
  location: 'Thornfield Botanical Gardens, Glasshouse 3',
  time: 'Discovered 7:58 AM; swap 2:30 – 3:30 PM the previous day',
  crime: "The Gardens' prize specimen, the Ghost Orchid of Harrow, was replaced in its pot with a dyed commercial lookalike.",
  palette: { from: '#0E2A1F', to: '#1F4D3A', glow: '#E9F5D0' },

  briefing: [
    "Glasshouse 3 at Thornfield Botanical Gardens is locked at five, armed at five past, and opened at eight by a man who has done exactly that for thirty-one years. This morning Fenwick Abernathy opened it, walked to the centre bench, looked at the Ghost Orchid of Harrow — the only specimen in cultivation anywhere — and said a word in Latin that is not in the dictionary.",
    "The plant in the pot is white, spotted, and wrong. The spots are too even. The petals smell faintly of a florist's spray can. Dr. Tobias Hurst, the Gardens' authenticator, has already confirmed what Fenwick's stomach told him: that is not the Ghost. The alarm log shows the glasshouse armed at 5:02 PM with no events until Fenwick's key at 7:58. No broken glass. No forced vents. A locked room, sealed tight, and a plant that changed species inside it.",
    "Which is, of course, nonsense. Plants do not change species, and alarms do not lie, so one of your assumptions is wrong. The Gardens were open to the public until five. Yesterday afternoon Glasshouse 3 hosted a private viewing for a rival collector, a school group that got into the ferns, a visiting botanist on his way back from a conference, and a summer intern who was late and filmed everything.",
    "Otto wants to know where the Ghost went, how, and why four people are all pointing at the lock instead of each other. The lock, you suspect, is the one thing in this case that has done its job.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Hm. Orchid. Locked greenhouse, alarm set all night, plant swapped anyway. Everyone’s very impressed with the lock, Rookie. Don’t be.', mood: 'neutral' },
    { speaker: 'quill', text: 'A changeling in the flower bed! The petals have been dyed — poorly — and the root ball is fresh potting mix. “I know a bank where the wild thyme blows”… and this, my friends, is not it.', mood: 'happy' },
    { speaker: 'nia', text: 'Alarm log, visitor log and the gift-shop lost-property book are all on your desk. Yes, the Gardens keep a lost-property book. Yes, it’s mostly umbrellas.', mood: 'smug' },
    { speaker: 'hestia', text: 'The authenticator is a Dr. Tobias Hurst, dear. Tobias. Hm. A good name.', mood: 'thinking' },
    { speaker: 'hestia', text: '— More tea? The pot’s still warm. I’ve pulled the Gardens’ insurance file; it’s thicker than the Bible and about as cheerful.', mood: 'happy' },
    { speaker: 'lucien', text: 'Thornfield. Charming. I once told Abernathy his pruning was a crime; he has never forgiven me. Nor, apparently, has the hedge.', mood: 'smug' },
    { speaker: 'otto', text: 'Four suspects, one afternoon, one plant that isn’t what it says on the label. Go.', mood: 'neutral' },
    { speaker: 'you', text: 'Ignoring the lock. Starting with the pot.', mood: 'thinking' },
  ],

  scenes: [
    {
      id: 'glasshouse-3',
      name: 'Glasshouse 3',
      description: 'Warm, wet, green. Mist drifts from the ceiling pipes and settles on a centre bench where a white orchid sits in a terracotta pot, looking innocent.',
      palette: ['#0F2E22', '#1E5A42', '#E9F5D0'],
      props: ['Flower2', 'Leaf', 'Droplets', 'Thermometer', 'Sprout'],
      hotspots: [
        {
          id: 'orchid-pot',
          x: 50, y: 48,
          label: 'The orchid in the pot',
          clueId: 'fake-orchid',
        },
        {
          id: 'glasshouse-door',
          x: 10, y: 60,
          label: 'Glasshouse door & keypad',
          flavor: 'Intact lock, intact seals, intact smugness. The keypad has a sticker reading “IF IN DOUBT, DON’T.” Someone was not in doubt.',
        },
        {
          id: 'fern-bed',
          x: 78, y: 70,
          label: 'Trampled fern bed',
          flavor: 'Ferns flattened in the unmistakable pattern of eleven-year-olds. A single trainer print, a dropped glitter pen and the ghost of a packed lunch.',
        },
        {
          id: 'misting-pipe',
          x: 35, y: 18,
          label: 'Misting pipe',
          flavor: 'Hisses every ninety seconds. Perfect for orchids, ruinous for notebooks. Your page is already curling.',
        },
        {
          id: 'label-stake',
          x: 60, y: 62,
          label: 'Brass label stake',
          flavor: '“Dendrophylax harrowensis — The Ghost Orchid of Harrow. Please do not breathe on it.” Fenwick wrote that last part. He meant it.',
        },
      ],
    },
    {
      id: 'visitor-centre',
      name: 'Visitor Centre & Gift Shop',
      description: 'Postcards, seed packets, a till that plays birdsong, and a lost-property shelf of umbrellas standing like a small, damp forest.',
      palette: ['#223D2E', '#3F6B4F', '#F2E8C9'],
      props: ['Store', 'Ticket', 'Umbrella', 'ShoppingBag', 'BookOpen'],
      hotspots: [
        {
          id: 'visitor-book',
          x: 22, y: 40,
          label: 'Visitor sign-in book',
          clueId: 'visitor-log',
        },
        {
          id: 'lost-property',
          x: 72, y: 55,
          label: 'Lost-property shelf',
          clueId: 'gloves',
        },
        {
          id: 'till',
          x: 48, y: 70,
          label: 'Gift-shop till',
          flavor: 'Plays a robin every time it opens. The cashier has learned to flinch in advance. Yesterday’s takings: eleven postcards, one trowel, forty-six glitter pens.',
        },
        {
          id: 'seed-rack',
          x: 88, y: 25,
          label: 'Seed packet rack',
          flavor: '“Grow Your Own Ghost Orchid!” — a novelty packet containing, on inspection, radish seeds and optimism.',
        },
      ],
    },
    {
      id: 'potting-office',
      name: "Fenwick's Potting Office",
      description: 'Half shed, half shrine. Seed drawers, a radio tuned to the shipping forecast, and the alarm panel blinking green with the serenity of a thing that did nothing wrong.',
      palette: ['#1A2A1C', '#3A4F32', '#D8C7A0'],
      props: ['Shovel', 'Radio', 'ShieldAlert', 'Scroll', 'Lock'],
      hotspots: [
        {
          id: 'alarm-panel',
          x: 20, y: 35,
          label: 'Alarm panel',
          clueId: 'alarm-log',
        },
        {
          id: 'seed-drawers',
          x: 60, y: 60,
          label: 'Seed drawers',
          flavor: 'Two hundred tiny drawers labelled in Fenwick’s hand. One is labelled “DO NOT.” Another, “SERIOUSLY.” You leave both alone.',
        },
        {
          id: 'radio',
          x: 82, y: 30,
          label: 'Wireless radio',
          flavor: 'Shipping forecast on permanent loop. “Dogger, Fisher, German Bight: moderate, occasionally poor.” Fenwick’s mood, in meteorological form.',
        },
        {
          id: 'latin-primer',
          x: 42, y: 78,
          label: 'Battered Latin primer',
          flavor: 'Open at a page of insults. Fenwick has annotated several with “for Hurst”. One is annotated “for Delacroix-Hart” and underlined.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'alarm-log',
      name: 'Alarm system log',
      kind: 'digital',
      icon: 'ShieldAlert',
      description: "Glasshouse 3's alarm was armed at 5:02 PM by Fenwick's code and recorded no events — no door, no vent, no glass-break — until it was disarmed at 7:58 AM with the same code.",
      detail: 'The log is clean. Nobody entered Glasshouse 3 overnight. Whatever happened to the orchid happened before 5:02 PM, while the Gardens were open to the public.',
    },
    {
      id: 'fake-orchid',
      name: 'The orchid in the pot',
      kind: 'forensic',
      icon: 'Flower2',
      description: "Dr. Hurst's examination: the plant is not the Ghost Orchid of Harrow. It is a different species entirely, its petals dyed and spotted with an ivory floral spray, and it was repotted into this pot within the last day — the potting mix is still loose and fresh.",
      detail: "Hurst identified the species precisely: it is the commercial 'Harrow lookalike' hybrid — a mass-market cross bred and sold by exactly one grower, Saint-Clair Nurseries, Mireille Saint-Clair's own business. The spotting pattern matches the dye kit the nursery sells with it.",
    },
    {
      id: 'visitor-log',
      name: 'Visitor sign-in book',
      kind: 'document',
      icon: 'BookOpen',
      description: 'Yesterday afternoon in Glasshouse 3: Mireille Saint-Clair, private viewing, signed in 2:10 PM, out 3:30 PM. St. Jude’s Primary school group, 2:30–3:00. Jojo Mbeki signed in for a shift at 3:45 (shift started at 3:00). Dr. Hurst did not sign in at all yesterday.',
      detail: 'Mireille was inside Glasshouse 3 for eighty minutes, overlapping entirely with the school group’s half hour. Fenwick was with her — except when he was not.',
    },
    {
      id: 'jojo-video',
      name: "Jojo's 3:50 PM clip",
      kind: 'digital',
      icon: 'Video',
      description: 'A twelve-second vertical video posted at 3:52 PM yesterday: Jojo gives a breathless tour of Glasshouse 3 to “the Thornfield Gardens fam”. Behind her left shoulder, in focus, is the orchid — already showing the too-even spotting of the fake.',
      detail: 'The swap was complete by 3:50 PM. That is twenty minutes after Mireille signed out and more than an hour before the alarm was armed. The locked room is irrelevant.',
    },
    {
      id: 'nursery-catalogue',
      name: 'Saint-Clair Nurseries catalogue',
      kind: 'digital',
      icon: 'ScrollText',
      description: 'Nia pulls the online catalogue for Saint-Clair Nurseries. Page 14: “Harrow Lookalike — our bestselling hybrid. Bundle includes Ivory Ghost petal spray for that authentic spotted finish. Fool your friends!”',
      detail: 'The exact species in the pot, the exact spray on the petals, sold as a bundle by the suspect who swore she does not grow lookalikes.',
    },
    {
      id: 'gloves',
      name: "Mireille's gloves",
      kind: 'physical',
      icon: 'Hand',
      description: "A pair of cream kid-leather gloves, monogrammed M. S-C., handed in to lost property from Glasshouse 3 yesterday at closing. The fingertips are stained with fresh potting mix, and Quill finds a fine ivory residue on the palms.",
      detail: 'The residue matches the Ivory Ghost petal spray. Mireille did not merely admire the orchid — she repotted one with these hands and sprayed it.',
    },
    {
      id: 'hurst-ticket',
      name: "Hurst's conference ticket",
      kind: 'document',
      icon: 'Ticket',
      description: 'A delegate badge and train ticket: Dunmere Orchid Society Symposium, yesterday 9:00 AM – 6:00 PM, with Hurst as a listed speaker at 3:15 PM (“Dye Detection in Fraudulent Specimens”, which is almost funny).',
      detail: 'Hurst was forty miles away during the swap window and did not sign in at Thornfield at all yesterday.',
    },
    {
      id: 'fenwick-absence',
      name: "Fenwick's half hour",
      kind: 'testimony',
      icon: 'Clock',
      description: 'Fenwick admits he left Mireille alone in Glasshouse 3 for about half an hour — from roughly 2:30 to 3:00 — when the school group knocked over the fern bed and he went to shout at them.',
      detail: 'Half an hour, alone, with the orchid, a pot and a bag. Long enough to repot a plant if you have done it ten thousand times before.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c07-fenwick',
        name: 'Fenwick Abernathy',
        role: 'Head gardener',
        age: 63,
        tagline: 'Thirty-one years. One orchid. Zero patience.',
        personality: 'Gruff, devoted, grieving for a plant the way other men grieve for dogs.',
        quirk: 'Mutters Latin plant names under his breath when upset, like a rosary.',
        voice: 'Blunt, weathered, interrupts himself with Latin; calls everyone under forty “lad” or “lass” regardless.',
        avatar: {
          skin: '#E6B98F', hair: 'bald', hairColor: '#9A9A9A', eyes: 'narrow', brows: 'thick', mouth: 'frown',
          accessory: 'hat', facial: 'bigBeard', outfit: '#4F5B3A', accent: '#A4C27A', age: 'old',
        },
      },
      relation: 'Keeper of the Ghost Orchid; discovered the swap.',
      alibi: 'In Glasshouse 3 all afternoon with the private viewing, except for half an hour shouting at schoolchildren.',
      greeting: 'You’re the detective. Good. Find my orchid, lass, or find me a reason not to retire today.',
      statements: [
        {
          id: 's1',
          text: 'I locked that glasshouse at five and armed it at two minutes past, same as every night for thirty-one years. Nobody was in there overnight. Nobody.',
        },
        {
          id: 's2',
          text: 'Mireille Saint-Clair has wanted that orchid for twenty years. Offered money, offered swaps, offered to “house it properly”. Dendrophylax harrowensis does not want housing. It wants me.',
        },
        {
          id: 's3',
          text: 'I was with her the whole viewing. Well — except when those children from St. Jude’s went through the ferns like a herd of goats. I left her alone maybe half an hour while I sorted that out. Half an hour. God help me.',
          revealOnRead: true,
          revealClueId: 'fenwick-absence',
        },
        {
          id: 's4',
          text: 'Hurst wasn’t here yesterday. Off at some conference giving a talk about dyes, of all things. Man can spot a fake at forty paces and couldn’t grow a radish.',
        },
      ],
      accusedWrong: 'Me? Steal my own — lass, I have slept in that glasshouse during frost warnings. I’d sooner steal my own lungs. Go and talk to the woman in the gloves.',
    },
    {
      character: {
        id: 'c07-mireille',
        name: 'Mireille Saint-Clair',
        role: 'Rival collector & nursery owner',
        age: 45,
        tagline: 'One does not touch. One acquires.',
        personality: 'Elegant, competitive, allergic to the word “no”.',
        quirk: 'Smooths her sleeves at the wrist as though gloves were still there.',
        voice: 'Polished, faintly French, speaks in pronouncements; finds everything slightly beneath her.',
        avatar: {
          skin: '#D8A98B', hair: 'bob', hairColor: '#4A1F1A', eyes: 'sharp', brows: 'arched', mouth: 'smirk',
          accessory: 'pearls', facial: 'none', outfit: '#E9E4DA', accent: '#C9A0DC', age: 'adult',
        },
      },
      relation: 'Rival collector; had a private viewing of the orchid yesterday afternoon.',
      alibi: 'Admired the orchid from 2:10 to 3:30, then left; it was “perfectly itself” when she went.',
      motive: 'Has coveted the Ghost Orchid for twenty years and runs a nursery that would triple in reputation overnight.',
      greeting: 'Detective. You will forgive me if I do not sit; the chairs here are municipal.',
      statements: [
        {
          id: 's1',
          text: 'I admired it. I did not touch it. One does not touch a Dendrophylax of that age with one’s hands — it is simply not done.',
          contradictedBy: 'gloves',
          pressReply: 'Gloves get dirty in a garden, Detective. That is what gloves are for. One brushes a bench, one steadies oneself on a pot —',
          wrongPressReply: 'I fail to see what that has to do with my hands. Do try to be relevant.',
        },
        {
          id: 's2',
          text: 'I left at half past three and the orchid was perfectly itself. Luminous. If you had seen it you would understand why I have wanted it for twenty years.',
        },
        {
          id: 's3',
          text: 'I do not grow lookalikes. The very idea is vulgar — imitation is for people who cannot afford the original.',
          contradictedBy: 'fake-orchid',
          pressReply: 'A… commercial line. For amateurs. The nursery must pay for itself, Detective; one does not fund a collection on good taste alone. That hardly proves —',
          wrongPressReply: 'You are showing me paperwork. I am telling you about horticulture. These are different disciplines.',
          revealClueId: 'nursery-catalogue',
        },
      ],
      accusedWrong: 'Accuse me, then. I shall enjoy watching you explain to a magistrate how I walked through a locked, alarmed glasshouse in the night. Do take your time.',
      accusedRight: 'Twenty years I asked, Detective. Twenty years that man said no to the one person who could keep it alive after he is gone. So I brought a bag, a pot and one of my own poor hybrids, and when the children went through the ferns I had thirty minutes and ten thousand repottings behind me. The Ghost is in my east glasshouse under grow-lights, and it has never looked better. Tell Fenwick that. Tell him exactly that.',
    },
    {
      character: {
        id: 'c07-hurst',
        name: 'Dr. Tobias Hurst',
        role: 'Botanist & authenticator',
        age: 38,
        tagline: 'Technically, that is not an orchid problem. It is a people problem.',
        personality: 'Pedantic, honest, mildly allergic to the thing he loves.',
        quirk: 'Sneezes precisely once at the end of long sentences and apologises to the plant.',
        voice: 'Dry, exact, corrects terminology mid-sentence; hay-fever sniff between clauses.',
        avatar: {
          skin: '#F3D9C2', hair: 'short', hairColor: '#8B5E34', eyes: 'round', brows: 'worried', mouth: 'neutral',
          accessory: 'glasses', facial: 'none', outfit: '#6B7A8F', accent: '#2EC4B6', age: 'adult',
        },
      },
      relation: 'Confirmed the orchid is a fake; was away at a conference during the swap.',
      alibi: 'Speaking at the Dunmere Orchid Society Symposium all day yesterday.',
      greeting: 'Detective. Before you ask — yes, it is a fake, no, I did not need a microscope, and yes, I have a tissue. Hh— excuse me.',
      statements: [
        {
          id: 's1',
          text: 'It is not the Ghost. The petal structure is wrong, the spotting is pigment not pattern, and the root ball has been in that pot for hours, not decades. I would stake my doctorate on it. I have, in fact, just done so.',
        },
        {
          id: 's2',
          text: 'I was in Dunmere all day yesterday at the Orchid Society Symposium. I gave a paper at a quarter past three. On dye detection. The irony has not escaped me. Hh— sorry.',
          revealOnRead: true,
          revealClueId: 'hurst-ticket',
        },
        {
          id: 's3',
          text: 'The species in the pot is a known commercial hybrid. There is only one grower who breeds that cross at scale, and she was standing in this glasshouse yesterday wearing cream gloves. I note it; I do not accuse. Accusing is your department.',
        },
      ],
      accusedWrong: 'I was forty miles away reading a paper on exactly this kind of fraud to two hundred people who will confirm I was dreadful. Please redirect your deductions. Hh— apologies.',
    },
    {
      character: {
        id: 'c07-jojo',
        name: 'Jojo Mbeki',
        role: 'Summer intern',
        age: 19,
        tagline: 'Okay so this is the greenhouse, say hi to the greenhouse!',
        personality: 'Bubbly, loud, chronically late, films absolutely everything.',
        quirk: 'Holds her phone up at chest height even when not filming, like a tiny shield.',
        voice: 'Fast, upbeat, says “literally” and “okay so” constantly; narrates her own life.',
        avatar: {
          skin: '#5C3A28', hair: 'afro', hairColor: '#1B1B1B', eyes: 'wide', brows: 'raised', mouth: 'grin',
          accessory: 'cap', facial: 'none', outfit: '#F2B134', accent: '#FF7AA2', age: 'young',
        },
      },
      relation: 'Intern; arrived late for her shift and filmed the glasshouse at 3:50 PM.',
      alibi: 'Overslept, arrived 3:45, filmed a tour of Glasshouse 3 at 3:50.',
      greeting: 'Okay so I’m literally not allowed to film you, right? Right. Okay. Go. Not go-go. Just, like, go.',
      statements: [
        {
          id: 's1',
          text: 'Okay so I was late — like, late late, 3:45 — and I did a tour clip in Glasshouse 3 at 3:50 for the fam. It’s literally still up. The orchid’s in the back of the shot looking, honestly, kind of basic? I didn’t clock it at the time.',
          revealOnRead: true,
          revealClueId: 'jojo-video',
        },
        {
          id: 's2',
          text: 'If I’d touched that orchid Fenwick would literally bury me. In the fern bed. Face down. He’s said so. Twice.',
        },
        {
          id: 's3',
          text: 'The posh glove lady was already gone when I got in. Fenwick was still muttering about the school kids and the ferns — like, in Latin? I got some of that on video too, but I bleeped it.',
        },
      ],
      accusedWrong: 'Me?! I wasn’t even HERE until 3:45, and the orchid was already weird on my video at 3:50! That’s like five minutes! I can’t repot a plant in five minutes, I can’t repot a plant in five HOURS.',
    },
  ],

  puzzles: [],

  hints: [
    'Everyone is talking about the lock. The alarm log is clean, which means the swap did not happen overnight. When else was the glasshouse open?',
    'Look closely at Jojo’s 3:50 PM video and the visitor book. Who was alone with the orchid before 3:50 — and for how long?',
    'Hurst named the species in the pot. Who breeds that hybrid? Then check what was handed in to lost property, and press Mireille on whether she touched the plant.',
  ],

  culpritId: 'c07-mireille',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Why is the locked, alarmed glasshouse irrelevant to the theft?',
      options: [
        { id: 'a', text: 'Because Fenwick holds the only alarm code and could have faked the log.' },
        { id: 'b', text: 'Because the swap happened during open hours — the fake orchid is already visible in Jojo’s 3:50 PM video, over an hour before the alarm was armed.' },
        { id: 'c', text: 'Because the thief climbed in through the misting pipes.' },
        { id: 'd', text: 'Because orchids can be swapped remotely by changing the label.' },
      ],
      correct: 'b',
      explanation: 'The alarm log is clean because nobody broke in overnight. Jojo’s clip shows the dyed lookalike already in the pot at 3:50 PM, so the swap was done before closing, while the glasshouse was open to the viewing party and the school group.',
    },
    {
      id: 'q2',
      prompt: 'Where did the lookalike orchid come from?',
      options: [
        { id: 'a', text: 'The gift shop’s “Grow Your Own Ghost Orchid” seed packets.' },
        { id: 'b', text: 'Dr. Hurst’s conference display in Dunmere.' },
        { id: 'c', text: 'Saint-Clair Nurseries’ “Harrow Lookalike” hybrid — Mireille’s own commercial line, sold bundled with Ivory Ghost petal spray.' },
        { id: 'd', text: 'Fenwick’s seed drawers marked “DO NOT”.' },
      ],
      correct: 'c',
      explanation: 'Hurst identified the species as the commercial hybrid bred by exactly one grower: Saint-Clair Nurseries. Nia’s catalogue find shows the same hybrid sold with the same ivory spray found on the petals.',
    },
    {
      id: 'q3',
      prompt: 'What shows Mireille physically handled the pot, despite claiming she never touched the orchid?',
      options: [
        { id: 'a', text: 'Her signature in the visitor book.' },
        { id: 'b', text: 'Her monogrammed gloves in lost property, stained with fresh potting mix and Ivory Ghost spray residue.' },
        { id: 'c', text: 'Fenwick’s statement that she has wanted the orchid for twenty years.' },
        { id: 'd', text: 'Jojo’s video, in which Mireille can be seen leaving.' },
      ],
      correct: 'b',
      explanation: 'Mireille said she admired the orchid and did not touch it. Her gloves, left behind in Glasshouse 3, carry fresh potting mix on the fingertips and the ivory spray on the palms — she repotted the lookalike and dressed it with her own hands.',
    },
  ],

  solution: [
    'Everyone in this case wanted you to look at the lock. The alarm log is genuinely clean: Glasshouse 3 was armed at 5:02 PM and nothing moved until Fenwick’s key at 7:58 AM. That does not make the theft impossible — it makes it earlier. Jojo’s 3:50 PM tour video, posted before the Gardens even closed, shows the orchid already wearing the fake’s too-even spots. The swap was done in daylight, during opening hours.',
    'The visitor book narrows the afternoon. Mireille Saint-Clair had a private viewing from 2:10 to 3:30. A school group from St. Jude’s was in the glasshouse from 2:30 to 3:00, and Fenwick admits he left Mireille alone for that half hour while he dealt with the trampled ferns. Hurst was speaking at a symposium in Dunmere and never signed in. Jojo did not arrive until 3:45 — five minutes before her own video shows the fake in place.',
    'The plant itself names its grower. Hurst identified the species as the commercial “Harrow lookalike” hybrid, bred and sold at scale by only one nursery: Saint-Clair Nurseries. Confronted with that, Mireille conceded she sells “a commercial line, for amateurs”, and Nia’s catalogue find shows the hybrid bundled with the very Ivory Ghost petal spray found on the fake’s petals.',
    'Her hands finish it. The cream kid-leather gloves monogrammed M. S-C., handed in from Glasshouse 3 at closing, have fresh potting mix ground into the fingertips and the ivory spray residue on the palms. She did not admire the orchid from a polite distance; she lifted the Ghost out of its pot, dropped in a dyed hybrid from her own catalogue, and walked out at 3:30 with the real thing in her bag.',
    'The Ghost Orchid of Harrow was recovered from Mireille’s east glasshouse, flourishing, which Fenwick took as a personal insult. Hurst sneezed on it. Jojo got nine thousand views. Fenwick has installed a second lock, which will protect the orchid from absolutely nothing but makes him feel better.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. Locked room. Everyone stared at the door and nobody looked at the clock.', mood: 'neutral' },
    { speaker: 'quill', text: 'Potting mix and petal spray on kid leather — “out, damned spot!” The gloves confessed before she did.', mood: 'happy' },
    { speaker: 'nia', text: 'Her own catalogue, page fourteen. “Fool your friends.” She did not read the fine print, which is that I am not her friend.', mood: 'smug' },
    { speaker: 'lucien', text: 'Abernathy sent me a note. One word, Latin, unprintable. I shall have it framed.', mood: 'smug' },
    { speaker: 'hestia', text: 'Dr. Hurst wrote to thank the Bureau, dear. Lovely handwriting. I’ve filed it under H — the letter, I mean.', mood: 'neutral' },
    { speaker: 'otto', text: 'Hm.', mood: 'thinking' },
    { speaker: 'otto', text: 'Good work, Rookie. Wash your hands. There’s potting mix on the file.', mood: 'happy' },
  ],
};
