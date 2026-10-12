/** Full-screen CASE BURNED overlay: the case sheet chars into a growing hole, sparks rise, ash falls (one pass, no loop). */
import { useEffect, useMemo } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Flame, RotateCcw } from 'lucide-react';
import { PRINT } from '@/grid/ui';
import { BrassBtn, GhostBtn, Overlay } from './parts';

export interface BurnAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

/** Printed palette: a ruled white sheet, a charred brown rim, red/orange sparks, grey ash. No glows. */
const P = {
  backdrop: 'rgb(241 241 236 / 0.97)',
  sheet: `repeating-linear-gradient(180deg, transparent 0 27px, ${PRINT.rule} 27px 28px), ${PRINT.card}`,
  edgeHot: '#E8762B',
  edgeChar: '#2A160C',
  spark: [PRINT.red, '#E8762B'],
  ash: PRINT.muted,
} as const;

export function BurnOverlay({
  open,
  title,
  message,
  actions,
}: {
  open: boolean;
  title: string;
  message?: string;
  actions: BurnAction[];
}) {
  return (
    <Overlay open={open} label="Case burned" backdrop={P.backdrop}>
      <BurnScene title={title} message={message} actions={actions} />
    </Overlay>
  );
}

function BurnScene({ title, message, actions }: { title: string; message?: string; actions: BurnAction[] }) {
  const reduced = useReducedMotion() ?? false;
  const r = useMotionValue(reduced ? 140 : 0);
  const mask = useTransform(r, (v) => `radial-gradient(circle at 50% 108%, transparent ${v}%, black ${v + 4}%)`);
  const edge = useTransform(
    r,
    (v) =>
      `radial-gradient(circle at 50% 108%, transparent ${Math.max(0, v - 1)}%, ${P.edgeHot} ${v}%, ${P.edgeChar} ${v + 1.5}%, rgb(42 22 12 / 0.35) ${v + 5}%, transparent ${v + 9}%)`,
  );
  useEffect(() => {
    if (reduced) return;
    const c = animate(r, 140, { duration: 2.4, ease: [0.4, 0, 0.6, 1] });
    return () => c.stop();
  }, [r, reduced]);

  const sparks = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        x: (i * 37) % 100,
        size: 3 + (i % 3),
        dur: 1.8 + ((i * 13) % 14) / 10,
        delay: ((i * 7) % 24) / 10,
        drift: ((i * 29) % 60) - 30,
      })),
    [],
  );
  const ash = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: (i * 47) % 100,
        size: 4 + (i % 5) * 2,
        dur: 4 + (i % 4),
        delay: ((i * 11) % 30) / 10,
        spin: (i % 2 ? 1 : -1) * (120 + i * 20),
      })),
    [],
  );

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      {/* the burning sheet */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-x-[8%] inset-y-[10%] max-w-3xl justify-self-center">
          <motion.div
            className="absolute inset-0 rounded-[6px]"
            style={{ background: P.sheet, boxShadow: `inset 0 0 0 2px ${PRINT.ink}`, maskImage: mask, WebkitMaskImage: mask }}
          />
          <motion.div className="absolute inset-0 rounded-[6px]" style={{ background: edge }} />
        </div>
      )}
      {/* sparks (one pass) */}
      {!reduced &&
        sparks.map((e, i) => (
          <motion.span
            key={`e${i}`}
            aria-hidden
            className="pointer-events-none absolute bottom-0"
            style={{ left: `${e.x}%`, width: e.size, height: e.size, background: P.spark[i % 3 ? 0 : 1] }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: '-90vh', x: e.drift, opacity: [0, 1, 1, 0] }}
            transition={{ duration: e.dur, delay: e.delay, ease: 'easeOut' }}
          />
        ))}
      {/* ash (one pass) */}
      {!reduced &&
        ash.map((a, i) => (
          <motion.span
            key={`a${i}`}
            aria-hidden
            className="pointer-events-none absolute top-0 rounded-[1px]"
            style={{ left: `${a.x}%`, width: a.size, height: a.size * 0.6, background: P.ash }}
            initial={{ y: '-10vh', opacity: 0 }}
            animate={{ y: '110vh', rotate: a.spin, opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: a.dur, delay: 1 + a.delay, ease: 'linear' }}
          />
        ))}

      <motion.div
        className="relative z-10 flex max-w-lg flex-col items-center text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.1, type: 'spring', stiffness: 420, damping: 30 }}
      >
        <span className="mb-4 grid size-14 place-items-center rounded-[8px] border-2 border-[var(--fp-ink)] bg-[var(--fp-accent)] text-white">
          <Flame aria-hidden className="size-8" strokeWidth={2.25} />
        </span>
        <h2
          className="font-display text-6xl font-black uppercase leading-[0.9] tracking-[-0.01em] text-[var(--fp-accent)] sm:text-8xl"
          style={{ fontStretch: '75%' }}
        >
          Case burned
        </h2>
        <p className="mt-3 font-display text-xl font-extrabold tracking-[-0.02em] text-[var(--fp-ink)]">{title}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--fp-ink)]">
          {message ?? 'The file went up in smoke. Time and pins are lost. The scorch mark stays on the case card.'}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {actions.map((a, i) =>
            a.primary ? (
              <BrassBtn key={i} onClick={a.onClick} data-autofocus size="lg" icon={<RotateCcw className="size-4" />}>
                {a.label}
              </BrassBtn>
            ) : (
              <GhostBtn key={i} onClick={a.onClick} size="lg">
                {a.label}
              </GhostBtn>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}
