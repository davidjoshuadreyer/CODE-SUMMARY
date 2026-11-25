export const SYMBOLS='0123456789+-*/=^', SIZE=9;
export const normalize=v=>String(v).replace(/\s/g,'').replace(/[xX×]/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-');
export const display=v=>String(v).replace(/\*/g,'×').replace(/\//g,'÷').replace(/-/g,'−');
const gcd=(a,b)=>b?gcd(b,a%b):a<0n?-a:a;
function rational(n,d=1n){if(!d)throw Error('Division by zero is not allowed.');const g=gcd(n,d),s=d<0n?-1n:1n;return {n:n/g*s,d:d/g*s};}
function operate(a,op,b){
 if(op==='+')return rational(a.n*b.d+b.n*a.d,a.d*b.d);
 if(op==='-')return rational(a.n*b.d-b.n*a.d,a.d*b.d);
 if(op==='*')return rational(a.n*b.n,a.d*b.d);
 if(op==='/')return rational(a.n*b.d,a.d*b.n);
 if(b.d!==1n||b.n<0n||b.n>1000n)throw Error('Use an integer exponent between 0 and 1000.');
 if(a.n===0n&&b.n===0n)throw Error('0^0 is undefined in this version.');
 if((String(a.n).length+String(a.d).length)*Number(b.n)>20000)throw Error('That exponent is too large for this version.');
 return rational(a.n**b.n,a.d**b.n);
}
export function evaluate(s){
 const t=s.match(/\d+|[+*/^\-]/g)||[];if(t.join('')!==s)throw Error('Use only the available symbols.');let i=0;
 function num(){const n=t[i++];if(!/^\d+$/.test(n||''))throw Error('Put a number between operators.');if(n.length>1&&n[0]==='0')throw Error('Numbers cannot have leading zeros.');return rational(BigInt(n));}
 function pow(){let v=num();if(t[i]==='^'){i++;v=operate(v,'^',pow());}return v;}
 function product(){let v=pow();while(t[i]==='*'||t[i]==='/'){const op=t[i++];v=operate(v,op,pow());}return v;}
 function sum(){let v=product();while(t[i]==='+'||t[i]==='-'){const op=t[i++];v=operate(v,op,product());}return v;}
 const result=sum();if(i!==t.length)throw Error('Check the order of the symbols.');return result;
}
export function validateSecret(input){
 const s=normalize(input);
 if(s.length!==SIZE)return {ok:false,error:'Fill all nine cells.'};
 if([...s].some(c=>!SYMBOLS.includes(c)))return {ok:false,error:'Use the digits and symbols on the keyboard.'};
 if(!s.includes('='))return {ok:false,error:'Include an equals sign.'};
 if(/^[^\d]|[^\d]$|[^\d]{2}/.test(s))return {ok:false,error:'Put a number between every pair of symbols.'};
 try{const v=s.split('=').map(evaluate);if(!v.every(x=>x.n===v[0].n&&x.d===v[0].d))return {ok:false,error:'Every side of the equation must have the same value.'};return {ok:true,equation:s};}catch(e){return {ok:false,error:e.message};}
}
export function score(secret,guess){
 if(secret.length!==SIZE||guess.length!==SIZE)throw Error('Use nine cells.');
 const hints=Array(SIZE).fill('red'),left={};
 for(let i=0;i<SIZE;i++)if(secret[i]===guess[i])hints[i]='green';else left[secret[i]]=(left[secret[i]]||0)+1;
 for(let i=0;i<SIZE;i++)if(hints[i]!=='green'&&left[guess[i]]>0){hints[i]='yellow';left[guess[i]]--;}
 return hints;
}
export function generateEquation(random=Math.random){
 const pick=n=>Math.floor(random()*n),ops=['+','-','*','/','^'];
 for(let i=0;i<1000;i++){
  const a=1+pick(99),b=pick(10),c=1+pick(19),lhs=pick(3)?`${a}${ops[pick(5)]}${b}${ops[pick(4)]}${c}`:`${a}${ops[pick(5)]}${b}`;
  try{const value=evaluate(lhs);if(value.d!==1n||value.n<0n||value.n>9999n)continue;const rhs=String(value.n),s=pick(4)?`${lhs}=${rhs}`:`${rhs}=${lhs}`;if(validateSecret(s).ok)return s;}catch{}
 }
 return ['12+3*4=24','18+6/3=20','64-2^3=56','81/9+1=10'][pick(4)];
}
export function newGame({mode='solo',timed=false,secret=generateEquation()}={}){
 return {version:1,mode,timed,phase:mode==='local'?'gate':'guess',nextPhase:'setup',player:0,round:1,secrets:mode==='local'?['','']:[secret],histories:[[],[]],pending:[null,null],draft:Array(SIZE).fill(''),cursor:0,notes:['',''],deadline:mode==='solo'&&timed?Date.now()+300000:null,winner:null};
}
export function openGate(g,now=Date.now()){if(g.phase!=='gate')return;g.phase=g.nextPhase;g.deadline=g.timed&&g.phase==='guess'?now+300000:null;}
export function lockSecret(g,input){
 if(g.phase!=='setup')return {ok:false,error:'This is not the secret-setting phase.'};
 const v=validateSecret(input);if(!v.ok)return v;g.secrets[g.player]=v.equation;g.draft=Array(SIZE).fill('');g.cursor=0;g.player=1-g.player;g.phase='gate';g.nextPhase=g.secrets.every(Boolean)?'guess':'setup';return {ok:true};
}
export function submitGuess(g,guess){
 if(g.phase!=='guess')return {ok:false,error:'Start your turn first.'};
 if(guess!==null&&(guess.length!==SIZE||[...guess].some(c=>!SYMBOLS.includes(c))))return {ok:false,error:'Fill nine cells before submitting.'};
 const target=g.secrets[g.mode==='local'?1-g.player:0],entry={guess,hints:guess===null?null:score(target,guess),round:g.round};
 g.draft=Array(SIZE).fill('');g.cursor=0;g.deadline=null;
 if(g.mode==='solo'){
  g.histories[0].push(entry);
  if(guess===target){g.phase='over';g.winner='solo';}
  else{g.round++;if(g.timed){g.phase='gate';g.nextPhase='guess';}}
 }else{
  g.pending[g.player]=entry;
  if(g.player===0){g.player=1;g.phase='gate';g.nextPhase='guess';}
  else{
   g.histories[0].push(g.pending[0]);g.histories[1].push(g.pending[1]);
   const wins=g.pending.map(p=>p.hints?.every(h=>h==='green')||false);g.pending=[null,null];
   if(wins.some(Boolean)){g.phase='over';g.winner=wins.every(Boolean)?'tie':wins[0]?'p1':'p2';}
   else{g.round++;g.player=0;g.phase='gate';g.nextPhase='guess';}
  }
 }
 return {ok:true,entry};
}
export function expireClock(g,now=Date.now()){if(g.phase==='guess'&&g.timed&&g.deadline&&now>=g.deadline){submitGuess(g,null);return true;}return false;}
