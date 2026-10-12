import { mix } from '@/components/avatar/color';
import { grid, row, type Ctx, type Spec, type Win } from './facadeKit';

/**
 * Bright "Sugar Lane" facades for light-mood districts: patisserie cottage, Parisian boutique and
 * the carnival pier. Drawn in daylight colours; same window contract as the night facades
 * (index = row * windowsPerFloor + col, row 0 = ground).
 */

const LEAF = '#7CC59A';
const CREAM = '#FFF8EC';

function flowers(x: number, y: number, w: number, colors: string[], key: string) {
  const n = Math.max(3, Math.round(w / 5));
  return (
    <g key={key}>
      <rect x={x - 1} y={y} width={w + 2} height={4} rx={1} fill="#C98F6B" />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x + ((i + 0.5) * w) / n} cy={y - 1} r={1.9} fill={colors[i % colors.length]} />
      ))}
    </g>
  );
}

function sparkle(x: number, y: number, s: number, fill: string, delay: number, key: string) {
  return (
    <path
      key={key}
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`}
      fill={fill}
      className="fp-twinkle"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

// ───────────────────────────── cottage (patisserie) ─────────────────────────────

export function cottage(f: number, n: number, k: Ctx): Spec {
  const W = 300, H = 240, G = 222;
  const p = k.p;
  const wall = mix(p.accent, '#ffffff', 0.74);
  const wallShade = mix(p.accent, '#ffffff', 0.55);
  const roof = mix(p.accent, p.ink, 0.28);
  const upper = f > 1 ? grid(54, 84, 218, 150, f - 1, n, 0.5, 0.66, 'arch').map((w) => ({ ...w, row: w.row + 1 })) : [];
  const shop = row(58, 214, 190, n, Math.min(28, 150 / n - 4), 24, 0);
  const windows: Win[] = [...shop, ...upper];
  const stripes = Array.from({ length: 17 }, (_, i) => 34 + i * 12);
  const back = (
    <>
      {/* macaron sign */}
      <line x1={124} y1={40} x2={128} y2={33} stroke={roof} strokeWidth={1.5} />
      <line x1={148} y1={40} x2={144} y2={33} stroke={roof} strokeWidth={1.5} />
      <ellipse cx={136} cy={30} rx={25} ry={8} fill={p.accent} />
      <ellipse cx={136} cy={24.5} rx={23} ry={3.6} fill={CREAM} />
      <ellipse cx={136} cy={18} rx={25} ry={8} fill={mix(p.accent, '#ffffff', 0.25)} />
      <path d="M112 22.5 q24 4 48 0" stroke={mix(p.accent, p.ink, 0.15)} strokeWidth={1} fill="none" opacity={0.5} />
      {/* building */}
      <rect x={40} y={74} width={192} height={G - 74} fill={wall} />
      <rect x={40} y={74} width={8} height={G - 74} fill={wallShade} />
      <rect x={224} y={74} width={8} height={G - 74} fill={wallShade} />
      <polygon points="32,76 52,42 220,42 240,76" fill={roof} />
      {[90, 136, 182].map((x) => (
        <g key={x}>
          <rect x={x - 7} y={50} width={14} height={18} rx={7} fill={CREAM} />
          <rect x={x - 4.5} y={54} width={9} height={12} rx={4.5} fill={mix('#DDEBFF', p.accent, 0.12)} />
        </g>
      ))}
      {Array.from({ length: 21 }, (_, i) => (
        <circle key={i} cx={34 + i * 10.3} cy={76} r={3.2} fill="#ffffff" />
      ))}
      {/* plaque */}
      <rect x={90} y={151} width={92} height={12} rx={3} fill={CREAM} stroke={p.accent} strokeWidth={0.8} />
      <text x={136} y={160} textAnchor="middle" fontSize={7.5} fontFamily="var(--font-display)" fontWeight={700} fill={roof} letterSpacing={1.6}>
        PÂTISSERIE
      </text>
      {/* shop frame */}
      <rect x={52} y={186} width={168} height={32} rx={2} fill={roof} />
      {/* tea-garden arch */}
      <path d={`M250 ${G} V150 A21 21 0 0 1 292 150 V${G}`} stroke={LEAF} strokeWidth={4} fill="none" strokeLinecap="round" />
      {[[250, 196], [250, 170], [254, 140], [264, 131], [278, 131], [288, 140], [292, 168], [292, 194], [271, 129]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={3.6} fill={i % 2 ? p.accent : p.danger} />
          <circle cx={(x as number) + 2.5} cy={(y as number) + 3} r={2} fill={LEAF} />
        </g>
      ))}
      <ellipse cx={271} cy={204} rx={11} ry={2.5} fill="#ffffff" />
      <line x1={271} x2={271} y1={204} y2={G} stroke={roof} strokeWidth={1.5} />
      <ellipse cx={271} cy={201} rx={3} ry={2.2} fill={p.accent2} />
      {/* bushes */}
      {[22, 236].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={G - 6} rx={18} ry={10} fill={LEAF} />
          <circle cx={x - 6} cy={G - 10} r={2} fill={p.accent} />
          <circle cx={x + 5} cy={G - 12} r={2} fill="#ffffff" />
          <circle cx={x + 9} cy={G - 6} r={2} fill={p.accent2} />
        </g>
      ))}
    </>
  );
  const front = (
    <>
      {upper.map((w, i) => flowers(w.x, w.y + w.h + 1, w.w, [p.accent, p.accent2, '#ffffff', p.danger], `fb${i}`))}
      {/* striped scalloped awning */}
      <g>
        {stripes.map((x, i) => (
          <g key={x}>
            <rect x={x} y={166} width={12} height={12} fill={i % 2 ? '#ffffff' : p.accent} />
            <path d={`M${x} 178 a6 6 0 0 0 12 0 z`} fill={i % 2 ? '#ffffff' : p.accent} />
          </g>
        ))}
        <rect x={34} y={164} width={204} height={3} fill={mix(p.accent, p.ink, 0.2)} />
      </g>
      {/* cakes in the shop window */}
      {shop.map((w, i) =>
        i % 2 === 0 ? (
          <g key={`c${i}`}>
            <rect x={w.x + w.w / 2 - 6} y={w.y + w.h - 9} width={12} height={8} rx={1.5} fill={i % 4 ? p.accent2 : '#ffffff'} />
            <rect x={w.x + w.w / 2 - 6} y={w.y + w.h - 6} width={12} height={2} fill={p.accent} />
            <circle cx={w.x + w.w / 2} cy={w.y + w.h - 10.5} r={1.8} fill={p.danger} />
          </g>
        ) : null,
      )}
    </>
  );
  return { W, H, G, back, front, windows, attic: { x: 50, y: 42, w: 172, h: 32 } };
}

// ───────────────────────────── boutique ─────────────────────────────

export function boutique(f: number, n: number, k: Ctx): Spec {
  const W = 260, H = 250, G = 232;
  const p = k.p;
  const lilac = mix(p.accent, '#ffffff', 0.76);
  const deep = mix(p.accent, p.ink, 0.22);
  const upperRaw = f > 1 ? grid(44, 76, 216, 146, f - 1, n, 0.5, 0.62, 'round') : [];
  const upper = upperRaw.map((w) => {
    const s = Math.min(w.w, w.h);
    return { ...w, x: w.x + (w.w - s) / 2, y: w.y + (w.h - s) / 2, w: s, h: s, row: w.row + 1 };
  });
  const cw = 180 / Math.max(1, n);
  const shop = row(40, 220, 182, n, cw * 0.66, 40, 0, 'arch');
  const windows: Win[] = [...shop, ...upper];
  const back = (
    <>
      <rect x={28} y={66} width={204} height={G - 66} fill={lilac} />
      <polygon points="20,68 40,32 220,32 240,68" fill={deep} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={44 + i * 21.5} x2={44 + i * 21.5} y1={34} y2={66} stroke="#ffffff" strokeOpacity={0.18} />
      ))}
      <circle cx={130} cy={50} r={10} fill={CREAM} />
      <circle cx={130} cy={50} r={6.5} fill={mix('#DDEBFF', p.accent, 0.15)} />
      {[40, 220].map((x) => (
        <line key={x} x1={x} x2={x} y1={32} y2={22} stroke={deep} strokeWidth={2} />
      ))}
      <rect x={20} y={66} width={220} height={4} fill="#ffffff" opacity={0.85} />
      {/* sign band */}
      <rect x={70} y={150} width={120} height={14} rx={7} fill={CREAM} stroke={p.accent} strokeWidth={0.8} />
      <text x={130} y={160} textAnchor="middle" fontSize={8.5} fontStyle="italic" fontFamily="var(--font-display)" fontWeight={700} fill={deep}>
        Lavender &amp; Lace
      </text>
      {/* hanging baskets */}
      {[18, 242].map((x, i) => (
        <g key={x}>
          <line x1={i ? 232 : 28} x2={x} y1={132} y2={132} stroke={deep} strokeWidth={1.4} />
          <line x1={x} x2={x} y1={132} y2={142} stroke={deep} strokeWidth={0.8} />
          <path d={`M${x - 9} 142 a9 7 0 0 0 18 0 z`} fill="#C9A27E" />
          {[-6, -2, 2, 6].map((dx, j) => (
            <circle key={dx} cx={x + dx} cy={141} r={2.4} fill={[p.accent2, '#ffffff', p.accent, p.accent2][j]} />
          ))}
          <path d={`M${x - 6} 146 q-2 6 1 10 M${x + 5} 147 q2 5 -1 9`} stroke={LEAF} strokeWidth={1.4} fill="none" />
        </g>
      ))}
      <rect x={24} y={G - 6} width={212} height={6} fill={deep} opacity={0.35} />
    </>
  );
  const front = (
    <>
      {/* balconies */}
      {upper.map((w, i) => (
        <path
          key={`b${i}`}
          d={`M${w.x - 4} ${w.y + w.h + 3} h${w.w + 8} M${w.x - 2} ${w.y + w.h + 3} q2 4 4 0 q2 4 4 0 q2 4 4 0 q2 4 4 0`}
          stroke={deep}
          strokeWidth={1}
          fill="none"
        />
      ))}
      {/* mannequins */}
      {shop.map((w, i) => {
        const cx = w.x + w.w / 2;
        return (
          <g key={`m${i}`} opacity={0.6}>
            <circle cx={cx} cy={w.y + 15} r={2.8} fill={deep} />
            <path d={`M${cx - 3} ${w.y + 19} h6 l4 ${w.h - 24} h-14 z`} fill={i % 2 ? p.accent2 : deep} />
            <line x1={cx} x2={cx} y1={w.y + w.h - 5} y2={w.y + w.h} stroke={deep} strokeWidth={1} />
          </g>
        );
      })}
      {/* bow-topped awnings */}
      {shop.map((w, i) => {
        const cx = w.x + w.w / 2;
        return (
          <g key={`a${i}`}>
            <path
              d={`M${w.x - 4} 168 h${w.w + 8} l3 9 ${Array.from({ length: 4 }, () => `q-${(w.w + 14) / 8} 4 -${(w.w + 14) / 4} 0`).join(' ')} z`}
              fill={p.accent2}
            />
            <path d={`M${cx} 167 l-6 -4 v8 z M${cx} 167 l6 -4 v8 z`} fill={p.accent} />
            <circle cx={cx} cy={167} r={1.8} fill="#ffffff" />
          </g>
        );
      })}
      {sparkle(16, 40, 5, '#ffffff', 0, 's1')}
      {sparkle(246, 28, 4, p.accent2, 1.2, 's2')}
      {sparkle(150, 18, 3.5, '#ffffff', 2.1, 's3')}
      {sparkle(60, 22, 3, p.accent, 2.8, 's4')}
      {sparkle(204, 112, 3, '#ffffff', 0.7, 's5')}
    </>
  );
  return { W, H, G, back, front, windows, attic: { x: 42, y: 32, w: 176, h: 34 } };
}

// ───────────────────────────── carnival ─────────────────────────────

const quad = (a: [number, number], c: [number, number], b: [number, number], t: number): [number, number] => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

export function carnival(f: number, n: number, k: Ctx): Spec {
  const W = 360, H = 250, G = 232;
  const p = k.p;
  const cx = 100, cy = 110, R = 76;
  const steel = mix(p.ink, '#ffffff', 0.45);
  const colors = [p.accent, p.accent2, p.glow, '#A8E6CF', '#C9A8FF'];
  // row 0: bulbs on the carousel canopy; rows ≥1: fairy-light strings
  const windows: Win[] = [...row(198, 290, 152, n, 5, 5, 0, 'round')];
  const strings: Array<{ a: [number, number]; c: [number, number]; b: [number, number] }> = [];
  for (let r = 1; r < f; r++) {
    const off = (r - 1) * 16;
    const s = { a: [150, 54 + off] as [number, number], c: [246, 116 + off] as [number, number], b: [352, 112 + off] as [number, number] };
    strings.push(s);
    for (let i = 0; i < n; i++) {
      const [x, y] = quad(s.a, s.c, s.b, (i + 0.5) / n);
      windows.push({ x: x - 2.6, y: y + 1, w: 5.2, h: 5.2, row: r, col: i, kind: 'round' });
    }
  }
  const spokes = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);
  const gondolas = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  const tentStripes = Array.from({ length: 8 }, (_, i) => 304 + i * 6.6);
  const back = (
    <>
      {/* ferris wheel */}
      <line x1={cx} y1={cy} x2={64} y2={G} stroke={steel} strokeWidth={4} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={136} y2={G} stroke={steel} strokeWidth={4} strokeLinecap="round" />
      <g className="fp-ferris" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={p.accent} strokeWidth={3} />
        <circle cx={cx} cy={cy} r={R - 9} fill="none" stroke="#ffffff" strokeWidth={1.2} />
        {spokes.map((a) => (
          <line key={a} x1={cx} y1={cy} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke="#ffffff" strokeWidth={1} />
        ))}
        {gondolas.map((a, i) => {
          const gx = cx + Math.cos(a) * R;
          const gy = cy + Math.sin(a) * R;
          return (
            <g key={a} className="fp-ferris-rev" style={{ transformOrigin: `${gx}px ${gy}px` }}>
              <line x1={gx} y1={gy} x2={gx} y2={gy + 4} stroke={steel} strokeWidth={1} />
              <rect x={gx - 7} y={gy + 4} width={14} height={10} rx={3} fill={colors[i % colors.length]} />
              <rect x={gx - 7} y={gy + 4} width={14} height={3} rx={1.5} fill="#ffffff" opacity={0.7} />
            </g>
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={6} fill={p.accent2} stroke="#ffffff" strokeWidth={1.5} />
      {/* bunting */}
      {strings.map((s, si) => (
        <g key={si}>
          <path d={`M${s.a[0]} ${s.a[1]} Q${s.c[0]} ${s.c[1]} ${s.b[0]} ${s.b[1]}`} stroke={steel} strokeWidth={0.8} fill="none" />
          {Array.from({ length: n + 1 }, (_, i) => {
            const [x, y] = quad(s.a, s.c, s.b, i / n);
            return <polygon key={i} points={`${x - 4},${y} ${x + 4},${y} ${x},${y + 8}`} fill={colors[(i + si) % colors.length]} opacity={0.9} />;
          })}
        </g>
      ))}
      {/* carousel */}
      <rect x={194} y={212} width={100} height={8} rx={3} fill={mix(p.accent2, '#ffffff', 0.4)} />
      {[204, 228, 260, 284].map((x) => (
        <line key={x} x1={x} x2={x} y1={152} y2={212} stroke={p.accent2} strokeWidth={2} />
      ))}
      {[214, 244, 272].map((x, i) => (
        <g key={x} className="fp-bob" style={{ animationDelay: `${i * 0.5}s` }}>
          <ellipse cx={x} cy={186} rx={9} ry={5} fill="#ffffff" />
          <path d={`M${x + 7} 184 l5 -7 l3 2 l-4 7 z`} fill="#ffffff" />
          <path d={`M${x - 6} 189 v8 M${x + 5} 189 v8`} stroke="#ffffff" strokeWidth={1.6} />
          <path d={`M${x - 3} 181 h6`} stroke={colors[i]} strokeWidth={2.5} />
        </g>
      ))}
      <polygon points="188,150 244,110 300,150" fill={p.accent} />
      {Array.from({ length: 7 }, (_, i) => (
        <polygon key={i} points={`244,110 ${190 + i * 16},150 ${198 + i * 16},150`} fill="#ffffff" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${188 + i * 12.5} 150 a6.25 5 0 0 0 12.5 0 z`} fill={i % 2 ? '#ffffff' : p.accent} />
      ))}
      <line x1={244} x2={244} y1={110} y2={98} stroke={steel} strokeWidth={1.2} />
      <path d="M244 98 l10 3 l-10 3 z" fill={p.accent2} />
      {/* striped tent */}
      {tentStripes.map((x, i) => (
        <rect key={x} x={x} y={176} width={6.6} height={G - 176} fill={i % 2 ? '#ffffff' : p.accent2} />
      ))}
      <polygon points="300,178 330,140 360,178" fill={p.accent2} />
      {Array.from({ length: 4 }, (_, i) => (
        <polygon key={i} points={`330,140 ${303 + i * 15},178 ${310 + i * 15},178`} fill="#ffffff" />
      ))}
      <path d={`M322 ${G} L330 196 L338 ${G} Z`} fill={mix(p.ink, p.accent2, 0.3)} />
      <line x1={330} x2={330} y1={140} y2={128} stroke={steel} strokeWidth={1.2} />
      <path d="M330 128 l9 3 l-9 3 z" fill={p.accent} />
      {/* boardwalk */}
      <rect x={0} y={G} width={W} height={4} fill={mix('#C98F6B', '#ffffff', 0.3)} />
    </>
  );
  const front = (
    <>
      {[
        { x: 176, y: 196, c: p.accent, d: 0 },
        { x: 34, y: 186, c: p.accent2, d: 3 },
        { x: 316, y: 110, c: '#C9A8FF', d: 6 },
      ].map((b, i) => (
        <g key={i} className="fp-balloon" style={{ animationDelay: `${b.d}s` }}>
          <path d={`M${b.x} ${b.y + 7} q-3 8 1 16`} stroke={steel} strokeWidth={0.7} fill="none" />
          <ellipse cx={b.x} cy={b.y} rx={5.5} ry={6.8} fill={b.c} />
          <ellipse cx={b.x - 1.8} cy={b.y - 2.4} rx={1.4} ry={2} fill="#ffffff" opacity={0.7} />
        </g>
      ))}
    </>
  );
  return { W, H, G, back, front, windows, attic: { x: 68, y: 24, w: 64, h: 32 } };
}
