import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PageShell, Plate, SkinProvider, useFpReduced } from '@/grid/ui';

interface Mode {
  id: string;
  to: string;
  name: string;
  plate: string;
  line: string;
  facts: string[];
  district: string;
  art: ReactNode;
}

// Two-colour line drawings: ink strokes, white / yellow / red flat fills. No glows, no idle motion.
const INK = 'var(--fp-ink)';
const RED = 'var(--fp-accent)';
const HL = 'var(--fp-hl)';
const CARD = 'var(--fp-panel)';
const S = { stroke: INK, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const BlitzArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <rect x="72" y="10" width="16" height="9" rx="2" fill={RED} stroke={INK} strokeWidth="2" />
    <line x1="80" y1="19" x2="80" y2="23" {...S} />
    <circle cx="80" cy="60" r="37" fill={CARD} stroke={INK} strokeWidth="2.5" />
    <path d="M80 60 L80 28 A32 32 0 0 1 107.7 44 Z" fill={HL} stroke={INK} strokeWidth="1.5" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={80 + Math.sin(a) * 30} y1={60 - Math.cos(a) * 30} x2={80 + Math.sin(a) * 34} y2={60 - Math.cos(a) * 34} {...S} strokeWidth={1.6} />;
    })}
    <line x1="80" y1="60" x2="105" y2="46" stroke={RED} strokeWidth="3" strokeLinecap="round" />
    <circle cx="80" cy="60" r="3.5" fill={INK} />
    <text x="80" y="86" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill={INK}>3:00</text>
  </svg>
);

const GauntletArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    {Array.from({ length: 7 }, (_, i) => {
      const x = 12 + i * 20;
      const h = 22 + i * 10;
      return (
        <g key={i}>
          <rect x={x} y={100 - h} width="16" height={h} rx="1.5" fill={i === 6 ? HL : CARD} stroke={INK} strokeWidth="1.8" />
          <rect x={x + 5} y={100 - h + 6} width="6" height="8" rx="1" fill={INK} />
        </g>
      );
    })}
    <path d="M6 100 H154" {...S} strokeWidth={2.5} />
    <path d="M134 14 l9 9 m0 -9 l-9 9" stroke={RED} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const WeeklyArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <rect x="38" y="12" width="84" height="84" fill={CARD} stroke={INK} strokeWidth="2" />
    {Array.from({ length: 13 }, (_, i) => (
      <g key={i}>
        <line x1={38 + (i + 1) * 6} y1="12" x2={38 + (i + 1) * 6} y2="96" stroke="var(--fp-hair)" strokeWidth="0.8" />
        <line x1="38" y1={12 + (i + 1) * 6} x2="122" y2={12 + (i + 1) * 6} stroke="var(--fp-hair)" strokeWidth="0.8" />
      </g>
    ))}
    <rect x="38" y="12" width="84" height="84" fill="none" stroke={INK} strokeWidth="2.5" />
    <path d="M38 54 H80 V96 M80 54 V12 M80 72 H122" stroke={INK} strokeWidth="2.5" fill="none" />
    <circle cx="59" cy="33" r="3.5" fill={RED} stroke={INK} strokeWidth="1" />
    <circle cx="101" cy="84" r="3.5" fill={RED} stroke={INK} strokeWidth="1" />
    <path d="M138 18 a13 13 0 1 0 9 22 a10 10 0 1 1 -9 -22z" fill={HL} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const ZenArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <ellipse cx="78" cy="94" rx="46" ry="6" fill={CARD} stroke={INK} strokeWidth="2" />
    <path d="M48 56 h56 v12 a28 28 0 0 1 -56 0z" fill={CARD} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M104 62 a10 10 0 0 1 0 20" {...S} strokeWidth={2.2} />
    <ellipse cx="76" cy="56" rx="28" ry="4.5" fill={HL} stroke={INK} strokeWidth="2" />
    {[64, 78, 92].map((x) => (
      <path key={x} d={`M${x} 46 q-6 -7 0 -14 q6 -7 0 -14`} {...S} strokeWidth={1.8} />
    ))}
  </svg>
);

const CustomArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <circle cx="58" cy="56" r="31" fill={CARD} stroke={INK} strokeWidth="2.5" />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <line key={i} x1={58 + Math.sin(a) * 24} y1={56 - Math.cos(a) * 24} x2={58 + Math.sin(a) * 29} y2={56 - Math.cos(a) * 29} {...S} strokeWidth={1.6} />;
    })}
    <circle cx="58" cy="56" r="11" fill={RED} stroke={INK} strokeWidth="2" />
    <line x1="58" y1="56" x2="58" y2="36" {...S} strokeWidth={3} />
    <rect x="98" y="34" width="52" height="44" rx="4" fill={HL} stroke={INK} strokeWidth="2" />
    <text x="124" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)" fill={INK}>ASH-H</text>
    <text x="124" y="68" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill={INK}>12</text>
  </svg>
);

