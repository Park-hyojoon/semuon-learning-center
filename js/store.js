(function(root){
  'use strict';const C=root.SemuonCore;
  function open(storage,seed=root.SemuonSeed){
    let raw,state,error=null;
    try{storage=storage||root.localStorage;raw=storage.getItem(C.KEY);state=raw?C.validateState(JSON.parse(raw)):C.fresh();if(seed?.items?.length){const p=C.plan(state.items,seed);state.items.push(...p.add)}}catch(e){error=e;state=C.fresh()}
    const get=()=>C.clone(state);
    function update(change){
      if(error)throw Error('저장 자료를 읽지 못해 원본을 보존했습니다. 백업을 내보낸 뒤 확인해 주세요.');
      if(storage.getItem(C.KEY)!==raw)throw Error('다른 탭에서 자료가 변경되었습니다. 입력은 복사해 보관한 뒤 새로고침해 주세요.');
      const next=get();change(next);next.revision=state.revision+1;next.updatedAt=new Date().toISOString();C.validateState(next);const json=JSON.stringify(next);
      try{storage.setItem(C.KEY,json)}catch(e){throw Error('저장하지 못했습니다. 입력 내용은 화면에 남아 있습니다. 용량과 브라우저 저장 허용을 확인하고 백업해 주세요. '+e.message)}
      raw=json;state=next;return get();
    }
    function recover(backup){
      C.assert(error,'정상 저장소에서는 백업 합치기를 사용해 주세요.');const next=C.clone(C.validateState(backup));
      C.assert(storage.getItem(C.KEY)===raw,'다른 탭에서 자료가 바뀌었습니다. 새로고침해 주세요.');
      // First retain unreadable bytes under a distinct tax2-only recovery key.
      storage.setItem(C.KEY+'-recovery-'+Date.now(),raw||'');
      next.revision++;const json=JSON.stringify(next);storage.setItem(C.KEY,json);raw=json;state=next;error=null;return get();
    }
    return{get,update,get error(){return error},recover,rawBackup:()=>raw||'',add(spec){const p=C.plan(state.items,spec);if(p.add.length)update(s=>s.items.push(...p.add));return p},record(problem,input){const result=C.grade(problem,input),e={id:crypto.randomUUID(),examId:C.EXAM,problemId:problem.id,subject:problem.subject,source:'semuon-grade',at:new Date().toISOString(),input:C.clone(input),...result};update(s=>s.history.push(e));return e},mark(problem,correct){C.assert(typeof correct==='boolean','통과 여부를 확인해 주세요.');const e={id:crypto.randomUUID(),examId:C.EXAM,problemId:problem.id,subject:problem.subject,source:'semuon-self',at:new Date().toISOString(),input:null,correct,wrongLabels:[]};update(s=>{s.history.push(e);if(s.drafts[problem.id])s.drafts[problem.id].graded=false});return e},cancel(id){return update(s=>{const e=s.history.find(e=>e.id===id);if(!e)throw Error('기록을 찾지 못했습니다.');e.cancelledAt=new Date().toISOString();if(s.drafts[e.problemId]){s.drafts[e.problemId].graded=false;delete s.drafts[e.problemId].correct}})},restore(id){return update(s=>{const e=s.history.find(e=>e.id===id);if(!e)throw Error('기록을 찾지 못했습니다.');delete e.cancelledAt})},merge(backup){const next=C.merge(state,backup);return update(s=>Object.assign(s,next))}};
  }
  root.SemuonStore={open};
})(globalThis);
