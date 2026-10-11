import type { JSX } from 'react';
import { FootShadow, GroundShadow, INK, OLine, Oriented, Shine, ol, thin, tone, type SpriteProps } from './common';

const CRATE = tone('#d6a160');
const WOOD = tone('#c98a4b');

/** Slatted wooden crate with a diagonal brace. */
export function Crate(_: SpriteProps): JSX.Element {
  return (
    <g>
      <FootShadow x={14} y={14} w={72} h={72} rx={6} />
      <rect x={14} y={14} width={72} height={72} rx={6} fill={CRATE.base} {...ol} />
      <path d="M24,38 H76 M24,62 H76" stroke={CRATE.dark} strokeWidth={2.6} />
      <path d="M28,74 L72,26" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d="M28,74 L72,26" stroke={CRATE.light} strokeWidth={7} strokeLinecap="round" />
      {/* frame boards */}
      <rect x={14} y={14} width={12} height={72} rx={5} fill={CRATE.dark} {...thin} />
      <rect x={74} y={14} width={12} height={72} rx={5} fill={CRATE.dark} {...thin} />
      <rect x={14} y={14} width={72} height={72} rx={6} fill="none" {...ol} />
      {[
        [20, 20],
        [80, 20],
        [20, 80],
        [80, 80],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} fill={INK} />
      ))}
      <Shine d="M32,21 H60" width={3.5} />
    </g>
  );
}

/** Wooden barrel with metal hoops. */
export function Barrel(_: SpriteProps): JSX.Element {
  const b = tone('#b5713f');
  const hoop = '#6d6a73';
  return (
    <g>
      <GroundShadow cx={50} cy={89} rx={30} ry={6} />
      <path d="M28,16 H72 Q86,50 72,86 H28 Q14,50 28,16 Z" fill={b.base} {...ol} />
      <path d="M40,18 Q36,50 40,84 M60,18 Q64,50 60,84" stroke={b.dark} strokeWidth={2.4} fill="none" />
      <path d="M50,18 V84" stroke={b.dark} strokeWidth={2.4} />
      <path d="M22,32 Q50,38 78,32" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M22,32 Q50,38 78,32" stroke={hoop} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M22,70 Q50,76 78,70" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M22,70 Q50,76 78,70" stroke={hoop} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <ellipse cx={50} cy={16} rx={22} ry={6.5} fill={b.light} {...thin} />
      <ellipse cx={50} cy={16} rx={14} ry={3.5} fill="none" stroke={b.dark} strokeWidth={1.8} />
      <Shine d="M31,42 Q29,52 31,62" width={4} opacity={0.4} />
    </g>
  );
}

/** Green recycling bin. */
export function Bin(_: SpriteProps): JSX.Element {
  const g = tone('#4caf6a');
  return (
    <g>
      <GroundShadow cx={50} cy={89} rx={26} ry={5.5} />
      <path d="M25,28 H75 L69,88 H31 Z" fill={g.base} {...ol} />
      <path d="M37,36 L39,80 M63,36 L61,80" stroke={g.dark} strokeWidth={3} strokeLinecap="round" />
      {/* recycle arrows */}
      <g transform="translate(50 58)" fill="none" stroke="#ffffff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M-3,-10 L-9,0 M3,-10 L9,0 M-7,7 H7" />
        <path d="M-9,0 l-1,-5 M-9,0 l5,-1 M7,7 l-4,-3 M7,7 l-4,3 M3,-10 l4,3 M3,-10 l-1,5" />
      </g>
      <rect x={19} y={17} width={62} height={14} rx={5} fill={g.dark} {...ol} />
      <rect x={42} y={11} width={16} height={7} rx={3} fill={g.deep} {...thin} />
      <Shine d="M28,22 H50" width={3} opacity={0.4} />
    </g>
  );
}

