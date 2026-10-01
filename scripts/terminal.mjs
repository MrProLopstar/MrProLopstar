import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const USER = 'MrProLopstar';
const PACKAGES = ['cronsense', 'prodcalendar'];
const OUT = process.argv[2] ?? 'dist';

const json = async (url) => {
  const headers = { 'user-agent': USER };
  if (url.includes('api.github.com') && process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};

const stats = async () => {
  const [user, repos, ...downloads] = await Promise.all([
    json(`https://api.github.com/users/${USER}`),
    json(`https://api.github.com/users/${USER}/repos?per_page=100`),
    ...PACKAGES.map((name) => json(`https://api.npmjs.org/downloads/point/last-month/${name}`).catch(() => ({ downloads: 0 }))),
  ]);
  return {
    repos: user.public_repos,
    followers: user.followers,
    stars: repos.filter((repo) => !repo.fork).reduce((sum, repo) => sum + repo.stargazers_count, 0),
    downloads: downloads.reduce((sum, item) => sum + item.downloads, 0),
  };
};

const TEXT = {
  en: {
    whoami: 'Iaroslav Gostiaev, JavaScript developer from Saint Petersburg',
    rows: (s) => [
      ['Name', 'Iaroslav Gostiaev'],
      ['Age', '22'],
      ['Hometown', 'Saint Petersburg'],
      ['MSc', "ITMO, Software Engineering, Web Technologies '28"],
      ['BSc', "Ogarev Mordovia State University, Software Eng. '26"],
      ['Languages', 'JavaScript, TypeScript, Python, C++, C#, Flutter'],
      ['Projects', 'cronsense, prodcalendar'],
      ['GitHub', `${s.repos} repos, ${s.stars} stars, ${s.followers} followers`],
      ['npm', s.downloads ? `${s.downloads} downloads last month` : `${PACKAGES.length} packages`],
    ],
    updated: 'updated',
  },
  ru: {
    whoami: 'Ярослав Гостяев, JavaScript-разработчик из Санкт-Петербурга',
    rows: (s) => [
      ['Имя', 'Гостяев Ярослав'],
      ['Возраст', '22 года'],
      ['Город', 'Санкт-Петербург'],
      ['Магистр', "ИТМО, Программная инженерия, Веб-технологии '28"],
      ['Бакалавр', "МГУ им. Н.П. Огарёва, Программная инженерия '26"],
      ['Языки', 'JavaScript, TypeScript, Python, C++, C#, Flutter'],
      ['Проекты', 'cronsense, prodcalendar'],
      ['GitHub', `репозиториев ${s.repos}, звёзд ${s.stars}, подписчиков ${s.followers}`],
      ['npm', s.downloads ? `${s.downloads} скачиваний за месяц` : `${PACKAGES.length} пакета`],
    ],
    updated: 'обновлено',
  },
};

const C = { bg: '#0d1117', bar: '#161b22', text: '#c9d1d9', muted: '#8b949e', accent: '#3fc6a4', key: '#e3b341', prompt: '#58a6ff' };
const FONT = 14;
const LINE = 18;
const CHAR = 8.43;
const PAD = 22;
const ART_FONT = 8;
const ART_CHAR = ART_FONT * 0.55;
const ART_LINE = 9;
const TYPE = 0.06;
const PALETTE = ['#f85149', '#e3b341', '#3fb950', '#3fc6a4', '#58a6ff', '#bc8cff', '#c9d1d9', '#8b949e'];

const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const render = (lang, s) => {
  const t = TEXT[lang];
  const logo = JSON.parse(readFileSync(new URL('../assets/avatar.json', import.meta.url), 'utf8'));
  const rows = t.rows(s);
  const body = [];
  const css = [];
  let y = 46 + LINE;
  let time = 0.4;
  let id = 0;

  const show = (markup, at) => {
    const name = `s${id++}`;
    css.push(`.${name}{opacity:0;animation:on 0s ${at.toFixed(2)}s forwards}`);
    return `<g class="${name}">${markup}</g>`;
  };

  const command = (cmd) => {
    const prompt = `<tspan fill="${C.accent}">mrprolopstar@github</tspan><tspan fill="${C.muted}">:</tspan><tspan fill="${C.prompt}">~</tspan><tspan fill="${C.muted}">$ </tspan>`;
    const chars = [...cmd].map((ch, index) => {
      const name = `s${id++}`;
      css.push(`.${name}{opacity:0;animation:on 0s ${(time + 0.3 + index * TYPE).toFixed(2)}s forwards}`);
      return `<tspan class="${name}">${escape(ch)}</tspan>`;
    }).join('');
    body.push(show(`<text x="${PAD}" y="${y}">${prompt}${chars}</text>`, time));
    time += 0.3 + cmd.length * TYPE + 0.35;
    y += LINE;
  };

  const output = (markup, gap = 0.04) => {
    body.push(show(markup, time));
    time += gap;
    y += LINE;
  };

  command('whoami');
  output(`<text x="${PAD}" y="${y}">${escape(t.whoami)}</text>`, 0.4);
  y += 6;
  command('neofetch');

  const top = y - 4;
  const infoX = PAD + logo.reduce((max, row) => Math.max(max, row.length), 0) * ART_CHAR + 30;
  const infoTop = top + 4 * LINE;
  const start = time;
  logo.forEach((row, index) => {
    body.push(show(`<text x="${PAD}" y="${top + index * ART_LINE}" font-size="${ART_FONT}">${row.map(([ch, color]) => (color ? `<tspan fill="${color}">${escape(ch)}</tspan>` : '\u00a0')).join('')}</text>`, start + index * 0.03));
  });
  const info = [
    `<tspan fill="${C.accent}" font-weight="bold">mrprolopstar</tspan><tspan fill="${C.text}">@</tspan><tspan fill="${C.accent}" font-weight="bold">github</tspan>`,
    `<tspan fill="${C.muted}">${'-'.repeat(19)}</tspan>`,
    ...rows.map(([key, value]) => `<tspan fill="${C.key}" font-weight="bold">${escape(key)}</tspan><tspan fill="${C.text}">: ${escape(value)}</tspan>`),
  ];
  info.forEach((row, index) => {
    body.push(show(`<text x="${infoX}" y="${infoTop + index * LINE}">${row}</text>`, start + 0.2 + index * 0.08));
  });
  const swatchY = infoTop + (info.length + 1) * LINE - 12;
  body.push(show(PALETTE.map((color, n) => `<rect x="${infoX + n * 26}" y="${swatchY}" width="24" height="14" fill="${color}"/>`).join(''), start + 0.3 + info.length * 0.08));
  time = start + Math.max(logo.length * 0.03, 0.4 + info.length * 0.08) + 0.4;
  y = Math.max(top + logo.length * ART_LINE, swatchY + 14) + LINE + 6;
  command('echo "El Psy Kongroo"');
  output(`<text x="${PAD}" y="${y}">El Psy Kongroo</text>`, 0.3);
  body.push(show(`<text x="${PAD}" y="${y}"><tspan fill="${C.accent}">mrprolopstar@github</tspan><tspan fill="${C.muted}">:</tspan><tspan fill="${C.prompt}">~</tspan><tspan fill="${C.muted}">$ </tspan></text><rect class="cursor" x="${PAD + 23 * CHAR}" y="${y - 13}" width="8" height="16" fill="${C.text}"/>`, time));

  const width = 960;
  const height = y + 30;
  const date = new Date().toISOString().slice(0, 10);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Consolas, 'DejaVu Sans Mono', 'Liberation Mono', monospace" font-size="${FONT}">
<style>@keyframes on{to{opacity:1}}@keyframes blink{50%{opacity:0}}.cursor{animation:blink 1s step-end infinite}${css.join('')}</style>
<rect width="${width}" height="${height}" rx="10" fill="${C.bg}" stroke="#30363d"/>
<path d="M0 10a10 10 0 0 1 10-10h${width - 20}a10 10 0 0 1 10 10v22H0z" fill="${C.bar}"/>
<circle cx="20" cy="16" r="6" fill="#f85149"/><circle cx="40" cy="16" r="6" fill="#e3b341"/><circle cx="60" cy="16" r="6" fill="#3fb950"/>
<text x="${width / 2}" y="21" fill="${C.muted}" font-size="12" text-anchor="middle">mrprolopstar@github: ~ · ${t.updated} ${date}</text>
<g fill="${C.text}" xml:space="preserve">${body.join('\n')}</g>
</svg>
`;
};

const s = await stats().catch((error) => {
  console.error(error.message);
  return { repos: 0, stars: 0, followers: 0, downloads: 0 };
});
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/terminal.svg`, render('en', s));
writeFileSync(`${OUT}/terminal.ru.svg`, render('ru', s));
console.log(s);
