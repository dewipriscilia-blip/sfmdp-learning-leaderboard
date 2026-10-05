/** Deterministic calculations. Never use an LLM to grade, impute or rank people. */
export const FIELD_LABELS={obs1:'Observasi Day 1',obs2:'Observasi Day 2',obs3:'Observasi Day 3',obs4:'Observasi Day 4',post2:'Post-test Day 2',post3:'Post-test Day 3',post4:'Post-test Day 4',masterpiece:'Bonus Masterpiece',time1:'Ketepatan waktu Day 1'};
export const round=(v,n=2)=>Math.round((v+Number.EPSILON)*10**n)/10**n;
export const numberOrNull=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
export const normalize=s=>String(s??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
export function rankRows(rows,precision=6){
  const result=rows.map(r=>({...r})).sort((a,b)=>{
    if(a.total===null&&b.total===null)return a.name.localeCompare(b.name,'id');
    if(a.total===null)return 1;if(b.total===null)return -1;
    return round(b.total,precision)-round(a.total,precision)||a.name.localeCompare(b.name,'id');
  });
  let last=null,rank=0;
  result.forEach((r,i)=>{if(r.total===null){r.rank=null;return;}const val=round(r.total,precision);if(last===null||val!==last)rank=i+1;r.rank=rank;last=val;});
  return result;
}
export function legacyIndividual(p){
  const x=p.legacyInputs||{};const required=['obs1','obs2','obs3','obs4','post2','post3'];
  const missing=required.filter(k=>!Number.isFinite(x[k]));
  // Blank masterpiece only maps to zero in the historical 2025 formula, not generic scoring.
  const days=missing.length?[null,null,null,null]:[round(x.obs1,2),.3*x.obs2+.7*x.post2,.3*x.obs3+.7*x.post3,.3*x.obs4+.2*(x.masterpiece??0)];
  return {...p,days,total:missing.length?null:days.reduce((a,b)=>a+b,0),missing};
}
export function legacyGroup(g,participants){
  const ps=participants.filter(p=>p.groupId===g.id),x=g.legacyInputs||{};
  const missing=[];if(!ps.length)missing.push('anggota kelompok');
  for(const p of ps)for(const k of ['obs1','obs2','obs3','obs4','post2','post4','time1'])if(!Number.isFinite(p.legacyInputs?.[k]))missing.push(p.id+':'+k);
  for(const k of ['tasks2','tasks3']){if(!Array.isArray(x[k])||!x[k].length||x[k].some(v=>!Number.isFinite(v)||v<1||v>4))missing.push(k);}
  if(missing.length)return {...g,total:null,days:[null,null,null,null],missing,members:ps.length};
  const sum=k=>ps.reduce((s,p)=>s+p.legacyInputs[k],0);
  const task2=round(x.tasks2.reduce((a,b)=>a+b,0)/(4*x.tasks2.length)*100,2);
  const task3=round(x.tasks3.reduce((a,b)=>a+b,0)/(4*x.tasks3.length)*100,2);
  // Preserve effective legacy formulas. Day 3 intentionally references post2; documented audit finding.
  const days=[round(.75*(x.winner1??0)+.2*sum('obs1')+.05*sum('time1'),2),.15*sum('obs2')+.8*task2+.05*sum('post2'),.15*sum('obs3')+.8*task3+.05*sum('post2'),.5*sum('obs4')+.5*(sum('post4')/5)];
  return {...g,days,total:round(days.reduce((a,b)=>a+b,0),2),missing,members:ps.length};
}
export function new2026(){
  return {schemaVersion:1,projectYear:2026,datasetLabel:'SFMDP 2026 - Draft, belum ada hasil',isAnonymous:false,participants:[],groups:[],individualScores:[],groupScores:[],components:[
    {id:'obs_day1',label:'Observasi Day 1',scope:'individual',max:100,weight:0,enabled:true},
    {id:'post_day2',label:'Post-test Day 2',scope:'individual',max:100,weight:0,enabled:true},
    {id:'obs_day2',label:'Observasi Day 2',scope:'individual',max:100,weight:0,enabled:true},
    {id:'activity_day1',label:'Aktivitas kelompok Day 1',scope:'group',max:100,weight:0,enabled:true},
    {id:'task_day2',label:'Tugas kelompok Day 2',scope:'group',max:100,weight:0,enabled:true}],
    rulesApproved:false,rulesVersion:'2026-draft-01',rulesApprovedBy:'',importHistory:[],sourceNotes:[]};
}
export function rulesStatus(data,scope){
  const cs=(data.components||[]).filter(c=>c.scope===scope&&c.enabled&&c.weight>0);
  const invalid=(data.components||[]).some(c=>c.scope===scope&&c.enabled&&(!Number.isFinite(c.weight)||c.weight<0||!Number.isFinite(c.max)||c.max<=0));
  const total=cs.reduce((s,c)=>s+c.weight,0);
  return {components:cs,total,valid:!invalid&&cs.length>0&&Math.abs(total-100)<1e-6};
}
export function weightedRows(data,scope){
  const status=rulesStatus(data,scope),entities=scope==='individual'?data.participants:data.groups;
  const scores=scope==='individual'?data.individualScores:data.groupScores;
  return rankRows(entities.map(p=>{
    const missing=[],parts=[];
    for(const c of status.components){
      const found=(scores||[]).filter(s=>s.entityId===p.id&&s.componentId===c.id);
      const v=found.length===1?found[0].value:null;
      if(v===null||!Number.isFinite(v)||v<0||v>c.max){missing.push(c.label);parts.push({label:c.label,value:null,weighted:null});}
      else parts.push({label:c.label,value:v,weighted:v/c.max*100*c.weight/100});
    }
    const complete=status.valid&&!missing.length;
    return {...p,parts,missing,days:parts.map(x=>x.weighted),total:complete?round(parts.reduce((s,c)=>s+c.weighted,0),6):null};
  }));
}
export function compute(data,scope){
  if(data.projectYear===2025)return rankRows(scope==='individual'?data.participants.map(legacyIndividual):data.groups.map(g=>legacyGroup(g,data.participants)));
  return weightedRows(data,scope);
}
export function referenceCheck(data){
  if(data.projectYear!==2025)return {checked:0,matching:0,differences:[]};
  const rows=[...compute(data,'individual'),...compute(data,'group')];
  const checked=rows.filter(r=>Number.isFinite(r.reference?.total));
  const differences=checked.filter(r=>r.total===null||Math.abs(r.total-r.reference.total)>.005);
  return {checked:checked.length,matching:checked.length-differences.length,differences};
}
export function validateDataset(data){
  if(!data||data.schemaVersion!==1||![2025,2026].includes(data.projectYear))throw Error('Format JSON/tahun tidak dikenali. Gunakan backup aplikasi atau format standar.');
  for(const key of ['participants','groups']){
    if(!Array.isArray(data[key])||data[key].length>1000)throw Error('Daftar '+key+' tidak valid.');
    const ids=new Set();for(const e of data[key]){if(typeof e.id!=='string'||!e.id.trim()||typeof e.name!=='string'||!e.name.trim())throw Error('ID dan nama wajib terisi.');if(ids.has(e.id))throw Error('ID duplikat: '+e.id);ids.add(e.id);}
  }
  const groups=new Set(data.groups.map(g=>g.id));
  for(const p of data.participants)if(!groups.has(p.groupId))throw Error('Kelompok tidak ditemukan untuk '+p.id);
  if(data.projectYear===2025){
    for(const p of data.participants)for(const [k,v] of Object.entries(p.legacyInputs||{}))if(v!==null&&(!Number.isFinite(v)||v<0||v>100))throw Error('Nilai arsip tidak valid: '+p.id+' / '+k);
    for(const g of data.groups)for(const k of ['tasks2','tasks3'])if(!Array.isArray(g.legacyInputs?.[k])||g.legacyInputs[k].some(v=>v!==null&&(!Number.isFinite(v)||v<1||v>4)))throw Error('Rating fasil harus 1-4 atau kosong: '+g.id);
  }else{
    if(!Array.isArray(data.components))throw Error('Komponen penilaian belum tersedia.');
    const seen=new Set();for(const c of data.components){if(!['individual','group'].includes(c.scope)||!c.id||seen.has(c.id))throw Error('Komponen duplikat/tidak valid.');seen.add(c.id);if(!Number.isFinite(c.max)||c.max<=0||!Number.isFinite(c.weight)||c.weight<0||c.weight>100)throw Error('Bobot/maksimum komponen tidak valid.');}
    for(const scope of ['individual','group']){
      const ids=new Set((scope==='individual'?data.participants:data.groups).map(p=>p.id)),keys=new Set();
      const components=new Map(data.components.filter(c=>c.scope===scope).map(c=>[c.id,c]));
      for(const s of data[scope==='individual'?'individualScores':'groupScores']||[]){
        const c=components.get(s.componentId),key=s.entityId+'|'+s.componentId;
        if(!ids.has(s.entityId)||!c)throw Error('ID peserta/kelompok/komponen belum cocok: '+key);
        if(keys.has(key))throw Error('Nilai duplikat: '+key);keys.add(key);
        if(s.value!==null&&(!Number.isFinite(s.value)||s.value<0||s.value>c.max))throw Error('Nilai di luar rentang: '+key);
      }
    }
  }
  return data;
}
export function csvText(rows){
  return rows.map(r=>r.map(v=>{
    let s=v===null||v===undefined?'':String(v);
    // Prevent spreadsheet formula injection in exported user-supplied text.
    if(typeof v==='string'&&/^[=+@\-\t\r]/.test(s))s="'"+s;
    return '"'+s.replace(/"/g,'""')+'"';
  }).join(',')).join('\r\n');
}
export function parseCSV(text){
  text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(field);field='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x!==''))rows.push(row);row=[];field='';}
    else field+=c;
  }
  if(quoted)throw Error('CSV memiliki tanda kutip yang belum ditutup.');
  row.push(field);if(row.some(x=>x!==''))rows.push(row);return rows;
}
