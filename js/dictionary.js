(function (root) {
 'use strict';

 const normalize = value => String(value).normalize('NFKC').toLowerCase()
  .replace(/[^\p{L}\p{N}]/gu, '')
  .replace(/소독세/g, '소득세')
  .replace(/원천징수이행사항/g, '원천징수이행상황')
  .replace(/월급/g, '급여')
  .replace(/세금(?:을|이)?(?:안떼는|안붙는|붙지않는|떼지않는)/g, '비과세');

 function createIndex(catalogs) {
  return catalogs.flatMap(catalog => catalog.entries.map(entry => ({
   ...entry,
   subject: catalog.subject,
   books: catalog.books,
   terms: [...new Set([entry.title, ...(entry.aliases || [])].map(normalize))]
    .filter(term => term.length >= 2).sort((a, b) => b.length - a.length),
   cues: (entry.cues || []).map(normalize)
  })));
 }

 function search(index, value) {
  const query = normalize(value);
  if (query.length < 2) return [];
  const otherSubject = /부가가치세|부가세|재무회계|원가회계/.test(query);
  const formula = /공식|계산식|산식|계산법|계산방법|어떻게계산|어떻게구/.test(query);
  const ranked = [];
  for (const entry of index) {
   if (otherSubject && entry.subject === '소득세법' && !/소득세|원천징수|연말정산/.test(query)) continue;
   const match = entry.terms.find(term => query.includes(term));
   const cues = entry.cues.filter(cue => query.includes(cue)).length;
   if (!match && cues < 2) continue;
   const exact = query === match;
   const primary = match === normalize(entry.title);
   const score = (match ? 32 + Math.min(match.length, 16) * 5 : 35)
    + (exact ? 110 : 0) + (primary ? 8 : 0) + cues * 9
    + (formula && entry.formula ? 14 : 0);
   ranked.push({ entry, score });
  }
  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0]?.score ?? 0;
  return ranked.filter(hit => hit.score >= best * 0.43).slice(0, 6).map(hit => hit.entry);
 }

 if (typeof module === 'object' && module.exports) {
  module.exports = { createIndex, search };
  return;
 }

 const doc = root.document;
 const params = new URLSearchParams(root.location.search);
 const theme = params.get('theme');
 if (['blue', 'linen', 'sage', 'slate', 'night'].includes(theme)) doc.documentElement.dataset.designTheme = theme;
 const queryInput = doc.querySelector('#dictionary-query');
 const query = (params.get('q') || '').trim().slice(0, queryInput.maxLength);
 const results = doc.querySelector('#dictionary-results');
 queryInput.value = query;
 const index = createIndex(root.SemuonDictionaryCatalogs || []);

 function element(tag, text, className) {
  const node = doc.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
 }

 function queryURL(value) {
  const url = new URL('dictionary.html', root.location.href);
  url.searchParams.set('q', value);
  if (theme) url.searchParams.set('theme', theme);
  return url.href;
 }

 if (theme && doc.documentElement.dataset.designTheme) {
  const hidden = element('input');
  Object.assign(hidden, { type: 'hidden', name: 'theme', value: theme });
  queryInput.form.append(hidden);
  for (const link of doc.querySelectorAll('.dictionary-examples a')) {
   link.href = queryURL(new URL(link.href).searchParams.get('q'));
  }
 }

 function pages(first, last) {
  return first + (last === first ? '' : '–' + last) + '쪽';
 }

 function renderReferences(entry) {
  const grid = element('div', '', 'dictionary-books');
  const lists = new Map();
  for (const [key, first, end, caption] of entry.refs) {
   const book = entry.books[key];
   const last = typeof end === 'number' ? end : first;
   const note = caption || end;
   if (!lists.has(key)) {
    const section = element('section', '', 'dictionary-book');
    const list = element('ul');
    section.append(element('h4', book.name), list);
    grid.append(section);
    lists.set(key, list);
   }
   const row = element('li');
   const pdfFirst = first + book.pdfOffset;
   const pdfLast = last + book.pdfOffset;
   const label = '교재 ' + pages(first, last);
   if (root.location.protocol === 'file:') {
    const url = new URL('../' + book.file, root.location.href);
    url.hash = 'page=' + pdfFirst;
    const link = element('a', label);
    Object.assign(link, { href: url.href, target: '_blank', rel: 'noopener' });
    row.append(link);
   } else {
    row.append(element('strong', label));
   }
   row.append(element('small', 'PDF ' + pages(pdfFirst, pdfLast)));
   row.append(element('span', note, 'dictionary-ref-title'));
   lists.get(key).append(row);
  }
  return grid;
 }

 function renderEntry(entry, primary) {
  const article = element('article', '', primary ? 'dictionary-result card' : 'dictionary-result');
  if (primary) {
   article.append(element('p', entry.subject, 'dictionary-subject'), element('h2', entry.title));
  }
  article.append(element('p', entry.summary));
  if (entry.formula) article.append(element('p', entry.formula, 'dictionary-formula'));
  article.append(element('h3', '교재에서 보기'), renderReferences(entry));
  if (entry.related?.length) {
   const links = element('div', '', 'dictionary-related');
   for (const topic of entry.related) {
    const link = element('a', topic);
    link.href = queryURL(topic);
    links.append(link);
   }
   article.append(element('h3', '관련 개념'), links);
  }
  return article;
 }

 if (!query) return;
 const [best, ...others] = search(index, query);
 if (!best) {
  const empty = element('section', '', 'empty');
  empty.append(element('h2', '일치하는 항목을 찾지 못했습니다'), element('p', '소득세법 개념이나 공식 이름으로 검색해 보세요.'));
  results.append(empty);
  return;
 }
 results.append(renderEntry(best, true));
 for (const entry of others) {
  const details = element('details', '', 'dictionary-other');
  details.append(element('summary', entry.title), renderEntry(entry, false));
  results.append(details);
 }
})(globalThis);
