/* Re-run after generating academic HTML. Adds an optional theme; never rewrites original CSS. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const folders=['ecet250e','phys210','engr290','math252','math250b','chem','matrix','c','Statistics','comp139e'];
const files=['index.html','study.html','solutions.html',...folders.flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.html')).map(n=>`${dir}/${n}`))];
let count=0;
for(const relative of files){if(/^ecet250e\/formula-sheet(?:-latest)?\.html$/.test(relative))continue;const file=path.join(root,relative);let html=fs.readFileSync(file,'utf8');if(html.includes('assets/report-theme.js'))continue;const prefix=relative.includes('/')?'../':'';html=html.replace(/<\/head>/i,`<link rel="stylesheet" href="${prefix}assets/report-theme.css?v=1"><script src="${prefix}assets/report-theme.js?v=1"></script></head>`);fs.writeFileSync(file,html);count++;}
console.log(`Optional report theme installed on ${count} academic pages.`);
