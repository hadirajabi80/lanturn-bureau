import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronLeft } from 'lucide-react';

let mounted = 0;
let restoreTimer = 0;

/**
 * Light cream wrapper for every /files/* screen. While mounted it also paints the document
 * background cream (overscroll / page-transition gaps) and restores the dark app afterwards.
 */
export function FilesPage({ children, className }: { children: ReactNode; className?: string }) {
  useEffect(() => {
    mounted++;
    window.clearTimeout(restoreTimer);
    const html = document.documentElement;
    html.style.colorScheme = 'light';
    document.body.style.background = '#f3ede4';
    return () => {
      mounted--;
      // Deferred so hopping between two /files pages never flashes the dark app background.
      restoreTimer = window.setTimeout(() => {
        if (mounted > 0) return;
        html.style.colorScheme = '';
        document.body.style.background = '';
      }, 80);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-[#f3ede4] font-body text-[#2b2724]" style={{ colorScheme: 'light' }}>
      <div className={clsx('mx-auto w-full max-w-[560px] px-4 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]', className)}>
        {children}
      </div>
    </div>
  );
}

export interface FilesHeaderProps {
  back?: string;
  backLabel?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  right?: ReactNode;
}

/** Back button + eyebrow + big title header used on the list screens. */
export function FilesHeader({ back, backLabel = 'Back', eyebrow, title, right }: FilesHeaderProps) {
  return (
    <header className="mb-5 flex items-center gap-3 pt-2">
      {back && <BackButton to={back} label={backLabel} />}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a8178]">{eyebrow}</div>
        )}
        <h1 className="truncate font-display text-[26px] font-black leading-tight text-[#2b2724]">{title}</h1>
      </div>
      {right}
    </header>
  );
}

export function BackButton({ to, label = 'Back', onClick }: { to: string; label?: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#2b2724] shadow-[0_6px_16px_-10px_rgb(70_45_20/0.4)] ring-1 ring-black/5 transition-transform hover:-translate-x-0.5"
    >
      <ChevronLeft className="size-5" strokeWidth={2.6} />
    </Link>
  );
}
