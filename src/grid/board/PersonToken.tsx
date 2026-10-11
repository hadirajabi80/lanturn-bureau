import { motion } from 'framer-motion';
import { memo, type JSX } from 'react';
import { Avatar } from '../../components/avatar';
import type { Cell, Person } from '../types';
import { INK } from './sprites/common';

const TOKEN_R = 37;
const VICTIM_RED = '#d6454f';
const VIOLATION_RED = '#e5383b';
const SELECT_ORANGE = '#ff9f43';

export interface PersonTokenProps {
  person: Person;
  cell: Cell;
  violating: boolean;
  selected: boolean;
  reduceMotion: boolean;
}

/** Round avatar token with a white ring and a flat drop shadow, centred in its cell. */
function PersonTokenImpl({ person, cell, violating, selected, reduceMotion }: PersonTokenProps): JSX.Element {
  const r = TOKEN_R;
  const inner = r - 4.5;
  const cx = cell.c * 100 + 50;
  const cy = cell.r * 100 + 50;
  return (
    <g transform={`translate(${cx} ${cy})`} pointerEvents="none">
      <motion.g
        initial={reduceMotion ? false : { scale: 0.6, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0, transition: { duration: 0.12 } } : { scale: 0.75, opacity: 0, transition: { duration: 0.18 } }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 22, mass: 0.7 }}
      >
        {/* flat drop shadow */}
        <circle cx={0} cy={5} r={r + 1} fill={INK} opacity={0.24} />
        {selected && <circle r={r + (person.isVictim ? 7.5 : 5.5)} fill="none" stroke={SELECT_ORANGE} strokeWidth={5} />}
        {person.isVictim && <circle r={r + 2.5} fill="none" stroke={VICTIM_RED} strokeWidth={4} strokeOpacity={0.9} />}
        <circle r={r} fill="#ffffff" />
        <g transform={`translate(${-inner} ${-inner})`}>
          <Avatar spec={person.avatar} size={inner * 2} mood={violating ? 'surprised' : person.isVictim ? 'sad' : 'neutral'} />
        </g>
        <circle r={r} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.8} />
        {violating && (
          <>
            <circle r={r + 5} fill="none" stroke={VIOLATION_RED} strokeWidth={5} />
            {!reduceMotion && (
              <motion.circle
                r={r + 5}
                fill="none"
                stroke={VIOLATION_RED}
                strokeWidth={4}
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: 1.32, opacity: 0 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </>
        )}
      </motion.g>
    </g>
  );
}

export const PersonToken = memo(PersonTokenImpl);
