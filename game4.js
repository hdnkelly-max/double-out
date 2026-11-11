<script>
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
try{const s=JSON.parse(localStorage.getItem('doubleout2')||'{}');if(s&&typeof s.composure==='number')save=Object.assign(save,s);}catch(e){}
// Season 1 reset (10 Nov 2026): every old device save is wiped once; progress lives in the cloud only
if(save.season!==SEASON){save=JSON.parse(SAVE_FRESH);save.season=SEASON;try{Object.keys(localStorage).forEach(k=>{if(/^doubleout/.test(k)&&k!=='doubleout_audio')localStorage.removeItem(k);});localStorage.setItem('doubleout2',JSON.stringify(save));}catch(e){}}
function persist(){try{localStorage.setItem('doubleout2',JSON.stringify(save));}catch(e){}if(window.NET&&window.NET.user)cloudPush(false);hubBankUpdate();}
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
function setupParts(){const st=save.setup||{};return {shaft:SHAFTS.find(x=>x.id===st.shaft)||SHAFTS[1],fl:FSHAPES.find(x=>x.id===st.flight)||FSHAPES[0],pt:POINTS.find(x=>x.id===st.point)||POINTS[0]};}
function setupBaseMult(){const p=setupParts();return (1+p.fl.base)*(1+p.pt.base);}
function setupTolMult(){const p=setupParts();return (1+p.fl.tol)*(1+p.shaft.tol);}
function setupSwayMult(){const p=setupParts();return 1+p.shaft.sway;}
// ===== AUDIO =====
const AU={ctx:null,on:true,caller:true,crowdGain:null,master:null};try{const a=JSON.parse(localStorage.getItem('doubleout_audio')||'{}');if(typeof a.on==='boolean')AU.on=a.on;if(typeof a.caller==='boolean')AU.caller=a.caller;}catch(e){}
function persistAudio(){try{localStorage.setItem('doubleout_audio',JSON.stringify({on:AU.on,caller:AU.caller}));}catch(e){}}
function speechWarm(){if(speechWarm.done||!('speechSynthesis'in window))return;speechWarm.done=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}catch(e){}}
function audioWarm(){if(audioWarm.done||!AU.ctx)return;audioWarm.done=true;setTimeout(()=>{try{[.5,.7,1,1.3,1.5,2,2.2,2.6].forEach(d=>swBuf(AU.ctx,d));[.05,.06,.08,.12,.5].forEach(d=>nbBuf(AU.ctx,d));}catch(e){}},300);}
function audioInit(){speechWarm();setTimeout(audioWarm,0);if(AU.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=AU.ctx=new C();AU.master=c.createGain();AU.master.gain.value=AU.on?1:0;AU.master.connect(c.destination);
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
 const d=bullDist(x,y);const h=scoreAt(x,y);if(!far){S.bull.me=d;flash(h.label==='BULL'?'Bull':h.label==='25'?'25':'Off',h.label==='BULL'?'gold':'',null);sfxDartHit(h.v?'hit':'miss',false);V.shake();V.punchIn(x,y,700);setTimeout(()=>{S.cur=1;S.view=1;S.busy=true;S.oppArm={pull:0,phase:'idle'};setTimeout(aiBull,900);},1200);}
 else{S.bull.op=d;flash(h.label==='BULL'?'Bull':h.label==='25'?'25':'Off',h.label==='BULL'?'gold':'',null);sfxDartHit(h.v?'hit':'miss',true);setTimeout(()=>{const meFirst=S.bull.me<=S.bull.op;S.legStarter=meFirst?0:1;S.cur=S.legStarter;S.bull=null;V.clearDarts();const el=$('intro');$('introTier').textContent='Bull up';$('introVenue').textContent=(meFirst?S.p[0].name:S.p[1].name)+' throws first';$('introP0').textContent=S.p[0].disp;$('introP1').textContent=S.p[1].disp;$('introP0s').textContent=Math.round(S.bull?0:0)+'';$('introP0s').textContent='';$('introP1s').textContent='';$('introFmt').textContent='Game on';el.classList.add('show');say(S.tier.caller==='pro'?'Game on!':'Game on.',S.tier.caller);setTimeout(()=>{el.classList.remove('show');if(S&&!S.done)startTurn();},1500);},1300);}}
function aiBull(){if(!S||S.done)return;const me=S.p[1];const sig=me.sigma*(1+S.form);const lx=gauss()*sig,ly=gauss()*sig;const seq=[['pull',480],['throw',130],['follow',320],['reset',220]];let si=0,t0=performance.now();S.oppArm={phase:'pull',pull:0,k:0};
 const step=()=>{if(!S||S.done)return;const [ph,dur]=seq[si];const k=Math.min(1,(performance.now()-t0)/dur);if(ph==='pull')S.oppArm={phase:'pull',pull:k,k};else S.oppArm={phase:ph,pull:1,k};if(k<1){requestAnimationFrame(step);return;}
  if(ph==='throw'){const from=V.oppHandWorld();V.fly(from,lx,ly,1,340,.05,()=>{if(!S||S.done)return;bullLand(lx,ly,true);});}
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
 const cv=$('scene');const renderer=new T.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:!!window.__QA_PRESERVE});{const _gl=renderer.getContext();const _rr=renderer.render.bind(renderer);renderer.render=function(s,c){if(_gl.isContextLost&&_gl.isContextLost())return;return _rr(s,c);};const _rp=renderer.readRenderTargetPixels.bind(renderer);renderer.readRenderTargetPixels=function(){if(_gl.isContextLost&&_gl.isContextLost())return;return _rp.apply(null,arguments);};}cv.addEventListener('webglcontextlost',e=>{e.preventDefault();window.__glLost=(window.__glLost||0)+1;try{trackEv&&trackEv('gl_lost',null);}catch(_){}},false);cv.addEventListener('webglcontextrestored',()=>{try{const seen=new Set();const fix=m=>{if(!m||seen.has(m))return;seen.add(m);['map','emissiveMap','bumpMap','normalMap','roughnessMap','alphaMap','envMap','lightMap'].forEach(k=>{if(m[k])m[k].needsUpdate=true;});m.needsUpdate=true;};const walk=o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(fix);};scene.traverse(walk);if(scene.environment)scene.environment.needsUpdate=true;}catch(e){}setTimeout(()=>{try{V.setPlayerLook(save.look,save.flight,save.name||'You',career()?career().tier:0);}catch(e){}},400);},false);renderer.setPixelRatio(Math.min(innerWidth<=700?1.5:2,devicePixelRatio||1));renderer.shadowMap.enabled=!(innerWidth<=700);renderer.setClearColor(0x0d1014,1);renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;if(window.GFX_LIN)renderer.outputEncoding=T.sRGBEncoding;renderer.toneMappingExposure=1.15;
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(50,1,.05,60);camera.layers.enable(2);
 {const es=new T.Scene();es.background=new T.Color(0x1a1d22);const mk=(c,w,h,x,y,z,rx,ry)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);es.add(m);};mk(0xfff4e0,3,1,0,3,0,Math.PI/2,0);mk(0xffe8c8,1.2,.6,-2,2.2,1,0,Math.PI/2);mk(0xcfe0ff,1.2,.6,2,2.2,-1,0,Math.PI/2);mk(0xe8382c,.8,.4,0,1.5,-3,0,0);mk(0x2a2e36,8,8,0,-.5,0,-Math.PI/2,0);const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(es,.04).texture;pm.dispose();}
 // GFX: real HDRI image-based lighting per venue band (CC0, pmndrs/assets). Falls back to the synthetic room above.
 const ENVTEX={};let envKind=null;
 function setEnv(kind){if(envKind===kind)return;envKind=kind;if(ENVTEX[kind]){scene.environment=ENVTEX[kind];return;}
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
  const t=new T.CanvasTexture(c);t.anisotropy=8;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/.032,1/.032);t.offset.set(0,.1);FLT[key]=t;return t;}
 function flightTex(color,brand){const key=String(color)+brand;if(FLT[key])return FLT[key];const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const col=new T.Color(color);x.fillStyle='#'+col.getHexString();x.fillRect(0,0,256,256);const dk=col.clone().multiplyScalar(.55);x.fillStyle='#'+dk.getHexString();x.beginPath();x.moveTo(0,256);x.lineTo(256,0);x.lineTo(256,70);x.lineTo(70,256);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,256,26);x.fillStyle='rgba(0,0,0,.55)';x.font='800 54px "Saira Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.save();x.translate(150,150);x.rotate(-Math.PI/4);x.fillText(brand.toUpperCase(),0,0);x.restore();const t=new T.CanvasTexture(c);t.anisotropy=8;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/.032,1/.032);t.offset.set(0,.1);FLT[key]=t;return t;}
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
 function rigFrom(gltf,key){if(!RIG.rest)RIG.rest={};const sc=gltf.scene;sc.traverse(o=>{if(o.isBone)o.name=key+'_'+o.name.replace(/^mixamorig\d*:?/,'');});sc.updateMatrixWorld(true);
  if(key==='remy'){const box=new T.Box3().setFromObject(sc);const h=box.max.y-box.min.y;const k=(h>1.45&&h<2.1)?1:1.78/h;sc.scale.setScalar(k);sc.position.y=-box.min.y*k;}sc.updateMatrixWorld(true); /* Mixamo cast: metric, feet at the origin (bbox is unreliable on quantised meshes) */
  const root=new T.Group();sc.rotation.y=Math.PI;root.add(sc);root.updateMatrixWorld(true);
  root.traverse(o=>{if(o.isBone){o.updateWorldMatrix(true,false);RIG.rest[o.name]={q:o.getWorldQuaternion(new T.Quaternion()),p:o.getWorldPosition(new T.Vector3()),lq:o.quaternion.clone()};}});
  let shirtImg=null;root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(/Helmet/i.test(o.name)||(key==='pete'&&/Hair/i.test(o.name)))o.visible=false;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(key!=='remy'&&!/Hair|Eyelash/i.test(m.name||'')&&!/Hair|Eyelash/i.test(o.name)){m.transparent=false;m.alphaTest=0;m.depthWrite=true;m.opacity=1;}if(key!=='remy'){m.metalness=0;m.metalnessMap=null;m.roughnessMap=null;if(m.specularIntensity!==undefined)m.specularIntensity=.3;const skin=/body/i.test(m.name||'')&&/body/i.test(o.name);m.roughness=/hair/i.test(m.name||'')?.6:skin?.62:.86;if(m.specularMap)m.specularMap=null;m.needsUpdate=true;}if(m.map&&/Top/i.test(m.name||o.name))shirtImg=m.map.image;if(/Hair|Eyelash/i.test(m.name||'')){m.transparent=true;m.alphaTest=.4;m.side=T.DoubleSide;m.depthWrite=true;}});}});
  keepAssets(root);return {base:root,shirtImg,key};}
 // GFX: Mixamo clips (idles, drinking, talking, reactions), retargeted by bone name to each model.
 let ANIMS=null,ANIM_WAIT=false;const ANIM_CACHE={};
 function loadAnims(){if(ANIMS||ANIM_WAIT||window.GFX_LEGACY||!THREE.GLTFLoader)return;ANIM_WAIT=true;new THREE.GLTFLoader().load('assets/anims.glb',g=>{ANIMS={};g.animations.forEach(c=>ANIMS[c.name]=c);try{charsChanged();}catch(e){}},undefined,e=>console.warn('anims',e));}
 function clipFor(name,key){if(!ANIMS||!ANIMS[name])return null;const ck=key+'|'+name;if(ANIM_CACHE[ck])return ANIM_CACHE[ck];const src=ANIMS[name];const tracks=[];
  src.tracks.forEach(tr=>{const m=tr.name.match(/^(?:mixamorig\d*:?)?([A-Za-z0-9_]+)\.(quaternion|position)$/);if(!m)return;const bone=m[1],prop=m[2];if(prop==='position'&&bone!=='Hips')return;const t=tr.clone();t.name=key+'_'+bone+'.'+prop;
   if(prop==='position'){const v=t.values;let mx=0;for(let i=0;i<v.length;i++)mx=Math.max(mx,Math.abs(v[i]));const sc=mx>5?.01:1;const x0=v[0],y0=v[1],z0=v[2];const rh=RIG.rest[key+'_Hips'];const ry=rh?rh.p.y:1;const sit=/^sit/.test(name)?-(ry-.5):0;for(let i=0;i<v.length;i+=3){v[i]=(v[i]-x0)*sc;v[i+1]=ry+(v[i+1]-y0)*sc+sit;v[i+2]=(v[i+2]-z0)*sc;}}tracks.push(t);});
  return ANIM_CACHE[ck]=new T.AnimationClip(name,src.duration,tracks);}
 function playClip(fig,name,opts={}){const ck=fig.userData&&fig.userData.ck;if(!ck||ck==='remy')return null;loadAnims();const c=clipFor(name,ck);if(!c)return null;const mx=fig.userData.mixer||(fig.userData.mixer=new T.AnimationMixer(fig));
  const a=mx.clipAction(c);if(fig.userData.act&&fig.userData.act!==a){a.reset().play();fig.userData.act.crossFadeTo(a,opts.fade||.4,false);}else a.play();if(opts.t!=null)a.time=opts.t%c.duration;a.setLoop(opts.once?T.LoopOnce:T.LoopRepeat);a.clampWhenFinished=!!opts.once;fig.userData.act=a;return a;}
 function loadChar(key){if(RIGS[key]||RIG_WAIT[key]||!THREE.GLTFLoader)return;RIG_WAIT[key]=1;new THREE.GLTFLoader().load((window.TOPS_ASSETS||'assets/')+'chars/'+key+'.glb',g=>{RIGS[key]=rigFrom(g,key);delete RIG_WAIT[key];try{charsChanged();}catch(e){}},undefined,e=>{console.warn('char',key,e);});}
 // GFX: face kit — transplantable hairstyles (static meshes in head-bone space), beard, hair/skin colour, glasses, cap.
 const HEADS={"brian":{"min":[-0.0886,-0.0355,-0.0795],"max":[0.0886,0.192,0.1498]},"bryce":{"min":[-0.0952,-0.0172,-0.0652],"max":[0.0953,0.2269,0.161]},"pete":{"min":[-0.0959,-0.0239,-0.0759],"max":[0.0948,0.2149,0.1554]},"lewis":{"min":[-0.0881,-0.0209,-0.0659],"max":[0.0864,0.2196,0.142]},"david":{"min":[-0.0883,-0.016,-0.0911],"max":[0.0883,0.2172,0.1519]},"leonard":{"min":[-0.0956,-0.0265,-0.0669],"max":[0.0957,0.2094,0.1521]},"megan":{"min":[-0.0903,-0.0177,-0.0452],"max":[0.0905,0.2012,0.1726]},"elizabeth":{"min":[-0.0857,-0.0215,-0.0588],"max":[0.084,0.2086,0.153]}},HAIR_SRC={shaggy:'bryce',curly:'david',long:'elizabeth',short:'leonard',pony:'megan',pete:'pete',beard:'pete'};
 let HAIRLIB=null,HAIR_WAIT=false;const HAIRCOL_CACHE={};
 function loadHair(){if(HAIRLIB||HAIR_WAIT||!THREE.GLTFLoader)return;HAIR_WAIT=true;new THREE.GLTFLoader().load((window.TOPS_ASSETS||'assets/')+'hair.glb',g=>{HAIRLIB={};keepAssets(g.scene);g.scene.traverse(o=>{if(o.isMesh&&/^hair_/.test(o.name)){o.geometry.rotateX(Math.PI/2);const hh=(o.userData&&o.userData.head_h)||.24;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{m.transparent=true;m.alphaTest=.4;m.side=T.DoubleSide;m.depthWrite=true;m.metalness=0;m.metalnessMap=null;m.roughnessMap=null;m.roughness=.6;});HAIRLIB[o.name.slice(5)]={mesh:o,hh};}});try{charsChanged();}catch(e){}},undefined,e=>console.warn('hair',e));}
 function tintMap(map,hex,key){if(!map||!map.image)return map;const ck=key+'|'+hex;if(HAIRCOL_CACHE[ck])return HAIRCOL_CACHE[ck];const img=map.image,w=Math.min(1024,img.width||1024),h=Math.min(1024,img.height||1024);const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0,w,h);const d=x.getImageData(0,0,w,h),a=d.data;const col=new T.Color(hex),hx=col.getHex(),cr=(hx>>16&255)/255,cg=(hx>>8&255)/255,cb=(hx&255)/255;
  for(let i=0;i<a.length;i+=4){const l=Math.min(1,(a[i]*.3+a[i+1]*.59+a[i+2]*.11)/255*2.2);a[i]=Math.min(255,255*cr*l);a[i+1]=Math.min(255,255*cg*l);a[i+2]=Math.min(255,255*cb*l);}x.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.flipY=map.flipY;t.encoding=T.sRGBEncoding;return HAIRCOL_CACHE[ck]=t;}
 function faceKit(fig,B,look,ck){if(!look||!B.Head)return;if(ck==='pete')look=Object.assign({hair2:'short',beard2:1},Object.fromEntries(Object.entries(look).filter(([k,v])=>v!=null)));if(window.GFX_HEADDBG){[[1,0,0,0xff0000],[0,1,0,0x00ff00],[0,0,1,0x0000ff]].forEach(([x,y,z,c])=>{const m=new T.Mesh(new T.SphereGeometry(.015),new T.MeshBasicMaterial({color:c}));m.position.set(x*.13,y*.13,z*.13);B.Head.add(m);});}const L=look;const R=RIG.rest;const headH=(B.HeadTop_End&&R[B.HeadTop_End.name]&&R[B.Head.name])?R[B.HeadTop_End.name].p.distanceTo(R[B.Head.name].p):.24;
  const wantHair=L.hair2&&L.hair2!=='own';const needLib=wantHair&&L.hair2!=='bald'||L.beard2;if(needLib&&!HAIRLIB)loadHair();
  fig.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];
   if(/Hair/i.test(o.name)&&!/Eyelash/i.test(o.name)){if(wantHair)o.visible=false;else if(L.hairCol){o.material=ms.map(m=>{const c=m.clone();c.map=tintMap(m.map,L.hairCol,ck+'h');return c;});if(o.material.length===1)o.material=o.material[0];}}
   if(/Body/i.test(o.name)&&L.skinTone){const tone=new T.Color(L.skinTone);o.material=ms.map(m=>{const c=m.clone();c.color.copy(tone);return c;});if(o.material.length===1)o.material=o.material[0];}});
  const attach=(style,col)=>{const H=HAIRLIB&&HAIRLIB[style];if(!H)return;const m=new T.Mesh(H.mesh.geometry,col?(Array.isArray(H.mesh.material)?H.mesh.material.map(mm=>{const c=mm.clone();c.map=tintMap(mm.map,col,style);return c;}):(()=>{const c=H.mesh.material.clone();c.map=tintMap(H.mesh.material.map,col,style);return c;})()):H.mesh.material);const sh=HEADS[HAIR_SRC[style]],th=HEADS[ck];if(sh&&th){const sz=i=>(th.max[i]-th.min[i])/(sh.max[i]-sh.min[i]),c=(h,i)=>(h.max[i]+h.min[i])/2;const sx=sz(0),sy=sz(1),szz=sz(2);m.scale.set(sx,sy,szz);m.position.set(c(th,0)-c(sh,0)*sx,th.max[1]-sh.max[1]*sy,c(th,2)-c(sh,2)*szz);}else m.scale.setScalar(headH/H.hh);m.castShadow=true;m.frustumCulled=false;B.Head.add(m);};
  if(wantHair&&L.hair2!=='bald')attach(L.hair2,L.hairCol);if(L.beard2)attach('beard',L.hairCol);
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
  if(window.RIG_B64_URL){fetch(window.RIG_B64_URL).then(r=>r.text()).then(t=>{const bin=Uint8Array.from(atob(t.trim()),c=>c.charCodeAt(0));L.parse(bin.buffer,'',onLoaded,fail);}).catch(fail);}else L.load(window.RIG_URL||'remy.glb',onLoaded,undefined,fail);}
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
 function makeRigged(look,name,tier){const ck=charKey(look,name);if(ck!=='remy'&&!RIGS[ck])loadChar(ck);const R=RIGS[ck]||RIGS.remy||{base:RIG.base};const isRemy=ck==='remy'||!RIGS[ck];
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
  if(!isRemy)faceKit(fig,B,look,ck);
  fig.scale.set(wide,1,wide*.98);
  // dart in the right hand (placed in world space each frame), spares in the left
  const dt=(name&&save.name&&name.toUpperCase()===String(save.name).toUpperCase())?myDart(save.flight):oppDart(name);fig.add(dt);dt.matrixAutoUpdate=true;
  [0,1].forEach(k=>{const d=oppDart(name);d.scale.setScalar(1/1.78*3.78*.85);d.position.set(-.01+k*.03,.09,.0);d.rotation.set(1.6,0,0);d.userData.spare=1;B.LeftHand.add(d);});
  fig.userData={rigged:true,B,dt,hand:B.RightHand,hips:[],ck};return fig;}
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
 function poseRigged(fig,oa,boardTarget,fpv){if(fig.userData.ck&&fig.userData.ck!=='remy'&&!oa.celebrate&&!oa.shush&&oa.phase!=='celebrate'){poseDarts(fig,oa,boardTarget,fpv);return;}const B=fig.userData.B;fig.updateWorldMatrix(true,true);const tp=throwPose(oa);if(fpv){tp.lift-=13;tp.phi+=2;}const rad=Math.PI/180;
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
  H=E.clone().addScaledVector(dirF,L2);
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
  if(fig.userData.dt){const dt=fig.userData.dt;const ip=boneW(B.RightHandIndex2),tpos=boneW(fpv?B.RightHandThumb4:B.RightHandThumb3);const mid=fpv?ip.clone().lerp(tpos,.5):boneW(B.RightHandThumb2).lerp(boneW(B.RightHandThumb3),.6);if(fpv&&dartDir)mid.addScaledVector(up,.055).addScaledVector(dartDir,-.06).addScaledVector(right,-.02);else if(dartDir)mid.addScaledVector(palmN,.014);const dd=dartDir||handDir;const w=mid.clone().addScaledVector(dd,fpv?.012:.02);fig.worldToLocal(w);dt.position.copy(w);const m=new T.Matrix4().lookAt(mid.clone().add(dd),mid,up);const fq=fig.getWorldQuaternion(new T.Quaternion()).invert();dt.quaternion.copy(fq.multiply(new T.Quaternion().setFromRotationMatrix(m)));dt.rotateY(Math.PI);dt.scale.set(1/fig.scale.x,1/fig.scale.y,1/fig.scale.z);}
  // left arm: spares at the sternum
  const LS=boneW(B.LeftArm);const chest=fig.localToWorld(new T.Vector3(fpv?-.3:-.3,fpv?.86:.86,fpv?.04:.06));const d=Math.min(L1+L2-.01,LS.distanceTo(chest));const u=new T.Vector3().subVectors(chest,LS).normalize();const pole=new T.Vector3().addScaledVector(right,-.7).addScaledVector(fwd,-.7);pole.addScaledVector(u,-pole.dot(u)).normalize();
  const cosA=(L1*L1+d*d-L2*L2)/(2*L1*d);const A=Math.acos(Math.max(-1,Math.min(1,cosA)));const LE=LS.clone().addScaledVector(u,Math.cos(A)*L1).addScaledVector(pole,Math.sin(A)*L1);
  const ln=new T.Vector3().copy(fwd).negate().addScaledVector(up,.3);aimBone(B.LeftArm,B.LeftForeArm,new T.Vector3().subVectors(LE,LS),0);aimFrame(B.LeftForeArm,B.LeftHand,new T.Vector3().subVectors(chest,LE),ln);aimFrame(B.LeftHand,B.LeftHandMiddle1,new T.Vector3().addScaledVector(right,.6).add(up).normalize(),ln);curl(B,'Left',[1.2,1.3,1.3,1.3,.8]);
  // head looks at the board
  const HD=boneW(B.Head);const look=new T.Vector3().subVectors(boardTarget,HD).normalize();aimBone(B.Head,B.HeadTop_End,new T.Vector3(0,1,0).addScaledVector(look,.12).normalize(),0);
  if(fig.userData.dt)fig.userData.dt.visible=!(oa.phase==='fly'||oa.phase==='follow'||oa.phase==='reset');}
 // GFX: darts arm for the Mixamo cast, built from explicit anatomical frames (authored + checked in Blender, blender/pose.py).
 // Set: forearm upright in front of the right eye, palm side of the wrist facing the board, wrist bent right back, dart on top pointing at the board.
 const DPH={set:{lift:-11,phi:-2,ext:70,dart:6},back:{lift:-11,phi:-20,ext:86,dart:20},rel:{lift:-6,phi:46,ext:32,dart:2},end:{lift:-1,phi:86,ext:-46,dart:-8}};
 function dartPhase(oa){const ph=oa.phase||'idle',k=oa.k||0,p=oa.pull||0;const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;const mix=(A,C,e)=>({lift:A.lift+(C.lift-A.lift)*e,phi:A.phi+(C.phi-A.phi)*e,ext:A.ext+(C.ext-A.ext)*e,dart:A.dart+(C.dart-A.dart)*e});
  if(ph==='pull')return mix(DPH.set,DPH.back,1-Math.pow(1-Math.min(1,p),1.7));if(ph==='throw')return mix(DPH.back,DPH.rel,Math.pow(Math.min(1,k),1.8));
  if(ph==='fly'||ph==='follow')return mix(DPH.rel,DPH.end,1-Math.pow(1-Math.min(1,k),2));if(ph==='reset'){const a=ease(Math.min(1,k*1.6)),b=ease(Math.min(1,k));const m=mix(DPH.end,DPH.set,b);m.phi=DPH.end.phi+(DPH.set.phi-DPH.end.phi)*a;m.ext=DPH.end.ext+(DPH.set.ext-DPH.end.ext)*a;return m;}return Object.assign({},DPH.set);}
 const _M1=new T.Matrix4(),_M2=new T.Matrix4(),_Qa=new T.Quaternion(),_Qb=new T.Quaternion();
 function restAxis(bone,w){return w.clone().applyQuaternion(RIG.rest[bone.name].q.clone().invert()).normalize();}
 function setW(bone,yW,refL,refW){const y=yW.clone().normalize();const rw=refW.clone().addScaledVector(y,-refW.dot(y)).normalize();const ly=new T.Vector3(0,1,0);const lr=refL.clone().addScaledVector(ly,-refL.dot(ly)).normalize();const lz=new T.Vector3().crossVectors(lr,ly).negate();const wz=new T.Vector3().crossVectors(rw,y).negate();
  _M1.makeBasis(lr,ly,lz);_M2.makeBasis(rw,y,wz);_M2.multiply(_M1.transpose());_Qa.setFromRotationMatrix(_M2);bone.parent.getWorldQuaternion(_Qb);bone.quaternion.copy(_Qb.invert().multiply(_Qa));bone.updateWorldMatrix(true,false);}
 function poseDarts(fig,oa,boardTarget,fpv){const B=fig.userData.B,R=RIG.rest,rad=Math.PI/180;fig.updateWorldMatrix(true,true);
  Object.keys(B).forEach(n=>{const b=B[n];if(b.isBone&&R[b.name]&&!/UpLeg|Leg$|Foot|Toe|Hips/.test(n))b.quaternion.copy(R[b.name].lq);});fig.updateWorldMatrix(true,true);
  const P=dartPhase(oa);if(fpv){P.lift-=4;}
  {const sp=B.Spine1||B.Spine;if(sp&&!fpv){const ph=oa.phase||'idle',kk=oa.k||0,tt=performance.now()/1000;const lean=5+(ph==='pull'?-.6*(oa.pull||0):ph==='throw'?1.2*kk:ph==='fly'||ph==='follow'?1.6:ph==='reset'?1.6*(1-kk):.35*Math.sin(tt*1.5));const fq0=fig.getWorldQuaternion(new T.Quaternion());const rt0=new T.Vector3(1,0,0).applyQuaternion(fq0);sp.rotateOnWorldAxis(rt0,-lean*rad);fig.updateWorldMatrix(true,true);}}const up=new T.Vector3(0,1,0);const fq=fig.getWorldQuaternion(new T.Quaternion());const fwdC=new T.Vector3(0,0,-1).applyQuaternion(fq),rtC=new T.Vector3(1,0,0).applyQuaternion(fq);
  const S=boneW(B.RightArm);const b=new T.Vector3().subVectors(boardTarget,S);b.y=0;b.normalize();const lat=new T.Vector3().crossVectors(up,b).normalize();
  const dirU=b.clone().multiplyScalar(Math.cos(P.lift*rad)).addScaledVector(up,Math.sin(P.lift*rad)).addScaledVector(lat,.32).normalize();
  const hinge=new T.Vector3().crossVectors(dirU,up).normalize();setW(B.RightArm,dirU,restAxis(B.RightArm,up),hinge);
  const ph=P.phi*rad;const dirF=up.clone().multiplyScalar(Math.cos(ph)).addScaledVector(b,Math.sin(ph)).normalize();const pside=b.clone().multiplyScalar(Math.cos(ph)).addScaledVector(up,-Math.sin(ph)).normalize();
  const DN=new T.Vector3(0,-1,0);setW(B.RightForeArm,dirF,restAxis(B.RightForeArm,DN),pside);
  const ex=P.ext*rad;const fing=dirF.clone().multiplyScalar(Math.cos(ex)).addScaledVector(pside,-Math.sin(ex)).normalize();const palm=pside.clone().multiplyScalar(Math.cos(ex)).addScaledVector(dirF,Math.sin(ex)).normalize();
  setW(B.RightHand,fing,restAxis(B.RightHand,DN),palm);
  const rel=oa.phase==='fly'||oa.phase==='follow'||oa.phase==='reset';
  [['Index',rel?.15:.35],['Middle',rel?.2:.45],['Ring',rel?.5:.9],['Pinky',rel?.6:1]].forEach(([k,c])=>{for(let j=1;j<=3;j++){const bn=B['RightHand'+k+j];if(!bn)continue;bn.quaternion.copy(R[bn.name].lq);bn.rotateX(c*(j===1?1:.8));}});
  [[1,[-.3,0,-.5]],[2,[.3,0,0]],[3,[.2,0,0]]].forEach(([j,e])=>{const bn=B['RightHandThumb'+j];if(!bn)return;bn.quaternion.copy(R[bn.name].lq).multiply(_Qa.setFromEuler(new T.Euler(e[0],e[1],e[2],'ZYX')));});
  // left arm: hangs, forearm across the stomach with the spares
  if(B.LeftArm&&B.LeftForeArm){setW(B.LeftArm,DN.clone().addScaledVector(fwdC,.24).addScaledVector(rtC,-.26),restAxis(B.LeftArm,up),fwdC);setW(B.LeftForeArm,fwdC.clone().multiplyScalar(.8).addScaledVector(rtC,.52).addScaledVector(up,.12),restAxis(B.LeftForeArm,DN),DN);
   if(B.LeftHand){setW(B.LeftHand,rtC.clone().multiplyScalar(.6).addScaledVector(fwdC,.6).addScaledVector(up,-.15),restAxis(B.LeftHand,DN),fwdC.clone().negate().addScaledVector(up,-.4));
    ['Index','Middle','Ring','Pinky'].forEach((k,i)=>{for(let j=1;j<=3;j++){const bn=B['LeftHand'+k+j];if(!bn)continue;bn.quaternion.copy(R[bn.name].lq);bn.rotateX((.75+i*.08)*(j===1?1:.85));}});}}
  // head steady, eyes on the board
  if(B.Head&&B.HeadTop_End){const HD=boneW(B.Head);const look=new T.Vector3().subVectors(boardTarget,HD).normalize();aimBone(B.Head,B.HeadTop_End,up.clone().addScaledVector(look,.12).normalize(),0);}
  if(fig.userData.dt){const dt=fig.userData.dt;const mid=boneW(B.RightHandIndex2).lerp(boneW(B.RightHandThumb3),.5);const dd=b.clone().multiplyScalar(Math.cos(P.dart*rad)).addScaledVector(up,Math.sin(P.dart*rad)).normalize();
   const w=mid.clone().addScaledVector(palm,.008);fig.worldToLocal(w);dt.position.copy(w);const m=new T.Matrix4().lookAt(mid.clone().add(dd),mid,up);const iq=fig.getWorldQuaternion(new T.Quaternion()).invert();dt.quaternion.copy(iq.multiply(new T.Quaternion().setFromRotationMatrix(m)));dt.rotateY(Math.PI);dt.scale.set(1/fig.scale.x,1/fig.scale.y,1/fig.scale.z);dt.visible=!rel;}}
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
 let _chT=0;function charsChanged(){clearTimeout(_chT);_chT=setTimeout(()=>{try{if(lastMe)setPlayerLook(...lastMe);if(lastOpp)setOpponentLook(...lastOpp);if(lastTier>=0)buildVenue(lastTier);}catch(e){console.warn('chars',e);}try{if(window.__avPending){window.__avPending=0;document.dispatchEvent(new Event('tops-avatars'));}}catch(e){}},120);}
 function setOpponentLook(look,name,tier){lastOpp=[look,name,tier];if(lastMe&&!window.GFX_LEGACY){const mk=charKey(lastMe[0],lastMe[2]),ok=charKey(look,name);if(ok===mk){const fem=CHAR_F[ok],pool=CHARS.filter(c=>!!CHAR_F[c]===!!fem&&c!==mk);look=Object.assign({},look,{model:pool[(String(name||'').length)%pool.length]});}}if(opp){scene.remove(opp);disposeTree(opp);}opp=makeFigure(look,name,tier);Object.assign(O,opp.userData);opp.position.set(-.06,0,OCHE_Z+.08);opp.rotation.y=1.0;stance(opp);opp.visible=false;scene.add(opp);poseOpp(0,0);}
 function stance(fig){const u=fig.userData;if(u.rigged){stanceRigged(fig);fig.rotation.x=.03;return;}if(u.hips){u.hips.forEach(h=>{const right=h.position.x>0;h.rotation.set(right?.14:-.06,0,right?.03:-.05);});}fig.rotation.x=.04;}
 function poseOpp(oa){if(!opp)return;poseFigure(opp,oa||{phase:'idle'},boardC);}
 // --- player preview figure
 let me=null,fpFig=null;function setPlayerLook(look,flight,name,tier){lastMe=[look,flight,name,tier];if(me){scene.remove(me);disposeTree(me);}if(fpFig){scene.remove(fpFig);disposeTree(fpFig);fpFig=null;}if(RIG.ready){fpFig=makeRigged(look,name,tier);fpFig.visible=false;fpFig.traverse(o=>{if(o.isMesh)o.castShadow=false;});fpFig.userData.B.LeftHand.children.forEach(c=>{c.visible=false;});scene.add(fpFig);fpFig.remove(fpFig.userData.dt);const fd=myDart(flight);fpFig.add(fd);fpFig.userData.dt=fd;}me=makeFigure(look,name,tier);me.visible=false;scene.add(me);sleeveMat.color.set(look.shirt);skin.color.set(look.skin);
  fpArm.remove(hand);hand=makeHand(1,skin,null,'throw');hand.scale.setScalar(1.08);fpArm.add(hand);fpDart=myDart(flight);hand.add(fpDart);fpDart.position.set(-.026,.004,.074);fpDart.rotation.set(-.04,Math.PI,0);fpDart.scale.setScalar(1.6);if(previewOn)preview(true);else if(idleOn)idle(true);}
 const prevLight=new T.PointLight(0xfff1dd,1.1,6);prevLight.visible=false;scene.add(prevLight);const prevFill=new T.PointLight(0x9ab8ff,.5,6);prevFill.visible=false;scene.add(prevFill);
 let previewOn=false;function preview(on){previewOn=on;prevLight.visible=on;prevFill.visible=on;if(me){me.visible=on||idleOn;if(!on&&idleOn){idle(true);return;}me.position.set(0,0,OCHE_Z+1.5);me.rotation.y=-.35;stance(me);me.updateWorldMatrix(true,true);poseFigure(me,{phase:'idle'},me.localToWorld(new T.Vector3(.1,1.6,-3)));me.userData.dt.visible=true;}if(on){prevLight.position.set(1.0,2.4,OCHE_Z-.4);prevFill.position.set(-1.4,1.3,OCHE_Z+.6);}}
 let idleOn=false,titleOn=false;function title(on){titleOn=on;if(me&&idleOn&&!previewOn)me.visible=!on;}function idle(on){idleOn=on;if(me&&!previewOn){me.visible=on&&!titleOn;if(on){me.position.set(-.06,0,OCHE_Z+.08);me.rotation.y=1.0;stance(me);me.updateWorldMatrix(true,true);poseFigure(me,{phase:'idle'},boardC);}}}
 // --- crowd
 let crowd=null;
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
 function loadCrowdTex(){if(CROWD_TEX||CROWD_WAIT||window.GFX_LEGACY)return;CROWD_WAIT=true;new T.TextureLoader().load('assets/crowd.webp',tx=>{tx.encoding=T.sRGBEncoding;tx.anisotropy=4;CROWD_TEX=tx;if(lastTier>=2)buildVenue(lastTier);},undefined,()=>{});}
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
 function crowdBob(t){if(crowd&&crowd.C){const C=crowd.C;const ch=Math.max(0,1-(performance.now()-cheerT0)/1400)*cheerStrength;C.meta.forEach((q,i)=>{const want=ch>.15&&((i*7)%10)/10<ch+.2?(i%3===0?2:1):0;q.pose=want;});spriteLayout(C,t);return;}if(!crowd||!crowd.spots)return;const [hm,bm,sm,hr]=crowd,m=new T.Matrix4();const sp=crowd.spots;const ch=Math.max(0,1-(performance.now()-cheerT0)/1400)*cheerStrength;
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
 let venueTier=0,pyroLight=null;function buildVenue(t){venueTier=t;motes.length=0;sparks.forEach(s=>{if(s!==pyroLight)scene.remove(s);});sparks.length=0;if(pyroLight){scene.remove(pyroLight);pyroLight=null;}if(t>=3){pyroLight=new T.PointLight(0xffb040,0,6);scene.add(pyroLight);}buildVenueInner(t);ocheKit(t);lkRelight(t);if(window.TOPS_BOARD)try{TOPS_BOARD(t,{boardTex,surround,boardTexture,surroundTex,R,ORDER});}catch(e){console.warn('TOPS_BOARD',e);}try{sideDress(t);}catch(e){console.warn('sideDress',e);}}
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
 function sideDress(t){sideLed=null;if(t<2){pubDress(t);return;}if(t===5){floorPlate();return;}const G=new T.Group();G.name='sideDress';venue.add(G);const PLATE=window.TOPS_PLATES===false?null:(window.TOPS_PLATE6?{6:'plate_6.webp'}:{})[t];
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
 function buildVenueInner(t){lastTier=t;setEnv(t<=1?'pub':t<=3?'club':'stage');ledWall=null;clearGroup(venue);clearGroup(lights);extras.length=0;let spots=[];renderer.toneMappingExposure=[1.05,.78,1.05,1.0,1.0,1.1,.95][t]||1.05;document.body.dataset.tier=t;scene.fog=t>=2?new T.FogExp2([0,0,0x0a0c18,0x04101e,0x04101e,0x0a1d3a,0x0a0414][t],t===5?.03:.045):null;
  const pool=addLight(new T.SpotLight(0xfff0d8,.9,6,.5,.7,1.2));pool.position.set(.3,3.2,OCHE_Z+.3);const pt=new T.Object3D();pt.position.set(.1,0,OCHE_Z);lights.add(pt);pool.target=pt;
  const amb=addLight(new T.AmbientLight(0xffffff,.3));addLight(new T.HemisphereLight(0xdfe6ff,0x3a2a1a,.35));addLight(new T.PointLight(0xfff0e0,.45,8)).position.set(-.6,2.4,OCHE_Z+1.6);
  const key=addLight(new T.SpotLight(0xfff2dc,1.9,12,.55,.5,1));key.position.set(0,3.4,2.2);key.target=board;lights.add(key.target);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0005;
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
 function stepPuffs(now){for(let i=puffs.length-1;i>=0;i--){const sp=puffs[i];const k=(now-sp.userData.t0)/520;if(k>=1){dartsG.remove(sp);puffs.splice(i,1);continue;}sp.position.addScaledVector(sp.userData.v,.016);sp.scale.setScalar(.006+k*.03);sp.material.opacity=.35*(1-k);}}
 const marks=[];function hitMark(p){const m=new T.Mesh(new T.RingGeometry(.0045,.006,24),new T.MeshBasicMaterial({color:0xe9e4d8,transparent:true,opacity:.8,depthTest:false}));m.position.copy(p);m.position.z+=.001;m.renderOrder=6;m.userData.t0=performance.now();dartsG.add(m);marks.push(m);}
 function stepMarks(now){for(let i=marks.length-1;i>=0;i--){const m=marks[i];const k=(now-m.userData.t0)/220;if(k>=1){dartsG.remove(m);marks.splice(i,1);continue;}const s=1+k*.6;m.scale.set(s,s,1);m.material.opacity=.8*(1-k);}}
 const stuck=[];function clearDarts(){marks.forEach(m=>dartsG.remove(m));marks.length=0;puffs.forEach(m=>dartsG.remove(m));puffs.length=0;stuck.forEach(d=>dartsG.remove(d));stuck.length=0;}
 function stickDart(x,y,who){const d=who===0?myDart(save.flight):oppDart(S&&S.p[1]&&S.p[1].name);const p=mmToWorld(x,y,BOARD_Z+.003);d.rotation.set(-.12+Math.random()*.1,(Math.random()-.5)*.1,Math.random()*6);const tip=new T.Vector3(0,0,d.userData.tipZ||-.07).applyQuaternion(d.quaternion);
  // LOOK: pivot group sits at the tip so the wobble never moves the tip; narrow contact shadow offset down-right of the key light
  const piv=new T.Group();piv.position.copy(p);d.position.copy(tip).negate();piv.add(d);const sh=new T.Mesh(new T.CircleGeometry(.0032,12),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.42,depthWrite:false}));sh.scale.set(1.7,.75,1);sh.position.set(.0016,-.0014,-.0024);piv.add(sh);
  const hh=scoreAt(x,y);if(hh.m===3||hh.label==='BULL')hitMark(p);puff(p,4);piv.userData={t0:performance.now(),amp:.045+Math.random()*.03,ax:(Math.random()-.5)*.8};dartsG.add(piv);stuck.push(piv);}
 function wobble(now){for(const d of stuck){const u=d.userData;if(!u.t0)continue;const t=(now-u.t0)/1000;if(RM||t>.55){d.rotation.x=0;d.rotation.y=0;u.t0=0;continue;}const w=Math.sin(t*2*Math.PI*9)*u.amp*Math.exp(-t*7.5);d.rotation.x=w;d.rotation.y=w*u.ax;}}
 const flights=[];
 function fly(from,x,y,who,dur,arc,done){const d=who===0?myDart(save.flight):oppDart(S&&S.p[1]&&S.p[1].name);scene.add(d);const to=mmToWorld(x,y,BOARD_Z+.07);flights.push({d,from:from.clone(),to,t0:performance.now(),dur,arc,done,who,x,y});}
 function stepFlights(now){for(let i=flights.length-1;i>=0;i--){const f=flights[i];const k=Math.min(1,(now-f.t0)/f.dur);const p=new T.Vector3().lerpVectors(f.from,f.to,k);p.y+=Math.sin(k*Math.PI)*f.arc;
  const k2=Math.min(1,k+.02);const p2=new T.Vector3().lerpVectors(f.from,f.to,k2);p2.y+=Math.sin(k2*Math.PI)*f.arc;f.d.position.copy(p);f.d.lookAt(p2);f.d.rotateY(Math.PI);f.d.rotateZ(now/(f.dur>1000?400:80));
  if(k>=1){scene.remove(f.d);flights.splice(i,1);stickDart(f.x,f.y,f.who);f.done();}}}

 // ===== LOOK (sprint) ===== pane layout, fixed board camera, thrower camera, earned push/reaction, lighting pass
 function lkPhone(){return innerWidth<=700||innerHeight>innerWidth*1.1;}
 let lkSafeB=0,lkProbe=null;function lkSafe(){if(!lkProbe){lkProbe=document.createElement('div');lkProbe.style.cssText='position:fixed;left:0;bottom:0;width:1px;height:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden';document.body.appendChild(lkProbe);}return lkProbe.offsetHeight||0;}
 let lkKey='';const lkR={phone:false,hdr:48,sb:112,pull:0,pad:72,diam:400,board:{x:0,y:48,w:100,h:100},player:{x:100,y:48,w:100,h:100}};
 function lkRects(){const W=innerWidth,H=innerHeight;const phone=lkPhone();const key=W+'x'+H+(phone?'p':'d');if(key===lkKey)return lkR;lkKey=key;lkSafeB=lkSafe();
  if(phone){const hdr=40,sb=116,pull=lkSafeB;const avail=Math.max(300,H-hdr-sb-pull);let board=Math.round(Math.min(W*1.05,avail*.52));board=Math.max(190,board);const ph=Math.max(0,avail-board);
   Object.assign(lkR,{phone,hdr,sb,pull,pad:0,diam:Math.round(Math.min(W,board)*.897),board:{x:0,y:hdr,w:W,h:board},player:{x:0,y:hdr+board,w:W,h:ph}});}
  else{const hdr=48,sb=112,pad=0;const bh=Math.max(240,H-hdr-sb-pad);const bw=Math.round(W*840/1440);Object.assign(lkR,{phone,hdr,sb,pull:0,pad,diam:Math.round(Math.min(bw,bh)*.842),board:{x:0,y:hdr,w:bw,h:bh},player:{x:bw,y:hdr,w:W-bw,h:bh}});}
  const st=document.documentElement.style;st.setProperty('--lk-hdr',lkR.hdr+'px');st.setProperty('--lk-sb',lkR.sb+'px');st.setProperty('--lk-pull',lkR.pull+'px');st.setProperty('--lk-pad',lkR.pad+'px');st.setProperty('--lk-bw',lkR.board.w+'px');st.setProperty('--lk-bh',lkR.board.h+'px');st.setProperty('--lk-px',lkR.player.x+'px');st.setProperty('--lk-py',lkR.player.y+'px');st.setProperty('--lk-pw',lkR.player.w+'px');st.setProperty('--lk-ph',lkR.player.h+'px');st.setProperty('--lk-diam',lkR.diam+'px');document.body.classList.toggle('lk-phone',phone);return lkR;}
 // earned moments: 350 ms board push (140 in / 210 out, 8 %) toward a board point; 450-800 ms thrower reaction (player pane only)
 let lkPushS=null,lkReactS=null;function lookPush(x,y){if(RM)return;lkPushS={t0:performance.now(),x,y};}function lookReact(ms){if(RM)return;lkReactS={t0:performance.now(),dur:ms||450};}function lookSkip(){lkPushS=null;lkReactS=null;}
 const lkEase=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
 function lkPushK(now){if(!lkPushS)return 0;const t=now-lkPushS.t0;if(t>=350){lkPushS=null;return 0;}return t<140?lkEase(t/140):1-lkEase((t-140)/210);}
 function lkReactK(now){if(!lkReactS)return 0;const t=now-lkReactS.t0,d=lkReactS.dur;if(t>=d){lkReactS=null;return 0;}return t<120?lkEase(t/120):t>d-160?1-lkEase((t-(d-160))/160):1;}
 const lkFace={hx:0,hy:1.62,tz:OCHE_Z,set:false};
 // lighting pass: one warm key on the board from above-left, venue ~1.5 stops under the thrower, rim on the thrower, restrained distance fade
 function lkRelight(t){const phone=lkPhone();let key=null,pool=null;lights.children.forEach(L=>{if(L.isSpotLight&&L.target===board)key=L;else if(L.isSpotLight&&!pool)pool=L;});
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
 function frame(now,state){const t=now/1000;if(!state)state={view:0,nerves:0,p:[{ai:false}],cur:0,done:true,pulling:false,busy:true,aim:{x:0,y:0},sway:{x:0,y:0},sigma:0,oppArm:{pull:0,phase:'idle'}};
  const targetK=((state.view===1||state.mateTurn)&&!(state.online&&window.__rr))?1:0;const dt=Math.min(.1,(now-(frame.last||now))/1000);frame.last=now;camK+=(targetK-camK)*Math.min(1,dt*4.5);
  if(state.reader){camSpec.pos.z=portrait?OCHE_Z+1.2:OCHE_Z+.9;}
  let pos=new T.Vector3().lerpVectors(camPlayer.pos,camSpec.pos,camK),look=new T.Vector3().lerpVectors(camPlayer.look,camSpec.look,camK),fov=camPlayer.fov+(camSpec.fov-camPlayer.fov)*camK;
  const useFP=fpFig&&!previewOn&&!idleOn&&!state.done&&!state.p[state.cur].ai&&!state.mateTurn;
  if(fpFig)fpFig.visible=!!useFP&&!cine&&!window.TOPS_WALKFULL;
  if(useFP){fpFig.position.set(camPlayer.pos.x+.1,0,camPlayer.pos.z+.04);fpFig.rotation.y=.8;stanceRigged(fpFig);
   let oa={phase:'idle'};const fpArmT=window.__fpArmT||(window.__fpArmT={fly:0,fol:0});if(state.pulling)oa={phase:'pull',pull:state.pull};else if(state.anim&&state.anim.kind==='throw'){const k=Math.min(1,(now-state.anim.t0)/state.anim.dur);oa={phase:'throw',pull:1,k};}else if(state.flyingOwn)oa={phase:'follow',pull:1,k:1,t0:now};{const A=fpArmT;if(oa.phase==='follow'){if(!A.fly)A.fly=now;A.fol=now;oa.k=Math.min(1,(now-A.fly)/170);}else if(oa.phase==='idle'&&A.fol){const d=now-A.fol;if(d<300)oa={phase:'follow',pull:1,k:1};else if(d<520)oa={phase:'reset',k:(d-300)/220};else{A.fol=0;A.fly=0;}}else if(oa.phase!=='follow'){A.fly=0;}}
   if(window.GFX_OA)oa=window.GFX_OA;fpFig.updateWorldMatrix(true,true);poseRigged(fpFig,oa,boardC,!splitOn);
   const B=fpFig.userData.B;const eL=boneW(B.LeftEye),eR=boneW(B.RightEye);const eye=eL.clone().lerp(eR,.72);const fwdE=new T.Vector3().subVectors(camPlayer.look,eye).normalize();eye.addScaledVector(fwdE,.05);
   if(camK<.5){pos.lerpVectors(eye,camSpec.pos,camK);}}
  const wk=Math.min(1,(now-walkT0)/2800);if(wk<1){const e=1-Math.pow(1-wk,3);pos.lerpVectors(camWalk.pos,pos,e);look.lerpVectors(camWalk.look,look,e);fov=camWalk.fov+(fov-camWalk.fov)*e;}
  if(cine){const k=(now-cine.t0)/cine.dur;if(k>=1.0){cine=null;}else{const tgt=mmToWorld(cine.x,cine.y);let cp,cl;if(flights.length){const f=flights[0];const dp=f.d.position.lengthSq()<1e-6?f.from:f.d.position;const e=Math.min(1,k*1.15);const side=new T.Vector3(.26,.03,.3).multiplyScalar(1-e*.45);cp=dp.clone().add(side);cl=dp.clone().lerp(tgt,.55+e*.45);cine.lastPos=cp;cine.lastLook=cl;}else{cp=cine.lastPos||pos.clone();cl=tgt.clone();}
   const back=Math.max(0,(k-.82)/.18);if(back>0){const e=back*back;pos.lerpVectors(cp,pos,e);look.lerpVectors(cl,look,e);fov=34+(fov-34)*e;}else{pos.copy(cp);look.copy(cl);fov=34;}punch=null;}}
  if(punch){const k=(now-punch.t0)/punch.dur;if(k>=1)punch=null;else{const e=k<.25?k/.25:1-Math.pow((k-.25)/.75,2);const w=mmToWorld(punch.x,punch.y);const spec=camK>=.5;look.lerp(new T.Vector3(w.x,w.y,0),(spec?.6:.85)*e);fov=fov+(Math.max(spec?20:14,fov*(spec?.55:.42))-fov)*e;}}
  if(previewOn){if(portrait){pos.set(Math.sin(t*.4)*.2,1.75,OCHE_Z-1.7);look.set(0,.7,OCHE_Z+1.5);fov=50;}else{pos.copy(camPrev.pos);pos.x+=Math.sin(t*.4)*.2;look.copy(camPrev.look);fov=40;}}
  else if(idleOn&&titleOn){const k=(Math.sin(t*.07)+1)/2;pos.set(-.75+.2*k,1.6,OCHE_Z+1.75-.25*k);look.set(portrait?-.3:-.72,1.56,0);fov=portrait?60:46;}else if(idleOn){const k=(Math.sin(t*.12)+1)/2;pos.set(1.6-2.4*k,1.75-.15*k,OCHE_Z+4.2-1.6*k);look.set(.1,1.45,0);fov=portrait?70:56;}
  if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}
  const nv=state.nerves;const sw=(1-camK)*(.0015+nv*.0025);pos.x+=Math.sin(t*1.3)*sw+camOff.x;pos.y+=Math.cos(t*1.7)*sw*.6+camOff.y;if(window.TOPS_WALKFX){try{const r=TOPS_WALKFX(now,{me,pos,look,T,playClip,fpFig});if(r&&r.fov!=null)fov=r.fov;}catch(e){}}camera.position.copy(pos);camera.lookAt(look);camOff.multiplyScalar(.8);
  camera.updateMatrixWorld();camera.updateMatrixWorld(true);
  // fp arm
  fpArm.visible=!fpFig&&!cine&&!previewOn&&!idleOn&&((camK<.5&&!state.p[state.cur].ai&&wk>=1)||state.done);
  if(fpArm.visible){let p=state.pulling?state.pull:0,tk=0;if(state.anim&&state.anim.kind==='throw'){tk=Math.min(1,(now-state.anim.t0)/state.anim.dur);}if(state.anim&&state.anim.kind==='pump'){const k=Math.min(1,(now-state.anim.t0)/state.anim.dur);poseArm(0,0,k);}else poseArm(p,tk);fpDart.visible=!(state.anim&&state.anim.kind==='throw'&&tk>.6)&&!state.flyingOwn;}
  // opponent
  if(opp){const u=opp.userData;const waitOK=window.TOPS_WAIT===true&&!state.online&&!previewOn&&!idleOn&&!cine&&!state.done&&!state.bull&&!(state.p[state.cur].ai||state.mateTurn)&&u.rigged&&u.ck&&u.ck!=='remy';
   // LOOK v1.43: the opponent waits behind the oche on your visit, sipping, shifting, looking about (Mixamo clips), then walks back into the throw pose
   if(waitOK){opp.visible=true;if(!u.waiting){u.waiting=true;u.wT=t;try{playClip(opp,['drink','idle','breathe','look','drink'][Math.floor(Math.random()*5)],{t:Math.random()*3});}catch(e){}}
    const dtw=Math.min(.1,Math.max(0,t-(u.wT||t)));u.wT=t;if(u.mixer)u.mixer.update(dtw);{const wp=window.TOPS_WAITPOS||[1.8,.05];opp.position.set(wp[0],0,OCHE_Z+wp[1]);}opp.rotation.set(0,window.TOPS_WAITRY!=null?TOPS_WAITRY:Math.PI*.82,0);if(O.dt)O.dt.visible=false;}
   else{if(u.waiting){u.waiting=false;try{if(u.mixer)u.mixer.stopAllAction();}catch(e){}opp.position.set(-.06,0,OCHE_Z+.08);opp.rotation.set(0,1.0,0);}opp.visible=!!(!previewOn&&!idleOn&&(state.p[state.cur].ai||state.mateTurn)&&!state.done);}}
  if(opp&&opp.visible&&!opp.userData.waiting){const oa=state.oppArm;poseOpp(oa);if(O.dt)O.dt.visible=!(oa.phase==='fly'||oa.phase==='follow'||oa.phase==='reset');opp.position.y=Math.sin(t*.9)*.004;opp.rotation.z=Math.sin(t*.7)*.006;opp.rotation.y=1.0+Math.sin(t*.23)*.03;opp.position.x=-.06+Math.sin(t*.31)*.012;}
  // v1.71: spares in the off hand count down through the visit (2, 1, 0)
  {const spN=Math.max(0,2-((state.visit&&state.visit.length)||0));const setSp=(f,on)=>{const B=f&&f.userData&&f.userData.B;if(B&&B.LeftHand){let i=0;B.LeftHand.children.forEach(c=>{if(c.userData.spare){c.visible=!!on&&i<spN;i++;}});}};setSp(fpFig,splitOn);setSp(opp,true);}
  // reticle
  if(!(state.online&&state.cur!==0))window.__rr=null;const showRet=!previewOn&&!idleOn&&camK<.5&&!state.busy&&!state.done&&!state.p[state.cur].ai&&!state.mateTurn&&!document.body.classList.contains('card-noret');reticle.visible=false;/* FEEL: shader reticle replaces rr/rc/xh */if(showRet){const ax=state.aim.x+state.sway.x,ay=state.aim.y+state.sway.y;retLast={x:ax,y:ay,mode:state.pulling?'pull':'aim',sigma:state.sigma,perfect:!!state.inWin,over:!!state.over};retHideT=0;feelReticle(retLast);}else if(!previewOn&&!idleOn&&window.TOPS_remoteRet&&(window.__rr=window.TOPS_remoteRet())){feelReticle(window.__rr);}else if(retLast){if(!retHideT)retHideT=now;const k=(now-retHideT)/100;if(k>=1||state.done){retLast=null;feelReticle(null);}else feelReticle(Object.assign({},retLast,{op:1-k}));}else feelReticle(null);
  stepFlights(now);stepMarks(now);stepPuffs(now);stepSparks(now);wobble(now);crowdBob(t);extrasIdle(t);if(ledWall){ledWall.material.map.offset.x=(t*.004)%1;ledWall.material.map.wrapS=T.RepeatWrapping;}const useSplit=splitOn&&!previewOn&&!idleOn&&!cine&&!window.TOPS_WALKFULL&&state&&!state.done&&!(state.reader);
  if(useSplit){const _sz=renderer.getSize(new T.Vector2());const W=_sz.x,Hh=_sz.y;const LR=lkRects();const BP=LR.board,PP=LR.player;const vert=LR.phone;
   // LOOK: board pane = whole numbered board + ~20 mm surround from a fixed camera (no follow, no zoom); only the earned push moves it, and never while pulling
   const pk=state.pulling?0:lkPushK(now);let cx=boardC.x,cy=boardC.y;const vis=.451*BP.h/Math.max(1,LR.diam);let bfov=18;let dist=(vis/2)/Math.tan(bfov/2*Math.PI/180);if(dist>1.7){dist=1.7;bfov=2*Math.atan((vis/2)/dist)*180/Math.PI;} // never back the camera past the oche (people stand there)
   {/* zoomed board: frames the aim point, glides between darts, frozen while pulling or a dart is in the air */const Z=window.__lkZ||(window.__lkZ={k:0,cx:boardC.x,cy:boardC.y,tx:boardC.x,ty:boardC.y});const zOn=window.__zoomOn!==false&&!state.done;const zdt=Math.min(.1,Math.max(.001,(now-(Z.t||now))/1000));Z.t=now;Z.k+=((zOn?1:0)-Z.k)*Math.min(1,zdt*8);const lockZ=state.pulling||state.anim||state.flyingOwn;if(!lockZ){const ai=(state.p[state.cur].ai||state.mateTurn)&&state.aiAim;const a=ai?state.aiAim:state.aim;if(a){const w=mmToWorld(Math.max(-150,Math.min(150,a.x)),Math.max(-150,Math.min(150,a.y)));Z.tx=w.x;Z.ty=w.y;}Z.cx+=(Z.tx-Z.cx)*Math.min(1,zdt*7);Z.cy+=(Z.ty-Z.cy)*Math.min(1,zdt*7);}cx+=(Z.cx-cx)*Z.k*.9;cy+=(Z.cy-cy)*Z.k*.9;bfov=bfov/(1+1.5*Z.k);}
   if(pk>0&&lkPushS){const w=mmToWorld(lkPushS.x,lkPushS.y);cx+=(w.x-cx)*.074*pk;cy+=(w.y-cy)*.074*pk;bfov=bfov/(1+.08*pk);}
   let dkc=null;try{dkc=window.TOPS_DRUNKCAM?TOPS_DRUNKCAM(now):null;}catch(e){}if(dkc){cx+=dkc.x;cy+=dkc.y;bfov*=dkc.f;}boardCam.position.set(cx,cy,BOARD_Z+dist);boardCam.lookAt(cx,cy,BOARD_Z);if(dkc)boardCam.rotateZ(dkc.r);boardCam.fov=bfov;
   // player pane: stable three-quarter thrower; the head target is frozen while pulling/throwing so the shot never moves during a pull
   const thrower=(state.p[state.cur].ai||state.mateTurn)?opp:fpFig;let hx=0,hy=1.62;if(thrower&&thrower.userData&&thrower.userData.B&&thrower.userData.B.Head){const hw=boneW(thrower.userData.B.Head);hx=hw.x;hy=hw.y;}
   const tz=(thrower&&thrower.position)?thrower.position.z:OCHE_Z;const locked=state.pulling||state.anim||state.flyingOwn;if(!lkFace.set||state.cur!==lkFace.cur){Object.assign(lkFace,{hx,hy,tz,set:true,cur:state.cur});}else if(!locked){lkFace.hx+=(hx-lkFace.hx)*.08;lkFace.hy+=(hy-lkFace.hy)*.08;lkFace.tz+=(tz-lkFace.tz)*.08;}
   const rk=lkReactK(now);const fx=lkFace.hx,fy=lkFace.hy,fz=lkFace.tz;{const an=(window.TOPS_CAMANG!=null?window.TOPS_CAMANG:0)*Math.PI/180,D=2.3;faceCam.position.set(fx-D*Math.cos(an),fy+(vert?.1:.02)+.04*rk,fz+.1-D*Math.sin(an));}faceCam.lookAt(fx+.1,fy+(vert?.03:-.22)+(vert?.04:.16)*rk,fz+.02);faceCam.fov=(vert?21:30)*(1-.2*rk);if(window.GFX_FACECAM){const c=window.GFX_FACECAM;faceCam.position.set(...c.pos);faceCam.lookAt(...c.look);faceCam.fov=c.fov||50;}
   renderer.setScissorTest(false);renderer.setViewport(0,0,W,Hh);renderer.clear();renderer.setScissorTest(true);renderer.autoClear=true;
   renderer.setViewport(BP.x,Hh-(BP.y+BP.h),BP.w,BP.h);renderer.setScissor(BP.x,Hh-(BP.y+BP.h),BP.w,BP.h);
   boardCam.aspect=BP.w/BP.h;boardCam.updateProjectionMatrix();if(fpFig)fpFig.visible=false;const hid=[];flights.forEach(f=>{if(f.d.position.distanceTo(boardCam.position)<.5){f.d.visible=false;hid.push(f.d);}});renderer.render(scene,boardCam);hid.forEach(d=>d.visible=true);
   if(fpFig)fpFig.visible=!!useFP;if(PP.h>0&&PP.w>0){renderer.setViewport(PP.x,Hh-(PP.y+PP.h),PP.w,PP.h);renderer.setScissor(PP.x,Hh-(PP.y+PP.h),PP.w,PP.h);faceCam.aspect=PP.w/PP.h;
   faceCam.updateProjectionMatrix();renderer.render(scene,faceCam);}renderer.setScissorTest(false);renderer.setViewport(0,0,W,Hh);return;}
  renderer.autoClear=true;(window.TOPS_WALKPOST&&TOPS_WALKPOST(),renderer.render(scene,camera));if(fpArm.visible&&!window.TOPS_WALKFULL){renderer.autoClear=false;renderer.clearDepth();renderer.render(armScene,armCam);}}
 function handWorld(){if(fpFig&&fpFig.visible){return boneW(fpFig.userData.B.RightHandIndex2);}const ndc=hand.position.clone().project(armCam);const far=new T.Vector3(ndc.x,ndc.y,.5).unproject(camera);const dir=far.sub(camera.position).normalize();return camera.position.clone().add(dir.multiplyScalar(.55));}
 function oppHandWorld(){if(!O.hand)return new T.Vector3(.4,1.6,OCHE_Z);O.hand.updateMatrixWorld(true);return new T.Vector3().setFromMatrixPosition(O.hand.matrixWorld);}
 const RM=matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function shake(){if(RM)return;camOff.set((Math.random()-.5)*.006,.004,0);}
 loadRig();setTimeout(()=>{const l=$('loading');if(l)l.classList.add('gone');},9000);onRig(()=>{const l=$('loading');if(l)l.classList.add('gone');if(window.onRigReady)setTimeout(window.onRigReady,50);if(lastTier>=0)buildVenue(lastTier);if(lastOpp)setOpponentLook(...lastOpp);if(lastMe)setPlayerLook(...lastMe);if(me&&idleOn)idle(true);if(previewOn)preview(true);});
 // --- portraits: render a figure's head to a data URL (cached)
 const pScene=new T.Scene();pScene.background=new T.Color(0x12161c);pScene.add(new T.HemisphereLight(0xdde6ff,0x2a2420,.9));const pKey=new T.DirectionalLight(0xfff1dc,1.0);pKey.position.set(.8,2.2,-1.6);pScene.add(pKey);const pRim=new T.DirectionalLight(0xe8382c,.9);pRim.position.set(-1.2,1.6,1.2);pScene.add(pRim);
 const pCam=new T.PerspectiveCamera(26,1,.05,10);const PR=256;const pRT=new T.WebGLRenderTarget(PR,PR,{depthBuffer:true,encoding:window.GFX_LIN?T.sRGBEncoding:T.LinearEncoding});const portraitCache={};
 function headshot(look,name,tier,dir){const key=JSON.stringify([look,name,tier,!!RIG.ready,dir||0]);if(portraitCache[key])return portraitCache[key];let fig;try{fig=makeFigure(look,name,tier);}catch(e){return '';}fig.position.set(0,0,0);fig.rotation.y=dir||0;if(fig.userData.rigged)stanceRigged(fig);pScene.add(fig);fig.updateWorldMatrix(true,true);
  let hy=1.6;if(fig.userData.B&&fig.userData.B.Head){const v=new T.Vector3();fig.userData.B.Head.getWorldPosition(v);hy=v.y+.07;}
  pCam.position.set(.14,hy+.03,-.74);pCam.lookAt(0,hy-.02,0);const prevT=renderer.toneMapping;renderer.setRenderTarget(pRT);renderer.render(pScene,pCam);const buf=new Uint8Array(PR*PR*4);renderer.readRenderTargetPixels(pRT,0,0,PR,PR,buf);renderer.setRenderTarget(null);pScene.remove(fig);disposeTree(fig);
  const c=document.createElement('canvas');c.width=c.height=PR;const x=c.getContext('2d');const id=x.createImageData(PR,PR);const g=new Uint8Array(256);for(let i=0;i<256;i++)g[i]=Math.round(Math.pow(Math.min(1,i/255*1.0),1/2.2)*255);
  for(let y=0;y<PR;y++){const src=(PR-1-y)*PR*4,dst=y*PR*4;for(let i=0;i<PR*4;i+=4){id.data[dst+i]=g[buf[src+i]];id.data[dst+i+1]=g[buf[src+i+1]];id.data[dst+i+2]=g[buf[src+i+2]];id.data[dst+i+3]=255;}}
  x.putImageData(id,0,0);const url=c.toDataURL('image/jpeg',.85);{const ck=charKey(look,name);if(ck==='remy'||RIGS[ck])portraitCache[key]=url;else window.__avPending=1;}return url;}
 // AFTER HOURS hero render: waist-up 3/4 front view in the set pose, transparent background (for hub/reward hero banners)
 const HW=480,HH=600;const hRT=new T.WebGLRenderTarget(HW,HH,{depthBuffer:true,encoding:window.GFX_LIN?T.sRGBEncoding:T.LinearEncoding});const heroCache={};const hCam=new T.PerspectiveCamera(30,HW/HH,.05,10);
 function heroShot(look,name,tier,flight){const key=JSON.stringify([look,name,tier,!!RIG.ready,flight||'']);if(heroCache[key])return heroCache[key];let fig;try{fig=makeFigure(look,name,tier);}catch(e){return '';}if(!fig.userData.rigged)return '';
  fig.position.set(0,0,0);fig.rotation.y=0;stanceRigged(fig);pScene.add(fig);fig.updateWorldMatrix(true,true);
  let hy=1.6;if(fig.userData.B&&fig.userData.B.Head){const v=new T.Vector3();fig.userData.B.Head.getWorldPosition(v);hy=v.y;}
  try{poseDarts(fig,0,new T.Vector3(.35,hy+.05,-2.4),false);fig.updateWorldMatrix(true,true);}catch(e){}
  const bg=pScene.background;pScene.background=null;const rc=pRim.color.getHex(),ri=pRim.intensity;pRim.color.setHex(0xc6f36b);pRim.intensity=.55;
  {const v=window.__HCAM||[-1.25,.14,-1.4,-.16];hCam.position.set(v[0],hy+v[1],v[2]);hCam.lookAt(0,hy+v[3],0);}const cc=renderer.getClearColor(new T.Color()),ca=renderer.getClearAlpha();renderer.setClearColor(0x000000,0);
  renderer.setRenderTarget(hRT);renderer.clear();renderer.render(pScene,hCam);const buf=new Uint8Array(HW*HH*4);renderer.readRenderTargetPixels(hRT,0,0,HW,HH,buf);renderer.setRenderTarget(null);renderer.setClearColor(cc,ca);pScene.background=bg;pRim.color.setHex(rc);pRim.intensity=ri;pScene.remove(fig);disposeTree(fig);
  const c=document.createElement('canvas');c.width=HW;c.height=HH;const x=c.getContext('2d');const id=x.createImageData(HW,HH);const g=new Uint8Array(256);for(let i=0;i<256;i++)g[i]=Math.round(Math.pow(i/255,1/2.2)*255);
  for(let y=0;y<HH;y++){const src=(HH-1-y)*HW*4,dst=y*HW*4;for(let i=0;i<HW*4;i+=4){const a=buf[src+i+3];id.data[dst+i]=g[buf[src+i]];id.data[dst+i+1]=g[buf[src+i+1]];id.data[dst+i+2]=g[buf[src+i+2]];id.data[dst+i+3]=a;}}
  x.putImageData(id,0,0);const url=c.toDataURL('image/png');{const ck=charKey(look,name);if(ck==='remy'||RIGS[ck])heroCache[key]=url;else window.__avPending=1;}return url;}
 const dScene=new T.Scene();dScene.background=new T.Color(0x12161c);dScene.add(new T.HemisphereLight(0xffffff,0x202428,.8));const dKey=new T.DirectionalLight(0xffffff,1.4);dKey.position.set(1,2,1.5);dScene.add(dKey);const dRim=new T.DirectionalLight(0xe8382c,.8);dRim.position.set(-1,-.5,-1);dScene.add(dRim);
 const dCam=new T.OrthographicCamera(-.082,.082,.0256,-.0256,.01,5);dCam.position.set(0,.25,1);dCam.lookAt(0,0,0);const DW=768,DH=240;const dRT=new T.WebGLRenderTarget(DW,DH,{encoding:window.GFX_LIN?T.sRGBEncoding:T.LinearEncoding});const dartCache={};
 function dartShot(color,setup){setup=Object.assign({custom:!!save.flightCustom||!!(window.TOPS_flightReward&&TOPS_flightReward())},setup);const key=JSON.stringify([color,setup.shaft.id,setup.fl.id,setup.pt.id,setup.barrel.id,setup.custom]);if(dartCache[key])return dartCache[key];const d=makeDart(color,setup);d.rotation.y=Math.PI/2;d.rotation.z=-.08;d.rotation.x=.35;d.position.x=.004;dScene.add(d);/* render onto a transparent background and keep the real alpha (QA 22:59: no colour key from pixel 0,0) */const bg0=dScene.background,oc=new T.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();const buf=new Uint8Array(DW*DH*4);try{dScene.background=null;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(dRT);renderer.clear();renderer.render(dScene,dCam);renderer.readRenderTargetPixels(dRT,0,0,DW,DH,buf);}finally{/* QA 01:15: always restore, so a failed render can't leave the main view transparent or on the render target */renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);dScene.background=bg0;dScene.remove(d);}
  const c=document.createElement('canvas');c.width=DW;c.height=DH;const x=c.getContext('2d');const id=x.createImageData(DW,DH);const g=new Uint8Array(256);for(let i=0;i<256;i++)g[i]=Math.round(Math.pow(i/255,1/2.2)*255);for(let y=0;y<DH;y++){const src=(DH-1-y)*DW*4,dst=y*DW*4;for(let i=0;i<DW*4;i+=4){id.data[dst+i]=g[buf[src+i]];id.data[dst+i+1]=g[buf[src+i+1]];id.data[dst+i+2]=g[buf[src+i+2]];id.data[dst+i+3]=buf[src+i+3];}}x.putImageData(id,0,0);const url=c.toDataURL('image/png');dartCache[key]=url;return url;}
 function oppScreen(){if(!opp||!opp.visible)return null;const B=opp.userData.B;let w;if(B&&B.Head){w=boneW(B.Head);}else{w=opp.position.clone();w.y+=1.65;}const v=w.clone().project(camera);if(v.z>1)return null;return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight};}
 function mmToScreen(x,y){const w=new T.Vector3(boardC.x+x/1000,boardC.y-y/1000,boardC.z+.002);if(splitOn&&!previewOn&&!idleOn){const BP=lkRects().board;const v=w.clone().project(boardCam);if(v.z>1)return null;return {x:BP.x+(v.x+1)/2*BP.w,y:BP.y+(1-v.y)/2*BP.h,in:Math.abs(v.x)<=1&&Math.abs(v.y)<=1};}const v=w.clone().project(camera);if(v.z>1)return null;return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,in:Math.abs(v.x)<=1&&Math.abs(v.y)<=1};}
 function pointToBoardMM(cx,cy){if(!splitOn||previewOn||idleOn)return pointToBoardMM_main(cx,cy);const BP=lkRects().board;if(cx<BP.x||cx>BP.x+BP.w||cy<BP.y||cy>BP.y+BP.h)return null;const ndc=new T.Vector2((cx-BP.x)/BP.w*2-1,-((cy-BP.y)/BP.h)*2+1);const rc=new T.Raycaster();rc.setFromCamera(ndc,boardCam);const hit=rc.intersectObject(aimPlane)[0];if(!hit)return null;return {x:(hit.point.x-boardC.x)*1000,y:-(hit.point.y-boardC.y)*1000};}
 return {showRelMark,chars:CHARS,charKey,feelReticle,boardMmPerPx,retInfo:()=>frInfo,ghostsSet,ghostsClear,setSplit,title,isSplit:()=>splitOn,oppScreen,dartShot,portrait:headshot,heroShot,cheer,punchIn,cinema,myDart,oppDart,lkRects,lookPush,lookReact,lookSkip,lkPhone,lkCluster:()=>{if(!stuck.length)return null;let x=0,y=0;stuck.forEach(d=>{x+=d.position.x;y+=d.position.y;});x/=stuck.length;y/=stuck.length;return {x:(x-boardC.x)*1000,y:-(y-boardC.y)*1000};},_qa:{rigReady:()=>RIG.ready,dispose:o=>disposeTree(o),ret:st=>feelReticle(st),pf:()=>perfFlashOn(),opp:()=>opp,fp:()=>fpFig,gfx:()=>({ray:(()=>{if(!window.GFX_FACECAM)return null;const rc=new T.Raycaster();rc.setFromCamera({x:0,y:0},faceCam);const h=rc.intersectObjects(scene.children,true)[0];if(!h)return null;let o=h.object,path=[];while(o){path.push((o.name||o.type)+(o.geometry?':'+o.geometry.type:''));o=o.parent;}return {d:+h.distance.toFixed(2),p:h.point.toArray().map(v=>+v.toFixed(2)),path:path.slice(0,4),mat:h.object.material&&h.object.material.type,col:h.object.material&&h.object.material.color&&h.object.material.color.getHexString()};})(),exPos:extras.map(f=>{const h=f.userData.B&&f.userData.B.Hips;return [f.userData.ck,f.userData.act&&f.userData.act.getClip().name,f.position.toArray().map(v=>+v.toFixed(2)),h?h.getWorldPosition(new T.Vector3()).toArray().map(v=>+v.toFixed(2)):null];}),hair:HAIRLIB?Object.keys(HAIRLIB):(HAIR_WAIT?'loading':'none'),extras:extras.map(f=>(f.userData.ck||'?')+':'+(f.userData.act?f.userData.act.getClip().name+'@'+f.userData.act.time.toFixed(1):'none')),anims:ANIMS?Object.keys(ANIMS).length:0,rigs:Object.keys(RIGS),wait:Object.keys(RIG_WAIT),venue:Object.keys(VENUE_SC).map(k=>k+':'+(VENUE_SC[k]==='loading'?'loading':!!VENUE_SC[k])),me:me&&me.userData&&me.userData.ck,box:me?(()=>{const b=new T.Box3().setFromObject(me);return [b.min.toArray().map(v=>+v.toFixed(2)),b.max.toArray().map(v=>+v.toFixed(2))];})():null,head:me&&me.userData.B?me.userData.B.Head.getWorldPosition(new T.Vector3()).toArray().map(v=>+v.toFixed(2)):null,pos:me?me.position.toArray():null,vis:me?me.visible:null,face:faceCam.position.toArray().map(v=>+v.toFixed(2))}),T,scene,camera,renderer,makeFigure,poseFigure,makeHand,stance,armScene,armCam,fpArm,getHand:()=>hand,poseArm,lights,venue},_dbg:()=>({cam:camera.position.toArray(),camDir:camera.getWorldDirection(new T.Vector3()).toArray(),fov:camera.fov,camK,face:faceCam.position.toArray(),faceDir:faceCam.getWorldDirection(new T.Vector3()).toArray(),faceFov:faceCam.fov,faceAsp:faceCam.aspect,camAsp:camera.aspect}),buildVenue,frame,setOpponentLook,setPlayerLook,preview,idle,pointToBoardMM,mmToScreen,boardBottomY,fly,clearDarts,handWorld,oppHandWorld,shake,stuck,walkOn,walking:()=>performance.now()-walkT0<2800,tcCelebrate:()=>{try{if(me)playClip(me,'pump',{once:true,fade:.2});setTimeout(()=>{try{me&&playClip(me,'idle',{fade:.6});}catch(e){}},2600);}catch(e){}}};
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
const TT=[[0,50,1.9,2.4,13,28,660,74],[.3,38,2.2,2.1,11.2,30,630,62],[.6,26,2.6,1.7,8.6,31,600,52],[1,13,3.0,1.2,6.4,30,560,48]]; // L, sway A mm, loop s, tremor, perfect sigma, perfect ±ms, ms to tightest, start ring mm
function ttAt(L){L=Math.max(0,Math.min(1,L));let i=0;while(i<TT.length-2&&TT[i+1][0]<L)i++;const a=TT[i],b=TT[i+1],k=(L-a[0])/(b[0]-a[0]);const m=j=>a[j]+(b[j]-a[j])*k;return {A:m(1),T:m(2),tr:m(3),s0:m(4),P:m(5),D:m(6),R0:m(7)};}
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
function landFrom(lock,tp,dt){const e=Math.sign(dt)*Math.min(200,Math.max(0,Math.abs(dt)-tp.P));const r=ringR(dt,tp);const sg=r/1.794;const lean=Math.sign(dt)*.35*(r-1.794*tp.s0);/* v0.32: a perfect release never throws a wild one: scatter capped at 1.4 sigma */const pf=Math.abs(dt)<=tp.P;const gs=()=>{const v=gauss();return pf?Math.max(-1.4,Math.min(1.4,v)):v;};return {x:lock.x+gs()*sg*.95,y:lock.y+lean+gs()*sg*.85,e};}
function PM(){return (S&&S.pullMs)||PULL_MS;}
// release error in ms at a pull fraction
function relErrMs(pull){return (pull-SWEET)*PM();}
function perfectWin(){if(!S||S.bull)return 0;if(!window.TH_LEGACY){return throwParams().P/1000;}if(isRun())return 0;if(S.mp)return mpPerfectWin();const nv=effNerves();let w=.008+.001*lvOf('cn');w*=1-.4*Math.min(1,nv/2);const vis=S.visit?S.visit.reduce((a,v)=>a+(v.bust?0:v.v),0):0;const me=S.p[S.cur];if(S.dart===3&&(vis>=120||me.score<=50))w*=.75;return w;}
function isPerfect(){if(!S||S.over)return false;const dt=Math.abs(S.pull-SWEET+((S.relAdd||0)-(S.markerShift||0))/PM())*PM()/1000;const w=perfectWin();return w>0&&dt<=w;}
function currentSigma(){if(S&&S.mp)return mpSigma();const b=S.barrel;const nv=spreadNerves();const sk=save.arm/10;const dt=Math.abs(S.pull-SWEET)*PULL_MS/1000;const win=.42*b.tol*tolMult()*(1+.008*lvOf('cn'))/(1+nv*.22);const core=Math.min(1,dt/win);const F=Math.min(.9,(.16+.1*(1-sk))*(1+(isRun()?SK().floor:0))+nv*.045);const Smax=24*Math.pow(b.base/5.6,.3)*setupBaseMult()*armMult()*targetMult()*(1+(S.myForm||0));let s=Smax*(F+(1-F)*Math.pow(core,.75))+nv*.22*(.1+core);if(S.over)s=60;{const pw=perfectWin();if(pw>0){const dtp=Math.abs(S.pull-SWEET)*PULL_MS/1000;if(dtp<=pw)s*=.35;else if(dtp<=pw*2)s*=.35+.65*(dtp-pw)/pw;}}return s;}

