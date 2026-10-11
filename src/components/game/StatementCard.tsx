import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Gavel, MessageSquareWarning } from 'lucide-react';
import type { CaseFile, Statement, Suspect } from '@/data/types';
import { game, statementKey, type Session } from '@/engine/store';
import { Typewriter } from '@/components/fx';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useReducedFx } from '@/components/ui/useReducedFx';
import { PressModal } from './PressModal';
import { announceClue } from './announce';

export type StatementStatus = 'unread' | 'read' | 'broken';

export interface StatementCardProps {
  caseFile: CaseFile;
  session: Session;
  suspect: Suspect;
  statement: Statement;
  index: number;
  /** Called once the statement has been fully read for the first time. */
  onRead?: () => void;
}

export function statementStatus(session: Session, suspectId: string, statementId: string): StatementStatus {
  const key = statementKey(suspectId, statementId);
  if (session.brokenStatements.includes(key)) return 'broken';
  if (session.readStatements.includes(key)) return 'read';
  return 'unread';
}

/** Hand-drawn crack overlay for broken testimony. */
function Cracks() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
      <motion.path
        d="M260 0 L248 26 L268 44 L236 70 L252 92 L230 120 M248 26 L214 34 M268 44 L304 52 L322 40 M236 70 L198 78"
        fill="none"
        stroke="rgb(255 120 128 / 0.55)"
        strokeWidth="1.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </svg>
  );
}

export function StatementCard({ caseFile, session, suspect, statement, index, onRead }: StatementCardProps) {
  const reduced = useReducedFx();
  const [pressing, setPressing] = useState(false);
  const status = statementStatus(session, suspect.character.id, statement.id);
  // Captured on mount: only statements that were unread when first shown get the typewriter.
  const [typeIt] = useState(status === 'unread');

  const markRead = () => {
    const revealed = game().readStatement(suspect.character.id, statement.id);
    announceClue(caseFile, revealed);
    onRead?.();
  };

  const broken = status === 'broken';

  return (
    <motion.article
      layout
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={broken && !reduced ? { opacity: 1, y: 0, x: [0, -4, 4, -2, 0] } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'relative overflow-hidden rounded-2xl border p-4 pl-5 transition-colors',
        broken ? 'border-crimson/55 bg-gradient-to-br from-crimson/12 to-fog/40' : 'border-white/7 bg-fog/50',
      )}
    >
      <span
        className={clsx('absolute inset-y-3 left-0 w-1 rounded-r-full', broken ? 'bg-crimson' : status === 'read' ? 'bg-brass/60' : 'bg-white/15')}
        aria-hidden
      />
      {broken && <Cracks />}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/45">Statement {index + 1}</span>
        {broken && (
          <Badge tone="crimson" icon={<MessageSquareWarning className="size-3" />}>
            Broken
          </Badge>
        )}
      </div>
      <p className={clsx('font-display text-[17px] leading-snug sm:text-lg', broken ? 'text-paper/70' : 'text-paper')}>
        “
        {typeIt && status === 'unread' ? (
          <Typewriter text={statement.text} speed={16} onDone={markRead} />
        ) : (
          <span className={clsx(broken && 'decoration-crimson/70 decoration-2 line-through')}>{statement.text}</span>
        )}
        ”
      </p>
      {broken && statement.pressReply && (
        <p className="mt-2 border-l-2 border-crimson/50 pl-3 text-sm italic text-[#ffb3b7]">{statement.pressReply}</p>
      )}
      {!broken && (
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            disabled={status === 'unread'}
            icon={<Gavel className="size-3.5" />}
            onClick={() => setPressing(true)}
            className="hover:border-crimson/60 hover:text-[#ff8a90]"
          >
            Press
          </Button>
        </div>
      )}
      <PressModal
        open={pressing}
        onClose={() => setPressing(false)}
        caseFile={caseFile}
        session={session}
        suspect={suspect}
        statement={statement}
      />
    </motion.article>
  );
}
