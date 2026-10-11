import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';
import { SEASONS } from '@/grid/engine';
import { tierProgress, useFiles } from '@/grid/store';
import { TIERS, type Season } from '@/grid/types';
import { FilesHeader, FilesPage } from '@/grid/components/FilesPage';
import { IconSquare } from '@/grid/components/IconSquare';
import { ProgressBar } from '@/grid/components/ProgressBar';
import { TIER_META, tierSizeRange } from '@/grid/components/theme';

/** /files/:season — "Choose difficulty". */
export default function Tiers() {
  const { season: seasonId } = useParams<{ season: string }>();
  const season = SEASONS.find((s: Season) => s.id === seasonId);
  const progress = useFiles((s) => s.progress);
  if (!season) return <Navigate to="/files" replace />;

  return (
    <FilesPage>
      <FilesHeader back="/files" backLabel="All seasons" eyebrow={season.name} title="Choose difficulty" />

      <div className="flex flex-col gap-3.5">
        {TIERS.map((tier, i) => {
          const meta = TIER_META[tier];
          const size = tierSizeRange(tier, season.casesPerTier);
          const p = tierProgress(progress, season.id, tier, season.casesPerTier);
          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
            >
              <Link
                to={`/files/${season.id}/${tier}`}
                className="group flex flex-wrap items-center gap-3.5 rounded-[20px] bg-white p-4 shadow-[0_10px_26px_-16px_rgb(70_45_20/0.45)] ring-1 ring-black/[0.04] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#e8632b]"
              >
                <IconSquare icon={meta.icon} color={meta.color} size={56} solid />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-xl font-black leading-tight">{meta.label}</div>
                  <div className="mt-0.5 text-[13px] text-[#8a8178]">
                    {size.min}×{size.min} – {size.max}×{size.max} · {size.min - 1}–{size.max - 1} suspects
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <div className="text-base font-black tabular-nums">
                      {p.solved}/{p.total}
                    </div>
                    <div className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#8a8178]">
                      <Star className="size-3 text-[#f2b01e]" fill="#f2b01e" />
                      {p.stars}/{p.total * 3}
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-[#bdb3a6] transition-transform group-hover:translate-x-0.5" />
                </div>
                <ProgressBar
                  className="mt-1 basis-full"
                  value={p.total ? p.solved / p.total : 0}
                  color={meta.color}
                  label={`${meta.label} progress`}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </FilesPage>
  );
}
