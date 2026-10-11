import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Gavel, RotateCcw } from 'lucide-react';
import type { CaseFile, Clue, Statement, Suspect } from '@/data/types';
import { game, type PressResult, type Session } from '@/engine/store';
import { PENALTY } from '@/engine/scoring';
import { sfx } from '@/engine/audio';
import { Avatar } from '@/components/avatar/Avatar';
import { ContradictionFlash, Typewriter } from '@/components/fx';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClueTile } from './EvidenceDrawer';
import { announceClue } from './announce';

export interface PressModalProps {
  open: boolean;
  onClose: () => void;
  caseFile: CaseFile;
  session: Session;
  suspect: Suspect;
  statement: Statement;
}

export function PressModal({ open, onClose, caseFile, session, suspect, statement }: PressModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow={`Press · ${suspect.character.name}`}
      title="Present evidence"
    >
      <PressBody caseFile={caseFile} session={session} suspect={suspect} statement={statement} onClose={onClose} />
    </Modal>
  );
}

function PressBody({
  caseFile,
  session,
  suspect,
  statement,
  onClose,
}: Omit<PressModalProps, 'open'>) {
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<PressResult | null>(null);
  const [flash, setFlash] = useState(false);
  const [replyReady, setReplyReady] = useState(false);

  const clues = useMemo(() => {
    const byId = new Map(caseFile.clues.map((c) => [c.id, c]));
    return session.foundClues.map((id) => byId.get(id)).filter((c): c is Clue => Boolean(c));
  }, [caseFile, session.foundClues]);

  const present = () => {
    if (!picked) return;
    const r = game().pressStatement(suspect.character.id, statement.id, picked);
    setResult(r);
    if (r.ok && !r.already) {
      sfx.contradiction();
      setFlash(true);
      setReplyReady(false);
    } else {
      if (!r.ok) sfx.wrong();
      setReplyReady(true);
    }
  };

  // The revealed clue is announced once: after the flash, or on unmount if the modal is closed early.
  const pendingReveal = useRef<string | undefined>(undefined);
  pendingReveal.current = flash ? result?.revealed : pendingReveal.current;
  useEffect(
    () => () => {
      if (pendingReveal.current) announceClue(caseFile, pendingReveal.current);
    },
    [caseFile],
  );

  const onFlashDone = () => {
    setFlash(false);
    setReplyReady(true);
    announceClue(caseFile, pendingReveal.current);
    pendingReveal.current = undefined;
  };

  const retry = () => {
    setResult(null);
    setPicked(null);
    setReplyReady(false);
  };

  return (
    <div className="space-y-4">
      <blockquote className="rounded-xl border border-white/8 bg-fog/50 p-4 font-display text-lg italic leading-snug text-paper/90">
        “{statement.text}”
      </blockquote>

      {!result && (
        <>
          <p className="text-sm text-paper/60">
            Which exhibit proves this wrong? A miss costs <span className="font-semibold text-[#ff7b82]">{PENALTY.wrongPress}</span> points and a little dignity.
          </p>
          {clues.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-paper/50">
              Your drawer is empty. Find something first.
            </p>
          ) : (
            <div className="grid max-h-[42vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {clues.map((c) => (
                <ClueTile key={c.id} clue={c} compact selected={picked === c.id} onClick={() => setPicked(c.id)} />
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>
              Never mind
            </Button>
            <Button variant="danger" icon={<Gavel className="size-4" />} disabled={!picked} onClick={present}>
              Present
            </Button>
          </div>
        </>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'flex gap-4 rounded-2xl border p-4',
            result.ok ? 'border-crimson/50 bg-crimson/10' : 'border-white/8 bg-fog/50',
          )}
        >
          <div className="shrink-0">
            <Avatar spec={suspect.character.avatar} size={84} mood={result.ok ? 'surprised' : 'smug'} speaking={replyReady} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-display font-bold text-paper">{suspect.character.name}</span>
              {result.ok ? (
                <Badge tone="crimson">Contradiction</Badge>
              ) : (
                <Badge tone="fog">−{PENALTY.wrongPress} pts</Badge>
              )}
            </div>
            <div className="min-h-12 text-paper/90">
              {replyReady ? <Typewriter text={result.reply} speed={20} /> : <span className="text-paper/40">…</span>}
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {!result.ok && (
                <Button variant="ghost" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={retry}>
                  Try another exhibit
                </Button>
              )}
              <Button size="sm" variant={result.ok ? 'primary' : 'subtle'} onClick={onClose} disabled={flash}>
                {result.ok ? 'Noted.' : 'Back off'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      <ContradictionFlash show={flash} onDone={onFlashDone} />
    </div>
  );
}
