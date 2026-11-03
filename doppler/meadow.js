// Every visible mark in the landscape is a printable ASCII character.
const NS = 'http://www.w3.org/2000/svg';
const W = 720, H = 300;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
function group(parent) {
  const node = document.createElementNS(NS,'g');
  parent.append(node);
  return node;
}
function letters(parent, str, x, y, color, size = 10) {
  const node = document.createElementNS(NS,'text');
  node.setAttribute('x', x);
  node.setAttribute('y', y);
  node.setAttribute('fill', color);
  node.setAttribute('font-size', size);
  node.setAttribute('xml:space', 'preserve');
  node.textContent = str;
  parent.append(node);
  return node;
}
function block(parent, lines, x, y, size, step, color) {
  const layer = group(parent);
  lines.forEach((line,i) => letters(layer,line,x,y+i*step,color,size));
  return layer;
}
function seeded(seed) {
  return () => ((seed = (Math.imul(seed,1664525)+1013904223) >>> 0) / 4294967296);
}
function wind(x,t) {
  return .65*Math.sin(x*.013-t*1.55) + .35*Math.sin(x*.025-t*.73);
}
function landscape(svg) {
  const rnd = seeded(637);
  const cloud = block(svg,['       .--.','   .--(    ).',' _(          )__','(_______________)'],0,0,9,7,'#5b8380');
  block(svg,['     . : .','  .-* * *-.',' : * @@@ * :','  \'-* * *-\'','     \' : \''],473,37,13,11,'#ae672b');
  const plane = block(svg,[
    '        ______________',
    '       /_____________/ ',
    '  __      \\ /   \\ /     |',
    ' /_/_______V_____V____  |',
    ' \\___________________)>+',
    '          \\_/          |',
    '          (o)'
  ],0,0,10,6.5,'#963e26');
  const orchard=[[19,206,.64],[60,213,1.03],[112,212,.75],[559,214,.77],[610,215,1.08],[673,215,.81]];
  // Leave the hillside ink out of the foreground silhouettes.
  // Fine hatching fades into deeper inks on the nearer slopes.
  for(let ridge=0;ridge<3;ridge++){
    const inks=['#788f83','#637f70','#456f59'];
    const hatch=['.',';',':'];
    const heights=Array.from({length:112},(_,i)=>Math.round((152+ridge*22+16*Math.sin(i*.079+ridge*1.5)+7*Math.sin(i*.17+ridge))/7));
    for(let row=Math.min(...heights);row<=Math.max(...heights)+2;row++){
      const line=heights.map((v,i)=>{
        const x=i*6.42, y=row*7;
        if(orchard.some(([tx,ty,k])=>Math.abs(x-tx)<45*k && y>ty-88*k && y<ty+2))return ' ';
        if(x>300 && x<382 && y>160 && y<215)return ' ';
        if(row===v) return i && heights[i-1]>v?'/':i && heights[i-1]<v?'\\':'_';
        return row>v && row<v+3 && rnd()>.48?hatch[ridge]:' ';
      }).join('');
      letters(svg,line,0,row*7,inks[ridge],10.7);
    }
  }
  const trees=[];
  for(const [x,y,size] of orchard){
    const root=group(svg);root.setAttribute('transform',`translate(${x} ${y}) scale(${size})`);
    const crown=block(root,[
      '       .^.','     .:v*:v.','   .:(vv*v):.','  .(v:Vvv:Vv).',
      ' (vVvv:vVv:vv:)','  \\vVvV|VvVv/','     \\ | /','      \\|/'
    ],-49,-82,10.5,8,'#3a7057');
    block(root,['       ||','       ||','      /||\\'],-49,-17,10.5,8,'#655c42');
    trees.push({x,crown});
  }
  block(svg,['        \\|/','         |','     ____|','    /___/|','   /___/ |','   | []|_|','___|___|/___'],300,165,10.5,7,'#865734');
  const grasses=[];
  for(let patch=0;patch<67;patch++){
    const x=rnd()*W,y=220+rnd()*80, size=7+(y-220)*.10;
    const sprig=group(svg);
    sprig.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const stems=group(sprig);
    const ink=['#688a62','#567e5a','#996539','#436c55'][patch%4];
    block(stems,patch%5===0?['   *   .','   |  /',' \\ | /','  \\|/']:['  /  /',' \\/ /','  |/'],0,-size*1.65,size,size*.61,ink);
    grasses.push({x,stems});
  }
  const pollen=Array.from({length:10},(_,i)=>letters(svg,i%3===0?'*':"'",0,0,'#a0663d',9));
  return t=>{
    const u=(t*.049+.32)%1;
    const x=-143+u*886, y=75-29*Math.sin(u*3.2)+4*Math.sin(u*9);
    plane.setAttribute('transform',`translate(${x} ${y}) rotate(${-7*Math.cos(u*3.2)+2*Math.sin(u*9)})`);
    cloud.setAttribute('transform',`translate(${90+32*Math.sin(t*.065)} ${37+2*Math.sin(t*.14)})`);
    trees.forEach(({x,crown})=>crown.setAttribute('transform',`skewX(${-wind(x,t)*4.2})`));
    grasses.forEach(({x,stems})=>stems.setAttribute('transform',`skewX(${-7-wind(x,t)*20})`));
    pollen.forEach((el,i)=>el.setAttribute('transform',`translate(${(i*79+t*(4+i%3))%760-20} ${176+(i*17)%84+3*Math.sin(t*.7+i)})`));
  };
}
const plates=[...document.querySelectorAll('svg.meadow')].map(svg=>({svg,paint:landscape(svg),visible:false}));
let frame=0,last=0,elapsed=0;
function render(now){
  frame=0;
  if(document.hidden || !plates.some(p=>p.visible)){last=0;return;}
  if(!paused && last) elapsed+=Math.min(.1,(now-last)/1000);
  last=now;
  plates.filter(p=>p.visible).forEach(p=>p.paint(elapsed));
  if(!paused)frame=requestAnimationFrame(render);
}
function wake(){if(!frame)frame=requestAnimationFrame(render);}
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{plates.find(p=>p.svg===e.target).visible=e.isIntersecting;});
  wake();
});
plates.forEach(p=>{p.paint(0);observer.observe(p.svg);});
const buttons=[...document.querySelectorAll('.meadow-toggle')];
function setPaused(value){
  paused=value;last=0;
  buttons.forEach(b=>{b.textContent=value?'Play breeze':'Pause breeze';});
  wake();
}
buttons.forEach(b=>b.addEventListener('click',()=>setPaused(!paused)));
reduced.addEventListener('change',()=>setPaused(reduced.matches));
document.addEventListener('visibilitychange',()=>{last=0;wake();});
setPaused(paused);
