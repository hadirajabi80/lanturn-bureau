import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { pipCount, type Player } from '../engine/rules';
import { sound } from '../audio/sound';
import { isAiTurn, useGame } from '../store/game';
import { THEMES } from '../textures/themes';
import { CheckerChip, MiniDie } from './common';
import { fa } from './fa';
import { CheckIcon, DiceIcon, MenuIcon, SoundIcon, UndoIcon } from './icons';

function Plate({ p }: { p: Player }) {
  const name = useGame((s) => s.players[p]);
  const turn = useGame((s) => s.turn);
  const phase = useGame((s) => s.phase);
  const pos = useGame((s) => s.pos);
  const showPips = useGame((s) => s.settings.showPips);
  const theme = THEMES[useGame((s) => s.settings.theme)];
  const active = turn === p && phase !== 'opening' && phase !== 'gameover';
  const isAi = useGame((s) => s.mode === 'ai' && p === 1);
  const level = useGame((s) => s.aiLevel);
  const off = pos.off[p];
  return (
    <motion.div className={`plate ${active ? 'active' : ''}`} layout>
      <AnimatePresence>
        {active && (
          <motion.span
            className="turn-dot"
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.8 }}
          >
            نوبت
          </motion.span>
        )}
      </AnimatePresence>
      <CheckerChip look={theme.checkers[p]} />
      <div className="who">
        <span className="name">
          {name}
          {isAi && <span className="lvl">{LEVEL_LABEL[level]}</span>}
        </span>
        <span className="meta">
          {showPips && (
            <span>
              <span className="pip-label">پیپ </span>
              <b>{fa(pipCount(pos, p))}</b>
            </span>
          )}
          {pos.bar[p] > 0 && <span style={{ color: '#ffb08a' }}>بار {fa(pos.bar[p])}</span>}
        </span>
        <div className="off-pips" title="مهره‌های خارج‌شده">
          {Array.from({ length: 15 }, (_, i) => (
            <i key={i} className={i < off ? 'on' : ''} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const LEVEL_LABEL = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' } as const;

function ScoreBox() {
  const score = useGame((s) => s.score);
  const len = useGame((s) => s.matchLength);
  return (
    <div className="scorebox glass">
      <div className="score">
        {fa(score[0])} <span style={{ opacity: 0.5 }}>—</span> {fa(score[1])}
      </div>
      <div className="len">تا {fa(len)} امتیاز</div>
    </div>
  );
}

function Dock() {
  const phase = useGame((s) => s.phase);
  const busy = useGame((s) => s.busy);
  const turn = useGame((s) => s.turn);
  const name = useGame((s) => s.players[s.turn]);
  const rolled = useGame((s) => s.rolled);
  const remaining = useGame((s) => s.remaining);
  const history = useGame((s) => s.history);
  const dice = useGame((s) => s.dice);
  const theme = THEMES[useGame((s) => s.settings.theme)];
  const aiTurn = useGame((s) => isAiTurn(s));
  const aiThinking = useGame((s) => s.aiThinking);
  const { roll, rollOpening, undo, endTurn } = useGame.getState();

  let content: React.ReactNode = null;
  let key: string = phase;

  if (aiTurn && phase !== 'gameover') {
    key = 'ai';
    const doubles = rolled[0] === rolled[1];
    const faces = rolled.length === 2 ? (doubles ? [rolled[0], rolled[0], rolled[0], rolled[0]] : rolled) : [];
    const usedFlags = doubles ? faces.map((_, i) => i >= remaining.length) : faces.map((v) => !remaining.includes(v));
    const skin = theme.dice[1];
    content = (
      <>
        {faces.length > 0 && (phase === 'move' || phase === 'done') && (
          <div className="mini-dice">
            {faces.map((v, i) => (
              <MiniDie key={i} value={v} used={usedFlags[i] || phase === 'done'} body={skin.body} pip={skin.pip} />
            ))}
          </div>
        )}
        <span className="ai-status">
          <span className="ai-dots">
            <i />
            <i />
            <i />
          </span>
          {phase === 'roll' || phase === 'rolling' ? 'رایانه تاس می‌ریزد' : aiThinking ? 'رایانه در حال فکر' : 'رایانه حرکت می‌کند'}
        </span>
      </>
    );
  } else if (phase === 'opening' && !busy) {
    content = (
      <>
        <span className="dock-hint">هر کس عدد بزرگ‌تر بیاورد شروع می‌کند</span>
        <button className="btn btn-gold" onClick={() => rollOpening()}>
          <DiceIcon /> پرتاب برای شروع <span className="kbd">Space</span>
        </button>
      </>
    );
  } else if (phase === 'roll' && !busy) {
    content = (
      <>
        <span className="dock-hint">نوبت {name}</span>
        <button className="btn btn-gold" onClick={() => roll()}>
          <DiceIcon /> پرتاب تاس <span className="kbd">Space</span>
        </button>
      </>
    );
  } else if ((phase === 'move' || phase === 'done') && rolled.length === 2) {
    key = 'move';
    const doubles = rolled[0] === rolled[1];
    const faces = doubles ? [rolled[0], rolled[0], rolled[0], rolled[0]] : rolled;
    const usedFlags = doubles ? faces.map((_, i) => i >= remaining.length) : faces.map((v) => !remaining.includes(v));
    const skins = dice?.skins ?? [turn, turn];
    content = (
      <>
        <div className="mini-dice">
          {faces.map((v, i) => {
            const skin = theme.dice[skins[Math.min(i, skins.length - 1)]];
            return <MiniDie key={i} value={v} used={usedFlags[i] || phase === 'done'} body={skin.body} pip={skin.pip} />;
          })}
        </div>
        <button className="btn btn-ghost btn-sm" disabled={busy || history.length === 0} onClick={() => undo()} title="برگشت (Ctrl+Z)">
          <UndoIcon /> برگشت
        </button>
        {phase === 'done' ? (
          <motion.button
            className="btn btn-gold btn-sm"
            disabled={busy}
            onClick={() => endTurn()}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <CheckIcon /> پایان نوبت <span className="kbd">Enter</span>
          </motion.button>
        ) : (
          <span className="dock-hint">{busy ? '…' : 'مهره‌ای را انتخاب کنید یا بکشید'}</span>
        )}
      </>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {content && (
        <motion.div
          key={key}
          className="dock glass"
          initial={{ opacity: 0, y: 30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 30, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          style={{ transform: undefined }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Hud({ onMenu }: { onMenu: () => void }) {
  const muted = useGame((s) => s.settings.muted);
  const update = useGame((s) => s.updateSettings);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState();
      if (s.screen !== 'game' || s.menuOpen || s.phase === 'gameover') return;
      if (isAiTurn(s) && e.key !== 'Escape') return;
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (s.phase === 'opening') s.rollOpening();
        else if (s.phase === 'roll') s.roll();
        else if (s.phase === 'done') s.endTurn();
      } else if (e.key === 'Enter') {
        if (s.phase === 'done') s.endTurn();
      } else if ((e.key === 'z' && (e.ctrlKey || e.metaKey)) || e.key === 'Backspace') {
        e.preventDefault();
        s.undo();
      } else if (e.key === 'Escape') {
        if (s.selected !== null) s.select(null);
        else onMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onMenu]);

  return (
    <motion.div className="ui-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <div className="hud-top">
        <button className="icon-btn" onClick={onMenu} aria-label="منو">
          <MenuIcon />
        </button>
        <div className="plates">
          <Plate p={0} />
          <ScoreBox />
          <Plate p={1} />
        </div>
        <button
          className="icon-btn sound-btn"
          aria-label="صدا"
          onClick={() => {
            update({ muted: !muted });
            sound.unlock();
          }}
        >
          <SoundIcon muted={muted} />
        </button>
      </div>
      <Dock />
    </motion.div>
  );
}
