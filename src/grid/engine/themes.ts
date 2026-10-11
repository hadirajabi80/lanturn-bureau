/**
 * Themes (room names, furniture pools, floors, palettes, title words) and the
 * season list for Floorplan Mysteries (docs/GRID-PLAN.md §5).
 *
 * v2: every district (src/grid/skins/districts.ts) names one theme here.
 * `SEASONS` is derived from DISTRICTS for compatibility with v1 screens.
 */
import type { Season, Theme } from '../types';
import { DISTRICTS } from '../skins/districts';

/** Extra soft tones so even 14×14 maps (up to 17 rooms) get distinct room colours. */
const EXTRA = ['#D5E4C3', '#F0CFD7', '#C6D4EA', '#E8DDB2', '#D6CAC0', '#C2E0DC', '#E4D0E8', '#D9E6CF', '#EAD3C3', '#CCD0DD'];

const WARM = ['#E8D5B0', '#D9D4CC', '#CDE5D3', '#F3D3BD', '#DDD2EA', '#E3C7A3', '#C9DAE3', '#EFE4C6'];

export const THEMES: Record<string, Theme> = {
  mansion: {
    id: 'mansion',
    name: 'Ashcombe Manor',
    roomNames: [
      'Library', 'Study', 'Kitchen', 'Dining Room', 'Ballroom', 'Conservatory', 'Billiard Room', 'Lounge',
      'Hall', 'Cellar', 'Gallery', 'Pantry', 'Bedroom', 'Bathroom', 'Music Room', 'Nursery', 'Attic', 'Parlour',
      'Smoking Room', 'Chapel',
    ],
    furniture: ['chair', 'armchair', 'sofa', 'rug', 'bed', 'table', 'desk', 'plant', 'piano', 'bookshelf',
      'fireplace', 'bathtub', 'lamp', 'cabinet', 'statue', 'globe', 'stool'],
    floors: ['wood', 'carpet', 'checker', 'marble', 'tile'],
    palette: [...WARM, ...EXTRA],
    titleWords: {
      a: ['Torn', 'Crooked', 'Silent', 'Borrowed', 'Final', 'Uninvited', 'Midnight', 'Forgotten', 'Gilded', 'Broken',
        'Last', 'Missing', 'Second', 'Locked', 'Quiet', 'Velvet', 'Hollow', 'Bitter', 'Faded', 'Unsigned', 'Cold', 'Wrong',
        'Candlelit', 'Sealed'],
      b: ['Receipt', 'Celebration', 'Inheritance', 'Visit Without Warning', 'End of the Music', 'Promotion Rumor',
        'Path of Voices', 'Toast', 'Portrait', 'Will', 'Candle', 'Waltz', 'Key', 'Letter', 'Guest', 'Dinner Bell',
        'Staircase', 'Wager', 'Telegram', 'Chandelier', 'Alibi', 'Footsteps', 'Heirloom', 'Clock'],
    },
  },
  market: {
    id: 'market',
    name: 'The Market',
    roomNames: [
      'Fish Stall', 'Fruit Stand', 'Bakery', 'Butcher', 'Town Square', 'Café', 'Back Alley', 'Flower Stall',
      'Warehouse', 'Loading Bay', 'Cheese Shop', 'Spice Stall', 'Fountain', 'Newsstand', 'Tailor', 'Pharmacy',
      'Dairy', 'Tea Shop',
    ],
    furniture: ['crate', 'barrel', 'bin', 'bananas', 'plant', 'stool', 'bench', 'counter', 'table', 'chair',
      'trolley', 'rug', 'lamp', 'fridge'],
    floors: ['stone', 'concrete', 'tile', 'wood', 'sand'],
    palette: ['#EAD9B5', '#D6D3CD', '#CBE4D2', '#F5D0B5', '#DCD3EC', '#E6CFA0', '#C8D8E0', '#F0E2C2', ...EXTRA],
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
    name: 'The Liner',
    roomNames: [
      'Deck', 'Bridge', 'Engine Room', 'Galley', 'Cabin', 'Ballroom', 'Promenade', 'Lifeboat Bay', 'Cargo Hold',
      "Captain's Quarters", 'Smoking Lounge', 'Pool', "Purser's Office", 'Radio Room', 'Dining Saloon', 'Infirmary',
      'Chart Room', 'Boiler Room',
    ],
    furniture: ['anchor', 'barrel', 'crate', 'suitcase', 'bench', 'chair', 'bed', 'table', 'lamp', 'plant', 'sofa',
      'stool', 'rug', 'trolley', 'armchair'],
    floors: ['deck', 'wood', 'carpet', 'tile', 'checker'],
    palette: ['#E6D6B3', '#D3D6D9', '#C9E3D8', '#F2D2BE', '#D9D3EB', '#E0C8A6', '#C3D7E4', '#EEE3CA', ...EXTRA],
    titleWords: {
      a: ['Drifting', 'Sunken', 'Midnight', 'Salted', 'Final', 'Uncharted', 'Foggy', 'Lost', 'Stowaway', 'Silent',
        'Broken', 'Last', 'Crooked', 'Rolling', 'Distant', 'Overboard', 'Second', 'Golden', 'Cold', 'Torn', 'Calm', 'Hidden'],
      b: ['Compass', 'Voyage', 'Lifeboat', 'Manifest', 'Horn', 'Porthole', 'Ticket', "Captain's Log", 'Tide',
        'End of the Music', 'Wake', 'Anchor', 'Telegram', 'Passenger', 'Cabin Key', 'Path of Voices', 'Toast',
        'Fog Bell', 'Lantern', 'Deck Chair', 'Signal', 'Crossing'],
    },
  },
  museum: {
    id: 'museum',
    name: 'Museum of Curiosities',
    roomNames: [
      'Egyptian Hall', 'Atrium', 'Gift Shop', 'Archive', 'Portrait Gallery', 'Sculpture Court', 'Fossil Wing',
      'Map Room', 'Restoration Lab', 'Vault', 'Lobby', 'Cloakroom', 'Observatory', 'Museum Café', "Curator's Office",
      'Armoury', 'Mineral Room', 'Clockwork Hall', 'Tapestry Room', 'Reading Room',
    ],
    furniture: ['statue', 'easel', 'coffin', 'globe', 'bench', 'plant', 'cabinet', 'safe', 'rug', 'desk', 'chair',
      'lamp', 'bookshelf', 'stool'],
    floors: ['marble', 'stone', 'wood', 'checker', 'carpet'],
    palette: ['#E9D7B2', '#DAD6CF', '#CFE4D4', '#F1D4C0', '#DED3E8', '#E2C9A5', '#CBD9E1', '#F0E6CC', ...EXTRA],
    titleWords: {
      a: ['Forged', 'Cracked', 'Ancient', 'Missing', 'Restored', 'Cursed', 'Gilded', 'Silent', 'Borrowed', 'Final',
        'Hidden', 'Dusty', 'Broken', 'Last', 'Stolen', 'Faded', 'Second', 'Painted', 'Unsigned', 'Marble', 'Crooked', 'Sealed',
        'Embalmed', 'Catalogued'],
      b: ['Portrait', 'Relic', 'Sarcophagus', 'Exhibit', 'Catalogue', 'Frame', 'Mask', 'Fossil', 'Brushstroke', 'Label',
        'Visit Without Warning', 'Pedestal', 'Map', 'Signature', 'Promotion Rumor', 'Acquisition', 'Night Shift',
        'Gala', 'Inventory', 'Crown', 'Path of Voices', 'Replica', 'Provenance', 'Display Case'],
    },
  },
  hotel: {
    id: 'hotel',
    name: 'The Gilded Meridian',
    roomNames: [
      'Lobby', 'Reception', 'Suite', 'Bar', 'Restaurant', 'Kitchen', 'Spa', 'Laundry', 'Ballroom', 'Elevator Hall',
      'Terrace', 'Pool', 'Gym', 'Concierge', 'Linen Room', 'Penthouse', 'Jazz Lounge', 'Cloakroom', 'Bridal Suite',
      'Wine Cellar',
    ],
    furniture: ['bed', 'sofa', 'armchair', 'chair', 'table', 'plant', 'lamp', 'bathtub', 'trolley', 'suitcase',
      'counter', 'rug', 'piano', 'fridge', 'bin', 'stool'],
    floors: ['carpet', 'marble', 'tile', 'wood', 'checker'],
    palette: ['#EBD8B7', '#D8D5D0', '#CCE6D5', '#F4D1BC', '#DFD4EC', '#E5CBA8', '#C7D9E5', '#F1E5C8', ...EXTRA],
    titleWords: {
      a: ['Late', 'Double', 'Do-Not-Disturb', 'Crooked', 'Midnight', 'Unpaid', 'Room-Service', 'Final', 'Golden',
        'Silent', 'Borrowed', 'Missing', 'Wrong', 'Last', 'Velvet', 'Spare', 'Second', 'Polished', 'Uninvited', 'Torn',
        'Quiet', 'Checked-Out', 'Gilded', 'Champagne'],
      b: ['Checkout', 'Room Key', 'Wake-Up Call', 'Celebration', 'Receipt', 'Reservation', 'Tip', 'Bellhop', 'Suite',
        'End of the Music', 'Elevator', 'Guestbook', 'Champagne', 'Promotion Rumor', 'Laundry Ticket', 'Toast',
        'Honeymoon', 'Pillow Mint', 'Visit Without Warning', 'Night Porter', 'Lost Luggage', 'Encore', 'Cufflink', 'Overture'],
    },
  },
  academy: {
    id: 'academy',
    name: 'Hollowmere Academy',
    roomNames: [
      'Great Hall', 'Library', 'Dormitory', 'Chemistry Lab', 'Observatory', 'Chapel', 'Classroom',
      "Headmaster's Office", 'Infirmary', 'Greenhouse', 'Refectory', 'Music Room', 'Common Room', 'Boathouse',
      'Fencing Hall', 'Bell Tower', 'Map Room', 'Art Studio', 'Debating Chamber', "Porter's Lodge",
    ],
    furniture: ['desk', 'chair', 'bookshelf', 'globe', 'bed', 'bench', 'plant', 'easel', 'piano', 'lamp', 'cabinet',
      'table', 'stool', 'rug'],
    floors: ['wood', 'stone', 'checker', 'carpet', 'grass'],
    palette: ['#E7D6B4', '#D7D3CE', '#CEE3D1', '#F2D5BF', '#DCD1E9', '#E1C8A4', '#C8D8E2', '#EEE4C9', ...EXTRA],
    titleWords: {
      a: ['Failed', 'Secret', 'Crooked', 'Unfinished', 'Midnight', 'Forbidden', 'Borrowed', 'Final', 'Silent', 'Lost',
        'Second', 'Hidden', 'Expelled', 'Last', 'Torn', 'Inked', 'Missing', "Prefect's", 'Quiet', 'Late', 'Copied', 'Sealed',
        'Gothic', 'Latin'],
      b: ['Exam', 'Detention', 'Report Card', 'Experiment', 'Lesson', 'Rowing Race', 'Recital', 'Bell', 'Homework',
        'Promotion Rumor', 'Scholarship', 'Prefect Badge', 'Path of Voices', 'Lantern', 'Chalkboard', 'Diary',
        'Curfew', 'Celebration', 'Visit Without Warning', 'Duel', 'Trophy', 'Notebook', 'Motto', 'Ledger'],
    },
  },
  docks: {
    id: 'docks',
    name: 'Harrow Point Docks',
    roomNames: [
      'Harbour Office', 'Customs House', 'Fish Market', 'Net Loft', 'Boathouse', 'Chandlery', 'Ropewalk', 'Ice House',
      'Coal Yard', 'Bonded Store', 'Dry Dock', "Harbourmaster's Office", 'Tavern', 'Smokehouse', 'Lamp Room',
      'Cooperage', 'Sail Loft', 'Tide Office', 'Cannery', 'Salt Shed',
    ],
    furniture: ['crate', 'barrel', 'anchor', 'bench', 'trolley', 'lamp', 'suitcase', 'stool', 'chair', 'table', 'bin',
      'counter', 'cabinet', 'safe', 'rug'],
    floors: ['deck', 'concrete', 'sand', 'stone', 'wood'],
    palette: ['#9FB9B3', '#B7C7B8', '#8FA9A8', '#C4B59A', '#A9BFC2', '#B2A58C', '#94B0AA', '#C9C2A8', '#A6B4A0',
      '#B9CBC9', '#9DAFB8', '#C2B8A3', '#ABC3B0', '#B5AE98', '#A0B7BF', '#C6CDBA', '#98A99F', '#BDB49F'],
    titleWords: {
      a: ['Drowned', 'Salted', 'Foggy', 'Rusted', 'Sunken', 'Midnight', 'Low-Tide', 'Silent', 'Tarred', 'Broken', 'Last',
        'Missing', 'Unmarked', 'Waterlogged', 'Cold', 'Grey', 'Drifting', 'Stolen', 'Knotted', 'Smuggled', 'Lost', 'Iron',
        'Bitter', 'Hollow'],
      b: ['Manifest', 'Tide Table', 'Lantern', 'Mooring', 'Cargo', 'Net', 'Ledger', 'Harpoon', 'Buoy', 'Ferry Ticket',
        'Fog Bell', 'Bilge', 'Gangplank', 'Shipment', 'Knot', 'Signal Flag', 'Crate', 'Rope', 'Watch', 'Wake',
        'Harbour Light', 'Keel', 'Salvage', 'Crossing'],
    },
  },
  neon: {
    id: 'neon',
    name: 'The Neon Quarter',
    roomNames: [
      'Noodle Bar', 'Arcade', 'Karaoke Booth', 'Pawn Shop', 'Night Market', 'Tattoo Parlour', 'Laundromat',
      'Pachinko Hall', 'Rooftop', 'Club Floor', 'Back Office', 'Ramen Stall', 'Record Store', 'Repair Shop',
      'Hostel Lobby', 'Bathhouse', 'Mahjong Den', 'Vending Nook', 'Cyber Café', 'Taxi Rank',
    ],
    furniture: ['counter', 'stool', 'bin', 'crate', 'trolley', 'lamp', 'plant', 'fridge', 'chair', 'bench', 'table',
      'sofa', 'rug', 'barrel', 'cabinet', 'safe'],
    floors: ['concrete', 'tile', 'checker', 'deck'],
    palette: ['#1B1630', '#221234', '#14202E', '#2A1426', '#18222A', '#24182E', '#1A1A30', '#20142A', '#162A2C',
      '#2C1A22', '#1E2436', '#281E34', '#13252A', '#2E1630', '#1C1E2A', '#24243A', '#1A2830', '#30182A'],
    titleWords: {
      a: ['Neon', 'Flickering', 'Rain-Soaked', 'Electric', 'Midnight', 'Static', 'Crooked', 'Burnt-Out', 'Borrowed',
        'Chrome', 'Counterfeit', 'Pink', 'Humming', 'Last', 'Silent', 'Wet', 'Broken', 'Faded', 'Encrypted', 'Stolen',
        'Restless', 'Hollow', 'Glitching', 'Late'],
      b: ['Signal', 'Receipt', 'Jukebox', 'Token', 'Umbrella', 'Taxi', 'Ticket', 'Blackout', 'Alibi', 'Hologram',
        'Payphone', 'Sign', 'Tip-Off', 'Debt', 'Polaroid', 'Noodle Order', 'Arcade Score', 'Mixtape', 'Password',
        'Rain Check', 'Pager', 'Night Shift', 'Last Call', 'Bet'],
    },
  },
  train: {
    id: 'train',
    name: 'The Midnight Express',
    roomNames: [
      'Dining Car', 'Lounge Car', 'Sleeper Car', 'Baggage Car', 'Observation Car', "Conductor's Cabin", 'Galley',
      'Smoking Car', 'Mail Car', 'Engine Room', 'First Class', 'Second Class', 'Bar Car', 'Library Car', 'Coal Tender',
      "Guard's Van", 'Parlour Car', 'Washroom', 'Linen Store', 'Vestibule',
    ],
    furniture: ['bench', 'suitcase', 'trolley', 'table', 'bed', 'lamp', 'chair', 'cabinet', 'armchair', 'sofa', 'rug',
      'counter', 'stool', 'bin', 'plant'],
    floors: ['carpet', 'wood', 'checker', 'tile'],
    palette: ['#5C2E2A', '#4A3A2A', '#2F3D3A', '#5A4430', '#3E2E3E', '#4D3328', '#334036', '#5E3A30', '#47302C',
      '#3A3A2E', '#523A36', '#2E3A40', '#4F3F2B', '#432B33', '#38443A', '#5A3226', '#3C3430', '#4B4032'],
    titleWords: {
      a: ['Midnight', 'Last', 'Express', 'Delayed', 'Unscheduled', 'Sleeping', 'Silent', 'Rattling', 'Final',
        'First-Class', 'Missing', 'Stolen', 'Crooked', 'Cold', 'Smoky', 'Overnight', 'Broken', 'Forgotten', 'Locked',
        'Borrowed', 'Velvet', 'Steaming', 'Lost', 'Wrong'],
      b: ['Ticket', 'Timetable', 'Whistle', 'Compartment', 'Connection', 'Carriage', 'Platform', 'Signal', 'Luggage Tag',
        'Stopover', 'Tunnel', 'Junction', 'Brake', 'Passenger', 'Berth', 'Conductor', 'Departure', 'Telegram',
        'Pocket Watch', 'Coupling', 'Lantern', 'Crossing', 'Waybill', 'Terminus'],
    },
  },
  observatory: {
    id: 'observatory',
    name: 'Frostmere Observatory',
    roomNames: [
      'Telescope Gallery', 'Star Chart Room', 'Library', 'Workshop', 'Darkroom', 'Instrument Store', 'Radio Room',
      'Mess Hall', 'Bunk Room', 'Boiler Room', 'Weather Station', 'Archive', 'Lecture Hall', 'Clock Room', 'Lens Room',
      "Director's Study", 'Map Room', 'Generator Room', 'Snow Porch', 'Infirmary',
    ],
    furniture: ['globe', 'desk', 'easel', 'bookshelf', 'lamp', 'chair', 'statue', 'cabinet', 'armchair', 'stool',
      'bench', 'rug', 'table', 'bed', 'safe', 'sofa'],
    floors: ['tile', 'concrete', 'marble', 'wood'],
    palette: ['#174A93', '#1A4F9C', '#15448A', '#1C55A6', '#16478F', '#1B5299', '#184C95', '#1D58AA', '#1A4A88',
      '#1F5CA8', '#14408A', '#2060B0', '#1B4E92', '#164C9A', '#1E549E', '#13468E', '#1C5AA2', '#19508F'],
    titleWords: {
      a: ['Frozen', 'Silent', 'Distant', 'Fallen', 'Dark', 'Polar', 'Eclipsed', 'Midnight', 'Crooked', 'Last', 'Cold',
        'Hidden', 'Wandering', 'Broken', 'Final', 'Missing', 'Pale', 'Lost', 'Shattered', 'Burning', 'Faint', 'Northern',
        'Unseen', 'Long'],
      b: ['Comet', 'Eclipse', 'Meridian', 'Lens', 'Star Chart', 'Equinox', 'Orbit', 'Logbook', 'Constellation', 'Aurora',
        'Telescope', 'Transit', 'Blizzard', 'Signal', 'Coordinates', 'Parallax', 'Calculation', 'Night Watch', 'Sextant',
        'Horizon', 'Nebula', 'Almanac', 'Dome', 'Zenith'],
    },
  },
  patisserie: {
    id: 'patisserie',
    name: 'Rosewater Patisserie',
    roomNames: [
      'Macaron Bar', 'Tea Garden', 'Icing Studio', 'Pantry of Sprinkles', 'Croissant Kitchen', 'Chocolate Room',
      'Meringue Parlour', 'Cake Vault', 'Petit Four Salon', 'Bakehouse', 'Sugar Loft', 'Jam Cellar', 'Window Display',
      'Candied Fruit Larder', 'Tasting Room', 'Cream Cellar', 'Fondant Workshop', 'Rose Terrace', 'Tea Counter',
      'Biscuit Tin Room',
    ],
    furniture: ['table', 'chair', 'counter', 'stool', 'plant', 'cabinet', 'fridge', 'rug', 'sofa', 'piano', 'armchair',
      'lamp', 'trolley', 'bench'],
    floors: ['checker', 'tile', 'wood', 'carpet'],
    palette: ['#F9D5E0', '#FCE3C8', '#E8D9F6', '#D6F0E3', '#FFF1C9', '#F7C9D4', '#DDEBFA', '#F5DCEB', '#E4F3D6',
      '#FBE0D2', '#EBDDF0', '#D9F2EE', '#FFE7A8', '#F2D1E6', '#E1E8FB', '#FAD9C4', '#E6F0C8', '#F6E2F2'],
    titleWords: {
      a: ['Vanishing', 'Crumbled', 'Sugared', 'Missing', 'Glazed', 'Last', 'Burnt', 'Whipped', 'Secret', 'Candied',
        'Forgotten', 'Pink', 'Poisoned', 'Borrowed', 'Sticky', 'Sweetest', 'Bitter', 'Half-Eaten', 'Frosted', 'Golden',
        'Midnight', 'Stolen', 'Lopsided', 'Rosewater'],
      b: ['Éclair', 'Macaron', 'Soufflé', 'Recipe', 'Wedding Cake', 'Tea Party', 'Sprinkle', 'Teaspoon', 'Meringue',
        'Rolling Pin', 'Cherry', 'Bonbon', 'Croissant', 'Petit Four', 'Sugar Cube', 'Icing Bag', 'Truffle', 'Tart',
        'Biscuit Tin', 'Cake Stand', 'Scone', 'Order Book', 'Piping Nozzle', 'Bake-Off'],
    },
  },
  boutique: {
    id: 'boutique',
    name: 'Lavender & Lace Boutique',
    roomNames: [
      'Fitting Room', 'Perfume Salon', 'Ribbon Atelier', 'Pearl Vault', 'Hat Parlour', 'Shoe Gallery', 'Silk Room',
      'Glove Counter', 'Lace Studio', 'Bridal Salon', 'Button Library', 'Powder Room', 'Velvet Lounge', 'Stockroom',
      'Mirror Room', 'Embroidery Loft', 'Scarf Nook', 'Window Display', 'Tea Alcove', 'Pattern Archive',
    ],
    furniture: ['armchair', 'sofa', 'rug', 'statue', 'cabinet', 'lamp', 'plant', 'suitcase', 'easel', 'bathtub', 'chair',
      'stool', 'table', 'counter', 'safe'],
    floors: ['carpet', 'marble', 'wood', 'checker'],
    palette: ['#E6D8F5', '#F6D9E6', '#DCEAF7', '#F4E6D8', '#E9F2DF', '#EFD5F0', '#D8E4F2', '#F8E8EE', '#E0DDF8',
      '#F3DCD2', '#DDF0EA', '#F1E2F7', '#E5E0D0', '#F9D8E2', '#D9E8E0', '#EADCF0', '#F4EBD9', '#DCD6EE'],
    titleWords: {
      a: ['Pearl', 'Lavender', 'Unpicked', 'Missing', 'Silken', 'Borrowed', 'Last', 'Velvet', 'Secret', 'Perfumed',
        'Tangled', 'Lost', 'Forgotten', 'Embroidered', 'Ribboned', 'Torn', 'Whispered', 'Hidden', 'Powdered', 'Midnight',
        'Crooked', 'Unsent', 'Gilded', 'Lacy'],
      b: ['Petticoat', 'Pearl Necklace', 'Hatpin', 'Fitting', 'Perfume Bottle', 'Ribbon', 'Hem', 'Glove', 'Veil',
        'Thimble', 'Button', 'Mirror', 'Corsage', 'Locket', 'Silk Scarf', 'Receipt', 'Bridal Gown', 'Pattern',
        'Measuring Tape', 'Lace Collar', 'Hatbox', 'Compact', 'Brooch', 'Window Display'],
    },
  },
  carnival: {
    id: 'carnival',
    name: 'Cotton Candy Pier',
    roomNames: [
      'Carousel', 'Candy Floss Stall', 'Hall of Mirrors', 'Ring Toss', 'Ferris Wheel Gate', 'Fortune Teller',
      'Toffee Apple Cart', 'Ticket Booth', 'Coconut Shy', 'Helter Skelter', 'Arcade Tent', 'Bandstand', 'Ice Cream Kiosk',
      'Duck Pond', 'Puppet Theatre', 'Prize Tent', 'Lemonade Stand', 'Bumper Cars', 'Ghost Train', 'Photo Booth',
    ],
    furniture: ['bench', 'stool', 'counter', 'trolley', 'crate', 'plant', 'barrel', 'lamp', 'statue', 'rug', 'chair',
      'bin', 'table', 'fridge'],
    floors: ['deck', 'checker', 'sand', 'tile'],
    palette: ['#FFD1E8', '#CDEBFF', '#FFF0B3', '#D9F7D6', '#E8D6FF', '#FFD9C2', '#C9F1F0', '#FFE0F0', '#E2F5C4',
      '#FCD7D7', '#D7E3FF', '#FFF5CC', '#D2F4E4', '#F3D1FF', '#FFE4CC', '#CCEEFF', '#F9F0C8', '#E9DDFB'],
    titleWords: {
      a: ['Carousel', 'Spun-Sugar', 'Missing', 'Rigged', 'Toffee', 'Last', 'Painted', 'Lucky', 'Crooked', 'Midnight',
        'Sticky', 'Prize-Winning', 'Secret', 'Spinning', 'Lost', 'Golden', 'Haunted', 'Forgotten', 'Pink', 'Wobbly',
        'Borrowed', 'Silent', 'Merry', 'Bright'],
      b: ['Confession', 'Ticket', 'Teddy Bear', 'Balloon', 'Candy Floss', 'Coconut', 'Fortune', 'Ring Toss', 'Prize',
        'Mirror', 'Ferris Wheel', 'Toffee Apple', 'Goldfish', 'Lollipop', 'Bumper Car', 'Puppet', 'Ice Cream', 'Whistle',
        'Hoopla', 'Rosette', 'Tightrope', 'Calliope', 'Lantern', 'Last Ride'],
    },
  },
};

