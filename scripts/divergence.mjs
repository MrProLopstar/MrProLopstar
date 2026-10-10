const T = { width: 78, glass: 168, socket: 26, gap: 12 };
const DOT_WIDTH = 46;
const SIDE = 34;
const TOP = 26;
const BASE = 74;
const CYCLE = 12;
const ROLL = 2.2;
const FONT = "font-family:'Noto Serif','DejaVu Serif',Georgia,serif;font-weight:400";

export const reading = (downloads) => (downloads / 1_000_000).toFixed(6);

const keyframes = (name, from, to) =>
  `@keyframes ${name}{0%,${from.toFixed(2)}%{opacity:0}${from.toFixed(2)}%,${to.toFixed(2)}%{opacity:1}${to.toFixed(2)}%,100%{opacity:0}}`;

const tube = (x, width, content, glowSpill) => {
  const top = TOP;
  const bottom = TOP + T.glass;
  const cx = x + width / 2;
  const r = width / 2;
  const glass = `M${x} ${bottom} V${top + r} A${r} ${r} 0 0 1 ${x + width} ${top + r} V${bottom} Z`;
  return `<g>
<ellipse cx="${cx}" cy="${bottom + T.socket + 8}" rx="${r + 8}" ry="9" fill="url(#spill)" opacity="${glowSpill}" class="spill"/>
<path d="${glass}" fill="url(#glassFill)"/>
<clipPath id="c${x}"><path d="${glass}"/></clipPath>
<g clip-path="url(#c${x})">
<rect x="${x}" y="${top}" width="${width}" height="${T.glass}" fill="url(#mesh)" opacity="0.45"/>
${content}
<rect x="${x}" y="${top}" width="${width}" height="${T.glass}" fill="url(#cylinder)"/>
</g>
<path d="${glass}" fill="none" stroke="url(#rim)" stroke-width="1.6"/>
<rect x="${x + width * 0.14}" y="${top + r * 0.55}" width="${width * 0.1}" height="${T.glass - r * 0.9}" rx="${width * 0.05}" fill="url(#shine)"/>
<path d="M${cx - 4} ${top + 1} Q${cx} ${top - 9} ${cx + 4} ${top + 1} Z" fill="url(#rim)" opacity="0.8"/>
<rect x="${x - 4}" y="${bottom - 2}" width="${width + 8}" height="${T.socket}" rx="5" fill="url(#socket)"/>
<rect x="${x - 4}" y="${bottom - 2}" width="${width + 8}" height="4" rx="2" fill="#d9b779" opacity="0.35"/>
</g>`;
};

const digitTube = (x, final, index) => {
  const cx = x + T.width / 2;
  const base = TOP + T.glass * 0.74;
  const settle = ((ROLL + index * 0.2) / CYCLE) * 100;
  const frames = Array.from({ length: 10 }, (_, frame) => (Number(final) + 3 + frame * 7 + index * 3) % 10);
  const styles = [];
  const rolling = frames
    .map((digit, frame) => {
      const name = `f${index}_${frame}`;
      styles.push(keyframes(name, (frame / frames.length) * settle, ((frame + 1) / frames.length) * settle));
      return `<text x="${cx}" y="${base}" class="d" style="animation-name:${name}">${digit}</text>`;
    })
    .join('');
  styles.push(keyframes(`s${index}`, settle, 97));
  const ghosts = ['0', '1', '4', '8', '9'].filter((digit) => digit !== final).map((digit) => `<text x="${cx}" y="${base}" class="g">${digit}</text>`).join('');
  return { svg: tube(x, T.width, `${ghosts}${rolling}<text x="${cx}" y="${base}" class="d" style="animation-name:s${index}">${final}</text>`, 0.9), styles };
};

