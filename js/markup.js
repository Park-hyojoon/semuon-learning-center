/* 문제 글자 표시(2026-10-14): 문제 제목·본문·표·보기·해설을 선택한 뒤 오른쪽 클릭 → 파랑·빨강·초록 글자, 형광펜, 밑줄, 취소선, 지움, 되돌리기. 굵게는 이전 표시를 읽을 때만 지원한다.
   원문 데이터는 바꾸지 않고 화면에만 칠한다. 표시는 같은 탭의 새로고침에서만 유지한다. 세무온에 다시 접속하거나 다른 메뉴로 나갔다 들어오면(뒤로 가기 포함) 모두 지운다. 탭별 sessionStorage 사용. 학습기록과 백업에는 들어가지 않는다. */
(function(root){
 'use strict';
 const KEY='semuon-tax2-marks-v1',kinds=['blue','red','green','highlight','bold','underline','strike'],colors=kinds.slice(0,3),idPattern=/^[A-Za-z0-9_-]{1,100}:(title|prompt|exhibit|choice|explanation):\d+$/;
 const blocks=new Map(),undo=[],copy=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 let marks={},pending=[],readable=true,popup,status,undoButton;
 try{if(performance.getEntriesByType('navigation')[0]?.type!=='reload')sessionStorage.removeItem(KEY)}catch(_){}
 function valid(v){return v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length<=2000&&Object.entries(v).every(([id,e])=>idPattern.test(id)&&e&&typeof e.text==='string'&&e.text.length<=100000&&Array.isArray(e.spans)&&e.spans.length<=3000&&e.spans.every(s=>s&&kinds.includes(s.kind)&&Number.isInteger(s.start)&&Number.isInteger(s.end)&&s.start>=0&&s.end>s.start&&s.end<=e.text.length))}
 function load(){try{const raw=sessionStorage.getItem(KEY),v=raw?JSON.parse(raw):{};if(!valid(v))throw Error('format');marks=v;readable=true}catch(_){readable=false}}
 function spansFor(id){const b=blocks.get(id),e=marks[id];return b&&e?.text===b.text?e.spans:[]}
 function renderBlock(id){
  const b=blocks.get(id);if(!b?.root.isConnected)return;const spans=spansFor(id),tpl=b.template.cloneNode(true),walker=document.createTreeWalker(tpl,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);let offset=0;
  for(const node of nodes){const start=offset,end=start+node.data.length;offset=end;const hit=spans.filter(s=>s.start<end&&s.end>start);if(!hit.length)continue;
   const cuts=[...new Set([start,end,...hit.flatMap(s=>[Math.max(start,s.start),Math.min(end,s.end)])])].sort((a,b)=>a-b),frag=document.createDocumentFragment();
   for(let i=0;i<cuts.length-1;i++){const from=cuts[i],to=cuts[i+1],text=node.data.slice(from-start,to-start),styles=kinds.filter(k=>hit.some(s=>s.kind===k&&s.start<=from&&s.end>=to));
    if(!styles.length)frag.append(document.createTextNode(text));else{const span=document.createElement('span');span.className='question-mark '+styles.map(k=>'qm-'+k).join(' ');span.textContent=text;frag.append(span)}}
   node.replaceWith(frag)}
  b.root.replaceChildren(...tpl.childNodes);
 }
 // 화면에 새로 그린 문제를 등록한다. 카드에는 data-problem-id가 있어야 한다.
 function attach(container){
  if(!container)return;setup();for(const [id,b] of blocks)if(!b.root.isConnected)blocks.delete(id);
  container.querySelectorAll('[data-problem-id]').forEach(card=>{const pid=card.dataset.problemId;if(!/^[A-Za-z0-9_-]{1,100}$/.test(pid))return;
   for(const [type,selector] of [['title',':scope > h2, :scope > h3, .qhead h2, .qhead h3'],['prompt','.prompt'],['exhibit','.exhibit, .table-scroll'],['choice','.choice > span'],['explanation','.answer-reveal > div']])card.querySelectorAll(selector).forEach((el,i)=>{
    if(el.parentElement?.closest('[data-question-mark-block]')||el.querySelector('input,textarea,select,button,[contenteditable]'))return;const id=pid+':'+type+':'+i;if(blocks.get(id)?.root===el)return;el.dataset.questionMarkBlock=id;blocks.set(id,{root:el,text:el.textContent,template:el.cloneNode(true)});if(spansFor(id).length)renderBlock(id)})});
 }
 function endpoint(node){const el=node.nodeType===Node.ELEMENT_NODE?node:node.parentElement;return el?.closest('[data-question-mark-block]')}
 function offsetIn(rootEl,node,at){const r=document.createRange();r.selectNodeContents(rootEl);r.setEnd(node,at);return r.toString().length}
 function selected(){const sel=getSelection();if(!sel||sel.isCollapsed||sel.rangeCount!==1)return[];const range=sel.getRangeAt(0),a=endpoint(range.startContainer),z=endpoint(range.endContainer);
  if(!a||!z||!blocks.has(a.dataset.questionMarkBlock)||!blocks.has(z.dataset.questionMarkBlock)||!range.toString().trim())return[];const found=[];
  for(const [id,b] of blocks){if(!b.root.isConnected||!b.root.getClientRects().length||!range.intersectsNode(b.root))continue;const start=b.root.contains(range.startContainer)?offsetIn(b.root,range.startContainer,range.startOffset):0,end=b.root.contains(range.endContainer)?offsetIn(b.root,range.endContainer,range.endOffset):b.text.length;if(end>start)found.push({id,start,end})}
  return found.sort((a,b)=>blocks.get(a.id).root.compareDocumentPosition(blocks.get(b.id).root)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)}
 function hide(restoreFocus=false){if(popup){const focused=popup.contains(document.activeElement);popup.hidden=true;pending=[];if(restoreFocus&&focused&&popup._anchor?.isConnected){if(!popup._anchor.hasAttribute('tabindex'))popup._anchor.tabIndex=-1;popup._anchor.focus({preventScroll:true})}}}
 function place(x,y){const r=popup.getBoundingClientRect();popup.style.left=Math.max(8,Math.min(x,innerWidth-r.width-8))+'px';popup.style.top=Math.max(8,Math.min(y,innerHeight-r.height-8))+'px'}
 function report(m){status.textContent=m;status.hidden=!m}
 function save(next){if(!readable){report('기존 표시를 읽지 못해 저장을 중지했습니다.');return false}try{if(!valid(next))throw Error('format');sessionStorage.setItem(KEY,JSON.stringify(next));marks=next;return true}catch(_){report('저장하지 못했습니다. 기존 표시는 그대로 유지됩니다.');return false}}
 function trim(spans,sel,kind){return spans.flatMap(s=>{if((kind!=='clear'&&(colors.includes(kind)?!colors.includes(s.kind):s.kind!==kind))||s.end<=sel.start||s.start>=sel.end)return[s];const kept=[];if(s.start<sel.start)kept.push({...s,end:sel.start});if(s.end>sel.end)kept.push({...s,start:sel.end});return kept})}
 function apply(kind){if(!pending.length)return;pending=pending.filter(sel=>blocks.get(sel.id)?.root.isConnected);if(!pending.length){hide();return}const next={...marks},before=new Map(),remove=['underline','strike','highlight'].includes(kind)&&pending.every(sel=>covered(sel,kind));
  for(const sel of pending){const b=blocks.get(sel.id);if(!before.has(sel.id))before.set(sel.id,copy(marks[sel.id]));const spans=trim(spansFor(sel.id),sel,kind);if(kind!=='clear'&&!remove)spans.push({start:sel.start,end:sel.end,kind});if(spans.length)next[sel.id]={text:b.text,spans};else delete next[sel.id]}
  if(!save(next))return;undo.push(before);if(undo.length>30)undo.shift();undoButton.disabled=false;before.forEach((_,id)=>renderBlock(id));getSelection()?.removeAllRanges();report('');hide()}
 function covered(sel,kind){let end=sel.start;for(const s of spansFor(sel.id).filter(s=>s.kind===kind).sort((a,b)=>a.start-b.start)){if(s.start>end)break;if(s.end>end)end=s.end;if(end>=sel.end)return true}return false}
 let ready=false;
 function setup(){if(ready)return;ready=true;load();
  popup=document.createElement('div');popup.className='question-mark-popup';popup.hidden=true;popup.setAttribute('role','toolbar');popup.setAttribute('aria-label','선택한 문제 글자 표시');
  const icon=path=>'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>',tool=(kind,label,body)=>`<button type="button" data-question-mark="${kind}" aria-label="${label}" title="${label}">${body}</button>`;
  popup.innerHTML='<div class="question-mark-actions">'+tool('blue','파란 글자색','<span class="question-mark-swatch qm-swatch-blue"></span>')+tool('red','빨간 글자색','<span class="question-mark-swatch qm-swatch-red"></span>')+tool('green','초록 글자색','<span class="question-mark-swatch qm-swatch-green"></span>')+'<span class="question-mark-divider" aria-hidden="true"></span>'+tool('highlight','노란 형광펜',icon('<path d="m9 11 7-7 4 4-7 7-4-4Z"/><path d="m9 11-3 3 4 4 3-3M6 14l-2 6 6-2"/><path d="M3 22h13" class="question-mark-pen"/>'))+tool('underline','밑줄',icon('<path d="M6 4v7a6 6 0 0 0 12 0V4M4 21h16"/>'))+tool('strike','취소선',icon('<path d="M17 5c-1-1-2.5-2-5-2-3 0-5 1.5-5 4 0 2 1.5 3 5 4M7 18c1.2 2 3 3 5 3 3 0 5-1.5 5-4 0-1.2-.5-2-1.5-2.8M3 12h18"/>'))+'<span class="question-mark-divider" aria-hidden="true"></span>'+tool('clear','선택한 글자의 표시 지우기',icon('<path d="m16 3 5 5-11 11H5l-4-4L13 3h3ZM6 10l7 7M10 19h11"/>'))+'<button type="button" class="question-mark-undo" aria-label="직전 표시 되돌리기" title="직전 표시 되돌리기" disabled>'+icon('<path d="m9 5-5 5 5 5M4 10h10a6 6 0 0 1 0 12"/>')+'</button></div><p class="question-mark-status" role="status" aria-live="polite" hidden></p>';
  document.body.append(popup);status=popup.querySelector('.question-mark-status');undoButton=popup.querySelector('.question-mark-undo');
  document.addEventListener('contextmenu',e=>{if(e.target.closest('input,textarea,select,button,a,[contenteditable]')){hide();return}
   const found=selected(),target=e.target.closest('[data-question-mark-block]')||(!e.clientX&&!e.clientY&&found.length?blocks.get(found[0].id).root:null);if(!found.length||!target||!found.some(f=>f.id===target.dataset.questionMarkBlock)){hide();return}
   e.preventDefault();pending=found;popup._anchor=target;popup.hidden=false;popup.querySelectorAll('[data-question-mark]').forEach(b=>{b.disabled=!readable;const kind=b.dataset.questionMark;if(kind!=='clear')b.setAttribute('aria-pressed',String(found.every(sel=>covered(sel,kind))))});report(readable?'':'기존 표시를 읽지 못해 저장을 중지했습니다.');
   const r=getSelection().getRangeAt(0).getBoundingClientRect();place(e.clientX||r.left,e.clientY||r.bottom);if(!e.clientX&&!e.clientY)popup.querySelector('button:not(:disabled)')?.focus({preventScroll:true})});
  popup.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
  popup.querySelectorAll('[data-question-mark]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.questionMark)));
  undoButton.addEventListener('click',()=>{if(!undo.length)return;const before=undo.at(-1),next={...marks};before.forEach((e,id)=>{if(e===undefined)delete next[id];else next[id]=copy(e)});if(!save(next))return;undo.pop();before.forEach((_,id)=>renderBlock(id));undoButton.disabled=!undo.length;getSelection()?.removeAllRanges();hide()});
  popup.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;const buttons=[...popup.querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length]?.focus()});
  document.addEventListener('pointerdown',e=>{if(popup&&!popup.hidden&&!popup.contains(e.target))hide()});
  document.addEventListener('focusin',e=>{if(popup&&!popup.hidden&&!popup.contains(e.target))hide()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popup&&!popup.hidden){e.preventDefault();hide(true)}});
  addEventListener('scroll',e=>{if(!popup.contains(e.target))hide()},true);addEventListener('resize',hide);
  addEventListener('storage',e=>{if(e.key===KEY||e.key===null){hide();undo.length=0;undoButton.disabled=true;load();blocks.forEach((_,id)=>renderBlock(id))}});
 }
 root.SemuonMarkup={attach};
})(globalThis);
