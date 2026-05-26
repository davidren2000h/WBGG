// Wikipedia API client (PRD §5, §6.1, §7.2)
// Calls language-specific Wikipedia endpoints directly from the browser.
// MediaWiki action API supports CORS via `origin=*`.

const API = (lang) => `https://${lang}.wikipedia.org/w/api.php`;
const REST = (lang) => `https://${lang}.wikipedia.org/api/rest_v1`;

// Generic / hidden-style category prefixes to drop (PRD §6.1 filtering).
const GENERIC_PATTERNS = {
  en: [
    /^living people$/i,
    /^\d{4} births$/i,
    /^\d{4} deaths$/i,
    /articles with/i,
    /^all .* articles/i,
    /wikipedia articles/i,
    /cs1/i,
    /short description/i,
    /webarchive/i,
    /pages /i,
    /use dmy dates/i,
    /use mdy dates/i,
    /commons category/i,
    /coordinates on wikidata/i
  ],
  zh: [
    /^在世人物$/,
    /^\d{4}年出生$/,
    /^\d{4}年逝世$/,
    /含有/,
    /使用.*的条目/,
    /含有.*的条目/,
    /有.*的条目/,
    /^自/,
    /CS1/i,
    /模板/,
    /维基/,
    /消歧义/
  ]
};

async function jsonp(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Fetch a batch of random article titles in the main namespace.
export async function getRandomTitles(lang, count = 10) {
  const url =
    `${API(lang)}?action=query&format=json&origin=*` +
    `&list=random&rnnamespace=0&rnlimit=${count}`;
  const data = await jsonp(url);
  return (data?.query?.random ?? []).map((r) => r.title);
}

// Fetch the categories for a given article title.
export async function getCategories(lang, title) {
  const url =
    `${API(lang)}?action=query&format=json&origin=*` +
    `&prop=categories&cllimit=max&clshow=!hidden` +
    `&titles=${encodeURIComponent(title)}`;
  const data = await jsonp(url);
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (!page || page.missing) return [];
  const raw = page.categories ?? [];
  // Strip the "Category:" / "分类:" prefix.
  return raw.map((c) => c.title.replace(/^[^:]+:/, ''));
}

// Fetch the REST summary (used for hint + "read more" link).
export async function getSummary(lang, title) {
  const url = `${REST(lang)}/page/summary/${encodeURIComponent(title)}`;
  try {
    const data = await jsonp(url);
    return {
      title: data.title,
      displaytitle: data.displaytitle,
      extract: data.extract,
      url:
        data.content_urls?.desktop?.page ??
        `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      type: data.type
    };
  } catch {
    return null;
  }
}

// Decide whether a category is usable as a clue.
function isUsableCategory(category, answer, lang) {
  const patterns = GENERIC_PATTERNS[lang] ?? [];
  if (patterns.some((re) => re.test(category))) return false;
  // PRD §6.1: drop categories containing the answer keyword.
  const a = answer.toLowerCase();
  const c = category.toLowerCase();
  if (a && c.includes(a)) return false;
  // For multi-word answers, also drop if any token > 3 chars is present.
  for (const tok of a.split(/\s+/)) {
    if (tok.length > 3 && c.includes(tok)) return false;
  }
  return true;
}

function pickRandom(arr, k) {
  const copy = [...arr];
  const out = [];
  while (out.length < k && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

// Build a question for the chosen language (PRD §8.1).
// Tries several random articles until one yields enough clean clues.
export async function generateQuestion(lang, { minClues = 3, maxClues = 5 } = {}) {
  const titles = await getRandomTitles(lang, 12);
  for (const title of titles) {
    // Skip disambiguation-ish titles fast.
    if (/disambiguation|消歧义|\(列表\)|\(list\)/i.test(title)) continue;
    const cats = await getCategories(lang, title);
    const usable = cats.filter((c) => isUsableCategory(c, title, lang));
    if (usable.length < minClues) continue;
    const clues = pickRandom(usable, Math.min(maxClues, usable.length));
    return {
      id: `${lang}:${title}`,
      language: lang,
      answer: title,
      clues
    };
  }
  throw new Error('No suitable question found');
}
