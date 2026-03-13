(function(){
  if(localStorage.getItem('chem-theme')==='dark'){
    document.body.classList.add('dark');
    document.querySelectorAll('.theme-btn').forEach(b=>b.textContent='Light');
  }
})();
function toggleTheme(){
  const dark=document.body.classList.toggle('dark');
  document.querySelectorAll('.theme-btn').forEach(b=>b.textContent=dark?'Light':'Dark');
  localStorage.setItem('chem-theme',dark?'dark':'light');
}
