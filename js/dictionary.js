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

 const subjects = {
  fa: '재무회계', cost: '원가회계', vat: '부가가치세법', income: '소득세법', practice: '실무'
 };
 const subjectTerms = {
  fa: /재무회계/, cost: /원가회계/, vat: /부가가치세|부가세/, income: /소득세법|종합소득세/
 };

 function search(index, value, scope = '') {
  const query = normalize(value);
  if (query.length < 2) return [];
  const mentioned = Object.entries(subjectTerms).filter(([, pattern]) => pattern.test(query));
  const subject = subjects[scope] || (mentioned.length === 1 ? subjects[mentioned[0][0]] : '');
  const formula = /공식|계산식|산식|계산법|계산방법|어떻게계산|어떻게구/.test(query);
  const ranked = [];
  for (const entry of index) {
   if (scope === 'practice') {
    const includesPractice = entry.refs.some(([book, first]) =>
     book === 'practice' || book === 'payroll' || (book === 'vat' && first >= 369)
    );
    if (entry.subject !== subjects.practice && !includesPractice) continue;
   } else if (subject && entry.subject !== subject) continue;
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

 function referenceLocation(entry, ref, query = '') {
  const [key, first, last, note, anchor, explicitFirst, explicitLast] = ref;
  const book = entry.books[key];
  const pdfFirst = explicitFirst ?? first + book.pdfOffset;
  const pdfLast = explicitLast ?? last + book.pdfOffset;
  const value = normalize(query);
  const queryMark = entry.pdfQueryHighlights?.find(mark =>
   mark.books[key] && mark.terms.some(term => value.includes(normalize(term)))
  )?.books[key];
  const mark = queryMark || anchor;
  const [page, phrase] = Array.isArray(mark) ? mark : [null, mark];
  const target = page == null ? pdfFirst : explicitFirst ? page : page + book.pdfOffset;
  const validTarget = target >= pdfFirst && target <= pdfLast;
  return {
   book: book.name, file: book.file, first, last, pdfFirst, pdfLast,
   pdfPage: validTarget ? target : pdfFirst, phrase: validTarget ? phrase : null, note
  };
 }

 function pdfURL(base, { file, pdfPage, phrase }) {
  const url = new URL(file, base);
  url.hash = 'page=' + pdfPage;
  // PDF viewers without text fragment support still open the cited page.
  if (phrase) url.hash += ':~:text=' + encodeURIComponent(phrase).replace(/-/g, '%2D');
  return url.href;
 }

 function readingMatch(index, reading, problem) {
  if (reading.title === '교재 수록 문항') return null;
  const query = (problem.displayPrompt || problem.prompt || '').split(/[①②③④]/)[0];
  const words = [query, problem.type, ...(problem.answers || []).map(row => row.account)].filter(Boolean).join(' ');
  const same = (a, b) => normalize(a) === normalize(b);
  const headingHits = reading.title === '결산 정리 요점' ? [] : search(index, reading.title);
  for (const entry of [...new Set([...headingHits, ...search(index, words)])]) {
   for (const ref of entry.refs) {
    const location = referenceLocation(entry, ref, words);
    if (same(location.file, reading.file) && reading.pdfPages.includes(location.pdfPage)) {
     return { ...location, topic: entry.title, subject: entry.subject };
    }
   }
  }
  return null;
 }

 function additionalReading(index, problem) {
  const stem = (problem.displayPrompt || problem.prompt || '').split(/[①②③④]/)[0];
  const text = normalize([stem, problem.source?.subtopic, problem.type].filter(Boolean).join(' '));
  const entry = search(index, text, 'fa').find(candidate =>
   candidate.answerTerms?.some(term => text.includes(normalize(term)))
  );
  if (!entry) return null;
  const match = { ...referenceLocation(entry, entry.refs[0], text), topic: entry.title, subject: entry.subject };
  return { book: match.book, pages: String(match.first), title: entry.title, file: match.file,
   pdfPages: [match.pdfPage], match };
 }

 const api = { createIndex, search, referenceLocation, pdfURL, readingMatch, additionalReading, subjects };
 if (typeof module === 'object' && module.exports) {
  module.exports = api;
  return;
 }
 root.SemuonDictionarySearch = api;

 const doc = root.document;
 const queryInput = doc.querySelector('#dictionary-query');
 if (!queryInput) return;
 const params = new URLSearchParams(root.location.search);
 const theme = params.get('theme');
 if (['blue', 'linen', 'sage', 'slate', 'night'].includes(theme)) doc.documentElement.dataset.designTheme = theme;
 const subjectInput = doc.querySelector('#dictionary-subject');
 const scope = Object.hasOwn(subjects, params.get('subject')) ? params.get('subject') : '';
 subjectInput.value = scope;
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

 function queryURL(value, subject = '') {
  const url = new URL('dictionary.html', root.location.href);
  url.searchParams.set('q', value);
  if (subject) url.searchParams.set('subject', subject);
  if (theme) url.searchParams.set('theme', theme);
  return url.href;
 }

 if (theme && doc.documentElement.dataset.designTheme) {
  const hidden = element('input');
  Object.assign(hidden, { type: 'hidden', name: 'theme', value: theme });
  queryInput.form.append(hidden);
  for (const link of doc.querySelectorAll('.dictionary-examples a')) {
   const example = new URL(link.href).searchParams;
   link.href = queryURL(example.get('q'), example.get('subject'));
  }
 }

 function pages(first, last) {
  return first + (last === first ? '' : '–' + last) + '쪽';
 }

 function renderReferences(entry) {
  const grid = element('div', '', 'dictionary-books');
  const lists = new Map();
  for (const ref of entry.refs) {
   const [key] = ref;
   const book = entry.books[key];
   const location = referenceLocation(entry, ref, query);
   const { first, last, pdfFirst, pdfLast, note } = location;
   if (!lists.has(key)) {
    const section = element('section', '', 'dictionary-book');
    const list = element('ul');
    section.append(element('h4', book.name), list);
    grid.append(section);
    lists.set(key, list);
   }
   const row = element('li');
   const label = '교재 ' + pages(first, last);
   if (root.location.protocol === 'file:') {
    const link = element('a', label);
    Object.assign(link, {
     href: pdfURL(new URL('../', root.location.href), location),
     target: '_blank',
     rel: 'noopener',
     title: location.phrase ? '교재에서 핵심 용어 보기' : '교재 해당 쪽 열기'
    });
    row.append(link);
   } else {
    row.append(element('strong', label));
   }
   row.append(element('small', 'PDF ' + pages(pdfFirst, pdfLast)));
   if (note) row.append(element('span', note, 'dictionary-ref-title'));
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
    link.href = queryURL(topic, Object.keys(subjects).find(key => subjects[key] === entry.subject));
    links.append(link);
   }
   article.append(element('h3', '관련 개념'), links);
  }
  return article;
 }

 if (!query) return;
 const [best, ...others] = search(index, query, scope);
 if (!best) {
  const empty = element('section', '', 'empty');
  empty.append(element('h2', '일치하는 항목을 찾지 못했습니다'), element('p', '개념이나 공식 이름을 짧게 입력해 보세요.'));
  results.append(empty);
  return;
 }
 results.append(renderEntry(best, true));
 for (const entry of others) {
  const details = element('details', '', 'dictionary-other');
  details.append(element('summary', entry.subject + ' · ' + entry.title), renderEntry(entry, false));
  results.append(details);
 }
})(globalThis);
