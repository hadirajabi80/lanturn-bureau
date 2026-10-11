import { motion } from 'framer-motion';
import { memo, type JSX } from 'react';
import type { Cell } from '../types';
import { PIN_OFFSET } from './PersonToken';

export interface AccusationString {
  from: Cell;
  to: Cell;
  key: string;
}

/** Red string with a slight sag between two pinned photos; drawn in after solving. */
function StringsImpl({ lines, color, reduceMotion, shadow = '#000' }: { lines: AccusationString[]; color: string; reduceMotion: boolean; shadow?: string }): JSX.Element | null {
  if (!lines.length) return null;
  return (
    <g pointerEvents="none">
      {lines.map((l, i) => {
        const ax = l.from.c * 100 + 50 + PIN_OFFSET.x;
        const ay = l.from.r * 100 + 50 + PIN_OFFSET.y;
        const bx = l.to.c * 100 + 50 + PIN_OFFSET.x;
        const by = l.to.r * 100 + 50 + PIN_OFFSET.y;
        const dist = Math.hypot(bx - ax, by - ay);
        const sag = 12 + dist * 0.12;
        const d = `M${ax},${ay}Q${(ax + bx) / 2},${(ay + by) / 2 + sag} ${bx},${by}`;
        const anim = reduceMotion
          ? { initial: false as const, animate: { pathLength: 1 } }
          : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.9, delay: 0.25 + i * 0.35, ease: [0.3, 0.1, 0.2, 1] as const } };
        return (
          <g key={l.key}>
            <motion.path d={d} fill="none" stroke={shadow} strokeOpacity={0.3} strokeWidth={4.5} strokeLinecap="round" transform="translate(2 5)" {...anim} />
            <motion.path d={d} fill="none" stroke={color} strokeWidth={3.6} strokeLinecap="round" {...anim} />
            <motion.path d={d} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={1} strokeDasharray="3 5" strokeLinecap="round" {...anim} />
            {[
              [ax, ay],
              [bx, by],
            ].map(([x, y], k) => (
              <g key={k} transform={`translate(${x} ${y})`}>
                <circle r={4.6} fill={color} stroke="#3B0A08" strokeWidth={1} />
                <circle cx={-1.3} cy={-1.5} r={1.4} fill="#fff" opacity={0.7} />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

export const Strings = memo(StringsImpl);
