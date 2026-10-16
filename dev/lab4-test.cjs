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
