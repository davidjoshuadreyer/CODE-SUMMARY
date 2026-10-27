// Generate an accurate, source-only outline with clang; runtime needs no compiler.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const execFile=require('node:util').promisify(require('node:child_process').execFile);
const folder=path.join(__dirname,'../comp139e');
const {items,program}=require('./comp-library-data.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-symbols-'));
const cache=JSON.parse(fs.readFileSync(path.join(folder,'code-symbols.json'),'utf8'));
const output={};
// Clang can emit several JSON roots when template instantiations also match
// the namespace filter. Select the actual namespace rather than those extras.
function namespaceAst(text) {
 let depth=0, start=0, quoted=false, escaped=false;
 for(let i=0;i<text.length;i++) {
  const ch=text[i];
  if(quoted){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')quoted=false;continue;}
  if(ch==='"'){quoted=true;continue;}
  if(ch==='{'){if(depth===0)start=i;depth++;}
  if(ch==='}'&&--depth===0){
   const node=JSON.parse(text.slice(start,i+1));
   if(node.kind==='NamespaceDecl'&&node.name==='comp_outline')return node;
  }
 }
 throw new Error('Clang output did not contain the source namespace');
}

(async()=>{try {
 async function build(x){
  const source=program(x), wrapped=source.replace('using namespace std;','namespace comp_outline { using namespace std;')+'\n}';
  const sha256=crypto.createHash('sha256').update(source).digest('hex');
  if(cache[x.id]?.sha256===sha256&&cache[x.id]?.offsetEncoding==='utf8'){output[x.id]=cache[x.id];return;}
  const cpp=path.join(dir,x.id+'.cpp');fs.writeFileSync(cpp,wrapped);
  const ast=namespaceAst((await execFile('clang++',['-std=c++17','-Xclang','-ast-dump=json','-Xclang','-ast-dump-filter=comp_outline','-fsyntax-only',cpp],{maxBuffer:32*1024*1024,encoding:'utf8'})).stdout);
  const bytes=Buffer.from(wrapped,'utf8');
  const line=n=>bytes.subarray(0,n.loc?.offset??0).toString('utf8').split('\n').length;
  const functions=new Set(['FunctionDecl','CXXMethodDecl','CXXConstructorDecl','CXXDestructorDecl','CXXConversionDecl']);
  const seen=new Set();
  function walk(n,access='',scope=''){
   if(n.isImplicit||n.kind==='ClassTemplateSpecializationDecl')return [];
   const kids=n.inner||[];
   if(n.kind==='AccessSpecDecl')return [];
   let kind='';
   if(n.kind==='CXXRecordDecl'&&n.completeDefinition)kind=n.tagUsed||'class';
   else if(functions.has(n.kind))kind=n.kind==='CXXConstructorDecl'?'constructor':n.kind==='CXXDestructorDecl'?'destructor':scope?'method':'function';
   else if(n.kind==='FieldDecl')kind='member';
   else if(n.kind==='ParmVarDecl')kind='parameter';
   else if(n.kind==='VarDecl')kind=scope==='function'?'local':'variable';
   else if(n.kind==='TypedefDecl'||n.kind==='TypeAliasDecl')kind='type alias';
   if(kind&&n.name){
    const key=n.kind+':'+n.loc.offset;if(seen.has(key))return [];seen.add(key);
    const record={name:n.name,kind,line:line(n),type:n.type?.qualType||'',access,children:[]};
    if(n.bases)record.bases=n.bases.map(b=>({name:b.type.qualType,access:b.access}));
    if(functions.has(n.kind)){
     record.status=n.explicitlyDeleted?'disabled':n.pure?'pure virtual':kids.some(k=>k.kind==='CompoundStmt')?'definition':n.explicitlyDefaulted?'defaulted':'declaration';
     if(n.parentDeclContextId)record.outside=true;
     if(kids.some(k=>k.kind==='OverrideAttr'))record.override=true;
    }
    let childAccess=kind==='class'?'private':kind==='struct'?'public':'';
    for(const k of kids){if(k.kind==='AccessSpecDecl'){childAccess=k.access;continue;}record.children.push(...walk(k,childAccess,functions.has(n.kind)?'function':kind==='class'||kind==='struct'?n.name:scope));}
    return [record];
   }
   return kids.flatMap(k=>walk(k,access,scope));
  }
  const symbols=walk(ast);
  output[x.id]={sha256,offsetEncoding:'utf8',symbols};
  console.log('Outline '+x.id);
 }
 let next=0;
 await Promise.all(Array.from({length:4},async()=>{while(next<items.length){const x=items[next++];await build(x);}}));
 const ordered=Object.fromEntries(items.map(x=>[x.id,output[x.id]]));
 fs.writeFileSync(path.join(folder,'code-symbols.json'),JSON.stringify(ordered,null,2)+'\n');
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1;});
