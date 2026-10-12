import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dices, MapPin } from 'lucide-react';
import { getDistrict, TIER_INFO } from '@/grid/skins/districts';
import { VARIANTS_BY_TIER, type Variant } from '@/grid/types';
import {
  BrassButton,
  Chip,
  KeyTag,
  PageShell,
  Panel,
  ProgressFilament,
  SkinProvider,
  VARIANT_INFO,
  VariantGlyph,
  SkullKeyGlyph,
  AtticChain,
  parseTierParam,
  useFpReduced,
} from '@/grid/ui';
import { caseStatusOf, isScorched, puzzleId, sizeFor, tierTally, titleOf, useProgressMap, variantOf, useDistrictAmbience } from '@/grid/ui/bridge';
import { roman, Swatch } from './shared';

type Filter = 'all' | 'unsolved' | 'solved';

/** /plans/d/:district/:tier — the floor's case cards, one per case. */
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
  const sealed = tier === 'ultra';
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
        <div className="flex flex-col gap-5 border-b-2 border-(--fp-ink) pb-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-(--fp-muted)">
              <Swatch />
              <span className="text-(--fp-ink)">{d.name}</span>
              <span aria-hidden>·</span>
              <span>District {roman(d.number)}</span>
              <span aria-hidden>·</span>
              <span>{info.floor}</span>
            </div>
            <h2 className="fp-display mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-(--fp-ink)">
              {sealed && <SkullKeyGlyph size={34} className="shrink-0 text-(--attic-red)" />}
              {info.name} files
            </h2>
            {sealed && (
              <div className="fp-attic mt-3 flex items-center gap-3 rounded-md px-3 py-2 shadow-[inset_0_0_0_2px_var(--fp-ink)]">
                <span className="fp-attic-plate">No coordinates</span>
                <span className="min-w-0 flex-1 text-[14px] font-semibold">Read the room. Every clue is about people, furniture and rooms, never rows or columns.</span>
                <AtticChain width={64} className="hidden shrink-0 text-(--attic-muted) sm:block" />
              </div>
            )}
            <p className="mt-2 text-[15px] text-(--fp-muted)">
              {info.blurb} <span className="whitespace-nowrap">Grids <span className="font-mono text-(--fp-ink)">{info.sizes}</span>.</span>
            </p>
          </div>
          <BrassButton onClick={randomUnsolved} disabled={t.solved >= t.total} icon={<Dices className="size-4" />} className="self-start md:self-auto">
            Random unsolved
          </BrassButton>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
          <dl className="flex gap-8">
            <div>
              <dt className="text-[12px] font-semibold text-(--fp-muted)">Closed</dt>
              <dd className="font-mono text-lg font-semibold tabular-nums text-(--fp-ink)">
                {t.solved}
                <span className="text-(--fp-muted)">/{t.total}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold text-(--fp-muted)">Stars</dt>
              <dd className="font-mono text-lg font-semibold tabular-nums text-(--fp-ink)">{t.stars}</dd>
            </div>
          </dl>
          <ProgressFilament value={t.total ? t.solved / t.total : 0} className="mb-2 w-full max-w-md sm:w-auto sm:min-w-48 sm:flex-1" label={`${info.name} progress`} />
        </div>

        <div className="no-scrollbar -mx-4 mt-5 flex items-center gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0" role="toolbar" aria-label="Filter cases">
          <span className="mr-1 shrink-0 text-[13px] font-semibold text-(--fp-muted)">Show</span>
          {(['all', 'unsolved', 'solved'] as const).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'unsolved' ? 'Unsolved' : 'Solved'}
            </Chip>
          ))}
          {presentVariants.length > 1 && <span aria-hidden className="mx-1 h-6 w-[2px] shrink-0 bg-(--fp-hair)" />}
          {presentVariants.length > 1 &&
            presentVariants.map((v) => (
              <Chip key={v} active={variant === v} onClick={() => setVariant(variant === v ? null : v)} icon={<VariantGlyph variant={v} size={13} />} title={VARIANT_INFO[v].line}>
                {VARIANT_INFO[v].name}
              </Chip>
            ))}
        </div>

        <Panel className="mt-4 p-3 pb-10 sm:p-5 sm:pb-12">
          {shown.length === 0 ? (
            <p className="py-16 text-center text-[15px] text-(--fp-muted)">No files match this filter.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-x-3 gap-y-4 min-[360px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              <AnimatePresence initial={!reduced} mode="popLayout">
                {shown.map((c, i) => {
                  const p = progress[puzzleId(d.id, tier, c.n)];
                  return (
                    <motion.li
                      key={c.n}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: reduced ? 0 : Math.min(i, 24) * 0.012, type: 'spring', stiffness: 520, damping: 32 }}
                      className="relative flex flex-col items-center hover:z-30 focus-within:z-30"
                    >
                      <KeyTag
                        number={c.n}
                        size={c.size}
                        variant={c.variant}
                        title={c.title}
                        status={caseStatusOf(p)}
                        stars={p?.stars ?? 0}
                        burns={isScorched(p) ? Math.max(1, p?.burns ?? 1) : 0}
                        to={`/plans/d/${d.id}/${tier}/${c.n}`}
                        sealed={sealed}
                        className="max-w-[112px]"
                      />
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </Panel>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-medium text-(--fp-muted)" aria-label="Legend">
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-[3px] bg-(--fp-panel) shadow-[inset_0_0_0_1.5px_var(--fp-ink)]" /> New
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-grid size-3 place-items-center rounded-[3px] bg-[color-mix(in_srgb,var(--fp-hl)_55%,white)] shadow-[inset_0_0_0_1.5px_var(--fp-ink)]" />
            <MapPin className="-ml-1 size-3 fill-(--fp-danger) text-(--fp-ink)" aria-hidden strokeWidth={2} /> Pinned (in progress)
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-[3px] bg-[#e3f1e7] shadow-[inset_0_0_0_1.5px_var(--fp-ink)]" /> Closed (stars)
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-[3px] bg-(--fp-panel) shadow-[inset_0_0_0_1.5px_var(--fp-ink)]">
              <span className="m-[3px] block size-1.5 rounded-full bg-(--fp-ink)" />
            </span>{' '}
            Scorched (burned attempt)
          </li>
        </ul>
      </PageShell>
    </SkinProvider>
  );
}
