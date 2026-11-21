# doc 67 composite: plate (venue painting, 2:3 crop from full height centred at cx, blur 3 px at 700 wide, brightness x.82) + warm glow (figure alpha
# blurred 28 px, warm white 35%) + the figure; 700x1050 webp q90; no text (the nameplate is live in the card UI). python3 cardcomp.py <figdir> <outdir> <plate> <cx> ids...
import sys,os
from PIL import Image,ImageFilter,ImageEnhance
import json
fd,od,plate,cxs=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4];os.makedirs(od,exist_ok=True)
CX=json.loads(cxs) if cxs.startswith('{') else {}
im=Image.open(plate).convert('RGB')
def plateP(cx):
  h=im.height;w=int(h*2/3);x0=max(0,min(im.width-w,cx-w//2));return ImageEnhance.Brightness(im.crop((x0,0,x0+w,h)).resize((700,1050),Image.LANCZOS).filter(ImageFilter.GaussianBlur(3))).enhance(0.82).convert('RGBA')
for i in sys.argv[5:]:
  f=Image.open(f'{fd}/{i}_fig.png').convert('RGBA').resize((700,1035),Image.LANCZOS);p=plateP(int(CX.get(i,1000)))  # Director's composite: the figure 15 px down (700x1035 at y 15)
  a=f.split()[3].filter(ImageFilter.GaussianBlur(28));g=Image.new('RGBA',f.size,(255,240,220,0));g.putalpha(a.point(lambda v:int(v*0.35)));p.alpha_composite(g,(0,15));p.alpha_composite(f,(0,15))
  p.convert('RGB').save(f'{od}/{i}.webp','WEBP',quality=90);print(i,p.size)
