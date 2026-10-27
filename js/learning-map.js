/* Read-only learning indicators. No grades, question data, or history are written here. */
(function(root,factory){
 const curriculum=typeof module==='object'&&module.exports?require('./curriculum.js'):root.SemuonCurriculum,api=factory(curriculum);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SemuonLearningMap=api;
})(globalThis,function(C){
 'use strict';
 const TARGET=70,EVIDENCE_TARGET=3;
 const pillars={
  fa:[['기초·회계변경',[1,2,13]],['유동자산',[3,4,5,6]],['비유동자산',[7,8,9]],['부채',[10]],['자본',[11]],['수익·비용',[12]]],
  cost:[['원가의 기초',[1]],['원가의 흐름',[2]],['요소별 원가',[3]],['간접비·개별원가',[4]],['부문별 원가',[5]],['종합원가',[6]],['공손·부산물',[7]]],
  vat:[['총론',[1]],['과세거래',[2]],['영세율·면세',[3]],['과세표준',[4]],['매입세액',[5]],['세금계산서',[6]],['신고·납부',[7]],['간이과세',[8]]],
  income:[['총론',[1]],['소득의 분류',[2]],['소득금액',[3]],['소득공제',[4]],['세액공제·감면',[5]],['신고·원천징수',[6]]]
 };
 const available=p=>!(Number(p.source?.round)>0&&Number(p.source.round)<=105)&&!p.source?.officialAllAccepted;
 const day=at=>new Date(Date.parse(at)+9*3600000).toISOString().slice(0,10);
 const percent=n=>Math.round(n),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function concept(p,unit){
  if(p.source.subtopic)return p.source.subtopic;
  const label=String(p.type||'').replace(/^재무회계\s*·\s*/,''),generic=/^(재무회계|원가회계|부가가치세|소득세|부가가치세 매입매출|부가가치세 신고서|소득세 급여·연말정산)$/;
  return generic.test(label)?unit.title:label||unit.title;
 }
 const scoreValue=x=>Math.floor((x.score||0)+1e-8);
 function status(x){if(!x.total)return{key:'empty',label:'자료 없음'};if(!x.answered)return{key:'unseen',label:'미학습'};if(scoreValue(x)>=TARGET)return{key:'ready',label:'기준선 도달'};if(x.answered===x.total&&x.availableEvidence<EVIDENCE_TARGET)return{key:'building',label:'자료 적음'};if(x.evidence<EVIDENCE_TARGET)return{key:'building',label:'확인 중'};return{key:'weak',label:'보완 권장'}}
 function measure(records){
  const done=records.filter(r=>r.result),evidence=done.reduce((s,r)=>s+r.credit,0),accuracy=evidence?done.reduce((s,r)=>s+r.credit*r.result.rate,0)/evidence*100:null;
  return{availableEvidence:records.reduce((s,r)=>s+r.credit,0),total:records.length,answered:done.length,unseen:records.length-done.length,evidence,accuracy,score:accuracy===null?null:accuracy*Math.min(evidence/EVIDENCE_TARGET,1),wrong:done.filter(r=>!r.result.latest.correct).length,ids:done.map(r=>r.problem.id)};
 }
 function aggregate(units){
  const eligible=units.filter(u=>u.total),known=eligible.filter(u=>u.answered),ids=new Set(known.flatMap(u=>u.ids));
  return{total:eligible.reduce((n,u)=>n+u.total,0),answered:ids.size,evidence:known.reduce((n,u)=>n+u.evidence,0),score:known.length?eligible.reduce((n,u)=>n+(u.score||0),0)/eligible.length:null,unitCount:eligible.length,knownUnits:known.length,unseen:eligible.length-known.length,readyUnits:eligible.filter(u=>u.score!==null&&scoreValue(u)>=TARGET).length,weakUnits:eligible.filter(u=>u.answered&&scoreValue(u)<TARGET).length};
 }
 function analyze(state,{scope='all',now=Date.now()}={}){
  const items=state.items.filter(p=>available(p)&&(scope==='theory'?p.subject==='theory':scope==='practice'?p.subject!=='theory':true)),ids=new Set(items.map(p=>p.id)),histories=new Map(),seen=new Set();let manualCount=0,gradeCount=0,lastAt=null;
  for(const [order,e]of state.history.entries()){
   if(!ids.has(e.problemId)||e.examId!=='tax2'||e.cancelledAt||typeof e.correct!=='boolean'||!Number.isFinite(Date.parse(e.at))||Date.parse(e.at)>now||seen.has(e.id))continue;seen.add(e.id);
   if(e.source==='semuon-self'){manualCount++;continue}if(e.source!=='semuon-grade')continue;
   if(!histories.has(e.problemId))histories.set(e.problemId,[]);histories.get(e.problemId).push({...e,order});gradeCount++;if(!lastAt||Date.parse(e.at)>Date.parse(lastAt))lastAt=e.at;
  }
  const outcomes=new Map();
  for(const[id,events]of histories){
   const days=new Map();for(const e of events.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.order-b.order))days.set(day(e.at),e);
   const recent=[...days.values()].slice(-3),weights=recent.map((_,i)=>4-recent.length+i),sum=weights.reduce((a,b)=>a+b,0),rate=recent.reduce((s,e,i)=>s+(e.correct?weights[i]:0),0)/sum;
   outcomes.set(id,{rate,latest:recent.at(-1),days:days.size});
  }
  const byUnit=new Map(C.units.map(u=>[u.id,{...u,records:[]}]));let unclassified=0;
  for(const p of items){const classification=C.classify(p),unitIds=[...new Set(classification.units)].filter(id=>byUnit.has(id));if(!unitIds.length){unclassified++;continue}for(const id of unitIds){const unit=byUnit.get(id);unit.records.push({problem:p,credit:1/unitIds.length,result:outcomes.get(p.id),concept:concept(p,unit)})}}
  const units=[...byUnit.values()].map(u=>{
   const groups=new Map();for(const r of u.records){if(!groups.has(r.concept))groups.set(r.concept,[]);groups.get(r.concept).push(r)}
   const concepts=[...groups].map(([title,records])=>({title,...measure(records),records}));
   const latestWrong=u.records.filter(r=>r.result&&!r.result.latest.correct),fields=new Map();for(const r of latestWrong)for(const field of new Set(r.result.latest.wrongLabels||[]))fields.set(field,(fields.get(field)||0)+1);
   return{...u,...measure(u.records),concepts,wrongFields:[...fields].sort((a,b)=>b[1]-a[1]).slice(0,3)};
  });
  const courses=C.courses.map(c=>{const children=units.filter(u=>u.course===c.name),areas=pillars[c.id].map(([title,numbers],i)=>{const selected=children.filter(u=>numbers.includes(u.number));return{id:c.id+'-'+i,title,units:selected,...aggregate(selected)}});return{id:c.id,name:c.name,units:children,pillars:areas,...aggregate(children)}});
  return{scope,courses,units,gradeCount,manualCount,lastAt,unclassified,questionCount:items.length};
 }
 const scoreLabel=x=>!x.total?'자료 없음':x.score===null?'미학습':scoreValue(x)+'점';
 const tone=x=>status(x).key;
 function bar(x,{compact=false}={}){return`<span class="lm-track ${tone(x)}${compact?' compact':''}" aria-hidden="true"><span class="lm-fill" style="width:${x.score===null?0:x.score.toFixed(2)}%"></span><span class="lm-target" style="left:${TARGET}%"></span></span>`}
 function courseButton(c,url,{selected=false,mini=false}={}){const text=mini?`${c.name} ${scoreLabel(c)} · ${c.knownUnits}/${c.unitCount}단원 채점`:null;return`<${url?'a':'button'} ${url?`href="${esc(url)}"`:'type="button"'} class="lm-course${selected?' selected':''}${mini?' mini':''}" data-course="${c.id}" ${url?'':`aria-pressed="${selected}"`} aria-label="${esc(text||c.name+' '+scoreLabel(c))}"><span class="lm-bar-label"><strong>${esc(c.name)}</strong><span>${scoreLabel(c)}</span></span>${bar(c,{compact:mini})}${mini?'':`<span class="lm-bar-meta"><span>${c.knownUnits}/${c.unitCount}단원 채점</span><span>${esc(status(c).label)}</span></span>`}</${url?'a':'button'}>`}
 function homeHTML(data,href){return`<div class="lm-home" aria-labelledby="lm-home-title"><div class="row spread"><h2 id="lm-home-title">나의 학습 지도</h2><a class="lm-detail-link" href="${href('pages/learning-map.html')}">자세히 보기 →</a></div><p class="help">${data.gradeCount?'과목을 눌러 약한 단원과 개념을 확인하세요.':data.manualCount?'직접 표시한 기록은 보관됩니다. 채점하면 지도가 채워집니다.':'문제를 채점하면 학습 지도가 채워집니다.'}</p><div class="lm-mini-bars">${data.courses.map(c=>courseButton(c,href('pages/learning-map.html?course='+c.id),{mini:true})).join('')}</div><p class="lm-legend small"><span class="lm-line-key"></span>참고기준 ${TARGET}점 <span class="lm-muted">· 정답 결과와 학습 범위 반영</span></p></div>`}
 function radar(course){
  const axes=course.pillars,n=axes.length,cx=280,cy=220,r=148,point=(i,value)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r*value/100,cy+Math.sin(a)*r*value/100]},pair=p=>p.map(v=>v.toFixed(1)).join(','),polygon=value=>axes.map((_,i)=>pair(point(i,value))).join(' '),all=axes.every(a=>a.score!==null),grid=[25,50,75,100].map(v=>`<polygon points="${polygon(v)}" class="lm-radar-grid"/>`).join('');
  const spokes=axes.map((a,i)=>{const p=point(i,100);return`<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" class="lm-radar-grid"/>`}).join('');
  let plot=all?`<polygon points="${axes.map((a,i)=>pair(point(i,a.score))).join(' ')}" class="lm-radar-fill"/>`:'';
  if(!all)for(let i=0;i<n;i++){const next=(i+1)%n;if(axes[i].score!==null&&axes[next].score!==null){const a=point(i,axes[i].score),b=point(next,axes[next].score);plot+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="lm-radar-result"/>`}}
  const dots=axes.map((a,i)=>{const p=point(i,a.score===null?100:a.score);return`<circle cx="${p[0]}" cy="${p[1]}" r="5" class="lm-radar-dot ${tone(a)}"/>`}).join('');
  const numbers=axes.map((a,i)=>{const p=point(i,112);return `<text x="${p[0]}" y="${p[1]+9}" text-anchor="middle" class="lm-axis-index">${i+1}</text>`}).join('');
  const labels=axes.map((a,i)=>{const p=point(i,124),anchor=Math.abs(p[0]-cx)<10?'middle':p[0]>cx?'start':'end',dy=p[1]>cy?8:-6;return`<a href="#map-units" data-pillar="${a.id}" aria-label="${esc(a.title)} ${scoreLabel(a)} 단원 보기"><text x="${p[0]}" y="${p[1]+dy}" text-anchor="${anchor}" class="lm-radar-label"><tspan x="${p[0]}">${esc(a.title)}</tspan><tspan x="${p[0]}" dy="21" class="lm-radar-value ${tone(a)}">${scoreLabel(a)}</tspan></text></a>`}).join('');
  return`<svg class="lm-radar" viewBox="0 0 560 450" role="img" aria-label="${esc(course.name)} 영역별 학습 확인도. ${axes.map(a=>esc(a.title)+' '+scoreLabel(a)).join(', ')}"><title>${esc(course.name)} 학습 확인도</title>${grid}${spokes}<polygon points="${polygon(TARGET)}" class="lm-radar-target"/>${plot}${dots}${labels}${numbers}</svg>`;
 }
 const legend=()=>`<p class="lm-legend"><span class="lm-dot-key ready"></span>기준선 도달 <span class="lm-dot-key weak"></span>학습 중 <span class="lm-dot-key unseen"></span>미학습 <span class="lm-line-key"></span>참고기준 ${TARGET}점</p>`;
 function methodology(){return`<details class="lm-method"><summary>점수는 어떻게 계산하나요?</summary><div><p><strong>학습 확인도는 정답 결과와 학습 범위를 함께 나타내는 참고 지표입니다.</strong> 빨간선 ${TARGET}점은 기초 점검을 위한 이 학습센터의 자체 복습 목표입니다.</p><ul><li>문제별로 최근 서로 다른 3학습일의 마지막 채점 결과를 사용합니다. 최근 날짜부터 3·2·1의 비중으로 반영하며, 기록이 적으면 있는 날짜만 계산합니다. 날짜는 한국 시간 기준입니다.</li><li>소단원 확인도 = 최근 정답률 × 학습 범위. 학습 범위는 서로 다른 문제 3개분을 채점하면 100%가 됩니다. 같은 문제를 반복해도 문제 수는 늘지 않습니다. 여러 소단원에 연결된 문제는 비중을 나눠 반영합니다.</li><li>영역·과목 점수는 등록 문제가 있는 소단원 점수의 평균입니다. 미학습 소단원은 아직 확인하지 못한 범위이므로 평균에 0으로 반영하고, 화면에는 ‘미학습’으로 구분합니다. ‘자료 없음’은 평균에서 제외합니다.</li><li>취소한 채점·직접 통과/다시 연습 표시·전원 정답 문항·105회 이하 기출은 계산에서 제외합니다. 기존 기록은 그대로 보존됩니다.</li></ul><p>복합 문제의 정오답은 연결된 개념을 함께 참고하므로 특정 개념의 오답을 확정하는 진단은 아닙니다. 연습을 이어가며 결과를 확인하세요.</p></div></details>`}
 function mount(host,state,{href,initialCourse='fa',initialScope='all',initialPillar='',onSelection=()=>{}}={}){
  let courseId=initialCourse,scope=['all','theory','practice'].includes(initialScope)?initialScope:'all',pillarId=initialPillar,data;
  function unitLink(u){const format=scope==='all'?'':'&format='+scope;return href('pages/topic.html?topic='+encodeURIComponent(u.course)+'&tag='+encodeURIComponent(u.id)+format)}
  function unitCard(u){const s=status(u),concepts=(u.concepts.length>1?u.concepts:u.concepts.filter(c=>c.title!==u.title)).slice().sort((a,b)=>Number(Boolean(b.answered))-Number(Boolean(a.answered))||(a.score??-1)-(b.score??-1)).slice(0,3);return`<details class="lm-unit ${s.key}"><summary class="lm-unit-summary-card"><div class="row spread"><div class="lm-unit-title"><span class="lm-unit-number">${String(u.number).padStart(2,'0')}</span><h3>${esc(u.title)}</h3></div><span class="lm-status ${s.key}">${s.label}</span></div><div class="lm-unit-score"><strong>${scoreLabel(u)}</strong><span class="lm-disclosure"><span class="lm-open-label">세부 보기</span><span class="lm-close-label">접기</span><span class="lm-chevron" aria-hidden="true">⌄</span></span></div>${bar(u)}</summary><div class="lm-unit-body"><p class="help">${u.accuracy===null?'채점 후 정답률을 확인할 수 있습니다.':`최근 정답률 ${percent(u.accuracy)}%`}</p><p class="help">채점 ${u.answered}문제 · 미풀이 ${u.unseen}문제${u.wrong?` · 최근 오답 ${u.wrong}문제`:''}</p>${u.total&&u.availableEvidence<EVIDENCE_TARGET?'<p class="help">이 범위의 등록 문제가 적어 추가 문제로 확인이 필요할 수 있습니다.</p>':''}${concepts.length?`<p class="help">개념별 표시는 연결된 문제의 채점 결과입니다.</p><ul class="lm-concepts" aria-label="관련 개념별 결과">${concepts.map(c=>`<li><span>${esc(c.title===u.title?'소단원 종합문제':c.title)}</span><strong>${c.accuracy===null?'미채점':percent(c.accuracy)+'%'}${c.answered?` <small>(${c.answered}문제)</small>`:''}</strong></li>`).join('')}</ul>`:''}${u.wrongFields.length?`<p class="lm-error-fields">최근 오답 항목: ${u.wrongFields.map(([name,count])=>esc(name)+' '+count+'문제').join(' · ')}</p>`:''}<a class="btn secondary" href="${unitLink(u)}">${u.answered?'이 단원 연습하기':'이 단원 시작하기'} →</a>${!u.total?'<p class="help">현재 선택한 범위에는 등록 문제가 없습니다.</p>':''}</div></details>`}
  function render(){
   data=analyze(state,{scope});const course=data.courses.find(c=>c.id===courseId)||data.courses[0];courseId=course.id;if(!course.pillars.some(p=>p.id===pillarId))pillarId='';const selected=course.pillars.find(p=>p.id===pillarId),units=selected?selected.units:course.units;
   host.innerHTML=`<div class="lm-controls"><label class="field"><span>학습기록 범위</span><select id="lm-scope"><option value="all">전체 학습</option><option value="theory">이론 학습</option><option value="practice">실무 학습</option></select></label><p>학습 확인도 <strong>0–100점</strong> · 참고기준 <strong>${TARGET}점</strong></p></div><div class="lm-layout"><section class="card lm-subjects" aria-labelledby="lm-subject-title"><p class="eyebrow">과목별 확인도</p><h2 id="lm-subject-title">어느 과목을 더 볼까요?</h2><p class="help">막대를 누르면 오른쪽 그래프가 바뀝니다.</p><div class="lm-course-list">${data.courses.map(c=>courseButton(c,null,{selected:c.id===course.id})).join('')}</div><p class="lm-summary">${data.gradeCount?`서로 다른 ${new Set(data.units.flatMap(u=>u.ids)).size}문제의 채점 반영`:'아직 채점한 문제가 없습니다.'}</p>${data.manualCount&&!data.gradeCount?'<p class="help">직접 표시한 기록은 보관됩니다. 문제의 ‘채점하기’를 사용하면 그래프에 반영됩니다.</p>':''}</section><section class="card lm-detail" aria-labelledby="lm-chart-title"><div class="row spread"><div><p class="eyebrow">영역별 학습 지도</p><h2 id="lm-chart-title">${esc(course.name)}</h2></div><span class="lm-big-score">${scoreLabel(course)}</span></div><p class="help">${course.knownUnits}/${course.unitCount}단원 채점 · 미학습 ${course.unseen}단원${course.weakUnits?` · 확인·보완할 단원 ${course.weakUnits}개`:''}</p>${radar(course)}${legend()}<div class="lm-areas" aria-label="확인할 세부 영역"><button type="button" class="lm-area ${selected?'':'active'}" data-pillar="" aria-pressed="${!selected}">전체 단원</button>${course.pillars.map((p,i)=>`<button type="button" class="lm-area ${p.id===pillarId?'active':''}" data-pillar="${p.id}" aria-pressed="${p.id===pillarId}"><b class="lm-area-index">${i+1}</b>${esc(p.title)} <span>${scoreLabel(p)}${p.score!==null&&p.unseen?` · 미학습 ${p.unseen}`:''}</span></button>`).join('')}</div></section></div><details id="map-units" class="lm-unit-section"><summary class="lm-unit-summary"><div><h2 id="lm-units-title">${selected?esc(selected.title)+'의 소단원·개념':esc(course.name)+' 소단원·개념'}</h2><p class="help">${units.length}개 소단원 · 펼쳐서 학습 상태와 관련 개념을 확인하세요.</p></div><span class="lm-disclosure"><span class="lm-open-label">펼쳐보기</span><span class="lm-close-label">접기</span><span class="lm-chevron" aria-hidden="true">⌄</span></span></summary><div class="lm-unit-grid">${units.map(unitCard).join('')}</div></details>${methodology()}${data.unclassified?`<p class="help">단원 분류가 확인되지 않은 ${data.unclassified}문제는 지표에서 제외했습니다.</p>`:''}`;
   host.querySelector('#lm-scope').value=scope;
   onSelection({course:courseId,scope,pillar:pillarId});
  }
  host.addEventListener('change',e=>{if(e.target.id==='lm-scope'){scope=e.target.value;render();host.querySelector('#lm-scope').focus()}});
  host.addEventListener('click',e=>{const subject=e.target.closest('button[data-course]'),area=e.target.closest('[data-pillar]');if(subject){courseId=subject.dataset.course;pillarId='';render();host.querySelector(`[data-course="${courseId}"]`).focus()}else if(area){e.preventDefault();pillarId=area.dataset.pillar;render();host.querySelector(`button[data-pillar="${pillarId}"]`)?.focus()}});
  render();return{refresh(){render()}};
 }
 return{TARGET,EVIDENCE_TARGET,analyze,status,homeHTML,mount};
});
