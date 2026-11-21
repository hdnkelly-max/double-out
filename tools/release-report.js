#!/usr/bin/env node
// RELEASE WATCHER (Hayden approved Sat 19:59): one release.yml run -> one JSON entry for the RELEASES row.
// usage: node tools/release-report.js <run_id> [attempt]   (needs gh; GH_TOKEN with actions: read)
// Reads only GitHub's own record of the run: run name (dispatch inputs), job and step outcomes, error annotations, and the log
// lines release.yml prints for versions, rollbacks and artifact waits. Prints the entry on stdout.
const { execFileSync } = require('child_process');
const REPO = process.env.GITHUB_REPOSITORY || 'hdnkelly-max/double-out';
const [id, att] = [process.argv[2], process.argv[3]];
if (!/^\d+$/.test(id || '')) { console.error('usage: release-report.js <run_id> [attempt]'); process.exit(2); }
const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', maxBuffer: 256 << 20 });
const api = p => JSON.parse(gh('api', p));
let run = api(`repos/${REPO}/actions/runs/${id}`);
if (att && +att !== run.run_attempt) run = api(`repos/${REPO}/actions/runs/${id}/attempts/${att}`);
const jobs = api(`repos/${REPO}/actions/runs/${id}/attempts/${run.run_attempt}/jobs?per_page=50`).jobs;
// dispatch inputs, from the run name release.yml sets: "R1 | item | commit=.. | tree=.. | ... | mode=release | attest=qa"
const parts = String(run.display_title || '').split(' | ');
const kv = Object.fromEntries(parts.slice(2).map(s => [s.split('=')[0], s.slice(s.indexOf('=') + 1)]));
const job = n => jobs.find(j => j.name === n) || {};
const step = (j, re) => (j.steps || []).find(s => re.test(s.name)) || {};
const gate = job('gate_build'), pub = job('publish');
// error annotations: the REFUSED / NOT RELEASED / RECHECK / LIVE / ROLLBACK lines release.yml writes (not the generic exit-code ones)
const ann = [];
let partial = false;   // a failed read is said, never mistaken for a release failure (ChatGPT P3)
for (const j of jobs) { if (!j.id) continue; try { for (const a of api(`repos/${REPO}/check-runs/${j.id}/annotations?per_page=50`)) if (a.annotation_level === 'failure') ann.push(a.message.split('\n')[0].trim()); } catch (e) { partial = true; } }
// the reason: first sentence of each, generic lines dropped, the specific line first (RECHECK before NOT RELEASED)
const first = m => m.replace(/^(.{20,}?[.!?])\s.*$/, '$1');
const rank = m => /^(REFUSED|RECHECK|LIVE|ROLLBACK|SYNC|DEPLOY|TEST)\b/.test(m) ? 0 : /^Error:/.test(m) ? 1 : /^NOT RELEASED/.test(m) ? 2 : 3;
const why = [...new Set(ann.filter(m => !/^Process completed with exit code|^Fetching artifact metadata failed/.test(m)).map(first))].sort((x, y) => rank(x) - rank(y));
// the run's log: version, rollback target, artifact waits (lines release.yml prints itself; command echoes are skipped)
let log = ''; try { log = gh('run', 'view', String(id), '--repo', REPO, '--attempt', String(run.run_attempt), '--log'); } catch (e) { if (run.status === 'completed') partial = true; }
const out = log.split('\n').map(l => l.replace(/^[^\t]*\t[^\t]*\t\S+ /, '')).filter(l => !/\[36;1m|^##\[group\]Run /.test(l));
const m1 = re => { for (const l of out) { const m = l.match(re); if (m) return m; } return null; };
// the publish job's env dump prints V (this release) and the rollback steps' PV (the version rolled back to)
const version = (m1(/^\s+V: (\d+\.\d+)\s*$/) || [])[1] || null;
const waits = []; for (const l of out) { const m = l.match(/^ARTIFACT: `?([\w.-]+)`? listed after (\d+) s/); if (m && !waits.some(w => w.name === m[1])) waits.push({ name: m[1], secs: +m[2] }); }
const notListed = out.filter(l => /ARTIFACT: .* still not listed/.test(l)).length;
const rb = m1(/^\s+PV: (\d+\.\d+)\s*$/);
// deploy attempts that ran (continue-on-error steps report 'success' even when they failed, so count by name)
const deploys = (pub.steps || []).filter(s => /deploy-pages/.test(s.name) && s.conclusion !== 'skipped');
const rbStart = (pub.steps || []).findIndex(s => /^Prepare rollback/.test(s.name));
const tries = deploys.filter(s => rbStart < 0 || (pub.steps || []).indexOf(s) < rbStart).length;
const live = step(pub, /^Live check/), restore = step(pub, /^Restore main/), verify = step(pub, /^Verify the rollback/);
const t = x => x ? Date.parse(x) : null, secs = (a, b) => (a && b) ? Math.round((t(b) - t(a)) / 1000) : null;
const dry = kv.mode === 'dry_run';
let result;
if (run.status !== 'completed') result = 'running';
else if (run.conclusion === 'cancelled') result = 'cancelled';
else if (dry) result = run.conclusion === 'success' ? 'dry run ok' : 'dry run refused';
else if (run.conclusion === 'success' && live.conclusion === 'success') result = 'live';
else if (gate.conclusion && gate.conclusion !== 'success') result = why.some(m => /^REFUSED/.test(m)) ? 'refused' : 'not released';
else if (restore.conclusion === 'success') result = 'failed, rolled back';
else if (live.conclusion === 'success') result = 'live (follow-up failed)';
else result = 'failed';
const entry = {
  run_id: +id, attempt: run.run_attempt, url: run.html_url, branch: run.head_branch, event: run.event,
  at: run.run_started_at || run.created_at, done: run.updated_at, result, version,
  risk: parts[0] || null, item: (parts[1] || '').slice(0, 160) || null, commit: (kv.commit || '').slice(0, 12) || null, mode: kv.mode || null,
  reason: why.slice(0, 3).join(' / ').slice(0, 300) || null,
  deploy_tries: tries || null,
  rollback: rbStart >= 0 && step(pub, /^Prepare rollback/).conclusion === 'success' ? { to: rb ? rb[1] : null, verified: verify.conclusion === 'success', main_restored: restore.conclusion === 'success' } : null,
  artifact_wait: waits.length ? waits : null, artifact_not_listed: notListed || null,
  secs_total: secs(run.run_started_at || run.created_at, run.updated_at),
  secs_to_live: live.conclusion === 'success' ? secs(run.run_started_at || run.created_at, live.completed_at) : null, partial };
process.stdout.write(JSON.stringify(entry) + '\n');
