import { useState, type CSSProperties, type JSX } from 'react';
import { DISTRICTS } from '../../skins/districts';
import type { District, WallStyle } from '../../skins/types';
import { OCCUPIABLE, type FurnitureKind } from '../../types';
import { KINDS, KIND_ORDER } from './kinds';
import { FURNITURE_NAMES } from './names';
import { drawSprite } from './render';
import { WALL_STYLES } from './styles';

const GLOW_ID = 'sprite-gallery-glow';

type Shape = '1' | 'h' | 'v';
type ShapeMode = 'all' | Shape;

function Tile({ kind, d, cell, shape }: { kind: FurnitureKind; d: District; cell: number; shape: Shape }): JSX.Element {
  const w = shape === 'h' ? 200 : 100;
  const h = shape === 'v' ? 200 : 100;
  const pal = d.palette;
  const floor = pal.rooms[KIND_ORDER.indexOf(kind) % pal.rooms.length];
  const grid: string[] = [];
  for (let x = 100; x < w; x += 100) grid.push(`M${x} 0V${h}`);
  for (let y = 100; y < h; y += 100) grid.push(`M0 ${y}H${w}`);
  return (
    <svg width={(w / 100) * cell} height={(h / 100) * cell} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', borderRadius: 3 }}>
      <rect width={w} height={h} fill={floor} />
      <path d={`${grid.join('')}M0.5 0.5H${w - 0.5}V${h - 0.5}H0.5Z`} fill="none" stroke={pal.wall} strokeOpacity={0.25} strokeWidth={1} />
      {drawSprite(kind, { w, h, style: d.wall, palette: pal, seed: 1234 + KIND_ORDER.indexOf(kind), glowId: GLOW_ID })}
    </svg>
  );
}

function param(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

/**
 * Dev gallery: every furniture kind in every district style.
 * Deep links: ?cell=48&style=ink&kind=chair&shape=v (shape: all | 1 | h | v).
 */
export function SpriteGallery(): JSX.Element {
  const [cell, setCell] = useState(() => Number(param('cell')) || 90);
  const [shape, setShape] = useState<ShapeMode>(() => (param('shape') as ShapeMode | null) ?? '1');
  const [only, setOnly] = useState<WallStyle | 'all'>(() => (param('style') as WallStyle | null) ?? 'all');
  const [kindOnly, setKindOnly] = useState<FurnitureKind | 'all'>(() => (param('kind') as FurnitureKind | null) ?? 'all');
  const districts = WALL_STYLES.map((s) => DISTRICTS.find((d) => d.wall === s)).filter((d): d is District => !!d);
  const shown = only === 'all' ? districts : districts.filter((d) => d.wall === only);
  const kinds = kindOnly === 'all' ? KIND_ORDER : [kindOnly];
  const btn = (on: boolean): CSSProperties => ({
    padding: '4px 10px', borderRadius: 6, border: '1px solid #555', cursor: 'pointer',
    background: on ? '#e7c27d' : '#1c1a17', color: on ? '#120e0b' : '#eee', font: '12px Inter, system-ui, sans-serif',
  });
  const shapesFor = (k: FurnitureKind): Shape[] => {
    const stretch = KINDS[k].stretch;
    if (shape === 'all') return stretch ? ['1', 'h', 'v'] : ['1'];
    if (shape === '1' || !stretch) return ['1'];
    return [shape];
  };
  return (
    <div style={{ background: '#0d0c0b', color: '#eee', minHeight: '100vh', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id={GLOW_ID} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={3} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <strong style={{ marginRight: 8 }}>Sprite gallery</strong>
        {[26, 40, 48, 60, 90].map((c) => (
          <button key={c} style={btn(cell === c)} onClick={() => setCell(c)}>{c}px</button>
        ))}
        <span style={{ width: 12 }} />
        {(['1', 'h', 'v', 'all'] as const).map((s) => (
          <button key={s} style={btn(shape === s)} onClick={() => setShape(s)}>
            {s === '1' ? '1-cell' : s === 'h' ? '2-cell horizontal' : s === 'v' ? '2-cell vertical' : 'all shapes'}
          </button>
        ))}
        <span style={{ width: 12 }} />
        <button style={btn(only === 'all')} onClick={() => setOnly('all')}>all styles</button>
        {WALL_STYLES.map((s) => (
          <button key={s} style={btn(only === s)} onClick={() => setOnly(s)}>{s}</button>
        ))}
        <select value={kindOnly} onChange={(e) => setKindOnly(e.target.value as FurnitureKind | 'all')} style={{ ...btn(false), padding: '3px 6px' }}>
          <option value="all">all kinds</option>
          {KIND_ORDER.map((k) => (
            <option key={k} value={k}>{FURNITURE_NAMES[k]}</option>
          ))}
        </select>
      </div>
      {shown.map((d) => (
        <section key={d.id} data-style={d.wall} style={{ background: d.palette.sheet, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px', font: '600 14px Inter, sans-serif' }}>
            <span style={{ background: d.palette.bg, color: d.palette.ink, padding: '2px 8px', borderRadius: 4 }}>
              {d.wall} · {d.name}
            </span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: cell < 40 ? 6 : 10, alignItems: 'flex-start' }}>
            {kinds.flatMap((k) =>
              shapesFor(k).map((s) => (
                <figure key={`${k}-${s}`} style={{ margin: 0 }} title={k}>
                  <Tile kind={k} d={d} cell={cell} shape={s} />
                  {cell >= 48 && (
                    <figcaption style={{ font: '10px Inter, sans-serif', color: d.palette.bg, background: `${d.palette.ink}cc`, marginTop: 2, padding: '0 3px', borderRadius: 2 }}>
                      {FURNITURE_NAMES[k]}{OCCUPIABLE[k] ? ' · sit' : ''}
                    </figcaption>
                  )}
                </figure>
              )),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
