import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { getCase } from '@/data';
import { useGame, useIsUnlocked } from '@/engine/store';
import { sfx } from '@/engine/audio';
import { PageTransition } from '@/components/fx';
import { TopBar } from '@/components/game/TopBar';
import { Toaster } from '@/components/ui/Toast';
import Landing from '@/screens/Landing';
import CaseSelect from '@/screens/CaseSelect';
import CaseIntro from '@/screens/CaseIntro';
import Investigation from '@/screens/Investigation';
import Verdict from '@/screens/Verdict';
import Codex from '@/screens/Codex';
import Seasons from '@/grid/screens/Seasons';
import Tiers from '@/grid/screens/Tiers';
import CaseList from '@/grid/screens/CaseList';
import CaseScreen from '@/grid/screens/CaseScreen';

/** Redirects to the case list when the case does not exist or is still locked. */
function CaseGuard({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const exists = Boolean(id && getCase(id));
  const unlocked = useIsUnlocked(id);
  if (!exists || !unlocked) return <Navigate to="/cases" replace />;
  return <>{children}</>;
}

function Shell() {
  const location = useLocation();
  const muted = useGame((s) => s.settings.muted);
  const reducedFx = useGame((s) => s.settings.reducedFx);
  const isLanding = location.pathname === '/';
  // Crime Files screens (/files/*) have their own light headers.
  const isFiles = location.pathname === '/files' || location.pathname.startsWith('/files/');

  useEffect(() => {
    sfx.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    document.documentElement.dataset.reducedFx = reducedFx ? 'true' : 'false';
  }, [reducedFx]);

  const page = (el: ReactNode, guarded = false) => (
    <PageTransition>{guarded ? <CaseGuard>{el}</CaseGuard> : el}</PageTransition>
  );

  return (
    <MotionConfig reducedMotion={reducedFx ? 'always' : 'user'}>
      <div className="relative min-h-dvh overflow-x-clip">
        {!isLanding && !isFiles && <TopBar />}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={page(<Landing />)} />
            <Route path="/cases" element={page(<CaseSelect />)} />
            <Route path="/case/:id" element={page(<CaseIntro />, true)} />
            <Route path="/case/:id/play" element={page(<Investigation />, true)} />
            <Route path="/case/:id/verdict" element={page(<Verdict />, true)} />
            <Route path="/codex" element={page(<Codex />)} />
            <Route path="/files" element={page(<Seasons />)} />
            <Route path="/files/daily" element={page(<CaseScreen daily />)} />
            <Route path="/files/:season" element={page(<Tiers />)} />
            <Route path="/files/:season/:tier" element={page(<CaseList />)} />
            <Route path="/files/:season/:tier/:n" element={page(<CaseScreen />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster />
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
