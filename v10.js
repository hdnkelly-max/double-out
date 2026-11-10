<style id="v10-cards">
/* ===== v1.48 logo everywhere ===== */
.wm .wm-img,.hx-wm .wm-img{height:1.05em;width:auto;display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}
.wm{display:inline-flex!important;align-items:center}
.hx-wm .wm-img{height:28px}
.wm .wm-img{height:22px}
/* ===== v1.46 online back button below the iPhone status bar ===== */
#friends .mp-head{padding-top:max(12px,calc(env(safe-area-inset-top,0px) + 6px))!important}
#friends #btnFriendsBack{position:relative;z-index:5;min-height:44px;min-width:72px}
/* ===== v1.40 store cards ===== */
#hub .bopt .t{font-size:clamp(17px,4.6vw,21px)!important;line-height:1.02!important}
@media (max-width:480px){#hub .bopt .t{font-size:19px!important}#hub .bopt{grid-template-columns:96px 1fr!important;row-gap:6px!important}#hub .bopt .price{grid-column:2!important;justify-self:start!important;text-align:left!important}#hub .bopt .price.own{display:none!important}}
/* ===== v1.37 multiplayer review fixes ===== */
#onLobby.on-lobby{border-left-color:#34423d!important}
.onp.v2.me{box-shadow:inset 3px 0 0 #C6F36B!important;border-left-color:transparent!important}
.onp.v2 .onp-r.ok{background:rgba(198,243,107,.14)!important;color:#C6F36B!important;border-color:rgba(198,243,107,.4)!important;border-radius:999px!important}
.onp.v2 .onp-r.wait{color:#7f8b86!important;border-color:#34423d!important;border-radius:999px!important}
.onp.v2 .onp-r.host{border-radius:999px!important}
.mpr-row b.lead{color:#C6F36B!important}
.gn-t tr.me td:first-child{box-shadow:inset 3px 0 0 #C6F36B}
.mpr:not(.gn) .label{margin-top:6px}
#cupBox .tie{min-height:0}#cupBox .tie span{padding:9px 10px}
#cupBox .tie span.w{color:#C6F36B}#cupBox .tie span.l{color:#8e9a94}
#cupBox .cup-act .end{border:0!important;text-decoration:underline;text-underline-offset:3px;font:600 13px Manrope,sans-serif!important;letter-spacing:0!important;text-transform:none!important;color:#7f8b86!important}
#cupBox .cup-prog{font:600 11px/1 Manrope,sans-serif;color:#aab6af;margin:-4px 0 10px}
#liveCam{border:0!important;border-bottom:2px solid #C6F36B!important;border-radius:6px!important;background:rgba(16,25,26,.9)!important;height:32px;box-sizing:border-box}
#liveCam span{font:800 15px/1 'Barlow Condensed',sans-serif!important;letter-spacing:.04em!important;text-transform:uppercase!important;color:#f0f2ea!important}
#liveCam b{font-size:11px!important}
body.spectating #paLabel{opacity:.0}
/* ===== v1.35 menu tile icons ===== */
#title .mm-ic.svg{color:#C6F36B;display:inline-flex;width:34px;height:34px;align-items:center;justify-content:center;border-radius:9px;background:rgba(198,243,107,.09);font-size:0}
#title .mm-ic.svg svg{width:22px;height:22px}
#title #mmMate,#title #mmRun,#title #mmThrow{justify-content:flex-start!important}#title #mmMate .mm-ic,#title #mmRun .mm-ic,#title #mmThrow .mm-ic{margin-bottom:10px}
/* ===== v1.34 doubles strip ===== */
#mpStrip .ms.tm0{box-shadow:inset 0 3px 0 #C6F36B}
#mpStrip .ms.tm1{box-shadow:inset 0 3px 0 #4CA3E0}
#mpStrip .tmk{font:800 9px/1 Manrope,sans-serif;font-style:normal;letter-spacing:.12em;text-transform:uppercase;padding:2px 5px;border-radius:4px;margin-right:5px;vertical-align:1px}
#mpStrip .tm0 .tmk{background:rgba(198,243,107,.16);color:#C6F36B}#mpStrip .tm1 .tmk{background:rgba(76,163,224,.16);color:#7fc0ee}
/* ===== v1.30 kit preview ===== */
#hub .kit img#kitImg{aspect-ratio:768/215!important;object-fit:cover!important;border-radius:10px;background:radial-gradient(ellipse at 55% 50%,rgba(48,66,59,.55),rgba(20,28,29,0) 70%),#141c1d!important}
/* ===== v1.29 spare night rows ===== */
#hub .hx-acts .wk{position:relative;min-height:64px;padding-right:30px!important}
#hub .hx-acts .wk small{display:block!important;font:500 12px/1.35 Manrope,system-ui,sans-serif!important;color:#aab6af!important;margin-top:4px;text-transform:none;letter-spacing:0}
#hub .hx-acts .wk::after{content:'';position:absolute;right:8px;top:50%;width:9px;height:9px;border-right:2px solid #7d8983;border-top:2px solid #7d8983;transform:translateY(-50%) rotate(45deg)}
#hub .hx-acts .wk:not(:disabled):hover::after{border-color:#C6F36B}
#hub #spareAvail{border-color:rgba(198,243,107,.55)!important;color:#C6F36B!important}
/* ===== v1.29 player tab ===== */
#plStats .stat.ovrt b{display:flex;flex-direction:column;gap:3px;line-height:1}
#plStats .stat.ovrt b small{font:700 12px/1.1 Manrope,system-ui,sans-serif;color:#C6F36B;letter-spacing:.02em;text-transform:none}
#plStats.fresh .stat.nil{display:none}
#plStats .stat.pl-fresh{grid-column:1/-1;background:linear-gradient(135deg,rgba(198,243,107,.08),rgba(198,243,107,0) 60%);border:1px dashed rgba(198,243,107,.35)!important}
#plStats .stat.pl-fresh b{font:800 18px/1.1 'Barlow Condensed',sans-serif!important;font-size:18px!important;text-transform:uppercase;color:#f0f2ea;order:-1}
#plStats .stat.pl-fresh{padding:14px 16px!important;min-height:0!important}#plStats .stat.pl-fresh span{font-size:12.5px!important;font:500 12.5px/1.4 Manrope,system-ui,sans-serif;text-transform:none;letter-spacing:0;color:#aab6af;margin-top:4px}
#plStats .stat.pl-fresh{display:flex;flex-direction:column}
/* ===== v1.27 games night table ===== */
.mpr.gn{margin-bottom:14px;max-width:100%;overflow:hidden}
.gn-t{display:table!important;table-layout:fixed}.gn-t thead{display:table-header-group!important}.gn-t tbody{display:table-row-group!important}.gn-t tr{display:table-row!important;grid-template-columns:none!important}.gn-t th,.gn-t td{display:table-cell!important}
.gn-t th:nth-child(1){width:20px}.gn-t th:nth-child(3),.gn-t th:nth-child(4){width:26px}.gn-t th:nth-child(5){width:44px}.gn-t th:nth-child(6){width:34px}.gn-t th:nth-child(7){width:54px}
.gn-t{width:100%;border-collapse:collapse;font:500 13px/1.2 Manrope,system-ui,sans-serif;color:#d9dcd6;font-variant-numeric:tabular-nums}
.gn-t th{font:700 10px/1 Manrope,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#7d8983;text-align:center;padding:6px 4px;border-bottom:1px solid #2a3532}
.gn-t th:nth-child(2),.gn-t td:nth-child(2){text-align:left}
.gn-t td{text-align:center;padding:9px 4px;border-bottom:1px solid rgba(255,255,255,.05)}
.gn-t td:first-child{color:#7d8983;width:18px}
.gn-t td:nth-child(2) b{font-weight:800;color:#f3efe6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;max-width:9.5em;vertical-align:bottom}
.gn-t tr.top td:first-child{color:#C6F36B;font-weight:800}.gn-t tr.top td:nth-child(6) b{color:#C6F36B}
.gn-t tr.me{background:rgba(198,243,107,.06)}
.gn-f{white-space:nowrap}.gn-f i{display:inline-block;width:7px;height:7px;border-radius:50%;margin:0 1.5px;background:#C6F36B}.gn-f i.l{background:#4a5551}
.gn-n{display:block;margin-top:6px;color:#7d8983;font-size:11px}
@media (max-width:360px){.gn-t .gn-f{display:none}}
/* ===== v1.25 lobby player cards ===== */
.onp.v2{display:flex;align-items:center;gap:12px;justify-content:flex-start}
.onp.v2 .onp-n{flex:1;min-width:0}.onp.v2 .onp-n small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.onp-av{position:relative;flex:0 0 42px;height:42px;border-radius:50%;display:grid;place-items:center;font:800 16px/1 var(--display,'Barlow Condensed',sans-serif);font-style:normal;color:#fff;background:linear-gradient(145deg,hsl(var(--h) 45% 38%),hsl(var(--h) 50% 22%));box-shadow:inset 0 0 0 2px rgba(255,255,255,.12)}
.onp-av em{position:absolute;right:-3px;bottom:-3px;min-width:17px;height:17px;border-radius:9px;background:#0d1014;border:1px solid rgba(255,255,255,.18);font:700 10px/15px system-ui,sans-serif;font-style:normal;text-align:center;color:#c9ced4}
.onp.v2.rdy .onp-av{box-shadow:inset 0 0 0 2px #C6F36B,0 0 12px rgba(198,243,107,.25)}
.onp.v2.me{background:linear-gradient(90deg,rgba(198,243,107,.07),transparent 60%),var(--p-raised,#151a20)}
.onp-wk{color:#9fb27a!important;font-size:11px}.onp-wk.no{color:#7d858e!important;font-style:italic}
/* ===== v1.23 result card stat strip ===== */
.c3rw-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:14px 0 4px}
.c3rw-stats>div{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px 6px 10px;text-align:center;opacity:0;transform:translateY(6px);animation:c3st .35s ease-out forwards}
.c3rw-stats>div:nth-child(2){animation-delay:.08s}.c3rw-stats>div:nth-child(3){animation-delay:.16s}
.c3rw-stats b{display:block;font:800 25px/1 var(--display,'Barlow Condensed',sans-serif);color:#f3efe6;font-variant-numeric:tabular-nums}
.c3rw-stats small{display:block;margin-top:5px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9aa3ad}
@keyframes c3st{to{opacity:1;transform:none}}
.c3rw-cash.none{display:none!important}
@media (prefers-reduced-motion:reduce){.c3rw-stats>div{animation:none;opacity:1;transform:none}}
/* ===== v1.12 card pass: card faces, deal/pick, hand fan, slam, impacts ===== */
:root{--rC:#8b949e;--rU:#4CA3E0;--rR:#E3B341;--rL:#C6F36B;--tOff:#E8382C;--tDef:#4CA3E0;--tSelf:#5CC27A;--tChaos:#D9AD52}
.cd-card,.ct-card{--tc:#ADB2BA;--rc:var(--rC);position:relative;overflow:hidden;isolation:isolate}
.cd-card.ty-off,.ct-card.ty-off{--tc:var(--tOff)}.cd-card.ty-def,.ct-card.ty-def{--tc:var(--tDef)}.cd-card.ty-self,.ct-card.ty-self{--tc:var(--tSelf)}.cd-card.ty-chaos,.ct-card.ty-chaos{--tc:var(--tChaos)}
.cd-card.r-U,.ct-card.r-U{--rc:var(--rU)}.cd-card.r-R,.ct-card.r-R{--rc:var(--rR)}.cd-card.r-L,.ct-card.r-L{--rc:var(--rL)}
/* face */
#cardDraft .cd-card{background:
 radial-gradient(120% 80% at 50% 0%,color-mix(in srgb,var(--tc) 26%,transparent),transparent 60%),
 repeating-linear-gradient(135deg,rgba(255,255,255,.025) 0 2px,transparent 2px 9px),
 linear-gradient(180deg,#1b2128,#0f1317);
 border:2px solid var(--rc);border-top-width:2px;border-radius:14px;box-shadow:0 10px 28px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.05),0 0 0 0 var(--rc);
 transition:transform .18s cubic-bezier(.2,.9,.3,1.3),box-shadow .2s}
#cardDraft .cd-card::before{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:var(--tc);opacity:.95}
#cardDraft .cd-card .cd-ico{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;font-size:30px;background:radial-gradient(circle at 50% 40%,color-mix(in srgb,var(--tc) 45%,#000),#0a0d10 70%);box-shadow:0 0 0 2px color-mix(in srgb,var(--rc) 70%,transparent),0 0 22px color-mix(in srgb,var(--tc) 55%,transparent);flex:none}
#cardDraft .cd-card b{font:900 22px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.02em;color:#F2EFE6}
#cardDraft .cd-card em{font:800 10.5px/1 Manrope,sans-serif;letter-spacing:.12em;color:var(--rc)}
#cardDraft .cd-card .cd-fx{font:600 13.5px/1.38 Manrope,sans-serif;color:#E2DED3}
#cardDraft .cd-card .cd-fl{display:block;width:100%;font:italic 500 12px/1.3 Manrope,sans-serif;color:#9aa3a6;margin-top:2px}
/* foil on rare and legendary */
#cardDraft .cd-card.r-R::after,#cardDraft .cd-card.r-L::after,.ct-card.r-R::after,.ct-card.r-L::after{content:"";position:absolute;inset:-40%;z-index:-1;pointer-events:none;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.16) 45%,color-mix(in srgb,var(--rc) 45%,transparent) 50%,rgba(255,255,255,.12) 55%,transparent 65%);animation:cdFoil 3.2s ease-in-out infinite}
#cardDraft .cd-card.r-L{box-shadow:0 10px 28px rgba(0,0,0,.55),0 0 26px color-mix(in srgb,var(--rL) 45%,transparent)}
@keyframes cdFoil{0%{transform:translateX(-35%)}60%,100%{transform:translateX(35%)}}
/* deal in: flip from the back, staggered */
#cardDraft.cd-big .cd-row{perspective:900px}
#cardDraft .cd-card.cd-deal{animation:cdDeal .55s cubic-bezier(.2,.9,.25,1.15) both}
@keyframes cdDeal{0%{opacity:0;transform:translateY(60px) rotateY(85deg) rotateZ(-6deg) scale(.85)}60%{opacity:1}100%{opacity:1;transform:none}}
#cardDraft .cd-card:hover,#cardDraft .cd-card:focus-visible{transform:translateY(-4px) scale(1.02);box-shadow:0 16px 34px rgba(0,0,0,.6),0 0 0 2px var(--rc),0 0 24px color-mix(in srgb,var(--rc) 40%,transparent)}
#cardDraft .cd-card.cd-chosen{animation:cdChosen .45s cubic-bezier(.3,1.4,.4,1) forwards;z-index:2}
@keyframes cdChosen{0%{transform:scale(1)}35%{transform:scale(1.1);box-shadow:0 0 0 3px var(--rc),0 0 50px var(--rc)}100%{transform:translateY(160px) scale(.4);opacity:0}}
#cardDraft .cd-card.cd-gone{animation:cdGone .35s ease-in forwards}
@keyframes cdGone{to{transform:translateY(40px) scale(.9);opacity:0;filter:blur(2px)}}
#cardDraft.cd-big .cd-h b{background:linear-gradient(90deg,#F2EFE6,#C6F36B);-webkit-background-clip:text;background-clip:text;color:transparent}
/* hand: a fanned set of mini cards */
#cardTray{gap:0!important}
.ct-card{background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--tc) 30%,transparent),transparent 65%),linear-gradient(180deg,#1b2128,#0f1317)!important;border:2px solid var(--rc)!important;border-radius:10px!important;box-shadow:0 8px 18px rgba(0,0,0,.5);transition:transform .18s cubic-bezier(.2,.9,.3,1.3),box-shadow .2s;margin:0 -4px}
.ct-card:nth-child(1){transform:rotate(-5deg) translateY(2px)}.ct-card:nth-child(2){transform:rotate(5deg) translateY(2px)}.ct-card:only-child{transform:none}
.ct-card span{filter:drop-shadow(0 0 8px color-mix(in srgb,var(--tc) 70%,transparent))}
.ct-card b{font:900 12px/1 "Barlow Condensed",sans-serif!important;text-transform:uppercase;letter-spacing:.03em}
.ct-card.sel{transform:translateY(-10px) scale(1.08)!important;box-shadow:0 0 0 2px var(--rc),0 0 26px color-mix(in srgb,var(--rc) 55%,transparent),0 14px 26px rgba(0,0,0,.6)!important;z-index:2}
body.ct-ready .ct-card{animation:ctReady 1.8s ease-in-out infinite}
@keyframes ctReady{50%{box-shadow:0 0 0 2px var(--rc),0 0 18px color-mix(in srgb,var(--rc) 45%,transparent),0 8px 18px rgba(0,0,0,.5)}}
/* slam: big card face when a card is played */
#cardSlam{position:fixed;inset:0;z-index:95;pointer-events:none;display:grid;place-items:center}
#cardSlam .cs{--tc:#ADB2BA;--rc:var(--rC);width:min(300px,72vw);border-radius:18px;padding:18px 18px 16px;background:radial-gradient(120% 70% at 50% 0%,color-mix(in srgb,var(--tc) 32%,transparent),transparent 62%),linear-gradient(180deg,#1d242b,#0e1216);border:3px solid var(--rc);box-shadow:0 30px 60px rgba(0,0,0,.65),0 0 60px color-mix(in srgb,var(--tc) 45%,transparent);text-align:center;color:#F2EFE6;animation:csIn .62s cubic-bezier(.2,1.5,.35,1) both;position:relative;overflow:hidden}
#cardSlam .cs.out{animation:csOut .35s ease-in forwards}
#cardSlam .cs .i{font-size:64px;line-height:1;filter:drop-shadow(0 0 18px color-mix(in srgb,var(--tc) 80%,transparent))}
#cardSlam .cs b{display:block;font:900 34px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:10px 0 6px}
#cardSlam .cs .w{font:800 12px/1.2 Manrope,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--rc)}
#cardSlam .cs .f{font:italic 500 13px/1.35 Manrope,sans-serif;color:#b9c0c2;margin-top:8px}
#cardSlam .cs.r-R::after,#cardSlam .cs.r-L::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 38%,rgba(255,255,255,.22) 48%,transparent 58%);animation:cdFoil 1.4s ease-out 1}
#cardSlam .ring{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:4px solid var(--rc,#C6F36B);animation:csRing .7s ease-out forwards;opacity:.9}
@keyframes csIn{0%{transform:translateY(-70vh) rotate(-14deg) scale(1.4);opacity:0}55%{transform:translateY(8px) rotate(2deg) scale(.96);opacity:1}75%{transform:translateY(-4px) rotate(-1deg)}100%{transform:none}}
@keyframes csOut{to{transform:translateY(30px) scale(.7) rotate(4deg);opacity:0}}
@keyframes csRing{to{transform:scale(14);opacity:0;border-width:1px}}
/* impacts */
body.fx-shake #scene,body.fx-shake .lk-board,body.fx-shake canvas{animation:fxShake .55s cubic-bezier(.36,.07,.19,.97) both}
@keyframes fxShake{10%,90%{transform:translate(-2px,1px)}20%,80%{transform:translate(5px,-2px)}30%,50%,70%{transform:translate(-9px,3px) rotate(-.4deg)}40%,60%{transform:translate(9px,-3px) rotate(.4deg)}}
body.fx-jolt canvas{animation:fxJolt .45s cubic-bezier(.2,.8,.3,1) both}
@keyframes fxJolt{0%{transform:translateX(0)}15%{transform:translateX(-22px) rotate(-1deg)}45%{transform:translateX(10px)}70%{transform:translateX(-4px)}100%{transform:none}}
#fxLayer{position:fixed;inset:0;z-index:90;pointer-events:none;overflow:hidden}
#fxLayer .wave{position:absolute;left:50%;bottom:-120px;width:240px;height:240px;margin-left:-120px;border-radius:50%;border:6px solid rgba(255,214,90,.8);animation:fxWave 1s ease-out forwards}
@keyframes fxWave{to{transform:scale(6);opacity:0;border-width:1px}}
#fxLayer .bubble{position:absolute;left:50%;top:18%;transform:translateX(-50%);max-width:82vw;background:#F2EFE6;color:#111;font:800 17px/1.25 Manrope,sans-serif;padding:14px 18px;border-radius:18px;box-shadow:0 16px 36px rgba(0,0,0,.5);animation:fxPop .45s cubic-bezier(.2,1.6,.4,1) both,fxFade .4s ease-in 2.2s forwards}
#fxLayer .bubble::after{content:"";position:absolute;left:30px;bottom:-12px;border:12px solid transparent;border-top-color:#F2EFE6;border-bottom:0}
@keyframes fxPop{0%{transform:translateX(-50%) scale(.3) rotate(-8deg);opacity:0}100%{transform:translateX(-50%) scale(1);opacity:1}}
@keyframes fxFade{to{opacity:0;transform:translateX(-50%) translateY(-10px)}}
#fxLayer .drip{position:absolute;top:-30px;width:16px;border-radius:0 0 10px 10px;background:linear-gradient(180deg,rgba(214,150,40,.0),rgba(226,160,50,.85));animation:fxDrip 1.8s cubic-bezier(.5,0,.8,.6) forwards}
@keyframes fxDrip{0%{height:0}100%{height:60vh;opacity:0}}
#fxLayer .slosh{position:absolute;left:-10%;right:-10%;bottom:-40px;height:120px;background:radial-gradient(60% 100% at 50% 0%,rgba(230,165,50,.75),rgba(230,165,50,0) 70%);animation:fxSlosh 1.1s ease-out forwards}
@keyframes fxSlosh{0%{transform:translateY(80px) skewX(-12deg)}40%{transform:translateY(0) skewX(10deg)}100%{transform:translateY(90px);opacity:0}}
#fxLayer .em{position:absolute;font-size:38px;animation:fxFloat 1.8s ease-out forwards}
@keyframes fxFloat{0%{transform:translateY(0) scale(.4);opacity:0}15%{opacity:1;transform:translateY(-20px) scale(1.1)}100%{transform:translateY(-55vh) rotate(var(--r,20deg)) scale(.9);opacity:0}}
#fxLayer .heat{position:absolute;inset:0;box-shadow:inset 0 0 120px 40px rgba(232,56,44,.55);animation:fxHeat 1.6s ease-in-out 2 forwards}
@keyframes fxHeat{50%{box-shadow:inset 0 0 180px 70px rgba(232,56,44,.75)}100%{opacity:0}}
#fxLayer .shutter{position:absolute;left:0;right:0;height:52%;background:#000;animation:fxShut .28s ease-in-out 2 alternate}
#fxLayer .shutter.t{top:0;transform-origin:top}#fxLayer .shutter.b{bottom:0;transform-origin:bottom}
@keyframes fxShut{from{transform:scaleY(0)}to{transform:scaleY(1)}}
#fxLayer .shield{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font:900 46px/1 "Barlow Condensed",sans-serif;color:#4CA3E0;text-shadow:0 0 24px rgba(76,163,224,.8);animation:fxPop2 .5s cubic-bezier(.2,1.6,.4,1) both,fxFade2 .4s ease-in 1.2s forwards}
@keyframes fxPop2{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
@keyframes fxFade2{to{opacity:0}}
#fxLayer .ripple{position:absolute;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:3px solid #fff;animation:csRing .6s ease-out forwards}

/* ===== v1.17 main menu redesign ===== */
#title.mm2 .tl{gap:14px;background:linear-gradient(90deg,rgba(4,7,9,.96) 0%,rgba(4,7,9,.88) 62%,rgba(4,7,9,.35) 88%,rgba(4,7,9,0) 100%)}
#title.mm2 .wm-sub{font:800 11px/1 Manrope,sans-serif;letter-spacing:.32em;color:#C6F36B;opacity:.9;margin-top:8px}
#title.mm2 .tl-blurb{font:500 15px/1.45 Manrope,sans-serif;color:#c9cfce;max-width:400px;margin:8px 0 0}
#title.mm2 .tcard{display:flex;align-items:center;gap:12px;background:linear-gradient(180deg,rgba(237,236,229,.06),rgba(237,236,229,.02));border:1px solid rgba(237,236,229,.12);border-radius:14px;padding:10px 12px}
#title.mm2 .tcard #tcPt img,#title.mm2 .tcard #tcPt canvas{width:44px;height:44px;border-radius:10px;object-fit:cover}
#title.mm2 .tcard b{font:900 18px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.03em}
#title.mm2 .tcard small{font:600 12px/1.3 Manrope,sans-serif;color:#9fa8a8}
#title.mm2 .tcard em{margin-left:auto;font:900 22px/1 "Barlow Condensed",sans-serif;color:#E3B341;font-style:normal}
#title.mm2 #btnContinue,#title.mm2 #btnNewCareer{position:relative;border-radius:14px;min-height:76px;font:900 26px/1 "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 14px 30px rgba(198,243,107,.18),inset 0 -3px 0 rgba(0,0,0,.18);overflow:hidden}
#title.mm2 #btnContinue::after,#title.mm2 #btnNewCareer::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%);animation:mmSheen 4.5s ease-in-out infinite}
@keyframes mmSheen{0%,70%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
#title.mm2 #btnContinue small{display:none}
#title.mm2 .mm-next{display:block;font:700 12.5px/1.3 Manrope,sans-serif;letter-spacing:.02em;text-transform:none;color:rgba(16,25,26,.75);margin-top:6px}
#title.mm2 .mm-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#title.mm2 .mm-tiles>button{position:relative;display:flex;flex-direction:column;justify-content:flex-start;gap:4px;text-align:left;min-height:112px;padding:12px;border-radius:14px;border:1px solid rgba(237,236,229,.14);background:linear-gradient(180deg,rgba(237,236,229,.07),rgba(237,236,229,.02));color:#EDECE5;cursor:pointer;overflow:hidden;transition:transform .15s,border-color .15s,background .15s}
#title.mm2 .mm-tiles>button:hover{transform:translateY(-2px);border-color:#C6F36B;background:linear-gradient(180deg,rgba(198,243,107,.12),rgba(198,243,107,.03))}
#title.mm2 .mm-tiles>button b{font:900 17px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.04em}
#title.mm2 .mm-tiles>button small{font:600 11.5px/1.3 Manrope,sans-serif;color:#9fa8a8}
#title.mm2 .mm-tiles .mm-ic{font-size:22px;opacity:.95;margin-bottom:auto}
#title.mm2 .mm-tiles .mm-live{position:absolute;top:12px;right:10px;display:flex;align-items:center;gap:5px;font:800 10px/1 Manrope,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#C6F36B}
#title.mm2 .mm-tiles .mm-live i{width:7px;height:7px;border-radius:50%;background:#C6F36B;box-shadow:0 0 8px #C6F36B;animation:mmPulse 1.6s infinite}
@keyframes mmPulse{50%{opacity:.35}}
#title.mm2 .tl-run,#title.mm2 .tl-row{display:none!important}
#title.mm2 #btnNewRun{border-radius:12px}
#title.mm2 .mm-links{display:flex;flex-wrap:wrap;gap:6px 16px}
#title.mm2 .mm-links .tl-link{margin:0}
#title.mm2 .tl-venue b{font:900 15px/1 "Barlow Condensed",sans-serif;letter-spacing:.3em}
@media (max-width:700px){#title.mm2 .tl-bg{object-fit:cover;object-position:80% 30%!important}#title.mm2 .mm-tiles>button{min-height:88px;padding:10px}#title.mm2 .mm-tiles>button b{font-size:15px}#title.mm2 #btnContinue,#title.mm2 #btnNewCareer{min-height:66px;font-size:22px}#title.mm2 .tl-blurb{display:none}}

/* ===== v1.18 menu polish from ChatGPT review (7.2 -> fixes) ===== */
#title.mm2 .tl{justify-content:center;gap:0;width:min(100%,560px)}
#title.mm2 .hero{margin-bottom:20px}
#title.mm2 .wm-sub{margin-top:14px}
#title.mm2 .tl-stack{gap:0;margin-top:0}
#title.mm2 .tcard{min-height:64px;background:#15201F;border:1px solid #34423D;border-radius:10px;padding:10px 14px;margin-bottom:10px}
#title.mm2 .tcard b{font-size:16px}
#title.mm2 .tcard em{font-size:20px;color:#D8B56B}
#title.mm2 #btnContinue{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;padding:14px 52px 14px 18px;min-height:72px;font-size:24px;margin-bottom:8px;border-radius:12px}
#title.mm2 #btnContinue::before{content:"";position:absolute;right:20px;top:50%;width:12px;height:12px;border-right:3px solid #10191A;border-top:3px solid #10191A;transform:translateY(-50%) rotate(45deg)}
#title.mm2 #btnContinue .mm-next{font-size:12.5px;margin-top:6px;letter-spacing:0}
#title.mm2 #btnNewCareer:not(:only-of-type){}
#title.mm2 #btnContinue:not([hidden])~#btnNewCareer{min-height:48px;background:transparent;color:#EDECE5;border:1px solid #45514D;box-shadow:none;font:800 15px/1 "Barlow Condensed",sans-serif;letter-spacing:.12em}
#title.mm2 #btnContinue:not([hidden])~#btnNewCareer::after{display:none}
#title.mm2 #btnNewRun{display:none!important}
#title.mm2 .mm-tiles{margin-top:20px}
#title.mm2 .mm-tiles>button{background:#172220;border-color:#35443F;border-radius:10px}
#title.mm2 .mm-tiles>button b{font-size:15px}#title.mm2 .mm-tiles>button small{font-size:11.5px;font-weight:500;min-height:2.6em}
#title.mm2 .mm-tiles .mm-ic{font-size:24px}
#title.mm2 .mm-links{margin-top:16px;gap:6px 18px}
#title.mm2 .mm-links .tl-link{font:600 12px/1.3 Manrope,sans-serif;color:#9aa6a1;text-decoration:none;padding:6px 0}
#title.mm2 .mm-links .tl-link:hover{color:#C6F36B}
#title.mm2 .tl-note{font:500 11px/1.4 Manrope,sans-serif;color:#6f7b76;margin-top:14px}
#title.mm2 .tl-note a,#title.mm2 .tl-note button{color:#9aa6a1}
#title.mm2 .tl-top button{min-height:34px;padding:0 12px;border-radius:9px;background:rgba(20,32,29,.85);border:1px solid rgba(237,236,229,.22);font:800 11.5px/1 Manrope,sans-serif;letter-spacing:.08em;color:#EDECE5;backdrop-filter:blur(6px)}
#title.mm2 .tl-top button[aria-pressed="false"]{color:#7d8983}
#title.mm2 .tl-venue{display:block}#title.mm2 .tl-venue b{font-size:13px;font-weight:700}#title.mm2 .tl-venue small{font-size:11px}
@media (min-width:1700px){#title.mm2 .tl{zoom:1.22;width:560px}}
@media (min-width:2200px){#title.mm2 .tl{zoom:1.42}}
@media (max-width:700px){#title.mm2 .tl{width:100%;justify-content:flex-end;padding:20px 20px max(24px,env(safe-area-inset-bottom,0px))}#title.mm2 .wm-img img{width:220px!important}#title.mm2 .tcard{min-height:56px}#title.mm2 #btnContinue{min-height:64px}#title.mm2 .mm-tiles>button{min-height:96px}#title.mm2 .tl-venue{display:none}}

/* ===== v1.19 Play Online: entry first, settings live in the lobby ===== */
#friends.mp-entry #mpRules,#friends.mp-entry .mp-sec:has(#mpPros),#friends.mp-entry .mp-sec:has(#mpSways){display:none!important}
#friends.mp-entry .mp-grid{grid-template-columns:minmax(0,460px) minmax(0,1fr)}
#friends .panel.mp{background:rgba(16,25,26,.96)!important;border-color:#2a3835!important;border-radius:14px;backdrop-filter:blur(8px)}
#friends .mp-h1{font:900 34px/1 "Barlow Condensed",sans-serif;letter-spacing:.02em}
#friends .mp-kick{color:#C6F36B!important;font:800 11px/1 Manrope,sans-serif;letter-spacing:.2em}
#friends .mp-sub{font:500 14px/1.4 Manrope,sans-serif;color:#b9c2c0}
#friends #btnOnHost{min-height:58px;border-radius:12px;font:900 22px/1 "Barlow Condensed",sans-serif;letter-spacing:.08em;box-shadow:0 12px 26px rgba(198,243,107,.16)}
#friends .mp-note{font:500 13px/1.45 Manrope,sans-serif;color:#9aa6a1}
#friends .mp-or{display:flex;align-items:center;gap:10px;margin:18px 0 10px;font:800 11px/1 Manrope,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#7d8983}
#friends .mp-or::before,#friends .mp-or::after{content:"";flex:1;height:1px;background:#2f3d3a}
#friends .on-join{display:flex;gap:8px}
#friends #onCodeIn{min-height:52px;font:700 18px/1 Manrope,sans-serif;letter-spacing:.3em;text-transform:uppercase;border-radius:10px;background:#0d1415;border:1px solid #34433F}
#friends #btnOnJoin{min-height:52px;min-width:96px;border-radius:10px;font:900 18px/1 "Barlow Condensed",sans-serif;letter-spacing:.1em;border:1px solid #C6F36B;color:#C6F36B}
#friends .on-name input{min-height:48px;border-radius:10px}
#friends .mp-sec,#friends .mp-rules{padding-top:6px}
#friends .mp-h2{font:900 21px/1 "Barlow Condensed",sans-serif;letter-spacing:.04em}
/* pro cards */
#friends .mpp{position:relative;border-radius:12px!important;background:#172220!important;border:1px solid #34433F!important;transition:transform .15s,border-color .15s}
#friends .mpp:hover{transform:translateY(-2px);border-color:#58706a!important}
#friends .mpp.on{border:2px solid #C6F36B!important;background:linear-gradient(180deg,rgba(198,243,107,.10),rgba(198,243,107,.02)),#172220!important;box-shadow:0 0 0 3px rgba(198,243,107,.10)}
#friends .mpp .mpp-sel{display:none}
#friends .mpp.on::after{content:"✓";position:absolute;top:10px;right:10px;width:22px;height:22px;border-radius:50%;background:#C6F36B;color:#10191A;font:900 13px/22px Manrope,sans-serif;text-align:center}
#friends .mpp-top b{font:900 18px/1 "Barlow Condensed",sans-serif!important}
#friends .mpp-line{font:500 12.5px/1.4 Manrope,sans-serif!important;color:#c9cfce}
/* lobby: room code panel */
#friends .on-code{font:900 34px/1 "Barlow Condensed",sans-serif;letter-spacing:.2em;color:#C6F36B}
#friends #btnOnStart,#friends #btnOnReady{min-height:58px;border-radius:12px;font:900 22px/1 "Barlow Condensed",sans-serif;letter-spacing:.08em}
@media (max-width:640px){
 #friends .panel.mp{border-radius:0!important}
 #friends.mp-entry .mp-grid{grid-template-columns:1fr}
 #friends .mp-h1{font-size:30px}
 #friends .mp-pros{display:flex!important;overflow-x:auto;gap:12px;scroll-snap-type:x mandatory;padding:4px 2px 10px;scrollbar-width:none}
 #friends .mp-pros::-webkit-scrollbar{display:none}
 #friends .mpp{flex:0 0 78%;scroll-snap-align:start}
 #friends .on-join{flex-direction:column}#friends #btnOnJoin{width:100%}
}
@media (prefers-reduced-motion:reduce){#cardDraft .cd-card,#cardSlam .cs,body.fx-shake canvas,body.fx-jolt canvas{animation:none!important}}
</style>
<script>
// ===== v1.12 card pass =====
(function(){
 const RN={C:'Common',U:'Uncommon',R:'Rare',L:'Legendary'},TN={off:'Offence',def:'Defence',self:'Self',chaos:'Chaos'};
 // ---- draft: flavour line, deal-in, pick animation ----
 const _cds3=cardDraftShow;cardDraftShow=function(round){const r=_cds3.apply(this,arguments);try{const host=$('cardDraft');const C=S.pub.cards;const opts=C.draft&&C.draft.opts||[];
   host.querySelectorAll('.cd-card').forEach((b,i)=>{const c=opts[+b.dataset.i];if(c&&!b.querySelector('.cd-fl'))b.insertAdjacentHTML('beforeend',`<span class="cd-fl">“${c.fl}”</span>`);b.classList.add('cd-deal');b.style.animationDelay=(i*.09)+'s';
    const orig=b.onclick;b.onclick=ev=>{if(b.dataset.go)return;b.dataset.go=1;b.classList.remove('cd-deal');b.classList.add('cd-chosen');host.querySelectorAll('.cd-card').forEach(o=>{if(o!==b){o.classList.remove('cd-deal');o.classList.add('cd-gone');}});try{sfxCard&&sfxCard();}catch(e){}setTimeout(()=>{try{orig&&orig.call(b,ev);}catch(e){}},420);};});
   try{sfxDeal();}catch(e){}}catch(e){console.warn('cd',e);}return r;};
 // ---- small synth sounds for dealing, picking and slamming ----
 function tone(f0,f1,dur,g,type,delay){try{if(!AU.ctx||!AU.on)return;const c=AU.ctx,o=c.createOscillator(),gg=c.createGain(),t=c.currentTime+(delay||0);o.type=type||'triangle';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);gg.gain.setValueAtTime(.0001,t);gg.gain.exponentialRampToValueAtTime(g,t+.01);gg.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gg);gg.connect(AU.master||c.destination);o.start(t);o.stop(t+dur+.02);}catch(e){}}
 function sfxDeal(){for(let i=0;i<3;i++){try{noiseBurst({dur:.05,freq:3000,q:1.2,gain:.18,type:'bandpass',delay:i*.09});}catch(e){}}}
 window.sfxCard=function(){tone(520,1040,.18,.12,'triangle');tone(780,1560,.22,.08,'sine',.06);};
 function sfxSlam(rare){try{noiseBurst({dur:.12,freq:160,q:.8,gain:.45,type:'lowpass'});}catch(e){}tone(140,60,.3,.35,'sine');if(rare){tone(660,1320,.4,.1,'triangle',.05);tone(990,1980,.5,.07,'sine',.12);}}
 // ---- hand: glow when you can play ----
 setInterval(()=>{try{const ok=!!(S&&S.pub&&S.pub.cards&&S.pub.cards.hand.length&&S.cur!==0&&!S.done);document.body.classList.toggle('ct-ready',ok);}catch(e){}},400);
 // ---- slam: the card face, who played it on whom ----
 let slamT=0;function slam(id,line,big){const c=CARD[id];if(!c)return;let el=$('cardSlam');if(!el){el=document.createElement('div');el.id='cardSlam';document.body.appendChild(el);}
  const tc={off:'var(--tOff)',def:'var(--tDef)',self:'var(--tSelf)',chaos:'var(--tChaos)'}[c.ty],rc={C:'var(--rC)',U:'var(--rU)',R:'var(--rR)',L:'var(--rL)'}[c.r];
  el.innerHTML=`<div class="cs r-${c.r}" style="--tc:${tc};--rc:${rc}"><div class="i">${c.ico}</div><b>${c.n}</b><div class="w">${line}</div><div class="f">“${c.fl}”</div></div><span class="ring" style="--rc:${rc}"></span>`;
  sfxSlam(c.r==='R'||c.r==='L');clearTimeout(slamT);slamT=setTimeout(()=>{const cs=el.querySelector('.cs');if(cs)cs.classList.add('out');setTimeout(()=>{el.innerHTML='';},360);},big?1700:1300);}
 window.TOPS_slam=slam;
 // ---- impacts ----
 function layer(){let l=$('fxLayer');if(!l){l=document.createElement('div');l.id='fxLayer';document.body.appendChild(l);}return l;}
 function add(html,ms){const l=layer();const d=document.createElement('div');d.innerHTML=html;const nodes=[...d.children];nodes.forEach(n=>l.appendChild(n));setTimeout(()=>nodes.forEach(n=>n.remove()),ms||2600);}
 function bodyFx(cls,ms){document.body.classList.remove(cls);void document.body.offsetWidth;document.body.classList.add(cls);setTimeout(()=>document.body.classList.remove(cls),ms);}
 function emojis(list,n){let h='';for(let i=0;i<n;i++){const e=list[i%list.length];h+=`<span class="em" style="left:${8+Math.random()*84}%;bottom:${-4+Math.random()*12}%;--r:${(Math.random()*60-30).toFixed(0)}deg;animation-delay:${(i*.08).toFixed(2)}s">${e}</span>`;}add(h,2600);}
 function impact(id,onTarget){const c=CARD[id];if(!c)return;
  switch(id){
   case 'horn':bodyFx('fx-shake',600);add('<div class="wave"></div><div class="wave" style="animation-delay:.15s"></div><div class="wave" style="animation-delay:.3s"></div>',1400);break;
   case 'bump':bodyFx('fx-jolt',500);add('<div class="slosh"></div>',1200);break;
   case 'heckle':add(`<div class="bubble">${c.fl.replace(/</g,'&lt;')}</div>`,2700);break;
   case 'juke':emojis(['🎵','🎶','🎸'],9);break;
   case 'flash':add('<div class="shutter t"></div><div class="shutter b"></div>',700);break;
   case 'wobble':bodyFx('fx-shake',600);break;
   case 'cooker':add('<div class="heat"></div>',3300);break;
   case 'nan':emojis(['👓'],4);break;
   case 'spill':{let h='';for(let i=0;i<9;i++)h+=`<div class="drip" style="left:${5+i*11+Math.random()*4}%;animation-delay:${(Math.random()*.4).toFixed(2)}s;width:${10+Math.random()*12}px"></div>`;add(h,2400);bodyFx('fx-jolt',450);break;}
   case 'tap':add(`<div class="ripple" style="left:70%;top:30%"></div><div class="ripple" style="left:70%;top:30%;animation-delay:.12s"></div>`,900);break;
   case 'orders':emojis(['🔔'],3);break;
   case 'double':case 'stick':emojis(['🍺','🧾','✌️'],7);break;
   case 'shout':emojis(['🍻','🍺','🍻'],12);break;
   case 'water':emojis(['💧'],8);break;
   case 'dd':emojis(['🚗'],3);break;
   case 'steady':case 'ice':case 'groove':case 'clear':case 'hot':emojis([c.ico],6);break;
   default:if(c.ico)emojis([c.ico],5);}}
 window.TOPS_impact=impact;
 // ---- Play Online: entry shows only name / create / join / mates; rules, pros and darts appear once you're in a room ----
 setInterval(()=>{try{const f=$('friends');if(!f||f.hidden)return;const lob=$('onLobby');f.classList.toggle('mp-entry',!!(lob&&lob.hidden));const n=$('mpOptsNote');}catch(e){}},300);

 // ---- main menu redesign: next-match line on the big button, three mode tiles, links in a row ----
 function mm(){const t=$('title');if(!t)return;t.classList.add('mm2');const st=t.querySelector('.tl-stack');if(!st)return;
  if(!$('mmTiles')){const tiles=document.createElement('div');tiles.className='mm-tiles';tiles.id='mmTiles';
   tiles.innerHTML=`<button type="button" id="mmMate"><span class="mm-ic svg"><svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h9l-1 17H5z"/><path d="M13 13h2.5a2.5 2.5 0 0 1 0 5H12.6"/><path d="M19 9h9l-1 17h-7z"/><path d="M4.6 14h8M19.6 14h8"/><path d="M15 4l1.5 2.5M17 3.5V6M19 4l-1.5 2.5"/></svg></span><span class="mm-live" id="mmLive" hidden><i></i><span></span></span><b>Play a mate</b><small>Live online · Games night</small></button><button type="button" id="mmRun"><span class="mm-ic svg"><svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="5" width="15" height="21" rx="2.5"/><path d="M7 9.5l-1.5.6a2 2 0 0 0-1.1 2.6l5 12.2"/><path d="M17.5 11.5l2.5 4-2.5 4-2.5-4z"/></svg></span><b>The Run</b><small>Three lives, draft a card each win</small></button><button type="button" id="mmThrow"><span class="mm-ic svg"><svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="14" cy="18" r="10"/><circle cx="14" cy="18" r="5.5"/><circle cx="14" cy="18" r="1.4" fill="currentColor"/><path d="M14 18L27 5"/><path d="M23.5 4.5l3.5 1-1 3.5"/><path d="M27 5l1.8-1.8"/></svg></span><b>Have a throw</b><small>Practice and drills</small></button>`;
   const anchor=$('btnNewRun')||$('btnRun');anchor.parentNode.insertBefore(tiles,anchor.nextSibling);
   $('mmMate').onclick=()=>$('btnFriends').click();$('mmRun').onclick=()=>$('btnRun').click();$('mmThrow').onclick=()=>$('btnThrow').click();
   const links=document.createElement('div');links.className='mm-links';['btnLesson','btnCalib','btnCredits'].forEach(id=>{const b=$(id);if(b)links.appendChild(b);});const rr=document.createElement('button');rr.type='button';rr.className='tl-link';rr.id='mmRestartRun';rr.textContent='Restart the Run';rr.onclick=()=>{if(rr.dataset.arm!=='1'){rr.dataset.arm='1';rr.textContent='Tap again to abandon your run';setTimeout(()=>{rr.dataset.arm='';rr.textContent='Restart the Run';},2500);return;}rr.dataset.arm='';$('btnNewRun').click();};links.appendChild(rr);tiles.parentNode.insertBefore(links,tiles.nextSibling);}
  try{const nr=$('btnNewRun');$('mmRestartRun').hidden=!nr||nr.hidden;}catch(e){}
  // run tile subtitle mirrors the real button
  try{const rb=$('btnRun').querySelector('b');const tb=$('mmRun');if(rb)tb.querySelector('b').textContent=rb.textContent;tb.querySelector('small').textContent=/continue/i.test(rb&&rb.textContent||'')?'Pick up your run':'Three lives, a card each win';}catch(e){}
  // next match on Continue
  try{const c=career&&career();const b=$('btnContinue');if(c&&b&&!b.hidden){let n=b.querySelector('.mm-next');if(!n){n=document.createElement('span');n.className='mm-next';b.appendChild(n);}const nx=c.next;const tier=TIERS[c.tier||0];n.textContent=(nx&&nx.oppName?'Next: '+nx.oppName+' · ':'')+(tier?tier.n:'')+' · '+(c.wins||0)+'–'+(c.losses||0);}}catch(e){}
  // mates online on the Play a mate tile
  try{const l=$('mmLive');const n=window.TOPS_matesOnline?TOPS_matesOnline():0;l.hidden=!n;if(n)l.querySelector('span').textContent=n+' online';}catch(e){}}
 setInterval(()=>{try{const t=$('title');if(t&&!t.hidden)mm();}catch(e){}},700);

 // T20: a gold pop, spark burst and chime so the good darts feel good
 const T20CSS=document.createElement('style');T20CSS.textContent='#fxLayer .t20{position:absolute;left:50%;top:24%;transform:translate(-50%,-50%);font:900 54px/1 "Barlow Condensed",sans-serif;color:#FFD34D;text-shadow:0 0 18px rgba(255,200,60,.9),0 4px 0 #8a5a00;letter-spacing:.02em;animation:t20Pop .7s cubic-bezier(.2,1.7,.4,1) both,fxFade2 .35s ease-in .75s forwards}#fxLayer .t20.n2{color:#FFE27A;font-size:62px}#fxLayer .t20.n3{color:#C6F36B;font-size:72px;text-shadow:0 0 26px rgba(198,243,107,.95),0 4px 0 #3c5a00}#fxLayer .sp{position:absolute;left:50%;top:24%;width:8px;height:8px;margin:-4px;border-radius:50%;background:#FFD34D;box-shadow:0 0 10px #FFD34D;animation:t20Sp .7s ease-out forwards}@keyframes t20Pop{0%{transform:translate(-50%,-50%) scale(.2) rotate(-10deg);opacity:0}60%{transform:translate(-50%,-50%) scale(1.15);opacity:1}100%{transform:translate(-50%,-50%) scale(1)}}@keyframes t20Sp{to{transform:translate(var(--dx),var(--dy)) scale(.3);opacity:0}}';document.head.appendChild(T20CSS);
 function t20(n){let h=`<div class="t20 n${n}">${n===3?'T20 T20 T20':n===2?'T20 · T20':'T20'}</div>`;for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=90+Math.random()*60;h+=`<span class="sp" style="--dx:${(Math.cos(a)*r).toFixed(0)}px;--dy:${(Math.sin(a)*r*.7).toFixed(0)}px"></span>`;}add(h,1300);
  tone(880,1320,.16,.1,'triangle');tone(1320,1760,.2,.07,'sine',.07);if(n>=2)tone(1760,2640,.28,.06,'sine',.14);try{navigator.vibrate&&S&&S.cur===0&&navigator.vibrate(n>=2?[30,40,50]:30);}catch(e){}}
 const _land=land;land=function(x,y,far){const n0=S&&S.visit?S.visit.length:0;const me0=S&&!S.bull&&S.p?S.p[S.cur]:null;const L0=me0?me0.legs:0,vs0=S?S.visitStart:0;const r=_land.apply(this,arguments);try{if(me0&&me0.legs>L0){coCard(vs0,(S.visit||[]).filter(q=>!q.bust).map(q=>q.label));return r;}if(S&&!S.bull&&S.visit&&S.visit.length>n0){const v=S.visit[S.visit.length-1];if(v&&!v.bust){const L=String(v.label||'');
   if(L==='T20'){const n=S.visit.filter(q=>q.label==='T20').length;t20(Math.min(3,n));}
   else if(L==='BULL')medal('BULL','gold');
   else if(/^T\d/.test(L))medal(L,'silver');
   else if(/^D\d/.test(L)||L==='25')medal(L,'bronze');}}}catch(e){}return r;};
 // v1.46: checkout card. The winning dart shows the checkout total with the three darts in gold (no medal pop over the slow-mo)
 const COCSS=document.createElement('style');COCSS.textContent='#coCard{position:fixed;left:50%;top:30%;transform:translate(-50%,-50%);z-index:60;pointer-events:none;text-align:center;animation:coIn .5s cubic-bezier(.2,1.5,.4,1) both,coOut .4s ease-in 2.6s forwards}#coCard small{display:block;font:800 13px/1 Manrope,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#f0f2ea;opacity:.85;margin-bottom:6px;text-shadow:0 2px 8px rgba(0,0,0,.7)}#coCard b{display:block;font:900 92px/.9 "Barlow Condensed",sans-serif;color:#FFD34D;text-shadow:0 0 24px rgba(255,200,60,.75),0 5px 0 #8a5a00,0 10px 30px rgba(0,0,0,.6)}#coCard .dts{display:flex;gap:8px;justify-content:center;margin-top:10px}#coCard .dts i{font:800 22px/1 "Barlow Condensed",sans-serif;font-style:normal;color:#1a1204;background:linear-gradient(180deg,#FFE58A,#E2A92E);border-radius:6px;padding:6px 10px;box-shadow:0 3px 0 #8a5a00,0 6px 16px rgba(0,0,0,.5)}@keyframes coIn{from{opacity:0;transform:translate(-50%,-40%) scale(.6)}}@keyframes coOut{to{opacity:0;transform:translate(-50%,-60%)}}@media (prefers-reduced-motion:reduce){#coCard{animation:none}}';document.head.appendChild(COCSS);
 function coCard(total,labs){try{const o=document.getElementById('coCard');if(o)o.remove();const el=document.createElement('div');el.id='coCard';const nm=l=>l==='BULL'?'BULL':l;el.innerHTML=`<small>Checkout</small><b>${total}</b><div class="dts">${labs.slice(-3).map(l=>`<i>${nm(l)}</i>`).join('')}</div>`;document.body.appendChild(el);setTimeout(()=>el.remove(),3200);}catch(e){}}
 // v1.44: medal pops for every scoring ring. Gold: T20 and bull. Silver: other trebles. Bronze: doubles and the outer bull
 const MCSS=document.createElement('style');MCSS.textContent='#fxLayer .md{position:absolute;left:50%;top:24%;transform:translate(-50%,-50%);font:900 46px/1 "Barlow Condensed",sans-serif;letter-spacing:.02em;animation:t20Pop .55s cubic-bezier(.2,1.7,.4,1) both,fxFade2 .3s ease-in .6s forwards}#fxLayer .md.gold{color:#FFD34D;font-size:52px;text-shadow:0 0 16px rgba(255,200,60,.85),0 3px 0 #8a5a00}#fxLayer .md.silver{color:#E3E8EC;text-shadow:0 0 14px rgba(210,225,235,.7),0 3px 0 #5d666d}#fxLayer .md.bronze{color:#E3A066;font-size:42px;text-shadow:0 0 12px rgba(220,140,70,.6),0 3px 0 #6b3a14}#fxLayer .sp.silver{background:#E3E8EC;box-shadow:0 0 8px #E3E8EC}#fxLayer .sp.bronze{background:#E3A066;box-shadow:0 0 8px #E3A066}';document.head.appendChild(MCSS);
 function medal(lab,k){let h=`<div class="md ${k}">${lab==='BULL'?'BULL':lab}</div>`;const N=k==='bronze'?6:k==='silver'?8:12;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,r=60+Math.random()*40;h+=`<span class="sp ${k==='gold'?'':k}" style="--dx:${(Math.cos(a)*r).toFixed(0)}px;--dy:${(Math.sin(a)*r*.7).toFixed(0)}px"></span>`;}add(h,1000);
  const f=k==='gold'?[880,1320]:k==='silver'?[740,1110]:[600,900];tone(f[0],f[1],.12,k==='bronze'?.05:.07,'triangle');}
 // bounce-out stamp: its own layer so the visit callout can't swallow it
 window.TOPS_bounceStamp=function(name,mine){add(`<div class="shield" style="color:#ff5a4e;text-shadow:0 0 24px rgba(232,56,44,.8);font-size:54px;top:34%;white-space:nowrap">BOUNCE OUT<small style="display:block;font:800 14px/1.4 Manrope,sans-serif;letter-spacing:.12em;color:#F2EFE6;text-shadow:none">${mine?'No score':String(name||'').replace(/</g,'&lt;')+' · no score'}</small></div>`,1800);bodyFx('fx-jolt',450);};
 // caster: slam the moment you play it
 const _cp3=cardPlay;cardPlay=function(i){let id=null;try{id=S.pub.cards.hand[i];}catch(e){}const before=S&&S.pub&&S.pub.cards?S.pub.cards.hand.length:0;const r=_cp3.apply(this,arguments);try{const after=S.pub.cards.hand.length;if(id&&after<before){const c=CARD[id];const thr=S.p[S.cur];const tgt=(c.ty==='off'||id==='swap'||id==='fly'||id==='dip')&&thr?' on '+thr.name:'';slam(id,'You played it'+tgt,c.r==='R'||c.r==='L');window.__mySlamT=performance.now();window.__mySlamId=id;}}catch(e){}return r;};
 // everyone: slam + impact when the result comes back
 const _ca4=cardAnnounce;cardAnnounce=function(m,mine){const r=_ca4.apply(this,arguments);try{if(!S||!m)return r;const c=CARD[m.id];if(!c)return r;
   const fi=pubIdx(m.from),ti=pubIdx(m.to);const fn=fi>=0?S.p[fi].name:'Someone',tn=ti>=0?S.p[ti].name:'';
   const iCast=m.from===NET.myId,iTarget=m.to===NET.myId;
   const recent=iCast&&window.__mySlamId===m.id&&performance.now()-(window.__mySlamT||0)<6000;
   if(m.res==='blocked'){add(`<div class="shield">🛡 BLOCKED</div>`,1700);return r;}
   if(!recent){const line=iTarget?fn+' got you':(tn?fn+' → '+tn:fn);slam(m.id,line,c.r==='R'||c.r==='L'||iTarget);}
   if(m.res==='live'||m.res==='queued'||c.ty==='chaos'||c.ty==='self'||c.drink){setTimeout(()=>impact(m.id,iTarget),recent?150:700);}
  }catch(e){console.warn('slam',e);}return r;};
})();
</script>
<style id="v10-clips">
/* ===== v1.31 highlight clips ===== */
#hlBtn{display:inline-flex;align-items:center;gap:8px}
#hlBtn b{background:#C6F36B;color:#10191a;border-radius:9px;min-width:18px;height:18px;font:800 11px/18px Manrope,sans-serif;text-align:center;padding:0 5px}
#hlModal{position:fixed;inset:0;z-index:200;background:rgba(5,9,9,.92);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:max(18px,env(safe-area-inset-top)) 16px 24px;overflow-y:auto}
#hlModal h3{font:900 28px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#f0f2ea;margin:6px 0 4px;letter-spacing:.02em}
#hlModal p.sub{font:500 13px/1.4 Manrope,sans-serif;color:#aab6af;margin:0 0 14px}
#hlModal .hl{width:min(420px,100%);background:#141c1d;border:1px solid #2a3532;border-radius:12px;overflow:hidden;margin-bottom:14px}
#hlModal video{display:block;width:100%;max-height:52vh;background:#000}
#hlModal .hl-r{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px}
#hlModal .hl-r b{font:800 18px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#C6F36B}
#hlModal .hl-r small{display:block;font:500 11px/1.3 Manrope,sans-serif;color:#7d8983;margin-top:3px}
#hlModal .hl-r button{background:#C6F36B;color:#10191a;border:0;border-radius:8px;font:800 14px/1 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:10px 14px}
#hlModal .hl-x{position:sticky;top:0;align-self:flex-end;background:#1b2523;color:#f0f2ea;border:1px solid #34423d;border-radius:8px;padding:8px 14px;font:700 13px Manrope,sans-serif}
</style>
<script>
// ===== v1.31 highlight clips: record your own visits from the game canvas, keep 180s, ton-plus checkouts and 140+ =====
(function(){const CL=window.TOPS_CLIPS=[];let rec=null;
 const ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);const ok=()=>{try{if(ios&&!(typeof save!=='undefined'&&save.clips===true))return false;return !!(window.MediaRecorder&&HTMLCanvasElement.prototype.captureStream);}catch(e){return false;}};
 const mime=()=>{const c=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];for(const m of c){try{if(MediaRecorder.isTypeSupported(m))return m;}catch(e){}}return '';};
 function start(){const cv=document.getElementById('scene');if(!cv||!ok())return;try{const st=cv.captureStream(24);const mt=mime();const mr=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:2000000}:{videoBitsPerSecond:2000000});const ch=[];mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data);};
  const me=S.p[0];rec={mr,ch,st,pts0:me.pts,legs0:me.legs,score0:me.score,t0:Date.now(),mime:mr.mimeType||mt||'video/webm'};mr.start(500);}catch(e){rec=null;}}
 function stop(){const r=rec;rec=null;if(!r)return;const me=S&&S.p&&S.p[0];const gained=me?me.pts-r.pts0:0;const out=me?me.legs>r.legs0:false;
  let lab='';if(gained===180)lab='180';else if(out&&r.score0>=100)lab=r.score0+' checkout';else if(out&&r.score0>=61)lab=r.score0+' out';else if(gained>=140)lab=gained+' visit';
  const fin=()=>{try{r.st.getTracks().forEach(t=>t.stop());}catch(e){}if(!lab||!r.ch.length)return;const blob=new Blob(r.ch,{type:r.mime});if(blob.size<20000)return;CL.push({blob,url:URL.createObjectURL(blob),lab,opp:(S&&S.p[1]&&(S.p[1].disp||S.p[1].name))||'',at:Date.now(),ext:/mp4/.test(r.mime)?'mp4':'webm'});while(CL.length>6){const x=CL.shift();try{URL.revokeObjectURL(x.url);}catch(e){}}try{hlBtn();}catch(e){}};
  try{if(r.mr.state!=='inactive'){r.mr.onstop=fin;r.mr.stop();}else fin();}catch(e){fin();}}
 let endT=0;
 setInterval(()=>{try{if(save&&save.clips===false)return;if(typeof S==='undefined'||!S||!S.p||!S.p[0]){if(rec)stop();return;}const mine=!S.done&&S.cur===0&&!S.p[0].ai&&!S.bull;
  if(!rec&&mine&&S.dart===1&&!endT)start();
  if(rec&&!endT&&(!mine||S.done||S.p[0].legs>rec.legs0)){endT=Date.now()+1600;}
  if(rec&&!endT&&Date.now()-rec.t0>45000){endT=Date.now();}
  if(endT&&Date.now()>=endT){endT=0;stop();}}catch(e){}},200);
 function hlBtn(){const R=document.getElementById('result');const act=R&&R.querySelector('.actions');if(!act)return;let b=document.getElementById('hlBtn');if(!CL.length){if(b)b.remove();return;}
  if(!b){b=document.createElement('button');b.type='button';b.id='hlBtn';b.className='ghost wide';b.onclick=open;act.insertBefore(b,act.children[1]||null);}b.innerHTML=`Highlights <b>${CL.length}</b>`;}
 window.TOPS_hlBtn=hlBtn;setInterval(()=>{try{const R=document.getElementById('result');if(R&&!R.hidden)hlBtn();const det=document.getElementById('c3rwDet');if(det&&CL.length&&!document.getElementById('hlBtn2')){const b=document.createElement('button');b.type='button';b.id='hlBtn2';b.className='c3rw-det';b.textContent=`Watch your highlights (${CL.length})`;b.onclick=open;det.parentNode.insertBefore(b,det);}}catch(e){}},700);
 async function share(c){const f=new File([c.blob],`tops-${c.lab.replace(/\s+/g,'-')}.${c.ext}`,{type:c.blob.type});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'TOPS darts',text:`${c.lab}${c.opp?' v '+c.opp:''} on TOPS`});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  const a=document.createElement('a');a.href=c.url;a.download=f.name;document.body.appendChild(a);a.click();a.remove();}
 function open(){let m=document.getElementById('hlModal');if(m)m.remove();m=document.createElement('div');m.id='hlModal';
  m.innerHTML=`<button class="hl-x" type="button">Close</button><h3>Highlights</h3><p class="sub">Your best moments from this session. Share them to the group chat.</p>`+CL.slice().reverse().map((c,i)=>`<div class="hl"><video src="${c.url}" playsinline controls muted loop preload="metadata"></video><div class="hl-r"><div><b>${c.lab}</b><small>${c.opp?'v '+String(c.opp).replace(/</g,'&lt;')+' · ':''}${new Date(c.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</small></div><button type="button" data-i="${CL.length-1-i}">Share</button></div></div>`).join('');
  document.body.appendChild(m);m.querySelector('.hl-x').onclick=()=>m.remove();m.querySelectorAll('.hl-r button').forEach(b=>b.onclick=()=>share(CL[+b.dataset.i]));const v=m.querySelector('video');if(v)v.play().catch(()=>{});}
 window.TOPS_openClips=open;
})();
</script>
<style id="v10-live">
/* ===== v1.32 spectator live cam chip ===== */
#liveCam{position:absolute;left:14px;top:12px;z-index:6;display:flex;align-items:center;gap:8px;padding:6px 10px 6px 8px;border-radius:8px;background:rgba(8,12,12,.72);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);pointer-events:none;opacity:0;transform:translateY(-4px);transition:opacity .25s,transform .25s}
#liveCam.on{opacity:1;transform:none}
#liveCam i{width:8px;height:8px;border-radius:50%;background:#e8382c;box-shadow:0 0 0 0 rgba(232,56,44,.6);animation:lvp 1.6s infinite}
#liveCam b{font:800 12px/1 'Barlow Condensed',sans-serif;letter-spacing:.14em;color:#f0f2ea}
#liveCam span,#liveCam em{text-transform:none;letter-spacing:0}#liveCam span{font:600 12px/1 Manrope,sans-serif;color:#cfd6d2;white-space:nowrap;max-width:46vw;overflow:hidden;text-overflow:ellipsis}
#liveCam em{font:700 11px/1 Manrope,sans-serif;font-style:normal;color:#C6F36B}
@keyframes lvp{70%{box-shadow:0 0 0 7px rgba(232,56,44,0)}100%{box-shadow:0 0 0 0 rgba(232,56,44,0)}}
@media (prefers-reduced-motion:reduce){#liveCam i{animation:none}}
</style>
<script>
(function(){setInterval(()=>{try{const pa=document.getElementById('pullArea');if(!pa)return;let el=document.getElementById('liveCam');
 const on=typeof S!=='undefined'&&S&&S.online&&!S.done&&S.cur!==0&&S.p&&S.p[S.cur]&&!S.p[S.cur].left&&!S.bull;
 if(!el){if(!on){document.body.classList.remove('spectating');return;}el=document.createElement('div');el.id='liveCam';el.innerHTML='<i></i><b>LIVE</b><span></span><em></em>';pa.appendChild(el);}
 if(on){const p=S.p[S.cur];const nm=String(p.disp||p.name||'Mate');el.querySelector('span').textContent=nm+(nm.endsWith('s')?"' throw":"'s throw");el.querySelector('em').textContent=p.score!=null?p.score+' left':'';}
 el.classList.toggle('on',!!on);document.body.classList.toggle('spectating',!!on);}catch(e){}},300);})();
</script>
<style id="v10-cup">
/* ===== v1.33 cup night ===== */
#cupBox{margin:0 0 14px;border:1px solid #34423d;border-radius:12px;background:linear-gradient(180deg,rgba(217,173,82,.08),rgba(0,0,0,0) 40%),#121a19;padding:14px}
#cupBox .cup-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
#cupBox .cup-h b{font:900 22px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.03em;color:#f0f2ea}
#cupBox .cup-h small{font:600 11px/1.2 Manrope,sans-serif;color:#d9ad52;letter-spacing:.08em;text-transform:uppercase}
#cupBox .cup-br{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x proximity}
#cupBox .cup-rd{flex:0 0 auto;min-width:132px;display:flex;flex-direction:column;justify-content:space-around;gap:8px;scroll-snap-align:start}
#cupBox .cup-rd>small{font:700 10px/1 Manrope,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#7d8983}
#cupBox .tie{border:1px solid #2a3532;border-radius:8px;background:#172220;overflow:hidden}
#cupBox .tie.now{border-color:#C6F36B;box-shadow:0 0 0 1px rgba(198,243,107,.25)}
#cupBox .tie span{display:block;padding:7px 9px;font:700 13px/1.1 Manrope,sans-serif;color:#d9dcd6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
#cupBox .tie span+span{border-top:1px solid #24302d}
#cupBox .tie span.w{color:#f0f2ea;background:rgba(198,243,107,.08)}#cupBox .tie span.w::after{content:' ✓';color:#C6F36B}
#cupBox .tie span.l{color:#6b7570;text-decoration:line-through}
#cupBox .tie span.tbd{color:#5d6763;font-style:italic;font-weight:500}
#cupBox .cup-champ{text-align:center;padding:10px 0 4px}
#cupBox .cup-champ b{display:block;font:900 30px/1 'Barlow Condensed',sans-serif;color:#d9ad52;text-transform:uppercase}
#cupBox .cup-champ small{font:600 12px Manrope,sans-serif;color:#aab6af}
#cupBox .cup-act{display:flex;gap:8px;margin-top:12px}
#cupBox .cup-act button{flex:1;min-height:48px;border-radius:10px;font:800 16px/1 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase}
#cupBox .cup-act .go{background:#C6F36B;color:#10191a;border:0}
#cupBox .cup-act .end{background:none;color:#aab6af;border:1px solid #34423d;flex:0 0 auto;padding:0 14px}
#cupBox .cup-note{font:500 12px/1.4 Manrope,sans-serif;color:#aab6af;margin:10px 0 0}
#cupStart{width:100%;margin:0 0 12px;min-height:46px;border-radius:10px;background:none;border:1px dashed rgba(217,173,82,.6);color:#d9ad52;font:800 15px/1 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase}
#cupStart small{display:block;margin-top:4px;font:500 11px Manrope,sans-serif;letter-spacing:0;text-transform:none;color:#aab6af}
</style>
<script>
// ===== v1.33 cup night: knockout bracket for 3-8 mates in one room. Host runs it; each tie is a normal 1v1 online match =====
(function(){if(typeof NET==='undefined')return;const esc=x=>String(x==null?'':x).replace(/[<&]/g,c=>c==='<'?'&lt;':'&amp;');
 const nm=k=>{const c=NET.cup;const p=c&&c.players.find(p=>p.key===k);return p?p.name:'?';};
 function build(ps){const sh=ps.slice();for(let i=sh.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[sh[i],sh[j]]=[sh[j],sh[i]];}
  let size=2;while(size<sh.length)size*=2;const slots=sh.map(p=>p.key);while(slots.length<size)slots.push(null);
  // spread byes so two byes never meet: put nulls at odd positions from the end
  const seeded=[];const real=slots.filter(Boolean),byes=size-real.length;let r=0;for(let i=0;i<size/2;i++){const a=real[r++]||null;const b=(i>=size/2-byes)?null:(real[r++]||null);seeded.push({a,b,w:null});}
  const cup={id:Math.random().toString(36).slice(2,8),players:sh.map(p=>({key:p.key,name:p.name||'Mate'})),rounds:[seeded],champ:null};advance(cup);return cup;}
 function advance(c){for(let guard=0;guard<8;guard++){const R=c.rounds[c.rounds.length-1];R.forEach(t=>{if(!t.w&&t.a&&!t.b)t.w=t.a;if(!t.w&&!t.a&&t.b)t.w=t.b;});
  if(R.some(t=>!t.w&&(t.a||t.b)))return;if(R.length===1){c.champ=R[0].w;return;}const nx=[];for(let i=0;i<R.length;i+=2)nx.push({a:R[i].w||null,b:R[i+1]?R[i+1].w||null:null,w:null});c.rounds.push(nx);}}
 function nextTie(c){if(!c||c.champ)return null;for(let r=0;r<c.rounds.length;r++){const i=c.rounds[r].findIndex(t=>t.a&&t.b&&!t.w);if(i>=0)return {r,i,t:c.rounds[r][i]};}return null;}
 const rdName=(c,r)=>{const left=c.rounds[0].length*2/Math.pow(2,r);return left===2?'Final':left===4?'Semis':left===8?'Quarters':'Round '+(r+1);};
 function push(){if(NET.seat===0&&NET.cup)try{netSend('cup',{cup:NET.cup});}catch(e){}}
 setInterval(()=>{if(NET.seat===0&&NET.cup&&NET.chan)push();},10000);
 function startTie(){const c=NET.cup;const n=nextTie(c);if(!n)return;const ps=mpPeers();const here=k=>ps.some(p=>p.key===k);
  if(!here(n.t.a)||!here(n.t.b)){netStatus(`${!here(n.t.a)?nm(n.t.a):nm(n.t.b)} isn't in the room. Waiting for them, or end the cup.`);return;}
  const o=mpCfgOpts();const mk=k=>{const p=ps.find(x=>x.key===k)||{};const me=k===NET.myId;return {key:k,name:me?(mpName()||'Host'):(p.name||'Mate'),look:me?save.look:(p.look||lookFor(p.name||'Mate')),flight:p.flight,gname:me?(NET.user?lbName():''):(p.gname||''),tag:me?(save.antKiller?'Ant Killer':''):(p.tag||''),pro:me?myPro().id:(p.pro||'shane'),pid:me?mpPid():(p.pid||k),walk:me?(save.walkon||'off'):(p.walk||'off')};};
  const players=[mk(n.t.a),mk(n.t.b)];const cfg={t:'start',legs:o.legs,start:o.start,din:o.din,tier:o.venue,level:o.level,first:Math.floor(Math.random()*2),teams:false,players,pub:pubCfg(),cup:{id:c.id,r:n.r,i:n.i}};
  netSend('start',cfg);onlineBegin(cfg);}
 function record(id,r,i,w){const c=NET.cup;if(!c||c.id!==id)return;const t=c.rounds[r]&&c.rounds[r][i];if(!t||t.w)return;if(w!==t.a&&w!==t.b)return;t.w=w;advance(c);push();try{renderLobby();}catch(e){}
  if(c.champ){try{pubBand?0:0;}catch(e){}netStatus(`🏆 ${nm(c.champ)} wins the cup!`);}}
 // receive
 const _nr=netRecv;netRecv=function(m){try{if(m&&m.from!==NET.myId){if(m.t==='cup'&&NET.seat!==0){NET.cup=m.cup||null;try{renderLobby();}catch(e){}return;}if(m.t==='cupres'){if(NET.seat===0)record(m.id,m.r,m.i,m.w);return;}}}catch(e){}return _nr.apply(this,arguments);};
 // non-playing mates stay in the lobby and watch the bracket
 const _ob=onlineBegin;onlineBegin=function(cfg){try{if(cfg&&cfg.cup&&cfg.players&&!cfg.players.some(p=>p.key===NET.myId)){NET.lastCupCfg=cfg;NET.started=false;$('onLobby').hidden=false;netStatus(`Cup night: ${cfg.players.map(p=>p.name).join(' v ')} is on. Your tie is coming.`);try{renderLobby();}catch(e){}return;}}catch(e){}return _ob.apply(this,arguments);};
 // report the result of a cup tie
 const _em=endMatch;endMatch=function(){const r=_em.apply(this,arguments);try{const cfg=NET.lastCfg;if(S&&S.online&&cfg&&cfg.cup&&!cfg._cupSent){cfg._cupSent=1;const w=S.p.reduce((bi,p,i)=>p.legs>S.p[bi].legs?i:bi,0);const wk=S.p[w]&&S.p[w].key;if(wk){const msg={id:cfg.cup.id,r:cfg.cup.r,i:cfg.cup.i,w:wk};netSend('cupres',msg);if(NET.seat===0)record(msg.id,msg.r,msg.i,msg.w);}}}catch(e){console.warn('cup',e);}return r;};
 // lobby UI
 const _rl=renderLobby;renderLobby=function(){const r=_rl.apply(this,arguments);try{paint();}catch(e){console.warn('cup ui',e);}return r;};
 function paint(){const host=$('onPlayers');if(!host||!host.parentNode)return;let box=$('cupBox'),sb=$('cupStart');const c=NET.cup;const isHost=NET.seat===0;const ps=mpPeers();
  if(!c){if(box)box.remove();if(isHost&&ps.length>=3&&!(S&&S.online&&!S.done)){if(!sb){sb=document.createElement('button');sb.type='button';sb.id='cupStart';sb.onclick=()=>{NET.cup=build(mpPeers());push();renderLobby();};host.parentNode.insertBefore(sb,host);}sb.innerHTML=`🏆 Start a cup night<small>Knockout for all ${ps.length} of you. Each tie is a normal match, everyone else watches the bracket.</small>`;}else if(sb)sb.remove();return;}
  if(sb)sb.remove();if(!box){box=document.createElement('div');box.id='cupBox';host.parentNode.insertBefore(box,host);}
  const n=nextTie(c);const P=k=>k?esc(nm(k)):'';
  const tot=c.rounds.reduce((s,R)=>s+R.filter(t=>t.a&&t.b).length,0),done=c.rounds.reduce((s,R)=>s+R.filter(t=>t.a&&t.b&&t.w).length,0);let exp=0;{let k=c.players.length;while(k>1){exp+=Math.floor(k/2);k=Math.ceil(k/2);}}
  box.innerHTML=`<div class="cup-h"><b>🏆 Cup night</b><small>${c.champ?'Complete':n?rdName(c,n.r):'Waiting'}</small></div><p class="cup-prog">${done} of ${Math.max(exp,tot)} matches played · ${c.players.length} players</p>`+(c.champ?`<div class="cup-champ"><b>🏆 ${P(c.champ)}</b><small>Cup night champion</small></div>`:'')+
   `<div class="cup-br">${c.rounds.map((R,ri)=>`<div class="cup-rd"><small>${rdName(c,ri)}</small>${R.map((t,ti)=>{const now=n&&n.r===ri&&n.i===ti;const cl=k=>!k?'tbd':(t.w?(t.w===k?'w':'l'):'');return `<div class="tie ${now?'now':''}"><span class="${cl(t.a)}">${t.a?P(t.a):(ri===0?'Bye':'TBD')}</span><span class="${cl(t.b)}">${t.b?P(t.b):(ri===0?'Bye':'TBD')}</span></div>`;}).join('')}</div>`).join('')}</div>`+
   (isHost?`<div class="cup-act">${n&&!c.champ?`<button type="button" class="go" id="cupGo">Play: ${P(n.t.a)} v ${P(n.t.b)}</button>`:''}<button type="button" class="end" id="cupEnd">${c.champ?'New cup':'End cup'}</button></div>`:`<p class="cup-note">${c.champ?'That’s the cup done.':n?(n.t.a===NET.myId||n.t.b===NET.myId?'You’re up next. Ready up.':`Next up: ${P(n.t.a)} v ${P(n.t.b)}`):''}</p>`);
  const go=$('cupGo');if(go)go.onclick=startTie;const en=$('cupEnd');if(en)en.onclick=()=>{if(!c.champ&&!confirm('End the cup? The bracket will be cleared.'))return;NET.cup=null;try{netSend('cup',{cup:null});}catch(e){}renderLobby();};}
 window.TOPS_cup={build,advance,nextTie,record,paint};
})();
</script>
<style id="v10-season">
/* ===== v1.47 season board ===== */
#sbBox{display:block!important;grid-column:1/-1;width:100%}
#sbBox .label{display:block;margin-bottom:4px}
.mpr.sb .sb-s small,.mpr.sb .sb-t{white-space:nowrap}
.mpr.sb .sb-card{display:grid;grid-template-columns:22px 1fr auto;gap:2px 10px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.mpr.sb .sb-card.me{box-shadow:inset 3px 0 0 #C6F36B;padding-left:8px}
.mpr.sb .sb-r{font:800 15px/1 'Barlow Condensed',sans-serif;color:#7d8983;grid-row:span 2}
.mpr.sb .sb-card:first-of-type .sb-r{color:#C6F36B}
.mpr.sb .sb-n{font:800 15px/1.1 Manrope,sans-serif;color:#f0f2ea;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mpr.sb .sb-t{font:700 10px/1 Manrope,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#d9ad52;margin-top:4px}
.mpr.sb .sb-a{text-align:right;grid-row:span 2}.mpr.sb .sb-a b{display:block;font:800 26px/1 'Barlow Condensed',sans-serif;color:#f0f2ea;font-variant-numeric:tabular-nums}.mpr.sb .sb-a small{font:600 10px/1 Manrope,sans-serif;color:#7d8983;letter-spacing:.08em;text-transform:uppercase}
.mpr.sb .sb-s{grid-column:2/4;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:8px}
.mpr.sb .sb-s span{background:#172220;border-radius:6px;padding:6px 2px 5px;text-align:center}
.mpr.sb .sb-s b{display:block;font:800 15px/1 'Barlow Condensed',sans-serif;color:#f0f2ea;font-variant-numeric:tabular-nums}
.mpr.sb .sb-s small{display:block;margin-top:3px;font:600 9px/1 Manrope,sans-serif;color:#7d8983;letter-spacing:.06em;text-transform:uppercase}
.mpr.sb .sb-s span.hi b{color:#FFD34D}
</style>
<script>
// ===== v1.47 season board for the boys + nine-dart progress tracking =====
(function(){
 const ok1=s=>s===50||(s>0&&s<=40&&s%2===0);
 const bad2=[99,102,103,105,106,108,109],bad3=[159,162,163,165,166,168,169];
 function can(s,n){if(s===0)return true;if(n<=0||s<2)return false;if(n===1)return ok1(s);if(n===2)return s<=110&&!bad2.includes(s);if(n===3)return s<=170&&!bad3.includes(s);return s>60?can(s-60,n-1):can(s,3);}
 window.TOPS_n9can=can;
 // track: how many darts into a nine-darter has this leg stayed on track
 const _ld=land;land=function(x,y,far){const me=S&&!S.bull&&S.p?S.p[0]:null;const mine=me&&S.cur===0&&!me.ai;const ld0=mine?me.legDarts:0,L0=mine?me.legs:0,sc0=mine?me.score:0;const r=_ld.apply(this,arguments);
  try{if(mine&&!S.practice){const k=ld0+1;if(k===1)me._n9=true;const won=me.legs>L0;const sc=won?0:me.score;const bust=!won&&me.score===sc0&&S.visit&&S.visit.length===0;
   if(me._n9&&k<=9&&!bust&&(won?k<=9:can(sc,9-k))){if(typeof save!=='undefined'){if(!save.n9||k>save.n9){save.n9=k;try{persist();}catch(e){}}me.n9=Math.max(me.n9||0,k);}}else me._n9=false;}}catch(e){}return r;};
 // season stats bucket (resets with the career season)
 const _em=endMatch;endMatch=function(){let pre=null;try{if(S&&!S.online&&!S.practice&&typeof ui!=='undefined'&&ui.mode==='career'){const me=S.p[0];pre={pts:me.pts,darts:me.darts};}}catch(e){}const r=_em.apply(this,arguments);
  try{if(pre&&pre.darts){const c=career();const n=(c&&c.season&&c.season.n)||1;const ss=save.ssn&&save.ssn.n===n?save.ssn:{n,pts:0,darts:0};ss.pts+=pre.pts;ss.darts+=pre.darts;save.ssn=ss;persist();}}catch(e){}return r;};
 // send the extra fields with the leaderboard row (ignored by the server until its columns exist)
 const _bf=window.fetch.bind(window);window.fetch=function(u,o){try{if(typeof u==='string'&&/rpc\/tops_upsert/.test(u)&&o&&o.body){const b=JSON.parse(o.body);const c=career();const ss=save.ssn;const p=b.p||{};p.season_avg=ss&&ss.darts?+(ss.pts/ss.darts*3).toFixed(1):p.avg;p.title=c&&TIERS[c.tier]?TIERS[c.tier].n:'';p.n9=save.n9||0;b.p=p;o=Object.assign({},o,{body:JSON.stringify(b)});}}catch(e){}return _bf(u,o);};
 // board
 async function rows(){try{let r=await _bf(LB.url+'/rest/v1/tops_players?select=id,name,tier,matches,wins,avg,best_avg,best_leg,t180,hf,season_avg,title,n9&order=avg.desc&limit=30',{headers:lbHeaders()});if(!r.ok){r=await _bf(LB.url+'/rest/v1/tops_players?select=id,name,tier,matches,wins,avg,best_avg,best_leg,t180,hf&order=avg.desc&limit=30',{headers:lbHeaders()});}if(!r.ok)return null;return await r.json();}catch(e){return null;}}
 const esc=s=>String(s==null?'':s).replace(/[<&]/g,c=>c==='<'?'&lt;':'&amp;');
 async function paint(){const host=document.getElementById('mpRecords');if(!host)return;let box=document.getElementById('sbBox');const rs=await rows();if(!rs||!rs.length){if(box)box.remove();return;}
  const meId=(typeof lbId==='function')?lbId().id:null;const list=rs.filter(r=>r.matches>0).sort((a,b)=>(+b.season_avg||+b.avg)-(+a.season_avg||+a.avg));
  const html=`<div class="label">Season ${(career()&&career().season&&career().season.n)||1} · the boys</div>`+list.map((r,i)=>{const me=r.id===meId;const n9=me?Math.max(save.n9||0,r.n9||0):(r.n9||0);const t=r.title||(TIERS[r.tier]?TIERS[r.tier].n:'');const sa=+(r.season_avg||r.avg||0);
   return `<div class="sb-card ${me?'me':''}"><span class="sb-r">${i+1}</span><div><div class="sb-n">${esc(r.name)}</div><div class="sb-t">${esc(t)} · ${r.wins}–${r.matches-r.wins}</div></div><div class="sb-a"><b>${sa.toFixed(1)}</b><small>Season avg</small></div>
   <div class="sb-s"><span><b>${(+r.avg||0).toFixed(1)}</b><small>Career</small></span><span class="${r.t180?'hi':''}"><b>${r.t180||0}</b><small>180s</small></span><span class="${r.hf>=100?'hi':''}"><b>${r.hf||'–'}</b><small>Hi out</small></span><span><b>${r.best_leg||'–'}</b><small>Best leg</small></span><span class="${n9>=6?'hi':''}"><b>${n9?n9+'/9':'–'}</b><small>9-dart</small></span></div></div>`;}).join('');
  if(!box){box=document.createElement('div');box.id='sbBox';box.className='mpr sb';}
  box.innerHTML=html;const gn=host.querySelector('.mpr.gn');if(gn)gn.after(box);else host.prepend(box);}
 const _rr=renderRecords;renderRecords=async function(){const r=await _rr.apply(this,arguments);try{await paint();}catch(e){console.warn('season board',e);}return r;};
 window.TOPS_seasonBoard=paint;
})();
</script>