const MODES: Mode[] = [
  {
    id: 'blitz', to: '/plans/blitz', name: 'Blitz', plate: '3:00', district: 'neon',
    line: 'Three minutes on the clock. Small classic cases, back to back. Clean solves buy you time.',
    facts: ['Timed', 'Classic only', 'Best score kept'], art: BlitzArt,
  },
  {
    id: 'gauntlet', to: '/plans/gauntlet', name: 'Gauntlet', plate: '7 floors', district: 'express',
    line: 'Seven cases of rising difficulty and new scenarios. One burned file ends the run. No Otto.',
    facts: ['No hints', 'One life', 'Best floor kept'], art: GauntletArt,
  },
  {
    id: 'weekly', to: '/plans/weekly', name: 'Weekly Mastermind', plate: '14×14', district: 'meridian',
    line: 'One giant double homicide per week, with a liar among the killers. Beat your own best time.',
    facts: ['Liar’s Double', 'Resets Monday', 'Personal best'], art: WeeklyArt,
  },
  {
    id: 'zen', to: '/plans/zen', name: 'Zen', plate: 'No clock', district: 'hollowmere',
    line: 'Pick a floor, pour some tea. No timer, no stars, no burning. Otto helps as often as you like.',
    facts: ['No timer', 'Never burns', 'Unlimited Otto'], art: ZenArt,
  },
  {
    id: 'custom', to: '/plans/custom', name: 'Custom & Codes', plate: 'Builder', district: 'frostmere',
    line: 'Build a case (district, floor, size, scenario, seed) or type a case code a friend sent you.',
    facts: ['4×4 – 14×14', 'Any scenario', 'Shareable codes'], art: CustomArt,
  },
];

const CARD_CLS =
  'group grid h-full grid-cols-1 overflow-hidden rounded-lg border-2 border-(--fp-ink) shadow-print transition-[transform,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--fp-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none';
const SPLIT = 'min-[520px]:grid-cols-[minmax(9rem,11rem)_minmax(0,1fr)]';

/** /plans/modes — after-hours modes. */
export default function ModesScreen() {
  const reduced = useFpReduced();
  return (
    <SkinProvider district="ashcombe">
      <PageShell title="After hours" kicker="Lantern Bureau · Modes" back="/plans" backLabel="Back to the Bureau">
        <div className="max-w-3xl">
          <h2 className="fp-display text-(--fp-ink)">After hours</h2>
          <p className="mt-2 text-[15px] text-(--fp-muted)">The regular files can wait. These are the cases the night shift plays for pride.</p>
        </div>

        <section aria-label="Modes" className="mt-6">
          <ul className="grid gap-5 lg:grid-cols-2">
            {MODES.map((m, i) => (
              <motion.li
                key={m.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : i * 0.03, type: 'spring', stiffness: 420, damping: 32 }}
              >
                <SkinProvider district={m.district} className="h-full">
                  <Link to={m.to} className={`${CARD_CLS} ${SPLIT} bg-(--fp-panel)`}>
                    <div className="relative h-32 border-b-2 border-(--fp-ink) bg-(--fp-bg) px-6 py-3 min-[520px]:h-auto min-[520px]:border-b-0 min-[520px]:border-r-2">
                      {m.art}
                    </div>
                    <div className="flex min-w-0 flex-col p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="flex items-baseline gap-2 font-display text-[1.4rem] font-extrabold leading-tight tracking-[-0.02em] text-(--fp-ink)">
                          <span className="font-mono text-[0.75em] font-semibold text-(--fp-accent)">{String(i + 1).padStart(2, '0')}</span>
                          {m.name}
                        </h3>
                        <Plate className="mt-1 font-mono">{m.plate}</Plate>
                      </div>
                      <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-(--fp-muted)">{m.line}</p>
                      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-(--fp-hair) pt-2.5 text-[13px] font-semibold text-(--fp-ink)">
                        {m.facts.map((f, j) => (
                          <li key={f} className="inline-flex items-center gap-3">
                            {j > 0 && <span aria-hidden className="size-1 rounded-full bg-(--fp-ink)" />}
                            {f}
                          </li>
                        ))}
                      </ul>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-(--fp-accent2)">
                        Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </SkinProvider>
              </motion.li>
            ))}
            <motion.li
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : MODES.length * 0.03, type: 'spring', stiffness: 420, damping: 32 }}
            >
              <Link to="/plans/daily" className={`${CARD_CLS} bg-[color-mix(in_srgb,var(--fp-hl)_45%,white)]`}>
                <div className="flex h-full flex-col justify-center gap-2 p-5">
                  <Plate dark className="self-start">
                    Every day
                  </Plate>
                  <h3 className="font-display text-[1.4rem] font-extrabold leading-tight tracking-[-0.02em] text-(--fp-ink)">Today’s case</h3>
                  <p className="text-[15px] text-(--fp-ink)">A new district and floor every morning. Keep the streak lit.</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-(--fp-accent2)">
                    Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.li>
          </ul>
        </section>
      </PageShell>
    </SkinProvider>
  );
}
