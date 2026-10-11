import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { initPhysics } from './physics/dice';
import { Scene } from './scene/Scene';
import { useGame } from './store/game';
import { themeTextures } from './textures/generate';
import { THEMES } from './textures/themes';
import { Hud } from './ui/Hud';
import { MainMenu } from './ui/MainMenu';
import { GameOver, PauseMenu, RulesModal, SettingsModal, ToastLayer } from './ui/Overlays';

export default function App() {
  const screen = useGame((s) => s.screen);
  const themeId = useGame((s) => s.settings.theme);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      await initPhysics();
      // let the loader paint before the (synchronous) texture generation
      await new Promise((r) => setTimeout(r, 50));
      themeTextures(THEMES[useGame.getState().settings.theme]);
      try {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
      } catch {
        /* ignore */
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => useGame.getState().intro(), 400);
    return () => clearTimeout(t);
  }, [ready]);

  // generate other themes' textures lazily, right when chosen
  useEffect(() => {
    if (ready) themeTextures(THEMES[themeId]);
  }, [themeId, ready]);

  const openMenu = useCallback(() => useGame.getState().setMenuOpen(true), []);

  return (
    <>
      {ready && <Scene />}
      <AnimatePresence>
        {!ready && (
          <motion.div className="loading" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div>
              <div className="mark">تخته نرد</div>
              <div className="bar">
                <i />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ready && screen === 'menu' && <MainMenu key="menu" onSettings={() => setSettingsOpen(true)} onRules={() => setRulesOpen(true)} />}
      </AnimatePresence>
      <AnimatePresence>{screen === 'game' && <Hud key="hud" onMenu={openMenu} />}</AnimatePresence>
      {screen === 'game' && (
        <>
          <ToastLayer />
          <GameOver />
          <PauseMenu onSettings={() => setSettingsOpen(true)} onRules={() => setRulesOpen(true)} />
        </>
      )}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  );
}
