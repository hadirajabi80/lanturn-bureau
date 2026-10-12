import { motion } from 'framer-motion';
import { useFpReduced } from './useFpReduced';

/** Fill order of the 3×3 plan (a snake, like a pencil working across a grid); the last cell is the victim's room. */
const ORDER = [0, 1, 2, 5, 4, 3, 6, 7, 8];
const STEP = 0.16;
const CYCLE = ORDER.length * STEP + 0.7;

/**
 * Loading indicator (name kept from v2): a small 3×3 floor plan whose rooms are highlighted in one by one,
 * the last one in red. Reduced motion: a still, half-filled plan.
 */
export function LanternLoader({ label = 'Opening the file…', size = 56 }: { label?: string; size?: number }) {
  const reduced = useFpReduced();
  const cell = 14;
  const gap = 2;
  const W = cell * 3 + gap * 4;
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50dvh] flex-col items-center justify-center gap-3">
      <svg viewBox={`0 0 ${W} ${W}`} width={size} height={size} aria-hidden>
        <rect x={0.75} y={0.75} width={W - 1.5} height={W - 1.5} rx={2} fill="#FFFFFF" stroke="var(--fp-ink, #141414)" strokeWidth={1.5} />
        {ORDER.map((idx, k) => {
          const x = gap + (idx % 3) * (cell + gap);
          const y = gap + Math.floor(idx / 3) * (cell + gap);
          const last = k === ORDER.length - 1;
          const fill = last ? 'var(--fp-accent, #D7261E)' : 'var(--fp-hl, #FFD84D)';
          if (reduced) {
            return <rect key={idx} x={x} y={y} width={cell} height={cell} rx={1} fill={k < 4 || last ? fill : '#FFFFFF'} stroke="var(--fp-ink, #141414)" strokeWidth={1} />;
          }
          const t0 = (k * STEP) / CYCLE;
          const t1 = Math.min(0.999, (k * STEP + 0.08) / CYCLE);
          return (
            <g key={idx}>
              <rect x={x} y={y} width={cell} height={cell} rx={1} fill="#FFFFFF" stroke="var(--fp-ink, #141414)" strokeWidth={1} />
              <motion.rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx={1}
                fill={fill}
                stroke="var(--fp-ink, #141414)"
                strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{ duration: CYCLE, times: [0, t0, t1, 0.94, 1], repeat: Infinity, ease: 'linear' }}
              />
            </g>
          );
        })}
      </svg>
      <span className="text-[13px] font-semibold text-[var(--fp-muted,#5E5E5A)]">{label}</span>
    </div>
  );
}
