import {mountSteps} from './bench-steps.mjs';
import {mountWireGuide,endpoint} from './wire-guide.mjs';
import {createBench} from './bench.js';
import {response,cursorTau,arrangement,paintScope} from './transient.mjs';
const $=id=>document.getElementById(id),recordKey='ecet-lab6-records-v1';
let kind='RC',on=false,precheck='',rows=[];
try{const saved=JSON.parse(localStorage.getItem(recordKey));if(Array.isArray(saved))rows=saved}catch{}
const bench=createBench($('scene'),hit=>{if(hit?.kind==='terminal')$('tip').textContent=endpoint(hit.id);else if(hit)$('tip').textContent='Use the Lab 6 controls to change the circuit, generator or resistance precheck.'},h=>{$('hover').textContent=(h?endpoint(h.id):'')||'Drag to look around · Scroll to zoom'});
const wireGuide=mountWireGuide(bench);
const num=id=>Number($(id).value),us=t=>(t*1e6).toFixed(3)+' µs';
function model(){return response({kind,r:num('r'),c:num('storage')*1e-9,l:num('storage')*.001,coil:$('model').value==='real'?num('coil'):0,rg:$('model').value==='real'?50:0,f:num('frequency')})}
function cursors(){return {min:num('y1'),max:num('y2'),x1:num('x1')*.001,x2:num('x2')*.001}}
function validTarget(){return (kind==='RC'&&$('observe').value==='storage')||(kind==='RL'&&$('observe').value==='resistor')}
function save(){try{localStorage.setItem(recordKey,JSON.stringify(rows))}catch{$('tip').textContent='Browser storage is unavailable. Export CSV to keep these results.'}}
function redraw(){
 let m;try{m=model()}catch{$('tip').textContent='Enter positive component values and frequency.';return}
 const observe=$('observe').value,c=cursors(),setup=arrangement(kind,observe,m.r,m.coil,precheck);
 const storage=setup.edges.find(e=>e.type==='capacitor'||e.type==='inductor');if(storage)storage.label=num('storage')+(kind==='RC'?' nF':' mH');
 bench.update({pot:50,jack:'VΩ',voltage:0},setup,{display:precheck?setup.value.toFixed(2):'—',unit:precheck?'Ω':'SCOPE',supplyCurrent:0,transient:{model:m,observe,on,cursors:c}});
 wireGuide.update({jack:'VΩ'},setup);
 paintScope($('scope').getContext('2d'),1000,410,m,observe,on,c);
 $('output').textContent=on?'● Generator output ON · switch off':'Enable generator output';$('output').disabled=!!precheck;$('checkCoil').hidden=kind!=='RL';$('coilLabel').hidden=kind!=='RL';$('storageName').textContent=kind==='RC'?'C (nF)':'L (mH)';
 $('connectionTitle').textContent=precheck?'Ω precheck · circuit disconnected':`${kind} · CH2 across ${observe==='storage'?(kind==='RC'?'capacitor':'inductor + winding'):'resistor'}`;
 $('connectionDetail').textContent=precheck?'Generator and scope leads are detached. The DMM uses HI VΩ / LO on an isolated resistance. Restore scope wiring before enabling the generator.':`Generator high → ${observe==='storage'?'R → '+(kind==='RC'?'C':'L'):(kind==='RC'?'C':'L')+' → R'} → common ground. CH1 at A10; CH2 at A25. Both scope ground clips and generator low share row 40.`;
 $('wiring').textContent=precheck?'Generator disconnected · isolated Ω measurement':'CH1 input · CH2 grounded component · all grounds at row 40';
 const nominal=kind==='RC'?1e-3:.1/470;
 $('predictions').textContent=`Current setup: ${kind}\nIdeal τ: ${us(m.idealTau)}\nWith selected losses: ${us(m.tau)}\nHalf-period: ${us(m.h)} = ${(m.h/m.tau).toFixed(3)} τ\n${kind==='RC'?'vC':'vR'} max: ${m.vmax.toFixed(5)} V\n${kind==='RC'?'vC':'vR'} min: ${m.vmin.toFixed(5)} V\nHandout nominal f (T≈τ): ${(1/nominal).toFixed(0)} Hz\nHandout nominal f (T≈10τ): ${(1/(10*nominal)).toFixed(0)} Hz`;
 $('scopeStatus').textContent=on?`Periodic steady state · ${m.h/m.tau>=5?'Each half-period is at least 5τ.':'Half-period is shorter than 5τ: the response does not fully settle.'}`:'Output off. Scope trace is paused until you enable the generator.';
 const delta=c.x2-c.x1,tau=cursorTau(c.max,c.min,delta);const invalid=!Number.isFinite(delta)||!Number.isFinite(tau)||tau===null;
 $('cursorResult').textContent=!validTarget()?`For τ, switch CH2 to ${kind==='RC'?'capacitor':'resistor'} voltage.`:invalid?'Set Vmax > Vmin > 0 and X2 > X1.':`ΔX = ${us(delta)} · Cursor τ = ${us(tau)} · Difference from model: ${(100*Math.abs(tau-m.tau)/m.tau).toFixed(2)}%`;
 $('record').disabled=!on||!!precheck||!validTarget()||invalid;$('snap').disabled=!on||!validTarget();
 $('reading').textContent=precheck?`DMM: ${setup.value.toFixed(2)} Ω (simulated)`:validTarget()?'Place Y cursors at the trace extremes and X cursors one half-period apart. Read the scope, not the DMM.':'Observe the waveform, then switch to the time-constant measurement target.';
 $('records').textContent=rows.slice(-10).reverse().map(r=>`${r.kind} · ${r.frequencyHz} Hz · τ ${us(r.cursorTauS)} · ${r.model}`).join('\n');
}
function resetCursors(){const m=model();$('x1').value='0';$('x2').value=(m.h*1000).toFixed(6);$('y1').value='1';$('y2').value='4'}
function checklist(){const steps=['Measure R with the disconnected DMM; for RL also measure winding resistance.','Restore the circuit. Use 0–5 V square wave, High Z, 50% duty; scope DC coupling and 10:1 probes.','Record both component waveforms. Swap component order to keep the measured component at common ground.',`Use ${kind==='RC'?'vC':'vR'} cursors to measure Vmax, Vmin and T/2; calculate τ.`,`Compare with ${kind==='RC'?'RC and (R+50 Ω)C':'L/R and L/(R+Rcoil+50 Ω)'}.`,'Reduce frequency by 10 and compare the settling. Record predictions and your actual physical measurements separately.'];$('steps').replaceChildren();for(const s of steps){const label=document.createElement('label');label.className='step';const check=document.createElement('input');check.type='checkbox';label.append(check,document.createTextNode(s));$('steps').append(label)}}
$('preset').onchange=()=>{const [k,observe,f]=$('preset').value.split('-');kind=k;on=false;precheck='';$('observe').value=observe;$('frequency').value=f;$('r').value=kind==='RC'?10000:470;$('storage').value=100;$('coil').value=70;resetCursors();checklist();redraw();$('tip').textContent='Preset loaded with generator off. Inspect the wiring, then enable output.'};
$('observe').onchange=()=>{on=false;precheck='';redraw();$('tip').textContent='Output off. Component order swapped; CH2 and all ground clips remain at their correct nodes.'};
for(const id of ['frequency','r','storage','coil','model'])$(id).onchange=()=>{if($(id).type==='number'&&!$(id).checkValidity()){$(id).reportValidity();return}on=false;precheck='';try{resetCursors()}catch{}redraw();$('tip').textContent='Setting changed with output off. Enable the generator to inspect the new waveform.'};
$('output').onclick=()=>{on=!on;redraw()};$('checkR').onclick=()=>{on=false;precheck='r';redraw()};$('checkCoil').onclick=()=>{on=false;precheck='coil';redraw()};$('restore').onclick=()=>{on=false;precheck='';redraw()};
for(const id of ['y1','y2','x1','x2'])$(id).oninput=redraw;
$('snap').onclick=()=>{const m=model();$('y1').value=m.vmin.toFixed(6);$('y2').value=m.vmax.toFixed(6);$('x1').value=0;$('x2').value=(m.h*1000).toFixed(6);redraw();$('tip').textContent='Cursors placed on theoretical extrema for practice. Physical-lab values must come from your oscilloscope.'};
$('record').onclick=()=>{const m=model(),c=cursors(),tau=cursorTau(c.max,c.min,c.x2-c.x1);if(!on||precheck||!validTarget()||!Number.isFinite(tau))return;rows.push({time:new Date().toISOString(),kind,model:$('model').value,frequencyHz:m.f,rOhm:m.r,cFarad:kind==='RC'?m.c:'',lHenry:kind==='RL'?m.l:'',rgenOhm:m.rg,rcoilOhm:kind==='RL'?m.coil:'',vmaxV:c.max,vminV:c.min,halfPeriodS:c.x2-c.x1,predictedTauS:m.tau,idealTauS:m.idealTau,cursorTauS:tau,differencePct:100*Math.abs(tau-m.tau)/m.tau});save();redraw()};
$('export').onclick=()=>{const keys=['time','kind','model','frequencyHz','rOhm','cFarad','lHenry','rgenOhm','rcoilOhm','vmaxV','vminV','halfPeriodS','predictedTauS','idealTauS','cursorTauS','differencePct'];const csv=['Simulated Lab 6 periodic steady-state results',keys.join(','),...rows.map(r=>keys.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='ecet-lab6-simulated.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('clearRecords').onclick=()=>{rows=[];save();redraw()};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>bench.view(b.dataset.view));checklist();resetCursors();redraw();

mountSteps((config,step)=>{kind=config.kind;on=false;precheck=config.precheck;$('observe').value=config.observe;$('frequency').value=config.frequency;$('r').value=kind==='RC'?10000:470;$('storage').value=100;$('coil').value=70;$('model').value=config.model;$('preset').value=`${kind}-${config.observe}-${config.frequency}`;resetCursors();checklist();redraw();$('tip').textContent=config.note;},'transient');
