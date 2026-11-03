// The illustration uses one wind field across the valley. Nearby stems move
// farther than distant crowns, and each stem stays attached to its root.
const W = 720, H = 300;
const sin = Math.sin;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;

function random(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
}
const rand = random(1743);
const grass = Array.from({length: 480}, () => {
  const x = rand() * W, y = 226 + rand() * 86;
  return {x, y, h: (4 + rand() * 16) * (0.35 + (y - 220) / 70),
    gold: rand() < 0.35, bloom: rand() < 0.085, tilt: rand() * 5};
}).sort((a,b) => a.y - b.y);
const trees = [[38,214,57],[74,216,84],[124,209,47],[570,218,65],[611,213,98],[650,220,66],[696,215,83]];
const crowns = trees.map(() => Array.from({length: 38}, () => {
  const angle = rand() * 2 * Math.PI, r = Math.sqrt(rand());
  return {x: Math.cos(angle)*r*.29, y: Math.sin(angle)*r*.34, r:.05+rand()*.06};
}));
function wind(x,t) {return sin(x*.011-t*1.3)*.57 + sin(x*.023-t*.82)*.26 + sin(t*.42)*.17;}
function path(c, data, fill, stroke, width=1) {
  const p = new Path2D(data);
  if(fill) {c.fillStyle=fill;c.fill(p);}
  if(stroke) {c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}
}
function dot(c,x,y,r,color) {
  c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fill();
}
function text(c,str,x,y,size,color) {
  c.fillStyle=color;c.font=size+'px monospace';c.fillText(str,x,y);
}
function landscape(c) {
  const sky=c.createLinearGradient(0,0,0,245);
  sky.addColorStop(0,'#80baba');sky.addColorStop(.48,'#f2d2ab');sky.addColorStop(.83,'#ffdc9f');sky.addColorStop(1,'#ffe9b7');
  c.fillStyle=sky;c.fillRect(0,0,W,H);
  dot(c,483,94,39,'#ffecb6');dot(c,483,94,29,'#fff3c7');
  path(c,'M0 179 Q70 152 113 164 T224 148 Q298 112 354 146 T470 151 Q536 125 589 147 T720 131 V300 H0Z','#b5bc9d');
  path(c,'M0 174 Q67 151 137 181 T286 173 Q351 161 420 179 T547 174 Q643 125 720 153 V300 H0Z','#8fae94');
  path(c,'M0 194 Q77 166 166 191 T336 184 Q434 158 548 189 T720 177 V300 H0Z','#759a80');
  path(c,'M0 211 Q105 196 198 212 T395 211 Q510 187 630 211 T720 204 V300 H0Z','#afbb80');
  path(c,'M0 235 Q117 213 240 230 T490 222 Q611 204 720 223 V300 H0Z','#819e67');
  path(c,'M0 261 Q127 226 278 250 T543 244 Q653 220 720 233 V300 H0Z','#517e64');
  path(c,'M326 212 Q307 217 350 223 T352 232 Q376 228 371 225 T328 212Z','#d7c599');
  path(c,'M0 287 Q165 245 282 267 T529 261 Q625 240 720 252 V300 H0Z','#395f52');
}
function tree(c,[x,y,h],clusters,t) {
  const sway=wind(x,t)*h*.043;
  c.save();c.translate(x,y);c.transform(1,0,-sway/h,1,0,0);
  path(c,'M-1 1 Q0 -20 -3 -37',null,'#465e49',2);
  c.scale(h,h);
  path(c,'M.026 0 Q-.008 -.25 .015 -.58 L-.025 -.58 Q-.025 -.2 -.033 0Z','#596b50');
  // A solid crown under the leaf clusters keeps the silhouette connected.
  c.fillStyle='#759473';c.beginPath();c.ellipse(0,-.62,.24,.29,0,0,Math.PI*2);c.fill();
  for(const [i,b] of clusters.entries()) {
    dot(c,b.x,-.62+b.y,b.r,['#64886a','#729374','#88a278','#99ad79'][i%4]);
  }
  // Small printed leaf marks catch the evening light on the windward edge.
  for(let i=1;i<clusters.length;i+=3){
    const leaf=clusters[i];
    text(c,i%2?'(':',',leaf.x,-.62+leaf.y,.095,i%2?'#bcc18a':'#597e63');
  }
  path(c,'M0 -.02 Q-.025 -.35 .015 -.65 M0 -.36 Q-.12 -.48 -.15 -.53 M0 -.45 Q.12 -.53 .15 -.65',null,'#596e54',.013);
  c.restore();
}
function fly(c,t) {
  const u=((t*.047+.39)%1), x=-90+u*910;
  const y=90-38*sin(u*3.5)+4*sin(u*9);
  c.save();c.translate(x,y);c.rotate(-.14*Math.cos(u*3.5)+.035*sin(u*9));c.scale(.85,.85);
  // Two staggered wings, struts, an open cockpit and a spinning propeller.
  path(c,'M-39 2 L-46 -13 Q-46 -16 -41 -14 L-29 -2 L-6 -4 Q0 -8 7 -5 L24 -3 Q35 -2 37 2 Q32 8 15 8 L-24 6Z','#b95335','#733f31',1.3);
  path(c,'M-15 0 L-21 -13 M9 0 L16 -13 M-21 -13 L9 0',null,'#584b38',1.4);
  path(c,'M-32 -15 Q-20 -18 26 -15 L28 -12 L-29 -12Z','#d77a45','#76472f',1.2);
  path(c,'M-17 4 L22 5 L12 9 L-23 7Z','#efad5d','#815139',1);
  path(c,'M-7 7 L2 15 L13 7 M36 2 L38 2',null,'#534c38',1.4);
  dot(c,2,15,2.4,'#4d4f41');dot(c,5,-5,2.4,'#5b5041');
  c.strokeStyle='#fff1c1';c.lineWidth=1.7;c.beginPath();c.ellipse(38,2,2,5+5*Math.abs(sin(t*16)),0,0,Math.PI*2);c.stroke();
  c.restore();
}
function draw(c,t,back) {
  c.drawImage(back,0,0,W,H);
  for(let i=0;i<6;i++){
    const x=((i*148+t*2.1)%850)-65, y=31+(i*29)%66;
    path(c,`M${x} ${y} q16 -3 28 -1 t33 0`,null,'#ffefd2aa',2);
  }
  fly(c,t);
  trees.forEach((treeData,i)=>tree(c,treeData,crowns[i],t));
  // Field station: a tiny cabin with a rooftop receiving aerial.
  path(c,'M312 212 L312 194 L326 185 L343 194 V212Z','#ecd2a1');
  path(c,'M307 195 L326 181 L348 195 L342 195 L326 186 L313 195Z','#ab684a');
  path(c,'M328 212 V201 H335 V212Z','#557164');
  text(c,'Ψ',341,193,18,'#465e4f');
  for(const g of grass) {
    const bend=(.22+.49*wind(g.x,t))*g.h+g.tilt;
    const tipX=g.x+bend,tipY=g.y-g.h;
    c.strokeStyle=g.gold?'#c6b572':g.y>260?'#83a47b':'#73936d';
    c.lineWidth=g.y>265?1.25:.8;c.beginPath();c.moveTo(g.x,g.y);c.quadraticCurveTo(g.x+1,g.y-g.h*.55,tipX,tipY);c.stroke();
    if(g.bloom)text(c,g.gold?'*':'+',tipX-2,tipY+1,7,g.gold?'#ffe3a1':'#efa68b');
  }
  for(let i=0;i<12;i++){
    const x=(i*83+t*(5+i%4))%(W+40)-20,y=155+(i*43)%106+sin(t*.65+i)*4;
    text(c,i%3===0?'·':"'",x,y,9,'#ffebbc');
  }
}

