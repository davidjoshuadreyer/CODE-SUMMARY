const patterns=require('../comp139e/midterm-patterns.json');
const basics=require('../comp139e/code-templates.json');
const labs=require('../comp139e/lab-patterns.json');
const combinations=require('../comp139e/combination-patterns.json');
const practice=require('../comp139e/chat-practice.json');
const items=[...combinations,...practice,...patterns,...labs,...basics];
const annotate=require('./comp-code-comments.cjs');
const program=x=>annotate((x.code.trimEnd()+'\n\n'+(x.mainSignature||'int main()')+' {\n'+x.use.trimEnd().split('\n').map(l=>'    '+l).join('\n')+'\n    return 0;\n}\n').replace(/[ \t]+$/gm,''),x);
module.exports={patterns,basics,labs,items,program};
