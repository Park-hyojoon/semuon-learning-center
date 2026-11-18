/* Temporary, per-question handwritten notes for the study quizzes. */
(function(root){
 'use strict';

 const widths={pen:[1,12,3],marker:[6,32,14]};
 const labels={pen:'펜',marker:'형광펜',eraser:'획 지우개',width:'굵기 조절',clear:'필기 전체 지우기',image:'이미지 추가',move:'이미지 이동·크기 조절'};
 const icons={pen:'Pencil',marker:'Highlighter',eraser:'Eraser',width:'Settings2',clear:'Trash2',image:'ImagePlus',move:'Move'};
 const keys={pen:'B',marker:'P',eraser:'E',clear:'D'};
 const isDrawingTool=tool=>tool==='pen'||tool==='marker'||tool==='eraser';

 function mountImages(paper,picker,{added,changed,notify}){
  const layer=paper.querySelector('.quiz-ink-images'),pages=new Map();
  let question=null;
  const accepted=/^image\/(?:png|jpeg|webp|bmp|gif|avif)$/;
  const clamp=(value,min,max)=>Math.max(min,Math.min(value,max));

  function position(rect,entry,dx=0,dy=0,resize=0){
   const {width,height}=rect;
   if(!width||!height)return;
   const full=Math.min(width,height*entry.aspect);
   let w=clamp(entry.width*width,Math.min(48,full),full);
   let x=clamp(entry.x*width,0,width-w),y=clamp(entry.y*width,0,height-w/entry.aspect);
   if(resize){
    const max=Math.min(width-x,(height-y)*entry.aspect);
    w=clamp(w+resize,Math.min(48,max),max);
   }else{
    x=clamp(x+dx,0,width-w);
    y=clamp(y+dy,0,height-w/entry.aspect);
   }
   entry.x=x/width;entry.y=y/width;entry.width=w/width;
   Object.assign(entry.node.style,{left:entry.x*100+'%',top:y/height*100+'%',width:entry.width*100+'%'});
  }
  function createEntry(file,url,image,rect,index){
   const node=document.createElement('div');
   node.className='quiz-ink-image';
   node.tabIndex=0;
   node.setAttribute('role','group');
   node.setAttribute('aria-label','붙인 이미지 이동');
   image.alt=file.name==='image.png'?'붙인 캡처 이미지':file.name||'붙인 이미지';
   image.draggable=false;
   const resize=document.createElement('button'),remove=document.createElement('button');
   resize.type=remove.type='button';
   resize.className='quiz-image-resize';remove.className='quiz-image-remove';
   resize.setAttribute('aria-label','이미지 크기 조절');
   resize.title='오른쪽 아래를 끌어서 이미지 크기 조절';
   resize.innerHTML=root.SemuonJournalIcons.Maximize2;
   remove.setAttribute('aria-label','이 이미지 삭제');
   remove.title='이 이미지 삭제';
   remove.innerHTML=root.SemuonJournalIcons.X;
   node.append(image,resize,remove);

   const aspect=image.naturalWidth/image.naturalHeight;
   const width=Math.min(.72,rect.height*.72*aspect/rect.width);
   const offset=12*index;
   const entry={url,node,aspect,width,x:(18+offset)/rect.width,y:(18+offset)/rect.width};
   let drag=null;
   node.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.target.closest('.quiz-image-remove')||drag)return;
    event.preventDefault();
    layer.append(node);
    node.focus({preventScroll:true});
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:{...entry},resize:resize.contains(event.target)};
    node.setPointerCapture(event.pointerId);
   });
   node.addEventListener('pointermove',event=>{
    if(drag?.id!==event.pointerId)return;
    const rect=layer.getBoundingClientRect();
    Object.assign(entry,drag.start);
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(drag.resize)position(rect,entry,0,0,Math.abs(dx)>=Math.abs(dy*aspect)?dx:dy*aspect);
    else position(rect,entry,dx,dy);
   });
   for(const type of ['pointerup','pointercancel','lostpointercapture'])node.addEventListener(type,event=>{
    if(drag?.id===event.pointerId)drag=null;
   });
   node.addEventListener('keydown',event=>{
    const delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[event.key];
    if(!delta||event.target===remove)return;
    event.preventDefault();
    const rect=layer.getBoundingClientRect();
    if(event.target===resize)position(rect,entry,0,0,delta[0]||delta[1]*aspect);
    else position(rect,entry,...delta);
   });
   remove.onclick=()=>{
    pages.get(question)?.delete(entry);
    node.remove();
    URL.revokeObjectURL(url);
    paper.focus({preventScroll:true});
    changed();
   };
   position(rect,entry);
   return entry;
  }
  async function add(file){
   if(!question||!file)return;
   if(!accepted.test(file.type)){notify('PNG, JPG 등 그림 파일을 선택해 주세요.');return}
   const owner=question,current=pages.get(owner),url=URL.createObjectURL(file),image=new Image();
   image.src=url;
   try{await image.decode()}catch(_){URL.revokeObjectURL(url);notify('이미지를 열 수 없습니다.');return}
   if(pages.get(owner)!==current){URL.revokeObjectURL(url);return}
   const rect=layer.getBoundingClientRect();
   if(!rect.width||!rect.height){URL.revokeObjectURL(url);return}
   const entry=createEntry(file,url,image,rect,current.size);
   current.add(entry);
   if(owner===question){layer.append(entry.node);added()}
  }
  document.addEventListener('paste',event=>{
   if(!question||event.defaultPrevented)return;
   const data=event.clipboardData,file=[...(data?.files||[])].find(file=>file.type.startsWith('image/'));
   if(!file)return;
   if(event.target.closest?.('input,textarea,[contenteditable=true]')&&data.getData('text/plain'))return;
   event.preventDefault();
   void add(file);
  });
  picker.addEventListener('change',()=>{
   void add(picker.files?.[0]);
   picker.value='';
  });
  new ResizeObserver(()=>{
   const rect=layer.getBoundingClientRect();
   for(const entry of pages.get(question)||[])position(rect,entry);
  }).observe(layer);
  return {
   show(next){
    question=next;
    if(question&&!pages.has(question))pages.set(question,new Set());
    const rect=layer.getBoundingClientRect();
    const entries=[...(pages.get(question)||[])];
    layer.replaceChildren(...entries.map(entry=>entry.node));
    for(const entry of entries)position(rect,entry);
   },
   reset(){
    for(const entry of pages.get(question)||[])URL.revokeObjectURL(entry.url);
    pages.delete(question);
    layer.replaceChildren();
   },
   setEditable(on){layer.inert=!on},
   get hasImages(){return Boolean(pages.get(question)?.size)}
  };
 }

 function mountSurface(canvas,target,{sizes,changed}){
  const ctx=canvas.getContext('2d');
  if(!ctx)return null;
  const notes=new Map();
  let tool='',question=null,strokes=new Set(),gesture=null,frame=0;
  let size={width:1,height:1,ratio:1},lastPen=0;

  function makePath(points){
   // Scale both axes by width so handwriting still lines up when the quiz grows taller.
   const path=new Path2D(),first=points[0];
   path.moveTo(first.x*size.width,first.y*size.width);
   if(points.length===1)path.lineTo(first.x*size.width+.01,first.y*size.width);
   else for(const p of points.slice(1))path.lineTo(p.x*size.width,p.y*size.width);
   return path;
  }
  function draw(){
   if(frame)cancelAnimationFrame(frame);
   frame=0;
   ctx.setTransform(size.ratio,0,0,size.ratio,0,0);
   ctx.clearRect(0,0,size.width,size.height);
   const ink=getComputedStyle(target).getPropertyValue('--ink').trim()||'#273b37';
   ctx.lineCap=ctx.lineJoin='round';
   for(const stroke of strokes){
    stroke.path??=makePath(stroke.points);
    ctx.globalAlpha=stroke.tool==='marker'?.44:1;
    ctx.strokeStyle=stroke.tool==='marker'?'#e5b829':ink;
    ctx.lineWidth=stroke.width;
    ctx.stroke(stroke.path);
   }
  }
  function scheduleDraw(){if(!frame)frame=requestAnimationFrame(draw)}
  function resize(){
   const rect=canvas.getBoundingClientRect();
   if(!rect.width||!rect.height)return;
   const ratio=Math.min(devicePixelRatio||1,3,8192/Math.max(rect.width,rect.height),Math.sqrt(8e6/(rect.width*rect.height)));
   if(rect.width===size.width&&rect.height===size.height&&ratio===size.ratio)return;
   if(rect.width!==size.width){
    for(const note of notes.values())for(const stroke of note)stroke.path=null;
   }
   size={width:rect.width,height:rect.height,ratio};
   canvas.width=Math.round(rect.width*ratio);
   canvas.height=Math.round(rect.height*ratio);
   draw();
  }
  function finish(){
   const active=gesture;
   gesture=null;
   if(active&&target.hasPointerCapture(active.id))target.releasePointerCapture(active.id);
  }
  const point=(event,rect)=>({x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.width});
  function erase(from,to){
   const x=from.x*size.width,y=from.y*size.width;
   const dx=(to.x-from.x)*size.width,dy=(to.y-from.y)*size.width;
   const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
   ctx.save();
   ctx.setTransform(1,0,0,1,0,0);
   ctx.lineCap=ctx.lineJoin='round';
   let erased=false;
   for(const stroke of strokes){
    stroke.path??=makePath(stroke.points);
    ctx.lineWidth=stroke.width+16;
    for(let i=0;i<=steps;i++){
     if(!ctx.isPointInStroke(stroke.path,x+dx*i/steps,y+dy*i/steps))continue;
     strokes.delete(stroke);
     erased=true;
     break;
    }
   }
   ctx.restore();
   if(erased){changed();scheduleDraw()}
  }
  target.addEventListener('pointerdown',event=>{
   if(!question||!tool||gesture||event.button!==0||!event.isPrimary)return;
   if(target!==canvas&&event.target.closest('input,textarea,select,button,a,summary,[contenteditable],[role=button]'))return;
   const rect=canvas.getBoundingClientRect();
   if(!rect.width||!rect.height)return;
   if(event.pointerType==='pen')lastPen=Date.now();
   if(event.pointerType==='touch'&&Date.now()-lastPen<600)return;
   event.preventDefault();
   const start=point(event,rect);
   gesture={id:event.pointerId,last:start,stroke:null};
   target.setPointerCapture(event.pointerId);
   if(tool==='eraser'){erase(start,start);return}
   gesture.stroke={tool,width:sizes[tool],points:[start],path:null};
   strokes.add(gesture.stroke);
   changed({drawing:true});
   scheduleDraw();
  });
  function extend(event){
   if(gesture?.id!==event.pointerId)return;
   const rect=canvas.getBoundingClientRect();
   const events=event.getCoalescedEvents?.()||[];
   for(const sample of events.length?events:[event]){
    const next=point(sample,rect),last=gesture.last;
    if(next.x===last.x&&next.y===last.y)continue;
    if(gesture.stroke){
     gesture.stroke.points.push(next);
     gesture.stroke.path=null;
    }else erase(last,next);
    gesture.last=next;
   }
   if(gesture.stroke)scheduleDraw();
  }
  target.addEventListener('pointermove',extend);
  target.addEventListener('pointerup',event=>{
   if(gesture?.id!==event.pointerId)return;
   extend(event);
   finish();
  });
  for(const type of ['pointercancel','lostpointercapture'])target.addEventListener(type,event=>{
   if(gesture?.id===event.pointerId)finish();
  });
  new ResizeObserver(resize).observe(canvas);
  resize();
  return {
   setTool(next){
    if(next!==tool)finish();
    tool=next;
    target.dataset.tool=tool;
   },
   show(next){
    finish();
    question=next;
    if(question&&!notes.has(question))notes.set(question,new Set());
    strokes=question?notes.get(question):new Set();
    draw();
   },
   clear(){
    finish();
    strokes.clear();
    draw();
   },
   get hasStrokes(){return strokes.size>0}
  };
 }

 function mount(toolbar,paper,problem){
  const paperCanvas=paper.querySelector('canvas');
  const sizes={pen:widths.pen[2],marker:widths.marker[2]};
  const surfaces=[
   mountSurface(problem.querySelector('canvas'),problem,{sizes,changed:surfaceChanged}),
   mountSurface(paperCanvas,paperCanvas,{sizes,changed:surfaceChanged})
  ].filter(Boolean);
  if(!surfaces.length)return null;
  const iconsHTML=root.SemuonJournalIcons;
  toolbar.innerHTML=Object.keys(labels).map(action=>{
   const state=action==='width'?' aria-expanded="false" aria-controls="quiz-ink-width"':
    action==='clear'?'':' aria-pressed="false" aria-controls="quiz-ink-question quiz-ink-paper"';
   const key=keys[action],shortcut=key?` aria-keyshortcuts="${key}"`:'';
   const title=key?`${labels[action]} (${key})`:labels[action];
   return `<button type="button" data-ink-action="${action}" aria-label="${labels[action]}" title="${title}"${state}${shortcut}>${iconsHTML[icons[action]]}</button>`;
  }).join('')+`<input type="file" accept="image/png,image/jpeg,image/webp,image/bmp,image/gif,image/avif" hidden>
  <div id="quiz-ink-width" class="quiz-ink-width" hidden>
   <label><span>굵기</span><input type="range"><output></output></label>
  </div><span class="sr-only" role="status"></span>`;

  const buttons=[...toolbar.querySelectorAll('[data-ink-action]')];
  const widthButton=toolbar.querySelector('[data-ink-action=width]');
  const clearButton=toolbar.querySelector('[data-ink-action=clear]');
  const widthPanel=toolbar.querySelector('#quiz-ink-width'),slider=widthPanel.querySelector('input');
  const status=toolbar.querySelector('[role=status]');
  const picker=toolbar.querySelector('[type=file]');
  let tool='',question=null;
  const images=mountImages(paper,picker,{
   added(){chooseTool('move');status.textContent='이미지를 필기 공간에 붙였습니다.'},
   changed:updateTools,
   notify:message=>{status.textContent=message}
  });

  function showWidth(open){
   widthPanel.hidden=!open;
   widthButton.setAttribute('aria-expanded',String(open));
   if(!open)return;
   [slider.min,slider.max]=widths[tool];
   slider.value=sizes[tool];
   slider.setAttribute('aria-label',labels[tool]+' 굵기');
   widthPanel.querySelector('output').textContent=slider.value+'px';
   slider.focus({preventScroll:true});
  }
  function updateTools(){
   const drawing=question&&isDrawingTool(tool)?tool:'';
   for(const surface of surfaces)surface.setTool(drawing);
   images.setEditable(!drawing);
   const hasStrokes=surfaces.some(surface=>surface.hasStrokes);
   for(const button of buttons){
    const action=button.dataset.inkAction;
    if(button.hasAttribute('aria-pressed'))button.setAttribute('aria-pressed',String(Boolean(question)&&action===tool));
    button.disabled=!question||(action==='clear'&&!hasStrokes)||(action==='width'&&!widths[tool])||(action==='move'&&!images.hasImages);
   }
  }
  function surfaceChanged({drawing=false}={}){
   if(drawing)status.textContent='';
   updateTools();
  }
  function show(next){
   question=next;
   for(const surface of surfaces)surface.show(next);
   images.show(next);
   if(!question)showWidth(false);
   updateTools();
  }
  function clear(){
   for(const surface of surfaces)surface.clear();
   updateTools();
  }
  function clearInk(){
   clear();
   status.textContent='필기를 모두 지웠습니다.';
  }
  function chooseTool(next){
   tool=next;
   showWidth(false);
   updateTools();
  }
  toolbar.addEventListener('click',event=>{
   const button=event.target.closest('[data-ink-action]');
   if(!button||button.disabled)return;
   const action=button.dataset.inkAction;
   if(action==='clear'){clearInk();return}
   if(action==='width'){showWidth(widthPanel.hidden);return}
   if(action==='image'){picker.click();return}
   chooseTool(tool===action?'':action);
  });
  slider.addEventListener('input',()=>{
   sizes[tool]=slider.valueAsNumber;
   widthPanel.querySelector('output').textContent=slider.value+'px';
  });
  document.addEventListener('pointerdown',event=>{
   if(!widthPanel.hidden&&!toolbar.contains(event.target))showWidth(false);
  });
  document.addEventListener('keydown',event=>{
   if(event.defaultPrevented||!question||!tool||event.target.closest?.('dialog[open]'))return;
   if(event.key==='Escape'){
    if(!widthPanel.hidden){showWidth(false);widthButton.focus({preventScroll:true});return}
    chooseTool('');
    return;
   }
   if(!isDrawingTool(tool)||event.repeat||event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||
    event.target.closest?.('input,textarea,select,[contenteditable]'))return;
   const action=Object.keys(keys).find(name=>keys[name]===event.key.toUpperCase());
   if(!action||!toolbar.getClientRects().length)return;
   event.preventDefault();
   if(action==='clear'){if(!clearButton.disabled)clearInk();return}
   chooseTool(action);
  });

  updateTools();
  return{show,reset(){images.reset();clear()}};
 }
 root.SemuonQuizInk={mount};
})(globalThis);
