import type { JSX } from 'react';
import { FootShadow, GroundShadow, INK, OLine, Oriented, Shine, mix, ol, thin, tone, type SpriteProps } from './common';

const WOOD = tone('#c98a4b');
const RED = tone('#d9534f');
const BLUE = tone('#4f86c6');

/** Wooden dining chair, seen from the front and slightly above. */
export function Chair(_: SpriteProps): JSX.Element {
  return (
    <g>
      <GroundShadow cx={50} cy={89} rx={30} ry={6} />
      {/* back legs + posts */}
      <rect x={25} y={14} width={10} height={58} rx={4} fill={WOOD.dark} {...ol} />
      <rect x={65} y={14} width={10} height={58} rx={4} fill={WOOD.dark} {...ol} />
      {/* top rail + slat */}
      <rect x={20} y={10} width={60} height={17} rx={7} fill={WOOD.base} {...ol} />
      <rect x={34} y={29} width={32} height={8} rx={3} fill={WOOD.base} {...thin} />
      <Shine d="M28,15 H60" width={3.5} />
      {/* front legs */}
      <rect x={23} y={66} width={10} height={24} rx={4} fill={WOOD.dark} {...ol} />
      <rect x={67} y={66} width={10} height={24} rx={4} fill={WOOD.dark} {...ol} />
      {/* seat */}
      <rect x={17} y={45} width={66} height={27} rx={8} fill={WOOD.base} {...ol} />
      <rect x={17} y={64} width={66} height={11} rx={5} fill={WOOD.dark} {...ol} />
      <Shine d="M26,52 H58" width={4} />
    </g>
  );
}

/** Plump red armchair. */
export function Armchair(_: SpriteProps): JSX.Element {
  return (
    <g>
      <GroundShadow cx={50} cy={90} rx={40} ry={6} />
      <rect x={18} y={84} width={9} height={8} rx={2} fill={INK} />
      <rect x={73} y={84} width={9} height={8} rx={2} fill={INK} />
      {/* back */}
      <rect x={16} y={9} width={68} height={50} rx={18} fill={RED.base} {...ol} />
      <path d="M30,22 Q50,14 70,22" fill="none" stroke={RED.dark} strokeWidth={3} strokeLinecap="round" />
      <Shine d="M28,17 Q36,13 46,13" width={4} />
      {/* seat cushion */}
      <rect x={27} y={44} width={46} height={30} rx={9} fill={RED.light} {...ol} />
      <rect x={27} y={68} width={46} height={18} rx={4} fill={RED.dark} {...ol} />
      {/* arms */}
      <rect x={8} y={36} width={24} height={52} rx={11} fill={RED.base} {...ol} />
      <rect x={68} y={36} width={24} height={52} rx={11} fill={RED.base} {...ol} />
      <Shine d="M15,44 V58" width={4} />
      <Shine d="M75,44 V58" width={4} />
    </g>
  );
}

/** Blue sofa; 1 cell = loveseat, 2 cells = full sofa (back along the top / right). */
export function Sofa({ w, h }: SpriteProps): JSX.Element {
  return (
    <g>
      <FootShadow x={8} y={10} w={w - 16} h={h - 18} rx={18} />
      <Oriented w={w} h={h}>
        {(L) => {
          const n = L >= 200 ? 2 : 1;
          const cw = (L - 56) / n;
          return (
            <g>
              <rect x={8} y={9} width={L - 16} height={42} rx={18} fill={BLUE.base} {...ol} />
              <Shine d={`M26,19 H${L - 26}`} width={4} opacity={0.35} />
              {Array.from({ length: n }, (_, i) => (
                <g key={i}>
                  <rect x={28 + i * cw} y={40} width={cw} height={34} rx={9} fill={BLUE.light} {...ol} />
                  <Shine d={`M${36 + i * cw},48 H${28 + i * cw + cw * 0.55}`} width={3.5} opacity={0.5} />
                </g>
              ))}
              <rect x={28} y={70} width={L - 56} height={16} rx={4} fill={BLUE.dark} {...ol} />
              <rect x={7} y={34} width={25} height={55} rx={11} fill={BLUE.base} {...ol} />
              <rect x={L - 32} y={34} width={25} height={55} rx={11} fill={BLUE.base} {...ol} />
              <Shine d="M14,42 V56" width={4} opacity={0.4} />
              <Shine d={`M${L - 25},42 V56`} width={4} opacity={0.4} />
            </g>
          );
        }}
      </Oriented>
    </g>
  );
}

