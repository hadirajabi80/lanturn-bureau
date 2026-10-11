import clsx from 'clsx';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { Check, Search } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { Hotspot, Scene } from '../../data/types';
import { hashString, luminance, mix, rgba, seededRandom, shade } from '../avatar/color';
import { resolveIcon } from './icons';

export interface SceneViewProps {
  scene: Scene;
  foundClueIds: string[];
  /** Engine handles clue add + flavor toast. */
  onHotspot: (h: Hotspot) => void;
  className?: string;
}

// ─────────────────────────── deterministic layout ───────────────────────────

type Depth = 0 | 1 | 2; // far, mid, near

interface PropPlacement {
  key: string;
  icon: string;
  depth: Depth;
  x: number; // % of layer width (centre)
  y: number; // % of layer height (centre)
  size: number; // % of layer width
  rotate: number;
  opacity: number;
  flip: boolean;
}

interface SceneLayout {
  props: PropPlacement[];
  windows: Array<{ x: number; w: number; h: number; arch: boolean }>;
  pillars: Array<{ x: number; w: number }>;
  shaft: { x: number; angle: number; width: number };
  glow: { x: number; y: number };
  horizon: number; // % from top
}

function layoutScene(scene: Scene): SceneLayout {
  const rnd = seededRandom(hashString(scene.id + '|' + scene.name));
  const range = (a: number, b: number) => a + (b - a) * rnd();
  const names = scene.props.length ? scene.props : ['Sparkles'];
  const slots = Math.min(10, Math.max(6, names.length + 3));

  // spread x positions evenly then shuffle so depth assignment isn't left→right
  const xs = Array.from({ length: slots }, (_, i) => ((i + 0.2 + rnd() * 0.6) / slots) * 100);
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }

  const props: PropPlacement[] = xs.map((x, i) => {
    // every prop name appears at least once; extra slots reuse the list
    const icon = names[i % names.length];
    const depth: Depth = i < names.length ? ((i % 3) as Depth) : rnd() < 0.55 ? 0 : 1;
    const y = depth === 0 ? range(24, 46) : depth === 1 ? range(48, 66) : range(78, 92);
    const size = depth === 0 ? range(7, 10.5) : depth === 1 ? range(11, 15) : range(17, 23);
    const opacity = depth === 0 ? range(0.2, 0.3) : depth === 1 ? range(0.28, 0.4) : range(0.5, 0.66);
    return { key: `${icon}-${i}`, icon, depth, x, y, size, rotate: range(-9, 9), opacity, flip: rnd() < 0.3 };
  });

  const windowCount = rnd() < 0.35 ? 1 : 2;
  const windows = Array.from({ length: windowCount }, (_, i) => ({
    x: windowCount === 1 ? range(25, 70) : i === 0 ? range(10, 35) : range(58, 82),
    w: range(9, 14),
    h: range(22, 32),
    arch: rnd() < 0.5,
  }));
  const pillars = Array.from({ length: 2 + Math.floor(rnd() * 2) }, () => ({ x: range(2, 96), w: range(2.5, 5) }));

  return {
    props,
    windows,
    pillars,
    shaft: { x: range(20, 75), angle: range(-28, 28), width: range(14, 24) },
    glow: { x: range(25, 75), y: range(18, 38) },
    horizon: range(58, 66),
  };
}

// ─────────────────────────── visuals ───────────────────────────

function sceneColors(palette: Scene['palette']) {
  const [a, b, c] = palette;
  const lum = (luminance(a) + luminance(b) + luminance(c)) / 3;
  const light = lum > 0.32;
  return {
    a,
    b,
    c,
    light,
    far: light ? shade(c, -0.35) : shade(a, 0.45),
    mid: light ? shade(c, -0.5) : shade(a, 0.3),
    near: shade(c, light ? -0.72 : -0.55),
    fog: light ? '#ffffff' : mix(a, '#cfd8ff', 0.6),
    glow: light ? shade(a, 0.6) : mix(a, '#ffd9a0', 0.55),
    floor: shade(c, light ? -0.35 : -0.45),
  };
}

function ParallaxLayer({
  mx,
  my,
  depth,
  children,
  className,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  children: ReactNode;
  className?: string;
}) {
  const x = useTransform(mx, (v) => `${(-v * depth * 2.4).toFixed(3)}%`);
  const y = useTransform(my, (v) => `${(-v * depth * 1.4).toFixed(3)}%`);
  return (
    <motion.div aria-hidden className={clsx('pointer-events-none absolute -inset-[5%]', className)} style={{ x, y }}>
      {children}
    </motion.div>
  );
}

