const assert=require('node:assert/strict'),fs=require('node:fs');
const data=require('../comp139e/code-symbols.json');
const {items,program}=require('./comp-library-data.cjs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../comp139e/code-templates.html'),'utf8');
const all=nodes=>nodes.flatMap(n=>[n,...all(n.children)]);
for(const x of items){
 const symbols=all(data[x.id].symbols);
 assert.equal(symbols.filter(n=>n.name==='main').length,1,x.id+' main');
 const source=program(x);
 for(const n of symbols){
  assert(source.split('\n')[n.line-1].includes(n.name.replace(/<.*>/,'')),x.id+' '+n.name+' line '+n.line);
  assert(html.includes(`id="${x.id}-program-L${n.line}"`),x.id+' target missing');
 }
}
const basic=data['inherit-basic'].symbols;
assert(basic.find(n=>n.name==='Student').bases.some(b=>b.name==='Person'));
assert(basic.find(n=>n.name==='main').children.some(n=>n.name==='s'&&n.kind==='local'));
assert(basic.find(n=>n.name==='Person').children.find(n=>n.name==='Person').children.some(n=>n.name==='name'&&n.kind==='parameter'));
const stack=all(data['stack-core'].symbols);
assert(stack.some(n=>n.name==='next'&&n.kind==='member'));
assert(stack.some(n=>n.name==='topOfStack'&&n.kind==='member'));
assert(html.includes('definition outside class'));
console.log('PASS: All compiler outlines, definition line targets, inheritance, fields, parameters and locals.');