/**
 * Names for rooms with a structural role in a layout (hallways, piers, alleys,
 * central halls). Used before the ordinary room-name pool; generic fallbacks
 * apply when a theme has none (or runs out) for a role.
 */
export type RoomRole = 'room' | 'corridor' | 'hall' | 'pier' | 'alley' | 'center';

export const ROLE_NAMES: Record<string, Partial<Record<RoomRole, string[]>>> = {
  hotel: { corridor: ['Grand Corridor', 'Gilded Hallway', 'Mirror Corridor'], hall: ['Grand Foyer', 'Atrium'], center: ['Palm Court'] },
  docks: { pier: ['North Pier', 'South Pier', 'Old Jetty', 'Slipway'], alley: ['Quay Lane', 'Fish Row'], center: ['Quayside'] },
  museum: { hall: ['Grand Hall', 'Rotunda', 'Central Gallery'], corridor: ['Long Gallery'], center: ['Rotunda'] },
  neon: {
    alley: ['Back Alley', 'Neon Alley', 'Rain Lane', 'Noodle Row', 'Side Street', 'Underpass', 'Arcade Lane', 'Lantern Lane'],
    corridor: ['Neon Strip'], center: ['Crossing'],
  },
  academy: { center: ['Courtyard', 'Quad', 'Cloister Garth'], corridor: ['Cloister Walk'], hall: ['Great Hall'] },
  train: { corridor: ['Side Corridor'], hall: ['Vestibule'] },
  observatory: { center: ['Telescope Dome', 'Great Dome'], corridor: ['Ring Corridor'], hall: ['Rotunda'] },
  mansion: { corridor: ['Long Gallery', 'Hallway'], hall: ['Great Hall', 'Entrance Hall'], center: ['Courtyard'] },
  patisserie: { corridor: ['Sugar Corridor'], hall: ['Grand Tea Hall'], center: ['Rose Courtyard'], alley: ['Cinnamon Lane'] },
  boutique: { corridor: ['Lace Arcade', 'Ribbon Walk', 'Mirror Hallway'], hall: ['Grand Salon'], center: ['Atrium'] },
  carnival: {
    alley: ['Boardwalk', 'Sideshow Alley', 'Midway', 'Lantern Walk', 'Toffee Lane', 'Balloon Row', 'Pier Promenade', 'Sweet Street'],
    pier: ['Pier End', 'Jetty'], center: ['Big Top'], corridor: ['Midway'],
  },
};