function PropSilhouette({ p, color }: { p: PropPlacement; color: string }) {
  const Icon = resolveIcon(p.icon);
  const blur = p.depth === 0 ? 1.2 : p.depth === 1 ? 0.3 : 3;
  return (
    <div
      className="absolute aspect-square"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: `${p.size}%`,
        transform: `translate(-50%, -50%) rotate(${p.rotate.toFixed(1)}deg) scaleX(${p.flip ? -1 : 1})`,
        opacity: p.opacity,
        filter: `blur(${blur}px)`,
        color,
      }}
    >
      <Icon width="100%" height="100%" strokeWidth={p.depth === 2 ? 1.6 : 1.2} fill="currentColor" fillOpacity={p.depth === 2 ? 0.55 : 0.2} />
    </div>
  );
}

function FloorPlane({ horizon, color, line }: { horizon: number; color: string; line: string }) {
  const gid = 'lbf' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const h = 90 - (horizon / 100) * 90;
  const top = 90 - h;
  const rays = [];
  for (let i = -8; i <= 8; i++) rays.push(<line key={`r${i}`} x1={80} y1={top} x2={80 + i * 16} y2={90} vectorEffect="non-scaling-stroke" />);
  const rungs = [];
  for (let i = 1; i <= 6; i++) {
    const t = i / 6;
    const y = top + h * t * t;
    rungs.push(<line key={`h${i}`} x1={0} y1={y} x2={160} y2={y} vectorEffect="non-scaling-stroke" />);
  }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0} />
          <stop offset="18%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.8} />
        </linearGradient>
      </defs>
      <rect x={0} y={top - 1} width={160} height={h + 1} fill={`url(#${gid})`} />
      <g stroke={line} strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.5}>
        {rays}
        {rungs}
      </g>
      <line x1={0} y1={top} x2={160} y2={top} stroke={line} strokeWidth={1.5} vectorEffect="non-scaling-stroke" opacity={0.6} />
    </svg>
  );
}

// ─────────────────────────── hotspots ───────────────────────────

