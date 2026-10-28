"""Build per-question/source-solution crops from the reviewed crop manifest.
Run with the bundled PDF Python runtime. Manual crops are private QA previews;
only their normalized rectangles are published for authenticated browser cropping.
"""
import argparse,json,subprocess,hashlib
from pathlib import Path
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1];ap=argparse.ArgumentParser();ap.add_argument('--downloads',type=Path,default=Path.home()/'Downloads');args=ap.parse_args()
cache=root/'tmp/midterm-crops';cache.mkdir(parents=True,exist_ok=True)
out=root/'phys210/midterm-crops';out.mkdir(exist_ok=True)
spec=json.loads((root/'dev/physics-midterm2-crops.json').read_text());problems={p['id']:p for p in json.loads((root/'phys210/midterm-2-manifest.json').read_text())['problems']}
files={'book':args.downloads/'University Physics with Modern Physics 15th Edition By Hugh D. Young.pdf','manual':args.downloads/'Solutions Manual PHYS 210.pdf','sol4':args.downloads/'4 P210 Solutions 4 2022.pdf','sol5':args.downloads/'5 P210 Solutions to Tutorial 5 2022.pdf',**{f'tutorial{t}':root/f'phys210/tutorial-sources/tutorial-0{t}.pdf' for t in range(4,8)}}
def source(s):
 name=s['source']
 if name.startswith('saved-'):return root/'phys210/midterm-images'/(name[6:]+'.jpg')
 stem=cache/f'{name}-{s["page"]}';f=stem.with_suffix('.jpg')
 if not f.exists():
  subprocess.run(['pdftoppm','-f',str(s['page']),'-l',str(s['page']),'-singlefile','-scale-to','1400' if name=='manual' else '1800' if name.startswith('sol') else '2200','-jpeg','-jpegopt','quality=92',str(files[name]),str(stem)],check=True)
 return f

def crop(s,target):
 with Image.open(source(s)) as im:
  w,h=im.size;x0,y0,x1,y1=s['box'];assert 0<=x0<x1<=1 and 0<=y0<y1<=1
  im=im.crop((int(x0*w),int(y0*h),int(x1*w),int(y1*h)))
  if not s['source'].startswith('sol4'):
   bounds=im.convert('L').point(lambda v:255 if v<215 else 0).getbbox()
   if bounds:im=im.crop(bounds)
  im=ImageOps.expand(im,border=14,fill='white');im.save(target,quality=92)
  return im.size
images={};solutions={}
for id,shots in spec['questions'].items():
 p=problems[id];images[id]=[]
 for i,s in enumerate(shots):
  name=f'{id}-q{i+1}.jpg';w,h=crop(s,out/name)
  images[id].append({'src':'midterm-crops/'+name,'width':w,'height':h,'page':s['page'],'printedPage':s['page']-20 if p['kind']=='textbook' else s['page'],'label':p['source'],'note':s['note'] or f"Original question {p['number']}"})
for id,shots in spec['tutorialSolutions'].items():
 solutions[id]=[]
 for i,s in enumerate(shots):
  name=f'{id}-s{i+1}.jpg';w,h=crop(s,out/name);t=int(id[1]);solutions[id].append({'src':'midterm-crops/'+name,'width':w,'height':h,'page':s['page'],'label':f'D2L posted Tutorial {t} solution','url':f'https://online.camosun.ca/d2l/le/content/348967/viewContent/{5448852+t}/View'})
for num,shots in spec['manual'].items():
 assert shots,num
 for i,s in enumerate(shots):crop(s,cache/f'manual-crop-{num}-{i+1}.jpg')
(root/'phys210/midterm-2-images.json').write_text(json.dumps(images,indent=2)+'\n')
(root/'phys210/midterm-2-tutorial-solutions.json').write_text(json.dumps({'verified':'2026-10-28','solutions':solutions,'notes':{},'availableTutorials':[1,2,3,4,5]},indent=2)+'\n')
(root/'phys210/midterm-2-manual-crops.json').write_text(json.dumps(spec['manual'],indent=2)+'\n')
print(f'{len(images)} cropped questions, {len(solutions)} posted tutorial solutions, {len(spec["manual"])} cropped manual matches.')
