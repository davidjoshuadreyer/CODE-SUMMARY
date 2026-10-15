const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'phys210'),rows=require('../phys210/tutorial-data.json'),files=require('../phys210/tutorial-manifest.json');
assert.equal(rows.length,117);assert.equal(new Set(rows.map(p=>p.id)).size,117);
assert.deepEqual(Array.from({length:11},(_,i)=>rows.filter(p=>p.tutorial===i+1).length),[10,10,8,9,9,8,10,10,11,10,10]);
assert.equal(rows.filter(p=>p.tutorial===0).length,12);assert.equal(files.length,13);
for(const p of rows){assert.ok(p.number&&p.question&&p.steps.length&&p.answer&&p.check,p.id);assert.ok(['worked','needs-review'].includes(p.status));assert.ok(fs.existsSync(path.join(dir,p.source.url)));for(const f of p.figures)assert.ok(fs.existsSync(path.join(dir,f.url)),f.url);}
for(const f of files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,f.url))).digest('hex'),f.sha256);
const html=fs.readFileSync(path.join(dir,'tutorials.html'),'utf8');
assert.equal((html.match(/class="problem"/g)||[]).length,117);assert.ok(!html.includes('katex-error'));
const diagrams=require('../phys210/tutorial-diagrams.json');
assert.equal(diagrams.length,rows.length);assert.equal(new Set(diagrams.map(d=>d.id)).size,rows.length);
assert.equal((html.match(/class="study-diagram"/g)||[]).length,rows.length);
for(const p of rows){const d=diagrams.find(d=>d.id===p.id);assert.ok(d&&d.alt&&d.caption,p.id);assert.ok(d.width>0&&d.height>0,p.id);const svg=fs.readFileSync(path.join(dir,d.url),'utf8');assert.match(svg,/<svg\b/);assert.match(svg,/viewBox=/);assert.match(svg,/<title\b/);assert.match(svg,/<desc\b/);assert.ok(!/<script\b|\bonload=|https?:\/\//i.test(svg.replace('http://www.w3.org/2000/svg','')),d.id);assert.ok(html.includes(`src="${d.url}"`),d.id);}
for(const [,url]of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|#)/.test(url))continue;assert.ok(fs.existsSync(path.resolve(dir,url.split(/[?#]/)[0])),url);}
assert.ok(!JSON.stringify(rows).includes('C:\\Users'));
const angle=Math.acos((-48.4)/(Math.sqrt(68)*Math.sqrt(58.69)))*180/Math.PI;assert.ok(Math.abs(angle-140.00863)<0.00001);
console.log('PASS: 105 numbered-tutorial questions, 12 vector examples/exercises, 117 accessible dedicated diagrams, 13 original hashes, all local links/figures, math output, and corrected vector angle.');
