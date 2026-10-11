import { memo, useEffect, useRef, useState, type CSSProperties, type JSX } from 'react';
import { rng } from './skins/geom';

/**
 * BURN — the case file chars from the edges inward (~1.6 s), embers rise, the corners curl, and it
 * stays charred. CSS/SVG only. Each burn stage is a static, filtered <svg> of its own; stages are
 * mounted one after another and faded in with CSS opacity, so no SVG filter is re-run per frame.
 */
export interface BurnProps {
  /** viewBox of the board (user units) */
  vb: { x: number; y: number; w: number; h: number };
  uid: string;
  /** play the animation (false = show the final charred state right away) */
  animate: boolean;
}

const STAGES = [0.0, 0.035, 0.07, 0.1, 0.13, 0.16];
const TOTAL_MS = 1600;
const STAGE_MS = TOTAL_MS / STAGES.length;

const KEYFRAMES = `
@keyframes fmBurnIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes fmEmber {
  0% { opacity: 0; transform: translate(0, 0) scale(1) }
  12% { opacity: 1 }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.3) }
}
@keyframes fmCurl { from { transform: scale(0) } to { transform: scale(1) } }
`;

const layer: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' };

function Stage({ vb, id, t, fadeMs }: { vb: BurnProps['vb']; id: string; t: number; fadeMs: number }): JSX.Element {
  const min = Math.min(vb.w, vb.h);
  const s = 34; // edge sharpness of the char line
  const s2 = 26;
  const s3 = 2.4;
  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="none"
      style={{ ...layer, animation: fadeMs > 0 ? `fmBurnIn ${fadeMs}ms ease-out both` : undefined, willChange: 'opacity' }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-g`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <filter id={`${id}-f`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={(4.2 / min).toFixed(5)} numOctaves={3} seed={5} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={min * 0.16} xChannelSelector="R" yChannelSelector="G" result="field" />
          <feTurbulence type="fractalNoise" baseFrequency={(28 / min).toFixed(5)} numOctaves={2} seed={8} result="fine" />
          <feComposite in="field" in2="fine" operator="arithmetic" k2={0.85} k3={0.3} k4={-0.15} result="D" />
          <feColorMatrix in="D" type="luminanceToAlpha" result="Da" />
          <feComponentTransfer in="Da" result="charA">
            <feFuncA type="linear" slope={-s} intercept={s * t} />
          </feComponentTransfer>
          <feComponentTransfer in="Da" result="emA">
            <feFuncA type="linear" slope={-s2} intercept={s2 * (t + 0.035)} />
          </feComponentTransfer>
          <feComponentTransfer in="Da" result="scA">
            <feFuncA type="linear" slope={-s3} intercept={s3 * (t + 0.42)} />
          </feComponentTransfer>
          <feComposite in="emA" in2="charA" operator="out" result="band" />
          <feFlood floodColor="#FF8A2A" result="emC" />
          <feComposite in="emC" in2="band" operator="in" result="ember" />
          <feGaussianBlur in="ember" stdDeviation={min * 0.008} result="emberGlow" />
          <feFlood floodColor="#4A2208" floodOpacity={0.62} result="scC" />
          <feComposite in="scC" in2="scA" operator="in" result="scorch" />
          <feFlood floodColor="#120904" result="chC" />
          <feComposite in="chC" in2="charA" operator="in" result="char" />
          <feMerge>
            <feMergeNode in="scorch" />
            <feMergeNode in="char" />
            <feMergeNode in="emberGlow" />
            <feMergeNode in="ember" />
          </feMerge>
        </filter>
      </defs>
      <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill={`url(#${id}-g)`} filter={`url(#${id}-f)`} />
    </svg>
  );
}

function BurnImpl({ vb, uid, animate }: BurnProps): JSX.Element {
  const [shown, setShown] = useState(animate ? 1 : STAGES.length);
  const [done, setDone] = useState(!animate);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!animate) return;
    for (let i = 2; i <= STAGES.length; i++) {
      timers.current.push(window.setTimeout(() => setShown(i), (i - 1) * STAGE_MS));
    }
    timers.current.push(window.setTimeout(() => setDone(true), TOTAL_MS + 400));
    const list = timers.current;
    return () => {
      list.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [animate]);

  const embers = (() => {
    const rnd = rng(911);
    return Array.from({ length: 34 }, (_, i) => {
      const a = rnd() * Math.PI * 2;
      const depth = 0.55 + rnd() * 0.45; // 1 = edge
      const x = vb.x + vb.w / 2 + Math.cos(a) * depth * vb.w * 0.5;
      const y = vb.y + vb.h / 2 + Math.sin(a) * depth * vb.h * 0.5;
      return {
        i,
        x,
        y,
        r: 1.5 + rnd() * 3.5,
        delay: (1 - depth) * 2.4 * TOTAL_MS * 0.5 + rnd() * 300,
        dur: 700 + rnd() * 900,
        dx: (rnd() - 0.5) * 60,
        dy: -(40 + rnd() * 120),
        hot: rnd() > 0.5,
      };
    });
  })();

  const L = Math.min(vb.w, vb.h) * 0.1;
  const corners = [
    { x: vb.x, y: vb.y, sx: 1, sy: 1, delay: 700 },
    { x: vb.x + vb.w, y: vb.y, sx: -1, sy: 1, delay: 950 },
    { x: vb.x + vb.w, y: vb.y + vb.h, sx: -1, sy: -1, delay: 820 },
    { x: vb.x, y: vb.y + vb.h, sx: 1, sy: -1, delay: 1080 },
  ];

  return (
    <div style={{ ...layer, overflow: 'hidden' }} aria-hidden>
      <style>{KEYFRAMES}</style>
      {STAGES.map((t, i) =>
        i < shown && (!done || i === STAGES.length - 1) ? (
          <Stage key={i} vb={vb} id={`${uid}-burn${i}`} t={t} fadeMs={animate && !(done && i === STAGES.length - 1) ? Math.round(STAGE_MS * 1.2) : 0} />
        ) : null,
      )}
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="none" style={layer}>
        <defs>
          <linearGradient id={`${uid}-curl`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a322b" />
            <stop offset="0.55" stopColor="#8a7d6e" />
            <stop offset="1" stopColor="#1a1512" />
          </linearGradient>
        </defs>
        {/* soot tint */}
        <rect
          x={vb.x}
          y={vb.y}
          width={vb.w}
          height={vb.h}
          fill="#1a0d05"
          opacity={0.2}
          style={animate ? { animation: `fmBurnIn ${TOTAL_MS}ms ease-in both` } : undefined}
        />
        {/* curled corners: the scorched paper rolls up, showing its ashen back */}
        {corners.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.sx} ${c.sy})`}>
            <g style={animate ? { transformOrigin: '0 0', animation: `fmCurl 600ms cubic-bezier(.2,.8,.3,1.2) ${c.delay}ms both` } : undefined}>
              <path d={`M0,0L${L},0L0,${L}Z`} fill="#050302" />
              <path d={`M${L},0Q${L * 0.8},${L * 0.42} ${L * 0.62},${L * 0.62}Q${L * 0.42},${L * 0.8} 0,${L}Z`} fill={`url(#${uid}-curl)`} />
              <path d={`M${L},0Q${L * 0.8},${L * 0.42} ${L * 0.62},${L * 0.62}Q${L * 0.42},${L * 0.8} 0,${L}`} fill="none" stroke="#FF7A1A" strokeOpacity={0.6} strokeWidth={L * 0.035} />
            </g>
          </g>
        ))}
        {/* embers */}
        {animate &&
          !done &&
          embers.map((e) => (
            <circle
              key={e.i}
              cx={e.x}
              cy={e.y}
              r={e.r}
              fill={e.hot ? '#FFD27A' : '#FF6A1A'}
              style={
                {
                  '--dx': `${e.dx.toFixed(1)}px`,
                  '--dy': `${e.dy.toFixed(1)}px`,
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: `fmEmber ${Math.round(e.dur)}ms ease-out ${Math.round(e.delay)}ms both`,
                } as CSSProperties
              }
            />
          ))}
      </svg>
    </div>
  );
}

export const Burn = memo(BurnImpl);
