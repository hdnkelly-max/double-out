// EXP-VOICE: every caller/crowd/walk-on voice file the game can request exists in assets/voice, and the caller only asks
// for scores that can happen (no 404s on phones). usage: node tests/voice-files.js [path to assets/voice]
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const dir = process.argv[2] || path.join(root, 'assets', 'voice');
const have = new Set(fs.readdirSync(dir).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)));
const fails = [];

// 1. the caller's preload list (v04.js voiceNames)
const v04 = fs.readFileSync(path.join(root, 'v04.js'), 'utf8');
const m = v04.match(/function voiceNames\(\)\{[\s\S]*?return names;\}/);
if (!m) fails.push('voiceNames() not found in v04.js');
const names = m ? new Function(m[0] + ';return voiceNames();')() : [];
names.filter(n => !have.has(n)).forEach(n => fails.push('caller asks for missing ' + n + '.mp3'));

// 2. scores that can't happen are never requested, and every score that can happen is
const one = [0, 25, 50]; for (let i = 1; i <= 20; i++) one.push(i, 2 * i, 3 * i);
const visit = new Set(); one.forEach(a => one.forEach(b => one.forEach(c => visit.add(a + b + c))));
[163, 166, 169, 172, 173, 175, 176, 178, 179].forEach(n => { if (visit.has(n)) fails.push('test table wrong: ' + n); if (names.includes('s' + n)) fails.push('caller asks for impossible visit s' + n); });
[159, 162, 163, 165, 166, 168, 169].forEach(n => { if (names.includes('r' + n)) fails.push('caller asks for impossible checkout r' + n); });
for (let n = 0; n <= 180; n++) if (visit.has(n) && !names.includes('s' + n)) fails.push('possible visit s' + n + ' not preloaded');
['r170', 'r2', 'r50', 'r100', 's180', 's0', 's100', 's140'].forEach(n => { if (!names.includes(n)) fails.push('expected ' + n + ' in the list'); });

// 3. every other literal voice file in the game's code
const src = fs.readdirSync(root).filter(f => /\.js$/.test(f) && f !== 'build.js').concat(fs.existsSync(path.join(root, 'tc')) ? fs.readdirSync(path.join(root, 'tc')).filter(f => f.endsWith('.js')).map(f => 'tc/' + f) : []);
const lits = new Set();
src.forEach(f => { const t = fs.readFileSync(path.join(root, f), 'utf8'); (t.match(/assets\/voice\/[A-Za-z0-9_]+\.mp3/g) || []).forEach(x => lits.add(x.slice(13, -4))); });
['crowd_1', 'crowd_2', 'crowd_3', 'crowd_4', 'pub_1', 'pub_2', 'pub_3', 'pub_4', 'pub_5'].forEach(n => lits.add(n));   // built as 'crowd_'+i / 'pub_'+i in v09.js
[...lits].filter(n => !have.has(n)).forEach(n => fails.push('code names missing ' + n + '.mp3'));

console.log(JSON.stringify({ dir, files: have.size, callerList: names.length, literals: [...lits].sort(), fails }));
console.log(fails.length ? 'voice-files FAIL' : 'voice-files PASS');
process.exit(fails.length ? 1 : 0);
