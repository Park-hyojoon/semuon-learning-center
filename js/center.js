/* Isolated tax2 state + adapters for the shared accounting input/grade/review modules. */
(async function(){
 'use strict';const C=SemuonCore,R=TrainingReview,V=SemuonReviewPlan,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],page=document.body.dataset.page||'home';
 const rootURL=new URL(page==='home'?'./':'../',location.href),legacyURL=new URL('shared/',rootURL);
 const routeParams=new URLSearchParams(location.search);
 const registrationWindow=page==='quiz'&&routeParams.get('course')!=='income'&&routeParams.get('sample')==='employee-klab'&&routeParams.get('view')==='window';
 const resume=registrationWindow?null:globalThis.SemuonResume?.open(rootURL,page);
 if(resume?.redirected)return;
 const store=SemuonStore.open();
 if(page==='roadmap'){location.replace(new URL(location.hash==='#rm-add'?'pages/journal.html#rm-add':'index.html',rootURL));return}
 const href=path=>new URL(path,rootURL).href,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),nl=v=>esc(v).replace(/\r?\n/g,'<br>');
 // Retired exams remain in storage and complete backups; every learning view uses only available items.
 const available=p=>!(Number(p.source.round)>0&&Number(p.source.round)<=105);
 let snapshotRevision=-1,snapshotValue,storedValue;function storedSnapshot(){if(snapshotRevision!==store.revision){storedValue=store.get();const items=storedValue.items.filter(available),ids=new Set(items.map(p=>p.id));snapshotValue={...storedValue,items,history:storedValue.history.filter(e=>ids.has(e.problemId))};snapshotRevision=store.revision}return storedValue}function snapshot(){storedSnapshot();return snapshotValue}
 let editor=null;const nav=[['home','⌂','학습 홈','index.html'],['theory','▤','이론 학습','pages/theory.html'],['practice-learning','▦','실무 학습',null],['status','◇','학습 현황',null],['review','↺','오늘 복습','pages/review.html'],['settings','⚙','설정 · 백업','pages/settings.html'],['guide','▤','디자인 가이드','pages/guide.html']];
 const practiceMenu=[
  ['practical','일반전표 입력','pages/general.html'],
  ['voucher','매입매출전표 입력','pages/voucher.html'],
  ['forms','신고서 · 급여','pages/forms.html']
 ];
 const quizCourse=new URLSearchParams(location.search).get('course')==='income'?'income':'withholding';
 const quizSample=quizCourse==='withholding'?new URLSearchParams(location.search).get('sample'):'';
 const registrationSample=quizSample==='employee-klab';
 const employeeSample=['employee','employee-family'].includes(quizSample);
 const employeePath='pages/quiz.html?course=withholding&sample=employee-family';
 const registrationPath='pages/quiz.html?course=withholding&sample=employee-klab';
 const conceptGuide=$('#concept-guide-template')?.content;
 const conceptSubjects=[['fa','재무회계'],['vat','부가가치세법'],['cost','원가회계'],['income','소득세법']];
 const conceptArticles=conceptGuide?[...conceptGuide.querySelectorAll('[data-concept-subject]')]:[];
 const requestedConcept=conceptGuide&&new URLSearchParams(location.search).get('subject');
 const selectedConcept=conceptArticles.find(article=>article.dataset.conceptSubject===requestedConcept)||conceptArticles[0];
 function theoryNavigation(icon,label,path){
  const links=conceptSubjects.map(([id,name])=>`<a data-sub-menu-id="sub:concepts:${id}" href="${href('pages/concepts.html?subject='+id)}" ${selectedConcept?.dataset.conceptSubject===id?'class="active" aria-current="page"':''}>${name}</a>`);
  return `<details class="app-nav-group" data-menu-id="theory" open>
    <summary><span aria-hidden="true">${icon}</span><a class="menu-parent-link" href="${href(path)}" ${page==='theory'?'aria-current="page"':''}>${label}</a></summary>
    <div class="app-subnav">${links.join('')}<a data-sub-menu-id="sub:quiz:income" data-menu-parent-id="sub:concepts:income" href="${href('pages/quiz.html?course=income')}" ${page==='quiz'&&quizCourse==='income'?'class="active" aria-current="page"':''}>핵심 퀴즈</a></div>
  </details>`;
 }
 function practiceNavigation(icon,label){
  const links=practiceMenu.map(([id,name,path])=>`<a data-sub-menu-id="${id}" href="${href(path)}" ${page===id?'class="active" aria-current="page"':''}>${name}</a>`);
  return `<details class="app-nav-group" data-menu-id="practice-learning" open>
   <summary><span aria-hidden="true">${icon}</span><span>${label}</span></summary>
   <div class="app-subnav">${links.join('')}<a data-sub-menu-id="sub:quiz:withholding" href="${href('pages/quiz.html?course=withholding')}" ${page==='quiz'&&quizCourse==='withholding'&&!employeeSample&&!registrationSample?'class="active" aria-current="page"':''}>원천징수 핵심 퀴즈</a><a data-sub-menu-id="sub:quiz:employee" href="${href(employeePath)}" ${page==='quiz'&&employeeSample?'class="active" aria-current="page"':''}>사원 등록</a><a data-sub-menu-id="sub:quiz:employee-klab" data-menu-parent-id="sub:quiz:employee" href="${href(registrationPath)}" ${page==='quiz'&&registrationSample?'class="active" aria-current="page"':''}>K랩</a></div>
  </details>`;
 }
 document.body.classList.add('semuon');document.body.innerHTML=`<aside class="app-sidebar"><a class="app-brand" href="${href('index.html')}"><img src="${href('assets/favicon.svg')}" alt=""><span>세무온<small>전산세무 2급 학습센터</small></span></a><button class="btn secondary mobile-menu" aria-expanded="false" aria-controls="app-nav" type="button">☰<span class="sr-only">메뉴 열기</span></button><nav id="app-nav" class="app-nav" aria-label="주 메뉴">${nav.map(([key,icon,label,path])=>key==='theory'?theoryNavigation(icon,label,path):key==='practice-learning'?practiceNavigation(icon,label):key==='settings'?`<details class="app-nav-group ${['settings','database'].includes(page)?'is-active':''}" data-menu-id="settings" open><summary><span>⚙</span><span>설정 · 백업</span></summary><div class="app-subnav"><a href="${href('pages/settings.html')}" ${page==='settings'?'class="active"':''}>설정 · 백업</a><a href="${href('pages/database.html')}" ${page==='database'?'class="active" aria-current="page"':''}>데이터베이스 현황</a></div></details>`:key==='status'?`<details class="app-nav-group ${['progress','map','journal','roadmap'].includes(page)?'is-active':''}" data-menu-id="status" open><summary><span aria-hidden="true">${icon}</span><span>${label}</span></summary><div class="app-subnav"><a href="${href('pages/learning-map.html')}" ${page==='map'?'class="active" aria-current="page"':''}>나의 학습 지도</a><a href="${href('pages/journal.html')}" ${page==='journal'?'class="active" aria-current="page"':''}>학습 기록</a></div></details>`:`<a data-menu-id="${key}" href="${href(path)}" ${key===page?'class="active" aria-current="page"':''}><span aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('')}</nav></aside><main class="app-main"><header class="app-topbar"><p class="app-date">${new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'full'}).format(new Date())}</p>${SemuonFullscreen.button()}</header><div id="save-status" class="notice error" role="alert" hidden></div><div id="content"></div><footer class="app-footer">세무온 · 전산세무 2급 전용 · <a href="${href('pages/settings.html')}">백업 · 설정</a></footer></main><div class="toast" role="status" hidden></div>`;
 const content=$('#content');let toastTimer;
 function paintStudyLanes(root){
  if(!root||root.nodeType!==1)return;
  const skip='script,style,textarea,input,select,option,svg,[contenteditable],.study-lane,[data-entry-host],#questions,.jr-note-read,.jr-md-preview,.jr-note-preview,.jr-entry-note,.concept-guide';
  if(root.closest(skip))return;
  const links=new Set([...(root.matches('a')?[root]:[]),...root.querySelectorAll('a'),...(root.closest('a')?[root.closest('a')]:[])]);
  for(const link of links){if(!link.closest(skip)&&!link.closest('svg')&&!link.matches('.btn,.open-link')&&link.textContent.trim().length<100&&/[→←↗↘↑↓]/.test(link.textContent))link.classList.add('compact-action-link')}

  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
  while(node=walker.nextNode())if(!node.parentElement.closest(skip)&&/(이론|실무)/.test(node.data))nodes.push(node);
  for(const text of nodes){if(text.parentElement.matches('h1,h2,h3,strong,summary,.eyebrow,.pill')&&/^[^이론실무]+\s+(이론|실무)$/.test(text.data))text.data=text.data.replace(/^(.+?)\s+(이론|실무)$/,'$2 $1');const fragment=document.createDocumentFragment(),re=/(이론|실무)/g;let last=0,m;while(m=re.exec(text.data)){fragment.append(text.data.slice(last,m.index));const span=document.createElement('strong');span.className='study-lane '+(m[1]==='이론'?'study-lane-theory':'study-lane-practice');span.textContent=m[1];fragment.append(span);last=re.lastIndex}fragment.append(text.data.slice(last));text.replaceWith(fragment)}
 }
 const laneObserver=new MutationObserver(changes=>{const roots=new Set();for(const change of changes){if(change.type==='characterData'){if(change.target.parentElement&&!change.target.parentElement.closest('.study-lane'))roots.add(change.target.parentElement)}else for(const node of change.addedNodes){if(node.nodeType===1&&!node.matches('.study-lane'))roots.add(node);else if(node.nodeType===3&&node.parentElement&&!node.parentElement.closest('.study-lane'))roots.add(node.parentElement)}}for(const root of roots)if(root.isConnected)paintStudyLanes(root)});
 laneObserver.observe(document.body,{childList:true,subtree:true,characterData:true});paintStudyLanes(document.body);

 function toast(message,undo){const box=$('.toast');box.replaceChildren(document.createTextNode(message));if(undo){const b=document.createElement('button');b.type='button';b.className='toast-undo';b.textContent='되돌리기';b.onclick=()=>{box.hidden=true;undo()};box.append(' ',b)}box.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.hidden=true,undo?1000:5000)}
 SemuonFullscreen.install({notify:message=>toast(message)});
 // 학습 센터의 ‘✓ 알고 있어요 · 통과 / ↻ 틀렸어요 · 다시 연습’. 답안 없이 직접 표시 기록(semuon-self)을 남기며 채점 취소와 같은 방식으로 되돌린다.
 function selfButtons(p,done){const pass=document.createElement('button'),wrong=document.createElement('button');pass.type=wrong.type='button';pass.className='btn secondary notebook-pass';wrong.className='btn secondary notebook-wrong';pass.textContent='✓ 알고 있어요 · 통과';wrong.textContent='↻ 틀렸어요 · 다시 연습';
  const mark=correct=>act(()=>{const e=store.mark(p,correct);retireProblemMarks(p.id);done();toast(correct?'통과로 기록했습니다.':'다시 연습할 문제로 기록했습니다.',()=>act(()=>{store.cancel(e.id);done();if(isGeneral(p))$('#questions')?.dispatchEvent(new CustomEvent('semuon-general-undo',{detail:{problemId:p.id}}));toast('직접 표시를 되돌렸습니다.')}));if(correct&&isGeneral(p))pass.dispatchEvent(new CustomEvent('semuon-general-pass',{bubbles:true,detail:{problemId:p.id}}))});pass.onclick=()=>mark(true);wrong.onclick=()=>mark(false);return[pass,wrong]}
 document.addEventListener('semuon-general-pass',e=>{const card=e.target.closest('.question');if(!card)return;if(TrainingComboReview.active(comboKey)){card.remove();const remaining=$('#questions .question');if(remaining)remaining.scrollIntoView({block:'start',behavior:'smooth'});else $('#questions').insertAdjacentHTML('beforeend','<p class="notice">일반전표 복습을 마쳤습니다.</p>');return}let search='';try{search=sessionStorage.getItem('semuon-tax2-list-practical')||''}catch(_){}const url=new URL(href('pages/general.html')+search);url.searchParams.delete('scope');url.searchParams.delete('id');SemuonFullscreen.navigate(url.href)});
 function resetButton(p,run){const b=document.createElement('button');b.type='button';b.className='btn secondary reset-one';b.textContent='초기화';b.onclick=()=>{if(confirm(p.initialEntry?.subject===p.subject?'수정 전 입력으로 되돌릴까요? 채점·학습기록은 보존됩니다.':'이 문제에 입력한 답안만 초기화할까요? 채점·학습기록은 보존됩니다.'))act(run)};return b}
 let problemReportsSyncing=false,reportQueueRevision=-1,reportQueue;
 function pendingProblemReports(){
  if(reportQueueRevision!==store.revision){reportQueue=C.pendingProblemReports(storedSnapshot());reportQueueRevision=store.revision}
  return reportQueue;
 }
 function saveProblemReport(problemId,open,quiz){
  if(problemReportsSyncing){toast("동기화가 끝난 뒤 다시 눌러 주세요.");return false}
  if(pendingProblemReports().has(problemId)===open)return false;
  store.update(state=>{
   const reports=state.problemReports||(state.problemReports=[]);
   const last=reports.filter(e=>e.problemId===problemId).reduce((time,e)=>Math.max(time,Date.parse(e.at)),0);
   reports.push({id:crypto.randomUUID(),problemId,open,at:new Date(Math.max(Date.now(),last+1)).toISOString(),...(quiz?{quiz}:{})});
  });
  return true;
 }
 function problemReportButton(problemId,quiz){
  const button=document.createElement("button");
  button.type="button";
  button.className="btn secondary problem-report-button";
  const paint=()=>{
   const saved=pendingProblemReports().has(problemId);
   button.textContent=saved?"오류 확인 요청됨":"오류 확인 요청";
   button.setAttribute("aria-disabled",String(saved));
  };
  paint();
  button.onclick=()=>act(()=>{
   if(saveProblemReport(problemId,true,quiz)){paint();toast("학습 기록에 오류 확인 요청을 담았습니다.")}
  });
  return button;
 }
 document.addEventListener("semuon-before-sync",e=>{if(!e.defaultPrevented)problemReportsSyncing=true});
 document.addEventListener("semuon-sync-finished",e=>{if(!e.detail.succeeded)problemReportsSyncing=false});
 function fail(e){$('#save-status').textContent=e.message||String(e);$('#save-status').hidden=false}
 function act(fn){try{return fn()}catch(e){fail(e);return null}}
 function retireProblemMarks(id){globalThis.SemuonMarkup?.retire(id);globalThis.SemuonQuizInk?.retire(id)}
 function recordAnswer(p,input){const event=store.record(p,input);retireProblemMarks(p.id);return event}
 function head(title,description,action=''){return`<header class="page-head"><div><p class="eyebrow">전산세무 2급</p><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action}</header>`}
 function empty(message='확인된 문제가 아직 없습니다.'){return`<section class="empty"><h2>${message}</h2><p>확인된 기출 문제가 추가되면 이곳에서 바로 풀 수 있습니다.</p></section>`}
 function download(name,value,type='application/json'){const url=URL.createObjectURL(new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
 function link(p,review=false){const path=p.subject==='practical'?'general':p.subject==='voucher'?'voucher':'theory';return href(`pages/${path}.html?id=${encodeURIComponent(p.id)}${review?'&review=1':''}`)}
 let analysisKey='',analysisGroups=[],eventKey='',eventsByProblem=new Map();function historyFor(id){const key=store.revision+'|'+R.day(Date.now());if(eventKey!==key){eventsByProblem=new Map();for(const e of C.active(snapshot())){if(!eventsByProblem.has(e.problemId))eventsByProblem.set(e.problemId,[]);eventsByProblem.get(e.problemId).push(e)}for(const list of eventsByProblem.values())list.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));eventKey=key}return eventsByProblem.get(id)||[]}
 function groups(){const key=store.revision+'|'+R.day(Date.now());if(analysisKey!==key){const s=snapshot();analysisGroups=V.analyze(s);analysisKey=key}return analysisGroups}
 const DESIGN_THEMES=[["default", "T", "세무온 기본", "익숙한 초록과 따뜻한 바탕"], ["blue", "B", "밸런스 블루", "맑고 산뜻한 블루"], ["linen", "L", "웜 리넨", "차분하고 따뜻한 종이빛"], ["sage", "S", "코지 세이지", "편안한 세이지 그린"], ["slate", "C", "쿨 슬레이트", "단정한 블루 그레이"], ["night", "N", "나이트 포커스", "눈부심을 낮춘 어두운 바탕"]];
 const THEME_PREVIEWS={"blue": ["#f2f6f8", "#fff", "#337fb0", "#73a6bd", "#a4a9b5", "#d0ad78"], "linen": ["#f8f3ec", "#fffdfa", "#956344", "#cc9b77", "#aaa096", "#c69b57"], "sage": ["#f2f5ee", "#fffef9", "#51765c", "#9db39b", "#a9ada5", "#c5a477"], "slate": ["#ebf1f5", "#fff", "#496783", "#7fa1b1", "#8d9aa8", "#bdab88"], "night": ["#17232f", "#233342", "#76b7dc", "#79aeb5", "#93a2b5", "#d0ad78"]};
 function currentTheme(){const value=snapshot().settings.designTheme;return DESIGN_THEMES.some(t=>t[0]===value)?value:'default'}
 function applyTheme(){document.documentElement.dataset.designTheme=currentTheme()}
 function themeSettingsHTML(){return `<section class="card"><h2>디자인 템플릿</h2><div class="theme-options" role="group" aria-label="디자인 템플릿 선택">${DESIGN_THEMES.map(([id,icon,title,note])=>{const p=THEME_PREVIEWS[id]||['#f8f5f1','#fffdf9','#155e59','#76a7ae','#999eae','#d2ac72'];return `<button type="button" class="theme-option" data-design-theme="${id}" aria-pressed="${currentTheme()===id}"><span class="theme-preview" aria-hidden="true" style="--preview-bg:${p[0]};--preview-card:${p[1]};--preview-accent:${p[2]}"><i></i><span><b></b><em>${p.slice(2).map(c=>`<i style="background:${c}"></i>`).join('')}</em></span></span><strong>${title}</strong><small>${note}</small><span class="theme-selected">${currentTheme()===id?'✓ 사용 중':'선택하기'}</span></button>`}).join('')}</div><p class="help" id="theme-status" role="status"></p></section>`}
 function applyFont(){const f=C.fontPreferences(snapshot().settings),style=document.documentElement.style;style.setProperty('--font-body',(f.fontBodyPt*96/72)+'px');style.setProperty('--font-ui',(f.fontUiPt*96/72)+'px');style.setProperty('--font-body-family',C.FONT_FAMILIES[f.fontBodyFamily].css);style.setProperty('--font-ui-family',C.FONT_FAMILIES[f.fontUiFamily].css)}
 function table(e){return e?`<figure class="table-scroll"><figcaption>${esc(e.caption||'증빙 자료')}</figcaption><table>${e.headers?.length?`<thead><tr>${e.headers.map(v=>`<th>${esc(v)}</th>`).join('')}</tr></thead>`:''}<tbody>${e.rows.map(r=>`<tr>${r.map(v=>`<td>${nl(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></figure>`:''}
 function materialBlocks(blocks){return blocks.map(b=>typeof b==='string'?`<p>${nl(b)}</p>`:materialTable(b)).join('')}
 function materialTable(b){return`<figure class="table-scroll problem-material-table"><figcaption>${esc(b.caption||'문제 자료')}</figcaption><table><tbody>${b.rows.map((r,i)=>`<tr>${r.map(c=>{const tag=i<(b.headerRows||0)?'th':'td';return`<${tag}${c.colspan>1?` colspan="${c.colspan}"`:''}${c.rowspan>1?` rowspan="${c.rowspan}"`:''}>${c.blocks?materialBlocks(c.blocks):nl(c.text)}</${tag}>`}).join('')}</tr>`).join('')}</tbody></table></figure>`}
 // Reflow PDF/OCR line wraps in general-journal prose; originals and structured evidence stay intact.
 function flowingText(value){return String(value).replace(/하[ \t]*\r?\n\s*(?=여(?:\s|[,.]))/g,'하').replace(/[ \t]*\r?\n(?:[ \t]*\r?\n)*[ \t]*/g,' ').trim()}
 function formText(value,plainTable=false){
  const item=/^(?:[ㆍ·•∙▪■□○◦※-]|[①-⑳]|\[\d+\]|\(?\d+[.)]\s|<[^>]+>)/u;
  const heading=/^(?:<[^>]+>|\[[^\]]+\])$/u;
  const tableRow=line=>/\S(?:\t| {2,})\s*\S/u.test(line);
  // OCR may insert empty lines between wrapped lines of the same paragraph.
  const lines=String(value).split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  return lines.map((line,i)=>{
   const previous=lines[i-1];
   if(i===0)return line;
   if(item.test(line)||heading.test(line)||heading.test(previous)||
     (plainTable&&(tableRow(previous)||tableRow(line))))return '\n'+line;
   // Keep common OCR-split verb endings attached to their stem.
   const joined=/(?:지급|처리|계산|작성|입력|등록|신고|공제|적용|이체|부담)$/u.test(previous)
    && /^(?:하며|하고|하여|하였다|합니다|하시오|되며|된다)(?=[\s,.)]|$)/u.test(line)
    || /하$/u.test(previous)&&/^여(?=[\s,.)]|$)/u.test(line);
   return (joined?'':' ')+line;
  }).join('').replace(/\[급여자료\s+입력\]/gu,'[급여자료입력]');
 }
 function formConditions(p){
  const prompt=p.displayBlocks?.length
   ?materialBlocks(p.displayBlocks.map(block=>typeof block==='string'?formText(block):block))
   :promptHtml(formText(displayText(p),true));
  return `<div class="evidence-preview" data-question-conditions><div class="question-conditions-source">
   <div class="prompt">${prompt}</div>${exhibits(p,false,'conditions')}
  </div></div>`;
 }
 function problemHtml(p){const flowing=p.subject==='voucher'||p.subject==='practical'&&SemuonCurriculum.practiceGroup(p)==='general';return p.displayBlocks?.length?materialBlocks(flowing?p.displayBlocks.map(b=>typeof b==='string'?flowingText(b):b):p.displayBlocks):flowing?esc(flowingText(displayText(p))):promptHtml(displayText(p))}
 function exhibits(p,hideTable=false,inlineEvidence=false){const html=globalThis.SemuonExhibits?.[p.id];return(hideTable||p.displayHideExhibit||p.exhibitRenderer==='registry'&&html?'':table(p.exhibit))+(html||evidence(p,inlineEvidence))}
 function evidence(p,inline=false){
  const files=p.source.evidence||[];
  const images=files.filter(f=>/^data:image\//.test(f.data));
  const downloads=files.filter(f=>!/^data:image\//.test(f.data));
  const originalDownloads=downloads.map(f=>`<p><a href="${f.data}" download="${esc(f.name)}">${esc(f.name)} 원본 저장</a></p>`).join('');
  if(inline==='conditions')return images.map((f,i)=>
   `<img class="question-conditions-image" loading="lazy" src="${f.data}" alt="증빙 ${i+1}">`
  ).join('')+originalDownloads;
  const preview=images.length?`<div class="evidence-preview"${inline?' data-evidence-inline':''}>
    ${inline?'':`<button type="button" class="btn secondary evidence-quick" aria-haspopup="dialog" aria-expanded="false">증빙 보기${images.length>1?' · '+images.length+'장':''}</button>`}
    <template>${images.map((f,i)=>`<img src="${f.data}" alt="증빙 ${i+1}">`).join('')}</template>
   </div>`:'';
  return preview+originalDownloads;
 }
 function sourceBox(p){const original=globalThis.SemuonExhibits?.[p.id]&&(p.source.evidence||[]).length?`<details><summary>첨부 증빙 원본 이미지</summary><div>${evidence(p)}</div></details>`:'';return original+`<p class="topic-source">${esc(p.source.name)}${p.source.round?' · '+esc(p.source.round)+'회':''} · 문항 ${esc(p.source.questionNo)}</p><details><summary>원문 · 정답 확인 자료</summary><div><p>정답 확인: ${esc(p.source.answerReference)}</p><pre class="original-text">${esc(p.source.originalText)}</pre><details><summary>원본 정답</summary><div class="original-text">${esc(p.source.answerText)}</div></details>${p.source.originalDocument?`<details><summary>접수 TXT 전체 원문</summary><div class="original-text">${esc(p.source.originalDocument)}</div></details>`:''}${p.source.originalFile?.data?`<a href="${p.source.originalFile.data}" download="${esc(p.source.originalFile.name)}">원본 파일 저장</a>`:''}</div></details>`}
 function statsCards(){const s=snapshot(),v=C.stats({...s,history:s.history.filter(e=>e.source==='semuon-grade')});return`<section class="stat-grid"><div class="stat"><span>등록 문제</span><strong>${v.registered}</strong></div><div class="stat"><span>채점한 문제</span><strong>${v.solved}</strong></div><div class="stat"><span>현재 오답 문제</span><strong>${v.wrong}</strong></div><div class="stat"><span title="문제마다 한국 날짜별 첫 실제 채점 결과">첫 채점 정답률</span><strong>${v.firstRate===null?'—':v.firstRate+'%'}</strong></div></section>`}
 function home(){const s=snapshot(),book=SemuonProgress.analyze(s),gs=groups(),queue=V.select(gs,{limit:s.settings.reviewLimit||6}),done=gs.filter(g=>g.practicedToday).length,map=SemuonLearningMap.analyze(s,{scope:'theory'}),entryIds=new Map(C.SUBJECTS.map(subject=>[subject,new Set(s.items.filter(p=>subject==='theory'?p.subject==='theory':SemuonCurriculum.practiceGroup(p)===(subject==='practical'?'general':'voucher')).map(p=>p.id))]));
  content.innerHTML=`<section class="cards-grid home-entry-cards">${C.SUBJECTS.map(subject=>`<article class="card"><h2>${C.labels[subject]}</h2><p>등록 ${entryIds.get(subject).size}문제 · 채점 ${C.active(s).filter(e=>entryIds.get(subject).has(e.problemId)).length}회</p><a class="btn secondary" href="${href('pages/'+(subject==='practical'?'general':subject==='voucher'?'voucher':'theory')+'.html')}">문제 풀기 →</a></article>`).join('')}</section>`+'<div id="home-planning"></div>'+head('오늘도 한 걸음씩, 합격을 향해.','등록 문제와 실제 채점기록으로 학습을 이어갑니다.',`<a class="btn" href="${href('pages/review.html')}">오늘 복습 시작 →</a>`)+`<section class="card home-review-map" id="home-review"><div class="home-review-copy"><div class="row spread"><h2>오늘의 복습</h2><span class="pill">오늘 ${done}유형 연습</span></div><p class="rm-review-context">먼저 아래 복습으로 배운 내용을 확인한 뒤, 상단의 이번 주 진도를 이어가세요. 복습은 학습 이력에 따라 여러 과목에서 추천됩니다.</p>${V.primersHTML(V.primers(book.tasks,queue),href,{heading:book.tasks[0]?(book.tasks[0].mode==='theory'?'이론':'실무')+' '+book.tasks[0].unit.course:queue[0]?(queue[0].field==='theory'?'이론':'실무')+' '+queue[0].area:'오늘의 핵심 원리'})}<p>${queue.length?`지금 시작할 추천 ${queue.length}유형이 있습니다.`:s.items.length?'현재 추천할 유형이 없습니다. 다음 복습일을 확인하세요.':'먼저 문제를 등록해 주세요.'}</p><a class="btn secondary" href="${href('pages/review.html')}">복습 목록 보기</a> <a class="btn secondary" href="${href('pages/review.html?day=tomorrow')}">내일 복습 보기</a></div>${SemuonLearningMap.homeHTML(map,href)}</section>`;
  SemuonRoadmap.mount($('#home-planning'),{getState:storedSnapshot,save:fn=>store.update(fn),href,notify:toast,mode:'home',onPlanChange:()=>{
   const map=SemuonLearningMap.analyze(snapshot(),{scope:'theory'});
   $('.hm-overview').outerHTML=SemuonLearningMap.homeHTML(map,href);
  }});
 }
 function learningMap(){const params=new URLSearchParams(location.search),ref=SemuonTextbook.get(params.get('book'));if(ref){const lane=SemuonTextbook.theoryCatalog.entries.includes(ref)?'theory':'practice';params.set('scope',lane);params.set('course',(lane==='practice'?'practice:':'')+ref.group)}content.innerHTML=head('나의 학습 지도','이론 채점과 교재의 개념 학습·실습 시도를 구별해 확인하세요.')+'<div id="learning-map"></div>';SemuonLearningMap.mount($('#learning-map'),snapshot(),{href,initialCourse:params.get('course')||'fa',initialScope:params.get('scope')||'all',initialPillar:params.get('pillar')||'',onSelection:({course,scope,pillar})=>{const url=new URL(location.href);url.searchParams.set('course',course);scope==='all'?url.searchParams.delete('scope'):url.searchParams.set('scope',scope);pillar?url.searchParams.set('pillar',pillar):url.searchParams.delete('pillar');history.replaceState(null,'',url)}})}

 async function unitReviewPage(){
  const P=SemuonProgress,params=new URLSearchParams(location.search),data=P.analyze(snapshot()),mode=params.get('mode')==='practice'?'practice':'theory',unit=data.units.find(u=>u.id===params.get('unit'));
  C.assert(unit,'복습할 소단원을 확인해 주세요.');const preview=P.validDate(params.get('preview'))&&params.get('preview')>data.today?params.get('preview'):null,plan=P.unitPlan(data,unit.id,mode,preview||data.today),requested=[...new Set((params.get('ids')||plan.entries.map(r=>r.problem.id).join(',')).split(','))].slice(0,3),items=requested.map(id=>unit.problems.find(p=>p.id===id&&(p.subject==='theory'?'theory':'practice')===mode)).filter(Boolean);
  const back=`<a class="btn secondary" href="${href('pages/review.html')}">복습 목록으로 →</a>`;
  if(preview){content.innerHTML=head('복습 내용 미리보기',(mode==='theory'?'이론 ':'실무 ')+unit.course+' · '+unit.label,back)+`<section class="card"><h2>${preview} 복습 · ${mode==='theory'?'이론':'실무'}</h2><p>${items.length}문제 · 예상 약 ${plan.minutes}분</p><ul class="pr-plan-concepts">${items.map(p=>{const r=plan.entries.find(r=>r.problem.id===p.id);return`<li><strong>${esc(P.conceptTitle(p,unit))}</strong><span>${esc(r?.reason||'복습 예정')}</span></li>`}).join('')}</ul><p class="help">예정일에 오늘 복습에서 ‘복습 문제 시작’을 누르세요. 그동안의 학습 기록에 따라 추천 문제가 바뀔 수 있습니다.</p></section>`;return}
  const practiced=p=>schedules().get(p.id)?.practicedToday,remaining=items.filter(p=>!practiced(p));
  content.innerHTML=head('복습 · '+unit.title,(mode==='theory'?'이론 ':'실무 ')+unit.course+' · 최대 3문제로 확인합니다.',back)+`<section class="card pr-session-status"><div class="row spread"><strong id="review-session-status"></strong><button id="review-session-next" class="btn" type="button">확인 후 다음 문제 →</button></div><p class="help">채점 결과와 해설을 확인한 뒤 다음으로 넘어가세요.</p></section><div id="entry-host" data-entry-host="${remaining[0]?.subject||mode}"><div id="questions"></div></div>`;
  function status(){const done=items.filter(practiced).length;$('#review-session-status').textContent=`오늘 확인 ${done}/${items.length}문제`;$('#review-session-next').textContent=done===items.length?'복습 마치기 →':'확인 후 다음 문제 →'}
  const next=()=>{const done=items.filter(practiced);if(done.length===items.length){if(items.length){const uncertain=uncertainNotes(),again=items.some(p=>{const first=historyFor(p.id).find(e=>e.source==='semuon-grade'&&R.day(e.at)===data.today);return first&&!first.correct||uncertain.has(p.id)||historyFor(p.id).some(e=>R.day(e.at)===data.today&&!e.correct)}),outcome=again?'again':'done';if(!(snapshot().progressEvents||[]).some(e=>e.unitId===unit.id&&e.action==='review'&&e.mode===mode&&e.date===data.today&&e.outcome===outcome))store.update(s=>(s.progressEvents||(s.progressEvents=[])).push(P.event(s,{unitId:unit.id,action:'review',mode,outcome,date:data.today})));}content.innerHTML=head('오늘 복습을 마쳤습니다.',items.length?'다음 복습일에 다시 확인하세요.':'지금 풀 문제는 복습 대기 중입니다.',back);return}if(!done.length){toast('먼저 문제를 풀고 채점해 주세요.');return}unitReviewPage().catch(fail)};
  $('#review-session-next').onclick=()=>act(next);$('#questions').addEventListener('semuon-general-pass',e=>{e.stopPropagation();act(next)});$('#questions').addEventListener('click',e=>{if(e.target.closest('[data-dismiss-completed]'))act(next)});
  status();if(remaining.length)await mountList('topic',remaining,$('#questions'),$('#entry-host'),{rerender:()=>unitReviewPage().catch(fail),onUpdate:status});else $('#questions').innerHTML='<p class="notice">이번 복습 문제는 오늘 모두 확인했습니다.</p>';
 }


 function repeatedFieldsHTML(){const rows=V.analyze(snapshot()).filter(g=>g.fields.length);return `<section class="card" id="journal-repeated-fields"><h2>반복해서 틀린 입력 항목</h2>${rows.map(g=>`<p>${esc(g.label)}: ${g.fields.map(([name,n])=>esc(name)+' '+n+'학습일').join(' · ')}</p>`).join('')||'<p class="help">실제 채점한 서로 다른 학습일이 쌓이면 표시합니다.</p>'}</section>`}
 function problemNotesHTML(){
  const state=storedSnapshot(),notes=[...C.problemNotes(state).values()].filter(n=>n.text);
  const quizNotes=[...C.quizNotes(state).values()].filter(n=>n.text);
  const bank=new Map(Object.keys(SemuonQuizReview.courses).flatMap(course=>SemuonTaxQuiz.questions(course).map(q=>[q.id,q])));
  const count=notes.length+quizNotes.length;
  return `<section class="card"><div class="row spread"><h2>문제별 취약점 메모</h2><button id="export-problem-notes" class="btn secondary" ${count?'':'disabled'}>GPT용 메모 내보내기</button></div><details><summary>${count}문제</summary>
   ${notes.map(n=>{const p=state.items.find(p=>p.id===n.problemId);return `<article><a class="btn secondary" href="${href('pages/'+(p.subject==='theory'?'theory':p.subject==='voucher'?'voucher':'general')+'.html?id='+encodeURIComponent(p.id))}">${esc(p.title)}</a><p class="quiz-saved-note">${esc(n.text)}</p></article>`}).join('')}
   ${quizNotes.map(n=>{const q=bank.get(n.questionId),attempt=(state.quizReviewEvents||[]).filter(e=>e.questionId===n.questionId&&e.caseText&&Date.parse(e.at)<=Date.parse(n.at)).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||b.id.localeCompare(a.id))[0];return `<article><a class="btn secondary" href="${quizQuestionPage(q,n.course,attempt?.variant)}">${esc(q?.topic||n.questionId)}</a><p class="quiz-saved-note">${esc(n.text)}</p></article>`}).join('')}
  </details></section>`;
 }
 function mountProblemReports(host){
  function render(){
   const queue=[...pendingProblemReports().values()], state=storedSnapshot();
   const items=new Map(state.items.map(p=>[p.id,p]));
   host.innerHTML='<div class="row spread"><h2>문제 오류 확인 요청 <span class="help">'+queue.length+'건</span></h2></div>';
   if(!queue.length)return;
   const copy=document.createElement("button");
   copy.type="button";copy.className="btn secondary";copy.textContent="GPT 요청문 복사";
   host.firstElementChild.append(copy);
   const manual=document.createElement("textarea");
   manual.className="problem-report-copy";manual.readOnly=true;manual.rows=6;manual.hidden=true;
   manual.setAttribute("aria-label","GPT에 보낼 오류 확인 요청문");
   host.append(manual);
   copy.onclick=async()=>{
    const text=SemuonJournal.problemReportsMarkdown(storedSnapshot());
    try{await navigator.clipboard.writeText(text);manual.hidden=true;toast("GPT에 붙여넣을 요청문을 복사했습니다.")}
    catch(_){manual.hidden=false;manual.value=text;manual.focus();manual.select()}
   };
   const list=document.createElement("ul");list.className="problem-report-list";host.append(list);
   for(const report of queue){
    const problem=items.get(report.problemId);
    const item=document.createElement("li");item.className="row spread";
    const label=document.createElement(problem?"a":"span");
    label.textContent=problem?SemuonJournal.problemReportTitle(problem):report.quiz.title;
    if(problem)label.href=link(problem);
    const remove=document.createElement("button");remove.type="button";remove.className="btn secondary";remove.textContent="목록에서 빼기";
    remove.setAttribute("aria-label",label.textContent+" 오류 확인 요청을 목록에서 빼기");
    remove.onclick=()=>act(()=>{if(saveProblemReport(report.problemId,false,report.quiz)){render();(host.querySelector("button")||host).focus()}});
    item.append(label,remove);list.append(item);
   }
  }
  host.tabIndex=-1;
  render();
  document.addEventListener("semuon-after-sync",render);
 }
 function journalPage(){content.innerHTML=head('학습 기록','이론과 실무를 나란히 기록하고, 다음에 확인할 부분을 남기세요.')+'<div id="journal-host"></div><div id="journal-exams"></div>';SemuonJournal.mount($('#journal-host'),storedSnapshot,{href,save:fn=>store.update(fn),notify:toast});SemuonRoadmap.mount($('#journal-exams'),{getState:storedSnapshot,save:fn=>store.update(fn),href,notify:toast,mode:'exams'});content.insertAdjacentHTML('beforeend',quizRecordSection()+'<section id="problem-reports" class="card"></section>'+problemNotesHTML()+repeatedFieldsHTML()+`<section class="card"><h2>최근 채점기록</h2><p class="help">학습 대상 문제의 최근 30개를 표시합니다. 보관한 기출문제의 기존 기록도 전체 백업에 포함됩니다. 취소한 기록은 보존하고 통계·복습에서 제외합니다.</p><div id="history-list"></div></section>`);renderHistory();mountProblemReports($('#problem-reports'));const notesExport=$('#export-problem-notes');if(notesExport)notesExport.onclick=()=>download('세무온_취약점메모.md',SemuonJournal.problemNotesMarkdown(storedSnapshot()),'text/markdown')}
 function latest(id){return historyFor(id).at(-1)}
 let uncertaintyKey='',uncertaintyValue;function uncertainNotes(){const key=store.revision+'|'+R.day(Date.now());if(uncertaintyKey!==key){uncertaintyValue=C.uncertainties(snapshot());uncertaintyKey=key}return uncertaintyValue}
 let scheduleKey='',scheduleValue;function schedules(){const key=store.revision+'|'+R.day(Date.now());if(scheduleKey!==key){scheduleValue=C.questionSchedules(snapshot());scheduleKey=key}return scheduleValue}
 document.addEventListener('click',e=>{const button=e.target.closest('[data-confidence-problem]');if(!button)return;act(()=>{const p=snapshot().items.find(p=>p.id===button.dataset.confidenceProblem);C.assert(p,'문제를 찾지 못했습니다.');const value=uncertainNotes().has(p.id)?'clear':'uncertain';store.update(s=>(s.reviewNotes||(s.reviewNotes=[])).push({id:crypto.randomUUID(),problemId:p.id,value,at:new Date().toISOString()}));gradeNotice(p,button.closest('.theory-result,.inline-notice,#grade-notice')||button.closest('.question')?.querySelector('.inline-notice'));toast(value==='uncertain'?'헷갈림을 기록했습니다. 내일 다시 확인합니다.':'헷갈림 표시를 해제했습니다.')})});
 // 문제 목록 검색(2026-10-14 회계 학습 센터에서 이식): 기출 회차 → 취약점 Top10 → 정렬 → 유형 태그 → 검색·상태.
 // 취약점은 취소되지 않은 실제 채점기록만 사용한다. 마지막 정답 이후 남은 오답이 있는 문제만 순위에 들어간다.
 function priority(p,events,now=Date.now()){const list=events.filter(e=>e.problemId===p.id).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)),lastPass=Math.max(0,...list.filter(e=>e.correct).map(e=>Date.parse(e.at))),current=list.filter(e=>!e.correct&&Date.parse(e.at)>lastPass),recent=list.slice(-5),recentWrong=recent.filter(e=>!e.correct).length,lastAt=current.length?Date.parse(current.at(-1).at):0,fresh=lastAt>=now-14*86400000,band=current.length>=2?(fresh?6:4):current.length?(fresh?5:3):0;
  return{band,wrongStreak:current.length,recentWrong,lastAt,rate:recent.length?(recentWrong+1)/(recent.length+2):0,attempts:list.length,wrong:list.filter(e=>!e.correct).length,last:list.length?Date.parse(list.at(-1).at):0,reason:current.length?`연속 오답 ${current.length}회 · 최근 ${recent.length}회 중 ${recentWrong}회 오답`:''}}
 function comparePriority(a,b){return b.band-a.band||Math.min(b.wrongStreak,5)-Math.min(a.wrongStreak,5)||b.rate-a.rate||b.recentWrong-a.recentWrong||b.lastAt-a.lastAt}
 function tagsOf(p){return[...new Set([...C.broadTopics(p),...(p.tags||[]),p.type])].filter(t=>t&&!/^\d+회$|^\d{4}년\s*답안\s*기준$/.test(t))}
 function rankTags(items,needs){const tags=new Map();for(const p of items){const need=needs.get(p.id);if(need.band<=0)continue;for(const tag of tagsOf(p)){if(!tags.has(tag))tags.set(tag,[]);tags.get(tag).push(p)}}
  return[...tags].map(([tag,rows])=>{rows.sort((a,b)=>comparePriority(needs.get(a.id),needs.get(b.id)));return{tag,rows,best:needs.get(rows[0].id)}}).sort((a,b)=>comparePriority(a.best,b.best)||a.tag.localeCompare(b.tag,'ko')).slice(0,10)}
 function problemList(subject){const params=new URLSearchParams(location.search),topic=params.get('topic')||'부가가치세',format=params.get('format'),practiceGroup=subject==='practical'?(params.get('practice')==='closing'?'closing':'general'):subject==='voucher'?'voucher':subject==='forms'&&['vat','withholding','yearend'].includes(params.get('practice'))?params.get('practice'):null,items=snapshot().items.filter(p=>practiceGroup?SemuonCurriculum.practiceGroup(p)===practiceGroup:subject==='topic'?SemuonCurriculum.inSubject(p,topic)&&(format==='theory'?p.subject==='theory':format==='practice'?p.subject!=='theory':true):subject==='forms'?Boolean(p.form):p.subject===subject),needs=new Map(items.map(p=>[p.id,priority(p,historyFor(p.id))])),order=new Map(items.map((p,i)=>[p.id,i])),ranked=rankTags(items,needs),sortKey='semuon-tax2-list-sort';let randomOrder=new Map();const passedHere=new Set();
  const options=(values,format=v=>v,compare=(a,b)=>a.localeCompare(b,'ko',{numeric:true}))=>[...new Set(values.filter(v=>v!==''&&v!=null).map(String))].sort(compare).map(v=>`<option value="${esc(v)}">${esc(format(v))}</option>`).join('');
  const tagModel=SemuonTagFilter.create(items,tagsOf,params.get('tag')||'',practiceGroup);
  content.innerHTML=head(practiceGroup==='closing'?'결산 정리':['vat','withholding','yearend'].includes(practiceGroup)?SemuonCurriculum.practiceGroups.find(g=>g.id===practiceGroup).name:subject==='topic'?topic+' · 전체 문제':subject==='forms'?'신고서 · 급여':C.labels[subject],'',`<a class="btn secondary" href="${href('pages/review.html')}">오늘 복습</a>`)+`<div class="toolbar list-filters"><label class="field filter-round-compact"><span>기출 회차</span><select id="filter-round"><option value="">전체</option>${options(items.map(p=>p.source.round),v=>v+'회',(a,b)=>Number(b)-Number(a))}</select></label><label class="field" title="최근 14일의 반복 오답을 먼저 보고, 연속 오답·최근 5회 결과로 정렬합니다. 채점 전 문제는 순위에 넣지 않습니다."><span>취약점 Top10</span><select id="filter-weak" ${ranked.length?'':'disabled'}><option value="">${ranked.length?'선택하기':'현재 확인된 취약 유형이 없습니다.'}</option>${ranked.map(({tag,rows,best},i)=>`<option value="${esc(tag)}">${i+1}. ${esc(tag)}</option>`).join('')}</select></label><label class="field"><span>정렬</span><select id="sort-order"><option value="priority">취약 우선 · 추천</option><option value="original">등록 순</option><option value="recentRegistered">최근 등록 순</option><option value="wrong">오답 많은 순</option><option value="random">랜덤 순</option><option value="unattempted">아직 안 푼 문제 우선</option><option value="recentAttempt">최근에 푼 순</option></select></label><div class="field"><span id="filter-tag-label">${practiceGroup?'실무 유형':'학습 단원'}</span><select id="filter-tag" hidden tabindex="-1" aria-hidden="true">${tagModel.rows.filter(row=>row.value!==undefined).map(row=>`<option value="${esc(row.value)}">${esc(row.label)}</option>`).join('')}</select><div id="tag-picker"></div></div><label class="field filter-kind-compact"><span>문제 구분</span><select id="filter-kind"><option value="">전체 문제</option><option value="exam">기출문제</option><option value="chapter">단원 연습문제</option><option value="application">응용문제</option></select></label><label class="field"><span>문제 검색</span><input id="question-search" type="search" placeholder="단원, 제목, 문제 검색"></label><label class="field filter-state-compact"><span>상태</span><select id="question-filter"><option value="all">전체 문제</option><option value="new">미풀이</option><option value="wrong">현재 오답</option><option value="correct">최근 정답</option></select></label></div><p id="weak-band" class="notice warning" hidden></p><div class="list-overview"><div class="list-summary"><p id="list-count" class="help" role="status"></p></div><nav id="list-pagination" class="row" aria-label="문제 목록 쪽 이동"><button type="button" id="list-previous" class="btn secondary">이전</button><span id="list-page" class="help" aria-live="polite"></span><button type="button" id="list-next" class="btn secondary">다음</button></nav></div><div id="entry-host" data-entry-host="${subject}"><div id="questions"></div></div>`;
  const listHead=content.querySelector('.page-head');listHead.classList.add('problem-list-head');const meter=document.createElement('div');meter.className='problem-progress';meter.id='problem-progress';listHead.insertBefore(meter,listHead.lastElementChild);

  function updateProgress(){const ids=new Set(items.map(p=>p.id)),done=new Set(C.active(snapshot()).filter(e=>ids.has(e.problemId)).map(e=>e.problemId)),total=ids.size;meter.innerHTML=`<div class="row spread"><strong>전체 문제 풀이</strong><span>${done.size}/${total} · ${total?Math.round(done.size/total*100):0}%</span></div><div class="problem-progress-track" role="progressbar" aria-label="전체 문제 풀이" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done.size}"><i style="width:${total?done.size/total*100:0}%"></i></div>`}updateProgress();
  $('.list-filters').insertAdjacentHTML('afterend','<div class="list-schedule-controls row"><label><input id="show-all-problems" type="checkbox"> 전체 문제 보기</label><span id="schedule-count" class="help" role="status"></span></div>');
  const filterPanel=document.createElement('section');filterPanel.id='problem-filter-panel';filterPanel.className='problem-filter-panel';filterPanel.hidden=true;filterPanel.setAttribute('aria-label','문제 검색 조건');const controls=$('.list-filters');controls.before(filterPanel);filterPanel.append(controls,$('.list-schedule-controls'),$('#weak-band'));
  const reviewLink=listHead.lastElementChild,headActions=document.createElement('div'),filterToggle=document.createElement('button');headActions.className='problem-head-actions';filterToggle.type='button';filterToggle.id='problem-filter-toggle';filterToggle.className='btn secondary problem-filter-toggle';filterToggle.setAttribute('aria-label','검색 조건 열기');filterToggle.setAttribute('title','검색 조건');filterToggle.setAttribute('aria-expanded','false');filterToggle.setAttribute('aria-controls',filterPanel.id);filterToggle.innerHTML='<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6M9 15v6"/></svg><span class="filter-active-dot" aria-hidden="true" hidden></span>';headActions.append(filterToggle,reviewLink);listHead.append(headActions);
  function toggleFilters(open){filterPanel.hidden=!open;filterToggle.setAttribute('aria-expanded',String(open));filterToggle.setAttribute('aria-label',open?'검색 조건 접기':'검색 조건 열기')}filterToggle.onclick=()=>toggleFilters(filterPanel.hidden);filterPanel.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();toggleFilters(false);filterToggle.focus()}});
  const field=id=>$('#'+id),pick=(el,value)=>{if([...el.options].some(o=>o.value===value))el.value=value};let filterVersion=0,listPage=Math.max(1,Math.floor(Number(params.get('p')))||1);const pageSize=subject==='forms'?4:subject==='theory'?15:6;
  field('show-all-problems').checked=params.get('scope')==='all';
  let saved='';try{saved=localStorage.getItem(sortKey)||''}catch(_){}
  pick(field('filter-round'),params.get('round')||'');pick(field('filter-tag'),tagModel.resolve(params.has('tag')?params.get('tag'):(subject==='topic'?topic:'')));pick(field('filter-weak'),params.get('weak')||'');pick(field('filter-kind'),params.get('kind')||'');pick(field('sort-order'),params.get('sort')||saved||'priority');field('question-search').value=params.get('q')||'';pick(field('question-filter'),params.get('state')||'all');
  const tagPicker=SemuonTagFilter.mount({select:field('filter-tag'),host:$('#tag-picker'),labelId:'filter-tag-label',model:tagModel});
  function remember(){const url=new URL(location.href);field('show-all-problems').checked?url.searchParams.set('scope','all'):url.searchParams.delete('scope');[['round','filter-round'],['weak','filter-weak'],['tag','filter-tag'],['kind','filter-kind'],['q','question-search']].forEach(([k,id])=>{const v=field(id).value;(v||k==='tag'&&subject==='topic')?url.searchParams.set(k,v):url.searchParams.delete(k)});const state=field('question-filter').value;state!=='all'?url.searchParams.set('state',state):url.searchParams.delete('state');url.searchParams.set('sort',field('sort-order').value);listPage>1?url.searchParams.set('p',listPage):url.searchParams.delete('p');history.replaceState(null,'',url);try{sessionStorage.setItem('semuon-tax2-list-'+subject,url.search)}catch(_){}try{localStorage.setItem(sortKey,field('sort-order').value)}catch(_){}}
  function filter(keepPage=false){const configured=['filter-round','filter-tag','filter-weak','filter-kind','question-search'].some(id=>field(id).value)||field('question-filter').value!=='all'||field('sort-order').value!=='priority'||field('show-all-problems').checked;filterToggle.querySelector('.filter-active-dot').hidden=!configured;filterToggle.title=configured?'검색 조건 · 설정됨':'검색 조건';updateProgress();tagPicker.sync();if(keepPage!==true)listPage=1;const version=++filterVersion,search=C.norm(field('question-search').value).toLowerCase(),state=field('question-filter').value,round=field('filter-round').value,tag=field('filter-tag').value,kind=field('filter-kind').value,weak=ranked.find(g=>g.tag===field('filter-weak').value),weakIds=weak&&new Set(weak.rows.map(p=>p.id)),mode=field('sort-order').value;
   const showAll=field('show-all-problems').checked,planned=schedules(),matches=items.filter(p=>{const e=latest(p.id);return(!weakIds||weakIds.has(p.id))&&(!round||String(p.source.round)===round)&&tagModel.matches(p,tag)&&(!kind||SemuonCurriculum.kind(p)===kind)&&(!search||C.norm([p.title,p.type,...tagsOf(p),tagModel.searchText(p),p.prompt].join(' ')).toLowerCase().includes(search))&&(state==='all'||state==='new'&&!e||state==='wrong'&&e?.correct===false||state==='correct'&&e?.correct===true)}),visible=matches.filter(p=>!passedHere.has(p.id)&&(showAll||planned.get(p.id)?.available)),waiting=matches.filter(p=>!planned.get(p.id)?.available),nextDue=waiting.map(p=>planned.get(p.id).due).filter(Boolean).sort()[0];
   field('schedule-count').textContent=showAll?'오늘 푼 문제와 복습 대기 문제를 함께 표시합니다.':waiting.length?`복습 대기 ${waiting.length}문제 · 다음 예정 ${nextDue}`:'미풀이와 복습 예정일이 된 문제를 표시합니다.';
   if(mode==='random'&&!randomOrder.size){const list=items.map(p=>p.id);for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}randomOrder=new Map(list.map((id,i)=>[id,i]))}
   visible.sort((a,b)=>{const x=needs.get(a.id),y=needs.get(b.id),i=order.get(a.id)-order.get(b.id);if(mode==='priority')return comparePriority(x,y)||i;if(mode==='recentRegistered')return String(b.addedDate||'').localeCompare(String(a.addedDate||''))||-i;if(mode==='wrong')return y.wrong-x.wrong||i;if(mode==='random')return randomOrder.get(a.id)-randomOrder.get(b.id);if(mode==='unattempted')return Number(x.attempts>0)-Number(y.attempts>0)||i;if(mode==='recentAttempt')return y.last-x.last||i;return i});
   field('weak-band').hidden=!weak;if(weak)field('weak-band').textContent=`취약 유형 「${weak.tag}」의 현재 오답 문제 ${weak.rows.length}개만 표시 중입니다. 다른 문제를 보려면 취약점 Top10을 ‘선택하기’로 돌려 주세요.`;
   const pageCount=Math.max(1,Math.ceil(visible.length/pageSize));listPage=Math.min(listPage,pageCount);const offset=(listPage-1)*pageSize,shown=visible.slice(offset,offset+pageSize);field('list-count').textContent=`${items.length}문제 중 ${visible.length}문제 · ${visible.length?offset+1:0}~${offset+shown.length}번째 표시`;field('list-pagination').hidden=pageCount<=1;field('list-previous').disabled=listPage===1;field('list-next').disabled=listPage>=pageCount;field('list-page').textContent=listPage+' / '+pageCount+'쪽';
   remember();if(!visible.length){editor?.dispose();editor=null;$('#questions').innerHTML=!showAll&&waiting.length?`<section class="empty"><h2>선택한 범위의 문제는 복습 대기 중입니다.</h2><p>다음 복습일은 ${nextDue}입니다. 지금 다시 보려면 ‘전체 문제 보기’를 켜세요.</p></section>`:empty(kind==='application'?'선택한 단원과 조건에 맞는 응용문제가 아직 등록되어 있지 않습니다.':items.length?'선택한 학습 단원과 검색 조건에 맞는 문제가 없습니다.':undefined);return}act(()=>mountList(subject,shown,$('#questions'),$('#entry-host'),{rerender:()=>filter(true),onUpdate:updateProgress,isCurrent:()=>version===filterVersion}).catch(e=>{if(version===filterVersion)fail(e)}))}
  field('filter-weak').addEventListener('change',()=>{if(field('filter-weak').value){field('sort-order').value='priority'}filter()});
  field('sort-order').addEventListener('change',()=>{if(field('sort-order').value==='random')randomOrder=new Map();filter()});
  field('filter-tag').addEventListener('change',()=>{const t=field('filter-tag').value,targetSubject=tagModel.subjectFor(t);field('filter-weak').value='';if(['부가가치세','소득세','재무회계','원가회계'].includes(t)||subject==='topic'&&targetSubject&&targetSubject!==topic){remember();const next=new URL(href('pages/topic.html'));for(const [key,value]of new URLSearchParams(location.search))if(!['topic','p','weak','id','review'].includes(key))next.searchParams.set(key,value);next.searchParams.set('topic',targetSubject||t);next.searchParams.set('tag',t);SemuonFullscreen.navigate(next.href);return}filter()});
  field('list-previous').onclick=()=>{listPage--;filter(true)};field('list-next').onclick=()=>{listPage++;filter(true)};['filter-round','question-filter','filter-kind'].forEach(id=>field(id).addEventListener('change',filter));let searchTimer;field('question-search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(filter,350)});filter(true);
  field('show-all-problems').addEventListener('change',filter);$('#questions').addEventListener('semuon-general-pass',e=>{e.stopPropagation();passedHere.add(e.detail.problemId);filter(true)});$('#questions').addEventListener('semuon-general-undo',e=>{passedHere.delete(e.detail.problemId);filter(true)});$('#questions').addEventListener('click',e=>{if(e.target.closest('[data-dismiss-completed]'))filter(true)});
 }
 const loaded=new Map();function script(url){const key=String(url);if(!loaded.has(key))loaded.set(key,new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=key;el.onload=resolve;el.onerror=()=>{loaded.delete(key);el.remove();reject(Error('문제 입력 화면을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'))};document.head.append(el)}));return loaded.get(key)}
 const loadEvidence=()=>script(new URL('js/evidence.js?v=10',rootURL));
 content.addEventListener('click',async event=>{
  const trigger=event.target.closest('.evidence-quick');
  if(!trigger)return;
  try{
   await loadEvidence();
   if(trigger.isConnected)SemuonEvidence.toggle(trigger);
  }catch(error){toast(error.message)}
 });
 const loadedStyles=new Set([...document.querySelectorAll('link[rel=stylesheet]')].map(el=>el.href));function css(url){const key=String(url);if(loadedStyles.has(key))return;loadedStyles.add(key);const el=document.createElement('link');el.rel='stylesheet';el.href=String(url);document.head.append(el)}
 async function ensureExhibits(items){const files=[...new Set(items.map(p=>globalThis.SemuonExhibitFiles?.[p.id]).filter(Boolean))];await Promise.all(files.map(file=>script(new URL(file,rootURL))))}
 function displayText(p){let text=p.displayPrompt||p.prompt;if(p.form?.kind==='yearend')text=text.split('<부양가족 자료>')[0];if(globalThis.SemuonExhibits?.[p.id])text=text.replace(/\[그림:[^\]]+\]/g,'');return text.trim()}
 function answerExplanation(p){
  if(!p.answers?.length)return p.explanation;
  const names=p.answers.flatMap(a=>a.account.split('/')).filter(Boolean);
  return p.explanation.replace(/\[답\]\s*일반전표입력/g,'').split(/\r?\n/).filter(line=>{
   const t=line.trim();if(/^(?:\(차\)|\(대\)|원)$/.test(t)||/^\d{4}[.\/-]\s*\d{1,2}[.\/-]\s*\d{1,2}\.?$/.test(t))return false;
   if(!names.some(n=>t.includes(n))||!/\d/.test(t))return true;let rest=t.replace(/\(차\)|\(대\)/g,'');for(const name of [...names,...p.answers.map(a=>a.partner).filter(Boolean)].sort((a,b)=>b.length-a.length))rest=rest.split(name).join('');return rest.replace(/[\d,.\s원()\/\-]/g,'').length>0;
  }).join('\n').replace(/\n{3,}/g,'\n\n').trim();
 }
 function voucherAnswer(p){
  const v=p.voucher,primary=p.variants[0],money=value=>Number(value).toLocaleString('ko-KR')+'원';
  const fields=pairs=>`<dl class="voucher-answer-fields">${pairs.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  function journal(variant){
   const debit=variant.rows.filter(row=>row.side==='D'),credit=variant.rows.filter(row=>row.side==='C');
   if(variant.journal==='현금'){
    if(!debit.length&&credit.length)debit.push({account:'현금 (자동)',amount:credit.reduce((sum,r)=>sum+r.amount,0)});
    if(!credit.length&&debit.length)credit.push({account:'현금 (자동)',amount:debit.reduce((sum,r)=>sum+r.amount,0)});
   }else if(variant.journal==='카드'&&p.cardAuto){
    const sale=/^[12]/.test(variant.type||v.type);
    const account=(sale?(p.cardReceivableAccount||'미수금'):'미지급금')+' (자동)';
    if(!debit.length&&credit.length)debit.push({account,amount:credit.reduce((sum,r)=>sum+r.amount,0),partner:v.cardCompany});
    if(!credit.length&&debit.length)credit.push({account,amount:debit.reduce((sum,r)=>sum+r.amount,0),partner:v.cardCompany});
   }
   if(!debit.length&&!credit.length)return {key:'',html:''};
   const cell=row=>{
    const code=row.accountCode||p.requiredAccountCodes?.[row.account]||EntryGrading.REQUIRED_ACCOUNT_CODES[row.account];
    const partner=row.partner||p.taxExtras?.partners?.[row.account]||
     (['카드','혼합'].includes(variant.journal)&&['미지급금','미지급비용'].includes(row.account)?v.cardCompany:'');
    const account=row.account+(code?' ('+code+')':'')+(row.division?' ('+row.division+')':'');
    return `<td><div class="voucher-answer-line"><span>${esc(account)}${partner?`<small>${esc(partner)}</small>`:''}</span><strong>${esc(money(row.amount))}</strong></div></td>`;
   };
   const left=debit.map(cell),right=credit.map(cell);
   const rows=Array.from({length:Math.max(left.length,right.length)},(_,i)=>`<tr>${left[i]||'<td></td>'}${right[i]||'<td></td>'}</tr>`).join('');
   return {
    key:JSON.stringify([left.slice().sort(),right.slice().sort()]),
    html:`<table class="voucher-answer-journal"><thead><tr><th scope="col">차변</th><th scope="col">대변</th></tr></thead><tbody>${rows}</tbody></table>`
   };
  }
  const conditions=[['거래일',v.date],['유형',primary.type||v.type],['공급가액',money(primary.supply??v.supply)],['부가세',money(primary.vat??v.vat)],['공급처명',v.supplier||'해당 없음'],['분개',primary.journal]];
  const more=[];
  if(v.electronic!=null)more.push(['전자',v.electronic]);
  if(v.cardCompany)more.push(['신용카드사',v.cardCompany]);
  if(v.serviceFee!=null)more.push(['봉사료',money(v.serviceFee)]);
  if(v.zeroRate)more.push(['영세율 구분',v.zeroRate]);
  if(v.deductReason)more.push(['불공제 사유',v.deductReason]);
  if(p.requiresDeletion)more.push(['선행 절차','기존 일반전표 삭제']);
  if(p.taxExtras?.omitted){
   const {period,acceptedPeriods}=p.taxExtras.omitted;
   more.push(['예정신고누락분','확정신고에 반영'],['확정신고 개시연월',(acceptedPeriods||[period]).join(' 또는 ')]);
  }
  for(const field of p.form?.fields||[]){
   const values=Array.isArray(field.expected)?field.expected:[field.expected];
   more.push([field.label,values.map(value=>typeof value==='boolean'?(value?'체크':'체크 안 함'):typeof value==='number'?value.toLocaleString('ko-KR'):value).join(' 또는 ')]);
  }
  const mainJournal=journal(primary),alternativeGroups=new Map();
  for(const variant of p.variants.slice(1)){
   const changed=[['분개',variant.journal]];
   if((variant.type||v.type)!==(primary.type||v.type))changed.push(['유형',variant.type||v.type]);
   if((variant.supply??v.supply)!==(primary.supply??v.supply)||(variant.vat??v.vat)!==(primary.vat??v.vat))changed.push(['공급가액',money(variant.supply??v.supply)],['부가세',money(variant.vat??v.vat)]);
   const table=journal(variant),sameJournal=table.key===mainJournal.key;
   if(sameJournal&&changed.length===1&&variant.journal===primary.journal)continue;
   if(!alternativeGroups.has(table.key))alternativeGroups.set(table.key,{table:sameJournal?'':table.html,conditions:new Set()});
   alternativeGroups.get(table.key).conditions.add(fields(changed));
  }
  const alternatives=[...alternativeGroups.values()].map(({table,conditions})=>
   `<section class="voucher-answer-alternative">${[...conditions].join('')}${table}</section>`).join('');
  const source=p.source.answerText?.trim();
  let explanation=p.explanation.trim();
  if(source&&explanation.includes(source)){
   const sourceLines=source.split(/\r?\n/);
   const note=sourceLines.findIndex(line=>/^\s*(?:※|[ㆍ·•*]|\(주\d+\))/.test(line));
   const supplement=note<0?'':sourceLines.slice(note).join('\n').replace(/우리\s*\n\s*카드/g,'우리카드').trim();
   explanation=[explanation.replace(source,'').trim(),supplement].filter(Boolean).join('\n');
  }
  return `<div class="voucher-answer">${fields(conditions)}${more.length?fields(more):''}${mainJournal.html}
   ${alternatives?`<details class="voucher-answer-alternatives"><summary>추가 허용 답안</summary><div>${alternatives}</div></details>`:''}
   ${explanation?`<p class="voucher-answer-note">${nl(explanation)}</p>`:''}</div>`;
 }
 function compile(p){const q=C.clone(p);q.title=esc(p.title);q.type=esc(p.type);q.prompt=problemHtml(p);q.explanation=nl(answerExplanation(p));q.exhibit=exhibits(p,p.initialEntry&&/수정\s+전|삭제\s*(대상|할)|기존\s*(입력|전표)/.test(p.exhibit?.caption||''),p.subject==='voucher'||isGeneral(p));q.before=nl(p.before||'');q.item=esc(p.item||'');delete q.variantOf;
  if(p.subject==='practical'){q.accountSelect=true;q.accountOptions=[...new Set([...EntryAccounts,...[p.answers,...(p.alternateAnswers||[])].flat().flatMap(r=>r.account.split('/').map(a=>(r.accountCode||p.requiredAccountCodes?.[a])?(r.accountCode||p.requiredAccountCodes[a])+'|'+a:a))])];q.partnerOptions=[...new Set([p.answers,...(p.alternateAnswers||[])].flat().map(r=>r.partner).filter(Boolean))]}
  else{q.suppliers=[...new Set([p.voucher.supplier,...(p.suppliers||[])].filter(Boolean))];q.accounts=[...new Set([...EntryAccounts,...p.variants.flatMap(a=>a.rows).map(r=>p.requiredAccountCodes?.[r.account]?p.requiredAccountCodes[r.account]+'|'+r.account:r.account)])]}return q;
 }
 document.addEventListener('submit',e=>{const form=e.target.closest('[data-uncertainty-form]');if(!form)return;e.preventDefault();act(()=>{const problemId=form.dataset.uncertaintyForm,note=uncertainNotes().get(problemId);if(!note)return;const reason=new FormData(form).get('reason').trim();store.update(s=>(s.reviewNotes||(s.reviewNotes=[])).push({id:crypto.randomUUID(),problemId,value:'uncertain',reason,markedAt:note.at,at:new Date().toISOString()}));toast('헷갈린 이유를 저장했습니다.');})});
 const isGeneral=p=>p.subject==='practical'&&SemuonCurriculum.practiceGroup(p)==='general';
 function confidenceButton(p){return `<button class="btn secondary" type="button" data-confidence-problem="${esc(p.id)}" aria-pressed="${uncertainNotes().has(p.id)}">${uncertainNotes().has(p.id)?'헷갈림 표시 해제':'헷갈려요'}</button>`}
 function gradeNotice(p,box=$('#grade-notice')){const plan=schedules().get(p.id),e=latest(p.id),general=isGeneral(p);if(!box)return;if(general&&box.id==='grade-notice'&&content.querySelector('.question .inline-notice')){box.innerHTML='';return}const uncertain=uncertainNotes().has(p.id);if(general)content.querySelectorAll('[data-confidence-problem]').forEach(b=>{if(b.dataset.confidenceProblem===p.id){b.textContent=uncertain?'헷갈림 표시 해제':'헷갈려요';b.setAttribute('aria-pressed',String(uncertain))}});box.innerHTML=(e?`<p class="feedback ${e.correct?'good':'wrong'}">${e.source==='semuon-self'?(e.correct?'직접 통과로 기록했습니다.':'다시 연습할 문제로 기록했습니다.'):e.correct?'정답입니다.':'다시 확인해 주세요.'} ${e.wrongLabels?.length?'확인할 항목: '+e.wrongLabels.map(esc).join(', ')+' · ':''}이 문제의 다음 복습일: ${plan.due} (${plan.interval}일 간격)</p>`:'')+`<div class="row review-feedback-actions">${!general&&e?confidenceButton(p):''}${uncertain?`<form class="uncertainty-form" data-uncertainty-form="${esc(p.id)}"><label>헷갈린 이유<input name="reason" maxlength="200" placeholder="예: 자본화 요건과 비용 구분" value="${esc(uncertainNotes().get(p.id).reason||'')}"></label><button type="submit" class="btn secondary">이유 저장</button></form>`:''}${!general&&e&&plan.practicedToday&&($('#show-all-problems')||$('#review-session-next'))&&!$('#show-all-problems')?.checked?'<button class="btn secondary" type="button" data-dismiss-completed>확인 후 다음 문제 →</button>':''}</div>`;}
 async function solve(p){await ensureExhibits([p]);editor?.dispose();const back=p.subject==='practical'?'general':p.subject==='voucher'?'voucher':'theory';content.innerHTML=head(p.form&&!p.voucher&&p.formEntry!=='practical'?'신고서 · 급여':C.labels[p.subject],p.type,`<a class="btn secondary" href="${href('pages/'+back+'.html')}">전체 문제 목록</a>`)+`<div class="toolbar"><a class="btn" href="${href('pages/review.html')}">오늘 복습 목록으로</a><button class="btn secondary" id="undo-grade">마지막 채점 취소</button></div><div id="entry-host" data-entry-host="${p.subject}"><div id="questions"></div></div><div id="grade-notice" role="status"></div>${sourceBox(p)}`;
  $('#undo-grade').onclick=()=>act(()=>{const e=latest(p.id);if(!e){toast('취소할 채점이 없습니다.');return}store.cancel(e.id);toast('채점을 취소했습니다. 통계와 복습 일정에서 제외됩니다.');solve(p)});
  await mountList(p.subject,[p],$('#questions'),$('#entry-host'),{rerender:()=>solve(p),onUpdate:()=>gradeNotice(p)});gradeNotice(p);
 }
 // 2026-10-14 사용자 지정: 이론 문제에서 ‘ㆍ·•’ 등으로 시작하는 계산 자료가 3줄 이상 이어지면 3열 목록으로 표시한다. 글자·순서는 원문 그대로.
 function promptHtml(text){const out=[];let group=[];const bullet=/^\s*[ㆍ·•∙▪■□○◦\-]/,flush=()=>{if(group.length>=3)out.push(`<ul class="prompt-grid">${group.map(l=>`<li>${esc(l.trim())}</li>`).join('')}</ul>`);else out.push(...group.map(l=>esc(l.trimEnd())+'<br>'));group=[]};
  for(const line of String(text??'').split(/\r?\n/)){if(bullet.test(line)){group.push(line);continue}flush();out.push(esc(line.trimEnd())+'<br>')}flush();return out.join('').replace(/(<br>)+$/,'')}
 function renderTheory(p,target=document.getElementById('questions'),notice=()=>gradeNotice(p),reset=()=>{store.update(s=>{delete s.drafts[p.id]});renderTheory(p,target,notice)}){const $=s=>target.querySelector(s),$$=s=>[...target.querySelectorAll(s)],draft=snapshot().drafts[p.id]||{};target.innerHTML=`<article class="theory-card" data-problem-id="${esc(p.id)}"><div class="prompt">${problemHtml(p)}</div>${exhibits(p)}<div class="choices">${p.choices.map((c,i)=>`<label class="choice"><input type="radio" name="${target.id==='questions'?'theory-answer':'theory-answer-'+esc(p.id)}" value="${i}" ${draft.choice===i?'checked':''}><span>${i+1}. ${nl(c)}</span></label>`).join('')}</div><div class="qactions row"><button class="btn check-one">채점하기</button></div><details class="answer-reveal"><summary>정답 · 해설 보기</summary><div><p>정답: ${(p.acceptedAnswers||[p.answer]).map(i=>(i+1)+'번').join(' 또는 ')}</p><p>${nl(p.explanation)}</p></div></details><div class="theory-result" role="status"></div></article>`;TrainingDataTables.prepare(target);$$('.choices input').forEach(el=>el.onchange=()=>act(()=>store.update(s=>s.drafts[p.id]={choice:Number(el.value),graded:false})));$('.check-one').onclick=()=>act(()=>{const checked=$('.choices input:checked');if(!checked){toast('보기 하나를 선택해 주세요.');return}recordAnswer(p,{choice:Number(checked.value)});notice()});$('.qactions').prepend(...selfButtons(p,notice));$('.check-one').after(resetButton(p,reset),problemReportButton(p.id));notice()}
 const comboKey='semuon-tax2-review-combo',comboSources=Object.fromEntries(C.SUBJECTS.map(s=>[s,{file:href('pages/'+(s==='practical'?'general':s==='voucher'?'voucher':'theory')+'.html')}]));
 function startCombo(){const gs=groups(),selections=Object.fromEntries(C.SUBJECTS.map(subject=>{const field=subject==='practical'?'general':subject,done=gs.filter(g=>g.field===field&&g.practicedToday).length;return[subject,V.select(gs,{field,limit:3+done}).map(g=>g.candidate.id)]})),session=TrainingComboReview.create(comboKey,selections),first=C.SUBJECTS.find(s=>session.subjects[s].length);if(first)SemuonFullscreen.navigate(TrainingComboReview.url(session,first,comboSources));else toast('복습할 문제가 아직 없습니다. 문제를 등록하거나 다음 복습일을 확인해 주세요.')}
 // 여러 문제를 한 화면에서 바로 풀기(문제 목록·복합 복습 공용). 문제마다 통과/다시 연습/채점/초기화와 채점 결과를 둔다.
 function attachProblemNote(card){const reveal=card.querySelector('.answer-reveal,.answer-box');if(!reveal||reveal.querySelector('[data-problem-note]'))return;const id=card.dataset.problemId,note=C.problemNotes(storedSnapshot()).get(id),form=document.createElement('form');form.className='problem-note';form.dataset.problemNote=id;form.innerHTML=`<div class="problem-note-heading"><label for="memo-${esc(id)}">취약점 메모</label><button class="btn secondary" type="submit">메모 저장</button></div><textarea id="memo-${esc(id)}" maxlength="4000" rows="2" aria-label="취약점 메모" placeholder="틀린 부분, 헷갈린 개념, 다음에 확인할 내용을 적으세요.">${esc(note?.text||'')}</textarea><span class="help" role="status"></span>`;reveal.append(form)}
 function saveProblemNote(form){if(form.dataset.dirty!=='true')return;const text=form.querySelector('textarea').value.trim(),problemId=form.dataset.problemNote;store.update(s=>(s.problemNotes||(s.problemNotes=[])).push({id:crypto.randomUUID(),problemId,text,at:new Date().toISOString()}));delete form.dataset.dirty;form.querySelector('[role=status]').textContent='저장됨';}
 document.addEventListener('input',e=>{const form=e.target.closest('[data-problem-note]');if(form){form.dataset.dirty='true';form.querySelector('[role=status]').textContent='작성 중'}});
 document.addEventListener('change',e=>{const form=e.target.closest('[data-problem-note]');if(form)act(()=>saveProblemNote(form))});
 document.addEventListener('submit',e=>{const form=e.target.closest('[data-problem-note]');if(form){e.preventDefault();act(()=>saveProblemNote(form))}});
 document.addEventListener('semuon-before-sync',e=>{try{content.querySelectorAll('[data-problem-note]').forEach(saveProblemNote);content.querySelectorAll('[data-problem-note] textarea,[data-problem-note] button').forEach(el=>el.disabled=true)}catch(error){e.preventDefault();toast(error.message)}});
 document.addEventListener('semuon-sync-finished',e=>{if(!e.detail.succeeded)content.querySelectorAll('[data-problem-note] textarea,[data-problem-note] button').forEach(el=>el.disabled=false)});
 window.addEventListener('beforeunload',()=>{content.querySelectorAll('[data-problem-note]').forEach(form=>{try{saveProblemNote(form)}catch(_){}})});
 let bookDictionary;
 async function loadBookDictionary(){
  if(bookDictionary)return bookDictionary;
  const assets=['dictionary-income.js','dictionary-subjects.js','dictionary.js'];
  await Promise.all(assets.map(file=>script(new URL('js/'+file+'?v=20261116-combined-book',rootURL))));
  const api=window.SemuonDictionarySearch;
  bookDictionary={api,index:api.createIndex(window.SemuonDictionaryCatalogs||[])};
  return bookDictionary;
 }
 function bookReadingLink(reading,problem,dictionary){
  if(!reading.file||!reading.pdfPages?.length||!dictionary)return '';
  const {api,index}=dictionary;
  const match=reading.match||api.readingMatch(index,reading,problem);
  if(location.protocol==='file:'){
   return api.pdfURL(rootURL,{file:reading.file,pdfPage:match?.pdfPage||reading.pdfPages[0],phrase:match?.phrase});
  }
  if(!match)return '';
  const target=new URL('pages/dictionary.html',rootURL);
  target.searchParams.set('q',match.topic);
  const scope=Object.keys(api.subjects).find(key=>api.subjects[key]===match.subject);
  if(scope)target.searchParams.set('subject',scope);
  const theme=document.documentElement.dataset.designTheme;
  if(theme)target.searchParams.set('theme',theme);
  return target.href;
 }
 function attachBookReading(card,problem,dictionary){
  const reveal=card.querySelector('.answer-reveal,.answer-box');
  if(!reveal||!problem||reveal.querySelector('.answer-book-reading'))return;
  const reading=SemuonTextbook.recommendedReading(problem,SemuonCurriculum);
  const additional=dictionary?.api.additionalReading(dictionary.index,problem);
  if(additional)reading.push(additional);
  const note=document.createElement('aside');
  note.className='answer-book-reading';
  note.innerHTML='<strong>교재에서 다시 보기</strong>'+(reading.length
   ? `<ul>${reading.map(item=>{
    const {book,lane,pages,title}=item;
    const label=`${esc(book||'셀파 '+lane)} ${esc(pages)}쪽`;
    const url=bookReadingLink(item,problem,dictionary);
    const source=url?`<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`:label;
    return `<li><strong>${source}</strong> · ${esc(title)}</li>`;
   }).join('')}</ul>`
   : '<p>관련 개념의 교재 쪽수를 확인하지 못했습니다.</p>');
  const memo=reveal.querySelector('[data-problem-note]');
  if(memo)memo.before(note);else reveal.append(note);
 }
 async function markup(container,isCurrent=()=>true){
  if(container.querySelector('[data-problem-id]'))try{
   await Promise.all([script(new URL('js/journal-icons.js?v=b32526e47bd8',rootURL)),script(new URL('js/quiz-ink.js?v=problem-ink-1',rootURL))]);
   if(isCurrent())SemuonQuizInk.mountProblems(content);
  }catch(_){}
  if(container.querySelector('[data-evidence-inline],[data-question-conditions]')){
   try{
    await loadEvidence();
    if(isCurrent())SemuonEvidence.mountInline(container);
   }catch(error){if(isCurrent())toast(error.message)}
  }
  const cards=[...container.querySelectorAll('[data-problem-id]')];
  const dictionary=cards.length?await loadBookDictionary().catch(()=>null):null;
  if(isCurrent())for(const card of cards){
   attachBookReading(card,snapshot().items.find(p=>p.id===card.dataset.problemId),dictionary);
  }
  try{await script(new URL('js/markup.js?v=20261118-quiz',rootURL));if(isCurrent()){SemuonMarkup.attach(container,{shortcuts:()=>C.markupShortcuts(snapshot().settings),onUndo:recordScreenUndo});container.querySelectorAll('[data-problem-id]').forEach(card=>{attachProblemNote(card);if(card.querySelector('.journal-problem-link'))return;const p=snapshot().items.find(p=>p.id===card.dataset.problemId),unitId=p&&(p.subject==='theory'?SemuonCurriculum.classify(p).units[0]:SemuonCurriculum.practiceClassify(p).units[0]),actions=card.querySelector('.qactions');if(unitId&&actions&&!isGeneral(p)){const a=document.createElement('a');a.className='btn ghost journal-problem-link';a.textContent='학습 기록';a.href=href('pages/journal.html?unit='+encodeURIComponent(unitId)+'&problem='+encodeURIComponent(p.id));actions.append(a)}})}}catch(_){}}
 async function loadEntry(subject){await script(new URL('entry/accounts.js',legacyURL));await script(new URL('entry/correction.js?v=1',legacyURL));await script(new URL('entry/'+subject+'.js?v='+(subject==='voucher'?13:12),legacyURL));await script(new URL('account-search.js',legacyURL));css(new URL('entry/common.css',legacyURL));css(new URL('entry/'+subject+'.css',legacyURL));css(new URL('css/entry-flat.css?v=20261116-voucher-answer',rootURL));css(new URL('entry/correction.css?v=1',legacyURL))}
 function arrangeVoucherEvidence(card){
  const workspace=card.querySelector('.answer-workspace');
  const question=workspace.querySelector('.question-top'),entry=workspace.querySelector('.kclep-shell');
  const exhibit=question.querySelector('.exhibit-layout'),preview=exhibit?.querySelector(':scope > [data-evidence-inline]');
  if(!preview)return;
  const layout=document.createElement('div');
  layout.className='voucher-evidence-layout';
  question.before(layout);
  layout.append(question,preview,entry);
  if(exhibit.childElementCount===1)exhibit.replaceWith(exhibit.firstElementChild);
 }
 async function mountList(subject,items,target,host,{rerender,onUpdate=()=>{},isCurrent=()=>true}={}){if(!isCurrent())return;await ensureExhibits(items);if(!isCurrent())return;editor?.dispose();editor=null;target.innerHTML='';if(!items.length)return;const notify=(p,box)=>{gradeNotice(p,box);onUpdate()},clearDraft=p=>()=>{store.update(s=>s.drafts[p.id]={graded:false,rows:[],voucher:{}});rerender()};
  if(items.some(p=>p.form&&!p.voucher&&p.formEntry!=='practical')||new Set(items.map(p=>p.subject)).size>1){const children=[];for(const [i,p]of items.entries()){if(!isCurrent())return;const slot=document.createElement('section');slot.className='tax-question-slot';target.append(slot);if(p.form&&!p.voucher&&p.formEntry!=='practical'){renderForm(p,slot,()=>notify(p,slot.querySelector('.inline-notice')),clearDraft(p));continue}const inner=document.createElement('div');slot.dataset.entryHost=p.subject;slot.append(inner);await mountList(p.subject,[p],inner,slot,{rerender,onUpdate,isCurrent});if(!isCurrent())return;if(editor)children.push(editor);editor=null;}editor={dispose(){children.forEach(x=>x.dispose?.())}};await markup(target,isCurrent);return}
  // A topic or forms page can narrow down to one subject after filtering.
  subject=items[0].subject;
  if(subject==='theory'){for(const [i,p] of items.entries()){const slot=document.createElement('section');slot.id='theory-slot-'+i;slot.className='theory-slot';target.append(slot);renderTheory(p,slot,()=>notify(p,slot.querySelector('.theory-result')),clearDraft(p))}await markup(target,isCurrent);return}
  await loadEntry(subject);if(!isCurrent())return;host.classList.add('entry-'+subject);
  const working={cards:Object.fromEntries(items.map((p,i)=>{const history=historyFor(p.id);return[i,{rows:[],voucher:{},graded:false,attempts:history.length,wrongCount:history.filter(e=>!e.correct).length,...snapshot().drafts[p.id],history:history.map(e=>({at:e.at,correct:e.correct,wrongLabels:e.wrongLabels,...e.input}))}]}))};
  const save=s=>act(()=>store.update(state=>{for(const [i,p] of items.entries()){const d=s.cards[i];state.drafts[p.id]=Object.fromEntries(['rows','voucher','form','taxExtras','graded','correct','passed','matched','correctionInitialized'].filter(k=>d[k]!==undefined).map(k=>[k,C.clone(d[k])]))}}));
  const adapters=new Map();
  const onGrade=card=>act(()=>{const i=Number(card.dataset.index),p=items[i],d=working.cards[i],e=d.history.at(-1),input={rows:e.rows,...(subject==='voucher'?{voucher:e.voucher}:{}),...adapters.get(i)?.snapshot()},result=C.grade(p,input);Object.assign(e,{correct:result.correct,wrongLabels:result.wrongLabels});d.correct=result.correct;d.passed=result.correct;d.wrongCount=historyFor(p.id).filter(e=>!e.correct).length+(result.correct?0:1);Object.assign(d,adapters.get(i)?.snapshot());save(working);recordAnswer(p,input);card.dataset.correct=String(result.correct);card.classList.toggle('correct',result.correct);card.classList.toggle('wrong',!result.correct);const res=card.querySelector('.result');res.className='result '+(result.correct?'ok':'no');res.textContent=result.correct?'정답입니다!':'다시 확인해 주세요.';const feedback=card.querySelector('.field-feedback');if(feedback){feedback.className='field-feedback '+(result.correct?'ok':'no');feedback.textContent=result.correct?'입력·추가 설정·신고서 조건이 모두 맞습니다.':'확인할 항목: '+result.wrongLabels.join(', ')}card.querySelectorAll('.entry-row').forEach(r=>{r.style.background='';const label=r.querySelector('.row-state');if(label&&label.textContent)label.textContent=result.correct?'✓':'확인'});const attempt=card.querySelector('.attempt');if(attempt)attempt.textContent='채점 '+d.attempts+'회 · 틀림 '+d.wrongCount+'회';adapters.get(i)?.feedback(result);notify(p,card.querySelector('.inline-notice'))});
  editor=(subject==='practical'?PracticalEntry:VoucherEntry).mount({root:host,target,problems:items.map(compile),state:working,save,embedded:true,onGrade,renderAnswer:(_,i)=>voucherAnswer(items[i])});
  if(subject!=='practical')host.querySelectorAll('.entry-toggle').forEach(el=>el.setAttribute('open',''));
  host.querySelectorAll('.question').forEach(card=>{if(subject==='voucher')arrangeVoucherEvidence(card);const p=items[Number(card.dataset.index)],actions=card.querySelector('.qactions'),reveal=card.querySelector('.answer-reveal'),box=document.createElement('div');box.className='inline-notice';box.setAttribute('role','status');actions.after(box);if(reveal)box.after(reveal);actions.querySelector('.reset-one')?.remove();actions.prepend(...selfButtons(p,()=>notify(p,box)));actions.querySelector('.check-one').after(resetButton(p,clearDraft(p)),problemReportButton(p.id));gradeNotice(p,box);card.dataset.problemId=p.id;card.querySelectorAll('.qhead h2,.qhead h3').forEach(title=>title.remove());if(isGeneral(p)){actions.querySelector('.check-one').outerHTML=confidenceButton(p);}if(p.form||p.taxExtras){const i=Number(card.dataset.index);adapters.set(i,SemuonTaxForms.attachVoucher(card,p,{getDraft:()=>working.cards[i],setDraft:patch=>{Object.assign(working.cards[i],patch);save(working);delete card.dataset.graded;delete card.dataset.correct;card.classList.remove('correct','wrong');card.querySelector('.result').textContent='입력 내용이 저장되었습니다. 다시 채점해 주세요.'}}))}});const sharedEditor=editor;editor={dispose(){sharedEditor?.dispose();adapters.forEach(a=>a.dispose())}};await markup(target,isCurrent);
 }
 function renderForm(p,target,notice,reset){
  const draft=snapshot().drafts[p.id]||{};
  const answer=p.form.fields.map(f=>{
   const values=Array.isArray(f.expected)?f.expected:[f.expected];
   const text=values.map(x=>x===true?'체크':x===false?'체크 안 함':typeof x==='number'?x.toLocaleString('ko-KR'):x);
   return `<p>${esc(f.label)}: <strong>${esc(text.join(' 또는 '))}</strong></p>`;
  }).join('');
  target.innerHTML=`<article class="tax-form-question" data-problem-id="${esc(p.id)}">
   <span class="pill">${esc(p.type)}</span>
   <div class="tax-form-workspace">
    <div class="tax-form-context">${formConditions(p)}</div>
    <div class="tax-form-entry">
     <div class="tax-form-input"></div>
     <div class="qactions"><button class="btn check-one" type="button">채점하기</button></div>
     <div class="inline-notice" role="status"></div>
    </div>
   </div>
   <details class="answer-reveal"><summary>정답 · 해설 보기</summary><div>
    <p>${nl(p.explanation)}</p><div class="tax-answer-grid">${answer}</div>
    ${p.form.variants?.length?'<p class="help">허용 대체답안은 선택한 조건에 맞는 합계까지 일관되게 입력해야 합니다.</p>':''}
   </div></details>
  </article>`;
  const fields=SemuonTaxForms.mountFields(target.querySelector('.tax-form-input'),p,{
   compact:true,values:draft.form,save:form=>act(()=>store.update(s=>s.drafts[p.id]={form,graded:false}))
  });
  const actions=target.querySelector('.qactions'),check=actions.querySelector('.check-one');
  if(!p.source.officialAllAccepted)actions.prepend(...selfButtons(p,notice));
  check.after(resetButton(p,reset),problemReportButton(p.id));
  if(p.source.officialAllAccepted)check.textContent='참고답안 비교';
  check.onclick=()=>act(()=>{
   if(p.source.officialAllAccepted){
    const result=C.grade(p,{form:fields.read()});
    fields.feedback(result);
    target.querySelector('.inline-notice').textContent='공식 시험에서는 출제 오류로 전원 정답 처리된 문항입니다. '+
     (result.correct?'입력값이 학습용 참고답안과 일치합니다.':'참고답안과 다른 항목: '+result.wrongLabels.join(', '))+
     '. 이 비교는 채점기록·취약점 통계에 반영하지 않습니다.';
    retireProblemMarks(p.id);
    return;
   }
   const event=recordAnswer(p,{form:fields.read()});
   store.update(s=>Object.assign(s.drafts[p.id]||(s.drafts[p.id]={}),{graded:true,correct:event.correct}));
   fields.feedback(event);
   notice();
  });
  notice();
 }
 async function solveCombo(){
  const session=TrainingComboReview.active(comboKey),items=session.subjects[page].map(id=>snapshot().items.find(p=>p.id===id&&p.subject===page)).filter(Boolean);editor?.dispose();
  content.innerHTML=head('복합 복습 · 세 분야 3문제씩','선택한 문제를 이어서 풀어 보세요.')+`<div id="entry-host" data-entry-host="${page}"><div id="questions"></div></div>`;
  const host=$('#entry-host'),target=$('#questions');let comboUI;
  if(!session.visited[page])store.update(s=>{for(const p of items)s.drafts[p.id]={graded:false,rows:[],voucher:{}}});
  const draw=()=>mountList(page,items,target,host,{rerender:()=>draw().then(()=>comboUI?.update()).catch(fail),onUpdate:()=>comboUI?.update()});await draw();
  comboUI=TrainingComboReview.install({key:comboKey,subject:page,sources:comboSources,returnURL:href('pages/review.html'),history:(subject,id)=>historyFor(id).filter(e=>e.subject===subject)});
  if(!items.length)target.innerHTML='<p>이 분야의 복습 문제가 없습니다. 위 버튼에서 다른 분야를 선택해 주세요.</p>';
 }
 const quizPage=(course,review=false)=>href('pages/quiz.html?course='+course+(review?'&review=due':''));
 function quizRecordSection(){
  const Q=SemuonQuizReview,events=storedSnapshot().quizReviewEvents||[];
  const today=SemuonProgress.day(Date.now()),recent=Q.recent(events,SemuonProgress.add(today,-6),today);
  const bank=new Map(Object.keys(Q.courses).flatMap(course=>SemuonTaxQuiz.questions(course).map(q=>[q.id,q])));
  const ratings=new Map(Q.ratings.map(([id,label])=>[id,label]));
  const weaknesses=Q.weaknesses(events,SemuonProgress.add(today,-6),today);
  const selected=new Map(events.filter(e=>e.kind==='rating').slice().sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id)).reverse().map(e=>[e.attemptId,e.rating]));
  return `<details class="card quiz-records"><summary>핵심 퀴즈 · 최근 7일 첫 풀이 ${recent.length}건</summary><div>
   ${recent.length?`<ul>${recent.slice(0,12).map(e=>`<li><time>${esc(SemuonProgress.day(e.at))}</time> · ${esc(Q.courses[e.course])} ·
    ${esc(bank.get(e.questionId)?.topic||e.questionId)} · ${e.correct?'정답':'오답'}${selected.has(e.id)?' · '+esc(ratings.get(selected.get(e.id))):''}</li>`).join('')}</ul>`:'<p class="help">기록된 핵심 퀴즈 풀이가 없습니다.</p>'}
   ${weaknesses.length?`<h3>사원 등록 · 재확인할 요건</h3><ul>${weaknesses.map(w=>`<li>${esc(w.label)} · 오답 ${w.wrongDays}일 / ${w.total}명 판정</li>`).join('')}</ul>`:''}
   ${recent.filter(e=>e.fieldResults).slice(0,5).map(e=>`<details class="employee-attempt-details"><summary>${esc(SemuonProgress.day(e.at))} · 가족별 선택 답안</summary><p class="quiz-saved-note">${esc(e.caseText)}</p><div class="table-scroll"><table><thead><tr><th>항목</th><th>선택</th><th>정답</th></tr></thead><tbody>${e.fieldResults.map(r=>`<tr><th>${esc(r.label)}</th><td>${esc(r.value)}${r.correct?'':' · 오답'}</td><td>${esc(r.expected)}</td></tr>`).join('')}</tbody></table></div></details>`).join('')}
  </div></details>`;
 }
 function quizQuestionPage(question,course,variant){
  const url=new URL(quizPage(course));
  if(question){
   url.searchParams.set('question',question.id);
   url.searchParams.set('unit',question.unit);
   url.searchParams.set('level',question.level);
   if(question.sample)url.searchParams.set('sample',question.sample);
   if(question.family&&Number.isInteger(variant))url.searchParams.set('variant',variant);
  }
  return url.href;
 }
 function registrationFieldsHTML(question){
  const {year,employee,rows,basicCount,columns,detailed}=question.registration;
  const control=(index,label,source=false)=>{
   const field=question.fields[index],attrs=`name="answer-${index}" data-klab-criterion="${esc(field.criterion)}" aria-label="${esc(field.label)}"${source?' data-childcare-source':''}`;
   const input=field.options? `<select ${attrs}${field.relationCodes?' title="관계 코드 1~8 · 1을 반복하면 부친/모친 전환"':''}>${field.options.map(([value,text])=>`<option value="${esc(value)}">${esc(text)}</option>`).join('')}</select>`:
    `<input ${attrs} type="${field.input==='date'?'date':'text'}" autocomplete="off"${field.input==='code'?' maxlength="3" inputmode="numeric"':field.input==='rrn'?' maxlength="14" autocapitalize="characters"':' maxlength="32"'}>`;
   return `<label><span data-klab-text>${esc(label)}</span>${input}</label>`;
  };
  const ownField=(key,label)=>control(question.fields.findIndex(field=>field.key===key),label);
  const familyHeaders=['연말관계','성명','내/외국인','주민(외국인, 여권)번호','나이','기본공제','부녀자','한부모','경로우대','장애인','자녀(간이)','출산·입양','자녀(세액)','위탁관계'];
  const unused='<td class="klab-na">—</td>';
  const ageCell=index=>`<td data-klab-age="${index}" title="귀속연도 말 기준 나이">—</td>`;
  const familyEntry=detailed?`<div class="table-scroll klab-family-scroll" tabindex="0" role="region" aria-label="부양가족명세 입력표">
    <table class="klab-family-grid">
     <thead><tr>${familyHeaders.map(label=>`<th scope="col" data-klab-text>${label}</th>`).join('')}</tr></thead>
     <tbody>
      <tr><th scope="row" data-klab-text>0 본인</th><td data-klab-self-name>—</td><td><label><span>내/외국인</span>
       <select data-klab-self-nationality aria-label="본인 · 내/외국인">${question.fields[5].options.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select>
       </label></td><td class="klab-id-cell"><div class="klab-id-controls">${ownField('self-id-type','번호 구분')}<span data-klab-self-number>—</span></div></td>${ageCell(2)}
       <td>${ownField('self-basic','기본공제')}</td><td>${ownField('women-deduction','부녀자')}</td><td>${ownField('single-parent','한부모')}</td>
       <td>${ownField('self-senior','경로우대')}</td><td>${ownField('self-disability','장애인')}</td>${unused}${unused}<td>${ownField('self-child-credit','자녀(세액)')}</td>${unused}</tr>
      ${rows.map(({start},i)=>`<tr aria-label="가족 ${i+1}">
       <td>${control(start,'연말관계',true)}</td><td>${control(start+1,'성명')}</td><td>${control(start+8,'내/외국인')}</td>
       <td class="klab-id-cell"><div class="klab-id-controls">${control(start+9,'번호 구분')}${control(start+2,'주민(외국인, 여권)번호',true)}</div></td>${ageCell(start+2)}
       <td>${control(start+3,'기본공제')}</td>${unused}${unused}<td>${control(start+4,'경로우대')}</td><td>${control(start+5,'장애인')}</td>
       <td data-klab-simple-child>${control(start+10,'자녀(간이)')}</td><td>${control(start+6,'출산·입양')}</td><td>${control(start+7,'자녀(세액)')}</td>${unused}
      </tr>`).join('')}
     </tbody>
    </table>
   </div>`:`<div class="klab-family-entries">${rows.map(({start},i)=>`<div class="klab-family-row" role="group" aria-label="가족 ${i+1}">
    ${columns.map((label,column)=>control(start+column,label,column===0||column===2)).join('')}
   </div>`).join('')}</div>`;
  return `<div class="klab-layout${detailed?' klab-detailed':''}">
   <details class="klab-material"${registrationWindow?'':' open'}>
    <summary data-klab-text>연습 자료 · ${year}년 귀속</summary>
    <div class="klab-material-body">
     <dl class="klab-employee">${employee.map(([label,value])=>`<div><dt data-klab-text>${esc(label)}</dt><dd data-klab-text>${esc(value)}</dd></div>`).join('')}</dl>
     <div class="table-scroll"><table class="klab-source-table">
      <caption class="sr-only">연습용 부양가족 자료</caption>
      <thead><tr>${['관계','성명','가상 주민등록번호','비고'].map(label=>`<th scope="col" data-klab-text>${label}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(row=>`<tr>${[row.relation,row.name,row.rrn,row.remarks].map(value=>`<td data-klab-text>${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody>
     </table></div>
    </div>
   </details>
   ${detailed?`<section class="klab-roster" aria-label="사원 목록">
    <h3 data-klab-text>사원 목록</h3>
    <div class="table-scroll"><table class="klab-source-table">
     <thead><tr><th scope="col">사번</th><th scope="col">성명</th><th scope="col">주민등록번호</th></tr></thead>
     <tbody><tr><td data-klab-self-code>—</td><td data-klab-self-name>—</td><td data-klab-self-number>—</td></tr></tbody>
    </table></div>
   </section>`:''}
   <section class="klab-entry" aria-label="사원 등록 입력">
    <div class="klab-tabs" role="tablist" aria-label="사원 등록 탭">
     <button type="button" id="klab-basic-tab" role="tab" aria-selected="true" aria-controls="klab-basic">기본사항</button>
     <button type="button" id="klab-family-tab" role="tab" aria-selected="false" aria-controls="klab-family" tabindex="-1">부양가족명세</button>
    </div>
    <div id="klab-basic" role="tabpanel" aria-labelledby="klab-basic-tab">
     <div class="klab-basic-grid">${question.fields.slice(0,basicCount).map((field,i)=>control(i,field.label)).join('')}</div>
    </div>
    <div id="klab-family" role="tabpanel" aria-labelledby="klab-family-tab" hidden>
     ${familyEntry}
     <div class="row spread klab-childcare">
      <div><strong data-klab-text>6세 이하 보육수당 대상자</strong> <output role="status" id="klab-childcare-count">미반영</output></div>
      <input type="hidden" name="answer-${question.fields.length-1}">
      <button type="button" class="btn secondary" id="klab-import-family" aria-describedby="klab-childcare-count">부양가족 불러오기</button>
     </div>
     ${detailed?`<section class="klab-deduction-summary" aria-label="입력한 공제 현황">
      <h3>공제 현황</h3>
      <dl>${[['basic','기본공제'],['senior','경로우대'],['disability','장애인'],['children','자녀세액공제']].map(([key,label])=>
       `<div><dt>${label}</dt><dd data-klab-total="${key}">0명</dd></div>`).join('')}</dl>
     </section>`:''}
    </div>
   </section>
  </div>`;
 }
 function bindRegistration(form,question){
  const quiz=SemuonTaxQuiz,fields=question.fields.map((_,i)=>form.elements.namedItem('answer-'+i));
  const imported=fields.at(-1),output=form.querySelector('#klab-childcare-count'),load=form.querySelector('#klab-import-family');
  const tabs=[...form.querySelectorAll('.klab-tabs [role=tab]')];
  const selfNationality=form.querySelector('[data-klab-self-nationality]');
  const values=()=>question.fields.map((field,i)=>quiz.registrationAnswer(field,fields[i].value));
  function bindCodes(select,field){
   if(!field.options?.some(([,label])=>/^\d /.test(label)))return;
   select.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||event.isComposing||event.repeat)return;
    const matches=field.options.filter(([,label])=>label.startsWith(event.key+' ')&&/^\d$/.test(event.key)).map(([value])=>value);
    if(!matches.length)return;
    event.preventDefault();
    select.value=matches[(matches.indexOf(select.value)+1)%matches.length];
    select.dispatchEvent(new Event('change',{bubbles:true}));
   });
  }
  question.fields.forEach((field,i)=>bindCodes(fields[i],field));
  if(selfNationality){
   bindCodes(selfNationality,question.fields[5]);
   selfNationality.onchange=()=>{
    fields[5].value=selfNationality.value;
    fields[5].dispatchEvent(new Event('change',{bubbles:true}));
   };
  }
  form.querySelector('.klab-family-grid')?.addEventListener('keydown',event=>{
   const direction=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0;
   const field=event.target;
   if(!direction||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||
    event.isComposing||!field.matches('input,select'))return;
   if(field.matches('input')&&(field.selectionStart!==field.selectionEnd||
    field.selectionStart!==(direction<0?0:field.value.length)))return;
   const row=field.closest('tr');
   const controls=[...row.querySelectorAll('input:not(:disabled),select:not(:disabled)')];
   const simple=direction<0&&field.dataset.klabCriterion==='child-tax-credit'?
    row.querySelector('[data-klab-simple-child] select:not(:disabled)'):null;
   const next=simple||controls[controls.indexOf(field)+direction];
   if(!next)return;
   event.preventDefault();
   next.focus();
  });
  function selectTab(index,focus=false){
   tabs.forEach((tab,i)=>{
    tab.setAttribute('aria-selected',String(i===index));
    tab.tabIndex=i===index?0:-1;
    form.querySelector('#'+tab.getAttribute('aria-controls')).hidden=i!==index;
   });
   if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,i)=>{
   tab.onclick=()=>selectTab(i);
   tab.onkeydown=event=>{
    const next={ArrowLeft:1-i,ArrowRight:1-i,Home:0,End:1}[event.key];
    if(next===undefined)return;
    event.preventDefault();
    selectTab(next,true);
   };
  });
  if(registrationWindow&&routeParams.get('tab')==='family')selectTab(1);
  function showCount(){
   output.textContent=imported.value===''?'미반영':imported.value+'명';
  }
  function showEmployee(){
   if(!question.registration.detailed)return;
   for(const [i,key] of ['code','name','number'].entries()){
    const value=quiz.registrationAnswer(question.fields[i],fields[i].value)||'—';
    form.querySelectorAll('[data-klab-self-'+key+']').forEach(el=>{el.textContent=value});
   }
   selfNationality.value=fields[5].value;
  }
  function showFamilyAges(){
   for(const cell of form.querySelectorAll('[data-klab-age]')){
    const date=quiz.registrationBirthDate(fields[Number(cell.dataset.klabAge)].value);
    const age=question.registration.year-Number(date.slice(0,4));
    cell.textContent=date&&age>=0?age:'—';
   }
  }
  const totalGroups={
   basic:field=>field.key==='self-basic'||field.key.endsWith(':deduction'),
   senior:field=>field.criterion==='senior-deduction',
   disability:field=>field.criterion==='disability-deduction',
   children:field=>field.criterion==='child-tax-credit'
  };
  function showDeductionTotals(){
   for(const total of form.querySelectorAll('[data-klab-total]')){
    const includes=totalGroups[total.dataset.klabTotal];
    total.textContent=question.fields.filter((field,i)=>includes(field)&&/^(yes|[1-6])$/.test(fields[i].value)).length+'명';
   }
  }
  load.onclick=()=>{
   imported.value=String(quiz.childcareCount(question.registration,values()));
   showCount();
   imported.dispatchEvent(new Event('change',{bubbles:true}));
  };
  const invalidateImport=event=>{
   if(fields.slice(0,3).includes(event.target)||event.target===fields[5])showEmployee();
   if(event.target.matches('input[maxlength="14"]'))showFamilyAges();
   if(event.target.matches('select[name^="answer-"]'))showDeductionTotals();
   if(!event.target.hasAttribute('data-childcare-source'))return;
   imported.value='';
   showCount();
  };
  form.addEventListener('input',invalidateImport);
  form.addEventListener('change',invalidateImport);
  return {
   values,restore(){showCount();showEmployee();showFamilyAges();showDeductionTotals()},
   showResult(results){
    fields.forEach((field,i)=>{
     field.disabled=true;
     if(!results[i].correct)field.setAttribute('aria-invalid','true');
    });
    load.disabled=true;
    if(selfNationality){
     selfNationality.disabled=true;
     if(!results[5].correct)selfNationality.setAttribute('aria-invalid','true');
    }
    output.classList.toggle('klab-count-wrong',!results.at(-1).correct);
    const missed=results.filter(result=>!result.correct),feedback=form.querySelector('.klab-field-results');
    feedback.innerHTML=missed.length?`<ul>${missed.map(result=>`<li><strong>${esc(result.label)}</strong> · 입력 ${esc(result.value)} · 정답 ${esc(result.expected)}</li>`).join('')}</ul>`:'';
    const firstWrong=results.findIndex(result=>!result.correct);
    selectTab(firstWrong===-1||firstWrong>=question.registration.basicCount?1:0);
    return results.length-missed.length;
   }
  };
 }
 function withholdingQuiz(course){
  const params=new URLSearchParams(location.search),income=course==='income';
  const registration=registrationSample,employee=employeeSample||registration;
  const family=employee&&params.get('sample')==='employee-family';
  const dueMode=params.get('review')==='due',Q=SemuonQuizReview;
  const countKey='semuon-withholding-quiz-preview-count';
  const levelKey='semuon-tax-quiz-level-'+course;
  const allowed=['3','5','10','all'];
  const quiz=globalThis.SemuonTaxQuiz;
  let familySeed;
  if(family){
   const raw=params.get('variant');
   familySeed=raw!==null&&/^\d{1,10}$/.test(raw)&&Number(raw)<=4294967295?Number(raw):crypto.getRandomValues(new Uint32Array(1))[0];
   const url=new URL(location.href);url.searchParams.set('variant',familySeed);history.replaceState(null,'',url);
  }
  const all=quiz.questions(course);
  const savedRegistration=registration&&all.find(q=>q.registration&&q.id===params.get('question'));
  const bank=all.filter(q=>employee?q.sample===quizSample&&(!registration||dueMode||(savedRegistration?q===savedRegistration:q.registration?.detailed)):!q.registration)
   .map(q=>q.family&&family?quiz.employeeFamily(familySeed,q.scenario):q),attempts=new Map();
  const today=()=>SemuonProgress.day(Date.now());
  const quizState=()=>Q.analyze(storedSnapshot().quizReviewEvents);
  const resumeCourse=registration?(savedRegistration&&!savedRegistration.registration.detailed?'employee-klab':'employee-klab-details'):course;
  const session=globalThis.SemuonResume?.readQuiz(resumeCourse);
  function studyURL(url){
   const copy=new URL(url);
   if(registration){
    copy.searchParams.delete('view');
    copy.searchParams.delete('tab');
   }
   return copy.href;
  }
  const restoreQuiz=session?.url===studyURL(location.href)?session:null;
  const drafts=new Map();
  let initialQuiz=true,flushQuizMemo=()=>true;
  for(const q of bank){
   const saved=restoreQuiz?.drafts?.[q.id],event=restoreQuiz?.attempts?.[q.id];
   if((!event||restoreQuiz.day===today()&&event.signature===C.stable(q.answers))&&Array.isArray(saved)&&saved.length===q.answers.length&&saved.every(value=>typeof value==='string'&&value.length<=100))drafts.set(q,saved);
   if(restoreQuiz?.day!==today()||!event||event.signature!==C.stable(q.answers)||!Array.isArray(event.values))continue;
   const recorded=(storedSnapshot().quizReviewEvents||[]).find(e=>e.kind==='attempt'&&e.id===event.id&&e.questionId===q.id);
   if(recorded&&event.values.length===q.answers.length&&event.values.every(value=>typeof value==='string'&&value.length<=100)){
    attempts.set(q,{...event,correct:recorded.correct,missed:[]});
   }
  }
  const lawLinks={
   12:['소득세법 제12조','https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1001059372'],
   childcare:['보육수당 연령 기준 · 법제처 해석','https://www.law.go.kr/expcInfoP.do?expcSeq=341115'],
   14:['소득세법 제14조','https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1019371607'],
   21:['소득세법 제21조','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1026500583'],
   50:['소득세법 제50조','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031985573'],
   51:['소득세법 제51조','https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000660252'],
   childTax:['소득세법 제59조의2','https://law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1032881079'],
   simpleChild:['근로소득 간이세액표 · 국세청','https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7862&mi=6583'],
   medical:['소득세법 제59조의4','https://www.law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1018486163'],
   19:['소득세법 제19조','https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1022119213'],
   20:['소득세법 제20조','https://www.law.go.kr/법령/소득세법/제20조'],
   33:['소득세법 제33조','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029623881'],
   47:['소득세법 제47조','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1026637559'],
   135:['소득세법 제135조','https://www.law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1017635085'],
   insurance:['소득세법 제59조의4','https://www.law.go.kr/법령/소득세법/제59조의4'],
   glasses:['소득세법 시행령 제118조의5','https://law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1001059439'],
   pensionDeduction:['소득세법 제47조의2','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1032880567'],
   pensionTiming:['소득세법 시행령 제50조','https://www.law.go.kr/법령/소득세법시행령/제50조'],
   interestTiming:['소득세법 시행령 제45조','https://law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1032167209'],
   dividendTiming:['소득세법 시행령 제46조','https://www.law.go.kr/법령/소득세법시행령/제46조'],
   businessTiming:['소득세법 시행령 제48조','https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1001063397'],
   otherExpense:['소득세법 시행령 제87조','https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1024401661'],
   vehicle:['소득세법 시행령 제12조','https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1028395329'],
   salary:['소득세법 시행령 제49조','https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0049&lsiSeq=290841&urlMode=lsScJoRltInfoR']
  };
  let questions=[];
  let position=0;
  let daily='5';
  let preferredLevel;
  try{
   const saved=params.get('count')||localStorage.getItem(countKey);
   if(allowed.includes(saved))daily=saved;
   preferredLevel=localStorage.getItem(levelKey);
  }catch(_){}
  const initialLevel=employee?quiz.levels[0]:quiz.levels.find(level=>level.id===params.get('level'))||
   quiz.levels.find(level=>level.id===preferredLevel)||quiz.levels[0];
  const back=registration?employeePath:income?'pages/concepts.html?subject=income':'pages/forms.html?practice=withholding';
  const desktopInk=!registration&&!matchMedia('(max-width:760px), (pointer:coarse)').matches;
  const title=registration?'K랩 · 사원 등록':employee?'사원 등록':income?'소득세법 핵심 퀴즈':'원천징수 핵심 퀴즈';
  document.title=title+' · 전산세무 2급';
  if(registrationWindow)document.body.classList.add('klab-window');
  const windowLink=registration?(registrationWindow?`<a class="btn secondary" id="klab-window-return" href="${esc(studyURL(location.href))}">학습센터 화면</a>`:
   '<a class="btn secondary" id="klab-open-window" target="_blank" rel="noopener">새 창에서 열기</a>'):'';
  content.innerHTML=head(title,'',`<div class="row quiz-heading-actions">${windowLink}${dueMode?`<a class="btn secondary" href="${registration?href(registrationPath):quizPage(course)}">${registration?'사원 등록 연습':'전체 퀴즈'}</a>`:''}<a class="btn secondary" href="${href(back)}">${registration?'사원 등록 퀴즈':income?'소득세법 개념':'원천징수 실무'}</a></div>`)+`
   <div class="quiz-workspace ${desktopInk?'quiz-ink-layout':''}${registration?' klab-workspace':''}">
   <div class="withholding-quiz">
    ${dueMode?'<p class="quiz-due-heading"><strong>오늘 복습</strong></p>':''}
    <section class="card withholding-quiz-settings row" aria-label="퀴즈 조건"${dueMode||employee?' hidden':''}>
     <label><span id="quiz-unit-label">단원</span><select id="withholding-quiz-unit" aria-labelledby="quiz-unit-label"></select></label>
     <label><span id="quiz-detail-label">세부 주제</span><select id="withholding-quiz-detail" aria-labelledby="quiz-detail-label"></select></label>
     <label><span id="quiz-level-label">난이도</span><select id="withholding-quiz-level" aria-labelledby="quiz-level-label">${quiz.levels.map(level=>
      `<option value="${level.id}"${level===initialLevel?' selected':''}>${esc(level.option)}</option>`).join('')}</select></label>
     <label><span id="quiz-count-label">풀 문제 수</span><select id="withholding-quiz-count" aria-labelledby="quiz-count-label">${allowed.map(n=>`<option value="${n}"${daily===n?' selected':''}>${n==='all'?'전체':n+'문제'}</option>`).join('')}</select></label>
     <span class="help withholding-quiz-total" role="status"></span>
    </section>
    <div id="quiz-ink-question" class="quiz-ink-over-question">
    <section class="card withholding-quiz-question" id="withholding-quiz-card" aria-labelledby="withholding-question"></section>
    <canvas aria-hidden="true"></canvas></div>
   </div>
   ${desktopInk?`<div class="quiz-splitter" role="separator" aria-label="문제와 필기 영역 비율" aria-orientation="vertical" aria-valuemin="25" aria-valuemax="75" aria-valuenow="50" tabindex="0"></div><section id="quiz-ink-paper" class="quiz-ink-paper" aria-label="퀴즈 필기 공간" tabindex="0">
    <div class="quiz-ink-tools" role="group" aria-label="필기 도구"></div>
    <div class="quiz-ink-images"></div><canvas aria-label="펜과 마우스로 그리는 필기 영역"></canvas>
   </section>`:'<div class="quiz-ink-tools problem-ink-tools" role="group" aria-label="문제 필기 도구"></div>'}</div>
   <dialog class="quiz-stats-dialog" aria-labelledby="quiz-stats-title">
    <header class="row spread"><h2 id="quiz-stats-title">${esc(Q.courses[course])} 퀴즈 통계</h2><form method="dialog"><button class="btn secondary" type="submit">닫기</button></form></header>
    <div class="quiz-stats-body"></div>
   </dialog>`;
  const heading=$('.page-head h1'),titleRow=document.createElement('div'),stats=document.createElement('button');
  titleRow.className='row quiz-title-row';
  stats.type='button';stats.className='btn secondary quiz-stats-button';stats.textContent='통계';
  stats.setAttribute('aria-haspopup','dialog');
  heading.before(titleRow);titleRow.append(heading,stats);
  const dialog=$('.quiz-stats-dialog');
  stats.onclick=()=>{
   const cards=quizState(),rows=Q.distribution(bank,cards);
   let start=0;
   const segments=rows.filter(row=>row.count).map(row=>{
    const end=start+row.count*100/bank.length,segment=row.color+' '+start+'% '+end+'%';start=end;return segment;
   });
   const percent=new Intl.NumberFormat('ko-KR',{style:'percent',maximumFractionDigits:1});
   const totalDue=Q.due(bank,cards,today()).length;
   dialog.querySelector('.quiz-stats-body').innerHTML=`
    <p class="quiz-stats-totals">전체 <strong>${bank.length}문제</strong> · 지금 복습할 문제 <strong>${totalDue}개</strong></p>
    <div class="quiz-stats-grid"><div class="quiz-stats-pie" style="--quiz-pie:conic-gradient(${segments.length>1?segments.join(','):segments[0]+','+segments[0]})" aria-hidden="true"></div>
    <table class="quiz-stats-counts"><thead><tr><th scope="col">상태</th><th scope="col">개수</th><th scope="col">비율</th></tr></thead>
    <tbody>${rows.map(row=>`<tr><th scope="row"><i style="--quiz-color:${row.color}"></i>${row.label}</th><td>${row.count}</td><td>${percent.format(row.ratio)}</td></tr>`).join('')}</tbody></table></div>
    <p class="help quiz-stats-note">성숙 문제는 복습 간격이 21일 이상인 문제입니다.</p>`;
   dialog.showModal();
  };
  const ink=globalThis.SemuonQuizInk?.mount($('.quiz-ink-tools'),$('#quiz-ink-paper'),$('#quiz-ink-question'));
  if(desktopInk){
   const workspace=$('.quiz-workspace'),splitter=$('.quiz-splitter'),ratioKey='semuon-tax2-quiz-split-'+(employee?'employee':course);
   let ratio=50,drag=null;try{const value=Number(localStorage.getItem(ratioKey));if(value>=25&&value<=75)ratio=value}catch(_){}
   const setRatio=value=>{ratio=Math.max(25,Math.min(75,value));workspace.style.setProperty('--quiz-left',ratio+'fr');workspace.style.setProperty('--quiz-right',(100-ratio)+'fr');splitter.setAttribute('aria-valuenow',String(Math.round(ratio)))};
   const remember=()=>{try{localStorage.setItem(ratioKey,String(ratio))}catch(_){}};setRatio(ratio);
   splitter.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();drag=event.pointerId;splitter.setPointerCapture(drag);splitter.focus({preventScroll:true})};
   splitter.onpointermove=event=>{if(drag!==event.pointerId)return;const rect=workspace.getBoundingClientRect();setRatio((event.clientX-rect.left)/rect.width*100)};
   for(const type of ['pointerup','pointercancel','lostpointercapture'])splitter.addEventListener(type,event=>{if(drag!==event.pointerId)return;drag=null;remember()});
   splitter.onkeydown=event=>{const value=event.key==='ArrowLeft'?ratio-2:event.key==='ArrowRight'?ratio+2:event.key==='Home'?25:event.key==='End'?75:null;if(value===null)return;event.preventDefault();setRatio(value);remember()};
   splitter.ondblclick=()=>{setRatio(50);remember()};
  }
  const count=$('#withholding-quiz-count'),card=$('#withholding-quiz-card');
  const unit=$('#withholding-quiz-unit'),detail=$('#withholding-quiz-detail'),level=$('#withholding-quiz-level');
  const total=$('.withholding-quiz-total');
  const openWindow=$('#klab-open-window'),returnWindow=$('#klab-window-return');
  if(openWindow){
   const savedDraft=()=>JSON.stringify(globalThis.SemuonResume?.readQuiz(resumeCourse));
   let carried;
   openWindow.onclick=event=>{
    if(!flushQuizMemo()){event.preventDefault();return}
    const url=new URL(openWindow.href);
    if($('#klab-family-tab')?.getAttribute('aria-selected')==='true')url.searchParams.set('tab','family');
    else url.searchParams.delete('tab');
    openWindow.href=url.href;
    carried=savedDraft();
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const opened=window.open(openWindow.href,'_blank','popup,width=1420,height=880');
    if(opened){opened.opener=null;event.preventDefault();opened.focus()}
   };
   window.addEventListener('focus',()=>{
    if(carried!==undefined&&(savedDraft()!==carried||!store.isCurrent()))location.reload();
   });
  }
  function setOptions(select,values,label,selected){
   select.replaceChildren(new Option(label,''),...[...new Set(values)].map(value=>new Option(value,value)));
   if([...select.options].some(option=>option.value===selected))select.value=selected;
  }
  function selectQuestions(){
   if(!flushQuizMemo())return;
   const matching=bank.filter(question=>question.level===level.value&&quiz.inUnit(question,unit.value)&&
    (!detail.value||question.detail===detail.value));
   questions=dueMode?Q.due(bank,quizState(),today()):family||count.value==='all'?matching:quiz.selectQuestions(matching,Number(count.value),level.value);
   position=0;
   if(initialQuiz&&params.get('question')){
    const chosen=matching.find(q=>q.id===params.get('question'));
    if(chosen&&!questions.includes(chosen))questions=[chosen,...questions].slice(0,count.value==='all'?matching.length:Number(count.value));
    const index=questions.findIndex(q=>q.id===params.get('question'));
    if(index>=0)position=index;
   }
   if(initialQuiz&&restoreQuiz){
    const allowed=new Map((dueMode?questions:matching).map(q=>[q.id,q]));
    const ids=restoreQuiz.ids;
    if(restoreQuiz.day===today()&&Array.isArray(ids)&&ids.length&&new Set(ids).size===ids.length&&ids.every(id=>allowed.has(id))){
     questions=ids.map(id=>allowed.get(id));
    }
    const index=questions.findIndex(q=>q.id===restoreQuiz.current);
    if(index>=0)position=index;
   }
   initialQuiz=false;
   rememberQuiz();
   total.textContent=questions.length===matching.length?`${matching.length}문제`:`${matching.length}문제 중 ${questions.length}문제`;
   if(!questions.length){
    ink?.show(null);
    card.innerHTML=`<h2 id="withholding-question">${dueMode?'오늘 예정된 복습 문제가 없습니다.':'선택한 난이도에 해당하는 문제가 없습니다.'}</h2>
     ${detail.value?'<button type="button" class="btn secondary" id="quiz-clear-detail">전체 주제 보기</button>':''}`;
    const clear=$('#quiz-clear-detail');
    if(clear)clear.onclick=()=>{detail.value='';selectQuestions();detail.focus()};
    resume?.ready();
    return;
   }
   renderQuestion();
  }
  function updateTopics(selected){
   setOptions(detail,bank.filter(question=>quiz.inUnit(question,unit.value)).map(question=>question.detail),'전체 주제',selected);
   selectQuestions();
  }
  function rememberQuiz(){
   const url=new URL(location.href);
   if(url.searchParams.has('question')&&questions[position])url.searchParams.set('question',questions[position].id);
   for(const [key,value] of [['unit',unit.value],['detail',detail.value],['level',level.value],['count',count.value]]){
    if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
   }
   history.replaceState(null,'',url);
   if(openWindow){
    const detached=new URL(url);
    detached.searchParams.set('view','window');
    openWindow.href=detached.href;
   }
   if(returnWindow)returnWindow.href=studyURL(url);
   globalThis.SemuonResume?.saveQuiz(resumeCourse,{
    url:studyURL(url),day:today(),ids:questions.map(q=>q.id),current:questions[position]?.id,
    drafts:Object.fromEntries([...drafts].map(([q,values])=>[q.id,values])),
    attempts:Object.fromEntries([...attempts].map(([q,attempt])=>[q.id,{...attempt,signature:C.stable(q.answers)}]))
   });
   resume?.remember();
  }
  setOptions(unit,quiz.units[course],'전체 단원',employee?'사원등록':params.get('unit'));
  unit.onchange=()=>updateTopics(detail.value);
  detail.onchange=selectQuestions;
  level.onchange=()=>{
   try{localStorage.setItem(levelKey,level.value)}catch(_){}
   if(params.has('level')){
    const url=new URL(location.href);
    url.searchParams.set('level',level.value);
    history.replaceState(null,'',url);
   }
   selectQuestions();
  };
  count.onchange=()=>{
   try{localStorage.setItem(countKey,count.value)}catch(_){}
   selectQuestions();
  };

  function answerFields(question){
   if(question.registration)return registrationFieldsHTML(question);
   if(question.family){
    const control=i=>`<select name="answer-${i}" required aria-label="${esc(question.fields[i].label)}">${question.fields[i].options.map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join('')}</select>`;
    return `<section class="employee-source" aria-labelledby="employee-source-title"><h3 id="employee-source-title">자료 1 · 사원 정보</h3><dl class="employee-meta">${question.family.employee.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>
     <div class="row spread employee-family-heading"><h3>자료 2 · 가족 정보</h3><span class="help">가상 주민등록번호 · 끝자리 X</span></div>
     <p class="quiz-question-condition">${esc(question.condition)}</p>
     <table class="employee-family-table"><caption class="sr-only">가족별 기본공제 대상 여부와 판단 이유</caption>
      <colgroup><col><col><col><col><col><col></colgroup>
      <thead><tr><th scope="col">관계</th><th scope="col">성명</th><th scope="col">주민등록번호</th><th scope="col">비고</th><th scope="col">기본공제</th><th scope="col">판단의 결정적인 이유</th></tr></thead>
      <tbody>${question.family.rows.map((row,i)=>`<tr data-employee-row="${i}"><th scope="row" data-label="관계">${esc(row.relation)}</th><td data-label="성명">${esc(row.name)}</td><td data-label="주민등록번호"><span class="employee-rrn">${esc(row.rrn)}</span></td><td data-label="비고">${esc(row.remarks)}</td><td data-label="기본공제">${control(i*2)}</td><td data-label="판단 이유">${control(i*2+1)}<p class="employee-feedback" hidden></p></td></tr>`).join('')}</tbody>
     </table>`;
   }
   if(question.choices)return `<div class="withholding-quiz-options">${question.choices.map(([value,label])=>
    `<label><input type="radio" name="answer-0" value="${value}" required> <span>${esc(label)}</span></label>`).join('')}</div>`;
   return `<div class="withholding-quiz-fields">${question.fields.map(({label,options},i)=>`
    <label class="field"><span>${esc(label)}</span>
     ${options
      ?`<select name="answer-${i}" required>${options.map(([value,text])=>`<option value="${value}">${text}</option>`).join('')}</select>`
      :`<span class="withholding-quiz-amount"><input type="text" name="answer-${i}" inputmode="numeric" autocomplete="off"
         pattern="[0-9]+|[0-9]{1,3}(,[0-9]{3})+" maxlength="10" required aria-describedby="withholding-quiz-unit-${i}"><span id="withholding-quiz-unit-${i}">만 원</span></span>`}
    </label>`).join('')}</div>`;
  }
  function renderQuestion(focus=false){
   const question=questions[position],attempt=attempts.get(question);
   const markId=question.variant===undefined?question.id:question.id+'-v'+question.variant;
   const layout=card.closest('.quiz-workspace');
   layout.classList.toggle('employee-family-layout',Boolean(question.family));
   const savedMemo=C.quizNotes(storedSnapshot()).get(question.id)?.text||'';
   ink?.show(question);
   const difficulty=quiz.levels.find(option=>option.id===question.level);
   const book=quiz.books[question.book];
   const {bookPage,pdfPage}=question.reference||{bookPage:126,pdfPage:143};
   const referenceLabel=registration?'':`${book.label} ${bookPage}쪽 (PDF ${pdfPage}쪽)`;
   const localPdf=location.protocol==='file:'&&!rootURL.pathname.includes('/github-publish/site/');
   const reference=localPdf&&referenceLabel
    ?`<a href="${esc(href(book.file+'#page='+pdfPage))}" target="_blank" rel="noopener">${referenceLabel}</a>`
    :referenceLabel;
   card.innerHTML=`<div data-problem-id="${esc(markId)}">
    <div class="row spread"><span class="pill">${income?'이론':'실무'} · ${esc(question.topic)}</span><span class="help">${esc(difficulty.label)} · ${position+1} / ${questions.length}</span></div>
     <form id="withholding-quiz-form">
      <fieldset>
       <legend id="withholding-question" tabindex="-1">${esc(question.prompt)}</legend>
       ${question.facts?`<dl class="quiz-question-facts">${question.facts.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:''}
       ${question.condition&&!question.family?`<p class="quiz-question-condition">${esc(question.condition)}</p>`:''}
       ${answerFields(question)}
      </fieldset>
      <div class="row">
       ${registration?`<button type="button" class="btn secondary" data-klab-self="pass">✓ 알고 있어요 · 통과</button>
        <button type="button" class="btn secondary" data-klab-self="retry">↻ 틀렸어요 · 다시 연습</button>
        <button type="button" class="btn secondary" id="klab-confused">헷갈려요</button>`:''}
       <button type="submit" class="btn">${registration?'채점하기':'정답 확인'}</button>
       <button type="button" class="btn secondary" id="withholding-quiz-reset"${registration?'':' hidden'}>${registration?'초기화':'다시 풀기'}</button>
       ${registration?'<span id="klab-attempt-count" class="help" role="status"></span>':''}
      </div>
      ${registration?'<p id="klab-self-status" class="help" role="status"></p>':''}
      <p id="withholding-quiz-result" class="feedback" role="status" tabindex="-1" hidden></p>
      ${registration?`<details class="klab-answer-preview">
       <summary>정답 · 해설 보기</summary>
       <p data-klab-text>${esc(question.explanation)}</p>
       <div class="table-scroll"><table><thead><tr><th scope="col">항목</th><th scope="col">정답</th></tr></thead><tbody>
        ${quiz.fieldResults(question,question.answers).map(field=>`<tr><th scope="row" data-klab-text>${esc(field.label)}</th><td data-klab-text>${esc(field.expected)}</td></tr>`).join('')}
       </tbody></table></div></details>`:''}
      <div id="withholding-quiz-explanation" hidden>
       ${question.family?'':`<p><strong>정답</strong> ${esc(question.solution)}</p>`}
       <p>${esc(question.explanation)}</p>
       ${registration?'<div class="klab-field-results"></div>':''}
       <p class="help">${reference}${question.articles
        ?(reference?' · ':'')+question.articles.map(n=>`<a href="${esc(lawLinks[n][1])}" target="_blank" rel="noopener">${esc(lawLinks[n][0])}</a>`).join(' · ')
        :''}</p>
      </div>
     </form>
     <form class="problem-note quiz-memo" hidden>
      <div class="problem-note-heading"><label for="quiz-memo">학습 메모</label><button class="btn secondary" type="submit">메모 저장</button></div>
      <textarea id="quiz-memo" maxlength="4000" rows="2" placeholder="헷갈린 요건이나 기억할 내용을 적으세요.">${esc(savedMemo)}</textarea>
      <span class="help" role="status"></span>
     </form>
     <section class="quiz-review-rating" aria-label="다음 복습 평가" hidden></section>
     ${questions.length>1?`<nav class="row withholding-quiz-pagination" aria-label="퀴즈 문제 이동">
      <button type="button" class="btn secondary" data-quiz-step="-1"${position===0?' disabled':''}>이전 문제</button>
      <button type="button" class="btn secondary" data-quiz-step="1"${position===questions.length-1?' disabled':''}>다음 문제</button>
     </nav>`:''}</div>`;
   function attachQuizMarkup(){
    const markup=globalThis.SemuonMarkup;
    if(!markup)return;
    card.querySelectorAll([
     '.pill','#withholding-question','.quiz-question-condition','.quiz-question-facts dt','.quiz-question-facts dd',
     '.withholding-quiz-options label > span','.withholding-quiz-fields label > span:first-child',
     '.employee-source h3','.employee-family-heading h3','.employee-meta dt','.employee-meta dd',
     '.employee-family-table thead th','.employee-family-table tbody tr > :nth-child(-n+4)',
     '#withholding-quiz-explanation p','.klab-field-results li','[data-klab-text]'
    ].join(',')).forEach(el=>el.setAttribute('data-mark-text',''));
    card.querySelectorAll('.employee-feedback summary,.employee-feedback details p').forEach(el=>el.setAttribute('data-mark-text','feedback'));
    markup.attach(card,{shortcuts:()=>C.markupShortcuts(snapshot().settings),onUndo:recordScreenUndo});
   }
   attachQuizMarkup();
   const form=$('#withholding-quiz-form'),grade=form.querySelector('[type=submit]');
   const options=form.querySelector('fieldset'),reset=$('#withholding-quiz-reset');
   const registrationUI=registration?bindRegistration(form,question):null;
   const quizReport={course,title:title+" · "+question.topic,prompt:question.prompt,
    conditions:[quiz.caseText(question),question.choices?.map(([,label],i)=>(i+1)+". "+label).join("\n")||question.fields.map(field=>field.label+(field.options?" · "+field.options.filter(([value])=>value).map(([,label])=>label).join(" / "):"")).join("\n")].filter(Boolean).join("\n"),
    answer:[question.family?question.family.rows.map(row=>row.label+': '+(row.eligible==='yes'?'공제 가능':'공제 불가')+' · '+row.explanation).join('\n'):question.solution,question.explanation,referenceLabel].filter(Boolean).join("\n")};
   reset.after(problemReportButton("quiz:"+course+":"+question.prompt,quizReport));
   const result=$('#withholding-quiz-result'),explanation=$('#withholding-quiz-explanation');
   const ratingBox=card.querySelector('.quiz-review-rating');
   const memoForm=card.querySelector('.quiz-memo'),memoInput=memoForm.querySelector('textarea'),memoStatus=memoForm.querySelector('[role=status]');
   flushQuizMemo=(beforeSync=false)=>{
    if(memoForm.dataset.dirty!=='true')return true;
    try{
     if(problemReportsSyncing&&!beforeSync)throw new Error('동기화가 끝난 뒤 메모를 저장해 주세요.');
     const text=memoInput.value.trim(),latest=C.quizNotes(storedSnapshot()).get(question.id);
     if(text!==(latest?.text||''))store.update(state=>(state.quizNotes||(state.quizNotes=[])).push({
      id:crypto.randomUUID(),course,questionId:question.id,text,
      at:new Date(Math.max(Date.now(),(Date.parse(latest?.at)||0)+1)).toISOString()
     }));
     delete memoForm.dataset.dirty;
     memoStatus.textContent='저장됨';
     return true;
    }catch(error){memoStatus.textContent='저장하지 못했습니다. 다시 저장해 주세요.';fail(error);return false}
   };
   memoInput.oninput=()=>{memoForm.dataset.dirty='true';memoStatus.textContent='작성 중'};
   memoInput.onchange=memoInput.onblur=()=>flushQuizMemo();
   memoForm.onsubmit=event=>{event.preventDefault();flushQuizMemo()};
   function showRegistrationCounts(){
    if(!registrationUI)return;
    const counted=quizState().get(question.id);
    $('#klab-attempt-count').textContent='채점 '+(counted?.attempts||0)+'회 · 틀림 '+(counted?.wrong||0)+'회';
    $('#klab-self-status').textContent=counted?.selfDay===today()?
     (counted.self.correct?'직접 통과로 기록했습니다.':'다시 연습할 문제로 기록했습니다.'):'';
   }
   showRegistrationCounts();
   if(registrationUI){
    card.querySelectorAll('[data-klab-self]').forEach(button=>button.onclick=()=>act(()=>{
     if(problemReportsSyncing){toast('동기화가 끝난 뒤 다시 눌러 주세요.');return}
     store.update(state=>(state.quizReviewEvents||(state.quizReviewEvents=[])).push({
      id:crypto.randomUUID(),kind:'self',course,questionId:question.id,correct:button.dataset.klabSelf==='pass',at:new Date().toISOString()
     }));
     showRegistrationCounts();
     if(dueMode)selectQuestions();
    }));
    $('#klab-confused').onclick=()=>{
     memoForm.hidden=false;
     memoInput.focus();
    };
   }

   function showRatings(attempt){
    const state=quizState().get(question.id),date=today();
    if(!state){ratingBox.hidden=true;return}
    ratingBox.hidden=false;
    if(state.day!==date||state.first.id!==attempt.id||state.rating){
     const selected=state.rating&&state.first.id===attempt.id?Q.ratings.find(([id])=>id===state.rating)?.[1]:'';
     ratingBox.innerHTML=`<p role="status">${selected?`<strong>${selected}</strong> · `:''}다음 복습 <strong>${esc(state.plan.due)}</strong></p>`;
     return;
    }
    ratingBox.innerHTML=`<div class="quiz-rating-buttons">${Q.ratings.map(([id,label],index)=>{
     const due=Q.nextPlan(state.before,date,id).due,key=index+1;
     return `<button class="btn secondary" type="button" data-quiz-rating="${id}" aria-keyshortcuts="${key}"${!attempt.correct&&id!=='again'?' disabled':''}><span><kbd>${key}</kbd> ${label}</span><small>${due===SemuonProgress.add(date,1)?'내일':esc(due.slice(5).replace('-','/'))}</small></button>`;
    }).join('')}</div>`;
    ratingBox.querySelectorAll('button').forEach(button=>button.onclick=()=>act(()=>{
     if(problemReportsSyncing){toast('동기화가 끝난 뒤 다시 눌러 주세요.');return}
     const current=quizState().get(question.id),rating=button.dataset.quizRating;
     if(current?.first?.id!==attempt.id||current.rating||current.day!==today()){showRatings(attempt);return}
     store.update(s=>s.quizReviewEvents.push({id:crypto.randomUUID(),kind:'rating',attemptId:attempt.id,rating,at:new Date().toISOString()}));
     showRatings(attempt);
     ratingBox.querySelector('[role=status]')?.setAttribute('tabindex','-1');
     ratingBox.querySelector('[role=status]')?.focus({preventScroll:true});
    }));
   }
   function showResult(attempt){
    const {correct,missed}=attempt;
    grade.disabled=true;
    if(!registrationUI)options.disabled=true;
    reset.hidden=result.hidden=explanation.hidden=false;
    memoForm.hidden=false;
    result.classList.toggle('good',correct);
    result.classList.toggle('wrong',!correct);
    result.textContent=correct?'정답입니다.':missed.length
     ?'다시 볼 항목 · '+missed.join(', ')
     :'해설을 확인해 보세요.';
    if(question.family){
     let complete=0;
     question.family.rows.forEach((row,i)=>{
      const correctRow=attempt.values[i*2]===row.eligible&&attempt.values[i*2+1]===row.reason;
      if(correctRow)complete++;
      const line=card.querySelector('[data-employee-row="'+i+'"]'),feedback=line.querySelector('.employee-feedback');
      line.dataset.result=correctRow?'correct':'wrong';
      feedback.hidden=false;
      const detail=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');
      summary.textContent=(correctRow?'정답':'정답: '+(row.eligible==='yes'?'공제 가능':'공제 불가'))+' · 만 '+row.age+'세';
      text.textContent=row.explanation;detail.append(summary,text);feedback.replaceChildren(detail);
      for(const index of [i*2,i*2+1])form.elements.namedItem('answer-'+index).setAttribute('aria-invalid',String(attempt.values[index]!==question.answers[index]));
     });
     result.textContent=complete===question.family.rows.length?complete+'명 모두 정확합니다.':question.family.rows.length+'명 중 '+complete+'명 정확 · '+(question.family.rows.length-complete)+'명 재확인';
    }
    if(registrationUI){
     const results=quiz.fieldResults(question,attempt.values),matched=registrationUI.showResult(results);
     const importMissed=!results.at(-1).correct&&attempt.values.at(-1)==='';
     result.textContent=matched+'/'+results.length+'항목 정확'+(importMissed?' · 부양가족 불러오기가 누락되었습니다.':'');
    }
    showRatings(attempt);
    showRegistrationCounts();
    attachQuizMarkup();
    globalThis.SemuonMarkup?.retire(markId);
   }
   if(attempt){
    attempt.values.forEach((value,i)=>{
     const field=form.elements.namedItem('answer-'+i);
     field.value=value;
    });
    registrationUI?.restore();
    showResult(attempt);
   }else if(drafts.has(question)){
    drafts.get(question).forEach((value,i)=>{
     const field=form.elements.namedItem('answer-'+i);
     if(field)field.value=value;
    });
    registrationUI?.restore();
   }
   const answerValues=()=>{
    if(registrationUI)return registrationUI.values();
    const data=new FormData(form);
    return question.answers.map((_,i)=>String(data.get('answer-'+i)??''));
   };
   const saveQuizInputs=()=>{
    if(grade.disabled)return;
    drafts.set(question,answerValues());
    rememberQuiz();
   };
   form.addEventListener('input',saveQuizInputs);
   form.addEventListener('change',saveQuizInputs);
   form.onsubmit=event=>{
    event.preventDefault();
    if(grade.disabled)return;
    act(()=>{
    if(problemReportsSyncing){toast('동기화가 끝난 뒤 다시 눌러 주세요.');return}
    const values=answerValues();
    const fieldResults=quiz.fieldResults(question,values);
    const matches=registrationUI?fieldResults.map(field=>field.correct):question.answers.map((expected,i)=>typeof expected==='number'
     ?Number(values[i].replaceAll(',',''))===expected
     :values[i]===expected);
    const answer={
     id:crypto.randomUUID(),
     values,
     correct:matches.every(Boolean),
     missed:question.fields?.filter((_,i)=>!matches[i]).map(field=>field.label)||[]
    };
    store.update(state=>(state.quizReviewEvents||(state.quizReviewEvents=[])).push({
     id:answer.id,kind:'attempt',course,questionId:question.id,correct:answer.correct,at:new Date().toISOString(),
     ...(fieldResults?{caseText:quiz.caseText(question),variant:question.variant,fieldResults}:{})
    }));
    attempts.set(question,answer);
    drafts.set(question,values);
    rememberQuiz();
    showResult(answer);
    result.focus();
    });
   };
   reset.onclick=()=>{
    if(!flushQuizMemo())return;
    attempts.delete(question);
    drafts.delete(question);
    rememberQuiz();
    ink?.reset();
    renderQuestion();
    card.querySelector('input,select').focus();
   };
   card.querySelectorAll('[data-quiz-step]').forEach(button=>button.onclick=()=>{
    if(!flushQuizMemo())return;
    position+=Number(button.dataset.quizStep);
    rememberQuiz();
    renderQuestion(true);
   });
   if(focus)$('#withholding-question').focus();
   resume?.ready();
  }
  document.addEventListener('keydown',event=>{
   if(event.defaultPrevented||event.repeat||event.isComposing||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||
      dialog.open||event.target.closest?.('input,select,textarea,[contenteditable=true]')||!/^[1-4]$/.test(event.key))return;
   const id=Q.ratings[Number(event.key)-1][0],button=card.querySelector('[data-quiz-rating="'+id+'"]:not(:disabled)');
   if(!button)return;
   event.preventDefault();
   button.click();
  });
  document.addEventListener('semuon-before-sync',event=>{
   if(event.defaultPrevented)return;
   if(!flushQuizMemo(true)){event.preventDefault();problemReportsSyncing=false;return}
   card.querySelectorAll('.quiz-memo textarea,.quiz-memo button').forEach(el=>el.disabled=true);
  });
  document.addEventListener('semuon-sync-finished',event=>{
   if(!event.detail.succeeded)card.querySelectorAll('.quiz-memo textarea,.quiz-memo button').forEach(el=>el.disabled=false);
  });
  window.addEventListener('beforeunload',event=>{if(!flushQuizMemo()){event.preventDefault();event.returnValue=''}});
  window.addEventListener('pagehide',()=>flushQuizMemo());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushQuizMemo()});
  updateTopics(params.get('detail'));
 }
 function review(){
  const query=new URLSearchParams(location.search);
  const quiz=query.get('quiz');
  if(quiz==='withholding'||quiz==='deductions'){
   const target=new URL('pages/quiz.html',rootURL);
   target.searchParams.set('course','withholding');
   target.searchParams.set('level','basic');
   target.searchParams.set('unit',quiz==='deductions'?'사원등록':'급여자료입력');
   if(quiz==='withholding')target.searchParams.set('detail','수당·공제 등록');
   location.replace(target.href);
   return;
  }
  if(query.has('unit')){unitReviewPage().catch(fail);return}
  const settings=snapshot().settings,P=SemuonProgress,today=R.day(Date.now()),params=new URLSearchParams(location.search),dayParam=params.get('day');let viewDate=dayParam==='tomorrow'?P.add(today,1):dayParam==='yesterday'?P.add(today,-1):P.validDate(dayParam)?dayParam:today;
  const external=SemuonJournal.analyze(storedSnapshot()).needs.filter(e=>e.due<=today);
  content.innerHTML=head('오늘 복습','핵심 개념을 확인한 뒤 분야와 세부 유형을 고르게 복습합니다.')+statsCards()+`<section class="card rv-unit-section"><div class="row spread"><h2>단원 복습 · 무엇을 볼까요?</h2><a class="btn secondary" href="${href('pages/learning-map.html')}">학습 지도 →</a></div><div id="rv-unit-plans"></div></section>${external.length?`<section class="card"><h2>교재·외부 실습 재확인</h2><p class="help">사용자가 기록한 어려움입니다. 실제 채점 점수와 별도로 확인하세요.</p>${external.slice(0,4).map(e=>`<p><a href="${href('pages/journal.html?date='+e.date+'&entry='+encodeURIComponent(e.entryId))}">${esc([...SemuonCurriculum.units,...SemuonCurriculum.practiceUnits].find(u=>u.id===e.unitId)?.title||'학습 기록')}${e.focus?' · '+esc(e.focus):''}</a> · ${esc(C.STUDY_RESULTS[e.outcome])}</p>`).join('')}</section>`:''}<div class="toolbar rv-filter-toolbar"><button class="btn" id="combo-start" type="button" title="세 분야 3문제씩 바로 복습" aria-label="세 분야 3문제씩 바로 복습">3문제씩 복습</button><label class="field"><span>분야</span><select id="review-subject"><option value="">세 분야 골고루</option>${V.fields.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}<option value="all">모든 영역 골고루</option></select></label><label class="field"><span>하루 목표</span><select id="review-limit">${[6,9,12].map(n=>`<option value="${n}" ${settings.reviewLimit===n?'selected':''}>${n}유형</option>`).join('')}</select></label><label class="field"><span>방식</span><select id="review-mode"><option value="balanced">오늘 복습</option><option value="focus">집중훈련 · 직접 선택</option></select></label><label class="field" id="review-type-label" hidden><span>집중할 유형</span><select id="review-type"><option value="">최근 오답 유형</option></select></label><label class="field rv-date-field"><span>추천 날짜</span><span class="rv-date-controls"><button type="button" class="btn secondary" data-review-day="-1" aria-label="이전 날짜">‹</button><input id="review-date" type="date" value="${viewDate}" aria-label="추천 날짜"><button type="button" class="btn secondary" data-review-day="1" aria-label="다음 날짜">›</button><button type="button" class="btn secondary" id="review-today">오늘</button></span></label></div><p id="review-date-notice" class="rv-preview-notice" hidden></p><div class="rv-review-layout"><section aria-label="추천 복습 문제"><div id="review-list"></div></section></div>`;

  $('.rv-unit-section').insertAdjacentHTML('beforebegin','<section class="card quiz-due-card"><h2>핵심 퀴즈 복습</h2><div class="row" id="quiz-due-courses"></div></section>');
  const quizBanks=Object.entries(SemuonQuizReview.courses).map(([course,label])=>{
   const all=SemuonTaxQuiz.questions(course),standard={label,bank:all.filter(q=>!q.registration),url:quizPage(course,true)};
   return course==='withholding'?[standard,{label:'K랩 · 사원 등록',bank:all.filter(q=>q.registration),url:href(registrationPath+'&review=due'),onlyDue:true}]:[standard];
  }).flat();
  {const h1=$('.page-head h1'),row=document.createElement('div');row.className='title-row';h1.before(row);row.append(h1,$('#combo-start'))}
  if([...$('#review-subject').options].some(o=>o.value===params.get('field')))$('#review-subject').value=params.get('field');
  $('#combo-start').onclick=()=>act(startCombo);
  function render(){
   const future=viewDate>today,now=viewDate===today?Date.now():Date.parse(viewDate+'T23:59:59+09:00'),gs=V.analyze(snapshot(),{now}),field=$('#review-subject').value,mode=$('#review-mode').value,limit=Number($('#review-limit').value),scope=gs.filter(g=>V.matchesField(g,field)),selected=$('#review-type').value;
   const cards=SemuonQuizReview.analyze(storedSnapshot().quizReviewEvents,now);
   $('#quiz-due-courses').innerHTML=quizBanks.map(({label,bank,url,onlyDue})=>{
    const n=SemuonQuizReview.due(bank,cards,viewDate).length;
    if(onlyDue&&!n)return '';
    return n&&!future?`<a class="btn secondary" href="${url}">${label} · ${n}문제</a>`:
     `<span class="pill">${label} · ${n}문제</span>`;
   }).join('');
   $('#review-type').innerHTML='<option value="">최근 오답 유형</option>'+scope.map(g=>`<option value="${esc(g.key)}">${esc(g.label)}</option>`).join('');$('#review-type').value=scope.some(g=>g.key===selected)?selected:'';$('#review-type-label').hidden=mode!=='focus';
   const queue=V.select(gs,{now,field,mode,limit,type:mode==='focus'?$('#review-type').value:''}),notice=$('#review-date-notice');notice.hidden=viewDate===today;notice.textContent=future?'예정 미리보기입니다. 이후 채점에 따라 추천이 달라질 수 있으며 예정일 전에는 자동 출제하지 않습니다.':'지난 날짜 기준의 추천입니다. 지금 문제를 풀면 실제 채점 시각으로 기록됩니다.';$('#combo-start').disabled=future;
   const planState={...snapshot(),progressEvents:(snapshot().progressEvents||[]).filter(e=>Date.parse(e.at)<=now&&(!e.date||e.date<=viewDate))};$('#rv-unit-plans').innerHTML=P.cardsHTML(P.analyze(planState,{now}),href,{date:viewDate,limit:3,layout:'grid'});
   $('#review-list').innerHTML=queue.length?queue.map(g=>`<article class="question-row" data-review-key="${esc(g.key)}" data-review-unit="${esc(g.units.join(','))}" data-review-field="${g.field}"><div><span class="pill">${esc(V.fields.find(f=>f[0]===g.field)?.[1]||g.field)} · ${g.category==='new'?'미풀이 유형':g.category==='maintenance'?'감각 유지':'오답 재확인'}</span><h3>${future?`<span class="rv-preview-label">${esc(g.label)}</span>`:`<a class="row-link" href="${link(g.candidate,true)}">${esc(g.label)}</a>`}</h3><p class="rv-candidate">${esc(g.candidate.title)}</p><p class="rv-field-status">같은 유형 ${g.entries.length}문제 · 미풀이·오래된 문제 우선</p></div></article>`).join(''):'<div class="empty">선택한 범위의 추천을 마쳤거나 복습일이 아직 오지 않았습니다. 추가 연습은 집중훈련에서 선택하세요.</div>';
   const scopeIds=new Set(scope.flatMap(g=>g.entries.map(p=>p.id))),reasonRows=C.uncertaintyReasons(snapshot(),now).filter(n=>scopeIds.has(n.problemId)),reasonGroups=new Map();for(const n of reasonRows){if(!reasonGroups.has(n.problemId))reasonGroups.set(n.problemId,[]);reasonGroups.get(n.problemId).push(n)}
   if(reasonGroups.size)$('#review-list').insertAdjacentHTML('afterbegin',`<details class="card uncertainty-history"><summary>헷갈림 이유 · ${reasonGroups.size}문제</summary><div>${[...reasonGroups].sort((a,b)=>b[1].length-a[1].length).map(([id,rows])=>{const p=snapshot().items.find(p=>p.id===id);return `<article><a href="${link(p,true)}">${esc(p.type)} · ${rows.length}학습일</a>${rows.map(n=>`<p><time>${n.date}</time> ${esc(n.reason)}</p>`).join('')}</article>`}).join('')}</div></details>`);
   const url=new URL(location.href);viewDate===today?url.searchParams.delete('day'):url.searchParams.set('day',viewDate);field?url.searchParams.set('field',field):url.searchParams.delete('field');history.replaceState(null,'',url);
  }
  ['review-subject','review-mode','review-type'].forEach(id=>$('#'+id).onchange=render);$('#review-limit').onchange=()=>{act(()=>store.update(s=>s.settings.reviewLimit=Number($('#review-limit').value)));render()};$('#review-date').onchange=e=>{if(!P.validDate(e.target.value)){e.target.value=viewDate;return}viewDate=e.target.value;render()};$$('[data-review-day]').forEach(b=>b.onclick=()=>{viewDate=P.add(viewDate,Number(b.dataset.reviewDay));$('#review-date').value=viewDate;render()});$('#review-today').onclick=()=>{viewDate=today;$('#review-date').value=viewDate;render()};render();
 }

 function settings(){applyTheme();let candidate=null;content.innerHTML=head('설정 · 백업','문제·답안·첨부 자료·학습기록을 함께 보존합니다.')+SemuonSync.settingsHTML()+themeSettingsHTML()+`<section class="card"><h2>글꼴 · 크기</h2><div class="font-settings-grid">${[['Ui','메뉴·탐색 UI'],['Body','읽기·문제 본문']].map(([kind,title])=>{const f=C.fontPreferences(snapshot().settings);return `<fieldset class="font-setting"><legend>${title}</legend><label class="field"><span>글꼴</span><select id="font-${kind}-family">${Object.entries(C.FONT_FAMILIES).map(([key,font])=>`<option value="${key}" ${f['font'+kind+'Family']===key?'selected':''}>${esc(font.label)}</option>`).join('')}</select></label><div class="row"><label class="field font-size-field"><span>크기 (pt)</span><input id="font-${kind}-size" type="number" inputmode="decimal" min="1" max="30" step="any" value="${f['font'+kind+'Pt']}" aria-describedby="font-${kind}-notice"></label><button class="btn" type="button" data-font-save="${kind}">저장</button><button class="btn secondary font-reset" type="button" data-font-reset="${kind}">기본값</button></div><p id="font-${kind}-notice" class="help" role="status" hidden></p></fieldset>`}).join('')}</div></section><section class="card"><h2>문제 · 기록 백업</h2><p>105회 이하 기출문제는 학습에서 제외하고 원문·정답·기존 기록을 전체 백업에 보관합니다.</p><p>같은 전산세무 2급 문제와 고유 채점기록을 합칩니다. 다른 시험 자료나 충돌하는 답안은 가져오기를 중단합니다.</p><div class="row"><button class="btn" id="export-backup">전체 백업 내보내기</button><button class="btn secondary" id="export-raw">저장 원본 내보내기</button></div><label class="field"><span>백업 파일 가져오기</span><input id="backup-file" type="file" accept=".json"></label><div id="backup-preview"></div><button class="btn secondary" id="merge-backup" disabled>미리보기 확인 후 합치기</button></section><section class="card"><h2>단축키</h2><form id="markup-shortcut-form"><h3>글자 표시</h3><p class="help">문제의 글자를 선택한 뒤 Alt와 지정한 키를 함께 누르세요.</p><div class="markup-shortcut-grid">${C.MARKUP_TOOLS.map(([id,label])=>`<label class="markup-shortcut-field"><span>${esc(label)}</span><span class="markup-key-input"><kbd>Alt</kbd><span>+</span><input type="text" maxlength="1" pattern="[0-9A-Za-z+]" autocomplete="off" autocapitalize="characters" spellcheck="false" data-markup-shortcut="${id}" aria-label="${esc(label)} 단축키" value="${esc(C.markupShortcuts(snapshot().settings)[id])}" required></span></label>`).join('')}</div><div class="row"><button type="submit" class="btn">단축키 저장</button><button type="button" class="btn secondary" id="markup-shortcut-reset">기본값</button></div><p class="help" id="markup-shortcut-notice" role="status" hidden></p></form><p>Ctrl + Z: 직전 글자 표시 또는 체크 되돌리기</p><p>입력칸의 복사·붙여넣기·실행 취소와 오른쪽 기본 메뉴를 사용합니다. 전표 금액 + 키는 000을 붙이고, 매입매출 공급가액 Enter는 부가세를 계산합니다.</p></section>`;
  const settingCards=[...content.children],backupCard=settingCards.find(e=>e.querySelector('#export-backup')),fontCard=settingCards.find(e=>e.querySelector('#font-Ui-size'));
  const layout=document.createElement('div');layout.className='settings-layout';fontCard.before(layout);layout.append(backupCard,fontCard);
  SemuonFullscreen.refresh();SemuonSync.mountSettings(content);
  $$('button[data-design-theme]').forEach(button=>button.onclick=()=>act(()=>{const id=button.dataset.designTheme;store.update(s=>s.settings.designTheme=id);applyTheme();$$('button[data-design-theme]').forEach(b=>{const selected=b.dataset.designTheme===id;b.setAttribute('aria-pressed',String(selected));b.querySelector('.theme-selected').textContent=selected?'✓ 사용 중':'선택하기'});$('#theme-status').textContent=DESIGN_THEMES.find(t=>t[0]===id)[2]+' 디자인을 저장했습니다.'}));
  const shortcutForm=$('#markup-shortcut-form'),shortcutNotice=$('#markup-shortcut-notice');
  shortcutForm.onsubmit=e=>{e.preventDefault();try{const value=Object.fromEntries($$('[data-markup-shortcut]').map(input=>[input.dataset.markupShortcut,input.value.trim().toUpperCase()]));C.validateMarkupShortcuts(value);store.update(s=>s.settings.markupShortcuts=value);$$('[data-markup-shortcut]').forEach(input=>input.value=value[input.dataset.markupShortcut]);shortcutNotice.textContent='단축키를 저장했습니다.';shortcutNotice.hidden=false}catch(err){shortcutNotice.textContent=err.message;shortcutNotice.hidden=false}};
  $('#markup-shortcut-reset').onclick=()=>act(()=>{store.update(s=>delete s.settings.markupShortcuts);$$('[data-markup-shortcut]').forEach(input=>input.value=C.MARKUP_SHORTCUT_DEFAULTS[input.dataset.markupShortcut]);shortcutNotice.textContent='기본 단축키로 되돌렸습니다.';shortcutNotice.hidden=false});

  if(store.error)$('#merge-backup').textContent='원본 보존 후 정상 백업으로 복구';for(const kind of ['Ui','Body']){const input=$('#font-'+kind+'-size'),family=$('#font-'+kind+'-family'),notice=$('#font-'+kind+'-notice'),sizeKey='font'+kind+'Pt',familyKey='font'+kind+'Family';$('[data-font-save="'+kind+'"]').onclick=()=>act(()=>{if(input.value===''||!input.validity.valid){notice.textContent='1~30pt 범위로 입력해 주세요.';notice.hidden=false;return}store.update(s=>{s.settings[sizeKey]=input.valueAsNumber;s.settings[familyKey]=family.value});applyFont();notice.textContent='저장했습니다.';notice.hidden=false});input.oninput=()=>{notice.hidden=true;if(input.value===''||!input.validity.valid)return;const value=input.valueAsNumber;act(()=>{if(C.fontPreferences(snapshot().settings)[sizeKey]!==value)store.update(s=>s.settings[sizeKey]=value);applyFont()})};input.onblur=()=>{if(input.value===''||!input.validity.valid){input.value=C.fontPreferences(snapshot().settings)[sizeKey];notice.textContent='1~30pt 범위로 입력해 주세요. 마지막 유효한 크기를 유지했습니다.';notice.hidden=false}};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();input.blur()}};family.onchange=()=>act(()=>{store.update(s=>s.settings[familyKey]=family.value);applyFont()});$('[data-font-reset="'+kind+'"]').onclick=()=>act(()=>{store.update(s=>{s.settings[sizeKey]=C.FONT_DEFAULTS[sizeKey];s.settings[familyKey]=C.FONT_DEFAULTS[familyKey]});input.value=C.FONT_DEFAULTS[sizeKey];family.value=C.FONT_DEFAULTS[familyKey];notice.hidden=true;applyFont()})};$('#export-backup').onclick=()=>download('세무온_전체백업_'+R.day(Date.now())+'.json',storedSnapshot());$('#export-raw').onclick=()=>download('세무온_저장원본_'+R.day(Date.now())+'.json',store.rawBackup());
  $('#backup-file').onchange=async e=>{try{candidate=null;$('#merge-backup').disabled=true;const f=e.target.files[0];if(!f)return;const s=store.readBackup(JSON.parse(await f.text())),merged=C.merge(storedSnapshot(),s);candidate=s;$('#backup-preview').innerHTML=`<p class="notice">백업 문제 ${s.items.length}개 / 기록 ${s.history.length}개 · 합친 뒤 문제 ${merged.items.length}개 / 기록 ${merged.history.length}개</p>`;$('#merge-backup').disabled=false}catch(err){fail(err)}};$('#merge-backup').onclick=()=>act(()=>{C.assert(candidate,'백업을 먼저 선택해 주세요.');if(store.error){store.recover(candidate);location.reload();return}store.merge(candidate);toast('기존 자료를 보존해 백업을 합쳤습니다.');settings()});
 }
 function renderHistory(){const s=snapshot(),list=s.history.slice().sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,30);$('#history-list').innerHTML=list.length?`<div class="table-scroll"><table><thead><tr><th>문제</th><th>채점 일시</th><th>결과</th><th>기록 관리</th></tr></thead><tbody>${list.map(e=>`<tr><td>${esc(s.items.find(p=>p.id===e.problemId)?.title)}</td><td>${new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'short',timeStyle:'short'}).format(new Date(e.at))}</td><td>${e.source==='semuon-self'?(e.correct?'통과':'다시 연습'):(e.correct?'정답':'오답')} · ${e.source==='semuon-self'?'직접 표시':'입력 채점'}${e.cancelledAt?' · 취소':''}</td><td><button class="btn secondary history-action" data-id="${esc(e.id)}" data-cancelled="${Boolean(e.cancelledAt)}">${e.cancelledAt?'취소 복구':e.source==='semuon-self'?'표시 취소':'채점 취소'}</button></td></tr>`).join('')}</tbody></table></div>`:'<p>풀이·채점 기록이 없습니다.</p>';$$('.history-action').forEach(b=>b.onclick=()=>act(()=>{b.dataset.cancelled==='true'?store.restore(b.dataset.id):store.cancel(b.dataset.id);renderHistory()}))}
 function guide(){content.innerHTML=head('Design Guide Line','공통 개발·디자인 가이드에 따른 세무온의 평면 UI 규칙.')+`<section class="card"><h2>선과 색으로 표현하는 화면</h2><p>배경 #F8F5F1, 카드·입력칸은 밝은 평면 색을 사용합니다. 입체 그림자, 음각, 자동 축소와 눌림 효과를 사용하지 않습니다.</p><div class="guide-colors">${[['바탕','#f8f5f1'],['주요 행동·선택','#155e59'],['강조','#ac6338'],['경계선','#d7cec0']].map(([label,color])=>`<div><div class="swatch" style="background:${color}"></div><p>${label}<br>${color}</p></div>`).join('')}</div></section><section class="card"><h2>글꼴 · 크기</h2><div class="table-scroll"><table><thead><tr><th>용도</th><th>기본값</th><th>설정 범위</th></tr></thead><tbody><tr><td>메뉴·탐색 UI</td><td>10.5pt (14px)</td><td>1~30pt · 소수 직접 입력</td></tr><tr><td>읽기·문제 본문</td><td>12pt (16px)</td><td>1~30pt · 소수 직접 입력</td></tr></tbody></table></div><p>공통 가이드 12절에 따라 영역별 글꼴과 크기를 분리합니다. 1pt = 96/72px로 표시하며, 선택한 작은 크기도 그대로 적용합니다. 설명문은 기본 14px와 사용자 UI 크기 중 큰 값을 사용하고 줄 높이 1.8을 유지합니다.</p></section><section class="card"><h2>메뉴와 버튼</h2><p>PC 메뉴는 왼쪽에 고정합니다. 좁은 화면에서는 왼쪽 메뉴 버튼으로 큰 글자 메뉴를 엽니다. 선택 메뉴는 청록색 채움과 흰 글자, 비선택은 밝은 바탕과 짙은 글자입니다.</p><div class="row"><button class="btn">학습 시작</button><button class="btn secondary">복습하기</button><button class="btn ghost">해설 보기</button><button class="btn" disabled>비활성</button></div></section><section class="card"><h2>학습 블록</h2><p>원문 → 증빙 → 입력 → 채점 → 접힌 정답·해설. 카드 간격 20px, 모서리 12px, 버튼 높이 44px, 눈에 보이는 키보드 포커스를 사용합니다. 날짜는 오른쪽 위 별도 줄에 표시합니다.</p><div class="feedback good">✓ 정답입니다. 실제 채점 결과만 표시합니다.</div><div class="feedback wrong">! 다시 확인할 항목: 거래일자, 세액</div><a href="${href('design-guide.md')}">공통 가이드 원문</a></section>`}
 $('.mobile-menu').onclick=()=>{const open=document.body.classList.toggle('menu-open');$('.mobile-menu').setAttribute('aria-expanded',String(open))};
 // 메뉴 편집(⚙)과 Ctrl+B 메뉴 접기(2026-10-14 회계 학습 센터에서 이식). 화면 설정이므로 학습기록 저장소와 분리해 이 브라우저에만 보관한다.
 (function(){const MENU_KEY='semuon-tax2-ui-menu',SIDEBAR_KEY='semuon-tax2-sidebar-collapsed',DEFAULT=nav.map(n=>n[0]),activeMenu=['progress','map','journal','roadmap'].includes(page)?'status':page,navBox=$('#app-nav'),links=[...navBox.children],menuId=id=>['map','progress'].includes(id)?'status':id;
  const read=key=>{try{return localStorage.getItem(key)}catch(_){return null}},write=(key,value)=>{try{localStorage.setItem(key,value);return true}catch(_){toast('이 브라우저에서 화면 설정을 저장하지 못했습니다.');return false}};
  const label=id=>nav.find(n=>n[0]===id)?.[2]||id;
  const iconChoices=[['default','기본 아이콘'],['none','아이콘 없음'],['⌂','집'],['▤','책'],['▦','표'],['≡','목록'],['◇','마름모'],['↺','복습'],['⚙','설정'],['✎','연필'],['✓','체크'],['★','별'],['◎','목표'],['◷','시계'],['▣','카드'],['☷','목차'],['↗','성장'],['☑','완료'],['⚑','깃발'],['✦','반짝임'],['●','원'],['◆','다이아'],['☀','해'],['☕','컵'],['📚','책 묶음'],['📝','메모'],['📅','달력'],['📊','그래프'],['🎯','과녁'],['🌱','새싹'],['🏠','홈'],['📖','읽기'],['📒','노트'],['📌','핀'],['🔖','책갈피'],['💡','아이디어'],['🧩','퍼즐'],['🔍','찾기'],['⏰','알람'],['✅','완료 표시'],['🎓','학습'],['💻','컴퓨터'],['🗂️','자료함'],['📁','폴더'],['🧮','계산기'],['💰','돈'],['🧾','영수증'],['📈','성장 그래프'],['🛠️','도구'],['🔔','알림'],['🗓️','일정'],['🚀','시작'],['🌟','별빛'],['🍀','행운']];
  const iconIds=new Set(iconChoices.map(c=>c[0])),descriptors=links.map(el=>{const row=el.matches('details')?el.querySelector('summary'):el;return{id:el.dataset.menuId,label:label(el.dataset.menuId),el,icon:row.children[0],name:row.children[1],original:nav.find(n=>n[0]===el.dataset.menuId)?.[1]||''}});
  for(const el of navBox.querySelectorAll('.app-subnav a')){const icon=document.createElement('span'),name=document.createElement('span'),originalName=el.textContent;icon.className='menu-user-icon';icon.setAttribute('aria-hidden','true');name.className='menu-user-label';name.textContent=originalName;el.replaceChildren(icon,name);descriptors.push({id:el.dataset.subMenuId||'sub:'+new URL(el.href).pathname.split('/').pop(),label:originalName,el,icon,name,original:({practical:'≡',voucher:'▦',forms:'▧'})[el.dataset.subMenuId]||'',parent:el.dataset.menuParentId||el.closest('[data-menu-id]').dataset.menuId})}
  const byId=new Map(descriptors.map(d=>[d.id,d])),subDefaults=Object.fromEntries(descriptors.map(({id})=>[id,descriptors.filter(d=>d.parent===id).map(d=>d.id)]).filter(([,ids])=>ids.length));
  for(const d of descriptors)d.route=d.el.matches('a')?d.el.href:d.name.matches('a')?d.name.href:null;
  const activeNode=descriptors.find(d=>d.route&&(d.el.classList.contains('active')||d.name.getAttribute('aria-current')==='page'))?.id||activeMenu;
  function complete(order,hidden){const seen=new Set(),out=[];[...(Array.isArray(order)?order:[]).map(menuId),...DEFAULT].forEach(id=>{if(DEFAULT.includes(id)&&!hidden.includes(id)&&!seen.has(id)){seen.add(id);out.push(id)}});return out}
  function cleanSubOrders(raw){return Object.fromEntries(Object.entries(subDefaults).map(([id,ids])=>[id,[...new Set([...(Array.isArray(raw?.[id])?raw[id]:[]).filter(key=>ids.includes(key)),...ids])]]))}
  function cleanLabels(raw){return Object.fromEntries(descriptors.filter(d=>typeof raw?.[d.id]==='string'&&raw[d.id].trim().length>0&&raw[d.id].trim().length<=40).map(d=>[d.id,raw[d.id].trim()]))}
  function cleanAppearance(raw){const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=1&&n<=30;if(!raw||!valid(raw.mainPt)||!valid(raw.subPt)||typeof raw.mainBold!=='boolean'||typeof raw.subBold!=='boolean')return null;return{mainPt:raw.mainPt,subPt:raw.subPt,mainBold:raw.mainBold,subBold:raw.subBold,icons:Object.fromEntries(descriptors.filter(d=>iconIds.has(raw.icons?.[d.id])).map(d=>[d.id,raw.icons[d.id]]))}}
  function normalizeTree(raw,legacy){
   const seen=new Set(),root=[],children=Object.fromEntries(descriptors.map(d=>[d.id,[]]));
   function add(list,out){
    if(!Array.isArray(list))return;
    for(const id of list){
     if(!byId.has(id)||seen.has(id))continue;
     seen.add(id);
     out.push(id);
     add(raw?raw.children?.[id]:legacy[id],children[id]);
    }
   }
   const oldRoot=raw?.root||legacy.order;
   const grouped=Array.isArray(oldRoot)&&!oldRoot.includes('practice-learning')&&
    !Object.values(raw?.children||{}).some(ids=>Array.isArray(ids)&&ids.includes('practice-learning'));
   if(grouped){
    const oldPractice=oldRoot.filter(id=>practiceMenu.some(([key])=>key===id));
    if(oldPractice.length){
     const remaining=oldRoot.filter(id=>!oldPractice.includes(id));
     remaining.splice(oldRoot.indexOf(oldPractice[0]),0,'practice-learning');
     const oldChildren=raw?.children||legacy;
     raw={root:raw?remaining:complete(remaining,[]),children:{...oldChildren,'practice-learning':oldPractice}};
    }
   }
   add(raw?.root||complete(legacy.order,[]),root);
   for(const {id,parent} of descriptors){
    if(!seen.has(id))add([id],seen.has(parent)?children[parent]:root);
   }
   const practice=children['practice-learning'],withholding='sub:quiz:withholding',employee='sub:quiz:employee';
   if(raw?.version!==2&&practice.includes(withholding)&&children[withholding].includes(employee)){
    children[withholding]=children[withholding].filter(id=>id!==employee);
    practice.splice(practice.indexOf(withholding)+1,0,employee);
   }
   return{root,children};
  }
  function load(){let v={};try{v=JSON.parse(read(MENU_KEY)||'{}')||{}}catch(_){}const legacy={...cleanSubOrders(v.subOrders),order:v.menuOrder},tree=normalizeTree(v.tree,legacy),parents={};Object.entries(tree.children).forEach(([p,ids])=>ids.forEach(id=>parents[id]=p));const protectedIds=new Set([activeNode]);let next=parents[activeNode];while(next){protectedIds.add(next);next=parents[next]}const hidden=[...new Set((Array.isArray(v.hiddenMenuIds)?v.hiddenMenuIds:[]).map(menuId))].filter(id=>byId.has(id)&&!protectedIds.has(id));return{order:tree.root,hidden,appearance:cleanAppearance(v.appearance),labels:cleanLabels(v.labels),subOrders:tree.children}}
  function applyAppearance(v){const side=$('.app-sidebar');for(const[name,value]of Object.entries({'--menu-main-size':v?v.mainPt+'pt':null,'--menu-sub-size':v?v.subPt+'pt':null,'--menu-main-weight':v?(v.mainBold?'800':'400'):null,'--menu-sub-weight':v?(v.subBold?'800':'400'):null})){if(value)side.style.setProperty(name,value);else side.style.removeProperty(name)}for(const d of descriptors){const key=v?.icons[d.id]||'default',glyph=key==='none'?'':key==='default'?d.original:key;d.icon.textContent=glyph;d.icon.hidden=!glyph;d.icon.setAttribute('aria-hidden','true')}}
  function apply({order,hidden,appearance,labels,subOrders}){function build(id,depth=0){const d=byId.get(id),kids=subOrders[id]||[],node=document.createElement(kids.length||!d.route?'details':'a');node.dataset.menuId=id;if(depth)node.classList.add('menu-nested-node');let row=node;if(node.tagName==='DETAILS'){node.classList.add('app-nav-group');node.open=true;row=document.createElement('summary');node.append(row)}else node.href=d.route;const icon=document.createElement('span'),name=document.createElement(d.route&&row!==node?'a':'span');name.textContent=labels[id]||d.label;if(name.tagName==='A'){name.href=d.route;name.className='menu-parent-link'}row.append(icon,name);d.icon=icon;d.name=name;if(id===activeNode){if(node.tagName==='A')node.classList.add('active');else node.classList.add('is-active');if(d.route)(name.tagName==='A'?name:node).setAttribute('aria-current','page')}if(kids.length){const box=document.createElement('div');box.className='app-subnav';kids.forEach(key=>box.append(build(key,depth+1)));node.append(box);if(box.querySelector('[aria-current=page]'))node.classList.add('is-active')}node.hidden=hidden.includes(id);return node}navBox.replaceChildren(...order.map(id=>build(id)));applyAppearance(appearance)}
  apply(load());
  const foldKey='semuon-tax2-menu-fold-all',foldBar=document.createElement('div'),foldButton=document.createElement('button');
  foldBar.className='menu-tree-controls';foldButton.type='button';foldButton.className='btn secondary menu-tree-toggle';foldButton.setAttribute('aria-controls','app-nav');foldBar.append(foldButton);const brandRow=document.createElement('div');brandRow.className='app-brand-row';$('.app-brand').before(brandRow);brandRow.append($('.app-brand'),foldBar);
  let folded=false;try{folded=localStorage.getItem(foldKey)==='1'}catch(_){}
  function paintFold(applyState=false){
   const groups=[...navBox.querySelectorAll('details')];
   if(applyState)groups.forEach(group=>group.open=!folded);
   const open=groups.some(group=>group.open),label=open?'전체 메뉴 접기':'전체 메뉴 펼치기';
   foldButton.title=label;foldButton.setAttribute('aria-label',label);foldButton.setAttribute('aria-expanded',String(open));foldButton.disabled=!groups.length;
   foldButton.innerHTML='<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="'+(open?'m8 7 4-4 4 4M8 17l4 4 4-4M5 10h14M5 14h14':'m8 3 4 4 4-4M8 21l4-4 4 4M5 10h14M5 14h14')+'"/></svg>';
  }
  foldButton.onclick=()=>{folded=[...navBox.querySelectorAll('details')].some(group=>group.open);try{localStorage.setItem(foldKey,folded?'1':'0')}catch(_){}paintFold(true)};
  navBox.addEventListener('toggle',()=>paintFold(),true);
  new MutationObserver(()=>paintFold(true)).observe(navBox,{childList:true});paintFold(true);
  const navViewKey='semuon-tax2-nav-view';let navView=null;
  try{navView=JSON.parse(sessionStorage.getItem(navViewKey)||'null')}catch(_){}
  if(navView&&Array.isArray(navView.open))for(const group of navBox.querySelectorAll('details'))group.open=navView.open.includes(group.dataset.menuId);
  const saveNavView=()=>{navView={top:navBox.scrollTop,open:[...navBox.querySelectorAll('details[open]')].map(group=>group.dataset.menuId)};try{sessionStorage.setItem(navViewKey,JSON.stringify(navView))}catch(_){}};
  const restoreNavView=()=>{
   if(navView&&Number.isFinite(navView.top))navBox.scrollTop=navView.top;
   const active=navBox.querySelector('[aria-current=page]');
   if(active&&!folded){let parent=active.parentElement;while(parent&&parent!==navBox){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement}}
   if(active&&active.getClientRects().length){const bounds=navBox.getBoundingClientRect(),rect=active.getBoundingClientRect();if(rect.top<bounds.top||rect.bottom>bounds.bottom)navBox.scrollTop+=rect.top-bounds.top-bounds.height/2+rect.height/2}
  };
  requestAnimationFrame(()=>{restoreNavView();requestAnimationFrame(()=>{restoreNavView();navBox.addEventListener('scroll',saveNavView,{passive:true});navBox.addEventListener('toggle',saveNavView,true)})});
  navBox.addEventListener('click',event=>{if(event.target.closest('a[href]'))saveNavView()});
  window.addEventListener('pagehide',saveNavView);
  $('.mobile-menu').addEventListener('click',()=>requestAnimationFrame(restoreNavView));
  const gear=document.createElement('button');gear.type='button';gear.className='btn secondary menu-settings-button';gear.innerHTML='<span aria-hidden="true">⚙</span> 메뉴 편집';gear.title='메뉴 이름 · 순서 · 글자 · 아이콘 설정';$('.app-sidebar').append(gear);
  const dialog=document.createElement('dialog');dialog.className='menu-settings';dialog.setAttribute('aria-labelledby','menuSettingsTitle');dialog.innerHTML='<header class="menu-settings-head"><h2 id="menuSettingsTitle">메뉴 편집</h2><button class="btn ghost menu-settings-close" type="button" aria-label="닫기">×</button></header><div class="menu-settings-body"><section class="menu-look-controls"><h3>글자 모양</h3><div class="menu-look-grid"><fieldset><legend>메인 메뉴</legend><label>크기 (pt)<input id="menu-main-pt" type="number" min="1" max="30" step="any" required></label><label class="menu-bold-check"><input id="menu-main-bold" type="checkbox"> 굵게</label></fieldset><fieldset><legend>서브 메뉴</legend><label>크기 (pt)<input id="menu-sub-pt" type="number" min="1" max="30" step="any" required></label><label class="menu-bold-check"><input id="menu-sub-bold" type="checkbox"> 굵게</label></fieldset></div><div class="menu-look-preview" aria-label="메뉴 글자 미리보기"><span class="menu-preview-main">◇ 학습 현황</span><span class="menu-preview-sub">학습 기록</span></div><button type="button" class="btn secondary menu-look-reset">글자·아이콘 기본값</button></section><h3>사용 중인 메뉴 <span class="menu-active-count"></span></h3><ol class="menu-order-list"></ol><h3>대기 중인 메뉴 <span class="menu-waiting-count"></span></h3><ul class="menu-waiting-list"></ul></div><footer class="menu-settings-actions"><button class="btn secondary menu-default" type="button">기본 순서</button><button class="btn secondary menu-cancel" type="button">취소</button><button class="btn menu-save" type="button">저장</button></footer><div class="menu-icon-panel" role="dialog" aria-label="메뉴 아이콘 선택" hidden><div class="menu-icon-panel-head"><strong>아이콘 선택</strong><button type="button" class="btn ghost" data-close-icons aria-label="아이콘 선택 닫기">×</button></div><div class="menu-icon-options"></div></div>';document.body.append(dialog);
  const orderList=dialog.querySelector('.menu-order-list'),waitingList=dialog.querySelector('.menu-waiting-list'),iconPanel=dialog.querySelector('.menu-icon-panel');let draft=[],draftHidden=[],dragged=null,draftAppearance=null,draftLabels={},draftSubOrders={},iconTarget=null;
  const defaults=()=>({mainPt:C.fontPreferences(snapshot().settings).fontUiPt,subPt:C.fontPreferences(snapshot().settings).fontUiPt,mainBold:true,subBold:false,icons:{}}),draftLabel=id=>draftLabels[id]??byId.get(id).label;
  const glyph=id=>{const key=draftAppearance?.icons[id]||'default';return key==='none'?'＋':key==='default'?(byId.get(id).original||'＋'):key};
  const iconButton=id=>`<button type="button" class="menu-icon-button" data-icon-id="${esc(id)}" aria-label="${esc(draftLabel(id))} 아이콘 선택" aria-haspopup="dialog" aria-expanded="false">${esc(glyph(id))}</button>`;
  const nameInput=(id,sub=false)=>`<input type="text" class="menu-name-input" data-label-id="${esc(id)}" value="${esc(draftLabel(id))}" maxlength="40" required aria-label="${esc(byId.get(id).label)} ${sub?'서브':'메인'} 메뉴 이름">`;
  function closeIcons(focus=false){const id=iconTarget;iconPanel.hidden=true;iconTarget=null;dialog.querySelectorAll('.menu-icon-button').forEach(b=>b.setAttribute('aria-expanded','false'));if(focus&&id)dialog.querySelector(`[data-icon-id="${id}"]`)?.focus()}
  function openIcons(button){if(iconTarget===button.dataset.iconId){closeIcons();return}closeIcons();iconTarget=button.dataset.iconId;const selected=draftAppearance?.icons[iconTarget]||'default';iconPanel.querySelector('.menu-icon-options').innerHTML=iconChoices.map(([key,name])=>`<button type="button" data-icon-choice="${esc(key)}" class="menu-icon-choice ${key===selected?'selected':''} ${['default','none'].includes(key)?'icon-word':''}" title="${esc(name)}" aria-label="${esc(name)}" aria-pressed="${key===selected}">${key==='default'?'기본':key==='none'?'없음':esc(key)}</button>`).join('');button.setAttribute('aria-expanded','true');iconPanel.hidden=false;const r=button.getBoundingClientRect(),d=dialog.getBoundingClientRect();iconPanel.style.width=Math.min(332,d.width-24)+'px';const h=iconPanel.offsetHeight,w=iconPanel.offsetWidth;iconPanel.style.left=Math.max(d.left+12,Math.min(r.left,d.right-w-12))+'px';iconPanel.style.top=Math.max(12,Math.min(r.bottom+6,innerHeight-h-12))+'px';iconPanel.querySelector('.selected')?.focus({preventScroll:true})}
  function previewAppearance(){const v=draftAppearance||defaults(),main=dialog.querySelector('.menu-preview-main'),sub=dialog.querySelector('.menu-preview-sub');main.style.fontSize=v.mainPt+'pt';main.style.fontWeight=v.mainBold?'800':'400';sub.style.fontSize=v.subPt+'pt';sub.style.fontWeight=v.subBold?'800':'400'}
  function fillAppearance(){const v=draftAppearance||defaults();dialog.querySelector('#menu-main-pt').value=v.mainPt;dialog.querySelector('#menu-sub-pt').value=v.subPt;dialog.querySelector('#menu-main-bold').checked=v.mainBold;dialog.querySelector('#menu-sub-bold').checked=v.subBold;previewAppearance()}
  dialog.querySelector('.menu-look-controls').addEventListener('input',()=>{const main=dialog.querySelector('#menu-main-pt'),sub=dialog.querySelector('#menu-sub-pt');if(!main.validity.valid||!sub.validity.valid)return;draftAppearance={...(draftAppearance||defaults()),mainPt:main.valueAsNumber,subPt:sub.valueAsNumber,mainBold:dialog.querySelector('#menu-main-bold').checked,subBold:dialog.querySelector('#menu-sub-bold').checked};previewAppearance()});
  dialog.addEventListener('input',e=>{const id=e.target.dataset.labelId;if(id)draftLabels[id]=e.target.value});
  dialog.querySelector('.menu-look-reset').onclick=()=>{draftAppearance=null;fillAppearance();render()};
  function parentOf(id){return Object.keys(draftSubOrders).find(p=>draftSubOrders[p].includes(id))||''}
  function descendants(id){return(draftSubOrders[id]||[]).flatMap(key=>[key,...descendants(key)])}
  function siblings(id){const parent=parentOf(id);return parent?draftSubOrders[parent]:draft}
  function protectedNode(id){return id===activeNode||descendants(id).includes(activeNode)}
  function render(resetDisclosure=false){closeIcons();const open=new Set(resetDisclosure?[]:[...orderList.querySelectorAll("[data-menu-children][open]")].map(el=>el.dataset.menuChildren));function row(id,i,items,depth){const sub=depth>0,children=draftSubOrders[id]||[],forbidden=new Set([id,...descendants(id)]);return `<li class="${sub?'menu-suborder-item':'menu-order-item'} menu-tree-item" draggable="true" data-node-id="${esc(id)}" ${sub?`data-sub-id="${esc(id)}"`:`data-menu-id="${esc(id)}"`}><div class="menu-main-row"><input class="menu-position" type="text" inputmode="numeric" value="${i+1}" data-menu-position="${esc(id)}" aria-label="${esc(draftLabel(id))} 순서" title="순서 번호 입력" autocomplete="off">${iconButton(id)}${nameInput(id,sub)}<button class="btn danger menu-delete" type="button" ${protectedNode(id)?'disabled title="현재 페이지가 포함된 메뉴입니다."':''}>삭제</button></div><label class="menu-parent-field"><span>위치</span><select data-menu-parent="${esc(id)}" aria-label="${esc(draftLabel(id))} 이동 위치"><option value="">메인 메뉴</option>${descriptors.filter(d=>!forbidden.has(d.id)&&!draftHidden.includes(d.id)).map(d=>`<option value="${esc(d.id)}" ${parentOf(id)===d.id?'selected':''}>${esc(draftLabel(d.id))} 안으로</option>`).join('')}</select></label>${children.filter(key=>!draftHidden.includes(key)).length?`<details class="menu-editor-children" data-menu-children="${esc(id)}" ${open.has(id)?'open':''}><summary>하위 메뉴 ${children.filter(key=>!draftHidden.includes(key)).length}개</summary><ol class="menu-suborder-list" data-parent-id="${esc(id)}">${children.filter(key=>!draftHidden.includes(key)).map((key,j,arr)=>row(key,j,arr,depth+1)).join('')}</ol></details>`:''}</li>`}orderList.innerHTML=draft.filter(id=>!draftHidden.includes(id)).map((id,i,arr)=>row(id,i,arr,0)).join('');waitingList.innerHTML=draftHidden.length?draftHidden.map(id=>`<li class="menu-waiting" data-menu-id="${esc(id)}"><span>${esc(draftLabel(id))}</span><button class="btn secondary menu-restore" type="button">불러오기</button></li>`).join(''):'<li class="menu-waiting-empty">대기 중인 메뉴가 없습니다.</li>';dialog.querySelector('.menu-active-count').textContent=descriptors.length-draftHidden.length;dialog.querySelector('.menu-waiting-count').textContent=draftHidden.length}
  dialog.addEventListener('change',e=>{const id=e.target.dataset.menuParent;if(!id)return;const target=e.target.value;if(target===id||descendants(id).includes(target))return;const old=siblings(id);old.splice(old.indexOf(id),1);(target?draftSubOrders[target]:draft).push(id);render()});
  gear.onclick=()=>{const v=load();draft=[...v.order];draftHidden=[...v.hidden];draftAppearance=v.appearance;draftLabels={...v.labels};draftSubOrders=v.subOrders;fillAppearance();render(true);dialog.showModal()};
  dialog.addEventListener('click',e=>{const pick=e.target.closest('[data-icon-id]');if(pick){openIcons(pick);return}const choice=e.target.closest('[data-icon-choice]');if(choice&&iconTarget){const id=iconTarget;draftAppearance=draftAppearance||defaults();draftAppearance.icons[id]=choice.dataset.iconChoice;closeIcons();const button=dialog.querySelector(`[data-icon-id="${id}"]`);button.textContent=glyph(id);button.focus();return}if(e.target.closest('[data-close-icons]')){closeIcons(true);return}if(!iconPanel.hidden&&!iconPanel.contains(e.target))closeIcons()});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'&&!iconPanel.hidden){e.preventDefault();e.stopPropagation();closeIcons(true)}});
  dialog.querySelector('.menu-settings-body').addEventListener('scroll',()=>closeIcons());window.addEventListener('resize',()=>closeIcons());
  orderList.addEventListener('click',event=>{
   const button=event.target.closest('.menu-delete');
   if(!button)return;
   const id=button.closest('[data-node-id]').dataset.nodeId;
   if(!protectedNode(id)){draftHidden.push(id);render()}
  });
  function applyMenuPosition(input){
   const row=input.closest('[data-node-id]'), list=row.parentElement;
   const rows=[...list.children], oldPosition=rows.indexOf(row), value=input.value.trim(), position=Number(value)-1;
   if(!/^\d+$/.test(value)||position<0||position>=rows.length){
    input.value=String(oldPosition+1);
    toast('순서는 1~'+rows.length+' 사이의 번호를 입력해 주세요.');
    return;
   }
   input.value=String(position+1);
   if(position===oldPosition)return;
   const items=siblings(row.dataset.nodeId), target=rows[position];
   const targetIndex=items.indexOf(target.dataset.nodeId);
   items.splice(items.indexOf(row.dataset.nodeId),1);
   items.splice(targetIndex,0,row.dataset.nodeId);
   list.insertBefore(row,position>oldPosition?target.nextSibling:target);
   [...list.children].forEach((item,index)=>{item.querySelector('.menu-position').value=String(index+1)});
  }
  orderList.addEventListener('change',event=>{if(event.target.matches('.menu-position'))applyMenuPosition(event.target)});
  orderList.addEventListener('keydown',event=>{
   if(event.key!=='Enter'||event.isComposing||!event.target.matches('.menu-position'))return;
   event.preventDefault();applyMenuPosition(event.target);event.target.focus();
  });
  waitingList.addEventListener('click',e=>{const item=e.target.closest('.menu-waiting');if(!item||!e.target.closest('.menu-restore'))return;const id=item.dataset.menuId;draftHidden=draftHidden.filter(key=>key!==id);let parent=parentOf(id);while(parent){draftHidden=draftHidden.filter(key=>key!==parent);parent=parentOf(parent)}render()});
  orderList.addEventListener('dragstart',e=>{if(e.target.closest('input,button,select,summary')){e.preventDefault();return}const el=e.target.closest('[data-node-id]');if(!el)return;closeIcons();dragged={id:el.dataset.nodeId,el};el.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragged.id)});
  orderList.addEventListener('dragover',e=>{if(!dragged)return;const target=e.target.closest('[data-node-id]');if(!target||target===dragged.el||parentOf(target.dataset.nodeId)!==parentOf(dragged.id))return;e.preventDefault();const after=e.clientY>target.getBoundingClientRect().top+target.offsetHeight/2;target.parentElement.insertBefore(dragged.el,after?target.nextSibling:target)});
  orderList.addEventListener('dragend',()=>{if(!dragged)return;const visible=[...dragged.el.parentElement.children].map(li=>li.dataset.nodeId),items=siblings(dragged.id),hidden=items.filter(id=>draftHidden.includes(id));items.splice(0,items.length,...visible,...hidden);dragged=null;render()});
  dialog.querySelector('.menu-default').onclick=()=>{const tree=normalizeTree(null,{...subDefaults,order:DEFAULT});draft=tree.root;draftHidden=[];draftSubOrders=tree.children;render()};
  dialog.querySelector('.menu-cancel').onclick=dialog.querySelector('.menu-settings-close').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>closeIcons());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
  dialog.querySelector('.menu-save').onclick=()=>{for(const input of dialog.querySelectorAll('.menu-look-controls input,.menu-name-input')){if(input.classList.contains('menu-name-input'))input.setCustomValidity(input.value.trim()?'':'메뉴 이름을 입력해 주세요.');if(!input.reportValidity())return}const value={menuOrder:draft,hiddenMenuIds:draftHidden,appearance:draftAppearance,labels:cleanLabels(draftLabels),subOrders:draftSubOrders,tree:{version:2,root:draft,children:draftSubOrders},updatedAt:new Date().toISOString()};if(write(MENU_KEY,JSON.stringify(value))){apply(load());dialog.close();toast('메뉴 설정을 저장했습니다.')}};

  const media=matchMedia('(max-width:760px)'),reopen=document.createElement('button');reopen.type='button';reopen.className='btn secondary sidebar-reopen';reopen.innerHTML='☰ 메뉴';reopen.title='메뉴 펼치기 (Ctrl+B)';document.body.append(reopen);
  let collapsed=read(SIDEBAR_KEY)==='1';
  function setCollapsed(value,persist=false){if(persist){collapsed=value;write(SIDEBAR_KEY,value?'1':'0')}const hide=collapsed&&!media.matches;document.documentElement.classList.toggle('sidebar-collapsed',hide);const aside=$('.app-sidebar');aside.inert=hide;hide?aside.setAttribute('aria-hidden','true'):aside.removeAttribute('aria-hidden')}
  reopen.onclick=()=>{setCollapsed(false,true);$('#app-nav a:not([hidden])')?.focus()};
  globalThis.SemuonScratchpad?.mount();
 document.addEventListener('keydown',e=>{if(!e.ctrlKey||e.altKey||e.shiftKey||e.metaKey||e.key.toLowerCase()!=='b'||e.repeat||media.matches||dialog.open)return;if(e.target.closest?.('input,textarea,select,[contenteditable]'))return;e.preventDefault();setCollapsed(!collapsed,true)});
  window.addEventListener('storage',e=>{if(e.key===SIDEBAR_KEY){collapsed=e.newValue==='1';setCollapsed(collapsed)}if(e.key===MENU_KEY)apply(load())});
  media.addEventListener('change',()=>setCollapsed(collapsed));setCollapsed(collapsed);
 })();
 const screenUndo=[];
 let restoringCheckbox=false;
 function recordScreenUndo(undo){
  screenUndo.push(undo);
  if(screenUndo.length>50)screenUndo.shift();
 }
 function checkboxTarget(box){
  const card=box.closest('[data-problem-id]');
  const key=['data-field','data-complete','data-roadmap-task','data-focus'].find(attr=>box.hasAttribute(attr));
  const field=key?`input[type="checkbox"][${key}="${CSS.escape(box.getAttribute(key))}"]`:'';
  if(card&&field){
   const id=CSS.escape(card.dataset.problemId);
   return ()=>box.isConnected?box:document.querySelector(`[data-problem-id="${id}"] ${field}`);
  }
  if(box.id){
   const id=box.id;
   return ()=>box.isConnected?box:document.getElementById(id);
  }
  return ()=>box.isConnected?box:field?document.querySelector(field):null;
 }
 document.addEventListener('change',event=>{
  const box=event.target;
  if(restoringCheckbox||!event.isTrusted||!box.matches?.('input[type="checkbox"]'))return;
  const checked=box.checked,findBox=checkboxTarget(box);
  recordScreenUndo(()=>{
   const current=findBox();
   if(!current?.matches('input[type="checkbox"]')||current.disabled||current.checked!==checked)return false;
   restoringCheckbox=true;
   try{current.click()}finally{restoringCheckbox=false}
   return true;
  });
 },true);
 document.addEventListener('keydown',event=>{
  if(!event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||event.repeat||event.isComposing||
     event.defaultPrevented||event.key.toLowerCase()!=='z'||
     event.target.closest?.('textarea,select,[contenteditable],input:not([type=radio]):not([type=checkbox])'))return;
  while(screenUndo.length){
   if(screenUndo.pop()()){
    event.preventDefault();event.stopPropagation();
    return;
   }
  }
 });
 if(page==='home'||page==='map'||page==='progress'||page==='roadmap'){window.addEventListener('storage',e=>{if(e.key===C.KEY&&!SemuonFullscreen.hosting())location.reload()});window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()})}
 applyFont();applyTheme();if(store.error){fail(Error('학습자료를 읽지 못해 저장을 중지하고 원본을 보존했습니다. 설정에서 저장 원본을 내보내 주세요.'));if(page!=='settings'){content.innerHTML=`<div class="empty"><h2>저장 자료를 확인해 주세요.</h2><a class="btn" href="${href('pages/settings.html')}">저장 원본 · 백업 확인</a></div>`;return}}
 function installDictionarySearch(){
  const syncButton=$('.app-topbar .sync-top-button');
  if(!syncButton)return;
  const form=document.createElement('form');
  form.className='topbar-dictionary';
  form.action=href('pages/dictionary.html');
  form.target='_blank';
  form.rel='noopener';
  form.setAttribute('role','search');
  form.innerHTML=`<label class="sr-only" for="topbar-dictionary-query">교재 사전 검색</label>
   <input id="topbar-dictionary-query" name="q" type="search" required maxlength="160" autocomplete="off" placeholder="교재 사전 검색">
   <input type="hidden" name="theme">
   <button type="submit" class="btn secondary" aria-label="교재 사전 검색 결과 새 창 열기" title="교재 사전 검색 · 새 창">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
   </button>`;
  syncButton.before(form);
  form.addEventListener('submit',event=>{
   const input=form.elements.q;
   input.value=input.value.trim();
   if(!input.value){event.preventDefault();input.reportValidity();return}
   const theme=document.documentElement.dataset.designTheme||'';
   form.elements.theme.value=theme;
   const url=new URL(form.action);
   url.searchParams.set('q',input.value);
   if(theme)url.searchParams.set('theme',theme);
   const popup=window.open('about:blank','_blank','popup,width=880,height=760');
   if(!popup)return;
   event.preventDefault();
   popup.opener=null;
   popup.location.replace(url.href);
  });
 }
 SemuonSync.install({store,href,notify:toast});
 installDictionarySearch();
 if(page==='concepts'&&conceptGuide){
  for(const article of conceptArticles)if(article!==selectedConcept)article.remove();
  const tab=conceptGuide.querySelector(`[data-concept-tab="${selectedConcept?.dataset.conceptSubject}"]`);
  tab?.setAttribute('aria-current','page');
  content.append(conceptGuide);
  resume?.ready();
  return;
 }
 try{if(page==='home')home();else if(C.SUBJECTS.includes(page)){const id=new URLSearchParams(location.search).get('id'),p=snapshot().items.find(p=>p.id===id&&p.subject===page);if(TrainingComboReview.active(comboKey))await solveCombo();else if(p)await solve(p);else{problemList(page);if(id&&storedSnapshot().items.some(p=>p.id===id&&!available(p)))toast('105회 이하 기출문제는 보관 중이며 학습 대상에서 제외했습니다.');}}else if(page==='topic'||page==='forms')problemList(page);else if(page==='quiz'){try{await script(new URL('js/markup.js?v=20261118-quiz',rootURL))}catch(_){}withholdingQuiz(quizCourse)}else if(page==='review')review();else if(page==='map')learningMap();else if(page==='roadmap')SemuonRoadmap.mount(content,{getState:storedSnapshot,save:fn=>store.update(fn),href,notify:toast});else if(page==='journal')journalPage();else if(page==='register'){location.replace(href('index.html'));return}else if(page==='database'){await script(new URL('js/database.js?v=20261029-3',rootURL));SemuonDatabase.mount(content,storedSnapshot().items,href)}else if(page==='settings')settings();else if(page==='guide')guide();else content.innerHTML=head('실무 훈련','일반전표 또는 매입매출전표를 선택하세요.')+`<div class="row"><a class="btn" href="${href('pages/general.html')}">일반전표 입력</a><a class="btn" href="${href('pages/voucher.html')}">매입매출전표 입력</a></div>`}catch(e){fail(e)}finally{resume?.ready()}
})();
