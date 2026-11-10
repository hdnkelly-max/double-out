# TOPS card reveal sounds, synthesised from scratch (no samples, no licences).
# python3 make_sfx.py <outdir>  -> mp3 files used by cards.js (Sfx.names)
import sys, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt
SR = 44100
rng = np.random.default_rng(11)
out = sys.argv[1] if len(sys.argv) > 1 else 'out'; os.makedirs(out, exist_ok=True)

def t(d): return np.arange(int(SR * d)) / SR
def env(n, a=.005, d=.2, curve=4):
    x = np.arange(n) / SR; e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-np.maximum(0, x - a) * curve / max(d, 1e-4)); return e
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(SR * d))
def pad(x, d): y = np.zeros(int(SR * d)); y[:min(len(x), len(y))] += x[:len(y)]; return y
def at(base, x, sec, g=1.0):
    i = int(SR * sec); n = min(len(x), len(base) - i)
    if n > 0: base[i:i + n] += x[:n] * g
    return base
def bell(f, d, partials=((1, 1), (2.76, .5), (5.4, .25), (8.93, .12)), decay=3.0):
    x = t(d); s = sum(a * np.sin(2 * np.pi * f * r * x) * np.exp(-x * decay * (1 + r * .35)) for r, a in partials); return s
def sweep(f0, f1, d):
    x = t(d); ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, len(x))) / SR; return np.sin(ph)
def save(name, x, gain_db=-3):
    x = x / (np.max(np.abs(x)) + 1e-9) * (10 ** (gain_db / 20))
    fade = min(len(x), int(SR * .01)); x[-fade:] *= np.linspace(1, 0, fade)
    wav = os.path.join(out, name + '.wav'); mp3 = os.path.join(out, name + '.mp3')
    import wave
    with wave.open(wav, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '128k', mp3], check=True)
    os.remove(wav); print(name, f'{len(x) / SR:.2f}s', os.path.getsize(mp3), 'bytes')

# --- deal: three soft card slides on felt
def slide(d=.16, lo=900, hi=4200):
    n = noise(d); n = bp(n, lo, hi) * env(len(n), .02, d * .6, 3); return n
deal = pad(np.zeros(1), .5)
for i in range(3): deal = at(deal, slide(), i * .07, .7 + i * .1)
save('deal', lp(deal, 7000), -9)

# --- select: tight click + small low thunk
c = hp(noise(.012), 2500) * env(int(SR * .012), .0005, .004, 6)
th = np.sin(2 * np.pi * 140 * t(.06)) * env(int(SR * .06), .001, .03, 5)
save('select', pad(c, .08) + pad(th, .08) * .6, -8)

# --- flip: card snap (two transients) + air whoosh
fl = pad(np.zeros(1), .28)
snap = bp(noise(.02), 2200, 9000) * env(int(SR * .02), .0005, .008, 5)
fl = at(fl, snap, 0, 1); fl = at(fl, snap * .7, .045, 1)
wh = bp(noise(.16), 500, 3500) * np.sin(np.linspace(0, np.pi, int(SR * .16))) ** 2
fl = at(fl, wh, .0, .35)
save('flip', fl, -6)
save('missed', lp(fl, 2500) * .6, -14)

# --- charges: rising shimmer before epic / legendary flips
def charge(d, f0, f1, sub=False):
    x = t(d); n = len(x)
    rise = np.linspace(0, 1, n) ** 2
    s = sweep(f0, f1, d) * .25 + sweep(f0 * 1.5, f1 * 1.5, d) * .15
    trem = 1 + .35 * np.sin(2 * np.pi * np.linspace(6, 18, n) * x)
    nz = bp(noise(d), 3000, 11000) * .35
    y = (s * trem + nz) * rise
    if sub: y += np.sin(2 * np.pi * 48 * x) * rise * .6
    return y
save('charge_epic', charge(.46, 380, 900), -9)
save('charge_legendary', charge(.62, 220, 760, sub=True), -7)

# --- reveals
# uncommon: warm wooden two-note
def marimba(f, d=.5): x = t(d); return (np.sin(2 * np.pi * f * x) + .3 * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x * 30)) * np.exp(-x * 9)
u = pad(np.zeros(1), .7); u = at(u, marimba(523.25), 0); u = at(u, marimba(659.25), .09, .8)
save('rev_uncommon', u, -9)
# rare: metallic tick + bright bell
r = pad(np.zeros(1), 1.0)
tick = hp(noise(.01), 5000) * env(int(SR * .01), .0003, .003, 6)
r = at(r, tick, 0); r = at(r, bell(1318.5, 1.0, decay=4.5), .01, .55); r = at(r, bell(1975.5, .8, decay=5), .06, .25)
save('rev_rare', r, -8)
# epic: maj7 chime chord + sparkle tail
e = pad(np.zeros(1), 1.6)
for i, f in enumerate((523.25, 659.25, 783.99, 987.77)): e = at(e, bell(f, 1.5, decay=2.6), i * .035, .5)
for k in range(14):
    f = rng.uniform(2500, 6000); e = at(e, np.sin(2 * np.pi * f * t(.12)) * env(int(SR * .12), .002, .05, 5), .18 + k * .06 + rng.uniform(0, .03), .08)
save('rev_epic', e, -6)
# legendary: impact + warm pad + glitter shimmer
L = pad(np.zeros(1), 2.4)
x = t(1.4)
boom = np.sin(2 * np.pi * (46 + 30 * np.exp(-x * 9)) * x) * np.exp(-x * 2.6)
thump = lp(noise(.25), 600) * env(int(SR * .25), .002, .09, 5)
L = at(L, boom, 0, 1.0); L = at(L, thump, 0, .7)
xp = t(2.1); padd = np.zeros(len(xp))
for f in (261.63, 329.63, 392.0, 523.25):
    for det in (-.004, .004):
        ph = 2 * np.pi * f * (1 + det) * xp; padd += (2 * ((ph / (2 * np.pi)) % 1) - 1) * .12
padd = lp(padd, 2200) * (np.minimum(1, xp / .35) * np.exp(-np.maximum(0, xp - .6) * 1.6))
L = at(L, padd, .08, .55)
for f in (1046.5, 1318.5, 1568.0): L = at(L, bell(f, 1.6, decay=2.2), .12, .22)
for k in range(30):
    f = rng.uniform(3000, 8000); L = at(L, np.sin(2 * np.pi * f * t(.1)) * env(int(SR * .1), .002, .04, 5), .25 + k * .045 + rng.uniform(0, .02), .07)
save('rev_legendary', L, -4)
# duplicate: soft slide down
d = bp(noise(.3), 300, 1800) * env(int(SR * .3), .02, .18, 3) * np.linspace(1, .4, int(SR * .3))
save('dupe', d + pad(np.sin(2 * np.pi * 330 * t(.25)) * env(int(SR * .25), .005, .12, 4), .3) * .3, -12)
