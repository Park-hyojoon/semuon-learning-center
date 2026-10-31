(function(root){
  'use strict';const C=root.SemuonCore;
  function open(storage,seed=root.SemuonSeed){
    let raw,state,error=null,applyingSync=false;const validate=C.stateValidator(),catalog=new Map(),catalogItems=new Set();
    // Published questions are immutable. Save personal additions and learning data only.
    const get=()=>{const {items,...personal}=state;return{...C.clone(personal),items:items.slice()}};
    function readBackup(value){
      if(value?.storageVersion!==2)return C.validateState(value);
      C.assert(Array.isArray(value.catalogIds)&&Array.isArray(value.itemOrder)&&Array.isArray(value.items),'저장 자료의 문제 목록을 확인해 주세요.');
      const {storageVersion,catalogIds,itemOrder,...personal}=value,byId=new Map();
      for(const id of catalogIds){C.assert(catalog.has(id)&&!byId.has(id),'백업에 필요한 배포 문제가 없습니다. 전체 백업 파일을 사용해 주세요.');byId.set(id,catalog.get(id))}
      for(const p of value.items){C.assert(!byId.has(p.id),'문제 ID가 중복됩니다.');byId.set(p.id,p)}
      C.assert(itemOrder.length===byId.size&&new Set(itemOrder).size===byId.size&&itemOrder.every(id=>byId.has(id)),'저장된 문제 순서를 확인해 주세요.');
      return C.validateState({...personal,items:itemOrder.map(id=>byId.get(id))});
    }
    function encode(next){return JSON.stringify({...next,storageVersion:2,items:next.items.filter(p=>!catalogItems.has(p)),catalogIds:next.items.filter(p=>catalogItems.has(p)).map(p=>p.id),itemOrder:next.items.map(p=>p.id)})}
    function normalize(next){next.items=next.items.map(p=>{if(catalogItems.has(p))return p;const item=C.immutableItem(p),published=catalog.get(item.id);if(!published)return item;C.assert(C.fingerprint(item)===C.fingerprint(published)&&C.answerSignature(item)===C.answerSignature(published),'기존 문제와 원문 또는 정답이 충돌합니다: '+item.title);return published});return next}
    try{
      storage=storage||root.localStorage;raw=storage.getItem(C.KEY);
      if(seed?.items?.length)for(const p of C.plan([],seed).add){const item=C.immutableItem(p);catalog.set(item.id,item);catalogItems.add(item)}
      state=raw?readBackup(JSON.parse(raw)):C.fresh();normalize(state);
      if(catalog.size){const planned=C.plan(state.items,{schemaVersion:C.VERSION,examId:C.EXAM,items:[...catalog.values()]});state.items.push(...planned.add);state.items=state.items.map(p=>catalog.has(p.id)?catalog.get(p.id):p)}
      validate(state);
    }catch(e){error=e;state=C.fresh()}
    function update(change){
      if(error)throw Error('저장 자료를 읽지 못해 원본을 보존했습니다. 백업을 내보낸 뒤 확인해 주세요.');
      if(storage.getItem(C.KEY)!==raw)throw Error('다른 탭에서 자료가 변경되었습니다. 입력은 복사해 보관한 뒤 새로고침해 주세요.');
      const next=get();change(next);if(!applyingSync)root.SemuonSyncModel?.stamp(next,state);next.revision=state.revision+1;next.updatedAt=new Date().toISOString();normalize(next);validate(next);const json=encode(next);
      try{storage.setItem(C.KEY,json)}catch(e){throw Error('저장하지 못했습니다. 입력 내용은 화면에 남아 있습니다. 용량과 브라우저 저장 허용을 확인하고 백업해 주세요. '+e.message)}
      raw=json;state=next;return get();
    }
    function recover(backup){
      C.assert(error,'정상 저장소에서는 백업 합치기를 사용해 주세요.');const next=normalize(C.clone(readBackup(backup)));
      C.assert(storage.getItem(C.KEY)===raw,'다른 탭에서 자료가 바뀌었습니다. 새로고침해 주세요.');
      storage.setItem(C.KEY+'-recovery-'+Date.now(),raw||'');
      next.revision++;const json=encode(next);storage.setItem(C.KEY,json);raw=json;state=next;error=null;return get();
    }
    return{get,update,readBackup,isCurrent:()=>storage.getItem(C.KEY)===raw,exportSync:()=>JSON.parse(encode(state)),packSync:value=>JSON.parse(encode(normalize(C.clone(value)))),saveSyncBackup(){if(storage.getItem(C.KEY)!==raw)throw Error('다른 탭의 기록이 바뀌었습니다. 새로고침 후 동기화해 주세요.');storage.setItem(C.KEY+'-before-sync',encode(state))},syncBackup:()=>{const v=storage.getItem(C.KEY+'-before-sync');return v?readBackup(JSON.parse(v)):null},applySynced(value,revision){if(state.revision!==revision)throw Error('학습 중 기록이 변경되었습니다. 다시 동기화해 주세요.');applyingSync=true;try{return update(s=>Object.assign(s,value))}finally{applyingSync=false}},get revision(){return state.revision},get error(){return error},recover,rawBackup:()=>raw||'',add(spec){const p=C.plan(state.items,spec);if(p.add.length)update(s=>s.items.push(...p.add));return p},record(problem,input){const result=C.grade(problem,input),e={id:crypto.randomUUID(),examId:C.EXAM,problemId:problem.id,subject:problem.subject,source:'semuon-grade',at:new Date().toISOString(),input:C.clone(input),...result};update(s=>s.history.push(e));return e},mark(problem,correct){C.assert(typeof correct==='boolean','통과 여부를 확인해 주세요.');const e={id:crypto.randomUUID(),examId:C.EXAM,problemId:problem.id,subject:problem.subject,source:'semuon-self',at:new Date().toISOString(),input:null,correct,wrongLabels:[]};update(s=>{s.history.push(e);if(s.drafts[problem.id])s.drafts[problem.id].graded=false});return e},cancel(id){return update(s=>{const e=s.history.find(e=>e.id===id);if(!e)throw Error('기록을 찾지 못했습니다.');e.statusAt=new Date(Math.max(Date.now(),Date.parse(e.statusAt||e.at)+1)).toISOString();e.cancelledAt=e.statusAt;if(s.drafts[e.problemId]){s.drafts[e.problemId].graded=false;delete s.drafts[e.problemId].correct}})},restore(id){return update(s=>{const e=s.history.find(e=>e.id===id);if(!e)throw Error('기록을 찾지 못했습니다.');e.statusAt=new Date(Math.max(Date.now(),Date.parse(e.statusAt||e.cancelledAt||e.at)+1)).toISOString();delete e.cancelledAt})},merge(backup){const next=C.merge(state,readBackup(backup));return update(s=>Object.assign(s,next))}};
  }
  root.SemuonStore={open};
})(globalThis);
