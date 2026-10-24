const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const folder = path.join(root, 'comp139e');
const bank = JSON.parse(fs.readFileSync(path.join(folder, 'practice-exercises.json'), 'utf8'));
const esc = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let template = fs.readFileSync(path.join(folder, 'fill-in-the-blanks.html'), 'utf8');
const worksheets = [{title:'Original · Rectangle',url:'fill-in-the-blanks.html'},...bank.map(item=>({title:item.title,url:`practice-${item.slug}.html`}))];
function navigation(current) {
  const index=worksheets.findIndex(item=>item.url===current);
  return `<nav aria-label="Worksheet navigation" class="worksheet-nav"><label for="exercise-picker">Choose an exercise</label><select id="exercise-picker">${worksheets.map(item=>`<option value="${item.url}" ${item.url===current?'selected':''}>${esc(item.title)}</option>`).join('')}</select><div class="worksheet-links">${index>0?`<a href="${worksheets[index-1].url}">← ${esc(worksheets[index-1].title)}</a>`:'<a href="midterm-practice.html">← All worksheets</a>'}${index+1<worksheets.length?`<a href="${worksheets[index+1].url}">${esc(worksheets[index+1].title)} →</a>`:'<a href="midterm-practice.html">All worksheets →</a>'}</div></nav>`;
}
const replaceNavigation=(html,url)=>html.replace(/<!-- practice-navigation -->[\s\S]*?<!-- \/practice-navigation -->/,`<!-- practice-navigation -->${navigation(url)}<!-- /practice-navigation -->`);
template=replaceNavigation(template,'fill-in-the-blanks.html');
fs.writeFileSync(path.join(folder,'fill-in-the-blanks.html'),template);
fs.writeFileSync(path.join(folder,'practice-bank.js'), 'window.COMP_PRACTICE = '+JSON.stringify(bank)+';\n');
for (const [index, item] of bank.entries()) {
  let html = template.replace('<body>', `<body data-exercise="${item.slug}">`)
    .replace('<title>Fill in the blanks · COMP 139E</title>', `<title>${esc(item.title)} · COMP 139E</title>`)
    .replace('<h1>Fill in the blanks</h1>', `<h1>${esc(item.title)}</h1><p>${esc(item.topic)}</p>`)
    .replace('<script defer src="worksheet-checker.js?v=1"></script>', '<script defer src="practice-bank.js?v=2"></script><script defer src="practice-checker.js?v=1"></script>');
  const lines = item.source.split('\n').map(line=>'<div class="line">'+(esc(line).replace(/@(\d+)/g,(_,n)=>`<input id="blank-${n}" aria-label="Blank ${n}" autocomplete="off" autocapitalize="off" spellcheck="false">`) || '&nbsp;')+'</div>').join('');
  html = html.replace(/<section class="paper"[\s\S]*?<\/section><\/main>/, `<section class="paper" aria-label="Practice code">${lines}</section></main>`);
  html = replaceNavigation(html,`practice-${item.slug}.html`);
  fs.writeFileSync(path.join(folder,`practice-${item.slug}.html`), html);
}
const groups = [
  {id:'original',title:'Original worksheet',items:[{title:'Original · Rectangle',topic:'Classes, pointers and dynamic arrays',url:'fill-in-the-blanks.html',count:21}]},
  {id:'foundations',title:'Functions, pointers & arrays',slugs:['references','dynamic-array']},
  {id:'classes',title:'Classes & objects',slugs:['sensor-class','strings-static','box-review']},
  {id:'files-exceptions',title:'Files & exceptions',slugs:['file-streams','exceptions']},
  {id:'stacks-queues',title:'Stacks & queues',slugs:['linked-stack','linked-queue','circular-queue']}
];
const sections=groups.map(group=>`<section id="${group.id}" class="topic-section"><h2>${esc(group.title)}</h2><div class="practice-grid">${(group.items||group.slugs.map(slug=>bank.find(item=>item.slug===slug))).map(item=>`<a class="practice-card" href="${item.url||`practice-${item.slug}.html`}"><h3>${esc(item.title)}</h3><p>${esc(item.topic)}</p><span>${item.count||item.answers.length} blanks · Open worksheet →</span></a>`).join('')}</div></section>`).join('');
const css = template.match(/<style>([\s\S]*?)<\/style>/)[1];
fs.writeFileSync(path.join(folder,'midterm-practice.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fill-in-the-blank practice · COMP 139E</title><style>${css}.practice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:16px}.practice-card{display:block;background:white;border:1px solid #ccd2cb;border-radius:8px;padding:20px;text-decoration:none;color:#213e34}.practice-card h3{font-size:20px;margin-top:0}.practice-card p{line-height:1.6;color:#444}.practice-card:hover,.practice-card:focus-visible{border-color:#487d72;outline:2px solid #487d72}.topic-section{margin:36px 0;scroll-margin-top:20px}.topic-jumps{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}.topic-jumps a{padding:10px 14px;border:1px solid #ccd2cb;border-radius:6px;background:white;color:#213e34}</style></head><body><main class="toolbar"><a href="../index.html#course/comp139e">← COMP 139E</a><h1>Fill-in-the-blank practice</h1><p>${bank.length+1} worksheets, grouped by topic. Get live feedback as you type, ask for a hint, or reveal a solution. Your answers and notepad save separately for each worksheet in this browser.</p><p><a href="cpp-cheat-sheet.html">C++ cheat sheet / rules →</a></p><nav aria-label="Practice topics" class="topic-jumps">${groups.map(group=>`<a href="#${group.id}">${esc(group.title)}</a>`).join('')}</nav>${sections}</main></body></html>`);
console.log(`Built ${bank.length} exercises and practice index.`);
