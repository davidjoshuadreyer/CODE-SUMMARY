export const LETTERS='ABCDEFGHIJKLMN';
export const COLORS=['#b59aff','#73d3c6','#f4b46a','#ed8cae','#83b9f8','#d8db75','#cb9cdf','#f28a7e','#9dd1a2','#87d9ef','#dab592','#b2baf2','#f5a5d0','#b5d2c9'];
export const colorOf = c => c==='X'?'#e9e5dc':c==='Y'?'#b5c3d4':COLORS[LETTERS.indexOf(c)];
export const LAYOUTS=[
 {name:'Open canvas',description:'A clear board. Every square is a possibility.',size:7,blocked:[],fixed:[]},
 {name:'Edge of reason',description:'Two fixed pairs frame the playing field.',size:7,blocked:[],fixed:[['X',0],['X',6],['Y',42],['Y',48]]},
 {name:'The long way',description:'A corner-to-corner pair cuts across your plans.',size:7,blocked:[],fixed:[['X',0],['X',48]]},
 {name:'Courtyard',description:'Clipped corners leave less room to manoeuvre.',size:7,blocked:[0,1,5,6,7,13,35,41,42,43,47,48],fixed:[]},
 {name:'Narrow gates',description:'Two walls make the centre matter.',size:7,blocked:[3,10,38,45],fixed:[['X',0],['X',42],['Y',6],['Y',48]]}
];
export const clone = x=>JSON.parse(JSON.stringify(x));
export function neighbors(cell,size){const r=Math.floor(cell/size),c=cell%size;return [r>0?cell-size:-1,c<size-1?cell+1:-1,r<size-1?cell+size:-1,c>0?cell-1:-1].filter(x=>x>=0);}
export function groups(board){const result={};board.pieces.forEach(p=>(result[p.color]??=[]).push(p.cell));return result;}
export function boardFor(layout=0){const t=LAYOUTS[layout];return {size:t.size,blocked:[...t.blocked],pieces:t.fixed.map(([color,cell])=>({color,cell,fixed:true}))};}
export function newMatch({mode='cpu',timed=false,layout=0,starter=0}={}){return {version:1,mode,timed,layout,round:1,scores:[0,0],player:starter,starter,phase:'place',board:boardFor(layout),draft:[],moveCount:0,lastPlayer:null,paths:{},added:[],log:[],deadline:timed?Date.now()+180000:null,winner:null,reason:'',nextChooser:null};}
export const requiredPieces=game=>game.moveCount===0?1:2;
export function canPlace(board,draft,color,cell){
 if(!LETTERS.includes(color))return 'Choose a piece from A to N.';
 if(!Number.isInteger(cell)||cell<0||cell>=board.size**2||board.blocked.includes(cell))return 'Choose an open square.';
 if(board.pieces.some(p=>p.cell===cell)||draft.some(p=>p.cell===cell))return 'That square already has a piece.';
 if(board.pieces.filter(p=>p.color===color).length+draft.filter(p=>p.color===color).length>=2)return 'Both pieces of that colour are already in play.';
 if(draft.some(p=>p.color===color))return 'The two pieces in a turn must be different colours.';
 return '';
}
export function commitMove(game){
 if(game.phase!=='place')return {ok:false,error:'This is not a placement turn.'};
 if(game.draft.length!==requiredPieces(game))return {ok:false,error:`Place ${requiredPieces(game)} ${requiredPieces(game)===1?'piece':'different colours'} first.`};
 const checked=[];for(const p of game.draft){const error=canPlace(game.board,checked,p.color,p.cell);if(error)return {ok:false,error};checked.push(p);}
 game.board.pieces.push(...clone(game.draft));game.log.push({player:game.player,pieces:clone(game.draft)});game.draft=[];game.lastPlayer=game.player;game.player=1-game.player;game.moveCount++;game.deadline=game.timed?Date.now()+180000:null;return {ok:true};
}
export function challenge(game){
 if(game.phase!=='place'||game.lastPlayer===null)return false;
 game.draft=[];game.challenger=game.player;game.player=game.lastPlayer;game.phase='proof';game.paths={};game.added=[];game.deadline=game.timed?Date.now()+300000:null;return true;
}
export function proofBoard(game){return {...game.board,pieces:[...game.board.pieces,...game.added]};}
export function validateProof(board,paths){
 const pairs=groups(board),used=new Set();
 for(const [color,ends] of Object.entries(pairs)){
   if(ends.length!==2)return {ok:false,error:`Place the missing ${color} piece before proving the board.`};
   const p=paths[color];if(!Array.isArray(p)||p.length<6)return {ok:false,error:`${color} needs a path of at least 6 squares, including its pieces.`};
   if(!ends.includes(p[0])||!ends.includes(p.at(-1))||p[0]===p.at(-1))return {ok:false,error:`Connect both ${color} pieces.`};
   const own=new Set();
   for(let i=0;i<p.length;i++){
     const c=p[i];
     if(!Number.isInteger(c)||c<0||c>=board.size**2||board.blocked.includes(c))return {ok:false,error:`${color} crosses a blocked square.`};
     if(used.has(c)||own.has(c))return {ok:false,error:'Paths cannot cross, share squares, or loop back on themselves.'};
     if(i&&!neighbors(p[i-1],board.size).includes(c))return {ok:false,error:'Paths must move one square up, down, left, or right.'};
     if(board.pieces.some(q=>q.cell===c&&q.color!==color))return {ok:false,error:`${color} runs through another piece.`};
     own.add(c);
   }
   own.forEach(c=>used.add(c));
 }
 if(!Object.keys(pairs).length)return {ok:false,error:'Place a piece first.'};
 return {ok:true};
}
export function finishRound(game,winner,reason){if(['roundOver','matchOver'].includes(game.phase))return;game.phase=game.scores[winner]+1>=3?'matchOver':'roundOver';game.scores[winner]++;game.winner=winner;game.nextChooser=1-winner;game.reason=reason;game.deadline=null;game.draft=[];}
export function nextRound(game,starter){game.round++;game.layout=(game.layout+1)%LAYOUTS.length;game.board=boardFor(game.layout);game.player=starter;game.starter=starter;game.moveCount=0;game.lastPlayer=null;game.paths={};game.added=[];game.draft=[];game.log=[];game.phase='place';game.winner=null;game.reason='';game.deadline=game.timed?Date.now()+180000:null;}

