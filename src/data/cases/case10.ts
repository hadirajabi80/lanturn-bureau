import type { CaseFile } from '../types';

/**
 * CASE 10 — "The Mirror Clock"  (medium)
 * A small Dutch-master sketch unscrewed from its frame at a Monday private reception.
 * Logic: the influencer's alibi selfie ("Café Nocturne, 3:40") shows, behind him, the gallery's
 * peacock corridor — and a clock seen in a mirror. Mirrored 3:40 is 8:20. EXIF says 20:21.
 * He left at 8:25 with a poster tube fatter than when he arrived.
 */
export const case10: CaseFile = {
  id: 'case-10',
  number: 10,
  title: 'The Mirror Clock',
  difficulty: 'medium',
  tagline: 'His alibi was a selfie. The selfie was looking back.',
  location: 'Halvorsen Gallery, Monday private reception',
  time: 'Sketch taken ~8:15 – 8:25 PM',
  crime: 'A small Dutch-master sketch was unscrewed from its frame during a private reception and carried out of the gallery.',
  palette: { from: '#1A1226', to: '#2F1F3F', glow: '#D4AF37' },

  briefing: [
    "The Halvorsen Gallery holds its private receptions on Monday evenings because, as Anouk Halvorsen explained to you without looking up from her vape, 'nobody with a life is free on a Monday, so we get the serious ones.' Tonight the serious ones included an insurer, an art influencer, a caterer with excellent cheekbones, and a sketch — a small Dutch-master study of a hand, ink on paper, 1640-ish, worth a modest house.",
    "At 8:40 the insurer, Ingeborg Lund, walked past the alcove and found the frame still on the wall and the sketch no longer in it. Four brass screws had been removed from the backing plate, cleanly, with something flat — a coin, by the look of the slots. The glass was intact. Nobody heard a thing, because a string quartet was murdering Vivaldi in the next room.",
    "The guest list puts twenty-two people in the building. Twenty-one of them were still there at 8:40. The one who was not is Simeon Brightwater, who follows art the way weather follows pressure, and who left at 8:25 'to catch a train'. Simeon has already posted his alibi: a selfie captioned 'Café Nocturne 3:40 — sketching ideas', meaning he was across town hours before any of this happened. It is a good selfie. He is very good at selfies.",
    "Otto looked at the post for four seconds and said: 'Hm. Look behind him.' You have the selfie, the guest list, and three people who were in the room all evening and noticed everything. Look behind him.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Hm. Gallery. Sketch unscrewed from its frame during a drinks party. One guest left early. He’s posted a photo that says he was somewhere else, hours earlier.', mood: 'neutral' },
    { speaker: 'nia', text: 'The post is public, the caption is confident, and the comments are forty people saying “iconic”. I have questions about the clock behind his head. I have questions about the clock behind his head, Rookie.', mood: 'thinking' },
    { speaker: 'quill', text: 'Four screws, slotted, removed with a coin — the slots are burred in the manner of a two-pence piece. Our thief came with pocket change and left with the seventeenth century.', mood: 'happy' },
    { speaker: 'lucien', text: 'An influencer. One takes forty photographs to prove one was somewhere and thereby proves it rather thoroughly. I’d call it poetic if I thought he read poetry.', mood: 'smug' },
    { speaker: 'hestia', text: 'The gallery’s restroom corridor was repapered in 1991, dear — peacocks, very striking. I remember the invoice. One remembers the odd invoice.', mood: 'neutral' },
    { speaker: 'otto', text: 'Four names. Look at the picture properly. Then look at it in a mirror.', mood: 'neutral' },
    { speaker: 'you', text: 'Starting with the wallpaper.', mood: 'thinking' },
  ],

  scenes: [
    {
      id: 'main-gallery',
      name: 'Main Gallery & Reception Desk',
      description: 'White walls, dim brass spots, a string quartet packing up in the corner and, in a velvet-lined alcove, an empty frame still hanging exactly where it should be.',
      palette: ['#1C1428', '#33233F', '#D4AF37'],
      props: ['Frame', 'Wine', 'Music', 'Lamp', 'Palette'],
      hotspots: [
        {
          id: 'alcove-frame',
          x: 30, y: 40,
          label: 'The empty frame',
          clueId: 'empty-frame',
        },
        {
          id: 'reception-desk',
          x: 75, y: 65,
          label: 'Reception desk guest book',
          clueId: 'guest-list',
        },
        {
          id: 'quartet',
          x: 88, y: 30,
          label: 'String quartet',
          flavor: 'Packing away with the haunted look of people who have played “Spring” six times for a room that did not once stop talking. The cellist has a thousand-yard stare.',
        },
        {
          id: 'bar',
          x: 52, y: 72,
          label: 'Bar',
          flavor: 'Prosecco, two kinds of water, and a hand-written sign reading “NO VAPING — Anouk, this means you.” Signed, Anouk.',
        },
        {
          id: 'canapes',
          x: 12, y: 75,
          label: 'Abandoned canapé tray',
          flavor: 'Fourteen tiny blinis arranged by Dante into a spiral. Three have been eaten from the centre outward, which Dante will describe to you as “a crime in itself”.',
        },
      ],
    },
    {
      id: 'peacock-corridor-scene',
      name: 'Restroom Corridor',
      description: 'A narrow passage papered floor to ceiling in 1991 peacocks, a gilt-framed mirror at the far end, and a brass wall clock ticking with municipal confidence.',
      palette: ['#0F2A2E', '#1F4F55', '#4FD1C5'],
      props: ['Feather', 'Clock', 'Sparkles', 'DoorClosed', 'Lightbulb'],
      hotspots: [
        {
          id: 'wallpaper-mirror',
          x: 50, y: 42,
          label: 'Peacock wallpaper, mirror and clock',
          clueId: 'peacock-corridor',
        },
        {
          id: 'restroom-door',
          x: 15, y: 60,
          label: 'Restroom door',
          flavor: 'Engaged. Has been engaged for some time. A voice inside says “one minute”. It has said this before.',
        },
        {
          id: 'fire-exit',
          x: 88, y: 55,
          label: 'Fire exit to the side street',
          flavor: 'Alarmed, says the sign. Not alarmed, says the little green light. The gallery and its sign have different opinions.',
        },
        {
          id: 'coat-hooks',
          x: 30, y: 25,
          label: 'Coat hooks',
          flavor: 'One umbrella, one scarf, and a lanyard reading “CONTENT CREATOR — PLEASE DO NOT FEED”. Someone has crossed out “FEED” and written “ENCOURAGE”.',
        },
      ],
    },
    {
      id: 'feed',
      name: "Simeon's Feed (Nia's Screen)",
      description: 'Nia’s monitor, three energy drinks deep. Simeon’s post glows in the centre, surrounded by tabs she has opened “for context” and one labelled DO NOT CLOSE.',
      palette: ['#101424', '#1E2742', '#7C5CFF'],
      props: ['Smartphone', 'Camera', 'Monitor', 'Heart', 'Coffee'],
      hotspots: [
        {
          id: 'selfie-zoom',
          x: 50, y: 45,
          label: 'Zoom: the clock behind Simeon',
          clueId: 'mirror-clock',
        },
        {
          id: 'cafe-tab',
          x: 80, y: 30,
          label: 'Tab: Café Nocturne opening hours',
          clueId: 'cafe-closed',
        },
        {
          id: 'comments',
          x: 22, y: 70,
          label: 'Post comments',
          flavor: '“iconic” ×14. “the LIGHT” ×6. “where is this??” ×1 — unanswered. Nia has liked that one from the Bureau account, which Otto has asked her not to do.',
        },
        {
          id: 'energy-drinks',
          x: 12, y: 30,
          label: 'Three empty cans',
          flavor: 'Stacked in a pyramid. Labelled, in marker: EXHIBIT A, EXHIBIT B, and REGRET.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'selfie',
      name: "Simeon's alibi selfie",
      kind: 'digital',
      initial: true,
      icon: 'Camera',
      description: 'Simeon’s public post: a close-up selfie, soft lighting, head tilted, caption “Café Nocturne 3:40 — sketching ideas ✨”. Behind his right shoulder, slightly out of focus: patterned wallpaper, a gilt mirror, and in the mirror a round clock.',
      detail: 'The caption claims a time (3:40) and a place (Café Nocturne) that would put him across town five hours before the theft. Everything in the background is the real evidence. Look behind him.',
    },
    {
      id: 'mirror-clock',
      name: 'The mirrored clock',
      kind: 'photo',
      icon: 'Clock',
      description: 'Zoomed in, the clock behind Simeon appears to read 3:40 — but it is not on the wall behind him. It is a reflection in the gilt mirror, so its face is flipped left-to-right. Un-mirror a clock face reading 3:40 and the real time is 8:20.',
      detail: 'A mirrored clock swaps left and right: the hour hand pointing just past “3” on the reflection is really pointing just before “9”, and the minute hand at “8” (40 minutes) is really at “4” (20 minutes). Read correctly: 8:20 PM — squarely in the theft window, not the afternoon.',
    },
    {
      id: 'peacock-corridor',
      name: 'Peacock corridor',
      kind: 'physical',
      icon: 'Feather',
      description: 'The gallery’s restroom corridor is papered in a distinctive 1991 peacock-feather print, with a gilt-framed mirror at the far end and a brass wall clock opposite it. Stand in the corridor facing the mirror and the clock appears over your shoulder — reversed.',
      detail: 'The wallpaper, the mirror and the reflected clock match Simeon’s “Café Nocturne” selfie exactly. The photograph was taken here, in the Halvorsen Gallery, a few steps from the alcove — not in any café.',
    },
    {
      id: 'cafe-closed',
      name: 'Café Nocturne opening hours',
      kind: 'digital',
      icon: 'Coffee',
      description: 'Nia pulls Café Nocturne’s own page: “Open Tuesday to Sunday, 8 AM – 11 PM. Closed Mondays. Yes, we know. We need a day off too.”',
      detail: 'Tonight is Monday. Café Nocturne was shut all day. Nobody sketched ideas there at 3:40, or at any other time.',
    },
    {
      id: 'guest-list',
      name: 'Reception guest book',
      kind: 'document',
      icon: 'BookOpen',
      description: 'The reception desk logs every arrival and departure. Simeon Brightwater: arrived 7:50 PM, departed 8:25 PM, reason given “to catch a train”. Everyone else present until the discovery at 8:40.',
      detail: 'Simeon was in the building from 7:50 to 8:25 — covering the whole theft window — and the only guest who left before the sketch was missed.',
    },
    {
      id: 'tube',
      name: 'The poster tube',
      kind: 'testimony',
      icon: 'Cylinder',
      description: 'Dante, who notices things, watched Simeon arrive with a slim cardboard poster tube under his arm and leave with the same tube — noticeably fatter, its cap no longer sitting flush.',
      detail: 'A small ink-on-paper sketch, loosely rolled, would thicken a poster tube by exactly that much. The sketch left the building inside it at 8:25.',
    },
    {
      id: 'exif',
      name: 'Photo metadata',
      kind: 'digital',
      icon: 'FileDigit',
      description: 'Nia extracts the original file from Simeon’s cloud backup: capture timestamp 20:21:07 tonight, location services on, coordinates within six metres of the Halvorsen Gallery.',
      detail: 'The camera agrees with the mirror. The “3:40 café” selfie was taken at 8:21 PM in the gallery’s restroom corridor, a few steps from the alcove.',
    },
    {
      id: 'empty-frame',
      name: 'The empty frame',
      kind: 'physical',
      icon: 'Frame',
      description: 'The frame still hangs in its alcove. Four slotted brass screws have been removed from the backing plate and left neatly on the ledge; the slots are burred as if turned by a coin. The glass is untouched; the sketch is gone.',
      detail: 'Quiet, quick, and tool-free — a two-minute job for someone with a two-pence piece and a reason to be standing in the alcove. The quartet covered the rest.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c10-anouk',
        name: 'Anouk Halvorsen',
        role: "Owner's daughter",
        age: 36,
        tagline: 'It’s a Monday. Of course something got stolen.',
        personality: 'Jaded, sharp, allergic to enthusiasm; loves the gallery and would rather die than say so.',
        quirk: 'Vapes directly under the NO VAPING sign she wrote.',
        voice: 'Bored drawl, short sentences, devastating asides; sighs audibly between thoughts.',
        avatar: {
          skin: '#F1D2B6', hair: 'pixie', hairColor: '#C8323C', eyes: 'sleepy', brows: 'flat', mouth: 'smirk',
          accessory: 'earring', facial: 'none', outfit: '#1A1A1A', accent: '#D4AF37', age: 'adult',
        },
      },
      relation: 'Hosted the reception; the sketch is her father’s.',
      alibi: 'At the bar all evening, visibly bored.',
      greeting: 'Detective. Hi. Dad’s going to kill me, so do take your time, I’m in no hurry to go home.',
      statements: [
        {
          id: 's1',
          text: 'I was at the bar. All evening. Bored. Everyone saw me being bored; it’s sort of my thing. I didn’t go near the alcove — I’ve seen the hand. It’s a hand.',
        },
        {
          id: 's2',
          text: 'Simeon took forty selfies. Forty. I counted because I had nothing else to do. The lighting by the alcove wasn’t “giving”, apparently, so he wandered off to find somewhere that was.',
        },
        {
          id: 's3',
          text: 'He left at twenty-five past. Said “train”. Nobody who comes to these things has a train. They have drivers, or they have me calling them a cab at midnight.',
        },
      ],
      accusedWrong: 'Sure. I stole my own father’s sketch at my own party, in front of twenty-one people, while standing at the bar. God, I wish I were that interesting.',
    },
    {
      character: {
        id: 'c10-simeon',
        name: 'Simeon Brightwater',
        role: 'Art influencer',
        age: 41,
        tagline: 'It’s not stealing. It’s content.',
        personality: 'Charming, hollow, relentlessly on-brand; has never once stopped performing.',
        quirk: 'Angles his face toward the nearest light source mid-sentence.',
        voice: 'Smooth, breathy, full of “honestly” and “energy” and “space”; speaks in captions.',
        avatar: {
          skin: '#E8B88A', hair: 'wavy', hairColor: '#6B4A2B', eyes: 'round', brows: 'arched', mouth: 'grin',
          accessory: 'scarf', facial: 'stubble', outfit: '#F3E9D2', accent: '#FF7AA2', age: 'adult',
        },
      },
      relation: 'Guest; left early “to catch a train”, carrying a poster tube.',
      alibi: 'Posted a selfie from Café Nocturne, captioned 3:40 — hours before the theft.',
      motive: 'A private collector in Saltmarsh has been “liking” his posts about the Halvorsen hand for a month.',
      greeting: 'Detective! Love the energy. Honestly, I’m devastated about the sketch — it had such a presence in that space. Can we do this somewhere with better light?',
      statements: [
        {
          id: 's1',
          text: 'I was at Café Nocturne at 3:40, sketching ideas. Posted the proof — honestly, the light in there is unreal. I only swung by the gallery later for a glass and a look.',
          contradictedBy: 'peacock-corridor',
          pressReply: 'Every café has wallpaper, Detective. Peacocks are very in. Honestly, you’re reading a lot into a background.',
          wrongPressReply: 'That’s… a vibe, but it isn’t about my afternoon. The post is right there. Timestamped. Well — captioned.',
          revealClueId: 'exif',
        },
        {
          id: 's2',
          text: 'I left at 8:25 for the 8:40 train with the same tube I came in with — posters. I’m doing a wall. It’s a whole aesthetic.',
          contradictedBy: 'tube',
          pressReply: 'Dante was flirting, not observing. Honestly, the man rearranges blinis into spirals; he sees shapes everywhere.',
          wrongPressReply: 'Posters, Detective. Rolled. In a tube. Tubes are for rolling things. That’s the whole energy of a tube.',
        },
        {
          id: 's3',
          text: 'I never touch art. I only photograph it. Touching is for collectors; I’m a conduit.',
        },
        {
          id: 's4',
          text: 'Café Nocturne does a wonderful Monday espresso, by the way. Little cardamom thing. You should go.',
          contradictedBy: 'cafe-closed',
          pressReply: '…Tuesday espresso. The Tuesday one. Honestly, the days blur when you live in the moment.',
          wrongPressReply: 'That isn’t about coffee. I was talking about coffee. Stay in the moment with me, Detective.',
        },
      ],
      accusedWrong: 'Honestly? Wild. I was across town at 3:40 — it’s posted, it’s public, forty people have said “iconic”. You can’t argue with forty people.',
      accusedRight: 'Fine. The light in that corridor was unreal and I thought — mirror, clock, nobody reads a clock backwards. Two-pence piece, four screws, Vivaldi doing the heavy lifting, and the hand rolled up in the tube by 8:23. There’s a man in Saltmarsh who’s been liking my posts for a month. Honestly, Detective, you should see the engagement on a stolen Dutch master. Not that you will now.',
    },
    {
      character: {
        id: 'c10-ingeborg',
        name: 'Ingeborg Lund',
        role: 'Fine-art insurer',
        age: 58,
        tagline: 'Insured value is not the same as value. Neither is yours.',
        personality: 'Stern, exact, impatient with everyone who is not a clause.',
        quirk: 'Writes figures in the air with one finger as she quotes them.',
        voice: 'Formal, Scandinavian-crisp, every sentence a sub-clause; never uses two words where one will frighten.',
        avatar: {
          skin: '#F6E3D1', hair: 'bun', hairColor: '#A8A8A8', eyes: 'sharp', brows: 'thick', mouth: 'neutral',
          accessory: 'glasses', facial: 'none', outfit: '#2E3A4F', accent: '#9FB4FF', age: 'adult',
        },
      },
      relation: 'Insures the Halvorsen collection; discovered the theft at 8:40.',
      alibi: 'Inspecting the collection room by room all evening, on the clock.',
      greeting: 'Detective. The schedule lists the sketch at four hundred and ten thousand. I will not be telling you how I feel about that; I will be telling you facts.',
      statements: [
        {
          id: 's1',
          text: 'The sketch is insured at four hundred and ten thousand. The frame is insured at ninety. The frame remains. I am, you will appreciate, less comforted by this than the policy suggests I should be.',
        },
        {
          id: 's2',
          text: 'The screws were removed with a coin — the slots are burred in the way only a coin burrs them. A professional brings a driver. This was someone who came for a drink and left with an idea.',
        },
        {
          id: 's3',
          text: 'I walked every room on a fixed circuit and reached the alcove at 8:40. The sketch was present on my previous pass at 8:10. The window is therefore thirty minutes, and I would prefer you not waste it.',
        },
      ],
      accusedWrong: 'I would be the first person suspected and the last person able to sell it, and I have assessed enough frauds to know that is a poor position. Redirect your enquiry. Promptly.',
    },
    {
      character: {
        id: 'c10-dante',
        name: 'Dante Ferreira',
        role: 'Caterer',
        age: 27,
        tagline: 'I notice everything. Especially you.',
        personality: 'Flirtatious, warm, startlingly observant; treats a tray of blinis as a composition.',
        quirk: 'Rearranges whatever is on the nearest surface into a neater pattern while talking.',
        voice: 'Easy, teasing, playful compliments that turn out to be precise observations.',
        avatar: {
          skin: '#B07A4F', hair: 'slick', hairColor: '#1B1B1B', eyes: 'sharp', brows: 'raised', mouth: 'smile',
          accessory: 'bowtie', facial: 'stubble', outfit: '#2B2B2B', accent: '#FFB347', age: 'adult',
        },
      },
      relation: 'Catered the reception; stationed by the door with the canapés.',
      alibi: 'Circulating with trays all evening; greeted and farewelled every guest.',
      greeting: 'Detective. You have the look of someone who skipped dinner. Blini? No? Then let me feed you facts instead; I have plenty.',
      statements: [
        {
          id: 's1',
          text: 'Mr. Brightwater came in at ten to eight with a thin poster tube under his arm — thin, like a baguette. He left at twenty-five past with the same tube and it was fat. Like a different baguette. The cap wasn’t sitting right. I notice caps.',
          revealOnRead: true,
          revealClueId: 'tube',
        },
        {
          id: 's2',
          text: 'He asked me where the restroom corridor was. Twice. The second time I pointed, and he said “the one with the peacocks?” — so he already knew. Men who ask for directions they know are usually looking for a mirror.',
        },
        {
          id: 's3',
          text: 'Nobody else left before the insurer found the frame. I stand by the door; I say goodbye to everyone. It is my favourite part. Nobody else got a goodbye tonight until nine.',
        },
      ],
      accusedWrong: 'Detective, I was holding a tray in each hand for three hours. If I had taken that sketch, where would I have put it? Among the blinis? They would have been ruined. I have standards.',
    },
  ],

  puzzles: [],

  hints: [
    'Simeon’s selfie is his alibi. Stop looking at his face and look at everything around it.',
    'That clock behind him is in a mirror. What time does a clock really read when its reflection shows 3:40? Then compare the wallpaper with the gallery’s restroom corridor.',
    'The selfie was taken in the gallery at 8:20. Press Simeon on the café with the peacock corridor, then on the tube with what Dante saw.',
  ],

  culpritId: 'c10-simeon',

  proveIt: [
    {
      id: 'q1',
      prompt: 'The clock in Simeon’s selfie reads 3:40 — but it is a reflection. What time does it really show?',
      options: [
        { id: 'a', text: '3:40' },
        { id: 'b', text: '9:20' },
        { id: 'c', text: '8:20' },
        { id: 'd', text: '4:20' },
      ],
      correct: 'c',
      explanation: 'A mirror flips a clock face left to right. The apparent 3:40 — hour hand just past 3, minute hand on 8 — becomes hour hand just before 9, minute hand on 4: 8:20. The EXIF data confirms 20:21.',
    },
    {
      id: 'q2',
      prompt: 'Which detail places the “Café Nocturne” selfie inside the Halvorsen Gallery?',
      options: [
        { id: 'a', text: 'The espresso cup on the table.' },
        { id: 'b', text: 'The peacock wallpaper and gilt mirror of the gallery’s restroom corridor.' },
        { id: 'c', text: 'Anouk’s reflection in the background.' },
        { id: 'd', text: 'The string quartet audible in the video.' },
      ],
      correct: 'b',
      explanation: 'The gallery’s restroom corridor was papered in a distinctive 1991 peacock print, with a gilt mirror facing a brass clock. The selfie’s background matches it exactly — and Dante saw Simeon ask for that corridor twice.',
    },
    {
      id: 'q3',
      prompt: 'How did the sketch leave the gallery?',
      options: [
        { id: 'a', text: 'Hidden under Dante’s canapé tray.' },
        { id: 'b', text: 'In Ingeborg’s insurance briefcase.' },
        { id: 'c', text: 'Rolled inside Simeon’s poster tube, which left fatter than it arrived.' },
        { id: 'd', text: 'Through the fire exit, by an accomplice.' },
      ],
      correct: 'c',
      explanation: 'Dante watched Simeon arrive with a thin poster tube and leave at 8:25 with the same tube visibly fatter, its cap not seated. A loosely rolled ink sketch would do exactly that — and Simeon was the only guest to leave before the theft was discovered.',
    },
  ],

  solution: [
    'Simeon Brightwater built his alibi out of the one thing he trusts: a photograph of himself. The caption says Café Nocturne, 3:40 — across town, five hours before the sketch was missed. But a selfie records everything behind the face as faithfully as the face, and behind Simeon is a wall of peacock-feather paper, a gilt mirror, and in that mirror a round clock.',
    'The clock is the giveaway, twice over. It is seen in a mirror, so its face is reversed; the apparent 3:40 is really 8:20. And the peacock paper, the gilt mirror and the clock opposite it are the Halvorsen Gallery’s own restroom corridor, hung in 1991 and unmistakable. Dante, who notices everything, remembers Simeon asking for that corridor twice — the second time by name. Nia’s pull of the original file settles it: captured at 20:21 tonight, GPS within six metres of the gallery. Café Nocturne, for good measure, is closed on Mondays.',
    'So Simeon was in the gallery from 7:50 to 8:25, as the guest book says, standing a few steps from the alcove at 8:21 while the quartet drowned out everything. Four slotted screws came out with a two-pence piece, as Ingeborg and Quill both read from the burred slots. Ingeborg’s circuit puts the sketch in its frame at 8:10 and gone by 8:40.',
    'It left the way it came in: Dante watched Simeon arrive with a slim poster tube and leave at 8:25 with the same tube fat and ill-capped, the only guest to go before the frame was found empty. Pressed, Simeon blamed the wallpaper, the caterer and the days of the week in turn, and finally admitted to a collector in Saltmarsh who had spent a month liking his posts about the hand.',
    'The sketch was recovered from the tube in Simeon’s flat, undamaged, between two posters of himself. Anouk has had the restroom clock moved so it can no longer be seen in the mirror, and has described this to her father as “security”. The quartet has declined to be rebooked.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. He photographed his own alibi falling apart and then shared it with forty people. Sometimes the job does itself, Rookie.', mood: 'neutral' },
    { speaker: 'nia', text: 'EXIF says 20:21, GPS says gallery, Café Nocturne says closed Mondays. That selfie had more metadata than he had plan.', mood: 'smug' },
    { speaker: 'quill', text: 'A clock in a mirror — “the time is out of joint”, as the Dane said, and so, it transpires, was the Dutchman. Four burred screws never looked so eloquent.', mood: 'happy' },
    { speaker: 'lucien', text: 'I read the clock backwards in the first four seconds, naturally. I then spent the next four hours being polite about it. You’re welcome.', mood: 'smug' },
    { speaker: 'hestia', text: 'The 1991 wallpaper invoice is in the gallery’s file, dear, if the court wants it. Eleven rolls. Peacock. I did say one remembers the odd invoice.', mood: 'happy' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'smug' },
    { speaker: 'otto', text: 'Good work. That’s the medium tier done. Hm. Don’t get comfortable; the next ones lie better.', mood: 'happy' },
  ],
};
