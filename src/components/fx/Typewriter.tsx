import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { useReduced } from './useReduced';

export interface TypewriterProps {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Called once per `text` when the full string is visible. */
  onDone?: () => void;
  /** Render the whole string immediately (e.g. "skip" setting). */
  instant?: boolean;
  className?: string;
}

/**
 * Character-by-character text reveal with a blinking caret. Clicking while typing finishes
 * instantly (and stops the click from bubbling, so a parent "advance" handler only fires once
 * the line is complete). Restarts when `text` changes; renders instantly under reduced motion.
 */
export function Typewriter({ text, speed = 18, onDone, instant = false, className }: TypewriterProps) {
  const reduced = useReduced();
  const chars = useMemo(() => Array.from(text), [text]);
  const [state, setState] = useState({ text, count: 0, skipped: false });

  // Derived-state reset during render: avoids a one-frame flash of the previous line.
  let current = state;
  if (state.text !== text) {
    current = { text, count: 0, skipped: false };
    setState(current);
  }

  const done = instant || reduced || current.skipped || current.count >= chars.length;
  const countRef = useRef(current.count);
  countRef.current = current.count;

  useEffect(() => {
    if (done) return;
    const total = chars.length;
    const step = Math.max(1, speed);
    const start = performance.now() - countRef.current * step;
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.min(total, Math.floor((now - start) / step) + 1);
      setState((s) => (s.text === text && s.count !== n ? { ...s, count: n } : s));
      if (n < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, chars, speed, done]);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const firedFor = useRef<string | null>(null);
  useEffect(() => {
    if (done && firedFor.current !== text) {
      firedFor.current = text;
      onDoneRef.current?.();
    }
  }, [done, text]);

  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (done) return;
    e.stopPropagation();
    setState((s) => ({ ...s, skipped: true }));
  };

  const shown = done ? chars.length : current.count;
  const visible = chars.slice(0, shown).join('');
  const hidden = chars.slice(shown).join('');

  return (
    <span className={className} onClick={handleClick} style={{ whiteSpace: 'pre-wrap' }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {visible}
        {!done && (
          <motion.span
            className="inline-block align-baseline bg-current"
            style={{ width: 2, height: '1em', marginRight: -2, marginBottom: '-0.12em' }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.55, 1], ease: 'linear' }}
          />
        )}
        {/* Unrevealed remainder reserves layout so lines never reflow while typing. */}
        {hidden && <span style={{ opacity: 0 }}>{hidden}</span>}
      </span>
    </span>
  );
}
