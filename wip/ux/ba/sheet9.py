# v8 (Hayden's 17:52 shots) vs v9, per screen, with the section changes listed under each pair
import sys
from PIL import Image, ImageDraw, ImageFont
P='/home/claude/homewt/wip/ux/proto/'
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',24);f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',17)
pairs=[('Tonight','shot_tonight_390.png','v9_tonight_390.png',['Head-to-head: faces + tug bar, numbers big','Season: position dots + cut line, taps to Season','Money match: back-room art, stake chip, plays','Next dart: whole dart strip + level meter','Goal: meter to 61 with your form, +$40 chip']),
 ('Shop · locked','shot_shoplocked_390.png','v9_shoplocked_390.png',['Product: whole dart, contain, same backdrop','Compare: yours vs this bars + coloured delta','Weight as a chip','Lock panel: level + price chips, meter, way forward','All darts: whole-dart thumbnails, state labels']),
 ('Shop','shot_shop_390.png','v9_shop_390.png',['Buy: price and balance after in the button','Brand chip + name, state chip (New/Owned/Equipped)','Littler: sponsor set, never sold (brief)']),
 ('Locker · Loadout','shot_locker_390.png','v9_locker_390.png',['Level ring + XP to next + the next unlock','Your game: segmented bars to the cap, darts bonus as ghost, + to spend','Kit: 1:1 tiles, real dart and real shirt images','Cards waiting: pack art row']),
 ('Locker · Cards','shot_cards_390.png','v9_cards_390.png',['Pack card: pack art, set meter, one primary','Filters + grid unchanged']),
 ('Locker · Stats','','v9_stats_390.png',['New: 4 stat tiles + form chart vs goal + records']),
 ('Locker · Trophies','','v9_trophies_390.png',['New: cabinet image + won / to-win rows']),
 ('Season','','v9_season_390.png',['New: week ring + position, table with cut line, road to the Palace, next fixture']),
 ('Result · win','shot_result_390.png','v9_result_390.png',['Match average tug bar + chips','Rewards: level ring, cash big, XP','Next dart: whole dart + $ progress','Pack: art + Open, season movement chip']),
 ('Result · loss','shot_resultloss_390.png','v9_resultloss_390.png',['Match summary, work-on row routes to Practice']),
 ('Exhibition Tonight','shot_exhtonight_390.png','v9_exhtonight_390.png',['Stakes as chips, tries as a meter, entry on the button'])]
W,H=390,844;cw=2*W+30;cols=4;rows=(len(pairs)+cols-1)//cols;LH=140
sheet=Image.new('RGB',(cols*(cw+40)+40,rows*(H+84+LH)+40),(10,11,12));d=ImageDraw.Draw(sheet)
for i,(t,a,b,notes) in enumerate(pairs):
  x=40+(i%cols)*(cw+40);y=40+(i//cols)*(H+84+LH)
  d.text((x,y),t,font=F,fill=(240,240,236));d.text((x,y+32),'BEFORE · v8 (your 17:52 shots)',font=f,fill=(150,156,160));d.text((x+W+30,y+32),'AFTER · v9',font=f,fill=(215,35,45))
  for j,src in enumerate([a,b]):
    if not src:
      d.rectangle((x,y+60,x+W,y+60+H),fill=(22,24,26));d.text((x+20,y+60+H//2),'v8: placeholder only',font=f,fill=(120,126,130));continue
    im=Image.open(P+src).convert('RGB');im=im.resize((W,int(im.size[1]*W/im.size[0]))).crop((0,0,W,H));sheet.paste(im,(x+j*(W+30),y+60))
  for k,n in enumerate(notes): d.text((x,y+70+H+k*24),'• '+n,font=f,fill=(200,205,202))
sheet.save(sys.argv[1],quality=85);print(sheet.size)
