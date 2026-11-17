/* Quiz answers and self-ratings are independent of the main problem bank's grades. */
(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('./progress.js'):root.SemuonProgress);
 if(node)module.exports=api;else root.SemuonQuizReview=api;
})(globalThis,function(P){
 'use strict';
 const courses={withholding:'원천징수',income:'소득세법'};
 const ratings=[['again','다시',1],['hard','어려움',2],['good','보통',3],['easy','쉬움',7]];
 const stages=[
  ['new','새 문제','#5598bd'],['learning','학습 중','#d19a3c'],['relearning','재학습','#ce6a57'],
  ['young','어린 문제','#78ad70'],['mature','성숙 문제','#34805a']
 ];
 const order=(a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.id.localeCompare(b.id);

 function nextPlan(before,today,rating){
  if(before&&before.due>today&&rating!=='again')return before;
  const reviewed=before&&['young','mature'].includes(before.stage);
  const interval=rating==='again'?1:reviewed?
   Math.max(ratings.find(([id])=>id===rating)[2],Math.ceil(before.interval*{hard:1.2,good:1.8,easy:2.5}[rating])):
   ratings.find(([id])=>id===rating)[2];
  const days=Math.min(interval,120);
  const stage=rating==='again'?(reviewed||before?.stage==='relearning'?'relearning':'learning'):
   rating==='hard'&&!reviewed?(before?.stage==='relearning'?'relearning':'learning'):
   days>=21?'mature':'young';
  return {stage,due:P.add(today,days),interval:days};
 }

 function analyze(events=[],now=Date.now()){
  const sorted=events.filter(e=>Date.parse(e.at)<=now).slice().sort(order),selfRatings=new Map(),cards=new Map();
  for(const event of sorted)if(event.kind==='rating'&&!selfRatings.has(event.attemptId))selfRatings.set(event.attemptId,event.rating);
  for(const event of sorted){
   if(event.kind!=='attempt')continue;
   const day=P.day(event.at);
   let card=cards.get(event.questionId);
   if(!card){card={attempts:0,wrong:0,firstDays:0,firstWrong:0,plan:null};cards.set(event.questionId,card)}
   card.attempts++;
   if(!event.correct)card.wrong++;
   if(card.day===day)continue;
   card.day=day;
   card.first=event;
   card.firstDays++;
   if(!event.correct)card.firstWrong++;
   card.before=card.plan;
   card.rating=selfRatings.get(event.id)||null;
   card.plan=nextPlan(card.before,day,event.correct?card.rating||'good':'again');
  }
  return cards;
 }
 function distribution(bank,cards){
  const counts=new Map(stages.map(([id])=>[id,0]));
  for(const q of bank){const phase=cards.get(q.id)?.plan?.stage||'new';counts.set(phase,counts.get(phase)+1)}
  return stages.map(([id,label,color])=>({id,label,color,count:counts.get(id),ratio:bank.length?counts.get(id)/bank.length:0}));
 }
 function due(bank,cards,date){
  return bank.filter(q=>cards.get(q.id)?.plan?.due<=date).sort((a,b)=>{
   const first=cards.get(a.id),second=cards.get(b.id);
   return first.plan.due.localeCompare(second.plan.due)||second.firstWrong-first.firstWrong;
  });
 }
 function recent(events=[],start,end){
  const firsts=new Map();
  for(const event of events.filter(e=>e.kind==='attempt').slice().sort(order)){
   const date=P.day(event.at);
   if(date<start||date>end)continue;
   const key=event.questionId+'|'+date;
   if(!firsts.has(key))firsts.set(key,event);
  }
  return [...firsts.values()].reverse();
 }
 return {courses,ratings,stages,nextPlan,analyze,distribution,due,recent};
});