export const GENERIC_ROLE_NAMES: Record<RoomRole, string[]> = {
  room: [],
  corridor: ['Corridor', 'Hallway', 'Passage'],
  hall: ['Central Hall', 'Hall', 'Foyer'],
  pier: ['Pier', 'Jetty', 'Landing'],
  alley: ['Alley', 'Lane', 'Passage', 'Side Street', 'Backstreet', 'Cut-Through', 'Yard', 'Arcade'],
  center: ['Courtyard', 'Central Room', 'Atrium'],
};

/** Old v1 season ids → v2 district ids. */
export const LEGACY_SEASON_IDS: Record<string, string> = {
  files: 'ashcombe', files2: 'harrow', files3: 'meridian', files4: 'curiosities', files5: 'neon', academy: 'hollowmere',
};

/** Seasons = districts (v1 compatibility shape). Daily/weekly/custom cases use pseudo season ids and are not listed. */
export const SEASONS: Season[] = DISTRICTS.map((d) => ({
  id: d.id,
  name: d.name,
  subtitle: d.kicker,
  themeId: d.themeId,
  casesPerTier: d.casesPerTier.easy,
  accent: d.palette.accent,
  icon: d.icon,
}));

/** Theme rotation for the Daily Case (one per district). */
export const DAILY_THEMES: string[] = DISTRICTS.map((d) => d.themeId);
