/** Full-screen CASE BURNED overlay: paper curls into a growing hole, embers rise, ash falls. */
import { useEffect, useMemo } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Flame, RotateCcw } from 'lucide-react';
import { BrassBtn, GhostBtn, Overlay, useDeskMood } from './parts';

export interface BurnAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

/** Night = charred embers; light districts = a softer pastel "scorch". */
const PALETTE = {
  night: {
    backdrop: 'rgb(8 3 1 / 0.9)',
    heat: 'radial-gradient(90% 60% at 50% 110%, rgb(255 90 20 / 0.45), rgb(120 20 0 / 0.25) 40%, transparent 70%)',
    sheet: 'repeating-linear-gradient(180deg, transparent 0 28px, rgb(90 70 40 / 0.12) 28px 29px), linear-gradient(170deg,#efe2c6,#d9c49c)',
    edgeHot: 'rgb(255 140 40 / 0.95)',
    edgeChar: 'rgb(120 30 0 / 0.8)',
    ember: ['#ffb347', '#ff6a1a'],
    emberGlow: '0 0 8px 2px rgb(255 120 30 / 0.7)',
    ash: '#3a332d',
    flame: '#ff8a3d',
    title: '#1d120c',
    titleStroke: '1px rgb(255 140 60 / 0.65)',
    titleShadow: '0 0 18px rgb(255 100 20 / 0.85), 0 0 3px rgb(255 190 120 / 0.9), 0 3px 0 #000',
    text: '#f0d9c0',
    sub: '#d7b9a0',
  },
  light: {
    backdrop: 'rgb(74 36 56 / 0.72)',
    heat: 'radial-gradient(90% 60% at 50% 110%, rgb(255 150 140 / 0.5), rgb(255 120 160 / 0.22) 40%, transparent 70%)',
    sheet: 'repeating-linear-gradient(180deg, transparent 0 28px, color-mix(in srgb, var(--fp-accent) 18%, transparent) 28px 29px), linear-gradient(170deg, color-mix(in srgb, var(--fp-accent2) 12%, white), color-mix(in srgb, var(--fp-accent) 14%, white))',
    edgeHot: 'rgb(255 170 130 / 0.95)',
    edgeChar: 'rgb(170 80 100 / 0.6)',
    ember: ['#ffc2d4', '#ffcf9e'],
    emberGlow: '0 0 8px 2px rgb(255 160 190 / 0.7)',
    ash: '#b48a9a',
    flame: '#ff8fa8',
    title: '#5a2a3a',
    titleStroke: '1px rgb(255 190 210 / 0.8)',
    titleShadow: '0 0 18px rgb(255 140 170 / 0.85), 0 0 3px rgb(255 220 230 / 0.9), 0 3px 0 rgb(90 40 60 / 0.5)',
    text: '#fde8ef',
    sub: '#f3cbd8',
  },
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
    <Overlay open={open} label="Case burned" backdrop={PALETTE[useDeskMood()].backdrop}>
      <BurnScene title={title} message={message} actions={actions} />
    </Overlay>
  );
}

function BurnScene({ title, message, actions }: { title: string; message?: string; actions: BurnAction[] }) {
  const reduced = useReducedMotion() ?? false;
  const P = PALETTE[useDeskMood()];
  const r = useMotionValue(reduced ? 140 : 0);
  const mask = useTransform(r, (v) => `radial-gradient(circle at 50% 108%, transparent ${v}%, black ${v + 6}%)`);
  const edge = useTransform(
    r,
    (v) =>
      `radial-gradient(circle at 50% 108%, transparent ${Math.max(0, v - 1)}%, ${P.edgeHot} ${v + 1}%, ${P.edgeChar} ${v + 4}%, transparent ${v + 8}%)`,
  );
  useEffect(() => {
    if (reduced) return;
    const c = animate(r, 140, { duration: 2.4, ease: [0.4, 0, 0.6, 1] });
    return () => c.stop();
  }, [r, reduced]);

  const embers = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: (i * 37) % 100,
        size: 2 + (i % 4),
        dur: 2.2 + ((i * 13) % 20) / 10,
        delay: ((i * 7) % 30) / 10,
        drift: ((i * 29) % 60) - 30,
      })),
    [],
  );
  const ash = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: (i * 47) % 100,
        size: 4 + (i % 5) * 2,
        dur: 5 + (i % 6),
        delay: ((i * 11) % 40) / 10,
        spin: (i % 2 ? 1 : -1) * (120 + i * 20),
      })),
    [],
  );

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      {/* heat glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: P.heat }}
      />
      {/* the burning sheet */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-x-[8%] inset-y-[10%] max-w-3xl justify-self-center">
          <motion.div
            className="absolute inset-0 rounded-[4px]"
            style={{
              background: P.sheet,
              maskImage: mask,
              WebkitMaskImage: mask,
              boxShadow: '0 30px 80px -20px var(--dk-shadow, rgb(0 0 0 / 0.9))',
            }}
          />
          <motion.div className="absolute inset-0 rounded-[4px] mix-blend-screen" style={{ background: edge }} />
        </div>
      )}
      {/* embers */}
      {!reduced &&
        embers.map((e, i) => (
          <motion.span
            key={`e${i}`}
            aria-hidden
            className="pointer-events-none absolute bottom-0 rounded-full"
            style={{
              left: `${e.x}%`,
              width: e.size,
              height: e.size,
              background: P.ember[i % 3 ? 0 : 1],
              boxShadow: P.emberGlow,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: '-105vh', x: e.drift, opacity: [0, 1, 1, 0] }}
            transition={{ duration: e.dur, delay: e.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      {/* ash */}
      {!reduced &&
        ash.map((a, i) => (
          <motion.span
            key={`a${i}`}
            aria-hidden
            className="pointer-events-none absolute top-0 rounded-[2px]"
            style={{ left: `${a.x}%`, width: a.size, height: a.size * 0.6, background: P.ash }}
            initial={{ y: '-10vh', opacity: 0 }}
            animate={{ y: '110vh', rotate: a.spin, opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: a.dur, delay: 1 + a.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

      <motion.div
        className="relative z-10 flex max-w-lg flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 1.1, duration: 0.5 }}
      >
        <Flame aria-hidden className="mb-3 size-10" style={{ color: P.flame, filter: `drop-shadow(0 0 12px ${P.flame})` }} />
        <h2
          className="font-display text-5xl font-black uppercase tracking-[0.08em] motion-safe:animate-flicker sm:text-7xl"
          style={{
            color: P.title,
            WebkitTextStroke: P.titleStroke,
            textShadow: P.titleShadow,
          }}
        >
          Case burned
        </h2>
        <p className="mt-3 font-display text-lg italic" style={{ color: P.text }}>{title}</p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: P.sub }}>
          {message ?? 'The file went up in smoke. Time and pins are lost. The scorch mark stays on the key tag.'}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {actions.map((a, i) =>
            a.primary ? (
              <BrassBtn key={i} onClick={a.onClick} data-autofocus icon={<RotateCcw className="size-4" />}>
                {a.label}
              </BrassBtn>
            ) : (
              <GhostBtn key={i} onClick={a.onClick} style={{ color: P.text }}>
                {a.label}
              </GhostBtn>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}
