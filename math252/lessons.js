(() => {
 const input=document.getElementById('topic-search');
 const cards=[...document.querySelectorAll('.topic-card')];
 input.addEventListener('input',()=>{
  const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let count=0;
  for(const card of cards){card.hidden=!terms.every(t=>card.dataset.search.includes(t));if(!card.hidden)count++;}
  for(const unit of document.querySelectorAll('.unit'))unit.hidden=![...unit.querySelectorAll('.topic-card')].some(c=>!c.hidden);
  document.getElementById('topic-count').textContent=`${count} lesson${count===1?'':'s'}`;
  document.getElementById('no-topics').hidden=count!==0;
 });
})();
