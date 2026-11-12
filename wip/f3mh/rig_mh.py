#!/usr/bin/env python3
"""F3 rig: put the MakeHuman build on the Mixamo skeleton the game already animates.
- joints from MakeHuman's default.mhskel (vertex means on the morphed body)
- MakeHuman's own default_weights.mhw, merged from 163 MH bones onto the 65 Mixamo bones
- the mesh is posed from MakeHuman's A-pose into the Mixamo bind T-pose (linear blend skinning, per-bone
  rotation that aligns each MH bone with the Mixamo bone's direction), so every anims.glb clip plays unchanged
- bones keep the Mixamo character's world rest rotations (brian_rest.json), positions from the MakeHuman body
usage: python3 rig_mh.py out.json [config.json]"""
import json, sys, re
import numpy as np
import build_mh as B

PFX = 'mixamorig12'
SIDE = {'L': 'Left', 'R': 'Right'}

def mh_to_mixamo(b):
    m = re.match(r'^(.*)\.([LR])$', b); base, s = (m.group(1), SIDE[m.group(2)]) if m else (b, None)
    if base in ('root', 'spine05', 'pelvis'): return 'Hips'
    if base in ('spine04', 'spine03'): return 'Spine'
    if base == 'spine02': return 'Spine1'
    if base in ('spine01', 'breast'): return 'Spine2'
    if base.startswith('neck'): return 'Neck'
    if base == 'clavicle': return s + 'Shoulder'
    if base in ('shoulder01', 'upperarm01', 'upperarm02'): return s + 'Arm'
    if base in ('lowerarm01', 'lowerarm02'): return s + 'ForeArm'
    if base == 'wrist' or base.startswith('metacarpal'): return s + 'Hand'
    m2 = re.match(r'^finger(\d)-(\d)$', base)
    if m2: return s + 'Hand' + ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'][int(m2.group(1)) - 1] + m2.group(2)
    if base in ('upperleg01', 'upperleg02'): return s + 'UpLeg'
    if base in ('lowerleg01', 'lowerleg02'): return s + 'Leg'
    if base == 'foot': return s + 'Foot'
    if base.startswith('toe'): return s + 'ToeBase'
    return 'Head'  # head, jaw, eyes, face muscles, tongue, special*

def mixamo_heads(J):
    """Mixamo joint -> position on the MakeHuman body (decimetres, A-pose)."""
    h = {}
    h['Hips'] = (J['upperleg01.L____head'] + J['upperleg01.R____head']) / 2
    h['Spine'] = J['spine04____head']; h['Spine1'] = J['spine02____head']; h['Spine2'] = J['spine01____head']
    h['Neck'] = J['neck01____head']; h['Head'] = J['head____head']; h['HeadTop_End'] = J['head____tail']
    for k, s in SIDE.items():
        h[s + 'Shoulder'] = J[f'clavicle.{k}____head']; h[s + 'Arm'] = J[f'upperarm01.{k}____head']
        h[s + 'ForeArm'] = J[f'lowerarm01.{k}____head']; h[s + 'Hand'] = J[f'wrist.{k}____head']
        for n, f in enumerate(['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'], 1):
            for seg in (1, 2, 3): h[f'{s}Hand{f}{seg}'] = J[f'finger{n}-{seg}.{k}____head']
            h[f'{s}Hand{f}4'] = J[f'finger{n}-3.{k}____tail']
        h[s + 'UpLeg'] = J[f'upperleg01.{k}____head']; h[s + 'Leg'] = J[f'lowerleg01.{k}____head']
        h[s + 'Foot'] = J[f'foot.{k}____head']; h[s + 'ToeBase'] = np.mean([J[f'toe{t}-1.{k}____head'] for t in range(1, 6)], 0)  # ball of the foot
        h[s + 'Toe_End'] = J[f'toe3-3.{k}____tail']
    return h

MAIN = {'Hips': 'Spine', 'Spine': 'Spine1', 'Spine1': 'Spine2', 'Spine2': 'Neck', 'Neck': 'Head', 'Head': 'HeadTop_End'}
for s in SIDE.values():
    MAIN.update({s + 'Shoulder': s + 'Arm', s + 'Arm': s + 'ForeArm', s + 'ForeArm': s + 'Hand', s + 'Hand': s + 'HandMiddle1',
                 s + 'UpLeg': s + 'Leg', s + 'Leg': s + 'Foot', s + 'Foot': s + 'ToeBase', s + 'ToeBase': s + 'Toe_End'})
    for f in ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']:
        for seg in (1, 2, 3): MAIN[f'{s}Hand{f}{seg}'] = f'{s}Hand{f}{seg + 1}'

