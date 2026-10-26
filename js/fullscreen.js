/* Browser fullscreen controls; Lucide 0.468.0 Maximize2/Minimize2 (ISC), bundled inline.
   No automatic entry, page navigation, or saved fullscreen state. */
(function(root){
 'use strict';
 const doc=root.document,enterPaths='<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',exitPaths='<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>';
 const guidance='전체화면을 열지 못했습니다. 브라우저 메뉴 → 홈 화면에 추가 또는 앱 설치 → 홈 화면의 세무온 아이콘으로 실행해 주세요.';
 let installed=false,pending=false,notify=()=>{},errorShown=false,attemptUntil=0,entering=true;
 const active=()=>Boolean(doc.fullscreenElement||doc.webkitFullscreenElement);
 const label=()=>active()?'전체화면 나가기':'전체화면 켜기';
 const icon=()=>`<svg data-fullscreen-icon="${active()?'exitBrowserFullscreen':'enterBrowserFullscreen'}" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${active()?exitPaths:enterPaths}</svg>`;
 function button(){return`<button type="button" class="btn secondary fullscreen-toggle" data-fullscreen-toggle aria-label="${label()}" title="${label()}" aria-pressed="${active()}">${icon()}<span data-fullscreen-label>${label()}</span></button>`}
 function refresh(){for(const b of doc.querySelectorAll('[data-fullscreen-toggle]')){b.title=label();b.setAttribute('aria-label',label());b.setAttribute('aria-pressed',String(active()));b.setAttribute('aria-disabled',String(pending));b.setAttribute('aria-busy',String(pending));b.querySelector('[data-fullscreen-icon]')?.replaceWith(svgNode());const text=b.querySelector('[data-fullscreen-label]');if(text)text.textContent=label()}}
 function svgNode(){const t=doc.createElement('template');t.innerHTML=icon();return t.content.firstElementChild}
 function failed(){if(errorShown)return;errorShown=true;notify(entering?guidance:'전체화면을 종료하지 못했습니다. Esc 또는 브라우저의 전체화면 종료 기능을 사용해 주세요.')}
 function legacyChange(run,wanted){return new Promise((resolve,reject)=>{
  let timer;const cleanup=()=>{clearTimeout(timer);for(const name of ['fullscreenchange','webkitfullscreenchange'])doc.removeEventListener(name,changed);for(const name of ['fullscreenerror','webkitfullscreenerror'])doc.removeEventListener(name,error)};
  const changed=()=>{if(active()===wanted){cleanup();resolve()}},error=()=>{cleanup();reject(Error('Fullscreen transition failed'))};
  for(const name of ['fullscreenchange','webkitfullscreenchange'])doc.addEventListener(name,changed);for(const name of ['fullscreenerror','webkitfullscreenerror'])doc.addEventListener(name,error);
  timer=setTimeout(error,5000);try{run();changed()}catch(e){cleanup();reject(e)}
 })}
 async function toggle(){
  if(pending)return;pending=true;entering=!active();errorShown=false;attemptUntil=Date.now()+5000;refresh();
  try{
   if(!entering){if(doc.exitFullscreen)await doc.exitFullscreen();else if(doc.webkitExitFullscreen)await legacyChange(()=>doc.webkitExitFullscreen(),false);else throw Error('Fullscreen exit unavailable')}
   else{const el=doc.documentElement;if(el.requestFullscreen){if(doc.fullscreenEnabled===false)throw Error('Fullscreen disabled');await el.requestFullscreen({navigationUI:'hide'})}else if(el.webkitRequestFullscreen&&doc.webkitFullscreenEnabled!==false)await legacyChange(()=>el.webkitRequestFullscreen(),true);else throw Error('Fullscreen unavailable')}
  }catch(_){failed()}
  finally{pending=false;refresh()}
 }
 function install(options={}){
  notify=options.notify||notify;if(installed){refresh();return}installed=true;
  doc.addEventListener('click',event=>{if(event.target.closest('[data-fullscreen-toggle]')){event.preventDefault();void toggle()}});
  for(const event of ['fullscreenchange','webkitfullscreenchange','visibilitychange'])doc.addEventListener(event,refresh);
  for(const event of ['fullscreenerror','webkitfullscreenerror'])doc.addEventListener(event,()=>{if(Date.now()<=attemptUntil)failed();refresh()});
  root.addEventListener('pageshow',refresh);refresh();
 }
 root.SemuonFullscreen={button,install,refresh};
})(globalThis);
