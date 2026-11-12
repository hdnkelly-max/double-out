<script>
/* ===== v0.51: version tag on the title, menus follow your look ===== */
window.TOPS_VER='3.22';
(function(){
const _st=showTitle;showTitle=function(){const r=_st.apply(this,arguments);try{let el=$('tlVer');if(!el){el=document.createElement('p');el.id='tlVer';el.className='tl-ver';const t=$('title');const n=$('tlAuth');(n&&n.parentNode||t).appendChild(el);}el.textContent='TOPS v'+window.TOPS_VER+' · Season 1'+(window.TOPS_DG_ERR?' · dm: '+window.TOPS_DG_ERR:'');}catch(e){}return r;};
let lt=null;
function refreshLook(){try{const c=career();const hub=$('hub');if(hub&&!hub.hidden){$('hubPt').innerHTML=portraitImg(save.look,save.name,c?c.tier:0,'md');if(typeof renderPlay==='function')renderPlay();if(typeof renderPlayerTop==='function')renderPlayerTop();}const tc=$('tcPt');if(tc&&c)tc.innerHTML=portraitImg(save.look,save.name,c.tier||0);}catch(e){}}
const _spl=V.setPlayerLook;V.setPlayerLook=function(){const r=_spl.apply(this,arguments);clearTimeout(lt);lt=setTimeout(refreshLook,900);return r;};
const _sh=showHub;showHub=function(){const r=_sh.apply(this,arguments);try{const c=career();$('hubPt').innerHTML=portraitImg(save.look,save.name,c?c.tier:0,'md');}catch(e){}return r;};
})();
</script>
<style id="v051-css">.tl-ver{margin:8px 0 0;font:600 11px Manrope,sans-serif;letter-spacing:.08em;color:#9AA7A5;opacity:.8}</style>
window.TOPS_MENU_ART=[0,1,2,3];
