/* Shared image preview and zoom for Semuon question cards. */
(function(root){
 'use strict';

 function controls(){
  return `<div class="evidence-zoom-controls" role="group" aria-label="증빙 크기 조절">
    <button type="button" class="btn secondary" data-zoom="out" aria-label="축소">−</button>
    <output aria-label="맞춤 크기 기준 배율">100%</output>
    <button type="button" class="btn secondary" data-zoom="in" aria-label="확대">+</button>
    <button type="button" class="btn secondary" data-zoom="fit">맞춤</button>
  </div>`;
 }

 function mountZoom(viewport,img,toolbar){
  const pointers=new Map();
  let scale=1, pinch=null;
  const output=toolbar.querySelector('output');
  const fitWidth=()=>Math.min(img.naturalWidth,viewport.clientWidth,
   viewport.clientHeight*img.naturalWidth/img.naturalHeight);

  function zoom(next,x,y){
   const fit=fitWidth();
   if(!fit||!Number.isFinite(next))return;
   const box=viewport.getBoundingClientRect(),before=img.getBoundingClientRect();
   x??=box.left+viewport.clientWidth/2;
   y??=box.top+viewport.clientHeight/2;
   const u=Math.max(0,Math.min(1,(x-before.left)/before.width));
   const v=Math.max(0,Math.min(1,(y-before.top)/before.height));
   scale=Math.max(.5,Math.min(Math.max(8,img.naturalWidth/fit),next));
   img.classList.toggle('evidence-scaled',scale!==1);
   img.style.width=scale===1?'':Math.round(fit*scale)+'px';
   output.textContent=Math.round(scale*100)+'%';
   const after=img.getBoundingClientRect();
   viewport.scrollLeft+=after.left+after.width*u-x;
   viewport.scrollTop+=after.top+after.height*v-y;
  }

  function reset(){
   scale=1;
   img.classList.remove('evidence-scaled');
   img.style.width='';
   output.textContent='100%';
   viewport.scrollLeft=viewport.scrollTop=0;
  }
  toolbar.addEventListener('click',event=>{
   const action=event.target.closest('[data-zoom]')?.dataset.zoom;
   if(action==='fit')reset();
   else if(action==='original')zoom(img.naturalWidth/fitWidth());
   else if(action==='out'||action==='in')zoom(scale*(action==='out'?1/1.25:1.25));
  });

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

 function openViewer(images,trigger){
  const dialog=document.createElement('dialog');
  dialog.className='evidence-dialog';
  dialog.setAttribute('aria-label','증빙 보기');
  dialog.innerHTML=`<div class="evidence-tools"><strong>증빙 보기</strong>
    <label class="evidence-picker" hidden><span class="sr-only">증빙 선택</span><select></select></label>
    ${controls()}
    <button type="button" class="btn secondary evidence-close" autofocus>닫기</button>
   </div><div class="evidence-viewport" tabindex="0" aria-label="확대할 증빙 이미지"></div>`;
  const viewport=dialog.querySelector('.evidence-viewport');
  const img=document.createElement('img');
  img.draggable=false;
  viewport.append(img);
  const toolbar=dialog.querySelector('.evidence-zoom-controls');
  toolbar.insertAdjacentHTML('beforeend','<button type="button" class="btn secondary" data-zoom="original">원본 크기</button>');
  const reset=mountZoom(viewport,img,toolbar);
  const picker=dialog.querySelector('select');
  images.forEach((_,index)=>picker.add(new Option('증빙 '+(index+1),String(index))));
  picker.closest('label').hidden=images.length<2;
  function selectImage(index){
   reset();
   img.alt='증빙 '+(index+1);
   img.src=images[index].src;
  }
  picker.onchange=()=>selectImage(Number(picker.value));
  dialog.querySelector('.evidence-close').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{dialog.remove();trigger.focus({preventScroll:true})},{once:true});
  selectImage(0);
  document.body.append(dialog);
  dialog.showModal();
 }

 function mount(container){
  for(const card of container.querySelectorAll('[data-problem-id]')){
   const preview=card.querySelector('.evidence-preview');
   if(!preview||preview.dataset.zoomReady)continue;
   preview.dataset.zoomReady='true';
   const images=[];
   for(const viewport of preview.querySelectorAll('.evidence-viewport')){
    const image=viewport.querySelector('img');
    images.push(image);
    viewport.insertAdjacentHTML('afterend',controls());
    mountZoom(viewport,image,viewport.nextElementSibling);
   }
   const trigger=document.createElement('button');
   trigger.type='button';trigger.className='btn secondary evidence-quick';trigger.textContent='증빙 보기';
   trigger.onclick=()=>openViewer(images,trigger);
   const entry=card.querySelector('.kclep-shell,.entry-toggle,.tax-form-input,.choices');
   if(entry)entry.before(trigger);else preview.after(trigger);
  }
 }
 root.SemuonEvidence={mount};
})(globalThis);
