/* Small, offline C++ member hints. Deliberately not a full C++ language server. */
(function(root) {
 'use strict';
 const catalogs = {
  string: [
   ['length','length()','Number of characters'],['size','size()','Number of characters'],['empty','empty()','True when there are no characters'],
   ['substr','substr(0, 3)','Copy characters: start, count'],['find','find("text")','Find text; compare result with std::string::npos'],
   ['append','append("text")','Add text at the end'],['replace','replace(0, 1, "text")','Replace: start, count, text'],
   ['insert','insert(0, "text")','Insert text at an index'],['erase','erase(0, 1)','Remove: start, count'],['at','at(0)','Checked character access'],
   ['c_str','c_str()','Read-only null-terminated characters'],['clear','clear()','Remove all characters'],['compare','compare("text")','Negative, zero, or positive comparison'],['push_back',"push_back('!')",'Append one character']
  ],
  vector: [['size','size()','Number of elements'],['empty','empty()','True when empty'],['push_back','push_back(0)','Append a value'],['pop_back','pop_back()','Remove last element; must not be empty'],['at','at(0)','Checked element access'],['clear','clear()','Remove all elements'],['begin','begin()','Iterator to first element'],['end','end()','Iterator past last element']],
  stream: [['good','good()','True if no state flags are set'],['fail','fail()','Read or write failed'],['bad','bad()','Serious stream error'],['eof','eof()','A read encountered end of input'],['clear','clear()','Reset error flags'],['is_open','is_open()','Whether a file is open'],['close','close()','Close file'],['open','open("data.txt")','Open a file']],
 };
 function mask(code) { return code.replace(/\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\n]*|"(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?/g, s=>s.replace(/[^\n]/g,' ')); }
 function suggest(code, position) {
  const before=code.slice(0,position), clean=mask(before);
  const match=clean.match(/\b([A-Za-z_]\w*)\s*(\.|->)\s*(\w*)$/);
  if(!match)return null;
  const [,name,operator,prefix]=match;
  const declarations=[...clean.slice(0,match.index).matchAll(/\b(?:std\s*::\s*)?(string|vector\s*<[^;{}]+?>|ifstream|ofstream|fstream|istringstream|ostringstream|stringstream)\s*([*&]?)\s*(?:const\s+)?([A-Za-z_]\w*)/g)].filter(m=>m[3]===name);
  const declaration=declarations.at(-1);
  if(!declaration || (operator==='->')!==(declaration[2]==='*'))return null;
  const type=declaration[1].startsWith('vector')?'vector':declaration[1]==='string'?'string':'stream';
  let items=catalogs[type];
  if(type==='stream') {
   const t=declaration[1];
   if(t.includes('stringstream'))items=items.filter(x=>!['open','close','is_open'].includes(x[0]));
   if(!['ofstream','ostringstream'].includes(t))items=items.concat([['get','get()','Read a character (int, or EOF)'],['peek','peek()','Inspect next character without consuming it'],['ignore','ignore(1)','Discard characters']]);
   if(!['ifstream','istringstream'].includes(t))items=items.concat([['put',"put('A')",'Write one character'],['flush','flush()','Flush buffered output']]);
  }
  return {start:position-prefix.length,items:items.filter(x=>x[0].startsWith(prefix))};
 }
 if(typeof module==='object')module.exports={suggest,mask};
 root.CppCompletion={suggest};
 if(typeof document==='undefined')return;
 const editor=document.getElementById('source-code'),panel=document.createElement('div');
 panel.id='member-suggestions';panel.className='member-suggestions';panel.hidden=true;panel.setAttribute('role','listbox');panel.setAttribute('aria-label','C++ member suggestions');
 document.getElementById('colour-editor').append(panel);
 editor.setAttribute('aria-controls',panel.id);editor.setAttribute('aria-autocomplete','list');
 let result=null,chosen=0;
 function positionPanel(){
  const style=getComputedStyle(editor),lines=editor.value.slice(0,editor.selectionStart).split('\n');
  const context=document.createElement('canvas').getContext('2d');context.font=style.font;
  const row=parseFloat(style.lineHeight),top=parseFloat(style.paddingTop)+(lines.length-1)*row-editor.scrollTop;
  const left=parseFloat(style.paddingLeft)+context.measureText(lines.at(-1).replace(/\t/g,'    ')).width-editor.scrollLeft;
  panel.style.width=Math.min(560,editor.clientWidth-20)+'px';
  panel.style.left=Math.max(8,Math.min(left,editor.clientWidth-panel.offsetWidth-8))+'px';
  panel.style.top=Math.max(8,Math.min(top+row,editor.clientHeight-panel.offsetHeight-8))+'px';
 }
 function hide(){panel.hidden=true;result=null;editor.removeAttribute('aria-activedescendant');}
 function render(){
  panel.replaceChildren(...result.items.map((item,i)=>{const b=document.createElement('button');b.type='button';b.id='member-option-'+i;b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===chosen));b.textContent=item[1]+' — '+item[2];b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',()=>accept(i));return b;}));
  panel.hidden=false;editor.setAttribute('aria-activedescendant','member-option-'+chosen);
  positionPanel();
  const active=panel.children[chosen];
  panel.scrollTop=Math.max(0,active.offsetTop-panel.clientHeight/2);
 }
 function update(){
  if(!/\.(cpp|hpp|h)$/.test(document.getElementById('file-select').value)||editor.selectionStart!==editor.selectionEnd)return hide();
  result=suggest(editor.value,editor.selectionStart);chosen=0;if(!result?.items.length)return hide();render();
 }
 function accept(index){
  const insertion=result.items[index][1],start=result.start;
  const text=editor.value[editor.selectionStart]==='('?result.items[index][0]:insertion;
  editor.setRangeText(text,start,editor.selectionStart,'end');
  const open=text.indexOf('(');if(open>=0&&text.length>open+2)editor.setSelectionRange(start+open+1,start+text.length-1);
  hide();editor.focus();editor.dispatchEvent(new Event('input',{bubbles:true}));hide();
 }
 editor.addEventListener('input',update);
 editor.addEventListener('keydown',event=>{
  if(event.isComposing)return;
  if(event.ctrlKey&&event.code==='Space'){event.preventDefault();update();return;}
  if(!result)return;
  if(event.key==='Escape'){event.preventDefault();hide();return;}
  if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();chosen=(chosen+(event.key==='ArrowDown'?1:-1)+result.items.length)%result.items.length;render();return;}
  if((event.key==='Tab'&&!event.shiftKey)||event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();accept(chosen);return;}
  if(['ArrowLeft','ArrowRight','Home','End','Tab'].includes(event.key))hide();
 },true);
 editor.addEventListener('blur',hide);editor.addEventListener('click',hide);
 editor.addEventListener('scroll',()=>{if(result)positionPanel();});window.addEventListener('resize',()=>{if(result)positionPanel();});
 document.getElementById('file-select').addEventListener('change',hide);window.addEventListener('hashchange',hide);
 document.getElementById('reset').addEventListener('click',hide);
})(typeof window==='undefined'?globalThis:window);
