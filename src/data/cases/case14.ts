import type { CaseFile } from '../types';

/**
 * CASE 14 — "Dead Letter"  (hard)
 * A blackmail note in Caesar shift 7 (the 7p stamp is the key), signed "Heron" to frame
 * the newsletter editor. The auction-house rep with pier fob 2 collected the stamp herself.
 */
export const case14: CaseFile = {
  id: 'case-14',
  number: 14,
  title: 'Dead Letter',
  difficulty: 'hard',
  tagline: 'The key was on the face of it. So was the frame.',
  location: 'Greywick Philatelic Society, Candlewick Row; the Harbour piers',
  time: '9:00 – 10:30 PM',
  crime:
    'The Society president\'s rare "Inverted Lantern" stamp is gone; a blackmail note in cipher sat in his desk, signed with the pen-name of the newsletter editor—and he refuses to say a word.',
  palette: { from: '#2A1A0E', to: '#4A3520', glow: '#FFB347' },

  briefing: [
    'The Greywick Philatelic Society meets above a bookbinder\'s on Candlewick Row, and its president, Augustin Ferrer-Moss, owns—owned—the "Inverted Lantern": a 1912 Greywick Tram Company stamp printed with the lantern upside down, one of three known. It lived in a frame on his office wall. The frame is still there. The stamp is not.',
    'In his desk drawer, under the minutes, the Society secretary found a note in cipher on a plain card, in an envelope bearing a seven-pence stamp and no postmark. Augustin had clearly read it. He has clearly not reported it. When asked about the stamp he says it was "taken"; when asked about the note he says nothing at all and looks at his shoes.',
    'The note is signed "Heron". Every member knows that Winifred Okoro, who edits the newsletter, writes a column called "The Heron\'s Perch" and signs it with a small drawn heron. Every member will tell you so, at length. Winifred says she was at St. Jude\'s with her sister all evening and would hardly sign a blackmail note with her own pen-name. She has a point. Someone wanted you to think of her first.',
    'Felix Nakamura-Grant, the Society\'s cipher enthusiast, says the stamp is the key: "Seven pence. Shift seven. It\'s on the face of it." He is pleased with himself. He also taught a cipher workshop in March which, he says, "everyone came to"—which is a problem for anyone hoping cipher skill narrows the field.',
    'Otto\'s note: "Decode it. Then ask who could be where it says, when it says. The harbour has a gate, and gates keep lists."',
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'A stamp. A note in code. A president who won\'t talk. Hm. Blackmail dressed as theft.', mood: 'neutral' },
    { speaker: 'nia', text: 'The note\'s signed "Heron". Winifred Okoro\'s column is called The Heron\'s Perch. That\'s not a clue, that\'s a neon sign pointing the wrong way.', mood: 'smug' },
    { speaker: 'quill', text: 'A Caesar shift, Rookie—the oldest trick in the Roman book. The stamp on the envelope is seven pence. Count seven. Caesar would be ashamed; he at least used a thirteen.', mood: 'happy' },
    { speaker: 'hestia', text: 'Seven pence, dear. Nobody has posted a letter for seven pence since 1979. Someone kept old stamps. Collectors do. All of them.', mood: 'thinking' },
    { speaker: 'lucien', text: 'The harbour piers have electronic gates. Fobs. Logs. The Harbourmaster is a dull man with an excellent spreadsheet. I\'d start there, if I were starting, which I am not.', mood: 'smug' },
    { speaker: 'otto', text: 'Decode first. Then the gate. Then find out who knew what Ferrer-Moss is so ashamed of.', mood: 'neutral' },
    { speaker: 'you', text: 'Shift seven. Pier, time, signature.', mood: 'thinking' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'happy' },
  ],

  scenes: [
    {
      id: 'office',
      name: 'The President\'s Office',
      description:
        'Green-shaded lamp, tweezers in a jar, an empty frame on the wall with a lighter rectangle where the stamp kept the wallpaper from fading. The desk drawer is half open.',
      palette: ['#1F150C', '#3E2C18', '#8A6A3A'],
      props: ['Stamp', 'Mail', 'Frame', 'Lamp', 'Glasses'],
      hotspots: [
        {
          id: 'desk-drawer',
          x: 42,
          y: 64,
          label: 'Desk drawer — the note',
          clueId: 'cipher-note',
        },
        {
          id: 'envelope',
          x: 58,
          y: 58,
          label: 'The envelope and its stamp',
          clueId: 'stamp-7p',
        },
        {
          id: 'empty-frame',
          x: 70,
          y: 26,
          label: 'Empty display frame',
          flavor: 'Glass unbroken, hinge undisturbed, hooks intact. Nobody broke in and took the Inverted Lantern. Somebody opened the frame with the little key and took it out, carefully, the way one does with one\'s own property.',
        },
        {
          id: 'augustin',
          x: 16,
          y: 50,
          label: 'Augustin Ferrer-Moss',
          flavor: 'Sitting very still. "It was taken." Where? "Taken." By whom? He studies his shoes as if they held a watermark.',
        },
        {
          id: 'tweezers',
          x: 86,
          y: 70,
          label: 'Jar of stamp tweezers',
          flavor: 'Eleven pairs of tweezers, each labelled with a decade. Philatelists are the only people who consider this normal.',
        },
      ],
    },
    {
      id: 'reading-room',
      name: 'The Society Reading Room',
      description:
        'Albums to the ceiling, a newsletter rack by the door, a long table still scattered with the cardboard cipher wheels from Felix\'s March workshop.',
      palette: ['#1A1610', '#3A3020', '#B89A5A'],
      props: ['BookOpen', 'Newspaper', 'Scissors', 'Coffee', 'Feather'],
      hotspots: [
        {
          id: 'newsletter-rack',
          x: 14,
          y: 44,
          label: 'Newsletter rack — "The Heron\'s Perch"',
          clueId: 'heron-column',
        },
        {
          id: 'cipher-wheels',
          x: 54,
          y: 66,
          label: 'Cardboard cipher wheels',
          flavor: 'Two dozen home-made Caesar wheels, each named by its maker in felt-tip. DESMOND. LOTTE. WINIFRED. BARNABY (spelled BARNABEE, crossed out). Felix really did teach everyone.',
        },
        {
          id: 'album-shelf',
          x: 80,
          y: 30,
          label: 'Album shelf',
          flavor: 'Forty years of Society albums. The 1979 volume has a slip of paper marking a page about "a notable local acquisition". The slip is sherry-stained.',
        },
        {
          id: 'biscuit-tin',
          x: 36,
          y: 80,
          label: 'Biscuit tin',
          flavor: 'Labelled "MEMBERS ONLY". Contains one biscuit and a note from the treasurer about biscuit expenditure. The note is longer than the minutes.',
        },
      ],
    },
    {
      id: 'harbour',
      name: 'The Harbour — Pier Nine',
      description:
        'Masts, gulls, and a chain-link gate with a fob reader that beeps politely for the right people. Pier Nine is the last one, dark, with a ledge under it that stays dry at high tide.',
      palette: ['#0F1A24', '#1F3A4E', '#6FA8C8'],
      props: ['Anchor', 'Sailboat', 'Fence', 'Bird', 'Moon'],
      hotspots: [
        {
          id: 'gate-reader',
          x: 20,
          y: 50,
          label: 'Pier gate fob reader log',
          clueId: 'pier-gate-log',
        },
        {
          id: 'harbourmaster-hut',
          x: 8,
          y: 30,
          label: 'Harbourmaster\'s fob register',
          clueId: 'fob-register',
        },
        {
          id: 'under-pier-nine',
          x: 76,
          y: 74,
          label: 'Under Pier Nine',
          flavor: 'A dry ledge above the tide line and, caught on a nail, a torn corner of glassine—the waxy paper collectors keep stamps in. Something small sat here, briefly, at ten.',
        },
        {
          id: 'desmond-yacht',
          x: 56,
          y: 40,
          label: 'Desmond\'s yacht, "Perforation"',
          flavor: 'Thirty feet of varnished self-regard. Lines neatly coiled, fenders out. A man who ties up this tidily at seven does not come back at ten.',
        },
        {
          id: 'gulls',
          x: 88,
          y: 22,
          label: 'Gulls on the lamp post',
          flavor: 'Three gulls and no herons. The nearest heron to this pier is on page two of a newsletter.',
        },
      ],
    },
    {
      id: 'auction-house',
      name: 'Vandermeer & Lisle, Auctioneers',
      description:
        'Grey carpet, white walls, a glass case of lots under spotlights and a notice board that says exactly when the doors close.',
      palette: ['#15161C', '#2C2E3A', '#9A9CB0'],
      props: ['Gavel', 'Gem', 'ClipboardList', 'Clock', 'Briefcase'],
      hotspots: [
        {
          id: 'notice-board',
          x: 18,
          y: 36,
          label: 'Notice board — viewing hours',
          clueId: 'viewing-hours',
        },
        {
          id: 'lot-case',
          x: 52,
          y: 56,
          label: 'Glass case of lots',
          flavor: 'Lots 1 to 40: watches, a snuffbox, a sad violin. Lot 41 is a blank card: "Withdrawn — private treaty." Someone changed their mind, or had it changed for them.',
        },
        {
          id: 'lotte-desk',
          x: 80,
          y: 62,
          label: 'Lotte\'s desk',
          flavor: 'Immaculate. A bowl of sugared almonds, a lanyard hook with no fob on it, and a sherry glass that has been washed but not put away.',
        },
        {
          id: 'coffee-machine',
          x: 88,
          y: 28,
          label: 'Coffee machine',
          flavor: 'Makes eleven kinds of coffee. A sign reads "NOT FOR CLIENTS". Below, in Lotte\'s hand: "Clients are for us."',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'cipher-note',
      name: 'The cipher note',
      kind: 'document',
      icon: 'ScrollText',
      description: 'A plain card in block capitals: "SLHCL AOL SHUALYU BUKLY WPLY UPUL HA ALU. ALSS UV VUL. — OLYVU". Found under the minutes in Augustin\'s drawer.',
      detail: 'Block capitals in black ballpoint, word lengths preserved, a dash before the signature. Felix calls it "a Caesar, and not a subtle one". The envelope it came in gives the key away.',
    },
    {
      id: 'stamp-7p',
      name: 'The seven-pence stamp',
      kind: 'physical',
      icon: 'Stamp',
      description: 'The envelope bears a single 7p stamp, 1979 issue, unfranked—hand-delivered, never posted. A note on the back of the envelope reads: "The key is on the face of it."',
      detail: 'Seven pence. Shift seven. Every letter in the note has been moved seven places along the alphabet. The blackmailer wanted Augustin to decode it quickly—and wanted the Bureau, later, to decode it quickly too.',
    },
    {
      id: 'heron-column',
      name: '"The Heron\'s Perch"',
      kind: 'document',
      icon: 'Newspaper',
      description: 'The Society newsletter, page two, every month for nine years: "The Heron\'s Perch, by Winifred Okoro", signed with a little drawn heron.',
      detail: 'Every member of the Society knows Heron means Winifred. A blackmailer who signed "Heron" either is Winifred and has lost her mind, or is not Winifred and wants you to look at her.',
    },
    {
      id: 'hospital-log',
      name: 'St. Jude\'s visitor log',
      kind: 'document',
      icon: 'Hospital',
      description: 'St. Jude\'s Hospital, Ward 6 visitor log: W. Okoro signed in 21:30, signed out 22:30, visiting her sister Adaeze. Ward sister confirms.',
      detail: 'St. Jude\'s is across the river from the harbour. Winifred was holding her sister\'s hand at ten o\'clock, not standing under Pier Nine.',
    },
    {
      id: 'pier-gate-log',
      name: 'Pier gate log',
      kind: 'digital',
      icon: 'Fence',
      description: 'The harbour pier gate reader, last evening: fob 4 in at 18:30 and out at 19:10; fob 2 in at 21:52, out at 22:08. No other fob between 19:10 and midnight.',
      detail: 'One fob opened the pier gate at eight minutes to ten and left sixteen minutes later. Fob numbers are assigned by the Harbourmaster; his register says who carries which.',
    },
    {
      id: 'fob-register',
      name: 'Fob register',
      kind: 'document',
      icon: 'KeyRound',
      description: 'The Harbourmaster\'s register: fob 2 — L. Vandermeer (Vandermeer & Lisle, berth 9A); fob 4 — D. Achterberg (yacht "Perforation", berth 7).',
      detail: 'Lotte Vandermeer\'s firm keeps a small launch at berth 9A, beside Pier Nine. She holds fob 2. Desmond holds fob 4 and uses it, as he says, at half six and seven.',
    },
    {
      id: 'viewing-hours',
      name: 'Auction viewing hours',
      kind: 'document',
      icon: 'Clock',
      description: 'Vandermeer & Lisle notice board: "Late viewing, Thursday: 6:00 – 9:00 PM. Doors locked 9:00 PM sharp." The alarm panel confirms: set at 21:04.',
      detail: 'The late viewing ended at nine. Anyone claiming to have been at it until eleven was somewhere else for two hours, and the gate log says where.',
    },
    {
      id: 'auction-listing',
      name: 'Private sale listing',
      kind: 'digital',
      icon: 'Gavel',
      description: 'Nia, from the auction house server: a private-treaty listing drafted last week—"Greywick Tram Co. 1912, Lantern Inverted, one of three recorded. Offers invited from 8th." Author: L. Vandermeer.',
      detail: 'A stamp that was still on Augustin\'s wall last week was already being written up for sale by Lotte. One does not list what one does not expect to have.',
    },
    {
      id: 'barnaby-gossip',
      name: 'Barnaby\'s sherry story',
      kind: 'testimony',
      icon: 'Wine',
      description: 'Barnaby Quist told Lotte, over sherry at the Society\'s summer party, how Augustin "acquired" the Inverted Lantern in 1979—from a dead member\'s album, before the family had counted it.',
      detail: 'Augustin\'s shame is the whole lever. Whoever knew the story could blackmail him; whoever he thought knew would be the person he suspected. Barnaby told exactly one person who wasn\'t already in the know, and poured her a second glass.',
    },
    {
      id: 'cipher-night',
      name: 'The Caesar workshop',
      kind: 'testimony',
      icon: 'GraduationCap',
      description: 'Felix\'s March workshop, "Caesar for Collectors": attendance sheet signed by every Society member, including Winifred, Desmond, Lotte and Barnaby.',
      detail: 'Cipher skill proves nothing here. Felix made sure of that himself, with cardboard wheels and biscuits.',
    },
    {
      id: 'decoded-note',
      name: 'The decoded note',
      kind: 'document',
      icon: 'LockOpen',
      description: 'Shift every letter back by seven: "LEAVE THE LANTERN UNDER PIER NINE AT TEN. TELL NO ONE. — HERON"',
      detail: 'A blackmail drop, not a burglary. Augustin carried his own stamp to Pier Nine at ten and left it on the dry ledge, as told. Someone with a pier fob was waiting. The signature points at Winifred; the gate log points elsewhere.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c14-winifred',
        name: 'Winifred Okoro',
        role: 'Newsletter editor',
        age: 59,
        tagline: 'I\'d hardly sign a crime with my own column.',
        personality: 'Warm, scattered, kind; loses her glasses and finds everyone else\'s.',
        quirk: 'Pats her pockets for a pen she is already holding.',
        voice: 'Rambling, affectionate, apologises mid-sentence, circles back to the point eventually.',
        avatar: {
          skin: '#6B3F2A', hair: 'afro', hairColor: '#4A4A4A', eyes: 'round', brows: 'raised', mouth: 'smile',
          accessory: 'roundGlasses', facial: 'none', outfit: '#C77D2E', accent: '#FFB347',
        },
      },
      relation: 'Edits the Society newsletter; writes "The Heron\'s Perch" and signs it with a heron.',
      alibi: 'At St. Jude\'s Hospital with her sister from 9:30 to 10:30 PM.',
      motive: 'None—unless one counts a decade of Augustin cutting her column for space.',
      greeting: 'Oh—hello, dear, sorry, I\'ve lost my—no, here it is. Yes. The heron. I know. I\'ve been drawing that heron for nine years and now it\'s a criminal.',
      statements: [
        {
          id: 's1',
          text: 'Heron is my column. Everyone knows it; Augustin puts it on page two with a little heron I draw myself. I\'d hardly sign a blackmail note with it, would I? I\'d be the only suspect. Which—oh. Yes. I see.',
        },
        {
          id: 's2',
          text: 'I was at St. Jude\'s with my sister Adaeze from half nine. Ward 6. You sign a book going in and a book going out and the ward sister glares at you if you\'re a minute over. I was a minute over.',
          revealOnRead: true,
          revealClueId: 'hospital-log',
        },
        {
          id: 's3',
          text: 'Augustin\'s been odd for a week—jumpy, cancelling things. I thought it was his hip. I offered him a biscuit and he looked at me like I\'d offered him a summons.',
        },
      ],
      accusedWrong: 'Oh, dear. Well. I suppose if I were going to blackmail someone I would sign it with the one name in Greywick that points straight at me. That would be very like me. It would not, however, be true.',
    },
    {
      character: {
        id: 'c14-desmond',
        name: 'Desmond Achterberg',
        role: 'Society treasurer; yacht owner',
        age: 52,
        tagline: 'Fob four. Half six and seven. Write it down.',
        personality: 'Bluff, exact about money and ropes, impatient with everything else.',
        quirk: 'Tucks his thumbs into his waistcoat pockets like a man about to read a budget.',
        voice: 'Blunt, numerical, nautical; answers the question asked and no other.',
        avatar: {
          skin: '#E8C4A2', hair: 'short', hairColor: '#B05A2A', eyes: 'narrow', brows: 'thick', mouth: 'frown',
          accessory: 'tie', facial: 'mustache', outfit: '#1F3A5C', accent: '#6FA8C8',
        },
      },
      relation: 'Treasurer of the Society; keeps his yacht at the harbour and holds pier fob 4.',
      alibi: 'At the harbour from 6:30 to 7:10 PM checking lines; home after.',
      motive: 'The Society\'s accounts are thin and the Inverted Lantern is insured by the Society, not by Augustin.',
      greeting: 'Achterberg. Treasurer. I\'ve got the fob log in my head if you haven\'t got it in your hand. Fob four. Go on.',
      statements: [
        {
          id: 's1',
          text: 'I went down to the Perforation at half six to check her lines before the wind got up, and left at ten past seven. In, out. The gate will have it. Fob four.',
        },
        {
          id: 's2',
          text: 'Fob four has never been lent, borrowed or lost. It lives on my keyring with the boat keys. People who lend fobs lose boats.',
        },
        {
          id: 's3',
          text: 'For the record, the Society insures the Lantern, not Augustin. If it\'s gone, the Society claims. I\'ve already drafted the letter. I\'m thorough, not guilty.',
        },
      ],
      accusedWrong: 'I was home with a budget spreadsheet and a glass of milk by half seven. The gate log says I left at ten past. Logs don\'t lie. Treasurers occasionally do, but not about gates.',
    },
    {
      character: {
        id: 'c14-lotte',
        name: 'Lotte Vandermeer',
        role: 'Auction-house representative',
        age: 44,
        tagline: 'Everything has a reserve. Even secrets.',
        personality: 'Slick, poised, charming in the manner of a closing bid.',
        quirk: 'Rolls a sugared almond between finger and thumb while she talks.',
        voice: 'Smooth, brisk, salesy; deflects with flattery; gets vague about clocks when clocks matter.',
        avatar: {
          skin: '#F1D2B6', hair: 'bob', hairColor: '#1F1A17', eyes: 'sharp', brows: 'arched', mouth: 'smirk',
          accessory: 'earring', facial: 'none', outfit: '#2C2E3A', accent: '#9A9CB0',
        },
      },
      relation: 'Represents Vandermeer & Lisle to the Society; has long courted Augustin\'s collection for sale.',
      alibi: 'At the auction house\'s late viewing until eleven.',
      motive: 'A one-of-three stamp to sell privately, and the only secret that would make its owner hand it over.',
      greeting: 'Detective. Lotte Vandermeer, Vandermeer & Lisle. Sugared almond? No? You\'re very disciplined. I admire that in a buyer.',
      statements: [
        {
          id: 's1',
          text: 'I was at our late viewing until eleven. Thursday is the long one—collectors drift in after dinner and drift out after the sherry. I locked up myself.',
          contradictedBy: 'viewing-hours',
          pressReply: 'Eleven, nine—who looks at clocks on a viewing night? I locked up when it was over. I may have gone for a walk afterwards. Air.',
          wrongPressReply: 'I don\'t see how that bears on where I was. I was at the viewing. Ask the almonds.',
        },
        {
          id: 's2',
          text: 'The harbour? I haven\'t been near it in weeks. The firm keeps a launch there, but I\'m not a boat person. Salt is dreadful for the hair.',
          contradictedBy: 'pier-gate-log',
          pressReply: 'Someone must have borrowed my fob. It hangs on a hook by my desk; half the office walks past it. I\'ll have it reported. How tiresome.',
          wrongPressReply: 'That\'s nothing to do with the harbour. I told you, I don\'t go near it.',
        },
        {
          id: 's3',
          text: 'My house has no particular interest in Augustin\'s collection. Charming man, provincial stamps. We handle the Lantern sort of thing when it comes, but we don\'t chase it.',
          contradictedBy: 'barnaby-gossip',
          pressReply: 'Barnaby talks. Barnaby talks to everyone, about everyone, over everything that comes in a decanter. If I happened to learn how Augustin came by his stamp, that\'s his indiscretion, not my interest.',
          wrongPressReply: 'I\'m not sure what you think that shows about my firm\'s interest.',
          revealClueId: 'auction-listing',
        },
        {
          id: 's4',
          text: 'We have nothing like the Inverted Lantern coming to sale. If we did, it would be in the catalogue, and it is not in the catalogue.',
          contradictedBy: 'auction-listing',
          pressReply: '...Private treaty isn\'t the catalogue. It\'s a draft. One prepares for opportunities. I was—anticipating. An auctioneer who doesn\'t anticipate is a clerk.',
          wrongPressReply: 'Our catalogue is public. Look it up. Nothing like it.',
        },
      ],
      accusedWrong: 'Me? I\'ve a business to run, detective, and a reputation. I don\'t stand under piers at night. I have people who—that is, I don\'t.',
      accusedRight:
        'He told me himself, in a way—Barnaby did, over the third sherry, how Augustin lifted the Lantern out of a dead man\'s album in \'79. After that it was arithmetic. Shift seven, sign it Heron so he\'d think of poor Winifred and never think of me, and tell him where to put it. He did exactly as he was told. I was on the ledge at eight to ten with my fob and a glassine envelope. I\'d already written the listing. One prepares.',
    },
    {
      character: {
        id: 'c14-felix',
        name: 'Felix Nakamura-Grant',
        role: 'Cipher hobbyist',
        age: 35,
        tagline: 'Shift seven! Honestly, it\'s on the face of it.',
        personality: 'Eager, generous, delighted to explain; incapable of keeping a method secret.',
        quirk: 'Draws alphabets in the air with a finger while thinking.',
        voice: 'Enthusiastic, fast, a lecturer who can\'t stop; qualifies everything with "technically".',
        avatar: {
          skin: '#D9A57F', hair: 'short', hairColor: '#1B1B1B', eyes: 'wide', brows: 'raised', mouth: 'grin',
          accessory: 'glasses', facial: 'none', outfit: '#2EC4B6', accent: '#7C5CFF',
        },
      },
      relation: 'Society member; ran the March cipher workshop; decoded the note in eleven seconds.',
      alibi: 'At home writing a blog post about the Vigenère cipher.',
      motive: 'Fame among a very small circle of people.',
      greeting: 'It\'s a Caesar! Shift seven—the stamp\'s seven pence, "the key is on the face of it", that\'s practically a wink. Do you want me to—no? You want to do it yourself. Good. Good! Everyone should.',
      statements: [
        {
          id: 's1',
          text: 'Caesar shift of seven. The 7p stamp is the key; the note even says so on the back. I taught exactly this in March—"Caesar for Collectors"—and technically everyone came. Winifred, Desmond, Lotte, Barnaby, all of them. Attendance sheet\'s in the reading room.',
          revealOnRead: true,
          revealClueId: 'cipher-night',
        },
        {
          id: 's2',
          text: 'Last night I was at home blogging about Vigenère. Four thousand words. Eleven readers. It was posted at 10:14 PM with a typo I\'m still upset about.',
        },
        {
          id: 's3',
          text: 'If I\'d written that note, technically, I\'d have used something better. A Caesar is for people who want to be read. This blackmailer wanted Augustin to understand quickly and the Bureau to understand later. That\'s not a cipher, it\'s a stage direction.',
        },
      ],
      accusedWrong: 'Because I can decode it? Everyone can decode it! That was the point of the workshop! Technically, you can decode it. Are you a suspect?',
    },
    {
      character: {
        id: 'c14-barnaby',
        name: 'Barnaby Quist',
        role: 'Augustin\'s oldest friend',
        age: 70,
        tagline: 'I never gossip. I inform.',
        personality: 'Genial, indiscreet, loyal in the way of a man who tells your secrets lovingly.',
        quirk: 'Lowers his voice to a stage whisper that carries across rooms.',
        voice: 'Confiding, anecdotal, "between ourselves", long digressions ending in a sting.',
        avatar: {
          skin: '#F2DCC4', hair: 'bald', hairColor: '#CCCCCC', eyes: 'sleepy', brows: 'flat', mouth: 'smile',
          accessory: 'bowtie', facial: 'bigBeard', outfit: '#6B2D1E', accent: '#D4A857', age: 'old',
        },
      },
      relation: 'Has known Augustin since 1971; knows how the Inverted Lantern was really acquired.',
      alibi: 'At The Hanged Man from eight until closing; the landlord will confirm, wearily.',
      greeting: 'Come in, come in. Between ourselves—and I say this to everyone—poor Augustin has had this coming since 1979. Sit. Sherry? No? Pity.',
      statements: [
        {
          id: 's1',
          text: 'The Lantern was "acquired" in \'79, from old Pemberton\'s album, the week he died and before his daughter had counted. Augustin\'s carried it like a stone ever since. I mentioned it to Lotte at the summer party—over sherry, you understand—because she asked so nicely about provenance.',
          revealOnRead: true,
          revealClueId: 'barnaby-gossip',
        },
        {
          id: 's2',
          text: 'I was at The Hanged Man from eight. The landlord will tell you; he\'ll also tell you I told him the Pemberton story twice. He\'s heard it before. Everyone has. Well—nearly everyone.',
        },
        {
          id: 's3',
          text: 'Augustin won\'t talk because talking means saying the word "Pemberton" to a policeman. He\'d rather lose the stamp than the story. Between ourselves, he already has.',
        },
      ],
      accusedWrong: 'My dear fellow, I\'ve been blackmailing Augustin with that story for forty years, and all I\'ve ever extracted is sherry. Why would I start charging now?',
    },
  ],

  puzzles: [
    {
      type: 'code',
      id: 'drop-location',
      title: 'Where and when is the drop?',
      prompt:
        'The card in Augustin\'s drawer reads:\n\nSLHCL AOL SHUALYU BUKLY WPLY UPUL HA ALU. ALSS UV VUL. — OLYVU\n\nThe envelope carries a single 7p stamp and, on the back, "the key is on the face of it." Decode the message and name where and when the stamp was to be left.',
      inputLabel: 'Where and when is the drop?',
      answers: ['pier nine at ten', 'pier 9 at 10', 'under pier nine at ten', 'pier nine', 'pier 9', 'under pier 9 at 10', 'pier nine at 10', 'pier 9 at ten'],
      hint: 'Seven pence: shift every letter back seven places. S becomes L, A becomes T.',
      explanation:
        'A Caesar shift of seven: S→L, L→E, H→A, C→V, L→E gives LEAVE; AOL is THE; SHUALYU is LANTERN. The note reads "LEAVE THE LANTERN UNDER PIER NINE AT TEN." The drop was Pier Nine at ten o\'clock.',
    },
    {
      type: 'code',
      id: 'note-signature',
      title: 'Who signs the note?',
      prompt:
        'The card ends with a signature: — OLYVU. Apply the same shift of seven to read it. Who does the blackmailer claim to be?',
      inputLabel: 'Signature',
      answers: ['heron', 'the heron'],
      hint: 'Same key as before—seven back. O becomes H.',
      explanation:
        'O→H, L→E, Y→R, V→O, U→N: HERON. The note is signed with Winifred Okoro\'s pen-name—a signature every Society member would recognise, which is exactly why a blackmailer who was not Winifred would use it.',
      revealClueId: 'decoded-note',
    },
  ],

  hints: [
    'Decode the card with the shift the stamp gives you. The note isn\'t a theft; it\'s an instruction. Then ask who could obey it—and who could collect.',
    'The pier has a fob gate and a register. One fob went in at 21:52. Match the number to a name, then match the name to a story about late viewing.',
    'Lotte knew the secret because someone told her over sherry. Break her claim about her firm\'s interest with that, and Nia will find what she had already written up for sale.',
  ],

  culpritId: 'c14-lotte',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Why is the "Heron" signature a frame rather than a confession?',
      options: [
        { id: 'a', text: 'Herons are not native to Greywick' },
        { id: 'b', text: 'Every member knows Heron is Winifred\'s pen-name, and Winifred was logged at St. Jude\'s from 21:30 to 22:30' },
        { id: 'c', text: 'The note was typed, and Winifred writes by hand' },
        { id: 'd', text: 'Winifred cannot do a Caesar shift' },
      ],
      correct: 'b',
      explanation: 'A pen-name the whole Society recognises is the worst possible disguise and the best possible frame. Winifred was across the river in Ward 6 at the time of the drop.',
    },
    {
      id: 'q2',
      prompt: 'Who opened the pier gate just before ten?',
      options: [
        { id: 'a', text: 'Desmond Achterberg, fob 4, at 19:10' },
        { id: 'b', text: 'Felix Nakamura-Grant, with a borrowed fob' },
        { id: 'c', text: 'Lotte Vandermeer, fob 2, at 21:52' },
        { id: 'd', text: 'Augustin Ferrer-Moss, who has a key' },
      ],
      correct: 'c',
      explanation: 'The gate log shows fob 2 in at 21:52 and out at 22:08. The Harbourmaster\'s register assigns fob 2 to L. Vandermeer. Desmond\'s fob 4 was last used at 19:10.',
    },
    {
      id: 'q3',
      prompt: 'How did Lotte learn the secret that made Augustin obey the note?',
      options: [
        { id: 'a', text: 'From Barnaby Quist, over sherry at the summer party' },
        { id: 'b', text: 'From the Society minutes' },
        { id: 'c', text: 'From Winifred\'s column' },
        { id: 'd', text: 'From a Gazette article in 1979' },
      ],
      correct: 'a',
      explanation: 'Barnaby told her how the Lantern was "acquired" from Pemberton\'s album in 1979. Augustin would hand over the stamp rather than have that said aloud.',
    },
    {
      id: 'q4',
      prompt: 'Why doesn\'t the use of a Caesar cipher point at Felix?',
      options: [
        { id: 'a', text: 'Felix only knows Vigenère' },
        { id: 'b', text: 'The note was not actually in cipher' },
        { id: 'c', text: 'Every Society member attended his March workshop and can shift seven' },
        { id: 'd', text: 'Felix was at the harbour at ten' },
      ],
      correct: 'c',
      explanation: 'The attendance sheet for "Caesar for Collectors" carries every member\'s name. Cipher skill is universal in this Society; it eliminates nobody.',
    },
  ],

  solution: [
    'The note was never a theft report; it was a set of instructions. Shift the card back seven places—the seven-pence stamp says so—and it reads: "LEAVE THE LANTERN UNDER PIER NINE AT TEN. TELL NO ONE. — HERON." Augustin did exactly that. He took his own stamp out of its frame, carried it to the harbour and left it on the dry ledge under Pier Nine at ten o\'clock. Then he came back and told the Bureau it had been "taken", because the alternative was explaining why he had obeyed.',
    'The signature was the frame. Heron is Winifred Okoro\'s pen-name, printed on page two of the newsletter every month for nine years; the whole Society would think of her at once. But Winifred was at St. Jude\'s with her sister from 21:30 to 22:30, signed in and out under a ward sister\'s glare. Whoever signed "Heron" wanted the first glance to land on the one member with a watertight alibi, so that the second glance would never come.',
    'The harbour gate kept the list that mattered. Fob 4—Desmond\'s—went in at 18:30 and out at 19:10, exactly as he said. Fob 2 went in at 21:52 and out at 22:08, bracketing ten o\'clock. The Harbourmaster\'s register assigns fob 2 to Lotte Vandermeer, whose firm keeps a launch at berth 9A beside Pier Nine, and who claimed to have been at a late viewing until eleven. The viewing ended at nine; the alarm was set at 21:04.',
    'Lotte knew which secret to use because Barnaby Quist told her, over sherry, how Augustin lifted the Inverted Lantern from a dead member\'s album in 1979. She knew Caesar because Felix taught the whole Society in March—which is also why the cipher points at nobody in particular. And she had already drafted a private-treaty listing for a "Lantern Inverted, one of three recorded" a week before it left Augustin\'s wall.',
    'Augustin will have to say the word "Pemberton" to a policeman after all. Winifred has been apologised to by everyone and has drawn a slightly smug heron for next month\'s column. Felix is writing a blog post about it. Eleven people will read it.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. He posted his own stamp to a blackmailer and called it a burglary. Collectors.', mood: 'neutral' },
    { speaker: 'nia', text: 'The private-treaty draft had a reserve price with six digits and a note: "buyer in Hollowmere, discreet". People love that word. It never once applies.', mood: 'smug' },
    { speaker: 'quill', text: 'Seven pence, seven places. The key was on the face of it, Rookie, and so—eventually—was the shame.', mood: 'happy' },
    { speaker: 'hestia', text: 'The Pemberton album is in the county archive, dear. Page forty has a gap and a pencil note in 1979 handwriting: "lent to A.F-M." Everything is filed. Everything.', mood: 'thinking' },
    { speaker: 'lucien', text: 'The Harbourmaster\'s spreadsheet. I did mention it. One likes to be thanked, but one has learned not to wait.', mood: 'smug' },
    { speaker: 'otto', text: 'Stamp goes to the Pemberton family. Lotte goes to the magistrate. Ferrer-Moss goes to confession, or at least to Barnaby. Close it.', mood: 'neutral' },
    { speaker: 'you', text: 'Dead letter. Delivered.', mood: 'neutral' },
  ],
};
