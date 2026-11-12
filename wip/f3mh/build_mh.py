#!/usr/bin/env python3
"""F3: build a MakeHuman character from MakeHuman's own CC0 data (no MakeHuman app, no Blender).
Base mesh hm08 + macro targets -> proxies fitted through .mhclo (eyes, brows, lashes, teeth, hair, clothes)
-> JSON parts for three.js (positions, normals by three, uvs, indices, texture paths, MH bone weights for later rigging).
usage: python3 build_mh.py <out.json> [config.json]"""
import json, os, sys, re
import numpy as np

MH = '/home/claude/mh/makehuman/data'
SYS = '/home/claude/mhassets'

def read_obj(path):
    vs, vts, faces, groups = [], [], [], []
    g = None
    with open(path) as f:
        for line in f:
            if line.startswith('v '): vs.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('vt '): vts.append([float(x) for x in line.split()[1:3]])
            elif line.startswith('g '): g = line.split()[1] if len(line.split()) > 1 else None
            elif line.startswith('f '):
                fv = []
                for tok in line.split()[1:]:
                    p = tok.split('/'); fv.append((int(p[0]) - 1, int(p[1]) - 1 if len(p) > 1 and p[1] else -1))
                faces.append(fv); groups.append(g)
    return np.array(vs, dtype=np.float64), np.array(vts, dtype=np.float64) if vts else None, faces, groups

def read_target(path):
    idx, d = [], []
    with open(path) as f:
        for line in f:
            if not line.strip() or line[0] == '#': continue
            p = line.split(); idx.append(int(p[0])); d.append([float(p[1]), float(p[2]), float(p[3])])
    return np.array(idx, dtype=np.int64), np.array(d, dtype=np.float64).reshape(-1, 3)

def apply_targets(base, targets):
    v = base.copy()
    for path, w in targets:
        if w == 0: continue
        i, d = read_target(path); v[i] += w * d
    return v

def macro_targets(cfg):
    """MakeHuman macro weights for gender/age/muscle/weight/height/proportions/ethnicity (subset of its formulas)."""
    md = MH + '/targets/macrodetails/'
    g = cfg.get('gender', 1.0); age = cfg.get('age', 0.5); mus = cfg.get('muscle', 0.5); wt = cfg.get('weight', 0.5)
    gw = {'female': 1 - g, 'male': g}
    # age: 0 -> baby(1y), 0.1875 -> child(11y), 0.5 -> young(25y), 1 -> old(90y)
    if age < 0.1875: aw = {'baby': 1 - age / 0.1875, 'child': age / 0.1875}
    elif age < 0.5: t = (age - 0.1875) / 0.3125; aw = {'child': 1 - t, 'young': t}
    else: t = (age - 0.5) / 0.5; aw = {'young': 1 - t, 'old': t}
    def tri(x, lo, mid, hi):
        return {lo: max(0.0, 1 - 2 * x), mid: 1 - abs(2 * x - 1), hi: max(0.0, 2 * x - 1)}
    mw = tri(mus, 'minmuscle', 'averagemuscle', 'maxmuscle'); ww = tri(wt, 'minweight', 'averageweight', 'maxweight')
    out = []
    for gk, gv in gw.items():
        for ak, av in aw.items():
            for mk, mv in mw.items():
                for wk, wv in ww.items():
                    w = gv * av * mv * wv
                    if w > 1e-6: out.append((md + f'universal-{gk}-{ak}-{mk}-{wk}.target', w))
    eth = cfg.get('ethnic', {'caucasian': 1.0})
    for ek, ev in eth.items():
        for gk, gv in gw.items():
            for ak, av in aw.items():
                w = ev * gv * av
                if w > 1e-6: out.append((md + f'{ek}-{gk}-{ak}.target', w))
    h = cfg.get('height', 0.5)
    if h != 0.5:
        hk = 'maxheight' if h > 0.5 else 'minheight'; hw = abs(h - 0.5) * 2
        for gk, gv in gw.items():
            for ak, av in aw.items():
                if ak == 'baby': continue
                for mk, mv in mw.items():
                    for wk, wv in ww.items():
                        w = hw * gv * av * mv * wv
                        if w > 1e-6: out.append((md + f'height/{gk}-{ak}-{mk}-{wk}-{hk}.target', w))
    p = cfg.get('proportions', 0.5)
    if p != 0.5:
        pk = 'idealproportions' if p > 0.5 else 'uncommonproportions'; pw = abs(p - 0.5) * 2
        for gk, gv in gw.items():
            for ak, av in aw.items():
                if ak == 'baby': continue
                for mk, mv in mw.items():
                    for wk, wv in ww.items():
                        w = pw * gv * av * mv * wv
                        if w > 1e-6: out.append((md + f'proportions/{gk}-{ak}-{mk}-{wk}-{pk}.target', w))
    # detail modifiers: {"eyes/{s}-eye-height2-incr": 0.5, "nose/nose-scale-horiz-decr": 0.3}; {s} = both l and r
    for k, w in cfg.get('mods', {}).items():
        for side in (['l', 'r'] if '{s}' in k else ['']):
            out.append((MH + '/targets/' + k.replace('{s}', side) + '.target', w))
    miss = [p for p, w in out if not os.path.exists(p)]
    if miss: print('missing targets:', miss[:5])
    return [(pth, w) for pth, w in out if os.path.exists(pth)]