// ===== INPUT =====
function setAim(x,y){const d=Math.hypot(x,y);if(d>180){x*=180/d;y*=180/d;}S.aim={x,y};}
let dragging=false;const cvEl=$('scene');
cvEl.addEventListener('pointerdown',e=>{audioInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();if(!S||S.done||S.busy||S.p[S.cur].ai||S.view===1)return;
 const p=V.pointToBoardMM(e.clientX,e.clientY);const onBoard=p&&Math.hypot(p.x,p.y)<260&&(V.isSplit()||e.clientY<V.boardBottomY());
 /* FEEL: board drag only aims; board pane outside the board does nothing; desktop player pane still pulls */
 if(onBoard){cvEl.setPointerCapture(e.pointerId);dragging=true;setAim(p.x,p.y);return;}
 if(!p&&feelPaneHold(e)){cvEl.setPointerCapture(e.pointerId);startPull('pane');}});
cvEl.addEventListener('pointermove',e=>{if(dragging){const p=V.pointToBoardMM(e.clientX,e.clientY);if(p)setAim(p.x,p.y);}});
cvEl.addEventListener('pointerup',e=>{if(dragging){dragging=false;return;}release(e,'pane');});
cvEl.addEventListener('pointercancel',()=>{dragging=false;cancelPull();});
addEventListener('keydown',e=>{const _su=$('setup');if(e.code==='Space'&&!e.repeat&&(!_su||_su.hidden)&&$('result').hidden){e.preventDefault();startPull('key');}/* FEEL: #setup no longer exists; Space was dead */
 if(!S||S.busy||S.p[S.cur].ai)return;const k={ArrowUp:[0,-2],ArrowDown:[0,2],ArrowLeft:[-2,0],ArrowRight:[2,0]}[e.code];if(k){e.preventDefault();setAim(S.aim.x+k[0],S.aim.y+k[1]);}});
