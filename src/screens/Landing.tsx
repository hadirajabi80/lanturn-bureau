import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { sfx } from '@/engine/audio';
import { DISTRICTS } from '@/grid/skins/districts';
import { BrassButton, DeskBackground, FacadeArt, FACADE_SIZE, GhostButton, SkinProvider, useFpReduced } from '@/grid/ui';
import { districtTally, useProgressMap } from '@/grid/ui/bridge';

const WORDS = ['FLOORPLAN', 'MYSTERIES'];

/** Title screen: Floorplan Mysteries — a Lantern Bureau casebook. Enter → /plans. */
export default function Landing() {
  const navigate = useNavigate();
  const reduced = useFpReduced();
  const progress = useProgressMap();
  const closed = useMemo(() => DISTRICTS.reduce((a, d) => a + districtTally(progress, d.id).solved, 0), [progress]);
  const total = useMemo(() => DISTRICTS.reduce((a, d) => a + districtTally({}, d.id).total, 0), []);

  const enter = () => {
    sfx.stamp();
    navigate('/plans');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const a = document.activeElement;
      if (!a || a === document.body || a === document.documentElement) navigate('/plans');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  let li = 0;

  return (
    <SkinProvider district="ashcombe">
      <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
        <DeskBackground />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-5 font-mono text-[10px] uppercase tracking-[0.45em] text-(--fp-accent) sm:text-[11px]"
          >
            A Lantern Bureau casebook · Greywick
          </motion.div>

          <h1 className="font-display font-black leading-[0.92] tracking-tight" aria-label="Floorplan Mysteries">
            {WORDS.map((word, wi) => (
              <span key={word} className="block whitespace-nowrap" aria-hidden>
                {word.split('').map((ch) => {
                  const i = li++;
                  return (
                    <motion.span
                      key={i}
                      className={
                        wi === 0
                          ? 'inline-block text-[clamp(2.1rem,10.5vw,7.5rem)] text-(--fp-ink) [text-shadow:0_6px_40px_color-mix(in_srgb,var(--fp-glow)_30%,transparent)]'
                          : 'text-shimmer inline-block text-[clamp(2.1rem,10.5vw,7.5rem)]'
                      }
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -60 - ((i * 37) % 50), rotate: ((i * 29) % 24) - 12 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={
                        reduced ? { duration: 0.3, delay: 0.1 } : { type: 'spring', stiffness: 280, damping: 15, delay: 0.25 + i * 0.045 }
                      }
                    >
                      {ch}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0.2 : 1.2, duration: 0.5 }}
            className="mt-5 max-w-xl text-balance text-[clamp(0.95rem,0.85rem+0.4vw,1.15rem)] leading-relaxed text-(--fp-muted)"
          >
            {DISTRICTS.length} buildings. {total.toLocaleString()} floor plans. Pin every suspect to the right square — then
            name the killer before the file burns.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0.3 : 1.45, duration: 0.45 }}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <BrassButton size="lg" onClick={enter} iconRight={<ArrowRight className="size-5" />} autoFocus={false}>
              Enter the Bureau
            </BrassButton>
            <GhostButton size="lg" to="/plans/daily" icon={<CalendarDays className="size-5" />}>
              Today’s case
            </GhostButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0.4 : 1.8 }}
            className="mt-6 flex items-center gap-3 font-mono text-[11px] text-(--fp-muted)"
          >
            <span className="tabular-nums">
              {closed.toLocaleString()} / {total.toLocaleString()} cases closed
            </span>
            <span className="size-1 rounded-full bg-(--fp-muted) opacity-50" />
            <span className="hidden sm:inline">
              press <kbd className="rounded px-1.5 py-0.5" style={{ boxShadow: 'inset 0 0 0 1px var(--fp-hair-strong)' }}>Enter</kbd>
            </span>
          </motion.div>
        </div>

        {/* skyline strip */}
        <motion.div
          aria-hidden
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.1 : 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-0 flex items-end justify-center overflow-hidden"
          style={{ height: 'clamp(96px, 18vh, 190px)' }}
        >
          <div className="flex shrink-0 items-end" style={{ height: '100%' }}>
            {DISTRICTS.map((d, i) => {
              const s = FACADE_SIZE[d.facade.shape];
              const t = districtTally(progress, d.id);
              return (
                <div key={d.id} className="shrink-0" style={{ height: `${(s.h / 330) * 100}%`, marginLeft: i ? '-0.4%' : 0 }}>
                  <FacadeArt district={d} sky={false} litFraction={Math.max(0.18, t.total ? t.solved / t.total : 0)} height="100%" />
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5" style={{ background: 'linear-gradient(to top, var(--fp-bg), transparent)' }} />
        </motion.div>
      </div>
    </SkinProvider>
  );
}
