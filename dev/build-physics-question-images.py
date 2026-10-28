"""Render original source-page screenshots. Run with the bundled PDF Python runtime.
Only selected exercise pages are exported, not the complete textbook or manual.
"""
import json,re,subprocess,argparse
from pathlib import Path
from PIL import Image,ImageChops,ImageOps
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--downloads',type=Path,default=Path.home()/'Downloads');args=ap.parse_args()
out=root/'phys210/midterm-images';out.mkdir(exist_ok=True)
manifest=json.loads((root/'phys210/midterm-2-manifest.json').read_text())
tutorials={p['id']:p for p in json.loads((root/'phys210/tutorial-data.json').read_text())}
book=args.downloads/'University Physics with Modern Physics 15th Edition By Hugh D. Young.pdf'
bookpages={'22.24':[762],'22.25':[762],'22.40':[763],'22.42':[763],'22.47':[764],'22.50':[764],'22.52':[764],'23.75':[798],'24.17':[826],'24.20':[826],'24.21':[826],'24.30':[827],'24.31':[827],'24.34':[827],'24.35':[827],'24.36':[827],'24.39':[827],'24.42':[828],'24.44':[828],'24.49':[828],'24.52':[828,826],'24.55':[829,826],'24.57':[829],'24.71':[831],'24.72':[831],**{f'VP24.11.{i}':[824] for i in range(1,5)}}
hwpages={'22.15':1,'22.19':1,'22.21':1,'22.33':1,'22.37':2,'23.1':1,'23.5':1,'23.7':1,'23.8':1,'23.19':1,'23.27':2,'23.44':1,'23.55':1,'23.59':1,'24.1':1,'24.3':2,'24.7':2,'24.8':1,'24.12':1,'24.14':1,'24.24':2,'24.36':2,'24.66':2,'24.68':3}
result={};rendered={}
for p in manifest['problems']:
 if p['kind']=='textbook':
  source=book;pages=bookpages[p['number']];prefix='book';label='University Physics, 15th edition'
 elif p['kind']=='tutorial':
  t=tutorials[p['id']];source=root/'phys210'/t['source']['url'];pages=t['pages'];prefix=f"tutorial{t['tutorial']}";label=f"Tutorial {t['tutorial']}"
 else:
  h=int(p['source'].split()[1]);source=args.downloads/(f'PHYS 210 Homework {h}.pdf' if h!=4 else 'PHYS 210 Homework #4 (1).pdf');pages=[hwpages[p['number']]];prefix=f'hw{h}';label=f'Homework {h}'
 shots=[]
 for i,page in enumerate(pages):
  stem=f'{prefix}-{page}';dest=out/(stem+'.jpg')
  if not dest.exists():
   subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-singlefile','-scale-to','2200','-jpeg','-jpegopt','quality=90',str(source),str(out/stem)],check=True)
  if stem not in rendered:
   with Image.open(dest) as im:
    # Trim only blank outer margins; retain all source text and diagrams.
    mask=im.convert('L').point(lambda p: 255 if p<235 else 0)
    bounds=mask.getbbox()
    if bounds:
     im=ImageOps.expand(im.crop(bounds),border=24,fill='white')
    im.save(dest,quality=90)
   rendered[stem]=True
  with Image.open(dest) as im: w,h=im.size
  shots.append({'src':'midterm-images/'+dest.name,'width':w,'height':h,'page':page,'label':label,'note':f"Original question {p['number']}" if i==0 else 'Referenced circuit diagram (E24.17 / E24.20)','printedPage':page-20 if prefix=='book' else page})
 result[p['id']]=shots
(root/'phys210/midterm-2-images.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'Rendered screenshots for {len(result)} questions, {len(set(s["src"] for ss in result.values() for s in ss))} unique pages.')
