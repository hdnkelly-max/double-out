<script>
(function(){
// ===== v15 · CAR-S (Overseer 07:16 / 07:20, 13 Nov): nobody loses a career to "Start a new career" =====
// 1) Tapping "Start a new career" over a career with any progress opens a sheet that names what gets replaced. "Keep my career" is the
//    default; "Replace it" goes on to the creator as before.
// 2) Whatever path calls newCareer(), the career it replaces is first copied into save.careerBak (synced with the save to the cloud) and
//    into localStorage 'tops_career_bak' (survives a cloud copy that lacks it). Newest first, at most 3; a fresh, unplayed career is never
//    backed up, so a throwaway restart can't push a real career out of the list.
// 3) The title screen shows "Bring back a previous career" while a backup exists. Restoring swaps: the current career (if played) becomes
//    a backup itself, so a restore is never a one-way door either.
const BK='tops_career_bak',MAX=3;
// every save field newCareer() resets (game4 + v09 st2 + v12), plus the career-slot fields switchSlot() moves with the career
const KEYS=['career','perks','attr','arm','picks','owned','barrel','setup','ownedSetup','sponsor','gear','composure','st2','v12res','v12new','v12ent','v12pace'];
const L=(k,d)=>{try{window.TOPS_LOG&&TOPS_LOG.log(k,d);}catch(e){}};
const cp=x=>JSON.parse(JSON.stringify(x));
function played(c){return !!c&&!c.run&&(((c.wins||0)+(c.losses||0))>0||(c.stage&&c.stage!=='intro')||((c.v3&&c.v3.lv)||1)>1||(c.bank||0)>0);}
function sumOf(c){const v=(c&&c.v3)||{};const sn=c&&c.season;return {tier:c.tier|0,w:c.wins||0,l:c.losses||0,lv:v.lv||1,bank:c.bank||0,wk:sn&&!sn.done?sn.week:null,len:sn?sn.len:null};}
function line(s){const t=(typeof TIERS!=='undefined'&&TIERS[s.tier])?TIERS[s.tier].n:'Tier '+(s.tier+1);return `${t} · ${s.w}–${s.l} · Level ${s.lv} · ${money(s.bank)}`;}
function when(at){try{return new Date(at).toLocaleString(undefined,{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});}catch(e){return '';}}
function localList(){try{const a=JSON.parse(localStorage.getItem(BK)||'[]');return Array.isArray(a)?a.filter(x=>x&&x.at&&x.d&&x.d.career):[];}catch(e){return [];}}
let LC=localList();/* this device's copy, read once; kept in step by store() */
const idOf=x=>String(x.id||x.at);
// newest first, at most MAX; 'pin' (the backup being brought back) is never the one that makes room
function norm(a,pin){const seen=new Set(),out=[];a.forEach(x=>{if(!x||!x.at||!x.d||!x.d.career)return;const id=idOf(x);if(seen.has(id))return;seen.add(id);out.push(x);});out.sort((a,b)=>b.at-a.at);
 while(out.length>MAX){let i=out.length-1;if(pin!=null&&idOf(out[i])===String(pin))i--;out.splice(i,1);}return out;}
// CAR-S2 (Q&D P2): the cloud copy carries ONE backup (the newest one that isn't the career in play); this device keeps all three. A heavily
// played career is ~24 KB, so three in the save made every cloud push ~4x bigger. The lost-career case (a new career synced over the
// old one) is covered by that one: it is always the newest.
const cur0=()=>String(save.careerFrom||'');
function cloudPick(a){return a.filter(x=>idOf(x)!==cur0()).slice(0,1);}
function shown(){return list().filter(x=>idOf(x)!==cur0());}/* the career in play is never offered back */
// the save's copy and this device's copy, merged (a cloud copy loaded from another device may lack one this device made)
function list(){return norm([].concat(Array.isArray(save.careerBak)?save.careerBak:[],LC));}
// a backup only counts once it's on the device: if localStorage refuses it, nothing is changed and the caller stops
function store(a,pin){a=norm(a,pin);try{localStorage.setItem(BK,JSON.stringify(a));}catch(e){return false;}LC=a;save.careerBak=cloudPick(a);return true;}
function uid(){try{if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();}catch(e){}return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);}
function snap(){const d={};KEYS.forEach(k=>{if(save[k]!==undefined)d[k]=cp(save[k]);});return {at:Date.now(),id:uid(),v:1,sum:sumOf(save.career),d};}
function backup(why){if((save.slot||'career')!=='career'||!played(save.career))return 'none';let s;try{s=snap();}catch(e){L('career_backup_fail',{why,step:'copy'});return 'fail';}
 const rest=list().filter(x=>idOf(x)!==cur0());/* the same career brought back earlier: this copy is newer */
 if(!store([s].concat(rest))){L('career_backup_fail',Object.assign({why,step:'device'},s.sum));return 'fail';}L('career_backup',Object.assign({why,n:LC.length},s.sum));return 'ok';}
function failSheet(){try{V.preview(false);}catch(e){}try{showTitle();}catch(e){}sheet({title:'Career kept',body:'<p>We couldn’t save a backup of your career on this phone (it may be out of space), so nothing was replaced.</p><p>Free up some space and try again.</p>',acts:[{t:'OK',k:'pri'}]});}
// No backup, no replacement. The creator's "That's me" takes the backup before its own handler runs (that handler goes on to the intro
// message and the first match, which must not run on the old career), and newCareer() itself checks again for any other caller.
let pre=false;
{const _sc=showCreator;showCreator=function(editing){const r=_sc.apply(this,arguments);try{if(!editing){const b=$('btnCreate'),og=b.onclick;b.onclick=function(e){if(backup('new')==='fail'){failSheet();return;}pre=true;try{return og.call(this,e);}finally{pre=false;}};}}catch(e){}return r;};}
const _nc=newCareer;newCareer=function(){if(pre)pre=false;else if(backup('new')==='fail'){failSheet();return;}delete save.careerFrom;return _nc.apply(this,arguments);};
// every save goes out with this device's backups in it, so loading an older cloud copy (sign-in, another device) can't drop them from the cloud
{const _p=persist;persist=function(){try{if(LC.length||Array.isArray(save.careerBak)){const want=cloudPick(list()),have=Array.isArray(save.careerBak)?save.careerBak:[];if(want.map(idOf).join()!==have.map(idOf).join())save.careerBak=want;}}catch(e){}return _p.apply(this,arguments);};}
// what bringing back 'id' stores: the played career in play (a fresh copy, replacing the entry it came from), then the rest; the one
// coming back stays (pinned). Returns the new list and the backups that make room, so the sheet can say so before anything happens.
function plan(id){const a=list();const b=a.find(x=>idOf(x)===String(id));if(!b)return null;const cur=played(save.career)?snap():null;
 const all=(cur?[cur]:[]).concat(a.filter(x=>!(cur&&idOf(x)===cur0())));const next=norm(all,idOf(b));const ids=new Set(next.map(idOf));
 return {b,cur,next,dropped:all.filter(x=>x!==cur&&!ids.has(idOf(x)))};}
function restore(id){if((save.slot||'career')!=='career')switchSlot('career');let P;try{P=plan(id);}catch(e){return 'fail';}if(!P)return 'gone';const b=P.b;
 // CAR-S2 (Q&D P2): the backup being brought back STAYS in the list (marked as the career in play, so it isn't offered back), so a save
 // that fails after this point (storage full, app killed) can't lose it: on the next load it is simply offered again. The outgoing
 // career is stored first; only then is the save changed.
 if(!store(P.next,idOf(b))){L('career_restore_fail',b.sum);return 'fail';}
 KEYS.forEach(k=>{if(b.d[k]!==undefined)save[k]=cp(b.d[k]);else if(k!=='career')delete save[k];});
 save.careerFrom=idOf(b);try{_SK=null;}catch(e){}/* the skill cache switchSlot() clears */
 L('career_restore',Object.assign({from:b.at,swapped:P.cur?1:0,dropped:P.dropped.length},b.sum));persist();return 'ok';}
// ----- the sheet -----
function sheet(o){const old=document.getElementById('carSheet');if(old)old.remove();const d=document.createElement('div');d.id='carSheet';
 d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','carSheetH');
 d.innerHTML=`<div class="cs-card"><h2 id="carSheetH">${o.title}</h2>${o.body}<div class="cs-acts">${o.acts.map((x,i)=>`<button type="button" class="cs-b ${x.k||''}" data-i="${i}">${x.t}</button>`).join('')}</div></div>`;
 const close=()=>{d.remove();document.removeEventListener('keydown',esc,true);};const esc=e=>{if(e.key==='Escape'){e.preventDefault();close();if(o.onEsc)o.onEsc();}};
 d.onclick=e=>{if(e.target===d){close();if(o.onEsc)o.onEsc();return;}const b=e.target.closest('[data-i]');if(!b)return;const x=o.acts[+b.dataset.i];close();if(x.go)x.go(b);};
 document.addEventListener('keydown',esc,true);document.body.appendChild(d);try{d.querySelector('.cs-b').focus();}catch(e){}return d;}
const css=document.createElement('style');css.textContent=`#carSheet{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;justify-content:center;background:rgba(6,8,9,.66);padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px))}
#carSheet .cs-card{width:100%;max-width:420px;background:#15191b;border:1px solid #343a3e;border-radius:16px;padding:20px 18px 16px;color:#EDECE5;font:400 15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.5)}
#carSheet h2{margin:0 0 10px;font:800 24px/1.1 "Barlow Condensed",system-ui,sans-serif;letter-spacing:.02em;text-transform:uppercase}
#carSheet p{margin:0 0 10px;color:#B9BDB6}#carSheet .cs-cur{display:block;margin:2px 0 12px;padding:10px 12px;border-radius:10px;background:#1e2427;border:1px solid #343a3e;color:#EDECE5;font-weight:700}
#carSheet .cs-acts{display:flex;flex-direction:column;gap:8px;margin-top:14px}#carSheet .cs-b{min-height:48px;border-radius:12px;border:1px solid #45514D;background:transparent;color:#EDECE5;font:800 16px/1 "Barlow Condensed",system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
#carSheet .cs-b:focus{outline:none}#carSheet .cs-b:focus-visible{outline:2px solid #EDECE5;outline-offset:2px}#carSheet .cs-b.pri{background:#EDECE5;color:#111517;border-color:#EDECE5}#carSheet .cs-b.bad{border-color:#e5484d;color:#ff8a8d}
#carSheet .cs-row{display:flex;align-items:center;gap:10px;margin:0 0 8px;padding:10px 12px;border-radius:10px;background:#1e2427;border:1px solid #343a3e}#carSheet .cs-row span{flex:1;min-width:0}#carSheet .cs-row small{display:block;margin-top:2px;color:#8d948f;font-size:12px}
#carSheet .cs-row .cs-b{min-height:40px;padding:0 14px;flex:none}
#btnRestoreCareer{display:block;margin:10px auto 0;background:none;border:0;color:#B9BDB6;font:600 14px/1.2 system-ui,-apple-system,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer;min-height:44px;padding:0 12px}`;
document.head.appendChild(css);
// ----- "Start a new career": ask first when there's a career worth keeping -----
const nb=$('btnNewCareer');if(nb){const go=nb.onclick;nb.onclick=function(e){const c=career();
 if(!c||!played(c)||(save.slot||'career')!=='career')return go&&go.call(this,e);
 L('career_new_ask',sumOf(c));
 sheet({title:'Start a new career?',body:`<p>This replaces your career:</p><b class="cs-cur">${line(sumOf(c))}</b><p>We’ll save it first, so you can bring it back later from this screen.</p>`,
  acts:[{t:'Keep my career',k:'pri',go:()=>L('career_new_keep',{})},{t:'Start over',k:'bad',go:()=>{L('career_new_yes',{});go&&go.call(nb,e);}}],onEsc:()=>L('career_new_keep',{esc:1})});};}
// ----- "Bring back a previous career" on the title screen -----
const rb=document.createElement('button');rb.type='button';rb.id='btnRestoreCareer';rb.textContent='Bring back a previous career';rb.hidden=true;
if(nb&&nb.parentNode)nb.parentNode.insertBefore(rb,nb.nextSibling);
function showRestore(){const a=shown();if(!a.length){rb.hidden=true;return;}const c=career();const cur=c&&!c.run?c:null;
 const tn=m=>TIERS[m.tier]?TIERS[m.tier].n:'Tier '+(m.tier+1);
 sheet({title:'Bring back a career',body:`<p>Saved when you started a new one. Bringing one back ${cur&&played(cur)?`swaps it with your current career (<b>${line(sumOf(cur))}</b>), which goes into this list`:(cur?`replaces your current career (<b>${line(sumOf(cur))}</b>). It hasn’t been played yet, so it isn’t kept`:'makes it your career')}.</p>`+
  a.map(x=>{const m=x.sum||sumOf(x.d.career);return `<div class="cs-row"><span><b>${tn(m)} · ${m.w}–${m.l}</b><small>Level ${m.lv} · ${money(m.bank)} · saved ${when(x.at)}</small></span><button type="button" class="cs-b pri" data-r="${idOf(x)}">Bring back</button></div>`;}).join(''),
  acts:[{t:'Cancel'}]});
 const d=document.getElementById('carSheet');d.querySelectorAll('[data-r]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();const id=b.dataset.r;let P=null;try{P=plan(id);}catch(e){}
  const go=()=>{const r=restore(id);if(r==='ok'){try{flash('Career back','',line(sumOf(save.career)));}catch(e){}showTitle();}else if(r==='fail')sheet({title:'Nothing changed',body:'<p>We couldn’t save your current career on this phone first (it may be out of space), so we didn’t swap them.</p>',acts:[{t:'OK',k:'pri'}]});};
  d.remove();
  // the list holds three: say which one makes room before anything changes
  if(P&&P.dropped.length){const m=P.dropped[0].sum||sumOf(P.dropped[0].d.career);sheet({title:'Make room?',body:`<p>We keep three backups. Bringing this one back adds your current career to the list, so the oldest one goes:</p><b class="cs-cur">${tn(m)} · ${m.w}–${m.l} · Level ${m.lv} · saved ${when(P.dropped[0].at)}</b>`,acts:[{t:'Bring it back',k:'pri',go},{t:'Cancel'}]});}
  else go();});}
rb.onclick=()=>{try{audioInit();}catch(e){}showRestore();};
const _st=showTitle;showTitle=function(){const r=_st.apply(this,arguments);try{rb.hidden=!shown().length||!!window.__noGL;}catch(e){}return r;};
window.TOPS_CAREER_BAK={list,shown,backup,restore,plan,played,_line:line};
})();
</script>
