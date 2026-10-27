// Conservative offline renaming: only names with one declaration owner.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
module.exports=(id,symbols)=>{
 const all=[];
 function walk(nodes,owner=''){for(const n of nodes){all.push({...n,owner});walk(n.children,owner?owner+'::'+n.name:n.name);}}walk(symbols);
 const excluded=new Set(['main','what','operator=','operator<<','operator>>']);
 const counts=new Map();
 for(const n of all)if(!['constructor','destructor'].includes(n.kind))counts.set(n.name,(counts.get(n.name)||0)+1);
 const rows=all.filter(n=>!['constructor','destructor'].includes(n.kind)&&/^[A-Za-z][A-Za-z0-9_]*$/.test(n.name)&&!excluded.has(n.name));
 // Overridden/library-interface names and repeated names require compiler refactoring.
 const protectedNames=new Set(all.filter(n=>n.override||n.status==='pure virtual').map(n=>n.name));
 const safe=rows.filter(n=>counts.get(n.name)===1&&!protectedNames.has(n.name));
 return `<details class="rename-panel"><summary>Rename for my question</summary><div class="rename-body"><p>Rename a class, field, method, parameter or local variable. Code, UML and copied/downloaded code update together. Changes stay in this tab; download the .cpp to keep them.</p><p class="rename-limits">Names shared by multiple declarations, virtual overrides and main() are locked. Comments, strings and explanations keep their original wording. Blank starters remain original.</p><form class="rename-form"><label>Symbol<select class="rename-symbol">${safe.map(n=>`<option value="${esc(n.name)}" data-line="${n.line}">${esc(n.name)} · ${esc(n.kind)}${n.owner?' · '+esc(n.owner):''}</option>`).join('')}</select></label><label>New name<input class="rename-input" autocomplete="off" spellcheck="false" placeholder="e.g. JobQueue" required pattern="[A-Za-z][A-Za-z0-9_]*"></label><button type="submit" ${safe.length?'':'disabled'}>Rename</button><button type="button" data-rename-undo disabled>Undo</button><button type="button" data-rename-reset disabled>Reset names</button></form><p class="rename-status" role="status" aria-live="polite">${safe.length} names available. In UML rename mode, click a class, field or method to select it.</p></div></details>`;
};
