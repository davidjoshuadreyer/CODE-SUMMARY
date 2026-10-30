const assert=require('node:assert/strict'),M=require('../phys210/lab4-math.js');
assert.equal(M.analyze({}).complete,false);assert.equal(M.analyze({}).k1,null);assert.equal(M.num(''),null);assert.equal(M.unc(''),null);assert.equal(M.rounded(1.206494,.110207),'1.2 ± 0.1');
assert.equal(M.rounded(123,18),'120 ± 20');
const d={reviewStatus:'reviewed',sheets:'100',thickness:'10',dThickness:'0.010',length:'20',width:'20',dLength:'.1',dWidth:'.1',fixedSheets:'100',reference:'3',dReference:'.2'};
for(const k of ['student','date','partners','meter','textbook','uncertaintyNotes','observations','discussion','acceptedSource'])d[k]='TEST ONLY';
const e=8.85e-12;for(let i=0;i<6;i++){const n=(i+1)*20,l=20-2*i;Object.assign(d,{['b'+i+'n']:String(n),['b'+i+'c']:String(3*e*.04/(n*.0001)*1e9),['b'+i+'u']:'.01',['c'+i+'l']:String(l),['c'+i+'w']:String(l),['c'+i+'ul']:'.1',['c'+i+'uw']:'.1',['c'+i+'c']:String(3*e*l*l*1e-4/.01*1e9),['c'+i+'u']:'.01'});}
const a=M.analyze(d);assert.equal(a.complete,true);assert.ok(Math.abs(a.k1-3)<1e-12);assert.ok(Math.abs(a.k2-3)<1e-12);assert.equal(a.consistent,true);assert.ok(a.u1>0&&a.u2>0);assert.equal(a.referenceConsistent,true);
assert.equal(M.analyze({...d,b0u:''}).complete,false);assert.equal(M.analyze({...d,b0u:''}).u1,null);assert.equal(M.analyze({...d,sheets:'2.5'}).t,null);assert.equal(M.analyze({...d,fixedSheets:'2.5'}).gap,null);
const flat=structuredClone(d);for(let i=0;i<6;i++)flat['b'+i+'n']='20';assert.equal(M.analyze(flat).bf,null);
assert.equal(M.fit([{x:1,y:2,dx:0,dy:0},{x:2,y:4,dx:0,dy:0},{x:3,y:6,dx:0,dy:0}]).dm,0);
console.log('PASS blank/partial inputs, units, both dielectric calculations, uncertainty, consistency, rounding and invalid counts');
module.exports=d;
const auto={rulerUncertainty:'0.1',meterIncrement:'0.002',length:'20',width:'10',b0c:'0.12',b0low:'0.11',b0high:'0.14',c0c:'0.2',c0l:'12',c0w:'10'};
let resolved=M.withUncertainties(auto);
assert.equal(resolved.dThickness,'0.010');assert.equal(resolved.dLength,'0.1');assert.equal(resolved.c0ul,'0.1');
assert.ok(Math.abs(Number(resolved.b0u)-0.02)<1e-12);assert.equal(resolved.c0u,'0.002');
assert.ok(Math.abs(M.analyze(auto).ua-0.0003)<1e-12);
assert.equal(M.withUncertainties({...auto,rulerUncertainty:'0.05'}).c0ul,'0.05');
assert.equal(M.withUncertainties({...auto,b0u:'0.007'}).b0u,'0.007');
assert.equal(M.withUncertainties({...auto,b0high:'0.1'}).b0u,undefined);
assert.equal(M.withUncertainties({...auto,meterIncrement:''}).c0u,undefined);
assert.equal(M.withUncertainties({...auto,c0c:''}).c0u,undefined);
assert.equal(auto.b0u,undefined); // Calculated values never replace stored observations.
console.log('PASS automatic ruler and capacitance uncertainty, recalculation, overrides and incomplete ranges');
const spec={meterAccuracy:'manufacturer',meterPercent:'1',meterDigits:'3',meterIncrement:'0.001',b0c:'0.5'};
assert.ok(Math.abs(Number(M.withUncertainties(spec).b0u)-0.008)<1e-12);
assert.equal(M.withUncertainties({...spec,meterIncrement:''}).b0u,undefined);
assert.ok(Math.abs(Number(M.withUncertainties({...spec,b0low:'.48',b0high:'.51'}).b0u)-.02)<1e-12);
assert.equal(M.withUncertainties({...spec,b0u:'.04'}).b0u,'.04');
console.log('PASS manufacturer percent-plus-digits accuracy and missing resolution guard');
const pf=structuredClone(d);pf.capacitanceUnit='pF';
for(let i=0;i<6;i++)for(const part of ['b','c'])for(const key of ['c','u'])pf[part+i+key]=String(Number(d[part+i+key])*1000);
const pfResult=M.analyze(pf);
assert.ok(Math.abs(pfResult.k1-a.k1)<1e-12);assert.ok(Math.abs(pfResult.k2-a.k2)<1e-12);
assert.ok(Math.abs(pfResult.u1-a.u1)<1e-12);assert.ok(Math.abs(pfResult.B[0].y-a.B[0].y)<1e-20);
assert.equal(M.withUncertainties({capacitanceUnit:'pF',meterAccuracy:'manufacturer',meterPercent:'1',meterDigits:'3',meterIncrement:'1',b0c:'500'}).b0u,'8');
console.log('PASS pF entries preserve SI calculations and use 1 pF meter resolution');

// The posted capacitance rubric uses half the difference for the mean,
// while agreement between methods still uses the two propagated uncertainties.
const unequal=structuredClone(d);
for(let i=0;i<6;i++)unequal['c'+i+'c']=String(Number(unequal['c'+i+'c'])*2);
const different=M.analyze(unequal);
assert.ok(Math.abs(different.mean-4.5)<1e-12);
assert.ok(Math.abs(different.um-1.5)<1e-12);
assert.equal(different.sum,different.u1+different.u2);
assert.equal(different.consistent,different.difference<=different.sum);
assert.ok(Math.abs(a.um)<1e-12);
assert.equal(M.analyze({...unequal,b0u:''}).sum,null);
assert.equal(M.analyze({...unequal,b0u:''}).consistent,null);
console.log('PASS rubric half-difference mean uncertainty and separate propagated consistency check');