addEventListener('keyup',e=>{if(e.code==='Space'){e.preventDefault();release(e,'key');}});
function startPull(src){if(S&&S.noPullUntil&&performance.now()<S.noPullUntil)return;if(!S||S.busy||S.done||S.p[S.cur].ai||S.pulling||S.view===1||S.breathe||V.walking())return;S.pullSrc=src||'key';S.pulling=true;S.over=false;S.pullStart=performance.now();S.pull=0;S.relAdd=(S.fx&&S.online&&S.fx.some(f=>f.tap))?70:0;S.pullMul=(S.fx&&S.online&&S.fx.some(f=>f.bar))?1/1.35:window.TH_LEGACY?Math.max(.75,Math.min(1.3,1+gauss()*jitter())):1;S.lastNerves=effNerves();S.pullMs=0;if(!window.TH_LEGACY){const tp=throwParams();S.lockTp=tp;S.pullMs=tp.D/SWEET;S.lock={x:S.aim.x+S.sway.x+gauss()*tp.tr*.6,y:S.aim.y+S.sway.y+gauss()*tp.tr*.6,t:performance.now()};S.lockOn=scoreAt(S.lock.x,S.lock.y).label===scoreAt(S.aim.x,S.aim.y).label;try{sfxLock();}catch(e){}}noiseBurst({dur:.12,freq:600,q:.5,gain:.05});
 if(ui.mode==='career'&&!S.practice){const opp=S.p[1];const pc=opp.rival?.18:(ui.tier===0?.08:0);if(Math.random()<pc){setTimeout(()=>{if(S&&S.pulling){banter('*cough*',opp.name);S.adren+=.6*(1+SK().press);}},250);}}}
