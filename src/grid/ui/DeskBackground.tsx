export interface DeskBackgroundProps {
  /** v2 option (dust motes); ignored by the printed look. */
  dust?: boolean;
  /** v2 option (lamp strength); ignored by the printed look. */
  lamp?: number;
}

/**
 * The page behind every Floorplan screen: plain paper with a faint graph-paper grid, like the
 * squared pages of a case notebook (docs/PRINT-DESIGN.md). Fixed, full-viewport, pointer-events none.
 * Must sit inside a <SkinProvider>.
 */
export function DeskBackground(_props: DeskBackgroundProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundColor: 'var(--fp-bg)',
        backgroundImage:
          'linear-gradient(to right, rgb(20 20 20 / 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgb(20 20 20 / 0.055) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}
