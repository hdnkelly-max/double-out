import sys
from PIL import Image
# usage: prep.py src dst [rgba]
src,dst=sys.argv[1],sys.argv[2]
im=Image.open(src)
im=im.resize((700,1050),Image.LANCZOS)
im.save(dst,'WEBP',quality=88,method=6)
print(dst,im.size,im.mode)
