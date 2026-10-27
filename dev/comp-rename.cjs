// Conservative offline renaming: only names with one declaration owner.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
module.exports=(id,symbols)=>{
 const all=[];
 function walk(nodes,owner=''){for(const n of nodes){all.push({...n,owner});walk(n.children,owner?owner+'::'+n.name:n.name);}}walk(symbols);
 const excluded=new Set(['main','what','operator=','operator<<','operator>>']);
 const counts=new Map();
 for(const n of all)if(!['constructor','destructor'].includes(n.kind))counts.set(n.name,(counts.get(n.name)||0)+1);
 const rows=all.filter(n=>!['constructor','destructor'].includes(n.kind)&&/^[A-Za-z][A-Za-z0-9_]*$/.test(n.name)&&!excluded.has(n.name));
 // A virtual family can be renamed together when every declaration belongs
 // to one connected inheritance family in this example.
 const classes=all.filter(n=>['class','struct'].includes(n.kind));
 function family(nodes){
  if(!nodes.every(n=>n.kind==='method')||new Set(nodes.map(n=>n.type)).size!==1)return false;
  const connected=new Set([nodes[0].owner]);let changed=true;
  while(changed){changed=false;for(const c of classes)for(const b of c.bases||[]){const base=b.name.split('<')[0];if(connected.has(c.name)||connected.has(base))for(const name of [c.name,base])if(!connected.has(name)){connected.add(name);changed=true;}}}
  return nodes.every(n=>connected.has(n.owner));
 }
 const safe=[...new Set(rows.map(n=>n.name))].flatMap(name=>{
  const same=rows.filter(n=>n.name===name);
  if(counts.get(name)===1)return [same[0]];
  return family(same)?[{...same[0],kind:'method family',owner:same.map(n=>n.owner).join(', ')}]:[];
 });
 return `<details class="rename-panel"><summary>Rename for my question</summary><div class="rename-body"><p>Rename a class, field, method, parameter or local variable. Code, UML and copied/downloaded code update together. Changes stay in this tab; download the .cpp to keep them.</p><p class="rename-limits">Virtual method families rename together, including overrides and calls. Unrelated shared names and main() are locked. Comments, strings and explanations keep their original wording. Blank starters remain original.</p><form class="rename-form"><label>Symbol<select class="rename-symbol">${safe.map(n=>`<option value="${esc(n.name)}" data-line="${n.line}">${esc(n.name)} · ${esc(n.kind)}${n.owner?' · '+esc(n.owner):''}</option>`).join('')}</select></label><label>New name<input class="rename-input" autocomplete="off" spellcheck="false" placeholder="e.g. JobQueue" required pattern="[A-Za-z][A-Za-z0-9_]*"></label><button type="submit" ${safe.length?'':'disabled'}>Rename</button><button type="button" data-rename-undo disabled>Undo</button><button type="button" data-rename-reset disabled>Reset names</button></form><p class="rename-status" role="status" aria-live="polite">${safe.length} names available. In UML rename mode, click a class, field or method to select it.</p></div></details>`;
};
