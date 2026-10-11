import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/Toast';
import { LanternLoader, SkinProvider, useFpReduced } from '@/grid/ui';
import { PendingScreen } from '@/grid/ui/fallbacks';
import { AchievementToast } from '@/grid/meta';
import { PwaRoot } from '@/pwa';
import Landing from '@/screens/Landing';

// ───────────────────────────── lazy screens ─────────────────────────────
// Hub (this module's owner).
const BureauHub = lazy(() => import('@/grid/screens/hub/BureauHub'));
const DistrictScreen = lazy(() => import('@/grid/screens/hub/DistrictScreen'));
const CaseRack = lazy(() => import('@/grid/screens/hub/CaseRack'));
const ModesScreen = lazy(() => import('@/grid/screens/hub/ModesScreen'));

// Desk and modes are owned by other modules. They are resolved through import.meta.glob so the
// app keeps running while a module is still missing (a placeholder screen is shown instead).
type Loader = () => Promise<unknown>;
const SOURCES: Loader[] = [
  ...Object.values(import.meta.glob('/src/grid/screens/desk/index.{ts,tsx}')),
  ...Object.values(import.meta.glob('/src/grid/screens/modes/index.{ts,tsx}')),
];

function lazyNamed(name: string, title: string) {
  return lazy(async () => {
    for (const load of SOURCES) {
      const mod = (await load()) as Record<string, unknown>;
      const C = mod[name];
      if (typeof C === 'function' || (typeof C === 'object' && C !== null)) return { default: C as ComponentType };
    }
    if (import.meta.env.DEV) console.warn(`[floorplan] screen "${name}" not found yet — showing placeholder`);
    return { default: () => <PendingScreen title={title} /> };
  });
}

const CaseDesk = lazyNamed('CaseDesk', 'Case desk');
const DailyDesk = lazyNamed('DailyDesk', 'Today’s case');
const BlitzScreen = lazyNamed('BlitzScreen', 'Blitz');
const GauntletScreen = lazyNamed('GauntletScreen', 'Gauntlet');
const WeeklyDesk = lazyNamed('WeeklyDesk', 'Weekly Mastermind');
const ZenScreen = lazyNamed('ZenScreen', 'Zen');
const CustomScreen = lazyNamed('CustomScreen', 'Custom & codes');
const CodeDesk = lazyNamed('CodeDesk', 'Case by code');
const ProfileScreen = lazy(() => import('@/grid/meta').then((m) => ({ default: m.ProfileScreen })));

// ───────────────────────────── shell ─────────────────────────────

/** Route transition: a short horizontal "file slide". */
function FileSlide({ children }: { children: ReactNode }) {
  const reduced = useFpReduced();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0, transition: { duration: reduced ? 0.12 : 0.34, ease: [0.22, 1, 0.36, 1] } }}
      exit={reduced ? { opacity: 0, transition: { duration: 0.08 } } : { opacity: 0, x: -36, transition: { duration: 0.18, ease: 'easeIn' } }}
    >
      {children}
    </motion.div>
  );
}

const Loading = () => (
  <SkinProvider className="min-h-dvh" style={{ background: 'var(--fp-bg)' }}>
    <LanternLoader />
  </SkinProvider>
);

function Shell() {
  const location = useLocation();
  const page = (el: ReactNode) => (
    <FileSlide>
      <Suspense fallback={<Loading />}>{el}</Suspense>
    </FileSlide>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-x-clip">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={page(<Landing />)} />

            <Route path="/plans" element={page(<BureauHub />)} />
            <Route path="/plans/modes" element={page(<ModesScreen />)} />
            <Route path="/plans/daily" element={page(<DailyDesk />)} />
            <Route path="/plans/blitz" element={page(<BlitzScreen />)} />
            <Route path="/plans/gauntlet" element={page(<GauntletScreen />)} />
            <Route path="/plans/weekly" element={page(<WeeklyDesk />)} />
            <Route path="/plans/zen" element={page(<ZenScreen />)} />
            <Route path="/plans/custom" element={page(<CustomScreen />)} />
            <Route path="/plans/code/:code" element={page(<CodeDesk />)} />
            <Route path="/plans/profile" element={page(<ProfileScreen />)} />
            <Route path="/plans/d/:district" element={page(<DistrictScreen />)} />
            <Route path="/plans/d/:district/:tier" element={page(<CaseRack />)} />
            <Route path="/plans/d/:district/:tier/:n" element={page(<CaseDesk />)} />

            {/* retired routes: story mode and v1 Crime Files */}
            <Route path="/files/*" element={<Navigate to="/plans" replace />} />
            <Route path="/cases/*" element={<Navigate to="/plans" replace />} />
            <Route path="/case/*" element={<Navigate to="/plans" replace />} />
            <Route path="/codex/*" element={<Navigate to="/plans" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster />
        <AchievementToast />
        <PwaRoot />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
