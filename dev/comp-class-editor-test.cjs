const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {parse,rename,diagnostics,patch}=require('../comp139e/class-editor.js');
const {items,program}=require('./comp-library-data.cjs');
const panel=require('./comp-rename.cjs'),symbols=require('../comp139e/code-symbols.json');
const original=program(items.find(x=>x.id==='inherit-abstract'));
assert.equal(parse(original).length,3);assert.equal(parse(original)[0].members[0].name,'getArea');
assert(panel('inherit-abstract',symbols['inherit-abstract'].symbols).includes('value="getArea"'));
let renamed=rename(original,'getArea','execute');assert.equal((renamed.match(/execute\(/g)||[]).length,4);
assert.equal((renamed.match(/getArea\(/g)||[]).length,0);
const removed=parse(original)[1];assert(diagnostics(patch(original,removed.start,removed.end,''),['Rectangle']).some(s=>s.includes('still referenced')));
assert(diagnostics('class A { public: void execute() { return 12; } }; int main(){}').some(s=>s.includes('returns void')));
assert(diagnostics('int main(){').length);
for(const item of items){const source=program(item);for(const c of parse(source)){assert(source.slice(c.headerStart,c.open).includes(c.name),item.id);for(const m of c.members)assert(m.start<m.end&&m.end<=c.close,item.id+' member bounds');}}
const job=`#include <iostream>
#include <string>
using namespace std;
class Job {
protected:
    int id;
public:
    Job(int jobId) : id(jobId) {}
    virtual void execute() const = 0;
    virtual ~Job() = default;
};
class PrintJob : public Job {
    string filename;
public:
    PrintJob(int jobId, string file) : Job(jobId), filename(file) {}
    void execute() const override { cout << id << ": " << filename << '\\n'; }
};
class BackupJob : public Job {
    string folder;
public:
    BackupJob(int jobId, string name) : Job(jobId), folder(name) {}
    void execute() const override { cout << id << ": " << folder << '\\n'; }
};
int main() {
    PrintJob print(1, "notes.pdf");
    BackupJob backup(2, "coursework");
    Job* jobs[] = {&print, &backup};
    for (Job* job : jobs) job->execute();
    return 0;
}
`;
assert.deepEqual(diagnostics(job),[]);assert.equal(parse(job).length,3);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'class-editor-'));
try{fs.writeFileSync(path.join(dir,'job.cpp'),job);execFileSync('clang++',['-std=c++17','-fsanitize=address,undefined',path.join(dir,'job.cpp'),'-o',path.join(dir,'job')]);assert.equal(execFileSync(path.join(dir,'job'),{encoding:'utf8'}),'1: notes.pdf\n2: coursework\n');}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log('PASS: parser bounds across 111 examples; virtual-family rename; deletion/void-return checks; compiled Job implementation.');
