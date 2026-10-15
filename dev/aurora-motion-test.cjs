const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const events={},styles={},queue=new Map();let id=0,time=0,observer;
const root={dataset:{studyStyle:'original'},scrollHeight:2000,style:{setProperty:(k,v)=>styles[k]=v}};
const media={matches:false,addEventListener:(_,fn)=>events.reduced=fn};
const doc={documentElement:root,hidden:false,addEventListener:(n,fn)=>events[n]=fn};
const env={document:doc,matchMedia:()=>media,innerWidth:1000,innerHeight:800,scrollY:0,addEventListener:(n,fn)=>events[n]=fn,requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:i=>queue.delete(i),MutationObserver:class{constructor(fn){observer=fn;}observe(){}}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/design/aurora-motion.js'),'utf8'),env);
function settle(){for(let n=0;queue.size&&n<500;n++){const batch=[...queue.values()];queue.clear();time+=16.67;batch.forEach(fn=>fn(time));}assert.equal(queue.size,0,'animation must stop at rest');}
settle();assert.equal(styles['--aurora-y'],'-7.00px');
events.pointermove({pointerType:'mouse',clientX:1000,clientY:800});settle();assert.equal(styles['--aurora-x'],'14.00px');assert.equal(styles['--aurora-y'],'1.00px');
env.scrollY=1200;events.scroll();settle();assert.equal(styles['--aurora-y'],'15.00px');
media.matches=true;events.reduced();events.pointermove({pointerType:'mouse',clientX:0,clientY:0});assert.equal(queue.size,0);assert.equal(styles['--aurora-x'],'0.00px');
media.matches=false;events.reduced();settle();doc.hidden=true;events.visibilitychange();assert.equal(queue.size,0);
doc.hidden=false;root.dataset.studyStyle='report';observer();assert.equal(styles['--aurora-y'],'0.00px');assert.equal(queue.size,0);
console.log('PASS: spring settles, bounded pointer response, scroll response, reduced motion, hidden-tab pause, report-style reset.');
