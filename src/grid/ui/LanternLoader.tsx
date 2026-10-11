/** A small swinging brass lantern — Suspense fallback / loading indicator. Uses --fp-* vars when available. */
export function LanternLoader({ label = 'Lighting the lamp…', size = 56 }: { label?: string; size?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50dvh] flex-col items-center justify-center gap-4">
      <svg viewBox="0 0 48 72" width={size} height={size * 1.5} aria-hidden className="fp-lantern-swing overflow-visible">
        <defs>
          <radialGradient id="fp-ll-glow">
            <stop offset="0" stopColor="var(--fp-glow, #FFB347)" stopOpacity="0.8" />
            <stop offset="1" stopColor="var(--fp-glow, #FFB347)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <line x1="24" y1="0" x2="24" y2="12" stroke="var(--fp-accent, #C9974A)" strokeWidth="1.5" />
        <circle cx="24" cy="14" r="3" fill="none" stroke="var(--fp-accent, #C9974A)" strokeWidth="1.5" />
        <circle cx="24" cy="44" r="24" fill="url(#fp-ll-glow)" className="fp-lantern-flame" />
        <path d="M14 22h20l-3 6H17z" fill="var(--fp-accent, #C9974A)" />
        <rect x="16" y="28" width="16" height="26" rx="2" fill="color-mix(in srgb, var(--fp-glow, #FFB347) 30%, transparent)" stroke="var(--fp-accent, #C9974A)" strokeWidth="1.5" />
        <path d="M24 34c3 4 3 8 0 11-3-3-3-7 0-11z" fill="var(--fp-glow, #FFB347)" className="fp-lantern-flame" />
        <path d="M14 54h20l-2 5H16z" fill="var(--fp-accent, #C9974A)" />
      </svg>
      <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--fp-muted, #A8977D)' }}>{label}</span>
    </div>
  );
}
