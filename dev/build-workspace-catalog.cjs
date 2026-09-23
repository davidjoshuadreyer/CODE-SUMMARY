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
const d2lMaterials=require('./d2l-materials.cjs');
const titles = {'review':'Review sheet','quiz':'Practice quiz','exam':'Practice exams','cheatsheet':'Final exam cheat sheet','ref':'Quick reference','intro':'Getting started','fundamentals':'Fundamentals','functions':'Functions','arrays-pointers':'Arrays & pointers','char-pointers':'Characters & pointers','file-io':'File I/O','flow-control':'Flow control','Sets1-32_FormulaSheet':'Formula sheet · Sets 1–32','Sets22-30_FormulaSheet':'Formula sheet · Sets 22–30','Sets22-30_FormulaSheet_keywords':'Formula sheet with keywords · Sets 22–30','SampleTest3_SolutionKey':'Sample test 3 · Solution key'};
const url = p => p.split('/').map(encodeURIComponent).join('/');
const id = p => Buffer.from(p).toString('base64url');
const resources = [];
const compLessons=require('../comp139e/lessons.json');
const compSources=[...compLessons.flatMap(l=>l.sources),...Array.from({length:9},(_,i)=>`comp139e/workspace/labs/lab${String(i+1).padStart(2,'0')}/README.md`),'comp139e/workspace/README.md'];
const studyCourses={engr290:{data:require('../engr290/content.json'),sourceDir:'ENGR 290'},math250b:{data:require('./math250b-content.cjs'),sourceDir:'Math 250B'},comp139e:{data:{lessons:compLessons,sources:compSources},sourceDir:''}};
const math252Lessons=require('../math252/lessons-manifest.json');
const courseTitles={slides:'Covered lecture slides ? Start here',desk:'Online Code Desk - C++ compiler',setup:'Optional desktop setup',labs:'Lab guides · C++ and MATLAB'};
for (const [dir,courseId] of [['phys210','phys210'],['ecet250e','ecet250e'],['math252','math252'],['chem','chem'],['matrix','matrix'],['c','c'],['Statistics','stats'],['engr290','engr290'],['math250b','math250b'],['comp139e','comp139e']]) {
 for (const file of fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html')).sort()) {
  const stem=path.basename(file,'.html'), rel=dir+'/'+file;
  const study=studyCourses[courseId],lesson=fallLessons[courseId]?.find(l=>l.slug===stem)||(courseId==='math252'?math252Lessons.find(l=>l.slug===stem):study?.data.lessons.find(l=>l.slug===stem));
  resources.push({id:'page-'+id(rel),courseId,title:stem==='materials'?'D2L course materials · Fall 2026':fallLessons[courseId]?(lesson?lesson.title:'Start here · Study guide'):courseId==='math252'?(lesson?lesson.title:stem==='lessons'?'Start here · Simplified lessons':'Original course materials'):lesson?lesson.title:courseTitles[stem]||titles[stem]||stem.replaceAll('_',' '),kind:stem==='quiz'?'Quiz':stem==='exam'?'Practice exam':stem.includes('Report')?'Lab report':'Study notes',url:url(rel),body:'',description:lesson?lesson.summary:'',referenceIds:fallLessons[courseId]?[]:courseId==='math252'?(lesson?lesson.sources.map(id=>'ref-math252-'+id):[]):study?(lesson?lesson.sources:study.data.sources).map(s=>'ref-'+id(study.sourceDir?study.sourceDir+'/'+s:s)):[],builtin:true});
 }
}
const references=[];
for(const [courseId,materials] of Object.entries(d2lMaterials)) for(const m of materials) references.push({id:'ref-d2l-'+courseId+'-'+m.id,courseId,name:m.title,url:m.url,size:0,stage:'unreviewed',notes:m.access+' · '+m.group+' · Indexed 2026-09-23. Original remains at its source; this is not an offline copy.',builtin:true,createdAt:'2026-09-23T00:00:00.000Z'});
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
