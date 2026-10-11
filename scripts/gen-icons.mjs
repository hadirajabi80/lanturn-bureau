/**
 * `npm run pwa:icons` — renders the Floorplan Mysteries mark (a brass lantern over a floor-plan
 * grid) to the PWA icon set + Open Graph card with @resvg/resvg-js. Outputs are committed:
 *
 *   public/favicon.svg                 vector favicon
 *   public/icons/mark.svg              full-detail source mark
 *   public/icons/icon-192.png          manifest "any"
 *   public/icons/icon-512.png          manifest "any"
 *   public/icons/maskable-512.png      manifest "maskable" (content inside the 80 % safe zone)
 *   public/icons/apple-touch-icon.png  180×180, full-bleed (iOS rounds it)
 *   public/icons/favicon-32.png        PNG favicon fallback
 *   public/icons/og.png                1200×630 social card (skyline + title)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/icons');
mkdirSync(OUT, { recursive: true });

const C = {
  bg: '#120E0B',
  panel: '#1E1813',
  ink: '#F1E6D2',
  muted: '#A8977D',
  brass: '#C9974A',
  brass2: '#E7C27D',
  brassDark: '#7A5627',
  danger: '#B5402F',
  glow: '#FFB347',
};

/* ------------------------------------------------------------------ shared defs */

const defs = (p = '') => `
  <defs>
    <radialGradient id="${p}glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.glow}" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="${C.glow}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${C.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${p}brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.brass2}"/>
      <stop offset="55%" stop-color="${C.brass}"/>
      <stop offset="100%" stop-color="${C.brassDark}"/>
    </linearGradient>
    <radialGradient id="${p}glass" cx="50%" cy="62%" r="70%">
      <stop offset="0%" stop-color="#FFF4D0"/>
      <stop offset="40%" stop-color="#FFC764"/>
      <stop offset="100%" stop-color="#B8641E"/>
    </radialGradient>
    <linearGradient id="${p}flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE7A3"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>`;

/** The lantern, drawn in a 512 box centred on x=256. */
const lantern = (p = '') => `
  <g>
    <circle cx="256" cy="94" r="26" fill="none" stroke="url(#${p}brass)" stroke-width="11"/>
    <rect x="244" y="112" width="24" height="16" rx="3" fill="url(#${p}brass)"/>
    <path d="M214 126 H298 L330 162 H182 Z" fill="url(#${p}brass)"/>
    <rect x="198" y="160" width="116" height="172" rx="10" fill="url(#${p}glass)"/>
    <path d="M256 204 C276 238 288 260 281 281 C274 304 238 304 231 281 C224 260 236 238 256 204 Z" fill="url(#${p}flame)" opacity="0.95"/>
    <path d="M256 248 C264 262 268 272 264 282 C260 292 252 292 248 282 C244 272 248 262 256 248 Z" fill="#FFFFFF"/>
    <rect x="198" y="160" width="116" height="172" rx="10" fill="none" stroke="url(#${p}brass)" stroke-width="12"/>
    <rect x="225" y="164" width="6" height="164" fill="${C.brass}" opacity="0.85"/>
    <rect x="281" y="164" width="6" height="164" fill="${C.brass}" opacity="0.85"/>
    <path d="M182 330 H330 L308 362 H204 Z" fill="url(#${p}brass)"/>
    <rect x="222" y="360" width="68" height="14" rx="4" fill="${C.brassDark}"/>
  </g>`;

/** Floor-plan grid filling a 512 box: fine grid + inked walls + a pin and a red cross. */
const plan = (detail = true) => {
  const lines = [];
  if (detail) {
    for (let i = 64; i <= 448; i += 48) {
      lines.push(`<line x1="${i}" y1="64" x2="${i}" y2="448"/>`, `<line x1="64" y1="${i}" x2="448" y2="${i}"/>`);
    }
  }
  return `
  <g stroke="${C.brass}" stroke-opacity="0.16" stroke-width="2">${lines.join('')}</g>
  <g fill="none" stroke="${C.brass}" stroke-opacity="0.62" stroke-width="9" stroke-linecap="square">
    <path d="M64 208 V64 H208 M256 64 H448 V256 M448 304 V448 H304 M256 448 H64 V256"/>
    <path d="M64 304 H160 M208 304 V448 M352 64 V160 H448 M352 208 V256"/>
  </g>
  ${detail ? `
  <g stroke="${C.danger}" stroke-width="8" stroke-linecap="round" opacity="0.9">
    <path d="M82 322 L126 366 M126 322 L82 366"/>
  </g>
  <g>
    <circle cx="400" cy="400" r="15" fill="url(#brass)" stroke="${C.brassDark}" stroke-width="3"/>
    <circle cx="395" cy="395" r="5" fill="#FFF1C9" opacity="0.8"/>
  </g>` : ''}`;
};

