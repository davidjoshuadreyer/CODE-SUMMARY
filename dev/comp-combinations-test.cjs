const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const items=require('../comp139e/combination-patterns.json');
const {program}=require('./comp-library-data.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-combinations-'));
try{
 for(const x of items){
  const file=path.join(dir,'test.cpp'),exe=path.join(dir,'test');
  let extra='';
  if(x.facets.role==='generic'){
   const kind=x.facets.structure, cls={stack:'Stack',queue:'Queue',list:'List'}[kind],type=cls+(x.facets.type==='template'?'<int>':'');
   const add=kind==='stack'?'push':kind==='queue'?'enqueue':x.facets.storage==='array'?'insert':'addToTail';
   const remove=kind==='stack'?'pop()':kind==='queue'?'dequeue()':x.facets.storage==='array'?'remove(0)':'deleteFromHead()';
   const put=n=>`q.${add}(${add==='insert'?'q.size(), ':''}${n});`;
   extra=`\n${type} q; assert(q.isEmpty()); bool threw=false; try{q.${remove};}catch(const runtime_error&){threw=true;} assert(threw);\n`;
   extra+=`for(int cycle=0;cycle<8;++cycle){${put('1')}${put('2')}assert(q.${remove}==${kind==='stack'?2:1});assert(q.${remove}==${kind==='stack'?1:2});assert(q.isEmpty());}\n`;
   if(x.facets.storage==='array')extra+=`${put('1')}${put('2')}${put('3')}${put('4')}assert(q.isFull());threw=false;try{${put('5')}}catch(const runtime_error&){threw=true;}assert(threw);`;
   else extra+=`${put('99')} // destructor must release remaining nodes\n`;
  }
  const src='#include <cassert>\n'+program(x).replace('    return 0;',extra+'\n    return 0;');
  fs.writeFileSync(file,src);
  execFileSync('clang++',['-std=c++17','-fsanitize=address,undefined','-g',file,'-o',exe],{stdio:'pipe'});
  const output=execFileSync(exe,{encoding:'utf8'});assert.equal(output,x.expectedOutput,x.id);
 }
 assert.equal(new Set(items.map(x=>JSON.stringify([x.facets.structure,x.facets.storage,x.facets.type]))).size,12);
 console.log('PASS: 36 programs, 12 combinations; expected outputs, empty/removal, reuse, capacity and destructor checks under ASan/UBSan.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
