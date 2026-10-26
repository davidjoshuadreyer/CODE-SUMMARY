// Generate an accurate, source-only outline with clang; runtime needs no compiler.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const folder=path.join(__dirname,'../comp139e');
const {items,program}=require('./comp-library-data.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'comp-symbols-'));
const cache=JSON.parse(fs.readFileSync(path.join(folder,'code-symbols.json'),'utf8'));
const output={};
try {
 for(const x of items){
  const source=program(x), wrapped=source.replace('using namespace std;','namespace comp_outline { using namespace std;')+'\n}';
  const sha256=crypto.createHash('sha256').update(source).digest('hex');
  if(cache[x.id]?.sha256===sha256){output[x.id]=cache[x.id];continue;}
  const cpp=path.join(dir,'example.cpp');fs.writeFileSync(cpp,wrapped);
  const ast=JSON.parse(execFileSync('clang++',['-std=c++17','-Xclang','-ast-dump=json','-Xclang','-ast-dump-filter=comp_outline','-fsyntax-only',cpp],{maxBuffer:32*1024*1024,encoding:'utf8'}));
  const line=n=>wrapped.slice(0,n.loc?.offset??0).split('\n').length;
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
  output[x.id]={sha256,symbols};
  console.log('Outline '+x.id);
 }
 fs.writeFileSync(path.join(folder,'code-symbols.json'),JSON.stringify(output,null,2)+'\n');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
