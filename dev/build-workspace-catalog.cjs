/* Rebuild the public, read-only catalog after adding repository study pages or PDFs.
   Run: node dev/build-workspace-catalog.cjs. Browser uploads are separate. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const courses = [
 {id:'phys210',code:'PHYS 210',name:'Electricity and Magnetism',semester:'Fall 2026',description:'Electric-field lessons, a 21-page worked-solutions PDF, and the current D2L material index.',symbol:'E'},
 {id:'ecet250e',code:'ECET 250E',name:'Linear Circuits 1',semester:'Fall 2026',description:'Current, voltage, resistor networks, and nodal analysis. Notes, labs, Multisim references, and released solutions.',symbol:'Ω'},
 {id:'math252',code:'MATH 252',name:'Applied Differential Equations',semester:'Fall 2026',description:'21 beginner-friendly lessons, 27 worked examples, and 21 practice solutions. Includes the complete course source library.',symbol:'DE'},
 {id:'chem',code:'CHEM 150',name:'Engineering Chemistry',semester:'Winter 2026',description:'Matter, bonding, equilibrium, and the chemistry lab.',symbol:'Ch'},
 {id:'matrix',code:'MATH 251',name:'Matrix Algebra',semester:'Winter 2026',description:'Linear systems, matrices, and transformations.',symbol:'Mx'},
 {id:'c',code:'COMP',name:'C Programming',semester:'Winter 2026',description:'From the fundamentals to pointers and data structures.',symbol:'C'},
 {id:'stats',code:'STAT 254',name:'Statistics',semester:'Winter 2026',description:'Probability, distributions, and statistical inference.',symbol:'σ'},
 {id:'engr290',code:'ENGR 290',name:'Materials and Thermodynamics',semester:'Fall 2026',description:'Crystal structures, bonding, defects, dislocations, and diffusion. Lessons and practice based on the supplied materials.',symbol:'En'},
 {id:'math250b',code:'MATH 250B',name:'Intermediate Calculus 2',semester:'Fall 2026',description:'Partial derivatives, optimization, multiple integrals, and vector calculus. Typeset lessons and practice using the supplied 2025 references.',symbol:'∇'},
 {id:'comp139e',code:'COMP 139E',name:'Data Structures & Applications',semester:'Fall 2026',description:'Five covered lecture decks with ten simple programs, 18 tutorials, nine lab guides, and an online C++ editor with member suggestions.',symbol:'C++'}
];
const fallLessons=require('./fall-lessons.cjs');
const physicsLessons=require('./physics-course.cjs').map(u=>({...u,slug:'learn-'+u.slug,summary:'Weeks '+u.weeks+' · '+u.chapter}));
const d2lMaterials=require('./d2l-materials.cjs');
const titles = {'assignments':'Assignments & solutions','problem-set-5':'Problem Set 5 · Capacitors and inductors walkthrough','homework-5':'Homework 5 · Electric potential walkthrough','assignment-1':'Assignment 1 · Step-by-step walkthrough','review':'Review sheet','quiz':'Practice quiz','exam':'Practice exams','cheatsheet':'Final exam cheat sheet','ref':'Quick reference','intro':'Getting started','fundamentals':'Fundamentals','functions':'Functions','arrays-pointers':'Arrays & pointers','char-pointers':'Characters & pointers','file-io':'File I/O','flow-control':'Flow control','Sets1-32_FormulaSheet':'Formula sheet · Sets 1–32','Sets22-30_FormulaSheet':'Formula sheet · Sets 22–30','Sets22-30_FormulaSheet_keywords':'Formula sheet with keywords · Sets 22–30','SampleTest3_SolutionKey':'Sample test 3 · Solution key'};
const url = p => p.split('/').map(encodeURIComponent).join('/');
const id = p => Buffer.from(p).toString('base64url');
const resources = [];
const compLessons=require('../comp139e/lessons.json');
const compSources=[...compLessons.flatMap(l=>l.sources),...Array.from({length:9},(_,i)=>`comp139e/workspace/labs/lab${String(i+1).padStart(2,'0')}/README.md`),'comp139e/workspace/README.md'];
const studyCourses={engr290:{data:require('../engr290/content.json'),sourceDir:'ENGR 290'},math250b:{data:require('./math250b-content.cjs'),sourceDir:'Math 250B'},comp139e:{data:{lessons:compLessons,sources:compSources},sourceDir:''}};
const math252Lessons=require('../math252/lessons-manifest.json');
const courseTitles={'fill-in-the-blanks':'Fill in the blanks · Rectangle worksheet',slides:'Covered lecture slides ? Start here',desk:'Online Code Desk - C++ compiler',setup:'Optional desktop setup',labs:'Lab guides · C++ and MATLAB'};
for (const [dir,courseId] of [['phys210','phys210'],['ecet250e','ecet250e'],['math252','math252'],['chem','chem'],['matrix','matrix'],['c','c'],['Statistics','stats'],['engr290','engr290'],['math250b','math250b'],['comp139e','comp139e']]) {
 for (const file of fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html')).sort()) {
  const stem=path.basename(file,'.html'), rel=dir+'/'+file;
  const study=studyCourses[courseId],lesson=(courseId==='phys210'?physicsLessons.find(l=>l.slug===stem):null)||fallLessons[courseId]?.find(l=>l.slug===stem)||(courseId==='math252'?math252Lessons.find(l=>l.slug===stem):study?.data.lessons.find(l=>l.slug===stem));
  resources.push({id:'page-'+id(rel),courseId,title:stem==='assignments'?'Assignments & solutions':stem==='materials'?'D2L course materials · Fall 2026':fallLessons[courseId]?(lesson?lesson.title:titles[stem]||'Start here · Study guide'):courseId==='math252'?(stem==='identify-setup'?'Identify the setup · Multiple-choice quiz':lesson?lesson.title:stem==='lessons'?'Start here · Simplified lessons':'Original course materials'):lesson?lesson.title:courseTitles[stem]||titles[stem]||stem.replaceAll('_',' '),kind:(stem==='quiz'||stem==='identify-setup')?'Quiz':stem==='exam'?'Practice exam':stem.includes('Report')?'Lab report':'Study notes',url:url(rel),body:'',description:lesson?lesson.summary:'',referenceIds:fallLessons[courseId]?[]:courseId==='math252'?(lesson?lesson.sources.map(id=>'ref-math252-'+id):[]):study?(lesson?lesson.sources:study.data.sources).map(s=>'ref-'+id(study.sourceDir?study.sourceDir+'/'+s:s)):[],builtin:true});
 }
}
const compRules=resources.find(r=>r.url==='comp139e/cpp-cheat-sheet.html');if(compRules)Object.assign(compRules,{title:'C++ midterm cheat sheet / rules',description:'Quick blank-position reference: if you see this, write this.',referenceIds:[]});
const compPractice=require('../comp139e/practice-exercises.json');
for(const exercise of compPractice){const entry=resources.find(r=>r.url===`comp139e/practice-${exercise.slug}.html`);if(entry)Object.assign(entry,{title:exercise.title+' · Fill in the blanks',kind:'Practice worksheet',description:exercise.topic,referenceIds:[]});}
const practiceHub=resources.find(r=>r.url==='comp139e/midterm-practice.html');if(practiceHub)Object.assign(practiceHub,{title:'Midterm fill-in-the-blank practice · 7 exercises',kind:'Practice worksheet',description:'61 blanks covering functions, references, pointers, arrays, classes, strings, files and exceptions.',referenceIds:[]});
const rectangleWorksheet=resources.find(r=>r.url==='comp139e/fill-in-the-blanks.html');
if(rectangleWorksheet)Object.assign(rectangleWorksheet,{kind:'Practice worksheet',description:'Rectangle exercise with 21 blanks, live answer feedback, explanatory hints, and browser-saved answers.',referenceIds:[]});
const lab5Pages={"phys210/lab4.html":{"title":"Experiment 4 · Capacitance lab and report","kind":"Lab report","description":"Account-saved measurements, automatic dielectric calculations, report preview, Word/PDF and instructor Excel graph exports."},"phys210/capacitance-prep.html":{"title":"Experiment 4 · Textbook Capacitor prep","kind":"Study notes","description":"Printable procedure, blank measurement tables, uncertainty equations and report checklist."},"ecet250e/virtual-lab.html":{"title":"3D Virtual Lab · Labs 1–5","kind":"Study notes","description":"Build breadboard circuits with your lab equipment. Practice voltage, resistance and series current measurements across 17 guided exercises."},"phys210/lab7.html": {"title": "Experiment 7 · Lab report builder", "kind": "Lab report", "description": "Step-by-step Nichrome measurements, graphs, account saves, and Excel and Word exports."},"ecet250e/lab5.html": {"title": "Lab 5 · Interactive bench guide", "kind": "Study notes", "description": "Step-by-step wiring, measurement inputs, and automatic account saves."}, "ecet250e/lab5-calculations.html": {"title": "Lab 5 · Calculations and report", "kind": "Lab report", "description": "Clear Thevenin calculations and a downloadable report template."}};
for (const resource of resources) if(lab5Pages[resource.url]) Object.assign(resource,lab5Pages[resource.url]);
const references=[];
const physicsTutorialFiles=require('../phys210/tutorial-manifest.json');
for(const m of physicsTutorialFiles)references.push({id:'ref-physics-tutorial-'+m.sha256.slice(0,16),courseId:'phys210',name:m.title,url:'phys210/'+m.url,size:m.bytes,stage:'unreviewed',notes:'Original tutorial handout · Collected October 14, 2026. '+m.topicUrl,builtin:true,createdAt:'2026-10-14T00:00:00.000Z'});
const physicsTutorialPage=resources.find(r=>r.url==='phys210/tutorials.html');
if(physicsTutorialPage)Object.assign(physicsTutorialPage,{title:'Tutorials 1–11 · Complete worked solutions',description:'105 tutorial questions plus 12 vector-review examples and exercises, with original diagrams, worked steps, and checks.',referenceIds:physicsTutorialFiles.map(m=>'ref-physics-tutorial-'+m.sha256.slice(0,16))});
const ecetFiles=require('../ecet250e/source-manifest.json');
for(const m of ecetFiles)references.push({id:'ref-ecet-import-'+m.id,courseId:'ecet250e',name:m.title,url:'ecet250e/'+m.url,size:m.bytes,stage:'unreviewed',notes:(m.original?'Original D2L file':'PDF reading copy')+' · '+m.group+' · Collected '+(m.collected?'October 19, 2026':'October 14, 2026')+'.',builtin:true,createdAt:(m.collected||'2026-10-14')+'T00:00:00.000Z'});
references.push({id:'ref-ecet-original-questions-print',courseId:'ecet250e',name:'Original question screenshots - printable practice PDF',url:'ecet250e/ecet-original-questions-print.pdf',size:fs.statSync(path.join(root,'ecet250e/ecet-original-questions-print.pdf')).size,stage:'unreviewed',notes:'172 questions on 145 source screenshot pages, with writing space. Original printed annotations retained.',builtin:true,createdAt:'2026-10-16T00:00:00.000Z'});
const ecetFormula=resources.find(r=>r.url==='ecet250e/formula-sheet.html');
if(ecetFormula)Object.assign(ecetFormula,{title:'Midterm formula sheet · Chapters 1–4 & 6',description:'Chapters 1–4 and 6: formulas and method reminders in the original one-page midterm reference.'});
const ecetLatest=resources.find(r=>r.url==='ecet250e/formula-sheet-latest.html');
if(ecetLatest)Object.assign(ecetLatest,{title:'Cumulative formula sheet · Through Chapter 8',description:'One-page technique reference through Week 7: DC methods, capacitors, inductors, RC/RL transients, and second-order RLC responses.'});
const ecetQuiz=resources.find(r=>r.url==='ecet250e/quiz.html');
if(ecetQuiz)Object.assign(ecetQuiz,{title:'Multiple-choice midterm practice',description:'4 original Quiz 1 MCQs plus 30 similar questions for Chapters 1–4 and 6, with explanations and retry-missed rounds.'});
const ecetStudy=resources.find(r=>r.url==='ecet250e/report-study.html');
if(ecetStudy)Object.assign(ecetStudy,{title:'Worked problem library · Lectures, problem sets & Quiz 1',description:require('../ecet250e/study-data.json').length+' worked problems with diagrams, expandable steps, and an optional Lab report theme.',referenceIds:ecetFiles.map(m=>'ref-ecet-import-'+m.id)});
for(const [courseId,materials] of Object.entries(d2lMaterials)) for(const m of materials) references.push({id:'ref-d2l-'+courseId+'-'+m.id,courseId,name:m.title,url:m.url,size:0,stage:'unreviewed',notes:m.access+' · '+m.group+' · Indexed '+(m.checked||'2026-09-23')+'. Original remains at its source; this is not an offline copy.',builtin:true,createdAt:'2026-09-23T00:00:00.000Z'});
resources.push({id:'page-phys210-resistivity-report',courseId:'phys210',title:'Experiment 7 · Completed resistivity report (PDF)',kind:'Lab report',url:'phys210/resistivity-report.pdf',body:'',description:'Updated October 16, 2026. Part B excludes the #30 reading, with the exclusion disclosed and calculations updated.',referenceIds:[],builtin:true});
resources.push({id:'page-phys210-midterm1-test',courseId:'phys210',title:'Midterm 1 · Printable practice test (PDF)',kind:'Practice test',url:'phys210/midterm-1-practice-test.pdf',body:'',description:'75-minute mock test with diagrams, working space and optional bonus questions, based on the October 2 topic hints.',referenceIds:[],builtin:true});
resources.push({id:'page-phys210-midterm1-key',courseId:'phys210',title:'Midterm 1 · Practice test answer key (PDF)',kind:'Study notes',url:'phys210/midterm-1-practice-answer-key.pdf',body:'',description:'Separate worked solutions and marking guide. Open after attempting the mock test.',referenceIds:[],builtin:true});
resources.push({id:'page-phys210-worked-pdf',courseId:'phys210',title:'Tutorial 2 · Illustrated worked solutions (21-page PDF)',kind:'Study notes',url:'phys210/electric-field-worked-solutions.pdf',body:'',description:'Given, Find, variables, diagrams, and steps for all ten questions.',referenceIds:['ref-d2l-phys210-5448798'],builtin:true});

// Library navigation is not a conversion: originals remain available for study-page tracking.
for(const material of require('../math252/materials.json')) {
 const rel=material.localPath?'math252/'+material.localPath:null;
 references.push({id:'ref-math252-'+(material.driveId||id(material.url)),courseId:'math252',name:material.title,url:rel?url(rel):material.url,size:rel?fs.statSync(path.join(root,rel)).size:0,stage:'unreviewed',notes:'Collected from Gilles Cazelais’s course pages on 2026-09-22. Original: '+material.url,builtin:true,createdAt:'2026-09-22T00:00:00.000Z'});
}

function walk(dir,courseId){
 if(!fs.existsSync(path.join(root,dir)))return;
 for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const rel=dir+'/'+entry.name;
  if(entry.isDirectory()) {if(!['build','dist','nbproject'].includes(entry.name))walk(rel,courseId);}
  else if(/\.pdf$/i.test(entry.name)||(courseId==='engr290'&&/\.(pptx|docx)$/i.test(entry.name))) references.push({id:'ref-'+id(rel),courseId,name:entry.name,url:url(rel),size:fs.statSync(path.join(root,rel)).size,stage:'unreviewed',notes:'Existing reference. Check whether this was used in a study page, then link it here.',builtin:true,createdAt:'2026-01-01T00:00:00.000Z'});
 }
}
for(const [dir,course] of [['chem/pdfs','chem'],['matrix/notes','matrix'],['Statistics','stats'],['c/other material','c'],['c/new topics','c'],['labs','c']])walk(dir,course);
walk('ENGR 290','engr290');
walk('Math 250B','math250b');
walk('comp139e/workspace/reference/course','comp139e');
for(const rel of compSources)references.push({id:'ref-'+id(rel),courseId:'comp139e',name:rel.endsWith('/README.md')?rel.replace('comp139e/workspace/','').replace('/README.md',' guide'):path.basename(rel),url:url(rel),size:fs.statSync(path.join(root,rel)).size,stage:'unreviewed',notes:'Imported from the existing COMP 139E course setup.',builtin:true,createdAt:'2026-09-21T00:00:00.000Z'});
fs.writeFileSync(path.join(root,'assets/workspace/catalog.js'),'/* Generated by dev/build-workspace-catalog.cjs. */\nwindow.TESSELATE_CATALOG = '+JSON.stringify({courses,resources,references},null,2)+';\n');
console.log(`Catalog: ${courses.length} courses, ${resources.length} study pages, ${references.length} references.`);
