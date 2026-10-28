/* Inline original manual pages retain the reference library's account checks. */
(() => {
 'use strict';
 const C=window.TesselateCloud,cache=new Map();
 let generation=0,ready=false,scope='shared';
 const panels=[...document.querySelectorAll('.manual-screenshots')];
 const status=document.querySelector('#image-account');
 function message(panel,text,retry=false){
  const box=panel.querySelector('.manual-pages');box.replaceChildren();
  const p=document.createElement('p');p.textContent=text;box.append(p);
  if(retry){const b=document.createElement('button');b.type='button';b.textContent='Retry loading screenshots';b.onclick=()=>load(panel);box.append(b);}
 }
 async function load(panel){
  if(!panel.open||panel.dataset.loaded==='yes'||panel.dataset.loading==='yes')return;
  if(!ready){message(panel,'Connecting to the reference library…');return;}
  if(!C.user){message(panel,'Sign in to Tesselate using the link above to view the original textbook solution.');return;}
  const ticket=generation,owner=C.user.id;panel.dataset.loading='yes';
  message(panel,'Loading original textbook solution…');
  try{
   const fragments=[];
   for(const crop of JSON.parse(panel.dataset.crops)){
    const n=crop.page;
    if(!cache.has(n))cache.set(n,C.referencePage('phys-manual',n,scope).catch(e=>{cache.delete(n);throw e;}));
    const data=await cache.get(n);
    if(ticket!==generation||owner!==C.user?.id)return;
    if(!data||typeof data.image!=='string'||!/^\/9j\/[A-Za-z0-9+/=]+$/.test(data.image)){cache.delete(n);throw Error('Manual page '+n+' is unavailable.');}
    const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');
    const original=new Image();original.src='data:image/jpeg;base64,'+data.image;await original.decode();
    if(ticket!==generation||owner!==C.user?.id)return;
    const [x0,y0,x1,y1]=crop.box;
    if(![x0,y0,x1,y1].every(Number.isFinite)||x0<0||y0<0||x1>1||y1>1||x1<=x0||y1<=y0)throw Error('Invalid solution crop.');
    const canvas=document.createElement('canvas'),w=original.naturalWidth,h=original.naturalHeight;
    const sx=Math.floor(x0*w),sy=Math.floor(y0*h),sw=Math.floor(x1*w)-sx,sh=Math.floor(y1*h)-sy;
    canvas.width=sw+28;canvas.height=sh+28;
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(original,sx,sy,sw,sh,14,14,sw,sh);image.src=canvas.toDataURL('image/jpeg',.95);
    image.width=canvas.width;image.height=canvas.height;
    image.alt='Cropped original textbook solution '+panel.dataset.problem+', solutions-manual PDF page '+n;
    image.className='source-page';image.decoding='async';
    caption.textContent='Solutions manual · problem '+panel.dataset.problem+' · PDF page '+n+'. Click the image to enlarge.';
    image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',image.alt+' — enlarge');
    image.addEventListener('click',()=>zoom(image));image.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();zoom(image);}});
    figure.append(image,caption);fragments.push(figure);
   }
   panel.querySelector('.manual-pages').replaceChildren(...fragments);panel.dataset.loaded='yes';
  }catch(e){if(ticket===generation)message(panel,'Could not load the screenshots: '+e.message,true);}
  finally{if(ticket===generation)delete panel.dataset.loading;}
 }
 const dialog=document.querySelector('#source-image-dialog'),large=dialog.querySelector('img');
 function zoom(img){large.src=img.src;large.alt=img.alt;dialog.querySelector('h2').textContent=img.alt;dialog.showModal();}
 dialog.querySelector('button').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>large.removeAttribute('src'));
 document.querySelectorAll('[data-source-zoom]').forEach(button=>button.onclick=()=>zoom(button.querySelector('img')));
 panels.forEach(p=>p.addEventListener('toggle',()=>load(p)));
 async function account(){
  const ticket=++generation;ready=false;cache.clear();
  if(dialog.open)dialog.close();
  panels.forEach(p=>{delete p.dataset.loaded;delete p.dataset.loading;message(p,'Connecting to the reference library…');});
  if(!C.user){ready=true;status.textContent='Question screenshots are ready. Sign in to view original textbook-solution screenshots.';panels.filter(p=>p.open).forEach(load);return;}
  try{
   const shared=await C.sharedReferenceManifest('phys-manual');
   if(ticket!==generation)return;
   scope=shared?'shared':'private';ready=true;
   status.textContent='Signed in · original textbook solutions load when you expand them.';
   panels.filter(p=>p.open).forEach(load);
  }catch(e){if(ticket===generation){status.textContent='Reference connection failed: '+e.message;panels.forEach(p=>message(p,'Reload the page to reconnect to the reference library.'));}}
 }
 if(C)C.init(account).then(account).catch(e=>{status.textContent='Sign-in could not load: '+e.message;panels.forEach(p=>message(p,'Open the linked manual viewer to view the original solution.'));});
})();
