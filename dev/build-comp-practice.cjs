const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const folder = path.join(root, 'comp139e');
const bank = JSON.parse(fs.readFileSync(path.join(folder, 'practice-exercises.json'), 'utf8'));
const esc = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const template = fs.readFileSync(path.join(folder, 'fill-in-the-blanks.html'), 'utf8');
fs.writeFileSync(path.join(folder,'practice-bank.js'), 'window.COMP_PRACTICE = '+JSON.stringify(bank)+';\n');
for (const [index, item] of bank.entries()) {
  let html = template.replace('<body>', `<body data-exercise="${item.slug}">`)
    .replace('<title>Fill in the blanks · COMP 139E</title>', `<title>${esc(item.title)} · COMP 139E</title>`)
    .replace('<h1>Fill in the blanks</h1>', `<h1>${esc(item.title)}</h1><p>${esc(item.topic)}</p>`)
    .replace('<script defer src="worksheet-checker.js?v=1"></script>', '<script defer src="practice-bank.js?v=1"></script><script defer src="practice-checker.js?v=1"></script>');
  const lines = item.source.split('\n').map(line=>'<div class="line">'+(esc(line).replace(/@(\d+)/g,(_,n)=>`<input id="blank-${n}" aria-label="Blank ${n}" autocomplete="off" autocapitalize="off" spellcheck="false">`) || '&nbsp;')+'</div>').join('');
  html = html.replace(/<section class="paper"[\s\S]*?<\/section><\/main>/, `<section class="paper" aria-label="Practice code">${lines}</section></main>`);
  const previous = index ? `practice-${bank[index-1].slug}.html` : 'fill-in-the-blanks.html';
  const next = index+1<bank.length ? `practice-${bank[index+1].slug}.html` : 'midterm-practice.html';
  html = html.replace('</header>', `<p><a href="${previous}">← Previous</a> · <a href="${next}">Next exercise →</a></p></header>`);
  fs.writeFileSync(path.join(folder,`practice-${item.slug}.html`), html);
}
const cards = bank.map(item=>`<a class="practice-card" href="practice-${item.slug}.html"><h2>${esc(item.title)}</h2><p>${esc(item.topic)}</p><span>${item.answers.length} blanks →</span></a>`).join('');
const css = template.match(/<style>([\s\S]*?)<\/style>/)[1];
fs.writeFileSync(path.join(folder,'midterm-practice.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Midterm fill-in-the-blank practice · COMP 139E</title><style>${css}.practice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}.practice-card{display:block;background:white;border:1px solid #ccd2cb;border-radius:8px;padding:22px;text-decoration:none;color:#213e34}.practice-card h2{font-size:20px}.practice-card p{line-height:1.6;color:#444}.practice-card:hover{border-color:#487d72}</style></head><body><main class="toolbar"><a href="../index.html#course/comp139e">← COMP 139E</a><h1>Midterm code practice</h1><p>Seven new exercises · 61 blanks. Start with references, work through pointers and classes, then practise files and exceptions. Each exercise has live red/green feedback, explanatory hints, expanding blanks, and a movable blank notepad. Answers and notes save separately for each exercise in this browser.</p><p>Original practice based on your covered COMP lectures; these are study exercises, not actual or predicted exam questions. The checker accepts common equivalent forms rather than every possible C++ solution.</p><p><a href="fill-in-the-blanks.html">Your original Rectangle worksheet →</a> · <a href="slides.html">Review the covered lectures →</a> · <a href="cpp-cheat-sheet.html">C++ cheat sheet / rules →</a></p><div class="practice-grid">${cards}</div></main></body></html>`);
console.log(`Built ${bank.length} exercises and practice index.`);
