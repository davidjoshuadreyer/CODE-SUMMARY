/* Shared safe text + TeX formatter. Works at build time and in the browser. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('katex'));
 else root.StudyMath=factory(root.katex);
})(typeof globalThis==='object'?globalThis:this,function(katex){
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function format(value){
  const text=String(value);let output='',last=0;
  const pattern=/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;
  for(const match of text.matchAll(pattern)){
   output+=escape(text.slice(last,match.index));
   const display=match[1]!==undefined;
   output+=katex.renderToString(match[1]??match[2],{displayMode:display,throwOnError:true,trust:false,strict:'error',output:'htmlAndMathml'});
   last=match.index+match[0].length;
  }
  return output+escape(text.slice(last));
 }
 return {format};
});
