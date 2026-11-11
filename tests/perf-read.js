// Formats tests/perf-read.sql output (JSON array) as a table and flags regressions as WARNINGS (not release failures; six testers):
// for the same tester + device class + phase, each version vs the previous one: median p95 +20%, pooled % frames >33 ms +1 point,
// stalls per visible minute doubled, reticle p95 +20%, any new audio issues. Fewer than 3 matches on either side = "low data".
// usage: node tests/perf-read.js rows.json   (or: cat rows.json | node tests/perf-read.js)
const fs=require('fs');const raw=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):fs.readFileSync(0,'utf8');
let rows=JSON.parse(raw);if(!Array.isArray(rows)&&rows.result)rows=rows.result;
const num=v=>v==null?null:+v;const cmpV=(a,b)=>{const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d;}return 0;};
const cols=['tester','device_class','ver','phase','matches','visible_min','fps','p95_median','pct33','stalls100','max_ms','reticle_p95_median','audio_issues','underruns','draws_max'];
const w=cols.map(c=>Math.max(c.length,...rows.map(r=>String(r[c]==null?'–':r[c]).length)));
console.log(cols.map((c,i)=>c.padEnd(w[i])).join('  '));rows.forEach(r=>console.log(cols.map((c,i)=>String(r[c]==null?'–':r[c]).padEnd(w[i])).join('  ')));
const g={};rows.forEach(r=>{const k=[r.tester,r.device_class,r.phase].join(' | ');(g[k]=g[k]||[]).push(r);});const warn=[];
for(const [k,list] of Object.entries(g)){list.sort((a,b)=>cmpV(a.ver,b.ver));for(let i=1;i<list.length;i++){const a=list[i-1],b=list[i];const low=(num(a.matches)<3||num(b.matches)<3)?' (low data)':'';const tag=`${k}: ${a.ver} -> ${b.ver}`;
  const up=(x,y,f)=>x!=null&&y!=null&&x>0&&y>x*f;
  if(up(num(a.p95_median),num(b.p95_median),1.2))warn.push(`${tag} p95 ${a.p95_median} -> ${b.p95_median} ms${low}`);
  if(num(a.pct33)!=null&&num(b.pct33)!=null&&num(b.pct33)-num(a.pct33)>=1)warn.push(`${tag} frames >33 ms ${a.pct33}% -> ${b.pct33}%${low}`);
  const spm=r=>num(r.visible_min)?num(r.stalls100)/num(r.visible_min):null;if(up(spm(a),spm(b),2))warn.push(`${tag} stalls >100 ms per minute ${spm(a).toFixed(2)} -> ${spm(b).toFixed(2)}${low}`);
  if(up(num(a.reticle_p95_median),num(b.reticle_p95_median),1.2))warn.push(`${tag} reticle p95 ${a.reticle_p95_median} -> ${b.reticle_p95_median} ms${low}`);
  if(num(b.audio_issues)>num(a.audio_issues||0)||num(b.underruns)>num(a.underruns||0))warn.push(`${tag} audio issues ${a.audio_issues||0}/${a.underruns||0} -> ${b.audio_issues}/${b.underruns} (state changes/underruns)${low}`);}}
console.log('\n'+(warn.length?'WARNINGS (inspect, not release failures):\n- '+warn.join('\n- '):'No regressions flagged.'));
