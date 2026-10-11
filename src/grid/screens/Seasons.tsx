import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Check, ChevronRight, GraduationCap, Star } from 'lucide-react';
import { getIcon } from '@/components/ui/ClueIcon';
import { SEASONS, dailyPuzzle } from '@/grid/engine';
import { seasonProgress, useFiles } from '@/grid/store';
import type { Puzzle, Season } from '@/grid/types';
import { FilesHeader, FilesPage } from '@/grid/components/FilesPage';
import { IconSquare } from '@/grid/components/IconSquare';
import { ProgressBar } from '@/grid/components/ProgressBar';
import { Stars } from '@/grid/components/StatusPill';
import { C, TIER_META, prettyDate, todayISO } from '@/grid/components/theme';

const isSpecial = (s: Season) => s.id === 'academy' || s.themeId === 'academy';

/** /files — season list with the Daily Case on top. */
export default function Seasons() {
  const progress = useFiles((s) => s.progress);
  const totalStars = useMemo(() => Object.values(progress).reduce((a, p) => a + p.stars, 0), [progress]);
  let seasonNo = 0;

  return (
    <FilesPage>
      <FilesHeader
        back="/"
        backLabel="Home"
        eyebrow="Lantern Bureau"
        title="Crime Files"
        right={
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-bold shadow-[0_6px_16px_-10px_rgb(70_45_20/0.4)] ring-1 ring-black/5">
            <Star className="size-4 text-[#f2b01e]" fill="#f2b01e" /> {totalStars}
          </span>
        }
      />

      <div className="flex flex-col gap-5">
        <DailyCard />
        {SEASONS.map((season: Season, i: number) => {
          const special = isSpecial(season);
          if (!special) seasonNo++;
          const p = seasonProgress(progress, season);
          return (
            <motion.div
              key={season.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
            >
              <FolderCard to={`/files/${season.id}`} accent={season.accent}>
                <IconSquare icon={special ? getIcon(season.icon, GraduationCap) : getIcon(season.icon)} color={season.accent} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: season.accent }}>
                      {special ? 'Special Season' : `Season ${seasonNo}`}
                    </span>
                    {special && (
                      <span className="rounded-full bg-[#e6f3e8] px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-[#2f7d43]">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="truncate font-display text-xl font-black leading-tight">{season.name}</div>
                  <div className="mt-0.5 truncate text-[13px] text-[#8a8178]">
                    {p.solved}/{p.total} cases{season.subtitle ? ` · ${season.subtitle}` : ''}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-lg font-black tabular-nums">{pct(p.solved, p.total)}%</span>
                  <ChevronRight className="size-5 text-[#bdb3a6]" />
                </div>
                <ProgressBar
                  className="mt-1 basis-full"
                  value={p.total ? p.solved / p.total : 0}
                  color={season.accent}
                  label={`${season.name} progress`}
                />
              </FolderCard>
            </motion.div>
          );
        })}
      </div>
    </FilesPage>
  );
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

/** White card with a folder tab on its top-left edge. */
function FolderCard({ to, accent, children }: { to: string; accent: string; children: ReactNode }) {
  return (
    <Link to={to} className="group relative block pt-2.5 outline-none">
      <span
        aria-hidden
        className="absolute left-0 top-0 h-4 w-[38%] rounded-t-[12px] bg-white"
        style={{ clipPath: 'polygon(0 0, 86% 0, 100% 100%, 0 100%)' }}
      />
      <span aria-hidden className="absolute left-3 top-[5px] h-[3px] w-10 rounded-full" style={{ background: accent }} />
      <div
        className="relative flex flex-wrap items-center gap-3.5 rounded-[18px] rounded-tl-none bg-white p-4 shadow-[0_10px_26px_-16px_rgb(70_45_20/0.45)] ring-1 ring-black/[0.04] transition-transform group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[#e8632b]"
      >
        {children}
      </div>
    </Link>
  );
}

function DailyCard() {
  const today = todayISO();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const progress = useFiles((s) => (puzzle ? s.progress[puzzle.id] : undefined));

  // Generate after first paint so the season list never waits on the generator.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        setPuzzle(dailyPuzzle(today));
      } catch {
        setPuzzle(null);
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [today]);

  const tier = puzzle ? TIER_META[puzzle.tier] : null;

  return (
    <FolderCard to="/files/daily" accent={C.orange}>
      <IconSquare icon={CalendarDays} color={C.orange} solid />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e8632b]">Daily Case</span>
          {tier && (
            <span
              className="rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-wider"
              style={{ background: `${tier.color}1f`, color: tier.color }}
            >
              {tier.label}
            </span>
          )}
        </div>
        <div className="truncate font-display text-xl font-black leading-tight">{prettyDate(today)}</div>
        <div className="mt-0.5 truncate text-[13px] text-[#8a8178]">{puzzle ? puzzle.title : 'A fresh case every day'}</div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {progress?.solved ? (
          <>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f3e8] px-2 py-0.5 text-[11px] font-bold text-[#2f7d43]">
              <Check className="size-3" strokeWidth={3} /> Closed
            </span>
            <Stars value={progress.stars} size={13} />
          </>
        ) : (
          <span className="rounded-full bg-[#e8632b] px-3 py-1 text-[12px] font-bold text-white shadow-[0_8px_16px_-10px_#e8632b]">
            {progress?.inProgress ? 'Resume' : 'Play'}
          </span>
        )}
      </div>
    </FolderCard>
  );
}
