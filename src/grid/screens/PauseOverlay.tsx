import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { formatTime } from '@/grid/components/theme';

export interface PauseOverlayProps {
  open: boolean;
  elapsedMs: number;
  title: string;
  onResume: () => void;
  /** Case list route for the "Leave case" link. */
  exitTo: string;
}

/** Full-screen frosted overlay that hides the board while the timer is stopped. */
export function PauseOverlay({ open, elapsedMs, title, onResume, exitTo }: PauseOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pause"
          role="dialog"
          aria-modal="true"
          aria-label="Paused"
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-[#f3ede4]/80 px-6 text-center text-[#2b2724] backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="grid size-20 place-items-center rounded-[24px] bg-white text-[#e8632b] shadow-[0_14px_30px_-16px_rgb(70_45_20/0.6)]"
          >
            <Pause className="size-9" fill="currentColor" />
          </motion.div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a8178]">Paused</div>
            <div className="font-display text-2xl font-black">{title}</div>
            <div className="mt-1 font-mono text-sm tabular-nums text-[#8a8178]">{formatTime(elapsedMs)}</div>
          </div>
          <button
            type="button"
            data-autofocus
            autoFocus
            onClick={onResume}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#2b2724] px-8 text-base font-bold text-white shadow-[0_14px_28px_-14px_rgb(0_0_0/0.7)] transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Play className="size-5" fill="currentColor" /> Resume
          </button>
          <Link to={exitTo} className="text-sm font-semibold text-[#8a8178] underline-offset-4 hover:underline">
            Leave case (progress is saved)
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
