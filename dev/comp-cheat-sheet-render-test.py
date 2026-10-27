import json,re,subprocess
from html.parser import HTMLParser
from pathlib import Path
root=Path(__file__).resolve().parent.parent
folder=root/'comp139e'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.current=None;self.blocks={};self.assets=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='code' and a.get('id'):self.current=a['id'];self.blocks[self.current]=''
  if tag=='script' and a.get('src'):self.assets.append(a['src'])
  if tag=='link' and a.get('rel')=='stylesheet':self.assets.append(a['href'])
 def handle_data(self,text):
  if self.current:self.blocks[self.current]+=text
 def handle_endtag(self,tag):
  if tag=='code':self.current=None
p=Page();p.feed((folder/'code-templates.html').read_text())
items=json.loads((folder/'midterm-patterns.json').read_text())+json.loads((folder/'code-templates.json').read_text())+json.loads((folder/'lab-patterns.json').read_text())
items+=json.loads((folder/'combination-patterns.json').read_text())
items+=json.loads((folder/'chat-practice.json').read_text())
assert len(items)==114
canonical=json.loads(subprocess.check_output(['node','-e',"const {items,program}=require('./dev/comp-library-data.cjs');process.stdout.write(JSON.stringify(Object.fromEntries(items.map(x=>[x.id,program(x)]))))"],cwd=root,text=True))
for x in items:
 original=x['code'].rstrip()+'\n\n'+x.get('mainSignature','int main()')+' {\n'+'\n'.join('    '+line for line in x['use'].rstrip().split('\n'))+'\n    return 0;\n}\n'
 expected=canonical[x['id']]
 # The generator may add comments, but must preserve every original C++ line.
 original_lines=re.sub(r'[ \t]+$', '', original, flags=re.M).splitlines()
 generated_lines=expected.splitlines()
 cursor=0
 for line in generated_lines:
  if cursor<len(original_lines) and line==original_lines[cursor]:cursor+=1
  else:assert line.lstrip().startswith('//'), (x['id'],'Non-comment insertion',line)
 assert cursor==len(original_lines),x['id']
 assert p.blocks[x['id']+'-program']==expected,x['id']
 assert expected.count('int main(')==1
 assert 'using namespace std;' in expected
 if 'starter' in x:assert p.blocks[x['id']+'-starter'].startswith(re.sub(r'[ \t]+$', '', x['starter'].rstrip(),flags=re.M))
assert not p.assets, 'Offline copy must contain its CSS and JS'
assert len([k for k in p.blocks if k.endswith('-starter')])==24
print('PASS: all 114 highlighted complete programs preserve exact copy text; 24 starters include main; CSS and JS are self-contained.')
