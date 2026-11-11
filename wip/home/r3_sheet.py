# contact sheet: today's title screen + both generations per direction (v1 top row, v2 bottom row)
from PIL import Image, ImageDraw
import sys
W,H=284,615
sheet=Image.new('RGB',(W*4+50,H*2+30),(14,14,16))
base=Image.open('r3_baseline_today.png').convert('RGB').resize((W,H),Image.LANCZOS)
sheet.paste(base,(10,10))
for c,d in enumerate(['broadcast','luxury','pub']):
    for r,v in enumerate([1,2]):
        try: sheet.paste(Image.open(f'gen3/{d}_v{v}.png').convert('RGB').resize((W,H),Image.LANCZOS),(10+(c+1)*(W+10),10+r*(H+10)))
        except FileNotFoundError: pass
sheet.save('gen3/contact_sheet.jpg',quality=88)
