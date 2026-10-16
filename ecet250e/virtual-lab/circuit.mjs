// Ideal DC modified nodal analysis. Floating islands get independent references.
// A current meter is a zero-volt source, so its branch current is solved by KCL.
export function network(edges, sources=[]){
 const parent=new Map();function root(n){if(!parent.has(n))parent.set(n,n);if(parent.get(n)!==n)parent.set(n,root(parent.get(n)));return parent.get(n)}
 const wires=edges.filter(e=>e.type==='wire'||e.r===0);wires.forEach(e=>parent.set(root(e.a),root(e.b)));
 const rs=edges.filter(e=>e.type!=='wire'&&e.r>0).map(e=>({...e,a:root(e.a),b:root(e.b)}));const vs=sources.map(e=>({...e,a:root(e.a),b:root(e.b)}));
 if(vs.some(s=>s.a===s.b&&s.v!==0))return {error:'short',current:0,voltage:()=>null};
 // A zero-volt instrument in parallel with an ideal short cannot determine current.
 if(vs.some(s=>s.a===s.b&&s.id==='meter'))return {error:'bypassed',current:0,voltage:()=>null};
 const links=new Map();for(const e of [...rs,...vs]){if(!links.has(e.a))links.set(e.a,[]);if(!links.has(e.b))links.set(e.b,[]);links.get(e.a).push(e.b);links.get(e.b).push(e.a)}
 const islands=new Map(),refs=new Set();for(const node of links.keys())if(!islands.has(node)){let q=[node];refs.add(node);islands.set(node,node);while(q.length)for(const n of links.get(q.pop())||[])if(!islands.has(n)){islands.set(n,node);q.push(n)}}
 const nodes=[...links.keys()].filter(n=>!refs.has(n)),ix=new Map(nodes.map((n,i)=>[n,i])),n=nodes.length,size=n+vs.length,A=Array.from({length:size},()=>Array(size+1).fill(0));
 function add(i,j,v){if(i!==undefined&&j!==undefined)A[i][j]+=v}
 for(const e of rs){const a=ix.get(e.a),b=ix.get(e.b),g=1/e.r;add(a,a,g);add(b,b,g);add(a,b,-g);add(b,a,-g)}
 vs.forEach((e,k)=>{const a=ix.get(e.a),b=ix.get(e.b),i=n+k;add(a,i,1);add(b,i,-1);add(i,a,1);add(i,b,-1);A[i][size]=e.v});
 for(let i=0;i<size;i++){let pivot=i;for(let j=i+1;j<size;j++)if(Math.abs(A[j][i])>Math.abs(A[pivot][i]))pivot=j;if(Math.abs(A[pivot][i])<1e-13)return {error:'conflict',voltage:()=>null};[A[i],A[pivot]]=[A[pivot],A[i]];let d=A[i][i];for(let j=i;j<=size;j++)A[i][j]/=d;for(let k=0;k<size;k++)if(k!==i){const f=A[k][i];for(let j=i;j<=size;j++)A[k][j]-=f*A[i][j]}}
 const values=new Map([...refs].map(x=>[x,0]));nodes.forEach((x,i)=>values.set(x,A[i][size]));
 function voltage(a,b){a=root(a);b=root(b);if(a===b)return 0;if(!islands.has(a)||islands.get(a)!==islands.get(b))return null;return values.get(a)-values.get(b)}
 return {error:null,voltage,currents:Object.fromEntries(vs.map((e,k)=>[e.id,A[n+k][size]])),branches:Object.fromEntries(rs.map(e=>[e.id,(voltage(e.a,e.b)||0)/e.r]))};
}
export function measure(edges,{voltage=0,powered=false,red=null,black=null,mode='voltage',jack='VΩ',supplyConnected=true}={}){
 const sources=supplyConnected?[{id:'supply',a:'P',b:'N',v:powered?voltage:0}]:[];
 const base=network(edges,sources);const supplyCurrent=Math.abs(base.currents?.supply||0);
 if(mode==='resistance'&&powered)return {value:null,error:'Power off before Ω measurement',supplyCurrent};
 if(mode==='resistance'&&edges.some(e=>['P','N'].includes(e.a)||['P','N'].includes(e.b)))return {value:null,error:'Disconnect both supply leads for Ω',supplyCurrent};
 if(!red||!black)return {value:null,error:'Place both probes',supplyCurrent};
 if(jack!==(mode==='current'?'I':'VΩ'))return {value:null,error:mode==='current'?'Move red lead to I input':'Move red lead to VΩ input',supplyCurrent};
 if(mode==='resistance'){
  const test=network(edges,[{id:'test',a:red,b:black,v:1}]);if(test.error==='short')return {value:0,error:null,supplyCurrent:0};if(test.error)return {value:null,error:'Open or conflicting network',supplyCurrent:0};const i=Math.abs(test.currents.test);return {value:i>1e-12?1/i:null,error:i>1e-12?null:'Open circuit',supplyCurrent:0};
 }
 if(mode==='current'){
  // Detect a direct short through the meter before enabling it.
  const check=network([...edges,{type:'wire',a:red,b:black}],sources);if(check.error==='short')return {value:null,error:'A across source — fuse protection',supplyCurrent:0};
  const result=network(edges,[...sources,{id:'meter',a:red,b:black,v:0}]);if(result.error)return {value:null,error:result.error==='bypassed'?'Meter bypassed: open the branch':'Conflicting meter connection',supplyCurrent};
  return {value:result.currents.meter,error:null,supplyCurrent:Math.abs(result.currents.supply||0),network:result};
 }
 if(base.error)return {value:null,error:'Supply short — output protected',supplyCurrent:0};const value=base.voltage(red,black);return {value,error:value===null?'Floating or unconnected probes':null,supplyCurrent,network:base};
}
