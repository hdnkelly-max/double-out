// R0 #19 (Q&D): log every WebGL program link per phase on Hayden's path: exhibition match (match 1) -> result -> perk -> hub
// -> "walk on" next fixture (match 2). Flags program variants (shader name + defines + light counts) that are NEW in match 2 or in
// the hub before it, and diffs the board material's shader source between match 1 and match 2.
// Chromium won't reproduce the iOS Metal link failure, so this passes or fails on a new variant appearing, not on the link.
// usage: node program-variants.js <dir with index.html> [VW=390]      env: OUT=dir for the JSON report
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const crypto=require('crypto');
const ROOT=path.resolve(process.argv[2]||'.');const VW=+(process.env.VW||390);
const OUT=process.env.OUT||path.join(__dirname,'out','pv');fs.mkdirSync(OUT,{recursive:true});
const T0=Date.now();const log=(...a)=>console.log(((Date.now()-T0)/1000).toFixed(0)+'s',...a);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:VW,height:VW===360?640:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
await ctx.addInitScript(()=>{const P=window.__PV={byGl:new WeakMap(),links:[],phase:'boot',m:0,ctxId:new WeakMap(),nctx:0};
 const hook=C=>{if(!C)return;const pr=C.prototype;const src=new WeakMap(),att=new WeakMap();
  const ss=pr.shaderSource;pr.shaderSource=function(sh,s){src.set(sh,s);return ss.apply(this,arguments);};
  const as=pr.attachShader;pr.attachShader=function(p,sh){let a=att.get(p);if(!a)att.set(p,a=[]);a.push(sh);return as.apply(this,arguments);};
  const lp=pr.linkProgram;pr.linkProgram=function(p){const r=lp.apply(this,arguments);try{let id=P.ctxId.get(this);if(id==null){id=P.nctx++;P.ctxId.set(this,id);}
   const ss2=(att.get(p)||[]).map(sh=>src.get(sh)||'');const all=ss2.join('\n//----\n');const fsrc=ss2.find(s=>/gl_FragColor|pc_fragColor|out highp vec4/.test(s))||ss2[1]||'';
   const name=(all.match(/#define SHADER_NAME (\S+)/)||[])[1]||'?';
   const defs=[...new Set((all.match(/^#define [A-Z_0-9]+( [^\n]*)?$/gm)||[]).map(x=>x.replace(/^#define /,'')))].filter(d=>!/^(SHADER_NAME|PI|PI2|PI_HALF|RECIPROCAL_PI|RECIPROCAL_PI2|LOG2|EPSILON|saturate|whiteComplement|precision|HIGH_PRECISION|GAMMA_FACTOR|PHYSICAL|STANDARD|LAMBERT|PHONG|TOON|MATCAP|DISTANCE|DEPTH_PACKING|USE_|FLAT_SHADED|DOUBLE_SIDED|FLIP_SIDED)/.test(d)||/^(USE_|DOUBLE_SIDED|FLIP_SIDED|FLAT_SHADED|PHYSICAL|STANDARD)/.test(d)).sort();
   const num=k=>{const arr={NUM_DIR_LIGHTS:'directionalLights',NUM_POINT_LIGHTS:'pointLights',NUM_SPOT_LIGHTS:'spotLights',NUM_HEMI_LIGHTS:'hemisphereLights',NUM_RECT_AREA_LIGHTS:'rectAreaLights',NUM_DIR_LIGHT_SHADOWS:'directionalShadowMap',NUM_SPOT_LIGHT_SHADOWS:'spotShadowMap',NUM_POINT_LIGHT_SHADOWS:'pointShadowMap'}[k];if(arr){const m=all.match(new RegExp(arr+'\\[ ?(\\d+) ?\\]'));return m?+m[1]:0;}const m=all.match(new RegExp('#define '+k+' (\\d+)'));return m?+m[1]:0;};
   const lights={dir:num('NUM_DIR_LIGHTS'),point:num('NUM_POINT_LIGHTS'),spot:num('NUM_SPOT_LIGHTS'),hemi:num('NUM_HEMI_LIGHTS'),rect:num('NUM_RECT_AREA_LIGHTS'),dirShadow:num('NUM_DIR_LIGHT_SHADOWS'),spotShadow:num('NUM_SPOT_LIGHT_SHADOWS'),pointShadow:num('NUM_POINT_LIGHT_SHADOWS'),clip:num('NUM_CLIPPING_PLANES')};
   const ok=this.getProgramParameter(p,this.LINK_STATUS);
   let st='';try{st=new Error().stack.split('\n').slice(2).map(l=>(l.match(/at (?:new )?([\w$.]+)/)||[])[1]).filter(Boolean).filter(n=>!/^(Object|WebGL|acquireProgram|getProgram|setProgram|initMaterial|renderObject|renderObjects|renderScene|render|e\.render|Array|projectObject)/.test(n)).slice(0,3).join('<');}catch(e){}
   P.byGl.set(p,P.links.length);P.links.push({t:Math.round(performance.now()),phase:P.phase,m:P.m,ctx:id,canvas:(this.canvas&&(this.canvas.id||this.canvas.className||this.canvas.parentNode&&this.canvas.parentNode.id))||'?',name,defs,lights,ok,src:all,fs:fsrc,by:st,ver:/#version 300 es/.test(all)?2:1});}catch(e){}return r;};};
 hook(window.WebGLRenderingContext);hook(window.WebGL2RenderingContext);
});
const p=await ctx.newPage();await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
p.on('console',m=>{if(m.type()==='error'&&/shader|program|WebGL/i.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
await p.goto('file://'+ROOT+'/index.html?exh=1');await p.waitForFunction(()=>typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&typeof showHub==='function',null,{timeout:90000});await p.waitForTimeout(1500);
// phase tags: match N from beginMatch, 'hub' while no live match after a match
await p.evaluate(()=>{const P=window.__PV;const _bm=beginMatch;beginMatch=window.beginMatch=function(){P.m++;P.phase='match'+P.m;return _bm.apply(this,arguments);};
 setInterval(()=>{try{const live=typeof S!=='undefined'&&S&&!S.done;if(!live&&P.m>0&&!/^after/.test(P.phase))P.phase='after'+P.m;}catch(e){}},100);
 save.authSeen=true;save.lessonDone=true;const l=$('login');if(l)l.hidden=true;newCareer();const c=career();c.stage=null;
 startBullUp=(function(o){return function(){try{S.bull=null;S.cur=0;S.dart=1;S.visit=[];S.busy=false;startTurn();}catch(e){o.apply(this,arguments);}};})(startBullUp);
 P.phase='hub0';showHub();});
// match 1: the exhibition through its own poster (?exh=1 forces one)
const gotPoster=await p.waitForSelector('#tcPGo',{timeout:20000}).then(()=>true).catch(()=>false);log('poster',gotPoster);
if(gotPoster)await p.click('#tcPGo');else{log('no poster: starting the exhibition directly');await p.evaluate(()=>{const L=TC_API&&window.TC_D?null:null;const c=career();beginMatch({mode:'career',tier:c.tier,p0:save.name||'You',oppName:'Raymond van Barneveld',oppAvg:90,legs:3,purse:0,local:true,tcExh:'rvb'});});}
const state=()=>p.evaluate(()=>{try{const ic=document.querySelector('#intro.show');const live=typeof S!=='undefined'&&S&&!S.done;if(ic){document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}
 if(!live)return 'none';if(document.body.classList.contains('tc-walking')){const o=document.getElementById('tcWalk');if(o)o.click();return 'walk';}if(S.bull)return 'bull';return (S.cur===0&&!S.busy&&!(S.flights&&S.flights.length))?'myturn':'wait';}catch(e){return 'ERR '+e.message;}});
const snapBoard=(tag)=>p.evaluate(tag=>{const r=V._qa.renderer,props=r.properties,out={tag,programs:r.info.programs.length,progUsed:r.info.programs.map(x=>x.name+':'+x.usedTimes).join(' '),progNames:r.info.programs.map(x=>x.name+'#'+x.id),lights:{},board:[]};
 V._qa.scene.traverse(o=>{if(o.isLight){const k=o.type;out.lights[k]=(out.lights[k]||0)+(o.visible?1:0);}
  if(o.isMesh&&o.material){const ms=Array.isArray(o.material)?o.material:[o.material];const nm=(o.name||'')+' '+(o.parent&&o.parent.name||'');if(o.geometry&&o.geometry.parameters&&Math.abs((o.geometry.parameters.radius||0)-.2255)<1e-4){ms.forEach(m=>{const pp=props.get(m);const cp=pp&&(pp.currentProgram||pp.program);const li=cp&&cp.program!=null?window.__PV.byGl.get(cp.program):undefined;out.board.push({mesh:o.name||'(unnamed)',type:m.type,visible:o.visible,prog:cp?cp.name+'#'+cp.id:null,link:li,usedTimes:cp?cp.usedTimes:null});});}}});
 return out;},tag);
const snaps={};let measured={};let k=0;const t0=Date.now();
while(Date.now()-t0<900000){const st=await state();const m=await p.evaluate(()=>window.__PV.m);
 if(st==='myturn'){if(!measured[m]){await p.waitForTimeout(1500);snaps['match'+m]=await snapBoard('match'+m);log('match',m,'programs',snaps['match'+m].programs,'board',JSON.stringify(snaps['match'+m].board.slice(0,3)),'lights',JSON.stringify(snaps['match'+m].lights));measured[m]=1;if(m>=2)break;}
  await p.evaluate(()=>{if(S.p[1].score>40)S.p[1].score=40;S.busy=true;land(.9,.9);});}
 else if(st==='none'&&m>=1){// after match 1: follow the screens a player would: Continue / perk Later / picks / toasts, stop at the hub, then walk on
  const seq=[];for(let j=0;j<60;j++){const s2=await state();if(s2!=='none')break;
   const bt=await p.evaluate(()=>{const ok=b=>b&&!b.hidden&&b.offsetParent!==null&&!b.disabled;const hub=document.getElementById('c3Go');
    let b=null;for(const id of ['btnResultNext','btnPerkLater']){const x=document.getElementById(id);if(ok(x)){b=x;break;}}
    if(!b)b=[...document.querySelectorAll('button')].find(x=>ok(x)&&/^(continue|later|nice|cheers|open later|keep current shirt|not tonight)/i.test(x.textContent.trim()));
    if(!b)b=[...document.querySelectorAll('.tc-x,button')].find(x=>ok(x)&&x.textContent.trim()==='✕');
    if(!b&&ok(hub)){window.__PV.phase='hub1';return 'HUB';}
    if(b){const t=(b.id||'')+':'+b.textContent.trim().slice(0,20);b.click();return t;}return null;});
   if(bt==='HUB'){if(!snaps.hub1){await p.waitForTimeout(3000);snaps.hub1=await snapBoard('hub1');seq.push('hub (3 s)');}await p.evaluate(()=>{window.__PV.phase='walkon2';document.getElementById('c3Go').click();});seq.push('#c3Go walk on');await p.waitForTimeout(800);continue;}
   if(bt)seq.push(bt);await p.waitForTimeout(bt?700:400);}
  log('path:',seq.join(' > '));if(!seq.length){log('stuck after match',m);break;}}
 else if(String(st).startsWith('ERR')){log(st);break;}
 await p.waitForTimeout(200);}
const R=await p.evaluate(()=>window.__PV.links.map(l=>({...l})));
const key=l=>l.ctx+'|'+l.name+'|'+l.defs.join(',')+'|'+JSON.stringify(l.lights);
const h=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,10);
const ph=l=>/^match1|^boot|^hub0/.test(l.phase)?'A':'B';// A = up to and including match 1; B = after match 1 (hub, walk-on, match 2)
const seenA=new Set(R.filter(l=>ph(l)==='A').map(key));const newB=R.filter(l=>ph(l)==='B'&&!seenA.has(key(l)));
const rows=R.map(l=>({t:l.t,phase:l.phase,ctx:l.ctx,canvas:l.canvas,name:l.name,lights:l.lights,ok:l.ok,hash:h(l.src),by:l.by,defs:l.defs}));
fs.writeFileSync(path.join(OUT,'links-'+VW+'.json'),JSON.stringify({rows,snaps,errs},null,1));
// board diff: programs used by the board in match 1 vs match 2
const bp=t=>(snaps[t]&&snaps[t].board||[]).map(x=>x.prog).filter(Boolean);const b1=bp('match1'),b2=bp('match2');
const findSrc=nameId=>{const id=+String(nameId).split('#')[1];return null;};// three's program id is internal; diff by the variant key instead
const variants=l=>({name:l.name,lights:l.lights,defs:l.defs});
const byPhase={};R.forEach(l=>{byPhase[l.phase]=(byPhase[l.phase]||0)+1;});
log('links by phase',JSON.stringify(byPhase),'failed links',R.filter(l=>!l.ok).length);
log('NEW variants after match 1 (not seen up to the end of match 1):',newB.length);
newB.forEach(l=>log('  NEW',l.phase,'ctx'+l.ctx,l.canvas,l.name,JSON.stringify(l.lights),'by',l.by,'defs+',l.defs.filter(d=>!R.some(a=>ph(a)==='A'&&a.name===l.name&&a.ctx===l.ctx&&a.defs.includes(d))).join(' '),'defs-',R.filter(a=>ph(a)==='A'&&a.name===l.name&&a.ctx===l.ctx).slice(0,1).map(a=>a.defs.filter(d=>!l.defs.includes(d)).join(' ')).join('')));
// board material shader source: the main-context variant of the board's material type in match 1 vs match 2
['match1','match2'].forEach(t=>log('board',t,JSON.stringify((snaps[t]||{}).board||[]).slice(0,400)));
const li1=(snaps.match1&&snaps.match1.board[0]||{}).link,li2=(snaps.match2&&snaps.match2.board[0]||{}).link;log('board program link: match1 #',li1,li1!=null?R[li1].phase+' '+h(R[li1].src):'','| match2 #',li2,li2!=null?R[li2].phase+' '+h(R[li2].src):'',li1!=null&&li2!=null?(R[li1].src===R[li2].src?'SAME SOURCE (re-linked '+(li1===li2?'no':'yes')+')':'DIFFERENT SOURCE'):'');
if(li1!=null&&li2!=null&&R[li1].src!==R[li2].src){const A=new Set(R[li1].src.split('\n')),B=new Set(R[li2].src.split('\n'));log('  board src only in m2:',[...B].filter(x=>!A.has(x)).slice(0,25).join(' | '));log('  board src only in m1:',[...A].filter(x=>!B.has(x)).slice(0,25).join(' | '));}
const bt1=(snaps.match1&&snaps.match1.board[0]||{}).type;const bA=R.filter(l=>l.ctx===0&&l.name===bt1&&ph(l)==='A'),bB=R.filter(l=>l.ctx===0&&l.name===bt1&&ph(l)==='B');
log('board material type',bt1,'variants up to match 1:',bA.length,'after:',bB.length);
if(bA.length&&bB.length){const last=bA[bA.length-1],nw=bB[bB.length-1];const la=new Set(last.fs.split('\n')),lb=new Set(nw.fs.split('\n'));
 log('  board shader diff (fragment lines only in match 2):',[...lb].filter(x=>!la.has(x)).slice(0,20).join(' | '));log('  board shader diff (fragment lines only in match 1):',[...la].filter(x=>!lb.has(x)).slice(0,20).join(' | '));}
log('programs: match1',snaps.match1&&snaps.match1.programs,'hub',snaps.hub1&&snaps.hub1.programs,'match2',snaps.match2&&snaps.match2.programs,'| lights m1',JSON.stringify(snaps.match1&&snaps.match1.lights),'m2',JSON.stringify(snaps.match2&&snaps.match2.lights));
log('errors',JSON.stringify(errs.slice(0,4)));
console.log(newB.length?'PROGRAM-VARIANTS FLAG: '+newB.length+' program variant(s) first linked after match 1 (see NEW lines)':'PROGRAM-VARIANTS PASS: no program variant first appears after match 1');
await b.close();})().catch(e=>{console.error(e);process.exit(2);});
