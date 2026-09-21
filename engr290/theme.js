(() => {
 const button=document.getElementById('theme');
 let dark=matchMedia('(prefers-color-scheme: dark)').matches;
 try { const saved=localStorage.getItem('chem-theme'); if(saved) dark=saved==='dark'; } catch {}
 function apply(){document.body.classList.toggle('dark',dark);button.setAttribute('aria-pressed',String(dark));}
 apply();button.addEventListener('click',()=>{dark=!dark;apply();try{localStorage.setItem('chem-theme',dark?'dark':'light');}catch{}});
})();