def read_mhclo(path):
    d = {'verts': [], 'delete': [], 'scale': {}, 'material': None, 'obj': None, 'z_depth': 50, 'name': os.path.basename(path)}
    mode = None
    with open(path) as f:
        for line in f:
            s = line.strip()
            if not s or s[0] == '#': continue
            p = s.split()
            if p[0] == 'verts': mode = 'verts'; continue
            if p[0] == 'delete_verts': mode = 'delete'; continue
            if mode == 'verts' and re.match(r'^-?\d', p[0]):
                if len(p) == 1: d['verts'].append((int(p[0]),))
                else: d['verts'].append(tuple(int(x) for x in p[:3]) + tuple(float(x) for x in p[3:9]))
                continue
            if mode == 'delete' and re.match(r'^\d', p[0]):
                toks = ' '.join(p).replace(' - ', '-').split()
                for tok in toks:
                    if '-' in tok:
                        a, b = tok.split('-'); d['delete'].extend(range(int(a), int(b) + 1))
                    else: d['delete'].append(int(tok))
                continue
            if p[0] in ('x_scale', 'y_scale', 'z_scale'): d['scale'][p[0][0]] = (int(p[1]), int(p[2]), float(p[3]))
            elif p[0] == 'material': d['material'] = p[1]
            elif p[0] == 'obj_file': d['obj'] = p[1]
            elif p[0] == 'z_depth': d['z_depth'] = int(p[1])
    return d

def fit_proxy(clo, body):
    sc = np.ones(3)
    for ax, k in (('x', 0), ('y', 1), ('z', 2)):
        if ax in clo['scale']:
            a, b, ref = clo['scale'][ax]; sc[k] = abs(body[a][k] - body[b][k]) / ref
    out = np.zeros((len(clo['verts']), 3))
    for n, r in enumerate(clo['verts']):
        if len(r) == 1: out[n] = body[r[0]]
        else:
            i, j, k, w1, w2, w3, dx, dy, dz = r
            out[n] = w1 * body[i] + w2 * body[j] + w3 * body[k] + np.array([dx, dy, dz]) * sc
    return out

def read_mhmat(path):
    m = {}
    if not path or not os.path.exists(path): return m
    base = os.path.dirname(path)
    with open(path) as f:
        for line in f:
            p = line.strip().split(None, 1)
            if len(p) < 2 or p[0].startswith('#'): continue
            k, v = p
            if k in ('diffuseTexture', 'normalmapTexture', 'transparencyMapTexture', 'specularmapTexture', 'aomapTexture'):
                q = os.path.join(base, os.path.basename(v))
                if not os.path.exists(q): q = os.path.join(base, v)
                if os.path.exists(q): m[k] = q
            elif k in ('diffuseColor', 'specularColor'): m[k] = [float(x) for x in v.split()]
            elif k in ('shininess', 'opacity', 'translucency'): m[k] = float(v)
            elif k in ('transparent', 'alphaToCoverage', 'backfaceCull'): m[k] = v.strip().lower() == 'true'
    return m

def expand(verts, uvs, faces, keep=None):
    """split vertices at UV seams; triangulate quads. keep(face_index) filters faces. returns pos, uv, idx, src (base vertex ids)"""
    key = {}; P = []; U = []; S = []; I = []
    for fi, f in enumerate(faces):
        if keep is not None and not keep(fi): continue
        ids = []
        for vi, ti in f:
            k = (vi, ti)
            if k not in key:
                key[k] = len(P); P.append(verts[vi]); U.append(uvs[ti] if (uvs is not None and ti >= 0) else (0, 0)); S.append(vi)
            ids.append(key[k])
        for t in range(1, len(ids) - 1): I.extend([ids[0], ids[t], ids[t + 1]])
    return np.array(P), np.array(U), np.array(I, dtype=np.int64), np.array(S)

