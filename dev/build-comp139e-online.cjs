// Build the smallest independent project for each course program.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../comp139e/workspace');
const programs=require('../comp139e/programs.json');
const exists=f=>fs.existsSync(path.join(root,f));
const read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/^\uFEFF/,'');
const functions=['basics','inputAndDecisions','functions','arraysAndStrings','pointers','modulesAndTesting','classes','inheritance','templates','linkedLists','stacksAndQueues','files','exceptions','vectors','control','harmonicMotion','integration','referenceDemo'];
const recipes={};
for(const p of programs.filter(p=>p.runnable)){
 const [kind,id]=p.id.split(':'),includes=['.','labs/lab03','labs/lab05'];
 const queue=[...p.files],files=new Set(),defines={};let declaration,call;
 if(kind==='tutorial'){
  declaration='#include "tutorials/Tutorials.hpp"';call=`return tutorials::${functions[Number(id)-1]}();`;
  if(id==='18')queue.push('reference/examples/Demo/CricleX.cpp');
 }else if(kind==='lab'){
  declaration=`#include "labs/lab${id.padStart(2,'0')}/lab.hpp"`;
  call=`return lab${id.padStart(2,'0')}::run(${['3','4'].includes(id)?'argc, argv':''});`;
  if(id==='3')defines['labs/lab03/testTrigMain.cpp']='lab03InstructorMain';
 }else{
  declaration=`int ${id}();`;call=`return ${id}();`;
  if(id==='circleXDemo'){declaration='#include "reference/examples/Demo/AllTests.h"';call='CircleX circle; circle.printArea(); return 0;';}
  if(['shapeExample','trigTests','controllerExample'].includes(id)){
   declaration=`int ${id}(int, ${id==='controllerExample'?'const ':''}char*[]);`;call=`return ${id}(argc, argv);`;defines[p.source]=id;
   if(id==='controllerExample')call='const char* args[] = {"controllerExample", nullptr}; return controllerExample(1, args);';
  }
  if(id==='testBadAllocExceptionDemo')queue.push('examples/BoundedAllocation.cpp');
 }
 while(queue.length){
  const file=path.posix.normalize(queue.shift());
  // The tutorial dispatcher references all lessons and must not be linked here.
  if(file==='tutorials/Tutorials.cpp'||files.has(file)||!exists(file))continue;
  files.add(file);
  for(const [,include] of read(file).matchAll(/^\s*#include\s+"([^"]+)"/gm)){
   const candidate=[path.posix.join(path.posix.dirname(file),include),...includes.map(d=>path.posix.join(d,include))].map(f=>path.posix.normalize(f)).find(exists);
   if(!candidate)throw Error(`${p.id}: missing include ${include}`);
   queue.push(candidate);
   if(/\.(h|hpp)$/.test(candidate))queue.push(candidate.replace(/\.(h|hpp)$/,'.cpp'));
  }
 }
 const entries=[...files].map(name=>({name,url:'workspace/'+name}));
 const output=[];
 if(p.fileArgs){entries.push({name:p.inputFile,url:'workspace/'+p.inputFile});output.push(p.outputFile);}
 if(kind==='example'&&p.source.includes('Files_and_Exception_Handling/')){
  for(const name of fs.readdirSync(path.join(root,'reference/examples/Files_and_Exception_Handling/Files'))){
   const target='src/Files_and_Exception_Handling/Files/'+name;
   entries.push({name:target,url:'workspace/reference/examples/Files_and_Exception_Handling/Files/'+name});output.push(target);
  }
 }
 const entry=`// Entry point for this course program. Edit its source files using the selector.\n#include <iostream>\n#include <exception>\n${declaration}\nint main(int argc, char* argv[]) {\n try {\n${kind==='example'?'  std::cin.exceptions(std::ios::failbit | std::ios::badbit);\n':''}  ${call}\n } catch (const std::exception& e) { std::cerr << e.what() << '\\n'; return 1; }\n catch (...) { std::cerr << "Uncaught exception\\n"; return 1; }\n}\n`;
 entries.push({name:'online_main.cpp',content:entry});
 recipes[p.id]={files:entries,units:[...files].filter(f=>f.endsWith('.cpp')).map(file=>({file,...(defines[file]?{rename:defines[file]}:{})})).concat({file:'online_main.cpp'}),includes,standard:kind==='example'?14:17,args:kind==='lab'&&p.fileArgs?[p.inputFile,p.outputFile]:[],output};
}
fs.writeFileSync(path.resolve(__dirname,'../comp139e/online.json'),JSON.stringify(recipes,null,2)+'\n');
console.log(`Built ${Object.keys(recipes).length} online C++ project recipes.`);
