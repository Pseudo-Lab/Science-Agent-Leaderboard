(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./board-core.js'):root.BoardCore);if(typeof module==='object'&&module.exports)module.exports=api;else root.FlowMap=api;})(typeof globalThis!=='undefined'?globalThis:this,function(C){
  'use strict';
  const positions={task:[150,125],research:[500,125],agent:[850,125],evaluation:[760,345],platform:[270,345]};
  const descriptions={task:'문제 · 데이터 · 성공 조건',research:'근거 · 가설 · 비교 조건',agent:'실행 · 도구 · 복구 흐름',evaluation:'검증 · 실패 분석 · 비용',platform:'결과 축적 · 비교 · 공유'};
  const guide=[
    {source:'task',target:'research',label:'문제·성공 조건',detail:'Task·데이터 팀이 정한 문제와 성공 조건을 바탕으로 연구·실험 설계 팀이 검증할 가설과 비교 조건을 정합니다.'},
    {source:'research',target:'agent',label:'가설·실험 명세',detail:'연구·실험 설계 팀이 바꿀 변수와 고정 조건을 전달하면 Agent·Harness 팀이 실행 가능한 workflow와 실험을 구현합니다.'},
    {source:'agent',target:'evaluation',label:'실행 결과·로그 요약',detail:'Agent·Harness 팀의 실행 결과와 공개 가능한 로그 요약을 Evaluation 팀이 검증하고 실패 원인·효과·비용을 분석합니다.'},
    {source:'evaluation',target:'platform',label:'검증 결과·지표',detail:'Evaluation 팀이 검증한 결과와 지표, 해석상의 한계를 Leaderboard 팀이 비교 가능한 형태로 축적하고 공유합니다.'},
    {source:'evaluation',target:'research',label:'실패 패턴 → 다음 가설',detail:'예상과 다른 결과와 실패 패턴이 연구·실험 설계 팀으로 돌아가 다음 가설과 비교 실험의 근거가 됩니다.'},
    {source:'platform',target:'task',label:'비교 결과 → 문제 보완',detail:'Leaderboard에 쌓인 비교 결과와 드러난 빈틈을 바탕으로 Task·데이터 팀이 다음 문제·데이터·성공 조건을 보완합니다.'}
  ].map((e,i)=>({...e,id:'guide-'+i,kind:'guide',items:[]}));
  function build(records){
    const index=new Map(records.map(r=>[r.number,r])),groups=new Map(),unresolved=[];
    function add(source,target,kind,s,t){const id=source+'-'+target;if(!groups.has(id))groups.set(id,{id,source,target,items:[]});const g=groups.get(id);if(!g.items.some(i=>i.kind===kind&&i.source.number===s.number&&i.target?.number===t?.number))g.items.push({kind,source:s,target:t,state:s.cancelled||t?.cancelled?'stopped':C.ready(s)?'ready':'waiting'});}
    for(const target of records)for(const n of target.dependencies){const source=index.get(n);if(source)add(source.team,target.team,'dependency',source,target);else unresolved.push({number:n,target});}
    for(const source of records)for(const target of source.targets){if(!records.some(r=>r.team===target&&r.dependencies.includes(source.number)))add(source.team,target,'planned',source,null);}
    const edges=[...groups.values()].map(g=>{const actual=g.items.filter(i=>i.kind==='dependency'),planned=g.items.filter(i=>i.kind==='planned'),waiting=actual.filter(i=>i.state==='waiting').length,stopped=actual.filter(i=>i.state==='stopped').length;return {...g,kind:actual.length?'dependency':'planned',waiting,stopped,label:actual.length?`선행 ${actual.length}건${waiting?' · 대기 '+waiting:stopped?' · 중단 '+stopped:' · 공유 완료'}${planned.length?' / 예정 '+planned.length:''}`:`전달 예정 ${planned.length}건`};});
    return {edges,unresolved};
  }
  function route(source,target,reverse=false){
    const a=positions[source],b=positions[target];
    if(source===target)return {path:`M${a[0]+85} ${a[1]-30} C${a[0]+156} ${a[1]-100} ${a[0]-156} ${a[1]-100} ${a[0]-85} ${a[1]-30}`,label:[a[0],a[1]-77]};
    const dx=b[0]-a[0],dy=b[1]-a[1],distance=Math.hypot(dx,dy);
    let bend=reverse?50:0;
    if(Math.abs(dx)>500&&a[1]===125&&b[1]===125)bend=dx>0?-220:220;
    const c=[(a[0]+b[0])/2-dy/distance*bend,(a[1]+b[1])/2+dx/distance*bend];
    function port(p,t){const x=t[0]-p[0],y=t[1]-p[1],k=1/Math.max(Math.abs(x)/98,Math.abs(y)/52);return [p[0]+x*k,p[1]+y*k];}
    const p=port(a,c),q=port(b,c);
    return {path:`M${p[0]} ${p[1]} Q${c[0]} ${c[1]} ${q[0]} ${q[1]}`,label:[p[0]*.25+c[0]*.5+q[0]*.25,p[1]*.25+c[1]*.5+q[1]*.25-12]};
  }
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const name=id=>C.TEAMS.find(t=>t.id===id)?.name||id;
  function diagram({records,mode,team='',selectedEdge='',issue=null}){
    const graph=build(records),edges=mode==='guide'?guide:graph.edges;
    const selected=edges.find(e=>e.id===selectedEdge);
    const related=e=>selected?e.id===selected.id:issue?e.items.some(i=>i.source.number===issue||i.target?.number===issue):team?e.source===team||e.target===team:true;
    const nodes=C.TEAMS.map((t,i)=>{const [x,y]=positions[t.id],rows=records.filter(r=>r.team===t.id),neighbors=edges.filter(related).some(e=>e.source===t.id||e.target===t.id),focused=!!(selected||team||issue),dim=focused&&!neighbors&&team!==t.id;return `<g class="map-node ${team===t.id?'chosen':''} ${dim?'dim':''}" transform="translate(${x-98},${y-52})" role="button" tabindex="0" data-map-team="${t.id}" aria-pressed="${team===t.id}" aria-label="${name(t.id)} 연결 보기"><rect width="196" height="104" rx="12"/><circle cx="19" cy="24" r="4" style="fill:var(--${t.id})"/><text x="32" y="28" class="map-node-name">${esc(t.name)}</text><text x="16" y="53" class="map-node-description">${esc(descriptions[t.id])}</text><text x="16" y="83" class="map-node-count">${mode==='guide'?'역할과 주고받는 자료':`${rows.length}개 작업 · 공유 ${rows.filter(C.ready).length}개`}</text><text x="174" y="83" class="map-node-index">0${i+1}</text></g>`;}).join('');
    const ordered=[...edges.filter(e=>!related(e)),...edges.filter(related)];
    const lines=ordered.map(e=>{const r=route(e.source,e.target,edges.some(x=>x.source===e.target&&x.target===e.source)),on=related(e),chosen=e.id===selectedEdge,state=e.kind==='dependency'?(e.waiting?'waiting':e.stopped?'stopped':'ready'):e.kind;return `<g class="map-edge ${state} ${on?'':'dim'} ${chosen?'chosen':''}" data-map-edge="${e.id}" role="button" tabindex="0" aria-pressed="${chosen}" aria-label="${esc(name(e.source)+'에서 '+name(e.target)+'으로: '+e.label)}"><path class="map-hit" d="${r.path}"/><path class="map-line" d="${r.path}" marker-end="url(#map-arrow-${state})"/><g transform="translate(${r.label[0]},${r.label[1]})" class="map-edge-label"><rect x="${-Math.max(64,e.label.length*5.3)}" y="-12" width="${Math.max(128,e.label.length*10.6)}" height="24" rx="5"/><text text-anchor="middle" dominant-baseline="middle">${esc(e.label)}</text></g></g>`;}).join('');
    const markers=['guide','ready','waiting','stopped','planned'].map(s=>`<marker id="map-arrow-${s}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L8 4L0 8Z" class="arrow-${s}"/></marker>`).join('');
    return `<svg class="connection-map" viewBox="0 0 1000 425" role="group" aria-label="${mode==='guide'?'협업 구조 안내. 실제 Issue 연결이 아닙니다.':'GitHub Issue에서 확인한 팀 간 자료 흐름'}"><defs>${markers}</defs>${lines}${nodes}</svg>`;
  }
  return {guide,positions,descriptions,build,route,diagram};
});
