import type { ReactNode } from 'react';
import type { Accessory } from '../../data/types';
import type { AvatarPalette } from './palette';
import { mix, shade } from './color';

/**
 * Accessories render into up to three layers:
 *  - back:  behind everything on the head (hood volume)
 *  - body:  over the shoulders, under the head/beard (ties, collars, scarves, pearls)
 *  - head:  over hair & face (glasses, hats, headphones…)
 */
export interface AccessoryLayers {
  back: ReactNode;
  body: ReactNode;
  head: ReactNode;
}

/** Accessories that sit on top of the head and hide tall hair volume. */
export const HEADWEAR: ReadonlySet<Accessory> = new Set<Accessory>(['hat', 'beret', 'cap', 'headscarf', 'hood']);
/** Accessories that hide the hair entirely (both layers). */
export const HIDES_BACK_HAIR: ReadonlySet<Accessory> = new Set<Accessory>(['headscarf', 'hood']);
/** Accessories that bring their own neckline (shirt etc.) instead of the default coat lapels. */
export const OWN_NECKLINE: ReadonlySet<Accessory> = new Set<Accessory>(['tie', 'bowtie', 'collar']);

function shirtV(p: AvatarPalette): ReactNode {
  const paper = p.paper;
  const line = shade(paper, -0.35);
  return (
    <g>
      <path d="M42.4,77.4 L50,91 L57.6,77.4 Z" fill={paper} />
      <path d="M43,77.4 Q50,79 57,77.4 L50,80.4 Z" fill={p.skinShadow} />
      {/* collar points */}
      <path d="M42.2,76.8 L50,80.4 L46.2,85.4 L40.6,79.4 Z" fill={paper} stroke={line} strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M57.8,76.8 L50,80.4 L53.8,85.4 L59.4,79.4 Z" fill={paper} stroke={line} strokeWidth={0.6} strokeLinejoin="round" />
    </g>
  );
}

function lapels(p: AvatarPalette): ReactNode {
  return (
    <g>
      <path d="M42.4,77.4 L50,91 L46.6,94.5 L37.6,79.6 Z" fill={p.outfitLight} stroke={p.outfitLine} strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M57.6,77.4 L50,91 L53.4,94.5 L62.4,79.6 Z" fill={p.outfitLight} stroke={p.outfitLine} strokeWidth={0.6} strokeLinejoin="round" />
    </g>
  );
}

/** Default coat neckline (V opening with lapels). Exported so Avatar can use it when no accessory overrides it. */
export function defaultNeckline(p: AvatarPalette): ReactNode {
  return (
    <g>
      <path d="M43,77.4 Q50,79.4 57,77.4 L50,88 Z" fill={p.skinShadow} />
      <path d="M44.2,78.6 Q50,80.6 55.8,78.6 L50,85.6 Z" fill={p.paper} opacity={0.9} />
      <path d="M43,77.4 L50,88 L46.4,91.5 L38.4,79.4 Z" fill={p.outfitLight} stroke={p.outfitLine} strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M57,77.4 L50,88 L53.6,91.5 L61.6,79.4 Z" fill={p.outfitLight} stroke={p.outfitLine} strokeWidth={0.6} strokeLinejoin="round" />
    </g>
  );
}

