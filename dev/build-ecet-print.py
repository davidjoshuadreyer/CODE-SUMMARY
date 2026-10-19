"""Print the original question screenshots, once per source page."""
import json
from pathlib import Path
from collections import OrderedDict
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import letter
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'ecet250e/study-data.json').read_text())
pages=OrderedDict()
# These source slides are empty working/solution placeholders, visually verified.
blank={f'study-figures/9f385d3f65d872f8-p{n}.webp' for n in [23,25,26,28,29,36]}
for q in data:
    for f in q['figures']:
        if f['url'] not in blank:
            pages.setdefault(f['url'],{'figure':f,'questions':[]})['questions'].append(q)
assert all(any(f['url'] in pages for f in q['figures']) for q in data)
out=root/'ecet250e/ecet-original-questions-print.pdf'
c=canvas.Canvas(str(out),pagesize=letter,pageCompression=1)
c.setTitle('ECET 250E - Original question screenshots')
c.setAuthor('Tesselate')
for n,(url,entry) in enumerate(pages.items(),1):
    qs=entry['questions'];q=qs[0]; f=entry['figure']
    section='Quiz 1' if q['kind']=='quiz' else f"Chapter {q['chapter']} / "+('Lecture questions' if q['kind']=='lecture' else 'Extra practice from key (answers included)' if q['kind']=='extra' else 'Problem set')
    c.bookmarkPage(f'p{n}')
    c.addOutlineEntry(f'{section} - source page {f["page"]}',f'p{n}',level=0)
    c.setFont('Helvetica',9);c.setFillColorRGB(.25,.25,.25)
    c.drawString(30,766,'ECET 250E | '+section)
    c.drawRightString(582,766,f'{n} / {len(pages)}')
    im=Image.open(root/'ecet250e'/url).convert('RGB')
    w,h=im.size; scale=min(552/w,714/h); dw,dh=w*scale,h*scale
    c.drawImage(ImageReader(im),30+(552-dw)/2,748-dh,width=dw,height=dh)
    c.setFont('Helvetica',7)
    c.drawString(30,20,f'Original source screenshot - source page {f["page"]}')
    c.showPage()
c.save()
print(f'{len(data)} questions covered by {len(pages)} screenshot pages; {out.stat().st_size:,} bytes')
