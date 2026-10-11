// Procedural canvas textures: walnut grain, leather / felt field with inlaid points, khatam band, rosette.
import * as THREE from 'three';
import { clamp01, hex, makeNoise2D, mix, type RGB } from './noise';
import type { BoardTheme } from './themes';
import { HALF_D, HW, POINT_LEN, PW } from '../scene/layout';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

function toTexture(c: HTMLCanvasElement, srgb = true, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Long-grain walnut, grain runs along x. Returns color + bump (grain depth). */
export function woodTextures(theme: BoardTheme, seed = 7) {
  const W = 1024;
  const H = 512;
  const { fbm, noise } = makeNoise2D(seed);
  const col = canvas(W, H);
  const bump = canvas(W, H);
  const cx = col.getContext('2d')!;
  const bx = bump.getContext('2d')!;
  const img = cx.createImageData(W, H);
  const bimg = bx.createImageData(W, H);
  const dark = hex(theme.wood.dark);
  const mid = hex(theme.wood.mid);
  const light = hex(theme.wood.light);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Tileable-ish in x by sampling on a circle would be costly; we keep a wide texture instead.
      const warp = fbm(x * 0.0035, y * 0.012, 4) * 9;
      const ring = y * 0.045 + warp + fbm(x * 0.0012, y * 0.004, 2) * 6;
      const r = ring - Math.floor(ring);
      const band = Math.pow(Math.abs(Math.sin(r * Math.PI)), 0.6);
      const figure = fbm(x * 0.008, y * 0.02, 3);
      const pores = noise(x * 0.9, y * 0.06) * noise(x * 0.07, y * 1.4);
      let t = 0.15 + band * 0.55 + (figure - 0.5) * 0.5;
      t -= pores * 0.18;
      t = clamp01(t);
      const c: RGB = t < 0.5 ? mix(dark, mid, t * 2) : mix(mid, light, (t - 0.5) * 2);
      const o = (y * W + x) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
      const b = 140 + band * 60 - pores * 90;
      bimg.data[o] = bimg.data[o + 1] = bimg.data[o + 2] = b;
      bimg.data[o + 3] = 255;
    }
  }
  cx.putImageData(img, 0, 0);
  bx.putImageData(bimg, 0, 0);
  return { map: toTexture(col, true, true), bump: toTexture(bump, false, true) };
}

