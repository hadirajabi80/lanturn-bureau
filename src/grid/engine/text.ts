/**
 * Clue prose (docs/GRID-PLAN.md §4). Every predicate has 2–3 phrasings; the
 * choice is seeded so a puzzle always reads the same. Rows/columns are 1-based
 * in prose with "top row / bottom row / left column / right column" at edges.
 */
import type { FurnitureKind, KillerRule, Person, Predicate, Room, Variant } from '../types';
import { FURNITURE_LABEL, KILLER_RULE_TEXT } from '../types';
import { hashSeed } from './rng';

/** What the text layer needs to know about a puzzle. `Puzzle` satisfies it. */
export interface TextCtx {
  rows: number;
  cols: number;
  rooms: Room[];
  people: Person[];
  seed?: number;
}

interface Pron { He: string; he: string; him: string; his: string; His: string; himself: string }

export function pronouns(person: { pronoun: 'he' | 'she' }): Pron {
  return person.pronoun === 'he'
    ? { He: 'He', he: 'he', him: 'him', his: 'his', His: 'His', himself: 'himself' }
    : { He: 'She', he: 'she', him: 'her', his: 'her', His: 'Her', himself: 'herself' };
}

const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
export const numberWord = (n: number): string => NUM[n] ?? String(n);

export const rowLabel = (i: number, rows: number): string =>
  i === 0 ? 'the top row' : i === rows - 1 ? 'the bottom row' : `row ${i + 1}`;
export const colLabel = (i: number, cols: number): string =>
  i === 0 ? 'the left column' : i === cols - 1 ? 'the right column' : `column ${i + 1}`;

/** "chair", "bananas" — the label without its article. */
export const furnitureNoun = (k: FurnitureKind): string => FURNITURE_LABEL[k].a.replace(/^(a|an|some) /, '');

const SEATS = new Set<FurnitureKind>(['chair', 'armchair', 'sofa', 'stool', 'bench']);

/** "on a chair" / "in a bathtub" */
function onPhrase(k: FurnitureKind): string {
  return k === 'bathtub' ? 'in a bathtub' : `on ${FURNITURE_LABEL[k].a}`;
}
function onPhraseAlt(k: FurnitureKind): string {
  if (SEATS.has(k)) return `sitting on ${FURNITURE_LABEL[k].a}`;
  if (k === 'bed') return 'lying on a bed';
  if (k === 'bathtub') return 'sitting in a bathtub';
  return `standing on ${FURNITURE_LABEL[k].a}`;
}

interface Env {
  S: string;           // sentence subject: "He", "She"
  p: Pron;
  name: (id: string) => string;
  room: (id: string) => string;
  rows: number;
  cols: number;
  sizes: number[];
}

/** The phrase that follows "was" — used for the primary phrasing, victim clues and `or`. */
function fragment(pr: Predicate, e: Env): string {
  switch (pr.type) {
    case 'inRoom': return `in the ${e.room(pr.roomId)}`;
    case 'notInRoom': return `not in the ${e.room(pr.roomId)}`;
    case 'onFurniture': return onPhrase(pr.kind);
    case 'notOnFurniture': return `not ${onPhrase(pr.kind)}`;
    case 'onAnyFurniture': return 'on a piece of furniture';
    case 'onNoFurniture': return 'not on any furniture';
    case 'besideFurniture': return `beside ${FURNITURE_LABEL[pr.kind].a}`;
    case 'notBesideFurniture': return `not beside any ${furnitureNoun(pr.kind)}`;
    case 'besideAnyFurniture': return 'beside a piece of furniture';
    case 'notBesideAnyFurniture': return 'not beside any furniture';
    case 'row': return `in ${rowLabel(pr.index, e.rows)}`;
    case 'notRow': return `not in ${rowLabel(pr.index, e.rows)}`;
    case 'col': return `in ${colLabel(pr.index, e.cols)}`;
    case 'notCol': return `not in ${colLabel(pr.index, e.cols)}`;
    case 'corner': return pr.value ? 'in a corner' : 'not in a corner';
    case 'edge': return pr.value ? 'on the edge of the map' : 'not on the edge of the map';
    case 'sameRoomAs': return `in the same room as ${e.name(pr.personId)}`;
    case 'differentRoomFrom': return `not in the same room as ${e.name(pr.personId)}`;
    case 'besidePerson': return `diagonally beside ${e.name(pr.personId)}`;
    case 'notBesidePerson': return `not diagonally beside ${e.name(pr.personId)}`;
    case 'sameRowAs': return `in the same row as ${e.name(pr.personId)}`;
    case 'sameColAs': return `in the same column as ${e.name(pr.personId)}`;
    case 'dirOf': return `somewhere ${pr.dir} of ${e.name(pr.personId)}`;
    case 'directlyDirOf':
      return `directly ${pr.dir} of ${e.name(pr.personId)}, in the same ${pr.dir === 'north' || pr.dir === 'south' ? 'column' : 'row'}`;
    case 'distance': {
      const w = numberWord(pr.n), X = e.name(pr.personId);
      return pr.cmp === 'exactly' ? `exactly ${w} steps from ${X}`
        : pr.cmp === 'atMost' ? `no more than ${w} steps from ${X}` : `at least ${w} steps away from ${X}`;
    }
    case 'lineOfSight': return pr.value ? `in plain view of ${e.name(pr.personId)}` : `out of ${e.name(pr.personId)}'s sight`;
    case 'between': return `between ${e.name(pr.a)} and ${e.name(pr.b)}`;
    case 'aloneInRoom': return `alone in ${e.p.his} room`;
    case 'roomCount': {
      const w = numberWord(pr.n);
      return pr.cmp === 'exactly' ? `one of exactly ${w} people in ${e.p.his} room`
        : pr.cmp === 'atLeast' ? `one of at least ${w} people in ${e.p.his} room`
          : `in a room with no more than ${w} people, counting ${e.p.himself}`;
    }
    case 'roomHasFurniture':
      return pr.value ? `in a room with ${FURNITURE_LABEL[pr.kind].a}` : `in a room without any ${FURNITURE_LABEL[pr.kind].plural}`;
    case 'roomSizeCmp': {
      const max = Math.max(...e.sizes), min = Math.min(...e.sizes);
      if (pr.cmp === 'exactly' && pr.n === max) return 'in the largest room';
      if (pr.cmp === 'exactly' && pr.n === min) return 'in the smallest room';
      const w = numberWord(pr.n);
      return pr.cmp === 'exactly' ? `in a room of exactly ${w} squares`
        : pr.cmp === 'atLeast' ? `in a room of at least ${w} squares` : `in a room of at most ${w} squares`;
    }
    case 'or': return `either ${fragment(pr.a, e)} or ${fragment(pr.b, e)}`;
    case 'not': return `not ${fragment(pr.p, e)}`;
  }
}

