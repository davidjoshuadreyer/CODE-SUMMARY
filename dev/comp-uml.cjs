// Static SVG diagrams: no CDN, runtime renderer, or inferred pointer ownership.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function diagram(id,raw,source){
 const lines=source.split('\n'), nodes=[], aliases=new Map();
 function collect(list,parent=''){
  for(const n of list){
   if(['class','struct'].includes(n.kind)){
    const key=parent?parent+'::'+n.name:n.name;
    nodes.push({...n,key,children:[...n.children],category:'class'});
    collect(n.children,key);
   }else if(n.kind==='type alias')aliases.set(n.name,n.type.replace(/^(struct|class) /,''));
  }
 }
 collect(raw);
 const resolve=name=>nodes.find(n=>n.key===name||n.name===name||n.name===aliases.get(name));
 const functions=[];
 for(const n of raw){
  if(['class','struct'].includes(n.kind))continue;
  const owner=nodes.find(c=>new RegExp('\\b'+c.name+'(?:<[^>]+>)?::').test(lines[n.line-1]||''));
  if(owner){const original=owner.children.find(c=>c.name===n.name);owner.children.push({...n,kind:original?.kind||'method',access:original?.access||''});}
  else if(n.kind==='function')functions.push({...n,key:n.name+'-'+n.line,category:'function'});
 }
 const edges=[];
 for(const n of [...nodes]){
  for(const b of n.bases||[]){
   let base=resolve(b.name.split('<')[0]);
   if(!base){base={key:b.name,name:b.name,category:'class',kind:'class',children:[],external:true};nodes.push(base);}
   edges.push({from:n.key,to:base.key,type:'inherits',label:b.access+' inheritance'});
  }
  for(const f of n.children.filter(c=>['member','variable'].includes(c.kind))){
   const words=f.type.match(/[A-Za-z_]\w*/g)||[];
   const targets=[...new Set(words.map(resolve).filter(Boolean))];
   for(const target of targets)edges.push({from:n.key,to:target.key,type:'association',label:f.name+' : '+f.type});
  }
 }
 const classCount=nodes.length;
 nodes.push(...functions);
 // main and other free functions depend on types used in parameters/local variables.
 for(const n of functions){for(const f of n.children){for(const word of (f.type.match(/[A-Za-z_]\w*/g)||[])){
  const target=resolve(word);if(target&&!edges.some(e=>e.from===n.key&&e.to===target.key&&e.type==='uses'))edges.push({from:n.key,to:target.key,type:'uses',label:'uses '+target.name});
 }}}
 const visibility=a=>a==='private'?'-':a==='protected'?'#':a==='public'?'+':'';
 const field=f=>visibility(f.access)+' '+(f.name||'?')+' : '+f.type;
 const method=m=>{
  const params=m.children.filter(c=>c.kind==='parameter').map(p=>p.name+': '+p.type).join(', ');
  const fallback=(m.type.match(/\((.*)\)/)||[])[1]||'';
  const result=m.type.split(' (')[0];
  const suffix=['constructor','destructor'].includes(m.kind)?'':' : '+result;
  return visibility(m.access)+' '+m.name+'('+ (params||fallback)+')'+suffix+(m.override?' {override}':'')+(m.status==='pure virtual'?' {abstract}':'')+(m.status==='disabled'?' {deleted}':'');
 };
 const wrap=text=>{const out=[];while(text.length>44){let cut=text.lastIndexOf(' ',44);if(cut<16)cut=44;out.push(text.slice(0,cut));text=text.slice(cut).trimStart();}out.push(text);return out;};
 for(const n of nodes){
  const own=n.children.filter(c=>!['class','struct','type alias'].includes(c.kind)&&!/\bfriend\b/.test(lines[c.line-1]||''));
  const fields=own.filter(c=>['member','variable','local','parameter'].includes(c.kind));
  const methods=own.filter(c=>['constructor','destructor','method','function'].includes(c.kind));
  const dedup=[...new Map(methods.map(m=>[m.name+'|'+m.type,m])).values()];
  n.sections=[fields.map(f=>({text:field(f),line:f.line,kind:'field',static:/\bstatic\b/.test(lines[f.line-1]||'')})),dedup.map(m=>({text:method(m),line:m.line,kind:'method',abstract:m.status==='pure virtual',static:/\bstatic\b/.test(lines[m.line-1]||'')}))];
  if(n.category==='function')n.sections=[own.filter(c=>c.kind==='parameter').map(f=>({text:field(f),line:f.line,kind:'field'})),own.filter(c=>c.kind!=='parameter').map(f=>({text:field(f),line:f.line,kind:'field'}))];
  n.sections=n.sections.map(section=>section.length?section:[{text:'—',kind:'empty'}]);
  n.sections.forEach(section=>section.forEach(row=>row.parts=wrap(row.text)));
  n.sectionHeights=n.sections.map(s=>16+s.reduce((sum,r)=>sum+r.parts.length*17+3,0));
  n.height=58+n.sectionHeights.reduce((a,b)=>a+b,0);n.width=370;
 }
 // Base classes above derived classes; separate nodes/functions get their own rows.
 const rank=(n,seen=new Set())=>{if(seen.has(n.key))return 0;seen.add(n.key);const bases=edges.filter(e=>e.type==='inherits'&&e.from===n.key).map(e=>nodes.find(c=>c.key===e.to));return bases.length?1+Math.max(...bases.map(b=>rank(b,new Set(seen)))):0;};
 const ranks=new Map();for(const n of nodes){const r=n.category==='function'?100:rank(n);if(!ranks.has(r))ranks.set(r,[]);ranks.get(r).push(n);}
 let y=45;const width=860;
 for(const r of [...ranks.keys()].sort((a,b)=>a-b)){
  const group=ranks.get(r);
  for(let i=0;i<group.length;i+=2){const row=group.slice(i,i+2);row.forEach((n,j)=>{n.x=35+j*420;n.y=y;});y+=Math.max(...row.map(n=>n.height))+85;}
 }
 const byKey=new Map(nodes.map(n=>[n.key,n]));
 const displayName=key=>{const n=byKey.get(key);return n.category==='function'?n.name+'()':n.key;};
 const links=edges.map((e,index)=>{
  const a=byKey.get(e.from),b=byKey.get(e.to),color=e.type==='inherits'?'#713296':e.type==='uses'?'#52645a':'#07599c';
  let d;
  if(e.type==='inherits'){
   const ax=a.x+a.width/2,ay=a.y,bx=b.x+b.width/2,by=b.y+b.height,mid=ay-28-(index%3)*8;
   d=`M ${ax} ${ay} V ${mid} H ${bx} V ${by}`;
  }else{
   const ax=a.x+a.width,ay=a.y+27,bx=b.x+b.width,by=b.y+27,lane=width-15-(index%4)*8;
   d=a===b?`M ${ax} ${ay} h 23 v 29 h -23`:`M ${ax} ${ay} H ${lane} V ${by} H ${bx}`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" ${e.type==='uses'?'stroke-dasharray="6 4"':''} marker-end="url(#${id}-${e.type==='inherits'?'triangle':'arrow'})"><title>${esc(displayName(a.key)+' → '+displayName(b.key)+': '+e.label)}</title></path>`;
 }).join('');
 const boxes=nodes.map(n=>{
  const label=n.external?'external class':n.category==='function'?'free function · parameters / locals':n.kind;
  const title=n.category==='function'?n.name+'()':n.key;
  let cy=n.y+58;
  const sections=n.sections.map((section,i)=>{
   const start=cy;cy+=n.sectionHeights[i];let ty=start+19;
   const content=section.map(row=>{const text=`<text x="${n.x+12}" y="${ty}" fill="${row.kind==='method'?'#006657':row.kind==='field'?'#91400b':'#63726a'}" ${row.abstract?'font-style="italic"':''} ${row.static?'text-decoration="underline"':''}>${row.parts.map((p,j)=>`<tspan x="${n.x+12}" dy="${j?17:0}">${esc(p)}</tspan>`).join('')}</text>`;ty+=row.parts.length*17+3;return row.line?`<a href="#${id}-program-L${row.line}"><title>Jump to line ${row.line}</title>${text}</a>`:text;}).join('');
   return `<line x1="${n.x}" y1="${start}" x2="${n.x+n.width}" y2="${start}" stroke="#a9becd"/>${content}`;
  }).join('');
  return `<g><rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="4" fill="#fff" stroke="#07599c"/><path d="M${n.x+1},${n.y+57} V${n.y+1} H${n.x+n.width-1} V${n.y+57} Z" fill="${n.category==='function'?'#eaf3ed':'#eaf1fa'}"/><text x="${n.x+12}" y="${n.y+20}" class="uml-stereotype">«${esc(label)}»</text>${n.line?`<a href="#${id}-program-L${n.line}">`:''}<text x="${n.x+12}" y="${n.y+42}" class="uml-name" ${n.children.some(c=>c.status==='pure virtual')?'font-style="italic"':''}>${esc(title)}</text>${n.line?'</a>':''}${sections}</g>`;
 }).join('');
 return `<details class="uml-panel"><summary>${classCount?'UML class diagram':'Function & data diagram'} · see how this example fits together</summary><div class="uml-help">${classCount?'Boxes show each class’s own fields and methods. + public · − private · # protected. Italic = abstract; underline = static. Hollow triangle points to the base class.':'This example has no classes, so it uses a function/data map instead of a class diagram.'} <strong>Click a name to jump to its code.</strong></div><div class="uml-toolbar"><button type="button" data-uml-zoom="out" aria-label="Zoom diagram out">−</button><button type="button" data-uml-zoom="in" aria-label="Zoom diagram in">+</button><button type="button" data-uml-zoom="fit">Fit width</button></div><div class="uml-canvas"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${y}" role="img" aria-label="${esc(classCount?'UML class diagram':'Function and data diagram')} for ${id}"><defs><marker id="${id}-triangle" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1,1 L11,6 L1,11 Z" fill="white" stroke="#713296"/></marker><marker id="${id}-arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1,1 L11,6 L1,11" fill="none" stroke="#52645a"/></marker></defs>${links}${boxes}</svg></div>${edges.length?`<ul class="uml-relations">${edges.map(e=>`<li><strong>${esc(displayName(e.from))} → ${esc(displayName(e.to))}</strong>: ${esc(e.label)}${e.type==='association'?' (member relationship; ownership not inferred)':e.type==='uses'?' (dashed dependency)':''}</li>`).join('')}</ul>`:''}</details>`;
}
module.exports=diagram;
