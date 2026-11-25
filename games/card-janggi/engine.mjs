// The broadcast's scheduling rules with an explicitly recreated 5×5 board/card set.
export const CARDS=[
 {id:'step',name:'Step',detail:'One square straight',moves:[[-1,0],[1,0],[0,-1],[0,1]]},
 {id:'diagonal',name:'Diagonal',detail:'One square diagonally',moves:[[-1,-1],[-1,1],[1,-1],[1,1]]},
 {id:'leap',name:'Straight leap',detail:'Two squares straight',moves:[[-2,0],[2,0],[0,-2],[0,2]]},
 {id:'knight',name:'Knight',detail:'An L-shaped jump',moves:[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]},
 {id:'long-diagonal',name:'Diagonal leap',detail:'Two squares diagonally',moves:[[-2,-2],[-2,2],[2,-2],[2,2]]}
];
export const byId=id=>CARDS.find(c=>c.id===id),clone=g=>JSON.parse(JSON.stringify(g));
export const home=p=>p===0?22:2;
export function initialBoard(){return [{id:'0k',owner:0,king:true,cell:22},{id:'1k',owner:1,king:true,cell:2},...[16,17,18].map((cell,i)=>({id:`0p${i}`,owner:0,king:false,cell})),...[6,7,8].map((cell,i)=>({id:`1p${i}`,owner:1,king:false,cell}))];}
export function newMatch({mode='cpu',timed=false,starter=0}={}){return {version:1,mode,timed,starter,player:starter,planner:starter,phase:mode==='local'?'gate':'plan',initial:true,round:1,scores:[0,0],board:initialBoard(),queues:[[],[]],indices:[0,0],cycles:[0,0],draft:[],deadline:null,penalty:false,log:[],winner:null,reason:''};}
export const planLength=(g,p)=>g.cycles[p]===0&&p!==g.starter?4:5;
export const currentCard=(g,p)=>g.queues[p][g.indices[p]];
export const controller=g=>g.phase==='plan'||g.phase==='gate'?g.planner:g.penalty?1-g.player:g.player;
export function openGate(g){if(g.phase==='gate')g.phase='plan';}
export function lockOrder(g,order){
 if(g.phase!=='plan')return {ok:false,error:'Start the planning phase first.'};const p=g.planner;
 if(order.length!==planLength(g,p)||new Set(order).size!==order.length||order.some(id=>!byId(id)))return {ok:false,error:`Choose ${planLength(g,p)} different cards in order.`};
 g.queues[p]=[...order];g.indices[p]=0;g.draft=[];
 if(g.initial&&g.queues[1-p].length===0){g.planner=1-p;g.phase=g.mode==='local'?'gate':'plan';}
 else{g.player=g.initial?g.starter:g.resumePlayer;g.initial=false;g.phase='move';g.deadline=g.timed?Date.now()+90000:null;}
 return {ok:true};
}
export function legalMoves(board,p,card){
 const moves=byId(card)?.moves||[],result=[];
 for(const piece of board.filter(x=>x.owner===p))for(const [dr,dc] of moves){const r=Math.floor(piece.cell/5)+dr,c=piece.cell%5+dc,to=r*5+c;if(r>=0&&r<5&&c>=0&&c<5&&!board.some(x=>x.cell===to&&x.owner===p))result.push({piece:piece.id,from:piece.cell,to});}
 return result;
}
export function moveBoard(board,move){const moved=clone(board).filter(p=>p.cell!==move.to);moved.find(p=>p.id===move.piece).cell=move.to;return moved;}
export function winnerAfter(board,move,p){const moving=board.find(x=>x.id===move.piece),captured=board.find(x=>x.cell===move.to);return captured?.king||(moving?.king&&move.to===home(1-p))?p:null;}
export function finishRound(g,winner,reason){if(['roundOver','matchOver'].includes(g.phase))return;g.scores[winner]++;g.phase=g.scores[winner]===2?'matchOver':'roundOver';g.winner=winner;g.reason=reason;g.deadline=null;g.penalty=false;}
function consume(g){
 const p=g.player;g.indices[p]++;g.deadline=null;g.penalty=false;
 if(g.indices[p]>=g.queues[p].length){g.cycles[p]++;g.queues[p]=[];g.indices[p]=0;g.planner=p;g.resumePlayer=1-p;g.phase=g.mode==='local'?'gate':'plan';}
 else{g.player=1-p;g.phase='move';g.deadline=g.timed?Date.now()+90000:null;}
}
export function playMove(g,piece,to){
 if(g.phase!=='move')return {ok:false,error:'Finish choosing cards first.'};
 const move=legalMoves(g.board,g.player,currentCard(g,g.player)).find(m=>m.piece===piece&&m.to===to);if(!move)return {ok:false,error:'Choose a highlighted destination.'};
 const winner=winnerAfter(g.board,move,g.player),captured=g.board.find(x=>x.cell===to),card=currentCard(g,g.player);
 g.log.push({player:g.player,card,...move,captured:captured?.king?'king':captured?'pawn':null,penalty:g.penalty});g.board=moveBoard(g.board,move);
 if(winner!==null){finishRound(g,winner,captured?.king?'The opposing king was captured.':'The king reached the opposing home square.');}else consume(g);
 return {ok:true};
}
export function pass(g){if(g.phase!=='move'||legalMoves(g.board,g.player,currentCard(g,g.player)).length)return false;g.log.push({player:g.player,card:currentCard(g,g.player),pass:true});consume(g);return true;}
export function expireClock(g,now=Date.now()){
 if(g.phase==='move'&&g.timed&&!g.penalty&&g.deadline&&now>=g.deadline){g.penalty=true;g.deadline=null;return true;}return false;
}
export function nextRound(g){const score=[...g.scores],round=g.round+1,starter=1-g.starter;Object.assign(g,newMatch({mode:g.mode,timed:g.timed,starter}),{scores:score,round});}
function value(board,p){
 if(!board.some(x=>x.owner===p&&x.king))return -100000;if(!board.some(x=>x.owner===1-p&&x.king))return 100000;
 let sum=0;for(const x of board){const sign=x.owner===p?1:-1;if(!x.king)sum+=sign*120;else{const goal=home(1-x.owner),dist=Math.abs(Math.floor(x.cell/5)-Math.floor(goal/5))+Math.abs(x.cell%5-goal%5);sum+=sign*(25-dist*9);}}return sum;
}
// The opponent's future cards are deliberately excluded from the AI's input.
export function publicPosition(g,p){return {board:clone(g.board),player:p,ownCard:currentCard(g,p),opponentCard:g.initial?null:currentCard(g,1-p),ownNext:g.queues[p][g.indices[p]+1]||null};}
export function chooseMove(position){
 const {board,player:p,ownCard,opponentCard,ownNext}=position,moves=legalMoves(board,p,ownCard);let best=null,bestScore=-Infinity;
 for(const m of moves){
  if(winnerAfter(board,m,p)!==null)return m;
  const b=moveBoard(board,m),replies=legalMoves(b,1-p,opponentCard);let minimum=value(b,p);
  for(const reply of replies){
   if(winnerAfter(b,reply,1-p)!==null){minimum=-100000;break;}
   const next=moveBoard(b,reply);let future=value(next,p);
   if(ownNext){const own=legalMoves(next,p,ownNext);if(own.length)future=Math.max(...own.map(x=>winnerAfter(next,x,p)!==null?10000:value(moveBoard(next,x),p)));}
   minimum=Math.min(minimum,future);
  }
  const score=minimum+Math.random()*.5;if(score>bestScore){bestScore=score;best=m;}
 }
 return best;
}
export function chooseOrder(g,p){
 const shuffled=CARDS.map(c=>c.id).sort(()=>Math.random()-.5),opponentCard=g.initial?null:currentCard(g,1-p);
 const ranked=shuffled.map(id=>{const m=chooseMove({board:g.board,player:p,ownCard:id,opponentCard});return {id,score:m?(winnerAfter(g.board,m,p)!==null?1e5:value(moveBoard(g.board,m),p)):-1e6};}).sort((a,b)=>b.score-a.score);
 return [ranked[0].id,...shuffled.filter(id=>id!==ranked[0].id)].slice(0,planLength(g,p));
}
export function choosePenaltyMove(g){
 const p=g.player,moves=legalMoves(g.board,p,currentCard(g,p));
 return moves.sort((a,b)=>{
  const va=winnerAfter(g.board,a,p)!==null?1e6:value(moveBoard(g.board,a),p),vb=winnerAfter(g.board,b,p)!==null?1e6:value(moveBoard(g.board,b),p);return va-vb;
 })[0]||null;
}
