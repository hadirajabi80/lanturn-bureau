import { memo, useId, useMemo, type CSSProperties } from 'react';
import { mix, shade } from '@/components/avatar/color';
import { getDistrict, DISTRICTS } from '@/grid/skins/districts';
import type { District } from '@/grid/skins/types';
import { grid, rng, type Ctx, type Spec, type Win } from './facadeKit';
import { boutique, carnival, cottage } from './FacadeLight';
import { isLightDistrict } from './skin';

/**
 * FacadeArt — procedural SVG building facade for a district (`district.facade.shape`).
 * Windows = `facade.floors × facade.windowsPerFloor`; index = row * windowsPerFloor + col, row 0 = ground.
 * Lit windows glow in `palette.glow` with a gentle flicker. Night sky, stars and a drifting fog band.
 * Shape-specific animation: lighthouse beam, train wheels & steam, observatory telescope, neon signs,
 * manor chimney smoke. All CSS animations stop under reduced motion (global rule in index.css).
 */

type Shape = District['facade']['shape'];


export interface FacadeArtProps {
  district: District | string;
  /** 0..1 — fraction of windows lit (deterministic scatter). Ignored when `litWindows` is given. */
  litFraction?: number;
  /** Explicit per-window lit state (index = row * windowsPerFloor + col, row 0 = ground). */
  litWindows?: boolean[];
  /** Tier index 0..4 (0 = Rookie / ground … 4 = Mastermind / roof): that storey band is highlighted. */
  highlightFloor?: number;
  /** CSS height (px number or any CSS length). Width follows the facade's aspect ratio. */
  height?: number | string;
  /** Draw the night sky behind the building (default true). Off = transparent, for composed skylines. */
  sky?: boolean;
  /** Draw the fog band (default true). */
  fog?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Accessible label; decorative (aria-hidden) when omitted. */
  title?: string;
}

/** Intrinsic viewBox size per shape — handy for laying out several facades. */
export const FACADE_SIZE: Record<Shape, { w: number; h: number }> = {
  manor: { w: 320, h: 230 },
  lighthouse: { w: 170, h: 320 },
  tower: { w: 190, h: 330 },
  museum: { w: 330, h: 210 },
  skyline: { w: 300, h: 290 },
  gothic: { w: 300, h: 270 },
  train: { w: 460, h: 170 },
  dome: { w: 250, h: 230 },
  cottage: { w: 300, h: 240 },
  boutique: { w: 260, h: 250 },
  carnival: { w: 360, h: 250 },
};

// ───────────────────────────── shapes ─────────────────────────────

function manor(f: number, n: number, k: Ctx): Spec {
  const W = 320, H = 230, G = 210;
  const back = (
    <>
      {/* chimneys + smoke */}
      <rect x={72} y={40} width={13} height={48} fill={k.bodyDark} />
      <rect x={69} y={36} width={19} height={6} fill={k.roof} />
      <rect x={236} y={32} width={13} height={56} fill={k.bodyDark} />
      <rect x={233} y={28} width={19} height={6} fill={k.roof} />
      {[0, 1.6, 3.2].map((d, i) => (
        <circle key={i} cx={242} cy={22} r={6} fill={k.p.muted} className="fp-smoke" style={{ animationDelay: `${d}s` }} />
      ))}
      {/* wings */}
      <rect x={24} y={98} width={90} height={G - 98} fill={k.body} />
      <rect x={206} y={98} width={90} height={G - 98} fill={k.body} />
      <polygon points="16,100 69,56 122,100" fill={k.roof} />
      <polygon points="198,100 251,56 304,100" fill={k.roof} />
      <polyline points="16,100 69,56 122,100" fill="none" stroke={k.trim} strokeWidth={1.4} />
      <polyline points="198,100 251,56 304,100" fill="none" stroke={k.trim} strokeWidth={1.4} />
      {/* centre block + gable */}
      <rect x={104} y={82} width={112} height={G - 82} fill={mix(k.body, k.p.ink, 0.04)} />
      <polygon points="94,84 160,26 226,84" fill={k.roof} />
      <polyline points="94,84 160,26 226,84" fill="none" stroke={k.trim} strokeWidth={1.6} />
      <circle cx={160} cy={62} r={8} fill={k.dark} stroke={k.trim} strokeWidth={1.2} />
      <circle cx={160} cy={62} r={4} fill={k.p.glow} opacity={0.5} />
      {/* string course & eaves */}
      {[130, 155, 180].map((y) => (
        <line key={y} x1={26} x2={294} y1={y - 1} y2={y - 1} stroke={k.dark} strokeOpacity={0.35} strokeWidth={1} />
      ))}
      <rect x={20} y={G - 6} width={280} height={6} fill={k.bodyDark} />
    </>
  );
  return { W, H, G, back, windows: grid(34, 104, 286, 204, f, n, 0.5, 0.62) };
}

