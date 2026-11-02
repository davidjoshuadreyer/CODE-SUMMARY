from PIL import Image
from pathlib import Path
root=Path(__file__).resolve().parents[1];src=root.parent/'tmp/physics-homework';dst=root/'phys210/homework-late-figures';dst.mkdir(exist_ok=True)
pages={
'9-1':[('26-3',106,192),('26-6',194,318),('26-8',318,450)],'9-2':[('26-21',74,224),('26-24',230,340),('26-28',340,528)],'9-3':[('26-39',78,145),('26-43',147,252),('26-51',253,465)],
'11-1':[('27-37',90,234),('27-41',248,457)],'11-2':[('27-42',73,240),('27-56',243,395)],'11-3':[('27-65',73,347),('27-69',350,562)],
'12-1':[('28-29',271,404),('28-34',405,477)],'12-2':[('28-40',86,236),('28-43',239,380),('28-57',381,433),('28-61',435,502)],'12-3':[('28-62',74,249),('28-64',250,430)],'12-4':[('28-65',74,232),('28-72',234,348)],
'13 new-1':[('29-25',89,230),('29-26',231,351),('29-29',352,540)],'13 new-2':[('29-42',100,191),('30-9',192,255),('30-11',256,331),('30-23',354,424),('30-25',425,518)]}
for fn,items in pages.items():
 im=Image.open(src/('PHYS 210 Homework '+fn+'.png'));k=im.width/460
 for id,t,b in items:im.crop((int(48*k),int((t-20)*k),int(420*k),int((b-20)*k))).save(dst/(id+'-question.png'))
for fn,items in {'PHYS 210 Hmwk 10-1.png':[('27-1',104,158),('27-4',160,226),('27-7',227,327),('27-10',328,384),('27-19',385,541)],'PHYS 210 Hmwk 10-2.png':[('27-21',85,184),('27-24',201,312),('27-27',313,400),('27-29',401,537)],'PHYS 210 Homework 9 Supplemental Chapter 25 Resistivity-1.png':[('25-59',119,232)]}.items():
 im=Image.open(src/fn);k=im.width/490
 for id,t,b in items:im.crop((int(52*k),int((t-30)*k),int(330*k),int((b-30)*k))).save(dst/(id+'-question.png'))
# Keep only assigned26.28 alongside its shared circuit; remove adjacent26.29.
from PIL import ImageDraw,ImageChops
p=dst/'26-28-question.png';im=Image.open(p);ImageDraw.Draw(im).rectangle((0,195,590,im.height),fill='white');im=im.crop((0,0,im.width,370));im.save(p)
# Preserve the whole27.29 diagram while excluding the next question at lower left.
im=Image.open(src/'PHYS 210 Hmwk 10-2.png');k=im.width/490
im=im.crop((int(52*k),int((401-30)*k),int(330*k),int((547-30)*k)))
ImageDraw.Draw(im).rectangle((0,int((534-401)*k),int((690-552)*k),im.height),fill='white');im.save(dst/'27-29-question.png')
# Trim blank margins, retaining a white border.
for p in dst.glob('*-question.png'):
 im=Image.open(p).convert('RGB');mask=ImageChops.difference(im,Image.new('RGB',im.size,'white')).convert('L').point(lambda v:255 if v>70 else 0);b=mask.getbbox()
 if b:
  im=im.crop(b);out=Image.new('RGB',(im.width+24,im.height+24),'white');out.paste(im,(12,12));out.save(p)

# Remove the unrelated upper-right circuit; retain the question text below it.
p=dst/'26-8-question.png';im=Image.open(p);ImageDraw.Draw(im).rectangle((610,0,im.width,270),fill='white');im.save(p)
