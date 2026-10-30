import json
from pathlib import Path
import pdfplumber
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1];out=root/'phys210/practice-tests';m=json.loads((out/'manifest.json').read_text());ps={p['id']:p for p in m['problems']};counts={}
for t in m['tests']:
 expected=sum(len(ps[id]['shots']) for id in t['ids']);total=0
 with pdfplumber.open(out/t['pdf']) as doc:
  counts[t['id']]=len(doc.pages)
  for p in doc.pages:
   assert (p.width,p.height)==(612,1008)
   assert p.images,('Question-free page',t['id'],p.page_number)
   for im in p.images:
    assert im['x0']>=39 and im['x1']<=573 and im['top']>=30 and im['bottom']<=963,(t['id'],im)
   total+=len(p.images)
  assert total==expected,(t['id'],total,expected)
  text='\n'.join(p.extract_text() or '' for p in doc.pages)
  for n,id in enumerate(t['ids'],1):assert 'Question '+ps[id]['number'] in text,(t['id'],id)
  assert 'Choose 3 of the following 4 problems.' in text if t['kind']=='main' else True
 for p in PdfReader(out/t['pdf']).pages:assert p.get('/Annots'),'Missing solution hyperlink'
for kind,name in [('main','main-tests.pdf'),('bonus','bonus-tests.pdf'),('angle','angle-preparation.pdf'),('supplement','supplementary-tests.pdf')]:assert len(PdfReader(out/name).pages)==sum(counts[t['id']] for t in m['tests'] if t['kind']==kind)
print('PASS: 31 PDFs; legal-size pages; all source crops included; no question-free pages, image clipping or missing solution links; bundle counts match.')
