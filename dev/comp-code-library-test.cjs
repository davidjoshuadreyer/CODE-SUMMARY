const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const items=require(process.argv.includes('--labs')?'../comp139e/lab-patterns.json':process.argv.includes('--midterm')?'../comp139e/midterm-patterns.json':'../comp139e/code-templates.json');
const root=path.join(__dirname,'..','comp139e');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-library-'));
try {
 for(const item of items){
  assert(fs.existsSync(path.join(root,item.reference)),item.id+' source link');
  const folder=path.join(dir,item.id);fs.mkdirSync(folder);
  const cpp=path.join(folder,'example.cpp'),bin=path.join(folder,'example');
  fs.writeFileSync(cpp,'#include <iostream>\n#include <cassert>\n'+item.code+'\n'+(item.mainSignature||'int main()')+'{\n'+item.use+'\n'+item.test+'\n}\n');
  execFileSync('clang++',['-std=c++17','-Wall','-Wextra','-pedantic-errors','-fsanitize=address,undefined',cpp,'-o',bin],{stdio:'pipe'});
  for(const [name,content] of Object.entries(item.fixtures||{}))fs.writeFileSync(path.join(folder,name),content);
  execFileSync(bin,item.runArgs||[],{cwd:folder,stdio:'pipe',input:item.stdin||''});
  console.log('PASS '+item.id);
 }
} finally {fs.rmSync(dir,{recursive:true,force:true});}
