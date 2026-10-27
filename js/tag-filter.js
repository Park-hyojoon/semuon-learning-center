/* Selectable chapter headings and their detail tags; shared by all tax2 question lists. */
(function(root){
 'use strict';
 const topics=['부가가치세','소득세','재무회계','원가회계'],compact=s=>String(s||'').replace(/\s/g,''),compare=(a,b)=>a.localeCompare(b,'ko',{numeric:true});
 const definitions=[
  ['회계의 기본원리',/기본원리|기본가정|기본공준|회계의목적|재무보고|질적특성|목적적합성|신뢰성|검증가능성|중립성|피드백|수탁책임|중요성|보수주의|기업실체|계속기업|기간별보고|회계처리원칙/],
  ['재무제표',/재무제표|손익계산서|자산분류|부채분류/],
  ['현금 및 현금성자산',/현금|예금|현금성자산/],
  ['재고자산',/재고자산|기말재고|재공품|매출원가|원재료|소모품/],
  ['유형자산',/유형자산|감가상각|투자부동산|정부보조금/],
  ['무형자산',/무형자산|영업권/],
  ['금융자산',/금융자산|유가증권|단기매매|매도가능|만기보유/],
  ['채권·채무',/대손|매출채권|채권회수|채무|대여금|선급금|임차보증금|어음배서/],
  ['충당부채·우발부채',/충당부채|우발부채|우발자산/],
  ['사채',/사채/],
  ['자본',/자본|주식|이익잉여금|주식발행|자기주식/],
  ['퇴직급여',/퇴직급여|퇴직연금|확정기여|확정급여/],
  ['부채',/부채|차입금|선수금/],
  ['수익·비용',/수익인식|수익|비용|영업외손익|매출할인|타계정대체/],
  ['회계변경·오류수정',/회계변경|오류|정책|추정/],
  ['외화회계',/외화|외환/],
  ['원가의 개념·분류',/원가의|원가개념|제조원가구분/],
  ['제조간접비·보조부문',/제조간접|보조부문|부문별/],
  ['종합원가·공손',/종합원가|공손|결합원가/],
  ['원가계산',/원가계산|제조원가/],
  ['부가가치세 총론',/부가가치세총론|사업장|사업자등록|정정|대표자변경|상속|과세기간|납세|일반과세자|간이과세|신규사업자|폐업자|간접세|국세|소비지국|전단계|신고와납부|신청기한|자본금변동|법인|부가가치세의특징|사업자단위|총괄납부/],
  ['영세율·면세',/영세율|면세|직수출|수출/],
  ['세금계산서·증빙',/세금계산서|현금영수증|신용카드|증빙|카드|통신판매|사이버몰/],
  ['매입세액·세액공제',/매입세액|세액공제|불공제|의제매입|공통매입|매입.*공제|환급/],
  ['부가가치세 신고·납부',/부가가치세.*(신고|납부|과세표준|예정누락)|예정신고|대손세액/],
  ['과세·매입매출전표',/과세.*(매입|매출)|매입매출|수입|과세대상|공급시기|간주공급|사업상증여|부동산임대/],
  ['급여·원천징수',/급여|임금|원천징수|원천세|수당|예수금/],
  ['인적공제·연말정산',/인적공제|부양가족|사원등록|사원·|연말정산|보험료/],
  ['소득세 총론',/소득세|소득구분|결손금/],
  ['업무경비',/복리후생|여비교통|기부금|교육훈련|경비|선물|사무용품|세금과공과/]
 ];
 function groupOf(tag){
  const t=compact(tag);if(/단원연습문제|기출.*문항|교재원문기준/.test(t))return'학습 모음';
  if(/^소득세/.test(t))return/급여|수당|원천|예수금/.test(t)?'급여·원천징수':/연말정산|인적공제|부양가족|사원/.test(t)?'인적공제·연말정산':'소득세 총론';
  if(/^부가가치세/.test(t)){
   if(/총론|사업자등록|간이과세|납세|납부제도/.test(t))return'부가가치세 총론';
   if(/영세율|면세|직수출|수출/.test(t))return'영세율·면세';
   if(/공제|의제매입|공통매입|매입세액|환급/.test(t))return'매입세액·세액공제';
   if(/세금계산서|현금영수증|신용카드|카드/.test(t))return'세금계산서·증빙';
   if(/신고|납부|예정누락|과세표준/.test(t))return'부가가치세 신고·납부';
   return'과세·매입매출전표';
  }
  return definitions.find(([name])=>compact(name)===t)?.[0]||definitions.find(([,re])=>re.test(t))?.[0]||(/^결산/.test(t)?'결산':'기타 세부 유형');
 }
 function createLegacy(items,tagsOf){
  const groups=new Map();for(const tag of new Set(items.flatMap(tagsOf))){if(!tag||topics.includes(tag))continue;const name=groupOf(tag);if(!groups.has(name))groups.set(name,new Set());groups.get(name).add(tag)}
  const rows=[{value:'',label:'전체'},{section:'대표 유형 · 모든 분야 함께 풀기'},...topics.map(value=>({value,label:value})),{section:'세부 유형'}];
  const order=[...definitions.map(([name])=>name),'결산','학습 모음','기타 세부 유형'];
  for(const name of order){const children=groups.get(name);if(!children?.size)continue;rows.push({value:name,label:name,parent:true});for(const value of [...children].sort(compare))if(value!==name)rows.push({value,label:value,child:true})}
  return{rows,matches(p,value){const tags=tagsOf(p);return!value||tags.includes(value)||(groups.has(value)&&tags.some(t=>groups.get(value).has(t)))}};
 }
 function create(items,tagsOf,legacyValue){return root.SemuonCurriculum.model(items,tagsOf,legacyValue,createLegacy(items,tagsOf))}
 let previous=null;
 function mount({select,host,labelId,model}){
  previous?.dispose();const doc=select.ownerDocument,button=doc.createElement('button'),popup=doc.createElement('div'),value=doc.createElement('span');let opened=false,active=0,buffer='',typedAt=0;
  button.type='button';button.className='tag-picker-trigger';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',select.id+'-listbox');button.setAttribute('aria-labelledby',labelId+' '+select.id+'-value');value.id=select.id+'-value';button.append(value);
  const arrow=doc.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('width','18');arrow.setAttribute('height','18');arrow.setAttribute('fill','none');arrow.setAttribute('stroke','currentColor');arrow.setAttribute('stroke-width','2');arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<path d="m6 9 6 6 6-6"/>';button.append(arrow);host.append(button);
  popup.id=select.id+'-listbox';popup.className='tag-picker-popup';popup.setAttribute('role','listbox');popup.setAttribute('aria-labelledby',labelId);popup.hidden=true;doc.body.append(popup);const options=[];
  for(const row of model.rows){const el=doc.createElement('div');el.textContent=row.label||row.section;if(row.section){el.className='tag-picker-section';el.setAttribute('role','presentation')}else{const index=options.length;el.id=popup.id+'-'+index;el.setAttribute('role','option');el.className='tag-picker-option'+(row.parent?' tag-picker-parent':row.child?' tag-picker-child':'');el.dataset.index=String(index);options.push({el,value:row.value,label:row.label});}popup.append(el)}
  function sync(){const chosen=options.find(o=>o.value===select.value)||options[0];value.textContent=chosen.label;button.title=chosen.label;for(const o of options)o.el.setAttribute('aria-selected',String(o===chosen));if(!opened)active=options.indexOf(chosen)}
  function place(){const r=button.getBoundingClientRect(),view=root.visualViewport,viewportWidth=view?.width||root.innerWidth,viewportHeight=view?.height||root.innerHeight,topOffset=view?.offsetTop||0,leftOffset=view?.offsetLeft||0,width=Math.min(Math.max(r.width,300),viewportWidth-16),below=viewportHeight+topOffset-r.bottom-8,above=r.top-topOffset-8,up=below<180&&above>below,height=Math.min(420,Math.max(100,up?above:below));popup.style.width=width+'px';popup.style.maxHeight=height+'px';popup.style.left=Math.min(Math.max(leftOffset+8,r.left),leftOffset+viewportWidth-width-8)+'px';popup.style.top=up?'auto':(r.bottom+4)+'px';popup.style.bottom=up?(root.innerHeight-r.top+4)+'px':'auto'}
  function highlight(index){active=Math.max(0,Math.min(options.length-1,index));for(let i=0;i<options.length;i++)options[i].el.classList.toggle('is-active',i===active);button.setAttribute('aria-activedescendant',options[active].el.id);if(opened)options[active].el.scrollIntoView({block:'nearest'})}
  function open(){sync();opened=true;popup.hidden=false;button.setAttribute('aria-expanded','true');place();highlight(active)}
  function close(){opened=false;popup.hidden=true;button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');sync()}
  function choose(index){const next=options[index];if(!next)return;select.value=next.value;close();select.dispatchEvent(new Event('change',{bubbles:true}))}
  button.onclick=()=>opened?close():open();
  button.onkeydown=e=>{if(e.isComposing||e.ctrlKey||e.metaKey)return;const key=e.key;if(e.altKey&&key==='ArrowUp'&&opened){e.preventDefault();choose(active);return}if(key==='Escape'){if(opened){e.preventDefault();e.stopPropagation();close()}return}if(key==='Tab'){if(opened)choose(active);return}if(['Enter',' ','ArrowDown','ArrowUp','Home','End','PageDown','PageUp'].includes(key)){e.preventDefault();if(!opened){open();if(['Enter',' ','ArrowDown'].includes(key))return}if(key==='Enter'||key===' ')choose(active);else highlight(key==='Home'?0:key==='End'?options.length-1:active+(key==='ArrowDown'?1:key==='ArrowUp'?-1:key==='PageDown'?10:-10));return}if(key.length===1&&!e.altKey){e.preventDefault();if(!opened)open();const now=Date.now();buffer=now-typedAt<700?buffer+key:key;typedAt=now;const term=buffer.split('').every(x=>x===key)?key:buffer,start=term.length===1?active+1:active;for(let i=0;i<options.length;i++){const index=(start+i)%options.length;if(options[index].label.startsWith(term)){highlight(index);break}}}};
  popup.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.target.closest('[data-index]'))e.preventDefault()};popup.onclick=e=>{const el=e.target.closest('[data-index]');if(el){choose(Number(el.dataset.index));button.focus({preventScroll:true})}};
  const outside=e=>{if(opened&&!popup.contains(e.target)&&!button.contains(e.target))close()},scroll=e=>{if(opened&&!popup.contains(e.target))close()},resize=()=>{if(opened)place()},focus=e=>{if(opened&&!popup.contains(e.target)&&e.target!==button)close()};
  select.addEventListener('change',sync);doc.addEventListener('pointerdown',outside);doc.addEventListener('focusin',focus);root.addEventListener('scroll',scroll,true);root.addEventListener('resize',resize);root.visualViewport?.addEventListener('resize',resize);sync();
  previous={sync,dispose(){close();select.removeEventListener('change',sync);doc.removeEventListener('pointerdown',outside);doc.removeEventListener('focusin',focus);root.removeEventListener('scroll',scroll,true);root.removeEventListener('resize',resize);root.visualViewport?.removeEventListener('resize',resize);button.remove();popup.remove();previous=null}};return previous;
 }
 root.SemuonTagFilter={create,mount};
})(globalThis);
