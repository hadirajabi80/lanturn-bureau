import { motion } from 'motion/react';
import { useState } from 'react';
import { sound } from '../audio/sound';
import type { AiLevel } from '../engine/ai';
import { useGame, type GameMode } from '../store/game';
import { THEMES, type ThemeId } from '../textures/themes';
import { CheckerChip } from './common';
import { fa } from './fa';
import { BookIcon, CogIcon } from './icons';

const LENGTHS = [1, 3, 5, 7];
const LEVELS: { id: AiLevel; label: string; hint: string }[] = [
  { id: 'easy', label: 'آسان', hint: 'برای شروع' },
  { id: 'medium', label: 'متوسط', hint: 'چالشی' },
  { id: 'hard', label: 'سخت', hint: 'بی‌رحم' },
];
const PREFS_KEY = 'nard.menu.v1';

interface Prefs {
  names: [string, string];
  mode: GameMode;
  level: AiLevel;
  len: number;
}
function loadPrefs(fallbackNames: [string, string]): Prefs {
  const base: Prefs = { names: fallbackNames, mode: 'pvp', level: 'medium', len: 3 };
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') };
  } catch {
    return base;
  }
}

export function MainMenu({ onSettings, onRules }: { onSettings: () => void; onRules: () => void }) {
  const stored = useGame((s) => s.players);
  const hasSave = useGame((s) => s.hasSave);
  const themeId = useGame((s) => s.settings.theme);
  const update = useGame((s) => s.updateSettings);
  const newMatch = useGame((s) => s.newMatch);
  const resume = useGame((s) => s.resume);
  const [prefs] = useState(() => loadPrefs(stored));
  const [names, setNames] = useState<[string, string]>(prefs.names);
  const [len, setLen] = useState(prefs.len);
  const [mode, setMode] = useState<GameMode>(prefs.mode);
  const [level, setLevel] = useState<AiLevel>(prefs.level);
  const theme = THEMES[themeId];

  const start = () => {
    sound.unlock();
    sound.click();
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ names, mode, level, len }));
    } catch {
      /* ignore */
    }
    const first = names[0].trim() || (mode === 'ai' ? 'شما' : 'بازیکن ۱');
    const second = mode === 'ai' ? 'رایانه' : names[1].trim() || 'بازیکن ۲';
    newMatch([first, second], len, mode, level);
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
  };

  return (
    <motion.div className="menu-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }}>
      <motion.div
        className="menu-card glass"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="title">
            تخته نرد
          </motion.div>
          <motion.div variants={item} className="subtitle">
            نرد ایرانی · سه‌بعدی
          </motion.div>

          <motion.div variants={item}>
            <div className="seg mode-seg">
              {(['pvp', 'ai'] as GameMode[]).map((m) => (
                <button
                  key={m}
                  className={mode === m ? 'on' : ''}
                  onClick={() => {
                    sound.click();
                    setMode(m);
                  }}
                >
                  {m === 'pvp' ? 'دو نفره' : 'با رایانه'}
                  <small>{m === 'pvp' ? 'کنار هم، روی یک دستگاه' : 'تک‌نفره'}</small>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="field-label">{mode === 'ai' ? 'نام شما' : 'بازیکنان'}</div>
            {(mode === 'ai' ? [0] : [0, 1]).map((i) => (
              <div className="name-row" key={i}>
                <CheckerChip look={theme.checkers[i]} />
                <input
                  value={names[i]}
                  maxLength={18}
                  placeholder={mode === 'ai' ? 'شما' : `بازیکن ${fa(i + 1)}`}
                  onChange={(e) => {
                    const n: [string, string] = [...names];
                    n[i] = e.target.value;
                    setNames(n);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && start()}
                />
                <span className="tag">{theme.checkers[i].label}</span>
              </div>
            ))}
          </motion.div>

          {mode === 'ai' && (
            <motion.div variants={item} initial="hidden" animate="show">
              <div className="field-label">
                سطح رایانه <span style={{ opacity: 0.7 }}>· رایانه با مهره‌های {theme.checkers[1].label} بازی می‌کند</span>
              </div>
              <div className="seg">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    className={level === l.id ? 'on' : ''}
                    onClick={() => {
                      sound.click();
                      setLevel(l.id);
                    }}
                  >
                    {l.label}
                    <small>{l.hint}</small>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={item}>
            <div className="field-label">مسابقه تا</div>
            <div className="seg">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  className={len === l ? 'on' : ''}
                  onClick={() => {
                    sound.click();
                    setLen(l);
                  }}
                >
                  {fa(l)}
                  <small>امتیاز</small>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="field-label">تخته</div>
            <div className="themes">
              {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                const t = THEMES[id];
                return (
                  <button
                    key={id}
                    className={`theme-card ${id === themeId ? 'on' : ''}`}
                    onClick={() => {
                      sound.click();
                      update({ theme: id });
                    }}
                  >
                    <div
                      className="theme-swatch"
                      style={{
                        background: `linear-gradient(135deg, ${t.swatch[0]} 0 30%, ${t.swatch[1]} 30% 70%, ${t.swatch[0]} 70%)`,
                        boxShadow: `inset 0 0 0 3px ${t.swatch[0]}, inset 0 0 0 4px ${t.swatch[2]}`,
                      }}
                    >
                      <svg viewBox="0 0 60 38" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                        {[0, 1, 2, 3, 4].map((k) => (
                          <polygon key={k} points={`${8 + k * 10},38 ${13 + k * 10},14 ${18 + k * 10},38`} fill={k % 2 ? t.pointA : t.pointB} opacity="0.95" />
                        ))}
                      </svg>
                    </div>
                    {t.name}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={item} className="menu-actions">
            <button className="btn btn-gold" onClick={start}>
              شروع بازی
            </button>
            {hasSave && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  sound.unlock();
                  sound.click();
                  resume();
                }}
              >
                ادامهٔ بازی قبلی
              </button>
            )}
          </motion.div>

          <motion.div variants={item} className="menu-foot">
            <button className="btn btn-ghost btn-sm" onClick={onRules}>
              <BookIcon /> قوانین
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onSettings}>
              <CogIcon /> تنظیمات
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
