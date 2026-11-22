// Supabase edge function "release-report" (RELEASE WATCHER, Hayden approved Sat 19:59). Deployed with verify_jwt=false: it checks its own token.
// The caller is GitHub Actions: .github/workflows/release-report.yml on main asks GitHub for an OIDC token (audience tops-release-report)
// and posts one entry from tools/release-report.js. No secret is stored anywhere: GitHub signs the token, this checks the signature
// (GitHub's published keys), the repository and owner ids, the exact workflow file and the branch. Then it stores the entry in
// tops_release_log (private table) and rewrites ONLY the RELEASES row of tops_pipeline. Anything else is refused.
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const ISS = "https://token.actions.githubusercontent.com";
const JWKS = createRemoteJWKSet(new URL(ISS + "/.well-known/jwks"));
const AUD = "tops-release-report";
const REPO = "hdnkelly-max/double-out", REPO_ID = "1449999381", OWNER_ID = "306334683";
const WF = REPO + "/.github/workflows/release-report.yml@";
const REFS = ["refs/heads/main"];   // main only (the proof briefly allowed its branch and push events)
const RESULTS = ["live", "live (follow-up failed)", "refused", "not released", "failed, rolled back", "failed", "dry run ok", "dry run refused", "cancelled", "running",
  "rollback check ok", "rollback refused", "rolled back by hand", "redeployed (no change)", "rollback NOT confirmed", "rollback failed"];   // rollback.yml runs
const KEEP = 12;
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const j = (s: number, o: unknown) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

