/* User's textbook order. Classification is a view over existing questions, not a new question bank. */
(function(root){
 'use strict';
 const clean=s=>String(s||'').replace(/\s/g,''),cache=new WeakMap();
 const courses=[
  {id:'fa',name:'재무회계',units:[
   ['회계의 기본원리',12],['재무제표 작성·표시 및 구성요소',18],['현금 및 현금성자산',26],['단기매매증권',30],['외상채권 및 대손',35],['상품매매기장·재고자산',45],['투자자산',55],['유형자산',60],['무형·기타비유동자산',69],['유동부채와 비유동부채',76],['주식회사의 자본',86],['수익과 비용 인식',97],['회계변경과 오류수정',102]
  ]},
  {id:'cost',name:'원가회계',units:[
   ['원가회계의 기본개념과 분류',108],['원가의 흐름',114],['요소별 원가회계',120],['제조간접비 배부와 개별원가계산',126],['부문별 원가계산',135],['종합원가계산',140],['공손품·작업폐물·부산물의 구분과 회계처리',151]
  ]},
  {id:'vat',name:'부가가치세',units:[
   ['부가가치세 총론',156],['과세거래',166],['영세율과 면세',176],['과세표준',184],['매입세액의 계산',191],['세금계산서',201],['신고와 납부',209],['간이과세자',220]
  ]},
  {id:'income',name:'소득세',units:[
   ['소득세 총론',221],['종합소득의 분류',229],['소득금액의 계산',262],['종합소득공제 및 과세표준 계산',268],['종합소득 산출세액·세액감면·세액공제',282],['종합소득 납부절차·원천징수·가산세',296]
  ]}
 ];
 const units=courses.flatMap(c=>c.units.map(([title,page],i)=>({id:`unit:${c.id}:${String(i+1).padStart(2,'0')}`,course:c.name,number:i+1,title,page,label:`${String(i+1).padStart(2,'0')}. ${title}`}))),byId=new Map(units.map(u=>[u.id,u]));
 const financialChapters={'회계의기본원리':[1],'재무제표':[2],'현금및현금성자산':[3],'재고자산':[6],'유형자산':[8],'무형자산':[9],'부채':[10],'사채':[10],'충당부채와우발부채':[10],'퇴직급여':[10],'자본':[11],'수익인식':[12],'회계변경과오류수정':[13]};
 const reviewedUnits={'tax2-119-a-theory-07':['unit:cost:02'],'tax2-125-a-theory-14':['unit:income:02','unit:income:05']};
 function kind(p){if(p.source.kind==='application-practice')return'application';if(p.source.kind==='chapter-practice')return'chapter';if(p.source.round)return'exam';return'other'}
 function primary(p){
  if(courses.some(c=>c.name===p.source.category))return p.source.category;
  const no=/^이론\s*(\d+)$/.exec(p.source.questionNo||'');
  if(p.subject==='theory'&&p.source.round&&no){const n=Number(no[1]);if(n>=1&&n<=10)return n<=5?'재무회계':'원가회계'}
  if(p.subject==='practical'&&!p.form&&/퇴직연금|퇴직급여/.test(p.prompt))return'재무회계';
  if(p.subject==='voucher'||/부가가치세|부가세/.test(p.type))return'부가가치세';
  if(p.subject==='practical'&&p.form?.kind==='closing')return'재무회계';
  if(p.subject==='practical'&&!p.form){if(/원천징수|원천세/.test(p.prompt)&&/소득세|급여|강사|강의/.test(p.prompt))return'소득세';return'재무회계'}
  if(/소득세|급여|연말정산|원천징수/.test(p.type)||['yearend','familyRegistration','payroll','withholding'].includes(p.form?.kind))return'소득세';
  if(/소득세법/.test(p.prompt))return'소득세';if(/부가가치세법/.test(p.prompt))return'부가가치세';
  if(p.subject==='theory'&&p.source.round&&no&&Number(no[1])>=11){if(/소득|원천징수/.test(p.prompt))return'소득세';if(/세금계산서|매입세액|영세율|과세표준/.test(p.prompt))return'부가가치세';return Number(no[1])<=13?'부가가치세':'소득세'}
  if(/유형자산|무형자산|재고자산|자본|사채|유가증권/.test(p.type))return'재무회계';
  if(/원가|공손|제조간접/.test(p.type))return'원가회계';return'재무회계';
 }
 function classify(p){
  if(cache.has(p))return cache.get(p);const subject=primary(p),course=courses.find(c=>c.name===subject),stem=clean((p.prompt||'').split(/[①②③④]/)[0].replace(/\[그림:[^\]]+\]/g,'')),metadata=clean([p.type,p.source.chapter,p.source.subtopic,...(p.tags||[])].join(' ')),s=stem+' '+metadata,found=new Set(),add=n=>found.add(`unit:${course.id}:${String(n).padStart(2,'0')}`);
  if(reviewedUnits[p.id]){const result={subject,units:reviewedUnits[p.id]};cache.set(p,result);return result}
  if(subject==='재무회계'){
   const confirmed=financialChapters[clean(p.source.chapter)];if(confirmed)confirmed.forEach(add);
   else{
    if(/기본원리|기본가정|기본공준|재무보고|질적특성|회계의목적|기업실체|계속기업|중요성|보수주의|재무회계에관한설명/.test(s))add(1);
    if(/현금및현금성|현금성자산|현금과부족|당좌예금|당좌차월|정기예금.*만기|예금만기|정기적금/.test(s))add(3);
    if(/단기매매증권/.test(s))add(4);
    if(/외상채권|매출채권|외상매출|받을어음|대손|부도어음|어음.*배서|채권.*회수/.test(s))add(5);
    if(/재고자산|기말재고|제품.*재고|상품매매|매출원가|원재료|재공품|상품/.test(s))add(6);
    if(/매도가능|만기보유|투자자산|투자부동산|장기대여|장기투자|임차보증금|투자목적.*(토지|건물)|외화.*대여/.test(s))add(7);
    if(/유형자산|감가상각|자본적지출|수익적지출|기계장치|차량운반구|건물.*취득|정부보조금/.test(s))add(8);
    if(/무형자산|영업권|개발비|기타비유동자산/.test(s))add(9);
    if(/충당부채|우발부채|부채|차입금|사채|퇴직급여|퇴직연금|선수금|미지급금|외상매입금|채무면제/.test(s))add(10);
    if(/자본(?!적)|자기주식|이익잉여금|주식발행|주식배당|자본잉여금/.test(s))add(11);
    if(/수익인식|수익.*측정|수익과비용|비용인식|수익비용대응|공사진행률|공사이익|미수수익|선수수익|이자수익|이자비용|광고선전|선급비용|미지급비용|매출할인|기부금|복리후생|교육훈련|여비교통|보험료|세금과공과|경비지출|전액비용|법인세|퇴직연금.*불입|관리부문.*급여|판매비.*관리비|사무용품|출장비|접대비|도서인쇄|실무서적|재산세|자동차세|등록면허세|식사.*대금/.test(s))add(12);
    if(/회계변경|오류수정|회계정책|회계추정|결산오류/.test(s))add(13);
    if(/유가증권|금융자산/.test(s)&&!found.has('unit:fa:04')&&!found.has('unit:fa:07')){add(4);add(7)}
    if(!found.size&&/재무제표|재무상태표|손익계산서|자산.*분류|부채.*분류|당좌자산|유동자산/.test(s))add(2);
   }
   if(!found.size){const accounts=(p.answers||[]).map(r=>r.account).join(' ');if(/단기매매증권/.test(accounts))add(4);if(/매출채권|외상매출금|받을어음|대손/.test(accounts))add(5);if(/상품|제품|원재료|재공품/.test(accounts))add(6);if(/매도가능|만기보유|대여금|임차보증금/.test(accounts))add(7);if(/유형자산|기계장치|차량운반구|건물|토지|비품/.test(accounts))add(8);if(/무형자산|영업권|개발비/.test(accounts))add(9);if(/차입금|사채|미지급금|외상매입금|선수금|예수금/.test(accounts))add(10);if(/자본금|자기주식|이익잉여금/.test(accounts))add(11);if(/수익|비용|급여|임금|소모품비|복리후생비|광고선전비|수수료비용/.test(accounts))add(12)}
  }else if(subject==='원가회계'){
   if(/공손|작업폐물|부산물|감손|결합원가|연산품/.test(s))add(7);
   else if(/보조부문|부문별|부문공통비|상호배부|직접배분|직접배부법|단계배분|단계배부/.test(s))add(5);
   else if(/종합원가|완성품환산|공정별|가공비완성도/.test(s))add(6);
   else if(/제조간접|배부차이|배부율|개별원가|작업원가표|제조지시/.test(s))add(4);
   else if(/고정원가|변동원가|고정비|변동비|매몰|기회비용|기회원가|원가행태|원가의행태|원가의분류|원가분류|원가의개념|원가개념|원가특성|회피가능|관련원가|원가회계의목적|원가에대한설명/.test(s))add(1);
   else if(/요소별|재료비|노무비|노무원가|재료원가|임금|제조경비/.test(s))add(3);
   else if(/원가.*흐름|원가집계|원재료|재공품|총제조원가|제품제조원가|제조원가명세|매출원가/.test(s))add(2);
   else if(/제조원가구분|제조원가|기초원가|가공원가/.test(s))add(3);
  }else if(subject==='부가가치세'){
   const general=/부가가치세총론|사업자등록|사업장|총괄납부|사업자단위|납세의무|부가가치세.*특징|과세기간/.test(s);
   if(general)add(1);
   if(/간이과세/.test(s))add(8);
   if(/영세율|면세|직수출|수출/.test(s)||['12.영세','16.수출','52.영세','53.면세'].includes(p.voucher?.type))add(3);
   if(/매입세액|불공제|의제매입|공통매입|겸영|안분|매입.*공제|재계산/.test(s)||p.voucher&&Number(p.voucher.type.slice(0,2))>=50)add(5);
   if(/수정세금계산서|세금계산서.*(발급|발행|교부|기재|설명)|전자세금계산서.*전송|영수증.*발급/.test(s))add(6);
   if(!general&&(/신고|납부|환급|가산세|명세서|조기환급|대손세액|세액공제/.test(s)||p.form))add(7);
   if(/과세표준|매출세액|에누리|연체이자|수출.*환율/.test(s)||p.subject==='voucher'&&Number(p.voucher?.type?.slice(0,2))<50)add(4);
   if(/과세대상|공급시기|공급장소|간주공급|사업상증여|자가공급|재화의공급|용역의공급/.test(s))add(2);
   if(/예정고지/.test(s))add(7);if(/과세.*임대면적/.test(s))add(3);if(!found.size&&/부가가치세.*설명/.test(s))add(1);
  }else{
   if(/소득세.*(특징|과세체계|과세방법|납세|과세기간)|개인단위|종합과세|분리과세|거주자|비거주자/.test(s))add(1);
   if(/소득구분|종합소득에대한|이자소득|배당소득|사업소득|근로소득|기타소득|연금소득|퇴직소득|비과세|수입시기|주택임대소득|부동산임대업/.test(s))add(2);
   if(/소득금액|필요경비|총수입금액|수입금액|결손금|근로소득공제/.test(s))add(3);
   if(/소득공제|인적공제|부양가족|기본공제|추가공제|한부모|부녀자|연금보험료|과세표준/.test(s)||p.form?.kind==='familyRegistration')add(4);
   if(/산출세액|세액공제|세액감면|의료비|교육비|기부금|월세액|세율/.test(s))add(5);
   if(/원천징수|원천세|지급명세|신고|납부|예납|가산세|급여|연말정산|예수금/.test(s)||['payroll','yearend','withholding'].includes(p.form?.kind))add(6);
   if(!found.size&&/종합소득세|소득세의/.test(s))add(1);
  }
  const result={subject,units:[...found]};cache.set(p,result);return result;
 }
 const aliases={'회계의 기본원리':'fa:01','재무제표':'fa:02','현금 및 현금성자산':'fa:03','현금및현금성자산':'fa:03','재고자산':'fa:06','유형자산':'fa:08','무형자산':'fa:09','사채':'fa:10','부채':'fa:10','퇴직급여':'fa:10','충당부채·우발부채':'fa:10','자본':'fa:11','수익·비용':'fa:12','수익인식':'fa:12','회계변경·오류수정':'fa:13','회계변경과 오류수정':'fa:13','부가가치세 총론':'vat:01','영세율·면세':'vat:03','매입세액·세액공제':'vat:05','세금계산서·증빙':'vat:06','부가가치세 신고·납부':'vat:07'};
 function resolve(value){return aliases[value]?'unit:'+aliases[value]:value}
 function model(items,tagsOf,legacyValue,legacy){
  const rows=[{value:'',label:'전체 단원'}];for(const course of courses){rows.push({value:course.name,label:course.name,parent:true});for(const unit of units.filter(u=>u.course===course.name))rows.push({value:unit.id,label:unit.label,child:true})}
  const collections=[...new Set(items.flatMap(tagsOf).filter(t=>/기출.*문항/.test(t)))];if(collections.length){rows.push({section:'학습 모음'});collections.forEach(value=>rows.push({value,label:value,child:true}))}
  const old=resolve(legacyValue||'');if(old&&!rows.some(r=>r.value===old)){rows.push({section:'이전 검색 태그'},{value:old,label:old,child:true})}
  return{rows,resolve,matches(p,value){if(!value)return true;const c=classify(p);if(byId.has(value))return c.units.includes(value);if(courses.some(x=>x.name===value))return c.subject===value;return legacy.matches(p,value)},searchText:p=>classify(p).units.map(id=>{const u=byId.get(id);return u.course+' '+u.title}).join(' '),subjectFor:value=>byId.get(value)?.course||(courses.some(c=>c.name===value)?value:null)};
 }
 const api={courses,units,kind,classify,resolve,model,inSubject:(p,name)=>classify(p).subject===name};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SemuonCurriculum=api;
})(globalThis);