// Bounded constraint search. A budget limit is "unknown", never proof of impossibility.
export function solve(board,{budgetMs=600,nodeLimit=350000}={}){
 const started=performance.now(), end=started+budgetMs,n=board.size, count=n*n, pairs=Object.entries(groups(board));
 const blocked=new Set(board.blocked), endpoints=new Map(board.pieces.map(p=>[p.cell,p.color]));
 const occupied=new Set(blocked), paths={}, adjacent=Array.from({length:count},(_,i)=>neighbors(i,n));
 let nodes=0,limited=false;
 if(pairs.length*6>count-blocked.size)return {status:'impossible',nodes:0};
 const check=()=>{nodes++;if(nodes>nodeLimit||(nodes%256===0&&performance.now()>end)){limited=true;return false;}return true;};
 const distance=(a,b)=>Math.abs(Math.floor(a/n)-Math.floor(b/n))+Math.abs(a%n-b%n);
 function reachable(start,color,target=null){
   const seen=new Set([start]),queue=[start];
   for(let i=0;i<queue.length;i++)for(const v of adjacent[queue[i]])if(!seen.has(v)&&!occupied.has(v)&&(!endpoints.has(v)||endpoints.get(v)===color)){seen.add(v);queue.push(v);}
   return {size:seen.size,target:target===null||seen.has(target)};
 }
 function search(todo){
   if(!check())return false;
   if(!todo.length)return true;
   if(count-occupied.size<todo.length*6)return false;
   let selected=0,best=Infinity;
   for(let i=0;i<todo.length;i++){
     const [color,ends]=todo[i],reach=reachable(ends[0],color,ends[1]??null);
     if(reach.size<6||!reach.target)return false;
     const metric=reach.size+(ends.length===1?count:0)- (ends.length===2?distance(...ends):0);
     if(metric<best){best=metric;selected=i;}
   }
   const [color,ends]=todo[selected],rest=todo.filter((_,i)=>i!==selected),start=ends[0],target=ends[1]??null;
   const maxLength=count-occupied.size-6*rest.length,minimum=target===null?6:Math.max(6,distance(start,target)+1);
   for(let length=minimum;length<=maxLength;length++){
     if(target===null&&length>6)break;
     if(target!==null&&(length-1-distance(start,target))%2)continue;
     const path=[start],visited=new Set([start]);
     function walk(cell){
       if(!check())return false;
       if(path.length===length){
         if(target!==null&&cell!==target)return false;
         path.forEach(c=>occupied.add(c));paths[color]=[...path];
         if(search(rest))return true;
         path.forEach(c=>occupied.delete(c));delete paths[color];return false;
       }
       if(cell===target)return false;
       if(target!==null&&distance(cell,target)>length-path.length)return false;
       let options=adjacent[cell].filter(c=>!occupied.has(c)&&!visited.has(c)&&(!endpoints.has(c)||c===target));
       if(target!==null)options.sort((a,b)=>distance(a,target)-distance(b,target));
       for(const c of options){visited.add(c);path.push(c);if(walk(c))return true;path.pop();visited.delete(c);if(limited)return false;}
       return false;
     }
     if(walk(start))return true;
     if(limited)return false;
   }
   return false;
 }
 const solved=search(pairs);
 return {status:solved?'solved':limited?'unknown':'impossible',paths:solved?paths:null,nodes};
}
export function completeProof(board,paths){const known=groups(board);return Object.entries(paths).filter(([c])=>known[c].length===1).map(([color,path])=>({color,cell:path.at(-1)}));}

