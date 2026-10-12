/**
 * Clue prose (docs/GRID-PLAN.md §4). Every predicate has 2–3 phrasings; the
 * choice is seeded so a puzzle always reads the same. Rows/columns are 1-based
 * in prose with "top row / bottom row / left column / right column" at edges.
 */
import type { Furniture, FurnitureKind, KillerRule, Person, Predicate, Room, Tier, Variant } from '../types';
import { FURNITURE_LABEL, KILLER_RULE_TEXT } from '../types';
import { hashSeed } from './rng';

/** What the text layer needs to know about a puzzle. `Puzzle` satisfies it. */
export interface TextCtx {
  rows: number;
  cols: number;
  rooms: Room[];
  people: Person[];
  seed?: number;
  /** used for "the piano" (one on the map) vs "a piano" */
  furniture?: Furniture[];
  /** 'ultra' (Extra Extreme) switches to the narrative testimony templates */
  tier?: Tier;
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
  /** the owner's name */
  me: string;
  /** pieces of a kind on the map (0 when unknown) */
  pieces: (k: FurnitureKind) => number;
}

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (k: FurnitureKind): string => FURNITURE_LABEL[k].plural;
/** "the piano" when there is exactly one on the map, else "a piano" */
function kindRef(k: FurnitureKind, e: Env): string {
  return e.pieces(k) === 1 ? `the ${furnitureNoun(k)}` : FURNITURE_LABEL[k].a;
}
const isPluralNoun = (k: FurnitureKind): boolean => k === 'bananas';

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
    case 'seeCount': {
      const w = numberWord(pr.n), ppl = pr.n === 1 ? 'person' : 'people';
      const q = pr.cmp === 'exactly' ? 'exactly' : pr.cmp === 'atLeast' ? 'at least' : 'at most';
      return `in plain view of ${q} ${w} ${ppl}`;
    }
    case 'seenByNobody': return 'out of everybody\'s sight';
    case 'crowdedThan': return `in a more crowded room than ${e.name(pr.personId)}`;
    case 'onlyOnFurnitureInRoom': return `the only person in ${e.p.his} room on a piece of furniture`;
    case 'noDiagonalNeighbour': return `without anybody diagonally beside ${e.p.him}`;
    case 'closerToKindThan': return `closer to ${kindRef(pr.kind, e)} than ${e.name(pr.personId)} was`;
    case 'closestToKind': return `closer to ${kindRef(pr.kind, e)} than anybody else`;
    case 'roomAllOccupiable': return 'in a room whose furniture could all be sat or stood on';
    case 'roomHasButNot': return `in a room with ${FURNITURE_LABEL[pr.has].a} but no ${plural(pr.not)}`;
    case 'largestRoomWith': return `in the largest room with ${FURNITURE_LABEL[pr.kind].a}`;
    case 'roomTouches': return `in a room next to the ${e.room(pr.roomId)}`;
    case 'canSeeKind': return `within sight of ${FURNITURE_LABEL[pr.kind].a}`;
    case 'cannotSeeKind': return `out of sight of every ${furnitureNoun(pr.kind)}`;
    case 'ifThen': return `${fragment(pr.b, e)} if ${e.p.he} was ${fragment(pr.a, e)}`;
    case 'xor': return `either ${fragment(pr.a, e)} or ${fragment(pr.b, e)}, but not both`;
    case 'and': return `${fragment(pr.a, e)} and ${fragment(pr.b, e)}`;
  }
}

