import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReduced } from './useReduced';

export interface GlowCardProps {
  /** Glow colour (any CSS colour, typically the case palette `glow`). */
  glow: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** 3D hover tilt; automatically off for touch pointers and reduced motion. */
  tilt?: boolean;
}

const MAX_TILT = 9; // degrees
const SPRING = { stiffness: 260, damping: 22, mass: 0.6 };

/**
 * Card with a perspective hover tilt that follows the mouse, a moving specular highlight and a
 * soft glow in `glow` colour. All motion is transform/opacity on motion values (no re-renders).
 * Becomes a keyboard-accessible button when `onClick` is provided.
 */
export function GlowCard({ glow, children, className, onClick, tilt = true }: GlowCardProps) {
  const reduced = useReduced();
  const canTilt = tilt && !reduced;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), SPRING);
  const hoverS = useSpring(hover, { stiffness: 200, damping: 25 });
  const lift = useTransform(hoverS, [0, 1], [1, 1.025]);
  const hlX = useTransform(px, (v) => `${(v - 0.5) * 100}%`);
  const hlY = useTransform(py, (v) => `${(v - 0.5) * 100}%`);
  const glowOpacity = useTransform(hoverS, [0, 1], [0.45, 1]);
  const hlOpacity = useTransform(hoverS, [0, 1], [0, 1]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') hover.set(1);
  };
  const onLeave = () => {
    hover.set(0);
    px.set(0.5);
    py.set(0.5);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? onKey : undefined}
        onPointerMove={canTilt ? onMove : undefined}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        whileTap={onClick && !reduced ? { scale: 0.98 } : undefined}
        className="relative h-full w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        style={{
          rotateX: canTilt ? rotateX : 0,
          rotateY: canTilt ? rotateY : 0,
          scale: reduced ? 1 : lift,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          cursor: onClick ? 'pointer' : undefined,
        }}
      >
        {/* Glow: static shadow, only its opacity animates. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            opacity: glowOpacity,
            boxShadow: `0 0 0 1px color-mix(in srgb, ${glow} 45%, transparent), 0 12px 48px -10px ${glow}, 0 0 28px -6px ${glow}`,
          }}
        />
        <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
          {children}
          {/* Specular highlight that tracks the pointer via transform. */}
          {canTilt && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                x: hlX,
                y: hlY,
                opacity: hlOpacity,
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22), rgba(255,255,255,0.06) 30%, transparent 55%)',
                mixBlendMode: 'screen',
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
