/* Optional academic presentation. Original layout and appearance preferences stay independent. */
(() => {
  'use strict';
  const key = 'tesselate-study-style';
  const valid = value => value === 'report' ? 'report' : 'original';
  function read(){try{return valid(localStorage.getItem(key));}catch{return 'original';}}
  function apply(value){
    document.documentElement.dataset.studyStyle=valid(value);
    document.querySelectorAll('[data-study-style-select]').forEach(select=>{select.value=valid(value);});
  }
  apply(read());
  function mount(){
    if(document.querySelector('[data-study-style-select]'))return;
    const host=document.querySelector('[data-study-style-host]') || document.querySelector('.sidebar') || document.querySelector('body > header nav') || document.querySelector('body > header') || document.querySelector('main > nav') || document.querySelector('main');
    if(!host)return;
    const label=document.createElement('label');label.className='report-style-control';
    const text=document.createElement('span');text.textContent='Study style';label.append(text);
    const select=document.createElement('select');select.dataset.studyStyleSelect='';select.setAttribute('aria-label','Study style');
    for(const [value,title] of [['original','Original'],['report','Lab report']]){const option=document.createElement('option');option.value=value;option.textContent=title;select.append(option);}
    select.value=read();label.append(select);if(host.matches('main'))host.prepend(label);else host.append(label);
    select.addEventListener('change',()=>{apply(select.value);try{localStorage.setItem(key,select.value);}catch{}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  addEventListener('storage',e=>{if(e.key===key)apply(e.newValue);});
})();

// Shared visual enhancement; source URL stays correct on nested course pages.
(() => {
 const source=document.currentScript?.src;
 if(!source)return;
 const script=document.createElement('script');
 script.src=new URL('design/aurora-motion.js?v=fluid-2',source).href;
 script.defer=true;
 document.head.append(script);
})();
