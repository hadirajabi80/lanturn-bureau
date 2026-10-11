import type { District } from './types';

/**
 * The eleven districts of Greywick. Each is a building with its own art direction,
 * room-carving layout, wall/sheet style, palette and ambience. ids are the engine seasonIds.
 * 30 cases per tier + 10 Mastermind = 130 cases per district, 1,430 total (11 districts; IX–XI are bright 'light'-mood districts).
 */
const PER_TIER = { easy: 30, medium: 30, hard: 30, extreme: 30, mastermind: 10 } as const;

export const DISTRICTS: District[] = [
  {
    id: 'ashcombe', number: 1, name: 'Ashcombe Manor', kicker: 'District I · The Old Quarter',
    blurb: 'Forty rooms, one family, and a will nobody has read aloud yet.',
    themeId: 'mansion', layout: 'organic', wall: 'ink', sheet: 'parchment',
    floors: ['wood', 'carpet', 'checker', 'stone'],
    furniture: ['armchair', 'sofa', 'fireplace', 'piano', 'bookshelf', 'table', 'rug', 'plant', 'globe'],
    palette: {
      bg: '#120E0B', panel: '#1E1813', ink: '#F1E6D2', muted: '#A8977D', accent: '#C9974A', accent2: '#E7C27D', danger: '#B5402F',
      sheet: '#E9DCC0', wall: '#2B2017', rooms: ['#D9C29A', '#C9B08A', '#BFA98C', '#D8C7A6', '#C7A981', '#B9A07D', '#DCCFB4', '#CDB38E'], glow: '#FFB347',
    },
    facade: { shape: 'manor', floors: 4, windowsPerFloor: 9 },
    ambience: 'clock', icon: 'Castle', casesPerTier: PER_TIER,
  },
  {
    id: 'harrow', number: 2, name: 'Harrow Point Docks', kicker: 'District II · The Waterfront',
    blurb: 'Fog, rope and salt. The tide brings things in and takes things out.',
    themeId: 'docks', layout: 'docks', wall: 'rope', sheet: 'nautical',
    floors: ['deck', 'concrete', 'sand', 'stone'],
    furniture: ['crate', 'barrel', 'anchor', 'bench', 'trolley', 'lamp', 'suitcase', 'stool'],
    palette: {
      bg: '#071318', panel: '#0E2129', ink: '#E3EEF0', muted: '#86A3AB', accent: '#3FB6B2', accent2: '#E0B64F', danger: '#D2543F',
      sheet: '#C9D6CF', wall: '#3A2A1C', rooms: ['#9FB9B3', '#B7C7B8', '#8FA9A8', '#C4B59A', '#A9BFC2', '#B2A58C', '#94B0AA', '#C9C2A8'], glow: '#5FE3D8',
    },
    facade: { shape: 'lighthouse', floors: 6, windowsPerFloor: 4 },
    ambience: 'waves', icon: 'Anchor', casesPerTier: PER_TIER,
  },
  {
    id: 'meridian', number: 3, name: 'The Gilded Meridian', kicker: 'District III · Grand Avenue',
    blurb: 'An Art-Deco palace where every guest has a reservation and a reason.',
    themeId: 'hotel', layout: 'corridor', wall: 'deco', sheet: 'lacquer',
    floors: ['marble', 'carpet', 'checker', 'tile'],
    furniture: ['bed', 'armchair', 'suitcase', 'trolley', 'lamp', 'piano', 'counter', 'plant', 'bathtub'],
    palette: {
      bg: '#0A0A0C', panel: '#16151A', ink: '#F3EBD8', muted: '#9C927C', accent: '#D4AF37', accent2: '#F2D98B', danger: '#C23B4B',
      sheet: '#1C1B21', wall: '#D4AF37', rooms: ['#2C3A3A', '#3A2C34', '#2E2E40', '#3B352A', '#263434', '#3A2B2B', '#30303C', '#2F3A30'], glow: '#F2D98B',
    },
    facade: { shape: 'tower', floors: 8, windowsPerFloor: 5 },
    ambience: 'jazz', icon: 'Hotel', casesPerTier: PER_TIER,
  },
  {
    id: 'curiosities', number: 4, name: 'Museum of Curiosities', kicker: 'District IV · Museum Row',
    blurb: 'Every exhibit has a provenance. Some of them are even true.',
    themeId: 'museum', layout: 'wings', wall: 'marble', sheet: 'gallery',
    floors: ['marble', 'stone', 'wood', 'checker'],
    furniture: ['statue', 'easel', 'globe', 'cabinet', 'bench', 'safe', 'coffin', 'plant'],
    palette: {
      bg: '#0D1018', panel: '#161B27', ink: '#EEF0F5', muted: '#8D96AB', accent: '#7C8CF0', accent2: '#E3C38A', danger: '#C9485B',
      sheet: '#E7E5E0', wall: '#B9B3A8', rooms: ['#DCD8CF', '#CFCAD6', '#D6D0C2', '#C9D0D6', '#E0D6C9', '#CCD3C6', '#D8CCD2', '#D0CEC4'], glow: '#9FB0FF',
    },
    facade: { shape: 'museum', floors: 3, windowsPerFloor: 7 },
    ambience: 'hush', icon: 'Landmark', casesPerTier: PER_TIER,
  },
  {
    id: 'neon', number: 5, name: 'The Neon Quarter', kicker: 'District V · After Midnight',
    blurb: 'Rain on hot asphalt, noodle steam and a city that never forgets a face.',
    themeId: 'neon', layout: 'blocks', wall: 'neon', sheet: 'wet-asphalt',
    floors: ['concrete', 'tile', 'checker', 'deck'],
    furniture: ['counter', 'stool', 'bin', 'crate', 'trolley', 'lamp', 'plant', 'fridge'],
    palette: {
      bg: '#06040D', panel: '#100B1E', ink: '#F2ECFF', muted: '#8E82B3', accent: '#FF3EA5', accent2: '#2CF5E6', danger: '#FF5A3C',
      sheet: '#0E0C17', wall: '#2CF5E6', rooms: ['#1B1630', '#221234', '#14202E', '#2A1426', '#18222A', '#24182E', '#1A1A30', '#20142A'], glow: '#FF3EA5',
    },
    facade: { shape: 'skyline', floors: 7, windowsPerFloor: 8 },
    ambience: 'rain', icon: 'Zap', casesPerTier: PER_TIER,
  },
  {
    id: 'hollowmere', number: 6, name: 'Hollowmere Academy', kicker: 'District VI · The Gothic Hill',
    blurb: 'Latin mottos, locked libraries, and a headmaster who keeps a ledger.',
    themeId: 'academy', layout: 'courtyard', wall: 'chalk', sheet: 'chalkboard',
    floors: ['wood', 'stone', 'grass', 'carpet'],
    furniture: ['desk', 'bookshelf', 'globe', 'easel', 'bench', 'chair', 'lamp', 'piano'],
    palette: {
      bg: '#0A110D', panel: '#14201A', ink: '#EAF1E4', muted: '#93A68E', accent: '#E8C25B', accent2: '#B7E39A', danger: '#D2614A',
      sheet: '#24392E', wall: '#EFEFE6', rooms: ['#2E4A3B', '#34503F', '#2B4436', '#3A5444', '#30483A', '#36503E', '#2C4638', '#3B5647'], glow: '#E8C25B',
    },
    facade: { shape: 'gothic', floors: 4, windowsPerFloor: 7 },
    ambience: 'bells', icon: 'GraduationCap', casesPerTier: PER_TIER,
  },
  {
    id: 'express', number: 7, name: 'The Midnight Express', kicker: 'District VII · Platform Nine',
    blurb: 'Eleven carriages, one locked compartment, and no stops until dawn.',
    themeId: 'train', layout: 'carriages', wall: 'steel', sheet: 'brushed-steel',
    floors: ['carpet', 'wood', 'checker', 'tile'],
    furniture: ['bench', 'suitcase', 'trolley', 'table', 'bed', 'lamp', 'chair', 'cabinet'],
    palette: {
      bg: '#0E0B0A', panel: '#1C1614', ink: '#F4E9E1', muted: '#A4928A', accent: '#C2563B', accent2: '#E6B972', danger: '#E04848',
      sheet: '#3A3533', wall: '#8D8580', rooms: ['#5C2E2A', '#4A3A2A', '#2F3D3A', '#5A4430', '#3E2E3E', '#4D3328', '#334036', '#5E3A30'], glow: '#FFC77A',
    },
    facade: { shape: 'train', floors: 2, windowsPerFloor: 11 },
    ambience: 'rails', icon: 'TrainFront', casesPerTier: PER_TIER,
  },
  {
    id: 'frostmere', number: 8, name: 'Frostmere Observatory', kicker: 'District VIII · The Far North',
    blurb: 'Snowed in under the stars. The telescope saw everything. The staff saw less.',
    themeId: 'observatory', layout: 'rings', wall: 'blueprint', sheet: 'blueprint',
    floors: ['tile', 'concrete', 'marble', 'wood'],
    furniture: ['globe', 'desk', 'easel', 'bookshelf', 'lamp', 'chair', 'statue', 'cabinet'],
    palette: {
      bg: '#050B17', panel: '#0C1730', ink: '#E6F0FF', muted: '#7F94BF', accent: '#5AA9FF', accent2: '#FFFFFF', danger: '#FF6B6B',
      sheet: '#123A7A', wall: '#E6F0FF', rooms: ['#174A93', '#1A4F9C', '#15448A', '#1C55A6', '#16478F', '#1B5299', '#184C95', '#1D58AA'], glow: '#9FD0FF',
    },
    facade: { shape: 'dome', floors: 3, windowsPerFloor: 6 },
    ambience: 'wind', icon: 'Telescope', casesPerTier: PER_TIER,
  },
  {
    id: 'rosewater', number: 9, name: 'Rosewater Patisserie', kicker: 'District IX · Sugar Lane', mood: 'light',
    blurb: 'Macarons in every colour, a tea garden in bloom, and a cake that went missing before the party.',
    themeId: 'patisserie', layout: 'organic', wall: 'ribbon', sheet: 'gingham',
    floors: ['checker', 'tile', 'wood', 'grass'],
    furniture: ['table', 'chair', 'counter', 'stool', 'plant', 'cabinet', 'fridge', 'rug', 'sofa', 'piano'],
    palette: {
      bg: '#FFF1F5', panel: '#FFFFFF', ink: '#4A2433', muted: '#A07484', accent: '#FF6FA3', accent2: '#FFC857', danger: '#E5484D',
      sheet: '#FFE6EE', wall: '#F78FB3', rooms: ['#FFD6E5', '#FFE9D6', '#E3F6E5', '#FDF3C7', '#EADCFF', '#D9F0FF', '#FFDDEE', '#F6EBDD'], glow: '#FFB3D1',
    },
    facade: { shape: 'cottage', floors: 3, windowsPerFloor: 5 },
    ambience: 'musicbox', icon: 'Cake', casesPerTier: PER_TIER,
  },
  {
    id: 'lacewing', number: 10, name: 'Lavender & Lace Boutique', kicker: 'District X · Petal Row', mood: 'light',
    blurb: 'Silk, pearls and perfume. The fitting rooms keep secrets better than the seamstresses do.',
    themeId: 'boutique', layout: 'corridor', wall: 'lace', sheet: 'watercolor',
    floors: ['carpet', 'marble', 'wood', 'checker'],
    furniture: ['armchair', 'sofa', 'rug', 'statue', 'cabinet', 'lamp', 'plant', 'suitcase', 'easel', 'bathtub'],
    palette: {
      bg: '#F7F1FF', panel: '#FFFFFF', ink: '#3B2A55', muted: '#8E7FAE', accent: '#A77BFF', accent2: '#FF9EC7', danger: '#E0475B',
      sheet: '#FCF8FF', wall: '#C9A8FF', rooms: ['#EBDDFF', '#FFE1F0', '#DDF3F0', '#FFF0D9', '#E3E9FF', '#F7DDF7', '#E6F7DD', '#FDE7E7'], glow: '#D9C2FF',
    },
    facade: { shape: 'boutique', floors: 3, windowsPerFloor: 4 },
    ambience: 'harp', icon: 'Gem', casesPerTier: PER_TIER,
  },
  {
    id: 'candyfloss', number: 11, name: 'Cotton Candy Pier', kicker: 'District XI · The Boardwalk', mood: 'light',
    blurb: 'Carousel music, sticky fingers and a prize goldfish that saw everything.',
    themeId: 'carnival', layout: 'blocks', wall: 'candy', sheet: 'confetti',
    floors: ['deck', 'sand', 'grass', 'checker'],
    furniture: ['bench', 'stool', 'counter', 'trolley', 'crate', 'plant', 'barrel', 'lamp', 'statue', 'rug'],
    palette: {
      bg: '#EEFFF9', panel: '#FFFFFF', ink: '#23395B', muted: '#6E86A8', accent: '#FF5DA2', accent2: '#3EC6FF', danger: '#FF4D4D',
      sheet: '#E6FFF6', wall: '#FF7EB6', rooms: ['#FFD3E8', '#C9F2FF', '#FFF3B0', '#D7FFD9', '#E5D4FF', '#FFE0C2', '#CFF7EE', '#FFD9F4'], glow: '#FFE066',
    },
    facade: { shape: 'carnival', floors: 2, windowsPerFloor: 8 },
    ambience: 'calliope', icon: 'FerrisWheel', casesPerTier: PER_TIER,
  },
];

export const DISTRICT_BY_ID: Record<string, District> = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));
export const getDistrict = (id: string): District | undefined => DISTRICT_BY_ID[id];

/** Display info for tiers (internal ids unchanged). */
export const TIER_INFO = {
  easy: { name: 'Rookie', floor: 'Ground floor', blurb: 'Small plans, plain sentences.', sizes: '4×4 – 5×5' },
  medium: { name: 'Detective', floor: 'First floor', blurb: 'More rooms, more furniture, first relations.', sizes: '5×5 – 7×7' },
  hard: { name: 'Inspector', floor: 'Second floor', blurb: 'Diagonals, sight lines, and one liar from case 16.', sizes: '7×7 – 9×9' },
  extreme: { name: 'Chief', floor: 'Third floor', blurb: 'Big plans. Liars. Double homicides from case 16.', sizes: '9×9 – 12×12' },
  mastermind: { name: 'Mastermind', floor: 'The roof', blurb: 'Two bodies, one liar, fourteen rooms. Good luck.', sizes: '12×12 – 14×14' },
} as const;
