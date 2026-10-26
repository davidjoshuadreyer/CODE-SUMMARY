(() => {
  'use strict';
  const search=document.getElementById('template-search');
  const cards=[...document.querySelectorAll('.template')];
  function filter() {
    const words=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count=0;
    for(const card of cards){card.hidden=!words.every(word=>card.dataset.search.includes(word));if(!card.hidden)count++;document.querySelector(`[data-index="${card.id}"]`).hidden=card.hidden;}
    document.querySelectorAll('.topic').forEach(section=>{section.hidden=![...section.querySelectorAll('.template')].some(card=>!card.hidden);});
    document.querySelectorAll('.index nav details').forEach(group=>{group.hidden=![...group.querySelectorAll('[data-index]')].some(link=>!link.hidden);});
    document.getElementById('search-count').textContent=`${count} of ${cards.length} templates`;
    document.getElementById('no-results').hidden=count!==0;
  }
  search.addEventListener('input',filter);
  function revealHash(){const card=document.getElementById(location.hash.slice(1));if(card?.classList.contains('template')&&card.hidden){search.value='';filter();card.scrollIntoView();}}
  window.addEventListener('hashchange',revealHash);
  let timer;
  async function copy(text) {
    try {await navigator.clipboard.writeText(text);const status=document.getElementById('copy-status');status.textContent='Code copied.';clearTimeout(timer);timer=setTimeout(()=>{status.textContent='';},3000);}
    catch {const dialog=document.getElementById('copy-fallback');const field=dialog.querySelector('textarea');field.value=text;dialog.showModal();field.focus();field.select();}
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.copy)copy(document.getElementById(button.dataset.copy).textContent);
    if(button.dataset.program){const id=button.dataset.program;const code=document.getElementById(id+'-code').textContent;const usage=document.getElementById(id+'-use').textContent.trimEnd();copy('#include <iostream>\n\n'+code+'\nint main() {\n'+usage.split('\n').map(line=>'    '+line).join('\n')+'\n    return 0;\n}\n');}
  });
})();
