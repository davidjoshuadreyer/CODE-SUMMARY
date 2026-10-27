(() => {
 'use strict';
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 function tokens(source){return source.match(/^[ \t]*#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/|R"([^ ()\\\t\r\n]{0,16})\([\s\S]*?\)\1"|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[A-Za-z_]\w*\b|[\s\S]/gm)||[];}
 function mask(source){return tokens(source).map(t=>/^(?:\s*#|\/\/|\/\*|R"|"|')/.test(t)?t.replace(/[^\n]/g,' '):t).join('');}
 function rename(source,from,to){return tokens(source).map(t=>t===from?to:t).join('');}
 function close(text,start,open='{',end='}') {let depth=0;for(let i=start;i<text.length;i++){if(text[i]===open)depth++;if(text[i]===end&&!--depth)return i;}return -1;}
 function parse(source){
  const clean=mask(source),classes=[];
  const re=/\b(class|struct)\s+([A-Za-z_]\w*)\s*(?:final\s*)?(?::\s*([^{};]+))?\s*\{/g;let m;
  while((m=re.exec(clean))){
   if(classes.some(c=>m.index<c.end))continue;
   const open=re.lastIndex-1,endBrace=close(clean,open);if(endBrace<0)continue;
   const semi=clean.indexOf(';',endBrace);if(semi<0||clean.slice(endBrace+1,semi).trim())continue;
   let start=m.index;const before=clean.slice(0,start);const temp=before.match(/template\s*<[^;{}]+>\s*$/);if(temp)start-=temp[0].length;
   const c={name:m[2],kind:m[1],base:(m[3]||'').trim(),start,headerStart:m.index,open,close:endBrace,end:semi+1,members:[]};
   let at=open+1,access=m[1]==='struct'?'public':'private';
   while(at<endBrace){
    while(at<endBrace&&/\s/.test(clean[at]))at++;if(at>=endBrace)break;
    const accessMatch=clean.slice(at).match(/^(public|private|protected)\s*:/);if(accessMatch){access=accessMatch[1];at+=accessMatch[0].length;continue;}
    const begin=at;let parentheses=0,finish=at,bodyStart=-1,bodyEnd=-1;
    for(;finish<endBrace;finish++){
     const ch=clean[finish];if(ch==='(')parentheses++;if(ch===')')parentheses--;
     if(!parentheses&&ch===';'){finish++;break;}
     if(!parentheses&&ch==='{'){
      bodyStart=finish;bodyEnd=close(clean,finish);if(bodyEnd<0)break;
      finish=bodyEnd+1;while(/\s/.test(clean[finish]||'')&&finish<endBrace)finish++;
      if(clean[finish]===';')finish++;break;
     }
    }
    if(finish<=begin)break;
    const signature=source.slice(begin,bodyStart<0?finish:bodyStart).trim();
    const match=mask(signature).match(/(~?[A-Za-z_]\w*)\s*\(/);
    c.members.push({start:begin,end:finish,bodyStart,bodyEnd,signature,name:match?match[1]:'',kind:match?'method':'field',access,body:bodyStart>=0?source.slice(bodyStart+1,bodyEnd).trim():null});at=finish;
   }
   classes.push(c);re.lastIndex=semi+1;
  }
  return classes;
 }
 function validName(s){return /^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(s)&&!s.includes('__')&&!new Set('alignas alignof and and_eq asm auto bitand bitor bool break case catch char char8_t char16_t char32_t class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not not_eq nullptr operator or or_eq private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor xor_eq final override import module main std string'.split(' ')).has(s);}
 function diagnostics(source,removed=[]){
  const clean=mask(source),errors=[];const stack=[];const pairs={')':'(',']':'[','}':'{'};
  for(const ch of clean){if('([{'.includes(ch))stack.push(ch);else if(')]}'.includes(ch)&&stack.pop()!==pairs[ch]){errors.push('Unbalanced brackets or braces.');break;}}
  if(stack.length)errors.push('Close every opened bracket or brace.');
  const classes=parse(source),names=classes.map(c=>c.name);
  if(new Set(names).size!==names.length)errors.push('Class names must be unique.');
  for(const old of removed)if(tokens(source).includes(old))errors.push(`Deleted class ${old} is still referenced. Update its uses or undo the deletion.`);
  for(const c of classes)for(const member of c.members){
   if(/^\s*(?:virtual\s+)?void\s+/.test(member.signature)&&member.body&&/\breturn\s+[^;\s]/.test(mask(member.body)))errors.push(`${c.name}::${member.name} returns void but still returns a value. Edit its body.`);
  }
  if(!/\bint\s+main\s*\(/.test(clean))errors.push('Include int main() before applying.');
  return [...new Set(errors)];
 }
 function patch(source,start,end,replacement){return source.slice(0,start)+replacement+source.slice(end);}
 if(typeof module!=='undefined'&&module.exports){module.exports={parse,rename,diagnostics,patch,mask};return;}
 const history=new WeakMap();let active=null;
 const dialog=document.createElement('dialog');dialog.className='class-editor';dialog.innerHTML=`<header><div><h2>Edit UML & code</h2><p>Click a class or member. Edit the draft, then Apply to update copied code.</p></div><button type="button" data-editor-close>Close</button></header><div class="editor-toolbar"><button data-editor-add>Add class</button><button data-editor-source>Full code / main()</button><button data-editor-undo>Undo draft</button><button data-editor-reset>Reset draft</button></div><div class="editor-layout"><div class="editor-map" aria-label="Editable class diagram"></div><section class="editor-inspector"></section></div><div class="editor-checks" role="status" aria-live="polite"></div><footer><span>Local text editor · checks common mistakes, not a C++ compiler. Save edits before Apply.</span><button data-editor-apply>Apply to example</button></footer>`;document.body.append(dialog);
 const map=dialog.querySelector('.editor-map'),inspector=dialog.querySelector('.editor-inspector'),checks=dialog.querySelector('.editor-checks');
 function info(message){checks.textContent=message;}
 function push(source){active.undo.push({source:active.source,removed:[...active.removed]});active.source=source;draw();}
 function draw(){
  active.classes=parse(active.source);
  map.innerHTML=active.classes.map((c,i)=>`<article class="edit-class"><button class="edit-class-name" data-class="${i}">${esc(c.name)}</button>${c.base?`<p class="edit-base">inherits ${esc(c.base)}</p>`:''}<div>${c.members.map((m,j)=>`<button data-member="${i}:${j}" class="edit-${m.kind}">${esc(m.access==='public'?'+':m.access==='protected'?'#':'−')} ${esc(m.signature.replace(/\s+/g,' ').slice(0,150))}</button>`).join('')}</div></article>`).join('')||'<p>No classes yet. Add a class or edit full code.</p>';
  dialog.querySelector('[data-editor-undo]').disabled=!active.undo.length;
  const errors=diagnostics(active.source,active.removed);info(errors.length?errors.join('\n'):'Draft ready for review. Apply updates code, diagram and Copy; compile your final program in your editor.');
  inspector.innerHTML='<p>Select a class or member on the left, or open Full code / main().</p>';
 }
 function dirty(){active.dirty=true;dialog.querySelector('[data-editor-apply]').disabled=true;info('Unsaved form edits. Click Save in this panel before Apply.');}
 function saved(){active.dirty=false;dialog.querySelector('[data-editor-apply]').disabled=false;}
 function editClass(index){
  const c=active.classes[index];active.selection={kind:'class',index};
  inspector.innerHTML=`<h3>Class</h3><form data-edit-class><label>Name<input name="className" value="${esc(c.name)}" required></label><label>Inheritance <small>e.g. public Job · leave empty for a base class</small><input name="base" value="${esc(c.base)}"></label><label>Class contents <small>Fields, access labels, constructors and methods</small><textarea name="body" spellcheck="false">${esc(active.source.slice(c.open+1,c.close).trim())}</textarea></label><p>Renaming the class updates its constructors, destructor and uses in this program. Add fields or methods in the contents.</p><div><button>Save class</button><button type="button" data-editor-delete="${index}">Delete class</button></div></form>`;
 }
 function editMember(index,j){
  const c=active.classes[index],m=c.members[j];active.selection={kind:'member',index,j};
  inspector.innerHTML=`<h3>${esc(c.name)} · ${m.kind==='method'?esc(m.name):'Fields'}</h3><form data-edit-member><label>${m.kind==='method'?'Declaration / signature':'Field declaration'}<textarea name="signature" class="short-text" spellcheck="false">${esc(m.signature)}</textarea></label>${m.body!==null?`<label>Body <small>Code inside the braces</small><textarea name="body" spellcheck="false">${esc(m.body)}</textarea></label>`:'<p>This is a declaration. Pure virtual methods end with = 0; and have no body.</p>'}${m.kind==='method'&&!m.name.startsWith('~')&&m.name!==c.name?'<label class="editor-check"><input type="checkbox" name="family" checked> Apply the new method name and return type to matching overrides</label>':''}<p>Changing a return type also requires updating bodies and callers. Use Full code / main() to edit the calls.</p><button>Save member</button></form>`;
 }
 function editSource(){active.selection={kind:'source'};inspector.innerHTML=`<h3>Full code / main()</h3><form data-edit-source><label>Complete program<textarea name="source" class="full-source" spellcheck="false">${esc(active.source)}</textarea></label><button>Save code</button></form>`;}
 function open(card,line){
  if(!history.has(card))history.set(card,{original:card.querySelector('code[id$="-program"]').textContent});
  active={card,source:card.querySelector('code[id$="-program"]').textContent,undo:[],removed:[],dirty:false};saved();draw();dialog.showModal();
  if(line){let offset=active.source.split('\n').slice(0,line-1).join('\n').length;const i=active.classes.findIndex(c=>offset>=c.start-1&&offset<c.end);if(i>=0){const j=active.classes[i].members.findIndex(m=>offset>=m.start-8&&offset<m.end);if(j>=0)editMember(i,j);else editClass(i);}}
 }
 dialog.addEventListener('input',e=>{if(e.target.closest('form'))dirty();});
 dialog.addEventListener('change',e=>{if(e.target.closest('form'))dirty();});
 dialog.addEventListener('submit',e=>{
  e.preventDefault();const form=e.target,values=new FormData(form);
  try{
   if(form.matches('[data-edit-class]')){
    const c=active.classes[active.selection.index],name=String(values.get('className')).trim(),base=String(values.get('base')).trim(),body=String(values.get('body')).trim();
    if(!validName(name))throw Error('Use a valid, non-reserved class name (up to 32 characters).');
    if(name!==c.name&&tokens(active.source).includes(name))throw Error('That name is already used.');
    let source=patch(active.source,c.headerStart,c.end,`${c.kind} ${c.name}${base?' : '+base:''} {\n${body}\n};`);
    if(name!==c.name)source=rename(source,c.name,name);
    saved();push(source);
   }else if(form.matches('[data-edit-member]')){
    const c=active.classes[active.selection.index],m=c.members[active.selection.j],signature=String(values.get('signature')).trim(),body=values.get('body');
    if(!signature)throw Error('Enter a declaration.');
    let source=patch(active.source,m.start,m.end,body===null?signature:signature.replace(/;\s*$/,'')+' {\n'+String(body)+'\n}\n');
    const next=(mask(signature).match(/(~?[A-Za-z_]\w*)\s*\(/)||[])[1];
    if(values.has('family')&&next){
     if(!validName(next))throw Error('Use a valid method name.');
     const members=active.classes.flatMap(k=>k.members.filter(q=>q.name===m.name).map(q=>({c:k,m:q})));
     const parameterList=s=>(mask(s).match(/\(([^)]*)\)/)||[])[1]?.replace(/\s+/g,' ').trim();
     if(members.some(q=>parameterList(q.m.signature)!==parameterList(m.signature)))throw Error('This name has overloads with different parameters. Uncheck propagation and edit the desired declarations and calls in Full code.');
     // Only propagate through one connected inheritance family.
     const family=new Set([c.name]);let changed=true;while(changed){changed=false;for(const k of active.classes){const baseName=(k.base.match(/(?:public|protected|private)\s+(\w+)/)||[])[1];if(baseName&&(family.has(k.name)||family.has(baseName))){for(const name of [k.name,baseName])if(!family.has(name)){family.add(name);changed=true;}}}}
     if(members.some(q=>!family.has(q.c.name)))throw Error('This method name also belongs to an unrelated class. Uncheck propagation and edit those uses in Full code.');
     if(next!==m.name&&tokens(active.source).includes(next))throw Error('That method name is already used.');
     if(next!==m.name)source=rename(source,m.name,next);
     const newReturn=signature.slice(0,signature.indexOf(next)).replace(/\b(virtual|static|inline)\b/g,'').trim();
     if(newReturn){const updates=parse(source).flatMap(k=>k.members.filter(q=>q.name===next&&family.has(k.name)).map(q=>({c:k,m:q}))).sort((a,b)=>b.m.start-a.m.start);
      for(const q of updates){const oldHead=q.m.signature.slice(0,q.m.signature.indexOf(next)),prefix=/\bvirtual\b/.test(oldHead)?'virtual ':'';source=patch(source,q.m.start,q.m.start+oldHead.length,prefix+newReturn+' ');}
     }
    }
    saved();push(source);
   }else if(form.matches('[data-edit-source]')){saved();push(String(values.get('source')));}
  }catch(error){info(error.message);}
 });
 function highlight(source){return tokens(source).map(t=>{
  let cls='';if(/^\s*#/.test(t))cls='preproc';else if(/^\/\//.test(t)||/^\/\*/.test(t))cls='comment';else if(/^(R"|"|')/.test(t))cls='string';else if(/^(class|struct|public|private|protected|virtual|override|const|return|new|delete|if|else|while|for|using|namespace|template|typename|throw|try|catch|nullptr|default)$/.test(t))cls='keyword';else if(/^(int|double|void|bool|string|char)$/.test(t))cls='type';else if(/^[A-Za-z_]\w*$/.test(t))cls='variable';return cls?t.split('\n').map(l=>`<span class="tok-${cls}">${esc(l)}</span>`).join('\n'):esc(t);
 }).join('');}
 function apply(){
  const errors=diagnostics(active.source,active.removed);if(errors.length){info(errors.join('\n'));return;}
  const card=active.card,code=card.querySelector('code[id$="-program"]'),source=active.source.endsWith('\n')?active.source:active.source+'\n';
  code.innerHTML=highlight(source).split('\n').map((line,i,all)=>i===all.length-1&&line===''?'':`<span class="code-line" id="${code.id}-L${i+1}" data-line="${i+1}" tabindex="-1">${line}</span>`).join('\n');
  // Compiler-derived outlines no longer describe the edited program.
  card.querySelector('.outline-toggle').hidden=true;card.querySelector('.rename-panel').hidden=true;
  const uml=card.querySelector('.uml-panel');uml.innerHTML='<summary>UML · edited classes</summary><div class="uml-toolbar"><button type="button" data-class-editor>Edit UML & code</button><button type="button" data-class-restore>Restore reference</button></div><p class="edited-note">Your edited program. Click a class or member to edit again. Compile before using; the original expected output and explanations no longer describe these edits.</p><div class="edited-class-map">'+parse(source).map((c,i)=>`<article class="edit-class"><button class="edit-class-name" data-live-class="${i}">${esc(c.name)}</button>${c.base?`<p class="edit-base">inherits ${esc(c.base)}</p>`:''}${c.members.map((m,j)=>`<button class="edit-${m.kind}" data-live-member="${i}:${j}">${esc(m.access==='public'?'+':m.access==='protected'?'#':'−')} ${esc(m.signature)}</button>`).join('')}</article>`).join('')+'</div>';
  for(const selector of ['.expected','.adapt','.blank','.explanation']){const el=card.querySelector(selector);if(el)el.hidden=true;}
  card.dataset.edited='true';dialog.close();uml.open=true;uml.scrollIntoView({block:'nearest'});
 }
 dialog.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-editor-close')){if(active.dirty||active.undo.length){if(!confirm('Close without applying this draft?'))return;}dialog.close();return;}
  if(b.hasAttribute('data-editor-apply')){apply();return;}
  if(active.dirty&&!b.closest('form')){info('Save the current form before switching panels.');return;}
  if(b.dataset.class!==undefined)editClass(Number(b.dataset.class));
  if(b.dataset.member){const [i,j]=b.dataset.member.split(':').map(Number);editMember(i,j);}
  if(b.hasAttribute('data-editor-source'))editSource();
  if(b.hasAttribute('data-editor-add')){let name='NewClass',i=2;while(tokens(active.source).includes(name))name='NewClass'+i++;const match=mask(active.source).match(/\bint\s+main\s*\(/),at=match?match.index:active.source.length;push(patch(active.source,at,at,`class ${name} {\npublic:\n    ${name}() {}\n};\n\n`));editClass(active.classes.findIndex(c=>c.name===name));}
  if(b.dataset.editorDelete!==undefined){const c=active.classes[Number(b.dataset.editorDelete)];if(!confirm(`Delete ${c.name} from the draft? You must also update any code that uses it.`))return;saved();push(patch(active.source,c.start,c.end,''));active.removed.push(c.name);info(diagnostics(active.source,active.removed).join('\n')||'Class deleted from draft.');}
  if(b.hasAttribute('data-editor-undo')){const last=active.undo.pop();if(last){active.source=last.source;active.removed=last.removed;draw();}}
  if(b.hasAttribute('data-editor-reset')){if(!confirm('Reset this draft to the currently displayed example?'))return;active.source=active.card.querySelector('code[id$="-program"]').textContent;active.undo=[];active.removed=[];saved();draw();}
 });
 dialog.addEventListener('cancel',e=>{if(active&&(active.dirty||active.undo.length)&&!confirm('Close without applying this draft?'))e.preventDefault();});
 document.addEventListener('click',e=>{
  const card=e.target.closest('.template');if(!card)return;
  const b=e.target.closest('[data-class-editor],[data-live-class],[data-live-member],[data-class-restore]');if(!b)return;
  if(b.hasAttribute('data-class-restore')){if(confirm('Reload to restore the original references? Unsaved edits in this tab will be lost.'))location.reload();return;}
  open(card);
  if(b.dataset.liveClass!==undefined)editClass(Number(b.dataset.liveClass));
  if(b.dataset.liveMember){const [i,j]=b.dataset.liveMember.split(':').map(Number);editMember(i,j);}
 });
 // Double-click a UML name to open the relevant editor without switching modes.
 document.addEventListener('dblclick',e=>{const link=e.target.closest('.uml-canvas a');if(!link)return;e.preventDefault();const card=link.closest('.template');open(card,Number(link.getAttribute('href').split('-L').pop()));});
})();