/** Leather / felt base with mottling, drawn into a 2D context region. */
function paintFieldBase(ctx: CanvasRenderingContext2D, W: number, H: number, theme: BoardTheme, seed: number) {
  const { fbm, noise } = makeNoise2D(seed);
  const img = ctx.createImageData(W, H);
  const base = hex(theme.field.base);
  const dark = hex(theme.field.dark);
  const felt = theme.field.kind === 'felt';
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const m = fbm(x * 0.006, y * 0.006, 4);
      const grain = felt ? noise(x * 0.8, y * 0.8) * 0.25 : noise(x * 0.35, y * 0.35) * 0.18 + fbm(x * 0.05, y * 0.05, 2) * 0.12;
      const t = clamp01(0.25 + m * 0.6 + grain - 0.2);
      const c = mix(dark, base, t);
      const o = (y * W + x) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function shade(color: string, amt: number): string {
  const c = hex(color);
  const t: RGB = amt < 0 ? mix(c, [0, 0, 0], -amt) : mix(c, [255, 255, 255], amt);
  return `rgb(${t[0] | 0},${t[1] | 0},${t[2] | 0})`;
}

/**
 * One half of the playing field (6 points top + 6 bottom). Both halves share the same
 * color pattern so the texture is used twice.
 */
export function fieldTexture(theme: BoardTheme) {
  const W = 1024;
  const H = Math.round((W * (2 * HALF_D)) / HW);
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  paintFieldBase(ctx, W, H, theme, 11);
  const s = W / HW; // px per unit
  const len = POINT_LEN * s;
  const half = (PW * s) / 2 - 3;

  // Inner shadow along the rim
  const edgeShade = (x0: number, y0: number, x1: number, y1: number) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    return g;
  };

  for (let row = 0; row < 2; row++) {
    for (let k = 0; k < 6; k++) {
      const cxp = (k + 0.5) * PW * s;
      const isA = row === 0 ? k % 2 === 1 : k % 2 === 0; // see layout: parity alternates across the board
      const color = isA ? theme.pointA : theme.pointB;
      const baseY = row === 0 ? H : 0;
      const tipY = row === 0 ? H - len : len;

      // body with soft gradient (darker at base → lighter toward tip)
      const g = ctx.createLinearGradient(0, baseY, 0, tipY);
      g.addColorStop(0, shade(color, -0.18));
      g.addColorStop(0.55, color);
      g.addColorStop(1, shade(color, 0.12));
      ctx.beginPath();
      ctx.moveTo(cxp - half, baseY);
      ctx.lineTo(cxp, tipY);
      ctx.lineTo(cxp + half, baseY);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();

      // fine longitudinal grain on the inlay
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = 0.07;
      for (let i = 0; i < 60; i++) {
        const x = cxp - half + Math.random() * half * 2;
        ctx.strokeStyle = Math.random() < 0.5 ? '#000' : '#fff';
        ctx.lineWidth = 0.6 + Math.random();
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x + (Math.random() - 0.5) * 6, tipY);
        ctx.stroke();
      }
      ctx.restore();

      // metal inlay outline
      ctx.beginPath();
      ctx.moveTo(cxp - half, baseY);
      ctx.lineTo(cxp, tipY);
      ctx.lineTo(cxp + half, baseY);
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // inner thin line
      const inset = 14;
      const dir = row === 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(cxp - half + inset * 0.9, baseY + dir * 4);
      ctx.lineTo(cxp, tipY - dir * inset * 2.2);
      ctx.lineTo(cxp + half - inset * 0.9, baseY + dir * 4);
      ctx.strokeStyle = `${theme.line}66`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // small diamond motif near the base
      const my = baseY + dir * 34;
      ctx.beginPath();
      ctx.moveTo(cxp, my - 9);
      ctx.lineTo(cxp + 7, my);
      ctx.lineTo(cxp, my + 9);
      ctx.lineTo(cxp - 7, my);
      ctx.closePath();
      ctx.fillStyle = theme.line;
      ctx.fill();
    }
  }

  // stitched border
  ctx.setLineDash([10, 7]);
  ctx.strokeStyle = `${theme.stitch}aa`;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(9, 9, W - 18, H - 18);
  ctx.setLineDash([]);

  ctx.fillStyle = edgeShade(0, 0, 40, 0);
  ctx.fillRect(0, 0, 40, H);
  ctx.fillStyle = edgeShade(W, 0, W - 40, 0);
  ctx.fillRect(W - 40, 0, 40, H);
  ctx.fillStyle = edgeShade(0, 0, 0, 40);
  ctx.fillRect(0, 0, W, 40);
  ctx.fillStyle = edgeShade(0, H, 0, H - 40);
  ctx.fillRect(0, H - 40, W, 40);

  return toTexture(c);
}

/** Plain field (used for the off-tray floor). */
export function trayTexture(theme: BoardTheme) {
  const W = 256;
  const H = 1024;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  paintFieldBase(ctx, W, H, theme, 5);
  ctx.setLineDash([10, 7]);
  ctx.strokeStyle = `${theme.stitch}88`;
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.setLineDash([]);
  const g = ctx.createLinearGradient(0, H / 2 - 30, 0, H / 2 + 30);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.5, `${theme.line}cc`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(20, H / 2 - 1.5, W - 40, 3);
  return toTexture(c);
}

/** Khatam-kari band: zig-zag tooth borders around a row of six-pointed stars. Tiles horizontally. */
export function khatamTexture(theme: BoardTheme) {
  const T = 128; // tile size
  const W = T * 8;
  const H = T;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  const k = theme.khatam;
  ctx.fillStyle = k.dark;
  ctx.fillRect(0, 0, W, H);

  // tooth rows
  const teeth = (y: number, h: number, flip: boolean) => {
    const n = W / 8;
    for (let i = 0; i < n; i++) {
      const x = i * 8;
      ctx.beginPath();
      if (!flip) {
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + 4, y);
        ctx.lineTo(x + 8, y + h);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4, y + h);
        ctx.lineTo(x + 8, y);
      }
      ctx.closePath();
      ctx.fillStyle = i % 2 ? k.bone : k.brass;
      ctx.fill();
    }
  };
  ctx.fillStyle = k.brass;
  ctx.fillRect(0, 2, W, 2);
  ctx.fillRect(0, H - 4, W, 2);
  teeth(6, 9, false);
  teeth(H - 15, 9, true);
  ctx.fillStyle = k.brass;
  ctx.fillRect(0, 17, W, 1.5);
  ctx.fillRect(0, H - 18.5, W, 1.5);

  const star = (cx: number, cy: number, r: number, fill: string, rot = 0) => {
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = rot + (i * Math.PI) / 6;
      const rr = i % 2 === 0 ? r : r * 0.58;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  const poly = (cx: number, cy: number, r: number, n: number, fill: string, rot = 0) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = rot + (i * 2 * Math.PI) / n;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  for (let i = 0; i < W / T + 1; i++) {
    const cx = i * T + T / 2;
    const cy = H / 2;
    poly(cx, cy, 40, 6, k.brass, Math.PI / 6);
    poly(cx, cy, 36, 6, k.dark, Math.PI / 6);
    star(cx, cy, 33, k.bone, -Math.PI / 2);
    poly(cx, cy, 15, 6, k.accentA, 0);
    star(cx, cy, 10, k.brass, -Math.PI / 2);
    poly(cx, cy, 3.5, 6, k.bone, 0);
    // ring of tiny triangles
    for (let j = 0; j < 6; j++) {
      const a = (j * Math.PI) / 3;
      poly(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24, 4, 3, k.accentB, a);
    }
    // in-between diamonds
    const dx = i * T;
    poly(dx, cy, 16, 4, k.bone, 0);
    poly(dx, cy, 11, 4, k.accentB, 0);
    poly(dx, cy, 5, 4, k.brass, 0);
    poly(dx, cy - 30, 6, 4, k.brass, 0);
    poly(dx, cy + 30, 6, 4, k.brass, 0);
  }
  return toTexture(c, true, true);
}