function lighthouse(f: number, n: number, k: Ctx): Spec {
  const W = 170, H = 320, G = 300;
  const cx = 85, lampY = 68;
  const hwAt = (y: number) => 21 + ((y - 92) / (288 - 92)) * 12;
  const windows: Win[] = [];
  for (let r = 0; r < f; r++) {
    const yc = 276 - (r + 0.5) * (170 / f);
    const hw = hwAt(yc) * 0.72;
    for (let c = 0; c < n; c++) {
      const x = cx - hw + ((c + 0.5) * (2 * hw)) / n;
      windows.push({ x: x - 3.2, y: yc - 4, w: 6.4, h: 8, row: r, col: c, kind: 'arch' });
    }
  }
  const stripes = Array.from({ length: 4 }, (_, i) => 92 + i * 52 + 26);
  const back = (
    <>
      {/* beam */}
      <defs>
        <linearGradient id={`${k.id}-beam`} x1="0" x2="1">
          <stop offset="0" stopColor={k.p.glow} stopOpacity={0.75} />
          <stop offset="1" stopColor={k.p.glow} stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${k.id}-tw`}>
          <polygon points="52,288 64,92 106,92 118,288" />
        </clipPath>
      </defs>
      <polygon
        points={`${cx},${lampY - 5} ${cx + 300},${lampY - 46} ${cx + 300},${lampY + 46} ${cx},${lampY + 5}`}
        fill={`url(#${k.id}-beam)`}
        className="fp-beam"
        style={{ transformOrigin: `${cx}px ${lampY}px` }}
      />
      {/* rocks + cottage */}
      <polygon points="0,302 18,286 50,280 90,276 130,282 154,290 170,302" fill={k.bodyDark} />
      <rect x={114} y={262} width={46} height={26} fill={k.body} />
      <polygon points="110,264 137,246 164,264" fill={k.roof} />
      <rect x={130} y={270} width={9} height={10} fill={k.p.glow} opacity={0.55} />
      {/* tower */}
      <polygon points="52,288 64,92 106,92 118,288" fill={mix(k.p.ink, k.body, 0.35)} />
      <g clipPath={`url(#${k.id}-tw)`}>
        {stripes.map((y) => (
          <rect key={y} x={40} y={y} width={90} height={26} fill={k.p.danger} opacity={0.85} />
        ))}
        <rect x={85} y={90} width={40} height={200} fill="#000" opacity={0.22} />
      </g>
      {/* gallery & lantern room */}
      <rect x={56} y={84} width={58} height={8} fill={k.bodyDark} />
      {[58, 66, 74, 82, 90, 98, 106, 112].map((x) => (
        <line key={x} x1={x} x2={x} y1={76} y2={84} stroke={k.trim} strokeWidth={1} />
      ))}
      <line x1={56} x2={114} y1={76} y2={76} stroke={k.trim} strokeWidth={1.2} />
      <rect x={68} y={52} width={34} height={32} fill={k.p.glow} opacity={0.9} />
      <circle cx={cx} cy={lampY} r={18} fill={k.p.glow} opacity={0.25} />
      {[76, 85, 94].map((x) => (
        <line key={x} x1={x} x2={x} y1={52} y2={84} stroke={k.bodyDark} strokeWidth={1.4} />
      ))}
      <path d="M64 53 Q85 22 106 53 Z" fill={k.roof} stroke={k.trim} strokeWidth={1} />
      <line x1={cx} x2={cx} y1={30} y2={14} stroke={k.trim} strokeWidth={1.5} />
      <circle cx={cx} cy={13} r={2} fill={k.trim} />
    </>
  );
  return { W, H, G, back, windows };
}

function tower(f: number, n: number, k: Ctx): Spec {
  const W = 190, H = 330, G = 312;
  const x0 = 34, x1 = 156;
  const ribs = Array.from({ length: n + 1 }, (_, i) => x0 + (i * (x1 - x0)) / n);
  const sun = Array.from({ length: 9 }, (_, i) => Math.PI + (i * Math.PI) / 8);
  const back = (
    <>
      <polygon points="95,4 98.5,50 91.5,50" fill={k.trim} />
      <rect x={70} y={48} width={50} height={28} fill={k.bodyDark} />
      <path d="M72 76 A23 23 0 0 1 118 76 Z" fill={k.dark} stroke={k.p.accent} strokeWidth={1.2} />
      {sun.map((a, i) => (
        <line key={i} x1={95} y1={76} x2={95 + Math.cos(a) * 21} y2={76 + Math.sin(a) * 21} stroke={k.p.accent} strokeWidth={0.9} opacity={0.8} />
      ))}
      <rect x={52} y={76} width={86} height={36} fill={k.body} />
      <rect x={14} y={252} width={162} height={G - 252} fill={k.bodyDark} />
      <rect x={26} y={110} width={138} height={G - 110} fill={k.body} />
      {/* stepped setback edges */}
      <path d="M26 110 h26 v-34 h18 v-28 h50 v28 h18 v34 h26" fill="none" stroke={k.p.accent} strokeWidth={1.4} />
      {ribs.map((x) => (
        <line key={x} x1={x} x2={x} y1={112} y2={G - 4} stroke={k.p.accent} strokeOpacity={0.32} strokeWidth={1.2} />
      ))}
      {[62, 84, 106, 128].map((x) => (
        <rect key={x} x={x - 3} y={86} width={6} height={16} fill={k.dark} />
      ))}
      <rect x={20} y={G - 4} width={150} height={4} fill={k.p.accent} opacity={0.6} />
    </>
  );
  return { W, H, G, back, windows: grid(x0, 118, x1, 300, f, n, 0.46, 0.66) };
}

function museum(f: number, n: number, k: Ctx): Spec {
  const W = 330, H = 210, G = 196;
  const cols = n + 1;
  const colX = Array.from({ length: cols }, (_, i) => 40 + (i * 250) / (cols - 1));
  const windows: Win[] = [];
  const top = 96, bot = 166;
  for (let r = 0; r < f; r++)
    for (let c = 0; c < n; c++) {
      const gx = ((colX[c] as number) + (colX[c + 1] as number)) / 2;
      const ch = (bot - top) / f;
      const yc = bot - (r + 0.5) * ch;
      windows.push({ x: gx - 7, y: yc - ch * 0.34, w: 14, h: ch * 0.68, row: r, col: c, kind: 'arch' });
    }
  const back = (
    <>
      <rect x={30} y={84} width={270} height={88} fill={mix(k.body, k.dark, 0.25)} />
      <polygon points="16,78 165,24 314,78" fill={k.roof} />
      <polygon points="40,72 165,32 290,72" fill="none" stroke={k.trim} strokeWidth={1.2} />
      <circle cx={165} cy={56} r={9} fill={k.dark} stroke={k.trim} strokeWidth={1.2} />
      <circle cx={165} cy={56} r={4.5} fill={k.p.glow} opacity={0.45} />
      <rect x={20} y={76} width={290} height={14} fill={mix(k.p.ink, k.body, 0.55)} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={26 + i * 11.8} y={86} width={6} height={3} fill={k.dark} opacity={0.5} />
      ))}
      <rect x={30} y={170} width={270} height={8} fill={mix(k.p.ink, k.body, 0.5)} />
      <rect x={22} y={178} width={286} height={8} fill={mix(k.p.ink, k.body, 0.42)} />
      <rect x={14} y={186} width={302} height={10} fill={mix(k.p.ink, k.body, 0.34)} />
    </>
  );
  const front = (
    <>
      {colX.map((x) => (
        <g key={x}>
          <rect x={x - 6} y={92} width={12} height={76} fill={mix(k.p.ink, k.body, 0.62)} />
          <line x1={x - 2} x2={x - 2} y1={94} y2={166} stroke={k.dark} strokeOpacity={0.25} />
          <line x1={x + 2} x2={x + 2} y1={94} y2={166} stroke={k.dark} strokeOpacity={0.25} />
          <rect x={x - 9} y={89} width={18} height={5} fill={mix(k.p.ink, k.body, 0.5)} />
          <rect x={x - 8} y={166} width={16} height={4} fill={mix(k.p.ink, k.body, 0.5)} />
        </g>
      ))}
    </>
  );
  return { W, H, G, back, front, windows };
}

