const patterns=require('../comp139e/midterm-patterns.json');
const basics=require('../comp139e/code-templates.json');
const labs=require('../comp139e/lab-patterns.json');
const combinations=require('../comp139e/combination-patterns.json');
const items=[...combinations,...patterns,...labs,...basics];
const program=x=>(x.code.trimEnd()+'\n\n'+(x.mainSignature||'int main()')+' {\n'+x.use.trimEnd().split('\n').map(l=>'    '+l).join('\n')+'\n    return 0;\n}\n').replace(/[ \t]+$/gm,'');
module.exports={patterns,basics,labs,items,program};
