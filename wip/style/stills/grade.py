# EXP-UX phase 2: turn a raw venue render into a hub panel backdrop (crop off the ceiling, warm grade, vignette, soft focus away from the board)
import sys
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageChops
src, dst, cy = sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else .2
im = Image.open(src).convert('RGB'); W, H = im.size
top = int(H * cy); im = im.crop((0, top, W, top + int(W * 9 / 16 * .78))).resize((1600, int(1600 * 9 / 16 * .78)))
w, h = im.size
blur = im.filter(ImageFilter.GaussianBlur(6))
m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); d.ellipse((w * .18, -h * .1, w * .82, h * .95), fill=255); m = m.filter(ImageFilter.GaussianBlur(120))
im = Image.composite(im, blur, m)
r, g, b = im.split(); r = r.point(lambda v: min(255, int(v * 1.08 + 6))); b = b.point(lambda v: int(v * .86)); im = Image.merge('RGB', (r, g, b))
im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(.9)
v = Image.new('L', (w, h), 0); d = ImageDraw.Draw(v); d.ellipse((-w * .15, -h * .35, w * 1.15, h * 1.25), fill=255); v = v.filter(ImageFilter.GaussianBlur(160))
im = Image.composite(im, ImageEnhance.Brightness(im).enhance(.35), v)
im.save(dst, quality=88)