/** Leafy potted plant. */
export function Plant(_: SpriteProps): JSX.Element {
  const leaf = tone('#5aae5c');
  const pot = tone('#d27a4f');
  const leaves: Array<[number, number]> = [
    [-62, 28],
    [-28, 33],
    [6, 34],
    [38, 31],
    [68, 26],
  ];
  return (
    <g>
      <GroundShadow cx={50} cy={90} rx={22} ry={5} />
      {leaves.map(([a, len], i) => (
        <g key={a} transform={`translate(50 56) rotate(${a})`}>
          <path
            d={`M0,0 Q${-len * 0.4},${-len * 0.55} 0,${-len - 6} Q${len * 0.4},${-len * 0.55} 0,0 Z`}
            fill={i % 2 ? leaf.dark : leaf.base}
            {...thin}
          />
          <path d={`M0,-4 L0,${-len + 2}`} stroke={leaf.light} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ))}
      <path d="M33,62 H67 L62,90 H38 Z" fill={pot.base} {...ol} />
      <rect x={28} y={56} width={44} height={11} rx={3} fill={pot.dark} {...ol} />
      <Shine d="M40,72 V84" width={3} opacity={0.35} />
    </g>
  );
}

/** Crate of bananas. */
export function Bananas(_: SpriteProps): JSX.Element {
  const y = '#f7d04a';
  const banana = (x: number, yy: number, rot: number, k: number) => (
    <g key={k} transform={`translate(${x} ${yy}) rotate(${rot})`}>
      <path d="M-19,-2 Q0,24 19,-2 Q0,8 -19,-2 Z" fill={y} stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
      <path d="M-10,6 Q0,12 10,6" fill="none" stroke="#fff3b0" strokeWidth={2} strokeLinecap="round" />
      <path d="M19,-2 l4,-3" stroke="#6b4a2a" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <FootShadow x={14} y={44} w={72} h={44} rx={5} />
      {banana(36, 30, -14, 1)}
      {banana(62, 28, 12, 2)}
      {banana(48, 38, 2, 3)}
      {banana(32, 44, -6, 4)}
      {banana(66, 42, 8, 5)}
      <rect x={14} y={52} width={72} height={36} rx={5} fill={CRATE.base} {...ol} />
      <path d="M18,70 H82" stroke={CRATE.dark} strokeWidth={2.6} />
      <rect x={14} y={52} width={11} height={36} rx={4} fill={CRATE.dark} {...thin} />
      <rect x={75} y={52} width={11} height={36} rx={4} fill={CRATE.dark} {...thin} />
      <Shine d="M30,58 H58" width={3} />
    </g>
  );
}

/** Floor lamp with a warm glow. */
export function Lamp(_: SpriteProps): JSX.Element {
  return (
    <g>
      <circle cx={50} cy={32} r={34} fill="#ffe08a" opacity={0.28} />
      <GroundShadow cx={50} cy={90} rx={18} ry={4.5} />
      <ellipse cx={50} cy={86} rx={17} ry={6} fill="#4a4048" {...thin} />
      <OLine d="M50,44 V84" color="#8a7f86" width={4} />
      <path d="M31,14 H69 L80,46 H20 Z" fill="#f6d27a" {...ol} />
      <path d="M38,16 L34,44 M50,16 V44 M62,16 L66,44" stroke="#e8b84f" strokeWidth={2.4} />
      <Shine d="M33,22 L28,38" width={3.5} opacity={0.6} />
    </g>
  );
}

/** Steel safe with a dial. */
export function Safe(_: SpriteProps): JSX.Element {
  const s = tone('#7d8b99');
  return (
    <g>
      <FootShadow x={16} y={14} w={68} h={72} rx={8} />
      <rect x={20} y={83} width={10} height={7} rx={2} fill={INK} />
      <rect x={70} y={83} width={10} height={7} rx={2} fill={INK} />
      <rect x={16} y={14} width={68} height={72} rx={8} fill={s.base} {...ol} />
      <rect x={23} y={21} width={54} height={58} rx={5} fill={s.light} {...thin} />
      <rect x={18} y={30} width={7} height={11} rx={2} fill={s.dark} stroke={INK} strokeWidth={2} />
      <rect x={18} y={60} width={7} height={11} rx={2} fill={s.dark} stroke={INK} strokeWidth={2} />
      <circle cx={53} cy={46} r={14} fill="#d9e0e6" {...thin} />
      <circle cx={53} cy={46} r={5} fill={s.dark} stroke={INK} strokeWidth={2} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path key={a} d="M53,34 V37" stroke={INK} strokeWidth={1.8} transform={`rotate(${a} 53 46)`} />
      ))}
      <OLine d="M44,68 H62" color="#c9a64a" width={4} />
      <Shine d="M28,26 H48" width={3} opacity={0.6} />
    </g>
  );
}

