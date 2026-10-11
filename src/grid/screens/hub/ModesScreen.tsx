import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PageShell, Panel, Plate, SkinProvider, useFpReduced } from '@/grid/ui';

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

const S = { stroke: 'var(--fp-accent2)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const BlitzArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <circle cx="80" cy="60" r="38" fill="color-mix(in srgb, var(--fp-glow) 10%, transparent)" {...{ stroke: S.stroke, strokeWidth: 2 }} />
    <rect x="72" y="12" width="16" height="8" rx="2" fill="var(--fp-accent)" />
    <line x1="80" y1="20" x2="80" y2="22" {...S} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={80 + Math.sin(a) * 32} y1={60 - Math.cos(a) * 32} x2={80 + Math.sin(a) * 35} y2={60 - Math.cos(a) * 35} {...S} strokeWidth={1.4} />;
    })}
    <path d="M80 60 L80 30 A30 30 0 0 1 106 45 Z" fill="var(--fp-glow)" opacity="0.35" />
    <line x1="80" y1="60" x2="104" y2="46" {...S} strokeWidth={2.6} className="origin-[80px_60px] animate-[fp-spin_3s_linear_infinite]" />
    <circle cx="80" cy="60" r="3" fill="var(--fp-accent2)" />
    <text x="80" y="88" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--fp-ink)">3:00</text>
  </svg>
);

const GauntletArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    {Array.from({ length: 7 }, (_, i) => {
      const x = 12 + i * 20;
      const h = 22 + i * 10;
      return (
        <g key={i}>
          <rect x={x} y={100 - h} width="16" height={h} rx="2" fill={`color-mix(in srgb, var(--fp-accent) ${18 + i * 10}%, transparent)`} stroke="var(--fp-accent2)" strokeWidth="1.2" />
          <rect x={x + 5} y={100 - h + 6} width="6" height="9" rx="3" fill={i === 6 ? 'var(--fp-glow)' : 'var(--fp-bg)'} />
        </g>
      );
    })}
    <path d="M10 100 H150" {...S} />
    <path d="M136 16 l6 6 m0 -6 l-6 6" stroke="var(--fp-danger)" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const WeeklyArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <rect x="40" y="12" width="84" height="84" fill="color-mix(in srgb, var(--fp-panel) 60%, transparent)" stroke="var(--fp-accent2)" strokeWidth="1.5" />
    {Array.from({ length: 13 }, (_, i) => (
      <g key={i} opacity="0.35">
        <line x1={40 + (i + 1) * 6} y1="12" x2={40 + (i + 1) * 6} y2="96" stroke="var(--fp-accent)" strokeWidth="0.6" />
        <line x1="40" y1={12 + (i + 1) * 6} x2="124" y2={12 + (i + 1) * 6} stroke="var(--fp-accent)" strokeWidth="0.6" />
      </g>
    ))}
    <path d="M40 54 H82 V96 M82 54 V12 M82 72 H124" stroke="var(--fp-accent2)" strokeWidth="2" fill="none" />
    <circle cx="61" cy="33" r="3" fill="var(--fp-danger)" />
    <circle cx="103" cy="84" r="3" fill="var(--fp-danger)" />
    <path d="M138 22 a12 12 0 1 0 8 20 a9 9 0 1 1 -8 -20z" fill="var(--fp-glow)" opacity="0.85" />
  </svg>
);

const ZenArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <ellipse cx="80" cy="96" rx="46" ry="6" fill="#000" opacity="0.3" />
    <path d="M48 58 h56 v10 a28 28 0 0 1 -56 0z" fill="color-mix(in srgb, var(--fp-accent) 35%, var(--fp-panel))" stroke="var(--fp-accent2)" strokeWidth="1.5" />
    <path d="M104 64 a10 10 0 0 1 0 18" {...S} strokeWidth={1.6} />
    <ellipse cx="76" cy="58" rx="28" ry="4" fill="color-mix(in srgb, var(--fp-glow) 40%, var(--fp-bg))" />
    {[64, 78, 92].map((x, i) => (
      <path key={x} d={`M${x} 48 q-6 -8 0 -16 q6 -8 0 -16`} {...S} strokeWidth={1.4} opacity="0.6" className="fp-twinkle" style={{ animationDelay: `${i * 0.8}s` }} />
    ))}
  </svg>
);

