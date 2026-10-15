/* Run after regenerating standalone legacy pages. Shared course builders
   already load engr290/course.css and inherit the Fieldnotes design. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const folders = ['phys210','ecet250e','engr290','math250b','math252','comp139e','chem','matrix','c','Statistics'];
const files = folders.flatMap(folder => fs.readdirSync(path.join(root,folder)).filter(name=>name.endsWith('.html')).map(name=>path.join(folder,name))).concat(['privacy.html']);
let changed = 0;
for (const file of files) {
  const absolute = path.join(root,file);
  let html = fs.readFileSync(absolute,'utf8');
  if (/engr290\/course\.css/.test(html) || (file.startsWith('engr290/') && /href="course\.css/.test(html)) || /assets\/design\/legacy\.css/.test(html)) continue;
  const prefix = file.includes('/') ? '../' : '';
  if (!/<\/head>/i.test(html)) throw new Error(`Missing head in ${file}`);
  html = html.replace(/<\/head>/i, `<link rel="stylesheet" href="${prefix}assets/design/legacy.css?v=studio-fieldnotes-1"></head>`);
  html = html.replace(/(<\/head>)[ \t]+(?=\r?\n)/g, '$1');
  fs.writeFileSync(absolute,html);
  changed++;
}
console.log(`Applied shared design to ${changed} standalone pages.`);