function skyline(f: number, n: number, k: Ctx): Spec {
  const W = 300, H = 290, G = 272;
  // distribute columns across three buildings: A, B, C
  const a = Math.ceil(n * 0.375), b = Math.ceil((n - a) / 2), c = n - a - b;
  const boxes = [
    { x0: 24, x1: 100, n: a },
    { x0: 114, x1: 190, n: b },
    { x0: 206, x1: 280, n: c },
  ];
  const windows: Win[] = [];
  const step = Math.min(22, 150 / Math.max(1, f));
  for (let r = 0; r < f; r++) {
    let col = 0;
    for (const bx of boxes) {
      for (let i = 0; i < bx.n; i++) {
        const x = bx.x0 + ((i + 0.5) * (bx.x1 - bx.x0)) / Math.max(1, bx.n);
        windows.push({ x: x - 6, y: G - 18 - r * step - 6, w: 12, h: 11, row: r, col });
        col++;
      }
    }
  }
  const glowF = `url(#${k.id}-glow)`;
  const back = (
    <>
      <rect x={0} y={150} width={26} height={G - 150} fill={mix(k.bodyDark, k.p.bg, 0.5)} />
      <rect x={272} y={128} width={28} height={G - 128} fill={mix(k.bodyDark, k.p.bg, 0.5)} />
      <rect x={18} y={100} width={88} height={G - 100} fill={k.body} />
      <rect x={70} y={78} width={22} height={18} rx={3} fill={k.bodyDark} />
      <line x1={74} x2={74} y1={96} y2={100} stroke={k.bodyDark} strokeWidth={2} />
      <line x1={88} x2={88} y1={96} y2={100} stroke={k.bodyDark} strokeWidth={2} />
      <rect x={108} y={34} width={88} height={G - 34} fill={mix(k.body, k.p.ink, 0.04)} />
      <line x1={152} x2={152} y1={34} y2={6} stroke={k.trim} strokeWidth={1.5} />
      <circle cx={152} cy={6} r={2.4} fill={k.p.danger} className="fp-twinkle" />
      <path d="M200 96 h40 v-10 h28 v10 h18 V272 H200 Z" fill={k.body} />
      {/* rain */}
      {Array.from({ length: 16 }, (_, i) => (
        <line
          key={i}
          x1={(i * 37) % W}
          x2={((i * 37) % W) - 4}
          y1={(i * 53) % 200}
          y2={((i * 53) % 200) + 14}
          stroke={k.p.ink}
          strokeOpacity={0.12}
          className="fp-rain"
          style={{ animationDelay: `${(i % 7) * 0.12}s` }}
        />
      ))}
    </>
  );
  const front = (
    <g filter={glowF}>
      <g className="fp-neon">
        <rect x={120} y={44} width={64} height={18} rx={3} fill="none" stroke={k.p.accent2} strokeWidth={1.4} />
        <text x={152} y={57.5} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fontWeight={700} fill={k.p.accent2} letterSpacing={2}>
          HOTEL
        </text>
      </g>
      <g className="fp-neon" style={{ animationDelay: '2.3s' }}>
        <rect x={2} y={112} width={14} height={60} rx={3} fill="none" stroke={k.p.accent} strokeWidth={1.4} />
        {['B', 'A', 'R'].map((ch, i) => (
          <text key={ch} x={9} y={130 + i * 17} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fontWeight={700} fill={k.p.accent}>
            {ch}
          </text>
        ))}
      </g>
      <text x={243} y={82} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fontWeight={700} fill={k.p.accent} letterSpacing={1} className="fp-neon" style={{ animationDelay: '4.1s' }}>
        NOODLES
      </text>
    </g>
  );
  return { W, H, G, back, front, windows };
}

