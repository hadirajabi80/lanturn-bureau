import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { sfx } from '@/engine/audio';
import { DISTRICTS } from '@/grid/skins/districts';
import { BrassButton, DeskBackground, FacadeArt, FACADE_SIZE, GhostButton, ProgressFilament, SkinProvider, useFpReduced } from '@/grid/ui';
import { districtTally, useProgressMap } from '@/grid/ui/bridge';
import { NIGHT_PLATE } from '@/grid/screens/hub/shared';
import { isGuideDone } from '@/grid/guide';

/** Title screen: a printed title page. "All cases" (or Enter) → /plans, "Play today's case" → /plans/daily. */
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

  // one short page-in, then everything holds still
  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } }
      : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay, type: 'spring' as const, stiffness: 420, damping: 32 } };

  return (
    <SkinProvider district="ashcombe">
      <div className="relative isolate flex min-h-dvh flex-col overflow-x-hidden pt-safe pb-safe">
        <DeskBackground />

        {/* running head, like the top of a printed page */}
        <div className="mx-auto w-full max-w-[1200px] px-4 pt-4 sm:px-8 sm:pt-6">
          <div className="flex items-center justify-between gap-3 border-b-2 border-(--fp-ink) pb-2 text-[13px] font-semibold text-(--fp-ink)">
            <span className="inline-flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-[5px] bg-(--fp-ink) font-display text-[12px] font-black leading-none text-white" aria-hidden>
                FM
              </span>
              Floorplan Mysteries
            </span>
            <span className="text-(--fp-muted)">
              <span className="font-mono tabular-nums">{DISTRICTS.length}</span> buildings,{' '}
              <span className="font-mono tabular-nums">{total.toLocaleString()}</span> cases
            </span>
          </div>
        </div>

        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
          <motion.h1
            {...rise(0.02)}
            className="font-display font-black uppercase leading-[0.84] tracking-[-0.02em] text-(--fp-ink) [font-stretch:70%]"
            style={{ fontSize: 'clamp(3.4rem, min(16vw, 20vh), 11rem)' }}
          >
            <span className="block">Floorplan</span>
            <span className="block text-(--fp-accent)">Mysteries</span>
          </motion.h1>

          <motion.p
            {...rise(0.08)}
            className="mt-6 max-w-[34rem] text-pretty text-[clamp(1.05rem,0.95rem+0.5vw,1.35rem)] font-medium leading-snug text-(--fp-ink)"
          >
            Pin every suspect to the right square. Then name the killer.
          </motion.p>

          <motion.div {...rise(0.14)} className="mt-8 flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center">
            <BrassButton size="lg" to="/plans/daily" iconRight={<ArrowRight className="size-5" aria-hidden />}>
              Play today’s case
            </BrassButton>
            <GhostButton size="lg" onClick={enter}>
              All cases
            </GhostButton>
          </motion.div>

          <motion.p {...rise(0.17)} className="mt-4 text-[15px]">
            {isGuideDone() ? (
              <Link to="/plans/guide" className="font-semibold underline decoration-2 underline-offset-4 hover:bg-(--fp-hl)">
                How to play
              </Link>
            ) : (
              <>
                New here?{' '}
                <Link to="/plans/guide/practice" className="bg-(--fp-hl) px-1 font-semibold underline decoration-2 underline-offset-4">
                  Learn it in a 2-minute practice case
                </Link>
              </>
            )}
          </motion.p>

          <motion.div {...rise(0.2)} className="mt-8 w-full max-w-[22rem]">
            <div className="flex items-baseline justify-between gap-3 text-[13px] font-semibold text-(--fp-muted)">
              <span>
                <span className="font-mono text-(--fp-ink) tabular-nums">{closed.toLocaleString()}</span> of{' '}
                <span className="font-mono tabular-nums">{total.toLocaleString()}</span> cases closed
              </span>
              <span className="hidden sm:inline">
                or press{' '}
                <kbd className="rounded-[4px] bg-(--fp-panel) px-1.5 py-0.5 font-mono text-[12px] text-(--fp-ink) shadow-[inset_0_0_0_1.5px_var(--fp-ink)]">
                  Enter
                </kbd>
              </span>
            </div>
            <ProgressFilament value={total ? closed / total : 0} className="mt-2" label="Cases closed" />
          </motion.div>
        </main>

        {/* the buildings, printed as one illustration strip between two ink rules */}
        <figure aria-hidden className="m-0 border-y-2 border-(--fp-ink)" style={{ background: NIGHT_PLATE }}>
          <div className="flex items-end justify-center overflow-hidden" style={{ height: 'clamp(110px, 20vh, 200px)' }}>
            <div className="flex h-full shrink-0 items-end">
              {DISTRICTS.map((d, i) => {
                const s = FACADE_SIZE[d.facade.shape];
                const t = districtTally(progress, d.id);
                return (
                  <div key={d.id} className="shrink-0" style={{ height: `${(s.h / 330) * 92}%`, marginLeft: i ? '-0.4%' : 0 }}>
                    <FacadeArt district={d} sky={false} fog={false} litFraction={Math.max(0.18, t.total ? t.solved / t.total : 0)} height="100%" />
                  </div>
                );
              })}
            </div>
          </div>
        </figure>
        <div className="mx-auto w-full max-w-[1200px] px-4 py-2.5 text-[12px] font-medium text-(--fp-muted) sm:px-8">
          Fig. 1. Greywick, <span className="font-mono">{DISTRICTS.length}</span> buildings, one murder per floor plan.
        </div>
      </div>
    </SkinProvider>
  );
}
