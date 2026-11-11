// Usage: node tests/sim-release.js   (no browser). Mirrors ringR/landFrom/v05 perfect landing and the v09 career window (base+slope*Lr).
// Replays the pub-tier career throw model with tester-fitted inputs (Supabase tops_darts, career tier 0, T20-aimed darts n=1517).
const dtq=[-356,-105,-83,-72,-65,-61,-56,-52,-48,-44,-40,-37,-34,-31,-29,-26,-24,-22,-21,-19,-17,-16,-14,-12,-10,-8,-6,-4,-2,1,3,5,7,9,11,14,16,19,21,24,27,29,34,38,43,50,55,65,78,104];
const lxq=[-26.6,-20.7,-17.8,-16.0,-14.1,-12.5,-11.4,-10.4,-9.3,-8.6,-8.0,-7.1,-6.4,-5.7,-5.1,-4.6,-4.2,-3.7,-3.2,-2.8,-2.4,-2.0,-1.7,-1.2,-0.8,-0.4,-0.1,0.3,0.7,1.0,1.6,2.1,2.4,2.9,3.4,4.0,4.5,5.2,5.8,6.8,7.4,8.3,9.4,10.5,11.3,12.7,14.2,16.7,19.7,25.5];
const lyq=[-28.3,-20.2,-15.6,-13.6,-12.0,-10.2,-9.0,-7.7,-6.5,-6.0,-4.9,-4.2,-3.5,-3.0,-2.7,-2.2,-1.8,-1.4,-1.1,-0.8,-0.5,-0.3,0.1,0.3,0.5,0.8,1.1,1.3,1.5,2.0,2.4,2.8,3.0,3.4,4.1,4.7,5.4,6.4,6.9,7.8,8.7,9.2,10.2,11.3,12.5,13.7,15.3,17.2,20.9,25.2];
const nq=[0,0,0.03,0.33,0.56,0.78,0.95,1.09,1.37,1.75];
const smp=q=>{const u=Math.random()*(q.length-1);const i=Math.floor(u);return q[i]+(q[i+1]-q[i])*(u-i);};
const ORDER=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];const R={bull:6.35,obull:15.9,tIn:99,tOut:107,dIn:162,dOut:170};
function scoreAt(x,y){const d=Math.hypot(x,y);if(d<=R.bull)return 50;if(d<=R.obull)return 25;if(d>R.dOut)return 0;let a=Math.atan2(x,-y)*180/Math.PI;a=(a+360+9)%360;const n=ORDER[Math.floor(a/18)%20];if(d>=R.dIn)return 2*n;if(d>=R.tIn&&d<=R.tOut)return 3*n;return n;}
function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function ringR(dt,tp){const Rmin=1.794*tp.s0;const e=Math.max(0,Math.abs(dt)-tp.P);const k=Math.pow(e/Math.max(80,tp.D-tp.P),.5);return Math.min(70,Rmin+Math.max(0,tp.R0-Rmin)*k*(dt>0?1.3:1)*(tp.kv||1));}
function land(lock,tp,dt){if(Math.abs(dt)<=tp.P){const sg=tp.s0*.6;return {x:lock.x+gauss()*sg*.95,y:lock.y+gauss()*sg*.85};}
 const r=ringR(dt,tp);const sg=r/1.794;const lean=Math.sign(dt)*.35*(r-1.794*tp.s0);return {x:lock.x+gauss()*sg*.95,y:lock.y+lean+gauss()*sg*.85};}
// base(Lr) = career window before nerves; Lr ~0.19 fits the logged mean base window of 22.7 ms with 20+14*Lr
function run(base,slope,{Lr=.19,dtScale=1,N=200000,nvAdd=0}={}){let pts=0,perf=0;for(let i=0;i<N;i++){const nv=smp(nq)+nvAdd;const dt=smp(dtq)*dtScale;
 const tp={P:(base+slope*Lr)*(1-.3*Math.min(1,nv/2)),s0:12,D:(660-30*Lr/.3)*(1-.08*Math.min(1,nv)),R0:(74-12*Lr/.3)*(1+.1*nv),kv:1+.1*nv};
 const lock={x:smp(lxq),y:-103+smp(lyq)};const l=land(lock,tp,dt);pts+=scoreAt(l.x,l.y);if(Math.abs(dt)<=tp.P)perf++;}
 return {avg:+(pts/N*3).toFixed(1),perf:+(perf/N*100).toFixed(1)};}
const cfgs=[['current 20+14Lr',20,14],['12+8Lr',12,8],['13+9Lr',13,9],['14+10Lr',14,10]];
const out={};for(const [n,b,s] of cfgs){out[n]={pool:run(b,s),mid_skill:run(b,s,{dtScale:1.15}),strong:run(b,s,{dtScale:.75}),pressure:run(b,s,{nvAdd:1.5})};}
console.log(JSON.stringify(out,null,1));