function gothic(f: number, n: number, k: Ctx): Spec {
  const W = 300, H = 270, G = 254;
  const pinn = [26, 92, 208, 274];
  const back = (
    <>
      <polygon points="22,124 62,92 238,92 278,124" fill={k.roof} />
      <rect x={26} y={122} width={248} height={G - 122} fill={k.body} />
      {pinn.map((x) => (
        <g key={x}>
          <rect x={x - 4} y={98} width={8} height={26} fill={k.bodyDark} />
          <polygon points={`${x - 5},100 ${x},66 ${x + 5},100`} fill={k.roof} stroke={k.trim} strokeWidth={0.8} />
        </g>
      ))}
      <rect x={124} y={56} width={52} height={68} fill={mix(k.body, k.p.ink, 0.05)} />
      <polygon points="118,58 150,2 182,58" fill={k.roof} stroke={k.trim} strokeWidth={1} />
      <circle cx={150} cy={84} r={11} fill={k.dark} stroke={k.p.accent} strokeWidth={1.3} />
      <line x1={150} y1={84} x2={150} y2={76} stroke={k.p.accent} strokeWidth={1.3} />
      <line x1={150} y1={84} x2={156} y2={87} stroke={k.p.accent} strokeWidth={1.3} />
      {[60, 110, 190, 240].map((x) => (
        <polygon key={x} points={`${x - 3},${G} ${x - 3},${G - 40} ${x + 4},${G}`} fill={k.bodyDark} />
      ))}
    </>
  );
  return { W, H, G, back, windows: grid(36, 130, 264, 250, f, n, 0.4, 0.68, 'arch') };
}

