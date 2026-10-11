import type { CaseFile } from '../types';

/**
 * CASE 06 — "Intermission"  (medium)
 * A Stradivari-grade violin swapped for a replica during a twelve-minute interval.
 * Logic: the real violin isn't in the building → it left during intermission →
 * only one person left the building then, carrying a cello case → rosin traces seal it.
 */
export const case06: CaseFile = {
  id: 'case-06',
  number: 6,
  title: 'Intermission',
  difficulty: 'medium',
  tagline: 'Twelve minutes, one exit, and a violin that walked out in the wrong case.',
  location: 'Greywick Conservatory, Grand Hall',
  time: 'Intermission, 8:40 – 8:52 PM',
  crime: "Soloist Imogen Castellane's violin, the 'Marigold', was swapped for a fresh replica during the interval.",
  palette: { from: '#1B1030', to: '#3A1F4F', glow: '#F2B134' },

  briefing: [
    "The Greywick Conservatory does two things beautifully: Brahms, and gossip. Tonight it added a third. Two bars into Act II, soloist Imogen Castellane drew her bow and heard a wolf tone — a sour, howling note no instrument of hers has ever made. She stopped. Four hundred people in evening wear stopped with her. The violin in her hands was not the Marigold.",
    "The Marigold is a 1731 instrument worth more than the hall it was played in. Imogen left it on its stand in her dressing room at 8:40 for the interval, door closed, as she has done at every concert for eleven years. At 8:52 she picked it up again. Nobody saw anything, which in a building full of musicians means everybody saw everything and nobody is saying.",
    "You know one thing nobody else does, because Imogen told you on the stairs with her hands still shaking: she uses a custom rosin called Night Amber, dark as treacle, blended for her alone. Nobody else in the orchestra touches the stuff. Cellists in particular use light rosin — the dark kind makes a cello growl.",
    "Otto has given you four names: the conductor, the pianist, the principal cellist and the stage manager. The building has been locked since the house lights came up. Twelve minutes. One violin. Start with the stage door.",
  ],

  openingDialogue: [
    { speaker: 'otto', text: 'Hm. Violin. Old one. Swapped during the interval. Twelve minutes, Rookie.', mood: 'neutral' },
    { speaker: 'quill', text: 'A changeling in a velvet case! The replica still smells of varnish — our forger worked through the night. “Something is rotten in the state of… the woodwind section.”', mood: 'happy' },
    { speaker: 'nia', text: 'Stage door badge log is already in my inbox. Everyone who went in or out during the interval is on it. Fewer rows than you’d think.', mood: 'smug' },
    { speaker: 'hestia', text: 'Nia, dear, before you vanish into your screens — here, a scarf. Lilac, knitted it myself; I measured by eye while you were typing. Everyone gets one eventually.', mood: 'happy' },
    { speaker: 'nia', text: 'Mrs. Vane, I’m going to cry into a search warrant. Thank you.', mood: 'surprised' },
    { speaker: 'lucien', text: 'I was in the audience, incidentally. Row C. The wolf tone was in E flat, if that helps you, which it won’t.', mood: 'smug' },
    { speaker: 'otto', text: 'Four suspects. The building is sealed. Find where a violin goes when it isn’t anywhere.', mood: 'neutral' },
    { speaker: 'you', text: 'Starting with the door.', mood: 'thinking' },
  ],

  scenes: [
    {
      id: 'stage-door',
      name: 'Stage Door & Backstage Corridor',
      description: 'A brass-bound door, a bored security desk and a corridor hung with cue sheets. Somewhere a kettle is screaming.',
      palette: ['#1F1430', '#3B2A55', '#F2B134'],
      props: ['DoorOpen', 'ClipboardList', 'Headphones', 'Lightbulb', 'Cigarette'],
      hotspots: [
        {
          id: 'badge-reader',
          x: 18, y: 42,
          label: 'Stage door badge reader',
          clueId: 'stage-door-log',
        },
        {
          id: 'sm-desk',
          x: 52, y: 62,
          label: "Stage manager's desk headset",
          clueId: 'headset-log',
        },
        {
          id: 'kettle',
          x: 80, y: 30,
          label: 'Backstage kettle',
          flavor: 'The kettle has been boiling since the overture. Someone has written “NOT FOR ROSIN” on it in marker. You decide not to ask.',
        },
        {
          id: 'ashtray',
          x: 8, y: 78,
          label: 'Ashtray outside the stage door',
          flavor: 'Three cigarette ends. Two are the brand Kasimir smokes. The third is a lipstick-marked cigar. The Conservatory contains multitudes.',
        },
        {
          id: 'cue-sheet',
          x: 66, y: 22,
          label: 'Pinned cue sheet',
          flavor: '“Act II — Soloist re-enters 8:52 — DO NOT dim before the downbeat (again, Terrence).” Terrence has been underlined four times.',
        },
      ],
    },
    {
      id: 'orchestra-pit',
      name: 'Stage & Orchestra Pit',
      description: 'Music stands like skeletal birds, a grand piano with its lid propped, and a row of cello cases slumped against the pit wall.',
      palette: ['#120B1F', '#2C1A3F', '#D9A441'],
      props: ['Music', 'Piano', 'Music4', 'Mic', 'Theater'],
      hotspots: [
        {
          id: 'cello-case-hs',
          x: 72, y: 70,
          label: "Kasimir's cello case",
          clueId: 'cello-case',
        },
        {
          id: 'piano',
          x: 30, y: 55,
          label: 'Grand piano',
          flavor: "A Steinway with a cushion on the bench and a Thermos tucked inside the lid. The Thermos is labelled YEVGENIA — DO NOT. Just that. DO NOT.",
        },
        {
          id: 'conductor-podium',
          x: 50, y: 35,
          label: "Conductor's podium",
          flavor: 'A baton, a score, and a small tin of throat pastilles. The score has “SLOWER, you donkeys” pencilled over the second movement.',
        },
        {
          id: 'violin-stand',
          x: 14, y: 40,
          label: "Soloist's empty stand",
          flavor: 'Where the Marigold should sit. Nothing but a folded programme and a faint smell of rosin — dark, sweet, like burnt toffee.',
        },
      ],
    },
    {
      id: 'dressing-rooms',
      name: 'Dressing Rooms & Lockers',
      description: 'A warren of mirrors, dry-cleaning bags and lockers that lock when they feel like it. The soloist’s door still bears a gold star.',
      palette: ['#241533', '#4A2C5E', '#E8C170'],
      props: ['Lock', 'Shirt', 'Lightbulb', 'Mail', 'Frame'],
      hotspots: [
        {
          id: 'replica-hs',
          x: 25, y: 45,
          label: 'The replica violin',
          clueId: 'replica',
        },
        {
          id: 'kasimir-locker',
          x: 70, y: 50,
          label: "Kasimir's locker (ajar)",
          clueId: 'debt-letter',
        },
        {
          id: 'mirror-lights',
          x: 48, y: 25,
          label: 'Dressing-room mirror',
          flavor: 'Two bulbs are out. A sticky note reads “You are a professional. Act like one.” In a different hand underneath: “Says who?”',
        },
        {
          id: 'dry-cleaning',
          x: 88, y: 30,
          label: 'Rail of tailcoats',
          flavor: 'Eleven tailcoats, each labelled. Bram’s has a spare baton in the inside pocket. Yevgenia’s has a spare Yevgenia, in that it is immaculate and radiates disapproval.',
        },
        {
          id: 'star-door',
          x: 10, y: 70,
          label: "Imogen's dressing-room door",
          flavor: 'Gold star, slightly peeling. No lock. Eleven years of “nobody would dare” did the work of a bolt, until tonight.',
        },
      ],
    },
  ],

  clues: [
    {
      id: 'night-amber',
      name: 'Night Amber rosin',
      kind: 'testimony',
      initial: true,
      icon: 'Flame',
      description: "Imogen's custom rosin, blended for her alone: very dark, almost black, with a toffee smell. Nobody else in the orchestra uses it.",
      detail: 'Cellists use light, pale rosin — dark rosin makes a cello growl and squeak. Any dark rosin dust found somewhere other than the Marigold or its case has only one plausible source.',
    },
    {
      id: 'stage-door-log',
      name: 'Stage door badge log',
      kind: 'digital',
      icon: 'DoorOpen',
      description: 'The badge reader logs every exit and entry. During the interval: Bram Vandersloot badged into the green room at 8:41 and out at 8:50. Kasimir Dufresne badged OUT of the building at 8:43 (reason typed: “smoke”) and back IN at 8:51, carrying a cello case per the door camera still.',
      detail: 'Yevgenia Orlova never left the stage; the house camera shows her at the piano throughout. Ottilie Finch stayed backstage. Only one person left the building during the interval: Kasimir, with a cello case.',
    },
    {
      id: 'headset-log',
      name: 'Headset cue log',
      kind: 'digital',
      icon: 'Headphones',
      description: "The stage manager's headset records every call. Ottilie made cue calls at 8:42, 8:45, 8:48 and 8:51 — every three minutes, from the backstage desk.",
      detail: 'The calls are timestamped and voice-matched. Ottilie could not have been anywhere but backstage during the interval.',
    },
    {
      id: 'search',
      name: 'Building search',
      kind: 'testimony',
      icon: 'Search',
      description: 'Ottilie had the building sealed at 8:55 and searched every cupboard, case and flight-case with the crew. The Marigold is not inside the Conservatory.',
      detail: 'If the violin is not in the building, it left the building — and the only window in which it could have left is the interval, since Imogen had it on stage before and discovered the swap immediately after.',
    },
    {
      id: 'replica',
      name: 'The replica violin',
      kind: 'forensic',
      icon: 'Music',
      description: "Quill's first look: a competent copy of the Marigold, but the varnish is still tacky — it was finished within the last twenty-four hours. The interior label is a copy of the one in the insurance photographs.",
      detail: 'Those insurance photographs were circulated last month to the section principals and the conductor, so the forger — or whoever commissioned them — had access to that packet. That narrows things, but it does not name anyone on its own.',
    },
    {
      id: 'cello-case',
      name: "Kasimir's cello case",
      kind: 'physical',
      icon: 'Package',
      description: 'A battered cello case with a padded compartment in the lid — the kind meant for a bow and spares. The padding has been pressed into a smaller, violin-shaped hollow. There is dark rosin dust in the seams.',
      detail: 'Dark rosin. Cellists use light rosin; dark rosin would be useless to him. The dust is not from any cello.',
    },
    {
      id: 'rosin-match',
      name: 'Rosin analysis',
      kind: 'forensic',
      icon: 'FlaskConical',
      description: "Quill confirms it: the rosin dust in Kasimir's cello case is Night Amber — Imogen's custom blend. Nobody else in the building uses it.",
      detail: 'The Marigold, or at least its strings, was inside that case tonight.',
    },
    {
      id: 'debt-letter',
      name: "Bookmaker's letter",
      kind: 'document',
      icon: 'Mail',
      description: "A folded letter in Kasimir's locker from a Dunmere bookmaker called Fenn. It is polite in the way that frightens people: “Final reminder. Fourteen thousand by Friday, or we will discuss alternative instruments of settlement.”",
      detail: 'Dated this week. Whoever wrote it enjoys a pun and is owed a great deal of money.',
    },
    {
      id: 'ottilie-saw',
      name: "Ottilie's observation",
      kind: 'testimony',
      icon: 'Eye',
      description: 'Ottilie saw Kasimir leave by the stage door at the interval carrying his cello case, which she found odd: in three seasons he has never once taken the case out to smoke.',
      detail: 'A cellist does not take a cello for a cigarette. Unless the case contains something more portable.',
    },
  ],

  suspects: [
    {
      character: {
        id: 'c06-bram',
        name: 'Bram Vandersloot',
        role: 'Conductor',
        age: 55,
        tagline: 'The orchestra is an instrument. I merely play it.',
        personality: 'Imperious, grand, secretly terrified of silence.',
        quirk: 'Conducts the conversation with one finger when he thinks you are speaking too slowly.',
        voice: 'Booming, formal, sprinkles Dutch idioms translated literally (“Now the monkey comes out of the sleeve”).',
        avatar: {
          skin: '#F1D2B6', hair: 'wavy', hairColor: '#C9C2B6', eyes: 'sharp', brows: 'thick', mouth: 'frown',
          accessory: 'bowtie', facial: 'goatee', outfit: '#1A1A1A', accent: '#F2B134', age: 'adult',
        },
      },
      relation: 'Conductor of tonight’s concert; has worked with Imogen for a decade.',
      alibi: 'Alone in the green room from 8:41 to 8:50, “composing himself”.',
      motive: 'Imogen has publicly called his tempi “funereal”. Pride, but no plan.',
      greeting: 'Detective. You have come at the one moment of the evening when I am not needed. Speak.',
      statements: [
        {
          id: 's1',
          text: 'I was in the green room for twelve minutes, composing myself. Act II is Brahms. One does not walk into Brahms unprepared.',
        },
        {
          id: 's2',
          text: 'Kasimir? Reliable as a metronome. He arrives late, he leaves early, but on the beat he is always exactly where he should be.',
        },
        {
          id: 's3',
          text: 'I never touch another musician’s instrument. It is the one rule I have never broken. Now the monkey comes out of the sleeve — I do not even touch my own, it is a baton.',
        },
      ],
      accusedWrong: 'Me? I have conducted this orchestra for nine years and the only thing I have ever stolen is the audience’s breath. Go and find a real thief, and then I will give you a bow.',
    },
    {
      character: {
        id: 'c06-yevgenia',
        name: 'Yevgenia Orlova',
        role: 'Pianist',
        age: 34,
        tagline: 'I do not miss notes. Or details.',
        personality: 'Icy, exact, allergic to small talk.',
        quirk: 'Taps a silent scale on whatever surface is nearest while she listens.',
        voice: 'Short, dry, precise; sentences end like a door closing.',
        avatar: {
          skin: '#F6E3D1', hair: 'bun', hairColor: '#1F1A17', eyes: 'narrow', brows: 'flat', mouth: 'neutral',
          accessory: 'earring', facial: 'none', outfit: '#2B2B45', accent: '#9FB4FF', age: 'adult',
        },
      },
      relation: 'Accompanist; shares the stage with Imogen but not, by her own account, a friendship.',
      alibi: 'At the piano on stage throughout the interval, running scales.',
      greeting: 'You want facts. Good. I have no patience for the other thing.',
      statements: [
        {
          id: 's1',
          text: 'I was at the piano for the entire interval. Scales. Four hundred people watched me do it. Ask any of them.',
        },
        {
          id: 's2',
          text: 'The replica sounds like a cat in a bucket. Imogen noticed in two bars. I noticed in one.',
        },
        {
          id: 's3',
          text: 'Kasimir borrowed money from me in March. Three thousand. He has not repaid it. I mention this because you will find out anyway and I prefer to be the one who says it.',
        },
      ],
      accusedWrong: 'I was on a lit stage in front of four hundred witnesses playing a C-sharp minor scale. If I am your thief, I am also a magician, and I would be charging more.',
    },
    {
      character: {
        id: 'c06-kasimir',
        name: 'Kasimir Dufresne',
        role: 'Principal cellist',
        age: 29,
        tagline: 'Ha — sorry, nervous laugh. Where were we?',
        personality: 'Charming, quick, in debt up to his bow-arm; laughs when cornered.',
        quirk: 'Laughs a short “ha” at the end of any sentence he is not sure of.',
        voice: 'Warm, easy, a little too fast; peppers answers with “honestly” and “ha”.',
        avatar: {
          skin: '#B07A4F', hair: 'curly', hairColor: '#2B1F17', eyes: 'round', brows: 'arched', mouth: 'grin',
          accessory: 'tie', facial: 'stubble', outfit: '#5A2A3A', accent: '#F2B134', age: 'adult',
        },
      },
      relation: 'Principal cellist; sat two metres from Imogen all season.',
      alibi: 'Stepped outside for a cigarette during the interval, as he always does.',
      motive: 'Owes fourteen thousand to a Dunmere bookmaker, due Friday.',
      greeting: 'Detective! Terrible business. Honestly, I’d help any way I can — ha — what do you need?',
      statements: [
        {
          id: 's1',
          text: 'I stepped out for a cigarette at the interval, same as always. Everyone knows I do. The stage door practically opens itself for me.',
        },
        {
          id: 's2',
          text: 'Took my case with me — you never leave a cello unattended, ha. Not in a building full of violinists.',
        },
        {
          id: 's3',
          text: 'I’ve never touched the Marigold. Nobody has. Imogen guards it like a dragon — you’d lose a hand.',
          contradictedBy: 'cello-case',
          pressReply: 'Rosin dust gets everywhere in a pit! You brush past a stand, you — ha — honestly, you could find rosin in my sandwiches.',
          wrongPressReply: 'That’s… not really about me, is it? Ha. I mean, show me something with my name on it.',
          revealClueId: 'rosin-match',
        },
        {
          id: 's4',
          text: 'And before you ask — I don’t gamble anymore. Gave it up in the spring. Clean as a new string.',
          contradictedBy: 'debt-letter',
          pressReply: '…Fenn writes to a lot of people. He’s — ha — he’s very sociable. Fine. I owe him. That doesn’t make me a thief.',
          wrongPressReply: 'I don’t see what that has to do with my hobbies. Former hobbies. Ha.',
        },
      ],
      accusedWrong: 'Oh, come on. I was outside having a smoke — the door log will tell you that. You want the one who was alone in a room with a closed door. Not me, ha.',
      accusedRight: 'Fourteen thousand by Friday, Detective. Fenn doesn’t take instalments and he doesn’t take cellos. The Marigold is in a padded compartment in a hire car two streets away, and I hate myself about as much as you’d expect. Ha. No. Not really a “ha” moment, is it.',
    },
    {
      character: {
        id: 'c06-ottilie',
        name: 'Ottilie Finch',
        role: 'Stage manager',
        age: 41,
        tagline: 'Places, people!',
        personality: 'Brisk, kind, runs on cue sheets and cold tea.',
        quirk: 'Checks her headset is live before every sentence, even when talking to you.',
        voice: 'Clipped and practical, counts things out loud, calls everyone “love” or “people”.',
        avatar: {
          skin: '#E8B88A', hair: 'pixie', hairColor: '#8B3A1E', eyes: 'wide', brows: 'raised', mouth: 'smile',
          accessory: 'headset', facial: 'none', outfit: '#2F2F2F', accent: '#2EC4B6', age: 'adult',
        },
      },
      relation: 'Runs the backstage; the first to seal the building.',
      alibi: 'Backstage at the desk, making cue calls every three minutes.',
      greeting: 'Right — you’ve got six minutes before I need the crew back. Ask fast, love, I answer faster.',
      statements: [
        {
          id: 's1',
          text: 'I do cue calls every three minutes through the interval, on the headset, from the desk. Eight forty-two, forty-five, forty-eight, fifty-one. Like clockwork, because it is clockwork.',
        },
        {
          id: 's2',
          text: 'I saw Kasimir go out the stage door with his case, which — look, I didn’t think anything of it at the time, but he never takes the case out for a smoke. Three seasons. Never once.',
          revealOnRead: true,
          revealClueId: 'ottilie-saw',
        },
        {
          id: 's3',
          text: 'The moment Imogen stopped, I sealed the building and we searched every cupboard, every flight case, every loo. Nothing. That violin is not in this Conservatory, people.',
          revealOnRead: true,
          revealClueId: 'search',
        },
        {
          id: 's4',
          text: 'Imogen leaves the Marigold on the stand in her room every interval. Eleven years. No lock on that door — nobody ever dared. Well, somebody dared.',
        },
      ],
      accusedWrong: 'Love, I was on the headset every three minutes with sixty people listening. If I’d nicked a violin, I’d have called it as a cue. “Stand by, theft. Go, theft.” No.',
    },
  ],

  puzzles: [],

  hints: [
    'The Marigold is not in the building. So it left the building. When was the only time it could have left?',
    'Check the stage door log. Who left the Conservatory during the interval — and what were they carrying?',
    'A cellist uses light rosin. Look closely at the lid compartment of the cello case, then press Kasimir on whether he ever touched the Marigold.',
  ],

  culpritId: 'c06-kasimir',

  proveIt: [
    {
      id: 'q1',
      prompt: 'Why must the Marigold have left the building during the interval?',
      options: [
        { id: 'a', text: 'Because the building was searched and the Marigold was not inside — and the swap can only have happened between 8:40 and 8:52.' },
        { id: 'b', text: 'Because the replica’s varnish was tacky, so it must have been brought in from outside.' },
        { id: 'c', text: 'Because Bram was alone in the green room for twelve minutes.' },
        { id: 'd', text: 'Because Imogen heard the wolf tone in E flat, which only occurs outdoors.' },
      ],
      correct: 'a',
      explanation: 'Imogen played the Marigold in Act I and discovered the replica two bars into Act II. The swap happened during the interval. Ottilie’s search proves the real violin is not inside, so it left the building — during that same twelve-minute window.',
    },
    {
      id: 'q2',
      prompt: 'Who alone left the Conservatory during the interval?',
      options: [
        { id: 'a', text: 'Bram Vandersloot, to the green room.' },
        { id: 'b', text: 'Yevgenia Orlova, between scales.' },
        { id: 'c', text: 'Kasimir Dufresne, out the stage door at 8:43 with his cello case.' },
        { id: 'd', text: 'Ottilie Finch, to check the front of house.' },
      ],
      correct: 'c',
      explanation: 'The badge log shows only one exit from the building during the interval: Kasimir at 8:43, back at 8:51 — with a cello case he never normally takes out to smoke. Bram’s green room is inside the building; Yevgenia was on stage; Ottilie was on the headset every three minutes.',
    },
    {
      id: 'q3',
      prompt: 'What physically links Kasimir’s case to the Marigold?',
      options: [
        { id: 'a', text: 'The bookmaker’s letter folded in the lid.' },
        { id: 'b', text: 'Night Amber rosin — Imogen’s custom dark blend — in the lid compartment of his cello case.' },
        { id: 'c', text: 'A copy of the insurance photographs.' },
        { id: 'd', text: 'Yevgenia’s three thousand pounds.' },
      ],
      correct: 'b',
      explanation: 'Cellists use light rosin. The dust in the padded compartment of Kasimir’s case is Night Amber, which only Imogen uses — Quill confirmed the match. The Marigold rode out of the building in that case.',
    },
  ],

  solution: [
    'Start with what is missing. Imogen played the Marigold through Act I and discovered the replica two bars into Act II, so the swap happened during the twelve-minute interval. Ottilie sealed the building within minutes and searched it top to bottom: the violin is not inside. A violin that is not inside a sealed building left it — and the only time it could have left was during the interval.',
    'That turns a locked-room puzzle into a doorway puzzle. The stage door badge log shows exactly one person leaving the Conservatory between 8:40 and 8:52: Kasimir Dufresne, out at 8:43 “for a smoke”, back at 8:51. Bram’s green room is inside the building; Yevgenia never left the lit stage; Ottilie’s headset log places her at the desk every three minutes.',
    'Kasimir took his cello case with him — something Ottilie, who has watched him smoke for three seasons, had never seen him do. The case has a padded compartment in the lid pressed into a violin-shaped hollow, and dark rosin dust in the seams. Cellists use light rosin. Dark rosin in a cello case is wrong, and this particular dark rosin is Night Amber, Imogen’s private blend, as Quill confirmed. The Marigold was in that case.',
    'The replica tells you how it was planned: finished within a day, its label copied from the insurance photographs circulated to the section principals and the conductor — a packet Kasimir, as principal cellist, received. The bookmaker’s letter in his locker tells you why: fourteen thousand pounds by Friday, and Yevgenia’s unpaid three thousand says the spring “clean break” from gambling was a fiction.',
    'The Marigold was recovered from a hire car two streets away, in a padded compartment, perfectly in tune. Imogen finished Act II at 10:15 to a standing ovation. The orchestra will need a new principal cellist.',
  ],

  closingDialogue: [
    { speaker: 'otto', text: 'Hm. A cello case. Carried a violin. It’s almost elegant.', mood: 'neutral' },
    { speaker: 'quill', text: 'Night Amber, my dears — dark as a conscience and twice as sticky. The rosin never lies. It merely clings.', mood: 'happy' },
    { speaker: 'nia', text: 'Badge log, headset log, hire-car booking in his own name. The man committed a heist with a paper trail you could follow in the dark.', mood: 'smug' },
    { speaker: 'lucien', text: 'E flat, as I said. The wolf tone. I did say. Nobody wrote it down.', mood: 'smug' },
    { speaker: 'hestia', text: 'Imogen sent a card, dear — and a programme signed for Pip, who has already sat on it. Everything is filed.', mood: 'happy' },
    { speaker: 'pip', text: 'Mrrp.', mood: 'smug' },
    { speaker: 'otto', text: 'Good work, Rookie. Next time, try not to need the whole string section.', mood: 'happy' },
  ],
};