function release(ev,src){if(!S||!S.pulling)return;if(src&&src!=='auto'&&S.pullSrc&&S.pullSrc!==src)return;S.pull=pullAt(feelStamp(ev)-(save.inputOffsetMs!=null?save.inputOffsetMs:((window.matchMedia&&matchMedia('(pointer:coarse)').matches)?35:0)));S.over=S.pull>=1.0;S.relMs=relErrMs(S.pull)+(S.relAdd||0)-(S.markerShift||0);/* FEEL: timestamp-based, never frame-derived */S.pulling=false;const perf=isPerfect();S.perfect=perf;{const me=S.p[S.cur];me.throws=(me.throws||0)+1;if(perf){me.perfects=(me.perfects||0)+1;if(!S.practice&&ui.mode==='career'&&career())career().perfects=(career().perfects||0)+1;}}const sig=currentSigma();{const d=S.relMs/1000;S.lastTiming=S.over?'Held':perf?'Perfect':Math.abs(d)<(window.TH_LEGACY?.03:Math.max(.03,perfectWin()*2))?'Flush':d<0?(d<-.12?'Early':'A touch early'):(d>.12?'Late':'A touch late');S.lastArrow=window.TH_LEGACY||perf?'':(S.over||d>0?' ↓':' ↑')+' '+Math.round(Math.abs(d*1000))+'ms';if(S.drill)S.drill.timings.push(S.over?.5:d);{const me=S.p[S.cur];if(d<-.03)me.early=(me.early||0)+1;else if(d>.03||S.over)me.late=(me.late||0)+1;}}S.pull=0;S.over=false;S.throwsMade++;save.totThrows=(save.totThrows||0)+1;if(S.throwsMade>=4)$('hint').style.opacity=0;feelAfterRelease(perf);
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
const EXTRA_NAMES=[['Gaz Tapsell','Mere Hohepa','Sione Fifita','Old Trev'],['Pania Walters','Brett Nuku','Carl Maddox','Ngaire Pou'],['Dion Harris','Taine Kerr','Logan Price','Maia Tuhoe','Stu Crawford','Jordan Fale'],['Hone Rata','Blair Simmons','Pita Lelei','Scott Mabey','Rangi Meihana','Josh Teddy','Cody Harwood','Kane Lister'],['Paul Lim','Lucas Cavanagh','Damon Heta','Simon Whitlock','Raymond Smith','Koha Kokiri'],['Ryan Searle','Josh Rock','Ross Smith','Danny Noppert','Jonny Clayton','Martin Schindler','Chris Dobey','Gabriel Clemens'],[]];
function seasonNeedsNew(c){return !c.run&&c.stage!=='intro'&&(!c.season||c.season.done);}
function newSeason(c){const t=TIERS[c.tier];const len=SEASON_LEN[c.tier];const n=((c.seasons||[]).filter(x=>x.tier===c.tier).length)+1;c.seasonN=n;const ko=c.tier===6;
 let pool=AINAMES[c.tier].concat(EXTRA_NAMES[c.tier]||[]);pool=pool.filter(x=>x!==RIVAL.name);
 // seeded shuffle so a repeated season looks different
 const seed=hash(save.name+c.tier+n);const sh=pool.map((nm,i)=>[nm,hash(nm+seed+i)]).sort((a,b)=>a[1]-b[1]).map(a=>a[0]);
 const count=ko?7:len;const names=sh.slice(0,count);if(!ko&&c.tier<=4)names[names.length-1]=RIVAL.name;
 const offs=ko?[-4,-2,0,2,4,6,8]:[-6,-5,-3,-2,-1,0,1,2,3,4,5,6,7];
 const table=names.map((nm,i)=>{const off=nm===RIVAL.name?4:(offs[(i+seed)%offs.length]+(n-1)*.5);return {name:nm,avg:Math.round(t.avg+off),pts:0,p:0,w:0,l:0,lf:0,la:0};});
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
 const r=await fetch(LB.url+'/rest/v1/rpc/tops_upsert',{method:'POST',headers:lbHeaders(),body:JSON.stringify({p:row})});LB.ok=r.ok;LB.cache=null;}catch(e){LB.ok=false;}}
