"""Thirty short lab-style drills, kept separate from all existing examples."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
old = {x['id']: x for x in json.loads((ROOT/'comp139e/exam-drills.json').read_text())}
items = []
includes = '#include <iostream>\n#include <string>\nusing namespace std;\n\n'
def add(slug, title, kind, question, code, use, output, watch, checks=''):
    items.append(dict(id='short-'+slug, group='short-drills', title=title, shortTitle=title,
        when=question[0], question=question, code=code, use=use,
        expected=output.strip(), expectedOutput=output, manualComments=True,
        parts=[['Start','Use the matching generic template above.'],['Change','Add the fields or operation named in the question.'],['Test','Use main() to check the result and an empty or boundary case.']],
        change='Keep the structure. Change the names, data, and calculation to match your question.',watch=watch,
        reference='workspace/reference/course/labs/139E - Lab 6.html',referenceLabel='Related lab: classes and linked structures',
        sourceNote='Short practice based on course topics.',
        facets=dict(structure=kind, storage='none' if kind=='inheritance' else 'linked', type='template' if 'template <' in code else 'int', role='example'),
        typeLabel='non-template' if kind=='inheritance' else 'template' if 'template <' in code else 'int',checks=checks))

add('student','Student · add a field','inheritance',[
    'Derive Student from Person; add a student number.',
    'Person stores a private name and exposes getName(). Initialize both fields in the Student constructor. Add print() to show the name and number.'],includes+'''class Person {
    string name; // Private: derived classes must use getName().
public:
    Person(string n) : name(n) {}
    string getName() const { return name; }
};
class Student : public Person {
    int number;
public:
    Student(string n, int num) : Person(n), number(num) {}
    void print() const { cout << getName() << ' ' << number << '\\n'; }
};''','Student s("Alex", 42);\ns.print();','Alex 42\n','Initialize the base with Person(n); name is private.')
add('account','Account · use protected data','inheritance',[
    'Derive SavingsAccount; add interest to the balance.',
    'Account stores protected double balance and provides getBalance(). SavingsAccount::addInterest(rate) adds balance * rate, where 0.1 means 10%.'],includes+'''class Account {
protected:
    double balance;
public:
    Account(double b) : balance(b) {}
    double getBalance() const { return balance; }
};
class SavingsAccount : public Account {
public:
    SavingsAccount(double b) : Account(b) {}
    void addInterest(double rate) { balance += balance * rate; }
};''','SavingsAccount a(100);\na.addInterest(0.1);\ncout << a.getBalance() << \'\\n\';','110\n','Protected data is accessible inside the derived class.')
add('counter','Counter · reuse a base method','inheritance',[
    'Derive DoubleCounter; increment twice using the base method.',
    'Counter starts at zero and provides increment() and getValue(). Add incrementTwice() in the derived class without accessing the private value.'],includes+'''class Counter {
    int value;
public:
    Counter() : value(0) {}
    void increment() { ++value; }
    int getValue() const { return value; }
};
class DoubleCounter : public Counter {
public:
    void incrementTwice() {
        increment(); // Reuse the inherited public operation.
        increment();
    }
};''','DoubleCounter c;\nc.incrementTwice();\ncout << c.getValue() << \'\\n\';','2\n','A derived class can call inherited public methods.')
add('square','Square · pass values to the base','inheritance',[
    'Derive Square from Rectangle using one side length.',
    'Rectangle stores private length and width and provides area(). Square(side) must initialize both dimensions; reuse area() unchanged.'],includes+'''class Rectangle {
    double length, width;
public:
    Rectangle(double l, double w) : length(l), width(w) {}
    double area() const { return length * width; }
};
class Square : public Rectangle {
public:
    Square(double side) : Rectangle(side, side) {} // Same value for both dimensions.
};''','Square s(5);\ncout << s.area() << \'\\n\';','25\n','No override is needed when the inherited method already does the job.')
add('employee','Employee · override pay','inheritance',[
    'Override Employee::pay() in HourlyEmployee.',
    'Employee::pay() returns 0 and is virtual. HourlyEmployee stores hours and rate and returns their product. Call pay() through an Employee reference.'],includes+'''class Employee {
public:
    virtual double pay() const { return 0; }
    virtual ~Employee() = default;
};
class HourlyEmployee : public Employee {
    double hours, rate;
public:
    HourlyEmployee(double h, double r) : hours(h), rate(r) {}
    double pay() const override { return hours * rate; }
};''','HourlyEmployee worker(3, 20);\nEmployee& person = worker; // Reference keeps virtual dispatch.\ncout << person.pay() << \'\\n\';','60\n','virtual enables derived behavior through a base reference.')
add('ticket','Ticket · extend a base calculation','inheritance',[
    'Override Ticket::cost() to apply a discount.',
    'Ticket stores a private price. DiscountTicket receives a price and discount amount. Its cost() returns Ticket::cost() minus that discount.'],includes+'''class Ticket {
    double price;
public:
    Ticket(double p) : price(p) {}
    virtual double cost() const { return price; }
    virtual ~Ticket() = default;
};
class DiscountTicket : public Ticket {
    double discount;
public:
    DiscountTicket(double p, double d) : Ticket(p), discount(d) {}
    double cost() const override {
        return Ticket::cost() - discount; // Qualified call avoids calling ourselves.
    }
};''','DiscountTicket t(20, 5);\ncout << t.cost() << \'\\n\';','15\n','Use Ticket::cost(), not cost(), inside this override.')
add('sensor','Sensor · implement an abstract method','inheritance',[
    'Implement a sensor that adds an offset.',
    'Sensor declares pure virtual double read() const and a virtual destructor. OffsetSensor stores raw and offset; read() returns their sum.'],includes+'''class Sensor {
public:
    virtual double read() const = 0;
    virtual ~Sensor() = default;
};
class OffsetSensor : public Sensor {
    double raw, offset;
public:
    OffsetSensor(double r, double o) : raw(r), offset(o) {}
    double read() const override { return raw + offset; }
};''','OffsetSensor sensor(10, 2);\nSensor* p = &sensor;\ncout << p->read() << \'\\n\';','12\n','The override must match the base return type and const.')
add('box','Box · define methods outside the class','inheritance',[
    'Derive Box from Solid; define its methods below the class.',
    'Solid has pure virtual double volume() const and a virtual destructor. Box stores length, width and height. Declare its constructor and volume() in the class; define both using Box::.'],includes+'''class Solid {
public:
    virtual double volume() const = 0;
    virtual ~Solid() = default;
};
class Box : public Solid {
    double length, width, height;
public:
    Box(double l, double w, double h); // Declarations end with semicolons.
    double volume() const override;
};
// Definitions belong to Box even though written outside its braces.
Box::Box(double l, double w, double h) : length(l), width(w), height(h) {}
double Box::volume() const { return length * width * height; }''','Box b(2, 3, 4);\ncout << b.volume() << \'\\n\';','24\n','Use Box:: on definitions; write override only inside the class.')
# Four compact two-derived-class patterns.
for slug,title,base,method,a,exprA,b,exprB,value,out in [
 ('shapes','Shapes · two area formulas','Shape','area','Square','value * value','Circle','3.0 * value * value',2,'4 12\n'),
 ('delivery','Delivery · two fee rules','Delivery','fee','Pickup','0','Courier','5 + value',3,'0 8\n'),
 ('marks','Marks · two scoring rules','Assessment','score','Quiz','value','BonusQuiz','value + 2',6,'6 8\n'),
 ('converter','Converter · two conversions','Converter','convert','DoubleValue','value * 2','HalfValue','value / 2',8,'16 4\n')]:
    code=includes+f'''class {base} {{
protected:
    double value;
public:
    {base}(double v) : value(v) {{}}
    virtual double {method}() const = 0;
    virtual ~{base}() = default;
}};
class {a} : public {base} {{
public:
    {a}(double v) : {base}(v) {{}}
    double {method}() const override {{ return {exprA}; }}
}};
class {b} : public {base} {{
public:
    {b}(double v) : {base}(v) {{}}
    double {method}() const override {{ return {exprB}; }}
}};'''
    add(slug,title,'inheritance',[f'Implement {a} and {b} with a shared abstract base.',f'{base} stores protected double value, initializes it in its constructor, declares pure virtual double {method}() const, and has a virtual destructor.',f'{a} returns {exprA}; {b} returns {exprB}.'+(' Use pi = 3 for this question.' if slug=='shapes' else ''),f'Call both through {base} pointers in main().'],code,f'''{a} a({value});
{b} b({value});
{base}* first = &a;
{base}* second = &b; // Points to existing objects; no delete needed.
cout << first->{method}() << ' ' << second->{method}() << '\\n';''',out,'Keep the same signature in the base and both overrides.')
add('job','Job · print inherited data','inheritance',[
    'Derive PrintJob and print its ID and filename.',
    'Job stores protected int id, initializes it in its constructor, declares pure virtual void execute() const, and has a virtual destructor. PrintJob adds a string filename.'],includes+'''class Job {
protected:
    int id;
public:
    Job(int number) : id(number) {}
    virtual void execute() const = 0;
    virtual ~Job() = default;
};
class PrintJob : public Job {
    string filename;
public:
    PrintJob(int number, string file) : Job(number), filename(file) {}
    void execute() const override { cout << id << ' ' << filename << '\\n'; }
};''','PrintJob job(7, "notes.txt");\nJob& base = job;\nbase.execute();','7 notes.txt\n','Use void when the method prints but returns no value.')
add('display','Display · extend base printing','inheritance',[
    'Print a device name followed by its battery level.',
    'Device stores a private name and has virtual print(). Phone adds battery and overrides print(), calling Device::print() first.'],includes+'''class Device {
    string name;
public:
    Device(string n) : name(n) {}
    virtual void print() const { cout << name; }
    virtual ~Device() = default;
};
class Phone : public Device {
    int battery;
public:
    Phone(string n, int b) : Device(n), battery(b) {}
    void print() const override {
        Device::print(); // Print the base portion first.
        cout << ' ' << battery << "%\\n";
    }
};''','Phone phone("Phone", 80);\nphone.print();','Phone 80%\n','Qualify the base call to avoid recursive Phone::print().')
add('chain','Inheritance · three levels','inheritance',[
    'Build Person → Student → GraduateStudent.',
    'Person stores a private name and exposes getName(). Student adds a private number and getNumber(). GraduateStudent adds a topic and prints all three. Pass constructor arguments along the chain.'],includes+'''class Person {
    string name;
public:
    Person(string n) : name(n) {}
    string getName() const { return name; }
};
class Student : public Person {
    int number;
public:
    Student(string n, int num) : Person(n), number(num) {}
    int getNumber() const { return number; }
};
class GraduateStudent : public Student {
    string topic;
public:
    GraduateStudent(string n, int num, string t) : Student(n, num), topic(t) {}
    void print() const { cout << getName() << ' ' << getNumber() << ' ' << topic << '\\n'; }
};''','GraduateStudent s("Sam", 10, "Robotics");\ns.print();','Sam 10 Robotics\n','Each constructor initializes its immediate base, not a grandparent.')

stack=old['exam-stack-basic']['code']
queue=old['exam-queue-basic']['code']
def stackscan(signature,initial,step,finish):
    return f'''\n// FREE FUNCTION: inspect values, then restore the original order.
{signature} {{
    {initial}
    Stack<int> temporary;
    while (!s.isEmpty()) {{
        int value = s.pop();
        {step}
        temporary.push(value);
    }}
    while (!temporary.isEmpty()) s.push(temporary.pop());
    {finish}
}}'''
add('stack-find','Stack · find a value','stack',['Write contains(s, target); leave the stack unchanged.','Use only public stack operations and one temporary stack. Return false for an empty stack.'],stack+stackscan('bool contains(Stack<int>& s, int target)','bool found = false;','if (value == target) found = true;','return found;'),'''Stack<int> s;
s.push(4); s.push(9);
cout << contains(s, 4) << ' ' << contains(s, 8) << '\\n';
cout << s.pop() << ' ' << s.pop() << '\\n';''','1 0\n9 4\n','Do not return early before restoring the stack.','Stack<int> s; assert(!contains(s, 1)); s.push(1); assert(contains(s, 1)); assert(s.pop()==1);')
add('stack-max','Stack · largest value','stack',['Return the largest stack value without changing the stack.','Throw StackException if empty. Use one temporary stack and public operations.'],stack+stackscan('int maximum(Stack<int>& s)','if (s.isEmpty()) throw StackException("Empty stack");\n    int result = s.top();','if (value > result) result = value;','return result;'),'''Stack<int> s;
s.push(-5); s.push(-2); s.push(-8);
cout << maximum(s) << '\\n';
while (!s.isEmpty()) cout << s.pop() << ' ';
cout << '\\n';''','-2\n-8 -2 -5 \n','Start from a real value, not zero: all values might be negative.','Stack<int> s; bool threw=false; try { maximum(s); } catch(const StackException&) { threw=true; } assert(threw); s.push(-3); assert(maximum(s)==-3 && s.pop()==-3);')
add('stack-duplicate','Stack · duplicate the top','stack',['Add a second copy of the top item.','Write duplicateTop(s) using top() and push(). Throw on an empty stack through top().'],stack+'''\nvoid duplicateTop(Stack<int>& s) {
    int value = s.top(); // Read first; throws if empty.
    s.push(value);
}''','Stack<int> s;\ns.push(3); s.push(7);\nduplicateTop(s);\nwhile (!s.isEmpty()) cout << s.pop() << \' \';\ncout << \'\\n\';','7 7 3 \n','top() reads; pop() removes.','Stack<int> s; bool threw=false; try { duplicateTop(s); } catch(const StackException&) { threw=true; } assert(threw); s.push(2); duplicateTop(s); assert(s.size()==2); assert(s.pop()==2 && s.pop()==2);')
add('stack-remove','Stack · remove up to n','stack',['Remove up to n top items and return how many were removed.','Stop if empty; if n is zero or negative, remove nothing.'],stack+'''\nint removeTop(Stack<int>& s, int n) {
    int removed = 0;
    while (removed < n && !s.isEmpty()) {
        s.pop();
        ++removed;
    }
    return removed;
}''','Stack<int> s;\ns.push(1); s.push(2); s.push(3);\ncout << removeTop(s, 2) << \' \' << s.top() << \'\\n\';','2 1\n','Check empty before pop().','Stack<int> s; assert(removeTop(s, 3)==0); s.push(1); assert(removeTop(s, -1)==0 && s.size()==1); assert(removeTop(s, 3)==1 && s.isEmpty());')
add('stack-replace','Stack · replace matching values','stack',['Replace every matching stack value; keep the order.','Write replaceAll(s, oldValue, newValue). Return the number replaced; use one temporary stack.'],stack+stackscan('int replaceAll(Stack<int>& s, int oldValue, int newValue)','int changed = 0;','if (value == oldValue) { value = newValue; ++changed; }','return changed;'),'''Stack<int> s;
s.push(2); s.push(5); s.push(2);
cout << replaceAll(s, 2, 9) << '\\n';
while (!s.isEmpty()) cout << s.pop() << ' ';
cout << '\\n';''','2\n9 5 9 \n','Restore every value, including the ones that did not match.','Stack<int> s; assert(replaceAll(s,1,2)==0); s.push(1); s.push(3); assert(replaceAll(s,1,2)==1); assert(s.pop()==3 && s.pop()==2);')
def queuescan(signature,initial,step,finish):
    return f'''\n{signature} {{
    {initial}
    int n = q.size(); // Save the count: re-enqueueing keeps the queue nonempty.
    for (int i = 0; i < n; ++i) {{
        int value = q.dequeue();
        {step}
        q.enqueue(value);
    }}
    {finish}
}}'''
add('queue-find','Queue · find a value','queue',['Find a target without changing queue order.','Return true if present; rotate exactly the original number of items.'],queue+queuescan('bool contains(Queue<int>& q, int target)','bool found = false;','if (value == target) found = true;','return found;'),'Queue<int> q;\nq.enqueue(4); q.enqueue(7);\ncout << contains(q, 7) << \' \' << contains(q, 9) << \'\\n\';\ncout << q.dequeue() << \' \' << q.dequeue() << \'\\n\';','1 0\n4 7\n','Do not return early; finish the rotation to preserve order.','Queue<int> q; assert(!contains(q,1)); q.enqueue(1); q.enqueue(2); assert(contains(q,1)); assert(q.dequeue()==1 && q.dequeue()==2);')
add('queue-min','Queue · smallest value','queue',['Return the minimum without changing queue order.','Throw runtime_error if empty. Start from front(), then rotate the queue once.'],queue+queuescan('int minimum(Queue<int>& q)','int result = q.front(); // Throws when empty.','if (value < result) result = value;','return result;'),'Queue<int> q;\nq.enqueue(8); q.enqueue(3); q.enqueue(6);\ncout << minimum(q) << \'\\n\';\nwhile (!q.isEmpty()) cout << q.dequeue() << \' \';\ncout << \'\\n\';','3\n8 3 6 \n','Do not initialize the minimum to zero.','Queue<int> q; bool threw=false; try { minimum(q); } catch(const runtime_error&) { threw=true; } assert(threw); q.enqueue(4); assert(minimum(q)==4 && q.dequeue()==4);')
add('queue-rotate','Queue · move front to back','queue',['Move the first queue item to the back.','Write rotateOnce(q). Do nothing if the queue is empty.'],queue+'''\nvoid rotateOnce(Queue<int>& q) {
    if (!q.isEmpty()) {
        int value = q.dequeue();
        q.enqueue(value);
    }
}''','Queue<int> q;\nq.enqueue(1); q.enqueue(2); q.enqueue(3);\nrotateOnce(q);\nwhile (!q.isEmpty()) cout << q.dequeue() << \' \';\ncout << \'\\n\';','2 3 1 \n','One rotation moves one item; a full rotation restores the queue.','Queue<int> q; rotateOnce(q); assert(q.isEmpty()); q.enqueue(1); rotateOnce(q); assert(q.size()==1 && q.dequeue()==1);')
add('queue-replace','Queue · replace matching values','queue',['Replace matching queue values and keep their positions.','Return the number replaced. Rotate once, enqueueing either the original or replacement value.'],queue+queuescan('int replaceAll(Queue<int>& q, int oldValue, int newValue)','int changed = 0;','if (value == oldValue) { value = newValue; ++changed; }','return changed;'),'Queue<int> q;\nq.enqueue(2); q.enqueue(4); q.enqueue(2);\ncout << replaceAll(q, 2, 8) << \'\\n\';\nwhile (!q.isEmpty()) cout << q.dequeue() << \' \';\ncout << \'\\n\';','2\n8 4 8 \n','Loop over the original size, not while the queue is nonempty.','Queue<int> q; assert(replaceAll(q,1,2)==0); q.enqueue(1); q.enqueue(3); assert(replaceAll(q,1,2)==1); assert(q.dequeue()==2 && q.dequeue()==3);')
add('queue-clear','Queue · clear and reuse','queue',['Remove all queue items; return the number removed.','Use public operations. Demonstrate that enqueue() still works afterward.'],queue+'''\nint clearQueue(Queue<int>& q) {
    int removed = 0;
    while (!q.isEmpty()) {
        q.dequeue(); // dequeue also updates head/tail and frees each node.
        ++removed;
    }
    return removed;
}''','Queue<int> q;\nq.enqueue(1); q.enqueue(2);\ncout << clearQueue(q) << \'\\n\';\nq.enqueue(9);\ncout << q.dequeue() << \'\\n\';','2\n9\n','A cleared linked queue must have both head and tail null.','Queue<int> q; assert(clearQueue(q)==0); q.enqueue(2); assert(clearQueue(q)==1); q.enqueue(3); assert(q.dequeue()==3);')
listbase=old['exam-list-count-even']['code'].split('    int countEven()')[0]
def listadd(slug,title,question,method,use,out,watch,checks):
    add(slug,title,'list',question,listbase+method+'\n};\n',use,out,watch,checks)
listadd('list-size','List · count nodes',['Count the nodes in a linked list.','Add size() const. Traverse from head; return zero for an empty list.'],'''    int size() const {
        int count = 0;
        for (IntSLLNode* p = head; p != nullptr; p = p->next) ++count;
        return count; // p moves; head stays unchanged.
    }''','IntSLList list;\nlist.addToTail(4); list.addToTail(8);\ncout << list.size() << \'\\n\';','2\n','Move a temporary pointer, not head.','IntSLList list; assert(list.size()==0); list.addToTail(1); assert(list.size()==1);')
listadd('list-sum','List · sum values',['Add up all linked-list values.','Add sum() const; return zero for an empty list.'],'''    int sum() const {
        int total = 0;
        for (IntSLLNode* p = head; p != nullptr; p = p->next) total += p->info;
        return total;
    }''','IntSLList list;\nlist.addToTail(3); list.addToTail(-1); list.addToTail(5);\ncout << list.sum() << \'\\n\';','7\n','Read p->info and advance with p->next.','IntSLList list; assert(list.sum()==0); list.addToTail(-2); assert(list.sum()==-2);')
listadd('list-find','List · find a value',['Return whether a linked list contains a target.','Add contains(target) const. Return false if no node matches.'],'''    bool contains(int target) const {
        for (IntSLLNode* p = head; p != nullptr; p = p->next)
            if (p->info == target) return true; // Reading only: early return is safe.
        return false;
    }''','IntSLList list;\nlist.addToTail(4); list.addToTail(8);\ncout << list.contains(8) << \' \' << list.contains(2) << \'\\n\';','1 0\n','Check p is not null before reading its info.','IntSLList list; assert(!list.contains(1)); list.addToTail(1); assert(list.contains(1));')
listadd('list-head','List · add at the front',['Insert a new node at the front of a linked list.','Add addToHead(value). If the list was empty, also update tail.'],'''    void addToHead(int value) {
        head = new IntSLLNode(value, head); // New node links to the OLD head.
        if (tail == nullptr) tail = head; // First node is both ends.
    }''','IntSLList list;\nlist.addToHead(2); list.addToHead(1); list.addToTail(3);\nlist.print();','1 2 3 \n','Link the new node before losing the old head pointer.','IntSLList list; list.addToHead(2); list.addToHead(1); list.addToTail(3);')
listadd('list-increase','List · increase every value',['Add an amount to every linked-list value.','Add increaseAll(amount). Keep the links and order unchanged.'],'''    void increaseAll(int amount) {
        for (IntSLLNode* p = head; p != nullptr; p = p->next)
            p->info += amount; // Change data, not links.
    }''','IntSLList list;\nlist.addToTail(1); list.addToTail(4);\nlist.increaseAll(3);\nlist.print();','4 7 \n','This modifies data, so the method is not const.','IntSLList list; list.increaseAll(5); list.addToTail(1); list.increaseAll(-1);')
assert len(items)==30
assert sum(x['facets']['structure']=='inheritance' for x in items)==15
(ROOT/'comp139e/short-drills.json').write_text(json.dumps(items,indent=2)+'\n')
print('Generated 30 short questions.')
