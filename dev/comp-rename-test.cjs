const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {renameSource}=require('../comp139e/code-rename.js');
const {items,program}=require('./comp-library-data.cjs');
assert.equal(renameSource('int head; // head\ncout << "head"; head = headCount;','head','first'),'int first; // head\ncout << "head"; first = headCount;');
assert.equal(renameSource('#include <head>\nR"x(head)x"; head;','head','first'),'#include <head>\nR"x(head)x"; first;');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-rename-'));
try{
 for(const [id,changes] of [
  ['combo-queue-linked-template-numbers',[['Queue','JobQueue'],['Node','Link'],['head','first'],['enqueue','add'],['values','jobs']]],
  ['inherit-basic',[['Person','Worker'],['Student','Trainee'],['getName','getLabel'],['s','employee']]],
  ['combo-stack-array-template-numbers',[['Stack','Pile'],['data','storage'],['push','add'],['values','pile']]]
 ]){
  let source=program(items.find(x=>x.id===id));for(const [a,b] of changes)source=renameSource(source,a,b);
  const cpp=path.join(dir,'test.cpp'),exe=path.join(dir,'test');fs.writeFileSync(cpp,source);
  execFileSync('clang++',['-std=c++17','-fsanitize=address,undefined',cpp,'-o',exe]);execFileSync(exe);
 }
 console.log('PASS: identifier-only replacement, preserved strings/comments/includes, compiled class/constructor/destructor/inheritance/member/method/local renames.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
