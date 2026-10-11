/** "New scenario" explainer with a mini plan diagram — shown the first time a variant is met. */
import { motion } from 'framer-motion';
import type { Variant } from '@/grid/types';
import { BrassBtn, Overlay, VariantIcon } from './parts';
import { VARIANT_META } from './util';

type Tok = { r: number; c: number; k: 'V' | 'K' | 'A' | 'S'; liar?: boolean };
interface Diagram {
  rooms: { x: number; y: number; w: number; h: number; tint: string }[];
  people: Tok[];
  line?: [Tok, Tok];
  furniture?: { r: number; c: number };
  lock?: { r: number; c: number };
}

const R = (x: number, y: number, w: number, h: number, tint: string) => ({ x, y, w, h, tint });
const BASE_ROOMS = [R(0, 0, 2, 2, '#c9b08a'), R(2, 0, 2, 2, '#b9a07d'), R(0, 2, 2, 2, '#d8c7a6'), R(2, 2, 2, 2, '#c7a981')];

const DIAGRAMS: Record<Variant, Diagram> = {
  classic: { rooms: BASE_ROOMS, people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K' }, { r: 2, c: 3, k: 'S' }, { r: 3, c: 2, k: 'S' }] },
  accomplice: {
    rooms: [R(0, 0, 3, 3, '#c9b08a'), R(3, 0, 1, 4, '#b9a07d'), R(0, 3, 3, 1, '#d8c7a6')],
    people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K' }, { r: 2, c: 2, k: 'A' }, { r: 3, c: 3, k: 'S' }],
  },
  lockedRoom: {
    rooms: [R(0, 0, 2, 2, '#c9b08a'), R(2, 0, 2, 2, '#b9a07d'), R(0, 2, 4, 2, '#d8c7a6')],
    people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 2, k: 'K' }, { r: 2, c: 3, k: 'S' }, { r: 3, c: 1, k: 'S' }],
    lock: { r: 0, c: 1 },
  },
  poison: {
    rooms: BASE_ROOMS,
    people: [{ r: 0, c: 3, k: 'V' }, { r: 2, c: 0, k: 'K' }, { r: 1, c: 1, k: 'S' }, { r: 3, c: 2, k: 'S' }],
    furniture: { r: 3, c: 0 },
  },
  sniper: {
    rooms: BASE_ROOMS,
    people: [{ r: 0, c: 0, k: 'V' }, { r: 3, c: 3, k: 'K' }, { r: 1, c: 2, k: 'S' }, { r: 2, c: 1, k: 'S' }],
    line: [{ r: 0, c: 0, k: 'V' }, { r: 3, c: 3, k: 'K' }],
  },
  liar: { rooms: BASE_ROOMS, people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K', liar: true }, { r: 2, c: 3, k: 'S' }, { r: 3, c: 2, k: 'S' }] },
  double: { rooms: BASE_ROOMS, people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K' }, { r: 2, c: 3, k: 'V' }, { r: 3, c: 2, k: 'K' }] },
  liarDouble: {
    rooms: BASE_ROOMS,
    people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K', liar: true }, { r: 2, c: 3, k: 'V' }, { r: 3, c: 2, k: 'K' }],
  },
  accompliceLiar: {
    rooms: [R(0, 0, 3, 3, '#c9b08a'), R(3, 0, 1, 4, '#b9a07d'), R(0, 3, 3, 1, '#d8c7a6')],
    people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K' }, { r: 2, c: 2, k: 'A', liar: true }, { r: 3, c: 3, k: 'S' }],
  },
};

const U = 40;
const COLORS: Record<Tok['k'], string> = { V: '#7d1c16', K: '#c0281f', A: '#a8611a', S: '#3d4a5c' };

export function MiniPlan({ variant, className }: { variant: Variant; className?: string }) {
  const d = DIAGRAMS[variant];
  return (
    <svg viewBox={`-6 -6 ${4 * U + 12} ${4 * U + 12}`} className={className} role="img" aria-label={`Diagram: ${VARIANT_META[variant].name}`}>
      <rect x={-6} y={-6} width={4 * U + 12} height={4 * U + 12} rx={6} fill="#e9dcc0" />
      {d.rooms.map((rm, i) => (
        <rect key={i} x={rm.x * U} y={rm.y * U} width={rm.w * U} height={rm.h * U} fill={rm.tint} stroke="#2b2017" strokeWidth={3} />
      ))}
      {d.furniture && (
        <g transform={`translate(${d.furniture.c * U + U / 2} ${d.furniture.r * U + U / 2})`}>
          <rect x={-13} y={-13} width={26} height={26} rx={4} fill="#5b3f24" />
          <path d="M-4 -8 h8 M-3 -8 v6 l-6 10 h18 l-6 -10 v-6" fill="#7bd389" stroke="#203b24" strokeWidth={1.5} />
        </g>
      )}
      {d.lock && (
        <g transform={`translate(${(d.lock.c + 1) * U} ${d.lock.r * U + U / 2})`}>
          <rect x={-7} y={-3} width={14} height={11} rx={2} fill="#d4a857" stroke="#3a2508" />
          <path d="M-4 -3 v-4 a4 4 0 0 1 8 0 v4" fill="none" stroke="#3a2508" strokeWidth={2} />
        </g>
      )}
      {d.line && (
        <motion.line
          x1={d.line[0].c * U + U / 2}
          y1={d.line[0].r * U + U / 2}
          x2={d.line[1].c * U + U / 2}
          y2={d.line[1].r * U + U / 2}
          stroke="#c0281f"
          strokeWidth={2.5}
          strokeDasharray="6 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      )}
      {d.people.map((p, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 400, damping: 18 }}
          style={{ transformOrigin: `${p.c * U + U / 2}px ${p.r * U + U / 2}px` }}
        >
          <circle cx={p.c * U + U / 2} cy={p.r * U + U / 2} r={13} fill={COLORS[p.k]} stroke="#f4efe4" strokeWidth={2.5} />
          <text x={p.c * U + U / 2} y={p.r * U + U / 2 + 4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff" fontFamily="Inter, sans-serif">
            {p.k === 'S' ? '' : p.k}
          </text>
          {p.liar && (
            <text x={p.c * U + U / 2 + 12} y={p.r * U + U / 2 - 10} fontSize={12} textAnchor="middle">
              🎭
            </text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export function ScenarioExplainer({ variant, open, onClose, isNew }: { variant: Variant; open: boolean; onClose: () => void; isNew: boolean }) {
  const meta = VARIANT_META[variant];
  return (
    <Overlay open={open} onClose={onClose} label={`Scenario: ${meta.name}`}>
      <div className="grid min-h-dvh place-items-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          initial={{ y: 30, opacity: 0, rotate: -1 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="w-full max-w-md rounded-[10px] p-5"
          style={{ background: 'var(--fp-panel)', boxShadow: 'inset 0 0 0 1px var(--fp-hair), 0 30px 60px -24px var(--dk-shadow, var(--dk-shadow, rgb(0 0 0 / 0.9)))' }}
        >
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--dk-accent-text,var(--fp-accent2))]">
            <VariantIcon variant={variant} className="size-4" /> {isNew ? 'New scenario' : 'Scenario'}
          </div>
          <h2 className="mt-1 font-display text-2xl font-black">{meta.name}</h2>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <MiniPlan variant={variant} className="w-40 shrink-0 drop-shadow-[0_10px_18px_rgb(0_0_0/0.6)]" />
            <div className="text-sm leading-relaxed text-[var(--fp-ink)]">
              <p>{meta.blurb}</p>
              <p className="mt-2 text-[var(--fp-muted)]">{meta.accuse}</p>
              <ul className="mt-3 space-y-1 text-[11px] text-[var(--fp-muted)]">
                <li><b className="text-[#e07a6f]">V</b> victim · <b className="text-[#ff6b5e]">K</b> killer{variant.includes('ccomplice') ? ' · ' : ''}{variant.includes('ccomplice') && <><b className="text-[#e3a35c]">A</b> accomplice</>}</li>
                <li>One person per row and per column, always.</li>
              </ul>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <BrassBtn onClick={onClose} data-autofocus>
              Understood
            </BrassBtn>
          </div>
        </motion.div>
      </div>
    </Overlay>
  );
}
