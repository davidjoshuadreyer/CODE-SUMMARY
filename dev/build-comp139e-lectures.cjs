const fs=require('node:fs'),path=require('node:path');
const lessons=require('./comp139e-lectures.cjs');
const dir=path.resolve(__dirname,'../comp139e');
function prepare(){
 const programs=JSON.parse(fs.readFileSync(path.join(dir,'programs.json'),'utf8')).filter(p=>p.kind!=='lectures');
 fs.mkdirSync(path.join(dir,'workspace/lectures'),{recursive:true});
 for(const lesson of lessons)for(const example of lesson.examples){
  const source=`lectures/${example.id}.cpp`;
  fs.writeFileSync(path.join(dir,'workspace',source),`// ${example.title}\n// Lecture: ${lesson.pdf}, pages ${lesson.pages}\n// Try: ${example.try}\n`+example.code);
  programs.push({id:'lecture:'+example.id,kind:'lectures',title:example.title,label:'Lecture practice',group:lesson.title,source,files:[source],runnable:true,sample:example.sample||'',inputHint:example.sample?'Enter a non-negative radius.':'This example needs no keyboard input.',note:example.try,lesson:'slides-'+lesson.slug+'.html',output:example.output||[]});
 }
 fs.writeFileSync(path.join(dir,'programs.json'),JSON.stringify(programs,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'workspace/lectures/README.md'),'# Practice from the covered lecture slides\n\nEach .cpp is a standalone C++17 program with its own main function. Compile one at a time, for example:\n\n```sh\ng++ -std=c++17 strings.cpp -o strings\n./strings\n```\n\nThe file example writes scores.txt in its working directory.\n\n'+lessons.map(l=>'## '+l.title+'\n\nSource: '+l.pdf+' (pages '+l.pages+').\n\n'+l.examples.map(e=>'- '+e.id+'.cpp: '+e.title).join('\n')).join('\n\n')+'\n');
}
function render({shell,escape,code}){
 const link=l=>'slides-'+l.slug+'.html';
 const cards=lessons.map((l,i)=>`<a class="lesson-card" href="${link(l)}"><span class="eyebrow">COVERED SLIDES ${i+1} / 5</span><h2>${escape(l.title)}</h2><p>${l.examples.length} small programs with expected output and practice changes.</p></a>`).join('');
 fs.writeFileSync(path.join(dir,'slides.html'),shell('Covered lecture slides',`<h1>What we have covered so far</h1><p class="lead">Five uploaded lecture decks, explained through ten small C++ programs.</p><p>Follow these in lecture order. Each lesson links to its source slides and includes explanations, expected output, runnable examples, and a quick self-check.</p><div class="grid">${cards}</div><p><a href="review.html">Browse all course lessons</a></p>`));
 for(const [index,l] of lessons.entries()){
  const source='lecture%20slides/'+encodeURIComponent(l.pdf);
  fs.writeFileSync(path.join(dir,link(l)),shell(l.title,`<a href="slides.html">← Covered lecture slides</a><h1>${escape(l.title)}</h1><p class="lead">Lecture ${index+1} of 5 · Read, predict, run, change.</p><p>Based on <a href="${source}">${escape(l.pdf)}</a>, pages ${escape(l.pages)}. These explanations and programs use C++17.</p>${l.ideas.map(([title,body])=>`<section><h2>${escape(title)}</h2><p>${escape(body)}</p></section>`).join('')}${l.examples.map(e=>`<section><h2>${escape(e.title)}</h2><p><strong>Predict:</strong> Trace the statements before looking at the expected output.</p><div class="actions"><a class="button primary" href="desk.html#${encodeURIComponent('lecture:'+e.id)}">Edit and run</a><a href="workspace/lectures/${e.id}.cpp" download>Download C++</a></div>${code(e.code)}${e.sample?`<p>Example input:</p><pre>${escape(e.sample)}</pre>`:'<p>No keyboard input needed.</p>'}<details><summary>Expected output</summary><pre>${escape(e.expected)}</pre></details><p><strong>Try this:</strong> ${escape(e.try)}</p>${e.output?'<p>This program creates scores.txt. Each online run starts fresh; local runs overwrite that file in the working directory.</p>':''}</section>`).join('')}<section><h2>Check your understanding</h2><p>${escape(l.check[0])}</p><details><summary>Explain the answer</summary><p>${escape(l.check[1])}</p></details></section><section><h2>Continue practising</h2><ul>${l.related.map(n=>`<li><a href="lesson-${String(n).padStart(2,'0')}.html">Related course lesson ${n}</a></li>`).join('')}</ul>${lessons[index+1]?`<a class="button" href="${link(lessons[index+1])}">Next covered lecture →</a>`:'<a href="slides.html">Back to covered lectures</a>'}</section>`));
 }
}
module.exports={prepare,render};
