(() => {
 'use strict';
 const states=new WeakMap();
 const reserved=new Set(('alignas alignof and and_eq asm auto bitand bitor bool break case catch char char8_t char16_t char32_t class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not not_eq nullptr operator or or_eq private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor xor_eq final override import module std main').split(' '));
 // Used by the test suite too. Never edit comments, literals or preprocessor lines.
 function identifiers(source){return source.match(/^[ \t]*#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/|R"([^ ()\\\t\r\n]{0,16})\([\s\S]*?\)\1"|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[A-Za-z_]\w*\b|[\s\S]/gm)||[];}
 function renameSource(source,from,to){return identifiers(source).map(t=>t===from?to:t).join('');}
 if(typeof module!=='undefined'&&module.exports){module.exports={renameSource,reserved};return;}
 function state(card){
  if(states.has(card))return states.get(card);
  const roots=[card.querySelector('code[id$="-program"]'),card.querySelector('.uml-panel'),card.querySelector('.code-outline'),card.querySelector('.rename-symbol')].filter(Boolean);
  const nodes=[];
  for(const root of roots){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){
   if(node.parentElement.closest('button[data-rename-mode]'))continue;
   nodes.push({node,original:node.nodeValue,code:root.matches('code')});
  }}
  const s={nodes,changes:[],map:new Map(),source:card.querySelector('code[id$="-program"]').textContent};states.set(card,s);return s;
 }
 function render(card){
  const s=state(card);s.map.clear();for(const change of s.changes)s.map.set(change.original,change.to);
  for(const {node,original,code} of s.nodes){
   if(code&&node.parentElement.closest('.tok-comment,.tok-string,.tok-preproc'))continue;
   node.nodeValue=original.replace(/\b[A-Za-z_]\w*\b/g,name=>s.map.get(name)||name);
  }
  card.querySelector('[data-rename-undo]').disabled=!s.changes.length;
  card.querySelector('[data-rename-reset]').disabled=!s.changes.length;
  for(const t of card.querySelectorAll('.uml-canvas text,.uml-canvas tspan')){
   t.removeAttribute('textLength');t.removeAttribute('lengthAdjust');
   if(!t.querySelector('tspan')&&t.getComputedTextLength()>340){t.setAttribute('textLength','340');t.setAttribute('lengthAdjust','spacingAndGlyphs');}
  }
 }
 function say(card,message){card.querySelector('.rename-status').textContent=message;}
 document.addEventListener('submit',e=>{
  if(!e.target.matches('.rename-form'))return;e.preventDefault();
  const card=e.target.closest('.template'),s=state(card),select=e.target.querySelector('select'),input=e.target.querySelector('input');
  const original=select.value,from=s.map.get(original)||original,to=input.value.trim();
  if(!/^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(to)||reserved.has(to)||to.includes('__')){say(card,'Use 1–32 letters, digits or underscores, starting with a letter. C++ keywords and reserved names are not allowed.');return;}
  if(to===from){say(card,'That is already the current name.');return;}
  const source=card.querySelector('code[id$="-program"]').textContent;
  if(identifiers(source).includes(to)||[...s.map.values()].includes(to)){say(card,'That name is already used in this example. Choose a different name.');return;}
  // The original lexical token positions are preserved by the syntax-highlighted DOM.
  const expected=renameSource(source,from,to);
  s.changes.push({original,from,to});render(card);
  if(card.querySelector('code[id$="-program"]').textContent!==expected){s.changes.pop();render(card);say(card,'This rename cannot be applied safely. The code was left unchanged.');return;}
  input.value='';say(card,`${from} → ${to}. Copy and Download .cpp now use the updated code.`);
 });
 document.addEventListener('click',e=>{
  const card=e.target.closest('.template');if(!card)return;
  if(e.target.closest('[data-rename-undo]')){const s=state(card);s.changes.pop();render(card);say(card,'Last rename undone.');}
  if(e.target.closest('[data-rename-reset]')){state(card).changes=[];render(card);say(card,'Original names restored.');}
  const mode=e.target.closest('[data-rename-mode]');
  if(mode){const enabled=mode.getAttribute('aria-pressed')!=='true';mode.setAttribute('aria-pressed',String(enabled));mode.textContent=enabled?'Rename mode · on':'Rename mode';card.querySelector('.rename-panel').open=enabled;if(enabled)say(card,'Click a name in the UML diagram, then enter its replacement above.');return;}
  const link=e.target.closest('.uml-canvas a');
  if(!link||card.querySelector('[data-rename-mode]').getAttribute('aria-pressed')!=='true')return;
  e.preventDefault();e.stopPropagation();
  const panel=card.querySelector('.rename-panel'),s=state(card),select=panel.querySelector('select'),line=link.getAttribute('href').split('-L').pop();
  const text=link.querySelector('text')?.textContent||'';
  const first=(text.match(/[A-Za-z_]\w*/)||[])[0];
  const option=[...select.options].find(o=>o.dataset.line===line)||[...select.options].find(o=>(s.map.get(o.value)||o.value)===first);
  panel.open=true;
  if(!option){say(card,'This name is shared by unrelated declarations or part of a fixed interface. Use Edit UML & code to change its declaration and uses.');panel.scrollIntoView({block:'nearest'});return;}
  select.value=option.value;panel.querySelector('input').value=s.map.get(option.value)||option.value;
  panel.scrollIntoView({block:'nearest'});panel.querySelector('input').focus();panel.querySelector('input').select();
 },true);
})();
