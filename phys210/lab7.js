(() => {
 'use strict';
 const M=Lab7Math,$=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const defaults={student:'',partners:'',date:'',section:'',meter:'',temperature:'',uncertaintyNotes:'',diameter:'',dDiameter:'',lengthB:'10.0',dLengthB:'0.1',bCount:'6',aMin:'',aMax:'',bMin:'',bMax:'',slopeNotes:'',accepted:'',acceptedSource:'',observations:'',discussion:'',conclusion:''};
 for(let i=0;i<19;i++)for(const k of ['L','dL','R','dR'])defaults['a'+i+k]=k==='L'?((i+1)/10).toFixed(3):'';
 for(let i=0;i<20;i++)for(const k of ['g','d','dd','R','dR'])defaults['b'+i+k]='';
 let data={...defaults},step=0,renderedB=0;
 function clean(raw){const result={...defaults};for(const k of Object.keys(defaults))if(Object.hasOwn(raw,k))result[k]=String(raw[k]??'').slice(0,20000);result.bCount=String(Math.max(1,Math.min(20,Math.floor(Number(result.bCount)||6))));return result;}
 const cell=(key,label)=>`<td><input type="number" step="any" min="0" aria-label="${label}" data-key="${key}" value="${esc(data[key])}"></td>`;
 function tables(){
  if(!$('partA').children.length)$('partA').innerHTML=Array.from({length:19},(_,i)=>`<tr><th scope="row">${i+1}</th>${['L','dL','R','dR'].map((k,j)=>cell('a'+i+k,`Part A point ${i+1} ${['length in metres','length uncertainty in metres','resistance in ohms','resistance uncertainty in ohms'][j]}`)).join('')}</tr>`).join('');
  if(renderedB!==Number(data.bCount)){
   renderedB=Number(data.bCount);$('partB').innerHTML=Array.from({length:renderedB},(_,i)=>`<tr><th scope="row">${i+1}</th>${['g','d','dd','R','dR'].map((k,j)=>cell('b'+i+k,`Part B wire ${i+1} ${['AWG','diameter in millimetres','diameter uncertainty in millimetres','resistance in ohms','resistance uncertainty in ohms'][j]}`)).join('')}</tr>`).join('');
  }
 }
 function chart(rows,f,title,xlabel){
  if(!rows.length)return `<p class="note">Enter measurements to see ${esc(title)}.</p>`;
  const W=700,H=350,l=88,r=50,t=40,b=60;
  const xmax=Math.max(...rows.map(p=>p.x+(p.dx||0)))*1.07||1,ymax=Math.max(...rows.map(p=>p.y+(p.dy||0)))*1.1||1;
  const xmin=Math.min(0,...rows.map(p=>p.x-(p.dx||0))),ymin=Math.min(0,...rows.map(p=>p.y-(p.dy||0)));
  const X=x=>l+(x-xmin)/(xmax-xmin)*(W-l-r),Y=y=>H-b-(y-ymin)/(ymax-ymin)*(H-t-b);
  let s=`<svg class="chart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><style>text{font:12px Arial,sans-serif;fill:#18333b}</style><rect width="700" height="350" fill="white"/><text x="350" y="23" text-anchor="middle" style="font-size:16px">${esc(title)}</text>`;
  for(let i=0;i<=4;i++){const x=xmin+(xmax-xmin)*i/4,y=ymin+(ymax-ymin)*i/4;s+=`<path d="M${X(x)} ${t}V${H-b} M${l} ${Y(y)}H${W-r}" stroke="#e1e9e8" fill="none"/><text x="${X(x)}" y="${H-b+22}" text-anchor="middle">${M.fmt(x,3)}</text><text x="${l-10}" y="${Y(y)+4}" text-anchor="end">${M.fmt(y,3)}</text>`;}
  s+=`<path d="M${l} ${t}V${H-b}H${W-r}" fill="none" stroke="#52666d"/><text x="380" y="340" text-anchor="middle">${esc(xlabel)}</text><text transform="translate(17 170) rotate(-90)" text-anchor="middle">Resistance R (Ω)</text>`;
  if(f){const endpoints=[{x:xmin,y:f.m*xmin+f.b},{x:xmax,y:f.m*xmax+f.b}];if(f.m!==0){endpoints.push({x:(ymin-f.b)/f.m,y:ymin},{x:(ymax-f.b)/f.m,y:ymax});}const valid=endpoints.filter(p=>p.x>=xmin-1e-10&&p.x<=xmax+1e-10&&p.y>=ymin-1e-10&&p.y<=ymax+1e-10);if(valid.length>=2)s+=`<path d="M${X(valid[0].x)} ${Y(valid[0].y)}L${X(valid[1].x)} ${Y(valid[1].y)}" fill="none" stroke="#bd7534" stroke-width="2"/>`;}
  for(const p of rows){const x=X(p.x),y=Y(p.y),dx=p.dx||0,dy=p.dy||0;s+=`<path d="M${X(p.x-dx)} ${y}H${X(p.x+dx)} M${X(p.x-dx)} ${y-4}v8 M${X(p.x+dx)} ${y-4}v8 M${x} ${Y(p.y-dy)}V${Y(p.y+dy)} M${x-4} ${Y(p.y-dy)}h8 M${x-4} ${Y(p.y+dy)}h8" stroke="#456e77" fill="none"/><circle cx="${x}" cy="${y}" r="3.5" fill="#176b65"/>`;}
  return s+'</svg>';
 }
 function resultText(a){return [`Part A: ρA = ${M.fmt(a.rhoA)} ± ${M.fmt(a.drhoA)} Ω·m.`,`Part B: ρB = ${M.fmt(a.rhoB)} ± ${M.fmt(a.drhoB)} Ω·m.`,a.consistent===null?'Consistency comparison awaits both resistivity uncertainties.':`|ρA − ρB| = ${M.fmt(a.difference)} Ω·m; ΔρA + ΔρB = ${M.fmt(a.combined)} Ω·m. The manual’s strict inequality is ${a.consistent?'satisfied: consistent':'not satisfied: not consistent'} within these uncertainties.`,a.accepted?`Accepted resistivity: ${M.fmt(a.accepted)} Ω·m. Absolute percent differences: Part A ${M.fmt(a.percentA,4)}%; Part B ${M.fmt(a.percentB,4)}%.`:'Accepted-value comparison awaits a reference value.'];}
 function rawTables(a){
  const display=v=>v&&String(v).length>12&&M.number(v)!==null?M.fmt(M.number(v),8):v||'—';
  const aRows=Array.from({length:19},(_,i)=>[i+1,...['L','dL','R','dR'].map(k=>display(data['a'+i+k]))]);
  const bRows=Array.from({length:Number(data.bCount)},(_,i)=>[i+1,...['g','d','dd','R','dR'].map(k=>display(data['b'+i+k]))]);
  return [{title:'Part A raw measurements',headers:['Point','L (m)','ΔL (m)','R (Ω)','ΔR (Ω)'],rows:aRows},{title:'Part B raw measurements',headers:['Wire','AWG','d (mm)','Δd (mm)','R (Ω)','ΔR (Ω)'],rows:bRows},{title:'Part B calculated areas',headers:['Wire','A (m²)','ΔA (m²)','1/A (m⁻²)','Δ(1/A) (m⁻²)'],rows:a.B.map(p=>[p.i+1,...[p.area,p.dArea,p.x,p.dx].map(v=>M.fmt(v))])}];
 }
 function reportModel(){
  const a=M.analyze(data);
  const sections=[
   ['Objectives','Test R ∝ L at fixed diameter and R ∝ 1/A at fixed length. Obtain two independent values of Nichrome resistivity and compare them with uncertainty and an accepted value.'],
   ['Theory','R = ρL/A; A = πd²/4. For Part A, ρA = mA A. For Part B, ρB = mB/L. Ordinary least squares fits use a free intercept. Resistivity is a material property that depends on temperature.'],
   ['Apparatus and uncertainty',`Prepared #28 AWG wire; equal-length samples of differing gauge; probe and resistance meter. Meter/range: ${data.meter||'[Not entered]'}. Temperature: ${data.temperature?data.temperature+' °C':'not recorded'}.\nPart A diameter = ${data.diameter||'—'} ± ${data.dDiameter||'—'} mm. Part B common length = ${data.lengthB||'—'} ± ${data.dLengthB||'—'} m.\n${data.uncertaintyNotes||'[Add uncertainty sources and convention.]'}`],
   ['Procedure','Manual procedure: measure R at 0.10–1.90 m in 0.10 m steps along the #28 wire, then measure each supplied equal-length wire between its exposed ends. Use COM and VΩ in resistance mode on unpowered samples. The jumper is assumed to have negligible resistance.'],
   ['Actual procedure and observations',data.observations||'[Add actual observations and deviations from the procedure.]'],
   ['Calculations',`Part A: d = ${M.fmt(a.diameter===null?null:a.diameter/1000)} m; A = πd²/4 = ${M.fmt(a.areaA)} m²; ΔA = ${M.fmt(a.dAreaA)} m².\nBest-fit R = mL + b: mA = ${M.fmt(a.af?.m)} Ω/m; bA = ${M.fmt(a.af?.b)} Ω; R² = ${M.fmt(a.af?.r2)}.\nPart B best-fit R = m(1/A) + b: mB = ${M.fmt(a.bf?.m)} Ω·m²; bB = ${M.fmt(a.bf?.b)} Ω; R² = ${M.fmt(a.bf?.r2)}.\nΔmA = (${data.aMax||'—'} − ${data.aMin||'—'})/2 = ${M.fmt(a.au?.dm)} Ω/m.\nΔmB = (${data.bMax||'—'} − ${data.bMin||'—'})/2 = ${M.fmt(a.bu?.dm)} Ω·m².\nρA = ${M.fmt(a.af?.m)} × ${M.fmt(a.areaA)} = ${M.fmt(a.rhoA)} Ω·m.\nρB = ${M.fmt(a.bf?.m)} / ${M.fmt(a.length)} = ${M.fmt(a.rhoB)} Ω·m.\nUncertainty propagation: ΔA/A = 2Δd/d; Δ(1/A)/(1/A) = ΔA/A; ΔρA/ρA = ΔmA/mA + ΔA/A; ΔρB/ρB = ΔmB/mB + ΔL/L.\nSlope-limit method: ${data.slopeNotes||'[Not entered]'}.`],
   ['Results and comparison',resultText(a).join('\n')],
   ['Discussion',data.discussion||'[Write the discussion using the measured evidence.]'],
   ['Conclusion',data.conclusion||'[Write the conclusion after reviewing the results.]'],
   ['References',`Camosun College, PHYS 210 Lab Manual Complete 2024, Experiment 7, L7-1–L7-4 (PDF pp. 101–104). https://online.camosun.ca/d2l/le/content/348967/viewContent/5448840/View\nAccepted resistivity source: ${data.acceptedSource||'[Not entered]'}.`]
  ];
  return {title:'Experiment 7: Resistivity of Nichrome Wire',subtitle:`${data.student||'[Name]'} · ${data.date||'[Experiment date]'} · ${data.section||'PHYS 210'}`,partners:data.partners,a,sections,tables:rawTables(a),charts:[chart(a.A,a.af,'Part A · Resistance versus length','Length L (m)'),chart(a.B,a.bf,'Part B · Resistance versus inverse area','Inverse area 1/A (m⁻²)')]};
 }
 function tableHTML(t){return `<h3>${esc(t.title)}</h3><div class="table-wrap"><table class="report-table"><thead><tr>${t.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
 function render(){
  const a=M.analyze(data);
  $('analysis').innerHTML=['A','B'].map(k=>{const f=k==='A'?a.af:a.bf,rows=k==='A'?a.A:a.B,u=k==='A'?'Ω/m':'Ω·m²';return `<h3>Part ${k} · ${rows.length} valid points</h3>${chart(rows,f,'Part '+k+' · Resistance versus '+(k==='A'?'length':'inverse area'),k==='A'?'Length L (m)':'Inverse area 1/A (m⁻²)')}<p>Best-fit slope = <b>${M.fmt(f?.m)} ${u}</b>; intercept = ${M.fmt(f?.b)} Ω; R² = ${M.fmt(f?.r2)}. Brown line: best fit. Green points: measurements.</p>`;}).join('');
  const feedback=['A','B'].map(k=>{const bounds=k==='A'?a.aBounds:a.bBounds,f=k==='A'?a.af:a.bf,u=k==='A'?a.au:a.bu,rows=k==='A'?a.A:a.B;let s=`Part ${k}: `;s+=bounds?`rectangle slope range ${M.fmt(bounds.min)} to ${M.fmt(bounds.max)} ${k==='A'?'Ω/m':'Ω·m²'}.`:'no bounded common-line range available; enter at least 3 valid points and all uncertainties, then review the graph.';if(bounds&&f&&(f.m<bounds.min||f.m>bounds.max))s+=' The least-squares slope is outside that range; investigate before choosing limits.';if(u&&(M.intercept(rows,u.min)===null||M.intercept(rows,u.max)===null))s+=' One or both chosen limits cannot intersect all entered uncertainty rectangles. Explain your instructor-approved method.';return s;});
  $('slopeFeedback').textContent=feedback.join('\n');
  $('suggestA').disabled=!a.aBounds||!a.af||a.aBounds.min<=0||a.af.m<a.aBounds.min||a.af.m>a.aBounds.max||a.aBounds.min===a.aBounds.max;
  $('suggestB').disabled=!a.bBounds||!a.bf||a.bBounds.min<=0||a.bf.m<a.bBounds.min||a.bf.m>a.bBounds.max||a.bBounds.min===a.bBounds.max;
  $('comparison').innerHTML=resultText(a).map(t=>`<p class="stat">${esc(t)}</p>`).join('');
  $('readiness').innerHTML=a.complete?'<p class="note">All required report fields are filled. Review your results and wording before submitting.</p>':`<p class="draft">Draft report — still to complete</p><ul>${a.issues.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`;
  const model=reportModel();$('report').innerHTML=`<h1>${esc(model.title)}</h1><p>${esc(model.subtitle)}${model.partners?'\nPartners: '+esc(model.partners):''}</p>${a.complete?'':`<p class="draft">DRAFT — missing or unresolved inputs</p><ul>${a.issues.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`}`+model.sections.map(([h,p],i)=>`<h2>${esc(h)}</h2><p>${esc(p)}</p>${i===4?model.tables.map(tableHTML).join(''):''}${i===5?model.charts.join(''):''}`).join('');
  $('removeB').disabled=Number(data.bCount)<=1;
 }
 function show(n,capture=true){step=Math.max(0,Math.min(5,Number(n)||0));document.querySelectorAll('[data-step]').forEach(el=>el.hidden=Number(el.dataset.step)!==step);document.querySelectorAll('#steps button').forEach((el,i)=>{el.classList.toggle('active',i===step);if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});$('prev').disabled=step===0;$('next').disabled=step===5;$('progress').textContent=`Step ${step+1} of 6`;if(capture)save();}
 function save(){window.Lab7Account?.capture(data,step);}
 function apply(raw,n){data=clean(raw);tables();document.querySelectorAll('[data-key]').forEach(el=>{if(document.activeElement!==el)el.value=data[el.dataset.key]??'';});show(n,false);render();}
 $('steps').innerHTML=['Set up','Part A','Part B','Calculate','Discuss','Export'].map((s,i)=>`<button data-nav="${i}">${i+1}. ${s}</button>`).join('');
 $('steps').onclick=e=>{const b=e.target.closest('[data-nav]');if(b)show(b.dataset.nav);};
 $('prev').onclick=()=>show(step-1);$('next').onclick=()=>show(step+1);
 document.addEventListener('input',e=>{if(!e.target.dataset.key)return;data[e.target.dataset.key]=e.target.value;e.target.setAttribute('aria-invalid',String(!e.target.checkValidity()));render();save();});
 function set(values){data={...data,...values};apply(data,step);save();}
 function fill(prefix,suffix,input,count){const v=$(input).value;if(M.nonnegative(v)===null){$('saveStatus').textContent='Enter a non-negative uncertainty before filling blank cells.';return;}const updates={};for(let i=0;i<count;i++)if(data[prefix+i+suffix]==='')updates[prefix+i+suffix]=v;set(updates);}
 $('fillDL').onclick=()=>fill('a','dL','commonDL',19);$('fillDRA').onclick=()=>fill('a','dR','commonDRA',19);$('fillDRB').onclick=()=>fill('b','dR','commonDRB',Number(data.bCount));
 $('nominalA').onclick=()=>set({diameter:(0.127*92**((36-28)/39)).toPrecision(6)});
 $('nominalB').onclick=()=>{const v={};for(let i=0;i<Number(data.bCount);i++){const g=M.number(data['b'+i+'g']);if(g!==null&&Number.isInteger(g)&&g>=20&&g<=30&&data['b'+i+'d']==='')v['b'+i+'d']=(0.127*92**((36-g)/39)).toPrecision(6);}set(v);};
 $('addB').onclick=()=>{if(Number(data.bCount)<20)set({bCount:String(Number(data.bCount)+1)});};
 $('removeB').onclick=()=>{const i=Number(data.bCount)-1;if(i>0&&['g','d','dd','R','dR'].every(k=>!data['b'+i+k]))set({bCount:String(i)});else $('saveStatus').textContent='Only an entirely blank last row can be removed. Clear that row first if it is unused.';};
 for(const k of ['A','B'])$('suggest'+k).onclick=()=>{const a=M.analyze(data),b=k==='A'?a.aBounds:a.bBounds;if(b)set({[k.toLowerCase()+'Min']:String(b.min),[k.toLowerCase()+'Max']:String(b.max)});};
 $('print').onclick=()=>window.print();
 function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
 $('backup').onclick=()=>download(new Blob([JSON.stringify({format:'tesselate-phys210-lab7',version:1,readings:data,step},null,2)],{type:'application/json'}),'phys210-experiment7-readings.json');
 $('load').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>500000)throw Error('Backup is too large.');const b=JSON.parse(await file.text());if(b.format!=='tesselate-phys210-lab7'||b.version!==1||!b.readings||typeof b.readings!=='object'||Array.isArray(b.readings))throw Error('Choose an Experiment 7 readings backup.');if(!confirm('Replace the current Experiment 7 readings with this backup? This also saves them to the signed-in account.'))return;data=clean(b.readings);apply(data,b.step);save();$('exportStatus').textContent='Readings backup imported.';}catch(err){$('exportStatus').textContent=err.message;}finally{e.target.value='';}};
 window.Lab7UI={clean,apply,getData:()=>({...data}),reportModel,chart,download};
 apply(defaults,0);
})();