/** Patterned red rug with cream border, diamonds and fringe. */
export function Rug({ w, h }: SpriteProps): JSX.Element {
  const cream = '#f4dcb0';
  return (
    <g>
      <FootShadow x={10} y={14} w={w - 20} h={h - 26} rx={6} dy={3} />
      <Oriented w={w} h={h}>
        {(L) => {
          const n = Math.max(1, Math.round(L / 100));
          return (
            <g>
              {/* fringe */}
              {[22, 32, 42, 52, 62, 72, 80].map((y) => (
                <g key={y}>
                  <path d={`M4,${y} H12`} stroke={cream} strokeWidth={2.4} strokeLinecap="round" />
                  <path d={`M${L - 12},${y} H${L - 4}`} stroke={cream} strokeWidth={2.4} strokeLinecap="round" />
                </g>
              ))}
              <rect x={10} y={14} width={L - 20} height={72} rx={6} fill={RED.base} {...ol} />
              <rect x={17} y={21} width={L - 34} height={58} rx={3} fill="none" stroke={cream} strokeWidth={3} />
              <rect x={22} y={26} width={L - 44} height={48} rx={2} fill={RED.dark} opacity={0.55} />
              {Array.from({ length: n }, (_, i) => {
                const cx = (L / n) * (i + 0.5);
                return (
                  <g key={i}>
                    <path d={`M${cx},33 L${cx + 17},50 L${cx},67 L${cx - 17},50 Z`} fill={cream} {...thin} />
                    <path d={`M${cx},42 L${cx + 8},50 L${cx},58 L${cx - 8},50 Z`} fill={RED.base} />
                    <circle cx={cx - 27} cy={50} r={2.6} fill={cream} />
                    <circle cx={cx + 27} cy={50} r={2.6} fill={cream} />
                  </g>
                );
              })}
            </g>
          );
        }}
      </Oriented>
    </g>
  );
}

/** Top-down bed: headboard at the left (or top-right when vertical). */
export function Bed({ w, h }: SpriteProps): JSX.Element {
  const blanket = tone('#e8746a');
  return (
    <g>
      <FootShadow x={8} y={8} w={w - 16} h={h - 16} rx={10} />
      <Oriented w={w} h={h}>
        {(L) => {
          const long = L >= 200;
          const bx = long ? 68 : 52;
          return (
            <g>
              <rect x={8} y={9} width={L - 16} height={82} rx={9} fill={WOOD.base} {...ol} />
              <rect x={17} y={16} width={L - 32} height={68} rx={8} fill="#f6f1e7" {...thin} />
              <rect x={23} y={long ? 22 : 24} width={long ? 34 : 24} height={long ? 56 : 52} rx={11} fill="#ffffff" {...thin} />
              <path
                d={long ? 'M30,34 Q38,30 46,34' : 'M28,34 Q34,30 40,34'}
                stroke="#d8d0c2"
                strokeWidth={2.4}
                fill="none"
                strokeLinecap="round"
              />
              <rect x={bx} y={13} width={L - bx - 13} height={74} rx={9} fill={blanket.base} {...ol} />
              <rect x={bx} y={13} width={14} height={74} rx={6} fill={blanket.light} {...thin} />
              {long &&
                [112, 142, 170].map((x) => (
                  <path key={x} d={`M${x},22 V78`} stroke={blanket.dark} strokeWidth={3} strokeDasharray="7 7" strokeLinecap="round" />
                ))}
              <Shine d={`M${bx + 22},21 H${Math.min(L - 26, bx + 60)}`} width={4} opacity={0.4} />
              <rect x={4} y={6} width={13} height={88} rx={6} fill={WOOD.dark} {...ol} />
            </g>
          );
        }}
      </Oriented>
    </g>
  );
}

