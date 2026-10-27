"""Additive practice bank: simplified variants of the inheritance and container labs."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
items=[]
includes='#include <iostream>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\n'
def add(slug,title,kind,question,code,use,output,parts,watch,checks=''):
    n=len(items)+1
    items.append(dict(id='exam-'+slug,group='exam-drills',title=f'{n:02d} · {title}',shortTitle=f'{n:02d} · {title}',when=question[0],question=question,code=includes+code,use=use,expected=output.strip(),expectedOutput=output,parts=parts,change='Use this when the required operations match the question. Rename the classes and fields, then change the sample data and required formula. Keep the ownership and empty-case checks.',watch=watch,reference='workspace/reference/course/labs/139E - Lab '+('5' if kind=='inheritance' and 'controller' in slug else '6')+'.html',referenceLabel='Related course lab',sourceNote='Practice based on the course labs and lectures.',manualComments=True,facets=dict(structure=kind,storage='none' if kind=='inheritance' else 'linked',type='template' if 'template <' in code else 'int',role='example'),checks=checks))
# Each pair demonstrates a different simple calculation behind one shared interface.
def pair(slug,title,base,method,field,a,afields,aexpr,b,bfields,bexpr,av,bv,out):
    def cls(name,fields,expr):
        args=', '.join('double '+f+'Value' for f in fields)
        init=', '.join(f+'('+f+'Value)' for f in fields)
        return f'''// DERIVED: {name} supplies its own {method} calculation.
class {name} : public {base} {{
private:
    double {', '.join(fields)};
public:
    {name}(string label, {args}) : {base}(label), {init} {{}}
    double {method}() const override {{ return {expr}; }}
}};
'''
    code=f'''// ABSTRACT BASE: keep the shared name here; derived classes supply the calculation.
class {base} {{
protected:
    string {field};
public:
    {base}(string label) : {field}(label) {{}}
    string getName() const {{ return {field}; }}
    virtual double {method}() const = 0;
    virtual ~{base}() = default; // Safe cleanup through a base pointer.
}};
'''+cls(a,afields,aexpr)+cls(b,bfields,bexpr)
    use=f'''{a} first("A", {av});
{b} second("B", {bv});
// Base pointers preserve polymorphism; these stack objects need no delete.
{base}* objects[] = {{&first, &second}};
for ({base}* object : objects)
    cout << object->getName() << ": " << object->{method}() << '\\n';'''
    q=[f'Create an abstract {base} with a shared name and two derived classes.',f'Store string {field} as protected, initialize it in the base constructor, provide getName(), pure virtual double {method}() const and a virtual destructor.',f'{a} stores {", ".join(afields)} and returns {aexpr}. {b} stores {", ".join(bfields)} and returns {bexpr}.',f'In main(), create {a} with values {av} and {b} with values {bv}; call {method}() through an array of {base} pointers.']
    add(slug,title,'inheritance',q,code,use,out,[['Base','Owns the common name and declares the required virtual calculation.'],['Derived classes','Each constructor initializes the base first, then its own numeric fields.'],['main','Calls the same function through base pointers; the actual object selects the override.']],'Match const and the return type exactly. Do not try to instantiate the abstract base.')
pair('pay','Employee pay','Employee','pay','name','HourlyWorker',['hours','rate'],'hours * rate','FixedWorker',['salary'],'salary','6, 20','150','A: 120\nB: 150\n')
pair('perimeter','Shape perimeter','Shape','perimeter','name','Rectangle',['width','height'],'2 * (width + height)','Triangle',['a','b','c'],'a + b + c','3, 4','3, 4, 5','A: 14\nB: 12\n')
pair('delivery','Delivery fee','Delivery','fee','name','LocalDelivery',['distance'],'5 + 2 * distance','ParcelDelivery',['weight'],'4 * weight','3','2','A: 11\nB: 8\n')
pair('tickets','Ticket cost','Ticket','cost','name','AdultTicket',['price'],'price','ChildTicket',['price'],'price / 2','20','20','A: 20\nB: 10\n')
pair('rental','Rental cost','Rental','cost','name','BikeRental',['hours'],'hours * 5','CarRental',['days'],'days * 40','3','2','A: 15\nB: 80\n')
pair('sensor','Sensor conversion','Sensor','read','name','OffsetSensor',['raw','offset'],'raw + offset','ScaleSensor',['raw','factor'],'raw * factor','10, 2','10, 3','A: 12\nB: 30\n')
pair('volume','Solid volume','Solid','volume','name','Box',['length','width','height'],'length * width * height','Cube',['side'],'side * side * side','2, 3, 4','3','A: 24\nB: 27\n')
pair('assessment','Assessment mark','Assessment','mark','name','Quiz',['correct','total'],'100 * correct / total','Project',['score'],'score','8, 10','75','A: 80\nB: 75\n')
add('square-chain','Square inheritance','inheritance',['Create Square by inheriting Rectangle, which inherits abstract Shape.','Shape declares virtual double getArea() const = 0 and a virtual destructor. Rectangle stores protected width and height.','Rectangle implements getArea(). Square accepts one side and passes it twice to Rectangle; reuse the inherited getArea().','In main(), print areas of Rectangle(3,4) and Square(5) through Shape pointers.'],'''class Shape {
public:
    virtual double getArea() const = 0;
    virtual ~Shape() = default;
};
class Rectangle : public Shape {
protected:
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double getArea() const override { return width * height; }
};
class Square : public Rectangle {
public:
    // No duplicate fields or area function: initialize the inherited rectangle.
    Square(double side) : Rectangle(side, side) {}
};
''','''Rectangle rectangle(3, 4);
Square square(5);
Shape* shapes[] = {&rectangle, &square};
for (Shape* shape : shapes) cout << shape->getArea() << '\\n';''','12\n25\n',[['Square','Only adapts construction: both dimensions receive side.'],['Inheritance','Square reuses Rectangle::getArea and is also a Shape.']],'Do not add another width or height inside Square.')
add('account','Savings account','inheritance',['Extend a concrete Account with SavingsAccount.','Account stores protected balance, provides deposit(amount), getBalance(), and virtual display() const.','SavingsAccount stores an interest rate as a decimal, adds applyInterest(), and overrides display(). Include a virtual base destructor.','Start at 100 with rate 0.1, deposit 50, apply interest, and display through Account*.'],'''class Account {
protected:
    double balance;
public:
    Account(double initial) : balance(initial) {}
    virtual ~Account() = default;
    void deposit(double amount) { balance += amount; }
    double getBalance() const { return balance; }
    virtual void display() const { cout << "Balance: " << balance << '\\n'; }
};
class SavingsAccount : public Account {
    double rate;
public:
    SavingsAccount(double initial, double r) : Account(initial), rate(r) {}
    void applyInterest() { balance += balance * rate; } // Update inherited state.
    void display() const override {
        cout << "Savings ";
        Account::display(); // Reuse the base implementation explicitly.
    }
};
''','''SavingsAccount savings(100, 0.1);
savings.deposit(50); // Inherited function.
savings.applyInterest();
Account* account = &savings;
account->display();''','Savings Balance: 165\n',[['Base state','balance is protected so SavingsAccount can update it.'],['Base call','Account::display avoids recursively calling the override.']],'Rate 0.1 means 10%; call applyInterest on the derived object.')
add('message','Message printing','inheritance',['Implement an abstract Message and two printable message types.','Message stores protected text and declares virtual void print() const = 0 plus a virtual destructor.','PlainMessage prints text. WarningMessage prints WARNING: followed by text.','Allocate one of each with new, print through Message pointers, then delete both.'],'''class Message {
protected:
    string text;
public:
    Message(string t) : text(t) {}
    virtual void print() const = 0;
    virtual ~Message() = default;
};
class PlainMessage : public Message {
public:
    PlainMessage(string t) : Message(t) {}
    void print() const override { cout << text << '\\n'; }
};
class WarningMessage : public Message {
public:
    WarningMessage(string t) : Message(t) {}
    void print() const override { cout << "WARNING: " << text << '\\n'; }
};
''','''Message* messages[] = {new PlainMessage("Ready"), new WarningMessage("Low battery")};
for (Message* message : messages) {
    message->print(); // Virtual dispatch uses the actual message type.
    delete message; // Matches new; base destructor is virtual.
}''','Ready\nWARNING: Low battery\n',[['Abstract method','Both derived classes must implement the exact print signature.'],['Ownership','main owns these allocations and deletes each once.']],'Do not delete stack-allocated objects; these objects were created with new.')
add('controller','Proportional controller','inheritance',['Implement a small version of the controller lab using an abstract Controller.','Controller stores protected setpoint and declares virtual double controlStep(double measured) = 0 and a virtual destructor.','ProportionalController stores gain and returns gain * (setpoint - measured).','With setpoint 10 and gain 2, call through Controller* for measured values 7 and 12.'],'''class Controller {
protected:
    double setpoint;
public:
    Controller(double target) : setpoint(target) {}
    virtual double controlStep(double measured) = 0;
    virtual ~Controller() = default;
};
class ProportionalController : public Controller {
    double gain;
public:
    ProportionalController(double target, double k) : Controller(target), gain(k) {}
    double controlStep(double measured) override {
        double error = setpoint - measured; // Desired minus actual value.
        return gain * error;
    }
};
''','''ProportionalController p(10, 2);
Controller* controller = &p;
cout << controller->controlStep(7) << '\\n';
cout << controller->controlStep(12) << '\\n';''','6\n-4\n',[['Error','Subtract the measurement from the target; the sign matters.'],['Override','The base pointer calls ProportionalController::controlStep.']],'This simple version has no accumulated error or previous-sample state.')
add('limited-controller','Limited controller','inheritance',['Derive LimitedController from a working ProportionalController.','ProportionalController provides virtual controlStep(measured) returning gain * (target - measured).','LimitedController stores a positive output limit, calls the base function, then clamps its result between -limit and +limit.','Test target 10, gain 2, limit 5 with measurements 0, 9 and 20.'],'''class ProportionalController {
    double target, gain;
public:
    ProportionalController(double t, double k) : target(t), gain(k) {}
    virtual ~ProportionalController() = default;
    virtual double controlStep(double measured) { return gain * (target - measured); }
};
class LimitedController : public ProportionalController {
    double limit;
public:
    LimitedController(double t, double k, double maximum)
        : ProportionalController(t, k), limit(maximum) {}
    double controlStep(double measured) override {
        // Calculate once using the parent, then restrict the output range.
        double result = ProportionalController::controlStep(measured);
        if (result > limit) return limit;
        if (result < -limit) return -limit;
        return result;
    }
};
''','''LimitedController limited(10, 2, 5);
ProportionalController* p = &limited;
cout << p->controlStep(0) << '\\n';
cout << p->controlStep(9) << '\\n';
cout << p->controlStep(20) << '\\n';''','5\n2\n-5\n',[['Base call','Qualified call reuses the parent calculation.'],['Clamp','Check upper and lower limits before returning unchanged output.']],'Calling controlStep(measured) without the base qualifier inside the override would recurse.')
add('student','Student description','inheritance',['Derive Student from Person and reuse the base print function.','Person stores a private name, initializes it, and has virtual void print() const plus a virtual destructor.','Student adds a private integer studentId; its print calls Person::print then prints the ID on the same line.','Print Student("Alex", 42) through Person*.'],'''class Person {
    string name; // Private: Student cannot access this field directly.
public:
    Person(string n) : name(n) {}
    virtual ~Person() = default;
    virtual void print() const { cout << name; }
};
class Student : public Person {
    int studentId;
public:
    Student(string name, int id) : Person(name), studentId(id) {}
    void print() const override {
        Person::print(); // The base function can access its own private name.
        cout << " ID " << studentId << '\\n';
    }
};
''','''Student student("Alex", 42);
Person* person = &student;
person->print();''','Alex ID 42\n',[['Private base field','Use a base method rather than directly accessing name.'],['Initializer list','Person(name) constructs the base portion.']],'Do not redeclare name in Student; that creates a separate field.')
add('inventory','Discounted product','inheritance',['Extend Product with DiscountProduct and compute a mixed inventory total.','Product stores protected price, provides virtual double cost() const returning price and a virtual destructor.','DiscountProduct stores discount as a decimal and overrides cost to return price * (1 - discount).','Use Product(50) and DiscountProduct(100, 0.2). Write a free totalCost(Product* items[], int size) and print their total.'],'''class Product {
protected:
    double price;
public:
    Product(double p) : price(p) {}
    virtual ~Product() = default;
    virtual double cost() const { return price; }
};
class DiscountProduct : public Product {
    double discount;
public:
    DiscountProduct(double p, double d) : Product(p), discount(d) {}
    double cost() const override { return price * (1 - discount); }
};
// Free function: use pointers to keep each object's virtual behavior.
double totalCost(Product* items[], int size) {
    double total = 0;
    for (int i = 0; i < size; ++i) total += items[i]->cost();
    return total;
}
''','''Product regular(50);
DiscountProduct sale(100, 0.2);
Product* products[] = {&regular, &sale};
cout << totalCost(products, 2) << '\\n';''','130\n',[['Virtual cost','Product supplies a usable default; DiscountProduct overrides it.'],['totalCost','Accepts an explicit array length and accumulates virtual results.']],'Use Product* rather than copying derived objects into a Product array.')
assert len(items)==15
# Lab-style linked containers: every question carries the complete implementation.
stack='''class StackException : public exception {
    string message;
public:
    StackException(string msg) : message(msg) {}
    const char* what() const noexcept override { return message.c_str(); }
};
template <class T> class Stack {
    struct stackNode { T theItem; stackNode* next; };
    typedef stackNode StackNode;
    StackNode* topOfStack;
    int count;
public:
    Stack() : topOfStack(nullptr), count(0) {}
    Stack(const Stack&) = delete;
    Stack& operator=(const Stack&) = delete;
    ~Stack() { while (!isEmpty()) pop(); }
    bool isEmpty() const { return count == 0; }
    int size() const { return count; }
    void push(T item) {
        // Link the new node to the OLD top before replacing topOfStack.
        StackNode* node = new StackNode{item, topOfStack};
        topOfStack = node;
        ++count;
    }
    T top() const {
        if (isEmpty()) throw StackException("Empty stack");
        return topOfStack->theItem; // Read without removing.
    }
    T pop() {
        if (isEmpty()) throw StackException("Empty stack");
        StackNode* old = topOfStack;
        T value = old->theItem; // Save before deleting the node.
        topOfStack = old->next;
        delete old;
        --count;
        return value;
    }
};
'''
queue='''template <class T> class Queue {
    struct Node { T theItem; Node* next; };
    Node* head;
    Node* tail;
    int count;
public:
    Queue() : head(nullptr), tail(nullptr), count(0) {}
    Queue(const Queue&) = delete;
    Queue& operator=(const Queue&) = delete;
    ~Queue() { while (!isEmpty()) dequeue(); }
    bool isEmpty() const { return head == nullptr; }
    int size() const { return count; }
    void enqueue(T value) {
        Node* node = new Node{value, nullptr};
        if (isEmpty()) head = node; // First node becomes BOTH ends.
        else tail->next = node;
        tail = node;
        ++count;
    }
    T front() const {
        if (isEmpty()) throw runtime_error("Empty queue");
        return head->theItem;
    }
    T dequeue() {
        if (isEmpty()) throw runtime_error("Empty queue");
        Node* old = head;
        T value = old->theItem;
        head = head->next;
        if (head == nullptr) tail = nullptr; // Last node was removed.
        delete old;
        --count;
        return value;
    }
};
'''
listbase='''struct IntSLLNode {
    int info;
    IntSLLNode* next;
    IntSLLNode(int value, IntSLLNode* link = nullptr) : info(value), next(link) {}
};
class IntSLList {
    IntSLLNode* head;
    IntSLLNode* tail;
public:
    IntSLList() : head(nullptr), tail(nullptr) {}
    IntSLList(const IntSLList&) = delete;
    IntSLList& operator=(const IntSLList&) = delete;
    ~IntSLList() {
        while (head != nullptr) {
            IntSLLNode* old = head;
            head = head->next; // Keep the remaining chain before deleting.
            delete old;
        }
    }
    void addToTail(int value) {
        IntSLLNode* node = new IntSLLNode(value);
        if (head == nullptr) head = node;
        else tail->next = node;
        tail = node;
    }
    void print() const {
        for (IntSLLNode* p = head; p != nullptr; p = p->next) cout << p->info << ' ';
        cout << '\\n';
    }
METHODS};
'''
def ds(slug,title,kind,q,helper,use,out,watch,checks='',methods=''):
 code={'stack':stack,'queue':queue,'list':listbase.replace('METHODS',methods)}[kind]+helper
 add(slug,title,kind,q,code,use,out,[['Container','Owns its linked nodes; constructor starts empty and destructor releases nodes.'],['Operation','The comments identify the traversal, updates and stopping conditions.'],['main','Builds sample data and prints the result and any preserved contents.']],watch,checks)
ds('stack-basic','Build a stack','stack',['Implement a template linked Stack<T> using the lab member names.','Provide push, pop returning the item, top, size, isEmpty and a destructor. Throw StackException on empty pop/top.','Push 3 and 8, print top and size, pop both, then catch an empty pop.'],'','''Stack<int> s;
s.push(3); s.push(8);
cout << s.top() << ' ' << s.size() << '\\n';
cout << s.pop() << ' ' << s.pop() << '\\n';
try { s.pop(); } catch (const exception& e) { cout << e.what() << '\\n'; }''','8 2\n8 3\nEmpty stack\n','top() must not change count; pop() decrements it.', 'Stack<int> s; assert(s.isEmpty()); bool caught=false; try{s.top();}catch(const StackException&){caught=true;} assert(caught); s.push(1); assert(s.pop()==1 && s.size()==0);')
ds('stack-above','Count above limit','stack',['Write countAbove(Stack<int>& s, int limit) using only public stack operations.','Count values strictly greater than limit and leave the stack in its original order. Use one temporary stack.','Test values 4,9,2,7 with limit 5, then print the original stack by popping it.'],'''int countAbove(Stack<int>& s, int limit) {
    Stack<int> temporary;
    int count = 0;
    while (!s.isEmpty()) {
        int value = s.pop();
        if (value > limit) ++count; // Compare the ITEM, not the stack object.
        temporary.push(value);
    }
    // Second reversal restores the original order.
    while (!temporary.isEmpty()) s.push(temporary.pop());
    return count;
}
''','''Stack<int> s;
for (int x : {4, 9, 2, 7}) s.push(x);
cout << countAbove(s, 5) << '\\n';
while (!s.isEmpty()) cout << s.pop() << ' ';
cout << '\\n';''','2\n7 2 9 4 \n','Use >, not >=. Restoring is necessary because pop changes the input.','Stack<int> s; assert(countAbove(s,5)==0); s.push(5);s.push(6); assert(countAbove(s,5)==1);assert(s.pop()==6 && s.pop()==5);')
ds('stack-sum','Sum without changing','stack',['Write sumStack(Stack<int>& s) with public operations only.','Return the sum while preserving the stack order; use a temporary stack.','Test 3,-2,8. Print the sum and unchanged top.'],'''int sumStack(Stack<int>& s) {
    Stack<int> temporary;
    int sum = 0;
    while (!s.isEmpty()) {
        int value = s.pop();
        sum += value;
        temporary.push(value);
    }
    while (!temporary.isEmpty()) s.push(temporary.pop()); // Restore order.
    return sum;
}
''','''Stack<int> s;
s.push(3); s.push(-2); s.push(8);
cout << sumStack(s) << '\\n';
cout << s.top() << '\\n';''','9\n8\n','An empty stack has sum 0. Do not return before restoring the input.','Stack<int> s; assert(sumStack(s)==0);s.push(-5); assert(sumStack(s)==-5 && s.pop()==-5);')
ds('stack-remove-negative','Remove negatives','stack',['Remove all negative values from a stack using public operations.','Preserve the relative order of retained values. Zero is retained.','Push 4,-2,0,-7,9; remove negatives and print by popping.'],'''void removeNegatives(Stack<int>& s) {
    Stack<int> kept;
    while (!s.isEmpty()) {
        int value = s.pop();
        if (value >= 0) kept.push(value); // Discard only negatives.
    }
    while (!kept.isEmpty()) s.push(kept.pop()); // Restore retained order.
}
''','''Stack<int> s;
for (int x : {4, -2, 0, -7, 9}) s.push(x);
removeNegatives(s);
while (!s.isEmpty()) cout << s.pop() << ' ';
cout << '\\n';''','9 0 4 \n','One transfer reverses order; the second transfer restores it.','Stack<int> s;removeNegatives(s);s.push(-1);s.push(-2);removeNegatives(s);assert(s.isEmpty());s.push(0);removeNegatives(s);assert(s.pop()==0);')
ds('stack-palindrome','Palindrome with stack','stack',['Use Stack<char> to test whether a string is a palindrome.','Push all characters, then compare popped characters with the original string. Match exactly, including case and spaces.','Test level and code.'],'''bool isPalindrome(const string& text) {
    Stack<char> reversed;
    for (char ch : text) reversed.push(ch);
    for (char ch : text) {
        if (ch != reversed.pop()) return false; // Compare against reversed order.
    }
    return true; // Empty and one-character strings also match.
}
''','''cout << boolalpha << isPalindrome("level") << '\\n';
cout << isPalindrome("code") << '\\n';''','true\nfalse\n','The local stack destructor cleans remaining nodes even when returning early.','assert(isPalindrome(""));assert(isPalindrome("a"));assert(!isPalindrome("Aa"));')
ds('queue-basic','Build a queue','queue',['Implement a template linked Queue<T> with head and tail.','Provide enqueue, dequeue returning the item, front, size, isEmpty and destructor; throw runtime_error when empty.','Enqueue 4 and 8, print front and size, dequeue both, then enqueue 12 to prove reuse works.'],'','''Queue<int> q;
q.enqueue(4); q.enqueue(8);
cout << q.front() << ' ' << q.size() << '\\n';
cout << q.dequeue() << ' ' << q.dequeue() << '\\n';
q.enqueue(12);
cout << q.dequeue() << '\\n';''','4 2\n4 8\n12\n','Removing the last node must reset tail.','Queue<int> q;bool caught=false;try{q.dequeue();}catch(const runtime_error&){caught=true;}assert(caught);q.enqueue(3);assert(q.front()==3 && q.size()==1);assert(q.dequeue()==3 && q.isEmpty());')
ds('queue-count','Count queue matches','queue',['Count occurrences of a target in a queue without changing its order.','Use public operations only. Save the initial size and rotate exactly that many items.','For 2,7,2,9 count target 2, then print the queue.'],'''int countMatches(Queue<int>& q, int target) {
    int count = 0;
    int originalSize = q.size(); // Fixed bound: dequeue + enqueue keeps size unchanged.
    for (int i = 0; i < originalSize; ++i) {
        int value = q.dequeue();
        if (value == target) ++count;
        q.enqueue(value); // One full rotation restores the order.
    }
    return count;
}
''','''Queue<int> q;
for (int x : {2, 7, 2, 9}) q.enqueue(x);
cout << countMatches(q, 2) << '\\n';
while (!q.isEmpty()) cout << q.dequeue() << ' ';
cout << '\\n';''','2\n2 7 2 9 \n','while(!q.isEmpty()) would never end if every removed item is re-enqueued.','Queue<int> q;assert(countMatches(q,2)==0);q.enqueue(2);assert(countMatches(q,2)==1 && q.dequeue()==2);')
ds('queue-sum','Queue sum / average','queue',['Compute a queue sum without changing its order.','Write sumQueue using a fixed number of dequeue/enqueue operations. In main compute a floating-point average, or print Empty for an empty queue.','Test 2,3,6; print sum and average.'],'''int sumQueue(Queue<int>& q) {
    int total = 0;
    int n = q.size();
    for (int i = 0; i < n; ++i) {
        int value = q.dequeue();
        total += value;
        q.enqueue(value); // Preserve every item and complete the rotation.
    }
    return total;
}
''','''Queue<int> q;
q.enqueue(2); q.enqueue(3); q.enqueue(6);
if (q.isEmpty()) cout << "Empty\\n";
else {
    int total = sumQueue(q);
    cout << total << '\\n';
    cout << static_cast<double>(total) / q.size() << '\\n';
}''','11\n3.66667\n','Cast before dividing; never divide by an empty queue size.','Queue<int> q;assert(sumQueue(q)==0);q.enqueue(-2);q.enqueue(3);assert(sumQueue(q)==1 && q.dequeue()==-2 && q.dequeue()==3);')
ds('queue-threshold','Keep passing scores','queue',['Remove scores below a pass mark from a queue.','Use public operations, preserve retained order, and examine only the original items. Scores equal to the mark pass.','Test 45,70,50,20,90 with pass mark 50, then print retained scores.'],'''void keepPassing(Queue<int>& q, int passMark) {
    int originalSize = q.size(); // Do not use a shrinking q.size() as the bound.
    for (int i = 0; i < originalSize; ++i) {
        int score = q.dequeue();
        if (score >= passMark) q.enqueue(score); // Failed scores are dropped.
    }
}
''','''Queue<int> q;
for (int x : {45, 70, 50, 20, 90}) q.enqueue(x);
keepPassing(q, 50);
while (!q.isEmpty()) cout << q.dequeue() << ' ';
cout << '\\n';''','70 50 90 \n','The loop must use originalSize because filtering can reduce the queue size.','Queue<int> q;keepPassing(q,50);q.enqueue(20);keepPassing(q,50);assert(q.isEmpty());q.enqueue(50);keepPassing(q,50);assert(q.dequeue()==50);')
ds('queue-append','Append two queues','queue',['Move all items from source onto the end of destination.','Write appendQueue(Queue<int>& destination, Queue<int>& source). Preserve each queue\'s FIFO order; source ends empty.','Start destination with 1,2 and source with 3,4. Print destination after appending. Handle both references naming the same queue by doing nothing.'],'''void appendQueue(Queue<int>& destination, Queue<int>& source) {
    if (&destination == &source) return; // Otherwise dequeue/enqueue would loop forever.
    while (!source.isEmpty()) destination.enqueue(source.dequeue());
}
''','''Queue<int> destination, source;
destination.enqueue(1); destination.enqueue(2);
source.enqueue(3); source.enqueue(4);
appendQueue(destination, source);
while (!destination.isEmpty()) cout << destination.dequeue() << ' ';
cout << '\\n' << boolalpha << source.isEmpty() << '\\n';''','1 2 3 4 \ntrue\n','This operation moves the values; it does not preserve the source.','Queue<int> a,b;appendQueue(a,b);a.enqueue(1);appendQueue(a,a);assert(a.size()==1);appendQueue(b,a);assert(a.isEmpty() && b.dequeue()==1);')
ds('list-count-even','Count even nodes','list',['Add countEven() const to a singly linked list.','Walk nodes directly without changing head, tail or any link. Count values divisible by 2, including zero and negative evens.','Store 3,4,0,-2,7; print the count and unchanged list.'],'','''IntSLList list;
for (int x : {3, 4, 0, -2, 7}) list.addToTail(x);
cout << list.countEven() << '\\n';
list.print();''','3\n3 4 0 -2 7 \n','Use a local traversal pointer, not head itself.','IntSLList l;assert(l.countEven()==0);l.addToTail(-4);l.addToTail(1);assert(l.countEven()==1);',methods='''    int countEven() const {
        int count = 0;
        for (IntSLLNode* p = head; p != nullptr; p = p->next)
            if (p->info % 2 == 0) ++count;
        return count;
    }
''')
ds('list-replace','Replace values','list',['Add replaceAll(oldValue,newValue) to a singly linked list.','Change matching info fields and return the number of replacements. Preserve all links.','For 2,5,2,8 replace 2 with 9; print replacement count and final list.'],'','''IntSLList list;
for (int x : {2, 5, 2, 8}) list.addToTail(x);
cout << list.replaceAll(2, 9) << '\\n';
list.print();''','2\n9 5 9 8 \n','Update data, not pointers. Count matches even when oldValue equals newValue.','IntSLList l;assert(l.replaceAll(1,2)==0);l.addToTail(1);assert(l.replaceAll(1,1)==1);assert(l.replaceAll(1,2)==1);',methods='''    int replaceAll(int oldValue, int newValue) {
        int count = 0;
        for (IntSLLNode* p = head; p != nullptr; p = p->next) {
            if (p->info == oldValue) {
                p->info = newValue; // Links stay exactly as they were.
                ++count;
            }
        }
        return count;
    }
''')
ds('list-insert-before','Insert before match','list',['Add insertBefore(target,value), inserting before the first matching node.','Return true if inserted, false if target is absent. Handle a match at head.','Build 3,7,9, insert 5 before 7 and 1 before 3; print the result.'],'','''IntSLList list;
for (int x : {3, 7, 9}) list.addToTail(x);
list.insertBefore(7, 5);
list.insertBefore(3, 1);
list.print();''','1 3 5 7 9 \n','New node points to current; predecessor then points to new node. Tail stays unchanged.','IntSLList l;assert(!l.insertBefore(1,0));l.addToTail(1);assert(l.insertBefore(1,0));assert(!l.insertBefore(8,7));',methods='''    bool insertBefore(int target, int value) {
        IntSLLNode* previous = nullptr;
        IntSLLNode* current = head;
        while (current != nullptr && current->info != target) {
            previous = current;
            current = current->next;
        }
        if (current == nullptr) return false;
        IntSLLNode* node = new IntSLLNode(value, current);
        if (previous == nullptr) head = node; // Inserting before the old head.
        else previous->next = node;
        return true;
    }
''')
ds('list-remove-front','Remove first node','list',['Add deleteFromHead() returning the removed value.','Throw runtime_error on an empty list. Reset tail when the last node is removed.','Build 4,8; remove both, append 12 to the emptied list, and print it.'],'','''IntSLList list;
list.addToTail(4); list.addToTail(8);
cout << list.deleteFromHead() << ' ' << list.deleteFromHead() << '\\n';
list.addToTail(12);
list.print();''','4 8\n12 \n','Save the value and next pointer before delete.','IntSLList l;bool caught=false;try{l.deleteFromHead();}catch(const runtime_error&){caught=true;}assert(caught);l.addToTail(1);assert(l.deleteFromHead()==1);l.addToTail(2);assert(l.deleteFromHead()==2);',methods='''    int deleteFromHead() {
        if (head == nullptr) throw runtime_error("Empty list");
        IntSLLNode* old = head;
        int value = old->info;
        head = old->next;
        if (head == nullptr) tail = nullptr; // The sole node was removed.
        delete old;
        return value;
    }
''')
ds('list-remove-after','Remove after match','list',['Add removeAfter(target), deleting the node after the first matching value.','Return false if target is missing or has no successor. Update tail if the deleted node was last.','Build 2,4,6,8; removeAfter(4), removeAfter(4) again, then append 10 and print.'],'','''IntSLList list;
for (int x : {2, 4, 6, 8}) list.addToTail(x);
list.removeAfter(4); // Removes 6.
list.removeAfter(4); // Removes 8, so 4 becomes tail.
list.addToTail(10);
list.print();''','2 4 10 \n','Reconnect current->next before deleting the successor.','IntSLList l;assert(!l.removeAfter(1));l.addToTail(1);assert(!l.removeAfter(1));l.addToTail(2);assert(l.removeAfter(1));l.addToTail(3);assert(l.removeAfter(1));',methods='''    bool removeAfter(int target) {
        IntSLLNode* current = head;
        while (current != nullptr && current->info != target) current = current->next;
        if (current == nullptr || current->next == nullptr) return false;
        IntSLLNode* old = current->next;
        current->next = old->next; // Bypass the node to be removed.
        if (old == tail) tail = current;
        delete old;
        return true;
    }
''')
assert len(items)==30
for x in items:
    if x['facets']['structure']=='inheritance': x['typeLabel']='non-template'
    # Explicit standard headers for the classroom loops and exception base.
    x['code']=x['code'].replace('#include <stdexcept>','#include <stdexcept>\n#include <exception>\n#include <initializer_list>')
    x['expected']='\n'.join(l.rstrip() for l in x['expected'].splitlines())
(ROOT/'comp139e/exam-drills.json').write_text(json.dumps(items,indent=2)+'\n')
print('Generated 30 new drills: 15 inheritance, 5 stack, 5 queue, 5 list.')
