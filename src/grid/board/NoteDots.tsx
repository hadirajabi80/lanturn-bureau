import { memo, type JSX } from 'react';
import { shade } from '../../components/avatar/color';
import type { Cell, Person } from '../types';
import { INK } from './sprites/common';

/**
 * A ~10 px "mini avatar": outfit-coloured disc with the person's skin + hair.
 * Cheaper and more legible than a full Avatar at this size (no blink/breath timers).
 */
export function MiniFace({ person, r }: { person: Person; r: number }): JSX.Element {
  const a = person.avatar;
  const isCat = a.kind === 'cat';
  const head = isCat ? a.hairColor : a.skin;
  return (
    <g>
      <circle r={r} fill={a.accent} stroke="#ffffff" strokeWidth={r * 0.28} />
      <circle r={r} fill="none" stroke={INK} strokeWidth={r * 0.1} strokeOpacity={0.5} />
      <path d={`M${-r * 0.72},${r * 0.75} Q0,${r * 0.05} ${r * 0.72},${r * 0.75} A${r},${r} 0 0 1 ${-r * 0.72},${r * 0.75} Z`} fill={a.outfit} />
      <circle cy={-r * 0.05} r={r * 0.46} fill={head} />
      {isCat ? (
        <path
          d={`M${-r * 0.42},${-r * 0.2} L${-r * 0.36},${-r * 0.7} L${-r * 0.08},${-r * 0.42} Z M${r * 0.42},${-r * 0.2} L${r * 0.36},${-r * 0.7} L${r * 0.08},${-r * 0.42} Z`}
          fill={head}
        />
      ) : (
        a.hair !== 'bald' && (
          <path d={`M${-r * 0.48},${-r * 0.05} A${r * 0.48},${r * 0.5} 0 0 1 ${r * 0.48},${-r * 0.05} Q0,${-r * 0.3} ${-r * 0.48},${-r * 0.05} Z`} fill={a.hairColor} />
        )
      )}
      <circle cx={-r * 0.16} cy={r * 0.02} r={r * 0.06} fill={shade(head, -0.75)} />
      <circle cx={r * 0.16} cy={r * 0.02} r={r * 0.06} fill={shade(head, -0.75)} />
    </g>
  );
}

const CORNERS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

export interface NoteDotsProps {
  cell: Cell;
  personIds: string[];
  people: Map<string, Person>;
}

/** Up to four pencil-mark faces in the corners of a cell. */
function NoteDotsImpl({ cell, personIds, people }: NoteDotsProps): JSX.Element | null {
  const shown = personIds.map((id) => people.get(id)).filter((p): p is Person => !!p);
  if (shown.length === 0) return null;
  const r = 11.5;
  const off = 19;
  const extra = shown.length - 4;
  return (
    <g transform={`translate(${cell.c * 100} ${cell.r * 100})`} pointerEvents="none">
      {shown.slice(0, 4).map((p, i) => {
        const [fx, fy] = CORNERS[i] ?? [0, 0];
        const cx = fx ? 100 - off : off;
        const cy = fy ? 100 - off : off;
        if (i === 3 && extra > 0) {
          return (
            <g key="more" transform={`translate(${cx} ${cy})`}>
              <circle r={r} fill="#fffdf8" stroke={INK} strokeOpacity={0.35} strokeWidth={1.6} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={800} fill={INK}>
                +{extra + 1}
              </text>
            </g>
          );
        }
        return (
          <g key={p.id} transform={`translate(${cx} ${cy})`}>
            <MiniFace person={p} r={r} />
          </g>
        );
      })}
    </g>
  );
}

export const NoteDots = memo(NoteDotsImpl);
