/** "New scenario" explainer with a mini plan diagram — shown the first time a variant is met. */
import { motion } from 'framer-motion';
import type { Variant } from '@/grid/types';
import { PRINT } from '@/grid/ui';
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
const BASE_ROOMS = [R(0, 0, 2, 2, '#F1F1EC'), R(2, 0, 2, 2, '#E3E3DC'), R(0, 2, 2, 2, '#FFFFFF'), R(2, 2, 2, 2, '#EAEAE4')];

const DIAGRAMS: Record<Variant, Diagram> = {
  classic: { rooms: BASE_ROOMS, people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K' }, { r: 2, c: 3, k: 'S' }, { r: 3, c: 2, k: 'S' }] },
  accomplice: {
    rooms: [R(0, 0, 3, 3, '#F1F1EC'), R(3, 0, 1, 4, '#E3E3DC'), R(0, 3, 3, 1, '#FFFFFF')],
    people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K' }, { r: 2, c: 2, k: 'A' }, { r: 3, c: 3, k: 'S' }],
  },
  lockedRoom: {
    rooms: [R(0, 0, 2, 2, '#F1F1EC'), R(2, 0, 2, 2, '#E3E3DC'), R(0, 2, 4, 2, '#FFFFFF')],
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
    rooms: [R(0, 0, 3, 3, '#F1F1EC'), R(3, 0, 1, 4, '#E3E3DC'), R(0, 3, 3, 1, '#FFFFFF')],
    people: [{ r: 0, c: 0, k: 'V' }, { r: 1, c: 1, k: 'K' }, { r: 2, c: 2, k: 'A', liar: true }, { r: 3, c: 3, k: 'S' }],
  },
};

const U = 40;
const INK = PRINT.ink;
/** Token fills: victim ink, killer red, accomplice yellow (ink letter), anyone else grey. */
const COLORS: Record<Tok['k'], string> = { V: PRINT.ink, K: PRINT.red, A: PRINT.yellow, S: '#8C8C86' };
const LETTER: Record<Tok['k'], string> = { V: '#FFFFFF', K: '#FFFFFF', A: PRINT.ink, S: '#FFFFFF' };

export function MiniPlan({ variant, className }: { variant: Variant; className?: string }) {
  const d = DIAGRAMS[variant];
  return (
    <svg viewBox={`-6 -6 ${4 * U + 12} ${4 * U + 12}`} className={className} role="img" aria-label={`Diagram: ${VARIANT_META[variant].name}`}>
      <rect x={-5} y={-5} width={4 * U + 10} height={4 * U + 10} rx={5} fill={PRINT.card} stroke={INK} strokeWidth={2} />
      {d.rooms.map((rm, i) => (
        <rect key={i} x={rm.x * U} y={rm.y * U} width={rm.w * U} height={rm.h * U} fill={rm.tint} stroke={INK} strokeWidth={3} />
      ))}
      {d.furniture && (
        <g transform={`translate(${d.furniture.c * U + U / 2} ${d.furniture.r * U + U / 2})`}>
          <rect x={-13} y={-13} width={26} height={26} rx={3} fill={PRINT.card} stroke={INK} strokeWidth={2} />
          <path d="M-4 -8 h8 M-3 -8 v6 l-6 10 h18 l-6 -10 v-6" fill={PRINT.yellow} stroke={INK} strokeWidth={1.75} strokeLinejoin="round" />
        </g>
      )}
      {d.lock && (
        <g transform={`translate(${(d.lock.c + 1) * U} ${d.lock.r * U + U / 2})`}>
          <rect x={-7} y={-3} width={14} height={11} rx={2} fill={PRINT.yellow} stroke={INK} strokeWidth={1.75} />
          <path d="M-4 -3 v-4 a4 4 0 0 1 8 0 v4" fill="none" stroke={INK} strokeWidth={2} />
        </g>
      )}
      {d.line && (
        <motion.line
          x1={d.line[0].c * U + U / 2}
          y1={d.line[0].r * U + U / 2}
          x2={d.line[1].c * U + U / 2}
          y2={d.line[1].r * U + U / 2}
          stroke={PRINT.red}
          strokeWidth={2.5}
          strokeDasharray="6 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
      )}
      {d.people.map((p, i) => {
        const cx = p.c * U + U / 2;
        const cy = p.r * U + U / 2;
        return (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 520, damping: 22 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {p.liar && <circle cx={cx} cy={cy} r={17.5} fill="none" stroke={PRINT.red} strokeWidth={2} strokeDasharray="3.5 3" />}
            <circle cx={cx} cy={cy} r={13} fill={COLORS[p.k]} stroke={INK} strokeWidth={2} />
            <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill={LETTER[p.k]} fontFamily="Archivo, 'IBM Plex Sans', sans-serif">
              {p.k === 'S' ? '' : p.k}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

function Key({ k, label }: { k: Tok['k']; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="grid size-[18px] place-items-center rounded-full border-2 border-[var(--fp-ink)] font-display text-[12px] font-extrabold leading-none"
        style={{ background: COLORS[k], color: LETTER[k] }}
      >
        {k === 'S' ? '' : k}
      </span>
      {label}
    </span>
  );
}

export function ScenarioExplainer({
  variant,
  open,
  onClose,
  isNew,
  attic,
  onAtticRules,
}: {
  variant: Variant;
  open: boolean;
  onClose: () => void;
  isNew: boolean;
  /** Extra Extreme case: add the attic reminders (and a link to the full card) */
  attic?: boolean;
  onAtticRules?: () => void;
}) {
  const meta = VARIANT_META[variant];
  const accomplice = variant.includes('ccomplice');
  const liar = DIAGRAMS[variant].people.some((p) => p.liar);
  return (
    <Overlay open={open} onClose={onClose} label={`Scenario: ${meta.name}`}>
      <div className="grid min-h-dvh place-items-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 460, damping: 32 }}
          className="fp-panel fp-panel--glow w-full max-w-md p-5"
        >
          <div className="flex items-center gap-2">
            {isNew ? <span className="fp-plate">New scenario</span> : <span className="text-[13px] font-semibold text-[var(--fp-muted)]">Scenario</span>}
          </div>
          <h2 className="mt-2 flex items-center gap-2 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em]">
            <VariantIcon variant={variant} className="size-6 shrink-0 text-[var(--fp-accent)]" size={24} />
            {meta.name}
          </h2>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <MiniPlan variant={variant} className="w-40 shrink-0" />
            <div className="text-[15px] leading-relaxed text-[var(--fp-ink)]">
              <p>{meta.blurb}</p>
              <p className="mt-2 font-semibold">{meta.accuse}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[var(--fp-hair)] pt-3 text-[13px] text-[var(--fp-ink)]">
            <Key k="V" label="Victim" />
            <Key k="K" label="Killer" />
            {accomplice && <Key k="A" label="Accomplice" />}
            <Key k="S" label="Suspect" />
            {liar && (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-[18px] rounded-full border-2 border-dashed border-[var(--fp-accent)]" />
                Liar
              </span>
            )}
          </div>
          <p className="mt-2 text-[13px] text-[var(--fp-muted)]">One person per row and per column, always.</p>
          {attic && (
            <p className="mt-2 rounded-md px-3 py-2 text-[13px] leading-snug text-[var(--attic-ink)] fp-attic">
              <b>Extra Extreme:</b> no coordinates. “Could see” is a clear row, column or diagonal (blocking furniture cuts it, people don’t);
              “beside” a person is diagonal; “closer” counts steps; an “if… then…” with a false first part is true.{' '}
              {onAtticRules && (
                <button type="button" onClick={onAtticRules} className="font-semibold text-[var(--attic-red-ink)] underline underline-offset-2">
                  More
                </button>
              )}
            </p>
          )}
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
