import type { JSX } from 'react';
import { FootShadow, INK, Shine, lcg, mix, ol, thin, tone, type SpriteProps } from './common';

const WOOD = tone('#c98a4b');
const DARKWOOD = tone('#a2643a');

/** Wooden table (any footprint) with a little something on top. */
export function Table({ w, h }: SpriteProps): JSX.Element {
  const topH = h - 44;
  return (
    <g>
      <FootShadow x={10} y={14} w={w - 20} h={h - 22} rx={10} />
      {/* legs */}
      {[14, w - 26].map((x) => (
        <rect key={x} x={x} y={h - 36} width={12} height={26} rx={4} fill={WOOD.deep} {...ol} />
      ))}
      <rect x={7} y={h - 40} width={w - 14} height={13} rx={5} fill={WOOD.dark} {...ol} />
      <rect x={7} y={10} width={w - 14} height={topH} rx={11} fill={WOOD.base} {...ol} />
      {/* grain */}
      <path d={`M18,${10 + topH * 0.38} H${w * 0.42}`} stroke={WOOD.dark} strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M${w * 0.5},${10 + topH * 0.7} H${w - 22}`} stroke={WOOD.dark} strokeWidth={2.4} strokeLinecap="round" />
      <Shine d={`M18,18 H${w * 0.42}`} width={4} />
      {/* items */}
      {w >= 200 ? (
        <g>
          <ellipse cx={w / 2} cy={10 + topH / 2} rx={22} ry={13} fill="#f3efe6" {...thin} />
          <circle cx={w / 2 - 8} cy={10 + topH / 2 - 2} r={6} fill="#e5493a" stroke={INK} strokeWidth={2} />
          <circle cx={w / 2 + 6} cy={10 + topH / 2 - 3} r={6} fill="#8cc152" stroke={INK} strokeWidth={2} />
          <circle cx={w / 2} cy={10 + topH / 2 + 4} r={6} fill="#f6bb42" stroke={INK} strokeWidth={2} />
        </g>
      ) : h >= 200 ? (
        <g>
          <rect x={30} y={40} width={40} height={30} rx={3} fill="#fbf7ef" {...thin} transform="rotate(-8 50 55)" />
          <ellipse cx={50} cy={120} rx={14} ry={10} fill="#f3efe6" {...thin} />
          <circle cx={50} cy={118} r={5.5} fill="#e5493a" stroke={INK} strokeWidth={2} />
        </g>
      ) : (
        <g>
          <ellipse cx={62} cy={10 + topH / 2 + 2} rx={10} ry={7} fill="#f3efe6" {...thin} />
          <ellipse cx={62} cy={10 + topH / 2} rx={5} ry={3} fill="#7a4a2a" />
        </g>
      )}
    </g>
  );
}

/** Writing desk with drawers, papers and a pencil. */
export function Desk({ w, h }: SpriteProps): JSX.Element {
  const topH = Math.max(30, h * 0.34);
  const frontY = 8 + topH;
  const frontH = h - frontY - 12;
  const drawers = Math.max(1, Math.round(w / 100));
  return (
    <g>
      <FootShadow x={10} y={10} w={w - 20} h={h - 18} rx={8} />
      <rect x={7} y={8} width={w - 14} height={topH + 4} rx={7} fill={DARKWOOD.base} {...ol} />
      <Shine d={`M16,15 H${w * 0.36}`} width={3.5} />
      {/* papers */}
      <rect x={w * 0.52} y={13} width={26} height={topH - 6} rx={2} fill="#fbf7ef" {...thin} transform={`rotate(-7 ${w * 0.52 + 13} ${13 + topH / 2})`} />
      <path d={`M${w * 0.52 + 6},${20} H${w * 0.52 + 18}`} stroke="#9aa3ad" strokeWidth={2} />
      <path d={`M${w * 0.24},${10 + topH * 0.55} L${w * 0.24 + 22},${10 + topH * 0.35}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${w * 0.24},${10 + topH * 0.55} L${w * 0.24 + 22},${10 + topH * 0.35}`} stroke="#f6bb42" strokeWidth={3} strokeLinecap="round" />
      {/* front */}
      <rect x={7} y={frontY} width={w - 14} height={frontH} rx={5} fill={DARKWOOD.dark} {...ol} />
      {Array.from({ length: drawers }, (_, i) => {
        const dw = (w - 14) / drawers;
        const x = 7 + i * dw;
        return (
          <g key={i}>
            <rect x={x + 8} y={frontY + 7} width={dw - 16} height={frontH - 14} rx={4} fill={DARKWOOD.base} {...thin} />
            <rect x={x + dw / 2 - 8} y={frontY + frontH / 2 - 3} width={16} height={6} rx={3} fill="#e8c76a" stroke={INK} strokeWidth={2} />
          </g>
        );
      })}
      <rect x={10} y={h - 13} width={9} height={8} rx={2} fill={INK} />
      <rect x={w - 19} y={h - 13} width={9} height={8} rx={2} fill={INK} />
    </g>
  );
}

/** Kitchen counter: worktop + cupboards; a sink when long. */
export function Counter({ w, h }: SpriteProps): JSX.Element {
  const base = tone('#7fb8a4');
  const top = '#efe7d6';
  const topH = Math.max(32, h * 0.36);
  const doors = Math.max(1, Math.round(w / 50));
  const dw = (w - 18) / doors;
  return (
    <g>
      <FootShadow x={8} y={10} w={w - 16} h={h - 18} rx={6} />
      <rect x={9} y={8 + topH} width={w - 18} height={h - topH - 16} rx={4} fill={base.base} {...ol} />
      {Array.from({ length: doors }, (_, i) => (
        <g key={i}>
          <rect x={9 + i * dw + 5} y={14 + topH} width={dw - 10} height={h - topH - 28} rx={3} fill={base.light} {...thin} />
          <rect x={9 + i * dw + dw / 2 - 2.5} y={20 + topH} width={5} height={12} rx={2.5} fill="#56606a" />
        </g>
      ))}
      <rect x={5} y={6} width={w - 10} height={topH + 4} rx={6} fill={top} {...ol} />
      <Shine d={`M14,13 H${w * 0.4}`} width={3.5} opacity={0.9} />
      {w >= 200 || h >= 200 ? (
        <g>
          <rect x={w / 2 - 26} y={13} width={52} height={topH - 10} rx={8} fill="#b9c4cc" {...thin} />
          <rect x={w / 2 - 20} y={17} width={40} height={topH - 18} rx={6} fill="#8fb3c4" />
          <path d={`M${w / 2},11 V18`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d={`M${w / 2},11 V18`} stroke="#d9e1e6" strokeWidth={2.4} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <rect x={22} y={14} width={34} height={topH - 12} rx={5} fill="#d9a066" {...thin} />
          <circle cx={70} cy={10 + topH / 2} r={8} fill="#e5493a" stroke={INK} strokeWidth={2.4} />
          <path d={`M70,${2 + topH / 2} q3,-4 6,-3`} stroke="#4f8a3c" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/** Upright piano, front view. */
export function Piano({ w, h }: SpriteProps): JSX.Element {
  const body = tone('#3a3240');
  const kbY = h * 0.5;
  const kbH = Math.min(18, h * 0.16);
  const whites = Math.floor((w - 28) / 9);
  return (
    <g>
      <FootShadow x={10} y={10} w={w - 20} h={h - 18} rx={8} />
      <rect x={10} y={8} width={w - 20} height={h - 20} rx={8} fill={body.base} {...ol} />
      <rect x={18} y={16} width={w - 36} height={kbY - 26} rx={5} fill={body.light} opacity={0.35} />
      <Shine d={`M20,16 H${w * 0.4}`} width={3.5} opacity={0.35} />
      {/* music sheet */}
      <rect x={w / 2 - 14} y={18} width={28} height={Math.min(26, kbY - 30)} rx={2} fill="#fbf7ef" {...thin} />
      <path d={`M${w / 2 - 8},26 H${w / 2 + 8} M${w / 2 - 8},32 H${w / 2 + 4}`} stroke="#9aa3ad" strokeWidth={2} />
      {/* keyboard */}
      <rect x={6} y={kbY} width={w - 12} height={kbH} rx={3} fill="#fbfaf6" {...thin} />
      {Array.from({ length: whites - 1 }, (_, i) => {
        const x = 14 + (i + 1) * 9;
        const black = i % 7 !== 2 && i % 7 !== 6;
        return (
          <g key={i}>
            <path d={`M${x},${kbY + 2} V${kbY + kbH - 1}`} stroke="#c9c3b8" strokeWidth={1.4} />
            {black && <rect x={x - 2.6} y={kbY + 1} width={5.2} height={kbH * 0.58} rx={1} fill={INK} />}
          </g>
        );
      })}
      <rect x={6} y={kbY + kbH} width={w - 12} height={8} rx={3} fill={body.dark} {...thin} />
      {/* legs + pedals */}
      <rect x={16} y={h - 18} width={10} height={10} rx={2} fill={body.deep} {...thin} />
      <rect x={w - 26} y={h - 18} width={10} height={10} rx={2} fill={body.deep} {...thin} />
      <path d={`M${w / 2 - 6},${h - 15} h4 M${w / 2 + 2},${h - 15} h4`} stroke="#e8c76a" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

const BOOK_COLORS = ['#e5493a', '#4f86c6', '#f6bb42', '#8cc152', '#a07cc5', '#e98b3a', '#3fb6a8', '#f0e3c4'];

/** Bookshelf front view with deterministic book spines. */
export function Bookshelf({ w, h }: SpriteProps): JSX.Element {
  const shelves = h >= 200 ? 5 : 3;
  const innerTop = 14;
  const innerBot = h - 12;
  const sh = (innerBot - innerTop) / shelves;
  const rnd = lcg(w * 7 + h * 13);
  return (
    <g>
      <FootShadow x={10} y={6} w={w - 20} h={h - 12} rx={6} />
      <rect x={10} y={5} width={w - 20} height={h - 12} rx={6} fill={DARKWOOD.base} {...ol} />
      <rect x={17} y={innerTop} width={w - 34} height={innerBot - innerTop - 2} rx={2} fill={DARKWOOD.deep} />
      {Array.from({ length: shelves }, (_, s) => {
        const y0 = innerTop + s * sh;
        const books: JSX.Element[] = [];
        let x = 19;
        let i = 0;
        while (x < w - 24) {
          const bw = 5 + Math.floor(rnd() * 5);
          if (x + bw > w - 19) break;
          const bh = sh - 6 - Math.floor(rnd() * Math.min(8, sh * 0.35));
          const gap = rnd() < 0.12;
          if (!gap) {
            const col = BOOK_COLORS[Math.floor(rnd() * BOOK_COLORS.length)] ?? BOOK_COLORS[0];
            books.push(
              <g key={i}>
                <rect x={x} y={y0 + sh - 3 - bh} width={bw} height={bh} rx={1} fill={col} stroke={INK} strokeWidth={1.6} />
                <path d={`M${x + 1},${y0 + sh - 3 - bh * 0.7} h${bw - 2}`} stroke={mix(col, '#ffffff', 0.5)} strokeWidth={1.4} />
              </g>,
            );
          }
          x += bw + (gap ? 6 : 0.6);
          i++;
        }
        return (
          <g key={s}>
            {books}
            <rect x={14} y={y0 + sh - 4} width={w - 28} height={5} rx={1.5} fill={DARKWOOD.base} stroke={INK} strokeWidth={2} />
          </g>
        );
      })}
      <Shine d={`M15,10 H${w * 0.4}`} width={3} opacity={0.35} />
    </g>
  );
}

/** Brick fireplace with a crackling fire. */
export function Fireplace({ w, h }: SpriteProps): JSX.Element {
  const brick = tone('#c0674a');
  const openX = 26;
  const openW = w - 52;
  const openTop = Math.max(40, h - 62);
  const fx = w / 2;
  const fb = h - 14;
  return (
    <g>
      <FootShadow x={8} y={14} w={w - 16} h={h - 20} rx={4} />
      <rect x={10} y={16} width={w - 20} height={h - 24} rx={3} fill={brick.base} {...ol} />
      {/* bricks */}
      {Array.from({ length: Math.floor((h - 30) / 12) }, (_, r) => (
        <path key={r} d={`M13,${28 + r * 12} H${w - 13}`} stroke={brick.dark} strokeWidth={1.6} opacity={0.7} />
      ))}
      {Array.from({ length: Math.floor((h - 30) / 12) }, (_, r) =>
        Array.from({ length: Math.ceil(w / 22) }, (_, c) => {
          const x = 16 + c * 22 + (r % 2 ? 11 : 0);
          if (x > w - 16) return null;
          return <path key={`${r}-${c}`} d={`M${x},${16 + r * 12 + 1} v11`} stroke={brick.dark} strokeWidth={1.6} opacity={0.7} />;
        }),
      )}
      {/* opening */}
      <path
        d={`M${openX},${fb + 4} V${openTop + 14} Q${openX},${openTop} ${openX + 14},${openTop} H${openX + openW - 14} Q${openX + openW},${openTop} ${openX + openW},${openTop + 14} V${fb + 4} Z`}
        fill="#3b2b25"
        {...ol}
      />
      {/* logs */}
      <rect x={fx - 18} y={fb - 7} width={36} height={8} rx={4} fill="#7a4a2a" stroke={INK} strokeWidth={2} />
      {/* flames */}
      <path d={`M${fx - 14},${fb - 4} Q${fx - 18},${fb - 22} ${fx - 6},${fb - 34} Q${fx - 6},${fb - 22} ${fx},${fb - 24} Q${fx + 2},${fb - 36} ${fx + 10},${fb - 40} Q${fx + 8},${fb - 26} ${fx + 16},${fb - 18} Q${fx + 18},${fb - 8} ${fx + 14},${fb - 4} Z`} fill="#f5793b" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d={`M${fx - 7},${fb - 5} Q${fx - 8},${fb - 16} ${fx - 1},${fb - 22} Q${fx + 1},${fb - 14} ${fx + 6},${fb - 18} Q${fx + 9},${fb - 10} ${fx + 7},${fb - 5} Z`} fill="#ffd25e" />
      {/* mantel */}
      <rect x={4} y={9} width={w - 8} height={13} rx={4} fill={WOOD.base} {...ol} />
      <Shine d={`M12,13 H${w * 0.4}`} width={3} />
    </g>
  );
}

/** Two-door wooden cabinet. */
export function Cabinet({ w, h }: SpriteProps): JSX.Element {
  const body = tone('#b9774a');
  const doors = Math.max(2, Math.round(w / 50));
  const dw = (w - 36) / doors;
  return (
    <g>
      <FootShadow x={12} y={10} w={w - 24} h={h - 16} rx={6} />
      <rect x={14} y={h - 14} width={9} height={9} rx={2} fill={INK} />
      <rect x={w - 23} y={h - 14} width={9} height={9} rx={2} fill={INK} />
      <rect x={12} y={14} width={w - 24} height={h - 26} rx={6} fill={body.base} {...ol} />
      {Array.from({ length: doors }, (_, i) => (
        <g key={i}>
          <rect x={18 + i * dw} y={22} width={dw} height={h - 42} rx={3} fill={body.light} {...thin} />
          <rect x={18 + i * dw + 6} y={30} width={dw - 12} height={h - 58} rx={2} fill="none" stroke={body.dark} strokeWidth={2} />
          <circle cx={i % 2 === 0 ? 18 + (i + 1) * dw - 6 : 18 + i * dw + 6} cy={h / 2 + 2} r={3.2} fill="#e8c76a" stroke={INK} strokeWidth={1.8} />
        </g>
      ))}
      <rect x={8} y={8} width={w - 16} height={11} rx={4} fill={body.dark} {...ol} />
      {/* vase on top */}
      <path d={`M${w - 34},8 q-6,-6 0,-6 h8 q6,0 0,6 Z`} fill="#4f86c6" stroke={INK} strokeWidth={2} />
    </g>
  );
}

/** Tall retro fridge. */
export function Fridge({ w, h }: SpriteProps): JSX.Element {
  const body = '#e6f0ee';
  const split = 6 + (h - 12) * 0.38;
  return (
    <g>
      <FootShadow x={18} y={6} w={w - 36} h={h - 12} rx={10} />
      <rect x={18} y={5} width={w - 36} height={h - 12} rx={11} fill={body} {...ol} />
      <path d={`M18,${split} H${w - 18}`} stroke={INK} strokeWidth={3} />
      <rect x={w - 32} y={split - 22} width={6} height={14} rx={3} fill="#8a96a0" stroke={INK} strokeWidth={2} />
      <rect x={w - 32} y={split + 8} width={6} height={Math.min(30, h * 0.24)} rx={3} fill="#8a96a0" stroke={INK} strokeWidth={2} />
      <path d={`M${w - 22},16 V${h - 20}`} stroke="#c7d6d3" strokeWidth={4} strokeLinecap="round" />
      {/* magnets + note */}
      <rect x={34} y={split + 12} width={16} height={18} rx={1.5} fill="#fff6c2" stroke={INK} strokeWidth={1.6} transform={`rotate(-6 42 ${split + 21})`} />
      <circle cx={42} cy={split + 12} r={3} fill="#e5493a" stroke={INK} strokeWidth={1.4} />
      <circle cx={40} cy={split - 14} r={3.4} fill="#4f86c6" stroke={INK} strokeWidth={1.4} />
      <rect x={24} y={h - 9} width={8} height={5} rx={1} fill={INK} />
      <rect x={w - 32} y={h - 9} width={8} height={5} rx={1} fill={INK} />
    </g>
  );
}