/** Marble bust on a plinth. */
export function Statue(_: SpriteProps): JSX.Element {
  const m = tone('#e7e3da');
  return (
    <g>
      <FootShadow x={22} y={58} w={56} h={32} rx={4} />
      <rect x={25} y={60} width={50} height={30} rx={3} fill="#cfc9bd" {...ol} />
      <rect x={20} y={55} width={60} height={9} rx={3} fill={m.base} {...ol} />
      <path d="M27,56 Q29,38 50,37 Q71,38 73,56 Z" fill={m.base} {...ol} />
      <path d="M44,40 Q50,48 56,40" fill="none" stroke={m.dark} strokeWidth={2.2} strokeLinecap="round" />
      <ellipse cx={50} cy={25} rx={12.5} ry={15} fill={m.base} {...ol} />
      {/* laurel */}
      <path d="M38,20 Q50,8 62,20" fill="none" stroke="#9fb36a" strokeWidth={4} strokeLinecap="round" />
      <path d="M45,27 h2 M53,27 h2" stroke={m.dark} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M46,33 Q50,35 54,33" fill="none" stroke={m.dark} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M30,74 H70" stroke="#b5ae9f" strokeWidth={2} />
      <Shine d="M42,16 Q40,22 41,28" width={3} opacity={0.8} />
    </g>
  );
}

/** Wire trolley on wheels. */
export function Trolley(_: SpriteProps): JSX.Element {
  const metal = '#8aa0b2';
  return (
    <g>
      <GroundShadow cx={50} cy={89} rx={34} ry={5} />
      <OLine d="M80,24 L88,14 H94" color={metal} width={4} />
      <OLine d="M28,66 H74 L80,24" color={metal} width={3.5} />
      <path d="M14,24 H82 L74,62 H26 Z" fill="#cfe3ef" {...ol} />
      <path d="M30,28 L34,58 M44,28 L45,58 M58,28 L56,58 M70,28 L66,58 M20,38 H79 M24,50 H76" stroke={metal} strokeWidth={2.2} />
      <path d="M14,24 H82 L74,62 H26 Z" fill="none" {...ol} />
      <path d="M22,24 L18,20" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {[32, 70].map((x) => (
        <g key={x}>
          <circle cx={x} cy={80} r={8} fill="#3d3a40" {...thin} />
          <circle cx={x} cy={80} r={3} fill="#c4ccd2" />
        </g>
      ))}
    </g>
  );
}

/** Travel suitcase with stickers. */
export function Suitcase(_: SpriteProps): JSX.Element {
  const c = tone('#d9823b');
  return (
    <g>
      <FootShadow x={14} y={30} w={72} h={56} rx={9} />
      <path d="M38,32 V20 Q38,16 42,16 H58 Q62,16 62,20 V32" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M38,32 V20 Q38,16 42,16 H58 Q62,16 62,20 V32" fill="none" stroke="#5a3a28" strokeWidth={4.5} strokeLinecap="round" />
      <rect x={14} y={30} width={72} height={56} rx={9} fill={c.base} {...ol} />
      <rect x={27} y={30} width={9} height={56} fill={c.dark} stroke={INK} strokeWidth={2.2} />
      <rect x={64} y={30} width={9} height={56} fill={c.dark} stroke={INK} strokeWidth={2.2} />
      <rect x={14} y={30} width={72} height={56} rx={9} fill="none" {...ol} />
      <circle cx={50} cy={56} r={8} fill="#4f86c6" stroke={INK} strokeWidth={2} />
      <path d="M45,56 h10 M50,51 v10" stroke="#ffffff" strokeWidth={2} />
      <rect x={42} y={70} width={16} height={9} rx={2} fill="#f0e3c4" stroke={INK} strokeWidth={1.8} transform="rotate(8 50 74)" />
      <Shine d="M20,40 V58" width={3.5} opacity={0.4} />
    </g>
  );
}

/** Ship's anchor. */
export function Anchor(_: SpriteProps): JSX.Element {
  const steel = '#6f8196';
  return (
    <g>
      <GroundShadow cx={50} cy={90} rx={32} ry={5} />
      <OLine d="M18,60 Q22,86 50,86 Q78,86 82,60" color={steel} width={7} />
      <path d="M12,62 L18,52 L25,62 Z M88,62 L82,52 L75,62 Z" fill={steel} {...thin} />
      <OLine d="M50,24 V84" color={steel} width={8} />
      <OLine d="M30,33 H70" color={steel} width={7} />
      <circle cx={50} cy={15} r={8} fill="none" stroke={INK} strokeWidth={10} />
      <circle cx={50} cy={15} r={8} fill="none" stroke={steel} strokeWidth={4.5} />
      <path d="M47,40 V74" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" opacity={0.35} />
    </g>
  );
}

