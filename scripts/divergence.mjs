const TUBE = { width: 74, height: 150, gap: 10 };
const DOT = 34;
const PAD = 28;
const CYCLE = 12;
const ROLL = 2.2;

const digitsOf = (downloads) => (Math.min(downloads, 9_999_999) / 1_000_000).toFixed(6);

const tube = (x, final, index, ghosts) => {
  const cx = x + TUBE.width / 2;
  const base = PAD + TUBE.height * 0.72;
  const frames = Array.from({ length: 9 }, (_, frame) => (Number(final) + 3 + frame * 7 + index * 3) % 10);
  const settle = (ROLL + index * 0.18) / CYCLE;
  const rolling = frames
    .map((digit, frame) => {
      const start = ((frame / frames.length) * settle * 100).toFixed(2);
      const end = (((frame + 1) / frames.length) * settle * 100).toFixed(2);
      return `<text x="${cx}" y="${base}" class="d r" style="animation-name:f${index}_${frame}">${digit}</text><style>@keyframes f${index}_${frame}{0%,${start}%{opacity:0}${start}%,${end}%{opacity:1}${end}%,100%{opacity:0}}</style>`;
    })
    .join('');
  const settled = `<text x="${cx}" y="${base}" class="d r" style="animation-name:s${index}">${final}</text><style>@keyframes s${index}{0%,${(settle * 100).toFixed(2)}%{opacity:0}${(settle * 100 + 0.01).toFixed(2)}%,97%{opacity:1}100%{opacity:0}}</style>`;
  const ghost = ghosts.map((digit) => `<text x="${cx}" y="${base}" class="g">${digit}</text>`).join('');
  return `<g>
<rect x="${x}" y="${PAD}" width="${TUBE.width}" height="${TUBE.height}" rx="34" fill="url(#glass)" stroke="#3a2a1a" stroke-width="2"/>
<rect x="${x + 6}" y="${PAD + 10}" width="${TUBE.width - 12}" height="${TUBE.height - 20}" rx="28" fill="url(#mesh)" opacity="0.55"/>
${ghost}${rolling}${settled}
<rect x="${x + 10}" y="${PAD + 8}" width="10" height="${TUBE.height - 40}" rx="5" fill="#ffffff" opacity="0.06"/>
</g>`;
};

export const divergence = (downloads) => {
  const value = digitsOf(downloads);
  let x = PAD;
  const parts = [];
  let index = 0;
  for (const char of value) {
    if (char === '.') {
      parts.push(`<circle cx="${x + DOT / 2}" cy="${PAD + TUBE.height * 0.7}" r="7" class="dot"/>`);
      x += DOT + TUBE.gap;
      continue;
    }
    const ghosts = ['1', '4', '8', '0'].filter((digit) => digit !== char);
    parts.push(tube(x, char, index, ghosts));
    x += TUBE.width + TUBE.gap;
    index += 1;
  }
  const width = x - TUBE.gap + PAD;
  const height = PAD * 2 + TUBE.height + 46;
  const caption = `${downloads.toLocaleString('en-US')} npm downloads last month · 1.048596 is Steins;Gate`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#1a1410"/><stop offset="0.5" stop-color="#241a12"/><stop offset="1" stop-color="#140f0b"/></linearGradient>
<pattern id="mesh" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#5a4632" stroke-width="0.6"/></pattern>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.d{font:500 92px 'Noto Sans','DejaVu Sans',Arial,sans-serif;text-anchor:middle;fill:#ffb35c;filter:url(#glow);opacity:0}
.r{animation-duration:${CYCLE}s;animation-iteration-count:infinite;animation-timing-function:step-end}
.g{font:500 92px 'Noto Sans','DejaVu Sans',Arial,sans-serif;text-anchor:middle;fill:none;stroke:#4a3826;stroke-width:1.2;opacity:0.5}
.dot{fill:#ffb35c;filter:url(#glow)}
.c{font:14px Consolas,'DejaVu Sans Mono',monospace;fill:#8b7a66;text-anchor:middle}
@keyframes flicker{0%,100%{opacity:1}48%{opacity:1}50%{opacity:0.82}52%{opacity:1}}
.tubes{animation:flicker 3.7s infinite}
</style>
<rect width="${width}" height="${height}" rx="14" fill="#0b0806"/>
<g class="tubes">${parts.join('\n')}</g>
<text x="${width / 2}" y="${height - 20}" class="c">${caption}</text>
</svg>
`;
};
