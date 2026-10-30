const assert=require('node:assert/strict'),M=require('../phys210/lab6-math.js');
const d={c1:'1.000',c2:'10.00',r:'1.000'};
for(const [k,v] of Object.entries({d1:1,d2:0.1,h1:2,h2:0.2,s:1.1,p:1/11})){d[k+'A']='4.00';d[k+'B']='0.00';d[k+'C']=String(v);}
const a=M.analyze(d),near=(x,y)=>assert.ok(Math.abs(x-y)<1e-10,`${x} != ${y}`);
near(a.ri,1);near(a.effTheory,.5);near(a.expectedPlateau,2);near(a.derived[0],1);near(a.derived[1],1);near(a.seriesMeasured,10/11);near(a.parallelMeasured,11);near(a.seriesDifference,0);near(a.parallelDifference,0);assert.equal(a.complete,21);assert.deepEqual(a.issues,[]);
assert.equal(M.digit('1.000'),.001);assert.equal(M.digit('1.20e-3'),.00001);assert.equal(M.num(''),null);assert.equal(M.num('Infinity'),null);assert.equal(M.num('0x10'),null);assert.equal(M.pos('0'),null);assert.equal(M.num('-0.01'),-.01);
assert.equal(M.analyze({}).ri,null);assert.equal(M.analyze({c1:1,d1C:1}).ri,null);assert.equal(M.analyze({...d,h1C:'0.5'}).derived[0],null);assert.ok(M.analyze({...d,h1C:'0.5'}).issues.length);assert.ok(M.analyze({...d,c1:'-1'}).issues.length);assert.equal(M.clean({untrusted:'x'}).untrusted,undefined);
console.log('PASS six-run RC physics, units, partial inputs, invalid inputs, probe loading and uncertainty precision');
