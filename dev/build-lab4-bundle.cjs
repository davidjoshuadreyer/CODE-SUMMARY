const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const files=['assets/vendor/katex/katex.min.js','phys210/lab4-math.js','phys210/lab4-prepared.js','phys210/lab4.js','phys210/lab4-export.js','assets/vendor/supabase-2.116.0.js','assets/account-progress.js','phys210/lab4-account.js'];
const source=files.map(file=>{let code=fs.readFileSync(path.join(root,file),'utf8');
// Named DOM elements such as #exports must not select a CommonJS/AMD branch.
if(file==='assets/vendor/katex/katex.min.js')code='(function(module,exports,define){\n'+code+'\n}).call(window);';
return '/* '+file+' */\n'+code+'\n;';}).join('\n');
const name='lab4-workspace-'+crypto.createHash('sha256').update(source).digest('hex').slice(0,12)+'.js';
fs.writeFileSync(path.join(root,'phys210',name),source);
const page=path.join(root,'phys210/lab4.html');let html=fs.readFileSync(page,'utf8');
html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace('</head>','<script defer src="'+name+'"></script></head>');
fs.writeFileSync(page,html);console.log(name);
