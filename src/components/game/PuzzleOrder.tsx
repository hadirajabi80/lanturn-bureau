import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import clsx from 'clsx';
import { ArrowDown, ArrowUp, CheckCheck, GripVertical } from 'lucide-react';
import type { OrderPuzzle } from '@/data/types';
import { sfx } from '@/engine/audio';
import { Button } from '@/components/ui/Button';
import { PuzzleShell } from './PuzzleShell';
import type { PuzzleProps } from './PuzzleCode';

/** Deterministic shuffle (seeded by puzzle id) that never returns the solved order. */
function scrambled(p: OrderPuzzle): string[] {
  const ids = p.items.map((i) => i.id);
  let seed = 0;
  for (let i = 0; i < p.id.length; i++) seed = (seed * 31 + p.id.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  if (out.length > 1 && out.every((id, i) => id === p.correctOrder[i])) out.reverse();
  return out;
}

export function PuzzleOrder({ puzzle, index, solved, onSolved }: PuzzleProps<OrderPuzzle>) {
  const [order, setOrder] = useState<string[]>(() => (solved ? [...puzzle.correctOrder] : scrambled(puzzle)));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const text = new Map(puzzle.items.map((i) => [i.id, i.text]));
  const shown = solved ? puzzle.correctOrder : order;

  const move = (id: string, dir: -1 | 1) => {
    setOrder((o) => {
      const i = o.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= o.length) return o;
      const n = [...o];
      [n[i], n[j]] = [n[j]!, n[i]!];
      return n;
    });
    setFeedback(null);
  };

  const check = () => {
    const right = order.filter((id, i) => id === puzzle.correctOrder[i]).length;
    if (right === puzzle.correctOrder.length) {
      setFeedback(null);
      onSolved();
    } else {
      sfx.wrong();
      setShakeKey((k) => k + 1);
      setFeedback(`${right} of ${puzzle.correctOrder.length} in the right place. Time is being difficult.`);
    }
  };

  return (
    <PuzzleShell
      puzzle={puzzle}
      index={index}
      solved={solved}
      feedback={feedback && !solved ? <span className="text-[#ff8a90]">{feedback}</span> : undefined}
    >
      <div key={shakeKey} className={clsx(shakeKey > 0 && 'animate-shake')}>
        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">
          <span>First</span>
          <span className="hidden sm:inline">Drag to reorder</span>
        </div>
        <Reorder.Group
          axis="y"
          values={shown}
          onReorder={(v: string[]) => {
            if (solved) return;
            setOrder(v);
            setFeedback(null);
          }}
          className="space-y-2"
        >
          {shown.map((id, i) => (
            <OrderRow
              key={id}
              id={id}
              index={i}
              count={shown.length}
              text={text.get(id) ?? id}
              locked={solved}
              onMove={move}
            />
          ))}
        </Reorder.Group>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">Last</div>
      </div>
      {!solved && (
        <div className="mt-4 flex justify-end">
          <Button icon={<CheckCheck className="size-4" />} onClick={check}>
            Check the timeline
          </Button>
        </div>
      )}
    </PuzzleShell>
  );
}

function OrderRow({
  id,
  index,
  count,
  text,
  locked,
  onMove,
}: {
  id: string;
  index: number;
  count: number;
  text: string;
  locked: boolean;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.03, boxShadow: '0 18px 40px -12px rgb(0 0 0 / 0.8)', zIndex: 5 }}
      className={clsx(
        'relative flex touch-pan-y items-center gap-3 rounded-xl border p-2.5 pr-2 select-none',
        locked ? 'border-teal/35 bg-teal/8' : 'border-white/8 bg-fog-2/80',
      )}
    >
      <span
        onPointerDown={(e) => !locked && controls.start(e)}
        className={clsx(
          'grid size-8 shrink-0 touch-none place-items-center rounded-lg text-paper/40',
          !locked && 'cursor-grab hover:bg-white/5 hover:text-brass active:cursor-grabbing',
        )}
        aria-hidden
      >
        <GripVertical className="size-4" />
      </span>
      <span className={clsx('w-6 shrink-0 font-mono text-sm font-semibold', locked ? 'text-teal' : 'text-brass')}>
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug text-paper/90">{text}</span>
      {!locked && (
        <span className="flex shrink-0 flex-col">
          <button
            type="button"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove(id, -1)}
            className="grid size-6 place-items-center rounded text-paper/50 hover:bg-white/5 hover:text-paper disabled:opacity-20"
          >
            <ArrowUp className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === count - 1}
            onClick={() => onMove(id, 1)}
            className="grid size-6 place-items-center rounded text-paper/50 hover:bg-white/5 hover:text-paper disabled:opacity-20"
          >
            <ArrowDown className="size-3.5" />
          </button>
        </span>
      )}
    </Reorder.Item>
  );
}
