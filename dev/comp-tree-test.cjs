const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const examples=require('../comp139e/tree-patterns.json');
const {program}=require('./comp-library-data.cjs');
const facet=require('./comp-facets.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-trees-'));
function run(x, expected) {
 const cpp=path.join(dir,'tree.cpp'),bin=path.join(dir,'tree');
 fs.writeFileSync(cpp,program(x));
 execFileSync('clang++',['-std=c++17','-Wall','-Wextra','-pedantic-errors','-fsanitize=address,undefined',cpp,'-o',bin]);
 assert.equal(execFileSync(bin,{encoding:'utf8'}),expected,x.id);
}
try {
 for(const x of examples){
  run(x,x.expectedOutput);
  assert.deepEqual(facet(x).structure,['tree']);
  console.log('PASS '+x.id+' expected output + sanitizers');
 }
 const metrics=examples.find(x=>x.id==='tree-metrics');
 run({...metrics,code:'#include <cassert>\n'+metrics.code,use:`BST t;
assert(t.height() == -1 && t.countNodes() == 0 && t.countLeaves() == 0);
t.insert(5);
assert(t.height() == 0 && t.countLeaves() == 1);
t.insert(5); t.insert(5); t.insert(6);
assert(t.height() == 3 && t.countNodes() == 4 && t.countLeaves() == 1);
t.clear(); t.clear();
assert(t.isEmpty() && t.height() == -1);
t.insert(2); assert(t.countNodes() == 1);`},'');
 for(const id of ['tree-search','tree-clear']) {
 const x=examples.find(x=>x.id===id);
 run({...x,code:'#include <cassert>\n'+x.code,use:`BST t; assert(!t.contains(1));
for(int i=0;i<100;i++) t.insert(i);
assert(t.contains(0) && t.contains(99) && !t.contains(100));
t.clear(); assert(!t.contains(0));`},'');
 }
 for(const id of ['tree-traversals','tree-breadth']) {
 const x=examples.find(x=>x.id===id);
 run({...x,use:'BST t; '+(id==='tree-breadth'?'t.breadthFirst();':'t.preorder(); t.inorder(); t.postorder();')},id==='tree-breadth'?'\n':'\n\n\n');
 }
 console.log('PASS empty/single/duplicate/skewed trees, missing searches, repeated clear and reuse');
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