function train(f: number, n: number, k: Ctx): Spec {
  const W = 460, H = 170, G = 150;
  const cars = [
    { x0: 132, x1: 236 },
    { x0: 244, x1: 348 },
    { x0: 356, x1: 456 },
  ];
  const per = [Math.ceil(n / 3), Math.ceil((n - Math.ceil(n / 3)) / 2)];
  const counts = [per[0] as number, per[1] as number, n - (per[0] as number) - (per[1] as number)];
  const windows: Win[] = [];
  for (let r = 0; r < f; r++) {
    let col = 0;
    cars.forEach((car, ci) => {
      const cnt = counts[ci] as number;
      for (let i = 0; i < cnt; i++) {
        const x = car.x0 + 8 + ((i + 0.5) * (car.x1 - car.x0 - 16)) / Math.max(1, cnt);
        const main = r === 0;
        const yy = main ? 104 - (f > 2 ? 0 : 0) : 90 - (r - 1) * 10;
        windows.push({ x: x - 8, y: yy, w: 16, h: main ? 16 : 6, row: r, col });
        col++;
      }
    });
  }
  const carBody = mix(k.p.accent, k.p.panel, 0.45);
  const wheel = (cx: number, cy: number, r: number, key: string) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={r} fill={k.dark} stroke={k.trim} strokeWidth={1.4} />
      <g className="fp-wheel">
        <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke="none" />
        <line x1={cx - r + 2} x2={cx + r - 2} y1={cy} y2={cy} stroke={k.trim} strokeWidth={1} />
        <line x1={cx} x2={cx} y1={cy - r + 2} y2={cy + r - 2} stroke={k.trim} strokeWidth={1} />
      </g>
      <circle cx={cx} cy={cy} r={1.6} fill={k.trim} />
    </g>
  );
  const back = (
    <>
      {[0, 1.05, 2.1].map((d, i) => (
        <circle key={i} cx={46} cy={62} r={9} fill={k.p.ink} opacity={0} className="fp-steam" style={{ animationDelay: `${d}s` }} />
      ))}
      {/* locomotive */}
      <rect x={38} y={70} width={14} height={24} fill={k.bodyDark} />
      <rect x={35} y={66} width={20} height={6} fill={k.bodyDark} />
      <rect x={24} y={92} width={78} height={40} rx={12} fill={mix(k.body, '#000', 0.2)} />
      <circle cx={26} cy={112} r={14} fill={k.bodyDark} stroke={k.trim} strokeWidth={1.2} />
      <circle cx={26} cy={112} r={4} fill={k.p.glow} opacity={0.85} />
      <path d="M62 92 a8 8 0 0 1 16 0 z" fill={k.trim} />
      <rect x={96} y={72} width={30} height={60} fill={carBody} />
      <rect x={92} y={66} width={38} height={7} fill={k.bodyDark} />
      <rect x={103} y={80} width={16} height={14} fill={k.p.glow} opacity={0.75} />
      <polygon points="6,146 24,130 24,146" fill={k.trim} />
      <line x1={24} x2={126} y1={122} y2={122} stroke={k.p.accent2} strokeOpacity={0.6} strokeWidth={1.2} />
      {/* carriages */}
      {cars.map((c) => (
        <g key={c.x0}>
          <path d={`M${c.x0} 138 V88 Q${(c.x0 + c.x1) / 2} 74 ${c.x1} 88 V138 Z`} fill={carBody} />
          <line x1={c.x0} x2={c.x1} y1={126} y2={126} stroke={k.p.accent2} strokeOpacity={0.7} strokeWidth={1.2} />
          <line x1={c.x0} x2={c.x1} y1={99} y2={99} stroke={k.dark} strokeOpacity={0.35} strokeWidth={1} />
          <rect x={c.x0 - 6} y={128} width={6} height={4} fill={k.dark} />
        </g>
      ))}
      {/* rails */}
      <rect x={0} y={G} width={W} height={3} fill={k.trim} opacity={0.7} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={i * 20} y={G + 3} width={10} height={3} fill={k.bodyDark} />
      ))}
    </>
  );
  const front = (
    <>
      {wheel(46, 138, 12, 'l1')}
      {wheel(74, 138, 12, 'l2')}
      {wheel(110, 141, 9, 'l3')}
      {cars.flatMap((c) => [
        wheel(c.x0 + 16, 143, 7, `${c.x0}a`),
        wheel(c.x0 + 32, 143, 7, `${c.x0}b`),
        wheel(c.x1 - 32, 143, 7, `${c.x0}c`),
        wheel(c.x1 - 16, 143, 7, `${c.x0}d`),
      ])}
    </>
  );
  return { W, H, G, back, front, windows };
}

