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

 const subjectNames = {
  fa: ['재무회계'], cost: ['원가회계'], vat: ['부가가치세법', '부가가치세', '부가세'],
  income: ['소득세법', '소득세'], practice: ['실무']
 };
 const searchTerm = value => normalize(value).replace(/공제(?:금액|액)/g, '공제');
 const questionEndings = [
  /어떻게\s*(?:계산|구)(?:하나요|해요|하지|하는지|하는\s*법)$/u,
  /(?:교재\s*)?어디(?:에|에서|서)?\s*(?:있나요|있어요|보나요|봐요|찾나요|나오나요|인가요)?$/u,
  /(?:뭐예요|뭐에요|뭔가요|뭐죠|뭐야|무엇인가요|무엇인지|얼마예요|얼마인가요|얼마죠|알려\s*주세요|설명해\s*주세요)$/u
 ];
 const fillerWords = new Set(['어떤', '어디', '관련', '대해', '대해서', '교재', '부분', '내용', '계산', '방법', '공식']);

 function textbookHeadings(catalogs) {
  const headings = [];
  for (const catalog of catalogs) {
   const practice = catalog.lane === 'practice';
   const groups = new Map(catalog.groups.map(group => [group.id, group.title]));
   const books = { selpa: {
    name: practice ? '셀파 실무 교재' : '셀파 이론서',
    file: '01. 학습/' + catalog.sourceFile
   } };
   for (const entry of catalog.entries) {
    if (entry.kind !== 'concept' || !entry.pdfPages.length) continue;
    const [first, last] = entry.bookPages;
    headings.push({
     title: entry.title, subject: practice ? subjects.practice : groups.get(entry.group),
     chapter: groups.get(entry.group), books, summary: entry.summary,
     refs: [['selpa', first, last, '', null, entry.pdfPages[0], entry.pdfPages.at(-1)]]
    });
   }
  }
  return headings;
 }

 function inScope(entry, scope) {
  if (scope !== 'practice') return !subjects[scope] || entry.subject === subjects[scope];
  return entry.subject === subjects.practice || entry.refs.some(([key, first]) =>
   key === 'practice' || key === 'payroll' || (key === 'vat' && first >= 369)
  );
 }

 function searchDictionary(index, catalogs, value, scope = '') {
  const raw = normalize(value);
  if (raw.length < 2) return [];
  const sentence = String(value).normalize('NFKC').trim().replace(/[?!.]+$/u, '').trim();
  const cleaned = questionEndings.reduce((query, ending) => query.replace(ending, '').trim(), sentence)
   .replace(/^(?:교재|책)에서\s+/u, '');
  const topic = cleaned.replace(/(?:에\s*)?대해서?$/u, '').trim()
   .replace(/(?:이란|란|이랑|에서|은|는|이|가|을|를)(?=\s|$)/gu, '');
  const query = searchTerm(topic);
  const words = [...new Set(topic.split(/[^\p{L}\p{N}]+/u).map(searchTerm))]
   .filter(word => word.length >= 2 && !fillerWords.has(word));
  const queryForms = [...new Set([searchTerm(value), searchTerm(cleaned), query])].filter(term => term.length >= 2);
  const subjectOnly = Object.keys(subjectNames).find(key => subjectNames[key].includes(query));
  const formula = /공식|계산식|산식|계산법|계산방법|어떻게계산|어떻게구/.test(raw);
  const headings = textbookHeadings(catalogs);
  const introduction = subjectOnly !== 'practice' && headings.find(entry => entry.subject === subjects[subjectOnly]);
  const candidates = [...index, ...headings].filter(entry => inScope(entry, scope));
  const ranked = [];

  for (const entry of candidates) {
   const title = searchTerm(entry.title);
   const aliases = [...(entry.aliases || []), ...(entry.searchAliases || [])].map(searchTerm);
   const names = [title, ...aliases];
   const fields = [...names, ...(entry.cues || []).map(searchTerm),
    ...[entry.chapter, entry.summary, entry.formula, ...entry.refs.map(ref => ref[3])]
     .filter(Boolean).map(searchTerm)];
   let score = 0;
   if (subjectOnly) {
    if (subjectOnly === 'practice' ? !inScope(entry, 'practice') : entry.subject !== subjects[subjectOnly]) continue;
    // Put the start of the registered chapter ahead of its more specific entries.
    score = entry === introduction ? 200 : 100 - Math.min(99, Math.min(...entry.refs.map(ref => ref[1])));
   } else if (normalize(entry.title) === raw) {
    score = 1000;
   } else if (queryForms.includes(title)) {
    score = 950;
   } else if (aliases.some(alias => queryForms.includes(alias))) {
    score = 850;
   } else if (queryForms.some(term => title.includes(term))) {
    score = 680 + Math.round(40 * query.length / title.length);
   } else if (aliases.some(alias => queryForms.some(term => alias.includes(term)))) {
    score = 630;
   } else {
    const embedded = names.filter(name => name.length >= 3 && queryForms.some(term => term.includes(name)));
    const entrySubject = Object.keys(subjects).find(key => subjects[key] === entry.subject);
    const coversAllWords = words.length >= 2 && words.every(word =>
     subjectNames[entrySubject]?.includes(word) || fields.some(field => field.includes(word))
    );
    if (embedded.length) score = 470 + Math.min(20, Math.max(...embedded.map(name => name.length))) * 8;
    else if (coversAllWords) score = 410 + words.filter(word => title.includes(word)).length * 20;
    else if (fields.some(field => queryForms.some(term => field.includes(term)))) score = 320;
    else if (entry.cues?.filter(cue => query.includes(searchTerm(cue))).length >= 2) score = 300;
   }
   if (!score) continue;
   ranked.push({ entry, score: score + (entry.terms ? 4 : 0) + (!subjectOnly && formula && entry.formula ? 24 : 0) });
  }

  const seen = new Set();
  return ranked.sort((a, b) => b.score - a.score).flatMap(({ entry }) => {
   const key = `${entry.subject}:${normalize(entry.title)}`;
   if (seen.has(key)) return [];
   seen.add(key);
   return [entry];
  });
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

 const api = { createIndex, search, searchDictionary, referenceLocation, pdfURL, readingMatch, additionalReading, subjects };
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
  if (entry.summary) article.append(element('p', entry.summary));
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
 const [best, ...others] = searchDictionary(index, root.SemuonTextbook?.catalogs || [], query, scope);
 if (!best) {
  const empty = element('section', '', 'empty');
  empty.append(element('h2', '교재 사전에서 찾지 못했습니다'));
  if (scope) {
   const link = element('a', '전체 과목에서 검색', 'btn secondary');
   link.href = queryURL(query);
   empty.append(link);
  } else {
   empty.append(element('p', '과목명이나 핵심 단어로 다시 검색해 보세요.'));
  }
  results.append(empty);
  return;
 }
 const count = element('p', `검색 결과 ${others.length + 1}개`, 'dictionary-count');
 count.setAttribute('role', 'status');
 results.append(count, renderEntry(best, true));
 const more = element('button', '', 'btn secondary');
 more.type = 'button';
 let shown = 0;
 function showMore(moveFocus = false) {
  let firstSummary;
  for (const entry of others.slice(shown, shown + (shown ? 6 : 5))) {
   const details = element('details', '', 'dictionary-other');
   const summary = element('summary', entry.subject + ' · ' + entry.title);
   firstSummary ??= summary;
   details.append(summary, renderEntry(entry, false));
   results.insertBefore(details, more);
   shown++;
  }
  if (moveFocus) firstSummary?.focus();
  if (shown === others.length) more.remove();
  else more.textContent = `결과 더 보기 (${others.length - shown}개)`;
 }
 more.addEventListener('click', () => showMore(true));
 results.append(more);
 showMore();
})(globalThis);
