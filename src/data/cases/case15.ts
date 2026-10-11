import type { CaseFile } from '../types';

/**
 * CASE 15 — "The Confession"  (hard)
 * The captain confesses to stealing the Greywick Cup. Every detail of her confession is wrong,
 * because she is describing a crime her little brother committed.
 */
export const case15: CaseFile = {
  id: 'case-15',
  number: 15,
  title: 'The Confession',
  difficulty: 'hard',
  tagline: 'She confessed before anyone asked. Every word of it was wrong.',
  location: 'Marlowe Rowing Club, boathouse and trophy room, the Greywick river',
  time: '2:14 – 2:31 AM',
  crime:
    'The Greywick Cup—sixty centimetres of solid silver—was taken from the Marlowe Rowing Club trophy room overnight; club captain Marguerite Lindqvist walked into the Bureau at eight and confessed.',
  palette: { from: '#0E1F1A', to: '#1E3A33', glow: '#D8D8E0' },

  briefing: [
    'The Greywick Cup has been rowed for since 1887 and has stood in the Marlowe Rowing Club trophy room for most of the years since, a sixty-centimetre silver urn with two handles and a lid like a bishop\'s hat. At six this morning Coach Dunstan Whitlock unlocked the trophy room and found the plinth empty, the alarm armed, the window shut, and nothing else out of place.',
    'At eight, before the Bureau had so much as opened the file, Marguerite Lindqvist—club captain, twenty-four, stroke of the women\'s eight—walked up Lantern Street in a tracksuit and confessed. She came through the window, she says. She used the alarm code. She carried the Cup out in her kit bag. She would like it written down, please, and she would like her brother Josef, nineteen, junior rower, left out of it.',
    'Otto sat with her for twenty minutes and came out saying "Hm" in a tone that Nia describes as "load-bearing". The confession is fluent and detailed. It is also, as far as anyone can tell, impossible. The window was painted shut yesterday afternoon by the groundskeeper. The alarm was disarmed at 2:14 with a code that was changed only yesterday morning. Marguerite\'s kit bag is forty centimetres long.',
    'Three people were given the new code. One of them was in St. Jude\'s all night. One of them was at home, by her phone\'s own account. The third bites his nails and says his sister must know what she\'s talking about.',
    'Otto\'s note: "Break the confession gently. Then find who she\'s standing in front of."',
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'She confessed. Walked in, sat down, confessed. Hm.', mood: 'neutral' },
    { speaker: 'nia', text: 'And every detail is wrong. Wrong window, wrong code, wrong bag. It\'s like she read about the theft in a newspaper that hadn\'t been printed yet.', mood: 'thinking' },
    { speaker: 'quill', text: 'A confession is evidence of a state of mind, Rookie, not of a crime. This one is evidence of love. Love is forensically very untidy.', mood: 'sad' },
    { speaker: 'hestia', text: 'A sister\'s confession, dear. I\'ve filed a few of those over the years. They are always the thickest files, and the saddest.', mood: 'sad' },
    { speaker: 'lucien', text: 'The groundskeeper painted the window shut at three. She says she came through it at two in the morning. Either she is a ghost or she is a liar, and ghosts rarely volunteer.', mood: 'smug' },
    { speaker: 'otto', text: 'Three people had the new code. Rule out two. Be kind to the third\'s sister while you do it.', mood: 'neutral' },
    { speaker: 'you', text: 'Window first. Then the alarm. Then the bag.', mood: 'thinking' },
  ],

  scenes: [
    {
      id: 'trophy-room',
      name: 'The Trophy Room',
      description:
        'Oak panels, oars crossed on the wall, a hundred small cups and one empty plinth. The sash window gleams with fresh white paint; the alarm panel by the door blinks green, having done its job and logged it.',
      palette: ['#12241E', '#24433A', '#D8D8E0'],
      props: ['Trophy', 'Medal', 'Lock', 'PaintRoller', 'ShieldAlert'],
      hotspots: [
        {
          id: 'alarm-panel',
          x: 10,
          y: 44,
          label: 'Alarm panel',
          clueId: 'alarm-log',
        },
        {
          id: 'sash-window',
          x: 74,
          y: 34,
          label: 'Sash window',
          clueId: 'window-paint',
        },
        {
          id: 'empty-plinth',
          x: 46,
          y: 62,
          label: 'Empty plinth',
          flavor: 'A velvet-topped plinth with a sixty-centimetre absence on it. Dust-free ring, no scratches. Lifted, not dragged. Lifted by someone who could manage twelve kilos of silver with ease.',
        },
        {
          id: 'founding-plaque',
          x: 50,
          y: 22,
          label: 'Founding plaque',
          flavor: '"MARLOWE ROWING CLUB — Est. 1887 — Pull Together." Brass, polished weekly by Len, who says he does it "for luck".',
        },
        {
          id: 'crossed-oars',
          x: 88,
          y: 60,
          label: 'Crossed oars',
          flavor: 'Blades painted in club green with the names of every winning eight since 1887. The 2019 oar has "M. LINDQVIST (stroke)" in gold. The 2024 oar has "J. LINDQVIST (bow)" in slightly smaller gold.',
        },
      ],
    },
    {
      id: 'boathouse',
      name: 'Boathouse & Dorm',
      description:
        'Racked shells, the smell of river and liniment. At the back, a bunk room for juniors who train at dawn: four beds, one slept in, a phone charger with nothing on it.',
      palette: ['#101C1A', '#213A36', '#7FA896'],
      props: ['Sailboat', 'Waves', 'Dumbbell', 'Smartphone', 'Footprints'],
      hotspots: [
        {
          id: 'kit-bag',
          x: 24,
          y: 62,
          label: 'Marguerite\'s kit bag',
          clueId: 'kit-bag',
        },
        {
          id: 'josef-bunk',
          x: 72,
          y: 48,
          label: 'Josef\'s bunk and charger',
          clueId: 'josef-phone',
        },
        {
          id: 'josef-locker',
          x: 88,
          y: 66,
          label: 'Josef\'s locker',
          flavor: 'A four-digit combination padlock, chewed-looking round the dial. Tamsin, passing: "Don\'t bother guessing. He\'s not imaginative. It\'s the year on the plaque."',
        },
        {
          id: 'the-eight',
          x: 44,
          y: 36,
          label: 'The women\'s eight',
          flavor: '"Persephone", sixty feet of carbon fibre. Marguerite\'s seat has a worn patch where she grips the gunwale at the catch. She\'s been gripping things hard for a long time.',
        },
        {
          id: 'paint-tins',
          x: 10,
          y: 30,
          label: 'Len\'s paint tins',
          flavor: 'Brilliant White, Club Green, and a tin labelled "LUCKY" that is also Brilliant White. A brush is still soft. Len paints what stands still long enough.',
        },
      ],
    },
    {
      id: 'club-office',
      name: 'The Club Office',
      description:
        'A desk with Tamsin\'s ledger squared to its edge, a whistle on a hook, a kettle with a sign about limescale, and on the blotter a phone in a cracked green case, handed in without being asked.',
      palette: ['#161A18', '#2C342F', '#A8B0A0'],
      props: ['Coffee', 'ClipboardList', 'BellRing', 'Receipt', 'Scale'],
      hotspots: [
        {
          id: 'marguerite-phone-hotspot',
          x: 40,
          y: 58,
          label: 'Marguerite\'s phone',
          clueId: 'marguerite-phone',
        },
        {
          id: 'ledger',
          x: 70,
          y: 52,
          label: 'Tamsin\'s ledger',
          flavor: 'Every penny since 2019 in a hand like a ruled line. A pencilled note on the inside cover: "Josef — subs 3 months overdue. Ask M." Then, later: "Asked M. M paid."',
        },
        {
          id: 'whistle',
          x: 14,
          y: 36,
          label: 'Coach\'s whistle',
          flavor: 'Engraved "D.W. — LOUDER". It has never needed encouragement.',
        },
        {
          id: 'kettle',
          x: 88,
          y: 70,
          label: 'Kettle',
          flavor: 'Sign: "DESCALE ME — Tamsin". Below it, in biro: "no — Len". Below that: "yes — T." The kettle, like the club, is a long negotiation.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'window-paint',
      name: 'Window painted shut',
      kind: 'physical',
      icon: 'PaintRoller',
      description: 'The trophy-room sash was painted at 3 PM yesterday by Len. The paint has sealed the sash to the frame in one unbroken skin. Nobody came through this window.',
      detail: 'Quill ran a fingernail along the join: "Not so much as a hairline, Rookie. This window has been shut since teatime and will be shut until someone finds a chisel." The confession\'s first sentence dies here.',
    },
    {
      id: 'alarm-log',
      name: 'Alarm log',
      kind: 'digital',
      icon: 'ShieldAlert',
      description: 'The trophy-room alarm: DISARMED 02:14 — code 7-3-0-2 (current). ARMED 02:31 — code 7-3-0-2. No failed attempts. The old code, 4-4-1-9, was retired at 09:00 yesterday.',
      detail: 'Seventeen minutes inside, in and out on the new code, no fumbling. Whoever did this knew the code that was less than a day old—and re-armed on the way out, like someone who\'d been taught to lock up.',
    },
    {
      id: 'code-memo',
      name: 'Code change memo',
      kind: 'document',
      icon: 'KeyRound',
      description: 'Coach Whitlock changed the alarm code at 9 AM yesterday after a junior left the old one on a whiteboard. He gave the new code to three people: himself, Marguerite, and Josef—"my two keyholders".',
      detail: 'Written on a sticky note in the coach\'s hand and given to each of them by hand, "not texted, never texted". Three people could have disarmed the trophy room at 2:14. Not Tamsin, not Len, not any other rower.',
    },
    {
      id: 'kit-bag',
      name: 'Marguerite\'s kit bag',
      kind: 'physical',
      icon: 'Briefcase',
      description: 'A club kit bag, green, forty centimetres end to end. The Greywick Cup is sixty centimetres tall with handles wider than the bag\'s mouth. It does not fit. It does not nearly fit.',
      detail: 'Quill tried, with a cardboard mock-up, and emerged from the attempt looking hurt. "One cannot carry a bishop\'s hat in a lunchbox." The confession\'s third sentence dies here.',
    },
    {
      id: 'marguerite-phone',
      name: 'Marguerite\'s phone location',
      kind: 'digital',
      icon: 'Smartphone',
      description: 'Nia: Marguerite\'s phone sat on the same cell and the same home wifi from 11:02 PM to 7:10 AM. Step counter: zero between midnight and six.',
      detail: 'She handed it over herself, unlocked, without being asked, and watched Nia read it with the face of someone hoping to be disbelieved less. The phone says she was in bed in Saltmarsh Lane. The confession says she was in a trophy room. The phone has no reason to lie.',
    },
    {
      id: 'coach-alibi',
      name: 'Coach\'s hospital night',
      kind: 'document',
      icon: 'Hospital',
      description: 'St. Jude\'s: Dunstan Whitlock signed into the Coronary Care waiting room at 9:40 PM with his wife and did not leave until 6:05 AM. Night sister confirms; so does the vending machine, repeatedly.',
      detail: 'Of the three code-holders, the coach was eight miles away, fretting about an angiogram. Mrs Whitlock is fine. The coach has been told to stop shouting in corridors.',
    },
    {
      id: 'josef-phone',
      name: 'Josef\'s phone',
      kind: 'digital',
      icon: 'BatteryWarning',
      description: 'Josef\'s phone on the dorm charger: battery log shows it was powered off manually at 01:50 and back on at 02:50. The charger it was "on all night" was unplugged at the wall.',
      detail: 'Nia: "Phones that die on a charger don\'t die. Phones that are switched off by someone with a plan do." One hour of darkness, neatly bracketing seventeen minutes in the trophy room.',
    },
    {
      id: 'scrap-sale',
      name: 'Harker\'s Scrap receipt',
      kind: 'document',
      icon: 'Receipt',
      description: 'From Josef\'s locker: Harker\'s Scrap & Metal, Dunmere Road, 08:00 today—"2.1 kg sterling silver, cut, £1,340 cash, seller J. Lindqvist", with the yard\'s ID photo stapled on. The photo is Josef, biting a nail.',
      detail: 'Harker\'s opens at eight and photographs every seller by law. The Greywick Cup went in at six-forty in a holdall and came out as a receipt. The lid, Harker says, "had a nice shape"; he kept it. It is on its way back to the club in an evidence bag.',
    },
    {
      id: 'len-footsteps',
      name: 'Len\'s footsteps',
      kind: 'testimony',
      icon: 'Footprints',
      description: 'Len, napping in his shed by the slipway: light footsteps on the gravel around two, "trainers, not boots—quick, young feet", going towards the trophy room and back fifteen minutes or so later.',
      detail: 'Len has listened to rowers walk past his shed for thirty years. "Marguerite walks like she\'s late for something. These were lighter. Sneaky. Like someone who\'d been told off for creeping about and never learned."',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c15-marguerite',
        name: 'Marguerite Lindqvist',
        role: 'Club captain',
        age: 24,
        tagline: 'I did it. Write it down. Leave him alone.',
        personality: 'Proud, fiercely protective, honest in every matter but one.',
        quirk: 'Grips the edge of the table at the catch, as if it were a gunwale.',
        voice: 'Flat, rehearsed sentences when confessing; sharp and real when her brother is mentioned.',
        avatar: {
          skin: '#F1D2B6', hair: 'ponytail', hairColor: '#D9B86A', eyes: 'sharp', brows: 'flat', mouth: 'frown',
          accessory: 'none', facial: 'none', outfit: '#1F5A3A', accent: '#D8D8E0', age: 'young',
        },
      },
      relation: 'Club captain; one of three people given the new alarm code; walked in and confessed.',
      alibi: 'None offered—she says she was in the trophy room at two.',
      motive: 'She says: "the club owes me." She does not say it convincingly.',
      greeting: 'I\'ve already told the Chief Inspector. I\'ll tell you. I took the Cup. It\'s done. Can we get on with it?',
      statements: [
        {
          id: 's1',
          text: 'I did it. I came in through the trophy-room window—it\'s an old sash, it lifts if you know how. I\'ve known how since I was fifteen.',
          contradictedBy: 'window-paint',
          pressReply: 'Then—the door. I came through the door. Len paints things; I didn\'t know he\'d—it was the door. It doesn\'t matter how I got in.',
          wrongPressReply: 'That doesn\'t change how I got in. I got in. Next question.',
        },
        {
          id: 's2',
          text: 'I used the alarm code. Four-four-one-nine. Everyone\'s known it for years; it\'s on the whiteboard half the time.',
          contradictedBy: 'alarm-log',
          pressReply: 'I meant the new one. Dunstan gave it to me yesterday. Seven—seven-three—I know it, I just... I\'ve had no sleep. I meant the new one.',
          wrongPressReply: 'The code worked. The alarm didn\'t go off. What more do you want from a code?',
        },
        {
          id: 's3',
          text: 'I carried it out in my kit bag. Nobody looks at a rower with a kit bag at the river. I walked straight past Len\'s shed.',
          contradictedBy: 'kit-bag',
          pressReply: '... (She says nothing. For a long moment she looks past you at the door to the dorm, and her hands let go of the table.)',
          wrongPressReply: 'It went in the bag. It was heavy. That\'s all I\'m saying about the bag.',
        },
        {
          id: 's4',
          text: 'Leave Josef out of this. He\'s nineteen. He had nothing to do with it and he\'s got a seat in the eight next season and I\'m not having you take that off him for—leave him out of it.',
        },
      ],
      accusedWrong:
        'Yes. Good. Finally. Write it down—Marguerite Lindqvist, the Cup, two in the morning—and leave him alone. Please. That\'s all I\'ve asked for all day.',
    },
    {
      character: {
        id: 'c15-josef',
        name: 'Josef Lindqvist',
        role: 'Junior rower',
        age: 19,
        tagline: 'Sis says she did it. Who am I to argue.',
        personality: 'Cocky on the surface, frightened underneath, nineteen all the way through.',
        quirk: 'Bites his nails and then inspects them as if they belonged to someone else.',
        voice: 'Casual, shrugging, too many "like"s; goes quiet and young when the shrugging stops working.',
        avatar: {
          skin: '#F1D2B6', hair: 'wavy', hairColor: '#D9B86A', eyes: 'round', brows: 'worried', mouth: 'smirk',
          accessory: 'cap', facial: 'none', outfit: '#3A3A3A', accent: '#7FA896', age: 'young',
        },
      },
      relation: 'Marguerite\'s younger brother; junior rower; one of three people given the new alarm code.',
      alibi: 'Asleep in the boathouse dorm, phone on the charger.',
      motive: 'Debts to people who do not accept club subs as currency; three months behind on everything.',
      greeting: 'Look, she\'s said what she\'s said. I\'m not going to, like, argue with my own sister. Can I go? I\'ve got an erg session.',
      statements: [
        {
          id: 's1',
          text: 'Sis says she did it. Who am I to argue? She\'s the captain. She\'s always known what she\'s doing. I just row.',
        },
        {
          id: 's2',
          text: 'I was asleep in the dorm. Phone on the charger, out cold by midnight. First I heard was Coach shouting at six, which is how I hear most things.',
          contradictedBy: 'josef-phone',
          pressReply: 'It... died. The phone. It\'s old, the battery\'s rubbish, it—okay, it doesn\'t usually die on the charger. I don\'t know why it did. Maybe I knocked it.',
          wrongPressReply: 'That\'s nothing to do with me being asleep. I was asleep. Ask anyone. Ask—well, there was nobody else in the dorm. But I was.',
        },
        {
          id: 's3',
          text: 'Harker? Never heard of Harker. Is that a rower? I don\'t really know the Dunmere crews.',
          contradictedBy: 'scrap-sale',
          pressReply: '...He took a photo. I knew he\'d take a photo. I just—I needed it by nine or they were going to come to the boathouse, and I thought silver\'s silver, nobody\'d—it\'s a cup. It\'s just a cup. Isn\'t it?',
          wrongPressReply: 'I don\'t know any Harker. I don\'t know loads of people. That\'s not a crime.',
        },
      ],
      accusedWrong: 'Me? She confessed! She literally walked in and—look, I\'m nineteen, I\'m bow seat, I don\'t even have a—why would I—she said she did it.',
      accusedRight:
        'I owed people. Real people, not Tamsin. They gave me till nine and I had the code since yesterday morning on a sticky note in my pocket, so at two I switched my phone off, walked up past Len\'s shed and took it. It was so heavy. I cut it up at Harker\'s at eight and I was back for erg session by nine and I thought that was it. Then Marge found the empty plinth and looked at me once and went to the Bureau without a word. She didn\'t even ask me. She just knew, and she went.',
    },
    {
      character: {
        id: 'c15-dunstan',
        name: 'Coach Dunstan Whitlock',
        role: 'Head coach',
        age: 58,
        tagline: 'PULL! Sorry. Habit.',
        personality: 'Booming, warm, exhausted; loves his rowers like a man who has no volume control for it.',
        quirk: 'Shouts the ends of sentences without noticing.',
        voice: 'Loud, rhythmic, coaching metaphors; drops to a hoarse whisper for anything that actually hurts.',
        avatar: {
          skin: '#C9956B', hair: 'buzz', hairColor: '#8A8A8A', eyes: 'round', brows: 'thick', mouth: 'teeth',
          accessory: 'headset', facial: 'mustache', outfit: '#1F5A3A', accent: '#FFB347',
        },
      },
      relation: 'Changed the alarm code yesterday; gave it to himself, Marguerite and Josef.',
      alibi: 'At St. Jude\'s with his wife from 9:40 PM to 6:05 AM.',
      greeting: 'Detective! Sit DOWN—sorry. Sorry. Long night. The Cup\'s gone and my captain\'s saying things that aren\'t true in a voice like she\'s reading a race plan. Ask me anything.',
      statements: [
        {
          id: 's1',
          text: 'I changed the code at nine yesterday morning—some junior had left the old one on the whiteboard. New code to three people, on paper, by hand: me, Marguerite, Josef. My two keyholders. Nobody else. NOBODY—sorry.',
          revealOnRead: true,
          revealClueId: 'code-memo',
        },
        {
          id: 's2',
          text: 'Last night I was at St. Jude\'s with Barbara. Chest pains—hers, then nearly mine. Coronary Care waiting room, twenty to ten till six. The night sister asked me to stop shouting at the vending machine.',
          revealOnRead: true,
          revealClueId: 'coach-alibi',
        },
        {
          id: 's3',
          text: 'Marguerite could not have come through that window. She\'s rowed for me nine years; she\'s never once done anything the hard way when there was a door. And she\'d never say "four-four-one-nine" to me. She was the one who told me to change it.',
        },
      ],
      accusedWrong: 'I was eight miles away holding my wife\'s hand and SHOUTING at a—sorry. At a machine. Ask the night sister. She\'ll remember me.',
    },
    {
      character: {
        id: 'c15-tamsin',
        name: 'Tamsin Oyelaran-Beck',
        role: 'Club treasurer',
        age: 31,
        tagline: 'I suspect everyone. It saves time.',
        personality: 'Precise, sceptical, secretly fond of the people she audits.',
        quirk: 'Squares any object on the table to its edge before answering.',
        voice: 'Clipped, numerical, dry; qualifies statements with "for the record"; notices measurements.',
        avatar: {
          skin: '#6B3F2A', hair: 'braids', hairColor: '#1B1B1B', eyes: 'narrow', brows: 'arched', mouth: 'neutral',
          accessory: 'glasses', facial: 'none', outfit: '#2C3E50', accent: '#A8B0A0',
        },
      },
      relation: 'Keeps the club\'s books and the club\'s secrets; was never given the alarm code.',
      alibi: 'Home in Dunmere; her building\'s door log has her in at 10:15 PM and not out again.',
      greeting: 'Treasurer. For the record, I don\'t have the alarm code, I don\'t have a key, and I don\'t have a motive, which is a shame because I\'ve got a very good eye for other people\'s.',
      statements: [
        {
          id: 's1',
          text: 'I don\'t even have the code. Dunstan gives it to his "keyholders" and I get to find out when I ask what the alarm company\'s invoice is for. For the record, I\'ve complained.',
        },
        {
          id: 's2',
          text: 'She\'d never fit a sixty-centimetre cup in that bag. It\'s a forty-centimetre bag; I bought twelve of them in bulk last March and I\'ve got the invoice. Marguerite\'s confessing to a crime she didn\'t measure.',
        },
        {
          id: 's3',
          text: 'Josef\'s locker code is the club\'s founding year. It\'s on the plaque in the trophy room, and he\'s not imaginative. Three months behind on subs, and his sister paid them. For the record, I wrote that down at the time.',
        },
      ],
      accusedWrong: 'With no code, no key and a door log that puts me in Dunmere? For the record, you\'d need to improve your arithmetic before you accuse a treasurer.',
    },
    {
      character: {
        id: 'c15-len',
        name: '"Lucky" Len Garrity',
        role: 'Groundskeeper',
        age: 66,
        tagline: 'If it stands still, I paint it. If I sit still, I nap.',
        personality: 'Gentle, slow, observant in the way of men who have spent decades listening to a river.',
        quirk: 'Touches the brim of his cap "for luck" before anything he isn\'t sure of.',
        voice: 'Unhurried, rural, fond of "mind you" and "as it were"; precise about paint and footsteps.',
        avatar: {
          skin: '#E8C4A2', hair: 'bald', hairColor: '#DDDDDD', eyes: 'sleepy', brows: 'raised', mouth: 'smile',
          accessory: 'cap', facial: 'stubble', outfit: '#6B5A3A', accent: '#7FA896', age: 'old',
        },
      },
      relation: 'Has kept the grounds since 1994; painted the trophy-room window yesterday; naps in the shed by the slipway.',
      alibi: 'Asleep in his shed, which he regards as working.',
      greeting: 'Evening—morning, is it. Len. I painted that window, mind you, so if anyone says they came through it they\'re either lying or very thin. Cup of tea?',
      statements: [
        {
          id: 's1',
          text: 'I painted the trophy-room sash at three yesterday. Brilliant White, two coats, and I ran the brush into the join like I always do so the damp don\'t get in. That window\'s shut till somebody takes a knife to it, as it were.',
          revealOnRead: true,
          revealClueId: 'window-paint',
        },
        {
          id: 's2',
          text: 'I was in the shed with my eyes shut—resting \'em—and I heard footsteps on the gravel around two. Light ones. Trainers, not boots. Young feet, quick, going up to the trophy room. Back again a quarter-hour after, slower. Heavier, like.',
          revealOnRead: true,
          revealClueId: 'len-footsteps',
        },
        {
          id: 's3',
          text: 'Marguerite walks like she\'s late for a start. Always has, since she were a junior. These weren\'t hers. Mind you, I didn\'t look. I don\'t look at two in the morning. Bad luck.',
        },
      ],
      accusedWrong: 'Me? I\'ve not got the code, I\'ve not got the knees, and I\'d have had to climb through a window I\'d just painted. That\'d be unlucky, and I don\'t do unlucky.',
    },
  ],

  puzzles: [
    {
      type: 'code',
      id: 'josef-locker',
      title: 'Josef\'s locker',
      prompt:
        'Josef\'s locker in the boathouse is secured with a four-digit combination padlock. Tamsin, who notices everything, says his code is the club\'s founding year—"he\'s not imaginative." The brass plaque in the trophy room reads: "MARLOWE ROWING CLUB — Est. 1887 — Pull Together." Enter the combination.',
      inputLabel: 'Four-digit combination',
      answers: ['1887', 'one eight eight seven', 'eighteen eighty seven', 'eighteen eighty-seven'],
      hint: 'Read the plaque. Four digits, and the club has been pulling together since then.',
      explanation: 'The club was established in 1887, as the plaque says. The padlock opens on 1-8-8-7. Inside, under a tangle of lycra, is a receipt from Harker\'s Scrap & Metal with a photograph stapled to it.',
      revealClueId: 'scrap-sale',
    },
  ],

  hints: [
    'Take the confession one sentence at a time: the window, the code, the bag. Each has a physical fact that says otherwise.',
    'Three people were given the new code. The alarm log says it was used cleanly at 2:14. Find where each of the three was at that hour.',
    'Josef\'s phone was off for exactly an hour around two. Open his locker—Tamsin has told you the code—and see what he did with twelve kilos of silver by eight o\'clock.',
  ],

  culpritId: 'c15-josef',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Which detail breaks Marguerite\'s confession first?',
      options: [
        { id: 'a', text: 'She does not know where the trophy room is' },
        { id: 'b', text: 'She claims to have come through a window that Len painted shut at 3 PM' },
        { id: 'c', text: 'She was seen at The Hanged Man' },
        { id: 'd', text: 'She cannot lift twelve kilos' },
      ],
      correct: 'b',
      explanation: 'The sash was sealed under two coats of Brilliant White from three in the afternoon. Nobody came through it. The first sentence of the confession is impossible.',
    },
    {
      id: 'q2',
      prompt: 'Who could have disarmed the alarm at 2:14 AM?',
      options: [
        { id: 'a', text: 'Anyone—the old code was on the whiteboard' },
        { id: 'b', text: 'Tamsin, as treasurer' },
        { id: 'c', text: 'Only the three new-code holders; the coach was at St. Jude\'s and Marguerite\'s phone puts her at home—leaving Josef' },
        { id: 'd', text: 'Len, who has keys to everything' },
      ],
      correct: 'c',
      explanation: 'The alarm was disarmed with the code changed at 9 AM, given only to Dunstan, Marguerite and Josef. Dunstan was logged at St. Jude\'s all night; Marguerite\'s phone sat at home with zero steps. That leaves her brother.',
    },
    {
      id: 'q3',
      prompt: 'What ties Josef to the disposal of the Cup?',
      options: [
        { id: 'a', text: 'Harker\'s Scrap record: 2.1 kg of silver bought at 08:00 from "J. Lindqvist", with his ID photo' },
        { id: 'b', text: 'Silver polish on his hands' },
        { id: 'c', text: 'He was late for erg session' },
        { id: 'd', text: 'Tamsin saw him with a holdall' },
      ],
      correct: 'a',
      explanation: 'The receipt in his locker, with the yard\'s mandatory seller photograph, shows Josef selling cut sterling silver at eight this morning—two hours before his sister confessed.',
    },
    {
      id: 'q4',
      prompt: 'Why did Marguerite confess?',
      options: [
        { id: 'a', text: 'She wanted the insurance money' },
        { id: 'b', text: 'She was protecting her brother Josef' },
        { id: 'c', text: 'She has a grudge against the coach' },
        { id: 'd', text: 'She genuinely believed she had done it' },
      ],
      correct: 'b',
      explanation: 'She saw the empty plinth, looked once at her brother, and walked to the Bureau to put herself in front of him. Every wrong detail in her confession is a detail she didn\'t know because she wasn\'t there.',
    },
  ],

  solution: [
    'Marguerite Lindqvist\'s confession was fluent, detailed and wrong in every particular, because she was describing a crime she had not committed. She said she came through the window; Len had painted it shut at three the previous afternoon and the seal was unbroken. She said she used the old code, 4-4-1-9; the alarm was disarmed at 2:14 with the new one, 7-3-0-2, changed only that morning. She said she carried the Cup out in her kit bag; the bag is forty centimetres long and the Cup is sixty. Her own phone, which she handed over unasked, sat on her home wifi all night with no steps recorded.',
    'The alarm narrowed the field. Coach Whitlock changed the code at nine and gave it, on paper, to exactly three people: himself, Marguerite and Josef. The coach spent the night in the Coronary Care waiting room at St. Jude\'s with his wife, signed in at 9:40 PM and out at 6:05 AM. Marguerite was in bed in Saltmarsh Lane. That left a nineteen-year-old in the boathouse dorm whose phone, supposedly on the charger, had been switched off by hand at 1:50 and on again at 2:50.',
    'Len, resting his eyes in the shed by the slipway, heard light, quick footsteps in trainers go up to the trophy room around two and come back heavier a quarter of an hour later—not Marguerite\'s stride, which he has known for nine years. The alarm log says seventeen minutes inside. The plinth says the Cup was lifted cleanly by someone strong.',
    'Josef\'s locker opened on 1887, the founding year on the plaque, because as Tamsin says he is not imaginative. Inside was a receipt from Harker\'s Scrap on the Dunmere Road: 2.1 kilograms of cut sterling silver, £1,340 cash, seller "J. Lindqvist", with the yard\'s mandatory photograph of a boy biting his nails. He owed money to people who had given him until nine. He had the code on a sticky note since the morning before. He was back for erg session by nine.',
    'Marguerite found the empty plinth at six, looked once at her brother, and went to the Bureau without asking him a single question. Her confession was not a lie about the Cup; it was a lie about who she would rather lose. Otto has written that down too. The lid of the Greywick Cup, which Harker kept because it "had a nice shape", is coming home in an evidence bag.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. She confessed to a crime she\'d never seen, to save a boy who\'d never asked. People.', mood: 'sad' },
    { speaker: 'quill', text: 'A forty-centimetre bag and a sixty-centimetre cup. Love does not do arithmetic, Rookie. Thankfully, treasurers do.', mood: 'neutral' },
    { speaker: 'nia', text: 'Harker\'s kept the lid. Said it had "a nice shape". It\'s going back with a receipt, which I\'m told is the most Greywick sentence I\'ve ever typed.', mood: 'happy' },
    { speaker: 'hestia', text: 'Her file will be thin, dear, in the end. His won\'t. That\'s what she was trying to arrange, and she nearly managed it.', mood: 'sad' },
    { speaker: 'lucien', text: 'For once I have nothing clever to add. Don\'t tell anyone. I have a reputation to maintain and a pocket watch to polish.', mood: 'neutral' },
    { speaker: 'otto', text: 'The boy\'s nineteen with a debt and a sister. Magistrate, not a cell, if I\'ve any say. Rookie—you broke it gently. Good.', mood: 'neutral' },
    { speaker: 'you', text: 'Pull together.', mood: 'sad' },
  ],
};
