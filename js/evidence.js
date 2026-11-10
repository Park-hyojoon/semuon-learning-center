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
 let current=null;

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
   if(event.button!==0)return;
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

 function toggle(trigger){
  if(current?.trigger===trigger){current.close();return}
  const preview=trigger.parentElement;
  const images=[...preview.querySelector('template').content.querySelectorAll('img')];
  if(!images.length)return;
  current?.close(false);
  const lifetime=new AbortController(),{signal}=lifetime;
  const panel=document.createElement('section');
  panel.id='evidence-window';
  panel.className='evidence-window';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','증빙 미리보기');
  panel.innerHTML=`<header class="evidence-bar">
    <strong class="evidence-handle">증빙 미리보기</strong>
    <button type="button" class="evidence-mode"></button>
    <button type="button" class="evidence-transparency-toggle" aria-label="증빙 투명도 조절" title="증빙 투명도 조절" aria-controls="evidence-transparency" aria-expanded="false">${icon('transparency')}</button>
    <button type="button" class="evidence-close" aria-label="증빙 창 닫기" title="증빙 창 닫기">${icon('close')}</button>
    <button type="button" class="evidence-fit" aria-label="이미지 맞춤" title="이미지 맞춤">${icon('fit')}</button>
    <label id="evidence-transparency" class="evidence-transparency" hidden>투명도 <input type="range" min="0" max="65" step="5"><output></output></label>
   </header>
   <label class="evidence-picker" hidden><span class="sr-only">증빙 선택</span><select></select></label>
   <div class="evidence-viewport" tabindex="0" aria-label="증빙 이미지"></div>
   <div class="evidence-size-bar">
    <button type="button" class="evidence-height" aria-label="창 높이 조절" title="아래쪽을 끌어서 높이 조절"></button>
    <button type="button" class="evidence-corner" aria-label="창 너비와 높이 조절" title="모서리를 끌어서 너비와 높이 조절">${icon('corner')}</button>
   </div>`;
  const get=selector=>panel.querySelector(selector);
  const viewport=get('.evidence-viewport'),handle=get('.evidence-handle'),mode=get('.evidence-mode');
  const picker=get('select'),corner=get('.evidence-corner');
  const transparency=get('.evidence-transparency'),slider=transparency.querySelector('input'),opacityButton=get('.evidence-transparency-toggle');
  const img=document.createElement('img');
  img.draggable=false;
  viewport.append(img);
  const reset=mountZoom(viewport,img,signal);
  images.forEach((image,index)=>picker.add(new Option(image.alt,String(index))));
  picker.closest('label').hidden=images.length===1;
  function selectImage(index){
   reset();
   img.alt=images[index].alt;
   img.src=images[index].getAttribute('src');
  }
  picker.onchange=()=>selectImage(Number(picker.value));
  selectImage(0);

  function showTransparency(show){
   transparency.hidden=!show;
   opacityButton.setAttribute('aria-expanded',String(show));
   if(show)slider.focus({preventScroll:true});
  }
  function setTransparency(){
   preferences.transparency=slider.valueAsNumber;
   panel.style.setProperty('--evidence-opacity',String(1-preferences.transparency/100));
   transparency.querySelector('output').textContent=preferences.transparency+'%';
  }
  slider.value=preferences.transparency;
  slider.oninput=setTransparency;
  setTransparency();
  opacityButton.onclick=()=>showTransparency(transparency.hidden);

  function frame(){
   const bounds=screenBounds(),maxWidth=bounds.right-bounds.left,maxHeight=bounds.bottom-bounds.top;
   if(preferences.docked){
    const height=clamp(preferences.dockHeight??380,Math.min(180,maxHeight),maxHeight);
    Object.assign(panel.style,{left:'',top:'',width:'',height:height+'px'});
    return;
   }
   const initialWidth=Math.min(570,maxWidth*.88);
   const rect=preferences.floating??{left:bounds.right-initialWidth-Math.min(140,maxWidth*.08),
    top:bounds.top+48,width:initialWidth,height:Math.min(440,maxHeight*.62)};
   const width=clamp(rect.width,Math.min(248,maxWidth),maxWidth);
   const height=clamp(rect.height,Math.min(180,maxHeight),maxHeight);
   Object.assign(panel.style,{left:clamp(rect.left,bounds.left,bounds.right-width)+'px',
    top:clamp(rect.top,bounds.top,bounds.bottom-height)+'px',width:width+'px',height:height+'px'});
  }
  function place(){
   const docked=preferences.docked;
   (docked?preview:document.body).append(panel);
   panel.classList.toggle('evidence-floating',!docked);
   preview.classList.toggle('evidence-docked',docked);
   trigger.hidden=docked;
   corner.hidden=docked;
   mode.textContent=docked?'이동':'고정';
   mode.title=docked?'움직이는 증빙 창으로 전환':'문제에 증빙 고정';
   handle.tabIndex=docked?-1:0;
   handle.title=docked?'':'제목을 끌거나 방향키로 창 이동';
   frame();
   if(docked)panel.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  mode.onclick=()=>{
   preferences.docked=!preferences.docked;
   place();
   mode.focus({preventScroll:true});
  };

  let drag=null;
  function adjust(action,rect,dx,dy){
   const bounds=screenBounds();
   if(preferences.docked){
    preferences.dockHeight=rect.height+dy;
   }else if(action==='move'){
    preferences.floating={left:rect.left+dx,top:rect.top+dy,width:rect.width,height:rect.height};
   }else{
    const maxWidth=bounds.right-rect.left,maxHeight=bounds.bottom-rect.top;
    preferences.floating={left:rect.left,top:rect.top,
     width:action==='corner'?clamp(rect.width+dx,Math.min(248,maxWidth),maxWidth):rect.width,
     height:clamp(rect.height+dy,Math.min(180,maxHeight),maxHeight)};
   }
   frame();
  }
  function bindGrip(grip,action){
   grip.addEventListener('pointerdown',event=>{
    if(event.button!==0||drag||action==='move'&&preferences.docked)return;
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
    if(!delta||action==='height'&&delta[0]||action==='move'&&preferences.docked)return;
    event.preventDefault();
    adjust(action,panel.getBoundingClientRect(),...delta);
   });
  }
  bindGrip(handle,'move');
  bindGrip(get('.evidence-height'),'height');
  bindGrip(corner,'corner');

  function close(restoreFocus=true){
   lifetime.abort();
   observer.disconnect();
   panel.remove();
   preview.classList.remove('evidence-docked');
   trigger.hidden=false;
   trigger.setAttribute('aria-expanded','false');
   trigger.removeAttribute('aria-controls');
   current=null;
   if(restoreFocus&&trigger.isConnected)trigger.focus({preventScroll:true});
  }
  const observer=new MutationObserver(()=>{if(!trigger.isConnected)close(false)});
  observer.observe(trigger.closest('#content')||document.body,{childList:true,subtree:true});
  root.addEventListener('resize',frame,{signal});
  root.visualViewport?.addEventListener('resize',frame,{signal});
  root.visualViewport?.addEventListener('scroll',frame,{signal});
  document.addEventListener('pointerdown',event=>{
   if(!transparency.contains(event.target)&&!opacityButton.contains(event.target))showTransparency(false);
  },{signal});
  panel.addEventListener('keydown',event=>{
   if(event.key!=='Escape')return;
   event.stopPropagation();
   if(transparency.hidden)close();
   else{showTransparency(false);opacityButton.focus({preventScroll:true})}
  });
  get('.evidence-fit').onclick=reset;
  get('.evidence-close').onclick=()=>close();
  current={trigger,close};
  trigger.setAttribute('aria-expanded','true');
  trigger.setAttribute('aria-controls',panel.id);
  place();
  viewport.focus({preventScroll:true});
 }
 root.SemuonEvidence={toggle};
})(globalThis);
