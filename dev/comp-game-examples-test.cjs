const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const execFile=require('node:util').promisify(require('node:child_process').execFile);
const examples=require('../comp139e/game-examples.json');
const {items,program}=require('./comp-library-data.cjs');
const {execFileSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-exam-drills-'));
(async()=>{try {
 assert.equal(examples.length,20);assert.equal(new Set(examples.map(x=>x.id)).size,20);
 assert.equal(examples.filter(x=>x.facets.structure==='inheritance').length,10);
 // Compare with the last published revision: existing example contents stay byte-identical.
 const baseline=JSON.parse(execFileSync('git',['show','fc0fd8d:comp139e/code-symbols.json'],{encoding:'utf8',maxBuffer:20*1024*1024}));
 for(const [id,old] of Object.entries(baseline)){
  const x=items.find(x=>x.id===id);assert(x,'Missing old example '+id);
  assert.equal(crypto.createHash('sha256').update(program(x)).digest('hex'),old.sha256,'Changed existing code: '+id);
 }
 let index=0;
 async function worker(){while(index<examples.length){
  const x=examples[index++];
  for(const edge of [false,...(x.checks?[true]:[])]){
   const cpp=path.join(dir,x.id+(edge?'-edge':'')+'.cpp'),bin=cpp.slice(0,-4);
   const test=edge?{...x,code:'#include <cassert>\n#include <sstream>\n'+x.code,use:x.checks}:x;
   fs.writeFileSync(cpp,program(test));
   await execFile('clang++',['-std=c++17','-Wall','-Wextra','-pedantic-errors','-fsanitize=address,undefined',cpp,'-o',bin]);
   const result=await execFile(bin);assert.equal(result.stdout,edge?'':x.expectedOutput,x.id);
  }
  console.log('PASS '+x.id+(x.checks?' + edge cases':''));
 }}
 await Promise.all(Array.from({length:4},worker));
 console.log('PASS all 20 compiled game solutions and edge cases; all 180 existing programs unchanged.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1;});
