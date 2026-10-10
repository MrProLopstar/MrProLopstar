import { readFileSync, writeFileSync } from 'node:fs';

const FEED = 'https://habr.com/ru/rss/users/mrprolopstar/publications/articles/?fl=ru';

const plural = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'статья' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'статьи' : 'статей');

const response = await fetch(FEED, { headers: { 'user-agent': 'Mozilla/5.0 MrProLopstar profile' } });
if (!response.ok) throw new Error(`Habr RSS: HTTP ${response.status}`);
const xml = await response.text();
const articles = [...xml.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>[\s\S]*?<guid[^>]*>([^<]+)<\/guid>[\s\S]*?<\/item>/g)].map(([, title = '', url = '']) => ({
  title: title.trim().replace(/[[\]]/g, ''),
  url: url.trim(),
}));
if (articles.length === 0) throw new Error('Habr RSS has no articles, refusing to wipe the list');

const latest = articles[0]?.url ?? '';
const list = articles.map(({ title, url }) => `- [${title}](${url})`).join('\n');
const badge = {
  'README.md': `<a href="${latest}"><img src="https://img.shields.io/badge/Habr-${articles.length}%20${articles.length === 1 ? 'article' : 'articles'}-65a3be?style=flat-square&logo=habr&logoColor=white"></a>`,
  'README.ru.md': `<a href="${latest}"><img src="https://img.shields.io/badge/${encodeURIComponent('Хабр')}-${articles.length}%20${encodeURIComponent(plural(articles.length))}-65a3be?style=flat-square&logo=habr&logoColor=white"></a>`,
};

const replace = (text, name, value) => text.replace(new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`), (_, start, end) => `${start}${value}${end}`);

for (const file of Object.keys(badge)) {
  const before = readFileSync(file, 'utf8');
  const after = replace(replace(before, 'habr-list', `\n${list}\n`), 'habr-badge', badge[file]);
  if (after !== before) {
    writeFileSync(file, after);
    console.log(`${file}: ${articles.length} articles`);
  }
}