/** All phrasings for a predicate (first = primary). */
function variants(pr: Predicate, e: Env): string[] {
  const { S, p } = e;
  const was = (f: string): string => `${S} was ${f}.`;
  const primary = was(fragment(pr, e));
  switch (pr.type) {
    case 'inRoom': return [primary, was(`somewhere in the ${e.room(pr.roomId)}`), `${S} spent the evening in the ${e.room(pr.roomId)}.`];
    case 'notInRoom': return [primary, `${S} never set foot in the ${e.room(pr.roomId)}.`, `${S} stayed out of the ${e.room(pr.roomId)}.`];
    case 'onFurniture': return [primary, was(onPhraseAlt(pr.kind))];
    case 'notOnFurniture': return [primary, was(`not ${onPhraseAlt(pr.kind)}`)];
    case 'onAnyFurniture': return [primary, was('sitting or standing on some furniture')];
    case 'onNoFurniture': return [primary, `${S} was standing on the bare floor.`];
    case 'besideFurniture': return [primary, was(`right next to ${FURNITURE_LABEL[pr.kind].a}`)];
    case 'notBesideFurniture': return [primary, `There were no ${FURNITURE_LABEL[pr.kind].plural} next to ${p.him}.`];
    case 'besideAnyFurniture': return [primary, was('right next to some furniture')];
    case 'notBesideAnyFurniture': return [primary, `There was no furniture next to ${p.him}.`];
    case 'row': return [primary, was(`somewhere in ${rowLabel(pr.index, e.rows)}`)];
    case 'notRow': return [primary, `${S} was nowhere in ${rowLabel(pr.index, e.rows)}.`];
    case 'col': return [primary, was(`somewhere in ${colLabel(pr.index, e.cols)}`)];
    case 'notCol': return [primary, `${S} was nowhere in ${colLabel(pr.index, e.cols)}.`];
    case 'corner': return pr.value
      ? [primary, was('tucked into a corner of the map')]
      : [primary, `${S} was not in any of the four corners.`];
    case 'edge': return pr.value
      ? [primary, was('somewhere along the outer edge of the map')]
      : [primary, was('away from the outer edge of the map')];
    case 'sameRoomAs': return [primary, `${S} shared a room with ${e.name(pr.personId)}.`];
    case 'differentRoomFrom': return [primary, `${S} and ${e.name(pr.personId)} were in different rooms.`];
    case 'besidePerson': return [primary, `${S} and ${e.name(pr.personId)} were diagonal neighbours.`];
    case 'notBesidePerson': return [primary, was(`not touching ${e.name(pr.personId)}, not even diagonally`)];
    case 'sameRowAs': return [primary, `${S} and ${e.name(pr.personId)} were in the same row.`];
    case 'sameColAs': return [primary, `${S} and ${e.name(pr.personId)} were in the same column.`];
    case 'dirOf': return [primary, was(`further ${pr.dir} than ${e.name(pr.personId)}`)];
    case 'directlyDirOf': {
      const line = pr.dir === 'north' || pr.dir === 'south' ? 'column' : 'row';
      return [primary, `${S} was due ${pr.dir} of ${e.name(pr.personId)}, somewhere in the same ${line}.`];
    }
    case 'distance': {
      const w = numberWord(pr.n), X = e.name(pr.personId);
      if (pr.cmp === 'exactly') return [primary, `${S} and ${X} were exactly ${w} steps apart.`];
      if (pr.cmp === 'atMost') return [primary, was(`within ${w} steps of ${X}`)];
      return [primary, `${S} and ${X} were ${w} or more steps apart.`];
    }
    case 'lineOfSight': {
      const X = e.name(pr.personId);
      return pr.value
        ? [`${S} could see ${X}.`, `${S} had a clear diagonal view of ${X}.`]
        : [`${S} could not see ${X}.`, `${S} had no view of ${X}.`];
    }
    case 'between': return [primary, was(`in a straight line between ${e.name(pr.a)} and ${e.name(pr.b)}`)];
    case 'aloneInRoom': return [primary, `Nobody else was in ${p.his} room.`, `${S} had the room all to ${p.himself}.`];
    case 'roomCount': {
      const w = numberWord(pr.n);
      if (pr.cmp === 'exactly') return [primary, `${p.His} room held exactly ${w} people, ${p.him} included.`];
      if (pr.cmp === 'atLeast') return [primary, `${p.His} room held at least ${w} people, ${p.him} included.`];
      return [primary, `${p.His} room held at most ${w} people, ${p.him} included.`];
    }
    case 'roomHasFurniture': return pr.value
      ? [primary, `${p.His} room had ${FURNITURE_LABEL[pr.kind].a} in it.`]
      : [primary, `There were no ${FURNITURE_LABEL[pr.kind].plural} in ${p.his} room.`];
    case 'roomSizeCmp': {
      const f = fragment(pr, e);
      return [primary, was(f.replace('largest room', 'biggest room on the map').replace('smallest room', 'tiniest room on the map'))];
    }
    case 'or': return [primary];
    case 'not': return [`It is not true that ${p.he} was ${fragment(pr.p, e)}.`];
  }
}

