import { motion } from 'framer-motion';
import { memo, type JSX } from 'react';
import type { Person } from '../types';
import { MiniFace } from './NoteDots';
import { FONT } from './skins/common';
import { hash, r1, rng } from './skins/geom';

/** Two hand-drawn grease-pencil strokes inside a cell (0..100 box), stable per cell key. */
function crossStrokes(key: string, size: number): [string, string] {
  const rnd = rng(hash(key) || 7);
  const j = () => (rnd() - 0.5) * 6;
  const a = (100 - size) / 2;
  const b = a + size;
  const s1 = `M${r1(a + j())},${r1(a + j())}Q${r1(50 + j() * 1.6)},${r1(50 + j() * 1.6)} ${r1(b + j())},${r1(b + j())}`;
  const s2 = `M${r1(b + j())},${r1(a + j())}Q${r1(50 + j() * 1.6)},${r1(50 + j() * 1.6)} ${r1(a + j())},${r1(b + j())}`;
  return [s1, s2];
}

export interface CrossMarkProps {
  k: string;
  r: number;
  c: number;
  color: string;
  /** user-unit stroke width */
  width: number;
  /** small corner cross (crossed for some people only) */
  small?: boolean;
  reduceMotion: boolean;
}

/** A red grease-pencil X, drawn in as two strokes. */
function CrossMarkImpl({ k, r, c, color, width, small = false, reduceMotion }: CrossMarkProps): JSX.Element {
  const [s1, s2] = crossStrokes(k, 58);
  const t = small ? `translate(${c * 100 + 66} ${r * 100 + 6}) scale(0.28)` : `translate(${c * 100} ${r * 100})`;
  const w = small ? width * 2.4 : width;
  const draw = (delay: number) =>
    reduceMotion
      ? { initial: false as const, animate: { pathLength: 1, opacity: 1 } }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration: 0.16, delay, ease: 'easeOut' as const }, opacity: { duration: 0.01, delay } },
        };
  return (
    <g transform={t} pointerEvents="none" opacity={small ? 0.8 : 0.92}>
      <motion.path d={s1} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" {...draw(0)} />
      <motion.path d={s2} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" {...draw(0.12)} />
      {/* waxy highlight */}
      {!small && (
        <>
          <path d={s1} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={w * 0.3} strokeLinecap="round" transform="translate(-1 -1)" />
          <path d={s2} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={w * 0.3} strokeLinecap="round" transform="translate(-1 -1)" />
        </>
      )}
    </g>
  );
}
export const CrossMark = memo(CrossMarkImpl);

export interface EmptyMarkProps {
  k: string;
  r: number;
  c: number;
  /** the skin's note ink (contrasts with the sheet) */
  ink: string;
  /** the skin's note paper */
  paper: string;
  /** user-unit stroke width */
  width: number;
  reduceMotion: boolean;
}

/**
 * "Nobody can be here": the square is greyed out with pencil hatching and a big ink X across it,
 * so it reads as a dead square for every suspect (unlike the red per-person cross).
 */
function EmptyMarkImpl({ k, r, c, ink, paper, width, reduceMotion }: EmptyMarkProps): JSX.Element {
  const [s1, s2] = crossStrokes(k + '!', 70);
  const hatch = [12, 32, 52, 72, 92, 112, 132, 152].map((d) => `M${Math.max(4, d - 96)},${Math.min(96, d)}L${Math.min(96, d)},${Math.max(4, d - 96)}`).join('');
  const draw = (delay: number) =>
    reduceMotion
      ? { initial: false as const, animate: { pathLength: 1, opacity: 1 } }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration: 0.14, delay, ease: 'easeOut' as const }, opacity: { duration: 0.01, delay } },
        };
  return (
    <g transform={`translate(${c * 100} ${r * 100})`} pointerEvents="none">
      <motion.g initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
        <rect x={4} y={4} width={92} height={92} rx={4} fill={paper} fillOpacity={0.62} />
        <path d={hatch} fill="none" stroke={ink} strokeOpacity={0.22} strokeWidth={width * 0.32} strokeLinecap="round" />
      </motion.g>
      <motion.path d={s1} fill="none" stroke={ink} strokeOpacity={0.85} strokeWidth={width * 0.85} strokeLinecap="round" {...draw(0)} />
      <motion.path d={s2} fill="none" stroke={ink} strokeOpacity={0.85} strokeWidth={width * 0.85} strokeLinecap="round" {...draw(0.1)} />
    </g>
  );
}
export const EmptyMark = memo(EmptyMarkImpl);

const CORNERS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

export interface PencilNotesProps {
  r: number;
  c: number;
  people: Person[];
  /** small on-screen cells: draw initials instead of faces */
  dense: boolean;
  ink: string;
  paper: string;
}

/** Up to four pencil notes in the corners of a cell: mini faces, or initials on dense boards. */
function PencilNotesImpl({ r, c, people, dense, ink, paper }: PencilNotesProps): JSX.Element | null {
  if (!people.length) return null;
  const max = 4;
  const extra = people.length - max;
  const rad = dense ? 15 : 11.5;
  const off = dense ? 19 : 17;
  return (
    <g transform={`translate(${c * 100} ${r * 100})`} pointerEvents="none">
      {people.slice(0, max).map((p, i) => {
        const [fx, fy] = CORNERS[i] ?? [0, 0];
        const cx = fx ? 100 - off : off;
        const cy = fy ? 100 - off : off;
        if (i === max - 1 && extra > 0) {
          return (
            <g key="more" transform={`translate(${cx} ${cy})`}>
              <circle r={rad} fill={paper} fillOpacity={0.9} stroke={ink} strokeOpacity={0.5} strokeWidth={1.4} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={rad * 1.05} fontWeight={700} fontFamily={FONT.hand} fill={ink}>
                +{extra + 1}
              </text>
            </g>
          );
        }
        if (dense) {
          return (
            <g key={p.id} transform={`translate(${cx} ${cy})`}>
              <circle r={rad} fill={paper} fillOpacity={0.88} stroke={p.avatar.outfit} strokeWidth={2.4} />
              <text textAnchor="middle" dominantBaseline="central" y={1} fontSize={rad * 1.35} fontWeight={700} fontFamily={FONT.hand} fill={ink}>
                {(p.name[0] ?? '?').toUpperCase()}
              </text>
            </g>
          );
        }
        return (
          <g key={p.id} transform={`translate(${cx} ${cy})`}>
            <MiniFace person={p} r={rad} />
          </g>
        );
      })}
    </g>
  );
}
export const PencilNotes = memo(PencilNotesImpl);
