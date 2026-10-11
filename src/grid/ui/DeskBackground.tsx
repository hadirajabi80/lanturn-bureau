import { useEffect, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useFpReduced as useReduced } from './useFpReduced';
import { useSkin } from './skin';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.92 0 0 0 0 0.8 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

export interface DeskBackgroundProps {
  /** Show the drifting particles: dust motes at night, petals & sparkles on light districts (default true). */
  dust?: boolean;
  /** Lamp strength 0..1 (default 1). Night districts only. */
  lamp?: number;
}

/**
 * The desk behind every Floorplan screen. Night districts: `bg`, a warm lamp vignette that follows the
 * pointer (spring-smoothed), paper grain and dust motes. Light districts: soft pastel washes, no
 * vignette, drifting petals and sparkles. Fixed, full-viewport, pointer-events none; static under
 * reduced motion. Must sit inside a <SkinProvider>.
 */
export function DeskBackground({ dust = true, lamp = 1 }: DeskBackgroundProps) {
  const { palette, light } = useSkin();
  return light ? <DayDesk dust={dust} colors={[palette.accent, palette.glow, palette.accent2, '#ffffff']} /> : <NightDesk dust={dust} lamp={lamp} glow={palette.glow} />;
}

function NightDesk({ dust, lamp, glow }: { dust: boolean; lamp: number; glow: string }) {
  const reduced = useReduced();
  const mx = useMotionValue(50);
  const my = useMotionValue(22);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const lampBg = useMotionTemplate`radial-gradient(70vmax 55vmax at ${sx}% ${sy}%, color-mix(in srgb, var(--fp-glow) ${Math.round(
    16 * lamp,
  )}%, transparent), color-mix(in srgb, var(--fp-glow) ${Math.round(5 * lamp)}%, transparent) 40%, transparent 75%)`;

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      // Follows "slightly": the lamp only drifts within the middle band of the screen.
      mx.set(35 + (e.clientX / window.innerWidth) * 30);
      my.set(12 + (e.clientY / window.innerHeight) * 26);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, mx, my]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: 'var(--fp-bg)' }}>
      <motion.div className="absolute inset-0" style={{ background: lampBg }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 20%, transparent 45%, rgb(0 0 0 / 0.55) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      {dust && !reduced && <Particles mode="dust" colors={[glow]} />}
    </div>
  );
}

function DayDesk({ dust, colors }: { dust: boolean; colors: string[] }) {
  const reduced = useReduced();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: 'var(--fp-bg)' }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60vmax 40vmax at 12% 0%, color-mix(in srgb, var(--fp-glow) 38%, transparent), transparent 70%), radial-gradient(50vmax 40vmax at 100% 100%, color-mix(in srgb, var(--fp-accent2) 22%, transparent), transparent 70%), radial-gradient(40vmax 30vmax at 90% 10%, rgb(255 255 255 / 0.7), transparent 70%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
      {dust && !reduced && <Particles mode="petals" colors={colors} />}
    </div>
  );
}

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  p: number;
  c: string;
  sparkle: boolean;
}

/** Cheap canvas particle layer: dust motes (night) or falling petals + twinkling sparkles (light). */
function Particles({ mode, colors }: { mode: 'dust' | 'petals'; colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = colors.join(',');
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const cols = key.split(',');
    let w = 0;
    let h = 0;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const petals = mode === 'petals';
    const count = Math.round(Math.min(petals ? 30 : 46, Math.max(14, (w * h) / (petals ? 52000 : 38000))));
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const motes: Mote[] = Array.from({ length: count }, (_, i) => ({
      x: rnd() * w,
      y: rnd() * h,
      r: petals ? 2.5 + rnd() * 3 : 0.5 + rnd() * 1.6,
      vx: (rnd() - 0.5) * (petals ? 0.25 : 0.12),
      vy: petals ? 0.15 + rnd() * 0.3 : -0.04 - rnd() * 0.1,
      a: petals ? 0.35 + rnd() * 0.4 : 0.15 + rnd() * 0.45,
      p: rnd() * Math.PI * 2,
      c: cols[i % cols.length] ?? '#ffffff',
      sparkle: petals && i % 4 === 0,
    }));
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(50, now - last) / 16.67;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.p += 0.01 * dt;
        ctx.fillStyle = m.c;
        if (m.sparkle) {
          // twinkling 4-point sparkle, mostly stationary
          const s = m.r * (0.6 + Math.sin(m.p * 4) * 0.5);
          ctx.globalAlpha = Math.max(0, Math.sin(m.p * 4)) * 0.8;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y - s * 2);
          ctx.quadraticCurveTo(m.x, m.y, m.x + s * 2, m.y);
          ctx.quadraticCurveTo(m.x, m.y, m.x, m.y + s * 2);
          ctx.quadraticCurveTo(m.x, m.y, m.x - s * 2, m.y);
          ctx.quadraticCurveTo(m.x, m.y, m.x, m.y - s * 2);
          ctx.fill();
          if (Math.sin(m.p * 4) < -0.98) {
            m.x = rnd() * w;
            m.y = rnd() * h;
          }
          continue;
        }
        m.x += (m.vx + Math.sin(m.p) * (petals ? 0.3 : 0.08)) * dt;
        m.y += m.vy * dt;
        if (m.y < -6) m.y = h + 6;
        if (m.y > h + 6) m.y = -6;
        if (m.x < -6) m.x = w + 6;
        if (m.x > w + 6) m.x = -6;
        if (petals) {
          ctx.globalAlpha = m.a;
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.rotate(m.p * 2);
          ctx.beginPath();
          ctx.ellipse(0, 0, m.r, m.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          const lit = Math.max(0, 1 - Math.hypot((m.x - w / 2) / (w * 0.55), (m.y - h * 0.25) / (h * 0.6)));
          ctx.globalAlpha = m.a * (0.25 + lit * 0.9) * (0.75 + Math.sin(m.p * 3) * 0.25);
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [mode, key]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
