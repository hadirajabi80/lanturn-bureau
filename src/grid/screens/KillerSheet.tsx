import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { ShakeOnError } from '@/components/fx';
import type { Clue, Person } from '@/grid/types';
import { Sheet } from '@/grid/components/Sheet';

export interface KillerSheetProps {
  open: boolean;
  onClose: () => void;
  suspects: Person[];
  victim: Person | undefined;
  victimClues: Clue[];
  /** Returns true when the guess was right. */
  onGuess: (personId: string) => boolean;
}

/** "Who is the killer?" — wrong guesses shake and cross the tile out; retries allowed. */
export function KillerSheet({ open, onClose, suspects, victim, victimClues, onGuess }: KillerSheetProps) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!shake) return;
    const t = window.setTimeout(() => setShake(false), 450);
    return () => window.clearTimeout(t);
  }, [shake]);

  const rule = victimClues.map((c) => c.text.replace(/^\s*the victim\.\s*/i, '')).join(' ');

  return (
    <Sheet open={open} onClose={onClose} eyebrow="Everyone is placed" title="Who is the killer?">
      {victim && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5">
          <span
            className="block size-11 shrink-0 overflow-hidden rounded-xl"
            style={{ background: `${victim.avatar.accent}88` }}
          >
            <Avatar spec={victim.avatar} size={44} mood="sad" />
          </span>
          <p className="text-[14px] leading-snug text-[#2b2724]">
            <strong>The victim. </strong>
            <em className="text-[#4a423b]">{rule}</em>
          </p>
        </div>
      )}
      <ShakeOnError shake={shake}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {suspects.map((p, i) => {
            const isWrong = wrong.includes(p.id);
            return (
              <motion.button
                key={p.id}
                type="button"
                data-autofocus={i === 0 ? true : undefined}
                disabled={isWrong}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (!onGuess(p.id)) {
                    setWrong((w) => [...w, p.id]);
                    setShake(true);
                  }
                }}
                className={clsx(
                  'flex flex-col items-center gap-1.5 rounded-2xl bg-white p-2.5 ring-1 ring-black/5 outline-none transition-shadow',
                  'hover:shadow-[0_0_0_3px_#e8632b] focus-visible:shadow-[0_0_0_3px_#e8632b] disabled:opacity-50 disabled:hover:shadow-none',
                )}
              >
                <span
                  className="relative block size-16 overflow-hidden rounded-2xl"
                  style={{ background: `linear-gradient(170deg, ${p.avatar.accent}55, ${p.avatar.accent}cc)` }}
                >
                  <Avatar spec={p.avatar} size={64} mood={isWrong ? 'surprised' : 'neutral'} />
                  {isWrong && (
                    <span className="absolute inset-0 grid place-items-center bg-white/50">
                      <X className="size-10 text-[#d9443a]" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center text-[13px] font-semibold text-[#2b2724]">{p.name}</span>
              </motion.button>
            );
          })}
        </div>
      </ShakeOnError>
      <p className="mt-4 text-center text-[12px] text-[#8a8178]">The clock keeps running until you name the killer.</p>
    </Sheet>
  );
}
