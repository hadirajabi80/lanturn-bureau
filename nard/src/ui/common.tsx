import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { sound } from '../audio/sound';
import type { CheckerLook } from '../textures/themes';

export function CheckerChip({ look, size }: { look: CheckerLook; size?: number }) {
  return (
    <span
      className="chip-checker"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${look.sheen}55, transparent 55%), ${look.color}`,
      }}
    />
  );
}

export function Modal({ open, onClose, children }: { open: boolean; onClose?: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-back"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            className="modal glass"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`switch ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      onClick={() => {
        sound.click();
        onChange(!on);
      }}
    />
  );
}

/** Small CSS die face for the HUD. */
export function MiniDie({ value, used, body, pip }: { value: number; used: boolean; body: string; pip: string }) {
  const cells: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return (
    <motion.div
      layout
      initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={`mini-die ${used ? 'used' : ''}`}
      style={{ background: `linear-gradient(160deg, ${body}, color-mix(in srgb, ${body} 78%, #000))` }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} style={{ background: pip, visibility: cells[value].includes(i) ? 'visible' : 'hidden' }} />
      ))}
    </motion.div>
  );
}
