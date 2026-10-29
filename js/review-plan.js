/* Semuon-only review classification, coverage rotation and source-linked primers. */
(function(root,factory){const node=typeof module==='object'&&module.exports,api=factory(node?require('./curriculum.js'):root.SemuonCurriculum,node?require('./core.js'):root.SemuonCore,node?require('./textbook.js'):root.SemuonTextbook,node?require('../shared/review-engine.js'):root.TrainingReview);if(node)module.exports=api;else root.SemuonReviewPlan=api})(globalThis,function(C,Core,T,R){
'use strict';
const DAY=86400000,fields=[['theory','이론'],['general','일반전표 입력'],['voucher','매입매출전표 입력'],['vat','부가가치세 신고 부속서류'],['closing','결산 정리'],['withholding','원천징수·연말정산']],esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fieldOf=p=>p.subject==='theory'?'theory':C.practiceGroup(p)==='yearend'?'withholding':C.practiceGroup(p),eligible=p=>!(Number(p.source?.round)>0&&Number(p.source.round)<=105)&&!p.source?.officialAllAccepted;
const hash=s=>{let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0},normalizeField=f=>f==='practical'?'general':f;
const matchesField=(g,field='')=>field==='all'||(field?g.field===normalizeField(field):['theory','general','voucher'].includes(g.field));
function analyze(state,{now=Date.now()}={}){
 const items=state.items.filter(eligible).map(p=>{const classification=p.subject==='theory'?C.classify(p):C.practiceClassify(p),units=classification.units,byId=p.subject==='theory'?C.units:C.practiceUnits,names=units.map(id=>byId.find(u=>u.id===id)?.title).filter(Boolean),field=fieldOf(p),area=p.subject==='theory'?classification.subject:fields.find(f=>f[0]===field)?.[1]||field,leaf=p.source?.subtopic||'';return{...p,reviewType:[area,...names,leaf&&!names.some(n=>n.includes(leaf))?leaf:''].filter(Boolean).join(' · '),rotationUnits:units,rotationArea:area,reviewField:field}});
 const schedules=Core.questionSchedules({...state,items},now);return R.analyze(items,Core.reviewStates({...state,items},now),now).map(g=>{const ready=g.entries.filter(p=>schedules.get(p.id)?.available).sort((a,b)=>(Date.parse(a.history.at(-1)?.at)||0)-(Date.parse(b.history.at(-1)?.at)||0)||hash(R.day(now)+a.id)-hash(R.day(now)+b.id));return{...g,reviewCandidate:ready[0]||null,field:g.entries[0].reviewField,area:g.entries[0].rotationArea,units:[...new Set(g.entries.flatMap(p=>p.rotationUnits))],lastPracticed:g.events.at(-1)?.at||null}});
}
function select(groups,{now=Date.now(),limit=6,mode='balanced',field='',subject='',type=''}={}){
 field=normalizeField(field||subject);const eligible=groups.filter(g=>matchesField(g,field)&&(!type||g.key===type)),completed=eligible.filter(g=>g.practicedToday),count=Math.max(0,Math.min(30,Number(limit)||6)-(mode==='balanced'?completed.length:0));
 if(mode==='focus')return eligible.filter(g=>type||g.failures>0).sort((a,b)=>b.failures-a.failures||a.due-b.due||a.key.localeCompare(b.key)).slice(0,count);
 let pool=eligible.filter(g=>!g.practicedToday&&g.category!=='scheduled'&&g.reviewCandidate);const out=[],usedFields=new Map(),usedAreas=new Map(),usedUnits=new Map(),usedCategories=new Map(),urgentFields=new Set(),inc=(m,k)=>m.set(k,(m.get(k)||0)+1),remember=g=>{inc(usedFields,g.field);inc(usedAreas,g.area);for(const id of g.units)inc(usedUnits,id);inc(usedCategories,g.field+'|'+g.category)};
 completed.forEach(remember);const serial=Math.floor(Date.parse(R.day(now)+'T00:00:00Z')/DAY),fieldOrder=fields.map(f=>f[0]),allFields=[...new Set(eligible.map(g=>g.field))],ranks=new Map();
 for(const f of allFields){const list=eligible.filter(g=>g.field===f).sort((a,b)=>hash(a.key)-hash(b.key)||a.key.localeCompare(b.key)),quota=Math.max(1,Math.ceil(Number(limit)/Math.max(1,allFields.length))),offset=((serial*quota)%list.length+list.length)%list.length;list.forEach((g,i)=>ranks.set(g.key,(i-offset+list.length)%list.length))}
 const critical=g=>g.category==='due'&&(g.failures>=2||now-g.due>=7*DAY),recent=g=>g.lastPracticed&&now-Date.parse(g.lastPracticed)<3*DAY?1:0,unitUse=g=>Math.max(0,...g.units.map(id=>usedUnits.get(id)||0)),categories=['due','maintenance','new'];
 while(pool.length&&out.length<count){pool.sort((a,b)=>(usedFields.get(a.field)||0)-(usedFields.get(b.field)||0)||Number(critical(b)&&!urgentFields.has(b.field))-Number(critical(a)&&!urgentFields.has(a.field))||unitUse(a)-unitUse(b)||(usedAreas.get(a.area)||0)-(usedAreas.get(b.area)||0)||(usedCategories.get(a.field+'|'+a.category)||0)-(usedCategories.get(b.field+'|'+b.category)||0)||recent(a)-recent(b)||categories.indexOf(a.category)-categories.indexOf(b.category)||((a.category==='due'&&b.category==='due')?a.due-b.due:0)||(ranks.get(a.key)-ranks.get(b.key))||((fieldOrder.indexOf(a.field)-serial)%fieldOrder.length+fieldOrder.length)%fieldOrder.length-((fieldOrder.indexOf(b.field)-serial)%fieldOrder.length+fieldOrder.length)%fieldOrder.length);
  const g=pool.shift();out.push({...g,candidate:g.reviewCandidate});if(critical(g))urgentFields.add(g.field);remember(g);
 }return out;
}
// Principles are brief learning prompts, authored from the registered textbook/answer material.
// No question choices, answer numbers, variable amounts, legal rates or thresholds are copied here.
const rules={
 'unit:fa:01':['회계의 기본원리','회계정보는 이해관계자의 의사결정을 돕고 경영자의 수탁책임을 평가하는 데 쓰입니다.','기업실체·계속기업·기간별보고의 전제를 먼저 구분하고 정보의 질적 특성을 판단하세요.'],
 'unit:fa:02':['재무제표의 역할','재무상태표는 일정 시점의 자산·부채·자본, 손익계산서는 일정 기간의 수익·비용을 보여줍니다.','각 표의 역할과 인식 대상, 주석에 설명할 내용을 구분하세요.'],
 'unit:fa:03':['현금과 현금성자산','사용 제한과 취득 당시 만기·가치변동 위험을 확인해 현금성자산 여부를 판단합니다.','장부 잔액과 실제 잔액의 차이는 원인이 확인된 금액부터 해당 계정으로 정리합니다.'],
 'unit:fa:04':['단기매매증권','취득·기말 평가·처분을 구분하고 각 시점의 장부금액을 이어서 계산합니다.','단기매매증권의 공정가치 변동은 당기손익에 반영합니다.'],
 'unit:fa:05':['채권과 대손','기말에 필요한 대손충당금과 이미 남아 있는 충당금을 비교해 추가 설정액을 구합니다.','대손 확정·과거 대손금 회수는 충당금 설정과 구별해 처리합니다.'],
 'unit:fa:06':['재고자산','기말 재고의 귀속을 먼저 판단한 뒤 수량과 단가를 결정합니다.','기초재고에 당기매입을 더하고 기말재고를 차감하는 흐름으로 매출원가를 점검하세요.'],
 'unit:fa:07':['투자자산','보유 목적과 금융자산의 분류에 따라 평가·처분 방법이 달라집니다.','평가손익이 당기손익인지 자본 항목인지 구분한 뒤 처분 시 정리를 확인하세요.'],
 'unit:fa:08':['유형자산','의도한 용도로 사용할 수 있도록 직접 필요한 지출을 취득원가에 포함합니다.','취득 후 지출은 효익 증가 여부로 구분하고 처분손익은 처분대가와 장부금액을 비교합니다.'],
 'unit:fa:09':['무형·기타비유동자산','무형자산은 식별 가능성·통제·미래 경제적 효익을 기준으로 인식 여부를 검토합니다.','연구 지출과 요건을 갖춘 개발 지출을 구분하고 상각 대상 금액과 기간을 확인하세요.'],
 'unit:fa:10':['부채와 사채','결산일의 상환 기한과 부채의 성격을 함께 보고 유동·비유동을 구분합니다.','사채의 현금 이자 지급액과 유효이자율로 계산한 이자비용을 구별하세요.'],
 'unit:fa:11':['자본','자본 거래와 손익 거래를 먼저 구분한 뒤 자본금·잉여금·자본조정의 위치를 정합니다.','자기주식 거래는 주식 수와 장부금액을 이어서 정리하세요.'],
 'unit:fa:12':['수익·비용의 기간 귀속','현금의 수입·지출 시점과 수익·비용의 발생 시점은 다를 수 있습니다.','선급·선수는 다음 기간 몫을 빼고 미수·미지급은 당기 발생분을 더해 정리합니다.'],
 'unit:fa:13':['회계변경과 오류수정','정책의 변경·추정의 변경·과거 오류를 먼저 구별합니다.','구분한 사유와 중요성에 따라 소급 처리와 전진 적용 여부를 판단하세요.'],
 'unit:cost:01':['원가의 분류','직접·간접은 추적 가능성, 변동·고정은 조업도 변화에 대한 원가 행태의 구분입니다.','같은 원가도 분류 목적에 따라 여러 이름을 가질 수 있습니다.'],
 'unit:cost:02':['원가의 흐름','원재료에서 재공품, 제품, 매출원가로 원가가 이동합니다.','각 계정의 기초재고＋당기 투입－기말재고 흐름으로 다음 단계 전출액을 확인하세요.'],
 'unit:cost:03':['요소별 제조원가','제조원가는 직접재료비·직접노무비·제조간접비로 구성됩니다.','기본원가는 직접재료비＋직접노무비, 가공원가는 직접노무비＋제조간접비입니다.'],
 'unit:cost:04':['제조간접비 배부','예정배부율에 실제 배부기준 수량을 곱해 예정배부액을 구합니다.','실제 발생액과 예정배부액을 비교해 과소·과대 배부의 방향을 확인하세요.'],
 'unit:cost:05':['부문별 원가계산','보조부문비를 제조부문으로 배분한 뒤 제품에 배부합니다.','직접·단계·상호배분법이 보조부문 사이 용역을 어느 범위까지 반영하는지 구분하세요.'],
 'unit:cost:06':['종합원가계산','완성도에 따라 완성품환산량을 구하고 요소별 단위원가를 계산합니다.','평균법은 기초 원가를 함께 평균내고 선입선출법은 당기 작업분을 구분합니다.'],
 'unit:cost:07':['공손·작업폐물·부산물','발생 원인과 정상 범위 여부를 먼저 구분합니다.','검사 시점과 완성도를 확인해 공손 원가를 부담할 대상을 결정하세요.'],
 'unit:vat:01':['부가가치세의 구조','매출세액에서 공제 가능한 매입세액을 차감하는 흐름으로 납부세액을 계산합니다.','사업자·사업장·과세기간을 구분한 뒤 신고·납부의 범위를 확인하세요.'],
 'unit:vat:02':['과세거래와 공급시기','재화·용역의 공급 또는 수입에 해당하는지 먼저 판단합니다.','대금 결제일과 공급시기가 항상 같지는 않으므로 거래 조건을 확인하세요.'],
 'unit:vat:03':['영세율과 면세','영세율은 과세거래에 영의 세율을 적용하고 면세는 납세의무를 면제하는 구조입니다.','매출의 구분뿐 아니라 관련 매입세액 공제 가능 여부도 함께 판단하세요.'],
 'unit:vat:04':['과세표준','공급가액과 부가세를 포함한 공급대가를 먼저 구별합니다.','거래대가에 포함·제외할 항목을 정리한 뒤 매출세액 계산으로 넘어갑니다.'],
 'unit:vat:05':['매입세액','과세사업 관련성·적격 증빙·불공제 사유를 차례로 확인합니다.','공통으로 사용한 매입은 과세·면세에 직접 귀속되는 금액과 나누어 안분합니다.'],
 'unit:vat:06':['세금계산서','거래 당사자·작성일·공급가액·세액을 확인하고 공급시기와 발급 사유를 연결합니다.','수정세금계산서는 수정 사유에 맞는 작성일과 금액 방향을 구별하세요.'],
 'unit:vat:07':['신고와 납부','과세기간의 매출·매입 자료를 모은 뒤 공제·가산·기납부 항목을 조정합니다.','예정신고분과 확정신고분이 중복되지 않도록 반영 구간을 확인하세요.'],
 'unit:vat:08':['간이과세','일반과세와 간이과세는 납부세액 계산 구조와 적용 요건이 다릅니다.','교재의 적용 연도와 사업자 구분을 확인한 뒤 해당 계산 순서를 사용하세요.'],
 'unit:income:01':['소득세의 구조','소득의 성격에 따라 종합·분류·분리과세를 구분합니다.','납세의무자의 지위와 과세대상 소득의 범위를 먼저 확인하세요.'],
 'unit:income:02':['소득의 분류','대가를 받은 원인과 계속·반복성 등을 확인해 소득 종류를 구분합니다.','소득의 종류를 정한 뒤 해당 필요경비·공제 구조를 적용하세요.'],
 'unit:income:03':['소득금액','총수입·총급여와 소득금액은 서로 다른 단계의 금액입니다.','소득 종류에 맞는 경비 또는 공제를 차감한 뒤 다음 계산 단계로 이동합니다.'],
 'unit:income:04':['소득공제와 과세표준','소득공제는 소득금액에서 차감해 과세표준을 정하는 단계입니다.','대상자 요건과 지출 요건을 각각 확인한 후 공제액을 모으세요.'],
 'unit:income:05':['세액공제','세액공제는 계산한 세액에서 차감하며 소득공제와 적용 단계가 다릅니다.','공제 대상·지출 주체·중복 적용 여부를 항목별로 확인하세요.'],
 'unit:income:06':['원천징수와 정산','소득 지급 시 원천징수한 세액과 최종 정산 세액을 구별합니다.','신고 대상 기간과 기납부세액을 확인해 추가 납부·환급 방향을 판단하세요.']
};
const practiceRules={
 general:['일반전표 처리 순서','거래일·거래 내용·대금 결제 방법을 읽고 자산·부채·손익의 증감을 판단합니다.','기존 장부 잔액과 거래처를 확인한 뒤 차변·대변 합계가 일치하는지 점검하세요.'],
 voucher:['매입매출전표 처리 순서','매출·매입 방향, 과세 유형, 증빙 종류를 먼저 구분합니다.','공급가액·세액·결제금액을 맞추고 거래처·분개·불공제 등 추가 설정을 확인하세요.'],
 vat:['부가세 신고 부속서류','증빙과 거래를 해당 명세서에 연결하고 공제 가능 금액을 구분합니다.','전표에서 불러온 자료와 수동 입력분의 중복 여부, 신고서 반영 금액을 점검하세요.'],
 closing:['결산 정리 순서','기말 현재 필요한 잔액과 정리 전 장부 잔액의 차이를 계산합니다.','수동·자동 결산 입력 위치를 구분하고 같은 금액을 두 번 반영하지 않도록 확인하세요.'],
 withholding:['원천징수·연말정산','사원·부양가족 요건, 소득·비과세 구분, 공제 대상 지출을 순서대로 확인합니다.','소득공제와 세액공제의 적용 단계를 구분하고 기납부세액과 최종 세액을 정산하세요.']
};
const leafRules=[
 [/수탁책임|재무보고의 목적|회계와 재무보고/,'재무보고의 목적','재무보고는 정보이용자의 의사결정과 경영자의 수탁책임 평가를 돕습니다.','경영자 개인의 판단만을 위한 정보와 외부 이해관계자에게 필요한 정보를 구분하세요.'],
 [/계속기업|기본가정/,'회계의 기본가정','기업실체는 보고 범위를, 계속기업은 영업활동이 이어진다는 전제를 뜻합니다.','기간별보고는 계속되는 기업 활동을 일정 기간으로 나누어 보고한다는 전제입니다.'],
 [/중요성/,'중요성','정보를 빠뜨리거나 잘못 표시했을 때 이용자의 판단에 영향을 줄 수 있는지 살펴봅니다.','금액뿐 아니라 거래의 성격과 상황도 함께 고려하세요.'],
 [/보수주의/,'보수주의','불확실한 상황에서 자산·수익을 과대하게, 부채·비용을 과소하게 표시하지 않도록 신중하게 판단합니다.','고의로 이익을 낮추는 방식과 구별하세요.'],
 [/질적 특성|목적적합|피드백|검증가능/,'유용한 회계정보','목적적합성은 이용자의 판단에 도움이 되는지, 검증가능성은 독립적인 관찰자가 유사한 결론에 도달하는지의 구분입니다.','예측을 돕는 가치와 과거 예측을 확인·수정하는 가치를 구별하세요.']
];
const practicalBridges={general:{1:'fa:03',2:'fa:05',3:'fa:07',4:'fa:06',5:'fa:08',6:'fa:10',7:'fa:11',8:'fa:12',9:'vat:07',10:'fa:12',11:'fa:12'},voucher:{1:'vat:06',2:'vat:03',3:'vat:04',4:'vat:03',5:'vat:04',6:'vat:05',7:'vat:03',8:'vat:03',9:'vat:05',10:'vat:05',11:'vat:05',12:'vat:05',13:'vat:03',14:'vat:07'}};
function primer(problem,concept=''){
 const isTheory=problem.subject==='theory',ids=isTheory?C.classify(problem).units:C.practiceClassify(problem).units,unit=(isTheory?C.units:C.practiceUnits).find(u=>u.id===ids[0]),field=fieldOf(problem),text=concept||problem.source?.subtopic||'',leaf=isTheory&&ids.includes('unit:fa:01')&&leafRules.find(r=>r[0].test(text));let rule=leaf?leaf.slice(1):rules[unit?.id];
 if(!rule&&!isTheory){const bridge=practicalBridges[field]?.[unit?.number];rule=bridge&&rules['unit:'+bridge];}rule=rule||practiceRules[field];if(!rule)return null;
 const catalog=T.forLane(isTheory?'theory':'practice'),concepts=catalog.entries.filter(r=>r.kind==='concept'&&ids.includes(r.unitId)),ref=concepts.find(r=>text&&r.title.includes(text))||concepts[0];
 return{id:(leaf?'leaf:'+rule[0]:unit?.id||field),title:rule[0],lines:rule.slice(1).concat(!isTheory&&rule!==practiceRules[field]&&practiceRules[field]?[practiceRules[field][2]]:[]),lane:isTheory?'이론':'실무',source:ref?'셀파 '+(isTheory?'이론':'실무')+' · '+T.location(ref):'등록된 '+(isTheory?'이론 단원':'실무')+' 자료 기준',bookRef:ref?.id||null,unitId:unit?.id};
}
function primers(tasks,queue,{limit=3}={}){const out=[],seen=new Set(),rows=[...tasks.flatMap(t=>t.plan.entries.map(r=>[r.problem,r.concept])),...queue.map(g=>[g.candidate,''])];for(const[p,concept]of rows){const r=primer(p,concept);if(!r||seen.has(r.id))continue;seen.add(r.id);out.push(r);if(out.length===limit)break}return out}
function primersHTML(rows,href){return rows.length?`<section class="rv-primers"><div class="row spread"><h3>먼저 읽는 핵심 원리</h3><span class="help">오늘 추천 범위 · 약 1분</span></div>${rows.map(r=>`<article class="rv-primer"><strong>${esc(r.title)}</strong><ul>${r.lines.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><small>${r.bookRef?`<a href="${href('pages/progress.html?book='+encodeURIComponent(r.bookRef))}">${esc(r.source)}</a>`:esc(r.source)}</small></article>`).join('')}</section>`:''}
return{fields,fieldOf,matchesField,analyze,select,primer,primers,primersHTML};
});
