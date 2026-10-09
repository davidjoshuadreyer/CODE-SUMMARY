const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),M=require('../phys210/lab7-math.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1e-12,Math.abs(b)),`${a} ≠ ${b}`);
const rho=1.1e-6,d={student:'TEST DATA ONLY',date:'2026-10-09',partners:'Test fixture',section:'QA',meter:'Synthetic meter',temperature:'20',uncertaintyNotes:'Synthetic conservative uncertainties for software verification.',diameter:'0.321',dDiameter:'0.002',lengthB:'10',dLengthB:'0.1',bCount:'6',accepted:String(rho),acceptedSource:'Synthetic reference for testing; not a measured experiment.',observations:'Synthetic data, not actual measurements.',discussion:'Test data recover the specified resistivity with a nonzero contact intercept.',conclusion:'Synthetic verification only.',slopeNotes:'Positive slopes intersecting every uncertainty rectangle.'};
for(let i=0;i<19;i++){const L=(i+1)/10;Object.assign(d,{['a'+i+'L']:String(L),['a'+i+'dL']:'0.001',['a'+i+'R']:String(rho/M.area(.321)*L+.2),['a'+i+'dR']:'0.08'});}
[20,22,24,26,28,30].forEach((g,i)=>{const diameter=.127*92**((36-g)/39);Object.assign(d,{['b'+i+'g']:String(g),['b'+i+'d']:String(diameter),['b'+i+'dd']:'0.002',['b'+i+'R']:String(rho*10/M.area(diameter)+.3),['b'+i+'dR']:'0.08'});});
let a=M.analyze(d);near(a.rhoA,rho);near(a.rhoB,rho);near(a.af.b,.2);near(a.bf.b,.3);assert.ok(a.aBounds&&a.bBounds);
for(const k of ['a','b']){const b=a[k+'Bounds'];d[k+'Min']=String(b.min);d[k+'Max']=String(b.max);const rows=k==='a'?a.A:a.B;assert.notEqual(M.intercept(rows,b.min),null);assert.notEqual(M.intercept(rows,b.max),null);assert.equal(M.intercept(rows,b.max*1.1),null);}
a=M.analyze(d);assert.equal(a.complete,true);assert.equal(a.consistent,true);near(a.drhoA,rho*(a.au.dm/a.af.m+2*.002/.321));near(a.drhoB,rho*(a.bu.dm/a.bf.m+.01));
assert.equal(M.analyze({}).rhoA,null);assert.equal(M.number(''),null);assert.equal(M.number('not a reading'),null);assert.equal(M.nonnegative('0'),0);assert.equal(M.fit([{x:1,y:2},{x:1,y:3},{x:1,y:4}]),null);
assert.equal(M.analyze({...d,aMax:'-1'}).drhoA,null);assert.equal(M.analyze({...d,b0R:''}).complete,false);assert.equal(M.analyze({...d,diameter:'0'}).rhoA,null);assert.equal(M.analyze({...d,dDiameter:'1'}).complete,false);
console.log('PASS unit conversion, free-intercept fits, conservative uncertainty, feasible line limits, missing/invalid/degenerate inputs');
async function main(){
 const ExcelJS=require('exceljs'),JSZip=require('jszip');
 const c={Lab7Math:M,ExcelJS,JSZip,console,Map,Blob,document:{getElementById:()=>({})}};c.window=c;vm.runInNewContext(fs.readFileSync(root+'/phys210/lab7-export.js','utf8'),c);
 const bytes=await c.Lab7Export.workbook(d),zip=await JSZip.loadAsync(bytes),book=new ExcelJS.Workbook();await book.xlsx.load(bytes);
 const setup=book.getWorksheet('Setup'),results=book.getWorksheet('Results');assert.equal(setup.getCell('B10').value,.321);assert.equal(setup.getCell('B12').value,10);near(results.getCell('B18').result,rho);near(results.getCell('B24').result,rho);near(results.getCell('B19').result,a.drhoA);assert.equal(results.getCell('B29').result,'Consistent');assert.match(results.getCell('B24').formula,/'Setup'!B12/);
 assert.equal(book.getWorksheet('Part A').getCell('B4').value,.1);assert.equal(book.getWorksheet('Part B').getCell('B4').value,20);assert.equal(book.getWorksheet('Part A').getCell('K22').result,Number(d.a18R));
 for(const k of [1,2]){const chart=await zip.file('xl/charts/chart'+k+'.xml').async('string');assert.match(chart,/<c:scatterChart>/);assert.match(chart,/<c:errDir val="x"/);assert.match(chart,/<c:errDir val="y"/);assert.match(chart,/<c:trendlineType val="linear"/);}
 const rels=await zip.file('xl/worksheets/_rels/sheet5.xml.rels').async('string');assert.match(rels,/drawing1.xml/);const blank=new ExcelJS.Workbook();await blank.xlsx.load(await c.Lab7Export.workbook({bCount:'6'}));assert.ok(!blank.getWorksheet('Results').getCell('B18').result);
 const out=process.env.LAB7_TEST_OUTPUT||'/tmp/tesselate-lab7-test';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'synthetic-test.xlsx'),bytes);fs.writeFileSync(path.join(out,'synthetic-readings.json'),JSON.stringify({format:'tesselate-phys210-lab7',version:1,readings:d,step:3},null,2));
 console.log('PASS Excel inputs, formula references and cached results, blank-data behavior, native scatter charts/error bars/trendlines; fixture in '+out);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
