const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const bank = require('../comp139e/practice-exercises.json');
const {create} = require('../comp139e/practice-checker.js');
const dir = fs.mkdtempSync(path.join(os.tmpdir(),'comp-practice-'));
try {
 for (const exercise of bank.filter(e=>!process.argv.slice(2).length || process.argv.slice(2).includes(e.slug))) {
  const checker = create(exercise);
  const ids = [...exercise.source.matchAll(/@(\d+)/g)].map(m=>Number(m[1]));
  assert.deepEqual([...ids].sort((a,b)=>a-b),exercise.answers.map((_,i)=>i+1));
  exercise.answers.forEach((answer,i)=>{
   assert.equal(checker.check(i,'').state,'empty');
   assert.equal(checker.check(i,'definitely_wrong').state,'retry');
   for (const value of [answer.answer,...answer.alternatives]) assert.equal(checker.check(i,value).state,'correct');
  });
  const source = exercise.source.replace(/@(\d+)/g,(_,n)=>exercise.answers[n-1].answer);
  const cpp = path.join(dir,exercise.slug+'.cpp'), executable = path.join(dir,exercise.slug);
  fs.writeFileSync(cpp,source);
  execFileSync('clang++',['-std=c++17','-Wall','-Wextra','-pedantic-errors',cpp,'-o',executable]);
  assert.equal(execFileSync(executable,{cwd:dir,encoding:'utf8'}), exercise.output);
  // Compile every advertised alternative in context so hints never accept invalid syntax.
  for (const [i,answer] of exercise.answers.entries()) for (const alternative of answer.alternatives) {
   const variant = exercise.source.replace(/@(\d+)/g,(_,n)=>Number(n)===i+1?alternative:exercise.answers[n-1].answer);
   fs.writeFileSync(cpp,variant);
   execFileSync('clang++',['-std=c++17','-pedantic-errors',cpp,'-o',executable]);
   assert.equal(execFileSync(executable,{cwd:dir,encoding:'utf8'}),exercise.output);
  }
  if (exercise.validation) {
   const harness = source.replace('int main()', 'int exampleMain()').replace(/\}\s*$/, 'return 0;\n}') + '\n#include <cassert>\n#include <functional>\nvoid expectError(const std::function<void()>& f) { bool caught=false; try { f(); } catch(const std::runtime_error&) { caught=true; } assert(caught); }\nint main() {\n' + exercise.validation + '\n}\n';
   fs.writeFileSync(cpp,harness);
   execFileSync('clang++',['-std=c++17','-fsanitize=address,undefined','-g',cpp,'-o',executable]);
   execFileSync(executable,{cwd:dir,encoding:'utf8'});
  }
  console.log('PASS '+exercise.slug+': answer key and equivalents compile and produce expected output');
 }
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
