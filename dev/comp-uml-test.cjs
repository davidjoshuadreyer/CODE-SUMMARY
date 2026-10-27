const assert=require('node:assert/strict'),uml=require('./comp-uml.cjs'),data=require('../comp139e/code-symbols.json'),{items,program}=require('./comp-library-data.cjs');
for(const x of items){const svg=uml(x.id,data[x.id].symbols,program(x));assert(svg.includes('<svg'));for(const match of svg.matchAll(/href="#([^"]+)"/g))assert(match[1].startsWith(x.id+'-program-L'));assert(!svg.includes('undefined'));}
const basic=uml('inherit-basic',data['inherit-basic'].symbols,program(items.find(x=>x.id==='inherit-basic')));
assert(basic.includes('Student → Person'));assert(basic.includes('- name : string'));assert(basic.includes('+ getName() : string'));assert(basic.includes('marker-end="url(#inherit-basic-triangle)"'));
const stack=uml('stack-core',data['stack-core'].symbols,program(items.find(x=>x.id==='stack-core')));
assert(stack.includes('Stack → Stack::stackNode'));assert(stack.includes('Stack::stackNode → Stack::stackNode'));assert(stack.includes('ownership not inferred'));
const func=uml('value-function',data['value-function'].symbols,program(items.find(x=>x.id==='value-function')));assert(func.includes('Function &amp;')||func.includes('Function & data'));assert(func.includes('main()'));
console.log('PASS: 114 diagrams; inheritance direction, visibility, node associations, function-only maps and source links.');