export function computerMove(board,opening=false,{budgetMs=1800}={}){
 const until=performance.now()+budgetMs,current=solve(board,{budgetMs:Math.min(700,budgetMs/2)});
 if(current.status!=='solved'&&board.pieces.length)return {action:'challenge',uncertain:current.status==='unknown'};
 const count=board.size**2,used=new Set([...board.blocked,...board.pieces.map(p=>p.cell)]),free=Array.from({length:count},(_,i)=>i).filter(i=>!used.has(i));
 const g=groups(board),available=[...LETTERS].filter(c=>(g[c]?.length||0)<2),single=available.filter(c=>g[c]?.length===1),fresh=available.filter(c=>!g[c]);
 const pick=a=>a[Math.floor(Math.random()*a.length)],needed=opening?1:2;
 let fallback=null,chosen=null;
 for(let attempt=0;attempt<90&&performance.now()<until;attempt++){
   const colors=attempt%3===0?[...single,...fresh]:[...available].sort(()=>Math.random()-.5);
   if(colors.length<needed||free.length<needed)break;
   const move=[],taken=new Set();
   for(let j=0;j<needed;j++){
     const color=colors[j],fromProof=current.paths?.[color]?.at(-1);
     let cell=attempt<3&&g[color]?.length===1&&fromProof!==undefined?fromProof:pick(free.filter(c=>!taken.has(c)));
     if(taken.has(cell))cell=pick(free.filter(c=>!taken.has(c)));
     taken.add(cell);move.push({color,cell});
   }
   fallback??=move;
   const result=solve({...board,pieces:[...board.pieces,...move]},{budgetMs:Math.max(20,Math.min(180,until-performance.now()))});
   if(result.status==='solved'){
     chosen=move;
     // Prefer completing a pair and opening a new one, which creates room pressure.
     if(move.some(p=>g[p.color]?.length===1)||attempt>5)break;
   }
 }
 return chosen?{action:'move',pieces:chosen}:fallback?{action:'move',pieces:fallback,risky:true}:{action:'challenge',uncertain:true};
}

export function expireClock(game,now=Date.now()) {
 if(!game.timed||!game.deadline||!['place','proof'].includes(game.phase)||now<game.deadline)return false;
 finishRound(game,1-game.player,game.phase==='proof'?'The proof clock ran out.':'The placement clock ran out before the move was confirmed.');
 return true;
}
