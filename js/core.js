(function(root,factory){
  const G=typeof module==='object'&&module.exports?require('../shared/entry/grading.js'):root.EntryGrading;
  const F=typeof module==='object'&&module.exports?require('./tax-forms.js'):root.SemuonTaxForms;
  const api=factory(G,F);if(typeof module==='object'&&module.exports)module.exports=api;else root.SemuonCore=api;
})(globalThis,function(G,F){
  'use strict';
  const EXAM='tax2',KEY='semuon-tax2-v1',VERSION=1,SUBJECTS=['theory','practical','voucher'];
  const labels={theory:'이론 학습',practical:'일반전표 입력',voucher:'매입매출전표 입력'};
  const MARKUP_TOOLS=[['blue','파란색','1'],['red','빨간색','2'],['green','초록색','3'],['highlight','형광펜','4'],['underline','밑줄','5'],['strike','취소선','6'],['clear','표시 지우기','7']];
  const MARKUP_SHORTCUT_DEFAULTS=Object.fromEntries(MARKUP_TOOLS.map(([id,,key])=>[id,key]));
  function markupShortcuts(settings){return{...MARKUP_SHORTCUT_DEFAULTS,...settings.markupShortcuts}}
  function validateMarkupShortcuts(value){assert(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===MARKUP_TOOLS.length&&MARKUP_TOOLS.every(([id])=>typeof value[id]==='string'&&/^[0-9A-Z]$/.test(value[id])),'단축키는 기능마다 숫자 또는 영문 한 글자로 입력해 주세요.');assert(new Set(Object.values(value)).size===MARKUP_TOOLS.length,'같은 단축키를 두 기능에 사용할 수 없습니다.');return value}
  const FONT_DEFAULTS={fontUiPt:10.5,fontBodyPt:12,fontUiFamily:'default',fontBodyFamily:'default'};
  const FONT_FAMILIES={default:{label:'기본 글꼴 (Noto Sans KR)',css:'"Noto Sans KR", "Malgun Gothic", "Segoe UI", system-ui, sans-serif'},malgun:{label:'맑은 고딕',css:'"Malgun Gothic", "Segoe UI", system-ui, sans-serif'},nanum:{label:'나눔고딕',css:'"Nanum Gothic", "Malgun Gothic", system-ui, sans-serif'},gulim:{label:'굴림',css:'Gulim, "Malgun Gothic", system-ui, sans-serif'},batang:{label:'바탕',css:'Batang, "Noto Serif KR", serif'},mono:{label:'고정폭 글꼴',css:'Consolas, "D2Coding", monospace'}};
  function fontPreferences(settings){const old=settings.fontSize||18;return{fontUiPt:settings.fontUiPt??Math.max(16,old-2)*72/96,fontBodyPt:settings.fontBodyPt??old*72/96,fontUiFamily:settings.fontUiFamily||'default',fontBodyFamily:settings.fontBodyFamily||'default'}}
  const clone=x=>JSON.parse(JSON.stringify(x));
  const norm=x=>String(x??'').normalize('NFKC').trim().replace(/\s+/g,' ');
  function stable(x){if(Array.isArray(x))return '['+x.map(stable).join(',')+']';if(x&&typeof x==='object')return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}';return JSON.stringify(x)}
  function assert(ok,message){if(!ok)throw Error(message)}
  const text=(s,label)=>{assert(typeof s==='string'&&s.trim(),label+'을 입력해 주세요.');return s};
  const field=(s,label)=>{text(s,label);assert(!/[<>"&]/.test(s),label+'의 특수문자는 확인이 필요합니다. 원문은 보존하고 입력용 명칭을 확인해 주세요.');return s};
  const amount=(n,label)=>{assert(Number.isSafeInteger(n),label+'은 정수 원 단위로 입력해 주세요.');return n};
  const immutableItems=new WeakSet();
  function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value}
  function immutableItem(raw){if(immutableItems.has(raw))return raw;const p=freeze(validateItem(raw));immutableItems.add(p);return p}
  function row(r,label){
    assert(r&&['D','C'].includes(r.side),label+'의 차변/대변을 확인해 주세요.');field(r.account,label+' 계정과목');amount(r.amount,label+' 금액');
    assert(['',undefined,'판','제'].includes(r.division),label+'의 판/제 구분을 확인해 주세요.');
    for(const k of ['partner','memo','summary'])if(r[k])field(r[k],label+' '+k);
    if(r.accountCode)assert(/^\d{3}$/.test(String(r.accountCode)),label+' 계정코드는 세 자리여야 합니다.');
    return clone(r);
  }
  function rows(list,label,{balanced=true}={}){
    assert(Array.isArray(list)&&list.length>0&&list.length<=30,label+' 분개를 확인해 주세요.');list.forEach((r,i)=>row(r,label+' '+(i+1)+'행'));
    if(balanced)assert(list.reduce((s,r)=>s+(r.side==='D'?r.amount:-r.amount),0)===0,label+'의 차변·대변 합계가 다릅니다.');
  }
  function attachments(list=[]){
    assert(Array.isArray(list), '첨부 자료 목록을 확인해 주세요.');
    for(const f of list){text(f.name,'첨부 파일명');assert(/^data:(image\/(png|jpeg|webp)|application\/pdf|text\/plain);base64,[A-Za-z0-9+/=\r\n]+$/.test(f.data||''),'첨부 자료는 PNG/JPEG/WebP/PDF/TXT만 허용합니다.');assert(f.data.length<3000000,'첨부 한 파일은 약 2MB 이하로 넣어 주세요.');}
  }
  function validateDisplayBlocks(blocks,depth=0){assert(depth<=4&&Array.isArray(blocks)&&blocks.length>0,'화면용 문제 자료를 확인해 주세요.');for(const b of blocks){if(typeof b==='string'){text(b,'화면용 본문');continue}assert(b&&Array.isArray(b.rows)&&b.rows.length>0&&b.rows.every(r=>Array.isArray(r)&&r.every(c=>c&&typeof c.text==='string'&&[c.colspan||1,c.rowspan||1].every(n=>Number.isInteger(n)&&n>=1&&n<=50))),'화면용 표의 행·열을 확인해 주세요.');assert(!b.headerRows||Number.isInteger(b.headerRows)&&b.headerRows>=0&&b.headerRows<=b.rows.length,'표 머리글을 확인해 주세요.');for(const c of b.rows.flat())if(c.blocks)validateDisplayBlocks(c.blocks,depth+1);}}
  function validateItem(raw){
    if(raw&&immutableItems.has(raw))return raw;
    assert(raw&&raw.examId===EXAM,'전산세무 2급 자료만 등록할 수 있습니다.');
    const p=clone(raw);assert(typeof p.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(p.id),'문제 ID를 확인해 주세요.');
    assert(SUBJECTS.includes(p.subject),'이론·일반전표·매입매출전표만 등록할 수 있습니다.');
    text(p.title,'제목');text(p.type,'복습 유형');text(p.prompt,'문제 원문');text(p.explanation,'해설 또는 정답 근거');
    if(p.displayPrompt!==undefined)text(p.displayPrompt,'화면용 문제 본문'); // Original remains verbatim in source.originalText/prompt.
    if(p.displayBlocks!==undefined)validateDisplayBlocks(p.displayBlocks);
    assert(p.source&&p.source.verified===true,'원문·정답·증빙 확인을 마친 자료만 등록해 주세요.');
    text(p.source.name,'출처/자료명');text(p.source.questionNo,'문항 번호');text(p.source.originalText,'보관할 원문');text(p.source.answerText,'원본 정답');
    assert(p.source.originalText===p.prompt,'문제 화면의 원문과 보관 원문이 다릅니다. 동일하게 보존해 주세요.');
    text(p.source.answerReference,'정답 확인 자료/쪽수');attachments(p.source.evidence||[]);if(p.source.originalFile)attachments([p.source.originalFile]);
    for(const v of [...(p.suppliers||[]),...(p.zeroRateOptions||[])])field(v,'입력 선택값');
    if(p.voucher?.zeroRate)field(p.voucher.zeroRate,'영세율 구분');
    if(p.addedDate)assert(/^\d{4}-\d{2}-\d{2}$/.test(p.addedDate),'등록일 형식을 확인해 주세요.');
    if(p.exhibit){assert(Array.isArray(p.exhibit.rows)&&p.exhibit.rows.length>0,'증빙 표에 행이 없습니다.');assert((p.exhibit.headers||[]).every(v=>typeof v==='string')&&p.exhibit.rows.every(r=>Array.isArray(r)&&r.every(v=>typeof v==='string')),'증빙 표는 문자열로 된 행과 열이어야 합니다.');}
    if(p.source.evidenceRequired)assert(p.exhibit||(p.source.evidence||[]).length,'풀이에 필요한 증빙을 첨부하거나 표로 재현해 주세요.');
    if(p.requiredAccountCodes)for(const [name,code]of Object.entries(p.requiredAccountCodes)){field(name,'계정명');assert(/^\d{3}$/.test(String(code)),'필수 계정코드는 세 자리여야 합니다.');}
    if(p.initialEntry){
      const initial=p.initialEntry;
      assert(p.subject!=='theory'&&['practical','voucher'].includes(initial.subject),'수정 전 입력은 일반전표·매입매출전표만 지원합니다.');
      assert(Array.isArray(initial.rows)&&initial.rows.length<=30,'수정 전 분개 행을 확인해 주세요.');
      // Original entries can be incomplete or unbalanced: those are the errors to fix.
      initial.rows.forEach((r,i)=>row(r,'수정 전 '+(i+1)+'행'));
      if(initial.date)assert(/^\d{4}-\d{2}-\d{2}$/.test(initial.date),'수정 전 거래일 형식을 확인해 주세요.');
      if(initial.voucher){
        assert(initial.subject==='voucher'&&typeof initial.voucher==='object'&&!Array.isArray(initial.voucher),'수정 전 매입매출전표 항목을 확인해 주세요.');
        const v=initial.voucher;
        for(const [k,value]of Object.entries(v)){if(['supply','vat','serviceFee','quantity','unitPrice'].includes(k))amount(value,'수정 전 '+k);else if(value!=null&&value!=='')field(value,'수정 전 '+k);}
        if(v.type)assert([...G.TYPES.sales,...G.TYPES.purchase].includes(v.type),'수정 전 유형을 확인해 주세요.');
        if(v.date)assert(/^\d{4}-\d{2}-\d{2}$/.test(v.date),'수정 전 거래일 형식을 확인해 주세요.');
      }
    }
    if(p.form)F.validForm(p.form);
    if(p.taxExtras){const x=p.taxExtras;if(x.omitted?.acceptedPeriods)assert(Array.isArray(x.omitted.acceptedPeriods)&&x.omitted.acceptedPeriods.includes(x.omitted.period)&&x.omitted.acceptedPeriods.every(v=>/^\d{4}-(0[1-9]|1[0-2])$/.test(v)),'허용 확정신고 개시연월을 확인해 주세요.');if(x.omitted)assert(/^\d{4}-(0[1-9]|1[0-2])$/.test(x.omitted.period),'확정신고 개시연월을 확인해 주세요.');if(x.partners)for(const [a,v]of Object.entries(x.partners)){field(a,'분개 계정');field(v,'분개 거래처');assert(x.partnerOptions?.includes(v),'분개 거래처 선택값이 없습니다.');}}
    if(p.formEntry)assert(p.form&&p.formEntry==='practical'&&p.subject==='practical','추가 결산자료는 일반전표와 함께 등록해 주세요.');
    if(p.form&&!p.voucher&&p.formEntry!=='practical'){assert(p.subject!=='theory','신고서·급여는 실무 분야로 등록해 주세요.');}
    else if(p.subject==='theory'){
      assert(Array.isArray(p.choices)&&p.choices.length===4&&p.choices.every(v=>typeof v==='string'&&v.trim()),'이론은 원문 그대로 보기 4개를 입력해 주세요.');
      assert(Number.isInteger(p.answer)&&p.answer>=0&&p.answer<4,'이론 정답은 0~3 인덱스로 확인해 주세요.');
      if(p.acceptedAnswers)assert(p.acceptedAnswers.length&&p.acceptedAnswers.every(n=>Number.isInteger(n)&&n>=0&&n<4),'복수 정답의 보기 번호를 확인해 주세요.');
    }else if(p.subject==='practical'){
      rows(p.answers,'정답');for(const alt of p.alternateAnswers||[])rows(alt,'허용 대체답안');
      // Separate rows may use different codes for the same account (e.g. receivables).
      for(const list of [p.answers,...(p.alternateAnswers||[])])for(const r of list)if(r.accountCode&&!p.perRowAccountCodes){assert(!p.requiredAccountCodes?.[r.account]||String(p.requiredAccountCodes[r.account])===String(r.accountCode),'같은 계정의 필수 코드가 서로 다릅니다.');p.requiredAccountCodes={...(p.requiredAccountCodes||{}),[r.account]:String(r.accountCode)}}
    }else{
      const v=p.voucher;assert(v&&/^\d{4}-\d{2}-\d{2}$/.test(v.date)&&!Number.isNaN(Date.parse(v.date))&&new Date(v.date).toISOString().slice(0,10)===v.date,'거래일자를 확인해 주세요.');
      const types=[...G.TYPES.sales,...G.TYPES.purchase];assert(types.includes(v.type),'공유 입력기에 없는 전표 유형입니다. 해당 시험 자료 확인이 필요합니다.');
      amount(v.supply,'공급가액');amount(v.vat,'세액');if(!p.supplierOptional)field(v.supplier,'거래처');
      assert(['여','부',null].includes(v.electronic),'전자 여부는 여/부/해당 없음으로 입력해 주세요.');
      if(v.cardCompany)field(v.cardCompany,'카드사');if(G.CARD_TYPES.has(v.type))text(v.cardCompany,'정답 카드사');
      if(G.ZERO_RATE_TYPES.has(v.type)){text(v.zeroRate,'영세율 구분');if(!G.ZERO_RATE_REASONS.includes(v.zeroRate))assert((p.zeroRateOptions||[]).includes(v.zeroRate),'새 영세율 구분은 확인된 선택 목록도 함께 등록해 주세요.');}
      if(v.type==='54.불공')assert(G.DEDUCT_REASONS.includes(v.deductReason),'불공제 사유를 확인해 주세요.');
      if(v.serviceFee!=null)amount(v.serviceFee,'봉사료');
      assert(Array.isArray(p.variants)&&p.variants.length>0,'허용 분개를 한 개 이상 등록해 주세요.');
      for(const a of p.variants){assert(['현금','외상','혼합','카드','분개없음'].includes(a.journal),'허용 분개 방식을 확인해 주세요.');if(a.journal==='분개없음')assert(Array.isArray(a.rows)&&a.rows.length===0,'분개없음에 분개 행이 있습니다.');else rows(a.rows,'허용 분개',{balanced:!['현금','카드'].includes(a.journal)});if(a.type)assert(types.includes(a.type),'대체 유형을 확인해 주세요.');if(a.supply!==undefined){amount(a.supply,'대체 공급가액');amount(a.vat,'대체 세액');}}
      for(const a of p.variants)for(const r of a.rows)if(r.accountCode){assert(!p.requiredAccountCodes?.[r.account]||String(p.requiredAccountCodes[r.account])===String(r.accountCode),'같은 계정의 필수 코드가 서로 다릅니다.');p.requiredAccountCodes={...(p.requiredAccountCodes||{}),[r.account]:String(r.accountCode)}}
      for(const type of p.acceptedTypes||[])assert(types.includes(type),'허용 유형을 확인해 주세요.');
      for(const pair of p.acceptedAmounts||[]){assert(pair.length===2,'공급가액·세액을 한 쌍으로 등록해 주세요.');pair.forEach(n=>amount(n,'허용 금액'));}
      // A complete official answer must pass the existing common grader.
      for(const a of p.variants){const e={...v,journal:a.journal,deleted:true,type:a.type||v.type,...(a.supply===undefined?{}:{supply:a.supply,vat:a.vat})};const coded=a.rows.map(r=>({...r,accountCode:r.accountCode||p.requiredAccountCodes?.[r.account]||G.REQUIRED_ACCOUNT_CODES[r.account]||''}));assert(G.voucher(p,e,coded).correct,'허용 분개와 윗단 정답 조건이 모순됩니다.');}
    }
    if(p.formEntry||p.perRowAccountCodes){const input={rows:clone(p.answers),form:p.form?Object.fromEntries(p.form.fields.map(f=>[f.key,Array.isArray(f.expected)?f.expected[0]:f.expected])):{}};assert(grade(p,input).correct,'분개·행별 코드·추가 결산자료의 정답 조건이 모순됩니다.');}
    p.tags=Array.isArray(p.tags)?p.tags.filter(t=>typeof t==='string'):[];p.addedDate=p.addedDate||new Date().toISOString().slice(0,10);return p;
  }
  const identity=p=>stable([p.subject,norm(p.source.name),String(p.source.round||''),norm(p.source.questionNo)]);
  const fingerprint=p=>stable([p.subject,norm(p.source.originalText),p.exhibit||null,(p.source.evidence||[]).map(e=>e.data)]);
  const answerSignature=p=>stable({choices:p.choices,answer:p.answer,acceptedAnswers:p.acceptedAnswers,answers:p.answers,alternateAnswers:p.alternateAnswers,voucher:p.voucher,variants:p.variants,acceptedTypes:p.acceptedTypes,acceptedAmounts:p.acceptedAmounts,requiredAccountCodes:p.requiredAccountCodes,requiresDeletion:p.requiresDeletion,form:p.form,taxExtras:p.taxExtras,formEntry:p.formEntry,perRowAccountCodes:p.perRowAccountCodes});
  function problemIndex(items){
    const ids=new Map(),identities=new Map(),prints=new Map(),keys=new WeakMap();let order=0;
    const key=p=>{if(!keys.has(p))keys.set(p,{identity:identity(p),print:fingerprint(p)});return keys.get(p)};
    const add=p=>{const k=key(p),entry={p,order:order++};if(!ids.has(p.id))ids.set(p.id,entry);if(!identities.has(k.identity))identities.set(k.identity,entry);if(!prints.has(k.print))prints.set(k.print,entry)};
    const find=p=>{const k=key(p);return[ids.get(p.id),identities.get(k.identity),prints.get(k.print)].filter(Boolean).sort((a,b)=>a.order-b.order)[0]?.p};
    items.forEach(add);return{add,find,key};
  }
  function plan(current,spec){
    assert(spec?.examId===EXAM&&spec.schemaVersion===VERSION,'전산세무 2급 등록 파일(버전 1)만 가져올 수 있습니다.');assert(Array.isArray(spec.items)&&spec.items.length>0,'등록할 문제가 없습니다.');
    const add=[],duplicates=[],index=problemIndex(current);
    for(const raw of spec.items){const p=validateItem(raw),found=index.find(p);
      if(found){assert(index.key(found).print===index.key(p).print&&answerSignature(found)===answerSignature(p),'기존 문제와 원문 또는 정답이 충돌합니다: '+p.title);duplicates.push({id:found.id,title:p.title});}
      else{add.push(p);index.add(p)}
    }return{add,duplicates};
  }
  const STUDY_RESULTS={learned:'학습함 · 수행 미확인',independent:'혼자 완료',reference:'참고해서 완료',blocked:'해결하지 못함'},STUDY_METHODS={reading:'개념·풀이 설명 학습',textbook:'교재 문제 풀이',program:'실제 프로그램 실습',center:'학습센터 훈련',lecture:'강의 학습',other:'기타 학습'},STUDY_DIFFICULTIES={none:'없음·미확인',concept:'개념·대상 판단',calculation:'금액 계산',lookup:'장부·자료 조회',input:'프로그램 입력'};
  const JOURNAL_TOOL_IDS=['undo','redo','h2','h3','bold','italic','underline','strike','highlight','bullet','numbered','task','quote','code','link','table','blue','red','green'];
  const validStudyDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
  function validStudyUnit(id){const m=/^(unit|practice):([a-z]+):(\d{2})$/.exec(id||''),limits=m&&(m[1]==='unit'?{fa:13,cost:7,vat:8,income:6}:{foundation:3,general:13,voucher:15,vat:10,closing:14,withholding:5,yearend:7});return Boolean(m&&Number(m[3])>=1&&Number(m[3])<=limits[m[2]])}
  function validateStudyEvent(e,ids){assert(e&&typeof e.id==='string'&&e.id.length>0&&e.id.length<=100&&Number.isFinite(Date.parse(e.at))&&validStudyDate(e.date)&&['entry','daily','delete'].includes(e.kind),'학습 기록의 날짜·형식을 확인해 주세요.');if(e.kind==='daily'){assert(typeof e.noteMd==='string'&&e.noteMd.length<=4000,'오늘의 한 줄을 확인해 주세요.');return}assert(typeof e.entryId==='string'&&e.entryId&&e.entryId.length<=100,'학습 항목 ID를 확인해 주세요.');if(e.kind==='delete')return;assert(['theory','practice'].includes(e.lane)&&validStudyUnit(e.unitId)&&(e.lane==='theory')===e.unitId.startsWith('unit:')&&Object.hasOwn(STUDY_RESULTS,e.outcome)&&Object.hasOwn(STUDY_METHODS,e.method)&&Object.hasOwn(STUDY_DIFFICULTIES,e.difficulty),'학습 항목의 단원·결과를 확인해 주세요.');for(const[key,max]of [['focus',200],['noteMd',12000],['pages',80]])assert(typeof e[key]==='string'&&e[key].length<=max,'학습 메모의 길이를 확인해 주세요.');(typeof module==='object'&&module.exports?require('./textbook.js'):globalThis.SemuonTextbook).validateRecord(e);if(e.problemId)assert(ids.has(e.problemId),'연결한 문제를 찾을 수 없습니다.');if(e.minutes!==null)assert(Number.isInteger(e.minutes)&&e.minutes>=0&&e.minutes<=1440,'학습 시간은 0~1440분으로 입력해 주세요.');}
  function fresh(){return{schemaVersion:VERSION,examId:EXAM,revision:0,items:[],drafts:{},history:[],studyLog:[],progressEvents:[],reviewNotes:[],inbox:[],settings:{fontSize:18,reviewLimit:6,...FONT_DEFAULTS}}}
  function grade(p,input){
    assert(input&&typeof input==='object','입력 답안을 확인해 주세요.');
    if(p.form&&!p.voucher&&p.formEntry!=='practical')return F.gradeForm(p.form,input.form||{});
    if(p.subject==='theory'){assert(Number.isInteger(input.choice)&&input.choice>=0&&input.choice<4,'답을 선택해 주세요.');const correct=(p.acceptedAnswers||[p.answer]).includes(input.choice);return{correct,wrongLabels:correct?[]:['선택지']};}
    if(p.subject==='practical'){let problem=p,userRows=input.rows||[];if(p.perRowAccountCodes){const accounts=new Set([p.answers,...(p.alternateAnswers||[])].flat().filter(r=>r.accountCode).map(r=>r.account)),alias=(name,code)=>accounts.has(name)?name+' ['+String(code||'')+']':name,convert=r=>{const a=G.accountParts(r.accountValue||r.account),name=alias(a.name,r.accountCode||a.code);return{...r,account:name,accountValue:(r.accountCode||a.code)?(r.accountCode||a.code)+'|'+name:name}};problem={...p,answers:p.answers.map(convert),alternateAnswers:(p.alternateAnswers||[]).map(list=>list.map(convert))};userRows=userRows.map(convert)}const r=G.practical(problem,userRows),extra=F.gradeExtras(p,input),wrongLabels=[...r.wrongLabels,...extra.wrongLabels];return{correct:!wrongLabels.length,wrongLabels}}
    const r=G.voucher(p,input.voucher||{},input.rows||[]),extra=F.gradeExtras(p,input),wrongLabels=[...r.wrongLabels,...extra.wrongLabels];return{correct:!wrongLabels.length,wrongLabels,checks:r.checks};
  }
  function broadTopics(p){if(['재무회계','원가회계','부가가치세','소득세'].includes(p.source?.category))return[p.source.category];const s=[p.type,...(p.tags||[]),p.form?.kind||''].join(' '),out=[];if(p.subject==='voucher'||/부가가치세|부가세|의제매입/.test(s))out.push('부가가치세');if(/소득세|원천징수|급여|예수금|연말정산|퇴직연금|payroll|yearend/.test(s))out.push('소득세');if(/원가|제조간접|공손|종합원가/.test(s))out.push('원가회계');if(!out.length||p.subject==='practical'&&!p.form)out.push('재무회계');return[...new Set(out)]}
  // semuon-grade: 채점 버튼 결과. semuon-self: ‘알고 있어요 · 통과/틀렸어요 · 다시 연습’ 직접 표시(답안 없음, 복습 엔진에는 notebook으로 전달).
  const SOURCES=['semuon-grade','semuon-self'];
  function active(s,now=Date.now()){const ids=new Set(s.items.map(p=>p.id));return s.history.filter(e=>e.examId===EXAM&&SOURCES.includes(e.source)&&ids.has(e.problemId)&&!e.cancelledAt&&typeof e.correct==='boolean'&&Number.isFinite(Date.parse(e.at))&&Date.parse(e.at)<=now)}
  // Daily retries retain the first actual grade. Self marks cannot erase a real failure.
  function uncertainties(s,now=Date.now()){
    const notes=new Map(),day=at=>new Date(Date.parse(at)+9*3600000).toISOString().slice(0,10);
    for(const e of (s.reviewNotes||[]).filter(e=>Date.parse(e.at)<=now).slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)))notes.set(e.problemId,e.markedAt?{...e,at:e.markedAt}:e);
    const firsts=new Set();for(const g of active(s,now).filter(e=>e.source==='semuon-grade').sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))){const key=g.problemId+'|'+day(g.at);if(firsts.has(key))continue;firsts.add(key);const note=notes.get(g.problemId);if(note?.value==='uncertain'&&g.correct&&day(g.at)>day(note.at))notes.delete(g.problemId)}
    return new Map([...notes].filter(([,e])=>e.value==='uncertain'));
  }
  function uncertaintyReasons(s,now=Date.now()){
    const latest=new Map(),ids=new Set(s.items.filter(p=>!(Number(p.source?.round)>0&&Number(p.source.round)<=105)).map(p=>p.id));
    for(const e of(s.reviewNotes||[]).filter(e=>e.value==='uncertain'&&ids.has(e.problemId)&&Date.parse(e.at)<=now).slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))){const at=e.markedAt||e.at,date=new Date(Date.parse(at)+9*3600000).toISOString().slice(0,10);latest.set(e.problemId+'|'+date,{problemId:e.problemId,date,reason:e.reason||''})}
    return [...latest.values()].filter(e=>e.reason).sort((a,b)=>b.date.localeCompare(a.date));
  }
  function questionSchedules(s,now=Date.now()){
    const day=at=>new Date((typeof at==='number'?at:Date.parse(at))+9*3600000).toISOString().slice(0,10),today=day(now),intervals=[1,3,7,14,30],byId=new Map();
    for(const e of active(s,now).slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))){if(!byId.has(e.problemId))byId.set(e.problemId,new Map());const days=byId.get(e.problemId),date=day(e.at);if(!days.has(date))days.set(date,[]);days.get(date).push(e)}
    const uncertain=uncertainties(s,now);
    return new Map(s.items.map(p=>{const days=byId.get(p.id)||new Map();let streak=0,lastDay=null;for(const[date,events]of days){const first=events.find(e=>e.source==='semuon-grade')||events[0];streak=first.correct&&!events.some(e=>!e.correct)?streak+1:0;lastDay=date}if(uncertain.has(p.id)){lastDay=[lastDay,day(uncertain.get(p.id).at)].filter(Boolean).sort().at(-1);streak=0}const interval=lastDay?intervals[Math.max(0,Math.min(streak-1,intervals.length-1))]:0,due=lastDay?new Date(Date.parse(lastDay+'T00:00:00Z')+interval*86400000).toISOString().slice(0,10):null;return[p.id,{due,interval,practicedToday:lastDay===today,available:!lastDay||lastDay!==today&&due<=today}]}));
  }
  function reviewStates(s,now){const out={theory:{history:{}},practical:{cards:{}},voucher:{cards:{}}},byProblem=new Map();for(const e of active(s,now)){if(!byProblem.has(e.problemId))byProblem.set(e.problemId,[]);byProblem.get(e.problemId).push(e.source==='semuon-self'?{...e,source:'notebook'}:e)}for(const p of s.items){const history=byProblem.get(p.id)||[];if(p.subject==='theory')out.theory.history[p.id]=history;else out[p.subject].cards[p.id]={history}}return out}
  function stats(s,now=Date.now()){
    const events=active(s,now),latest=new Map();events.slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).forEach(e=>latest.set(e.problemId,e));const good=events.filter(e=>e.correct).length;
    const firsts=new Map();for(const e of events.filter(e=>e.source==='semuon-grade').sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))){const key=e.problemId+'|'+new Date(Date.parse(e.at)+9*3600000).toISOString().slice(0,10);if(!firsts.has(key))firsts.set(key,e)}
    return{registered:s.items.length,attempts:events.length,solved:latest.size,wrong:[...latest.values()].filter(e=>!e.correct).length,rate:events.length?Math.round(good/events.length*100):null,firstRate:firsts.size?Math.round([...firsts.values()].filter(e=>e.correct).length/firsts.size*100):null};
  }
  function validateState(s,cache){
    assert(s?.examId===EXAM&&s.schemaVersion===VERSION,'다른 시험 또는 지원하지 않는 백업입니다.');assert(Array.isArray(s.items)&&Array.isArray(s.history)&&Array.isArray(s.inbox)&&s.drafts&&typeof s.drafts==='object','백업 구조를 확인해 주세요.');
    assert(Number.isInteger(s.revision)&&s.revision>=0,'저장 버전을 확인해 주세요.');
    const ids=new Map();for(const raw of s.items){const p=validateItem(raw);assert(!ids.has(p.id),'문제 ID가 중복됩니다.');ids.set(p.id,p)}
    const events=new Set();for(const e of s.history){assert(typeof e.id==='string'&&!events.has(e.id),'채점 기록 ID가 중복되거나 없습니다.');events.add(e.id);const p=ids.get(e.problemId),signature=cache&&stable(e),previous=cache?.get(e.id);if(previous&&previous.problem===p&&previous.signature===signature)continue;assert(p&&e.subject===p.subject&&e.examId===EXAM&&SOURCES.includes(e.source)&&Number.isFinite(Date.parse(e.at)),'다른 시험/출처이거나 손상된 학습기록입니다.');if(e.source==='semuon-self')assert(typeof e.correct==='boolean'&&e.input==null&&Array.isArray(e.wrongLabels)&&!e.wrongLabels.length,'직접 표시한 학습기록을 확인해 주세요.');else{const g=grade(p,e.input);assert(g.correct===e.correct&&stable(g.wrongLabels)===stable(e.wrongLabels),'답안과 채점 결과가 일치하지 않습니다.')}if(e.cancelledAt)assert(Number.isFinite(Date.parse(e.cancelledAt)),'취소 날짜를 확인해 주세요.');if(cache)cache.set(e.id,{problem:p,signature});}
    assert(s.settings&&[18,20,22,24].includes(s.settings.fontSize)&&[6,9,12].includes(s.settings.reviewLimit),'글자 크기·복습 목표 설정을 확인해 주세요.');
    for(const key of ['fontUiPt','fontBodyPt'])if(s.settings[key]!==undefined)assert(typeof s.settings[key]==='number'&&Number.isFinite(s.settings[key])&&s.settings[key]>=1&&s.settings[key]<=30,'글자 크기는 1~30pt로 입력해 주세요.');
    for(const key of ['fontUiFamily','fontBodyFamily'])if(s.settings[key]!==undefined)assert(Object.hasOwn(FONT_FAMILIES,s.settings[key]),'글꼴 설정을 확인해 주세요.');
    if(s.settings.markupShortcuts!==undefined)validateMarkupShortcuts(s.settings.markupShortcuts);
    const validPlanId=id=>typeof id==='string'&&/^v2:(?:theory:(?:fa|vat|cost|income):(?:\d{2}|extra)|practice:(?:general|voucher|vat|closing|withholding):(?:all|base|yearend)|check:(?:errors|paper|repair|final))$/.test(id);
    if(s.settings.roadmap!==undefined){const r=s.settings.roadmap;assert(r&&validStudyDate(r.startDate)&&validStudyDate(r.targetDate)&&Date.parse(r.targetDate)-Date.parse(r.startDate)>=4*86400000&&Number.isInteger(r.dailyMinutes)&&r.dailyMinutes>=15&&r.dailyMinutes<=720,'로드맵의 기간·하루 학습시간을 확인해 주세요.');if(r.plan!==undefined){const p=r.plan;assert(p&&p.version===2&&Array.isArray(p.assignments)&&p.assignments.length<=120&&new Set(p.assignments.map(t=>t?.id)).size===p.assignments.length&&p.assignments.every(t=>validPlanId(t?.id)&&Number.isInteger(t.stage)&&t.stage>=0&&t.stage<5&&Number.isInteger(t.order)&&t.order>=0&&t.order<=120),'로드맵의 범위·순서를 확인해 주세요.');}}
    if(s.roadmapTaskEvents!==undefined){assert(Array.isArray(s.roadmapTaskEvents),'로드맵 과제 기록을 확인해 주세요.');const taskIds=new Set();for(const e of s.roadmapTaskEvents){assert(e&&typeof e.id==='string'&&e.id&&!taskIds.has(e.id)&&Number.isFinite(Date.parse(e.at))&&(/^[0-5]-[0-2]$/.test(e.taskId)||validPlanId(e.taskId))&&typeof e.done==='boolean','로드맵 과제 기록을 확인해 주세요.');taskIds.add(e.id)}}
    if(s.mockExams!==undefined){assert(Array.isArray(s.mockExams),'실전 성적 목록을 확인해 주세요.');const ids=new Set();for(const e of s.mockExams){assert(e&&typeof e.id==='string'&&e.id&&!ids.has(e.id)&&Number.isFinite(Date.parse(e.at))&&validStudyDate(e.date)&&typeof e.title==='string'&&e.title.trim().length>0&&e.title.length<=100&&Number.isFinite(e.minutes)&&e.minutes>=1&&e.minutes<=720&&['fullPaper','independent','firstAttempt'].every(k=>typeof e[k]==='boolean')&&(!Object.hasOwn(e,'deleted')||typeof e.deleted==='boolean')&&Object.entries({theory:30,accounting:35,vat:20,withholding:15}).every(([k,max])=>Number.isFinite(e[k])&&e[k]>=0&&e[k]<=max),'실전 성적·배점·풀이 조건을 확인해 주세요.');ids.add(e.id)}}
    if(s.settings.examDate!==undefined){const d=s.settings.examDate;assert(typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d,'시험일을 확인해 주세요.')}
    if(s.progressEvents!==undefined){assert(Array.isArray(s.progressEvents),'진도 기록을 확인해 주세요.');const seenProgress=new Set(),limits={fa:13,cost:7,vat:8,income:6},practiceLimits={foundation:3,general:13,voucher:15,vat:10,closing:14,withholding:5,yearend:7},validDay=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;for(const e of s.progressEvents){const unit=/^(unit|practice):(fa|cost|vat|income|foundation|general|voucher|closing|withholding|yearend):(\d{2})$/.exec(e?.unitId||''),limit=unit&&(unit[1]==='unit'?limits:practiceLimits)[unit[2]];assert(e&&typeof e.id==='string'&&e.id&&!seenProgress.has(e.id)&&unit&&Number(unit[3])>=1&&Number(unit[3])<=limit&&['complete','reopen','date','review'].includes(e.action)&&Number.isFinite(Date.parse(e.at))&&(e.date===null||validDay(e.date)),'손상되거나 중복된 진도 기록입니다.');if(e.action==='review')assert(['theory','practice'].includes(e.mode)&&['done','again'].includes(e.outcome)&&validDay(e.date),'복습 기록을 확인해 주세요.');seenProgress.add(e.id)}}
    if(s.reviewNotes!==undefined){assert(Array.isArray(s.reviewNotes),'헷갈림 기록을 확인해 주세요.');const seenNotes=new Set();for(const e of s.reviewNotes){assert(e&&typeof e.id==='string'&&e.id&&!seenNotes.has(e.id)&&ids.has(e.problemId)&&['uncertain','clear'].includes(e.value)&&Number.isFinite(Date.parse(e.at)),'손상되거나 중복된 헷갈림 기록입니다.');assert((e.reason===undefined||typeof e.reason==='string'&&e.reason.length<=200)&&(e.markedAt===undefined||Number.isFinite(Date.parse(e.markedAt))&&Date.parse(e.markedAt)<=Date.parse(e.at)),'헷갈림 이유를 확인해 주세요.');seenNotes.add(e.id)}}
    if(s.studyLog!==undefined){assert(Array.isArray(s.studyLog),'학습 기록을 확인해 주세요.');const seen=new Set();for(const e of s.studyLog){validateStudyEvent(e,ids);assert(!seen.has(e.id),'학습 기록 ID가 중복됩니다.');seen.add(e.id)}}
    const validateDraft=d=>{assert(d&&validStudyDate(d.date)&&['theory','practice'].includes(d.lane)&&(d.entryId===null||typeof d.entryId==='string')&&d.values&&typeof d.values==='object'&&!Array.isArray(d.values)&&Object.entries(d.values).every(([k,v])=>['date','course','unitId','outcome','method','difficulty','focus','noteMd','pages','problemId','minutes','completeUnit','bookActivity','bookRefs'].includes(k)&&typeof v==='string'&&v.length<=12000),'작성 중인 학습 기록을 확인해 주세요.');};if(s.studyDraft!==undefined)validateDraft(s.studyDraft);if(s.studyDrafts!==undefined){assert(s.studyDrafts&&typeof s.studyDrafts==='object'&&!Array.isArray(s.studyDrafts),'작성 중인 학습 기록 목록을 확인해 주세요.');for(const[key,d]of Object.entries(s.studyDrafts)){assert(/^\d{4}-\d{2}-\d{2}:(theory|practice)$/.test(key),'학습 초안 날짜를 확인해 주세요.');validateDraft(d)}}
    if(s.settings.journalToolbar!==undefined){const t=s.settings.journalToolbar;assert(t&&t.version===1&&Array.isArray(t.order)&&Array.isArray(t.hidden)&&t.order.length===JOURNAL_TOOL_IDS.length&&new Set(t.order).size===t.order.length&&t.order.every(id=>JOURNAL_TOOL_IDS.includes(id))&&new Set(t.hidden).size===t.hidden.length&&t.hidden.every(id=>JOURNAL_TOOL_IDS.includes(id)),'학습 기록 편집 도구 설정을 확인해 주세요.');}
    const inboxIds=new Set();for(const m of s.inbox){assert(m&&typeof m.id==='string'&&!inboxIds.has(m.id)&&Number.isFinite(Date.parse(m.at)),'접수 자료 목록을 확인해 주세요.');inboxIds.add(m.id);attachments(m.evidence||[]);if(m.originalFile)attachments([m.originalFile]);}
    return s;
  }
  function stateValidator(){const cache=new Map();return s=>validateState(s,cache)}
  function merge(current,incoming){
    validateState(incoming);const next=clone(current),planned=incoming.items.length?plan(current.items,{examId:EXAM,schemaVersion:VERSION,items:incoming.items}):{add:[],duplicates:[]};next.items.push(...planned.add);
    // Resolve references of duplicate originals without duplicating events.
    const index=problemIndex(next.items),remap=new Map(incoming.items.map(p=>[p.id,index.find(p).id]));
    for(const raw of incoming.history){const e={...clone(raw),problemId:remap.get(raw.problemId)},old=next.history.find(h=>h.id===e.id);if(old){const a={...old},b={...e};delete a.cancelledAt;delete b.cancelledAt;assert(stable(a)===stable(b),'같은 채점 기록의 내용이 충돌합니다.');if(e.cancelledAt)old.cancelledAt=e.cancelledAt;}else next.history.push(e)}
    if(incoming.progressEvents?.length){const progress=new Map((next.progressEvents||[]).map(e=>[e.id,e]));for(const e of incoming.progressEvents){const old=progress.get(e.id);if(old)assert(stable(old)===stable(e),'같은 진도 기록의 내용이 충돌합니다.');else progress.set(e.id,clone(e))}next.progressEvents=[...progress.values()]}
    if(incoming.roadmapTaskEvents?.length){const tasks=new Map((next.roadmapTaskEvents||[]).map(e=>[e.id,e]));for(const e of incoming.roadmapTaskEvents){const old=tasks.get(e.id);if(old)assert(stable(old)===stable(e),'같은 로드맵 과제 기록의 내용이 충돌합니다.');else tasks.set(e.id,clone(e))}next.roadmapTaskEvents=[...tasks.values()]}
    if(incoming.reviewNotes?.length){const notes=new Map((next.reviewNotes||[]).map(e=>[e.id,e]));for(const raw of incoming.reviewNotes){const e={...clone(raw),problemId:remap.get(raw.problemId)},old=notes.get(e.id);if(old)assert(stable(old)===stable(e),'같은 헷갈림 기록의 내용이 충돌합니다.');else notes.set(e.id,e)}next.reviewNotes=[...notes.values()]}
    if(incoming.studyLog?.length){const events=new Map((next.studyLog||[]).map(e=>[e.id,e]));for(const raw of incoming.studyLog){const e=clone(raw);if(e.problemId)e.problemId=remap.get(e.problemId);const old=events.get(e.id);if(old)assert(stable(old)===stable(e),'같은 학습 기록의 내용이 충돌합니다.');else events.set(e.id,e)}next.studyLog=[...events.values()]}
    if(incoming.studyDrafts)next.studyDrafts={...clone(incoming.studyDrafts),...(next.studyDrafts||{})};
    if(!next.studyDraft&&incoming.studyDraft){next.studyDraft=clone(incoming.studyDraft);if(next.studyDraft.values.problemId)next.studyDraft.values.problemId=remap.get(next.studyDraft.values.problemId)||'';}
    if(!next.settings.journalToolbar&&incoming.settings.journalToolbar)next.settings.journalToolbar=clone(incoming.settings.journalToolbar);
    for(const material of incoming.inbox){const old=next.inbox.find(m=>m.id===material.id);if(old)assert(stable(old)===stable(material),'같은 접수 자료의 원문이 충돌합니다.');else next.inbox.push(clone(material));}
    for(const [id,draft]of Object.entries(incoming.drafts)){const key=remap.get(id);if(key&&!next.drafts[key])next.drafts[key]=clone(draft)}
    if(!next.settings.markupShortcuts&&incoming.settings.markupShortcuts)next.settings.markupShortcuts=clone(incoming.settings.markupShortcuts);
    if(!next.settings.examDate&&incoming.settings.examDate)next.settings.examDate=incoming.settings.examDate;
    if(!next.settings.roadmap&&incoming.settings.roadmap)next.settings.roadmap=clone(incoming.settings.roadmap);
    else if(!next.settings.roadmap?.plan&&incoming.settings.roadmap?.plan)next.settings.roadmap.plan=clone(incoming.settings.roadmap.plan);
    if(incoming.mockExams){const exams=new Map((next.mockExams||[]).map(e=>[e.id,e]));for(const e of incoming.mockExams){const old=exams.get(e.id);if(old){const a={...old},b={...e};delete a.deleted;delete b.deleted;assert(stable(a)===stable(b),'같은 실전 성적의 내용이 충돌합니다.');if(e.deleted)old.deleted=true}else exams.set(e.id,clone(e))}next.mockExams=[...exams.values()]}
    return next;
  }
  return{EXAM,KEY,VERSION,SUBJECTS,labels,STUDY_RESULTS,STUDY_METHODS,STUDY_DIFFICULTIES,JOURNAL_TOOL_IDS,validStudyDate,validStudyUnit,MARKUP_TOOLS,MARKUP_SHORTCUT_DEFAULTS,markupShortcuts,validateMarkupShortcuts,FONT_DEFAULTS,FONT_FAMILIES,fontPreferences,clone,norm,stable,assert,validateItem,immutableItem,stateValidator,plan,fresh,grade,active,uncertainties,uncertaintyReasons,questionSchedules,reviewStates,stats,validateState,merge,identity,fingerprint,answerSignature,broadTopics};
});
