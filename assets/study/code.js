(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./math.js'));
 else root.StudyFormat=factory(root.StudyMath);
})(typeof globalThis==='object'?globalThis:this,function(math){
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return {format(value){return String(value).split(/(`[^`]+`)/g).map(s=>s.startsWith('`')?'<code>'+escape(s.slice(1,-1))+'</code>':math.format(s)).join('');}};
});