async function lbFetch(){if(LB.cache&&Date.now()-LB.at<30000)return LB.cache;try{const r=await fetch(LB.url+'/rest/v1/tops_players?select=id,name,tier,matches,wins,avg,best_avg,best_leg,t180,hf,updated_at&order=avg.desc&limit=30',{headers:lbHeaders()});if(!r.ok)throw 0;LB.cache=await r.json();LB.at=Date.now();return LB.cache;}catch(e){return null;}}
async function renderBoard(){const host=$('hubBoard');if(!host)return;host.innerHTML='<p class="help">Loading…</p>';const rows=await lbFetch();if(!rows){host.innerHTML='<p class="help">Leaderboard unavailable. <button type="button" class="hx-link" onclick="renderBoard()">Retry</button></p>';return;}if(false){host.innerHTML='<p class="help">Leaderboard offline. It comes online once the table exists.</p>';return;}if(!rows.length){host.innerHTML='<p class="help">No one on the board yet. Finish a match and you’re on it.</p>';return;}
 const me=lbId().id;host.innerHTML=`<table class="lbt"><thead><tr><th>#</th><th>Player</th><th>Avg</th><th>Best leg</th><th>180s</th><th>High out</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.id===me?'me':''}"><td>${i+1}</td><td><b>${String(r.name).replace(/</g,'&lt;')}</b><small>${TIERS[Math.min(6,r.tier||0)].n} · ${r.wins}–${(r.matches||0)-(r.wins||0)}</small></td><td>${(+r.avg).toFixed(1)}</td><td>${r.best_leg||'–'}</td><td>${r.t180}</td><td>${r.hf||'–'}</td></tr>`).join('')}</tbody></table>`;}
function money(n){return (n<0?'-':'')+'$'+Math.abs(Math.round(n)).toLocaleString();}
function showTitle(){if(isRun())switchSlot('career');const c=career();const r=(save.slots&&save.slots.run&&save.slots.run.career)||null;$('btnRun').innerHTML=r?`<b>Continue the Run</b><small>Tier ${r.tier+1} · ${r.wins}–${r.losses} · ${'♥'.repeat(r.lives||0)}${'♡'.repeat(Math.max(0,3-(r.lives||0)))}</small>`:`<b>The Run</b><small>Three lives. Draft a card after every match. Climb the ladder.${save.runBest?` Best: ${save.runBest.won?'complete':'tier '+(save.runBest.tier+1)}, ${save.runBest.wins} wins.`:''}</small>`;$('btnNewRun').hidden=!r;$('btnContinue').hidden=!c;$('btnNewCareer').classList.toggle('alt',!!c);$('btnNewCareer').textContent=c?'Start a new career':'New career';if(c){$('btnContinue').innerHTML=`Continue career<small>${save.name||'You'} · ${TIERS[c.tier].n} · ${c.wins}–${c.losses} · ${money(c.bank)}</small>`;$('titleCard').hidden=false;$('tcPt').innerHTML=portraitImg(save.look,save.name,c.tier,'md');$('tcName').textContent=save.name||'You';$('tcLine').textContent=`${TIERS[c.tier].n} · ${c.wins}–${c.losses}`;$('tcBank').textContent=money(c.bank);}else $('titleCard').hidden=true;V.buildVenue(c?c.tier:0);V.setPlayerLook(save.look,save.flight);{const a=$('tlAuth');if(a){const u=save.cloudUser;a.innerHTML=u?`Signed in as <b>${u.name||'you'}</b> · career syncs to the cloud · <a href="#" id="tlOut">Sign out</a>`:`Guest · <a href="#" id="tlIn">Sign in with Google</a> to save your career to the cloud.`;const o=$('tlOut'),i=$('tlIn');if(o)o.onclick=e=>{e.preventDefault();netSignOut();};if(i)i.onclick=e=>{e.preventDefault();save.authSeen=false;showLogin();};}}showScreen('title');}
function hubTab(t){if(isRun()&&(t==='kit'||t==='board'||t==='practice'))t='play';hubTab.cur=t;[...$('hubTabs').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===t));document.querySelectorAll('#hub .htab').forEach(sec=>sec.hidden=sec.dataset.t!==t);const pn=document.querySelector('#hub .panel');if(pn)pn.scrollTop=0;}
function showHub(tab){const c=career(),t=TIERS[c.tier];if(!c.run&&seasonNeedsNew(c)){newSeason(c);}if(!c.next)c.next=nextOpponent();persist();const sn=(!c.run&&c.season)||null;if(sn&&!sn.midShown&&sn.week===Math.ceil(sn.len/2)+1&&!sn.done){sn.midShown=true;persist();showMsg(chapterMsg(c.tier,'mid'),()=>showHub(tab));return;}
 if(sn&&maybeSpareEvent(c,sn,()=>showHub(tab)))return;
 const run=!!c.run;const lt=TIERS[Math.max(0,c.tier-1)];V.setPlayerLook(save.look,save.flight,save.name,c.tier);$('hub').classList.toggle('run',run);
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
 syncHubAudio();V.buildVenue(c.tier);showScreen('hub');const tb=tab||(PR.pending?'practice':'play');hubTab(tb);drillBar();if(tb==='practice')renderPractice();if(tb==='player')showPlayer(true);if(tb==='kit')showShop(showShop.tab,true);renderBoard();}
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
function showCreator(editing){const L=save.look;$('cName').value=save.name||'';{const host=$('prefDbl');if(host){const opts=[20,16,18,12,10,8,'BULL'];host.innerHTML=opts.map(o=>`<button type="button" data-v="${o}" aria-pressed="${String(o)===String(prefDbl())}">${o==='BULL'?'Bull':'D'+o}</button>`).join('');[...host.children].forEach(b=>b.onclick=()=>{save.prefDbl=b.dataset.v==='BULL'?'BULL':+b.dataset.v;persist();[...host.children].forEach(x=>x.setAttribute('aria-pressed',x===b));});}}
 const CHAR_N={brian:'Brian',bryce:'Bryce',pete:'Pete',lewis:'Lewis',david:'David',leonard:'Leo',megan:'Megan',elizabeth:'Liz',remy:'Classic'};
 const refresh=()=>{V.setPlayerLook(save.look,save.flight,$('cName').value.trim()||save.name||'YOU',career()?career().tier:0);
  {const host=$('segChar');if(host){const cur=V.charKey(L,$('cName').value.trim()||save.name);host.innerHTML=V.chars.map(k=>`<button type="button" data-v="${k}" aria-pressed="${k===cur}">${CHAR_N[k]}</button>`).join('');[...host.children].forEach(b=>b.onclick=()=>{L.model=b.dataset.v;persist();refresh();});}
   {const isClassic=V.charKey(L,$('cName').value.trim()||save.name)==='remy';['swSkin','segHair','segBeard'].forEach(id=>{const f=$(id)&&$(id).closest('.field');if(f)f.hidden=!!host&&!isClassic;});}/* v0.42: shirt colour always pickable (rigged shirts use it), so unlocked shirts can be worn */{const f=$('swShirt')&&$('swShirt').closest('.field');if(f){f.hidden=false;const lb=f.querySelector('.label');if(lb)lb.textContent='Shirt colour';}}}
  {const seg=(id,opts,get,set)=>{const h=$(id);if(!h)return;h.innerHTML=opts.map(([v,t])=>`<button type="button" data-v="${v}" aria-pressed="${String(get())===String(v)}">${t}</button>`).join('');[...h.children].forEach(b=>b.onclick=()=>{set(b.dataset.v);persist();refresh();});};
   seg('segKit',[['','Plain']].concat(Object.entries(window.TOPS_KITS||{}).map(([k,v])=>[k,v.n])),()=>L.kit||'',v=>{L.kit=v||null;});seg('segHair2',[['own','Own'],['bald','Bald'],['short','Short'],['shaggy','Shaggy'],['curly','Curly'],['long','Long'],['pony','Pony']],()=>L.hair2||'own',v=>L.hair2=v);
   const sw=(id,list,get,set)=>{const w=$(id);if(!w)return;w.innerHTML='';list.forEach(([v,c])=>{const b=document.createElement('button');b.type='button';b.className='sw';b.style.background=c;if(!v){b.style.background='linear-gradient(135deg,#888 45%,#e8382c 46%,#e8382c 54%,#888 55%)';b.title='Natural';}b.setAttribute('aria-pressed',(get()||'')===v);b.onclick=()=>{set(v||null);persist();refresh();};w.appendChild(b);});};
   sw('swHair2',[['',''],['#141010','#141010'],['#3b2a1d','#3b2a1d'],['#6b4a2a','#6b4a2a'],['#a8783a','#a8783a'],['#e0c080','#e0c080'],['#8a3a1a','#8a3a1a'],['#a0a0a0','#a0a0a0']],()=>L.hairCol,v=>L.hairCol=v);
   sw('swSkin2',[['',''],['#fff0e6','#f2d6c4'],['#e6c4a8','#d8ac88'],['#c89a78','#b07c58'],['#9a6e50','#8a5a3c'],['#6e4a34','#5a3a28']],()=>L.skinTone,v=>L.skinTone=v);
   const ex=$('segExtra');if(ex){const opts=[['beard2','Beard'],['g1','Round specs'],['g2','Square specs'],['cap','Cap']];const on=k=>k==='g1'?L.glasses===1:k==='g2'?L.glasses===2:!!L[k];ex.innerHTML=opts.map(([k,t])=>`<button type="button" data-v="${k}" aria-pressed="${on(k)}">${t}</button>`).join('');[...ex.children].forEach(b=>b.onclick=()=>{const k=b.dataset.v;if(k==='g1')L.glasses=L.glasses===1?0:1;else if(k==='g2')L.glasses=L.glasses===2?0:2;else L[k]=L[k]?0:1;persist();refresh();});}}swatches('swSkin',SKINS,L.skin,v=>{L.skin=v;refresh();});swatches('swHair',HAIRS,L.hair,v=>{L.hair=v;refresh();});swatches('swShirt',SHIRTS,L.shirt,v=>{L.shirt=v;L.shirtTint=true;persist();refresh();});swatches('swFlight',FLIGHTS,save.flight,v=>{save.flight=v;save.flightCustom=true;refresh();});
  [...$('segHair').children].forEach(b=>{b.setAttribute('aria-pressed',b.dataset.v===L.hairStyle);b.onclick=()=>{L.hairStyle=b.dataset.v;refresh();};});[...$('segBeard').children].forEach(b=>{b.setAttribute('aria-pressed',+b.dataset.v===L.beard);b.onclick=()=>{L.beard=+b.dataset.v;refresh();};});
  const cb=$('cBarrels');cb.innerHTML='';BARRELS.filter(b=>save.owned.includes(b.id)).forEach(b=>{const el=document.createElement('button');el.type='button';el.className='opt';el.setAttribute('aria-pressed',save.barrel===b.id);el.innerHTML=`<span class="n">${b.n.match(/\d+g/)[0]}</span><span><div class="t">${b.n}</div><div class="s">${b.s}</div></span><span></span>`;el.onclick=()=>{save.barrel=b.id;refresh();};cb.appendChild(el);});};
 refresh();clearTimeout(showCreator.t);$('cName').oninput=()=>{clearTimeout(showCreator.t);showCreator.t=setTimeout(refresh,400);};$('btnCreate').textContent=editing?'Save':"That's me";$('cxTitle').textContent=editing?'Edit your look':'Create your player';$('btnCreatorBack').hidden=!editing;$('btnCreatorBack').onclick=()=>{V.preview(false);showHub('player');};[...$('cxSteps').children].forEach(bt=>bt.onclick=()=>{[...$('cxSteps').children].forEach(x=>x.setAttribute('aria-pressed',x===bt));document.querySelectorAll('#creator .cx-sec').forEach(sec=>sec.hidden=sec.dataset.s!==bt.dataset.s);});$('btnCreate').onclick=()=>{save.name=$('cName').value.trim()||'You';persist();V.preview(false);if(editing)showHub();else{newCareer();showMsg(STORY.intro,act=>{playNext();});}};V.buildVenue(0);showScreen('creator');}
function afterResult(L){if(ui.mode!=='career'){openMultiplayer();return;}
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
function fxTick(){if(fxC.width!==innerWidth||fxC.height!==innerHeight){fxC.width=innerWidth;fxC.height=innerHeight;}fxX.clearRect(0,0,fxC.width,fxC.height);if(!fxP.length)return;
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
$('btnPlayNext').onclick=playNext;feelBindSettle();/* FEEL: hold-to-breathe replaces tap settle */$('btnLocal').onclick=playLocal;$('btnPractice').onclick=playPractice;$('btnMoney').onclick=moneyMatch;$('btnShop').onclick=()=>showHub('kit');$('btnShopBack').onclick=()=>showHub();$('btnLook').onclick=()=>{$('hubPop').hidden=true;showCreator(true);};$('btnHubTitle').onclick=()=>{$('hubPop').hidden=true;showTitle();};$('btnHubMenu').onclick=()=>{const p=$('hubPop');p.hidden=!p.hidden;$('btnHubMenu').setAttribute('aria-expanded',!p.hidden);};document.addEventListener('pointerdown',e=>{if(!$('hubPop').hidden&&!e.target.closest('.hx-menu')){$('hubPop').hidden=true;}});$('btnHubSound').onclick=()=>{$('btnSound').onclick();syncHubAudio();syncTitleAudio();};$('btnHubCaller').onclick=()=>{$('btnCaller').onclick();syncHubAudio();syncTitleAudio();};
[...$('kitTabs').children].forEach(bt=>bt.onclick=()=>showShop(bt.dataset.t,true));[...$('hubTabs').children].forEach(bt=>bt.onclick=()=>{hubTab(bt.dataset.t);if(bt.dataset.t==='practice'){if(PR.view&&PR.view.kind==='result')PR.view=null;renderPractice();}if(bt.dataset.t==='player')showPlayer(true);if(bt.dataset.t==='kit')showShop(showShop.tab,true);if(bt.dataset.t==='board')renderBoard();});$('btnSkills').onclick=()=>showHub('player');$('btnSkillsBack').onclick=()=>showHub();$('btnPlPick').onclick=()=>showPerkPick(()=>showHub('player'));$('btnHubPick').onclick=()=>showPerkPick(showHub);$('btnPerkLater').onclick=()=>{$('perk').hidden=true;const d=window._perkDone;window._perkDone=null;if(career()){career().featBoost=false;persist();}if(d)d();else showHub('player');};
$('btnFriendsBack').onclick=()=>{onlineLeave();showTitle();};
$('btnResultNext').onclick=()=>{$('result').hidden=true;const last=S;S=null;const rem=!!(last&&last.online&&NET.chan);afterResult(last);if(rem){NET.ready=NET.seat!==0;mpTrack();renderLobby();netStatus(NET.seat===0?'Rematch: start when everyone is ready.':'Ready for the rematch. Waiting for the host.');try{trackEv('rematch');}catch(e){}}};
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
if(PAD){PAD.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();if(!padCanPull())return;try{PAD.setPointerCapture(e.pointerId);}catch(x){}S.padPtr=e.pointerId;startPull('pad');});
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
function tick(now){if(S&&!S.done){const t=(now-S.t0)/1000;const nv=effNerves();
  if(window.TH_LEGACY){const amp=2.0*S.barrel.sway*swayMult()*(1+nv*.4)*(0.7+armMult()*.3);S.sway={x:amp*(Math.sin(t*1.7)+.5*Math.sin(t*4.3+1)),y:amp*(Math.sin(t*2.1+2)+.5*Math.sin(t*3.7))};}
  else{if(!tick._p||now-tick._pt>250){tick._p=throwParams();tick._pt=now;}const tp=tick._p;S.tp=tp;
   if(S.pulling&&S.lock){S.sway={x:S.lock.x-S.aim.x,y:S.lock.y-S.aim.y};}else{S.sway=driftAt(now,tp);if(window.TOPS_DRUNK){const dd=TOPS_DRUNK(now);if(dd){S.sway.x+=dd.x;S.sway.y+=dd.y;}}}}
  if(S.pulling){S.pull=pullAt(performance.now());if(S.pull>=1.0)S.over=true;if(S.pull>=1.3)release(null,'auto');}S.inWin=S.pulling&&isPerfect();feelBreathe(now);
  const thr=targetHR();S.hr+=(thr-S.hr)*.02;const period=60000/S.hr;if(now-lastBeat>period){lastBeat=now;if(nv>1.2)sfxHeart();ecgBeat=now;if(!window.TH_LEGACY&&tick._p&&!(S.pulling&&S.lock))driftBeat(now,tick._p);}
  $('bpm').textContent=Math.round(S.hr);$('hr').classList.toggle('hot',S.hr>105);{const pc=nervePct();const me=S.p[S.cur];const mine=!me.ai&&!S.mateTurn&&!S.practice;$('hrNote').textContent=mine&&nv>.3?`${nerveCause()} · spread +${pc}%`:(mine?'Settled':'');$('btnSettle').hidden=!(S.breathe||(mine&&nv>.9&&!S.settled&&!S.pulling&&!S.busy));}ecgDraw(now,S.hr,nv);$('nerve').style.opacity=S.view===1?0:Math.min(.7,Math.max(0,nv-.8)*.22);sfxPubAmbience();
  if(S.fx&&S.fx.length)cardFxTick();S.nerves=nv;S.sigma=(!window.TH_LEGACY&&S.pulling&&S.lockTp)?ringR(relErrMs(S.pull)+(S.relAdd||0)-(S.markerShift||0),S.lockTp)/1.794:currentSigma();S.reader=false;feelPadTick(now);V.frame(now,S);}
 else{if(S){S.nerves=0;S.sigma=0;}feelPadTick(now);V.frame(now,S);}
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
const _newSeason=newSeason;newSeason=function(c){const sn=_newSeason(c);if(sn&&!sn.ko){const regs=regularsFor(c.tier).filter(n=>!sn.table.some(r=>r.name===n));const cands=sn.table.filter(r=>!r.you&&r.name!==RIVAL.name&&!OPPS[r.name]);regs.forEach((nm,i)=>{const row=cands[i];if(!row)return;const old=row.name;row.name=nm;sn.fixtures=sn.fixtures.map(f=>f===old?nm:f);});sn.formLog={};persist();}return sn;};
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
async function netBoot(){const hashAuth=/access_token=|refresh_token=|code=/.test(location.hash+location.search);
 try{const sb=await netLoad();const {data}=await sb.auth.getSession();if(data&&data.session){await netSignedIn(data.session.user);if(hashAuth)history.replaceState(null,'',location.pathname);}else{showLogin();}
  sb.auth.onAuthStateChange((ev,sess)=>{if(ev==='SIGNED_IN'&&sess&&(!NET.user||NET.user.id!==sess.user.id))netSignedIn(sess.user);if(ev==='SIGNED_OUT'){NET.user=null;save.cloudUser=null;persist();showLogin();}});
 }catch(e){console.warn('net boot',e);showLogin();const st=$('loginStatus');if(st)st.textContent='Can’t reach the server. Check your connection and try again.';}}
async function netSignedIn(user){NET.user=user;save.cloudUser={id:user.id,name:netUserName()};persist();const el=$('login');if(el)el.hidden=true;
 // pull cloud save
 try{const sb=NET.sb;const {data,error}=await sb.from('tops_saves').select('data,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;
  const cloud=data&&data.data;const localMatches=(save.matches||0);const cloudMatches=cloud?(cloud.matches||0):0;
  // cloud only: when signed in, the cloud save always wins; the device copy is never offered
  if(cloud&&(cloudMatches>0||cloud.career)){netAdopt(cloud);}
  else cloudPush(true);
 }catch(e){console.warn('cloud pull',e);}
 showTitle();}
function netAdopt(cloud){if(!cloud||cloud.season!==SEASON){cloudPush(true);return;}const keep={authSeen:true,cloudUser:save.cloudUser};save=Object.assign({},cloud,keep);if(!save.lb&&cloud.lb)save.lb=cloud.lb;/* #12: a cloud save written by v1.75 carries the old inflated opponents; migrate it too (idempotent) */try{window.TOPS_v11Migrate&&TOPS_v11Migrate();}catch(e){}persist();}
function cloudPush(now){if(!NET.user||!NET.sb)return;clearTimeout(NET.pushT);const go=async()=>{try{const row={user_id:NET.user.id,data:save,updated_at:new Date().toISOString()};const {error}=await NET.sb.from('tops_saves').upsert(row,{onConflict:'user_id'});if(error)throw error;NET.cloudAt=Date.now();}catch(e){console.warn('cloud push',e);}};if(now)go();else NET.pushT=setTimeout(go,2500);}
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
{const _sp=startPull;startPull=function(src){_sp(src);if(LES.on&&S&&S.pulling&&LES.n<3){LES.step='pull';lessonUI('Watch the ring','Holding locked your aim. The ring shrinks at the same speed every time. Let go when it\'s tightest: that ring is where the dart can land. Too early or too late and it opens up again.');}};}
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
if(!mpJoinFromUrl())netBoot();else netLoad().then(sb=>sb.auth.getSession()).then(r=>{const s=r&&r.data&&r.data.session;if(s){NET.user=s.user;save.cloudUser={id:s.user.id,name:netUserName()};persist();}}).catch(()=>{});
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
</script>
