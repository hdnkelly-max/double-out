// Emulate the iPhone home-screen app's safe-area insets for a test page (used by safe-audit.js and rb-sizes.js).
// 1. Chrome's own override (Emulation.setSafeAreaInsetsOverride) when the browser has it.
// 2. Otherwise (e.g. the release gate's Playwright 1.48.2 Chromium, which lacks that CDP method) a shim: every env(safe-area-inset-*)
//    in the page's CSS text is rewritten to the same pixel values before it is used: <style> text, style attributes and cssText set from
//    script (watched with a MutationObserver from the first script, so styles the game adds later are covered too), and the CSSOM of
//    stylesheets already parsed. Either way the page sees the same insets, so the checks measure the same layouts.
// The path is verified after load (a probe element sized with env()), and SAFEAREA=shim forces the shim for testing the fallback.
// usage: const { safeArea } = require('./_safearea'); const how = await safeArea(page, { top: 47, bottom: 34 }); ...goto...; await how.verify(page)
async function safeArea(p, ins) {
  const I = { top: 0, bottom: 0, left: 0, right: 0, ...ins }; let mode = 'cdp';
  if (process.env.SAFEAREA === 'shim') mode = 'shim';
  else { try { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: I }); } catch (e) { mode = 'shim'; } }
  if (mode === 'shim') await p.addInitScript(I => {
    // env(safe-area-inset-x) or env(safe-area-inset-x, <fallback>) where the fallback may itself hold one level of brackets
    const RX = /env\(\s*safe-area-inset-(top|bottom|left|right)\s*(?:,(?:[^()]|\([^()]*\))*)?\)/g, fix = s => s.replace(RX, (m, k) => I[k] + 'px');
    const has = s => typeof s === 'string' && s.indexOf('safe-area-inset') >= 0;
    const doEl = el => { if (el.nodeType !== 1) return; if (el.tagName === 'STYLE' && has(el.textContent)) el.textContent = fix(el.textContent);
      const st = el.getAttribute && el.getAttribute('style'); if (has(st)) el.setAttribute('style', fix(st)); };
    const doTree = root => { doEl(root); if (root.querySelectorAll) root.querySelectorAll('style,[style]').forEach(doEl); };
    // CSSOM sheets (e.g. linked files) parsed before or outside the observer: rewrite their rules in place
    const doSheets = () => { for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch (e) { continue; } const walk = (list, owner) => {
      for (let i = 0; i < list.length; i++) { const r = list[i]; if (r.cssRules && r.cssRules.length && !r.style) { walk(r.cssRules, r); continue; }
        if (r.style && has(r.cssText)) { try { const t = fix(r.cssText); owner.deleteRule(i); owner.insertRule(t, i); } catch (e) {} } } }; walk(rs, sh); } };
    // a declaration whose value holds env() is dropped by the parser in browsers that read the env() as invalid, never reaching the observer,
    // so catch the script setters too
    const D = CSSStyleDeclaration.prototype, ct = Object.getOwnPropertyDescriptor(D, 'cssText'), sp = D.setProperty;
    if (ct && ct.set) Object.defineProperty(D, 'cssText', { ...ct, set(v) { ct.set.call(this, has(v) ? fix(v) : v); } });
    D.setProperty = function (n, v, pr) { return sp.call(this, n, has(v) ? fix(v) : v, pr); };
    const sa = Element.prototype.setAttribute; Element.prototype.setAttribute = function (n, v) { return sa.call(this, n, n === 'style' && has(v) ? fix(String(v)) : v); };
    const mo = new MutationObserver(ms => { for (const m of ms) { if (m.type === 'childList') { m.addedNodes.forEach(n => { if (n.nodeType === 1) doTree(n); else if (n.parentNode && n.parentNode.tagName === 'STYLE') doEl(n.parentNode); }); if (m.target.tagName === 'STYLE') doEl(m.target); }
      else if (m.type === 'characterData') { if (m.target.parentNode && m.target.parentNode.tagName === 'STYLE') doEl(m.target.parentNode); } else doEl(m.target); } });
    mo.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'], characterData: true });
    document.addEventListener('DOMContentLoaded', () => { doTree(document.documentElement); doSheets(); });
    addEventListener('load', () => { doTree(document.documentElement); doSheets(); });
    window.__safeAreaShim = I;
  }, I);
  return { mode, async verify(pg) {  // the page must see the insets, whichever path set them
    const got = await pg.evaluate(() => { const d = document.createElement('div'); d.setAttribute('style', 'position:fixed;left:0;top:0;width:1px;visibility:hidden;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)');
      document.body.appendChild(d); const cs = getComputedStyle(d), r = { top: parseFloat(cs.paddingTop), bottom: parseFloat(cs.paddingBottom) }; d.remove(); return r; });
    if (got.top !== I.top || got.bottom !== I.bottom) throw new Error(`safe-area emulation (${mode}) not applied: page sees top ${got.top} bottom ${got.bottom}, want ${I.top}/${I.bottom}`);
    return got; } };
}
module.exports = { safeArea };
