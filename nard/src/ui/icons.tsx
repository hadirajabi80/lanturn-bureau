const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const MenuIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const UndoIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M15 7l5 5-5 5" />
    <path d="M20 12H9a5 5 0 0 1 0-10h1" transform="translate(0 5)" />
  </svg>
);
export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
export const DiceIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
  </svg>
);
export const SoundIcon = ({ muted }: { muted: boolean }) => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    {muted ? <path d="M17 9l5 5M22 9l-5 5" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
  </svg>
);
export const CogIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);
export const BookIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </svg>
);
export const CrownIcon = () => (
  <svg viewBox="0 0 64 64" fill="currentColor">
    <path d="M8 22l12 10 12-18 12 18 12-10-5 26H13L8 22z" opacity="0.95" />
    <rect x="13" y="50" width="38" height="5" rx="2" />
    <circle cx="8" cy="20" r="3.5" />
    <circle cx="32" cy="11" r="3.5" />
    <circle cx="56" cy="20" r="3.5" />
  </svg>
);
export const RotateIcon = () => (
  <svg viewBox="0 0 24 24" {...base}>
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);
