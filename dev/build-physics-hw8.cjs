const fs=require('fs'),path=require('path'),katex=require('katex');
const root=path.resolve(__dirname,'..');
const content=require('../phys210/homework-8.json');
const source=require('./physics-more-homework.cjs').filter(q=>q.homework===8);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const math=s=>'<div class="equation">'+katex.renderToString('\\begin{gathered}'+s+'\\end{gathered}',{displayMode:true,throwOnError:true,strict:'ignore'})+'</div>';
const captions={drift:'Conventional current and electron drift point in opposite directions.',gauges:'Both wires have the same length and current. More area means a lower drift speed.',square:'Use the square cross-sectional area, A = s².',stretch:'The volume stays constant as the wire becomes longer and thinner.',cable:'Use the stated length of one cable.',gold:'The electric field and current point toward lower potential.'};
const sections=content.map((p,i)=>{
 const q=source.find(x=>x.id===p.id);if(!q)throw Error('Missing source '+p.id);
 return '<section class="question" id="q-'+p.id+'"><h2>Question '+(i+1)+' <span>'+esc(q.title)+'</span></h2><p>'+esc(q.given)+' '+esc(q.find)+'</p><details class="source"><summary>Original question</summary><img src="homework-8-figures/'+p.id+'-question.png" alt="Assigned question '+q.problem+' from the PHYS 210 Homework 8 handout"></details>'+
 (p.figure?'<figure><img src="homework-8-figures/'+p.figure+'.svg" alt="'+esc(captions[p.figure])+'"><figcaption>'+esc(captions[p.figure])+'</figcaption></figure>':'')+
 p.steps.map(s=>'<div class="step"><h3>'+esc(s.title)+'</h3><p>'+esc(s.text)+'</p>'+math(s.math)+'</div>').join('')+
 '<div class="answer"><h3>Final answer</h3>'+math(p.answer)+'</div><p class="check">'+esc(q.steps[3][1])+'</p></section>';
}).join('');
fs.writeFileSync(path.join(root,'phys210/homework-8.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Physics Homework 8 · Worked solutions · Tesselate</title><link rel="stylesheet" href="../assets/vendor/katex/katex.min.css"><link rel="stylesheet" href="homework-8.css"></head><body><header><a href="../index.html#course/phys210">tesselate. / PHYS 210</a><a href="assignments.html#f26-7">Assignments</a></header><main><h1>Physics Homework 8</h1><p class="subtitle">Resistivity and resistance · Worked solutions</p><p>All eight assigned questions. Each solution shows the setup, substitution and final answer. Use e = 1.602 × 10⁻¹⁹ C.</p><nav aria-label="Questions">'+source.map(q=>'<a href="#q-'+q.id+'">'+q.problem+'</a>').join('')+'<button onclick="window.print()">Print / Save PDF</button></nav>'+sections+'<footer><p>Questions and resistivity values: <a href="'+esc(source[0].source)+'">PHYS 210 Homework 8 handout</a>, pp. 1–2. Values and numbering checked against the handout. Calculations retain extra digits before rounding.</p></footer></main></body></html>');
console.log('Built '+content.length+' complete Homework 8 solutions.');
