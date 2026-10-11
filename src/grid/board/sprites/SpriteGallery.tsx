import { useState, type CSSProperties, type JSX } from 'react';
import { DISTRICTS } from '../../skins/districts';
import type { District, WallStyle } from '../../skins/types';
import { FURNITURE_LABEL, OCCUPIABLE, type FurnitureKind } from '../../types';
import { KINDS, KIND_ORDER } from './kinds';
import { drawSprite } from './render';
import { WALL_STYLES } from './styles';

const GLOW_ID = 'sprite-gallery-glow';
const title = (k: FurnitureKind) => {
  const n = FURNITURE_LABEL[k].a.replace(/^(an?|some)\s+/i, '');
  return n.charAt(0).toUpperCase() + n.slice(1);
};

function Tile({ kind, d, cell, orient, single }: { kind: FurnitureKind; d: District; cell: number; orient: 'h' | 'v'; single: boolean }): JSX.Element {
  const two = KINDS[kind].stretch && !single;
  const w = two && orient === 'h' ? 200 : 100;
  const h = two && orient === 'v' ? 200 : 100;
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

/** Dev gallery: every furniture kind in every district style. */
export function SpriteGallery(): JSX.Element {
  const [cell, setCell] = useState(90);
  const [orient, setOrient] = useState<'h' | 'v'>('h');
  const [single, setSingle] = useState(false);
  const [only, setOnly] = useState<WallStyle | 'all'>('all');
  const districts = WALL_STYLES.map((s) => DISTRICTS.find((d) => d.wall === s)).filter((d): d is District => !!d);
  const shown = only === 'all' ? districts : districts.filter((d) => d.wall === only);
  const btn = (on: boolean): CSSProperties => ({
    padding: '4px 10px', borderRadius: 6, border: '1px solid #555', cursor: 'pointer',
    background: on ? '#e7c27d' : '#1c1a17', color: on ? '#120e0b' : '#eee', font: '12px Inter, system-ui, sans-serif',
  });
  return (
    <div style={{ background: '#0d0c0b', color: '#eee', minHeight: '100vh', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id={GLOW_ID} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={3.2} />
          </filter>
        </defs>
      </svg>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <strong style={{ marginRight: 8 }}>Sprite gallery</strong>
        {[26, 48, 90].map((c) => (
          <button key={c} style={btn(cell === c)} onClick={() => setCell(c)}>{c}px</button>
        ))}
        <span style={{ width: 12 }} />
        <button style={btn(orient === 'h')} onClick={() => setOrient('h')}>2-cell horizontal</button>
        <button style={btn(orient === 'v')} onClick={() => setOrient('v')}>2-cell vertical</button>
        <button style={btn(single)} onClick={() => setSingle(!single)}>all 1-cell</button>
        <span style={{ width: 12 }} />
        <button style={btn(only === 'all')} onClick={() => setOnly('all')}>all styles</button>
        {WALL_STYLES.map((s) => (
          <button key={s} style={btn(only === s)} onClick={() => setOnly(s)}>{s}</button>
        ))}
      </div>
      {shown.map((d) => (
        <section key={d.id} data-style={d.wall} style={{ background: d.palette.sheet, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px', color: d.palette.wall === d.palette.sheet ? d.palette.ink : d.palette.bg, mixBlendMode: 'normal', font: '600 14px Inter, sans-serif' }}>
            <span style={{ background: d.palette.bg, color: d.palette.ink, padding: '2px 8px', borderRadius: 4 }}>
              {d.wall} · {d.name}
            </span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: cell < 40 ? 6 : 10, alignItems: 'flex-start' }}>
            {KIND_ORDER.map((k) => (
              <figure key={k} style={{ margin: 0 }} title={k}>
                <Tile kind={k} d={d} cell={cell} orient={orient} single={single} />
                {cell >= 48 && (
                  <figcaption style={{ font: '10px Inter, sans-serif', color: d.palette.bg, background: `${d.palette.ink}cc`, marginTop: 2, padding: '0 3px', borderRadius: 2 }}>
                    {title(k)}{OCCUPIABLE[k] ? ' · sit' : ''}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
