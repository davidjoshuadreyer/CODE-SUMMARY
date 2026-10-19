// Small, monochrome SVG circuit cues; no external assets.
const line=(x,y,X,Y)=>`<path d="M${x} ${y}L${X} ${Y}"/>`;
const text=(x,y,t)=>`<text x="${x}" y="${y}">${t}</text>`;
const dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="2" fill="currentColor"/>`;
const r=(x,y,w=36)=>line(x,y,x+6,y)+`<rect x="${x+6}" y="${y-5}" width="${w-12}" height="10"/>`+line(x+w-6,y,x+w,y);
const vr=(x,y,h=28)=>`<g transform="translate(${x} ${y}) rotate(90)">${r(0,0,h)}</g>`;
const arrow=(x,y,X,Y)=>line(x,y,X,Y)+`<path d="M${X-4} ${Y-3}L${X} ${Y}L${X-4} ${Y+3}"/>`;
const ground=(x,y)=>line(x,y,x,y+4)+line(x-7,y+4,x+7,y+4)+line(x-4,y+7,x+4,y+7)+line(x-1,y+10,x+1,y+10);
const source=(x,y,kind='v')=>`<circle cx="${x}" cy="${y}" r="10"/>`+(kind==='v'?text(x-3,y-1,'+')+text(x-3,y+9,'−'):`<path d="M${x} ${y+6}V${y-6}m-3 4 3-4 3 4"/>`);
const data={
charge:line(35,53,200,53)+line(35,53,35,8)+`<path d="M40 42L100 15H175"/><path d="M100 53V15H175V53Z" fill="#e9e9e9"/>`+text(20,12,'i')+text(203,56,'t')+text(110,39,'area = Δq'),
reduce:line(20,34,55,34)+line(55,18,55,51)+line(55,18,80,18)+r(80,18,65)+line(145,18,180,18)+line(55,51,80,51)+r(80,51,65)+line(145,51,180,51)+line(180,18,180,51)+line(180,34,215,34)+dot(55,34)+dot(180,34)+text(107,12,'R₁')+text(107,45,'R₂'),
divide:line(20,36,40,36)+r(40,36,65)+r(105,36,65)+line(170,36,215,36)+text(65,23,'R₁')+text(132,23,'R₂')+text(121,56,'+ V₂ −')+arrow(20,12,53,12)+text(24,8,'I'),
power:arrow(28,34,75,34)+r(75,34,75)+line(150,34,210,34)+text(45,25,'i')+text(91,19,'+ v −')+text(78,58,'absorbs: p = vi'),
nodal:arrow(18,32,65,32)+text(27,22,'Iin')+dot(65,32)+text(54,15,'Va')+r(65,32,60)+dot(128,32)+text(122,15,'Vb')+line(125,32,160,32)+vr(160,32,20)+ground(160,52)+text(86,23,'R'),
mesh:line(30,14,55,14)+r(55,14,44)+line(99,14,118,14)+r(118,14,50)+line(168,14,200,14)+line(200,14,200,55)+line(30,55,200,55)+line(30,14,30,24)+source(30,34)+line(30,44,30,55)+vr(118,14,41)+text(124,40,'R')+`<path d="M63 44a12 12 0 1 1 18-15m-5-1 5 1-1-5"/><path d="M157 44a12 12 0 1 1 18-15m-5-1 5 1-1-5"/>`+text(65,40,'I₁')+text(159,40,'I₂'),
superposition:source(28,21)+text(14,46,'V off')+arrow(45,21,68,21)+line(78,8,78,34)+text(65,60,'short')+source(145,21,'i')+text(133,46,'I off')+arrow(160,21,184,21)+line(196,8,196,15)+line(196,27,196,34)+dot(196,15)+dot(196,27)+text(184,60,'open'),
transform:source(25,36)+line(25,26,25,12)+r(25,12,55)+line(80,12,96,12)+line(25,46,25,59)+line(25,59,96,59)+text(2,40,'Vs')+text(48,30,'R')+text(105,37,'↔')+source(148,36,'i')+line(148,26,148,12)+line(148,12,218,12)+line(148,46,148,59)+line(148,59,218,59)+vr(193,12,47)+text(125,40,'Is')+text(202,38,'R')+dot(96,12)+dot(96,59)+dot(218,12)+dot(218,59),
thevenin:source(36,35)+line(36,25,36,12)+r(36,12,70)+line(106,12,185,12)+line(36,45,36,59)+line(36,59,185,59)+vr(185,12,47)+text(3,39,'VTh')+text(61,30,'RTh')+text(195,38,'RL')+dot(155,12)+dot(155,59)+text(153,26,'a')+text(153,54,'b'),
'max-power':line(30,53,210,53)+line(30,53,30,7)+`<path d="M32 52C55 25 75 15 106 15C140 15 165 29 205 36"/><path d="M106 15V53" stroke-dasharray="3 3"/>`+text(10,12,'PL')+text(212,57,'RL')+text(80,65,'RL = RTh')+text(110,13,'max'),
capacitor:arrow(25,34,77,34)+line(77,34,106,34)+line(106,17,106,51)+line(119,17,119,51)+line(119,34,210,34)+text(43,25,'i')+text(84,14,'+')+text(131,14,'−')+text(108,13,'v')+text(108,64,'C'),
inductor:arrow(22,34,66,34)+line(66,34,80,34)+`<path d="M80 34c0-24 18-24 18 0c0-24 18-24 18 0c0-24 18-24 18 0c0-24 18-24 18 0H210"/>`+text(42,25,'i')+text(76,13,'+')+text(153,13,'−')+text(112,13,'v')+text(111,57,'L')
};
module.exports=id=>`<svg class="circuit-cue" viewBox="0 0 240 70" role="img" aria-label="${id} diagram"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${data[id]}</g></svg>`;
