import { useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '@/engine/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

function Toggle({ checked, onChange, label, description, icon }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/6 bg-fog/40 p-3.5 hover:border-brass/30">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brass/10 text-brass">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-paper">{label}</span>
        <span className="block text-xs text-paper/55">{description}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={clsx(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-lantern',
          checked ? 'border-brass bg-brass/80' : 'border-white/15 bg-ink',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 size-4.5 rounded-full bg-paper shadow transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </span>
    </label>
  );
}

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useGame((s) => s.settings);
  const setMuted = useGame((s) => s.setMuted);
  const setReducedFx = useGame((s) => s.setReducedFx);
  const resetProgress = useGame((s) => s.resetProgress);
  const [confirmReset, setConfirmReset] = useState(false);

  const close = () => {
    setConfirmReset(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} eyebrow="Bureau settings" title="Desk drawer" size="md">
      <div className="space-y-3">
        <Toggle
          checked={settings.muted}
          onChange={setMuted}
          label="Mute sound"
          description="Silence the blips, chimes and drumrolls."
          icon={settings.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        />
        <Toggle
          checked={settings.reducedFx}
          onChange={setReducedFx}
          label="Reduce effects"
          description="Fewer shakes, sparkles and flying glass. The logic stays the same."
          icon={<Sparkles className="size-4" />}
        />
        <div className="rounded-xl border border-crimson/25 bg-crimson/5 p-3.5">
          <div className="font-semibold text-paper">Reset progress</div>
          <p className="mt-0.5 text-xs text-paper/55">Burns every solved file, rank and open investigation. Hestia will be quietly devastated.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {confirmReset ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                  Keep my files
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<RotateCcw className="size-3.5" />}
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                    toast('All files returned to the archive. Fresh start, Rookie.', 'warn');
                    onClose();
                  }}
                >
                  Yes, burn it all
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" icon={<RotateCcw className="size-3.5" />} onClick={() => setConfirmReset(true)}>
                Reset progress…
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