/** Round stool with a cushion. */
export function Stool(_: SpriteProps): JSX.Element {
  const seat = tone('#e0a23b');
  return (
    <g>
      <GroundShadow cx={50} cy={89} rx={28} ry={6} />
      <OLine d="M34,52 L26,88" color={WOOD.dark} width={6} />
      <OLine d="M66,52 L74,88" color={WOOD.dark} width={6} />
      <OLine d="M50,56 L50,90" color={WOOD.dark} width={6} />
      <OLine d="M30,74 H70" color={WOOD.base} width={4} />
      <ellipse cx={50} cy={50} rx={31} ry={17} fill={WOOD.dark} {...ol} />
      <ellipse cx={50} cy={43} rx={31} ry={17} fill={seat.base} {...ol} />
      <Shine d="M34,38 Q42,33 54,33" width={4} />
    </g>
  );
}

/** Plank bench without a back. */
export function Bench({ w, h }: SpriteProps): JSX.Element {
  return (
    <g>
      <FootShadow x={10} y={30} w={w - 20} h={h - 42} rx={8} dy={8} />
      <Oriented w={w} h={h}>
        {(L) => (
          <g>
            <rect x={18} y={56} width={11} height={32} rx={4} fill={WOOD.deep} {...ol} />
            <rect x={L - 29} y={56} width={11} height={32} rx={4} fill={WOOD.deep} {...ol} />
            <rect x={8} y={30} width={L - 16} height={34} rx={7} fill={WOOD.base} {...ol} />
            <path d={`M12,47 H${L - 12}`} stroke={WOOD.dark} strokeWidth={2.6} strokeLinecap="round" />
            <rect x={8} y={60} width={L - 16} height={11} rx={5} fill={WOOD.dark} {...ol} />
            <Shine d={`M20,37 H${L * 0.55}`} width={3.5} />
            {[22, L - 22].map((x) => (
              <g key={x}>
                <circle cx={x} cy={38} r={2} fill={INK} />
                <circle cx={x} cy={55} r={2} fill={INK} />
              </g>
            ))}
          </g>
        )}
      </Oriented>
    </g>
  );
}

/** White tub, top-down, with water and bubbles. */
export function Bathtub({ w, h }: SpriteProps): JSX.Element {
  const water = '#8fd3f0';
  return (
    <g>
      <FootShadow x={8} y={12} w={w - 16} h={h - 22} rx={32} />
      <Oriented w={w} h={h}>
        {(L) => (
          <g>
            <rect x={8} y={11} width={L - 16} height={78} rx={34} fill="#f4f7f9" {...ol} />
            <rect x={18} y={21} width={L - 36} height={58} rx={26} fill={water} {...thin} />
            <path d={`M30,36 Q${L / 2},28 ${L - 30},36`} stroke={mix(water, '#ffffff', 0.55)} strokeWidth={4} fill="none" strokeLinecap="round" />
            {(
              [
                [0.3, 58, 5],
                [0.38, 66, 3.5],
                [0.62, 56, 4],
                [0.7, 64, 6],
              ] as const
            ).map(([fx, cy, r]) => (
              <circle key={fx} cx={L * fx} cy={cy} r={r} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
            ))}
            <rect x={L - 24} y={42} width={12} height={16} rx={4} fill="#b9c4cc" {...thin} />
            <circle cx={L - 18} cy={50} r={3} fill="#e9eef1" />
            <Shine d={`M30,16 H${L * 0.45}`} width={3.5} opacity={0.9} />
          </g>
        )}
      </Oriented>
    </g>
  );
}
