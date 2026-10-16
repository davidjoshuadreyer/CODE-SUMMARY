const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'phys210/lab4.html'),'utf8');
const bundle=html.match(/src="(lab4-workspace-[^"]+\.js)"/)[1];
const source=fs.readFileSync(path.join(root,'phys210',bundle),'utf8').split('/* phys210/lab4-math.js */')[0];
// Browsers expose <section id="exports"> as window.exports. This must not
// trick the math library into choosing its CommonJS export path.
const section={nodeType:1,id:'exports'};
const ctx={exports:section,console};ctx.window=ctx;ctx.self=ctx;
vm.runInNewContext(source,ctx);
assert.equal(typeof ctx.katex?.renderToString,'function','KaTeX must be attached to window despite the exports section');
const output=ctx.katex.renderToString(String.raw`\kappa_1=\frac{m_1}{\varepsilon_0 A}`,{displayMode:true,throwOnError:true});
assert.match(output,/class="katex"/);assert.match(output,/class="mfrac"/);
assert.equal(section.katex,undefined);
console.log('PASS published math renderer with browser named exports element; formatted fractions render');
