// ===== TOPS collectibles: data (cards, sets, rewards, tiers, legends, trophies) =====
window.TC_DATA = (function () {
  const A = 'assets/cards/art/';
  const SETS = [
    { id: 'regulars', name: 'Kauri Arms Regulars', reward: 'title_local' },
    { id: 'venues', name: 'Venues', reward: 'cel_chant' },
    { id: 'moments', name: 'Big Moments', reward: 'cel_confetti' },
    { id: 'disasters', name: 'Darts Disasters', reward: 'title_disaster' },
    { id: 'kit', name: 'The Kit', reward: 'flight_steel' },
    { id: 'legends', name: 'Ally Pally Legends', reward: 'walk_lasers' },
    { id: 'nineclub', name: 'Nine-Dart Club', reward: null, exclusive: true },
    { id: 'exhibitions', name: 'Exhibition Nights', reward: null, exclusive: true },
  ];
  // rarity, set, reward (cosmetic id or null)
  const CARDS = [
    ['deano', 1, 'Deano', 'regulars', 'epic', 'wear_mullet'],
    ['shazza', 2, 'Shazza', 'regulars', 'rare', 'wear_towel'],
    ['tama', 3, 'Tama', 'regulars', 'uncommon', 'flight_club'],
    ['kev', 4, 'Kev Mercer', 'regulars', 'epic', 'wear_ciggie'],
    ['mo', 5, 'Mo Rangi', 'regulars', 'common', null],
    ['kauri', 6, 'The Kauri Arms', 'venues', 'common', null],
    ['club', 7, 'Club Night', 'venues', 'common', null],
    ['palace', 8, 'The Palace', 'venues', 'epic', 'walk_smoke'],
    ['the170', 9, 'The 170', 'moments', 'rare', 'cel_goldflash'],
    ['nine', 10, 'Nine-Darter', 'moments', 'legendary', 'cel_pyro'],
    ['madhouse', 11, 'Madhouse', 'disasters', 'common', null],
    ['fly', 12, 'The Fly', 'disasters', 'uncommon', 'title_antkiller'],
    ['loan', 13, "Kev's Loan", 'disasters', 'common', null],
    ['robin', 14, 'Robin Hood', 'moments', 'epic', 'wear_eyepatch'],
    ['barrel', 15, 'Tungsten 90', 'kit', 'uncommon', 'barrel_gold'],
    ['chalk', 16, 'The Chalkboard', 'regulars', 'common', null],
    ['trophy', 17, 'Club Champs', 'kit', 'rare', 'wear_flatcap'],
    ['taylor', 18, 'Phil Taylor', 'legends', 'legendary', 'walk_power'],
    ['littler', 19, 'Luke Littler', 'legends', 'legendary', 'cel_nuke'],
    ['mvg', 20, 'Michael van Gerwen', 'legends', 'epic', 'cel_green'],
    // exclusives: never rolled
    ['ninex', 100, 'Nine-Dart Club', 'nineclub', 'legendary', 'flight_gold', true],
    ['ticket', 101, 'Exhibition Ticket', 'exhibitions', 'common', null, true],
  ].map(([id, no, name, set, rarity, cos, ex]) => ({ id, no, name, set, setName: (SETS.find(s => s.id === set) || {}).name, rarity, cosmetic: cos, exclusive: !!ex,
    art: A + ({ taylor: 'power', littler: 'nuke', mvg: 'green' }[id] || id) + '.webp' }));

  // cosmetic rewards. slot = where it equips. Nothing here touches throw maths.
  const COS = {
    wear_mullet:   { slot: 'hair',   n: 'The Deano mullet', kind: 'wear' },
    wear_towel:    { slot: 'shoulder', n: "Shazza's tea towel", kind: 'wear' },
    wear_ciggie:   { slot: 'mouth',  n: 'Cigarette', kind: 'wear' },
    wear_eyepatch: { slot: 'face',   n: 'Pirate eye patch', kind: 'wear' },
    wear_flatcap:  { slot: 'hat',    n: 'Flat cap', kind: 'wear' },
    flight_club:   { slot: 'flight', n: 'Club flights (black and lime)', kind: 'kit', flight: '#C6F36B' },
    flight_steel:  { slot: 'flight', n: 'Brushed steel flights', kind: 'kit', flight: '#9AA7A5' },
    flight_gold:   { slot: 'flight', n: 'Nine-Dart Club gold flights', kind: 'kit', flight: '#C49A52' },
    barrel_gold:   { slot: 'barrel', n: 'Gold knurled barrel finish', kind: 'kit', barrel: 0xC49A52 },
    cel_goldflash: { slot: 'checkout', n: 'Gold board flash', kind: 'cel' },
    cel_pyro:      { slot: 'max', n: 'Pyro on 180', kind: 'cel' },
    cel_nuke:      { slot: 'max', n: 'The Nuke 180', kind: 'cel' },
    cel_confetti:  { slot: 'max', n: 'Confetti cannons on 180', kind: 'cel' },
    cel_chant:     { slot: 'max', n: 'Crowd chants your name on 180', kind: 'cel' },
    cel_green:     { slot: 'win', n: 'Green stage lights on a win', kind: 'cel' },
    walk_smoke:    { slot: 'walkon', n: 'Stage smoke walk-on', kind: 'cel' },
    walk_lasers:   { slot: 'walkon', n: 'Laser walk-on', kind: 'cel' },
    walk_power:    { slot: 'walkon', n: 'The Power walk-on', kind: 'cel' },
    title_antkiller: { slot: 'title', n: 'Ant Killer', kind: 'title' },
    title_local:   { slot: 'title', n: 'Kauri Arms Local', kind: 'title' },
    title_disaster:{ slot: 'title', n: 'Disaster Magnet', kind: 'title' },
    title_ninec:   { slot: 'title', n: 'Nine-Dart Club', kind: 'title' },
    title_power:   { slot: 'title', n: 'Beat The Power', kind: 'title' },
    title_nuke:    { slot: 'title', n: 'Survived The Nuke', kind: 'title' },
    title_mvg:     { slot: 'title', n: 'Green Machine Slayer', kind: 'title' },
  };
  const SLOTS = [['hat', 'Hat'], ['face', 'Face'], ['mouth', 'Mouth'], ['hair', 'Hair'], ['shoulder', 'Shoulder'], ['flight', 'Flights'], ['barrel', 'Barrel'],
    ['max', '180 celebration'], ['checkout', 'Big checkout'], ['win', 'Match win'], ['walkon', 'Walk-on'], ['title', 'Title']];

  // tiered achievements: bronze / silver / gold. Each tier = 1 pick.
  const TIERS = [
    { id: 'tier180', n: 'Maximums', d: n => `Throw ${n} 180s`, stat: 'max', lv: [5, 25, 100] },
    { id: 'tierton', n: 'Ton Out', d: n => `${n} checkouts of 100+`, stat: 'ton', lv: [5, 25, 100] },
    { id: 'tier140', n: 'Big Finish', d: n => `${n} checkouts of 140+`, stat: 'f140', lv: [3, 10, 25] },
    { id: 'tierbull', n: 'Bull Finisher', d: n => `Finish ${n} legs on the bull`, stat: 'bullout', lv: [3, 10, 25] },
    { id: 'tierperf', n: 'Silk Release', d: n => `${n} perfect releases`, stat: 'perf', lv: [100, 500, 2000] },
    { id: 'tierleg', n: 'Quick Legs', d: n => `Win ${n} legs in 15 darts or fewer`, stat: 'leg15', lv: [5, 25, 100] },
    { id: 'tierwin', n: 'Winner', d: n => `Win ${n} matches`, stat: 'wins', lv: [10, 50, 200] },
    { id: 'tier26', n: 'Drink Bitch', d: n => `Throw ${n} 26s`, stat: 's26', lv: [10, 50, 150] },
  ];
  const TIER_NAMES = ['Bronze', 'Silver', 'Gold'];

  // exhibition legends: real names, private game. Avg = level they play at.
  const LEGENDS = [
    { id: 'taylor', name: 'Phil Taylor', nick: 'The Power', avg: 101, card: 'taylor', cos: 'title_power', blurb: '16-time world champion. Still averages a ton at exhibitions.' },
    { id: 'littler', name: 'Luke Littler', nick: 'The Nuke', avg: 103, card: 'littler', cos: 'title_nuke', blurb: 'World champion at 17. He does not miss doubles.' },
    { id: 'mvg', name: 'Michael van Gerwen', nick: 'Mighty Mike', avg: 100, card: 'mvg', cos: 'title_mvg', blurb: 'Three world titles. Scores like a machine, celebrates louder.' },
  ];

  // one trophy per title. Tier index -> title
  const TROPHIES = [
    { id: 'club_night', n: 'Kauri Arms Pub League', img: 'tr_club_night' },
    { id: 'club_champs', n: 'RSA Club Singles', img: 'tr_club_champs' },
    { id: 'regional', n: 'Regional Super League', img: 'tr_regional' },
    { id: 'dpnz', n: 'DPNZ ProTour', img: 'tr_dpnz' },
    { id: 'trans_tasman', n: 'Trans-Tasman Championship', img: 'tr_trans_tasman' },
    { id: 'pro_tour', n: 'Players Championship', img: 'tr_pro_tour' },
    { id: 'palace', n: 'World Champion', img: 'tr_palace' },
  ];
  const ODDS = { common: .60, uncommon: .25, rare: .11, epic: .035, legendary: .005 };
  const PITY = { start: 160, hard: 240, top: .25 };
  return { SETS, CARDS, COS, SLOTS, TIERS, TIER_NAMES, LEGENDS, TROPHIES, ODDS, PITY };
})();
