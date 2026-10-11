/**
 * Themes (room names, furniture pools, floors, palettes, title words) and the
 * season list for Crime Files (docs/GRID-PLAN.md §5).
 */
import type { Season, Theme } from '../types';

/** Warm flat-illustration palettes: tans, greys, mint, peach, lilac. 8 distinct colours each. */
const WARM = ['#E8D5B0', '#D9D4CC', '#CDE5D3', '#F3D3BD', '#DDD2EA', '#E3C7A3', '#C9DAE3', '#EFE4C6'];

export const THEMES: Record<string, Theme> = {
  mansion: {
    id: 'mansion',
    name: 'Crime Files',
    roomNames: [
      'Library', 'Study', 'Kitchen', 'Dining Room', 'Ballroom', 'Conservatory', 'Billiard Room', 'Lounge',
      'Hall', 'Cellar', 'Gallery', 'Pantry', 'Bedroom', 'Bathroom', 'Music Room', 'Nursery', 'Attic', 'Parlour',
    ],
    furniture: ['chair', 'armchair', 'sofa', 'rug', 'bed', 'table', 'desk', 'plant', 'piano', 'bookshelf',
      'fireplace', 'bathtub', 'lamp', 'cabinet', 'statue', 'globe', 'stool'],
    floors: ['wood', 'carpet', 'checker', 'marble', 'tile'],
    palette: WARM,
    titleWords: {
      a: ['Torn', 'Crooked', 'Silent', 'Borrowed', 'Final', 'Uninvited', 'Midnight', 'Forgotten', 'Gilded', 'Broken',
        'Last', 'Missing', 'Second', 'Locked', 'Quiet', 'Velvet', 'Hollow', 'Bitter', 'Faded', 'Unsigned', 'Cold', 'Wrong'],
      b: ['Receipt', 'Celebration', 'Inheritance', 'Visit Without Warning', 'End of the Music', 'Promotion Rumor',
        'Path of Voices', 'Toast', 'Portrait', 'Will', 'Candle', 'Waltz', 'Key', 'Letter', 'Guest', 'Dinner Bell',
        'Staircase', 'Wager', 'Telegram', 'Chandelier', 'Alibi', 'Footsteps'],
    },
  },
  market: {
    id: 'market',
    name: 'Crime Files 2',
    roomNames: [
      'Fish Stall', 'Fruit Stand', 'Bakery', 'Butcher', 'Town Square', 'Café', 'Back Alley', 'Flower Stall',
      'Warehouse', 'Loading Bay', 'Cheese Shop', 'Spice Stall', 'Fountain', 'Newsstand', 'Tailor', 'Pharmacy',
    ],
    furniture: ['crate', 'barrel', 'bin', 'bananas', 'plant', 'stool', 'bench', 'counter', 'table', 'chair',
      'trolley', 'rug', 'lamp', 'fridge'],
    floors: ['stone', 'concrete', 'tile', 'wood', 'sand'],
    palette: ['#EAD9B5', '#D6D3CD', '#CBE4D2', '#F5D0B5', '#DCD3EC', '#E6CFA0', '#C8D8E0', '#F0E2C2'],
    titleWords: {
      a: ['Spoiled', 'Crooked', 'Short', 'Counterfeit', 'Early', 'Bruised', 'Rival', 'Unpaid', 'Stolen', 'Rotten',
        'Lucky', 'Missing', 'Haggled', 'Second', 'Torn', 'Sour', 'Last', 'Weighted', 'Busy', 'Empty', 'Market-Day', 'Rusty'],
      b: ['Receipt', 'Scale', 'Bargain', 'Delivery', 'Price Tag', 'Apron', 'Coin', 'Basket', 'Ledger', 'Rumor',
        'Visit Without Warning', 'Lemon', 'Closing Bell', 'Handshake', 'Crate', 'Awning', 'Change', 'Recipe',
        'Promotion Rumor', 'Stall', 'Shortcut', 'Ticket'],
    },
  },
  liner: {
    id: 'liner',
    name: 'Crime Files 3',
    roomNames: [
      'Deck', 'Bridge', 'Engine Room', 'Galley', 'Cabin', 'Ballroom', 'Promenade', 'Lifeboat Bay', 'Cargo Hold',
      "Captain's Quarters", 'Smoking Lounge', 'Pool', "Purser's Office", 'Radio Room', 'Dining Saloon', 'Infirmary',
    ],
    furniture: ['anchor', 'barrel', 'crate', 'suitcase', 'bench', 'chair', 'bed', 'table', 'lamp', 'plant', 'sofa',
      'stool', 'rug', 'trolley', 'armchair'],
    floors: ['deck', 'wood', 'carpet', 'tile', 'checker'],
    palette: ['#E6D6B3', '#D3D6D9', '#C9E3D8', '#F2D2BE', '#D9D3EB', '#E0C8A6', '#C3D7E4', '#EEE3CA'],
    titleWords: {
      a: ['Drifting', 'Sunken', 'Midnight', 'Salted', 'Final', 'Uncharted', 'Foggy', 'Lost', 'Stowaway', 'Silent',
        'Broken', 'Last', 'Crooked', 'Rolling', 'Distant', 'Overboard', 'Second', 'Golden', 'Cold', 'Torn', 'Calm', 'Hidden'],
      b: ['Compass', 'Voyage', 'Lifeboat', 'Manifest', 'Horn', 'Porthole', 'Ticket', 'Captain\'s Log', 'Tide',
        'End of the Music', 'Wake', 'Anchor', 'Telegram', 'Passenger', 'Cabin Key', 'Path of Voices', 'Toast',
        'Fog Bell', 'Lantern', 'Deck Chair', 'Signal', 'Crossing'],
    },
  },
  museum: {
    id: 'museum',
    name: 'Crime Files 4',
    roomNames: [
      'Egyptian Hall', 'Atrium', 'Gift Shop', 'Archive', 'Portrait Gallery', 'Sculpture Court', 'Fossil Wing',
      'Map Room', 'Restoration Lab', 'Vault', 'Lobby', 'Cloakroom', 'Observatory', 'Museum Café', "Curator's Office",
      'Armoury',
    ],
    furniture: ['statue', 'easel', 'coffin', 'globe', 'bench', 'plant', 'cabinet', 'safe', 'rug', 'desk', 'chair',
      'lamp', 'bookshelf', 'stool'],
    floors: ['marble', 'stone', 'wood', 'checker', 'carpet'],
    palette: ['#E9D7B2', '#DAD6CF', '#CFE4D4', '#F1D4C0', '#DED3E8', '#E2C9A5', '#CBD9E1', '#F0E6CC'],
    titleWords: {
      a: ['Forged', 'Cracked', 'Ancient', 'Missing', 'Restored', 'Cursed', 'Gilded', 'Silent', 'Borrowed', 'Final',
        'Hidden', 'Dusty', 'Broken', 'Last', 'Stolen', 'Faded', 'Second', 'Painted', 'Unsigned', 'Marble', 'Crooked', 'Sealed'],
      b: ['Portrait', 'Relic', 'Sarcophagus', 'Exhibit', 'Catalogue', 'Frame', 'Mask', 'Fossil', 'Brushstroke', 'Label',
        'Visit Without Warning', 'Pedestal', 'Map', 'Signature', 'Promotion Rumor', 'Acquisition', 'Night Shift',
        'Gala', 'Inventory', 'Crown', 'Path of Voices', 'Replica'],
    },
  },
  hotel: {
    id: 'hotel',
    name: 'Crime Files 5',
    roomNames: [
      'Lobby', 'Reception', 'Suite', 'Bar', 'Restaurant', 'Kitchen', 'Spa', 'Laundry', 'Ballroom', 'Elevator Hall',
      'Terrace', 'Pool', 'Gym', 'Concierge', 'Linen Room', 'Penthouse',
    ],
    furniture: ['bed', 'sofa', 'armchair', 'chair', 'table', 'plant', 'lamp', 'bathtub', 'trolley', 'suitcase',
      'counter', 'rug', 'piano', 'fridge', 'bin', 'stool'],
    floors: ['carpet', 'marble', 'tile', 'wood', 'checker'],
    palette: ['#EBD8B7', '#D8D5D0', '#CCE6D5', '#F4D1BC', '#DFD4EC', '#E5CBA8', '#C7D9E5', '#F1E5C8'],
    titleWords: {
      a: ['Late', 'Double', 'Do-Not-Disturb', 'Crooked', 'Midnight', 'Unpaid', 'Room-Service', 'Final', 'Golden',
        'Silent', 'Borrowed', 'Missing', 'Wrong', 'Last', 'Velvet', 'Spare', 'Second', 'Polished', 'Uninvited', 'Torn',
        'Quiet', 'Checked-Out'],
      b: ['Checkout', 'Room Key', 'Wake-Up Call', 'Celebration', 'Receipt', 'Reservation', 'Tip', 'Bellhop', 'Suite',
        'End of the Music', 'Elevator', 'Guestbook', 'Champagne', 'Promotion Rumor', 'Laundry Ticket', 'Toast',
        'Honeymoon', 'Pillow Mint', 'Visit Without Warning', 'Night Porter', 'Lost Luggage', 'Encore'],
    },
  },
  academy: {
    id: 'academy',
    name: 'Hollowmere Academy',
    roomNames: [
      'Great Hall', 'Library', 'Dormitory', 'Chemistry Lab', 'Observatory', 'Courtyard', 'Chapel', 'Classroom',
      "Headmaster's Office", 'Infirmary', 'Greenhouse', 'Refectory', 'Music Room', 'Common Room', 'Boathouse',
      'Fencing Hall',
    ],
    furniture: ['desk', 'chair', 'bookshelf', 'globe', 'bed', 'bench', 'plant', 'easel', 'piano', 'lamp', 'cabinet',
      'table', 'stool', 'rug'],
    floors: ['wood', 'stone', 'checker', 'carpet', 'grass'],
    palette: ['#E7D6B4', '#D7D3CE', '#CEE3D1', '#F2D5BF', '#DCD1E9', '#E1C8A4', '#C8D8E2', '#EEE4C9'],
    titleWords: {
      a: ['Failed', 'Secret', 'Crooked', 'Unfinished', 'Midnight', 'Forbidden', 'Borrowed', 'Final', 'Silent', 'Lost',
        'Second', 'Hidden', 'Expelled', 'Last', 'Torn', 'Inked', 'Missing', 'Prefect\'s', 'Quiet', 'Late', 'Copied', 'Sealed'],
      b: ['Exam', 'Detention', 'Report Card', 'Experiment', 'Lesson', 'Rowing Race', 'Recital', 'Bell', 'Homework',
        'Promotion Rumor', 'Scholarship', 'Prefect Badge', 'Path of Voices', 'Lantern', 'Chalkboard', 'Diary',
        'Curfew', 'Celebration', 'Visit Without Warning', 'Duel', 'Trophy', 'Notebook'],
    },
  },
};