function dome(f: number, n: number, k: Ctx): Spec {
  const W = 250, H = 230, G = 214;
  const snow = '#EEF4FF';
  const back = (
    <>
      <defs>
        <clipPath id={`${k.id}-dome`}>
          <path d="M40 128 A85 85 0 0 1 210 128 Z" />
        </clipPath>
      </defs>
      <rect x={6} y={168} width={30} height={G - 168} fill={k.bodyDark} />
      <rect x={214} y={168} width={30} height={G - 168} fill={k.bodyDark} />
      <path d="M4 170 q15 -8 34 0" stroke={snow} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M212 170 q15 -8 34 0" stroke={snow} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />
      <rect x={30} y={126} width={190} height={G - 126} fill={k.body} />
      <path d="M40 128 A85 85 0 0 1 210 128 Z" fill={mix(k.p.ink, k.body, 0.25)} />
      <g clipPath={`url(#${k.id}-dome)`}>
        {[-60, -30, 0, 30, 60].map((dx) => (
          <path key={dx} d={`M125 43 Q${125 + dx * 1.35} 86 ${125 + dx * 1.42} 128`} stroke={k.dark} strokeOpacity={0.25} fill="none" />
        ))}
        <rect x={115} y={40} width={20} height={90} fill={k.dark} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={119 + ((i * 7) % 13)} cy={52 + i * 14} r={0.9} fill="#fff" className="fp-twinkle" style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </g>
      <g className="fp-scope">
        <rect x={125} y={78} width={58} height={11} rx={2} transform="rotate(-38 125 89)" fill={mix(k.p.ink, k.p.accent, 0.4)} stroke={k.dark} strokeWidth={1} />
      </g>
      <path d="M38 128 Q60 118 82 126 T126 122 T168 126 T212 128" stroke={snow} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9} />
      <rect x={26} y={124} width={198} height={5} fill={k.bodyDark} />
    </>
  );
  return { W, H, G, back, windows: grid(42, 136, 208, 206, f, n, 0.42, 0.6, 'arch') };
}

const SHAPES: Record<Shape, (f: number, n: number, k: Ctx) => Spec> = {
  manor, lighthouse, tower, museum, skyline, gothic, train, dome, cottage, boutique, carnival,
};

/** Which window row(s) a tier band covers. */
function rowInTier(row: number, floors: number, tier: number): boolean {
  if (floors >= 5) return Math.min(4, Math.floor((row * 5) / floors)) === tier;
  return row === Math.min(floors - 1, Math.floor((tier * floors) / 5));
}

