from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote
root=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.links=[];self.decisions=[];self.downloads=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:
   assert a['id'] not in self.ids, a['id'];self.ids.add(a['id'])
  if tag=='a':self.links.append(a.get('href',''))
  if 'data-decision' in a:self.decisions.append(a['data-decision'])
  if 'data-download' in a:self.downloads.append(a['data-download'])
p=Page();p.feed((root/'comp139e/code-templates.html').read_text())
for link in p.links:
 if link.startswith('#'):assert link[1:] in p.ids, link
 elif not link.startswith(('http:','https:','mailto:')):
  assert (root/'comp139e'/unquote(link.split('#')[0].split('?')[0])).exists(),link
assert len(p.decisions)==29
assert len(p.downloads)==114 and all(x in p.ids for x in p.downloads)
for n in range(1,8):assert any(f'139E - Lab {n}.html' in x for x in p.links)
print('PASS: 29 decision routes, 7 original lab links, all internal links, 114 code downloads, unique IDs.')
