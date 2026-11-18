(function (root) {
 'use strict';
 // Keep assigned IDs when editing or reordering questions so review history follows the card.

 function withholdingQuizQuestions(deductions){
  if(!deductions)return [{
   topic:'급여자료입력',
   id:'taxquiz-001',
   prompt:'이번 달 급여에 새 수당을 추가하려고 합니다. [수당·공제등록]에서 먼저 구분할 것은 무엇인가요?',
   choices:[['taxable','과세 대상 수당인지, 비과세 수당인지'],['dependents','부양가족이 기본공제 대상인지'],['deduction','의료비가 세액공제 대상인지']],
   answers:['taxable'],
   solution:'과세 대상 수당인지, 비과세 수당인지',
   explanation:'급여에 새 수당을 반영하기 전에 해당 수당의 과세 구분을 먼저 확인합니다.',
   reference:{bookPage:129,pdfPage:146}
  }];
  const judgment=[['','선택'],['yes','가능'],['no','불가']];
  return [
   {
    topic:'기본공제 · 숫자 입력',
    id:'taxquiz-002',
    prompt:'부양가족 기본공제의 소득 기준과 공제액을 각각 만 원 단위로 입력하세요.',
    fields:[{label:'연간 소득금액 기준'},{label:'근로소득만 있는 경우 총급여 기준'},{label:'대상자 1명당 기본공제액'}],
    answers:[100,500,150],
    solution:'소득금액 100만 원 이하 / 총급여 500만 원 이하 / 기본공제액 150만 원',
    explanation:'앞의 두 수치는 소득 요건을 판단하는 기준입니다. 150만 원은 요건을 충족하는 대상자 1명당 공제하는 금액입니다.',
    articles:[50]
   },
   {
    topic:'기본공제 · 경계값 판단',
    id:'taxquiz-003',
    prompt:'어머니에게 근로소득만 있고, 기본공제의 나머지 요건은 모두 충족합니다. 총급여가 다음과 같을 때 각각 기본공제를 받을 수 있나요?',
    fields:[{label:'총급여 500만 원',options:judgment},{label:'총급여 501만 원',options:judgment}],
    answers:['yes','no'],
    solution:'500만 원은 가능 / 501만 원은 불가',
    explanation:'근로소득만 있는 경우 총급여 500만 원까지 포함하므로, 501만 원은 한도를 넘습니다.',
    articles:[50]
   },
   {
    topic:'장애인 추가공제 · 금액 입력',
    id:'taxquiz-004',
    prompt:'어머니가 기본공제 대상이며 세법상 장애인에 해당합니다. 어머니 한 분의 기본공제액과 장애인 추가공제액을 각각 만 원 단위로 입력하세요.',
    fields:[{label:'기본공제액'},{label:'장애인 추가공제액'}],
    answers:[150,200],
    solution:'기본공제 150만 원 + 장애인 추가공제 200만 원 = 350만 원',
    explanation:'기본공제 대상인 어머니가 장애인 요건도 충족하므로, 기본공제에 추가공제액을 더합니다.',
    articles:[50,51]
   },
   {
    topic:'부녀자 추가공제 · 조건 비교',
    id:'taxquiz-005',
    prompt:'두 여성 거주자 모두 종합소득금액이 2,900만 원이고 배우자가 없으며, 기본공제 대상인 어머니를 부양합니다. 한 사람만 세대주입니다. 각자의 부녀자 추가공제액을 만 원 단위로 입력하세요. 대상이 아니면 0을 입력하세요.',
    fields:[{label:'세대주인 경우'},{label:'세대주가 아닌 경우'}],
    answers:[50,0],
    solution:'세대주 50만 원 / 세대주가 아니면 0원',
    explanation:'종합소득금액이 3,000만 원 이하이고 배우자가 없는 여성은 기본공제 대상 부양가족이 있는 세대주여야 합니다. 배우자가 있는 여성에게는 이 세대주 요건이 적용되지 않습니다.',
    articles:[51]
   }
  ];
 }
 function basicQuestions(course){
  if(course==='withholding'){
   const [registration]=withholdingQuizQuestions(false);
   const payroll={unit:'급여자료입력',detail:'비과세',reference:{bookPage:129,pdfPage:146}};
   return [
    {...registration,unit:payroll.unit,detail:'수당·공제 등록'},
    {
     ...payroll,topic:'식대 · 금액 입력',
     id:'taxquiz-006',
     prompt:'회사에서 식사를 제공받지 않는 직원에게 이번 달 식대 23만 원을 현금으로 지급했습니다. 비과세 금액과 과세 금액을 만 원 단위로 각각 입력하세요.',
     fields:[{label:'비과세 식대'},{label:'과세 식대'}],answers:[20,3],
     solution:'비과세 20만 원 / 과세 3만 원',
     explanation:'식사를 제공받지 않는 직원의 현금 식대는 월 20만 원까지 비과세입니다.',
     articles:[12]
    },
    {
     ...payroll,topic:'식대 · 조건 비교',
     id:'taxquiz-007',
     prompt:'A와 B는 모두 현금 식대 18만 원을 받았습니다. A는 회사에서 식사를 제공받고 B는 제공받지 않습니다. 두 사람의 현금 식대 중 비과세 금액을 만 원 단위로 각각 입력하세요.',
     fields:[{label:'A의 비과세 식대'},{label:'B의 비과세 식대'}],answers:[0,18],
     solution:'A 0원 / B 18만 원',
     explanation:'현금 식대의 비과세 여부는 금액뿐 아니라 식사를 제공받는지도 확인해야 합니다.',
     articles:[12]
    },
    {
     ...payroll,topic:'자가운전보조금 · 요건 적용',
     id:'taxquiz-008',
     prompt:'직원이 본인 차량을 직접 운전해 회사 업무에 사용합니다. 회사 지급 기준에 따라 실제 시내 출장비를 정산받는 대신 월 25만 원을 받았다면, 비과세 금액과 과세 금액은 각각 몇 만 원인가요?',
     fields:[{label:'비과세 자가운전보조금'},{label:'과세 자가운전보조금'}],answers:[20,5],
     solution:'비과세 20만 원 / 과세 5만 원',
     explanation:'본인 차량으로 업무를 수행하고 실제 여비 대신 규정에 따라 지급받는 등 요건을 충족하면 월 20만 원까지 비과세입니다.',
     articles:['vehicle']
    },
    ...withholdingQuizQuestions(true).map((question,i)=>({...question,unit:'사원등록',detail:i<2?'기본공제':'추가공제'})),
    {
     id:'taxquiz-045',sample:'employee',unit:'사원등록',detail:'기본공제 대상 판단',topic:'사원등록 · 기본공제 대상 판단',
     prompt:'기본공제 대상 여부와 판단 이유를 고르세요.',
     facts:[['관계 · 나이','아버지 · 만 65세'],['소득 종류','일반 근로소득만'],['연간 총급여','501만 원']],
     condition:'생계 등 다른 요건은 충족하며, 총급여에서 비과세 급여는 제외했습니다.',
     fields:[
      {label:'기본공제 대상 여부',options:[['','선택'],['yes','공제 가능'],['no','공제 불가']]},
      {label:'판단의 결정적인 이유',options:[['','선택'],['age','나이 요건'],['income','소득 요건'],['relation','가족관계 요건']]}
     ],
     answers:['no','income'],solution:'공제 불가 · 소득 요건을 충족하지 못합니다.',
     explanation:'나이 요건(만 60세 이상)은 충족하지만, 근로소득만 있을 때의 총급여 한도 500만 원을 초과하므로 기본공제 불가입니다.',
     reference:{bookPage:126,pdfPage:143},articles:[50]
    },
    {
     unit:'연말정산 추가자료입력',detail:'의료비 세액공제',topic:'의료비 · 기준과 금액 입력',
     id:'taxquiz-009',
     prompt:'총급여 4,000만 원인 근로자가 일반 의료비로 인정되는 금액 180만 원을 지출했습니다. 다른 의료비나 환급액은 없습니다. 총급여의 3%에 해당하는 기준액과 그 기준을 넘는 일반 의료비를 만 원 단위로 입력하세요.',
     fields:[{label:'총급여의 3% 기준액'},{label:'기준을 초과한 일반 의료비'}],answers:[120,60],
     solution:'기준액 120만 원 / 초과 의료비 60만 원',
     explanation:'4,000만 원의 3%인 120만 원을 의료비 180만 원에서 뺍니다. 60만 원은 공제율을 적용하기 전 금액입니다.',
     reference:{bookPage:132,pdfPage:149},articles:['medical']
    }
   ];
  }
  const finance={unit:'이자소득',detail:'종합과세·분리과세',reference:{bookPage:74,pdfPage:85},articles:[14]};
  const method=[['','선택'],['combined','종합과세'],['separate','분리과세']];
  const other={unit:'기타소득',reference:{bookPage:77,pdfPage:88}};
  return [
   {
    ...finance,alsoUnits:['배당소득'],topic:'금융소득 · 경계값 판단',
    id:'taxquiz-010',
    prompt:'거주자의 국내에서 원천징수된 일반 이자·배당소득만 있다고 가정합니다. 두 경우에 금융소득을 각각 어떻게 과세하나요?',
    fields:[{label:'이자·배당 합계 2,000만 원',options:method},{label:'이자·배당 합계 2,001만 원',options:method}],
    answers:['separate','combined'],solution:'2,000만 원은 분리과세 / 2,001만 원은 종합과세',
    explanation:'이 유형의 금융소득은 원천징수되었고 연간 합계가 2,000만 원 이하일 때 분리과세됩니다.'
   },
   {
    ...finance,topic:'금융소득 · 원천징수 여부 비교',
    id:'taxquiz-011',
    prompt:'두 거주자의 금융소득은 일반 이자소득 1,800만 원뿐입니다. A는 국내에서 원천징수됐고, B는 국외 예금 이자를 받아 국내에서 원천징수되지 않았습니다. 각각 과세방법을 고르세요.',
    fields:[{label:'A의 이자소득',options:method},{label:'B의 이자소득',options:method}],
    answers:['separate','combined'],solution:'A는 분리과세 / B는 종합과세',
    explanation:'국내에서 원천징수되지 않은 이 사례의 국외 이자는 금융소득 합계가 2,000만 원 이하라도 종합과세 대상입니다.'
   },
   {
    ...other,detail:'소득금액 계산',topic:'기타소득금액 · 금액 입력',
    id:'taxquiz-012',
    prompt:'일회성 강연의 기타소득 총수입금액은 240만 원입니다. 세법상 인정되는 필요경비가 144만 원일 때 기타소득금액을 만 원 단위로 입력하세요.',
    fields:[{label:'기타소득금액'}],answers:[96],solution:'96만 원',
    explanation:'총수입금액 240만 원에서 필요경비 144만 원을 뺍니다.',articles:[21]
   },
   {
    ...other,detail:'종합과세·분리과세',topic:'기타소득 · 선택적 분리과세',
    id:'taxquiz-013',
    prompt:'원천징수된 일회성 강연료에서 필요경비를 빼고 남은 연간 기타소득금액이 각각 300만 원, 301만 원입니다. 두 경우에 분리과세를 선택할 수 있는지 고르세요.',
    fields:[300,301].map(value=>({label:'기타소득금액 '+value+'만 원',options:[['','선택'],['yes','선택 가능'],['no','선택 불가']]})),
    answers:['yes','no'],solution:'300만 원은 선택 가능 / 301만 원은 선택 불가',
    explanation:'이 사례는 필요경비를 뺀 금액이 300만 원 이하일 때 분리과세를 선택할 수 있습니다.',articles:[14]
   },
   {
    unit:'근로소득',detail:'수입 시기',topic:'급여 · 귀속연도 판단',
    id:'taxquiz-014',
    prompt:'정기 급여를 받는 직원이 2025년 12월에 일했습니다. 이 12월분 일반 급여를 2026년 1월에 받았다면 어느 연도의 근로소득인가요?',
    fields:[{label:'급여 귀속연도',options:[['','선택'],['2025','2025년'],['2026','2026년']]}],
    answers:['2025'],solution:'2025년',
    explanation:'일반 급여의 수입 시기는 근로를 제공한 날을 기준으로 봅니다.',
    reference:{bookPage:76,pdfPage:87},articles:['salary']
   }
  ];
 }

 const units={
  income:['근로소득','연금소득','기타소득','이자소득','배당소득','사업소득'],
  withholding:['급여자료입력','사원등록','연말정산 추가자료입력']
 };
 const levels=[
  {id:'basic',label:'기초',option:'기초 · 셀파',parkShare:0},
  {id:'applied',label:'적용',option:'적용 · 셀파 + 박문각',parkShare:0.5},
  {id:'advanced',label:'심화',option:'심화 · 박문각 중심',parkShare:0.75}
 ];
 const books={
  income:{label:'셀파 소득세법',file:'01. 학습/(셀파)_이론+실무_OCR.pdf'},
  withholding:{label:'셀파 실무 교재',file:'01. 학습/(셀파)_이론+실무_OCR.pdf'},
  park:{label:'박문각 교재',file:'01. 학습/04. 소득세/소득세_20261028_OCR.pdf'}
 };

 const selpaIncome=bookPage=>({bookPage,pdfPage:bookPage+11});
 const selpaPractice=(bookPage,pdfPage)=>({bookPage,pdfPage});
 const parkReference=bookPage=>({bookPage,pdfPage:bookPage-220});
 const years=[['','선택'],['2026','2026년'],['2027','2027년']];
 const judgment=[['','선택'],['yes','가능'],['no','불가']];
 const method=[['','선택'],['combined','종합과세'],['separate','분리과세']];

 const extraIncomeBasics=[
  {
   unit:'연금소득',detail:'소득금액 계산',topic:'연금소득 · 공제와 소득금액',
   id:'taxquiz-015',
   prompt:'종합과세 대상 총연금액이 500만 원입니다. 연금소득공제액과 연금소득금액을 각각 만 원 단위로 입력하세요.',
   fields:[{label:'연금소득공제액'},{label:'연금소득금액'}],answers:[410,90],
   solution:'공제액 410만 원 / 연금소득금액 90만 원',
   explanation:'350만 원에 초과분 150만 원의 40%를 더하면 공제액은 410만 원입니다. 총연금액에서 이를 빼면 90만 원입니다.',
   reference:selpaIncome(76),articles:['pensionDeduction']
  },
  {
   unit:'연금소득',detail:'수입 시기',topic:'공적연금과 사적연금 · 수입 시기 비교',
   id:'taxquiz-016',
   prompt:'공적연금은 2026년 12월에 지급받기로 했지만 2027년 1월에 받았습니다. 별도로 연금계좌에서도 2027년 1월에 정상적으로 연금을 인출했습니다. 각각 어느 연도의 연금소득인지 고르세요.',
   fields:[{label:'공적연금 귀속연도',options:years},{label:'연금계좌 연금 귀속연도',options:years}],answers:['2026','2027'],
   solution:'공적연금 2026년 / 연금계좌 연금 2027년',
   explanation:'공적연금은 지급받기로 한 날, 연금계좌에서 연금으로 인출한 금액은 수령한 날이 기준입니다.',
   reference:selpaIncome(76),articles:['pensionTiming']
  },
  {
   unit:'배당소득',detail:'수입 시기',topic:'잉여금 처분 배당 · 기준일',
   id:'taxquiz-017',
   prompt:'일반 기명주식에 대한 잉여금 처분 배당은 어느 날을 수입 시기로 보나요?',
   choices:[['resolution','잉여금 처분결의일'],['payment','배당금 송금일'],['record','주주명부 기준일']],
   answers:['resolution'],solution:'잉여금 처분결의일',
   explanation:'이 배당은 법인이 잉여금 처분을 결의한 날을 기준으로 합니다.',
   reference:selpaIncome(73),articles:['dividendTiming']
  },
  {
   unit:'사업소득',detail:'소득금액 계산',topic:'사업소득금액 · 금액 입력',
   id:'taxquiz-018',
   prompt:'개인사업자의 총수입금액이 3,600만 원이고 인정되는 필요경비가 1,440만 원입니다. 사업소득금액을 만 원 단위로 입력하세요.',
   fields:[{label:'사업소득금액'}],answers:[2160],solution:'2,160만 원',
   explanation:'총수입금액 3,600만 원에서 필요경비 1,440만 원을 뺍니다.',
   reference:selpaIncome(74),articles:[19]
  },
  {
   unit:'사업소득',detail:'소득금액 계산',topic:'사업소득 · 결손금',
   id:'taxquiz-019',
   prompt:'개인사업자의 연간 총수입금액은 860만 원이고 인정되는 필요경비는 930만 원입니다. 이 사업에서 생긴 결손금의 크기를 만 원 단위로 입력하세요.',
   fields:[{label:'결손금'}],answers:[70],solution:'70만 원',
   explanation:'필요경비가 총수입금액을 70만 원 초과하므로 결손금은 70만 원입니다.',
   reference:selpaIncome(74),articles:[19]
  }
 ];

 const incomeApplied=[
  {
   unit:'근로소득',detail:'소득금액 계산',topic:'근로소득 · 비과세분 제외 후 공제',
   id:'taxquiz-020',
   prompt:'근로자가 한 해 동안 받은 급여의 합계는 3,180만 원이고, 그중 비과세로 확정된 식대가 180만 원입니다. 총급여액과 근로소득금액을 만 원 단위로 각각 입력하세요.',
   fields:[{label:'총급여액'},{label:'근로소득금액'}],answers:[3000,2025],
   solution:'총급여액 3,000만 원 / 근로소득금액 2,025만 원',
   explanation:'비과세 식대를 빼면 총급여액은 3,000만 원입니다. 여기서 근로소득공제 975만 원을 뺍니다.',
   reference:selpaIncome(75),articles:[47]
  },
  {
   unit:'연금소득',detail:'소득금액 계산',topic:'연금소득 · 비과세분과 공제 구간',
   id:'taxquiz-021',
   prompt:'받은 연금 합계가 900만 원입니다. 이 중 100만 원은 비과세이고 나머지는 종합과세 대상입니다. 연금소득공제액과 연금소득금액을 만 원 단위로 각각 입력하세요.',
   fields:[{label:'연금소득공제액'},{label:'연금소득금액'}],answers:[510,290],
   solution:'공제액 510만 원 / 연금소득금액 290만 원',
   explanation:'공제 계산의 기준은 800만 원입니다. 490만 원에 700만 원 초과분의 20%를 더한 510만 원을 공제합니다.',
   reference:selpaIncome(76),articles:['pensionDeduction']
  },
  {
   unit:'기타소득',detail:'소득금액 계산',topic:'강연료 · 실제 필요경비 비교',
   id:'taxquiz-022',
   prompt:'고용관계 없이 한 차례 강연해 500만 원을 받았습니다. 입증된 실제 필요경비는 330만 원입니다. 인정할 필요경비와 기타소득금액을 만 원 단위로 입력하세요.',
   fields:[{label:'인정 필요경비'},{label:'기타소득금액'}],answers:[330,170],
   solution:'필요경비 330만 원 / 기타소득금액 170만 원',
   explanation:'이 강연료에는 수입금액의 60%인 300만 원과 실제 필요경비 330만 원 중 큰 금액을 적용합니다.',
   book:'park',reference:parkReference(249),articles:[21,'otherExpense']
  },
  {
   unit:'이자소득',detail:'수입 시기',topic:'채권과 정기예금 · 귀속연도 비교',
   id:'taxquiz-023',
   prompt:'기명채권 이자의 약정 지급일은 2026년 12월이고 실제 지급은 2027년 1월입니다. 일반 정기예금 이자는 특약 없이 2027년 1월에 받았습니다. 각각 귀속연도를 고르세요.',
   fields:[{label:'기명채권 이자',options:years},{label:'정기예금 이자',options:years}],answers:['2026','2027'],
   solution:'기명채권 2026년 / 정기예금 2027년',
   explanation:'기명채권 이자는 약정 지급일, 이 사례의 정기예금 이자는 실제 지급일이 기준입니다.',
   book:'park',reference:parkReference(230),articles:['interestTiming']
  },
  {
   unit:'배당소득',detail:'수입 시기',topic:'기명·무기명주식 배당 · 귀속연도 비교',
   id:'taxquiz-024',
   prompt:'A는 기명주식 잉여금 처분 배당이 2026년 12월에 결의되어 2027년 1월에 받았습니다. B는 무기명주식의 배당을 2027년 1월에 받았습니다. 각 배당소득의 귀속연도를 고르세요.',
   fields:[{label:'A의 배당소득',options:years},{label:'B의 배당소득',options:years}],answers:['2026','2027'],
   solution:'A는 2026년 / B는 2027년',
   explanation:'A는 잉여금 처분결의일, B는 배당금을 실제로 지급받은 날을 기준으로 합니다.',
   reference:selpaIncome(73),articles:['dividendTiming']
  },
  {
   unit:'사업소득',detail:'수입 시기',topic:'인적용역 · 완료일과 지급약정 비교',
   id:'taxquiz-025',
   prompt:'독립적으로 계속 인적용역을 하는 사업자가 2026년 12월에 용역을 마쳤습니다. 용역대가의 약정 지급일과 실제 입금일은 모두 2027년 1월입니다. 이 대가의 귀속연도를 고르세요.',
   fields:[{label:'사업소득 귀속연도',options:years}],answers:['2026'],solution:'2026년',
   explanation:'이 사례의 인적용역 사업소득은 약정 지급일과 용역 완료일 중 앞선 날에 귀속됩니다.',
   book:'park',reference:parkReference(238),articles:['businessTiming']
  }
 ];

 const incomeAdvanced=[
  {
   unit:'근로소득',detail:'소득금액 계산',topic:'근로소득 · 공제 한도 적용',
   id:'taxquiz-026',
   prompt:'일반 근로자의 총급여액은 4억 원입니다. 공제 한도를 적용한 뒤의 근로소득공제액과 근로소득금액을 만 원 단위로 입력하세요.',
   fields:[{label:'한도 적용 후 공제액'},{label:'근로소득금액'}],answers:[2000,38000],
   solution:'근로소득공제 2,000만 원 / 근로소득금액 38,000만 원',
   explanation:'구간별 계산 결과는 2,075만 원이지만 공제 한도인 2,000만 원까지만 뺍니다.',
   book:'park',reference:parkReference(243),articles:[47]
  },
  {
   unit:'연금소득',detail:'소득금액 계산',topic:'연금소득 · 공제 한도 적용',
   id:'taxquiz-027',
   prompt:'비과세분과 분리과세분을 제외한 총연금액이 5,000만 원입니다. 공제 한도를 적용한 연금소득공제액과 연금소득금액을 만 원 단위로 입력하세요.',
   fields:[{label:'한도 적용 후 공제액'},{label:'연금소득금액'}],answers:[900,4100],
   solution:'연금소득공제 900만 원 / 연금소득금액 4,100만 원',
   explanation:'구간별 계산은 630만 원에 초과분 3,600만 원의 10%를 더한 990만 원입니다. 한도인 900만 원까지만 공제합니다.',
   book:'park',reference:parkReference(246),articles:['pensionDeduction']
  },
  {
   unit:'기타소득',detail:'종합과세·분리과세',topic:'강연료 · 필요경비와 분리과세 선택',
   id:'taxquiz-028',
   prompt:'원천징수된 일회성 강연료 750만 원이 유일한 기타소득입니다. 실제 필요경비 470만 원이 입증됐습니다. 기타소득금액을 만 원 단위로 쓰고 분리과세 선택 가능 여부를 고르세요.',
   fields:[{label:'기타소득금액'},{label:'분리과세 선택',options:judgment}],answers:[280,'yes'],
   solution:'기타소득금액 280만 원 / 분리과세 선택 가능',
   explanation:'정률로 계산한 경비 450만 원보다 실제 경비 470만 원이 큽니다. 이를 빼면 원천징수된 기타소득금액이 300만 원 이하입니다.',
   book:'park',reference:parkReference(249),articles:[14,'otherExpense']
  },
  {
   unit:'이자소득',detail:'종합과세·분리과세',topic:'금융소득 · 기준금액에서 제외하는 항목',
   id:'taxquiz-029',
   prompt:'거주자가 국내에서 원천징수된 일반 예금 이자 1,700만 원과 직장공제회 초과반환금 500만 원만 받았습니다. 2,000만 원 기준과 비교할 금액을 만 원 단위로 쓰고 일반 예금 이자의 과세방법을 고르세요.',
   fields:[{label:'기준과 비교할 금액'},{label:'일반 예금 이자의 과세방법',options:method}],
   answers:[1700,'separate'],solution:'1,700만 원 / 일반 예금 이자는 분리과세',
   explanation:'직장공제회 초과반환금은 별도로 분리과세하므로 기준과 비교할 합계에 넣지 않습니다.',
   book:'park',reference:parkReference(233),articles:[14]
  },
  {
   unit:'배당소득',detail:'수입 시기',topic:'실제 배당과 해산 의제배당 · 귀속연도 비교',
   id:'taxquiz-030',
   prompt:'A법인은 2026년 12월에 잉여금 처분 배당을 결의하고 2027년 1월에 지급했습니다. B법인은 2026년에 해산하고 2027년 1월에 잔여재산가액을 확정했습니다. 일반 기명주식 주주가 받은 배당과 해산에 따른 의제배당의 귀속연도를 각각 고르세요.',
   fields:[{label:'A법인의 배당',options:years},{label:'B법인의 의제배당',options:years}],answers:['2026','2027'],
   solution:'A는 2026년 / B는 2027년',
   explanation:'잉여금 처분 배당은 결의일, 해산에 따른 의제배당은 잔여재산가액이 확정된 날이 기준입니다.',
   book:'park',reference:parkReference(232),articles:['dividendTiming']
  },
  {
   unit:'사업소득',detail:'소득금액 계산',topic:'사업소득 · 필요경비 불산입',
   id:'taxquiz-031',
   prompt:'총수입금액이 5,300만 원입니다. 비용으로 기록한 2,800만 원에는 사업과 무관한 가계 생활비 300만 원과 본인의 소득세 100만 원이 포함됩니다. 나머지는 전부 필요경비로 인정될 때, 인정 필요경비와 사업소득금액을 만 원 단위로 입력하세요.',
   fields:[{label:'인정 필요경비'},{label:'사업소득금액'}],answers:[2400,2900],
   solution:'필요경비 2,400만 원 / 사업소득금액 2,900만 원',
   explanation:'가계 생활비 300만 원과 본인의 소득세 100만 원을 비용에서 제외한 뒤 계산합니다.',
   book:'park',reference:parkReference(239),articles:[19,33]
  },
  {
   unit:'이자소득',alsoUnits:['배당소득'],detail:'종합과세·분리과세',topic:'국내 배당과 국외 이자 · 합산 판단',
   id:'taxquiz-032',
   prompt:'거주자가 국내에서 원천징수된 일반 배당 1,800만 원과 국내에서 원천징수되지 않은 일반 국외 예금 이자 400만 원만 받았습니다. 2,000만 원 기준과 비교할 금액을 만 원 단위로 쓰고 국내 배당의 과세방법을 고르세요.',
   fields:[{label:'기준과 비교할 금액'},{label:'국내 배당의 과세방법',options:method}],answers:[2200,'combined'],
   solution:'2,200만 원 / 국내 배당도 종합과세',
   explanation:'이 사례의 국외 이자를 합산하면 기준을 넘으므로 국내 배당도 종합과세 대상입니다.',
   reference:selpaIncome(74),articles:[14]
  }
 ];

 const withholdingApplied=[
  {
   unit:'급여자료입력',detail:'비과세',topic:'식대·자가운전보조금 · 합계 입력',
   id:'taxquiz-033',
   prompt:'회사 식사를 제공받지 않는 직원이 현금 식대 25만 원과 자가운전보조금 24만 원을 받았습니다. 차량은 직원이 소유하고 직접 운전해 업무에 사용하며, 회사 규정에 따라 실제 출장비 대신 보조금을 받습니다. 두 수당을 합한 비과세 금액과 과세 금액을 만 원 단위로 각각 입력하세요.',
   fields:[{label:'비과세 수당 합계'},{label:'과세 수당 합계'}],answers:[40,9],
   solution:'비과세 40만 원 / 과세 9만 원',
   explanation:'각 수당에 월 20만 원 한도를 따로 적용합니다. 식대 5만 원과 자가운전보조금 4만 원이 과세됩니다.',
   reference:selpaPractice(129,146),articles:[12,'vehicle']
  },
  {
   unit:'급여자료입력',detail:'비과세',topic:'연간 급여 · 비과세 항목 구분',
   id:'taxquiz-034',
   prompt:'한 직원의 연간 지급액은 과세 기본급 3,000만 원, 상여 300만 원, 비과세로 확인된 식대 180만 원입니다. 지급액 합계와 연말정산에 사용할 총급여액을 만 원 단위로 각각 입력하세요.',
   fields:[{label:'지급액 합계'},{label:'총급여액'}],answers:[3480,3300],
   solution:'지급액 합계 3,480만 원 / 총급여액 3,300만 원',
   explanation:'총급여액에서는 비과세 식대를 제외하되 과세 상여는 포함합니다.',
   book:'park',reference:parkReference(243),articles:[20]
  },
  {
   unit:'사원등록',detail:'기본공제',topic:'직계존속 · 나이 요건의 예외',
   id:'taxquiz-035',
   prompt:'A와 B는 생계를 같이하는 58세 어머니를 각각 부양합니다. 두 어머니의 연간 소득금액 합계는 각각 80만 원이고 중복공제는 없습니다. A의 어머니만 세법상 장애인이라면 각각 기본공제가 가능한가요?',
   fields:[{label:'A의 어머니',options:judgment},{label:'B의 어머니',options:judgment}],answers:['yes','no'],
   solution:'A는 가능 / B는 불가',
   explanation:'두 사람 모두 소득 요건은 충족합니다. 직계존속의 나이 요건은 60세 이상이지만 세법상 장애인에게는 나이 제한을 적용하지 않습니다.',
   book:'park',reference:parkReference(270),articles:[50]
  },
  {
   unit:'사원등록',detail:'추가공제',topic:'경로우대 · 기본공제와 추가공제 구분',
   id:'taxquiz-036',
   prompt:'근로자의 69세 아버지와 71세 어머니가 모두 기본공제 대상입니다. 두 분의 기본공제 합계와 경로우대 추가공제 합계를 만 원 단위로 각각 입력하세요.',
   fields:[{label:'기본공제 합계'},{label:'경로우대 추가공제 합계'}],answers:[300,100],
   solution:'기본공제 300만 원 / 경로우대 추가공제 100만 원',
   explanation:'두 분 모두 기본공제 대상이므로 150만 원씩 적용합니다. 경로우대 추가공제는 만 70세 이상인 어머니에게만 적용합니다.',
   reference:selpaPractice(126,143),articles:[50,51]
  },
  {
   unit:'연말정산 추가자료입력',detail:'보험료 세액공제',topic:'일반 보장성보험료 · 세액공제액',
   id:'taxquiz-037',
   prompt:'근로자가 다른 요건을 충족하는 일반 보장성보험료 75만 원과 저축성보험료 60만 원을 부담했습니다. 보험료 세액공제 대상 납입액과 세액공제액을 각각 만 원 단위로 입력하세요.',
   fields:[{label:'공제 대상 납입액'},{label:'보험료 세액공제액'}],answers:[75,9],
   solution:'공제 대상 납입액 75만 원 / 세액공제액 9만 원',
   explanation:'일반 보장성보험료 75만 원에 12%를 적용합니다. 저축성보험료는 이 공제 대상에서 제외합니다.',
   reference:selpaPractice(132,149),articles:['insurance']
  },
  {
   unit:'연말정산 추가자료입력',detail:'의료비 세액공제',topic:'시력보정용 안경 · 인별 한도',
   id:'taxquiz-038',
   prompt:'근로자가 본인과 자녀의 시력보정용 안경에 각각 65만 원과 20만 원을 지출했습니다. 두 사람 모두 의료비 공제 대상이고 다른 안경 구입은 없었습니다. 총급여 기준을 차감하기 전, 각 사람에 대해 인정되는 의료비를 만 원 단위로 입력하세요.',
   fields:[{label:'본인 안경 인정액'},{label:'자녀 안경 인정액'}],answers:[50,20],
   solution:'본인 50만 원 / 자녀 20만 원',
   explanation:'시력보정용 안경 한도 50만 원은 가구 합계가 아니라 사람별로 적용합니다.',
   book:'park',reference:parkReference(287),articles:['glasses']
  }
 ];

 const withholdingAdvanced=[
  {
   unit:'급여자료입력',detail:'비과세',topic:'자가운전보조금 · 실제 출장비 중복 지급',
   id:'taxquiz-039',
   prompt:'A와 B는 모두 본인 소유 차량을 직접 운전해 회사 업무에 쓰고, 지급 규정에 따라 월 자가운전보조금 23만 원을 받습니다. A는 실제 시내 출장비를 따로 받지 않고 B는 받습니다. 두 직원의 월 보조금 중 과세 금액을 각각 만 원 단위로 입력하세요.',
   fields:[{label:'A의 과세 보조금'},{label:'B의 과세 보조금'}],answers:[3,23],
   solution:'A 3만 원 / B 23만 원',
   explanation:'A는 실제 여비 대신 보조금을 받아 비과세 한도를 적용합니다. B는 출장비를 별도로 받으므로 해당 보조금에 이 비과세를 적용하지 않습니다.',
   book:'park',reference:parkReference(240),articles:['vehicle']
  },
  {
   unit:'급여자료입력',detail:'원천징수 시기',topic:'미지급 급여 · 11월분과 12월분',
   id:'taxquiz-040',
   prompt:'2026년 11월분과 12월분 일반 급여가 모두 2027년 3월까지 지급되지 않았습니다. 원천징수에서는 각 급여를 언제 지급한 것으로 보나요?',
   fields:['11월분 급여','12월분 급여'].map(label=>({label,options:[['','선택'],['dec','2026년 12월 31일'],['feb','2027년 2월 말일'],['mar','2027년 3월 말일']]})),
   answers:['dec','feb'],solution:'11월분은 2026년 12월 31일 / 12월분은 2027년 2월 말일',
   explanation:'미지급 급여는 1~11월분과 12월분의 지급 간주일을 따로 판단합니다.',
   book:'park',reference:parkReference(244),articles:[135]
  },
  {
   unit:'사원등록',detail:'추가공제',topic:'한부모·부녀자 · 중복 요건',
   id:'taxquiz-041',
   prompt:'종합소득금액이 2,900만 원인 여성 근로자에게 배우자가 없고, 기본공제 대상 자녀를 부양하는 세대주입니다. 한부모와 부녀자 요건을 모두 충족할 때 실제 적용할 두 추가공제액을 만 원 단위로 입력하세요. 적용하지 않는 항목은 0을 입력하세요.',
   fields:[{label:'한부모 추가공제액'},{label:'부녀자 추가공제액'}],answers:[100,0],
   solution:'한부모 100만 원 / 부녀자 0원',
   explanation:'한부모와 부녀자 공제 요건을 모두 충족하면 한부모 공제만 적용합니다.',
   book:'park',reference:parkReference(270),articles:[51]
  },
  {
   unit:'연말정산 추가자료입력',detail:'보험료 세액공제',topic:'보장성보험 · 한도와 공제율 구분',
   id:'taxquiz-042',
   prompt:'근로자가 공제 요건을 충족하는 일반 보장성보험료 110만 원과 장애인전용 보장성보험료 120만 원을 납부했습니다. 두 항목의 연간 한도를 각각 적용해 세액공제액을 만 원 단위로 입력하세요.',
   fields:[{label:'일반 보장성보험 세액공제액'},{label:'장애인전용 보장성보험 세액공제액'}],answers:[12,15],
   solution:'일반 12만 원 / 장애인전용 15만 원',
   explanation:'두 보험의 대상 보험료 한도는 각각 100만 원이며, 공제율은 각각 12%와 15%입니다.',
   book:'park',reference:parkReference(286),articles:['insurance']
  },
  {
   unit:'연말정산 추가자료입력',detail:'의료비 세액공제',topic:'일반 의료비 · 인별 한도와 총급여 기준',
   id:'taxquiz-043',
   prompt:'총급여가 5,000만 원인 근로자가 65세 미만의 일반 의료비 대상 부양가족 두 명을 위해 시력보정용 안경을 각각 60만 원씩 사고, 두 사람의 다른 인정 의료비로 합계 150만 원을 지출했습니다. 본인 의료비나 환급액은 없습니다. 3% 기준을 빼기 전의 인정 의료비와 세액공제액을 만 원 단위로 입력하세요.',
   fields:[{label:'인정 의료비 합계'},{label:'의료비 세액공제액'}],answers:[250,15],
   solution:'인정 의료비 250만 원 / 세액공제액 15만 원',
   explanation:'안경은 두 사람에게 각각 50만 원씩 인정합니다. 합계 250만 원에서 총급여의 3%인 150만 원을 빼고 15%를 적용합니다.',
   book:'park',reference:parkReference(287),articles:['medical','glasses']
  },
  {
   unit:'연말정산 추가자료입력',detail:'보험료·의료비 구분',topic:'보험료와 의료비 · 입력할 비용 선별',
   id:'taxquiz-044',
   prompt:'연말정산 자료에 공제 요건을 충족하는 일반 보장성보험료 130만 원, 저축성보험료 90만 원, 본인의 시력보정용 안경비 70만 원, 미용 목적 성형비 50만 원이 있습니다. 보험료는 한도 적용 후 금액, 의료비는 총급여 기준을 빼기 전 인정 금액을 만 원 단위로 입력하세요.',
   fields:[{label:'한도 적용 후 공제 대상 보험료'},{label:'인정 의료비'}],answers:[100,50],
   solution:'보험료 100만 원 / 의료비 50만 원',
   explanation:'보장성보험료에는 100만 원 한도, 안경에는 인별 50만 원 한도를 적용합니다. 저축성보험료와 미용 성형비는 각 목록에서 뺍니다.',
   reference:selpaPractice(132,149),articles:['insurance','glasses']
  }
 ];

 function employeeFamily(seed=20261118,scenario=0){
  scenario=Number.isInteger(scenario)&&scenario>=0&&scenario<24?scenario:0;
  const variant=Number(seed)>>>0;
  let state=variant;
  const random=()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296};
  const integer=(min,max)=>min+Math.floor(random()*(max-min+1)),pick=values=>values[integer(0,values.length-1)];
  const year=2026,pad=n=>String(n).padStart(2,'0'),surname=pick(['김','이','박','정']);
  const names=['지훈','민서','수현','예린','도윤','서연','하준','지우','현우','다은','성민','유진'];
  const name=family=> (family?surname:pick(['최','한','오','신']))+names.splice(integer(0,names.length-1),1)[0];
  const birth=(base,female)=>{
   const y=base+integer(-1,1),m=integer(1,12),d=integer(1,28);
   // A literal X makes this an unusable identity number while keeping the birth date and century readable.
   return {rrn:String(y).slice(-2)+pad(m)+pad(d)+'-'+(y>=2000?(female?'4':'3'):(female?'2':'1'))+String(integer(0,99999)).padStart(5,'0')+'X',age:year-y};
  };
  const wage=pick([480,500]),business=pick([101,120]),daily=pick([800,820,900]),disabledWage=pick([501,600]);
  const rows=[
   {key:'self',relation:'본인',label:'본인',name:name(true),...birth(1974,false),remarks:'세대주 · 근로소득자',eligible:'yes',reason:'self',criterion:'self',
    reasonOptions:[['self','본인은 나이·소득 제한 없음'],['income','본인도 소득 한도 적용'],['household','세대주만 기본공제 가능']],
    explanation:'본인 기본공제에는 부양가족의 나이·소득 한도를 적용하지 않습니다.'},
   {key:'spouse',relation:'배우자',label:'배우자',name:name(false),...birth(1976,true),remarks:'일반 근로소득만 · 연간 총급여 '+wage+'만 원',eligible:'yes',reason:'spouse',criterion:'spouse-wage',
    reasonOptions:[['spouse','나이 제한 없음 · 소득 요건 충족'],['age','배우자의 나이 요건 미충족'],['income','총급여 '+wage+'만 원은 한도 초과']],
    explanation:'배우자에게는 나이 제한이 없고, 일반 근로소득만 있으며 총급여가 500만 원 이하이므로 가능합니다.'},
   {key:'child-disabled',relation:'자녀',label:'첫째 자녀',name:name(true),...birth(2000,true),remarks:'소득 없음 · 세법상 장애인',eligible:'yes',reason:'disability',criterion:'disability-age',
    reasonOptions:[['disability','장애인의 나이 제한 예외'],['age','자녀의 나이 요건 미충족'],['unlimited','장애인은 소득 제한도 없음']],
    explanation:'세법상 장애인은 나이 제한을 적용하지 않습니다. 소득이 없으므로 소득 요건도 충족합니다.'},
   {key:'child-adult',relation:'자녀',label:'둘째 자녀',name:name(true),...birth(2003,false),remarks:'소득 없음 · 장애인 아님',eligible:'no',reason:'age',criterion:'child-age',
    reasonOptions:[['age','자녀의 나이 요건 미충족'],['noage','자녀는 나이 제한 없음'],['noincome','소득이 없으면 나이 무관']],
    explanation:'장애인이 아닌 직계비속은 나이 요건을 충족해야 합니다. 이 자녀는 해당 연도의 나이 요건을 초과합니다.'},
   {key:'father',relation:'부친',label:'부친',name:name(true),...birth(1947,false),remarks:'사업소득금액 '+business+'만 원 · 다른 소득 없음',eligible:'no',reason:'income',criterion:'income-amount',
    reasonOptions:[['income','연간 소득금액 100만 원 초과'],['sales','사업 매출액으로만 판단'],['excluded','사업소득은 소득 한도에서 제외']],
    explanation:'직계존속의 나이 요건은 충족하지만, 필요경비를 뺀 사업소득금액이 100만 원을 초과하므로 불가합니다.'},
   {key:'mother',relation:'모친',label:'모친',name:name(false),...birth(1950,true),remarks:'일용근로소득 '+daily+'만 원 · 다른 소득 없음',eligible:'yes',reason:'daily',criterion:'daily-income',
    reasonOptions:[['daily','일용근로소득은 소득금액 합산 제외'],['wage','일용근로소득에도 총급여 500만 원 적용'],['any','소득이 있으면 무조건 공제 불가']],
    explanation:'일용근로소득은 분리과세되어 기본공제 소득금액 합계에 포함하지 않습니다. 나머지 요건도 충족하므로 가능합니다.'},
   {key:'sibling',relation:'형제',label:'동생',name:name(true),...birth(1989,false),remarks:'동생 · 세법상 장애인 · 일반 근로소득만 · 총급여 '+disabledWage+'만 원',eligible:'no',reason:'income',criterion:'disability-income',
    reasonOptions:[['income','장애인도 소득 제한 적용 · 한도 초과'],['unlimited','장애인은 소득 제한 없음'],['age','장애인 형제도 나이 제한 적용']],
    explanation:'장애인의 예외는 나이 제한에 대한 것입니다. 일반 근로소득만 있어도 총급여가 500만 원을 초과하면 불가합니다.'}
  ];
  const change=(key,values)=>Object.assign(rows.find(row=>row.key===key),values);
  if(scenario===1){
   change('spouse',{remarks:'일반 근로소득만 · 총급여 501만 원',eligible:'no',reason:'income',reasonOptions:[['income','총급여 500만 원 초과'],['age','배우자의 나이 요건 미충족'],['unlimited','배우자는 소득 제한 없음']],explanation:'배우자는 나이 제한이 없지만, 근로소득만 있는 경우의 총급여 한도 500만 원을 초과합니다.'});
   change('child-adult',{...birth(2008,false),eligible:'yes',reason:'ageok',reasonOptions:[['ageok','나이·소득 요건 충족'],['age','자녀의 나이 요건 미충족'],['unlimited','자녀는 소득 제한 없음']],explanation:'이 자녀는 20세 이하이고 소득이 없어 기본공제 요건을 충족합니다.'});
   change('father',{remarks:'사업소득금액 100만 원 · 다른 소득 없음',eligible:'yes',reason:'incomeok',reasonOptions:[['incomeok','소득금액 100만 원 이하'],['income','소득금액 한도 초과'],['sales','사업 매출액으로만 판단']],explanation:'나이 요건을 충족하고 사업소득금액이 100만 원 이하이므로 가능합니다.'});
   change('sibling',{remarks:'동생 · 세법상 장애인 · 근로소득만 · 총급여 500만 원',eligible:'yes',reason:'disability',reasonOptions:[['disability','장애인 나이 예외 · 소득 충족'],['income','총급여 한도 초과'],['age','형제의 나이 요건 미충족']],explanation:'장애인으로 나이 제한을 받지 않으며, 근로소득만 있고 총급여가 500만 원 이하입니다.'});
  }
  if(scenario===2){
   change('child-disabled',{remarks:'소득 없음 · 장애인 아님',eligible:'no',reason:'age',criterion:'child-age',explanation:'장애인이 아닌 성인 자녀로 나이 요건을 충족하지 못합니다.'});
   change('father',{...birth(1968,false),remarks:'소득 없음 · 장애인 아님',eligible:'no',reason:'age',criterion:'parent-age',reasonOptions:[['age','직계존속의 나이 요건 미충족'],['noincome','소득이 없으면 나이 무관'],['unlimited','부모는 나이 제한 없음']],explanation:'소득 요건은 충족하지만 직계존속의 나이 요건인 60세 이상에 해당하지 않습니다.'});
   change('mother',{remarks:'일반 근로소득만 · 총급여 820만 원',eligible:'no',reason:'income',criterion:'wage-limit',reasonOptions:[['income','총급여 500만 원 초과'],['daily','일용근로소득으로 합산 제외'],['unlimited','고령자는 소득 제한 없음']],explanation:'일용근로소득이 아닌 일반 근로소득입니다. 총급여가 500만 원을 초과하므로 공제 불가입니다.'});
  }
  if(scenario===3){
   change('spouse',{remarks:'사업소득금액 101만 원 · 다른 소득 없음',eligible:'no',reason:'income',criterion:'income-amount',reasonOptions:[['income','소득금액 100만 원 초과'],['wage','사업소득에도 총급여 500만 원 적용'],['unlimited','배우자는 소득 제한 없음']],explanation:'사업소득은 필요경비를 뺀 소득금액으로 판단하며, 100만 원 한도를 초과합니다.'});
   change('child-disabled',{remarks:'세법상 장애인 · 사업소득금액 101만 원',eligible:'no',reason:'income',criterion:'disability-income',reasonOptions:[['income','장애인도 소득 제한 적용'],['unlimited','장애인은 소득 제한 없음'],['age','장애인도 나이 제한 적용']],explanation:'장애인의 나이 예외는 소득 요건을 면제하지 않습니다. 사업소득금액이 100만 원을 초과합니다.'});
   change('mother',{remarks:'일반 근로소득만 · 총급여 500만 원',eligible:'yes',reason:'incomeok',criterion:'wage-limit',reasonOptions:[['incomeok','나이 충족 · 총급여 500만 원 이하'],['income','총급여 500만 원은 한도 초과'],['daily','일용근로소득으로 합산 제외']],explanation:'직계존속의 나이 요건을 충족하며, 근로소득만 있고 총급여가 500만 원 이하이므로 가능합니다.'});
  }
  if(scenario>=4){
   // Each set changes a tax condition. Random identity decoration does not create another review card.
   const specs=[
    {spouse:{kind:'wage',amount:500},'child-disabled':{kind:'wage',amount:501}},
    {spouse:{kind:'wage',amount:501},'child-adult':{age:20}},
    {father:{age:60,amount:100},mother:{age:59,kind:'amount',amount:0}},
    {father:{age:59},mother:{age:60,kind:'amount',amount:0}},
    {sibling:{age:20},'child-adult':{age:23}},
    {sibling:{age:23},'child-adult':{age:19}},
    {sibling:{age:60},'child-adult':{age:18}},
    {sibling:{age:59},father:{age:60}},
    {sibling:{age:35,disabled:true},'child-disabled':{disabled:false}},
    {sibling:{disabled:true,amount:100},'child-disabled':{amount:101}},
    {father:{kind:'retirement',amount:100},mother:{kind:'retirement',amount:101}},
    {father:{kind:'capital',amount:100},mother:{kind:'capital',amount:101}},
    {spouse:{kind:'pension',amount:100},father:{kind:'pension',amount:101}},
    {mother:{kind:'pension',amount:100},spouse:{amount:101}},
    {spouse:{kind:'other',amount:101},'child-adult':{amount:100}},
    {spouse:{kind:'separateOther',amount:300},'child-adult':{kind:'wage',amount:500}},
    {father:{kind:'financial',amount:1800},mother:{kind:'financial',amount:1900}},
    {father:{kind:'combined',amount:100},mother:{kind:'combined',amount:101}},
    {spouse:{kind:'exempt',amount:600},mother:{kind:'daily',amount:900}},
    {sibling:{disabled:true,kind:'wage',amount:500},'child-disabled':{kind:'wage',amount:501},father:{age:59},mother:{age:60,kind:'amount',amount:0}}
   ];
   const defaults={self:{age:52},spouse:{age:50},'child-disabled':{age:26,disabled:true},'child-adult':{age:18},father:{age:75},mother:{age:72,kind:'daily',amount:800},sibling:{age:35}};
   const incomeLabels={amount:'사업소득금액',wage:'일반 근로소득만 · 총급여',retirement:'퇴직소득금액',capital:'양도소득금액(양도소득 기본공제 전)',pension:'공적연금소득금액(연금소득공제 후)',other:'종합과세로 신고한 기타소득금액',separateOther:'원천징수된 기타소득금액 · 분리과세 선택',financial:'국내 원천징수 이자소득 · 분리과세',combined:'종합소득금액 100만 원 + 퇴직소득금액',exempt:'비과세소득만',daily:'일용근로소득만'};
   const incomeCriteria={amount:'income-amount',wage:'wage-limit',retirement:'retirement-income',capital:'capital-income',pension:'pension-income',other:'other-income',separateOther:'separate-income',financial:'separate-income',combined:'combined-income',exempt:'exempt-income',daily:'daily-income'};
   for(const row of rows){
    const spec={kind:'amount',amount:0,disabled:false,...defaults[row.key],...specs[scenario-4][row.key]};
    const female=['spouse','child-disabled','mother'].includes(row.key),dob=birth(2026-spec.age,female),birthYear=2026-spec.age;
    row.rrn=String(birthYear).slice(-2)+dob.rrn.slice(2,7)+(birthYear>=2000?(female?'4':'3'):(female?'2':'1'))+dob.rrn.slice(8);row.age=spec.age;
    const excluded=['daily','financial','separateOther','exempt'].includes(spec.kind);
    const incomeOK=excluded||spec.amount<=(spec.kind==='wage'?500:100);
    const ageOK=row.key==='self'||row.key==='spouse'||spec.disabled||(['father','mother'].includes(row.key)?spec.age>=60:row.key==='sibling'?spec.age<=20||spec.age>=60:spec.age<=20);
    const incomeText=spec.kind==='combined'?'종합소득금액 100만 원 + 퇴직소득금액 '+(spec.amount-100)+'만 원':incomeLabels[spec.kind]+' '+spec.amount+'만 원';
    row.remarks=row.key==='self'?'세대주 · 근로소득자':(spec.disabled?'세법상 장애인 · ':'장애인 아님 · ')+incomeText+' · 다른 소득 없음';
    row.eligible=row.key==='self'||ageOK&&incomeOK?'yes':'no';
    let label,wrong;
    row.criterion=incomeCriteria[spec.kind];
    if(row.key==='self'){row.reason='self';row.criterion='self';label='본인은 나이·소득 제한 없음';wrong=[['limit','본인도 소득 제한 적용'],['age','본인의 나이 요건 미충족']];row.explanation='본인 기본공제에는 부양가족의 나이·소득 한도를 적용하지 않습니다.'}
    else if(!incomeOK){row.reason='limit';label=spec.kind==='wage'?'총급여 500만 원 초과':'소득금액 합계 100만 원 초과';wrong=[['ok','소득 요건 충족'],['excluded','해당 소득은 무조건 합산 제외']];row.explanation='이 소득은 기본공제 소득 요건 판정에 반영하며, '+(spec.kind==='wage'?'근로소득만 있는 경우의 총급여 500만 원':'연간 소득금액 합계 100만 원')+' 한도를 초과합니다.';if(spec.disabled)row.criterion='disability-income'}
    else if(!ageOK){row.reason='age';row.criterion=['father','mother'].includes(row.key)?'parent-age':row.key==='sibling'?'sibling-age':'child-age';label='나이 요건 미충족';wrong=[['ok','나이 요건 충족'],['ignore','소득이 없으면 나이 무관']];row.explanation='장애인이 아니므로 '+(['father','mother'].includes(row.key)?'직계존속 60세 이상':row.key==='sibling'?'형제자매 20세 이하 또는 60세 이상':'직계비속 20세 이하')+'의 나이 요건을 적용하며, 이 요건을 충족하지 못합니다.'}
    else if(spec.disabled){row.reason='disability';row.criterion='disability-age';label='장애인 나이 예외 · 소득 충족';wrong=[['age','장애인도 나이 제한 적용'],['unlimited','장애인은 소득 제한도 없음']];row.explanation='세법상 장애인은 나이 제한을 적용하지 않습니다. 이 사례는 소득 요건도 충족합니다.'}
    else if(excluded){row.reason='excluded';label=spec.kind==='daily'?'일용근로소득 합산 제외':spec.kind==='exempt'?'비과세소득 합산 제외':'분리과세소득 합산 제외';wrong=[['limit','소득금액 한도 초과'],['wage','모든 소득에 총급여 500만 원 적용']];row.explanation='명시된 '+(spec.kind==='daily'?'일용근로소득':spec.kind==='exempt'?'비과세소득':'분리과세로 확정된 소득')+'은 기본공제 소득금액 합계에 포함하지 않습니다. 나머지 요건도 충족합니다.'}
    else{row.reason='ok';label=row.key==='spouse'?'배우자 나이 제한 없음 · 소득 충족':'나이·소득 요건 충족';wrong=[['age','나이 요건 미충족'],['limit','소득 요건 한도 초과']];row.explanation=(row.key==='spouse'?'배우자는 나이 제한이 없습니다. ':'나이 요건을 충족합니다. ')+(spec.kind==='wage'?'일반 근로소득만 있고 총급여가 500만 원 이하입니다.':'판정에 포함하는 연간 소득금액 합계가 100만 원 이하입니다.')}
    row.reasonOptions=[[row.reason,label],...wrong];
   }
  }
  for(const row of rows)for(let i=row.reasonOptions.length-1;i>0;i--){const j=((variant^Math.imul(i+1,2654435761)^row.key.length)>>>0)%(i+1);[row.reasonOptions[i],row.reasonOptions[j]]=[row.reasonOptions[j],row.reasonOptions[i]]}
  const judgment=[['','선택'],['yes','공제 가능'],['no','공제 불가']];
  const fields=rows.flatMap(row=>[
   {key:row.key+':eligibility',member:row.label,criterion:row.criterion,label:row.label+' · 기본공제 여부',options:judgment},
   {key:row.key+':reason',member:row.label,criterion:row.criterion,label:row.label+' · 판단 이유',options:[['','선택'],...row.reasonOptions]}
  ]);
  return {id:'taxquiz-'+String(46+scenario).padStart(3,'0'),sample:'employee-family',scenario,level:'basic',book:'withholding',variant,
   unit:'사원등록',detail:'가족별 기본공제 판단',topic:'사원등록 · 가족별 기본공제 판단'+(scenario?' · 연습 '+scenario:''),
   prompt:(scenario?'[연습 '+scenario+'] ':'')+'가족별 기본공제 대상 여부와 판단 이유를 선택하세요.',
   condition:'2026년 귀속 · 생계·부양·중복공제 등 명시되지 않은 요건은 충족합니다. 총급여는 비과세 급여를 제외한 금액이며, 장애인은 세법상 장애인입니다.',
   family:{year,employee:[['사원번호',String(integer(100,999))],['성명',rows[0].name],['입사일자',year+'-'+pad(integer(1,9))+'-'+pad(integer(1,28))],['근무부서',pick(['관리부','회계부','총무부'])],['월정급여',pick(['4,500,000원','5,000,000원','5,500,000원'])],['기타정보','내국인 · 거주자 · 세대주']],rows},
   fields,answers:rows.flatMap(row=>[row.eligible,row.reason]),
   solution:'가족별 판정 결과는 자료 2의 각 행에서 확인하세요.',explanation:'나이는 주민등록번호의 생년월일과 출생 세기를 기준으로 판단합니다.',
   reference:{bookPage:126,pdfPage:143},articles:[50]};
 }
 function registrationAnswer(field,value){
  const text=String(value??'').trim();
  if(field.input==='rrn'){
   const digits=text.replace(/[\s-]/g,'').toUpperCase();
   return /^\d{6}[1-4]\d{5}X$/.test(digits)?digits.slice(0,6)+'-'+digits.slice(6):'';
  }
  if(field.input==='import')return /^\d{1,2}$/.test(text)?String(Number(text)):'';
  if(field.options&&!field.options.some(([option])=>option===text))return '';
  return text.slice(0,field.input==='code'?3:32);
 }
 function registrationBirthDate(number){
  const masked=registrationAnswer({input:'rrn'},number);
  if(!masked)return '';
  const year=(Number(masked[7])<=2?1900:2000)+Number(masked.slice(0,2));
  const date=year+'-'+masked.slice(2,4)+'-'+masked.slice(4,6);
  const parsed=new Date(date+'T00:00:00Z');
  return Number.isFinite(parsed.valueOf())&&parsed.toISOString().slice(0,10)===date?date:'';
 }
 function childcareCount(registration,values){
  const earliest=(registration.year-6)+'-01-01',start=registration.year+'-01-01',children=new Set();
  for(const {start:offset} of registration.rows){
   if(values[offset]!=='child')continue;
   const number=registrationAnswer({input:'rrn'},values[offset+2]),date=registrationBirthDate(number);
   if(date>=earliest&&date<=start)children.add(number);
  }
  return children.size;
 }
 function employeeRegistration(detailed=false){
  const base=employeeFamily(),year=base.family.year;
  const info=Object.fromEntries(base.family.employee);
  const [self,spouse,childA,childB,father,mother,sibling]=base.family.rows;
  const employeeNumber=detailed?self.rrn.slice(0,7)+'2'+self.rrn.slice(8):self.rrn;
  const choice=(...options)=>[['','선택'],...options];
  const coded=(...labels)=>choice(...labels.map((label,code)=>[String(code),code+' '+label]));
  const nationalityOptions=choice(['domestic','1 내국인'],['foreign','2 외국인']);
  const identityOptions=choice(['1','1 주민등록번호'],['2','2 외국인등록번호'],['3','3 여권번호']);
  const disabilityOptions=coded('부','장애인복지법','국가유공자 등','중증환자 등');
  const simpleChildOptions=coded('부','여');
  const departments=choice(['management','관리부'],['accounting','회계부'],['general','총무부']);
  const basicFields=[
   {key:'employee-code',label:'사번',input:'code',expected:info.사원번호},
   {key:'employee-name',label:'성명',expected:info.성명},
   {key:'employee-rrn',label:'가상 주민등록번호',input:'rrn',expected:employeeNumber},
   {key:'hire-date',label:'입사일자',input:'date',expected:info.입사일자},
   {key:'department',label:'근무부서',options:departments,expected:departments.find(([,label])=>label===info.근무부서)[0]},
   {key:'nationality',label:'내·외국인',options:nationalityOptions,expected:'domestic'},
   {key:'residence',label:'거주구분',options:choice(['resident','거주자'],['nonresident','비거주자']),expected:'resident'},
   {key:'household',label:'세대구분',options:choice(['head','세대주'],['member','세대원']),expected:'head'}
  ];
  const eligible=choice(['yes','여'],['no','부']);
  const birthAdoption=choice(['none','해당 없음'],['first','첫째'],['second','둘째'],['third','셋째 이상']);
  const familyPeople=[
   detailed?{...sibling,role:'child',relation:'자녀',rrn:'110402-3'+sibling.rrn.slice(8),remarks:'소득 없음 · 장애인 아님',eligible:'yes',childCredit:'yes'}:{...spouse,role:'spouse'},
   {...childA,role:'child',rrn:'200101-4'+childA.rrn.slice(8),remarks:detailed?'소득 없음 · 장애인복지법상 장애인 · 2026년 가족관계등록부에 셋째로 입양 신고':'소득 없음 · 장애인 아님',eligible:'yes',disabled:detailed?'1':'0',birthAdoption:detailed?'third':'none'},
   {...childB,role:'child',rrn:'191231-3'+childB.rrn.slice(8),remarks:'소득 없음 · 장애인 아님',eligible:'yes'},
   {...father,role:'parent'}
  ];
  if(detailed)familyPeople.push({...mother,role:'mother',remarks:'소득 없음 · 장애인 아님',senior:'yes'});
  const columns=['관계','성명','주민등록번호','기본공제',...(detailed?['경로우대','장애인','출산·입양','자녀세액공제','내/외국인','번호 구분','자녀(간이)']:[])];
  const rows=familyPeople.map((row,i)=>({...row,key:row.role+'-'+(i+1),start:basicFields.length+i*columns.length,
   age:year-Number(registrationBirthDate(row.rrn).slice(0,4))}));
  const relations=[['parent','부친','1'],['mother','모친','1'],['in-law','배우자의 직계존속','2'],['spouse','배우자','3'],
   ['child','자녀','4'],['descendant','기타 직계비속','5'],['sibling','형제자매','6'],['recipient','수급자','7'],['foster','위탁아동','8']];
  const relationOptions=choice(...relations.map(([value,label,code])=>[value,code+' '+label]));
  const basicOptions=detailed?coded('부','본인','배우자','20세 이하','60세 이상','장애인','기초생활수급자 등'):choice(['yes','공제 가능'],['no','공제 불가']);
  const fields=[
   ...basicFields.map(field=>({...field,member:'기본사항',criterion:'employee-basic'})),
   ...rows.flatMap((row,i)=>[
    {key:'relation',label:'관계',options:relationOptions,relationCodes:Object.fromEntries(relations.map(([value,,code])=>[value,code])),expected:row.role},
    {key:'name',label:'성명',expected:row.name},
    {key:'rrn',label:'가상 주민등록번호',input:'rrn',expected:row.rrn},
    {key:'deduction',label:'기본공제',options:basicOptions,expected:detailed?(row.eligible==='no'?'0':row.disabled==='1'?'5':row.role==='child'?'3':'4'):row.eligible,
     ...(detailed&&row.disabled==='1'?{accepted:['3']}: {})},
    ...(detailed?[
     {key:'senior',label:'경로우대',options:eligible,expected:row.senior||'no',criterion:'senior-deduction'},
     {key:'disability',label:'장애인',options:disabilityOptions,expected:row.disabled||'0',criterion:'disability-deduction'},
     {key:'birth-adoption',label:'출산·입양',options:birthAdoption,expected:row.birthAdoption||'none',criterion:'birth-adoption-credit'},
     {key:'child-credit',label:'자녀세액공제',options:eligible,expected:row.childCredit||'no',criterion:'child-tax-credit'},
     {key:'nationality',label:'내/외국인',options:nationalityOptions,expected:'domestic'},
     {key:'id-type',label:'번호 구분',options:identityOptions,expected:'1'},
     {key:'simple-child',label:'자녀(간이)',options:simpleChildOptions,expected:row.role==='child'&&row.eligible==='yes'&&row.age>=8&&row.age<=20?'1':'0'}
    ]:[])
   ].map(field=>({...field,key:row.key+':'+field.key,label:'가족 '+(i+1)+' · '+field.label,member:'가족 '+(i+1),criterion:field.criterion||'family-registration'}))),
   ...(detailed?[
    {key:'self-id-type',label:'본인 · 번호 구분',options:identityOptions,expected:'1',member:'본인',criterion:'family-registration'},
    {key:'self-basic',label:'본인 · 기본공제',options:basicOptions,expected:'1',member:'본인',criterion:'family-registration'},
    {key:'self-senior',label:'본인 · 경로우대',options:eligible,expected:'no',member:'본인',criterion:'senior-deduction'},
    {key:'self-disability',label:'본인 · 장애인',options:disabilityOptions,expected:'0',member:'본인',criterion:'disability-deduction'},
    {key:'self-child-credit',label:'본인 · 자녀세액공제',options:eligible,expected:'no',member:'본인',criterion:'child-tax-credit'},
    {key:'women-deduction',label:'본인 · 부녀자',options:eligible,expected:'no',member:'본인',criterion:'household-deduction'},
    {key:'single-parent',label:'본인 · 한부모',options:eligible,expected:'yes',member:'본인',criterion:'household-deduction'}
   ]:[]),
   {key:'childcare-import',label:'6세 이하 보육수당 대상자 불러오기',input:'import',member:'부양가족명세',criterion:'childcare-import'}
  ];
  const employee=base.family.employee.filter(([label])=>label!=='월정급여');
  if(detailed)employee.push(['공제 판단 자료','여성 · 배우자 없음 · 장애인 아님 · 종합소득금액 2,900만 원']);
  const registration={year,employee:[...employee,['가상 주민등록번호',employeeNumber]],rows,columns,basicCount:basicFields.length,detailed};
  fields.at(-1).expected=String(childcareCount(registration,fields.map(field=>field.expected)));
  return {
   id:detailed?'taxquiz-071':'taxquiz-070',sample:'employee-klab',level:'basic',book:'withholding',variant:base.variant,unit:'사원등록',
   detail:'기본사항·부양가족명세',topic:detailed?'사원 등록 · 기본·추가공제와 보육수당':'사원 등록 · 보육수당 대상자',
   prompt:'가상 사원을 등록하고 부양가족명세를 작성하세요.',
   condition:`${year}년 귀속 · 사원 본인은 기본공제 대상입니다. 가족은 자료 순서대로 입력하고, 주어진 조건 외 생계·부양·중복공제 요건은 충족한다고 봅니다. ${detailed?'가족은 모두 내국인입니다. ':''}주민등록번호는 끝자리가 X인 연습용 번호입니다.`,
   registration,fields,answers:fields.map(field=>field.expected),
   solution:`6세 이하 보육수당 대상자 ${fields.at(-1).expected}명.`,
   explanation:detailed?
    '한부모와 부녀자 공제 요건이 겹치면 한부모 공제만 적용합니다. 모친은 기본공제 대상이면서 70세 이상이므로 경로우대 대상입니다. 부친은 소득요건을 초과해 경로우대도 적용할 수 없습니다. 그해 입양 신고한 막내는 장애인 추가공제와 셋째 이상 출산·입양 공제를 적용합니다. 일반 자녀세액공제는 15세 자녀만 해당합니다. 보육수당 대상자는 1월 1일에 정확히 만 6세가 된 자녀 한 명입니다.':
    `${year}년 1월 1일에 정확히 만 6세가 되는 자녀는 포함합니다. 그 전날 만 6세가 된 자녀는 기본공제가 가능하지만 보육수당 연령 요건은 충족하지 않습니다. 부양가족명세를 입력한 뒤 불러오기 결과를 확인합니다.`,
   articles:detailed?[51,'childTax','simpleChild','childcare']:['childcare']
  };
 }
 function caseText(question){
  if(question.registration){
   const {year,employee,rows}=question.registration;
   return ['사원 등록 실무 연습 · '+year+'년 귀속 · 가상 자료',...employee.map(([label,value])=>label+': '+value),
    ...rows.map(row=>[row.relation,row.name,row.rrn,row.remarks].join(' | ')),question.condition].join('\n');
  }
  if(!question.family)return [...(question.facts||[]).map(([label,value])=>label+': '+value),question.condition||''].filter(Boolean).join('\n');
  return ['가상 연습자료 · '+question.family.year+'년 귀속 · 자료번호 '+question.variant,'자료 1',...question.family.employee.map(([label,value])=>label+': '+value),'자료 2',...question.family.rows.map(row=>[row.label,row.name,row.rrn,row.remarks].join(' | ')),question.condition].join('\n');
 }
 function fieldResults(question,values){
  if(question.registration)return question.fields.map((field,i)=>{
   const display=value=>field.input==='import'?value===''?'불러오지 않음':value+'명':
    field.options?.find(([option])=>option===value&&option)?.[1]||value||'미입력';
   let value=registrationAnswer(field,values[i]);
   if(field.input==='import'&&field.expected==='0'&&!value)value='0';
   const correct=value===field.expected||Boolean(field.accepted?.includes(value));
   return {key:field.key,member:field.member,criterion:field.criterion,label:field.label,
    value:display(value),expected:display(correct?value:field.expected),correct};
  });
  if(!question.family)return undefined;
  return question.fields.map((field,i)=>({key:field.key,member:field.member,criterion:field.criterion,label:field.label,
   value:field.options.find(([value])=>value===values[i])?.[1]||String(values[i]??''),
   expected:field.options.find(([value])=>value===question.answers[i])[1],correct:values[i]===question.answers[i]}));
 }
 function questions(course){
  const graded=[['basic',basicQuestions(course)],['applied',course==='income'?incomeApplied:withholdingApplied],
   ['advanced',course==='income'?incomeAdvanced:withholdingAdvanced]];
  if(course==='income')graded[0][1].push(...extraIncomeBasics);
  else graded[0][1].push(...Array.from({length:24},(_,scenario)=>employeeFamily(20261118+scenario,scenario)),employeeRegistration(),employeeRegistration(true));
  return graded.flatMap(([level,list])=>list.map(question=>({...question,level,book:question.book||course})))
   .sort((a,b)=>units[course].indexOf(a.unit)-units[course].indexOf(b.unit));
 }

 function inUnit(question,unit){
  return !unit||question.unit===unit||Boolean(question.alsoUnits?.includes(unit));
 }

 function selectQuestions(matching,count,levelId){
  if(count>=matching.length)return matching;
  const park=matching.filter(question=>question.book==='park');
  const selpa=matching.filter(question=>question.book!=='park');
  const share=levels.find(level=>level.id===levelId).parkShare;
  // Keep both books in an applied set when the filters and question count allow it.
  const target=levelId==='applied'?Math.floor(count*share):Math.ceil(count*share);
  const parkCount=Math.max(count-selpa.length,Math.min(target,park.length));
  const chosen=new Set([...park.slice(0,parkCount),...selpa.slice(0,count-parkCount)]);
  return matching.filter(question=>chosen.has(question));
 }

 const api={units,levels,books,questions,inUnit,selectQuestions,employeeFamily,registrationAnswer,registrationBirthDate,childcareCount,caseText,fieldResults};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SemuonTaxQuiz=api;
})(globalThis);
