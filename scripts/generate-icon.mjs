import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'assets', 'images');

const colors = {
  purple: '#8B7D96',
  mint: '#9CB8AA',
  rim: '#6B5E74',
  rimInner: '#7A6D85',
  hub: '#5C5060',
  hubRing: '#4A4150',
  background: '#F0EFEC',
  pointer: '#3A3540',
  spoke: '#6E6278',
};

const size = 1024;
const cx = size / 2;
const cy = size / 2;
const outerR = 360;
const rimWidth = 44;
const innerR = outerR - rimWidth;
const hubR = 52;
const spokeWidth = 18;
const segments = 8;
const slice = 360 / segments;

function polar(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function segmentPath(startAngle, endAngle, radius) {
  const start = polar(startAngle, radius);
  const end = polar(endAngle, radius);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function spokeRect(angleDeg) {
  const half = spokeWidth / 2;
  const p1 = polar(angleDeg, hubR);
  const p2 = polar(angleDeg, innerR);
  const perp = ((angleDeg - 90) * Math.PI) / 180;
  const ox = half * Math.cos(perp);
  const oy = half * Math.sin(perp);
  return `M ${p1.x - ox} ${p1.y - oy} L ${p2.x - ox} ${p2.y - oy} L ${p2.x + ox} ${p2.y + oy} L ${p1.x + ox} ${p1.y + oy} Z`;
}

const segmentPaths = Array.from({ length: segments }, (_, i) => {
  const start = i * slice;
  const end = (i + 1) * slice;
  const fill = i % 2 === 0 ? colors.purple : colors.mint;
  return `<path d="${segmentPath(start, end, innerR)}" fill="${fill}" />`;
}).join('\n    ');

const spokes = Array.from({ length: segments }, (_, i) => {
  const angle = i * slice;
  return `<path d="${spokeRect(angle)}" fill="${colors.spoke}" opacity="0.55" />`;
}).join('\n    ');

const rimBolts = Array.from({ length: 12 }, (_, i) => {
  const angle = i * (360 / 12);
  const p = polar(angle, outerR - rimWidth / 2);
  return `<circle cx="${p.x}" cy="${p.y}" r="7" fill="${colors.rimInner}" stroke="${colors.hubRing}" stroke-width="2" />`;
}).join('\n    ');

const pointer = polar(0, outerR + 28);
const pointerBase = polar(0, outerR + 4);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="190" fill="${colors.background}" />
  <g>
    ${segmentPaths}
    ${spokes}
    <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="${colors.rim}" stroke-width="${rimWidth}" />
    <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="${colors.rimInner}" stroke-width="3" opacity="0.7" />
    ${rimBolts}
    <circle cx="${cx}" cy="${cy}" r="${hubR + 10}" fill="none" stroke="${colors.hubRing}" stroke-width="4" />
    <circle cx="${cx}" cy="${cy}" r="${hubR}" fill="${colors.hub}" />
    <circle cx="${cx}" cy="${cy}" r="16" fill="${colors.background}" opacity="0.35" />
    <polygon
      points="${pointer.x},${pointer.y - 26} ${pointer.x - 20},${pointerBase.y} ${pointer.x + 20},${pointerBase.y}"
      fill="${colors.pointer}"
    />
  </g>
</svg>`;

mkdirSync(outDir, { recursive: true });

const png = await sharp(Buffer.from(svg)).png().toBuffer();
const targets = [
  'icon.png',
  'android-icon-foreground.png',
  'splash-icon.png',
  'favicon.png',
  'android-icon-monochrome.png',
];

for (const name of targets) {
  writeFileSync(join(outDir, name), png);
}

writeFileSync(join(outDir, 'icon.svg'), svg);
console.log(`Generated wagon wheel icon (${size}x${size}) -> assets/images/`);
