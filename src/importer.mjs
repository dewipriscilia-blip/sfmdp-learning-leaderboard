import { numberOrNull, normalize, validateDataset, parseCSV, new2026 } from './core.mjs';
const clone=x=>JSON.parse(JSON.stringify(x));
function xml(text){
  if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('XML dengan deklarasi eksternal tidak didukung.');
  const doc=new DOMParser().parseFromString(text,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw Error('XML workbook tidak valid.');return doc;
}
/** Minimal read-only XLSX parser: values/cached values only, never executes formulas or macros. */
export async function readWorkbook(file){
  if(file.size>20*1024*1024)throw Error('Batas file 20 MB.');
  const buf=await file.arrayBuffer(),v=new DataView(buf),bytes=new Uint8Array(buf),decoder=new TextDecoder();
  let end=-1;for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(v.getUint32(p,true)===0x06054b50){end=p;break;}
  if(end<0)throw Error('File bukan XLSX yang valid. XLS/ZIP terenkripsi tidak didukung.');
  const count=v.getUint16(end+10,true);let offset=v.getUint32(end+16,true),total=0;
  if(count>2000)throw Error('Workbook terlalu kompleks.');const files=new Map();
  for(let i=0;i<count;i++){
    if(v.getUint32(offset,true)!==0x02014b50)throw Error('Direktori XLSX rusak.');
    const method=v.getUint16(offset+10,true),size=v.getUint32(offset+20,true),plain=v.getUint32(offset+24,true),len=v.getUint16(offset+28,true),extra=v.getUint16(offset+30,true),comment=v.getUint16(offset+32,true),local=v.getUint32(offset+42,true);
    const name=decoder.decode(bytes.slice(offset+46,offset+46+len));total+=plain;
    if(total>80*1024*1024)throw Error('Ukuran hasil ekstraksi melebihi batas aman.');
    files.set(name,{method,size,plain,local});offset+=46+len+extra+comment;
  }
  async function get(name){
    const e=files.get(name);if(!e)return null;
    const p=e.local;if(v.getUint32(p,true)!==0x04034b50)throw Error('Struktur ZIP tidak valid.');
    const start=p+30+v.getUint16(p+26,true)+v.getUint16(p+28,true),raw=bytes.slice(start,start+e.size);
    if(e.method===0)return decoder.decode(raw);
    if(e.method!==8)throw Error('Kompresi workbook tidak didukung.');
    let stream;try{stream=new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));}catch{throw Error('Browser belum mendukung impor XLSX. Gunakan Chrome/Edge terbaru atau CSV.');}
    const output=await new Response(stream).arrayBuffer();if(output.byteLength!==e.plain)throw Error('Ukuran ekstraksi XLSX tidak sesuai.');return decoder.decode(output);
  }
  const workbookText=await get('xl/workbook.xml'),relsText=await get('xl/_rels/workbook.xml.rels');
  if(!workbookText||!relsText)throw Error('workbook.xml tidak ditemukan.');
  const sharedText=await get('xl/sharedStrings.xml');
  const shared=sharedText?Array.from(xml(sharedText).getElementsByTagName('si')).map(si=>Array.from(si.getElementsByTagName('t')).map(t=>t.textContent).join('')):[];
  const relations=new Map(Array.from(xml(relsText).getElementsByTagName('Relationship')).filter(r=>r.getAttribute('TargetMode')!=='External').map(r=>[r.getAttribute('Id'),r.getAttribute('Target')]));
  const result={};
  for(const s of xml(workbookText).getElementsByTagName('sheet')){
    const target=relations.get(s.getAttribute('r:id'));if(!target)continue;
    const path=target.startsWith('/')?target.slice(1):new URL(target,'https://local/xl/').pathname.slice(1);
    const text=await get(path);if(!text)continue;
    const cells={},rows=[];
    for(const c of xml(text).getElementsByTagName('c')){
      const coord=c.getAttribute('r'),type=c.getAttribute('t'),value=c.getElementsByTagName('v')[0]?.textContent;
      let val=null;if(type==='s')val=shared[Number(value)]??null;else if(type==='inlineStr')val=Array.from(c.getElementsByTagName('t')).map(t=>t.textContent).join('');else if(type==='e')val=null;else if(value!==undefined)val=type==='str'?value:numberOrNull(value);
      if(val===null)continue;const match=/^([A-Z]+)(\d+)$/.exec(coord||'');if(!match)continue;
      const ri=Number(match[2])-1;let ci=0;for(const ch of match[1])ci=ci*26+ch.charCodeAt(0)-64;ci--;
      if(ri>5000||ci>1000)continue;if(!rows[ri])rows[ri]=[];rows[ri][ci]=val;cells[coord]=val;
    }
    result[s.getAttribute('name')]={rows,cells};
  }
  return result;
}
function sheet(book,name){const key=Object.keys(book).find(k=>normalize(k)===normalize(name));if(!key)throw Error('Sheet wajib tidak ditemukan: '+name);return book[key];}
function numeric(v,label){const n=numberOrNull(v);if(v!==undefined&&v!==null&&v!==''&&n===null)throw Error('Bukan angka: '+label);return n;}
function uniqueName(rows,name){const found=rows.filter(r=>r&&normalize(r[0])===normalize(name));if(found.length!==1)throw Error('Nama tidak cocok atau duplikat: '+name);return found[0];}
function groupNumber(name){const m=/kelompok\s*(\d+)/i.exec(String(name??''));return m?Number(m[1]):null;}
function gid(n){if(!n)throw Error('Nomor kelompok tidak valid.');return 'G'+String(n).padStart(2,'0');}
export function leaderboardDataset(book,notes=[]){
  const roster=sheet(book,'Ref Peserta').rows,dbi=sheet(book,'Database individual').rows,dbg=sheet(book,'Database Kelompok').rows;
  const imports={};for(const name of ['Import Day 1','Import Day 2','Import Day 3','Import Day 4','Import Post Test','Import day 2 kelompok','Import day 3 kelompok'])imports[name]=sheet(book,name).rows;
  const participants=[];
  for(let i=1;i<roster.length;i++){
    const r=roster[i];if(!r?.[0])continue;const name=String(r[0]),dealer=String(r[1]??''),groupId=gid(Number(r[2]));
    const d1=uniqueName(imports['Import Day 1'].slice(1),name),d2=uniqueName(imports['Import Day 2'].slice(1),name),d3=uniqueName(imports['Import Day 3'].slice(1),name),d4=uniqueName(imports['Import Day 4'].slice(1),name),post=uniqueName(imports['Import Post Test'].slice(1),name);
    for(const [label,row] of [['Day 1',d1],['Day 2',d2],['Day 3',d3],['Day 4',d4],['Post Test',post]]){if(gid(Number(row[2]))!==groupId)throw Error('Kelompok berbeda di sumber '+label+': '+name);if(normalize(row[1])!==normalize(dealer))notes.push(label+': asal dealer '+name+' berbeda; cocok berdasarkan nama unik dan nomor kelompok.');}
    const ref=dbi.find(x=>x&&normalize(x[0])===normalize(name+' - '+dealer));if(!ref)throw Error('Baris database individu tidak ditemukan: '+name);
    participants.push({id:'P'+String(i).padStart(3,'0'),name,dealer,groupId,legacyInputs:{obs1:numeric(d1[9],name),obs2:numeric(d2[5],name),obs3:numeric(d3[5],name),obs4:numeric(d4[4],name),post2:numeric(post[6],name),post3:numeric(post[7],name),post4:numeric(post[8],name),post4_raw:numeric(post[5],name),masterpiece:numeric(d4[5],name),time1:numeric(d1[10],name)},reference:{days:ref.slice(1,5).map(numberOrNull),total:numberOrNull(ref[5]),rank:numberOrNull(ref[6])},recap:{},source:{roster:'Leaderboard | Ref Peserta baris '+(i+1),score:'Leaderboard | Database individual'}});
  }
  const groups=[];
  for(const r of dbg.slice(1)){
    if(!r?.[0])continue;const n=groupNumber(r[0]),id=gid(n),row2=imports['Import day 2 kelompok'].find(x=>x&&groupNumber(x[0])===n),row3=imports['Import day 3 kelompok'].find(x=>x&&groupNumber(x[0])===n),row1=imports['Import Day 1'].find(x=>x&&Number(x[14])===n);
    if(!row1||!row2||!row3)throw Error('Data kelompok tidak lengkap: '+id);
    groups.push({id,name:String(r[0]).split('\n')[0].trim(),legacyInputs:{winner1:numberOrNull(row1[15]),tasks2:row2.slice(1,4).map(numberOrNull),tasks3:row3.slice(1,5).map(numberOrNull),tasks2Normalized:numberOrNull(row2[4]),tasks3Normalized:numberOrNull(row3[5])},reference:{days:r.slice(1,5).map(numberOrNull),total:numberOrNull(r[5]),rank:numberOrNull(r[6])},source:'Leaderboard | Database Kelompok'});
  }
  return {schemaVersion:1,projectYear:2025,datasetLabel:'DATA UJI 2025 - diimpor dari workbook asli',isAnonymous:false,participants,groups,sourceNotes:[],importHistory:[]};
}
function applyRecap(book,data,notes){
  if(data.isAnonymous)throw Error('REKAP memakai nama asli. Impor Leaderboard SFMDP .xlsx atau JSON INTERNAL terlebih dahulu agar identitas cocok.');
  const rows=sheet(book,'REKAP').rows,map={refreshment:5,pre2:6,post2:7,pre3:8,post3:9,post4:10,obs1:11,obs2:12,obs3:13,obs4:14};let found=0;
  for(const r of rows.slice(3)){
    if(!r?.[2]||!numberOrNull(r[1]))continue;
    const ps=data.participants.filter(p=>normalize(p.name)===normalize(r[2])&&normalize(p.dealer)===normalize(r[3]));
    if(ps.length!==1)throw Error('Nama/dealer REKAP tidak cocok: '+r[2]);const p=ps[0];
    if(p.groupId!==gid(Number(r[4])))throw Error('Kelompok REKAP tidak cocok: '+p.name);
    p.recap={};for(const [key,col] of Object.entries(map)){const val=numeric(r[col],key);p.recap[key]=val;if(key in p.legacyInputs){const old=p.legacyInputs[key];const agreesAtTwoDecimals=Number.isFinite(old)&&Number.isFinite(val)&&Math.round((old+Number.EPSILON)*100)===Math.round((val+Number.EPSILON)*100);if(!agreesAtTwoDecimals)p.legacyInputs[key]=val;}}found++;
  }
  if(found!==data.participants.length)throw Error('REKAP tidak memuat semua peserta roster. Tidak ada perubahan diterapkan.');
  notes.push('REKAP memperbarui test/observasi bila nilainya berbeda pada dua desimal. Jika sama pada dua desimal, presisi sumber leaderboard dipertahankan. Semua nilai REKAP tetap disimpan terpisah; tidak ditambahkan dua kali.');
}
function applyFacilitator(book,data,notes){
  for(const day of [2,3]){
    const rows=sheet(book,'Day '+day).rows;let n=null,group=null,found=0;
    for(let ri=2;ri<rows.length;ri++){
      const r=rows[ri];if(!r)continue;
      if(r[0]){n=groupNumber(r[0]);group=data.groups.find(g=>g.id===gid(n));if(!group)throw Error('Kelompok fasil tidak cocok: '+r[0]);group.legacyInputs['tasks'+day]=Array.from({length:day===2?3:4},(_,i)=>numeric(r[i+3],'rating fasil'));found++;}
      if(r[2]&&!data.isAnonymous){const p=data.participants.find(p=>normalize(p.name)===normalize(r[2]));if(!p||p.groupId!==group?.id)throw Error('Anggota kelompok fasil tidak cocok: '+r[2]);}
    }
    if(found!==data.groups.length)throw Error('Data fasil Day '+day+' tidak mencakup semua kelompok.');
  }
  notes.push('Rating fasil 1-4 dinormalisasi oleh aplikasi; nilai tugas tidak dihitung dua kali dari REKAP.');
}
function objectRows(rows,required){
  const clean=rows.filter(r=>r?.some(v=>v!==null&&v!==undefined&&v!==''));if(!clean.length)return [];
  const head=clean[0].map(normalize);for(const h of required)if(!head.includes(h))throw Error('Header wajib tidak ada: '+h);
  return clean.slice(1).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]??'']))).filter(r=>Object.values(r).some(v=>v!==''));
}
function applyStandardTables(tables,data,notes){
  if(data.projectYear!==2026)throw Error('Template standar ini untuk proyek 2026. Pilih proyek 2026 terlebih dahulu.');
  const checkYear=r=>{if(Number(r.program_year)!==2026)throw Error('program_year wajib 2026. Data lintas tahun tidak digabungkan.');};
  for(const [name,rows] of Object.entries(tables)){
    if(normalize(name)==='peserta'){
      const parsed=objectRows(rows,['program_year','participant_id','name','main_dealer','group_id','group_name']);
      parsed.forEach(checkYear);data.participants=parsed.map(r=>({id:String(r.participant_id).trim(),name:String(r.name).trim(),dealer:String(r.main_dealer).trim(),groupId:String(r.group_id).trim()}));
      const gs=new Map();for(const r of parsed){if(gs.has(r.group_id)&&gs.get(r.group_id)!==r.group_name)throw Error('Nama kelompok tidak konsisten.');gs.set(String(r.group_id).trim(),String(r.group_name).trim());}data.groups=Array.from(gs,([id,name])=>({id,name}));
    }
    if(normalize(name)==='komponen'){
      const parsed=objectRows(rows,['program_year','component_id','label','scope','max_score','weight','enabled']);parsed.forEach(checkYear);
      data.components=parsed.map(r=>({id:String(r.component_id).trim(),label:String(r.label).trim(),scope:normalize(r.scope),max:numeric(r.max_score,'max_score'),weight:numeric(r.weight,'weight')??0,enabled:!['false','0','no','tidak'].includes(normalize(r.enabled))}));
    }
    for(const scope of ['individual','group'])if(normalize(name)===(scope==='individual'?'nilai_individu':'nilai_kelompok')){
      const parsed=objectRows(rows,['program_year','entity_id','component_id','value']);parsed.forEach(checkYear);
      data[scope==='individual'?'individualScores':'groupScores']=parsed.map(r=>({entityId:String(r.entity_id).trim(),componentId:String(r.component_id).trim(),value:numeric(r.value,'value')}));
    }
  }
  data.rulesApproved=false;notes.push('Aturan kembali berstatus Draft setelah impor; persetujuan internal harus diperiksa ulang.');return data;
}
export async function prepareImport(file,current){
  if(file.size>20*1024*1024)throw Error('Batas file 20 MB.');let data=clone(current),notes=[],kind='';const lower=file.name.toLowerCase();
  if(lower.endsWith('.json')){data=JSON.parse(await file.text());kind='Backup / data uji';if(data.projectYear===2026)data.rulesApproved=false;}
  else if(lower.endsWith('.xlsx')){
    const book=await readWorkbook(file),names=Object.keys(book).map(normalize);
    if(names.includes('database individual')&&names.includes('ref peserta')){const oldNotes=data.sourceNotes;data=leaderboardDataset(book,notes);data.sourceNotes=oldNotes||[];kind='Leaderboard 2025';}
    else if(names.includes('rekap')){if(data.projectYear!==2025)throw Error('REKAP ini adalah format 2025. Jangan dipakai sebagai hasil 2026.');applyRecap(book,data,notes);kind='Rekap 2025';}
    else if(names.includes('day 2')&&names.includes('day 3')){if(data.projectYear!==2025)throw Error('Lembar fasil ini format 2025. Gunakan template standar 2026.');applyFacilitator(book,data,notes);kind='Fasilitator 2025';}
    else if(names.includes('peserta')||names.includes('komponen')){applyStandardTables(Object.fromEntries(Object.entries(book).map(([k,s])=>[k,s.rows])),data,notes);kind='Template standar 2026';}
    else throw Error('Struktur workbook belum dikenali. Gunakan tiga format 2025 atau template standar 2026.');
  }else if(lower.endsWith('.csv')){
    const rows=parseCSV(await file.text()),head=rows[0]?.map(normalize)||[];
    const name=head.includes('participant_id')?'Peserta':head.includes('max_score')?'Komponen':lower.includes('kelompok')?'Nilai_Kelompok':'Nilai_Individu';
    applyStandardTables({[name]:rows},data,notes);kind='CSV '+name;
  }else throw Error('Format yang didukung: .xlsx, .csv, .json.');
  if(data.projectYear!==current.projectYear)throw Error('Tahun file '+data.projectYear+' berbeda. Pilih proyek '+data.projectYear+' sebelum mengimpor.');
  validateDataset(data);return {data,notes,kind,fileName:file.name};
}
