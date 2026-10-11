import type { CaseFile } from '../types';

/**
 * CASE 19 — "The Clockmaker's Paradox"
 * Extreme tier · The Cartographer arc, part four.
 * A councillor's hard drive vanishes from her study in a fifteen-minute window.
 * Every alibi in the house is a clock, and two of the clocks are lying.
 */
export const case19: CaseFile = {
  id: 'case-19',
  number: 19,
  title: "The Clockmaker's Paradox",
  difficulty: 'extreme',
  tagline: 'Every alibi in the house is a clock. Two of them are wrong.',
  location: "Councillor Vivienne Ashgrove's townhouse, Ember Court",
  time: 'Drive placed on the desk 21:00 (by phone); gone by 21:15',
  crime:
    "A hard drive holding Councillor Ashgrove's record of planning bribes was taken from her study desk between 21:00 and 21:15, while a horologist serviced the study's longcase clock and the household drank tea.",
  palette: { from: '#1C1A24', to: '#3A2E1C', glow: '#C9A227' },

  briefing: [
    "Councillor Vivienne Ashgrove chairs Greywick's planning committee and lives in a tall, well-regulated house on Ember Court, where the longcase clock in the study has been striking the hour since 1840. Last night it struck nine, and a hard drive vanished.",
    "The drive — Ashgrove says it holds “constituency correspondence”; the Cartographer's note, folded under the blotter, says otherwise — was placed on the study desk at 21:00 precisely. Ashgrove knows this because she checked her phone as she set it down before going upstairs to change. At 21:15 she returned; the desk was bare. The window was latched. The door had not been locked. The house had been full of people and every one of them has a clock to swear by.",
    "Elspeth Marr, horologist, had been in the study since 20:30 regulating the longcase, and says she took tea in the kitchen with the housekeeper, Mrs Wolska, until the study clock struck nine — then went back to her work and found the desk already empty. Julian Perrault, the aide, says he was on a video call with a colleague in New York at nine and has the recording to prove it. Rafe Ashgrove, the son, was shorting a cryptocurrency in his room and has timestamps. Lucien Delacroix-Hart, whom the Councillor had quietly hired to find out who was sending her maps, was throwing darts with Otto at The Hanged Man.",
    "Nia has a fact she insists is important: this is the one week of the year when the clocks have gone back in Greywick but not yet in New York, so New York is only four hours behind, not five. Quill has a fibre from the window latch — lilac merino, which he describes as “uncomfortably familiar”. And the note under the blotter, typed with a dropped lowercase e, says: “You'll see the clockmaker first. Good.” The Bureau decided to see the clockmaker first in the briefing room this morning. Nobody else was there.",
    "Otto has been quiet since reading that line. The study clock is still striking the hours, a quarter of an hour ahead of every other clock in the house. Someone set it that way and promised to set it back. Someone did not.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Councillor. Planning committee. A hard drive of “correspondence” gone from her desk in fifteen minutes. Nia.', mood: 'neutral' },
    { speaker: 'nia', text: 'Ashgrove placed it at 21:00 by her phone, back at 21:15, gone. Six people in or around the house. A horologist, an aide, a housekeeper, a son, a Councillor and — brace yourself — Lucien.', mood: 'smug' },
    { speaker: 'quill', text: 'Ashgrove hired him to find the Cartographer. He has, naturally, found nothing, beautifully.', mood: 'happy' },
    { speaker: 'otto', text: 'Lucien was with me. Darts. He cheats. We see the clockmaker first — she had the room. Then the aide. Then the rest. Agreed?', mood: 'thinking' },
    { speaker: 'nia', text: 'Agreed. One more thing, and write it down: clocks went back here on Sunday. New York does not go back until next week. So right now New York is FOUR hours behind, not five. This will matter. I can feel it mattering.', mood: 'happy' },
    { speaker: 'hestia', text: 'It always matters, dear. The week nobody knows what time it is.', mood: 'neutral' },
    { speaker: 'quill', text: 'And a fibre from the window latch, Rookie. Lilac merino. I have seen that shade before. I have seen it on this very table.', mood: 'thinking' },
    { speaker: 'hestia', text: 'Everyone has one of my scarves, Felix. That is rather the point of them.', mood: 'happy' },
    { speaker: 'otto', text: 'Hm. Clockmaker first. Go.', mood: 'neutral' },
  ],

  scenes: [
    {
      id: 'study',
      name: 'The Study',
      description:
        'Mahogany, green lamplight and the slow heartbeat of a longcase clock from 1840. The desk is bare where a hard drive sat; a folded note waits under the blotter.',
      palette: ['#1C1A24', '#2E2A20', '#C9A227'],
      props: ['Clock', 'Lamp', 'BookOpen', 'HardDrive', 'Armchair'],
      hotspots: [
        { id: 'longcase', x: 16, y: 40, label: 'The longcase clock', clueId: 'study-clock' },
        { id: 'blotter', x: 54, y: 62, label: 'Note under the blotter', clueId: 'typed-note' },
        { id: 'phone', x: 66, y: 56, label: "Ashgrove's phone on the desk", clueId: 'drive-timeline' },
        { id: 'latch', x: 86, y: 34, label: 'Window latch', clueId: 'wool-fibre' },
        { id: 'decanter', x: 36, y: 72, label: 'Decanter', flavor: 'Half full. The Councillor does not drink. The Councillor has guests who do.' },
      ],
    },
    {
      id: 'hall',
      name: 'The Hall and Kitchen',
      description:
        'A black-and-white tiled hall with a plain wall clock, a coat stand and a horologist’s toolbox open at the foot of the stairs; beyond, a warm kitchen smelling of tea and lemon.',
      palette: ['#201C18', '#3A3024', '#D4A857'],
      props: ['Wrench', 'Coffee', 'Clock', 'DoorOpen'],
      hotspots: [
        { id: 'toolbox-tray', x: 34, y: 66, label: 'Toolbox — service notebook', clueId: 'service-notes' },
        { id: 'toolbox-lid', x: 44, y: 58, label: 'Toolbox lid — newspaper clipping', clueId: 'workshop' },
        { id: 'hall-clock', x: 70, y: 28, label: 'Hall wall clock', flavor: 'Plain, electric, boring. It agrees with Nia’s phone to the second. The study clock does not agree with it.' },
        { id: 'teapot', x: 86, y: 70, label: 'Teapot on the kitchen table', flavor: 'Two cups, both drained. Mrs Wolska does not permit a third.' },
        { id: 'coats', x: 12, y: 44, label: 'Coat stand', flavor: 'A tweed coat, a parka, a cashmere number that could only be Lucien’s, left when he collected his retainer.' },
      ],
    },
    {
      id: 'anteroom',
      name: "Aide's Anteroom",
      description:
        'A narrow room off the hall with two desks: Julian’s, immaculate, laptop open on a paused video call; Rafe’s, a snowdrift of energy-drink cans around three monitors of red and green candles.',
      palette: ['#161A22', '#242C3A', '#7C5CFF'],
      props: ['Laptop', 'Monitor', 'Video', 'TrendingDown'],
      hotspots: [
        { id: 'laptop', x: 30, y: 50, label: "Julian's laptop — call recording", clueId: 'call-recording' },
        { id: 'monitors', x: 72, y: 44, label: "Rafe's trading monitors", flavor: 'A coin called LANTRN, down forty percent since nine. Rafe shorted it at 20:58. Rafe is insufferable about it.' },
        { id: 'cans', x: 80, y: 78, label: 'Energy drink cans', flavor: 'Eleven. Nia counted them with professional respect.' },
      ],
    },
  ],

  clues: [
    {
      id: 'dst-fact',
      name: "Nia's daylight-saving fact",
      kind: 'digital',
      icon: 'Globe',
      initial: true,
      description:
        'Greywick put its clocks back last Sunday. New York does not put its clocks back until next Sunday. For this one week, New York is FOUR hours behind Greywick, not the usual five.',
      detail: 'Anyone who says “five hours behind” this week is a week out of date — or counting on you to be.',
    },
    {
      id: 'drive-timeline',
      name: "Ashgrove's phone timeline",
      kind: 'digital',
      icon: 'Smartphone',
      initial: true,
      description:
        "The Councillor's phone: screen checked at 21:00:12 as she set the drive down and went upstairs; checked again at 21:15:40 when she came down and found the desk bare. The window is fifteen minutes wide.",
    },
    {
      id: 'study-clock',
      name: 'The study clock',
      kind: 'physical',
      icon: 'Clock',
      description:
        'The longcase clock in the study reads fifteen minutes AHEAD of the hall clock and of Nia’s phone. It is still running fast now. When it struck nine last night, the true time was 20:45.',
      detail: 'A clock that has just been “regulated” by a professional should not be a quarter of an hour wrong — unless the professional wanted it so.',
    },
    {
      id: 'service-notes',
      name: "Elspeth's service notebook",
      kind: 'document',
      icon: 'NotebookPen',
      description:
        "Elspeth Marr's notebook, last night's entry in pencil: “Ashgrove longcase. Regulated +15 for test. Return to true time before leaving.” The second instruction is not ticked.",
      detail: 'By her own hand, the clock was set fifteen minutes fast during the evening — so the “nine” that ended tea was 20:45.',
    },
    {
      id: 'tea',
      name: 'Tea in the kitchen',
      kind: 'testimony',
      icon: 'Coffee',
      description:
        'Mrs Wolska: Elspeth came to the kitchen for tea and stayed until they heard the study clock strike nine through the wall. Then Elspeth went straight back to the study, alone. Mrs Wolska stayed to wash up.',
      detail: 'Mrs Wolska trusts clocks. The clock she trusted was fifteen minutes fast.',
    },
    {
      id: 'call-recording',
      name: "Julian's call recording",
      kind: 'digital',
      icon: 'Video',
      description:
        "Julian's video call with Dana in New York, recorded in full. Over Dana's shoulder, a wall clock reads 4:00 PM throughout the first minutes. Julian says that means nine in Greywick.",
      detail: 'Four in New York plus five is nine. Four in New York plus four — this week — is eight.',
    },
    {
      id: 'theo',
      name: 'Theo',
      kind: 'testimony',
      icon: 'HeartHandshake',
      description:
        'Julian admits the call was at 20:00. At nine he was in the garden on the phone to his partner Theo, whom the Councillor does not know about and would not approve of. He lied to protect a relationship, not a theft.',
    },
    {
      id: 'workshop',
      name: 'The Marr workshop',
      kind: 'document',
      icon: 'Newspaper',
      description:
        'A Gazette clipping folded into the lid of Elspeth’s toolbox: “Planning committee approves demolition of Pike Lane workshops — Chair V. Ashgrove casts deciding vote.” Among the workshops listed: E. Marr, Horologist, est. 1988.',
      detail: 'The clipping is soft from handling. She has read it many times.',
    },
    {
      id: 'wool-fibre',
      name: 'Lilac wool fibre',
      kind: 'forensic',
      icon: 'Scissors',
      description:
        'A single fibre caught on the study window latch: lilac merino, hand-spun weight. Quill: “Not a carpet. Not a curtain. A garment. Knitted.” The window itself was latched from inside and was not the way out.',
      detail: 'Quill says he has seen the shade on three people at the Bureau. He did not say which three. He did not need to.',
    },
    {
      id: 'typed-note',
      name: "The Cartographer's note",
      kind: 'document',
      icon: 'ScrollText',
      description:
        'Under the blotter: a hand-drawn map of Ember Court, compass rose without a north point, and a typed line with the lowercase e sitting low — “You’ll see the clockmaker first. Good.”',
      detail: 'The plan to see the clockmaker first was made in the Bureau briefing room this morning, with the door shut. Present: Otto, Nia, Quill, Hestia. The note was under the blotter last night.',
    },
    {
      id: 'darts',
      name: "Lucien's darts night",
      kind: 'testimony',
      icon: 'Target',
      description:
        'Lucien was at The Hanged Man from 20:00 to 23:00 throwing darts against Chief Inspector Marsh, who confirms it with reluctance and the words “he cheats”. Forty witnesses and a scoreboard.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c19-ashgrove',
        name: 'Councillor Vivienne Ashgrove',
        role: 'Chair of the planning committee',
        age: 54,
        tagline: 'Progress has a price. I merely collect it.',
        personality: 'Polished, controlling, a politician who has never once said what she meant.',
        quirk: 'Aligns every object on a surface to a right angle while speaking.',
        voice: 'Measured, committee-smooth, speaks in resolutions.',
        avatar: { skin: '#F1D2B6', hair: 'bob', hairColor: '#8B1A1A', eyes: 'narrow', brows: 'arched', mouth: 'smirk', accessory: 'pearls', facial: 'none', outfit: '#2B1F2E', accent: '#C9A227' },
      },
      relation: 'Owner of the drive; victim of the theft and author of its contents.',
      alibi: 'Upstairs changing from 21:00 to 21:15.',
      greeting: 'Detective. I want the drive recovered and the newspapers kept well away. The contents are confidential constituency matters.',
      statements: [
        { id: 's1', text: 'Constituency correspondence. Letters about bins and bus stops. Nothing anyone would want.' },
        { id: 's2', text: 'I placed it on the desk at nine precisely — I checked my phone — and went up to change. At quarter past it was gone.' },
        { id: 's3', text: 'I hired Mr Delacroix-Hart because someone has been sending me maps. Childish things. He has been expensive and useless.' },
      ],
      accusedWrong: 'I stole my own drive from my own desk? Do try to keep up with your own case, Detective.',
    },
    {
      character: {
        id: 'c19-julian',
        name: 'Julian Perrault',
        role: 'Political aide',
        age: 29,
        tagline: 'I have the recording. QED.',
        personality: 'Bright, brittle, hiding a happiness he thinks will cost him his job.',
        quirk: 'Says “QED” after anything he believes is settled.',
        voice: 'Quick, articulate, over-prepared; collapses into honesty when caught.',
        avatar: { skin: '#C9956B', hair: 'short', hairColor: '#1B1B1B', eyes: 'round', brows: 'raised', mouth: 'smile', accessory: 'glasses', facial: 'none', outfit: '#1F3A5A', accent: '#7C5CFF', age: 'young' },
      },
      relation: "The Councillor's aide; worked from the anteroom all evening.",
      alibi: 'On a recorded video call with Dana in New York at nine o’clock.',
      motive: 'Has seen the drive’s contents; could be bribed or frightened by them.',
      greeting: 'Detective. I anticipated this and I have the recording ready. Nine o’clock, New York, QED.',
      statements: [
        {
          id: 's1',
          text: 'Nine o’clock I was on a call with Dana in New York. Her clock says four. New York is five hours behind. Four plus five is nine. QED.',
          contradictedBy: 'dst-fact',
          pressReply:
            '...Fine. Four hours this week, not five. It was eight. At nine I was in the garden on the phone to Theo. Theo is my partner. Vivienne doesn’t know about Theo, and she would not — please. Please keep Theo out of the file.',
          revealClueId: 'theo',
          wrongPressReply: 'The recording is timestamped by a wall clock. Clocks do not lie.',
        },
        { id: 's2', text: 'I have never opened the drive. I know what is on it the way one knows what is in a sewer: by the smell.' },
        { id: 's3', text: 'Mrs Marr is very good. The study clock has not been serviced since the Councillor’s mother died. It was running slow for years.' },
      ],
      accusedWrong: 'I — no. I lied about the hour, I admit it, but I was in the garden with my phone. Theo will confirm. Ask Theo. Quietly.',
    },
    {
      character: {
        id: 'c19-elspeth',
        name: 'Elspeth Marr',
        role: 'Horologist',
        age: 61,
        tagline: 'A clock is only as honest as the hand that sets it.',
        personality: 'Precise, patient, drily courteous; a craftswoman with a ruined workshop and perfect timing.',
        quirk: 'Listens to a room the way other people look at it — head tilted to the tick.',
        voice: 'Exact, unhurried, every sentence weighed like a pendulum bob.',
        avatar: { skin: '#F2DCC4', hair: 'pixie', hairColor: '#C8C8C8', eyes: 'sharp', brows: 'flat', mouth: 'neutral', accessory: 'monocle', facial: 'none', outfit: '#3A3024', accent: '#C9A227', age: 'old' },
      },
      relation: 'Servicing the study longcase clock, 20:30–21:30.',
      alibi: 'In the kitchen with Mrs Wolska until the study clock struck nine; then back at the clock, where the drive was already gone.',
      motive: 'The Councillor’s deciding planning vote demolished her workshop of thirty years.',
      greeting: 'Good afternoon. You will want to know about the clock. Everyone always wants to know about the clock.',
      statements: [
        {
          id: 's1',
          text: 'I was in the kitchen with Mrs Wolska until the clock struck nine. Then I went back to the study — where the drive had already gone.',
          contradictedBy: 'service-notes',
          pressReply: 'A test, nothing more. One advances a clock to hear the strike train under load. Every horologist does it.',
          wrongPressReply: 'That has no bearing on where I was when the clock struck.',
        },
        {
          id: 's2',
          text: 'I returned the clock to true time before leaving, as my notes say I should. I always do.',
          contradictedBy: 'study-clock',
          pressReply: '...',
          wrongPressReply: 'The clock keeps excellent time. I saw to it.',
        },
        {
          id: 's3',
          text: 'I bear the Councillor no grudge. She is a client. One does not grudge clients.',
          contradictedBy: 'workshop',
          pressReply: 'She voted my life into rubble. Thirty-one years on Pike Lane. One hand raised in a committee room, and the bulldozers came in a month. No, Detective. I bear her no grudge. I bear her an account.',
          wrongPressReply: 'A client is a client. I service their clocks. I do not service their consciences.',
        },
        {
          id: 's4',
          text: 'The window was latched when I came back in. I noticed because the draught had stopped.',
        },
      ],
      accusedWrong: 'You accuse a clockmaker of being in the wrong place at the right time? Check your sources, Detective. Check your clocks.',
      accusedRight:
        'Precisely so. I advanced the longcase fifteen minutes at twenty to nine, took tea, and let the strike train call me back at what the household believed was nine. It was a quarter to. I had the study to myself for forty-five minutes, including the fifteen that mattered. The drive went into my toolbox beneath the escapement tray; the tray is exactly its depth. I did not write the note telling me the Councillor would set it down at nine. I only trusted that whoever did knew her habits better than she knew her own clock.',
    },
    {
      character: {
        id: 'c19-agnieszka',
        name: 'Mrs. Agnieszka Wolska',
        role: 'Housekeeper',
        age: 58,
        tagline: 'Clocks do not need charging.',
        personality: 'Steady, loyal to the house rather than its owner, deeply suspicious of anything with a screen.',
        quirk: 'Checks the nearest clock before answering any question about time.',
        voice: 'Plain, firm, Polish cadence; short declaratives.',
        avatar: { skin: '#E8C4A2', hair: 'bun', hairColor: '#7A6A5A', eyes: 'sleepy', brows: 'flat', mouth: 'neutral', accessory: 'headscarf', facial: 'none', outfit: '#4A4A5A', accent: '#D4A857' },
      },
      relation: 'Housekeeper; took tea with Elspeth in the kitchen.',
      alibi: 'In the kitchen from 20:15 washing up and making tea; did not leave it until 21:30.',
      greeting: 'You are the detective. Sit. There is tea. There is always tea.',
      statements: [
        {
          id: 's1',
          text: 'Mrs Marr took tea with me until the study clock struck nine. We heard it through the wall. Then she went back to the clock, and I stayed to wash the cups.',
          revealClueId: 'tea',
          revealOnRead: true,
        },
        { id: 's2', text: 'I trust clocks, not phones. A phone tells you what somebody in America decided. A clock tells you what the house knows.' },
        { id: 's3', text: 'The boy was in his room shouting at numbers. Mr Perrault was in the garden, whispering. Everybody whispers in this house except the clock.' },
      ],
      accusedWrong: 'I was washing two cups. It does not take fifteen minutes, but I am thorough.',
    },
    {
      character: {
        id: 'c19-rafe',
        name: 'Rafe Ashgrove',
        role: "Councillor's son",
        age: 23,
        tagline: 'Timestamps, bro.',
        personality: 'Cocky, distracted, more interested in a chart than in his mother’s career.',
        quirk: 'Refreshes something on his phone every eleven seconds.',
        voice: 'Crypto slang, half-sentences, calls everyone bro including his mother.',
        avatar: { skin: '#F1D2B6', hair: 'mohawk', hairColor: '#8B1A1A', eyes: 'wide', brows: 'raised', mouth: 'grin', accessory: 'headphones', facial: 'stubble', outfit: '#1B1B1B', accent: '#7C5CFF', age: 'young' },
      },
      relation: 'Son; in his room off the anteroom all evening.',
      alibi: 'Shorting a coin called LANTRN from 20:58; every trade is timestamped on the exchange.',
      motive: 'Perpetually short of money. Perpetually.',
      greeting: 'Oh, hey. Detective. Cool. Can this be quick, I have a position open.',
      statements: [
        { id: 's1', text: 'I was shorting LANTRN from 20:58. Timestamps, bro. Exchange servers. Not even Mum can bribe those.' },
        { id: 's2', text: 'Mum’s drive? Nah. Whatever is on it, selling it would tank her, and she pays my rent. Bad trade.' },
        { id: 's3', text: 'The clock lady is kind of intense. She stood in the study like she was listening to it breathe.' },
      ],
      accusedWrong: 'Bro, I made four grand between nine and nine-fifteen. I was busy. Check the chain.',
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
      relation: 'Hired by the Councillor to find who was sending her maps.',
      alibi: 'Darts at The Hanged Man with Chief Inspector Marsh, 20:00–23:00.',
      motive: 'Professional vanity — he would dearly love to solve the Cartographer before the Bureau does.',
      greeting: 'Rookie. How refreshing to be interviewed by someone who has not yet solved it. I have, of course, but do carry on.',
      statements: [
        {
          id: 's1',
          text: 'I was at The Hanged Man throwing darts with your Chief Inspector from eight until eleven. She cheats. She stands a full foot over the oche and dares one to mention it.',
          revealClueId: 'darts',
          revealOnRead: true,
        },
        { id: 's2', text: 'The Councillor has received four maps. I advised her to burn them. She framed one. Politicians.' },
        { id: 's3', text: 'Your Cartographer is not a thief, Rookie. Your Cartographer is an editor. Note, by the way, that it is “whom the Councillor hired”, not “who”.' },
      ],
      accusedWrong: 'I was publicly losing at darts to a Chief Inspector. There are forty witnesses and a chalkboard. Do try to be less adorable.',
    },
  ],

  puzzles: [
    {
      type: 'code',
      id: 'time-zones',
      title: 'Time zones',
      prompt:
        "Nia's fact: Greywick put its clocks back last Sunday; New York does not do so until next Sunday. For this one week New York is **four** hours behind Greywick — not five.\n\nIn Julian's call recording, the wall clock behind Dana in New York reads **4:00 PM**.\n\nWhat time was it in Greywick during the call?",
      inputLabel: 'Greywick time',
      answers: ['8 pm', '8pm', '20:00', '2000', 'eight', '8:00 pm', '800pm', '8'],
      hint: 'Add the gap that applies this week, not the one Julian remembers.',
      explanation:
        'Four o’clock in New York plus a four-hour gap is eight o’clock in Greywick. Julian’s “nine o’clock” alibi was an hour early. He was on the call at 20:00; at 21:00 he was in the garden talking to Theo — innocent, and not where he said.',
    },
    {
      type: 'order',
      id: 'two-clocks',
      title: 'Two clocks',
      prompt:
        'The study clock and the hall clock disagree by fifteen minutes, and the whole house set its evening by the wrong one. Put the events in the order they truly happened.',
      items: [
        { id: 'arrive', text: 'Elspeth arrives to service the longcase clock (20:30)' },
        { id: 'set-fast', text: 'Elspeth sets the study clock fifteen minutes fast' },
        { id: 'strike', text: 'The study clock strikes “nine” (really 20:45); Elspeth returns to the study alone' },
        { id: 'place', text: 'Ashgrove places the drive on the desk (21:00 by her phone)' },
        { id: 'gone', text: 'Ashgrove returns; the drive is gone (21:15)' },
        { id: 'leave', text: 'Elspeth leaves, the clock still running fast (21:30)' },
      ],
      correctOrder: ['arrive', 'set-fast', 'strike', 'place', 'gone', 'leave'],
      hint: 'Convert the study clock’s “nine” to true time first. Then ask who was already in the study when the drive was set down.',
      explanation:
        'Elspeth arrived at 20:30 and advanced the clock by fifteen minutes. When it struck nine the true time was 20:45; tea ended and she returned to the study alone. Ashgrove set the drive down at 21:00 and found it gone at 21:15 — with Elspeth in the room throughout. Elspeth left at 21:30 and never set the clock back.',
    },
  ],

  hints: [
    'Two alibis in this house are measured by clocks that are wrong: a longcase in the study and a wall clock in New York. Check both against Nia’s phone.',
    'Elspeth’s own notebook says she advanced the clock by fifteen minutes. So when it struck nine and tea ended, what time was it really — and who went back to the study alone?',
    'Julian lied about the hour but has an innocent reason. Elspeth lied about the clock, the reset and the grudge. Press her notebook first, then the clock itself, then the clipping in her toolbox lid.',
  ],

  culpritId: 'c19-elspeth',

  proveIt: [
    {
      id: 'q1',
      prompt: 'What was the true time when the study clock struck nine and tea ended?',
      options: [
        { id: 'a', text: '21:00 — the clock was accurate' },
        { id: 'b', text: '20:45 — the clock had been set fifteen minutes fast' },
        { id: 'c', text: '21:15 — the clock was running slow' },
        { id: 'd', text: '20:00 — the clock struck the wrong hour entirely' },
      ],
      correct: 'b',
      explanation: 'Elspeth’s notebook records “+15 for test”, and the clock still runs a quarter of an hour ahead. Nine on that dial was 20:45 everywhere else.',
    },
    {
      id: 'q2',
      prompt: 'Why is Julian’s alibi wrong, and why is he nonetheless innocent?',
      options: [
        { id: 'a', text: 'The recording was edited; he stole the drive for Dana' },
        { id: 'b', text: 'New York was only four hours behind that week, so the call was at eight; at nine he was in the garden with Theo' },
        { id: 'c', text: 'He misread the New York clock as four when it read five; he was asleep at nine' },
        { id: 'd', text: 'Dana was actually in Greywick; they were together in the anteroom' },
      ],
      correct: 'b',
      explanation: 'Four in New York plus four hours is eight in Greywick. Julian lied about the hour to hide a relationship, not a theft — Mrs Wolska heard him whispering in the garden.',
    },
    {
      id: 'q3',
      prompt: 'Who was alone in the study from 20:45 until 21:30, covering the whole 21:00–21:15 window?',
      options: [
        { id: 'a', text: 'Julian Perrault' },
        { id: 'b', text: 'Mrs Wolska' },
        { id: 'c', text: 'Elspeth Marr' },
        { id: 'd', text: 'Rafe Ashgrove' },
      ],
      correct: 'c',
      explanation: 'Tea ended at a false nine — 20:45 — and Elspeth went straight back to the clock. She was the only person in the study when the drive was set down and when it vanished.',
    },
    {
      id: 'q4',
      prompt: 'What about the Cartographer’s note suggests they have been inside the Bureau?',
      options: [
        { id: 'a', text: 'It was typed on heavy cartridge paper' },
        { id: 'b', text: 'It anticipated the plan to see the clockmaker first — a plan made only in the Bureau briefing room' },
        { id: 'c', text: 'It was addressed to “Rookie” by name' },
        { id: 'd', text: 'It was delivered to Lantern Street by hand' },
      ],
      correct: 'b',
      explanation: '“You’ll see the clockmaker first. Good.” The order of interviews was decided this morning behind a shut door, with Otto, Nia, Quill and Hestia present and Lucien absent. The note was under the blotter last night.',
    },
  ],

  solution: [
    'The house ran on two clocks and both were wrong. The longcase in the study had been advanced fifteen minutes by the woman servicing it; a wall clock in New York was being read with last week’s arithmetic. Strip both errors out and the fifteen-minute window has exactly one person in it.',
    'Elspeth Marr arrived at 20:30 and, by her own pencilled notes, regulated the longcase “+15 for test”. She took tea with Mrs Wolska in the kitchen until the study clock struck nine through the wall. It was 20:45. Elspeth went back to the study alone and stayed there until 21:30, and in between — at a true 21:00 — Councillor Ashgrove set her hard drive on the desk, went upstairs, and came down at 21:15 to find it gone. The drive left the house in a toolbox tray exactly its depth. The clock is still fifteen minutes fast; the note that promised to return it to true time was never ticked.',
    'Julian Perrault’s alibi was a recording of a video call with a New York wall clock reading 4:00 PM. “Five hours behind — nine o’clock — QED.” But Greywick had put its clocks back the previous Sunday and New York had not, so for this one week the gap was four hours. The call was at 20:00. At 21:00 Julian was in the garden on the phone to Theo, his partner, whom the Councillor does not know about. He lied to protect a love affair, not a theft; Mrs Wolska heard him whispering.',
    'Everyone else is accounted for. Rafe’s short position is timestamped on an exchange server to the second. Mrs Wolska washed two cups and trusted the wrong clock. Lucien was losing at darts to the Chief Inspector in front of forty witnesses and a chalkboard. The Councillor herself was upstairs, and her “constituency correspondence” is a ledger of planning bribes that will reach the Gazette whether or not the drive is ever found.',
    'Elspeth’s motive was folded into the lid of her toolbox: a Gazette clipping of the planning committee’s vote to demolish the Pike Lane workshops, Ashgrove casting the deciding hand. E. Marr, Horologist, est. 1988, was on the list. She told the Bureau she bore the Councillor no grudge. She bore her an account, and she settled it with a pendulum.',
    'And once more the Cartographer stood behind the thief. A note under the blotter told Elspeth when the drive would be set down. A map of Ember Court was left with its compass rose missing north. A lilac merino fibre was caught on the window latch — a shade Quill has seen on three people at the Bureau. And the note said: “You’ll see the clockmaker first. Good.” That decision was made this morning, in the briefing room, with the door shut. Otto, Nia, Quill and Hestia were in that room. Lucien was not. The Cartographer is not sending maps to the Bureau from outside it.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. Clockmaker. Set the clock fast, let the house believe it, had the study to herself. Elegant. I hate elegant.', mood: 'neutral' },
    { speaker: 'nia', text: 'The aide has asked me four times to keep Theo out of the file. I have told him four times that love is not a crime and bad arithmetic is not either. He cried a bit.', mood: 'happy' },
    { speaker: 'quill', text: 'The fibre is lilac merino, hand-spun. The note was under the blotter last night. And last night, Chief Inspector, nobody outside this building knew we would see the clockmaker first.', mood: 'thinking' },
    { speaker: 'otto', text: 'I know what it means, Felix.', mood: 'angry' },
    { speaker: 'lucien', text: 'For the record, Rookie, I was never in your briefing room. Your Chief Inspector has never let me past the kettle. One almost admires the consistency.', mood: 'smug' },
    { speaker: 'you', text: 'Four people were in that room.', mood: 'neutral' },
    { speaker: 'hestia', text: 'Four, dear. Yes. Shall I file this one with the others? They are all together now. The whole arc of it.', mood: 'neutral' },
    { speaker: 'otto', text: 'Hm. Leave it on my desk tonight, Hestia. I want to read them in order.', mood: 'thinking' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'sad' },
  ],
};
