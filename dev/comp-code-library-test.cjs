const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const items=require('../comp139e/code-templates.json');
const root=path.join(__dirname,'..','comp139e');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-library-'));
try {
 for(const item of items){
  assert(fs.existsSync(path.join(root,item.reference)),item.id+' source link');
  const folder=path.join(dir,item.id);fs.mkdirSync(folder);
  const cpp=path.join(folder,'example.cpp'),bin=path.join(folder,'example');
  fs.writeFileSync(cpp,'#include <iostream>\n#include <cassert>\n'+item.code+'\nint main(){\n'+item.use+'\n'+item.test+'\n}\n');
  execFileSync('clang++',['-std=c++17','-Wall','-Wextra','-pedantic-errors','-fsanitize=address,undefined',cpp,'-o',bin],{stdio:'pipe'});
  execFileSync(bin,[],{cwd:folder,stdio:'pipe'});
  console.log('PASS '+item.id);
 }
} finally {fs.rmSync(dir,{recursive:true,force:true});}
