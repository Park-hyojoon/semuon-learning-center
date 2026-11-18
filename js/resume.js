/* Device-local study position. No remote requests or grade events. */
(function(root){
 'use strict';
 const KEY='semuon-tax2-resume-v1',HOME=KEY+'-home';
 const routes=new Set(['theory','general','voucher','forms','quiz','topic','review','concepts','learning-map','journal']);
 const number=v=>Number.isFinite(v)?Math.max(0,v):0;
 const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}};
 const mobile=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||
  /Macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1||
  matchMedia('(display-mode: standalone)').matches;

 function open(base,page){
  function route(value){
   try{
    const url=new URL(value,base);
    const relative=url.pathname.slice(base.pathname.length);
    if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||!/^pages\/[a-z-]+\.html$/.test(relative)||
       !routes.has(relative.slice(6,-5)))return null;
    return url;
   }catch(_){return null}
  }
  const saved=read(KEY),target=saved?.version===1&&typeof saved.url==='string'?route(saved.url):null;
  let explicitHome=false;
  try{explicitHome=sessionStorage.getItem(HOME)==='1';sessionStorage.removeItem(HOME)}catch(_){}
  const navigation=performance.getEntriesByType('navigation')[0]?.type;
  if(page==='home'&&mobile()&&target&&!explicitHome&&!location.search&&!location.hash&&
     navigation!=='reload'&&navigation!=='back_forward'){
   location.replace(target.href);
   return {redirected:true};
  }
  const url=route(location.href);
  let pending=target?.href===location.href?saved:null,enabled=false,timer=0,restoring=false,observer;
  let foreground=!document.hidden,restoreDeadline=0;
  const content=()=>document.querySelector('#content');
  const hosted=()=>root.SemuonFullscreen?.hosting();
  const nested='.kclep-scroll,.table-scroll,.evidence-viewport';

  function remember(){
   if(!enabled||pending||!foreground||hosted()||!route(location.href))return;
   const host=content();
   if(!host)return;
   const cards=[...host.querySelectorAll('[data-problem-id]')];
   const anchor=cards.find(card=>card.getBoundingClientRect().bottom>80);
   const details=cards.map(card=>({
    id:card.dataset.problemId,
    open:[...card.querySelectorAll('details')].map(el=>el.open),
    scroll:[...card.querySelectorAll(nested)].map(el=>({x:el.scrollLeft,y:el.scrollTop}))
   }));
   const record={version:1,url:location.href,y:root.scrollY,at:Date.now(),details};
   if(anchor)record.anchor={id:anchor.dataset.problemId,offset:anchor.getBoundingClientRect().top};
   try{localStorage.setItem(KEY,JSON.stringify(record))}catch(_){}
  }
  function schedule(){
   clearTimeout(timer);
   timer=setTimeout(remember,220);
  }
  function restore(){
   restoring=false;
   if(!pending||!enabled||hosted())return;
   const host=content();
   if(!host)return;
   const find=id=>[...host.querySelectorAll('[data-problem-id]')].find(card=>card.dataset.problemId===id);
   const anchor=pending.anchor&&find(pending.anchor.id);
   if((pending.anchor&&!anchor||!pending.anchor&&!host.children.length)&&Date.now()<restoreDeadline)return;
   for(const item of Array.isArray(pending.details)?pending.details:[]){
    if(!item||typeof item.id!=='string')continue;
    const card=find(item.id);
    if(!card)continue;
    [...card.querySelectorAll('details')].forEach((el,i)=>{el.open=Boolean(item.open?.[i])});
    [...card.querySelectorAll(nested)].forEach((el,i)=>{
     el.scrollLeft=number(item.scroll?.[i]?.x);el.scrollTop=number(item.scroll?.[i]?.y);
    });
   }
   const top=anchor?root.scrollY+anchor.getBoundingClientRect().top-pending.anchor.offset:number(pending.y);
   if(!anchor&&top>document.documentElement.scrollHeight-innerHeight+2&&Date.now()<restoreDeadline)return;
   root.scrollTo({top:number(top),behavior:'instant'});
   pending=null;
   observer?.disconnect();
   schedule();
  }
  function attemptRestore(){
   if(restoring||!pending)return;
   restoring=true;
   requestAnimationFrame(()=>requestAnimationFrame(restore));
  }
  function ready(){
   if(!url)return;
   if(enabled){attemptRestore();return}
   enabled=true;
   if(!pending){schedule();return}
   restoreDeadline=Date.now()+5000;
   observer=new MutationObserver(attemptRestore);
   observer.observe(content(),{childList:true,subtree:true});
   attemptRestore();
   setTimeout(attemptRestore,5100);
  }
  function pause(){
   clearTimeout(timer);
   remember();
   foreground=false;
  }
  document.addEventListener('click',event=>{
   const link=event.target.closest('a[href]');
   if(!link||link.target&&link.target!=='_self'||event.ctrlKey||event.metaKey)return;
   const next=new URL(link.href);
   if(next.origin===base.origin&&next.pathname===new URL('index.html',base).pathname){
    try{sessionStorage.setItem(HOME,'1')}catch(_){}
   }
   remember();
   schedule();
  },true);
  document.addEventListener('visibilitychange',()=>{
   if(document.hidden)pause();
   else{foreground=true;schedule()}
  });
  root.addEventListener('pagehide',pause);
  root.addEventListener('pageshow',()=>{foreground=!document.hidden});
  root.addEventListener('focus',()=>{foreground=!document.hidden;schedule()});
  root.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('scroll',schedule,{passive:true,capture:true});
  document.addEventListener('input',schedule);
  document.addEventListener('change',schedule);
  document.addEventListener('toggle',schedule,true);
  document.addEventListener('semuon-before-sync',remember);
  return {redirected:false,ready,remember};
 }
 function readQuiz(course){
  const value=read(KEY+'-quiz-'+course);
  return value?.version===1?value:null;
 }
 function saveQuiz(course,value){
  try{localStorage.setItem(KEY+'-quiz-'+course,JSON.stringify({version:1,...value}))}catch(_){}
 }
 root.SemuonResume={open,readQuiz,saveQuiz};
})(globalThis);
