"""Course-based lab solutions and extra implementation drills (not official answers)."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
folder=root/'comp139e'
old={x['id']:x for x in json.loads((folder/'midterm-patterns.json').read_text())}
items=[]
def combine(*parts):
 inc=[]; bodies=[]
 for p in parts:
  lines=[]
  for line in p.strip().splitlines():
   if line.startswith('#include'):
    if line not in inc: inc.append(line)
   elif line.strip()!='using namespace std;': lines.append(line)
  bodies.append('\n'.join(lines).strip())
 return '\n'.join(inc)+'\nusing namespace std;\n\n'+'\n\n'.join(bodies)+'\n'
def add(id,title,lab,code,use,test,when,change,watch,**kwargs):
 x=dict(id=id,title=title,group='lab-solutions' if id.startswith('lab0') else 'lab-variants',lab=lab,code=combine(code),use=use,test=test,when=when,change=change,watch=watch,reference=f'workspace/reference/course/labs/139E - Lab {lab}.html',parts=[['Recognize this pattern',when],['Adapt it',change],['Check before copying',watch]],**kwargs)
 items.append(x);return x
survey=r'''#include <iostream>
#include <cmath>
#include <stdexcept>
const double PI = 3.14159265358979323846;
void getUserInput(double& radius, double& pegDist, double& spacing) {
    cout << "Radius, peg distance, maximum spacing: ";
    if (!(cin >> radius >> pegDist >> spacing)) throw invalid_argument("Use numbers");
}
int getNumberOfLights(double radius, double pegDist, double spacing) {
    if (radius <= 0 || pegDist <= 0 || pegDist > 2*radius || spacing <= 0)
        throw invalid_argument("Require R>0, 0<chord<=2R, spacing>0");
    double arcAngle = 2 * asin(pegDist / (2 * radius));
    return static_cast<int>(ceil(radius * arcAngle / spacing)) + 1;
}
void calculateLightPositions(double radius, double pegDist, int numLights,
                             double angles[], double distances[]) {
    double halfArcAngle = asin(pegDist / (2 * radius));
    angles[0] = distances[0] = 0;
    for (int i=1; i<numLights; ++i) {
        double halfCentralAngle = halfArcAngle * i / (numLights-1);
        angles[i] = halfArcAngle - halfCentralAngle;
        distances[i] = 2 * radius * sin(halfCentralAngle);
    }
}
void outputResults(const double angles[], const double distances[], int numLights) {
    cout << numLights << " streetlights\n";
    for (int i=0; i<numLights; ++i) {
        cout << i+1 << ": distance=" << distances[i];
        if (i>0) cout << ", angle=" << angles[i]*180/PI << " degrees";
        cout << '\n';
    }
}'''
add('lab01-survey','Lab 1 · Surveying and dynamic arrays',1,survey,r'''double radius, pegDist, spacing;
try {
    getUserInput(radius, pegDist, spacing);
    int numLights = getNumberOfLights(radius, pegDist, spacing);
    double* angles = new double[numLights];
    double* distances = new double[numLights];
    calculateLightPositions(radius, pegDist, numLights, angles, distances);
    outputResults(angles, distances, numLights);
    delete[] angles;
    delete[] distances;
} catch (const exception& e) { cout << e.what() << '\n'; }''',r'''assert(getNumberOfLights(100,100,20)==7);
double a[7],d[7];calculateLightPositions(100,100,7,a,d);
assert(abs(d[6]-100)<1e-9 && abs(a[6])<1e-9 && d[0]==0);
bool caught=false;try{getNumberOfLights(1,3,1);}catch(const invalid_argument&){caught=true;}assert(caught);''','Find a count at runtime, allocate two arrays, fill them in a function, then release them.','Change the geometry formula and outputs; keep ceil for a maximum allowed gap and include both endpoints.','Uses the minor arc and assumes a practical number of lights; do not use integer division for angles.',stdin='100 100 20\n',expected='For 100 100 20: 7 lights; first distance 0, final distance 100.')
grades=r'''#include <iostream>
#include <string>
#include <cmath>
#include <limits>
const double MIN_MARK=0, MAX_MARK=100, MIN_WEIGHT=1, MAX_WEIGHT=50;
const double REQUIRED_WEIGHT=100, WEIGHT_TOLERANCE=0.1;
bool getValidNumber(string prompt, double* value, const double min, const double max) {
    while (true) {
        cout << prompt;
        if (!(cin >> *value)) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return false;
        }
        if (*value >= min && *value <= max) return true;
        cout << "Number is out of range. Try again.\n";
    }
}
string gradeFromMark(const double mark) {
    // Check these example boundaries against your course outline.
    if (mark>=90) return "A+";
    else if (mark>=85) return "A";
    else if (mark>=80) return "A-";
    else if (mark>=77) return "B+";
    else if (mark>=73) return "B";
    else if (mark>=70) return "B-";
    else if (mark>=65) return "C+";
    else if (mark>=60) return "C";
    else if (mark>=50) return "D";
    else return "F";
}'''
add('lab02-grades','Lab 2 · Validated input and weighted grades',2,grades,r'''double mark, weight, total=0, totalWeight=0;
while (getValidNumber("Mark: ", &mark, MIN_MARK, MAX_MARK)) {
    if (!getValidNumber("Weight: ", &weight, MIN_WEIGHT, MAX_WEIGHT)) break;
    total += mark * weight / 100.0;
    totalWeight += weight;
}
cout << "Input data terminated.\n";
if (abs(totalWeight-REQUIRED_WEIGHT) <= WEIGHT_TOLERANCE + 1e-9)
    cout << "Mark is " << total << " and grade is " << gradeFromMark(total) << '\n';
else cout << "Weights must total 100%.\n";''','assert(abs(total-89.1)<1e-9 && totalWeight==100);assert(gradeFromMark(89.1)=="A");','Validate through a pointer, retry out-of-range input, stop on a non-number, accumulate without arrays.','Replace named limits and grade thresholds; keep validation independent of marks or weights.','Grade boundaries are examples: the supplied lab gives 89.1 → A but does not contain the full course-outline table.',stdin='85 30 92 50 88 20 q\n',expected='85×30%, 92×50%, 88×20% gives 89.1 and A.')
spherical=r'''#include <iostream>
#include <cmath>
#include <algorithm>
#include <stdexcept>
const double PI=3.14159265358979323846;
struct SphericalCoords { double radius, azimuth, inclination; };
inline double getRadius(double x, double y, double z=0) {
    return sqrt(x*x + y*y + z*z);
}
double* sphericalToRectangular(double r, double azimuth, double inclination=PI/2) {
    if (r<0) throw invalid_argument("Negative radius");
    return new double[3]{r*sin(inclination)*cos(azimuth),
                         r*sin(inclination)*sin(azimuth), r*cos(inclination)};
}
SphericalCoords rectangularToSpherical(double x, double y, double z=0) {
    double r=getRadius(x,y,z);
    if (r==0) return {0,0,0}; // Direction undefined: choose zero angles.
    return {r, atan2(y,x), acos(max(-1.0,min(1.0,z/r)))};
}'''
add('lab03-coordinates','Lab 3 · Struct results, persistent arrays, defaults',3,spherical,r'''SphericalCoords s=rectangularToSpherical(3,4);
double* xyz=sphericalToRectangular(s.radius,s.azimuth,s.inclination);
cout << s.radius << " -> " << xyz[0] << ", " << xyz[1] << ", " << xyz[2] << '\n';
delete[] xyz;''','assert(getRadius(3,4)==5);double* a=sphericalToRectangular(2,0);double* b=sphericalToRectangular(3,0);assert(a!=b && abs(a[0]-2)<1e-9 && abs(b[0]-3)<1e-9);delete[] a;delete[] b;assert(rectangularToSpherical(0,0).radius==0);','Return a fixed group as a struct; return a new array when the caller needs persistent indexed storage.','Change the fields or formulas; put default arguments in the header declaration when splitting files.','Caller must delete[] each returned array. This is a one-file study version; the original lab requires spherical.hpp and spherical.cpp.',expected='Radius 5; round trip returns approximately 3, 4, 0.')
files=r'''#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cctype>
#include <stdexcept>
void processText(istream& input, ostream& output) {
    while (input >> ws && input.peek()!=char_traits<char>::eof()) {
        int first=input.peek();
        if (isdigit(static_cast<unsigned char>(first)) || first=='+' || first=='-') {
            int number;
            if (!(input >> number)) throw runtime_error("Invalid integer");
            output << "Found an integer: " << number << '\n';
        } else {
            string word; input >> word;
            output << "Found a " << word.length() << " character word: " << word << '\n';
        }
    }
    if (input.bad() || !output) throw runtime_error("I/O error");
}'''
add('lab04-parser','Lab 4 · Command-line files, peek, append',4,files,r'''if (argc!=3) { cout << "Usage: program input.txt output.txt\n"; return 1; }
try {
    ifstream input(argv[1]);
    ofstream output(argv[2],ios::app);
    if (!input || !output) throw runtime_error("Could not open files");
    processText(input,output);
} catch (const exception& e) { cout << e.what() << '\n'; return 1; }''',r'''istringstream input("hello -12 +7 world");ostringstream output;processText(input,output);assert(output.str()=="Found a 5 character word: hello\nFound an integer: -12\nFound an integer: 7\nFound a 5 character word: world\n");''','Read filenames from argc/argv, classify one peeked character, extract the entire word or integer, append output.','Change the output labels or processing function; keep ios::app if existing output must survive.','Assumes the handout’s valid words and integers. In a terminal run: ./program input.txt output.txt.',mainSignature='int main(int argc, char* argv[])',runArgs=['input.txt','output.txt'],fixtures={'input.txt':'hello -12 +7 world\n'},expected='Appends four classified lines for hello -12 +7 world.')
controller=r'''#include <iostream>
#include <cmath>
#include <stdexcept>
#include <vector>
class Controller {
public:
    static constexpr double deltaT=1.0;
    virtual double controlStep(double plantOutput, double setpoint)=0;
    virtual ~Controller()=default;
};
class ProportionalController : public Controller {
    double kc;
public:
    ProportionalController(double propGain) : kc(propGain) {}
    double controlStep(double plantOutput, double setpoint) override {
        double error=setpoint-plantOutput;
        return setpoint+kc*error;
    }
};
class PID_Controller : public Controller {
    double kc,ti,td,q,previousOutput;
public:
    PID_Controller(double propGain,double integralTime,double derivativeTime)
        : kc(propGain),ti(integralTime),td(derivativeTime),q(0),previousOutput(0) {
        if (ti<=0 || td<0) throw invalid_argument("Require ti>0 and td>=0");
    }
    double controlStep(double plantOutput, double setpoint) override {
        double error=setpoint-plantOutput;
        q=0.9*q+0.1*error;
        double result=setpoint+kc*(error+deltaT/ti*q-td/deltaT*(plantOutput-previousOutput));
        previousOutput=plantOutput;
        return result;
    }
};
class Plant {
    int order;
    vector<double> b,a,state;
public:
    Plant(const double num[],const double den[],int order)
        : order(order),b(num,num+order+1),a(den,den+order+1),state(order+1,0) {}
    double plantResponse(double input) {
        double y=b[0]*input+state[0];
        for (int k=0;k<order;++k) state[k]=state[k+1]+input*b[k+1]-y*a[k+1];
        return y;
    }
};'''
add('lab05-controller','Lab 5 · Controller inheritance and PID state',5,controller,r'''const double num[]={0.023018459508916,0.046036919017832,0.023018459508916};
const double den[]={1,-1.618519638615533,0.710593476651197};
Plant plant(num,den,2);
PID_Controller pidController(0.5,25,2.5);
Controller* controller=&pidController;
double y=plant.plantResponse(0);
cout << "Y = [\n";
for (int step=0;step<50;++step) {
    double input=controller->controlStep(y,1);
    y=plant.plantResponse(input);
    cout << input << " " << y << '\n';
}
cout << "];\n";''','ProportionalController p(0.3);assert(abs(p.controlStep(0,1)-1.3)<1e-9);PID_Controller pid(0.5,25,2.5);assert(abs(pid.controlStep(0,1)-1.502)<1e-9);assert(abs(pid.controlStep(0,1)-1.5038)<1e-9);','Derive from an abstract Controller, override controlStep, keep q and previousOutput between calls.','Change the controller algorithm; keep the same interface so the driver still uses Controller*.','Uses the handout’s leaky integral q=0.9q+0.1error, not a cumulative sum. Assumes finite inputs and normalized plant coefficients.',expected='50 plant input/output rows, ready to paste into MATLAB as Y.')
shapes=r'''#include <iostream>
class Shape {
    int x,y;
protected:
    virtual void printMe(ostream& out) const=0;
public:
    Shape(int xLoc,int yLoc) : x(xLoc),y(yLoc) {}
    virtual ~Shape()=default;
    void moveTo(int x,int y) { this->x=x; this->y=y; }
    int getX() const { return x; }
    int getY() const { return y; }
    virtual void draw() const=0;
    friend ostream& operator<<(ostream& out,const Shape& shape) {
        shape.printMe(out); return out;
    }
};
class Rectangle : public Shape {
    double length,width;
protected:
    void printMe(ostream& out) const override { out << "Rectangle " << length << " x " << width; }
public:
    Rectangle(double l,double w,int x,int y) : Shape(x,y),length(l),width(w) {}
    double getLength() const { return length; }
    double getWidth() const { return width; }
    void draw() const override { cout << *this << " at " << getX() << "," << getY() << '\n'; }
};
class Circle : public Shape {
    double radius;
protected:
    void printMe(ostream& out) const override { out << "Circle radius " << radius; }
public:
    Circle(double r,int x,int y) : Shape(x,y),radius(r) {}
    double getRadius() const { return radius; }
    void draw() const override { cout << *this << " at " << getX() << "," << getY() << '\n'; }
};
class Square : public Rectangle {
protected:
    void printMe(ostream& out) const override { out << "Square side " << getLength(); }
public:
    Square(double side,int x,int y) : Rectangle(side,side,x,y) {}
};'''
stack=old['stack-core']['code']; queue=old['queue-manual']['code']; linked=old['list-core']['code']
add('lab06-shape-stack','Lab 6 · Square + linked Stack<Shape*> + exceptions',6,combine(shapes,stack),r'''Circle circle(2,0,0); Rectangle rectangle(3,4,1,1); Square square(5,2,2);
Stack<Shape*> shapes;
try {
    shapes.push(&circle); shapes.push(&rectangle); shapes.push(&square);
    cout << "Size " << shapes.size() << ", top " << *shapes.top() << '\n';
    while (!shapes.isEmpty()) shapes.pop()->draw();
    shapes.pop(); // Deliberate underflow to test the catch.
} catch (const StackException& e) { cout << e.what() << '\n'; }''','assert(square.getLength()==5 && square.getWidth()==5);assert(shapes.isEmpty());Stack<int> s;s.push(3);assert(s.top()==3 && s.size()==1 && s.pop()==3);bool caught=false;try{s.top();}catch(const StackException&){caught=true;}assert(caught);','Combine multi-level inheritance, a template linked stack, base pointers, virtual draw(), and a caught underflow.','Add derived Shapes or change T; use the supplied StackNode, topOfStack, theItem and count wording.','Pointers here borrow local objects: do not delete them. Stack deletes its nodes. Square inherits Rectangle::draw, which dispatches Square::printMe.',expected='Square draws first, then Rectangle, then Circle; empty pop is caught.')
add('lab07-shape-vector','Lab 7 · vector<Shape*>, iterators and bounds checking',7,combine(shapes,'#include <vector>\n#include <stdexcept>'),r'''Circle circle(2,0,0); Rectangle rectangle(3,4,1,1); Square square(5,2,2);
vector<Shape*> shapes;
try {
    shapes.push_back(&circle); shapes.push_back(&rectangle);
    shapes[0]->moveTo(2,3);
    shapes.front()->draw(); shapes.back()->draw();
    cout << shapes.size() << " " << shapes.capacity() << " " << shapes.max_size() << '\n';
    shapes.insert(shapes.begin()+1,&square);
    for (vector<Shape*>::iterator it=shapes.begin();it!=shapes.end();++it) (*it)->draw();
    shapes.pop_back();
    shapes.at(0)->draw();
    shapes.at(shapes.size()); // Deliberate checked out-of-range access.
} catch (const out_of_range& e) { cout << e.what() << '\n'; }''','assert(shapes.size()==2 && shapes.front()==&circle && shapes.back()==&square);assert(circle.getX()==2 && circle.getY()==3);','Use all required vector operations and iterate through base pointers to invoke virtual draw().','Use this when STL is allowed and the question asks for a vector, not a linked-node implementation.','at() checks bounds; [] does not. Pointers borrow local objects; pop_back does not delete a pointed-to object.',expected='Polymorphic draw calls, vector sizes, then a caught out_of_range.')
# Related drills: each is a separate compilable program, with its own main in the renderer.
add('variant-square','Shape variation · Add a derived Square',6,shapes,'Square s(4,1,2); Shape* p=&s; p->moveTo(6,7); p->draw(); cout << *p << endl;','assert(s.getLength()==4 && s.getWidth()==4 && s.getX()==6);','A new type is a special case of an existing derived class.','Pass side twice to Rectangle; only override behavior that differs.','Do not duplicate x, y, length or width in Square.')
add('variant-triangle','Shape variation · Add Triangle with new data',6,shapes+r'''
class Triangle : public Shape {
    double base,height;
protected:
    void printMe(ostream& out) const override { out << "Triangle area " << getArea(); }
public:
    Triangle(double b,double h,int x,int y) : Shape(x,y),base(b),height(h) {}
    double getArea() const { return base*height/2.0; }
    void draw() const override { cout << *this << '\n'; }
};''','Triangle t(6,4,0,0); Shape& shape=t; shape.draw();','assert(t.getArea()==12);','Extend an abstract base with a new concrete shape and an extra calculation.','Replace Triangle fields, constructor and calculation; implement every pure virtual method.','Shape does not declare getArea: call t.getArea(), or add a virtual area interface if the question requires it.')
add('variant-shape-print','Shape variation · Polymorphic stream output',6,shapes,'Circle c(2,0,0); Square s(3,1,1); Shape* a=&c; Shape* b=&s; cout << *a << " / " << *b << endl;','assert(c.getRadius()==2 && s.getWidth()==3);','Print derived-specific details using cout << a base reference.','Keep one friend operator<< in Shape and override printMe in each subtype.','Use cout << *pointer for object output; cout << pointer prints an address.')
add('variant-shape-queue','Shape variation · Process polymorphic objects FIFO',6,combine(shapes,queue),'Circle c(2,0,0); Square s(3,1,1); LinkedQueue<Shape*> q; q.enqueue(&c); q.enqueue(&s); while(!q.isEmpty()) q.dequeue()->draw();','assert(q.isEmpty());','Change the lab’s LIFO Shape processing into FIFO using a linked queue.','Replace stack push/pop with enqueue/dequeue and preserve base-pointer dispatch.','This is a lab-style extension, not an assigned Lab 6 requirement. Local objects outlive the queue.')
add('variant-shape-heap','Shape variation · Own and delete dynamically allocated shapes',6,combine(shapes,stack),'Stack<Shape*> shapes; shapes.push(new Circle(2,0,0)); shapes.push(new Square(3,0,0)); while(!shapes.isEmpty()) { Shape* p=shapes.pop(); p->draw(); delete p; }','assert(shapes.isEmpty());','A question explicitly creates derived objects with new and requires cleanup through base pointers.','Delete every popped object once; retain Shape’s virtual destructor.','Stack owns nodes only. This simple driver assumes allocations and draw succeed; production exception-safe ownership needs more care.')
add('variant-controller-switch','Controller variation · Switch implementations through a base pointer',5,controller,'ProportionalController proportional(0.3); PID_Controller pid(0.5,25,2.5); Controller* c=&proportional; cout << c->controlStep(0,1) << endl; c=&pid; cout << c->controlStep(0,1) << endl;','assert(abs(proportional.controlStep(0,1)-1.3)<1e-9);','Use the same calling code with two different derived implementations.','Change which concrete object c points to; keep the controlStep signature unchanged.','These are addresses of local objects: do not delete c.')
add('variant-controller-limit','Controller variation · Override and reuse the base calculation',5,controller+r'''
class LimitedController : public ProportionalController {
    double low,high;
public:
    LimitedController(double gain,double low,double high)
        : ProportionalController(gain),low(low),high(high) {
        if (low>high) throw invalid_argument("Reversed limits");
    }
    double controlStep(double plantOutput,double setpoint) override {
        double result=ProportionalController::controlStep(plantOutput,setpoint);
        if (result<low) return low;
        if (result>high) return high;
        return result;
    }
};''','LimitedController limited(2,0,1); Controller* c=&limited; cout << c->controlStep(0,1) << endl;','assert(limited.controlStep(0,1)==1 && limited.controlStep(2,0)==0);','A derived class keeps the parent calculation but adds output limits.','Use Base::method(...) to reuse the original implementation, then modify its result.','Calling controlStep without Base:: inside this override would recurse.')
add('variant-moving-average','Class variation · Remember the previous result',5,r'''#include <iostream>
#include <stdexcept>
class Filter {
public:
    virtual double update(double input)=0;
    virtual ~Filter()=default;
};
class LeakyFilter : public Filter {
    double alpha,previous;
public:
    LeakyFilter(double alpha) : alpha(alpha),previous(0) {
        if(alpha<0 || alpha>1) throw invalid_argument("alpha must be in [0,1]");
    }
    double update(double input) override {
        previous=alpha*previous+(1-alpha)*input;
        return previous;
    }
    void reset() { previous=0; }
};''','LeakyFilter f(0.5); Filter& filter=f; cout << filter.update(10) << " " << filter.update(10) << endl;','f.reset();assert(f.update(10)==5 && f.update(10)==7.5);','A calculation must remember state between method calls, like PID q.','Put persistent state in the object; keep temporary inputs and results local.','A local previous=0 inside update would reset the state on every call.')
# Insert extra linked-list methods before the public constructor.
def list_extra(method): return linked.replace('    IntSLList() {',method+'\n    IntSLList() {',1)
add('variant-list-sum','List variation · Sum and average without changing head',6,list_extra(r'''    int sum() const {
        int total=0;
        for(IntSLLNode* p=head;p!=nullptr;p=p->next) total+=p->info;
        return total;
    }
    double average() const {
        int total=0,n=0;
        for(IntSLLNode* p=head;p!=nullptr;p=p->next) {total+=p->info;++n;}
        return n==0 ? 0.0 : static_cast<double>(total)/n;
    }'''),'IntSLList list; list.addToTail(3); list.addToTail(4); cout << list.sum() << " " << list.average() << endl;','assert(list.sum()==7 && list.average()==3.5);assert(list.deleteFromHead()==3);IntSLList empty;assert(empty.average()==0);','Traverse every node to calculate an aggregate while preserving the list.','Replace the accumulator operation; use a traversal pointer instead of moving head.','This example defines empty average as 0; change that policy if the question specifies an exception.')
add('variant-list-insert-after','List variation · Insert after a matching value',6,list_extra(r'''    bool insertAfter(int target,int el) {
        IntSLLNode* p=head;
        while(p!=nullptr && p->info!=target) p=p->next;
        if(p==nullptr) return false;
        p->next=new IntSLLNode(el,p->next);
        if(tail==p) tail=p->next;
        return true;
    }'''),'IntSLList list; list.addToTail(10); list.addToTail(30); list.insertAfter(10,20);','assert(list.insertAfter(30,40));assert(!list.insertAfter(99,1));for(int v:{10,20,30,40}) assert(list.deleteFromHead()==v);list.addToTail(50);assert(list.deleteFromHead()==50);','Insert into the middle or after the tail without losing the rest of the chain.','Save the old successor in the new node, then reconnect p->next; update tail if needed.','Returns false if target is absent. Inserts after the first matching node.')
add('variant-list-sorted','List variation · Keep values in sorted order',6,list_extra(r'''    void insertSorted(int el) {
        if(head==nullptr || el<=head->info) {addToHead(el);return;}
        IntSLLNode* p=head;
        while(p->next!=nullptr && p->next->info<el) p=p->next;
        p->next=new IntSLLNode(el,p->next);
        if(p==tail) tail=p->next;
    }'''),'IntSLList list; for(int v:{7,2,5,2}) list.insertSorted(v);','for(int v:{2,2,5,7})assert(list.deleteFromHead()==v);assert(list.isEmpty());','Insert each new item at the correct sorted position.','Change the comparison for descending order; handle head insertion separately.','The existing list must already be sorted. Do not use unsorted addToTail calls first.')
add('variant-list-remove-all','List variation · Delete every matching value',6,list_extra(r'''    int removeAll(int target) {
        int removed=0;
        while(head!=nullptr && head->info==target) {deleteFromHead();++removed;}
        IntSLLNode* p=head;
        while(p!=nullptr && p->next!=nullptr) {
            if(p->next->info==target) {
                IntSLLNode* old=p->next;
                p->next=old->next;
                if(old==tail) tail=p;
                delete old; ++removed;
            } else p=p->next;
        }
        return removed;
    }'''),'IntSLList list; for(int v:{2,2,3,2,4,2}) list.addToTail(v); cout << list.removeAll(2) << endl;','assert(list.deleteFromHead()==3 && list.deleteFromHead()==4 && list.isEmpty());list.addToTail(2);assert(list.removeAll(2)==1 && list.isEmpty());list.addToTail(8);assert(list.deleteFromHead()==8);','Remove matches at the head, middle, tail, including adjacent matches.','Separate head removals from predecessor-based removal; only advance p when no deletion occurs.','Always reconnect before delete; keep tail correct after removing the last node.')
add('variant-stack-copy-order','Stack variation · Copy items while preserving both orders',6,stack+r'''
void copyStack(Stack<int>& source,Stack<int>& destination) {
    if(!destination.isEmpty()) throw StackException("Destination must start empty");
    Stack<int> temporary;
    while(!source.isEmpty()) temporary.push(source.pop());
    while(!temporary.isEmpty()) {
        int value=temporary.pop();
        source.push(value); destination.push(value);
    }
}''','Stack<int> source,destination; source.push(1);source.push(2);source.push(3);copyStack(source,destination);','for(int v:{3,2,1}){assert(source.pop()==v);assert(destination.pop()==v);}assert(source.isEmpty()&&destination.isEmpty());','Duplicate a stack using only its public operations, leaving the source unchanged.','Use a temporary stack to undo the first reversal. This copies values without invoking a copy constructor.','Destination must be empty. With pointer items, copying pointers would not clone their objects.')
add('variant-stack-postfix','Stack variation · Evaluate a postfix expression',6,combine(stack,r'''#include <sstream>
#include <stdexcept>
int evaluatePostfix(const string& expression) {
    istringstream input(expression);
    Stack<int> values;
    string token;
    while(input>>token) {
        if(token=="+" || token=="-" || token=="*") {
            if(values.size()<2) throw invalid_argument("Missing operand");
            int right=values.pop(),left=values.pop();
            if(token=="+") values.push(left+right);
            else if(token=="-") values.push(left-right);
            else values.push(left*right);
        } else {
            size_t used=0;
            int value=stoi(token,&used);
            if(used!=token.size()) throw invalid_argument("Invalid number");
            values.push(value);
        }
    }
    if(values.size()!=1) throw invalid_argument("Invalid expression");
    return values.pop();
}'''),'cout << evaluatePostfix("3 4 + 2 *") << endl;','assert(evaluatePostfix("3 4 + 2 *")==14);assert(evaluatePostfix("8 3 -")==5);bool caught=false;try{evaluatePostfix("1 +");}catch(const invalid_argument&){caught=true;}assert(caught);','A question processes operators after their operands using LIFO storage.','Add operators inside the operator branch; preserve left/right operand order.','Supports space-separated integers and +, -, *. Assumes arithmetic results fit int; it does not parse infix expressions.')
add('variant-stack-min','Stack variation · Find the minimum and restore the stack',6,stack+r'''
int minimum(Stack<int>& source) {
    if(source.isEmpty()) throw StackException("No minimum of empty stack");
    int result=source.top();
    Stack<int> temporary;
    while(!source.isEmpty()) {
        int value=source.pop();
        if(value<result) result=value;
        temporary.push(value);
    }
    while(!temporary.isEmpty()) source.push(temporary.pop());
    return result;
}''','Stack<int> s;for(int v:{4,1,7})s.push(v);cout << minimum(s) << endl;','assert(minimum(s)==1 && s.size()==3);for(int v:{7,1,4})assert(s.pop()==v);','Inspect all stack values without permanently changing their order.','Replace the comparison with a total/count/search condition, while still restoring from temporary.','Checking only top() cannot find the minimum of the entire stack.')
add('variant-queue-filter','Queue variation · Remove matching items and keep FIFO order',6,queue+r'''
int removeValue(LinkedQueue<int>& q,int target) {
    int originalSize=q.size(),removed=0;
    for(int i=0;i<originalSize;++i) {
        int value=q.dequeue();
        if(value==target) ++removed;
        else q.enqueue(value);
    }
    return removed;
}''','LinkedQueue<int> q;for(int v:{2,1,2,3})q.enqueue(v);cout << removeValue(q,2) << endl;','assert(q.size()==2 && q.dequeue()==1 && q.dequeue()==3);assert(removeValue(q,2)==0);','Filter a queue using only enqueue and dequeue while preserving survivor order.','Store the initial size so re-enqueued values are not processed forever.','A while(!isEmpty()) loop would never finish when retained values keep re-entering the queue.')
add('variant-queue-merge','Queue variation · Merge two already sorted queues',6,queue+r'''
void mergeQueues(LinkedQueue<int>& a,LinkedQueue<int>& b,LinkedQueue<int>& result) {
    if(!result.isEmpty()) throw runtime_error("Result must start empty");
    while(!a.isEmpty() && !b.isEmpty()) {
        if(a.front()<=b.front()) result.enqueue(a.dequeue());
        else result.enqueue(b.dequeue());
    }
    while(!a.isEmpty()) result.enqueue(a.dequeue());
    while(!b.isEmpty()) result.enqueue(b.dequeue());
}''','LinkedQueue<int> a,b,result;for(int v:{1,4,7})a.enqueue(v);for(int v:{2,4,8})b.enqueue(v);mergeQueues(a,b,result);','for(int v:{1,2,4,4,7,8})assert(result.dequeue()==v);assert(a.isEmpty()&&b.isEmpty());','Repeatedly take the smaller front item from two sorted FIFO inputs.','Use comparisons of front values, then dequeue from only the chosen input.','Inputs must be sorted and distinct from result. This consumes both input queues.')
add('variant-queue-two-stacks','Queue variation · Implement FIFO using two stacks',6,stack+r'''
template<class T> class TwoStackQueue {
    Stack<T> incoming,outgoing;
    void prepareFront() {
        if(outgoing.isEmpty())
            while(!incoming.isEmpty()) outgoing.push(incoming.pop());
    }
public:
    bool isEmpty() { return incoming.isEmpty() && outgoing.isEmpty(); }
    void enqueue(T value) { incoming.push(value); }
    T front() { prepareFront();return outgoing.top(); }
    T dequeue() { prepareFront();return outgoing.pop(); }
};''','TwoStackQueue<int> q;q.enqueue(1);q.enqueue(2);cout << q.dequeue() << endl;q.enqueue(3);','assert(q.front()==2 && q.dequeue()==2 && q.dequeue()==3 && q.isEmpty());bool caught=false;try{q.dequeue();}catch(const StackException&){caught=true;}assert(caught);','Implement queue behavior when you are given stacks as the allowed building blocks.','Push new arrivals into incoming; transfer only when outgoing is empty.','Transferring on every dequeue would reorder items. Empty operations propagate StackException.')
add('variant-record-array','Data-return variation · Struct summary and a dynamic result array',3,r'''#include <iostream>
#include <stdexcept>
struct Summary { int count; double total,average; };
Summary summarize(const double values[],int size) {
    if(size<0) throw invalid_argument("Negative size");
    Summary result{size,0,0};
    for(int i=0;i<size;++i) result.total+=values[i];
    if(size>0) result.average=result.total/size;
    return result;
}
double* scaledCopy(const double values[],int size,double scale=1) {
    if(size<0) throw invalid_argument("Negative size");
    double* result=new double[size];
    for(int i=0;i<size;++i) result[i]=values[i]*scale;
    return result;
}''','double values[]={2,4,6};Summary s=summarize(values,3);double* copy=scaledCopy(values,3,2);cout<<s.average<<" "<<copy[2]<<endl;delete[] copy;','assert(s.count==3 && s.total==12 && s.average==4);assert(summarize(values,0).average==0);','Return named aggregate results and independently allocated transformed data.','Use a struct for a few named results; a dynamic array for a runtime-sized sequence.','Caller owns the returned array; summarize does not modify the input.')
(folder/'lab-patterns.json').write_text(json.dumps(items,indent=2)+'\n')
print(f'Built {len(items)} lab solutions and related drills')
