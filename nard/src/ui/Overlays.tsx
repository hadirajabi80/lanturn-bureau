import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { sound } from '../audio/sound';
import { useGame } from '../store/game';
import { THEMES } from '../textures/themes';
import { CheckerChip, Modal, Switch } from './common';
import { fa, WIN_LABEL } from './fa';
import { CrownIcon } from './icons';

export function ToastLayer() {
  const toast = useGame((s) => s.toast);
  const [shown, setShown] = useState(toast);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const ms = toast.tone === 'hit' ? 900 : toast.tone === 'warn' ? 1900 : 1500;
    const t = setTimeout(() => setShown((cur) => (cur?.id === toast.id ? null : cur)), ms);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {shown && (
          <motion.div
            key={shown.id}
            className={`toast ${shown.tone}`}
            initial={shown.tone === 'hit' ? { opacity: 0, scale: 2.2, rotate: -8 } : { opacity: 0, y: 18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: -16, scale: shown.tone === 'hit' ? 1.3 : 0.96, transition: { duration: 0.28 } }}
            transition={{ type: 'spring', stiffness: shown.tone === 'hit' ? 520 : 340, damping: shown.tone === 'hit' ? 16 : 24 }}
          >
            <div className="t">{shown.text}</div>
            {shown.sub && <div className="s">{shown.sub}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Lightweight canvas confetti in board colors. */
export function Confetti({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    resize();
    const colors = ['#f6dfa0', '#e2bd6b', '#c9a24a', '#f3ead9', '#8a2128', '#1c6b70', '#ffffff'];
    const parts = Array.from({ length: 220 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? -20 : innerWidth + 20,
        y: innerHeight * (0.55 + Math.random() * 0.3),
        vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 9),
        vy: -(10 + Math.random() * 12),
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        c: colors[(Math.random() * colors.length) | 0],
        delay: Math.random() * 25,
        flip: Math.random() * Math.PI,
      };
    });
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame++;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const p of parts) {
        if (frame < p.delay) {
          alive++;
          continue;
        }
        p.vy += 0.32;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.flip += 0.12;
        if (p.y < innerHeight + 40) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, c.width, c.height);
    };
  }, [active]);
  return <canvas ref={ref} className="confetti" />;
}

export function GameOver() {
  const result = useGame((s) => s.result);
  const phase = useGame((s) => s.phase);
  const players = useGame((s) => s.players);
  const score = useGame((s) => s.score);
  const len = useGame((s) => s.matchLength);
  const theme = THEMES[useGame((s) => s.settings.theme)];
  const nextGame = useGame((s) => s.nextGame);
  const setScreen = useGame((s) => s.setScreen);
  const mode = useGame((s) => s.mode);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (phase === 'gameover' && result) {
      const t = setTimeout(() => setOpen(true), 1100);
      return () => clearTimeout(t);
    }
    setOpen(false);
  }, [phase, result]);

  if (!result) return null;
  const w = result.winner;
  return (
    <>
      <Confetti active={open && (mode === 'pvp' || w === 0)} />
      <Modal open={open}>
        <div className="result">
          <motion.div className="crown" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.15 }}>
            <CrownIcon />
          </motion.div>
          <div className="winner">
            {mode === 'ai'
              ? w === 0
                ? result.matchOver
                  ? 'قهرمان شدید!'
                  : 'بردید!'
                : result.matchOver
                  ? 'رایانه مسابقه را برد'
                  : 'رایانه برد'
              : result.matchOver
                ? `${players[w]} قهرمان شد!`
                : `${players[w]} برد`}
          </div>
          <div className="kind">
            {WIN_LABEL[result.kind]} · {fa(result.points)} امتیاز
          </div>
          <div className="board-score">
            {[0, 1].map((p, i) => (
              <div key={p} style={{ display: 'contents' }}>
                {i === 1 && <span className="vs">—</span>}
                <div className="side">
                  <CheckerChip look={theme.checkers[p]} />
                  <motion.span
                    className="v"
                    initial={p === w ? { scale: 1.6, color: '#f6dfa0' } : false}
                    animate={{ scale: 1, color: '#f6eedd' }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 14 }}
                  >
                    {fa(score[p])}
                  </motion.span>
                  <span className="n">{players[p]}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>مسابقه تا {fa(len)} امتیاز</div>
        </div>
        <div className="modal-actions">
          <button
            className="btn btn-gold"
            onClick={() => {
              sound.click();
              setOpen(false);
              nextGame();
            }}
          >
            {result.matchOver ? 'مسابقهٔ دوباره' : 'بازی بعدی'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              sound.click();
              setOpen(false);
              setScreen('menu');
            }}
          >
            منوی اصلی
          </button>
        </div>
      </Modal>
    </>
  );
}

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useGame((st) => st.settings);
  const update = useGame((st) => st.updateSettings);
  return (
    <Modal open={open} onClose={onClose}>
      <h2>تنظیمات</h2>
      <div className="setting-row">
        <div>
          <div className="lbl">صدا</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.volume}
            disabled={s.muted}
            onChange={(e) => update({ volume: Number(e.target.value) })}
            onPointerUp={() => sound.checker(0)}
          />
          <Switch on={!s.muted} onChange={(v) => update({ muted: !v })} />
        </div>
      </div>
      <div className="setting-row">
        <div>
          <div className="lbl">کیفیت گرافیک بالا</div>
          <div className="desc">درخشش، سایهٔ دقیق و لبه‌های نرم — برای گوشی‌های ضعیف خاموش کنید</div>
        </div>
        <Switch on={s.quality === 'high'} onChange={(v) => update({ quality: v ? 'high' : 'low' })} />
      </div>
      <div className="setting-row">
        <div>
          <div className="lbl">چرخش صفحه برای هر بازیکن</div>
          <div className="desc">وقتی روبه‌روی هم نشسته‌اید (تبلت روی میز)</div>
        </div>
        <Switch on={s.rotateBoard} onChange={(v) => update({ rotateBoard: v })} />
      </div>
      <div className="setting-row">
        <div>
          <div className="lbl">پرتاب خودکار تاس</div>
          <div className="desc">تاس‌ها در شروع هر نوبت خودشان ریخته می‌شوند</div>
        </div>
        <Switch on={s.autoRoll} onChange={(v) => update({ autoRoll: v })} />
      </div>
      <div className="setting-row">
        <div>
          <div className="lbl">پایان خودکار نوبت</div>
          <div className="desc">بدون نیاز به تأیید، پس از آخرین حرکت</div>
        </div>
        <Switch on={s.autoEnd} onChange={(v) => update({ autoEnd: v })} />
      </div>
      <div className="setting-row" style={{ borderBottom: 0 }}>
        <div>
          <div className="lbl">نمایش شمارش پیپ</div>
          <div className="desc">مجموع خانه‌هایی که هر بازیکن تا پایان باید طی کند</div>
        </div>
        <Switch on={s.showPips} onChange={(v) => update({ showPips: v })} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-gold" onClick={onClose}>
          تأیید
        </button>
      </div>
    </Modal>
  );
}