const back=document.createElement('canvas');
back.width=W;back.height=H;landscape(back.getContext('2d'));
const plates=[...document.querySelectorAll('.meadow')].map(canvas=>({canvas,c:canvas.getContext('2d'),visible:false}));
let frame=0,previous=0,elapsed=0;
function paint(p) {
  const rect=p.canvas.getBoundingClientRect();
  if(!rect.width || !rect.height)return;
  const ratio=Math.min(devicePixelRatio||1,2),w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);
  if(p.canvas.width!==w || p.canvas.height!==h){p.canvas.width=w;p.canvas.height=h;}
  const scale=Math.max(w/W,h/H);
  p.c.setTransform(scale,0,0,scale,(w-W*scale)/2,(h-H*scale)/2);
  draw(p.c,elapsed,back);
}
function render(now) {
  frame=0;
  if(document.hidden || !plates.some(p=>p.visible)){previous=0;return;}
  if(previous && !paused)elapsed+=Math.min((now-previous)/1000,.12);
  previous=now;plates.filter(p=>p.visible).forEach(paint);
  if(!paused)frame=requestAnimationFrame(render);
}
function wake(){if(!frame)frame=requestAnimationFrame(render);}
const visibility=new IntersectionObserver(entries=>{
  for(const entry of entries){plates.find(p=>p.canvas===entry.target).visible=entry.isIntersecting;}
  wake();
});
const sizes=new ResizeObserver(wake);
plates.forEach(p=>{visibility.observe(p.canvas);sizes.observe(p.canvas);});
const buttons=[...document.querySelectorAll('.meadow-toggle')];
function setPaused(value){
  paused=value;previous=0;
  buttons.forEach(b=>{b.textContent=value?'Play breeze':'Pause breeze';});
  wake();
}
buttons.forEach(b=>b.addEventListener('click',()=>setPaused(!paused)));
reduced.addEventListener('change',()=>setPaused(reduced.matches));
document.addEventListener('visibilitychange',()=>{previous=0;wake();});
setPaused(paused);