def vnormals(verts, faces):
    n = np.zeros_like(verts)
    for f in faces:
        ids = [v for v, _ in f]
        for t in range(1, len(ids) - 1):
            a, b, c = verts[ids[0]], verts[ids[t]], verts[ids[t + 1]]
            fn = np.cross(b - a, c - a)
            for v in (ids[0], ids[t], ids[t + 1]): n[v] += fn
    l = np.linalg.norm(n, axis=1, keepdims=True); l[l == 0] = 1
    return n / l

def proxy_part(clo_path, body, deleted):
    clo = read_mhclo(clo_path); base = os.path.dirname(clo_path)
    pv = fit_proxy(clo, body)
    _, puv, pfaces, _ = read_obj(os.path.join(base, clo['obj']))
    P, U, I, S = expand(pv, puv, pfaces)
    N = vnormals(pv, pfaces)[S]
    mat = read_mhmat(os.path.join(base, clo['material'])) if clo['material'] else {}
    deleted.update(clo['delete'])
    # proxy vertex -> its body reference vertices and weights (for skinning later)
    ref = [(r[0], r[1], r[2], r[3], r[4], r[5]) if len(r) > 1 else (r[0], r[0], r[0], 1.0, 0.0, 0.0) for r in clo['verts']]
    return {'name': clo['name'], 'pos': P, 'uv': U, 'idx': I, 'src': S, 'ref': ref, 'nrm': N, 'mat': mat, 'z': clo['z_depth']}

def main():
    out = sys.argv[1]; cfg = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
    base, buv, bfaces, bgroups = read_obj(MH + '/3dobjs/base.obj')
    body = apply_targets(base, macro_targets(cfg))
    parts = []; deleted = set()
    proxies = cfg.get('proxies', [
        SYS + '/eyes/high-poly/high-poly.mhclo', SYS + '/eyebrows/eyebrow001/eyebrow001.mhclo',
        SYS + '/eyelashes/eyelashes02/eyelashes02.mhclo', SYS + '/teeth/teeth_base/teeth_base.mhclo',
        SYS + '/hair/short02/short02.mhclo', SYS + '/clothes/male_casualsuit04/male_casualsuit04.mhclo',
        SYS + '/clothes/shoes02/shoes02.mhclo'])
    for pth in proxies:
        if not os.path.exists(pth): print('missing', pth); continue
        p = proxy_part(pth, body, deleted)
        if '/eyes/' in pth:
            # MakeHuman eyes = eyeball + cornea shell; the cornea's UVs sit in the texture's transparent corner.
            # Split it into its own part so it renders as a glossy clear layer after the eyeball.
            tri = p['idx'].reshape(-1, 3); cuv = p['uv'][tri].mean(1)
            corn = (cuv[:, 0] > .8) & (cuv[:, 1] < .2)
            c = dict(p); c['name'] = 'cornea'; c['idx'] = tri[corn].ravel(); c['mat'] = {'cornea': True}; c['z'] = p['z'] + 1
            p['idx'] = tri[~corn].ravel(); parts.append(p); parts.append(c)
        else: parts.append(p)
    # body: only the 'body' group (helpers are fitting geometry), minus faces fully under clothes
    keep = lambda fi: bgroups[fi] == 'body' and not all(v in deleted for v, _ in bfaces[fi])
    P, U, I, S = expand(body, buv, bfaces, keep)
    N = vnormals(body, [f for fi, f in enumerate(bfaces) if bgroups[fi] == 'body'])[S]
    skin = read_mhmat(SYS + '/skins/' + cfg.get('skin', 'young_caucasian_male') + '/' + cfg.get('skin', 'young_caucasian_male') + '.mhmat')
    parts.insert(0, {'name': 'body', 'pos': P, 'uv': U, 'idx': I, 'src': S, 'ref': None, 'nrm': N, 'mat': skin, 'z': 0})
    J = {'parts': [{'name': p['name'], 'pos': p['pos'].round(5).ravel().tolist(), 'uv': p['uv'].round(5).ravel().tolist(), 'nrm': p['nrm'].round(4).ravel().tolist(),
                    'idx': p['idx'].tolist(), 'mat': p['mat'], 'z': p['z']} for p in parts]}
    json.dump(J, open(out, 'w'))
    lo, hi = body[:, 1].min(), body[:, 1].max()
    print('built', out, 'parts', [(p['name'], len(p['idx']) // 3) for p in parts], 'body height (MH units)', round(hi - lo, 3), 'deleted body verts', len(deleted))

if __name__ == '__main__':
    main()