def rot_between(a, b):
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b); v = np.cross(a, b); c = float(np.dot(a, b))
    if c < -0.9999:
        ax = np.cross(a, [1, 0, 0]); ax = ax if np.linalg.norm(ax) > 1e-3 else np.cross(a, [0, 1, 0]); ax /= np.linalg.norm(ax)
        return 2 * np.outer(ax, ax) - np.eye(3)
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + vx + vx @ vx / (1 + c)

def main():
    out = sys.argv[1]; cfg = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
    rest = json.load(open(cfg.get('rest', '/home/claude/mhbuild/brian_rest.json')))
    bones = [dict(b, n=b['name'].replace(PFX, '')) for b in rest['bones']]
    names = [b['n'] for b in bones]; bi = {n: i for i, n in enumerate(names)}
    par = {b['n']: (b['parent'].replace(PFX, '') if b['parent'] else None) for b in bones}
    bw = {b['n']: np.array(b['wpos']) for b in bones}; bq = {b['n']: b['wquat'] for b in bones}

    base, buv, bfaces, bgroups = B.read_obj(B.MH + '/3dobjs/base.obj')
    body = B.apply_targets(base, B.macro_targets(cfg))
    skel = json.load(open(B.MH + '/rigs/default.mhskel'))
    J = {k: body[v].mean(0) for k, v in skel['joints'].items()}
    H = mixamo_heads(J)
    # MH weights -> Mixamo bones (dense, body vertices x 65)
    W = np.zeros((len(body), len(names)))
    for b, vw in json.load(open(B.MH + '/rigs/default_weights.mhw'))['weights'].items():
        k = bi[mh_to_mixamo(b)]
        for v, w in vw: W[v, k] += w
    s = W.sum(1, keepdims=True); W[s[:, 0] > 0] /= s[s[:, 0] > 0]
    # helper vertices (tights, skirt, hair fitting shells) have no weights: copy the nearest weighted vertex's
    have = np.where(W.sum(1) > 0)[0]; miss = np.where(W.sum(1) == 0)[0]
    if len(miss):
        from scipy.spatial import cKDTree
        _, nn = cKDTree(body[have]).query(body[miss]); W[miss] = W[have[nn]]
    print('weights: filled', len(miss), 'unweighted vertices from their nearest weighted neighbour')
    # pose: per-bone world rotation aligning MH bone direction to the Mixamo bind direction; FK for new heads
    R = {}; NH = {}
    order = []
    def visit(n):
        order.append(n)
        for c in names:
            if par[c] == n: visit(c)
    visit('Hips')
    for n in order:
        p = par[n]
        if p is None: NH[n] = H[n].copy()
        else: NH[n] = NH[p] + R[p] @ (H[n] - H[p])
        c = MAIN.get(n)
        # trunk, neck and head keep MakeHuman's own upright posture: their joints sit differently in the two skulls/spines
        # (Brian's HeadTop_End is 21 deg forward of his Head), so aligning directions there pitched the face down ~20 deg
        if n in ('Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'): R[n] = np.eye(3)
        elif c: R[n] = rot_between(H[c] - H[n], bw[c] - bw[n])
        else: R[n] = R[p] if p else np.eye(3)
    Rm = np.stack([R[n] for n in names]); Hm = np.stack([H[n] for n in names]); NHm = np.stack([NH[n] for n in names])

    def pose(V, Wv):
        si, sw = top4(Wv); Wv = np.zeros_like(Wv); np.put_along_axis(Wv, si, sw, 1)   # same 4 weights as the GPU skinning
        out = np.zeros_like(V); Nr = np.zeros((len(V), 3, 3))
        for k in range(len(names)):
            w = Wv[:, k]; m = w > 0
            if not m.any(): continue
            out[m] += w[m, None] * (NHm[k] + (V[m] - Hm[k]) @ Rm[k].T)
            Nr[m] += w[m, None, None] * Rm[k]
        return out, Nr

    def top4(Wv):
        idx = np.argsort(-Wv, axis=1)[:, :4]; w = np.take_along_axis(Wv, idx, 1); s = w.sum(1, keepdims=True); s[s == 0] = 1
        return idx, w / s

    parts = []; deleted = set()
    proxies = cfg.get('proxies', [B.SYS + '/eyes/high-poly/high-poly.mhclo', B.SYS + '/eyebrows/eyebrow001/eyebrow001.mhclo',
        B.SYS + '/eyelashes/eyelashes02/eyelashes02.mhclo', B.SYS + '/teeth/teeth_base/teeth_base.mhclo',
        B.SYS + '/hair/short02/short02.mhclo', B.SYS + '/clothes/male_casualsuit04/male_casualsuit04.mhclo',
        B.SYS + '/clothes/shoes02/shoes02.mhclo'])
    for pth in proxies:
        p = B.proxy_part(pth, body, deleted)
        ref = np.array(p['ref']); ri = ref[:, :3].astype(int); rw = ref[:, 3:6]
        Wp = (W[ri] * rw[:, :, None]).sum(1)              # proxy vertex weights from its 3 body references
        Wp = np.clip(Wp, 0, None)                         # .mhclo weights extrapolate (negative), so clip before normalising
        s = Wp.sum(1, keepdims=True); s[s == 0] = 1; Wp /= s
        Wx = Wp[p['S']] if 'S' in p else Wp[p['src']]
        P, Nr = pose(p['pos'], Wx)
        N = np.einsum('nij,nj->ni', Nr, p['nrm']); N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
        si, sw = top4(Wx)
        q = dict(p, pos=P, nrm=N, si=si, sw=sw)
        if '/eyes/' in pth:
            tri = p['idx'].reshape(-1, 3); cuv = p['uv'][tri].mean(1); corn = (cuv[:, 0] > .8) & (cuv[:, 1] < .2)
            c = dict(q, name='cornea', idx=tri[corn].ravel(), mat={'cornea': True}, z=p['z'] + 1); q['idx'] = tri[~corn].ravel()
            parts += [q, c]
        else: parts.append(q)
    keep = lambda fi: bgroups[fi] == 'body' and not all(v in deleted for v, _ in bfaces[fi])
    P0, U, I, S = B.expand(body, buv, bfaces, keep)
    N0 = B.vnormals(body, [f for fi, f in enumerate(bfaces) if bgroups[fi] == 'body'])[S]
    P, Nr = pose(P0, W[S]); N = np.einsum('nij,nj->ni', Nr, N0); N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
    si, sw = top4(W[S])
    skin = B.read_mhmat(B.SYS + '/skins/' + cfg.get('skin', 'young_caucasian_male') + '/' + cfg.get('skin', 'young_caucasian_male') + '.mhmat')
    parts.insert(0, {'name': 'body', 'pos': P, 'uv': U, 'idx': I, 'nrm': N, 'si': si, 'sw': sw, 'mat': skin, 'z': 0})
    # decimetres -> metres, feet on the floor
    sc = 0.1; y0 = min(p['pos'][:, 1].min() for p in parts if len(p['idx']))
    for p in parts: p['pos'] = (p['pos'] - [0, y0, 0]) * sc
    NHs = {n: ((NH[n] - [0, y0, 0]) * sc) for n in names}
    J2 = {'bones': [{'name': PFX + n, 'parent': (PFX + par[n]) if par[n] else None, 'wpos': NHs[n].round(5).tolist(), 'wquat': bq[n]} for n in names],
          'parts': [{'name': p['name'], 'pos': p['pos'].round(5).ravel().tolist(), 'uv': p['uv'].round(5).ravel().tolist(),
                     'nrm': p['nrm'].round(4).ravel().tolist(), 'idx': np.asarray(p['idx']).tolist(), 'si': p['si'].ravel().tolist(),
                     'sw': p['sw'].round(4).ravel().tolist(), 'mat': p['mat'], 'z': p['z']} for p in parts]}
    json.dump(J2, open(out, 'w'))
    hp = NHs['Head']; hb = bw['Head']
    print('rigged', out, 'height m', round(max(p['pos'][:, 1].max() for p in parts), 3), 'head joint', hp.round(3), 'brian head', hb.round(3),
          'hand L', NHs['LeftHand'].round(3), 'brian', bw['LeftHand'].round(3))

if __name__ == '__main__':
    main()
