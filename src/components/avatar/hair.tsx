import type { ReactNode } from 'react';
import type { HairStyle } from '../../data/types';
import type { AvatarPalette } from './palette';

/**
 * Hair is split in two layers:
 *  - back:  drawn BEHIND the head (long hair, buns, ponytails, afro volume, braids)
 *  - front: drawn OVER the head (caps, fringes, highlights)
 * Head geometry (viewBox 100): face spans x 31..69, top y≈23, chin y≈68, eyes y 47.5.
 */
export interface HairLayers {
  back: ReactNode;
  front: ReactNode;
}

interface HairOpts {
  /** Something sits on top of the head (hat/cap/beret/hood/headscarf): suppress tall volumes. */
  covered: boolean;
}

const ring = (n: number, cx: number, cy: number, rx: number, ry: number, from: number, to: number) => {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

export function renderHair(style: HairStyle, p: AvatarPalette, opts: HairOpts): HairLayers {
  const base = { fill: p.hair, stroke: p.hairLine, strokeWidth: 1, strokeLinejoin: 'round' as const };
  const shine = { fill: 'none', stroke: p.hairLight, strokeLinecap: 'round' as const };
  const strand = { fill: 'none', stroke: p.hairShadow, strokeLinecap: 'round' as const, strokeWidth: 0.7 };

  switch (style) {
    case 'short':
      return {
        back: null,
        front: (
          <g>
            <path {...base} d="M29.5,46 C28,30 37,19.5 50,19.5 C63,19.5 72,30 70.5,46 C69.5,41 68,37.5 66,35 C60,37 53.5,35.6 49,33 C45,36 38.5,37 34,35.5 C32,38 30.5,42 29.5,46 Z" />
            <path {...strand} d="M49,33 C48,28 50,24 55,22" />
            <path {...shine} strokeWidth={1.2} opacity={0.55} d="M38,26 C42,22.5 47,21.5 51,21.8" />
          </g>
        ),
      };

    case 'long':
      return {
        back: (
          <g>
            <path {...base} d="M27,44 C26,25 37,16.5 50,16.5 C63,16.5 74,25 73,44 C73,58 75.5,72 78.5,86 C68,90.5 32,90.5 21.5,86 C24.5,72 27,58 27,44 Z" />
            <path {...strand} d="M27.5,60 C27,70 25.5,78 24,85 M72.5,60 C73,70 74.5,78 76,85" />
          </g>
        ),
        front: (
          <g>
            <path {...base} d="M29.5,50 C28,28 38,19 50,19 C62,19 72,28 70.5,50 C69,41 65,34 57,31.5 C55,33 52.5,34 50,33.6 C46,35.2 37.5,37 33.5,42 C31.5,44.5 30.3,47 29.5,50 Z" />
            <path {...base} d="M29.6,46 C29.2,56 30,64 33,71 L36.2,70 C33.6,62 33,54 33.4,45 Z" />
            <path {...base} d="M70.4,46 C70.8,56 70,64 67,71 L63.8,70 C66.4,62 67,54 66.6,45 Z" />
            <path {...strand} d="M57,31.5 C55,26 53,23 50,21" />
            <path {...shine} strokeWidth={1.2} opacity={0.5} d="M36,28 C40,23.5 45,21.6 50,21.4" />
          </g>
        ),
      };

    case 'bun':
      return {
        back: opts.covered ? null : (
          <g>
            <circle {...base} cx={50} cy={16.5} r={8.5} />
            <path {...strand} d="M44,15 C46,11 53,10.5 56,14 M45.5,19.5 C49,21.5 53,20.5 55.5,18" />
            <path {...shine} strokeWidth={1} opacity={0.5} d="M45,12.5 C47,10.5 50,10 52,10.4" />
          </g>
        ),
        front: (
          <g>
            <path {...base} d="M30.5,44 C30,29 38.5,21 50,21 C61.5,21 70,29 69.5,44 C68,37 64,33 58,31.4 C55,30.8 52.5,30.6 50,30.6 C47.5,30.6 45,30.8 42,31.4 C36,33 32,37 30.5,44 Z" />
            <path {...strand} d="M38,32.5 C40,27 44,23.5 49,22 M62,32.5 C60,27 56,23.5 51,22 M50,30.6 L50,22" />
            <path {...shine} strokeWidth={1.1} opacity={0.5} d="M35,32 C37,27 41,24 45,22.8" />
          </g>
        ),
      };

    case 'bald':
      return {
        back: null,
        front: (
          <g>
            <path {...base} d="M30,49 C29.4,43 30.6,38.5 33.4,35.6 C33,40 33.4,44.5 34.2,49 Z" />
            <path {...base} d="M70,49 C70.6,43 69.4,38.5 66.6,35.6 C67,40 66.6,44.5 65.8,49 Z" />
            <ellipse cx={42.5} cy={29} rx={5.5} ry={2.4} fill="#ffffff" opacity={0.22} transform="rotate(-22 42.5 29)" />
          </g>
        ),
      };

    case 'curly': {
      const back = ring(11, 50, 40, 21.5, 19.5, 160, 380);
      const fringe = ring(7, 50, 37.5, 17, 5.5, 195, 345);
      return {
        back: (
          <g>
            <ellipse cx={50} cy={39} rx={22} ry={19} fill={p.hair} />
            {back.map(([x, y], i) => (
              <circle key={i} {...base} cx={r1(x)} cy={r1(y)} r={i % 2 ? 6.4 : 7} />
            ))}
          </g>
        ),
        front: (
          <g>
            <path fill={p.hair} d="M30,44 C29,28 38,20 50,20 C62,20 71,28 70,44 C66,36 60,33 50,33 C40,33 34,36 30,44 Z" />
            {fringe.map(([x, y], i) => (
              <circle key={i} {...base} cx={r1(x)} cy={r1(y)} r={4.4} />
            ))}
            {ring(5, 50, 30, 11, 6, 200, 340).map(([x, y], i) => (
              <path key={i} {...shine} strokeWidth={0.9} opacity={0.55} d={`M${r1(x - 2)},${r1(y)} a2.2,2.2 0 0 1 3.6,-1.2`} />
            ))}
          </g>
        ),
      };
    }

    case 'bob':
      return {
        back: (
          <path {...base} d="M27.5,44 C26.5,26 37,17.5 50,17.5 C63,17.5 73.5,26 72.5,44 L73.6,63 C73.6,65 72.2,66.2 70.2,66.2 L29.8,66.2 C27.8,66.2 26.4,65 26.4,63 Z" />
        ),
        front: (
          <g>
            <path {...base} d="M29.8,46 C29,26 39,19 50,19 C61,19 71,26 70.2,46 C69.6,42 69.2,39 68.5,37.5 C62,36 38,36 31.5,37.5 C30.8,39 30.4,42 29.8,46 Z" />
            <path {...base} d="M29.8,40 C29.4,50 29.8,58 30.4,65.6 L35.2,65.6 C33.6,58 33,50 33.6,40 Z" />
            <path {...base} d="M70.2,40 C70.6,50 70.2,58 69.6,65.6 L64.8,65.6 C66.4,58 67,50 66.4,40 Z" />
            <path {...strand} d="M40,36.6 L40.6,31 M46,36.3 L46.3,30 M54,36.3 L53.7,30 M60,36.6 L59.4,31" />
            <path {...shine} strokeWidth={1.2} opacity={0.5} d="M36,27 C41,22.5 46,21.4 51,21.4" />
          </g>
        ),
      };

    case 'ponytail':
      return {
        back: (
          <g>
            <path {...base} d="M61,23 C74,19.5 81,31 78,46 C76,56 80.5,64 77,74 C71.5,66 70,57 70.5,47 C71,38 68.5,30 61,28 Z" />
            <path {...strand} d="M70,30 C74,38 73,50 74.5,62" />
            <ellipse cx={66} cy={25.5} rx={2.6} ry={3.4} fill={p.accent} stroke={p.accentShadow} strokeWidth={0.8} transform="rotate(-30 66 25.5)" />
          </g>
        ),
        front: (
          <g>
            <path {...base} d="M30.5,44 C30,29 38.5,21 50,21 C61.5,21 70,29 69.5,44 C68,37 64,33 58,31.4 C55,30.8 52.5,30.6 50,30.6 C47.5,30.6 45,30.8 42,31.4 C36,33 32,37 30.5,44 Z" />
            <path {...strand} d="M40,32 C44,26 52,22.5 62,23.5 M46,30.8 C52,26 58,24.5 64,25.5" />
            <path {...shine} strokeWidth={1.1} opacity={0.5} d="M35,32 C37,27 41,24 45,22.8" />
          </g>
        ),
      };

    case 'afro': {
      const puffs = ring(13, 50, 37, 26, 22, 150, 390);
      return {
        back: (
          <g>
            <ellipse cx={50} cy={37} rx={27} ry={23} fill={p.hair} />
            {puffs.map(([x, y], i) => (
              <circle key={i} {...base} cx={r1(x)} cy={r1(y)} r={i % 2 ? 7.6 : 8.4} />
            ))}
            <ellipse cx={50} cy={37} rx={25} ry={21} fill={p.hair} />
            {ring(6, 50, 26, 16, 9, 200, 340).map(([x, y], i) => (
              <path key={i} {...strand} d={`M${r1(x - 2.4)},${r1(y + 0.8)} a2.6,2.6 0 0 1 4.6,-1.2`} />
            ))}
            <path {...shine} strokeWidth={1.2} opacity={0.45} d="M34,22 C38,16.5 44,14.5 50,14.4" />
          </g>
        ),
        front: (
          <path {...base} d="M30.5,45 C30.5,31 39,24.5 50,24.5 C61,24.5 69.5,31 69.5,45 C66.5,37.5 60,34.3 50,34.3 C40,34.3 33.5,37.5 30.5,45 Z" />
        ),
      };
    }

    case 'slick':
      return {
        back: null,
        front: (
          <g>
            <path {...base} d="M30,44 C29,27 38.5,19 50,19 C62,19 71,27 70,42 C69,36 66,32 61,30.4 C54,28.4 46,30 40,32.5 C35,34.5 32,39 30,44 Z" />
            <path {...strand} strokeWidth={0.8} d="M40,32.5 C43,26.5 47.5,23 53,21.2" />
            <path {...shine} strokeWidth={1.4} opacity={0.75} d="M37,28.5 C43,22.5 52,21 62,23.8" />
            <path {...shine} strokeWidth={0.9} opacity={0.5} d="M43,30.4 C50,26.5 57,26 65,28.6" />
          </g>
        ),
      };

    case 'mohawk':
      return {
        back: null,
        front: (
          <g>
            <path fill={p.hair} opacity={0.38} d="M31,44 C31,29 39,22.5 50,22.5 C61,22.5 69,29 69,44 C66,37 60,34 50,34 C40,34 34,37 31,44 Z" />
            {!opts.covered && (
              <path {...base} d="M44.5,34 C43.6,27 43.6,19 45.6,11 L48.3,15 L50,6.5 L51.7,15 L54.4,11 C56.4,19 56.4,27 55.5,34 C52,32.9 48,32.9 44.5,34 Z" />
            )}
            {!opts.covered && <path {...shine} strokeWidth={1} opacity={0.55} d="M47.5,31 C47,25 47.4,19 48.6,15" />}
          </g>
        ),
      };

    case 'braids': {
      const braid = (x: number, len: number, key: string) => {
        const segs: ReactNode[] = [];
        for (let y = 44, i = 0; y < 44 + len; y += 4.6, i++) {
          segs.push(<ellipse key={i} {...base} cx={x + (i % 2 ? 0.5 : -0.5)} cy={r1(y)} rx={2.5} ry={2.9} />);
        }
        return (
          <g key={key}>
            {segs}
            <circle cx={x} cy={r1(44 + len + 1.2)} r={1.5} fill={p.accent} stroke={p.accentShadow} strokeWidth={0.6} />
          </g>
        );
      };
      return {
        back: (
          <g>
            <path {...base} d="M27,44 C26,26 37,17.5 50,17.5 C63,17.5 74,26 73,44 L73,56 L27,56 Z" />
            {braid(25.6, 38, 'l1')}
            {braid(30.2, 42, 'l2')}
            {braid(69.8, 42, 'r2')}
            {braid(74.4, 38, 'r1')}
          </g>
        ),
        front: (
          <g>
            <path {...base} d="M29.8,45 C29,27 38.5,19 50,19 C61.5,19 71,27 70.2,45 C68.5,37 62,32.5 50,32 C38,32.5 31.5,37 29.8,45 Z" />
            <path {...strand} strokeWidth={0.8} opacity={0.9} d="M37,34.2 Q39.5,26 44,20.6 M43.6,32.6 Q45.4,25 47.6,19.6 M50,32 L50,19.2 M56.4,32.6 Q54.6,25 52.4,19.6 M63,34.2 Q60.5,26 56,20.6" />
            <path {...shine} strokeWidth={0.8} opacity={0.4} d="M40.5,31 Q42,25.5 45.5,21.5 M59.5,31 Q58,25.5 54.5,21.5" />
          </g>
        ),
      };
    }

    case 'buzz':
      return {
        back: null,
        front: (
          <g>
            <path fill={p.hair} opacity={0.78} stroke={p.hairShadow} strokeWidth={0.6} d="M31,43 C31,29 39,22.4 50,22.4 C61,22.4 69,29 69,43 C67,37 62,34.6 50,34.6 C38,34.6 33,37 31,43 Z" />
            <path {...shine} strokeWidth={1} opacity={0.35} d="M38,27.5 C42,24.5 46,23.6 50,23.6" />
          </g>
        ),
      };

    case 'wavy':
      return {
        back: (
          <path {...base} d="M28,46 C27,27 37,18 50,18 C63,18 73,27 72,46 C74,53 71,58 73.5,65 C69.5,68 66,65 64,62.5 L36,62.5 C34,65 30.5,68 26.5,65 C29,58 26,53 28,46 Z" />
        ),
        front: (
          <g>
            <path {...base} d="M29.5,47 C28,27 39,18.5 50,18.5 C62,18.5 72,27 70.5,45 C69,39.5 66.5,35.5 62.5,33.5 C59.5,36.5 55,36 52.5,33 C49,36.5 43.5,36.5 41,33.5 C37.5,35.5 34.5,37 33,40.5 C31.5,42.5 30.2,44.8 29.5,47 Z" />
            <path {...strand} d="M41,33.5 C42,28 45,24 50,22 M52.5,33 C54,28 57,25 61,24" />
            <path {...shine} strokeWidth={1.2} opacity={0.5} d="M35,29 C37,25 40,23 43.5,22 M55,22 C58,22.2 61,23.4 63.5,25.5" />
          </g>
        ),
      };

    case 'pixie':
      return {
        back: null,
        front: (
          <g>
            <path {...base} d="M29.8,45 C28.5,27 38.5,19 50,19 C62,19 71.5,27 70.2,43 C69,38 67,35 64.5,33.5 C58,35.4 52,37.6 43.5,40.4 C45.6,38 46.8,36.4 47.4,34.6 C43,36.6 38.5,37.6 35,36.6 C32.5,39 30.8,42 29.8,45 Z" />
            <path {...base} d="M45,19.8 Q50,15.4 57.6,18.4 Q51.6,18.2 47.6,20.6 Z" />
            <path {...strand} d="M47.4,34.6 C50,30 55,27.5 62,27.5" />
            <path {...shine} strokeWidth={1.1} opacity={0.5} d="M37,27 C41,23 46,21.4 51,21.6" />
          </g>
        ),
      };

    default:
      return { back: null, front: null };
  }
}
