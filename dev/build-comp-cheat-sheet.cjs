const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname,'../comp139e');
const esc = s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const decode = s=>s.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&amp;','&');
const original = fs.readFileSync(path.join(root,'fill-in-the-blanks.html'),'utf8');
const paper = original.match(/<section class="paper"[\s\S]*?<\/section>/)[0];
const source = [...paper.matchAll(/<div class="line">([\s\S]*?)<\/div>/g)].map(m=>decode(m[1].replace(/<input id="blank-(\d+)"[^>]*>/g,(_,n)=>'@'+n).replaceAll('&nbsp;',''))).join('\n');
const bank = [{slug:'rectangle',title:'Original · Rectangle',source,answers:require('../comp139e/worksheet-checker.js').answers},...require('../comp139e/practice-exercises.json')];
const positions = {
 rectangle:['Return type','Whole parameter','Return type','Whole parameter','Constructor scope','Constructor scope','Call argument','Return type + class scope','Return type + class scope','Variable type','Return type + class scope','Parameter type','Array element','Array element','Return type + class scope','Variable type','Object + member access','Pointer + member access','Variable type + name','Address argument','Array deletion'],
 references:['Reference symbol','Reference symbol','Value to assign','Saved value','Reference symbol','Default argument','Decimal conversion','Reference argument'],
 'dynamic-array':['Return type','Array allocation','Loop limit','Input element','Returned pointer','Dereference pointer','Element address','Array deletion','Reset pointer'],
 'sensor-class':['Constructor scope','Constructor scope','Class scope only','Const qualifier','Pointer operator','Pointer operator','Array allocation','Object operator','Element address','Array deletion'],
 'strings-static':['Increment counter','String method','Not-found constant','String method','Returned member','Static member definition','Method name','Static method call'],
 'box-review':['Constructor scope','Array argument','Return type only','Volume formula','Third array element','Return type only','Reference symbol','Method name only','Array allocation','Complete method call','Array deletion','Array deletion','Array deletion'],
 'file-streams':['Output-stream type','Output operator','Close method','Input-stream type','Read condition','Add to total','End-of-file method'],
 exceptions:['Throw keyword','Division operator','Try keyword','Catch keyword','Reference symbol','Message method']
};
let count=0;
const sections=bank.map(exercise=>{
 assert.equal(positions[exercise.slug].length,exercise.answers.length);
 const rows=exercise.answers.map((item,index)=>{
  const marker='@'+(index+1);
  const lines=exercise.source.split('\n').filter(line=>[...line.matchAll(/@(\d+)/g)].some(m=>Number(m[1])===index+1));
  assert.equal(lines.length,1,exercise.slug+':'+marker);
  const code=lines[0].trim().replace(/@(\d+)/g,(_,n)=>Number(n)===index+1?'___':'…');
  count++;
  return `<tr><td><strong>${index+1} · ${esc(positions[exercise.slug][index])}</strong></td><td><code>${esc(code)}</code><small>${esc(item.explanation)}</small></td><td><code>${esc(item.answer)}</code></td></tr>`;
 }).join('\n');
 const href=exercise.slug==='rectangle'?'fill-in-the-blanks.html':`practice-${exercise.slug}.html`;
 return `<section data-worksheet="${exercise.slug}"${exercise.slug==='box-review'?'':' hidden'}><h2>${esc(exercise.title)}</h2><p><a href="${href}">Open this worksheet →</a> · ${exercise.answers.length} blanks</p><table><thead><tr><th>Blank location</th><th>If you see this…</th><th>Write this</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}).join('\n');
assert.equal(count,82);
const old=fs.readFileSync(path.join(root,'cpp-cheat-sheet.html'),'utf8');
let header=old.slice(0,old.indexOf('<article class="page">'));
header=header.replace(/<style id="worksheet-guide">[\s\S]*?<\/style>/, '');
header=header.replace('</head>', '<style id="worksheet-guide">small{display:block;color:#526358;margin-top:5px;font-size:12px;line-height:1.4}select{max-width:100%;font:inherit;padding:9px;margin:6px 0 18px;background:white;border:1px solid #8a9e90;border-radius:4px}label{font-weight:bold;display:block}section[hidden]{display:none}td code{white-space:pre-wrap}th:first-child{width:23%}th:nth-child(2){width:49%}@media print{select,label{display:none}small{font-size:9px}section{break-inside:auto}}</style></head>');
const options=bank.map(x=>`<option value="${x.slug}"${x.slug==='box-review'?' selected':''}>${esc(x.title)}</option>`).join('');
fs.writeFileSync(path.join(root,'cpp-cheat-sheet.html'),header+`<article class="page"><h1>Where is the blank?</h1><p class="sub">Choose your worksheet. Write only the missing part: if <code>Box::</code> is already printed, do not repeat it. Other blanks on the same line appear as <code>…</code>.</p><label for="worksheet">Worksheet</label><select id="worksheet">${options}</select>${sections}</article><script src="cheat-sheet.js?v=1"></script></body></html>`);
console.log(`Verified ${count} blank-to-answer mappings across ${bank.length} worksheets.`);