export function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2>قوانین تخته نرد</h2>
      <div className="rules">
        <p>
          هر بازیکن ۱۵ مهره دارد. هدف این است که همهٔ مهره‌ها را به <b>خانهٔ خودتان</b> (شش خانهٔ سمت راست، نزدیک به خودتان) برسانید و
          سپس از تخته <b>خارج</b> کنید. هر کس زودتر همه را خارج کند برنده است.
        </p>
        <ul>
          <li>
            <b>سفید</b> (پایین) خلاف جهت عقربه‌های ساعت و <b>سیاه</b> (بالا) در جهت مخالف حرکت می‌کند.
          </li>
          <li>هر تاس یک حرکت است؛ <b>جفت</b> یعنی چهار حرکت.</li>
          <li>روی خانه‌ای که حریف دو مهره یا بیشتر دارد نمی‌توان نشست.</li>
          <li>
            نشستن روی تک‌مهرهٔ حریف یعنی <b>زدن</b>؛ مهرهٔ زده‌شده به وسط تخته (بار) می‌رود و تا وارد نشود، صاحبش حرکت دیگری ندارد.
          </li>
          <li>باید بیشترین تعداد تاس ممکن را بازی کنید؛ اگر فقط یکی ممکن است، تاس بزرگ‌تر اجباری است.</li>
          <li>خروج فقط وقتی مجاز است که هر ۱۵ مهره در خانهٔ خودتان باشند.</li>
        </ul>
        <p>
          <b>امتیاز:</b> برد ساده ۱، <b>مارس</b> (حریف هیچ مهره‌ای خارج نکرده) ۲، و <b>مارس کامل</b> (حریف مهره‌ای در بار یا خانهٔ شما دارد) ۳ امتیاز.
        </p>
        <p>
          <b>کنترل‌ها:</b> مهره را لمس کنید تا مقصدها روشن شوند، سپس مقصد را لمس کنید — یا مهره را بکشید و رها کنید. دو بار لمس سریع، مهره را
          با تاس بزرگ‌تر حرکت می‌دهد. Space پرتاب، Enter پایان نوبت، Ctrl+Z برگشت.
        </p>
      </div>
      <div className="modal-actions">
        <button className="btn btn-gold" onClick={onClose}>
          متوجه شدم
        </button>
      </div>
    </Modal>
  );
}

export function PauseMenu({ onSettings, onRules }: { onSettings: () => void; onRules: () => void }) {
  const open = useGame((s) => s.menuOpen);
  const setMenuOpen = useGame((s) => s.setMenuOpen);
  const setScreen = useGame((s) => s.setScreen);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setConfirm(false), [open]);
  return (
    <Modal open={open} onClose={() => setMenuOpen(false)}>
      <h2>منو</h2>
      <div className="modal-actions" style={{ marginTop: 0 }}>
        <button className="btn btn-gold" onClick={() => setMenuOpen(false)}>
          ادامهٔ بازی
        </button>
        <button className="btn btn-ghost" onClick={onSettings}>
          تنظیمات
        </button>
        <button className="btn btn-ghost" onClick={onRules}>
          قوانین
        </button>
        {!confirm ? (
          <button className="btn btn-ghost" onClick={() => setConfirm(true)}>
            خروج به منوی اصلی
          </button>
        ) : (
          <button
            className="btn btn-ghost"
            style={{ borderColor: 'var(--danger)', color: '#ffb8a8' }}
            onClick={() => {
              setMenuOpen(false);
              setScreen('menu');
            }}
          >
            مطمئنید؟ بازی ذخیره می‌شود و می‌توانید ادامه دهید
          </button>
        )}
      </div>
    </Modal>
  );
}
