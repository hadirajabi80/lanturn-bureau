import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Check, ChevronRight, Trophy } from 'lucide-react';
import { SEASONS, puzzleTitle } from '@/grid/engine';
import type { Season } from '@/grid/types';
import { caseStatus, puzzleIdOf, tierProgress, useFiles } from '@/grid/store';
import { FilesHeader, FilesPage } from '@/grid/components/FilesPage';
import { StatusPill } from '@/grid/components/StatusPill';
import { TIER_META, isTier, pad2 } from '@/grid/components/theme';

type Filter = 'pending' | 'all';

/** /files/:season/:tier — numbered case rows with status. */
export default function CaseList() {
  const { season: seasonId, tier } = useParams<{ season: string; tier: string }>();
  const season = SEASONS.find((s: Season) => s.id === seasonId);
  const progress = useFiles((s) => s.progress);
  const [filter, setFilter] = useState<Filter>('pending');

  const rows = useMemo(() => {
    if (!season || !isTier(tier)) return [];
    return Array.from({ length: season.casesPerTier }, (_, i) => {
      const n = i + 1;
      const id = puzzleIdOf(season.id, tier, n);
      let title = `Case ${n}`;
      try {
        title = puzzleTitle(season.id, tier, n);
      } catch {
        /* keep fallback */
      }
      return { n, id, title };
    });
  }, [season, tier]);

  if (!season || !isTier(tier)) return <Navigate to={season ? `/files/${season.id}` : '/files'} replace />;

  const meta = TIER_META[tier];
  const count = tierProgress(progress, season.id, tier, season.casesPerTier);
  const visible = rows.filter((r) => filter === 'all' || !progress[r.id]?.solved);
  const nextUp = rows.find((r) => !progress[r.id]?.solved)?.n;

  return (
    <FilesPage>
      <FilesHeader
        back={`/files/${season.id}`}
        backLabel="Choose difficulty"
        eyebrow={season.name}
        title={<span style={{ color: meta.color }}>{meta.label}</span>}
        right={
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-bold tabular-nums shadow-[0_6px_16px_-10px_rgb(70_45_20/0.4)] ring-1 ring-black/5">
            {count.solved}/{count.total}
            <Check className="size-4 text-[#3f9d55]" strokeWidth={3} />
          </span>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div role="tablist" aria-label="Filter cases" className="flex gap-1.5">
          {(['pending', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={clsx(
                'h-8 rounded-full px-3.5 text-[13px] font-semibold transition-colors',
                filter === f
                  ? 'bg-[#2b2724] text-white'
                  : 'bg-white text-[#5b524a] shadow-[0_4px_12px_-8px_rgb(70_45_20/0.4)] ring-1 ring-black/5 hover:text-[#2b2724]',
              )}
            >
              {f === 'pending' ? 'Pending' : 'All'}
            </button>
          ))}
        </div>
        <SizeRamp min={meta.minSize} max={meta.maxSize} color={meta.color} />
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-6 py-10 text-center shadow-[0_10px_26px_-16px_rgb(70_45_20/0.45)]">
          <Trophy className="size-9 text-[#f2b01e]" />
          <div className="font-display text-xl font-black">Every file closed</div>
          <p className="text-sm text-[#8a8178]">Switch to “All” to replay a case and chase three stars.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((r, i) => {
            const p = progress[r.id];
            const status = caseStatus(p);
            return (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.025 }}
              >
                <Link
                  to={`/files/${season.id}/${tier}/${r.n}`}
                  className={clsx(
                    'group flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_6px_18px_-14px_rgb(70_45_20/0.5)] ring-1 outline-none transition-transform hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-[#e8632b]',
                    r.n === nextUp ? 'ring-[#e8632b]/40' : 'ring-black/[0.04]',
                  )}
                >
                  <span
                    className="w-8 shrink-0 text-center font-mono text-lg font-bold tabular-nums"
                    style={{ color: status === 'solved' ? meta.color : '#2b2724' }}
                  >
                    {pad2(r.n)}
                  </span>
                  <span className="h-8 w-px shrink-0 bg-[#ece4d8]" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <StatusPill status={status} stars={p?.stars ?? 0} />
                    <span className="mt-0.5 block truncate text-[15px] font-semibold text-[#2b2724]">{r.title}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-[#bdb3a6] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </FilesPage>
  );
}

/** "6×6 ──── 8" — grid size grows across the tier. */
function SizeRamp({ min, max, color }: { min: number; max: number; color: string }) {
  return (
    <div className="ml-auto flex items-center gap-2 text-[12px] font-bold text-[#8a8178]" title="Grid size grows with the case number">
      <span>
        {min}×{min}
      </span>
      <span
        aria-hidden
        className="h-[3px] w-14 rounded-full sm:w-20"
        style={{ background: `linear-gradient(90deg, ${color}40, ${color})` }}
      />
      <span style={{ color }}>
        {max}×{max}
      </span>
    </div>
  );
}
