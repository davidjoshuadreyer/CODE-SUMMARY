const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const events={},queue=new Map();let id=0,time=0,io,draws=0;
const context={setTransform(){},clearRect(){draws++},createLinearGradient(){return {addColorStop(){}}},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},createPattern(){return {}},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(){}};
const host={isConnected:true,append(c){this.canvas=c},classList:{add(){}}};
const root={dataset:{studyStyle:'original'}},media={matches:false,addEventListener:(n,f)=>events.reduced=f};
const document={readyState:'complete',documentElement:root,body:{},hidden:false,querySelectorAll:()=>[host],addEventListener:(n,f)=>events[n]=f,createElement:()=>({getContext:()=>context,setAttribute(){},getBoundingClientRect:()=>({width:400,height:240,left:0,top:0})})};
const env={document,scrollY:0,devicePixelRatio:1,matchMedia:()=>media,addEventListener:(n,f)=>events[n]=f,requestAnimationFrame:f=>{queue.set(++id,f);return id},cancelAnimationFrame:i=>queue.delete(i),IntersectionObserver:class{constructor(f){io=f}observe(){}unobserve(){}},MutationObserver:class{observe(){}}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/design/aurora-motion.js'),'utf8'),env);
function step(){const batch=[...queue.values()];queue.clear();time+=40;batch.forEach(f=>f(time))}
io([{target:host,isIntersecting:true}]);step();assert(draws>0);assert.equal(queue.size,1,'visible scene animates');
events.pointermove({clientX:200,clientY:100});events.pointerdown({clientX:200,clientY:100});step();assert(draws>1);
io([{target:host,isIntersecting:false}]);step();assert.equal(queue.size,0,'offscreen scenes stop');
media.matches=true;events.reduced();io([{target:host,isIntersecting:true}]);step();assert.equal(queue.size,0,'reduced motion renders one still frame');
media.matches=false;events.reduced();document.hidden=true;events.visibilitychange();assert.equal(queue.size,0,'hidden tabs stop');
console.log('PASS: canvas draws, pointer ripple renders, offscreen pause, reduced-motion still frame, hidden-tab pause.');
