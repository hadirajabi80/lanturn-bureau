import { motion, useReducedMotion } from 'framer-motion';
import { memo, useEffect, useId, useMemo, useState, type JSX, type ReactNode } from 'react';
import type { AvatarSpec, Brows, Eyes, Mood, Mouth } from '../../data/types';
import { HEADWEAR, HIDES_BACK_HAIR, OWN_NECKLINE, defaultNeckline, renderAccessory } from './accessories';
import { CAT_HEAD, catBackHead, catBody, catCollar, catFace, catMouth, catNose, catWhiskers } from './cat';
import { mix, shade } from './color';
import {
  MOUTH_X,
  MOUTH_Y,
  OPEN_MOUTHS,
  mouthShape,
  renderBeard,
  renderBrows,
  renderEyes,
  renderMustache,
  renderNose,
  renderWrinkles,
} from './face';
import { renderHair } from './hair';
import { buildPalette } from './palette';

export interface AvatarProps {
  spec: AvatarSpec;
  /** Rendered pixel size (square). Default 96. */
  size?: number;
  /** Overrides brows/mouth (and sometimes eyes) of the spec. 'neutral' = spec defaults. */
  mood?: Mood;
  /** Mouth flaps + gentle head tilt while true. */
  speaking?: boolean;
  className?: string;
  /** Optional accessible name; when omitted the portrait is decorative (aria-hidden). */
  title?: string;
}

export interface Expression {
  eyes: Eyes;
  brows: Brows;
  mouth: Mouth;
}

/** Resolve the face actually drawn for a spec + mood. Exported for tests / previews. */
export function resolveExpression(spec: AvatarSpec, mood: Mood = 'neutral'): Expression {
  const { eyes, brows, mouth } = spec;
  switch (mood) {
    case 'happy':
      return { eyes, brows: 'arched', mouth: mouth === 'grin' || mouth === 'teeth' ? 'grin' : 'smile' };
    case 'angry':
      return { eyes: eyes === 'closed' ? 'sharp' : eyes, brows: 'angry', mouth: mouth === 'teeth' ? 'teeth' : 'frown' };
    case 'surprised':
      return { eyes: eyes === 'dot' ? 'dot' : 'wide', brows: 'raised', mouth: 'o' };
    case 'smug':
      return { eyes: eyes === 'round' || eyes === 'wide' ? 'narrow' : eyes, brows: 'arched', mouth: 'smirk' };
    case 'sad':
      return { eyes: eyes === 'sharp' ? 'round' : eyes, brows: 'worried', mouth: 'frown' };
    case 'thinking':
      return { eyes: eyes === 'dot' ? 'dot' : 'narrow', brows: 'flat', mouth: 'neutral' };
    case 'neutral':
    default:
      return { eyes, brows, mouth };
  }
}

/** Random idle blink every 3–5 s (per instance). */
function useBlink(enabled: boolean): boolean {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setClosed(false);
      return;
    }
    let t1 = 0;
    let t2 = 0;
    let t3 = 0;
    const schedule = () => {
      t1 = window.setTimeout(() => {
        setClosed(true);
        t2 = window.setTimeout(() => {
          setClosed(false);
          // occasional double-blink for life
          if (Math.random() < 0.18) {
            t3 = window.setTimeout(() => {
              setClosed(true);
              t2 = window.setTimeout(() => setClosed(false), 110);
            }, 160);
          }
          schedule();
        }, 120);
      }, 3000 + Math.random() * 2000);
    };
    schedule();
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [enabled]);
  return closed;
}

const HEAD_ADULT = 'M31,45 C31,30 39,23 50,23 C61,23 69,30 69,45 C69,58 61,68 50,68 C39,68 31,58 31,45 Z';
const HEAD_YOUNG = 'M30.4,46 C30.4,31 39,24 50,24 C61,24 69.6,31 69.6,46 C69.6,59 61,68 50,68 C39,68 30.4,59 30.4,46 Z';
const HEAD_OLD = 'M31,45 C31,30 39,23 50,23 C61,23 69,30 69,45 C69,58.5 61.5,68.4 50,68.4 C38.5,68.4 31,58.5 31,45 Z';

