(() => {
 const $=id=>document.getElementById(id),editor=$('source-code');let currentId='',currentFile='',cpp=false;
 function sync(){
  $('code-colours').style.transform=`translate(${-editor.scrollLeft}px, ${-editor.scrollTop}px)`;
  $('line-numbers').style.transform=`translateY(${-editor.scrollTop}px)`;
 }
 function line(){
  const index=editor.value.slice(0,editor.selectionStart).split('\n').length-1;
  $('line-title').textContent='Line '+(index+1)+' in plain English';
  $('line-explanation').textContent=cpp?CppGuide.explain(editor.value,index):'This file is not C++ source. Text data is used by the program; MATLAB scripts need MATLAB to run.';
  $('previous-line').disabled=index===0;$('next-line').disabled=index>=editor.value.split('\n').length-1;
  $('line-numbers').replaceChildren(...editor.value.split('\n').map((_,i)=>{const span=document.createElement('span');span.textContent=i+1;span.className=i===index?'current-line':'';return span;}));
 }
 function mode(){
  const on=$('beginner-mode').checked;
  for(const id of ['beginner-overview','line-help','colour-key'])$(id).hidden=!on;
  $('first-steps').hidden=!on;
 }
 function refresh(id=currentId,file=currentFile){
  const changed=id!==currentId||file!==currentFile;
  currentId=id;currentFile=file;cpp=/\.(cpp|hpp|h)$/.test(file);$('colour-editor').classList.toggle('has-colours',cpp);
  if(changed&&cpp){let offset=0;for(const token of CppGuide.tokens(editor.value)){if(token.kind!=='comment'&&token.text.trim()){offset+=token.text.search(/\S/);break;}offset+=token.text.length;}editor.setSelectionRange(offset,offset);editor.scrollTop=0;editor.scrollLeft=0;}
  $('code-colours').innerHTML=cpp?CppGuide.highlight(editor.value)+'\n ':'';
  const guide=CppGuide.overview(id)||CppGuide.overview('scratch');
  $('beginner-goal').textContent=cpp?guide[0]:'This is a supporting file';
  $('beginner-idea').textContent=cpp?guide[1]:'Data files hold values the program reads. MATLAB scripts use a different language, so the C++ colour key does not apply.';
  $('beginner-try').textContent=cpp?guide[2]:'Read the lesson or lab instructions to see how this file is used.';
  line();sync();mode();
 }
 function move(delta){
  const lines=editor.value.split('\n'),current=editor.value.slice(0,editor.selectionStart).split('\n').length-1,target=Math.max(0,Math.min(lines.length-1,current+delta));
  const at=lines.slice(0,target).reduce((sum,s)=>sum+s.length+1,0);editor.focus();editor.setSelectionRange(at,at);
  const height=parseFloat(getComputedStyle(editor).lineHeight),top=target*height;
  if(top<editor.scrollTop||top>editor.scrollTop+editor.clientHeight-height*2)editor.scrollTop=Math.max(0,top-height*3);
  line();sync();
 }
 $('previous-line').addEventListener('click',()=>move(-1));$('next-line').addEventListener('click',()=>move(1));
 document.querySelector('a[href="#first-steps"]').addEventListener('click',()=>{$('first-steps').open=true;});
 editor.addEventListener('scroll',sync);for(const event of ['click','keyup','select'])editor.addEventListener(event,line);
 $('beginner-mode').addEventListener('change',()=>{mode();try{localStorage.setItem('comp139e-beginner-mode',String($('beginner-mode').checked));}catch{}});
 try{$('beginner-mode').checked=localStorage.getItem('comp139e-beginner-mode')!=='false';}catch{}
 window.CppDesk={refresh};mode();
})();
