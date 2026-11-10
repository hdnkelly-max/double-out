// node gen_seed.js > 004_seed.sql : catalogue from tc/data.js (the single source of truth)
global.window = {}; require('/home/claude/src/tc/data.js'); const D = window.TC_DATA;
const q = s => s == null ? 'null' : "'" + String(s).replace(/'/g, "''") + "'";
let o = '-- generated from tc/data.js: card catalogue + sets. Re-run when cards are added.\nbegin;\n';
o += 'insert into tc_card_sets(id,name,completion_cosmetic,sort) values\n' + D.SETS.map((s, i) => `(${q(s.id)},${q(s.name)},${q(s.reward)},${i})`).join(',\n') + '\non conflict (id) do update set name=excluded.name, completion_cosmetic=excluded.completion_cosmetic, sort=excluded.sort;\n';
o += 'insert into tc_cards(id,set_id,no,name,rarity,art_key,cosmetic_id,exclusive) values\n' + D.CARDS.map(c => `(${q(c.id)},${q(c.set)},${c.no},${q(c.name)},${q(c.rarity)},${q(c.art)},${q(c.cosmetic)},${c.exclusive})`).join(',\n') + '\non conflict (id) do update set set_id=excluded.set_id, no=excluded.no, name=excluded.name, rarity=excluded.rarity, art_key=excluded.art_key, cosmetic_id=excluded.cosmetic_id, exclusive=excluded.exclusive;\ncommit;\n';
process.stdout.write(o);
