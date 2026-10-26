const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),folder=path.join(root,'comp139e');
const basics=require('../comp139e/code-templates.json'),patterns=require('../comp139e/midterm-patterns.json');
const groups=[['inheritance','Inheritance'],['lists','Linked lists'],['stacks','Stacks'],['queues','Queues'],['classes','Classes & structs'],['templates','Generic templates'],['functions','Functions'],['memory','Pointers, arrays & strings'],['files','Files & exceptions'],['structures','Other structure examples']];
const items=[...patterns,...basics];
const symbolData=require('../comp139e/code-symbols.json');
const crypto=require('node:crypto');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function matching(text,start){let depth=1,i=start+1;for(;i<text.length&&depth;i++){if(text[i]==='{')depth++;else if(text[i]==='}')depth--;}return i-1;}
function structure(code){
 const clean=code.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,s=>s.replace(/[^\n]/g,' '));
 const classes=[];const regex=/\b(class|struct)\s+(\w+)\s*(?:\:\s*(public|protected|private)\s+([\w:]+(?:<[^\n{]+>)?))?\s*\{/g;let m;
 while((m=regex.exec(clean))){const open=regex.lastIndex-1,end=matching(clean,open);classes.push({kind:m[1],name:m[2],base:m[4]||'',access:m[3]||'',open,end,methods:[],fields:[]});}
 for(const c of classes){
  let body=clean.slice(c.open+1,c.end),flat='',depth=0;
  for(const ch of body){if(ch==='{'){depth++;flat+=depth===1?'{}':' ';}else if(ch==='}'){depth--;flat+=' ';}else flat+=depth===0?ch:(ch==='\n'?'\n':' ');}
  let access=c.kind==='struct'?'public':'private';
  const chunks=flat.split(/(public\s*:|private\s*:|protected\s*:|\{\}|;)/);let pending='';
  for(const chunk of chunks){
   if(/^(public|private|protected)\s*:$/.test(chunk.trim())){access=chunk.trim().split(':')[0].trim();pending='';continue;}
   if(chunk==='{}'||chunk===';'){
    const declaration=pending.trim();pending='';
    const method=declaration.match(/(~?\w+)\s*\([^)]*\)/);
    if(method&&!/^(if|while|for|switch)$/.test(method[1])) c.methods.push({name:method[1],access,declaration,defined:chunk==='{}',status:chunk==='{}'?'defined here':/=\s*0/.test(declaration)?'pure virtual':/=\s*default/.test(declaration)?'defaulted':/=\s*delete/.test(declaration)?'disabled':new RegExp(c.name+'(?:<[^>]+>)?::'+method[1]+'\\s*\\(').test(clean)?'defined below class':'declaration'});
    else if(declaration&&/\s/.test(declaration)&&!declaration.includes('(')&&!/\b(typedef|using|friend)\b/.test(declaration)&&! /^(class|struct)\s+\w+$/.test(declaration))c.fields.push({text:declaration.replace(/\s+/g,' '),access});
   }else pending+=chunk;
  }
 }
 return classes;
}
function highlight(code,classes){
 const classNames=new Set(classes.map(c=>c.name)),bases=new Set(classes.filter(c=>c.base).map(c=>c.base.split('<')[0]));
 const keywords=new Set('class struct template typename public private protected virtual override const static void return if else for while new delete throw try catch using namespace typedef explicit noexcept default sizeof true false nullptr NULL'.split(' '));
 const types=new Set('int double float bool char string ostream ifstream ofstream exception runtime_error list T E'.split(' '));
 return code.replace(/(^\s*#\s*include[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|[\s\S])/gm,(token,_,offset)=>{
  let kind='';const word=token.trim();
  if(!/^\s*#|^\/\/|^\/\*|^["']|^\d|^[A-Za-z_]\w*$/.test(word))return esc(token);
  if(word.startsWith('#'))kind='preproc';else if(word.startsWith('//')||word.startsWith('/*'))kind='comment';else if(/^["']/.test(word))kind='string';else if(/^\d/.test(word))kind='number';else if(keywords.has(word))kind='keyword';else if(bases.has(word))kind='base';else if(classNames.has(word)||types.has(word))kind='type';else if(/^\s*\(/.test(code.slice(offset+token.length)))kind='function';else kind='variable';
  return token.split("\n").map(part=>part?`<span class="tok-${kind}">${esc(part)}</span>`:" ".trim()).join("\n");
 });
}
function classMap(classes){
 if(!classes.length)return '<p class="map-note">Free functions are defined above main(). main() creates the inputs and calls them.</p>';
 return `<div class="class-map" aria-label="Class structure">${classes.map(c=>{
  const descendants=classes.filter(x=>x.base.split('<')[0]===c.name);
  const base=classes.find(x=>x.name===c.base.split('<')[0]);
  const inherited=base?base.methods.filter(m=>m.access==='public'&&m.name!==base.name&&!m.name.startsWith('~')&&!c.methods.some(own=>own.name===m.name)).map(m=>m.name+'()'):[];
  return `<div class="class-box ${c.base?'derived-box':descendants.length?'base-box':''}"><p class="class-role">${c.base?'Derived class':descendants.length?'Base class':c.kind==='struct'?'Struct / node':'Class'}</p><h4>${esc(c.name)}${c.base?` <span class="inherits">← ${esc(c.base)}</span>`:''}</h4>${c.base?`<p>${esc(c.access)} inheritance from ${esc(c.base)}</p>`:''}<p><strong>Own data:</strong> ${c.fields.length?c.fields.map(f=>`<code>${esc(f.text)}</code> <small>(${f.access})</small>`).join(' · '):'none'}</p><p><strong>Methods:</strong> ${c.methods.length?c.methods.map(m=>`<code>${esc(m.name)}()</code> <small>(${m.access}; ${m.status})</small>`).join(' · '):'no methods'}</p>${base?`<p><strong>Base data:</strong> ${base.fields.length?base.fields.map(f=>`<code>${esc(f.text)}</code> (${f.access}${f.access==='private'?'; access through base methods':''})`).join(' · '):'none'}</p><p><strong>Inherited public methods:</strong> ${inherited.length?esc(inherited.join(', ')):'none beyond methods overridden here'}</p>`:''}</div>`;
 }).join('')}</div>`;
}
function outline(id,source){
 const data=symbolData[id];
 if(!data||data.sha256!==crypto.createHash('sha256').update(source).digest('hex'))throw new Error('Stale outline: run node dev/build-comp-symbols.cjs ('+id+')');
 const symbols=JSON.parse(JSON.stringify(data.symbols));
 const fixMembers=nodes=>nodes.forEach(n=>{if(['class','struct'].includes(n.kind))n.children.forEach(c=>{if(c.kind==='variable')c.kind='member';});fixMembers(n.children);});fixMembers(symbols);
 // Out-of-class definitions still belong under their declaring class.
 for(const symbol of [...symbols]){
  const line=source.split('\n')[symbol.line-1];
  const owner=symbols.find(c=>['class','struct'].includes(c.kind)&&new RegExp('\\b'+c.name+'(?:<[^>]+>)?::').test(line));
  if(owner){symbol.access=owner.children.find(c=>c.name===symbol.name)?.access||'';symbol.kind=symbol.kind==='variable'?'member':symbol.name.startsWith('~')?'destructor':symbol.name===owner.name?'constructor':'method';symbol.status=(symbol.status||'definition')+' outside class';owner.children.push(symbol);symbols.splice(symbols.indexOf(symbol),1);}
 }

 const displayType=n=>['constructor','destructor'].includes(n.kind)?n.type.replace(/^void /,''):n.type;
 const button=(n,label=n.name)=>`<button type="button" class="symbol symbol-${n.kind.replace(/ /g,'-')}" data-code-target="${id}-program-L${n.line}" title="${esc([displayType(n),n.access,n.status].filter(Boolean).join(' · '))}"><span class="symbol-kind">${esc(n.kind)}</span><span class="symbol-name">${esc(label)}</span><small>${esc([displayType(n),n.access,n.status,n.override?'override':''].filter(Boolean).join(' · '))} · L${n.line}</small></button>`;
 const group=(label,nodes)=>nodes.length?`<li class="outline-group"><strong>${label}</strong><ul>${nodes.map(render).join('')}</ul></li>`:'';
 const children=n=>['class','struct'].includes(n.kind)?group('Member variables',n.children.filter(s=>['member','variable'].includes(s.kind)))+group('Methods',n.children.filter(s=>['method','constructor','destructor'].includes(s.kind)))+group('Nested types',n.children.filter(s=>['class','struct','type alias'].includes(s.kind))):group('Parameters',n.children.filter(s=>s.kind==='parameter'))+group('Local variables',n.children.filter(s=>s.kind!=='parameter'));
 const render=n=>{
  const bases=(n.bases||[]).map(b=>{
   const base=symbols.find(s=>s.name===b.name.split('<')[0]);
   return `<li class="inherited"><strong>Inherits ${esc(b.access)} ${esc(b.name)}</strong>${base?`<ul>${base.children.filter(m=>!['constructor','destructor'].includes(m.kind)&&m.access!=='private').map(m=>`<li>${button(m,base.name+'::'+m.name)}</li>`).join('')}</ul>`:''}</li>`;
  }).join('');
  return `<li>${n.children.length||bases?`<details ${['class','struct'].includes(n.kind)||n.name==='main'?'open':''}><summary>${esc(n.name)} <small>${esc([n.kind,n.status].filter(Boolean).join(' · '))}</small></summary>${button(n)}<ul>${bases}${children(n)}</ul></details>`:button(n)}</li>`;
 };
 return `<nav class="code-outline" aria-label="Code outline for ${id}"><h4>Code outline</h4><p>Click a symbol to jump to its line. Expand to see what belongs inside.</p><ul>${group('Classes & structs',symbols.filter(s=>['class','struct'].includes(s.kind)))}${group('Functions',symbols.filter(s=>['function','method','constructor','destructor'].includes(s.kind)))}${group('Global variables & types',symbols.filter(s=>!['class','struct','function','method','constructor','destructor'].includes(s.kind)))}</ul></nav>`;
}
const codeBlock=(id,label,value,classes)=>{
 const numbered=id.endsWith('-program');
 const code=highlight(value,classes);
 const lines=numbered?code.split('\n').map((line,i,all)=>i===all.length-1&&line===''?'':`<span class="code-line" id="${id}-L${i+1}" data-line="${i+1}" tabindex="-1">${line}</span>`).join('\n'):code;
 return `<div class="code-heading"><strong>${label}</strong><button type="button" data-copy="${id}">Copy ${label.toLowerCase()}</button></div><div class="${numbered?'code-workspace':'starter-code'}">${numbered?outline(id.replace(/-program$/,''),value):''}<pre tabindex="0"><code id="${id}">${lines}</code></pre></div>`;
};
const tidy=s=>s.replace(/[ \t]+$/gm,'');
const program=x=>tidy(x.code.trimEnd()+'\n\nint main() {\n'+x.use.trimEnd().split('\n').map(l=>'    '+l).join('\n')+'\n    return 0;\n}\n');
const renderCard=x=>{
 const classes=structure(x.code),search=[x.title,x.when,x.change,x.watch,x.group,...x.parts.flat(),...classes.map(c=>c.name),x.code].join(' ').replace(/\s+/g,' ').toLowerCase();
 const starter=x.starter?tidy(x.starter.trimEnd()+'\n\nint main() {\n    // TODO: create objects and test the operations required by the question.\n    return 0;\n}\n'):null;
 return `<article id="${x.id}" class="template" data-group="${x.group}" data-search="${esc(search)}"><details class="entry"><summary><span class="entry-title">${esc(x.title.replace(/^\d+ · /,''))}</span><span class="entry-purpose">${esc(x.when)}</span></summary><div class="entry-content"><div class="card-actions"><a href="#${x.id}" aria-label="Link to ${esc(x.title)}"># Direct link</a><button type="button" data-copy="${x.id}-program">Copy complete example + main()</button></div><details class="class-summary"><summary>Inheritance and class summary</summary>${classMap(classes)}</details><div class="flow"><span>① Includes + namespace</span><span>② Classes / function definitions</span><span>③ main(): create → call → use result</span></div>${codeBlock(x.id+'-program','Complete example',program(x),classes)}${x.expected?`<p class="expected"><strong>Expected:</strong> ${esc(x.expected)}</p>`:''}<div class="adapt"><h4>What to change</h4><p>${esc(x.change)}</p></div>${starter?`<details class="blank"><summary>Blank template with TODO comments + main()</summary>${codeBlock(x.id+'-starter','Blank template',starter,classes)}</details>`:''}<details class="explanation"><summary>Explain the parts / things to remember</summary><div class="explanation-body"><dl>${x.parts.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl><p><strong>Remember:</strong> ${esc(x.watch)}</p><a href="${esc(x.reference)}">Course source ↗</a><p class="source-note">Simplified study adaptation of course material.</p></div></details></div></details></article>`;
};
const rules=fs.readFileSync(path.join(__dirname,'comp-quick-rules.html'),'utf8').replace(/<h1>[\s\S]*?<\/h1>/,'<h2>Quick blank-position rules</h2>');
const css=fs.readFileSync(path.join(folder,'code-templates.css'),'utf8'),js=fs.readFileSync(path.join(folder,'code-templates.js'),'utf8');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>COMP midterm cheat sheet · Code, templates & rules</title><style>${css}</style></head><body><a class="skip" href="#content">Skip to examples</a><header class="page-header"><nav><a href="../index.html#course/comp139e">← COMP 139E</a><a href="midterm-practice.html">Practice worksheets</a><a href="code-templates.html" download="COMP-midterm-cheat-sheet.html">Download offline copy</a><button type="button" id="print-sheet">Print / PDF</button></nav><p class="eyebrow">COMP 139E · EXAM REFERENCE</p><h1>One midterm cheat sheet.</h1><p class="intro">49 worked examples, 24 blank starters, and quick rules. Every worked example includes its own main() and using namespace std;.</p><div class="legend" aria-label="Code colour key"><span class="tok-base">■ Base / inherited class</span><span class="tok-type">■ Class / type</span><span class="tok-function">■ Function / method</span><span class="tok-variable">■ Data / variable</span><span class="tok-keyword">■ C++ keyword</span><span class="tok-comment">■ Comment / TODO</span></div><p class="hint">Choose a topic → open a matching question → check the class map → copy the complete example. Each example is independent; keep one main() when combining code.</p></header><div class="library-layout"><aside><div class="index"><label for="template-search">Find what you need <kbd>Ctrl/⌘ K</kbd></label><input id="template-search" type="search" placeholder="inheritance, delete tail, push…"><label for="topic-filter">Topic</label><select id="topic-filter"><option value="all">All topics</option>${groups.map(([id,title])=>`<option value="${id}">${title}</option>`).join('')}</select><p id="search-count" role="status">49 examples</p><button type="button" id="clear-filters">Show all / clear search</button><nav aria-label="Example index"><a href="#quick-rules">Quick blank-position rules</a><a href="#placement">Where does code go?</a>${groups.map(([id,title])=>`<details ${['inheritance','lists','stacks','queues'].includes(id)?'open':''}><summary>${title}</summary>${items.filter(x=>x.group===id).map(x=>`<a href="#${x.id}" data-index="${x.id}">${esc(x.title.replace(/^\d+ · /,''))}</a>`).join('')}</details>`).join('')}</nav></div></aside><main id="content"><details id="placement" class="reference-panel"><summary>Where does code go? · Class vs inheritance vs main()</summary><div><dl><dt>Includes + using namespace std;</dt><dd>At the top, before your definitions.</dd><dt>Inside class Base { … };</dt><dd>Base data and methods. private: belongs to that class; protected: also accessible to derived classes; public: callable from outside.</dd><dt>class Derived : public Base</dt><dd>Inherits Base’s accessible interface. Put additional fields and overriding methods inside Derived. Call Base(arguments) in its constructor initializer list.</dd><dt>ReturnType ClassName::method()</dt><dd>Defines a declared method outside its class. It still belongs to that class.</dd><dt>int main()</dt><dd>Creates objects, pushes/enqueues data, calls methods, and uses results. It is outside every class.</dd><dt>Virtual dispatch</dt><dd>A virtual method called through Base* or Base&amp; runs the matching derived override. An ordinary by-value base copy can slice off derived information.</dd></dl></div></details><details id="quick-rules" class="reference-panel"><summary>Quick rules · If the blank is here, write this</summary><div class="quick-rules">${rules}</div></details><p id="no-results" hidden>No matches. Try a shorter phrase or choose All topics.</p>${groups.map(([id,title])=>`<section class="topic" id="topic-${id}"><h2>${title} <small>${items.filter(x=>x.group===id).length}</small></h2>${items.filter(x=>x.group===id).map(renderCard).join('')}</section>`).join('')}</main></div><div id="copy-status" role="status" aria-live="polite"></div><dialog id="copy-fallback"><h2>Copy code</h2><p>Select the code and press Ctrl+C or ⌘C.</p><textarea aria-label="Code to copy" readonly></textarea><form method="dialog"><button>Done</button></form></dialog><footer>Course-based study examples, not predictions of exam questions. Longer explanations stay outside the copied code.</footer><script>${js}</script></body></html>`;
fs.writeFileSync(path.join(folder,'code-templates.html'),html);
for(const [name,hash] of [['midterm-patterns.html',''],['cpp-cheat-sheet.html','#quick-rules']])fs.writeFileSync(path.join(folder,name),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>COMP midterm cheat sheet</title></head><body><p><a href="code-templates.html${hash}">Open the unified midterm cheat sheet →</a></p><script>location.replace('code-templates.html'+(location.hash||'${hash}'));</script></body></html>`);

console.log('Built one cheat sheet: '+items.length+' complete examples.');