function winPath(w: Win): string {
  const r = Math.min(w.w / 2, w.h / 2);
  return `M${w.x} ${w.y + w.h} V${w.y + r} A${w.w / 2} ${r} 0 0 1 ${w.x + w.w} ${w.y + r} V${w.y + w.h} Z`;
}

function WindowShape({ w, fill, className, style }: { w: Win; fill: string; className?: string; style?: CSSProperties }) {
  if (w.kind === 'round') return <circle cx={w.x + w.w / 2} cy={w.y + w.h / 2} r={Math.min(w.w, w.h) / 2} fill={fill} className={className} style={style} />;
  if (w.kind === 'arch') return <path d={winPath(w)} fill={fill} className={className} style={style} />;
  return <rect x={w.x} y={w.y} width={w.w} height={w.h} rx={0.8} fill={fill} className={className} style={style} />;
}

function FacadeArtImpl({
  district,
  litFraction = 0,
  litWindows,
  highlightFloor,
  height = 240,
  sky = true,
  fog = true,
  className,
  style,
  title,
}: FacadeArtProps) {
  const d = typeof district === 'string' ? (getDistrict(district) ?? (DISTRICTS[0] as District)) : district;
  const rid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `fa${rid}`;
  const p = d.palette;
  const { floors, windowsPerFloor, shape } = d.facade;

  const light = isLightDistrict(d);
  const ctx: Ctx = useMemo(
    () =>
      light
        ? {
            p,
            body: mix(p.accent, '#ffffff', 0.78),
            bodyDark: mix(p.accent, p.ink, 0.3),
            roof: mix(p.accent, p.ink, 0.15),
            trim: '#ffffff',
            dark: mix(p.ink, p.accent, 0.35),
            id,
            light,
          }
        : {
            p,
            body: mix(p.panel, p.ink, 0.07),
            bodyDark: shade(p.panel, -0.35),
            roof: mix(shade(p.panel, -0.2), p.accent, 0.12),
            trim: mix(p.accent, p.panel, 0.25),
            dark: shade(p.bg, -0.3),
            id,
            light,
          },
    [p, id, light],
  );

  const spec = useMemo(() => SHAPES[shape](floors, windowsPerFloor, ctx), [shape, floors, windowsPerFloor, ctx]);

  // deterministic scatter order for litFraction
  const order = useMemo(() => {
    const r = rng(`${d.id}-windows`);
    const idx = spec.windows.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [idx[i], idx[j]] = [idx[j] as number, idx[i] as number];
    }
    const rank = new Array<number>(idx.length);
    idx.forEach((wi, k) => (rank[wi] = k));
    return rank;
  }, [d.id, spec.windows]);

  const stars = useMemo(() => {
    const r = rng(`${d.id}-stars`);
    return Array.from({ length: 22 }, () => ({ x: r() * spec.W, y: r() * spec.G * 0.55, s: 0.4 + r() * 0.9, t: r() }));
  }, [d.id, spec.W, spec.G]);

  const total = spec.windows.length;
  const litCount = Math.round(Math.max(0, Math.min(1, litFraction)) * total);
  const isLit = (i: number) => (litWindows ? Boolean(litWindows[i]) : (order[i] as number) < litCount);

  const hi =
    highlightFloor !== undefined && highlightFloor >= 0
      ? spec.windows.filter((w) => rowInTier(w.row, floors, highlightFloor))
      : [];
  const hiBox =
    hi.length > 0
      ? {
          x: Math.min(...hi.map((w) => w.x)) - 5,
          y: Math.min(...hi.map((w) => w.y)) - 4,
          x2: Math.max(...hi.map((w) => w.x + w.w)) + 5,
          y2: Math.max(...hi.map((w) => w.y + w.h)) + 4,
        }
      : null;

  const unlit = light ? mix('#DDEBFF', p.accent, 0.14) : mix(shade(p.bg, -0.2), p.glow, 0.06);
  const litFill = light ? mix('#FFE08A', p.glow, 0.25) : p.glow;
  const { W, H, G } = spec;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={{ height, aspectRatio: `${W} / ${H}`, display: 'block', ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={light ? mix(p.glow, '#ffffff', 0.15) : shade(p.bg, -0.4)} />
          <stop offset="0.7" stopColor={light ? mix(p.accent2, '#ffffff', 0.55) : mix(p.bg, p.panel, 0.6)} />
          <stop offset="1" stopColor={light ? mix('#FFE9B8', '#ffffff', 0.3) : mix(p.panel, p.glow, 0.12)} />
        </linearGradient>
        <linearGradient id={`${id}-fog`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={light ? '#ffffff' : mix(p.muted, p.bg, 0.4)} stopOpacity={0} />
          <stop offset="0.6" stopColor={light ? '#ffffff' : mix(p.muted, p.bg, 0.4)} stopOpacity={light ? 0.35 : 0.32} />
          <stop offset="1" stopColor={light ? '#ffffff' : mix(p.muted, p.bg, 0.5)} stopOpacity={light ? 0.55 : 0.5} />
        </linearGradient>
      </defs>

      {sky && (
        <>
          <rect width={W} height={H} fill={`url(#${id}-sky)`} />
          {light ? (
            <DaySky W={W} G={G} seed={d.id} />
          ) : (
            stars.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.s}
                fill="#fff"
                opacity={0.6}
                className={i % 3 === 0 ? 'fp-twinkle' : undefined}
                style={i % 3 === 0 ? { animationDelay: `${s.t * 4}s` } : undefined}
              />
            ))
          )}
        </>
      )}

      {spec.back}

      {/* unlit windows */}
      <g>
        {spec.windows.map((w, i) => (isLit(i) ? null : <WindowShape key={i} w={w} fill={unlit} />))}
      </g>
      {/* lit windows */}
      <g filter={`url(#${id}-glow)`}>
        {spec.windows.map((w, i) =>
          isLit(i) ? (
            <WindowShape
              key={i}
              w={w}
              fill={litFill}
              className={i % 4 === 1 ? 'fp-win-flicker' : undefined}
              style={i % 4 === 1 ? { animationDelay: `${((i * 1.37) % 6).toFixed(2)}s` } : undefined}
            />
          ) : null,
        )}
      </g>

      {spec.front}

      {hiBox && (
        <rect
          x={hiBox.x}
          y={hiBox.y}
          width={hiBox.x2 - hiBox.x}
          height={hiBox.y2 - hiBox.y}
          rx={3}
          fill={p.accent}
          fillOpacity={0.14}
          stroke={light ? p.ink : p.accent2}
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
      )}

      {sky && <rect x={0} y={G} width={W} height={H - G} fill={light ? mix(p.muted, '#ffffff', 0.55) : shade(p.bg, -0.3)} />}
      {fog && (
        <g className="fp-fog">
          <rect x={-W * 0.1} y={G - 26} width={W * 1.2} height={H - G + 26} fill={`url(#${id}-fog)`} />
        </g>
      )}
    </svg>
  );
}

