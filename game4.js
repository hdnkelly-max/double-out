<script>
/* S3 (Season 3, Hayden 07:45): one flag for the whole Season 3 build. ?s3=1 turns it on and sticks (the home-screen app can't pass a URL flag;
   the Menu switch writes the same key), ?s3=0 turns it off. Season 3 has its own save slot on the device and in the cloud, so Season 2 saves
   are never written by a Season 3 game and rolling back to 3.55 gives them back exactly. */
/* release = flip S3_DEFAULT to true (one line). Rollback without a new build: ?s3=0 or the Menu switch stores '0' and the game is 3.55 again on the Season 2 save */
const S3_DEFAULT=true;
window.TOPS_S3FLAG=(()=>{try{const q=new URLSearchParams(location.search).get('s3');if(q==='1'||q==='0')localStorage.setItem('tops_s3',q);const v=localStorage.getItem('tops_s3');return v==='1'||(v!=='0'&&S3_DEFAULT);}catch(e){return S3_DEFAULT;}})();
/* Vinyl v2 switch (Overseer 17:05; default ON since Hayden 17:21): ?v2=0 turns it off and sticks (localStorage tops_v2), ?v2=1 back on; off = the 4.02 figures exactly */
window.TOPS_V3FLAG=(()=>{try{const q=new URLSearchParams(location.search).get('v3');if(q==='1'||q==='0')localStorage.setItem('tops_v3',q);return localStorage.getItem('tops_v3')==='1';}catch(e){return false;}})();/* Vinyl v3 port (doc 23), test-only: ?v3=1 sticks (tops_v3), ?v3=0 off; read once at load, before any figure is built, so a match never swaps rig */
window.TOPS_V2FLAG=(()=>{try{const q=new URLSearchParams(location.search).get('v2');if(q==='1'||q==='0')localStorage.setItem('tops_v2',q);return localStorage.getItem('tops_v2')!=='0';}catch(e){return true;}})();/* default ON (Hayden 17:21): ?v2=0 / tops_v2='0' is the opt-out */
window.TOPS_SAVE_NS=TOPS_S3FLAG?{key:'doubleout_s3',table:'tops_saves_s3',rpc:'tops_save3_put',bak:'tops_career_bak_s3',lb:'tops_players_s3',lbRpc:'tops_upsert3',season:3}:{key:'doubleout2',table:'tops_saves',rpc:'tops_save_put',bak:'tops_career_bak',lb:'tops_players',lbRpc:'tops_upsert',season:2};
ENGINE
// ===== DATA =====
const TIERS=[
 {n:'Pub league',s:'Thursday night at the local',venue:'The Kauri Arms',avg:52,purse:40,fee:0,need:3,legs:3,gap:2000,crowd:.18,caller:'pub',press:0},
 {n:'Club singles',s:'RSA club championship',venue:'The RSA',avg:65,purse:150,fee:20,need:3,legs:3,gap:2000,crowd:.3,caller:'club',press:.3},
 {n:'Regional rep',s:'Regional super league',venue:'Regional Super League',avg:75,purse:600,fee:40,need:4,legs:5,gap:2200,crowd:.45,caller:'club',press:.6},
 {n:'DPNZ ProTour',s:'National circuit, all over the country',venue:'DPNZ ProTour',avg:85,purse:2500,fee:60,need:4,legs:5,gap:2200,crowd:.55,caller:'pro',press:.9},
 {n:'Trans-Tasman qualifier',s:'Top 16 NZ vs top 16 AUS',venue:'Trans-Tasman Championship',avg:91,purse:8000,fee:150,need:4,legs:7,gap:2600,crowd:.7,caller:'pro',press:1.2},
 {n:'PDC Pro Tour',s:'Players Championship, Wigan. No crowd.',venue:'Players Championship · Wigan',avg:95,purse:15000,fee:400,need:5,legs:7,gap:1800,crowd:.08,caller:'pro',press:1.0},
 {n:'World Championship',s:'Alexandra Palace',venue:'Alexandra Palace · London',avg:101,purse:60000,fee:1200,need:4,legs:9,gap:2800,crowd:1,caller:'pro',press:1.8}];
const SHAFTS=[{id:'short',n:'Harrows Supergrip short',s:'35 mm nylon. Less sway, flatter flight.',len:.035,sway:-.06,tol:-.03,price:0},{id:'med',n:'Target Pro Grip medium',s:'41 mm nylon. The default.',len:.046,sway:0,tol:0,price:0},{id:'long',n:'Winmau Prism long',s:'48 mm. Forgiving release, a touch more sway.',len:.058,sway:.06,tol:.06,price:25},{id:'carbon',n:'L-Style Carbon medium',s:'Stiff carbon. Sway −4%.',len:.046,sway:-.04,tol:0,price:60,col:0x2a2a2a},{id:'spin',n:'Target Pro Grip Spin',s:'Rotating top. Fewer deflections, window +3%.',len:.046,sway:0,tol:.03,price:45,col:0x2a3a5a}];
const FSHAPES=[{id:'standard',n:'Target Pro Ultra No.2',s:'Standard shape. Stable. The default.',base:0,tol:0,price:0},{id:'slim',n:'L-Style L1 Slim',s:'Tighter groups when you time it. Less forgiving.',base:-.05,tol:-.08,price:30},{id:'kite',n:'Winmau Prism Alpha Kite',s:'Wider release window, slightly looser.',base:.03,tol:.07,price:30},{id:'pear',n:'Harrows Retina Pear',s:'Between standard and slim.',base:-.02,tol:-.03,price:30}];
const POINTS=[{id:'std',n:'Steel point 32 mm',s:'The default.',base:0,price:0,col:0xcfd4d9,len:.032},{id:'long',n:'Target Swiss point 41 mm',s:'Sits deeper, bounce-outs rarer. Spread −2%.',base:-.02,price:40,col:0xcfd4d9,len:.041},{id:'black',n:'Winmau Diamond black',s:'Grip-cut. Spread −1%.',base:-.01,price:70,col:0x222222,len:.036},{id:'gold',n:'Target Titanium gold',s:'Spread −2%. Shines on stage.',base:-.02,price:150,col:0xd9b45a,len:.036}];
const SPONSORS=[
 {id:'shot',brand:'Shot',from:'Shot Darts NZ',tier:1,disc:.15,perMatch:0,free:{barrel:'zen'},lines:['Kia ora. Shot Darts here.','We back Kiwi players coming through. Set of Zen Jutsu 23g on us, 15% off anything in the range.','Wear the logo. No contract, just darts.'],label:'SHOT DARTS'},
 {id:'rd',brand:'Red Dragon',from:'Red Dragon Darts',tier:3,disc:.25,perMatch:150,free:{barrel:'razor',shaft:'carbon'},lines:['Red Dragon here. We watched the ProTour feed.','Free Razor Edge set, carbon shafts, 25% off the range and $150 appearance money every match.','You\u2019d be our second player in NZ.'],label:'RED DRAGON'},
 {id:'harrows',brand:'Harrows',from:'Harrows',tier:3,disc:.25,perMatch:120,free:{barrel:'supergrip',flight:'pear'},lines:['Harrows. We\u2019ve seen the averages.','Supergrip Ultra set, Retina flights, 25% off and $120 a match.','Pick us and the shirt gets the three arrows.'],label:'HARROWS'},
 {id:'target',brand:'Target',from:'Target Darts',tier:5,disc:.4,perMatch:900,free:{barrel:'asp',shaft:'spin',flight:'standard',point:'long'},lines:['Target Darts. Tour Card holders only get this call.','Any Target signature barrel, Swiss points, Pro Grip Spin shafts, 40% off and $900 a match.','You\u2019d be on the same wall as Littler and Aspinall.'],label:'TARGET'},
 {id:'winmau',brand:'Winmau',from:'Winmau',tier:5,disc:.4,perMatch:900,free:{barrel:'mvg',shaft:'long',flight:'kite',point:'black'},lines:['Winmau. Congratulations on the card.','MvG Exact set, Prism shafts and flights, Diamond points, 40% off and $900 a match.','Blade 6 board for the house too.'],label:'WINMAU'}];
const GEAR=[
 {id:'board',n:'Practice board',s:'A board at home. Arm grows twice as fast per dart.',price:120},
 {id:'coach',n:'Coaching session',s:'+0.4 composure. Repeatable up to five times.',price:250,rep:5},
 {id:'case',n:'Pro case + spare shafts',s:'Sway down 8%. Looks the part on stage.',price:180},
 {id:'shirt',n:'Custom darts shirt',s:'Unlocks shirt patterns and extra colours in the creator.',price:90}];
const BARRELS=[
 {id:'assassin',n:'Harrows Club Brass 22g',brand:'Harrows',s:'Brass starter set. Where everyone begins.',base:5.6,tol:1.0,sway:1.25,price:0},
 {id:'neutron',n:'Winmau Neutron 23g',brand:'Winmau',s:'Brass, ringed grip. Honest and cheap.',base:5.2,tol:1.02,sway:1.1,price:45},
 {id:'corexl',n:'Unicorn Core XL 22g',brand:'Unicorn',s:'Entry tungsten. First real step up.',base:5.0,tol:1.04,sway:1.0,price:70},
 {id:'supergrip',n:'Harrows Supergrip Ultra 22g',brand:'Harrows',s:'Micro-grip tungsten. Stacks well.',base:4.8,tol:1.06,sway:.95,price:95},
 {id:'razor',n:'Red Dragon Razor Edge 24g',brand:'Red Dragon',s:'Sharp razor grip, 85% tungsten.',base:4.6,tol:1.07,sway:.85,price:120},
 {id:'vapor8',n:'Target Vapor8 21g',brand:'Target',s:'90% tungsten, slim. Loves the treble.',base:4.4,tol:1.08,sway:.9,price:150},
 {id:'zen',n:'Shot Zen Jutsu 23g',brand:'Shot',s:'Kiwi-made 90% tungsten. Balanced.',base:4.3,tol:1.1,sway:.85,price:170},
 {id:'mvg',n:'Winmau MvG Exact 23g',brand:'Winmau',s:'Michael van Gerwen signature. Onyx coating.',base:4.1,tol:1.1,sway:.8,price:260},
 {id:'asp',n:'Target Nathan Aspinall G2 24g',brand:'Target',s:'Scalloped grip, front-weighted.',base:4.0,tol:1.12,sway:.8,price:270},
 {id:'ga',n:'Unicorn Gary Anderson Phase 5 23g',brand:'Unicorn',s:'Straight barrel, smooth. Purist\u2019s dart.',base:4.0,tol:1.1,sway:.75,price:240},
 {id:'littler',n:'Target Luke Littler Gen 1 23g',brand:'Target',s:'The Nuke\u2019s own. Grip everywhere.',base:3.9,tol:1.13,sway:.8,price:300},
 {id:'power',n:'Target Phil Taylor Power 9Five Gen 8 26g',brand:'Target',s:'Sixteen world titles of heritage. 95% tungsten.',base:3.8,tol:1.15,sway:.65,price:420}];

const SKINS=['#f1c9a5','#d9a06f','#b97a4b','#8d5a3a','#5b3b2a'];
const HAIRS=['#1b1410','#4a2f1d','#8a5a2b','#c9a35a','#9a9a9a','#c9352d'];
const SHIRTS=['#1c1c1c','#274a7a','#7a2a2a','#133a66','#4a2a7a','#2f6b3a','#b8641a','#e0e0e0'];
const FLIGHTS=['#f0b23a','#ff5c5c','#4cd2ff','#ffffff','#36a364','#b26bff'];
// ===== PROGRESSION: attributes grow from play, feats unlock perk picks =====
const ATTRS=[
 {id:'sc',n:'Scoring',s:'Trebles, tons, 140s and 180s feed it. Tightens every scoring dart.',per:'−0.7% scoring spread per level'},
 {id:'fi',n:'Finishing',s:'Doubles attempted and hit, big checkouts. Tightens doubles and bull.',per:'−0.9% double spread per level'},
 {id:'co',n:'Composure',s:'Darts thrown under pressure, deciders, match darts, beating Deano. Nerves bite less.',per:'+0.4 composure per level'},
 {id:'cn',n:'Consistency',s:'Matches finished, legs won, averages held near your best. Steadies the arm.',per:'−3% arm jitter, +1% release window per level'}];
const ATTR_MAX=20;
function attr(id){save.attr=save.attr||{};return save.attr[id]||(save.attr[id]={xp:0,lv:0});}
function lvOf(id){return attr(id).lv;}
function xpNeed(lv){return isRun()?40+lv*18:Math.round(60+30*Math.pow(lv,1.3));}
function attrCap(){const c=career();return (isRun()||!c)?ATTR_MAX:ATTR_CAP[Math.min(6,c.tier||0)];}
function gainXP(id,amt,mult){if(S&&S.practice&&isRun())return 0;if(S&&S.drill&&S.drill.noXP)return 0;if(S&&S.practice&&S_lightXP)amt*=.5;amt=Math.round(amt*(mult==null?1:mult)*(1+SK().xp));if(!amt||amt<=0)return 0;const a=attr(id);const cap=attrCap();if(id==='co'&&has('ice'))return 0;a.xp+=amt;if(a.lv>=cap){a.xp=Math.min(a.xp,xpNeed(a.lv)*3);_SK=null;return 0;}let up=0;while(a.lv<cap&&a.xp>=xpNeed(a.lv)){a.xp-=xpNeed(a.lv);a.lv++;up++;}_SK=null;
 if(S){S.gains=S.gains||{};S.gains[id]=(S.gains[id]||0)+amt;if(up){S.lvUps=(S.lvUps||[]).concat({id,lv:a.lv});setTimeout(()=>{if(!S||S.done)return;flash(ATTRS.find(x=>x.id===id).n+' '+a.lv,'gold','level up');sfxLevel();},900);}xpPop('+'+amt+' '+ATTRS.find(x=>x.id===id).n,id);}return up;}
const PERKS=[
 // common, stackable (level 1–5), small steps
 {id:'grp',n:'Grouping',s:'Spread −1.5% per level.',e:{spread:-.015},r:'c',max:5},
 {id:'sce',n:'Scoring eye',s:'Scoring darts −1.5% per level.',e:{score:-.015},r:'c',max:5},
 {id:'dbe',n:'Double eye',s:'Doubles and bull −2% per level.',e:{dbl:-.02},r:'c',max:5},
 {id:'std',n:'Steady',s:'Sway −3% per level.',e:{sway:-.03},r:'c',max:5},
 {id:'soft',n:'Soft release',s:'Release window +2% per level.',e:{win:.02},r:'c',max:5},
 {id:'calm',n:'Calm',s:'+0.25 composure per level.',e:{comp:.25},r:'c',max:5},
 {id:'rhythm',n:'Rhythm',s:'Arm-speed variation −6% per level.',e:{jit:-.06},r:'c',max:5},
 {id:'fee',n:'Appearance money',s:'Prize money +4%, entry fees −5% per level.',e:{prize:.04,fee:-.05},r:'c',max:5},
 {id:'study',n:'Quick study',s:'Attribute experience +8% per level.',e:{xp:.08},r:'c',max:5},
 {id:'habit',n:'Practice habit',s:'Arm grows 15% faster per level.',e:{armGrow:.15},r:'c',max:5},
 // rare, once
 {id:'hunter',n:'Treble Hunter',s:'Scoring darts −5%. 180 chases rattle you less.',e:{score:-.05,chase:-.3},r:'r'},
 {id:'eye',n:'Finisher’s eye',s:'Doubles and bull −6%. Match darts shake you less.',e:{dbl:-.06,fin:-.3},r:'r'},
 {id:'groove',n:'Grooved',s:'Second and third dart at the same bed −6%.',e:{groove:-.06},r:'r'},
 {id:'warm',n:'Warm-up',s:'First visit of each leg carries no nerves.',e:{warm:1},r:'r'},
 {id:'stage',n:'Big Stage',s:'Venue pressure −25%. +0.6 composure.',e:{press:-.25,comp:.6},r:'r'},
 {id:'cover',n:'Cover Shot',s:'After a missed double, the next double −10%. You scout opponents’ form.',e:{cover:-.1,scout:1},r:'r'},
 {id:'negotiator',n:'Negotiator',s:'Prize money +15%. Entry fees −25%.',e:{prize:.15,fee:-.25},r:'r'},
 {id:'grinder',n:'Grinder',s:'Arm grows 60% faster. Prize money −15%.',e:{armGrow:.6,prize:-.15},r:'r'},
 // keystones, exclusive by group
 {id:'iron',n:'Iron Wrist',s:'Spread −10%. Release window −25%: perfect or nothing.',e:{spread:-.1,win:-.25},r:'k',x:'arm'},
 {id:'loose',n:'Loose Arm',s:'Release window +25%. Spread +4%.',e:{win:.25,spread:.04},r:'k',x:'arm'},
 {id:'machine',n:'Treble Machine',s:'Scoring darts −12%. Doubles +8%.',e:{score:-.12,dbl:.08},r:'k',x:'game'},
 {id:'clinical',n:'Clinical',s:'Doubles and bull −18%. Scoring darts +6%.',e:{dbl:-.18,score:.06},r:'k',x:'game'},
 {id:'ice',n:'Ice in the Veins',s:'Nerves never widen your spread. Composure stops growing.',e:{noNerves:1},r:'k',x:'head'},
 {id:'showman',n:'Showman',s:'Prize money +50%, sponsors pay double. Venue pressure +35%.',e:{prize:.5,spons:1,press:.35},r:'k',x:'head'}];
const PERK_R={c:'Perk',r:'Rare perk',k:'Keystone'};
const PERK_X={arm:'Arm',game:'Game',head:'Head'};
// ===== THE RUN deck: suits, rarities, synergies =====
const RSUIT={c:{n:'Clubs',g:'♣',col:'#3fae5a',t:'Scoring'},d:{n:'Diamonds',g:'♦',col:'#d4a84a',t:'Finishing'},s:{n:'Spades',g:'♠',col:'#e9e4d8',t:'Arm'},h:{n:'Hearts',g:'♥',col:'#e2362f',t:'Head'},w:{n:'Wild',g:'★',col:'#b58cff',t:'Wild'}};
const RRAR={c:{n:'Common',w:1.0},u:{n:'Uncommon',w:.5},r:{n:'Rare',w:.22},l:{n:'Legendary',w:.08}};
const FLUSH={c:{k:'score',v:-.03,t:'Scoring darts −3%'},d:{k:'dbl',v:-.04,t:'Doubles and bull −4%'},s:{k:'spread',v:-.02,t:'Spread −2%'},h:{k:'comp',v:.5,t:'+0.5 composure'}};
const RUN_CARDS=[
 // ♣ Clubs — scoring
 {id:'r_home',su:'c',r:'c',max:3,n:'Home Bed',s:'Darts at the 20 bed −3% per copy.',e:{t20:-.03},art:'wedge',why:'Most scoring happens on the 20. Tighter 20s means more tons.'},
 {id:'r_sce',su:'c',r:'c',max:3,n:'Scoring Eye',s:'Scoring darts −1.5% per copy.',e:{score:-.015},art:'treble',why:'Every scoring dart lands a little closer. Small, but it stacks.'},
 {id:'r_opener',su:'c',r:'c',max:3,n:'Opener',s:'First dart of every visit −4% per copy.',e:{first:-.04},art:'one',why:'Your first dart each visit sets up the other two.'},
 {id:'r_hot',su:'c',r:'u',max:2,n:'Hot Hand',s:'After a ton-plus visit, your next visit’s scoring darts −8% per copy.',e:{afterTon:-.08},art:'flame',why:'Ride a hot streak: a ton-plus visit makes the next one easier.'},
 {id:'r_groove',su:'c',r:'u',max:2,n:'Grooved',s:'Second and third dart at the same bed −7% per copy.',e:{groove:-.07},art:'three',why:'Follow a dart into the same bed and the next ones group tighter.'},
 {id:'r_hunter',su:'c',r:'r',n:'Treble Hunter',s:'Scoring darts −6%. 180 chases rattle you 30% less.',e:{score:-.06,chase:-.3},art:'treble',why:'Scoring darts tighter, and chasing a 180 shakes you less.'},
 {id:'r_stacked',su:'c',r:'r',n:'Stacked Deck',s:'Scoring darts −2% for every Clubs card you hold.',e:{perC:-.02},art:'stack',why:'Build a Clubs hand and this card grows with it.'},
 {id:'r_machine',su:'c',r:'l',x:'game',n:'Treble Machine',s:'Scoring darts −14%. Doubles +8%.',e:{score:-.14,dbl:.08},art:'treble',why:'Huge scoring, worse doubles. Build-around for big averages.'},
 // ♦ Diamonds — finishing
 {id:'r_dbe',su:'d',r:'c',max:3,n:'Double Eye',s:'Doubles and bull −2% per copy.',e:{dbl:-.02},art:'ring',why:'Doubles and bull land closer. Finishing is where legs are won.'},
 {id:'r_setup',su:'d',r:'c',max:3,n:'Setup Man',s:'With 170 or less left, scoring darts −3% per copy.',e:{setup:-.03},art:'chalk',why:'With a finish in range, your setup darts tighten.'},
 {id:'r_bigd',su:'d',r:'c',max:3,n:'Big Doubles',s:'D20, D16 and D8 −4% per copy.',e:{bigDbl:-.04},art:'ring',why:'The three doubles most routes end on get easier.'},
 {id:'r_cover',su:'d',r:'u',max:2,n:'Cover Shot',s:'After a missed double, the next double −10% per copy.',e:{cover:-.1},art:'ring',why:'Miss a double and the next double is easier. Forgives the first miss.'},
 {id:'r_bullf',su:'d',r:'u',max:2,n:'Bull Finisher',s:'Bull −12% per copy.',e:{bull:-.12},art:'bull',why:'Bull finishes get much easier. Pairs well with Bull Bull routes.'},
 {id:'r_feye',su:'d',r:'r',n:'Finisher’s Eye',s:'Doubles and bull −6%. Match darts shake you 30% less.',e:{dbl:-.06,fin:-.3},art:'eye',why:'Doubles tighter, and match darts rattle you less.'},
 {id:'r_closer',su:'d',r:'r',n:'Closer',s:'Doubles and bull −2% for every Diamonds card you hold.',e:{perD:-.02},art:'stack',why:'Build a Diamonds hand and this card grows with it.'},
 {id:'r_clinical',su:'d',r:'l',x:'game',n:'Clinical',s:'Doubles and bull −20%. Scoring darts +6%.',e:{dbl:-.2,score:.06},art:'bull',why:'Elite doubles, slightly looser scoring. Build-around for finishing.'},
 // ♠ Spades — arm
 {id:'r_grp',su:'s',r:'c',max:3,n:'Grouping',s:'Spread −1.5% per copy.',e:{spread:-.015},art:'three',why:'Every dart lands a little closer. The plainest upgrade there is.'},
 {id:'r_std',su:'s',r:'c',max:3,n:'Steady',s:'Sway −3% per copy.',e:{sway:-.03},art:'dart',why:'The crosshair drifts less while you aim.'},
 {id:'r_soft',su:'s',r:'c',max:3,n:'Soft Release',s:'Release window +2% per copy.',e:{win:.02},art:'wave',why:'A wider timing window on the release: easier to hit the stop.'},
 {id:'r_rhythm',su:'s',r:'c',max:3,n:'Rhythm',s:'Your pull speed varies less from dart to dart: −6% per copy. Easier to time.',e:{jit:-.06},art:'wave',why:'The pull speed varies less, so timing feels the same each dart.'},
 {id:'r_third',su:'s',r:'u',max:2,n:'Third Dart',s:'Third dart of every visit −6% per copy.',e:{third:-.06},art:'three',why:'Third dart of the visit tightens, where checkouts usually end.'},
 {id:'r_dead',su:'s',r:'u',max:2,n:'Dead Eye',s:'Smallest circle −6% per copy.',e:{floor:-.06},art:'eye',why:'The smallest the circle can get gets smaller. Rewards good timing.'},
 {id:'r_oiled',su:'s',r:'r',n:'Oiled',s:'+1 Arm now (Arm = how steady your throwing arm is; higher means tighter groups). Arm then builds 60% faster.',e:{armGrow:.6},on:{arm:1},art:'dart',why:'Instant arm boost, and the arm keeps growing faster.'},
 {id:'r_drilled',su:'s',r:'r',n:'Well Drilled',s:'Spread −1.5% for every Spades card you hold.',e:{perS:-.015},art:'stack',why:'Build a Spades hand and this card grows with it.'},
 {id:'r_iron',su:'s',r:'l',x:'arm',n:'Iron Wrist',s:'Spread −10%. Release window −25%: perfect or nothing.',e:{spread:-.1,win:-.25},art:'dart',why:'Much tighter darts but the timing window shrinks hard. For precise players.'},
 {id:'r_loose',su:'s',r:'l',x:'arm',n:'Loose Arm',s:'Release window +25%. Spread +4%.',e:{win:.25,spread:.04},art:'wave',why:'Easy timing, slightly looser darts. For players who rush the release.'},
 // ♥ Hearts — head
 {id:'r_calm',su:'h',r:'c',max:3,n:'Calm',s:'+0.25 composure per copy.',e:{comp:.25},art:'pulse',why:'Composure soaks up nerves before they reach your arm.'},
 {id:'r_breath',su:'h',r:'c',max:3,n:'Deep Breath',s:'Adrenaline fades 15% faster per copy.',e:{decay:.15},art:'rings',why:'Heart rate comes down faster after a big moment.'},
 {id:'r_skin',su:'h',r:'c',max:3,n:'Thick Skin',s:'Venue pressure −8% per copy.',e:{press:-.08},art:'shield',why:'Big venues rattle you less.'},
 {id:'r_warm',su:'h',r:'u',n:'Warm-up',s:'First visit of each leg carries no nerves.',e:{warm:1},art:'rings',why:'The first visit of every leg is thrown with no nerves at all.'},
 {id:'r_comeback',su:'h',r:'u',max:2,n:'Comeback',s:'Behind in legs: spread −6% per copy.',e:{behind:-.06},art:'pulse',why:'When you are behind, your darts tighten.'},
 {id:'r_front',su:'h',r:'u',max:2,n:'Front Runner',s:'Ahead in legs: spread −4% per copy.',e:{ahead:-.04},art:'crown',why:'When you are ahead, your darts tighten.'},
 {id:'r_wall',su:'h',r:'r',n:'Backs to the Wall',s:'On your last life, spread −10%.',e:{lastLife:-.1},art:'heart1',why:'On your last life everything tightens. A safety net.'},
 {id:'r_wind',su:'h',r:'r',n:'Second Wind',s:'+1 life now.',e:{},on:{life:1},art:'heart',why:'One more life. Nothing else.'},
 {id:'r_needle',su:'h',r:'r',n:'Needle',s:'Opponents average about 3% worse against you.',e:{opp:.03},art:'needle',why:'Every opponent you face plays a little worse.'},
 {id:'r_court',su:'h',r:'r',n:'King’s Court',s:'+0.3 composure for every Hearts card you hold.',e:{perH:.3},art:'crown',why:'Build a Hearts hand and this card grows with it.'},
 {id:'r_ice',su:'h',r:'l',x:'head',n:'Ice in the Veins',s:'Nerves never widen your spread. Composure stops growing.',e:{noNerves:1},art:'ice',why:'Nerves can never widen your spread. Composure stops growing.'},
 {id:'r_allin',su:'h',r:'l',x:'head',n:'All In',s:'Lives become 1. Spread −12%. Drafts show one more card.',e:{spread:-.12,hand:1},on:{lives1:1},art:'heart1',why:'Drop to one life for a big permanent tighten and bigger drafts. A gamble.'},
 // ★ Wild
 {id:'r_scout',su:'w',r:'u',n:'Scout',s:'See opponents’ form. Drafts show one more card.',e:{scout:1,hand:1},art:'eye',why:'See how opponents are playing and get an extra card every draft.'},
 {id:'r_mull',su:'w',r:'u',n:'Mulligan',s:'One free reroll in every draft.',e:{reroll:1},art:'cards',why:'Do not like the draft? Swap it once, every time.'},
 {id:'r_study',su:'w',r:'r',n:'Quick Study',s:'Attribute experience +25%.',e:{xp:.25},art:'book',why:'Attributes level faster for the rest of the run.'}];
// ===== card art (procedural, cached) =====
const _ART={};
function cardArt(kind,col){const key=kind+col;if(_ART[key])return _ART[key];const W=300,H=220;const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 // backdrop: felt + vignette
 x.fillStyle='#0d1117';x.fillRect(0,0,W,H);const g=x.createRadialGradient(W/2,H*.55,10,W/2,H*.55,W*.7);g.addColorStop(0,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<900;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.04})`;x.fillRect(Math.random()*W,Math.random()*H,1.2,1.2);}
 const C=col,K='#0b0e12',CH='#e9e4d8',RD='#e2362f',GN='#1f7a3a';x.lineCap='round';x.lineJoin='round';
 const cx=W/2,cy=H/2;
 const dart=(px,py,ang,len,c1)=>{x.save();x.translate(px,py);x.rotate(ang);x.strokeStyle='#cfd3d8';x.lineWidth=5;x.beginPath();x.moveTo(-len*.5,0);x.lineTo(len*.15,0);x.stroke();x.fillStyle='#7a7f86';x.beginPath();x.moveTo(len*.15,-3);x.lineTo(len*.5,0);x.lineTo(len*.15,3);x.fill();x.fillStyle=c1||RD;x.beginPath();x.moveTo(-len*.5,0);x.lineTo(-len*.72,-14);x.lineTo(-len*.62,0);x.lineTo(-len*.72,14);x.closePath();x.fill();x.strokeStyle='#555';x.lineWidth=2;x.beginPath();x.moveTo(-len*.5,0);x.lineTo(-len*.3,0);x.stroke();x.restore();};
 const board=(r,hl)=>{ // partial board rings centered at cx,cy with a highlighted band/segment
  for(let i=0;i<20;i++){const a0=(i*18-99)*Math.PI/180,a1=a0+18*Math.PI/180;x.fillStyle=i%2?'#1a1d21':'#e5dfd0';x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,r,a0,a1);x.fill();x.fillStyle=i%2?GN:RD;x.beginPath();x.arc(cx,cy,r,a0,a1);x.arc(cx,cy,r*.92,a1,a0,true);x.fill();x.beginPath();x.arc(cx,cy,r*.6,a0,a1);x.arc(cx,cy,r*.54,a1,a0,true);x.fill();}
  x.fillStyle=GN;x.beginPath();x.arc(cx,cy,r*.1,0,7);x.fill();x.fillStyle=RD;x.beginPath();x.arc(cx,cy,r*.045,0,7);x.fill();x.strokeStyle='#999';x.lineWidth=1;for(let k of[1,.92,.6,.54,.1])x.beginPath(),x.arc(cx,cy,r*k,0,7),x.stroke();
  if(hl)hl(r);};
 const glow=(fn)=>{x.save();x.shadowColor=C;x.shadowBlur=6;fn();x.restore();};
 switch(kind){
  case 'wedge':{board(150,(r)=>{const a0=-99*Math.PI/180,a1=a0+18*Math.PI/180;glow(()=>{x.fillStyle=C;x.globalAlpha=.9;x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,r,a0,a1);x.fill();x.globalAlpha=1;});x.fillStyle='#fff';x.font='800 34px "Saira Condensed",Arial';x.textAlign='center';x.fillText('20',cx,cy-r+30);});x.translate(0,60);break;}
  case 'treble':{x.save();x.translate(0,70);board(170,(r)=>{const a0=-99*Math.PI/180,a1=a0+18*Math.PI/180;glow(()=>{x.fillStyle=C;x.beginPath();x.arc(cx,cy,r*.6,a0,a1);x.arc(cx,cy,r*.54,a1,a0,true);x.fill();});});x.restore();dart(cx+6,cy-32,-.9,120);break;}
  case 'one':{glow(()=>{x.fillStyle=C;x.font='800 150px "Saira Condensed",Arial';x.textAlign='center';x.fillText('1',cx,cy+56);});dart(cx+70,cy+20,-.7,130);break;}
  case 'three':{glow(()=>{x.fillStyle=C;x.beginPath();x.arc(cx,cy,34,0,7);x.fill();});x.fillStyle=K;x.beginPath();x.arc(cx,cy,24,0,7);x.fill();dart(cx-10,cy-6,-2.2,120);dart(cx+8,cy-2,-2.4,120);dart(cx+2,cy+10,-2.0,120);break;}
  case 'flame':{glow(()=>{x.fillStyle=C;for(let i=0;i<3;i++){const s=1-i*.28;x.globalAlpha=.55+i*.2;x.beginPath();x.moveTo(cx,cy+70*s);x.bezierCurveTo(cx-70*s,cy+40*s,cx-50*s,cy-20*s,cx,cy-80*s);x.bezierCurveTo(cx+50*s,cy-20*s,cx+70*s,cy+40*s,cx,cy+70*s);x.fill();}x.globalAlpha=1;});dart(cx+2,cy+6,-1.57,110,'#fff');break;}
  case 'stack':{for(let i=0;i<4;i++){x.save();x.translate(cx-30+i*20,cy+10-i*8);x.rotate(-.25+i*.12);x.fillStyle=i===3?C:'#1c222a';x.strokeStyle=i===3?'#fff':'#39424d';x.lineWidth=2;x.beginPath();x.roundRect(-45,-62,90,124,8);x.fill();x.stroke();if(i===3){x.fillStyle=K;x.font='800 40px Arial';x.textAlign='center';x.fillText(RSUIT[Object.keys(RSUIT).find(k=>RSUIT[k].col===C)||'w'].g,0,14);}x.restore();}break;}
  case 'ring':{x.save();x.translate(0,80);board(190,(r)=>{glow(()=>{x.strokeStyle=C;x.lineWidth=14;x.beginPath();x.arc(cx,cy,r*.96,-2.2,-.94);x.stroke();});});x.restore();dart(cx-60,cy-38,-.5,120);break;}
  case 'chalk':{x.fillStyle='#1c2a1f';x.fillRect(40,30,220,160);x.strokeStyle='#5a4631';x.lineWidth=8;x.strokeRect(40,30,220,160);x.strokeStyle=CH;x.lineWidth=3;x.font='700 44px "Caveat","Comic Sans MS",cursive';x.fillStyle=CH;x.textAlign='center';x.fillText('170',cx,92);x.fillText('T20 T20',cx,136);glow(()=>{x.fillStyle=C;x.fillText('BULL',cx,178);});break;}
  case 'bull':{x.save();x.translate(0,0);board(240,(r)=>{glow(()=>{x.fillStyle=C;x.beginPath();x.arc(cx,cy,r*.1,0,7);x.fill();});});x.restore();dart(cx+30,cy-22,-.75,130);break;}
  case 'eye':{glow(()=>{x.strokeStyle=C;x.lineWidth=7;x.beginPath();x.moveTo(cx-110,cy);x.quadraticCurveTo(cx,cy-95,cx+110,cy);x.quadraticCurveTo(cx,cy+95,cx-110,cy);x.stroke();});x.fillStyle=C;x.beginPath();x.arc(cx,cy,34,0,7);x.fill();x.fillStyle=K;x.beginPath();x.arc(cx,cy,16,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx+10,cy-12,6,0,7);x.fill();break;}
  case 'dart':{glow(()=>{dart(cx,cy,-.35,220,C);});break;}
  case 'wave':{glow(()=>{x.strokeStyle=C;x.lineWidth=8;x.beginPath();for(let i=0;i<=60;i++){const px=30+i*4,py=cy+Math.sin(i*.25)*(40*(1-i/80));i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();});x.fillStyle='#fff';x.beginPath();x.arc(270,cy,8,0,7);x.fill();break;}
  case 'pulse':{glow(()=>{x.strokeStyle=C;x.lineWidth=7;x.beginPath();const pts=[[20,cy],[90,cy],[110,cy-20],[128,cy+60],[148,cy-80],[166,cy+30],[180,cy],[280,cy]];pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();});break;}
  case 'rings':{glow(()=>{x.strokeStyle=C;for(let i=0;i<4;i++){x.globalAlpha=1-i*.22;x.lineWidth=6-i;x.beginPath();x.arc(cx,cy,24+i*28,0,7);x.stroke();}x.globalAlpha=1;});x.fillStyle=C;x.beginPath();x.arc(cx,cy,10,0,7);x.fill();break;}
  case 'shield':{glow(()=>{x.fillStyle=C;x.beginPath();x.moveTo(cx,cy-90);x.lineTo(cx+80,cy-60);x.quadraticCurveTo(cx+80,cy+60,cx,cy+95);x.quadraticCurveTo(cx-80,cy+60,cx-80,cy-60);x.closePath();x.fill();});x.fillStyle=K;x.beginPath();x.moveTo(cx,cy-66);x.lineTo(cx+58,cy-44);x.quadraticCurveTo(cx+58,cy+44,cx,cy+70);x.quadraticCurveTo(cx-58,cy+44,cx-58,cy-44);x.closePath();x.fill();x.fillStyle=C;x.font='800 44px "Saira Condensed",Arial';x.textAlign='center';x.fillText('TOPS',cx,cy+16);break;}
  case 'crown':{glow(()=>{x.fillStyle=C;x.beginPath();x.moveTo(cx-100,cy+50);x.lineTo(cx-110,cy-40);x.lineTo(cx-50,cy);x.lineTo(cx,cy-80);x.lineTo(cx+50,cy);x.lineTo(cx+110,cy-40);x.lineTo(cx+100,cy+50);x.closePath();x.fill();x.fillRect(cx-100,cy+58,200,18);});x.fillStyle=K;[[-50,20],[0,10],[50,20]].forEach(([dx,dy])=>{x.beginPath();x.arc(cx+dx,cy+dy,8,0,7);x.fill();});break;}
  case 'heart':case 'heart1':{const hrt=(px,py,s,fill)=>{x.beginPath();x.moveTo(px,py+s*.9);x.bezierCurveTo(px-s*1.2,py,px-s*.6,py-s*.9,px,py-s*.3);x.bezierCurveTo(px+s*.6,py-s*.9,px+s*1.2,py,px,py+s*.9);x.closePath();fill?x.fill():x.stroke();};
   if(kind==='heart'){glow(()=>{x.fillStyle=C;hrt(cx,cy,70,true);});x.fillStyle='#fff';x.font='800 60px "Saira Condensed",Arial';x.textAlign='center';x.fillText('+1',cx,cy+22);}
   else{x.strokeStyle='#39424d';x.lineWidth=4;hrt(cx-85,cy,36,false);hrt(cx+85,cy,36,false);glow(()=>{x.fillStyle=C;hrt(cx,cy,56,true);});}break;}
  case 'needle':{glow(()=>{x.strokeStyle=C;x.lineWidth=5;x.beginPath();x.moveTo(40,cy+60);x.lineTo(250,cy-50);x.stroke();});x.fillStyle=C;x.beginPath();x.moveTo(250,cy-50);x.lineTo(275,cy-64);x.lineTo(262,cy-38);x.fill();x.fillStyle='#fff';x.font='700 22px Arial';x.textAlign='center';x.fillText('*cough*',cx-40,cy-50);break;}
  case 'ice':{glow(()=>{x.strokeStyle=C;x.lineWidth=6;for(let i=0;i<6;i++){const a=i*Math.PI/3;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*90,cy+Math.sin(a)*90);x.stroke();for(const k of[.45,.7]){const bx=cx+Math.cos(a)*90*k,by=cy+Math.sin(a)*90*k;x.beginPath();x.moveTo(bx,by);x.lineTo(bx+Math.cos(a+.9)*22,by+Math.sin(a+.9)*22);x.moveTo(bx,by);x.lineTo(bx+Math.cos(a-.9)*22,by+Math.sin(a-.9)*22);x.stroke();}}});break;}
  case 'cards':{for(let i=0;i<2;i++){x.save();x.translate(cx-28+i*56,cy+8);x.rotate(-.2+i*.4);x.fillStyle='#e9e4d8';x.strokeStyle='#777';x.lineWidth=2;x.beginPath();x.roundRect(-42,-60,84,120,8);x.fill();x.stroke();x.fillStyle=i?C:K;x.font='800 44px Arial';x.textAlign='center';x.fillText(i?'↻':'?',0,16);x.restore();}break;}
  case 'book':{x.fillStyle='#2a1f16';x.beginPath();x.roundRect(cx-100,cy-70,200,140,6);x.fill();x.fillStyle='#e9e4d8';x.fillRect(cx-92,cy-62,88,124);x.fillRect(cx+4,cy-62,88,124);x.strokeStyle='#999';x.lineWidth=2;for(let i=0;i<5;i++){x.beginPath();x.moveTo(cx-80,cy-40+i*22);x.lineTo(cx-16,cy-40+i*22);x.moveTo(cx+16,cy-40+i*22);x.lineTo(cx+80,cy-40+i*22);x.stroke();}glow(()=>{x.fillStyle=C;x.font='800 40px "Saira Condensed",Arial';x.textAlign='center';x.fillText('XP',cx+48,cy+14);});break;}
  default:{glow(()=>{x.fillStyle=C;x.beginPath();x.arc(cx,cy,60,0,7);x.fill();});}
 }
 // frame
 x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=2;x.strokeRect(1,1,W-2,H-2);
 return _ART[key]=cv.toDataURL('image/png');}
const ROMAN=['','I','II','III','IV','V'];
function cardEl(p,opts){opts=opts||{};const suK=perkSuit(p);const su=RSUIT[suK],lv=plv(p.id);const rr=perkRar(p);const el=document.createElement(opts.pick?'button':'div');if(opts.pick)el.type='button';el.className='pcard rr-'+rr+' su-'+suK+(opts.small?' sm':'')+(opts.pick?' pick':'');
 const nxt=opts.pick&&p.max&&p.max>1?` <i>${ROMAN[Math.min(5,lv+1)]}</i>`:(!opts.pick&&p.max&&p.max>1?` <i>${ROMAN[Math.min(5,lv)]}</i>`:'');
 el.style.setProperty('--su',su.col);el.innerHTML=`<div class="rc-top"><span class="rc-pip">${su.g}</span><span class="rc-rar">${p.r==='k'?'◆ Keystone':p.r==='f'?'Cash':(rr==='l'?'◆ ':rr==='r'?'••• ':rr==='u'?'•• ':'• ')+(RRAR[rr]?RRAR[rr].n:'')}</span></div><div class="rc-art"><img alt="" src="${cardArt(perkArt(p),su.col)}"></div><div class="rc-name">${p.n}${nxt}</div><div class="rc-text"><b class="rc-eff">${p.s}</b>${p.why?`<span class="rc-why">${p.why}</span>`:''}${p.x?` <em>Locks the other ${PERK_X[p.x]} legendary.</em>`:''}</div><div class="rc-bot"><span>${su.n}${su.t!==su.n?' · '+su.t:''}</span><span class="rc-pip">${su.g}</span></div>`;return el;}
function applyCardPick(p){const c=career();if(p.r==='f'){if(c)c.bank+=p.cash;}else{save.perks=Object.assign({},save.perks||{});save.perks[p.id]=plv(p.id)+1;}if(p.on){if(p.on.arm)save.arm=Math.min(10,save.arm+p.on.arm);if(p.on.life&&c)c.lives=Math.min(5,(c.lives||0)+p.on.life);if(p.on.lives1&&c)c.lives=1;}if(c){c.drafts=(c.drafts||0)+1;c.featBoost=false;}_SK=null;persist();}

function perkSuit(p){if(p.su)return p.su;const e=p.e||{};if(p.x==='arm'||e.spread||e.win||e.sway||e.jit||e.armGrow)return 's';if(p.x==='game'&&e.score)return 'c';if(e.dbl||e.fin||e.cover)return 'd';if(e.score||e.chase||e.groove)return 'c';if(e.comp||e.press||e.warm||e.noNerves)return 'h';return 'w';}
function perkArt(p){if(p.art)return p.art;const e=p.e||{};if(e.dbl||e.cover)return 'ring';if(e.fin)return 'eye';if(e.score||e.groove)return 'treble';if(e.chase)return 'flame';if(e.spread)return 'three';if(e.win||e.jit)return 'wave';if(e.sway||e.armGrow)return 'dart';if(e.comp)return 'pulse';if(e.press)return 'shield';if(e.warm)return 'rings';if(e.noNerves)return 'ice';if(e.xp)return 'book';if(e.prize||e.fee||p.r==='f')return 'cards';return 'dart';}
function perkRar(p){return p.r==='k'?'l':p.r==='f'?'c':p.r;}
function cardDef(id){return PERKS.find(p=>p.id===id)||RUN_CARDS.find(p=>p.id===id);}
function suitCount(su){let n=0;Object.entries(save.perks||{}).forEach(([id,lv])=>{const p=RUN_CARDS.find(q=>q.id===id);if(p&&p.su===su)n+=(typeof lv==='number'?lv:(lv?1:0));});return n;}
function flushTier(su){const n=suitCount(su);return n>=5?2:n>=3?1:0;}
function plv(id){const v=save.perks&&save.perks[id];return typeof v==='number'?v:(v?1:0);}
function has(id){return plv(id)>0;}
function perkLocked(p){return !!(p.x&&PERKS.concat(RUN_CARDS).some(q=>q.x===p.x&&q.id!==p.id&&has(q.id)));}
function draftCards(n,boost,lost){const c=career()||{};const drafts=c.drafts||0;if(c.run)return draftRun(n+(SK().hand||0),lost);const pool=PERKS.filter(p=>!perkLocked(p)&&(p.r==='c'?plv(p.id)<(p.max||1):!has(p.id)));
 const w=p=>p.r==='c'?1.0:p.r==='r'?Math.min(.6,.22+.03*drafts)*(boost?2.5:1):(drafts>=6?.12:0);
 const out=[];const bag=pool.slice();while(out.length<n&&bag.length){const tot=bag.reduce((a,p)=>a+w(p),0);let r=Math.random()*tot,pick=bag[bag.length-1];for(const p of bag){r-=w(p);if(r<=0){pick=p;break;}}bag.splice(bag.indexOf(pick),1);if(pick.x&&out.some(o=>o.x===pick.x))continue;out.push(pick);}
 // filler: a brown envelope or a training block so a weak draft still gives something
 if(out.length<n){const t=TIERS[c.tier||0];out.push({id:'cash',n:'Brown envelope',s:`${money(Math.round((t.purse||20)*.4))} from the kitty.`,r:'f',cash:Math.round((t.purse||20)*.4)});}
 return out;}
function draftRun(n,lost){const c=career()||{};const drafts=c.drafts||0;const pool=RUN_CARDS.filter(p=>!perkLocked(p)&&plv(p.id)<(p.max||1)&&!(p.id==='r_wind'&&(c.lives||0)>=4));
 const held={};['c','d','s','h'].forEach(su=>held[su]=suitCount(su));
 const rr=(k)=>rseed('draft'+drafts+'-'+(c.rerolls||0)+'-'+k);let rk=0;const w=p=>{let b=RRAR[p.r].w;if(p.r==='r')b+=.02*drafts;if(p.r==='l')b=drafts>=3?.06+.015*drafts:0;if(lost&&p.su==='h')b*=1.6;if(held[p.su]>=2)b*=1.25;if(p.e&&(p.e.perC||p.e.perD||p.e.perS||p.e.perH)){const su=p.su;b*=held[su]>=2?1.6:.7;}return b;};
 const out=[];const bag=pool.slice();while(out.length<n&&bag.length){const tot=bag.reduce((a,p)=>a+w(p),0);if(tot<=0)break;let r=rr(rk++)*tot,pick=bag[bag.length-1];for(const p of bag){r-=w(p);if(r<=0){pick=p;break;}}bag.splice(bag.indexOf(pick),1);if(pick.x&&out.some(o=>o.x===pick.x))continue;if(pick.r==='l'&&out.some(o=>o.r==='l'))continue;out.push(pick);}
 return out;}
let _SK=null;
function SK(){if(S&&S.mp)return SK_ZERO;if(_SK)return _SK;const e={spread:0,score:0,dbl:0,sway:0,win:0,comp:0,press:0,prize:0,fee:0,chase:0,fin:0,groove:0,cover:0,jit:0,xp:0,armGrow:0,t20:0,first:0,third:0,afterTon:0,setup:0,bigDbl:0,bull:0,behind:0,ahead:0,lastLife:0,floor:0,decay:0,opp:0,hand:0,reroll:0,perC:0,perD:0,perS:0,perH:0};Object.entries(save.perks||{}).forEach(([id,lv])=>{const p=cardDef(id);const L=typeof lv==='number'?lv:(lv?1:0);if(!p||!L)return;Object.entries(p.e).forEach(([k,v])=>{e[k]=(e[k]||0)+v*L;});});
 if(isRun()){const nC=suitCount('c'),nD=suitCount('d'),nS=suitCount('s'),nH=suitCount('h');e.score+=e.perC*nC;e.dbl+=e.perD*nD;e.spread+=e.perS*nS;e.comp+=e.perH*nH;['c','d','s','h'].forEach(su=>{const ft=flushTier(su);if(ft){const f=FLUSH[su];e[f.k]+=f.v*ft;}});}
 e.score+=-.007*lvOf('sc');e.dbl+=-.009*lvOf('fi');e.comp+=.4*lvOf('co');e.win+=.01*lvOf('cn');_SK=e;return e;}
// feats: one-off career achievements; each unlocks a perk pick
const FEATS=[
 {id:'f_bullout',n:'On the bull',s:'Finish a leg on the bull',c:(m)=>m.lastOut&&m.lastOut[m.lastOut.length-1]==='BULL',p:c=>[(c.bullOuts||0)>0?1:0,(c.bullOuts||0)?'done':'not yet']},
 {id:'f_twobull',n:'Show-off',s:'Two bulls in one checkout',c:(m)=>m.lastOut&&m.lastOut.filter(l=>l==='BULL').length>=2,p:c=>[(c.dblBull||0)>0?1:0,(c.dblBull||0)?'done':'not yet']},
 {id:'f_respect5',n:'Crowd pleaser',s:'Five respect finishes in a career',c:(m,c)=>(c.respect||0)>=5,p:c=>[Math.min(1,(c.respect||0)/5),(c.respect||0)+' of 5']},
 {id:'f_win',n:'First blood',s:'Win a match',c:(m,c,M)=>M.won,p:c=>[c.wins>0?1:0,c.wins>0?'done':'not yet']},
 {id:'f_ton',n:'Ton up',s:'Hit a 100+ visit',c:m=>m.bestVisit>=100,p:c=>[c.best.visit/100,'best visit '+c.best.visit]},
 {id:'f_140',n:'One-forty',s:'Hit a 140',c:m=>m.bestVisit>=140,p:c=>[c.best.visit/140,'best visit '+c.best.visit]},
 {id:'f_180',n:'Maximum',s:'Hit a 180',c:m=>m.t180>=1,p:c=>[c.best.visit/180,'best visit '+c.best.visit]},
 {id:'f_co50',n:'Fifty out',s:'Check out 50 or more',c:m=>m.hf>=50,p:c=>[c.best.hf/50,'best finish '+(c.best.hf||'–')]},
 {id:'f_co100',n:'Ton-plus finish',s:'A 100+ checkout',c:m=>m.hf>=100,p:c=>[c.best.hf/100,'best finish '+(c.best.hf||'–')]},
 {id:'f_avg60',n:'Sixty',s:'Average 60+ in a match',c:m=>avg(m)>=60,p:c=>[c.best.avg/60,'best '+c.best.avg.toFixed(1)]},
 {id:'f_dec',n:'Closer',s:'Win a decider',c:(m,c,M)=>M.won&&M.decider,p:c=>[c.best.dec?1:0,c.best.dec?'done':'not yet']},
 {id:'f_white',n:'Whitewash',s:'Win a match without dropping a leg',c:(m,c,M)=>M.won&&M.p[1].legs===0&&!M.practice&&M.bestOf>=3,p:c=>[c.best.white?1:0,c.best.white?'done':'not yet']},
 {id:'f_rival',n:'Shut him up',s:'Beat Deano Marsh',c:(m,c,M)=>M.won&&M.rival,p:c=>[(c.rivalW||0)>0?1:0,(c.rivalW||0)>0?'done':(c.rivalL?'lost '+c.rivalL:'not yet')]},
 {id:'f_streak',n:'On a run',s:'Win five in a row',c:(m,c)=>(c.streak||0)>=5,p:c=>[(c.streak||0)/5,'streak '+(c.streak||0)]},
 {id:'f_leg18',n:'Eighteen',s:'Win a leg in 18 darts or fewer',c:m=>m.bestLeg<=18,p:c=>[c.best.leg<=18?1:0,'best leg '+(c.best.leg<99?c.best.leg+' darts':'–')+' · target 18']},
 {id:'f_tons5',n:'Heavy scoring',s:'Five tons in one match',c:m=>m.tons>=5,p:c=>[c.best.tons/5,'best '+c.best.tons+' in a match']},
 {id:'f_avg80',n:'Eighty',s:'Average 80+ in a match',c:m=>avg(m)>=80,p:c=>[c.best.avg/80,'best '+c.best.avg.toFixed(1)]},
 {id:'f_promo',n:'Moving up',s:'Win promotion from a tier',c:(m,c,M)=>M.after==='promo',p:c=>[c.tier>0?1:0,c.tier>0?'done':'not yet']},
 {id:'f_2x180',n:'Two maximums',s:'Two 180s in one match',c:m=>m.t180>=2,p:c=>[c.best.t180/2,'best '+c.best.t180+' in a match']},
 {id:'f_leg15',n:'Fifteen',s:'A 15-dart leg or better',c:m=>m.bestLeg<=15,p:c=>[c.best.leg<=15?1:0,'best leg '+(c.best.leg<99?c.best.leg+' darts':'–')+' · target 15']},
 {id:'f_co120',n:'Big finish',s:'Check out 120 or more',c:m=>m.hf>=120,p:c=>[c.best.hf/120,'best finish '+(c.best.hf||'–')]},
 {id:'f_avg95',n:'Ninety-five',s:'Average 95+ in a match',c:m=>avg(m)>=95,p:c=>[c.best.avg/95,'best '+c.best.avg.toFixed(1)]},
 {id:'f_leg12',n:'Twelve',s:'A 12-dart leg or better',c:m=>m.bestLeg<=12,p:c=>[c.best.leg<=12?1:0,'best leg '+(c.best.leg<99?c.best.leg+' darts':'–')+' · target 12']},
 {id:'f_170',n:'The big fish',s:'Check out 170',c:m=>m.hf>=170,p:c=>[c.best.hf/170,'best finish '+(c.best.hf||'–')]},
 {id:'f_nine',n:'Perfect',s:'A nine-dart leg',c:m=>m.bestLeg<=9,p:c=>[c.best.leg<=9?1:0,'best leg '+(c.best.leg<99?c.best.leg+' darts':'–')+' · target 9']}];
function featDone(id){const c=career();return !!(c&&c.feats&&c.feats[id]);}
function featProg(f){const c=career();if(!c)return [0,''];if(featDone(f.id))return [1,'done'];c.best=c.best||{visit:0,hf:0,avg:0,leg:99,tons:0,t180:0};try{const [k,t]=f.p(c);return [Math.max(0,Math.min(1,k||0)),t];}catch(e){return [0,''];}}
function nextFeats(n){return FEATS.filter(f=>!featDone(f.id)).map(f=>({f,k:featProg(f)[0]})).sort((a,b)=>b.k-a.k).slice(0,n);}
function checkFeats(){const c=career();if(!c||S.practice)return [];c.feats=c.feats||{};const me=S.p[0];const got=[];for(const f of FEATS){if(c.feats[f.id])continue;let ok=false;try{ok=f.c(me,c,S);}catch(e){}if(ok){c.feats[f.id]=true;const bonus=Math.round(TIERS[c.tier].purse*.2)||10;c.bank+=bonus;S.earned=(S.earned||0)+bonus;c.featBoost=true;got.push(f);}}S.featsNew=got;if(got.length&&!c.run){S.draftN=Math.max(S.draftN||0,3);}return got;}
function recordBests(){const c=career();if(!c||S.practice)return;const me=S.p[0];const b=c.best=c.best||{visit:0,hf:0,avg:0,leg:99,tons:0,t180:0};b.visit=Math.max(b.visit,me.bestVisit);b.hf=Math.max(b.hf,me.hf);b.avg=Math.max(b.avg,avg(me));b.leg=Math.min(b.leg,me.bestLeg);b.tons=Math.max(b.tons,me.tons);b.t180=Math.max(b.t180,me.t180);if(S.won&&S.decider)b.dec=1;if(S.won&&S.p[1].legs===0&&S.bestOf>=3)b.white=1;
 c.streak=S.won?(c.streak||0)+1:0;c.recent=(c.recent||[]).concat(+avg(me).toFixed(1)).slice(-5);}
function recentAvg(c){const r=(c&&c.recent)||[];return r.length?r.reduce((a,b)=>a+b,0)/r.length:0;}
function xpPop(txt,id){const host=$('xp');if(!host)return;const el=document.createElement('div');el.className='xpp '+id;el.textContent=txt;host.appendChild(el);setTimeout(()=>el.classList.add('go'),20);setTimeout(()=>el.remove(),1900);}
function sfxLevel(){[1320,1660,1980].forEach((f,i)=>noiseBurst({dur:.09,freq:f,q:6,gain:.14,delay:i*.09}));}

const CAL=[[115,5],[110.3,5.5],[105.9,6],[101.1,6.5],[97.2,7],[93.4,7.5],[84.3,9],[73.2,11],[63.5,13],[55.6,15],[47.8,18],[40.9,21],[36.3,24],[31.5,28]];
function sigmaFor(avg){for(let i=0;i<CAL.length-1;i++){const [a1,s1]=CAL[i],[a2,s2]=CAL[i+1];if(avg<=a1&&avg>=a2)return s1+(s2-s1)*(a1-avg)/(a1-a2);}return avg>115?5:28;}
const RIVAL={name:'Deano Marsh',look:{skin:'#f1c9a5',hair:'#c9a35a',hairStyle:'buzz',shirt:'#1c1c1c',beard:1,build:2,pattern:2,trousers:0x111318}};
const BANTER={
 pub:['No pressure, mate.','Oi, whose shout is it?','*cough*','Nice darts. For a fill-in.','Hurry up, the jug\u2019s going flat.','That the best you got?'],
 club:['Steady on.','*cough*','Take your time. Not all night though.'],
 rival:['Fill-in, eh? Cute.','Don\u2019t choke.','That\u2019s a pub arm, that.','Shh. Grown-ups throwing.','Enjoy the drive home.','Board\u2019s that way, champ.'],
 rivalMiss:['Ha! Seen better in the ladies\u2019 league.','Pub arm.','Told ya.','*laughs*'],
 rivalHit:['Lucky.','Even a blind squirrel.','Fluke.'],
 pubMiss:['Unlucky, bro.','Ooh. Nearly.','*snigger*'],
 pubWin:['GET IN!','That\u2019s how it\u2019s done, fill-in.','Chalk that, Jonno!','Too easy.'],
 rivalWin:['Shhhhh.','Sit down.','Told you. Pub arm.','YES. Have that.']};
const RIVAL_MSG={
 heads:{from:'Jonno',lines:["Heads up. You\u2019ve drawn Deano Marsh Thursday.","Pub\u2019s best player and he knows it. Mouth never stops.","Don\u2019t bite. Just throw."],replies:[["Noted",'ok']]},
 lostToRival:[{from:'Deano Marsh',lines:["Told ya. Stick to filling in."],replies:[["Whatever",'ok']]},{from:'Deano Marsh',lines:["Club final and you bottle it. Classic."],replies:[["Next time",'ok']]},{from:'Deano Marsh',lines:["Rep squad\u2019s a bit big for you, eh."],replies:[["We\u2019ll see",'ok']]},{from:'Deano Marsh',lines:["Top 16 and you still can\u2019t beat me. Embarrassing."],replies:[["Keep talking",'ok']]},{from:'Deano Marsh',lines:["See you at Ally Pally. Actually, you won\u2019t."],replies:[["Watch me",'ok']]},{from:'Deano Marsh',lines:["Tour card by post, was it?"],replies:[["Mute",'ok']]},{from:'Deano Marsh',lines:["World champion. Me. Cheers for the warm-up."],replies:[["...",'ok']]}],
 beatRival:[{from:'Jonno',lines:["MATE. You beat Deano. In his own pub.","He\u2019s gone home without finishing his pint. Never seen that."],replies:[["Ha",'ok']]},{from:'Deano Marsh',lines:["Lucky board. Rematch at rep."],replies:[["Any time",'ok']]},{from:'Deano Marsh',lines:["Fine. You can throw. Doesn\u2019t mean you\u2019ll last."],replies:[["Watch",'ok']]},{from:'DPNZ',lines:["Nice win over Marsh. He\u2019s lodged a complaint about the lighting. Again."],replies:[["Of course he has",'ok']]},{from:'Jonno',lines:["Deano\u2019s telling everyone he let you win. Nobody believes him."],replies:[["Good",'ok']]},{from:'Deano Marsh',lines:["Alright. Respect. Little bit.","See you at the Palace."],replies:[["See you there",'ok']]},{from:'Deano Marsh',lines:["Fair play. You earned that.","From the Kauri to a world title. Jonno owes us both a beer."],replies:[["He does",'ok']]}]};
const AINAMES=[['Big Mal','Shazza','Dave Hurring','Pete the Plumber'],['Tama Rewiri','Kev Marsh','Lisa Tane','Shane Bell'],['Tukina Weko','Lance Odgers','Ian Makuch','Terry Jowett'],['Haupai Puha','Ben Robb','Kayden Milne','Jonny Tata'],['Raymond Smith','Craig Caldwell','Warren Parry','Simon Whitlock'],['Ricky Evans','Joe Cullen','Dirk van Duijvenbode','Nathan Aspinall'],['Luke Littler','Michael van Gerwen','Gerwyn Price','Luke Humphries']];
const $=id=>document.getElementById(id);
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0);}
function lookFor(name){const h=hash(name);return {skin:SKINS[h%SKINS.length],hair:HAIRS[(h>>>3)%HAIRS.length],hairStyle:['short','buzz','long','bald'][(h>>>6)%4],shirt:SHIRTS[(h>>>9)%SHIRTS.length],beard:((h>>>12)%3)===0?1:0,build:(h>>>14)%3,pattern:(h>>>16)%3,trousers:[0x1b1e26,0x111318,0x2a2a30][(h>>>18)%3]};}

// ===== PERSISTENCE =====
let save={composure:0,arm:0,matches:0,darts:0,sp:0,skills:{},career:null,setup:{shaft:'med',flight:'standard',point:'std'},ownedSetup:['shaft:short','shaft:med','flight:standard','point:std'],look:{skin:SKINS[1],hair:HAIRS[0],hairStyle:'short',shirt:SHIRTS[1],beard:0},barrel:'assassin',owned:['assassin'],flight:FLIGHTS[0],name:''};
const SAVE_FRESH=JSON.stringify(save);const SEASON=1;
try{const s=JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)||'{}');if(s&&typeof s.composure==='number')save=Object.assign(save,s);}catch(e){}
// Season 1 reset (10 Nov 2026): every old device save is wiped once; progress lives in the cloud only
if(save.season!==SEASON){save=JSON.parse(SAVE_FRESH);save.season=SEASON;try{/* S3: a Season 3 game never touches the Season 2 device save */if(!TOPS_S3FLAG)Object.keys(localStorage).forEach(k=>{if(/^doubleout/.test(k)&&k!=='doubleout_audio'&&k!=='doubleout_s3')localStorage.removeItem(k);});localStorage.setItem(TOPS_SAVE_NS.key,JSON.stringify(save));}catch(e){}}
function persist(){try{localStorage.setItem(TOPS_SAVE_NS.key,JSON.stringify(save));}catch(e){}if(window.NET&&window.NET.user)cloudPush(false);hubBankUpdate();}
// v1.77 #11: the top-right balance follows every save, so a purchase or cash bonus shows straight away (it only refreshed when the hub redrew)
function hubBankUpdate(){try{const c=career(),el=$('hubBank');if(!c||!el)return;const run=!!c.run,lb=el.parentNode.querySelector('.label'),lt=run?'Lives':'Bank',t=run?'\u2665'.repeat(c.lives||0)+'\u2661'.repeat(Math.max(0,3-(c.lives||0))):money(c.bank);if(lb&&lb.textContent!==lt)lb.textContent=lt;if(el.textContent!==t)el.textContent=t;el.classList.toggle('neg',!run&&c.bank<0);}catch(e){}}
(function migrateV4(){if(save.progV4)return;const old=save.perks;if(Array.isArray(old)){const map={grouping:'grp',steady:'std',eye:'eye',hunter:'hunter',groove:'groove',warm:'warm',stage:'stage',cover:'cover',negotiator:'negotiator',grinder:'grinder',iron:'iron',loose:'loose',machine:'machine',clinical:'clinical',ice:'ice',showman:'showman'};const m={};let kept=0;old.forEach(id=>{const nid=map[id]||id;if(!PERKS.find(p=>p.id===nid))return;if(kept>=4)return;m[nid]=1;kept++;});save.perks=m;}else if(!old||typeof old!=='object')save.perks={};save.picks=0;save.progV4=1;persist();})();
(function migrateV3(){if(save.progV3)return;const old=save.skills||{};const map={arm_n:'grouping',steady:'steady',groove:'groove',score_n:'hunter',dbl_n:'eye',warm:'warm',nerve_n:'stage',cover:'cover',craft_n:'negotiator',grinder:'grinder',iron:'iron',machine:'machine',clinical:'clinical',ice:'ice',showman:'showman'};save.perks=[];let travel=0;Object.keys(old).forEach(k=>{if(map[k]){const p=PERKS.find(q=>q.id===map[k]);if(p&&!perkLocked(p))save.perks.push(p.id);}else travel++;});save.picks=0;save.perks=Object.fromEntries(save.perks.map(id=>[id,1]));
 const c=save.career;const avgC=c&&c.darts?c.pts/c.darts*3:0;const cl=(v,m)=>Math.max(0,Math.min(m,Math.round(v)));save.attr={sc:{xp:0,lv:cl((avgC-40)/3.5,16)},fi:{xp:0,lv:cl((avgC-40)/4.5,14)},co:{xp:0,lv:cl((save.composure||0)*1.6,16)},cn:{xp:0,lv:cl((save.arm||0)*1.2+(c?c.wins:0)/5,16)}};
 if(c){c.best=c.best||{visit:0,hf:0,avg:avgC,leg:99,tons:0,t180:0};c.feats=c.feats||{};if(c.wins>0)c.feats.f_win=true;if((c.rivalW||0)>0)c.feats.f_rival=true;if(c.tier>0)c.feats.f_promo=true;if(avgC>=60)c.feats.f_avg60=true;if(avgC>=80)c.feats.f_avg80=true;}
 delete save.skills;delete save.sp;save.progV3=1;persist();})();
(function migrate(){const s=save.skills||{};if(save.progV3)return;if(!save.treeV2){let refund=0;for(const k of Object.keys(s)){const v=s[k];refund+=typeof v==='number'?v*(v+1)/2:1;}save.sp=(save.sp||0)+refund;save.skills={};save.treeV2=1;persist();return;}const map={grp1:'grp',grp2:'grp',std1:'std',std2:'std',rel1:'rel',rel2:'rel',tr1:'tr',tr2:'tr',tr3:'tr',db1:'db',db2:'db',db3:'db',ice1:'ice',ice2:'ice',ice3:'ice'};let changed=false;for(const k of Object.keys(s)){if(map[k]){s[map[k]]=(typeof s[map[k]]==='number'?s[map[k]]:0)+1;delete s[k];changed=true;}else if(s[k]===true){s[k]=1;changed=true;}}if(changed){save.skills=s;persist();}})();
function sponsor(){return save.sponsor?SPONSORS.find(s=>s.id===save.sponsor):null;}
function price(p){const s=sponsor();const c=career();const m=(c&&!c.run&&c.tier>=3)?2:1;return Math.round(p*m*(s?1-s.disc:1));}
function gearCount(id){return (save.gear&&save.gear[id])||0;}
function armMult(){if(S&&S.mp)return 1+.35*(1-S.mp.arm);let m=1+.35*(1-save.arm/10);{const c=career();if(c&&!c.run&&c.strain>0&&S&&!S.practice)m*=1.06;}m*=1+SK().spread;return m;}
function jitter(){const nv=S?effNerves():0;let j=(.09+.04*nv)*(1-.03*lvOf('cn'))*Math.max(.4,1+SK().jit);if(S&&S.pub&&S.pub.p[S.cur]&&!betBuffActive('hot'))j*=1+.09*Math.min(8,S.pub.p[S.cur].lvl);return j;}
function targetMult(){if(!S)return 1;const tgt=scoreAt(S.aim.x,S.aim.y);const lbl=tgt.label;let m=1;const e=SK();if(tgt.dbl){m*=1+e.dbl;if(S.lastMissDbl)m*=1+e.cover;}else{m*=1+e.score;if(S.dart>1&&S.lastAim===lbl)m*=1+e.groove;}
 if(isRun()&&S.p){const me=S.p[S.cur],op=oppOf(S.cur)||me;const c=career();const bull=tgt.n===25;if(e.t20&&tgt.n===20&&!tgt.dbl)m*=1+e.t20;if(e.first&&S.dart===1)m*=1+e.first;if(e.third&&S.dart===3)m*=1+e.third;if(e.afterTon&&(me.lastVisit||0)>=100)m*=1+e.afterTon;if(e.setup&&!tgt.dbl&&me.score<=170)m*=1+e.setup;if(e.bigDbl&&tgt.dbl&&!bull&&(tgt.n===20||tgt.n===16||tgt.n===8))m*=1+e.bigDbl;if(e.bull&&bull)m*=1+e.bull;if(e.behind&&me.legs<op.legs)m*=1+e.behind;if(e.ahead&&me.legs>op.legs)m*=1+e.ahead;if(e.lastLife&&c&&c.run&&c.lives===1)m*=1+e.lastLife;}
 return m;}
function swayMult(){if(S&&S.mp)return pubSway();let m=(gearCount('case')?.92:1)*setupSwayMult();m*=1+SK().sway;return m;}
function tolMult(){return (1+SK().win)*setupTolMult();}
function compEff(){const c=career();return gearCount('coach')*.4+SK().comp+((c&&!c.run&&c.buffComp&&S&&!S.practice&&!S.local&&!S_money)?c.buffComp:0);}
function barrel(){return BARRELS.find(b=>b.id===save.barrel)||BARRELS[0];}
/* #20e: setupParts runs several times a frame (setupBaseMult/TolMult/SwayMult in the throw maths); cached per setup (callers copy it before changing it) */let _spK=null,_spV=null;function setupParts(){const st=save.setup||{};if(_spV&&_spK&&_spK[0]===st.shaft&&_spK[1]===st.flight&&_spK[2]===st.point)return _spV;_spK=[st.shaft,st.flight,st.point];_spV=Object.freeze(_setupParts(st));return _spV;}
function _setupParts(st){return {shaft:SHAFTS.find(x=>x.id===st.shaft)||SHAFTS[1],fl:FSHAPES.find(x=>x.id===st.flight)||FSHAPES[0],pt:POINTS.find(x=>x.id===st.point)||POINTS[0]};}
function setupBaseMult(){const p=setupParts();return (1+p.fl.base)*(1+p.pt.base);}
function setupTolMult(){const p=setupParts();return (1+p.fl.tol)*(1+p.shaft.tol);}
function setupSwayMult(){const p=setupParts();return 1+p.shaft.sway;}
// ===== AUDIO =====
const AU={ctx:null,on:true,caller:true,crowdGain:null,master:null};try{const a=JSON.parse(localStorage.getItem('doubleout_audio')||'{}');if(typeof a.on==='boolean')AU.on=a.on;if(typeof a.caller==='boolean')AU.caller=a.caller;}catch(e){}
function persistAudio(){try{localStorage.setItem('doubleout_audio',JSON.stringify({on:AU.on,caller:AU.caller}));}catch(e){}}
function speechWarm(){if(speechWarm.done||!('speechSynthesis'in window))return;speechWarm.done=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}catch(e){}}
function audioWarm(){if(audioWarm.done||!AU.ctx)return;audioWarm.done=true;setTimeout(()=>{try{[.5,.7,1,1.3,1.5,2,2.2,2.6].forEach(d=>swBuf(AU.ctx,d));[.05,.06,.08,.12,.5].forEach(d=>nbBuf(AU.ctx,d));}catch(e){}},300);}
/* #20 (Overseer 07:59): what the audio graph is doing, logged once per match in dev.t20.cnt.au: [sources playing now, sources started since
   the last read, the context's state]. Counting only: a start() is passed straight through. */
{const AUC=window.__AUC={live:0,started:0};const wrap=P=>{if(!P||!Object.prototype.hasOwnProperty.call(P,'start')||P.start.__auc)return;const st=P.start;P.start=function(){if(this.__aucS)return st.apply(this,arguments);
   const r=st.apply(this,arguments);/* native first: if it throws, it throws as before and nothing is counted */
   this.__aucS=1;try{AUC.live++;AUC.started++;let done=false;this.addEventListener('ended',()=>{if(!done){done=true;AUC.live--;}},{once:true});}catch(e){}
   /* #20 'no game audio': a sound started while the muted match's context is suspended would wait in the queue and play, with every other one,
      the moment the hub resumes the context (ChatGPT P1). It is stopped at once and later stop() calls on it are ignored, so it never sounds. */
   try{if(window.TOPS_muteOn&&TOPS_muteOn()){this.__q20k=1;SP0.call(this,0);}}catch(e){}return r;};P.start.__auc=1;};
 const SSN=window.AudioScheduledSourceNode&&AudioScheduledSourceNode.prototype,SP0=SSN&&SSN.stop;
 if(SSN&&SP0){SSN.stop=function(){if(this.__q20k)return;return SP0.apply(this,arguments);};}
 try{wrap(window.AudioScheduledSourceNode&&AudioScheduledSourceNode.prototype);wrap(window.AudioBufferSourceNode&&AudioBufferSourceNode.prototype);wrap(window.OscillatorNode&&OscillatorNode.prototype);}catch(e){}
 window.TOPS_AU=()=>{const r=[AUC.live,AUC.started,AU.ctx?AU.ctx.state:'none'];AUC.started=0;return r;};}
function audioWake(){/* ENG-11: iOS leaves the context 'suspended' (made outside a tap) or 'interrupted' (app switch, lock, call); only a resume() inside a tap brings it back. In a 'no game audio' match the context's resume() is held off (#20 A/B), so this does nothing there */try{if(AU.ctx&&AU.ctx.state!=='running'&&AU.ctx.state!=='closed'){const p=AU.ctx.resume();if(p&&p.catch)p.catch(()=>{});}}catch(e){}}
['touchend','pointerup','click','keydown'].forEach(t=>document.addEventListener(t,audioWake,{capture:true,passive:true}));/* the events that count as a tap for audio unlock: the tap that starts the walk-on wakes the context before the walk-on music is queued */
function audioInit(){speechWarm();setTimeout(audioWarm,0);if(AU.ctx){audioWake();return;}try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=AU.ctx=new C();AU.master=c.createGain();AU.master.gain.value=AU.on?1:0;AU.master.connect(c.destination);
 const len=c.sampleRate*3,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*8;}
 const src=c.createBufferSource();src.buffer=buf;src.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=520;bp.Q.value=.6;
 const bp2=c.createBiquadFilter();bp2.type='lowpass';bp2.frequency.value=1400;AU.crowdGain=c.createGain();AU.crowdGain.gain.value=0;src.connect(bp);bp.connect(bp2);bp2.connect(AU.crowdGain);AU.crowdGain.connect(AU.master);src.start();
 const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.07;lg.gain.value=40;lfo.connect(lg);lg.connect(bp.frequency);lfo.start();}catch(e){}}
function crowdSet(level){if(!AU.ctx)return;AU.crowdGain.gain.setTargetAtTime(level*.14,AU.ctx.currentTime,.8);}
const NB_CACHE={};function nbBuf(c,dur){const k=Math.round(dur*100);if(NB_CACHE[k])return NB_CACHE[k];const n=Math.max(1,Math.floor(c.sampleRate*k/100)),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);return NB_CACHE[k]=b;}
function noiseBurst({dur=.05,freq=1800,q=1,gain=.5,type='bandpass',delay=0}){if(!AU.ctx)return;const c=AU.ctx;const s=c.createBufferSource();s.buffer=nbBuf(c,dur);const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.value=gain;s.connect(f);f.connect(g);g.connect(AU.master);s.start(c.currentTime+delay);}
function thump(freq=110,dur=.09,gain=.6,delay=0){if(!AU.ctx)return;const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';const t=c.currentTime+delay;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.5,t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+dur+.02);}
function sfxDartHit(kind,far){const v=far?.45:1;if(kind==='miss'){noiseBurst({dur:.04,freq:3200,q:2,gain:.35*v});thump(240,.05,.2*v);}else if(kind==='wire'){noiseBurst({dur:.03,freq:4200,q:4,gain:.4*v});thump(160,.05,.3*v);}else{noiseBurst({dur:.035,freq:1500+Math.random()*600,q:1.2,gain:.45*v});thump(95+Math.random()*25,.1,.7*v);}}
const SW_CACHE={};function swBuf(c,dur){const k=Math.round(dur*10);if(SW_CACHE[k])return SW_CACHE[k];const n=Math.max(1,Math.floor(c.sampleRate*k/10)),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;l=(l+.05*w)/1.05;const e=Math.sin(Math.PI*i/n);d[i]=l*6*Math.pow(e,.6);}return SW_CACHE[k]=b;}
function sfxSwell(level,dur,freq,q,delay=0){if(!AU.ctx||level<=0)return;const c=AU.ctx,b=swBuf(c,dur);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.value=level;s.connect(f);f.connect(g);g.connect(AU.master);s.start(c.currentTime+delay);}
function sfxCheer(big){const lv=S.tier.crowd;sfxSwell(lv*(big?.9:.5),big?2.2:1.1,1100,.7,.05);if(big)sfxSwell(lv*.5,2.6,600,.8,.1);}
function sfxGroan(){sfxSwell(S.tier.crowd*.45,1.2,320,1.2,.05);}
function sfxClap(){if(!AU.ctx)return;const lv=S.tier.crowd;for(let i=0;i<14;i++)noiseBurst({dur:.02,freq:2200,q:1,gain:lv*.18,delay:.08+i*.07+Math.random()*.03});}
function sfxLock(){noiseBurst({dur:.035,freq:2400,q:4,gain:.08});}
function sfxPerfect(n){if(!AU.ctx)return;const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=880*Math.pow(2,Math.min(7,n||0)/12);g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.08,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0005,c.currentTime+.45);o.connect(g);g.connect(AU.master||c.destination);o.start();o.stop(c.currentTime+.5);try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}}
function sfxHeart(){thump(55,.12,.5);thump(50,.1,.35,.13);}
function sfxPubAmbience(){if(!AU.ctx||S.tier.caller!=='pub')return;if(Math.random()<.004){const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=2400+Math.random()*1800;const t=c.currentTime;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+.4);}}
const NUMW=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function words(n){if(n===0)return 'no score';if(n===100)return 'one hundred';if(n===180)return 'one hundred and eighty';let s='';if(n>=100){s='one hundred and ';n-=100;}if(n<20)s+=NUMW[n];else s+=TENS[Math.floor(n/10)]+(n%10?' '+NUMW[n%10]:'');return s;}
function say(text,style){if(!AU.caller||!AU.on||!('speechSynthesis'in window))return;if(S&&!S.done&&!S.busy&&S.p&&S.p[S.cur]&&!S.p[S.cur].ai&&!S.mateTurn&&!/game shot|match/i.test(text))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const pro=style==='pro';u.rate=pro?.95:1.1;u.pitch=pro?.85:1.0;u.volume=pro?1:.75;const vs=speechSynthesis.getVoices();const pick=vs.find(v=>/en-GB/i.test(v.lang)&&!/female/i.test(v.name))||vs.find(v=>/en-(AU|NZ)/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang));if(pick)u.voice=pick;speechSynthesis.speak(u);}catch(e){}}
function callVisit(total,ctx){const st=S.tier.caller;
 if(ctx==='bust'){say(st==='pro'?'No score.':'Bust.',st);return;}
 if(ctx==='gameshot'){const need=Math.ceil(S.bestOf/2);const w=S.p[S.cur];say(st==='pro'?`Game shot, and the ${w.legs>=need?'match':'leg'}.`:'Game shot.',st);return;}
 if(total===180){say(st==='pro'?'ONE HUNDRED AND EIGHTYYY!':'one eighty! get in!',st);return;}
 if(st==='pub'){say(total===0?'nothing':words(total),st);return;}
 if(st==='club'){say(total===0?'no score':words(total)+(total>=100?' scored':''),st);return;}
 say(words(total),st);}

// ===== STATE =====
let S=null,ui={mode:'career',tier:0,legs:5,venue:0};
const SWEET=0.68,PULL_MS=1250;
function newPlayer(name,ai,sigma,look){return {name,ai,sigma,look,score:501,legs:0,opened:false,pts:0,darts:0,f9pts:0,f9darts:0,t180:0,coAtt:0,coHit:0,hf:0,legDarts:0,busts:0,bestVisit:0,bestLeg:99,tons:0};}
function beginMatch(opts){audioInit();const t=TIERS[opts.tier];ui.mode=opts.mode;ui.tier=opts.tier;
 const p0=newPlayer(opts.p0,false,0,save.look);p0.score=opts.start||501;if(opts.pairs){p0.mate=newPlayer(opts.mateName||'Jonno',true,sigmaFor(opts.mateAvg||t.avg-3),lookFor(opts.mateName||'Jonno'));p0.mate.look.pint=false;p0.disp=p0.name+' & '+p0.mate.name;p0.team=opts.myTeam||'';}
 const p1=opts.mode==='career'?newPlayer(opts.oppName,true,sigmaFor(opts.oppAvg*(isRun()&&!opts.practice?(1-SK().opp):1)),opts.rival?RIVAL.look:Object.assign(lookFor(opts.oppName),{pint:opts.tier===0})):newPlayer(opts.p1,false,0,opts.oppLook||lookFor(opts.p1));p1.score=opts.start||501;if(opts.online){p1.ai=true;}if(p0.mate)p0.mate.score=opts.start||501;p1.rival=!!opts.rival;p1.disp=p1.name;p0.disp=p0.disp||p0.name;p1.team=opts.pairs?(opts.oppTeam||''):'';
 S={p:[p0,p1],cur:0,dart:1,visit:[],visitStart:501,legStarter:0,bestOf:opts.legs,log:[],aim:{x:0,y:-103},sway:{x:0,y:0},pull:0,pulling:false,over:false,busy:true,t0:performance.now(),barrel:barrel(),tier:t,done:false,form:0,myForm:(Math.random()-.5)*.12,
   anim:null,adren:0,hr:72,view:0,throwsMade:0,oppArm:{pull:0,phase:'idle'},oppAvg:opts.oppAvg,decider:!!opts.decider,rival:!!opts.rival,start:opts.start||501,twist:opts.twist||null,oppKey:opts.oppKey||opts.oppName,fee:opts.fee||0,purse:opts.purse||0,intro:!!opts.intro,din:!!opts.din,pairs:!!opts.pairs,practice:!!opts.practice,local:!!opts.local,online:opts.online||null};if(opts.online){S.legStarter=opts.online.first===opts.online.seat?0:1;S.cur=S.legStarter;}
 $('eventTier').textContent=opts.practice?'Practice':(opts.local?'Local night':(opts.mode==='career'?(opts.rival?t.n+' · rival · decider':(opts.decider?t.n+' · decider':t.n)):(opts.online?'Online · live':'Friendly')));$('eventName').textContent=opts.mode==='career'?t.venue:'Best of '+opts.legs;
 $('name0').firstChild.textContent=p0.disp;$('name1').firstChild.textContent=p1.disp;
 showScreen(null);$('hud').hidden=false;$('hint').style.opacity=0;introCard(p0,p1,opts,t);V.buildVenue(opts.tier);V.clearDarts();V.setOpponentLook(p1.look,p1.name,opts.tier);V.setPlayerLook(save.look,save.flight,save.name,opts.tier);crowdSet(t.crowd);setAim(0,-103);V.walkOn();feelMatchStart();if(t.crowd>.4)setTimeout(()=>sfxCheer(t.crowd>.8),300);
 setTimeout(()=>{if(S&&!S.done){if(opts.mode==='career'&&!opts.intro&&!opts.practice){startBullUp();}else{startTurn();setHint();$('hint').style.opacity=1;say(t.caller==='pro'?'Game on!':'Game on.',t.caller);}}},3400);}
function setHint(){const h=$('hint');if(!h)return;h.style.display=(save.totThrows||0)>=12?'none':'';const vert=innerHeight>innerWidth*1.1;const touch=matchMedia('(pointer:coarse)').matches;/* FEEL: copy matches the pull pad */h.innerHTML=vert?`Drag the board to aim · <b>hold the pad below</b> to pull back · let go to throw`:`Drag the board to aim · <b>hold the pad</b>${touch?'':', Space'} or your player to pull back · let go to throw`;}
function startBullUp(){S.bull={me:null,op:null};S.cur=0;S.dart=1;S.visit=[];S.busy=false;S.view=0;setAim(0,0);updateUI();$('outshot').textContent='Bull up: closest to the bull throws first';setHint();$('hint').style.opacity=1;say(S.tier.caller==='pro'?'Throw for the bull.':'Bull up.',S.tier.caller);}
function bullDist(x,y){return Math.hypot(x,y);}
function bullLand(x,y,far){if(!S||!S.bull||(!far&&S.bull.me!=null)||(far&&S.bull.op!=null))return; // v1.46: a second bull dart used to start a second opponent throw chain (4 darts a visit, double-counted average)
 const d=bullDist(x,y);const h=scoreAt(x,y);if(!far){S.bull.me=d;flash(h.label==='BULL'?'Bull':h.label==='25'?'25':'Off',h.label==='BULL'?'gold':'',null);sfxDartHit(h.v?'hit':'miss',false);V.shake();V.punchIn(x,y,700);/* ENG-8 (QA-B2): these timers belong to this match; after a quit (S null) or in the next match they do nothing */const s0=S;setTimeout(()=>{if(S!==s0||!S||S.done||!S.bull)return;S.cur=1;S.view=1;S.busy=true;S.oppArm={pull:0,phase:'idle'};setTimeout(()=>{if(S===s0&&!S.done&&S.bull)aiBull();},900);},1200);}
 else{S.bull.op=d;flash(h.label==='BULL'?'Bull':h.label==='25'?'25':'Off',h.label==='BULL'?'gold':'',null);sfxDartHit(h.v?'hit':'miss',true);const s0=S;setTimeout(()=>{if(S!==s0||!S||S.done||!S.bull)return;const meFirst=S.bull.me<=S.bull.op;S.legStarter=meFirst?0:1;S.cur=S.legStarter;S.bull=null;V.clearDarts();const el=$('intro');$('introTier').textContent='Bull up';$('introVenue').textContent=(meFirst?S.p[0].name:S.p[1].name)+' throws first';$('introP0').textContent=S.p[0].disp;$('introP1').textContent=S.p[1].disp;$('introP0s').textContent=Math.round(S.bull?0:0)+'';$('introP0s').textContent='';$('introP1s').textContent='';$('introFmt').textContent='Game on';el.classList.add('show');say(S.tier.caller==='pro'?'Game on!':'Game on.',S.tier.caller);setTimeout(()=>{el.classList.remove('show');if(S===s0&&!S.done)startTurn();},1500);},1300);}}
function aiBull(){if(!S||S.done)return;const s0=S;/* ENG-8: this bull-up throw belongs to this match */const me=S.p[1];const sig=me.sigma*(1+S.form);const lx=gauss()*sig,ly=gauss()*sig;const seq=[['pull',480],['throw',130],['follow',320],['reset',220]];let si=0,t0=performance.now();S.oppArm={phase:'pull',pull:0,k:0};
 const step=()=>{if(S!==s0||!S||S.done)return;const [ph,dur]=seq[si];const k=Math.min(1,(performance.now()-t0)/dur);if(ph==='pull')S.oppArm={phase:'pull',pull:k,k};else S.oppArm={phase:ph,pull:1,k};if(k<1){requestAnimationFrame(step);return;}
  if(ph==='throw'){const from=V.oppHandWorld();V.fly(from,lx,ly,1,340,.05,()=>{if(S!==s0||!S||S.done)return;bullLand(lx,ly,true);});}
  si++;t0=performance.now();if(si<seq.length){S.oppArm={phase:seq[si][0],pull:1,k:0};requestAnimationFrame(step);}else S.oppArm={phase:'idle',pull:0,k:0};};requestAnimationFrame(step);}
function introCard(p0,p1,opts,t){const el=$('intro');el.classList.remove('leg');el.classList.toggle('chalk',opts.tier<=1&&opts.mode==='career');const c=career();$('introPt0').innerHTML=portraitImg(save.look,save.name,opts.tier);$('introPt1').innerHTML=opts.practice?'':portraitImg(p1.look,p1.name,opts.tier);$('introTier').textContent=opts.mode==='career'?(opts.rival?t.n+' · Rival · Decider':(opts.decider?t.n+' · Decider':t.n)):'Friendly';$('introVenue').textContent=opts.mode==='career'?t.venue:(opts.online?'Live online':'Pass and play');$('introP0').textContent=p0.disp;$('introP1').textContent=opts.practice?'Board':p1.disp;$('introP0s').textContent=opts.mode==='career'?(p0.team?p0.team+' · ':'')+(()=>{const cc=career();if(!cc||!cc.darts)return 'First match on the books';return `Career avg ${(cc.pts/cc.darts*3).toFixed(1)} · ${cc.wins}–${cc.losses}`;})():'';$('introP1s').textContent=opts.mode==='career'?(p1.team?p1.team+' · ':'')+`Averages about ${opts.oppAvg}`:'';$('introFmt').textContent=`${opts.legs===1?'One leg':'First to '+Math.ceil(opts.legs/2)+' legs'} · ${opts.start||501} ${opts.din?'double in, double out':'double out'}${opts.pairs?' · pairs':''}`+(opts.rival&&c?` · H2H ${c.rivalW||0}–${c.rivalL||0}`:'');{const st=$('introStakes');if(st){const mk=(opts.mode==='career'&&c&&c.next&&!opts.practice&&!opts.local&&!opts.money)?matchKind(c.next,c,t):null;st.textContent=mk?mk.kind+' · '+mk.stakes:(opts.practice?'Practice. Nothing on the line.':(opts.local?'Local night. Cash for a win, no promotion pressure.':(opts.money?'Money match. $30 on the line.':'')));}}el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000);}
// ===== 3D SCENE =====
const V=(function(){try{return (()=>{
 // v1.76: shared assets disposeTree must never free (rig/hair templates, cached dart geometry, glow sprite). A WeakSet, not userData.keep, because clones copy userData. Declared first: darts are built during start-up.
 const KEEP=new WeakSet(),TEX_KEYS=['map','alphaMap','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap','bumpMap','specularMap','lightMap','displacementMap','envMap'];
 const T=THREE;
 // GFX: proper colour management (like three r152 ColorManagement). Hex/CSS colours are sRGB in, linear inside, sRGB out.
 if(!window.GFX_LEGACY){const C=T.Color.prototype,S2L=c=>c<.04045?c*.0773993808:Math.pow(c*.9478672986+.0521327014,2.4),L2S=c=>c<.0031308?c*12.92:1.055*Math.pow(c,.41666)-.055;
  const toL=c=>{c.r=S2L(c.r);c.g=S2L(c.g);c.b=S2L(c.b);return c;},toS=c=>new T.Color().setRGB(L2S(c.r),L2S(c.g),L2S(c.b));
  const sh=C.setHex,ss=C.setStyle,shsl=C.setHSL,gh=C.getHex,gst=C.getStyle,ghsl=C.getHSL;
  C.setHex=function(h){sh.call(this,h);return toL(this);};C.setStyle=function(st){ss.call(this,st);return toL(this);};C.setHSL=function(h,s,l){shsl.call(this,h,s,l);return toL(this);};
  C.getHex=function(){return gh.call(toS(this));};C.getHexString=function(){return('000000'+this.getHex().toString(16)).slice(-6);};C.getStyle=function(){return gst.call(toS(this));};C.getHSL=function(t){return ghsl.call(toS(this),t);};
  const CT=T.CanvasTexture;T.CanvasTexture=function(...a){const t=new CT(...a);t.encoding=T.sRGBEncoding;return t;};T.CanvasTexture.prototype=CT.prototype;
  window.GFX_LIN=true;}
 const cv=$('scene');const renderer=new T.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:!!window.__QA_PRESERVE});window.TOPS_R=renderer;/* v13 telemetry reads renderer.info (memory, programs) once per row */
/* R0 #19: keep every shader program three.js links for the whole session. three frees a program as soon as no material uses it, so each match
   teardown, hub rebuild and figure rebuild re-linked the same few dozen programs (521 links of 43 programs on Hayden's path). On iOS every link is
   a main-thread Metal compile, and one of them failed (blank board). A pinned program is found again by its cache key, so each variant links once.
   A program that fails to link is never pinned: it leaves the cache, its materials get one fresh link, then a simpler material with the same
   texture (Lambert, then Basic), so nothing is ever left undrawn. */
const PG={pin:new WeakSet(),n:0,cap:160,fails:0,sc:[]};window.TOPS_PG=PG;
function progSweep(sc){if(sc&&sc.isScene&&PG.sc[0]!==sc){const i=PG.sc.indexOf(sc);if(i>0)PG.sc.splice(i,1);PG.sc.unshift(sc);if(PG.sc.length>8)PG.sc.length=8;}const ps=renderer.info.programs;if(!ps)return;let bad=null;for(let i=0;i<ps.length;i++){const pr=ps[i];if(PG.pin.has(pr))continue;PG.pin.add(pr);
 if(pr.diagnostics&&pr.diagnostics.runnable===false){(bad||(bad=[])).push(pr);continue;}if(PG.n<PG.cap){pr.usedTimes++;PG.n++;}}if(bad)progRescue(bad,sc);}
function progRescue(bad,sc){PG.fails+=bad.length;const props=renderer.properties,ps=renderer.info.programs,B=new Set(bad);bad.forEach(pr=>{pr.cacheKey='__bad19_'+PG.fails+'_'+ps.indexOf(pr);});/* tombstone, don't splice: three can't find it again by key, and a holder we don't visit still releases it through three's own path (which needs it in the array) */
 const byMat=new Map(),walk=o=>{const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach((m,j)=>{const mp=props.get(m);if(!mp||!mp.programs)return;let uses=false;mp.programs.forEach((p,k)=>{if(B.has(p)){mp.programs.delete(k);uses=true;/* drop this material's reference the way three's own release does; free it only when nobody holds it */if(--p.usedTimes<=0){const i=ps.indexOf(p);if(i>=0){ps[i]=ps[ps.length-1];ps.pop();}try{p.destroy();}catch(e){}}}});if(uses||byMat.has(m)){if(!byMat.has(m))byMat.set(m,[]);byMat.get(m).push([o,j]);}});};
 const seen=new Set();[sc,typeof scene!=='undefined'?scene:null,typeof armScene!=='undefined'?armScene:null,...PG.sc].forEach(x=>{if(x&&x.traverse&&!seen.has(x)){seen.add(x);x.traverse(walk);}});
 /* CAR-6: keep what was rescued (diagnostics intact) for the flight recorder, which reads it at a quiet moment */try{const by=[];byMat.forEach((uses,m)=>{if(by.length<4)by.push((uses[0][0].name||uses[0][0].type)+'/'+(m.name||m.type)+' try '+((m.userData.relink||0)+1));});const F=PG.failed||(PG.failed=[]);bad.forEach(pr=>{PG.failSeq=(PG.failSeq||0)+1;F.push({seq:PG.failSeq,name:pr.name,key:pr.cacheKey,diag:pr.diagnostics||null,by,at:performance.now()});});/* failSeq only grows: the recorder compares it, so failure 11+ is still seen when the list is full */if(F.length>10)F.splice(0,F.length-10);}catch(e){}
 const out=[];byMat.forEach((uses,m)=>{const u=m.userData,k=(u.relink||0)+1;u.relink=k;out.push((uses[0][0].name||uses[0][0].type)+'/'+m.type+' try '+k);const lit=m.isMeshStandardMaterial||m.isMeshPhongMaterial;/* only lit surfaces get a stand-in; lines, shadow catchers and custom shaders just link again */if(k===1||(!lit&&k===2)){m.needsUpdate=true;return;}if(!lit||k>3)return;
  const o={map:m.map||null,alphaMap:m.alphaMap||null,color:m.color?m.color.clone():new T.Color(0xffffff),vertexColors:!!m.vertexColors,transparent:!!m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest,depthWrite:m.depthWrite,depthTest:m.depthTest,fog:m.fog!==false,skinning:!!m.skinning,morphTargets:!!m.morphTargets};
  const fb=k===2?new T.MeshLambertMaterial(Object.assign(o,{emissive:m.emissive?m.emissive.clone():new T.Color(0),emissiveMap:m.emissiveMap||null,morphNormals:!!m.morphNormals})):new T.MeshBasicMaterial(o);fb.name=(m.name||m.type)+' fallback';fb.userData.relink=k;
  uses.forEach(([obj,j])=>{if(!obj.isMesh)return;if(Array.isArray(obj.material))obj.material[j]=fb;else obj.material=fb;});});
 try{console.error('TOPS #19 shader link failed, rescued: '+out.join(', '));}catch(e){}}{const _gl=renderer.getContext();const _rr=renderer.render.bind(renderer);const RC=window.TOPS_RC={n:0,k:{}};/* #20: renders since boot, for the recorder's between-match rate; RC.k counts renders by pass (scene · camera · target) for the recorder (Overseer 21:37: an extra pass per frame?) */renderer.render=function(s,c){if(_gl.isContextLost&&_gl.isContextLost())return;RC.n++;try{const rt=renderer.getRenderTarget();const key=(s===scene?'main':s===armScene?'arm':'other'+(s&&s.children?s.children.length:''))+'|'+(c&&c.isPerspectiveCamera?'p'+Math.round(c.fov):c?'o':'?')+'|'+(rt?rt.width+'x'+rt.height:'screen');RC.k[key]=(RC.k[key]||0)+1;}catch(e){}const r=_rr(s,c);try{progSweep(s);}catch(e){}return r;};const _rp=renderer.readRenderTargetPixels.bind(renderer);renderer.readRenderTargetPixels=function(){if(_gl.isContextLost&&_gl.isContextLost())return;return _rp.apply(null,arguments);};}cv.addEventListener('webglcontextlost',e=>{e.preventDefault();window.__glLost=(window.__glLost||0)+1;try{trackEv&&trackEv('gl_lost',null);}catch(_){}},false);cv.addEventListener('webglcontextrestored',()=>{PG.n=0;PG.pin=new WeakSet();PG.sc.length=0;try{const seen=new Set();const fix=m=>{if(!m||seen.has(m))return;seen.add(m);['map','emissiveMap','bumpMap','normalMap','roughnessMap','alphaMap','envMap','lightMap'].forEach(k=>{if(m[k])m[k].needsUpdate=true;});m.needsUpdate=true;};const walk=o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(fix);};scene.traverse(walk);if(scene.environment)scene.environment.needsUpdate=true;}catch(e){}setTimeout(()=>{try{V.setPlayerLook(save.look,save.flight,save.name||'You',career()?career().tier:0);}catch(e){}},400);},false);renderer.setPixelRatio(Math.min(innerWidth<=700?1.5:2,devicePixelRatio||1));renderer.shadowMap.enabled=!(innerWidth<=700);renderer.setClearColor(0x0d1014,1);renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=(window.TOPS_V3FLAG===true&&window.TOPS_TONEMAP&&T[window.TOPS_TONEMAP+'ToneMapping'])||T.ACESFilmicToneMapping;/* round 8A skin diagnostic (test knob, v3 only): TOPS_TONEMAP='Linear'|'Reinhard'|'Cineon' */if(window.GFX_LIN)renderer.outputEncoding=T.sRGBEncoding;renderer.toneMappingExposure=1.15;
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(50,1,.05,60);camera.layers.enable(2);
 {const es=new T.Scene();es.background=new T.Color(0x1a1d22);const mk=(c,w,h,x,y,z,rx,ry)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);es.add(m);};mk(0xfff4e0,3,1,0,3,0,Math.PI/2,0);mk(0xffe8c8,1.2,.6,-2,2.2,1,0,Math.PI/2);mk(0xcfe0ff,1.2,.6,2,2.2,-1,0,Math.PI/2);mk(0xe8382c,.8,.4,0,1.5,-3,0,0);mk(0x2a2e36,8,8,0,-.5,0,-Math.PI/2,0);const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(es,.04).texture;pm.dispose();}
 // GFX: real HDRI image-based lighting per venue band (CC0, pmndrs/assets). Falls back to the synthetic room above.
 const ENVTEX={};let envKind=null;
 function setEnv(kind){if(envKind===kind)return;envKind=kind;if(window.TOPS_LIGHT22&&window.TOPS_V3FLAG===true&&window.TOPS_V2LIGHT&&TOPS_V2LIGHT.rebuild22)try{TOPS_V2LIGHT.rebuild22();}catch(e){}/* doc 58: the v3 figures' venue rig follows the venue */if(ENVTEX[kind]){scene.environment=ENVTEX[kind];return;}
  try{if(!window.TOPS_ENV||!T.EXRLoader||!TOPS_ENV[kind])return;const bin=Uint8Array.from(atob(TOPS_ENV[kind]),c=>c.charCodeAt(0));const L=new T.EXRLoader();L.setDataType(T.HalfFloatType);const d=L.parse(bin.buffer);
   const tx=new T.DataTexture(d.data,d.width,d.height,d.format,d.type);tx.encoding=T.LinearEncoding;tx.minFilter=tx.magFilter=T.LinearFilter;tx.generateMipmaps=false;tx.flipY=false;tx.needsUpdate=true;
   const pm=new T.PMREMGenerator(renderer);pm.compileEquirectangularShader();const rt=pm.fromEquirectangular(tx);pm.dispose();tx.dispose();ENVTEX[kind]=rt.texture;if(envKind===kind)scene.environment=rt.texture;}catch(e){console.warn('env',e);}}
 const BOARD_H=1.73,BOARD_Z=0.045,OCHE_Z=2.37;const boardC=new T.Vector3(0,BOARD_H,BOARD_Z);
 const venue=new T.Group();scene.add(venue);const dartsG=new T.Group();scene.add(dartsG);const fx=new T.Group();scene.add(fx);
 let portrait=false;
 // --- board texture
 function boardTexture(W){if(W==null)W=1;const c=document.createElement('canvas');c.width=c.height=2048;const x=c.getContext('2d');x.scale(2,2);const mm=512/225;x.translate(512,512);
  const cream='#e8e2cc',black='#191c1b',red='#bf2f2e',green='#1d7d47';x.fillStyle='#0d0f12';x.beginPath();x.arc(0,0,512,0,7);x.fill();
  const seg=(r0,r1,a0,a1,col)=>{x.fillStyle=col;x.beginPath();x.arc(0,0,r1*mm,a0,a1);x.arc(0,0,r0*mm,a1,a0,true);x.closePath();x.fill();};
  for(let i=0;i<20;i++){const a0=(i*18-9-90)*Math.PI/180,a1=a0+18*Math.PI/180;const dk=i%2===0;seg(R.obull,R.tIn,a0,a1,dk?black:cream);seg(R.tIn,R.tOut,a0,a1,dk?red:green);seg(R.tOut,R.dIn,a0,a1,dk?black:cream);seg(R.dIn,R.dOut,a0,a1,dk?red:green);}
  x.fillStyle=green;x.beginPath();x.arc(0,0,R.obull*mm,0,7);x.fill();x.fillStyle=red;x.beginPath();x.arc(0,0,R.bull*mm,0,7);x.fill();
  // sisal: radial fibre striations + grain + darkening at the wires and toward the rim
  {// LOOK: irregular sisal fibre (phase-randomised radial fibres, no repeating weave), 5-8% local tonal variation, darkening at wires and rim
   const img=x.getImageData(0,0,2048,2048),d=img.data;const wires=[R.bull,R.obull,R.tIn,R.tOut,R.dIn,R.dOut];const PH=new Float32Array(4096);for(let k=0;k<4096;k++)PH[k]=Math.random()*6.2832;const AMP=new Float32Array(4096);for(let k=0;k<4096;k++)AMP[k]=.5+Math.random();const f1=5+Math.random()*2,f2=3+Math.random()*2,f3=7+Math.random()*3,q1=Math.random()*6,q2=Math.random()*6;
   for(let i=0;i<d.length;i+=4){const px=((i/4)%2048)/2-512,py=Math.floor(i/4/2048)/2-512;const r=Math.hypot(px,py)/mm;if(r>R.dOut)continue;const a=Math.atan2(py,px);const cell=(r*1.6|0)&4095;const cell2=((r*.7|0)*7+13)&4095;const fib=Math.sin(a*(1000+(cell&31)*6)+PH[cell])*5*AMP[cell]+Math.sin(a*2600+PH[cell2]+r*.9)*2.2;const tone=1+.035*(Math.sin(a*f1+q1)*Math.sin(r*.11+q2)+Math.sin(a*f2+r*.07)*Math.cos(a*f3));const n=(Math.random()-.5)*13+fib;let f=tone*(1-Math.max(0,(r-110)/90)*.12);for(const w of wires){const dw=Math.abs(r-w);if(dw<2.0)f*=.8+dw*.1;}const seg=((a*180/Math.PI+90+9)%18+18)%18;const ds=Math.min(seg,18-seg)*r*Math.PI/180;if(ds<1.4&&r>R.obull)f*=.82+ds*.12;d[i]=Math.max(0,Math.min(255,(d[i]+n)*f));d[i+1]=Math.max(0,Math.min(255,(d[i+1]+n)*f));d[i+2]=Math.max(0,Math.min(255,(d[i+2]+n)*f));}x.putImageData(img,0,0);
   // restrained wear: pinholes around T20 and the common doubles
   const hole=(rr,aa)=>{x.fillStyle=`rgba(20,16,12,${.18+Math.random()*.2})`;x.beginPath();x.arc(Math.cos(aa)*rr*mm,Math.sin(aa)*rr*mm,.28*mm+Math.random()*.2*mm,0,7);x.fill();};
   const segA=n=>((ORDER.indexOf(n)*18-90)*Math.PI/180);for(let k=0;k<70*W;k++)hole(R.tIn+1.5+Math.random()*(R.tOut-R.tIn-3),segA(20)+(Math.random()-.5)*.26);[20,16,8,10,18,12,4].forEach((n,j)=>{for(let k=0;k<(j<3?16:8)*W;k++)hole(R.dIn+1.5+Math.random()*(R.dOut-R.dIn-3),segA(n)+(Math.random()-.5)*.26);});for(let k=0;k<12*W;k++)hole(Math.random()*R.bull,Math.random()*6.28);}
  x.strokeStyle='rgba(0,0,0,.32)';x.lineWidth=2.0;[R.bull,R.obull,R.tIn,R.tOut,R.dIn,R.dOut].forEach(r=>{x.beginPath();x.arc(1.0,1.6,r*mm,0,7);x.stroke();});for(let i=0;i<20;i++){const a=(i*18-9-90)*Math.PI/180;x.beginPath();x.moveTo(Math.cos(a)*R.obull*mm+1.0,Math.sin(a)*R.obull*mm+1.6);x.lineTo(Math.cos(a)*R.dOut*mm+1.0,Math.sin(a)*R.dOut*mm+1.6);x.stroke();}
  x.strokeStyle='rgba(200,204,208,.3)';x.lineWidth=.8;[R.bull,R.obull,R.tIn,R.tOut,R.dIn,R.dOut].forEach(r=>{x.beginPath();x.arc(0,0,r*mm,0,7);x.stroke();});
  for(let i=0;i<20;i++){const a=(i*18-9-90)*Math.PI/180;x.beginPath();x.moveTo(Math.cos(a)*R.obull*mm,Math.sin(a)*R.obull*mm);x.lineTo(Math.cos(a)*R.dOut*mm,Math.sin(a)*R.dOut*mm);x.stroke();}
  // LOOK v1.20: surround with faint grain, steel number ring (wire band), bevelled silver numbers, outer catch-ring lip
  {const sg=x.createRadialGradient(0,0,R.dOut*mm,0,0,225*mm);sg.addColorStop(0,'#15181c');sg.addColorStop(.55,'#0f1215');sg.addColorStop(1,'#07080a');x.fillStyle=sg;x.beginPath();x.arc(0,0,225*mm,0,7);x.arc(0,0,R.dOut*mm+.6,0,7,true);x.fill();
   for(let k=0;k<2600;k++){const a=Math.random()*6.2832,r=(R.dOut+2+Math.random()*52)*mm;x.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},${.025+Math.random()*.04})`;x.fillRect(Math.cos(a)*r,Math.sin(a)*r,1.2,1.2);}
   const ring=(r,w,c)=>{x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.arc(0,0,r*mm,0,7);x.stroke();};
   // steel wire rings either side of the numbers, with a highlight and shadow pass
   [[185.5,'#8f969c'],[214.5,'#8f969c']].forEach(([r,c])=>{ring(r+.5,2.6,'rgba(0,0,0,.55)');ring(r,1.9,c);x.save();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.7;x.beginPath();x.arc(0,0,r*mm-.5,Math.PI*1.05,Math.PI*1.75);x.stroke();x.restore();});
   // catch-ring lip at the board edge
   ring(223.5,3.2,'rgba(255,255,255,.05)');ring(225,2,'rgba(0,0,0,.8)');}
  x.font=`700 ${19.5*mm}px "Saira Condensed","Arial Narrow",Arial,sans-serif`;x.textAlign='center';x.textBaseline='middle';ORDER.forEach((n,i)=>{const a=(i*18-90)*Math.PI/180;const X=Math.cos(a)*200*mm,Y=Math.sin(a)*200*mm;x.save();x.translate(X,Y);
   x.fillStyle='rgba(0,0,0,.75)';x.fillText(n,1.6,2.0);
   const ng=x.createLinearGradient(0,-9*mm,0,9*mm);ng.addColorStop(0,'#e4e6e1');ng.addColorStop(.45,'#b9beba');ng.addColorStop(.55,'#89918f');ng.addColorStop(1,'#d1d4ce');x.fillStyle=ng;x.fillText(n,0,0);
   x.lineWidth=.8;x.strokeStyle='rgba(255,255,255,.35)';x.strokeText(n,-.4,-.5);x.restore();});
  const tx=new T.CanvasTexture(c);tx.anisotropy=16;return tx;}
 function textTexture(txt,bg,fg,w=2048,h=256,size=150){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;const fnt=s=>`800 ${s}px "Saira Condensed","Arial Narrow",Arial,sans-serif`;x.font=fnt(size);let tw=x.measureText(txt).width;if(tw>w*.92){size=Math.floor(size*w*.92/tw);x.font=fnt(size);}x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+size*.04);const t=new T.CanvasTexture(c);return t;}
 function patternTexture(paint,w=1024,h=512,rep=[1,1]){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1]);return t;}
 const TEXCACHE={};
 function noiseTex(key,w,h,paint){if(TEXCACHE[key])return TEXCACHE[key];const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');paint(x,w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;TEXCACHE[key]=t;return t;}
 function grain(x,w,h,amp){const img=x.getImageData(0,0,w,h),d=img.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}x.putImageData(img,0,0);}
 function woodTex(base='#4a2f1b',dark='#2b1a0e',plank=96){return noiseTex('wood'+base+plank,1024,1024,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);
  for(let px=0;px<w;px+=plank){const off=Math.floor(Math.random()*400);x.fillStyle=`rgba(${Math.random()*30|0},${Math.random()*15|0},0,${.12+Math.random()*.18})`;x.fillRect(px,0,plank,h);
   x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=1;for(let k=0;k<14;k++){x.beginPath();const gx=px+6+Math.random()*(plank-12);x.moveTo(gx,0);for(let y=0;y<=h;y+=32)x.lineTo(gx+Math.sin((y+off)/90+k)*5+Math.sin((y+off)/17)*1.5,y);x.stroke();}
   if(Math.random()<.5){const ky=Math.random()*h,kx=px+plank/2+(Math.random()-.5)*30;x.fillStyle='rgba(20,10,4,.55)';x.beginPath();x.ellipse(kx,ky,6,10,0,0,7);x.fill();}
   x.fillStyle=dark;x.fillRect(px,0,3,h);x.fillStyle='rgba(255,220,180,.08)';x.fillRect(px+3,0,2,h);}
  grain(x,w,h,26);});}
 function carpetTex(base='#2a1d1c'){return noiseTex('carpet'+base,512,512,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<w;i+=32)for(let j=0;j<h;j+=32){x.fillStyle=`rgba(120,60,40,${((i+j)/32)%2?.08:.03})`;x.fillRect(i,j,32,32);x.fillStyle='rgba(200,150,90,.07)';x.beginPath();x.arc(i+16,j+16,5,0,7);x.fill();}grain(x,w,h,44);});}
 function plasterTex(base='#d9cfb6'){return noiseTex('plaster'+base,512,512,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let k=0;k<60;k++){x.fillStyle=`rgba(0,0,0,${Math.random()*.05})`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,20+Math.random()*80,0,7);x.fill();}grain(x,w,h,18);});}
 function curtainTex(base='#1a1f3a',fold='#0e1226'){return noiseTex('curtain'+base,1024,512,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<w;i+=40){const gr=x.createLinearGradient(i,0,i+40,0);gr.addColorStop(0,fold);gr.addColorStop(.45,base);gr.addColorStop(.6,'rgba(255,255,255,.06)');gr.addColorStop(1,fold);x.fillStyle=gr;x.fillRect(i,0,40,h);}grain(x,w,h,14);});}
 function concreteTex(base='#2c2f33'){return noiseTex('conc'+base,512,512,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let k=0;k<120;k++){x.fillStyle=`rgba(255,255,255,${Math.random()*.03})`;x.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*30,1+Math.random()*3);}grain(x,w,h,30);});}
 function surf(tex,rep,opts={}){const t=tex.clone();t.needsUpdate=true;t.repeat.set(rep[0],rep[1]);return new T.MeshStandardMaterial(Object.assign({map:t,bumpMap:t,bumpScale:.004,roughness:.92,metalness:0},opts));}
 const boardTex=boardTexture();
 // --- board + surround (permanent)
 function sisalBump(){const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,1024,1024);const img=x.getImageData(0,0,1024,1024),d=img.data;const PH=new Float32Array(1024);for(let k=0;k<1024;k++)PH[k]=Math.random()*6.2832;for(let i=0;i<d.length;i+=4){const px=(i/4)%1024-512,py=Math.floor(i/4/1024)-512;const a=Math.atan2(py,px),r=Math.hypot(px,py);const cell=(r*.8|0)&1023;const v=128+Math.sin(a*(1300+(cell&15)*9)+PH[cell])*16+Math.sin(a*3100+PH[(cell*5+3)&1023]+r*1.1)*8+(Math.random()-.5)*36;d[i]=d[i+1]=d[i+2]=Math.max(0,Math.min(255,v));}x.putImageData(img,0,0);const t=new T.CanvasTexture(c);t.anisotropy=8;return t;}
 const board=new T.Mesh(new T.CircleGeometry(.2255,96),new T.MeshStandardMaterial({map:boardTex,bumpMap:sisalBump(),bumpScale:.0016,roughness:.94,metalness:0,emissive:0x1a1a1a,emissiveMap:boardTex,emissiveIntensity:window.GFX_LIN?.04:.22,envMapIntensity:window.GFX_LIN?.45:1}));board.receiveShadow=true;board.position.copy(boardC);scene.add(board);
 // 3D wire spider sitting proud of the sisal: rings + 20 spokes, metallic so they catch the light
 {const wireM=new T.MeshStandardMaterial({color:0xb9bec4,metalness:.82,roughness:.38});const spider=new T.Group();spider.position.set(0,BOARD_H,BOARD_Z+.0012);const wr=.00042;
  [R.bull,R.obull,R.tIn,R.tOut,R.dIn,R.dOut].forEach((rm,i)=>{const ring=new T.Mesh(new T.TorusGeometry(rm/1000,wr*(i<2?1.2:1),6,i<2?48:160),wireM);spider.add(ring);});
  for(let i=0;i<20;i++){const a=(i*18-9-90)*Math.PI/180;const len=(R.dOut-R.obull)/1000;const sp=new T.Mesh(new T.CylinderGeometry(wr,wr,len,5),wireM);sp.position.set(Math.cos(a)*(R.obull/1000+len/2),Math.sin(a)*(R.obull/1000+len/2),0);sp.rotation.z=a-Math.PI/2;spider.add(sp);}
  // number ring: raised black ring with the numbers, 1.5mm proud
  const nr=new T.Mesh(new T.RingGeometry(R.dOut/1000+.004,.2255,96),new T.MeshStandardMaterial({map:boardTex,roughness:.7,metalness:.05}));nr.position.z=.0008;spider.add(nr);
  scene.add(spider);}
 const rim=new T.Mesh(new T.CylinderGeometry(.2255,.2255,.038,96,1,true),new T.MeshBasicMaterial({color:0x111214}));rim.rotation.x=Math.PI/2;rim.position.set(0,BOARD_H,BOARD_Z-.019);scene.add(rim);
 function surroundTex(brand){const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.translate(512,512);x.fillStyle='#21100f';x.beginPath();x.arc(0,0,512,0,7);x.fill();for(let k=0;k<5200;k++){x.fillStyle=`rgba(${k%2?'0,0,0':'255,230,220'},${Math.random()*.06})`;x.fillRect(-512+Math.random()*1024,-512+Math.random()*1024,2+Math.random()*3,1.5);}{const g=x.createRadialGradient(0,0,300,0,0,512);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(-512,-512,1024,1024);}x.fillStyle='#1a0e10';x.beginPath();x.arc(0,0,318,0,7);x.fill();x.font='800 72px "Saira Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(233,228,216,.55)';x.save();x.translate(0,-415);x.fillText(brand,0,0);x.restore();x.fillStyle='rgba(233,228,216,.4)';x.save();x.translate(0,415);x.rotate(Math.PI);x.fillText(brand,0,0);x.restore();x.font='600 44px "Saira Condensed",Arial,sans-serif';x.fillStyle='rgba(233,228,216,.28)';[].forEach(([t,a])=>{x.save();x.rotate(a);x.translate(0,-415);x.fillText(t,0,0);x.restore();});const t=new T.CanvasTexture(c);t.anisotropy=8;return t;}
 const surround=new T.Mesh(new T.CircleGeometry(.37,96),new T.MeshStandardMaterial({map:surroundTex('TOPS'),roughness:.9,metalness:0}));surround.position.set(0,BOARD_H,0.036);scene.add(surround);
 const sring=new T.Mesh(new T.RingGeometry(.37,.385,96),new T.MeshStandardMaterial({color:0x3a3d42,metalness:.7,roughness:.5}));sring.position.set(0,BOARD_H,0.037);scene.add(sring);
 const lring=new T.Mesh(new T.RingGeometry(.228,.236,96),new T.MeshBasicMaterial({color:0xcfd3d8,transparent:true,opacity:.35}));lring.position.set(0,BOARD_H,BOARD_Z+.0015);scene.add(lring);
 // aim plane + reticle
 const aimPlane=new T.Mesh(new T.PlaneGeometry(1.2,1.2),new T.MeshBasicMaterial({visible:false}));aimPlane.position.set(0,BOARD_H,BOARD_Z);scene.add(aimPlane);
 const reticle=new T.Group();const rr=new T.Mesh(new T.RingGeometry(.9,1,48),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthTest:false}));reticle.add(rr);const rc=new T.Mesh(new T.CircleGeometry(.03,10),new T.MeshBasicMaterial({color:0xffffff,depthTest:false}));reticle.add(rc);const xh=new T.Group();[0,Math.PI/2].forEach(a=>{const m=new T.Mesh(new T.PlaneGeometry(2.6,.08),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthTest:false}));m.rotation.z=a;xh.add(m);});xh.visible=false;reticle.add(xh);reticle.userData.xh=xh;reticle.position.z=BOARD_Z+.002;reticle.renderOrder=5;scene.add(reticle);
 // ===== FEEL (sprint): shader reticle (board mm, DPR-independent) + landing ghosts =====
 const FR_U={uSize:{value:30},uRing:{value:0},uStroke:{value:.75},uOutline:{value:.5},uDot:{value:.5},uArmIn:{value:3},uArmLen:{value:0},uTick:{value:0},uTickLen:{value:4},uDash:{value:0},uAA:{value:.4},uCol:{value:new T.Color(0xe9e4d8)},uOut:{value:new T.Color(0x1b1d21)},uOp:{value:1}};
 const feelRet=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms:FR_U,transparent:true,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform float uSize,uRing,uStroke,uOutline,uDot,uArmIn,uArmLen,uTick,uTickLen,uDash,uAA,uOp;uniform vec3 uCol,uOut;varying vec2 vUv;
  float band(float x,float lo,float hi){return smoothstep(lo-uAA,lo,x)*(1.0-smoothstep(hi,hi+uAA,x));}
  void main(){vec2 p=(vUv*2.0-1.0)*uSize;float d=length(p);vec2 q=abs(p);float along=max(q.x,q.y),across=min(q.x,q.y);float a=0.0,o=0.0;
   a=max(a,1.0-smoothstep(uDot,uDot+uAA,d));o=max(o,1.0-smoothstep(uDot+uOutline,uDot+uOutline+uAA,d));
   if(uArmLen>0.0){float w=uStroke*0.5;float ia=band(along,uArmIn,uArmIn+uArmLen)*(1.0-smoothstep(w,w+uAA,across));a=max(a,ia);float io=band(along,uArmIn-uOutline,uArmIn+uArmLen+uOutline)*(1.0-smoothstep(w+uOutline,w+uOutline+uAA,across));o=max(o,io);}
   if(uRing>0.0){float dash=1.0;if(uDash>0.5){float ang=atan(p.y,p.x);dash=step(0.5,fract(ang/6.2831853*24.0));}float w=uStroke*0.5;float ra=1.0-smoothstep(w,w+uAA,abs(d-uRing));a=max(a,dash*ra);float ro=1.0-smoothstep(w+uOutline,w+uOutline+uAA,abs(d-uRing));o=max(o,dash*ro);}
   if(uTick>0.5&&uRing>0.0){float w=uStroke*0.5;float t0=uRing+uStroke*0.5+uOutline+0.6;float ta=band(along,t0,t0+uTickLen)*(1.0-smoothstep(w,w+uAA,across));a=max(a,ta);float to=band(along,t0-uOutline,t0+uTickLen+uOutline)*(1.0-smoothstep(w+uOutline,w+uOutline+uAA,across));o=max(o,to);}
   float al=max(a,o)*uOp;if(al<0.004)discard;gl_FragColor=vec4(mix(uOut,uCol,a),al);}`}));
 feelRet.position.z=BOARD_Z+.0025;feelRet.renderOrder=6;feelRet.visible=false;scene.add(feelRet);reticle.visible=false;
 // mm of board per CSS px for the camera that draws the board pane
 function boardMmPerPx(){const sz=renderer.getSize(new T.Vector2());if(splitOn&&!previewOn&&!idleOn){const vert=sz.y>sz.x*1.1;const lh=vert?Math.round(sz.y*.5):sz.y;const fov=vert?12:9;return 2000*Math.tan(fov*Math.PI/360)/lh;}const dist=Math.max(.3,camera.position.distanceTo(boardC));return 2000*dist*Math.tan(camera.fov*Math.PI/360)/sz.y;}
 // st: {x,y (board mm, incl sway), mode:'aim'|'pull', sigma, perfect, over, wide}
 const FR_CREAM=new T.Color(0xe9e4d8),FR_RED=new T.Color(0xe8382c);const FR_LIME=new T.Color(0xc6f36b);
 // v1.72 (Lee, David): the ring flashes lime in the perfect-release window on Rookie and Club, offline only
 function perfFlashOn(){try{if(window.TOPS_PERF_FLASH===false)return false;if(typeof S!=='undefined'&&S&&S.online)return false;const lv=(save.diff&&save.diff.lv)||'club';return lv==='rookie'||lv==='club';}catch(e){return false;}}let frInfo={};
 let retLast=null,retHideT=0;
 function feelReticle(st){if(!st){feelRet.visible=false;return;}const mpp=boardMmPerPx();const w=mmToWorld(st.x,st.y);feelRet.position.x=w.x;feelRet.position.y=w.y;
  const dot=Math.max(.5,1*mpp),stroke=1.5*mpp,outline=1*mpp,aa=Math.max(.05,.7*mpp);let ring=0,dash=0,tick=0,arms=0;const col=FR_CREAM;
  if(st.mode==='pull'){ring=document.body.classList.contains('card-nomarker')?0:1.794*st.sigma;if(ring>70){ring=70;dash=1;}if(st.over){dash=1;}if(st.perfect&&!st.over)tick=1;}else{arms=1;}
  const tickLen=Math.max(4,6*mpp);const size=Math.max(ring+stroke+outline+tickLen+2,arms?(3+3+outline+1):0,dot+outline+1,2*mpp);
  FR_U.uSize.value=size;FR_U.uRing.value=ring;FR_U.uStroke.value=stroke;FR_U.uOutline.value=outline;FR_U.uDot.value=dot;FR_U.uArmIn.value=3;FR_U.uArmLen.value=arms?3:0;FR_U.uTick.value=tick;FR_U.uTickLen.value=tickLen;FR_U.uDash.value=dash;FR_U.uAA.value=aa;FR_U.uCol.value.copy(st.over?FR_RED:(st.mode==='pull'&&st.perfect&&perfFlashOn())?FR_LIME:col);FR_U.uOp.value=st.op==null?1:st.op;
  feelRet.scale.set(size/1000,size/1000,1);feelRet.visible=true;frInfo={mpp,ring,dot,stroke,tick,dash,arms,size,mode:st.mode};}
 // landing ghosts: three reusable hollow rings on the board plane
 const ghostG=new T.Group();ghostG.renderOrder=4;scene.add(ghostG);const ghosts=[];for(let i=0;i<3;i++){const m=new T.Mesh(new T.RingGeometry(.0022,.0034,28),new T.MeshBasicMaterial({color:0xe9e4d8,transparent:true,opacity:.2,depthTest:false,depthWrite:false}));m.visible=false;m.position.z=BOARD_Z+.0021;ghostG.add(m);ghosts.push(m);}
 // release marker: a small lime cross where the reticle was when you let go, so you can see the dart followed your aim
 const relMk=new T.Group();relMk.renderOrder=5;relMk.visible=false;{const mm=new T.MeshBasicMaterial({color:0xc6f36b,transparent:true,opacity:.9,depthTest:false,depthWrite:false});const a1=new T.Mesh(new T.PlaneGeometry(.0075,.0011),mm),a2=new T.Mesh(new T.PlaneGeometry(.0011,.0075),mm),rg=new T.Mesh(new T.RingGeometry(.0016,.0024,24),mm);relMk.add(a1,a2,rg);}relMk.position.z=BOARD_Z+.0023;ghostG.add(relMk);let relT=0;
 function showRelMark(x,y){const w=mmToWorld(x,y);relMk.position.x=w.x;relMk.position.y=w.y;relMk.visible=true;relMk.children[0].material.opacity=.9;relT=performance.now();clearInterval(showRelMark.iv);showRelMark.iv=setInterval(()=>{const k=(performance.now()-relT)/2200;if(k>=1){relMk.visible=false;clearInterval(showRelMark.iv);return;}relMk.children[0].material.opacity=.9*(1-Math.max(0,k-.5)*2);},60);}
 function ghostsSet(list){ghosts.forEach((m,i)=>{const g=list&&list[i];if(!g){m.visible=false;return;}const w=mmToWorld(g.x,g.y);m.position.x=w.x;m.position.y=w.y;m.visible=true;});}
 function ghostsClear(){ghostsSet(null);}
 // lights (rebuilt per venue)
 const lights=new T.Group();scene.add(lights);
 // --- dart model
 const FLT={};
 // real-set flights: each barrel ships with its own flights (researched against retailer listings)
 const BFLY={assassin:{bg:'#141416',ac:'#d4202a',p:'band',tx:'HARROWS',tc:'#ffffff'},neutron:{bg:'#1f4fa8',ac:'#ffffff',p:'stripe',tx:'WINMAU',tc:'#ffffff'},corexl:{bg:'#f2f2f2',ac:'#111111',p:'chev',tx:'UNICORN',tc:'#111111'},supergrip:{bg:'#c9ced4',ac:'#d4202a',p:'stripes',tx:'HARROWS',tc:'#1a1a1a'},razor:{bg:'#0f0f10',ac:'#d4202a',p:'chev',tx:'RED DRAGON',tc:'#ffffff'},vapor8:{bg:'#111113',ac:'#f5d11c',p:'stripes',tx:'TARGET',tc:'#f5d11c'},zen:{bg:'#0f6d73',ac:'#5fd3cf',p:'wave',tx:'SHOT',tc:'#ffffff'},mvg:{bg:'#2fa046',ac:'#0e0e0e',p:'split',tx:'MvG',tc:'#ffffff'},asp:{bg:'#101012',ac:'#c4161c',p:'snake',tx:'THE ASP',tc:'#ffffff'},ga:{bg:'#1c2c5a',ac:'#ffffff',p:'cross',tx:'UNICORN',tc:'#ffffff'},littler:{bg:'#5b2a86',ac:'#d9b45a',p:'band',tx:'LITTLER',tc:'#ffffff'},power:{bg:'#0e0e0e',ac:'#ffffff',p:'bolt',tx:'POWER',tc:'#ffffff'},iceman:{bg:'#0d2740',ac:'#8fd3ff',p:'chev',tx:'ICEMAN',tc:'#ffffff'}};
 function setFlightTex(id){const D=BFLY[id];if(!D)return null;const key='set:'+id;if(FLT[key])return FLT[key];const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=D.bg;x.fillRect(0,0,256,256);x.fillStyle=D.ac;x.strokeStyle=D.ac;
  if(D.p==='band'){x.beginPath();x.moveTo(0,200);x.lineTo(200,0);x.lineTo(256,0);x.lineTo(256,40);x.lineTo(40,256);x.lineTo(0,256);x.closePath();x.fill();}
  else if(D.p==='stripe'){x.fillRect(0,96,256,34);}
  else if(D.p==='stripes'){for(let k=-256;k<256;k+=46){x.beginPath();x.moveTo(k,256);x.lineTo(k+256,0);x.lineTo(k+274,0);x.lineTo(k+18,256);x.closePath();x.fill();}}
  else if(D.p==='chev'){for(let k=0;k<3;k++){x.beginPath();x.moveTo(0,40+k*60);x.lineTo(128,90+k*60);x.lineTo(256,40+k*60);x.lineTo(256,64+k*60);x.lineTo(128,114+k*60);x.lineTo(0,64+k*60);x.closePath();x.fill();}}
  else if(D.p==='wave'){x.lineWidth=14;for(let k=0;k<5;k++){x.globalAlpha=.35+k*.12;x.beginPath();for(let i=0;i<=256;i+=8){const y=30+k*48+14*Math.sin(i/30+k);i?x.lineTo(i,y):x.moveTo(i,y);}x.stroke();}x.globalAlpha=1;}
  else if(D.p==='split'){x.beginPath();x.moveTo(0,256);x.lineTo(256,0);x.lineTo(256,256);x.closePath();x.fill();}
  else if(D.p==='snake'){x.lineWidth=22;x.lineCap='round';x.beginPath();for(let i=0;i<=256;i+=6){const y=128+60*Math.sin(i/34);i?x.lineTo(i,y):x.moveTo(i,y);}x.stroke();x.fillStyle=D.bg;x.beginPath();x.arc(236,128+60*Math.sin(236/34),5,0,7);x.fill();}
  else if(D.p==='cross'){x.lineWidth=34;x.beginPath();x.moveTo(0,0);x.lineTo(256,256);x.moveTo(256,0);x.lineTo(0,256);x.stroke();}
  else if(D.p==='bolt'){x.beginPath();x.moveTo(150,10);x.lineTo(80,140);x.lineTo(130,140);x.lineTo(95,250);x.lineTo(190,100);x.lineTo(138,100);x.lineTo(180,10);x.closePath();x.fill();}
  x.fillStyle=D.tc;x.font='800 '+(D.tx.length>7?24:32)+'px "Saira Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.save();x.translate(160,196);x.rotate(-.32);x.globalAlpha=.95;x.fillText(D.tx,0,0,150);x.restore();
  const t=new T.CanvasTexture(c);t.anisotropy=8;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/.032,1/.032);t.offset.set(0,.1);KEEP.add(t);/* #15b: shared by every dart with this flight, so freeing one dart must not free it */FLT[key]=t;return t;}
 function flightTex(color,brand){const key=String(color)+brand;if(FLT[key])return FLT[key];const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const col=new T.Color(color);x.fillStyle='#'+col.getHexString();x.fillRect(0,0,256,256);const dk=col.clone().multiplyScalar(.55);x.fillStyle='#'+dk.getHexString();x.beginPath();x.moveTo(0,256);x.lineTo(256,0);x.lineTo(256,70);x.lineTo(70,256);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,256,26);x.fillStyle='rgba(0,0,0,.55)';x.font='800 54px "Saira Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.save();x.translate(150,150);x.rotate(-Math.PI/4);x.fillText(brand.toUpperCase(),0,0);x.restore();const t=new T.CanvasTexture(c);t.anisotropy=8;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/.032,1/.032);t.offset.set(0,.1);KEEP.add(t);/* #15b: shared by every dart with this flight, so freeing one dart must not free it */FLT[key]=t;return t;}
 let _dg;function dartGeo(){if(_dg!==undefined)return _dg;_dg=null;try{const R=window.TOPS_DG_RAW;if(!R){window.TOPS_DG_ERR='no raw';_dg=undefined;return null;}const dec=s=>{s=String(s).replace(/[^A-Za-z0-9+/]/g,'');const L='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';const map=new Uint8Array(128);for(let i=0;i<64;i++)map[L.charCodeAt(i)]=i;const n=Math.floor(s.length*3/4);const u=new Uint8Array(Math.ceil(n/4)*4);let o=0;for(let i=0;i<s.length;i+=4){const a=map[s.charCodeAt(i)],b=map[s.charCodeAt(i+1)],c=map[s.charCodeAt(i+2)]||0,d=map[s.charCodeAt(i+3)]||0;const v=(a<<18)|(b<<12)|(c<<6)|d;u[o++]=(v>>16)&255;if(i+2<s.length)u[o++]=(v>>8)&255;if(i+3<s.length)u[o++]=v&255;}return u.buffer.slice(0,Math.floor(o/4)*4);};const mk=o=>{const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(new Float32Array(dec(o.p)),3));ge.setAttribute('normal',new T.BufferAttribute(new Float32Array(dec(o.n)),3));ge.setIndex(new T.BufferAttribute(new Uint32Array(dec(o.i)),1));return ge;};_dg={barrel:mk(R.barrel),point:mk(R.point)};KEEP.add(_dg.barrel);KEEP.add(_dg.point);window.TOPS_DG_OK=1;}catch(e){_dg=null;window.TOPS_DG_ERR=String(e&&e.message||e).slice(0,60);}return _dg;}
 // real-brand barrel looks: profile along the barrel (t 0 = point end, 1 = shaft end), finish and accent bands
 const BLOOK={
  assassin:{col:0xb8913c,met:.85,rough:.32,prof:t=>1.04-.08*t},
  neutron:{col:0xc29a42,met:.85,rough:.3,prof:t=>.96+.1*Math.exp(-Math.pow((t-.4)/.3,2))},
  corexl:{col:0x4b4f55,met:.8,rough:.42,prof:t=>.95,bands:[[.22,.07,0xd0d4d8],[.78,.07,0xd0d4d8]]},
  supergrip:{col:0xb4b9bf,met:.92,rough:.26,prof:t=>.9},
  razor:{col:0x9fa4ab,met:.92,rough:.24,prof:t=>.86+.24*Math.exp(-Math.pow((t-.38)/.26,2)),bands:[[.5,.05,0xb3202a]]},
  vapor8:{col:0x16171a,met:.6,rough:.5,prof:t=>.8},
  zen:{col:0x3f5368,met:.85,rough:.3,prof:t=>.93,bands:[[.15,.06,0x1c1f24],[.85,.06,0x1c1f24]]},
  mvg:{col:0x121315,met:.55,rough:.48,prof:t=>.9+.18*Math.exp(-Math.pow((t-.35)/.28,2)),bands:[[.3,.05,0x39b54a],[.7,.05,0x39b54a]]},
  asp:{col:0xb3b8be,met:.92,rough:.25,prof:t=>1.12-.24*t,bands:[[.55,.05,0xb3141b],[.7,.05,0xb3141b],[.85,.05,0xb3141b]]},
  ga:{col:0xcfd3d8,met:.95,rough:.18,prof:t=>.96},
  littler:{col:0x1b1c20,met:.6,rough:.45,prof:t=>.97},
  power:{col:0x8e949c,met:.9,rough:.28,prof:t=>.95+.11*Math.exp(-Math.pow((t-.5)/.32,2)),bands:[[.18,.05,0xc9a227],[.82,.05,0x111111]]},
  iceman:{col:0x7f9fb8,met:.9,rough:.26,prof:t=>.9+.16*Math.exp(-Math.pow((t-.4)/.3,2)),bands:[[.5,.05,0x8fd3ff]]}};
 // lathe-built barrels: real silhouettes, grip cut into the profile, coating colours with bare metal in the grooves
 // lathe-built barrels: real silhouettes, grip cut into the profile (ring, buttress, knurl, pixel, axial), coating colours with bare metal in the cuts
 const BSPEC={
  assassin:{base:0xB99A52,gc:0x51401E,g:[[.1,.9,'ring',10,.052,.02]]},
  neutron:{base:0xC29A42,gc:0x5a4418,g:[[.12,.88,'knurl',6,.06,11]]},
  corexl:{base:0xC9CDD0,gc:0x292C30,g:[[.05,.32,'ring',6,.06,.02],[.68,.95,'ring',6,.06,.02]]},
  supergrip:{base:0xBFC4C7,gc:0x42474B,g:[[.06,.3,'ring',6,.045,.016],[.38,.62,'ring',6,.045,.016],[.7,.94,'ring',6,.045,.016]]},
  razor:{base:0xAEB5BC,gc:0x30343A,g:[[.05,.95,'butt',12,.11]]},
  vapor8:{base:0x202326,gc:0xD9C742,g:[[.12,.88,'axial',.08,8],[.05,.1,'ring',2,.04,.02],[.9,.95,'ring',2,.04,.02]]},
  zen:{base:0x354652,gc:0xCAD4D8,g:[[.06,.3,'butt',5,.09],[.4,.6,'ring',4,.07,.03],[.7,.94,'butt',5,.09]]},
  mvg:{base:0x252A29,gc:0x43955a,g:[[.08,.4,'pixel',7,.06,14],[.55,.94,'ring',7,.06,.022]]},
  asp:{base:0xBBC0C4,gc:0xC92847,g:[[.5,.95,'butt',9,.08]]},
  ga:{base:0xBFC5C9,gc:0x50565B,g:[[.1,.42,'ring',14,.022,.008],[.58,.9,'ring',14,.022,.008]]},
  littler:{base:0x25272B,gc:0xAEB5BD,g:[[.08,.42,'pixs',10,.05,15],[.58,.92,'pixs',10,.05,15]]},
  power:{base:0x202226,gc:0xC2C7CA,g:[[.05,.3,'butt',5,.1],[.7,.95,'butt',5,.1]],reg:[[.0,.3,0xC2C7CA],[.7,1,0xC2C7CA],[.47,.53,0xC9A34E]]},
  iceman:{base:0x1E3A56,gc:0xCFE6F5,g:[[.06,.44,'butt',7,.09],[.56,.94,'ring',7,.05,.02]]}};
 // depth of the cut at t (0 = point end) and angle a (0..1 round the barrel)
 function cutAt(sp,t,a){for(const r of sp.g){const [lo,hi,ty]=r;if(t<lo||t>hi)continue;const u=(t-lo)/(hi-lo);
   if(ty==='ring'){const n=r[3],dep=r[4],w=r[5];const f=(u*n)%1;const d=Math.abs(f-.5)*2;const hw=Math.min(.95,w*n/(hi-lo));if(d<hw)return dep*Math.sqrt(1-Math.pow(d/hw,2));}
   else if(ty==='butt'){const n=r[3],dep=r[4];const f=(u*n)%1;if(f<.4)return dep*(1-f/.4);}
   else if(ty==='knurl'){const n=r[3],dep=r[4],m=r[5];const p=Math.abs(Math.sin(Math.PI*(u*n+a*m)))*Math.abs(Math.sin(Math.PI*(u*n-a*m)));if(p<.18)return dep*(1-p/.18);}
   else if(ty==='pixel'){const n=r[3],dep=r[4],m=r[5];if((u*n)%1<.45&&(a*m)%1<.45)return dep;}
   else if(ty==='pixs'){const n=r[3],dep=r[4],m=r[5];const row=Math.floor(u*n);if((u*n)%1<.38&&((a*m+(row%2)*.5)%1)<.34)return dep;}
   else if(ty==='axial'){const dep=r[3],m=r[4];const f=(a*m)%1;if(f<.22&&u>.04&&u<.96)return dep;}}
  return 0;}
 const _blathe={};function barrelLathe(id,prof){if(_blathe[id])return _blathe[id];const sp=BSPEC[id];const N=200,SEG=56;const pts=[];
  pts.push(new T.Vector2(0.0001,-.5));for(let i=0;i<=N;i++){const t=i/N;const end=Math.min(1,Math.min(t,1-t)/.04);pts.push(new T.Vector2(Math.max(.05,prof(t)*(.55+.45*Math.sqrt(end))),t-.5));}pts.push(new T.Vector2(0.0001,.5));
  const ge=new T.LatheGeometry(pts,SEG);const pa=ge.attributes.position;const col=new Float32Array(pa.count*3);const cA=new T.Color(sp.base),cG=new T.Color(sp.gc);
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i);const t=Math.max(0,Math.min(1,y+.5));const a=(Math.atan2(z,x)/(2*Math.PI)+1)%1;const r=Math.hypot(x,z);const d=r>.06?cutAt(sp,t,a):0;
   if(d>0){const k=(r-d)/r;pa.setX(i,x*k);pa.setZ(i,z*k);}
   let c=cA;if(sp.reg)for(const [lo,hi,cc] of sp.reg)if(t>=lo&&t<=hi)c=new T.Color(cc);if(d>.006)c=cG;col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  ge.setAttribute('color',new T.BufferAttribute(col,3));ge.rotateX(Math.PI/2);ge.computeVertexNormals();_blathe[id]=ge;KEEP.add(ge);return ge;}
 const _bgeo={};function barrelGeo(id,base,prof){if(_bgeo[id])return _bgeo[id];const ge=base.clone();const pa=ge.attributes.position;for(let i=0;i<pa.count;i++){const z=pa.getZ(i);const k=prof(z+.5);pa.setX(i,pa.getX(i)*k);pa.setY(i,pa.getY(i)*k);}pa.needsUpdate=true;ge.computeVertexNormals();_bgeo[id]=ge;KEEP.add(ge);return ge;}
 function makeDart(color,setup){setup=setup||{};let sh=setup.shaft||SHAFTS[1],fl=setup.fl||FSHAPES[0],pt=setup.pt||POINTS[0],br=setup.barrel||BARRELS[1];
  if(pt.id==='std'&&!setup.custom){if(br.id==='vapor8')pt=POINTS.find(x=>x.id==='black')||pt;else if(['asp','littler','power'].includes(br.id))pt=POINTS[1];}const g=new T.Group();const metal=new T.MeshStandardMaterial({color:pt.col||0xcfd4d9,metalness:.85,roughness:.3});
  const bl={assassin:.05,neutron:.046,corexl:.05,supergrip:.052,razor:.05,vapor8:.054,zen:.05,mvg:.056,asp:.048,ga:.052,littler:.05,power:.042,iceman:.05}[br.id]||.05,brad={assassin:.0041,neutron:.0047,corexl:.0038,supergrip:.0036,razor:.0039,vapor8:.0031,zen:.0037,mvg:.0032,asp:.0039,ga:.0035,littler:.0036,power:.0044,iceman:.0038}[br.id]||.0038;
  const DG=dartGeo();const z0=-bl/2;let p;if(DG){p=new T.Mesh(DG.point,metal);p.scale.set(.0011,.0011,pt.len);p.position.z=z0;}else{p=new T.Mesh(new T.CylinderGeometry(.0006,.0016,pt.len,8),metal);p.rotation.x=-Math.PI/2;p.position.z=z0-pt.len/2;}g.add(p);if(pt.id!=='std'){const gm=new T.MeshStandardMaterial({color:0x2a2c2f,metalness:.6,roughness:.5});for(let k=0;k<(pt.id==='long'?4:3);k++){const r=new T.Mesh(new T.CylinderGeometry(.00125,.00125,.0008,10),gm);r.rotation.x=Math.PI/2;r.position.z=z0-.003-k*.0022;g.add(r);}}
  const bcol={assassin:0xb08d3a,neutron:0xb08d3a,mvg:0x1a1a1e,littler:0x2a2a30,power:0x8a8f96,vapor8:0x7a7f86,asp:0x3a3f46}[br.id]||0x6e7479;const bmat=new T.MeshStandardMaterial({color:bcol,metalness:.9,roughness:.35});
  let barrel;const LK=BLOOK[br.id];if(DG&&LK){bmat.color.setHex(LK.col);bmat.metalness=LK.met;bmat.roughness=LK.rough;}if(setup.mine&&window.TOPS_BARREL)try{TOPS_BARREL(bmat);}catch(e){}
  if(BSPEC[br.id]&&LK){bmat.color.setHex(0xffffff);bmat.vertexColors=true;barrel=new T.Mesh(barrelLathe(br.id,LK.prof),bmat);barrel.scale.set(brad*1.05,brad*1.05,bl);}
  else if(DG){barrel=new T.Mesh(LK?barrelGeo(br.id,DG.barrel,LK.prof):DG.barrel,bmat);barrel.scale.set(brad*1.05,brad*1.05,bl);
   if(LK&&LK.bands)LK.bands.forEach(([t,w,c])=>{const r=brad*1.05*LK.prof(t)*1.035;const band=new T.Mesh(new T.CylinderGeometry(r,r,bl*w,20,1,true),new T.MeshStandardMaterial({color:c,metalness:.7,roughness:.35,side:T.DoubleSide}));band.rotation.x=Math.PI/2;band.position.z=-bl/2+bl*t;g.add(band);});}else{barrel=new T.Mesh(new T.CylinderGeometry(brad,brad*.9,bl,16),bmat);barrel.rotation.x=Math.PI/2;}barrel.position.z=0;g.add(barrel);
  const rings={assassin:3,neutron:5,corexl:6,supergrip:10,razor:8,vapor8:9,zen:6,mvg:7,asp:4,ga:0,littler:12,power:11,iceman:8}[br.id]||5;for(let k=0;k<(DG?0:rings);k++){const r=new T.Mesh(new T.TorusGeometry(brad*1.02,.0006,6,16),new T.MeshStandardMaterial({color:br.id==='littler'?0xd9b45a:(br.id==='mvg'?0x3a9a4a:0x33373c),metalness:.9,roughness:.4}));r.position.z=z0+bl*(k+.5)/rings;g.add(r);}
  const SETSHAFT={asp:0xb3141b,littler:0x4b2272,mvg:0x1d5e2b,razor:0x5a0f12,vapor8:0x111214,zen:0x0f5a60,power:0x111111,ga:0x16213f,iceman:0x12324f};
  const sCol=(sh.id==='med'&&!setup.custom&&SETSHAFT[br.id])?SETSHAFT[br.id]:(sh.id==='carbon'?0x26282b:sh.id==='long'?0x8fc6e8:(sh.col||0x1a1c1f));
  const sMat=sh.id==='carbon'?new T.MeshStandardMaterial({color:sCol,roughness:.18,metalness:.35}):sh.id==='long'?new T.MeshStandardMaterial({color:sCol,roughness:.15,metalness:.1,transparent:true,opacity:.72}):new T.MeshStandardMaterial({color:sCol,roughness:.45});
  const SR={short:[.0024,.0026],med:[.0021,.0024],long:[.0017,.0023],carbon:[.0018,.0021],spin:[.0021,.0024]}[sh.id]||[.0021,.0024];const shaft=new T.Mesh(new T.CylinderGeometry(SR[0],SR[1],sh.len,12),sMat);shaft.rotation.x=Math.PI/2;shaft.position.z=bl/2+sh.len/2;g.add(shaft);
  {const ringM=new T.MeshStandardMaterial({color:sh.id==='spin'?0xc9ced3:0x0c0d0e,metalness:sh.id==='spin'?.9:.1,roughness:.35});const add=(z,r,h)=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,h,14),ringM);m.rotation.x=Math.PI/2;m.position.z=z;g.add(m);};
   if(sh.id==='spin')add(bl/2+sh.len-.004,.0026,.006);
   else if(sh.id!=='carbon'&&sh.id!=='long')for(let k=0;k<4;k++)add(bl/2+.003+k*.0022,.00235,.0009);
   if(sh.id==='long'){const top=new T.Mesh(new T.CylinderGeometry(.0024,.0024,.003,14),new T.MeshStandardMaterial({color:0xdfe6ea,metalness:.8,roughness:.3}));top.rotation.x=Math.PI/2;top.position.z=bl/2+.0015;g.add(top);}}
  const useSet=!setup.custom&&BFLY[br.id];const fm=new T.MeshStandardMaterial({map:useSet?setFlightTex(br.id):flightTex(color,br.brand||'TOPS'),side:T.DoubleSide,roughness:.45});const s=new T.Shape();
  const SETSHAPE={assassin:'std',neutron:'std',corexl:'std',supergrip:'pear',razor:'std',vapor8:'vapor',zen:'shot',mvg:'std',asp:'std',ga:'ar',littler:'std',power:'vapor',iceman:'std'};
  const shp=fl.id!=='standard'?fl.id:(SETSHAPE[br.id]||'std');
  // outlines in metres: x along the dart (0 = front of flight), y out from the shaft
  if(shp==='slim'){s.moveTo(0,0);s.lineTo(.021,.010);s.quadraticCurveTo(.031,.011,.031,.004);s.lineTo(.031,-.002);s.lineTo(.02,-.004);}
  else if(shp==='kite'){s.moveTo(0,0);s.lineTo(.014,.017);s.lineTo(.034,.004);s.lineTo(.031,-.003);s.lineTo(.016,-.005);}
  else if(shp==='pear'){s.moveTo(0,0);s.bezierCurveTo(.008,.012,.02,.019,.029,.015);s.quadraticCurveTo(.034,.011,.031,-.002);s.lineTo(.018,-.005);}
  else if(shp==='vapor'){s.moveTo(0,0);s.lineTo(.024,.008);s.quadraticCurveTo(.032,.008,.032,.002);s.lineTo(.03,-.002);s.lineTo(.02,-.004);}
  else if(shp==='shot'){s.moveTo(0,0);s.lineTo(.017,.015);s.lineTo(.031,.014);s.lineTo(.027,.006);s.lineTo(.031,-.003);s.lineTo(.02,-.005);}
  else if(shp==='ar'){s.moveTo(0,0);s.lineTo(.012,.018);s.quadraticCurveTo(.02,.019,.026,.012);s.lineTo(.032,.002);s.lineTo(.031,-.003);s.lineTo(.018,-.005);}
  else if(shp==='tenx'){s.moveTo(0,0);s.lineTo(.02,.011);s.lineTo(.029,.012);s.lineTo(.034,.003);s.lineTo(.031,-.003);s.lineTo(.02,-.005);}
  else{s.moveTo(0,0);s.lineTo(.018,.0145);s.quadraticCurveTo(.0305,.0155,.0315,.008);s.lineTo(.031,-.003);s.lineTo(.02,-.005);}
  s.lineTo(0,0);const fz=bl/2+sh.len-.028;
  fm.side=T.FrontSide;const fmB=fm.clone();if(fm.map){fmB.map=fm.map.clone();fmB.map.needsUpdate=true;fmB.map.repeat.set(-fm.map.repeat.x,fm.map.repeat.y);fmB.map.offset.set(1-fm.map.offset.x,fm.map.offset.y);}fmB.side=T.BackSide;const sg=new T.ShapeGeometry(s);
  const edgeG=new T.BufferGeometry().setFromPoints(s.getPoints(12).map(p=>new T.Vector3(p.x,p.y,0)));const edgeM=new T.LineBasicMaterial({color:0x000000,transparent:true,opacity:.55});
  for(let k=0;k<4;k++){const w=new T.Group();w.rotation.z=k*Math.PI/2;const f2=new T.Mesh(sg,fm);f2.rotation.y=-Math.PI/2;f2.position.z=fz;w.add(f2);const eL=new T.LineLoop(edgeG,edgeM);eL.rotation.y=-Math.PI/2;eL.position.z=fz;w.add(eL);const f3=new T.Mesh(sg,fmB);f3.rotation.y=-Math.PI/2;f3.position.z=fz;w.add(f3);g.add(w);}
  g.userData.tipZ=z0-pt.len;return g;}
 function myDart(color){const p=setupParts();return makeDart(color,{shaft:p.shaft,fl:p.fl,pt:p.pt,barrel:barrel(),custom:!!save.flightCustom||!!(window.TOPS_flightReward&&TOPS_flightReward()),mine:true});}
 function oppDart(name){const h=hash(name||'x');return makeDart(0x6fa8d6,{shaft:SHAFTS[h%3],fl:FSHAPES[(h>>>4)%4],pt:POINTS[(h>>>8)%2],barrel:BARRELS[(h>>>12)%BARRELS.length]});}
 // --- first person arm (camera space)
 const armScene=new T.Scene(),armCam=new T.PerspectiveCamera(58,1,.05,5);const fpArm=new T.Group();armScene.add(fpArm);armScene.add(new T.AmbientLight(0xffffff,.35));armScene.add(new T.HemisphereLight(0xfff4e0,0x3a2a1a,.5));const armKey=new T.DirectionalLight(0xfff0dc,1.1);armKey.position.set(-1,2,.5);armScene.add(armKey);const armRim=new T.DirectionalLight(0xcfe3ff,.5);armRim.position.set(1.5,.5,-1);armScene.add(armRim);scene.add(camera);
 const skin=new T.MeshStandardMaterial({color:0xc48f68,roughness:.66,emissive:0x1a1008});
 const forearm=new T.Mesh(new T.CylinderGeometry(.03,.044,1,18),skin);fpArm.add(forearm);const wrist=new T.Mesh(new T.SphereGeometry(1,14,10),skin);wrist.scale.set(.027,.034,.042);fpArm.add(wrist);
 let hand=makeHand(1,skin,null,'throw');hand.scale.setScalar(1.08);fpArm.add(hand);
 const sleeveMat=new T.MeshLambertMaterial({color:0x22262c});const sleeve=new T.Mesh(new T.CylinderGeometry(.06,.07,.6,16),sleeveMat);fpArm.add(sleeve);
 let fpDart=myDart(0xf0b23a);hand.add(fpDart);fpDart.position.set(-.026,.004,.074);fpDart.rotation.set(-.04,Math.PI,0);fpDart.scale.setScalar(1.6);
 const elbowRest=new T.Vector3(.6,-.78,-.9),elbowPull=new T.Vector3(.56,-.52,-.66),handRest=new T.Vector3(.27,-.2,-.62),handPull=new T.Vector3(.2,-.03,-.36),handThrow=new T.Vector3(.08,-.2,-1.05);
 const tmpV=new T.Vector3(),tmpQ=new T.Quaternion(),UP=new T.Vector3(0,1,0);
 function limb(mesh,a,b){tmpV.subVectors(b,a);const L=tmpV.length();mesh.position.copy(a).addScaledVector(tmpV,.5);mesh.scale.set(1,L,1);mesh.quaternion.setFromUnitVectors(UP,tmpV.normalize());}
 function poseArm(p,throwK,pumpK){ // p 0..1.3 pull; throwK 0..1 forward snap; pumpK: fist pump
  const h=new T.Vector3(),el=new T.Vector3();if(pumpK!==undefined){const e=Math.sin(Math.min(1,pumpK)*Math.PI);const bump=Math.abs(Math.sin(pumpK*Math.PI*3))*.08;h.set(.3,-.1+.45*e-bump*e,-.75);el.set(.75,-.7+.2*e,-.9);}else if(throwK>0){const q=Math.sin(Math.min(1,throwK)*Math.PI/2);h.lerpVectors(handPull,handThrow,q);el.lerpVectors(elbowPull,elbowRest,q*.6);}else{const k=Math.min(p,1.3);const kk=k<=1?k:1+(k-1)*.5;h.lerpVectors(handRest,handPull,kk);el.lerpVectors(elbowRest,elbowPull,Math.min(1,kk));}
  const xs=portrait?.55:1;h.x*=xs;el.x*=xs;const tt=performance.now()/1000;const nv=(S&&S.nerves)||0;const br=Math.sin(tt*1.1)*.004+Math.sin(tt*7.3)*.0015*nv;h.y+=br;el.y+=br*.6;h.x+=Math.sin(tt*5.1)*.001*nv;hand.position.copy(h);limb(forearm,el,h);wrist.position.copy(h);wrist.quaternion.copy(forearm.quaternion);const sh=new T.Vector3(.95*(portrait?.55:1),-1.35,-.65);limb(sleeve,sh,el);sleeve.scale.y=1;sleeve.position.lerpVectors(sh,el,.5);
  const cock=throwK>0?-.15:Math.min(p,1)*.5;const d=new T.Vector3(-.1,.12+cock,-1).normalize();hand.lookAt(hand.position.clone().add(d));hand.rotateZ(-.2);}
 // --- hand: wrist at origin, fingers along +z, palm vertical (back of hand faces +x on a right hand), thumb on top
 function makeHand(side,skinM,dartColor,grip){const h=new T.Group();
  const seg=(r0,r1,len)=>new T.CylinderGeometry(r0,r1,len,12);const sph=r=>new T.SphereGeometry(r,12,10);
  const M=(geo,x,y,z,parent=h,mat=skinM)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
  // wrist + palm (box core, rounded by ellipsoids), knuckle ridge, heel of hand
  M(sph(1),0,0,.005).scale.set(.024,.034,.03);
  M(sph(1),0,0,.047).scale.set(.013,.04,.048);M(sph(1),side*.006,.004,.05).scale.set(.016,.036,.044);M(sph(1),-side*.003,-.008,.045).scale.set(.012,.032,.042);M(sph(1),0,.018,.07).scale.set(.013,.02,.03);M(sph(1),0,-.02,.07).scale.set(.013,.02,.03);
  M(sph(1),0,-.03,.03).scale.set(.016,.016,.03); // heel / hypothenar
  const ys=[.03,.0105,-.0105,-.03],lens=[[.03,.024,.019],[.034,.027,.021],[.031,.025,.019],[.024,.019,.015]],rad=[.0105,.011,.0102,.0088];
  const curls=grip==='throw'?[[.78,.9,.55],[.62,.75,.45],[1.05,1.2,.6],[1.2,1.3,.7]]:[[1.1,1.3,.8],[1.15,1.35,.8],[1.2,1.4,.8],[1.25,1.4,.8]];
  const splay=[.07,.02,-.03,-.09];
  ys.forEach((y,i)=>{M(sph(rad[i]*1.02),0,y,.088); // knuckle
   let parent=h,pos=new T.Vector3(0,y,.09);for(let k=0;k<3;k++){const j=new T.Group();j.position.copy(pos);j.rotation.set(k===0?splay[i]:0,-side*curls[i][k],0);parent.add(j);
    const r0=rad[i]*(1-k*.06),r1=rad[i]*(1-(k+1)*.06);const m=M(seg(r0,r1,lens[i][k]),0,0,lens[i][k]/2,j);m.rotation.x=Math.PI/2;M(sph(r1*.98),0,0,lens[i][k],j);parent=j;pos=new T.Vector3(0,0,lens[i][k]);}});
  // thumb: metacarpal from the top edge of the palm, forward and across; then the phalanx
  const t1=new T.Group();t1.position.set(-side*.004,-.032,.02);t1.rotation.set(-.55,-side*.45,0);h.add(t1);M(sph(.016),0,0,0,t1);const tm=M(seg(.015,.0135,.044),0,0,.022,t1);tm.rotation.x=Math.PI/2;
  const t2=new T.Group();t2.position.z=.044;t2.rotation.set(-.45,-side*.35,0);t1.add(t2);M(sph(.0135),0,0,0,t2);const tm2=M(seg(.013,.011,.03),0,0,.015,t2);tm2.rotation.x=Math.PI/2;M(sph(.0112),0,0,.03,t2);
  if(dartColor){const d=makeDart(dartColor);d.position.set(-side*.026,.004,.074);d.rotation.set(-.04,Math.PI,0);h.add(d);h.userData.dart=d;}
  return h;}
 // --- figure builder (player preview + opponents)
 const SPONSOR=['KAURI ARMS','WAITAKERE CLUB','AUCKLAND','DPNZ','TRANS-TASMAN','PDC','PDC'];
 function shirtTexture(look,name,tier){const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');const base=look.shirt,light=base==='#e0e0e0';
  const panel=new T.Color(base).offsetHSL(0,0,light?-.3:.16).getStyle(),ink=light?'#111111':'#ffffff';
  x.fillStyle=base;x.fillRect(0,0,1024,512);
  // u: 0 right side, .25 front, .5 left side, .75 back. v: 0 bottom (hem) .. 1 top (collar)
  const U=u=>u*1024,V=v=>(1-v)*512;
  // side panels (shoulder to hem) with a thin contrast pipe
  [0,.5].forEach(u=>{x.fillStyle=panel;x.fillRect(U(u)-60,0,120,512);x.fillStyle=ink;x.globalAlpha=.35;x.fillRect(U(u)-64,0,4,512);x.fillRect(U(u)+60,0,4,512);x.globalAlpha=1;});
  // pattern per look: diagonal flashes or none
  if(look.pattern===1){x.fillStyle=panel;x.globalAlpha=.55;for(let k=0;k<5;k++){x.beginPath();x.moveTo(U(.25)-140+k*60,512);x.lineTo(U(.25)-100+k*60,512);x.lineTo(U(.25)+60+k*60,160);x.lineTo(U(.25)+20+k*60,160);x.fill();}x.globalAlpha=1;}
  if(look.pattern===2){x.fillStyle=ink;x.globalAlpha=.12;for(let k=0;k<1024;k+=48)x.fillRect(k,0,24,512);x.globalAlpha=1;}
  // placket + buttons (front centre)
  x.fillStyle=panel;x.fillRect(U(.25)-12,V(.98),24,150);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(U(.25)-13,V(.98),2,150);x.fillRect(U(.25)+11,V(.98),2,150);
  x.fillStyle='#f4f1ea';[40,80,120].forEach(dy=>{x.beginPath();x.arc(U(.25),V(.98)+dy,4,0,7);x.fill();});
  // sponsor (front left chest) + small crest right
  x.fillStyle=ink;x.font='800 26px "Saira Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(SPONSOR[tier||0],U(.25)+70,V(.78));
  x.strokeStyle=ink;x.lineWidth=2;x.strokeRect(U(.25)-100,V(.82),40,28);x.font='800 16px "Saira Condensed",Arial';x.fillText('501',U(.25)-80,V(.82)+14);
  // name on the back
  if(name){x.font='800 54px "Saira Condensed","Arial Narrow",Arial,sans-serif';let n=name.toUpperCase();let tw=x.measureText(n).width;if(tw>300){x.font=`800 ${Math.floor(54*300/tw)}px "Saira Condensed","Arial Narrow",Arial,sans-serif`;}x.fillStyle=ink;x.fillText(n,U(.75),V(.8));x.fillStyle=panel;x.fillRect(U(.75)-170,V(.72),340,6);}
  // hem shading + collar band
  const gr=x.createLinearGradient(0,V(.12),0,512);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.25)');x.fillStyle=gr;x.fillRect(0,V(.12),1024,512-V(.12));
  grain(x,1024,512,10);const t=new T.CanvasTexture(c);t.anisotropy=4;return t;}
 function makeFigure(look,name,tier){if(RIG.ready)return makeRigged(look,name,tier);const g=new T.Group();const build=look.build||1; // 0 slim, 1 regular, 2 stocky
  const wide=[.9,1,1.14][build],belly=[0,0,1][build];
  const skinC=new T.Color(look.skin);const skinM=new T.MeshStandardMaterial({color:skinC,roughness:.7,emissive:skinC.clone().multiplyScalar(.12)});const shirtM=new T.MeshStandardMaterial({map:shirtTexture(look,name,tier),roughness:.86});
  const plainShirt=new T.MeshStandardMaterial({color:look.shirt,roughness:.86});const trouM=new T.MeshStandardMaterial({color:look.trousers||0x1b1e26,roughness:.92}),hairM=new T.MeshStandardMaterial({color:look.hair,roughness:.95}),dark=new T.MeshStandardMaterial({color:0x111111,roughness:.6}),white=new T.MeshStandardMaterial({color:0xf4f1ea,roughness:.4});
  const add=(geo,mat,x,y,z,parent=g)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
  // --- legs: hip pivot, thigh, knee, calf, ankle, shoe
  [-1,1].forEach(s=>{const hip=new T.Group();hip.position.set(s*.1*wide,.96,0);g.add(hip);
   const th=add(new T.CylinderGeometry(.095*wide,.078*wide,.47,16),trouM,0,-.235,0,hip);th.scale.z=.9;const knee=new T.Group();knee.position.y=-.47;hip.add(knee);add(new T.SphereGeometry(.078*wide,14,10),trouM,0,0,0,knee).scale.set(1,.9,.9);
   const calf=add(new T.CylinderGeometry(.072*wide,.05,.43,16),trouM,0,-.215,0,knee);add(new T.CylinderGeometry(.052,.05,.05,12),trouM,0,-.44,0,knee);
   const shoe=new T.Group();shoe.position.set(0,-.47,0);knee.add(shoe);add(new T.BoxGeometry(.1,.055,.2),dark,0,.0,-.05,shoe);add(new T.SphereGeometry(.05,12,8),dark,0,-.005,-.15,shoe).scale.set(1,.6,1.2);add(new T.BoxGeometry(.105,.02,.28),new T.MeshStandardMaterial({color:0x2a2622,roughness:.9}),0,-.035,-.06,shoe);add(new T.SphereGeometry(.048,10,8),dark,0,.0,.07,shoe).scale.set(1,.9,.8);
   [-.02,0,.02].forEach(dz=>add(new T.BoxGeometry(.05,.004,.006),new T.MeshStandardMaterial({color:0x777}),0,.03,-.08+dz,shoe));});
  // --- hips / trousers top + belt
  const hips=add(new T.CylinderGeometry(.17*wide,.16*wide,.16,20),trouM,0,.96,0);hips.scale.z=.66;
  const belt=add(new T.CylinderGeometry(.173*wide,.173*wide,.04,28,1,true),dark,0,1.0,0);belt.scale.z=.66;add(new T.BoxGeometry(.05,.03,.012),new T.MeshStandardMaterial({color:0xb08d3a,metalness:.7,roughness:.4}),0,1.0,-.115*wide);
  // --- torso lathe with painted shirt
  const prof=(belly?[[.18,.93],[.182,1.0],[.186,1.1],[.184,1.22],[.192,1.36],[.205,1.48],[.195,1.54],[.13,1.585]]:[[.172,.93],[.166,1.0],[.152,1.12],[.168,1.26],[.19,1.38],[.205,1.48],[.195,1.54],[.13,1.585]]).map(p=>new T.Vector2(p[0]*wide,p[1]));
  const torso=add(new T.LatheGeometry(prof,36,Math.PI/2,Math.PI*2),shirtM,0,0,0);torso.scale.z=.64;
  // collar: two wings + band
  add(new T.TorusGeometry(.07,.016,8,24),plainShirt,0,1.6,0).rotation.x=Math.PI/2;
  [-1,1].forEach(s=>{const c=add(new T.BoxGeometry(.07,.08,.012),plainShirt,s*.055,1.565,-.096);c.rotation.z=s*.55;c.rotation.x=.4;});
  // traps + neck
  const trap=add(new T.SphereGeometry(.17*wide,18,12),plainShirt,0,1.5,0);trap.scale.set(1,.45,.6);
  add(new T.CylinderGeometry(.052,.062,.12,14),skinM,0,1.63,0);
  // --- head: skull lathe (top to chin), jaw, chin, cheeks
  const hp=[[.0,1.885],[.06,1.882],[.095,1.86],[.108,1.82],[.108,1.77],[.1,1.73],[.088,1.70],[.07,1.675],[.045,1.66],[.0,1.655]].map(p=>new T.Vector2(p[0],p[1]));
  const head=add(new T.LatheGeometry(hp,28),skinM,0,0,0);head.scale.set(.92,1,1.0);
  add(new T.SphereGeometry(.022,10,8),skinM,0,1.672,-.07).scale.set(1.3,.7,.8); // chin
  [-1,1].forEach(s=>{const e=add(new T.SphereGeometry(.023,12,10),skinM,s*.098,1.762,.006);e.scale.set(.4,1,.7);add(new T.SphereGeometry(.014,8,6),new T.MeshStandardMaterial({color:skinC.clone().offsetHSL(0,.05,-.08),roughness:.8}),s*.098,1.765,.008).scale.set(.4,.7,.6);});
  // eyes: socket shade, sclera, iris, pupil, upper lid
  const irisC=[0x4a2e1a,0x2f5a7a,0x3a6a3a,0x6b4a2a][hash(name||'x')%4];
  [-1,1].forEach(s=>{const x=s*.037;add(new T.SphereGeometry(.026,10,8),new T.MeshStandardMaterial({color:skinC.clone().offsetHSL(0,0,-.06),roughness:.95}),x,1.772,-.078).scale.set(1.15,.75,.5);
   add(new T.SphereGeometry(.016,12,10),white,x,1.773,-.088);add(new T.SphereGeometry(.0085,10,8),new T.MeshStandardMaterial({color:irisC,roughness:.3}),x,1.773,-.102);add(new T.SphereGeometry(.0045,8,6),dark,x,1.773,-.108);
   const lid=add(new T.SphereGeometry(.0175,12,8,0,Math.PI*2,0,Math.PI*.42),skinM,x,1.776,-.087);lid.rotation.x=-.5;
   const br=add(new T.BoxGeometry(.04,.009,.014),hairM,x+s*.004,1.804,-.095);br.rotation.z=s*.18;br.rotation.x=.3;});
  // nose: bridge + tip + nostrils
  const bridge=add(new T.BoxGeometry(.016,.045,.02),skinM,0,1.765,-.1);bridge.rotation.x=.35;add(new T.SphereGeometry(.014,10,8),skinM,0,1.742,-.112).scale.set(1.1,.9,1);[-1,1].forEach(s=>add(new T.SphereGeometry(.009,8,6),skinM,s*.012,1.738,-.104));
  // mouth: lips
  const lipC=new T.MeshStandardMaterial({color:skinC.clone().offsetHSL(-.01,.08,-.1),roughness:.7});add(new T.SphereGeometry(.02,12,8),lipC,0,1.705,-.098).scale.set(1.1,.3,.5);add(new T.SphereGeometry(.018,12,8),lipC,0,1.698,-.097).scale.set(1,.3,.45);add(new T.BoxGeometry(.034,.0015,.006),dark,0,1.7015,-.106);
  // hair
  const hs=look.hairStyle;
  if(hs==='short'||hs==='long'){const cap=add(new T.SphereGeometry(.114,28,16,0,Math.PI*2,0,Math.PI*.55),hairM,0,1.78,.006);cap.scale.set(.96,1.02,1.04);const fr=add(new T.SphereGeometry(.105,20,10,0,Math.PI*2,0,Math.PI*.26),hairM,0,1.808,-.015);fr.scale.set(1,.75,1.02);}
  if(hs==='short'){add(new T.SphereGeometry(.11,20,12,0,Math.PI*2,0,Math.PI*.35),hairM,0,1.80,.01).scale.set(1,.9,1);}
  if(hs==='long'){add(new T.CylinderGeometry(.108,.1,.2,22,1,true),hairM,0,1.66,.018);[-1,1].forEach(s=>add(new T.BoxGeometry(.03,.18,.08),hairM,s*.105,1.7,.0));}
  if(hs==='buzz'){const buzzC=skinC.clone().lerp(new T.Color(look.hair),.6);const cap=add(new T.SphereGeometry(.109,28,16,0,Math.PI*2,0,Math.PI*.52),new T.MeshStandardMaterial({color:buzzC,roughness:1}),0,1.78,.006);cap.scale.set(.95,1.03,1.03);}
  if(hs==='bald'){add(new T.SphereGeometry(.028,8,6),new T.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.15}),-.03,1.86,-.05);const band=add(new T.CylinderGeometry(.106,.1,.06,22,1,true,Math.PI*.3,Math.PI*1.4),hairM,0,1.74,.012);band.scale.z=1.02;}
  if(look.beard){const bd=add(new T.LatheGeometry([[.0,1.655],[.06,1.66],[.09,1.68],[.104,1.71],[.1,1.74]].map(p=>new T.Vector2(p[0],p[1])),22,Math.PI*.55,Math.PI*.9),hairM,0,0,0);bd.scale.set(.95,1,1.02);add(new T.BoxGeometry(.05,.012,.01),hairM,0,1.712,-.104);}
  // --- arms: deltoid, sleeve, upper arm, elbow, forearm (tapers to wrist), hand
  const arm=(side)=>{const sho=new T.Group();sho.position.set(side*.205*wide,1.5,0);g.add(sho);
   const delt=add(new T.SphereGeometry(.07,16,12,0,Math.PI*2,0,Math.PI*.6),plainShirt,-side*.012,.012,0,sho);delt.scale.set(1,.85,1);
   add(new T.CylinderGeometry(.066,.058,.15,16),plainShirt,0,-.07,0,sho);add(new T.TorusGeometry(.058,.006,6,16),plainShirt,0,-.145,0,sho).rotation.x=Math.PI/2;
   const up=add(new T.CylinderGeometry(.052,.044,.3,16),skinM,0,-.17,0,sho);const bic=add(new T.SphereGeometry(.048,12,10),skinM,0,-.2,-.01,sho);bic.scale.set(1,1.3,.9);
   const elb=new T.Group();elb.position.y=-.31;sho.add(elb);add(new T.SphereGeometry(.045,12,10),skinM,0,0,0,elb);
   add(new T.CylinderGeometry(.044,.03,.27,16),skinM,0,-.135,0,elb);add(new T.SphereGeometry(.03,10,8),skinM,0,-.27,0,elb).scale.set(1.1,.7,.8);
   const hand=makeHand(side,skinM,side>0?0x6fa8d6:null,side>0?'throw':'hold');hand.position.y=-.275;elb.add(hand);return {sho,elb,hd:hand};};
  const L=arm(-1),Rr=arm(1);
  if(look.pint){const glass=new T.Mesh(new T.CylinderGeometry(.036,.03,.15,14,1,true),new T.MeshStandardMaterial({color:0xe8c27a,transparent:true,opacity:.6,roughness:.1,side:T.DoubleSide}));glass.position.set(-.02,.0,.06);glass.rotation.x=Math.PI/2;L.hd.add(glass);const foam=new T.Mesh(new T.CylinderGeometry(.034,.034,.02,14),new T.MeshStandardMaterial({color:0xfff6e0}));foam.position.set(-.02,0,.135);foam.rotation.x=Math.PI/2;L.hd.add(foam);}
  else [0,1].forEach(k=>{const d=makeDart(0x6fa8d6);d.scale.setScalar(.9);d.position.set(.012,.012-k*.022,.075);d.rotation.set(.15,Math.PI,0);L.hd.add(d);});
  const dt=Rr.hd.userData.dart;
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;}});g.userData={pint:!!look.pint,sho:Rr.sho,elb:Rr.elb,dt,hand:Rr.hd,L,R:Rr,hips:g.children.filter(c=>c.isGroup&&c.position.y>.9&&c.position.y<1)};return g;}
 // --- rigged character (Mixamo GLB). Falls back to the primitive figure until loaded.
 const RIG={base:null,rest:null,ready:false,shirtImg:null,waiting:[]};
 function keepAssets(root){try{root.traverse(o=>{if(o.geometry)KEEP.add(o.geometry);if(o.isSkinnedMesh&&o.skeleton)KEEP.add(o.skeleton);const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(!m)return;KEEP.add(m);TEX_KEYS.forEach(k=>{if(m[k])KEEP.add(m[k]);});});});}catch(e){}return root;}
 // GFX: character registry. Every Mixamo model shares the skeleton; bones get a per-model prefix so rest poses never collide.
 const CHARS=['brian','bryce','pete','lewis','david','leonard','megan','elizabeth'],CHAR_F={megan:1,elizabeth:1},RIGS={},RIG_WAIT={};
 window.TOPS_RIGS=()=>{let anim=null,animKeys=[];try{animKeys=Object.keys(ANIM_CACHE);anim=animKeys.length;}catch(e){}return {n:Object.keys(RIGS).length,ids:Object.keys(RIGS),wait:Object.keys(RIG_WAIT).length,waitIds:Object.keys(RIG_WAIT),hairWait:!!HAIR_WAIT,anim,animKeys};};/* #20: animKeys names the cached clips (char|clip), so the recorder can say which clip loaded between matches *//* v14 flight recorder: which character templates are cached (read only) */
 function rigFrom(gltf,key){if(!RIG.rest)RIG.rest={};const sc=gltf.scene;sc.traverse(o=>{if(o.isBone)o.name=key+'_'+o.name.replace(/^mixamorig\d*:?/,'');});sc.updateMatrixWorld(true);
  if(key==='remy'){const box=new T.Box3().setFromObject(sc);const h=box.max.y-box.min.y;const k=(h>1.45&&h<2.1)?1:1.78/h;sc.scale.setScalar(k);sc.position.y=-box.min.y*k;}sc.updateMatrixWorld(true); /* Mixamo cast: metric, feet at the origin (bbox is unreliable on quantised meshes) */
  const root=new T.Group();sc.rotation.y=Math.PI;root.add(sc);root.updateMatrixWorld(true);
  root.traverse(o=>{if(o.isBone){o.updateWorldMatrix(true,false);RIG.rest[o.name]={q:o.getWorldQuaternion(new T.Quaternion()),p:o.getWorldPosition(new T.Vector3()),lq:o.quaternion.clone()};}});
  let shirtImg=null;root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(/Helmet/i.test(o.name)||(key==='pete'&&/Hair/i.test(o.name)))o.visible=false;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(key!=='remy'&&!/Hair|Eyelash/i.test(m.name||'')&&!/Hair|Eyelash/i.test(o.name)){m.transparent=false;m.alphaTest=0;m.depthWrite=true;m.opacity=1;}if(key!=='remy'){m.metalness=0;m.metalnessMap=null;m.roughnessMap=null;if(m.specularIntensity!==undefined)m.specularIntensity=.3;const skin=/body/i.test(m.name||'')&&/body/i.test(o.name);m.roughness=/hair/i.test(m.name||'')?.6:skin?.62:.86;if(m.specularMap)m.specularMap=null;m.needsUpdate=true;}if(m.map&&/Top/i.test(m.name||o.name))shirtImg=m.map.image;if(/Hair|Eyelash/i.test(m.name||'')){m.transparent=true;m.alphaTest=.4;m.side=T.DoubleSide;m.depthWrite=true;}});}});
  keepAssets(root);return {base:root,shirtImg,key};}
 // GFX: Mixamo clips (idles, drinking, talking, reactions), retargeted by bone name to each model.
 let ANIMS=null,ANIM_WAIT=false;const ANIM_CACHE={};
 let animsPend=false;function animsFlush(){if(!animsPend)return;animsPend=false;try{charsChanged();}catch(e){}}
 function loadAnims(){if(ANIMS||ANIM_WAIT||window.GFX_LEGACY||!THREE.GLTFLoader)return;ANIM_WAIT=true;glbLoad('assets/anims.glb',g=>{ANIMS={};g.animations.forEach(c=>{if(window.TOPS_S3FLAG)c.tracks=c.tracks.filter(t=>!/\.(scale|position)$/.test(t.name));/* S3: the Lab figure sets its own joint positions and toy scales; clips keep only rotations */ANIMS[c.name]=c;});/* #20 (Hayden 17:36): a clip file landing mid-match used to rebuild both figures and the venue there and then (charsChanged); now that waits for the hub */{const h=document.getElementById('hub');const inHub=!!(h&&!h.hidden)&&!(typeof S!=='undefined'&&S&&!S.done);if(!inHub){animsPend=true;return;}}/* only rebuild in the hub itself: never mid-match, on the result screen (a win's celebration requests clips there) or the title (ChatGPT P1) */try{charsChanged();}catch(e){}},e=>{ANIM_WAIT=false;console.warn('anims',e);});}
 function clipFor(name,key){if(!ANIMS||!ANIMS[name])return null;const ck=key+'|'+name;if(ANIM_CACHE[ck])return ANIM_CACHE[ck];const src=ANIMS[name];const tracks=[];
  src.tracks.forEach(tr=>{const m=tr.name.match(/^(?:mixamorig\d*:?)?([A-Za-z0-9_]+)\.(quaternion|position)$/);if(!m)return;const bone=m[1],prop=m[2];if(prop==='position'&&bone!=='Hips')return;const t=tr.clone();t.name=key+'_'+bone+'.'+prop;
   if(prop==='position'){const v=t.values;let mx=0;for(let i=0;i<v.length;i++)mx=Math.max(mx,Math.abs(v[i]));const sc=mx>5?.01:1;const x0=v[0],y0=v[1],z0=v[2];const rh=RIG.rest[key+'_Hips'];const ry=rh?rh.p.y:1;const sit=/^sit/.test(name)?-(ry-.5):0;for(let i=0;i<v.length;i+=3){v[i]=(v[i]-x0)*sc;v[i+1]=ry+(v[i+1]-y0)*sc+sit;v[i+2]=(v[i+2]-z0)*sc;}}tracks.push(t);});
  return ANIM_CACHE[ck]=new T.AnimationClip(name,src.duration,tracks);}
 function playClip(fig,name,opts={}){const ck=fig.userData&&fig.userData.ck;if(!ck||ck==='remy')return null;loadAnims();const c=clipFor(name,ck);if(!c)return null;const mx=fig.userData.mixer||(fig.userData.mixer=new T.AnimationMixer(fig));
  const a=mx.clipAction(c);if(fig.userData.act&&fig.userData.act!==a){a.reset().play();fig.userData.act.crossFadeTo(a,opts.fade||.4,false);}else a.play();if(opts.t!=null)a.time=opts.t%c.duration;a.setLoop(opts.once?T.LoopOnce:T.LoopRepeat);a.clampWhenFinished=!!opts.once;fig.userData.act=a;return a;}
 function loadChar(key){if(RIGS[key]||RIG_WAIT[key]||!THREE.GLTFLoader)return;RIG_WAIT[key]=1;glbLoad((window.TOPS_ASSETS||'assets/')+'chars/'+key+'.glb',g=>{RIGS[key]=rigFrom(g,key);delete RIG_WAIT[key];/* S3 (Delivery QA slow 3G 13:01): the S3 rig is enough to build every figure; if it beats the in-page rig file, the game takes it as its rig */if(window.TOPS_S3FLAG&&key===S3_RIG){if(!RIG.ready){RIG.base=RIGS[key].base;RIG.ready=true;RIG.waiting.forEach(f=>{try{f();}catch(e){}});RIG.waiting.length=0;}{const live=typeof S!=='undefined'&&S&&!S.done;if(live){try{s3SwapLive();}catch(e){}}}}/* ENG-7 (QA-B3): like the clip file (#20b) and hair.glb (CAR-7a), a character file that lands while a match is live (a new opponent on a slow connection) doesn't rebuild the figures and the venue mid-match; the stand-in stays for this match and the hub rebuilds. Only a live match and the result screen wait (Q&D 02:4x): the creator, title and hub swap the figure as soon as the file lands, as before */{const live=typeof S!=='undefined'&&S&&!S.done;const rs=document.getElementById('result');if(live||!!(rs&&!rs.hidden)){animsPend=true;/* ENG-CHARCACHE (Q&D P1): an opponent drawn as the stand-in gets its real figure now, the way pairs and online turns swap the opponent mid-match, at a moment it's off screen; the venue and the player's figures still wait for the hub */if(live)try{swapOppStand(key);}catch(e){}return;}}try{charsChanged();}catch(e){}},e=>{delete RIG_WAIT[key];console.warn('char',key,e);});}
 // GFX: face kit — transplantable hairstyles (static meshes in head-bone space), beard, hair/skin colour, glasses, cap.
 const HEADS={"brian":{"min":[-0.0886,-0.0355,-0.0795],"max":[0.0886,0.192,0.1498]},"bryce":{"min":[-0.0952,-0.0172,-0.0652],"max":[0.0953,0.2269,0.161]},"pete":{"min":[-0.0959,-0.0239,-0.0759],"max":[0.0948,0.2149,0.1554]},"lewis":{"min":[-0.0881,-0.0209,-0.0659],"max":[0.0864,0.2196,0.142]},"david":{"min":[-0.0883,-0.016,-0.0911],"max":[0.0883,0.2172,0.1519]},"leonard":{"min":[-0.0956,-0.0265,-0.0669],"max":[0.0957,0.2094,0.1521]},"megan":{"min":[-0.0903,-0.0177,-0.0452],"max":[0.0905,0.2012,0.1726]},"elizabeth":{"min":[-0.0857,-0.0215,-0.0588],"max":[0.084,0.2086,0.153]}},HAIR_SRC={shaggy:'bryce',curly:'david',long:'elizabeth',short:'leonard',pony:'megan',pete:'pete',beard:'pete'};
 let HAIRLIB=null,HAIR_WAIT=false;const HAIRCOL_CACHE={};
 function loadHair(){if(HAIRLIB||HAIR_WAIT||!THREE.GLTFLoader)return;HAIR_WAIT=true;glbLoad((window.TOPS_ASSETS||'assets/')+'hair.glb',g=>{HAIRLIB={};keepAssets(g.scene);g.scene.traverse(o=>{if(o.isMesh&&/^hair_/.test(o.name)){o.geometry.rotateX(Math.PI/2);const hh=(o.userData&&o.userData.head_h)||.24;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{m.transparent=true;m.alphaTest=.4;m.side=T.DoubleSide;m.depthWrite=true;m.metalness=0;m.metalnessMap=null;m.roughnessMap=null;m.roughness=.6;});HAIRLIB[o.name.slice(5)]={mesh:o,hh};}});/* CAR-7a (Delivery QA 19:52): like #20's clip file, hair.glb landing mid-match must not rebuild both figures and the venue there and then (the board pane went blank: wires only); it waits for the hub */{const h=document.getElementById('hub');const inHub=!!(h&&!h.hidden)&&!(typeof S!=='undefined'&&S&&!S.done);if(!inHub){animsPend=true;return;}}try{charsChanged();}catch(e){}},e=>{HAIR_WAIT=false;console.warn('hair',e);});}
 /* CAR-7c: a beard that reads on pale skin. The library beard is hair cards from a 256 px strand atlas with mostly half-transparent texels,
    so alphaTest .4 cuts it into patches with hard edges. Soft: alpha boosted and spread one texel (denser, no holes), strands keep their
    light/dark (no flat block), a lower cut-off with blending for a soft edge, and no depth write so it never punches holes in the skin. */
 const SOFTB_CACHE={};function softBeardMap(map,hex,boost){if(!map||!map.image)return map;const ck=hex+'|'+boost;if(SOFTB_CACHE[ck])return SOFTB_CACHE[ck];const img=map.image,w=img.width||256,h=img.height||256;
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0,w,h);const d=x.getImageData(0,0,w,h),a=d.data;const A=new Uint8ClampedArray(w*h);for(let i=0;i<w*h;i++)A[i]=a[i*4+3];
  const col=new T.Color(hex),hx=col.getHex(),cr=(hx>>16&255),cg=(hx>>8&255),cb=(hx&255);
  for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=y*w+xx;let m=A[i];if(xx>0)m=Math.max(m,A[i-1]*.8);if(xx<w-1)m=Math.max(m,A[i+1]*.8);if(y>0)m=Math.max(m,A[i-w]*.8);if(y<h-1)m=Math.max(m,A[i+w]*.8);
   const p=i*4;const l=(a[p]*.3+a[p+1]*.59+a[p+2]*.11)/255;const k=.72+.56*l;a[p]=Math.min(255,cr*k);a[p+1]=Math.min(255,cg*k);a[p+2]=Math.min(255,cb*k);a[p+3]=Math.min(255,m*boost);}
  x.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.flipY=map.flipY;t.encoding=T.sRGBEncoding;KEEP.add(t);return SOFTB_CACHE[ck]=t;}
 function trimBeard(o,head,B){/* the library beard wraps round the back of the neck; on pale skin that strip reads as dirt: keep only the front (chin, jaw, cheeks) */
  try{const e=B.RightEye||B.LeftEye;if(!e)return;const w=new T.Vector3();head.updateWorldMatrix(true,false);e.getWorldPosition(w);head.worldToLocal(w);const zc=w.z*.3;
   const g=o.geometry,P=g.attributes.position,I=g.index;if(!I)return;o.updateMatrix();const M=o.matrix,v=new T.Vector3();const z=new Float32Array(P.count);for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(M);z[i]=v.z;}
   const src=I.array,keep=[];for(let t=0;t<src.length;t+=3){const c=(z[src[t]]+z[src[t+1]]+z[src[t+2]])/3;if((zc>0?c>zc:c<zc))keep.push(src[t],src[t+1],src[t+2]);}
   if(!keep.length||keep.length===src.length)return;const ng=g.clone();ng.setIndex(keep);o.geometry=ng;}catch(e){}}
 function softBeard(head,hex,B,opt){const so=(opt&&typeof opt==='object')?opt:{};try{head.children.forEach(o=>{if(!o.isMesh||o.userData.hairStyle!=='beard'||!HAIRLIB||!HAIRLIB.beard)return;const src=HAIRLIB.beard.mesh.material;const ms=Array.isArray(src)?src:[src];
  const mm=ms.map(m=>{const c=m.clone();c.map=softBeardMap(m.map,hex,so.a||1);c.alphaTest=.05;c.transparent=true;c.depthWrite=false;c.opacity=so.o||.85;c.needsUpdate=true;return c;});o.material=mm.length===1?mm[0]:mm;o.renderOrder=2;if(B&&!window.TOPS_SOFTB_NOTRIM)trimBeard(o,head,B);o.scale.multiplyScalar(so.s||.95);});}catch(e){}}
 function tintMap(map,hex,key){if(!map||!map.image)return map;const ck=key+'|'+hex;if(HAIRCOL_CACHE[ck])return HAIRCOL_CACHE[ck];const img=map.image,w=Math.min(1024,img.width||1024),h=Math.min(1024,img.height||1024);const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0,w,h);const d=x.getImageData(0,0,w,h),a=d.data;const col=new T.Color(hex),hx=col.getHex(),cr=(hx>>16&255)/255,cg=(hx>>8&255)/255,cb=(hx&255)/255;
  for(let i=0;i<a.length;i+=4){const l=Math.min(1,(a[i]*.3+a[i+1]*.59+a[i+2]*.11)/255*2.2);a[i]=Math.min(255,255*cr*l);a[i+1]=Math.min(255,255*cg*l);a[i+2]=Math.min(255,255*cb*l);}x.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.flipY=map.flipY;t.encoding=T.sRGBEncoding;KEEP.add(t);/* #15: cached for reuse, so a freed figure must not dispose it (the next figure re-uploaded it) */return HAIRCOL_CACHE[ck]=t;}
 /* ===== S3 Vinyl Toy (Hayden 19 Nov; Style Lab recipe): glossy toy materials + toy proportions on the rigged figures. Only with TOPS_S3FLAG (Career's single S3 flag).
    Two finishes: 'full' (clearcoat, MeshPhysicalMaterial) and 'phone' (no clearcoat, standard material, a touch rougher, more sheen
    from the environment), so Hayden can compare them before one is picked for phones. ?s3gloss=full|phone (remembered) forces one;
    default: phone finish on phones and tablets, full elsewhere. */
 const VINYL={hair:[.4,.38],skin:[.62,.14],shirt:[.72,.16],pants:[.66,.17],shoe:[.32,.6],eye:[.22,.5],other:[.6,.15]};
 const S3G=(()=>{try{const q=new URLSearchParams(location.search).get('s3gloss');if(q==='full'||q==='phone')localStorage.setItem('tops_s3gloss',q);const v=localStorage.getItem('tops_s3gloss');if(v==='full'||v==='phone')return v;}catch(e){}return /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent||'')?'phone':'full';})();
 window.TOPS_S3GLOSS=()=>S3G;
 function vinylPart(o,m){const n=(o.name||'')+' '+((m&&m.name)||'');if(o.userData&&o.userData.hairStyle)return 'hair';if(/Eye(?!lash)|Cornea|Iris/i.test(n))return 'eye';if(/Hair|Lash|Brow|Beard/i.test(n))return 'hair';if(/Shoe|Sneaker|Boot/i.test(n))return 'shoe';if(/Bottom|Pant|Short|Trouser|Jean/i.test(n))return 'pants';if(/Top|Shirt|Hoody|Sweater|Vest|Jacket/i.test(n))return 'shirt';if(/Body|Skin|Head|Hand|Arm|Leg/i.test(n))return 'skin';return 'other';}
 function vinylMat(m,part,mode){if(!m||!m.isMeshStandardMaterial||m.userData.s3v)return m;const g=VINYL[part]||VINYL.other;let n;
  if(mode==='full'&&!m.transparent){n=new T.MeshPhysicalMaterial();T.MeshStandardMaterial.prototype.copy.call(n,m);n.defines={STANDARD:'',PHYSICAL:''};n.clearcoat=g[1];n.clearcoatRoughness=.25;n.roughness=g[0];}
  else{n=m.clone();n.roughness=Math.min(.9,g[0]+.08);}
  n.metalness=0;n.envMapIntensity=(m.envMapIntensity==null?.5:m.envMapIntensity)*(mode==='full'?1.1:1.3);n.userData=Object.assign({},m.userData,{s3v:mode});
  const prev=Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,pk=(m.customProgramCacheKey?m.customProgramCacheKey():'')+(prev?'|'+prev.toString():'');
  /* saturation up (x1.3, the Lab's recipe) on the texture colour, whatever the shirt or kit hook did first */
  n.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{float l3=dot(diffuseColor.rgb,vec3(.299,.587,.114));diffuseColor.rgb=max(vec3(0.),mix(vec3(l3),diffuseColor.rgb,1.3));}');};
  n.customProgramCacheKey=()=>'s3v|'+mode+'|'+pk;return n;}
 /* toy proportions (Lab: head x1.32, hands x1.15, feet x1.12, forearms .92 long). Bone scales; everything on the head (hair, beard,
    glasses, cap) is a child of the head bone, so it scales with it. The clip file's scale tracks are dropped in S3 so clips can't reset them. */
 function vinylFig(fig,B){const mode=S3G;fig.traverse(o=>{if(!o.isMesh||o.userData.spare||o===fig.userData.dt)return;if(Array.isArray(o.material))o.material=o.material.map(m=>vinylMat(m,vinylPart(o,m),mode));else o.material=vinylMat(o.material,vinylPart(o,o.material),mode);});
  const sc=(b,x,y,z)=>{if(b){b.scale.set(b.scale.x*x,b.scale.y*y,b.scale.z*z);}};
  sc(B.Head,1.32,1.32,1.32);['Right','Left'].forEach(s=>{sc(B[s+'ForeArm'],1,.92,1);sc(B[s+'Hand'],1.15,1.15/.92,1.15);sc(B[s+'Foot'],1.12,1.12,1.12);});
  fig.userData.s3v=mode;}
 window.TOPS_VINYL={part:vinylPart,mat:vinylMat,fig:vinylFig};
 /* the 5 Season 3 base looks (Style Lab: Ray, Kai, Tama, Dazza, Mia) as creator presets on the game's models. The creator starts from
    one and the player changes skin tone, hair, style and accessories on top; save.look keeps the same fields as today. */
 /* the 5 Season 3 bases (the Style Lab's players). The creator writes save.look.s3={base,...}; see TOPS_S3_OPTIONS for the choices. */
 window.TOPS_S3_BASES=['ray','kai','tama','dazza','mia'].map(id=>({id,name:({ray:'Ray',kai:'Kai',tama:'Tama',dazza:'Dazza',mia:'Mia'})[id],tag:({ray:'The Veteran',kai:'The Young Gun',tama:'The Bruiser',dazza:'The Showman',mia:'The Ace'})[id],look:{s3:{base:id}}}));
 window.TOPS_S3_LOOK=id=>{const b=(window.TOPS_S3_BASES||[]).find(x=>x.id===id);return b?JSON.parse(JSON.stringify(b.look)):null;};
 /* shader warm-up (S3): the Vinyl materials are new programs; compile them on the hub, once per page, so the first match frame doesn't stall */
 let s3Warm=false;function s3WarmUp(){if(s3Warm||!window.TOPS_S3FLAG||!RIG.ready)return;const h=document.getElementById('hub');if(!h||h.hidden||(typeof S!=='undefined'&&S&&!S.done))return;s3Warm=true;
  const t0=performance.now();try{const figs=[makeFigure(save.look||{},save.name||'You',0),makeFigure(lookFor('Warm Up'),'Warm Up',0)];figs.forEach(f=>pScene.add(f));renderer.compile(pScene,pCam);if(s3Back&&s3Back.material.map)renderer.compile(scene,camera);figs.forEach(f=>{pScene.remove(f);disposeTree(f);});}catch(e){console.warn('s3 warm',e);}
  try{window.TOPS_LOG&&TOPS_LOG.log('s3_warm',{ms:Math.round(performance.now()-t0)});}catch(e){}}
 setInterval(()=>{if(window.TOPS_S3FLAG&&!s3Warm)s3WarmUp();},1500);
 /* ===== S3 Vinyl figures (Hayden 19 Nov): the Style Lab's sculpted toy players (Ray, Kai, Tama, Dazza, Mia) and every opponent, built
    from the Lab's own geometry and carried by the game's skeleton, so every pose, clip, walk-on and throw keeps working. One character
    file (S3_RIG) gives the skeleton for everyone; its skinned meshes are hidden. Each Lab body part is a rigid piece on its bone.
    Player look: save.look.s3 = {base, body, skin, hair, hairC, face, beardC, glasses, band, shirt}; opponents: the same builder seeded
    from the name (same look every meeting). Only with TOPS_S3FLAG. */
 let s3MeBuild=false; const S3_RIG='leonard';/* S3: the darts in the toy fists are drawn bigger (Overseer 09:38: the game-size dart read as a toothpick in the toy hand); thrown and board darts keep their size */const S3_DART=1.35;
 const S3B={skinny:{sh:.27,chest:.19,waist:.155,hip:.165,depth:.62,arm:.78,leg:.8,neck:.072},standard:{sh:.31,chest:.235,waist:.205,hip:.2,depth:.64,arm:1,leg:1,neck:.086},female:{sh:.27,chest:.215,waist:.165,hip:.215,depth:.66,arm:.8,leg:.96,neck:.068,bust:1},heavy:{sh:.33,chest:.27,waist:.29,hip:.26,depth:.8,arm:1.22,leg:1.28,neck:.1,belly:.2},muscle:{sh:.37,chest:.3,waist:.2,hip:.2,depth:.6,arm:1.42,leg:1.18,neck:.108,pecs:1}};
/* Vinyl v2 switch (Overseer 17:05, ship hidden): ?v2=1 turns it on and sticks (localStorage tops_v2), ?v2=0 turns it off; off = the 4.02 figures exactly */
 const V2ON=!!window.TOPS_V2FLAG;/* set with TOPS_S3FLAG at the top of the file */
 const S3L_V2={/* Vinyl v2 bases (Director vinyl2.js LOOKS): black TOPS shirts with red swooshes, warm saturated skin */
  ray:{name:'Ray',tag:'The Veteran',body:'heavy',skin:0xeeb08a,shirt:0x141416,hair:'horseshoe',hairC:0xc8c4c0,brow:0x9a9590,eye:0x3a2a20,face:'clean',glasses:true},
  kai:{name:'Kai',tag:'The Young Gun',body:'standard',skin:0xeea472,shirt:0x141416,hair:'quiff',hairC:0x7a3e22,brow:0x3a1e10,eye:0x4a2a16,face:'clean'},
  tama:{name:'Tama',tag:'The Bruiser',body:'muscle',skin:0xb06a3e,shirt:0x141416,hair:'curly',hairC:0x1a1210,brow:0x1a1210,eye:0x2a1a10,face:'clean'},
  dazza:{name:'Dazza',tag:'The Showman',body:'standard',skin:0xeca676,shirt:0x141416,hair:'short',hairC:0x4a2a18,brow:0x3a2010,eye:0x3a2416,face:'full',beardC:0x5a3420,cap:true,capC:0xd21e28},
  mia:{name:'Mia',tag:'The Ace',body:'female',skin:0xf3b486,shirt:0x141416,hair:'ponytail',hairC:0xf0c040,brow:0x9a6a2a,eye:0x3a2416,face:'clean',soft:true,lash:true,earring:0xf2b632}};
 const S3L_V1={
  ray:{name:'Ray',tag:'The Veteran',body:'heavy',dep:1.1,legK:.95,skin:0xe2a17e,shirt:0x7a1f2b,trim:0xf2f2f2,hair:'horseshoe',hairC:0x75706a,face:'walrus',beardC:0xa8a29a,brow:0x8d8780,glasses:true,nose:1.25,jaw:1.15,shW:.92,fore:1.1,big:true},
  kai:{name:'Kai',tag:'The Young Gun',body:'skinny',armK:.92,legK:1.04,skin:0xa8693f,shirt:0x0e7c86,trim:0xf2f2f2,hair:'quiff',hairC:0x141010,face:'clean',brow:0x141010,nose:.9,jaw:.92,shW:.96,fore:.95},
  tama:{name:'Tama',tag:'The Bruiser',body:'muscle',skin:0x7f4d30,shirt:0x2a2b33,trim:0xd9252e,hair:'buzz',hairC:0x120d0b,face:'goatee',beardC:0x120d0b,brow:0x120d0b,nose:1.1,jaw:1.18,shW:1.15,chW:1.16,fore:1.05,waistK:.92},
  dazza:{name:'Dazza',tag:'The Showman',body:'standard',legK:1.06,skin:0xe8b08a,shirt:0xe0a21c,trim:0x1c1c22,hair:'mullet',hairC:0x8f6326,face:'full',beardC:0x8c5f2a,brow:0x9a6c36,nose:1.05,jaw:1.0,band:true,shW:1.06,waistK:.9},
  mia:{name:'Mia',tag:'The Ace',body:'female',skin:0xc98e64,shirt:0x5b2a86,trim:0xf2f2f2,hair:'ponytail',hairC:0x3a2416,face:'clean',brow:0x2e1c11,nose:.78,jaw:.84,shW:.92,fore:.88,soft:true,handK:.9}};
 const S3L=V2ON?S3L_V2:S3L_V1;
 window.TOPS_S3_LABLOOKS=S3L;
 /* S3 pro look-alikes (Overseer 10:15; Director's set, S3 Art s3/pros/pros.json): a named real pro (van Gerwen, Littler, Humphries, Price,
    Anderson, van Barneveld, Taylor, Wright, Smith, Aspinall, Cross, Clayton, Bunting, Heta, Noppert, Dobey) is built from their own look on the
    same Vinyl builder, matched by full name; everyone else stays seeded. If the build ships s3/pros/pros.json (hashed by build.js), it replaces
    this copy when it lands, so Art can tune the looks without an Engine change. */
 /* Hayden 10:32: the look-alikes are a patch AFTER launch. Off by default: every real-name pro and legend is a seeded Vinyl player from
    the builder, like everyone else. On only with ?s3pros=1 (remembered as tops_s3pros) or window.TOPS_S3PROS=true, for the patch work. */
 const S3PROS_ON=(()=>{try{const q=new URLSearchParams(location.search).get('s3pros');if(q==='1'||q==='0')localStorage.setItem('tops_s3pros',q);return window.TOPS_S3PROS===true||localStorage.getItem('tops_s3pros')==='1';}catch(e){return window.TOPS_S3PROS===true;}})();
 let S3PRO={"vangerwen":{"name":"Michael van Gerwen","body":"standard","skin":15712924,"shirt":8046915,"trim":1316906,"hair":"none","hairC":1118481,"face":"goatee","beardC":3814689,"brow":3814689,"nose":1.05,"jaw":1.12,"shW":1.04},"littler":{"name":"Luke Littler","body":"heavy","skin":15910818,"shirt":1776415,"trim":16734236,"hair":"short","hairC":2759956,"face":"stubble","beardC":2759956,"brow":2759956,"nose":1.0,"jaw":1.08,"big":true},"humphries":{"name":"Luke Humphries","body":"standard","skin":15581338,"shirt":2912209,"trim":15921906,"hair":"short","hairC":5913122,"face":"full","beardC":5913122,"brow":5913122,"nose":1.0,"jaw":1.0},"price":{"name":"Gerwyn Price","body":"muscle","skin":15250572,"shirt":2059222,"trim":15921906,"hair":"buzz","hairC":1118481,"face":"full","beardC":1118481,"brow":1118481,"nose":1.1,"jaw":1.18,"shW":1.15,"chW":1.16},"anderson":{"name":"Gary Anderson","body":"heavy","skin":15778974,"shirt":1915000,"trim":15921906,"hair":"quiff","hairC":14274472,"face":"clean","brow":12105912,"nose":1.15,"jaw":1.1,"big":true},"barneveld":{"name":"Raymond van Barneveld","body":"heavy","skin":15712924,"shirt":14969631,"trim":1316906,"hair":"horseshoe","hairC":7895160,"face":"clean","brow":6710886,"glasses":true,"nose":1.2,"jaw":1.1,"big":true},"power":{"name":"Phil Taylor","body":"heavy","skin":15778974,"shirt":2829099,"trim":13214247,"hair":"short","hairC":11053224,"face":"clean","brow":9211020,"nose":1.15,"jaw":1.15,"big":true},"wright":{"name":"Peter Wright","body":"skinny","skin":15581338,"shirt":7024547,"trim":16766720,"hair":"quiff","hairC":4170573,"face":"clean","brow":3355443,"nose":1.1,"jaw":0.95},"smith":{"name":"Michael Smith","body":"standard","skin":15581338,"shirt":1118481,"trim":14231854,"hair":"short","hairC":2759956,"face":"full","beardC":2759956,"brow":2759956,"nose":1.05,"jaw":1.05},"aspinall":{"name":"Nathan Aspinall","body":"standard","skin":15581338,"shirt":1981066,"trim":16765440,"hair":"short","hairC":3876632,"face":"full","beardC":3876632,"brow":3876632,"nose":1.0,"jaw":1.05},"cross":{"name":"Rob Cross","body":"standard","skin":15778974,"shirt":15844367,"trim":1316906,"hair":"short","hairC":6047776,"face":"clean","brow":5913122,"nose":1.0,"jaw":1.0},"clayton":{"name":"Jonny Clayton","body":"skinny","skin":15581338,"shirt":949382,"trim":15921906,"hair":"short","hairC":2759956,"face":"stubble","beardC":2759956,"brow":2759956,"nose":1.05,"jaw":0.95},"bunting":{"name":"Stephen Bunting","body":"heavy","skin":15910818,"shirt":998801,"trim":15921906,"hair":"buzz","hairC":5913122,"face":"clean","brow":5913122,"nose":1.0,"jaw":1.15,"big":true},"heta":{"name":"Damon Heta","body":"muscle","skin":10119749,"shirt":1710618,"trim":15909424,"hair":"buzz","hairC":1118481,"face":"goatee","beardC":1118481,"brow":1118481,"nose":1.1,"jaw":1.2,"shW":1.12},"noppert":{"name":"Danny Noppert","body":"skinny","skin":15910818,"shirt":15760412,"trim":1316906,"hair":"short","hairC":13214584,"face":"clean","brow":10520650,"nose":1.05,"jaw":0.95,"legK":1.06},"dobey":{"name":"Chris Dobey","body":"heavy","skin":15581338,"shirt":3046706,"trim":15921906,"hair":"short","hairC":2759956,"face":"full","beardC":2759956,"brow":2759956,"nose":1.0,"jaw":1.1}};
 const s3ProKey=n=>{const k=String(n||'').toLowerCase().replace(/[^a-z]/g,'');for(const id in S3PRO){const nm=String(S3PRO[id].name||'').toLowerCase().replace(/[^a-z]/g,'');if(nm&&nm===k)return id;}return null;};
 window.TOPS_S3_PROS=()=>S3PRO;window.TOPS_S3_PROS_ON=()=>S3PROS_ON;
 setTimeout(()=>{try{const h=window.TOPS_S3V&&TOPS_S3V['s3/pros/pros.json'];if(!window.TOPS_S3FLAG||!S3PROS_ON||!h)return;fetch('s3/pros/pros.json?v='+h).then(r=>r.ok?r.json():null).then(j=>{if(j&&typeof j==='object'&&Object.keys(j).length){S3PRO=j;try{window.TOPS_LOG&&TOPS_LOG.log('s3_pros',{n:Object.keys(j).length});}catch(e){}}}).catch(()=>{});}catch(e){}},0);
 window.TOPS_S3_OPTIONS={base:Object.keys(S3L),body:Object.keys(S3B),hair:V2ON?['short','buzz','quiff','curly','mullet','horseshoe','ponytail','bald']:['short','buzz','quiff','mullet','horseshoe','ponytail','bald'],face:['clean','stubble','full','goatee','walrus'],skin:['#f1c9a5','#e8b08a','#e2a17e','#c98e64','#a8693f','#7f4d30','#6a4330'],hairC:['#141010','#3a2416','#5a3a22','#8f6326','#b8863b','#75706a','#c9c4bc','#c9352d'],accessories:['glasses','band','cap'],save:'save.vlook={v:1,base,skin,hair,hairC,face,faceC,acc:[glasses|band|cap],shirt,capC,at}'};
 const s3h=s=>{let h=2166136261;for(const c of String(s||'x'))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
 /* the player's S3 look: Career's save.vlook={v:1,base,skin,hair,hairC,face,faceC,acc:[],shirt,capC,at} (top level of the S3 save); a look passed
    with .s3 (creator preview, TOPS_S3_LOOK) wins. acc: 'glasses','band','cap'. */
 function s3Norm(v){if(!v||typeof v!=='object')return {};const o={};['base','body','skin','hair','hairC','face','beardC','shirt','capC'].forEach(k=>{if(v[k]!=null&&v[k]!=='')o[k]=v[k];});if(v.faceC)o.beardC=v.faceC;
  if(Array.isArray(v.acc)&&(!V2ON||v.accSet||v.acc.length)){/* an untouched acc:[] keeps the base's own extras (Ray's glasses, Dazza's cap) */o.glasses=v.acc.includes('glasses');o.band=v.acc.includes('band');o.cap=v.acc.includes('cap');}['glasses','band','cap'].forEach(k=>{if(typeof v[k]==='boolean')o[k]=v[k];});return o;}
 function s3Look(look,name,isMe){look=look||{};const mine=isMe||(typeof save!=='undefined'&&save&&look===save.look);/* LIVE P1 4.00: for the player, the creator's save.vlook is the look (it used to lose to look.s3, the base pick Experience stamps into save.look, so no creator change reached the preview) */const o=s3Norm((mine&&save.vlook)||look.s3||null);const has=!!(o.base||Object.keys(o).length);let L;
  if(o.base&&S3L[o.base])L=Object.assign({},S3L[o.base],{base:o.base});
  else if(mine&&!has)L=Object.assign({},S3L.dazza);
  else if(!mine&&S3PROS_ON&&s3ProKey(name)){const P=S3PRO[s3ProKey(name)];L=Object.assign({body:'standard',trim:0xf2f2f2},P);if(L.hair==='none'||L.hair==='bald')L.hair=null;L.pro=s3ProKey(name);}
  else{const h=s3h(name);const pk=(a,k)=>a[(h>>>k)%a.length];const fem=look.sex==='f'||!!CHAR_F[charKey(look,name)];const hc=look.hair||pk(['#141010','#3a2416','#5a3a22','#8f6326','#75706a'],5);
   L={body:fem?'female':pk(['standard','skinny','heavy','muscle','standard','heavy'],3),skin:(look.skin==='#5b3b2a'?'#6a4330':look.skin)||pk(S3_OPTS_SKIN,7),shirt:look.shirt||pk(['#7a1f2b','#0e7c86','#2a2b33','#e0a21c','#274a7a','#3f7f3f','#c9352d','#5b2a86'],9),trim:pk([0xf2f2f2,0x1c1c22,0xd9252e],11),
    hair:fem?pk(['ponytail','short'],13):(look.hairStyle==='bald'?'bald':pk(V2ON?['short','buzz','quiff','mullet','horseshoe','curly','buzz']:['short','buzz','quiff','mullet','horseshoe','short','buzz'],13)),hairC:hc,face:fem?'clean':(look.beard?pk(['full','goatee','walrus','stubble'],16):pk(['clean','clean','stubble'],16)),beardC:hc,brow:hc,glasses:((h>>>19)%7)===0,band:!fem&&((h>>>21)%6)===0,cap:(h>>>29)===0,
    nose:.85+((h>>>23)%40)/100,jaw:.86+((h>>>25)%32)/100,shW:.93+((h>>>27)%18)/100,soft:fem,handK:fem?.9:1,legK:.97+((h>>>2)%8)/100};}
  ['body','skin','hair','hairC','face','beardC','glasses','band','cap','capC','shirt'].forEach(k=>{if(o[k]!=null)L[k]=o[k];});if(L.hair==='bald')L.hair=null;if(o.hairC&&o.beardC==null)L.beardC=o.hairC;if(o.hairC)L.brow=o.hairC;return L;}
 const S3_OPTS_SKIN=['#f1c9a5','#e8b08a','#e2a17e','#c98e64','#a8693f','#7f4d30','#6a4330'];
 /* Lab helpers (vinyl style only) */
 const S3_SEGF=1.5,S3_GK={hand:1.15,foot:1.12,fore:.92},S3_GLOSS={shirt:[.76,.13],skin:[.66,.12],hair:[.4,.38],shoe:[.3,.7],pants:[.66,.17],trim:[.66,.2]};
 const s3sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};const s3lerp=(a,b,t)=>a+(b-a)*t;
 function s3M(c,o={}){const col=new T.Color(c);{const h={};col.getHSL(h);col.setHSL(h.h,Math.min(1,h.s*1.3),h.l);}col.convertSRGBToLinear();
  let m;if(o.metalness||o.transparent)m=new T.MeshStandardMaterial(Object.assign({color:col,flatShading:true,roughness:.8,metalness:0},o,{part:undefined}));else{
  const g=S3_GLOSS[o.part]||[.5,.28];const base={color:col,side:o.side||T.FrontSide};
  m=S3G==='full'?new T.MeshPhysicalMaterial(Object.assign(base,{roughness:o.roughness||g[0],clearcoat:g[1],clearcoatRoughness:.25,metalness:0})):new T.MeshStandardMaterial(Object.assign(base,{roughness:Math.min(.9,(o.roughness||g[0])+.08),metalness:0,envMapIntensity:.65}));}m.userData.s3v=true;return m;}
 function s3facet(w,h,d,round=.35,seg=2,taperTop=0,taperBot=0){const g=new T.BoxGeometry(w,h,d,seg,seg,seg);const p=g.attributes.position;const v=new T.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const nx=v.x/(w/2),ny=v.y/(h/2),nz=v.z/(d/2);const corner=(Math.abs(nx)+Math.abs(ny)+Math.abs(nz))/3;const k=1-round*Math.max(0,corner-.55);let sx=1;if(ny>0)sx-=taperTop*ny;else sx-=taperBot*(-ny);v.x*=k*sx;v.z*=k*(ny>0?1-taperTop*.6*ny:1-taperBot*.6*(-ny));v.y*=1-round*.25*Math.max(0,corner-.55);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;}
 const s3cyl=(rt,rb,h,s=6)=>new T.CylinderGeometry(rt,rb,h,s,1);
 const s3slathe=(pts,seg0=14,n0=24)=>{const seg=Math.max(5,Math.round(seg0*S3_SEGF)),n=Math.max(7,Math.round(n0*Math.min(1.3,S3_SEGF+.25)));const q=pts.slice().sort((a,b)=>a[1]-b[1]);const c=new T.CatmullRomCurve3(q.map(([r,y])=>new T.Vector3(r,y,0)),false,'centripetal');const g=new T.LatheGeometry(c.getPoints(n).map(v=>new T.Vector2(Math.max(.001,v.x),v.y)),seg);g.computeVertexNormals();return g;};
 const s3lathe=(pts,seg0=8)=>{const seg=Math.max(5,Math.round(seg0*S3_SEGF));const g=new T.LatheGeometry(pts.slice().sort((a,b)=>a[1]-b[1]).map(([r,y])=>new T.Vector2(r,y)),seg);g.computeVertexNormals();return g;};
 const s3cloth=(g,amt=.006,seed=1)=>{const p=g.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const r=Math.hypot(v.x,v.z);if(r<.02)continue;const h=Math.sin((Math.round(v.x*300)*12.9898+Math.round(v.y*300)*78.233+Math.round(v.z*300)*37.719+seed)*.7)*43758.5453;const n=(h-Math.floor(h)-.5)*2*amt;const k=(r+n)/r;p.setXYZ(i,v.x*k,v.y,v.z*k);}g.computeVertexNormals();return g;};
 function s3mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;if(parent)parent.add(o);return o;}
 const s3tag=(o,t)=>{o.userData.tag=t;return o;};
 function s3surfR(tor,y,dx,dz){const tm=new T.Mesh(tor.geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));tor.updateMatrix();tm.matrixWorld.copy(tor.matrix);tm.matrixAutoUpdate=false;const rc=new T.Raycaster();const d=new T.Vector3(dx,0,dz).normalize();for(const j of [0,.004,-.004]){rc.set(new T.Vector3(0,y,0),d.clone().applyAxisAngle(new T.Vector3(0,1,0),j));const h=rc.intersectObject(tm,false);if(h.length)return h[h.length-1].distance;}return 0;}
 function s3sitOn(o,tor,off){o.updateMatrix();const g=o.geometry=o.geometry.clone();const p=g.attributes.position,v=new T.Vector3(),M=o.matrix,Mi=M.clone().invert();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(M);const r=Math.hypot(v.x,v.z);if(r<.01)continue;const h=s3surfR(tor,v.y,v.x,v.z);if(h&&r<h+off){const k=(h+off)/r;v.x*=k;v.z*=k;}v.applyMatrix4(Mi);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return o;}
 const s3pivot=(parent,x=0,y=0,z=0)=>{const o=new T.Group();o.position.set(x,y,z);parent.add(o);return o;};
 let s3TxtTex=null;const s3chestText=()=>{if(s3TxtTex)return s3TxtTex;const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#ffffff';x.font='italic 900 64px Arial Black,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('TOPS',128,66);s3TxtTex=new T.CanvasTexture(c);s3TxtTex.encoding=T.sRGBEncoding;KEEP.add(s3TxtTex);return s3TxtTex;};
 function s3sculpt(g,B){const p=g.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const r=Math.hypot(v.x,v.z);if(r<.002)continue;const y=v.y;
  const wide=1+.12*s3sm(.1,.34,y)*(1-s3sm(.37,.43,y));v.x*=wide;const fx=Math.min(1,Math.abs(v.x)/(B.sh*.9));v.y-=.06*fx*fx*s3sm(.3,.4,y);const front=Math.max(0,v.z/r);if(y<-.25)v.y-=.018*front*front;
  if(B.belly)v.z+=B.belly*.62*Math.exp(-Math.pow((y+.1)/.14,2))*front*front;if(B.bust)v.z+=.042*Math.exp(-Math.pow((y-.19)/.065,2)-Math.pow((Math.abs(v.x)-.07)/.055,2))*Math.pow(front,1.3);
  if(B.pecs)v.z+=.045*Math.exp(-Math.pow((y-.24)/.075,2))*Math.pow(front,1.5)*(1-.5*Math.exp(-Math.pow(v.x/.025,2)));p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;}
 /* the Lab's build(), vinyl style, returning its pivots (rest pose: everything at identity) */
 function s3Build(L){const sm=s3sm,lerp=s3lerp,M=s3M,facet=s3facet,cyl=s3cyl,slathe=s3slathe,lathe=s3lathe,cloth=s3cloth,mesh=s3mesh,tag=s3tag,pivot=s3pivot,surfR=s3surfR,sitOn=s3sitOn,sculpt=s3sculpt,GK=S3_GK;
  const LK=L.legK||1;const S=(L.big?1.04:1)*(1+(LK-1)*.9);
  const skin=M(L.skin,{part:'skin'}),shirt=M(L.shirt,{part:'shirt'}),trim=M(L.trim||0xf2f2f2,{part:'trim'}),pants=M(0x1e1f24,{part:'pants'}),shoe=M(0x121214,{part:'shoe'}),dark=M(0x141210,{part:'face'}),hairM=M(L.hairC||0x222222,{part:'hair'}),beardM=M(L.beardC||0x222222,{part:'hair',side:T.DoubleSide}),browM=M(L.brow||0x222222,{part:'hair'});
  const root=new T.Group();
  const B=Object.assign({},S3B[L.body]||S3B.standard);B.sh*=L.shW||1;B.chest*=L.chW||1;B.waist*=L.waistK||1;const A=B.arm*(L.armK||1),G=B.leg,D=B.depth*(L.dep||1);const FA=L.fore||1;
  const hips=pivot(root,0,.86*S,0);
  tag(mesh(lathe([[.001,-.2],[B.hip*.8,-.17],[B.hip*1.08,-.11],[B.hip*.98,-.06],[B.waist*.8,.0],[B.waist*.7,.05],[.001,.06]],20),pants,hips),'pants').scale.z=D*1.02;
  const leg=(side)=>{const th=pivot(hips,B.hip*.54*side,-.06,0);const t=.12*G;
    const tg=tag(mesh(slathe([[.001,.0],[t*.86,-.015],[t*1.08,-.08],[t*.98,-.23],[t*.75,-.38],[.001,-.42]],16),pants,th),'pants');tg.scale.y=LK;tg.rotation.z=.03*side;
    const kn=pivot(th,0,-.41*LK,0);mesh(new T.IcosahedronGeometry(t*.72,2),pants,kn);
    mesh(slathe([[.001,.02],[t*.72,0],[t*.82,-.1],[t*.63,-.26],[t*.5,-.37],[.001,-.4]],16),pants,kn).scale.y=LK;
    const an=pivot(kn,0,-.39*LK,0);const sh=mesh(facet(.11,.068,.205,.5,2,.18,0),shoe,an,0,-.04,.038);sh.scale.setScalar(GK.foot||1);return {th,kn,an};};
  const lL=leg(-1),lR=leg(1);const thighs=[lL,lR].map(l=>[l.th,.12*G*1.1,.36*LK]);
  const spine=pivot(hips,0,.06,0);const chest=pivot(spine,0,.22,0);
  const sw=Math.max(B.waist,B.chest*.9)+.02, hem=Math.max(sw*1.16+(B.hip>.21?.03:0),(B.hip*.54+.12*B.leg*1.12)*1.12+.022,B.hip*1.2+.02);
  const shirtTop=[[.001,.44],[B.neck*1.45,.435],[B.sh*.7,.362],[B.chest*1.04+.015,.31],[B.chest*1.09+.018,.18],[sw*.97,-.06],[hem,-.35],[hem*1.025,-.385],[hem*.92,-.39],[.001,-.39]];
  const tor=tag(mesh(cloth(sculpt(slathe(shirtTop,22,30),B),.0025,1),M(L.shirt,{part:'shirt'}),chest),'shirt');tor.scale.z=D*1.02;
  const hemB=tag(mesh(sculpt(lathe([[hem*1.031,-.39],[hem*1.02,-.365],[hem*.95,-.36],[hem*.95,-.395]],22),B),M(new T.Color(L.shirt).multiplyScalar(.78).getHex()),chest),'hem');hemB.scale.z=D*1.02;
  const SKIN=[tor,hemB];/* Lab skinShirt: the shirt's lower half follows the hips and rides over the thighs (s3SkinFig, every frame) */
  const cz=(B.chest*1.09+.018)*D*1.02;
  const cg=(pts,ph0,ph)=>{const g=new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(r,y)),14,ph0,ph);g.computeVertexNormals();return g;};
  const stand=tag(mesh(cg([[B.neck*1.19,.415],[B.neck*1.14,.468]],.35,Math.PI*2-.7),M(L.shirt,{side:T.DoubleSide}),chest),'collar');
  sitOn(tag(mesh(cg([[B.neck*1.19,.472],[B.neck*1.75,.415]],.5,Math.PI*2-1.0),M(L.shirt,{side:T.DoubleSide,roughness:.8}),chest),'fold'),tor,.004).scale.z=1.04;
  sitOn(tag(mesh(cg([[B.neck*1.74,.418],[B.neck*1.79,.41]],.5,Math.PI*2-1.0),M(L.trim||0xf2f2f2,{side:T.DoubleSide}),chest),'fold'),tor,.006).scale.z=1.04;
  const pz=cz+(B.pecs?.035:0)+(B.belly?.01:0);
  {const sz=y=>Math.max(...[-.008,0,.008].map(k=>Math.max(surfR(tor,y+k,.02,1),surfR(tor,y+k,-.02,1))))||pz*.9;const pl=tag(mesh(new T.BoxGeometry(.045,.12,.004,1,6,1),M(new T.Color(L.shirt).multiplyScalar(.86).getHex()),chest,0,.35,0),'placket');sitOn(pl,tor,.0032);[.38,.33].forEach(y=>tag(mesh(new T.CylinderGeometry(.007,.007,.004,8),trim,chest,0,y,sz(y)+.0065),'placket').rotation.x=Math.PI/2);}
  const prM=new T.MeshStandardMaterial({map:s3chestText(),transparent:true,roughness:.9});prM.userData.s3v=true;/* the TOPS print is part of the Vinyl kit */
  const pr=new T.Mesh(new T.PlaneGeometry(.16,.08,12,4),prM);{const r=surfR(tor,.255,Math.sin(.28),Math.cos(.28));pr.position.set(Math.sin(.28)*(r-.01),.255,Math.cos(.28)*(r-.01));}pr.rotation.y=.28;chest.add(pr);sitOn(tag(pr,'placket'),tor,.0025);
  const back=new T.Mesh(new T.PlaneGeometry(.26,.13,16,6),prM);back.position.set(0,.22,-(surfR(tor,.22,0,-1)||cz)-.004);back.rotation.y=Math.PI;chest.add(back);back.position.z+=.012;sitOn(tag(back,'placket'),tor,.0025);
  const neck=pivot(chest,0,.41,0);const nkm=tag(mesh(cyl(B.neck*1.05,B.neck*1.25,.17,12),skin,neck,0,.05,0),'neck');nkm.rotation.x=.07;
  {chest.updateMatrixWorld(true);const ci=new T.Matrix4().copy(chest.matrixWorld).invert();const nm=new T.Mesh(nkm.geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));nm.matrixWorld.copy(ci).multiply(nkm.matrixWorld);nm.matrixAutoUpdate=false;
   const g=stand.geometry=stand.geometry.clone(),p=g.attributes.position,v=new T.Vector3(),rc=new T.Raycaster();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const d=new T.Vector3(v.x,0,v.z).normalize();rc.set(new T.Vector3(0,v.y,0),d);const h=rc.intersectObject(nm,false);if(h.length){const r=h[h.length-1].distance+.0025;p.setXYZ(i,d.x*r,v.y,d.z*r);}}g.computeVertexNormals();}
  const head=pivot(neck,0,.068,0);head.scale.setScalar(1.06*1.32);
  const hs=L.big?1.06:1;const HC=.175*hs;
  const hg=new T.SphereGeometry(1,Math.round(20*S3_SEGF),Math.round(14*S3_SEGF));{const p=hg.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);
    const bx=(c,e)=>Math.sign(c)*Math.pow(Math.abs(c),e);const ux=bx(v.x,.82),uy=v.y,uz=bx(v.z,v.z<0?.72:.85);let x=ux*.141,y=uy*.172,z=uz*.134;const ax=Math.abs(x),fr=sm(.15,.55,v.z);
    if(y>.1)y*=1-.04*sm(.1,.172,y);x*=1-.22*(2-(L.jaw||1))*sm(-.055,-.14,y);z*=1-.1*sm(-.04,-.172,y);x*=1+.05*Math.exp(-Math.pow((y-.0)/.04,2));
    z-=fr*.008*sm(.05,.1,ax)*Math.exp(-Math.pow((y+.03)/.035,2));if(v.z<0)z*=.87;z+=.014*sm(-.04,-.12,y)*sm(-.2,.3,v.z);if(y<-.13)y=-.13+(y+.13)*.55;
    z+=fr*.012*Math.exp(-Math.pow((y+.15)/.035,2)-Math.pow(x/.07,2));z+=fr*.018*Math.exp(-Math.pow((y-.065)/.02,2))*sm(.11,.03,ax);z-=fr*.006*Math.exp(-Math.pow((y-.035)/.018,2)-Math.pow((ax-.036)/.02,2));
    p.setXYZ(i,x*hs,y*hs+HC,z*hs);}hg.computeVertexNormals();}
  mesh(hg,skin,head);head.position.z=-.018;
  const ray=new T.Raycaster(),probe=new T.Mesh(hg,new T.MeshBasicMaterial({side:T.DoubleSide}));probe.updateMatrixWorld(true);
  const surf=(x,y0,side=0)=>{const y=y0+HC;const o=side?new T.Vector3(side,y,0):new T.Vector3(x,y,1),d=side?new T.Vector3(-Math.sign(side),0,0):new T.Vector3(0,0,-1);if(side)o.z=x;ray.set(o,d);const h=ray.intersectObject(probe)[0];return h?h.point:new T.Vector3(x,y,.14);};
  const grow=(mask,th,mat)=>{const g=hg.clone(),p=g.attributes.position,n=hg.attributes.normal,v=new T.Vector3(),nv=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);nv.fromBufferAttribute(n,i);const m=mask(v.x/hs,(v.y-HC)/hs,v.z/hs);v.addScaledVector(nv,th*m-.006*(1-m));p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return mesh(g,mat,head);};
  const lipC=M(new T.Color(L.skin).multiplyScalar(.42).getHex());
  {const nb=surf(0,0);const k=hs;const P=[[0,.028,-.01],[-.0135,.014,-.004],[.0135,.014,-.004],[0,-.03,.048*(L.nose||1)],[-.024,-.044,.002],[.024,-.044,.002],[0,-.048,.024*(L.nose||1)]].map(([x,y,z])=>new T.Vector3(x*k,y*k+nb.y,z*k+nb.z-.006));
   const F=[[1,4,3],[1,3,0],[0,3,2],[2,3,5],[4,6,3],[3,6,5],[1,0,2],[4,1,5]];const pos=[];F.forEach(f=>f.forEach(ix=>pos.push(P[ix].x,P[ix].y,P[ix].z)));
   const ng=new T.BufferGeometry();ng.setAttribute('position',new T.Float32BufferAttribute(pos,3));ng.computeVertexNormals();mesh(ng,M(L.skin,{side:T.DoubleSide,part:'skin'}),head);}
  const fullMask=(x,y,z)=>{const ax=Math.abs(x);const back=sm(-.03,-.01,z);const jaw=sm(-.084,-.09,y),side=.72*sm(.104,.11,ax)*sm(.01,.0,y)*sm(.065,.035,z),cheek=.75*sm(.06,.068,ax)*sm(-.058,-.066,y),must=.7*sm(.064,.058,ax)*sm(-.054,-.06,y);return Math.max(jaw,side,cheek,must)*back;};
  const stubM=M(new T.Color(L.skin).lerp(new T.Color(L.beardC||L.hairC||0x222222),.42).getHex());
  if(L.face==='full')grow(fullMask,.011,beardM);if(L.face==='stubble')grow(fullMask,.0028,stubM);
  if(L.face==='walrus')grow((x,y,z)=>{const ax=Math.abs(x);return sm(0,.04,z)*sm(.085,.07,ax)*sm(-.05,-.058,y)*sm(-.098,-.088,y)*(ax>.05?sm(-.11,-.09,y)+1:1);},.014,beardM);
  if(L.face==='goatee')grow((x,y,z)=>{const ax=Math.abs(x);const must=sm(.056,.046,ax)*sm(-.056,-.062,y)*sm(-.08,-.074,y),chin=sm(.04,.03,ax)*sm(-.096,-.104,y),link=sm(.056,.046,ax)*sm(.03,.038,ax)*sm(-.06,-.066,y)*sm(-.11,-.1,y);return Math.max(must,chin,link)*sm(-.02,0,z);},.012,beardM);
  if(L.face!=='full'){const lp=surf(0,-.094*hs);mesh(new T.BoxGeometry(L.soft?.034:.03,L.soft?.009:.006,.004),L.soft?M(0xa4544a):lipC,head,0,lp.y,lp.z-.0015);}
  [-1,1].forEach(s=>{const e=surf(.036*s*hs,.035*hs);const eg=mesh(new T.SphereGeometry(.0185,10,8),dark,head,e.x,e.y,e.z-.005);eg.scale.set(1,1.3,.45);
    if(L.soft){const lw=mesh(new T.BoxGeometry(.036,.006,.008),dark,head,e.x+.004*s,e.y+.021,e.z-.001);lw.rotation.z=-.18*s;}
    const b=surf(.039*s*hs,.066*hs);const br=mesh(facet(.064,.019,.02,.4,1,.0,.1),browM,head,b.x,b.y,b.z-.004);br.rotation.set(-.12,.26*s,.04*s);
    const ea=surf(-.008,.008*hs,s);const er=mesh(new T.SphereGeometry(1,8,6),skin,head,ea.x-.004*s,ea.y,ea.z);er.scale.set(.011,.036,.024);er.rotation.y=-.3*s;});
  if(L.glasses){const gm=M(0x111111,{roughness:.4});[-1,1].forEach(s=>{const e=surf(.036*s*hs,.035*hs);const fr=mesh(new T.TorusGeometry(.029,.0035,6,18),gm,head,e.x,e.y,e.z+.004);fr.scale.y=.72;fr.rotation.y=.18*s;
      const l=mesh(new T.CircleGeometry(.027,16),new T.MeshStandardMaterial({color:0xbad4e6,transparent:true,opacity:.3,roughness:.1}),head,e.x,e.y,e.z+.004);l.scale.y=.72;l.rotation.y=.18*s;l.castShadow=false;});
    const c=surf(0,.04*hs);mesh(new T.BoxGeometry(.03,.005,.005),gm,head,0,c.y,c.z+.012);}
  if(L.cap&&L.hair==='quiff')L=Object.assign({},L,{hair:'short'});
  const hairLine=(line)=>(x,y,z)=>{const ax=Math.abs(x);const fy=line-.045*sm(.05,.11,ax);const mf=sm(fy-.012,fy+.008,y),mb=sm(-.095,-.065,y),ms=sm(.02,.04,y);return lerp(lerp(mb,ms,sm(-.07,-.03,z)),mf,sm(.03,.07,z))*(1-sm(.105,.125,ax)*sm(.045,.02,y)*sm(-.06,.0,z));};
  if(L.hair==='short')grow(hairLine(.125),.016,hairM);
  if(L.hair==='buzz')grow(hairLine(.12),.0032,M(new T.Color(L.skin).lerp(new T.Color(L.hairC),.55).getHex()));
  if(L.hair==='horseshoe')grow((x,y,z)=>hairLine(.125)(x,y,z)*(1-.92*sm(.07,.115,y)*sm(-.03,.05,z)),.011,hairM);
  if(L.hair==='horseshoe'){const rootM=M(new T.Color(L.hairC).multiplyScalar(.6).getHex(),{part:'hair'});[-1,1].forEach(s=>{[[.115,.035,-.02,1],[.11,-.005,-.05,.9],[.085,.04,-.08,.85]].forEach(([x,y,z,k],i)=>{const tf=mesh(new T.IcosahedronGeometry(.03*k,1),i===1?rootM:hairM,head,x*s*hs,HC+y*hs,z*hs);tf.scale.set(.7,.9,1.2);tf.rotation.set(.3,.4*s,.3*s);});});}
  if(L.hair==='quiff'){grow((x,y,z)=>hairLine(.12)(x,y,z)*(.35+.65*sm(.07,.11,y)*sm(.105,.07,Math.abs(x))),.03,hairM);for(let i=0;i<4;i++){const q=mesh(new T.IcosahedronGeometry(.05,1),hairM,head,(i-1.5)*.03,HC+.15*hs+.012*(1-Math.abs(i-1.5)/1.5),.085-.012*Math.abs(i-1.5));q.scale.set(.9,.62,1.25);q.rotation.set(-.55,0,(i-1.5)*.2);}}
  if(L.hair==='mullet'){grow(hairLine(.115),.02,hairM);const mh=mesh(facet(.21,.17,.07,.45,2,.0,.25),hairM,head,0,HC-.085*hs,-.105*hs);mh.rotation.x=.22;[-1,1].forEach(s=>{mesh(facet(.03,.07,.05,.4,1),hairM,head,.128*s*hs,HC-.005,.0);});
    const rootM=M(new T.Color(L.hairC).multiplyScalar(.62).getHex(),{part:'hair'});grow((x,y,z)=>hairLine(.112)(x,y,z)*sm(.02,-.04,z),.012,rootM);
    (L.cap?[]:[[-.05,.13,.02,.95],[.05,.13,.01,.9],[0,.15,-.03,1],[-.07,.09,-.07,.85],[.07,.09,-.07,.85],[0,.1,-.1,.95]]).forEach(([x,y,z,k],i)=>{const c=mesh(new T.IcosahedronGeometry(.045*k,1),i>2?rootM:hairM,head,x*hs,HC+y*hs,z*hs);c.scale.set(1.15,.55,1.1);c.rotation.set(-.4+(i%2)*.2,i*.7,(x>0?-1:1)*.25);});}
  if(L.hair==='ponytail'){grow(hairLine(.135),.016,hairM);const bun=mesh(new T.IcosahedronGeometry(.042,1),hairM,head,0,HC+.07*hs,-.15*hs);const tail=mesh(slathe([[.001,.0],[.034,-.02],[.04,-.07],[.03,-.15],[.012,-.2],[.001,-.21]],10),hairM,bun,0,-.01,-.01);tail.rotation.x=.45;mesh(new T.TorusGeometry(.03,.008,6,12),M(0xd9252e),bun,0,-.015,-.01).rotation.x=Math.PI/2+.45;}
  /* S3 creator accessory: a cap (Overseer 08:40). A dome that sits on the hair surface, a peak, a button; the cap colour or the shirt colour */
  if(L.cap){const cm=M(L.capC||L.shirt,{part:'shirt'});const cg=new T.Group();head.add(cg);cg.position.set(0,HC+.072*hs,-.006*hs);cg.rotation.x=-.22;
   const dome=mesh(new T.SphereGeometry(1,Math.round(18*S3_SEGF),Math.round(8*S3_SEGF),0,Math.PI*2,0,Math.PI*.5),cm,cg);dome.scale.set(.158*hs,.122*hs,.156*hs);
   const band=mesh(new T.CylinderGeometry(1,1,1,Math.round(18*S3_SEGF),1,true),cm,cg,0,-.006*hs,0);band.scale.set(.158*hs,.022*hs,.156*hs);
   const peak=mesh(new T.CylinderGeometry(1,1,1,Math.round(14*S3_SEGF),1,false,-Math.PI/2,Math.PI),cm,cg,0,-.014*hs,.14*hs);peak.scale.set(.13*hs,.008*hs,.09*hs);peak.rotation.x=.16;
   mesh(new T.SphereGeometry(.012*hs,8,6),M(L.trim||0xf2f2f2,{part:'trim'}),cg,0,.122*hs,0);}
  const arm=(s)=>{const sh=pivot(chest,B.sh*.94*s,.31,0);const a=.085*A;
    tag(mesh(slathe([[.001,-.02],[a*.7,-.03],[a*.92,-.07],[a*1.0,-.15],[a*.95,-.26],[a*.8,-.34],[.001,-.36]],16),skin,sh),'upperarm');
    const SL=[[.001,.034],[a*.92,.028],[a*1.16,.006],[a*1.23,-.04],[a*1.24,-.11],[a*1.28,-.162],[a*1.06,-.17]];
    const slv=tag(mesh(cloth(slathe(SL,16,20),.0015,2),shirt,sh),'sleeve');
    const gus=mesh(new T.IcosahedronGeometry(a*1.05,1),shirt,sh,-.045*s,-.055,0);gus.scale.set(1,1.25,.95);
    const sr=(y0,y1)=>{const p=slv.geometry.attributes.position;let m=0;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>=y0-.012&&y<=y1+.012)m=Math.max(m,Math.hypot(p.getX(i),p.getZ(i)));}return m;};
    const rc=sr(-.156,-.14)+.0035,rs=sr(-.139,-.131)+.0045;const cf=tag(mesh(new T.CylinderGeometry(rc,rc,.016,24,1,true),M(L.trim||0xf2f2f2,{side:T.DoubleSide}),sh,0,-.148,0),'cuff');tag(mesh(new T.CylinderGeometry(rs,rs,.008,24,1,true),M(0xd9252e,{side:T.DoubleSide}),sh,0,-.135,0),'cuff').castShadow=false;cf.castShadow=false;
    const el=pivot(sh,0,-.35,0);el.scale.y=GK.fore||1;mesh(new T.IcosahedronGeometry(a*.8,2),skin,el);
    mesh(slathe([[.001,.03],[a*.82*FA,.01],[a*.96*FA,-.08],[a*.84*FA,-.16],[a*.58*FA,-.26],[a*.5*FA,-.3],[.001,-.31]],16),skin,el);
    const wr=pivot(el,0,-.29,0);const k=Math.sqrt(A)*(GK.hand||1)*(L.handK||1);
    if(L.band&&s===1)mesh(new T.CylinderGeometry(a*.6,a*.62,.07,10),M(L.shirt,{roughness:.95}),el,0,-.26,0);
    mesh(facet(.135*k,.15*k,.12*k,.42,2,.05,.12),skin,wr,0,-.08*k,.005);mesh(facet(.135*k,.04*k,.045*k,.4,1),skin,wr,0,-.13*k,.048*k);
    const th=mesh(facet(.045*k,.08*k,.05*k,.4,1),skin,wr,.068*s*k,-.07*k,.035*k);th.rotation.z=.35*s;return {sh,el,wr};};
  const aL=arm(-1),aR=arm(1);
  return {root,hips,spine,chest,neck,head,lL,lR,aL,aR,S,SKIN,thighs};}
 /* put the Lab figure on the game skeleton: joints placed where the Lab has them (scaled to the skeleton's height), limb lengths
    matched, every part a rigid piece parented to its bone, rotated so it lies along that bone at rest. The Lab faces +z; aL (x<0) is
    the figure's right arm (it holds the dart), lL its right leg. */
 /* ===== S3 VINYL v2 (Director spec 11 + reference vinyl2.js, Overseer 14:32): the Season 3 poster figure on the game skeleton =====
    Head ~2x on the collar (no neck), short thick limbs, big fists and shoes, painted decal face (calm eyes, clear grin), sRGB colours,
    envMapIntensity .32. Same rig contract as the Lab build (hips/chest/neck/head, arms sh/el/wr, legs th/kn/an), so s3Dress carries it.
    Creator options map onto it: hair short/buzz/quiff/mullet/horseshoe(swept)/ponytail(bun)/curly/bald, face clean/stubble/full/goatee/
    walrus, glasses/sweatband/cap, shirt colour, build. */
 const S3_V2=V2ON;
 const V2P={head:{c:[0,1.44,0.03],r:[0.295,0.27,0.27]},face:{phi:[-0.95,1.9],theta:[0.95,1.65]},torso:{y0:0.585,/* hem a little lower than the reference (0.62): the game's pelvis tilts in idle and the thigh tops showed above it */y1:1.17,rx:0.255,rz:0.19,belly:0.03},shoulder:{x:0.255,y:1.09},arm:{upper:0.17,fore:0.17,r0:0.072,r1:0.06},leg:{hipX:0.12,hipY:0.62,len:0.40,r:0.11},shoe:{len:0.42,w:0.22,h:0.21,toe:0.08}};
 const V2BODY={skinny:[.9,.9,0],standard:[1,1,0],heavy:[1.1,1.1,.03],muscle:[1.12,1.02,-.01],female:[.93,.92,0]};
 let v2EnvT=null;function v2Env(){if(v2EnvT!==null)return v2EnvT;v2EnvT=undefined;try{const sc=new T.Scene();const g=new T.SphereGeometry(10,24,12);const c=[];const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i)/10;const a=new T.Color(0x3a3230).lerp(new T.Color(0xfff4ea),Math.pow(Math.max(0,y),.6));if(y<-.1)a.set(0x221c1a);c.push(a.r,a.g,a.b);}g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  sc.add(new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));[[6,5,4,0xffffff],[-7,3,2,0xfff0e0],[0,4,-8,0xe8eeff],[0,9,0,0xffffff]].forEach(([x,y,z,col])=>{const q=new T.Mesh(new T.PlaneGeometry(6,4),new T.MeshBasicMaterial({color:col,side:T.DoubleSide}));q.position.set(x,y,z);q.lookAt(0,0,0);sc.add(q);});
  const pm=new T.PMREMGenerator(renderer);v2EnvT=pm.fromScene(sc,.04).texture;pm.dispose();g.dispose();}catch(e){v2EnvT=undefined;}return v2EnvT;}
 /* #8 one material system (ChatGPT top 10, 19 Nov): metalness 0 everywhere; [roughness, clearcoat, clearcoat roughness] inside its ranges.
    Before: hair .32/.7, trousers .22/.9 and shoes .12/1 read as wet plastic next to a matte skin. Eyes live on the face decal (V2EYEGLOSS). */
 const V2MAT={skin:[.44,.1,.45],hair:[.44,.08,.35],beard:[.52,.05,.4],shirt:[.54,.05,.4],trim:[.53,.06,.4],pants:[.42,.12,.35],shoe:[.37,.2,.2],dark:[.6,0,.5]};/* round 5 #8: skin .40-.45 with a softer, broader clearcoat (no hot forehead), hair .40-.48, shirt .50-.58 *//* 16-fullbody #8: skin .40-.45 / ~.15, shirt .53-.60 / ~.05, shoes .34-.40 / ~.20 */
 const V2EYEGLOSS={rough:.2,cc:.48,ccR:.1,face:.5};/* the painted eyes glossy, the rest of the decal (brows, mouth, blush) at skin-like .5 */
 /* #9 figure lighting (ChatGPT top 10 + Q&D 20:45 'players darker in venues'): in a venue no light reaches the face (every venue light aims at
    the board; the pane camera looks at the face from the board side), so Kai's face went ~2.8x darker than in the creator. Figures now carry
    their own light in the environment map they already sample (no extra lights, so no extra cost for the room): a warm soft key 35-40 deg
    above-front, a fill at ~40% from the other side, a restrained red rim behind and a dim warm floor. Faces (skin, face decal, hair) take
    V2LIGHT.face more than the body (+0.4 stop). Scaled by 1/exposure so every venue shows the same person. The creator keeps its own rig. */
 const V2LIGHT={k:1,gain:.68,face:1.32,mode:'match',/* gain: retuned once v2 colours stopped being double-converted (GFX_LIN): skin now renders near its own hex */
  /* the figure light rig, in the figure's frame (it faces -z, the board): panels [toward the light x,y,z, width, height, colour, strength]; sky/floor = the dim room */
  rig:{panels:[[-.3,.57,-.76,9,8,0xffeed8,6.0],[.72,.22,-.66,8,6,0xfff1e4,4.2],[-.75,.35,.56,3,6,0xff3a30,.4],[.75,.35,.56,3,6,0xff3a30,.36],[0,.95,.1,6,6,0xfff0e6,.8]],/* key warm 35 deg above-front; fill neutral at ~45% of the key (area x strength); red rims subdued */sky:[0x34281e,0x5e4636],floor:0x46301f}/* round 5 #4: warm shadows, not grey */};
  /* tuned on Kai in the Pub and Club panes to the creator's face (Q&D: creator median (227,125,69)): before (81,33,18) and (89,37,20); now (212,126,72) and (215,128,73) */
 /* Director doc 58 (TOPS_LIGHT22, v3 figures only): per-venue figure rigs measured against the poster. A smaller, brighter key (doc 47 'K': 3x2.7 at
    about the same energy) for small white highlights; fill -24%; warmer, ~4x stronger red-orange rims (the poster's red edge on hair, ears and shoulders);
    a warm low bounce panel + warmer floor so the shadow side reads saturated orange-brown, not grey. Env only: no lights, 0 per-frame cost; one PMREM
    rebuild per venue change. Engine: lit per FIGURE (Director's scope note) - only v3 figures' materials take it, v2 opponents keep V2LIGHT.rig, and the
    v2 default never builds it. */
 const V2LIGHT22={
  pub:  {panels:[[-.3,.57,-.76,3,2.7,0xffe2c0,52],[.72,.22,-.66,8,6,0xfff1e4,3.2],[-.75,.35,.56,3,6,0xff4a2a,1.7],[.75,.35,.56,3,6,0xff4a2a,1.55],[0,.95,.1,6,6,0xfff0e6,.8],[0,-.35,-.9,8,4,0xff8a50,2.4]],sky:[0x3a2a1e,0x6a4a36],floor:0x8a4428},
  club: {panels:[[-.3,.57,-.76,3,2.7,0xfff0e0,52],[.72,.22,-.66,8,6,0xfff1e4,3.4],[-.75,.35,.56,3,6,0xff3a30,1.55],[.75,.35,.56,3,6,0xff3a30,1.45],[0,.95,.1,6,6,0xfff0e6,.8],[0,-.35,-.9,8,4,0xff8050,2.1]],sky:[0x34281e,0x5e4636],floor:0x7a3a24},
  stage:{panels:[[-.3,.57,-.76,3,2.7,0xfff2e6,56],[.72,.22,-.66,8,6,0xfff1e4,3.2],[-.75,.35,.56,3,6,0xff3020,2.3],[.75,.35,.56,3,6,0xff3020,2.2],[0,.95,.1,6,6,0xfff0e6,1.0],[0,-.35,-.9,8,4,0xff7048,2.2]],sky:[0x2a1a16,0x4e2e26],floor:0x74301e}};
 window.TOPS_V2LIGHT22=V2LIGHT22;let V2ENV3=false;/* true while a v3 figure is dressed: its materials are tagged userData.v2v3 */
 const v2L22on=()=>!!(window.TOPS_LIGHT22&&window.TOPS_V3FLAG===true);
 function v2RigBuild(RG){try{const sc=new T.Scene();const g=new T.SphereGeometry(10,24,12);const c=[];const p=g.attributes.position;
   for(let i=0;i<p.count;i++){const y=p.getY(i)/10;const a=new T.Color(RG.sky[0]).lerp(new T.Color(RG.sky[1]),Math.max(0,y));if(y<-.05)a.set(RG.floor);c.push(a.r,a.g,a.b);}g.setAttribute('color',new T.Float32BufferAttribute(c,3));
   sc.add(new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));
   RG.panels.concat(window.TOPS_V3HOT||[]).forEach(([x,y,z,w,h,col,k])=>{const m=new T.MeshBasicMaterial({color:(window.GFX_LIN?new T.Color(col):new T.Color(col).convertSRGBToLinear()).multiplyScalar(k),side:T.DoubleSide});const q=new T.Mesh(new T.PlaneGeometry(w,h),m);q.position.set(x,y,z).normalize().multiplyScalar(8);q.lookAt(0,0,0);sc.add(q);});
   const pm=new T.PMREMGenerator(renderer);const t=pm.fromScene(sc,.04).texture;pm.dispose();g.dispose();sc.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});return t;}catch(e){return undefined;}}
 let v2RigT22=null,v2RigK22=null;function v2RigEnv22(){const kd=V2LIGHT22[envKind]?envKind:'club';if(v2RigT22!==null&&v2RigK22===kd)return v2RigT22;try{if(v2RigT22)v2RigT22.dispose();}catch(e){}v2RigK22=kd;
   const t0=performance.now();v2RigT22=v2RigBuild(Object.assign({},V2LIGHT.rig,V2LIGHT22[kd],(window.TOPS_LIGHT22P||{})[kd]||{}));window.TOPS_LIGHT22_MS=+(performance.now()-t0).toFixed(2);return v2RigT22;}/* TOPS_LIGHT22P: per-venue override (tuning) */
 let v2RigT=null;function v2RigEnv(){if(v2RigT!==null)return v2RigT;v2RigT=undefined;try{const sc=new T.Scene();const g=new T.SphereGeometry(10,24,12);const c=[];const p=g.attributes.position;
   for(let i=0;i<p.count;i++){const y=p.getY(i)/10;const RG=V2LIGHT.rig;const a=new T.Color(RG.sky[0]).lerp(new T.Color(RG.sky[1]),Math.max(0,y));if(y<-.05)a.set(RG.floor);c.push(a.r,a.g,a.b);}g.setAttribute('color',new T.Float32BufferAttribute(c,3));
   sc.add(new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));
   /* figure frame: the figure faces -z (the board); panels: [dir x,y,z (toward the light), w, h, colour, strength] */
   V2LIGHT.rig.panels.concat(window.TOPS_V3HOT||[]).forEach(([x,y,z,w,h,col,k])=>{/* TOPS_V3HOT: extra small panels (test knob, doc 44 skin highlights) */
    const m=new T.MeshBasicMaterial({color:(window.GFX_LIN?new T.Color(col):new T.Color(col).convertSRGBToLinear()).multiplyScalar(k),side:T.DoubleSide});const q=new T.Mesh(new T.PlaneGeometry(w,h),m);q.position.set(x,y,z).normalize().multiplyScalar(8);q.lookAt(0,0,0);sc.add(q);});
   const pm=new T.PMREMGenerator(renderer);v2RigT=pm.fromScene(sc,.04).texture;pm.dispose();g.dispose();}catch(e){v2RigT=undefined;}return v2RigT;}
 /* which environment and how strong, for a figure material of this part, in the current mode */
 function v2EnvFor(part,fk,v3){if(V2LIGHT.mode==='creator')return [v2Env()||null,.32];const f=(part==='skin'||part==='face'||part==='hair'||part==='beard')?V2LIGHT.face:1;return [(v3&&v2L22on()?v2RigEnv22():null)||v2RigEnv()||v2Env()||null,V2LIGHT.k*f*(fk||1)];}
 function v2Relight(root){(root||scene).traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||!m.userData||!m.userData.s3v)return;const [e,k]=v2EnvFor(m.userData.v2part,m.userData.v2fk,!!m.userData.v2v3);if(m.envMap!==e){m.envMap=e;m.needsUpdate=true;}m.envMapIntensity=k;});});}
 function v2LightMode(mode){V2LIGHT.mode=mode;let ex=1;try{ex=renderer.toneMappingExposure||1;}catch(e){}V2LIGHT.k=V2LIGHT.gain/ex;v2Relight();}
 window.TOPS_V2LIGHT=Object.assign(V2LIGHT,{relight:v2Relight,setMode:v2LightMode,rebuild:()=>{try{if(v2RigT)v2RigT.dispose();}catch(e){}v2RigT=null;try{if(v2RigT22)v2RigT22.dispose();}catch(e){}v2RigT22=null;v2Relight();},rebuild22:()=>{if(!v2L22on())return;v2RigK22=null;v2RigEnv22();v2Relight();}});
 /* soft contact shadow under the player and the opponent (the venues have no shadow map): one shared soft disc, a child of the figure */
 let v2BlobM=null;function v2Blob(fig){if(!fig||!fig.userData.s3v2||fig.userData.v2blob)return;try{if(!v2BlobM){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(.55,'rgba(0,0,0,.32)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
   v2BlobM={g:new T.PlaneGeometry(1,1),m:new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})};}
  const b=new T.Mesh(v2BlobM.g,v2BlobM.m);b.rotation.x=-Math.PI/2;b.scale.set(.95,.8,1);b.position.y=.006;b.renderOrder=1;b.userData.v2blob=true;b.raycast=()=>{};fig.add(b);fig.userData.v2blob=b;}catch(e){}}
 /* 16-fullbody #9: a soft contact shadow where the head sits on the collar, so the head reads as resting on the shirt (player and opponent
    only: one transparent disc each, laid on top of the collar ring) */
 function v2Chin(fig){if(!fig||!fig.userData.s3v2||fig.userData.v2chin)return;try{let col=null;fig.traverse(o=>{if(!col&&o.isMesh&&o.userData.tag==='collar')col=o;});if(!col)return;col.geometry.computeBoundingBox();const bb=col.geometry.boundingBox.clone().applyMatrix4(col.matrix);
  const g=new T.CircleGeometry(.23,20);g.rotateX(-Math.PI/2);const m=new T.MeshBasicMaterial({map:v2ChinAO(),color:0x000000,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  const o=new T.Mesh(g,m);o.position.set((bb.min.x+bb.max.x)/2,bb.max.y-.004,(bb.min.z+bb.max.z)/2+.015);o.renderOrder=1;o.raycast=()=>{};o.userData.tag='chinao';col.parent.add(o);fig.userData.v2chin=o;}catch(e){}}
 /* round 6 #1 (doc 20, ChatGPT): the warm skin palette for the five bases, as rendered face mid-tones: Kai / Ray / Mia #E89A67-#F0A56F,
    Dazza #D48559-#DE8C5E, Tama #9B5638-#A85F3E (not orange-red). Keyed by the base's own skin hex; the colour is the material base, tuned so
    the lit face median lands in range in the creator and the match pane. Other skins keep the HSL rule below */
 /* [material hex, linear gain]: the light skins need a red channel past 1.0 (x1.06) to reach the range without going pale */
 const V2SKIN={0xeea472:[0xff8d5d,1.06],0xeeb08a:[0xff9161,1.10],0xf3b486:[0xff8b5f,1.08],0xeca676:[0xc66d4d,1],0xb06a3e:[0x7f533e,1]};
 function v2M(c,part,o){const g=V2MAT[part]||[.38,.55,.18];const col=new T.Color(c);const sk=part==='skin'?(window.TOPS_V2SKIN||V2SKIN)[col.getHex()]:null;if(sk!=null){if(Array.isArray(sk)){col.setHex(sk[0]);if(!window.GFX_LIN)col.convertSRGBToLinear();col.multiplyScalar(sk[1]||1);if(!window.GFX_LIN)col.convertLinearToSRGB();}else col.setHex(sk);}else if(part==='skin'||part==='hair'){const h={};col.getHSL(h);{const lt=part==='skin'&&h.l>.6;col.setHSL(lt?h.h-.006:h.h,Math.min(1,h.s*(part==='skin'?(lt?1.18:1.0):.97)),part==='skin'?h.l-(lt?.03:0):Math.min(.92,h.l+(1-h.l)*.03));}/* the poster's light skins are warmer and more saturated than the bases' hex (poster face median (248,148,90) vs Kai #eea472): light skins +18% saturation, -3% lightness; darker skins as given */}/* 16-fullbody #8: the skin keeps more of its own warmth (was x.8 saturation, +10% lightness, softened against the old warm venue light; the figure light is neutral-warm now) */if(!window.GFX_LIN)col.convertSRGBToLinear();/* the game's colour management already makes hex colours linear (GFX_LIN): converting again (Director's reference has no colour management) crushed every v2 colour: skin deep orange, Tama orange-red, beards and hair near-black *//* round 6 #1: the match pane's tone curve compresses light skin toward pale and leaves dark skin under its creator tone (Kai pub cheek
    (222,151,96), Tama (137,78,51) vs the creator (233,160,106), (162,90,60)): skin gets a pane-only lift by its own lightness, x1.1 light to
    x1.5 dark, so each base reads at its palette in every venue. The creator is untouched */
  let fk=1;if(part==='skin'){const Y=.2126*col.r+.7152*col.g+.0722*col.b;fk=1.1+.4*Math.max(0,Math.min(1,(.45-Y)/.32));}const [en,ek]=v2EnvFor(part,fk,V2ENV3);const base=Object.assign({color:col,metalness:0,envMap:en,envMapIntensity:ek},o||{},{metalness:0});let m;
  /* phones: standard material (no clearcoat pass), a touch smoother to keep the gloss; full finish: the spec's physical clearcoat */
  const SKV=part==='skin'&&window.TOPS_V3SKIN;/* doc 44 skin pass (test knob, off by default): {r,cc,ccr,spec,phoneCC}. spec = a multiplier on the env REFLECTION only, relative to
     the lab (env .32): the env map is also the figure's key light here, so envMapIntensity itself can't move without relighting the skin; phoneCC: skin keeps its clearcoat on phones too */
  if(S3G==='full'||(SKV&&SKV.phoneCC))m=new T.MeshPhysicalMaterial(Object.assign(base,{roughness:SKV&&SKV.r!=null?SKV.r:g[0],clearcoat:SKV&&SKV.cc!=null?SKV.cc:g[1],clearcoatRoughness:SKV&&SKV.ccr!=null?SKV.ccr:g[2]}));else m=new T.MeshStandardMaterial(Object.assign(base,{roughness:Math.max(.08,(SKV&&SKV.r!=null?SKV.r:g[0])-.08*g[1])}));
  if(SKV&&(SKV.spec!=null||SKV.sat!=null||SKV.warm!=null||SKV.gain!=null)){/* skin test hook: spec = env reflection strength relative to the lab (.32); sat/warm/gain = skin colour (doc 48 #3: the poster skin is warmer, more saturated, brighter).
   Colour works on the chroma (colour minus its grey), so whites, greys and near-blacks on the face sheet (teeth, eye whites, brows) barely move; warm pushes the chroma toward red */
  const u={value:(SKV.spec!=null?SKV.spec:.32)/.32},us={value:SKV.sat!=null?SKV.sat:1},uw={value:SKV.warm||0},ug={value:SKV.gain!=null?SKV.gain:1};m.userData.v3spec=u;
  m._v3spec=sh=>{Object.assign(sh.uniforms,{uV3Spec:u,uV3Sat:us,uV3Warm:uw,uV3Gain:ug});sh.fragmentShader='uniform float uV3Spec,uV3Sat,uV3Warm,uV3Gain;\n'+sh.fragmentShader
   .replace('#include <map_fragment>','#include <map_fragment>\n\t{float l_=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));vec3 c_=(diffuseColor.rgb-l_)*uV3Sat;float k_=length(c_)*uV3Warm;c_.r+=k_;c_.b-=k_;diffuseColor.rgb=max(vec3(0.),(l_+c_)*uV3Gain);}')
   .replace('#include <lights_fragment_maps>','#include <lights_fragment_maps>\n\tradiance*=uV3Spec;\n#ifdef CLEARCOAT\n\tclearcoatRadiance*=uV3Spec;\n#endif');};m.onBeforeCompile=m._v3spec;m.customProgramCacheKey=()=>'v3spec';}
  m.userData.s3v=true;m.userData.v2part=part;m.userData.v2fk=fk;if(V2ENV3)m.userData.v2v3=true;return m;}
 const v2hex=h=>'#'+new T.Color(h).getHexString();
 function v2cv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x,w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;}
 /* the decal's gloss maps, same layout as v2FaceTex: 'rough' (green channel x roughness .5: eyes -> .2) and 'cc' (red x clearcoat: eyes 1, rest 0) */
 const v2Masks={};function v2EyeMask(kind){if(v2Masks[kind])return v2Masks[kind];const c=document.createElement('canvas');c.width=128;c.height=80;const x=c.getContext('2d');const sx=128/1024,sy=80/640;
  const bg=kind==='rough'?'#ffffff':'#000000',fg=kind==='rough'?'#'+('0'+Math.round(255*V2EYEGLOSS.rough/V2EYEGLOSS.face).toString(16)).slice(-2).repeat(3):'#ffffff';x.fillStyle=bg;x.fillRect(0,0,128,80);x.fillStyle=fg;
  [-1,1].forEach(sg=>{x.beginPath();x.ellipse((512+sg*V2EYE.dx)*sx,640*V2EYE.v*sy,V2EYE.rx*sx,V2EYE.ry*sy,0,0,7);x.fill();});const t=new T.CanvasTexture(c);return v2Masks[kind]=t;}
 let v2AO=null;function v2ChinAO(){if(v2AO)return v2AO;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,.62)');g.addColorStop(.55,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return v2AO=new T.CanvasTexture(c);}
 function v2FaceTex(L){return v2cv(512,320,(x,W,H)=>{x.scale(.5,.5);W*=2;H*=2;const ex=[W*.5-V2EYE.dx,W*.5+V2EYE.dx],ey=H*V2EYE.v;
   [ex[0]-20,ex[1]+20].forEach(cx=>{const g=x.createRadialGradient(cx,ey+125,0,cx,ey+125,80);g.addColorStop(0,'rgba(240,110,100,.35)');g.addColorStop(1,'rgba(240,110,100,0)');x.fillStyle=g;x.fillRect(cx-90,ey+30,180,180);});
   ex.forEach((cx,i)=>{x.save();x.translate(cx,ey);x.fillStyle='#ffffff';x.beginPath();x.ellipse(0,0,74,92,0,0,7);x.fill();x.fillStyle=v2hex(L.eye||0x3a2416);x.beginPath();x.ellipse(i?-5:5,8,62,78,0,0,7);x.fill();
    x.fillStyle='#0d0806';x.beginPath();x.ellipse(i?-5:5,12,36,46,0,0,7);x.fill();x.fillStyle='#ffffff';x.beginPath();x.ellipse(i?-28:-16,-28,20,24,0,0,7);x.fill();x.beginPath();x.ellipse(i?14:26,36,9,10,0,0,7);x.fill();
    x.strokeStyle='#1a0f0a';x.lineWidth=7;x.beginPath();x.ellipse(0,0,74,92,0,Math.PI*1.08,Math.PI*1.92);x.stroke();
    if(L.lash){x.lineWidth=8;x.lineCap='round';[[-46,-40,-66,-62],[-30,-56,-44,-82],[i?40:-12,-62,i?52:-14,-90]].forEach(([a,b,c,d])=>{const s=i?-1:1;x.beginPath();x.moveTo(a*s,b);x.lineTo(c*s,d);x.stroke();});}x.restore();});
   x.fillStyle=v2hex(L.brow||L.hairC||0x3a2010);ex.forEach((cx,i)=>{const s=i?1:-1;x.beginPath();x.moveTo(cx-92*s,ey-108);x.quadraticCurveTo(cx-10*s,ey-200,cx+90*s,ey-136);x.quadraticCurveTo(cx+5*s,ey-128,cx-92*s,ey-76);x.closePath();x.fill();});
   if(L.face!=='full'&&L.face!=='walrus'||true){const my=H*.77,mw=215;const path=()=>{x.beginPath();x.moveTo(W/2-mw,my-18);x.quadraticCurveTo(W/2,my-34,W/2+mw,my-18);x.quadraticCurveTo(W/2+mw*.85,my+110,W/2,my+112);x.quadraticCurveTo(W/2-mw*.85,my+110,W/2-mw,my-18);};
    x.fillStyle='#4a1414';path();x.fill();x.save();path();x.clip();x.fillStyle='#ffffff';x.fillRect(W/2-mw,my-40,mw*2,78);x.fillStyle='#e06a6a';x.beginPath();x.ellipse(W/2,my+108,95,42,0,0,7);x.fill();x.restore();
    x.strokeStyle='#5a2418';x.lineWidth=6;x.lineCap='round';path();x.stroke();[-1,1].forEach(s=>{x.beginPath();x.arc(W/2+s*(mw+8),my-14,16,s<0?-0.4:Math.PI-1.2,s<0?1.2:Math.PI+0.4);x.stroke();});}});}
 /* 16-fullbody #3 (shirt, ChatGPT): the poster's TOPS shirt is black #191B1E with bold angled red graphics over ~25% of the lower front,
    a red polo collar, fitted red cuffs and a small white TOPS on the upper chest (wearer's left). Before: two thin horizontal-ish stripes,
    a big logo across the belly and red side seams read as a different uniform. All of it is data (V2SHIRT): lathe UV, u .5 = the front,
    u > .5 the wearer's left, v 0 = the hem; slashes [u0,v0,u1,v1,thickness] rise toward the wearer's left; corner [u0,u1,v1] a wedge at the hem. */
 const V2SHIRT={black:0x191b1e,red:0xd7232d,white:0xf1f0eb,/* poster: tapering red sweeps from the wearer's right hem side, rising across the lower front to points past the middle: [u0, v0 (bottom of the root), root height, u1 (tip), v1 (tip), bow] */
  sweeps:[[.31,.47,-.02,.70,.68,.05],[.50,.58,-.02,.70,.48,.03],[.61,.65,-.02,.70,.30,.02]],corner:null,/* round 6 #5 (doc 20, poster): tapered strokes rooted on the hem [u left, u right, v at the hem, tip u, tip v, bow], rising steeply to the wearer's left side seam; tips 8-12% of the torso higher than round 5, red ~27% of the front */
  logo:{u:.62,v:.75,px:30,track:2},collar:{flap:[.118,.112,.04],band:[[1.06,-.04],[.99,.0],[.97,.045],[1.0,.068],[1.07,.06],[1.13,.022]],tilt:-1.22,splay:.5,turn:.4,x:.04,gap:.035},cuff:{h:.042,r0:.088,r1:.083,y:-.118}};
 window.TOPS_V2SHIRT=V2SHIRT;
 const v2Tops=c=>c===0x141416?V2SHIRT.black:c===0xd81e2a?V2SHIRT.red:c;/* the bases' TOPS black and red, in the poster's exact colours */
 function v2ShirtTex(L){const sc=v2Tops(L.shirt==null?0x141416:L.shirt);const st=v2Tops(L.stripe!=null?L.stripe:(new T.Color(sc).getHSL({}).l>.6||Math.abs(new T.Color(sc).getHSL({}).h-0)<.03&&new T.Color(sc).getHSL({}).s>.5?0x141416:0xd81e2a));L._stripe=st;const S=V2SHIRT;
  return v2cv(512,256,(x,W,H)=>{x.scale(.5,.5);W*=2;H*=2;const P=(u,v)=>[u*W,H-v*H];x.fillStyle=v2hex(sc);x.fillRect(0,0,W,H);x.fillStyle=v2hex(st);
   const SW=window.TOPS_V2SHIRTSW||S.sweeps;SW.forEach(([ua,ub,v0,u1,v1,bow])=>{x.beginPath();x.moveTo(...P(ua,v0));x.lineTo(...P(ub,v0));x.quadraticCurveTo(...P((ub+u1)/2,(v0+v1)/2-bow),...P(u1,v1));x.quadraticCurveTo(...P((ua+u1)/2,(v0+v1)/2+bow),...P(ua,v0));x.closePath();x.fill();});
   /* the same sweeps on the back, smaller, so a turned figure still wears the poster shirt */
   SW.slice(0,2).forEach(([ua,ub,v0,u1,v1,bow],i)=>{const w=(ub-ua)*.7,r=.99-i*.07;x.beginPath();x.moveTo(...P(r-w,v0));x.lineTo(...P(r,v0));x.quadraticCurveTo(...P(r-.04,v1*.4),...P(r-.17,v1*.75));x.quadraticCurveTo(...P(r-w-.06,v1*.3),...P(r-w,v0));x.closePath();x.fill();});
   const lg=Object.assign({},S.logo,L._logo||{});x.fillStyle=new T.Color(sc).getHSL({}).l>.7?'#191b1e':v2hex(S.white);x.font='900 '+lg.px+'px Arial Black, Arial, Helvetica, sans-serif';x.textAlign='center';x.textBaseline='middle';
   x.save();const [lx,ly]=P(lg.u,lg.v);x.translate(lx,ly);x.scale(1,1.12);try{x.letterSpacing=lg.track+'px';}catch(e){}x.fillText('TOPS',0,0);x.restore();});}
 function v2ell(rx,ry,rz,ws,hs){const g=new T.SphereGeometry(1,ws||Math.round(24*S3_SEGF),hs||Math.round(16*S3_SEGF));g.scale(rx,ry,rz);return g;}
 function v2cap(r0,r1,len,seg){const pts=[];const n=8;for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI/2;pts.push(new T.Vector2(Math.cos(a)*r1,-len+Math.sin(a)*r1*.9+r1*.9));}for(let i=0;i<=n;i++){const a=i/n*Math.PI/2;pts.push(new T.Vector2(Math.cos(a)*r0,Math.sin(a)*r0*.9));}return new T.LatheGeometry(pts.sort((a,b)=>a.y-b.y),seg||Math.round(16*S3_SEGF));}
 function v2mesh(g,m,par,x,y,z){const o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=o.receiveShadow=true;if(par)par.add(o);return o;}
 function v2pivot(par,x,y,z){const g=new T.Group();g.position.set(x,y,z);par.add(g);return g;}
 function s3BuildV2(L0){const L=Object.assign({},L0);const P=V2P,mesh=v2mesh,ell=v2ell,cap=v2cap,pivot=v2pivot,tag=(o,t)=>{o.userData.tag=t;return o;};
  const fem=L.body==='female'||L.soft;if(fem&&L.lash==null)L.lash=true;const BK=V2BODY[L.body]||V2BODY.standard;
  const shirtM=v2M(0xffffff,'shirt');shirtM.map=v2ShirtTex(L);const skin=v2M(L.skin,'skin'),hairM=v2M(L.hairC||0x222222,'hair'),pantM=v2M(0x101012,'pants'),shoeM=v2M(0x0c0c0e,'shoe');const trim2=v2M(L._stripe,'trim'),shirtPlain=v2M(v2Tops(L.shirt==null?0x141416:L.shirt),'shirt');
  const root=new T.Group();const hips=pivot(root,0,P.leg.hipY,0);const CH=.3;/* chest pivot 0.3 above the hips: the spine bends mid-torso */const chest=pivot(hips,0,CH,0);
  {const t=P.torso,pts=[];const h=t.y1-t.y0;const n=20;for(let i=0;i<=n;i++){const v=i/n;let r=.97+.05*Math.sin(v*Math.PI*.9)+(t.belly+BK[2])*Math.sin(v*Math.PI)*2+.06*Math.max(0,1-v/.18);/* hem flare */if(v>.78)r*=Math.cos((v-.78)/.22*Math.PI*.42);pts.push(new T.Vector2(Math.max(.06,r),t.y0-P.leg.hipY-CH+v*h));}
   pts.push(new T.Vector2(.024,t.y1-P.leg.hipY-CH+.01));const g=new T.LatheGeometry(pts,Math.round(32*S3_SEGF));g.scale(t.rx*BK[0],1,t.rz*BK[1]);g.rotateY(Math.PI);var v2tor=tag(mesh(g,shirtM,chest),'shirt');
   const hb=new T.TorusGeometry(1,.018,8,Math.round(32*S3_SEGF));hb.rotateX(Math.PI/2);hb.scale(t.rx*BK[0]*.99,1,t.rz*BK[1]*.99);var v2hem=tag(mesh(hb,shirtPlain,chest,0,t.y0-P.leg.hipY-CH+.012,0),'hem');
   const cy=t.y1-P.leg.hipY-CH-.025;/* round 6 #5: a shirt collar, not a tube: a stand round the neck that turns down into a leaf (lathe profile V2SHIRT.collar.band, [radius x, y]),
     ~30% taller than the old torus */const cr=new T.LatheGeometry(V2SHIRT.collar.band.map(([r,y])=>new T.Vector2(r,y)),Math.round(28*S3_SEGF));cr.scale(.17,1,.14);const trimD=trim2.clone();trimD.side=T.DoubleSide;tag(mesh(cr,trimD,chest,0,cy,0),'collar');
   /* polo collar points: a rounded pointed flap each side, laid on the chest and splayed into a V (V2SHIRT.collar) */
   {const C=V2SHIRT.collar,[fw,fl,fr]=C.flap;[-1,1].forEach(s=>{const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(fw,0);sh.quadraticCurveTo(fw*.95,-fl*.55,fr,-fl);sh.quadraticCurveTo(fr*.2,-fl*.98,0,-fl*.8);sh.lineTo(0,0);
     const g=new T.ExtrudeGeometry(sh,{depth:.01,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:2,curveSegments:5});if(s<0){g.scale(-1,1,1);}g.computeVertexNormals();
     const o=mesh(g,trim2,chest,s*C.gap,cy+.02,.148*BK[1]);o.rotation.set(C.tilt,s*C.turn,s*C.splay);tag(o,'fold');});}
   const pl=mesh(new T.BoxGeometry(.05,.1,.01),shirtPlain,chest,0,cy-.08,.185*BK[1]);pl.rotation.x=-.25;tag(pl,'placket');}
  const neck=pivot(chest,0,P.torso.y1-P.leg.hipY-CH,0);const head=pivot(neck,0,P.head.c[1]-P.torso.y1,P.head.c[2]);v2Head(head,L,skin,hairM);
  const arm=s=>{const sh=pivot(chest,s*(P.shoulder.x*BK[0]+.02+BK[2]),P.shoulder.y-P.leg.hipY-CH,0);/* a touch wider than the reference so hanging fists clear the belly in the game's idle clips */tag(mesh(ell(.095,.11,.1),shirtPlain,sh,s*.01,-.04,0),'sleeve');
   const CF=V2SHIRT.cuff,cuff=new T.LatheGeometry([new T.Vector2(CF.r0-.006,CF.h/2),new T.Vector2(CF.r0,CF.h/2-.004),new T.Vector2((CF.r0+CF.r1)/2+.002,0),new T.Vector2(CF.r1,-CF.h/2+.004),new T.Vector2(CF.r1-.006,-CF.h/2)],Math.round(16*S3_SEGF));tag(mesh(cuff,trim2,sh,s*.01,CF.y,0),'cuff');/* a fitted red band, not a ring */tag(mesh(cap(P.arm.r0,P.arm.r1,P.arm.upper),skin,sh,0,-.06,0),'upperarm');
   const el=pivot(sh,0,-P.arm.upper-.02,0);mesh(cap(P.arm.r1,P.arm.r1*.92,P.arm.fore),skin,el,0,0,0);const wr=pivot(el,0,-P.arm.fore-.02,0);
   const k=fem?.9:1;/* Hayden 14:57: real toy hands. A chunky palm here; 4 fingers + thumb are built on the skeleton's finger bones in s3Dress (v2Fingers), so they curl round the dart and open when relaxed */mesh(ell(.088*k,.078*k,.06*k,14,10),skin,wr,0,-.06*k,.008);
   if(L.band&&s<0){const b=new T.TorusGeometry(.066,.022,8,20);b.rotateX(Math.PI/2);mesh(b,v2M(L.shirt==null?0xd81e2a:L.shirt,'trim'),el,0,-P.arm.fore+.01,0);}
   wr.traverse(o=>{if(o.isMesh)o.castShadow=false;});return {sh,el,wr};};
  const aL=arm(-1),aR=arm(1);/* aL = the arm at x<0 (the figure's right), as the Lab rig */
  const leg=s=>{const th=pivot(hips,s*P.leg.hipX*BK[0],0,0);tag(mesh(cap(P.leg.r*.98,P.leg.r,P.leg.len*.6+.05),pantM,th,0,-.09,0),'pants');/* thigh top starts at the hip line: when the leg swings out in idle its top no longer pushes through the shirt (the crotch piece covers the join) *//* top tucked under the hem (clip check: it poked 2-11 mm out of the shirt in idle) */const kn=pivot(th,0,-P.leg.len*.5,0);mesh(cap(P.leg.r*.99,P.leg.r*.95,P.leg.len*.58),pantM,kn,0,.02,0);
   const an=pivot(kn,0,-P.leg.len*.5,0);const S=P.shoe;const g=new T.SphereGeometry(1,Math.round(20*S3_SEGF),Math.round(12*S3_SEGF),0,Math.PI*2,0,Math.PI*.62);g.scale(S.w/2,S.h,S.len/2);mesh(g,shoeM,an,0,-S.h+.04,S.toe);
   const sole=new T.CylinderGeometry(1,1,.035,Math.round(20*S3_SEGF));sole.scale(S.w/2*1.02,1,S.len/2*1.02);mesh(sole,v2M(0x1e1e20,'dark'),an,0,-S.h+.03,S.toe);return {th,kn,an};};
  const lL=leg(-1),lR=leg(1);tag(mesh(ell(.19*BK[0],.085,.15*BK[1]),pantM,hips,0,-.03,0),'pants');
  /* the shirt's lower half follows the hips (the Lab skinShirt, v2 heights): the game's spine leans in idle and the throw, which swung the hem off the thighs */
  return {root,hips,spine:null,chest,neck,head,lL,lR,aL,aR,S:{},SKIN:[v2tor,v2hem],skinY:[-.05,-.25,-.18],thighs:[lL,lR].map(l=>[l.th,P.leg.r*1.02,P.leg.len*.5]),v2:true,skinM:skin,fem};}
 /* ===== Vinyl v3 in the game (doc 23, port now): Director's claude/director/vinyl2/vinyl3.js (base v2 + the locked face system, r6 face
    painted on the skull) built into the same pivots as s3BuildV2, so s3Dress puts it on the game's skeleton and every clip, the throw,
    the clearance and the dart grip work unchanged. Test-only: ?v3=1 (TOPS_V3FLAG), read before any figure is built; Kai only (V3BASES).
    Kept from the game's v2: materials (v2M, V2SKIN, venue light), the poster shirt texture + collar, fingers on the finger bones, the hair
    kit (V2HAIRS, from hair28) until Director's hair r8 file lands. Phones get a 1536 px head sheet (desktop 2048) and S3_SEGF segments. */
 const V3BASES=['kai','ray','tama','mia','dazza'];/* doc 25: Ray and Tama on v3; doc 33: Mia (hair28 bunL) and Dazza (hair28 backwards cap, hair under it, sculpted beard) too */
 const V3HAIRMAP={quiff:'quiffL',swept:'sweptR',curly:'curlyL',bun:'bunL',under:'underL'};/* Director's r9 lock builds on v3 heads (doc 24); r14: Ray = the lock-built sweptR (Producer 20 Nov 14:02), sweptL kept for rollback (TOPS_V3HAIRMAP) */
 function v3Want(L){return !!window.TOPS_V3FLAG&&!!L&&!!L.base&&V3BASES.includes(L.base)&&!L.pro;}
 const V3P={H:1.6,head:{c:[0,1.31,0.03],r:[0.295,0.27,0.27]},face:{phi:[-0.95,1.9],theta:[0.95,1.65]},torso:{y0:0.535,y1:1.015,rx:0.3,rz:0.215,belly:0.05,sh:0.365},
  shoulder:{x:0.274,y:0.885},arm:{upper:0.15,fore:0.135,r0:0.094,r1:0.084,r2:0.071},leg:{hipX:0.152,hipY:0.535,len:0.335,r:0.15,rs:0.138},shoe:{len:0.42,w:0.22,h:0.19,toe:0.08}};
 const V3EYE={dx:178,get v(){return 0.455+(window.TOPS_EYE17!==0?(window.TOPS_EYE_DV!=null?window.TOPS_EYE_DV:0.025):0);},rx:83,ry:92};/* r17 (doc 49): eyes 2.5% of head height lower; glasses, the eye gloss map and the brows follow (they all read V3EYE.v) */
 const V3FACE={def:{brow:[1.0,0.0,1.0],browUp:0,mouth:1.18,smile:1.0,asym:0,squint:0,cheek:1.0,jaw:1.0,cheekW:1.0},
  kai:{p21:{jaw:1.55,cheekW:1.25,earK:1.12},g18:1.03,b18:{T:40,A:22,U:8,I:6,O:0},earTuck:0.135,browC:'#24160F',brow:[1.12,-0.02,1.15],browUp:4,browIn:6,browOut:7,cheekUp:0.035,mouth:1.18,smile:1.04,/* r12 cheeky (Director doc 28, ChatGPT 27 #2): inner brow up 6 px, outer third up 3 px more, upper cheeks up, corners +4%; eyes kept */asym:0.08,squint:0.07,cheek:1.0,jaw:1.15,cheekW:1.0},
  ray:{p21:{jaw:1.35,cheekW:1.5,cheek:1.35,earK:1.12},g18:1.1,b18:{T:34,A:22,U:16,C:'#5e5853'},browC:'#a8a39e',brow:[1.0,-0.08,1.2],browUp:10,mouth:1.0,smile:1.15,asym:0,squint:0.1,cheek:1.1,jaw:0.9,cheekW:1.0},
  tama:{p21:{jaw:1.15,cheekW:1.35,earK:1.08},g18:1.04,b18:{T:36,A:24,U:10},browC:'#140c0a',brow:[1.25,-0.02,1.05],browUp:2,mouth:1.08,smile:1.2,asym:0,squint:0.06,cheek:1.35,jaw:0.95,cheekW:1.25},
  dazza:{p21:{noseK:1.12,b18:{T:42,A:20,U:8,I:3}}/* r21b (doc 57): nose +12%, heavier brows (PROP21) */,g18:1.14,b18:{T:36,A:20,U:8,I:3},browC:'#2a170d',brow:[1.2,-0.06,1.15],browUp:4,mouth:1.05,smile:1.1,asym:0.04,squint:0.12,cheek:1.15,jaw:1.25,cheekW:1.1},
  mia:{flick21:1/* r21b (doc 57) */,p21:{cheek:1.22,cheekW:1.12},g18:1.06,b18:{T:25,A:28,U:14,C:'#6a3f1c'},browC:'#7a4c1e',brow:[0.72,-0.1,1.35],browUp:8,mouth:0.98,smile:1.12,asym:0.1,squint:0,cheek:1.1,jaw:0.75,cheekW:1.0}};
 const v3FaceOf=L=>{const F=V3FACE[L.base]||{};return Object.assign({},V3FACE.def,F,(window.TOPS_PROP21!==0&&F.p21)||{},L.v3face||{});};/* r21 (doc 56): per-character head/face proportion (TOPS_PROP21=0 = r20 shapes) */
 const v3smf=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);},v3gs=(x,c,w)=>Math.exp(-((x-c)*(x-c))/(2*w*w));
 /* the v3 head shape: one deformation for the skull and the painted face (vinyl3.js headPoint, unchanged) */
 function v3HeadPoint(d,cheek,FP){const R=V3P.head.r;let sx=1,sy=1,sz=1;const smf=v3smf,gs=v3gs;
  sy*=1-0.045*smf(0.45,1,d.y);sz*=1-0.04*smf(-0.25,-1,d.z);sx*=1+0.03*smf(-0.1,0.5,d.y)*smf(-0.2,0.6,d.z);
  sx*=1+(0.085+0.06*FP.cheekW)*smf(-0.05,-0.55,d.y)*smf(-0.3,0.4,d.z)*(1-0.6*smf(-0.75,-1,d.y));sy*=1-0.06*smf(-0.7,-1,d.y);
  sx*=1-0.035*smf(0.55,0.95,Math.abs(d.x))*smf(-0.2,0.3,d.y);sx*=1+0.05*smf(-0.72,-0.95,d.y)*smf(-0.1,0.5,d.z);sx*=1+0.045*FP.jaw*smf(-0.6,-0.85,d.y)*smf(0,0.5,d.z);
  const p=new T.Vector3(d.x*R[0]*sx,d.y*R[1]*sy,d.z*R[2]*sz);const ph=Math.atan2(d.x,d.z),th=Math.acos(Math.max(-1,Math.min(1,d.y)));
  const ch=0.095*(cheek||1)*(gs(ph,0.66,0.24)+gs(ph,-0.66,0.24))*gs(th,1.98-(FP.cheekUp||0),0.22),mz=0.05*gs(ph,0,0.45)*gs(th,2.25,0.2),br=0.05*(gs(ph,0.34,0.2)+gs(ph,-0.34,0.2))*gs(th,1.31,0.065);
  p.multiplyScalar(1+ch+mz+br);p.z+=0.032*R[2]*(cheek||1)*(gs(ph,0.66,0.26)+gs(ph,-0.66,0.26))*gs(th,1.98-(FP.cheekUp||0),0.22);return p;}
 /* the v3 torso shell (vinyl3.js torsoGeo): trapezoid, belly, built-in sloped shoulders; lathe-style UV so the poster shirt texture fits */
 function v3TorsoGeo(BK,dy){const t=V3P.torso,h=t.y1-t.y0,U=Math.round(48*S3_SEGF),Vn=Math.round(26*S3_SEGF),pos=[],uv=[],idx=[],smf=v3smf,gs=v3gs;
  for(let j=0;j<=Vn;j++){const v=j/Vn;let rx=0.276-0.008*gs(v,0.26,0.1)+(t.rx-0.272)*smf(0.3,0.66,v)+(t.sh-t.rx)*smf(0.62,0.82,v);let rz=t.rz*(0.95+0.06*smf(0.35,0.7,v));const y=v*h;
   if(v>0.8){const q=(v-0.8)/0.2;const c=Math.pow(Math.max(0,1-Math.pow(q,2.4)),1/2.4);rx=0.11+(rx-0.11)*c;rz=0.1+(rz-0.1)*Math.pow(Math.max(0,1-q*q),0.5);}
   for(let i=0;i<=U;i++){const u=i/U,a=u*2*Math.PI,ca=-Math.cos(a),sa=-Math.sin(a);const yv=y-0.044*smf(0.6,0.95,v)*Math.pow(Math.abs(sa),2);const ex=2/2.3;
    let x=Math.sign(sa)*Math.pow(Math.abs(sa),ex)*rx*BK[0],z=Math.sign(ca)*Math.pow(Math.abs(ca),ex)*rz*BK[1];
    if(z>0)z+=(t.belly+BK[2])*gs(v,0.3,0.16)*Math.pow(Math.max(0,ca),1.6)+0.034*gs(v,0.68,0.13)*Math.pow(Math.max(0,ca),2);if(z<0)z*=0.92;
    if(v<0.06){const q=1-v/0.06;x*=1-0.05*q*q;z*=1-0.05*q*q;}pos.push(x,t.y0-V3P.leg.hipY+yv+dy,z);uv.push(u,v);}}
  for(let j=0;j<Vn;j++)for(let i=0;i<U;i++){const a=j*(U+1)+i,b=a+1,c=a+U+1,d=c+1;idx.push(a,b,c,b,d,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
 /* the same outline for the clearance (fists and darts kept out of the shirt): ellipse half-widths at chest-local y, inside the superellipse */
 function v3TorsoR(y,BK){const t=V3P.torso,y0=t.y0-V3P.leg.hipY-.3,h=t.y1-t.y0,v=(y-y0)/h;if(v<0||v>1)return null;const smf=v3smf,gs=v3gs;
  let rx=0.276-0.008*gs(v,0.26,0.1)+(t.rx-0.272)*smf(0.3,0.66,v)+(t.sh-t.rx)*smf(0.62,0.82,v),rz=t.rz*(0.95+0.06*smf(0.35,0.7,v));
  if(v>0.8){const q=(v-0.8)/0.2;rx=0.11+(rx-0.11)*Math.pow(Math.max(0,1-Math.pow(q,2.4)),1/2.4);rz=0.1+(rz-0.1)*Math.pow(Math.max(0,1-q*q),0.5);}
  return [rx*BK[0]*1.045,(rz+(t.belly+BK[2])*gs(v,0.3,0.16)+0.034*gs(v,0.68,0.13))*BK[1]*1.045];}/* x1.045: the shell is a superellipse (p 2.3), up to 4.5% outside the ellipse on the diagonals */
 /* the locked v3 face sheet (vinyl3.js faceTex, r5/r6: poster eyes, thick soft-arched brows, narrower smile with one row of teeth,
    rounded upper-lip frame); sk = the canvas skin colour (the squint lid) */
 function v3FaceSheet(L,sk){const c=document.createElement('canvas');c.width=1024;c.height=640;const x=c.getContext('2d'),W=1024,H=640,Fp=v3FaceOf(L),E=V3EYE;
  const ex=[W*0.5-E.dx,W*0.5+E.dx],ey=H*E.v;const RX=E.rx,RY=E.ry*1.05*(1-Fp.squint);const eyeC=Fp.eyeC||'#24170F';
  if(window.TOPS_BLUSH18!==0){/* r18 (doc 50, poster): rosy cheek apples, a touch higher and further out; colour and strength follow the skin's brightness (deeper rose on darker
     skin so it still reads); TOPS_BLUSH scales cheeks and nose together (set by the skin three-way) */const sl=new T.Color(sk);const lum=0.3*sl.r+0.59*sl.g+0.11*sl.b;const BK=(window.TOPS_BLUSH!=null?window.TOPS_BLUSH:1)*(Fp.blush||1);
   const col=lum>0.6?[236,96,92]:[196,62,66],a0=(lum>0.6?0.44:0.5)*BK;
   [ex[0]-34,ex[1]+34].forEach(cx=>{const cyb=ey+118-(Fp.cheekUp||0)*200;const r_=96*Fp.cheek;const g=x.createRadialGradient(cx,cyb,0,cx,cyb,r_);g.addColorStop(0,`rgba(${col},${a0})`);g.addColorStop(0.55,`rgba(${col},${a0*0.55})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.save();x.translate(cx,cyb);x.scale(1.15,0.85);x.translate(-cx,-cyb);x.fillRect(cx-r_,cyb-r_,r_*2,r_*2);x.restore();});}
  else [ex[0]-26,ex[1]+26].forEach(cx=>{const cyb=ey+130-(Fp.cheekUp||0)*200;const g=x.createRadialGradient(cx,cyb,0,cx,cyb,92*Fp.cheek);g.addColorStop(0,'rgba(240,110,100,.32)');g.addColorStop(1,'rgba(240,110,100,0)');x.fillStyle=g;x.fillRect(cx-110,cyb-110,220,220);});
  ex.forEach((cx,i)=>{x.save();x.translate(cx,ey);x.fillStyle='#ffffff';x.beginPath();x.ellipse(0,0,RX,RY,0,0,7);x.fill();x.save();x.beginPath();x.ellipse(0,0,RX,RY,0,0,7);x.clip();
   if(window.TOPS_EYE17!==0){/* r17 (doc 49): warm brown radial iris (#5a3a24 low and centre -> #221410 rim), iris +8%, soft dark pupil; both highlights kept */
    const IK=window.TOPS_IRIS||1.08,ox=i?-6:6,oy=12;const g=x.createRadialGradient(ox,oy+RY*0.32,6,ox,oy+4,RX*0.97*IK);if((window.TOPS_V3FLAG===true&&window.TOPS_EYE8!==0)){/* round 8A (ChatGPT r7: the eyes wash out): dark core #241510 at the pupil, a warm-brown OUTER iris, then a near-black outline ring */g.addColorStop(0,'#241510');g.addColorStop(0.42,'#3a2216');g.addColorStop(0.72,'#6e4228');g.addColorStop(0.86,'#5a3420');g.addColorStop(0.93,'#160c07');g.addColorStop(1,'#0d0704');}else{g.addColorStop(0,'#5a3a24');g.addColorStop(0.45,'#43291a');g.addColorStop(0.75,'#2a1a12');g.addColorStop(1,'#221410');}x.fillStyle=g;
    x.beginPath();x.ellipse(ox,oy,RX*0.97*IK,92*IK,0,0,7);x.fill();const gp=x.createRadialGradient(ox,oy+4,RX*0.18,ox,oy+4,RX*0.5);gp.addColorStop(0,'rgba(14,8,5,0.95)');gp.addColorStop(1,'rgba(14,8,5,0)');x.fillStyle=gp;x.beginPath();x.ellipse(ox,oy+4,RX*0.5,56,0,0,7);x.fill();}
   else{{const g=x.createRadialGradient(i?-6:6,14,10,i?-6:6,14,RX*0.98);g.addColorStop(0,'#120b07');g.addColorStop(0.7,eyeC);g.addColorStop(1,'#5a3420');x.fillStyle=g;}
   x.beginPath();x.ellipse(i?-6:6,12,RX*0.97,92,0,0,7);x.fill();x.fillStyle='#0a0604';x.beginPath();x.ellipse(i?-6:6,16,RX*0.52,52,0,0,7);x.fill();}
   x.fillStyle='#ffffff';{const C8=(window.TOPS_V3FLAG===true&&window.TOPS_EYE8!==0)?1.22:1;/* round 8A: one strong white catchlight (+22%) */x.beginPath();x.ellipse(i?-30:-18,-24,30*C8,34*C8,0,0,7);x.fill();}x.beginPath();x.ellipse(i?18:30,40,12,13,0,0,7);x.fill();x.globalAlpha=0.6;x.beginPath();x.ellipse(i?-2:10,-40,8,8,0,0,7);x.fill();x.globalAlpha=1;
   if(Fp.squint){x.fillStyle=sk;x.fillRect(-RX-4,-RY-4,RX*2+8,RY*Fp.squint*2.2);}x.restore();
   x.strokeStyle='#1a0f0a';x.lineWidth=8;x.lineCap='round';x.beginPath();x.ellipse(0,0,RX,RY,0,Math.PI*1.06,Math.PI*1.94);x.stroke();
   if(L.lash||(window.TOPS_EYE17!==0&&/tama/i.test(String(L.base||L.name||'')))){/* r17: lashes on Tama too */x.lineWidth=8;[[-50,-40,-72,-62],[-32,-56,-48,-84],[i?44:-12,-62,i?58:-14,-92]].forEach(([a,b,c2,d])=>{const s=i?-1:1;x.beginPath();x.moveTo(a*s,b);x.lineTo(c2*s,d);x.stroke();});if(Fp.flick21&&(window.TOPS_V3FLAG===true&&window.TOPS_SIG21!==0&&window.TOPS_SIG_MIA!==0)){/* r21b (doc 57) Mia signature: one bold upswept outer lash flick per eye (poster), a tapered filled stroke */const s=i?-1:1,F=Fp.flick21;x.fillStyle='#1a0f0a';x.beginPath();x.moveTo(-RX*0.7*s,-RY*0.62);x.quadraticCurveTo(-RX*1.08*s,-RY*0.62,-RX*(1.18+0.1*F)*s,-RY*(0.98+0.12*F));x.quadraticCurveTo(-RX*1.0*s,-RY*0.8,-RX*0.66*s,-RY*0.8);x.closePath();x.fill();}}x.restore();});
  if(window.TOPS_BROW18!==0){/* r18 (doc 50, poster): arched STROKE brows tapering from a rounded inner end to a fine outer tip, set a little higher.
     Per character (FACE.b18): T thickness px, A arch, U lift, I inner drop, O outer drop, C colour, tp taper; TOPS_BROW18P overrides */
   const BP=Object.assign({T:20,A:22,U:8,I:0,O:0},Fp.b18||{},(window.TOPS_BROW18P||{})[L.base]||{});x.fillStyle=BP.C||Fp.browC||v2hex(L.brow||0x3a1e10);if(window.TOPS_V3FLAG===true&&window.TOPS_BROW8!==0){/* round 8A: brows 25% darker for contrast (Ray 38%), same shape */const c8=new T.Color(x.fillStyle);c8.multiplyScalar(/ray/i.test(String(L.base||''))?(window.TOPS_BROW8_RAY||0.62):(window.TOPS_BROW8_K||0.75));x.fillStyle='#'+c8.getHexString();}
   ex.forEach((cx,i)=>{const s=i?1:-1;const up=BP.U+Fp.browUp*0.5-(i?0:1)*Fp.asym*20;
    const P0=[cx-100*s,ey-RY-24-up+BP.I],P2=[cx+112*s,ey-RY-14-up+BP.O],P1=[cx+2*s,ey-RY-26-up-BP.A*2];
    const q=t=>[(1-t)*(1-t)*P0[0]+2*t*(1-t)*P1[0]+t*t*P2[0],(1-t)*(1-t)*P0[1]+2*t*(1-t)*P1[1]+t*t*P2[1]];
    const N=24,top=[],bot=[];for(let k=0;k<=N;k++){const t=k/N,p=q(t),p2=q(Math.min(1,t+0.01)),p1=q(Math.max(0,t-0.01));let dx=p2[0]-p1[0],dy=p2[1]-p1[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
     const w=BP.T*(0.82+0.5*Math.sin(Math.PI*Math.min(1,t/0.6))*0.36)*(t<0.4?1:1-(BP.tp||0.6)*Math.pow((t-0.4)/0.6,1.4))*(t<0.06?0.75+0.25*Math.sin(Math.PI/2*t/0.06):1)/2;
     top.push([p[0]+dy*w*0.6,p[1]-w]);bot.push([p[0]-dy*w*0.6,p[1]+w]);}
    x.beginPath();x.moveTo(top[0][0],top[0][1]);for(const p of top)x.lineTo(p[0],p[1]);for(let k=bot.length-1;k>=0;k--)x.lineTo(bot[k][0],bot[k][1]);x.closePath();x.fill();
    x.beginPath();x.ellipse(P0[0],P0[1],BP.T*0.32,BP.T*0.41,0,0,7);x.fill();});}
  else{x.fillStyle=Fp.browC||v2hex(L.brow||0x3a1e10);
  ex.forEach((cx,i)=>{const s=i?1:-1;const k=Fp.brow[0],ang=Fp.brow[1],arch=Fp.brow[2];const up=Fp.browUp-(i?0:1)*Fp.asym*30;const iy=ey-126+ang*60-up-(Fp.browIn||0),oy=ey-138-ang*30-up-(Fp.browOut||0),py=ey-180-arch*22-up;
   const K=k*1.4*1.13*1.15;x.beginPath();x.moveTo(cx-108*s,iy+24*K);x.quadraticCurveTo(cx-116*s,iy-6,cx-100*s,iy-26*K);x.quadraticCurveTo(cx+8*s,py-8*K,cx+114*s,oy);x.quadraticCurveTo(cx+120*s,oy+7,cx+110*s,oy+11);
   x.quadraticCurveTo(cx+10*s,py+40*K,cx-108*s,iy+24*K);x.closePath();x.fill();});}
  const M17=window.TOPS_MOUTH17!==0&&window.TOPS_MOUTH16!==0;/* r17 (doc 49): the mouth sits 14 px lower (a gap under the nose), opens back up to 88%, and the dark 'D' becomes a thin gap + a red tongue band */
  const my=H*0.728+(M17?(window.TOPS_MOUTH_DY!=null?window.TOPS_MOUTH_DY:14):0),mw=215*Fp.mouth*0.84*(M17?(window.TOPS_MOUTH_W||1.0):1)*(M17&&window.TOPS_GRIN18!==0?(Fp.g18||1):1)/* r18: per-character grin width */,sm_=Fp.smile,as=Fp.asym*40;const lc=[W/2-mw,my-44*sm_+as],rc=[W/2+mw,my-44*sm_-as];
  /* r16 mouth (Director doc 45, ChatGPT 44): cavity -28% (lower edge up), corners pinch in, upper teeth ~70% of the opening as a curved row
     (warm-grey falloff, lip shadow, two faint incisor lines), a thin lower row, a sliver of tongue, dark corners. TOPS_MOUTH16=0 = the r5 mouth */
  const M16=window.TOPS_MOUTH16!==0,MD=M16?(window.TOPS_MOUTH_DEPTH||(M17?0.88:0.72)):1,mb=my-6+156*MD,mk=86*MD,CK=M16?(window.TOPS_MOUTH_CK||0.6):0.86,CK2=M16?(window.TOPS_MOUTH_CK2||0.4):0.5;
  const path=()=>{x.beginPath();x.moveTo(lc[0],lc[1]);x.quadraticCurveTo(W/2,my-6,rc[0],rc[1]);x.bezierCurveTo(W/2+mw*CK,my+mk*sm_,W/2+mw*CK2,mb,W/2,mb);x.bezierCurveTo(W/2-mw*CK2,mb,W/2-mw*CK,my+mk*sm_,lc[0],lc[1]);x.closePath();};
  x.fillStyle='#34090c';path();x.fill();x.save();path();x.clip();
  x.fillStyle='#fbf7f0';x.beginPath();x.moveTo(lc[0]-6,lc[1]-10);x.quadraticCurveTo(W/2,my-20,rc[0]+6,rc[1]-10);
  const tb=my-6+(mb-my+6)*(window.TOPS_TEETH||(M17?0.66:0.7));
  if(!M16){x.lineTo(rc[0]-mw*0.07,rc[1]+31);x.bezierCurveTo(W/2+mw*0.5,my+61,W/2-mw*0.5,my+61,lc[0]+mw*0.07,lc[1]+31);}
  else if(M17){const TI=0.1;/* r17: teeth run closer to the corners (no dark pocket at the near corner in 3/4) */x.lineTo(rc[0]-mw*TI,rc[1]+14);x.bezierCurveTo(W/2+mw*0.55,tb+4,W/2-mw*0.55,tb+4,lc[0]+mw*TI,lc[1]+14);}
  else{x.lineTo(rc[0]-mw*0.2,rc[1]+18);x.bezierCurveTo(W/2+mw*0.5,tb+4,W/2-mw*0.5,tb+4,lc[0]+mw*0.2,lc[1]+18);}
  x.closePath();
  if(!M16){x.fill();x.strokeStyle='rgba(150,120,110,.3)';x.lineWidth=3;for(let k=-3;k<=3;k++){const xx=W/2+k*mw*0.2;x.beginPath();x.moveTo(xx,my-8);x.lineTo(xx,my+40-Math.abs(k)*5);x.stroke();}}
  else{x.save();x.clip();
   const gh=x.createRadialGradient(W/2,my+10,mw*0.15,W/2,my+10,mw*1.05);gh.addColorStop(0,'#fdfaf4');gh.addColorStop(0.55,'#f1ebe2');gh.addColorStop(1,'#a89a90');x.fillStyle=gh;x.fillRect(W/2-mw*1.2,my-80,mw*2.4,240);
   const gv=x.createLinearGradient(0,my-30,0,tb+6);gv.addColorStop(0,'rgba(90,40,30,.42)');gv.addColorStop(0.28,'rgba(90,40,30,0)');gv.addColorStop(0.85,'rgba(120,90,80,0)');gv.addColorStop(1,'rgba(120,90,80,.22)');x.fillStyle=gv;x.fillRect(W/2-mw*1.2,my-80,mw*2.4,240);
   x.strokeStyle='rgba(140,110,100,.28)';x.lineWidth=2.5;x.lineCap='round';for(const k of [-1,0,1]){const xx=W/2+k*mw*0.24;const y1=my+(k?14:22)+Math.abs(k)*4;x.beginPath();x.moveTo(xx,my+2);x.lineTo(xx+k*2,y1);x.stroke();}
   x.restore();}
  if(!M16){x.fillStyle='#e06a6a';x.beginPath();x.ellipse(W/2,my+146,mw*0.34,36,0,0,7);x.fill();}
  else if(M17){/* r17: a thin dark gap under the teeth, then a warm red tongue / inner-lip band; no lower teeth; small dark corners */const ry=Math.max(14,(mb-tb)*1.05);
   const gt=x.createRadialGradient(W/2,mb-2,4,W/2,mb-2,mw*0.75);gt.addColorStop(0,'#d0545c');gt.addColorStop(0.6,'#b23c46');gt.addColorStop(1,'#7a1e28');x.fillStyle=gt;x.beginPath();x.ellipse(W/2,mb+4,mw*(window.TOPS_TONGUE||0.85),ry,0,0,7);x.fill();
   [lc,rc].forEach(c2=>{const cr_=mw*0.12;const g=x.createRadialGradient(c2[0],c2[1]+6,2,c2[0],c2[1]+6,cr_);g.addColorStop(0,'rgba(20,4,6,.85)');g.addColorStop(1,'rgba(20,4,6,0)');x.fillStyle=g;x.fillRect(c2[0]-cr_,c2[1]-cr_,cr_*2,cr_*2);});}
  else{x.fillStyle='#d9ccc2';x.beginPath();x.ellipse(W/2,mb-2,mw*0.3,11,0,Math.PI,2*Math.PI);x.fill();
   x.fillStyle='#b8505a';x.beginPath();x.ellipse(W/2,mb+12,mw*0.22,12,0,0,7);x.fill();
   [lc,rc].forEach(c2=>{const g=x.createRadialGradient(c2[0],c2[1]+8,2,c2[0],c2[1]+8,mw*0.2);g.addColorStop(0,'rgba(20,4,6,.85)');g.addColorStop(1,'rgba(20,4,6,0)');x.fillStyle=g;x.fillRect(c2[0]-mw*0.3,c2[1]-mw*0.3,mw*0.6,mw*0.6);});}
  x.restore();
  x.strokeStyle='#5a2418';x.lineCap='round';x.lineWidth=5;path();x.stroke();if(M17){x.strokeStyle='#8a3328';x.lineWidth=7;}/* r17: a warm lip line, not a heavy dark bar */else x.lineWidth=10;x.beginPath();x.moveTo(W/2-mw*0.6,my-6+126*MD);x.bezierCurveTo(W/2-mw*0.32,mb+1,W/2+mw*0.32,mb+1,W/2+mw*0.6,my-6+126*MD);x.stroke();
  x.strokeStyle='rgba(120,50,35,.55)';x.lineWidth=9;x.beginPath();x.moveTo(lc[0]-2,lc[1]-4);x.quadraticCurveTo(W/2,my-30,rc[0]+2,rc[1]-4);x.stroke();
  x.strokeStyle='rgba(140,60,40,.2)';x.lineWidth=6;[[lc,-1],[rc,1]].forEach(([c2,s])=>{x.beginPath();x.moveTo(c2[0]+s*2,c2[1]+4);x.quadraticCurveTo(c2[0]+s*18,c2[1]-4,c2[0]+s*20,c2[1]-24);x.stroke();});
  x.strokeStyle='rgba(150,70,50,.45)';x.lineWidth=6;x.beginPath();x.moveTo(lc[0]+mw*0.08,lc[1]-6);x.bezierCurveTo(W/2-mw*0.4,my-30,W/2-mw*0.12,my-22,W/2,my-14);x.bezierCurveTo(W/2+mw*0.12,my-22,W/2+mw*0.4,my-30,rc[0]-mw*0.08,rc[1]-6);x.stroke();
  return c;}
 /* the face sheet drawn into the skull's own equirect map (one surface, no decal layer: r6), and a matching roughness map that keeps
    the painted eyes glossy (V2EYEGLOSS) on a skin-rough face */
 function v3EyeOnHead(s,FP){const F=V3P.face,ph=Math.PI/2+s*V3EYE.dx/1024*F.phi[1],th=F.theta[0]+V3EYE.v*F.theta[1];return v3HeadPoint(new T.Vector3(-Math.cos(ph)*Math.sin(th),Math.cos(th),Math.sin(ph)*Math.sin(th)),FP.cheek,FP);}
 /* the v3 skull is the ellipsoid pushed out (cheeks, muzzle, brow) and in (flat top and back): skullF(l) = its radius over the ellipsoid's
    in the direction of the skull-space point l, so the clearance and the clip check test the real surface, not the ellipsoid x1.04 */
 function v3SkullF(FP){const R=V3P.head.r,d=new T.Vector3();return l=>{d.set(l.x/R[0],l.y/R[1],l.z/R[2]);const n=d.length();if(n<1e-6)return 1;d.multiplyScalar(1/n);const p=v3HeadPoint(d,FP.cheek,FP);return Math.hypot(p.x/R[0],p.y/R[1],p.z/R[2]);};}
 function v3HeadMaps(L,sk,rough){const big=S3G==='full'?2048:1536,FW=big,FH=big/2,F0=V3P.face,face=v3FaceSheet(L,sk);
  const at=(x,W,H)=>[(Math.PI/2-F0.phi[1]/2)/(2*Math.PI)*W,F0.theta[0]/Math.PI*H,F0.phi[1]/(2*Math.PI)*W,F0.theta[1]/Math.PI*H];
  const col=v2cv(FW,FH,(x,W,H)=>{x.fillStyle=sk;x.fillRect(0,0,W,H);x.drawImage(face,...at(x,W,H));});
  const rm=document.createElement('canvas');rm.width=512;rm.height=256;{const x=rm.getContext('2d'),W=512,H=256,g=Math.round(255*rough),[ox,oy,sw,sh]=at(x,W,H),E=V3EYE;
   x.fillStyle=`rgb(${g},${g},${g})`;x.fillRect(0,0,W,H);const e=Math.round(255*(window.TOPS_V3EYER!=null?window.TOPS_V3EYER:.3));/* TOPS_V3EYER: eye-region roughness (test knob) *//* .3 not V2EYEGLOSS .2: the v3 irises are big and near-black, and a sharper env reflection greyed them in the pane */x.fillStyle=`rgb(${e},${e},${e})`;
   [-1,1].forEach(s=>{x.beginPath();x.ellipse(ox+sw*(0.5+s*E.dx/1024),oy+sh*E.v,sw*E.rx/1024,sh*E.ry/640,0,0,7);x.fill();});}
  const rt=new T.CanvasTexture(rm);return [col,rt];}
 /* doc 27 #6: dark skin's shadow side read slightly grey at the match cam. A small warm term only where the direct light is low
    (no blanket brightening), scaled by how dark the skin is: full on Tama's tone, zero on the light skins. TOPS_V3SHWU.value is the
    shared linear radiance (pre tone map), tuned so Tama's shadow cheek gains ~+5 R / +3 G in the pane */
 const V3SHWU=window.TOPS_V3SHWU={value:new T.Vector3(.0095,.0032,0)};
 function v3Warm(m,ref){const c=(ref||m).color.clone();if(window.GFX_LIN)c.convertLinearToSRGB();const g=Math.max(1,c.r,c.g,c.b);c.multiplyScalar(1/g);
  const lum=.299*c.r+.587*c.g+.114*c.b,k=Math.max(0,Math.min(1,(.55-lum)/.18));if(k<=0)return m;
  const prev=Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,pk=m.customProgramCacheKey?m.customProgramCacheKey():'';const uk={value:k};
  m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);sh.uniforms.uShW=V3SHWU;sh.uniforms.uShK=uk;
   sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform vec3 uShW;uniform float uShK;\nvoid main() {').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n{float dl=dot(reflectedLight.directDiffuse,vec3(.299,.587,.114))/max(1e-4,dot(diffuseColor.rgb,vec3(.299,.587,.114)));reflectedLight.indirectDiffuse+=uShW*uShK*(1.-smoothstep(.03,.28,dl));}');};
  m.customProgramCacheKey=()=>pk+'|v3shw';m.userData.v3shw=k;m.needsUpdate=true;return m;}
 function v3Head(head,L,skin,hairM){const R=V3P.head.r,mesh=v2mesh,ell=v2ell,FP=v3FaceOf(L);
  /* the skull carries the face: canvas painted in the skin colour the material system chose (V2SKIN or the HSL rule), the material keeps
     only the linear gain above 1 and the pane lift (v2fk), so the painted skin and the body skin match */
  const lc=skin.color.clone(),gn=Math.max(1,lc.r,lc.g,lc.b),cc=lc.clone().multiplyScalar(1/gn),skHex='#'+cc.getHexString();
  const SKV=window.TOPS_V3SKIN;const [map,rmap]=v3HeadMaps(L,skHex,SKV&&SKV.r!=null?SKV.r:V2MAT.skin[0]);const hm=skin.clone();if(skin._v3spec){hm.onBeforeCompile=skin._v3spec;hm.customProgramCacheKey=()=>'v3spec';}/* only the test hook: the dark-skin warm term is added to hm by v3Warm below, so it must not be copied too (it was injected twice) *//* skin test knob reaches the face too (clone drops onBeforeCompile; the roughness map bakes the skin roughness) */hm.map=map;hm.color.setRGB(gn,gn,gn);hm.roughness=1;hm.roughnessMap=rmap;v3Warm(hm,skin);
  const sg=new T.SphereGeometry(1,Math.round(64*S3_SEGF),Math.round(48*S3_SEGF));{const p=sg.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();const q=v3HeadPoint(v,FP.cheek,FP);p.setXYZ(i,q.x,q.y,q.z);}sg.computeVertexNormals();}
  const sk=mesh(sg,hm,head);sk.userData.tag='skull';sk.castShadow=false;
  {const np=v3HeadPoint(new T.Vector3(0,Math.cos(Math.PI/2+0.36),Math.sin(Math.PI/2+0.36)).normalize(),FP.cheek,FP);let nm=skin;if(window.TOPS_BLUSH18!==0){/* r18 (doc 50): rosy nose tip, a colour tint on the nose's own clone of the skin (same shader: the warm/test hooks are carried, not re-added) */nm=skin.clone();if(skin.onBeforeCompile){nm.onBeforeCompile=skin.onBeforeCompile;nm.customProgramCacheKey=skin.customProgramCacheKey;}
   const sl=new T.Color(L.skin);const lum=0.3*sl.r+0.59*sl.g+0.11*sl.b;nm.color.lerp(new T.Color(lum>0.6?0xe0786a:0xb04a44).convertSRGBToLinear(),(window.TOPS_NOSE_BLUSH!=null?window.TOPS_NOSE_BLUSH:0.16)*(window.TOPS_BLUSH!=null?window.TOPS_BLUSH:1));}
   const NK=FP.noseK||1;/* r21b (doc 57): Dazza nose +12% (PROP21) */mesh(ell(0.058*(L.nose||1)*NK,0.047*NK,0.05*NK,16,12),nm,head,0,np.y,np.z-0.022*NK).castShadow=false;}
  const earIn=v2M(new T.Color(L.skin).multiplyScalar(0.82).getHex(),'skin');
  const tuck=(FP.earTuck||0)*(R[0]*1.07+0.032-v3HeadPoint(new T.Vector3(1,-0.074,-0.055).normalize(),FP.cheek,FP).x);/* r10: per-character ear tuck (Kai 0.135) */
  [-1,1].forEach(s=>{const ex=s*(R[0]*1.07-tuck);const EK=FP.earK||1;const e=mesh(ell(0.032*EK,0.082*EK,0.058*EK,16,12),skin,head,ex,-0.02,-0.015);e.rotation.y=s*0.32;const ie=mesh(ell(0.012*EK,0.055*EK,0.036*EK,12,9),earIn,head,ex+s*0.022*EK,-0.02,-0.005);/* r21: ears per character (earK) */ie.rotation.y=s*0.32;e.userData.ear=ie.userData.ear=true;/* long-hair styles hide the ears they cover */
   if(L.earring){const er=mesh(new T.TorusGeometry(.032,.008,6,16),v2M(L.earring,'trim'),head,s*R[0],-.11,0);er.rotation.y=Math.PI/2;er.userData.ear=true;}});
  const bc=L.beardC||L.hairC||0x3a2010;if(L.face==='full')V2HAIRS.beardL(head,L,V2HK());/* hair28 sculpted beard on the v3 face (Dazza) */else if(L.face==='stubble'||L.face==='goatee'||L.face==='walrus')v2Beard(head,L.face,L.face==='stubble'?new T.Color(L.skin).lerp(new T.Color(bc),.45).getHex():bc);
  v2Hair(head,Object.assign({},L,{_v3:true}),hairM);
  sk.userData.eyeAt=s=>v3EyeOnHead(s,FP);
  if(L.glasses){/* lenses centred on the painted v3 eyes (on the shaped skull), sized from the v3 eye; no temple arms */const SR=window.TOPS_SIG21!==0&&window.TOPS_SIG_RAY!==0;/* r21 (doc 56) Ray signature: lighter frames (rim -25%, lens -8%, warm dark brown) so the eyes lead */const gm=v2M(SR?0x2a2420:0x111111,'shoe'),F=V3P.face;const lr=V3EYE.rx/1024*F.phi[1]*R[0]*1.35*(SR?0.92:1),lh=V3EYE.ry/640*F.theta[1]*R[1]*1.12*(SR?0.92:1);
   [-1,1].forEach(s=>{const e=v3EyeOnHead(s,FP);const n=new T.Vector3(e.x/R[0]/R[0],e.y/R[1]/R[1],e.z/R[2]/R[2]).normalize();const o=mesh(new T.TorusGeometry(.962,SR?.09:.12,8,24),gm,head,e.x+n.x*.022,e.y+n.y*.022,e.z+n.z*.022);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);o.scale.set(lr,lh,lr*.9);o.userData.tag='lens';o.castShadow=false;});/* doc 27 #5 / Director r12: outer diameter -6.7%, rim 25% thinner; the opening stays the same size */
   const l=v3EyeOnHead(-1,FP),r=v3EyeOnHead(1,FP);mesh(new T.BoxGeometry(Math.abs(r.x-l.x)-lr*1.9,.01,.01),gm,head,0,l.y+lh*.25,Math.max(l.z,r.z)+.03).castShadow=false;}
  return FP;}
 const V3SKIN51={kai:0xf9743b,mia:0xff743e,tama:0x7f3719,ray:0xff8a53,dazza:0xee6c3b};/* Director doc 51 step-2 bases (poster-measured warmth + saturation) */
function s3BuildV3(L0){const L=Object.assign({},L0);{const S5=window.TOPS_SKIN51;if(S5&&L.base){const t=typeof S5==='object'?(S5[L.base]!=null?S5[L.base]:null):V3SKIN51[L.base];if(t!=null)L.skin=t;}}/* TOPS_SKIN51: 1 = doc 51 base colours, or {base:hex} for the solve; off by default */const P=V3P,mesh=v2mesh,ell=v2ell,cap=v2cap,pivot=v2pivot,tag=(o,t)=>{o.userData.tag=t;return o;};
  const fem=L.body==='female'||L.soft;if(fem&&L.lash==null)L.lash=true;const BK=V2BODY.standard;/* v3: Director's one sculpted body (the lab gates every base on it); the v2 build multipliers would widen the already-wide v3 torso */
  L._logo=Object.assign({u:.59,v:.80,px:35},window.TOPS_V3LOGO||{});/* doc 44 #3: up and out on the wearer's left chest, +17% (30 -> 35 px), clear of the r16 collar point; never under the throwing arm (checked through the throw); v .82+ foreshortens on the chest ledge in the face cam *//* TOPS_V3LOGO {u,v,px,track}: test knob for the logo move (doc 44 #3) *//* the wider v3 chest carries the mark nearer the middle, clear of the sleeve */const shirtM=v2M(0xffffff,'shirt');shirtM.map=v2ShirtTex(L);const skin=v2M(L.skin,'skin'),hairM=v2M(L.hairC||0x222222,'hair'),pantM=v2M(0x101012,'pants'),shoeM=v2M(0x0c0c0e,'shoe');v3Warm(skin);const trim2=v2M(L._stripe,'trim'),shirtPlain=v2M(v2Tops(L.shirt==null?0x141416:L.shirt),'shirt');
  const root=new T.Group();const hips=pivot(root,0,P.leg.hipY,0);const CH=.3;const chest=pivot(hips,0,CH,0);const t=P.torso;
  const tor=tag(mesh(v3TorsoGeo(BK,-CH),shirtM,chest),'shirt');
  /* collar and placket as the shipped poster shirt, sized to the v3 neck (ChatGPT round 8: the collar read a little big) */
  const cy=t.y1-P.leg.hipY-CH-.025;{/* v3: the visible neck shows the collar from above, so its leaf turns down steeply (no flat red disc under the chin) *//* the stand hugs the neck (r ~.1, the neck is .08) and the leaf turns down to the shoulders, absolute metres [radius, y] */if(window.TOPS_COLLAR16===0){const cr=new T.LatheGeometry([[.16,-.04],[.15,0],[.118,.032],[.1,.056],[.103,.072],[.122,.06],[.138,.034],[.145,.018]].map(([r,y])=>new T.Vector2(r,y)),Math.round(28*S3_SEGF));cr.scale(1,1,.87);const trimD=trim2.clone();trimD.side=T.DoubleSide;tag(mesh(cr,trimD,chest,0,cy,.01),'collar');
   const C=V2SHIRT.collar,[fw,fl,fr]=C.flap;[-1,1].forEach(s=>{const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(fw,0);sh.quadraticCurveTo(fw*.95,-fl*.55,fr,-fl);sh.quadraticCurveTo(fr*.2,-fl*.98,0,-fl*.8);sh.lineTo(0,0);
    const g=new T.ExtrudeGeometry(sh,{depth:.01,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:2,curveSegments:5});if(s<0)g.scale(-1,1,1);g.scale(.9,.9,1);g.computeVertexNormals();
    const o=mesh(g,trim2,chest,s*C.gap,cy+.015,t.rz*.8*BK[1]);o.rotation.set(C.tilt,s*C.turn,s*C.splay);tag(o,'fold');});
   }
   else{/* r16 collar (Director doc 45, vinyl3.js build): a short black stand (open band, 3.6 cm) with red piping on its top edge, and two black
      polo points with red piping laid ON the real chest surface (a 1 cm height map, raycast once against this torso, blurred twice, monotone up
      the ledge; layers offset along the surface normal). TOPS_COLLAR16=0 = the old red collar; TOPS_PIPING, TOPS_COLLAR_P, TOPS_COLLAR_C tune it */
    const sg=n=>Math.max(8,Math.round(n*S3_SEGF));const colM=v2M(window.TOPS_COLLAR_C||0xc8202a,'trim')/* doc 49 + ChatGPT: the poster's RED stand and points (TOPS_COLLAR_C=0x0e0e10 for the black r16 option) */,PP=window.TOPS_PIPING!=null?window.TOPS_PIPING:0.0045,CP=window.TOPS_COLLAR_P||{};
    const SH=CP.h||0.036,SY0=cy+(CP.sy!=null?CP.sy:0.02),SR=[CP.rx||0.152,CP.rz||0.128];
    const stG=new T.CylinderGeometry(1.0,1.06,SH,sg(48),1,true);stG.scale(SR[0],1,SR[1]);const colD=colM.clone();colD.side=T.DoubleSide;tag(mesh(stG,colD,chest,0,SY0,0),'collar');
    const lip=new T.TorusGeometry(1,0.006/SR[0],6,sg(64));lip.rotateX(Math.PI/2);lip.scale(SR[0]+0.002,SR[0]+0.002,SR[1]+0.002);tag(mesh(lip,colM,chest,0,SY0+SH/2,0),'collar');
    if(CP.standPipe!==0){const pip=new T.TorusGeometry(1,PP/SR[0]*0.9,6,sg(64));pip.rotateX(Math.PI/2);pip.scale(SR[0]+0.006,SR[0]+0.006,SR[1]+0.006);tag(mesh(pip,trim2,chest,0,SY0+SH/2+0.002,0),'collar');}
    const FPo=CP.f||[[0.012,0.02],[0.118,0.026],[0.05,-0.08]];
    const outline=sx=>{const Q=FPo.map(p=>[p[0]*sx,p[1]]),n=Q.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],r_=0.18,sh=new T.Shape();const s0=m(Q[n-1],Q[0]);sh.moveTo(s0[0],s0[1]);
     for(let i=0;i<n;i++){const pm=m(Q[(i+n-1)%n],Q[i]),q=m(Q[i],Q[(i+1)%n]);sh.lineTo(Q[i][0]+(pm[0]-Q[i][0])*r_,Q[i][1]+(pm[1]-Q[i][1])*r_);sh.quadraticCurveTo(Q[i][0],Q[i][1],Q[i][0]+(q[0]-Q[i][0])*r_,Q[i][1]+(q[1]-Q[i][1])*r_);if(i<n-1)sh.lineTo(q[0],q[1]);}return sh;};
    const SX=[-0.17,0.17],SY=[cy-0.14,cy+0.03],SD=0.01,nx=Math.round((SX[1]-SX[0])/SD)+1,ny=Math.round((SY[1]-SY[0])/SD)+1,HM=new Float32Array(nx*ny);
    {const rc=new T.Raycaster(),tm=new T.Mesh(tor.geometry,tor.material);tm.updateMatrixWorld(true);const o_=new T.Vector3(),d_=new T.Vector3(0,0,-1);
     for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){o_.set(SX[0]+i*SD,SY[0]+j*SD,1);rc.set(o_,d_);const h_=rc.intersectObject(tm,false)[0];
      const ok_=h_&&h_.point.z>0.1&&(h_.face.normal.z>0.15||h_.face.normal.y>0.5)&&(j===0||h_.point.z<=HM[(j-1)*nx+i]+0.002);HM[j*nx+i]=ok_?h_.point.z:(j>0?HM[(j-1)*nx+i]:0.2);}}
    for(let pass=0;pass<2;pass++){const H2=HM.slice();for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let t_=0,w_=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const jj=j+dj,ii=i+di;if(jj<0||jj>=ny||ii<0||ii>=nx)continue;const ww=(di||dj)?0.5:1;t_+=H2[jj*nx+ii]*ww;w_+=ww;}HM[j*nx+i]=t_/w_;}}
    const surf=(x,y)=>{const fx=Math.max(0,Math.min(nx-1.001,(x-SX[0])/SD)),fy=Math.max(0,Math.min(ny-1.001,(y-SY[0])/SD)),i=Math.floor(fx),j=Math.floor(fy),a=fx-i,b=fy-j;
     return (HM[j*nx+i]*(1-a)+HM[j*nx+i+1]*a)*(1-b)+(HM[(j+1)*nx+i]*(1-a)+HM[(j+1)*nx+i+1]*a)*b;};
    const tilt=CP.tilt!=null?CP.tilt:0.93,FY=cy-(CP.y!=null?CP.y:-0.004),LIFT=CP.lift!=null?CP.lift:0.003,cT=Math.cos(tilt);
    const put=(x,yl,k)=>{const y=FY+yl*cT,z0=surf(x,y),hx=(surf(x+0.004,y)-surf(x-0.004,y))/0.008,hy=(surf(x,y+0.004)-surf(x,y-0.004))/0.008,nl=Math.hypot(hx,hy,1);return [x-hx/nl*k,y-hy/nl*k,z0+k/nl,-hx/nl,-hy/nl,1/nl];};
    const FD=0.004;
    [-1,1].forEach(s=>{const sh=outline(s);const g=new T.ExtrudeGeometry(sh,{depth:FD,bevelEnabled:true,bevelThickness:0.0015,bevelSize:0.0015,bevelSegments:2,curveSegments:6});const A=g.attributes.position,N0=g.attributes.normal.array.slice(),SN=[];
     for(let i=0;i<A.count;i++){const q=put(A.getX(i),A.getY(i),LIFT+A.getZ(i));A.setXYZ(i,q[0],q[1],q[2]);SN.push(q[3],q[4],q[5]);}
     g.computeVertexNormals();{const Nn=g.attributes.normal;for(let i=0;i<Nn.count;i++){const nz=N0[i*3+2];if(Math.abs(nz)>0.9){const sg_=nz>0?1:-1;Nn.setXYZ(i,SN[i*3]*sg_,SN[i*3+1]*sg_,SN[i*3+2]*sg_);}}}
     tag(mesh(g,colM,chest,0,0,0),'fold');
     const op=sh.getSpacedPoints(48).slice(0,-1).map(p=>{const q=put(p.x,p.y,LIFT+FD*0.5);return new T.Vector3(q[0],q[1],q[2]);});
     tag(mesh(new T.TubeGeometry(new T.CatmullRomCurve3(op,true),sg(96),PP*0.5+0.0015,6,true),trim2,chest,0,0,0),'pipe');});}
   const pl=mesh(new T.BoxGeometry(.05,.1,.01),shirtPlain,chest,0,cy-.075,t.rz*.93*BK[1]);pl.rotation.x=-.3;tag(pl,'placket');}
  const neck=pivot(chest,0,t.y1-P.leg.hipY-CH,0);mesh(cap(0.078,0.084,0.09),skin,neck,0,0.07,0.01);
  const head=pivot(neck,0,P.head.c[1]-t.y1,P.head.c[2]);const FP=v3Head(head,L,skin,hairM);
  const arm=s=>{const sh=pivot(chest,s*(P.shoulder.x*BK[0]+BK[2]),P.shoulder.y-P.leg.hipY-CH,0);
   /* the v3 sleeve: a tapered tube buried in the sloped shoulder, the fitted red cuff on its end (one group, so they move together) */
   const sg=new T.Group();sg.position.set(s*.012,-.005,0);sg.rotation.z=s*.12;sh.add(sg);tag(mesh(cap(0.112,0.104,0.15),shirtPlain,sg),'sleeve');/* the root sits lower than vinyl3's (+.03): the game's clips raise the arm beside the low v3 head and the buried top swung into the jaw */
   const CF=V2SHIRT.cuff,cr0=.108,cr1=.103,cuff=new T.LatheGeometry([new T.Vector2(cr0-.006,CF.h/2),new T.Vector2(cr0,CF.h/2-.004),new T.Vector2((cr0+cr1)/2+.002,0),new T.Vector2(cr1,-CF.h/2+.004),new T.Vector2(cr1-.006,-CF.h/2)],Math.round(16*S3_SEGF));tag(mesh(cuff,trim2,sg,0,-.128,0),'cuff');
   tag(mesh(cap(P.arm.r0,P.arm.r1,P.arm.upper),skin,sh,0,-0.07,0),'upperarm');const el=pivot(sh,0,-P.arm.upper-0.04,0);mesh(cap(P.arm.r1*0.98,P.arm.r2,P.arm.fore),skin,el,0,0,0);
   const wr=pivot(el,0,-P.arm.fore-0.01,0);const k=(fem?.9:1)*1.2;/* v3 hands ~20% bigger (vinyl3 palm 2.05x); the fingers scale with rig.handK */mesh(ell(.088*k,.078*k,.06*k,14,10),skin,wr,0,-.06*k,.008);
   if(L.band&&s<0){const b=new T.TorusGeometry(.078,.024,8,20);b.rotateX(Math.PI/2);mesh(b,v2M(L.shirt==null?0xd81e2a:L.shirt,'trim'),el,0,-P.arm.fore+.01,0);}
   wr.traverse(o=>{if(o.isMesh)o.castShadow=false;});return {sh,el,wr};};
  const aL=arm(-1),aR=arm(1);
  const leg=s=>{const th=pivot(hips,s*P.leg.hipX*BK[0],0,0);tag(mesh(cap(P.leg.r,P.leg.r*.97,P.leg.len*.6+.05),pantM,th,0,-.1,0),'pants');const kn=pivot(th,0,-P.leg.len*.5,0);mesh(cap(P.leg.rs,P.leg.rs*.94,P.leg.len*.58),pantM,kn,0,.02,0);
   const an=pivot(kn,0,-P.leg.len*.5,0);const S=P.shoe;const g=new T.SphereGeometry(1,Math.round(24*S3_SEGF),Math.round(14*S3_SEGF),0,Math.PI*2,0,Math.PI*.62);{const p=g.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i);p.setX(i,p.getX(i)*(1+0.18*v3smf(-0.3,0.6,z)));}}g.computeVertexNormals();g.scale(S.w/2,S.h,S.len/2);mesh(g,shoeM,an,0,-S.h+.045,S.toe);
   const sole=new T.CylinderGeometry(1,1,.045,Math.round(24*S3_SEGF));{const p=sole.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i);p.setX(i,p.getX(i)*(1+0.18*v3smf(-0.3,0.6,z)));}}sole.computeVertexNormals();sole.scale(S.w/2*1.04,1,S.len/2*1.04);mesh(sole,v2M(0x3a3634,'dark'),an,0,-S.h+.03,S.toe);return {th,kn,an};};
  const lL=leg(-1),lR=leg(1);tag(mesh(ell(.22*BK[0],.1,.16*BK[1]),pantM,hips,0,-.01,0),'pants');
  return {root,hips,spine:null,chest,neck,head,lL,lR,aL,aR,S:{},SKIN:[tor],skinY:[-.05,-.25,-.18],thighs:[lL,lR].map(l=>[l.th,P.leg.r*1.02,P.leg.len*.5]),v2:true,v3:true,P,torsoR:v3TorsoR,headM:1.08,skullF:v3SkullF(FP),armM:1.25,handK:1.2,skinM:skin,fem};}
 window.TOPS_V3={P:V3P,want:v3Want,bases:V3BASES};
 function v2Head(head,L,skin,hairM){const R=V2P.head.r,mesh=v2mesh,ell=v2ell;mesh(ell(R[0],R[1],R[2],Math.round(32*S3_SEGF),Math.round(22*S3_SEGF)),skin,head).userData.tag='skull';
  const F=V2P.face;const fg=new T.SphereGeometry(1,Math.round(28*S3_SEGF),Math.round(18*S3_SEGF),Math.PI/2-F.phi[1]/2,F.phi[1],F.theta[0],F.theta[1]);fg.scale(R[0]*1.008,R[1]*1.008,R[2]*1.008);
  const [fen,fek]=v2EnvFor('face'),G=V2EYEGLOSS,fo={map:v2FaceTex(L),transparent:true,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,envMap:fen,envMapIntensity:fek,roughness:G.face,roughnessMap:v2EyeMask('rough')};
  const fm=S3G==='full'?new T.MeshPhysicalMaterial(Object.assign(fo,{clearcoat:G.cc,clearcoatMap:v2EyeMask('cc'),clearcoatRoughness:G.ccR})):new T.MeshStandardMaterial(fo);fm.userData.s3v=true;fm.userData.v2part='face';const fc=mesh(fg,fm,head);fc.renderOrder=2;fc.castShadow=false;fc.userData.tag='face';
  mesh(ell(.048*(L.nose||1),.04,.04,14,10),skin,head,0,-R[1]*.36,R[2]*.93);
  [-1,1].forEach(s=>{const e=mesh(ell(.045,.07,.04,12,9),skin,head,s*R[0]*.98,-.02,-.01);e.rotation.y=s*.3;if(L.earring)mesh(new T.TorusGeometry(.032,.008,6,16),v2M(L.earring,'trim'),head,s*R[0],-.11,0).rotation.y=Math.PI/2;});
  const hs=L.hair,bc=L.beardC||L.hairC||0x3a2010;
  if(L.face==='full'||L.face==='stubble'||L.face==='goatee'||L.face==='walrus')v2Beard(head,L.face,L.face==='stubble'?new T.Color(L.skin).lerp(new T.Color(bc),.45).getHex():bc);
  v2Hair(head,L,hairM);
  if(L.glasses){/* Vinyl v2.2 (Director, Q&D: the old frames sat 71 mm above the eyes): each lens is centred on its painted eye, from the decal's own
     constants (V2EYE + the face shell's angles), sized from the eye, the bridge just above the eye line; no temple arms (from the front they read as stubs) */
   const gm=v2M(0x111111,'shoe'),F=V2P.face;const lr=V2EYE.rx/1024*F.phi[1]*R[0]*1.35,lh=V2EYE.ry/640*F.theta[1]*R[1]*1.12;
   [-1,1].forEach(s=>{const e=v2EyeOnHead(s);const n=new T.Vector3(e.x/R[0]/R[0],e.y/R[1]/R[1],e.z/R[2]/R[2]).normalize();const o=mesh(new T.TorusGeometry(1,.16,8,24),gm,head,e.x+n.x*.022,e.y+n.y*.022,e.z+n.z*.022);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);o.scale.set(lr,lh,lr*.9);o.userData.tag='lens';o.castShadow=false;});
   const l=v2EyeOnHead(-1),r=v2EyeOnHead(1);mesh(new T.BoxGeometry(Math.abs(r.x-l.x)-lr*1.9,.013,.013),gm,head,0,l.y+lh*.25,R[2]*1.03).castShadow=false;}}
 /* eye centres on the face decal (sheet px from the centre at 1024 wide, fraction down): v2FaceTex draws them here and glasses sit on them */
 const V2EYE={dx:175,v:.43,rx:74,ry:92};
 function v2EyeOnHead(s){const R=V2P.head.r,F=V2P.face;const ph=Math.PI/2+s*V2EYE.dx/1024*F.phi[1],th=F.theta[0]+V2EYE.v*F.theta[1];return new T.Vector3(-Math.cos(ph)*Math.sin(th)*R[0],Math.cos(th)*R[1],Math.sin(ph)*Math.sin(th)*R[2]);}
 window.TOPS_V2EYE=s=>v2EyeOnHead(s);
 function v2Blobs(par,mat,list){list.forEach(b=>{const o=v2mesh(v2ell(b[3],b[4]||b[3],b[5]||b[3],16,12),mat,par,b[0],b[1],b[2]);if(b[6])o.rotation.set(b[6][0],b[6][1],b[6][2]);});}
 /* ENG hair kit (Overseer 20:20: "Director's hair2x.js per style as data entries"). Director's v2.6-2.8 hair method, the primitive library
    from claude/director/vinyl2/hair28.js, in head space (skull centre 0, radii V2P.head.r, the face toward +z, theta from the crown, phi 0 at
    the front): cap (fitted scalp to a hairline), loft (swept volume over the head), ribbon (free tapered tube), coil (bun), cluster (curl
    clump), band (side/back shell), merged into ONE mesh and painted shadow/base/highlight by height and facing (vertex colours), ONE
    material from the one material system (V2MAT.hair inside its ranges). A style is an entry in V2HAIRS: (h, L, K) => K.done(parts, cols,
    paintOpts, [rough, clearcoat]) with K the library; porting one of Director's styles is a paste: his H28.<style>(h,L){...} body with
    the primitives taken from K. Live behind ?v2hair=1 (sticky in localStorage tops_v2hair) until Hayden turns it on; a style without an
    entry keeps today's build. */
 const V2HK=(()=>{let K=null;const make=()=>{const R=V2P.head.r,RA=(R[0]+R[1]+R[2])/3;
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
  const lin=h=>window.GFX_LIN?new T.Color(h):new T.Color(h).convertSRGBToLinear();/* the game's colours are already linear (GFX_LIN) */const st={seed:7};const rnd=()=>{st.seed=(st.seed*16807)%2147483647;return st.seed/2147483647;};
  const dir=(th,ph)=>new T.Vector3(Math.sin(th)*Math.sin(ph),Math.cos(th),Math.sin(th)*Math.cos(ph));const nrm=(th,ph)=>{const d=dir(th,ph);return new T.Vector3(d.x/R[0],d.y/R[1],d.z/R[2]).normalize();};
  const S=(th,ph,k)=>{const d=dir(th,ph);return new T.Vector3(d.x*R[0],d.y*R[1],d.z*R[2]).addScaledVector(nrm(th,ph),k||0);};
  const above=p=>(Math.sqrt((p.x/R[0])**2+(p.y/R[1])**2+(p.z/R[2])**2)-1)*RA;
  function HL(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]);const n=pts.length;return ph=>{ph=wrap(ph);let i=n-1;for(let k=0;k<n;k++)if(pts[k][0]<=ph)i=k;const a=pts[i],b=pts[(i+1)%n];let span=b[0]-a[0];if(span<=0)span+=2*Math.PI;let d=ph-a[0];if(d<0)d+=2*Math.PI;const s=d/span;return a[1]+(b[1]-a[1])*(.5-.5*Math.cos(Math.PI*s));};}
  const sideHL=(s,burn,ab,behind)=>[[s*1.18,1.22],[s*1.28,burn],[s*1.36,burn-.03],[s*1.44,ab],[s*1.6,ab-.04],[s*1.78,ab+.04],[s*1.98,behind]];
  const G=(pos,idx)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);return g;};
  function cap(hl,k,U,Vn){U=U||40;Vn=Vn||8;const pos=[],idx=[];const put=(th,ph,t)=>{const rim=t<.85?1:Math.sqrt(Math.max(0,1-((t-.85)/.15)**2));const p=S(th,ph,t>=.999?-.004:k*rim);pos.push(p.x,p.y,p.z);};
   put(0,0,0);for(let j=1;j<=Vn;j++){const t=1-Math.pow(1-j/Vn,1.5);for(let i=0;i<U;i++){const ph=-Math.PI+i/U*2*Math.PI;put(t*hl(ph),ph,t);}}
   for(let i=0;i<U;i++)idx.push(0,1+i,1+(i+1)%U);for(let j=0;j<Vn-1;j++)for(let i=0;i<U;i++){const a=1+j*U+i,b=1+j*U+(i+1)%U,c=a+U,d=b+U;idx.push(a,c,b,b,c,d);}const g=G(pos,idx);g.computeVertexNormals();return g;}
  function sweep(curve,w,h,N,Sg,up,twist){const pos=[],idx=[];Sg=Sg||10;
   for(let i=0;i<=N;i++){const u=i/N,p=curve.getPoint(u),tg=curve.getTangent(u);const o=up(u,p).clone();o.addScaledVector(tg,-o.dot(tg)).normalize();
    let sd=new T.Vector3().crossVectors(tg,o).normalize();if(twist){const a=twist(u);const o2=o.clone().multiplyScalar(Math.cos(a)).addScaledVector(sd,Math.sin(a));sd=new T.Vector3().crossVectors(tg,o2).normalize();o.copy(o2);}
    const tip=Math.sqrt(Math.max(.02,1-Math.pow(Math.max(0,(u-.84)/.16),2)))*Math.sqrt(Math.max(.02,1-Math.pow(Math.max(0,(.1-u)/.1),2)));const ww=w(u)*tip,hh=h(u)*tip;
    for(let j=0;j<Sg;j++){const a=j/Sg*2*Math.PI;const ca=Math.cos(a),sa=Math.sin(a);const q=p.clone().addScaledVector(sd,ca*ww).addScaledVector(o,sa*hh*(sa>0?1:.7));pos.push(q.x,q.y,q.z);}}
   for(let i=0;i<N;i++)for(let j=0;j<Sg;j++){const a=i*Sg+j,b=i*Sg+(j+1)%Sg,c=a+Sg,d=b+Sg;idx.push(a,c,b,b,c,d);}
   for(const [i,rev] of [[0,1],[N,0]]){const c=pos.length/3;const p=curve.getPoint(i/N);pos.push(p.x,p.y,p.z);for(let j=0;j<Sg;j++){const a=i*Sg+j,b=i*Sg+(j+1)%Sg;rev?idx.push(c,a,b):idx.push(c,b,a);}}
   const g=G(pos,idx);g.computeVertexNormals();return g;}
  const outUp=(u,p)=>p.clone().normalize();
  function loft(cp,w,h,N,Sg){const pts=cp.map((c,i)=>S(c[0],c[1],i===0?Math.min(c[2],-.008):c[2]));return sweep(new T.CatmullRomCurve3(pts,false,'centripetal'),w,h,N||16,Sg||10,outUp);}
  function ribbon(pts,w,h,N,Sg,up,twist){return sweep(new T.CatmullRomCurve3(pts,false,'centripetal'),w,h,N||18,Sg||8,up||outUp,twist);}
  function cluster(th,ph,size,ht,lobes,seg){const parts=[];const n=nrm(th,ph);const base=S(th,ph,.012);const t1=new T.Vector3().crossVectors(n,new T.Vector3(0,1,.001)).normalize(),t2=new T.Vector3().crossVectors(n,t1).normalize();
   const L=lobes||(rnd()<.6?2:3);
   for(let l=0;l<L;l++){const g=new T.SphereGeometry(1,seg?seg[0]:9,seg?seg[1]:3,0,2*Math.PI,0,Math.PI*.6);const a=rnd()*6.28,off=l===0?0:size*(.22+.12*rnd());
    const s=size*(l===0?.5:.36+.08*rnd()),hh=ht*(l===0?1:.75+.2*rnd());const c=base.clone().addScaledVector(t1,Math.cos(a)*off).addScaledVector(t2,Math.sin(a)*off);
    const p=g.attributes.position;const nm=[];const ph0=rnd()*6;const sy=(hh*1.3+.016)/1.31;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const az=Math.atan2(x,z);const lump=1+.07*Math.cos(3*az+ph0);
     const N=new T.Vector3().addScaledVector(t1,x/(s*lump)).addScaledVector(t2,-z/(s*.85*lump)).addScaledVector(n,y/sy).normalize();nm.push(N.x,N.y,N.z);
     const q=c.clone().addScaledVector(t1,x*s*lump).addScaledVector(t2,-z*s*.85*lump).addScaledVector(n,-.016+(y+.31)/1.31*(hh*1.3+.016));p.setXYZ(i,q.x,q.y,q.z);}
    g.setAttribute('normal',new T.Float32BufferAttribute(nm,3));g.deleteAttribute('uv');parts.push(g);}
   return parts;}
  function coil(c,axis,r0,turns,tube,N){const ax=axis.clone().normalize();const t1=new T.Vector3().crossVectors(ax,new T.Vector3(1,0,.001)).normalize(),t2=new T.Vector3().crossVectors(ax,t1);
   const pts=[];for(let i=0;i<=N;i++){const u=i/N,a=u*turns*2*Math.PI,r=r0*(1-.55*u),hgt=r0*.55*Math.sin(u*Math.PI*.9);pts.push(c.clone().addScaledVector(t1,Math.cos(a)*r).addScaledVector(t2,Math.sin(a)*r).addScaledVector(ax,hgt));}
   return sweep(new T.CatmullRomCurve3(pts),u=>tube*(1-.45*u)*sm(0,.08,u+.02),u=>tube*.85*(1-.45*u),N*2,10,(u,p)=>p.clone().sub(c).addScaledVector(ax,.3).normalize());}
  function band(top,bot,k,on,U,Vn){U=U||40;Vn=Vn||6;const pos=[],idx=[];const ph0=on[0],ph1=on[1];
   for(let j=0;j<=Vn;j++){const t=j/Vn;const r=Math.sin(Math.PI*t);for(let i=0;i<=U;i++){const ph=ph0+(ph1-ph0)*i/U;const e=Math.sin(Math.PI*i/U);const th=top(ph)+(bot(ph)-top(ph))*t;
    const p=S(th,ph,(t<.001||t>.999||i===0||i===U)?-.004:k*Math.sqrt(r)*Math.sqrt(Math.min(1,e*3)));pos.push(p.x,p.y,p.z);}}
   for(let j=0;j<Vn;j++)for(let i=0;i<U;i++){const a=j*(U+1)+i,b=a+1,c=a+U+1,d=c+1;idx.push(a,c,b,b,c,d);}const g=G(pos,idx);g.computeVertexNormals();return g;}
  function merge(gs){let nv=0;gs.forEach(g=>{if(!g.index){const n=g.attributes.position.count;const ix=[];for(let i=0;i<n;i++)ix.push(i);g.setIndex(ix);}nv+=g.attributes.position.count;});
   gs.forEach(g=>{if(!g.attributes.normal)g.computeVertexNormals();});const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),ix=[];let o=0;
   gs.forEach(g=>{pos.set(g.attributes.position.array.slice(0,g.attributes.position.count*3),o*3);nor.set(g.attributes.normal.array.slice(0,g.attributes.position.count*3),o*3);const I=g.index.array;for(let i=0;i<I.length;i++)ix.push(I[i]+o);o+=g.attributes.position.count;g.dispose();});
   const M=new T.BufferGeometry();M.setAttribute('position',new T.BufferAttribute(pos,3));M.setAttribute('normal',new T.BufferAttribute(nor,3));M.setIndex(ix);return M;}
  function paint(g,cols,o){o=o||{};const cB=lin(cols.base),cS=lin(cols.shadow),cH=lin(cols.hi),C=new T.Color();const P=g.attributes.position,Nn=g.attributes.normal,col=[];const p=new T.Vector3(),n=new T.Vector3();const top=o.top||.08;
   for(let i=0;i<P.count;i++){p.fromBufferAttribute(P,i);n.fromBufferAttribute(Nn,i);const h=above(p);const out=p.clone().normalize();const face=n.dot(out);
    let a=.35+.65*sm(-.004,top*.55,h);a*=.55+.45*sm(-.4,.6,face);if(o.extra)a*=o.extra(p,n,h);let hi=sm(.45,.95,h/top)*sm(.3,.9,n.y*.75+n.z*.35+.15)*(o.hiAmt!=null?o.hiAmt:.7);
    C.copy(cS).lerp(cB,Math.min(1,a));C.lerp(cH,hi);col.push(C.r,C.g,C.b);}
   g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;}
  function colsFrom(hex){const b=new T.Color(hex);const sh=b.clone().multiplyScalar(.52);const hi=b.clone().lerp(new T.Color(0xffffff),.32);return {base:b.getHex(),shadow:sh.getHex(),hi:hi.getHex()};}
  /* one material: the hair part of the material system, white x vertex colours; roughness / clearcoat kept inside the hair ranges */
  function mat(rough,cc,g20){const m=v2M(0xffffff,'hair');m.vertexColors=true;m.roughness=Math.max(g20?.28:.4,Math.min(.6,rough));if('clearcoat' in m)m.clearcoat=Math.max(.02,Math.min(g20?.3:.15,cc));/* g20: r20 glossy hair (v3) */m.needsUpdate=true;return m;}
  function add(g,m,par){const o=new T.Mesh(g,m||mat(.5,.08));o.castShadow=o.receiveShadow=true;o.userData.hair=true;o.userData.tag='hair';par.add(o);return o;}
  return {R,RA,sm,wrap,lin,st,rnd,seed:v=>{st.seed=v;},dir,nrm,S,above,HL,sideHL,cap,sweep,loft,ribbon,cluster,coil,band,merge,paint,colsFrom,mat,add,
   W:(a,b,c)=>u=>a*(1-u)*(1-u)+2*b*u*(1-u)+c*u*u,
   done:(h,parts,cols,po,mr)=>add(paint(merge(parts),cols,po),mat(mr?mr[0]:.45,mr?mr[1]:.12,mr&&mr[2]),h)};};
  return ()=>K||(K=make());})();
 /* the styles (hair28 v2.8, ChatGPT 13d: Kai 7.8, Tama 8.6 passed). Keys are the game's style names (horseshoe -> swept, ponytail -> bun are
    mapped before lookup); 'under' is the hair below Dazza's cap */
 /* hair r9 lock builds (Director, claude/director/24-vinyl3-port-notes.md + vinyl2/hair28.js H28.envR / envS / groove / quiffL): ONE
    continuous sculpted shell whose radius is the smooth union of the approved block-out masses minus a valley between lock flow lines; the
    lock colour is baked per texel (512x256) once per build. Ported as data + the same maths; the field is allocation-free (it runs for
    every texel), and the baked colours are mixed in sRGB as the lab does, then written to an sRGB canvas (GFX_LIN-aware). */
 /* hair28 r15: the throwing dart's path past Mia's right side (the game's throw exported in head space by Director, 20 Nov): |x| limit by z, minus a
   margin; only her throwing side (x<0), y -0.24..+0.10 with soft edges. Hair beyond the limit is pulled in radially (smooth min, no wall).
   If the throw animation changes this table needs a re-export (Director's claude/director/clearance/mia-dart-export.js). */
/* r15b: the corridor's real vertical span at each depth z (Director's k .01 export): [z, yLow, yHigh], head space */
/* r15c (doc 43): keep-out fitted to every place the dart is posed (match, portrait, opponent, test rig, creator preview, hero; Engine's k .01
   s3-dart-hair samples, 3 mm cloud). Grid over head-space (y,z) at 1 cm: the |x| the hair may reach, i.e. dart |x| minus a 20 mm sphere, Lipschitz-smoothed
   (slope 0.8) so the dip has no walls. Two base-36 chars per cell in mm, '..' = no limit. Re-export with Director's clearance/mia-dart-cloud.js + mkgrid.py
   whenever the throw, the idle clip or any dart place changes; tests/s3-dart-hair.js is the guard */
const V2MIAGRID={"y0":-0.36,"z0":-0.24,"d":0.01,"nz":77,"rows":["........................................................................................847x7r7m7i7f7d7c7c7c7e7g7j7f7c7874716z6x6w6v6w6w6t6r6r6r6r6r6t6w6z","..................bubpbkbgbdbbbababbbdbgbkbobu........................................827w7r7l7g7b787575747576797673706y6w6t6r6p6o6n6o6p6m6k6j6j6j6j6m6p6s","..............bybpbjbebab7b5b3b2b2b2b3b5b8bcbhbmbs..................................8c7w7o7i7b75706w6t6r6r6r6t6w6y6w6t6r6p6m6i6e6b68666666686b6b6b6c6e6h6m","............bhb3axatapamajahagahajamaqavb0b6bbbgbmc5................................867h79746z6v6s6p6m6j6j6j6m6o6r6o6m6j6g6c686563615y5x5x5x5z616364676b6g","..........c0b6awaqamaiaeaca9a8a9acafajanasaxb5babgbq................................7u7c746y6s6o6k6i6e6c6b6c6e6g6k6h6e6b6a65615y5v5t5r5p5p5p5s5u5v5v5v5v5x","..........brb1aqakafaba7a4a1a0a1a4a8acahamasayb5bbbkc0cp..........................8m7n776z6s6m6h6d6a6764636466696c696764625y5u5q5o5m5j5i5h5i5k5n5n5n5n5o5q","..........blawamafa9a4a09w9u9s9u9xa1a6abahamasb0b7bfbuc6ch........................8g7i726v6o6h6b6662605x5v5x5y6265625z5x5u5s5n5k5g5e5b5a595a5c5f5f5f5f5g5i","..........bhasaiaba49y9t9p9m9k9m9r9u9za6abahanavb4bbbpbzcach....................8v7y7d6y6r6k6d66605v5t5p5n5p5r5v5y5u5r5p5m5k5h5c5957545251535558575757585b","..........bdapaea7a09t9m9i9f9c9g9j9o9ua0a6acajaqb1b8bfbmc2cbcm..................8q7t796v6o6g69625v5o5l5j5f5h5k5o5s5n5m5j5j5h5c56524z4w4u4t4v4y504z4z4z5153","..........baanada59x9p9i9b97949a9d9j9o9va1a8afamawb3b9bdbjc3cecp..............95867o766t6l6e665y5s5l5d5b58595d5j5p5m5m5j5j5h5a524u4r4p4m4l4n4t4s4r4r4r4t4x","..........b8amaca49w9o9g98908y92999d9k9r9xa4abajasayb2b8bdbjbwc3ck..........988o817k746t6l6d655x5p5h5b5957595c5i5q5n5m5m5j5d57504s4p4o4m4j4j4l4k4j4j4j4l4t","..........b6amaca49w9o9g98908y8y929a9f9m9ta1a9ahanarawb1b6bbbhbsajada8a39z9l938g7w7h726t6l6d655x5p5h5b5a5a5c5h5n5r5p5n5l5e58524w4s4q4q4m4m4i4g4g4g4g4g4i4q","..........b5anada59x9p9i9b938z8y8z949c9k9sa0a6acagalaqavb0b5baaha9a49z9v9o9f8j8a7s7f726t6l6d655x5p5h5e5d5e5h5k5q5t5s5p5i5b544x4s4k4i4k4l4k4h4g4g4g4g4g4i4q","..........b6apaea7a09t9l9f9a939091949a9i9q9ua1a5aaafakapauazaq9y9s9n9j9g9d8t8e867p7d716t6l6d655x5p5j5h5h5i5n5r5v5w5v5n5f57504t4m4g4g4i4i4g4h4g4g4g4g4g4i4q","..........b6asaiaba39w9q9l9e9a9695969b9h9j9q9u9ya4a8aeaiaoat9z9n9i9d9996918n89827n7c726u6m6f67605t5n5m5n5p5t5y62615t5m5e564y4q4i4g4g4g4g4g4i4j4g4g4g4g4i4q","..........b8awalaea7a19w9q9l9h9e9b9a9a9f9g9j9n9t9xa2a7acaha79t9i9c97928z8u8i857y7m7c746w6o6g68605t5q5q5q5t5z6465605s5k5d554x4p4i4g4g4g4j4i4k4m4j4h4g4g4i4q","..........bcb1apajada7a19w9s9o9m9g9c9d9d9g9g9h9n9r9wa1a6a9a29p9d97918w8r8o8e827u7l7c746w6o6g68605v5t5t5w5z646a675z5r5j5b534v4o4i4g4i4h4l4n4s4p4n4l4i4i4l4t","..........bgb6auaoaiaca7a39z9v9r9o9h9e9d9d9d9d9g9l9q9v9za29x9k99928w8q8k8h8b7z7r7k7d756x6p6h69645z5y5z62676a6c675z5r5j5b534v4q4m4k4l4p4s4v4v4t4s4p4n4m4o4w","..........bkbdazauaoaiaeaaa6a29x9t9n9h9e9d9d9d9d9e9k9p9s9u9t9g968z8r8k8e89867x7p7h7a726v6n6g6a666565676a6d6h6h68605s5k5d564z4u4s4s4t4w4z53524z4x4u4s4r4t50","..........bpbib6azauapalahada8a49y9s9n9h9d9b9a9c9d9e9i9k9m9p9d938w8p8h8983807w7o7g78706s6k6f6d69686b6e6g6k6m6i6a625v5n5f59524z4x50515356585653504y4w4u4x54","..........bubnbhb6b1awasaoakafaaa49y9t9n9h9b9997989a9a9d9f9h9b918u8m8e87807s7o7n7g79716t6l6h6g6f6e6g6l6o6r6p6h69615t5l5f5a58565558595a5e5d5b59575451515358","..........c8bsbnbibab5b0avaqalafaaa49y9s9m9g999794929295979b9a918t8l8d857x7p7k7j7d766y6s6p6m6l6l6m6o6s6w6v6o6g68605s5l5i5f5f5e5d5f5h5i5k5h5f5c5a575553555d","............c5bvbqbibbb4axaqalahafaaa49y9r9k9e978z8w8x8x8z9395918u8m8e87807s7l7h79726x6t6s6q6r6t6u6w6y6y6r6m6e66625u5q5o5n5n5m5l5m5p5q5o5m5i5h5e5b5b5b5d5g","..............c4bobgb8b1atanafa9a8ada9a19t9l9d958x8v8r8q8t8v8x8x8u8m8f877z7r7j7e78736y6y6y6x6z717274736v6n6g6b66615y5w5u5v5v5u5t5u5x5w5t5q5n5l5j5h5j5j5l5n","..............cebnbfb7azarajaba5a4a6a9a29u9m9f98908v8q8p8n8n8p8p8p8m8e867y7q7i7d79777473757577797a726x6t6m6g6b6965656462636362616264615y5w5t5q5o5n5r5p5s5u","..............cdbobgb8b1atamaea6a4a4a4a39v9n9f98928u8p8m8j8j8j8j8h8k8e877z7t7o7g7d7d7b7b7d7d7f7c756z6u6s6o6k6h6g6d6d6c6a6b6b6a696a6764625z5w5v5u5v5v5t5x62","..............cdbqbibab3avaoaha9a5a4a4a19u9m9e968y8q8m8m8l8j8j8h8g8i8e8a847y7s7o7l7l7j7j7l7i7f7b75706y6v6t6r6p6n6l6l6k6i6j6j6i6h6e6b6865626363625y5x5v5z67","..............cdbsbkbdb5azaralaga9a6a4a19v9n9f98918t8n8m8m8n8m8l8i8j8h8d89837y7v7t7t7r7p7l7j7f7d7a757473716z6x6u6t6t6r6q6r6r6o6m6i6f6c6a6a6a6a67646261666b","..............cfbvbnbgb9b2awaralahaea7a59x9q9i9a948y8u8r8q8t8u8t8q8p8n8k8e89868281807y7t7q7n7k7k7h7d7c7a7976757271716z6y6x6u6r6o6m6k6i6h6i6h6e6b6766666b6h","..............chbzbrbkbdb7b2awaraoajafa7a09s9l9f9895928z8y9192908y8x8v8q8k8g8d8a898885817y7v7s7s7n7l7k7i7h7e7c7a79797774706y6v6s6r6r6q6o6m6k6g6d6c6b6c6i6m","..............ckc4bvbpbjbdb7b2azauapajaaa39x9p9j9b98979796989a979695918v8r8n8k8i8h8g8b888582807y7v7t7s7q7o7m7k7i7g7d7a78757271706z6z6u6r6p6o6m6j6j6j6k6o6t","..............cocac0bubpbjbdb9b5b0atamaea7a09t9m9j9g9b9e9e9g9h9f9e9c97928y8v8s8q8p8m8j8g8d8a88858281807x7v7t7p7m7i7g7e7c7978797774726z6w6t6t6u6r6r6r6s6u6z","..............cscmc5c0bubpbkbgbbb7awapaiaba49y9t9q9n9j9m9m9n9p9m9m9j9g9d999593908x8t8p8m8k8h8e8c8a8784817y7v7t7q7p7n7m7k7h7f7d79777473726y70716z6z6z707275","..............cycqckc5c0bvbrbmbibeb0atamafa9a4a09x9t9r9t9u9v9w9u9t9r9n9k9g9d9a9794908u8q8o8l8i8g8d8b88858481807y7v7s7r7o7m7i7g7c7c7a7a7976787977777778797c","..............d6cwcqclcac3bybtbpbmb5axaqakafaba8a4a19za1a2a3a5a3a19y9v9r9n9k9i9f9b95928y8w8s8p8m8k8i8e8c888784827y7u7t7q7o7n7m7k7k7i7i7g7e7g7g7f7f7f7g7h7j","................d3cwcrcmchccc6c2bxbbb2awaqamaiafaba8a7a8abadaaaaa7a4a2a09x9v9r9m9g9c989693908w8q8k8j8g8e8a88878582817y7x7u7u7u7s7s7q7q7n7m7n7o7n7n7n7o7p7r","....................d0cucpclcfc9c3bmb7b2axataqamaiagafagafafafacababa8a5a5a29x9s9n9j9g9d9a97928v8r8n8k8j8f8f8d8a8889868582828180807y7y7v7u7v7w7v7v7w7y7z83","........................d2cvckcec8c2bwbbb6b1axataqaoanalahagagagagadadaaa9a6a39y9t9q9n9l9i9d97928y8v8s8q8n8n8l8i8g8g8e8c8a8a89888786858382838586888b8e8i8n","............................cvcjcdc7c1bubobhbcb7b2ayawarajagagagaeadadaaaaa7a5a4a19x9v9s9o9i9d999592908x8v8v8s8q8o8n8m8k8i8i8h8g8f8e8c8a8a8a8c8f8i8m8r8w94","..............................ctciccc5bzbtbobibdb9b6b1auarajagagagaeadadabaaa9a8a6a3a29z9t9o9k9f9c99989493928z8x8w8v8u8r8q8q8p8o8n8m8m8n8o8p8s8v8z9499....","................................crchcac4bzbubobkbgbcb6b1avarajahagagagaeadaeacadadabaaa59z9v9q9m9k9h9f9c9b9997959493918z8y8y8x8w8x8z9194989c9i9n..........","..................................crcfcac5c0bvbrbnbhbcb6b1auaramalamalalajakakalalajagaba6a19x9u9r9p9m9k9j9h9e9c9c9b9997969697989a9d9h9m9r................","....................................cqcgcbc6c2bybsbnbhbcb6b1axauatauatatarasasatasaranahaca8a4a19z9w9t9r9r9o9m9k9k9k9l9m9n9r9v9za5ad......................","......................................cycnchc9c4bybtbnbhbcb8b4b2b1b2b1b0azb0b0b1b0azazaxauaoajafaca8a5a3a3a3a5a8acaham....................................","..........................................cqcfc9c4bybsbnbjbfbbbab9bab9b8b7b8b8b9b8b7b7b5b3b2b2b1b1b2b4b7bbbgbl............................................","............................................cocfcac4bybubqbmbjbibhbibhbgbfbgbgbhbgbfbfbdbbbabbbdbfbibmbrbx................................................","..............................................cocfcac5c1bxbtbrbqbpbqbpbnbnbnbobpbpbobobpbqbubyc2c8........................................................","................................................cqcicdc8c4c1bzbybxbybxbvbvbvbxbzc1c4c8cdci................................................................","..........................................................................................................................................................","..........................................................................................................................................................","..........................................................................................................................................................","..........................................................................................................................................................","..........................................................................................................................................................","..........................................................................................................................................................","..........................................................................................................................................................","..........................................................................................................................................................",".........................................................................................................................................................."]};let V2MIAGF=null;
function V2MIALIM(y,z){const G=V2MIAGRID;if(!V2MIAGF){const ny=G.rows.length;V2MIAGF=new Float32Array(ny*G.nz);for(let i=0;i<ny;i++)for(let j=0;j<G.nz;j++){const c=G.rows[i].substr(j*2,2);V2MIAGF[i*G.nz+j]=c==='..'?0.6:parseInt(c,36)/1000;}}
 const ny=G.rows.length,fy=(y-G.y0)/G.d,fz=(z-G.z0)/G.d;if(fy<0||fz<0||fy>ny-1||fz>G.nz-1)return 0.6;const i=Math.min(ny-2,Math.floor(fy)),j=Math.min(G.nz-2,Math.floor(fz)),a=fy-i,b=fz-j,F=V2MIAGF,n=G.nz;
 return (F[i*n+j]*(1-b)+F[i*n+j+1]*b)*(1-a)+(F[(i+1)*n+j]*(1-b)+F[(i+1)*n+j+1]*b)*a;}
function V2MIACLEAR(d,r,sk){if(d.x>=0)return r;const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};const SW=window.MIA_SWELL!=null?window.MIA_SWELL:0.1;
 const lim=V2MIALIM(d.y*r,d.z*r);if(lim>=0.55)return r;let rr=r;if(sk&&SW)rr=r+SW*sm(0.54,0.44,lim)*Math.max(0,r-sk);/* swell where the limit is loose: the side still frames the face */
 const ax=-d.x*rr;if(ax<=lim-0.02)return rr;const k=0.004,smn=-k*Math.log(Math.exp(-ax/k)+Math.exp(-lim/k));return rr*smn/ax;}
const V2BAKE=new Map();window.TOPS_V2BAKE=V2BAKE;
const V2HAIRHC={value:new T.Vector3(1,0.05,0.25)};window.TOPS_V2HAIRHC=V2HAIRHC;
const V3H20=()=>window.TOPS_V3FLAG===true&&window.HAIR20!==0;/* r20 hair read (doc 54), v3 only; HAIR20=0 = r19 hair */
const V2GROOVE=(()=>{
  const envR=(M,dx,dy,dz)=>{let best=0;for(const m of M){const q=m._q||(m._q=new T.Quaternion().setFromEuler(new T.Euler(m[6]||0,m[7]||0,m[8]||0)).invert());
    const o=m._o||(m._o=new T.Vector3(-m[0],-m[1],-m[2]).applyQuaternion(q));const v=_gv.set(dx,dy,dz).applyQuaternion(q);
    const ox=o.x/m[3],oy=o.y/m[4],oz=o.z/m[5],vx=v.x/m[3],vy=v.y/m[4],vz=v.z/m[5];const A=vx*vx+vy*vy+vz*vz,B=2*(ox*vx+oy*vy+oz*vz),C=ox*ox+oy*oy+oz*oz-1,D=B*B-4*A*C;if(D<0)continue;const t=(-B+Math.sqrt(D))/(2*A);if(t>best)best=t;}return best;};
  const _gv=new T.Vector3();
  const envS=(M,dx,dy,dz,k)=>{k=k||0.012;let mx=0;const ts=[];for(const m of M){const t=envR([m],dx,dy,dz);if(t>0){ts.push(t);if(t>mx)mx=t;}}if(!ts.length)return 0;let s=0;for(const t of ts)s+=Math.exp((t-mx)/k);return mx+k*Math.log(s)-k*0.55;};
  function groove(h,L,K,M,Ls,cols,hl,o){o=o||{};const sm=K.sm,dir=K.dir,val=o.valley||0.03,U=Math.round((o.U||76)*(o.dens||1)),Vn=Math.round((o.V||29)*(o.dens||1));/* dens: the game camera needs the valleys in the geometry, not smoothed away by a coarse grid (doc 25, clay capture) */
   /* fix 3 (hair28 r10/r11, Director 20 Nov): low-pass the side hairline (hlSmooth), columns packed toward the face (frontDense),
      a rounded front roll face (round), the shell tucked onto the real v3 skull, texture in (phi, theta) */
   if(hl&&o.hlSmooth){const h0=hl,w=o.hlSmooth;hl=ph=>{let t=0,n=0;for(let k=-3;k<=3;k++){const wt=1-Math.abs(k)/4;t+=h0(ph+k*w/3)*wt;n+=wt;}const k=sm(0.45,0.85,Math.abs(K.wrap(ph)));return h0(ph)*(1-k)+t/n*k;};}
   const FD=o.frontDense||0,PHU=u=>{const s=2*u-1;return Math.PI*(s-FD*Math.sin(Math.PI*s)/Math.PI);};
   const FPg=L._v3?v3FaceOf(L):null,_sd=new T.Vector3(),SKR=(th,ph)=>{const p0=K.S(th,ph,0).length();if(!FPg)return p0;const st=Math.sin(th);_sd.set(st*Math.sin(ph),Math.cos(th),st*Math.cos(ph));return Math.max(p0,v3HeadPoint(_sd,FPg.cheek,FPg).length());};
   let TMX=0;for(let i=0;i<=64;i++)TMX=Math.max(TMX,hl?hl(-Math.PI+2*Math.PI*i/64):1.6);TMX+=0.05;
   /* r13 envelope shaping: o.envMod(d) scales the hair's stand-off from the (ellipsoid) skull per direction: crest down, side waves out */
   const R0=V2P.head.r,ENV=d=>{const e=envS(M,d.x,d.y,d.z);if(!o.envMod)return e;const s0=Math.hypot(d.x*R0[0],d.y*R0[1],d.z*R0[2]);return s0+(e-s0)*o.envMod(d);};
   /* each lock: its flow line as 29 unit vectors, flattened to numbers */
   const LK=Ls.map(lk=>{const n=28,P=[];if(lk.v){const cv=new T.CatmullRomCurve3(lk.v.map(q=>new T.Vector3(q[0],q[1],q[2]).normalize()),!!lk.closed,'centripetal');for(let i=0;i<=n;i++)P.push(cv.getPoint(i/n).normalize());}
    else{const cv=new T.CatmullRomCurve3(lk.p.map(q=>new T.Vector3(q[0],q[1],0)),false,'centripetal');for(let i=0;i<=n;i++){const q=cv.getPoint(i/n);P.push(dir(q.x,q.y));}}
    const F=new Float32Array(P.length*3);P.forEach((p,i)=>{F[3*i]=p.x;F[3*i+1]=p.y;F[3*i+2]=p.z;});const wpM=lk.wp?Math.max(...lk.wp):1;return {F,n,w:lk.w*(o.wk||1),hk:lk.hk||1,root:lk.root!=null?lk.root:0.18,soft:lk.soft||0,taper:lk.taper||0,lift:lk.lift||null,wp:lk.wp||null,pw:lk.pw||0,add:!!lk.add,wpM};});
   /* hair28 r14 lock-built mass (o.heights, Ray sweptR): each lock carries its own height (lk.lift along its length, lk.wp width profile, lk.pw
      section power); heights merge by a p-norm (HP), so locks fuse into one mass and valleys stay where the profiles fall off. The arc-length
      parameter and distance are smoothed over nearby segments (no ridges where the nearest segment switches on the inside of a bend). */
   const HT=!!o.heights,HP=o.hp||6,EW=o.envW||1,EP=o.envP||0.5,VW=o.vw||1.25,DS=new Float64Array(64),US=new Float64Array(64),LIFT=(a,u)=>{const x=(u<0?0:u>1?1:u)*(a.length-1),i=Math.min(a.length-2,Math.floor(x)),f=x-i;return a[i]*(1-f)+a[i+1]*f;};
   const pw=o.pw||0.42,out=[0,0,0,1,0,0];
   const field=(dx,dy,dz)=>{let best=0,second=0,bs=0,sb=0,HS=0,FR=1,BS=0,ADD=0,BU=0.5;for(const k of LK){let dm=9,um=0;const F=k.F,n=k.n;
     for(let i=0;i<n;i++){const ax=F[3*i],ay=F[3*i+1],az=F[3*i+2],bx=F[3*i+3]-ax,by=F[3*i+4]-ay,bz=F[3*i+5]-az;const l2=bx*bx+by*by+bz*bz||1e-9;
      let t=((dx-ax)*bx+(dy-ay)*by+(dz-az)*bz)/l2;t=t<0?0:t>1?1:t;const cx=ax+bx*t-dx,cy=ay+by*t-dy,cz=az+bz*t-dz,dd=Math.sqrt(cx*cx+cy*cy+cz*cz);if(HT){DS[i]=dd;US[i]=(i+t)/n;}if(dd<dm){dm=dd;um=(i+t)/n;}}
     if(HT){if(dm-0.04>k.w*k.wpM/0.33*Math.max(EW,VW,1))continue;/* exact early-out: this lock can't reach here (the smoothing lowers dm by at most .012 ln 28) */
      let sw=0,su=0,sd=0;for(let i=0;i<n;i++){const e=DS[i]-dm;if(e>0.33)continue;const wg=Math.exp(-e/0.03);sw+=wg;su+=wg*US[i];sd+=Math.exp(-e/0.012);}um=su/sw;dm=Math.max(0,dm-0.012*Math.log(sd)+0.012*Math.log(2));}
     const wa=k.w*(k.wp?LIFT(k.wp,um):1)*(0.5+0.5*Math.sin(Math.PI*Math.min(1,0.15+0.85*um)))*(1-k.taper*um)/0.33;/* r13: lk.taper narrows a lock along its length */
     if(k.lift&&!k.add){const q=dm/(wa*EW),be=1-q*q;if(be>0)HS+=Math.pow(Math.pow(be,EP)*k.hk*(0.35+0.65*sm(0,k.root,um))*LIFT(k.lift,um),HP);}/* r14: the mass is the union of each lock's soft volume (wider than its crest) */
     if(HT&&k.add){ADD+=sm(1.3,0.15,dm/wa)*LIFT(k.lift,um);continue;}/* r14b: an additive relief lock rides on top of the mass (no valley carve) */
     if(HT){const q=sm(VW,0.25,dm/wa)*k.hk;if(q>BS)BS=q;}/* r14: soft lock coverage for the valley walls */
     let b=1-(dm/wa)*(dm/wa);if(b<=0)continue;b=Math.pow(b,k.pw||pw)*k.hk*(0.35+0.65*sm(0,k.root,um));
     if(b>best){FR=dm/wa;BU=um;second=best;sb=bs;best=b;bs=k.soft;}else if(b>second){second=b;sb=k.soft;}}
    const ks=Math.max(bs,sb);if(ks>0){const hq=Math.max(ks-Math.abs(best-second),0)/ks;best+=hq*hq*ks*0.25;}out[0]=best;out[1]=second;out[2]=HS>0?Math.pow(HS,1/HP):0;out[3]=FR;out[4]=BS;out[5]=ADD;out[6]=BU;return out;};
   const thOf=(tj,thE)=>0.015+(thE-0.015)*(tj<0.85?tj/0.85*0.97:0.97+0.03*(tj-0.85)/0.15);const LP=o.lip;
   const pos=[],uv=[],idx=[];
   /* hair28 r11 scalloped edge (Mia): where no lock reaches the hairline the edge pulls back, so the lock tips form the hairline */
   const SC=[];if(o.scallop)for(let i=0;i<=U;i++){const ph=PHU(i/U),t0=hl?hl(ph):1.6;let bm=0;for(const dt of [0.03,0.07,0.11]){const q=dir(t0-dt,ph);bm=Math.max(bm,field(q.x,q.y,q.z)[0]);}SC.push(t0-o.scallop*(o.scallopMask?o.scallopMask(ph,t0):1)*(1-sm(0.2,0.85,bm)));}
   for(let j=0;j<=Vn;j++)for(let i=0;i<=U;i++){const ph=PHU(i/U),thE=o.scallop?SC[i]:(hl?hl(ph):1.6),tj=j/Vn;let th=thOf(tj,thE),eR=-1;const fr=LP?Math.pow(Math.max(0,Math.cos(ph)),LP[1]||2):0;
    if(o.round){const span=0.03+o.round*Math.pow(Math.max(0,Math.cos(ph)),2),tR=0.72;if(tj<=tR)th=0.015+(thE-span-0.015)*tj/tR;else{eR=(tj-tR)/(1-tR);th=thE-span+span*Math.sin(eR*Math.PI/2);}}/* the last rows wrap a quarter circle down to the hairline: a thick rounded roll face, no overhang */
    let thL=th;if(LP&&tj>0.8){const e=(tj-0.8)/0.2;thL=th+LP[0]*fr*Math.sin(Math.PI*Math.min(1,e*1.25))*(1-0.6*e);}
    const d=dir(thL,ph),sk=SKR(thL,ph),tm=Math.min(th,thL),dm=dir(tm,ph);const f=field(dm.x,dm.y,dm.z),b=f[0];let r;
    if(HT){/* r14: lock heights ride the smooth ellipsoid (the v3 skull's fine shape would print through as striations); skin still can't poke through; sides held in at the temples and upper ears; the scalp edge feathers */
     const HL3=f[2],FRg=f[3],BSg=f[4],ADg=f[5],CA=o.crestArc?o.crestArc(th,ph):null,HLc=CA?Math.pow(Math.pow(HL3,8)+Math.pow(CA[0],8),1/8):HL3,thE0=hl?hl(ph):1.6,FTH=(o.feather?sm(0,o.feather,thE0-th):1)*(o.sideCut?1-o.sideCut*Math.exp(-(((Math.abs(ph)-1.6)/0.6)**2))*sm(0.78,1.4,th):1)/* r15b: wider, softer top-to-side ramp */,skS=Math.max(sk-0.006,Math.hypot(d.x*R0[0],d.y*R0[1],d.z*R0[2])+(o.skOff||0));
     r=Math.max(sk+0.004,skS+FTH*(o.base||0.012)*(o.baseMod?o.baseMod(th,ph):1)+FTH*HLc+FTH*ADg-(o.hv||0)*(CA?1-CA[1]:1)*(1-BSg)*sm(0.004,0.03,HLc)-(o.comb||0)*(0.5-0.5*Math.cos(2*Math.PI*(o.combN||3)*Math.min(1,FRg)))*sm(0.15,0.45,FRg)*sm(0.01,0.04,HL3));}
    else{const vv=o.valley2?val+(o.valley2-val)*sm(1.35,1.8,th):val;const PU=(o.push||0)*sm(0.15,0.6,b)*(o.pushMask?o.pushMask(dm):1);/* hair28 r10: crests ride slightly proud of the envelope (Mia) */r=Math.max(sk+0.004,ENV(dm)+PU-vv*(1-b));}
    if(eR>=0){const fq=Math.pow(Math.max(0,1-eR*eR),o.roundP||0.5),fw=HT?Math.pow(Math.max(0,Math.cos(ph)),4):1;r=sk-0.003+(r-sk+0.003)*(fq*fw+(1-sm(0,1,eR))*(1-fw));}/* r14 heights: sides and back taper smoothly into the skin; only the front keeps the rounded roll face *//* r13: roundP > .5 feathers the rounded front into the skin */else if(tj>0.85){const e=(tj-0.85)/0.15;const k=LP?Math.pow(sm(0,1,e),1+2*fr):sm(0,1,e);r=r+(sk-0.003-r)*k;}if(o.clip)r=Math.max(sk+0.003,o.clip(d,r,sk));/* r15: keep-out volume (Mia's throwing-side dart path) */pos.push(d.x*r,d.y*r,d.z*r);uv.push((ph+Math.PI)/(2*Math.PI),1-tm/TMX);}
   if(HT)for(const jr of [0,1]){let m=0;for(let i=0;i<=U;i++){const q=(jr*(U+1)+i)*3;m+=Math.hypot(pos[q],pos[q+1],pos[q+2]);}m/=U+1;for(let i=0;i<=U;i++){const q=(jr*(U+1)+i)*3,l=Math.hypot(pos[q],pos[q+1],pos[q+2]),k=(l+(m-l)*(jr?0.5:1))/l;pos[q]*=k;pos[q+1]*=k;pos[q+2]*=k;}}/* r14: the tiny crown ring collapses to its mean height (no pinched triangles at the pole) */
   for(let j=0;j<Vn;j++)for(let i=0;i<U;i++){const a=j*(U+1)+i;idx.push(a,a+U+1,a+1,a+1,a+U+1,a+U+2);}
   if(window.TOPS_V3FLAG===true&&window.GROOVE_POLE!==0){/* hair28 r16 (doc 53): close the crown pole pinhole (v3 only: the v2 default keeps its geometry) */let px=0,py=0,pz=0;for(let i=0;i<=U;i++){px+=pos[i*3];py+=pos[i*3+1];pz+=pos[i*3+2];}const pc=pos.length/3;pos.push(px/(U+1),py/(U+1)*1.0005,pz/(U+1));uv.push(uv[0],uv[1]);for(let i=0;i<U;i++)idx.push(pc,i,i+1);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();
   {const Nn=g.attributes.normal;for(let j=0;j<=Vn;j++){const a0=j*(U+1),a1=a0+U;const x=Nn.getX(a0)+Nn.getX(a1),y=Nn.getY(a0)+Nn.getY(a1),z=Nn.getZ(a0)+Nn.getZ(a1),l=Math.hypot(x,y,z)||1;Nn.setXYZ(a0,x/l,y/l,z/l);Nn.setXYZ(a1,x/l,y/l,z/l);}
    let px=0,py=0,pz=0;for(let i=0;i<=U;i++){px+=Nn.getX(i);py+=Nn.getY(i);pz+=Nn.getZ(i);}const pl=Math.hypot(px,py,pz)||1;for(let i=0;i<=U;i++)Nn.setXYZ(i,px/pl,py/pl,pz/pl);}
   /* the baked lock colour: valley shadow -> base -> highlight along each crown, mixed in sRGB (the lab's numbers) */
   const TW=HT&&o.tw?(S3G==='full'?o.tw:Math.round(o.tw*2/3)):(S3G==='full'?512:384),TH=HT&&o.th?Math.round(o.th*TW/o.tw):TW/2;
   /* round 5 perf: the same hair is built several times per match (match figure, preview, portrait, hero shot): the bake depends only on the locks,
      colours, bake options and size, so it is baked once and the texture shared (LRU of 8 looks) */
   const BK=V2BAKE,bkey=JSON.stringify([TW,TH,+TMX.toFixed(4),cols,Ls,o,!!window.GFX_LIN]);let tex=BK.get(bkey);if(tex){BK.delete(bkey);BK.set(bkey,tex);}
   if(!tex){const cv=document.createElement('canvas');cv.width=TW;cv.height=TH;const cx=cv.getContext('2d'),im=cx.createImageData(TW,TH);
   const s=c=>{const q=new T.Color(c);if(window.GFX_LIN)q.convertLinearToSRGB();return q;};const cB=s(cols.base),cS=s(cols.shadow),cH=s(cols.hi),C=new T.Color();const H20=!!o.h20&&o.streak!==0,cH2=cH.clone().lerp(new T.Color(0xffffff),0.25);/* r20 (doc 54): o.h20 set by the v3 styles */
   for(let y=0;y<TH;y++){const th=(y+0.5)/TH*TMX,st=Math.sin(th);for(let x=0;x<TW;x++){const ph=-Math.PI+2*Math.PI*(x+0.5)/TW;const f=field(st*Math.sin(ph),Math.cos(th),st*Math.cos(ph));const b=f[0],b2=f[1];
     const fl=o.floor!=null?o.floor:0.22,sd=o.seam!=null?o.seam:0.55;let a,hi=sm(o.hiLo||0.8,0.98,b)*(o.hi||0.5);
     if(HT){const Hq=f[2],FLx=fl+((o.openFloor||0.62)-fl)*(1-sm(0.012,0.04,Hq));a=FLx+(1-FLx)*Math.pow(f[4],0.8);if(f[5])a*=0.95+0.13*sm(0.004,0.014,f[5]);/* r14b: the relief lock reads as a lighter form with a soft shadowed edge */if(o.combT)a*=1-o.combT*(0.5-0.5*Math.cos(2*Math.PI*(o.combN||3)*Math.min(1,f[3])))*sm(0.01,0.04,Hq);hi*=sm(0.015,0.06,Hq);}/* r14: only seams between neighbouring locks go to the dark floor; open scalp stays mid-tone; comb lines along each lock */
     else a=(fl+(1-fl)*sm(0.04,0.42,b))*(sd+(1-sd)*sm(0.0,0.25,b-b2*0.92));if(H20)a*=1-(o.seamD!=null?o.seamD:0.3)*(1-sm(0.05,0.3,b));/* r20: seams 30% darker */C.copy(cS).lerp(cB,Math.min(1,a));C.lerp(cH,hi);
     if(H20&&b>0.05){const dY=Math.cos(th),dZ=st*Math.cos(ph);const sk_=Math.exp(-((Math.min(1,f[3])/0.26)**2))*Math.pow(Math.sin(Math.PI*Math.max(0,Math.min(1,f[6]))),1.1)*sm(0.04,0.3,b-b2)*sm(-0.2,0.6,dY*0.8+dZ*0.6)*(HT?sm(0.012,0.04,f[2]):sm(0.3,0.75,b));C.lerp(cH2,Math.min(0.85,sk_*(o.streak!=null?o.streak:0.75)));}/* r20: one glossy streak along each lock's crown, full mid-length, only where one lock owns the surface */
     if(o.tone)C.multiplyScalar(o.tone);
     const o4=(y*TW+x)*4;im.data[o4]=C.r*255;im.data[o4+1]=C.g*255;im.data[o4+2]=C.b*255;im.data[o4+3]=255;}}
   cx.putImageData(im,0,0);tex=new T.CanvasTexture(cv);tex.encoding=T.sRGBEncoding;tex.anisotropy=4;tex.userData=Object.assign(tex.userData||{},{keep:true});/* figure disposal leaves it to the cache (r128 textures have no userData by default) */BK.set(bkey,tex);if(BK.size>8){const k0=BK.keys().next().value,t0=BK.get(k0);BK.delete(k0);try{t0.dispose();}catch(e){}}}
   const m=v2M(0xffffff,'hair');m.color.setRGB(1,1,1);/* v2M's hair rule pulls white to #eaeaea; the bake carries the colour */m.map=tex;const RG=o.h20&&o.r20?o.r20[0]:(o.rough||0.42),CC=o.h20&&o.r20?o.r20[1]:(o.cc!=null?o.cc:0.16);m.roughness=Math.max(o.h20?.34:.4,Math.min(.6,RG));if('clearcoat' in m)m.clearcoat=Math.max(0,Math.min(o.h20?.3:.16,CC));/* r20: glossier hair allowed on v3 */
   if(HT){/* round 5 (ChatGPT 39): silver separation in the big venues. The Arena's broad cool light lifts the baked valleys (hair-box 5th/25th percentile
      70/98 vs the Pub's 58/90) while the highlights barely move. Only the darkest part of the bake (luminance under .05 linear, the seams) is scaled
      by V2HAIRHC.k, easing back to 1 by .25, so the broad white highlights and the base keep their values: no overall brightening, darker valleys.
      buildVenue sets k from the tier (1 at the Pub and Club, ramping to its Arena value) */
    m.onBeforeCompile=sh=>{sh.uniforms.uHC=V2HAIRHC;sh.fragmentShader='uniform vec3 uHC;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n\tdiffuseColor.rgb*=mix(uHC.x,1.0,smoothstep(uHC.y,uHC.z,dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))));');};m.customProgramCacheKey=()=>'v2hairHC';}
   m.needsUpdate=true;
   const mesh=new T.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.hair=true;mesh.userData.tag='hair';h.add(mesh);return mesh;}
  /* Kai r9 (quiffL): the r8 poster-fitted masses and the 16 groove locks, verbatim */
  const KAI={M:[[-0.058,0.292,0.076,0.232,0.168,0.232,-0.1,0,0.08],[-0.27,0.218,-0.042,0.138,0.15,0.2,0,0,0.35],[0.188,0.222,0.046,0.13,0.13,0.15,0,0,-0.3],[-0.006,0.204,-0.128,0.238,0.262,0.23,0.2,0,0],[0.01,0.21,0.163,0.2,0.118,0.103,-0.5,0,0],[-0.25,0.252,0.11,0.14,0.13,0.13,0,0,0.3]],
   GL:[{p:[[1.0,-0.2],[0.75,-0.2],[0.45,-0.08],[0.25,0.3],[0.3,1.6]],w:0.11,taper:0.35},{p:[[0.98,0.35],[0.78,0.45],[0.58,0.72],[0.5,1.45]],w:0.068,hk:0.9},
    {p:[[0.98,-0.55],[0.82,-0.75],[0.65,-1.2],[0.7,-1.9],[0.95,-2.4]],w:0.075},{p:[[1.05,0.85],[0.95,1.1],[0.9,1.6],[1.05,2.2],[1.3,2.6]],w:0.06,hk:0.92},
    {p:[[1.12,-1.0],[1.1,-1.35],[1.2,-1.9],[1.45,-2.3]],w:0.052,hk:0.85},{p:[[1.15,1.15],[1.18,1.5],[1.3,1.95],[1.5,2.35]],w:0.048,hk:0.85},
    {p:[[0.3,-0.5],[0.25,-1.6],[0.45,-2.6],[0.8,-3.0]],w:0.072,hk:0.95},{p:[[0.55,2.2],[0.9,2.4],[1.35,2.65],[1.8,2.9]],w:0.075},{p:[[0.5,2.95],[0.95,3.05],[1.45,3.3],[1.9,3.5]],w:0.08},
    {p:[[0.6,-2.35],[1.05,-2.55],[1.5,-2.65],[1.75,-2.9]],w:0.07},{p:[[1.05,-0.33],[0.9,-0.4],[0.7,-0.55],[0.55,-0.95]],w:0.048,hk:0.8},
    {p:[[1.45,2.15],[1.7,2.42],[2.02,2.7]],w:0.058,hk:0.85,n:20},{p:[[1.4,-2.1],[1.75,-2.32],[2.05,-2.5]],w:0.056,hk:0.85},{p:[[1.75,2.95],[2.0,3.08],[2.25,3.15]],w:0.052,hk:0.8},
    {p:[[0.85,1.25],[0.9,1.7],[1.1,2.1],[1.35,2.4]],w:0.055,hk:0.9},{p:[[0.85,-1.35],[0.95,-1.8],[1.2,-2.15],[1.3,-2.3]],w:0.055,hk:0.9},
    /* hair28 r14 (ChatGPT 33): 3 supporting waves crossing diagonally into the roll, ends staggered ~12%, so the roll isn't one continuous ridge */
    {p:[[0.97,0.78],[0.8,0.58],[0.62,0.26],[0.5,-0.18]],w:0.062,hk:0.9,taper:0.25},{p:[[0.72,1.12],[0.56,0.84],[0.43,0.47],[0.37,0.12]],w:0.058,hk:0.87,taper:0.25},{p:[[1.0,-0.86],[0.86,-0.62],[0.72,-0.37],[0.66,-0.16]],w:0.056,hk:0.86,taper:0.25}],
   HLP:[[0,1.0],[0.32,0.92],[-0.38,0.94],[0.72,0.92],[-0.74,0.93]],cols:{base:0x5F311E,shadow:0x45200F,hi:0x8D533A},/* doc 30 #6: valley shadow #31170F -> #45200F (a richer chocolate brown, not near-black red) *//* doc 25 fix 4: ChatGPT's poster browns (r9 had 0x543424 / 0x2A1810 / 0x7A5C4C) */
   o:{envMod:d=>{const th=Math.acos(Math.max(-1,Math.min(1,d.y))),ph=Math.atan2(d.x,d.z),sm=V2HK().sm,KC=window.KAI_CREST!=null?window.KAI_CREST:((window.TOPS_V3FLAG===true&&window.TOPS_SIG21!==0&&window.TOPS_SIG_KAI!==0)?0.045:0.11)/* r21b (doc 57) Kai signature: the front roll ~7% higher */,KS=window.KAI_SIDE!=null?window.KAI_SIDE:0.05;
     const CC=window.KAI_CC!=null?window.KAI_CC:0.07;return 1-KC*Math.exp(-((ph-0.15)**2)/(2*0.5*0.5))*sm(1.1,0.8,th)-CC*Math.exp(-((th-0.18)**2)/(2*0.22*0.22))*sm(0.62,0.42,th)/* r14: crown-centre stand-off -7%, front crest untouched */+KS*Math.exp(-((Math.abs(ph)-1.4)**2)/(2*0.4*0.4))*sm(0.45,0.7,th)*sm(1.7,1.4,th);},/* r13 (doc 31): crest -11% of its stand-off (peak to his right), side waves +5%; the roll 10% wider at the base, tapering, shorter his-left roll, longer his-left sweep */
    valley:0.03,wk:0.7,pw:0.6,frontDense:0.5,U:84,round:0.12,hiLo:0.92,hi:0.16,rough:0.5,cc:0.03,floor:0.12,seam:0.4,get streak(){return window.TOPS_V3FLAG===true&&window.TOPS_HAIR8!==0?0.75*(window.TOPS_HAIR8_K||0.75):undefined;}/* round 8A: Kai's brightest streaks -25%, seams kept */,get lip(){return (window.TOPS_V3FLAG===true&&window.TOPS_SIG21!==0&&window.TOPS_SIG_KAI!==0)?[0.06,3]:null;}/* r21b: the front hairline rows tip forward over the brow (the poster's swept peak leads the silhouette) */}};/* doc 30 #6: floor .10 -> .12 (the valley shows its brown), crown highlight .20 -> .16 *//* fix 3 (Director, hair28 r11): no lip, rounded roll face, 3 cm valleys, narrower locks, rounder crests, columns packed to the face (4,872 tris, lab density); the bake and material keep Engine's fix 2 numbers *//* fix 4: no tone lift (it greyed the browns); the bake is written as the sRGB hex, the material white *//* doc 25 fix 2 (lock separation): darker valley floor and seams, a narrow highlight on each crown only, clearcoat .03, a 1.6x finer shell *//* tone 1.3: the lab judges the colours under a key ~1.6x the game's creator/venue light; the bake is lifted to match (Director: lighting is Engine's call) */
  const RAY={M:[[-0.018,0.262,0.08,0.188,0.143,0.162,-0.25,0,0],[-0.018,0.19,-0.102,0.274,0.22,0.228,0,0,0],[-0.232,0.138,0.004,0.086,0.132,0.196,0,0,0.1],[0.22,0.138,-0.008,0.068,0.132,0.19,0,0,-0.1],[-0.172,0.262,0.008,0.08,0.1,0.1,0,0,0.3],[0,0.19,0.18,0.17,0.085,0.1,-0.5,0,0],[-0.19,0.16,0.12,0.08,0.09,0.1,0,0,0.3]],/* fix 3: + front roll mass and his-right temple mass */
   GL:[{p:[[0.85,0.05],[0.6,0.08],[0.35,0.12],[0.2,1.2],[0.35,2.9]],w:0.085},{p:[[0.66,0.48],[0.47,0.2],[0.36,-0.45],[0.48,-1.45],[0.82,-2.15]],w:0.06,hk:0.95},/* r13: a diagonal sweep front-left -> back-right */
    {p:[[0.84,-0.32],[0.66,-0.58],[0.52,-1.25],[0.72,-2.2],[1.2,-2.75],[1.55,-2.95]],w:0.085},{p:[[0.8,0.5],[0.68,0.7],[0.6,1.3],[0.8,1.95]],w:0.062},/* r13: his-right sweep longer and wider, his-left shorter and narrower */
    {p:[[1.0,-0.95],[1.1,-1.35],[1.3,-2.05],[1.7,-2.55]],w:0.066},{p:[[1.08,1.0],[1.18,1.4],[1.35,2.0],[1.7,2.45]],w:0.05,hk:0.85},{p:[[0.5,2.5],[1.0,2.68],[1.5,2.85],[1.95,3.0],[2.15,3.05]],w:0.072,soft:0.22},
    {p:[[0.6,-2.6],[1.1,-2.72],[1.6,-2.88],[1.9,-2.98],[2.05,-3.02]],w:0.068,soft:0.22},{p:[[1.6,2.25],[1.88,2.5],[2.12,2.78]],w:0.05,hk:0.8,soft:0.2},{p:[[1.5,-2.15],[1.82,-2.4],[2.05,-2.7]],w:0.05,hk:0.8,soft:0.2},
    {p:[[1.25,-1.3],[1.35,-1.7],[1.55,-2.1]],w:0.045,hk:0.8},{p:[[0.8,-1.0],[0.85,-1.6],[1.05,-2.2],[1.35,-2.6]],w:0.06,hk:0.9},{p:[[0.82,1.05],[0.9,1.65],[1.1,2.2],[1.4,2.55]],w:0.058,hk:0.9},{p:[[0.3,2.4],[0.65,2.9],[1.15,3.18],[1.7,3.22]],w:0.055,hk:0.9,soft:0.2}],
   HLP:[[0,1.01],[0.3,0.909],[-0.3,0.909],[0.62,0.806],[-0.62,0.806],[0.95,0.95],[-0.95,0.95]],cols:{base:0x9a9590,shadow:0x48443f,hi:0xf4f1ec},/* doc 30 #6: valley shadow a touch darker *//* fix 3 + r12: front hairline 0.21 rad lower (RAY_HLF), filling the side notch */
   o:{hlSmooth:0.22,valley:0.028,wk:0.9,pw:0.6,frontDense:0.5,U:84,round:0.12,roundP:1.1,hi:0.6,hiLo:0.84,tone:0.88,floor:0.14,seam:0.38,/* doc 30 #6: stronger separation between the silver ridges (valley floor .22 -> .14, seam .55 -> .38) *//* r13: crest -9%, the rounded front feathers into the skin */
    envMod:d=>{const th=Math.acos(Math.max(-1,Math.min(1,d.y))),ph=Math.atan2(d.x,d.z);return 1-(window.RAY_CREST!=null?window.RAY_CREST:0.09)*Math.exp(-(ph*ph)/(2*0.55*0.55))*V2HK().sm(1.1,0.75,th);}}};
  return {envR,envS,groove,KAI,RAY};})();
 const V2HAIRS={
  /* r9 Tama (hair28 curly with the r8/r9 rear clusters: bigger, deeper, 2 lobes) for v3 heads */
  curlyL(h,L,K){K.seed(5);const cols={base:0x1F1A19,shadow:0x0A0909,hi:0x433934};const parts=[];
   const hl=K.HL([[0,1.0],[.3,1.04],[-.3,1.04],[.6,.98],[-.6,.98],[.9,1.08],[-.9,1.08],...K.sideHL(1,1.55,1.32,1.7),...K.sideHL(-1,1.58,1.32,1.7),[2.45,2.22],[-2.45,2.22],[2.85,2.3],[-2.9,2.28],[Math.PI-.01,2.32]]);parts.push(K.cap(hl,.02,28,6));
   const C=[[.92,0,.11,.034],[.94,.36,.1,.032],[.95,-.34,.1,.033],[.98,.7,.085,.026],[.99,-.72,.088,.027],[1.1,1.0,.07,.02],[1.1,-1.0,.072,.02],[.55,.15,.13,.04],[.6,-.5,.12,.038],[.62,.8,.12,.036],[.2,0,.14,.042],[.35,1.9,.13,.036],[.4,-1.55,.13,.037],[.42,2.9,.13,.036],[.65,-2.45,.12,.033],
    [1.1,1.45,.09,.022],[1.05,-1.4,.095,.024],[1.0,2.1,.11,.026],[.98,-2.0,.11,.026],[1.15,2.75,.11,.024],[1.2,-2.85,.11,.024],[1.55,2.35,.09,.014],[1.6,-2.4,.09,.014],[1.7,3.1,.1,.012],[1.4,1.8,.08,.014],[1.42,-1.75,.08,.014],[.85,2.55,.12,.03],[.85,-2.7,.12,.03],[1.3,3.05,.12,.026],[1.35,2.45,.11,.024],[1.35,-2.35,.11,.024],[1.25,2.0,.1,.022],[1.22,-2.05,.1,.022],[.75,1.45,.11,.03],[.78,-1.2,.11,.03]];
   const MR=window.TAMA_MR!=null?window.TAMA_MR:[1.05,.4,.45,.72],MRD=window.TAMA_MRD||1.22;if(MR!==0)C.push(...(window.TAMA_MRC||[[.52,.55,.1,.022],[.57,-.9,.1,.016],[.6,1.2,.095,.022],[.58,-1.7,.1,.023],[.55,2.05,.105,.024],[.6,-2.25,.095,.023],[.52,2.6,.11,.024],[.55,-2.85,.1,.023],[.62,1.75,.09,.021]]));/* hair28 r14 (ChatGPT 33): 9 medium mid-crown curls behind the front row, weighted to the rear 3/4 (TAMA_MR=0 switches r14 off) */
   const SGT=window.TOPS_SIG21!==0&&window.TOPS_SIG_TAMA!==0,NC0=C.length;if(SGT)C.push(...(window.TAMA_HL||[[1.07,.17,.075,.02],[1.06,-.19,.078,.02],[1.11,.52,.068,.018],[1.1,-.55,.07,.018]]));/* r21 (doc 56) Tama signature: 4 small hairline curls */
   const RK=[1.1,1.65,.3,1.45,2.3,.82],CK=window.TOPS_TAMA_CROWN||[1.18,.6],RT=[1.0,.95,2.0];/* r13 (doc 31): crown x1.18, no rear-top boost, flatter rear fill */for(let i=0;i<C.length;i++){const c=C[i];const front=i<7,rear=Math.abs(c[1])>1.9,top=c[0]<.5;const deep=i<35&&Math.abs(c[1])>=RK[4]&&c[0]>=RK[2]&&c[0]<=RK[3];
    const crown=i<35&&!front&&c[0]<CK[1],rtop=i<35&&!front&&!crown&&c[0]<RT[1]&&Math.abs(c[1])>=RT[2];/* non-front crown curls x CK (r13 1.18; TOPS_TAMA_CROWN=[k,.6] overrides), the top-centre curl capped at 1.3; the front row is untouched */
    const sz=c[2]*1.3*(c[0]>1.15?1.25:1)*(front?1.2:1)*(1+.36*(((i*7919)%97)/97-.5))*(deep?RK[0]:(rear&&c[0]<1.2?.88:1)),ht=c[3]*1.8*(top?RK[5]:1)*(front?1.1:1)*(deep?RK[1]:1)*(crown?(c[0]<.3?Math.min(CK[0],1.3):CK[0]):1)*(rtop?RT[0]:1)*(MR!==0&&!front&&!deep&&!rtop&&c[0]>=MR[2]&&c[0]<=MR[3]?MR[0]*(1+MR[1]*K.sm(1.2,2.3,Math.abs(c[1]))):1)*(MR!==0&&(deep||rtop)&&c[0]>=.6&&c[0]<=.95?MRD:1);/* r14: mid-ring x1.05 rising to x1.47 toward the rear 3/4; rear 3/4 shoulder x1.22 *//* r13 hierarchy: front curls x1.2 size / x1.1 height, every curl's width varies by a fixed +-18% */const hsh=k=>(((i*2654435761+k*40503)>>>0)%1000)/1000,tv=SGT&&i<NC0&&c[0]<.8&&!front?1:0;/* r21: top curls +-16% size, up to -32% height (never taller) */parts.push(...K.cluster(c[0],c[1]+(K.rnd()-.5)*.06,sz*(1+tv*.32*(hsh(1)-.5)),ht*(1-tv*.32*hsh(2)),deep?2:(c[0]>1.15?2:0),deep?[11,4]:null));}
   const OV=(window.TOPS_V3HAIRO||{}).tama||{};const R20=V3H20();K.done(h,parts,L.hairC!=null&&L.hairC!==0x1a1210?K.colsFrom(L.hairC):(R20?{base:0x1e1614,shadow:0x080606,hi:0x5a4a42}:cols),Object.assign({top:.07,hiAmt:R20?(window.TOPS_V3FLAG===true&&window.TOPS_HAIR8!==0?(window.TOPS_HAIR8_K||0.75):1.0):.55},OV.po)/* round 8A: Tama's brightest curl highlights -25% */,OV.mr||(R20?[.3,.16,1]:[.72,0]));},/* r20 (doc 54): glossy dark curls, each lobe catching its own highlight *//* doc 30 #6: lower specular on the raised curls (painted highlight .85 -> .55, roughness .58 -> .72, no clearcoat) */
  /* r9 Ray (sweptL): his poster-fitted masses and groove locks, verbatim from hair28.js */
  sweptL(h,L,K){const G=V2GROOVE,Q=G.RAY;const hl=K.HL([...Q.HLP,...K.sideHL(1,1.55,1.38,1.72),...K.sideHL(-1,1.55,1.38,1.72),[2.45,2.2],[-2.45,2.2],[2.9,2.3],[-2.9,2.3],[Math.PI-.01,2.32]]);
   const OV=(window.TOPS_V3HAIRO||{}).ray||{},c0=L.hairC!=null&&L.hairC!==0xc8c4c0&&L.hairC!==0x75706a?K.colsFrom(L.hairC):Q.cols,c=OV.cols&&c0===Q.cols?Object.assign({},c0,OV.cols):c0;G.groove(h,L,K,Q.M,Q.GL,c,hl,Object.assign({},Q.o,OV.o));},
  /* hair28 r14 Ray (sweptR, ChatGPT 8.5 PORT): the same silver swept-back pompadour built from 6 real locks over a restrained scalp:
     1 dominant front lock (rises, rolls back over the crown to his right, runs down the back), 2 medium on his right, 1 on his left,
     2 small rear locks tapering into the scalp (r14b: + one shallow his-left relief, a broad roll under the crest); sides held in at the temples, rear close to the skull. Lock data verbatim from hair28.js;
     window.RAY_R takes the lab's knobs. Materials stay at the r13 freeze (shadow #48443F, seam floor .14). */
  sweptR(h,L,K){const G=V2GROOVE,Q=G.RAY,sm=K.sm,RP=window.RAY_R||{};const hl=K.HL([...Q.HLP,...K.sideHL(1,1.55,1.38,1.72),...K.sideHL(-1,1.55,1.38,1.72),[2.45,2.2],[-2.45,2.2],[2.9,2.3],[-2.9,2.3],[Math.PI-.01,2.32]]);
   const LS=RP.lift||1,LB=RP.back!=null?RP.back:1,sc=a=>a.map((v,i)=>v*LS*(1+LB*sm(0.2,0.6,i/(a.length-1))));/* front stays, crown/rear follow-through lifted */
   const GL=RP.locks||[
    {p:[[1.04,0.12],[0.84,0.08],[0.58,-0.05],[0.36,-0.35],[0.18,-1.2],[0.3,-2.5],[0.68,-2.85],[1.1,-2.97]],w:RP.wD||0.1,wp:RP.wpD||[1.9,1.85,1.65,1.4,1.2,1.35,1.45,1.2],root:0.05,taper:0.2,pw:RP.pwD||0.3,lift:sc(RP.liftD||[0.044,0.07,0.068,0.054,0.046,0.062,0.064,0.032])},/* 1 dominant */
    {p:[[1.03,-0.42],[0.86,-0.55],[0.68,-1.05],[0.8,-1.85],[1.12,-2.42]],w:RP.wM||0.075,wp:[1.3,1.25,1.1,0.9,0.8],root:0.06,taper:0.3,pw:0.42,lift:sc(RP.liftR1||[0.025,0.038,0.044,0.03,0.01])},/* 2 medium, his right; r14b: front -18% (outer crest peak softened) */
    {p:[[1.14,-0.86],[1.1,-1.25],[1.22,-1.82],[1.46,-2.25]],w:0.055,root:0.1,taper:0.4,lift:sc(RP.liftR2||[0.036,0.052,0.042,0.014])},
    {p:RP.pL1||[[0.98,0.66],[0.78,0.82],[0.52,1.3],[0.68,2.12],[1.22,2.64]],w:RP.wM||0.075,wp:[1.3,1.4,1.3,1.0,0.8],root:0.06,taper:0.3,pw:0.42,lift:sc(RP.liftL1||[0.021,0.04,0.045,0.03,0.01])},/* 1 medium, his left; r14b: front -18%, tail 12% longer than his right (staggered) */
    {p:RP.pLS||[[0.78,0.7],[0.84,1.02],[0.91,1.38],[0.99,1.7],[1.07,1.96]],w:RP.wLS||0.052,root:0.3,taper:0.55,add:true,lift:RP.liftLS||[0.005,0.013,0.015,0.012,0.003]},/* r14b: his-left side relief following the dominant sweep, ends before the ear */
    {p:[[0.62,2.35],[0.95,2.6],[1.32,2.78],[1.7,2.88],[2.06,2.93]],w:0.068,wp:[1,1.15,1.02,0.9,0.8],root:0.1,taper:0.6,lift:sc([0.03,0.034,0.017,0.004,0.0005])},/* r15b: tips taper ~7% earlier *//* 2 small rear, staggered ends; r14b: +13% / -13% wide, uneven along their length */
    {p:[[0.66,-2.3],[0.98,-2.5],[1.34,-2.64],[1.64,-2.72],[1.86,-2.76]],w:0.048,wp:[1,0.9,1.08,0.95,0.8],root:0.1,taper:0.6,lift:sc([0.028,0.03,0.0145,0.004,0.0005])}];
   const C0=Object.assign({},Q.cols),OV=(window.TOPS_V3HAIRO||{}).rayR||{},c0=L.hairC!=null&&L.hairC!==0xc8c4c0&&L.hairC!==0x75706a?K.colsFrom(L.hairC):C0,c=OV.cols&&c0===C0?Object.assign({},c0,OV.cols):c0;
   const bf=RP.base!=null?RP.base:0.012,br=RP.baseR!=null?RP.baseR:0.028,si=RP.sideIn!=null?RP.sideIn:0.8;
   G.groove(h,L,K,[],GL,RP.cols||(V3H20()&&c0===C0?Object.assign({},c,{shadow:0x48444a,hi:0xffffff}):c),hl,Object.assign(V3H20()?{h20:true,r20:[.4,.22]}:{},{heights:true,base:1,baseMod:(th,ph)=>{const a=Math.abs(ph),back=sm(0.3,2.2,a)*sm(0.2,0.7,th)+sm(0.6,0,th);return bf+(br-bf)*Math.min(1,back)*sm(1.6,1.0,th)*(1-si*Math.exp(-(((a-1.45)/0.45)**2))*sm(0.6,1.1,th));},
    hp:RP.hp||8,hlSmooth:0.22,wk:RP.wk||0.65,pw:RP.pw||0.6,frontDense:0.45,U:RP.U||60,V:RP.V||29,hi:RP.hi||0.36,hiLo:RP.hiLo||0.72,tone:0.88,round:0.14,roundP:1.0,rough:0.5,cc:0.03,
    hv:RP.hv!=null?RP.hv:0.03,tw:768,th:512,envW:RP.envW||2.4,envP:RP.envP||0.5,feather:RP.feather||0.12,sideCut:RP.sideCut!=null?RP.sideCut:0.6,comb:RP.comb!=null?RP.comb:0,combN:3,combT:RP.combT!=null?RP.combT:0.22,openFloor:RP.of||0.74,
    crestArc:RP.crest===0?null:(th,ph)=>{const C=RP.crest||[0.07,0.15,0.72,0.8,0.22,0.95],gp=Math.exp(-(((ph-C[1])/C[3])**2));return [C[0]*gp*Math.exp(-(((th-C[2])/C[4])**2)),C[5]*gp*Math.exp(-(((th-(C[6]||0.82))/(C[7]||0.09))**2))];},/* r14b: one broad convex roll under the crest; valleys damped only on its front face */
    floor:Q.o.floor/* r13 freeze: the seam floor between locks stays at Ray's .14 */},OV.o));},
  /* hair28 r9-r11 + r15 Mia (bunL; r15: lower crown and bun, 3 crown sweeps, waves in at the shoulders, a keep-out for the throwing dart on her right): long-hair locks on one sculpted shell inside the approved r8 envelope: crown sweeps from the offset part, a
     coiled bun, three S-waves per side to the shoulders, rear flow; the long sides hide the ears; gold hoops in front of the side hair */
  bunL(h,L,K){const B16=window.TOPS_V3FLAG===true&&window.MIA_BUN16!==0;const G=V2GROOVE,sm=K.sm,M=window.MIA_BLOCK||[B16?[-0.036,0.12,-0.068,0.306,0.25,0.31,0,0,0]:[-0.036,0.12,-0.068,0.306,0.243,0.31,0,0,0],B16?[-0.045,0.352,-0.11,0.178,0.13,0.158,0,0,0]:[-0.05,0.37,-0.14,0.2,0.105,0.095,0,0,0],/* hair28 r16 (doc 53): round bun into a fuller crown (v3 only) *//* hair28 r15: crown shell top -2.5 cm, bun lowered and 2 cm back into the rear crown, bun height -16% (diameter kept) */[-0.31,-0.085,-0.012,0.082,0.245,0.138,0,0,0.08],[0.285,-0.04,-0.012,0.075,0.18,0.138,0,0,0.12],[-0.05,0.23,0.08,0.21,0.07,0.09,-0.4,0,0],[-0.018,-0.08,-0.226,0.3,0.28,0.12,0,0,0]];
   const bc=new T.Vector3(M[1][0],M[1][1],M[1][2]),ax=bc.clone().normalize(),t1=new T.Vector3().crossVectors(ax,new T.Vector3(1,0,0)).normalize(),t2=new T.Vector3().crossVectors(ax,t1);
   const spiral=(r0,r1,a0,turns,n)=>{const v=[];for(let i=0;i<=n;i++){const u=i/n,a=a0+u*turns*2*Math.PI,r=r0+(r1-r0)*u;const q=bc.clone().addScaledVector(t1,Math.cos(a)*r).addScaledVector(t2,Math.sin(a)*r);v.push([q.x,q.y,q.z]);}return v;};
   const SWP=window.MIA_SWEEPS,CW=SWP===0?1:(window.MIA_CW||0.72);/* r15: crown locks 28% narrower so the new sweeps open real valleys */
   const GL=[{p:[[0.62,-0.2],[0.85,0.1],[0.95,0.55],[1.05,0.95],[1.25,1.28],[1.5,1.45]],w:0.085*CW},{p:[[0.62,-0.22],[0.8,-0.02],[0.95,0.3],[1.08,0.6],[1.14,0.85]],w:0.044,hk:1.0},{p:[[0.68,-0.14],[0.88,0.12],[1.02,0.42],[1.12,0.75],[1.2,1.0]],w:0.042,hk:0.98},
    {p:[[0.6,-0.3],[0.76,-0.5],[0.9,-0.76],[1.0,-0.98]],w:0.04,hk:0.97},{p:[[0.62,-0.32],[0.84,-0.52],[1.0,-0.86],[1.18,-1.15],[1.42,-1.38]],w:0.08*CW,hk:0.95},{p:[[0.7,-1.0],[0.88,-1.45],[1.1,-1.85],[1.3,-2.15]],w:0.07,hk:0.92},{p:[[0.72,0.95],[0.9,1.4],[1.1,1.8],[1.3,2.1]],w:0.065,hk:0.8},
    {v:[[-0.1494,0.8139,0.5615],[-0.0769,0.9359,0.3438],[0,1,-0.04],[-0.0416,0.9759,-0.2142],[-0.0904,0.9492,-0.3013]],w:0.075*CW,hk:0.92},{p:[[0.55,0.25],[0.35,1.1],[0.32,2.2],[0.42,2.85]],w:0.075*CW,hk:0.9},{p:[[0.55,-0.75],[0.4,-1.6],[0.38,-2.4],[0.45,-2.9]],w:0.075*CW,hk:0.9},
    ...(B16?[{v:spiral(0.12,0.045,0,1.25,12),w:0.07,hk:0.9,soft:0.2},{v:spiral(0.11,0.03,3.1,1.05,11),w:0.062,hk:0.86,soft:0.2},{v:spiral(0.055,0.0,1.0,0.7,7),w:0.09,hk:0.86,soft:0.24}]:[{v:spiral(0.13,0.05,0,1.15,10),w:0.05,hk:0.88},{v:spiral(0.12,0.04,2.1,1.0,10),w:0.045,hk:0.85},{v:spiral(0.1,0.02,4.2,0.9,9),w:0.04,hk:0.82},{v:spiral(0.035,0.0,1.0,0.6,6),w:0.055,hk:0.85}]),
     ...((window.TOPS_V3FLAG===true&&window.TOPS_SIG21!==0&&window.TOPS_SIG_MIA!==0)?[{p:[[0.92,0.62],[1.12,0.92],[1.42,1.06],[1.78,1.05],[2.1,1.0]],w:0.042,hk:1.06,taper:0.3,root:0.3},{p:[[0.92,-0.68],[1.12,-0.98],[1.42,-1.12],[1.78,-1.1],[2.1,-1.05]],w:0.04,hk:1.06,taper:0.3,root:0.3}]:[]),/* r21b (doc 57) Mia signature: a face-framing strand from the part down each side of the face (her right one sits next to the dart band: the r15c keep-out clips it) */
    {p:[[1.2,0.955],[1.5,1.207],[1.8,1.387],[2.1,1.243],[2.38,1.387]],w:0.06},{p:[[1.3,1.413],[1.62,1.665],[1.95,1.485],[2.2,1.665],[2.4,1.593]],w:0.062},{p:[[1.45,1.956],[1.75,1.83],[2.05,2.046],[2.36,1.938]],w:0.057,hk:0.92},
    {p:[[1.2,-0.988],[1.48,-1.168],[1.8,-1.42],[2.12,-1.276],[2.42,-1.348]],w:0.062},{p:[[1.32,-1.472],[1.65,-1.616],[1.98,-1.508],[2.25,-1.688],[2.44,-1.616]],w:0.06},{p:[[1.48,-1.988],[1.8,-1.88],[2.1,-2.06],[2.38,-1.952]],w:0.055,hk:0.92},
    {p:[[0.75,2.4],[1.25,2.45],[1.75,2.42],[2.25,2.5],[2.45,2.48]],w:0.088,soft:0.18},{p:[[0.75,-2.45],[1.25,-2.55],[1.8,-2.5],[2.3,-2.58],[2.45,-2.55]],w:0.112,soft:0.18},/* r15b: rear flows -12% / +12%, softer folds */
    ...(window.MIA_REARSPLIT===0?[{p:[[0.42,3.05],[0.85,3.14],[1.35,3.1],[1.85,3.2],[2.3,3.14]],w:0.095,hk:0.95,soft:0.18}]:[{p:[[0.42,2.98],[0.85,3.02],[1.35,2.92],[1.85,3.0],[2.32,2.94]],w:0.062,hk:0.95,soft:0.15},{p:[[0.5,-3.08],[0.95,-3.06],[1.45,-3.14],[1.9,-3.04],[2.2,-3.08]],w:0.052,hk:0.9,soft:0.15}]),/* r15b: the rear centre panel is two uneven strands, ends staggered */
    /* hair28 r15 (ChatGPT 36): 3 stronger directional crown sweeps from the forehead over the top, converging into the bun (great-circle paths with a bow) */
    ...(SWP===0?[]:(SWP||[[-0.5,0.06,0.058],[0.1,-0.04,0.08],[0.62,-0.07,0.07]])/* r15b: widths -12% / +11% / +6% */.map(([p0,bow,w])=>{const a=K.dir(0.84,p0),b2=ax.clone(),n=new T.Vector3().crossVectors(a,b2).normalize(),om=a.angleTo(b2),v=[];
     for(let i=0;i<=6;i++){const t=i/6*0.88;/* r15b: stops short of the bun */const q=a.clone().multiplyScalar(Math.sin((1-t)*om)).addScaledVector(b2,Math.sin(t*om)).divideScalar(Math.sin(om)).addScaledVector(n,bow*Math.sin(Math.PI*t)).normalize();v.push([q.x,q.y,q.z]);}
     return {v,w,hk:1.0,taper:0.5,root:0.22};/* r15b: softer root and tip */}))];
   const hs=K.HL([[-0.12,0.93],[0.15,1.0],[0.35,1.1],[0.6,1.16],[-0.5,0.95],[0.85,1.14],[-0.82,1.04],[1.12,1.24],[-1.12,1.24],[1.4,1.3],[-1.4,1.3],[1.62,1.3],[-1.62,1.3],[1.85,1.5],[-1.85,1.5],[2.3,1.95],[-2.3,1.95],[2.75,2.2],[-2.75,2.2],[Math.PI-0.01,2.25]]);
   const hl=ph=>{const a=Math.abs(K.wrap(ph));return hs(ph)+(2.44-hs(ph))*sm(1.0,1.3,a);};/* the long-hair edge drops to the tips beside and behind the face */
   const R20=V3H20(),cols=L.hairC!=null&&L.hairC!==0xf0c040?K.colsFrom(L.hairC):(R20?{base:0xE6961E,shadow:0x9A4E0C,hi:0xFFE27A}:{base:0xCC8A22,shadow:0x7A4512,hi:0xF4C45A});/* r20: warmer gold */
   G.groove(h,L,K,M,GL,cols,hl,{h20:R20,r20:[.36,.3],hlSmooth:0.3,scallop:0.09,scallopMask:(ph,t)=>1-sm(1.2,1.6,t),valley:0.021,valley2:0.036,clip:window.MIA_CLEAR===0?null:V2MIACLEAR,
    envMod:d=>{const SW=window.MIA_SW!=null?window.MIA_SW:(B16?0.36:0.3),Y0=window.MIA_SWY||[-0.15,-0.42],SL=window.MIA_SWL!=null?window.MIA_SWL:(B16?0.19:0.14);const BC=B16?(window.MIA_BUNCREASE!=null?window.MIA_BUNCREASE:0.24):0,ang=BC?d.angleTo(ax):9;return (1-sm(Y0[0],Y0[1],d.y)*(SW*sm(-0.1,0.35,d.z)+SL*sm(0.3,0.62,Math.abs(d.x))))*(1-BC*Math.exp(-(((ang-(window.MIA_BUNCR||0.42))/0.07)**2)));},/* r15: the long side waves pulled in at shoulder level; the cheek swell above is untouched */push:0.012,pushMask:d=>1-0.85*Math.exp(-(((d.angleTo(ax))/0.3)**2)),wk:1.0,U:96,V:50,/* r15c */hi:0.35,tone:0.95,lip:[0.08,2]});
   h.children.forEach(c=>{if(c.userData.ear)c.visible=false;});
   if(L.earring){const em=v2M(L.earring,'trim');em.metalness=0.85;em.roughness=0.25;for(const s of [1,-1]){const e=new T.Mesh(new T.TorusGeometry(0.042,0.0095,8,22),em);e.position.set(s*0.335,-0.205,0.06);e.rotation.set(0,s*1.1,0);e.userData.hair=true;e.castShadow=false;h.add(e);}}},
  /* hair28 r8/r9/r15 Dazza: his backwards cap (shallower crown, the size-strap opening at the front with a tuft, the brim at the back tipped up),
     the short hair under the rim, all children of the head; colours through the game's materials (GFX_LIN) */
  underL(h,L,K){const R=K.R,S=K.S,sm=K.sm,n0=h.children.length;const capHex=L.capC!=null&&L.capC!==0xd21e28?L.capC:0xC7222D;
   /* round 5 (ChatGPT 39): the cap read salmon-pink under venue light. Authored a step deeper (#A51B24) so it renders near the poster's #C7222D in the
      Arena (median (209,59,60) vs (234,77,72) before), roughness .5 (in the .45-.55 asked) with the environment reflection cut to .2, so the lit
      side keeps its red instead of a broad pale sheen. A player's own cap colour is used as chosen. TOPS_V3CAP={hex,rough,env,cc} to try values */
   const CQ=window.TOPS_V3CAP||{},capM=CQ.hex||(capHex===0xC7222D?0xA51B24:capHex);const cm=v2M(capM,'trim');cm.roughness=CQ.rough!=null?CQ.rough:0.5;cm.metalness=0;cm.envMapIntensity=CQ.env!=null?CQ.env:0.2;if(CQ.cc!=null&&'clearcoat' in cm)cm.clearcoat=CQ.cc;const dark=v2M(new T.Color(capM).multiplyScalar(0.55).getHex(),'trim');dark.roughness=0.6;
   const CT=window.CAP_TILT!=null?window.CAP_TILT:0.02,CY=0.095+(window.CAP_DY!=null?window.CAP_DY:0.006),OPH=window.CAP_OPH||0.3,CX=1.06;/* hair28 r15 (ChatGPT 36): front edge up ~6% of head height (less backward tilt, crown lifted 6 mm), rear rim/brim stays up, no scaling; opening arch -35% */const CF=window.CAP_FLAT!=null?window.CAP_FLAT:0.04,fy=y=>y*(1-CF*sm(0.5,1,y));/* r15b: upper crown flattened 4% locally; rim, front edge and brim untouched */const g=new T.SphereGeometry(1,32,12,0,Math.PI*2,0,Math.PI*0.5);{const P=g.attributes.position;for(let i=0;i<P.count;i++)P.setY(i,fy(P.getY(i)));g.computeVertexNormals();}g.scale(R[0]*CX,R[1]*0.87,R[2]*1.085);const cr=new T.Mesh(g,cm);cr.position.set(0,CY,-0.015);cr.rotation.x=CT;cr.castShadow=true;h.add(cr);
   for(let k=0;k<6;k++){const a=k/6*Math.PI*2+Math.PI/6,pts=[];for(let i=0;i<=8;i++){const t=i/8*Math.PI*0.5;pts.push(new T.Vector3(Math.sin(t)*Math.cos(a)*R[0]*(CX+0.008),fy(Math.cos(t))*R[1]*0.88,Math.sin(t)*Math.sin(a)*R[2]*1.093));}
    const sm_=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),8,0.005,4,false),dark);sm_.position.copy(cr.position);sm_.rotation.copy(cr.rotation);h.add(sm_);}
   const bt=new T.Mesh(new T.SphereGeometry(0.03,14,10),cm);bt.position.set(0,CY+R[1]*0.87*fy(1),-0.05);h.add(bt);
   const rimF=CY-Math.sin(CT)*R[2]*1.085,rimB=CY+Math.sin(CT)*R[2]*1.085;
   {const NU=18,NV=6,pos=[],idx=[];for(let i=0;i<=NU;i++){const u=i/NU,a=-0.6+1.2*u,ht=OPH*Math.pow(Math.sin(Math.PI*u),0.7);for(let j=0;j<=NV;j++){const th=Math.PI*0.5-ht*j/NV;pos.push(Math.sin(th)*Math.sin(a)*R[0]*CX*1.004,Math.cos(th)*R[1]*0.87*1.004,Math.sin(th)*Math.cos(a)*R[2]*1.085*1.004);}}
    for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){const q=i*(NV+1)+j;idx.push(q,q+NV+1,q+1,q+1,q+NV+1,q+NV+2);}
    const og=new T.BufferGeometry();og.setAttribute('position',new T.Float32BufferAttribute(pos,3));og.setIndex(idx);og.computeVertexNormals();
    const o=new T.Mesh(og,new T.MeshBasicMaterial({color:0x0d0705,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}));o.position.copy(cr.position);o.rotation.copy(cr.rotation);h.add(o);}/* the size-strap opening at the front */
   {const ap=[];for(let i=0;i<=16;i++){const a=-0.6+1.2*i/16,th=Math.PI*0.5-OPH*Math.sin(Math.PI*i/16);ap.push(new T.Vector3(Math.sin(th)*Math.sin(a)*R[0]*(CX+0.008),Math.cos(th)*R[1]*0.875,Math.sin(th)*Math.cos(a)*R[2]*1.093));}
    const ab=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ap),20,0.007,6,false),cm);ab.position.copy(cr.position);ab.rotation.copy(cr.rotation);h.add(ab);}
   {const tz=R[2]*1.085*Math.cos(0.2);const tuft=new T.Mesh(new T.SphereGeometry(0.06,14,10),v2M(L.hairC||0x4a2a18,'hair'));tuft.scale.set(1.0,0.36,0.4);tuft.position.set(0,rimF+0.02,tz-0.004);h.add(tuft);}
   {const sp=[];for(let i=0;i<=12;i++){const a=-0.5+i/12,th=Math.PI*0.5-0.045;sp.push(new T.Vector3(Math.sin(th)*Math.sin(a)*R[0]*CX*1.006,Math.cos(th)*R[1]*0.87*1.006,Math.sin(th)*Math.cos(a)*R[2]*1.085*1.006));}
    const st=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(sp),16,0.0065,6,false),dark);st.scale.set(1,0.8,1);/* r15: the strap is thin, cap-dark and recessed in the opening (no black band across the forehead) */st.position.copy(cr.position);st.rotation.copy(cr.rotation);h.add(st);}
   {const BL=0.45,BA=0.35;const sh=new T.Shape();sh.absarc(0,0,0.2,0,Math.PI,false);const bg=new T.ExtrudeGeometry(sh,{depth:0.018,bevelEnabled:true,bevelThickness:0.008,bevelSize:0.008,bevelSegments:2,curveSegments:16});
    const p=bg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x,y*BL,z-x*x*1.2-y*0.2*BL/0.85);}bg.computeVertexNormals();
    const b=new T.Mesh(bg,cm);b.position.set(0,rimB-0.004,-R[2]*1.085*Math.cos(CT)+0.02);b.rotation.set(-(Math.PI/2-BA)-(CT-0.12),0,0);b.castShadow=true;h.add(b);}/* the brim at the back, tipped up so it breaks the rear silhouette */
   /* round 5 (ChatGPT 39: watch draw calls): the cap was 13 meshes; parts sharing a material are baked into one mesh each (red shell: crown, button,
      arch bead, brim; dark: 6 seams + strap), 13 -> 4 draw calls (red, dark, the opening, the tuft) */
   {const byM=new Map();for(let i=n0;i<h.children.length;i++){const c=h.children[i];if(c.isMesh&&(c.material===cm||c.material===dark)){if(!byM.has(c.material))byM.set(c.material,[]);byM.get(c.material).push(c);}}
    for(const [mt,ms] of byM){if(ms.length<2)continue;const gs=ms.map(c=>{c.updateMatrix();const g=c.geometry.clone();g.deleteAttribute&&g.deleteAttribute('uv');g.applyMatrix4(c.matrix);return g;});const M=K.merge(gs);/* normals come across transformed by applyMatrix4 */
     const mm=new T.Mesh(M,mt);mm.castShadow=true;mm.receiveShadow=true;ms.forEach(c=>{h.remove(c);c.geometry.dispose();});gs.forEach(g=>g.dispose());h.add(mm);}}
   for(let i=n0;i<h.children.length;i++){h.children[i].userData.cap=true;h.children[i].userData.tag='cap';}
   /* the short hair below the rim, down to the hairline */
   K.seed(47);const cols=K.colsFrom(L.hairC||0x4a2a18),parts=[];
   const bot=K.HL([[0,1.6],[1.0,1.6],[-1.0,1.6],...K.sideHL(1,1.62,1.42,1.74),...K.sideHL(-1,1.62,1.42,1.74),[2.45,2.2],[-2.45,2.2],[2.9,2.3],[-2.9,2.3],[Math.PI-0.01,2.32]]);
   const top=ph=>(window.UNDER_T||1.05)+0.12*sm(1.6,3.0,Math.abs(K.wrap(ph)));/* r15: follows the raised rim (no skin gap at the temples) */parts.push(K.band(top,ph=>bot(ph),0.008,[1.15,2*Math.PI-1.15],40,6));
   for(const s of [1,-1])parts.push(K.loft([[1.45,s*1.2,-0.01],[1.6,s*1.3,0.01],[1.72,s*1.33,0.006]],u=>0.03,u=>0.008,6,8));
   K.done(h,parts,cols,{top:0.04,hiAmt:0.5},[0.45,0.12]);},
  /* hair28 r8/r15 Dazza's sculpted full beard on the v3 face (r15: chin -13%, 4 partings, shadow break under the moustache): one cheek-to-chin mass (5-8% R), mouth kept clear, moustache on top */
  beardL(h,L,K){K.seed(53);const sm=K.sm,dir=K.dir,FPd=v3FaceOf(L);const cols=L.beardC!=null&&L.beardC!==0x5a3420?K.colsFrom(L.beardC):{base:0x4A2A1C,shadow:0x24130b,hi:0x6F442F};const parts=[];const SGD=(window.TOPS_V3FLAG===true&&window.TOPS_SIG21!==0&&window.TOPS_SIG_DAZZA!==0);/* r21b (doc 57) Dazza signature: strand-textured beard, fuller at the jaw corners and chin, moustache tips curling up */
   const SF=(th,ph,k)=>{const p0=v3HeadPoint(dir(th,ph),FPd.cheek,FPd),p1=v3HeadPoint(dir(th+0.01,ph),FPd.cheek,FPd),p2=v3HeadPoint(dir(th,ph+0.01),FPd.cheek,FPd);
    const n=new T.Vector3().crossVectors(p1.clone().sub(p0),p2.clone().sub(p0)).normalize();if(n.dot(p0)<0)n.negate();return p0.addScaledVector(n,k);};
   const BD=window.BEARD_P||{},U=BD.U||(SGD?110:54),Vn=SGD?34:22,pos=[],idx=[],GV=[],SV=[],th1=2.95,ph0=-1.75,ph1=1.75;/* r15: 54 columns so the partings resolve */
   for(let j=0;j<=Vn;j++){const t=j/Vn;for(let i=0;i<=U;i++){const ph=ph0+(ph1-ph0)*i/U;const top=1.62+0.42*sm(1.3,0.5,Math.abs(ph)),th=top+(th1-top)*t;
     const inTop=sm(top,top+0.12,th),sideFade=sm(1.75,1.45,Math.abs(ph)),md=Math.hypot(ph/0.62,(th-2.36)/0.3),mouth=sm(1.0,1.25,md);
     let k=(0.01+0.01*sm(1.8,2.6,th))*inTop*sideFade*mouth;k*=SGD?1+(BD.chinUp!=null?BD.chinUp:0.22)*sm(2.4,2.85,th)*Math.exp(-((ph/0.7)**2))/* r21b: fuller chin beard (poster), was tapered -13% */:1-(BD.chin!=null?BD.chin:0.13)*sm(2.45,2.8,th)*Math.exp(-((ph/0.65)**2));/* r15: lower chin mass -13% */
     {let gv=0;for(const g0 of (BD.g||[-1.15,-0.42,0.42,1.15])){const pg=g0*(1-0.28*sm(1.85,2.85,th));gv=Math.max(gv,Math.exp(-(((ph-pg)/(BD.gw||0.145))**2)));}const gq=gv*sm(1.75,1.95,th);GV.push(gq);k*=1-(BD.gd!=null?BD.gd:0.58)*gq;}/* r15b: partings 17% shallower, 12% wider *//* r15: 4 partings curving in toward the chin: 3 broad front masses + the cheek breaks */
     k*=1-0.35*Math.exp(-(((th-2.13)/0.06)**2))*Math.exp(-((ph/0.6)**2));/* r15: shadow break under the moustache */if(SGD){k*=1+0.16*sm(2.25,2.7,th)*sm(0.5,0.9,Math.abs(ph));/* r21b: fuller at the jaw corners (poster: wider than the face) */const sc=ph*(1-0.28*sm(1.85,2.85,th))*30+0.8*Math.sin(th*7);const sv=0.5+0.5*Math.cos(sc*2);/* strand grooves following the partings' flow */k*=1-0.16*sm(0.006,0.012,k)*(1-sv);SV.push(sv);}else{k*=1+0.12*sm(0.006,0.012,k)*Math.sin(ph*26+th*9)*Math.sin(th*30);SV.push(0.5);}
     const q=SF(th,ph,k-0.005*(1-sm(0.0,0.005,k)));pos.push(q.x,q.y,q.z);}}
   for(let j=0;j<Vn;j++)for(let i=0;i<U;i++){const a=j*(U+1)+i,b=a+1,c=a+U+1,d=c+1;idx.push(a,c,b,b,c,d);}
   const mg=new T.BufferGeometry();mg.setAttribute('position',new T.Float32BufferAttribute(pos,3));mg.setIndex(idx);mg.computeVertexNormals();parts.push(mg);
   for(const s of [1,-1])parts.push(SGD?K.ribbon([[2.03,s*0.02,-0.002],[2.03,s*0.18,0.016],[2.07,s*0.34,0.016],[2.06,s*0.46,0.012],[1.97,s*0.56,0.006]].map(c=>SF(c[0],c[1],c[2])),u=>0.036*(1-0.55*u),u=>0.014*(1-0.4*u),14,9)/* r21b: tips curl up past the mouth corners */:K.ribbon([[2.03,s*0.02,-0.002],[2.03,s*0.18,0.015],[2.08,s*0.36,0.014],[2.18,s*0.5,0.004]].map(c=>SF(c[0],c[1],c[2])),u=>0.034*(1-0.4*u),u=>0.013,10,9));
   const pg=K.paint(K.merge(parts),SGD&&(L.beardC==null||L.beardC===0x5a3420)?{base:0x4e2c1c,shadow:0x1e0f08,hi:0x8a5638}/* r21b: richer beard colours (Dazza's own beard only) */:cols,{top:0.03,hiAmt:SGD?0.8:0.6});{const C=pg.attributes.color,DK=BD.dk!=null?BD.dk:0.45;/* r15b: 18% lighter */for(let i=0;i<GV.length;i++){const f=(1-DK*GV[i])*(SGD?0.72+0.42*SV[i]:1);/* r21b: strand grooves darker, ridges lighter */C.setXYZ(i,C.getX(i)*f,C.getY(i)*f,C.getZ(i)*f);}}/* r15: the partings read as soft shadowed breaks */
   const m=K.add(pg,K.mat(0.52,0.05),h);if(m){m.userData.tag='beard';m.material.side=T.DoubleSide;}},
  quiffL(h,L,K){const G=V2GROOVE,Q=G.KAI;const hl=K.HL([...Q.HLP,...K.sideHL(1,1.62,1.4,1.74),...K.sideHL(-1,1.64,1.4,1.76),[2.45,2.25],[-2.45,2.27],[2.9,2.36],[-2.85,2.33],[Math.PI-0.01,2.35]]);
   const OV=(window.TOPS_V3HAIRO||{}).kai||{},c0=L.hairC!=null&&L.hairC!==0x7a3e22&&L.hairC!==0x5a2e1a?K.colsFrom(L.hairC):Q.cols,R20=V3H20(),c=OV.cols&&c0===Q.cols?Object.assign({},c0,OV.cols):(R20&&c0===Q.cols?{base:0x5a3422,shadow:0x1f100a,hi:0xb0704a}:c0);G.groove(h,L,K,Q.M,Q.GL,c,hl,Object.assign({},Q.o,R20?{h20:true,r20:[.38,.3],valley:0.036}:{},OV.o));},/* r20 (doc 54): warm tan highlight, glossier, deeper valleys *//* r9 Kai lock shell (v3 heads; the player's own hair colour re-tints it) */
  quiff(h,L,K){K.seed(11);const cols={base:0x743823,shadow:0x3A1C12,hi:0xAC6542};const parts=[],W=K.W,loft=K.loft;
   const hl=K.HL([[0,1.0],[.32,.92],[-.38,.94],[.72,.92],[-.74,.93],...K.sideHL(1,1.62,1.4,1.74),...K.sideHL(-1,1.64,1.4,1.76),[2.45,2.25],[-2.45,2.27],[2.9,2.36],[-2.85,2.33],[Math.PI-.01,2.35]]);
   parts.push(K.cap(hl,.016,28,6));
   parts.push(loft([[1.04,.04,-.012],[.92,.06,.05],[.74,.08,.082],[.52,.12,.07],[.3,.25,.05],[.12,.9,.03]],u=>.108*(1-.45*u),W(.034,.06,.016),16,11));
   parts.push(loft([[.98,-.34,-.012],[.84,-.36,.03],[.64,-.48,.038],[.5,-.95,.03],[.6,-1.55,.012]],u=>.07*(1-.45*u),W(.022,.034,.01),12,9));
   parts.push(loft([[1.0,-.66,-.012],[.9,-.72,.022],[.84,-1.05,.026],[.95,-1.5,.016],[1.12,-1.9,.006]],u=>.058*(1-.45*u),W(.016,.026,.008),11,8));
   parts.push(loft([[.96,.44,-.012],[.84,.48,.03],[.68,.72,.034],[.62,1.2,.024],[.78,1.75,.008]],u=>.066*(1-.45*u),W(.02,.03,.01),11,8));
   for(const s of [1,-1]){parts.push(loft([[1.12,s*.92,-.008],[1.12,s*1.15,.016],[1.16,s*1.6,.018],[1.28,s*2.05,.012],[1.48,s*2.4,.003]],u=>.05*(1-.45*u),W(.012,.02,.006),10,8));
    parts.push(loft([[1.3,s*1.3,-.008],[1.33,s*1.5,.011],[1.44,s*1.9,.012],[1.66,s*2.3,.006],[1.86,s*2.55,0]],u=>.044*(1-.45*u),W(.01,.016,.005),9,8));}
   for(const [p0,w0,h0] of [[1.6,.1,.028],[2.15,.115,.031],[2.75,.125,.032],[-2.6,.12,.031],[-2.0,.105,.028]]){const pend=Math.PI*Math.sign(p0)-(Math.PI*Math.sign(p0)-p0)*.22;const pm=p0+(pend-p0)*.45;
    parts.push(loft([[.42,p0*.85,-.008],[.75,p0+.1*Math.sign(p0),h0*.85],[1.25,pm+.15*Math.sign(p0),h0],[1.75,pend,h0*.55],[2.12,pend,0]],u=>w0*(1-.45*u),W(h0*.65,h0*.72,.008),12,9));}
   /* Director's colours are Kai's; another wearer of the style keeps their own hair colour */
   K.done(h,parts,L.hairC!=null&&L.hairC!==0x7a3e22?K.colsFrom(L.hairC):cols,{top:.1,hiAmt:.75},[.4,.16]);},
  curly(h,L,K){K.seed(5);const cols={base:0x1F1A19,shadow:0x0A0909,hi:0x433934};const parts=[];
   const hl=K.HL([[0,1.0],[.3,1.04],[-.3,1.04],[.6,.98],[-.6,.98],[.9,1.08],[-.9,1.08],...K.sideHL(1,1.55,1.32,1.7),...K.sideHL(-1,1.58,1.32,1.7),[2.45,2.22],[-2.45,2.22],[2.85,2.3],[-2.9,2.28],[Math.PI-.01,2.32]]);
   parts.push(K.cap(hl,.02,28,6));
   const C=[[.92,0,.11,.034],[.94,.36,.1,.032],[.95,-.34,.1,.033],[.98,.7,.085,.026],[.99,-.72,.088,.027],[1.1,1.0,.07,.02],[1.1,-1.0,.072,.02],
    [.55,.15,.13,.04],[.6,-.5,.12,.038],[.62,.8,.12,.036],[.2,0,.14,.042],[.35,1.9,.13,.036],[.4,-1.55,.13,.037],[.42,2.9,.13,.036],[.65,-2.45,.12,.033],
    [1.1,1.45,.09,.022],[1.05,-1.4,.095,.024],[1.0,2.1,.11,.026],[.98,-2.0,.11,.026],[1.15,2.75,.11,.024],[1.2,-2.85,.11,.024],[1.55,2.35,.09,.014],[1.6,-2.4,.09,.014],[1.7,3.1,.1,.012],[1.4,1.8,.08,.014],[1.42,-1.75,.08,.014],[.85,2.55,.12,.03],[.85,-2.7,.12,.03],[1.3,3.05,.12,.026],[1.35,2.45,.11,.024],[1.35,-2.35,.11,.024],[1.25,2.0,.1,.022],[1.22,-2.05,.1,.022],[.75,1.45,.11,.03],[.78,-1.2,.11,.03]];
   for(let i=0;i<C.length;i++){const c=C[i];const front=i<7,rear=Math.abs(c[1])>1.9,top=c[0]<.5;
    const sz=c[2]*1.3*(c[0]>1.15?1.25:1)*(front?1.1:1)*(rear&&c[0]<1.2?.88:1),ht=c[3]*1.8*(top?.82:1)*(front?1.05:1);parts.push(...K.cluster(c[0],c[1]+(K.rnd()-.5)*.06,sz,ht,c[0]>1.15?2:0));}
   K.done(h,parts,L.hairC!=null&&L.hairC!==0x1a1210?K.colsFrom(L.hairC):cols,{top:.07,hiAmt:.85},[.58,.03]);}
 };
 const V2HAIRON=(()=>{try{const q=new URLSearchParams(location.search).get('v2hair');if(q==='1'||q==='0')localStorage.setItem('tops_v2hair',q);return localStorage.getItem('tops_v2hair')==='1';}catch(e){return false;}})();
 window.TOPS_V2HAIR={on:V2HAIRON,styles:V2HAIRS,kit:()=>V2HK()};
 function v2Hair(head,L,m){const R=V2P.head.r,mesh=v2mesh,ell=v2ell;let st=L.hair;if(st==='horseshoe')st='swept';if(st==='ponytail')st='bun';if(L.cap)st=st?'capped':null;
  {const key0=L.cap?(L.hair?'under':null):st,VM=Object.assign({},V3HAIRMAP,window.TOPS_V3HAIRMAP),key=L._v3&&VM[key0]?VM[key0]:key0;const fn=key&&(V2HAIRON||L._v3)&&((window.TOPS_V2HAIRS||{})[key]||V2HAIRS[key]);if(fn){try{fn(head,L,V2HK());if(!L.cap||L._v3)return;st=null;}catch(e){console.warn('v2 hair '+key,e);}}}
  const capG=new T.SphereGeometry(1,Math.round(24*S3_SEGF),12,0,Math.PI*2,0,Math.PI*.27);capG.scale(R[0]*1.06,R[1]*1.08,R[2]*1.07);
  const back=new T.SphereGeometry(1,Math.round(24*S3_SEGF),12,Math.PI*.95,Math.PI*1.1,0,Math.PI*.6);back.scale(R[0]*1.05,R[1]*1.06,R[2]*1.06);
  if(st&&st!=='swept'&&st!=='capped'){mesh(capG,m,head,0,.01,-.005);mesh(back,m,head,0,0,-.01);}
  if(st==='swept'){const b2=new T.SphereGeometry(1,Math.round(24*S3_SEGF),12,Math.PI*.95,Math.PI*1.1,Math.PI*.18,Math.PI*.42);b2.scale(R[0]*1.05,R[1]*1.06,R[2]*1.06);mesh(b2,m,head,0,0,-.01);}
  if(st&&st!=='bun'&&st!=='capped'&&st!=='buzz')[-1,1].forEach(s=>mesh(ell(.03,.07,.05,10,8),m,head,s*R[0]*.97,.02,.05));
  if(st==='buzz'){head.children[head.children.length-2].scale.set(.985,.985,.985);}
  if(st==='quiff')v2Blobs(head,m,[[0,.25,.12,.2,.13,.14,[-.6,0,0]],[.09,.27,.03,.17,.12,.14,[-.3,0,-.35]],[-.1,.26,.02,.16,.11,.14,[-.3,0,.35]],[0,.27,-.08,.19,.1,.15],[.16,.19,.13,.1,.08,.09],[-.17,.18,.13,.1,.08,.09],[.03,.3,.16,.1,.07,.08,[-.9,0,0]]]);
  if(st==='short')v2Blobs(head,m,[[0,.24,.06,.2,.08,.17,[-.25,0,0]],[.12,.2,.08,.1,.07,.1],[-.12,.2,.08,.1,.07,.1]]);
  if(st==='mullet')v2Blobs(head,m,[[0,.24,.06,.2,.08,.17,[-.25,0,0]],[0,-.12,-.2,.2,.16,.09,[.3,0,0]],[.15,-.1,-.15,.08,.14,.08],[-.15,-.1,-.15,.08,.14,.08]]);
  if(st==='bun')v2Blobs(head,m,[[0,.31,-.06,.1,.09,.1],[0,.2,.1,.18,.08,.12,[-.4,0,0]],[.17,.05,.12,.08,.14,.07,[0,0,-.25]],[-.17,.05,.12,.08,.14,.07,[0,0,.25]],[.22,-.1,.02,.07,.14,.08],[-.22,-.1,.02,.07,.14,.08]]);
  if(st==='curly'){const c=[];for(let i=0;i<64;i++){const a=i*2.399,y=1-(i/63)*1.2;const r=Math.sqrt(Math.max(0,1-y*y));if(Math.cos(a)*r>.55&&y<.55)continue;c.push([Math.sin(a)*r*R[0]*1.1,.03+y*R[1]*1.12,Math.cos(a)*r*R[2]*1.1,.058]);}v2Blobs(head,m,c.filter(b=>b[1]>-.06||b[2]<0));}
  if(st==='swept')v2Blobs(head,m,[[.02,.21,.08,.18,.07,.12,[-.3,0,-.2]],[-.1,.19,.1,.11,.06,.1],[.14,.16,.08,.1,.07,.1]]);
  if(L.cap){const cm=v2M(L.capC!=null?L.capC:(L.base==='dazza'?0xd21e28:(L.shirt==null?0xd21e28:L.shirt)),'trim');const cg=new T.SphereGeometry(1,Math.round(24*S3_SEGF),12,0,Math.PI*2,0,Math.PI*.5);cg.scale(R[0]*1.08,R[1],R[2]*1.08);mesh(cg,cm,head,0,.06,-.01);
   const bill=new T.CylinderGeometry(.2,.2,.02,Math.round(16*S3_SEGF),1,false,0,Math.PI);bill.scale(1,1,.75);const b=mesh(bill,cm,head,0,.08,-R[2]*.95);b.rotation.set(.15,Math.PI,0);mesh(new T.SphereGeometry(.025,10,8),cm,head,0,.06+R[1],-.01);if(L.hair)mesh(back,m,head,0,-.02,-.01);}}
 function v2Beard(head,kind,col){const R=V2P.head.r,m=v2M(0xffffff,'beard',{side:T.DoubleSide,vertexColors:true}),mm=v2M((()=>{const h=new T.Color(col).getHSL({});return new T.Color().setHSL(h.h,h.s*.95,Math.max(h.l,.3)*1.05).getHex();})(),'beard');const W=.5;
  /* Overseer 21:23: the beard read as one crushed near-black block. It is painted now (vertex colours, Director's hair method): darker at the
     roots and the thin edges, the base colour lifted, a warm highlight on the surfaces facing up and out, and soft vertical strand bands, so
     it has separated values like the poster's sculpted beard */
  const hsl=new T.Color(col).getHSL({}),hc=l=>{const c=new T.Color().setHSL(hsl.h,Math.min(1,hsl.s*.95),l);return window.GFX_LIN?c:c.convertSRGBToLinear();};const cB=hc(Math.max(hsl.l,.3)),cS=hc(Math.max(hsl.l,.3)*.5),cH=hc(Math.min(.62,Math.max(hsl.l,.3)+.2)),C=new T.Color(),nv=new T.Vector3();/* in sRGB lightness: base >= .30, roots half that, highlights +.2 */
  const shell=(p0,pl,t0,tl,mx)=>{const g=new T.SphereGeometry(1,Math.round(20*S3_SEGF),12,p0,pl,t0,tl);const p=g.attributes.position;const v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const th=Math.acos(Math.max(-1,Math.min(1,v.y)));const ph=Math.atan2(v.z,-v.x);
    const lo=Math.max(0,(th-Math.PI*.55)/(Math.PI*.45));const side=Math.min(Math.abs(ph),Math.abs(Math.PI-ph))/(Math.PI/2);const edge=Math.min(1,Math.min(th-t0,t0+tl-th)/.12,Math.min(Math.abs(ph-p0),Math.abs(p0+pl-ph))/.12);
    const thick=(.01+mx*Math.sin(Math.min(1,lo*1.5)*Math.PI/2)*(.6+.4*side))*Math.max(.25,Math.min(1,edge));p.setXYZ(i,v.x*(R[0]+thick),v.y*(R[1]+thick*1.2),v.z*(R[2]+thick));}g.computeVertexNormals();
    {const n=g.attributes.normal,cols=[];for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);nv.fromBufferAttribute(n,i);const th=Math.acos(Math.max(-1,Math.min(1,v.y/(R[1]+.06))));const ph=Math.atan2(v.z,-v.x);const dep=Math.min(1,Math.max(0,(Math.hypot(v.x/R[0],v.y/R[1],v.z/R[2])-1)*R[1]/Math.max(.012,mx)));
     const strand=.86+.14*Math.sin(ph*26+Math.sin(th*9)*1.3);const up=Math.max(0,nv.y*.6+nv.z*.5+.1);C.copy(cS).lerp(cB,Math.min(1,.25+.85*dep)*strand);C.lerp(cH,Math.min(.55,up*.55*dep));cols.push(C.r,C.g,C.b);}g.setAttribute('color',new T.Float32BufferAttribute(cols,3));}
    return v2mesh(g,m,head,0,0,.004);};
  if(kind==='full'||kind==='stubble'){const mx=kind==='stubble'?.004:.055;shell(0,Math.PI/2-W,Math.PI*.56,Math.PI*.44,mx);shell(Math.PI/2+W,Math.PI/2-W,Math.PI*.56,Math.PI*.44,mx);shell(Math.PI/2-W-.02,2*W+.04,Math.PI*.8,Math.PI*.2,mx);}
  if(kind==='goatee')shell(Math.PI/2-W*.6,W*1.2,Math.PI*.8,Math.PI*.2,.045);
  if(kind==='full'||kind==='goatee'||kind==='walrus')v2Blobs(head,mm,[[-.07,-R[1]*.47,R[2]*.87,.075,.03,.04,[0,0,.3]],[.07,-R[1]*.47,R[2]*.87,.075,.03,.04,[0,0,-.3]]]);}
 /* Vinyl v2 hands (Hayden 14:57): 4 separate chunky fingers + a thumb on each hand, riding the skeleton's finger bones (lengthened 1.6x for toy
    proportions), so the game's own finger poses wrap them round the dart in the throw and the clips open them when relaxed. All 30 finger
    segments of a figure are ONE skinned mesh (rigid weights, 1 draw call), 8-sided capsules so phones don't pay for them. */
 function v2Fingers(fig,B,rig,k){const sides=['Right','Left'],F=['Index','Middle','Ring','Pinky'];const fem=rig.fem,hk=rig.handK||1;fig.updateMatrixWorld(true);
  sides.forEach(sd=>{F.forEach((f,fi)=>{for(let j=1;j<=4;j++){const b=B[sd+'Hand'+f+j];if(!b)continue;b.position.multiplyScalar((j===1?1.15:1.6)*hk);}const b1=B[sd+'Hand'+f+'1'];if(b1)b1.position.x*=(rig.v3&&window.TOPS_HANDS19!==0?(window.TOPS_HAND_SPREAD||1.02):1.25);});/* r19 (doc 52): fingers side by side (mitten) on v3 figures */for(let j=1;j<=4;j++){const b=B[sd+'HandThumb'+j];if(b)b.position.multiplyScalar((j===1?1.2:1.55)*hk);}});
  fig.updateMatrixWorld(true);const bones=[],pos=[],nor=[],si=[],sw=[],idx=[];const fi=new T.Matrix4().copy(fig.matrixWorld).invert();const up=new T.Vector3(0,-1,0),tmpQ=new T.Quaternion(),tmpM=new T.Matrix4(),nm=new T.Matrix3();
  const seg=(bone,child,rW)=>{if(!bone||!child)return;let bi=bones.indexOf(bone);if(bi<0){bi=bones.length;bones.push(bone);}const len=child.position.length();if(len<1e-5)return;const bs=bone.getWorldScale(new T.Vector3()).x||1;const r=rW/bs;
   const g=v2cap(r,r*.9,len+r*.6,8);/* along -y from 0 to -len */const dir=child.position.clone().normalize();tmpQ.setFromUnitVectors(up,dir);const m=new T.Matrix4().compose(new T.Vector3(0,0,0),tmpQ,new T.Vector3(1,1,1));
   const toFig=new T.Matrix4().copy(fi).multiply(bone.matrixWorld).multiply(m);nm.getNormalMatrix(toFig);const base=pos.length/3;const p=g.attributes.position,n=g.attributes.normal,v=new T.Vector3(),nv=new T.Vector3();
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(toFig);nv.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();pos.push(v.x,v.y,v.z);nor.push(nv.x,nv.y,nv.z);si.push(bi,0,0,0);sw.push(1,0,0,0);}
   const ix=g.index.array;for(let i=0;i<ix.length;i++)idx.push(base+ix[i]);g.dispose();};
  const H19=!!rig.v3&&window.TOPS_HANDS19!==0;const rr=(fem?.9:1)*.026*k*hk*(H19?(window.TOPS_FINGER_K||1.22):1);/* r19: fingers +22% thicker (v3 only) */sides.forEach(sd=>{F.forEach((f,fi2)=>{const rf=rr*(fi2===3?.85:1);for(let j=1;j<=3;j++)seg(B[sd+'Hand'+f+j],B[sd+'Hand'+f+(j+1)]||null,rf*(j===3?.92:1));if(!B[sd+'Hand'+f+'4']){const b3=B[sd+'Hand'+f+'3'];if(b3)seg(b3,{position:B[sd+'Hand'+f+'2'].position.clone().multiplyScalar(.8)},rf*.92);}});
   for(let j=1;j<=3;j++)seg(B[sd+'HandThumb'+j],B[sd+'HandThumb'+(j+1)]||(j===3?{position:B[sd+'HandThumb2'].position.clone().multiplyScalar(.8)}:null),rr*1.05*(H19?(window.TOPS_THUMB_K||1.15)/(window.TOPS_FINGER_K||1.22):1));});/* r19: thumb +15% */
  if(!bones.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(idx);
  const mat=rig.skinM.clone();mat.skinning=true;mat.userData.s3v=true;const sm=new T.SkinnedMesh(g,mat);sm.name='v2fingers';sm.frustumCulled=false;sm.castShadow=false;fig.add(sm);sm.updateMatrixWorld(true);sm.bind(new T.Skeleton(bones),sm.matrixWorld);sm.userData.tag='fingers';sm.userData.s3keep=true;}
 function s3Dress(fig,B,L){const p_=V2ENV3;V2ENV3=!!(S3_V2&&v3Want(L));try{return s3DressI(fig,B,L);}finally{V2ENV3=p_;}}/* doc 58: a v3 figure's materials are tagged as they're made (the venue rig lights v3 figures only) */
function s3DressI(fig,B,L){const rig=S3_V2?(v3Want(L)?s3BuildV3(L):s3BuildV2(L)):s3Build(L);rig.root.updateMatrixWorld(true);fig.updateMatrixWorld(true);
  const W=o=>o.getWorldPosition(new T.Vector3());const fi=new T.Matrix4().copy(fig.matrixWorld).invert();const F=o=>W(o).applyMatrix4(fi);/* fig space */
  const facePlus=F(B.LeftUpLeg).x>F(B.RightUpLeg).x;const Rf=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),facePlus?0:Math.PI);
  const k=.93*F(B.Head).y/W(rig.head).y;/* a touch smaller than the old figures: the toy head is 1.4x, and the match cameras frame a lifelike head */const lab=o=>W(o).applyQuaternion(Rf).multiplyScalar(k);/* Lab joint -> fig space */
  const setF=(bone,p)=>{bone.parent.updateMatrixWorld(true);const pm=new T.Matrix4().copy(fig.matrixWorld).multiply(new T.Matrix4().copy(fi).multiply(bone.parent.matrixWorld));const inv=new T.Matrix4().copy(bone.parent.matrixWorld).invert();bone.position.copy(p.clone().applyMatrix4(fig.matrixWorld).applyMatrix4(inv));bone.updateMatrixWorld(true);};
  const setLen=(bone,len)=>{const d=bone.position.length();if(d>1e-5)bone.position.multiplyScalar(len/d);bone.updateMatrixWorld(true);};
  /* joints: the trunk and the limb roots go where the Lab has them; the limb segments keep the skeleton's directions, Lab lengths */
  setF(B.Hips,lab(rig.hips));setF(B.Spine2,lab(rig.chest));setF(B.Neck,lab(rig.neck));setF(B.Head,lab(rig.head));
  [[rig.aL,'Right'],[rig.aR,'Left']].forEach(([a,s])=>{setF(B[s+'Arm'],lab(a.sh));setLen(B[s+'ForeArm'],W(a.sh).distanceTo(W(a.el))*k/(B[s+'Arm'].getWorldScale(new T.Vector3()).y||1));setLen(B[s+'Hand'],W(a.el).distanceTo(W(a.wr))*k);});
  [[rig.lL,'Right'],[rig.lR,'Left']].forEach(([l,s])=>{setF(B[s+'UpLeg'],lab(l.th));setLen(B[s+'Leg'],W(l.th).distanceTo(W(l.kn))*k);setLen(B[s+'Foot'],W(l.kn).distanceTo(W(l.an))*k);});
  fig.updateMatrixWorld(true);
  const front=new T.Vector3(0,0,facePlus?1:-1),qtmp=new T.Quaternion();
  /* the rotation taking the Lab's down (-y) to dir and the Lab's front (+z) as close to the figure's front as it can be */
  const along=(dir)=>{const a=dir.clone().normalize();const f=front.clone().addScaledVector(a,-front.dot(a));if(f.lengthSq()<1e-6)f.set(1,0,0).addScaledVector(a,-a.x);f.normalize();const x=new T.Vector3().crossVectors(a.clone().negate(),f);/* lab basis: x, y=-a, z=f */const m=new T.Matrix4().makeBasis(x,a.clone().negate(),f);return new T.Quaternion().setFromRotationMatrix(m);};
  const parts=[[rig.hips,B.Hips,null],[rig.chest,B.Spine2,null],[rig.neck,B.Neck,null],[rig.head,B.Head,null]];
  [[rig.aL,'Right'],[rig.aR,'Left']].forEach(([a,s])=>{const up=F(B[s+'ForeArm']).sub(F(B[s+'Arm'])),fo=F(B[s+'Hand']).sub(F(B[s+'ForeArm']));parts.push([a.sh,B[s+'Arm'],along(up)],[a.el,B[s+'ForeArm'],along(fo)],[a.wr,B[s+'Hand'],along(fo)]);});
  [[rig.lL,'Right'],[rig.lR,'Left']].forEach(([l,s])=>{const th=F(B[s+'Leg']).sub(F(B[s+'UpLeg'])),sh=F(B[s+'Foot']).sub(F(B[s+'Leg']));parts.push([l.th,B[s+'UpLeg'],along(th)],[l.kn,B[s+'Leg'],along(sh)],[l.an,B[s+'Foot'],along(sh)]);});
  const pivots=new Set([rig.root,rig.hips,rig.spine,rig.chest,rig.neck,rig.head,rig.aL.sh,rig.aL.el,rig.aL.wr,rig.aR.sh,rig.aR.el,rig.aR.wr,rig.lL.th,rig.lL.kn,rig.lL.an,rig.lR.th,rig.lR.kn,rig.lR.an]);
  const figQ=fig.getWorldQuaternion(new T.Quaternion());
  for(const [P,bone,Ra] of parts){if(!bone)continue;const kids=P.children.filter(c=>!pivots.has(c));if(!kids.length)continue;
   const box=new T.Group();box.name='s3part';bone.add(box);P.userData.box=box;
   /* desired world frame of the Lab pivot's content: at the bone, Lab rotation (Rf, or along the limb), Lab scale x k (incl. the pivot's own scale) */
   const ps=P.getWorldScale(new T.Vector3());const q=(Ra||Rf).clone();const wq=figQ.clone().multiply(q);
   const bq=bone.getWorldQuaternion(new T.Quaternion()),bs=bone.getWorldScale(new T.Vector3());
   box.quaternion.copy(bq.invert().multiply(wq));box.scale.set(k*ps.x/bs.x,k*ps.y/bs.y,k*ps.z/bs.z);
   kids.forEach(c=>box.add(c));}
  /* draw calls: the Lab figure is ~60 small meshes; inside each bone box the opaque, childless meshes that share a look (same material
     settings and tag) are merged into one, so a figure is ~25 draws. The skinned shirt and hem band stay separate. */
  /* collar stand: the Lab sits it on the chest, but the game's clips bend the neck forward off the chest (idle, breathe), which opened an
     8-9 mm gap at the back of the collar (tests/s3-clip-game.js). It rides on the neck box instead, so it hugs the neck in every clip. */
  {const cb=rig.chest.userData.box,nb=rig.neck.userData.box;if(cb&&nb){fig.updateMatrixWorld(true);cb.children.filter(o=>o.userData.tag==='collar').forEach(o=>nb.attach(o));}}
  {const skinSet=new Set(rig.SKIN);fig.traverse(o=>{if(o.name==='s3part')s3Merge(o,skinSet);});}
  fig.traverse(o=>{if(o.isSkinnedMesh)o.visible=false;});fig.userData.s3fig=true;fig.userData.s3look=L;if(rig.v2){fig.userData.s3v2=true;try{v2Fingers(fig,B,rig,k);}catch(e){console.warn('v2 fingers',e);}}
  /* shirt skin (Lab skinShirt): bind = the hips->chest frame at rest; each frame the lower shirt blends to follow the hips */
  fig.updateMatrixWorld(true);{const cb=rig.chest.userData.box,hb=rig.hips.userData.box;if(cb&&hb){rig.bind=new T.Matrix4().copy(hb.matrixWorld).invert().multiply(cb.matrixWorld);fig.userData.s3rig=rig;
   rig.SKIN.forEach(o=>{o.userData.base=o.geometry.attributes.position.array.slice();o.onBeforeRender=()=>{S3SKINF.add(fig);};});S3SKINF.add(fig);}}
  return rig;}
 function s3MatKey(m){return [m.type,m.color&&m.color.getHex(),m.roughness,m.clearcoat||0,m.side,m.metalness,m.flatShading?1:0].join('|');}
 function s3Merge(box,skip){const groups=new Map();box.updateMatrix();
  box.children.slice().forEach(o=>{if(!o.isMesh||o.children.length||skip.has(o)||Array.isArray(o.material)||o.material.transparent||o.material.map||o.onBeforeRender!==T.Object3D.prototype.onBeforeRender)return;
   const k=s3MatKey(o.material)+'|'+(o.userData.tag||'');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
  for(const list of groups.values()){if(list.length<2)continue;let n=0;const parts=list.map(o=>{o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);if(!g.attributes.normal)g.computeVertexNormals();n+=g.attributes.position.count;return g;});
   /* painted parts (vertex colours: the v2 beard, kit hair) keep their colours through the merge */
   const hasC=parts.every(g=>g.attributes.color&&g.attributes.color.itemSize===3);const pos=new Float32Array(n*3),nor=new Float32Array(n*3),cl=hasC?new Float32Array(n*3):null;let at=0;parts.forEach(g=>{pos.set(g.attributes.position.array,at*3);nor.set(g.attributes.normal.array,at*3);if(cl)cl.set(g.attributes.color.array,at*3);at+=g.attributes.position.count;g.dispose();});
   const mg=new T.BufferGeometry();mg.setAttribute('position',new T.BufferAttribute(pos,3));mg.setAttribute('normal',new T.BufferAttribute(nor,3));if(cl)mg.setAttribute('color',new T.BufferAttribute(cl,3));mg.computeBoundingSphere();
   const mm=new T.Mesh(mg,list[0].material);mm.castShadow=mm.receiveShadow=true;if(list[0].userData.tag)mm.userData.tag=list[0].userData.tag;box.add(mm);
   list.forEach(o=>{box.remove(o);o.geometry.dispose();if(o.material!==list[0].material)o.material.dispose();});}}
 /* the Lab's skinShirt, on the game figure: runs once per frame before any scene render (scene.onBeforeRender), for every S3 figure in a scene */
 const S3SKINF=new Set();let s3SkinT=-1;const _s3Mr=new T.Matrix4(),_s3K=new T.Matrix4(),_s3Ki=new T.Matrix4(),_s3v=new T.Vector3(),_s3u=new T.Vector3(),_s3Mi=new T.Matrix4(),_s3w=new T.Vector3(),_s3c=new T.Vector3(),_s3ab=new T.Vector3(),_s3dv=new T.Vector3(),_s3sc=new T.Vector3();
 function s3InScene(o){while(o.parent)o=o.parent;return !!o.isScene;}
 function s3SkinFig(fig){const R=fig.userData.s3rig;if(!R||!fig.visible)return;const cb=R.chest.userData.box,hb=R.hips.userData.box;if(!cb||!hb)return;
  _s3Mr.copy(cb.matrixWorld).invert().multiply(hb.matrixWorld).multiply(R.bind);
  const TH=(R.thighs||[]).map(([th,r,len])=>{const bx=th.userData.box;if(!bx)return null;const a=new T.Vector3().setFromMatrixPosition(bx.matrixWorld),bb=new T.Vector3(0,-len,0).applyMatrix4(bx.matrixWorld);const kw=_s3sc.setFromMatrixScale(bx.matrixWorld).x;return [a,bb,r*kw,.006*kw];}).filter(Boolean);
  R.SKIN.forEach(o=>{const g=o.geometry,p=g.attributes.position,b=o.userData.base;if(!b)return;o.updateMatrix();_s3K.copy(o.matrix);_s3Ki.copy(o.matrix).invert();
   const K=_s3Ki.multiply(_s3Mr).multiply(_s3K);
   for(let i=0;i<p.count;i++){_s3v.set(b[3*i],b[3*i+1],b[3*i+2]);const y=_s3v.y;const Y0=R.skinY?R.skinY[0]:-.1,Y1=R.skinY?R.skinY[1]:-.3;const q=(Y0-y)/(Y0-Y1);const w=y>Y0?0:y<Y1?1:q*q*(3-2*q);if(w<=0){p.setXYZ(i,_s3v.x,_s3v.y,_s3v.z);continue;}_s3u.copy(_s3v).applyMatrix4(K);p.setXYZ(i,_s3v.x+(_s3u.x-_s3v.x)*w,_s3v.y+(_s3u.y-_s3v.y)*w,_s3v.z+(_s3u.z-_s3v.z)*w);}
   if(TH.length){o.updateMatrixWorld(true);const Mw=o.matrixWorld;_s3Mi.copy(Mw).invert();
    for(let i=0;i<p.count;i++){if(b[3*i+1]>(R.skinY?R.skinY[2]:-.2))continue;_s3w.fromBufferAttribute(p,i).applyMatrix4(Mw);let moved=false;for(const [a,bb,r,pad] of TH){_s3ab.subVectors(bb,a);const tt=Math.max(0,Math.min(1,_s3c.subVectors(_s3w,a).dot(_s3ab)/_s3ab.lengthSq()));_s3c.copy(a).addScaledVector(_s3ab,tt);_s3dv.subVectors(_s3w,_s3c);const dl=_s3dv.length(),need=r+pad;if(dl<need&&dl>1e-5){_s3w.copy(_s3c).addScaledVector(_s3dv,need/dl);moved=true;}}if(moved){_s3w.applyMatrix4(_s3Mi);p.setXYZ(i,_s3w.x,_s3w.y,_s3w.z);}}}
   p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();});}
 function s3SkinAll(){const t=performance.now();if(t-s3SkinT<4)return;s3SkinT=t;for(const f of S3SKINF){if(!s3InScene(f)){S3SKINF.delete(f);continue;}f.updateMatrixWorld(true);if(f.userData.s3v2&&!(f.userData.fpv&&f.userData.fpvNow!==false))try{v2PostClear(f,null,true);}catch(e){if(!v2PostClear.w){v2PostClear.w=1;console.warn('v2 clear',e);}}try{s3SkinFig(f);}catch(e){S3SKINF.delete(f);}}}
 /* the Lab's clipCheck (Director, s3-clip.js) on a game figure in a game pose: depth of every inner vertex under its cover, in Lab units
    (the frames are the Lab pivots' boxes on the bones). Test-only: tests/s3-clip.js runs it over the match clips. */
 function s3Clip(fig){const R=fig.userData.s3rig;if(!R)return null;fig.updateMatrixWorld(true);s3SkinFig(fig);fig.updateMatrixWorld(true);
  const out={pants:0,arm:0,cuff:0,collar:0,trim:0,checked:0,worst:{},ex:[]};const bx=pv=>pv.userData.box;const chest=bx(R.chest),hips=bx(R.hips);const kw=new T.Vector3().setFromMatrixScale(chest.matrixWorld).x;
  const byTag=t=>{const r=[];fig.traverse(o=>{if(o.isMesh&&o.userData.tag===t)r.push(o);});return r;};
  const prox=o=>{const m=new T.Mesh(o.geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));m.matrixWorld.copy(o.matrixWorld);m.matrixAutoUpdate=false;return m;};
  const rc=new T.Raycaster(),p=new T.Vector3(),l=new T.Vector3(),ax=new T.Vector3(),d=new T.Vector3(),inv=new T.Matrix4(),Y=new T.Vector3();
  const depth=(p,frame,covers)=>{inv.copy(frame.matrixWorld).invert();l.copy(p).applyMatrix4(inv);ax.set(0,l.y,0).applyMatrix4(frame.matrixWorld);d.copy(p).sub(ax);const dist=d.length();if(dist<1e-4)return 1;d.normalize();Y.set(0,1,0).transformDirection(frame.matrixWorld);rc.far=dist+.5*kw;let h=[];for(const j of [0,.004,-.004,.009]){rc.set(ax,d.clone().applyAxisAngle(Y,j));h=rc.intersectObjects(covers,false);if(h.length)break;}if(!h.length)return -1;return (h[h.length-1].distance-dist)/kw;};
  const verts=(o,fn)=>{const g=o.geometry.attributes.position;for(let i=0;i<g.count;i++){p.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld);fn(p);}};
  const worst=(k,v)=>{out.worst[k]=Math.min(out.worst[k]??1,v);};const ex=(k,dp)=>{if(out.ex.length<8)out.ex.push(k+' d='+dp.toFixed(4));};
  const pole=(q,fr)=>{inv.copy(fr.matrixWorld).invert();const u=q.clone().applyMatrix4(inv);return Math.hypot(u.x,u.z)<.006;};
  const shirt=byTag('shirt').map(prox);const hipsI=new T.Matrix4().copy(hips.matrixWorld).invert();
  byTag('pants').forEach(o=>verts(o,q=>{const y=l.copy(q).applyMatrix4(hipsI).y;if(y<-.098||y>.3)return;if(pole(q,chest))return;out.checked++;const dp=depth(q,chest,shirt);worst('pants',dp);if(dp<.001){out.pants++;ex('pants',dp);}}));
  [R.aL,R.aR].forEach(A=>{const sb=bx(A.sh);if(!sb)return;const sl=sb.children.filter(o=>o.userData.tag==='sleeve').map(prox);
   sb.children.forEach(o=>{if(o.userData.tag==='upperarm')verts(o,q=>{inv.copy(sb.matrixWorld).invert();const y=l.copy(q).applyMatrix4(inv).y;if(y<-.158)return;if(pole(q,sb))return;out.checked++;const dp=depth(q,sb,sl);worst('arm',dp);if(dp<.0008){out.arm++;ex('arm',dp);}});
    if(o.userData.tag==='cuff')verts(o,q=>{out.checked++;const dp=depth(q,sb,sl);worst('cuff',-dp);if(dp>-.0008)out.cuff++;});});});
  ['fold','placket'].forEach(tg=>byTag(tg).forEach(o=>verts(o,q=>{if(pole(q,chest))return;out.checked++;const dp=depth(q,chest,shirt);worst('trim',-dp);if(dp>-.0005){out.trim++;ex(tg,dp);}})));
  const nk=byTag('neck').map(prox);byTag('collar').forEach(o=>verts(o,q=>{out.checked++;const dp=depth(q,chest,nk);worst('collar',-Math.abs(dp));if(-dp>.008){out.collar++;ex('collar',dp);}}));
  return out;}
 /* Vinyl v2 relations (Director spec 11: "tests/s3-clip-game.js still 0"): the v2 build has no neck, a ring cuff and a lathe torso, so the
    v1 checks don't apply as written. Checked instead, in every clip: trousers above the hem stay under the shirt (pants), the upper arm stays
    under the puffed sleeve (arm), the skull never sinks into the shirt (head: no neck, so a nod could push it in), the fists never go inside
    the torso (fist). Depths in v2 units (metres at k=1). */
 function s3ClipV2(fig){const R=fig.userData.s3rig;fig.updateMatrixWorld(true);/* as drawn: s3SkinAll runs the v2 head clearance, then the shirt skin */let perr=null;try{v2PostClear(fig,null,true);}catch(e){perr=String(e);}try{s3SkinFig(fig);}catch(e){}fig.updateMatrixWorld(true);const out={pants:0,arm:0,head:0,fist:0,checked:0,worst:{},ex:[],cuff:0,collar:0,trim:0};if(perr){out.skull=1;out.ex.push('v2PostClear threw: '+perr);}const bx=pv=>pv.userData.box;const chest=bx(R.chest),hips=bx(R.hips);if(!chest||!hips)return out;const kw=new T.Vector3().setFromMatrixScale(chest.matrixWorld).x;
  const byTag=t=>{const r=[];fig.traverse(o=>{if(o.isMesh&&o.userData.tag===t)r.push(o);});return r;};const prox=o=>{const m=new T.Mesh(o.geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));m.matrixWorld.copy(o.matrixWorld);m.matrixAutoUpdate=false;return m;};
  const rc=new T.Raycaster(),p=new T.Vector3(),l=new T.Vector3(),ax=new T.Vector3(),d=new T.Vector3(),inv=new T.Matrix4(),Y=new T.Vector3();
  const depth=(p,frame,covers)=>{inv.copy(frame.matrixWorld).invert();l.copy(p).applyMatrix4(inv);ax.set(0,l.y,0).applyMatrix4(frame.matrixWorld);d.copy(p).sub(ax);const dist=d.length();if(dist<1e-4)return 1;d.normalize();Y.set(0,1,0).transformDirection(frame.matrixWorld);rc.far=dist+.6*kw;rc.set(ax,d);const h=rc.intersectObjects(covers,false);if(!h.length)return -1;return (h[h.length-1].distance-dist)/kw;};
  const verts=(o,step,fn)=>{const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=step){p.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld);fn(p);}};const worst=(k,v)=>{out.worst[k]=Math.min(out.worst[k]??1,v);};const ex=(k,dp)=>{if(out.ex.length<8)out.ex.push(k+' d='+dp.toFixed(4));};
  const shirt=byTag('shirt').map(prox);const ci=new T.Matrix4().copy(chest.matrixWorld).invert();const PP=R.P||V2P,yHem=(PP.torso.y0-PP.leg.hipY-.3)+.03,yTop=.2;/* chest-local: hem at -0.3, collar at +0.25 */
  /* seated (the bar extras' sit / sittalk): a thigh bent forward past 50 degrees leaves the shirt by design, its top is the lap; s3SkinFig
     pushes the shirt off the thigh where they meet, so those thigh vertices are not a poke-through */
  const cdn=new T.Vector3(0,-1,0).transformDirection(chest.matrixWorld),lap=o=>{if(o.parent===hips)return false;const td=new T.Vector3(0,-1,0).transformDirection(o.matrixWorld);return td.dot(cdn)<Math.cos(50*Math.PI/180);};
  byTag('pants').forEach(o=>{if(lap(o)){out.lap=(out.lap||0)+1;return;}verts(o,1,q=>{const y=l.copy(q).applyMatrix4(ci).y;if(y<yHem||y>yTop)return;out.checked++;const dp=depth(q,chest,shirt);worst('pants',dp);if(dp<.001&&dp>-1){out.pants++;ex('pants'+(o.parent===hips?'(crotch)':'(thigh)')+' y='+y.toFixed(3),dp);}});});
  [R.aL,R.aR].forEach(A=>{const sb=bx(A.sh);if(!sb)return;const sl=sb.children.filter(o=>o.userData.tag==='sleeve').map(prox);const si=new T.Matrix4().copy(sb.matrixWorld).invert();
   sb.children.forEach(o=>{if(o.userData.tag==='upperarm')verts(o,1,q=>{const y=l.copy(q).applyMatrix4(si).y;if(y<-.1||y>-.0)return;const u=l.clone();if(Math.hypot(u.x,u.z)<.004)return;out.checked++;const dp=depth(q,sb,sl);worst('arm',dp);if(dp<.0008&&dp>-1){out.arm++;ex('arm',dp);}});});});
  /* skull vs shirt: a skull vertex at a height the shirt spans must be outside it (the ray from the torso axis reaches the shirt first) */
  byTag('skull').forEach(o=>verts(o,3,q=>{const y=l.copy(q).applyMatrix4(ci).y;if(y>.22||y<yHem)return;out.checked++;const dp=depth(q,chest,shirt);if(dp>.002){out.head++;ex('head',dp);}worst('head',-dp);}));
  /* fists vs torso: no fist vertex inside the shirt */
  [R.aL,R.aR].forEach(A=>{const wb=bx(A.wr);if(!wb)return;wb.children.forEach(o=>verts(o,4,q=>{const y=l.copy(q).applyMatrix4(ci).y;if(y>.22||y<yHem)return;out.checked++;const dp=depth(q,chest,shirt);if(dp>.01){out.fist++;ex('fist y='+y.toFixed(3)+' xz='+l.x.toFixed(3)+','+l.z.toFixed(3),dp);}/* a fist resting on the belly (up to 1 cm) reads fine on a toy; deeper is a clip */worst('fist',-dp);}));});
  {const dc=s3DartClear(fig);out.dart=dc.n+(dc.tn||0);out.checked+=dc.checked;out.worst.dart=-dc.mm/1000;if(dc.n&&out.ex.length<8)out.ex.push('dart in '+dc.where+' '+dc.mm.toFixed(1)+'mm');}
  {const hc=s3HeadClear(fig);out.skull=hc.n;out.checked+=hc.checked;out.worst.skull=-hc.mm/1000;if(hc.n&&out.ex.length<8)out.ex.push('skull '+hc.where+' '+hc.mm.toFixed(1)+'mm');}
  return out;}
 /* Vinyl v2.2 (Director's v2-clear.js on the game rig): no arm, sleeve, fist or finger vertex inside the skull ellipsoid (radii x1.04, the
    margin Director's check uses). Measured in the skull mesh's own space, so the figure's scale and the head bone's pose are both in it.
    n = vertices inside; mm = the deepest one, in metres x1000 at the figure's scale */
 function s3HeadClear(fig){const R=fig.userData.s3rig,out={n:0,mm:0,checked:0,where:''};if(!R||!R.v2)return out;fig.updateMatrixWorld(true);let sk=null;fig.traverse(o=>{if(!sk&&o.isMesh&&o.userData.tag==='skull')sk=o;});if(!sk)return out;
  const r=V2P.head.r,M0=1.04,SF=R.skullF,inv=new T.Matrix4().copy(sk.matrixWorld).invert(),ws=new T.Vector3().setFromMatrixScale(sk.matrixWorld).x,p=new T.Vector3(),l=new T.Vector3();
  const test=(q,where)=>{out.checked++;l.copy(q).applyMatrix4(inv);const e=Math.hypot(l.x/r[0],l.y/r[1],l.z/r[2]),M=SF?M0*SF(l):M0;if(e<M){const mm=(M-e)*Math.min(r[0],r[1],r[2])*ws*1000;out.n++;if(mm>out.mm){out.mm=mm;out.where=where;}}};
  [['L',R.aR],['R',R.aL]].forEach(([sd,A])=>[['sh','arm'],['el','forearm'],['wr','hand']].forEach(([k,nm])=>{const pv=A&&A[k],b=pv&&pv.userData.box;if(!b)return;b.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=2){p.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld);test(p,sd+' '+(o.userData.tag||nm));}});}));
  fig.traverse(o=>{if(!o.isSkinnedMesh||o.userData.tag!=='fingers')return;const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=2){p.fromBufferAttribute(g,i);o.boneTransform(i,p);p.applyMatrix4(o.matrixWorld);test(p,'fingers');}});
  return out;}
 window.TOPS_S3HEADCLEAR=s3HeadClear;
 /* P1 4.05: no dart vertex (the spares in the off hand, the dart in the throwing hand) inside its own arm: the forearm (elbow to wrist) and the
    upper arm, as capsules of the v2 arm's radii at the figure's scale. n = vertices inside, mm = the deepest. ang = the smallest angle (deg)
    between a spare and its forearm (the spares sit square to it) */
 function s3DartClear(fig,opt){const u=fig.userData,R3=u.s3rig,B=u.B,out={n:0,mm:0,checked:0,where:'',ang:90};if(!R3||!R3.v2||!B)return out;fig.updateMatrixWorld(true);
  const p=new T.Vector3(),q=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
  const seg=(P,A,Bp,r,where)=>{q.subVectors(Bp,A);const t=Math.max(0,Math.min(1,c.subVectors(P,A).dot(q)/Math.max(1e-9,q.lengthSq())));const d=c.copy(A).addScaledVector(q,t).distanceTo(P);if(d<r){out.n++;const mm=(r-d)*1000;if(mm>out.mm){out.mm=mm;out.where=where;}}};
  const sides=[['Left',R3.aR,B.LeftHand.children.filter(o=>o.userData.spare&&o.visible)],['Right',R3.aL,u.dt&&u.dt.visible?[u.dt]:[]]];
  for(const [sd,A,darts] of sides){if(!darts.length||!A)continue;const sb=A.sh&&A.sh.userData.box,eb=A.el&&A.el.userData.box;const ks=eb?new T.Vector3().setFromMatrixScale(eb.matrixWorld).x:1,ku=sb?new T.Vector3().setFromMatrixScale(sb.matrixWorld).x:ks;
   const S=B[sd+'Arm'].getWorldPosition(new T.Vector3()),E=B[sd+'ForeArm'].getWorldPosition(new T.Vector3()),H=B[sd+'Hand'].getWorldPosition(new T.Vector3());const AP=(R3.P||V2P).arm,rF=AP.r1*ks,rU=AP.r0*ku;
   for(const d of darts){if(sd==='Left'){a.set(0,0,1).transformDirection(d.matrixWorld);b.subVectors(H,E).normalize();out.ang=Math.min(out.ang,Math.acos(Math.min(1,Math.abs(a.dot(b))))*180/Math.PI);}
    d.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=2){p.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld);out.checked++;seg(p,E,H,rF,sd+' forearm');seg(p,S,E,rU,sd+' upper arm');}});}}
  /* and none inside the shirt (the spares at the belt, the dart hand across the stomach): the shirt's lathe in chest space, 1 cm grace */
  {const cb=R3.chest&&R3.chest.userData.box;if(cb){const ci=new T.Matrix4().copy(cb.matrixWorld).invert(),cs=new T.Vector3().setFromMatrixScale(cb.matrixWorld).x||1,BK=(R3.v3?V2BODY.standard:V2BODY[(u.s3look&&u.s3look.body)||'standard']||V2BODY.standard);out.tn=0;out.tmm=0;
   for(const [,,darts] of sides)for(const d of darts)d.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=2){p.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld).applyMatrix4(ci);const rr=v2TorsoR(p.y,BK);if(!rr)continue;const e=Math.hypot(p.x/rr[0],p.z/rr[1]);if(e<1-.01/cs/Math.min(rr[0],rr[1])){out.tn++;out.tmm=Math.max(out.tmm,(1-e)*Math.min(rr[0],rr[1])*cs*1000);}}});}}
  /* Q&D 20 Nov: and the throwing dart clear of the skull (its flight cut through Kai's cheek beside the mouth at throw k .60-.70).
     Only on request (opt.skull: the throw, where the dart travels past the face; the aim pose holds it 2-3% off the cheek by design, the poster pose, and outside the throw poses the dart is parked). In skull space against the same 1.04 skull as s3HeadClear; a v3 head's shaped surface via the rig's skullF. sn = vertices inside, se = the closest (1 = on the surface) */
  {let sk=null;fig.traverse(o=>{if(!sk&&o.isMesh&&o.userData.tag==='skull')sk=o;});const dt=u.dt;out.sn=0;out.se=9;out.smm=0;
   if(opt&&opt.skull&&sk&&dt&&dt.visible){const r=V2P.head.r,inv=new T.Matrix4().copy(sk.matrixWorld).invert(),ws=new T.Vector3().setFromMatrixScale(sk.matrixWorld).x,SF=R3.skullF,M=1.04,rm=Math.min(r[0],r[1],r[2]);
    dt.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry.attributes.position;for(let i=0;i<g.count;i++){p.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);out.checked++;
     const e=Math.hypot(p.x/r[0],p.y/r[1],p.z/r[2])/(SF?SF(p):1);if(e<out.se)out.se=e;if(e<M){out.sn++;out.smm=Math.max(out.smm,(M-e)*rm*ws*1000);}}});}
   /* r14 (Ray's new lock crest): and clear of the hair. A ray from the skull centre through each dart vertex: an odd number of hair hits
      beyond the vertex = inside the hair (hn, hmm deepest); hc = the closest radial clearance (mm) over the vertices whose ray meets hair */
   out.hn=0;out.hmm=0;out.hc=999;out.hd2=9;const HM=[];if(opt&&opt.skull&&sk&&dt&&dt.visible)fig.traverse(o=>{if(o.isMesh&&o.visible&&o.userData.hair&&o.geometry&&o.geometry.attributes.position)HM.push(o);});
   if(HM.length){const O=new T.Vector3().setFromMatrixPosition(sk.matrixWorld),rc=new T.Raycaster(),sd0=HM.map(o=>{const s0=o.material.side;o.material.side=T.DoubleSide;return s0;});
    dt.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=2){p.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld);const L0=p.distanceTo(O);if(L0<1e-6)continue;
     for(const o2 of HM){const P2=o2.geometry.attributes.position;for(let j=0;j<P2.count;j++){c.fromBufferAttribute(P2,j).applyMatrix4(o2.matrixWorld);const dd=c.distanceToSquared(p);if(dd<out.hd2)out.hd2=dd;}}/* the closest hair vertex, for the report */
     rc.set(O,q.subVectors(p,O).normalize());rc.far=L0*3;const hs=rc.intersectObjects(HM,false);if(!hs.length)continue;out.checked++;const far=hs[hs.length-1].distance;out.hc=Math.min(out.hc,(L0-far)*1000);
     let k=0;for(const h of hs)if(h.distance>L0)k++;if(k%2){out.hn++;let dd=9;for(const h of hs)if(h.distance>L0)dd=Math.min(dd,h.distance-L0);out.hmm=Math.max(out.hmm,dd*1000);}}});
    HM.forEach((o,i)=>{o.material.side=sd0[i];});}out.hd=Math.sqrt(out.hd2)*1000;}
  return out;}
 /* Round 5 (Producer 21 Nov): the throwing dart's MARGIN to the hair, not just "no vertex inside". Signed surface distance, world mm, between the
   throwing dart and every hair-like mesh on the head (hair, beard, cap, hoops): + = clear, - = inside. Both ways: each dart vertex to the nearest hair
   triangle (signed by that triangle's outward side) and each nearby hair vertex to the nearest dart triangle (so a hair point can't slip between the
   dart's sparse flight vertices). Only triangles within 6 cm of the dart are tested. Returns {mm, at:'hair'|'cap'|..., n}; mm=99 when nothing is within 6 cm. */
function s3DartHair(fig){const u=fig.userData,dt=u.dt,out={mm:99,at:'',n:0};if(!dt||!dt.visible)return out;fig.updateMatrixWorld(true);
  const HM=[];fig.traverse(o=>{if(o.isMesh&&o.visible&&(o.userData.hair||o.userData.cap)&&o.geometry&&o.geometry.attributes.position&&o.material)HM.push(o);});if(!HM.length)return out;
  const DV=[],DT=[];dt.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry,P=g.attributes.position,b0=DV.length/3;const v=new T.Vector3();for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);DV.push(v.x,v.y,v.z);}
    const I=g.index?g.index.array:null,nt=I?I.length/3:P.count/3;for(let t=0;t<nt;t++)DT.push(b0+(I?I[3*t]:3*t),b0+(I?I[3*t+1]:3*t+1),b0+(I?I[3*t+2]:3*t+2));});
  const R=0.06,cache=u._dhC||(u._dhC=new Map());const A=new T.Vector3(),Bv=new T.Vector3(),Cv=new T.Vector3(),P0=new T.Vector3(),Q0=new T.Vector3(),N0=new T.Vector3(),e0=new T.Vector3(),e1=new T.Vector3();
  /* closest point on triangle abc to p (Ericson) */
  let RG=0;/* region of the last closest point: 0 face, 1/2/3 vertex a/b/c, 4 edge ab, 5 edge ac, 6 edge bc */
  const W3=new T.Vector3(),cpt=(p,a,b,c,res)=>{e0.subVectors(b,a);e1.subVectors(c,a);const ap=Q0.subVectors(p,a);const d1=e0.dot(ap),d2=e1.dot(ap);if(d1<=0&&d2<=0){RG=1;return res.copy(a);}
   const bp=N0.subVectors(p,b);const d3=e0.dot(bp),d4=e1.dot(bp);if(d3>=0&&d4<=d3){RG=2;return res.copy(b);}const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0){RG=4;return res.copy(a).addScaledVector(e0,d1/(d1-d3));}
   const cp=N0.subVectors(p,c);const d5=e0.dot(cp),d6=e1.dot(cp);if(d6>=0&&d5<=d6){RG=3;return res.copy(c);}const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0){RG=5;return res.copy(a).addScaledVector(e1,d2/(d2-d6));}
   const va=d3*d6-d5*d4;if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){const w=(d4-d3)/((d4-d3)+(d5-d6));RG=6;return res.copy(b).addScaledVector(W3.subVectors(c,b),w);}RG=0;const den=1/(va+vb+vc);return res.copy(a).addScaledVector(e0,vb*den).addScaledVector(e1,vc*den);};
  for(const m of HM){let C=cache.get(m.uuid);const g=m.geometry,PA=g.attributes.position;if(!C||C.n!==PA.count){const I=g.index?g.index.array:null,nt=I?I.length/3:PA.count/3,ix=new Uint32Array(nt*3),bx=new Float32Array(nt*6),nn=new Float32Array(nt*3);
     const bb=new T.Box3().setFromBufferAttribute(PA),ctr=bb.getCenter(new T.Vector3());let flip=0;
     for(let t=0;t<nt;t++){for(let k=0;k<3;k++)ix[3*t+k]=I?I[3*t+k]:3*t+k;A.fromBufferAttribute(PA,ix[3*t]);Bv.fromBufferAttribute(PA,ix[3*t+1]);Cv.fromBufferAttribute(PA,ix[3*t+2]);
      bx[6*t]=Math.min(A.x,Bv.x,Cv.x);bx[6*t+1]=Math.min(A.y,Bv.y,Cv.y);bx[6*t+2]=Math.min(A.z,Bv.z,Cv.z);bx[6*t+3]=Math.max(A.x,Bv.x,Cv.x);bx[6*t+4]=Math.max(A.y,Bv.y,Cv.y);bx[6*t+5]=Math.max(A.z,Bv.z,Cv.z);
      e0.subVectors(Bv,A);e1.subVectors(Cv,A);N0.crossVectors(e0,e1);const l=N0.length();if(l>1e-12)N0.divideScalar(l);nn[3*t]=N0.x;nn[3*t+1]=N0.y;nn[3*t+2]=N0.z;P0.copy(A).add(Bv).add(Cv).divideScalar(3).sub(ctr);flip+=Math.sign(N0.dot(P0))*l;}
     /* open-sheet edges (hairline rim, curtain edges): a point whose nearest feature is a rim edge or rim vertex is outside, whatever the face normal says.
        Vertices are welded by position (the phi seam's duplicate columns are not a rim) */
     const key=new Int32Array(PA.count),km=new Map();for(let i=0;i<PA.count;i++){const kk=Math.round(PA.getX(i)*2e4)+','+Math.round(PA.getY(i)*2e4)+','+Math.round(PA.getZ(i)*2e4);let id=km.get(kk);if(id==null){id=km.size;km.set(kk,id);}key[i]=id;}
     const ec=new Map(),en=new Map(),vn=new Float32Array(km.size*3),ek=(a,b)=>a<b?a+'_'+b:b+'_'+a;
     /* pseudo-normals (Baerentzen-Aanaes): an edge's = the sum of its faces' normals, a vertex's = the angle-weighted sum, so the sign is right
        when the nearest feature is an edge or a vertex on a crease */
     for(let t=0;t<nt;t++){const nx=nn[3*t],ny=nn[3*t+1],nz=nn[3*t+2];for(const [x,y] of [[0,1],[0,2],[1,2]]){const kk=ek(key[ix[3*t+x]],key[ix[3*t+y]]);ec.set(kk,(ec.get(kk)||0)+1);const e=en.get(kk)||[0,0,0];e[0]+=nx;e[1]+=ny;e[2]+=nz;en.set(kk,e);}
      for(let k=0;k<3;k++){A.fromBufferAttribute(PA,ix[3*t+k]);Bv.fromBufferAttribute(PA,ix[3*t+(k+1)%3]).sub(A);Cv.fromBufferAttribute(PA,ix[3*t+(k+2)%3]).sub(A);const ang=Bv.angleTo(Cv)||0,q=3*key[ix[3*t+k]];vn[q]+=nx*ang;vn[q+1]+=ny*ang;vn[q+2]+=nz*ang;}}
     const rimV=new Uint8Array(km.size);const rimE=new Set();for(const [kk,c] of ec)if(c===1){rimE.add(kk);const [a,b]=kk.split('_');rimV[+a]=1;rimV[+b]=1;}
     C={n:PA.count,ix,bx,nn,key,rimV,rimE,ek,en,vn,sg:flip<0?-1:1,ds:!!(m.material&&m.material.side===T.DoubleSide&&m.userData.cap)};cache.set(m.uuid,C);}
   const inv=new T.Matrix4().copy(m.matrixWorld).invert(),ws=new T.Vector3().setFromMatrixScale(m.matrixWorld).x||1,r=R/ws;
   /* the dart in this mesh's local space */const L=new Float32Array(DV.length);let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let i=0;i<DV.length;i+=3){P0.set(DV[i],DV[i+1],DV[i+2]).applyMatrix4(inv);L[i]=P0.x;L[i+1]=P0.y;L[i+2]=P0.z;x0=Math.min(x0,P0.x);y0=Math.min(y0,P0.y);z0=Math.min(z0,P0.z);x1=Math.max(x1,P0.x);y1=Math.max(y1,P0.y);z1=Math.max(z1,P0.z);}
   const cand=[];const nt=C.ix.length/3;for(let t=0;t<nt;t++){const o6=6*t;if(C.bx[o6]>x1+r||C.bx[o6+3]<x0-r||C.bx[o6+1]>y1+r||C.bx[o6+4]<y0-r||C.bx[o6+2]>z1+r||C.bx[o6+5]<z0-r)continue;cand.push(t);}if(!cand.length)continue;
   const tag=m.userData.cap?'cap':m.userData.tag==='beard'?'beard':(m.geometry.type==='TorusGeometry'?'hoop':'hair');
   /* dart vertices -> hair triangles (signed) */
   for(let i=0;i<L.length;i+=6){P0.set(L[i],L[i+1],L[i+2]);let best=1e9,bs=1,bRG=-1,bT=-1,bCP=null;/* every 2nd dart vertex (1-3 mm apart); the reverse pass below covers the gaps */for(const t of cand){const o6=6*t;if(C.bx[o6]>P0.x+r||C.bx[o6+3]<P0.x-r||C.bx[o6+1]>P0.y+r||C.bx[o6+4]<P0.y-r||C.bx[o6+2]>P0.z+r||C.bx[o6+5]<P0.z-r)continue;
     A.fromBufferAttribute(m.geometry.attributes.position,C.ix[3*t]);Bv.fromBufferAttribute(m.geometry.attributes.position,C.ix[3*t+1]);Cv.fromBufferAttribute(m.geometry.attributes.position,C.ix[3*t+2]);const cp=cpt(P0,A,Bv,Cv,new T.Vector3());const d=cp.distanceTo(P0);
     if(d<best){best=d;bRG=RG;bT=t;bCP=cp;const vi=[C.ix[3*t],C.ix[3*t+1],C.ix[3*t+2]],K=C.key;const rim=RG>=1&&RG<=3?C.rimV[K[vi[RG-1]]]:RG===4?C.rimE.has(C.ek(K[vi[0]],K[vi[1]])):RG===5?C.rimE.has(C.ek(K[vi[0]],K[vi[2]])):RG===6?C.rimE.has(C.ek(K[vi[1]],K[vi[2]])):0;
      let nx=C.nn[3*t],ny=C.nn[3*t+1],nz=C.nn[3*t+2];if(RG>=1&&RG<=3){const q=3*K[vi[RG-1]];nx=C.vn[q];ny=C.vn[q+1];nz=C.vn[q+2];}else if(RG>=4){const pr=RG===4?[0,1]:RG===5?[0,2]:[1,2],e=C.en.get(C.ek(K[vi[pr[0]]],K[vi[pr[1]]]));if(e){nx=e[0];ny=e[1];nz=e[2];}}
      bs=C.ds||rim?1:((P0.x-cp.x)*nx+(P0.y-cp.y)*ny+(P0.z-cp.z)*nz)*C.sg<0?-1:1;}}
    if(best<1e8){const mm=bs*best*ws*1000;if(mm<out.mm){out.mm=mm;out.at=tag;if(window.__dhDbg)out.dbg={p:[P0.x,P0.y,P0.z].map(v=>+v.toFixed(4)),cp:[bCP.x,bCP.y,bCP.z].map(v=>+v.toFixed(4)),rg:bRG,tri:bT,n:[C.nn[3*bT],C.nn[3*bT+1],C.nn[3*bT+2]].map(v=>+v.toFixed(3)),sg:C.sg,mesh:m.geometry.type,nv:PA.count,ws};}if(mm<0)out.n++;}}
   /* nearby hair vertices -> dart triangles (unsigned: a hair point on a flight counts as 0) */
   /* only hair vertices and dart triangles that could still beat the closest distance so far */
   const DB=new Float32Array(DT.length*2);for(let t=0;t<DT.length;t+=3){const a=3*DT[t],b2=3*DT[t+1],c2=3*DT[t+2];for(let k=0;k<3;k++){DB[2*t+k]=Math.min(L[a+k],L[b2+k],L[c2+k]);DB[2*t+3+k]=Math.max(L[a+k],L[b2+k],L[c2+k]);}}
   const seen=new Set();for(const t of cand)for(let k=0;k<3;k++)seen.add(C.ix[3*t+k]);const PA2=m.geometry.attributes.position,bd=(x,lo,hi)=>x<lo?lo-x:x>hi?x-hi:0;
   for(const vi of seen){P0.fromBufferAttribute(PA2,vi);let lim=Math.max(0,out.mm)/(ws*1000);if(Math.hypot(bd(P0.x,x0,x1),bd(P0.y,y0,y1),bd(P0.z,z0,z1))>lim)continue;
    for(let t=0;t<DT.length;t+=3){if(Math.hypot(bd(P0.x,DB[2*t],DB[2*t+3]),bd(P0.y,DB[2*t+1],DB[2*t+4]),bd(P0.z,DB[2*t+2],DB[2*t+5]))>lim)continue;A.set(L[3*DT[t]],L[3*DT[t]+1],L[3*DT[t]+2]);Bv.set(L[3*DT[t+1]],L[3*DT[t+1]+1],L[3*DT[t+1]+2]);Cv.set(L[3*DT[t+2]],L[3*DT[t+2]+1],L[3*DT[t+2]+2]);
     const d=cpt(P0,A,Bv,Cv,W3.clone()).distanceTo(P0)*ws*1000;if(d<out.mm){out.mm=d;out.at=tag;lim=d/(ws*1000);}}}}
  return out;}
window.TOPS_S3DARTCLEAR=s3DartClear;window.TOPS_S3DARTHAIR=s3DartHair;

 window.TOPS_S3CLIP=f=>f&&f.userData&&f.userData.s3rig&&f.userData.s3rig.v2?s3ClipV2(f):s3Clip(f);
 window.TOPS_S3FIG={look:s3Look,build:s3Build,dress:s3Dress,skin:s3SkinFig,skinAll:s3SkinAll};scene.onBeforeRender=()=>{if(S3SKINF.size)s3SkinAll();};
 function faceKit(fig,B,look,ck){if(!look||!B.Head)return;if(ck==='pete')look=Object.assign({hair2:'short',beard2:1},Object.fromEntries(Object.entries(look).filter(([k,v])=>v!=null)));if(window.GFX_HEADDBG){[[1,0,0,0xff0000],[0,1,0,0x00ff00],[0,0,1,0x0000ff]].forEach(([x,y,z,c])=>{const m=new T.Mesh(new T.SphereGeometry(.015),new T.MeshBasicMaterial({color:c}));m.position.set(x*.13,y*.13,z*.13);B.Head.add(m);});}const L=look;const R=RIG.rest;const headH=(B.HeadTop_End&&R[B.HeadTop_End.name]&&R[B.Head.name])?R[B.HeadTop_End.name].p.distanceTo(R[B.Head.name].p):.24;
  const wantHair=L.hair2&&L.hair2!=='own';const needLib=wantHair&&L.hair2!=='bald'||L.beard2;if(needLib&&!HAIRLIB)loadHair();
  fig.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];
   if(/Hair/i.test(o.name)&&!/Eyelash/i.test(o.name)){if(wantHair)o.visible=false;else if(L.hairCol){o.material=ms.map(m=>{const c=m.clone();c.map=tintMap(m.map,L.hairCol,ck+'h');return c;});if(o.material.length===1)o.material=o.material[0];}}
   if(/Body/i.test(o.name)&&L.skinTone){const tone=new T.Color(L.skinTone);o.material=ms.map(m=>{const c=m.clone();c.color.copy(tone);return c;});if(o.material.length===1)o.material=o.material[0];}});
  const attach=(style,col)=>{const H=HAIRLIB&&HAIRLIB[style];if(!H)return;const m=new T.Mesh(H.mesh.geometry,col?(Array.isArray(H.mesh.material)?H.mesh.material.map(mm=>{const c=mm.clone();c.map=tintMap(mm.map,col,style);return c;}):(()=>{const c=H.mesh.material.clone();c.map=tintMap(H.mesh.material.map,col,style);return c;})()):H.mesh.material);const sh=HEADS[HAIR_SRC[style]],th=HEADS[ck];if(sh&&th){const sz=i=>(th.max[i]-th.min[i])/(sh.max[i]-sh.min[i]),c=(h,i)=>(h.max[i]+h.min[i])/2;const sx=sz(0),sy=sz(1),szz=sz(2);m.scale.set(sx,sy,szz);m.position.set(c(th,0)-c(sh,0)*sx,th.max[1]-sh.max[1]*sy,c(th,2)-c(sh,2)*szz);}else m.scale.setScalar(headH/H.hh);m.castShadow=true;m.frustumCulled=false;m.userData.hairStyle=style;B.Head.add(m);};
  if(wantHair&&L.hair2!=='bald')attach(L.hair2,L.hairCol);if(L.beard2){attach('beard',L.beardCol||L.hairCol);if(L.beardSoft)softBeard(B.Head,L.beardCol||L.hairCol||'#2a2019',B,L.beardSoft);
   /* BUG-BEARD (David, 3.53 screenshot: Luke Littler from behind): the library beard wraps round the back of the neck; only soft beards
      were trimmed to the front, so every other beard kept a dark strip at the nape (12% of its triangles on lewis). Every beard is
      trimmed to the chin, jaw and cheeks now (softBeard already trims its own; trimBeard on a trimmed copy changes nothing). */
   else B.Head.children.forEach(o=>{if(o.isMesh&&o.userData.hairStyle==='beard')trimBeard(o,B.Head,B);});}
  if(L.glasses){const g=new T.Group();const fm=new T.MeshStandardMaterial({color:L.glasses===2?0x111111:0x8a6a3a,roughness:.35,metalness:L.glasses===2?.1:.7});const lens=new T.MeshStandardMaterial({color:0x223040,transparent:true,opacity:.25,roughness:.05});
   [-1,1].forEach(sx=>{const r=new T.Mesh(L.glasses===2?new T.TorusGeometry(.021,.0025,6,4):new T.TorusGeometry(.019,.0018,6,20),fm);if(L.glasses===2)r.rotation.z=Math.PI/4;r.position.set(sx*.032,0,0);g.add(r);const l=new T.Mesh(new T.CircleGeometry(.019,16),lens);l.position.copy(r.position);g.add(l);const arm=new T.Mesh(new T.BoxGeometry(.002,.002,.1),fm);arm.position.set(sx*.054,0,-.05);g.add(arm);});
   const br=new T.Mesh(new T.BoxGeometry(.022,.003,.003),fm);g.add(br);{const hd=HEADS[ck];if(hd){g.position.set(0,hd.min[1]+(hd.max[1]-hd.min[1])*.47,hd.max[2]-.028);g.scale.setScalar((hd.max[0]-hd.min[0])/.18);}else g.position.set(0,headH*.4,.12);}B.Head.add(g);}
  if(window.TOPS_WEAR)try{TOPS_WEAR(T,B,L,HEADS[ck],headH,fig);}catch(e){console.warn('wear',e);}
  if(L.cap&&!(L.wear&&L.wear.hat)){const cm=new T.MeshStandardMaterial({color:L.capCol||0x1d3f6e,roughness:.9});const cap=new T.Group();const dome=new T.Mesh(new T.SphereGeometry(.1,28,14,0,Math.PI*2,0,Math.PI*.52),cm);dome.scale.set(.98,.82,1.08);cap.add(dome);
   const band=new T.Mesh(new T.CylinderGeometry(.099,.1,.03,28,1,true),cm);band.scale.set(.98,1,1.08);band.position.y=-.012;cap.add(band);
   const brim=new T.Mesh(new T.CylinderGeometry(.085,.085,.006,28,1,false,-Math.PI/2,Math.PI),cm);brim.scale.set(.95,1,.85);brim.position.set(0,-.02,.085);brim.rotation.x=.18;cap.add(brim);
   const btn=new T.Mesh(new T.SphereGeometry(.008,8,6),cm);btn.position.y=.083;cap.add(btn);
   const hd=HEADS[ck];if(hd){const w=(hd.max[0]-hd.min[0]);const k=w/.18*.97;cap.scale.setScalar(k);cap.position.set(0,hd.max[1]-.082*k,(hd.min[2]+hd.max[2])/2-.02);}else cap.position.set(0,headH*.6,0);B.Head.add(cap);}}

 function charKey(look,name){if(window.GFX_LEGACY)return 'remy';const k=look&&look.model;if(k&&CHARS.includes(k))return k;let h=0;String(name||'x').split('').forEach(c=>h=(h*31+c.charCodeAt(0))>>>0);const fem=(look&&look.sex==='f')||(!(look&&look.sex)&&/^(Shazza|Bev|Kiri|Mere|Aroha|Fallon|Tash|Jess|Sharon|Kim|Tina|Deb|Marg|Liz|Megan)/i.test(String(name||'')));const pool=CHARS.filter(c=>fem?CHAR_F[c]:!CHAR_F[c]);return pool[h%pool.length];}
 function loadRig(){if(!THREE.GLTFLoader)return;const L=new THREE.GLTFLoader();const onLoaded=gltf=>{if(!window.GFX_LEGACY){const r=rigFrom(gltf,'remy');RIGS.remy=r;RIG.base=r.base;RIG.shirtImg=r.shirtImg;RIG.ready=true;RIG.waiting.forEach(f=>f());RIG.waiting.length=0;return;}const sc=gltf.scene;sc.updateMatrixWorld(true);
   const box=new T.Box3().setFromObject(sc);const h=box.max.y-box.min.y;const k=1.78/h;sc.scale.setScalar(k);sc.position.y=-box.min.y*k;sc.updateMatrixWorld(true);
   // wrap so the figure root is at the feet, facing -z
   const root=new T.Group();sc.rotation.y=Math.PI;root.add(sc);root.updateMatrixWorld(true);
   const rest={};root.traverse(o=>{if(o.isBone){o.updateWorldMatrix(true,false);const q=o.getWorldQuaternion(new T.Quaternion());const p=o.getWorldPosition(new T.Vector3());rest[o.name]={q,p,lq:o.quaternion.clone()};}});
   root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(o.material&&o.material.map&&/Top/i.test(o.material.name||o.name))RIG.shirtImg=o.material.map.image;if(o.material&&/Hair|Eyelash/i.test(o.material.name)){o.material.transparent=true;o.material.alphaTest=.4;o.material.side=T.DoubleSide;}}});
   keepAssets(root);RIG.base=root;RIG.rest=rest;RIG.ready=true;RIG.waiting.forEach(f=>f());RIG.waiting.length=0;};const fail=e=>console.warn('rig load failed',e);
  const go=()=>{if(window.RIG_B64_URL){fetch(window.RIG_B64_URL).then(r=>r.text()).then(t=>{const bin=Uint8Array.from(atob(t.trim()),c=>c.charCodeAt(0));L.parse(bin.buffer,'',onLoaded,fail);}).catch(fail);}else if(window.RIG_URL&&!/^data:/.test(window.RIG_URL))rigFetch(window.RIG_URL).then(buf=>L.parse(buf,'',onLoaded,fail)).catch(fail);else L.load(window.RIG_URL||'remy.glb',onLoaded,e=>{try{if(window.TOPS_LOAD&&e&&e.total)TOPS_LOAD.part('rig',e.loaded/e.total);}catch(x){}},fail);};
  /* S3 (Delivery QA 13:01; Overseer 16:09): the 685 KB S3 rig is the only rig file. Every S3 figure is built on it, so the 2.4 MB in-page rig
     file is fetched only as a fallback, if the S3 rig fails or is still not in after 20 s; once the S3 rig is in, it is never fetched */
  if(window.TOPS_S3FLAG&&V2ON){const rd=()=>{try{if(window.TOPS_LOAD)TOPS_LOAD.part('rig',1);}catch(e){}};if(RIGS[S3_RIG]){rd();return;}loadChar(S3_RIG);const t0=Date.now();
   const w=()=>{if(RIGS[S3_RIG]){rd();return;}if(!RIG_WAIT[S3_RIG]||Date.now()-t0>20000)go();else setTimeout(w,150);};setTimeout(w,150);}
  /* off (4.02): the 685 KB S3 rig first, with the whole connection; the 2.4 MB in-page rig file after it lands (or fails, or 20 s) */
  else if(window.TOPS_S3FLAG&&!RIGS[S3_RIG]){loadChar(S3_RIG);const t0=Date.now();const w=()=>{if(RIGS[S3_RIG]||!RIG_WAIT[S3_RIG]||Date.now()-t0>20000)go();else setTimeout(w,150);};setTimeout(w,150);}else go();}
 /* ENG-RIGCACHE: the player model is its own file named by its content (rig/remy-<hash>.glb). Kept in Cache Storage: a relaunch or the fresh
    start between matches reads it from there with no download; the first download shows its progress on the loader; two retries on a bad
    network; models from older builds are dropped from the cache once the new one is in. Without Cache Storage (or if it fails) it downloads. */
 /* ENG-CHARCACHE (BUG-AVATAR / BUG-BEARD, 18 Nov): since every match starts on a fresh page, the character files, hair.glb and anims.glb
    were fetched again for every match; on a slow phone they landed after the match had started, and a file that lands mid-match is
    deliberately not swapped in (ENG-7), so the whole match showed the stand-in (the default player) or a figure rebuilt around a late
    file. They now live in Cache Storage per build (tops-assets-<build>: a new release fetches each once, older builds' caches are dropped),
    so a fresh page builds the real figures straight away. Anything that fails falls back to a plain download. */
 var ACN='tops-assets-'+(window.TOPS_BUILD||'dev'),acClean=false;/* var: callable before this line runs */
 /* ChatGPT P1: a cached copy is used only if it is a whole GLB (magic 'glTF' and the length in its header = its size); a copy that still
    fails to parse is deleted and the file downloaded once more, so a damaged entry can't repeat the stand-in on every fresh page. Only
    whole GLBs are stored. */
 const okGlb=b=>{try{if(!b||b.byteLength<20)return false;const v=new DataView(b);return v.getUint32(0,true)===0x46546C67&&v.getUint32(8,true)===b.byteLength;}catch(e){return false;}};
 function glbLoad(url,onLoad,onErr){const abs=new URL(url,location.href).href;const base=abs.replace(/[^/]*$/,'');let loaded=false;
  const ok=g=>{loaded=true;onLoad(g);};
  const parse=(b,retry)=>{const fail=e=>{if(retry&&!loaded){const r=retry;retry=null;r(e);}else if(onErr)onErr(e);};try{new THREE.GLTFLoader().parse(b,base,ok,fail);}catch(e){fail(e);}};
  const net=()=>fetch(abs).then(r=>{if(!r.ok)throw new Error(url+' '+r.status);return r.arrayBuffer();});
  if(!window.caches||!caches.open){net().then(b=>parse(b),onErr);return;}
  caches.open(ACN).then(c=>{if(!acClean){acClean=true;try{caches.keys().then(ks=>ks.forEach(k=>{if(/^tops-assets-/.test(k)&&k!==ACN)caches.delete(k);})).catch(()=>{});}catch(e){}}
   return c.match(abs).then(hit=>hit?hit.arrayBuffer():null).catch(()=>null).then(b=>{if(okGlb(b))return {b,c,hit:true};
    return net().then(b=>{if(okGlb(b)){try{c.put(abs,new Response(b.slice(0))).catch(()=>{});}catch(e){}}return {b};});});})
   .catch(()=>net().then(b=>({b})))
   .then(r=>parse(r.b,r.hit?(()=>{const c=r.c;Promise.resolve().then(()=>c.delete(abs)).catch(()=>{}).then(()=>net()).then(b=>{if(okGlb(b)){try{c.put(abs,new Response(b.slice(0))).catch(()=>{});}catch(e){}}parse(b);},onErr);}):null),onErr);}
 window.TOPS_GLBLOAD=glbLoad;window.TOPS_CHARKEY=(l,n)=>window.TOPS_S3FLAG?S3_RIG:charKey(l,n);window.TOPS_LOADCHAR=k=>{if(k&&k!=='remy')loadChar(k);};window.TOPS_LOADHAIR=()=>{try{if(window.TOPS_S3FLAG)return;/* S3 figures grow their own hair */loadHair();}catch(e){}};
 /* the player's and the next opponent's character files are requested as soon as a page is up (the hub), so the figures a match builds are
    real ones, not the stand-in (a file that lands once the match is live waits for the hub, ENG-7) */
 window.TOPS_PRELOAD=list=>{try{if(window.TOPS_S3FLAG){if(!RIGS[S3_RIG])loadChar(S3_RIG);return;}/* S3: every figure is built on the one S3 rig; the 3.55 character files are never used */(list||[]).forEach(([look,name])=>{const ck=charKey(look,name);if(ck&&ck!=='remy'&&!RIGS[ck])loadChar(ck);});}catch(e){}};
 function rigFetch(url){const abs=new URL(url,location.href).href;const prog=f=>{try{if(window.TOPS_LOAD&&TOPS_LOAD.part)TOPS_LOAD.part('rig',f);}catch(x){}};
  const net=()=>fetch(abs).then(r=>{if(!r.ok)throw new Error('rig '+r.status);const tot=+r.headers.get('content-length')||0;if(!r.body||!r.body.getReader||!tot)return r.arrayBuffer().then(b=>{prog(1);return b;});
   const rd=r.body.getReader(),parts=[];let got=0;const pump=()=>rd.read().then(x=>{if(x.done){const out=new Uint8Array(got);let o=0;for(const q of parts){out.set(q,o);o+=q.length;}prog(1);return out.buffer;}parts.push(x.value);got+=x.value.length;prog(Math.min(.99,got/tot));return pump();});return pump();});
  const tryNet=n=>net().catch(e=>n>0?new Promise(z=>setTimeout(z,800)).then(()=>tryNet(n-1)):Promise.reject(e));
  const ok=b=>{const u=new Uint8Array(b,0,4);if(b.byteLength<1000||String.fromCharCode(u[0],u[1],u[2],u[3])!=='glTF')throw new Error('rig: not a GLB');return b;};
  let tried=false;if(!window.caches||!caches.open){window.TOPS_RIGSRC='net';return tryNet(2).then(ok);}
  return caches.open('tops-rig').then(c=>c.match(abs).then(hit=>hit?hit.arrayBuffer().then(ok).then(b=>{window.TOPS_RIGSRC='cache';prog(1);return b;}):null)
   .catch(()=>null).then(b=>b||(tried=true,tryNet(2)).then(ok).then(b=>{window.TOPS_RIGSRC='net';
    try{c.put(abs,new Response(b.slice(0),{headers:{'content-type':'model/gltf-binary'}})).then(()=>c.keys()).then(ks=>ks.forEach(k=>{if(k.url!==abs)c.delete(k);})).catch(()=>{});}catch(x){}/* best effort: a failed cache write never loses the download */return b;})))
   .catch(e=>{if(tried)throw e;/* Cache Storage itself failed (private mode, quota): download */window.TOPS_RIGSRC='net';return tryNet(2).then(ok);});}
 function onRig(f){if(RIG.ready)f();else RIG.waiting.push(f);}
 function shirtCanvas(look,name,tier){const img=RIG.shirtImg;const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');if(img)x.drawImage(img,0,0,1024,1024);else{x.fillStyle='#666';x.fillRect(0,0,1024,1024);}
  const col=new T.Color(look.shirt);const light=look.shirt==='#e0e0e0';const im=x.getImageData(0,0,1024,1024),d=im.data;const _hx=col.getHex(),cr=_hx>>16&255,cg=_hx>>8&255,cb=_hx&255;
  for(let i=0;i<d.length;i+=4){const l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;if(l<.16)continue; /* keep the dark collar/hem bands */const f=l/.42;d[i]=Math.min(255,cr*f);d[i+1]=Math.min(255,cg*f);d[i+2]=Math.min(255,cb*f);}
  x.putImageData(im,0,0);const panel=col.clone().offsetHSL(0,0,light?-.3:.16).getStyle(),ink=light?'#111':'#fff';
  // side panels at the outer edges of the front and back halves
  x.fillStyle=panel;x.globalAlpha=.85;[[0,34],[232,36],[262,36],[492,34]].forEach(([px,w])=>x.fillRect(px*2,120,w*2,640));x.globalAlpha=1;
  if(look.pattern===2){x.fillStyle=ink;x.globalAlpha=.1;for(let k=0;k<1024;k+=40)x.fillRect(k,120,16,640);x.globalAlpha=1;}
  if(look.pattern===1){x.fillStyle=panel;x.globalAlpha=.5;for(let k=0;k<4;k++){x.beginPath();x.moveTo(40+k*90,760);x.lineTo(100+k*90,760);x.lineTo(220+k*90,300);x.lineTo(160+k*90,300);x.fill();}x.globalAlpha=1;}
  x.textAlign='center';x.textBaseline='middle';x.fillStyle=ink;
  x.font='800 30px "Saira Condensed","Arial Narrow",Arial,sans-serif';const isMe=name&&save.name&&name.toUpperCase()===String(save.name).toUpperCase();x.fillText(isMe&&sponsor()?sponsor().label:SPONSOR[tier||0],330,330);if(isMe&&sponsor()){x.font='800 44px "Saira Condensed",Arial';x.fillText(sponsor().label,768,120);}
  if(name){let n=name.toUpperCase();x.font='800 70px "Saira Condensed","Arial Narrow",Arial,sans-serif';let tw=x.measureText(n).width;if(tw>380)x.font=`800 ${Math.floor(70*380/tw)}px "Saira Condensed","Arial Narrow",Arial,sans-serif`;x.fillText(n,768,250);x.fillStyle=panel;x.fillRect(560,300,416,8);}
  const t=new T.CanvasTexture(c);t.flipY=false;t.anisotropy=4;return t;}
 // recolour a model's own shirt: keep the fabric folds from the texture, swap the colour
 // kits: real-player-inspired and original designs, drawn procedurally over the shirt's own fabric shading
 const KITS={nuke:{n:'The Nuke',k:1,c:['#5b2a86','#1b1f4a','#f5d11c']},mvg:{n:'Mighty Mike',k:2,c:['#141516','#2fa046','#2fa046']},iceman:{n:'Iceman',k:3,c:['#a9d8f0','#15181c','#ffffff']},asp:{n:'The Asp',k:4,c:['#111214','#c4161c','#c4161c']},snake:{n:'Snakebite',k:5,c:['#000000','#000000','#000000']},
  flames:{n:'Flames',k:6,c:['#141414','#ff6a13','#ffd23a']},camo:{n:'Camo',k:7,c:['#2f3a24','#4b5a34','#1c2316']},tiger:{n:'Tiger',k:8,c:['#e8822a','#121212','#121212']},chevron:{n:'Lime Chevron',k:9,c:['#24282b','#c6f36b','#c6f36b']},hoops:{n:'Hoops',k:10,c:['#13284a','#f2f2f2','#f2f2f2']}};
 window.TOPS_KITS=KITS;
 function kitShirt(m,id,geo){const K=KITS[id];if(!K)return;geo.computeBoundingBox();const bb=geo.boundingBox.clone();{const pa=geo.attributes.position;if(pa&&pa.normalized){const d=pa.array instanceof Int16Array?32767:pa.array instanceof Uint16Array?65535:pa.array instanceof Int8Array?127:pa.array instanceof Uint8Array?255:1;bb.min.divideScalar(d);bb.max.divideScalar(d);}}const ms=Array.isArray(m)?m:[m];ms.forEach(mt=>{mt.onBeforeCompile=sh=>{sh.uniforms.uMin={value:bb.min.clone()};sh.uniforms.uMax={value:bb.max.clone()};sh.uniforms.uA={value:new T.Color(K.c[0])};sh.uniforms.uB={value:new T.Color(K.c[1])};sh.uniforms.uC={value:new T.Color(K.c[2])};sh.uniforms.uK={value:K.k};
   sh.vertexShader='varying vec3 vKP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vKP = position;');
   sh.fragmentShader='varying vec3 vKP;uniform vec3 uMin,uMax,uA,uB,uC;uniform float uK;\nfloat kh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}\nvec3 hsv(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}\n'+sh.fragmentShader.replace('#include <map_fragment>',`
#ifdef USE_MAP
 vec4 texelColor = texture2D( map, vUv ); texelColor = mapTexelToLinear( texelColor );
 float lum = dot( texelColor.rgb, vec3( .299, .587, .114 ) );
 vec3 p=(vKP-uMin)/max(uMax-uMin,vec3(1e-4)); float x=p.x,y=p.y,z=p.z; float cx=abs(x-.5)*2.;
 vec3 col=uA;
 if(uK<1.5){ if(kh(floor(vec2(x*7.,y*9.))+floor(z*4.))<.38) col=uB; float s=fract((x*1.4+y)*2.6); if(s<.07) col=uC; }
 else if(uK<2.5){ if(y>.8&&cx>.3) col=uB; if(y>.94&&cx<.32) col=uB; }
 else if(uK<3.5){ if(cx>.72) col=uB; if(abs(y-.62)<.018) col=uC; }
 else if(uK<4.5){ if(abs(x-(.5+.2*sin(y*13.)))<.045) col=uB; }
 else if(uK<5.5){ col=hsv(fract(y*1.3+x*.4)); if(fract((x-y)*4.)<.12) col=vec3(.03); }
 else if(uK<6.5){ float f=.26+.11*abs(sin(x*22.+z*9.))+.05*sin(x*57.); if(y<f) col=mix(uC,uB,clamp((f-y)/.18,0.,1.)); }
 else if(uK<7.5){ float n=kh(floor(vec2(x*5.+sin(y*7.)*.6,y*6.+sin(x*9.)*.5))); col=n<.33?uA:(n<.66?uB:uC); }
 else if(uK<8.5){ if(fract(y*7.+sin(x*11.)*.35)<.17) col=uB; }
 else if(uK<9.5){ if(fract(y*5.5-cx*1.8)<.14) col=uB; }
 else { if(fract(y*5.)<.28) col=uB; }
 texelColor.rgb = col*( .45 + 1.25*lum );
 diffuseColor *= texelColor;
#endif`);};mt.customProgramCacheKey=()=>'kit'+id;mt.needsUpdate=true;});}
 // GFX: one-mesh characters (lewis) have the tee baked into the body atlas; recolour only the blue-grey tee texels
 function keyShirt(m,hex){const ms=Array.isArray(m)?m:[m];ms.forEach(mt=>{const tc=new T.Color(hex);mt.onBeforeCompile=sh=>{sh.uniforms.uTint={value:tc};sh.fragmentShader='uniform vec3 uTint;\n'+sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 texelColor = texture2D( map, vUv );\n texelColor = mapTexelToLinear( texelColor );\n float mx=max(texelColor.r,max(texelColor.g,texelColor.b)),mn=min(texelColor.r,min(texelColor.g,texelColor.b));\n float lum=dot(texelColor.rgb,vec3(.3,.59,.11));\n float msk=smoothstep(.015,.05,texelColor.b-texelColor.r)*smoothstep(.12,.2,lum)*(1.-smoothstep(.35,.5,(mx-mn)/max(mx,.001)));\n vec3 tinted=uTint*clamp(lum*2.3,0.,1.4);\n diffuseColor *= vec4(mix(texelColor.rgb,tinted,msk),texelColor.a);\n#endif');};mt.customProgramCacheKey=()=>'keyShirt'+tc.getHexString();mt.needsUpdate=true;});}
 function tintShirt(m,hex){const ms=Array.isArray(m)?m:[m];ms.forEach(mt=>{const tc=new T.Color(hex);mt.userData.tint=tc;mt.onBeforeCompile=sh=>{sh.uniforms.uTint={value:tc};sh.fragmentShader='uniform vec3 uTint;\n'+sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 texelColor = texture2D( map, vUv );\n texelColor = mapTexelToLinear( texelColor );\n float lum = dot( texelColor.rgb, vec3( .299, .587, .114 ) );\n texelColor.rgb = uTint * ( .45 + 1.25 * lum );\n diffuseColor *= texelColor;\n#endif');};mt.customProgramCacheKey=()=>'tint'+hex;mt.needsUpdate=true;});}
 /* CAR-7b: per model, for every AI opponent drawn on it (named entries win). beardCol tints only the attached beard */
 const MODEL_VAR={lewis:{beard:1,beardCol:'#231a14',girth:1.06},brian:{hair2:'short',hairCol:'#3b2e24'},/* CAR-7d: a short dark crop on the bald model reads as a person at the oche (ChatGPT 'clearly better', r_brian) */bryce:{beard:1,beardSoft:1,beardCol:'#2a1f18'},pete:{beardSoft:1,beardCol:'#3b3632'}};/* CAR-7c: the soft beard is clearly better on Bryce and Pete (c14, c15); on Brian and Leonard it isn't (c12, c13, c16): they stay clean-shaven *//* c09-c11: the library beard reads patchy on pale skin (Brian, Leonard: ChatGPT 'no'); Brian's build alone is barely visible from behind: both unchanged *//* Pete (own grey hair + beard) and Bryce (long hair + tattoos) already read well at the oche; a beard on Bryce looked pasted on (ChatGPT, c06): no change */
 const NAMED_VAR={'big mal':{girth:1.12,beard:1,hairCol:'#2a2019'},/* beard + neck mark exactly as c04 (Hayden 19:01) */
 /* CAR-7c (Delivery QA 00:23): women's names drawn on a male model never get a beard (the model's look or Pete's forced beard), nor the build */
 'mere hohepa':{hairCol:'#2b201a'},/* CAR-7d: dark brown hair so the name fits (r_megan) */
 'lisa tane':{noBeard:1},'pania walters':{noBeard:1},'maia tuhoe':{noBeard:1},'ngaire pou':{noBeard:1}};
 function oppVar(name,ck){const k=String(name||'').toLowerCase();return Object.prototype.hasOwnProperty.call(NAMED_VAR,k)?NAMED_VAR[k]:(MODEL_VAR[ck]||null);}/* a named entry replaces the model's entry */
 // wider torso: scale the spine chain out sideways and forwards, and scale the neck and shoulders back so the head and arms keep their size
 function namedBuild(B,g){try{const sp=['Spine','Spine1','Spine2'].map(n=>B[n]).filter(Boolean);if(!sp.length)return;const k=Math.pow(g,1/sp.length);sp.forEach(b=>b.scale.set(k,1,k));
  const inv=1/g;['Neck','LeftShoulder','RightShoulder'].forEach(n=>{const b=B[n];if(!b)return;b.scale.set(inv,1,inv);/* keep the joints where they were: a fuller chest and belly, not wider shoulders */b.position.x*=inv;b.position.z*=inv;});}catch(e){}}
 function s3Rigged(look,name,tier){/* the S3 rig file, or until it lands the in-page rig as the carrier: the figure is the Vinyl Lab build either way, never a lifelike body (EXP e2e 12:28) */const ck=RIGS[S3_RIG]?S3_RIG:'remy',R=RIGS[ck];const fig=THREE.SkeletonUtils.clone(R.base);fig.userData.rigged=true;const B={};fig.traverse(o=>{if(o.isBone)B[o.name.replace(/^[a-z]+_/,'')]=o;});
  const meFig=s3MeBuild||!!(name&&save.name&&String(name).toUpperCase()===String(save.name).toUpperCase());const L=s3Look(look,name,meFig);
  try{s3Dress(fig,B,L);}catch(e){console.warn('s3 dress',e);}
  if(!B.RightEye&&B.Head){fig.updateMatrixWorld(true);[['RightEye',-1],['LeftEye',1]].forEach(([n,sx])=>{const e=new T.Object3D();e.name=ck+'_'+n;B.Head.add(e);e.position.set(sx*.032,.1,.085);B[n]=e;});}
  const dt=meFig?myDart(save.flight):oppDart(name);fig.add(dt);dt.matrixAutoUpdate=true;
  const v2s=fig.userData.s3v2;[0,1].forEach(k=>{const d=oppDart(name);d.scale.setScalar(v2s?S3_DART*V2DARTK:1/1.78*3.78*.85*S3_DART);/* v2: the same size as the dart in the throwing hand (the v1 spares were drawn 1.8x, 37 cm on the toy) */
   if(v2s){/* P1 4.05 (Hayden: 'the darts are in his arm'): the v1 spares lay along the hand toward the wrist and ran up the toy forearm. In v2 they
      sit across the closed fist (V2SPARE, hand-bone space): barrels in the curled fingers, points out past the little finger, flights out past
      the thumb, square to the forearm in every pose; v2Grip keeps the fingers closed round them */const q=V2SPARE;d.position.set(q.p[0],q.p[1]+k*q.gap[1],q.p[2]+k*q.gap[2]);d.rotation.set(q.rot[0],q.rot[1]+k*q.fan,q.rot[2]);}
   else{d.position.set(-.01+k*.03,.09,.0);d.rotation.set(1.6,0,0);}d.userData.spare=1;B.LeftHand.add(d);});
  fig.userData={rigged:true,B,dt,hand:B.RightHand,hips:[],ck,stand:false,noSp:false,s3fig:true,s3look:L,s3rig:fig.userData.s3rig,s3v2:fig.userData.s3v2};return fig;}
 function makeRigged(look,name,tier){if(window.TOPS_S3FLAG){if(!RIGS[S3_RIG])loadChar(S3_RIG);if(RIGS[S3_RIG]||RIGS.remy){const f=s3Rigged(look,name,tier);if(!RIGS[S3_RIG])f.userData.stand=true;/* swapped for the S3-rig build when it lands, like any stand-in */return f;}}/* S3 perf: until the one S3 rig file is in, the stand-in (in the page) and never the 3.55 character files (1.3 MB not used in S3, and fetched again on every fresh page); the hub swaps in the Lab figure when the rig lands */const ck=window.TOPS_S3FLAG?'remy':charKey(look,name);if(ck!=='remy'&&!RIGS[ck])loadChar(ck);const R=RIGS[ck]||RIGS.remy||{base:RIG.base};const isRemy=ck==='remy'||!RIGS[ck];
  const fig=THREE.SkeletonUtils.clone(R.base);fig.userData.rigged=true;const B={};fig.traverse(o=>{if(o.isBone)B[o.name.replace(/^[a-z]+_/,'')]=o;});
  if(!B.RightEye&&B.Head){fig.updateMatrixWorld(true);const hp=B.Head.getWorldPosition(new T.Vector3()),top=B.HeadTop_End?B.HeadTop_End.getWorldPosition(new T.Vector3()):hp.clone().add(new T.Vector3(0,.2,0));const hh=top.y-hp.y;
   [['RightEye',-1],['LeftEye',1]].forEach(([n,sx])=>{const e=new T.Object3D();e.name=ck+'_'+n;e.position.copy(hp).add(new T.Vector3(sx*.032,hh*.38,-.085));B.Head.attach(e);B[n]=e;});}
  const build=look.build||1;const wide=isRemy?[.93,1,1.12][build]:1;fig.traverse(o=>{if(o.isMesh&&!isRemy){o.castShadow=true;o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.envMapIntensity=/body/i.test(m.name)?.35:.5;});if(/Shirt|Hoody|Sweater|Vest/i.test(o.name)){if(look.kit&&KITS[look.kit])kitShirt(o.material,look.kit,o.geometry);else if(look.shirtTint&&look.shirt)tintShirt(o.material,look.shirt);}else if(ck==='lewis'&&!/Eyelash|Hair/i.test(o.name)){const kc=look.kit&&KITS[look.kit]?KITS[look.kit].c[0]:(look.shirtTint&&look.shirt?look.shirt:null);if(kc)keyShirt(o.material,kc);}return;}if(o.isMesh){o.castShadow=true;o.material=o.material.clone();const mn=o.material.name||'';
   if(/Top/i.test(mn)){o.material.map=shirtCanvas(look,name,tier);o.material.color.set(0xffffff);o.material.roughness=.9;}
   else if(/Body/i.test(mn)){const s=new T.Color(look.skin);const ref=new T.Color('#e8bfa0');o.material.color.set(new T.Color(s.r/ref.r,s.g/ref.g,s.b/ref.b).multiplyScalar(window.GFX_LIN?.62:1));o.material.roughness=.6;}
   else if(/Hair/i.test(mn)){if(look.hairStyle==='bald'){o.visible=false;}else{const hc=new T.Color(look.hair);const ref=new T.Color('#b08a5a');o.material.color.set(new T.Color(Math.min(1.4,hc.r/ref.r),Math.min(1.4,hc.g/ref.g),Math.min(1.4,hc.b/ref.b)));if(window.GFX_LIN){o.material.color.multiplyScalar(.28);o.material.roughness=Math.max(o.material.roughness,.75);o.material.envMapIntensity=.25;}}}
   else if(/Bottom/i.test(mn)){o.material.color.set(new T.Color(look.trousers||0x1b1e26).multiplyScalar(2.2));}
   else if(/Shoes/i.test(mn)){o.material.color.set(0xffffff);}
   if(window.GFX_LIN&&!/Hair/i.test(mn))o.material.envMapIntensity=/Body/i.test(mn)?.3:.6;}});
  /* CAR-7: a few named opponents get a build/beard so the name fits the figure (no face changes; table grows with the PDC tier) */
  const meFig=!!(name&&save.name&&String(name).toUpperCase()===String(save.name).toUpperCase());
  const NV=!isRemy&&!meFig&&oppVar(name,ck);if(NV){if(NV.noBeard)look=Object.assign({},look,{beard2:0});{const add={};if(NV.beard)add.beard2=1;if(NV.hairCol)add.hairCol=NV.hairCol;if(NV.beardCol)add.beardCol=NV.beardCol;if(NV.beardSoft)add.beardSoft=NV.beardSoft;/* 1, or {a,o,s} (stubble) */if(NV.hair2)add.hair2=NV.hair2;if(NV.skinTone)add.skinTone=NV.skinTone;if(Object.keys(add).length)look=Object.assign({},look,add);}/* CAR-7d: library hair and skin tone per entry too */if(NV.girth)namedBuild(B,NV.girth);}
  if(!isRemy)faceKit(fig,B,look,ck);
  fig.scale.set(wide,1,wide*.98);
  // dart in the right hand (placed in world space each frame), spares in the left
  const dt=(name&&save.name&&name.toUpperCase()===String(save.name).toUpperCase())?myDart(save.flight):oppDart(name);fig.add(dt);dt.matrixAutoUpdate=true;
  [0,1].forEach(k=>{const d=oppDart(name);d.scale.setScalar(1/1.78*3.78*.85);d.position.set(-.01+k*.03,.09,.0);d.rotation.set(1.6,0,0);d.userData.spare=1;B.LeftHand.add(d);});
  fig.userData={rigged:true,B,dt,hand:B.RightHand,hips:[],ck,stand:isRemy,noSp:!!(NV&&NV.girth)};if(window.TOPS_S3FLAG&&!isRemy)try{vinylFig(fig,B);}catch(e){console.warn('s3 vinyl',e);}/* wider build: the left arm rests further out and the spares poke into the oche view, so none are shown */return fig;}
 // aim a bone so the direction to its child matches dirWorld, preserving the rest roll
 const _tq=new T.Quaternion(),_tq2=new T.Quaternion(),_tv=new T.Vector3(),_tv2=new T.Vector3();
 function aimBone(bone,child,dirWorld,twist){const r=RIG.rest[bone.name],rc=RIG.rest[child.name];const restDir=_tv.subVectors(rc.p,r.p).normalize();const want=_tq.setFromUnitVectors(restDir,_tv2.copy(dirWorld).normalize()).multiply(r.q);
  bone.parent.updateWorldMatrix(true,false);const pq=bone.parent.getWorldQuaternion(_tq2);bone.quaternion.copy(pq.invert().multiply(want));if(twist)bone.rotateY(twist);bone.updateWorldMatrix(true,false);}
 // orient a bone by a full frame: its finger (child) axis and palm normal, relative to the T-pose where palms face down
 function aimFrame(bone,child,fDir,nDir){const r=RIG.rest[bone.name],rc=RIG.rest[child.name];const rf=new T.Vector3().subVectors(rc.p,r.p).normalize();const rn=new T.Vector3(0,-1,0);rn.addScaledVector(rf,-rn.dot(rf)).normalize();const rb=new T.Vector3().crossVectors(rf,rn);
  const f=fDir.clone().normalize();const n=nDir.clone();n.addScaledVector(f,-n.dot(f)).normalize();const bb=new T.Vector3().crossVectors(f,n);
  const Mr=new T.Matrix4().makeBasis(rf,rn,rb),M=new T.Matrix4().makeBasis(f,n,bb);const want=new T.Quaternion().setFromRotationMatrix(M.multiply(Mr.invert())).multiply(r.q);
  bone.parent.updateWorldMatrix(true,false);const pq=bone.parent.getWorldQuaternion(new T.Quaternion());bone.quaternion.copy(pq.invert().multiply(want));bone.updateWorldMatrix(true,false);}
 function boneW(b){b.updateWorldMatrix(true,false);return new T.Vector3().setFromMatrixPosition(b.matrixWorld);}
 function curl(B,side,amts){ // amts: [index,middle,ring,pinky,thumb] radians
  const names=['Index','Middle','Ring','Pinky'];names.forEach((n,i)=>{for(let k=1;k<=3;k++){const b=B[side+'Hand'+n+k];if(!b)continue;b.quaternion.copy(RIG.rest[b.name].lq);b.rotateX(amts[i]*(k===1?.9:1));}});
  for(let k=1;k<=3;k++){const b=B[side+'HandThumb'+k];if(!b)continue;b.quaternion.copy(RIG.rest[b.name].lq);if(k===1){b.rotateZ((side==='Right'?1:-1)*amts[4]*.7);b.rotateX(amts[4]*.5);}else b.rotateX(amts[4]*.7);}}
 function poseRigged(fig,oa,boardTarget,fpv){fig.userData.fpvNow=!!fpv;/* the match pane draws fpFig third-person (split view): only a first-person pose skips the v2 clearance */if(fig.userData.ck&&fig.userData.ck!=='remy'&&!oa.celebrate&&!oa.shush&&oa.phase!=='celebrate'){poseDarts(fig,oa,boardTarget,fpv);return;}const B=fig.userData.B;fig.updateWorldMatrix(true,true);const tp=throwPose(oa);if(fpv){tp.lift-=13;tp.phi+=2;}const rad=Math.PI/180;
  // reset posed bones to rest each frame
  ['RightShoulder','RightArm','RightForeArm','RightHand','LeftShoulder','LeftArm','LeftForeArm','LeftHand','Spine','Spine1','Neck','Head'].forEach(n=>{const b=B[n];if(!b)return;b.quaternion.copy(RIG.rest[b.name].lq);});
  const S0=B.RightArm;B.Spine1.rotateX(tp.lean*.8);
  // bring the shoulders down from the T-pose: aim upper arms downward first so lengths are measured sanely
  const S=boneW(S0);const fwd=new T.Vector3().subVectors(boardTarget,S);fwd.y=0;fwd.normalize();const right=new T.Vector3(-fwd.z,0,fwd.x),up=new T.Vector3(0,1,0);
  const L1=RIG.rest[B.RightArm.name].p.distanceTo(RIG.rest[B.RightForeArm.name].p)*fig.scale.y,L2=RIG.rest[B.RightForeArm.name].p.distanceTo(RIG.rest[B.RightHand.name].p)*fig.scale.y;
  let dirU,dirF,E,H,palmN,handDir,dartDir=null;
  if(fpv&&!tp.celebrate&&!tp.shush){ // first person: solve the arm to a hand target in front of the right eye (rear-grip POV reference)
   const eye=boneW(B.RightEye).lerp(boneW(B.LeftEye),.28);const sN=Math.max(0,Math.min(1,(tp.phi+72)/176));const fwdE=new T.Vector3().subVectors(boardTarget,eye);fwdE.y=0;fwdE.normalize();const rightE=new T.Vector3(-fwdE.z,0,fwdE.x);
   const hf=.13+.48*sN,hu=-.13+.26*sN-.2*sN*sN,hr=.165-.06*sN;H=eye.clone().addScaledVector(fwdE,hf).addScaledVector(up,hu).addScaledVector(rightE,hr);
   const dv=new T.Vector3().subVectors(H,S);let d=dv.length();const dmax=L1+L2-.01;if(d>dmax){dv.multiplyScalar(dmax/d);H.copy(S).add(dv);d=dmax;}const u=dv.clone().normalize();
   const pole=new T.Vector3(0,-1,0).addScaledVector(right,.55).addScaledVector(fwd,.1);pole.addScaledVector(u,-pole.dot(u)).normalize();
   const cosA=Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d)));const A=Math.acos(cosA);E=S.clone().addScaledVector(u,Math.cos(A)*L1).addScaledVector(pole,Math.sin(A)*L1);
   dirU=new T.Vector3().subVectors(E,S).normalize();dirF=new T.Vector3().subVectors(H,E).normalize();
   const a=(58+tp.wrist*.7)*rad;handDir=new T.Vector3().addScaledVector(fwd,Math.cos(a)).addScaledVector(up,Math.sin(a)).addScaledVector(right,-.12).normalize();
   palmN=new T.Vector3().addScaledVector(fwd,Math.sin(a)).addScaledVector(up,-Math.cos(a)).addScaledVector(right,.25).normalize();
   dartDir=new T.Vector3().subVectors(boardTarget,H).normalize().addScaledVector(up,Math.tan((tp.dart||6)*rad)*.9).normalize();
   aimBone(B.RightArm,B.RightForeArm,dirU,0);aimFrame(B.RightForeArm,B.RightHand,dirF,new T.Vector3().addScaledVector(right,-.4).addScaledVector(fwd,.5).addScaledVector(up,-.3));aimFrame(B.RightHand,B.RightHandMiddle1,handDir,palmN);
  }else{
  const inw=fpv?-.03:-.12,inf=fpv?.06:-.05;dirU=new T.Vector3().addScaledVector(fwd,Math.cos(tp.lift*rad)).addScaledVector(up,Math.sin(tp.lift*rad)).addScaledVector(right,inw).normalize();
  E=S.clone().addScaledVector(dirU,L1);dirF=new T.Vector3().addScaledVector(up,Math.cos(tp.phi*rad)).addScaledVector(fwd,Math.sin(tp.phi*rad)).addScaledVector(right,inf).normalize();
  H=E.clone().addScaledVector(dirF,L2);if(fig.userData.s3v2&&!fpv)v2ArmClear(fig,B,S,dirU,dirF,fwd);/* Vinyl v2.2: the celebrating fist clears the 2x head too */
  // hand frame in the throwing plane: fingers = forearm rotated by the wrist angle; palm faces the board/down (pronated rear grip), thumb under the barrel
  // address: palm to the ceiling, fingers pointing at the board and slightly up with the dart lying on them; backswing cocks the wrist (fingers rise); after release the hand pronates and points at the target
  // address (from the player's own description): palm to the ceiling, back of the wrist toward the board, fingers across the face, thumb pointing back under the barrel, dart on the thumb pointing at the board with index/middle tips resting on it.
  // backswing rotates the whole hand back with the dart tilt; after release the hand pronates and the fingers point at the target.
  const tilt=((tp.dart||14)-14)*rad;const rotR=(v)=>{const c=Math.cos(tilt),sn=Math.sin(tilt);const vf=v.dot(fwd),vu=v.dot(up),vr=v.dot(right);return new T.Vector3().addScaledVector(fwd,vf*c-vu*sn).addScaledVector(up,vf*sn+vu*c).addScaledVector(right,vr);};
  const pron=Math.max(0,Math.min(1,(tp.phi-45)/40));
  const h0=rotR(new T.Vector3().addScaledVector(right,-.92).addScaledVector(fwd,-.15).addScaledVector(up,.12).normalize()),n0=rotR(new T.Vector3().addScaledVector(up,.95).addScaledVector(fwd,-.22).addScaledVector(right,-.08).normalize());
  const h1=new T.Vector3().copy(fwd).addScaledVector(up,-.15).normalize(),n1=new T.Vector3().addScaledVector(right,-.7).addScaledVector(up,-.5).normalize();
  handDir=tp.celebrate?up.clone():tp.shush?new T.Vector3().addScaledVector(fwd,-.4).add(up).normalize():h0.lerp(h1,pron).normalize();
  palmN=n0.lerp(n1,pron).normalize();
  const foreN=new T.Vector3().addScaledVector(right,-.6).addScaledVector(up,.5*(1-pron)).addScaledVector(fwd,-.35*(1-pron)+.2*pron).normalize();
  aimBone(B.RightArm,B.RightForeArm,dirU,0);aimFrame(B.RightForeArm,B.RightHand,dirF,foreN);
  if(tp.celebrate)aimBone(B.RightHand,B.RightHandMiddle1,handDir,0);else aimFrame(B.RightHand,B.RightHandMiddle1,handDir,palmN);
  if(!tp.celebrate&&!tp.shush){const da=(tp.dart||0)*rad;dartDir=new T.Vector3().addScaledVector(fwd,Math.cos(da)).addScaledVector(up,Math.sin(da)).normalize();}}
  {const open=Math.max(0,Math.min(1,(tp.phi-40)/46));const c0=fpv?[.7,.75,1.1,1.3,.8]:[.9,.85,1.3,1.45,.25];curl(B,'Right',tp.celebrate?[1.4,1.4,1.4,1.4,.9]:c0.map((v,i)=>i<4?v*(1-open*.7):v*(1-open*.4)));}
  if(fig.userData.dt){const dt=fig.userData.dt;const ip=boneW(B.RightHandIndex2),tpos=boneW(fpv?B.RightHandThumb4:B.RightHandThumb3);const mid=fpv?ip.clone().lerp(tpos,.5):boneW(B.RightHandThumb2).lerp(boneW(B.RightHandThumb3),.6);if(fpv&&dartDir)mid.addScaledVector(up,.055).addScaledVector(dartDir,-.06).addScaledVector(right,-.02);else if(dartDir)mid.addScaledVector(palmN,.014);const dd=dartDir||handDir;const w=mid.clone().addScaledVector(dd,fpv?.012:.02);fig.worldToLocal(w);dt.position.copy(w);const m=new T.Matrix4().lookAt(mid.clone().add(dd),mid,up);const fq=fig.getWorldQuaternion(new T.Quaternion()).invert();dt.quaternion.copy(fq.multiply(new T.Quaternion().setFromRotationMatrix(m)));dt.rotateY(Math.PI);{const dk=fig.userData.s3fig?S3_DART*(fig.userData.s3v2?V2DARTK:1):1;dt.scale.set(dk/fig.scale.x,dk/fig.scale.y,dk/fig.scale.z);}}
  // left arm: spares at the sternum
  const LS=boneW(B.LeftArm);const chest=fig.localToWorld(new T.Vector3(fpv?-.3:-.3,fpv?.86:.86,fpv?.04:.06));const d=Math.min(L1+L2-.01,LS.distanceTo(chest));const u=new T.Vector3().subVectors(chest,LS).normalize();const pole=new T.Vector3().addScaledVector(right,-.7).addScaledVector(fwd,-.7);pole.addScaledVector(u,-pole.dot(u)).normalize();
  const cosA=(L1*L1+d*d-L2*L2)/(2*L1*d);const A=Math.acos(Math.max(-1,Math.min(1,cosA)));const LE=LS.clone().addScaledVector(u,Math.cos(A)*L1).addScaledVector(pole,Math.sin(A)*L1);
  const ln=new T.Vector3().copy(fwd).negate().addScaledVector(up,.3);aimBone(B.LeftArm,B.LeftForeArm,new T.Vector3().subVectors(LE,LS),0);aimFrame(B.LeftForeArm,B.LeftHand,new T.Vector3().subVectors(chest,LE),ln);aimFrame(B.LeftHand,B.LeftHandMiddle1,fig.userData.s3v2?new T.Vector3().subVectors(chest,LE).normalize():new T.Vector3().addScaledVector(right,.6).add(up).normalize(),ln)/* v2: a straight wrist, so the spares across the fist stay square to the forearm */;curl(B,'Left',[1.2,1.3,1.3,1.3,.8]);
  // head looks at the board
  const HD=boneW(B.Head);const look=new T.Vector3().subVectors(boardTarget,HD).normalize();aimBone(B.Head,B.HeadTop_End,new T.Vector3(0,1,0).addScaledVector(look,.12).normalize(),0);
  if(fig.userData.dt)fig.userData.dt.visible=!(oa.phase==='fly'||oa.phase==='follow'||oa.phase==='reset');}
 // GFX: darts arm for the Mixamo cast, built from explicit anatomical frames (authored + checked in Blender, blender/pose.py).
 // Set: forearm upright in front of the right eye, palm side of the wrist facing the board, wrist bent right back, dart on top pointing at the board.
 const DPH={set:{lift:-11,phi:-2,ext:70,dart:6},back:{lift:-11,phi:-20,ext:86,dart:20},rel:{lift:-6,phi:46,ext:32,dart:2},end:{lift:-1,phi:86,ext:-46,dart:-8}};
 /* #20e: dartPhase/poseDarts/setW run every frame for each rigged figure; they now reuse scratch objects (same maths, same order) instead of allocating ~6 KB a frame */
 const _dp={lift:0,phi:0,ext:0,dart:0};const _dpEase=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;function _dpMix(A,C,e){_dp.lift=A.lift+(C.lift-A.lift)*e;_dp.phi=A.phi+(C.phi-A.phi)*e;_dp.ext=A.ext+(C.ext-A.ext)*e;_dp.dart=A.dart+(C.dart-A.dart)*e;return _dp;}
 function dartPhase(oa){const ph=oa.phase||'idle',k=oa.k||0,p=oa.pull||0;/* returns one shared object, refilled each call: read it before the next call */
  if(ph==='pull')return _dpMix(DPH.set,DPH.back,1-Math.pow(1-Math.min(1,p),1.7));if(ph==='throw')return _dpMix(DPH.back,DPH.rel,Math.pow(Math.min(1,k),1.8));
  if(ph==='fly'||ph==='follow')return _dpMix(DPH.rel,DPH.end,1-Math.pow(1-Math.min(1,k),2));if(ph==='reset'){const a=_dpEase(Math.min(1,k*1.6)),b=_dpEase(Math.min(1,k));const m=_dpMix(DPH.end,DPH.set,b);m.phi=DPH.end.phi+(DPH.set.phi-DPH.end.phi)*a;m.ext=DPH.end.ext+(DPH.set.ext-DPH.end.ext)*a;return m;}return _dpMix(DPH.set,DPH.set,0);}
 const _M1=new T.Matrix4(),_M2=new T.Matrix4(),_Qa=new T.Quaternion(),_Qb=new T.Quaternion();
 const _RQI=new WeakMap();function restQI(bone){const r=RIG.rest[bone.name];let q=_RQI.get(r);if(!q){q=r.q.clone().invert();_RQI.set(r,q);}return q;}
 function restAxisTo(out,bone,w){return out.copy(w).applyQuaternion(restQI(bone)).normalize();}
 function restAxis(bone,w){return restAxisTo(new T.Vector3(),bone,w);}
 function boneWTo(out,b){b.updateWorldMatrix(true,false);return out.setFromMatrixPosition(b.matrixWorld);}
 const _wy=new T.Vector3(),_wrw=new T.Vector3(),_wly=new T.Vector3(),_wlr=new T.Vector3(),_wlz=new T.Vector3(),_wwz=new T.Vector3();
 function setW(bone,yW,refL,refW){const y=_wy.copy(yW).normalize();const rw=_wrw.copy(refW).addScaledVector(y,-refW.dot(y)).normalize();const ly=_wly.set(0,1,0);const lr=_wlr.copy(refL).addScaledVector(ly,-refL.dot(ly)).normalize();const lz=_wlz.crossVectors(lr,ly).negate();const wz=_wwz.crossVectors(rw,y).negate();
  _M1.makeBasis(lr,ly,lz);_M2.makeBasis(rw,y,wz);_M2.multiply(_M1.transpose());_Qa.setFromRotationMatrix(_M2);bone.parent.getWorldQuaternion(_Qb);bone.quaternion.copy(_Qb.invert().multiply(_Qa));bone.updateWorldMatrix(true,false);}
 const _pq=new T.Quaternion(),_pq2=new T.Quaternion(),_pm=new T.Matrix4(),_pe=new T.Euler(),_ra=new T.Vector3(),_pv=[];for(let i=0;i<24;i++)_pv.push(new T.Vector3());
 const PD_SKIP=/UpLeg|Leg$|Foot|Toe|Hips/,PD_RF=['Index','Middle','Ring','Pinky'].map((k,i)=>[[1,2,3].map(j=>'RightHand'+k+j),[.15,.2,.5,.6][i],[.35,.45,.9,1][i]]),PD_LF=['Index','Middle','Ring','Pinky'].map(k=>[1,2,3].map(j=>'LeftHand'+k+j)),PD_TH=[['RightHandThumb1',-.3,0,-.5],['RightHandThumb2',.3,0,0],['RightHandThumb3',.2,0,0]];
 /* Vinyl v2.2 (Director spec 11, Throw pose): with a skull ~0.59 m wide, the game's darts arm put the grip inside the head. Given the arm the
    pose asks for (upper arm dirU, forearm dirF from shoulder S), the hand is moved out of the skull ellipsoid grown by V2CLR.m (radii x1.04, as
    Director's v2-clear.js, plus the reach of the fingers round the dart), sideways and forward at its own height, so a hand under the eye lands at chin
    height beside and in front of the face; if the arm can't reach that, the hand slides out to the side instead. The arm is then re-solved as two bones with
    the elbow swung out to the side (V2CLR.out), the poster's elbow-out throw. dirU and dirF are set in place; returns true. */
 const V2CLR={m:.12,out:.9,back:.15,belt:.05};/* m: finger reach round the dart (m); out/back: elbow pole, to the side and slightly back */const _v2c=[];for(let i=0;i<8;i++)_v2c.push(new T.Vector3());const _v2m=new T.Matrix4();
 function v2ArmClear(fig,B,S,dirU,dirF,b,side){const u=fig.userData;let sk=u._v2sk;if(!sk||!sk.parent){sk=null;fig.traverse(o=>{if(!sk&&o.isMesh&&o.userData.tag==='skull')sk=o;});u._v2sk=sk;}if(!sk)return false;
  side=side||'Right';const A=B[side+'Arm'],F=B[side+'ForeArm'],Hb=B[side+'Hand'];if(!A||!F||!Hb)return false;sk.updateWorldMatrix(true,false);
  const L1=boneWTo(_v2c[0],A).distanceTo(boneWTo(_v2c[1],F)),L2=_v2c[1].distanceTo(boneWTo(_v2c[2],Hb)),reach=(L1+L2)*.995;
  const HM=(u.s3rig&&u.s3rig.headM)||1.04,ws=_v2c[3].setFromMatrixScale(sk.matrixWorld).x||1,r=V2P.head.r,g=V2CLR.m/ws,rx=r[0]*HM+g,ry=r[1]*HM+g,rz=r[2]*HM+g;_v2m.copy(sk.matrixWorld).invert();
  const H=_v2c[4].copy(S).addScaledVector(dirU,L1).addScaledVector(dirF,L2),l=_v2c[5],sp=B.Spine2||B.Spine1||B.Spine;
  const out=_v2c[6].copy(S);if(sp)out.sub(boneWTo(_v2c[7],sp));out.y=0;out.addScaledVector(b,-out.dot(b));if(out.lengthSq()<1e-8)out.set(1,0,0);out.normalize();
  for(let it=0;it<8;it++){l.copy(H).applyMatrix4(_v2m);const e=Math.hypot(l.x/rx,l.y/ry,l.z/rz);const d=H.distanceTo(S);if(e>=1&&d<=reach)break;
   if(e<1){const yy=(l.y/ry)*(l.y/ry),hh=(l.x/rx)*(l.x/rx)+(l.z/rz)*(l.z/rz);/* out sideways and forward at the same height (chin height stays chin height); radially only near the crown */
    if(yy<.9&&hh>1e-6){const k=Math.sqrt((1-yy)/hh)*1.002;l.x*=k;l.z*=k;}else l.multiplyScalar(1.002/e);l.applyMatrix4(sk.matrixWorld);H.copy(l);}if(H.distanceTo(S)>reach){H.sub(S).setLength(reach).add(S);if(it>1)H.addScaledVector(out,.03);}}
  const d=Math.max(1e-4,H.distanceTo(S)),uu=_v2c[5].copy(H).sub(S).divideScalar(d);const pole=_v2c[7].set(0,-1,0).addScaledVector(out,V2CLR.out).addScaledVector(b,-V2CLR.back);pole.addScaledVector(uu,-pole.dot(uu)).normalize();
  const cA=Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))),sA=Math.sqrt(1-cA*cA);const E=_v2c[3].copy(S).addScaledVector(uu,cA*L1).addScaledVector(pole,sA*L1);
  dirU.copy(E).sub(S).normalize();dirF.copy(H).sub(E).normalize();return true;}
 window.TOPS_V2CLR=V2CLR;
 /* the same rule after any clip (walk-on hero cheer, bar extras drinking or arguing, the celebration pump): Mixamo clips were made for a
    small head. Run on each v2 figure just before it is drawn (s3SkinAll), after the clip or poseDarts has set the bones: an arm whose hand, a
    fingertip, the forearm or the upper arm is inside the grown skull gets the hand moved out (as above, a little further each try) and the two bones turned to
    the new elbow and hand. The bones are turned, not rebuilt, so the clip's twist and the hand pose stay; an arm already clear is not touched */
 const _v2p=[];for(let i=0;i<12;i++)_v2p.push(new T.Vector3());const _v2q=new T.Quaternion(),_v2q2=new T.Quaternion();
 function v2Turn(bone,from,to){bone.getWorldQuaternion(_v2q2);_v2q.setFromUnitVectors(from,to).multiply(_v2q2);bone.parent.getWorldQuaternion(_v2q2);bone.quaternion.copy(_v2q2.invert().multiply(_v2q));bone.updateWorldMatrix(false,true);}
 /* the spare darts in the off hand (hand-bone space, metres): barrel centre, the second dart's offset, turn (point toward +x = the little
    finger side), a small fan between the two; the fingers' curl (radians at the first joint, then x curl2 at the next two) that closes on them */
 const V2SPARE={p:[.004,.118,.032],gap:[.006,.0,.022],rot:[0,-Math.PI/2,0],fan:.1,curl:[1.3,1.38,1.46,1.52],curl2:.92};
 const _v2g=[new T.Vector3(),new T.Vector3(),new T.Vector3(),new T.Matrix4(),new T.Quaternion(),new T.Vector3()],_v2fi=new T.Matrix4(),_v2e=new T.Euler();
 function v2Close(B,sd){['Index','Middle','Ring','Pinky'].forEach((f,i)=>{for(let j=1;j<=3;j++){const b=B[sd+'Hand'+f+j],rs=b&&RIG.rest[b.name];if(!rs)continue;b.quaternion.copy(rs.lq);b.rotateX(V2SPARE.curl[i]*(j===1?1:V2SPARE.curl2));}});}
 /* the angle (deg) between the hand's across-the-knuckles axis (where the darts lie) and its forearm */
 function v2WristAng(B,sd){const H=B[sd+'Hand'],F=B[sd+'ForeArm'];const x=_v2g[0].set(1,0,0).transformDirection(H.matrixWorld),f=_v2g[1].subVectors(H.getWorldPosition(_v2g[2]),F.getWorldPosition(_v2g[5])).normalize();return Math.acos(Math.min(1,Math.abs(x.dot(f))))*180/Math.PI;}
 function v2Grip(fig){const u=fig.userData,B=u.B;if(!B||!B.LeftHand)return;let has=false;for(const c of B.LeftHand.children)if(c.userData.spare&&c.visible){has=true;break;}
  if(has){v2Close(B,'Left');B.LeftHand.updateWorldMatrix(false,true);
   /* a clip that bends the wrist hard (the hero cheer) would lay the darts back along the forearm: the wrist eases toward straight until they are 65 deg clear */
   const rs=RIG.rest[B.LeftHand.name];for(let it=0;it<4&&rs&&v2WristAng(B,'Left')<65;it++){B.LeftHand.quaternion.slerp(rs.lq,.5);B.LeftHand.updateWorldMatrix(false,true);}}
  /* the throwing dart outside the darts arm (a clip: the walk-on, the hero cheer, the pump): poseDarts didn't place it this frame, so it is held in
     the right fist the same way, mirrored, instead of hanging where the last throw pose left it */
  const dt=u.dt,act=u.act;u._dtFist=false;if(dt&&dt.visible&&!(u.fpv&&u.fpvNow!==false)&&B.RightHand&&act&&act.isScheduled()&&!(performance.now()-(u._pdT||-1e9)<150)){u._dtFist=true;v2Close(B,'Right');const rs=RIG.rest[B.RightHand.name];B.RightHand.updateWorldMatrix(false,true);
   for(let it=0;it<4&&rs&&v2WristAng(B,'Right')<65;it++){B.RightHand.quaternion.slerp(rs.lq,.5);B.RightHand.updateWorldMatrix(false,true);}v2DtFist(fig);}}
 /* the throwing dart into the right fist (hand-bone space, V2SPARE mirrored); run again after the arm clearance moves the hand */
 function v2DtFist(fig){const u=fig.userData,B=u.B,dt=u.dt;if(!u._dtFist||!dt)return;{
   const q=V2SPARE,m=_v2g[3].compose(_v2g[0].set(-q.p[0],q.p[1],q.p[2]),_v2g[4].setFromEuler(_v2e.set(q.rot[0],-q.rot[1],q.rot[2])),_v2g[1].set(1,1,1));
   m.premultiply(B.RightHand.matrixWorld).premultiply(_v2fi.copy(fig.matrixWorld).invert());m.decompose(dt.position,dt.quaternion,_v2g[2]);dt.scale.setScalar(S3_DART*V2DARTK*(_v2g[2].x||1));dt.updateMatrixWorld(true);}}
 const V2TIPS=['Index','Middle','Ring','Pinky','Thumb'].flatMap(f=>[2,3,4].map(j=>f+j));
 /* the shirt's own outline in chest space (the lathe in s3BuildV2): radius x, radius z at height y, or null above the collar / below the hem */
 function v2TorsoR(y,BK){const t=V2P.torso,y0=t.y0-V2P.leg.hipY-.3,h=t.y1-t.y0,v=(y-y0)/h;if(v<0||v>1)return null;let r=.97+.05*Math.sin(v*Math.PI*.9)+(t.belly+BK[2])*Math.sin(v*Math.PI)*2+.06*Math.max(0,1-v/.18);if(v>.78)r*=Math.cos((v-.78)/.22*Math.PI*.42);r=Math.max(.06,r);return [t.rx*BK[0]*r,t.rz*BK[1]*r];}
 const _v2sks=[];{for(let i=0;i<40;i++){const th=Math.PI*(.55+.45*((i%5)/4)),ph=(Math.floor(i/5)/8)*Math.PI*2;_v2sks.push([Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)]);}}
 function v2PostClear(fig,only,fresh){/* fresh: the caller has just updated the figure's world matrices */const u=fig.userData,B=u.B,R3=u.s3rig;if(!B||!u.s3v2||!R3)return 0;let sk=u._v2sk;if(!sk||!sk.parent){sk=null;fig.traverse(o=>{if(!sk&&o.isMesh&&o.userData.tag==='skull')sk=o;});u._v2sk=sk;}const cb=R3.chest&&R3.chest.userData.box;if(!sk||!cb)return 0;
  const BK=(R3.v3?V2BODY.standard:V2BODY[(u.s3look&&u.s3look.body)||'standard']||V2BODY.standard);
  /* a figure whose pose hasn't moved since it was last cleared (the frozen bar extras, a held hero pose) costs one comparison */
  if(!fresh)fig.updateMatrixWorld(true);  if(!only)v2Grip(fig);/* the off hand closes on the spares after every clip (the clips open it) */
  const sigB=[B.RightHand,B.LeftHand,B.Head,B.LeftHandMiddle2];let sig=0;for(const b of sigB)if(b){const e=b.matrixWorld.elements;sig+=e[12]*1.3+e[13]*2.1+e[14]*3.7+e[0]+e[5]*.7;}if(!only&&u._v2sig===sig)return 0;
  _v2m.copy(sk.matrixWorld).invert();const ws=_v2p[0].setFromMatrixScale(sk.matrixWorld).x||1,r=V2P.head.r,l=_v2p[1],SF=R3.skullF,HMk=SF?1.05:1.04,TR=R3.torsoR||v2TorsoR,AM=R3.armM||1;let HM=HMk;const cm=new T.Matrix4().copy(cb.matrixWorld).invert(),cs=new T.Vector3().setFromMatrixScale(cb.matrixWorld).x||1;
  /* e < 1: the point (with margin m, metres) is inside the skull x1.04 (vol 0) or the shirt (vol 1) */
  const evS=(P,m)=>{l.copy(P).applyMatrix4(_v2m);const g=m/ws;if(SF)HM=HMk*SF(l);return Math.hypot(l.x/(r[0]*HM+g),l.y/(r[1]*HM+g),l.z/(r[2]*HM+g));};
  /* the shirt's lower part follows the hips (s3SkinFig): a chest-space point is taken back to the shirt's rest space first (one step of the
     inverse of that blend), so a fist at the belt is tested against the shirt where it is drawn */
  const hb3=R3.hips&&R3.hips.userData.box,Mr=hb3&&R3.bind?new T.Matrix4().copy(cm).multiply(hb3.matrixWorld).multiply(R3.bind):null,SY=R3.skinY||[-.1,-.3],sw=y=>{const q=(SY[0]-y)/(SY[0]-SY[1]);return y>SY[0]?0:y<SY[1]?1:q*q*(3-2*q);},_d=new T.Vector3();
  const toRest=v=>{const w=Mr?sw(v.y):0;if(w>0){_d.copy(v).applyMatrix4(Mr).sub(v);v.addScaledVector(_d,-w);}return v;},fromRest=v=>{const w=Mr?sw(v.y):0;if(w>0){_d.copy(v).applyMatrix4(Mr).sub(v);v.addScaledVector(_d,w);}return v;};
  /* tested both as drawn in chest space and taken back to the shirt's rest space; the tighter of the two wins (the blend's inverse is one step) */
  const eT=(P,m,rest)=>{l.copy(P).applyMatrix4(cm);if(rest)toRest(l);const rr=TR(l.y,BK);if(!rr)return 9;const g=(m+(l.y<SY[0]?V2CLR.belt:0))/cs;return Math.hypot(l.x/(rr[0]+g),l.z/(rr[1]+g));};
  const evT=(P,m)=>Math.min(eT(P,m,false),eT(P,m,true));
  const pushT=(P,m,out)=>{const rest=eT(P,m,true)<eT(P,m,false);l.copy(P).applyMatrix4(cm);if(rest)toRest(l);const rr=TR(l.y,BK),g=(m+(l.y<SY[0]?V2CLR.belt:0))/cs;const e=Math.hypot(l.x/(rr[0]+g),l.z/(rr[1]+g));
   if(e<1e-3){l.z+=rr[1]+g;}else{l.x*=1.01/e;l.z*=1.01/e;}if(rest)fromRest(l);return out.copy(l).applyMatrix4(cb.matrixWorld);};
  /* where a point with margin m must go: out sideways and forward at its own height (the skull: radially only near the crown) */
  /* above the mouth (arms up: the hero cheer, a hand to the head) the arm goes out to its own side, past the ear, rather than across the face (Director: forearms outside the ears) */
  const pushS=(P,m,out,sg)=>{l.copy(P).applyMatrix4(_v2m);if(SF)HM=HMk*SF(l);const g=m/ws,rx=r[0]*HM+g,ry=r[1]*HM+g,rz=r[2]*HM+g;const yy=(l.y/ry)**2,hh=(l.x/rx)**2+(l.z/rz)**2;
   if(sg&&l.y>-.2*ry&&yy+(l.z/rz)**2<.97){l.x=sg*rx*Math.sqrt(1-yy-(l.z/rz)**2)*1.004;}
   else if(yy<.9&&hh>1e-6){const k=Math.sqrt((1-yy)/hh)*1.004;l.x*=k;l.z*=k;}else l.multiplyScalar(1.004/Math.max(1e-3,Math.sqrt(yy+hh)));return out.copy(l).applyMatrix4(sk.matrixWorld);};
  const fwd=_v2p[2].set(0,0,-1).applyQuaternion(fig.getWorldQuaternion(_v2q)).setY(0).normalize(),hc=_v2p[3].set(0,0,0).applyMatrix4(sk.matrixWorld);let n=0;
  /* the head: a clip that drops the chin to the chest (the hero cheer's first beat) sinks the 2x skull into the collar; the neck and head go back toward their rest until clear */
  if(!only){const Nk=B.Neck,Hd=B.Head;for(let it=0;it<4&&Hd;it++){let hit=false;for(const q of _v2sks){l.set(q[0]*r[0],q[1]*r[1],q[2]*r[2]);if(SF)l.multiplyScalar(SF(l));l.applyMatrix4(sk.matrixWorld);if(evT(l,R3.v3?.004:0)<1.005){hit=true;break;}}/* v3 only: the sampled jaw is the shaped skull's (fuller lower cheeks) and gets a 4 mm margin; v2 keeps the 4.18 test exactly (Q&D iso.js) */if(!hit)break;if(!it)n++;
    [Nk,Hd].forEach(b=>{const rs=b&&RIG.rest[b.name];if(rs)b.quaternion.slerp(rs.lq,.5);});(Nk||Hd).updateWorldMatrix(false,true);_v2m.copy(sk.matrixWorld).invert();}}
  for(const sd of only||['Right','Left']){const A=B[sd+'Arm'],F=B[sd+'ForeArm'],Hb=B[sd+'Hand'];if(!A||!F||!Hb)continue;const tips=V2TIPS.map(k=>B[sd+'Hand'+k]).filter(Boolean),kn=B[sd+'HandMiddle1'];
   const wa=R3[sd==='Right'?'aL':'aR']/* the Lab's aL hangs on the Right bones */,wb=wa&&wa.wr&&wa.wr.userData.box;const fl=[];if(wb)wb.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)fl.push(o);});
   /* a clip that shrugs the shoulder up (the hero cheer) lifts the puffed sleeve into the jaw: the collarbone goes back to its rest */
   {const SH=B[sd+'Shoulder'],rs=SH&&RIG.rest[SH.name];if(rs&&evS(boneWTo(_v2p[4],A),.12)<1){SH.quaternion.copy(rs.lq);SH.updateWorldMatrix(false,true);}}
   for(let pass=0;pass<8;pass++){const S=boneWTo(_v2p[4],A),E=boneWTo(_v2p[5],F),H=boneWTo(_v2p[6],Hb),P=_v2p[7];
    let we=1,wp=null,wm=0,wv=0;const hp=(Q,ms,mt)=>{let e=evS(Q,ms);if(e<we){we=e;wp=Q.clone();wm=ms;wv=0;}e=evT(Q,mt);if(e<we){we=e;wp=Q.clone();wm=mt;wv=1;}};
    const dl=sd==='Left'?B.LeftHand.children.filter(c=>c.userData.spare&&c.visible):(u._dtFist&&u.dt?[u.dt]:[]);/* the darts held in this hand move with it */
    hp(H,.07,.04);const near=evS(H,dl.length?.34:.24)<1||evT(H,dl.length?.3:.17)<1;/* the fingers and the fist's vertices are only looked at when the hand is near the head or the body */
    if(near){const hk=R3.handK||1;if(kn)hp(boneWTo(P,kn),.06*hk,.045);tips.forEach(t=>hp(boneWTo(P,t),.032*hk+(SF?.004:0),.022));}/* v3: the fingers are 1.2x thicker, so their reach round the bone is too */
    /* the fist itself, vertex by vertex (what the clip check measures): none inside the skull or the shirt */
    if(near)for(const d of dl)d.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=4){P.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld);hp(P,.004,.006);}});
    if(near)for(const o of fl){const g=o.geometry.attributes.position;for(let i=0;i<g.count;i+=3){P.fromBufferAttribute(g,i).applyMatrix4(o.matrixWorld);hp(P,SF?.006:0,.008);}}/* v3: every third palm vertex is sampled, so a 6 mm skull margin covers the ones between (Tama's round cheeks caught one at 3 mm) */
    let armIn=false;[[S,E,.1,.12],[S,E,.25,.11],[S,E,.6,.085],[E,H,0,.085],[E,H,.5,.085]].forEach(([a,b2,t,m])=>{if(evS(P.lerpVectors(a,b2,t),m*AM)<1)armIn=true;});
    if(!wp&&!armIn)break;if(!pass)n++;
    const sg=Math.sign(l.copy(S).applyMatrix4(_v2m).x)||1;
    const out=_v2p[8].subVectors(S,hc);out.y=0;if(out.lengthSq()<1e-8)out.set(sd==='Right'?1:-1,0,0);out.normalize();
    const L1=S.distanceTo(E),L2=E.distanceTo(H),reach=(L1+L2)*.995;const d0U=_v2p[9].subVectors(E,S).normalize(),d0F=_v2p[10].subVectors(H,E).normalize();
    const NH=_v2p[11].copy(H);if(wp)NH.add((wv?pushT(wp,wm,P):pushS(wp,wm,P,sg)).sub(wp)).addScaledVector(out,.004*(pass+1));if(armIn)NH.addScaledVector(out,.05*(pass+1));if(NH.distanceTo(S)>reach)NH.sub(S).setLength(reach).add(S);
    const d=Math.max(1e-4,NH.distanceTo(S)),uu=P.subVectors(NH,S).divideScalar(d),pole=_v2p[1].set(0,-1,0).addScaledVector(out,V2CLR.out+pass*.3).addScaledVector(fwd,-V2CLR.back);pole.addScaledVector(uu,-pole.dot(uu)).normalize();
    const cA=Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d)));E.copy(S).addScaledVector(uu,cA*L1).addScaledVector(pole,Math.sqrt(1-cA*cA)*L1);
    v2Turn(A,d0U,P.subVectors(E,S).normalize());const nF=boneWTo(_v2p[5],F),nH=boneWTo(_v2p[6],Hb);v2Turn(F,d0F.subVectors(nH,nF).normalize(),P.subVectors(NH,nF).normalize());fig.updateMatrixWorld(true);}}
  if(!only)v2DtFist(fig);
  if(!only){let g2=0;for(const b of sigB)if(b){const e=b.matrixWorld.elements;g2+=e[12]*1.3+e[13]*2.1+e[14]*3.7+e[0]+e[5]*.7;}u._v2sig=g2;}
  return n;}
 window.TOPS_V2POST=v2PostClear;
 /* doc 17 must-fix #3 (throw spacing, ChatGPT on Director's base v2): the three throw frames barely differed in the match pane. The hand
    now follows set positions in the head's frame, in head widths (hw) from the skull centre: [out to the throwing side, up, forward to the
    board]; the elbow follows its own pole per frame so the silhouette changes:
      aim       dart at the chin / mouth line, beside and in front of the face
      draw-back 16% hw back (spec 12-18), lifted and out toward the ear, the elbow up near shoulder height (upper arm near horizontal)
      release   23% hw forward of the draw-back (spec 18-25), in toward the board line, the elbow down and forward
      follow    arm extended toward the board, low; fingers open from the release (fly)
    Between them the game's own timing (pull, throw k, fly k, reset k) blends the frames. Aim maths are untouched: the flight reads the
    board target, the hand only shows where the dart leaves from. */
 /* the darts in a v2 toy's hands, x the S3 dart size: at 1.35 the dart read as a toothpick in the 2x toy hand (the poster's dart is chunky); the
    darts in the air and in the board keep their size */
 const V2DARTK=1.4;
 /* the match face-cam swing for v2 throwers (degrees from the board line): 32 showed the throw end-on (aim, draw-back and release overlap in
    depth); at 50 the face is near front-on like the poster and the throw reads across the frame */
 const V2CAMA=50;
 /* round 5 #7 (ChatGPT on Kai v4): draw-back ~21% hw back of the aim (was 16), release ~55% hw forward of the draw-back and ~34% past the aim (was 23 / 7), at the eye line with the elbow out and the forearm tipping to the board */
 /* Q&D 20 Nov: the release sits further out and forward (.44/.74 -> .56/.82 hw): on the way there the dart's flight crossed Kai's cheek for 1-2 frames.
    Closest throwing dart to the skull (1 = surface) over every base and opponent, throw k in .025 steps: 1.059 (Ray; was .973), Kai 1.126 (was 1.014) */
 const V2THROW={aim:{h:[.62,-.30,.40],pole:[.9,-1,0]},back:{h:[.77,-.17,.19],pole:[1.0,-.25,-.4]},rel:{h:[.56,-.24,.82],pole:[.8,-.5,0]},end:{h:[.24,-.52,.96],pole:[.6,-.9,0]}};
 /* v2 wrist and fingers through the throw: the wrist cocks further back on the draw-back and snaps through on the release (degrees added
    to the game's own wrist), and the fingers start to part over the last of the throw (30%, the dart still in them) and open fully as it leaves (fly), instead of in one frame, wider than v1 (spread, the
    thumb off the barrel), so the hand reads as letting go */
 const V2WRIST={back:16,rel:-18,end:-10};
 const V2OPEN={from:.8,pre:.3,curl:[-.12,-.06,.12,.22],thumb:[-.05,0,-.95]};
 function v2WristAdd(oa){const ph=oa&&oa.phase||'idle',k=Math.min(1,oa&&oa.k||0),p=Math.min(1,oa&&oa.pull||0),W=V2WRIST;if(ph==='pull')return W.back*p;if(ph==='throw')return W.back+(W.rel-W.back)*Math.pow(k,1.4);if(ph==='fly'||ph==='follow')return W.rel+(W.end-W.rel)*k;if(ph==='reset')return W.end*(1-k);return 0;}
 function v2Open(oa){const ph=oa&&oa.phase||'idle',k=Math.min(1,oa&&oa.k||0);if(ph==='throw'){const x=Math.max(0,(k-V2OPEN.from)/(1-V2OPEN.from));return V2OPEN.pre*x*x*(3-2*x);}if(ph==='fly'||ph==='follow'){const x=Math.min(1,k/.3);return V2OPEN.pre+(1-V2OPEN.pre)*x*(2-x);}if(ph==='reset')return Math.max(0,1-k*1.5);return 0;}
 const _v2t=[];for(let i=0;i<8;i++)_v2t.push(new T.Vector3());
 function v2ThrowKey(oa,K){K=K||V2THROW;const ph=oa.phase||'idle',k=Math.min(1,oa.k||0),p=Math.min(1,oa.pull||0),e=x=>x*x*(3-2*x);
  if(ph==='pull')return [K.aim,K.back,1-Math.pow(1-p,1.7)];if(ph==='throw')return [K.back,K.rel,Math.pow(k,1.8)];if(ph==='fly'||ph==='follow')return [K.rel,K.end,1-Math.pow(1-k,2)];
  if(ph==='reset')return [K.end,K.aim,e(k)];if(ph==='idle'||ph==='aim'||!ph)return [K.aim,K.aim,0];return null;}
 function v2ThrowArm(fig,B,S,dirU,dirF,b,oa){const kf=v2ThrowKey(oa||{},fig.userData.s3rig&&fig.userData.s3rig.v3?V3THROW:V2THROW);if(!kf)return false;const u=fig.userData;let sk=u._v2sk;if(!sk||!sk.parent){sk=null;fig.traverse(o=>{if(!sk&&o.isMesh&&o.userData.tag==='skull')sk=o;});u._v2sk=sk;}if(!sk)return false;
  sk.updateWorldMatrix(true,false);const C=sk.getWorldPosition(_v2t[0]),hw=2*V2P.head.r[0]*_v2t[1].setFromMatrixScale(sk.matrixWorld).x;
  const up=_v2t[2].set(0,1,0),out=_v2t[3].subVectors(S,C);out.y=0;out.addScaledVector(b,-out.dot(b));if(out.lengthSq()<1e-8)out.crossVectors(b,up);out.normalize();
  const [A,Bk,t]=kf,mix=(a,c)=>a+(c-a)*t;const hx=mix(A.h[0],Bk.h[0]),hy=mix(A.h[1],Bk.h[1]),hz=mix(A.h[2],Bk.h[2]);
  const H=_v2t[4].copy(C).addScaledVector(out,hx*hw).addScaledVector(up,hy*hw).addScaledVector(b,hz*hw);
  const L1=boneWTo(_v2t[5],B.RightArm).distanceTo(boneWTo(_v2t[6],B.RightForeArm)),L2=_v2t[6].distanceTo(boneWTo(_v2t[7],B.RightHand)),reach=(L1+L2)*.995;
  if(H.distanceTo(S)>reach)H.sub(S).setLength(reach).add(S);const d=Math.max(1e-4,H.distanceTo(S)),uu=_v2t[5].subVectors(H,S).divideScalar(d);
  const pole=_v2t[6].set(0,0,0).addScaledVector(out,mix(A.pole[0],Bk.pole[0])).addScaledVector(up,mix(A.pole[1],Bk.pole[1])).addScaledVector(b,mix(A.pole[2],Bk.pole[2]));pole.addScaledVector(uu,-pole.dot(uu)).normalize();
  const cA=Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))),sA=Math.sqrt(1-cA*cA);const E=_v2t[7].copy(S).addScaledVector(uu,cA*L1).addScaledVector(pole,sA*L1);
  dirU.copy(E).sub(S).normalize();dirF.copy(H).sub(E).normalize();return true;}
 /* the face-cam looks from the board side, so a dart aimed level points at the camera and shows as a dot: in the set and draw-back the v2
    dart tips up (degrees added to the game's own), coming level by the release, as on the poster */
 const V2DARTP={aim:28,back:34,rel:0};
 function v2DartPitch(oa){const ph=oa&&oa.phase||'idle',k=Math.min(1,oa&&oa.k||0),p=Math.min(1,oa&&oa.pull||0),D=V2DARTP;if(ph==='pull')return D.aim+(D.back-D.aim)*p;if(ph==='throw')return D.back+(D.rel-D.back)*Math.pow(k,1.2);if(ph==='idle'||ph==='aim')return D.aim;if(ph==='reset')return D.aim*k;return 0;}
 window.TOPS_V2THROW=V2THROW;
 /* v3 heads (?v3=1): the fuller v3 cheeks sit in the release path, so the release goes further out and forward again (same aim, draw-back, follow-through): closest throwing dart to the 1.04 skull, Kai 1.10, Ray 1.10, Tama 1.08 (was .95) */
 const V3THROW=Object.assign({},V2THROW,{rel:{h:[.70,-.24,.86],pole:[.8,-.5,0]}});window.TOPS_V3THROW=V3THROW;
 function poseDarts(fig,oa,boardTarget,fpv){const B=fig.userData.B,R=RIG.rest,rad=Math.PI/180;fig.userData._pdT=performance.now();fig.updateWorldMatrix(true,true);
  let rs=fig.userData._pdRest;if(!rs||fig.userData._pdB!==B){rs=[];Object.keys(B).forEach(n=>{const b=B[n];if(b&&b.isBone&&!PD_SKIP.test(n))rs.push(b);});fig.userData._pdRest=rs;fig.userData._pdB=B;}
  for(let i=0;i<rs.length;i++){const b=rs[i],r=R[b.name];if(r)b.quaternion.copy(r.lq);}fig.updateWorldMatrix(true,true);
  const P=dartPhase(oa);if(fpv){P.lift-=4;}
  {const sp=B.Spine1||B.Spine;if(sp&&!fpv){const ph=oa.phase||'idle',kk=oa.k||0,tt=performance.now()/1000;const lean=5+(ph==='pull'?-.6*(oa.pull||0):ph==='throw'?1.2*kk:ph==='fly'||ph==='follow'?1.6:ph==='reset'?1.6*(1-kk):.35*Math.sin(tt*1.5));const fq0=fig.getWorldQuaternion(_pq);const rt0=_pv[0].set(1,0,0).applyQuaternion(fq0);sp.rotateOnWorldAxis(rt0,-lean*rad);fig.updateWorldMatrix(true,true);}}const up=_pv[1].set(0,1,0);const fq=fig.getWorldQuaternion(_pq);const fwdC=_pv[2].set(0,0,-1).applyQuaternion(fq),rtC=_pv[3].set(1,0,0).applyQuaternion(fq);
  const S=boneWTo(_pv[4],B.RightArm);const b=_pv[5].subVectors(boardTarget,S);b.y=0;b.normalize();const lat=_pv[6].crossVectors(up,b).normalize();
  const dirU=_pv[7].copy(b).multiplyScalar(Math.cos(P.lift*rad)).addScaledVector(up,Math.sin(P.lift*rad)).addScaledVector(lat,.32).normalize();
  const ph=P.phi*rad;const dirF=_pv[9].copy(up).multiplyScalar(Math.cos(ph)).addScaledVector(b,Math.sin(ph)).normalize();const pside=_pv[10].copy(b).multiplyScalar(Math.cos(ph)).addScaledVector(up,-Math.sin(ph)).normalize();
  /* Vinyl v2.2: the 2x head. The grip is moved clear of the skull (chin height, in front of the face) and the arm re-solved with the elbow out */
  if(fig.userData.s3v2&&!fpv&&(v2ThrowArm(fig,B,S,dirU,dirF,b,oa)||v2ArmClear(fig,B,S,dirU,dirF,b))){pside.addScaledVector(dirF,-pside.dot(dirF)).normalize();}
  const hinge=_pv[8].crossVectors(dirU,up).normalize();setW(B.RightArm,dirU,restAxisTo(_ra,B.RightArm,up),hinge);
  const DN=_pv[11].set(0,-1,0);setW(B.RightForeArm,dirF,restAxisTo(_ra,B.RightForeArm,DN),pside);
  const v2t=fig.userData.s3v2&&!fpv;const ex=(P.ext+(v2t?v2WristAdd(oa):0))*rad;const fing=_pv[12].copy(dirF).multiplyScalar(Math.cos(ex)).addScaledVector(pside,-Math.sin(ex)).normalize();const palm=_pv[13].copy(pside).multiplyScalar(Math.cos(ex)).addScaledVector(dirF,Math.sin(ex)).normalize();
  setW(B.RightHand,fing,restAxisTo(_ra,B.RightHand,DN),palm);
  const rel=oa.phase==='fly'||oa.phase==='follow'||oa.phase==='reset';
  const F19=!!(fig.userData.s3rig&&fig.userData.s3rig.v3)&&window.TOPS_HANDS19!==0&&window.TOPS_FIST19!==0;const vo=v2t?v2Open(oa):0;for(let f=0;f<4;f++){const nm=PD_RF[f][0],c=v2t?(F19?PD_RF[f][2]*(1-(window.TOPS_FIST_LOOSE!=null?window.TOPS_FIST_LOOSE:0.22)*vo):PD_RF[f][2]+(V2OPEN.curl[f]-PD_RF[f][2])*vo):rel?PD_RF[f][1]:PD_RF[f][2];for(let j=0;j<3;j++){const bn=B[nm[j]];if(!bn)continue;bn.quaternion.copy(R[bn.name].lq);bn.rotateX(c*(j===0?1:.8));if(j===0&&vo&&!F19)bn.rotateZ((f-1.5)*.09*vo);}}/* r19 (doc 52): after release a v3 hand stays a loose dart-forward fist, no open wave */
  for(let t=0;t<3;t++){const e=PD_TH[t];const bn=B[e[0]];if(!bn)continue;const th=t===0&&vo&&!F19?V2OPEN.thumb:null;bn.quaternion.copy(R[bn.name].lq).multiply(_Qa.setFromEuler(th?_pe.set(e[1]+(th[0]-e[1])*vo,e[2]+(th[1]-e[2])*vo,e[3]+(th[2]-e[3])*vo,'ZYX'):_pe.set(e[1],e[2],e[3],'ZYX')));}
  // left arm: hangs, forearm across the stomach with the spares
  if(B.LeftArm&&B.LeftForeArm){setW(B.LeftArm,_pv[14].copy(DN).addScaledVector(fwdC,.24).addScaledVector(rtC,-.26),restAxisTo(_ra,B.LeftArm,up),fwdC);setW(B.LeftForeArm,_pv[15].copy(fwdC).multiplyScalar(.8).addScaledVector(rtC,.52).addScaledVector(up,.12),restAxisTo(_ra,B.LeftForeArm,DN),DN);
   if(B.LeftHand){setW(B.LeftHand,_pv[16].copy(rtC).multiplyScalar(.6).addScaledVector(fwdC,.6).addScaledVector(up,-.15),restAxisTo(_ra,B.LeftHand,DN),_pv[17].copy(fwdC).negate().addScaledVector(up,-.4));
    for(let f=0;f<4;f++){const nm=PD_LF[f];for(let j=0;j<3;j++){const bn=B[nm[j]];if(!bn)continue;bn.quaternion.copy(R[bn.name].lq);bn.rotateX((.75+f*.08)*(j===0?1:.85));}}}}
  // head steady, eyes on the board
  if(B.Head&&B.HeadTop_End){const HD=boneWTo(_pv[18],B.Head);const look=_pv[19].subVectors(boardTarget,HD).normalize();aimBone(B.Head,B.HeadTop_End,_pv[20].copy(up).addScaledVector(look,.12).normalize(),0);}
  if(fig.userData.s3v2&&!fpv)try{v2PostClear(fig,['Right']);}catch(e){}/* Vinyl v2.2: fingers round the dart clear of the 2x head before the dart is put in them */
  if(fig.userData.dt){const dt=fig.userData.dt;const mid=boneWTo(_pv[21],B.RightHandIndex2).lerp(boneWTo(_pv[22],B.RightHandThumb3),.5);const dA=(P.dart+(fig.userData.s3v2&&!fpv?v2DartPitch(oa):0))*rad;const dd=_pv[23].copy(b).multiplyScalar(Math.cos(dA)).addScaledVector(up,Math.sin(dA)).normalize();
   const w=_pv[18].copy(mid).addScaledVector(palm,.008);fig.worldToLocal(w);dt.position.copy(w);const m=_pm.lookAt(_pv[19].copy(mid).add(dd),mid,up);const iq=fig.getWorldQuaternion(_pq).invert();dt.quaternion.copy(iq.multiply(_pq2.setFromRotationMatrix(m)));dt.rotateY(Math.PI);{const dk=fig.userData.s3fig?S3_DART*(fig.userData.s3v2?V2DARTK:1):1;dt.scale.set(dk/fig.scale.x,dk/fig.scale.y,dk/fig.scale.z);}dt.visible=!rel;}}
 function standRigged(fig,kind){const B=fig.userData.B;fig.updateWorldMatrix(true,true);if(kind==='set'){poseRigged(fig,{phase:'idle'},fig.localToWorld(new T.Vector3(0,1.73,-2.4)));return;}
  const fwd=new T.Vector3(0,0,-1).applyQuaternion(fig.getWorldQuaternion(new T.Quaternion())),down=new T.Vector3(0,-1,0);
  const arm=(side,dirU,dirF,handDir)=>{const rt=new T.Vector3(-fwd.z,0,fwd.x);const nrm=new T.Vector3().copy(rt).multiplyScalar(side==='Right'?-1:1);aimBone(B[side+'Arm'],B[side+'ForeArm'],dirU,0);aimFrame(B[side+'ForeArm'],B[side+'Hand'],dirF,nrm);aimFrame(B[side+'Hand'],B[side+'HandMiddle1'],handDir,nrm);curl(B,side,[.35,.4,.45,.5,.2]);};
  if(kind==='chalk'){arm('Right',new T.Vector3().copy(fwd).add(new T.Vector3(0,.4,0)).normalize(),new T.Vector3().copy(fwd).add(new T.Vector3(0,.6,0)).normalize(),new T.Vector3().copy(fwd).add(new T.Vector3(0,.5,0)).normalize());arm('Left',down,down,down);}
  else if(kind==='mic'){arm('Right',new T.Vector3().copy(down).addScaledVector(fwd,.3).normalize(),new T.Vector3(0,1,0).addScaledVector(fwd,.3).normalize(),new T.Vector3(0,1,0));arm('Left',down,new T.Vector3().copy(down).addScaledVector(fwd,.6).normalize(),fwd);}
  else{const rt=new T.Vector3(-fwd.z,0,fwd.x);arm('Right',new T.Vector3().copy(down).addScaledVector(rt,.08).normalize(),new T.Vector3().copy(down).addScaledVector(fwd,.08).normalize(),new T.Vector3().copy(down).addScaledVector(fwd,.3).normalize());arm('Left',new T.Vector3().copy(down).addScaledVector(rt,-.08).normalize(),new T.Vector3().copy(down).addScaledVector(fwd,.08).normalize(),new T.Vector3().copy(down).addScaledVector(fwd,.3).normalize());}
  if(fig.userData.dt)fig.userData.dt.visible=false;}
 function stanceRigged(fig){const B=fig.userData.B;if(!B)return;['RightUpLeg','LeftUpLeg','RightLeg','LeftLeg'].forEach(n=>B[n].quaternion.copy(RIG.rest[B[n].name].lq));B.RightUpLeg.rotateX(-.16);B.LeftUpLeg.rotateX(.08);B.LeftLeg.rotateX(.1);}
 // --- two-bone IK: point the upper arm at the elbow and the forearm at the hand, all in world space
 const _v=new T.Vector3(),_u=new T.Vector3(),_p=new T.Vector3(),_q=new T.Quaternion(),_q2=new T.Quaternion(),_m=new T.Matrix4(),DOWN=new T.Vector3(0,-1,0);
 function solveArm(a,handW,poleW,L1=.31,L2=.29){const sho=a.sho,elb=a.elb;sho.updateWorldMatrix(true,false);const S=new T.Vector3().setFromMatrixPosition(sho.matrixWorld);
  const d=Math.min(L1+L2-.01,Math.max(.05,S.distanceTo(handW)));const u=_u.subVectors(handW,S).normalize();
  const pole=_p.copy(poleW).sub(S);pole.addScaledVector(u,-pole.dot(u));if(pole.lengthSq()<1e-6)pole.set(0,-1,0);pole.normalize();
  const cosA=(L1*L1+d*d-L2*L2)/(2*L1*d);const A=Math.acos(Math.max(-1,Math.min(1,cosA)));
  const E=new T.Vector3().copy(S).addScaledVector(u,Math.cos(A)*L1).addScaledVector(pole,Math.sin(A)*L1);
  // orient shoulder: local -y -> (E-S), expressed in parent (figure) space
  const parentQ=sho.parent.getWorldQuaternion(_q2);const dirSE=_v.subVectors(E,S).normalize().applyQuaternion(parentQ.clone().invert());
  sho.quaternion.setFromUnitVectors(DOWN,dirSE);sho.updateWorldMatrix(true,false);
  const shoQ=sho.getWorldQuaternion(_q);const dirEH=_v.subVectors(handW,E).normalize().applyQuaternion(shoQ.clone().invert());
  elb.quaternion.setFromUnitVectors(DOWN,dirEH);elb.updateWorldMatrix(true,false);return E;}
 function aimHand(a,targetW,rollZ){const hd=a.hd;hd.updateWorldMatrix(true,false);const H=new T.Vector3().setFromMatrixPosition(hd.matrixWorld);
  _m.lookAt(targetW,H,new T.Vector3(0,1,0));const want=new T.Quaternion().setFromRotationMatrix(_m);const parentQ=hd.parent.getWorldQuaternion(_q2);hd.quaternion.copy(parentQ.invert().multiply(want));hd.rotateZ(rollZ||0);}
 // pose a figure for darts. The throwing arm is a hinge: the elbow sits in front of the shoulder and stays there;
 // only the forearm swings (phi = forearm angle from vertical, negative = folded back toward the face).
 function throwPose(oa){ // -> {phi: forearm angle from vertical (deg, + = forward), lift: upper-arm elevation (deg), wrist: extension (+) / flexion (-) deg, dart: dart elevation deg, lean}
  // Set: forearm near vertical, hand at eye line, dart pointing slightly up. Backswing: elbow still, hand comes back to the cheek, dart tilts up.
  // Acceleration: elbow extends and rises; dart flattens, release ~35 deg forward of vertical with the dart just above horizontal.
  // Follow-through: arm straight and raised, hand pointing at the target. Dart stays tangent to the arc, never points down before release.
  const ph=oa.phase||'idle',k=oa.k||0,p=oa.pull||0;const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  const SET={phi:-16,lift:-6,wrist:14,dart:9,lean:0},BACK={phi:-48,lift:-8,wrist:36,dart:38,lean:0},REL={phi:36,lift:8,wrist:6,dart:6,lean:.02},END={phi:86,lift:14,wrist:-34,dart:-14,lean:.03};
  const mix=(A,B,e)=>({phi:A.phi+(B.phi-A.phi)*e,lift:A.lift+(B.lift-A.lift)*e,wrist:A.wrist+(B.wrist-A.wrist)*e,dart:A.dart+(B.dart-A.dart)*e,lean:A.lean+(B.lean-A.lean)*e});
  if(ph==='pull')return mix(SET,BACK,1-Math.pow(1-Math.min(1,p),1.7));
  if(ph==='throw'){const e=1-Math.pow(1-Math.min(1,k),2.2);return mix(BACK,REL,e);}
  if(ph==='fly'||ph==='follow'){const e=1-Math.pow(1-Math.min(1,k),2);return mix(REL,END,e);}
  if(ph==='reset')return mix(END,SET,ease(Math.min(1,k)));
  return Object.assign({},SET);}
 function poseFigure(fig,oa,boardTarget){const u=fig.userData;if(u&&u.rigged){poseRigged(fig,oa,boardTarget);return;}if(!u||!u.R)return;fig.updateWorldMatrix(true,false);
  const tp=throwPose(oa);const rad=Math.PI/180;
  const sho=u.R.sho;sho.updateWorldMatrix(true,false);const S=new T.Vector3().setFromMatrixPosition(sho.matrixWorld);
  const fwd=new T.Vector3().subVectors(boardTarget,S);fwd.y=0;fwd.normalize();const right=new T.Vector3(-fwd.z,0,fwd.x),up=new T.Vector3(0,1,0);
  // elbow: 0.31 along the upper arm, raised by `lift`, nudged inward so the forearm lines up under the eye
  const L1=.31,L2=.29;const dirU=new T.Vector3().addScaledVector(fwd,Math.cos(tp.lift*rad)).addScaledVector(up,Math.sin(tp.lift*rad)).addScaledVector(right,-.12).normalize();
  const E=S.clone().addScaledVector(dirU,L1);
  const dirF=new T.Vector3().addScaledVector(up,Math.cos(tp.phi*rad)).addScaledVector(fwd,Math.sin(tp.phi*rad)).addScaledVector(right,-.05).normalize();
  const H=E.clone().addScaledVector(dirF,L2);
  // orient shoulder -> elbow, elbow -> hand (world space, converted to each parent frame)
  const parentQ=sho.parent.getWorldQuaternion(_q2).clone();sho.quaternion.setFromUnitVectors(DOWN,_v.subVectors(E,S).normalize().applyQuaternion(parentQ.clone().invert()));sho.updateWorldMatrix(true,false);
  const shoQ=sho.getWorldQuaternion(_q).clone();u.R.elb.quaternion.setFromUnitVectors(DOWN,_v.subVectors(H,E).normalize().applyQuaternion(shoQ.invert()));u.R.elb.updateWorldMatrix(true,false);
  // hand: dart points at the target, wrist cocks the tip up on the backswing
  const aimPt=tp.celebrate?H.clone().add(new T.Vector3(0,1,0)):tp.shush?H.clone().add(new T.Vector3(0,1,0)).addScaledVector(fwd,-.3):H.clone().addScaledVector(fwd,1).addScaledVector(up,Math.tan(tp.wrist*rad)*1);aimHand(u.R,aimPt,0);
  // left hand: spares held at the sternum, elbow tucked
  const Ls=u.L.sho;Ls.updateWorldMatrix(true,false);const LS=new T.Vector3().setFromMatrixPosition(Ls.matrixWorld);
  const chest=fig.localToWorld(new T.Vector3(.03,1.28,-.19));const lpole=LS.clone().addScaledVector(right,-.4).add(new T.Vector3(0,-1,0));
  solveArm(u.L,chest,lpole);aimHand(u.L,fig.localToWorld(new T.Vector3(.55,1.55,-.3)),0);if(u.pint)aimHand(u.L,fig.localToWorld(new T.Vector3(.0,2.6,-.25)),0);
  fig.rotation.x=.04+tp.lean;}
 // --- opponent
 let opp=null;const O={};
 let lastOpp=null,lastMe=null;
 let _chT=0;function charsChanged(){clearTimeout(_chT);_chT=setTimeout(()=>{/* ENG-7 (ChatGPT): checked again when the debounced rebuild runs: a file that landed in the hub just before Go would otherwise rebuild everything at the start of the match; then it waits for the hub */{const rs=document.getElementById('result');if((typeof S!=='undefined'&&S&&!S.done)||!!(rs&&!rs.hidden)){animsPend=true;return;}}try{if(lastMe)setPlayerLook(...lastMe);if(lastOpp)setOpponentLook(...lastOpp);if(lastTier>=0)buildVenue(lastTier);}catch(e){console.warn('chars',e);}try{if(window.__avPending){window.__avPending=0;document.dispatchEvent(new Event('tops-avatars'));}}catch(e){}},120);}
 /* #15: character templates (one GLB per character, ~5-8 MB of textures on phones) were kept for the whole session. After each
    opponent is set, free every template no live figure uses, keeping the player's and the opponent's (and remy, and any still loading).
    A freed one reloads on demand (loadChar only checks RIGS/RIG_WAIT). */
 let lastOppCk=null;/* the last opponent's template stays loaded (a rematch or repeat opponent needs no reload, ~3 s at CPU x4); everything else goes */
 function evictChars(){try{const live=new Set(['remy']);if(lastOppCk)live.add(lastOppCk);if(lastMe)live.add(charKey(lastMe[0],lastMe[2]));if(lastOpp)live.add(charKey(lastOpp[0],lastOpp[1]));
  scene.traverse(o=>{if(o.userData&&o.userData.ck)live.add(o.userData.ck);});
  Object.keys(RIGS).forEach(k=>{if(live.has(k)||RIG_WAIT[k])return;const r=RIGS[k];delete RIGS[k];window.__charsFreed=(window.__charsFreed||0)+1;
   try{r.base.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton){KEEP.delete(o.skeleton);if(o.skeleton.boneTexture){o.skeleton.boneTexture.dispose();o.skeleton.boneTexture=null;}}
    if(o.geometry){KEEP.delete(o.geometry);o.geometry.dispose();}const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);
    ms.forEach(m=>{if(!m)return;KEEP.delete(m);TEX_KEYS.forEach(tk=>{const tx=m[tk];if(tx&&tx.isTexture){KEEP.delete(tx);tx.dispose();}});m.dispose();});});}catch(e){console.warn('evict',k,e);}
   Object.keys(ANIM_CACHE).forEach(ck=>{if(ck.indexOf(k+'|')===0)delete ANIM_CACHE[ck];});});}catch(e){console.warn('evictChars',e);}}
 /* #15 (Hayden 08:00: every match is a clean instance): everything that belongs to the match goes when it's left. The venue room,
    the player's own figure and the UI stay. One entry point; the game calls it on every exit (showHub, showTitle, next beginMatch). */
 function teardownMatch(o){try{/* #15b: a dart still in the air belongs to the match being left: free it and drop its landing, so it can't stick into the next board or land() in the next match */flights.forEach(f=>{scene.remove(f.d);disposeTree(f.d);});flights.length=0;cine=null;clearDarts();}catch(e){console.warn('teardown darts',e);}
 try{if(opp){lastOppCk=opp.userData&&opp.userData.ck;scene.remove(opp);disposeTree(opp);opp=null;}lastOpp=null;if(!(o&&o.keepTemplates))evictChars();
  const used=new Set();[scene,armScene].forEach(sc=>sc.traverse(o=>{const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(m)TEX_KEYS.forEach(k=>{if(m[k])used.add(m[k]);});});}));
  Object.keys(HAIRCOL_CACHE).forEach(k=>{const t=HAIRCOL_CACHE[k];if(used.has(t))return;delete HAIRCOL_CACHE[k];KEEP.delete(t);t.dispose();});
  window.__teardowns=(window.__teardowns||0)+1;}catch(e){console.warn('teardownMatch',e);}}
 /* S3: when the S3 rig lands mid-match, every figure not yet the S3-rig Vinyl build (primitive stand-in, in-page-rig carrier) is rebuilt at a
    moment it's off screen: the opponent during the player's visit (not on the opponent camera), the player during the opponent's visit;
    never in the walk-on or under the intro card; same match only; gives up after 3 minutes */
 function s3Ok(f){return !!(f&&f.userData&&f.userData.s3fig&&f.userData.ck===S3_RIG);}
 function s3SwapLive(){if(typeof S==='undefined'||!S)return;const S0=S,t0=Date.now();const tryNow=()=>{if(typeof S==='undefined'||!S||S!==S0||S.done)return;let busy=false;try{busy=!!(window.V&&V.walking&&V.walking());const it=document.getElementById('intro');busy=busy||!!(it&&it.classList.contains('show'));}catch(e){}
   const needO=!!(lastOpp&&!s3Ok(opp)),needM=!!(lastMe&&(!s3Ok(me)||!s3Ok(fpFig)));if(!needO&&!needM)return;
   if(!busy){if(needO&&S.cur===0&&S.view!==1){setOpponentLook(lastOpp[0],lastOpp[1],lastOpp[2]);try{window.TOPS_LOG&&TOPS_LOG.log('s3_swap',{who:'opp',ms:Date.now()-t0});}catch(e){}}
    if(needM&&S.cur===1){setPlayerLook(lastMe[0],lastMe[1],lastMe[2],lastMe[3]);try{window.TOPS_LOG&&TOPS_LOG.log('s3_swap',{who:'me',ms:Date.now()-t0});}catch(e){}}}
   if(Date.now()-t0<180000&&((lastOpp&&!s3Ok(opp))||(lastMe&&(!s3Ok(me)||!s3Ok(fpFig)))))setTimeout(tryNow,300);};tryNow();}
 window.TOPS_S3SWAP=()=>s3SwapLive();
 function swapOppStand(key){if(window.TOPS_S3FLAG)return false;if(!opp||!opp.userData||!opp.userData.stand||opp.userData.ck!==key||!lastOpp)return false;const L=lastOpp,S0=typeof S!=='undefined'?S:null;const t0=Date.now();
  /* ChatGPT P1: only for the same match (S is a new object per match, lastOpp a new array per setOpponentLook) and only while the
     opponent is off screen: not on the opponent's camera, not in the walk-on, not under the intro card */
  const tryNow=()=>{if(!opp||!opp.userData.stand||lastOpp!==L||typeof S==='undefined'||!S||S!==S0||S.done)return;let busy=S.view===1;try{busy=busy||(window.V&&V.walking&&V.walking());const it=document.getElementById('intro');busy=busy||!!(it&&it.classList.contains('show'));}catch(e){}if(busy){if(Date.now()-t0<60000)setTimeout(tryNow,250);return;}setOpponentLook(L[0],L[1],L[2]);try{window.TOPS_LOG&&TOPS_LOG.log('opp_swap',{k:key,ms:Date.now()-t0});}catch(e){}};tryNow();return true;}
 /* the character an opponent figure will use, the way setOpponentLook picks it (never the player's own model) */
 window.TOPS_OPPKEY=(look,name)=>{if(window.TOPS_S3FLAG)return S3_RIG;const ok=charKey(look,name);try{const mk=lastMe?charKey(lastMe[0],lastMe[2]):charKey(save.look||null,save.name||'You');if(ok===mk&&!window.GFX_LEGACY){const fem=CHAR_F[ok],pool=CHARS.filter(c=>!!CHAR_F[c]===!!fem&&c!==mk);return pool[(String(name||'').length)%pool.length];}}catch(e){}return ok;};
 function setOpponentLook(look,name,tier){lastOpp=[look,name,tier];if(lastMe&&!window.GFX_LEGACY){const mk=charKey(lastMe[0],lastMe[2]),ok=charKey(look,name);if(ok===mk){const fem=CHAR_F[ok],pool=CHARS.filter(c=>!!CHAR_F[c]===!!fem&&c!==mk);look=Object.assign({},look,{model:pool[(String(name||'').length)%pool.length]});}}if(opp){scene.remove(opp);disposeTree(opp);}opp=makeFigure(look,name,tier);v2Blob(opp);v2Chin(opp);Object.assign(O,opp.userData);opp.position.set(-.06,0,OCHE_Z+.08);opp.rotation.y=1.0;stance(opp);opp.visible=false;scene.add(opp);poseOpp(0,0);evictChars();}
 function stance(fig){const u=fig.userData;if(u.rigged){stanceRigged(fig);fig.rotation.x=.03;return;}if(u.hips){u.hips.forEach(h=>{const right=h.position.x>0;h.rotation.set(right?.14:-.06,0,right?.03:-.05);});}fig.rotation.x=.04;}
 function poseOpp(oa){if(!opp)return;poseFigure(opp,oa||{phase:'idle'},boardC);}
 // --- player preview figure
 let me=null,fpFig=null;/* #15: the first-person hand (~20 new geometries) and its dart were swapped on every look rebuild and never freed. Free the old one's
    own geometry, materials and textures; the shared skin material and kept (cached) parts stay. */
 function freeHand(h){try{h.traverse(o=>{if(o.geometry&&!kept(o.geometry))o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);
  ms.forEach(m=>{if(!m||m===skin||m===sleeveMat||kept(m))return;TEX_KEYS.forEach(k=>{const tx=m[k];if(tx&&tx.isTexture&&!kept(tx))tx.dispose();});m.dispose();});});}catch(e){}}
 function setPlayerLook(look,flight,name,tier){s3MeBuild=true;try{return setPlayerLook0(look,flight,name,tier);}finally{s3MeBuild=false;}}
 /* LIVE P1 4.00 (Lee): the player's figures are built as the player whatever the name says (the creator passes the typed name before it's saved, so the name test failed and the preview was a seeded stranger that never changed) */
 function setPlayerLook0(look,flight,name,tier){lastMe=[look,flight,name,tier];if(me){scene.remove(me);disposeTree(me);}if(fpFig){scene.remove(fpFig);disposeTree(fpFig);fpFig=null;}if(RIG.ready){fpFig=makeRigged(look,name,tier);fpFig.visible=false;fpFig.userData.fpv=true;/* v2.2: the first-person arm keeps its own hand target (no head clearance pass) */fpFig.traverse(o=>{if(o.isMesh)o.castShadow=false;});fpFig.userData.B.LeftHand.children.forEach(c=>{c.visible=false;});scene.add(fpFig);fpFig.remove(fpFig.userData.dt);const fd=myDart(flight);fpFig.add(fd);fpFig.userData.dt=fd;}me=makeFigure(look,name,tier);v2Blob(me);v2Chin(me);me.visible=false;scene.add(me);sleeveMat.color.set(look.shirt);skin.color.set(look.skin);
  fpArm.remove(hand);freeHand(hand);hand=makeHand(1,skin,null,'throw');hand.scale.setScalar(1.08);fpArm.add(hand);fpDart=myDart(flight);hand.add(fpDart);fpDart.position.set(-.026,.004,.074);fpDart.rotation.set(-.04,Math.PI,0);fpDart.scale.setScalar(1.6);if(previewOn)preview(true);else if(idleOn)idle(true);}
 const prevLight=new T.PointLight(0xfff1dd,1.1,6);prevLight.visible=false;scene.add(prevLight);const prevFill=new T.PointLight(0x9ab8ff,.5,6);prevFill.visible=false;scene.add(prevFill);
 /* Vinyl v2 creator light rig (Director spec 11): warm hemisphere, warm key, pink fill, two red rims behind; only while an S3 figure is previewed */
 const v2L={hemi:new T.HemisphereLight(0xfff0e6,0x3a1a1a,.36),key:new T.DirectionalLight(0xffe2c4,.95),fill:new T.DirectionalLight(0xffd6d0,.26),r1:new T.SpotLight(0xff3a30,1.1,8,.7,.6),r2:new T.SpotLight(0xff3a30,1.0,8,.7,.6)};/* -0.5 stop since v2 colours render at their true value (GFX_LIN fix): at the old levels Kai's creator face came out (236,186,133) for #eea472 */
 if(V2ON)Object.values(v2L).forEach(l=>{l.visible=false;scene.add(l);if(l.target)scene.add(l.target);});/* off: not in the scene at all */
 let previewOn=false;function preview(on){previewOn=on;const v2=!!(on&&me&&me.userData.s3fig&&S3_V2);if(S3_V2)v2LightMode(v2?'creator':'match');prevLight.visible=on&&!v2;prevFill.visible=on&&!v2;Object.values(v2L).forEach(l=>{l.visible=v2;});if(v2){const c=new T.Vector3(0,0,OCHE_Z+1.5),rot=-.35;const at=(x,y,z)=>new T.Vector3(x*Math.cos(rot)+z*Math.sin(rot),y,-x*Math.sin(rot)+z*Math.cos(rot)).add(c);/* the rig is in the figure's frame (it faces -z in the game: z flipped) */v2L.key.position.copy(at(-1.6,3.2,-3.4));v2L.key.target.position.copy(at(0,1.1,0));v2L.fill.position.copy(at(2.2,1.4,-2.6));v2L.fill.target.position.copy(at(0,1.1,0));v2L.r1.position.copy(at(-2.2,2.6,2.4));v2L.r2.position.copy(at(2.2,2.4,2.4));v2L.r1.target.position.copy(at(0,1.1,0));v2L.r2.target.position.copy(at(0,1.1,0));}if(me){me.visible=on||idleOn;if(!on&&idleOn){idle(true);return;}me.position.set(0,0,OCHE_Z+1.5);me.rotation.y=-.35;stance(me);me.updateWorldMatrix(true,true);poseFigure(me,{phase:'idle'},me.localToWorld(new T.Vector3(.1,1.6,-3)));me.userData.dt.visible=true;}if(on){prevLight.position.set(1.0,2.4,OCHE_Z-.4);prevFill.position.set(-1.4,1.3,OCHE_Z+.6);}}
 let idleOn=false,titleOn=false;function title(on){titleOn=on;if(me&&idleOn&&!previewOn)me.visible=!on;}function idle(on){idleOn=on;if(me&&!previewOn){me.visible=on&&!titleOn;if(on){me.position.set(-.06,0,OCHE_Z+.08);me.rotation.y=1.0;stance(me);me.updateWorldMatrix(true,true);poseFigure(me,{phase:'idle'},boardC);}}}
 // --- crowd
 let crowd=null,SIDE_C=null;
 let cheerT0=-1e9,cheerStrength=0;function cheer(strength){cheerT0=performance.now();cheerStrength=strength;if(strength>=1&&venueTier>=3&&!RM)try{pyro();}catch(e){}}
 // LOOK v1.22: stage pyro, two spark fountains either side of the side-cam frame on 180s and game shots at TV venues
 const sparks=[];let sparkMat=null;function pyro(){if(!sparkMat)sparkMat=new T.SpriteMaterial({map:glowTex,color:0xffc860,transparent:true,blending:T.AdditiveBlending,depthWrite:false});const X=(venueTier>=4?3.4:3.1)-1.1,now=performance.now();
  [-1.4,.5].forEach((dz,j)=>{for(let k=0;k<70;k++){const s=new T.Sprite(sparkMat.clone());s.position.set(X-Math.random()*.1,.5,OCHE_Z+dz+(Math.random()-.5)*.08);const sc=.028+Math.random()*.035;s.scale.setScalar(sc);
   s.userData={t0:now+k*14+j*60,life:900+Math.random()*700,v:new T.Vector3(-(Math.random()*.4),3.6+Math.random()*1.8,(Math.random()-.5)*.9),sc};s.visible=false;scene.add(s);sparks.push(s);}});
  if(pyroLight){pyroLight.position.set(X-.4,1,OCHE_Z-.4);pyroLight.userData={t0:now,flash:1,life:1600,keep:1};if(!sparks.includes(pyroLight))sparks.push(pyroLight);}}
 const motes=[];let sparkLast=0;function stepSparks(now){if(motes.length){const tt=now/1000;for(const s of motes){const u=s.userData;s.position.set(u.p0.x+Math.sin(tt*u.sp+u.ph)*.06,u.p0.y+Math.sin(tt*u.sp*.7+u.ph*2)*.12,u.p0.z+Math.cos(tt*u.sp*.5+u.ph)*.15);}}const dt=Math.min(.05,Math.max(0,(now-(sparkLast||now))/1000));sparkLast=now;for(let i=sparks.length-1;i>=0;i--){const s=sparks[i],u=s.userData;const t=(now-u.t0)/1000;if(t<0)continue;if(t*1000>u.life){if(u.keep)s.intensity=0;else scene.remove(s);sparks.splice(i,1);continue;}
  if(u.flash){s.intensity=2.4*Math.max(0,1-t/1.2)*(.8+Math.random()*.4);continue;}if(!s.visible){s.visible=true;const e=Math.min(t,.6);s.position.addScaledVector(u.v,e);u.v.y-=5.4*e;}s.position.addScaledVector(u.v,dt);u.v.y-=5.4*dt;const k=t*1000/u.life;s.material.opacity=1-k;s.scale.setScalar(u.sc*(1-k*.6));s.material.color.setHex(k<.35?0xFFD27A:0xF6A33D);}}
 // GFX: crowd as rendered Mixamo cut-outs (blender/crowd.py atlas: 8 characters x sit/cheer/clap). Cheap enough for phones.
 let CROWD_TEX=null,CROWD_WAIT=false;
 function loadCrowdTex(){if(CROWD_TEX||CROWD_WAIT||window.GFX_LEGACY)return;CROWD_WAIT=true;new T.TextureLoader().load('assets/crowd.webp',tx=>{tx.encoding=T.sRGBEncoding;tx.anisotropy=4;KEEP.add(tx);CROWD_TEX=tx;if(lastTier>=2)buildVenue(lastTier);},undefined,()=>{});}
 function makeSpriteCrowd(spots){const n=Math.min(spots.length,lkPhone()?40:spots.length);const pos=new Float32Array(n*12),uv=new Float32Array(n*8),idx=[];const meta=[];
  for(let i=0;i<n;i++){const s=spots[i];const h=.95+((i*37)%11)/100;const w=1.05*h,ht=2.1*h;const dx=0-s[0],dz=1.6-s[2];const a=Math.atan2(dx,dz);const cx=Math.cos(a),sx=-Math.sin(a);const ch=(i*5+Math.floor(i/3))%8;meta.push({ch,base:s[1]+.34,h:ht,w,cx,sx,x:s[0],z:s[2],pose:0,ph:i*1.7});
   idx.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);
  const dim=[1,1,.62,.7,.7,.8,.72][lastTier]||.7;const m=new T.MeshBasicMaterial({map:CROWD_TEX,transparent:true,alphaTest:.45,side:T.DoubleSide,color:new T.Color().setRGB(dim,dim,dim)});
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;venue.add(mesh);const C={sprite:mesh,meta,spots};spriteLayout(C,0);
  // seating: a riser under each row and a row of seat backs behind the people, so nobody floats
  const rows={};spots.slice(0,n).forEach(sp=>{const k=Math.round(sp[2]*10)+'|'+(Math.abs(sp[0])>6.5?Math.sign(sp[0]):0);(rows[k]=rows[k]||[]).push(sp);});
  const rm=new T.MeshStandardMaterial({color:0x0c0d12,roughness:.9}),sm=new T.MeshStandardMaterial({color:[0,0,0x1c0c0e,0x0c1626,0x0c1626,0x121218,0x1c0a0c][lastTier]||0x121218,roughness:.9});
  Object.values(rows).forEach(r=>{const xs=r.map(q=>q[0]),zs=r.map(q=>q[2]);const x0=Math.min(...xs)-.3,x1=Math.max(...xs)+.3,z=zs.reduce((a,b)=>a+b,0)/zs.length,y=Math.min(...r.map(q=>q[1]))+.34-.02;const side=Math.abs(r[0][0])>6.5;
   const w=side?.7:x1-x0,d=side?(Math.max(...zs)-Math.min(...zs)+.7):.7,cx=side?r[0][0]:(x0+x1)/2,cz=side?z:z;const h=Math.max(.05,y+1.4);const rb=new T.Mesh(new T.BoxGeometry(w,h,d),rm);rb.position.set(cx,y-h/2,cz);venue.add(rb);
   if(!side){const back=new T.Mesh(new T.BoxGeometry(w,.42,.06),sm);back.position.set(cx,y+.21,cz+.28);venue.add(back);}});
  return C;}
 function spriteLayout(C,t){const P=C.sprite.geometry.attributes.position.array,U=C.sprite.geometry.attributes.uv.array;C.meta.forEach((q,i)=>{const lift=q.pose?-.45:0;const bob=q.pose?Math.abs(Math.sin(t*8+q.ph))*.05:Math.sin(t*1.3+q.ph)*.006;const y0=q.base+lift+bob,y1=y0+q.h;const hx=q.w/2*q.cx,hz=q.w/2*q.sx;
   P.set([q.x-hx,y0,q.z-hz,q.x+hx,y0,q.z+hz,q.x+hx,y1,q.z+hz,q.x-hx,y1,q.z-hz],i*12);const u0=q.ch/8,u1=(q.ch+1)/8,v1=1-q.pose/3,v0=1-(q.pose+1)/3;U.set([u0,v0,u1,v0,u1,v1,u0,v1],i*8);});
  C.sprite.geometry.attributes.position.needsUpdate=true;C.sprite.geometry.attributes.uv.needsUpdate=true;}
 function makeCrowd(spots){if(crowd){crowd.forEach(m=>venue.remove(m));}crowd=[];if(lastTier<2)spots=[];if(!spots.length)return;if(!window.GFX_LEGACY){loadCrowdTex();if(CROWD_TEX){const C=makeSpriteCrowd(spots);crowd=[C.sprite];crowd.C=C;return;}}if(lkPhone())return;
  const n=spots.length;const headG=new T.SphereGeometry(.1,10,8),bodyG=new T.CylinderGeometry(.14,.17,.52,10),shG=new T.SphereGeometry(.2,10,8),hairG=new T.SphereGeometry(.102,10,6,0,Math.PI*2,0,Math.PI*.5);
  const skinM=new T.MeshLambertMaterial({color:0xffffff}),bodyM=new T.MeshLambertMaterial({color:0xffffff}),hairM=new T.MeshLambertMaterial({color:0xffffff});
  const hm=new T.InstancedMesh(headG,skinM,n),bm=new T.InstancedMesh(bodyG,bodyM,n),sm=new T.InstancedMesh(shG,bodyM,n),hr=new T.InstancedMesh(hairG,hairM,n);
  const m=new T.Matrix4(),col=new T.Color();const skins=[0xf1c9a5,0xd9a06f,0xb97a4b,0x8d5a3a,0x5b3b2a],hairs=[0x1b1410,0x4a2f1d,0x8a5a2b,0xc9a35a,0x9a9a9a];
  spots.forEach((s,i)=>{const ry=(Math.random()-.5)*.6;s.ry=ry;s.h=.95+Math.random()*.12;
   m.makeTranslation(s[0],s[1]+1.25*s.h,s[2]);hm.setMatrixAt(i,m);hm.setColorAt(i,col.set(skins[i%5]));
   m.makeTranslation(s[0],s[1]+.9*s.h,s[2]);bm.setMatrixAt(i,m);col.setHSL(Math.random(),.45,.18+Math.random()*.2);bm.setColorAt(i,col);
   m.compose(new T.Vector3(s[0],s[1]+1.1*s.h,s[2]),new T.Quaternion(),new T.Vector3(1,.45,.8));sm.setMatrixAt(i,m);sm.setColorAt(i,col);
   m.makeTranslation(s[0],s[1]+1.27*s.h,s[2]);hr.setMatrixAt(i,m);hr.setColorAt(i,col.set(hairs[(i*7)%5]));});
  [hm,bm,sm,hr].forEach(x=>{x.instanceMatrix.needsUpdate=true;if(x.instanceColor)x.instanceColor.needsUpdate=true;x.castShadow=false;venue.add(x);});crowd=[hm,bm,sm,hr];crowd.spots=spots;}
 function crowdBob(t){if(SIDE_C){const ch=Math.max(0,1-(performance.now()-cheerT0)/1400)*cheerStrength;SIDE_C.meta.forEach((q,i)=>{q.pose=ch>.15&&((i*7)%10)/10<ch+.2?(i%3===0?2:1):(q.idle||0);});spriteLayout(SIDE_C,t);}if(crowd&&crowd.C){const C=crowd.C;const ch=Math.max(0,1-(performance.now()-cheerT0)/1400)*cheerStrength;C.meta.forEach((q,i)=>{const want=ch>.15&&((i*7)%10)/10<ch+.2?(i%3===0?2:1):0;q.pose=want;});spriteLayout(C,t);return;}if(!crowd||!crowd.spots)return;const [hm,bm,sm,hr]=crowd,m=new T.Matrix4();const sp=crowd.spots;const ch=Math.max(0,1-(performance.now()-cheerT0)/1400)*cheerStrength;
  for(let i=0;i<sp.length;i++){const s=sp[i];const jump=ch>0?Math.abs(Math.sin(t*9+i*1.7))*.12*ch:0;const bob=Math.sin(t*1.3+i)*.012+jump;
   m.makeTranslation(s[0],s[1]+1.25*s.h+bob,s[2]);hm.setMatrixAt(i,m);m.makeTranslation(s[0],s[1]+1.27*s.h+bob,s[2]);hr.setMatrixAt(i,m);
   if(ch>0){m.makeTranslation(s[0],s[1]+.9*s.h+jump,s[2]);bm.setMatrixAt(i,m);m.compose(new T.Vector3(s[0],s[1]+1.1*s.h+jump,s[2]),new T.Quaternion(),new T.Vector3(1,.45,.8));sm.setMatrixAt(i,m);}}
  hm.instanceMatrix.needsUpdate=true;hr.instanceMatrix.needsUpdate=true;if(ch>0){bm.instanceMatrix.needsUpdate=true;sm.instanceMatrix.needsUpdate=true;}}
 function crowdCheer(now){}
 // --- venue builder
 // v1.76: free GPU memory for everything we throw away (venue rebuilds and figure swaps leaked ~100 geometries and ~30-100 textures per match; iPhone frame rate fell match after match)
 function kept(x){return !!x&&(KEEP.has(x)||!!(x.userData&&x.userData.keep));}
 // walks the tree itself so a kept node protects its whole subtree (Object3D.traverse can't prune)
 function disposeTree(root){try{const walk=o=>{if(kept(o))return;if(o.isSkinnedMesh&&o.skeleton&&!kept(o.skeleton)&&o.skeleton.boneTexture){o.skeleton.boneTexture.dispose();o.skeleton.boneTexture=null;}if(o.geometry&&!kept(o.geometry))o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(!m||kept(m))return;TEX_KEYS.forEach(k=>{const tx=m[k];if(tx&&tx.isTexture&&!kept(tx))tx.dispose();});m.dispose();});for(const c of o.children)walk(c);};walk(root);}catch(e){}}
 function clearGroup(g){while(g.children.length){const c=g.children[0];g.remove(c);disposeTree(c);}}
 function box(w,h,d,mat,x,y,z){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=h<1.5&&w<3;venue.add(m);return m;}
 function plane(w,h,mat,x,y,z,ry=0){const m=new T.Mesh(new T.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=ry;venue.add(m);return m;}
 function banner(txt,bg,fg,w,y,z=.02){const tex=patternTexture((x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(255,255,255,.10)');gr.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=gr;x.fillRect(0,0,W,H);x.fillStyle='#e8382c';x.fillRect(0,0,230,H);x.fillStyle='#fff';x.font='800 120px "Saira Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('TOPS',115,H/2+4);x.fillStyle=fg;let size=140;x.font=`800 ${size}px "Saira Condensed","Arial Narrow",Arial,sans-serif`;let tw=x.measureText(txt).width;if(tw>(W-300)*.94){size=Math.floor(size*(W-300)*.94/tw);x.font=`800 ${size}px "Saira Condensed","Arial Narrow",Arial,sans-serif`;}x.fillText(txt,230+(W-230)/2,H/2+6);},2048,226);plane(w,w*.11,new T.MeshBasicMaterial({map:tex}),0,y,z);}
 function addLight(L){lights.add(L);return L;}
 // --- extras: standing people (chalker, caller, other players)
 const extras=[];
 function poseStand(fig,kind){const u=fig.userData;if(u.rigged){standRigged(fig,kind);return;}fig.updateWorldMatrix(true,true);const R=u.R,L=u.L;
  const S=p=>{p.updateWorldMatrix(true,false);return new T.Vector3().setFromMatrixPosition(p.matrixWorld);};const rs=S(R.sho),ls=S(L.sho);const down=new T.Vector3(0,-1,0);
  const fwd=new T.Vector3(0,0,-1).applyQuaternion(fig.getWorldQuaternion(new T.Quaternion())),right=new T.Vector3(-fwd.z,0,fwd.x);
  if(kind==='chalk'){solveArm(u.R,rs.clone().addScaledVector(fwd,.42).add(new T.Vector3(0,.25,0)).addScaledVector(right,-.15),rs.clone().addScaledVector(right,.5).add(down));aimHand(u.R,rs.clone().addScaledVector(fwd,1).add(new T.Vector3(0,.4,0)),0);
   solveArm(u.L,ls.clone().add(new T.Vector3(0,-.5,0)).addScaledVector(fwd,.05),ls.clone().addScaledVector(right,-.5).add(down));aimHand(u.L,ls.clone().add(new T.Vector3(0,-2,0)).addScaledVector(fwd,.3),0);}
  else if(kind==='mic'){solveArm(u.R,rs.clone().addScaledVector(fwd,.22).add(new T.Vector3(0,.0,0)).addScaledVector(right,-.12),rs.clone().addScaledVector(right,.5).add(down));aimHand(u.R,rs.clone().add(new T.Vector3(0,1,0)),0);
   solveArm(u.L,ls.clone().addScaledVector(fwd,.25).add(new T.Vector3(0,-.35,0)).addScaledVector(right,.1),ls.clone().addScaledVector(right,-.5).add(down));aimHand(u.L,ls.clone().addScaledVector(fwd,1).add(new T.Vector3(0,-.3,0)),0);}
  else if(kind==='set'){poseFigure(fig,{phase:'idle'},fig.localToWorld(new T.Vector3(0,1.73,-2.4)));return;}
  else{ // arms relaxed, hands slightly forward
   solveArm(u.R,rs.clone().add(new T.Vector3(0,-.55,0)).addScaledVector(fwd,.08).addScaledVector(right,.03),rs.clone().addScaledVector(right,.5).add(down));aimHand(u.R,rs.clone().add(new T.Vector3(0,-2,0)).addScaledVector(fwd,.4),0);
   solveArm(u.L,ls.clone().add(new T.Vector3(0,-.55,0)).addScaledVector(fwd,.08).addScaledVector(right,-.03),ls.clone().addScaledVector(right,-.5).add(down));aimHand(u.L,ls.clone().add(new T.Vector3(0,-2,0)).addScaledVector(fwd,.4),0);}
  if(u.dt)u.dt.visible=kind==='set';}
 function addExtra(name,x,z,ry,kind,tier,lookOverride){if(lkPhone()||/^Pro /.test(name))return null;const look=Object.assign(lookFor(name),lookOverride||{});if(!look.sex&&/^(Shazza|Bev|Kiri|Mere|Aroha|Fallon|Tash|Jess|Sharon|Kim|Tina|Deb|Marg|Liz|Megan)/i.test(name))look.sex='f';if(!look.model)look.model=charKey(look,name);{const used=new Set(extras.map(e=>e.userData.ck));if(lastMe)used.add(charKey(lastMe[0],lastMe[2]));if(lastOpp)used.add(charKey(lastOpp[0],lastOpp[1]));if(used.has(look.model)){const fem=!!CHAR_F[look.model];const free=CHARS.filter(c=>!used.has(c)&&!!CHAR_F[c]===fem);const any=CHARS.filter(c=>!used.has(c));const pick=free[0]||any[0];if(pick)look.model=pick;}}const f=makeFigure(look,null,tier);f.position.set(x,0,z);f.userData.home=[x,z];f.rotation.y=ry;venue.add(f);f.updateWorldMatrix(true,true);poseStand(f,kind);f.userData.kind=kind;f.userData.seed=Math.random()*10;{if(f.userData.dt)f.userData.dt.visible=false;try{f.userData.B.LeftHand.children.forEach(c=>{if(c.userData.spare)c.visible=false;});}catch(e){}const pool=kind==='sit'?['sit','sittalk','sittalk']:kind==='mic'?['idle','breathe']:kind==='chalk'?['look','idle']:tier>=2?['idle','breathe','look','shift']:['drink','talk','idle','breathe','shift','look','bored','argue'];let h=0;String(name).split('').forEach(c=>h=(h*31+c.charCodeAt(0))>>>0);playClip(f,pool[h%pool.length],{t:f.userData.seed*3});}extras.push(f);return f;}
 let _exT=0;function extrasIdle(t){const dt=_exT?Math.min(.1,Math.max(0,t-_exT)):0;_exT=t;for(const f of extras){f.visible=!titleOn;const hm=f.userData.home;if(f.userData.mixer){if(!f.userData.frozen||window.TOPS_EXTRA_ANIM===true){f.userData.mixer.update(f.userData.frozen?dt:.8);f.userData.frozen=true;}if(hm){f.position.x=hm[0];f.position.z=hm[1];f.position.y=0;}continue;}if(hm){f.position.x=hm[0];f.position.z=hm[1];}f.position.y=0;}}
 let ledWall=null;
 const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(.6,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return new T.CanvasTexture(c);})();KEEP.add(glowTex);
 function glow(x,y,z,color,size,opacity=.8){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false}));s.position.set(x,y,z);s.scale.set(size,size,1);venue.add(s);return s;}
 // --- venue builder
 let lastTier=-1;
 let _bf=null;function beamFade(){if(_bf)return _bf;const c=document.createElement('canvas');c.width=4;c.height=128;const x=c.getContext('2d');const gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#fff');gr.addColorStop(.55,'#777');gr.addColorStop(1,'#000');x.fillStyle=gr;x.fillRect(0,0,4,128);_bf=new T.CanvasTexture(c);return _bf;}
 function cone(x,y,z,color,h=3,r=.9,op=.07){const g=new T.ConeGeometry(r,h,24,1,true);const m=new T.Mesh(g,new T.MeshBasicMaterial({alphaMap:beamFade(),color,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));m.position.set(x,y-h/2,z);m.layers.set(2);venue.add(m);return m;}
 function ocheKit(t){const warm=t<=1;const tableM=new T.MeshStandardMaterial({color:warm?0x2c1d12:0x1a1d22,roughness:.5,metalness:warm?0:.3});const top=new T.Mesh(new T.CylinderGeometry(.3,.3,.03,24),tableM);top.position.set(1.15,1.02,OCHE_Z+.35);top.castShadow=true;venue.add(top);box(.05,1.0,.05,new T.MeshStandardMaterial({color:0x202428,metalness:.6,roughness:.4}),1.15,.5,OCHE_Z+.35);box(.34,.03,.34,new T.MeshStandardMaterial({color:0x202428}),1.15,.02,OCHE_Z+.35);
  if(warm){for(let k=0;k<2;k++){const gl=new T.Mesh(new T.CylinderGeometry(.036,.031,.15,14,1,true),new T.MeshStandardMaterial({color:0xd9a44a,transparent:true,opacity:.6,roughness:.1,side:T.DoubleSide}));gl.position.set(1.05+k*.18,1.11,OCHE_Z+.3+k*.1);venue.add(gl);const foam=new T.Mesh(new T.CylinderGeometry(.034,.034,.02,14),new T.MeshStandardMaterial({color:0xfff4e0,roughness:.9}));foam.position.set(1.05+k*.18,1.18,OCHE_Z+.3+k*.1);venue.add(foam);}
   const cb=plane(.5,.7,new T.MeshStandardMaterial({map:patternTexture((x,w,h)=>{x.fillStyle='#223127';x.fillRect(0,0,w,h);x.strokeStyle='#5a3d24';x.lineWidth=28;x.strokeRect(14,14,w-28,h-28);grain(x,w,h,16);x.fillStyle='rgba(240,236,220,.85)';x.font='600 54px Barlow,Arial';x.fillText('HOME',70,150);x.fillText('AWAY',300,150);x.font='500 46px Barlow,Arial';['501','461','421','381'].forEach((v,i)=>x.fillText(v,80,230+i*70));['501','441','401','356'].forEach((v,i)=>x.fillText(v,310,230+i*70));},512,720),roughness:.9}),1.45,1.35,OCHE_Z-.55,-Math.PI/2);box(.04,1.3,.04,new T.MeshStandardMaterial({color:0x3a2412}),1.45,.65,OCHE_Z-.55);}
  else{/* v1.74: static '501 501' monitor removed (it never updated). A water glass on the high table instead. */const gl=new T.Mesh(new T.CylinderGeometry(.034,.029,.13,16,1,true),new T.MeshStandardMaterial({color:0xcfe6f2,transparent:true,opacity:.35,roughness:.05,side:T.DoubleSide}));gl.position.set(1.1,1.1,OCHE_Z+.32);venue.add(gl);const wt=new T.Mesh(new T.CylinderGeometry(.031,.028,.09,16),new T.MeshStandardMaterial({color:0x9fc4d8,transparent:true,opacity:.28,roughness:0}));wt.position.set(1.1,1.08,OCHE_Z+.32);venue.add(wt);}
  const rim=addLight(new T.PointLight(warm?0xffc98a:0xcfe0ff,warm?.55:.4,4));rim.position.set(1.0,2.2,OCHE_Z+.5);}
 let venueTier=0,pyroLight=null;function buildVenue(t){venueTier=t;{const K=window.TOPS_HAIRHC_K!=null?window.TOPS_HAIRHC_K:0.6;if(window.TOPS_V2HAIRHC)TOPS_V2HAIRHC.value.x=1-(1-K)*Math.max(0,Math.min(1,(t-2)/3));}/* Ray's silver: valleys scaled to K in the Arena (tier 5), easing in from tier 2 */motes.length=0;sparks.forEach(s=>{if(s!==pyroLight)scene.remove(s);});sparks.length=0;if(pyroLight){scene.remove(pyroLight);pyroLight=null;}if(t>=3){pyroLight=new T.PointLight(0xffb040,0,6);scene.add(pyroLight);}buildVenueInner(t);ocheKit(t);lkRelight(t);if(window.TOPS_BOARD)try{TOPS_BOARD(t,{boardTex,surround,boardTexture,surroundTex,R,ORDER});}catch(e){console.warn('TOPS_BOARD',e);}try{sideDress(t);}catch(e){console.warn('sideDress',e);}if(window.TOPS_S3FLAG)try{s3Plates(t);}catch(e){console.warn('s3 plates',e);}}
 /* ===== S3 venue plates (Hayden 19 Nov): a painted plate per level drawn INSIDE the 3D scene as the back wall (a backdrop fixed to the
    camera, drawn first, nothing else changes), so the game canvas stays opaque (one layer for the phone to composite). The 3D room is
    hidden while a plate is up; the board, its surround, the figures, darts and lights stay. Walk-on plate for every view except the
    opponent-throw view, which gets the oche plate. Plates come through Cache Storage like the character files. Only with TOPS_S3FLAG (Career's single S3 flag). */
 const S3P=['pub','club','opens','dpnz','tt','tc','palace'];const S3TEX={},S3WANT={};let s3Back=null,s3Tier=-1;
 window.TOPS_S3IMG=(url)=>new Promise((res,rej)=>{{const k=String(url).replace(/^\.?\//,'').split('?')[0],h=(window.TOPS_S3V||{})[k];if(h&&!/[?&]v=/.test(url))url+=(String(url).includes('?')?'&':'?')+'v='+h;}/* content hash per file (build.js): repainted art = a new URL */const abs=new URL(url,location.href).href;const toURL=b=>URL.createObjectURL(new Blob([b],{type:/\.png$/i.test(abs)?'image/png':/\.jpe?g$/i.test(abs)?'image/jpeg':'image/webp'}));
  const net=()=>fetch(abs).then(r=>{if(!r.ok)throw new Error(url+' '+r.status);return r.arrayBuffer();});
  const go=window.caches&&caches.open?caches.open(ACN).then(c=>c.match(abs).then(h=>h?h.arrayBuffer():null).catch(()=>null).then(b=>b&&b.byteLength>200?b:net().then(b=>{try{c.put(abs,new Response(b.slice(0))).catch(()=>{});}catch(e){}return b;}))).catch(()=>net()):net();
  go.then(b=>res(toURL(b)),rej);});
 function s3PlateTex(name){if(S3TEX[name]!==undefined)return S3TEX[name];S3TEX[name]=null;if(S3WANT[name])return null;S3WANT[name]=1;
  TOPS_S3IMG('s3/plates/'+name+'.webp').then(u=>{const im=new Image();im.onload=()=>{const t=new T.Texture(im);t.encoding=T.sRGBEncoding;t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;KEEP.add(t);S3TEX[name]=t;};im.src=u;}).catch(e=>{console.warn('s3 plate',name,e&&e.message);});return null;}
 function s3Plates(t){if(!window.TOPS_S3FLAG)return;s3Tier=t;const k=S3P[Math.max(0,Math.min(6,t|0))];s3PlateTex(k+'_walk');s3PlateTex(k+'_oche');
  if(!s3Back){const m=new T.MeshBasicMaterial({color:0xffffff,depthTest:false,depthWrite:false,toneMapped:false,fog:false});s3Back=new T.Mesh(new T.PlaneGeometry(1,1),m);s3Back.renderOrder=-1e4;s3Back.frustumCulled=false;s3Back.matrixAutoUpdate=false;KEEP.add(s3Back.geometry);KEEP.add(m);
   if(!camera.parent)scene.add(camera);camera.add(s3Back);
   s3Back.onBeforeRender=(r,sc,cam)=>{const k2=S3P[Math.max(0,Math.min(6,s3Tier|0))];const st=typeof S!=='undefined'?S:null;const tex=(st&&!st.done&&st.view===1&&S3TEX[k2+'_oche'])||S3TEX[k2+'_walk']||S3TEX[k2+'_oche'];
    if(!tex){s3Back.visible=false;return;}if(s3Back.material.map!==tex){s3Back.material.map=tex;s3Back.material.needsUpdate=true;}
    const d=cam.far*.9,h=2*d*Math.tan(T.MathUtils.degToRad(cam.fov)/2),w=h*cam.aspect,ph=Math.max(h,w*16/9),pw=ph*9/16;s3Back.matrix.makeScale(pw,ph,1).setPosition(0,0,-d);s3Back.matrixWorld.multiplyMatrices(cam.matrixWorld,s3Back.matrix);};}
  s3Back.visible=true;}
 /* the room hides only once the level's plate is in, so a slow network shows today's room rather than a hole */
 function s3RoomTick(){if(!window.TOPS_S3FLAG||!s3Back)return;const k=S3P[Math.max(0,Math.min(6,s3Tier|0))];const has=!!(S3TEX[k+'_walk']||S3TEX[k+'_oche']);s3Back.visible=has;venue.visible=!has;if(sideLed)sideLed.visible=!has;}
 window.TOPS_S3PLATES={tex:S3TEX,tier:()=>s3Tier,back:()=>s3Back};
 // v1.08: the side camera looks toward +x. Dress that side so each venue reads from the profile view.
 let sideLed=null;
 function pubDress(t){try{const G=new T.Group();G.name='pubDress';venue.add(G);venue.updateMatrixWorld(true);
  // find the wall the side camera looks at: cast +x from the oche at head height
  const rc=new T.Raycaster(new T.Vector3(-1.2,1.9,OCHE_Z+.5),new T.Vector3(1,0,0),.3,12);rc.camera=camera;const tg=[];venue.traverse(o=>{if(o.isMesh&&!o.isSprite&&!o.isInstancedMesh)tg.push(o);});let hits=[];try{hits=rc.intersectObjects(tg.filter(o=>{let p=o;while(p){if(p===G)return false;p=p.parent;}return true;}),false);}catch(e){}const wx=hits.length?hits[0].point.x:3.2;
  const cv=document.createElement('canvas');cv.width=1024;cv.height=384;const c=cv.getContext('2d');const tex=new T.CanvasTexture(cv);tex.encoding=T.sRGBEncoding;
  const neon=(txt,x,y,size,col)=>{c.font=`900 ${size}px "Barlow Condensed",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
   for(const [blur,a] of [[42,.55],[22,.75],[8,1]]){c.shadowColor=col;c.shadowBlur=blur;c.strokeStyle=col;c.globalAlpha=a;c.lineWidth=10;c.strokeText(txt,x,y);}
   c.globalAlpha=1;c.shadowBlur=6;c.lineWidth=4;c.strokeStyle='#fffbe8';c.strokeText(txt,x,y);};
  c.clearRect(0,0,1024,384);neon(t===0?'TOPS':'TOPS',512,150,200,'#C6F36B');neon(t===0?'DARTS · BEER · BANTER':'MEMBERS · DARTS · POOL',512,300,64,t===0?'#ff4a3d':'#4CA3E0');tex.needsUpdate=true;
  if(t===0){const m=new T.Mesh(new T.PlaneGeometry(1.06,.4),new T.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false,depthWrite:false}));m.material.color.setScalar(.64);m.position.set(wx-.04,2.27,OCHE_Z-.4);m.rotation.y=-Math.PI/2;G.add(m);
  const glow=new T.PointLight(t===0?0xb8ff6a:0x8fd0ff,.26,3.2);glow.position.set(wx-.4,2.27,OCHE_Z-.4);G.add(glow);}
  // warm pools on the wall either side
  [[-.6],[2.6]].forEach(([dz])=>{const l=t===0?new T.SpotLight(0xf3c17c,.9,4,.5,.8,1.4):new T.SpotLight(0xfff1de,.35,4,.5,.8,1.4);l.position.set(wx-.9,3.1,OCHE_Z+dz);const tg=new T.Object3D();tg.position.set(wx,1.6,OCHE_Z+dz);G.add(tg);l.target=tg;G.add(l);});
  // LOOK v1.39: dust motes drifting in the lamp light
  motes.length=0;if(!RM){const mm=new T.SpriteMaterial({map:glowTex,color:0xffe2b0,transparent:true,opacity:.45,blending:T.AdditiveBlending,depthWrite:false});for(let k=0;k<46;k++){const s=new T.Sprite(mm);const p0=new T.Vector3(wx-.25-Math.random()*.9,1.5+Math.random()*1.2,OCHE_Z-1.5+Math.random()*2.2);s.position.copy(p0);s.scale.setScalar(.02+Math.random()*.025);s.userData={p0,ph:Math.random()*6.3,sp:.15+Math.random()*.25};G.add(s);motes.push(s);}}}catch(e){console.warn('pubDress',e);}}
 // v1.74 Pro Tour is a floor event (rows of oches, no crowd): one painted hall plate on the far wall, behind the 3D neighbouring oches
 function floorPlate(){if(window.TOPS_PLATES===false)return;const pm=new T.MeshBasicMaterial({color:0x000000,toneMapped:false,fog:false});pm.userData.own=1;const ph=4.8,pw=7.2;const pl=new T.Mesh(new T.PlaneGeometry(pw,ph),pm);pl.position.set(7.42,ph/2-.7,3.45);pl.rotation.y=-Math.PI/2;pl.name='floorPlate';venue.add(pl);
  {const lm=new T.MeshBasicMaterial({color:0xe8eef8,toneMapped:false});for(let i=0;i<3;i++)for(let j=0;j<2;j++){const lp=new T.Mesh(new T.PlaneGeometry(.9,.35),lm);lp.rotation.x=Math.PI/2;lp.position.set(2.2+i*1.9,3.38,1.6+j*2.6);venue.add(lp);}}
  {const cf=new T.PointLight(0xc5d9e8,.28,6);cf.position.set(-1,2.2,OCHE_Z+.8);venue.add(cf);}
  if(PLATE5){pm.map=PLATE5;pm.color.setRGB(1,1,1);pm.needsUpdate=true;return;}   // Art: the hall plate is loaded once and kept, so a venue rebuild (e.g. when character models finish loading) no longer blinks it black
  try{new T.TextureLoader().load('assets/venue/plate_5.webp',tx=>{tx.encoding=T.sRGBEncoding;tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());KEEP.add(tx);PLATE5=tx;pm.map=tx;pm.color.setRGB(1,1,1);pm.needsUpdate=true;},null,()=>{pm.color.setHex(0x0a1d3a);});}catch(e){}}
 let PLATE5=null;
 function sideDress(t){sideLed=null;SIDE_C=null;if(t<2){pubDress(t);return;}if(t===5){floorPlate();return;}const G=new T.Group();G.name='sideDress';venue.add(G);const PLATE=window.TOPS_PLATES===false?null:(window.TOPS_PLATE6?{6:'plate_6.webp'}:{})[t];
  const big=t>=4,X=big?3.4:3.1,Z0=OCHE_Z;const NAMES={2:['AUCKLAND','REGIONAL OPEN'],3:['DPNZ','NATIONAL SERIES'],4:['TRANS-TASMAN','DARTS CUP'],5:['PDC','PRO TOUR'],6:['WORLD','CHAMPIONSHIP']};const N=NAMES[t]||NAMES[4];
  const ACC={2:'#2fa046',3:'#e8382c',4:'#ffb000',5:'#2c8cff',6:'#D7B45C'}[t]||'#C6F36B';
  // LED event wall (canvas, gently animated on the big stages)
  const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const cx=cv.getContext('2d');const tex=new T.CanvasTexture(cv);tex.encoding=T.sRGBEncoding;
  const draw=k=>{const g2=cx.createLinearGradient(0,0,1024,512);g2.addColorStop(0,'#05070c');g2.addColorStop(.55,big?'#0c1830':'#141a14');g2.addColorStop(1,'#05070c');cx.fillStyle=g2;cx.fillRect(0,0,1024,512);
   cx.globalAlpha=t<=3?.145:.18;for(let i=0;i<14;i++){cx.fillStyle=ACC;const x=((i*90+k*60)%1300)-150;cx.beginPath();cx.moveTo(x,0);cx.lineTo(x+40,0);cx.lineTo(x-120,512);cx.lineTo(x-160,512);cx.fill();}cx.globalAlpha=1;
   cx.fillStyle='#EDECE5';cx.font=`900 ${big?96:70}px "Barlow Condensed",Impact,sans-serif`;cx.textAlign='center';cx.fillText(N[0],512,200);cx.fillStyle=ACC;cx.font=`800 ${big?56:42}px "Barlow Condensed",Impact,sans-serif`;cx.fillText(N[1],512,268);
   cx.fillStyle='rgba(237,236,229,.75)';cx.font='800 40px Manrope,sans-serif';cx.fillText('T O P S',512,330);
   cx.fillStyle='rgba(0,0,0,.22)';for(let y=0;y<512;y+=4)cx.fillRect(0,y,1024,1);tex.needsUpdate=true;};draw(0);
  const ledW=big?7.4:3.1,ledH=big?3.7:1.9;const led=new T.Mesh(new T.PlaneGeometry(ledW,ledH),new T.MeshBasicMaterial({map:tex,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));led.position.set(big?X+3.8:X+.6,big?2.35:2.1,big?Z0-.3:Z0-.55);led.rotation.y=-Math.PI/2;G.add(led);
  const frame=new T.Mesh(new T.BoxGeometry(.08,ledH+.12,ledW+.12),new T.MeshStandardMaterial({color:0x0b0c0e,roughness:.5}));frame.position.set(led.position.x+.12,led.position.y,led.position.z);G.add(frame);if(PLATE){led.scale.setScalar(.55);led.position.set(X+3.2,4.35,Z0-.3);frame.scale.setScalar(.55);frame.position.set(X+3.27,4.35,Z0-.3);}
  
  // truss + beams
  const tm=new T.MeshStandardMaterial({color:0x2a2d33,metalness:.8,roughness:.35});const ty=big?5.2:3.3,TX=big?X+2.2:X+.2;if(!PLATE){const tr=new T.Mesh(new T.BoxGeometry(.18,.18,big?8:5.5),tm);tr.position.set(TX,ty,Z0+.4);G.add(tr);}
  const bfc=document.createElement('canvas');bfc.width=4;bfc.height=128;{const bx=bfc.getContext('2d');const gr=bx.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#fff');gr.addColorStop(.55,'#777');gr.addColorStop(1,'#000');bx.fillStyle=gr;bx.fillRect(0,0,4,128);}const bfade=new T.CanvasTexture(bfc);
  const beamMat=new T.MeshBasicMaterial({alphaMap:bfade,color:new T.Color(ACC),transparent:true,opacity:t===4?.045:big?.07:.06,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});const whiteBeam=beamMat.clone();whiteBeam.color=new T.Color('#fff2d8');
  const nb=PLATE?0:(big?7:4);for(let i=0;i<nb;i++){const z=Z0+.4-(big?3.4:2.4)+i*((big?6.8:4.8)/(nb-1));const can=new T.Mesh(new T.CylinderGeometry(.09,.12,.22,10),tm);can.position.set(TX,ty-.18,z);G.add(can);
   const len=ty-.2;const cone=new T.Mesh(new T.ConeGeometry(big?.85:.6,len,18,1,true),i%2?whiteBeam:beamMat);cone.position.set(TX-.4,ty-.2-len/2,z);cone.rotation.z=-.12;cone.userData.ph=i*1.3;G.add(cone);
   if(big)cone.onBeforeRender=()=>{const s=performance.now()/1000;cone.rotation.z=-.12+Math.sin(s*.18+cone.userData.ph)*.12;cone.rotation.x=Math.cos(s*.14+cone.userData.ph)*.08;};}
  // crowd: stepped seating, varied shirts, rim-lit, phone lights (v1.70)
  const rows=PLATE?0:({4:4,5:5,6:7}[t]||0),per={4:14,5:16,6:20}[t]||0;
  // Art (Trans-Tasman, ChatGPT 6.5 'too empty, no event identity'): a qualifier, not an arena. The same stepped
  // stands, but ~a dozen believable seated spectators from the crowd atlas instead of 56 box figures, and a
  // trackside hoarding banner at the front of the stands, low enough to read behind the thrower's legs.
  // Art (Regional, DPNZ; ChatGPT 8.0 / 8.2 'a strong LED wall but nobody watching'): a handful of people from the
  // crowd atlas, most behind the thrower's back, one or two at the board-end edge, so the band behind the head and raised arm stays clear (this camera sees z ~1.2-3.6). Regional:
  // six players waiting on plastic chairs behind a low stage edge. DPNZ: nine standing in two rows, front row lit a
  // touch more. The LED wall is smaller, sits toward the board end so its title clears the thrower's head, stripes softer.
  if((t===2||t===3)&&CROWD_TEX){
   led.scale.setScalar(.82);frame.scale.setScalar(.82);led.position.z-=.6;frame.position.z-=.6;   // the face camera sees only z ~1.2-3.6 here; this moves the title off the head without cutting it
   const cellW=1.08,cellH=2.16,mk=k=>new T.MeshBasicMaterial({map:CROWD_TEX,transparent:true,alphaTest:.45,side:T.DoubleSide,fog:false,color:new T.Color().setRGB(k,k*.97,k*.93)});
   const person=(x,yb,z,col,row,mat,sc)=>{const g=new T.PlaneGeometry(cellW*sc,cellH*sc),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(col+uv.getX(i))/8,1-(row+1-uv.getY(i))/3);const m=new T.Mesh(g,mat);m.position.set(x,yb+cellH*sc/2,z);m.rotation.y=-Math.PI/2;G.add(m);};
   const dark=new T.MeshStandardMaterial({color:0x0b0d12,roughness:.85});
   if(t===2){const front=mk(.6),chair=new T.MeshStandardMaterial({color:0x2a2f38,roughness:.6});
    const step=new T.Mesh(new T.BoxGeometry(.6,.55,2.0),dark);step.position.set(3.35,.275,3.45);G.add(step);   // a tiered step behind the thrower's back, so the waiting players' heads and shoulders clear his shoulder
    [[.98,2,.05,0],[2.92,0,-.04,.55],[3.28,6,.06,.55],[3.64,5,0,.55],[4.02,4,-.05,.55]].forEach(([z,c,jx,yb],k)=>{const x=3.3+jx;const st=new T.Mesh(new T.BoxGeometry(.42,.05,.42),chair);st.position.set(x+.05,yb+.44,z);G.add(st);person(x,yb,z,c,0,front,.95+((k*3)%5)*.025);});
    const edge=new T.Mesh(new T.BoxGeometry(.12,.42,6.2),dark);edge.position.set(2.85,.21,Z0+.3);G.add(edge);}   // low stage edge: hides chair legs and feet
   else{const front=mk(.7),back=mk(.5);const riser=new T.Mesh(new T.BoxGeometry(.5,.55,6.2),dark);riser.position.set(3.45,.275,Z0+.3);G.add(riser);
    const fr=new T.Mesh(new T.BoxGeometry(.45,.3,1.6),dark);fr.position.set(3.0,.15,3.35);G.add(fr);   // front-row step: upper bodies show right of the thrower's head
    [[.96,3,.04,0],[2.9,0,-.04,.3],[3.26,5,.06,.3],[3.62,6,.03,.3]].forEach(([z,c,jx,yb],k)=>person(3.0+jx,yb,z,c,2,front,.96+((k*7)%5)*.02));
    [[3.08,2,.04],[3.44,7,-.05],[3.8,1,-.03],[4.15,3,0]].forEach(([z,c,jx],k)=>person(3.45+jx,.55,z,c,2,back,.94+((k*3)%5)*.02));}}
  if(t===4&&rows&&CROWD_TEX){   // the hall's side wall is at x 5.5, so the arena stands sit behind it: put the people in front of it instead
   const cellW=1.08,cellH=2.16,mk=k=>new T.MeshBasicMaterial({map:CROWD_TEX,transparent:true,alphaTest:.45,side:T.DoubleSide,fog:false,color:new T.Color().setRGB(k,k*.97,k*.92)});
   const back=mk(.5),front=mk(.66);   // spectators sit a step below the lit lane: secondary, not competing with the thrower
   const person=(x,yb,z,col,row,mat,sc)=>{const g=new T.PlaneGeometry(cellW*sc,cellH*sc),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(col+uv.getX(i))/8,1-(row+1-uv.getY(i))/3);const m=new T.Mesh(g,mat);m.position.set(x,yb+cellH*sc/2,z);m.rotation.y=-Math.PI/2;G.add(m);};
   const dark=new T.MeshStandardMaterial({color:0x0b0d12,roughness:.85});
   const riser=new T.Mesh(new T.BoxGeometry(.5,.3,5.6),dark);riser.position.set(5.22,.15,Z0+.5);G.add(riser);
   const hb=new T.Mesh(new T.PlaneGeometry(3.8,.24),new T.MeshBasicMaterial({map:textTexture('TRANS-TASMAN CHAMPIONSHIP   ·   NZ  v  AUS','#0b1428','#d9d3c6',2048,130,84),color:new T.Color().setRGB(.8,.8,.8)}));hb.position.set(4.955,.15,Z0+.7);hb.rotation.y=-Math.PI/2;G.add(hb);   // on the riser face, behind the seated row: layered, not a strip across the frame
   const hl=new T.Mesh(new T.PlaneGeometry(3.8,.02),new T.MeshBasicMaterial({color:0xb88934}));hl.position.set(4.95,.28,Z0+.7);hl.rotation.y=-Math.PI/2;G.add(hl);
   // two deliberate groups either side of the lane; the band behind the thrower's head and throwing arm (z about 0.8-2.9) stays clear; the second group sits behind his back on both cameras
   [[-.55,0,.06],[.05,3,-.08],[3.05,5,.1],[3.5,1,-.05],[4.0,6,.04]].forEach(([z,c,jx],k)=>person(5.25+jx,.3,z,c,2,back,.95+((k*7)%5)*.025));   // standing at the back, clapping
   [[-.85,2,.1],[-.25,4,-.12],[.35,7,.05],[3.2,0,-.06],[3.65,6,.12],[4.1,5,0]].forEach(([z,c,jx],k)=>person(4.72+jx,0,z,c,0,front,.95+((k*3)%5)*.025));   // seated in front, staggered
   G.userData.ttDim=1;}
  else if(t===6&&rows&&CROWD_TEX){   // Art (Worlds, QA audit: 'sphere crowd'): the same seven stepped rows, packed with people from the crowd atlas instead of box bodies and ball heads.
   // Front rows a touch lighter, back rows falling into the haze, so the thrower stays the brightest thing; they sit, clap and stand to cheer with the main crowd (crowdBob).
   const seat=new T.MeshStandardMaterial({color:0x101216,roughness:.7}),edgeM=new T.MeshBasicMaterial({color:new T.Color(ACC).multiplyScalar(.45),toneMapped:false});
   const spots=[],phones=[];
   for(let r=0;r<rows;r++){const x=X+1.6+r*.62,y=r*.4;
    const st=new T.Mesh(new T.BoxGeometry(.62,.4,per*.48+.6),seat);st.position.set(x,y-.2+.001,Z0+.4);G.add(st);
    const ed=new T.Mesh(new T.BoxGeometry(.02,.02,per*.48+.6),edgeM);ed.position.set(x-.31,y,Z0+.4);G.add(ed);
    for(let c=0;c<per;c++){if(((r*31+c*17)%13)===0)continue;const z=Z0+.4-(per*.48)/2+c*.48+(r%2)*.24+(((r*7+c*11)%9)/9-.5)*.1;spots.push([x+.08,y,z,r]);
     if(((r*13+c*7)%7)===0)phones.push([x-.12,y+.95+((c*3)%5)*.05,z]);}}
   const n=spots.length,pos=new Float32Array(n*12),uv=new Float32Array(n*8),cl=new Float32Array(n*12),idx=[],meta=[];
   spots.forEach(([x,y,z,r],i)=>{const hs=((i*2654435761)>>>0)/4294967296,h=(.9+((i*37)%11)/110)*1.02,band=Math.max(0,1-Math.abs(z-2.0)/1.1),k=(.42-.035*r-(r>=4?.03*(r-3):0))*(1-.28*band*(r<4?1:.5));meta.push({ch:((hs*8)|0)%8,base:y-.02,h:2.1*h*.98,w:1.05*h*.98,cx:0,sx:(i*7)%2?-1:1,x,z,pose:0,idle:band<.5&&r<3&&hs>.88?2:0,ph:i*1.7});
    for(let v=0;v<4;v++)cl.set([k*.86,k*.88,k],i*12+v*3);idx.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3);});
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setAttribute('color',new T.BufferAttribute(cl,3));g.setIndex(idx);
   const mesh=new T.Mesh(g,new T.MeshBasicMaterial({map:CROWD_TEX,transparent:true,alphaTest:.45,side:T.DoubleSide,vertexColors:true}));mesh.frustumCulled=false;G.add(mesh);
   SIDE_C={sprite:mesh,meta};SIDE_C.meta.forEach(q=>q.pose=q.idle);spriteLayout(SIDE_C,0);
   if(phones.length){const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(phones.flat(),3));G.add(new T.Points(pg,new T.PointsMaterial({color:0xfff6e0,size:.05,sizeAttenuation:true,transparent:true,opacity:.85})));}}
  else if(rows){const SH=[0x2a3550,0x5a1f22,0x1f3a2a,0x3c3c44,0x50402a,0x223048,0x472447,0x606068,0x1a1a1e,0x6a4a20];
   const body=new T.MeshStandardMaterial({color:0xffffff,roughness:.85}),skin=new T.MeshStandardMaterial({color:0x3a2c26,roughness:.85});
   const rim=new T.MeshBasicMaterial({color:new T.Color(ACC).multiplyScalar(.7),toneMapped:false});
   const bG=new T.BoxGeometry(.3,.46,.4),hG=new T.SphereGeometry(.095,10,8),rG=new T.BoxGeometry(.015,.04,.36);
   const bI=new T.InstancedMesh(bG,body,rows*per),hI=new T.InstancedMesh(hG,skin,rows*per),rI=new T.InstancedMesh(rG,rim,rows*per);
   const m=new T.Matrix4(),q=new T.Quaternion(),sc=new T.Vector3(1,1,1),ps=new T.Vector3(),col=new T.Color();let n=0;const phones=[];
   const seat=new T.MeshStandardMaterial({color:0x101216,roughness:.7}),edgeM=new T.MeshBasicMaterial({color:new T.Color(ACC).multiplyScalar(.45),toneMapped:false});
   for(let r=0;r<rows;r++){const x=X+1.6+r*.62,y=r*.4;
    const st=new T.Mesh(new T.BoxGeometry(.62,.4,per*.48+.6),seat);st.position.set(x,y-.2+.001,Z0+.4);G.add(st);
    const ed=new T.Mesh(new T.BoxGeometry(.02,.02,per*.48+.6),edgeM);ed.position.set(x-.31,y,Z0+.4);G.add(ed);
    for(let c=0;c<per;c++){if(Math.random()<.08)continue;const z=Z0+.4-(per*.48)/2+c*.48+(r%2)*.24+(Math.random()-.5)*.1,sh=.92+Math.random()*.16,stand=t>=6&&Math.random()<.18?.22:0;
     sc.set(1,sh,1);ps.set(x+.05,y+.23*sh+stand,z);m.compose(ps,q,sc);bI.setMatrixAt(n,m);col.setHex(SH[(Math.random()*SH.length)|0]).multiplyScalar(.28+Math.random()*.2);bI.setColorAt(n,col);
     ps.set(x+.05,y+.46*sh+.13+stand,z);sc.set(1,1,1);m.compose(ps,q,sc);hI.setMatrixAt(n,m);
     ps.set(x-.11,y+.46*sh+.02+stand,z);m.compose(ps,q,sc);rI.setMatrixAt(n,m);n++;
     if(Math.random()<(t>=6?.16:.08))phones.push([x-.14,y+.7+stand+Math.random()*.25,z]);}}
   [bI,hI,rI].forEach(o=>{o.count=n;o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;G.add(o);});
   if(phones.length){const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(phones.flat(),3));G.add(new T.Points(pg,new T.PointsMaterial({color:0xfff6e0,size:.06,sizeAttenuation:true,transparent:true,opacity:.9})));}}
  // v1.73 painted crowd backplate (ChatGPT review: hybrid; 3D near layers, image beyond ~4 m)
  if(PLATE){const pm=new T.MeshBasicMaterial({color:0x000000,toneMapped:false,fog:false});pm.userData.own=1;const pw=13.2,ph=8.8;const pl=new T.Mesh(new T.PlaneGeometry(pw,ph),pm);pl.position.set(X+3.4,ph/2-.25,Z0-.3);pl.rotation.y=-Math.PI/2;G.add(pl);
   try{new T.TextureLoader().load('assets/venue/'+PLATE,tx=>{tx.encoding=T.sRGBEncoding;tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());pm.map=tx;pm.color.setRGB(1,1,1);pm.needsUpdate=true;},null,()=>{pm.color.setHex(0x05070c);});}catch(e){}
   venue.traverse(o=>{const g=o.geometry;if(o.isMesh&&g&&g.type==='BoxGeometry'&&g.parameters.height<=.11&&g.parameters.width>=8&&o.position.y>3)o.visible=false;}); // open the low ceiling so the plate and rig read
   const bar=new T.Mesh(new T.BoxGeometry(.12,.95,12),new T.MeshStandardMaterial({color:0x07080b,roughness:.6}));bar.position.set(X+1.35,.475,Z0+.4);G.add(bar);
   const barL=new T.Mesh(new T.BoxGeometry(.02,.025,12),new T.MeshBasicMaterial({color:new T.Color(ACC),toneMapped:false}));barL.position.set(X+1.28,.93,Z0+.4);G.add(barL);}
  // soft glow texture shared by halos, back glow and haze
  const gcv=document.createElement('canvas');gcv.width=gcv.height=128;{const gx=gcv.getContext('2d');const rg=gx.createRadialGradient(64,64,0,64,64,64);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.35,'rgba(255,255,255,.45)');rg.addColorStop(1,'rgba(255,255,255,0)');gx.fillStyle=rg;gx.fillRect(0,0,128,128);}const gTex=new T.CanvasTexture(gcv);
  const glow=(w,h,c,o,x,y,z)=>{const g=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:gTex,color:new T.Color(c),transparent:true,opacity:o,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));g.position.set(x,y,z);g.rotation.y=-Math.PI/2;G.add(g);return g;};
  // back glow behind the thrower so his silhouette separates from the dark
  if(!PLATE)glow(big?4.2:3.2,big?3.2:2.6,ACC,big?.34:.3,X+(big?1.2:.4),1.55,Z0+.05);
  // stage lip: raised black stage with a lit front edge
  const lipM=new T.MeshBasicMaterial({color:new T.Color(ACC),toneMapped:false});const deck=new T.Mesh(new T.BoxGeometry(big?1.6:1,.18,big?9:6),new T.MeshStandardMaterial({color:0x030304,roughness:.9,metalness:0}));deck.position.set(X+(big?.5:.2),.09,Z0+.4);G.add(deck);
  const lip=new T.Mesh(new T.BoxGeometry(.03,.03,big?9:6),lipM);lip.position.set(deck.position.x-(big?.8:.5)-.02,.17,Z0+.4);G.add(lip);
  // per-tier identity
  const blackM=new T.MeshStandardMaterial({color:0x111215,metalness:.6,roughness:.45});
  if(t===2){ // regional: pipe-and-drape + fabric banners
   const dc=document.createElement('canvas');dc.width=256;dc.height=64;{const dx=dc.getContext('2d');for(let i=0;i<256;i++){const v=14+Math.round(9*Math.sin(i/256*Math.PI*18)+4*Math.sin(i*.9));dx.fillStyle=`rgb(${v},${v},${v+3})`;dx.fillRect(i,0,1,64);}}const dTex=new T.CanvasTexture(dc);dTex.wrapS=T.RepeatWrapping;dTex.repeat.set(3,1);
   const drape=new T.Mesh(new T.PlaneGeometry(7,3.3),new T.MeshStandardMaterial({map:dTex,roughness:1}));drape.position.set(X+1.1,1.65,Z0+.3);drape.rotation.y=-Math.PI/2;G.add(drape);
   const pipe=new T.Mesh(new T.CylinderGeometry(.02,.02,7,6),blackM);pipe.rotation.x=Math.PI/2;pipe.position.set(X+1.05,3.3,Z0+.3);G.add(pipe);
   [-1.9,1.9].forEach((dz,i)=>{const bc=document.createElement('canvas');bc.width=128;bc.height=384;const bx=bc.getContext('2d');bx.fillStyle=ACC;bx.fillRect(0,0,128,384);bx.fillStyle='rgba(0,0,0,.25)';bx.fillRect(0,330,128,54);bx.save();bx.translate(64,192);bx.rotate(-Math.PI/2);bx.fillStyle='#0b0d0c';bx.font='900 64px "Barlow Condensed",Impact,sans-serif';bx.textAlign='center';bx.textBaseline='middle';bx.fillText(i?'REGIONAL':'AUCKLAND',0,0);bx.restore();
    const bt=new T.CanvasTexture(bc);bt.encoding=T.sRGBEncoding;const ban=new T.Mesh(new T.PlaneGeometry(.55,1.65),new T.MeshStandardMaterial({map:bt,roughness:.95,side:T.DoubleSide}));ban.position.set(X+.45,2.0,Z0-.55+dz);ban.rotation.y=-Math.PI/2;G.add(ban);});}
  if(t===3){ // DPNZ: two red light columns on black truss
   [-1.8,1.8].forEach(dz=>{const z=Z0-.55+dz;const up=new T.Mesh(new T.BoxGeometry(.22,3.4,.22),blackM);up.position.set(X+.5,1.7,z);G.add(up);
    const bar=new T.Mesh(new T.BoxGeometry(.06,2.9,.1),new T.MeshBasicMaterial({color:new T.Color(ACC).multiplyScalar(1.4),toneMapped:false}));bar.position.set(X+.37,1.65,z);G.add(bar);glow(.9,3.4,ACC,.4,X+.33,1.65,z);});}
  if(t===5){ // Pro Tour: broadcast camera on a tripod
   const cam=new T.Group();const legM=new T.MeshStandardMaterial({color:0x1a1b1f,metalness:.7,roughness:.4});
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const lg=new T.Mesh(new T.CylinderGeometry(.018,.018,1.25,6),legM);lg.position.set(Math.cos(a)*.22,.58,Math.sin(a)*.22);lg.rotation.set(Math.sin(a)*.2,0,-Math.cos(a)*.2);cam.add(lg);}
   const bodyC=new T.Mesh(new T.BoxGeometry(.5,.26,.22),new T.MeshStandardMaterial({color:0x22252b,metalness:.5,roughness:.4}));bodyC.position.set(0,1.32,0);cam.add(bodyC);
   const lens=new T.Mesh(new T.CylinderGeometry(.075,.09,.36,14),new T.MeshStandardMaterial({color:0x0c0d10,metalness:.6,roughness:.3}));lens.rotation.z=Math.PI/2;lens.position.set(-.42,1.32,0);cam.add(lens);
   const vf=new T.Mesh(new T.BoxGeometry(.18,.14,.16),bodyC.material);vf.position.set(.12,1.52,.06);cam.add(vf);
   const tally=new T.Mesh(new T.SphereGeometry(.022,8,6),new T.MeshBasicMaterial({color:0xff2a2a,toneMapped:false}));tally.position.set(-.2,1.47,0);cam.add(tally);glow(.25,.25,0xff3030,.6,X-.1,1.47,Z0+1.25);
   cam.position.set(X+.1,0,Z0+1.25);G.add(cam);}
  if(t===6){ // World Champs: overhead gold lighting ring + haze
   const ring=new T.Mesh(new T.TorusGeometry(2.4,.07,8,48),new T.MeshStandardMaterial({color:0x8a7440,metalness:.85,roughness:.3}));ring.rotation.x=Math.PI/2;ring.position.set(X+2.6,4.6,Z0+.4);G.add(ring);
   const lampM=new T.MeshBasicMaterial({color:0xffe6a8,toneMapped:false});for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const lp=new T.Mesh(new T.SphereGeometry(.07,8,6),lampM);lp.position.set(X+2.6+Math.cos(a)*2.4,4.5,Z0+.4+Math.sin(a)*2.4);G.add(lp);}
   if(!PLATE){glow(6,1.6,ACC,.16,X+2.4,4.4,Z0+.4);glow(9,2.4,0xffe6b0,.07,X+5,1.8,Z0+.4);}}
  // floor edge glow strip under the LED
  const strip=new T.Mesh(new T.BoxGeometry(.04,.04,ledW),new T.MeshBasicMaterial({color:new T.Color(ACC),toneMapped:false}));strip.position.set(led.position.x-.06,led.position.y-ledH/2-.08,led.position.z);G.add(strip);if(PLATE)strip.visible=false;
  const fill=new T.PointLight(new T.Color(ACC),big?1.1:.6,7);fill.position.set(X-.2,2.2,Z0+.4);G.add(fill);sideLed=led;}

 // GFX: baked venues (Blender, lighting baked into textures). Loaded once, swapped in for the code-built room.
 const VENUE_GLB={0:'pub2.glb',1:'club2.glb'},VENUE_SC={}; // Art: pub2/club2 = the baked venues with the Art colour grade applied offline (wip/art/bake)
 function venueGlb(t){if(window.GFX_LEGACY||!VENUE_GLB[t])return null;if(VENUE_SC[t]&&VENUE_SC[t]!=='loading')return VENUE_SC[t];if(VENUE_SC[t]==='loading')return null;VENUE_SC[t]='loading';
  const ld=(file,retry)=>{try{new T.GLTFLoader().load((window.TOPS_ASSETS||'assets/')+file,g=>{const k=(window.GFX_BAKE_K||1)*({0:1,1:.8}[t]||1);g.scene.traverse(o=>{if(o.isMesh){let mp=o.material.map;if(mp&&window.TOPS_VENUE_TEX){try{mp=TOPS_VENUE_TEX(t,o.name,mp)||mp;}catch(e){}}if(mp){mp.encoding=T.sRGBEncoding;mp.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}o.material=new T.MeshBasicMaterial({map:mp,color:new T.Color().setRGB(k,k,k)});if(window.TOPS_VENUE_MAT){try{TOPS_VENUE_MAT(t,o.name,o.material);}catch(e){}}o.castShadow=false;o.receiveShadow=false;if(/board/i.test(o.name))o.position.z-=.018;o.matrixAutoUpdate=false;o.updateMatrix();}});g.scene.userData.keep=1;VENUE_SC[t]=g.scene;if(lastTier===t)buildVenue(t);},null,e=>{if(retry){ld(retry,null);return;}console.warn('venue glb',e);VENUE_SC[t]=null;});}catch(e){VENUE_SC[t]=null;}};ld(VENUE_GLB[t],/2\.glb$/.test(VENUE_GLB[t])?VENUE_GLB[t].replace('2.glb','.glb'):null);return null;}   // Art: graded club2/pub2, falling back to the original file if it isn't on the server yet
 function buildVenueInner(t){lastTier=t;setEnv(t<=1?'pub':t<=3?'club':'stage');ledWall=null;clearGroup(venue);clearGroup(lights);extras.length=0;let spots=[];renderer.toneMappingExposure=[1.05,.78,1.05,1.0,1.0,1.1,.95][t]||1.05;if(S3_V2)try{v2LightMode(previewOn?'creator':'match');}catch(e){}document.body.dataset.tier=t;scene.fog=t>=2?new T.FogExp2([0,0,0x0a0c18,0x04101e,0x04101e,0x0a1d3a,0x0a0414][t],t===5?.03:.045):null;
  const pool=addLight(new T.SpotLight(0xfff0d8,.9,6,.5,.7,1.2));pool.position.set(.3,3.2,OCHE_Z+.3);const pt=new T.Object3D();pt.position.set(.1,0,OCHE_Z);lights.add(pt);pool.target=pt;
  const amb=addLight(new T.AmbientLight(0xffffff,.3));addLight(new T.HemisphereLight(0xdfe6ff,0x3a2a1a,.35));addLight(new T.PointLight(0xfff0e0,.45,8)).position.set(-.6,2.4,OCHE_Z+1.6);
  const key=addLight(new T.SpotLight(0xfff2dc,1.9,12,.55,.5,1));key.position.set(0,3.4,2.2);/* ENG-7 (QA-B3): the key light aims at a marker on the board, not the board itself: three's target is a child we add to `lights`, and adding the board there moved it into the lights group, so every clearGroup(lights) (each venue rebuild) removed the board face and disposed its geometry, 2048 px texture, bump map and material, mid-match too */{const kt=new T.Object3D();kt.position.copy(boardC);lights.add(kt);key.target=kt;key.userData.boardKey=1;}key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0005;
  const ROOM={w:9,h:3.4,d:8};const wallMat=(tex,col)=>new T.MeshLambertMaterial(tex?{map:tex}:{color:col});
  const floorY=0;const zb=ROOM.d-1; // back wall z
  const room=(wm,fm,cm,w=ROOM.w,h=ROOM.h,d=ROOM.d)=>{box(w,h,.1,wm,0,h/2,-.05);box(w,h,.1,wm,0,h/2,d-1+.05);box(.1,h,d,wm,-w/2,h/2,d/2-1);box(.1,h,d,wm,w/2,h/2,d/2-1);box(w,.1,d,fm,0,-.05,d/2-1).receiveShadow=true;box(w,.1,d,cm,0,h+.05,d/2-1);};
  const chairs=(rows,cols,x0,z0,dx,dz,col)=>{const sm=new T.MeshStandardMaterial({color:col,roughness:.8});for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=x0+c*dx,z=z0+r*dz;box(.42,.05,.42,sm,x,.45,z);box(.42,.4,.05,sm,x,.68,z+.2);[-1,1].forEach(s=>{box(.03,.45,.03,sm,x+s*.19,.22,z-.18);box(.03,.45,.03,sm,x+s*.19,.22,z+.18);});}};
  const screen=(x,y,z,w,h,ry=0)=>{box(w+.08,h+.08,.06,new T.MeshStandardMaterial({color:0x111,roughness:.4}),x,y,z);const s=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:boardTex}));s.position.set(x,y,z+.04);s.rotation.y=ry;venue.add(s);box(w*.9,h*.22,.02,new T.MeshBasicMaterial({color:0x0b1a30}),x,y-h*.38,z+.05);};
  const truss=(y,z,len,n,colA,colB)=>{box(.1,.1,len,new T.MeshStandardMaterial({color:0x777,metalness:.8,roughness:.4}),0,y,z);for(let k=0;k<n;k++){const x=-len/2+.5+k*(len-1)/(n-1);const pl=new T.Mesh(new T.CylinderGeometry(.09,.12,.2,12),new T.MeshStandardMaterial({color:0x222}));pl.position.set(x,y-.15,z);venue.add(pl);const lb=new T.Mesh(new T.CircleGeometry(.08,12),new T.MeshBasicMaterial({color:k%2?colA:colB}));lb.position.set(x,y-.26,z);lb.rotation.x=-Math.PI/2;venue.add(lb);glow(x,y-.3,z,k%2?colA:colB,1.4,.55);}};
  const VG=venueGlb(t);if(VG){venue.add(VG);const sh=new T.Mesh(new T.PlaneGeometry(4,5),new T.ShadowMaterial({opacity:.38,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));sh.rotation.x=-Math.PI/2;sh.position.set(0,.012,2.2);sh.receiveShadow=true;venue.add(sh);}
  if(t===0&&VG){ // pub (baked)
    const key0=key;amb.intensity=.12;key.intensity=1.0;key.color.set(0xffd9a0);key.angle=.42;key.penumbra=.6;
    addExtra('Jonno',-1.95,.55,-.35,'stand',0);addExtra('Shazza',-2.6,2.7,2.6,'stand',0);addExtra('Pete',-3.9,2.6,2.2,'stand',0);
    const seat=(nm,tx,tz,a)=>{const sx=tx+Math.cos(a)*.55,sz=tz+Math.sin(a)*.55;addExtra(nm,sx,sz,Math.atan2(-(tx-sx),-(tz-sz)),'sit',0);};
    seat('Mere',-1.7,3.9,2.6);seat('Hemi',-1.7,3.9,4.4);seat('Bev',1.9,3.7,.4);seat('Rangi',2.6,5.5,2.6);seat('Kiri',-1.6,5.8,.4);
    spots=[];
  }else if(t===0){ // pub
   const woodM=surf(woodTex('#4a2f1b','#2b1a0e',96),[3,1]),plasterM=surf(plasterTex('#5a2a28'),[4,2],{roughness:.95}),carpetM=surf(carpetTex('#2a1d1c'),[8,8],{roughness:1}),ceilM=surf(plasterTex('#2a241f'),[4,4]);
   const dado=1.15;
   [[0,-.05,ROOM.w,0],[0,zb+.05,ROOM.w,0],[-ROOM.w/2,ROOM.d/2-1,ROOM.d,1],[ROOM.w/2,ROOM.d/2-1,ROOM.d,1]].forEach(([x,z,len,side])=>{if(side){box(.1,dado,len,woodM,x,dado/2,z);box(.1,ROOM.h-dado,len,plasterM,x,dado+(ROOM.h-dado)/2,z);box(.05,.06,len,surf(woodTex('#6b4526','#3a2412',64),[6,1]),x+(x<0?.03:-.03),dado,z);}else{box(len,dado,.1,woodM,x,dado/2,z);box(len,ROOM.h-dado,.1,plasterM,x,dado+(ROOM.h-dado)/2,z);box(len,.06,.05,surf(woodTex('#6b4526','#3a2412',64),[6,1]),x,dado,z-.03);}});
   const fl=box(ROOM.w,.1,ROOM.d,carpetM,0,-.05,ROOM.d/2-1);fl.receiveShadow=true;box(ROOM.w,.1,ROOM.d,ceilM,0,ROOM.h+.05,ROOM.d/2-1);
   box(1.1,1.4,.06,surf(woodTex('#3a2414','#1e1208',48),[1,1]),0,BOARD_H,-.01).castShadow=false;
   const shade=new T.Mesh(new T.CylinderGeometry(.12,.24,.16,20,1,true),new T.MeshStandardMaterial({color:0x1d1d1d,side:T.DoubleSide,roughness:.6}));shade.position.set(0,2.55,.45);venue.add(shade);const bulb=new T.Mesh(new T.SphereGeometry(.035,10,8),new T.MeshBasicMaterial({color:0xffe2b0}));bulb.position.set(0,2.5,.45);venue.add(bulb);glow(0,2.47,.45,0xffd9a0,.8,.6);
   plane(.9,1.3,new T.MeshStandardMaterial({map:patternTexture((x,w,h)=>{x.fillStyle='#4a3524';x.fillRect(0,0,w,h);x.fillStyle='#1d2a22';x.fillRect(24,24,w-48,h-48);grain(x,w,h,18);x.fillStyle='rgba(235,235,225,.8)';x.font='600 48px Barlow,Arial';x.fillText('THURS LEAGUE',44,110);x.font='500 44px Barlow,Arial';['501 DBL OUT','','HOME  3','AWAY  2','','NEXT: 20 FEB'].forEach((l,i)=>x.fillText(l,50,200+i*64));},512,740),roughness:.9}),-1.05,1.75,.02);
   for(let i=0;i<4;i++){const x=(i<2?-2.2-i*.7:1.5+(i-2)*.7);box(.42,.34,.03,surf(woodTex('#2a1a0e','#140a04',32),[1,1]),x,2.1,.02);plane(.36,.28,new T.MeshStandardMaterial({map:patternTexture((c,w,h)=>{const gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,['#5a6b7a','#7a5a3a','#3a5a4a','#6a4a5a'][i]);gr.addColorStop(1,'#101418');c.fillStyle=gr;c.fillRect(0,0,w,h);grain(c,w,h,40);},128,96),roughness:.3}),x,2.1,.04);}
   box(1.2,.9,.06,woodM,3.2,1.9,-.02);plane(1.1,.8,new T.MeshBasicMaterial({color:0x08101c}),3.2,1.9,.02);plane(.5,.14,new T.MeshBasicMaterial({map:textTexture('OPEN','#08101c','#ff5a7a',512,140,110)}),3.2,2.05,.03);addLight(new T.PointLight(0xff4a6a,.35,2.5)).position.set(3.2,2.0,.3);glow(3.2,2.05,.08,0xff6a8a,1.1,.45);
   plane(1.0,.58,new T.MeshBasicMaterial({map:patternTexture((c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0b2a52');gr.addColorStop(1,'#061a36');c.fillStyle=gr;c.fillRect(0,0,w,h);c.fillStyle='#14633a';c.fillRect(0,h*.55,w,h*.45);c.fillStyle='#fff';c.font='700 40px Barlow';c.fillText('LIVE  SPORT',30,60);},512,300)}),-ROOM.w/2+.06,2.1,1.6,Math.PI/2);addLight(new T.PointLight(0x4a7ad0,.4,3)).position.set(-ROOM.w/2+.4,2.0,1.6);
   const barM=surf(woodTex('#3b2514','#1d1108',80),[2,1]);box(1.9,1.05,.65,barM,-3.3,.52,3.2);box(2.0,.06,.75,surf(woodTex('#241508','#120a04',40),[2,1],{roughness:.35}),-3.3,1.07,3.2);box(1.9,.03,.03,new T.MeshStandardMaterial({color:0xb08d3a,metalness:.8,roughness:.3}),-3.3,.25,3.55);
   for(let k=0;k<3;k++){box(.03,.26,.03,new T.MeshStandardMaterial({color:0xd9b45a,metalness:.9,roughness:.25}),-3.7+k*.22,1.22,3.05);box(.06,.05,.06,new T.MeshStandardMaterial({color:0x111,roughness:.5}),-3.7+k*.22,1.36,3.05);}
   box(2.0,.04,.3,barM,-3.3,1.9,zb-.15);box(2.0,.04,.3,barM,-3.3,2.3,zb-.15);for(let k=0;k<14;k++){const col=[0x3a5a2a,0x6a2a1a,0x2a3a6a,0x8a6a2a,0x2a2a2a][k%5];const bt=new T.Mesh(new T.CylinderGeometry(.03,.035,.26,10),new T.MeshStandardMaterial({color:col,roughness:.15,metalness:.1,transparent:true,opacity:.9}));bt.position.set(-4.2+k*.14,1.92+(k%2)*.4+.13,zb-.15);venue.add(bt);}
   addLight(new T.PointLight(0xffc27a,.6,3)).position.set(-3.3,2.6,zb-.3);
   // mirror-ish back bar panel + jukebox glow
   box(3.4,1.2,.05,new T.MeshStandardMaterial({color:0x1a1410,roughness:.2,metalness:.6}),-3.0,1.9,zb-.03);box(.7,1.5,.5,new T.MeshStandardMaterial({color:0x3a1a1a,roughness:.5}),3.6,.75,zb-.3);plane(.5,.6,new T.MeshBasicMaterial({color:0x5ad0ff}),3.6,1.1,zb-.54,Math.PI);addLight(new T.PointLight(0x5ad0ff,.5,2.5)).position.set(3.6,1.2,zb-.9);
   [-2.9,-3.6].forEach(x=>{box(.3,.05,.3,new T.MeshStandardMaterial({color:0x4a1a1a,roughness:.8}),x,.7,3.9);box(.04,.7,.04,new T.MeshStandardMaterial({color:0x222,metalness:.6,roughness:.4}),x,.35,3.9);});
   const tableM=surf(woodTex('#2c1d12','#160e06',48),[1,1]);[[-1.7,3.8],[1.9,3.6],[2.6,5.4],[-2.2,5.6]].forEach(([x,z])=>{const top=new T.Mesh(new T.CylinderGeometry(.42,.42,.04,24),tableM);top.position.set(x,.75,z);top.castShadow=true;venue.add(top);box(.06,.75,.06,new T.MeshStandardMaterial({color:0x1a1a1a,metalness:.5,roughness:.5}),x,.37,z);box(.4,.03,.4,new T.MeshStandardMaterial({color:0x1a1a1a}),x,.02,z);
    for(let k=0;k<2;k++){const gl=new T.Mesh(new T.CylinderGeometry(.035,.03,.14,12,1,true),new T.MeshStandardMaterial({color:0xd9a44a,transparent:true,opacity:.55,roughness:.1,side:T.DoubleSide}));gl.position.set(x-.12+k*.24,.84,z+(k?.1:-.08));venue.add(gl);}
    [[.55,0],[-.5,.2]].forEach(([dx,dz])=>{box(.28,.04,.28,new T.MeshStandardMaterial({color:0x4a1a1a,roughness:.8}),x+dx,.46,z+dz);box(.04,.46,.04,new T.MeshStandardMaterial({color:0x222,metalness:.6}),x+dx,.23,z+dz);});});
   [[-1.7,3.8],[1.9,3.6],[0,2.2]].forEach(([x,z])=>{const sh=new T.Mesh(new T.ConeGeometry(.18,.16,20,1,true),new T.MeshStandardMaterial({color:0x8a2a1a,side:T.DoubleSide,roughness:.7}));sh.position.set(x,2.4,z);venue.add(sh);const bb=new T.Mesh(new T.SphereGeometry(.03,10,8),new T.MeshBasicMaterial({color:0xffe0b0}));bb.position.set(x,2.33,z);venue.add(bb);glow(x,2.3,z,0xffc88a,.9,.7);box(.01,.9,.01,new T.MeshStandardMaterial({color:0x111}),x,2.95,z);addLight(new T.PointLight(0xffb86a,.75,4.5,2)).position.set(x,2.3,z);});
   amb.intensity=.12;key.intensity=1.0;key.color.set(0xffd9a0);key.angle=.42;key.penumbra=.6;
   addExtra('Jonno',-1.95,.55,-.35,'stand',0);addExtra('Shazza',-2.6,2.7,2.6,'stand',0);addExtra('Pete',-3.9,2.6,2.2,'stand',0);
   spots=[[-1.6,-.42,4.3],[1.5,-.42,4.1],[2.3,-.42,3.1],[2.1,-.42,5.9],[-2.6,-.42,5.2],[-1.2,-.42,3.6],[3.1,-.42,5.4]];
  }else if(t===1&&VG){ // club (baked)
    amb.intensity=.2;amb.color.set(0xffd9b0);key.intensity=1.2;key.color.set(0xffe2bc);pool.intensity=1.25;pool.color.set(0xffcf96);addLight(new T.PointLight(0xffc27a,1.4,3.6,1)).position.set(2.2,2.0,1.9);
    addExtra('Tama',1.4,1.0,.6,'stand',1);addExtra('Kev',2.5,3.3,2.9,'stand',1);
    [['Aroha',-3.15,4.6],['Sione',-2.05,4.6],['Mike',-2.6,5.35],['Deb',1.85,4.6],['Tane',2.95,4.6],['Jess',2.4,5.35]].forEach(([nm,x,z])=>addExtra(nm,x,z+.05,0,'sit',1));
    spots=[];
  }else if(t===1){ // club: function room, carpet, trophy cabinet, noticeboard, chairs
   const wm=surf(plasterTex('#2c4438'),[4,2]);room(wm,surf(carpetTex('#5a1c20'),[8,8]),surf(plasterTex('#6f6150'),[4,4]));box(ROOM.w,.9,.08,surf(woodTex('#5a3a22','#2e1c0e',64),[3,1]),0,.45,-.02);
   banner('WAITAKERE CLUB CHAMPIONSHIP','#1d3f6e','#f2efe6',2.6,2.75);
   // trophy cabinet
   box(1.5,1.9,.4,surf(woodTex('#5a3a22','#2e1c0e',48),[1,1]),-2.8,.95,.2);plane(1.3,1.6,new T.MeshStandardMaterial({color:0x9ab,transparent:true,opacity:.18,roughness:.05}),-2.8,1.05,.41);for(let r=0;r<2;r++)for(let i=0;i<4;i++){box(.08,.18+(i%2)*.08,.08,new T.MeshStandardMaterial({color:0xd9b45a,metalness:.85,roughness:.25}),-3.3+i*.33,.55+r*.7,.25);}
   // noticeboard
   box(1.2,.9,.04,new T.MeshStandardMaterial({color:0x6b5a3a,roughness:.95}),2.6,1.9,.02);for(let i=0;i<5;i++)plane(.22,.3,new T.MeshStandardMaterial({color:[0xf4f1ea,0xfff2a8,0xdfe9ff,0xf4f1ea,0xffd0d0][i]}),2.15+i*.22,1.9+(i%2)*.15-.07,.05);
   const fl=box(1.4,.05,.12,new T.MeshBasicMaterial({color:0xffffff}),0,ROOM.h-.03,1);glow(0,ROOM.h-.08,1,0xffffff,1.6,.35);glow(0,ROOM.h-.08,5,0xffffff,1.6,.35);addLight(new T.PointLight(0xffffff,.6,8)).position.set(0,3.1,1.2);addLight(new T.PointLight(0xfff4d8,.4,8)).position.set(0,3.0,5);box(1.4,.05,.12,new T.MeshBasicMaterial({color:0xffffff}),0,ROOM.h-.03,5);amb.intensity=.45;
   chairs(2,7,-3.6,4.2,.55,.7,0x3a4a7a);chairs(2,5,1.2,4.3,.55,.7,0x3a4a7a);
   // scorer table + whiteboard
   box(1.2,.04,.5,surf(woodTex('#8a6a4a','#5a3a22',48),[1,1]),1.9,.74,1.2);[-.5,.5].forEach(dx=>box(.05,.72,.05,new T.MeshStandardMaterial({color:0x333}),1.9+dx,.36,1.2));plane(.9,.6,new T.MeshStandardMaterial({color:0xf4f4f4,roughness:.3}),2.6,1.5,.03);
   addExtra('Tama',1.4,1.0,.6,'stand',1);addExtra('Kev',2.5,3.3,2.9,'stand',1);
   spots=[];for(let i=0;i<7;i++)spots.push([-3.6+i*.55,-.4,4.2+(i%2)*.7]);for(let i=0;i<5;i++)spots.push([1.2+i*.55,-.4,4.3+((i+1)%2)*.7]);
  }else if(t===2){ // regional stage
   const cur=surf(curtainTex('#1a1f3a','#0c0f22'),[5,1],{roughness:1});room(cur,surf(carpetTex('#101018'),[8,8]),wallMat(null,0x05050a));
   box(4.4,.1,4,surf(concreteTex('#1a1a22'),[3,3],{roughness:.6}),0,-.05,1.5);box(4.4,.6,.1,wallMat(null,0x2a2a33),0,-.35,3.5);box(ROOM.w,.1,ROOM.d,surf(carpetTex('#101018'),[8,8]),0,-.65,ROOM.d/2-1);
   box(1.2,.6,.12,new T.MeshStandardMaterial({color:0x3a3a44}),-2.9,-.35,3.4);box(1.2,.3,.12,new T.MeshStandardMaterial({color:0x3a3a44}),-2.9,-.5,3.1); // steps
   banner('AUCKLAND SUPER LEAGUE','#0f3d2e','#dfe7df',3,2.75);screen(-2.3,1.9,-.02,1.2,.75);screen(2.3,1.9,-.02,1.2,.75);
   truss(3.1,1.2,5,5,0xcfe3ff,0xcfe3ff);amb.intensity=.22;key.intensity=1.6;[-1.5,0,1.5].forEach(x=>cone(x,3.05,1.2,0xcfe3ff,3,.7,.05));
   box(1.1,.04,.5,new T.MeshStandardMaterial({color:0x1a1a22}),1.7,.74,1.0);box(1.1,.7,.5,new T.MeshStandardMaterial({color:0x0f3d2e}),1.7,.36,1.0);box(.3,.02,.2,new T.MeshStandardMaterial({color:0x222}),1.6,.77,.95);
   addExtra('Caller',2.3,1.2,0,'mic',2);addExtra('Marker',-2.0,1.3,-.4,'stand',2);
   chairs(3,10,-4.2,4.2,.42,.6,0x1a1a26);chairs(3,10,.6,4.2,.42,.6,0x1a1a26);
   for(let r=0;r<3;r++)for(let i=0;i<10;i++){if(Math.random()<.25)continue;spots.push([-4.2+i*.42,-1.0,4.2+r*.6]);spots.push([.6+i*.42,-1.0,4.2+r*.6]);}
  }else if(t===3||t===4){ // national / trans-tasman: broadcast stage
   room(wallMat(null,0x071a36),surf(carpetTex('#0a0c12'),[8,8]),wallMat(null,0x03070e),ROOM.w+2,ROOM.h+.6,ROOM.d+2);
   box(ROOM.w+2,ROOM.h,.1,wallMat(null,0x0b2a52),0,ROOM.h/2,-.04);
   box(5,.1,4.5,new T.MeshStandardMaterial({color:0x0e1216,roughness:.25,metalness:.2}),0,-.05,1.6);box(ROOM.w+2,.1,ROOM.d+2,surf(carpetTex('#0a0c12'),[8,8]),0,-.7,ROOM.d/2);box(5,.65,.1,wallMat(null,0x0f1a2c),0,-.38,3.85);
   plane(4.9,.5,new T.MeshBasicMaterial({map:textTexture(t===3?'DARTPLAYERS NEW ZEALAND  ·  PROTOUR  ·  PAPAKURA CLUB':'TRANS-TASMAN CHAMPIONSHIP  ·  NZ v AUS  ·  WELLINGTON','#061a36','#9cc8ff',2048,210,96)}),0,-.38,3.91);
   box(ROOM.w+2,.05,.06,new T.MeshBasicMaterial({color:0x2f8df0}),0,3.05,.03);box(5,.04,.06,new T.MeshBasicMaterial({color:0x2f8df0}),0,-.05,3.86);
   banner(t===3?'DPNZ PROTOUR · PAPAKURA':'TRANS-TASMAN CHAMPIONSHIP','#061a36','#e6f0ff',3.4,2.75);screen(-2.6,1.8,-.02,1.6,1.0);screen(2.6,1.8,-.02,1.6,1.0);
   if(t===4){plane(.7,.42,new T.MeshBasicMaterial({map:textTexture('NZ','#101c3a','#ffffff',512,300,200)}),-1.4,2.3,.02);plane(.7,.42,new T.MeshBasicMaterial({map:textTexture('AUS','#0d3a2a','#f3d35a',512,300,200)}),1.4,2.3,.02);}
   truss(3.3,1.4,6,6,0x9ab8ff,0xffffff);[-2,-.7,.7,2].forEach((x,i)=>cone(x,3.25,1.4,i%2?0xffffff:0x9ab8ff,3.2,.75,.06));addLight(new T.PointLight(0x5aa0ff,.5,10)).position.set(-3,3,2);addLight(new T.PointLight(0x5aa0ff,.5,10)).position.set(3,3,2);amb.intensity=.28;key.intensity=1.8;
   box(1.2,.04,.5,new T.MeshStandardMaterial({color:0x101418}),1.8,.74,1.0);box(1.2,.7,.5,new T.MeshStandardMaterial({color:0x061a36}),1.8,.36,1.0);box(.32,.02,.22,new T.MeshStandardMaterial({color:0x222}),1.7,.77,.95);
   addExtra('Caller',2.4,1.2,0,'mic',t);addExtra('Ref',-2.1,1.4,-.5,'stand',t,{shirt:'#1c1c1c'});
   chairs(4,22,-4.3,4.5,.41,.62,0x14141c);
   for(let r=0;r<4;r++)for(let i=0;i<22;i++){if(Math.random()<.15)continue;const x=-4.3+i*.41;spots.push([x,-1.05,4.5+r*.62]);}
  }else if(t===5){ // pro tour floor: rows of boards, no crowd
   room(wallMat(null,0x0a1d3a),surf(carpetTex('#16243a'),[10,8]),wallMat(null,0x05080c),ROOM.w+6,ROOM.h,ROOM.d);
   banner('PLAYERS CHAMPIONSHIP 12 · BOARD 7','#0b2a52','#cfe3ff',3,2.75);
   for(const i of [-2,-1,1,2]){const x=i*2.6;const s=new T.Mesh(new T.CircleGeometry(.37,32),new T.MeshBasicMaterial({color:0x0b0d10}));s.position.set(x,BOARD_H,.036);venue.add(s);const bd=new T.Mesh(new T.CircleGeometry(.2255,48),new T.MeshBasicMaterial({map:boardTex}));bd.position.set(x,BOARD_H,.04);venue.add(bd);
    plane(.8,.1,new T.MeshBasicMaterial({map:textTexture('BOARD '+(7+i),'#061a36','#cfe3ff',512,64,40)}),x,2.75,.02);
    const mat=new T.Mesh(new T.PlaneGeometry(.9,.1),new T.MeshBasicMaterial({color:0xdcdcdc}));mat.rotation.x=-Math.PI/2;mat.position.set(x,.012,OCHE_Z);venue.add(mat);
    // divider + scorer stand + player at the oche
    box(.04,1.2,2.4,new T.MeshStandardMaterial({color:0x121418,roughness:.7}),x-1.3,.6,1.2);box(.5,1.1,.4,new T.MeshStandardMaterial({color:0x16191e,roughness:.6}),x+.9,.55,OCHE_Z-.6);
    if(i!==1)addExtra('Pro '+i,x-.06,OCHE_Z+.08,1.0,'stand',5);}   // Art: board 8's player stood right behind the divider in the thrower view, so only a torso and a floating hand showed; boards 5, 6 and 9 keep theirs
   addLight(new T.PointLight(0xffffff,.5,16)).position.set(0,3.2,3);addLight(new T.PointLight(0xffffff,.4,16)).position.set(-5,3.2,2);addLight(new T.PointLight(0xffffff,.4,16)).position.set(5,3.2,2);amb.intensity=.45;key.intensity=1.2;
   box(.5,1.1,.4,new T.MeshStandardMaterial({color:0x16191e,roughness:.6}),.9,.55,OCHE_Z-.6);{const tb=new T.Mesh(new T.PlaneGeometry(.26,.18),new T.MeshBasicMaterial({color:0x2c6fb8,toneMapped:false}));tb.rotation.x=-Math.PI/2+.5;tb.position.set(.9,1.115,OCHE_Z-.6);venue.add(tb);} /* scorer's tablet */addExtra('Marker',1.35,OCHE_Z-1.55,Math.PI,'stand',5,{shirt:'#1c1c1c'});
  }else{ // worlds
   room(wallMat(null,0x120820),wallMat(null,0x05030a),wallMat(null,0x05030a),ROOM.w+10,ROOM.h+3,ROOM.d+8);
   ledWall=plane(5,3.2,new T.MeshBasicMaterial({map:patternTexture((x,w,h)=>{x.fillStyle='#1a0a2a';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=64)for(let j=0;j<h;j+=64){const d=Math.hypot(i-w/2,j-h/2)/(w/2);const a=Math.max(0,1-d)*.9;x.fillStyle=`rgba(${240},${150+Math.random()*60},${40},${a*(.5+Math.random()*.5)})`;x.fillRect(i+4,j+4,56,56);}x.fillStyle='rgba(0,0,0,.55)';x.beginPath();x.arc(w/2,h/2,h*.26,0,7);x.fill();},1024,640)}),0,1.7,.005);
   box(7,.1,5,new T.MeshStandardMaterial({color:0x0c0c14,roughness:.2,metalness:.3}),0,-.05,1.8);box(ROOM.w+10,.1,ROOM.d+8,wallMat(null,0x05030a),0,-1.2,ROOM.d/2);box(7,1.15,.1,wallMat(null,0x1a0f28),0,-.62,4.3);
   plane(6.8,.9,new T.MeshBasicMaterial({map:textTexture('WORLD DARTS CHAMPIONSHIP  ·  ALEXANDRA PALACE','#1a0f28','#f6e2a8',2048,270,120)}),0,-.62,4.36);
   const big=new T.Mesh(new T.CircleGeometry(.5,48),new T.MeshBasicMaterial({color:0x0b0d10}));big.position.set(0,BOARD_H,.03);venue.add(big);const ring=new T.Mesh(new T.RingGeometry(.5,.53,48),new T.MeshBasicMaterial({color:0xf0b23a}));ring.position.set(0,BOARD_H,.031);venue.add(ring);
   banner('WORLD CHAMPIONSHIP · ALEXANDRA PALACE','#2a0d0d','#f6e2a8',4.2,2.9);screen(-3.6,2.0,-.02,2.4,1.5);screen(3.6,2.0,-.02,2.4,1.5);
   for(let i=0;i<7;i++){const x=-4.5+i*1.5;const beam=new T.Mesh(new T.ConeGeometry(.5,6,12,1,true),new T.MeshBasicMaterial({alphaMap:beamFade(),color:0xffd778,transparent:true,opacity:.1,blending:T.AdditiveBlending,side:T.DoubleSide,depthWrite:false}));beam.position.set(x,2.2,1.2);beam.rotation.z=(i%2?1:-1)*.35;beam.rotation.x=.3;beam.layers.set(2);venue.add(beam);glow(x+(i%2?1:-1)*.9,5.0,1.9,0xffd778,2.2,.5);}
   truss(4.0,1.6,8,7,0xffd778,0x9ab8ff);truss(4.2,4.5,10,9,0xff5c5c,0x4cd2ff);
   addLight(new T.PointLight(0xffc070,.9,14)).position.set(-3,4,3);addLight(new T.PointLight(0x70a0ff,.9,14)).position.set(3,4,3);amb.intensity=.3;key.intensity=2;
   // trophy plinth + caller desk
   box(.5,.9,.5,new T.MeshStandardMaterial({color:0x1a1020}),-2.2,.45,.6);box(.16,.3,.16,new T.MeshStandardMaterial({color:0xd9b45a,metalness:.9,roughness:.2}),-2.2,1.05,.6);const cup=new T.Mesh(new T.CylinderGeometry(.14,.07,.22,16,1,true),new T.MeshStandardMaterial({color:0xe3c56a,metalness:.9,roughness:.2,side:T.DoubleSide}));cup.position.set(-2.2,1.3,.6);venue.add(cup);
   box(1.3,.04,.5,new T.MeshStandardMaterial({color:0x101418}),2.0,.74,1.0);box(1.3,.7,.5,new T.MeshStandardMaterial({color:0x2a0d0d}),2.0,.36,1.0);
   addExtra('Caller',2.5,1.2,0,'mic',6,{shirt:'#1c1c1c'});addExtra('Ref',-2.3,1.5,-.5,'stand',6,{shirt:'#1c1c1c'});
   for(let r=0;r<6;r++)for(let i=0;i<34;i++){const x=-7+i*.43+(r%2)*.2;if(Math.abs(x)<2.2&&r<2)continue;spots.push([x,-1.15+r*.28,4.6+r*.7]);}
   for(let r=0;r<3;r++)for(let i=0;i<8;i++){spots.push([-7.5+r*.5,-1.1+r*.3,-.5+i*.6]);spots.push([7.5-r*.5,-1.1+r*.3,-.5+i*.6]);}
  }
  makeCrowd(spots);
  const mat=new T.Mesh(new T.PlaneGeometry(.9,.1),new T.MeshBasicMaterial({color:0xdcdcdc}));mat.rotation.x=-Math.PI/2;mat.position.set(0,.012,OCHE_Z);venue.add(mat);}
 // --- camera poses
 const camPlayer={pos:new T.Vector3(0,1.62,OCHE_Z-.55),look:new T.Vector3(0,BOARD_H-.03,0),fov:40};
 const camSpec={pos:new T.Vector3(.62,1.74,OCHE_Z+1.05),look:new T.Vector3(-.12,1.5,0),fov:40};
 const camWalk={pos:new T.Vector3(1.4,1.75,OCHE_Z+4.2),look:new T.Vector3(0,BOARD_H-.4,0),fov:62};let walkT0=-1e9;function walkOn(){walkT0=performance.now();}
 const camPrev={pos:new T.Vector3(.35,1.5,OCHE_Z-1.3),look:new T.Vector3(-.55,1.1,OCHE_Z+1.5),fov:40};
 let camK=0; // 0 player, 1 spectator
 let punch=null;function punchIn(x,y,dur){if(RM)return;punch={t0:performance.now(),dur,x,y};}
 let cine=null;function cinema(x,y,dur){if(RM)return;cine={t0:performance.now(),dur,x,y};}
 function resize(){const w=innerWidth,h=innerHeight;portrait=h>w*1.1;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();armCam.aspect=w/h;armCam.fov=portrait?75:58;armCam.updateProjectionMatrix();
  camPlayer.fov=portrait?50:40;camPlayer.pos.z=portrait?OCHE_Z-.7:OCHE_Z-.55;camPlayer.look.y=portrait?BOARD_H-.2:BOARD_H-.03;camSpec.pos.z=portrait?OCHE_Z+1.35:OCHE_Z+1.05;camSpec.pos.y=portrait?1.7:1.74;camSpec.look.y=portrait?1.42:1.5;camSpec.fov=portrait?50:40;camSpec.fov=portrait?60:46;camWalk.fov=portrait?75:62;}
 addEventListener('resize',resize);resize();
 // --- aiming
 const ray=new T.Raycaster(),ndc=new T.Vector2();
 function pointToBoardMM_main(cx,cy){ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObject(aimPlane);if(!h.length)return null;const p=h[0].point;return {x:(p.x-boardC.x)*1000,y:-(p.y-boardC.y)*1000};}
 function boardBottomY(){const p=new T.Vector3(0,BOARD_H-.4,BOARD_Z).project(camera);return (1-p.y)/2*innerHeight;}
 function mmToWorld(x,y,z=BOARD_Z){return new T.Vector3(boardC.x+x/1000,boardC.y-y/1000,z);}
 // --- stuck darts + flying
 const puffs=[];function puff(p,n=7){for(let i=0;i<n;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xcfc6b0,transparent:true,opacity:.35,depthWrite:false}));sp.position.copy(p);sp.position.z+=.004;sp.scale.setScalar(.006);sp.userData={t0:performance.now(),v:new T.Vector3((Math.random()-.5)*.05,(Math.random()-.3)*.04,.02+Math.random()*.03)};dartsG.add(sp);puffs.push(sp);}}
 function stepPuffs(now){for(let i=puffs.length-1;i>=0;i--){const sp=puffs[i];const k=(now-sp.userData.t0)/520;if(k>=1){dropPuff(sp);puffs.splice(i,1);continue;}sp.position.addScaledVector(sp.userData.v,.016);sp.scale.setScalar(.006+k*.03);sp.material.opacity=.35*(1-k);}}
 const marks=[];function hitMark(p){const m=new T.Mesh(new T.RingGeometry(.0045,.006,24),new T.MeshBasicMaterial({color:0xe9e4d8,transparent:true,opacity:.8,depthTest:false}));m.position.copy(p);m.position.z+=.001;m.renderOrder=6;m.userData.t0=performance.now();dartsG.add(m);marks.push(m);}
 function stepMarks(now){for(let i=marks.length-1;i>=0;i--){const m=marks[i];const k=(now-m.userData.t0)/220;if(k>=1){drop(m);marks.splice(i,1);continue;}const s=1+k*.6;m.scale.set(s,s,1);m.material.opacity=.8*(1-k);}}
 const stuck=[];/* #15b: every thrown dart, hit ring and puff is built fresh, so free it when it leaves the board (before, each one stayed in GPU memory: ~8 geometries + a flight texture per dart) */function drop(o){dartsG.remove(o);disposeTree(o);}function dropPuff(sp){dartsG.remove(sp);sp.material.dispose();}/* a Sprite's geometry is three's one shared sprite quad: only the material is the puff's own */function clearDarts(){marks.forEach(drop);marks.length=0;puffs.forEach(dropPuff);puffs.length=0;stuck.forEach(drop);stuck.length=0;}
 function stickDart(x,y,who){const d=who===0?myDart(save.flight):oppDart(S&&S.p[1]&&S.p[1].name);const p=mmToWorld(x,y,BOARD_Z+.003);d.rotation.set(-.12+Math.random()*.1,(Math.random()-.5)*.1,Math.random()*6);const tip=new T.Vector3(0,0,d.userData.tipZ||-.07).applyQuaternion(d.quaternion);
  // LOOK: pivot group sits at the tip so the wobble never moves the tip; narrow contact shadow offset down-right of the key light
  const piv=new T.Group();piv.position.copy(p);d.position.copy(tip).negate();piv.add(d);const sh=new T.Mesh(new T.CircleGeometry(.0032,12),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.42,depthWrite:false}));sh.scale.set(1.7,.75,1);sh.position.set(.0016,-.0014,-.0024);piv.add(sh);
  const hh=scoreAt(x,y);if(hh.m===3||hh.label==='BULL')hitMark(p);puff(p,4);piv.userData={t0:performance.now(),amp:.045+Math.random()*.03,ax:(Math.random()-.5)*.8};dartsG.add(piv);stuck.push(piv);}
 function wobble(now){for(const d of stuck){const u=d.userData;if(!u.t0)continue;const t=(now-u.t0)/1000;if(RM||t>.55){d.rotation.x=0;d.rotation.y=0;u.t0=0;continue;}const w=Math.sin(t*2*Math.PI*9)*u.amp*Math.exp(-t*7.5);d.rotation.x=w;d.rotation.y=w*u.ax;}}
 const flights=[];
 function fly(from,x,y,who,dur,arc,done){const d=who===0?myDart(save.flight):oppDart(S&&S.p[1]&&S.p[1].name);scene.add(d);const to=mmToWorld(x,y,BOARD_Z+.07);flights.push({d,from:from.clone(),to,t0:performance.now(),dur,arc,done,who,x,y});}
 function stepFlights(now){for(let i=flights.length-1;i>=0;i--){const f=flights[i];const k=Math.min(1,(now-f.t0)/f.dur);const p=new T.Vector3().lerpVectors(f.from,f.to,k);p.y+=Math.sin(k*Math.PI)*f.arc;
  const k2=Math.min(1,k+.02);const p2=new T.Vector3().lerpVectors(f.from,f.to,k2);p2.y+=Math.sin(k2*Math.PI)*f.arc;f.d.position.copy(p);f.d.lookAt(p2);f.d.rotateY(Math.PI);f.d.rotateZ(now/(f.dur>1000?400:80));
  if(k>=1){scene.remove(f.d);disposeTree(f.d);flights.splice(i,1);stickDart(f.x,f.y,f.who);f.done();}}}

 // ===== LOOK (sprint) ===== pane layout, fixed board camera, thrower camera, earned push/reaction, lighting pass
 function lkPhone(){return innerWidth<=700||innerHeight>innerWidth*1.1;}
 let lkSafeB=0,lkProbe=null;// EXP-MENU: top safe area (iPhone home-screen app, status bar drawn over the page). Read through --tops-sat so a test can emulate it.
function lkSafeTop(){if(!lkProbeT){lkProbeT=document.createElement('div');lkProbeT.style.cssText='position:fixed;left:0;top:0;width:1px;height:var(--tops-sat,0px);pointer-events:none;visibility:hidden';document.body.appendChild(lkProbeT);}return lkProbeT.offsetHeight||0;}
let lkProbeT=null;
function lkSafe(){if(!lkProbe){lkProbe=document.createElement('div');lkProbe.style.cssText='position:fixed;left:0;bottom:0;width:1px;height:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden';document.body.appendChild(lkProbe);}return lkProbe.offsetHeight||0;}
 let lkKey='';const lkR={phone:false,hdr:48,sb:112,pull:0,pad:72,diam:400,board:{x:0,y:48,w:100,h:100},player:{x:100,y:48,w:100,h:100}};
 function lkRects(){const W=innerWidth,H=innerHeight;const phone=lkPhone();const key=W+'x'+H+(phone?'p':'d');if(key===lkKey)return lkR;lkKey=key;lkSafeB=lkSafe();const sat=lkSafeTop();/* read only when the size changes: no per-frame layout */
  if(phone){const hdr=44+sat,sb=116,pull=lkSafeB;const avail=Math.max(300,H-hdr-sb-pull);let board=Math.round(Math.min(W*1.05,Math.max(300,H-40-sb-pull)*.52));board=Math.max(190,board);const ph=Math.max(0,avail-board);
   Object.assign(lkR,{phone,hdr,sb,pull,pad:0,diam:Math.round(Math.min(W,board)*.897),board:{x:0,y:hdr,w:W,h:board},player:{x:0,y:hdr+board,w:W,h:ph}});}
  else{const hdr=48+sat,sb=112,pad=0;const bh=Math.max(240,H-hdr-sb-pad);const bw=Math.round(W*840/1440);Object.assign(lkR,{phone,hdr,sb,pull:0,pad,diam:Math.round(Math.min(bw,bh)*.842),board:{x:0,y:hdr,w:bw,h:bh},player:{x:bw,y:hdr,w:W-bw,h:bh}});}
  const st=document.documentElement.style;st.setProperty('--lk-hdr',lkR.hdr+'px');st.setProperty('--lk-sb',lkR.sb+'px');st.setProperty('--lk-pull',lkR.pull+'px');st.setProperty('--lk-pad',lkR.pad+'px');st.setProperty('--lk-bw',lkR.board.w+'px');st.setProperty('--lk-bh',lkR.board.h+'px');st.setProperty('--lk-px',lkR.player.x+'px');st.setProperty('--lk-py',lkR.player.y+'px');st.setProperty('--lk-pw',lkR.player.w+'px');st.setProperty('--lk-ph',lkR.player.h+'px');st.setProperty('--lk-diam',lkR.diam+'px');document.body.classList.toggle('lk-phone',phone);return lkR;}
 // earned moments: 350 ms board push (140 in / 210 out, 8 %) toward a board point; 450-800 ms thrower reaction (player pane only)
 let lkPushS=null,lkReactS=null;function lookPush(x,y){if(RM)return;lkPushS={t0:performance.now(),x,y};}function lookReact(ms){if(RM)return;lkReactS={t0:performance.now(),dur:ms||450};}function lookSkip(){lkPushS=null;lkReactS=null;}
 const lkEase=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
 function lkPushK(now){if(!lkPushS)return 0;const t=now-lkPushS.t0;if(t>=350){lkPushS=null;return 0;}return t<140?lkEase(t/140):1-lkEase((t-140)/210);}
 function lkReactK(now){if(!lkReactS)return 0;const t=now-lkReactS.t0,d=lkReactS.dur;if(t>=d){lkReactS=null;return 0;}return t<120?lkEase(t/120):t>d-160?1-lkEase((t-(d-160))/160):1;}
 const lkFace={hx:0,hy:1.62,tz:OCHE_Z,set:false};let s3hfK=1,s3hfA=0;
 // lighting pass: one warm key on the board from above-left, venue ~1.5 stops under the thrower, rim on the thrower, restrained distance fade
 function lkRelight(t){const phone=lkPhone();let key=null,pool=null;lights.children.forEach(L=>{if(L.isSpotLight&&(L.userData.boardKey||L.target===board))key=L;else if(L.isSpotLight&&!pool)pool=L;});
  if(key){key.position.set(-.95,3.05,BOARD_Z+1.55);key.color.set(0xffe4c4);key.angle=.46;key.penumbra=.65;key.decay=1;key.intensity=Math.max(key.intensity,1.6);key.castShadow=!phone;}
  lights.children.forEach(L=>{if(L.isAmbientLight)L.intensity*=.45;else if(L.isHemisphereLight)L.intensity*=.5;else if(L.isPointLight)L.intensity*=.55;});
  if(pool){pool.intensity=1.25;pool.color.set(0xffe9d2);pool.position.set(.55,3.0,OCHE_Z+.9);pool.angle=.55;pool.penumbra=.75;}
  const rim=new T.SpotLight(0xdfe8ff,.9,6,.5,.8,1);rim.position.set(1.4,2.6,OCHE_Z+1.5);const rt=new T.Object3D();rt.position.set(0,1.45,OCHE_Z);lights.add(rt);rim.target=rt;lights.add(rim);
  const face=new T.PointLight(0xffd9b8,.35,2.6,2);face.position.set(-.5,1.9,OCHE_Z+.9);lights.add(face);
  if(!scene.fog){scene.fog=new T.FogExp2(t===0?0x110906:0x0e0c0a,.06);}else if(t>=2){scene.fog.density=Math.max(scene.fog.density,t===5?.035:.05);}
  const tint=[0xffffff,0xf0e4e0,0x8f96a8,0x9298a4,0x9a9aa6,0x9c9c9c,0xffffff][t]||0xffffff;surround.material.color.set(tint);
  // GFX: linear-light rebalance. Board key carries the scene; everything else sits under it.
  if(window.GFX_LIN){const G=window.GFX_K||{key:.42,other:.7,amb:.5};lights.children.forEach(L=>{if(!L.isLight)return;if(L===key)L.intensity*=G.key;else if(L.isAmbientLight||L.isHemisphereLight)L.intensity*=G.amb;else L.intensity*=G.other;});surround.material.color.multiplyScalar(t>=4?.4:.55);}}
 // --- per frame
 const camOff=new T.Vector3();let splitOn=false;function setSplit(on){splitOn=!!on;document.body.classList.toggle('split',splitOn);}const boardCam=new T.PerspectiveCamera(16,1,.05,20),faceCam=new T.PerspectiveCamera(30,1,.15,40);
 /* #20e: frame() reuses its camera/eye/size vectors, the walk-on argument object and the hidden-dart list (pos/look are only written in place; TOPS_WALKFX doesn't keep them) */const _fPos=new T.Vector3(),_fLook=new T.Vector3(),_fE1=new T.Vector3(),_fE2=new T.Vector3(),_fE3=new T.Vector3(),_fW=new T.Vector3(),_fSz=new T.Vector2(),_fHid=[],_fWv={me:null,pos:null,look:null,T:T,playClip:null,fpFig:null};
 function frame(now,state){const t=now/1000;if(window.TOPS_S3FLAG)s3RoomTick();if(!state)state={view:0,nerves:0,p:[{ai:false}],cur:0,done:true,pulling:false,busy:true,aim:{x:0,y:0},sway:{x:0,y:0},sigma:0,oppArm:{pull:0,phase:'idle'}};
  const targetK=((state.view===1||state.mateTurn)&&!(state.online&&window.__rr))?1:0;const dt=Math.min(.1,(now-(frame.last||now))/1000);frame.last=now;camK+=(targetK-camK)*Math.min(1,dt*4.5);
  if(state.reader){camSpec.pos.z=portrait?OCHE_Z+1.2:OCHE_Z+.9;}
  let pos=_fPos.lerpVectors(camPlayer.pos,camSpec.pos,camK),look=_fLook.lerpVectors(camPlayer.look,camSpec.look,camK),fov=camPlayer.fov+(camSpec.fov-camPlayer.fov)*camK;
  const useFP=fpFig&&!previewOn&&!idleOn&&!state.done&&!state.p[state.cur].ai&&!state.mateTurn;
  if(fpFig)fpFig.visible=!!useFP&&!cine&&!window.TOPS_WALKFULL;
  if(useFP){fpFig.position.set(camPlayer.pos.x+.1,0,camPlayer.pos.z+.04);fpFig.rotation.y=.8;stanceRigged(fpFig);
   let oa={phase:'idle'};const fpArmT=window.__fpArmT||(window.__fpArmT={fly:0,fol:0});if(state.pulling)oa={phase:'pull',pull:state.pull};else if(state.anim&&state.anim.kind==='throw'){const k=Math.min(1,(now-state.anim.t0)/state.anim.dur);oa={phase:'throw',pull:1,k};}else if(state.flyingOwn)oa={phase:'follow',pull:1,k:1,t0:now};{const A=fpArmT;if(oa.phase==='follow'){if(!A.fly)A.fly=now;A.fol=now;oa.k=Math.min(1,(now-A.fly)/170);}else if(oa.phase==='idle'&&A.fol){const d=now-A.fol;if(d<300)oa={phase:'follow',pull:1,k:1};else if(d<520)oa={phase:'reset',k:(d-300)/220};else{A.fol=0;A.fly=0;}}else if(oa.phase!=='follow'){A.fly=0;}}
   if(window.GFX_OA)oa=window.GFX_OA;fpFig.updateWorldMatrix(true,true);poseRigged(fpFig,oa,boardC,!splitOn);
   const B=fpFig.userData.B;const eL=boneWTo(_fE1,B.LeftEye),eR=boneWTo(_fE2,B.RightEye);const eye=eL.lerp(eR,.72);const fwdE=_fE3.subVectors(camPlayer.look,eye).normalize();eye.addScaledVector(fwdE,.05);
   if(camK<.5){pos.lerpVectors(eye,camSpec.pos,camK);}}
  const wk=Math.min(1,(now-walkT0)/2800);if(wk<1){const e=1-Math.pow(1-wk,3);pos.lerpVectors(camWalk.pos,pos,e);look.lerpVectors(camWalk.look,look,e);fov=camWalk.fov+(fov-camWalk.fov)*e;}
  if(cine){const k=(now-cine.t0)/cine.dur;if(k>=1.0){cine=null;}else{const tgt=mmToWorld(cine.x,cine.y);let cp,cl;if(flights.length){const f=flights[0];const dp=f.d.position.lengthSq()<1e-6?f.from:f.d.position;const e=Math.min(1,k*1.15);const side=new T.Vector3(.26,.03,.3).multiplyScalar(1-e*.45);cp=dp.clone().add(side);cl=dp.clone().lerp(tgt,.55+e*.45);cine.lastPos=cp;cine.lastLook=cl;}else{cp=cine.lastPos||pos.clone();cl=tgt.clone();}
   const back=Math.max(0,(k-.82)/.18);if(back>0){const e=back*back;pos.lerpVectors(cp,pos,e);look.lerpVectors(cl,look,e);fov=34+(fov-34)*e;}else{pos.copy(cp);look.copy(cl);fov=34;}punch=null;}}
  if(punch){const k=(now-punch.t0)/punch.dur;if(k>=1)punch=null;else{const e=k<.25?k/.25:1-Math.pow((k-.25)/.75,2);const w=mmToWorld(punch.x,punch.y);const spec=camK>=.5;look.lerp(_fW.set(w.x,w.y,0),(spec?.6:.85)*e);fov=fov+(Math.max(spec?20:14,fov*(spec?.55:.42))-fov)*e;}}
  if(previewOn){if(portrait){pos.set(Math.sin(t*.4)*.2,1.75,OCHE_Z-1.7);look.set(0,.7,OCHE_Z+1.5);fov=50;}else{pos.copy(camPrev.pos);pos.x+=Math.sin(t*.4)*.2;look.copy(camPrev.look);fov=40;}
   if(me&&me.userData.s3rig&&me.userData.s3rig.v3){pos.y+=.07;look.y+=.05;fov+=5;}/* Vinyl v3: a taller head and hair at the same head height: the preview frames up a little and widens so the quiff isn't cut */}
  else if(idleOn&&titleOn){const k=(Math.sin(t*.07)+1)/2;pos.set(-.75+.2*k,1.6,OCHE_Z+1.75-.25*k);look.set(portrait?-.3:-.72,1.56,0);fov=portrait?60:46;}else if(idleOn){const k=(Math.sin(t*.12)+1)/2;pos.set(1.6-2.4*k,1.75-.15*k,OCHE_Z+4.2-1.6*k);look.set(.1,1.45,0);fov=portrait?70:56;}
  if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}
  const nv=state.nerves;const sw=(1-camK)*(.0015+nv*.0025);pos.x+=Math.sin(t*1.3)*sw+camOff.x;pos.y+=Math.cos(t*1.7)*sw*.6+camOff.y;if(window.TOPS_WALKFX){try{const wv=_fWv;wv.me=me;wv.pos=pos;wv.look=look;wv.playClip=playClip;wv.fpFig=fpFig;const r=TOPS_WALKFX(now,wv);if(r&&r.fov!=null)fov=r.fov;}catch(e){}}camera.position.copy(pos);camera.lookAt(look);camOff.multiplyScalar(.8);
  camera.updateMatrixWorld();camera.updateMatrixWorld(true);
  // fp arm
  fpArm.visible=!fpFig&&!cine&&!previewOn&&!idleOn&&((camK<.5&&!state.p[state.cur].ai&&wk>=1)||state.done);
  if(fpArm.visible){let p=state.pulling?state.pull:0,tk=0;if(state.anim&&state.anim.kind==='throw'){tk=Math.min(1,(now-state.anim.t0)/state.anim.dur);}if(state.anim&&state.anim.kind==='pump'){const k=Math.min(1,(now-state.anim.t0)/state.anim.dur);poseArm(0,0,k);}else poseArm(p,tk);fpDart.visible=!(state.anim&&state.anim.kind==='throw'&&tk>.6)&&!state.flyingOwn;}
  // opponent
  if(opp){const u=opp.userData;const waitOK=window.TOPS_WAIT===true&&!state.online&&!previewOn&&!idleOn&&!cine&&!state.done&&!state.bull&&!(state.p[state.cur].ai||state.mateTurn)&&u.rigged&&u.ck&&u.ck!=='remy';
   // LOOK v1.43: the opponent waits behind the oche on your visit, sipping, shifting, looking about (Mixamo clips), then walks back into the throw pose
   if(waitOK){opp.visible=true;if(!u.waiting){u.waiting=true;/* #20 (Hayden 17:36): the waiting opponent holds one still pose: no clip loaded for it, no mixer ticking */try{if(u.mixer)u.mixer.stopAllAction();}catch(e){}try{poseOpp({phase:'idle',pull:0,k:0});stanceRigged(opp);opp.updateMatrixWorld(true);}catch(e){}}
    {const wp=window.TOPS_WAITPOS||[1.8,.05];opp.position.set(wp[0],0,OCHE_Z+wp[1]);}opp.rotation.set(0,window.TOPS_WAITRY!=null?TOPS_WAITRY:Math.PI*.82,0);if(O.dt)O.dt.visible=false;}
   else{if(u.waiting){u.waiting=false;try{if(u.mixer)u.mixer.stopAllAction();}catch(e){}opp.position.set(-.06,0,OCHE_Z+.08);opp.rotation.set(0,1.0,0);}opp.visible=!!(!previewOn&&!idleOn&&(state.p[state.cur].ai||state.mateTurn)&&!state.done);}}
  if(opp&&opp.visible&&!opp.userData.waiting){const oa=state.oppArm;poseOpp(oa);if(O.dt)O.dt.visible=!(oa.phase==='fly'||oa.phase==='follow'||oa.phase==='reset');opp.position.y=Math.sin(t*.9)*.004;opp.rotation.z=Math.sin(t*.7)*.006;opp.rotation.y=1.0+Math.sin(t*.23)*.03;opp.position.x=-.06+Math.sin(t*.31)*.012;}
  // v1.71: spares in the off hand count down through the visit (2, 1, 0)
  {const spN=Math.max(0,2-((state.visit&&state.visit.length)||0));const setSp=(f,on)=>{const B=f&&f.userData&&f.userData.B;if(B&&B.LeftHand){let i=0;B.LeftHand.children.forEach(c=>{if(c.userData.spare){c.visible=!!on&&i<spN&&!f.userData.noSp;i++;}});}};setSp(fpFig,splitOn);setSp(opp,true);}
  // reticle
  if(!(state.online&&state.cur!==0))window.__rr=null;const showRet=!previewOn&&!idleOn&&camK<.5&&!state.busy&&!state.done&&!state.p[state.cur].ai&&!state.mateTurn&&!document.body.classList.contains('card-noret');reticle.visible=false;/* FEEL: shader reticle replaces rr/rc/xh */if(showRet){const ax=state.aim.x+state.sway.x,ay=state.aim.y+state.sway.y;retLast={x:ax,y:ay,mode:state.pulling?'pull':'aim',sigma:state.sigma,perfect:!!state.inWin,over:!!state.over};retHideT=0;feelReticle(retLast);}else if(!previewOn&&!idleOn&&window.TOPS_remoteRet&&(window.__rr=window.TOPS_remoteRet())){feelReticle(window.__rr);}else if(retLast){if(!retHideT)retHideT=now;const k=(now-retHideT)/100;if(k>=1||state.done){retLast=null;feelReticle(null);}else feelReticle(Object.assign({},retLast,{op:1-k}));}else feelReticle(null);
  stepFlights(now);stepMarks(now);stepPuffs(now);stepSparks(now);wobble(now);crowdBob(t);extrasIdle(t);if(ledWall){ledWall.material.map.offset.x=(t*.004)%1;ledWall.material.map.wrapS=T.RepeatWrapping;}const useSplit=splitOn&&!previewOn&&!idleOn&&!cine&&!window.TOPS_WALKFULL&&state&&!state.done&&!(state.reader);
  if(useSplit){const _sz=renderer.getSize(_fSz);const W=_sz.x,Hh=_sz.y;const LR=lkRects();const BP=LR.board,PP=LR.player;const vert=LR.phone;
   // LOOK: board pane = whole numbered board + ~20 mm surround from a fixed camera (no follow, no zoom); only the earned push moves it, and never while pulling
   const pk=state.pulling?0:lkPushK(now);let cx=boardC.x,cy=boardC.y;const vis=.451*BP.h/Math.max(1,LR.diam);let bfov=18;let dist=(vis/2)/Math.tan(bfov/2*Math.PI/180);if(dist>1.7){dist=1.7;bfov=2*Math.atan((vis/2)/dist)*180/Math.PI;} // never back the camera past the oche (people stand there)
   {/* zoomed board: frames the aim point, glides between darts, frozen while pulling or a dart is in the air */const Z=window.__lkZ||(window.__lkZ={k:0,cx:boardC.x,cy:boardC.y,tx:boardC.x,ty:boardC.y});const zOn=window.__zoomOn!==false&&!state.done;const zdt=Math.min(.1,Math.max(.001,(now-(Z.t||now))/1000));Z.t=now;Z.k+=((zOn?1:0)-Z.k)*Math.min(1,zdt*8);const lockZ=state.pulling||state.anim||state.flyingOwn;if(!lockZ){const ai=(state.p[state.cur].ai||state.mateTurn)&&state.aiAim;const a=ai?state.aiAim:state.aim;if(a){const w=mmToWorld(Math.max(-150,Math.min(150,a.x)),Math.max(-150,Math.min(150,a.y)));Z.tx=w.x;Z.ty=w.y;}Z.cx+=(Z.tx-Z.cx)*Math.min(1,zdt*7);Z.cy+=(Z.ty-Z.cy)*Math.min(1,zdt*7);}cx+=(Z.cx-cx)*Z.k*.9;cy+=(Z.cy-cy)*Z.k*.9;bfov=bfov/(1+1.5*Z.k);}
   if(pk>0&&lkPushS){const w=mmToWorld(lkPushS.x,lkPushS.y);cx+=(w.x-cx)*.074*pk;cy+=(w.y-cy)*.074*pk;bfov=bfov/(1+.08*pk);}
   let dkc=null;try{dkc=window.TOPS_DRUNKCAM?TOPS_DRUNKCAM(now):null;}catch(e){}if(dkc){cx+=dkc.x;cy+=dkc.y;bfov*=dkc.f;}boardCam.position.set(cx,cy,BOARD_Z+dist);boardCam.lookAt(cx,cy,BOARD_Z);if(dkc)boardCam.rotateZ(dkc.r);boardCam.fov=bfov;
   // player pane: stable three-quarter thrower; the head target is frozen while pulling/throwing so the shot never moves during a pull
   const thrower=(state.p[state.cur].ai||state.mateTurn)?opp:fpFig;let hx=0,hy=1.62;if(thrower&&thrower.userData&&thrower.userData.B&&thrower.userData.B.Head){const hw=boneW(thrower.userData.B.Head);hx=hw.x;hy=hw.y;/* S3: the toy head is bigger and its centre sits higher than the head bone: frame its box (offset + scale measured once per figure) */if(thrower.userData.s3fig){const q=thrower.userData.s3hf||(thrower.userData.s3hf=(()=>{const F=s3HeadFrame(thrower,hw.y+.1);return {dy:F.c-hw.y-.1,f:Math.pow(F.f,.75)};})());hy+=q.dy;s3hfK=q.f;s3hfA=thrower.userData.s3v2?V2CAMA:0;}else{s3hfK=1;s3hfA=0;}}else{s3hfK=1;s3hfA=0;}
   const tz=(thrower&&thrower.position)?thrower.position.z:OCHE_Z;const locked=state.pulling||state.anim||state.flyingOwn;if(!lkFace.set||state.cur!==lkFace.cur){Object.assign(lkFace,{hx,hy,tz,set:true,cur:state.cur});}else if(!locked){lkFace.hx+=(hx-lkFace.hx)*.08;lkFace.hy+=(hy-lkFace.hy)*.08;lkFace.tz+=(tz-lkFace.tz)*.08;}
   const rk=lkReactK(now);const fx=lkFace.hx,fy=lkFace.hy,fz=lkFace.tz;{const an=((window.TOPS_CAMANG!=null?window.TOPS_CAMANG:0)+s3hfA)*Math.PI/180,D=2.3*s3hfK;/* Vinyl v2: the camera swings 32 deg toward the front so the dart fist in front of the 2x head is seen, not hidden behind it */faceCam.position.set(fx-D*Math.cos(an),fy+(vert?.1:.02)+.04*rk,fz+.1-D*Math.sin(an));}faceCam.lookAt(fx+.1,fy+(vert?.03:-.22)+(vert?.04:.16)*rk,fz+.02);faceCam.fov=(vert?21:30)*(1-.2*rk);if(window.GFX_FACECAM){const c=window.GFX_FACECAM;faceCam.position.set(...c.pos);faceCam.lookAt(...c.look);faceCam.fov=c.fov||50;}
   renderer.setScissorTest(false);renderer.setViewport(0,0,W,Hh);renderer.clear();renderer.setScissorTest(true);renderer.autoClear=true;
   renderer.setViewport(BP.x,Hh-(BP.y+BP.h),BP.w,BP.h);renderer.setScissor(BP.x,Hh-(BP.y+BP.h),BP.w,BP.h);
   boardCam.aspect=BP.w/BP.h;boardCam.updateProjectionMatrix();if(fpFig)fpFig.visible=false;const hid=_fHid;hid.length=0;for(let i=0;i<flights.length;i++){const f=flights[i];if(f.d.position.distanceTo(boardCam.position)<.5){f.d.visible=false;hid.push(f.d);}}renderer.render(scene,boardCam);for(let i=0;i<hid.length;i++)hid[i].visible=true;hid.length=0;
   if(fpFig)fpFig.visible=!!useFP;if(PP.h>0&&PP.w>0){renderer.setViewport(PP.x,Hh-(PP.y+PP.h),PP.w,PP.h);renderer.setScissor(PP.x,Hh-(PP.y+PP.h),PP.w,PP.h);faceCam.aspect=PP.w/PP.h;
   faceCam.updateProjectionMatrix();renderer.render(scene,faceCam);}renderer.setScissorTest(false);renderer.setViewport(0,0,W,Hh);return;}
  renderer.autoClear=true;(window.TOPS_WALKPOST&&TOPS_WALKPOST(),renderer.render(scene,camera));if(fpArm.visible&&!window.TOPS_WALKFULL){renderer.autoClear=false;renderer.clearDepth();renderer.render(armScene,armCam);}}
 function handWorld(){if(fpFig&&fpFig.visible){return boneW(fpFig.userData.B.RightHandIndex2);}const ndc=hand.position.clone().project(armCam);const far=new T.Vector3(ndc.x,ndc.y,.5).unproject(camera);const dir=far.sub(camera.position).normalize();return camera.position.clone().add(dir.multiplyScalar(.55));}
 function oppHandWorld(){if(!O.hand)return new T.Vector3(.4,1.6,OCHE_Z);O.hand.updateMatrixWorld(true);return new T.Vector3().setFromMatrixPosition(O.hand.matrixWorld);}
 const RM=matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function shake(){if(RM)return;camOff.set((Math.random()-.5)*.006,.004,0);}
 loadRig();setTimeout(()=>{const l=$('loading');if(l&&!window.TOPS_LDHOLD)l.classList.add('gone');},9000);onRig(()=>{const l=$('loading');if(l&&!window.TOPS_LDHOLD)l.classList.add('gone');/* ENG-RESET holds the screen until its hub is ready */if(window.onRigReady)setTimeout(window.onRigReady,50);if(lastTier>=0)buildVenue(lastTier);if(lastOpp)setOpponentLook(...lastOpp);if(lastMe)setPlayerLook(...lastMe);if(me&&idleOn)idle(true);if(previewOn)preview(true);});
 // --- portraits: render a figure's head to a data URL (cached)
 const pScene=new T.Scene();pScene.onBeforeRender=()=>{if(S3SKINF.size)s3SkinAll();};pScene.background=new T.Color(0x12161c);pScene.add(new T.HemisphereLight(0xdde6ff,0x2a2420,.9));const pKey=new T.DirectionalLight(0xfff1dc,1.0);pKey.position.set(.8,2.2,-1.6);pScene.add(pKey);const RIM={port:[0xffd8c0,.6],hero:[0xfff2e0,.45],on:true};/* CAR-7e: warm-white rims (were red .9 and lime .55, which turned dark hair red/green in portraits and the Locker hero; hair now keeps its oche colour) *//* portrait and hero rim lights (colour, intensity); RIM.on=false is the neutral reference for tests/portrait-hair.js */const pRim=new T.DirectionalLight(RIM.port[0],RIM.port[1]);pRim.position.set(-1.2,1.6,1.2);pScene.add(pRim);
 /* #20 (Director 22:10): the portrait/hero/dart image caches kept every data URL for the page's life; now small LRUs (most recently used kept). Hero stays PNG: it has a transparent background. */const LRU=(max)=>{const m=new Map();const st={miss:0,ev:0};return {get(k){const v=m.get(k);if(v!==undefined){m.delete(k);m.set(k,v);}else st.miss++;return v;},set(k,v){m.delete(k);m.set(k,v);while(m.size>max){m.delete(m.keys().next().value);st.ev++;}return v;},get size(){return m.size;},st,bytes(){let b=0;m.forEach(v=>b+=(v&&v.length)||0);return b;}};};
 const pCam=new T.PerspectiveCamera(26,1,.05,10);const PR=256;const pRT=new T.WebGLRenderTarget(PR,PR,{depthBuffer:true,encoding:window.GFX_LIN?T.sRGBEncoding:T.LinearEncoding});const portraitCache=LRU(40);
 /* S3: the toy head is bigger and sits higher than a real head; portraits and hero shots frame its box (centre c, scale f vs a .24 m head)
    so the whole head is in shot. Other figures: c = the usual head centre, f = 1 (unchanged). */
 function s3HeadFrame(fig,c0){if(!fig.userData.s3fig||!fig.userData.B||!fig.userData.B.Head)return {c:c0,f:1};const bx=fig.userData.B.Head.children.filter(o=>o.name==='s3part');if(!bx.length)return {c:c0,f:1};
  const b=new T.Box3();bx.forEach(o=>b.expandByObject(o));if(b.isEmpty())return {c:c0,f:1};const h=b.max.y-b.min.y;return {c:(b.max.y+b.min.y)/2,f:Math.max(1,Math.min(1.8,h/.24))};}
 function headshot(look,name,tier,dir){const key=JSON.stringify([look,name,tier,!!RIG.ready,dir||0,window.TOPS_S3FLAG?[S3G,save.vlook||null]:0]);{const hit=portraitCache.get(key);if(hit)return hit;}let fig;try{fig=makeFigure(look,name,tier);}catch(e){return '';}fig.position.set(0,0,0);fig.rotation.y=dir||0;if(fig.userData.rigged)stanceRigged(fig);pScene.add(fig);fig.updateWorldMatrix(true,true);
  let hy=1.6;if(fig.userData.B&&fig.userData.B.Head){const v=new T.Vector3();fig.userData.B.Head.getWorldPosition(v);hy=v.y+.07;}
  {const F=s3HeadFrame(fig,hy+.03);pCam.position.set(.14*F.f,F.c,-.74*F.f);pCam.lookAt(0,F.c-.05*F.f,0);}const prevT=renderer.toneMapping;pRim.color.setHex(RIM.port[0]);pRim.intensity=RIM.on?RIM.port[1]:0;renderer.setRenderTarget(pRT);renderer.render(pScene,pCam);const buf=new Uint8Array(PR*PR*4);renderer.readRenderTargetPixels(pRT,0,0,PR,PR,buf);renderer.setRenderTarget(null);pScene.remove(fig);disposeTree(fig);
  const c=document.createElement('canvas');c.width=c.height=PR;const x=c.getContext('2d');const id=x.createImageData(PR,PR);const g=new Uint8Array(256);for(let i=0;i<256;i++)g[i]=Math.round(Math.pow(Math.min(1,i/255*1.0),1/2.2)*255);
  for(let y=0;y<PR;y++){const src=(PR-1-y)*PR*4,dst=y*PR*4;for(let i=0;i<PR*4;i+=4){id.data[dst+i]=g[buf[src+i]];id.data[dst+i+1]=g[buf[src+i+1]];id.data[dst+i+2]=g[buf[src+i+2]];id.data[dst+i+3]=255;}}
  x.putImageData(id,0,0);const url=c.toDataURL('image/jpeg',.85);{const ck=charKey(look,name);if(ck==='remy'||RIGS[ck])portraitCache.set(key,url);else window.__avPending=1;}return url;}
 // AFTER HOURS hero render: waist-up 3/4 front view in the set pose, transparent background (for hub/reward hero banners)
 const HW=480,HH=600;const hRT=new T.WebGLRenderTarget(HW,HH,{depthBuffer:true,encoding:window.GFX_LIN?T.sRGBEncoding:T.LinearEncoding});const heroCache=LRU(4);const hCam=new T.PerspectiveCamera(30,HW/HH,.05,10);
 function heroShot(look,name,tier,flight){const key=JSON.stringify([look,name,tier,!!RIG.ready,flight||'',window.TOPS_S3FLAG?[S3G,save.vlook||null]:0]);{const hit=heroCache.get(key);if(hit)return hit;}let fig;try{fig=makeFigure(look,name,tier);}catch(e){return '';}if(!fig.userData.rigged)return '';
  fig.position.set(0,0,0);fig.rotation.y=0;stanceRigged(fig);pScene.add(fig);fig.updateWorldMatrix(true,true);
  let hy=1.6;if(fig.userData.B&&fig.userData.B.Head){const v=new T.Vector3();fig.userData.B.Head.getWorldPosition(v);hy=v.y;}
  try{poseDarts(fig,0,new T.Vector3(.35,hy+.05,-2.4),false);fig.updateWorldMatrix(true,true);}catch(e){}
  const bg=pScene.background;pScene.background=null;const rc=pRim.color.getHex(),ri=pRim.intensity;pRim.color.setHex(RIM.hero[0]);pRim.intensity=RIM.on?RIM.hero[1]:0;
  {const v=window.__HCAM||[-1.25,.14,-1.4,-.16];const F=s3HeadFrame(fig,hy+.1);hCam.position.set(v[0]*F.f,F.c+(v[1]-.1)*F.f,v[2]*F.f);hCam.lookAt(0,F.c+(v[3]-.1)*F.f,0);}const cc=renderer.getClearColor(new T.Color()),ca=renderer.getClearAlpha();renderer.setClearColor(0x000000,0);
  renderer.setRenderTarget(hRT);renderer.clear();renderer.render(pScene,hCam);const buf=new Uint8Array(HW*HH*4);renderer.readRenderTargetPixels(hRT,0,0,HW,HH,buf);renderer.setRenderTarget(null);renderer.setClearColor(cc,ca);pScene.background=bg;pRim.color.setHex(rc);pRim.intensity=ri;pScene.remove(fig);disposeTree(fig);
  const c=document.createElement('canvas');c.width=HW;c.height=HH;const x=c.getContext('2d');const id=x.createImageData(HW,HH);const g=new Uint8Array(256);for(let i=0;i<256;i++)g[i]=Math.round(Math.pow(i/255,1/2.2)*255);
  for(let y=0;y<HH;y++){const src=(HH-1-y)*HW*4,dst=y*HW*4;for(let i=0;i<HW*4;i+=4){const a=buf[src+i+3];id.data[dst+i]=g[buf[src+i]];id.data[dst+i+1]=g[buf[src+i+1]];id.data[dst+i+2]=g[buf[src+i+2]];id.data[dst+i+3]=a;}}
  x.putImageData(id,0,0);const url=c.toDataURL('image/png');{const ck=charKey(look,name);if(ck==='remy'||RIGS[ck])heroCache.set(key,url);else window.__avPending=1;}return url;}
 const dScene=new T.Scene();dScene.background=new T.Color(0x12161c);dScene.add(new T.HemisphereLight(0xffffff,0x202428,.8));const dKey=new T.DirectionalLight(0xffffff,1.4);dKey.position.set(1,2,1.5);dScene.add(dKey);const dRim=new T.DirectionalLight(0xe8382c,.8);dRim.position.set(-1,-.5,-1);dScene.add(dRim);
 const dCam=new T.OrthographicCamera(-.082,.082,.0256,-.0256,.01,5);dCam.position.set(0,.25,1);dCam.lookAt(0,0,0);const DW=768,DH=240;const dRT=new T.WebGLRenderTarget(DW,DH,{encoding:window.GFX_LIN?T.sRGBEncoding:T.LinearEncoding});const dartCache=LRU(16);
 window.TOPS_IMGC=()=>({p:portraitCache.size,h:heroCache.size,d:dartCache.size,a:Object.keys(_ART).length,kb:Math.round((portraitCache.bytes()+heroCache.bytes()+dartCache.bytes())/1024),miss:[portraitCache.st.miss,heroCache.st.miss,dartCache.st.miss],ev:[portraitCache.st.ev,heroCache.st.ev,dartCache.st.ev]});
 function dartShot(color,setup){setup=Object.assign({custom:!!save.flightCustom||!!(window.TOPS_flightReward&&TOPS_flightReward())},setup);const key=JSON.stringify([color,setup.shaft.id,setup.fl.id,setup.pt.id,setup.barrel.id,setup.custom]);{const hit=dartCache.get(key);if(hit)return hit;}const d=makeDart(color,setup);d.rotation.y=Math.PI/2;d.rotation.z=-.08;d.rotation.x=.35;d.position.x=.004;dScene.add(d);/* render onto a transparent background and keep the real alpha (QA 22:59: no colour key from pixel 0,0) */const bg0=dScene.background,oc=new T.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();const buf=new Uint8Array(DW*DH*4);try{dScene.background=null;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(dRT);renderer.clear();renderer.render(dScene,dCam);renderer.readRenderTargetPixels(dRT,0,0,DW,DH,buf);}finally{/* QA 01:15: always restore, so a failed render can't leave the main view transparent or on the render target */renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);dScene.background=bg0;dScene.remove(d);disposeTree(d);/* #15b: the image is cached, the model is not needed again */}
  const c=document.createElement('canvas');c.width=DW;c.height=DH;const x=c.getContext('2d');const id=x.createImageData(DW,DH);const g=new Uint8Array(256);for(let i=0;i<256;i++)g[i]=Math.round(Math.pow(i/255,1/2.2)*255);for(let y=0;y<DH;y++){const src=(DH-1-y)*DW*4,dst=y*DW*4;for(let i=0;i<DW*4;i+=4){id.data[dst+i]=g[buf[src+i]];id.data[dst+i+1]=g[buf[src+i+1]];id.data[dst+i+2]=g[buf[src+i+2]];id.data[dst+i+3]=buf[src+i+3];}}x.putImageData(id,0,0);const url=c.toDataURL('image/png');dartCache.set(key,url);return url;}
 function oppScreen(){if(!opp||!opp.visible)return null;const B=opp.userData.B;let w;if(B&&B.Head){w=boneW(B.Head);}else{w=opp.position.clone();w.y+=1.65;}const v=w.clone().project(camera);if(v.z>1)return null;return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight};}
 function mmToScreen(x,y){const w=new T.Vector3(boardC.x+x/1000,boardC.y-y/1000,boardC.z+.002);if(splitOn&&!previewOn&&!idleOn){const BP=lkRects().board;const v=w.clone().project(boardCam);if(v.z>1)return null;return {x:BP.x+(v.x+1)/2*BP.w,y:BP.y+(1-v.y)/2*BP.h,in:Math.abs(v.x)<=1&&Math.abs(v.y)<=1};}const v=w.clone().project(camera);if(v.z>1)return null;return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,in:Math.abs(v.x)<=1&&Math.abs(v.y)<=1};}
 function pointToBoardMM(cx,cy){if(!splitOn||previewOn||idleOn)return pointToBoardMM_main(cx,cy);const BP=lkRects().board;if(cx<BP.x||cx>BP.x+BP.w||cy<BP.y||cy>BP.y+BP.h)return null;const ndc=new T.Vector2((cx-BP.x)/BP.w*2-1,-((cy-BP.y)/BP.h)*2+1);const rc=new T.Raycaster();rc.setFromCamera(ndc,boardCam);const hit=rc.intersectObject(aimPlane)[0];if(!hit)return null;return {x:(hit.point.x-boardC.x)*1000,y:-(hit.point.y-boardC.y)*1000};}
 return {animsFlush,oppVar,loadHair:()=>loadHair(),loadAnims:()=>loadAnims(),hairFor:(look,name)=>{try{const ck=charKey(look,name);if(ck==='remy')return false;const v=oppVar(name,ck);return ck==='pete'||!!(v&&(v.beard||(v.hair2&&v.hair2!=='bald')))||!!(look&&(look.beard2||(look.hair2&&look.hair2!=='own')));}catch(e){return false;}},teardownMatch,showRelMark,chars:CHARS,charKey,feelReticle,boardMmPerPx,retInfo:()=>frInfo,ghostsSet,ghostsClear,setSplit,title,isSplit:()=>splitOn,oppScreen,dartShot,portrait:headshot,heroShot,cheer,punchIn,cinema,myDart,oppDart,lkRects,lookPush,lookReact,lookSkip,lkPhone,lkCluster:()=>{if(!stuck.length)return null;let x=0,y=0;stuck.forEach(d=>{x+=d.position.x;y+=d.position.y;});x/=stuck.length;y/=stuck.length;return {x:(x-boardC.x)*1000,y:-(y-boardC.y)*1000};},_qa:{rigReady:()=>RIG.ready,meFig:()=>me,faceCam:()=>faceCam,paneRects:()=>lkRects(),fpFig:()=>fpFig,playClip:(f,n,o)=>playClip(f,n,o||{}),animNames:()=>ANIMS?Object.keys(ANIMS):[],rims:on=>{RIM.on=!!on;},rimSet:(w,hex,i)=>{RIM[w]=[hex,i];},varSet:(k,v,named)=>{const T_=named?NAMED_VAR:MODEL_VAR;if(v==null)delete T_[k];else T_[k]=v;},/* look reviews: try an entry without a rebuild */darts:()=>({flying:flights.length,stuck:stuck.length,marks:marks.length,puffs:puffs.length}),kept:x=>kept(x),dispose:o=>disposeTree(o),ret:st=>feelReticle(st),pf:()=>perfFlashOn(),opp:()=>opp,fp:()=>fpFig,gfx:()=>({ray:(()=>{if(!window.GFX_FACECAM)return null;const rc=new T.Raycaster();rc.setFromCamera({x:0,y:0},faceCam);const h=rc.intersectObjects(scene.children,true)[0];if(!h)return null;let o=h.object,path=[];while(o){path.push((o.name||o.type)+(o.geometry?':'+o.geometry.type:''));o=o.parent;}return {d:+h.distance.toFixed(2),p:h.point.toArray().map(v=>+v.toFixed(2)),path:path.slice(0,4),mat:h.object.material&&h.object.material.type,col:h.object.material&&h.object.material.color&&h.object.material.color.getHexString()};})(),exPos:extras.map(f=>{const h=f.userData.B&&f.userData.B.Hips;return [f.userData.ck,f.userData.act&&f.userData.act.getClip().name,f.position.toArray().map(v=>+v.toFixed(2)),h?h.getWorldPosition(new T.Vector3()).toArray().map(v=>+v.toFixed(2)):null];}),hair:HAIRLIB?Object.keys(HAIRLIB):(HAIR_WAIT?'loading':'none'),extras:extras.map(f=>(f.userData.ck||'?')+':'+(f.userData.act?f.userData.act.getClip().name+'@'+f.userData.act.time.toFixed(1):'none')),anims:ANIMS?Object.keys(ANIMS).length:0,rigs:Object.keys(RIGS),wait:Object.keys(RIG_WAIT),venue:Object.keys(VENUE_SC).map(k=>k+':'+(VENUE_SC[k]==='loading'?'loading':!!VENUE_SC[k])),me:me&&me.userData&&me.userData.ck,box:me?(()=>{const b=new T.Box3().setFromObject(me);return [b.min.toArray().map(v=>+v.toFixed(2)),b.max.toArray().map(v=>+v.toFixed(2))];})():null,head:me&&me.userData.B?me.userData.B.Head.getWorldPosition(new T.Vector3()).toArray().map(v=>+v.toFixed(2)):null,pos:me?me.position.toArray():null,vis:me?me.visible:null,face:faceCam.position.toArray().map(v=>+v.toFixed(2))}),T,scene,camera,renderer,makeFigure,poseFigure,makeHand,stance,armScene,armCam,fpArm,getHand:()=>hand,poseArm,lights,venue},_dbg:()=>({cam:camera.position.toArray(),camDir:camera.getWorldDirection(new T.Vector3()).toArray(),fov:camera.fov,camK,face:faceCam.position.toArray(),faceDir:faceCam.getWorldDirection(new T.Vector3()).toArray(),faceFov:faceCam.fov,faceAsp:faceCam.aspect,camAsp:camera.aspect}),buildVenue,frame,setOpponentLook,setPlayerLook,preview,idle,pointToBoardMM,mmToScreen,boardBottomY,fly,clearDarts,handWorld,oppHandWorld,shake,stuck,walkOn,walking:()=>performance.now()-walkT0<2800,tcCelebrate:()=>{try{if(me)playClip(me,'pump',{once:true,fade:.2});setTimeout(()=>{try{me&&playClip(me,'idle',{fade:.6});}catch(e){}},2600);}catch(e){}}};
})();}catch(e){window.__noGL=e;console.error('3D failed',e);const stub=()=>null;return new Proxy({},{get:(t,k)=>k==='_qa'?{rigReady:()=>false}:stub});}})();
if(window.__noGL){document.body.classList.add('nogl');const l=document.getElementById('loading');if(l)l.classList.add('gone');}

// ===== NERVES / ADRENALINE =====
function situational(){const me=S.p[S.cur],op=oppOf(S.cur);let n=S.tier.press*(1+SK().press);if(S.legFirstVisit&&SK().warm)n=0;const tgt=scoreAt(S.aim.x,S.aim.y);if(me.score<=50&&(tgt.dbl||me.score<=40))n+=1+SK().fin;const need=Math.ceil(S.bestOf/2);if(me.legs===need-1||op.legs===need-1)n+=1;if(S.decider)n+=.5;if(op.score<=40)n+=.8;return n;}
function effNerves(){if(!S||S.done||S.practice)return 0;if(S.online&&S.cur===0&&S.fx&&S.fx.some(f=>f.mods&&f.mods.ice))return 0;const raw=situational()+S.adren-(S.calm||0);if(S.mp)return mpNerves(raw);return Math.max(0,raw-compEff()*.28);}
function nerveCause(){if(!S)return '';const me=S.p[S.cur],op=oppOf(S.cur);const need=Math.ceil(S.bestOf/2);if(me.score<=50&&me.legs===need-1)return 'Match dart';if(me.score<=50)return 'On a finish';if(op.score<=40)return 'Opponent on a finish';if(me.legs===need-1||op.legs===need-1)return 'Deciding leg';if(S.adren>1.2)return 'Big visit';if(S.tier.press>=.9)return 'The stage';return 'Settled';}
function nervePct(){const nv=spreadNerves();const sk=save.arm/10;const F0=.16+.1*(1-sk);return Math.round(((F0+nv*.045)/F0-1)*100+nv*4);}
function settle(){/* FEEL: now starts a hold-to-breathe; see breatheStart()/feelBreathe() */breatheStart();}
function spreadNerves(){return SK().noNerves?0:effNerves();}
function addAdrenaline(h,dartNo){const rarity=[1.6,1.3,1,.7,.5,.35,.3][ui.tier]*(1+SK().chase);
 if(h.label==='T20'||(h.m===3&&h.n>=19)){S.adren+=dartNo===1?.9*rarity:1.6*rarity;}else if(h.m===3)S.adren+=.4*rarity;else S.adren*=.5;}
function targetHR(){const n=effNerves();return 70+Math.min(90,n*22);}
// Aim model: the circle shrinks steadily through the pull (readable), reaching a floor at the sweet spot. Skill lowers the floor and the overall size; nerves raise the floor and shorten the shrink.
// ===== THROW MODEL: Lock & Release (TOPS-next) =====
// Aim drifts (amplitude A mm, speed w) with heartbeat kicks; pressing locks the aim point (+tremor tr); the ring then shrinks to its tightest (see ringR).
// Release error dt (ms, + late) beyond the perfect band P becomes a readable miss: late lands low, early lands high (kv mm/ms), plus side spread (kh), plus a small floor s0 that never goes away.
// Release cue (v3): pressing locks the aim and starts a ring shrinking from R0 to its tightest (1.794*s0) at D ms. Inside ±P ms it holds; outside it widens again
// (sqrt curve, faster when late). The ring at release IS the spread (80th percentile), plus a small early-high / late-low lean. No timing bar.
const TT=[[0,34,1.9,2.4,10.5,28,660,74],[.3,28,2.2,2.1,9.8,30,630,62],[.6,22,2.6,1.7,8.6,31,600,52],[1,13,3.0,1.2,7.6,30,560,48]]; // L, sway A mm, loop s, tremor, perfect sigma, perfect ±ms, ms to tightest, start ring mm. CAR-WIN (Hayden 19:32, proposal D): sway 50/38/26/13 -> 34/28/22/13, perfect sigma 13/11.2/8.6/6.4 -> 10.5/9.8/8.6/7.6 (easier start, tougher top; same for everyone at the same stats)
/* #20e: ttAt runs several times a frame (throwParams + v09's per-skill levels, 4 levels a frame); the last 8 results are reused by level (frozen: callers only read them) */const _ttL=[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],_ttV=[null,null,null,null,null,null,null,null];let _ttI=0;function ttAt(L){L=Math.max(0,Math.min(1,L));for(let i=0;i<8;i++)if(_ttL[i]===L)return _ttV[i];const v=Object.freeze(_ttAt(L));_ttL[_ttI]=L;_ttV[_ttI]=v;_ttI=(_ttI+1)&7;return v;}
function _ttAt(L){let i=0;while(i<TT.length-2&&TT[i+1][0]<L)i++;const a=TT[i],b=TT[i+1],k=(L-a[0])/(b[0]-a[0]);const m=j=>a[j]+(b[j]-a[j])*k;return {A:m(1),T:m(2),tr:m(3),s0:m(4),P:m(5),D:m(6),R0:m(7)};}
function throwLevel(){if(!S)return .3;if(typeof LES!=='undefined'&&LES.on)return Math.max(.3,throwLevelRaw());return throwLevelRaw();}
function throwLevelRaw(){if(S.mp){const sk=S.mp.arm;return Math.max(0,Math.min(1,(sk-.3)/.55));}const avg=(lvOf('sc')+lvOf('fi')+lvOf('co')+lvOf('cn'))/4;return Math.max(0,Math.min(1,(save.arm/10)*.4+(avg/16)*.6));}
function drinkLvl(){if(typeof cardFxHas==='function'&&cardFxHas('clear'))return 0;return (S&&S.pub&&S.pub.p[S.cur])?Math.min(8,S.pub.p[S.cur].lvl||0):0;}
function throwParams(){const L=throwLevel();const q=ttAt(L);const nv=S?effNerves():0;const b=S?S.barrel:barrel();const dl=drinkLvl();const tgt=S?scoreAt(S.aim.x,S.aim.y):{dbl:false};
 let A=q.A*(b.sway/1.1)*swayMultRaw()*(1+.25*nv)*(1+.1*dl),w=(2*Math.PI/q.T)*(1+.08*nv),tr=q.tr*Math.max(.4,1+SK().jit)*(1+.1*dl),P=q.P*tolMult()*(1-.3*Math.min(1,nv/2))*(1-.04*dl),D=q.D*(1-.08*Math.min(1,nv)),R0=q.R0*(1+.1*nv);
 const tm=targetMult();let kv=(1+.1*nv)*tm,kh=kv;let s0=Math.max(4.2,q.s0*Math.sqrt(b.base/5.6)*setupBaseMult()*(1+SK().spread));
 if(S&&S.mp){const P2=S.mp.me;const pm=(tgt.dbl||tgt.label==='BULL')?mpFiMult(P2):mpScMult(P2);kv*=pm;kh*=pm;s0*=Math.sqrt(pm);}
 if(S&&S.nine){A*=1.6;kv*=1.4;kh*=1.4;P*=.5;}
 if(S&&S.fx&&S.cur===0&&S.online){S.fx.forEach(f=>{if(f.hot&&f.hotOn)s0*=.7;if(f.mods)Object.keys(f.mods).forEach(k=>{if(k==='A')A*=f.mods[k];else if(k==='P')P*=f.mods[k];else if(k==='kv'){kv*=f.mods[k];kh*=f.mods[k];}else if(k==='tr')tr*=f.mods[k];else if(k==='w')w*=f.mods[k];else if(k==='s0')s0*=f.mods[k];});});}
 return {L,A,w,tr,P,kv,kh,s0,dl,D,R0};}
function swayMultRaw(){let m=(gearCount('case')?.92:1)*setupSwayMult();m*=1+SK().sway;return m;}
// drift: two slow loops per axis + heartbeat kicks + a little visible shake
// drift: one steady figure-of-8 through the aim point. Same shape and rhythm every time so it can be learned and timed;
// skill shrinks it, nerves widen and quicken it, drink adds a slow lazy wobble on top.
const TH={ph:0,last:0};
function driftAt(now,p){const dt=TH.last?Math.min(.1,(now-TH.last)/1000):0;TH.last=now;TH.ph+=dt*p.w;const th=TH.ph;
 let x=p.A*Math.sin(th),y=.55*p.A*Math.sin(2*th);if(p.dl){x+=p.dl*1.2*Math.sin(.37*th+1);y+=p.dl*.9*Math.sin(.29*th+2);}return {x,y};}
function driftBeat(){}
// ring radius (mm) for a release dt ms from the tightest moment (+ late)
function ringR(dt,tp){const Rmin=1.794*tp.s0;const e=Math.max(0,Math.abs(dt)-tp.P);const k=Math.pow(e/Math.max(80,tp.D-tp.P),.5);return Math.min(70,Rmin+Math.max(0,tp.R0-Rmin)*k*(dt>0?1.3:1)*(tp.kv||1));}
function landFrom(lock,tp,dt){const e=Math.sign(dt)*Math.min(200,Math.max(0,Math.abs(dt)-tp.P));const r=ringR(dt,tp);let sg=r/1.794;let lean=Math.sign(dt)*.35*(r-1.794*tp.s0);/* v0.32: a perfect release never throws a wild one: scatter capped at 1.4 sigma */const pf=Math.abs(dt)<=tp.P;const cap=pf?1.4:Infinity;
 /* CAR-RAMP (Hayden 19:42, Season 3 only: tp.ramp is set there): just outside the window a dart lands close to a perfect one, and the spread grows smoothly (smoothstep) to the 3.54 near-miss over tp.ramp ms; past that, unchanged. Never wider than the 3.54 near-miss at the same timing; the drawn ring is unchanged (players time off it). */if(!pf&&tp.ramp>0){const x=Math.min(1,(Math.abs(dt)-tp.P)/tp.ramp),w=x*x*(3-2*x),sp=tp.s0*.6;sg=sp+(sg-sp)*w;lean*=w;}
 const gs=()=>{const v=gauss();return Math.max(-cap,Math.min(cap,v));};return {x:lock.x+gs()*sg*.95,y:lock.y+lean+gs()*sg*.85,e};}
function PM(){return (S&&S.pullMs)||PULL_MS;}
// release error in ms at a pull fraction
function relErrMs(pull){return (pull-SWEET)*PM();}
function perfectWin(){if(!S||S.bull)return 0;if(!window.TH_LEGACY){return throwParams().P/1000;}if(isRun())return 0;if(S.mp)return mpPerfectWin();const nv=effNerves();let w=.008+.001*lvOf('cn');w*=1-.4*Math.min(1,nv/2);const vis=S.visit?S.visit.reduce((a,v)=>a+(v.bust?0:v.v),0):0;const me=S.p[S.cur];if(S.dart===3&&(vis>=120||me.score<=50))w*=.75;return w;}
function isPerfect(){if(!S||S.over)return false;const dt=Math.abs(S.pull-SWEET+((S.relAdd||0)-(S.markerShift||0))/PM())*PM()/1000;const w=perfectWin();return w>0&&dt<=w;}
function currentSigma(){if(S&&S.mp)return mpSigma();const b=S.barrel;const nv=spreadNerves();const sk=save.arm/10;const dt=Math.abs(S.pull-SWEET)*PULL_MS/1000;const win=.42*b.tol*tolMult()*(1+.008*lvOf('cn'))/(1+nv*.22);const core=Math.min(1,dt/win);const F=Math.min(.9,(.16+.1*(1-sk))*(1+(isRun()?SK().floor:0))+nv*.045);const Smax=24*Math.pow(b.base/5.6,.3)*setupBaseMult()*armMult()*targetMult()*(1+(S.myForm||0));let s=Smax*(F+(1-F)*Math.pow(core,.75))+nv*.22*(.1+core);if(S.over)s=60;{const pw=perfectWin();if(pw>0){const dtp=Math.abs(S.pull-SWEET)*PULL_MS/1000;if(dtp<=pw)s*=.35;else if(dtp<=pw*2)s*=.35+.65*(dtp-pw)/pw;}}return s;}

// ===== INPUT =====
function setAim(x,y){const d=Math.hypot(x,y);if(d>180){x*=180/d;y*=180/d;}S.aim={x,y};}
let dragging=false;const cvEl=$('scene');
cvEl.addEventListener('pointerdown',e=>{audioInit();if(!S||S.done||S.busy||S.p[S.cur].ai||S.view===1)return;
 const p=V.pointToBoardMM(e.clientX,e.clientY);const onBoard=p&&Math.hypot(p.x,p.y)<260&&(V.isSplit()||e.clientY<V.boardBottomY());
 /* FEEL: board drag only aims; board pane outside the board does nothing; desktop player pane still pulls */
 if(onBoard){cvEl.setPointerCapture(e.pointerId);dragging=true;setAim(p.x,p.y);return;}
 if(!p&&feelPaneHold(e)){cvEl.setPointerCapture(e.pointerId);startPull('pane',e);}});
cvEl.addEventListener('pointermove',e=>{if(dragging){const p=V.pointToBoardMM(e.clientX,e.clientY);if(p)setAim(p.x,p.y);}});
cvEl.addEventListener('pointerup',e=>{if(dragging){dragging=false;return;}release(e,'pane');});
cvEl.addEventListener('pointercancel',()=>{dragging=false;cancelPull();});
addEventListener('keydown',e=>{const _su=$('setup');if(e.code==='Space'&&!e.repeat&&(!_su||_su.hidden)&&$('result').hidden){e.preventDefault();startPull('key',e);}/* FEEL: #setup no longer exists; Space was dead */
 if(!S||S.busy||S.p[S.cur].ai)return;const k={ArrowUp:[0,-2],ArrowDown:[0,2],ArrowLeft:[-2,0],ArrowRight:[2,0]}[e.code];if(k){e.preventDefault();setAim(S.aim.x+k[0],S.aim.y+k[1]);}});
addEventListener('keyup',e=>{if(e.code==='Space'){e.preventDefault();release(e,'key');}});
/* #20 Task B (Overseer 20:30): the throw locks where the reticle was ON SCREEN when the player pressed, not where the game had already moved it.
   A frame drawn at rAF time t(i) reaches the screen at about the next rAF, t(i+1); so at a press between t(n) and t(n+1) the screen shows frame n-1.
   Applied only after a slow frame (ChatGPT 20:40): at a steady frame rate the lock is unchanged; when the phone stalls (330 ms frames seen in Hayden's 3.11 match 2) it is the
   difference between what he saw and where the dart went. Same rule for everyone; it only removes display lag from the throw. */
/* CAR-5c (Overseer 05:29): frame times for the per-dart release record: a 128-slot ring of frame timestamps (one store per frame) and the
   longest gap between frames inside a window, including the open gap from the last frame to the window's end (a stall still in progress) */
const FT=new Float64Array(128);let FTn=0;function ftPush(now){FT[FTn&127]=now;FTn++;}
function gapMax(t0,t1){/* a gap counts in full when it ends inside the window (a freeze that started just before still shows its real length; ChatGPT P1) */let m=0,prev=null;const n=Math.min(FTn,128);for(let i=FTn-n;i<FTn;i++){const t=FT[i&127];if(t>t1)break;if(prev!=null&&t>t0)m=Math.max(m,t-prev);prev=t;}if(prev!=null&&t1>prev)m=Math.max(m,t1-prev);return Math.round(m);}
function frameAge(t){const n=Math.min(FTn,128);for(let i=FTn-1;i>=FTn-n;i--){const f=FT[i&127];if(f<=t)return Math.round(t-f);}return null;}window.TOPS_FAGE=frameAge;/* ms since the last frame drawn before t */
window.TOPS_GAP=gapMax;
const SHOWN=[];function shownPush(now){if(!S||S.done||S.pulling||!S.sway)return;SHOWN.push({t:now,x:S.sway.x,y:S.sway.y});if(SHOWN.length>6)SHOWN.shift();}
function shownSway(){/* ChatGPT P1: only after a slow frame (>50 ms between the last two frames, or since the last one); at a steady frame rate the lock is exactly as before */const n=SHOWN.length;if(n>=2){const a=SHOWN[n-1],b=SHOWN[n-2];if(a.t-b.t>50||performance.now()-a.t>50)return b;}return S.sway;}
/* ENG-REL (fairness, Hayden approved 18:53): the pull START is the press event's own timeStamp, the same clock as the release
   (feelStamp). It used to be the time the press handler ran: when the page was late to handle the press (a long frame, a stall), the start
   was stamped late by that delay, the pull read short and the release scored early (Hayden's iPhone: 41-80 ms frame gaps at the press ->
   10.9 % perfect vs 22.5 % at <=40 ms, mean error -33 ms vs -7 ms). A stamp outside the last 3 s (old WebKit's epoch stamps, or a browser without one) falls
   back to now. hp / hd = how late the press / release handler ran (ms), logged per dart. */
function pressStamp(ev){const now=performance.now();const t=ev&&ev.isTrusted!==false&&typeof ev.timeStamp==='number'?ev.timeStamp:NaN;/* ChatGPT P2: a script-made event keeps handler time */return (t>0&&t<=now+1&&t>=now-3000)?t:now;}/* 3 s: a press that lands at the start of a 1.3 s stall (Hayden's iPhone) is still timed from the touch */
function startPull(src,ev){if(S&&S.noPullUntil&&performance.now()<S.noPullUntil)return;if(!S||S.busy||S.done||S.p[S.cur].ai||S.pulling||S.view===1||S.breathe||V.walking())return;S.pullSrc=src||'key';S.pulling=true;S.over=false;{const tn0=performance.now();S.pullStart=window.TH_PRESS_NOW?tn0:pressStamp(ev);S.pressLag=Math.round(tn0-S.pullStart);}S.pull=0;S.relAdd=(S.fx&&S.online&&S.fx.some(f=>f.tap))?70:0;S.pullMul=(S.fx&&S.online&&S.fx.some(f=>f.bar))?1/1.35:window.TH_LEGACY?Math.max(.75,Math.min(1.3,1+gauss()*jitter())):1;S.lastNerves=effNerves();S.pullMs=0;if(!window.TH_LEGACY){const tp=throwParams();S.lockTp=tp;S.pullMs=tp.D/SWEET;const sw=shownSway();try{const tn=performance.now();S.relInfo={tp:tn,gp:gapMax(tn-500,tn),sx:sw.x,sy:sw.y,gx:S.sway.x,gy:S.sway.y,lag:sw!==S.sway?1:0};}catch(e){S.relInfo=null;}/* CAR-5c: what the screen showed when he pressed */try{const L=window.TOPS_LOCKLAG;if(L){const d=Math.hypot(sw.x-S.sway.x,sw.y-S.sway.y);L.n++;L.sum+=d;if(d>5)L.o5++;if(d>L.max)L.max=d;}}catch(e){}S.lock={x:S.aim.x+sw.x+gauss()*tp.tr*.6,y:S.aim.y+sw.y+gauss()*tp.tr*.6,t:performance.now()};SHOWN.length=0;S.lockOn=scoreAt(S.lock.x,S.lock.y).label===scoreAt(S.aim.x,S.aim.y).label;try{sfxLock();}catch(e){}}noiseBurst({dur:.12,freq:600,q:.5,gain:.05});
 if(ui.mode==='career'&&!S.practice){const opp=S.p[1];const pc=opp.rival?.18:(ui.tier===0?.08:0);if(Math.random()<pc){setTimeout(()=>{if(S&&S.pulling){banter('*cough*',opp.name);S.adren+=.6*(1+SK().press);}},250);}}}
function release(ev,src){if(!S||!S.pulling)return;if(src&&src!=='auto'&&S.pullSrc&&S.pullSrc!==src)return;{const tn=performance.now(),te=ev&&typeof ev.timeStamp==='number'?ev.timeStamp:NaN;S.relLag=(te>0&&te<=tn+1)?Math.round(tn-te):null;}S.pull=pullAt(feelStamp(ev)-(save.inputOffsetMs!=null?save.inputOffsetMs:((window.matchMedia&&matchMedia('(pointer:coarse)').matches)?35:0)));S.over=S.pull>=1.0;S.relMs=relErrMs(S.pull)+(S.relAdd||0)-(S.markerShift||0);/* FEEL: timestamp-based, never frame-derived */S.pulling=false;const perf=isPerfect();S.perfect=perf;{const me=S.p[S.cur];me.throws=(me.throws||0)+1;if(perf){me.perfects=(me.perfects||0)+1;if(!S.practice&&ui.mode==='career'&&career())career().perfects=(career().perfects||0)+1;}}const sig=currentSigma();{const d=S.relMs/1000;S.lastTiming=S.over?'Held':perf?'Perfect':Math.abs(d)<(window.TH_LEGACY?.03:Math.max(.03,perfectWin()*2))?'Flush':d<0?(d<-.12?'Early':'A touch early'):(d>.12?'Late':'A touch late');S.lastArrow=window.TH_LEGACY||perf?'':(S.over||d>0?' ↓':' ↑')+' '+Math.round(Math.abs(d*1000))+'ms';if(S.drill)S.drill.timings.push(S.over?.5:d);{const me=S.p[S.cur];if(d<-.03)me.early=(me.early||0)+1;else if(d>.03||S.over)me.late=(me.late||0)+1;}}S.pull=0;S.over=false;S.throwsMade++;save.totThrows=(save.totThrows||0)+1;if(S.throwsMade>=4)$('hint').style.opacity=0;feelAfterRelease(perf);
 const ax=S.aim.x+S.sway.x,ay=S.aim.y+S.sway.y;let lx=ax+gauss()*sig*.86,ly=ay+gauss()*sig;
 if(!window.TH_LEGACY&&S.lock){const nan=S.fx&&S.online&&S.fx.find(f=>f.nan);if(nan){S.lock.x+=nan.nan.x;S.lock.y+=nan.nan.y;}try{if(!S.p[S.cur].ai&&!S.online||S.cur===0)V.showRelMark(S.lock.x,S.lock.y);}catch(e){}const r=landFrom(S.lock,S.lockTp||throwParams(),S.relMs);lx=r.x;ly=r.y;S.lastErr=r.e;S.lock=null;}S.slip=false;{const lu=pubLure(lx,ly);if(lu){lx=lu.x;ly=lu.y;S.slip=true;}}S.flyHit=flyCheck(lx,ly);S.boNext=!S.flyHit&&boDecide(lx,ly,S.dart);if(S.online)netSend('dart',{bo:S.boNext?1:0,x:+lx.toFixed(2),y:+ly.toFixed(2),dart:S.dart,leg:legsPlayed(),aim:scoreAt(S.aim.x,S.aim.y).label,slip:S.slip?1:0,fly:S.flyHit?1:0});
 // cinematic: third dart that completes a 180 / 170+ visit, or any match-winning / ton-plus checkout
 const me=S.p[S.cur];const h=scoreAt(lx,ly);const vis=S.visit.reduce((a,v)=>a+(v.bust?0:v.v),0);const need=Math.ceil(S.bestOf/2);const wins=applyDart(me.score,h).won;const big=(S.dart===3&&vis+h.v>=171)||(wins&&(S.visitStart>=100||me.legs+1>=need));S.cine=big;/* follow cam is back for 171+ visits and big / match-winning checkouts (after release only, never during the pull) */S.aimLabel=scoreAt(S.aim.x,S.aim.y).label;S.aimWasDbl=scoreAt(S.aim.x,S.aim.y).dbl;
 S.busy=true;S.anim={kind:'throw',t0:performance.now(),dur:220};noiseBurst({dur:.08,freq:900,q:.4,gain:.12});
 save.darts++;{const run=isRun();const rate=run?.005:.0025;const pm=S.online?0:S.practice?(run?0:(S.drill&&S.drill.noXP?0:.6)):1;save.arm=Math.min(10,save.arm+rate*pm*(gearCount('board')?1.6:1)*(1+SK().armGrow));}
 setTimeout(()=>{S.flyingOwn=true;const dur=S.cine?2400:380;if(S.cine){V.cinema(lx,ly,dur+1500);document.body.classList.add('lk-cine');clearTimeout(window.__cineT);window.__cineT=setTimeout(()=>document.body.classList.remove('lk-cine'),dur+1500);document.getElementById('vig').style.opacity=.5;if(AU.ctx)AU.crowdGain.gain.setTargetAtTime(0.02,AU.ctx.currentTime,.1);}V.fly(V.handWorld(),lx,ly,0,dur,S.cine?.035:.05,()=>{if(!S||S.done)return;S.flyingOwn=false;S.anim=null;if(S.cine){setTimeout(()=>{crowdSet(S.tier.crowd);},300);}land(lx,ly,false);});},150);}

// ===== FLOW =====
function startTurn(){try{if(S&&S.pub&&S.pub.cards)setTimeout(cardTray,50);}catch(e){}if(S.practice&&S.cur===1){S.cur=0;}if(S.online&&S.p[S.cur].left&&S.p.some(p=>!p.left&&p!==S.p[S.cur])){S.cur=(S.cur+1)%S.p.length;return startTurn();}const me=S.p[S.cur];S.dart=1;S.visit=[];S.visitStart=me.score;S.turnN=(S.turnN||0)+1;S.aiFlying=false;S.busy=false;S.adren*=.4*(1-Math.min(.6,isRun()?SK().decay:0));S.calm=0;S.plan=null;S.planPicked=false;S.legFirstVisit=me.legDarts===0;V.clearDarts();
 S.mateTurn=false;if(S.pairs&&S.cur===0){S.sideVisit=(S.sideVisit||0)+1;if(S.sideVisit%2===0){S.mateTurn=true;}}
 if(S.pairs&&S.cur===1){S.oppVisit=(S.oppVisit||0)+1;}
 updateUI();
 if(S.mateTurn){S.busy=true;S.view=1;S.oppArm={pull:0,phase:'idle'};V.setOpponentLook(me.mate.look,me.mate.name,ui.tier);$('hint').style.opacity=0;aiQ(LOOK.pause('aiFirst'));return;}
 if(S.pairs&&S.cur===1){V.setOpponentLook(S.p[1].look,S.p[1].name,ui.tier);}
 if(S.online&&S.p.length>2&&S.cur!==0){V.setOpponentLook(S.p[S.cur].look||lookFor(S.p[S.cur].name),S.p[S.cur].name,ui.tier);}
 if(me.ai){S.busy=true;S.view=1;S.oppArm={pull:0,phase:'idle'};$('hint').style.opacity=0;if(S.online){S.netAnim=false;mt(netPump,900);}else aiQ(LOOK.pause('aiFirst'));}
 else{S.view=0;autoAim();maybeSledge();}}
function prefDbl(){return save.prefDbl||16;}
function myRoute(s,d){return withPref(prefDbl(),()=>route(s,d));}
function myAim(s,d){if(S&&S.plan&&S.plan.length)return S.plan[0];return withPref(prefDbl(),()=>aimFor(s,d));}
function autoAim(){if(S.bull){setAim(0,0);return;}drillBar();if(S.drill){const t=targetPoint(drillTarget());setAim(t.x,t.y);return;}const me=S.p[S.cur];if(S.din&&!me.opened){const t=targetPoint('D20');setAim(t.x,t.y);return;}const t=targetPoint(myAim(me.score,4-S.dart));setAim(t.x,t.y);renderRoutes();}
function renderRoutes(){const host=$('routes');if(!host)return;const me=S&&S.p[S.cur];const show=S&&!S.done&&!S.bull&&!S.busy&&me&&!me.ai&&!S.mateTurn&&!(S.din&&!me.opened)&&me.score<=170&&me.score>=2&&!$('intro').classList.contains('show');if(!show){host.hidden=true;return;}const d=4-S.dart;const rs=routesFor(me.score,d,prefDbl());if(!rs.length){host.hidden=true;return;}host.hidden=false;const cur=S.plan?S.plan.join(' '):null;host.classList.toggle('collapsed',!!renderRoutes.collapsed&&innerWidth<=700);host.innerHTML=`<button type="button" class="rt-h">${me.score} · ${d} dart${d>1?'s':''} · routes ${renderRoutes.collapsed?'▸':'▾'}</button>`+rs.map((x,i)=>`<button type="button" class="rt ${(cur?cur===x.r.join(' '):i===0)?'on':''} ${x.style>=3?'sty':''}" data-i="${i}">${x.r.map(l=>`<span class="rc ${l[0]==='D'||l==='BULL'?'d':''}">${l}</span>`).join('')}${x.style>=3?'<em>respect</em>':''}</button>`).join('');host.querySelector('.rt-h').onclick=()=>{renderRoutes.collapsed=!renderRoutes.collapsed;renderRoutes();};[...host.querySelectorAll('.rt')].forEach(bt=>bt.onclick=()=>{const x=rs[+bt.dataset.i];S.plan=x.r.slice();S.planPicked=true;const t=targetPoint(S.plan[0]);setAim(t.x,t.y);renderRoutes();updateUI();});}
function chipify(t){if(!t)return '';const m=t.match(/^(Out|Set up):\s*(.*)$/);if(!m)return t.replace(/</g,'&lt;');const parts=m[2].split(/\s·\s|\s(?=\()/);let out=`<b>${m[1]}</b>`;parts.forEach(p=>{const pp=p.trim();if(!pp)return;if(/^(T|D)?\d+$|^BULL$|^25$/.test(pp))out+=`<span class="rc ${pp[0]==='D'||pp==='BULL'?'d':''}">${pp}</span>`;else out+=`<span>${pp.replace(/</g,'&lt;')}</span>`;});return out;}
function planText(){const me=S.p[S.cur];if(S.bull)return 'Bull up: closest starts';if(S.din&&!me.opened)return 'Double in: hit a double to start scoring';if(me.score<2)return '';const d=4-S.dart;const rt=(S.plan&&S.plan.length)?S.plan:(me.score<=170?myRoute(me.score,d):null);if(rt)return 'Out: '+rt.join(' · ');if(me.score>230)return '';const a=myAim(me.score,d);const left=me.score-valOf(a);const nxt=left>=2&&left<=170?myRoute(left,3):null;return `Set up: ${a} leaves ${left}${nxt?' ('+nxt.join(' ')+')':''}`;}
function aiQ(ms){if(!S)return;clearTimeout(S.aiT);S.aiT=mt(aiDart,ms);}
function aiDart(preset){if(!S||S.done)return;if(!preset&&S.visit&&S.visit.length>=3)return;if(!preset&&S.aiFlying)return;if(!preset)S.aiFlying=true;const me=S.p[S.cur];const thrower=S.mateTurn?me.mate:me;const d=4-S.dart;const lbl=(S.din&&!me.opened)?'D20':withPref(oppPref(thrower),()=>aimFor(me.score,d));const t=targetPoint(lbl);S.aiAim=preset?{x:preset.x,y:preset.y}:{x:t.x,y:t.y};const sig=thrower.sigma*aiSigMult(thrower);const lx=preset?preset.x:t.x+gauss()*sig,ly=preset?preset.y:t.y+gauss()*sig;S.aiBo=preset?!!(S.remoteDart&&S.remoteDart.bo):boDecide(lx,ly,S.dart);
 const seq=[['pull',480],['throw',130],['follow',320],['reset',220]];let si=0,t0=performance.now();S.oppArm={phase:'pull',pull:0,k:0};
 const step=()=>{if(!S||S.done)return;const [ph,dur]=seq[si];const k=Math.min(1,(performance.now()-t0)/dur);
  if(ph==='pull')S.oppArm={phase:'pull',pull:k,k};else S.oppArm={phase:ph,pull:1,k};
  if(k<1){requestAnimationFrame(step);return;}
  if(ph==='throw'){const from=V.oppHandWorld();noiseBurst({dur:.06,freq:900,q:.4,gain:.06});
   // v0.94: follow cam for the opponent's big moments in online matches too
   let big=false;try{if(S.online||S.mp){const op=S.p[S.cur];const h=scoreAt(lx,ly);const vis=S.visit.reduce((a,v)=>a+(v.bust?0:v.v),0);const need=Math.ceil(S.bestOf/2);const wins=applyDart(op.score,h).won;big=(S.dart===3&&vis+h.v>=171)||(wins&&(S.visitStart>=100||op.legs+1>=need));}}catch(e){}
   const fd=big?2400:340;if(big){V.cinema(lx,ly,fd+1500);document.body.classList.add('lk-cine');clearTimeout(window.__cineT);window.__cineT=setTimeout(()=>document.body.classList.remove('lk-cine'),fd+1500);}
   V.fly(from,lx,ly,1,fd,big?.035:.05,()=>{if(!S||S.done)return;land(lx,ly,true);});}
  si++;t0=performance.now();if(si<seq.length){S.oppArm={phase:seq[si][0],pull:1,k:0};requestAnimationFrame(step);}else S.oppArm={phase:'idle',pull:0,k:0};};
 requestAnimationFrame(step);}
function land(x,y,far){if(S.bull){return bullLand(x,y,far);}const tc=S.cur,d0=S.dart,aim=S.pub?(S.p[tc].ai?(S.remoteDart&&S.remoteDart.aim):S.aimLabel):null;const vs0=S.visitStart;{const meB=S.p[tc];S.boNow=meB&&meB.ai?!!S.aiBo:!!S.boNext;S.aiBo=false;S.boNext=false;}try{const meT=S.p[tc];if(meT){if(meT.ai){if(S.remoteDart&&S.remoteDart.fly&&FLY.on){S.remoteDart.fly=0;flySwat(meT.name,false);}}else if(S.flyHit&&FLY.on){S.flyHit=false;flySwat(meT.name,true);}}}catch(e){}try{if(S.teams){try{return landCore(x,y,far);}finally{mpMirror(tc);}}return landCore(x,y,far);}finally{try{visitReceipt(tc,d0,vs0);}catch(e){}if(S&&S.pub)try{pubAfterDart(tc,d0,aim);}catch(e){console.warn('pub',e);}}}
function landCore(x,y,far){const me=S.p[S.cur];let h=scoreAt(x,y);if(S.boNow){S.boNow=false;h={v:0,m:0,n:0,label:'BOUNCE',dbl:false};try{if(!me.ai&&S.cur===0&&!S.practice){S.ach=S.ach||{b26:0,bounces:0};S.ach.bounces=(S.ach.bounces||0)+1;if(S.aimWasDbl&&me.score<=170)achUnlock('bouncefin');}}catch(e){}setTimeout(()=>{try{const st=V.stuck;const d=st&&st[st.length-1];if(d){d.position.z+=.03;d.rotation.x+=1.2;setTimeout(()=>{d.visible=false;},260);}}catch(e){}flash('Bounce out','red','no score');try{window.TOPS_bounceStamp&&TOPS_bounceStamp(me.name,S.cur===0);}catch(e){}try{noiseBurst({dur:.07,freq:2400,q:5,gain:.1});}catch(e){}},60);try{trackEv('bounce_out',null);}catch(e){}}const asAI=me.ai||S.mateTurn;
 sfxDartHit(h.v===0?'miss':(Math.random()<.06?'wire':'hit'),far);if(!far){V.shake();V.punchIn(x,y,S.cine?1900:(S.dart===3?1100:520));if(S.cine){document.getElementById('vig').style.opacity=0;}}else V.punchIn(x,y,S.dart===3?900:600);
 S.log.push({t:Date.now(),player:me.name,leg:legsPlayed()+1,dart:S.dart,x:+x.toFixed(1),y:+y.toFixed(1),hit:h.label,score:h.v,scoreBefore:me.score,nerves:+effNerves().toFixed(2)});
 if(S.drill&&!asAI)drillDart(h,x,y);
 if(me.score<=50&&oneDart(me.score))me.coAtt+=1;
 let r;if(S.din&&!me.opened){if(h.dbl){me.opened=true;r=applyDart(me.score,h);}else{r={score:me.score,bust:false,won:false};h={...h,v:0,label:h.label+'·',m:h.m,dbl:false,n:h.n};}}else r=applyDart(me.score,h);me.darts++;me.legDarts++;if(me.legDarts<=9)me.f9darts++;
 S.visit.push({label:h.label,v:h.v,bust:r.bust});
 if(!asAI){feelGhostAdd(x,y);if(S.lastTiming&&!S.bull&&!feelPhone())xpPop(feelVerdictText(),S.lastTiming==='Perfect'?'tm perf':'tm');if(S.perfect&&!S.bull){S.perfect=false;noiseBurst({dur:.06,freq:3200,q:6,gain:.12});gainXP('cn',3,S.practice?.5:1);}const pm=S.practice?.5:1;if(!S.practice&&ui.mode==='career'){const nv=S.lastNerves||0;if(nv>2.5)gainXP('co',2);else if(nv>1.2)gainXP('co',1);}if(ui.mode==='career'){if(h.m===3)gainXP('sc',h.n>=19?3:2,pm);if(S.aimWasDbl)gainXP('fi',h.dbl?3:1,pm);}setTimeout(()=>{if(!S)return;if(h.m===3||h.label==='BULL')sledgeOnHit();else sledgeOnMiss(h);},450);addAdrenaline(h,S.dart);const after=me.score-(r.bust?0:h.v);const ld=me.legDarts+1;if(!r.bust&&((ld===6&&after<=170&&route(after,3))||(ld===7&&after<=110&&route(after,2))||(ld===8&&after<=50&&oneDart(after)))){S.adren+=[2.2,1.6,1.2,.9,.7,.5,.4][ui.tier]*(ld-5);S.nineOn=true;if(ld===6)setTimeout(()=>banter(S.tier.caller==='pro'?'Nine-darter on.':'Oi. He\u2019s on a nine.',S.tier.caller==='pro'?'Crowd':'Bar'),600);}S.lastAim=S.aimLabel;S.lastMissDbl=!!(S.aimWasDbl&&!h.dbl);if(S.plan&&S.plan.length){if(h.label===S.plan[0]||valOf(h.label)===valOf(S.plan[0]))S.plan.shift();else S.plan=null;}if(S.aimLabel&&S.aimLabel[0]==='T'&&h.m===1&&h.n!==+S.aimLabel.slice(1)&&S.tier.crowd>.3&&!LOOK.on)sfxSwell(S.tier.crowd*.25,.7,380,1.3,.4);}
 if(!asAI&&window.TOPS_formDart)TOPS_formDart(me,h,x,y);
 if(r.bust){const rem=3-S.dart;me.darts+=rem;me.legDarts+=rem;me.f9darts+=Math.max(0,Math.min(rem,9-(me.legDarts-rem)));me.score=S.visitStart;
  me.busts++;flash('Bust','red',null);callVisit(0,'bust');if(!me.ai)sfxGroan();updateUI();mt(nextTurn,LOOK.pause('bust'));return;}
 me.score=r.score;const gained=S.visitStart-me.score;if(!asAI&&window.TOPS_formAfter)TOPS_formAfter(me,r,gained,h);
 if(r.won){(me.olog=me.olog||[]).push([S.visitStart,me.legDarts]);me.pts+=gained;me.f9pts+=f9credit(me,gained);me.coHit++;me.hf=Math.max(me.hf,S.visitStart);me.legs++;me.bestLeg=Math.min(me.bestLeg,me.legDarts);S.lastLegWinner={name:me.disp||me.name,out:S.visitStart,darts:me.legDarts};{const labels=S.visit.filter(v=>!v.bust).map(v=>v.label);if(labels[labels.length-1]!==h.label)labels.push(h.label);const sty=routeStyle(labels);me.lastOut=labels;if(!asAI&&sty>=3){me.respect=(me.respect||0)+1;const c=career();if(c&&!S.practice&&ui.mode==='career'){c.respect=(c.respect||0)+1;if(labels[labels.length-1]==='BULL')c.bullOuts=(c.bullOuts||0)+1;if(labels.filter(l=>l==='BULL').length>=2)c.dblBull=(c.dblBull||0)+1;}setTimeout(()=>{flash('RESPECT','gold',labels.join(' · '));V.cheer(Math.min(1,.5+sty*.1));sfxCheer(sty>=5);},700);if(ui.mode==='career'&&!S.practice)gainXP('co',4+sty);}}if(!asAI&&ui.mode==='career'){const pm=S.practice?.5:1;const hf=S.visitStart;gainXP('fi',hf>=170?25:hf>=100?10:hf>=60?4:2,pm);if(gained>=100)gainXP('sc',gained>=140?6:4,pm);if(!S.practice){gainXP('cn',2);const need=Math.ceil(S.bestOf/2);const op=S.p[1];if(me.legs>=need||op.legs===need-1)gainXP('co',6);}}if(me.legDarts===9){setTimeout(()=>{flash('NINE DARTER','gold','perfect leg');confetti(1);confetti(1);V.cheer(1);sfxCheer(true);setTimeout(()=>sfxCheer(true),900);say(S.tier.caller==='pro'?'A NINE DART FINISH!':'NINE DARTER! GET IN!',S.tier.caller);if(!asAI&&ui.mode==='career'){gainXP('sc',40);gainXP('co',20);}},700);}me.bestVisit=Math.max(me.bestVisit,gained);if(gained>=100)me.tons++;
  {const need=Math.ceil(S.bestOf/2);flash('Game shot','gold',me.legs>=need?'and the match · '+S.visitStart+' out':S.visitStart+' checkout');}callVisit(0,'gameshot');V.cheer(me.ai?.4:1);if(!me.ai){confetti(S.tier.crowd);myCelebrate();}else oppCelebrate(true);if(!me.ai){sfxCheer(true);persist();}else sfxClap();
  updateUI();mt(endLeg,LOOK.pause('checkout'));return;}
 if(S.dart===3){(me.vlog=me.vlog||[]).push(gained);me.pts+=gained;me.lastVisit=gained;me.f9pts+=f9credit(me,gained);me.bestVisit=Math.max(me.bestVisit,gained);if(gained>=100)me.tons++;if(!asAI&&ui.mode==='career'&&gained>=100)gainXP('sc',gained===180?12:gained>=140?6:4,S.practice?.5:1);if(!asAI){if(gained===180){me.t180++;if(ui.mode==='career'&&career()&&!S.practice){career().t180=(career().t180||0)+1;}}const snap={gained,h,who:S.cur,S};setTimeout(()=>{if(S===snap.S)visitCall(snap.gained,snap.h,snap.who);},LOOK.on?0:500);updateUI();mt(nextTurn,LOOK.pause('visit',gained));return;}
  if(gained===180){me.t180++;flash('180','gold',null);callVisit(180);V.cheer(1);confetti(S.tier.crowd);if(me.ai)oppCelebrate(true);else myCelebrate();if(!me.ai){sfxCheer(true);persist();}else sfxCheer(false);}
  else{flash(gained,gained>=100?'gold':'',null);callVisit(gained);if(!LOOK.on&&me.score<=170&&route(me.score,3)){const st=S.tier.caller;mt(()=>say(st==='pro'?`You require ${words(me.score)}.`:(st==='club'?`${words(me.score)} required`:`${words(me.score)} you want`),st),1400);}if(gained>=100){sfxClap();V.cheer(.35);}else if(gained<30&&!me.ai)sfxGroan();}
  updateUI();mt(nextTurn,LOOK.pause('visit',gained));return;}
 if(h.m===3||h.label==='BULL')setTimeout(()=>flash(h.label,'',null),asAI?0:250);
 S.dart++;updateUI();
 if(asAI){S.aiFlying=false;if(S.online){S.netAnim=false;mt(netPump,560);}else aiQ(LOOK.pause('ai'));}else{S.busy=false;autoAim();}}
function visitReceipt(tc,d0,vs0){if(!S||S.bull)return;const ended=S.done||S.dart===d0||S.cur!==tc;if(!ended||!S.visit.length)return;const me=S.p[tc];const bust=S.visit.some(v=>v.bust);
 let cause='';if(bust){const pre=vs0-S.visit.filter(v=>!v.bust).reduce((a,v)=>a+v.v,0);const bv=S.visit.find(v=>v.bust);const ns=pre-(bv?bv.v:0);cause=ns<0?`${bv.label} took you below zero from ${pre}`:ns===1?`${bv.label} left 1 from ${pre}`:`${pre} needs a double to finish`;}
 const tot=bust?0:S.visit.reduce((a,v)=>a+v.v,0);S.lastRec={who:me.disp||me.name,labels:S.visit.map(v=>v.label),bust,cause,tot,rem:bust?vs0:me.score,won:!bust&&me.score===0};if(S.lastRec.won){S.legSeq=S.legSeq||[];S.legSeq.push(tc);}try{achVisit(tc,S.lastRec,vs0);}catch(e){console.warn('ach',e);}}
function visitCall(gained,h,who){if(!S)return;const me=S.p[who==null?S.cur:who];if(gained===180){flash('180','gold',null);callVisit(180);V.cheer(1);confetti(S.tier.crowd);myCelebrate();}else{flash(gained,gained>=100?'gold':'',null);callVisit(gained);if(!LOOK.on&&me.score<=170&&route(me.score,3)){const st=S.tier.caller;mt(()=>say(st==='pro'?`You require ${words(me.score)}.`:(st==='club'?`${words(me.score)} required`:`${words(me.score)} you want`),st),1400);}if(gained>=100){sfxClap();V.cheer(.35);if(window.TOPS_PUMP===true&&me.ai&&!S.online&&gained>=120&&me.score>0){S.oppArm={phase:'celebrate',pull:0,k:0,t0:performance.now(),big:false};S.celebrateUntil=performance.now()+1100;}}else if(gained<30)sfxGroan();}}
function f9credit(me,gained){return (me.legDarts-3)<9?gained:0;}
function celebrating(){return S&&S.celebrateUntil&&performance.now()<S.celebrateUntil;}
function mt(fn,ms){const snap=S;return setTimeout(()=>{if(S&&S===snap&&!S.done)fn();},ms);}
function nextTurn(){if(!S||S.done)return;if(celebrating()){mt(nextTurn,300);return;}S.cur=(S.cur+1)%S.p.length;startTurn();}
function endLeg(){S.netAnim=false;S.lastRec=null;const need=Math.ceil(S.bestOf/2);if(S.p.some(p=>p.legs>=need))return endMatch();S.settled=false;feelGhostsClear();S.p.forEach(p=>{p.score=S.start||501;p.legDarts=0;p.opened=false;});S.legStarter=(S.legStarter+1)%S.p.length;S.cur=S.legStarter;
 const legNo=legsPlayed()+1;const el=$('intro');el.classList.add('leg');const needL=Math.ceil(S.bestOf/2);const w=S.lastLegWinner;$('introTier').textContent=`Leg ${legNo} of up to ${S.bestOf}${S.p[0].legs===needL-1&&S.p[1].legs===needL-1?' · decider':''}`;$('introVenue').textContent=(S.p.length>2&&!S.teams)?S.p.map(p=>`${(p.disp||p.name).split(' ')[0]} ${p.legs}`).join(' · '):`${S.p[0].legs}–${S.p[1].legs}`;$('introStakes').textContent=w?`${w.name} took it · ${w.out} out in ${w.darts} darts`:'';if(S.p.length>2&&!S.teams){const lead=S.p.slice().sort((a,b)=>b.legs-a.legs||avg(b)-avg(a));$('introP0').textContent=lead[0].disp||lead[0].name;$('introP0s').textContent=`Leading · ${lead[0].legs} leg${lead[0].legs===1?'':'s'} · avg ${avg(lead[0]).toFixed(1)}`;$('introP1').textContent=S.p[0].disp||S.p[0].name;$('introP1s').textContent=`You · ${S.p[0].legs} leg${S.p[0].legs===1?'':'s'} · avg ${avg(S.p[0]).toFixed(1)}`;}else{$('introP0').textContent=S.p[0].disp;$('introP1').textContent=S.p[1].disp;$('introP0s').textContent='Avg '+avg(S.p[0]).toFixed(1);$('introP1s').textContent='Avg '+avg(S.p[1]).toFixed(1);}$('introFmt').textContent=`${S.p[S.cur].name} to throw first · tap to continue`;el.classList.add('show');S.busy=true;{const snap=S;let gone=false;const go=(ev)=>{if(gone)return;if(ev&&ev.type==='keydown'&&!['Space','Enter','Escape'].includes(ev.code))return;gone=true;if(ev){try{ev.stopPropagation();ev.preventDefault();}catch(x){}}if(S)S.noPullUntil=performance.now()+450;document.removeEventListener('pointerdown',go,true);document.removeEventListener('keydown',go,true);el.classList.remove('show');if(S===snap&&!S.done)startTurn();};setTimeout(()=>{document.addEventListener('pointerdown',go,true);document.addEventListener('keydown',go,true);},700);setTimeout(go,S.online?2500:6000);}}
function endMatch(){S.done=true;S.view=0;save.matches++;if(S.online){NET.ready=false;setTimeout(mpTrack,300);if(NET.seat===0&&S.mp){const w=S.p.reduce((bi,p,i)=>p.legs>S.p[bi].legs?i:bi,0);const pl=S.p.map((p,i)=>({pid:p.pid||(i===0?S.mp.mePid:S.mp.opPid),name:p.gname||p.name,pro:(S.mp.pros&&S.mp.pros[i]?S.mp.pros[i].id:''),legs:p.legs,avg:+avg(p).toFixed(1),team:S.teams?(i%2):undefined}));mpSaveResult(pl,pl[w].pid);}}const w=S.p.reduce((bi,p,i)=>p.legs>S.p[bi].legs?i:bi,0);const win=S.p[w],lose=w===0?S.p.slice(1).reduce((a,p)=>p.legs>a.legs?p:a,S.p[1]):S.p[0];S.won=w===0;S.earned=0;
 const objBefore=career()&&career().obj?Object.keys(career().obj).length:0;
 const posBefore=(career()&&career().season&&!career().season.ko&&!career().run)?youPos(career().season):0;const wasMoney=S_money;
 if(ui.mode==='career')careerAfterMatch();persist();
 const c=career();const p0=S.p[0],p1=S.p[1];
 $('resKicker').textContent=ui.mode==='career'?`${S.tier.n} · ${S.tier.venue}${S.rival?' · Rival':''}`:'Friendly';
 $('resTitle').textContent=S.practice?'Practice done':(w===0?(S.rival?'You beat Deano':'You win'):(S.rival?'Deano wins':win.name+' wins'));
 let sub='';if(ui.mode==='career'&&c&&c.run){sub=S.practice?'':(S.won?(S.after==='runpromo'?'Tier cleared.':S.after==='runwin'?'Run complete.':''):(S.after==='runover'?'Last life gone.':'A life gone.'));}else if(ui.mode==='career'){sub=S.won?(S.intro?'No money for a fill-in, but Jonno got the beers.':(S.after==='promo'?'That’s the promotion.':'')):(S.intro?'Unlucky. Mal’s been on that board 20 years.':'No prize money this time.');}
 $('resSub').textContent=sub;renderKeys(p0,c);
 $('rsN0').textContent=p0.disp||p0.name;$('rsN1').textContent=p1.disp||p1.name;$('rsPt0').innerHTML=portraitImg(save.look,save.name,ui.tier);$('rsPt1').innerHTML=S.practice?'':portraitImg(p1.look,p1.name,ui.tier);$('rsA0').textContent='Avg '+avg(p0).toFixed(1);$('rsA1').textContent='Avg '+avg(p1).toFixed(1);$('rsL0').textContent=p0.legs;$('rsL1').textContent=p1.legs;
 if(ui.mode==='career'&&c){$('resEarn').hidden=false;$('resEarn').classList.toggle('run',!!c.run);{const tr=(c&&!S.practice&&!S.local&&!S_money&&c._lastTravel)||0;$('reCash').textContent=money(S.earned||0);$('reNet').textContent=tr?`${money(S.earned||0)} earned − ${money(tr)} travel = ${money((S.earned||0)-tr)}`:'';$('reNet').hidden=!tr;}const g=S.gains||{};const tot=Object.values(g).reduce((a,b)=>a+b,0);$('reSp').textContent='+'+tot;$('reBank').textContent=money(c.bank);renderGains();}else{$('resEarn').hidden=true;$('resProg').hidden=true;}
 const rows=[['3-dart avg',avg(p0),avg(p1),v=>v.toFixed(1),120],['First 9',f9(p0),f9(p1),v=>v.toFixed(1),120],['180s',p0.t180,p1.t180,v=>v,Math.max(1,p0.t180,p1.t180)],['Tons',p0.tons,p1.tons,v=>v,Math.max(1,p0.tons,p1.tons)],['Checkout %',p0.coAtt?p0.coHit/p0.coAtt*100:0,p1.coAtt?p1.coHit/p1.coAtt*100:0,v=>Math.round(v)+'%',100],['High finish',p0.hf,p1.hf,v=>v||'–',170],['Best leg',p0.bestLeg<99?p0.bestLeg:0,p1.bestLeg<99?p1.bestLeg:0,v=>v||'–',0]];
 $('resStats').innerHTML=rows.map(([n,a,b,f,mx])=>{const lo=n==='Best leg';const aw=lo?(a&&(!b||a<=b)):a>=b&&a>0,bw=lo?(b&&(!a||b<=a)):b>=a&&b>0;const pa=mx?Math.min(100,a/mx*100):(a?100:0),pb=mx?Math.min(100,b/mx*100):(b?100:0);return `<div class="st"><span class="v ${aw?'win':''}">${f(a)}</span><div class="bar l"><i class="${aw?'win':''}" style="width:${pa}%"></i></div><span class="n">${n}</span><div class="bar r"><i class="${bw?'win':''}" style="width:${pb}%"></i></div><span class="v r ${bw?'win':''}">${f(b)}</span></div>`;}).join('');
 renderReceipt(c,posBefore,wasMoney);
 const done=(S.objMsg&&S.objMsg.lines)||[];if(done.length){$('resObj').hidden=false;$('resObjChips').innerHTML=done.map(l=>`<span class="chip">${l.replace('Objective done: ','').replace(/\.\s*\+.*$/,'')}</span>`).join('');}else $('resObj').hidden=true;
 setTimeout(()=>{$('result').hidden=false;$('hud').hidden=true;sceneBg('result');},800);}
function attrRow(a,gain){const at=attr(a.id);const need=xpNeed(at.lv);const pct=at.lv>=ATTR_MAX?100:at.xp/need*100;return `<div class="ar ${a.id}"><div class="ar-h"><b>${a.n}</b><span class="lv">${at.lv}</span>${gain?`<em>+${gain}</em>`:''}</div><div class="ar-bar"><i style="width:${pct.toFixed(1)}%"></i></div><small>${at.lv>=ATTR_MAX?'Maxed':(at.lv>=attrCap()?`Capped at ${attrCap()} for this chapter · ${at.xp} XP banked`:`${at.xp} / ${need} to level ${at.lv+1}`)}</small></div>`;}
function renderKeys(p0,c){const host=$('resKeys'),coach=$('resCoach');if(!host)return;if(ui.mode!=='career'||!c){host.hidden=true;coach.hidden=true;return;}host.hidden=false;coach.hidden=false;const par=S.tier.avg;const a=avg(p0);const d=a-par;const co=p0.coAtt?Math.round(p0.coHit/p0.coAtt*100):null;const pf=p0.throws?Math.round((p0.perfects||0)/p0.throws*100):null;const f=f9(p0);
 host.innerHTML=`<div><small>Average</small><b>${a.toFixed(1)}</b><span class="${d>=0?'up':'dn'}">${d>=0?'+':''}${d.toFixed(1)} vs ${par} par</span></div><div><small>Checkouts</small><b>${co==null?'–':co+'%'}</b><span>${p0.coHit||0} of ${p0.coAtt||0} darts at a double</span></div><div><small>Perfect releases</small><b>${pf==null?'–':pf+'%'}</b><span>${p0.perfects||0} of ${p0.throws||0} darts</span></div>`;
 let line='';if(S.practice)line='Practice. Nothing recorded except what your arm learned.';else if(d<-8)line=`Scoring is the gap: ${a.toFixed(0)} against a ${par} room. Twenties, every visit, until it is boring.`;else if(co!=null&&p0.coAtt>=3&&co<25)line=`${p0.coAtt} darts at doubles, ${p0.coHit} in. Finishing cost you more than scoring did.`;else if(f&&f<a-10)line=`First nine averaged ${f.toFixed(0)}. You start slow and chase. Open harder.`;else if(pf!=null&&p0.throws>=15&&!(p0.perfects||0))line=(p0.early||0)>(p0.late||0)*1.5?'No perfect releases and most were early. Hold a fraction longer.':(p0.late||0)>(p0.early||0)*1.5?'No perfect releases and most were late. Let go on the stop, not after it.':'No perfect releases. Watch the ring, release as it stops shrinking.';else if(d>=5&&S.won)line=`Above par and you closed it. That is a ${TIERS[Math.min(6,S.tier===TIERS[c.tier]?c.tier+1:c.tier)].n} average.`;else if(S.won)line='Won it without your best. The good ones do that.';else if(d>=0)line='Average was there. The finishing was not. Nothing to fix, just reps.';else line='Off the pace tonight. Short memory.';coach.textContent=line;}
function renderGains(){const g=S.gains||{};const ups=S.lvUps||[];const feats=S.featsNew||[];const any=Object.keys(g).length||feats.length;$('resProg').hidden=!any;if(!any)return;
 $('resAttrs').innerHTML=ATTRS.map(a=>attrRow(a,g[a.id])).join('');
 const chips=[];ups.forEach(u=>chips.push(`<span class="chip up">${ATTRS.find(a=>a.id===u.id).n} ${u.lv}</span>`));const fl=feats.filter(f=>f&&f.n);fl.slice(0,3).forEach(f=>chips.push(`<span class="chip feat"><i>Feat</i>${f.n}</span>`));if(fl.length>3)chips.push(`<details class="chip-more"><summary>All feats (${fl.length})</summary>${fl.slice(3).map(f=>`<span class="chip feat"><i>Feat</i>${f.n}</span>`).join('')}</details>`);$('resUps').innerHTML=chips.join('');$('resUps').hidden=!chips.length;}
// ===== OBJECTIVES =====
const OBJ=[
 [{id:'p_rival',t:'Beat Deano Marsh',c:(m,w,s)=>w&&s.rival,sp:1,cash:0},{id:'p_ton',t:'Hit a 100+ visit',c:m=>m.bestVisit>=100,sp:0,cash:20},{id:'p_co40',t:'Check out on 40 or more',c:m=>m.hf>=40,sp:0,cash:20},{id:'p_clean',t:'Win a match without a bust',c:(m,w)=>w&&m.busts===0,sp:0,cash:20},{id:'p_140',t:'Hit a 140',c:m=>m.bestVisit>=140,sp:0,cash:20}],
 [{id:'c_rival',t:'Beat Deano in the final',c:(m,w,s)=>w&&s.rival,sp:1,cash:100},{id:'c_avg55',t:'Average 55+ in a match',c:m=>avg(m)>=55,sp:0,cash:50},{id:'c_co60',t:'Check out 60 or more',c:m=>m.hf>=60,sp:0,cash:50},{id:'c_tons3',t:'Three tons in one match',c:m=>m.tons>=3,sp:0,cash:40},{id:'c_180',t:'Hit a 180',c:m=>m.t180>=1,sp:0,cash:100}],
 [{id:'r_rival',t:'Beat Deano',c:(m,w,s)=>w&&s.rival,sp:1,cash:200},{id:'r_avg65',t:'Average 65+ in a match',c:m=>avg(m)>=65,sp:0,cash:150},{id:'r_co80',t:'Check out 80 or more',c:m=>m.hf>=80,sp:0,cash:150},{id:'r_leg18',t:'Win a leg in 18 darts or fewer',c:m=>m.bestLeg<=18,sp:0,cash:100},{id:'r_dec',t:'Win a decider',c:(m,w,s)=>w&&s.decider,sp:0,cash:200}],
 [{id:'n_rival',t:'Beat Deano',c:(m,w,s)=>w&&s.rival,sp:1,cash:500},{id:'n_avg78',t:'Average 78+ in a match',c:m=>avg(m)>=78,sp:0,cash:400},{id:'n_2x180',t:'Two 180s in one match',c:m=>m.t180>=2,sp:0,cash:300},{id:'n_co100',t:'A ton-plus checkout',c:m=>m.hf>=100,sp:0,cash:500},{id:'n_leg15',t:'A 15-dart leg or better',c:m=>m.bestLeg<=15,sp:0,cash:250}],
 [{id:'t_rival',t:'Beat Deano',c:(m,w,s)=>w&&s.rival,sp:1,cash:1000},{id:'t_avg85',t:'Average 85+ in a match',c:m=>avg(m)>=85,sp:0,cash:1000},{id:'t_co120',t:'Check out 120 or more',c:m=>m.hf>=120,sp:0,cash:1000},{id:'t_3x180',t:'Three 180s in one match',c:m=>m.t180>=3,sp:0,cash:500},{id:'t_whitewash',t:'Win without dropping a leg',c:(m,w,s)=>w&&s.p[1].legs===0,sp:0,cash:800}],
 [{id:'w_rival',t:'Beat Deano',c:(m,w,s)=>w&&s.rival,sp:1,cash:2000},{id:'w_avg90',t:'Average 90+ in a match',c:m=>avg(m)>=90,sp:0,cash:2000},{id:'w_leg12',t:'A 12-dart leg or better',c:m=>m.bestLeg<=12,sp:0,cash:1500},{id:'w_co150',t:'Check out 150 or more',c:m=>m.hf>=150,sp:0,cash:2000}],
 [{id:'a_rival',t:'Beat Deano in the final',c:(m,w,s)=>w&&s.rival,sp:1,cash:20000},{id:'a_avg95',t:'Average 95+ at Ally Pally',c:m=>avg(m)>=95,sp:0,cash:10000},{id:'a_170',t:'The big fish: 170 checkout',c:m=>m.hf>=170,sp:0,cash:25000},{id:'a_9',t:'Nine-darter',c:m=>m.bestLeg<=9,sp:0,cash:100000}]];
const CHAPTERS=['Chapter 1 · The Fill-in','Chapter 2 · Saturdays at the Club','Chapter 3 · On the Stage','Chapter 4 · The Circuit','Chapter 5 · Across the Ditch','Chapter 6 · Tour Card','Chapter 7 · The Palace'];
const TIER_BRIEF=[
 ['Jonno','Right, Thursdays. Win three and the skipper reckons Tama from the RSA will come have a look.','Side quests from the lads: a ton, a 40+ finish, a clean match. Each one earns you a training point.'],
 ['Tama Rewiri','Club singles. Three wins gets you to the final and the rep selectors watch the final.','Average 55, finish on 60, hit a 180 in here and people start talking.'],
 ['Regional Darts','Super league is best of five on a stage. Four wins and DPNZ ring you.','They look at averages. 65 plus. And win a decider so they know you can close.'],
 ['DPNZ','ProTour events, the national circuit. Four wins puts you top 16 on the Order of Merit.','Out here 78 is par, two 180s a match is normal and ton-plus finishes get you on the highlights.'],
 ['DPNZ','Trans-Tasman Championship. Four wins and the PDC send you a Tour Card.','85 average, 120 finishes, three 180s. The Aussies will bring all of it.'],
 ['PDC','Players Championship. Five wins in Wigan and Ally Pally is yours.','90 average, 12-dart legs, 150 finishes. No crowd. Just you and the board.'],
 ['PDC','World Championship. Four wins and the trophy.','95 average. And if you want the whole room on its feet: the 170, or the nine.']];
function objDone(id){return !!(career()&&career().obj&&career().obj[id]);}
function checkObjectives(){const c=career();if(!c)return [];c.obj=c.obj||{};const me=S.p[0];const done=[];for(const o of OBJ[c.tier]){if(c.obj[o.id])continue;let ok=false;try{ok=o.c(me,S.won,S);}catch(e){}if(ok){c.obj[o.id]=true;c.bank+=o.cash;S.earned=(S.earned||0)+o.cash;done.push(o);}}
 if(done.length&&!c.run){S.objMsg={from:TIER_BRIEF[c.tier][0],lines:done.map(o=>`Objective done: ${o.t}.${o.cash?` ${money(o.cash)} in the bank.`:''}`),replies:[['Nice','ok']]};}return done;}
function briefFor(tier){const b=TIER_BRIEF[tier];return {from:b[0],lines:[b[1],b[2]],replies:[['Got it','ok']]};}
function offerSponsors(done){const c=career();const offers=SPONSORS.filter(s=>s.tier===c.tier&&!(c.declined||[]).includes(s.id)&&(!sponsor()||sponsor().tier<s.tier));if(!offers.length)return done();
 const next=(k)=>{if(k>=offers.length)return done();const s=offers[k];showMsg({from:s.from,lines:s.lines,replies:[[sponsor()?'Switch to '+s.brand:'Sign with '+s.brand,'yes'],['Not now','no']]},act=>{if(act==='yes'){save.sponsor=s.id;Object.entries(s.free).forEach(([key,id])=>{if(key==='barrel'){if(!save.owned.includes(id))save.owned.push(id);save.barrel=id;}else{const tag=key+':'+id;if(!(save.ownedSetup||[]).includes(tag))save.ownedSetup=(save.ownedSetup||[]).concat(tag);save.setup=Object.assign({},save.setup||{},{[key]:id});}});persist();V.setPlayerLook(save.look,save.flight,save.name,c.tier);showMsg({from:s.from,lines:['Welcome aboard. Gear\u2019s in the post. Check the shop.'],replies:[['Cheers','ok']]},()=>done());}else{c.declined=(c.declined||[]).concat(s.id);persist();next(k+1);}});};next(0);}
// ===== CAREER =====
function career(){return save.career;}
const SLOT_KEYS=['career','perks','attr','arm','owned','barrel','setup','ownedSetup','sponsor','gear','composure','v12res','v12new'];
function switchSlot(to){const cur=save.slot||'career';if(cur===to)return;save.slots=save.slots||{};const pack={};SLOT_KEYS.forEach(k=>pack[k]=save[k]);save.slots[cur]=pack;const nx=save.slots[to]||{};SLOT_KEYS.forEach(k=>{save[k]=nx[k]!==undefined?nx[k]:(k==='career'?null:(k==='perks'||k==='attr'||k==='setup'?{}:(k==='arm'||k==='composure'?0:(k==='owned'?['assassin']:(k==='ownedSetup'?['shaft:short','shaft:med','flight:standard','point:std']:(k==='barrel'?'assassin':null))))));});if(!save.setup||!save.setup.shaft)save.setup={shaft:'med',flight:'standard',point:'std'};save.slot=to;_SK=null;persist();}
function isRun(){return (save.slot||'career')==='run';}
function rseed(salt){const c=career();return (hash(String((c&&c.seed)||0)+'|'+salt)%100000)/100000;}
function todaySeed(){const d=new Date();return 'daily-'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function newRun(seed){switchSlot('run');save.career={run:true,seed:seed||('r'+Math.floor(Math.random()*1e9).toString(36)),daily:!!(seed&&String(seed).startsWith('daily')),tier:0,wins:0,losses:0,tierWins:0,tierPlayed:0,bank:150,pts:0,darts:0,stage:'pub',next:null,week:1,best:{visit:0,hf:0,avg:0,leg:99,tons:0,t180:0},feats:{},drafts:0,lives:3,rivalIntro:true,dpnzCard:true,tourCard:true};save.attr={sc:{xp:0,lv:3},fi:{xp:0,lv:3},co:{xp:0,lv:3},cn:{xp:0,lv:3}};save.perks={};save.arm=3;save.owned=['assassin'];save.barrel='assassin';save.sponsor=null;save.gear={};_SK=null;persist();}
function runOver(won){const c=career();if(!c)return;const best=save.runBest||{};const score=(won?1000:0)+c.tier*100+c.wins*10;if(!best.score||score>best.score)save.runBest={score,tier:c.tier,wins:c.wins,drafts:c.drafts||0,won:!!won,when:Date.now()};if(c.daily){save.daily=save.daily||{};const k=c.seed;if(!save.daily[k]||score>save.daily[k].score)save.daily[k]={score,tier:c.tier,wins:c.wins,won:!!won};}save.career=null;persist();}
function newCareer(){save.career={tier:0,wins:0,losses:0,tierWins:0,tierPlayed:0,bank:0,pts:0,darts:0,stage:'intro',next:null,week:1,best:{visit:0,hf:0,avg:0,leg:99,tons:0,t180:0},feats:{},drafts:0};save.attr={};save.perks={};save.picks=0;save.arm=0;save.owned=['assassin'];save.barrel='assassin';save.sponsor=null;save.setup={shaft:'med',flight:'standard',point:'std'};save.ownedSetup=['shaft:short','shaft:med','flight:standard','point:std'];persist();}
// ===== CAREER SEASONS: league table, weekly loop, money =====
const SEASON_LEN=[8,8,10,12,10,12,7];
const TRAVEL=[0,10,45,170,650,2000,7000];
// v3 fixture money per tier: [win, loss, entry, stipend per fixture played]
const FIXPAY=[[18,0,5,0],[55,5,20,5],[180,20,65,20],[600,80,180,100],[1900,250,450,400],[6000,900,1200,1200],[18000,2500,3000,3000]];let S_hard=false;const MM_PAY=[30,100,200,500,1500,3500,7000];const APPEAR=[0,0,0,.03,.03,.03,.03];
const ATTR_CAP=[6,8,10,14,17,20,20];
const EXTRA_NAMES=[['Gaz Tapsell','Mere Hohepa','Sione Fifita','Old Trev'],['Pania Walters','Brett Nuku','Carl Maddox','Ngaire Pou'],['Dion Harris','Taine Kerr','Logan Price','Maia Tuhoe','Stu Crawford','Jordan Fale'],['Hone Rata','Blair Simmons','Pita Lelei','Scott Mabey','Rangi Meihana','Josh Teddy','Cody Harwood','Kane Lister'],['Paul Lim','Lucas Cavanagh','Damon Heta','Kyle Anderson','Corey Cadby','Koha Kokiri'],['Ryan Searle','Josh Rock','Ross Smith','Danny Noppert','Jonny Clayton','Martin Schindler','Chris Dobey','Gabriel Clemens'],['Peter Wright','Gary Anderson','Stephen Bunting']];
// named regulars keep their own average at a tier: the tier's names (pool + named characters) are ranked by a fixed hash and dealt
// offsets evenly across the designed spread, so a name always gets the same offset and the field keeps the old spread and mean
const REG_OFFS=[-6,-5,-3,-2,-1,0,1,2,3,4,5,6,7],REG_RANK={};
function regOff(tier,nm){let L=REG_RANK[tier];if(!L){const ready=typeof OPPS!=='undefined';const ex=ready?regularsFor(tier):[];L=[...new Set(AINAMES[tier].concat(EXTRA_NAMES[tier]||[],ex))].filter(x=>x!==RIVAL.name).sort((a,b)=>hash(a+'|reg')-hash(b+'|reg'));if(ready)REG_RANK[tier]=L;/* cache only once the named characters exist */}
 const i=L.indexOf(nm),P=L.length;if(i<0){console.warn('regOff: name not in tier '+tier+' roster',nm);return REG_OFFS[hash(nm+'|reg')%REG_OFFS.length];}return REG_OFFS[P<2?5:Math.round(i*(REG_OFFS.length-1)/(P-1))];}
function seasonNeedsNew(c){return !c.run&&c.stage!=='intro'&&(!c.season||c.season.done);}
function newSeason(c){const t=TIERS[c.tier];const len=SEASON_LEN[c.tier];const n=((c.seasons||[]).filter(x=>x.tier===c.tier).length)+1;c.seasonN=n;const ko=c.tier===6;
 let pool=[...new Set(AINAMES[c.tier].concat(EXTRA_NAMES[c.tier]||[]))];pool=pool.filter(x=>x!==RIVAL.name); /* unique names: no player twice in one table */
 // seeded shuffle so a repeated season looks different
 const seed=hash(save.name+c.tier+n);const sh=pool.map((nm,i)=>[nm,hash(nm+seed+i)]).sort((a,b)=>a[1]-b[1]).map(a=>a[0]);
 const count=ko?7:len;const names=sh.slice(0,count);if(!ko&&c.tier<=4)names[names.length-1]=RIVAL.name;
 const offs=ko?[-4,-2,0,2,4,6,8]:[-6,-5,-3,-2,-1,0,1,2,3,4,5,6,7];
 const table=names.map((nm,i)=>{const off=nm===RIVAL.name?4:((ko?offs[(i+seed)%offs.length]:regOff(c.tier,nm))+(n-1)*.5); /* Worlds knockout: the designed ladder, each step once (by round). League: each player keeps his own average every season (regOff) */return {name:nm,avg:Math.round(t.avg+off),pts:0,p:0,w:0,l:0,lf:0,la:0};});
 table.push({name:save.name||'You',you:true,avg:Math.round(recentAvg(c)||t.avg-8),pts:0,p:0,w:0,l:0,lf:0,la:0});
 // fixtures: table order shuffled, rival last; knockout ascending strength
 let fx=names.slice();if(ko){fx=table.filter(r=>!r.you).sort((a,b)=>a.avg-b.avg).map(r=>r.name);}else{fx=fx.filter(x=>x!==RIVAL.name).map((nm,i)=>[nm,hash(nm+'fx'+seed)]).sort((a,b)=>a[1]-b[1]).map(a=>a[0]);if(names.includes(RIVAL.name))fx.push(RIVAL.name);}
 const fee=0;c.season={n,tier:c.tier,week:1,len:ko?7:fx.length,table,fixtures:fx,side:false,ko,done:false,fee,paid:false,midShown:false};c.next=null;persist();return c.season;}
function seasonPos(sn){const rows=sn.table.slice().sort((a,b)=>b.pts-a.pts||(b.lf-b.la)-(a.lf-a.la)||b.lf-a.lf);return rows;}
function youPos(sn){return seasonPos(sn).findIndex(r=>r.you)+1;}
function simOthers(sn,skipA,skipB){const others=sn.table.filter(r=>!r.you&&r.name!==skipB&&r.name!==skipA).sort(()=>Math.random()-.5);const need=Math.ceil(TIERS[sn.tier].legs/2);for(let i=0;i+1<others.length;i+=2){const a=others[i],b=others[i+1];const pa=1/(1+Math.pow(10,(b.avg-a.avg)/12));const aw=Math.random()<pa;const w=aw?a:b,l=aw?b:a;const ll=Math.floor(Math.random()*need);w.p++;l.p++;w.w++;l.l++;w.pts+=2;w.lf+=need;w.la+=ll;l.lf+=ll;l.la+=need;if(ll===need-1)l.pts+=1;}}
function seasonFixtureResult(c,me,op){const sn=c.season;if(!sn)return;const t=TIERS[c.tier];const need=Math.ceil(S.bestOf/2);const you=sn.table.find(r=>r.you),row=sn.table.find(r=>r.name===S.oppKey);
 you.p++;if(row)row.p++;you.lf+=me.legs;you.la+=op.legs;if(row){row.lf+=op.legs;row.la+=me.legs;}
 if(S.won){you.w++;you.pts+=2;if(row){row.l++;if(me.legs===need&&op.legs===need-1)row.pts+=1;}}else{you.l++;if(row){row.w++;row.pts+=2;}if(me.legs===need-1)you.pts+=1;}
 you.avg=Math.round(recentAvg(c)||you.avg);if(!sn.ko)simOthers(sn,you.name,S.oppKey);
 // money: appearance + win bonus
 const fp=FIXPAY[c.tier];const app=(S.hard?0:fp[3])+(sponsor()?Math.round(sponsor().perMatch*(1+(SK().spons||0))):0);c.bank+=app;S.earned=(S.earned||0)+app;{const wb=S.hard?0:Math.round((S.won?fp[0]:fp[1])*(S.won?1+SK().prize:1));c.bank+=wb;S.earned+=wb;c.earned=(c.earned||0)+wb;}
 sn.results=(sn.results||[]).concat({w:sn.week,op:S.oppKey,won:S.won,me:me.legs,op2:op.legs});
 sn.week++;sn.side=false;if(c.strain>0)c.strain--;c.buffComp=0;
 if(sn.ko){if(!S.won){sn.done=true;S.after='out';return;}if(sn.week>sn.len){sn.done=true;c.titles=(c.titles||0)+1;const prize=t.purse*4;c.bank+=prize;S.earned+=prize;S.after='champion';return;}S.after='koNext';return;}
 if(sn.week>sn.len){sn.done=true;const pos=youPos(sn);sn.pos=pos;const prize=Math.round(t.purse*(pos===1?2:pos===2?1.2:pos===3?.6:pos===4?.3:0));if(prize){c.bank+=prize;S.earned+=prize;c.earned=(c.earned||0)+prize;}sn.prize=prize;c.seasons=(c.seasons||[]).concat({tier:c.tier,n:sn.n,pos,pts:you.pts,w:you.w,l:you.l});
  if(pos<=2){if(c.tier<6){c.tier++;S.after='promo';}else S.after='champion';}else S.after='stay';}}
const CHAPTER_STORY=[
 {start:['Mo Rangi',["Mo here, I run the Thursday comp at the Kauri. Jonno says you can throw.","Eight weeks, eight names, one table on the wall by the loos. Top two and I ring Tama at the RSA.","Deano's your last fixture. He asked for that."]],mid:['Jonno',["Halfway. You're on the table and Mo's noticed.","Pub's started talking. Shazza's got $5 on you. Don't make her poorer."]],up:['Mo Rangi',["Top two. Tama's expecting you Saturday at the RSA.","Thanks for stacking the chairs every week. Nobody else did."]],stay:['Mo Rangi',["Not top two, but you turned up every week and you're a regular now.","Same table next month. Deano's already signed up."]]},
 {start:['Tama Rewiri',["RSA club singles. Eight Saturdays, honours board, best of three.","These blokes have seen you throw now. They'll practise for you.","Top two and I put your name in front of the rep selectors."]],mid:['Tama Rewiri',["Double-in night exposed you. You're rushing the first dart.","Slow the opener. Finishing wins club darts, not 140s."]],up:['Tama Rewiri',["Selectors want you in the regional squad. Super league, on a stage.","Entry's $120 for the season. That's your first real bill."]],stay:['Tama Rewiri',["Outside the two. Kev and Lisa got the nod.","Old Trev's offered you a session on the board out back. Take it. New season next month."]]},
 {start:['Regional Darts',["Welcome to super league. Ten weeks, a stage, a mic, a scorer with a laptop.","Your points count for the region, not just you.","Top two go on the DPNZ ProTour. That's travel money, so start saving."]],mid:['Kev Mercer',["Kev here, from the squad. Saw you on the stream, you looked nervous as.","Team's got a fundraiser quiz on your spare night next week. No pressure. Some pressure."]],up:['Regional Darts',["Top two. The region's backing your national entry.","ProTour's twelve events around the country. Budget for the petrol."]],stay:['Regional Darts',["Outside the two. You're still in the squad.","Another ten weeks to earn selection. Your average has to go up, not your excuses."]]},
 {start:['Kev Mercer',["ProTour. Twelve events, the Order of Merit decides everything.","I'll share lifts and rooms when I can. It's $90 a trip whether you win or not.","Top two on the Merit go to the Trans-Tasman. Nobody tells you how expensive that is."]],mid:['Anika Shah',["Anika Shah, Shah Electrical. We sponsor a couple of Kiwi players.","I can cover some travel if you'll wear the patch and show up to every fixture. Let's talk on a spare night."]],up:['DPNZ',["Top two on the Merit. Trans-Tasman, across the ditch.","Flights and a motel are about $900 an event. Ten events. Do the maths before you fly."]],stay:['Anika Shah',["Not the season either of us wanted. I've read your numbers honestly.","Support stays if you're honest with me about the next one. Same deal, same patch."]]},
 {start:['DPNZ',["Trans-Tasman. Ten events, Australia's best sixteen against ours.","Away venues, strange boards, the Aussie crowd. Keep the routine.","Top two earn a PDC Tour Card. No Q-School, straight in."]],mid:['Kev Mercer',["Flight got cancelled, we're on the red-eye. You'll land at 6 and throw at 1.","Rest or practise when we land? Pick one, you can't do both."]],up:['PDC',["Tour Card. Two years. Players Championships in Wigan.","It's $2,200 a trip and nobody claps. Welcome to the tour."]],stay:['Kev Mercer',["Outside the two. The cards went to Heta and Whitlock.","I've found cheaper flights for the next run. Same ten events, less money burned."]]},
 {start:['PDC',["Players Championship. Twelve events in a hall in Wigan. No crowd, no mic.","Top two on the Pro Tour Order of Merit qualify for Alexandra Palace.","Travel is on you. Win or go home skint."]],mid:['Shazza',["Six events in and Jonno says you've lost four straight. He's worried, he won't say it.","Deano's qualified for Wigan too. Of course he has."]],up:['PDC',["You've qualified for the World Championship. Alexandra Palace.","Seven matches between you and the trophy. One loss and you're on the plane."]],stay:['Anika Shah',["Outside the two. No Palace this year.","I can do one more season at a reduced rate. It's on the table, your call."]]},
 {start:['Jonno',["Ally Pally. Seven rounds, straight knockout.","The whole pub's in. Mo shut the kitchen. Shazza's crying already.","Messages from home before every walk-on. Read them or don't, but we're here."]],mid:['Mo Rangi',["Quarter-final. The Kauri has run out of beer twice.","Press want you tomorrow morning. Sleep wants you more."]],up:['Jonno',["WORLD CHAMPION.","We're putting the trophy on the Thursday board. You're buying. Forever."]],stay:['Jonno',["Out at the Palace. Nobody here cares, you made the Palace.","Next year. Same card, same ladder, same you, but better."]]}];
const SPARE_EVENTS=[
 {id:'strain',minTier:1,from:'Kev Mercer',lines:['Arm feeling tight after Saturday? Mine went the same way at your age.','Rest it, throw light, or play through. Your call.'],replies:[['Rest it (uses the spare night, arm clear)','rest'],['Light session (half XP, uses the night, arm clear)','light'],['Play through (keep the night, spread +6% for 2 fixtures)','through']]},
 {id:'sponsor',minTier:3,from:'Anika Shah',lines:['Got a spare night? Come by the shop.','Deal on the table: I cover your next three trips. You wear the patch and make all three fixtures.'],replies:[['Take the meeting (uses the night, 3 trips covered)','deal'],['Not this week','no']]},
 {id:'stag',minTier:0,from:'Jonno',lines:['Pete’s stag do is on your spare night. Whole pub’s going.','You can skip it. You’d be the only one.'],replies:[['Go (uses the night, +1.5 composure next fixture)','go'],['Skip it, I’m practising','no']]}];
function maybeSpareEvent(c,sn,then){if(!sn||sn.ko||sn.side||sn.done||sn.week<2||sn.week>=sn.len)return false;sn.events=sn.events||{};if(sn.events[sn.week]===undefined){const pool=SPARE_EVENTS.filter(e=>c.tier>=e.minTier&&!(sn.seen||[]).includes(e.id)&&!(e.id==='sponsor'&&c.travelCredit>0));const roll=hash(save.name+'ev'+c.tier+sn.n+sn.week)%100;sn.events[sn.week]=roll<28&&pool.length?pool[roll%pool.length].id:null;persist();}const ev=SPARE_EVENTS.find(e=>e.id===sn.events[sn.week]);if(!ev)return false;sn.events[sn.week]=null;sn.seen=(sn.seen||[]).concat(ev.id);persist();
 showMsg({from:ev.from,lines:ev.lines,replies:ev.replies},act=>{const use=(k)=>{sn.side=true;sn.sideKind=k;};
  if(ev.id==='strain'){if(act==='rest'){use('rest');c.strain=0;}else if(act==='light'){use('light session');c.strain=0;persist();S_lightXP=true;playPractice();return;}else{c.strain=2;}}
  if(ev.id==='sponsor'){if(act==='deal'){use('sponsor meeting');c.travelCredit=3;}}
  if(ev.id==='stag'){if(act==='go'){use('the stag do');c.buffComp=1.5;}}
  persist();then();});return true;}

function chapterMsg(tier,key){const s=CHAPTER_STORY[tier][key];return {from:s[0],lines:s[1],replies:[['OK','ok']]};}
function renderTable(host,sn,full){if(!sn||sn.ko){host.innerHTML='';return;}const rows=seasonPos(sn);const played=sn.table.some(r=>r.p>0);const yi=rows.findIndex(r=>r.you);
 let show;if(full||rows.length<=7)show=rows.map((r,i)=>({r,i}));else{const keep=new Set([0,1,yi-1,yi,yi+1].filter(i=>i>=0&&i<rows.length));if(!played){for(let i=0;i<5;i++)keep.add(i);keep.add(yi);}show=[];let last=-1;rows.forEach((r,i)=>{if(keep.has(i)){if(last>=0&&i-last>1)show.push({gap:true});show.push({r,i});last=i;}});if(last<rows.length-1)show.push({gap:true});}
 const rank=(r,i)=>{if(!played)return '';const prev=rows[i-1];if(prev&&prev.pts===r.pts&&(prev.lf-prev.la)===(r.lf-r.la))return '=';return String(i+1);};
 host.innerHTML=`<table class="lt"><thead><tr><th>${played?'#':''}</th><th>Player</th><th>P</th><th>W</th><th>L</th><th>+/−</th><th>Pts</th></tr></thead><tbody>${show.map(x=>x.gap?`<tr class="gap"><td></td><td>···</td><td colspan="5"></td></tr>`:(()=>{const r=x.r,i=x.i;return `<tr class="${r.you?'you':''} ${played&&i<2?'up':''}"><td class="rk">${rank(r,i)}</td><td>${r.you?'You':r.name}${r.name===RIVAL.name?' <i>rival</i>':''}</td><td>${r.p}</td><td>${r.w}</td><td>${r.l}</td><td>${r.lf-r.la>0?'+':''}${r.lf-r.la}</td><td><b>${r.pts}</b></td></tr>`;})()).join('')}</tbody></table>`;}

function nextOpponent(){const c=career(),t=TIERS[c.tier];const names=AINAMES[c.tier];const decider=c.tierWins===((c.run?2:t.need)-1);let name=names[(c.tierPlayed+hash(c.tier+'x'))%names.length];
 if(c.stage==='intro'){return {oppName:'Big Mal',oppAvg:42,legs:3,decider:false,intro:true};}
 if(!c.run){if(seasonNeedsNew(c))newSeason(c);const sn=c.season;const nm=sn.fixtures[Math.min(sn.week,sn.len)-1];const row=sn.table.find(r=>r.name===nm)||{avg:t.avg};const form=Math.round((hash(nm+sn.n+sn.week)%5)-2);return {oppName:nm,oppKey:nm,oppAvg:row.avg+form,legs:t.legs,decider:false,rival:nm===RIVAL.name,fixture:true,din:(c.tier===1||c.tier===5)&&sn.week%3===0,ko:sn.ko?sn.week:0,travel:TRAVEL[c.tier]};}
 if(c.run){const m=c.wins+c.losses+1;const tw=m%3===0?(rseed('tw'+m)<.5?'din':'301'):null;if(decider)return {oppName:names[names.length-1],oppAvg:Math.round(t.avg+6),legs:3,decider:true,boss:true,din:tw==='din',twist:tw};c._twist=tw;}
 if(decider){return {oppName:RIVAL.name,oppAvg:Math.round(t.avg+4),legs:t.legs,decider:true,rival:true,din:c.tier===1||c.tier===5};}
 const rec=recentAvg(c);let base=t.avg;if(c.run){base=t.avg;}else if(rec)base=t.avg+(rec-t.avg)*(rec>t.avg?.6:.35);base=Math.max(t.avg-5,Math.min(t.avg+10,base));const avgv=base+((c.run?rseed('avg'+c.wins+c.losses):Math.random())*8-4);const pairs=(c.tier===2||c.tier===4)&&c.tierPlayed%2===1;const din=(c.tier===1&&c.tierPlayed%3===2)||(c.tier===5&&c.tierPlayed%2===1);
 const twist=c.run?c._twist:null;const name2=names[(c.tierPlayed+3+hash(c.tier+'y'))%names.length]===name?names[(c.tierPlayed+5)%names.length]:names[(c.tierPlayed+3+hash(c.tier+'y'))%names.length];
 return {oppName:pairs?(name+' & '+name2):name,oppAvg:Math.round(avgv),legs:c.run?1:t.legs,decider,pairs:c.run?false:pairs,din:c.run?twist==='din':din,twist,mateName:c.tier===2?'Jonno':'Haupai Rua',mateAvg:t.avg-2,oppName2:name,myTeam:c.tier===2?'North Island':'New Zealand',oppTeam:c.tier===2?'South Island':'Australia'};}
function playLocal(){const c=career();const t=TIERS[Math.max(0,c.tier-1)];const names=AINAMES[Math.max(0,c.tier-1)];const n=names[Math.floor(Math.random()*names.length)];beginMatch({mode:'career',tier:Math.max(0,c.tier-1),p0:save.name||'You',oppName:n,oppAvg:Math.round(t.avg+(Math.random()*6-3)),legs:3,purse:Math.max(15,Math.round(TIERS[Math.max(0,c.tier-1)].purse*.15)),local:true});}
function playPractice(){beginMatch({mode:'career',tier:Math.max(0,career()?career().tier:0),p0:save.name||'You',oppName:'Practice',oppAvg:0,legs:1,purse:0,practice:true});}
function playNext(){const c=career();if(!c.next)c.next=nextOpponent();const t=TIERS[c.tier];const n=c.next;const fee=(c.run||n.intro||S_hard)?0:FIXPAY[c.tier][2];
 const cardNeed=(c.run)?null:c.tier===3&&!c.dpnzCard?['DPNZ membership',150,'dpnzCard']:(c.tier===5&&!c.tourCard?['PDC Tour Card (Q-School)',600,'tourCard']:null);
 if(cardNeed&&!n.intro){const [nm,cost,key]=cardNeed;if(c.bank>=cost){showMsg({from:c.tier===3?'DPNZ':'PDC',lines:[`${nm}: ${money(cost)}. One-off. No card, no entry.`],replies:[['Pay it','pay'],['Not yet','no']]},act=>{if(act==='pay'){c.bank-=cost;c[key]=true;persist();playNext();}else showHub();});}else{showMsg({from:c.tier===3?'DPNZ':'PDC',lines:[`${nm} costs ${money(cost)} and you\u2019ve got ${money(c.bank)}.`,'Local nights and money matches pay. Come back with the cash.'],replies:[['OK','ok']]},()=>showHub());}return;}
 if(!c.run&&c.season&&!c.season.paid){const sf=c.season.fee||0;if(sf&&c.bank<sf){showMsg({from:'Entry desk',lines:[`Season entry for ${t.n} is ${money(sf)}. You\u2019ve got ${money(c.bank)}.`,'Local nights and money matches pay. Come back with it.'],replies:[['Play a money match','money'],['Back','ok']]},act=>{if(act==='money')moneyMatch();else showHub();});return;}c.bank-=sf;c.season.paid=true;persist();}
 const trav=(!c.run&&!n.intro)?(c.travelCredit>0?0:(TRAVEL[c.tier]||0)):0;if(trav&&c.bank<trav&&!S_adv){const used=!!(c.season&&c.season.side);showMsg({from:'Travel',lines:[`Getting to ${t.venue} costs ${money(trav)}. You\u2019ve got ${money(c.bank)}.`,used?'Spare night\u2019s gone. Kev can front the fare; it comes out of your next winnings.':'Money matches and local nights pay. Or Kev can front the fare and take it out of your next winnings.'],replies:(used?[]:[['Play a money match','money']]).concat([['Take the advance','adv'],['Back','ok']])},act=>{if(act==='money')moneyMatch();else if(act==='adv'){S_adv=true;playNext();S_adv=false;}else showHub();});return;}
 if(fee&&c.bank<fee){const used=!!(c.season&&c.season.side);showMsg({from:'Entry desk',lines:[`Entry for ${t.n} is ${money(fee)}. You\u2019ve got ${money(c.bank)}.`,'Hardship entry gets you on the oche, but there\u2019s no prize money if you win.'],replies:(used?[]:[['Play a money match','money']]).concat([['Hardship entry','hard'],['Back','ok']])},act=>{if(act==='money')moneyMatch();else if(act==='hard'){S_hard=true;playNext();}else showHub();});return;}
 const hard=S_hard;S_hard=false;const go=()=>{beginMatch({mode:'career',tier:c.tier,p0:save.name||'You',start:n.twist==='301'?301:501,twist:n.twist||null,oppKey:n.oppKey||n.oppName,oppName:n.oppName,oppAvg:n.oppAvg,legs:n.legs,decider:n.decider,intro:n.intro,rival:n.rival,fee,purse:t.purse,din:n.din,pairs:n.pairs,mateName:n.mateName,mateAvg:n.mateAvg,myTeam:n.myTeam,oppTeam:n.oppTeam});if(S)S.hard=hard;};
 if(fee){c.bank-=fee;persist();}if(trav){c.bank-=trav;c._lastTravel=trav;persist();}else{c._lastTravel=0;if(!c.run&&!n.intro&&c.travelCredit>0){c.travelCredit--;persist();}}
 if(n.rival&&!c.rivalIntro){c.rivalIntro=true;persist();showMsg(RIVAL_MSG.heads,go);return;}go();}
function moneyMatch(){const c=career();const pool=AINAMES[Math.max(0,c.tier-1)].concat(AINAMES[0]);const n=pool[Math.floor(Math.random()*pool.length)];const mp=MM_PAY[c.tier]||30;S_money=true;beginMatch({mode:'career',tier:0,p0:save.name||'You',oppName:n,oppAvg:Math.round(TIERS[c.tier].avg-4+Math.random()*6),legs:3,purse:mp,money:true});}
let S_money=false,S_adv=false,S_lightXP=false;
function matchXP(){if(S.practice)return;const me=S.p[0];const c=career();const prev=recentAvg(c);gainXP('cn',8);if(prev&&Math.abs(avg(me)-Math.max(prev,c.best?c.best.avg*.9:0))<=4)gainXP('cn',8);if(S.won&&S.decider)gainXP('co',10);if(S.won&&S.rival)gainXP('co',12);}
function careerAfterMatch(){const c=career();if(S.practice){if(c&&c.season){c.season.side=true;c.season.sideKind=S_lightXP?'light session':'practice';}S_lightXP=false;S.after=c?'money':'title';return;}if(!c)return;drillAccum(c);matchXP();if(!c.run)setTimeout(lbPost,1500);if(c.run)S.draftN=S.won?(S.draftWin||5):3;if(c.season&&(S.local||S_money)){c.season.side=true;c.season.sideKind=S.local?'local match':'money match';}if(S.local){S.after='money';c.pts+=S.p[0].pts;c.darts+=S.p[0].darts;c.history=(c.history||[]).concat(S.won?'W':'L').slice(-8);if(S.won){c.wins++;c.bank+=S.purse;S.earned=S.purse;}else c.losses++;recordBests();checkObjectives();checkFeats();return;}if(S_money){S_money=false;S.after='money';if(S.won){c.bank+=S.purse||30;S.earned=S.purse||30;c.wins++;}else c.losses++;c.pts+=S.p[0].pts;c.darts+=S.p[0].darts;recordBests();checkFeats();return;}const t=TIERS[c.tier];const me=S.p[0];c.pts+=me.pts;c.darts+=me.darts;c.tierPlayed++;c.next=null;c.tierAvgs=(c.tierAvgs||[]).concat(+avg(me).toFixed(1)).slice(-4);
 c.history=(c.history||[]).concat(S.won?'W':'L').slice(-8);if(S.rival){c.rivalW=(c.rivalW||0)+(S.won?1:0);c.rivalL=(c.rivalL||0)+(S.won?0:1);S.rivalMsg=(S.won?RIVAL_MSG.beatRival:RIVAL_MSG.lostToRival)[Math.min(6,c.tier)];}
 if(S.won){c.wins++;c.tierWins++;}
 else c.losses++;
 recordBests();if(c.stage!=='intro'&&!c.run)checkObjectives();
 if(c.stage!=='intro'&&!c.run&&!S.rival&&c.tier<=1&&Math.random()<.45){const pool=S.won?[['Jonno',['Skipper\u2019s buzzing. Says you\u2019re the best fill-in since 2009.','That was 2009\u2019s fill-in. He\u2019s in prison now.']],['Shazza',['Oi. Good darts tonight.','Deano was watching from the bar. Face like a slapped fish.']],['Jonno',['Beers Thursday. You\u2019re buying, big shot.']]]:[['Jonno',['Rough one. Board\u2019s got a lean on it anyway.','Deano\u2019s been telling everyone. Ignore him.']],['Jonno',['Next week. Early doors, get some practice in.']],['Shazza',['You\u2019ll get him next time. Doubles, not trebles, when you\u2019re nervous.']]];const pick=pool[Math.floor(Math.random()*pool.length)];S.flavour={from:pick[0],lines:pick[1],replies:[['Cheers','ok']]};}
 if(c.stage==='intro'){c.stage='pub';c.tierWins=S.won?1:0;S.after='intro';return;}
 if(c.run&&!S.won){c.lives=(c.lives||1)-1;if(c.lives<=0){S.after='runover';}}
 const needW=c.run?2:t.need;if(c.run&&S.after!=='runover'&&c.tierWins>=needW){if(c.tier<6){c.tier++;c.tierWins=0;c.tierPlayed=0;c.tierAvgs=[];S.after='runpromo';}else{S.after='runwin';c.tierWins=0;}}
 else if(!c.run){seasonFixtureResult(c,me,S.p[1]);}
 if(c.stage!=='intro'&&!c.run)checkFeats();else if(c.run)S.featsNew=[];}
const STORY={
 intro:{from:'Jonno',lines:["Oi. You still throw?","We're one short Thursday at the Kauri. Pub league, 501.","Fill in for us? First beer's on me."],replies:[["Yeah go on, I'm in",'start'],["What time?",'time']],time:["7 sharp. Bring your own darts if you've got em.","You'll be on against Big Mal first up. Don't let the belly fool you."]},
 afterIntroWin:{from:'Jonno',lines:["MATE. Big Mal hasn't lost a Thursday in a year.","Skipper wants you every week. You're in the team.","Twenty bucks a win out of the kitty. Welcome to the pub league."],replies:[["Sweet",'hub']]},
 afterIntroLoss:{from:'Jonno',lines:["Unlucky. Mal's been on that board 20 years.","Skipper liked your scoring though. You're in the team if you want it.","Thursdays. Twenty bucks a win from the kitty."],replies:[["I'll be there",'hub']]},
 promo:[null,
  {from:'Tama Rewiri',lines:["Tama from the RSA here. Jonno gave me your number.","Saw you throw Thursday. Our singles comp runs Saturdays, $150 to the winner.","You keen? Entry's sorted."],replies:[["Keen",'hub']]},
  {from:'Regional Darts',lines:["Selectors watched your club final.","You're named in the regional super league squad. Matches are best of five on a stage with a crowd.","First fixture Tuesday."],replies:[["Let's go",'hub']]},
  {from:'DPNZ',lines:["Your rep results put you on our radar.","DartPlayers New Zealand ProTour. $60 entry per event, $2,500 to the winner.","Averages in the 80s out there. You up to it?"],replies:[["Enter me",'hub']]},
  {from:'DPNZ',lines:["Order of Merit is out. You're top 16.","That means the Trans-Tasman Championship in Wellington. Top 16 NZ versus top 16 Australia.","Winner goes to Ally Pally."],replies:[["Book it",'hub']]},
  {from:'PDC',lines:["Congratulations. Your Trans-Tasman run earned a Tour Card.","Players Championship 12, Wigan. Floor event, no crowd, 128 of the best in the world.","$400 flights and entry. Averages 95 plus."],replies:[["See you in Wigan",'hub']]},
  {from:'PDC',lines:["You've qualified for the World Championship.","Alexandra Palace. Sets, lights, 3,000 people and a crowd that sings.","Four wins from a world title."],replies:[["Walk me on",'hub']]}],
 champion:{from:'Jonno',lines:["WORLD CHAMPION.","From a Thursday fill-in at the Kauri. Unreal.","Beers are on you forever now."],replies:[["Run it back",'hub']]}};
function showMsg(story,done){$('msgFrom').textContent=story.from;$('msgAv').textContent=story.from.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();$('msgSub').textContent='Mobile';const th=$('msgThread');th.innerHTML='';$('msgReplies').innerHTML='';showScreen('msg');
 const d=new Date();$('phTime').textContent=d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');let i=0;const step=()=>{if(i<story.lines.length){const ty=document.createElement('div');ty.className='bub typing';ty.innerHTML='<i></i><i></i><i></i>';th.appendChild(ty);th.scrollTop=1e6;setTimeout(()=>{ty.remove();const b=document.createElement('div');b.className='bub';b.textContent=story.lines[i++];th.appendChild(b);th.scrollTop=1e6;noiseBurst({dur:.05,freq:2600,q:4,gain:.08});setTimeout(step,350+Math.random()*250);},450+Math.min(900,story.lines[i].length*12));}
  else{story.replies.forEach(([txt,act])=>{const btn=document.createElement('button');btn.type='button';btn.textContent=txt;btn.onclick=()=>{const b=document.createElement('div');b.className='bub me';b.textContent=txt;th.appendChild(b);$('msgReplies').innerHTML='';
   if(act==='time'){i=0;const s2={from:story.from,lines:story.time,replies:story.replies.filter(r=>r[1]!=='time')};setTimeout(()=>{s2.lines.forEach((l,k)=>setTimeout(()=>{const bb=document.createElement('div');bb.className='bub';bb.textContent=l;th.appendChild(bb);},k*700));setTimeout(()=>{s2.replies.forEach(([t2,a2])=>{const bt=document.createElement('button');bt.type='button';bt.textContent=t2;bt.onclick=()=>done(a2);$('msgReplies').appendChild(bt);});},s2.lines.length*700);},300);}
   else setTimeout(()=>done(act),500);};$('msgReplies').appendChild(btn);});}};step();}

// ===== SCREENS =====
const SCREENS=['title','creator','msg','hub','shop','friends','result','skills','perk','login'];
function showScreen(id){SCREENS.forEach(s=>$(s).hidden=s!==id);if(id&&AU.ctx&&AU.crowdGain)AU.crowdGain.gain.setTargetAtTime(0,AU.ctx.currentTime,.4);sceneBg(id);$('hud').hidden=!!id||!S;V.preview(id==='creator');V.title(id==='title');V.idle(id==='title'||id==='hub'||id==='shop'||id==='skills'||id==='friends'||id==='msg'||id==='perk');}
function ringSVG(k){const r=15,c=2*Math.PI*r;return `<svg class="rg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="${r}" fill="none" stroke="rgba(243,239,230,.12)" stroke-width="3"/><circle cx="18" cy="18" r="${r}" fill="none" stroke="#e8382c" stroke-width="3" stroke-dasharray="${(c*k).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 18 18)" stroke-linecap="butt"/><text x="18" y="22" text-anchor="middle" font-size="10" fill="#f3efe6" font-family="Saira Condensed,Arial Narrow,sans-serif" font-weight="700">${Math.round(k*100)}</text></svg>`;}
const PERK_GLYPH={grp:'◎',sce:'▲',dbe:'◉',std:'✋',soft:'~',calm:'◇',rhythm:'♪',fee:'$',study:'✎',habit:'⟳',cash:'$',grouping:'◎',steady:'✋',groove:'≡',hunter:'▲',eye:'◉',warm:'☼',stage:'◆',cover:'⟲',negotiator:'$',grinder:'⚒',iron:'⚙',loose:'~',machine:'▲▲',clinical:'◉◉',ice:'❄',showman:'★'};
function matchKind(n,c,t){const nextT=TIERS[Math.min(6,c.tier+1)];if(c.run){const left=2-c.tierWins;return {kind:`The Run · ${t.n}${n.decider?' · mini boss':' · one leg'}${n.twist==='301'?' · 301 sprint':n.twist==='din'?' · double in':''}`,what:`${n.oppName}${n.boss?' (the boss of this room)':''}, ${n.legs===1?'one leg':'best of '+n.legs}, averages about ${n.oppAvg}.${n.din?' Double in.':''}`,stakes:`${'♥'.repeat(c.lives||0)} ${c.lives===1?'life':'lives'}. Win: ${c.tier>=6?(left===1?'run complete':left+' wins to finish the run'):(left===1?nextT.n+' next':left+' wins to '+nextT.n)}. Lose: a life.`};}if(n.intro)return {kind:'Fill-in match',what:'Thursday pub league at the Kauri. Jonno is a player short.',stakes:'No money. Impress and you are in the team.'};
 if(n.fixture&&c.season){const sn=c.season;const pos=youPos(sn);const row=sn.table.find(r=>r.name===n.oppName);const opos=row?seasonPos(sn).indexOf(row)+1:0;const trav=TRAVEL[c.tier]?` Travel ${money(TRAVEL[c.tier])}.`:'';const ko=sn.ko;const rnd=['First round','Second round','Third round','Fourth round','Quarter-final','Semi-final','Final'][Math.min(6,sn.week-1)];
  return {kind:ko?`World Championship · ${rnd}`:`${t.n} · week ${sn.week} of ${sn.len}`,what:`${n.oppName}${n.rival?' (Deano)':''}, best of ${n.legs}, averages about ${n.oppAvg}${!ko&&opos?`, ${ord(opos)} in the table`:''}.${n.din?' Double in.':''}${trav}`,stakes:ko?(sn.week===sn.len?'Win: world champion. Lose: home.':'Win: next round. Lose: out until next year.'):`You are ${ord(pos)}. Win: 2 points and ${money(Math.round(t.purse*.12))}. Lose: a point if you take it to a decider.${sn.week===sn.len?' Last week: top two go up.':''}`};}
 if(n.rival)return {kind:c.tier===6?'World Championship final':c.tier===1?'Club final':t.n+' decider',what:`Deano Marsh. Best of ${n.legs}. He has been waiting for this.`,stakes:c.tier===6?'Win: world champion. Lose: he lifts it.':`Win: ${nextT.n}. Lose: stay in ${t.n} and hear about it.`};
 const left=t.need-c.tierWins;return {kind:n.pairs?`${t.n} pairs`:(n.din?`${t.n} · double-in`:`${t.n} · round ${c.tierWins+1} of ${t.need}`),what:`${n.oppName}, best of ${n.legs}, averages about ${n.oppAvg}.`,stakes:left===1?`Win this and the ${c.tier===6?'title':'decider against Deano'} is next.`:`${left} wins to ${c.tier===6?'the title':'the decider'}. Lose: no prize, no progress.`};}
function ord(n){return n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');}
function portraitImg(look,name,tier,cls){const u=V.portrait(look,name,tier,0);return u?`<img class="pt ${cls||''}" src="${u}" alt="">`:`<span class="pt ${cls||''}"></span>`;}
function oppLookFor(n){return n.rival?RIVAL.look:lookFor(n.oppName2||n.oppName);}
window.onRigReady=()=>{const vis=[...document.querySelectorAll('.screen')].find(e=>!e.hidden);if(vis&&vis.id==='hub')showHub();if(vis&&vis.id==='skills')showPlayer();if(vis&&vis.id==='title')showTitle();};
// ===== MATES LEADERBOARD (Supabase, public read; each player updates only their own row via a secret token) =====
const LB={url:'https://thyirfwoqkshsaqowdpe.supabase.co',key:'sb_publishable_zJXcxBrjvBA9OeKCIqRTow_bFvBxgLw',cache:null,at:0};
function lbId(){if(!save.lb){const u=(crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c==='x'?r:(r&3|8)).toString(16);}));const t=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');save.lb={id:u,token:t};persist();}return save.lb;}
function lbHeaders(){const l=lbId();return {'apikey':LB.key,'Authorization':'Bearer '+LB.key,'Content-Type':'application/json','x-tops-token':l.token};}
function lbName(){const u=NET&&NET.user;if(u){const m=u.user_metadata||{};let g=(m.full_name||m.name||'').replace(/\s*[\(\[].*$/,'').replace(/\s+/g,' ').trim();if(g.length>20)g=g.split(' ').slice(0,2).join(' ');if(g)return g.slice(0,20);}return String(save.name||'You').slice(0,16);}
async function lbPost(){const c=career();if(!c||!save.name)return;try{const l=lbId();const b=c.best||{};const row={id:l.id,token:l.token,name:lbName(),tier:c.tier,matches:c.wins+c.losses,wins:c.wins,avg:+(c.darts?c.pts/c.darts*3:0).toFixed(1),best_avg:+(b.avg||0).toFixed(1),best_leg:b.leg<99?b.leg:null,t180:c.t180||0,hf:b.hf||0,updated_at:new Date().toISOString()};
 const r=await fetch(LB.url+'/rest/v1/rpc/'+TOPS_SAVE_NS.lbRpc,{method:'POST',headers:lbHeaders(),body:JSON.stringify({p:row})});LB.ok=r.ok;LB.cache=null;}catch(e){LB.ok=false;}}
async function lbFetch(){if(LB.cache&&Date.now()-LB.at<30000)return LB.cache;try{const r=await fetch(LB.url+'/rest/v1/'+TOPS_SAVE_NS.lb+'?select=id,name,tier,matches,wins,avg,best_avg,best_leg,t180,hf,updated_at&order=avg.desc&limit=30',{headers:lbHeaders()});if(!r.ok)throw 0;LB.cache=await r.json();LB.at=Date.now();return LB.cache;}catch(e){return null;}}
async function renderBoard(){const host=$('hubBoard');if(!host)return;host.innerHTML='<p class="help">Loading…</p>';const rows=await lbFetch();if(!rows){host.innerHTML='<p class="help">Leaderboard unavailable. <button type="button" class="hx-link" onclick="renderBoard()">Retry</button></p>';return;}if(false){host.innerHTML='<p class="help">Leaderboard offline. It comes online once the table exists.</p>';return;}if(!rows.length){host.innerHTML='<p class="help">No one on the board yet. Finish a match and you’re on it.</p>';return;}
 const me=lbId().id;host.innerHTML=`<table class="lbt"><thead><tr><th>#</th><th>Player</th><th>Avg</th><th>Best leg</th><th>180s</th><th>High out</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.id===me?'me':''}"><td>${i+1}</td><td><b>${String(r.name).replace(/</g,'&lt;')}</b><small>${TIERS[Math.min(6,r.tier||0)].n} · ${r.wins}–${(r.matches||0)-(r.wins||0)}</small></td><td>${(+r.avg).toFixed(1)}</td><td>${r.best_leg||'–'}</td><td>${r.t180}</td><td>${r.hf||'–'}</td></tr>`).join('')}</tbody></table>`;}
function money(n){return (n<0?'-':'')+'$'+Math.abs(Math.round(n)).toLocaleString();}
function showTitle(){if(isRun())switchSlot('career');const c=career();const r=(save.slots&&save.slots.run&&save.slots.run.career)||null;$('btnRun').innerHTML=r?`<b>Continue the Run</b><small>Tier ${r.tier+1} · ${r.wins}–${r.losses} · ${'♥'.repeat(r.lives||0)}${'♡'.repeat(Math.max(0,3-(r.lives||0)))}</small>`:`<b>The Run</b><small>Three lives. Draft a card after every match. Climb the ladder.${save.runBest?` Best: ${save.runBest.won?'complete':'tier '+(save.runBest.tier+1)}, ${save.runBest.wins} wins.`:''}</small>`;$('btnNewRun').hidden=!r;$('btnContinue').hidden=!c;$('btnNewCareer').classList.toggle('alt',!!c);$('btnNewCareer').textContent=c?'Start a new career':'New career';if(c){$('btnContinue').innerHTML=`Continue career<small>${save.name||'You'} · ${TIERS[c.tier].n} · ${c.wins}–${c.losses} · ${money(c.bank)}</small>`;$('titleCard').hidden=false;$('tcPt').innerHTML=portraitImg(save.look,save.name,c.tier,'md');$('tcName').textContent=save.name||'You';$('tcLine').textContent=`${TIERS[c.tier].n} · ${c.wins}–${c.losses}`;$('tcBank').textContent=money(c.bank);}else $('titleCard').hidden=true;V.buildVenue(c?c.tier:0);V.setPlayerLook(save.look,save.flight);{const a=$('tlAuth');if(a){const u=save.cloudUser;a.innerHTML=u?`Signed in as <b>${u.name||'you'}</b> · career syncs to the cloud · <a href="#" id="tlOut">Sign out</a>`:`Guest · <a href="#" id="tlIn">Sign in with Google</a> to save your career to the cloud.`;const o=$('tlOut'),i=$('tlIn');if(o)o.onclick=e=>{e.preventDefault();netSignOut();};if(i)i.onclick=e=>{e.preventDefault();save.authSeen=false;showLogin();};}}showScreen('title');}
function hubTab(t){if(isRun()&&(t==='kit'||t==='board'||t==='practice'))t='play';hubTab.cur=t;[...$('hubTabs').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===t));document.querySelectorAll('#hub .htab').forEach(sec=>sec.hidden=sec.dataset.t!==t);const pn=document.querySelector('#hub .panel');if(pn)pn.scrollTop=0;}
function showHub(tab){const c=career(),t=TIERS[c.tier];if(!c.run&&seasonNeedsNew(c)){newSeason(c);}if(!c.next)c.next=nextOpponent();persist();const sn=(!c.run&&c.season)||null;if(sn&&!sn.midShown&&sn.week===Math.ceil(sn.len/2)+1&&!sn.done){sn.midShown=true;persist();showMsg(chapterMsg(c.tier,'mid'),()=>showHub(tab));return;}
 if(sn&&maybeSpareEvent(c,sn,()=>showHub(tab)))return;
 const run=!!c.run;const lt=TIERS[Math.max(0,c.tier-1)];(window.__hubSoft||V.setPlayerLook(save.look,save.flight,save.name,c.tier));$('hub').classList.toggle('run',run);
 // header
 $('hubName').textContent=save.name||'You';$('hubPt').innerHTML=portraitImg(save.look,save.name,c.tier,'md');hubBankUpdate();
 $('hubTabs').querySelector('[data-t=kit]').hidden=run;$('hubTabs').querySelector('[data-t=board]').hidden=run;$('hubTabs').querySelector('[data-t=practice]').hidden=run;$('hubTabs').querySelector('[data-t=play]').textContent=run?'The Run':'Career';
 $('hubTier').textContent=run?`The Run · ${t.n}`:`${CHAPTERS[c.tier]} · ${t.n}`;$('hubSeasonLine').textContent=run?`Tier ${c.tier+1} of 7`:(sn?(sn.ko?`Round ${Math.min(sn.week,sn.len)} of ${sn.len}`:`Season ${sn.n} · Week ${Math.min(sn.week,sn.len)} / ${sn.len}`):'');
 $('hubTierLabel').textContent=run?`The Run · Tier ${c.tier+1} of 7 · ${t.n}`:CHAPTERS[c.tier]+' · '+t.n;$('hubVenue').textContent=t.s;
 // season panel
 const played=sn?sn.table.some(r=>r.p>0):false;
 if(sn){$('hxSeasonTitle').textContent=sn.ko?'The Palace':'The season';$('hxSeasonSub').textContent=sn.ko?'Straight knockout. Lose once and it’s over.':'Top two earn promotion';
  const rows=seasonPos(sn);const yi=rows.findIndex(r=>r.you);const you=rows[yi];const tied=played&&rows.filter(r=>r!==you&&r.pts===you.pts&&(r.lf-r.la)===(you.lf-you.la)).length>0;
  $('hxStatus').textContent=sn.ko?`Round ${Math.min(sn.week,sn.len)} of ${sn.len}`:(!played?'Season starting · no matches played':`Week ${Math.min(sn.week,sn.len)} of ${sn.len} · you are ${tied?'tied ':''}${ord(yi+1)}`);
  renderTable($('hubTable'),sn,showHub.fullTable);$('btnFullTable').hidden=sn.ko||sn.table.length<=7;$('btnFullTable').textContent=showHub.fullTable?'Show less ←':'View full table →';$('btnFullTable').onclick=()=>{showHub.fullTable=!showHub.fullTable;renderTable($('hubTable'),sn,showHub.fullTable);$('btnFullTable').textContent=showHub.fullTable?'Show less ←':'View full table →';};
  $('hubProgPips').innerHTML=sn.fixtures.map((nm,k)=>{const r=(sn.results||[])[k];const cur=k===Math.min(sn.week,sn.len)-1&&!sn.done;return `<i class="${r?(r.won?'on':'off'):''}${cur?' cur':''}" title="${nm}"></i>`+(k<sn.fixtures.length-1?'<i class="line"></i>':'');}).join('');$('hubProgTxt').textContent=sn.ko?`Round ${Math.min(sn.week,sn.len)} of ${sn.len}`:`Week ${Math.min(sn.week,sn.len)} of ${sn.len}`;$('hxRun').hidden=true;$('hubTable').hidden=false;$('hubProgTxt').parentNode.hidden=false;}
 else{$('hxSeasonTitle').textContent=run?'The Run':t.n;$('hxSeasonSub').textContent=run?'Two wins a tier. Three lives.':'';$('hxStatus').textContent=run?`Tier ${c.tier+1} of 7 · ${c.wins}–${c.losses}`:'';$('hubTable').hidden=true;$('btnFullTable').hidden=true;
  $('hubProgPips').innerHTML=Array.from({length:run?2:t.need},(_,k)=>`<i class="${k<c.tierWins?'on':''}${k===c.tierWins?' cur':''}"></i>`+(k<(run?2:t.need)-1?'<i class="line"></i>':'')).join('');$('hubProgTxt').textContent=c.tier===6?`${c.tierWins} of ${run?2:t.need} wins to ${run?'finish the run':'the title'}`:`${c.tierWins} of ${run?2:t.need} wins to move up`;
  const hx=$('hxRun');hx.hidden=!run;if(run){hx.innerHTML=`<div class="label">${c.daily?'Daily run':'Seed'}</div><span>${c.seed||'–'}</span><div class="label">Lives</div><b class="lives">${'♥'.repeat(c.lives||0)}${'♡'.repeat(Math.max(0,3-(c.lives||0)))}</b><div class="label">Hand</div><span>${Object.values(save.perks||{}).reduce((a,v)=>a+(v|0),0)} cards${flushLine()?' ·'+flushLine().replace(' · hand',''):''}</span><span class="help">Draft a card after every match. Rares and legendaries come later in a run.</span>`;}}
 // fixture
 const n=c.next;$('nextOpp').textContent=n.oppName;$('nextPt').innerHTML=portraitImg(oppLookFor(n),n.oppName2||n.oppName,c.tier,'lg');$('hubPick').hidden=true;
 const mk=matchKind(n,c,t);$('nextKind').textContent=run?mk.kind:(sn?(sn.ko?mk.kind:'This week’s fixture'):(n.intro?'Fill-in match':mk.kind));
 const facts=[];facts.push(`Opponent average ≈${n.oppAvg}`);facts.push(`${n.pairs?'Pairs':'Singles'} · best of ${n.legs}${(n.din&&!n.twist)?' · double in':''}`);if(!run&&TRAVEL[c.tier]&&!n.intro){if(c.travelCredit>0)facts.push(`Travel covered by sponsor credit (${c.travelCredit} left)`);else facts.push(`Travel ${money(TRAVEL[c.tier])} · ${c.bank-TRAVEL[c.tier]<0?'you are short by '+money(TRAVEL[c.tier]-c.bank):'balance after '+money(c.bank-TRAVEL[c.tier])}`);}if(!run&&c.bank<0)facts.push(`Owing Kev ${money(-c.bank)} · repaid from winnings`);if(n.pairs)facts.push(`With ${n.mateName} · ${n.myTeam} v ${n.oppTeam}`);if(run&&n.twist)facts.push(n.twist==='301'?'Twist: 301 sprint, every leg starts on 301':'Twist: double in, you must open on a double');if(sn&&!sn.ko&&played){const row=sn.table.find(r=>r.name===n.oppName);if(row){const opos=seasonPos(sn).indexOf(row)+1;facts.push(`${ord(opos)} in the table · ${row.w}–${row.l}`);}}if(SK().scout)facts.push(`Form: ${n.oppAvg>t.avg+1?'hot':n.oppAvg<t.avg-1?'cold':'steady'}`);
 $('nextMeta').innerHTML=facts.map(f=>`<span>${f}</span>`).join('');
 const wb=Math.round(t.purse*.12*(1+SK().prize));
 if(run){const left=2-c.tierWins;$('fixWin').innerHTML=`<b>Win</b>${c.tier>=6?(left===1?'run complete':'promotion: '+left+' wins needed'):(left===1?'promotion to '+TIERS[c.tier+1].n:'promotion: '+left+' wins needed')}`;$('fixLoss').innerHTML=`<b>Lose</b>a life (${'♥'.repeat(c.lives||0)} left)`;$('fixSub').textContent=n.decider?'Mini boss: best of 3 against the strongest player in the room. Beat them to move up.':'One leg. Win it to move on, draft a card either way.';}
 else if(n.intro){$('fixWin').innerHTML=`<b>Win</b>a place in the team`;$('fixLoss').innerHTML=`<b>Lose</b>Jonno still gets you a beer`;$('fixSub').textContent='Thursday pub league at the Kauri. Jonno is a player short.';}
 else if(sn&&sn.ko){$('fixWin').innerHTML=`<b>Win</b>${sn.week===sn.len?'world champion · '+money(t.purse*4):'next round · '+money(wb)}`;$('fixLoss').innerHTML=`<b>Lose</b>out until next year`;$('fixSub').textContent='Straight knockout.';}
 else{$('fixWin').innerHTML=`<b>Win</b>+2 points · <em>${money(wb)}</em>`;$('fixLoss').innerHTML=`<b>Deciding-leg loss</b>+1 point`;$('fixSub').textContent=sn&&sn.week===sn.len?'Last fixture of the season. Top two go up.':(sn&&!sn.side?'You still have a spare night this week if you want it first.':'');}
 $('btnPlayNext').innerHTML=`Walk on<small>${mk.kind}</small>`;$('nextStakes').innerHTML=`<span>${mk.what}</span><b>${mk.stakes}</b>`;
 $('hubRival').hidden=!(n.rival&&!run);$('hubRival').textContent=`Rival: ${RIVAL.name} · ${c.rivalW||0}–${c.rivalL||0} against you`;
 // spare night
 const used=!!(sn&&sn.side);const spareOn=!!sn||run;$('localInfo').textContent=`${money(Math.max(15,Math.round(lt.purse*.15)))} for a win`;$('btnLocal').hidden=run;$('btnMoney').hidden=run;$('practiceInfo').textContent=run?'No nerves. No XP or arm growth in the Run.':'Arm and attributes grow, no nerves, no record.';$('moneyInfo').textContent=`${money(MM_PAY[c.tier]||30)} for a win at the Kauri · they average about ${TIERS[c.tier].avg-1}`;
 ['btnLocal','btnPractice','btnMoney'].forEach(id=>{$(id).disabled=used;});
 $('spareAvail').textContent=run?'Any time':(used?'Used this week':'1 available this week');$('spareAvail').classList.toggle('used',used);
 $('spareHint').textContent=run?'Practice is free in the Run; it changes nothing.':(used?`Used: ${sn.sideKind||'activity'}. Your next spare night comes after the fixture. Nothing is lost by walking on now; travel still applies.`:'Choose one activity before your next fixture. An unused night is lost when you walk on.');
 $('hubWeekNote').textContent='';{const chips=[];if(!run&&c.strain>0)chips.push(`Arm strain · spread +6% for ${c.strain} fixture${c.strain>1?'s':''}`);if(!run&&c.buffComp)chips.push('Good night out · +1.5 composure next fixture');if(!run&&c.travelCredit>0)chips.push(`Shah Electrical covers ${c.travelCredit} more trip${c.travelCredit>1?'s':''}`);$('hxStatus').textContent+=chips.length?' · '+chips.join(' · '):'';}
 // footer + hidden legacy fields
 $('hubRecord').innerHTML=`${run?'Run record':'Career record'} ${c.wins}–${c.losses} <span class="form">${(c.history||[]).slice(-5).map(r=>`<i class="${r}">${r}</i>`).join('')}</span>`;$('hubAvg').textContent=c.darts?(c.pts/c.darts*3).toFixed(1):'–';const ra=recentAvg(c);$('hubRecent').textContent=ra?ra.toFixed(1):'–';$('hubStreak').textContent=(c.streak||0);
 $('nextInfo').textContent='';$('btnSkills').textContent='Player';
 const ol=$('hubObj');ol.innerHTML=OBJ[c.tier].map(o=>`<li class="${objDone(o.id)?'done':''}"><span>${o.t}</span><small>${o.cash?money(o.cash):'perk'}</small></li>`).join('');
 syncHubAudio();(window.__hubSoft||V.buildVenue(c.tier));showScreen('hub');const tb=tab||(PR.pending?'practice':'play');hubTab(tb);drillBar();if(tb==='practice')renderPractice();if(tb==='player')showPlayer(true);if(tb==='kit')showShop(showShop.tab,true);renderBoard();}
function syncHubAudio(){$('btnHubSound').textContent=AU.on?'Sound on':'Sound off';$('btnHubCaller').textContent=AU.caller?'Caller on':'Caller off';}
function kitStats(){const b=barrel();const p=setupParts();const spread=b.base*(1+p.fl.base)*(1+p.pt.base);const win=b.tol*(1+p.fl.tol)*(1+p.shaft.tol);const sway=b.sway*(1+p.shaft.sway);return {spread,win,sway};}
function showShop(tab,inTab){showShop.tab=tab||showShop.tab||'barrel';$('shopBank').textContent=money(career()?career().bank:0);const ks=kitStats();$('kitImg').src=V.dartShot(save.flight,Object.assign({barrel:barrel()},setupParts()));$('kitName').textContent=barrel().n;$('kitBars').innerHTML=[['Grouping',1-(ks.spread-3.4)/2.6,'tighter is better'],['Release window',(ks.win-.55)/.6,'wider forgives timing'],['Steadiness',1-(ks.sway-.55)/.9,'less sway']].map(([n,v,h])=>`<div class="kb"><span>${n}</span><div class="kb-bar"><i style="width:${Math.round(Math.max(.04,Math.min(1,v))*100)}%"></i></div><small>${h}</small></div>`).join('');[...$('kitTabs').children].forEach(bt=>bt.setAttribute('aria-pressed',bt.dataset.t===showShop.tab));['barrel','setup','gear'].forEach(k=>$('kit_'+k).hidden=showShop.tab!==k);if(!inTab&&!(hubTab.cur==='kit'&&!$('hub').hidden)){showScreen('hub');hubTab('kit');}$('shopSponsor').textContent=sponsor()?`Sponsored by ${sponsor().brand} · ${Math.round(sponsor().disc*100)}% off`:'No sponsor yet';const L=$('shopList');L.innerHTML='';BARRELS.forEach(b=>{const own=save.owned.includes(b.id),cur=save.barrel===b.id;const bank=career()?career().bank:0;
 const el=document.createElement('button');el.type='button';el.className='opt'+(!own&&bank<price(b.price)?' locked':'');el.setAttribute('aria-pressed',cur);
 let bimg='';try{bimg=V.dartShot(save.flight,Object.assign({},setupParts(),{barrel:b}));}catch(e){}el.classList.add('bopt');el.innerHTML=`<span class="n">${bimg?`<img class="bimg" src="${bimg}" alt="">`:''}<em>${b.n.match(/\d+g/)[0]}</em></span><span><div class="t">${b.n}</div><div class="s">${b.s}<br>Spread ${b.base} · window ${b.tol} · sway ${b.sway}</div></span><span class="price ${own?'own':''}">${own?(cur?'Equipped':'Owned'):money(price(b.price))}<small>${own?'':'buy'}</small></span>`;
 el.onclick=()=>{if(own){save.barrel=b.id;}else if(career()&&career().bank>=price(b.price)){career().bank-=price(b.price);save.owned.push(b.id);save.barrel=b.id;noiseBurst({dur:.08,freq:3000,q:3,gain:.15});}else return;persist();showShop();};L.appendChild(el);});
 swatches('swFlight2',FLIGHTS.concat((window.C3&&C3.lvFlights?C3.lvFlights():[]).filter(c=>!FLIGHTS.includes(c))),save.flightCustom?save.flight:null,v=>{save.flight=v;save.flightCustom=true;persist();V.setPlayerLook(save.look,save.flight);showShop();});
 const SU=$('setupList');SU.innerHTML='';const bank0=career()?career().bank:0;[['shaft',SHAFTS,'Shafts'],['flight',FSHAPES,'Flight shapes'],['point',POINTS,'Points']].forEach(([key,list,title])=>{const h=document.createElement('div');h.className='label';h.textContent=title;SU.appendChild(h);list.forEach(it=>{const own=(save.ownedSetup||[]).includes(key+':'+it.id)||it.price===0;const cur=(save.setup||{})[key]===it.id;const el=document.createElement('button');el.type='button';el.className='opt'+(!own&&bank0<price(it.price)?' locked':'');el.setAttribute('aria-pressed',cur);el.innerHTML=`<span class="n"></span><span><div class="t">${it.n}</div><div class="s">${it.s}</div></span><span class="price">${own?(cur?'Using':'Owned'):money(price(it.price))}<small>${own?'':'buy'}</small></span>`;el.onclick=()=>{if(!own){if(!career()||career().bank<price(it.price))return;career().bank-=price(it.price);save.ownedSetup=(save.ownedSetup||[]).concat(key+':'+it.id);noiseBurst({dur:.08,freq:3000,q:3,gain:.15});}save.setup=Object.assign({},save.setup||{},{[key]:it.id});persist();V.setPlayerLook(save.look,save.flight,save.name,career()?career().tier:0);showShop();};SU.appendChild(el);});});
 const G=$('gearList');G.innerHTML='';GEAR.forEach(it=>{const cnt=gearCount(it.id);const max=it.rep||1;const owned=cnt>=max;const bank=career()?career().bank:0;const el=document.createElement('button');el.type='button';el.className='opt'+(!owned&&bank<it.price?' locked':'');el.setAttribute('aria-pressed',owned);el.innerHTML=`<span class="n">${it.rep?cnt+'/'+max:(owned?'✓':'')}</span><span><div class="t">${it.n}</div><div class="s">${it.s}</div></span><span class="price">${owned?'Owned':money(it.price)}<small>${owned?'':'buy'}</small></span>`;el.onclick=()=>{if(owned||!career()||career().bank<it.price)return;career().bank-=it.price;save.gear=save.gear||{};save.gear[it.id]=cnt+1;noiseBurst({dur:.08,freq:3000,q:3,gain:.15});persist();showShop();};G.appendChild(el);});}
function showPlayer(inTab){const c=career()||{wins:0,losses:0,best:{visit:0,hf:0,avg:0,leg:99,tons:0,t180:0}};$('plName').textContent=save.name||'You';$('plPerkCount').textContent=Object.values(save.perks||{}).reduce((a,v)=>a+(typeof v==='number'?v:(v?1:0)),0);$('plPt').innerHTML=portraitImg(save.look,save.name,c.tier||0,'lg');$('plEarn').textContent=c.run?'♥'.repeat(c.lives||0):money(c.earned||c.bank||0);$('plEarn').previousElementSibling.textContent=c.run?'Lives':'Career earnings';$('plTier').textContent=c.tier!=null?TIERS[c.tier].n:'';
 $('plAttrs').innerHTML=ATTRS.map(a=>attrRow(a)+`<details class="ar-d"><summary>${a.per}</summary><p class="help ar-s">${a.s}</p></details>`).join('');
 if(isRun()){renderHand($('plPerks'));}else{const owned=PERKS.filter(p=>has(p.id));const host=$('plPerks');host.innerHTML='';if(owned.length){const row=document.createElement('div');row.className='hand-row';owned.forEach(p=>row.appendChild(cardEl(p,{small:true})));host.appendChild(row);}else host.innerHTML='<p class="help">No perks yet. Hit a feat in a match to earn a draft.</p>';if(false)host.innerHTML=owned.length?owned.map(p=>`<div class="pk on r-${p.r} ${p.x?'key':''}"><em class="gl">${PERK_GLYPH[p.id]||'•'}</em><b>${p.n}${p.r==='c'?' <i>'+['','I','II','III','IV','V'][plv(p.id)]+'</i>':''}</b><span>${p.s}</span><small>${PERK_R[p.r]}${p.x?' · '+PERK_X[p.x]:''}</small></div>`).join(''):(isRun()?'<p class="help">No perks yet. You draft one after every match.</p>':'<p class="help">No perks yet. Hit a feat in a match to earn a draft.</p>');
 const locked=PERKS.filter(p=>!has(p.id)&&perkLocked(p));if(locked.length)$('plPerks').innerHTML+=locked.map(p=>`<div class="pk lock"><b>${p.n}</b><span>Locked by your ${PERK_X[p.x]} choice.</span></div>`).join('');}
 $('plPick').hidden=true;{let box=$('plAch');if(!box){box=document.createElement('div');box.id='plAch';box.className='card ach-card';const sec=document.querySelector('.htab[data-t="player"]');const anchor=$('plStats')&&$('plStats').parentNode;if(sec&&anchor)anchor.parentNode.insertBefore(box,anchor.nextSibling);}if(box)box.innerHTML=achGridHTML();}
 $('plFeats').parentNode.hidden=isRun();{const c2=career()||{};$('plRival').hidden=isRun();$('plRival').textContent=`Rival: ${RIVAL.name} · ${c2.rivalW||0}–${c2.rivalL||0} against you`+(sponsor()?` · Sponsor: ${sponsor().brand} (${money(sponsor().perMatch)} a fixture)`:'');}$('plFeats').innerHTML=FEATS.map(f=>{const [k,t]=featProg(f);const d=featDone(f.id);return `<li class="${d?'done':''}"><div class="ft"><b>${f.n}</b><span>${f.s}</span></div><div class="fp"><i style="width:${(k*100).toFixed(0)}%"></i></div><small>${t}</small></li>`;}).join('');
 {const sec=document.querySelector('.htab[data-t="player"]');const run=isRun();if(sec)sec.classList.toggle('run',run);const lab=$('plStats').parentNode.querySelector('.label');if(lab)lab.textContent=run?'This run':'Career';const pl=$('plPerks').parentNode.querySelector('.label');if(pl)pl.textContent=run?'Your hand':'Perks';const ob=$('hubObj');if(ob)ob.parentNode.hidden=run;{const rv=$('plRival');if(rv)rv.style.display=run?'none':'';}
  if(run){const cnt=su=>(typeof suitCount==='function'?suitCount(su):0);const b=c.best||{};const seed=String(c.seed||'').replace(/^r/,'');$('plEarn').classList.remove('brass');
   $('plStats').innerHTML=[['Match',`${(c.wins||0)+(c.losses||0)+1}`],['Lives',`${c.lives||0} / 3`],['Record',`${c.wins||0}–${c.losses||0}`],['Run avg',c.darts?(c.pts/c.darts*3).toFixed(1):'–'],['Hand',['c','d','s','h'].map(su=>RSUIT[su].g+cnt(su)).join(' ')],['Best visit',b.visit||'–'],['High finish',b.hf||'–'],['Seed',seed?seed.slice(0,8):'–']].map(([n,v])=>`<div class="stat"><span>${n}</span><b>${v}</b></div>`).join('');$('plStats').classList.remove('fresh');if(!inTab){showScreen('hub');hubTab('player');}return;}else $('plEarn').classList.add('brass');}
 const b=c.best||{};$('plStats').innerHTML=[['Record',`${c.wins}–${c.losses}`],['Career avg',c.darts?(c.pts/c.darts*3).toFixed(1):'–'],['Best match avg',b.avg?b.avg.toFixed(1):'–'],['High finish',b.hf||'–'],['Best leg',b.leg<99?b.leg+' darts':'–'],['Best visit',b.visit||'–'],['v Deano',(c.wins+c.losses)===0?'–':`${c.rivalW||0}–${c.rivalL||0}`],['Arm',save.arm.toFixed(1)+' / 10']].concat(save.antKiller?[['Trophy',`🪰 Ant Killer${save.trophies&&save.trophies.fly>1?' ×'+save.trophies.fly:''}`]]:[]).map(([n,v])=>`<div class="stat${v==='–'?' nil':''}"><span>${n}</span><b>${v}</b></div>`).join('')+((c.wins+c.losses)===0?'<div class="stat pl-fresh"><b>Your numbers start here</b><span>Play your first fixture to record an average, high finish and best visit.</span></div>':'');$('plStats').classList.toggle('fresh',(c.wins+c.losses)===0);
 if(!inTab){showScreen('hub');hubTab('player');}}
function showPerkPick(done,n,L){const c=career();const boost=!!(c&&c.featBoost);const lost=!!(L&&!L.won);const run=!!(c&&c.run);let offer=draftCards(n||3,boost,lost);if(!offer.length)return done&&done();
 window._perkDone=done||null;const rr=run?(SK().reroll||0):0;const freeKey=run?'run':(c&&c.season?'season':'');const freeOk=!!(c&&freeKey&&!(run?c.freeReroll:(c.season&&c.season.freeReroll)));let rerolls=rr+(freeOk?1:0);
 const render=()=>{$('perkWhy').textContent=run?((L&&L.opening)?'Opening hand. Pick one of '+offer.length:(lost?'Lost a life. Draft one of '+offer.length:'Won. Draft one of '+offer.length)):(L&&L.won?'Won. Pick one of '+offer.length:(L?'Lost. Pick one of '+offer.length:'Pick one'));
  $('perkCount').innerHTML=run?((L&&L.opening)?'Your starting card. Suits stack: three of one suit is a flush bonus.':`Lives ${'♥'.repeat(Math.max(0,c.lives||0))}${'♡'.repeat(Math.max(0,3-(c.lives||0)))} · card ${(c.drafts||0)+1} of the run${flushLine()}`):(boost?'A feat this match: a rare card is more likely.':'Commons stack up to level 5. Rares once. Keystones lock their group.');
  $('btnPerkLater').textContent=run?'Skip this draft':'Skip · no perk this time';document.querySelector('#perk .res-win').textContent=run?'Draft a card':'Pick a perk';$('btnPerkReroll').hidden=!(rerolls>0);$('btnPerkLater').hidden=!!(L&&L.opening);$('btnPerkReroll').textContent=rerolls>rr?(rr>0?`Reroll · ${rerolls} left`:`Reroll all · free once per ${run?'run':'season'}`):`Reroll · ${rerolls} left`;
  const host=$('perkCards');host.innerHTML='';host.classList.add('deck');host.style.gridTemplateColumns=(!run&&window.innerWidth>700&&offer.length>3)?('repeat('+offer.length+',1fr)'):'';
  offer.forEach((p,i)=>{let el;el=cardEl(p,{pick:true});el.style.animationDelay=(i*70)+'ms';
   el.onclick=()=>{if(host.dataset.lock)return;host.dataset.lock='1';el.classList.add('taken');[...host.children].forEach(o=>{if(o!==el)o.classList.add('fade');});applyCardPick(p);sfxLevel();setTimeout(()=>{host.dataset.lock='';window._perkDone=null;done?done():showHub('player');},520);};host.appendChild(el);});};
 $('btnPerkReroll').onclick=()=>{if(rerolls<=0)return;if(rerolls>rr&&c){if(run)c.freeReroll=true;else if(c.season)c.season.freeReroll=true;persist();}rerolls--;if(c)c.rerolls=(c.rerolls||0)+1;offer=draftCards(n||3,boost,lost);render();};
 $('perkFlush').hidden=!run;$('perkKeyHelp').hidden=run;render();showScreen('perk');}
function flushLine(){const parts=['c','d','s','h'].map(su=>{const k=suitCount(su);return k?`${RSUIT[su].g}${k}`:'';}).filter(Boolean);return parts.length?' · hand '+parts.join(' '):'';}
function renderHand(host){const owned=RUN_CARDS.filter(p=>has(p.id));host.innerHTML='';if(!owned.length){host.innerHTML='<p class="help">No cards yet. You draft one after every match.</p>';return;}
 const bySuit={c:[],d:[],s:[],h:[],w:[]};owned.forEach(p=>bySuit[p.su||'w'].push(p));
 Object.entries(bySuit).forEach(([su,list])=>{if(!list.length)return;const S_=RSUIT[su];const ft=su!=='w'?flushTier(su):0;const sec=document.createElement('div');sec.className='hand-suit';sec.innerHTML=`<div class="hand-h" style="--su:${S_.col}"><b>${S_.g} ${S_.n}</b><span>${suitCount(su)} card${suitCount(su)===1?'':'s'}${su!=='w'?(ft?` · flush ${ft===2?'II':'I'}: ${FLUSH[su].t}${ft===2?' ×2':''}`:` · ${3-suitCount(su)} more for a flush`):''}</span></div><div class="hand-row"></div>`;const row=sec.querySelector('.hand-row');list.forEach(p=>row.appendChild(cardEl(p,{small:true})));host.appendChild(sec);});}
function swatches(id,list,cur,fn){const w=$(id);w.innerHTML='';list.forEach(v=>{const b=document.createElement('button');b.type='button';b.className='sw';b.style.background=v;b.setAttribute('aria-pressed',v===cur);b.setAttribute('aria-label',v);b.onclick=()=>fn(v);w.appendChild(b);});}
/* S3 CREATOR (Overseer 08:40): under TOPS_S3FLAG the Look step builds a Vinyl player: pick one of the 5 bases (Ray, Kai, Tama, Dazza, Mia),
   then skin tone, build, hair style + colour, facial hair, accessories (glasses, sweatband, cap) and shirt colour. Saved as Career's
   save.vlook={v:1,base,skin,hair,hairC,face,faceC,acc:[],shirt,at}; a new base clears the changes made on the old one. The old fields hide. */
const S3C_HAIR=window.TOPS_V2FLAG?[['short','Short'],['buzz','Buzz'],['quiff','Quiff'],['curly','Curly'],['mullet','Mullet'],['horseshoe','Swept'],['ponytail','Bun'],['bald','Bald']]:[['short','Short'],['buzz','Buzz'],['quiff','Quiff'],['mullet','Mullet'],['horseshoe','Receding'],['ponytail','Ponytail'],['bald','Bald']],
 S3C_FACE=[['clean','Clean'],['stubble','Stubble'],['full','Full beard'],['goatee','Goatee'],['walrus','Moustache']],
 S3C_BODY=[['skinny','Slim'],['standard','Standard'],['heavy','Big'],['muscle','Muscle'],['female','Female']],
 S3C_ACC=[['glasses','Glasses'],['band','Sweatband'],['cap','Cap']],
 S3C_SHIRT=['#7a1f2b','#c9352d','#e0a21c','#3f7f3f','#0e7c86','#274a7a','#5b2a86','#2a2b33','#f2f2f2'];
function s3vlook(){if(!save.vlook||typeof save.vlook!=='object'){const lb=save.look&&(save.look.s3base||(save.look.s3&&save.look.s3.base));save.vlook={v:1,base:(lb&&(window.TOPS_S3_LABLOOKS||{})[lb])?lb:'dazza',acc:[],at:Date.now()};}if(!Array.isArray(save.vlook.acc))save.vlook.acc=[];return save.vlook;}
function s3Creator(refresh){const sec=document.querySelector('#creator .cx-sec[data-s="look"]');if(!sec)return;
 [...sec.querySelectorAll(':scope > .field')].forEach(f=>{if(!f.querySelector('#cName'))f.hidden=true;});
 let box=$('s3Cre');if(!box){box=document.createElement('div');box.id='s3Cre';sec.appendChild(box);}box.hidden=false;
 const V3=s3vlook(),B=(window.TOPS_S3_LABLOOKS||{})[V3.base]||{};const hex=c=>c==null?null:(typeof c==='number'?'#'+c.toString(16).padStart(6,'0'):String(c)).toLowerCase();
 const cur={skin:hex(V3.skin??B.skin),hair:V3.hair||B.hair||'bald',hairC:hex(V3.hairC??B.hairC),face:V3.face||B.face||'clean',body:V3.body||B.body,shirt:hex(V3.shirt??B.shirt),acc:V3.acc.length||V3.accSet?V3.acc:[B.glasses&&'glasses',B.band&&'band',window.TOPS_V2FLAG&&B.cap&&'cap'].filter(Boolean)};
 const set=(k,v)=>{const o=s3vlook();o[k]=v;if(k==='hairC'&&o.faceC==null)o.faceC=v;o.at=Date.now();persist();refresh();};
 const seg=(lab,opts,val,fn,extra)=>`<div class="field"><span class="label">${lab}</span><div class="seg char-pick${extra||''}">`+opts.map(([v,t])=>`<button type="button" data-f="${fn}" data-v="${v}" aria-pressed="${Array.isArray(val)?val.includes(v):String(val)===String(v)}">${t}</button>`).join('')+'</div></div>';
 const sw=(lab,list,val,fn)=>`<div class="field"><span class="label">${lab}</span><div class="swatches">`+list.map(c=>`<button type="button" class="sw" data-f="${fn}" data-v="${c}" style="background:${c}" aria-label="${c}" aria-pressed="${String(val).toLowerCase()===c.toLowerCase()}"></button>`).join('')+'</div></div>';
 const bases=(window.TOPS_S3_BASES||[]);const O=window.TOPS_S3_OPTIONS||{};
 box.innerHTML=`<div class="field"><span class="label">Player</span><div class="s3c-bases">`+bases.map(b=>`<button type="button" class="s3c-base" data-f="base" data-v="${b.id}" aria-pressed="${b.id===V3.base}"><i data-pt="${b.id}"></i><b>${b.name}</b><small>${b.tag}</small></button>`).join('')+'</div></div>'
  +sw('Skin tone',O.skin||[],cur.skin,'skin')+seg('Build',S3C_BODY,cur.body,'body')+seg('Hair',S3C_HAIR,cur.hair,'hair',' wrap')+sw('Hair colour',O.hairC||[],cur.hairC,'hairC')
  +seg('Facial hair',S3C_FACE,cur.face,'face',' wrap')+seg('Extras',S3C_ACC,cur.acc,'acc')+sw('Shirt',S3C_SHIRT,cur.shirt,'shirt');
 box.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const f=b.dataset.f,v=b.dataset.v;
  if(f==='base'){save.vlook={v:1,base:v,acc:[],at:Date.now()};/* keep Experience's base stamp in step */try{if(save.look&&typeof save.look==='object'){save.look.s3base=v;save.look.s3={base:v};}}catch(e){}persist();refresh();return;}
  if(f==='acc'){const o=s3vlook();let a=o.accSet?o.acc.slice():cur.acc.slice();a=a.includes(v)?a.filter(x=>x!==v):a.concat(v);o.acc=a;o.accSet=true;o.at=Date.now();persist();refresh();return;}
  set(f,v);});
 /* small portraits of the five bases (cached by the portrait renderer), filled after the preview so the sheet opens at once */
 clearTimeout(s3Creator.t);s3Creator.t=setTimeout(()=>{box.querySelectorAll('[data-pt]').forEach(i=>{if(i.firstChild)return;try{const u=V.portrait({s3:{base:i.dataset.pt}},'S3 '+i.dataset.pt,0);if(u)i.innerHTML=`<img src="${u}" alt="">`;}catch(e){}});},250);}
(function(){try{const st=document.createElement('style');st.textContent='#s3Cre .s3c-bases{margin-bottom:10px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}#s3Cre .s3c-base{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;min-height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:inherit;font:inherit}#s3Cre .s3c-base[aria-pressed="true"]{border-color:var(--gold,#e8c15a);background:rgba(232,193,90,.14)}#s3Cre .s3c-base i{display:block;width:100%;aspect-ratio:1;border-radius:8px;overflow:hidden;background:rgba(0,0,0,.25)}#s3Cre .s3c-base img{width:100%;height:100%;object-fit:cover;display:block}#s3Cre .s3c-base b{font-size:13px}#s3Cre .s3c-base small{font-size:11px;opacity:.75;line-height:1.1;text-align:center}';document.head.appendChild(st);}catch(e){}})();
function showCreator(editing){const L=save.look;$('cName').value=save.name||'';{const host=$('prefDbl');if(host){const opts=[20,16,18,12,10,8,'BULL'];host.innerHTML=opts.map(o=>`<button type="button" data-v="${o}" aria-pressed="${String(o)===String(prefDbl())}">${o==='BULL'?'Bull':'D'+o}</button>`).join('');[...host.children].forEach(b=>b.onclick=()=>{save.prefDbl=b.dataset.v==='BULL'?'BULL':+b.dataset.v;persist();[...host.children].forEach(x=>x.setAttribute('aria-pressed',x===b));});}}
 const CHAR_N={brian:'Brian',bryce:'Bryce',pete:'Pete',lewis:'Lewis',david:'David',leonard:'Leo',megan:'Megan',elizabeth:'Liz',remy:'Classic'};
 const refresh=()=>{if(window.TOPS_S3FLAG)try{s3Creator(refresh);}catch(e){console.warn('s3 creator',e);}else if($('s3Cre'))$('s3Cre').hidden=true;V.setPlayerLook(save.look,save.flight,$('cName').value.trim()||save.name||'YOU',career()?career().tier:0);
  {const host=$('segChar');if(host){const cur=V.charKey(L,$('cName').value.trim()||save.name);host.innerHTML=V.chars.map(k=>`<button type="button" data-v="${k}" aria-pressed="${k===cur}">${CHAR_N[k]}</button>`).join('');[...host.children].forEach(b=>b.onclick=()=>{L.model=b.dataset.v;persist();refresh();});}
   {const isClassic=V.charKey(L,$('cName').value.trim()||save.name)==='remy';['swSkin','segHair','segBeard'].forEach(id=>{const f=$(id)&&$(id).closest('.field');if(f)f.hidden=!!host&&!isClassic;});}/* v0.42: shirt colour always pickable (rigged shirts use it), so unlocked shirts can be worn */{const f=$('swShirt')&&$('swShirt').closest('.field');if(f){f.hidden=false;const lb=f.querySelector('.label');if(lb)lb.textContent='Shirt colour';}}}
  {const seg=(id,opts,get,set)=>{const h=$(id);if(!h)return;h.innerHTML=opts.map(([v,t])=>`<button type="button" data-v="${v}" aria-pressed="${String(get())===String(v)}">${t}</button>`).join('');[...h.children].forEach(b=>b.onclick=()=>{set(b.dataset.v);persist();refresh();});};
   seg('segKit',[['','Plain']].concat(Object.entries(window.TOPS_KITS||{}).map(([k,v])=>[k,v.n])),()=>L.kit||'',v=>{L.kit=v||null;});seg('segHair2',[['own','Own'],['bald','Bald'],['short','Short'],['shaggy','Shaggy'],['curly','Curly'],['long','Long'],['pony','Pony']],()=>L.hair2||'own',v=>L.hair2=v);
   const sw=(id,list,get,set)=>{const w=$(id);if(!w)return;w.innerHTML='';list.forEach(([v,c])=>{const b=document.createElement('button');b.type='button';b.className='sw';b.style.background=c;if(!v){b.style.background='linear-gradient(135deg,#888 45%,#e8382c 46%,#e8382c 54%,#888 55%)';b.title='Natural';}b.setAttribute('aria-pressed',(get()||'')===v);b.onclick=()=>{set(v||null);persist();refresh();};w.appendChild(b);});};
   sw('swHair2',[['',''],['#141010','#141010'],['#3b2a1d','#3b2a1d'],['#6b4a2a','#6b4a2a'],['#a8783a','#a8783a'],['#e0c080','#e0c080'],['#8a3a1a','#8a3a1a'],['#a0a0a0','#a0a0a0']],()=>L.hairCol,v=>L.hairCol=v);
   sw('swSkin2',[['',''],['#fff0e6','#f2d6c4'],['#e6c4a8','#d8ac88'],['#c89a78','#b07c58'],['#9a6e50','#8a5a3c'],['#6e4a34','#5a3a28']],()=>L.skinTone,v=>L.skinTone=v);
   const ex=$('segExtra');if(ex){const opts=[['beard2','Beard'],['g1','Round specs'],['g2','Square specs'],['cap','Cap']];const on=k=>k==='g1'?L.glasses===1:k==='g2'?L.glasses===2:!!L[k];ex.innerHTML=opts.map(([k,t])=>`<button type="button" data-v="${k}" aria-pressed="${on(k)}">${t}</button>`).join('');[...ex.children].forEach(b=>b.onclick=()=>{const k=b.dataset.v;if(k==='g1')L.glasses=L.glasses===1?0:1;else if(k==='g2')L.glasses=L.glasses===2?0:2;else L[k]=L[k]?0:1;persist();refresh();});}}swatches('swSkin',SKINS,L.skin,v=>{L.skin=v;refresh();});swatches('swHair',HAIRS,L.hair,v=>{L.hair=v;refresh();});swatches('swShirt',SHIRTS,L.shirt,v=>{L.shirt=v;L.shirtTint=true;persist();refresh();});swatches('swFlight',FLIGHTS,save.flight,v=>{save.flight=v;save.flightCustom=true;refresh();});
  [...$('segHair').children].forEach(b=>{b.setAttribute('aria-pressed',b.dataset.v===L.hairStyle);b.onclick=()=>{L.hairStyle=b.dataset.v;refresh();};});[...$('segBeard').children].forEach(b=>{b.setAttribute('aria-pressed',+b.dataset.v===L.beard);b.onclick=()=>{L.beard=+b.dataset.v;refresh();};});
  const cb=$('cBarrels');cb.innerHTML='';BARRELS.filter(b=>save.owned.includes(b.id)).forEach(b=>{const el=document.createElement('button');el.type='button';el.className='opt';el.setAttribute('aria-pressed',save.barrel===b.id);el.innerHTML=`<span class="n">${b.n.match(/\d+g/)[0]}</span><span><div class="t">${b.n}</div><div class="s">${b.s}</div></span><span></span>`;el.onclick=()=>{save.barrel=b.id;refresh();};cb.appendChild(el);});if(window.TOPS_S3FLAG){const sec=document.querySelector('#creator .cx-sec[data-s="look"]');if(sec)[...sec.querySelectorAll(':scope > .field')].forEach(f=>{if(!f.querySelector('#cName'))f.hidden=true;});}};
 refresh();clearTimeout(showCreator.t);$('cName').oninput=()=>{clearTimeout(showCreator.t);showCreator.t=setTimeout(refresh,400);};$('btnCreate').textContent=editing?'Save':"That's me";$('cxTitle').textContent=editing?'Edit your look':'Create your player';$('btnCreatorBack').hidden=!editing;$('btnCreatorBack').onclick=()=>{V.preview(false);showHub('player');};[...$('cxSteps').children].forEach(bt=>bt.onclick=()=>{[...$('cxSteps').children].forEach(x=>x.setAttribute('aria-pressed',x===bt));document.querySelectorAll('#creator .cx-sec').forEach(sec=>sec.hidden=sec.dataset.s!==bt.dataset.s);});$('btnCreate').onclick=()=>{save.name=$('cName').value.trim()||'You';persist();V.preview(false);if(editing)showHub();else{newCareer();showMsg(STORY.intro,act=>{playNext();});}};V.buildVenue(0);showScreen('creator');}
function afterResult(L){if(ui.mode!=='career'){openMultiplayer();return;}
 if(!L)return;   /* ENG-4: a second Continue after the match was already handed on (S is null by then) has nothing to do */
 const a=L.after;if(L.objMsg){const m=L.objMsg;L.objMsg=null;showMsg(m,()=>afterResult(L));return;}
 if(L.rivalMsg){const m=L.rivalMsg;L.rivalMsg=null;showMsg(m,()=>afterResult(L));return;}
 if(L.flavour){const m=L.flavour;L.flavour=null;showMsg(m,()=>afterResult(L));return;}
 if(L.draftN&&!L.pickShown){L.pickShown=true;showPerkPick(()=>afterResult(L),L.draftN,L);return;}
 if(a==='stay'){const c=career();const sn=c.season;const sp=sponsor();const drop=sp&&sn&&sn.pos>Math.ceil(sn.len/2);showMsg(chapterMsg(c.tier,'stay'),()=>{if(drop){save.sponsor=null;persist();showMsg({from:sp.from,lines:[`${sp.brand} here. We\u2019ve reviewed the season.`,'We\u2019re pausing the deal. Keep the darts. Call us when the table looks different.'],replies:[['Fair','ok']]},()=>showHub());}else showHub();});return;}
 if(a==='out'){const c=career();showMsg(chapterMsg(6,'stay'),()=>showHub());return;}
 if(a==='koNext'){showHub();return;}
 if(a==='runpromo'){const c=career();showMsg({from:'Jonno',lines:[`Tier cleared. ${TIERS[c.tier].n} next.`,`${'♥'.repeat(c.lives||0)} ${c.lives===1?'life':'lives'} left. Keep drafting.`],replies:[['On it','ok']]},()=>showHub());return;}
 if(a==='runwin'){const c=career();showMsg({from:'Jonno',lines:[`You ran the table. ${c.wins}–${c.losses}, ${c.drafts||0} perks, ${'♥'.repeat(c.lives||0)} left.`,'That’s a complete run. Start another and chase a cleaner one.'],replies:[['Done','ok']]},()=>{runOver(true);switchSlot('career');showTitle();});return;}
 if(a==='runover'){const c=career();showMsg({from:'Jonno',lines:[`That’s the run. ${TIERS[c.tier].n}, ${c.wins} wins, ${c.drafts||0} perks drafted.`,'Back to the Kauri when you want another go.'],replies:[['Done','ok']]},()=>{runOver();switchSlot('career');showTitle();});return;}
 if(a==='intro'){showMsg(L.won?STORY.afterIntroWin:STORY.afterIntroLoss,()=>showMsg(chapterMsg(0,'start'),()=>showHub()));}
 else if(a==='promo'){const c=career();showMsg(chapterMsg(c.tier-1,'up'),()=>showMsg(chapterMsg(c.tier,'start'),()=>offerSponsors(()=>showHub())));}
 else if(a==='champion'){showMsg(STORY.champion,()=>showHub());}
 else if(a==='money'){showHub();}
 else if(a==='title'||!career()){showTitle();}
 else showHub();}

// ===== BANTER (sledging from the oche) =====
function banter(text,who){const el=$('banter');$('banterWho').textContent=who;$('banterTxt').textContent=text;const sp=V.oppScreen();el.classList.toggle('far',!sp);if(sp){el.style.left=Math.min(innerWidth-el.offsetWidth-10,Math.max(10,sp.x+20))+'px';el.style.top=Math.max(60,sp.y-90)+'px';}else{el.style.left='';el.style.top='';}el.classList.add('show');clearTimeout(banter.t);banter.t=setTimeout(()=>el.classList.remove('show'),2600);
 if(text.indexOf('cough')>=0){noiseBurst({dur:.09,freq:420,q:.8,gain:.35});noiseBurst({dur:.07,freq:380,q:.8,gain:.25,delay:.14});}
 else if(text.indexOf('laugh')>=0||text.indexOf('snigger')>=0||text.indexOf('Ha!')>=0){for(let i=0;i<4;i++)noiseBurst({dur:.06,freq:600,q:1.2,gain:.18,delay:i*.11});}
 else noiseBurst({dur:.05,freq:900,q:2,gain:.08});}
function maybeSledge(){if(!S||S.done||ui.mode!=='career'||S.practice)return;const opp=S.p[1];const tier=ui.tier;const chatty=tier<=1||opp.rival;if(!chatty)return;
 const p=opp.rival?.4:(tier===0?.28:.14);if(Math.random()>p)return;
 const pool=opp.rival?BANTER.rival:(tier===0?BANTER.pub:BANTER.club);const line=pool[Math.floor(Math.random()*pool.length)];
 setTimeout(()=>{if(!S||S.done||S.cur!==0)return;banter(line,opp.name);S.adren+=(opp.rival?.7:.4)*(1+SK().press);},400+Math.random()*900);}
function sledgeOnMiss(h){if(!S||ui.mode!=='career'||S.practice)return;const opp=S.p[1];if(!(opp.rival||ui.tier===0))return;if(h.v>=50||Math.random()>(opp.rival?.5:.2))return;
 const pool=opp.rival?BANTER.rivalMiss:BANTER.pubMiss;banter(pool[Math.floor(Math.random()*pool.length)],opp.name);S.oppArm={phase:'laugh',pull:0,k:0,t0:performance.now()};}
function sledgeOnHit(){if(!S||ui.mode!=='career')return;const opp=S.p[1];if(!opp.rival||Math.random()>.5)return;banter(BANTER.rivalHit[Math.floor(Math.random()*3)],opp.name);}
// opponent celebration after their 180 / finish; player fist pump after ours
function oppCelebrate(big){if(!S)return;S.oppArm={phase:'celebrate',pull:0,k:0,t0:performance.now(),big};S.celebrateUntil=performance.now()+(big?2200:1400);const opp=S.p[1];if(ui.mode==='career'&&(opp.rival||ui.tier===0)){const pool=opp.rival?BANTER.rivalWin:BANTER.pubWin;setTimeout(()=>{if(!S)return;const line=pool[Math.floor(Math.random()*pool.length)];banter(line,opp.name);if(line.indexOf('Shh')===0){S.oppArm={phase:'shush',pull:0,k:0,t0:performance.now()};S.celebrateUntil=performance.now()+1800;}},500);}}
function myCelebrate(){if(!S)return;S.anim={kind:'pump',t0:performance.now(),dur:1200};setTimeout(()=>{if(S&&S.anim&&S.anim.kind==='pump')S.anim=null;},1250);}
// ===== CONFETTI (2D overlay) =====
const fxC=$('fx'),fxX=fxC.getContext('2d');let fxP=[];
function confetti(strength){if(strength<.4)return;const n=Math.round(90*strength);for(let i=0;i<n;i++)fxP.push({x:Math.random()*innerWidth,y:-20-Math.random()*innerHeight*.4,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:Math.random()*6,vr:(Math.random()-.5)*.25,c:['#f0b23a','#ff5c5c','#4cd2ff','#ffffff'][i%4],w:6+Math.random()*4});}
let fxDirty=false;/* #20 (Director 22:10): the full-screen #fx canvas was cleared every frame with nothing on it, which repaints a full-screen layer each frame on iOS; now it's cleared only once after the last particle */
function fxTick(){if(fxC.width!==innerWidth||fxC.height!==innerHeight){fxC.width=innerWidth;fxC.height=innerHeight;fxDirty=false;}if(!fxP.length){if(fxDirty){fxX.clearRect(0,0,fxC.width,fxC.height);fxDirty=false;}return;}fxX.clearRect(0,0,fxC.width,fxC.height);fxDirty=true;
 fxP.forEach(p=>{p.x+=p.vx+Math.sin(p.y/30)*.6;p.y+=p.vy;p.r+=p.vr;fxX.save();fxX.translate(p.x,p.y);fxX.rotate(p.r);fxX.fillStyle=p.c;fxX.fillRect(-p.w/2,-2,p.w,4);fxX.restore();});fxP=fxP.filter(p=>p.y<innerHeight+20);}
// ===== UI =====
function avg(p){return p.darts?p.pts/p.darts*3:0;}function f9(p){return p.f9darts?p.f9pts/p.f9darts*3:0;}function co(p){return p.coAtt?Math.round(p.coHit/p.coAtt*100)+'%':'–';}
function flash(txt,cls,sub){const c=$('callout');c.innerHTML=txt+(sub?`<small>${sub}</small>`:'');c.className='callout show '+(cls||'');clearTimeout(flash.t);flash.t=setTimeout(()=>c.className='callout',/^\d+$/.test(String(txt))?1500:1200);}
function sbMidUpd(){try{const m=$('sbMid');if(!m||!S||!S.p||S.p.length<2)return;const need=Math.ceil(S.bestOf/2);$('sbLegs').textContent=S.p[0].legs+'–'+S.p[1].legs;$('sbFmt').innerHTML=Array.from({length:need*2-1},(_,k)=>{const a=k<S.p[0].legs,o=k>=need*2-1-S.p[1].legs;return `<em class="${a?'a':o?'o':''}"></em>`;}).join('');m.hidden=!!S.practice||S.p.length>2;}catch(e){}}
function updateUI(){sbMidUpd();mpRows().forEach((p,i)=>{const se=$('score'+i);if(se.textContent!==String(p.score)){se.textContent=p.score;se.classList.remove('pop');void se.offsetWidth;se.classList.add('pop');}{const need=Math.ceil(S.bestOf/2);$('legs'+i).innerHTML=Array.from({length:need},(_,k)=>`<i class="${k<p.legs?'on':''}"></i>`).join('');}$('pl'+i).classList.toggle('on',S.p[S.cur]===p&&!S.done);if(i===1&&S.p.length>2){const nm=$('name1');if(nm&&nm.firstChild)nm.firstChild.textContent=p.disp||p.name;}$('sub'+i).textContent=(p.team?p.team+' · ':'')+p.t180+'×180'+(p.coAtt?' · '+p.coHit+'/'+p.coAtt+' doubles':'');{const av=$('avg'+i);if(av){const live=(S.p[S.cur]===p&&S.visit&&!S.done)?S.visit.reduce((x,v)=>x+(v.bust?0:v.v),0):0;const a=p.darts?(p.pts+live)/p.darts*3:0;const par=S.tier&&S.tier.avg;av.querySelector('b').textContent=p.darts?a.toFixed(1):'–';av.classList.toggle('hot',!!(p.darts>=9&&par&&a>=par));}}});if(S.practice){const me=S.p[0];$('name1').firstChild.textContent='Session';$('sub1').textContent='Best visit '+me.bestVisit;$('score1').textContent=avg(me).toFixed(1);$('legs1').innerHTML='';}
 const me=S.p[S.cur];const rt=me.score<=170?route(me.score,4-S.dart):null;
 $('outshot').innerHTML=S.done?'':chipify(S.mateTurn?(me.mate.name+' throwing for you'):(me.ai?(rt?me.name+' on a finish':me.name+' throwing'):planText()));
 {const vt=$('visitTot');const txt=(S.done?'Match over':'Dart '+Math.min(3,S.dart)+' of 3')+(S.visit.length?' · '+S.visit.reduce((a,v)=>a+(v.bust?0:v.v),0)+' · '+me.score+' left':'');if(vt.textContent!==txt){vt.textContent=txt;if(S.visit.length){vt.classList.remove('pop');void vt.offsetWidth;vt.classList.add('pop');}}}
 {const R=S.lastRec;const showPrev=!S.visit.length&&R&&!S.done;const vis=$('visit');vis.classList.toggle('prev',!!showPrev);
  if(showPrev){vis.innerHTML=[0,1,2].map(i=>{const l=R.labels[i];return l?`<span class="chip">${R.bust&&i===R.labels.length-1?'BUST':l}</span>`:'<span class="chip empty">–</span>';}).join('');const vt=$('visitTot');const t=R.bust?`${R.who} · Bust · ${R.cause}`:(R.won?`${R.who} · ${R.tot} out`:`${R.who} · ${R.tot} · ${R.rem} left`);if(vt.textContent!==t)vt.textContent=t;vt.classList.toggle('bust',R.bust);}
  else{$('visitTot').classList.remove('bust');vis.innerHTML=[0,1,2].map(i=>{const v=S.visit[i];if(!v)return '<span class="chip empty">–</span>';return `<span class="chip${(v.label[0]==='T'||v.label==='BULL')&&!v.bust?' gold':''}">${v.bust?'BUST':v.label}</span>`;}).join('');}}}
$('btnQuit').onclick=()=>{const b=$('btnQuit');const comp=S&&!S.done&&ui.mode==='career'&&!S.practice&&!S.intro;if(comp&&b.dataset.armed!=='1'){b.dataset.armed='1';b.textContent='Forfeit?';clearTimeout(b._t);b._t=setTimeout(()=>{b.dataset.armed='';b.textContent='Quit';},2500);return;}b.dataset.armed='';b.textContent='Quit';if(S&&!S.done){S.done=true;if(comp&&career()){const c=career();c.losses++;c.streak=0;if(!S.local&&!S_money){c.next=null;if(c.run){c.lives=(c.lives||1)-1;}}persist();if(c.run&&c.lives<=0){S_money=false;runOver();switchSlot('career');S=null;showTitle();return;}}}S_money=false;const toHub=ui.mode==='career'&&!!career();S=null;if(toHub)showHub();else showTitle();};
$('btnMenu').onclick=()=>{$('hudTr').classList.toggle('open');};$('btnView').hidden=true;V.setSplit(true);
$('btnSound').onclick=()=>{AU.on=!AU.on;$('btnSound').setAttribute('aria-pressed',AU.on);audioInit();if(AU.master)AU.master.gain.setTargetAtTime(AU.on?1:0,AU.ctx.currentTime,.05);persistAudio();};
$('btnCaller').onclick=()=>{AU.caller=!AU.caller;$('btnCaller').setAttribute('aria-pressed',AU.caller);persistAudio();};
$('btnSound').setAttribute('aria-pressed',AU.on);$('btnCaller').setAttribute('aria-pressed',AU.caller);
function syncTitleAudio(){$('btnTSound').setAttribute('aria-pressed',AU.on);$('btnTSound').textContent=AU.on?'Sound on':'Sound off';$('btnTCaller').setAttribute('aria-pressed',AU.caller);$('btnTCaller').textContent=AU.caller?'Caller on':'Caller off';}
$('btnTSound').onclick=()=>{$('btnSound').onclick();syncTitleAudio();};$('btnTCaller').onclick=()=>{$('btnCaller').onclick();syncTitleAudio();};syncTitleAudio();
(function(){const im=$('titleBg');im.onload=()=>{im.hidden=false;};im.onerror=()=>{im.hidden=true;};im.src=(()=>{try{const c=save&&save.career;const t=c&&c.tier!=null?c.tier:0;const k=t<=0?0:t<=1?1:t<=3?2:3;const have=window.TOPS_MENU_ART||[0];try{localStorage.setItem('tops_menuart',String(have.includes(k)?k:0));}catch(e){}return 'img/menu_'+(have.includes(k)?k:0)+'.jpg';}catch(e){return 'img/menu_0.jpg';}})();window.TOPS_setMenuArt=()=>{try{const c=career&&career();const t=c&&c.tier!=null?c.tier:0;const k=t<=0?0:t<=1?1:t<=3?2:3;const have=window.TOPS_MENU_ART||[0];im.src='img/menu_'+(have.includes(k)?k:0)+'.jpg';}catch(e){}};})();
function sceneBg(id){const im=$('sceneBg');if(!im)return;const c=career();const show=(id==='hub'||id==='msg'||id==='perk'||id==='result'||id==='friends')&&(c||id==='friends');const tierFor=c?c.tier:(ui&&ui.venue)||0;if(!show){im.hidden=true;im.dataset.src='';return;}const src='img/v'+Math.max(0,Math.min(6,tierFor||0))+'.jpg';if(im.dataset.src!==src){im.dataset.src=src;im.hidden=true;im.onload=()=>{if(im.dataset.src===src)im.hidden=false;};im.onerror=()=>{im.hidden=true;};im.src=src;}else if(im.complete&&im.naturalWidth)im.hidden=false;}
$('btnCopy').onclick=async()=>{const txt=JSON.stringify(S.log);try{await navigator.clipboard.writeText(txt);$('btnCopy').textContent='Copied';}catch(e){const b=$('copyBox');b.value=txt;b.className='';b.select();try{document.execCommand('copy');$('btnCopy').textContent='Copied';}catch(_){$('btnCopy').textContent='Select and copy below';}}};
$('btnContinue').onclick=()=>{audioInit();if(isRun())switchSlot('career');showHub();};$('btnRun').onclick=()=>{audioInit();if(window.__noGL)return;const r=(save.slots&&save.slots.run&&save.slots.run.career)||null;if(r){switchSlot('run');showHub();}else{startRun();}};$('btnNewRun').onclick=()=>{audioInit();startRun();};
function startRun(){if(!save.name){save.name='You';}const ds=todaySeed();const played=save.daily&&save.daily[ds];showMsg({from:'Jonno',lines:['The Run. Same ladder, no mercy.','Draft a card after every match. Lose three and it’s over. Every third match has a twist: double in, or a 301 sprint.',played?`Today’s daily is done: ${played.won?'complete':'tier '+(played.tier+1)}, ${played.wins} wins. A fresh run has its own seed.`:'Fresh run, or today’s daily: same draw and the same drafts for everyone who plays it today.'],replies:[['Fresh run','fresh'],['Today’s daily','daily']]},act=>{newRun(act==='daily'?ds:null);showPerkPick(()=>playNext(),3,{won:true,opening:true});});}$('btnNewCareer').onclick=()=>{audioInit();showCreator(false);};$('btnFriends').onclick=()=>{audioInit();openMultiplayer();};{const bl=document.getElementById('btnLesson');if(bl)bl.onclick=()=>{audioInit();if(window.__noGL)return;lessonStart();};}
$('btnThrow').onclick=()=>{audioInit();if(window.__noGL)return;if(!save.lessonDone&&(save.totThrows||0)<30){lessonStart();return;}playPractice();};
if(window.__noGL){['btnContinue','btnNewCareer','btnFriends','btnThrow','btnRun','btnNewRun'].forEach(id=>{$(id).disabled=true;});$('noGL').hidden=false;}
$('btnPlayNext').onclick=playNext;feelBindSettle();/* FEEL: hold-to-breathe replaces tap settle */$('btnLocal').onclick=playLocal;$('btnPractice').onclick=playPractice;$('btnMoney').onclick=moneyMatch;$('btnShop').onclick=()=>showHub('kit');$('btnShopBack').onclick=()=>showHub();$('btnLook').onclick=()=>{$('hubPop').hidden=true;showCreator(true);};$('btnHubTitle').onclick=()=>{$('hubPop').hidden=true;if(window.TOPS_USERNAV)TOPS_USERNAV(showTitle);else showTitle();};$('btnHubMenu').onclick=()=>{const p=$('hubPop');p.hidden=!p.hidden;$('btnHubMenu').setAttribute('aria-expanded',!p.hidden);};document.addEventListener('pointerdown',e=>{if(!$('hubPop').hidden&&!e.target.closest('.hx-menu')){$('hubPop').hidden=true;}});$('btnHubSound').onclick=()=>{$('btnSound').onclick();syncHubAudio();syncTitleAudio();};$('btnHubCaller').onclick=()=>{$('btnCaller').onclick();syncHubAudio();syncTitleAudio();};
[...$('kitTabs').children].forEach(bt=>bt.onclick=()=>showShop(bt.dataset.t,true));[...$('hubTabs').children].forEach(bt=>bt.onclick=()=>{hubTab(bt.dataset.t);if(bt.dataset.t==='practice'){if(PR.view&&PR.view.kind==='result')PR.view=null;renderPractice();}if(bt.dataset.t==='player')showPlayer(true);if(bt.dataset.t==='kit')showShop(showShop.tab,true);if(bt.dataset.t==='board')renderBoard();});$('btnSkills').onclick=()=>showHub('player');$('btnSkillsBack').onclick=()=>showHub();$('btnPlPick').onclick=()=>showPerkPick(()=>showHub('player'));$('btnHubPick').onclick=()=>showPerkPick(showHub);$('btnPerkLater').onclick=()=>{$('perk').hidden=true;const d=window._perkDone;window._perkDone=null;if(career()){career().featBoost=false;persist();}if(d)d();else showHub('player');};
$('btnFriendsBack').onclick=()=>{onlineLeave();showTitle();};
$('btnResultNext').onclick=()=>{$('result').hidden=true;if(!S)return;/* ENG-4: the match was already handed on (the reward card's Continue clicks this again) */const last=S;S=null;const rem=!!(last&&last.online&&NET.chan);afterResult(last);if(rem){NET.ready=NET.seat!==0;mpTrack();renderLobby();netStatus(NET.seat===0?'Rematch: start when everyone is ready.':'Ready for the rematch. Waiting for the host.');try{trackEv('rematch');}catch(e){}}};
function resultOnlineButtons(on){const nb=$('btnResultNext');if(!nb)return;let lv=$('btnResLeave');if(on){nb.innerHTML='Rematch · same room<small>Same pros, teams and rules</small>';if(!lv){lv=document.createElement('button');lv.type='button';lv.className='ghost wide';lv.id='btnResLeave';lv.textContent='Leave room';nb.parentNode.insertBefore(lv,nb.nextSibling);lv.onclick=async()=>{$('result').hidden=true;S=null;await onlineLeave();openMultiplayer();};}lv.hidden=false;}else{if(/Rematch/.test(nb.textContent))nb.textContent='Continue';if(lv)lv.hidden=true;}}

// ===== PRACTICE (sprint) =====
const PR={pending:null,view:null};
const DRILLS=[
 {id:'doubles',n:'Doubles ladder',attr:'fi',kick:'Finishing',darts:30,hi:true,
  line:'30 darts. Your double first, then D20, D16, D10, D8. Round and round.',
  how:'Scored on hits out of 30.',feed:'Feeds Finishing. Shows which double costs you.',
  target:i=>{const pd=prefDbl();const c=[pd==='BULL'||pd===50?'BULL':'D'+pd,'D20','D16','D10','D8'];return c[i%5];},
  fmt:v=>v+' / 30',perf:v=>v/15},
 {id:'scoring',n:'Scoring 20s',attr:'sc',kick:'Scoring',darts:30,hi:true,
  line:'30 darts at the treble 20. Nothing else.',
  how:'Scored on 3-dart average.',feed:'Feeds Scoring. Shows which side you miss to.',
  target:()=>'T20',fmt:v=>v.toFixed(1)+' avg',perf:v=>(v-40)/60},
 {id:'rhythm',n:'Release rhythm',attr:'cn',kick:'Consistency',darts:30,hi:false,
  line:'30 darts at one target. Only the release is marked.',
  how:'Scored on median timing error in milliseconds. Lower is better.',feed:'Feeds Consistency. Shows whether you let go early or late.',
  target:()=>'T20',fmt:v=>Math.round(v)+' ms',perf:v=>1-v/150},
 {id:'clock',n:'Round the clock',kick:'Accuracy',soon:true,line:'1 to 20 in order. Fewest darts wins.'},
 {id:'builder',n:'Checkout builder',kick:'Finishing',soon:true,line:'Reachable finishes first. 170 is the advanced tier.'}];
function drillDef(id){return DRILLS.find(d=>d.id===id);}
function drillSave(id){save.drills=save.drills||{};return save.drills[id]||(save.drills[id]={best:null,runs:0});}
function drillRewardOpen(c){return !!(c&&!c.run&&c.season&&!c.season.side);}
function drillTarget(){const D=S.drill;return drillDef(D.id).target(Math.min(D.n,D.max-1));}
function drillAttrName(d){return ATTRS.find(a=>a.id===d.attr).n;}
function startDrill(id){const d=drillDef(id);const c=career();if(!d||d.soon||!c||c.run)return;const rewarded=drillRewardOpen(c);
 beginMatch({mode:'career',tier:c.tier,p0:save.name||'You',oppName:'Drill',oppAvg:0,legs:1,purse:0,practice:true,start:5001});
 S.drill={id,n:0,max:d.darts,darts:[],timings:[],noXP:!rewarded,rewarded};
 $('eventTier').textContent='Drill';$('eventName').textContent=d.n;$('introStakes').textContent=rewarded?d.n+' · rewarded drill this week':d.n+' · retry, best kept, no XP';drillBar();}
function drillLive(D){const d=drillDef(D.id);const n=D.darts.length;if(!n)return '';
 if(D.id==='doubles')return D.darts.filter(x=>x.l===x.t).length+' hits';
 if(D.id==='scoring')return (D.darts.reduce((a,x)=>a+x.v,0)/n*3).toFixed(1)+' avg';
 const e=D.darts.filter(x=>x.tm<-.03).length,l=D.darts.filter(x=>x.tm>.03).length;return `${n-e-l} flush · ${e} early · ${l} late`;}
function drillBar(){const el=$('drillBar');if(!el)return;if(!S||!S.drill){el.hidden=true;return;}const D=S.drill,d=drillDef(D.id);el.hidden=false;const done=D.n>=D.max;
 el.innerHTML=`<b>${d.n}</b><span>${done?'Done':'Dart '+(D.n+1)+' of '+D.max}</span><span>Target <i>${drillTarget()}</i></span>${drillLive(D)?`<span>${drillLive(D)}</span>`:''}`;}
function drillDart(h,x,y){const D=S.drill;if(D.n>=D.max)return;const tgt=drillTarget();const tm=D.timings[D.n];D.darts.push({t:tgt,l:h.label,v:h.v,n:h.n,m:h.m,x:+x,y:+y,tm:tm==null?0:tm});D.n++;drillBar();
 if(D.n>=D.max){S.done=true;const snap=S;setTimeout(()=>{if(S===snap)endDrill();},1700);}}
function median(a){if(!a.length)return 0;const s=a.slice().sort((p,q)=>p-q);const m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;}
function drillResult(D){const d=drillDef(D.id);const ds=D.darts,n=ds.length;let score=0,keys=[],obs='';
 if(D.id==='doubles'){const hits=ds.filter(x=>x.l===x.t).length;const per={};ds.forEach(x=>{per[x.t]=per[x.t]||{t:x.t,a:0,h:0};per[x.t].a++;if(x.l===x.t)per[x.t].h++;});const list=Object.values(per).sort((p,q)=>p.h/p.a-q.h/q.a||q.a-p.a);const worst=list[0],best=list[list.length-1];score=hits;
  keys=[['Hits',hits+' / '+n,'at five doubles'],['Hit rate',Math.round(hits/n*100)+'%',Math.round(hits/n*100)>=33?'match standard':'under one in three'],['Trouble',worst?worst.t:'–',worst?worst.h+' of '+worst.a:'']];
  obs=!hits?'Nothing dropped in. Aim the wire side of the bed and let the arm do the rest.':(worst&&best&&worst!==best&&best.h/best.a-worst.h/worst.a>=.3)?`${worst.t} was the problem: ${worst.h} of ${worst.a}. ${best.t} went ${best.h} of ${best.a}.`:`Even across the board: ${hits} of ${n}. Nothing to pick on, just more of it.`;}
 else if(D.id==='scoring'){const pts=ds.reduce((a,x)=>a+x.v,0);const av=pts/n*3;const in20=ds.filter(x=>x.n===20).length,tr=ds.filter(x=>x.l==='T20').length;const miss=ds.filter(x=>x.n!==20);const left=miss.filter(x=>x.x<0).length,right=miss.length-left;score=av;
  keys=[['3-dart avg',av.toFixed(1),tr+' trebles'],['In the 20',Math.round(in20/n*100)+'%',in20+' of '+n],['Miss bias','L '+left+' · R '+right,miss.length?'outside the 20':'no misses']];
  obs=miss.length>=4&&left>=right*2?`Misses went left ${left} to ${right}. You are pulling across the 20; square the shoulder.`:miss.length>=4&&right>=left*2?`Misses went right ${right} to ${left}. You are pushing the dart; finish toward the target.`:`${tr} trebles and ${in20} in the bed. Misses split evenly; it is the grouping, not the line.`;}
 else{const ms=ds.map(x=>x.tm*1000);const abs=ms.map(Math.abs);const med=median(abs);const early=ms.filter(v=>v<-30).length,late=ms.filter(v=>v>30).length;const first=median(abs.slice(0,10)),last=median(abs.slice(-10));score=med;
  keys=[['Median error',Math.round(med)+' ms','off the stop'],['Early · late',early+' · '+late,(n-early-late)+' flush'],['First ten → last',Math.round(first)+' → '+Math.round(last),'ms, median']];
  const side=early>=late?'early':'late',big=Math.max(early,late);obs=big/n>=.6?`${big} of ${n} releases were ${side}; your last ten were ${last<first?'closer':'further off'}.`:`Early and late split ${early} to ${late}. ${last<first?'Last ten tighter than the first: you settle in.':'Last ten looser than the first: you drift as you go.'}`;}
 return {score,keys,obs,fmt:d.fmt(score)};}
function endDrill(){if(!S||!S.drill)return;const D=S.drill,d=drillDef(D.id),c=career();S.done=true;const r=drillResult(D);
 const sv=drillSave(D.id);const prev=sv.best;const better=prev==null||(d.hi?r.score>prev:r.score<prev);if(better)sv.best=r.score;sv.runs++;sv.last=r.score;sv.at=Date.now();
 r.pb=prev==null?'First run · that is the mark':better?`New best · was ${d.fmt(prev)}`:`Best ${d.fmt(prev)}`;r.newBest=better&&prev!=null;
 let xp=0;if(D.rewarded&&c){const perf=Math.max(0,Math.min(1,d.perf(r.score)));xp=Math.round(10+perf*20);if(window.TOPS_ST2&&TOPS_ST2()){const mul=[1,1.25,1.5,2,2.5,3.5,5][Math.min(6,c.tier||0)];xp=Math.round((40+perf*60)*mul);try{C3.gainLevels(C3.V3(),xp);}catch(e){}TOPS_addForm({sc:'sc',fi:'fi',co:'co',cn:'rh'}[d.attr]||'sc',25+perf*45,'drill');}else gainXP(d.attr,xp);if(c.season){c.season.side=true;c.season.sideKind='drill · '+d.n;}c.drillsDone=(c.drillsDone||0)+1;}
 r.xp=xp;r.rewarded=D.rewarded;r.gains=S.gains||{};r.id=D.id;persist();
 $('drillBar').hidden=true;S=null;PR.view={kind:'result',r};showHub('practice');}
function drillAccum(c){const me=S.p[0];const a=c.dr=c.dr||{coAtt:0,coHit:0,f9pts:0,f9darts:0,legs:0,par:0,early:0,late:0,throws:0};a.coAtt+=me.coAtt||0;a.coHit+=me.coHit||0;a.f9pts+=me.f9pts||0;a.f9darts+=me.f9darts||0;const legs=(S.p[0].legs||0)+(S.p[1].legs||0);a.legs+=legs;a.par+=legs*((S.tier&&S.tier.avg)||0);a.early+=me.early||0;a.late+=me.late||0;a.throws+=me.throws||0;}
function recommendDrill(c){const a=(c&&c.dr)||{};const pct=(x,y)=>y?Math.round(x/y*100):0;
 if((a.coAtt||0)>=10&&a.coHit/a.coAtt<.25)return {id:'doubles',ev:`${a.coHit} of ${a.coAtt} doubles · ${pct(a.coHit,a.coAtt)}%`,why:'Under one in four at a double. Finishing costs you more than scoring.'};
 if((a.legs||0)>=5&&a.f9darts){const f9=a.f9pts/a.f9darts*3,par=a.par/a.legs;if(f9<=par-8)return {id:'scoring',ev:`First nine ${f9.toFixed(0)} v ${par.toFixed(0)} par · ${a.legs} legs`,why:'You open slow and chase. Twenties until it is boring.'};}
 if((a.throws||0)>=30){const e=a.early/a.throws,l=a.late/a.throws;if(e>.65)return {id:'rhythm',ev:`${a.early} of ${a.throws} releases early · ${Math.round(e*100)}%`,why:'You let go before the stop. The arm is fine; the timing is not.'};if(l>.65)return {id:'rhythm',ev:`${a.late} of ${a.throws} releases late · ${Math.round(l*100)}%`,why:'You hold past the stop. Release on it, not after it.'};}
 const bits=[];if(a.coAtt)bits.push(`${a.coHit} of ${a.coAtt} doubles · ${pct(a.coHit,a.coAtt)}%`);if(a.legs&&a.f9darts)bits.push(`first nine ${(a.f9pts/a.f9darts*3).toFixed(0)} v ${(a.par/a.legs).toFixed(0)} par`);if(a.throws)bits.push(`${pct(a.early,a.throws)}% early · ${pct(a.late,a.throws)}% late`);
 return {id:null,ev:bits.length?bits.join(' · '):'No match data yet',why:'Complete a drill to set your baseline. After a few matches this picks the drill that fixes your weakest number.'};}
function prKeys(keys){return `<div class="rx-keys pr-keys">${keys.map(([s,b,x])=>`<div><small>${s}</small><b>${b}</b><span>${x||''}</span></div>`).join('')}</div>`;}
function renderPractice(){const host=$('hxPractice');if(!host)return;const c=career();if(!c||c.run){host.innerHTML='';return;}
 if(PR.pending){PR.view={kind:'brief',id:PR.pending};PR.pending=null;}
 const v=PR.view||{kind:'list'};const open=drillRewardOpen(c);const sn=c.season;
 const badge=`<span class="hx-badge ${open?'':'used'}">${open?'1 rewarded drill this week':(sn?'Spare night used · best kept, no XP':'No season · no XP')}</span>`;
 const bestLine=d=>{const sv=(save.drills||{})[d.id];return sv&&sv.best!=null?`Best ${d.fmt(sv.best)} · ${sv.runs} run${sv.runs===1?'':'s'}`:'Not run yet';};
 if(v.kind==='list'){const rec=recommendDrill(c);const rd=rec.id?drillDef(rec.id):null;
  host.innerHTML=`<div class="pr-top"><div><div class="hx-kicker">Practice room</div><h2 class="pr-h1">Drills</h2></div>${badge}</div>
  <div class="pr-rec ${rd?'':'none'}"><div class="label">Recommended</div><b>${rd?rd.n:'Try a baseline drill'}</b><span class="pr-ev">${rec.ev}</span><p>${rec.why}</p>${rd?`<button class="pr-btn" type="button" data-start="${rd.id}">Start ${rd.n}<small>${drillAttrName(rd)} · 30 darts</small></button>`:`<button class="pr-btn" type="button" data-start="scoring">Start Scoring 20s<small>Baseline · 30 darts</small></button>`}</div>
  <div class="pr-grid">${DRILLS.map(d=>`<button class="pr-card ${d.soon?'soon':''} ${rd&&rd.id===d.id?'rec':''}" type="button" ${d.soon?'disabled':`data-brief="${d.id}"`}><span class="k">${d.kick}${d.soon?' · soon':''}${rd&&rd.id===d.id?' · recommended':''}</span><b>${d.n}</b><small>${d.line}</small>${d.soon?'':`<em>${bestLine(d)}</em>`}</button>`).join('')}</div>
  <p class="pr-note">One drill a week earns XP and arm, same as the spare night. Retries keep your best and give nothing else.</p>`;}
 else if(v.kind==='brief'){const d=drillDef(v.id);if(!d||d.soon){PR.view=null;return renderPractice();}const sv=(save.drills||{})[d.id];
  host.innerHTML=`<button class="hx-link pr-back" type="button" data-list="1">← All drills</button>
  <div class="pr-top"><div><div class="hx-kicker">${d.kick} drill</div><h2 class="pr-h1">${d.n}</h2></div>${badge}</div>
  <ul class="pr-brief"><li>${d.line}</li><li>${d.how}</li><li>${d.feed}</li><li>The aim snaps to each target. You can still adjust before you throw.</li></ul>
  ${prKeys([['Personal best',sv&&sv.best!=null?d.fmt(sv.best):'–',sv&&sv.runs?sv.runs+' run'+(sv.runs===1?'':'s'):'first time'],['Darts',String(d.darts),'ten visits'],['Tonight',open?'Rewarded':'Retry',open?drillAttrName(d)+' XP and arm':'best kept, no XP']])}
  <div class="pr-actions"><button class="pr-btn" type="button" data-start="${d.id}">Start drill<small>${d.darts} darts · ${drillAttrName(d)}</small></button></div>`;}
 else if(v.kind==='result'){const r=v.r,d=drillDef(r.id);const rec=recommendDrill(c);
  const rbadge=`<span class="hx-badge ${r.rewarded?'':'used'}">${r.rewarded?'Rewarded · spare night used':'Retry · no XP'}</span>`;
  host.innerHTML=`<div class="pr-top"><div><div class="hx-kicker">Drill result · ${d.kick}</div><h2 class="pr-h1">${d.n}</h2></div>${rbadge}</div>
  <div class="pr-score"><b>${r.fmt}</b><span class="${r.newBest?'new':''}">${r.pb}</span></div>
  ${prKeys(r.keys)}
  <p class="rx-coach">${r.obs}</p>
  <div class="pr-xp">${r.rewarded?`<b>+${r.xp} ${(window.TOPS_ST2&&TOPS_ST2())?'XP · '+({cn:'Rhythm'}[d.attr]||drillAttrName(d))+' form':drillAttrName(d)}</b><span>${Object.keys(r.gains).length>1?'Plus '+ATTRS.filter(a=>r.gains[a.id]&&a.id!==d.attr).map(a=>'+'+r.gains[a.id]+' '+a.n).join(' · ')+' from the darts themselves. ':''}Spare night used.</span>`:`<b>No XP</b><span>Spare night already used this week. Your best is kept.</span>`}</div>
  <div class="pr-actions"><button class="pr-btn" type="button" data-start="${d.id}">Again<small>retry · no XP</small></button>${rec.id&&rec.id!==d.id?`<button class="ghost wide" type="button" data-brief="${rec.id}">Recommended: ${drillDef(rec.id).n}<small>${rec.ev}</small></button>`:''}<button class="ghost wide" type="button" data-list="1">All drills</button><button class="ghost wide" type="button" data-fix="1">Next fixture</button></div>`;}
 host.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{PR.view=null;startDrill(b.dataset.start);});
 host.querySelectorAll('[data-brief]').forEach(b=>b.onclick=()=>{PR.view={kind:'brief',id:b.dataset.brief};renderPractice();});
 host.querySelectorAll('[data-list]').forEach(b=>b.onclick=()=>{PR.view=null;renderPractice();});
 host.querySelectorAll('[data-fix]').forEach(b=>b.onclick=()=>{PR.view=null;showHub('play');});}
function renderReceipt(c,posBefore,wasMoney){const host=$('resReceipt');if(!host)return;const show=ui.mode==='career'&&c&&!c.run&&!S.practice;host.hidden=!show;if(!show)return;
 const g=S.gains||{};const ups=S.lvUps||[];const skill=ATTRS.filter(a=>g[a.id]).map(a=>`+${g[a.id]} ${a.n}`).join(' · ')||'No skill XP this match';const upTxt=ups.length?ups.map(u=>`${ATTRS.find(a=>a.id===u.id).n} to ${u.lv}`).join(' · '):'';
 const tr=(!S.local&&!wasMoney&&c._lastTravel)||0;const earned=S.earned||0;const net=earned-tr;
 const moneyTxt=tr?`${money(earned)} earned − ${money(tr)} travel = <em class="${net<0?'dn':''}">${money(net)}</em>`:`${money(earned)} earned`;
 let standTxt='',standSub='';const sn=c.season;if(posBefore&&sn&&!sn.ko&&!S.local&&!wasMoney){const after=sn.done&&sn.pos?sn.pos:youPos(sn);const you=sn.table.find(r=>r.you);standTxt=`${ord(posBefore)} → <em class="${after<posBefore?'up':after>posBefore?'dn':''}">${ord(after)}</em>`;standSub=`${sn.done?'Season over':'Week '+Math.min(sn.week,sn.len)+' of '+sn.len} · ${you?you.pts+' pts':''}`;}
 const rec=recommendDrill(c);const rd=rec.id?drillDef(rec.id):null;
 host.innerHTML=`<div class="label">What changed</div>
 <div class="rr-row"><small>Skill</small><div><b>${skill}</b><span>${upTxt||'No level change'}</span></div></div>
 <div class="rr-row"><small>Money</small><div><b>${moneyTxt}</b><span>Bank ${money(c.bank)}</span></div></div>
 ${standTxt?`<div class="rr-row"><small>Standings</small><div><b>${standTxt}</b><span>${standSub}</span></div></div>`:''}
 <button class="pr-btn" type="button" id="btnResAction">${rd?'Drill: '+rd.n:'Next fixture'}<small>${rd?rec.ev:(sn&&!sn.done?'Week '+Math.min(sn.week,sn.len)+' of '+sn.len:'Back to the hub')}</small></button>`;
 $('reNet').hidden=true;
 if(rd){const co=$('resCoach');if(co&&!co.hidden)co.textContent+=` Drill to run: ${rd.n} · ${rec.ev}.`;}
 $('btnResAction').onclick=()=>{PR.pending=rd?rd.id:null;$('btnResultNext').click();};}


// ===== FEEL (sprint) =====
// Pull progress from a timestamp (same formula the frame loop used). Event timestamps share performance.now()'s origin.
function pullAt(ts){return Math.min(1.3,(ts-S.pullStart)/(PM()*(S.pullMul||1)));}
function feelStamp(ev){const now=performance.now();const t=ev&&typeof ev.timeStamp==='number'?ev.timeStamp:NaN;return (t>0&&S&&t>=S.pullStart-5&&t<=now+1)?t:now;}
function feelPhone(){return innerHeight>innerWidth*1.1;}
function cancelPull(){if(S&&S.pulling){S.pulling=false;S.pull=0;S.over=false;S.pullSrc=null;}dragging=false;}
// desktop only: holding on the player pane (right half, off the board) still pulls
function feelPaneHold(e){if(feelPhone()||!V.isSplit())return false;return e.clientX>innerWidth*.5;}
// --- pull pad ---
const PA=$('pullArea'),PAD=$('pullPad'),PAL=$('paLabel'),PAV=$('paVerdict'),PAM=$('paMark'),PAWIN=$('paWin');let paState='',paVerdT=0,paWinKey='';
function padCanPull(){return !!(S&&!S.done&&!S.busy&&!S.p[S.cur].ai&&!S.mateTurn&&S.view!==1&&!S.breathe&&!V.walking());}
if(PAD){PAD.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();if(!padCanPull())return;try{PAD.setPointerCapture(e.pointerId);}catch(x){}S.padPtr=e.pointerId;startPull('pad',e);});
 PAD.addEventListener('pointerup',e=>{if(S&&S.pulling&&S.pullSrc==='pad')release(e,'pad');});
 PAD.addEventListener('pointercancel',()=>{if(S&&S.pullSrc==='pad')cancelPull();});
 PAD.addEventListener('lostpointercapture',()=>{if(S&&S.pulling&&S.pullSrc==='pad')cancelPull();});
 PAD.addEventListener('contextmenu',e=>e.preventDefault());}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelPull();breatheEnd();}});
addEventListener('blur',()=>{cancelPull();breatheEnd();});
// zoomed-in board is the only view (Hayden 22:59: the same throw for everyone); an old save.boardZoom=false (this device, cloud or another device) is ignored
function zoomSync(){window.__zoomOn=true;const b=$('btnZoom');if(b)b.remove();}
function feelLayoutClass(){const ph=feelPhone();document.body.classList.toggle('feel-phone',ph);document.body.classList.toggle('feel-desk',!ph);}
addEventListener('resize',()=>{feelLayoutClass();paWinKey='';});
function feelMatchStart(){zoomSync();S.perfStreak=0;S.ghostQ=[];V.ghostsClear();feelLayoutClass();if(PA){PA.hidden=false;paState='';paWinKey='';}}
// honest window on the track: track spans pull 0..1.3, sweet at SWEET, half-width perfectWin() seconds
function setTx(el,v){if(el&&el.textContent!==v)el.textContent=v;}
function feelPadWindow(){if(!PA)return;const w=perfectWin();const key=w.toFixed(4)+'|'+PA.offsetWidth+'|'+((S&&S.markerShift)||0);if(key===paWinKey)return;paWinKey=key;const W=PA.offsetWidth||366;if(w<=0){PA.classList.remove('haswin');return;}PA.classList.add('haswin');const half=w*1000/PULL_MS/1.3;const c=(SWEET+((S&&S.markerShift)||0)/PULL_MS)/1.3;let l=(c-half)*W,r=(c+half)*W;if(r-l<2){const m=(l+r)/2;l=m-1;r=m+1;}PAWIN.style.left=l+'px';PAWIN.style.width=(r-l)+'px';const t=PA.querySelectorAll('.pa-tick');t[0].style.left=t[2].style.left=l+'px';t[1].style.left=t[3].style.left=r+'px';}
function feelPadSet(st,label){if(paState!==st){paState=st;PA.className='pa '+st+(PA.classList.contains('haswin')?' haswin':'');}if(PAL.textContent!==label)PAL.textContent=label;}
function feelPadTick(now){if(!PA)return;if(!S||S.done){if(!PA.hidden)PA.hidden=true;return;}if(PA.hidden)PA.hidden=false;if(S.bull&&S.bull.me!=null&&S.bull.op==null){feelPadSet('opp','Opponent throwing');return;}
 const me=S.p[S.cur];const opp=me.ai||S.mateTurn;
 if(opp)feelPadSet('opp','Opponent throwing');
 else if(S.breathe)feelPadSet('breathe','Breathe…');
 else if(S.pulling){feelPadWindow();feelPadSet(S.over?'late':'pulling',S.over?'Late · let go now':'Let go when the ring is tightest');PAM.style.left=(Math.max(0,S.pull)/1.3*100)+'%';}
 else if(S.busy)feelPadSet('off',S.lastTiming?S.lastTiming:'Hold to pull');
 else{feelPadWindow();document.body.classList.toggle('lk-tut',(save.totThrows||0)<30);feelPadSet('ready',(save.totThrows||0)<30?'Aim on the board · then hold here':'Hold here to throw');}
 if(PAV){if(paVerdT&&now>paVerdT){paVerdT=0;PAV.classList.remove('show');}else if(!paVerdT&&S.pulling&&S.over){if(PAV.textContent!=='Wide'){PAV.textContent='Wide';PAV.className='pa-verdict show wide';}}else if(!paVerdT&&PAV.classList.contains('wide')){PAV.className='pa-verdict';}}}
function feelVerdictText(){const n=S&&S.perfStreak||0;return (S.lastTiming==='Perfect'&&n>=2)?'Perfect ×'+n:S.lastTiming+(S.lastTiming==='Flush'||S.lastTiming==='Perfect'?'':(S.lastArrow||''));}
function feelAfterRelease(perf){S.perfStreak=perf?(S.perfStreak||0)+1:0;if(S.online&&S.fx){const h=S.fx.find(f=>f.hot&&!f.hotOn);if(h){if(perf)h.hotOn=1;else S.fx=S.fx.filter(f=>f!==h);}try{cardFxAfterDart();}catch(e){}}if(perf&&!window.TH_LEGACY)try{sfxPerfect(S.perfStreak-1);}catch(e){}if(S.perfStreak>=10&&!S.practice&&!S.drill)try{achUnlock('streak10');}catch(e){}S.pullSrc=null;if(PAV){PAV.textContent=feelVerdictText();PAV.className='pa-verdict show'+((S.lastTiming==='Late'||S.lastTiming==='Held')?' late':'');paVerdT=performance.now()+400;}}
// --- hold-to-breathe settle (once per leg; releasing early keeps what was gained) ---
function breatheStart(){if(!S||S.done||S.settled||S.pulling||S.p[S.cur].ai||S.mateTurn||S.breathe)return;S.settled=true;S.breathe={t0:performance.now(),calm:0,adren:0};noiseBurst({dur:.5,freq:400,q:1,gain:.05});const b=$('btnSettle');if(b){b.textContent='Breathe…';b.classList.add('breathing');}}
function feelBreathe(now){const br=S&&S.breathe;if(!br)return;if(S.done||S.p[S.cur].ai||S.mateTurn){breatheEnd();return;}const k=Math.min(1,(now-br.t0)/1200);const e=1-Math.pow(1-k,2);const tc=.55*e,ta=.6*e;S.calm=(S.calm||0)+(tc-br.calm);br.calm=tc;const da=ta-br.adren;S.adren=Math.max(0,S.adren-da);br.adren=ta;if(k>=1)breatheEnd();}
function breatheEnd(){if(!S||!S.breathe)return;S.breathe=null;const b=$('btnSettle');if(b){b.textContent='Settle';b.classList.remove('breathing');}}
function feelBindSettle(){const b=$('btnSettle');if(!b)return;b.onclick=null;b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(x){}breatheStart();});/* tap to settle: the breath runs its full 1.2 s on its own */b.addEventListener('keydown',e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();if(!e.repeat)breatheStart();}});}
// --- landing ghosts: previous three human landings; Practice + career tiers 0-1 by default; save.ghosts true/false overrides ---
function ghostsOn(){if(!S)return false;if(save.ghosts===true)return true;if(save.ghosts===false)return false;return !!(S.practice||(ui.mode==='career'&&ui.tier<=1));}
function feelGhostAdd(x,y){if(!S||S.bull)return;S.ghostQ=S.ghostQ||[];S.ghostQ.unshift({x,y});S.ghostQ.length=Math.min(3,S.ghostQ.length);V.ghostsSet(ghostsOn()?S.ghostQ:null);}
function feelGhostsClear(){if(S)S.ghostQ=[];V.ghostsClear();}
feelLayoutClass();

// ===== LOOK (sprint) =====
// Match look, outcome ladder, pacing budgets, synthesised sound mix and settings. Everything here wraps existing functions by name;
// the gameplay functions above are untouched apart from the anchored timer/flag edits noted in CHANGES.md.
const LOOK=window.LOOK={on:true,rm:!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches),hush:false,ducked:false,ambBase:0,routesOpen:false};
LOOK.phone=()=>V.lkPhone();
LOOK.quick=()=>save.quick==null?LOOK.phone():!!save.quick;
LOOK.haptics=()=>save.haptics!==false;
// pacing: ordinary visit pause 350 Quick / 700 Full; ladder adds at most 100 (140+), 250 (180), 100 (bust), 200 (checkout); AI darts 300/500
LOOK.pause=(kind,gained)=>{const q=LOOK.quick();const base=q?350:700;if(kind==='visit'){if(gained===180)return base+250;if(gained>=140)return base+100;return base;}if(kind==='bust')return base+100;if(kind==='ai')return q?300:500;if(kind==='aiFirst')return q?600:1000;if(kind==='checkout')return base+200;return base;};
LOOK.vib=p=>{if(!LOOK.haptics()||!navigator.vibrate)return;try{navigator.vibrate(p);}catch(e){}};
// --- sound: six sisal thunks (no immediate repeats), treble/double accents, dry bust, game-shot and match-win accents, tier-mixed crowd
const LK_THUNK=[[1450,1.2,96,.10],[1700,1.0,106,.09],[1900,1.4,88,.11],[1250,.9,112,.085],[2100,1.6,99,.10],[1550,1.1,91,.095]];let lkLastThunk=-1;
sfxDartHit=function(kind,far){if(!AU.ctx)return;const v=far?.45:1;if(kind==='miss'){noiseBurst({dur:.05,freq:2600,q:1.5,gain:.3*v});thump(210,.06,.22*v);}else if(kind==='wire'){noiseBurst({dur:.03,freq:4200,q:4,gain:.35*v});thump(160,.05,.3*v);}else{let i;do{i=Math.floor(Math.random()*6);}while(i===lkLastThunk);lkLastThunk=i;const [f,q,tf,td]=LK_THUNK[i];noiseBurst({dur:.034+(i%3)*.006,freq:f,q,gain:.42*v});thump(tf,td,.7*v);}};
LOOK.tone=(f0,f1,dur,gain,type,delay)=>{if(!AU.ctx)return;const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';const t=c.currentTime+(delay||0);o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+dur+.02);};
LOOK.sfx={
 treble(){noiseBurst({dur:.05,freq:3600,q:5,gain:.14,delay:.02});LOOK.tone(1760,2200,.09,.10,'triangle',.02);},
 double(){LOOK.tone(660,660,.07,.12,'square',.02);LOOK.tone(990,990,.1,.1,'square',.09);},
 bust(){LOOK.tone(140,70,.22,.3,'sine',0);noiseBurst({dur:.12,freq:300,q:.7,gain:.12,type:'lowpass'});},
 gameShot(){[0,.09,.18].forEach((d,i)=>LOOK.tone(523*(1+i*.26),523*(1+i*.26),.16,.12,'triangle',d));thump(70,.3,.4,.18);},
 matchWin(){[523,659,784,1046].forEach((f,i)=>LOOK.tone(f,f,.24,.14,'triangle',i*.1));thump(60,.5,.5,.3);LOOK.tone(1046,1046,.45,.08,'triangle',.5);}};
const LK_AMB=[-24,-22,-20,-26,-18,-30,-16]; // ambience dB per tier (plan table)
const LK_MIX=[{ton:'light',big:'light',one80:'strong',out:'light',tonOut:'light',win:'strong'},
 {ton:'light',big:'strong',one80:'cheer',out:'strong',tonOut:'strong',win:'cheer'},
 {ton:'light',big:'strong',one80:'cheer',out:'strong',tonOut:'strong',win:'cheer'},
 {ton:null,big:'light',one80:'strong',out:'light',tonOut:'strong',win:'strong'},
 {ton:'light',big:'strong',one80:'cheer',out:'strong',tonOut:'strong',win:'cheer'},
 {ton:null,big:null,one80:'light',out:null,tonOut:'light',win:'strong'},
 {ton:'light',big:'strong',one80:'cheer',out:'strong',tonOut:'strong',win:'cheer'}];
LOOK.tier=()=>Math.max(0,Math.min(6,(S&&S.tier&&TIERS.indexOf(S.tier))>=0?TIERS.indexOf(S.tier):(ui.tier||0)));
LOOK.crowdLevel=()=>Math.pow(10,(LK_AMB[LOOK.tier()]+14)/20);
LOOK.crowdFx=kind=>{if(!AU.ctx||!S)return;const lv=LOOK.crowdLevel();if(kind==='light'){sfxSwell(lv*.5,.8,900,.8,.05);for(let i=0;i<8;i++)noiseBurst({dur:.02,freq:2200,q:1,gain:lv*.16,delay:.1+i*.08+Math.random()*.03});}
 else if(kind==='strong'){sfxSwell(lv*.9,1.3,1000,.7,.05);for(let i=0;i<18;i++)noiseBurst({dur:.02,freq:2100+Math.random()*400,q:1,gain:lv*.2,delay:.08+i*.06+Math.random()*.03});}
 else if(kind==='cheer'){sfxSwell(lv*1.1,2.0,1100,.7,.03);sfxSwell(lv*.6,2.4,600,.8,.1);for(let i=0;i<28;i++)noiseBurst({dur:.02,freq:2000+Math.random()*600,q:1,gain:lv*.2,delay:.1+i*.06+Math.random()*.04});}};
LOOK.crowd=ev=>{const m=LK_MIX[LOOK.tier()];if(m&&m[ev])LOOK.crowdFx(m[ev]);};
sfxCheer=function(){};sfxClap=function(){};sfxGroan=function(){}; // crowd now comes from LOOK.crowd per the tier table
crowdSet=function(level){if(!AU.ctx)return;LOOK.ambBase=level>0?Math.pow(10,LK_AMB[LOOK.tier()]/20)*.5:0;LOOK.applyAmb(.8);};
LOOK.applyAmb=tau=>{if(!AU.ctx||!AU.crowdGain)return;const g=(LOOK.ambBase||0)*(LOOK.hush?.5:1)*(LOOK.ducked?.5:1);AU.crowdGain.gain.setTargetAtTime(g,AU.ctx.currentTime,tau||.05);};
LOOK.setHush=on=>{on=!!on;if(on===LOOK.hush)return;LOOK.hush=on;LOOK.applyAmb(.05);};
LOOK.duck=ms=>{LOOK.ducked=true;LOOK.applyAmb(.03);clearTimeout(LOOK._dk);LOOK._dk=setTimeout(()=>{LOOK.ducked=false;LOOK.applyAmb(.15);},ms||1200);};
LOOK.matchDart=()=>{if(!S||S.done||S.practice||S.bull)return false;const me=S.p[S.cur];const need=Math.ceil(S.bestOf/2);return me.legs===need-1&&me.score<=170&&!!route(me.score,4-S.dart);};
{const _say=say;say=function(text,style){if(!AU.caller||!AU.on)return;_say(text,style);LOOK.duck(Math.min(2600,600+text.length*55));};}
// caller: 100+ totals and checkouts only; one line at a time (say() cancels the previous line)
callVisit=function(total,ctx){if(!S)return;const st=S.tier.caller;if(ctx==='bust'){say('No score.',st);return;}if(ctx==='gameshot'){const need=Math.ceil(S.bestOf/2);const w=S.p[S.cur];say(w.legs>=need?'Game shot, and the match.':'Game shot.',st);return;}if(total>=100)say(total===180?(st==='pro'?'ONE HUNDRED AND EIGHTY!':'One hundred and eighty!'):words(total),st);};
// --- outcome resolver hook: one dominant treatment per dart (bust > checkout > visit total > treble/double)
{const _land=land;land=function(x,y,far){if(!S||S.bull)return _land(x,y,far);const me=S.p[S.cur],cur=S.cur,dart=S.dart,vs=S.visitStart,legs0=me.legs,need=Math.ceil(S.bestOf/2);const h=scoreAt(x,y);const r=_land(x,y,far);if(!S||S.p[cur]!==me)return r;
 const last=S.visit[S.visit.length-1];const bust=!!(last&&last.bust);const won=me.legs>legs0;const visitDone=dart===3&&!bust&&!won;const gained=vs-me.score;
 if(bust||won||visitDone){const h0=$('routes');if(h0)h0.hidden=true;}
 if(bust){LOOK.sfx.bust();LOOK.vib(30);LOOK.setHush(false);return r;}
 if(won){const match=me.legs>=need;const cl=V.lkCluster();if(match)LOOK.sfx.matchWin();else LOOK.sfx.gameShot();LOOK.crowd(match?'win':(vs>=100?'tonOut':'out'));LOOK.vib(match?[15,40,25]:20);if(cl)V.lookPush(cl.x,cl.y);V.lookReact(match?800:600);LOOK.setHush(false);return r;}
 if(h.m===3&&h.v>0){LOOK.sfx.treble();LOOK.vib(10);}else if(h.dbl&&h.v>0){LOOK.sfx.double();}
 if(visitDone){if(gained===180){const cl=V.lkCluster();LOOK.crowd('one80');LOOK.vib([15,40,15]);if(cl)V.lookPush(cl.x,cl.y);V.lookReact(600);}else if(gained>=140){LOOK.crowd('big');LOOK.vib(15);V.lookReact(450);}else if(gained>=100){LOOK.crowd('ton');}LOOK.setHush(false);}
 else LOOK.setHush(LOOK.matchDart());return r;};}
{const _startTurn=startTurn;startTurn=function(){_startTurn();LOOK.routesOpen=false;LOOK.bandOff();LOOK.setHush(LOOK.matchDart());if(S&&!S.done)renderRoutes();};}
// --- outcome ladder visuals: totals pop at the board edge then a duplicate travels to the bar; bands for bust / checkout / match
LOOK.travel=(fromEl,who,txt)=>{if(LOOK.rm||!fromEl||!fromEl.animate)return;const tgt=$('score'+who);if(!tgt)return;const a=fromEl.getBoundingClientRect(),b=tgt.getBoundingClientRect();if(!a.width||!b.width)return;const el=document.createElement('div');el.className='lk-fly';el.textContent=txt;document.body.appendChild(el);const x0=a.left+a.width/2,y0=a.top+a.height/2,x1=b.left+b.width/2,y1=b.top+b.height/2;el.style.left=x0+'px';el.style.top=y0+'px';el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${x1-x0}px),calc(-50% + ${y1-y0}px)) scale(.55)`,opacity:.85}],{duration:250,easing:'ease-out',fill:'forwards'}).onfinish=()=>el.remove();};
LOOK.band=(html,cls,ms)=>{const b=$('lkBand');if(!b)return;b.innerHTML=html;b.hidden=false;b.className='lk-band '+cls;void b.offsetWidth;b.classList.add('show');clearTimeout(LOOK._bt);LOOK.bandUntil=performance.now()+ms;LOOK._bt=setTimeout(()=>LOOK.bandOff(),ms);};
LOOK.bandOff=()=>{const b=$('lkBand');if(!b)return;clearTimeout(LOOK._bt);b.classList.remove('show');setTimeout(()=>{if(!b.classList.contains('show'))b.hidden=true;},140);};
LOOK.skip=()=>{V.lookSkip();LOOK.bandOff();fxP=[];try{if('speechSynthesis'in window)speechSynthesis.cancel();}catch(e){}};
flash=function(txt,cls,sub){const c=$('callout');if(!c)return;const s=String(txt);let kind='plain';if(/^\d+$/.test(s)){const n=+s;kind=n>=180?'t180':n>=140?'t140':n>=100?'t100':'t0';}else if(s==='Bust')kind='bust';else if(s==='Game shot')kind='out';else if(s==='RESPECT')kind='respect';else if(s==='NINE DARTER')kind='nine';else if(/^(T\d+|D\d+|BULL)$/.test(s))kind='chip';
 const who=S?S.cur:0;const me=S&&S.p[who];clearTimeout(flash.t);
 if(kind==='bust'){c.className='callout';LOOK.band(`<em>No score</em><b>BUST</b><small>back to ${me?me.score:''}</small>`,'lk-bust',450);const sc=$('score'+who);if(sc){sc.classList.remove('lk-restore');void sc.offsetWidth;sc.classList.add('lk-restore');}return;}
 if(kind==='out'){c.className='callout';const match=/match/.test(sub||'');const rt=(me&&me.lastOut)?me.lastOut.join(' '):'';const out=(S&&S.visitStart)||'';LOOK.band(`<em>${match?'Game shot, and the match':'Game shot'}</em><b>${out} OUT</b><small>${rt}</small>`,match?'lk-win':'lk-out',match?800:600);return;}
 if(kind==='respect'){const b=$('lkBand');if(b&&!b.hidden&&b.classList.contains('show')){const e=document.createElement('span');e.className='lk-resp';e.textContent='RESPECT';b.appendChild(e);clearTimeout(LOOK._bt);LOOK._bt=setTimeout(()=>LOOK.bandOff(),600);}else LOOK.band(`<b><span class="lk-resp">RESPECT</span></b><small>${sub||''}</small>`,'lk-out',600);return;}
 if(kind==='nine'){LOOK.band(`<em>Perfect leg</em><b>NINE DARTER</b>`,'lk-win',900);return;}
 if(c.parentNode)c.parentNode.classList.toggle('side',kind!=='t180');
 const dur={t0:1400,t100:1600,t140:1800,t180:2000,chip:700,plain:1200}[kind];c.innerHTML=s+(sub&&kind==='plain'?`<small>${sub}</small>`:'');c.className='callout show lk-'+kind;flash.t=setTimeout(()=>c.className='callout',dur);
 if(kind[0]==='t'&&kind!=='t0')requestAnimationFrame(()=>LOOK.travel(c,who,s));};
confetti=function(strength){if(LOOK.rm||strength<.4)return;const P=V.lkRects().player;const n=Math.round(70*strength);for(let i=0;i<n;i++)fxP.push({x:P.x+Math.random()*P.w,y:P.y-20-Math.random()*P.h*.3,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:Math.random()*6,vr:(Math.random()-.5)*.25,c:['#e9e4d8','#e8382c','#e9e4d8','#adb0b5'][i%4],w:6+Math.random()*4,lim:P.y+P.h});}
{const _fxTick=fxTick;fxTick=function(){_fxTick();fxP=fxP.filter(p=>p.lim==null||p.y<p.lim);};}
// --- scoreboard / header / route toolbar
{const _updateUI=updateUI;updateUI=function(){_updateUI();if(!S)return;document.body.classList.toggle('lk-match',$('result').hidden);const phone=LOOK.phone();
 {const last=S.visit[S.visit.length-1];const done=S.visit.length>=3||(last&&last.bust)||S.p[S.cur].score===0;mpRows().forEach((p,i)=>{const av=$('avg'+i);if(!av||!p.darts)return;const live=(S.p[S.cur]===p&&!S.done&&!done)?S.visit.reduce((x,v)=>x+(v.bust?0:v.v),0):0;av.querySelector('b').textContent=((p.pts+live)/p.darts*3).toFixed(1);});}
 mpRows().forEach((p,i)=>{const o=$('one'+i),l=$('last'+i),lg=$('legs'+i);if(o)o.lastElementChild.textContent=p.t180;if(l)l.lastElementChild.textContent=p.lastVisit!=null?p.lastVisit:'–';if(lg&&!(S.practice&&i===1))lg.textContent=p.legs;
  const nm=$('name'+i);if(nm&&phone){const full=S.practice&&i===1?'Session':(p.disp||p.name);const parts=full.split(' ');nm.firstChild.textContent=full.length>12&&parts.length>1?parts[0][0]+'. '+parts.slice(1).join(' '):full;}});
 const need=Math.ceil(S.bestOf/2);const legNo=legsPlayed()+1;const lk=$('lkLeg');if(lk)lk.textContent=S.practice?'Practice':(S.p.length>2&&!S.teams?`Leg ${legNo} · First to ${need}`:`Leg ${legNo} · ${S.p[0].legs}–${S.p[1].legs} · First to ${need}`);mpBoardRender();
 const chips=[...$('visit').children].filter(c=>!c.classList.contains('empty'));chips.forEach((c,i)=>c.classList.toggle('last',i===chips.length-1));
 const me=S.p[S.cur];$('outshot').classList.toggle('lk-ai',!!(me&&(me.ai||S.mateTurn))&&!S.done);};}
{const _renderRoutes=renderRoutes;renderRoutes=function(){_renderRoutes();const host=$('routes');if(!host||!S)return;const me=S.p[S.cur];const human=!S.done&&!S.bull&&!S.busy&&me&&!me.ai&&!S.mateTurn&&!(S.din&&!me.opened)&&!$('intro').classList.contains('show')&&me.score>=2;
 if(!human){host.hidden=true;return;}if(host.hidden){host.innerHTML='';host.hidden=false;}
 const d=4-S.dart;const list=[...host.querySelectorAll('.rt')];const sel=list.find(b=>b.classList.contains('on'));const hh=host.querySelector('.rt-h');if(hh)hh.remove();
 let mid='';if(sel){mid=sel.innerHTML.replace(/<em>.*?<\/em>/,'');if(sel.classList.contains('sty'))mid+='<em>Respect</em>';}else{const pt=planText();mid=me.score<=170?'<span class="lk-nofin">No checkout this visit</span>':(pt?chipify(pt):`<b>Aim</b><span class="rc">${myAim(me.score,d)}</span>`);}
 const open=!!LOOK.routesOpen&&list.length>0;host.classList.toggle('lk-open',open);
 const bar=document.createElement('div');bar.className='rt-bar';bar.innerHTML=`<b class="rt-rem">${me.score}</b><span class="rt-sel">${mid}</span>`+(list.length?`<button type="button" class="rt-tog" aria-expanded="${open}">Routes<i>${open?'▴':'▾'}</i></button>`:'');
 let lst=host.querySelector('.rt-list');if(!lst&&list.length){lst=document.createElement('div');lst.className='rt-list';const head=document.createElement('div');head.className='rt-lh';head.textContent=`${me.score} · ${d} dart${d>1?'s':''} · pick a route`;lst.appendChild(head);list.forEach(b=>lst.appendChild(b));host.appendChild(lst);}
 host.insertBefore(bar,host.firstChild);const tg=bar.querySelector('.rt-tog');if(tg)tg.onclick=()=>{LOOK.routesOpen=!LOOK.routesOpen;renderRoutes();};
 list.forEach(b=>{const o=b.onclick;b.onclick=e=>{LOOK.routesOpen=false;if(o)o(e);};});};}
// Quick route picker (Hayden 22:59, product rule 9): on a finish, the top routes for your score and darts in hand sit in the bar as
// buttons; one tap re-aims along that route (aim only, the throw is untouched) and you can switch any time in the visit. Routes come
// from the standard checkout table (routesFor). With one dart left only direct finishes show. A missed route falls back to the table
// and says so. The rail swallows its own touches so a tap never starts a throw.
{const RS=document.createElement('style');RS.textContent=`
#routes .rt-rail{display:flex;gap:5px;flex:1;min-width:0}
#routes .rt-rail .rt{flex:1 1 0;min-width:0;min-height:44px;display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center;justify-content:center;gap:0;padding:0 4px;border-radius:10px;border:1px solid rgba(237,236,229,.2);background:linear-gradient(160deg,rgba(38,51,53,.94),rgba(16,25,26,.96));box-shadow:0 6px 14px rgba(0,0,0,.35);color:#EDECE5;cursor:pointer;touch-action:manipulation;position:relative!important;height:auto!important}
#routes .rt-rail .rt .rc{position:static!important;margin:0!important;display:inline-block!important;flex:none!important;min-width:0!important;width:auto!important;padding:0 3px!important;background:none!important;border:0!important;box-shadow:none!important;font:italic 800 16px/1 "Barlow Condensed",sans-serif!important;letter-spacing:.01em;color:inherit!important;transform:none!important}
#routes .rt-rail .rt .rc+.rc::before{content:'';display:inline-block;width:3px;height:3px;margin:0 4px 0 -1px;border-radius:50%;background:currentColor;opacity:.45;vertical-align:middle}
#routes .rt-rail .rt .rc.d{color:#C6F36B!important}
#routes .rt-rail .rt.on{background:#C6F36B;border-color:#C6F36B;color:#10191A;box-shadow:0 6px 16px rgba(198,243,107,.28)}
#routes .rt-rail .rt.on .rc.d{color:#10191A!important;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
#routes .rt-rail .rt em{display:none}
#routes .rt-rail .rt.on .rc:first-child{background:rgba(16,25,26,.16)!important;border-radius:5px;padding:3px 5px!important}
#routes.rail-on{padding:5px;margin:-5px;border-radius:14px;background:linear-gradient(180deg,rgba(10,16,17,.78),rgba(10,16,17,.55));box-shadow:0 8px 20px rgba(0,0,0,.35)}
#routes.routes.rail-on{position:fixed!important;z-index:35!important;top:calc(var(--lk-hdr) + var(--lk-bh) + 8px)!important;left:8px!important;right:8px!important;width:auto!important;bottom:auto!important}
#routes.rail-on .rt-bar{width:100%!important;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;min-height:44px;gap:5px!important}
#routes.rail-on .rt-bar .rt-rem,#routes.rail-on .rt-bar .rt-sel,#routes.rail-on .rt-bar .rt-tog{display:none!important}
#routes .rt-upd{position:absolute;left:4px;top:auto;bottom:-16px;font:800 10px/1 Manrope,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#D9AD52;text-shadow:0 1px 3px #000}
`;document.head.appendChild(RS);}
{const _rr=renderRoutes;renderRoutes=function(){_rr();const host=$('routes');const home=()=>{const hud=$('hud'),db=$('drillBar');if(host&&hud&&host.parentNode!==hud){if(db&&db.parentNode===hud)db.after(host);else hud.appendChild(host);}};if(host&&(host.hidden||!S)){host.classList.remove('rail-on');document.body.classList.remove('lk-rail');home();}if(!host||host.hidden||!S)return;const me=S.p[S.cur];if(!me)return;
 host.classList.remove('rail-on');document.body.classList.remove('lk-rail');home();const lst=host.querySelector('.rt-list');const bar=host.querySelector('.rt-bar');if(!bar||!lst)return;const btns=[...lst.querySelectorAll('.rt')].slice(0,3);if(btns.length<2||innerWidth>700||innerWidth>innerHeight)return; /* phone portrait; desktop keeps the Routes list */
 LOOK.routesOpen=false;host.classList.remove('lk-open');host.classList.add('rail-on');document.body.classList.add('lk-rail');if(host.parentNode!==document.body)document.body.appendChild(host);bar.classList.add('rail');let rail=bar.querySelector('.rt-rail');if(!rail){rail=document.createElement('div');rail.className='rt-rail';bar.appendChild(rail);}
 if(S.planDropped&&performance.now()-S.planDropped<2200){if(!bar.querySelector('.rt-upd')){const u=document.createElement('span');u.className='rt-upd';u.textContent='Route updated';bar.insertBefore(u,rail);}}
 btns.forEach(b=>{b.setAttribute('aria-pressed',b.classList.contains('on'));rail.appendChild(b);['pointerdown','touchstart','mousedown'].forEach(ev=>b.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));});
 host.setAttribute('aria-label',`${me.score} to go, ${4-S.dart} dart${S.dart===3?'':'s'}: pick a route`);};}
{const _ss=showScreen;showScreen=function(){const r=_ss.apply(this,arguments);try{const h=$('routes'),hud=$('hud');if(h&&hud&&hud.hidden){h.hidden=true;h.classList.remove('rail-on');document.body.classList.remove('lk-rail');if(h.parentNode!==hud)hud.appendChild(h);}}catch(e){}return r;};}
// a picked route that a dart knocks off course: say so once, then the table's route for the new score takes over
{const _ld=landCore;landCore=function(){const had=!!(S&&S.planPicked&&S.plan&&S.plan.length);const snap=had?S.plan.slice():null;const r=_ld.apply(this,arguments);try{if(had&&S&&!S.plan&&snap.length>1){/* ChatGPT P1: keep the rest of your route when it still checks out */const me=S.p[S.cur],rest=snap.slice(1),left=4-S.dart,last=rest[rest.length-1];if(me&&rest.length<=left&&rest.reduce((a,l)=>a+valOf(l),0)===me.score&&(last[0]==='D'||last==='BULL'))S.plan=rest;}
 if(had&&S&&!S.plan){S.planPicked=false;S.planDropped=performance.now();setTimeout(()=>{try{renderRoutes();}catch(e){}},2300);}}catch(e){}return r;};}
{const _beginMatch=beginMatch;beginMatch=function(opts){LOOK.routesOpen=false;LOOK.bandOff();LOOK.hush=false;LOOK.ducked=false;$('hudTr').classList.remove('open');$('btnMenu').setAttribute('aria-expanded','false');V.lkRects();document.body.classList.add('lk-match');const r=_beginMatch(opts);LOOK.syncMenu();return r;};}
{const _showScreen=showScreen;showScreen=function(id){_showScreen(id);document.body.classList.toggle('lk-match',!$('hud').hidden);if(id){const cb=$('btnChat');if(cb)cb.hidden=true;const cp=$('chatPanel');if(cp)cp.hidden=true;const mb=$('mpBoard');if(mb)mb.hidden=true;const pb=$('pubBet');if(pb)pb.hidden=true;}};}
// --- menu (Sound / Caller / Haptics / Pace / Quit live under Menu) and skip
LOOK.syncMenu=()=>{const h=$('btnHaptics'),q=$('btnQuick');if(h)h.setAttribute('aria-pressed',LOOK.haptics());if(q){q.removeAttribute('aria-pressed');q.textContent=LOOK.quick()?'Pace: Quick':'Pace: Full';}};
$('btnMenu').onclick=()=>{const o=$('hudTr').classList.toggle('open');$('btnMenu').setAttribute('aria-expanded',o);LOOK.syncMenu();};
$('btnHaptics').onclick=()=>{save.haptics=!LOOK.haptics();persist();LOOK.syncMenu();if(LOOK.haptics())LOOK.vib(10);};
$('btnQuick').onclick=()=>{save.quick=!LOOK.quick();persist();LOOK.syncMenu();};
{const _ps=persistAudio;persistAudio=function(){save.sound=AU.on;save.caller=AU.caller;_ps();};}
document.addEventListener('pointerdown',e=>{const tr=$('hudTr');if(tr.classList.contains('open')&&!e.target.closest('#hudTr')){tr.classList.remove('open');$('btnMenu').setAttribute('aria-expanded','false');}
 if(S&&!S.done&&LOOK.bandUntil&&performance.now()<LOOK.bandUntil&&!e.target.closest('button'))LOOK.skip();},true);
LOOK.syncMenu();

zoomSync();
// ===== LOOP =====
const ecgC=$('ecg'),ecgX=ecgC.getContext('2d');let ecgPhase=0,ecgLast=0,ecgBeat=0;function ecgDraw(now,hr,nv){const W=ecgC.width,H=ecgC.height;const dt=Math.min(.1,(now-(ecgLast||now))/1000);ecgLast=now;ecgPhase=(ecgPhase+dt*hr/60)%1;ecgX.clearRect(0,0,W,H);ecgX.lineWidth=2;ecgX.strokeStyle=hr>105?'#ff5a4e':'#f3efe6';ecgX.beginPath();for(let x=0;x<W;x++){const ph=((x/W)*1.0+ (1-ecgPhase))%1;let y=0;if(ph>.40&&ph<.44)y=-.15;else if(ph>=.44&&ph<.47)y=1;else if(ph>=.47&&ph<.50)y=-.5;else if(ph>.58&&ph<.66)y=.18*Math.sin((ph-.58)/.08*Math.PI);const amp=H*.36*(0.8+Math.min(1.2,nv*.25));const py=H*.62-y*amp;if(x===0)ecgX.moveTo(x,py);else ecgX.lineTo(x,py);}ecgX.stroke();}
let lastBeat=0;
/* ENG-13 (#20, Overseer 07:12): with no match live, the 3D scene was drawn every frame (60/s on an iPhone) behind the rebrand hub, which is
   opaque and covers the whole screen: GPU and main-thread work nobody sees, sharing the phone with the menu sounds. Now no 3D frame is drawn
   while a full-screen opaque menu covers the scene. Checked at most every 400 ms (two style reads), never during a match: a live match always
   draws. Portraits and hero renders are separate calls and unaffected. Test switch 'hub3d' (URL q20) keeps the old drawing for an A/B. */
function menuCovers(now){if(now-(menuCovers.t||0)<400)return !!menuCovers.on;menuCovers.t=now;let on=false;
 try{if(!(window.TOPS_q20has&&TOPS_q20has('hub3d'))){const W=innerWidth,H=innerHeight;const els=[document.getElementById('rbApp')].concat(SCREENS.map(id=>document.getElementById(id)));
  for(const e of els){if(!e||e.hidden)continue;const r=e.getBoundingClientRect();if(r.left>1||r.top>1||r.right<W-1||r.bottom<H-1)continue;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.99)continue;
   const m=/rgba?\(([^)]*)\)/.exec(c.backgroundColor);const a=m?(m[1].split(',').length>3?+m[1].split(',')[3]:1):0;if(a>=.99){/* and it sits above the 3D canvas */const st=document.elementsFromPoint(W/2,H/2);const ci=st.indexOf(document.getElementById('scene'));const ei=st.findIndex(x=>x===e||e.contains(x));if(ei>=0&&(ci<0||ei<ci)){on=true;break;}}}}}catch(e){on=false;}
 if(on!==!!menuCovers.on){try{document.body.classList.toggle('tops-covered',on);}catch(e){}}menuCovers.on=on;return on;}
{const st=document.createElement('style');st.textContent='body.tops-covered #grain{display:none}';/* the film grain sits under the opaque menu (z 2 vs 50) but kept animating and blending a 4x-screen layer */document.head.appendChild(st);}
window.TOPS_menuCovers=()=>({on:!!menuCovers.on,skipped:menuCovers.skipped|0});
function tick(now){if(S&&!S.done){const t=(now-S.t0)/1000;const nv=effNerves();
  if(window.TH_LEGACY){const amp=2.0*S.barrel.sway*swayMult()*(1+nv*.4)*(0.7+armMult()*.3);S.sway={x:amp*(Math.sin(t*1.7)+.5*Math.sin(t*4.3+1)),y:amp*(Math.sin(t*2.1+2)+.5*Math.sin(t*3.7))};}
  else{if(!tick._p||now-tick._pt>250){tick._p=throwParams();tick._pt=now;}const tp=tick._p;S.tp=tp;
   if(S.pulling&&S.lock){S.sway={x:S.lock.x-S.aim.x,y:S.lock.y-S.aim.y};}else{S.sway=driftAt(now,tp);if(window.TOPS_DRUNK){const dd=TOPS_DRUNK(now);if(dd){S.sway.x+=dd.x;S.sway.y+=dd.y;}}}}
  if(S.pulling){S.pull=pullAt(performance.now());if(S.pull>=1.0)S.over=true;if(S.pull>=1.3)release(null,'auto');}S.inWin=S.pulling&&isPerfect();feelBreathe(now);
  const thr=targetHR();S.hr+=(thr-S.hr)*.02;const period=60000/S.hr;if(now-lastBeat>period){lastBeat=now;if(nv>1.2)sfxHeart();ecgBeat=now;if(!window.TH_LEGACY&&tick._p&&!(S.pulling&&S.lock))driftBeat(now,tick._p);}
  /* #16: this runs every frame. Assigning textContent/hidden counts as a page change even when the value is the same, so it forced a style recalc of the whole page every frame, which costs more as the page grows (~1,240 nodes in match 1, ~1,730 from match 2). Write only when the value changes; the page ends up the same every frame. */setTx($('bpm'),String(Math.round(S.hr)));$('hr').classList.toggle('hot',S.hr>105);{const pc=nervePct();const me=S.p[S.cur];const mine=!me.ai&&!S.mateTurn&&!S.practice;setTx($('hrNote'),mine&&nv>.3?`${nerveCause()} · spread +${pc}%`:(mine?'Settled':''));const bs=$('btnSettle'),hid=!(S.breathe||(mine&&nv>.9&&!S.settled&&!S.pulling&&!S.busy));if(bs&&bs.hidden!==hid)bs.hidden=hid;}ecgDraw(now,S.hr,nv);{const o=Math.round((S.view===1?0:Math.min(.7,Math.max(0,nv-.8)*.22))*100)/100;const ne=$('nerve');if(ne&&ne._o!==o){ne._o=o;ne.style.opacity=o;}}/* #20: write only on change, like setTx */sfxPubAmbience();
  if(S.fx&&S.fx.length)cardFxTick();S.nerves=nv;S.sigma=(!window.TH_LEGACY&&S.pulling&&S.lockTp)?ringR(relErrMs(S.pull)+(S.relAdd||0)-(S.markerShift||0),S.lockTp)/1.794:currentSigma();S.reader=false;feelPadTick(now);if(menuCovers.on){/* a match is live: everything shows again */menuCovers.on=false;menuCovers.t=0;try{document.body.classList.remove('tops-covered');}catch(e){}}V.frame(now,S);shownPush(now);ftPush(now);}
 else{if(S){S.nerves=0;S.sigma=0;}feelPadTick(now);if(!menuCovers(now))V.frame(now,S);else menuCovers.skipped=(menuCovers.skipped|0)+1;}
 fxTick();requestAnimationFrame(tick);}
requestAnimationFrame(tick);
if('speechSynthesis'in window){try{speechSynthesis.getVoices();}catch(e){}}

// ===== WORLD (sprint) =====
// Six regulars with identity, AI pressure with temperament, intro band, result line, Run route choices, season strip, table movement, reactive rival.
// The pure part (down to "WORLD pure end") is also evaluated by sim_world.js against engine.js, so it must not touch the DOM or S.
const OPPS={
 'Deano Marsh':{dbl:20,temper:'Hothead',she:false,habit:'Chalks his fingers between every dart and makes sure you see it.',tiers:[]},
 'Tama Rewiri':{dbl:16,temper:'Ice',she:false,habit:'Three slow breaths at the oche. Same rhythm every visit.',tiers:[1,2]},
 'Pete the Plumber':{dbl:8,temper:'Grinder',she:false,habit:'Wipes each flight on his overalls before he throws.',tiers:[0,1]},
 'Shazza':{dbl:10,temper:'Showman',she:true,habit:'Points at the double before she throws at it.',tiers:[0,1]},
 'Cody Harwood':{dbl:18,temper:'Showman',she:false,habit:'Turns to the room after every ton, whether it clapped or not.',tiers:[2,3,4]},
 'Kev Marsh':{dbl:12,temper:'Grinder',she:false,habit:'Counts the chalk out loud before he looks at the board.',tiers:[1,2,3]}};
const TEMPER={
 Hothead:{k:1.4,settleAt:2.2,col:'#e2362f',tell:'Pressure bites hardest: spread up to +15% on a finish or a decider.'},
 Ice:{k:.5,settleAt:1.6,col:'#6fb3e0',tell:'Pressure barely moves the spread. No gifts.'},
 Grinder:{k:.85,settleAt:1.1,col:'#d4a84a',tell:'Steady under pressure, settles once a leg when it bites.'},
 Showman:{k:1.1,settleAt:1.8,col:'#b58cff',tell:'Loose when ahead, tight when behind.'}};
const HABITS=['Taps the barrel on the oche before each dart.','Never looks at the scoreboard. Asks the chalker instead.','Rolls the shoulders twice before every visit.','Drinks only between legs. Never during.','Stands with the back foot off the line until the last second.','Hums under the breath on a finish.'];
function oppProfile(name){const o=OPPS[name];if(o)return Object.assign({name,regular:true},o);const h=hash(name||'');const ts=Object.keys(TEMPER);return {name,regular:false,dbl:[20,16,18,12,10,8][h%6],temper:ts[(h>>>4)%ts.length],she:false,habit:HABITS[(h>>>8)%HABITS.length],tiers:[]};}
function oppPref(p){return oppProfile(p&&p.name).dbl;}
function regularsFor(tier){return Object.keys(OPPS).filter(n=>OPPS[n].tiers.includes(tier));}
// AI pressure: same triggers as situational() for the human (base stage, on a finish, deciding leg, decider, opponent on a finish), scaled by temperament.
function aiPressureRaw(c){let n=c.press||0;if(c.score<=50)n+=1;if(c.legs===c.need-1||c.oppLegs===c.need-1)n+=1;if(c.decider)n+=.5;if(c.oppScore<=40)n+=.8;return n;}
function aiTemperK(temper,c){const t=TEMPER[temper]||TEMPER.Grinder;let k=t.k;if(temper==='Showman'){if(c.legs>c.oppLegs)k*=.65;else if(c.legs<c.oppLegs)k*=1.3;}return k;}
function aiPressure(c,temper,settled){let raw=aiPressureRaw(c)*aiTemperK(temper,c);if(settled)raw*=.5;const mult=1+Math.min(.15,raw*.05);const label=mult<1.04?'Settled':mult<1.10?'Under pressure':'Rattled';return {raw,mult,label,lvl:mult<1.04?0:mult<1.10?1:2};}
// Base sigma recalibrated per tier so the pressure model does not lower every tier's average (table from sim_world.js --calib).
const AI_RECAL=[1,0.985,1,1,0.99,1,0.99];
function aiBaseSigma(avgv,tier,recal){return sigmaFor(avgv)*(recal==null?(AI_RECAL[tier]||1):recal);}
// --- WORLD pure end ---
function aiCtx(){const me=S.p[1],op=S.p[0];return {press:S.tier.press,score:me.score,oppScore:op.score,legs:me.legs,oppLegs:op.legs,need:Math.ceil(S.bestOf/2),decider:!!S.decider};}
function aiSigMult(thrower){return (S&&S.aiPress&&thrower===S.p[1])?S.aiPress.mult:1;}
function renderOppState(){const el=$('oppState');if(!el)return;const show=S&&!S.done&&ui.mode==='career'&&!S.practice&&S.p[1].ai&&S.aiPress;if(!show){el.hidden=true;return;}el.hidden=false;el.textContent=S.aiPress.label;el.className='opp-state lv'+S.aiPress.lvl+(S.aiPress.settledNow?' settling':'');
 // phones: the name cell is too narrow to hold the label, so float it just above the opponent's row instead of truncating the name
 if(innerWidth<=700){const r=$('pl1').getBoundingClientRect();el.classList.add('float');let nx=r.left+12;try{const t=$('name1').firstChild;if(t&&t.nodeType===3){const rg=document.createRange();rg.selectNodeContents(t);nx=rg.getBoundingClientRect().right+8;}}catch(e){}el.style.top=Math.max(0,r.top+r.height/2-8)+'px';el.style.left=Math.min(nx,innerWidth-200)+'px';el.style.right='auto';}else{el.classList.remove('float');el.style.top='';el.style.right='';}}
function shortName(n){return n==='Deano Marsh'?'Deano':n==='Pete the Plumber'?'Pete':String(n||'').split(' ')[0];}
function h2hFor(c,name){if(!c)return null;c.h2h=c.h2h||{};return c.h2h[name]||(c.h2h[name]={w:0,l:0,res:[]});}
function h2hLine(c,name,venue){const h=c&&c.h2h&&c.h2h[name];if(!h||!h.res.length)return {hd:'First meeting',mem:''};const L=h.res[h.res.length-1];const sn=shortName(name);const where=L.venue?` at ${L.venue}`:'';let mem=L.won?`Last time: you won ${L.me}–${L.op}${where}, averaging ${L.avg}.`:`Last time: ${sn} beat you ${L.op}–${L.me}${where}.`;if(!L.won&&L.coAtt>=4&&L.coHit<=1)mem=`Last time: ${sn} beat you ${L.op}–${L.me}${where}. You missed ${L.coAtt-L.coHit} darts at doubles.`;if(L.won&&L.me-L.op>=2&&L.op===0)mem=`Last time: you whitewashed ${sn} ${L.me}–${L.op}${where}.`;return {hd:`H2H ${h.w}–${h.l}`,mem};}
function formChips(list){const a=(list||[]).slice(-5);if(!a.length)return '<span class="io-none">No form yet</span>';return a.map(r=>`<i class="${r}">${r}</i>`).join('');}
function oppForm(c,name){const sn=c&&c.season;if(sn&&sn.formLog&&sn.formLog[name])return sn.formLog[name];const h=c&&c.h2h&&c.h2h[name];return h?h.res.map(r=>r.won?'L':'W'):[];}
function oppSeasonAvg(c,name,fallback){const sn=c&&c.season;const row=sn&&sn.table.find(r=>r.name===name);return row?row.avg:fallback;}
function renderIntroOpp(p1,opts,t){const host=$('introOpp');if(!host)return;const c=career();if(opts.mode!=='career'||opts.practice||!p1||!p1.ai){host.hidden=true;host.innerHTML='';return;}
 const prof=oppProfile(p1.name);const tp=TEMPER[prof.temper];const hh=h2hLine(c,p1.name,t&&t.venue);const n=c&&c.next;const boss=!!(c&&c.run&&n&&n.boss&&n.oppName===p1.name);
 const dbl=prof.dbl==='BULL'?'Bull':'D'+prof.dbl;
 host.innerHTML=`<div class="io-row"><span class="io-pill" style="--tc:${tp.col}">${prof.temper}</span><span class="io-tell">${tp.tell}</span></div>`+
  `<div class="io-row io-facts"><span>Season avg <b>${oppSeasonAvg(c,p1.name,opts.oppAvg)}</b></span><span class="io-form">Last five ${formChips(oppForm(c,p1.name))}</span><span>Likes <b>${dbl}</b></span><span class="io-h2h"><b>${hh.hd}</b></span></div>`+
  `<div class="io-row io-mem">${hh.mem?`<span>${hh.mem}</span>`:''}<span class="io-habit">${prof.habit}</span></div>`;
 host.hidden=false;
 if(boss){$('introTier').textContent=`Mini boss · ${t.n}`;const st=$('introStakes');if(st)st.textContent=c.tier>=6?`Beat ${shortName(p1.name)}: run complete`:`Beat ${shortName(p1.name)}: ${TIERS[c.tier+1].n} unlocks`;}}
function introSkippable(el){const host=$('introOpp');let gone=false;const go=(ev)=>{if(gone)return;if(ev&&ev.type==='keydown'&&!['Space','Enter','Escape'].includes(ev.code))return;gone=true;if(ev){try{ev.stopPropagation();ev.preventDefault();}catch(x){}}if(S)S.noPullUntil=performance.now()+450;document.removeEventListener('pointerdown',go,true);document.removeEventListener('keydown',go,true);el.classList.remove('show');if(host)host.hidden=true;};setTimeout(()=>{document.addEventListener('pointerdown',go,true);document.addEventListener('keydown',go,true);},350);setTimeout(go,3050);}
const _introCard=introCard;introCard=function(p0,p1,opts,t){_introCard(p0,p1,opts,t);renderIntroOpp(p1,opts,t);introSkippable($('intro'));};
const _beginMatch=beginMatch;beginMatch=function(opts){_beginMatch(opts);if(!S)return;const p1=S.p[1];if(p1.ai&&opts.mode==='career'&&!opts.practice){p1.sigma=aiBaseSigma(opts.oppAvg*(isRun()&&!opts.practice?(1-SK().opp):1),opts.tier);S.aiPress={raw:0,mult:1,label:'Settled',lvl:0};S.aiSettled=false;const c=career();S.draftWin=(c&&c.run&&c.next&&c.next.draftWin)||5;S.boss=!!(c&&c.run&&c.next&&c.next.boss);}else S.aiPress=null;renderOppState();};
const _startTurn=startTurn;startTurn=function(){_startTurn();if(!S||S.done)return;const me=S.p[S.cur];
 if(S.cur===1&&me.ai&&!S.practice&&!S.mateTurn&&S.aiPress){if(me.legDarts===0)S.aiSettled=false;const prof=oppProfile(me.name);const ctx=aiCtx();let pr=aiPressure(ctx,prof.temper,false);if(!S.aiSettled&&pr.raw>=TEMPER[prof.temper].settleAt){S.aiSettled=true;pr=aiPressure(ctx,prof.temper,true);pr.settledNow=true;}S.aiPress=pr;renderOppState();}
 if(S.cur===0&&S.p[1].legs>S.p[0].legs)S.wasBehind=true;};
// result line + head-to-head memory
function oppResultLine(c,me,op,prof,h){const n=shortName(prof.name),T=prof.temper,she=prof.she;const he=she?'she':'he',his=she?'her':'his';const margin=me.legs-op.legs;const meetings=h.res.length;const prevW=h.w,prevL=h.l;const won=S.won;
 if(won&&prevW===0&&prevL>=1)return `First time you have beaten ${n}. ${prevL===1?'Took one go.':`Took ${prevL+1} goes.`}`;
 if(meetings===4)return `Fifth meeting with ${n}. ${prevW+(won?1:0)}–${prevL+(won?0:1)} between you now.`;
 if(won&&h.res.length>=2&&h.res.slice(-2).every(r=>r.won))return `Three in a row over ${n}. That is a habit now.`;
 if(!won&&h.res.length>=2&&h.res.slice(-2).every(r=>!r.won))return `Three straight to ${n}. ${T==='Hothead'?`${he[0].toUpperCase()+he.slice(1)} will mention it. Loudly.`:T==='Ice'?`${he[0].toUpperCase()+he.slice(1)} did not say a word. Did not need to.`:`Time to change something.`}`;
 if(won&&S.wasBehind){return {Hothead:`${n} had it and lost it. The chalk hand was shaking by the end.`,Ice:`${n} never blinked. You outscored a wall from behind.`,Grinder:`${n} ground it to a decider and you found the extra gear.`,Showman:`${n} was playing to the room when ahead. The room went quiet.`}[T];}
 if(!won&&margin===-1){return {Hothead:`${n} shook your hand for half a second. ${he[0].toUpperCase()+he.slice(1)} knows it was close.`,Ice:`${n} closed it like ${he} always does. One leg. That is the whole gap.`,Grinder:`${n} outlasted you. One leg, and ${his} doubles did it.`,Showman:`${n} milked the last double. One leg in it; ${he} will tell it as ten.`}[T];}
 if(won&&(op.legs===0||margin>=2)){return {Hothead:`${n} was arguing with the chalk by the second leg. Comfortable.`,Ice:`${n} took it quietly. ${he[0].toUpperCase()+he.slice(1)} will be back with a plan.`,Grinder:`${n} kept grinding, but the scoring gap was too wide tonight.`,Showman:`${n} played to the room. The room watched you.`}[T];}
 return '';}
const _endMatch=endMatch;endMatch=function(){_endMatch();const c=career();const line=$('resOppLine');if(line){line.hidden=true;line.textContent='';}if(!c||ui.mode!=='career'||S.practice||!S.p[1].ai)return;
 const me=S.p[0],op=S.p[1];const prof=oppProfile(op.name);const h=h2hFor(c,op.name);let txt='';try{txt=oppResultLine(c,me,op,prof,h)||'';}catch(e){txt='';}
 h.res=h.res.concat({won:!!S.won,me:me.legs,op:op.legs,avg:+avg(me).toFixed(0),oavg:+avg(op).toFixed(0),tier:ui.tier,venue:S.tier.venue,coAtt:me.coAtt,coHit:me.coHit,when:Date.now()}).slice(-8);if(S.won)h.w++;else h.l++;persist();
 if(line&&txt){line.textContent=txt;line.style.borderLeftColor=(TEMPER[prof.temper]||{}).col||'';line.hidden=false;}};
// season: regulars in the table, form log, movement, rival texts keyed to the table
const _newSeason=newSeason;newSeason=function(c){const sn=_newSeason(c);if(sn&&!sn.ko){const regs=regularsFor(c.tier).filter(n=>!sn.table.some(r=>r.name===n));const cands=sn.table.filter(r=>!r.you&&r.name!==RIVAL.name&&!OPPS[r.name]);regs.forEach((nm,i)=>{const row=cands[i];if(!row)return;const old=row.name;row.name=nm;row.avg=Math.round(TIERS[c.tier].avg+regOff(c.tier,nm)+((sn.n||1)-1)*.5);/* the regular keeps his own average, not the slot's */sn.fixtures=sn.fixtures.map(f=>f===old?nm:f);});sn.formLog={};persist();}return sn;};
const _simOthers=simOthers;simOthers=function(sn,a,b){const before=sn.table.map(r=>[r,r.w,r.l]);_simOthers(sn,a,b);sn.formLog=sn.formLog||{};before.forEach(([r,w,l])=>{if(r.you)return;const k=r.w>w?'W':r.l>l?'L':null;if(k)sn.formLog[r.name]=(sn.formLog[r.name]||[]).concat(k).slice(-8);});};
function posMap(sn){const m={};seasonPos(sn).forEach((r,i)=>m[r.you?'__you':r.name]=i+1);return m;}
const RIVAL_TABLE={passed:[["Table says you're above me. Table's wrong. See you at the end."],["Enjoy the view. It's temporary."],["Passed me on the table. Not on the board. Big difference."]],passedBy:[["Normal service. Have a look at the table, fill-in."],["Back where I belong. You can stay down there."],["Told the boys you'd fade. Table agrees with me."]]};
const _seasonFixtureResult=seasonFixtureResult;seasonFixtureResult=function(c,me,op){const sn=c.season;const before=sn?posMap(sn):null;_seasonFixtureResult(c,me,op);if(!sn)return;
 sn.formLog=sn.formLog||{};if(S.oppKey&&sn.table.some(r=>r.name===S.oppKey))sn.formLog[S.oppKey]=(sn.formLog[S.oppKey]||[]).concat(S.won?'L':'W').slice(-8);
 const after=posMap(sn);sn.moves={};Object.keys(after).forEach(k=>{sn.moves[k]=(before&&before[k]!=null)?before[k]-after[k]:0;});sn.lastPos=after.__you;
 if(!sn.ko&&sn.table.some(r=>r.name===RIVAL.name)&&!S.rival){sn.rivalTxt=sn.rivalTxt||{};const y0=before.__you,r0=before[RIVAL.name],y1=after.__you,r1=after[RIVAL.name];const idx=Math.min(2,Math.floor(c.tier/2));
  if(y0>r0&&y1<r1&&!sn.rivalTxt.passed){sn.rivalTxt.passed=true;S.tableMsg={from:RIVAL.name,lines:RIVAL_TABLE.passed[idx],replies:[['We’ll see','ok']]};}
  else if(y0<r0&&y1>r1&&!sn.rivalTxt.passedBy){sn.rivalTxt.passedBy=true;S.tableMsg={from:RIVAL.name,lines:RIVAL_TABLE.passedBy[idx],replies:[['Mute','ok']]};}}
 persist();};
const _afterResult=afterResult;afterResult=function(L){if(L&&L.tableMsg){const m=L.tableMsg;L.tableMsg=null;showMsg(m,()=>afterResult(L));return;}return _afterResult(L);};
const _renderTable=renderTable;renderTable=function(host,sn,full){_renderTable(host,sn,full);if(!sn||sn.ko||!sn.moves||!host)return;const played=sn.table.some(r=>r.p>0);if(!played)return;
 [...host.querySelectorAll('tbody tr')].forEach(tr=>{if(tr.classList.contains('gap'))return;const td=tr.children[1];if(!td)return;const nm=tr.classList.contains('you')?'__you':(td.firstChild&&td.firstChild.textContent||'').trim();const mv=sn.moves[nm];if(mv==null)return;const em=document.createElement('em');em.className='mv '+(mv>0?'up':mv<0?'dn':'same');em.innerHTML=mv>0?'▲<span>'+mv+'</span>':mv<0?'▼<span>'+(-mv)+'</span>':'–';td.appendChild(em);});};
function renderStrip(sn,c){const host=$('hubStrip');if(!host)return;if(!sn||sn.ko){host.hidden=true;host.innerHTML='';return;}host.hidden=false;const wk=Math.min(sn.week,sn.len);const res=sn.results||[];const last=res[res.length-1];const t=TIERS[c.tier];
 const avgOf=nm=>{const r=sn.table.find(x=>x.name===nm);return r?r.avg:t.avg;};const cell=(cls,lab,name,sub)=>`<div class="hs-cell ${cls}"><small>${lab}</small><b>${name}</b><span>${sub}</span></div>`;
 const lastOk=last&&last.op&&last.w!=null&&last.me!=null&&last.op2!=null;const prev=lastOk?cell('prev '+(last.won?'w':'l'),`Week ${last.w} · ${last.won?'Won':'Lost'}`,shortName(last.op),`${last.me}–${last.op2}`):(last?cell('prev '+(last.won?'w':'l'),'Previous',last.won?'Won':'Lost','Result details unavailable'):cell('prev none','Previous','–','Season start'));
 const curNm=sn.done?null:sn.fixtures[wk-1];const cur=curNm?cell('cur',`Week ${wk} · now`,shortName(curNm),`Avg ${avgOf(curNm)}${curNm===RIVAL.name?' · rival':''}`):cell('cur none','Season','Done','Table final');
 const nxtNm=(!sn.done&&wk<sn.len)?sn.fixtures[wk]:null;const nxt=nxtNm?cell('next',`Week ${wk+1}`,shortName(nxtNm),`Avg ${avgOf(nxtNm)}${nxtNm===RIVAL.name?' · rival':''}`):cell('next none','After this','–',sn.done?'':'Season ends');
 host.innerHTML=prev+cur+nxt;}
// The Run: two route nodes after each match
function runPool(tier){const set=new Set((AINAMES[tier]||[]).concat(regularsFor(tier)));return [...set];}
function runRouteNodes(c){const m=c.wins+c.losses+1;if(c.routeOpts&&c.routeOpts.m===m&&c.routeOpts.tier===c.tier)return c.routeOpts.nodes;const base=nextOpponent();const a=Object.assign({},base);let b;
 if(base.boss){const tw=base.twist||(rseed('bt'+m)<.5?'din':'301');a.twist=null;a.din=false;a.draftWin=3;b=Object.assign({},base,{twist:tw,din:tw==='din',draftWin:5});}
 else{const pool=runPool(c.tier).filter(n=>n!==base.oppName);const regs=pool.filter(n=>OPPS[n]);const pick=(regs.length&&rseed('rr'+m)<.7)?regs[Math.floor(rseed('rn'+m)*regs.length)]:pool[Math.floor(rseed('rn'+m)*pool.length)];
  if(base.twist){a.draftWin=5;b=Object.assign({},base,{oppName:pick,twist:null,din:false,oppAvg:base.oppAvg-2,draftWin:3});b.routeAdj=-2; /* a deliberately different opponent strength, kept through re-derivation (Hayden 22:54) */}
  else{a.draftWin=3;const tw=rseed('tw2'+m)<.5?'din':'301';b=Object.assign({},base,{oppName:pick,twist:tw,din:tw==='din',oppAvg:base.oppAvg+Math.max(1,Math.min(3,(window.TOPS_ROUTE_CAP?TOPS_ROUTE_CAP(c.tier):1e9)-base.oppAvg)),draftWin:5});b.routeAdj=b.oppAvg-base.oppAvg; /* +3 / -2 on the banded figure (the old clamps compared it with the raw tier table) */}}
 a.oppKey=a.oppName;b.oppKey=b.oppName;c.routeOpts={m,tier:c.tier,nodes:[a,b]};persist();return [a,b];}
function routeCardEl(n,c,i){const t=TIERS[c.tier];const _o=(c.routeOpts&&c.routeOpts.nodes||[]).find(x=>x!==n);const _d=(_o&&!n.boss)?n.oppAvg-_o.oppAvg:0;const el=document.createElement('button');el.type='button';const col=n.boss?'#f0c060':n.twist?'#e2362f':'#e9e4d8';el.className='pcard pick route '+(n.boss?'rr-l':n.twist?'rr-r':'rr-c')+(_d>0?' rr-tough':_d<0?' rr-easy':'');el.style.setProperty('--su',col);
 const tw=n.twist==='301'?'301 sprint · every leg starts on 301':n.twist==='din'?'Double in · open on a double':'No twist · straight 501';const fmt=n.legs===1?'One leg':'Best of '+n.legs;
 el.innerHTML=`<div class="rc-top"><span class="rc-pip">${n.boss?'★':n.twist?'♥':'♠'}</span><span class="rc-rar">${n.boss?'Mini boss':_d>0?'Tougher route':_d<0?'Easier route':'Route '+(i===0?'A':'B')}</span></div><div class="rc-art rc-face">${portraitImg(oppLookFor(n),n.oppName,c.tier)}</div><div class="rc-name">${n.oppName}</div><div class="rc-text"><b class="rc-eff">Averages about ${n.oppAvg}${(()=>{try{const o=(c.routeOpts&&c.routeOpts.nodes||[]).find(x=>x!==n);if(!o||n.boss)return '';const d=n.oppAvg-o.oppAvg;return d>0?`<span class="rc-tough">▲ Tougher by ${d}</span>`:d<0?`<span class="rc-easy">▼ Easier by ${-d}</span>`:'';}catch(e){return '';}})()}</b><span class="rc-why">${fmt} · ${tw}</span></div><div class="rc-bot"><span>Win: <b class="rc-draft${n.draftWin>=5&&!n.boss?' rc-big':''}">${n.draftWin}-card draft</b><br>Lose: a life</span><span class="rc-pip">${n.boss?'★':n.twist?'♥':'♠'}</span></div>`;
 el.style.animationDelay=(i*90)+'ms';return el;}
function showRunRoute(done){const c=career();if(!c||!c.run)return done&&done();const nodes=runRouteNodes(c);const t=TIERS[c.tier];
 $('perkWhy').textContent=`The Run · ${t.n} · match ${c.wins+c.losses+1}`;document.querySelector('#perk .res-win').textContent=nodes[0].boss?'The boss. Pick the format':'Pick your route';
 $('perkCount').innerHTML=nodes[0].boss?`Best of 3 against the strongest player in the room. Beat them and ${c.tier>=6?'the run is complete':TIERS[c.tier+1].n+' unlocks'}. The twist route pays a bigger draft.`:`Choose your opponent. Tougher: 5-card draft. Easier: 3-card draft. Lose either, lose a life. ${'♥'.repeat(c.lives||0)}${'♡'.repeat(Math.max(0,3-(c.lives||0)))}`;
 $('btnPerkLater').hidden=true;$('btnPerkReroll').hidden=true;$('perkFlush').hidden=true;$('perkKeyHelp').hidden=true;
 const host=$('perkCards');host.innerHTML='';host.classList.add('deck','wroutes');host.style.gridTemplateColumns='';host.dataset.lock='';
 nodes.forEach((n,i)=>{const el=routeCardEl(n,c,i);el.onclick=()=>{if(host.dataset.lock)return;host.dataset.lock='1';el.classList.add('taken');[...host.children].forEach(o=>{if(o!==el)o.classList.add('fade');});c.next=Object.assign({},n);c.routeOpts=null;persist();setTimeout(()=>{host.dataset.lock='';host.classList.remove('wroutes');done&&done();},480);};host.appendChild(el);});
 showScreen('perk');}
function needRunRoute(c){return !!(c&&c.run&&!c.next&&c.stage!=='intro');}
const _showHub=showHub;showHub=function(tab){const c=career();if(needRunRoute(c)){showRunRoute(()=>_showHub(tab));return;}const r=_showHub(tab);try{renderStrip((c&&!c.run&&c.season)||null,c);}catch(e){}return r;};
const _playNext=playNext;playNext=function(){const c=career();if(needRunRoute(c)){showRunRoute(()=>_playNext());return;}return _playNext();};
const _nextOpponent=nextOpponent;nextOpponent=function(){const c=career();const r=_nextOpponent();if(c&&c.run&&r&&!r.boss&&!r.intro&&!r.decider){const pool=runPool(c.tier);const nm=pool[(c.tierPlayed+hash(c.tier+'w'+(c.seed||'')))%pool.length];r.oppName=nm;r.oppKey=nm;}return r;};



// ----- up to four players: helpers used by the engine -----
function legsPlayed(){if(!S)return 0;if(S.teams)return S.p[0].legs+S.p[1].legs;return S.p.reduce((a,p)=>a+(p.legs||0),0);}
function sameTeam(i,j){return !!(S&&S.teams&&((i-j+4)%2===0));}
function oppOf(i){if(!S)return null;const n=S.p.length;if(n<=2)return S.p[1-i]||S.p[0];let best=null;for(let k=1;k<n;k++){const j=(i+k)%n;if(sameTeam(i,j)||S.p[j].left)continue;if(!best||S.p[j].score<best.score)best=S.p[j];}return best||S.p[(i+1)%n];}
function mpRows(){if(!S)return [];if(S.p.length<=2)return [S.p[0],S.p[1]];let o=S.p[1];if(S.cur!==0&&!sameTeam(S.cur,0))o=S.p[S.cur];else{for(let k=1;k<S.p.length;k++){const j=(S.cur+k)%S.p.length;if(j!==0&&!sameTeam(j,0)&&!S.p[j].left){o=S.p[j];break;}}}return [S.p[0],o];}
function mpMirror(i){if(!S||!S.teams)return;const me=S.p[i],tm=S.p[(i+2)%4];if(!me||!tm)return;tm.score=me.score;tm.legs=me.legs;tm.opened=me.opened;}
function mpBoardRender(){try{chatSync();}catch(e){}const el=$('mpBoard');if(!el)return;const show=!!(S&&S.online&&(S.p.length>2||S.pub)&&!S.done);el.hidden=!show;if(!show)return;
 const rows=S.teams?[[0,2],[1,3]]:S.p.map((_,i)=>[i]);const P=S.pub;el.classList.toggle('pub',!!P);
 el.innerHTML=rows.map(ix=>{const p=S.p[ix[0]];const cur=ix.includes(S.cur);const nm=ix.map(i=>S.p[i].name+(S.p[i].left?' (left)':'')).join(' & ');
  let wob='';if(P){const lv=Math.max(...ix.map(i=>P.p[i]?P.p[i].lvl:0)),pd=Math.max(...ix.map(i=>P.p[i]?P.p[i].pend:0)),tot=ix.reduce((a,i)=>a+(P.p[i]?P.p[i].tot:0),0);
   wob=`<span class="mpb-w" title="Wobble ${lv} of 8, ${tot} sips this match"><i class="pint" aria-hidden="true"></i><span class="mpb-wm"><b style="width:${Math.round(Math.min(8,lv)/8*100)}%"></b>${pd?`<u style="left:${Math.round(Math.min(8,lv)/8*100)}%;width:${Math.round(Math.min(8-lv,pd)/8*100)}%"></u>`:''}</span><em>${lv}/8</em></span>`;}
  const chip=(P&&ix.includes(0)&&P.buff)?`<span class="mpb-chip ${P.buff.kind}">${P.buff.kind==='hot'?'Hot hand':'Steady'}</span>`:'';
  const mb=P&&P.myBets?P.myBets.find(b=>ix.includes(b.ti)):null;const nx=(()=>{for(let k=1;k<S.p.length;k++){const j=(S.cur+k)%S.p.length;if(!S.p[j].left)return j;}return -1;})();const isNext=!cur&&ix.includes(nx);const sub=(cur?'Throwing':isNext?'Next':(p.legs?`${p.legs} leg${p.legs>1?'s':''}`:''))+(mb?`<span class="mpb-bet">Your bet: ${mb.n}</span>`:'')+((P&&P.cards&&P.cards.n[p.key])?`<span class="mpb-cards">🃏 ${P.cards.n[p.key]} card${P.cards.n[p.key]>1?'s':''}</span>`:'');
  return `<div class="mpb-row ${cur?'on':''} ${ix.includes(0)?'me':''}"><span class="mpb-n"><b>${nm.replace(/</g,'&lt;')}${ix.some(i=>S.p[i].tag)?'<em class="ak-tag">🪰 Ant Killer</em>':''}</b><small>${sub}${chip}</small></span>${wob}<strong>${p.score}</strong></div>`;}).join('')+(P&&!S.done?(()=>{const d=P.p[0];return `<div class="mpb-me">Wobble ${d.lvl}/8${d.pend?` · +${d.pend} pending`:''}${d.lvl?` · spread +${Math.round(.11*Math.min(8,d.lvl)*100)}% · sway +${Math.round(.22*Math.min(8,d.lvl)*100)}%`:''}</div>`;})():'');
 pubBandPlace();}

// ===== MP: multiplayer as its own mode (pros, lobby, invite links, records, rematch) =====
const PROS=[
 {id:'jet',n:'Luke Lidl-er',k:'The Nook',sc:9,fi:4,cmp:6,rhy:5,line:'Fearless on the 20s. Doubles come and go.',look:{skin:'#f1c9a5',hair:'#2a1d14',hairStyle:'short',shirt:'#1e5fb3',beard:0}},
 {id:'ivy',n:'Luke Humfrees',k:'Cool Han',sc:5,fi:9,cmp:6,rhy:5,line:'Steady scorer. Takes doubles out like a surgeon.',look:{skin:'#f1c9a5',hair:'#5a3a22',hairStyle:'short',shirt:'#2a7a4b',beard:1}},
 {id:'tui',n:'Gerwyn Prize',k:'The Niceman',sc:6,fi:6,cmp:9,rhy:4,line:'Ice cold under pressure. Release can drift.',look:{skin:'#d9a06f',hair:'#111111',hairStyle:'buzz',shirt:'#222831',beard:2}},
 {id:'rex',n:'Gary Henderson',k:'The Flying Scotchman',sc:6,fi:5,cmp:5,rhy:9,line:'Smoothest throw in the game. Biggest perfect window.',look:{skin:'#f1c9a5',hair:'#c9c4b8',hairStyle:'short',shirt:'#7a2d2d',beard:0}},
 {id:'shane',n:'Phil Tailor',k:'The Flower',sc:6,fi:7,cmp:7,rhy:5,line:'Sixteen-time legend energy. Nothing flashy, nothing missing.',look:{skin:'#f1c9a5',hair:'#3a2a1a',hairStyle:'short',shirt:'#c9a227',beard:0}},
 {id:'lola',n:'Peter Right',k:'Snakebait',sc:7,fi:7,cmp:3,rhy:7,line:'Hair like a parrot, nerves like jelly. Brilliant when it flows.',look:{skin:'#f1c9a5',hair:'#3fa34d',hairStyle:'short',shirt:'#6b2fa3',beard:0}},
 {id:'hemi',n:'Michael van Gherkin',k:'Mighty Pickle',sc:8,fi:6,cmp:4,rhy:6,line:'Scores in bunches, roars every treble, wobbles on match darts.',look:{skin:'#f1c9a5',hair:'#111111',hairStyle:'buzz',shirt:'#2a8a4a',beard:0}},
 {id:'ray',n:'Fallon Sherlock',k:'Queen of the Pallets',sc:4,fi:8,cmp:6,rhy:7,line:'Weak on the 20, deadly on doubles and the bull.',look:{skin:'#f1c9a5',hair:'#b5402a',hairStyle:'long',shirt:'#e9e4d8',beard:0}}];
const MP_LEVELS=[{v:0,n:'Pub',arm:.35,tier:0},{v:1,n:'Club',arm:.6,tier:2},{v:2,n:'Pro',arm:.85,tier:6}];
const MP_BARREL={id:'mp',n:'Match darts',base:4.6,tol:1.08,sway:.9,price:0};
const SK_ZERO=(()=>{const z={};['spread','score','dbl','sway','win','comp','press','prize','fee','chase','fin','groove','cover','jit','xp','armGrow','t20','first','third','afterTon','setup','bigDbl','bull','behind','ahead','lastLife','floor','decay','opp','hand','reroll','perC','perD','perS','perH'].forEach(k=>z[k]=0);return z;})();
function proOf(id){return PROS.find(p=>p.id===id)||PROS[4];}
function myPro(){return proOf(save.mpPro||'shane');}
function mpScMult(p){return 1.20-.04*p.sc;}
function mpFiMult(p){return 1.20-.04*p.fi;}
function mpCompMult(p){return 1.45-.09*p.cmp;}
function mpRhyLv(p){return p.rhy*2;}
// accuracy in online matches: your pro, the host's standard, no career stats, perks or kit
function mpSigma(){const P=S.mp.me,b=S.barrel;const nv=spreadNerves();const sk=S.mp.arm;const dt=Math.abs(S.pull-SWEET)*PULL_MS/1000;const lv=mpRhyLv(P);
 const win=.42*b.tol*(1+.008*lv)/(1+nv*.22);const core=Math.min(1,dt/win);const F=Math.min(.9,(.16+.1*(1-sk))+nv*.045);
 const tgt=scoreAt(S.aim.x,S.aim.y);const tm=(tgt.dbl||tgt.label==='BULL')?mpFiMult(P):mpScMult(P);
 const Smax=24*Math.pow(b.base/5.6,.3)*(1+.35*(1-sk))*tm;let s=Smax*(F+(1-F)*Math.pow(core,.75))+nv*.22*(.1+core);if(S.over)s=60;
 const pw=perfectWin();if(pw>0){if(dt<=pw)s*=.35;else if(dt<=pw*2)s*=.35+.65*(dt-pw)/pw;}const fl=(17-(Math.min(.85,Math.max(.35,sk))-.35)/.5*9)*tm;if(s<fl)s=fl;return s*pubSig();}
function mpPerfectWin(){const nv=effNerves();let w=.008+.001*mpRhyLv(S.mp.me);w*=1-.4*Math.min(1,nv/2);const vis=S.visit?S.visit.reduce((a,v)=>a+(v.bust?0:v.v),0):0;const me=S.p[S.cur];if(S.dart===3&&(vis>=120||me.score<=50))w*=.75;return w;}
function mpNerves(raw){return Math.max(0,raw*mpCompMult(S.mp.me));}
// identity for records: Google account when signed in, else this device
function mpPid(){return save.cloudUser?('u:'+save.cloudUser.id):('d:'+((save.lb&&save.lb.id)||lbId().id));}
// ----- pro picker -----
function statBar(lbl,v){return `<div class="mpp-stat"><small>${lbl}</small><i><b style="width:${v*10}%"></b></i><em>${v}</em></div>`;}
function renderProPicker(){const host=$('mpPros');if(!host)return;const cur=myPro().id;
 host.innerHTML=PROS.map(p=>`<button type="button" class="mpp ${p.id===cur?'on':''}" data-id="${p.id}" aria-pressed="${p.id===cur}">${p.id===cur?'<span class="mpp-sel">Selected ✓</span>':''}<span class="mpp-top"><b>${p.n}</b><span>${p.k}</span></span><span class="mpp-line">${p.line}</span>${statBar('Scoring',p.sc)}${statBar('Finishing',p.fi)}${statBar('Composure',p.cmp)}${statBar('Rhythm',p.rhy)}</button>`).join('');
 [...host.children].forEach(b=>b.onclick=()=>{save.mpPro=b.dataset.id;persist();renderProPicker();mpTrack();});const sel=$('mpProSel');if(sel)sel.textContent='· '+myPro().n;}
// ----- lobby (presence) -----
function mpMeta(){return {walk:save.walkon||'off',gname:NET.user?lbName():'',name:mpName()||'Mate',tag:save.antKiller?'Ant Killer':'',inGame:!!(S&&S.online&&!S.done),look:save.look,flight:save.flight,pro:myPro().id,ready:!!NET.ready,host:NET.seat===0,pid:mpPid(),joined:NET.joinedAt||Date.now()};}
async function mpTrack(){if(NET.chan&&NET.chanReady){try{await NET.chan.track(mpMeta());}catch(e){}}}
function mpPeers(){if(!NET.chan)return [];const st=NET.chan.presenceState();return Object.keys(st).map(k=>Object.assign({key:k},(st[k]||[])[0]||{})).sort((a,b)=>(b.host?1:0)-(a.host?1:0)||(a.joined||0)-(b.joined||0));}
function renderLobby(){const host=$('onPlayers');if(!host)return;const ps=mpPeers();const me=NET.myId;
 {const playing=ps.filter(p=>p.inGame&&p.key!==me);const mine=!!(S&&S.online&&!S.done);const w=$('onWait');if(playing.length&&!mine){const esc=x=>String(x).replace(/</g,'&lt;');host.innerHTML=ps.map(p=>`<div class="onp ${p.key===me?'me':''}"><span class="onp-n"><b>${esc(p.name||'Mate')}</b><small>${p.inGame?'In the game':'Waiting for the next one'}</small></span><span class="onp-r ${p.inGame?'host':'wait'}">${p.inGame?'Playing':'Waiting'}</span></div>`).join('');
  if(w)w.innerHTML=`<b>Game in progress</b><span>${playing.map(p=>esc(p.name||'Mate')).join(', ')} ${playing.length>1?'are':'is'} mid-match. You'll be in the rematch: tap Ready and the host can start it when they finish.</span>`;const st=$('btnOnStart');if(st)st.hidden=true;const rd=$('btnOnReady');if(rd){rd.hidden=NET.seat===0;rd.textContent=NET.ready?'Not ready':'Ready for the rematch';}netStatus('');return;}}
 host.innerHTML=ps.map((p,ix)=>{const pr=proOf(p.pro);const nm=String(p.name||'Mate');const ini=nm.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase().replace(/</g,'');let hh=0;for(const ch of nm)hh=(hh*31+ch.charCodeAt(0))>>>0;const wk=(window.TOPS_walk&&p.walk)?(TOPS_walk.WALK.find(w=>w.id===p.walk)||{}).n:'';return `<div class="onp v2 ${p.key===me?'me':''} ${p.host||p.ready?'rdy':''}"><i class="onp-av" style="--h:${hh%360}">${ini||'?'}<em>${ix+1}</em></i><span class="onp-n"><b>${String(p.name||'Mate').replace(/</g,'&lt;')}${p.tag?' <em class="ak-tag">🪰 Ant Killer</em>':''}</b><small>${p.host?'Host · ':''}${pr.n} · ${pr.k}</small>${wk&&p.walk!=='off'?`<small class="onp-wk">♪ ${String(wk).replace(/</g,'&lt;')}</small>`:'<small class="onp-wk no">No walk-on yet</small>'}</span><span class="onp-r ${p.host?'host':(p.ready?'ok':'wait')}">${p.host?'Host':(p.ready?'Ready ✓':'Choosing pro')}</span></div>`;}).join('')||'<p class="help">Waiting…</p>';
 {const w=$('onWait');if(w){const pend=ps.filter(p=>!p.host&&!p.ready);const rdy=ps.filter(p=>p.host||p.ready).length;w.innerHTML=ps.length<2?`<b>Room ready</b><span>${NET.seat===0?'Share the invite to get a mate in.':'Waiting for the host.'}</span>`:(pend.length?`<b>${rdy} of ${ps.length} ready</b><span>Waiting for ${pend.map(p=>String(p.name||'Mate').replace(/</g,'&lt;')).join(', ')} to choose a pro</span>`:`<b>${ps.length} of ${ps.length} ready</b><span>${NET.seat===0?'Start when you like.':'Waiting for the host to start.'}</span>`);}}
 const n=ps.length;const others=ps.filter(p=>!p.host);const allReady=others.length>0&&others.every(p=>p.ready);
 const st=$('btnOnStart'),rd=$('btnOnReady');
 if(st){st.hidden=NET.seat!==0||!allReady;st.disabled=!allReady;st.innerHTML=allReady?`Start match<small>${n>5?'First 5 play · ':''}${n===4&&mpCfgOpts().mode===1?'2v2 teams':(n>2?n+'-way':'1v1')} · ${mpFmtText(mpCfgOpts())}</small>`:(n<2?'Waiting for a mate<small>Share the invite</small>':'Waiting for everyone to ready up<small>'+others.filter(p=>!p.ready).length+' still picking</small>');}
 if(rd){rd.hidden=NET.seat===0;rd.textContent=NET.ready?'Not ready':'Ready';rd.classList.toggle('on',!!NET.ready);}
 const sh=$('btnOnShare');if(sh)sh.hidden=NET.seat!==0;mpRulesSum();
 if(NET.seat===0)netStatus(n<2?`Room ${NET.room}. Share the invite.`:(allReady?'Everyone is ready.':'Waiting for ready.'));else netStatus(NET.hostFmt?('Host set: '+NET.hostFmt):'Connected. Pick your pro, then Ready.');}
function mpCfgOpts(){return {legs:mpOpt('mpLegs',3),start:mpOpt('mpStart',501),din:!!mpOpt('mpIn',0),venue:(v=>v<0?[0,1,2,4,6][Math.floor(Math.random()*5)]:v)(mpOpt('mpVenue',-1)),level:mpOpt('mpLevel',1),mode:mpOpt('mpMode',0)};}
function mpLevelName(v){return (MP_LEVELS[v]||MP_LEVELS[1]).n;}
function inviteUrl(code){return location.origin+location.pathname+'?join='+code;}
async function shareInvite(){const code=NET.room;if(!code)return;const o=mpCfgOpts();const url=inviteUrl(code);const text=`Darts? ${save.name||'I'} opened a TOPS room. ${mpFmtText(o)} · ${mpLevelName(o.level)} standard. Tap to join:`;
 try{if(navigator.share){await navigator.share({title:'TOPS darts',text,url});return;}}catch(e){if(e&&e.name==='AbortError')return;}
 try{await navigator.clipboard.writeText(text+' '+url);netStatus('Invite copied. Paste it in the group chat.');}catch(e){prompt('Copy this invite',text+' '+url);}}
// ----- results and rivalries -----
async function mpSaveResult(players,winnerPid){try{const sb=await netLoad();await sb.from('tops_mp_results').insert({room:NET.room,fmt:mpCfgOpts(),players,winner:winnerPid});MP_REC.at=0;}catch(e){console.warn('mp save',e);}}
const MP_REC={rows:null,at:0};
async function mpFetch(){if(MP_REC.rows&&Date.now()-MP_REC.at<20000)return MP_REC.rows;try{const sb=await netLoad();const {data,error}=await sb.from('tops_mp_results').select('created_at,players,winner').order('created_at',{ascending:false}).limit(500);if(error)throw error;MP_REC.rows=data||[];MP_REC.at=Date.now();}catch(e){console.warn(e);MP_REC.rows=MP_REC.rows||[];}return MP_REC.rows;}
async function renderRecords(){const host=$('mpRecords');if(!host)return;host.innerHTML='<p class="help">Loading records…</p>';const rows=await mpFetch();
 if(!rows.length){host.innerHTML='<div class="mp-empty"><b>No results yet</b><span>Play your first online match and the rivalry table starts here.</span></div>';return;}
 const names={},pl={},pair={};const me=mpPid();
 rows.slice().reverse().forEach(r=>{const ps=r.players||[];ps.forEach(p=>{names[p.pid]=p.name;const s=pl[p.pid]=pl[p.pid]||{p:0,w:0};s.p++;if(p.pid===r.winner||(p.team!=null&&ps.some(q=>q.pid===r.winner&&q.team===p.team)))s.w++;});
  if(ps.length===2){const [a,b]=ps.map(p=>p.pid).sort();const k=a+'|'+b;const s=pair[k]=pair[k]||{a,b,wa:0,wb:0,last:null};if(r.winner===a)s.wa++;else if(r.winner===b)s.wb++;s.last=r.created_at;}});
 const plist=Object.entries(pl).sort((x,y)=>y[1].w-x[1].w||y[1].p-x[1].p).slice(0,12);
 const prs=Object.values(pair).sort((x,y)=>(y.wa+y.wb)-(x.wa+x.wb)).slice(0,12);
 const nm=id=>String(names[id]||'?').replace(/</g,'&lt;');
 const night=(()=>{const t0=Date.now()-14*3600e3;const rs=rows.filter(r=>new Date(r.created_at).getTime()>t0).slice().reverse();if(!rs.length)return '';const T={};rs.forEach(r=>{const ps=r.players||[];ps.forEach(p=>{const s=T[p.pid]=T[p.pid]||{p:0,w:0,av:0,an:0,f:[]};s.p++;const won=p.pid===r.winner||(p.team!=null&&ps.some(q=>q.pid===r.winner&&q.team===p.team));if(won)s.w++;s.f.push(won);const a=parseFloat(p.avg);if(a>0){s.av+=a;s.an++;}});});
  const L=Object.entries(T).map(([id,s])=>({id,...s,pts:s.w*3,avg:s.an?s.av/s.an:0})).sort((x,y)=>y.pts-x.pts||y.avg-x.avg);
  return `<div class="mpr gn"><div class="label">Games night · tonight's table</div><table class="gn-t"><thead><tr><th></th><th>Player</th><th>P</th><th>W</th><th>Avg</th><th>Pts</th><th class="gn-f">Form</th></tr></thead><tbody>${L.map((s,i)=>`<tr class="${s.id===me?'me':''} ${i===0?'top':''}"><td>${i+1}</td><td><b>${nm(s.id)}</b></td><td>${s.p}</td><td>${s.w}</td><td>${s.avg?s.avg.toFixed(1):'–'}</td><td><b>${s.pts}</b></td><td class="gn-f">${s.f.slice(-5).map(w=>`<i class="${w?'w':'l'}"></i>`).join('')}</td></tr>`).join('')}</tbody></table><small class="gn-n">${rs.length} match${rs.length>1?'es':''} tonight · 3 pts a win</small></div>`;})();
 host.innerHTML=night+`<div class="mpr"><div class="label">Rivalries</div>${prs.map(s=>{const lead=s.wa===s.wb?'':(s.wa>s.wb?s.a:s.b);return `<div class="mpr-row ${s.a===me||s.b===me?'me':''}"><span><b class="${lead===s.a?'lead':''}">${nm(s.a)}</b> v <b class="${lead===s.b?'lead':''}">${nm(s.b)}</b></span><em>${s.wa}–${s.wb}</em><small>${s.wa+s.wb} played</small></div>`;}).join('')||'<p class="help">Head-to-heads appear after 1v1 matches.</p>'}</div>
 <div class="mpr"><div class="label">All-time</div>${plist.map(([id,s],i)=>`<div class="mpr-row ${id===me?'me':''}"><span><i>${i+1}</i> <b>${nm(id)}</b></span><em>${s.w}–${s.p-s.w}</em><small>${Math.round(s.w/s.p*100)}% · ${s.p} played</small></div>`).join('')}</div>`;}

// ===== NET: Google sign-in, cloud save, live online matches (Supabase) =====
window.NET={sb:null,user:null,chan:null,room:null,seat:0,queue:[],seq:0,seen:{},loading:null,pushT:null,cloudAt:0};const NET=window.NET;
function netLoad(){if(window.supabase&&window.supabase.createClient){if(!NET.sb)NET.sb=window.supabase.createClient(LB.url,LB.key,{auth:{persistSession:true,detectSessionInUrl:true,flowType:'implicit'},realtime:{params:{eventsPerSecond:40}}});return Promise.resolve(NET.sb);}
 if(NET.loading)return NET.loading;NET.loading=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js';s.onload=()=>{try{NET.sb=window.supabase.createClient(LB.url,LB.key,{auth:{persistSession:true,detectSessionInUrl:true,flowType:'implicit'},realtime:{params:{eventsPerSecond:40}}});res(NET.sb);}catch(e){rej(e);}};s.onerror=()=>rej(new Error('net load'));document.head.appendChild(s);});return NET.loading;}
function netUserName(){const u=NET.user;if(!u)return '';const m=u.user_metadata||{};return (m.full_name||m.name||(u.email||'').split('@')[0]||'You').split(' ')[0];}
// ----- login splash -----
function showLogin(){const el=$('login');if(!el)return showTitle();el.hidden=false;$('title').hidden=true;$('loginBg').src='img/splash.jpg';$('loginBg').hidden=false;const st=$('loginStatus');st.textContent='';
 $('btnGoogle').onclick=async()=>{st.textContent='Opening Google…';try{const sb=await netLoad();save.authSeen=true;persist();const redirectTo=location.origin+location.pathname;const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo}});if(error)throw error;}catch(e){st.textContent='Sign-in didn’t work. Try again in a minute.';console.warn(e);}};
 $('btnGuest').onclick=()=>{save.authSeen=true;persist();el.hidden=true;showTitle();};}
/* ENG-FLASH: TOPS_BOOTEND marks the screen the boot lands on (title after the cloud pull, or login): the loading screen is held until then (v16) */
/* ENG-RIGCACHE (ChatGPT P1): a boot the loader gave up on (v16, 45 s, the player is on the offline login) is cancelled by bumping NET.bootGen:
   its late answers neither sign in, adopt a save nor change the screen. A sign-in the player starts afterwards is a new path (no generation). */
async function netBoot(){const hashAuth=/access_token=|refresh_token=|code=/.test(location.hash+location.search);const g=NET.bootGen=(NET.bootGen||0)+1;
 try{const sb=await netLoad();const {data}=await sb.auth.getSession();if(NET.bootGen!==g)return;if(data&&data.session){await netSignedIn(data.session.user,g);if(NET.bootGen!==g)return;window.TOPS_BOOTEND=window.TOPS_BOOTEND||Date.now();if(hashAuth)history.replaceState(null,'',location.pathname);}else{showLogin();window.TOPS_BOOTEND=window.TOPS_BOOTEND||Date.now();}
  sb.auth.onAuthStateChange((ev,sess)=>{if(ev==='SIGNED_IN'&&sess&&(!NET.user||NET.user.id!==sess.user.id))netSignedIn(sess.user);if(ev==='SIGNED_OUT'){NET.user=null;save.cloudUser=null;persist();showLogin();}});
 }catch(e){console.warn('net boot',e);if(NET.bootGen!==g)return;showLogin();const st=$('loginStatus');if(st)st.textContent='Can’t reach the server. Check your connection and try again.';window.TOPS_BOOTEND=window.TOPS_BOOTEND||Date.now();}}
async function netSignedIn(user,g){const stale=()=>g!=null&&NET.bootGen!==g;if(stale())return;NET.user=user;save.cloudUser={id:user.id,name:netUserName()};persist();const el=$('login');if(el)el.hidden=true;
 // pull cloud save
 try{const sb=NET.sb;const {data,error}=await sb.from(TOPS_SAVE_NS.table).select('data,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;
  const cloud=data&&data.data;const localMatches=(save.matches||0);const cloudMatches=cloud?(cloud.matches||0):0;
  // cloud only: when signed in, the cloud save always wins; the device copy is never offered
  if(stale())return;/* given up on: no adopt, no push, no screen change */
  if(cloud&&(cloudMatches>0||cloud.career)){netAdopt(cloud);}
  else cloudPush(true);
 }catch(e){console.warn('cloud pull',e);}
 if(stale())return;showTitle();}
function netAdopt(cloud){if(!cloud||cloud.season!==SEASON){cloudPush(true);return;}const keep={authSeen:true,cloudUser:save.cloudUser};save=Object.assign({},cloud,keep);if(!save.lb&&cloud.lb)save.lb=cloud.lb;/* #12: a cloud save written by v1.75 carries the old inflated opponents; migrate it too (idempotent) */try{window.TOPS_v11Migrate&&TOPS_v11Migrate();}catch(e){}persist();}
function cloudPush(now){if(!NET.user||!NET.sb)return;clearTimeout(NET.pushT);const go=async()=>{try{const row={user_id:NET.user.id,data:save,updated_at:new Date().toISOString()};const {error}=await NET.sb.from(TOPS_SAVE_NS.table).upsert(row,{onConflict:'user_id'});if(error)throw error;NET.cloudAt=Date.now();}catch(e){console.warn('cloud push',e);}};if(now)go();else NET.pushT=setTimeout(go,2500);}
async function netSignOut(){try{if(NET.sb)await NET.sb.auth.signOut();}catch(e){}NET.user=null;save.cloudUser=null;persist();showTitle();}
// ----- online match -----
function roomCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ';let c='';for(let i=0;i<4;i++)c+=A[Math.floor(Math.random()*A.length)];return c;}
function netStatus(t){const el=$('onStatus');if(el)el.textContent=t;}
const BAD_NAMES=['','you','mate','host','guest','player'];
function mpName(){return NET.user?lbName():String(save.name||'').trim();}
function mpNameOk(){if(NET.user&&lbName())return true;const v=String(save.name||'').trim();return v.length>=2&&!BAD_NAMES.includes(v.toLowerCase());}
function mpNameGate(then){if(mpNameOk())return true;mpNamePrompt(then);return false;}
function mpNamePrompt(then){let el=$('nameGate');if(!el){el=document.createElement('div');el.id='nameGate';el.className='name-gate';document.body.appendChild(el);}
 el.innerHTML=`<form class="ng-card" autocomplete="off"><div class="ng-k">Play online</div><h2>What should we call you?</h2><p>Your mates see this name in the lobby, on the scoreboard and on every bet.</p><input id="ngIn" maxlength="14" autocomplete="nickname" placeholder="Your name" value="${String(mpNameOk()?save.name:(NET.user?netUserName():'')).replace(/"/g,'')}"><span class="ng-err" id="ngErr"></span><div class="ng-acts"><button type="button" class="ghost" id="ngCancel">Cancel</button><button type="submit" class="big" id="ngGo">Continue</button></div></form>`;
 el.hidden=false;const inp=$('ngIn');setTimeout(()=>{inp.focus();inp.select();},50);
 el.querySelector('form').onsubmit=ev=>{ev.preventDefault();const v=inp.value.replace(/[<>]/g,'').trim().slice(0,14);if(v.length<2||BAD_NAMES.includes(v.toLowerCase())){$('ngErr').textContent=v.length<2?'At least 2 letters.':'Pick a real name, not "'+v+'".';inp.focus();return;}
  save.name=v;persist();const f=$('onName');if(f){f.value=v;f.classList.remove('need');}el.hidden=true;if(then)then();};
 $('ngCancel').onclick=()=>{el.hidden=true;};}
async function onlineHost(){if(!mpNameGate(()=>onlineHost()))return;const code=roomCode();await onlineJoin(code,0);mpFmtUpdate();}
function mpRulesSum(){const el=$('mpRulesSum');if(!el)return;if(NET.chan&&NET.seat!==0){el.textContent=NET.hostFmt||'Set by the host';return;}const o=mpCfgOpts();const pc=pubCfg();el.textContent=`${o.start} · ${o.legs===1?'1 leg':'Best of '+o.legs} · ${o.din?'Double in':'Straight in'} · ${o.mode===1?'2v2 if 4':'Individual'} · ${mpLevelName(o.level)}${pc?' · Pub rules on':''}`;}
function mpFmtUpdate(){mpRulesSum();const o=mpCfgOpts();const pc=pubCfg();const t=mpFmtText(o)+' · '+mpLevelName(o.level)+(pc?' · '+pubText(pc):'');const f=$('onFmt');if(f)f.textContent=NET.seat===0?t:(NET.hostFmt||'');if(NET.seat===0&&NET.chan)netSend('fmt',{text:t});renderLobby();}
async function onlineJoin(code,seat){if(!mpNameGate(()=>onlineJoin(code,seat)))return;code=(code||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,4);if(code.length<4){netStatus('Enter the 4-letter code.');return;}
 try{netStatus('Connecting…');const sb=await netLoad();if(NET.chan){try{await NET.chan.unsubscribe();}catch(e){}}
  NET.room=code;NET.seat=seat;NET.ready=false;NET.started=false;NET.hostFmt='';NET.chanReady=false;NET.queue=[];NET.seen={};NET.seq=0;NET.myId=(()=>{try{const L=JSON.parse(localStorage.getItem('tops_lastroom')||'null');if(L&&L.room===code&&L.myId&&Date.now()-L.at<4*3600e3)return L.myId;}catch(e){}return ((save.lb&&save.lb.id)||'g').slice(0,8)+'-'+Math.random().toString(36).slice(2,8);})();
  const ch=sb.channel('tops-'+code,{config:{broadcast:{self:false,ack:false},presence:{key:NET.myId}}});NET.chan=ch;
  ch.on('broadcast',{event:'tops'},({payload})=>netRecv(payload));
  ch.on('presence',{event:'sync'},()=>{const n=Object.keys(ch.presenceState()).length;const grew=n>(NET.peers?NET.peers.length:0);NET.peers=Object.keys(ch.presenceState());renderLobby();if(NET.seat===0&&grew)setTimeout(mpFmtUpdate,400);});
  ch.on('presence',{event:'leave'},({key})=>{if(key!==NET.myId&&S&&S.online&&!S.done){netDropGrace(key);}});ch.on('presence',{event:'join'},({key})=>{netBack(key);});
  await new Promise((res,rej)=>{ch.subscribe(async(status)=>{if(status==='SUBSCRIBED'){NET.chanReady=true;NET.joinedAt=Date.now();await ch.track(mpMeta());res();}else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')rej(new Error(status));});});
  $('onCode').textContent=code;$('onLobby').hidden=false;$('onEntry').hidden=true;$('mpOpts').classList.toggle('locked',seat!==0);renderLobby();
 }catch(e){console.warn(e);netStatus('Could not connect. Check your connection and try again.');}}
function netSend(type,data){if(!NET.chan)return;NET.seq++;NET.chan.send({type:'broadcast',event:'tops',payload:Object.assign({t:type,q:NET.seq,from:NET.myId},data||{})});}
function mpOpt(id,def){const b=[...$(id).children].find(x=>x.getAttribute('aria-pressed')==='true');return b?+b.dataset.v:def;}
function mpFmtText(c){return `${c.legs===1?'1 leg':'Best of '+c.legs} · ${c.start} · ${c.din?'double in':'straight in'}, double out${c.mode===1?' · teams if 4':''}`;}
function onlineStart(){let ps=mpPeers().slice(0,5);if(ps.length<2)return;const o=mpCfgOpts();const teams=o.mode===1&&ps.length===4;
 // seats: host first, then join order; teams sit A1,B1,A2,B2 so turns alternate sides
 const players=ps.map(p=>({key:p.key,name:p.key===NET.myId?(mpName()||'Host'):(p.name||'Mate'),look:p.key===NET.myId?save.look:(p.look||lookFor(p.name||'Mate')),flight:p.flight,gname:p.key===NET.myId?(NET.user?lbName():''):(p.gname||''),tag:p.key===NET.myId?(save.antKiller?'Ant Killer':''):(p.tag||''),pro:p.key===NET.myId?myPro().id:(p.pro||'shane'),pid:p.key===NET.myId?mpPid():(p.pid||p.key),walk:p.key===NET.myId?(save.walkon||'off'):(p.walk||'off')}));
 if(teams)players.forEach((p,i)=>p.team=i%2);
 const first=Math.floor(Math.random()*players.length);
 const cfg={t:'start',legs:o.legs,start:o.start,din:o.din,tier:o.venue,level:o.level,first,teams,players,pub:pubCfg()};netSend('start',cfg);onlineBegin(cfg);}
function onlineBegin(cfg){NET.started=true;$('onLobby').hidden=true;setTimeout(mpTrack,400);
 // older 2-seat config from a host on the previous build
 if(!cfg.players)cfg.players=[Object.assign({key:'host'},cfg.host),Object.assign({key:'guest'},cfg.guest)];
 const N=cfg.players.length;let mySeat=cfg.players.findIndex(p=>p.key===NET.myId);if(mySeat<0){if(cfg.players[0]&&cfg.players[0].key==='host'){mySeat=NET.seat===0?0:1;}else{NET.started=false;$('onLobby').hidden=false;netStatus(`Room full: ${N} players started without you. You'll get in on the rematch if someone drops out.`);try{trackEv('room_full');}catch(e){}return;}}
 const rel=k=>cfg.players[(mySeat+k)%N];const me=rel(0),op=rel(1);
 NET.lastCfg=cfg;
 beginMatch({mode:'online',tier:cfg.tier,p0:me.name,p1:op.name,legs:cfg.legs,start:cfg.start||501,din:!!cfg.din,oppLook:op.look,online:{seat:0,first:0}});
 for(let k=2;k<N;k++){const pl=rel(k);const np=newPlayer(pl.name,true,0,pl.look||lookFor(pl.name));np.score=cfg.start||501;np.disp=pl.name;S.p.push(np);}
 S.p.forEach((p,k)=>{const src=rel(k);p.key=src.key;p.pid=src.pid;p.tag=src.tag||'';p.gname=src.gname||'';p.team=cfg.teams?(src.team===me.team?'Your team':'Them'):'';});
 S.teams=!!cfg.teams;S.legStarter=((cfg.first-mySeat)%N+N)%N;S.cur=S.legStarter;
 const lv=MP_LEVELS[cfg.level==null?1:cfg.level]||MP_LEVELS[1];
 S.mp={me:proOf(me.pro),op:proOf(op.pro),pros:S.p.map((_,k)=>proOf(rel(k).pro)),arm:lv.arm,level:lv.n,mePid:me.pid,opPid:op.pid,players:cfg.players.map(p=>({pid:p.pid,name:p.name,pro:p.pro,team:p.team}))};S.barrel=MP_BARREL;pubInit(cfg);
 if(S.teams){const tm=S.p[2];S.p[0].disp=me.name+' & '+tm.name;S.p[2].disp=S.p[0].disp;S.p[1].disp=S.p[1].name+' & '+S.p[3].name;S.p[3].disp=S.p[1].disp;$('name0').firstChild.textContent=S.p[0].disp;$('name1').firstChild.textContent=S.p[1].disp;}
 {const a=$('introP0s'),b=$('introP1s');if(a)a.textContent=proOf(me.pro).n+' · '+proOf(me.pro).k;if(b)b.textContent=N>2?(S.teams?'2v2 teams':(N+' players')):(proOf(op.pro).n+' · '+proOf(op.pro).k);
  if(N>2&&!S.teams){$('introP1').textContent='+'+(N-1)+' more';}if(S.teams){$('introP0').textContent=S.p[0].disp;$('introP1').textContent=S.p[1].disp;}
  const f=$('introFmt');if(f)f.textContent+=' · '+lv.n+' standard'+(S.teams?' · 2v2':(N>2?' · '+N+'-way':''));}
 updateUI();}
function netRecv(m){if(!m||m.from===NET.myId)return;if(m.q!=null){const k=m.from+':'+m.q;if(NET.seen[k])return;NET.seen[k]=1;}
 if(m.t==='start'){if(NET.seat!==0&&(!S||S.done))onlineBegin(m);return;}if(m.t==='fmt'){NET.hostFmt=m.text;const f=$('onFmt');if(f)f.textContent=m.text;renderLobby();return;}
 if(m.t==='dart'){NET.queue.push(m);netPump();return;}
 if(m.t==='quit'){onlineLeft(m.from);return;}
 if(m.t==='chat'){chatShow(String(m.name||'Mate').slice(0,16),String(m.text||'').slice(0,60));return;}
 if(m.t==='ach'){const a=ACH.find(x=>x.id===m.id);if(a)achToast(a,String(m.name||'Mate').slice(0,16));return;}
 if(m.t==='pubd'||m.t==='bet'||m.t==='nobet'||m.t==='rlock'||m.t==='rres'){pubRecv(m);return;}if(m.t==='card'||m.t==='cack'||m.t==='chand'){try{cardRecv(m);}catch(e){console.warn('card',e);}return;}}
function netPump(){if(!S||!S.online||S.done)return;if(S.cur===0||S.netAnim||S.busyLeg)return;if($('intro').classList.contains('show')){mt(netPump,300);return;}const lp=legsPlayed();NET.queue=NET.queue.filter(q=>S.p.some(p=>p.key===q.from)&&(q.leg==null||q.leg>=lp));if(!NET.queue.length)return;const thr=S.p[S.cur];const k=(thr&&thr.key)?NET.queue.findIndex(q=>q.from===thr.key&&(q.leg==null||q.leg===lp)):0;if(k<0)return;const m=NET.queue.splice(k,1)[0];S.netAnim=true;S.remoteDart=m;aiDart({x:m.x,y:m.y});}
// a dropped connection gets 20s to come back before anyone is marked as gone (phones blip: app switch, Wi-Fi, a lock screen)
const NETDROP={};
function netDropGrace(key){if(!S||S.done)return;const pl=S.p.find(p=>p.key===key);if(!pl||pl.left)return;if(NETDROP[key])return;
 try{pubBand?pubBand('miss','CONNECTION DROPPED',`${pl.name} · waiting up to 20s for them to come back`,4000,null):flash(pl.name+' dropped','red','waiting');}catch(e){}
 try{trackEv('peer_drop');}catch(e){}
 NETDROP[key]=setTimeout(()=>{delete NETDROP[key];const st=NET.chan&&NET.chan.presenceState?NET.chan.presenceState():{};if(st[key])return;onlineLeft(key,true);},20000);}
function netBack(key){if(NETDROP[key]){clearTimeout(NETDROP[key]);delete NETDROP[key];const pl=S&&S.p.find(p=>p.key===key);if(pl)try{pubBand('land','BACK IN',`${pl.name} reconnected`,1500,null);}catch(e){}}}
function onlineLeft(key,confirmed){if(!S||S.done)return;const gone=S.p.find(p=>p.key===key)||(confirmed===undefined&&key==null&&S.p.length===2?S.p[1]:null);if(!gone||gone.left)return;gone.left=true;
 const active=S.p.filter(p=>!p.left);const sides=S.teams?new Set(active.map((p,i)=>S.p.indexOf(p)%2)).size:active.length;
 if(sides<=1){const need=Math.ceil(S.bestOf/2);active.forEach(p=>p.legs=need);if(S.teams)S.p.forEach((p,i)=>{if(active.some(a=>S.p.indexOf(a)%2===i%2))p.legs=need;});S.p.filter(p=>p.left).forEach(p=>p.legs=Math.min(p.legs,need-1));flash(gone.name+' left','red','match awarded');mt(()=>endMatch(),1200);return;}
 flash(gone.name+' left','red','turns skipped');if(S.p[S.cur]===gone&&!S.netAnim){S.cur=(S.cur+1)%S.p.length;mt(startTurn,800);}mpBoardRender();}
async function onlineLeave(){{const o=$('mpOpts');if(o)o.classList.remove('locked');const f=$('onFmt');if(f)f.textContent='';}try{if(NET.chan){netSend('quit',{});await NET.chan.unsubscribe();}}catch(e){}NET.chan=null;NET.room=null;NET.started=false;NET.ready=false;NET.chanReady=false;const l=$('onLobby');if(l)l.hidden=true;const en=$('onEntry');if(en)en.hidden=false;netStatus('');mpRulesSum();}



// ===== BETA FUNNEL: ordered event trail per session, no names or room codes. Stored in the save (cloud-synced when signed in). =====
const FUN={sid:Math.random().toString(36).slice(2,10),once:{}};
function trackEv(ev,data,once){try{if(once){if(FUN.once[ev])return;FUN.once[ev]=1;}save.funnel=save.funnel||[];save.funnel.push({t:Date.now(),s:FUN.sid,e:ev,m:(S&&(S.online?'online':S.practice?(LES.on?'lesson':(S.drill?'drill':'practice')):(isRun&&isRun()?'run':'career')))||'',b:String(window.TOPS_BUILD||'').slice(-6),v:innerWidth+'x'+innerHeight,d:data||undefined});if(save.funnel.length>400)save.funnel.splice(0,save.funnel.length-400);persist();}catch(e){}}
{const _bm=beginMatch;beginMatch=function(o){const r=_bm.apply(this,arguments);trackEv('mode_entry',{legs:o&&o.legs});return r;};}
{const _rl=release;release=function(ev,src){const was=!!(S&&S.pulling);const r=_rl.apply(this,arguments);if(was)trackEv('first_dart',null,true);return r;};}
{const _el=endLeg;endLeg=function(){trackEv('first_leg',null,true);return _el.apply(this,arguments);};}
{const _em2=endMatch;endMatch=function(){const s0=S;const r=_em2.apply(this,arguments);try{achMatch(s0);}catch(e){console.warn('ach',e);}try{if(s0){const w=s0.p.reduce((bi,p,i)=>p.legs>s0.p[bi].legs?i:bi,0);trackEv('result',{won:w===0,legs:s0.p.map(p=>p.legs),darts:s0.p[0].darts});}}catch(e){}return r;};}
{const q=document.getElementById('btnQuit');if(q)q.addEventListener('click',()=>trackEv('quit',{dart:S&&S.p?S.p[0].darts:0}),true);}
{const _ol=onlineLeft;onlineLeft=function(k){trackEv('disconnect');return _ol.apply(this,arguments);};}





// ===== ACHIEVEMENTS: the 30 rarest things you can do in TOPS. Tier = how rare we expect it to be for a regular player. =====
const ACH=[
 {id:'nine',n:'Perfect Leg',d:'Win a leg in 9 darts',t:'L',ic:'💎',odds:'PDC pros: about 1 in 1,456 legs'},
 {id:'fish',n:'The Big Fish',d:'Check out 170',t:'L',ic:'🐟'},
 {id:'b2b',n:'Back to Back',d:'Two 180s in a row',t:'L',ic:'🔥'},
 {id:'bulls3',n:'Bully Boy',d:'Three bulls in one visit (150)',t:'L',ic:'🐂'},
 {id:'fly',n:'Ant Killer',d:'Swat the fly with a dart',t:'L',ic:'🪰'},
 {id:'leg12',n:'Twelve Darter',d:'Win a leg in 12 darts or fewer',t:'L',ic:'⚡'},
 {id:'tonavg',n:'Ton Average',d:'Average 100+ over a match (2+ legs)',t:'L',ic:'💯'},
 {id:'shanghai',n:'Shanghai',d:'Single, double and treble of the same number in one visit',t:'L',ic:'🏮'},
 {id:'madhouse',n:'The Madhouse',d:'Check out on double 1',t:'E',ic:'🏚️'},
 {id:'bullout',n:'Bull Finish',d:'Win a leg on the bullseye',t:'E',ic:'🎯'},
 {id:'ton40out',n:'Ton-Forty Out',d:'Check out 140 or more',t:'E',ic:'💰'},
 {id:'three180',n:'Maximum Night',d:'Three 180s in one match',t:'E',ic:'🎆'},
 {id:'comeback',n:'Reverse Sweep',d:'Win from two legs down',t:'E',ic:'🔄'},
 {id:'streak10',n:'In the Zone',d:'Ten perfect releases in a row',t:'E',ic:'🧘'},
 {id:'bounce3',n:'Wire Magnet',d:'Three bounce-outs in one match',t:'E',ic:'🧲'},
 {id:'bouncefin',n:'Cruel Game',d:'Bounce out on a checkout dart',t:'E',ic:'💔'},
 {id:'jackpot',n:'Return to Sender',d:'Bounce a card straight back at the mate who threw it',t:'E',ic:'↩️'},
 {id:'pissedwin',n:'Liquid Courage',d:'Win a Pub rules match at wobble 6 or more',t:'E',ic:'🍻'},
 {id:'leg15',n:'Fifteen Darter',d:'Win a leg in 15 darts or fewer',t:'R',ic:'⏱️'},
 {id:'tonout',n:'Ton Out',d:'Check out 100 or more',t:'R',ic:'💵'},
 {id:'whitewash',n:'Whitewash',d:'Win a best of 5+ without dropping a leg',t:'R',ic:'🧹'},
 {id:'clinical',n:'Clinical',d:'Three or more checkouts, no missed doubles',t:'R',ic:'🩺'},
 {id:'trebles3',n:'Treble Tour',d:'Three different trebles in one visit',t:'R',ic:'🗺️'},
 {id:'ones',n:'Bag of Nails',d:'Three 1s in one visit',t:'R',ic:'🔩'},
 {id:'downs3',n:'Bottoms Up',d:'Down it three times in one Pub rules match',t:'R',ic:'🍺'},
 {id:'bitch3',n:'Drink Bitch',d:'Throw three 26s in one match',t:'R',ic:'🤬'},
 {id:'king',n:'Last One Standing',d:'Win an online match with 4 or 5 players',t:'R',ic:'👑'},
 {id:'deano',n:'Deano Down',d:'Beat your rival Deano Marsh in career',t:'R',ic:'🥊'},
 {id:'palace',n:'Palace Winner',d:'Win a match at the Palace',t:'L',ic:'🏰'},
 {id:'firstmax',n:'One Hundred and Eighty',d:'Throw your first 180',t:'R',ic:'🎉'}];
const ACH_T={L:'Legendary',E:'Epic',R:'Rare'};
function achHas(id){return !!(save.ach&&save.ach[id]);}
function achUnlock(id){if(achHas(id))return;const a=ACH.find(x=>x.id===id);if(!a)return;save.ach=Object.assign({},save.ach||{},{[id]:Date.now()});persist();achToast(a,null);try{trackEv('ach_'+id);}catch(e){}if(S&&S.online&&NET.chan)netSend('ach',{id,name:(typeof mpName==='function'?mpName():save.name)||'Mate'});}
const ACH_BADGE={firstmax:'b180',b2b:'b180',three180:'b180',whitewash:'whitewash',fish:'b170',bulls3:'bull',bullout:'bull',madhouse:'bull',tonout:'tonout',ton40out:'tonout',nine:'nine',leg12:'nine',leg15:'nine',comeback:'comeback',deano:'rival',king:'rival',tonavg:'promo',palace:'palace',streak10:'streak',clinical:'streak',shanghai:'streak',trebles3:'streak',bounce3:'bounce',bouncefin:'bounce',fly:'bounce',jackpot:'bounce',ones:'bounce',downs3:'bounce',bitch3:'bounce',pissedwin:'bounce'};
function achIco(a){const b=a&&ACH_BADGE[a.id];return b?`<img class="ach-img" src="assets/ui/bd_${b}.webp" alt="">`:(a?a.ic:'');}
function achToast(a,who){let host=$('achToasts');if(!host){host=document.createElement('div');host.id='achToasts';host.className='ach-toasts';document.body.appendChild(host);}const esc=x=>String(x).replace(/</g,'&lt;');const el=document.createElement('div');el.className='ach-t t-'+a.t;el.innerHTML=`<i>${achIco(a)}</i><div><small>${who?esc(who)+' unlocked':'Achievement unlocked'} · ${ACH_T[a.t]}</small><b>${esc(a.n)}</b><span>${esc(a.d)}</span></div>`;host.appendChild(el);try{noiseBurst({dur:.08,freq:1600,q:9,gain:.08});setTimeout(()=>noiseBurst({dur:.1,freq:2400,q:9,gain:.08}),130);}catch(e){}setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),400);},who?3200:4500);}
// per-visit checks (local human only)
function achVisit(tc,R,vs0){if(!S||S.practice||S.drill)return;const me=S.p[tc];if(!me||me.ai||tc!==0)return;S.ach=S.ach||{b26:0,bounces:0,last180:false};const L=R.labels,tot=R.tot;
 if(!R.bust&&tot===180){achUnlock('firstmax');if(S.ach.last180)achUnlock('b2b');S.ach.last180=true;}else S.ach.last180=false;
 if((me.t180||0)>=3)achUnlock('three180');
 if(L.length===3&&L.every(l=>l==='BULL'))achUnlock('bulls3');
 if(L.length===3&&!R.bust){const n=L.map(l=>l==='BULL'||l==='25'?25:parseInt(l.replace(/^[TD]/,''))||0);const m=L.map(l=>l[0]==='T'?3:l[0]==='D'||l==='BULL'?2:1);if(n[0]&&n.every(v=>v===n[0])&&new Set(m).size===3)achUnlock('shanghai');const tr=L.filter(l=>l[0]==='T');if(tr.length===3&&new Set(tr).size===3)achUnlock('trebles3');if(L.every(l=>l==='1'))achUnlock('ones');}
 if(!R.bust&&tot===26&&L.length===3){S.ach.b26++;if(S.ach.b26>=3)achUnlock('bitch3');}
 if(R.won){const out=vs0;const last=L[L.length-1];if(out===170)achUnlock('fish');if(out>=140)achUnlock('ton40out');if(out>=100)achUnlock('tonout');if(last==='BULL')achUnlock('bullout');if(last==='D1')achUnlock('madhouse');const ld=me.legDarts;if((S.start||501)>=501&&!S.din){if(ld<=9)achUnlock('nine');if(ld<=12)achUnlock('leg12');if(ld<=15)achUnlock('leg15');}}}
function achMatch(S0){if(!S0||S0.practice)return;const me=S0.p[0];const w=S0.p.reduce((bi,p,i)=>p.legs>S0.p[bi].legs?i:bi,0);const won=w===0||(S0.teams&&w===2);const A=S0.ach||{};const legsTot=S0.p.reduce((a,p)=>a+p.legs,0);
 if(won&&S0.bestOf>=5&&S0.p.every((p,i)=>i===0||sameTeamOf(S0,i,0)||p.legs===0))achUnlock('whitewash');
 if(won&&S0.legSeq&&(()=>{let d=0,worst=0;S0.legSeq.forEach(i=>{d+=(i===0||sameTeamOf(S0,i,0))?1:-1;worst=Math.min(worst,d);});return worst<=-2;})())achUnlock('comeback');
 if(legsTot>=2&&me.darts&&avg(me)>=100)achUnlock('tonavg');
 if(me.coHit>=3&&me.coAtt===me.coHit)achUnlock('clinical');
 if((A.bounces||0)>=3)achUnlock('bounce3');
 if(S0.pub){const d=S0.pub.p[0];if(won&&d&&d.lvl>=6)achUnlock('pissedwin');if(d&&d.downs>=3)achUnlock('downs3');}
 if(won&&S0.online&&S0.p.length>=4)achUnlock('king');
 if(won&&S0.rival)achUnlock('deano');
 if(won&&S0.tier&&TIERS.indexOf(S0.tier)===6)achUnlock('palace');}
function sameTeamOf(S0,i,j){return !!(S0.teams&&((i-j+4)%2===0));}
function achGridHTML(){const got=ACH.filter(a=>achHas(a.id)).length;const esc=x=>String(x).replace(/</g,'&lt;');return `<div class="label">Achievements · ${got} / ${ACH.length}</div><div class="ach-grid">${['L','E','R'].map(t=>ACH.filter(a=>a.t===t).map(a=>{const h=achHas(a.id);return `<div class="ach-c t-${a.t} ${h?'got':'lock'}" title="${esc(a.odds||'')}"><i>${h?achIco(a):'<img class="ach-img lock" src="assets/ui/ic_lock.webp" alt="">'}</i><b>${esc(a.n)}</b><span>${esc(a.d)}</span><small>${ACH_T[a.t]}${h?' · '+new Date(save.ach[a.id]).toLocaleDateString():''}</small></div>`;}).join('')).join('')}</div>`;}

// ===== BOUNCE-OUTS: PDC data ~1 in 290 darts (0.35%); far rarer on dart 1 (0.02%) than darts 2 (0.12%) and 3 (0.21%) of all darts, i.e. per-dart ≈0.05% / 0.35% / 0.64%.
// Wire strikes cause most of them, so darts landing on a wire are ~4x likelier, clean beds ~0.5x. Pub boards bounce more than stage boards.
function boNearWire(x,y){const d=Math.hypot(x,y);const rings=[6.35,15.9,99,107,162,170];if(rings.some(r=>Math.abs(d-r)<1.4))return true;if(d<15.9||d>170)return false;let a=Math.atan2(x,-y)*180/Math.PI;a=(a+360+9)%18;const off=Math.min(a,18-a)*Math.PI/180;return d*Math.sin(off)<1.1;}
function boDecide(x,y,dartNo){if(!S||S.bull||S.drill)return false;const base=[.0005,.0035,.0064][Math.max(0,Math.min(2,(dartNo||1)-1))];const tierK=[1.5,1.4,1.3,1.2,1.1,1,.9][Math.max(0,Math.min(6,(S.tier&&S.tier.idx!=null?S.tier.idx:ui.tier)||0))];const wire=boNearWire(x,y)?3:.5;return Math.random()<base*tierK*wire;}

// ===== THE FLY: now and then a fly walks across the board. Hit it and you're an Ant Killer for life. =====
const FLY={on:false};
function flyRng(seed){let h=betHash(String(seed));return ()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return ((h>>>0)%100000)/100000;};}
function flyPos(t){const F=FLY;const k=Math.max(0,Math.min(F.pts.length-1.001,t/F.seg));const i=Math.floor(k),f=k-i;const a=F.pts[i],b=F.pts[i+1];return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,h:Math.atan2(b.y-a.y,b.x-a.x)};}
function flySpawn(seed){if(FLY.on||!S||S.done||S.practice&&!S.drill&&false)return;const r=flyRng(seed);const pts=[];let ang=r()*Math.PI*2;let x=Math.cos(ang)*175,y=Math.sin(ang)*175;pts.push({x,y});
 for(let i=0;i<9;i++){const tx=(r()-.5)*260,ty=(r()-.5)*260;const d=Math.hypot(tx,ty);const k=d>150?150/d:1;pts.push({x:tx*k,y:ty*k});}
 ang+=Math.PI*(.6+r()*.8);pts.push({x:Math.cos(ang)*190,y:Math.sin(ang)*190});
 Object.assign(FLY,{on:true,t0:performance.now(),seg:1700,pts,S:S});S.flyDone=true;let el=$('fly');if(!el){el=document.createElement('div');el.id='fly';el.className='fly';el.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse class="fw l" cx="13" cy="15" rx="9" ry="5"/><ellipse class="fw r" cx="27" cy="15" rx="9" ry="5"/><ellipse cx="20" cy="22" rx="6" ry="9" fill="#1a1a1a"/><circle cx="20" cy="12" r="5" fill="#111"/><circle cx="17.5" cy="10.5" r="2" fill="#8b1a1a"/><circle cx="22.5" cy="10.5" r="2" fill="#8b1a1a"/><path d="M14 20l-7 -3M14 24l-8 1M15 28l-6 4M26 20l7 -3M26 24l8 1M25 28l6 4" stroke="#111" stroke-width="1.4"/></svg>';document.body.appendChild(el);}el.hidden=false;
 try{noiseBurst({dur:.6,freq:180,q:14,gain:.03});}catch(e){}requestAnimationFrame(flyTick);}
function flyTick(){if(!FLY.on)return;const el=$('fly');if(!S||S.done||FLY.S!==S||!el){flyStop();return;}const t=performance.now()-FLY.t0;if(t>FLY.seg*(FLY.pts.length-1)){flyStop();return;}
 const p=flyPos(t);FLY.pos=p;const sc=V.mmToScreen(p.x,p.y);if(!sc||!sc.in||!$('result').hidden){el.style.opacity=0;}else{const px=Math.max(18,Math.min(34,9/V.boardMmPerPx()));el.style.opacity=1;el.style.width=el.style.height=px+'px';el.style.transform=`translate(${sc.x-px/2}px,${sc.y-px/2}px) rotate(${p.h+Math.PI/2}rad)`;}
 requestAnimationFrame(flyTick);}
function flyStop(){FLY.on=false;FLY.pos=null;const el=$('fly');if(el)el.hidden=true;}
// spawn chance at each turn start: about one match in three sees a fly. Online it's seeded by the room so every screen gets the same fly.
function flyMaybe(){if(!S||S.done||S.flyDone||FLY.on||S.bull)return;const vis=S.p.reduce((a,p)=>a+Math.floor((p.darts||0)/3),0);if(vis<4)return;
 const seed=S.online?((NET.room||'x')+':fly:'+vis):('L'+Math.random());const roll=S.online?(betHash(seed)%1000)/1000:Math.random();if(roll<.035)flySpawn(seed);}
// dart vs fly: the thrower's device decides (shared with the dart), everyone sees the splat
function flyCheck(x,y){if(!FLY.on||!FLY.pos)return false;const t=performance.now()-FLY.t0+500;const p=flyPos(t);return Math.hypot(x-p.x,y-p.y)<10||Math.hypot(x-FLY.pos.x,y-FLY.pos.y)<10;}
function flySwat(who,isMe){const p=FLY.pos;flyStop();const el=$('fly');if(el&&p){const sc=V.mmToScreen(p.x,p.y);if(sc){const sp=document.createElement('div');sp.className='fly-splat';sp.style.left=sc.x+'px';sp.style.top=sc.y+'px';document.body.appendChild(sp);setTimeout(()=>sp.remove(),2500);}}
 try{noiseBurst({dur:.08,freq:300,q:2,gain:.14});}catch(e){}
 if(isMe){try{achUnlock('fly');}catch(e){}const first=!save.antKiller;save.antKiller=true;save.trophies=Object.assign({},save.trophies||{},{fly:(save.trophies&&save.trophies.fly||0)+1});persist();try{trackEv('fly_swat');}catch(e){}if(NET.chan)mpTrack();
  setTimeout(()=>{flash('FLY SWATTED','gold',first?'Trophy: ANT KILLER · it stays on your name':'Ant Killer strikes again');try{confetti(1);V.cheer(.8);sfxCheer(true);}catch(e){}},300);}
 else setTimeout(()=>flash('FLY SWATTED','gold',who+' is an Ant Killer'),300);
 const pl=S&&S.p.find(q=>q.name===who);if(pl){pl.tag='Ant Killer';mpBoardRender();}}
{const _st2=startTurn;startTurn=function(){_st2.apply(this,arguments);try{flyMaybe();}catch(e){}};}

// ===== QUICK CHAT: taunts and reactions in online matches =====
const TAUNTS=[['Shot!','👏'],['Get in!','🙌'],['Oi oi!','🍻'],['Unlucky mate','🤝'],['Drink bitch','🍺'],['Bottle job','🍾'],['Choke!','😬'],['Lucky prick','🍀'],['Bullshit','💩'],['Who taught you to throw?','🤡'],['Fuck off','🖕'],['Get fucked','😂'],['You absolute weapon','🔥'],['Wanker','✊'],['Shit shot','🤦'],['Hurry up','⏱️']];
const CHAT={last:0};
function chatShow(name,text){const f=$('chatFeed');if(!f)return;const esc=x=>String(x).replace(/</g,'&lt;');const el=document.createElement('div');el.className='cf-msg';el.innerHTML=`<b>${esc(name)}</b><span>${esc(text)}</span>`;f.appendChild(el);while(f.children.length>3)f.removeChild(f.firstChild);setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),300);},3200);try{noiseBurst({dur:.04,freq:1900,q:6,gain:.05});}catch(e){}}
function chatSend(t){const now=performance.now();if(now-CHAT.last<1500)return;CHAT.last=now;const name=mpName()||'Mate';netSend('chat',{text:t,name});chatShow(name,t);chatToggle(false);try{trackEv('chat');}catch(e){}}
function chatToggle(on){const p=$('chatPanel');if(!p)return;if(on==null)on=p.hidden;p.hidden=!on;if(on&&!p.dataset.built){p.dataset.built='1';p.innerHTML=TAUNTS.map(([t,e])=>`<button type="button" class="cp-b" data-t="${t.replace(/"/g,'')}"><i>${e}</i>${t}</button>`).join('');p.querySelectorAll('.cp-b').forEach(b=>b.onpointerdown=ev=>{ev.stopPropagation();ev.preventDefault();chatSend(b.dataset.t);});}}
function chatSync(){const btn=$('btnChat');if(!btn)return;const on=!!(S&&S.online&&!S.done);btn.hidden=!on;if(!on){const p=$('chatPanel');if(p)p.hidden=true;}}
{const b=document.getElementById('btnChat');if(b)b.onpointerdown=ev=>{ev.stopPropagation();ev.preventDefault();chatToggle();};}

// ===== FIRST-PLAY LESSON: six darts (three guided, three on your own) =====
const LES={on:false};
function lessonUI(title,line,acts){const el=$('lesson');if(!el)return;el.hidden=false;el.innerHTML=`<div class="ls-top"><span class="ls-k">How to throw · dart ${Math.min(6,LES.n+1)} of 6</span><button type="button" class="ls-skip" id="lsSkip">Skip</button></div><b class="ls-t">${title}</b><span class="ls-l">${line}</span>${acts?`<div class="ls-acts">${acts}</div>`:''}<i class="ls-prog"><b style="width:${LES.n/6*100}%"></b></i>`;$('lsSkip').onclick=ev=>{ev.stopPropagation();lessonEnd(true);};}
function lessonStart(){LES.on=true;LES.n=0;LES.step='aim';LES.t0=performance.now();LES.pts=0;playPractice();try{trackEv('lesson_start');}catch(e){}setTimeout(()=>{if(!LES.on)return;if(S&&S.bull){S.bull=null;S.cur=0;S.dart=1;S.busy=false;}lessonUI('Aim on the board','Drag across the board to put the crosshair on the red treble at the top: T20. It drifts around on its own. That\'s your hand.');},900);}
function lessonEnd(skipped){LES.on=false;save.lessonDone=true;persist();const el=$('lesson');if(el)el.hidden=true;try{trackEv(skipped?'lesson_skip':'lesson_done');}catch(e){}}
function lessonFinish(){const avg=(LES.pts/6*3).toFixed(0);LES.step='done';lessonUI('Lesson done',`Three-dart average ${avg}. Wait for the drift, lock it on target, let go when the ring is tightest. That's the whole game. Doubles finish legs.`,`<button type="button" class="big" id="lsCareer">Start a career</button><button type="button" class="ghost" id="lsAgain">Replay</button><button type="button" class="ghost" id="lsKeep">Keep throwing</button>`);
 const fin=()=>{LES.on=false;save.lessonDone=true;persist();$('lesson').hidden=true;};$('lsCareer').onclick=ev=>{ev.stopPropagation();fin();if(S)S.done=true;$('hud').hidden=true;showCreator(false);};$('lsAgain').onclick=ev=>{ev.stopPropagation();fin();if(S)S.done=true;lessonStart();};$('lsKeep').onclick=ev=>{ev.stopPropagation();fin();};try{trackEv('lesson_done');}catch(e){}}
{const _sa=setAim;setAim=function(x,y){_sa(x,y);if(LES.on&&LES.step==='aim'&&performance.now()-LES.t0>1200){LES.step='aimed';setTimeout(()=>{if(LES.on&&LES.step==='aimed'){LES.step='hold';lessonUI('Lock it in',(feelPhone()?'Watch the drift. The moment the crosshair sits on T20, press and hold the outlined area below the board.':'Watch the drift. The moment the crosshair sits on T20, press and hold the outlined area on the right (or Space).')+' Pressing locks your aim.');}},700);}};}
{const _sp=startPull;startPull=function(src){_sp.apply(this,arguments);/* ENG-REL: the press event goes through (its timeStamp is the pull start) */if(LES.on&&S&&S.pulling&&LES.n<3){LES.step='pull';lessonUI('Watch the ring','Holding locked your aim. The ring shrinks at the same speed every time. Let go when it\'s tightest: that ring is where the dart can land. Too early or too late and it opens up again.');}};}
{const _ld=land;land=function(x,y,far){const me=S&&S.p[S.cur];const mine=me&&!me.ai;const r=_ld(x,y,far);if(LES.on&&mine&&LES.step!=='done'){const v=S.lastRec&&S.visit.length===0?null:S.visit[S.visit.length-1];const lb=v?v.label:'';LES.pts+=v&&!v.bust?v.v:0;LES.n++;
  const tm=S.lastTiming||'';if(LES.n<3){LES.step='aim';LES.t0=performance.now()-2000;lessonUI(`${lb==='MISS'?'Off the board':lb} · ${tm}`,`${tm==='Perfect'?'Spot on: let go at the tightest ring and it lands right where you locked.':/late|Held/i.test(tm)?'Late releases land low. Let go a touch sooner.':/early/i.test(tm)?'Early releases land high. Hold a touch longer.':'Close. The ring shrinks at the same speed every throw, so you can learn it.'} Again: wait, lock, let go.`);}
  else if(LES.n===3){LES.step='solo';lessonUI(`That's a visit`,`Three darts make a visit. Now three on your own, no help.`);}
  else if(LES.n<6){lessonUI('On your own',`${lb||'Dart'} · ${tm}. Keep going.`);}
  else lessonFinish();}return r;};}

// ===== PUB RULES: Lee's drinking game for online matches (host toggles it) =====
function pubCfg(){if(mpOpt('mpPub',0)!==1)return null;const sips=String($('pubSips').value||'').split(/[ ,]+/).map(Number).filter(n=>n>0&&n<=180);const tre=String($('pubTre').value||'').toUpperCase().split(/[ ,]+/).map(s=>s.replace(/^TREBLE|^TRIPLE/,'T')).filter(s=>/^[TD](\d|1\d|20)$/.test(s)||s==='BULL');const tg=k=>{const b=document.querySelector('#pubTg [data-k="'+k+'"]');return !!(b&&b.getAttribute('aria-pressed')==='true');};
 return {low:tg('low'),sips:[...new Set(sips)].slice(0,6),tre:[...new Set(tre)].slice(0,6),bust:tg('bust'),t180:tg('t180'),bets:tg('bets'),water:tg('water')};}
function pubText(p){if(!p)return '';const r=[];if(p.sips.length)r.push(p.sips.join('/')+' = sip');if(p.low!==false)r.push('under 60 = sip, 26 or less = drink');if(p.tre.length)r.push('unaimed '+p.tre.join('/')+' = down it');if(p.bust)r.push('bust = sip');if(p.t180!==false)r.push('others downs it on 180, sip on 140+');if(p.bets)r.push('secret bet rounds');return 'Pub rules: '+r.join(', ');}
function pubInit(cfg){S.pub=cfg&&cfg.pub?{cfg:cfg.pub,p:S.p.map(()=>({tot:0,pend:0,lvl:0,downs:0})),bet:null,vtid:'',seen:{},visits:0,lastRound:0,myBets:[],buff:null,round:null}:null;try{cardsInit();}catch(e){console.warn('cards',e);}const bl=$('pubBlur');if(bl)bl.hidden=true;document.body.classList.remove('pub-drunk');const br=$('betRound');if(br)br.hidden=true;}
function pubIdx(key){return S.p.findIndex(p=>p.key===key);}
function pubSig(){if(!S||!S.pub)return 1;const d=S.pub.p[S.cur];if(!d)return 1;let m=1+.11*Math.min(8,d.lvl);if(betBuffActive('hot'))m*=.7;return m;}
function pubSway(){if(!S||!S.pub)return 1;const d=S.pub.p[S.cur];if(!d)return 1;let m=1+.22*Math.min(8,d.lvl);if(betBuffActive('steady'))m*=.4;if(betBuffActive('hot'))m=0;return m;}
// one home for pub announcements: a band in the player pane, below the roster, above the hold label
const PUBQ={t:null,lastAt:0};
function pubBandPlace(){const el=$('pubBand');if(!el)return;const mb=$('mpBoard');let top=null;if(mb&&!mb.hidden){const r=mb.getBoundingClientRect();if(r.height)top=r.bottom+8;}el.style.top=top!=null?top+'px':'';}
function pubBand(kind,title,line,ms,cue){const el=$('pubBand');if(!el)return;const now=performance.now();const esc=x=>String(x).replace(/</g,'&lt;');
 if(!el.hidden&&now-PUBQ.lastAt<700&&el.dataset.kind===kind&&kind!=='down'){const n=(+el.dataset.n||1)+1;el.dataset.n=n;el.querySelector('.pb-t').textContent=(kind==='land'?n+' BETS LANDED':kind==='miss'?n+' BETS MISSED':title);const l=el.querySelector('.pb-l');l.innerHTML+=' · '+esc(line);}
 else{el.dataset.kind=kind;el.dataset.n=1;el.className='pub-band k-'+kind;el.innerHTML=`<b class="pb-t">${esc(title)}</b><span class="pb-l">${esc(line)}</span>`;el.hidden=false;if(cue)try{cue();}catch(e){}}
 PUBQ.lastAt=now;pubBandPlace();clearTimeout(PUBQ.t);PUBQ.t=setTimeout(()=>{el.hidden=true;},ms||1600);}
function pubBandAdd(text){const el=$('pubBand');if(!el||el.hidden)return;const l=el.querySelector('.pb-l');if(l)l.innerHTML+=` <em>${String(text).replace(/</g,'&lt;')}</em>`;clearTimeout(PUBQ.t);PUBQ.t=setTimeout(()=>{el.hidden=true;},2000);}
const PUBCUE={sip:()=>noiseBurst({dur:.05,freq:2600,q:8,gain:.06}),down:()=>{noiseBurst({dur:.08,freq:420,q:2,gain:.12});setTimeout(()=>noiseBurst({dur:.08,freq:300,q:2,gain:.1}),110);},land:()=>{noiseBurst({dur:.06,freq:1400,q:10,gain:.07});setTimeout(()=>noiseBurst({dur:.06,freq:2100,q:10,gain:.07}),120);},miss:()=>noiseBurst({dur:.04,freq:700,q:4,gain:.05}),jack:()=>{[0,110,220].forEach((t,k)=>setTimeout(()=>noiseBurst({dur:.07,freq:1300+k*500,q:9,gain:.08}),t));}};
function pubDrink(i,s,why,big){if(!S||!S.pub)return;const d=S.pub.p[i];if(!d)return;if(d.dd>0&&s>0&&i===S.cur)return;const nm=S.p[i].name;
 if(s>0){d.tot+=s;d.pend=Math.max(0,Math.min(8-d.lvl,d.pend+s));if(big)d.downs++;}else{let w=-s;const a=Math.min(d.pend,w);d.pend-=a;w-=a;d.lvl=Math.max(0,d.lvl-w);}
 if(big)mt(()=>pubBand('down','DOWN IT',`${nm} · ${why}${s!==4?' · '+s+' sips after the cap':''}`,1800,PUBCUE.down),500);else if(s>0&&why==='DRINK BITCH')pubBand('down','DRINK BITCH',`${nm} threw a 26`,2200,PUBCUE.down);else if(s>0)pubBand('sip',s>1?s+' SIPS':'SIP',`${nm} · ${why}`,1300,PUBCUE.sip);else pubBand('water','WATER',`${nm} · ${why}`,1300,PUBCUE.sip);
 mpBoardRender();}
function pubSend(key,s,why,big,rid){const i=pubIdx(key);const id=NET.myId+':'+Date.now()+':'+Math.random().toString(36).slice(2,6);if(i>=0)pubDrink(i,pubCap(i,s,rid),why,big);netSend('pubd',{to:key,s,why,big:!!big,id,rid});}
function pubCap(i,s,rid){if(rid==null||s<=0||!S.pub)return s;const d=S.pub.p[i];d.rcap=d.rcap||{};const used=d.rcap[rid]||0;const ok=Math.max(0,Math.min(s,4-used));d.rcap[rid]=used+ok;return ok;}
function pubRecv(m){if(!S||!S.pub||S.done)return;if(m.t==='pubd'){if(S.pub.seen[m.id])return;S.pub.seen[m.id]=1;const i=pubIdx(m.to);if(i>=0){const sv=pubCap(i,Math.max(-1,Math.min(4,+m.s||0)),m.rid);if(sv)pubDrink(i,sv,String(m.why||'').slice(0,40),!!m.big);}return;}
 if(m.t==='rlock'){betRecvLock(m);return;}if(m.t==='rres'){const i=pubIdx(m.from);if(i>=0){const d=S.pub.p[i];d.bp=(d.bp||0)+1;if(m.ok){d.bw=(d.bw||0)+1;if(m.p&&(!S.pub.long||m.p<S.pub.long.p))S.pub.long={p:m.p,who:S.p[i].name,bet:String(m.bet||'').slice(0,30),on:String(m.on||'').slice(0,20)};}betRevealOther(m);}return;}if(m.t==='bet'||m.t==='nobet'){const i=pubIdx(m.from);if(i<0)return;if(m.t==='bet')banter(`${S.p[i].name} bets ${pubBetName(m.kind)}`,'Side bet');if(S.cur===0&&S.pub.wait&&m.tid===S.pub.vtid){S.pub.wait.delete(m.from);if(!S.pub.wait.size)pubWaitDone();}}}
// ===== PUB RULES v2: ABILITY CARDS (replace bet rounds) =====
// Draft 1 of 3 at the start and every 3rd round, hold 2, contents secret. Offence fires live into the current thrower; it lands on THEIR device
// (the thrower owns their darts) and every screen shows the result from the target's 'cack' answer.
const CARDS=[
 {id:'horn',n:'Air Horn',ty:'off',r:'C',live:1,aud:1,ico:'📯',fx:'Mid-aim: wild sway. Mid-pull: shakes the lock and the miss gets bigger.',fl:'HOOOONK. Sorry, was that your backswing?'},
 {id:'bump',n:'Bump the Table',ty:'off',r:'C',live:1,ico:'🍺',fx:'Shoves their aim 15 mm. If they have locked, nudges the lock 5 mm.',fl:'Oi, watch the drinks.'},
 {id:'heckle',n:'Heckle',ty:'off',r:'C',live:1,aud:1,ico:'🗣️',fx:'Their ring tightens 80 ms early or late.',fl:"You throw like you're feeding ducks."},
 {id:'orders',n:'Last Orders',ty:'off',r:'C',ico:'🔔',fx:'Their next pull runs 35% faster.',fl:"Chop chop, the kitchen's shut."},
 {id:'juke',n:'Jukebox',ty:'off',r:'C',aud:1,ico:'🎵',fx:'Their aim drifts 40% faster for the visit.',fl:'Mr Brightside. Again.'},
 {id:'flash',n:'Camera Flash',ty:'off',r:'U',live:1,ico:'📸',fx:'White-out, then no reticle for a second.',fl:'Smile for the group chat.'},
 {id:'wobble',n:'Wobbly Board',ty:'off',r:'U',ico:'🪵',fx:'Their aim drifts 60% wider for the visit.',fl:'Who hung this, a Wellington builder?'},
 {id:'cooker',n:'Pressure Cooker',ty:'off',r:'U',ico:'♨️',fx:'Next dart: half the perfect window, misses 30% bigger.',fl:"This one's for the house, no pressure."},
 {id:'vape',n:'Vape Cloud',ty:'off',r:'U',ico:'💨',fx:'Next 2 darts: board fogged.',fl:"Is that mango? Can't see the 20."},
 {id:'nan',n:"Nan's Readers",ty:'off',r:'U',ico:'👓',fx:'Next dart flies 8 mm off where the reticle says.',fl:"Borrowed your nan's glasses."},
 {id:'spill',n:'Spilled Pint',ty:'off',r:'U',ico:'🫗',fx:'Next dart: no ring. Time it blind.',fl:"Oops. That's on you."},
 {id:'tap',n:'Shoulder Tap',ty:'off',r:'R',live:1,ico:'👉',fx:'Fired mid-pull: their release lands 70 ms late (low).',fl:'Mate. Mate. MATE.'},
 {id:'double',n:'Double Trouble',ty:'off',r:'R',drink:1,ico:'✌️',fx:'Their drinks double next visit.',fl:'Insurance? Never heard of her.'},
 {id:'stick',n:'Stick It On',ty:'off',r:'U',drink:1,ico:'🧾',fx:'If their next visit is under 60, they down it.',fl:'Put it on their tab.'},
 {id:'ear',n:'Earplugs',ty:'def',r:'C',ico:'🦻',fx:'Blocks the next Air Horn, Heckle or Jukebox.',fl:"Can't hear you, mate."},
 {id:'bouncer',n:'Bouncer',ty:'def',r:'U',ico:'🚪',fx:'Blocks the next card thrown at you. The thrower sips.',fl:'Not tonight, sunshine.'},
 {id:'rts',n:'Return to Sender',ty:'def',r:'R',ico:'↩️',fx:'Bounces the next card back at whoever threw it.',fl:'Right back at ya.'},
 {id:'water',n:'Water Round',ty:'self',r:'C',drink:1,ico:'💧',fx:'Sobers you up 2 wobble levels, clears 2 pending sips, and you skip sip rules next visit.',fl:'Hydrate or die-drate.'},
 {id:'dd',n:'Designated Driver',ty:'self',r:'R',drink:1,ico:'🚗',fx:'No drinking for your next 2 visits.',fl:"Someone's gotta drive."},
 {id:'steady',n:'Steady Hands',ty:'self',r:'U',ico:'✋',fx:'Next visit: no sway, no shake. Pure timing.',fl:'Point and shoot.'},
 {id:'ice',n:'Ice in the Veins',ty:'self',r:'U',ico:'🧊',fx:'Next visit: heart rate 60, no nerves.',fl:'Resting heart rate of a sloth.'},
 {id:'groove',n:'Groove',ty:'self',r:'C',ico:'🕺',fx:'Next visit: perfect window 60% wider.',fl:'Feeling it.'},
 {id:'clear',n:'One Clear Thought',ty:'self',r:'C',ico:'🧠',fx:'Next visit: the drink doesn\'t touch your throw.',fl:'Sober for nine seconds.'},
 {id:'hot',n:'Hot Hand',ty:'self',r:'R',ico:'🔥',fx:'If your next dart is perfect, the rest of the visit groups 30% tighter.',fl:'Heating up.'},
 {id:'shout',n:'My Shout',ty:'chaos',r:'C',drink:1,ico:'🍻',fx:'Everyone else sips. Now.',fl:'My shout. Your livers.'},
 {id:'swap',n:'Pint Swap',ty:'chaos',r:'R',drink:1,ico:'🔁',fx:'Swap drink levels with the current thrower.',fl:"That's mine now."},
 {id:'dip',n:'Lucky Dip',ty:'chaos',r:'C',ico:'🎲',fx:'A random card at a random player. Could be you.',fl:'Spin the wheel, coward.'},
 {id:'fly',n:'Release the Fly',ty:'chaos',r:'R',ico:'🪰',fx:'A fly lands on the thrower\'s board this visit.',fl:'Swat it. I dare you.'},
 // 3+ player cards (only dealt when three or more are playing)
 {id:'gang',n:'Gang Up',ty:'off',r:'R',m3:1,aud:1,ico:'👥',fx:'The whole table gets in their ear: aim drifts 40% wider for the visit and the first ring lands 60 ms off.',fl:'Three on one. Fair is fair.'},
 {id:'turns',n:'Crowd Turns',ty:'off',r:'U',m3:1,aud:1,ico:'📣',fx:'Heart rate +15 and aim drifts 50% wider for the visit.',fl:'The whole pub is against you now.'},
 {id:'tab',n:'Pass the Tab',ty:'chaos',r:'C',m3:1,drink:1,ico:'💳',fx:'The thrower and whoever is up next both sip.',fl:'Split it. Not with me.'},
 {id:'tax',n:'Leader Tax',ty:'chaos',r:'U',m3:1,drink:1,ico:'👑',fx:'Whoever is leading drinks 2. Can be played any time.',fl:'Heavy is the head.'},
 {id:'pass',n:'Pass It On',ty:'chaos',r:'C',m3:1,ico:'🃏',fx:'A random attack card at a random player. Never you.',fl:'Not my problem.'},
 {id:'table',n:'Round the Table',ty:'chaos',r:'R',m3:1,drink:1,ico:'🍽️',fx:'Everyone sips except the drunkest, who gets a water (−1).',fl:'Looking after the weak.'},
 {id:'wing',n:'Wingman',ty:'self',r:'U',m3:1,ico:'🤝',fx:'Next visit: perfect window 40% wider and 20% less sway.',fl:'Got your back, bro.'},
 {id:'under',n:'Underdog',ty:'self',r:'R',m3:1,ico:'🐕',fx:'Not leading? Next visit: no sway and a 40% wider window. Leading? Just 20% wider.',fl:'Nobody backs the dog.'}];
const CARD=Object.fromEntries(CARDS.map(c=>[c.id,c]));const RAR_W={C:50,U:30,R:16,L:4};
function cardsOn(){return !!(S&&S.pub&&S.pub.cfg&&S.pub.cfg.bets);}
function cardsInit(){if(!cardsOn())return;S.pub.cards={hand:[],armed:[],n:{},hit:{},firedRound:-1,round:-1,draft:null,pendDraft:false,seen:{},flags:{}};S.fx=[];setTimeout(()=>cardDraftAt(0),3800);cardTray();}
function cardRound(){const N=Math.max(1,S.p.filter(p=>!p.left).length);return Math.floor((S.pub.visits||0)/N);}
function cardRank(){const order=S.p.map((p,i)=>({i,k:(p.legs||0)*1000-(p.score||0)})).sort((a,b)=>b.k-a.k);return order.findIndex(o=>o.i===0)/Math.max(1,order.length-1);} // 0 leader .. 1 last
function cardDeal(round){const C=S.pub.cards;const rk=cardRank();const lvl=(S.pub.p[0]||{}).lvl||0;let seed=betHash((NET.room||'x')+':'+round+':'+(NET.myId||'me'));const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return (seed>>>8)/16777216;};
 const alive3=S.p.filter(p=>!p.left).length>=3;const pool=CARDS.filter(c=>!(c.m3&&!alive3)&&!(round===0&&(c.r==='R'||c.r==='L')&&c.ty==='off'));const w=c=>{let x=RAR_W[c.r];if(c.r==='R')x*=1+rk;if(c.ty==='off')x*=1+.15*rk;if(rk===0&&c.r==='L')x=0;if(rk===0&&(c.ty==='self'||c.ty==='def'))x*=1.15;if((c.id==='water'||c.id==='dd')&&lvl>=4)x*=2;if(c.id==='water'||c.id==='dd'||c.id==='clear'){const ot=(S.pub.p||[]).filter((q,qi)=>qi!==0&&!(S.p[qi]&&S.p[qi].left)).map(q=>q.lvl||0);const avg=ot.length?ot.reduce((a2,b2)=>a2+b2,0)/ot.length:lvl;const gap=lvl-avg;if(gap>=2)x*=Math.min(4,1+.6*(gap-1));}return x;};
 const pick=[];for(let k=0;k<3;k++){const opts=pool.filter(c=>!pick.includes(c));const tot=opts.reduce((a,c)=>a+w(c),0);let r=rnd()*tot;for(const c of opts){r-=w(c);if(r<=0){pick.push(c);break;}}if(pick.length<=k)pick.push(opts[0]);}return pick;}
function cardDraftAt(round){if(!cardsOn()||S.done)return;const C=S.pub.cards;if(C.round>=round)return;C.round=round;if(S.cur===0&&!S.p[0].ai){C.pendDraft=true;return;}cardDraftShow(round);}
function cardDraftShow(round){const C=S.pub.cards;const host=$('cardDraft');if(!host)return;const opts=cardDeal(round);C.draft={opts,t0:performance.now()};
 const full=C.hand.length>=2;host.innerHTML=`<div class="cd-h"><b>${round===0?'Pick your first card':'Card round'}</b><span id="cdTime">12</span></div><p class="cd-sub">${full?'Hand full: pick one to swap in, or skip.':'Secret. Hold up to 2.'}</p><div class="cd-row">${opts.map((c,i)=>`<button type="button" class="cd-card ty-${c.ty} r-${c.r}" data-i="${i}"><span class="cd-ico">${c.ico}</span><b>${c.n}</b><em>${{off:'Offence',def:'Defence',self:'Self',chaos:'Chaos'}[c.ty]} · ${{C:'Common',U:'Uncommon',R:'Rare',L:'Legendary'}[c.r]}</em><span class="cd-fx">${c.fx}</span></button>`).join('')}</div>${full?'<button type="button" class="cd-skip" id="cdSkip">Keep my hand</button>':''}`;
 host.hidden=false;const done=(c)=>{if(!C.draft)return;C.draft=null;host.hidden=true;clearInterval(C.dt);if(c){if(C.hand.length>=2)C.hand.shift();C.hand.push(c.id);}netSend('chand',{n:C.hand.length});C.n[NET.myId]=C.hand.length;cardTray();try{mpBoardRender();}catch(e){}};
 [...host.querySelectorAll('.cd-card')].forEach(b=>b.onclick=()=>done(opts[+b.dataset.i]));const sk=$('cdSkip');if(sk)sk.onclick=()=>done(null);
 clearInterval(C.dt);C.dt=setInterval(()=>{const left=12-Math.floor((performance.now()-(C.draft?C.draft.t0:0))/1000);const t=$('cdTime');if(t)t.textContent=Math.max(0,left);if(!C.draft||left<=0){if(C.draft)done(full?null:opts[Math.floor(Math.random()*3)]);clearInterval(C.dt);}},250);}
function cardTray(){const host=$('cardTray');if(!host)return;if(!cardsOn()||S.done){host.hidden=true;return;}const C=S.pub.cards;host.hidden=!C.hand.length;
 const thr=S.p[S.cur];const tName=thr&&S.cur!==0?thr.name:null;host.innerHTML=C.hand.map((id,i)=>{const c=CARD[id];const sel=C.sel===i;const tgt=c.ty==='off'||id==='swap'||id==='fly'||id==='tab';return `<button type="button" class="ct-card ty-${c.ty}${sel?' sel':''}" data-i="${i}" title="${c.fx}"><span>${c.ico}</span><b>${c.n}</b>${sel?`<em>${tgt?(tName?'Tap again: '+tName:'Wait for their turn'):'Tap again to play'}</em>`:''}</button>`;}).join('');
 [...host.querySelectorAll('.ct-card')].forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(C.sel===i){C.sel=null;cardPlay(i);}else{C.sel=i;cardTray();clearTimeout(C.selT);C.selT=setTimeout(()=>{C.sel=null;cardTray();},3000);}});}
function cardSay(msg){pubBand('card','Cards',msg,1800,PUBCUE.miss);}
function cardPlay(i){const C=S.pub.cards;const id=C.hand[i];const c=CARD[id];if(!c)return;const round=cardRound();const thr=S.p[S.cur];
 const needT=c.ty==='off'||id==='swap'||id==='fly'||id==='dip'||id==='tab';
 if(needT){if(S.cur===0||!thr||thr.left||S.done){cardSay('Wait for someone else to be throwing.');return;}if(C.firedRound===round&&c.ty!=='chaos'){cardSay('One card a round. Next round.');return;}if(C.hit[thr.key+':'+pubTid()]&&c.ty==='off'){cardSay(thr.name+' is already copping it this visit.');return;}}
 C.hand.splice(i,1);netSend('chand',{n:C.hand.length});C.n[NET.myId]=C.hand.length;cardTray();try{mpBoardRender();}catch(e){}
 if(c.ty==='def'){C.armed.push(id);cardSay(`${c.ico} ${c.n} armed. Quietly.`);netSend('cack',{cid:cardCid(),res:'armed',from:NET.myId,to:NET.myId});return;}
 if(c.ty==='self'){cardSelf(id);return;}
 if(id==='shout'){S.p.forEach((p,j)=>{if(j!==0&&!p.left){pubSend(p.key,1,'My Shout from '+S.p[0].name);}});cardAnnounce({id,from:NET.myId,to:null,res:'live'},true);return;}
 const alive=S.p.map((p,j)=>({p,j})).filter(o=>!o.p.left);
 if(id==='tab'){const ci=S.cur;let nx=ci;for(let k=1;k<=S.p.length;k++){const j=(ci+k)%S.p.length;if(!S.p[j].left){nx=j;break;}}pubSend(S.p[ci].key,1,'Pass the Tab from '+S.p[0].name);if(nx!==ci)pubSend(S.p[nx].key,1,'Pass the Tab from '+S.p[0].name);cardAnnounce({id,from:NET.myId,to:thr.key,res:'live'},true);netSend('cack',{cid:cardCid(),res:'live',id,from:NET.myId,to:thr.key});return;}
 if(id==='tax'){const ld=alive.slice().sort((a,b)=>((b.p.legs||0)*1000-(b.p.score||0))-((a.p.legs||0)*1000-(a.p.score||0)))[0];if(ld){pubSend(ld.p.key,2,'Leader Tax from '+S.p[0].name);cardAnnounce({id,from:NET.myId,to:ld.p.key,res:'live'},true);netSend('cack',{cid:cardCid(),res:'live',id,from:NET.myId,to:ld.p.key});}return;}
 if(id==='table'){const lv=o=>(S.pub.p[o.j]||{}).lvl||0;const dr=alive.slice().sort((a,b)=>lv(b)-lv(a))[0];alive.forEach(o=>{pubSend(o.p.key,o===dr?-1:1,'Round the Table from '+S.p[0].name);});cardAnnounce({id,from:NET.myId,to:dr?dr.p.key:null,res:'live'},true);netSend('cack',{cid:cardCid(),res:'live',id,from:NET.myId,to:dr?dr.p.key:null});return;}
 if(id==='pass'){const offs=CARDS.filter(x=>x.ty==='off'&&!x.m3);const fid2=offs[Math.floor(Math.random()*offs.length)].id;const others=alive.filter(o=>o.j!==0);if(!others.length){cardSay('No one to pass it to.');return;}const tg=others[Math.floor(Math.random()*others.length)].p.key;cardAnnounce({id:'dip',from:NET.myId,to:tg,res:'live',sub:fid2},true);const m2={cid:cardCid(),id:fid2,from:NET.myId,to:tg,v:pubTid(),lvl:(S.pub.p[0]||{}).lvl||0};netSend('card',m2);return;}
 let fid=id,to=thr.key;if(id==='dip'){const pool=CARDS.filter(x=>x.ty==='off');fid=pool[Math.floor(Math.random()*pool.length)].id;const alive=S.p.filter(p=>!p.left);to=alive[Math.floor(Math.random()*alive.length)].key;cardAnnounce({id:'dip',from:NET.myId,to,res:'live',sub:fid},true);if(to===NET.myId){cardApply({cid:cardCid(),id:fid,from:NET.myId,to},true);return;}}
 C.firedRound=round;const m={cid:cardCid(),id:fid,from:NET.myId,to,v:pubTid(),lvl:(S.pub.p[0]||{}).lvl||0};netSend('card',m);cardSay(`${CARD[fid].ico} ${CARD[fid].n} → ${S.p[pubIdx(to)].name}…`);}
function cardCid(){return Math.random().toString(36).slice(2,10);}
function cardSelf(id){const C=S.pub.cards;const add=(mods,until,extra)=>S.fx.push(Object.assign({id,until,mods,from:NET.myId,armedFor:'next'},extra||{}));
 if(id==='steady')add({A:0,tr:0},'visit');else if(id==='ice')add({A:.75,w:.7,ice:1},'visit');else if(id==='groove')add({P:1.6},'visit');else if(id==='clear')add({clear:1},'visit');else if(id==='hot')add({},'visit',{hot:1});else if(id==='wing')add({P:1.4,A:.8},'visit');else if(id==='under'){const ord=S.p.map((p,j)=>({j,k:(p.legs||0)*1000-(p.score||0)})).filter(o=>!S.p[o.j].left).sort((a,b)=>b.k-a.k);if(ord.length&&ord[0].j===0)add({P:1.2},'visit');else add({A:0,tr:0,P:1.4},'visit');}
 const visible=CARD[id].drink;if(id==='water'){const d=S.pub.p[0];d.pend=Math.max(0,(d.pend||0)-2);}
 netSend('cack',{cid:cardCid(),res:'self',id:visible?id:null,from:NET.myId,to:NET.myId});cardAnnounce({id:visible?id:null,from:NET.myId,to:NET.myId,res:'self'},true);}
// target side: decide what happens, apply, answer for everyone
function cardRecv(m){if(!S||!S.pub||!S.pub.cards||S.done)return;const C=S.pub.cards;
 if(m.t==='chand'){C.n[m.from]=Math.max(0,Math.min(2,+m.n||0));try{mpBoardRender();}catch(e){}return;}
 if(m.t==='cack'){if(C.seen[m.cid])return;C.seen[m.cid]=1;cardAnnounce(m,false);return;}
 if(m.t==='card'){if(m.to!==NET.myId)return;if(C.seen['in'+m.cid])return;C.seen['in'+m.cid]=1;cardApply(m,false);}}
function cardApply(m,localOnly){const C=S.pub.cards;const c=CARD[m.id];if(!c)return;const ans=(res,extra)=>{const a=Object.assign({cid:m.cid,res,id:m.id,from:m.from,to:m.to},extra||{});if(!localOnly)netSend('cack',a);C.seen[a.cid]=1;cardAnnounce(a,true);};
 // defences
 if(c.ty==='off'||m.id==='swap'||m.id==='fly'){const ear=c.aud&&C.armed.indexOf('ear');if(c.aud&&ear>=0){C.armed.splice(ear,1);ans('blocked',{by:'ear'});return;}
  const bi=C.armed.indexOf('bouncer');if(bi>=0&&m.from!==NET.myId){C.armed.splice(bi,1);pubSend(m.from,1,'Bounced by '+S.p[0].name);ans('blocked',{by:'bouncer'});return;}
  const ri=C.armed.indexOf('rts');if(ri>=0&&m.from!==NET.myId){C.armed.splice(ri,1);try{achUnlock('jackpot');}catch(e){}ans('reflected');netSend('card',{cid:cardCid(),id:m.id,from:NET.myId,to:m.from,v:'r',lvl:(S.pub.p[0]||{}).lvl||0});return;}}
 const myTurn=S.cur===0&&!S.done;
 if(m.id==='swap'){const d=S.pub.p[0];const mine=d.lvl||0;d.lvl=Math.max(0,Math.min(8,+m.lvl||0));ans('live',{lvl:mine,tl:d.lvl});return;}
 if(m.id==='fly'){if(myTurn&&!FLY.on){try{flySpawn('card:'+m.cid);}catch(e){}}ans(myTurn?'live':'returned');return;}
 if(c.drink){ans('live');return;}  // drink flags are set on every screen from the cack
 if(!myTurn){ans('returned');return;}
 const live=S.pulling||!S.busy;const fx=(mods,until,extra)=>S.fx.push(Object.assign({id:m.id,until,mods,from:m.from},extra||{}));const now=performance.now();
 switch(m.id){
  case 'horn':S.hr=Math.min(170,(S.hr||72)+25);if(S.pulling&&S.lock){S.lock.x+=gauss()*4;S.lock.y+=gauss()*4;fx({kv:1.3},'dart');}else fx({A:1.8},now+1500);break;
  case 'bump':{const a=Math.random()*Math.PI*2;if(S.pulling&&S.lock){S.lock.x+=Math.cos(a)*5;S.lock.y+=Math.sin(a)*5;}else{setAim(S.aim.x+Math.cos(a)*15,S.aim.y+Math.sin(a)*15);}break;}
  case 'heckle':S.markerShift=(Math.random()<.5?-80:80);fx({},'dart',{marker:1});break;
  case 'orders':fx({},'dart',{bar:1.35});break;
  case 'juke':fx({w:1.4},'visit');break;
  case 'flash':cardFlash();fx({},now+1000,{hideRet:1});break;
  case 'wobble':fx({A:1.6},'visit');break;
  case 'cooker':fx({P:.5,kv:1.3},'dart');break;
  case 'vape':fx({},'dart2',{fog:1,left:2});break;
  case 'nan':{const a=Math.random()*Math.PI*2;fx({},'dart',{nan:{x:Math.cos(a)*8,y:Math.sin(a)*8}});break;}
  case 'spill':fx({},'dart',{noMarker:1});break;
  case 'tap':if(S.pulling)S.relAdd=(S.relAdd||0)+70;else fx({},'dart',{tap:1});break;
  case 'gang':fx({w:1.4},'visit');S.markerShift=(Math.random()<.5?-60:60);fx({},'dart',{marker:1});break;
  case 'turns':S.hr=Math.min(170,(S.hr||72)+15);fx({A:1.5},'visit');break;}
 C.hit[S.p[0].key+':'+pubTid()]=1;ans(live?'live':'queued');cardFxSync();}
function cardFlash(){let el=$('cardFlash');if(!el){el=document.createElement('div');el.id='cardFlash';document.body.appendChild(el);}el.className='on';setTimeout(()=>{el.className='';},350);}
// fx lifetimes: 'dart' ends after the next release, 'dart2' after two, 'visit' at the end of the visit, a number = until that time
function cardFxTick(){if(!S||!S.fx)return;const now=performance.now();S.fx=S.fx.filter(f=>typeof f.until!=='number'||f.until>now);cardFxSync();}
function cardFxAfterDart(){if(!S||!S.fx)return;S.fx=S.fx.filter(f=>{if(f.until==='dart')return false;if(f.until==='dart2'){f.left=(f.left||2)-1;return f.left>0;}return true;});S.markerShift=0;S.relAdd=0;cardFxSync();}
function cardFxAfterVisit(){if(!S||!S.fx)return;S.fx=S.fx.filter(f=>f.until!=='visit'&&f.until!=='dart'&&f.until!=='dart2');S.markerShift=0;S.relAdd=0;cardFxSync();}
function cardFxHas(k){return !!(S&&S.fx&&S.cur===0&&S.fx.some(f=>f[k]));}
function cardFxSync(){const fog=cardFxHas('fog');document.body.classList.toggle('card-fog',fog);document.body.classList.toggle('card-nomarker',cardFxHas('noMarker'));document.body.classList.toggle('card-noret',cardFxHas('hideRet'));}
// every screen: show what happened, and keep the drink flags in step so drinking stays deterministic
function cardAnnounce(m,mine){const C=S.pub.cards;const c=CARD[m.id];const fi=pubIdx(m.from),ti=pubIdx(m.to);const fn=fi>=0?S.p[fi].name:'Someone',tn=ti>=0?S.p[ti].name:'';
 if(m.res==='armed'){if(!mine)pubBand('card','Card played',`${fn} played a card face down 🤫`,1600,PUBCUE.miss);return;}
 if(m.res==='self'){if(m.id==='water'&&fi>=0){const dW=S.pub.p[fi];dW.noSip=1;dW.lvl=Math.max(0,(dW.lvl||0)-2);dW.sober=0;try{betBlur();mpBoardRender();}catch(e){}}if(m.id==='dd'&&fi>=0)S.pub.p[fi].dd=2;if(!mine||!c)pubBand('card',c?`${c.ico} ${c.n}`:'Card played',c?`${fn}: “${c.fl}”`:`${fn} played a card 🤫`,2000,PUBCUE.land);return;}
 if(!c)return;
 if(m.id==='dip'&&m.sub){pubBand('card',`🎲 Lucky Dip`,`${fn} spun the wheel: ${CARD[m.sub].n} at ${tn||'someone'}`,2200,PUBCUE.jack);return;}
 if(m.res==='blocked'){pubBand('card',m.by==='ear'?'🦻 Earplugs':'🚪 Bouncer',`${tn} blocked ${fn}'s ${c.n}${m.by==='bouncer'?' · '+fn+' sips':''}`,2200,PUBCUE.miss);return;}
 if(m.res==='reflected'){pubBand('card','↩️ Return to Sender',`${tn} bounced ${c.n} back at ${fn}`,2200,PUBCUE.jack);return;}
 if(m.res==='returned'){if(fi===0){C.hand.length<2&&C.hand.push(m.id);C.firedRound=-1;cardTray();}pubBand('card','Too slow!',`${c.n} came back to ${fn}`,1600,PUBCUE.miss);return;}
 if(m.id==='swap'&&fi>=0&&ti>=0){S.pub.p[fi].lvl=Math.max(0,Math.min(8,+m.lvl||0));S.pub.p[ti].lvl=Math.max(0,Math.min(8,+m.tl||0));}
 if(m.id==='double'&&ti>=0)S.pub.p[ti].dbl=1;if(m.id==='stick'&&ti>=0)S.pub.p[ti].stick=1;
 if(ti>=0&&m.id!=='shout')C.hit[(S.p[ti].key)+':'+pubTid()]=1;
 pubBand('card',`${c.ico} ${c.n}`,`${fn}${m.id==='shout'?'':' → '+tn}: “${c.fl}”`,2400,m.id==='horn'?()=>{try{sfxHorn();}catch(e){}}:PUBCUE.jack);}
function sfxHorn(){if(!AU.ctx)return;const c=AU.ctx;[233,311].forEach(f=>{const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.06,c.currentTime+.03);g.gain.setValueAtTime(.06,c.currentTime+.6);g.gain.linearRampToValueAtTime(0,c.currentTime+.75);o.connect(g);g.connect(AU.master||c.destination);o.start();o.stop(c.currentTime+.8);});}
function pubBetName(k){return k==='ton'?'a ton or more':k==='out'?'a checkout':'under 40';}
function pubTid(){const t=S.p[S.cur];return legsPlayed()+':'+(t.key||S.cur)+':'+t.darts;}
// every turn: absorb half of what's waiting (so drinks kick in over two turns), open betting on other people's visits
function pubTurn(){if(!S||!S.pub||S.done)return;const d=S.pub.p[S.cur];if(d&&d.pend>0){const a=Math.ceil(d.pend/2);d.pend-=a;d.lvl+=a;if(S.cur===0)mt(()=>xpPop('Feeling it · aim wobbles more','tm'),400);}
 S.pub.vtid=pubTid();S.pub.bet=null;S.pub.wait=null;clearInterval(S.pub.tick);if(S.cur===0&&S.pub.buff)S.pub.buff.on=true;betBlur();
 // my visit: hold the throw up to 5s while the others bet (ends early once everyone has bet or passed)
 pubBar();mpBoardRender();}
const PUB_BET_MS=5000;
function pubWaitDone(){const P=S&&S.pub;if(!P||!P.wait)return;P.wait=null;clearInterval(P.tick);if(S.noPullUntil)S.noPullUntil=0;const el=$('pubBet');if(el&&S.cur===0){el.innerHTML='<span>Bets are in · throw</span>';setTimeout(()=>{if(el.innerHTML.indexOf('Bets are in')>=0)el.hidden=true;},900);}}
// bets: no hold on the thrower. The strip shows on bet moments (thrower on a finish, else ~1 visit in 3) and closes when the first dart lands.
function pubBar(){const el=$('pubBet');if(!el)return;el.hidden=true;return;const P=S&&S.pub;const t=P&&S.p[S.cur];
 if(!P||!P.cfg.bets||S.done||!t||t.left||S.visit.length||S.cur===0||sameTeam(0,S.cur)){if(el)el.hidden=true;return;}
 const esc=x=>String(x).replace(/</g,'&lt;');const onFin=t.score<=170&&route(t.score,3)&&!(S.din&&!t.opened);
 if(!onFin&&Math.random()>.34){el.hidden=true;return;}
 const opts=[];if(t.score>=100)opts.push(['ton','Ton+']);if(onFin)opts.push(['out','Checks out']);if(opts.length<2)opts.push(['low','Under 40']);
 const tid=P.vtid;let done=false;
 const close=(txt,ms)=>{done=true;el.innerHTML=`<span>${txt}</span>`;setTimeout(()=>{if(el.innerHTML.indexOf(txt)>=0)el.hidden=true;},ms);};
 el.className='pub-bet';el.innerHTML=`<span>${onFin?'On a finish · bet?':'Bet on '+esc(t.name)+'?'}</span>`+opts.map(o=>`<button type="button" data-k="${o[0]}">${o[1]}</button>`).join('')+`<button type="button" class="nb" data-k="none">No bet</button>`;el.hidden=false;
 [...el.querySelectorAll('button')].forEach(b=>b.onpointerdown=ev=>{ev.stopPropagation();ev.preventDefault();if(done||S.visit.length||P.bet||P.vtid!==tid)return;if(b.dataset.k==='none'){done=true;el.hidden=true;return;}P.bet={tid,kind:b.dataset.k,on:S.cur};netSend('bet',{kind:b.dataset.k,tid});close('You bet '+pubBetName(b.dataset.k),1400);});}
// rules after each dart (tc = thrower index, d0 = dart number before it landed)
function pubAfterDart(tc,d0,aim){if(!S||!S.pub)return;const P=S.pub,c=P.cfg;const b=$('pubBet');if(b&&!P.bet)b.hidden=true;const last=S.visit[S.visit.length-1];if(!last)return;
 if(c.tre.length&&!last.bust&&aim&&c.tre.includes(last.label)&&aim!==last.label){const slip=S.p[tc].ai?!!(S.remoteDart&&S.remoteDart.slip):!!S.slip;pubDrink(tc,4,(slip?'slipped into ':'unaimed ')+last.label,true);}S.slip=false;
 const ended=S.done||S.dart===d0||S.cur!==tc;if(!ended)return;
 const bust=S.visit.some(v=>v.bust);const tot=bust?0:S.visit.reduce((a,v)=>a+v.v,0);const won=!bust&&S.p[tc].score===0;
 if(bust&&c.bust)pubDrink(tc,1,'bust');
 // Pub rules v2 (darts only): while scoring, under 60 = sip, 26 or less = drink (26 = DRINK BITCH); others' 180 = down it, others' 140+ = sip
 {const st=S.visitStart!=null?S.visitStart:(S.p[tc].score+tot);const scoring=st>170||!route(st,3);let drank=false;const fl=P.p[tc]||{};const mul=fl.dbl?2:1;
  if(!bust&&!won&&S.visit.length===3&&scoring&&c.low!==false&&!fl.dd){if(fl.stick&&tot<60){pubDrink(tc,4*mul,'Stick It On · only '+tot,true);drank=true;}else if(tot<=26){pubDrink(tc,2*mul,tot===26?'DRINK BITCH':tot===0?'no score':'only '+tot,tot===26);drank=true;}else if(tot<60&&!fl.noSip){pubDrink(tc,1*mul,'only '+tot);drank=true;}}
  if(!drank&&!bust&&!won&&S.visit.length===3&&c.sips.includes(tot))pubDrink(tc,1,tot===26?'DRINK BITCH':'a '+tot);}
 if(c.t180!==false){if(tot===180)S.p.forEach((p,i)=>{if(i!==tc&&!p.left&&!sameTeam(i,tc))pubDrink(i,4,S.p[tc].name+' hit 180',true);});else if(tot>=140&&!bust)S.p.forEach((p,i)=>{if(i!==tc&&!p.left&&!sameTeam(i,tc))pubDrink(i,1,S.p[tc].name+' hit '+tot);});}
 const res={tot,bust,won,labels:S.visit.map(v=>String(v.label).replace('·','')),tre:0,zero:0,n:S.visit.length};res.ns=res.labels.map(l=>l==='BULL'||l==='25'?25:(parseInt(l.replace(/^[TD]/,''))||0));res.tre=res.labels.filter(l=>l[0]==='T').length;res.zero=S.visit.filter(v=>!v.bust&&v.v===0).length;
 try{betResolve(tc,res);}catch(e){console.warn('bet',e);}
 if(tc===0&&P.buff&&P.buff.on){P.buff.visits--;if(P.buff.visits<=0)P.buff=null;else P.buff.on=false;}
 {const dd=P.p[tc];if(dd&&dd.lvl>0&&!dd.pend){dd.sober=(dd.sober||0)+1;if(dd.sober>=2){dd.sober=0;dd.lvl--;}}}
 P.visits++;betBlur();
 // the rotation after a bet round: hold the next throw ~2s so every screen sees the results land
 {const N=S.p.filter(p=>!p.left).length;if(P.lastRound&&P.visits>P.lastRound&&P.visits<=P.lastRound+N){S.noPullUntil=Math.max(S.noPullUntil||0,performance.now()+2200);}}
 {const fl=P.p[tc];if(fl){fl.dbl=0;fl.stick=0;fl.noSip=0;if(fl.dd>0)fl.dd--;}}
 if(P.cards){if(tc===0)cardFxAfterVisit();const rd=cardRound();if(rd>0&&rd%3===0)cardDraftAt(rd);if(tc===0&&P.cards.pendDraft){P.cards.pendDraft=false;setTimeout(()=>cardDraftShow(P.cards.round),900);}cardTray();}
 else if(!S.done&&!won)betMaybeRound();}
// Pub rules: a bad release sometimes drifts into a down-it treble (T18/T12 by default). Decided on the thrower's device, so every screen agrees.
function pubLure(x,y){if(!S||!S.pub||!S.online)return null;const tre=(S.pub.cfg.tre||[]).filter(l=>/^[TD]\d/.test(l));if(!tre.length)return null;const aim=scoreAt(S.aim.x,S.aim.y).label;
 const t=S.lastTiming||'';const bad=(t==='Early'||t==='Late'||t==='Held')?1:0;if(!bad)return null;const d=S.pub.p[S.cur];const lvl=d?d.lvl:0;
 const p=.03+Math.min(.03,.004*lvl);if(Math.random()>=p)return null;
 const opts=tre.filter(l=>l!==aim).map(l=>{const q=targetPoint(l);return {l,q,dist:Math.hypot(q.x-x,q.y-y)};}).sort((a,b)=>a.dist-b.dist);if(!opts.length)return null;
 const q=opts[0].q;return {x:q.x+gauss()*1.2,y:q.y+gauss()*1.2};}
// ===== PUB RULES · SECRET BET ROUNDS =====
// Pops up between visits every ~4-6 visits (same moment on every screen: seeded from room + visit count).
// Each player gets 3 bet cards per opponent (safe / risky / long shot) drawn from a big pool. Odds come from a
// quick simulation of that opponent's next visit (their pro, the standard, how drunk they are). Rewards scale with the odds.
const BETS=[
 {k:'ton',n:'Ton up',d:'100 or more this visit',art:'flame',col:'#e8382c',ok:r=>r.tot>=100},
 {k:'ton40',n:'Big hitter',d:'140 or more',art:'crown',col:'#e8382c',ok:r=>r.tot>=140},
 {k:'max',n:'The maximum',d:'Throws a 180',art:'crown',col:'#f3c560',ok:r=>r.tot===180},
 {k:'low40',n:'Choke',d:'Under 40 (busts count)',art:'wave',col:'#8fa3b8',ok:r=>r.tot<40},
 {k:'low20',n:'Shocker',d:'Under 20',art:'ice',col:'#8fa3b8',ok:r=>r.tot<20},
 {k:'low60',n:'Bread and butter',d:'Under 60',art:'wave',col:'#e9e4d8',ok:r=>r.tot<60},
 {k:'tre',n:'Treble hunter',d:'Hits any treble',art:'treble',col:'#3fae5a',ok:r=>r.tre>=1},
 {k:'tre2',n:'Double trouble',d:'Two or more trebles',art:'three',col:'#3fae5a',ok:r=>r.tre>=2},
 {k:'t20',n:'Top of the board',d:'Hits a T20',art:'needle',col:'#e8382c',ok:r=>r.labels.includes('T20')},
 {k:'one',n:'Wrong bed',d:'Hits a 1 or a 5',art:'one',col:'#e9e4d8',ok:r=>r.ns.some(n=>n===1||n===5)},
 {k:'same',n:'Robin Hood',d:'All three in the same bed',art:'stack',col:'#f3c560',ok:r=>r.labels.length===3&&r.labels.every(l=>l===r.labels[0])},
 {k:'bull',n:'Bullseye',d:'Hits the bull (25 or 50)',art:'bull',col:'#e8382c',ok:r=>r.labels.some(l=>l==='BULL'||l==='25')},
 {k:'miss',n:'Off the board',d:'At least one dart scores nothing',art:'chalk',col:'#8fa3b8',ok:r=>r.zero>=1},
 {k:'b26',n:'Classic 26',d:'Exactly 26',art:'one',col:'#f3c560',ok:r=>r.tot===26&&!r.bust},
 {k:'odd',n:'Odd one out',d:'Visit total is odd',art:'cards',col:'#e9e4d8',ok:r=>!r.bust&&r.tot%2===1},
 {k:'dbl',n:'Doubled up',d:'Hits any double',art:'rings',col:'#3fae5a',ok:r=>r.labels.some(l=>l[0]==='D')},
 {k:'bust',n:'Bust',d:'Busts this visit',art:'ice',col:'#e8382c',ok:r=>r.bust,when:t=>t.score<=100},
 {k:'out',n:'Game shot',d:'Checks out this visit',art:'ring',col:'#f3c560',ok:r=>r.won,when:t=>t.score<=170},
 {k:'out1',n:'Clinical',d:'Checks out with the first dart',art:'eye',col:'#f3c560',ok:r=>r.won&&r.n===1,when:t=>!!oneDart(t.score)},
 {k:'nout',n:'Bottle job',d:'Misses the checkout',art:'heart1',col:'#8fa3b8',ok:r=>!r.won,when:t=>t.score<=100},
 {k:'pin',n:'Pinpoint',d:'Every dart in a treble or double',art:'wedge',col:'#3fae5a',ok:r=>r.n===3&&r.labels.every(l=>l[0]==='T'||l[0]==='D'||l==='BULL')},
 {k:'tight',n:'Steady Eddie',d:'Between 41 and 99',art:'pulse',col:'#e9e4d8',ok:r=>!r.bust&&r.tot>40&&r.tot<100}];
const BET_TIER=[{min:.45,n:'Favourite',win:'You get a water (−1)',lose:1},{min:.2,n:'Risky',win:'They sip · you get Steady hands',lose:1},{min:.07,n:'Long shot',win:'They down it · you get Hot hand',lose:1},{min:0,n:'Jackpot',win:'Everyone else downs it · Hot hand x2',lose:1}];
function betTier(p){return BET_TIER.findIndex(t=>p>=t.min);}
function betOddsText(p){if(p>=.5)return Math.round(p*100)+'%';const n=Math.max(2,Math.round(1/p));return '1 in '+n;}
// simulate a player's next visit (their pro, standard, drink level)
function betSim(i,N){const t=S.p[i];const pro=(S.mp&&S.mp.pros&&S.mp.pros[i])||PROS[4];const arm=(S.mp&&S.mp.arm)||.6;const lvl=S.pub.p[i]?S.pub.p[i].lvl+S.pub.p[i].pend*.5:0;
 const fl=17-(Math.min(.85,Math.max(.35,arm))-.35)/.5*9;const drunk=1+Math.min(.8,.06*lvl);const out=[];
 for(let k=0;k<N;k++){let sc=t.score,opened=t.opened||!S.din,tot=0,bust=false,won=false;const labels=[],ns=[];let tre=0,zero=0,n=0;
  for(let d=3;d>=1;d--){const lbl=(S.din&&!opened)?'D20':aimFor(sc,d);const q=targetPoint(lbl);const h0=scoreAt(q.x,q.y);const tm=(h0.dbl||lbl==='BULL')?mpFiMult(pro):mpScMult(pro);const sg=fl*tm*1.3*drunk;
   const h=scoreAt(q.x+gauss()*sg*.86,q.y+gauss()*sg);n++;labels.push(h.label);ns.push(h.n||0);if(h.m===3)tre++;if(h.v===0)zero++;
   if(S.din&&!opened){if(!h.dbl)continue;opened=true;}
   const r=applyDart(sc,h);if(r.bust){bust=true;break;}tot+=h.v;sc=r.score;if(r.won){won=true;break;}}
  out.push({tot:bust?0:tot,bust,won,labels,ns,tre,zero,n});}
 return out;}
function betLines(sims){const tots=sims.map(r=>r.bust?0:r.tot).sort((a,b)=>a-b);const q=f=>tots[Math.min(tots.length-1,Math.floor(f*tots.length))];const out=[];const seen=new Set();
 const add=(k,n,d,img,line,cmp)=>{if(seen.has(k+line))return;seen.add(k+line);const p=sims.filter(r=>cmp(r.bust?0:r.tot,r)).length/sims.length;out.push({k,n,d,img,line,art:'pulse',col:'#e9e4d8',p:Math.max(.02,Math.min(.95,p))});};
 const m=q(.5),u=q(.75),v=q(.9),l=q(.25);
 if(m>0)add('over','Over '+m,`More than ${m} this visit`,'tight',m,(t)=>t>m);
 if(u>m)add('over','Big visit',`More than ${u} this visit`,'ton',u,(t)=>t>u);
 if(v>u)add('over','Monster visit',`More than ${v} this visit`,'ton40',v,(t)=>t>v);
 if(l>0&&l<m)add('under','Under '+l,`${l} or less (busts count)`,'low40',l,(t)=>t<=l);
 return out;}
// only offer bets about what they will actually aim at: doubles/checkout bets only on a finish; big-score bets only when they're scoring
const BET_FIN=['out','out1','nout','bust','dbl','pin'];const BET_SCORE=['ton','ton40','max','tre2','t20','same','b26','tight','bull','miss','over'];
function betRelevant(b,t){const onFin=t.score<=170&&!!route(t.score,3)&&!(S.din&&!t.opened);if(BET_FIN.includes(b.k))return onFin;if(onFin&&t.score<=100&&BET_SCORE.includes(b.k))return false;if(b.k==='bull'||b.k==='miss')return false;return true;}
function betEval(b,res){if(b.k==='over')return !res.bust&&res.tot>b.line;if(b.k==='under')return res.bust||res.tot<=b.line;const def=BETS.find(x=>x.k===b.k);return !!(def&&def.ok(res));}
function betDeal(i){const t=S.p[i];const sims=betSim(i,500);const pool=BETS.filter(b=>!b.when||b.when(t)).map(b=>{const p=sims.filter(b.ok).length/sims.length;return Object.assign({},b,{p:Math.max(.02,Math.min(.95,p))});}).concat(betLines(sims)).filter(b=>b.p>.025&&b.p<.76).filter(b=>betRelevant(b,t));
 const band=(lo,hi)=>pool.filter(b=>b.p>=lo&&b.p<hi);const pick=a=>a.length?a.splice(Math.floor(Math.random()*a.length),1)[0]:null;
 const safe=band(.45,.76),risky=band(.18,.45),long=band(0,.18);const hand=[pick(safe),pick(risky),pick(long)].filter(Boolean);
 const rest=pool.filter(b=>!hand.includes(b));while(hand.length<3&&rest.length)hand.push(pick(rest));return hand.sort((a,b)=>b.p-a.p);}
function betHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function betMaybeRound(){const P=S&&S.pub;if(!P||!P.cfg.bets||S.done)return;const N=S.p.filter(p=>!p.left).length;const gap=P.visits-P.lastRound;const leg=legsPlayed();
 if(P.roundLeg!==leg){P.roundLeg=leg;P.legRounds=0;}if(P.legRounds>=2||gap<2*N)return;
 if(gap<3*N&&betHash((NET.room||'x')+':'+P.visits)%2!==0)return;P.lastRound=P.visits;P.legRounds++;const rid=P.visits;mt(()=>betOpen(rid),650);}
const BET_MS=12000;function betMs(){return S.p.filter(p=>!p.left).length<=2?15000:18000;}
function betOpen(rid){const P=S&&S.pub;if(!P||S.done)return;const el=$('betRound');if(!el)return;const others=S.p.map((p,i)=>i).filter(i=>i!==0&&!S.p[i].left&&!sameTeam(0,i));if(!others.length)return;
 const ms=betMs();P.round={rid,locked:new Set(),picks:{},end:performance.now()+ms,ms};S.noPullUntil=performance.now()+ms+400;
 const esc=x=>String(x).replace(/</g,'&lt;');const hands={};others.forEach(i=>hands[i]=betDeal(i));P.round.hands=hands;
 // default target: next opponent in throw order
 let tgt=others[0];for(let k=1;k<=S.p.length;k++){const c=(S.cur+k)%S.p.length;if(others.includes(c)){tgt=c;break;}}P.round.tgt=tgt;
 const TIER_IC=['●','▲','★','♛'];
 const cardHTML=(i,b,j)=>{const ti=betTier(b.p);const pct=Math.round(b.p*100);return `<button type="button" class="bcard bt-${ti}" data-i="${i}" data-j="${j}"><span class="bc-art"><img alt="" src="img/bets/${b.img||b.k}.jpg" onerror="this.onerror=null;this.src=cardArt('${b.art}','${b.col}')"></span><span class="bc-main"><span class="bc-top"><em><i>${TIER_IC[ti]}</i> ${BET_TIER[ti].n}</em><strong>${pct<1?'<1':pct}%</strong></span><span class="bc-name">${b.n}</span><span class="bc-d">${b.d}</span><span class="bc-out"><span><b>Win</b> ${BET_TIER[ti].win}</span><span><b>Lose</b> ${BET_TIER[ti].lose===2?'2 sips':'1 sip'}</span></span></span><span class="bc-check" aria-hidden="true">✓</span></button>`;};
 const drawCards=()=>{const i=P.round.tgt;const t=S.p[i];const pro=S.mp&&S.mp.pros&&S.mp.pros[i];const d=P.p[i];
  el.querySelector('.br-ctx').textContent=`${pro?pro.n+' · ':''}${t.score} left${d&&d.lvl?' · wobble '+d.lvl+'/8':''}`;
  el.querySelector('.br-cards').innerHTML=hands[i].map((b,j)=>cardHTML(i,b,j)).join('');
  el.querySelectorAll('.br-tg').forEach(x=>x.setAttribute('aria-pressed',+x.dataset.i===i));
  el.querySelectorAll('.bcard').forEach(b=>{b.classList.toggle('on',P.round.picks[+b.dataset.i]===+b.dataset.j);b.onclick=ev=>{ev.stopPropagation();if(P.round.mine)return;const bi=+b.dataset.i,bj=+b.dataset.j;const had=P.round.picks[bi]===bj;P.round.picks={};if(!had)P.round.picks[bi]=bj;drawCards();foot();};});};
 const foot=()=>{const k=Object.keys(P.round.picks)[0];const st=$('brStatus');const lb=$('brLock');if(k!=null){const b=hands[k][P.round.picks[k]];st.innerHTML=`<b>${esc(S.p[k].name)} · ${b.n}</b>`;lb.textContent='Lock bet';lb.disabled=false;}else{st.textContent='Pick one player. Back one outcome.';lb.textContent='Lock bet';lb.disabled=true;}};
 el.innerHTML=`<div class="br-panel"><div class="br-head"><div><div class="br-kick">Pub rules · secret bet</div><h2>Bet round</h2><p>Pick one player. Back one outcome on their next visit. Nobody sees it until it lands.</p></div><div class="br-time"><b id="brTime">${Math.round(ms/1000)}</b><small>sec</small></div><i class="br-prog"><b id="brProg"></b></i></div>
 <div class="br-tgs">${others.map(i=>`<button type="button" class="br-tg" data-i="${i}">${esc(S.p[i].name)} · ${S.p[i].score}</button>`).join('')}</div><div class="br-ctx"></div>
 <div class="br-body"><div class="br-cards"></div></div>
 <div class="br-foot"><span id="brStatus"></span><div class="br-acts"><button type="button" class="ghost" id="brPass">Pass</button><button type="button" class="big" id="brLock" disabled>Lock bet</button></div></div></div>`;
 el.hidden=false;
 el.querySelectorAll('.br-tg').forEach(x=>x.onclick=ev=>{ev.stopPropagation();P.round.tgt=+x.dataset.i;drawCards();});
 $('brLock').onclick=ev=>{ev.stopPropagation();betLock();};$('brPass').onclick=ev=>{ev.stopPropagation();P.round.picks={};betLock();};
 drawCards();foot();
 clearInterval(P.round.tick);P.round.tick=setInterval(()=>{const R=P.round;if(!R)return;const left=R.end-performance.now();const l=Math.max(0,Math.ceil(left/1000));const tt=$('brTime');if(tt){tt.textContent=l;tt.parentNode.classList.toggle('low',l<=3);}const pg=$('brProg');if(pg)pg.style.width=Math.max(0,left/R.ms*100)+'%';if(l<=0){if(!R.mine){R.picks={};betLock();}betClose();}},100);
 try{noiseBurst({dur:.15,freq:1800,q:3,gain:.08});}catch(e){}}
function betLock(){const P=S&&S.pub;const R=P&&P.round;if(!R||R.mine)return;R.mine=true;const me=S.p[0].key;R.locked.add(me);
 Object.entries(R.picks).forEach(([i,j])=>{const b=R.hands[i][j];P.myBets.push({rid:R.rid,ti:+i,k:b.k,n:b.n,p:b.p,line:b.line,img:b.img||b.k,dartsAt:S.p[+i].darts});mpBoardRender();});
 netSend('rlock',{rid:R.rid,n:Object.keys(R.picks).length});const st=$('brStatus');if(st)st.innerHTML=Object.keys(R.picks).length?st.innerHTML+' · locked':'Passed this round';const lb=$('brLock');if(lb){lb.disabled=true;lb.textContent='Locked';}const ps=$('brPass');if(ps)ps.disabled=true;
 betCheckAll();}
function betCheckAll(){const P=S&&S.pub;const R=P&&P.round;if(!R)return;const need=S.p.filter(p=>!p.left&&p.key).map(p=>p.key);if(need.every(k=>R.locked.has(k)))betClose();}
function betClose(){const P=S&&S.pub;const R=P&&P.round;if(!R)return;clearInterval(R.tick);P.round=null;const el=$('betRound');if(el)el.hidden=true;if(S.noPullUntil>performance.now())S.noPullUntil=performance.now()+250;}
function betRecvLock(m){const P=S&&S.pub;if(!P)return;const i=pubIdx(m.from);if(i<0)return;if(P.round&&P.round.rid===m.rid){P.round.locked.add(m.from);betCheckAll();}}
// resolve my bets when that player's visit ends
function betResolve(tc,res){const P=S.pub;if(!P.myBets.length)return;const keep=[];const me=S.p[0].key,tk=S.p[tc].key,tn=S.p[tc].name;
 P.myBets.forEach(b=>{if(b.ti!==tc||S.p[tc].darts<=b.dartsAt){keep.push(b);return;}const ok=betEval(b,res);const ti=betTier(b.p);
  netSend('rres',{who:S.p[0].name,on:tn,bet:b.n,ok:!!ok,p:+b.p.toFixed(3),sc:res.bust?'bust':res.tot,img:String(b.img||b.k).replace(/[^a-z0-9]/g,'').slice(0,12)});{const d=P.p[0];d.bp=(d.bp||0)+1;if(ok){d.bw=(d.bw||0)+1;if(!P.long||b.p<P.long.p)P.long={p:b.p,who:S.p[0].name,bet:b.n,on:tn};}}
  betReveal(b,ok,ti,tn,res);
  if(!ok){pubSend(me,BET_TIER[ti].lose,`lost a bet (${b.n})`);return;}
  if(ti===0){pubSend(me,-1,'bet landed');return;}
  if(ti===1){pubSend(tk,1,`${S.p[0].name}'s bet landed`,false,b.rid);betBuff('steady',1);return;}
  if(ti===2){pubSend(tk,4,`${S.p[0].name}'s long shot`,true,b.rid);betBuff('hot',1);return;}
  S.p.forEach((p,i)=>{if(i!==0&&!p.left&&!sameTeam(0,i))pubSend(p.key,4,`${S.p[0].name} hit the jackpot`,true,b.rid);});betBuff('hot',2);});
 P.myBets=keep;}
const BETQ=[];
function betRevealOther(m){const who=String(m.who||'').slice(0,20),on=String(m.on||'').slice(0,20),bet=String(m.bet||'').slice(0,30);const ti=betTier(+m.p||.5);
 const meOn=S&&S.p[0]&&(S.p[0].name===on);const eff=m.ok?[`${who} gets a water`,`${meOn?'You sip':on+' sips'} 1 · ${who} gets Steady hands`,`${meOn?'You down':on+' downs'} it · ${who} gets Hot hand`,`Everyone else downs it · ${who} gets Hot hand x2`][ti]:`${who} sips ${BET_TIER[ti].lose}`;
 betShow({kind:'other',ok:!!m.ok,ti,head:`${who}'s bet · ${on}`,name:bet,score:m.sc!=null?(m.sc==='bust'?on+' bust':on+' scored '+m.sc):'',eff,img:m.img||null,ms:2400});}
function betShow(o){BETQ.push(o);if(BETQ.length===1)betShowNext();}
function betShowNext(){const o=BETQ[0];if(!o)return;const el=$('betReveal');if(!el){BETQ.length=0;return;}const esc=x=>String(x).replace(/</g,'&lt;');
 el.className='bet-reveal '+(o.ok?(o.ti===3?'jack':'won'):'lost')+(o.kind==='other'?' other':'');
 el.innerHTML=`<div class="bv-card">${o.img?`<span class="bv-art"><img alt="" src="img/bets/${o.img}.jpg"></span>`:'<span class="bv-art bv-blank"></span>'}<div class="bv-main"><span class="bv-k">${esc(o.head)}</span><span class="bv-n">${esc(o.name)}</span><span class="bv-s">${esc(o.score)}</span><b class="bv-res">${o.ok?(o.ti===3?'JACKPOT':'WON'):'LOST'}</b><span class="bv-eff">${esc(o.eff)}</span></div></div>`;el.hidden=false;
 try{(o.ok?(o.ti===3?PUBCUE.jack:PUBCUE.land):PUBCUE.miss)();}catch(e){}
 const done=()=>{clearTimeout(betShowNext.t);el.hidden=true;BETQ.shift();if(BETQ.length)setTimeout(betShowNext,150);};clearTimeout(betShowNext.t);betShowNext.t=setTimeout(done,o.ms||3200);el.onclick=done;}
function betReveal(b,ok,ti,tn,res){const el=$('betReveal');if(!el)return;const esc=x=>String(x).replace(/</g,'&lt;');const lose=BET_TIER[ti].lose;
 const eff=ok?[`You get a water · −1 sip`,`${tn} sips 1 · you get STEADY HANDS (sway −60% next visit)`,`${tn} downs it · you get HOT HAND (spread −30%, no sway next visit)`,`Everyone else downs it · HOT HAND for 2 visits`][ti]:`You sip ${lose}`;
 if(ok&&ti===3)try{achUnlock('jackpot');}catch(e){}betShow({kind:'mine',ok,ti,head:`Your bet · ${tn}`,name:b.n,score:`${tn} ${res.bust?'bust':res.won?'checked out':'scored '+res.tot}`,eff,img:b.img||b.k,ms:3200});}
function betBuff(kind,visits){const P=S.pub;P.buff={kind,visits};mpBoardRender();}
function betBuffActive(k){const P=S&&S.pub;return !!(P&&P.buff&&P.buff.on&&S.cur===0&&P.buff.kind===k);}
// drunk blur over the board on my own turn
function betBlur(){const el=$('pubBlur');if(!el)return;const P=S&&S.pub;const ci=S?S.cur:0;const d=P&&P.p[ci];const lvl=d?d.lvl:0;const on=!!(P&&!S.done&&lvl>=1&&!(ci===0&&betBuffActive('hot')));el.hidden=!on;document.body.classList.toggle('pub-drunk',on);if(on){const px=Math.min(4.5,.4+lvl*.55);el.style.setProperty('--blur',px.toFixed(2)+'px');el.style.setProperty('--haze',Math.min(1,(lvl-1)/6).toFixed(2));document.body.style.setProperty('--dblur',Math.min(3.5,.3+lvl*.45).toFixed(2)+'px');document.body.style.setProperty('--dwob',Math.min(10,lvl*1.4).toFixed(1)+'px');}}

function mpStandingsHTML(S0){const esc=x=>String(x).replace(/</g,'&lt;');const rows=S0.p.map((p,i)=>({p,i})).sort((a,b)=>b.p.legs-a.p.legs||a.p.score-b.p.score||avg(b.p)-avg(a.p));const ord=['1st','2nd','3rd','4th','5th'];const pub=S0.pub;
 return `<div class="ms-head"><b>Standings</b><small>${S0.teams?'2v2 teams':S0.p.length+' players'} · first to ${Math.ceil(S0.bestOf/2)}</small></div><div class="ms-row ms-cols"><span>#</span><span>Player</span><span>Legs</span><span>Avg</span><span>180s</span><span>High out</span>${pub?'<span>Sips</span>':''}</div>`+
 rows.map((r,k)=>{const p=r.p;const pro=S0.mp&&S0.mp.pros&&S0.mp.pros[r.i];return `<div class="ms-row ${r.i===0?'me':''} ${k===0?'win':''}"><span class="ms-pos">${ord[k]}</span><span class="ms-n"><b>${esc(p.disp&&S0.teams?p.name:(p.disp||p.name))}${r.i===0?' <i>you</i>':''}${p.tag?' <em class="ak-tag">🪰 Ant Killer</em>':''}</b><small>${S0.teams?esc(p.team||''):(pro?esc(pro.k):'')}${p.left?' · left':''}</small></span><span class="ms-l">${p.legs}</span><span>${avg(p).toFixed(1)}</span><span>${p.t180||0}</span><span>${p.hf||'–'}</span>${pub?`<span>${pub.p[r.i]?pub.p[r.i].tot:0}</span>`:''}</div>`;}).join('');}
function pubTallyHTML(){const P=S.pub;const esc=x=>String(x).replace(/</g,'&lt;');
 const rows=S.p.map((p,i)=>{const d=P.p[i];return `<div class="pt-row"><span class="pt-n">${esc(p.name)}</span><span class="pt-t"><b>${d.tot}</b><small>${d.downs?d.downs+' downed':'sips'}</small></span><span class="pt-b">${d.bw||0}/${d.bp||0}<small>bets landed</small></span></div>`;}).join('');
 const aw=[];let best=-1,bi=-1;S.p.forEach((p,i)=>{const d=P.p[i];if((d.bw||0)>best&&(d.bw||0)>0){best=d.bw;bi=i;}});if(bi>=0){const d=P.p[bi];aw.push(`<div class="pt-aw"><i>Called it</i><b>${esc(S.p[bi].name)}</b><small>${d.bw}/${d.bp} bets landed</small></div>`);}
 if(P.long)aw.push(`<div class="pt-aw"><i>Long shot</i><b>${esc(P.long.who)}</b><small>${esc(P.long.on)} · ${esc(P.long.bet)} · ${Math.max(1,Math.round(P.long.p*100))}%</small></div>`);
 return `<div class="pt-head"><span class="pt-ic" aria-hidden="true"></span><div><b>Pub tally</b><small>Game penalties recorded</small></div></div><div class="pt-rows">${rows}</div>${aw.length?`<div class="pt-aws">${aw.join('')}</div>`:''}`;}
function pubTally(){if(!S||!S.pub)return '';return '🍺 '+S.p.map((p,i)=>{const d=S.pub.p[i];return `${p.name} ${d.tot}${d.downs?' ('+d.downs+' downed)':''}`;}).join(' · ');}
{const _st=startTurn;startTurn=function(){_st.apply(this,arguments);pubTurn();};}
{const _em=endMatch;endMatch=function(){try{resultOnlineButtons(!!(S&&S.online));}catch(e){}try{const cb=$('btnChat');if(cb)cb.hidden=true;const cp=$('chatPanel');if(cp)cp.hidden=true;}catch(e){}const S0=S;setTimeout(()=>{try{const multi=!!(S0&&S0.p&&S0.p.length>2);const sc=document.querySelector('#result .res-score');if(sc)sc.hidden=multi;let box=$('mpStand');if(multi){if(!box){box=document.createElement('div');box.id='mpStand';box.className='mp-stand';const st=$('resStats');st.parentNode.insertBefore(box,st);}box.hidden=false;box.innerHTML=mpStandingsHTML(S0);$('resStats').hidden=true;}else{if(box)box.hidden=true;$('resStats').hidden=false;}}catch(e){console.warn(e);}},50);const b=$('pubBet');if(b)b.hidden=true;try{betClose();}catch(e){}const bl=$('pubBlur');if(bl)bl.hidden=true;document.body.classList.remove('pub-drunk');const pbd=$('pubBand');if(pbd)pbd.hidden=true;_em.apply(this,arguments);if(S&&S.pub){let box=$('pubTally');const line=$('resOppLine');if(!box&&line){box=document.createElement('div');box.id='pubTally';box.className='pub-tally';line.parentNode.insertBefore(box,line.nextSibling);}if(box){box.hidden=false;box.innerHTML=pubTallyHTML();}}else{const box=$('pubTally');if(box)box.hidden=true;}};}
{const host=$('mpPub');if(host)[...host.children].forEach(bt=>bt.addEventListener('click',()=>{const o=$('pubOpts');if(o)o.hidden=bt.dataset.v!=='1';}));
 const tg=$('pubTg');if(tg)[...tg.children].forEach(bt=>bt.addEventListener('click',()=>{bt.setAttribute('aria-pressed',bt.getAttribute('aria-pressed')!=='true');if(NET.seat===0&&NET.chan)mpFmtUpdate();}));
 ['pubSips','pubTre'].forEach(id=>{const e=$(id);if(e)e.addEventListener('change',()=>{if(NET.seat===0&&NET.chan)mpFmtUpdate();});});}

$('btnOnHost').onclick=()=>{audioInit();onlineHost();};$('btnOnJoin').onclick=()=>{audioInit();onlineJoin($('onCodeIn').value,1);};$('btnOnLeave').onclick=onlineLeave;
$('btnOnShare').onclick=shareInvite;$('btnOnReady').onclick=()=>{NET.ready=!NET.ready;mpTrack();renderLobby();};$('btnOnStart').onclick=()=>{audioInit();onlineStart();};
['mpLegs','mpStart','mpIn','mpVenue','mpLevel','mpMode','mpPub'].forEach(id=>{const host=$(id);if(!host)return;[...host.children].forEach(bt=>bt.addEventListener('click',()=>{[...host.children].forEach(x=>x.setAttribute('aria-pressed',x===bt));if(id==='mpVenue')V.buildVenue(+bt.dataset.v);if(NET.seat===0&&NET.chan)mpFmtUpdate();else mpRulesSum();}));});
function mpNameInit(){const i=$('onName');if(!i)return;const lab=i.parentNode.querySelector('span');if(NET.user){i.value=lbName();i.readOnly=true;i.classList.add('locked');if(lab)lab.textContent='Playing as · your Google name';i.oninput=null;return;}i.readOnly=false;i.classList.remove('locked');if(lab)lab.textContent='Your name';i.value=mpNameOk()?save.name:'';i.oninput=()=>{const v=i.value.replace(/[<>]/g,'').slice(0,14);save.name=v.trim();persist();i.classList.toggle('need',!mpNameOk());if(NET.chan)mpTrack();};}
function openMultiplayer(){V.setPlayerLook(save.look,save.flight);showScreen('friends');mpNameInit();renderProPicker();renderRecords();mpRulesSum();if(NET.chan){$('onLobby').hidden=false;$('onEntry').hidden=true;$('mpOpts').classList.toggle('locked',NET.seat!==0);renderLobby();}else{$('mpOpts').classList.remove('locked');}}
function mpJoinFromUrl(){const q=new URLSearchParams(location.search);const jc=(q.get('join')||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,4);if(jc.length!==4)return false;history.replaceState(null,'',location.pathname);save.authSeen=true;persist();const lg=$('login');if(lg)lg.hidden=true;audioInit();openMultiplayer();$('mpOpts').classList.add('locked');const ci=$('onCodeIn');if(ci)ci.value=jc;onlineJoin(jc,1);return true;}
if(!mpJoinFromUrl())netBoot();else (window.TOPS_BOOTEND=Date.now(),netLoad()).then(sb=>sb.auth.getSession()).then(r=>{const s=r&&r.data&&r.data.session;if(s){NET.user=s.user;save.cloudUser={id:s.user.id,name:netUserName()};persist();}}).catch(()=>{});
;(function(){const o=document.getElementById('btnCredits'),c=document.getElementById('credits');if(o&&c){o.onclick=()=>{c.hidden=false;};const x=document.getElementById('btnCreditsClose');if(x)x.onclick=()=>{c.hidden=true;};}})();

;window.__th={throwParams,ttAt,landFrom,driftAt,relErrMs};
// tap-timing calibration: tap with 8 beats; the median lag becomes save.inputOffsetMs (applied to every release)
function calibOpen(){let el=$('calib');if(!el){el=document.createElement('div');el.id='calib';document.body.appendChild(el);}const beats=[],taps=[];const N=10,GAP=650;
 el.innerHTML=`<div class="cal-card"><h2>Tap timing</h2><p>Tap the button each time the ring flashes. We\'ll use the average lag so the ring matches your screen.</p><button type="button" id="calTap" class="cal-tap"><i></i>TAP</button><p id="calOut" class="cal-out">Get ready…</p><button type="button" class="ghost" id="calClose">Close</button></div>`;el.hidden=false;
 const ring=el.querySelector('.cal-tap i'),out=$('calOut');$('calClose').onclick=()=>{el.hidden=true;};let k=0;const t0=performance.now()+1200;
 $('calTap').addEventListener('pointerdown',e=>{e.preventDefault();taps.push(e.timeStamp||performance.now());});
 const tickB=()=>{if(el.hidden)return;const now=performance.now();if(k<N&&now>=t0+k*GAP){beats.push(t0+k*GAP);ring.className='on';setTimeout(()=>ring.className='',120);try{noiseBurst({dur:.04,freq:1800,q:6,gain:.12});}catch(e){}k++;out.textContent=`${N-k} to go`;}
  if(k>=N&&now>t0+N*GAP+300){const d=[];beats.slice(2).forEach(bt=>{const t=taps.reduce((best,x)=>Math.abs(x-bt)<Math.abs(best-bt)?x:best,Infinity);if(isFinite(t)&&Math.abs(t-bt)<300)d.push(t-bt);});d.sort((a,b)=>a-b);if(d.length<5){out.textContent='Not enough taps. Try again.';return;}const med=Math.max(-120,Math.min(120,Math.round(d[Math.floor(d.length/2)])));save.inputOffsetMs=med;persist();out.textContent=`Your lag: ${med} ms. Saved. Releases are now measured from your screen.`;return;}requestAnimationFrame(tickB);};requestAnimationFrame(tickB);}
(function(){const b=document.getElementById('btnCalib');if(b)b.onclick=calibOpen;})();

// ===== #15: every match is a clean instance (Hayden 08:00). One teardown, called on every way out of a match. =====
function matchTeardown(why){try{V.teardownMatch({keepTemplates:why==='next'});}catch(e){}
 if(why!=='next'){try{if(window.TOPS_walk&&TOPS_walk.stopWalk)TOPS_walk.stopWalk();}catch(e){}} /* the walk-on music can start before beginMatch */try{flyStop();}catch(e){}try{if(window.TC_API&&TC_API.zone)TC_API.zone(0);}catch(e){}}
window.TOPS_matchTeardown=matchTeardown;
{const _sh=showHub;showHub=function(){if(!window.__hubSoft)matchTeardown('hub');const r=_sh.apply(this,arguments);/* #20: a clip file that landed mid-match rebuilds the figures here, in the hub */try{if(!window.__hubSoft&&V.animsFlush)V.animsFlush();}catch(e){}/* EXP-1d: fetch the clip file here too, so the first walk-on of a session can play at once instead of holding on the establishing shot while it downloads (it lands in the hub, where #20 lets it rebuild) */try{if(!window.__hubSoft&&V.loadAnims)V.loadAnims();}catch(e){}/* CAR-7a: fetch the hair library here when the next opponent wears library hair or a beard (Pete, named variants), so it never lands mid-match */try{if(!window.__hubSoft&&V.hairFor){const c=typeof career==='function'?career():null;const n=c&&c.next;/* the fixture the hub just showed */if(n&&V.hairFor(oppLookFor(n),n.oppName))V.loadHair();}}catch(e){}return r;};
 const _st=showTitle;showTitle=function(){matchTeardown('title');return _st.apply(this,arguments);};
 const _bm=beginMatch;beginMatch=function(){matchTeardown('next');return _bm.apply(this,arguments);};}
// #20: every match starts with the last match's end-of-match leftovers cleared, so match 2's page is match 1's page. All of these are rebuilt
// from scratch the next time they show: the pub/perk effect layer (empty after its effects end, a full-screen fixed layer), the toast host
// once its toasts are gone, the reward card's content (career3 rebuilds it with innerHTML) and the result stats (endMatch rebuilds them).
{const _bm20=beginMatch;beginMatch=function(){try{const fx=$('fxLayer');if(fx&&!fx.children.length)fx.remove();const at=$('achToasts');if(at&&!at.children.length)at.remove();
 const rw=$('c3rw');if(rw&&rw.hidden)rw.innerHTML='';const rs=$('resStats');if(rs&&$('result')&&$('result').hidden)rs.innerHTML='';}catch(e){}return _bm20.apply(this,arguments);};}
// #20 phone bisect switches (Overseer 20:34/21:07), off unless asked for: ?q20=fresh,nolayers,dpr1,nowalk,nofx,... (any mix) in the address, kept for
// this tab; nowalk and nofx also from the hub Menu.
//  nowalk   no walk-on at all (yours or an online mate's)
//  nofx     no celebrations or effects: win/180/checkout/walk-on effect canvas, the 3D win celebration, pub card effects, perk/pub DOM effects
//  fresh    after match 1 ends and the hub shows, save and reload the page once, so match 2 runs on a fresh page on a phone that's just as warm
//           (fast match 2 = something the page built up; slow = heat or time)
//  nolayers no backdrop-filter / filter / will-change / blend modes anywhere, and the full-screen overlay layers (grade, grain, vignette, nerve,
//           loading, card fog, effect canvases and layers, hub backdrop) out of the page
//  dpr1     3D drawn at 1 pixel per CSS pixel (phones normally 1.5): tells whether the GPU is short of fill rate
//  keepvenue  no venue rebuild when the hub comes back on the same tier (match 2 draws match 1's venue objects and textures)
//  keepfig    the teardown between matches frees nothing (opponent figure, character templates, hair tints stay as they were)
//  nohub3d    no 3D drawing while the hub is up and no match is live (the GPU rests between matches)
//  hub3d      ENG-13 off: the 3D scene is drawn behind an opaque full-screen menu again (as before 3.32), for an A/B
//  mute       the game's audio is suspended during matches (tells whether the audio graph costs frames); also a hub Menu row
// Each perf row carries the switch in dev.t20.q20.
{let q='';try{const u=new URLSearchParams(location.search).get('q20');if(u!=null){q=u;sessionStorage.setItem('tops_q20',u);}else q=sessionStorage.getItem('tops_q20')||'';}catch(e){}
 q=String(q).toLowerCase().replace(/[^a-z0-9,]/g,'');const has=k=>q.split(',').indexOf(k)>=0;
 /* Overseer 21:10: the home-screen app can't take a URL, so two switches also live in the hub Menu ('Test: no walk-on', 'Test: no effects'),
    kept in localStorage; they act from the next walk-on/effect, show a small TEST tag in the match, and are logged with the URL ones. */
 const APPK='tops_q20_app',appQ=()=>{try{return String(localStorage.getItem(APPK)||'').replace(/[^a-z0-9,]/g,'');}catch(e){return '';}};
 const cur=()=>{const s=[];(q+','+appQ()).split(',').forEach(k=>{if(k&&s.indexOf(k)<0)s.push(k);});return s.join(',');};
 window.TOPS_q20has=k=>cur().split(',').indexOf(k)>=0;
 const sync=()=>{const c=cur();if(c)window.TOPS_Q20=c;else{try{delete window.TOPS_Q20;}catch(e){window.TOPS_Q20=undefined;}}
  const live=typeof S!=='undefined'&&S&&!S.done;let t=document.getElementById('q20tag');const lab=[];if(TOPS_q20has('nowalk'))lab.push('no walk-on');if(TOPS_q20has('nofx'))lab.push('no effects');if(TOPS_q20has('mute'))lab.push('no audio');if(window.TOPS_AJS)lab.push('frame split');if(TOPS_q20has('nogyro'))lab.push('no tilt');
  if(lab.length&&live){if(!t){t=document.createElement('div');t.id='q20tag';t.style.cssText='position:fixed;left:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:95;pointer-events:none;font:700 11px/1 Manrope,sans-serif;letter-spacing:.06em;color:#0b0d0c;background:#C6F36B;border-radius:4px;padding:4px 6px;text-transform:uppercase';document.body.appendChild(t);}t.textContent='TEST · '+lab.join(' · ');}else if(t)t.remove();};
 sync();if(q){try{console.warn('TOPS q20 switches on: '+q);}catch(e){}}
 {const bm=beginMatch;beginMatch=function(){const r=bm.apply(this,arguments);try{sync();}catch(e){}return r;};const sh=showHub;showHub=function(){const r=sh.apply(this,arguments);try{sync();menu();}catch(e){}return r;};}
 /* ENG-10 (Overseer 06:27): the same three toggles in whichever hub menu is showing: the old #hubPop (rebrand off) and the rebrand's sheet
    (#rbMenuSheet, made on each tap of its Menu button). Same localStorage key, nothing cleared automatically (the switches are #20 data). */
 const Q20B=[['nowalk','Test: no walk-on'],['nofx','Test: no effects'],['split','Test: frame split (from next launch)'],['mute','Test: no game audio (next match)'],['noreset','Test: no fresh start between matches']];
 const rows=(host,rb)=>{if(!host)return;if(rb&&!host.querySelector('.q20-sep')){const sp=document.createElement('div');sp.className='q20-sep';sp.setAttribute('aria-hidden','true');sp.style.cssText='height:1px;margin:2px 4px;background:var(--line,#343a3e)';host.appendChild(sp);}
  Q20B.forEach(([k,n])=>{let b=host.querySelector('[data-q20="'+k+'"]');
   if(!b){b=document.createElement('button');b.type='button';b.setAttribute('data-q20',k);if(!rb)b.id='q20b_'+k;if(rb)b.style.cssText='min-height:44px;font-size:13px;font-weight:600;color:var(--ink3,#a0a6a3);justify-content:flex-start;text-align:left';
    b.onclick=e=>{e.stopPropagation();const s=appQ().split(',').filter(Boolean);const i=s.indexOf(k);if(i>=0)s.splice(i,1);else s.push(k);try{localStorage.setItem(APPK,s.join(','));}catch(er){}menu();sync();};host.appendChild(b);}
   const on=appQ().split(',').indexOf(k)>=0;b.textContent=n+(on?': on':': off');b.setAttribute('aria-pressed',on?'true':'false');});};
 const menu=()=>{rows(document.getElementById('hubPop'),false);rows(document.getElementById('rbMenuSheet'),true);};
 /* the rebrand builds its sheet in its Menu button's click handler; add the rows right after (capture listener, next tick; no page-wide observer) */
 document.addEventListener('click',e=>{try{if(e.target&&e.target.closest&&e.target.closest('#rbMenu'))setTimeout(()=>{try{menu();}catch(er){}},0);}catch(er){}},true);
 try{menu();}catch(e){}
 if(has('nolayers')){const st=document.createElement('style');st.textContent='body *:not(canvas#scene){-webkit-backdrop-filter:none!important;backdrop-filter:none!important;filter:none!important;will-change:auto!important;mix-blend-mode:normal!important}#grade,#grain,#vig,#nerve,#loading,#cardFog,#tcFx,#pubFxC,#fxLayer,#sceneBg,canvas#fx{display:none!important}';document.head.appendChild(st);}
 if(has('dpr1')){const go=()=>{try{const R=window.TOPS_R;if(R){R.setPixelRatio(1);window.dispatchEvent(new Event('resize'));}}catch(e){}};go();setTimeout(go,500);}
 if(has('keepvenue')&&typeof V!=='undefined'&&V.buildVenue){const bv=V.buildVenue;let built=null;V.buildVenue=function(t){if(built!==null&&t===built)return;built=t;return bv.apply(this,arguments);};}
 if(has('keepfig')&&typeof V!=='undefined'&&V.teardownMatch){V.teardownMatch=function(){window.__teardowns=(window.__teardowns||0)+1;};}
 if(has('nohub3d')){const go=()=>{const R=window.TOPS_R;if(!R){setTimeout(go,300);return;}const rr=R.render;R.render=function(){try{const h=document.getElementById('hub');if(h&&!h.hidden&&!(typeof S!=='undefined'&&S&&!S.done))return;}catch(e){}return rr.apply(this,arguments);};};go();}
 /* #20 A/B (Overseer 07:58): 'mute' = the game's AudioContext is suspended for the whole match, so the audio thread does no work at all (crowd,
    caller, effects, walk-on song). Also a hub Menu row now (the home-screen app can't take a URL). Read at each match start. Before, a tap on the
    pull pad resumed the context in the match (the pad's own unlock), so the URL switch only muted until the first throw: resume() is held off
    while a muted match is live. */
 {const muteOn=()=>!!(window.TOPS_q20has&&TOPS_q20has('mute')&&typeof S!=='undefined'&&S&&!S.done);window.TOPS_muteOn=muteOn;
  /* the instance's resume() is held off only while a muted match is live, and put back as soon as the switch is off */
  const hold=()=>{try{const c=AU&&AU.ctx;if(!c||c.__q20r)return;const r=c.resume.bind(c);c.__q20r=r;c.resume=function(){if(muteOn())return Promise.resolve();return r();};}catch(e){}};
  const unhold=()=>{try{const c=AU&&AU.ctx;if(c&&c.__q20r){c.resume=c.__q20r;delete c.__q20r;}}catch(e){}};
  const bm=beginMatch;beginMatch=function(){const r=bm.apply(this,arguments);try{if(muteOn()){hold();if(AU.ctx&&AU.ctx.state!=='closed'){const p=AU.ctx.suspend();if(p&&p.catch)p.catch(()=>{});}}else unhold();}catch(e){}return r;};
  const sh=showHub;showHub=function(){const r=sh.apply(this,arguments);try{const c=AU&&AU.ctx;const r0=c&&c.__q20r;if(!TOPS_q20has('mute'))unhold();if(r0&&c.state!=='running'&&c.state!=='closed')r0().catch(()=>{});}catch(e){}return r;};}
 if(has('fresh')){let played=0;const bm=beginMatch;beginMatch=function(){played++;return bm.apply(this,arguments);};const sh=showHub;showHub=function(){const r=sh.apply(this,arguments);try{if(played>=1&&!window.__hubSoft&&!sessionStorage.getItem('tops_q20_fresh')&&S&&S.done){sessionStorage.setItem('tops_q20_fresh','1');try{persist();}catch(e){}setTimeout(()=>location.reload(),400);}}catch(e){}return r;};}
}
</script>