export function renderAccessory(a: Accessory, p: AvatarPalette, o: { cat: boolean }): AccessoryLayers {
  const none: AccessoryLayers = { back: null, body: null, head: null };
  const dark = p.metal;
  const frame = { fill: 'none', stroke: p.ink, strokeWidth: 1.25, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const glare = { fill: 'none', stroke: '#ffffff', strokeWidth: 0.7, strokeLinecap: 'round' as const, opacity: 0.55 };
  // Cats have a shorter neck: shift neck accessories up a little.
  const neck = o.cat ? 'translate(0 -4)' : undefined;

  switch (a) {
    case 'none':
      return none;

    case 'glasses':
      return {
        ...none,
        head: (
          <g>
            <rect {...frame} x={36.3} y={43.6} width={11.4} height={8} rx={2.6} fill="#ffffff" fillOpacity={0.14} />
            <rect {...frame} x={52.3} y={43.6} width={11.4} height={8} rx={2.6} fill="#ffffff" fillOpacity={0.14} />
            <path {...frame} d="M47.7,46.6 Q50,45 52.3,46.6 M36.3,46 L31.2,45.2 M63.7,46 L68.8,45.2" />
            <path {...glare} d="M38,45.6 L40.2,44.8 M54,45.6 L56.2,44.8" />
          </g>
        ),
      };

    case 'roundGlasses': {
      const gold = '#b98a3e';
      return {
        ...none,
        head: (
          <g>
            <circle cx={42} cy={47.5} r={5.3} fill="#ffffff" fillOpacity={0.14} stroke={gold} strokeWidth={1.2} />
            <circle cx={58} cy={47.5} r={5.3} fill="#ffffff" fillOpacity={0.14} stroke={gold} strokeWidth={1.2} />
            <path fill="none" stroke={gold} strokeWidth={1.1} strokeLinecap="round" d="M47.3,46.8 Q50,44.6 52.7,46.8 M36.7,46.6 L31.2,45.4 M63.3,46.6 L68.8,45.4" />
            <path {...glare} d="M38.6,45.2 Q39.8,43.6 41.6,43.3 M54.6,45.2 Q55.8,43.6 57.6,43.3" />
          </g>
        ),
      };
    }

    case 'monocle':
      return {
        ...none,
        head: (
          <g>
            <circle cx={58} cy={47.5} r={5.6} fill="#ffffff" fillOpacity={0.16} stroke={p.brass} strokeWidth={1.4} />
            <circle cx={58} cy={47.5} r={5.6} fill="none" stroke={p.brassDark} strokeWidth={0.4} />
            <path fill="none" stroke={p.brass} strokeWidth={0.7} strokeDasharray="1 0.8" strokeLinecap="round" d="M62.4,51 C66.5,57 66.5,66 61,75" />
            <path {...glare} d="M54.6,45.2 Q55.8,43.6 57.6,43.3" />
          </g>
        ),
      };

    case 'hat': {
      const felt = mix(shade(p.outfit, -0.35), '#2a2530', 0.4);
      return {
        ...none,
        head: (
          <g transform="translate(0 2.6)">
            <path d="M33.4,29 C33.2,20 36.5,11.5 50,11.5 C63.5,11.5 66.8,20 66.6,29 Z" fill={felt} stroke={shade(felt, -0.45)} strokeWidth={1} strokeLinejoin="round" />
            <path d="M43,12.4 Q50,16 57,12.4" fill="none" stroke={shade(felt, -0.45)} strokeWidth={0.8} strokeLinecap="round" />
            <path d="M33.6,23.6 L66.4,23.6 L66.6,29 L33.4,29 Z" fill={p.accent} stroke={shade(felt, -0.45)} strokeWidth={0.6} />
            <ellipse cx={50} cy={29.4} rx={26.5} ry={4.6} fill={felt} stroke={shade(felt, -0.45)} strokeWidth={1} />
            <path d="M28,28.6 Q50,26 72,28.6" fill="none" stroke={shade(felt, 0.25)} strokeWidth={0.7} opacity={0.6} strokeLinecap="round" />
            <path d="M38,22 C37.6,17.5 40,14.2 44,13.4" fill="none" stroke={shade(felt, 0.3)} strokeWidth={1} opacity={0.5} strokeLinecap="round" />
          </g>
        ),
      };
    }

    case 'beret': {
      const c = shade(p.accent, -0.12);
      return {
        ...none,
        head: (
          <g>
            <path d="M28.6,31 C26.4,22 37,14.4 52,14.6 C67,14.8 76.4,21 72.4,28.4 C70,31.6 61,31.4 50,30.6 C40,30 30.6,33.8 28.6,31 Z" fill={c} stroke={shade(c, -0.45)} strokeWidth={1} strokeLinejoin="round" />
            <path d="M51.4,14.8 L52.6,11.6" stroke={shade(c, -0.45)} strokeWidth={1.6} strokeLinecap="round" />
            <path d="M33,24 C38,18.5 46,16.8 54,17.2" fill="none" stroke={shade(c, 0.35)} strokeWidth={1} opacity={0.6} strokeLinecap="round" />
          </g>
        ),
      };
    }

    case 'headphones':
      return {
        ...none,
        head: (
          <g>
            <path d="M28.6,46 C27,22 37,13.6 50,13.6 C63,13.6 73,22 71.4,46" fill="none" stroke={dark} strokeWidth={3} strokeLinecap="round" />
            <path d="M31,30 C34.5,20 42,15.6 50,15.4" fill="none" stroke="#ffffff" strokeWidth={0.7} opacity={0.3} strokeLinecap="round" />
            <rect x={23.6} y={39.6} width={9} height={15.4} rx={3.8} fill={dark} stroke="#15141a" strokeWidth={0.8} />
            <rect x={67.4} y={39.6} width={9} height={15.4} rx={3.8} fill={dark} stroke="#15141a" strokeWidth={0.8} />
            <rect x={25.4} y={42} width={2.4} height={10.6} rx={1.2} fill={p.accent} />
            <rect x={72.2} y={42} width={2.4} height={10.6} rx={1.2} fill={p.accent} />
          </g>
        ),
      };

    case 'headset':
      return {
        ...none,
        head: (
          <g>
            <path d="M30,44 C29,23 38,15.4 50,15.4 C62,15.4 71,23 70,44" fill="none" stroke={dark} strokeWidth={1.7} strokeLinecap="round" />
            <rect x={25.8} y={41} width={7.4} height={12.4} rx={3.2} fill={dark} stroke="#15141a" strokeWidth={0.7} />
            <rect x={67.4} y={43} width={5} height={8.4} rx={2.4} fill={dark} />
            <path d="M29.6,52 C31,58.5 36,61.6 42.6,61.4" fill="none" stroke={dark} strokeWidth={1.2} strokeLinecap="round" />
            <rect x={41.6} y={59.8} width={4} height={3.2} rx={1.5} fill={dark} />
            <circle cx={29.5} cy={47.2} r={1.1} fill={p.accent} />
          </g>
        ),
      };

    case 'scarf': {
      const c = p.accent;
      const line = shade(c, -0.42);
      return {
        ...none,
        body: (
          <g transform={neck}>
            <path d="M35.4,70.6 C41.6,75.6 58.4,75.6 64.6,70.6 L66.4,78.4 C58.4,84 41.6,84 33.6,78.4 Z" fill={c} stroke={line} strokeWidth={0.9} strokeLinejoin="round" />
            <path d="M55.6,78.6 L61.4,97.4 L54.6,98.6 L51.4,80.6 Z" fill={shade(c, -0.08)} stroke={line} strokeWidth={0.9} strokeLinejoin="round" />
            <path d="M40,74.6 L39,80.6 M45,75.8 L44.6,82 M50,76.2 L50,82.6 M55,75.8 L55.4,82 M60,74.6 L61,80.6" stroke={line} strokeWidth={0.5} opacity={0.45} />
            <path d="M53.2,90 L59.6,89 M54.2,94 L60.6,93" stroke={shade(c, 0.4)} strokeWidth={1} strokeLinecap="round" opacity={0.8} />
            <path d="M55,98.6 L55,100 M57,98.4 L57.2,100 M59,98 L59.4,100" stroke={line} strokeWidth={0.6} />
          </g>
        ),
      };
    }

    case 'earring':
      return {
        ...none,
        head: (
          <g>
            <circle cx={31} cy={55.4} r={1.9} fill="none" stroke={p.brass} strokeWidth={1} />
            <circle cx={69} cy={55.4} r={1.9} fill="none" stroke={p.brass} strokeWidth={1} />
            <circle cx={31} cy={53.4} r={0.6} fill="#fff6d8" />
            <circle cx={69} cy={53.4} r={0.6} fill="#fff6d8" />
          </g>
        ),
      };

    case 'bowtie': {
      const c = shade(p.accent, -0.15);
      const line = shade(c, -0.5);
      return {
        ...none,
        body: (
          <g transform={neck}>
            {!o.cat && shirtV(p)}
            {!o.cat && lapels(p)}
            <path d="M50,81 L43.6,77.6 Q42.6,81 43.6,84.4 Z" fill={c} stroke={line} strokeWidth={0.7} strokeLinejoin="round" />
            <path d="M50,81 L56.4,77.6 Q57.4,81 56.4,84.4 Z" fill={c} stroke={line} strokeWidth={0.7} strokeLinejoin="round" />
            <rect x={48.6} y={79.4} width={2.8} height={3.2} rx={0.9} fill={shade(c, -0.15)} stroke={line} strokeWidth={0.6} />
            <path d="M44.8,79.4 L47.4,80.4" stroke={shade(c, 0.35)} strokeWidth={0.6} strokeLinecap="round" opacity={0.7} />
          </g>
        ),
      };
    }

    case 'tie': {
      const c = shade(p.accent, -0.12);
      const line = shade(c, -0.5);
      return {
        ...none,
        body: (
          <g transform={neck}>
            {!o.cat && shirtV(p)}
            <path d="M48,80.2 L52,80.2 L51.2,83.6 L48.8,83.6 Z" fill={shade(c, -0.1)} stroke={line} strokeWidth={0.6} strokeLinejoin="round" />
            <path d="M48.8,83.6 L51.2,83.6 L53.4,96.6 L50,100 L46.6,96.6 Z" fill={c} stroke={line} strokeWidth={0.6} strokeLinejoin="round" />
            <path d="M48,87.6 L52.2,86.4 M47.6,91.6 L52.8,90.2" stroke={shade(c, 0.3)} strokeWidth={0.7} opacity={0.6} />
            {!o.cat && lapels(p)}
          </g>
        ),
      };
    }

    case 'collar':
      if (o.cat) return none; // the cat always wears its own collar
      return {
        ...none,
        body: (
          <g>
            <path d="M42.4,77.4 L50,90 L57.6,77.4 Z" fill={p.skinShadow} />
            <path d="M44,77.6 Q50,80 56,77.6 L50,86 Z" fill={p.skin} opacity={0.6} />
            {lapels(p)}
            <path d="M42.2,76.2 L48,83.6 L43.6,87.6 L37.4,79.2 Z" fill={p.paper} stroke={shade(p.paper, -0.35)} strokeWidth={0.6} strokeLinejoin="round" />
            <path d="M57.8,76.2 L52,83.6 L56.4,87.6 L62.6,79.2 Z" fill={p.paper} stroke={shade(p.paper, -0.35)} strokeWidth={0.6} strokeLinejoin="round" />
          </g>
        ),
      };

    case 'cap': {
      const c = p.accent;
      const line = shade(c, -0.45);
      return {
        ...none,
        head: (
          <g>
            <path d="M29.6,35 C29.6,22 38.6,15 50,15 C61.4,15 70.4,22 70.4,35 Z" fill={c} stroke={line} strokeWidth={1} strokeLinejoin="round" />
            <path d="M50,15 L50,34.6 M40,16.8 Q37.6,25 38.4,34.6 M60,16.8 Q62.4,25 61.6,34.6" fill="none" stroke={line} strokeWidth={0.5} opacity={0.6} />
            <path d="M27,35.2 C34,31.6 66,31.6 73,35.2 C74,38.2 69.6,40 50,39 C30.4,40 26,38.2 27,35.2 Z" fill={shade(c, -0.18)} stroke={line} strokeWidth={1} strokeLinejoin="round" />
            <circle cx={50} cy={15.4} r={1.5} fill={shade(c, -0.2)} stroke={line} strokeWidth={0.5} />
            <path d="M35,26 C37,20.5 42,17.6 47,17" fill="none" stroke={shade(c, 0.4)} strokeWidth={1} opacity={0.55} strokeLinecap="round" />
          </g>
        ),
      };
    }

    case 'bandana': {
      const c = p.accent;
      const line = shade(c, -0.45);
      return {
        ...none,
        head: (
          <g>
            <path d="M30,37.6 C35.6,30.6 64.4,30.6 70,37.6 L70,32.4 C64,25.6 36,25.6 30,32.4 Z" fill={c} stroke={line} strokeWidth={0.9} strokeLinejoin="round" />
            <path d="M69.4,34 L77.4,40.4 L74.2,42 Z" fill={shade(c, -0.1)} stroke={line} strokeWidth={0.8} strokeLinejoin="round" />
            <path d="M69.4,34 L76.6,30.6 L77,34.6 Z" fill={shade(c, -0.1)} stroke={line} strokeWidth={0.8} strokeLinejoin="round" />
            <circle cx={69.6} cy={34.2} r={1.6} fill={c} stroke={line} strokeWidth={0.7} />
            {[36, 42, 48, 54, 60, 65].map((x, i) => (
              <circle key={x} cx={x} cy={i % 2 ? 32.6 : 31} r={0.65} fill="#ffffff" opacity={0.8} />
            ))}
          </g>
        ),
      };
    }

    case 'flower': {
      const petal = mix(p.accent, '#ff8fb5', 0.6);
      const cx = 65.5;
      const cy = 28.5;
      return {
        ...none,
        head: (
          <g>
            <path d="M61,31.8 Q58.4,33.8 57.6,31.4 Q60,30 61,31.8 Z" fill="#6aa760" />
            {[0, 72, 144, 216, 288].map((deg) => {
              const r = (deg * Math.PI) / 180;
              return (
                <circle key={deg} cx={cx + Math.cos(r) * 2.7} cy={cy + Math.sin(r) * 2.7} r={2.6} fill={petal} stroke={shade(petal, -0.35)} strokeWidth={0.5} />
              );
            })}
            <circle cx={cx} cy={cy} r={1.7} fill="#ffd45c" stroke="#c49422" strokeWidth={0.5} />
          </g>
        ),
      };
    }

    case 'goggles': {
      const lens = '#7fd6cf';
      return {
        ...none,
        head: (
          <g>
            <path d="M29.6,33.4 C36,28.6 64,28.6 70.4,33.4" fill="none" stroke={dark} strokeWidth={2.6} strokeLinecap="round" />
            <rect x={47.4} y={29.6} width={5.2} height={2.6} rx={1} fill={p.brassDark} />
            {[42.4, 57.6].map((x) => (
              <g key={x}>
                <circle cx={x} cy={31} r={5.7} fill={p.brass} stroke={p.brassDark} strokeWidth={0.8} />
                <circle cx={x} cy={31} r={4.2} fill={lens} fillOpacity={0.88} stroke={p.brassDark} strokeWidth={0.6} />
                <path d={`M${x - 2.4},${30} Q${x - 1.6},${28.2} ${x + 0.2},${27.8}`} {...glare} opacity={0.8} />
              </g>
            ))}
          </g>
        ),
      };
    }

    case 'pearls': {
      const beads = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = (1 - t) * (1 - t) * 39 + 2 * (1 - t) * t * 50 + t * t * 61;
        const y = (1 - t) * (1 - t) * 77.4 + 2 * (1 - t) * t * 90 + t * t * 77.4;
        beads.push(
          <g key={i}>
            <circle cx={x} cy={y} r={1.4} fill="#f7f2ea" stroke="#c9bba5" strokeWidth={0.4} />
            <circle cx={x - 0.4} cy={y - 0.4} r={0.45} fill="#ffffff" />
          </g>,
        );
      }
      return { ...none, body: <g transform={neck}>{beads}</g> };
    }

    case 'headscarf': {
      const c = mix(p.accent, p.outfit, 0.25);
      const line = shade(c, -0.45);
      return {
        ...none,
        head: (
          <g>
            <path d="M27,48 C25,26 37,15 50,15 C63,15 75,26 73,48 C72,56 69,62 66,66.4 L62.4,66.4 C66,58 67.5,50 67,44 C66,36 60,31 50,31 C40,31 34,36 33,44 C32.5,50 34,58 37.6,66.4 L34,66.4 C31,62 28,56 27,48 Z" fill={c} stroke={line} strokeWidth={1} strokeLinejoin="round" />
            <path d="M37.6,66.4 Q50,72.6 62.4,66.4 L64,70.4 Q50,76.6 36,70.4 Z" fill={shade(c, -0.08)} stroke={line} strokeWidth={0.9} strokeLinejoin="round" />
            <path d="M49,72.6 L45.6,79.6 L49.6,79 Z M51,72.6 L55,79.2 L51.2,79.4 Z" fill={c} stroke={line} strokeWidth={0.8} strokeLinejoin="round" />
            <circle cx={50} cy={72.4} r={2.4} fill={shade(c, -0.1)} stroke={line} strokeWidth={0.8} />
            {[[38, 22], [50, 19], [62, 22], [31.6, 34], [68.4, 34], [30, 46], [70, 46], [44, 25.4], [56, 25.4]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill={shade(c, 0.45)} opacity={0.85} />
            ))}
            <path d="M33,30 C37,22 43,18.4 50,18" fill="none" stroke={shade(c, 0.35)} strokeWidth={1} opacity={0.5} strokeLinecap="round" />
          </g>
        ),
      };
    }

    case 'eyepatch':
      return {
        ...none,
        head: (
          <g>
            <path d="M30.6,39.4 L53,45 M63.2,44.6 L69.6,41.6" stroke="#1e1b22" strokeWidth={1.2} strokeLinecap="round" />
            <path d="M52.4,44.6 C55,41.8 62,41.8 63.6,45 C64.6,49 61.2,52.8 58,52.8 C54.4,52.8 51.4,49 52.4,44.6 Z" fill="#1e1b22" stroke="#0e0c10" strokeWidth={0.7} />
            <path d="M54.6,45 Q57,43.6 60,44" fill="none" stroke="#ffffff" strokeWidth={0.6} opacity={0.25} strokeLinecap="round" />
          </g>
        ),
      };

    case 'hood': {
      const c = p.outfit;
      const line = p.outfitLine;
      return {
        ...none,
        back: <path d="M20,100 L20.6,62 C18.6,32 32,12.4 50,12.4 C68,12.4 81.4,32 79.4,62 L80,100 Z" fill={shade(c, -0.18)} stroke={line} strokeWidth={1} strokeLinejoin="round" />,
        head: (
          <g>
            <path d="M23.4,76 C19.4,48 28.6,16.6 50,16.6 C71.4,16.6 80.6,48 76.6,76 L70.4,76 C73.4,50 66.4,24.2 50,24.2 C33.6,24.2 26.6,50 29.6,76 Z" fill={c} stroke={line} strokeWidth={1} strokeLinejoin="round" />
            <path d="M27.4,60 C25.6,44 30.6,26 44,20.4" fill="none" stroke={p.outfitLight} strokeWidth={1.1} opacity={0.6} strokeLinecap="round" />
          </g>
        ),
      };
    }

    default:
      return none;
  }
}