function makeEnv(person: Person, ctx: TextCtx, subject: string): Env {
  const names = new Map(ctx.people.map((x) => [x.id, x.name]));
  const rooms = new Map(ctx.rooms.map((r) => [r.id, r.name]));
  return {
    S: subject,
    p: pronouns(person),
    name: (id) => names.get(id) ?? 'someone',
    room: (id) => rooms.get(id) ?? 'unknown room',
    rows: ctx.rows,
    cols: ctx.cols,
    sizes: ctx.rooms.map((r) => r.cells.length),
  };
}

/**
 * One clue sentence for `person`. Victim clues read "The victim was found …".
 */
export function clueText(p: Predicate, person: Person, ctx: TextCtx, variant?: number): string {
  if (person.isVictim) {
    const e = makeEnv(person, ctx, 'The victim');
    if (p.type === 'lineOfSight') return variants(p, e)[0] as string;
    const subjects = ['The victim was found', 'The body lay', 'The body was discovered'];
    const k = variant ?? hashSeed(ctx.seed ?? 0, person.id, JSON.stringify(p));
    return `${subjects[k % subjects.length]} ${fragment(p, e)}.`;
  }
  const e = makeEnv(person, ctx, pronouns(person).He);
  const vs = variants(p, e);
  const pick = hashSeed(ctx.seed ?? 0, person.id, JSON.stringify(p)) % vs.length;
  return vs[pick] as string;
}

/** The victim's killer-rule sentence with pronouns filled in. */
export function killerRuleText(rule: KillerRule, victim: { pronoun: 'he' | 'she' }): string {
  const pr = pronouns(victim);
  return KILLER_RULE_TEXT[rule.type].replace(/\{He\}/g, pr.He).replace(/\{him\}/g, pr.him).replace(/\{his\}/g, pr.his);
}

/**
 * The victim's rule sentence for a scenario (brief §4). Double variants give
 * each victim the sentence; the liar line of `liarDouble` goes on the first victim.
 */
export function victimRuleText(
  variant: Variant,
  victim: { pronoun: 'he' | 'she' },
  opts: { poisonKind?: FurnitureKind; first?: boolean } = {},
): string {
  const pr = pronouns(victim);
  const fill = (s: string): string => s.replace(/\{He\}/g, pr.He).replace(/\{him\}/g, pr.him).replace(/\{his\}/g, pr.his);
  const alone = 'The victim. {He} was alone with the killer.';
  const accomplice = 'The victim. Two people were in the room with {him}: the killer stood closer.';
  const double = 'The victim. {He} was alone with {his} killer.';
  switch (variant) {
    case 'classic': return fill(alone);
    case 'accomplice': return fill(accomplice);
    case 'lockedRoom': return fill('The victim. {He} was alone behind a locked door. The killer was the only person in a room next to {his}.');
    case 'poison': return `The victim. The poison was in the ${furnitureNoun(opts.poisonKind ?? 'cabinet')}. The killer was the only person beside one.`;
    case 'sniper': return fill('The victim. Only the killer had a clear line of sight to {him}.');
    case 'liar': return fill(`${alone} One suspect is lying — every word.`);
    case 'double': return fill(double);
    case 'liarDouble': return fill(opts.first === false ? double : `${double} One of the two killers is lying — every word.`);
    case 'accompliceLiar': return fill(`${accomplice} The accomplice is lying — every word.`);
  }
}