/** Circular khatam rosette for the center of the bar. */
export function rosetteTexture(theme: BoardTheme) {
  const S = 512;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  const k = theme.khatam;
  const cx = S / 2;
  ctx.clearRect(0, 0, S, S);
  const ring = (r: number, fill: string) => {
    ctx.beginPath();
    ctx.arc(cx, cx, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  ring(250, k.brass);
  ring(240, k.dark);
  // tooth ring
  const n = 72;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 0.5) / n) * Math.PI * 2;
    const a2 = ((i + 1) / n) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a0) * 236, cx + Math.sin(a0) * 236);
    ctx.lineTo(cx + Math.cos(a1) * 212, cx + Math.sin(a1) * 212);
    ctx.lineTo(cx + Math.cos(a2) * 236, cx + Math.sin(a2) * 236);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? k.bone : k.brass;
    ctx.fill();
  }
  ring(206, k.brass);
  ring(200, k.dark);
  // 12-point star
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12 - Math.PI / 2;
    const r = i % 2 === 0 ? 190 : 120;
    const x = cx + Math.cos(a) * r;
    const y = cx + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = k.bone;
  ctx.fill();
  ctx.strokeStyle = k.brass;
  ctx.lineWidth = 4;
  ctx.stroke();
  // petals
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * 140, cx + Math.sin(a) * 140, 22, 9, a, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? k.accentA : k.accentB;
    ctx.fill();
  }
  ring(108, k.brass);
  ring(100, k.accentA);
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const r = i % 2 === 0 ? 92 : 56;
    const x = cx + Math.cos(a) * r;
    const y = cx + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = k.bone;
  ctx.fill();
  ring(36, k.brass);
  ring(26, k.accentB);
  ring(10, k.bone);
  return toTexture(c);
}

/** Table cloth under the board: radial falloff baked in. */
export function tableTexture(theme: BoardTheme) {
  const S = 1024;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  const { noise } = makeNoise2D(3);
  const img = ctx.createImageData(S, S);
  const center = hex(theme.table.center);
  const edge = hex(theme.table.edge);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (x - S / 2) / (S / 2);
      const dy = (y - S / 2) / (S / 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      const t = clamp01(Math.pow(d, 1.4));
      const n = (noise(x * 0.9, y * 0.9) - 0.5) * 0.08 + (noise(x * 0.02, y * 0.02) - 0.5) * 0.1;
      const col = mix(center, edge, clamp01(t + n));
      const o = (y * S + x) * 4;
      img.data[o] = col[0];
      img.data[o + 1] = col[1];
      img.data[o + 2] = col[2];
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c);
}

export interface ThemeTextures {
  wood: { map: THREE.Texture; bump: THREE.Texture };
  field: THREE.Texture;
  tray: THREE.Texture;
  khatam: THREE.Texture;
  rosette: THREE.Texture;
  table: THREE.Texture;
}

const cache = new Map<string, ThemeTextures>();

export function themeTextures(theme: BoardTheme): ThemeTextures {
  let t = cache.get(theme.id);
  if (!t) {
    t = {
      wood: woodTextures(theme),
      field: fieldTexture(theme),
      tray: trayTexture(theme),
      khatam: khatamTexture(theme),
      rosette: rosetteTexture(theme),
      table: tableTexture(theme),
    };
    cache.set(theme.id, t);
  }
  return t;
}
