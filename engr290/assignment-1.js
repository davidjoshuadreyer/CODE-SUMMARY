"use strict";
document.querySelectorAll("[data-tex]").forEach(node=>{if(window.katex)katex.render(node.dataset.tex,node,{displayMode:true,throwOnError:false,strict:"warn"});});
