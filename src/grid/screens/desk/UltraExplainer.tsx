/**
 * "Extra Extreme — No coordinates. Read the room." The first-visit card for the sealed attic (tier `ultra`):
 * shown once when a player first opens an Extra Extreme case (persisted in `seenTiers`), and again from the
 * "No coordinates" chip in the desk header.
 */
import { motion } from 'framer-motion';
import { Eye, Footprints, GitBranch, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { AtticChain, PRINT, SkullKeyGlyph } from '@/grid/ui';
import { BrassBtn, Overlay } from './parts';

/** The four definitions the attic leans on (also used by the guide). */
export const ATTIC_RULES: Array<{ key: string; icon: ReactNode; title: string; body: ReactNode }> = [
  {
    key: 'sight',
    icon: <Eye className="size-4" aria-hidden />,
    title: 'Seeing someone',
    body: (
      <>
        A clear line along a <b>row, column or diagonal</b>. Blocking furniture (tables, shelves, a piano…) cuts the line. <b>People never block it.</b>
      </>
    ),
  },
  {
    key: 'beside',
    icon: <Users className="size-4" aria-hidden />,
    title: 'Beside a person',
    body: (
      <>
        Always <b>diagonal</b>: corner to corner. Two people never share a row or a column.
      </>
    ),
  },
  {
    key: 'closer',
    icon: <Footprints className="size-4" aria-hidden />,
    title: '“Closer to the piano”',
    body: (
      <>
        Count <b>steps</b> up, down, left and right (never diagonally) to the nearest piano. Fewer steps is closer.
      </>
    ),
  },
  {
    key: 'if',
    icon: <GitBranch className="size-4" aria-hidden />,
    title: '“If… then…”',
    body: (
      <>
        Only broken when the first part is true and the second is false. <b>If the first part is false, the statement is true.</b>
      </>
    ),
  },
];

const U = 22;
const N = 5;

/** 5×5 sketch: A's sight lines run out along rows, columns and diagonals; a table stops one, a person doesn't. */
function SightSketch({ className }: { className?: string }) {
  const a = { r: 2, c: 2 };
  const table = { r: 0, c: 2 };
  const b = { r: 4, c: 4 };
  const passer = { r: 3, c: 3 };
  const ends: Array<[number, number]> = [
    [1, 2], // north: stopped by the table at (0,2)
    [4, 2], [2, 0], [2, 4], [0, 0], [0, 4], [4, 0], [4, 4],
  ];
  const ctr = (r: number, c: number) => [c * U + U / 2, r * U + U / 2] as const;
  return (
    <svg viewBox={`-4 -4 ${N * U + 8} ${N * U + 8}`} className={className} role="img" aria-label="Sight lines along rows, columns and diagonals; a table blocks one, a person does not">
      <rect x={-3} y={-3} width={N * U + 6} height={N * U + 6} rx={4} fill={PRINT.card} stroke={PRINT.ink} strokeWidth={2} />
      {Array.from({ length: N + 1 }, (_, i) => (
        <g key={i} stroke={PRINT.rule} strokeWidth={1}>
          <line x1={i * U} x2={i * U} y1={0} y2={N * U} />
          <line y1={i * U} y2={i * U} x1={0} x2={N * U} />
        </g>
      ))}
      {ends.map(([r, c], i) => {
        const [x1, y1] = ctr(a.r, a.c);
        const [x2, y2] = ctr(r, c);
        return (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#D4213D"
            strokeWidth={2}
            strokeDasharray="4 3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.04 }}
          />
        );
      })}
      {/* table (blocks) */}
      <rect x={table.c * U + 3} y={table.r * U + 3} width={U - 6} height={U - 6} rx={2} fill={PRINT.ink} />
      {/* a person on the diagonal does not block B */}
      {[passer, b].map((p, i) => {
        const [x, y] = ctr(p.r, p.c);
        return <circle key={i} cx={x} cy={y} r={7} fill={i === 1 ? PRINT.yellow : '#8C8C86'} stroke={PRINT.ink} strokeWidth={1.75} />;
      })}
      {(() => {
        const [x, y] = ctr(a.r, a.c);
        return (
          <g>
            <circle cx={x} cy={y} r={8.5} fill="#D4213D" stroke={PRINT.ink} strokeWidth={2} />
            <text x={x} y={y + 3.8} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#fff" fontFamily="Archivo, 'IBM Plex Sans', sans-serif">
              A
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

export function UltraExplainer({ open, onClose, isNew }: { open: boolean; onClose: () => void; isNew: boolean }) {
  return (
    <Overlay open={open} onClose={onClose} label="Extra Extreme: no coordinates, read the room">
      <div className="grid min-h-dvh place-items-center p-3 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 460, damping: 32 }}
          className="fp-panel fp-panel--glow w-full max-w-lg overflow-hidden"
        >
          {/* crimson-on-black header band */}
          <div className="fp-attic relative px-5 pb-4 pt-4 shadow-[inset_0_-2px_0_var(--fp-ink)]">
            <AtticChain width={78} className="pointer-events-none absolute right-4 top-2 text-(--attic-muted)" />
            <div className="flex items-center gap-2">
              <span className="fp-attic-plate">{isNew ? 'New floor' : 'The sealed attic'}</span>
            </div>
            <h2 className="mt-2 flex items-center gap-2.5 font-display text-[28px] font-black leading-none tracking-[-0.02em] text-(--attic-ink)">
              <SkullKeyGlyph size={28} className="shrink-0 text-(--attic-red-ink)" />
              Extra Extreme
            </h2>
            <p className="mt-2 font-display text-[17px] font-bold text-(--attic-ink)">
              No coordinates. <span className="text-(--attic-red-ink)">Read the room.</span>
            </p>
            <p className="mt-1 text-[13px] leading-snug text-(--attic-muted)">
              Nobody mentions rows, columns, corners or edges. Every clue is about who saw whom, who stood where, and what was in the room.
            </p>
          </div>
          <div className="px-5 pb-5 pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ul className="min-w-0 flex-1 space-y-2.5 text-[14px] leading-snug text-(--fp-ink)">
                {ATTIC_RULES.map((r) => (
                  <li key={r.key} className="flex gap-2.5">
                    <span
                      aria-hidden
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[5px] text-white"
                      style={{ background: 'var(--attic-bg)', boxShadow: 'inset 0 0 0 1.5px var(--fp-ink)' }}
                    >
                      {r.icon}
                    </span>
                    <span>
                      <b className="font-display font-extrabold">{r.title}.</b> {r.body}
                    </span>
                  </li>
                ))}
              </ul>
              <figure className="m-0 hidden shrink-0 sm:block">
                <SightSketch className="w-[118px]" />
                <figcaption className="mt-1 w-[118px] text-[11px] leading-tight text-(--fp-muted)">The table stops A’s line north. The grey person doesn’t block the yellow one.</figcaption>
              </figure>
            </div>
            <p className="mt-3 border-t border-(--fp-hair) pt-2.5 text-[13px] text-(--fp-muted)">Still one person per row and per column. You just have to prove where.</p>
            <div className="mt-4 flex justify-end">
              <BrassBtn onClick={onClose} data-autofocus>
                Open the attic
              </BrassBtn>
            </div>
          </div>
        </motion.div>
      </div>
    </Overlay>
  );
}
