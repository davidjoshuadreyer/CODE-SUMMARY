import {solve,computerMove} from './engine.mjs';
self.onmessage=({data})=>{try{const result=data.kind==='move'?computerMove(data.board,data.opening,data.options):solve(data.board,data.options);self.postMessage({id:data.id,result});}catch(e){self.postMessage({id:data.id,error:e.message});}};
