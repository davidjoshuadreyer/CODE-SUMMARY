(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('flight'), ctx = canvas.getContext('2d');
  const key = 'tesselate-paper-flight-v1';
  const types = [
    {name:'A kinder breeze',icon:'↗',detail:'A little more momentum at the start of every adventure.',base:18},
    {name:'Patient wings',icon:'〰',detail:'Wider folds that settle more slowly and carry you further.',base:24},
    {name:'Lighter paper',icon:'◇',detail:'More lift in reserve for those lovely, lingering glides.',base:20}
  ];
  let saved = {balance:0,best:0,levels:[0,0,0]}, storageOK = true;
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value && typeof value === 'object') {
      for (const field of ['balance','best']) if(Number.isFinite(value[field]) && value[field]>=0) saved[field]=Math.min(value[field],1e9);
      if (Array.isArray(value.levels)) saved.levels=types.map((_,i)=>Math.max(0,Math.min(8,Math.floor(Number(value.levels[i])||0))));
    }
  } catch { storageOK = false; }
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let quiet = preference.matches, state='ready', paused=false, held=false, charge=0, distance=0, height=65, speed=0, velocity=0, lift=1, elapsed=0, phase=0, last=0, width=0, screenHeight=0, trail=[];
  function persist(){try{localStorage.setItem(key,JSON.stringify(saved));}catch{storageOK=false;} storageNote();}
  function storageNote(){if(!storageOK)$('save-note').textContent='Progress stays here for this visit. Device storage is unavailable in this browser.';}
  const cost = i => Math.round(types[i].base * Math.pow(1.65,saved.levels[i]));
  function renderWorkshop(){
    $('best').innerHTML=`${Math.floor(saved.best)} <small>m</small>`;
    $('balance').textContent=saved.balance;
    $('upgrades').innerHTML=types.map((type,i)=>`<article class="upgrade"><div class="upgrade-top"><span class="upgrade-icon" aria-hidden="true">${type.icon}</span><span>FOLD ${saved.levels[i]} / 8</span></div><h3>${type.name}</h3><p>${type.detail}</p><button data-upgrade="${i}" ${saved.levels[i]>=8||saved.balance<cost(i)||state==='flying'||state==='charging'?'disabled':''} aria-label="Upgrade ${type.name}${saved.levels[i]<8?` for ${cost(i)} breeze`:': fully folded'}"><span>${saved.levels[i]>=8?'Fully folded':'Make a small improvement'}</span><span>${saved.levels[i]>=8?'✓':cost(i)+' breeze'}</span></button></article>`).join('');
  }
  $('upgrades').addEventListener('click',event=>{
    const button=event.target.closest('[data-upgrade]');if(!button||state==='flying'||state==='charging')return;
    const i=Number(button.dataset.upgrade), price=cost(i);
    if(saved.levels[i]>=8||saved.balance<price)return;
    saved.balance-=price;saved.levels[i]++;persist();renderWorkshop();$('announcement').textContent=`${types[i].name} upgraded to fold ${saved.levels[i]}.`;
  });
  function ready(){state='ready';paused=false;held=false;charge=0;distance=0;height=65;velocity=0;lift=1;elapsed=0;trail=[];$('result').hidden=true;$('invitation').hidden=false;$('launch').hidden=false;$('launch').textContent='Hold to throw ↗';$('pause').hidden=true;$('hint').textContent='Hold the button or Space to throw. During flight, hold for a gentle lift.';$('meter-label').textContent='Launch momentum';renderWorkshop();}
  function press(){if(paused)return;if(state==='ready'){state='charging';charge=.15;renderWorkshop();}if(state==='charging'||state==='flying')held=true;}
  function release(cancel=false){held=false;if(state==='charging'){if(cancel){ready();return;}state='flying';speed=19+charge*11+saved.levels[0]*3;height=65+charge*18;velocity=7+charge*7;elapsed=0;$('invitation').hidden=true;$('launch').textContent='Hold for lift 〰';$('pause').hidden=false;$('pause').textContent='Pause';$('meter-label').textContent='Lift in reserve';$('hint').textContent='Let it drift, or hold for a little lift. Space to lift · P to pause';$('announcement').textContent='Your airplane is in flight.';}}
  function land(){state='landed';held=false;const meters=Math.floor(distance),reward=Math.max(6,Math.floor(meters/12)),record=meters>saved.best;saved.balance+=reward;saved.best=Math.max(saved.best,meters);persist();$('result-label').textContent=record?'A LITTLE FURTHER THAN BEFORE':'A SOFT LANDING';$('result-distance').textContent=meters+' m';$('reward').textContent=`+${reward} breeze for your next fold. Take a breath. There’s always another horizon.`;$('result').hidden=false;$('launch').hidden=true;$('pause').hidden=true;$('hint').textContent='Visit the folding table below, or take another flight.';renderWorkshop();}
  function togglePause(){if(state!=='flying')return;paused=!paused;held=false;$('pause').textContent=paused?'Resume':'Pause';$('hint').textContent=paused?'A moment of stillness. Resume whenever you like.':'Let it drift, or hold for a little lift. Space to lift · P to pause';}
  $('launch').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();$('launch').setPointerCapture(e.pointerId);press();});
  $('launch').addEventListener('pointerup',()=>release());
  $('launch').addEventListener('pointercancel',()=>release(true));
  $('launch').addEventListener('lostpointercapture',()=>{if(held)release(true);});
  // Keyboard and assistive-technology clicks can launch without a pointer gesture.
  $('launch').addEventListener('click',e=>{if(e.detail===0 && state==='ready'){press();charge=.65;release();}});
  document.addEventListener('keydown',e=>{if(e.code==='Space' && (e.target===document.body||e.target===canvas||e.target===$('launch'))){e.preventDefault();if(!e.repeat)press();}if(e.code==='KeyP'&&!e.repeat)togglePause();});
  document.addEventListener('keyup',e=>{if(e.code==='Space'&&held){e.preventDefault();release();}});
  $('pause').addEventListener('click',togglePause);$('again').addEventListener('click',()=>{ready();$('launch').focus();});
  function suspend(){release(true);if(state==='flying'&&!paused)togglePause();}
  window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();last=0;});
  function motionUI(){$('motion').setAttribute('aria-pressed',String(quiet));$('motion').textContent=quiet?'Quiet motion on':'Quiet motion';}
  $('motion').addEventListener('click',()=>{quiet=!quiet;motionUI();});preference.addEventListener('change',e=>{quiet=e.matches;motionUI();});
  function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;screenHeight=rect.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(screenHeight*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);}
  new ResizeObserver(resize).observe(canvas);
  const palettes=[['#d6b7ff','#7771d9','#444487'],['#e8e1b8','#b5acac','#736176'],['#ff9bd6','#e95aa7','#ab4d88'],['#ffb6a4','#f97e76','#c85b73']];
  function wave(x,i,t){return [.59,.69,.78,.91][i]+Math.sin(x*5.6+t+i*1.8)*[.065,.06,.085,.05][i]+Math.sin(x*10-t*.4+i)*.018;}
  function draw(){
    if(!width)return;const w=width,h=screenHeight,t=quiet?0:phase;
    const sky=ctx.createLinearGradient(0,0,w*.4,h);sky.addColorStop(0,'#f7effb');sky.addColorStop(.6,'#f9deed');sky.addColorStop(1,'#efbfd5');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    const glow=ctx.createRadialGradient(w*.77,h*.25,0,w*.77,h*.25,h*.35);glow.addColorStop(0,'#fff7e8bb');glow.addColorStop(1,'#fff7e800');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    for(let i=0;i<4;i++){
      const offset=t*.07+(!quiet?distance*.0006*(i+1):0),g=ctx.createLinearGradient(0,h*(.47+i*.1),0,h*1.12);palettes[i].forEach((color,j)=>g.addColorStop(j/2,color));ctx.fillStyle=g;ctx.beginPath();
      for(let x=-.02;x<=1.025;x+=.008){const y=wave(x,i,offset)*h;if(x===-.02)ctx.moveTo(x*w,y);else ctx.lineTo(x*w,y);}ctx.lineTo(w+10,h+10);ctx.lineTo(-10,h+10);ctx.closePath();ctx.fill();
      for(let j=0;j<160;j++){const seed=Math.sin(j*127.1+i*321)*43758.5,rand=seed-Math.floor(seed),x=(rand+t*.003*(i+1))%1,y=wave(x,i,offset)+(Math.sin(j*38)+1)*.12;ctx.fillStyle=j%2?'#fff8ff50':'#44335318';ctx.fillRect(x*w,y*h,1,1);}
    }
    const px=w*.27, py=state==='ready'||state==='charging'?h*.49:h*.72-Math.min(height,180)/180*h*.51;
    if(state==='flying'&&!paused&&!quiet){trail.push({x:px,y:py});if(trail.length>65)trail.shift();}
    if(!quiet){ctx.beginPath();trail.forEach((point,i)=>{point.x-=paused||state!=='flying'?0:speed*.0018;const x=point.x-(trail.length-i)*1.4;if(!i)ctx.moveTo(x,point.y);else ctx.lineTo(x,point.y);});ctx.strokeStyle='#ffffff85';ctx.lineWidth=1.3;ctx.stroke();}
    ctx.save();ctx.translate(px,py+(state==='ready'&&!quiet?Math.sin(t)*3:0));ctx.rotate(state==='flying'?Math.max(-.4,Math.min(.3,-velocity*.025)):-.1);const size=w<600?.85:1;ctx.scale(size,size);ctx.shadowColor='#5f3a7428';ctx.shadowBlur=15;ctx.shadowOffsetY=8;
    ctx.beginPath();ctx.moveTo(-26,-14);ctx.lineTo(33,0);ctx.lineTo(-23,15);ctx.lineTo(-13,1);ctx.closePath();ctx.fillStyle='#fffcf6';ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.beginPath();ctx.moveTo(-13,1);ctx.lineTo(33,0);ctx.lineTo(-7,8);ctx.closePath();ctx.fillStyle='#d9cce8';ctx.fill();ctx.beginPath();ctx.moveTo(-26,-14);ctx.lineTo(-13,1);ctx.lineTo(33,0);ctx.strokeStyle='#ede3ee';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
  }
  function tick(now){const dt=last?Math.min((now-last)/1000,.04):0;last=now;
    if(!document.hidden){if(!paused)phase+=dt;
      if(state==='charging')charge=Math.min(1,charge+dt*.6);
      if(state==='flying'&&!paused){elapsed+=dt;const lifting=held&&lift>0; if(lifting)lift=Math.max(0,lift-dt/(3.8+saved.levels[2]*.8));const target=-5.6/(1+saved.levels[1]*.13)+(lifting?12:0)+Math.sin(elapsed*.75)*.8;velocity+=(target-velocity)*(1-Math.exp(-dt*1.3));height+=velocity*dt;speed=Math.max(9,speed-dt*.22);distance+=speed*dt;if(height<=0){height=0;land();}}
      $('distance').textContent=Math.floor(distance);$('altitude').textContent=state==='flying'?(paused?'Taking a breath':Math.round(height)+' m above the waves'):state==='landed'?'Softly landed':'Ready to wander';$('meter').style.width=((state==='ready'||state==='charging'?charge:lift)*100)+'%';$('landscape').textContent=distance<500?'The lavender coast':distance<1000?'The rosewater passage':'The peach horizon';draw();
    }requestAnimationFrame(tick);
  }
  ready();storageNote();motionUI();resize();requestAnimationFrame(tick);
})();