const str = (v: unknown, n: number) => v == null ? null : String(v).replace(/[\u0000-\u001f]/g, " ").slice(0, n);
const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 1e13) ? v : null;
function clean(e: any) {
  if (!e || typeof e !== "object") return null;
  const run_id = int(e.run_id), attempt = int(e.attempt) || 1;
  if (!run_id || !RESULTS.includes(e.result)) return null;
  if (e.branch !== "main") return null;   // branch runs of release.yml are workflow tests, not releases
  const waits = Array.isArray(e.artifact_wait) ? e.artifact_wait.slice(0, 8).map((w: any) => ({ name: str(w?.name, 60), secs: int(w?.secs) })) : null;
  const rb = e.rollback && typeof e.rollback === "object" ? { to: str(e.rollback.to, 12), verified: !!e.rollback.verified, main_restored: !!e.rollback.main_restored, from: str(e.rollback.from, 12) } : null;
  return { run_id, attempt, url: `https://github.com/${REPO}/actions/runs/${run_id}`, branch: "main", event: str(e.event, 30),
    at: str(e.at, 30), done: str(e.done, 30), result: e.result, version: /^\d+\.\d+$/.test(e.version || "") ? e.version : null,
    risk: str(e.risk, 4), item: str(e.item, 160), commit: str(e.commit, 12), mode: str(e.mode, 20), reason: str(e.reason, 400),
    deploy_tries: int(e.deploy_tries), rollback: rb, artifact_wait: waits, artifact_not_listed: int(e.artifact_not_listed),
    secs_total: int(e.secs_total), secs_to_live: int(e.secs_to_live), partial: e.partial === true };
}
// ChatGPT P1-1: order-independent. A report never moves a run backwards: 'running' can't replace a finished result, and an older
// read (smaller 'done') can't replace a newer one. Reports arriving in any order end in the same row.
function newer(old: any, e: any) {
  if (!old) return true;
  if (old.result !== "running" && e.result === "running") return false;
  if (old.result !== "running" && e.result !== "running" && old.done && e.done && Date.parse(e.done) < Date.parse(old.done)) return false;
  return true;
}
const nz = (iso: string | null) => iso ? new Intl.DateTimeFormat("en-NZ", { timeZone: "Pacific/Auckland", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)).replace(",", "") : "?";
const dur = (s: number | null) => s == null ? "?" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
function line(e: any) {
  const v = e.version ? `v${e.version} ` : "";
  const head: Record<string, string> = {
    "live": `${v}LIVE`, "live (follow-up failed)": `${v}LIVE (a step after the live check failed)`, "refused": "REFUSED at the gate",
    "not released": "NOT RELEASED (recheck failed)", "failed, rolled back": `${v}FAILED, rolled back`, "failed": `${v}FAILED (check main and live by hand)`,
    "dry run ok": "dry run ok", "dry run refused": "dry run refused", "cancelled": "cancelled", "running": "running",
    "rollback check ok": "ROLLBACK check ok (nothing deployed)", "rollback refused": "ROLLBACK refused", "rolled back by hand": `ROLLED BACK by hand to ${v.trim()}`,
    "redeployed (no change)": `${v}redeployed (no change for players)`, "rollback NOT confirmed": "ROLLBACK NOT CONFIRMED (state for a human)", "rollback failed": "ROLLBACK failed" };
  const bits = [`${nz(e.at)} · ${head[e.result] || e.result}`];
  if (e.rollback) bits.push(`${e.rollback.from ? "from v" + e.rollback.from + " " : ""}to v${e.rollback.to ?? "?"} (${e.rollback.verified ? "verified live" : "NOT verified"}, main ${e.rollback.main_restored ? "restored" : "NOT restored"})`);
  bits.push(`${e.risk ?? ""} ${e.item ?? ""}`.trim());
  if (e.secs_to_live != null) bits.push(`request to live ${dur(e.secs_to_live)}`); else bits.push(`run ${dur(e.secs_total)}`);
  if (e.deploy_tries && e.deploy_tries > 1) bits.push(`${e.deploy_tries} deploy tries`);
  if (e.artifact_wait) bits.push("artifact listed after " + e.artifact_wait.map((w: any) => `${w.secs}s`).join("/"));
  if (e.artifact_not_listed) bits.push(`artifact never listed x${e.artifact_not_listed}`);
  if (e.reason) bits.push(`why: ${e.reason}`);
  if (e.partial) bits.push("(partial read: a GitHub API call failed, details may be missing)");
  bits.push(`run ${e.run_id}${e.attempt > 1 ? " try " + e.attempt : ""}`);
  return "- " + bits.join(" · ");
}
async function render() {
  const { data, error } = await db.from("tops_release_log").select("entry").order("at", { ascending: false }).limit(KEEP);
  if (error) throw error;
  const es = (data || []).map((r: any) => r.entry);
  const n = (r: string) => es.filter((e: any) => e.result === r).length;
  const lt = es.map((e: any) => e.secs_to_live).filter((x: any) => x != null).sort((a: number, b: number) => a - b);
  const med = lt.length ? lt[Math.floor((lt.length - 1) / 2)] : null;
  const lastLive = es.find((e: any) => e.result.startsWith("live") || e.result === "rolled back by hand");
  const sum = `Last ${es.length}: ${n("live")} live, ${n("failed, rolled back")} rolled back, ${n("refused")} refused, ${n("not released")} not released` + (n("rolled back by hand") ? `, ${n("rolled back by hand")} rolled back by hand` : "") + (n("rollback NOT confirmed") ? `, ${n("rollback NOT confirmed")} ROLLBACK NOT CONFIRMED` : "") +
    (n("failed") ? `, ${n("failed")} FAILED without rollback` : "") + (med != null ? `. Median request to live ${dur(med)}.` : ".");
  const now = `Release results, newest first. Filled automatically by the release watcher from every release.yml run on main (GitHub's own record: result, version, why, rollback, deploy tries, artifact wait; rollback.yml runs too). Updated ${nz(new Date().toISOString())}.\n${sum}\n` + es.map(line).join("\n");
  const upd: Record<string, unknown> = { now, updated_by: "release watcher", updated_at: new Date().toISOString(),
    title: "Release results, newest first (release watcher, automatic)", stage: "live" };
  if (lastLive?.version) { upd.version = lastLive.version; upd.live_at = lastLive.done; }
  const { error: e2 } = await db.from("tops_pipeline").update(upd).eq("id", "RELEASES");
  if (e2) throw e2;
  return es.length;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return j(405, { error: "POST only" });
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!tok) return j(401, { error: "no token" });
  let c: any;
  try { ({ payload: c } = await jwtVerify(tok, JWKS, { issuer: ISS, audience: AUD, algorithms: ["RS256"], requiredClaims: ["exp", "iat", "jti"], clockTolerance: 60, maxTokenAge: "15m" })); }
  catch (_e) { return j(401, { error: "token not valid" }); }
  if (c.repository !== REPO || String(c.repository_id) !== REPO_ID || String(c.repository_owner_id) !== OWNER_ID) return j(403, { error: "wrong repository" });
  if (!String(c.workflow_ref || "").startsWith(WF) || !REFS.includes(String(c.workflow_ref).slice(WF.length))) return j(403, { error: "wrong workflow or branch" });
  // ChatGPT P1-1: the token's own ref too (a branch, the one the workflow file came from)
  if (c.ref_type !== "branch" || !REFS.includes(String(c.ref))) return j(403, { error: "wrong ref" });
  if (!["workflow_run", "workflow_dispatch"].includes(c.event_name)) return j(403, { error: "wrong event" });
  const raw = await req.text(); if (raw.length > 65536) return j(413, { error: "too big" });
  let body: any; try { body = JSON.parse(raw); } catch (_e) { return j(400, { error: "bad json" }); }
  const list = (Array.isArray(body) ? body : [body]).slice(0, 20).map(clean);
  if (!list.length || list.some((x) => !x)) return j(400, { error: "bad entry (needs run_id, a known result, branch main)" });
  // ChatGPT P2: each token writes once (a replayed token is refused); old jtis pruned
  const { error: je } = await db.from("tops_release_jti").insert({ jti: String(c.jti) });
  if (je) return j(409, { error: "token already used" });
  await db.from("tops_release_jti").delete().lt("at", new Date(Date.now() - 86400000).toISOString());
  let stored = 0, kept = 0;
  for (const e of list) {
    const { data: old } = await db.from("tops_release_log").select("entry").eq("run_id", e!.run_id).eq("attempt", e!.attempt).maybeSingle();
    if (!newer(old?.entry, e)) { kept++; continue; }
    const { error } = await db.from("tops_release_log").upsert({ run_id: e!.run_id, attempt: e!.attempt, at: e!.at, result: e!.result, version: e!.version, entry: e, updated_at: new Date().toISOString() });
    if (error) return j(500, { error: "store failed" });
    stored++;
  }
  try { const n = await render(); return j(200, { ok: true, stored, kept_newer: kept, shown: n }); }
  catch (_e) { return j(500, { error: "render failed" }); }
});
