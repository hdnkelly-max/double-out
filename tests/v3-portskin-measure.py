import sys,json,colorsys
from PIL import Image
import numpy as np
d=sys.argv[1];bases=sys.argv[2].split(',');ks=sys.argv[3].split(',')
def L(c):return .2126*c[0]+.7152*c[1]+.0722*c[2]
def skin(c):
  h,s,v=colorsys.rgb_to_hsv(*(np.array(c)/255));return (h*360<40 or h*360>350) and s>.3 and v>.2
rows=[]
for b in bases:
  P=json.load(open(f'{d}/{b}_pts.json'));M=np.asarray(Image.open(f'{d}/{b}_match.png').convert('RGB')).astype(float)
  imgs={k:np.asarray(Image.open(f'{d}/{b}_k{k}.jpg').convert('RGB')).astype(float) for k in ks}
  out={'base':b}
  for reg,pts in P.items():
    keep=[(x,y) for x,y in pts if 1<=x<255 and 1<=y<255 and skin(M[y,x]) and all(skin(imgs[k][y,x]) for k in ks[:1])]
    if len(keep)<4:out[reg]=None;continue
    def med(A):return np.median(np.array([A[y-1:y+2,x-1:x+2].reshape(-1,3).mean(0) for x,y in keep]),axis=0)
    m=med(M);out[reg]={'n':len(keep),'match':round(L(m),1),**{k:round(L(med(imgs[k])),1) for k in ks}}
  rows.append(out)
print(json.dumps(rows,indent=0))
for r in rows:
  regs=[g for g in ('forehead','cheek','jaw') if r.get(g)]
  for k in ks:
    errs=[r[g][k]-r[g]['match'] for g in regs];print(r['base'],'k',k,' '.join(f"{g}:{r[g][k]:.0f}/{r[g]['match']:.0f}({r[g][k]-r[g]['match']:+.0f})" for g in regs),' mean|err| %.1f'%np.mean(np.abs(errs)))
