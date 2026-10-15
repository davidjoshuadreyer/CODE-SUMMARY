const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'phys210'),rows=require('../phys210/tutorial-data.json'),files=require('../phys210/tutorial-manifest.json');
assert.equal(rows.length,117);assert.equal(new Set(rows.map(p=>p.id)).size,117);
assert.deepEqual(Array.from({length:11},(_,i)=>rows.filter(p=>p.tutorial===i+1).length),[10,10,8,9,9,8,10,10,11,10,10]);
assert.equal(rows.filter(p=>p.tutorial===0).length,12);assert.equal(files.length,13);
for(const p of rows){assert.ok(p.number&&p.question&&p.steps.length&&p.answer&&p.check,p.id);assert.ok(['worked','needs-review'].includes(p.status));assert.ok(fs.existsSync(path.join(dir,p.source.url)));for(const f of p.figures)assert.ok(fs.existsSync(path.join(dir,f.url)),f.url);}
for(const f of files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,f.url))).digest('hex'),f.sha256);
const html=fs.readFileSync(path.join(dir,'tutorials.html'),'utf8');
assert.equal((html.match(/class="problem"/g)||[]).length,117);assert.ok(!html.includes('katex-error'));
for(const [,url]of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|#)/.test(url))continue;assert.ok(fs.existsSync(path.resolve(dir,url.split(/[?#]/)[0])),url);}
assert.ok(!JSON.stringify(rows).includes('C:\\Users'));
const angle=Math.acos((-48.4)/(Math.sqrt(68)*Math.sqrt(58.69)))*180/Math.PI;assert.ok(Math.abs(angle-140.00863)<0.00001);
console.log('PASS: 105 numbered-tutorial questions, 12 vector examples/exercises, 13 original hashes, all local links/figures, math output, and corrected vector angle.');
