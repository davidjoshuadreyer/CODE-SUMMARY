(() => {
 const search=document.getElementById('search');
 const cards=[...document.querySelectorAll('.material')];
 search.addEventListener('input',()=>{
  const words=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let count=0;
  for(const card of cards){card.hidden=!words.every(w=>card.dataset.search.includes(w));if(!card.hidden)count++;}
  for(const group of document.querySelectorAll('.material-group'))group.hidden=![...group.querySelectorAll('.material')].some(c=>!c.hidden);
  document.getElementById('result-count').textContent=`${count} resource${count===1?'':'s'}`;
  document.getElementById('no-results').hidden=count!==0;
 });
})();
