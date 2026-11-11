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
// Standard checkout table (Hayden 22:59: PDC-style preferred routes; favour leaving D20, D16, D8; Bull where it's the real play).
// One route per finishable score 2-170, three darts in hand. Fewer darts in hand: the same route if it fits, else no finish.
// Reviewed with ChatGPT; guarded by tests/checkouts.js. Bogeys (169,168,166,165,163,162,159) have no entry.
const CO_STD='170 T20 T20 BULL|167 T20 T19 BULL|164 T20 T18 BULL|161 T20 T17 BULL|160 T20 T20 D20|158 T20 T20 D19|157 T20 T19 D20|156 T20 T20 D18|155 T20 T19 D19|154 T20 T18 D20|153 T20 T19 D18|152 T20 T20 D16|151 T20 T17 D20|150 T20 T18 D18|149 T20 T19 D16|148 T20 T16 D20|147 T20 T17 D18|146 T20 T18 D16|145 T20 T15 D20|144 T20 T20 D12|143 T20 T17 D16|142 T20 T14 D20|141 T20 T19 D12|140 T20 T20 D10|139 T20 T13 D20|138 T20 T18 D12|137 T20 T19 D10|136 T20 T20 D8|135 T20 T17 D12|134 T20 T14 D16|133 T20 T19 D8|132 T20 T16 D12|131 T20 T13 D16|130 T20 T18 D8|129 T19 T16 D12|128 T18 T14 D16|127 T20 T17 D8|126 T19 T19 D6|125 25 T20 D20|124 T20 T16 D8|123 T19 T10 D18|122 T18 T12 D16|121 T20 T15 D8|120 T20 S20 D20|119 T19 T10 D16|118 T20 S18 D20|117 T20 S17 D20|116 T20 S16 D20|115 T20 S15 D20|114 T20 S14 D20|113 T20 S13 D20|112 T20 S12 D20|111 T20 S19 D16|110 T20 BULL|109 T20 S9 D20|108 T20 S16 D16|107 T19 BULL|106 T20 S10 D18|105 T20 S13 D16|104 T18 BULL|103 T19 S6 D20|102 T20 S10 D16|101 T17 BULL|100 T20 D20|99 T19 S10 D16|98 T20 D19|97 T19 D20|96 T20 D18|95 T19 D19|94 T18 D20|93 T19 D18|92 T20 D16|91 T17 D20|90 T18 D18|89 T19 D16|88 T16 D20|87 T17 D18|86 T18 D16|85 T15 D20|84 T20 D12|83 T17 D16|82 BULL D16|81 T19 D12|80 T20 D10|79 T13 D20|78 T18 D12|77 T19 D10|76 T20 D8|75 T17 D12|74 T14 D16|73 T19 D8|72 T16 D12|71 T13 D16|70 T18 D8|69 T19 D6|68 T20 D4|67 T17 D8|66 T10 D18|65 25 D20|64 T16 D8|63 T13 D12|62 T10 D16|61 T15 D8|60 S20 D20|59 S19 D20|58 S18 D20|57 S17 D20|56 S16 D20|55 S15 D20|54 S14 D20|53 S13 D20|52 S12 D20|51 S11 D20|50 BULL|49 S9 D20|48 S16 D16|47 S15 D16|46 S6 D20|45 S13 D16|44 S12 D16|43 S11 D16|42 S10 D16|41 S9 D16|40 D20|39 S7 D16|38 D19|37 S5 D16|36 D18|35 S3 D16|34 D17|33 S1 D16|32 D16|31 S15 D8|30 D15|29 S13 D8|28 D14|27 S11 D8|26 D13|25 S9 D8|24 D12|23 S7 D8|22 D11|21 S5 D8|20 D10|19 S3 D8|18 D9|17 S1 D8|16 D8|15 S7 D4|14 D7|13 S5 D4|12 D6|11 S3 D4|10 D5|9 S1 D4|8 D4|7 S3 D2|6 D3|5 S1 D2|4 D2|3 S1 D1|2 D1';
const CO3={};CO_STD.split('|').forEach(l=>{const p=l.split(' ');CO3[+p[0]]=p.slice(1);});
function route(s,d){
  if(s<2||s>170||d<1)return null;
  const r=CO3[s];return r&&r.length<=d?r.slice():null;
}
// the best single to leave a preferred double with one dart (60 -> S20 leaves D20)
const SETUP_LEAVE=[40,32,16,8,24,36,20,12,28,18,10,4,38,34,30,26,22,14,6,2];
function setupSingle(s){for(const left of SETUP_LEAVE){const n=s-left;if(n>=1&&n<=20)return 'S'+n;}if(s-50>=1&&s-50<=20)return 'S'+(s-50);return null;}
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
  // no finish with the darts in hand: standard set-up play
  if(s>=2&&s<=170){
    if(s<=60){const t=CO3[s];const su=t&&t[0][0]==='S'?t[0]:setupSingle(s);if(su)return su;}   // e.g. 60 with one dart: S20 to leave D20; 45: S13 for D16
    if(d>=2&&CO3[s])return CO3[s][0];                              // e.g. 120 with two darts: T20, then S20 for D20
  }
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
 const stdLen=(route(s,d)||[]).length||d,OKD=new Set(['D20','D16','D8','D18','D12','D10','D14','D4','BULL']);
 const sane=(r)=>{const last=r[r.length-1],pre=r.slice(0,-1);
   if(r.length>stdLen)return false;                                                     // never more darts than the standard route
   if(!OKD.has(last))return false;                                                       // finish on a playable double
   if(pre.some(x=>x[0]==='T'&&+x.slice(1)<10))return false;                               // set-up trebles T10-T20 only
   if(pre.some(x=>x[0]==='S'&&+x.slice(1)<10)&&!(r.length===2&&s<=60))return false;   // no S1-S9 set-ups except the 41-60 single-double outs
   if(r.length===2&&s<=60&&pre[0][0]==='T')return false;                               // 60 and under: single then double, not a treble
   if(last==='BULL'&&!pre.every(x=>x==='BULL'||(x[0]==='T'&&+x.slice(1)>=17)))return false;   // a Bull finish follows T17-T20 or a Bull only
   if(pre.some(x=>x==='25'))return false;
   return true;};
 for(const k of [...out.keys()])if(!sane(out.get(k)))out.delete(k);
 if(d>=2&&s===100)out.set('BULL BULL',['BULL','BULL']);                                   // the flex
 const conv=route(s,d);if(conv)out.set(conv.join(' '),conv);const arr=[...out.values()].map(r=>({r,q:score(r)+(conv&&r.join(' ')===conv.join(' ')?1000:0)+(r.length===1?500:0),style:routeStyle(r)})).sort((a,b)=>b.q-a.q);
 const pick=[];const seenLast=new Set();for(const x of arr){const last=x.r[x.r.length-1];if(seenLast.has(last)&&pick.length>=2)continue;seenLast.add(last);pick.push(x);if(pick.length>=4)break;}
 const sty=arr.filter(x=>x.style>=3).sort((a,b)=>b.style-a.style||b.q-a.q)[0];if(sty&&!pick.includes(sty)){if(pick.length>=4)pick.pop();pick.push(sty);}
 return pick;}
