import {LETTERS,LAYOUTS,colorOf,clone,neighbors,groups,newMatch,requiredPieces,canPlace,commitMove,challenge,proofBoard,validateProof,finishRound,nextRound,completeProof,expireClock} from './engine.mjs';
const $=s=>document.querySelector(s), key='tesselate-color-link-v1';
let game=newMatch(), hasGame=false,selected='A',activePath=null,dragging=false,lastDrag=-1,busy=false,inspect=false,worker=null,workId=0,storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.version===1&&['cpu','local'].includes(saved.mode)&&Array.isArray(saved.board?.pieces)&&saved.board.size===7&&Array.isArray(saved.scores)&&saved.scores.length===2&&['place','proof','roundOver','matchOver'].includes(saved.phase)){game=saved;hasGame=true;}}catch{}
const playerName=p=>game.mode==='cpu'?(p===0?'You':'Computer'):`Player ${p+1}`;
const possessive=p=>game.mode==='cpu'&&p===0?'Your':`${playerName(p)}’s`;
const isHuman=()=>game.mode==='local'||game.player===0;
const coord=c=>`${String.fromCharCode(65+c%game.board.size)}${Math.floor(c/game.board.size)+1}`;
const done=()=>['roundOver','matchOver'].includes(game.phase);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){if(!hasGame)return;try{localStorage.setItem(key,JSON.stringify(game));}catch{storageOK=false;}}
function say(text,error=false){$('#message').textContent=text;$('#message').classList.toggle('error',error);}
function button(id,text,kind='primary',disabled=false){return `<button id="${id}" class="${kind}" ${disabled?'disabled':''}>${text}</button>`;}
function bind(id,fn){document.getElementById(id)?.addEventListener('click',fn);}
function chooseDefault(){
 const g=groups(game.phase==='proof'?proofBoard(game):game.board);
 if(game.phase==='proof')selected=Object.keys(g).find(c=>g[c].length===1)||Object.keys(g)[0]||'A';
 else selected=[...LETTERS].find(c=>(g[c]?.length||0)<2&&!game.draft.some(p=>p.color===c))||'A';
 activePath=null;
}
function renderBoard(){
 const board=game.phase==='proof'||done()?proofBoard(game):game.board;
 const shown=[...board.pieces,...game.draft],lookup=new Map(shown.map(p=>[p.cell,p]));
 const last=game.log.at(-1)?.pieces||[];
 $('#board').className=`board ${game.phase==='proof'?'proof':''} ${done()?'inspect':''}`;
 const paths=game.paths||{};
 $('#board').innerHTML=`<svg class="path-layer" viewBox="0 0 7 7" aria-hidden="true">${Object.entries(paths).map(([c,path])=>`<polyline stroke="${colorOf(c)}" points="${path.map(i=>`${i%7+.5},${Math.floor(i/7)+.5}`).join(' ')}"/>`).join('')}</svg>`+Array.from({length:49},(_,cell)=>{
   const p=lookup.get(cell),blocked=board.blocked.includes(cell),draft=game.draft.some(q=>q.cell===cell),added=game.added.some(q=>q.cell===cell),isLast=last.some(q=>q.cell===cell);
   const pathColor=Object.keys(paths).find(c=>paths[c].includes(cell));
   return `<button class="cell ${blocked?'blocked':''} ${draft?'draft':''} ${added?'added':''} ${p?.fixed?'fixed':''} ${isLast?'last':''}" data-cell="${cell}" aria-label="${coord(cell)}${blocked?', blocked':p?`, ${p.color}${draft?', uncommitted':''}${p.fixed?', fixed piece':''}`:pathColor?`, ${pathColor} path`:', empty'}" ${blocked?'aria-disabled="true"':''}>${p?`<span class="token" style="--piece:${colorOf(p.color)}">${p.color}</span>`:''}</button>`;
 }).join('');
}
function renderTray(){
 const board=game.phase==='proof'||done()?proofBoard(game):game.board,g=groups(board),proof=game.phase==='proof'||done();
 const letters=proof?Object.keys(g).sort():[...LETTERS];
 $('#tray-title').textContent=proof?'Connections':'The pieces';$('#tray-note').textContent=proof?`${Object.keys(game.paths).filter(c=>validPath(c)).length} / ${letters.length} linked`:'Shared pool';
 $('#tray').innerHTML=letters.map(c=>{
   const remaining=2-(g[c]?.length||0)-game.draft.filter(p=>p.color===c).length;
   const disabled=!hasGame||busy||done()||(!proof&&(remaining===0||game.draft.some(p=>p.color===c)));
   const info=proof?(g[c].length===1?'mate':`${game.paths[c]?.length||0} sq`):'●'.repeat(Math.max(0,remaining))||'—';
   return `<button class="piece-button ${selected===c?'selected':''} ${proof&&validPath(c)?'complete':''}" data-color="${c}" style="--piece:${colorOf(c)}" aria-label="${c}, ${proof?(g[c].length===1?'place missing mate':`${game.paths[c]?.length||0} squares in path`):`${remaining} remaining`}" aria-pressed="${selected===c}" ${disabled?'disabled':''}>${c}<span class="supply ${remaining===0&&!proof?'empty':''}">${info}</span></button>`;
 }).join('');
 $('#tray-hint').textContent=done()?'Completed paths stay visible for review.':proof?'Select a letter to see or redraw its connection.':'Two pieces per colour. Letters identify each pair.';
 $('#tray').querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.color;activePath=null;renderTray();renderInstructions();say(game.phase==='proof'?`Selected ${selected}. ${g[selected].length===1?'Tap an empty square for its mate.':'Start drawing from either piece.'}`:`Selected ${selected}. Tap an empty square.`);}));
}
function validPath(color){
 const board=proofBoard(game),ends=board.pieces.filter(p=>p.color===color),path=game.paths[color];
 return ends.length===2&&path?.length>=6&&ends.some(p=>p.cell===path[0])&&ends.some(p=>p.cell===path.at(-1))&&path[0]!==path.at(-1);
}
function renderInstructions(){
 let title='',instruction='',phase='';
 if(!hasGame){title='Take your seat.';phase='A GAME OF POSSIBILITIES';instruction='Play the computer or challenge a friend on the same screen.';}
 else if(busy){title='Computer is thinking.';phase=game.phase==='proof'?'PROVING THE BOARD':'READING THE BOARD';instruction=game.phase==='proof'?'Finding a separate path for every colour.':'Looking for a move—or a reason to challenge.';}
 else if(done()){title=`${playerName(game.winner)} ${game.mode==='cpu'&&game.winner===0?'win':'wins'}${game.phase==='matchOver'?' the match':' the round'}.`;phase=game.phase==='matchOver'?'MATCH COMPLETE':'ROUND COMPLETE';instruction=game.reason;}
 else if(game.phase==='proof'){
   const missing=Object.entries(groups(proofBoard(game))).filter(([,p])=>p.length===1).map(([c])=>c);
   title=`${possessive(game.player)} proof.`;phase='IMPOSSIBLE? PROVE IT.';
   instruction=missing.length?`Add the missing ${missing.join(', ')} ${missing.length===1?'mate':'mates'} on empty squares. Then draw every connection.`:'Start on a piece. Drag or click through adjacent squares to its mate. Each path needs 6+ squares.';
 }else{title=`${possessive(game.player)} turn.`;phase=game.moveCount===0?'THE OPENING MOVE':'MAKE YOUR MOVE';instruction=game.moveCount===0?'Choose a colour, then place one piece anywhere open.':'Place two different colours. Or challenge the previous move.';}
 $('#turn-title').textContent=title;$('#phase-label').textContent=phase;$('#instruction').textContent=instruction;
 $('#progress-dots').innerHTML=game.phase==='place'&&hasGame?Array.from({length:requiredPieces(game)},(_,i)=>`<span class="${i<game.draft.length?'filled':''}"></span>`).join(''):'';
}
function renderActions(){
 const a=$('#actions');
 if(!hasGame){a.innerHTML=button('start-menu','Choose your game');bind('start-menu',openNew);return;}
 if(done()){a.innerHTML=button('result-button',game.phase==='matchOver'?'Match result':'Continue match');bind('result-button',()=>{inspect=false;renderOverlay();});return;}
 if(busy){a.innerHTML='<button class="secondary" disabled><span class="thinking"></span>Thinking…</button>';return;}
 if(game.phase==='place'){
   a.innerHTML=button('commit-button',`Confirm ${requiredPieces(game)===1?'opening piece':'move'}`,'primary',game.draft.length!==requiredPieces(game))+`<div class="minor-actions">${button('undo-button','Undo placement','outline',!game.draft.length)}${button('concede-button','Concede round','quiet')}</div>`+button('challenge-button','Declare impossible','challenge-button',game.lastPlayer===null);
   bind('commit-button',()=>{if(checkClock())return;const r=commitMove(game);if(!r.ok)return say(r.error,true);chooseDefault();say(`${possessive(game.lastPlayer)} move is locked in.`);save();render();scheduleComputer();});
   bind('undo-button',()=>{game.draft.pop();chooseDefault();save();render();say('Last placement removed.');});
   bind('challenge-button',()=>{if(checkClock())return;if(challenge(game)){chooseDefault();save();render();say(`${playerName(game.challenger)} called impossible. ${playerName(game.player)} must prove every pair.`);scheduleComputer();}});
 }else{
   a.innerHTML=button('verify-button','Submit proof')+`<div class="minor-actions">${button('clear-path','Clear selected path','outline',!game.paths[selected])}${button('clear-proof','Reset proof','outline',!Object.keys(game.paths).length&&!game.added.length)}</div>`+(game.added.some(p=>p.color===selected)?button('move-mate','Reposition selected mate','secondary'):'')+button('concede-button','Concede round','danger');
   bind('verify-button',()=>{if(checkClock())return;const result=validateProof(proofBoard(game),game.paths);if(!result.ok){say(result.error,true);return;}finishRound(game,game.player,'Every pair is connected by a separate path of at least six squares.');finishUI();});
   bind('clear-path',()=>{delete game.paths[selected];activePath=null;save();render();say(`${selected} path cleared.`);});
   bind('clear-proof',()=>{game.paths={};game.added=[];chooseDefault();save();render();say('Proof reset. The original pieces stay in place.');});
   bind('move-mate',()=>{game.added=game.added.filter(p=>p.color!==selected);delete game.paths[selected];activePath=null;save();render();say(`Choose a new square for the ${selected} mate.`);});
 }
 bind('concede-button',()=>$('#confirm-dialog').showModal());
}
function renderOverlay(){
 const el=$('#board-overlay');
 if(hasGame&&(!done()||inspect)){el.hidden=true;return;}
 el.hidden=false;
 if(!hasGame){el.innerHTML=`<div class="overlay-content"><span class="overlay-mark">⌘</span><p class="eyebrow">PLACE. CONNECT. CHALLENGE.</p><h2>Can you see<br>a way through?</h2><p>Keep every pair connected.<br>Know when to call the impossible.</p>${button('overlay-start','Let’s play')}</div>`;bind('overlay-start',openNew);return;}
 const match=game.phase==='matchOver',humanChooses=game.mode==='local'||game.nextChooser===0;
 el.innerHTML=`<div class="overlay-content"><span class="overlay-mark">${match?'✧':'◇'}</span><p class="eyebrow">${match?'MATCH COMPLETE':`ROUND ${game.round} COMPLETE`}</p><h2>${playerName(game.winner)} ${game.mode==='cpu'&&game.winner===0?'win':'wins'}.</h2><p>${escape(game.reason)}${!match&&humanChooses?`<br><br>${game.mode==='local'?`Player ${game.nextChooser+1} chooses`:'You choose'} who starts next.`:''}</p>${match?button('overlay-new','Play another match'):humanChooses?button('next-first','Next round · go first')+button('next-second','Next round · go second','secondary'):button('next-auto','Next round')}<button class="view-board" id="inspect-board">View the board</button></div>`;
 bind('overlay-new',openNew);bind('next-first',()=>advance(game.nextChooser));bind('next-second',()=>advance(1-game.nextChooser));bind('next-auto',()=>advance(1-game.nextChooser));bind('inspect-board',()=>{inspect=true;renderOverlay();});
}
function render(){
 $('#scoreboard').innerHTML=[0,1].map(p=>`${p===1?'<span class="score-divider">VS</span>':''}<div class="player-score ${hasGame&&game.player===p&&!done()?'active':''}"><span class="player-name">${playerName(p)}</span><div class="score-pips" aria-label="${game.scores[p]} points out of 3">${[0,1,2].map(i=>`<i class="${i<game.scores[p]?'won':''}"></i>`).join('')}</div></div>`).join('');
 $('#round-label').textContent=`ROUND ${game.round} OF 5`;$('#board-name').textContent=LAYOUTS[game.layout].name;
 $('#history-count').textContent=game.log.length;
 $('#history').innerHTML=game.log.map(m=>`<li>${playerName(m.player)}: ${m.pieces.map(p=>`${p.color} at ${coord(p.cell)}`).join(' · ')}</li>`).join('')||'<li>No moves yet.</li>';
 renderBoard();renderTray();renderInstructions();renderActions();renderOverlay();renderClock();
}
function renderClock(){
 const timer=$('#timer');let text=!hasGame?'First to 3':done()?'Round over':game.timed&&game.deadline?formatTime(Math.max(0,game.deadline-Date.now())):'Untimed';
 timer.textContent=text;timer.classList.toggle('urgent',!!game.deadline&&game.deadline-Date.now()<30000&&!done());
}
function formatTime(ms){const s=Math.ceil(ms/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function checkClock(){
 if(!hasGame||!expireClock(game))return false;
 cancelComputer();finishUI();return true;
}
function finishUI(){busy=false;activePath=null;inspect=false;$('#confirm-dialog').close();save();render();say(storageOK?'Round saved.':'Round complete. Browser storage is unavailable.');}
function advance(starter){cancelComputer();nextRound(game,starter);chooseDefault();inspect=false;save();render();say(`${playerName(starter)} starts on ${LAYOUTS[game.layout].name}.`);scheduleComputer();}
function cancelComputer(){workId++;worker?.terminate();worker=null;busy=false;}
function runWorker(kind,board,options){
 return new Promise((resolve,reject)=>{
   const id=++workId;worker?.terminate();worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});
   const timeout=setTimeout(()=>{if(workId!==id)return;worker?.terminate();worker=null;reject(Error('Computer search timed out.'));},12000);
   worker.onmessage=e=>{if(e.data.id!==id||workId!==id)return;clearTimeout(timeout);worker.terminate();worker=null;if(e.data.error)reject(Error(e.data.error));else resolve(e.data.result);};
   worker.onerror=()=>{clearTimeout(timeout);worker?.terminate();worker=null;reject(Error('The computer could not start.'));};
   worker.postMessage({id,kind,board:clone(board),opening:game.moveCount===0,options});
 });
}
async function scheduleComputer(){
 if(!hasGame||game.mode!=='cpu'||game.player!==1||done()||busy||checkClock())return;
 busy=true;render();const match=game;
 try{
   if(game.phase==='proof'){
     const result=await runWorker('solve',game.board,{budgetMs:3500,nodeLimit:2500000});
     if(game!==match||done()||checkClock())return;
     if(result.status==='solved'){
       game.paths=result.paths;game.added=completeProof(game.board,result.paths);
       if(!validateProof(proofBoard(game),game.paths).ok)throw Error('The computer could not complete its proof.');
       finishRound(game,1,'The computer proved every connection. Select “View the board” to inspect the paths.');
     }else finishRound(game,0,result.status==='impossible'?'The computer could not connect every pair. Your challenge succeeds.':'The computer conceded after failing to find a complete proof.');
     finishUI();
   }else{
     const result=await runWorker('move',game.board,{budgetMs:1800});
     if(game!==match||done()||checkClock())return;
     busy=false;
     if(result.action==='challenge'&&game.lastPlayer!==null){challenge(game);chooseDefault();say('The computer called impossible. Show a valid connection for every pair.');}
     else if(result.pieces){game.draft=result.pieces;const valid=commitMove(game);if(!valid.ok)throw Error(valid.error);chooseDefault();say('The computer has placed its pieces. Your move.');}
     else throw Error('The computer could not choose an opening.');
     save();render();
   }
 }catch(e){if(game!==match||done())return;busy=false;say(`${e.message} You can retry or switch to two-player mode.`,true);renderActions();$('#actions').insertAdjacentHTML('afterbegin',button('retry-cpu','Retry computer','secondary'));bind('retry-cpu',scheduleComputer);}
}
function openNew(){
 $('#resume-note').textContent=hasGame?'Starting a new match replaces the current match.':'Progress stays in this browser.';
 $('#new-dialog').showModal();
}
$('#new-form').addEventListener('submit',e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);cancelComputer();const starter=crypto.getRandomValues(new Uint8Array(1))[0]%2;
 game=newMatch({mode:f.get('mode'),timed:f.has('timed'),layout:Number(f.get('layout')),starter});hasGame=true;inspect=false;chooseDefault();$('#new-dialog').close();save();render();say(`Coin toss: ${playerName(starter)} ${game.mode==='cpu'&&starter===0?'start':'starts'}.`);scheduleComputer();
});
$('#rules-button').addEventListener('click',()=>$('#rules-dialog').showModal());$('#new-button').addEventListener('click',openNew);
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
$('#confirm-concede').addEventListener('click',()=>{if(checkClock())return;finishRound(game,1-game.player,`${playerName(game.player)} conceded the round.`);finishUI();});
function useCell(cell,fromDrag=false){
 if(!hasGame||done()||busy||!isHuman()||checkClock()||game.board.blocked.includes(cell))return;
 if(game.phase==='place'){
   if(fromDrag)return;
   const existing=game.draft.findIndex(p=>p.cell===cell);
   if(existing!==-1){selected=game.draft[existing].color;game.draft.splice(existing,1);save();render();say('Placement removed.');return;}
   if(game.draft.length>=requiredPieces(game)){say('Confirm your move, or tap a staged piece to move it.');return;}
   const error=canPlace(game.board,game.draft,selected,cell);if(error){say(error,true);return;}
   game.draft.push({color:selected,cell});const color=selected;chooseDefault();save();render();say(`${color} placed at ${coord(cell)}. ${game.draft.length===requiredPieces(game)?'Ready to confirm.':'Choose another colour.'}`);return;
 }
 const board=proofBoard(game),g=groups(board),piece=board.pieces.find(p=>p.cell===cell);
 if(!fromDrag&&g[selected]?.length===1&&!piece){
   if(Object.values(game.paths).some(p=>p.includes(cell))){say('A mate cannot occupy another path.',true);return;}
   game.added.push({color:selected,cell});const placed=selected;chooseDefault();save();render();say(`${placed} mate placed at ${coord(cell)}.`);return;
 }
 const path=activePath?game.paths[activePath]:null;
 if(activePath&&path){
   const prior=path.indexOf(cell);
   if(prior!==-1){game.paths[activePath]=path.slice(0,prior+1);refreshPaths();return;}
   if(neighbors(path.at(-1),7).includes(cell)){
     if(piece&&piece.color!==activePath){if(!fromDrag)say('Paths cannot run through other colours.',true);return;}
     if(Object.entries(game.paths).some(([c,p])=>c!==activePath&&p.includes(cell))){if(!fromDrag)say('Paths cannot share a square.',true);return;}
     const ends=g[activePath];
     if(path.length>1&&ends.includes(path.at(-1)))return;
     path.push(cell);refreshPaths();
     if(piece&&piece.color===activePath){say(path.length>=6?`${activePath} connected in ${path.length} squares.`:`${activePath} is only ${path.length} squares. It needs at least 6.`,path.length<6);activePath=null;}
     return;
   }
 }
 if(piece&&!fromDrag){
   selected=piece.color;
   if(g[selected].length<2){activePath=null;renderTray();renderInstructions();say(`Place the missing ${selected} mate on an empty square.`);return;}
   activePath=selected;game.paths[selected]=[cell];refreshPaths();say(`Drawing ${selected}. Continue through adjacent squares.`);
 }else if(!fromDrag)say('Start a path on one of its pieces, then use neighbouring squares.');
}
function refreshPaths(){save();renderBoard();renderTray();renderActions();}
$('#board').addEventListener('pointerdown',e=>{const cell=e.target.closest('[data-cell]');if(!cell||e.button!==0)return;e.preventDefault();dragging=game.phase==='proof';lastDrag=Number(cell.dataset.cell);useCell(lastDrag);});
$('#board').addEventListener('pointermove',e=>{if(!dragging||!activePath||e.buttons!==1)return;const rect=$('#board').getBoundingClientRect(),x=Math.floor((e.clientX-rect.left)/rect.width*7),y=Math.floor((e.clientY-rect.top)/rect.height*7);if(x<0||x>6||y<0||y>6)return;const c=y*7+x;if(c!==lastDrag){lastDrag=c;useCell(c,true);}});
window.addEventListener('pointerup',()=>{dragging=false;});window.addEventListener('pointercancel',()=>{dragging=false;});
$('#board').addEventListener('click',e=>{if(e.detail!==0)return;const cell=e.target.closest('[data-cell]');if(cell){const index=Number(cell.dataset.cell);useCell(index);$(`[data-cell="${index}"]`)?.focus();}});
$('#board').addEventListener('keydown',e=>{
 const target=e.target.closest('[data-cell]');if(!target)return;let c=Number(target.dataset.cell),next=c;
 if(e.key==='ArrowRight'&&c%7<6)next=c+1;if(e.key==='ArrowLeft'&&c%7>0)next=c-1;if(e.key==='ArrowDown'&&c<42)next=c+7;if(e.key==='ArrowUp'&&c>6)next=c-7;
 if(e.key.startsWith('Arrow')){e.preventDefault();$(`[data-cell="${next}"]`)?.focus();}
});
window.addEventListener('storage',e=>{if(e.key===key&&e.newValue){cancelComputer();say('This match changed in another tab. Reload to continue with the latest board.',true);hasGame=false;$('#actions').innerHTML=button('reload-match','Reload match');bind('reload-match',()=>location.reload());}});
setInterval(()=>{renderClock();checkClock();},250);
chooseDefault();render();if(hasGame){say('Match resumed.');scheduleComputer();}
