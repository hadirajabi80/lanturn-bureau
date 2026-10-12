import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, Building2, LayoutGrid, UserRound } from 'lucide-react';
import { DeskBackground } from './DeskBackground';

export interface PageShellProps {
  title: ReactNode;
  /** Small line above the title. */
  kicker?: ReactNode;
  /** Back target (route). `true` = history back. Omitted = no back button. */
  back?: string | true;
  backLabel?: string;
  /** Right side of the header (chips, buttons). */
  right?: ReactNode;
  children: ReactNode;
  /** Render the lamp-lit desk background (default true). */
  background?: boolean;
  /** Hide the phone footer nav. */
  hideNav?: boolean;
  /** Extra classes for the <main> content container. */
  className?: string;
}

const NAV = [
  { to: '/plans', label: 'Bureau', icon: Building2, end: true },
  { to: '/plans/modes', label: 'Modes', icon: LayoutGrid, end: false },
  { to: '/plans/daily', label: 'Today', icon: CalendarDays, end: false },
  { to: '/plans/guide', label: 'Guide', icon: BookOpen, end: false },
  { to: '/plans/profile', label: 'Profile', icon: UserRound, end: false },
] as const;

/**
 * Page frame for every Floorplan screen: sticky header (back · kicker/title · right slot),
 * content capped at 1400 px, and a phone footer nav (Bureau · Modes · Today · Guide · Profile).
 * Place inside a <SkinProvider>.
 */
export function PageShell({ title, kicker, back, backLabel = 'Back', right, children, background = true, hideNav, className }: PageShellProps) {
  const navigate = useNavigate();
  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      {background && <DeskBackground />}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--fp-bg)',
          paddingTop: 'var(--safe-top)',
          boxShadow: 'inset 0 -2px 0 var(--fp-ink)',
        }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
          {back ? (
            back === true ? (
              <button type="button" onClick={() => navigate(-1)} className="fp-ghost size-9 shrink-0" aria-label={backLabel}>
                <ArrowLeft className="size-4" />
              </button>
            ) : (
              <Link to={back} className="fp-ghost size-9 shrink-0" aria-label={backLabel}>
                <ArrowLeft className="size-4" />
              </Link>
            )
          ) : (
            <Link to="/" className="grid size-9 shrink-0 place-items-center rounded-md bg-(--fp-ink) font-display text-[15px] font-black leading-none text-white" aria-label="Title screen">
              FM
            </Link>
          )}
          <div className="min-w-0 flex-1">
            {kicker && (
              <div className="truncate text-xs font-semibold text-(--fp-muted)">{kicker}</div>
            )}
            <h1 className="truncate font-display text-[clamp(1.1rem,0.95rem+0.7vw,1.45rem)] font-extrabold leading-tight text-(--fp-ink)">{title}</h1>
          </div>
          <nav aria-label="Floorplan" className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-(--fp-hl) text-(--fp-ink) shadow-[inset_0_0_0_1.5px_var(--fp-ink)]' : 'text-(--fp-muted) hover:text-(--fp-ink)',
                  ].join(' ')
                }
              >
                <Icon className="size-4" aria-hidden /> {label}
              </NavLink>
            ))}
          </nav>
          {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
        </div>
      </header>

      <main className={['mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 md:pb-10', className].filter(Boolean).join(' ')}>
        {children}
      </main>

      {!hideNav && (
        <nav
          aria-label="Floorplan"
          className="pb-safe fixed inset-x-0 bottom-0 z-40 md:hidden"
          style={{ background: 'var(--fp-panel)', boxShadow: 'inset 0 2px 0 var(--fp-ink)' }}
        >
          <div className="mx-auto grid max-w-md grid-cols-5">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors',
                    isActive ? 'text-(--fp-ink)' : 'text-(--fp-muted)',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="size-5" aria-hidden strokeWidth={isActive ? 2.2 : 1.8} />
                    {label}
                    <span
                      aria-hidden
                      className="h-[3px] w-6 rounded-full transition-opacity"
                      style={{ background: 'var(--fp-accent)', opacity: isActive ? 1 : 0 }}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
