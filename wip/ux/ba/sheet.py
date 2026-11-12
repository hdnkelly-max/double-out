# Hayden's before/after sheet: live 3.05 at 390 (left) vs prototype v5 (right), one row pair per screen
import sys
from PIL import Image, ImageDraw, ImageFont
L='/home/claude/homewt/wip/ux/ba/live/'; P='/home/claude/homewt/wip/ux/proto/'
pairs=[('Tonight','live_tonight.png','shot_tonight_390.png'),('Shop','live_shop.png','shot_shop_390.png'),('Locker · Loadout','live_locker.png','shot_locker_390.png'),('Locker · Cards','live_cards.png','shot_cards_390.png'),
       ('Result · win','before_a.png','shot_result_390.png'),('Result · loss','liveloss_a.png','shot_resultloss_390.png'),
       ('Exhibition poster (Barney test)','live_poster.png','shot_exhposter_390.png'),('Exhibition Tonight (Barney test)','live_tonight.png','shot_exhtonight_390.png')]
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26); f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
except: F=f=ImageFont.load_default()
W,H=390,844; cw=2*W+40; cols=4; rows=(len(pairs)+cols-1)//cols
sheet=Image.new('RGB',(cols*(cw+40)+40,rows*(H+90)+40),(10,11,12)); d=ImageDraw.Draw(sheet)
for i,(t,a,b) in enumerate(pairs):
  x=40+(i%cols)*(cw+40); y=40+(i//cols)*(H+90)
  d.text((x,y),t,font=F,fill=(240,240,236)); d.text((x,y+34),'BEFORE · live 3.05',font=f,fill=(150,156,160)); d.text((x+W+40,y+34),'AFTER · prototype v7',font=f,fill=(215,35,45))
  for j,src in enumerate([L+a,P+b]):
    im=Image.open(src).convert('RGB'); im=im.resize((W,int(im.size[1]*W/im.size[0]))).crop((0,0,W,H)); sheet.paste(im,(x+j*(W+40),y+64))
sheet.save(sys.argv[1],quality=86); print(sheet.size)