function HotspotButton({
  h,
  found,
  active,
  reduce,
  onActivate,
  onHover,
}: {
  h: Hotspot;
  found: boolean;
  active: boolean;
  reduce: boolean;
  onActivate: (h: Hotspot) => void;
  onHover: (id: string | null) => void;
}) {
  const flavor = !h.clueId;
  const tipBelow = h.y < 24;
  const tipAlign = h.x < 16 ? 'left-0' : h.x > 84 ? 'right-0' : 'left-1/2 -translate-x-1/2';
  const ringColor = flavor ? 'rgba(243,233,210,0.55)' : 'rgba(212,168,87,0.95)';

  return (
    <button
      type="button"
      className="group absolute z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lantern focus-visible:ring-offset-0"
      style={{ left: `${h.x}%`, top: `${h.y}%`, WebkitTapHighlightColor: 'transparent' }}
      aria-label={`${h.label}${found ? ' — examined' : flavor ? '' : ' — examine'}`}
      onClick={() => onActivate(h)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(h.id)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHover(null)}
      onFocus={() => onHover(h.id)}
      onBlur={() => onHover(null)}
    >
      {found ? (
        <motion.span
          className="relative grid h-7 w-7 place-items-center rounded-full"
          initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          style={{
            background: 'radial-gradient(circle at 35% 30%, #fbe3a6 0%, #d4a857 45%, #8f6c30 100%)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(40,26,8,0.6), 0 0 14px rgba(212,168,87,0.55)',
          }}
        >
          <Check className="h-4 w-4 text-ink" strokeWidth={3} aria-hidden />
          <span aria-hidden className="absolute -bottom-[7px] left-1/2 h-2 w-[2px] -translate-x-1/2 rounded-b bg-[#5b4320]" />
        </motion.span>
      ) : (
        <span className="relative grid h-7 w-7 place-items-center">
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${ringColor}` }}
              animate={{ scale: [0.85, flavor ? 1.6 : 2], opacity: [flavor ? 0.45 : 0.85, 0] }}
              transition={{ duration: flavor ? 2.8 : 2.1, repeat: Infinity, ease: 'easeOut', delay: (h.x % 7) * 0.13 }}
            />
          )}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110"
            style={{
              border: `2px solid ${ringColor}`,
              background: flavor ? 'rgba(11,14,20,0.25)' : 'rgba(11,14,20,0.35)',
              boxShadow: flavor ? '0 0 6px rgba(0,0,0,0.4)' : '0 0 0 1px rgba(0,0,0,0.35), 0 0 12px rgba(212,168,87,0.45)',
              backdropFilter: 'blur(1.5px)',
            }}
          />
          <span
            aria-hidden
            className={clsx('relative rounded-full', flavor ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5')}
            style={{
              background: flavor ? 'rgba(243,233,210,0.7)' : 'radial-gradient(circle at 35% 30%, #fbe3a6, #d4a857 55%, #8f6c30)',
              boxShadow: flavor ? 'none' : '0 0 6px rgba(255,179,71,0.8)',
            }}
          />
        </span>
      )}

      <AnimatePresence>
        {active && (
          <motion.span
            role="tooltip"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: tipBelow ? -4 : 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.16 }}
            className={clsx(
              'pointer-events-none absolute z-30 w-max max-w-[11rem] rounded-md px-2.5 py-1.5 text-center text-xs leading-snug font-semibold shadow-lg sm:max-w-[15rem]',
              tipBelow ? 'top-full mt-1.5' : 'bottom-full mb-1.5',
              tipAlign,
            )}
            style={{
              background: '#f3e9d2',
              color: '#0b0e14',
              boxShadow: '0 6px 18px rgba(0,0,0,0.45), 0 0 0 1px rgba(143,108,48,0.5)',
            }}
          >
            <span className="flex items-center justify-center gap-1">
              {found ? (
                <Check className="h-3 w-3 shrink-0 text-[#8f6c30]" strokeWidth={3} aria-hidden />
              ) : !flavor ? (
                <Search className="h-3 w-3 shrink-0 text-[#8f6c30]" strokeWidth={2.5} aria-hidden />
              ) : null}
              <span>{h.label}</span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─────────────────────────── SceneView ───────────────────────────

export function SceneView({ scene, foundClueIds, onHotspot, className }: SceneViewProps): JSX.Element {
  const reduce = useReducedMotion() ?? false;
  const grainId = 'lbg' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const layout = useMemo(() => layoutScene(scene), [scene]);
  const col = useMemo(() => sceneColors(scene.palette), [scene.palette]);
  const found = useMemo(() => new Set(foundClueIds), [foundClueIds]);
  const clueSpots = scene.hotspots.filter((h) => h.clueId);
  const foundCount = clueSpots.filter((h) => found.has(h.clueId as string)).length;

  // pointer → parallax + spotlight
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 70, damping: 20, mass: 0.6 });
  const my = useSpring(myRaw, { stiffness: 70, damping: 20, mass: 0.6 });
  const pxRaw = useMotionValue(50);
  const pyRaw = useMotionValue(45);
  const px = useSpring(pxRaw, { stiffness: 120, damping: 22 });
  const py = useSpring(pyRaw, { stiffness: 120, damping: 22 });
  const spotlight = useMotionTemplate`radial-gradient(circle at ${px}% ${py}%, rgba(255,220,160,0.20) 0%, rgba(255,214,150,0.08) 14%, rgba(6,8,14,0) 30%, rgba(6,8,14,0.30) 72%)`;

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reduce) return;
      const r = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      mxRaw.set(nx - 0.5);
      myRaw.set(ny - 0.5);
      pxRaw.set(nx * 100);
      pyRaw.set(ny * 100);
    },
    [reduce, mxRaw, myRaw, pxRaw, pyRaw],
  );
  const onPointerLeave = useCallback(() => {
    mxRaw.set(0);
    myRaw.set(0);
    pxRaw.set(50);
    pyRaw.set(45);
  }, [mxRaw, myRaw, pxRaw, pyRaw]);

  // tooltip state: hover/focus on desktop; tap shows it briefly on touch
  const [activeId, setActiveId] = useState<string | null>(null);
  const tapTimer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(tapTimer.current), []);
  useEffect(() => setActiveId(null), [scene.id]);

  const activate = useCallback(
    (h: Hotspot) => {
      setActiveId(h.id);
      window.clearTimeout(tapTimer.current);
      tapTimer.current = window.setTimeout(() => setActiveId((cur) => (cur === h.id ? null : cur)), 2600);
      onHotspot(h);
    },
    [onHotspot],
  );
  const hover = useCallback((id: string | null) => {
    window.clearTimeout(tapTimer.current);
    setActiveId(id);
  }, []);

  const byDepth = (d: Depth) => layout.props.filter((p) => p.depth === d);

  return (
    <figure
      className={clsx('relative m-0 overflow-hidden rounded-2xl border border-black/50 bg-ink', className)}
      style={{ boxShadow: '0 24px 60px -20px rgba(0,0,0,0.8)' }}
    >
      <div
        className="relative aspect-[16/9] w-full touch-manipulation overflow-hidden select-none"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ background: `linear-gradient(165deg, ${col.a} 0%, ${col.b} 52%, ${col.c} 100%)` }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={scene.id}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: `linear-gradient(165deg, ${col.a} 0%, ${col.b} 52%, ${col.c} 100%)` }}
          >
            {/* FAR: light source, architecture, distant props */}
            <ParallaxLayer mx={mx} my={my} depth={reduce ? 0 : 0.35}>
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 45% 40% at ${layout.glow.x}% ${layout.glow.y}%, ${rgba(col.glow, col.light ? 0.55 : 0.32)}, transparent 70%)`,
                }}
              />
              {layout.pillars.map((pl, i) => (
                <div
                  key={`p${i}`}
                  className="absolute top-0 bottom-[30%]"
                  style={{
                    left: `${pl.x}%`,
                    width: `${pl.w}%`,
                    background: `linear-gradient(180deg, ${rgba(col.near, 0.0)}, ${rgba(col.near, col.light ? 0.16 : 0.32)})`,
                  }}
                />
              ))}
              {layout.windows.map((w, i) => (
                <div
                  key={`w${i}`}
                  className="absolute"
                  style={{
                    left: `${w.x}%`,
                    top: '10%',
                    width: `${w.w}%`,
                    height: `${w.h}%`,
                    borderRadius: w.arch ? '999px 999px 4px 4px' : '4px',
                    background: `linear-gradient(180deg, ${rgba(col.glow, col.light ? 0.5 : 0.22)}, ${rgba(col.glow, 0.06)})`,
                    boxShadow: `0 0 40px ${rgba(col.glow, col.light ? 0.25 : 0.18)}, inset 0 0 0 2px ${rgba(col.near, 0.25)}`,
                  }}
                >
                  <div className="absolute inset-y-0 left-1/2 w-[6%] -translate-x-1/2" style={{ background: rgba(col.near, 0.28) }} />
                  <div className="absolute inset-x-0 top-[45%] h-[4%]" style={{ background: rgba(col.near, 0.28) }} />
                </div>
              ))}
              {byDepth(0).map((p) => (
                <PropSilhouette key={p.key} p={p} color={col.far} />
              ))}
            </ParallaxLayer>

            {/* light shaft */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-[10%] h-[120%] mix-blend-screen"
              style={{
                left: `${layout.shaft.x}%`,
                width: `${layout.shaft.width}%`,
                transform: `rotate(${layout.shaft.angle}deg)`,
                transformOrigin: 'top center',
                background: `linear-gradient(180deg, ${rgba(col.glow, 0.28)}, ${rgba(col.glow, 0)} 85%)`,
                filter: 'blur(14px)',
                opacity: col.light ? 0.55 : 0.75,
              }}
            />

            {/* MID: floor plane, fog band, mid props */}
            <ParallaxLayer mx={mx} my={my} depth={reduce ? 0 : 0.7}>
              <FloorPlane horizon={layout.horizon} color={col.floor} line={rgba(col.fog, col.light ? 0.25 : 0.12)} />
              {byDepth(1).map((p) => (
                <PropSilhouette key={p.key} p={p} color={col.mid} />
              ))}
              <motion.div
                className="absolute left-[-10%] h-[22%] w-[120%] rounded-[50%]"
                style={{
                  top: `${layout.horizon - 12}%`,
                  background: `radial-gradient(ellipse at center, ${rgba(col.fog, col.light ? 0.35 : 0.14)}, transparent 70%)`,
                  filter: 'blur(10px)',
                }}
                animate={reduce ? undefined : { x: ['-3%', '3%'] }}
                transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              />
            </ParallaxLayer>

            {/* NEAR: big out-of-focus silhouettes + low fog */}
            <ParallaxLayer mx={mx} my={my} depth={reduce ? 0 : 1.25}>
              {byDepth(2).map((p) => (
                <PropSilhouette key={p.key} p={p} color={col.near} />
              ))}
              <motion.div
                className="absolute bottom-[2%] left-[-15%] h-[26%] w-[130%] rounded-[50%]"
                style={{
                  background: `radial-gradient(ellipse at center, ${rgba(col.fog, col.light ? 0.3 : 0.12)}, transparent 68%)`,
                  filter: 'blur(14px)',
                }}
                animate={reduce ? undefined : { x: ['4%', '-4%'] }}
                transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              />
            </ParallaxLayer>
          </motion.div>
        </AnimatePresence>

        {/* cursor spotlight */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: reduce ? undefined : spotlight }} />
        {/* film grain */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09] mix-blend-overlay">
          <filter id={grainId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${grainId})`} />
        </svg>
        {/* vignette + inset shadow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, rgba(5,6,10,0.6) 100%)',
            boxShadow: 'inset 0 0 70px rgba(0,0,0,0.55), inset 0 -30px 50px -20px rgba(0,0,0,0.5)',
          }}
        />

        {/* hotspots */}
        <div className="absolute inset-0 z-10">
          {scene.hotspots.map((h) => (
            <HotspotButton
              key={h.id}
              h={h}
              found={!!h.clueId && found.has(h.clueId)}
              active={activeId === h.id}
              reduce={reduce}
              onActivate={activate}
              onHover={hover}
            />
          ))}
        </div>
      </div>

      {/* paper caption */}
      <figcaption
        className="relative flex items-start gap-3 border-t-2 px-4 py-3 text-ink sm:px-5"
        style={{
          borderColor: '#d4a857',
          background: 'linear-gradient(180deg, #f6eedb 0%, #f3e9d2 40%, #e9dcbd 100%)',
        }}
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight text-ink sm:text-xl">{scene.name}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-ink/70 italic sm:text-sm">{scene.description}</p>
        </div>
        {clueSpots.length > 0 && (
          <div
            className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-semibold"
            style={{ background: '#0b0e14', color: foundCount === clueSpots.length ? '#d4a857' : '#f3e9d2' }}
            aria-label={`${foundCount} of ${clueSpots.length} clues found in this scene`}
          >
            <Search className="h-3 w-3" aria-hidden />
            {foundCount}/{clueSpots.length}
          </div>
        )}
      </figcaption>
    </figure>
  );
}

// ─────────────────────────── SceneThumb ───────────────────────────

export interface SceneThumbProps {
  scene: Scene;
  active: boolean;
  onClick: () => void;
  /** Optional: clue progress shown as a tiny badge (e.g. from foundClueIds). */
  foundCount?: number;
  className?: string;
}

/** Small card for the scene picker: gradient backdrop, two prop silhouettes, scene name. */
export function SceneThumb({ scene, active, onClick, foundCount, className }: SceneThumbProps): JSX.Element {
  const col = useMemo(() => sceneColors(scene.palette), [scene.palette]);
  const Icon1 = resolveIcon(scene.props[0]);
  const Icon2 = resolveIcon(scene.props[1] ?? scene.props[0]);
  const total = scene.hotspots.filter((h) => h.clueId).length;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border text-left outline-none focus-visible:ring-2 focus-visible:ring-lantern sm:h-24 sm:w-44',
        active ? 'border-brass' : 'border-white/10 opacity-80 hover:opacity-100',
        className,
      )}
      style={{
        background: `linear-gradient(160deg, ${col.a}, ${col.b} 55%, ${col.c})`,
        boxShadow: active ? '0 0 0 1px #d4a857, 0 0 22px -4px rgba(212,168,87,0.7)' : '0 6px 16px -8px rgba(0,0,0,0.7)',
      }}
    >
      <Icon1 className="pointer-events-none absolute -right-2 -bottom-3 h-16 w-16 sm:h-20 sm:w-20" style={{ color: col.near, opacity: 0.45 }} strokeWidth={1.3} fill="currentColor" fillOpacity={0.3} aria-hidden />
      <Icon2 className="pointer-events-none absolute top-2 right-12 h-7 w-7 blur-[1px]" style={{ color: col.far, opacity: 0.35 }} strokeWidth={1.3} aria-hidden />
      <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(5,6,10,0.78) 100%)' }} />
      <span className="absolute inset-x-2 bottom-1.5 truncate font-display text-sm leading-tight text-paper drop-shadow">{scene.name}</span>
      {typeof foundCount === 'number' && total > 0 && (
        <span
          className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-px font-mono text-[10px] font-semibold"
          style={{ background: 'rgba(11,14,20,0.75)', color: foundCount >= total ? '#d4a857' : '#f3e9d2' }}
        >
          {foundCount}/{total}
        </span>
      )}
    </motion.button>
  );
}
