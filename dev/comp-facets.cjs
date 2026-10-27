const short={
'inherit-basic':'Base + derived','inherit-abstract':'Abstract base','inherit-protected':'Protected data','inherit-base-call':'Reuse base method','inherit-outside':'Outside definitions','inherit-template':'Template inheritance',
'list-core':'Generic list','list-count':'Count','list-find':'Find','list-tail':'Remove tail','list-remove-value':'Remove match','list-reverse':'Reverse',
'stack-core':'Lab stack','stack-clear':'Clear','stack-reverse-text':'Reverse text','stack-brackets':'Parentheses','stack-transfer':'Transfer','stack-shapes':'Shapes',
'queue-manual':'Linked queue','queue-list':'STL list wrapper','queue-circular':'Circular queue','queue-records':'Jobs','queue-rotate':'Rotate','queue-reverse':'Reverse',
'variant-square':'Square','variant-triangle':'Triangle','variant-shape-print':'Print shapes','variant-shape-queue':'Shape queue','variant-shape-heap':'Delete shapes','variant-controller-switch':'Switch controller','variant-controller-limit':'Limit output','variant-moving-average':'Running average','variant-list-sum':'Sum / average','variant-list-insert-after':'Insert after','variant-list-sorted':'Sorted insert','variant-list-remove-all':'Remove all matches','variant-stack-copy-order':'Copy stack','variant-stack-postfix':'Postfix','variant-stack-min':'Minimum','variant-queue-filter':'Filter queue','variant-queue-merge':'Merge queues','variant-queue-two-stacks':'Two-stack queue','variant-record-array':'Result array',
'lab05-controller':'Lab 5 · Controllers','lab06-shape-stack':'Lab 6 · Shapes + stack','lab07-shape-vector':'Lab 7 · Shape vector'
};
module.exports=x=>{
 if(x.facets)return {...x.facets,structure:[x.facets.structure],label:x.shortTitle};
 const id=x.id, code=x.code,structure=[];
 if(/stack/i.test(id)||/class\s+Stack\b/.test(code))structure.push('stack');
 if(/queue/i.test(id)||/class\s+\w*Queue\b/.test(code))structure.push('queue');
 if(/^(list-|variant-list-|linked-list)/.test(id))structure.push('list');
 if([...code.matchAll(/class\s+\w+(?:\s*<[^>]+>)?\s*:\s*public\s+(\w+)/g)].some(m=>!['exception','runtime_error'].includes(m[1])))structure.push('inheritance');
 if(!structure.length)structure.push('other');
 let storage='none';
 if(structure.some(t=>['stack','queue','list'].includes(t)))storage=/\blist\s*</.test(code)?'stl':/Node|next|topOfStack/.test(code)?'linked':'array';
 let label=short[id]||x.title.replace(/^\d+ · /,'').replace(/^(Shape|Controller|Class|List|Stack|Queue|Data-return) variation · /,'');
 return {structure,storage,type:/template\s*</.test(code)?'template':'int',role:id.startsWith('inherit-')?'generic':'example',label};
};