export const divergence = (downloads) => {
  const value = reading(downloads);
  const parts = [];
  const styles = [];
  let x = SIDE;
  let index = 0;
  for (const char of value) {
    if (char === '.') {
      parts.push(tube(x + 6, DOT_WIDTH - 12, `<circle cx="${x + DOT_WIDTH / 2}" cy="${TOP + T.glass * 0.7}" r="7" class="dot"/>`, 0.6));
      x += DOT_WIDTH + T.gap;
      continue;
    }
    const built = digitTube(x, char, index);
    parts.push(built.svg);
    styles.push(...built.styles);
    x += T.width + T.gap;
    index += 1;
  }
  const width = x - T.gap + SIDE;
  const chassisTop = TOP + T.glass + T.socket - 6;
  const height = chassisTop + BASE + 14;
  const screws = [SIDE / 2, width - SIDE / 2]
    .flatMap((sx) => [chassisTop + 18, chassisTop + BASE - 16].map((sy) => `<circle cx="${sx}" cy="${sy}" r="5" fill="url(#screw)"/><path d="M${sx - 3.5} ${sy} H${sx + 3.5}" stroke="#2a1e12" stroke-width="1.4" transform="rotate(${(sx * 7 + sy) % 180} ${sx} ${sy})"/>`))
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<pattern id="mesh" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 3.5h7M3.5 0v7" stroke="#7a5f40" stroke-width="0.7"/></pattern>
<linearGradient id="glassFill" x1="0" x2="1"><stop offset="0" stop-color="#2a2018" stop-opacity="0.95"/><stop offset="0.5" stop-color="#191109" stop-opacity="0.9"/><stop offset="1" stop-color="#2a2018" stop-opacity="0.95"/></linearGradient>
<linearGradient id="cylinder" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.25" stop-color="#000" stop-opacity="0"/><stop offset="0.75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></linearGradient>
<linearGradient id="rim" x1="0" x2="1"><stop offset="0" stop-color="#8d7a63"/><stop offset="0.5" stop-color="#3b3026"/><stop offset="1" stop-color="#6d5c49"/></linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="socket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4128"/><stop offset="0.45" stop-color="#2b1d10"/><stop offset="1" stop-color="#120b05"/></linearGradient>
<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2f1a"/><stop offset="0.12" stop-color="#3a2414"/><stop offset="1" stop-color="#1c1009"/></linearGradient>
<linearGradient id="brass" x1="0" x2="1"><stop offset="0" stop-color="#6e5530"/><stop offset="0.5" stop-color="#c9a764"/><stop offset="1" stop-color="#6e5530"/></linearGradient>
<radialGradient id="screw"><stop offset="0" stop-color="#e2c78c"/><stop offset="1" stop-color="#5c4527"/></radialGradient>
<radialGradient id="spill"><stop offset="0" stop-color="#ff9a3c" stop-opacity="0.75"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
<pattern id="grain" width="120" height="8" patternUnits="userSpaceOnUse"><path d="M0 2 Q30 0 60 3 T120 2 M0 6 Q40 5 80 7 T120 6" stroke="#000" stroke-opacity="0.18" fill="none"/></pattern>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2" result="a"/><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="a"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.d{${FONT};font-size:108px;text-anchor:middle;fill:#ffd08a;stroke:#ff8a1f;stroke-width:1.6;filter:url(#glow);opacity:0;animation-duration:${CYCLE}s;animation-iteration-count:infinite;animation-timing-function:step-end}
.g{${FONT};font-size:108px;text-anchor:middle;fill:none;stroke:#6b5236;stroke-width:1.1;opacity:0.45}
.dot{fill:#ffd08a;stroke:#ff8a1f;filter:url(#glow)}
.plate{font:600 13px Consolas,'DejaVu Sans Mono',monospace;letter-spacing:3px;fill:#2a1c0c;text-anchor:middle}
.sub{font:12px Consolas,'DejaVu Sans Mono',monospace;fill:#c9a764;text-anchor:middle;opacity:0.85}
@keyframes flicker{0%,100%{opacity:1}47%{opacity:1}49%{opacity:0.78}51%{opacity:1}73%{opacity:0.92}74%{opacity:1}}
.tubes{animation:flicker 4.3s infinite}
${styles.join('')}
</style>
<rect x="6" y="${chassisTop}" width="${width - 12}" height="${BASE}" rx="10" fill="url(#wood)"/>
<rect x="6" y="${chassisTop}" width="${width - 12}" height="${BASE}" rx="10" fill="url(#grain)"/>
<rect x="6" y="${chassisTop}" width="${width - 12}" height="3" rx="1.5" fill="#d9b779" opacity="0.25"/>
<rect x="${width / 2 - 150}" y="${chassisTop + 16}" width="300" height="24" rx="4" fill="url(#brass)"/>
<text x="${width / 2}" y="${chassisTop + 32.5}" class="plate">DIVERGENCE METER</text>
<text x="${width / 2}" y="${chassisTop + 60}" class="sub">${downloads.toLocaleString('en-US')} npm downloads · 1.048596 is Steins;Gate</text>
${screws}
<g class="tubes">${parts.join('\n')}</g>
</svg>
`;
};
