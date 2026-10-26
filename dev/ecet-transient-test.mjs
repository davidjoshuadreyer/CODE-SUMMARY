import assert from 'node:assert/strict';
import {response,cursorTau,arrangement} from '../ecet250e/virtual-lab/transient.mjs';
let checks=0;function close(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<=tol,`${a} ≠ ${b}`);checks++}
const rc=response({rg:0});close(rc.tau,.001);close(rc.vmax,3.112296656009273);close(rc.vmin,1.887703343990727);close(rc.vmax+rc.vmin,5);close(cursorTau(rc.vmax,rc.vmin,rc.h),rc.tau);
for(const kind of ['RC','RL'])for(const f of [100,470,1000,4700])for(const rg of [0,50]){
 const m=response({kind,r:kind==='RC'?10000:470,f,rg,coil:rg?70:0});
 close(cursorTau(m.vmax,m.vmin,m.h),m.tau);
 for(const t of [0,m.h*.3,m.h*.999999,m.h,m.T*.8]){const v=m.at(t);close(v.idealSource,v.i*rg+v.vR+v.vStorage);close(m.at(t+m.T).stored,v.stored,1e-8)}
 close(m.at(m.h-1e-12).stored,m.at(m.h+1e-12).stored,1e-7);
 close(m.at(m.T-1e-12).stored,m.at(1e-12).stored,1e-7);
}
const rl=response({kind:'RL',r:470,coil:70,rg:50,f:4700});close(rl.tau,.1/590);close(rl.idealTau,.1/470);
const slow=response({kind:'RL',r:470,f:470,coil:70,rg:50});assert.ok(slow.at(slow.h-1e-10).vStorage>0.5);checks++;
for(const kind of ['RC','RL'])for(const target of ['storage','resistor']){const s=arrangement(kind,target);assert.equal(s.edges.find(e=>e.to==='A40').type,target==='storage'?(kind==='RC'?'capacitor':'inductor'):'resistor');assert.equal(s.edges.find(e=>e.id==='CH2').to,'D25');assert.equal(s.edges.filter(e=>['G-','SG1','SG2'].includes(e.from)).length,3);checks+=3;const isolated=arrangement(kind,target,470,70,'r');assert.equal(isolated.edges.length,1);assert.ok(isolated.edges[0].from.startsWith('lift:'));assert.equal(isolated.removed.length,2);checks+=3;}
assert.equal(cursorTau(1,2,.001),null);assert.equal(cursorTau(2,0,.001),null);assert.equal(cursorTau(2,1,0),null);checks+=3;
assert.throws(()=>response({f:0}));checks++;console.log(`${checks} transient physics and wiring checks passed.`);
