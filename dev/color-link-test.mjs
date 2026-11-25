import test from 'node:test';
import assert from 'node:assert/strict';
import {newMatch,commitMove,canPlace,challenge,finishRound,nextRound,solve,boardFor,validateProof,completeProof,computerMove,proofBoard,expireClock} from '../games/color-link/engine.mjs';
const piece=(color,cell)=>({color,cell});
const board=(pieces,blocked=[],size=7)=>({size,pieces,blocked});
test('opening is one piece; subsequent moves need two different colours',()=>{
 const g=newMatch({mode:'local'});g.draft=[piece('A',0),piece('B',5)];assert.equal(commitMove(g).ok,false);
 g.draft=[piece('A',0)];assert.equal(commitMove(g).ok,true);assert.equal(g.player,1);
 g.draft=[piece('A',6),piece('A',8)];assert.equal(commitMove(g).ok,false);
 g.draft=[piece('A',6),piece('B',14)];assert.equal(commitMove(g).ok,true);assert.equal(g.board.pieces.length,3);
 assert.ok(canPlace(g.board,[],'A',20));assert.ok(canPlace(g.board,[],'C',14));assert.ok(canPlace(board([], [9]),[],'A',9));
});
test('a challenge returns proof to the prior player and discards tentative moves',()=>{
 const g=newMatch();assert.equal(challenge(g),false);g.draft=[piece('A',0)];commitMove(g);g.draft=[piece('B',7)];
 assert.equal(challenge(g),true);assert.equal(g.player,0);assert.equal(g.challenger,1);assert.equal(g.phase,'proof');assert.deepEqual(g.draft,[]);
});
test('proof counts endpoints, rejects short, diagonal, looped and disconnected routes',()=>{
 const b=board([piece('A',0),piece('A',5)]);
 assert.equal(validateProof(b,{A:[0,1,2,3,4,5]}).ok,true);
 for(const path of [[0,1,2,5],[0,8,9,10,11,5],[0,1,2,1,4,5],[0,7,14,21,28,35]])assert.equal(validateProof(b,{A:path}).ok,false);
 assert.equal(validateProof(board([piece('A',0),piece('A',5)],[2]),{A:[0,1,2,3,4,5]}).ok,false);
});
test('proof requires all mates and rejects shared squares and other endpoints',()=>{
 const b=board([piece('A',0),piece('A',5),piece('B',7),piece('B',12)]);
 assert.equal(validateProof(b,{A:[0,1,2,3,4,5],B:[7,8,9,10,11,12]}).ok,true);
 assert.equal(validateProof(b,{A:[0,7,8,9,10,11,12,5],B:[7,8,9,10,11,12]}).ok,false);
 assert.equal(validateProof(board([piece('A',0)]),{A:[0,1,2,3,4,5]}).ok,false);
 assert.equal(validateProof(b,{A:[0,1,2,3,4,5]}).ok,false);
});
test('one point per round, loser chooses, layouts rotate, first to three wins',()=>{
 const g=newMatch();finishRound(g,0,'proof');assert.deepEqual(g.scores,[1,0]);assert.equal(g.nextChooser,1);nextRound(g,1);
 assert.equal(g.player,1);assert.equal(g.layout,1);assert.equal(g.round,2);assert.equal(g.moveCount,0);
 finishRound(g,0,'proof');nextRound(g,0);finishRound(g,0,'proof');assert.equal(g.phase,'matchOver');assert.deepEqual(g.scores,[3,0]);
});
test('solver produces independently valid proofs for every recreated layout',()=>{
 for(let i=0;i<5;i++){
   const b=boardFor(i);if(!b.pieces.length)b.pieces.push(piece('A',16));
   const r=solve(b,{budgetMs:1000});assert.equal(r.status,'solved',`layout ${i}`);
   const completed={...b,pieces:[...b.pieces,...completeProof(b,r.paths)]};assert.equal(validateProof(completed,r.paths).ok,true);
 }
});
test('solver distinguishes impossible, unknown, and solvable boards',()=>{
 const crossing=board([piece('A',2),piece('A',22),piece('B',10),piece('B',14)],[],5);
 assert.equal(solve(crossing,{budgetMs:1000,nodeLimit:1000000}).status,'impossible');
 const b=board([piece('A',0),piece('A',6)]);
 assert.equal(solve(b,{nodeLimit:1}).status,'unknown');assert.equal(solve(b).status,'solved');
 const crowded=board(Array.from({length:9},(_,i)=>piece(String.fromCharCode(65+i),i)));
 assert.equal(solve(crowded).status,'impossible');
});
test('shortest route may be too short: solver finds a longer detour',()=>{
 const b=board([piece('A',0),piece('A',1)]),r=solve(b);assert.equal(r.status,'solved');assert.ok(r.paths.A.length>=6);assert.equal(validateProof(b,r.paths).ok,true);
});
test('computer moves respect the shared pool and can be challenged',()=>{
 for(let i=0;i<5;i++){
   const g=newMatch({layout:i});const m=computerMove(g.board,true,{budgetMs:200});assert.equal(m.action,'move');g.draft=m.pieces;assert.equal(commitMove(g).ok,true);
   const n=computerMove(g.board,false,{budgetMs:200});if(n.action==='move'){g.draft=n.pieces;assert.equal(commitMove(g).ok,true);}else assert.equal(n.action,'challenge');
 }
});
test('proof completion adds only missing mates without changing original pieces',()=>{
 const g=newMatch();g.board=board([piece('A',0)]);const before=JSON.stringify(g.board),s=solve(g.board);g.paths=s.paths;g.added=completeProof(g.board,s.paths);
 assert.equal(g.added.length,1);assert.equal(JSON.stringify(g.board),before);assert.equal(validateProof(proofBoard(g),g.paths).ok,true);
});

test('timers expire once, survive serialization, and score the correct player',()=>{
 const g=newMatch({timed:true});assert.equal(expireClock(g,g.deadline-1),false);
 const resumed=JSON.parse(JSON.stringify(g));assert.equal(expireClock(resumed,resumed.deadline+1),true);assert.deepEqual(resumed.scores,[0,1]);
 assert.equal(expireClock(resumed,Date.now()+900000),false);finishRound(resumed,1,'repeat');assert.deepEqual(resumed.scores,[0,1]);
 const p=newMatch({timed:true});p.draft=[piece('A',0)];commitMove(p);challenge(p);assert.equal(expireClock(p,p.deadline),true);assert.deepEqual(p.scores,[0,1]);
 const relaxed=newMatch();assert.equal(expireClock(relaxed,Date.now()+900000),false);
});
