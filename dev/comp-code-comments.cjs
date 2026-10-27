// Add study annotations without changing any C++ statements.
const {parse,mask}=require('../comp139e/class-editor.js');
const purposes={
 enqueue:'Add an item at the back so items leave in arrival order (FIFO).',
 dequeue:'Remove and return the oldest item; in a linked queue, clear tail when the last node is removed.',
 push:'Put the new item on top of the stack (LIFO).',
 pop:'Remove and return the top item; check the empty case first.',
 top:'Read the top item without removing it.',front:'Read the oldest item without removing it.',
 isEmpty:'Report whether there are no stored items.',isFull:'Report whether the fixed storage has reached capacity.',
 size:'Return the number of stored items.',countNodes:'Walk through the links to count nodes without moving head.',
 addToHead:'Link a new node before the current first node.',addToTail:'Link a new node after the current last node.',
 deleteFromHead:'Remove the first node and repair the empty-list pointers when needed.',
 deleteFromTail:'Remove the last node; handle empty and one-node lists separately.',
 deleteNode:'Find and unlink the requested node without losing the rest of the chain.',
 isInList:'Search the nodes for a matching value.',clear:'Release stored nodes and restore the empty state.',
 getArea:'Calculate and return this shape’s area.',execute:'Perform this job’s specific action.',draw:'Display this shape’s specific information.',
 controlStep:'Calculate the controller output for this step; update stored state if needed.',
 insert:'Insert the item at the requested position and preserve the remaining items.',
 remove:'Remove the requested item or position and preserve the remaining items.',
 reverse:'Reverse the item order while keeping the structure connected.',
 reset:'Restore the object’s state for reuse.',
};
const clean=s=>String(s).replace(/\s+/g,' ').replaceAll('*/','* /').trim();
module.exports=function annotate(source,item){
 const lines=source.split('\n'),notes=new Map();
 const put=(offset,text)=>{const n=source.slice(0,offset).split('\n').length-1;if(source.slice(source.lastIndexOf('\n',offset-1)+1,offset).trim())return;if(!notes.has(n))notes.set(n,[]);if(!notes.get(n).includes(text))notes.get(n).push(text);};
 const classes=parse(source);
 for(const c of classes){
  const derived=c.base,abstract=c.members.some(m=>/=\s*0\s*;/.test(m.signature));
  const isBase=classes.some(other=>new RegExp('\\b'+c.name+'\\b').test(other.base));
  put(c.start,derived?`DERIVED ${c.kind.toUpperCase()}: ${c.name} inherits ${clean(derived)} and adds or overrides behavior.`:abstract?`ABSTRACT BASE: ${c.name} defines the common interface; create derived objects instead.`:isBase?`BASE CLASS: ${c.name} holds the data and behavior shared by derived classes.`:`${c.kind.toUpperCase()}: ${c.name} groups related data and operations.`);
  let fieldsDone=false;
  for(const m of c.members){
   if(m.kind==='field'){
    if(!fieldsDone){put(m.start,m.access==='protected'?'SHARED STATE: derived classes can access these protected members.':m.access==='private'?'OWN STATE: private data belongs to this class; callers use its public methods.':'PUBLIC DATA: callers can access these members directly.');fieldsDone=true;}continue;
   }
   const name=m.name;
   if(name===c.name){put(m.start,derived?'CONSTRUCTOR: initialize the base part and this class’s own fields.':'CONSTRUCTOR: establish the object’s initial state.');continue;}
   if(name==='~'+c.name){put(m.start,/virtual/.test(m.signature)?'VIRTUAL DESTRUCTOR: supports safe cleanup through a base-class pointer.':'DESTRUCTOR: runs when the object is destroyed; release resources owned here.');continue;}
   if(/=\s*0\s*;/.test(m.signature)){put(m.start,'REQUIRED OVERRIDE: derived classes provide this pure virtual function’s body.');continue;}
   let purpose=purposes[name];
   if(!purpose&&/^get[A-Z]/.test(name))purpose='Read and return the requested stored value or calculation.';
   if(!purpose&&/^set[A-Z]/.test(name))purpose='Update the requested value in this object.';
   if(!purpose)purpose=`${name}(): ${m.body===null?'declare the interface; its definition may appear outside the class.':'perform this operation using the class’s state and the supplied arguments.'}`;
   put(m.start,(/\boverride\b/.test(m.signature)?'OVERRIDE: ':'METHOD: ')+purpose);
  }
 }
 // Top-level helper functions and main: keep the execution path easy to spot.
 let offset=0,lineIndex=0;const maskedLines=mask(source).split('\n');
 for(const line of lines){
  const maskedLine=maskedLines[lineIndex++];
  if(!classes.some(c=>offset>=c.start&&offset<c.end)){
   const match=maskedLine.match(/^\s*(?:inline\s+)?(?:[\w:*&<>]+\s+)+([A-Za-z_]\w*)\s*\([^;]*\)\s*(?:const\s*)?\{/);
   if(match){const name=match[1];put(offset+maskedLine.search(/\S/),name==='main'?'MAIN: create the test data, call the operations, and use or display the results.':`FUNCTION: ${name} is outside the classes; it works with its arguments.`);}
  }
  offset+=line.length+1;
 }
 return '// PURPOSE: '+clean(item.when)+'\n'+lines.map((line,i)=>{
  const indent=(line.match(/^\s*/)||[''])[0];return (notes.get(i)||[]).map(n=>indent+'// '+n+'\n').join('')+line;
 }).join('\n');
};
