import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { BookUser, FolderOpen, Lamp, Settings, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '@/engine/store';
import { IconButton } from '@/components/ui/IconButton';
import { SettingsModal } from './SettingsModal';

export function TopBar() {
  const muted = useGame((s) => s.settings.muted);
  const setMuted = useGame((s) => s.setMuted);
  const [settings, setSettings] = useState(false);

  const nav = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors',
      isActive ? 'bg-brass/12 text-lantern' : 'text-paper/60 hover:text-paper',
    );

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="group flex items-center gap-2" aria-label="Lantern Bureau home">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-b from-lantern to-brass-dim text-ink shadow-[0_0_18px_-4px_var(--color-lantern)] transition-transform group-hover:-rotate-6">
            <Lamp className="size-4.5" strokeWidth={2.4} />
          </span>
          <span className="hidden font-display text-lg font-black tracking-wide sm:inline">
            Lantern <span className="text-brass">Bureau</span>
          </span>
        </Link>
        <nav className="ml-2 flex items-center gap-1">
          <NavLink to="/cases" className={nav}>
            <FolderOpen className="size-4" /> Files
          </NavLink>
          <NavLink to="/codex" className={nav}>
            <BookUser className="size-4" /> Codex
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <IconButton
            size="sm"
            label={muted ? 'Unmute sound' : 'Mute sound'}
            icon={muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            onClick={() => setMuted(!muted)}
          />
          <IconButton size="sm" label="Settings" icon={<Settings className="size-4" />} onClick={() => setSettings(true)} />
        </div>
      </div>
      <SettingsModal open={settings} onClose={() => setSettings(false)} />
    </header>
  );
}