export const FacadeArt = memo(FacadeArtImpl);

/** Number of windows a district's facade has (floors × windowsPerFloor). */
export const facadeWindowCount = (d: District) => d.facade.floors * d.facade.windowsPerFloor;

/** Daylight / sunset sky for light-mood districts: a warm sun and fluffy drifting clouds. */
function DaySky({ W, G, seed }: { W: number; G: number; seed: string }) {
  const clouds = useMemo(() => {
    const r = rng(`${seed}-clouds`);
    return Array.from({ length: 3 }, (_, i) => ({ x: (0.12 + i * 0.36 + r() * 0.1) * W, y: (0.1 + r() * 0.22) * G, s: 0.7 + r() * 0.6 }));
  }, [W, G, seed]);
  return (
    <>
      <circle cx={W * 0.82} cy={G * 0.2} r={26} fill="#FFF3C4" opacity={0.55} />
      <circle cx={W * 0.82} cy={G * 0.2} r={15} fill="#FFE8A0" />
      {clouds.map((c, i) => (
        <g key={i} className="fp-cloud" style={{ animationDelay: `${-i * 9}s` }} opacity={0.92}>
          <g transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
            <ellipse cx={0} cy={6} rx={24} ry={7} fill="#ffffff" />
            <circle cx={-9} cy={1} r={8} fill="#ffffff" />
            <circle cx={4} cy={-2} r={11} fill="#ffffff" />
            <circle cx={15} cy={3} r={7} fill="#ffffff" />
          </g>
        </g>
      ))}
    </>
  );
}
