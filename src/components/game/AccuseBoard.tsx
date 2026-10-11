import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Ban, Gavel, Siren } from 'lucide-react';
import type { CaseFile, Suspect } from '@/data/types';
import { game, type Session } from '@/engine/store';
import { PENALTY } from '@/engine/scoring';
import { sfx } from '@/engine/audio';
import { Avatar } from '@/components/avatar/Avatar';
import { Spotlight, Typewriter, fireConfetti } from '@/components/fx';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useReducedFx } from '@/components/ui/useReducedFx';

export interface AccuseBoardProps {
  caseFile: CaseFile;
  session: Session;
  /** Called after the correct accusation has landed (navigate to the verdict). */
  onCorrect: () => void;
}

type Stage = 'idle' | 'confirm' | 'spotlight' | 'wrong' | 'right';

const DRUMROLL_MS = 1900;

export function AccuseBoard({ caseFile, session, onCorrect }: AccuseBoardProps) {
  const reduced = useReducedFx();
  const [target, setTarget] = useState<Suspect | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [spot, setSpot] = useState({ x: 0, y: 0, radius: 900 });
  const cards = useRef(new Map<string, HTMLDivElement>());
  const n = caseFile.suspects.length;

  const choose = (s: Suspect) => {
    if (stage !== 'idle' || session.accusedWrong.includes(s.character.id)) return;
    sfx.blip();
    setTarget(s);
    setStage('confirm');
  };

  const confirm = () => {
    if (!target) return;
    const el = cards.current.get(target.character.id);
    const r = el?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height * 0.4 : window.innerHeight / 2;
    const far = Math.hypot(window.innerWidth, window.innerHeight);
    setSpot({ x, y, radius: far });
    setStage('spotlight');
    sfx.drumroll();
    // Narrow in two beats so the spring has somewhere to travel.
    window.setTimeout(() => setSpot({ x, y, radius: r ? Math.max(r.width, r.height) * 0.75 : 160 }), 60);
    window.setTimeout(() => {
      const ok = game().accuse(target.character.id);
      if (ok) {
        sfx.success();
        if (!reduced) fireConfetti('solve');
        setStage('right');
        window.setTimeout(onCorrect, 1400);
      } else {
        sfx.wrong();
        setStage('wrong');
      }
    }, reduced ? 500 : DRUMROLL_MS);
  };

  const reset = () => {
    setStage('idle');
    setTarget(null);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <Siren className="mx-auto mb-2 size-8 text-crimson" />
        <h3 className="font-display text-2xl font-bold sm:text-3xl">Who did it?</h3>
        <p className="mx-auto mt-1 max-w-lg text-sm text-paper/60">
          Point at one person. A wrong accusation costs {PENALTY.wrongAccusation} points and an awkward apology.
          Get it right and you'll have to prove it.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4" style={{ perspective: 1200 }}>
        {caseFile.suspects.map((s, i) => {
          const cleared = session.accusedWrong.includes(s.character.id);
          const mid = (n - 1) / 2;
          const isTarget = target?.character.id === s.character.id;
          const dim = (stage === 'spotlight' || stage === 'right') && !isTarget;
          return (
            <motion.div
              key={s.character.id}
              ref={(el: HTMLDivElement | null) => {
                if (el) cards.current.set(s.character.id, el);
                else cards.current.delete(s.character.id);
              }}
              initial={reduced ? false : { opacity: 0, y: 60, rotate: 0 }}
              animate={{ opacity: dim ? 0.35 : 1, y: 0, rotate: reduced ? 0 : (i - mid) * 2.5 }}
              whileHover={cleared || stage !== 'idle' || reduced ? undefined : { y: -10, rotate: 0, scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20, delay: reduced ? 0 : i * 0.07 }}
              className="w-[150px] sm:w-[170px]"
            >
              <button
                type="button"
                disabled={cleared || stage !== 'idle'}
                onClick={() => choose(s)}
                className={clsx(
                  'group relative flex w-full flex-col items-center rounded-2xl border p-4 pb-3 text-center transition-colors',
                  cleared
                    ? 'cursor-not-allowed border-white/5 bg-fog/30 grayscale'
                    : 'border-white/8 bg-gradient-to-b from-fog-2/90 to-ink-2/90 hover:border-crimson/60',
                  isTarget && stage !== 'idle' && 'border-crimson/80',
                )}
              >
                <Avatar
                  spec={s.character.avatar}
                  size={104}
                  mood={stage === 'right' && isTarget ? 'sad' : stage === 'wrong' && isTarget ? 'angry' : 'neutral'}
                />
                <span className="mt-2 line-clamp-2 font-display text-[15px] font-bold leading-tight">{s.character.name}</span>
                <span className="mt-0.5 line-clamp-1 text-[11px] text-paper/50">{s.character.role}</span>
                {cleared && (
                  <Badge tone="fog" className="absolute left-1/2 top-3 -translate-x-1/2" icon={<Ban className="size-3" />}>
                    Cleared
                  </Badge>
                )}
                {!cleared && stage === 'idle' && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-crimson opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Gavel className="size-3" /> Accuse
                  </span>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <Spotlight x={spot.x} y={spot.y} radius={spot.radius} show={stage === 'spotlight' || stage === 'right'} darkness={0.9} />

      <Modal
        open={stage === 'confirm'}
        onClose={reset}
        size="sm"
        eyebrow="Formal accusation"
        title={target ? `Accuse ${target.character.name}?` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={reset}>
              Not yet
            </Button>
            <Button variant="danger" icon={<Gavel className="size-4" />} onClick={confirm} data-autofocus>
              It was them
            </Button>
          </>
        }
      >
        {target && (
          <div className="flex items-center gap-4">
            <Avatar spec={target.character.avatar} size={72} mood="surprised" />
            <p className="text-sm text-paper/75">
              Once you say it out loud, there's no taking it back. If you're wrong, it costs{' '}
              <span className="font-semibold text-[#ff8a90]">{PENALTY.wrongAccusation} points</span>.
            </p>
          </div>
        )}
      </Modal>

      <Modal open={stage === 'wrong'} onClose={reset} size="md" eyebrow={`−${PENALTY.wrongAccusation} points`} title="Wrong person.">
        {target && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar spec={target.character.avatar} size={84} mood="angry" speaking />
              <div className="min-w-0">
                <div className="font-display font-bold">{target.character.name}</div>
                <p className="mt-1 text-paper/85">
                  <Typewriter text={target.accusedWrong} speed={18} />
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="subtle" onClick={reset}>
                Back to the evidence
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
