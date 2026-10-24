(() => {
  const select = document.getElementById('worksheet');
  function show(value) {
    if (![...select.options].some(option=>option.value===value)) value='box-review';
    select.value=value;
    document.querySelectorAll('[data-worksheet]').forEach(section=>{section.hidden=section.dataset.worksheet!==value;});
  }
  show(location.hash.slice(1) || 'box-review');
  select.addEventListener('change',()=>{show(select.value);history.replaceState(null,'','#'+select.value);});
  window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
})();
