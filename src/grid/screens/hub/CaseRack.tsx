import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dices } from 'lucide-react';
import { getDistrict, TIER_INFO } from '@/grid/skins/districts';
import { VARIANTS_BY_TIER, type Variant } from '@/grid/types';
import {
  BrassButton,
  Chip,
  KeyTag,
  MonoStat,
  PageShell,
  Panel,
  Plate,
  ProgressFilament,
  SkinProvider,
  VARIANT_INFO,
  VariantGlyph,
  isLightDistrict,
  parseTierParam,
  useFpReduced,
} from '@/grid/ui';
import { caseStatusOf, isScorched, puzzleId, sizeFor, tierTally, titleOf, useProgressMap, variantOf, useDistrictAmbience } from '@/grid/ui/bridge';

type Filter = 'all' | 'unsolved' | 'solved';

/** /plans/d/:district/:tier — a rack of brass key tags, one per case. */
export default function CaseRack() {
  const { district: id, tier: tierParam } = useParams<{ district: string; tier: string }>();
  const d = id ? getDistrict(id) : undefined;
  const tier = parseTierParam(tierParam);
  const navigate = useNavigate();
  const reduced = useFpReduced();
  const progress = useProgressMap();
  const [filter, setFilter] = useState<Filter>('all');
  const [variant, setVariant] = useState<Variant | null>(null);

  useDistrictAmbience(d?.ambience ?? null);

  const cases = useMemo(() => {
    if (!d || !tier) return [];
    return Array.from({ length: d.casesPerTier[tier] }, (_, i) => {
      const n = i + 1;
      return { n, size: sizeFor(tier, n), variant: variantOf(tier, n), title: titleOf(d.id, tier, n) };
    });
  }, [d, tier]);

  if (!d) return <Navigate to="/plans" replace />;
  if (!tier) return <Navigate to={`/plans/d/${d.id}`} replace />;

  const info = TIER_INFO[tier];
  const light = isLightDistrict(d);
  const t = tierTally(progress, d.id, tier);
  const presentVariants = VARIANTS_BY_TIER[tier].filter((v) => cases.some((c) => c.variant === v));

  const shown = cases.filter((c) => {
    const p = progress[puzzleId(d.id, tier, c.n)];
    if (filter === 'solved' && !p?.solved) return false;
    if (filter === 'unsolved' && p?.solved) return false;
    if (variant && c.variant !== variant) return false;
    return true;
  });

  const randomUnsolved = () => {
    const pool = cases.filter((c) => !progress[puzzleId(d.id, tier, c.n)]?.solved);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) navigate(`/plans/d/${d.id}/${tier}/${pick.n}`);
  };

  return (
    <SkinProvider district={d}>
      <PageShell title={`${info.name} files`} kicker={`${d.name} · ${info.floor}`} back={`/plans/d/${d.id}`} backLabel={`Back to ${d.name}`}>
        <Panel className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Plate>{info.name}</Plate>
              <span className="font-mono text-[11px] text-(--fp-muted)">{info.sizes}</span>
            </div>
            <p className="mt-2 text-sm text-(--fp-muted)">{info.blurb}</p>
            <ProgressFilament value={t.total ? t.solved / t.total : 0} className="mt-3 max-w-md" label={`${info.name} progress`} />
          </div>
          <div className="flex items-center gap-6">
            <MonoStat label="Closed" value={`${t.solved}/${t.total}`} />
            <MonoStat label="Stars" value={t.stars} />
          </div>
          <BrassButton onClick={randomUnsolved} disabled={t.solved >= t.total} icon={<Dices className="size-4" />}>
            Random unsolved
          </BrassButton>
        </Panel>

        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="toolbar" aria-label="Filter cases">
          {(['all', 'unsolved', 'solved'] as const).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'unsolved' ? 'Unsolved' : 'Solved'}
            </Chip>
          ))}
          {presentVariants.length > 1 && <span aria-hidden className="mx-1 w-px shrink-0 self-stretch bg-(--fp-muted) opacity-25" />}
          {presentVariants.length > 1 &&
            presentVariants.map((v) => (
              <Chip key={v} active={variant === v} onClick={() => setVariant(variant === v ? null : v)} icon={<VariantGlyph variant={v} size={13} />} title={VARIANT_INFO[v].line}>
                {VARIANT_INFO[v].name}
              </Chip>
            ))}
        </div>

        {/* the rack: a pegboard */}
        <div
          className="fp-panel fp-panel--inset mt-4 p-3 pb-10 sm:p-5 sm:pb-12"
          style={{
            backgroundImage:
              light
                ? 'radial-gradient(circle at 12px 12px, color-mix(in srgb, var(--fp-accent) 30%, transparent) 2px, transparent 2.6px), linear-gradient(180deg, #ffffff, color-mix(in srgb, var(--fp-bg) 80%, white))'
                : 'radial-gradient(circle at 12px 12px, rgb(0 0 0 / 0.45) 2px, transparent 2.6px), linear-gradient(180deg, color-mix(in srgb, var(--fp-panel) 70%, var(--fp-bg)), color-mix(in srgb, var(--fp-bg) 85%, black))',
            backgroundSize: '24px 24px, auto',
          }}
        >
          {shown.length === 0 ? (
            <p className="py-16 text-center text-sm text-(--fp-muted)">No files match this filter.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-x-2.5 gap-y-5 min-[360px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              <AnimatePresence initial={!reduced} mode="popLayout">
                {shown.map((c, i) => {
                  const p = progress[puzzleId(d.id, tier, c.n)];
                  return (
                    <motion.li
                      key={c.n}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, y: -14, rotate: -6 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: reduced ? 0 : Math.min(i, 24) * 0.018, type: 'spring', stiffness: 380, damping: 18 }}
                      className="relative flex flex-col items-center pt-3"
                      style={{ transformOrigin: '50% 0' }}
                    >
                      {/* peg + string */}
                      <span
                        aria-hidden
                        className="absolute top-0 size-2.5 rounded-full"
                        style={{ background: 'linear-gradient(180deg, var(--fp-accent2), var(--fp-accent))', boxShadow: '0 1px 2px #000' }}
                      />
                      <KeyTag
                        number={c.n}
                        size={c.size}
                        variant={c.variant}
                        title={c.title}
                        status={caseStatusOf(p)}
                        stars={p?.stars ?? 0}
                        burns={isScorched(p) ? Math.max(1, p?.burns ?? 1) : 0}
                        to={`/plans/d/${d.id}/${tier}/${c.n}`}
                        className="max-w-[112px]"
                      />
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-(--fp-muted)" aria-label="Legend">
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-(--fp-accent) opacity-50" /> New
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-(--fp-danger)" /> Pinned (in progress)
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-(--fp-accent2)" /> Closed (stars)
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ background: 'radial-gradient(circle, #1a0a02 40%, #b4501a)' }} /> Scorched (burned attempt)
          </li>
        </ul>
      </PageShell>
    </SkinProvider>
  );
}
