const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const items=require('../comp139e/chat-practice.json');const {program}=require('./comp-library-data.cjs');const facet=require('./comp-facets.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'chat-practice-'));
try{for(const x of items){
 const cpp=path.join(dir,'test.cpp'),bin=path.join(dir,'test');
 fs.writeFileSync(cpp,program(x));execFileSync('clang++',['-std=c++17','-Wall','-Wextra','-pedantic-errors','-fsanitize=address,undefined',cpp,'-o',bin],{stdio:'pipe'});
 assert.equal(execFileSync(bin,{encoding:'utf8'}),x.expectedOutput,x.id);
 assert(x.question.length>=3);console.log('PASS '+x.id);
}
const both=facet(items.find(x=>x.id==='practice-job-queue'));assert(both.structure.includes('queue')&&both.structure.includes('inheritance'));assert.equal(both.storage,'linked');assert.equal(both.type,'template');
assert.equal(facet(items.find(x=>x.id==='practice-job-inheritance')).type,'int');
console.log('PASS: exact expected output, sanitizer runs and filter placement for all 3 chat questions.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
