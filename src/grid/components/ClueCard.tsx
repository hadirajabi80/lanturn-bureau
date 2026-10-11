import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import type { Clue, Person } from '@/grid/types';

export interface ClueCardProps {
  person: Person | null;
  clues: Clue[];
  className?: string;
}

const VICTIM_LEAD = /^\s*the victim\.\s*/i;

/**
 * The selected person's clue paragraph. Clue sentences are joined into one paragraph like the
 * reference; the victim's text is set in italics behind a bold "The victim." lead.
 */
export function ClueCard({ person, clues, className }: ClueCardProps) {
  return (
    <div
      className={clsx(
        'relative min-h-[84px] overflow-hidden rounded-[18px] bg-white px-4 py-3.5 text-[15px] leading-relaxed text-[#2b2724]',
        'shadow-[0_8px_22px_-14px_rgb(70_45_20/0.35)] ring-1 ring-black/5',
        className,
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={person?.id ?? 'none'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          {!person ? (
            <span className="text-[#8a8178]">Pick a suspect below to read what they said.</span>
          ) : person.isVictim ? (
            <>
              <strong className="font-bold">The victim. </strong>
              <em className="italic text-[#4a423b]">
                {clues
                  .map((c) => c.text.replace(VICTIM_LEAD, ''))
                  .filter(Boolean)
                  .join(' ')}
              </em>
            </>
          ) : (
            <>
              <strong className="font-bold">{person.name}. </strong>
              {clues.map((c) => c.text).join(' ')}
            </>
          )}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