/** Full-detail square mark. `rx` rounds the tile; `scale` shrinks the content for maskable. */
function markSvg({ size = 512, rx = 96, scale = 1, detail = true } = {}) {
  const t = (1 - scale) * 256;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  ${defs()}
  <clipPath id="tile"><rect width="512" height="512" rx="${rx}"/></clipPath>
  <rect width="512" height="512" rx="${rx}" fill="${C.bg}"/>
  <g clip-path="url(#tile)"><g transform="translate(${t} ${t}) scale(${scale})">
    ${plan(detail)}
    <circle cx="256" cy="236" r="230" fill="url(#glow)"/>
    ${lantern()}
  </g></g>
</svg>`;
}

/* ------------------------------------------------------------------ OG card */

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Eight district facades along the bottom edge (base line y=630). */
function skyline() {
  const rand = rng(1040);
  const base = 630;
  const out = [];
  const win = (x, y, w, h, color = C.glow) => {
    const on = rand() < 0.55;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${on ? color : '#2A211A'}" opacity="${on ? 0.85 : 1}"/>`;
  };
  const windows = (x, y, cols, rows, w, h, gx, gy, color) => {
    let s = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += win(x + c * gx, y + r * gy, w, h, color);
    return s;
  };
  const body = `fill="${C.panel}" stroke="${C.brass}" stroke-opacity="0.55" stroke-width="2"`;

  // I · manor
  out.push(`<path ${body} d="M20 ${base} V520 L95 470 L170 520 V${base} Z"/>`,
    `<rect ${body} x="130" y="462" width="16" height="40"/>`,
    windows(38, 530, 5, 3, 14, 18, 24, 30));
  // II · lighthouse
  out.push(`<path ${body} d="M200 ${base} L214 430 H246 L260 ${base} Z"/>`,
    `<rect ${body} x="208" y="406" width="44" height="26"/>`,
    `<circle cx="230" cy="419" r="9" fill="#5FE3D8"/>`,
    `<path d="M222 419 L120 400 L120 438 Z M238 419 L330 404 L330 434 Z" fill="#5FE3D8" opacity="0.10"/>`,
    windows(223, 460, 1, 5, 14, 14, 0, 32, '#5FE3D8'));
  // III · Deco tower
  out.push(`<path ${body} d="M300 ${base} V480 H316 V456 H332 V430 H346 V408 L352 384 L358 408 V430 H372 V456 H388 V480 H404 V${base} Z"/>`,
    windows(312, 492, 4, 4, 10, 16, 22, 30, "#F2D98B"));
  // IV · museum
  out.push(`<path ${body} d="M430 ${base} V500 L520 462 L610 500 V${base} Z"/>`,
    `<rect ${body} x="430" y="498" width="180" height="10"/>`,
    ...[448, 482, 516, 550, 584].map((x) => `<rect x="${x}" y="514" width="10" height="110" fill="${C.brass}" opacity="0.35"/>`));
  // V · neon skyline
  out.push(`<rect ${body} x="640" y="440" width="54" height="190"/>`, `<rect ${body} x="690" y="480" width="44" height="150"/>`,
    `<rect ${body} x="730" y="410" width="46" height="220"/>`,
    `<rect x="646" y="452" width="42" height="4" fill="#FF3EA5"/>`, `<rect x="736" y="422" width="34" height="4" fill="#2CF5E6"/>`,
    windows(648, 470, 3, 5, 8, 12, 14, 28, '#FF3EA5'), windows(738, 440, 3, 6, 8, 12, 13, 28, '#2CF5E6'));
  // VI · gothic academy
  out.push(`<path ${body} d="M800 ${base} V500 H812 L824 440 L836 500 H872 L888 410 L904 500 H940 L952 440 L964 500 H976 V${base} Z"/>`,
    ...[818, 880, 946].map((x) => `<path d="M${x} 540 v-12 a6 6 0 0 1 12 0 v12 Z" fill="${C.glow}" opacity="0.75"/>`),
    windows(816, 568, 6, 1, 10, 22, 26, 0));
  // VII · train
  out.push(`<rect ${body} x="1000" y="560" width="60" height="58" rx="8"/>`, `<rect ${body} x="1064" y="560" width="60" height="58" rx="8"/>`,
    `<rect x="996" y="620" width="132" height="4" fill="${C.brass}" opacity="0.6"/>`,
    windows(1008, 572, 3, 1, 12, 14, 18, 0, '#FFC77A'), windows(1072, 572, 3, 1, 12, 14, 18, 0, '#FFC77A'));
  // VIII · observatory
  out.push(`<rect ${body} x="1136" y="540" width="60" height="90"/>`, `<path ${body} d="M1132 542 A34 34 0 0 1 1200 542 Z"/>`,
    `<rect x="1162" y="512" width="8" height="30" fill="#9FD0FF" opacity="0.7"/>`,
    windows(1146, 560, 3, 2, 10, 12, 16, 26, '#9FD0FF'));
  return out.join('\n');
}

