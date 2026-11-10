// ===== ENGINE =====
const ORDER=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const R={bull:6.35,obull:15.9,tIn:99,tOut:107,dIn:162,dOut:170};
function scoreAt(x,y){
  const d=Math.hypot(x,y);
  if(d<=R.bull) return {v:50,m:2,n:25,label:'BULL',dbl:true};
  if(d<=R.obull) return {v:25,m:1,n:25,label:'25',dbl:false};
  if(d>R.dOut) return {v:0,m:0,n:0,label:'MISS',dbl:false};
  let a=Math.atan2(x,-y)*180/Math.PI; a=(a+360+9)%360;
  const n=ORDER[Math.floor(a/18)%20];
  if(d>=R.dIn) return {v:2*n,m:2,n,label:'D'+n,dbl:true};
  if(d>=R.tIn&&d<=R.tOut) return {v:3*n,m:3,n,label:'T'+n,dbl:false};
  return {v:n,m:1,n,label:String(n),dbl:false};
}
function polar(n,r){const i=ORDER.indexOf(n);const a=i*18*Math.PI/180;return {x:r*Math.sin(a),y:-r*Math.cos(a)};}
function targetPoint(lbl){
  if(lbl==='BULL'||lbl==='25') return {x:0,y:0};
  if(lbl[0]==='T') return polar(+lbl.slice(1),103);
  if(lbl[0]==='D') return polar(+lbl.slice(1),166);
  return polar(+lbl.replace('S',''),134);
}
function valOf(l){if(l==='BULL')return 50;if(l==='25')return 25;if(l[0]==='T')return 3*l.slice(1);if(l[0]==='D')return 2*l.slice(1);return +l.replace('S','');}
function oneDart(s){if(s===50)return 'BULL';if(s>=2&&s<=40&&s%2===0)return 'D'+s/2;return null;}
const PREF_LEFT=[40,32,16,36,24,20,8,12,28,4,38,34,30,26,22,18,14,10,6,2,50];
let PL=PREF_LEFT;
function prefLeft(dbl){if(!dbl)return PREF_LEFT;const chain=[];let v=dbl==='BULL'?50:dbl*2;if(dbl==='BULL'){chain.push(50);}else{while(v>=2&&!chain.includes(v)){chain.push(v);if(v%2)break;v=v/2;}}return chain.concat(PREF_LEFT.filter(x=>!chain.includes(x)));}
function withPref(dbl,fn){const old=PL;PL=prefLeft(dbl);try{return fn();}finally{PL=old;}}
function twoDart(s){
  for(const left of PL){const need=s-left;if(need<=0)continue;
    let f=null;
    if(need<=20) f='S'+need; else if(need===25) f='25'; else if(need%3===0&&need/3<=20) f='T'+need/3; else if(need===50) f='BULL';
    if(f) return [f,oneDart(left)];}
  return null;
}
const FIRST3=[];for(let n=20;n>=10;n--)FIRST3.push('T'+n);FIRST3.push('BULL','25');for(let n=9;n>=1;n--)FIRST3.push('T'+n);
function route(s,d){
  if(s<2||s>170)return null;
  const o=oneDart(s); if(o&&d>=1&&s<=40) return [o];
  if(d>=2){const t=twoDart(s);if(t)return t;}
  if(o&&d>=1) return [o];
  if(d>=3){for(const f of FIRST3){const r=twoDart(s-valOf(f));if(r)return [f,...r];}}
  return null;
}
const BOGEY=new Set([169,168,166,165,163,162,159]);
const CANDS=[];for(let n=20;n>=1;n--)CANDS.push('T'+n);for(let n=20;n>=1;n--)CANDS.push('S'+n);CANDS.push('25','BULL');
// how good is it to be left on r at the start of a fresh visit (or with the darts you still hold)
function leaveQ(r){if(r<2||r===1)return -1e9;
  const o=oneDart(r);if(o){const i=PL.indexOf(r);return 100-(i<0?30:i);}
  if(r<=110&&twoDart(r))return 62-r*.12-(r<=40&&r%2?4:0); // two-dart out; odd under 40 is clumsier
  if(r<=170&&route(r,3))return 40-r*.05;          // three-dart out
  if(BOGEY.has(r))return 5;
  return 20-r*.02;}                               // still scoring: smaller is better
