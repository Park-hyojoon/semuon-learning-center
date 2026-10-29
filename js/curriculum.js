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
  {id:'vat',bookPage:369,chapter:4,bookTitle:'부가가치세신고서의 작성 및 전자신고',name:'부가가치세',units:[
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
  if(p.source.verified&&Array.isArray(p.source.curriculumUnits)){const ids=[...new Set(p.source.curriculumUnits)].filter(id=>byId.get(id)?.course===subject);if(ids.length){const result={subject,units:ids};cache.set(p,result);return result}}
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

 // Practical outlines share stable IDs between entry filters and personal progress.
 const practiceGroups=[
  {id:'foundation',name:'설치·기초정보·장부 조회',path:null,bookTitle:'프로그램의 설치 및 기초정보관리',bookPage:312,chapter:1,always:true,titles:['프로그램 설치·회사등록','기초정보·거래처·계정 등록','장부·자료 조회']},
  {id:'general',bookPage:316,chapter:2,bookTitle:'일반전표입력',name:'일반전표',path:'general.html',titles:['현금·예금과 현금과부족','채권·채무와 어음','유가증권 취득·처분','재고자산 거래','유형·무형자산 취득·처분','차입금·사채·장기채무','자본·자기주식','급여·퇴직연금·경비·이자','세금 납부·부가세 정산','외화 거래','보증금·선급금·선수금','입력 오류 수정','기타 일반전표']},
  {id:'voucher',bookPage:333,chapter:3,bookTitle:'매입매출전표입력',name:'매입매출전표',path:'voucher.html',titles:['매출 · 과세 세금계산서 (11)','매출 · 영세율 세금계산서 (12)','매출 · 건별 (14)','매출 · 직수출 (16)','매출 · 현금영수증 과세 (22)','매입 · 과세 세금계산서 (51)','매입 · 영세율 (52)','매입 · 면세 계산서 (53)','매입 · 매입세액 불공제 (54)','매입 · 수입 세금계산서 (55)','매입 · 신용카드 과세 (57)','매입 · 현금영수증 과세 (61)','매입 · 현금영수증 면세 (62)','예정신고 누락·전표 추가 설정','기타 매입매출전표']},
  {id:'vat',bookPage:369,chapter:4,bookTitle:'부가가치세신고서의 작성 및 전자신고',name:'부가가치세 신고 부속서류',path:'forms.html',titles:['부가가치세 신고서','공제받지 못할 매입세액·공통매입세액 정산','신용카드 매출전표 등 수령명세서','부동산 임대공급가액 명세서','영세율·수출실적 명세서','건물 등 감가상각자산 취득명세서','의제매입세액 공제신고서','대손세액 공제신고서','전자신고·마감','기타 부가가치세 부속서류']},
  {id:'closing',bookPage:416,chapter:5,bookTitle:'고정자산등록 및 결산자료의 입력',name:'결산 정리',path:'general.html',titles:['수익·비용의 발생과 이연','감가상각·무형자산 상각','대손충당금 설정','유가증권·외화 평가','기말재고·제조원가 결산','유동성 대체·계정 재분류','법인세 등 결산','이익잉여금 처분','기타 결산 정리','부가가치세 정산','퇴직급여충당부채 설정','현금과부족 정리','유형자산 재평가','고정자산 등록']},
  {id:'withholding',name:'급여·원천징수',path:'forms.html',bookTitle:'근로소득의 원천징수',bookPage:437,chapter:6,always:true,titles:['사원·부양가족 등록','급여자료·수당·공제 입력','원천징수이행상황신고서','원천징수 전자신고','급여·원천징수 자료 조회']},
  {id:'yearend',name:'연말정산',path:'forms.html',bookTitle:'연말정산기초 및 전자신고',bookPage:451,chapter:7,always:true,titles:['기초자료·전근무지 소득','부양가족·소득공제','보험료·의료비·교육비','기부금·월세·세액공제','신용카드 등 사용액','정산 결과·전자신고','연말정산 종합']}
 ];
 const practiceUnits=practiceGroups.flatMap(g=>g.titles.map((title,i)=>({id:`practice:${g.id}:${String(i+1).padStart(2,'0')}`,group:g.id,course:g.name,number:i+1,title,label:`${String(i+1).padStart(2,'0')}. ${title}`,trackOnly:g.always||g.id==='closing'&&i===13}))),practiceById=new Map(practiceUnits.map(u=>[u.id,u])),practiceCache=new WeakMap();
 function practiceGroup(p){
  if(p.subject==='theory')return null;
  const section=/^실무\s*([1-5])\s*-/.exec(p.source?.questionNo||'');
  if(section){if(section[1]==='5'){if(p.form?.kind==='yearend')return'yearend';if(['payroll','familyRegistration','withholding'].includes(p.form?.kind))return'withholding';return /연말정산/.test(p.prompt)&&!/원천징수이행/.test(p.prompt)?'yearend':'withholding';}return({1:'general',2:'voucher',3:'vat',4:'closing'})[section[1]]||null;}
  if(p.form?.kind==='yearend')return'yearend';if(['payroll','familyRegistration','withholding'].includes(p.form?.kind))return'withholding';
  if(['closing','inventoryClosing','appropriation','badDebt'].includes(p.form?.kind))return'closing';
  if(p.voucher||p.subject==='voucher'&&!p.form)return'voucher';
  if(p.form)return'vat';
  return p.subject==='practical'?'general':null;
 }
 function practiceClassify(p){
  if(practiceCache.has(p))return practiceCache.get(p);
  const group=practiceGroup(p),metadata=clean([p.type,p.source?.subtopic,...(p.tags||[])].join(' ')),accounts=(p.answers||[]).map(r=>r.account||'').join(' '),text=clean(metadata+' '+accounts+' '+(p.prompt||'')),a=clean(accounts),ids=[];
  const add=n=>ids.push(`practice:${group}:${String(n).padStart(2,'0')}`);
  if(group==='voucher'){
   const codes=['11','12','14','16','22','51','52','53','54','55','57','61','62'],index=codes.indexOf(String(p.voucher?.type||'').slice(0,2));
   if(index>=0)add(index+1);
   if(p.form?.kind==='statement'||/예정신고.*누락|누락.*예정신고/.test(text))add(14);
   if(!ids.length)add(15);
  }else if(group==='vat'){
   const map={vatReturn:1,nondeductible:2,commonInputSettlement:2,cardStatement:3,rental:4,exportStatement:5,assetAcquisition:6,deemed:7,badDebtCredit:8,badDebt:8,efile:9};add(map[p.form?.kind]||10);
  }else if(group==='withholding'){add(p.form?.kind==='familyRegistration'?1:p.form?.kind==='payroll'?2:p.form?.kind==='efile'?4:3);
  }else if(group==='yearend'){
   const t=clean(p.prompt||'');if(/전근무|전직장|소득명세/.test(t))add(1);if(/부양가족|기본공제|인적공제/.test(t))add(2);if(/보험료|의료비|교육비/.test(t))add(3);if(/기부금|월세/.test(t))add(4);if(/신용카드|카드등/.test(t))add(5);if(/전자신고/.test(t))add(6);add(7);
  }else if(group==='closing'){
   if(['closing','inventoryClosing'].includes(p.form?.kind))add(5);
   else if(p.form?.kind==='appropriation')add(8);
   else if(p.form?.kind==='badDebt'||/대손충당금/.test(a))add(3);
   else if(/감가상각|무형자산상각|상각누계/.test(a)||/당기감가상각비/.test(text))add(2);
   else if(/외화환산|단기매매증권|매도가능증권|만기보유증권/.test(a))add(4);
   else if(/법인세등|법인세비용/.test(a))add(7);
   else if(/유동성장기부채|유동성장기차입|유동성사채|장기차입금|단기차입금/.test(a))add(6);
   else if(/부가세예수금|부가세대급금/.test(a))add(10);
   else if(/퇴직급여충당부채/.test(a))add(11);
   else if(/현금과부족/.test(a))add(12);
   else if(/재평가차익|재평가손실/.test(a))add(13);
   else if(/미수수익|선수수익|미지급비용|선급비용|보험료|임차료|이자수익|이자비용|소모품/.test(a))add(1);
   else add(9);
  }else if(group==='general'){
   if(p.initialEntry||/오류.*수정|잘못.*(입력|처리)|수정분개/.test(metadata))add(12);
   else if(/외화|외환/.test(metadata)||/외화환산|외환차/.test(a)||/환율/.test(text))add(10);
   else if(/자본금|자기주식|주식발행|이익잉여금|주식배당/.test(a))add(7);
   else if(/단기매매증권|매도가능증권|만기보유증권/.test(a))add(3);
   else if(/토지|건물|기계장치|차량운반구|비품|투자부동산|건설중인자산|영업권|산업재산권|개발비|유형자산/.test(a))add(5);
   else if(/차입금|사채|장기미지급금/.test(a))add(6);
   else if(/퇴직연금|퇴직급여|급여|임금|상여금|잡급|복리후생|여비교통|접대비|기업업무추진비|교육훈련|보험료|수수료비용|광고선전|도서인쇄|소모품비|이자비용/.test(a))add(8);
   else if(/부가세예수금|부가세대급금|미지급세금|선납세금|법인세등|세금과공과|예수금/.test(a))add(9);
   else if(/보증금|선급금|선수금|가지급금|가수금/.test(a))add(11);
   else if(/외상매출금|받을어음|외상매입금|지급어음|미수금|미지급금|대여금|대손/.test(a))add(2);
   else if(/상품|제품|원재료|재공품/.test(a))add(4);
   else if(/현금과부족|보통예금|당좌예금|정기예금|현금/.test(a))add(1);
   else add(13);
  }
  const result={group,units:ids};practiceCache.set(p,result);return result;
 }
 function practiceModel(items,group,legacyValue,tagsOf,legacy){
  const course=practiceGroups.find(g=>g.id===group),children=practiceUnits.filter(u=>u.group===group&&items.some(p=>practiceClassify(p).units.includes(u.id))),rows=[{value:'',label:'전체 실무 유형'},{value:'practice:'+group,label:course.name,parent:true},...children.map((u,i)=>({value:u.id,label:String(i+1).padStart(2,'0')+'. '+u.title,child:true}))];
  const old=resolve(legacyValue||'');if(old&&!rows.some(r=>r.value===old))rows.push({section:'이전 검색 태그'},{value:old,label:old,child:true});
  const theory=model(items,tagsOf,old,legacy);
  return{rows,resolve,matches(p,value){if(!value)return true;const c=practiceClassify(p);if(practiceById.has(value))return c.units.includes(value);if(value==='practice:'+group)return c.group===group;return theory.matches(p,value)},searchText:p=>practiceClassify(p).units.map(id=>practiceById.get(id)?.title||'').join(' '),subjectFor:()=>null};
 }
 function practiceLink(unit){const g=practiceGroups.find(g=>g.id===unit.group);if(!g.path)return'pages/journal.html?unit='+encodeURIComponent(unit.id);return'pages/'+g.path+'?practice='+g.id+'&tag='+encodeURIComponent(unit.id)}
 const api={courses,units,kind,classify,resolve,model,practiceGroups,practiceUnits,practiceGroup,practiceClassify,practiceModel,practiceLink,inSubject:(p,name)=>classify(p).subject===name};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SemuonCurriculum=api;
})(globalThis);
