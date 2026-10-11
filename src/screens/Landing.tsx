import { useEffect, useMemo, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { BookUser, Fingerprint, FolderOpen, Play } from 'lucide-react';
import { CASES, getCase } from '@/data';
import { useGame } from '@/engine/store';
import { sfx } from '@/engine/audio';
import { Fog, LanternGlow } from '@/components/fx';
import { Button } from '@/components/ui/Button';
import { useReducedFx } from '@/components/ui/useReducedFx';
import { pad2 } from './useCaseSession';

const TITLE = ['LANTERN', 'BUREAU'];

export default function Landing() {
  const navigate = useNavigate();
  const reduced = useReducedFx();
  const solved = useGame((s) => Object.values(s.progress).filter((p) => p.solved).length);
  const activeId = useGame((s) => s.activeCaseId);
  const activePhase = useGame((s) => (s.activeCaseId ? s.sessions[s.activeCaseId]?.phase : undefined));
  const resume = activeId && activePhase && activePhase !== 'solved' ? getCase(activeId) : undefined;

  // Lantern light follows the pointer.
  const mx = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 600);
  const my = useMotionValue(typeof window !== 'undefined' ? window.innerHeight * 0.4 : 300);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const light = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, rgb(255 179 71 / 0.16), rgb(212 168 87 / 0.06) 40%, transparent 70%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    mx.set(e.clientX);
    my.set(e.clientY);
  };

  const letterSeeds = useMemo(
    () => TITLE.join('').split('').map((_, i) => ({ rot: ((i * 37) % 30) - 15, y: -120 - ((i * 53) % 80) })),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement === document.body) navigate('/files');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  let li = 0;

  return (
    <div onPointerMove={onMove} className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,#1a2030_0%,#0b0e14_60%)]" />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: light }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(11_14_20/0.95),transparent)]" />
      <Fog intensity={0.75} />

      {/* rooftops silhouette */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-[#070a0f]" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden>
        <path
          fill="currentColor"
          d="M0 160 V96 h60 v-30 h28 v30 h40 V70 l30-26 30 26 v26 h52 V54 h18 V36 h12 v18 h20 v42 h70 V80 h40 V60 l24-18 24 18 v36 h60 V40 h14 v-14 h10 v14 h14 v56 h80 V72 h46 v24 h58 V58 l36-30 36 30 v38 h62 V82 h40 v14 h64 V64 h24 v32 h70 V76 h52 V160 Z"
        />
        {[90, 260, 410, 600, 770, 980, 1110].map((x, i) => (
          <rect key={x} x={x} y={100 + (i % 3) * 12} width="6" height="8" fill="#FFB347" opacity={0.35 + (i % 2) * 0.3} className="animate-flicker" />
        ))}
      </svg>

      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <LanternGlow className="w-20 sm:w-24" />
      </div>

      <div className="relative z-10 mt-24 flex flex-col items-center text-center sm:mt-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 font-mono text-[11px] uppercase tracking-[0.45em] text-brass/80"
        >
          Greywick · Lantern Street · Est. 1888
        </motion.div>

        <h1 className="font-display font-black leading-[0.9] tracking-tight" aria-label="Lantern Bureau">
          {TITLE.map((word, wi) => (
            <span key={word} className="block whitespace-nowrap" aria-hidden>
              {word.split('').map((ch) => {
                const i = li++;
                const seed = letterSeeds[i] ?? { rot: 0, y: -100 };
                return (
                  <motion.span
                    key={`${wi}-${i}`}
                    className={
                      wi === 0
                        ? 'inline-block text-[clamp(3rem,13vw,8.5rem)] text-paper [text-shadow:0_6px_40px_rgb(255_179_71/0.25)]'
                        : 'text-shimmer inline-block text-[clamp(3rem,13vw,8.5rem)]'
                    }
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: seed.y, rotate: seed.rot }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={
                      reduced
                        ? { duration: 0.3, delay: 0.1 }
                        : { type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay: 0.35 + i * 0.06 }
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.2 : 1.4, duration: 0.6 }}
          className="mt-6 max-w-xl text-balance text-base leading-relaxed text-paper/70 sm:text-lg"
        >
          Twenty case files. One rookie detective. Every lie leaves a mark — and somebody out there is drawing maps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.3 : 1.7, duration: 0.5 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            hum
            icon={<Fingerprint className="size-5" />}
            onClick={() => {
              sfx.stamp();
              navigate('/files');
            }}
          >
            Crime Files
          </Button>
          <Button
            size="lg"
            variant="ghost"
            icon={<FolderOpen className="size-5" />}
            onClick={() => {
              sfx.blip();
              navigate('/cases');
            }}
          >
            Story Cases
          </Button>
          {resume && (
            <Button
              size="lg"
              variant="ghost"
              icon={<Play className="size-4" />}
              onClick={() => navigate(`/case/${resume.id}/play`)}
            >
              Resume case {pad2(resume.number)}
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0.4 : 2.1 }}
          className="mt-8 flex items-center gap-5 text-xs text-paper/45"
        >
          <span>
            {solved}/{CASES.length} story cases closed
          </span>
          <span className="size-1 rounded-full bg-paper/25" />
          <Link to="/codex" className="inline-flex items-center gap-1 hover:text-lantern">
            <BookUser className="size-3.5" /> Codex
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 text-center text-[11px] tracking-wide text-paper/30">
        Best played with the lights low and the kettle on.
      </div>
    </div>
  );
}