// expected leave quality: a treble attempt often lands in the single, a bull attempt in the 25
function expQ(c,s,d){const q=(left)=>{if(left<0||left===1)return -40;let v=leaveQ(left);if(d>=2&&left>=2&&route(left,d-1))v+=40;return v;};
  if(c==='BULL')return .3*q(s-50)+.5*q(s-25)+.2*q(s);
  if(c==='25')return .55*q(s-25)+.15*q(s-50)+.3*q(s);
  const n=+c.slice(1);if(c[0]==='T'){const p=n>=15?.33:.25;return p*q(s-3*n)+(1-p)*q(s-n)+n*.05;}
  return .9*q(s-n)+.1*q(s-3*n)+n*.02;}
function aimFor(s,d){
  const r=route(s,d); if(r) return r[0];
  if(s>230) return 'T20';
  let best=null,bq=-1e9;
  for(const c of CANDS){const v=valOf(c);if(s-v<2&&s-v!==0)continue;const q=expQ(c,s,d);if(q>bq){bq=q;best=c;}}
  return best||'T20';}
function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
// apply a dart to a visit; returns {score, bust, won}
function applyDart(score,hit){const ns=score-hit.v;if(ns<0||ns===1||(ns===0&&!hit.dbl))return {score,bust:true,won:false};return {score:ns,bust:false,won:ns===0};}
// AI sigma per target average (calibrated)

// ===== multiple checkout routes (for the picker) =====
const RFIRST=[];for(let n=20;n>=1;n--)RFIRST.push('T'+n);RFIRST.push('BULL','25');for(let n=20;n>=1;n--)RFIRST.push('S'+n);for(let n=20;n>=1;n--)RFIRST.push('D'+n);
function routeStyle(r){let st=0;const bulls=r.filter(x=>x==='BULL').length;st+=bulls*2;if(r[r.length-1]==='BULL')st+=2;if(r.length===3&&r[0][0]==='T'&&r[1][0]==='T')st+=1;if(r.length===3&&r.every(x=>x[0]==='T'||x==='BULL'))st+=1;return st;}
function routesFor(s,d,pref){if(s<2||s>170||d<1)return [];const out=new Map();const fin=(x)=>x[0]==='D';
 const add=(r)=>{const k=r.join(' ');if(!out.has(k))out.set(k,r);};
 const o=oneDart(s);if(o)add([o]);
 if(d>=2){for(const f of RFIRST){if(fin(f))continue;const left=s-valOf(f);if(left<2)continue;const o2=oneDart(left);if(o2)add([f,o2]);}}
 if(d>=3){for(const f of RFIRST){if(fin(f))continue;const l1=s-valOf(f);if(l1<2)continue;for(const g of RFIRST){if(fin(g))continue;const l2=l1-valOf(g);if(l2<2)continue;const o3=oneDart(l2);if(o3)add([f,g,o3]);}}}
 const pl=prefLeft(pref);const chain=pref?pl.slice(0,pl.indexOf(PREF_LEFT[0])>0?pl.indexOf(PREF_LEFT[0]):1):[];
 const score=(r)=>{let q=0;const last=r[r.length-1];const lv=valOf(last);const pi=pl.indexOf(lv);q+=pi<0?0:(40-pi*2);if(chain.includes(lv))q+=10;q-=r.length*12;r.slice(0,-1).forEach(x=>{if(x[0]==='T'){const n=+x.slice(1);q+=n>=16?6:n>=10?2:-2;}else if(x==='BULL')q+=2;else if(x==='25')q-=4;else q+=0;});q+=routeStyle(r)*1.5;return q;};
 const conv=withPref(pref,()=>route(s,d));const arr=[...out.values()].map(r=>({r,q:score(r)+(conv&&r.join(' ')===conv.join(' ')?1000:0)+(r.length===1?500:0),style:routeStyle(r)})).sort((a,b)=>b.q-a.q);
 const pick=[];const seenLast=new Set();for(const x of arr){const last=x.r[x.r.length-1];if(seenLast.has(last)&&pick.length>=2)continue;seenLast.add(last);pick.push(x);if(pick.length>=4)break;}
 const sty=arr.filter(x=>x.style>=3).sort((a,b)=>b.style-a.style||b.q-a.q)[0];if(sty&&!pick.includes(sty)){if(pick.length>=4)pick.pop();pick.push(sty);}
 return pick;}