/** Seasons (GRID-PLAN §5). Daily cases use the pseudo season id 'daily' and are not listed here. */
export const SEASONS: Season[] = [
  { id: 'files', name: 'Crime Files', subtitle: 'Murder at Ashcombe Manor', themeId: 'mansion', casesPerTier: 40, accent: '#E07A3F', icon: 'Castle' },
  { id: 'files2', name: 'Crime Files 2', subtitle: 'Trouble at the Market', themeId: 'market', casesPerTier: 40, accent: '#4FA36C', icon: 'Store' },
  { id: 'files3', name: 'Crime Files 3', subtitle: 'Death on the Meridian', themeId: 'liner', casesPerTier: 40, accent: '#3C7FB8', icon: 'Ship' },
  { id: 'files4', name: 'Crime Files 4', subtitle: 'After Hours at the Halloran', themeId: 'museum', casesPerTier: 40, accent: '#9B6BC4', icon: 'Landmark' },
  { id: 'files5', name: 'Crime Files 5', subtitle: 'The Grand Belvedere Hotel', themeId: 'hotel', casesPerTier: 40, accent: '#C8973A', icon: 'Hotel' },
  { id: 'academy', name: 'Hollowmere Academy', subtitle: 'A special season — free for all detectives', themeId: 'academy', casesPerTier: 10, accent: '#B8484F', icon: 'GraduationCap' },
];

/** Theme rotation for the Daily Case. */
export const DAILY_THEMES = ['mansion', 'market', 'liner', 'museum', 'hotel', 'academy'] as const;
