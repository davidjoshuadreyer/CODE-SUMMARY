// Verify every independent online recipe with GCC without burdening the public API.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const recipes=require('../comp139e/online.json'),root=path.resolve(__dirname,'../comp139e');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'comp139e-online-build-'));
function command(args,cwd){return new Promise((resolve,reject)=>{const p=spawn('g++',args,{cwd,windowsHide:true});let output='';p.stdout.on('data',d=>output+=d);p.stderr.on('data',d=>output+=d);p.on('error',reject);p.on('close',code=>code?reject(Error(output)):resolve());});}
let cursor=0;const entries=Object.entries(recipes),failed=[];
async function worker(){while(cursor<entries.length){const [id,r]=entries[cursor++],cwd=path.join(temp,id.replace(':','-'));fs.mkdirSync(cwd,{recursive:true});
 try{
  for(const f of r.files){const target=path.join(cwd,f.name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,f.content??fs.readFileSync(path.join(root,f.url),'utf8'));}
  const objects=[];
  for(let i=0;i<r.units.length;i++){const u=r.units[i],object=`unit${i}.o`;await command([`-std=c++${r.standard}`,...r.includes.map(d=>'-I'+d),...(u.rename?['-Dmain='+u.rename]:[]),'-c',u.file,'-o',object],cwd);objects.push(object);}
  await command([...objects,'-o','program.exe'],cwd);
 }catch(e){failed.push(id+': '+e.message);}
}}
Promise.all(Array.from({length:4},worker)).then(()=>{if(failed.length){console.error(failed.join('\n'));process.exitCode=1;}else console.log(`PASS ${entries.length} independent C++ projects compile and link. Artifacts: ${temp}`);});
