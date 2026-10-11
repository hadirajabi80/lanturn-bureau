import type { CaseFile } from '../types';

/**
 * CASE 09 — "Zugzwang"  (medium)
 * £2,400 prize fund lifted from the treasurer's locked drawer during Round 3 of a club tournament.
 * Logic: nobody left during their own game (arbiter), so only players whose games had ended were free.
 * Board 2 drew at 7:12; Board 1 ran to 7:38. Ferdinand claims to have analysed Board 1's "Sicilian" in the
 * analysis room — but the demo board mirrored Board 1's French Defence all evening. He was never in that room.
 * Design note: the design text made `club-accounts` both the contradiction for S3 and the reveal from S3
 * (circular); here it is revealed when S2 is broken by `beatrix-saw`, and S3 is contradicted by it.
 */
export const case09: CaseFile = {
  id: 'case-09',
  number: 9,
  title: 'Zugzwang',
  difficulty: 'medium',
  tagline: 'Every move he made was forced. Including the lie.',
  location: 'Greywick Chess Club, Crown Street',
  time: 'Round 3, 7:00 – 7:40 PM; theft discovered 7:35 PM',
  crime: "The £2,400 tournament prize fund was taken from the treasurer's locked drawer; the key was in the treasurer's coat on the corridor rack.",
  palette: { from: '#15181F', to: '#2B2F3A', glow: '#E8D5A3' },

  briefing: [
    "The Greywick Chess Club occupies two rooms above a shoe shop on Crown Street and treats both with a seriousness usually reserved for cathedrals. Round 3 of the Autumn Open began at seven o'clock sharp. At 7:35 the treasurer, Mr. Pilbeam, went to his office to fetch the prize envelopes for the evening's presentation and found the drawer unlocked, the envelopes gone, and £2,400 of the club's money in somebody else's pocket.",
    "The drawer was not forced. It was opened with its own key, which lives — because Mr. Pilbeam is a trusting man — in the inside pocket of his overcoat, which hangs on the rack in the corridor outside the hall. Anyone walking down that corridor between seven and half past could have borrowed it. The question is who was walking down the corridor.",
    "Here the club's one iron rule does your work for you: a player who leaves the hall during their own game forfeits. The arbiter confirms there were no forfeits tonight. Board 1 — former champion Nikolai Zhdanov against the prodigy Wendy Achterberg — ran until 7:38. Board 2 — club accountant Ferdinand Oyelowo-Marsh against librarian and blogger Beatrix Kowalczyk — ended in a draw by repetition at 7:12. Two people were pinned to their boards during the theft. Two were free.",
    "Both of the free ones say they went to the analysis room afterwards. Only one of them is describing a room they were actually in. Otto's note on the file reads, in full: 'Hm. Chess. Don't let them explain it to you.'",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Hm. Chess club. Prize money gone from a locked drawer, key in a coat in the corridor. Nobody left during their game — arbiter swears to it. So: who had finished?', mood: 'neutral' },
    { speaker: 'nia', text: 'Board 2 drew at 7:12. Board 1 went to 7:38. That’s your free window and your two free people. I’d call it a fork but I’ve been asked to stop.', mood: 'smug' },
    { speaker: 'lucien', text: 'Zugzwang: a position in which every available move makes things worse. Our thief is in one. He simply doesn’t know it yet. Do say the word properly, Rookie; it has a “ts”.', mood: 'smug' },
    { speaker: 'quill', text: 'The drawer bears no pry marks, no fresh scratches — it was opened as its maker intended. Alas, poor lock! It did its job and was betrayed by a coat.', mood: 'happy' },
    { speaker: 'hestia', text: 'The club’s accounts are filed with the council as a registered society, dear. I’ve asked Nia to peek. Societies are such honest things, until they aren’t.', mood: 'neutral' },
    { speaker: 'otto', text: 'Four players. Read the scoresheets. Read the wall. Don’t let anyone explain the French to you.', mood: 'neutral' },
    { speaker: 'you', text: 'Starting with the boards.', mood: 'thinking' },
  ],

  scenes: [
    {
      id: 'tournament-hall',
      name: 'Tournament Hall',
      description: 'Four long tables, forty clocks, and a silence so complete you can hear the central heating think. A poster on the wall announces the Opening of the Month.',
      palette: ['#16191F', '#2C3140', '#E8D5A3'],
      props: ['Crown', 'Timer', 'Trophy', 'Table', 'Lightbulb'],
      hotspots: [
        {
          id: 'scoresheet-tray',
          x: 30, y: 60,
          label: 'Signed scoresheets tray',
          clueId: 'scoresheets',
        },
        {
          id: 'poster',
          x: 78, y: 28,
          label: 'Opening of the Month poster',
          clueId: 'opening-poster',
        },
        {
          id: 'arbiter-table',
          x: 55, y: 42,
          label: "Arbiter's table",
          clueId: 'arbiter-log',
        },
        {
          id: 'board-one',
          x: 12, y: 40,
          label: 'Board 1 (final position)',
          flavor: 'Black has mated White on the back rank. Nikolai’s king lies on its side, which is traditional; Nikolai’s pencil lies snapped in two, which is not.',
        },
        {
          id: 'tea-urn',
          x: 88, y: 72,
          label: 'Tea urn',
          flavor: 'Sign: “SILENCE. Including the urn.” The urn, defiant, gurgles. Several members glare at it.',
        },
      ],
    },
    {
      id: 'analysis-room',
      name: 'Analysis Room',
      description: 'A small side room with a wall-mounted demonstration board, three battered chairs and a whiteboard covered in arrows that look like a weather map.',
      palette: ['#1B1E26', '#343A48', '#C9B27C'],
      props: ['Grid3x3', 'Presentation', 'Armchair', 'BookOpen', 'PenTool'],
      hotspots: [
        {
          id: 'demo-board-hs',
          x: 50, y: 35,
          label: 'Demonstration board',
          clueId: 'demo-board',
        },
        {
          id: 'whiteboard',
          x: 15, y: 45,
          label: 'Whiteboard',
          flavor: 'Beatrix’s handwriting: “Draw by repetition — three times is a pattern, four is a personality.” Below it, a sad doodle of a bishop.',
        },
        {
          id: 'chairs',
          x: 75, y: 70,
          label: 'Three chairs',
          flavor: 'Two are warm. One has a cardigan on it. Beatrix’s. Only one chair has been sat in recently with any conviction.',
        },
        {
          id: 'library-shelf',
          x: 88, y: 30,
          label: 'Opening manuals',
          flavor: '“The Complete French Defence”, well-thumbed. “The Sicilian: A Guide for the Brave”, pristine. Nobody at this club is brave.',
        },
      ],
    },
    {
      id: 'corridor-office',
      name: "Corridor & Treasurer's Office",
      description: 'A narrow corridor hung with coats on brass hooks leads to a cupboard-sized office: a desk, a drawer, a framed photograph of a man shaking hands with a different man.',
      palette: ['#12141A', '#262A35', '#D9C48F'],
      props: ['Shirt', 'Key', 'Wallet', 'Frame', 'Lock'],
      hotspots: [
        {
          id: 'coat-rack-hs',
          x: 22, y: 45,
          label: "Treasurer's overcoat on the rack",
          clueId: 'coat-rack',
        },
        {
          id: 'drawer-hs',
          x: 70, y: 60,
          label: "Treasurer's desk drawer",
          clueId: 'drawer',
        },
        {
          id: 'fire-door',
          x: 8, y: 75,
          label: 'Fire door to the stairwell',
          flavor: '“SMOKERS: THIS DOOR, NOT THE WINDOW. — Management.” A single, very old cigarette end on the step outside. It predates the sign.',
        },
        {
          id: 'photo',
          x: 85, y: 30,
          label: 'Framed photograph',
          flavor: 'Mr. Pilbeam shaking hands with a grandmaster, 1987. Both look surprised. Neither has been that happy since.',
        },
        {
          id: 'accounts-cabinet',
          x: 55, y: 80,
          label: 'Filing cabinet',
          flavor: 'Locked. Label: “ACCOUNTS — F. O-M. ONLY.” A second label, smaller, in Pilbeam’s hand: “Please?”',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'scoresheets',
      name: 'Signed scoresheets',
      kind: 'document',
      icon: 'FileText',
      description: 'Board 1: Zhdanov v Achterberg, 1.e4 e6 2.d4 d5 3.Nc3 Bb4… 0–1, both signed at 19:38. Board 2: Oyelowo-Marsh v Kowalczyk, draw by threefold repetition, both signed at 19:12.',
      detail: 'Board 1 ran until 7:38, so Nikolai and Wendy were at their board throughout the theft. Board 2 was over by 7:12 — Ferdinand and Beatrix were free for the entire window. Note Board 1’s moves: 1.e4 e6 is the French Defence.',
    },
    {
      id: 'opening-poster',
      name: 'Opening of the Month poster',
      kind: 'document',
      icon: 'Crown',
      description: '“OPENING OF THE MONTH — THE FRENCH DEFENCE: 1.e4 e6. Solid, stubborn, slightly smug.” A footnote for beginners: “Not to be confused with the Sicilian, 1.e4 c5, which is sharp, chaotic and for people who enjoy suffering.”',
      detail: 'Even a non-player can read Board 1’s scoresheet now: 1.e4 e6 is the French. 1.e4 c5 would be the Sicilian. They are different from the second move on and look nothing alike on a board.',
    },
    {
      id: 'arbiter-log',
      name: "Arbiter's round log",
      kind: 'document',
      icon: 'ClipboardList',
      description: 'The arbiter’s log for Round 3: no forfeits, no incidents, no player left the hall during their own game. “Players whose games have finished may leave the hall quietly.”',
      detail: 'A player who leaves the hall mid-game forfeits automatically. With no forfeits, only players whose games had ended could have been in the corridor: those from Board 2, after 7:12.',
    },
    {
      id: 'demo-board',
      name: 'Demonstration board',
      kind: 'physical',
      icon: 'Grid3x3',
      description: 'The wall-mounted demonstration board in the analysis room is wired to mirror Board 1 live, move by move, for spectators. It still shows the final position of Zhdanov v Achterberg — a French Defence, from 1.e4 e6 onward, all evening.',
      detail: 'Anyone who sat in the analysis room after 7:12 and looked at the wall would have watched Board 1’s French Defence unfold. Nobody who was actually in that room could describe it as a Sicilian.',
    },
    {
      id: 'drawer',
      name: "Treasurer's drawer",
      kind: 'physical',
      icon: 'Lock',
      description: 'The desk drawer was opened with its own key — no pry marks, no scratches, the lock mechanism clean. Quill is almost disappointed.',
      detail: 'The thief did not break in. The thief knew exactly where the key lived and had time to fetch it, use it and put it back.',
    },
    {
      id: 'coat-rack',
      name: "Treasurer's overcoat",
      kind: 'physical',
      icon: 'Shirt',
      description: 'Mr. Pilbeam’s overcoat hangs on the corridor rack outside the hall. The drawer key is in its inside pocket, where — as every long-standing club member knows — it has lived for twenty years.',
      detail: 'The corridor is reached from the hall and from the analysis room. Anyone free during Round 3 could reach the coat unseen; the hall doors are closed for silence.',
    },
    {
      id: 'beatrix-saw',
      name: "Beatrix's recollection",
      kind: 'testimony',
      icon: 'Eye',
      description: 'Beatrix went straight to the analysis room after the draw. Ferdinand did not follow her in: at the door he said “I’ll just have a smoke” and went down the corridor. She found that strange, because in eleven years Ferdinand has never smoked.',
      detail: 'Ferdinand was never in the analysis room. He was in the corridor — where the coat was — within a minute of signing the scoresheet at 7:12.',
    },
    {
      id: 'club-accounts',
      name: 'Club accounts',
      kind: 'digital',
      icon: 'Calculator',
      description: 'Nia pulls the society’s bank statements from the registered-society filing. The club’s account was £2,400 short before tonight — a series of “sundry” withdrawals over eight months, all authorised by the club accountant. The annual audit is next week.',
      detail: 'The missing prize fund is exactly the size of the hole. Replace the embezzled money with the prize envelopes and the audit balances — and someone else gets blamed for a theft.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c09-nikolai',
        name: 'Nikolai Zhdanov',
        role: 'Former club champion',
        age: 67,
        tagline: 'I lost to a child. Ask me something else.',
        personality: 'Grumpy, proud, secretly delighted by talent he will never admit to admiring.',
        quirk: 'Resets imaginary pieces on the table while he talks.',
        voice: 'Gruff, heavy consonants, short declaratives; everything is “a disgrace” or “acceptable”.',
        avatar: {
          skin: '#EAC3A3', hair: 'short', hairColor: '#D0D0D0', eyes: 'narrow', brows: 'angry', mouth: 'frown',
          accessory: 'none', facial: 'mustache', outfit: '#3F3A44', accent: '#E8D5A3', age: 'old',
        },
      },
      relation: 'Board 1; lost to Wendy at 7:38.',
      alibi: 'At Board 1 for the whole round — leaving would have forfeited.',
      greeting: 'You want to talk about money. I want to talk about move twenty-three. We will both be disappointed.',
      statements: [
        {
          id: 's1',
          text: 'I played until seven thirty-eight like a gentleman, and then I lost to a child like a gentleman. The arbiter watched me do both. Disgrace.',
        },
        {
          id: 's2',
          text: 'French Defence. She played the French. I hate the French. Not the people — the opening. Solid as a wall. One cannot attack a wall.',
        },
        {
          id: 's3',
          text: 'Oyelowo-Marsh? Smiles too much. A man who smiles that much at a chess club is either winning or hiding something, and he draws every game.',
        },
      ],
      accusedWrong: 'I was at Board 1 until seven thirty-eight with a child dismantling my kingside in front of forty witnesses. If I had left I would have forfeited. I would rather be robbed than forfeit. Acceptable? Good.',
    },
    {
      character: {
        id: 'c09-wendy',
        name: 'Wendy Achterberg',
        role: 'Chess prodigy',
        age: 16,
        tagline: 'It was a really nice French, actually.',
        personality: 'Bubbly, kind, lethal over the board; still a teenager everywhere else.',
        quirk: 'Bounces slightly on her toes when explaining a move.',
        voice: 'Bright, quick, slightly apologetic about winning; says “sorry” and “basically” a lot.',
        avatar: {
          skin: '#F3D6BE', hair: 'braids', hairColor: '#C87533', eyes: 'wide', brows: 'raised', mouth: 'grin',
          accessory: 'glasses', facial: 'none', outfit: '#2EC4B6', accent: '#FFB347', age: 'young',
        },
      },
      relation: 'Board 1; beat Nikolai at 7:38.',
      alibi: 'At Board 1 the whole round, as the arbiter confirms.',
      greeting: 'Hi! Sorry — is this about the money? I was, um, basically busy winning. Sorry, Mr. Zhdanov.',
      statements: [
        {
          id: 's1',
          text: 'I was at the board till seven thirty-eight. You can’t leave during your game, you forfeit, and I would never forfeit a position like that. Sorry. It was really nice.',
        },
        {
          id: 's2',
          text: 'Mr. Oyelowo-Marsh didn’t come to watch. He always watches me — like, every round, he stands at the back and nods. Tonight after his draw he just… wasn’t there. I noticed because I wanted him to see the rook lift.',
        },
        {
          id: 's3',
          text: 'Beatrix came in at the very end to watch the finish. She said the demo board in the analysis room had been showing our game all night and she basically couldn’t stop looking at it.',
        },
      ],
      accusedWrong: 'I was mating Mr. Zhdanov on the back rank in front of the entire club. Sorry. I mean I’m not sorry about the mate. I’m sorry it wasn’t a better alibi. It’s a really good alibi, actually.',
    },
    {
      character: {
        id: 'c09-ferdinand',
        name: 'Ferdinand Oyelowo-Marsh',
        role: 'Club accountant',
        age: 44,
        tagline: 'Everything balances, if you hold it at the right angle.',
        personality: 'Smooth, affable, immaculately plausible; a man who has never once been asked a follow-up question.',
        quirk: 'Straightens his cufflinks before every answer.',
        voice: 'Warm, measured, a little oily; agrees with you before disagreeing; fond of “naturally” and “as you’d expect”.',
        avatar: {
          skin: '#6B3F2A', hair: 'slick', hairColor: '#1B1B1B', eyes: 'sharp', brows: 'arched', mouth: 'smirk',
          accessory: 'tie', facial: 'goatee', outfit: '#1F2A44', accent: '#E8D5A3', age: 'adult',
        },
      },
      relation: 'Board 2; drew with Beatrix at 7:12. Keeps the club’s books.',
      alibi: 'Went to the analysis room with Beatrix after the draw and stayed there.',
      motive: 'The club’s account is £2,400 short before next week’s audit — the exact size of the prize fund.',
      greeting: 'Detective, naturally. Dreadful business. Ask me anything; I have nothing but time and, as you’d expect, nothing to hide.',
      statements: [
        {
          id: 's1',
          text: 'After our draw I went to the analysis room with Beatrix and we went through Board 1’s Sicilian. Sharp stuff — Wendy’s very brave with the c-pawn. Naturally one learns from the young.',
          contradictedBy: 'demo-board',
          pressReply: 'Sicilian, French — openings blur, Detective, after a long round. Pawns here, pawns there. The point is I was in that room, as you’d expect, learning.',
          wrongPressReply: 'I’m not sure how that bears on where I spent my evening. Do go on, though. Naturally.',
        },
        {
          id: 's2',
          text: 'I never left the analysis room until the commotion. Beatrix and I were together the whole time — she’ll tell you the same, naturally.',
          contradictedBy: 'beatrix-saw',
          pressReply: 'Beatrix misremembers. Charming woman, excellent blogger, but she was rather absorbed in the demo board. I may have stepped into the corridor. Briefly. For air.',
          wrongPressReply: 'That is interesting but not, I think, about me. As you’d expect, I was exactly where I said I was.',
          revealClueId: 'club-accounts',
        },
        {
          id: 's3',
          text: 'The club accounts are immaculate. I keep them myself — have done for six years. Every penny balances. Pilbeam signs whatever I put in front of him, bless him, because he has never once found an error.',
          contradictedBy: 'club-accounts',
          pressReply: '…Sundry expenses. Timing differences. These things resolve at year end — naturally — and the audit would have shown — would have shown everything in order. Eventually.',
          wrongPressReply: 'Numbers are my department, Detective. Whatever that is, it isn’t numbers.',
        },
      ],
      accusedWrong: 'Me? I was in the analysis room with a witness, I have a spotless record, and I draw every game — a thief would at least have the decency to win something. Naturally I understand you have to ask.',
      accusedRight: 'Do you know what zugzwang is, Detective? Every move loses. Two thousand four hundred in sundries over eight months, the audit on Tuesday, and Pilbeam’s key in a coat on a hook as it has been for twenty years. The envelopes are in my car. I was going to replace the money with the money and let the club blame a stranger. It balanced beautifully. Everything balances, until someone remembers I don’t smoke.',
    },
    {
      character: {
        id: 'c09-beatrix',
        name: 'Beatrix Kowalczyk',
        role: 'Librarian & chess blogger',
        age: 38,
        tagline: 'I write it all down. Occasionally before it happens.',
        personality: 'Observant, wry, tidy; notices everything and forgives most of it.',
        quirk: 'Clicks a four-colour pen through all four colours while thinking.',
        voice: 'Dry, articulate, librarian-precise; small deadpan jokes delivered without a flicker.',
        avatar: {
          skin: '#F6E3D1', hair: 'bob', hairColor: '#5A2D82', eyes: 'round', brows: 'flat', mouth: 'neutral',
          accessory: 'roundGlasses', facial: 'none', outfit: '#7A5230', accent: '#C9B27C', age: 'adult',
        },
      },
      relation: 'Board 2; drew with Ferdinand at 7:12.',
      alibi: 'In the analysis room from 7:13, alone, watching Board 1 on the demo board.',
      greeting: 'Detective. I assume you want the version with times in it. I only have that version.',
      statements: [
        {
          id: 's1',
          text: 'After the draw I went straight to the analysis room and sat with Board 1 on the demo board. Alone. Ferdinand stopped at the door and said “I’ll just have a smoke” and went off down the corridor. Which was odd, because in eleven years I have never seen Ferdinand smoke anything but his opponents.',
          revealOnRead: true,
          revealClueId: 'beatrix-saw',
        },
        {
          id: 's2',
          text: 'The demo board showed Nikolai’s French the whole time. It mirrors Board 1 live — that is its entire purpose. If anyone tells you they watched a Sicilian in that room tonight, they were watching a different room.',
        },
        {
          id: 's3',
          text: 'I did leave the analysis room once — at about half past seven, to watch the finish in the hall. Wendy’s rook lift was lovely. I wrote it down before she’d played it.',
        },
      ],
      accusedWrong: 'I was free during the theft, yes — I have never pretended otherwise, which you may want to note is unusual among your suspects. Check the chairs in the analysis room. Only one of them has a cardigan on it.',
    },
  ],

  puzzles: [],

  hints: [
    'Nobody left the hall during their own game. Check the scoresheets: whose game had already ended when the money went missing?',
    'Two players were free after 7:12. Both say they went to the analysis room. Look at what the demonstration board was showing — and read the poster on the wall.',
    'Ferdinand described Board 1 as a Sicilian. The demo board showed a French all evening. Press him with that, then with what Beatrix saw at the door.',
  ],

  culpritId: 'c09-ferdinand',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Why does Ferdinand’s “Sicilian” slip matter?',
      options: [
        { id: 'a', text: 'Because the Sicilian is banned at the Greywick Chess Club.' },
        { id: 'b', text: 'Because the demo board mirrored Board 1’s French Defence all evening — anyone who had really sat in the analysis room would have seen it.' },
        { id: 'c', text: 'Because Wendy actually played the Sicilian and Ferdinand knew too much.' },
        { id: 'd', text: 'Because the Sicilian takes longer and would have kept him in the room past 7:35.' },
      ],
      correct: 'b',
      explanation: 'Board 1 opened 1.e4 e6 — the French — and the analysis room’s demonstration board mirrored it move by move. Ferdinand claimed to have studied Board 1’s “Sicilian” in that room. He was describing a room he was never in.',
    },
    {
      id: 'q2',
      prompt: 'Who was free to reach the corridor during the theft window?',
      options: [
        { id: 'a', text: 'Nikolai and Wendy — Board 1 players can leave whenever they like.' },
        { id: 'b', text: 'Only Mr. Pilbeam, who held the key.' },
        { id: 'c', text: 'Ferdinand and Beatrix — Board 2 ended at 7:12, and leaving during a game would have forfeited.' },
        { id: 'd', text: 'Nobody; the hall doors were locked.' },
      ],
      correct: 'c',
      explanation: 'The arbiter logged no forfeits, so nobody left the hall mid-game. Board 1 ran until 7:38, pinning Nikolai and Wendy. Board 2 drew at 7:12, freeing Ferdinand and Beatrix for the whole window. Beatrix sat alone in the analysis room; Ferdinand went down the corridor “for a smoke”.',
    },
    {
      id: 'q3',
      prompt: 'What was Ferdinand’s motive?',
      options: [
        { id: 'a', text: 'He wanted the prize money to fund an entry to the Dunmere Open.' },
        { id: 'b', text: 'He was covering £2,400 he had already embezzled from the club before next week’s audit.' },
        { id: 'c', text: 'Revenge on Nikolai for a lost game in 1987.' },
        { id: 'd', text: 'He wanted to frame Beatrix for her blog reviews.' },
      ],
      correct: 'b',
      explanation: 'Nia’s look at the society’s bank records shows the club account £2,400 short through “sundry” withdrawals authorised by the accountant. The prize fund was exactly the sum needed to fill the hole before the audit — and to make the loss look like an outsider’s theft.',
    },
  ],

  solution: [
    'The club’s one rule solves half the case before you ask a question. A player who leaves the hall during their own game forfeits, and the arbiter logged no forfeits. Board 1 ran until 7:38, so Nikolai and Wendy were pinned to their chairs through the whole theft window. Board 2 drew by repetition at 7:12. From that moment, Ferdinand Oyelowo-Marsh and Beatrix Kowalczyk were free to walk the corridor where Mr. Pilbeam’s coat — and the drawer key in its pocket — hung on a hook, as it has for twenty years.',
    'Both say they went to the analysis room. Beatrix says she went alone, and that Ferdinand stopped at the door with “I’ll just have a smoke” before heading down the corridor — strange, since he has never smoked in eleven years. Ferdinand says they sat together and went through Board 1’s Sicilian.',
    'The room disagrees with him. The analysis room’s demonstration board mirrors Board 1 live; it showed Zhdanov v Achterberg — 1.e4 e6, the French Defence, as the scoresheet and the Opening of the Month poster both spell out — from the first move to the mate. Nobody who sat in that room could call it a Sicilian. Ferdinand was never there. He was in the corridor, borrowing a key from a coat and opening a drawer without leaving a scratch.',
    'Pressed, he conceded he had “stepped out for air” and that Beatrix “misremembers”, and Nia found the reason: the club’s account was already £2,400 short through eight months of “sundry” withdrawals, all authorised by its accountant, with the audit due next week. The prize fund was exactly the size of the hole. He meant to put the club’s money back into the club’s account and let a stranger take the blame for the envelopes. Everything balances, if you hold it at the right angle.',
    'The envelopes were in Ferdinand’s glovebox. Wendy received her prize at a slightly delayed presentation and apologised to Nikolai again. Nikolai said “acceptable” and bought her a lemonade. Mr. Pilbeam has moved the key to a different pocket.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. He described a room he wasn’t in. That’s the whole trick. Liars decorate.', mood: 'neutral' },
    { speaker: 'lucien', text: 'Zugzwang, properly pronounced. I knew it was the accountant before I saw the scoresheets — but I will allow that the scoresheets were a nice touch.', mood: 'smug' },
    { speaker: 'nia', text: 'Eight months of “sundry”. Nobody’s sundry is two thousand four hundred pounds. My sundry is a sandwich.', mood: 'smug' },
    { speaker: 'quill', text: 'A lock opened as its maker intended, by a man who never intended to be caught. “The play’s the thing” — and he never watched it.', mood: 'happy' },
    { speaker: 'hestia', text: 'Miss Achterberg sent the Bureau a signed scoresheet, dear. I’ve filed it under A. She apologised on it. Twice.', mood: 'happy' },
    { speaker: 'otto', text: 'Good work, Rookie. Don’t let Lucien teach you chess. He’ll explain the French.', mood: 'happy' },
  ],
};