function AvatarImpl({ spec, size = 96, mood = 'neutral', speaking = false, className, title }: AvatarProps): JSX.Element {
  const reduce = useReducedMotion() ?? false;
  const rawId = useId();
  const uid = 'av' + rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const p = useMemo(() => buildPalette(spec), [spec]);
  const expr = resolveExpression(spec, mood);
  const isCat = spec.kind === 'cat';
  const age = spec.age ?? 'adult';
  const animate = !reduce;
  const blinking = useBlink(animate && expr.eyes !== 'closed');
  const talk = speaking && animate;
  const [breathPeriod] = useState(() => 3.6 + Math.random() * 1.2);

  const acc = renderAccessory(spec.accessory, p, { cat: isCat });
  const hair = isCat
    ? { back: null, front: null }
    : renderHair(spec.hair, p, { covered: HEADWEAR.has(spec.accessory) });
  const hideBackHair = HIDES_BACK_HAIR.has(spec.accessory);
  const hideFrontHair = spec.accessory === 'headscarf';

  // ── motion presets ──
  const pivot = { transformBox: 'view-box' as const, originX: '50px', originY: '74px' };
  const tilt = talk
    ? {
        animate: { rotate: [0, -2.2, 1.4, -1.2, 0.6, 0], y: [0, -0.5, 0, -0.4, 0, 0] },
        transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : { animate: { rotate: 0, y: 0 }, transition: { duration: 0.4 } };
  const breathe = animate
    ? {
        animate: { y: [0, 0.7, 0] },
        transition: { duration: breathPeriod, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : { animate: { y: 0 } };

  // ── face features ──
  const eyes = (
    <motion.g
      style={{ originX: 0.5, originY: 0.55 }}
      animate={{ scaleY: blinking ? 0.08 : 1 }}
      transition={{ duration: blinking ? 0.06 : 0.09 }}
    >
      {renderEyes(expr.eyes, p, {
        cat: isCat,
        old: age === 'old' && !isCat,
        scale: isCat ? 1.12 : age === 'young' ? 1.13 : 1,
        hideRight: spec.accessory === 'eyepatch',
      })}
    </motion.g>
  );

  const openMouth = OPEN_MOUTHS.has(expr.mouth);
  const mouthCore = isCat ? catMouth(expr.mouth, p) : mouthShape(expr.mouth, p);
  const jaw: ReactNode = talk && !openMouth && (
    <motion.ellipse
      cx={0}
      cy={isCat ? 2.4 : 1}
      rx={isCat ? 1.8 : 2.7}
      ry={isCat ? 1.6 : 2}
      fill={p.mouthDark}
      style={{ originX: 0.5, originY: 0.2 }}
      initial={{ scaleY: 0.2 }}
      animate={{ scaleY: [0.2, 1, 0.45, 0.9, 0.3, 0.75, 0.2] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
  const mouth = (
    <g transform={isCat ? 'translate(50 57)' : `translate(${MOUTH_X} ${MOUTH_Y})`}>
      <motion.g
        style={{ originX: 0.5, originY: 0.3 }}
        animate={talk && openMouth ? { scaleY: [1, 0.65, 1.12, 0.8, 1] } : { scaleY: 1 }}
        transition={talk && openMouth ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      >
        {jaw}
        {mouthCore}
      </motion.g>
    </g>
  );

  const faceStops = isCat
    ? [shade(p.hair, 0.16), p.hair, shade(p.hair, -0.14)]
    : [p.skinLight, p.skin, mix(p.skin, p.skinShadow, 0.75)];
  const ringColor = mix(p.accent, '#d4a857', 0.45);

  // ── head ──
  const humanHead = (
    <>
      {/* ears */}
      {[31.6, 68.4].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={48.6} rx={3.3} ry={4.8} fill={p.skin} stroke={p.skinLine} strokeWidth={1} />
          <path
            d={x < 50 ? 'M32.6,46 Q30.4,48.6 32.4,51.6' : 'M67.4,46 Q69.6,48.6 67.6,51.6'}
            fill="none"
            stroke={p.skinShadow}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
        </g>
      ))}
      <path
        d={age === 'young' ? HEAD_YOUNG : age === 'old' ? HEAD_OLD : HEAD_ADULT}
        fill={`url(#${uid}-face)`}
        stroke={p.skinLine}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      {/* soft jaw shade on the far side */}
      <path d="M62,60 C59,65 55,67.6 50,67.8 C56,66 60,62.6 62.6,57 Z" fill={p.skinShadow} opacity={0.45} />
      {age === 'old' && renderWrinkles(p)}
      <ellipse cx={39.4} cy={55.2} rx={3.3} ry={1.8} fill={p.blush} opacity={age === 'young' ? 0.24 : age === 'old' ? 0.1 : 0.16} />
      <ellipse cx={60.6} cy={55.2} rx={3.3} ry={1.8} fill={p.blush} opacity={age === 'young' ? 0.24 : age === 'old' ? 0.1 : 0.16} />
      {renderBeard(spec.facial, p)}
      {!hideFrontHair && hair.front}
      {eyes}
      {renderBrows(expr.brows, p.brow, { weight: spec.brows === 'thick' && expr.brows !== 'thick' ? 1.25 : 1 })}
      {renderNose(p, age)}
      {mouth}
      {renderMustache(spec.facial, p)}
      {acc.head}
    </>
  );

  const catHead = (
    <>
      {catBackHead(p)}
      <path d={CAT_HEAD} fill={`url(#${uid}-face)`} stroke={p.hairLine} strokeWidth={1.1} strokeLinejoin="round" />
      {catFace(p)}
      {eyes}
      {expr.brows !== 'flat' && renderBrows(expr.brows, p.furMarks, { y: 40, weight: 0.75 })}
      {catNose(p)}
      {mouth}
      {catWhiskers(p)}
      <ellipse cx={38.6} cy={55} rx={3} ry={1.6} fill="#ff7a8a" opacity={0.18} />
      <ellipse cx={61.4} cy={55} rx={3} ry={1.6} fill="#ff7a8a" opacity={0.18} />
      {acc.head}
    </>
  );

  const label = title ?? undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ overflow: 'visible', flexShrink: 0 }}
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={shade(p.accent, 0.38)} stopOpacity={0.95} />
          <stop offset="38%" stopColor={p.accent} stopOpacity={0.72} />
          <stop offset="78%" stopColor={mix(p.accent, '#141826', 0.78)} />
          <stop offset="100%" stopColor="#0f121a" />
        </radialGradient>
        <radialGradient id={`${uid}-face`} cx="40%" cy="34%" r="72%">
          <stop offset="0%" stopColor={faceStops[0]} />
          <stop offset="55%" stopColor={faceStops[1]} />
          <stop offset="100%" stopColor={faceStops[2]} />
        </radialGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.outfitLight} />
          <stop offset="50%" stopColor={p.outfit} />
          <stop offset="100%" stopColor={p.outfitShadow} />
        </linearGradient>
        <radialGradient id={`${uid}-vig`} cx="50%" cy="45%" r="55%">
          <stop offset="78%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.38} />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx={50} cy={50} r={47} />
        </clipPath>
      </defs>

      {/* frame + aura */}
      <circle cx={50} cy={50} r={49.4} fill="#0d1018" />
      <circle cx={50} cy={50} r={47} fill={`url(#${uid}-bg)`} />

      <g clipPath={`url(#${uid}-clip)`}>
        <motion.g {...breathe}>
          {acc.back}
          {!hideBackHair && hair.back && (
            <motion.g style={pivot} {...tilt}>
              {hair.back}
            </motion.g>
          )}

          {isCat ? (
            <>
              {catBody(p)}
              {acc.body}
              {catCollar(p)}
            </>
          ) : (
            <>
              {/* shoulders */}
              <path
                d="M12,101 C12,88 22,80.5 36,78 C40,77.3 44,77 50,77 C56,77 60,77.3 64,78 C78,80.5 88,88 88,101 Z"
                fill={`url(#${uid}-body)`}
                stroke={p.outfitLine}
                strokeWidth={1.1}
                strokeLinejoin="round"
              />
              <path d="M18,92 C20,86 26,82 33,80" fill="none" stroke={p.outfitLight} strokeWidth={1.2} opacity={0.55} strokeLinecap="round" />
              <path d="M29,101 L31,90 M71,101 L69,90" stroke={p.outfitShadow} strokeWidth={0.8} opacity={0.6} strokeLinecap="round" />
              {/* neck */}
              <path d="M43.4,60 L43.4,78 Q50,81.2 56.6,78 L56.6,60 Z" fill={mix(p.skin, p.skinShadow, 0.45)} stroke={p.skinLine} strokeWidth={0.9} />
              <ellipse cx={50} cy={68.6} rx={7.4} ry={3.2} fill={p.skinShadow} />
              {!OWN_NECKLINE.has(spec.accessory) && defaultNeckline(p)}
              {acc.body}
            </>
          )}

          <motion.g style={pivot} {...tilt}>
            {isCat ? catHead : humanHead}
          </motion.g>
        </motion.g>
      </g>

      {/* vignette + ring */}
      <circle cx={50} cy={50} r={47} fill={`url(#${uid}-vig)`} pointerEvents="none" />
      <circle cx={50} cy={50} r={47.4} fill="none" stroke={ringColor} strokeWidth={1.5} />
      <path d="M17,28 A40,40 0 0 1 50,10" fill="none" stroke="#ffffff" strokeOpacity={0.22} strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}

const AvatarMemo = memo(AvatarImpl);

/** Procedural SVG portrait (bust in a glowing circular frame). Pure function of its props plus idle animation. */
export function Avatar(props: AvatarProps): JSX.Element {
  return <AvatarMemo {...props} />;
}