/** Desk globe on a brass stand. */
export function Globe(_: SpriteProps): JSX.Element {
  const brass = '#d4a857';
  return (
    <g>
      <GroundShadow cx={50} cy={90} rx={22} ry={5} />
      <ellipse cx={50} cy={86} rx={19} ry={6} fill={WOOD.dark} {...thin} />
      <OLine d="M50,72 V84" color={brass} width={4} />
      <circle cx={50} cy={42} r={27} fill="#5aa7d8" {...ol} />
      <path d="M36,26 Q44,22 48,30 Q46,38 38,40 Q32,36 36,26 Z" fill="#7bc47f" stroke={INK} strokeWidth={2} />
      <path d="M54,40 Q64,36 68,46 Q66,58 56,60 Q50,52 54,40 Z" fill="#7bc47f" stroke={INK} strokeWidth={2} />
      <path d="M40,56 Q44,52 48,58 Q44,62 40,56 Z" fill="#7bc47f" stroke={INK} strokeWidth={1.8} />
      <path d="M50,15 Q70,42 50,69" fill="none" stroke="#ffffff" strokeWidth={1.4} opacity={0.5} />
      <path d="M22,42 Q50,50 78,42" fill="none" stroke="#ffffff" strokeWidth={1.4} opacity={0.5} />
      <path d="M23,30 A30,30 0 0 0 64,73" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M23,30 A30,30 0 0 0 64,73" fill="none" stroke={brass} strokeWidth={3.6} strokeLinecap="round" />
      <Shine d="M36,22 Q30,28 30,36" width={4} opacity={0.6} />
    </g>
  );
}

/** Painter's easel with a canvas. */
export function Easel(_: SpriteProps): JSX.Element {
  return (
    <g>
      <GroundShadow cx={50} cy={90} rx={30} ry={5} />
      <OLine d="M50,8 L26,90" color={WOOD.base} width={5} />
      <OLine d="M50,8 L74,90" color={WOOD.base} width={5} />
      <OLine d="M50,30 L50,82" color={WOOD.dark} width={4} />
      <rect x={22} y={14} width={56} height={44} rx={2} fill="#fbf7ef" {...ol} />
      <path d="M28,48 Q40,30 52,44 Q60,52 72,36 V54 H28 Z" fill="#8cc152" opacity={0.9} />
      <circle cx={64} cy={26} r={6} fill="#f6bb42" />
      <path d="M30,24 q6,-4 12,0" stroke="#4f86c6" strokeWidth={3} fill="none" strokeLinecap="round" />
      <rect x={22} y={14} width={56} height={44} rx={2} fill="none" {...ol} />
      <OLine d="M18,62 H82" color={WOOD.dark} width={5} />
    </g>
  );
}

/** Wooden coffin, top-down, with a cross. */
export function Coffin({ w, h }: SpriteProps): JSX.Element {
  const c = tone('#7a5240');
  return (
    <g>
      <FootShadow x={10} y={14} w={w - 20} h={h - 24} rx={12} />
      <Oriented w={w} h={h}>
        {(L) => {
          const sh = L * 0.28;
          const outer = `M8,50 L${sh},12 L${L - 10},22 L${L - 10},78 L${sh},88 Z`;
          const inner = `M18,50 L${sh + 2},21 L${L - 18},29 L${L - 18},71 L${sh + 2},79 Z`;
          const cx = L * 0.42;
          return (
            <g>
              <path d={outer} fill={c.base} {...ol} />
              <path d={inner} fill={c.light} stroke={c.dark} strokeWidth={2.4} strokeLinejoin="round" />
              <path d={`M${cx - 14},50 H${cx + 26} M${cx},38 V62`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
              <path d={`M${cx - 14},50 H${cx + 26} M${cx},38 V62`} stroke="#e8c76a" strokeWidth={4.5} strokeLinecap="round" />
              <Shine d={`M${sh + 6},26 L${L - 24},32`} width={3} opacity={0.35} />
            </g>
          );
        }}
      </Oriented>
    </g>
  );
}