const CustomArt = (
  <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
    <circle cx="60" cy="56" r="30" fill="color-mix(in srgb, var(--fp-accent) 20%, transparent)" stroke="var(--fp-accent2)" strokeWidth="2" />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <line key={i} x1={60 + Math.sin(a) * 24} y1={56 - Math.cos(a) * 24} x2={60 + Math.sin(a) * 30} y2={56 - Math.cos(a) * 30} {...S} strokeWidth={1.4} />;
    })}
    <circle cx="60" cy="56" r="10" fill="var(--fp-accent)" />
    <line x1="60" y1="56" x2="60" y2="38" {...S} strokeWidth={3} />
    <rect x="98" y="34" width="50" height="44" rx="6" fill="color-mix(in srgb, var(--fp-panel) 70%, transparent)" stroke="var(--fp-accent)" strokeWidth="1.5" />
    <text x="123" y="52" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--fp-ink)">ASH-H</text>
    <text x="123" y="66" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fp-glow)">12</text>
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
    line: 'Pick a floor, pour some tea. No timer, no stars, no burning — Otto helps as often as you like.',
    facts: ['No timer', 'Never burns', 'Unlimited Otto'], art: ZenArt,
  },
  {
    id: 'custom', to: '/plans/custom', name: 'Custom & Codes', plate: 'Builder', district: 'frostmere',
    line: 'Build a case — district, floor, size, scenario, seed — or type a case code a friend sent you.',
    facts: ['4×4 – 14×14', 'Any scenario', 'Shareable codes'], art: CustomArt,
  },
];

/** /plans/modes — after-hours modes. */
export default function ModesScreen() {
  const reduced = useFpReduced();
  return (
    <SkinProvider district="ashcombe">
      <PageShell title="After hours" kicker="Lantern Bureau · Modes" back="/plans" backLabel="Back to the Bureau">
        <p className="max-w-2xl text-[15px] text-(--fp-muted)">
          The regular files can wait. These are the cases the night shift plays for pride.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODES.map((m, i) => (
            <motion.li
              key={m.id}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.06, type: 'spring', stiffness: 240, damping: 24 }}
              className={i === 0 ? 'xl:col-span-1' : undefined}
            >
              <SkinProvider district={m.district} className="h-full">
                <Link to={m.to} className="group block h-full rounded-[10px]">
                  <Panel className="flex h-full flex-col overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
                    <div
                      className="relative h-36 border-b px-6 pt-4"
                      style={{
                        borderColor: 'var(--fp-hair)',
                        background: 'radial-gradient(80% 90% at 50% 100%, color-mix(in srgb, var(--fp-glow) 16%, transparent), transparent 70%), var(--fp-bg)',
                      }}
                    >
                      {m.art}
                      <Plate className="absolute right-3 top-3">{m.plate}</Plate>
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h2 className="font-display text-2xl font-bold">{m.name}</h2>
                      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-(--fp-muted)">{m.line}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.facts.map((f) => (
                          <span key={f} className="fp-chip px-2.5 py-1 text-[11px]">
                            {f}
                          </span>
                        ))}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-(--fp-hi)">
                        Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </div>
                  </Panel>
                </Link>
              </SkinProvider>
            </motion.li>
          ))}
          <motion.li
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : MODES.length * 0.06 }}
          >
            <Link to="/plans/daily" className="group block h-full rounded-[10px]">
              <Panel tone="glow" className="flex h-full flex-col justify-center gap-2 p-5 transition-transform group-hover:-translate-y-1">
                <Plate className="self-start">Every day</Plate>
                <h2 className="font-display text-2xl font-bold">Today’s case</h2>
                <p className="text-sm text-(--fp-muted)">A new district and floor every morning. Keep the streak lit.</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-(--fp-hi)">
                  Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Panel>
            </Link>
          </motion.li>
        </ul>
      </PageShell>
    </SkinProvider>
  );
}
