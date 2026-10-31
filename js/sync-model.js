/* Tax2-only synchronization. Published questions remain catalog references. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./core.js'):root.SemuonCore);if(typeof module==='object'&&module.exports)module.exports=api;else root.SemuonSyncModel=api})(globalThis,function(C){
'use strict';
const NAMESPACE='semuon-tax2-v1',FORMAT='semuon-learning-sync',commonSettings=['roadmap','reviewLimit'];
const own=(o,k)=>Object.hasOwn(o||{},k),clone=C.clone,stable=C.stable;
function group(s,key){return key==='settings'?Object.fromEntries(commonSettings.filter(k=>own(s.settings,k)).map(k=>[k,s.settings[k]])):key==='studyDraft'?(s.studyDraft?{main:s.studyDraft}:{}):(s[key]||{})}
function stamp(next,previous,now=Date.now()){
 const meta=clone(next.syncMeta||{});
 for(const key of ['drafts','studyDrafts','studyDraft','settings']){const a=group(previous,key),b=group(next,key);for(const id of new Set([...Object.keys(a),...Object.keys(b)])){const supplied=stable(meta[key]?.[id])!==stable(previous.syncMeta?.[key]?.[id]);if(stable(a[id])!==stable(b[id])&&!supplied){const at=new Date(Math.max(now,Date.parse(meta[key]?.[id]?.at)||0)+1).toISOString();(meta[key]||(meta[key]={}))[id]={at,deleted:!own(b,id)}}else if(!meta[key]?.[id]&&own(b,id))(meta[key]||(meta[key]={}))[id]={at:previous.updatedAt||'1970-01-01T00:00:00Z',deleted:false}}
 }
 next.syncMeta=meta;
}
function validateMeta(s){if(!s.syncMeta)return;C.assert(s.syncMeta&&typeof s.syncMeta==='object'&&!Array.isArray(s.syncMeta),'동기화 변경 정보를 확인해 주세요.');for(const [key,values]of Object.entries(s.syncMeta)){C.assert(['drafts','studyDrafts','studyDraft','settings'].includes(key)&&values&&typeof values==='object'&&!Array.isArray(values),'동기화 변경 정보가 올바르지 않습니다.');for(const[id,v]of Object.entries(values))C.assert(!['__proto__','constructor','prototype'].includes(id)&&v&&Number.isFinite(Date.parse(v.at))&&typeof v.deleted==='boolean','동기화 항목의 날짜를 확인해 주세요.')}}
function merge(local,remote){
 validateMeta(local);validateMeta(remote);const next=C.merge(local,remote),meta={},ids=new Set(next.items.map(p=>p.id)),aliases=new Map();let source=remote;
 for(const p of remote.items)if(!ids.has(p.id)){const same=next.items.find(q=>C.fingerprint(q)===C.fingerprint(p)&&C.answerSignature(q)===C.answerSignature(p));if(same)aliases.set(p.id,same.id)}
 if(aliases.size){const remap=values=>Object.fromEntries(Object.entries(values||{}).map(([id,v])=>[aliases.get(id)||id,v])),draft=d=>{if(!d)return d;const v=clone(d);if(v.values?.problemId)v.values.problemId=aliases.get(v.values.problemId)||v.values.problemId;return v};source={...remote,drafts:remap(remote.drafts),syncMeta:{...remote.syncMeta,drafts:remap(remote.syncMeta?.drafts)},studyDrafts:Object.fromEntries(Object.entries(remote.studyDrafts||{}).map(([id,v])=>[id,draft(v)])),...(remote.studyDraft?{studyDraft:draft(remote.studyDraft)}:{})}}
 for(const key of ['drafts','studyDrafts','studyDraft','settings']){const a=group(local,key),b=group(source,key),out={},ma=local.syncMeta?.[key]||{},mb=source.syncMeta?.[key]||{};meta[key]={};for(const id of new Set([...Object.keys(a),...Object.keys(b),...Object.keys(ma),...Object.keys(mb)])){
  const left=ma[id]||{at:local.updatedAt||'1970-01-01T00:00:00Z',deleted:false},right=mb[id]||{at:remote.updatedAt||'1970-01-01T00:00:00Z',deleted:false},hasLeft=own(a,id)||own(ma,id),hasRight=own(b,id)||own(mb,id),ta=Date.parse(left.at),tb=Date.parse(right.at),useRight=hasRight&&(!hasLeft||tb>ta||tb===ta&&(right.deleted&&!left.deleted||right.deleted===left.deleted&&String(stable(b[id]))>String(stable(a[id])))),selected=useRight?right:left,value=(useRight?b:a)[id];
  if(!selected.deleted&&value!==undefined)out[id]=clone(value);meta[key][id]=clone(selected);
 }
 if(key==='settings'){const keep={...local.settings};commonSettings.forEach(k=>delete keep[k]);next.settings={...keep,...out}}else if(key==='studyDraft'){if(out.main)next.studyDraft=out.main;else delete next.studyDraft}else next[key]=out;
 }
 next.syncMeta=meta;for(const key of ['history','progressEvents','reviewNotes','studyLog','roadmapTaskEvents','mockExams','inbox'])if(Array.isArray(next[key]))next[key].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.id.localeCompare(b.id));C.validateState(next);return next;
}
function project(raw){const keys=['schemaVersion','examId','revision','updatedAt','storageVersion','items','catalogIds','itemOrder','drafts','history','studyLog','progressEvents','reviewNotes','inbox','studyDraft','studyDrafts','roadmapTaskEvents','mockExams','syncMeta'];const state=Object.fromEntries(keys.filter(k=>own(raw,k)).map(k=>[k,clone(raw[k])]));state.settings={fontSize:18,reviewLimit:6,...group(raw,'settings')};return state}
function envelope(raw,device,now=Date.now()){return{format:FORMAT,version:1,namespace:NAMESPACE,examId:'tax2',syncedAt:new Date(now).toISOString(),device:String(device).slice(0,80),state:project(raw)}}
function unpack(payload,readBackup){C.assert(payload&&payload.format===FORMAT&&payload.version===1&&payload.namespace===NAMESPACE&&payload.examId==='tax2'&&payload.state?.examId==='tax2','세무온 전산세무 2급 동기화 자료가 아닙니다. 회계 기록과 합치지 않습니다.');validateMeta(payload.state);return readBackup(payload.state)}
return{NAMESPACE,FORMAT,commonSettings,stamp,validateMeta,merge,project,envelope,unpack};
});
