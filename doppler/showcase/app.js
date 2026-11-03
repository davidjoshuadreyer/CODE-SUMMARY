'use strict';
const $=id=>document.getElementById(id),canvas=$('plot'),ctx=canvas.getContext('2d');
let data,background=new Image(),position=0,player,ready=false,mode='youtube',localOffset=0,objectURL,playing=false;
const duration=240,start=5400;
const stamp=s=>{s=Math.max(0,Math.floor(s));return s>=3600?`${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
function available(){return mode==='local'?Number.isFinite($('local-player').duration)&&!$('play').disabled:ready;}
function draw(){
 if(!data)return;
 const box=canvas.getBoundingClientRect(),ratio=window.devicePixelRatio||1;
 if(canvas.width!==Math.round(box.width*ratio)||canvas.height!==Math.round(box.height*ratio)){canvas.width=Math.round(box.width*ratio);canvas.height=Math.round(box.height*ratio);}
 const w=box.width,h=box.height;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#171126';ctx.fillRect(0,0,w,h);
 const sp=data.spectrum,x=t=>t/duration*w,y=f=>(600-f)/560*h;
 if(background.complete&&background.naturalWidth)ctx.drawImage(background,x(sp.start),y(sp.high),x(sp.end-sp.start),y(sp.low)-y(sp.high));
 for(const e of data.events){
  function line(values,dashed){ctx.beginPath();ctx.strokeStyle=e.group==='A'?'#66ede0':'#ffcd77';ctx.lineWidth=dashed?1.4:1.8;ctx.setLineDash(dashed?[5,4]:[]);e.times.forEach((t,i)=>{if(i===0||t-e.times[i-1]>1.1)ctx.moveTo(x(t),y(values[i]));else ctx.lineTo(x(t),y(values[i]));});ctx.stroke();}
  line(e.observed,false);if($('fits').checked)line(e.fitted,true);
 }
 ctx.setLineDash([]);ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x(position),0);ctx.lineTo(x(position),h);ctx.stroke();
 $('seek').value=position;$('time').textContent=`${stamp(position)} / 4:00`;$('original').textContent=`Original ${stamp(start+position)}`;
 data.events.forEach((e,i)=>{let j=e.times.findIndex(t=>t>=position);if(j<0)j=e.times.length-1;if(j>0&&Math.abs(e.times[j-1]-position)<Math.abs(e.times[j]-position))j--;const active=position>=e.times[0]&&position<=e.times.at(-1)&&Math.abs(e.times[j]-position)<.6;$('hz-'+i).textContent=active?`${e.observed[j].toFixed(1)} Hz`:'—';});
 document.querySelectorAll('.passage').forEach(b=>b.classList.toggle('active',b.dataset.time==='60'?position>=64&&position<=134:position>=106&&position<=163));
}
function seek(value){position=Math.max(0,Math.min(duration,value));if(available()){if(mode==='local')$('local-player').currentTime=localOffset+position;else player.seekTo(start+position,true);}draw();}
function pause(){if(mode==='local')$('local-player').pause();else if(ready)player.pauseVideo();playing=false;$('play').textContent='Play';}
$('seek').addEventListener('input',e=>seek(Number(e.target.value)));
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();seek((e.clientX-r.left)/r.width*duration);});
$('fits').addEventListener('change',draw);document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>seek(Number(b.dataset.time))));
$('play').addEventListener('click',()=>{if(playing){pause();return;}if(position>=duration-.1)seek(0);if(mode==='local')$('local-player').play().catch(()=>{$('status').textContent='Press play on the local player to begin.';});else if(ready)player.playVideo();});
function videoError(){ready=false;if(mode==='youtube'){$('play').disabled=true;$('status').textContent='YouTube playback is unavailable here. Open the source link, or use your local recording below for synchronized playback.';}}
window.onYouTubeIframeAPIReady=()=>{
 player=new YT.Player('player',{host:'https://www.youtube.com',videoId:'hKz8v9fu0c0',playerVars:{start,end:start+duration,playsinline:1,rel:0,origin:location.origin},events:{onReady:()=>{ready=true;if(mode!=='youtube')return;$('play').disabled=false;player.seekTo(start+position,true);$('status').textContent='Ready. Press Play; the video and measured curves share one timeline.';},onError:videoError,onStateChange:e=>{if(mode!=='youtube'){if(e.data===1)player.pauseVideo();return;}playing=e.data===1;$('play').textContent=playing?'Pause':'Play';if(playing){const t=player.getCurrentTime();if(t<start||t>=start+duration)seek(0);}}}});
};
$('load').addEventListener('click',()=>{$('cover').hidden=true;$('status').textContent='Loading YouTube…';const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=videoError;document.head.append(s);setTimeout(()=>{if(!ready&&mode==='youtube')$('status').textContent='YouTube is taking longer to load. You can use your local recording below if playback remains unavailable.';},15000);});
const local=$('local-player');
$('local').addEventListener('change',()=>{const f=$('local').files[0];if(!f)return;pause();mode='local';$('play').disabled=true;local.hidden=false;if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(f);local.src=objectURL;$('status').textContent='Checking local recording…';});
local.addEventListener('loadedmetadata',()=>{if(Math.abs(local.duration-240)<2)localOffset=0;else if(Math.abs(local.duration-6660.087)<3)localOffset=start;else{$('status').textContent='This file is not the expected full recording or exact four-minute excerpt. Choose the original Crazy Float Planes recording or the 1:30:00–1:34:00 excerpt.';return;}$('play').disabled=false;seek(position);$('status').textContent='Local playback synchronized by recording offset. File stays on your device.';});
local.addEventListener('error',()=>{$('play').disabled=true;$('status').textContent='This browser could not decode the selected recording.';});
local.addEventListener('play',()=>{if($('play').disabled){local.pause();return;}playing=true;$('play').textContent='Pause';});local.addEventListener('pause',()=>{playing=false;$('play').textContent='Play';});
setInterval(()=>{if(!available())return;const t=mode==='local'?local.currentTime-localOffset:player.getCurrentTime()-start;if(playing&&t>=duration){pause();position=duration;}else if(playing&&t<0){seek(0);return;}else position=Math.max(0,Math.min(duration,t));draw();},100);
new ResizeObserver(draw).observe(canvas);
fetch('showcase/curves.json').then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json();}).then(d=>{data=d;data.events.forEach((e,i)=>{const div=document.createElement('div');div.textContent=e.label;const b=document.createElement('b');b.id='hz-'+i;b.textContent='—';div.append(b);$('readouts').append(div);});background.onload=draw;background.src='showcase/spectrum.png';draw();}).catch(()=>{$('status').textContent='The curve data could not be loaded. Reload the page to retry.';});