/** Extra Extreme testimony: ≥ 3 named, voiced phrasings per predicate (first = plainest). */
function ultraVariants(pr: Predicate, e: Env): string[] {
  const N = e.me, p = e.p;
  const X = (id: string): string => e.name(id);
  const fr = (q: Predicate): string => fragment(q, e);
  switch (pr.type) {
    case 'seeCount': {
      const w = numberWord(pr.n), ppl = pr.n === 1 ? 'person' : 'people';
      if (pr.cmp === 'exactly') {
        return pr.n === 1
          ? [`Exactly one person could see ${N}.`, `Only one person in the whole place had ${N} in plain sight.`, `${N} was in plain view of exactly one person.`]
          : [`Exactly ${w} people could see ${N}.`, `${cap(w)} people, no more and no fewer, had ${N} in plain sight.`, `${N} was in plain view of exactly ${w} people.`];
      }
      if (pr.cmp === 'atLeast') return [`At least ${w} ${ppl} could see ${N}.`, `No fewer than ${w} ${ppl} had a clear view of ${N}.`, `${N} was in plain view of ${w} ${ppl} or more.`];
      return [`At most ${w} ${ppl} could see ${N}.`, `No more than ${w} ${ppl} had a clear view of ${N}.`, `${N} was in plain view of ${w} ${ppl} at most.`];
    }
    case 'seenByNobody':
      return [`Nobody could see ${N} — ${p.he} made sure of that.`, `Not a single person had a clear view of ${N}.`, `${N} stayed out of everybody's sight.`];
    case 'crowdedThan': {
      const Y = X(pr.personId);
      return [`${N}'s room was more crowded than ${Y}'s.`, `There were more people in ${N}'s room than in ${Y}'s.`, `${N} swears ${p.his} room held more people than ${Y}'s did.`];
    }
    case 'onlyOnFurnitureInRoom':
      return [`${N} was the only person in ${p.his} room up on a piece of furniture.`, `Of everyone in ${N}'s room, only ${N} was on a piece of furniture.`,
        `${N} was on a piece of furniture, and nobody else in ${p.his} room was.`];
    case 'noDiagonalNeighbour':
      return [`Nobody stood diagonally next to ${N}.`, `No one was diagonally beside ${N}.`, `${N} had no diagonal neighbour at all.`];
    case 'closerToKindThan': {
      const k = kindRef(pr.kind, e), Y = X(pr.personId);
      return [`${N} was closer to ${k} than ${Y} was.`, `${N} swears ${p.he} spent the night closer to ${k} than ${Y}.`, `${Y} was farther from ${k} than ${N} was.`];
    }
    case 'closestToKind': {
      const k = kindRef(pr.kind, e);
      return [`${N} was the person closest to ${k}.`, `Nobody was as close to ${k} as ${N}.`, `Of everyone there, ${N} stood nearest to ${k}.`];
    }
    case 'roomAllOccupiable':
      return [`${N}'s room had furniture, and every piece of it was something you could sit or stand on.`,
        `There was furniture in ${N}'s room, and all of it could be sat or stood on.`,
        `Every piece of furniture in ${N}'s room (and there was some) could be sat or stood on.`];
    case 'roomHasButNot': {
      const a = FURNITURE_LABEL[pr.has].a, no = plural(pr.not);
      return [`${N}'s room had ${a} but no ${no}.`, `There ${isPluralNoun(pr.has) ? 'were' : 'was'} ${a} in ${N}'s room, but no ${no} at all.`,
        `${N} remembers ${a} in ${p.his} room, and no ${no}.`];
    }
    case 'largestRoomWith': {
      const a = FURNITURE_LABEL[pr.kind].a;
      return [`${N} was in the largest room that had ${a}.`, `Of all the rooms with ${a}, ${N} was in the biggest.`, `${N} spent the evening in the biggest room with ${a}.`];
    }
    case 'roomTouches': {
      const R = e.room(pr.roomId);
      return [`${N}'s room shared a wall with the ${R}.`, `${N} was in a room next door to the ${R}.`, `${N}'s room touched the ${R}.`];
    }
    case 'canSeeKind': {
      const a = FURNITURE_LABEL[pr.kind].a;
      return [`From where ${p.he} stood, ${N} could see ${a}.`, `${N} had a clear view of ${a}.`,
        `${cap(a)} ${isPluralNoun(pr.kind) ? 'were' : 'was'} in ${N}'s line of sight.`];
    }
    case 'cannotSeeKind': {
      const pl = plural(pr.kind);
      return [`${N} couldn't see any ${pl}.`, `No ${pl} were in ${N}'s line of sight.`, `${N} had no clear view of any ${pl}.`];
    }
    case 'lineOfSight': {
      const Y = X(pr.personId);
      return pr.value
        ? [`${N} could see ${Y}.`, `${N} had a clear view of ${Y}.`, `From where ${p.he} stood, ${N} could see ${Y}.`]
        : [`${N} could not see ${Y}.`, `${Y} was out of ${N}'s sight.`, `${N} had no view of ${Y}.`];
    }
    case 'and': {
      const a = pr.a, b = pr.b;
      if (a.type === 'lineOfSight' && b.type === 'lineOfSight') {
        const [yes, no] = a.value ? [a, b] : [b, a];
        if (yes.value && !no.value) {
          const Y = X(yes.personId), Z = X(no.personId);
          return [`From where ${p.he} stood, ${N} could see ${Y}, but not ${Z}.`, `${N} could see ${Y}, but not ${Z}.`, `${N} had a clear view of ${Y} and none of ${Z}.`];
        }
        if (yes.value) {
          const Y = X(a.personId), Z = X(b.personId);
          return [`${N} could see both ${Y} and ${Z}.`, `${N} had a clear view of ${Y} and of ${Z}.`, `From where ${p.he} stood, ${N} could see ${Y} and ${Z}.`];
        }
        const Y = X(a.personId), Z = X(b.personId);
        return [`${N} could see neither ${Y} nor ${Z}.`, `${N} had no view of ${Y} or of ${Z}.`, `Neither ${Y} nor ${Z} was in ${N}'s sight.`];
      }
      if (a.type === 'dirOf' && b.type === 'dirOf') {
        const Y = X(a.personId), Z = X(b.personId);
        if (a.personId === b.personId) {
          return [`${N} was somewhere ${a.dir} and ${b.dir} of ${Y}.`, `${N} stood further ${a.dir} and further ${b.dir} than ${Y}.`,
            `${Y} was somewhere ${OPP_DIR[a.dir]} and ${OPP_DIR[b.dir]} of ${N}.`];
        }
        return [`${N} was somewhere ${a.dir} of ${Y} and ${b.dir} of ${Z}.`, `${N} stood further ${a.dir} than ${Y} and further ${b.dir} than ${Z}.`,
          `${Y} was somewhere ${OPP_DIR[a.dir]} of ${N}, and ${Z} somewhere ${OPP_DIR[b.dir]} of ${p.him}.`];
      }
      return [`${N} was ${fr(a)} and ${fr(b)}.`, `${N} was ${fr(a)}; ${p.he} was also ${fr(b)}.`, `Two things about ${N}: ${p.he} was ${fr(a)}, and ${p.he} was ${fr(b)}.`];
    }
    case 'ifThen':
      return [`If ${N} was ${fr(pr.a)}, ${p.he} was ${fr(pr.b)}.`, `${N} insists: if ${p.he} was ${fr(pr.a)}, then ${p.he} was ${fr(pr.b)}.`,
        `${N} swears that if ${p.he} was ${fr(pr.a)}, ${p.he} was ${fr(pr.b)}.`];
    case 'xor':
      return [`${N} was either ${fr(pr.a)} or ${fr(pr.b)}, not both.`, `${N} was ${fr(pr.a)} or ${fr(pr.b)}, but not both.`,
        `Exactly one of these is true: ${N} was ${fr(pr.a)}, or ${N} was ${fr(pr.b)}.`];
    case 'sameRoomAs': {
      const Y = X(pr.personId);
      return [`${N} shared a room with ${Y}.`, `${N} and ${Y} spent the evening in the same room.`, `${N} was in the same room as ${Y}.`];
    }
    case 'differentRoomFrom': {
      const Y = X(pr.personId);
      return [`${N} and ${Y} were in different rooms.`, `${N} was not in ${Y}'s room.`, `${N} and ${Y} did not share a room.`];
    }
    case 'besidePerson': {
      const Y = X(pr.personId);
      return [`${N} and ${Y} were diagonal neighbours.`, `${N} stood diagonally next to ${Y}.`, `${Y} was diagonally beside ${N}.`];
    }
    case 'notBesidePerson': {
      const Y = X(pr.personId);
      return [`${N} was not diagonally next to ${Y}.`, `${N} and ${Y} were not diagonal neighbours.`, `${Y} was nowhere diagonally beside ${N}.`];
    }
    case 'dirOf': {
      const Y = X(pr.personId);
      return [`${N} was somewhere ${pr.dir} of ${Y}.`, `${N} stood further ${pr.dir} than ${Y}.`, `${Y} was somewhere ${OPP_DIR[pr.dir]} of ${N}.`];
    }
    case 'distance': {
      const w = numberWord(pr.n), Y = X(pr.personId);
      if (pr.cmp === 'exactly') return [`${N} was exactly ${w} steps from ${Y}.`, `${N} and ${Y} were exactly ${w} steps apart.`, `It was exactly ${w} steps from ${N} to ${Y}.`];
      if (pr.cmp === 'atMost') return [`${N} was no more than ${w} steps from ${Y}.`, `${N} and ${Y} were at most ${w} steps apart.`, `${Y} was within ${w} steps of ${N}.`];
      return [`${N} was at least ${w} steps away from ${Y}.`, `${N} and ${Y} were ${w} or more steps apart.`, `${Y} was no closer than ${w} steps to ${N}.`];
    }
    case 'inRoom': {
      const R = e.room(pr.roomId);
      return [`${N} was in the ${R}.`, `${N} spent the evening in the ${R}.`, `${N} swears ${p.he} was in the ${R} all night.`];
    }
    case 'notInRoom': {
      const R = e.room(pr.roomId);
      return [`${N} was never in the ${R}.`, `${N} stayed out of the ${R}.`, `${N} swears ${p.he} never set foot in the ${R}.`];
    }
    case 'onFurniture':
      return [`${N} was ${onPhrase(pr.kind)}.`, `${N} was ${onPhraseAlt(pr.kind)}.`, `${N} spent the night ${onPhraseAlt(pr.kind)}.`];
    case 'notOnFurniture':
      return [`${N} was not ${onPhrase(pr.kind)}.`, `${N} was not ${onPhraseAlt(pr.kind)}.`, `Whatever ${N} did, ${p.he} was not ${onPhrase(pr.kind)}.`];
    case 'onAnyFurniture':
      return [`${N} was on a piece of furniture.`, `${N} was sitting or standing on some furniture.`, `${N} kept off the bare floor; ${p.he} was on a piece of furniture.`];
    case 'onNoFurniture':
      return [`${N} stood on the bare floor.`, `${N} was not on any furniture.`, `${N} kept ${p.his} feet on the bare floor.`];
    case 'besideFurniture': {
      const a = FURNITURE_LABEL[pr.kind].a;
      return [`${N} was beside ${a}.`, `${N} stood right next to ${a}.`, `There ${isPluralNoun(pr.kind) ? 'were' : 'was'} ${a} right beside ${N}.`];
    }
    case 'notBesideFurniture':
      return [`${N} was not beside any ${furnitureNoun(pr.kind)}.`, `There were no ${plural(pr.kind)} next to ${N}.`, `No ${furnitureNoun(pr.kind)} stood beside ${N}.`];
    case 'besideAnyFurniture':
      return [`${N} was beside a piece of furniture.`, `${N} stood right next to some furniture.`, `There was furniture right beside ${N}.`];
    case 'notBesideAnyFurniture':
      return [`${N} was not beside any furniture.`, `There was no furniture next to ${N}.`, `Nothing stood beside ${N}; not one piece of furniture.`];
    case 'roomHasFurniture': {
      const a = FURNITURE_LABEL[pr.kind].a, pl = plural(pr.kind);
      return pr.value
        ? [`${N}'s room had ${a} in it.`, `There ${isPluralNoun(pr.kind) ? 'were' : 'was'} ${a} in ${N}'s room.`, `${N} was in a room with ${a}.`]
        : [`There were no ${pl} in ${N}'s room.`, `${N}'s room had no ${pl}.`, `${N} was in a room without any ${pl}.`];
    }
    case 'aloneInRoom':
      return [`${N} had the room all to ${p.himself}.`, `Nobody else was in ${N}'s room.`, `${N} was alone in ${p.his} room.`];
    case 'roomCount': {
      const w = numberWord(pr.n);
      const q = pr.cmp === 'exactly' ? 'exactly' : pr.cmp === 'atLeast' ? 'at least' : 'at most';
      return [`${N}'s room held ${q} ${w} people, ${p.him} included.`, `Counting ${N}, there were ${q} ${w} people in ${p.his} room.`,
        `${N} was one of ${q} ${w} people in ${p.his} room.`];
    }
    default: {
      const v = variants(pr, e);
      return v.map((s) => s.replace(/^(He|She) /, `${N} `));
    }
  }
}

const OPP_DIR: Record<'north' | 'south' | 'east' | 'west', string> = { north: 'south', south: 'north', east: 'west', west: 'east' };

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
    case 'ifThen': return [`If ${p.he} was ${fragment(pr.a, e)}, ${p.he} was ${fragment(pr.b, e)}.`];
    default: return [primary];
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
    me: person.name,
    pieces: (k) => (ctx.furniture ?? []).filter((f) => f.kind === k).length,
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
    const f = fragment(p, e);
    // "The body lay not on an armchair" → "The body was not found on an armchair"
    if (f.startsWith('not ')) return `${['The victim was not found', 'The body was not found'][k % 2]} ${f.slice(4)}.`;
    return `${subjects[k % subjects.length]} ${f}.`;
  }
  const e = makeEnv(person, ctx, pronouns(person).He);
  const vs = ctx.tier === 'ultra' ? ultraVariants(p, e) : variants(p, e);
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
