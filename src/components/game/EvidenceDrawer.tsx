import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Search, X } from 'lucide-react';
import type { CaseFile, Clue, ClueKind } from '@/data/types';
import type { Session } from '@/engine/store';
import { DynamicIcon, KIND_META, KIND_ORDER } from '@/components/ui/ClueIcon';
import { Modal } from '@/components/ui/Modal';
import { RichText } from '@/components/ui/RichText';
import { Badge } from '@/components/ui/Badge';
import { useReducedFx } from '@/components/ui/useReducedFx';

// ───────────────────────── ClueTile ─────────────────────────

export interface ClueTileProps {
  clue: Clue;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function ClueTile({ clue, selected, compact, onClick }: ClueTileProps) {
  const meta = KIND_META[clue.kind];
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
        selected
          ? 'border-lantern/80 bg-lantern/10 shadow-[0_0_24px_-8px_var(--color-lantern)]'
          : 'border-white/7 bg-fog/60 hover:border-brass/40 hover:bg-fog-2/70',
      )}
      aria-pressed={selected}
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-lg border"
        style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}14` }}
      >
        <DynamicIcon name={clue.icon} fallback={meta.icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-tight text-paper">{clue.name}</span>
        {!compact && <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-paper/60">{clue.description}</span>}
        {compact && <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-paper/45">{meta.label}</span>}
      </span>
    </motion.button>
  );
}

// ───────────────────────── Examine modal ─────────────────────────

export function ExamineModal({ clue, onClose }: { clue: Clue | null; onClose: () => void }) {
  const meta = clue ? KIND_META[clue.kind] : null;
  return (
    <Modal open={clue !== null} onClose={onClose} eyebrow={meta ? `Exhibit · ${meta.label}` : undefined} title={clue?.name} size="md">
      {clue && meta && (
        <div className="space-y-4">
          <div
            className="relative grid h-36 place-items-center overflow-hidden rounded-xl border"
            style={{
              borderColor: `${meta.color}44`,
              background: `radial-gradient(circle at 50% 45%, ${meta.color}26, transparent 65%), linear-gradient(160deg, #1a2030, #0b0e14)`,
            }}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              style={{ color: meta.color, filter: `drop-shadow(0 0 16px ${meta.color})` }}
            >
              <DynamicIcon name={clue.icon} fallback={meta.icon} className="size-16" strokeWidth={1.4} />
            </motion.div>
            <Search className="absolute bottom-3 right-3 size-4 text-paper/30" />
          </div>
          <p className="leading-relaxed text-paper/90">{clue.description}</p>
          {clue.detail && (
            <div className="rounded-xl border border-brass/25 bg-brass/5 p-4 text-sm text-paper/85">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-brass">Under the loupe</div>
              <RichText text={clue.detail} />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

// ───────────────────────── EvidenceList ─────────────────────────

export interface EvidenceListProps {
  caseFile: CaseFile;
  session: Session;
  className?: string;
}

export function EvidenceList({ caseFile, session, className }: EvidenceListProps) {
  const [examine, setExamine] = useState<Clue | null>(null);
  const reduced = useReducedFx();

  const found = useMemo(() => {
    const byId = new Map(caseFile.clues.map((c) => [c.id, c]));
    return session.foundClues.map((id) => byId.get(id)).filter((c): c is Clue => Boolean(c));
  }, [caseFile, session.foundClues]);

  const groups = useMemo(() => {
    const g = new Map<ClueKind, Clue[]>();
    for (const c of found) g.set(c.kind, [...(g.get(c.kind) ?? []), c]);
    return KIND_ORDER.filter((k) => g.has(k)).map((k) => ({ kind: k, clues: g.get(k) ?? [] }));
  }, [found]);

  const lastId = session.foundClues[session.foundClues.length - 1];

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between text-sm text-paper/60">
        <span>
          <span className="font-semibold text-paper">{found.length}</span> of {caseFile.clues.length} exhibits logged
        </span>
        {found.length < caseFile.clues.length && <span className="text-xs italic">Some are still out there.</span>}
      </div>
      {groups.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-paper/50">
          Nothing in the drawer yet. Go poke at the scenery.
        </p>
      )}
      <div className="space-y-5">
        {groups.map((g) => {
          const meta = KIND_META[g.kind];
          return (
            <section key={g.kind}>
              <h4 className="mb-2 flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: meta.color }}>
                <DynamicIcon name={meta.icon} className="size-3.5" />
                {meta.label}
                <span className="text-paper/40">· {g.clues.length}</span>
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {g.clues.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={reduced ? false : c.id === lastId ? { rotateY: 90, opacity: 0 } : false}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative"
                  >
                    <ClueTile clue={c} onClick={() => setExamine(c)} />
                    {c.initial && (
                      <Badge tone="fog" className="absolute right-2 top-2">
                        briefing
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <ExamineModal clue={examine} onClose={() => setExamine(null)} />
    </div>
  );
}

// ───────────────────────── EvidenceDrawer (slide-over) ─────────────────────────

export interface EvidenceDrawerProps extends EvidenceListProps {
  open: boolean;
  onClose: () => void;
}

export function EvidenceDrawer({ open, onClose, caseFile, session }: EvidenceDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Let a nested modal (examine) take Esc first.
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"][aria-modal="true"]')) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="complementary"
            aria-label="Evidence drawer"
            className="glass absolute inset-y-0 right-0 flex w-full max-w-md flex-col rounded-none border-y-0 border-r-0 bg-ink-2/95"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <header className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80">Case {String(caseFile.number).padStart(2, '0')}</div>
                <h2 className="font-display text-xl font-bold">Evidence drawer</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close evidence drawer"
                className="grid size-9 place-items-center rounded-full text-paper/60 hover:bg-white/5 hover:text-paper"
              >
                <X className="size-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <EvidenceList caseFile={caseFile} session={session} />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
