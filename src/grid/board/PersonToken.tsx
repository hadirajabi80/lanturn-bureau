import { motion } from 'framer-motion';
import { memo, type JSX } from 'react';
import { Avatar } from '../../components/avatar';
import type { Cell, Person } from '../types';
import { FONT } from './skins/common';
import { hash } from './skins/geom';

const VIOLATION_RED = '#E5383B';
const VICTIM_RED = '#B3261E';
const FRAME_W = 70;
const FRAME_H = 82;
const PHOTO = 60;

export interface PersonTokenProps {
  person: Person;
  cell: Cell;
  violating: boolean;
  selected: boolean;
  reduceMotion: boolean;
  /** skin accent for the selection glow */
  accent?: string;
  /** small boards: no handwritten name under the photo */
  compact?: boolean;
  /** id of the <filter> used for the selection glow (defined by Board's live layer) */
  glowFilter?: string;
  /** id of the brass radial gradient for the pin head */
  pinFill?: string;
  /** shadow colour (pastel on light skins) */
  shadowColor?: string;
}

/** Tilt in degrees, stable per person (-5..5). */
export const tokenTilt = (id: string) => ((hash(id) % 1000) / 1000 - 0.5) * 10;
/** Where the brass pin sits relative to the cell centre (for accusation strings). */
export const PIN_OFFSET = { x: 0, y: -FRAME_H / 2 + 4 };

/**
 * Polaroid-style mini photo: white frame, avatar "photo", brass pin on top, soft shadow.
 * Victims get a red tag; the selected person glows in the skin accent; violations pulse red.
 */
function PersonTokenImpl({ person, cell, violating, selected, reduceMotion, accent = '#FFB347', compact = false, glowFilter, pinFill, shadowColor = '#000' }: PersonTokenProps): JSX.Element {
  const cx = cell.c * 100 + 50;
  const cy = cell.r * 100 + 50;
  const tilt = tokenTilt(person.id);
  const x0 = -FRAME_W / 2;
  const y0 = -FRAME_H / 2 + 3;
  const first = person.name.split(/\s+/)[0] ?? person.name;
  return (
    <g transform={`translate(${cx} ${cy})`} pointerEvents="none">
      <motion.g
        initial={reduceMotion ? false : { y: -22, scale: 1.12, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0, transition: { duration: 0.1 } } : { y: -14, opacity: 0, scale: 0.9, transition: { duration: 0.16 } }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 560, damping: 17, mass: 0.6 }}
      >
        <g transform={`rotate(${tilt.toFixed(2)})`}>
          {selected && (
            <rect x={x0 - 7} y={y0 - 7} width={FRAME_W + 14} height={FRAME_H + 14} rx={8} fill={accent} opacity={0.75} filter={glowFilter ? `url(#${glowFilter})` : undefined} />
          )}
          {/* soft layered shadow (no filter: cheap) */}
          <rect x={x0 + 2} y={y0 + 6} width={FRAME_W} height={FRAME_H} rx={2.5} fill={shadowColor} opacity={0.16} />
          <rect x={x0 + 1} y={y0 + 3} width={FRAME_W} height={FRAME_H} rx={2} fill={shadowColor} opacity={0.2} />
          {/* frame */}
          <rect x={x0} y={y0} width={FRAME_W} height={FRAME_H} rx={1.5} fill="#FBF8F1" />
          <rect x={x0} y={y0} width={FRAME_W} height={FRAME_H} rx={1.5} fill="none" stroke="#000" strokeOpacity={0.14} strokeWidth={1} />
          {/* photo */}
          <rect x={-PHOTO / 2} y={y0 + 5} width={PHOTO} height={PHOTO} fill={person.avatar.accent} />
          <g transform={`translate(${-PHOTO / 2} ${y0 + 5})`}>
            <Avatar spec={person.avatar} size={PHOTO} mood={violating ? 'surprised' : person.isVictim ? 'sad' : 'neutral'} />
          </g>
          <rect x={-PHOTO / 2} y={y0 + 5} width={PHOTO} height={PHOTO} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={0.8} />
          {/* faded photo sheen */}
          <path d={`M${-PHOTO / 2},${y0 + 5}h${PHOTO * 0.55}l${-PHOTO * 0.35},${PHOTO}h${-PHOTO * 0.2}Z`} fill="#fff" opacity={0.08} />
          {!compact && (
            <text x={0} y={y0 + FRAME_H - 8.5} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontFamily={FONT.hand} fontWeight={600} fill="#2A2420" opacity={0.85}>
              {first.length > 10 ? first.slice(0, 9) + '.' : first}
            </text>
          )}
          {person.isVictim && (
            <g transform={`translate(${FRAME_W / 2 - 6} ${y0 + FRAME_H - 14}) rotate(24)`}>
              <path d="M-3,-4 Q4,-10 6,-2" fill="none" stroke="#5A4632" strokeWidth={1} />
              <path d="M0,0h20l6,7l-6,7h-20z" fill={VICTIM_RED} stroke="#5E0F0C" strokeWidth={1} />
              <circle cx={4} cy={7} r={1.8} fill="#FBF8F1" />
              <path d="M10,4.5h9M10,9.5h7" stroke="#FBF8F1" strokeOpacity={0.75} strokeWidth={1.3} strokeLinecap="round" />
            </g>
          )}
          {violating && (
            <>
              <rect x={x0 - 4} y={y0 - 4} width={FRAME_W + 8} height={FRAME_H + 8} rx={4} fill="none" stroke={VIOLATION_RED} strokeWidth={4} />
              {!reduceMotion && (
                <motion.rect
                  x={x0 - 4}
                  y={y0 - 4}
                  width={FRAME_W + 8}
                  height={FRAME_H + 8}
                  rx={4}
                  fill="none"
                  stroke={VIOLATION_RED}
                  strokeWidth={3}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  initial={{ scale: 1, opacity: 0.9 }}
                  animate={{ scale: 1.22, opacity: 0 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </>
          )}
        </g>
        {/* brass pin (not tilted: it is what holds the photo) */}
        <g transform={`translate(${PIN_OFFSET.x} ${PIN_OFFSET.y})`}>
          <ellipse cx={2.5} cy={4} rx={5.5} ry={3} fill={shadowColor} opacity={0.28} />
          <circle r={6.2} fill={pinFill ? `url(#${pinFill})` : '#C9974A'} stroke="#5A3D12" strokeWidth={1} />
          <circle cx={-1.8} cy={-2} r={1.8} fill="#FFF6D8" opacity={0.9} />
        </g>
      </motion.g>
    </g>
  );
}

export const PersonToken = memo(PersonTokenImpl);