function ogSvg() {
  const grid = [];
  for (let x = 0; x <= 1200; x += 40) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="630"/>`);
  for (let y = 0; y <= 630; y += 40) grid.push(`<line x1="0" y1="${y}" x2="1200" y2="${y}"/>`);
  const serif = `font-family="'Playfair Display', Georgia, 'Times New Roman', 'DejaVu Serif', serif"`;
  const sans = `font-family="Inter, 'Segoe UI', Arial, 'DejaVu Sans', sans-serif"`;
  const mono = `font-family="'JetBrains Mono', Consolas, 'Courier New', 'DejaVu Sans Mono', monospace"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  ${defs()}
  <radialGradient id="vig" cx="22%" cy="34%" r="85%">
    <stop offset="0%" stop-color="#2A1D12"/>
    <stop offset="100%" stop-color="${C.bg}"/>
  </radialGradient>
  <rect width="1200" height="630" fill="url(#vig)"/>
  <g stroke="${C.brass}" stroke-opacity="0.07" stroke-width="1">${grid.join('')}</g>
  <circle cx="190" cy="200" r="260" fill="url(#glow)"/>
  <g transform="translate(62 30) scale(0.52)">${lantern()}</g>
  <text x="340" y="150" ${sans} font-size="24" font-weight="600" letter-spacing="7" fill="${C.brass}">LANTERN BUREAU · CASEBOOK</text>
  <text x="336" y="246" ${serif} font-size="74" font-weight="700" fill="${C.ink}">Floorplan Mysteries</text>
  <text x="340" y="296" ${sans} font-size="28" fill="${C.muted}">Pin the suspects. Cross the impossible. Stamp it closed.</text>
  <text x="340" y="342" ${mono} font-size="21" fill="${C.brass2}" opacity="0.85">1,040 CASES  ·  8 DISTRICTS OF GREYWICK</text>
  <rect x="340" y="362" width="120" height="3" fill="${C.brass}" opacity="0.7"/>
  ${skyline()}
</svg>`;
}

/* ------------------------------------------------------------------ render */

function png(svg, width, name) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Georgia' },
    background: 'rgba(0,0,0,0)',
  });
  const buf = r.render().asPng();
  writeFileSync(resolve(OUT, name), buf);
  console.log(`  icons/${name}  ${width}px  ${(buf.length / 1024).toFixed(1)} KB`);
}

const full = markSvg();
writeFileSync(resolve(OUT, 'mark.svg'), full);
writeFileSync(resolve(ROOT, 'public/favicon.svg'), markSvg({ size: 32, rx: 112, scale: 1.12, detail: false }));

png(full, 192, 'icon-192.png');
png(full, 512, 'icon-512.png');
png(markSvg({ rx: 0, scale: 0.74 }), 512, 'maskable-512.png');
png(markSvg({ rx: 0, scale: 0.9 }), 180, 'apple-touch-icon.png');
png(markSvg({ rx: 112, scale: 1.12, detail: false }), 32, 'favicon-32.png');
png(ogSvg(), 1200, 'og.png');
console.log('done.');
