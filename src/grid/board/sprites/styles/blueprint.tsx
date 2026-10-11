import type { JSX } from 'react';
import { shapeBox, type Box } from '../core/geom';
import type { Pen } from '../core/pen';
import type { StyleDef } from './types';

/** Frostmere Observatory — crisp white technical drawing: 10% white fills, section hatch, dimension marks. */

function dimensions(pen: Pen): JSX.Element | null {
  if (pen.solids.length === 0) return null;
  let b: Box | null = null;
  for (const { s } of pen.solids) {
    const q = shapeBox(s);
    if (!b) b = { ...q };
    else {
      const x1 = Math.max(b.x + b.w, q.x + q.w);
      const y1 = Math.max(b.y + b.h, q.y + q.h);
      b.x = Math.min(b.x, q.x);
      b.y = Math.min(b.y, q.y);
      b.w = x1 - b.x;
      b.h = y1 - b.y;
    }
  }
  if (!b) return null;
  const W = pen.p.wall;
  const f = (n: number) => n.toFixed(1);
  let d = '';
  const tick = (x: number, y: number) => {
    d += `M${f(x - 1.8)} ${f(y + 1.8)}L${f(x + 1.8)} ${f(y - 1.8)}`;
  };
  const els: JSX.Element[] = [];
  // horizontal dimension above the piece
  const yT = b.y - 4.5;
  if (yT > 1.5) {
    d += `M${f(b.x)} ${f(yT)}H${f(b.x + b.w)}`;
    d += `M${f(b.x)} ${f(b.y - 1)}V${f(yT - 2)}M${f(b.x + b.w)} ${f(b.y - 1)}V${f(yT - 2)}`;
    tick(b.x, yT);
    tick(b.x + b.w, yT);
    if (b.w > 34 && yT > 6) {
      els.push(
        <text key="w" x={f(b.x + b.w / 2)} y={f(yT - 1.6)} fontSize={4.4} fill={W} fillOpacity={0.8} textAnchor="middle" fontFamily="'JetBrains Mono', ui-monospace, monospace">
          {(b.w * 0.009).toFixed(2)}
        </text>,
      );
    }
  }
  // vertical dimension left of the piece
  const xL = b.x - 4.5;
  if (xL > 1.5) {
    d += `M${f(xL)} ${f(b.y)}V${f(b.y + b.h)}`;
    d += `M${f(b.x - 1)} ${f(b.y)}H${f(xL - 2)}M${f(b.x - 1)} ${f(b.y + b.h)}H${f(xL - 2)}`;
    tick(xL, b.y);
    tick(xL, b.y + b.h);
  }
  // centre marks on round solids
  for (const { s } of pen.solids) {
    if (s.t !== 'ell') continue;
    const r = Math.min(s.rx, s.ry) * 0.25;
    d += `M${f(s.cx - r)} ${f(s.cy)}H${f(s.cx + r)}M${f(s.cx)} ${f(s.cy - r)}V${f(s.cy + r)}`;
  }
  return (
    <g>
      <path d={d} fill="none" stroke={W} strokeWidth={0.5} strokeOpacity={0.75} />
      {els}
    </g>
  );
}

export const blueprint: StyleDef = {
  id: 'blueprint',
  rough: 0,
  body: (_m, open, p) =>
    open
      ? { fill: p.wall, fillOpacity: 0, stroke: p.wall, sw: 1.15, strokeOpacity: 0.9 }
      : { fill: p.wall, fillOpacity: 0.1, stroke: p.wall, sw: 1.6, strokeOpacity: 1 },
  line: (fine, p) => (fine ? { stroke: p.wall, sw: 0.65, opacity: 0.7 } : { stroke: p.wall, sw: 1.05, opacity: 0.92 }),
  accent: (p) => ({ fill: p.wall, fillOpacity: 0.22, stroke: p.wall, sw: 0.9, strokeOpacity: 1, line: p.wall }),
  texture: () => null,
  shade: (p) => ({ kind: 'lines', angle: 45, spacing: 3.2, sw: 0.5, color: p.wall, opacity: 0.55 }),
  shadow: () => null,
  rule: (open, p) => (open ? { stroke: p.wall, sw: 0.55, opacity: 0.5, inset: 3, dash: '2.5 2' } : null),
  glint: () => null,
  glass: (p) => ({ fill: p.wall, opacity: 0.06, streak: p.wall, streakOpacity: 0.5 }),
  glow: () => null,
  barInner: (p) => p.rooms[0] ?? '#174A93',
  tints: (p) => [p.wall],
  font: "'JetBrains Mono', ui-monospace, monospace",
  text: (p) => p.wall,
  decorate: dimensions,
};
