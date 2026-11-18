/* A modeless viewer keeps the question and entry fields available while reading evidence. */
(function(root){
 'use strict';

 const icons={
  fit:'<path d="m9 9-5-5m0 5V4h5m6 5 5-5m-5 0h5v5M9 15l-5 5m0-5v5h5m6-5 5 5m-5 0h5v-5"/>',
  transparency:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18m0-4 6-6m-6 1 5-5m-4 13 7-7"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  corner:'<path d="m7 20 13-13m-7 13 7-7m-1 7 1-1"/>'
 };
 const icon=name=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
 const clamp=(value,min,max)=>Math.max(min,Math.min(value,max));
 const preferences={docked:false,floating:null,dockHeight:null,transparency:0};
 const questionPreferences={floating:null,transparency:0};
 let floating=null,manual=null,sequence=0;

 function mountZoom(viewport,img,signal){
  const pointers=new Map();
  let scale=1, pinch=null;
  const fitWidth=()=>img.naturalHeight?Math.min(viewport.offsetWidth,
   viewport.offsetHeight*img.naturalWidth/img.naturalHeight):0;
  function sizeImage(){
   const fit=fitWidth();
   if(fit>0)img.style.width=Math.floor(fit*scale)+'px';
  }
  const observer=new ResizeObserver(sizeImage);
  observer.observe(viewport);
  signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
  img.addEventListener('load',sizeImage);

  function zoom(next,x,y){
   const fit=fitWidth();
   if(!fit||!Number.isFinite(next))return;
   const box=viewport.getBoundingClientRect(),before=img.getBoundingClientRect();
   x??=box.left+viewport.clientWidth/2;
   y??=box.top+viewport.clientHeight/2;
   const u=Math.max(0,Math.min(1,(x-before.left)/before.width));
   const v=Math.max(0,Math.min(1,(y-before.top)/before.height));
   scale=clamp(next,.5,Math.max(8,img.naturalWidth/fit));
   sizeImage();
   const after=img.getBoundingClientRect();
   viewport.scrollLeft+=after.left+after.width*u-x;
   viewport.scrollTop+=after.top+after.height*v-y;
  }

  function reset(){
   scale=1;
   sizeImage();
   viewport.scrollLeft=viewport.scrollTop=0;
  }

  viewport.addEventListener('wheel',event=>{
   if(!event.ctrlKey||!event.deltaY)return;
   event.preventDefault();
   zoom(scale*(event.deltaY<0?1.15:1/1.15),event.clientX,event.clientY);
  },{passive:false});
  viewport.addEventListener('contextmenu',event=>{
   if(event.pointerType==='pen'||event.pointerType==='touch'||[...pointers.values()].some(p=>p.type!=='mouse'))event.preventDefault();
  });

  function touchPair(){
   const [a,b]=[...pointers.values()].filter(p=>p.type==='touch');
   return b?{distance:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2}:null;
  }
  viewport.addEventListener('pointerdown',event=>{
   if(event.button!==0||event.defaultPrevented||viewport.closest('.problem-ink-active [data-ink-for]'))return;
   event.preventDefault();
   const {clientX:x,clientY:y,pointerType:type,pointerId:id}=event;
   pointers.set(id,{x,y,type,startX:x,startY:y,at:performance.now(),scale});
   viewport.setPointerCapture(id);
   pinch=touchPair();
  });
  viewport.addEventListener('pointermove',event=>{
   const p=pointers.get(event.pointerId);
   if(!p)return;
   const dx=event.clientX-p.x,dy=event.clientY-p.y;
   p.x=event.clientX;p.y=event.clientY;
   const pair=touchPair();
   if(pair){
    if(pinch&&pinch.distance>0&&pair.distance>0){
     zoom(scale*pair.distance/pinch.distance,pinch.x,pinch.y);
     viewport.scrollLeft-=pair.x-pinch.x;
     viewport.scrollTop-=pair.y-pinch.y;
    }
    pinch=pair;
    return;
   }
   if(p.type==='pen'&&!p.mode){
    if(performance.now()-p.at>=320)p.mode='zoom';
    else if(Math.hypot(p.x-p.startX,p.y-p.startY)>8)p.mode='pan';
    else return;
   }
   if(p.mode==='zoom')zoom(p.scale*Math.exp((p.startY-p.y)/100),p.startX,p.startY);
   else{
    viewport.scrollLeft-=dx;
    viewport.scrollTop-=dy;
   }
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(name,event=>{
   pointers.delete(event.pointerId);
   pinch=touchPair();
  });
  return reset;
 }

 function screenBounds(){
  const view=root.visualViewport;
  const left=(view?.offsetLeft||0)+8,top=(view?.offsetTop||0)+8;
  return{left,top,right:left+Math.max(1,(view?.width||root.innerWidth)-16),
   bottom:top+Math.max(1,(view?.height||root.innerHeight)-16)};
 }

 function open(preview,trigger){
  const inline=!trigger;
  const source=preview.querySelector('.question-conditions-source');
  const formContext=source?preview.closest('.tax-form-context'):null;
  const voucherLayout=preview.closest('.voucher-evidence-layout');
  const voucherQuestion=voucherLayout?.querySelector('.question-top');
  const voucherEntry=voucherLayout?.querySelector('.kclep-shell');
  const topbar=formContext?document.querySelector('.app-topbar'):null;
  const images=[...(preview.querySelector('template')?.content.querySelectorAll('img')||[])];
  if(!source&&!images.length)return;
  const prefs=source?questionPreferences:preferences;
  const label=source?'문제 조건':'증빙 미리보기';
  const closeLabel=source?'문제 조건 창 닫기':'증빙 창 닫기';
  const fitLabel=source?'내용 맞춤':'이미지 맞춤';
  const lifetime=new AbortController(),{signal}=lifetime;
  let docked=inline||preferences.docked,dockHeight=null;
  const panel=document.createElement('section');
  panel.id='evidence-window-'+(++sequence);
  const transparencyId=panel.id+'-transparency';
  panel.className='evidence-window';
  const problem=preview.closest('[data-problem-id]');
  if(problem)panel.dataset.inkFor=problem.dataset.problemId;
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label',label);
  panel.innerHTML=`<header class="evidence-bar">
    <strong class="evidence-handle">${label}</strong>
    <button type="button" class="evidence-mode"></button>
    <button type="button" class="evidence-transparency-toggle" aria-label="투명도 조절" title="투명도 조절" aria-controls="${transparencyId}" aria-expanded="false">${icon('transparency')}</button>
    <button type="button" class="evidence-close" aria-label="${closeLabel}" title="${closeLabel}">${icon('close')}</button>
    <button type="button" class="evidence-fit" aria-label="${fitLabel}" title="${fitLabel}">${icon('fit')}</button>
    <label id="${transparencyId}" class="evidence-transparency" hidden>투명도 <input type="range" min="0" max="65" step="5"><output></output></label>
   </header>
   <label class="evidence-picker" hidden><span class="sr-only">증빙 선택</span><select></select></label>
   <div class="evidence-viewport" tabindex="0" aria-label="${source?'문제 본문과 자료':'증빙 이미지'}"></div>
   <div class="evidence-size-bar">
    <button type="button" class="evidence-height" aria-label="창 높이 조절" title="아래쪽을 끌어서 높이 조절"></button>
    <button type="button" class="evidence-corner" aria-label="창 너비와 높이 조절" title="모서리를 끌어서 너비와 높이 조절">${icon('corner')}</button>
   </div>
   ${voucherLayout?`<button type="button" class="evidence-width" aria-label="창 너비 조절" title="왼쪽을 끌어서 창 너비 조절"></button>`:''}`;
  const get=selector=>panel.querySelector(selector);
  const viewport=get('.evidence-viewport'),handle=get('.evidence-handle'),mode=get('.evidence-mode');
  const picker=get('select'),corner=get('.evidence-corner'),widthGrip=get('.evidence-width');
  const closeButton=get('.evidence-close');
  const bar=get('.evidence-bar');

  // Touch controls must still respond after the floating window has been dragged.
  let buttonTouch=null;
  bar.addEventListener('touchstart',event=>{
   const button=event.target.closest('button'),touch=event.changedTouches[0];
   buttonTouch=button&&event.touches.length===1?{button,touch,at:performance.now()}:null;
  },{passive:true,signal});
  bar.addEventListener('touchcancel',()=>{buttonTouch=null},{signal});
  bar.addEventListener('touchend',event=>{
   const start=buttonTouch,touch=event.changedTouches[0];
   buttonTouch=null;
   if(!start||!event.cancelable||touch.identifier!==start.touch.identifier||
      performance.now()-start.at>480||Math.hypot(touch.clientX-start.touch.clientX,touch.clientY-start.touch.clientY)>10)return;
   event.preventDefault();
   start.button.click();
  },{passive:false,signal});
  const transparency=get('.evidence-transparency'),slider=transparency.querySelector('input'),opacityButton=get('.evidence-transparency-toggle');
  let reset;
  const img=document.createElement('img');
  if(source){
   panel.classList.add('question-conditions-window');
   viewport.append(source);
   reset=()=>{
    if(docked)dockHeight=null;
    frame(true);
    viewport.scrollTo(0,0);
    source.querySelectorAll('.table-scroll').forEach(table=>table.scrollLeft=0);
   };
  }else{
   img.draggable=false;
   if(inline)img.loading='lazy';
   if(problem){
    const imageSurface=document.createElement('div');
    imageSurface.className='evidence-ink-image';
    imageSurface.append(img);
    viewport.append(imageSurface);
   }else viewport.append(img);
   reset=mountZoom(viewport,img,signal);
   images.forEach((image,index)=>picker.add(new Option(image.alt,String(index))));
   picker.closest('label').hidden=images.length===1;
   function selectImage(index){
    root.SemuonQuizInk?.clearRegion(img.parentElement);
    reset();
    img.alt=images[index].alt;
    img.src=images[index].getAttribute('src');
   }
   picker.onchange=()=>selectImage(Number(picker.value));
   selectImage(0);
  }

  function showTransparency(show){
   transparency.hidden=!show;
   opacityButton.setAttribute('aria-expanded',String(show));
   if(show)slider.focus({preventScroll:true});
  }
  function setTransparency(){
   prefs.transparency=slider.valueAsNumber;
   panel.style.setProperty('--evidence-opacity',String(1-prefs.transparency/100));
   transparency.querySelector('output').textContent=prefs.transparency+'%';
  }
  slider.value=prefs.transparency;
  slider.oninput=setTransparency;
  setTransparency();
  opacityButton.onclick=()=>showTransparency(transparency.hidden);

  function frame(fit=false){
   const bounds=screenBounds(),maxWidth=bounds.right-bounds.left,maxHeight=bounds.bottom-bounds.top;
   if(docked){
    let desired=preferences.dockHeight??380;
    let limitHeight=maxHeight;
    if(source){
     const sticky=formContext&&getComputedStyle(formContext).position==='sticky';
     if(sticky){
      const top=(topbar?.offsetHeight||68)+8;
      formContext.style.setProperty('--tax-context-top',top+'px');
      limitHeight=Math.max(1,maxHeight-top);
     }
     const chrome=panel.offsetHeight-viewport.offsetHeight;
     const preferred=sticky?limitHeight:Math.min(400,Math.max(180,maxHeight*.52));
     desired=dockHeight??Math.min(preferred,chrome+source.offsetHeight+2);
    }else if(inline){
     const narrow=root.matchMedia('(max-width:1100px)').matches;
     const limit=Math.min(narrow?380:540,maxHeight*(narrow?0.53:0.68));
     const chrome=panel.offsetHeight-viewport.offsetHeight;
     const fitted=img.naturalWidth?chrome+preview.clientWidth*img.naturalHeight/img.naturalWidth:limit;
     const pairedHeight=voucherEntry&&!narrow
      ?voucherEntry.getBoundingClientRect().bottom-voucherLayout.getBoundingClientRect().top
      :Math.min(limit,fitted);
     desired=dockHeight??pairedHeight;
    }
    const height=clamp(desired,Math.min(source?110:180,limitHeight),limitHeight);
    Object.assign(panel.style,{left:'',top:'',width:'',height:height+'px'});
    return;
   }
   const initialWidth=Math.min(570,maxWidth*.88);
   const initialHeight=Math.min(440,maxHeight*.62);
   if(fit===true&&source){
    const {left,top}=panel.getBoundingClientRect();
    prefs.floating={left,top,width:initialWidth,height:initialHeight};
   }
   const rect=prefs.floating??{left:bounds.right-initialWidth-Math.min(140,maxWidth*.08),
    top:bounds.top+48,width:initialWidth,height:initialHeight};
   const width=clamp(rect.width,Math.min(248,maxWidth),maxWidth);
   const height=clamp(rect.height,Math.min(180,maxHeight),maxHeight);
   panel.style.width=width+'px';
   panel.style.height=height+'px';
   const handleInset=handle.offsetLeft,grip=Math.min(48,handle.offsetWidth);
   const minLeft=bounds.left-handleInset-handle.offsetWidth+grip;
   const maxLeft=bounds.right-handleInset-grip;
   panel.style.left=clamp(rect.left,minLeft,maxLeft)+'px';
   panel.style.top=clamp(rect.top,bounds.top,Math.max(bounds.top,bounds.bottom-bar.offsetHeight))+'px';
  }
  function place(reveal=false){
   if(docked){
    if(floating===viewer)floating=null;
   }else{
    if(floating!==viewer)floating?.dismiss(false);
    floating=viewer;
   }
   (docked?preview:document.body).append(panel);
   panel.classList.toggle('evidence-floating',!docked);
   preview.classList.toggle('evidence-docked',docked);
   if(trigger)trigger.hidden=docked;
   closeButton.hidden=inline&&docked;
   corner.hidden=docked;
   mode.textContent=docked?'이동':'고정';
   mode.title=docked?`움직이는 ${label} 창으로 전환`:`${label} 창을 문제에 고정`;
   handle.tabIndex=docked?-1:0;
   handle.title=docked?'':'제목을 끌거나 방향키로 창 이동';
   frame();
   if(docked&&reveal)panel.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  mode.onclick=()=>{
   if(docked&&formContext&&!prefs.floating&&getComputedStyle(formContext).position==='sticky'){
    const rect=panel.getBoundingClientRect();
    prefs.floating={left:rect.left,top:rect.top,width:rect.width,height:Math.min(rect.height,440)};
   }
   docked=!docked;
   if(!inline)preferences.docked=docked;
   place(true);
   mode.focus({preventScroll:true});
  };

  let drag=null;
  function adjust(action,rect,dx,dy){
   const bounds=screenBounds();
   if(docked){
    if(action==='left'){
     const width=voucherLayout.clientWidth-parseFloat(getComputedStyle(voucherLayout).columnGap);
     const share=clamp((rect.width-dx)/width,.30,.66);
     voucherLayout.style.setProperty('--voucher-evidence-width',share/(1-share)+'fr');
    }else if(inline)dockHeight=rect.height+dy;
    else preferences.dockHeight=rect.height+dy;
   }else if(action==='move'){
    prefs.floating={left:rect.left+dx,top:rect.top+dy,width:rect.width,height:rect.height};
   }else{
    const maxWidth=bounds.right-bounds.left,maxHeight=bounds.bottom-bounds.top;
    const width=action==='left'||action==='corner'
     ?clamp(rect.width+(action==='left'?-dx:dx),Math.min(248,maxWidth),maxWidth):rect.width;
    prefs.floating={left:action==='left'?rect.right-width:rect.left,top:rect.top,width,
     height:action==='left'?rect.height:clamp(rect.height+dy,Math.min(180,maxHeight),maxHeight)};
   }
   frame();
  }
  function bindGrip(grip,action){
   grip.addEventListener('pointerdown',event=>{
    if(event.button!==0||drag||action==='move'&&docked)return;
    event.preventDefault();
    showTransparency(false);
    drag={grip,id:event.pointerId,x:event.clientX,y:event.clientY,rect:panel.getBoundingClientRect()};
    grip.setPointerCapture(event.pointerId);
   });
   grip.addEventListener('pointermove',event=>{
    if(drag?.grip===grip&&drag.id===event.pointerId)adjust(action,drag.rect,event.clientX-drag.x,event.clientY-drag.y);
   });
   for(const name of ['pointerup','pointercancel','lostpointercapture'])grip.addEventListener(name,event=>{
    if(drag?.grip===grip&&drag.id===event.pointerId)drag=null;
   });
   grip.addEventListener('keydown',event=>{
    const delta={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];
    if(!delta||action==='height'&&delta[0]||action==='left'&&delta[1]||action==='move'&&docked)return;
    event.preventDefault();
    adjust(action,panel.getBoundingClientRect(),...delta);
   });
  }
  bindGrip(handle,'move');
  bindGrip(get('.evidence-height'),'height');
  bindGrip(corner,'corner');
  if(widthGrip)bindGrip(widthGrip,'left');

  function destroy(restoreFocus=true){
   lifetime.abort();
   observer.disconnect();
   panel.remove();
   preview.classList.remove('evidence-docked');
   if(floating===viewer)floating=null;
   if(manual===viewer)manual=null;
   if(!trigger)return;
   trigger.hidden=false;
   trigger.setAttribute('aria-expanded','false');
   trigger.removeAttribute('aria-controls');
   if(restoreFocus&&trigger.isConnected)trigger.focus({preventScroll:true});
  }
  function dismiss(restoreFocus=true){
   if(!inline){destroy(restoreFocus);return}
   docked=true;
   place();
   if(restoreFocus)mode.focus({preventScroll:true});
  }
  const viewer={preview,dismiss};
  const observer=new MutationObserver(()=>{if(!preview.isConnected)destroy(false)});
  observer.observe(preview.closest('#content')||document.body,{childList:true,subtree:true});
  if(source){
   const sizeObserver=new ResizeObserver(()=>{if(docked)frame()});
   sizeObserver.observe(source);
   if(topbar)sizeObserver.observe(topbar);
   signal.addEventListener('abort',()=>sizeObserver.disconnect(),{once:true});
  }else if(inline){
   img.addEventListener('load',()=>{if(docked)frame()},{signal});
   if(voucherLayout){
    const sizeObserver=new ResizeObserver(()=>{if(docked)frame()});
    sizeObserver.observe(voucherQuestion);
    sizeObserver.observe(voucherEntry);
    signal.addEventListener('abort',()=>sizeObserver.disconnect(),{once:true});
   }
  }
  root.addEventListener('resize',frame,{signal});
  root.visualViewport?.addEventListener('resize',frame,{signal});
  root.visualViewport?.addEventListener('scroll',frame,{signal});
  document.addEventListener('pointerdown',event=>{
   if(!transparency.hidden&&!transparency.contains(event.target)&&!opacityButton.contains(event.target))showTransparency(false);
  },{signal});
  panel.addEventListener('keydown',event=>{
   if(event.key!=='Escape')return;
   event.stopPropagation();
   if(transparency.hidden){if(!inline||!docked)dismiss()}
   else{showTransparency(false);opacityButton.focus({preventScroll:true})}
  });
  get('.evidence-fit').onclick=reset;
  closeButton.onclick=()=>dismiss();
  if(trigger){
   manual=viewer;
   trigger.setAttribute('aria-expanded','true');
   trigger.setAttribute('aria-controls',panel.id);
  }
  place(!inline);
  if(trigger)viewport.focus({preventScroll:true});
 }
 function toggle(trigger){
  const preview=trigger.parentElement;
  if(manual?.preview===preview){manual.dismiss();return}
  manual?.dismiss(false);
  open(preview,trigger);
 }
 function mountInline(container){
  for(const preview of container.querySelectorAll('[data-evidence-inline],[data-question-conditions]')){
   if(!preview.classList.contains('evidence-docked')&&floating?.preview!==preview)open(preview);
  }
 }
 root.SemuonEvidence={toggle,mountInline};
})(globalThis);
