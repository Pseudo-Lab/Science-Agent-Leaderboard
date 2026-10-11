'use strict';
const fs=require('node:fs');
const C=require('./board-core.js');
const clip=(v,n=1400)=>String(v??'').slice(0,n);
function eventFrom(payload,kind,id,observedAt=new Date().toISOString()){
  const issue=payload.issue;
  if(!issue||issue.pull_request)return null;
  // Keep tracking an edit that accidentally removes the schema, so it is visible.
  let current={},previous={};
  try{current=C.sections(issue.body);}catch{}
  try{previous=C.sections(payload.changes?.body?.from);}catch{}
  if(current['양식 버전']!=='SAL-WEEKLY-V1'&&previous['양식 버전']!=='SAL-WEEKLY-V1')return null;
  const s=current['양식 버전']==='SAL-WEEKLY-V1'?current:previous;
  const team=C.TEAMS.find(t=>t.name===s['담당 팀']);
  if(!team||!payload.sender?.login)return null;
  const changes=[];
  const add=(field,before,after)=>{if(String(before??'')!==String(after??''))changes.push({field,before:clip(before),after:clip(after)});};
  if(kind==='issues'&&payload.action==='edited'){
    if(payload.changes?.body)for(const field of C.FIELDS)add(field,previous[field],current[field]);
    if(payload.changes?.title)add('제목',payload.changes.title.from,issue.title);
  }
  if(kind==='issue_comment'&&payload.action!=='deleted')add('댓글',payload.changes?.body?.from||'',payload.comment?.body);
  if(payload.assignee)add('담당자',payload.action==='unassigned'?'@'+payload.assignee.login:'',payload.action==='assigned'?'@'+payload.assignee.login:'');
  const labels={opened:'작업 등록',edited:'작업 수정',closed:'작업 닫힘',reopened:'작업 다시 열림',assigned:'담당자 지정',unassigned:'담당자 해제',deleted:'작업 삭제'};
  const action=kind==='issue_comment'?({created:'댓글 작성',edited:'댓글 수정',deleted:'댓글 삭제'}[payload.action]):labels[payload.action];
  if(!action)return null;
  // Event time is provided by GitHub where possible. Other actions use collection time explicitly.
  const timestamp=kind==='issue_comment'?(payload.action==='created'?payload.comment?.created_at:payload.action==='edited'?payload.comment?.updated_at:null):payload.action==='opened'?issue.created_at:['edited','closed','reopened'].includes(payload.action)?issue.updated_at:null;
  return {id:String(id),issue:issue.number,title:clip(issue.title,250),team:team.id,week:s['주차']||'',actor:payload.sender.login,actorId:payload.sender.id,action,kind:kind==='issue_comment'?'comment':'issue',at:timestamp||observedAt,timeSource:timestamp?'github':'collected',commentId:payload.comment?.id||null,changes,targets:(s['영향받는 팀']||'').split(',').map(n=>C.TEAMS.find(t=>t.name===n.trim())?.id).filter(Boolean)};
}
async function publish(event,{repo,token,fetcher=fetch,wait=ms=>new Promise(r=>setTimeout(r,ms)),now=new Date().toISOString()}={}){
  if(repo!==C.REPO)throw Error('Unexpected repository');
  const branch='team-activity-data';
  async function api(path,method='GET',body){
    const response=await fetcher(`https://api.github.com/repos/${repo}/${path}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok){const error=Error(`GitHub ${method} ${path}: ${response.status}`);error.status=response.status;throw error;}
    return response.json();
  }
  for(let attempt=0;attempt<8;attempt++){
    let head=null,baseTree=null,feed={version:1,recordedSince:now,events:[]};
    try{head=(await api(`git/ref/heads/${branch}`)).object.sha;}catch(e){if(e.status!==404)throw e;}
    if(head){
      baseTree=(await api(`git/commits/${head}`)).tree.sha;
      let blob=await api(`contents/feed.json?ref=${head}`);
      if(blob.encoding==='none'&&blob.sha)blob=await api(`git/blobs/${blob.sha}`);
      if(blob.encoding!=='base64'||typeof blob.content!=='string')throw Error('Activity feed is too large for Contents API; shard before continuing.');
      feed=C.normalizeFeed(JSON.parse(Buffer.from(blob.content,'base64').toString('utf8')));
    }
    if(event&&feed.events.some(e=>e.id===event.id))return {duplicate:true};
    if(!event&&head)return {initialized:true};
    if(event)feed.events.push(event);
    feed.events.sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));feed.updatedAt=now;
    const tree=await api('git/trees','POST',{...(baseTree?{base_tree:baseTree}:{}),tree:[{path:'feed.json',mode:'100644',type:'blob',content:JSON.stringify(feed)}]});
    const commit=await api('git/commits','POST',{message:event?`Record activity ${event.id}`:'Initialize team activity feed',tree:tree.sha,parents:head?[head]:[]});
    try{
      if(head)await api(`git/refs/heads/${branch}`,'PATCH',{sha:commit.sha,force:false});
      else await api('git/refs','POST',{ref:`refs/heads/${branch}`,sha:commit.sha});
      return {saved:true};
    }catch(e){if(![409,422].includes(e.status)||attempt===7)throw e;await wait(250*(attempt+1));}
  }
}
if(require.main===module){
  const payload=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
  const event=eventFrom(payload,process.env.GITHUB_EVENT_NAME,process.env.GITHUB_RUN_ID);
  if(event||process.env.GITHUB_EVENT_NAME==='workflow_dispatch')publish(event,{repo:process.env.GITHUB_REPOSITORY,token:process.env.GITHUB_TOKEN}).then(()=>console.log('Activity feed saved.')).catch(e=>{console.error(e.message);process.exitCode=1;});
  else console.log('Not a team work Issue; skipped.');
}
module.exports={eventFrom,publish};
