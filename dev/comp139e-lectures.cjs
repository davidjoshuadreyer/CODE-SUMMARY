// Original small programs and explanations mapped to the uploaded lecture decks.
const lessons=[
 {slug:'introduction',title:'C++ basics: input, numbers, and expressions',pdf:'0-1_Introduction_to_C++.pdf',pages:'7–28',
  ideas:[
   ['Start and run a program','A compiler translates source code into a program. Start with #include <iostream>, then int main() { ... }. Statements usually end with a semicolon. Braces group statements, // starts a comment, and return 0 reports successful completion. Edit, compile, read any diagnostics, run, and compare with your prediction.'],
   ['Read, calculate, display','std::cin >> radius reads a value; std::cout << radius displays it. Use int for whole numbers, double for fractional measurements, char for one character, and bool for true/false. Include the appropriate header before using a library feature. A const value such as pi cannot be reassigned.'],
   ['Conversions and arithmetic','Integer division truncates: 5 / 2 is 2. static_cast<double>(5) / 2 is 2.5. Converting 2.9 to int discards the fractional part. Parentheses make evaluation order clearer. Assignment stores a value; equality comparison uses ==.'],
   ['Increment and assignment','x += 2 means x = x + 2. In a separate statement, ++x and x++ both add one. Within an expression, ++x yields the new value and x++ yields the old value. Keep modifications in separate statements while learning.']
  ],examples:[
   {id:'area',title:'Read a radius and calculate area',sample:'2',expected:'Area: 12.57\n',try:'Change the input to 3. Predict why the area grows by more than one half.',code:String.raw`#include <iostream>
#include <iomanip>
int main() {
    const double pi = 3.141592653589793;
    double radius = 0;
    // Check the read before using the measurement.
    if (!(std::cin >> radius) || radius < 0) {
        std::cout << "Enter a non-negative radius.\n";
        return 1;
    }
    std::cout << std::fixed << std::setprecision(2)
              << "Area: " << pi * radius * radius << '\n';
}
`},
   {id:'numbers',title:'Integer division and increment',expected:'2 2.5\n4 6\n',try:'Change 5 to 7 in both divisions. Then move ++count into its own statement.',code:String.raw`#include <iostream>
int main() {
    std::cout << 5 / 2 << ' ' << static_cast<double>(5) / 2 << '\n';
    int count = 4;
    int old = count++; // old gets 4; count becomes 5.
    ++count;          // count becomes 6.
    std::cout << old << ' ' << count << '\n';
}
`}
  ],check:['Why does 5 / 2 lose the fraction?','Both operands are integers. Convert at least one operand to double before dividing.'],related:[1,2]},
 {slug:'functions',title:'Functions: values, references, and scope',pdf:'1-1_Functions.pdf',pages:'4–18',
  ideas:[
   ['Declare, call, return','A prototype tells the compiler a function’s name, result type, and parameters before the call. The definition supplies its body. Arguments match parameters by position. A void function performs an action without returning a value. Splitting a task into functions lets you reuse and test each step.'],
   ['Value versus reference','An int parameter receives a copy; changing it leaves the caller unchanged. An int& parameter aliases the caller’s variable. A const std::string& parameter can read the original string without copying it or changing it through that reference.'],
   ['Overloads and defaults','Overloads share a name but have different parameter lists; the return type alone cannot distinguish them. Exact argument types help avoid ambiguous calls. Default arguments supply omitted trailing values; put each default in one declaration, rather than repeating it in the definition.'],
   ['Scope, lifetime, and inline','A block-local variable is visible from its declaration to the end of that block. A for-loop variable stays in the loop. A global variable is declared outside functions; a static local keeps its value between calls. Initialize local numbers explicitly. inline does not force the compiler to expand a call; it also permits suitable identical definitions in multiple translation units.']
  ],examples:[
   {id:'references',title:'Compare copying with changing the original',expected:'After value: 5\nAfter reference: 6\nHello Ada\n',try:'Call byReference twice. Explain why the result changes but byValue does not.',code:String.raw`#include <iostream>
#include <string>
void byValue(int number);
void byReference(int& number);
void greet(const std::string& name) { std::cout << "Hello " << name << '\n'; }
int main() {
    int score = 5;
    byValue(score);
    std::cout << "After value: " << score << '\n';
    byReference(score);
    std::cout << "After reference: " << score << '\n';
    greet("Ada");
}
void byValue(int number) { ++number; }
void byReference(int& number) { ++number; }
`},
   {id:'overloads',title:'Defaults, overloads, and a remembered counter',expected:'6 10 3\n1 2\n',try:'Call nextTicket a third time. Change the default factor to 3.',code:String.raw`#include <iostream>
int scale(int value, int factor = 2) { return value * factor; }
double scale(double value) { return value * 1.5; }
int nextTicket() {
    static int issued = 0; // Initialized once; survives later calls.
    return ++issued;
}
int main() {
    std::cout << scale(3) << ' ' << scale(2, 5) << ' ' << scale(2.0) << '\n';
    int first = nextTicket();
    int second = nextTicket();
    std::cout << first << ' ' << second << '\n';
}
`}
  ],check:['Can two functions be overloaded using only different return types?','No. Their parameter lists must distinguish the overloads.'],related:[3,6]},
 {slug:'pointers',title:'Pointers, arrays, and dynamic memory',pdf:'1-2_Pointers_and_Dynamic_Memory_Management.pdf',pages:'3–28',
  ideas:[
   ['An address and the value at it','&value obtains an address; int* p stores an integer’s address; *p accesses that integer. A pointer must refer to a live object before you dereference it. nullptr represents no object. A pointer passed by value can change *p, but reassigning p does not reassign the caller’s pointer. Use int*& when the function needs to change that pointer itself.'],
   ['const and typedef','const int* p prevents writing the integer through p; int* const p prevents changing the pointer’s address. Both constraints can be combined. typedef int* IntPointer gives a pointer type another name. In int* p, q, only p is a pointer; separate declarations are clearer.'],
   ['Arrays and C-strings','An array often converts to a pointer to its first element, but an array is not itself a pointer. values[i] and *(values + i) reach the same element. Stay within the array; the one-past-end pointer is for comparisons, not dereferencing. A C-string ends with a null character. Use const char* for a string literal, or a mutable char array to change characters.'],
   ['Allocate and release','new int[n] creates an array whose lifetime continues until delete[] is called. Pair new T with delete and new T[n] with delete[]. Do not return the address of a local variable. A returned pointer must still refer to a live object. After release, do not use any aliases to that memory. Standard containers are usually easier for everyday ownership.'],
   ['Algorithms and dynamic objects','std::sort, std::find, std::min_element, and std::max_element use half-open ranges [begin, end). Check find against end before dereferencing. C++17 uses std::shuffle with a random engine instead of removed random_shuffle. For an object pointer p, p->length() means (*p).length(). Inside a member function, this points to the current object.']
  ],examples:[
   {id:'pointer-alias',title:'Change a value and redirect a pointer',expected:'7 9\nHi\n',try:'Change redirect to take int* instead of int*&. Predict the second printed number.',code:String.raw`#include <iostream>
void setValue(int* p) { *p = 7; }
void redirect(int*& p, int* target) { p = target; }
int main() {
    int first = 3;
    int second = 9;
    int* p = &first;
    setValue(p);
    redirect(p, &second);
    std::cout << first << ' ' << *p << '\n';
    const char* word = "Hi"; // Literal characters must not be modified.
    std::cout << word << '\n';
}
`},
   {id:'dynamic-array',title:'Allocate, sort, find, and free an array',expected:'2 4 8\nFound: 4\n',try:'Search for 7. Keep the end check and explain why no Found line appears.',code:String.raw`#include <algorithm>
#include <iostream>
int main() {
    const int size = 3;
    int* values = new int[size]{8, 2, 4};
    std::sort(values, values + size);
    std::cout << *values << ' ' << *(values + 1) << ' ' << values[2] << '\n';
    int* found = std::find(values, values + size, 4);
    if (found != values + size) std::cout << "Found: " << *found << '\n';
    delete[] values; // Matches array new. found is now dangling too.
    values = nullptr;
}
`}
  ],check:['Does setting a pointer to nullptr release the allocation?','No. Release owned raw allocations using the matching delete operation first. Setting one pointer to nullptr does not reset its aliases.'],related:[5]},
 {slug:'classes',title:'Objects, classes, and string methods',pdf:'1-3_Objects_and_Classes.pdf',pages:'4–40',
  ideas:[
   ['State and behaviour','A class defines data and operations; an object is one instance. A constructor initializes it and has the class name without a return type. Circle c; constructs an object; Circle c(); declares a function. Use a dot to call a method on an object, and -> on a pointer to an object.'],
   ['Encapsulation and const','Class members are private by default. Public getters and setters form the interface and can enforce rules. this->radius distinguishes a field from a same-named parameter. A method ending in const promises not to change ordinary instance fields through that object.'],
   ['Headers and implementation','A header declares the class and its member functions. An implementation file defines methods with ClassName::method. Use an include guard (#ifndef, #define, #endif) to prevent repeated class definitions. Compile the implementation along with the calling file. Methods defined inside a class are implicitly inline.'],
   ['Copies, arrays, and static members','Assignment normally copies fields into an existing object. Distinct objects keep distinct instance fields. Copying an owning raw pointer does not deep-copy its allocation, so ownership needs extra care. An array of objects constructs each element. A static member is shared by the class; access it with ClassName::. sizeof is an operator and object sizes can include padding.'],
   ['Work with std::string','Include <string>. length and size count characters, at accesses a checked character, substr copies part of a string, find returns a position or std::string::npos, and replace changes a range. std::to_string converts a number to text. You can split at a found separator using substr. A string literal such as "Ada" is a character array, not a std::string object with dot methods.']
  ],examples:[
   {id:'strings',title:'Explore a string with dot methods',expected:'Ada Lovelace\n12\nAda\nAda Byron\n',try:'Type name. on a new line to explore editor suggestions. Try name.empty() or name.at(0).',code:String.raw`#include <iostream>
#include <string>
int main() {
    std::string name = "Ada Lovelace";
    std::cout << name << '\n' << name.length() << '\n';
    auto space = name.find(" ");
    if (space != std::string::npos) {
        std::cout << name.substr(0, space) << '\n';
        name.replace(space + 1, name.length() - space - 1, "Byron");
    }
    std::cout << name << '\n';
}
`},
   {id:'objects',title:'Construct, copy, and inspect simple objects',expected:'4 9\nObjects constructed: 3\n',try:'Change the side in setSide to 5. Explain why the copied object still prints 9.',code:String.raw`#include <iostream>
class Square {
    double side;
    static int constructed;
public:
    Square(double side = 1) : side(side) { ++constructed; }
    void setSide(double side) { if (side >= 0) this->side = side; }
    double area() const { return side * side; }
    static int count() { return constructed; }
};
int Square::constructed = 0;
int main() {
    Square shapes[2] = {Square(2), Square(3)};
    Square copy;
    copy = shapes[1]; // Assignment copies the side; it calls no constructor.
    shapes[1].setSide(2);
    const Square& view = copy;
    std::cout << shapes[1].area() << ' ' << view.area() << '\n';
    std::cout << "Objects constructed: " << Square::count() << '\n';
}
`}
  ],check:['What is the difference between object.length() and pointer->length()?','The dot accesses a member of an object. The arrow dereferences an object pointer and accesses its member.'],related:[4,7,6]},
 {slug:'files-exceptions',title:'Files, stream states, and exceptions',pdf:'1-4_Files_and_Exception_Handling.pdf',pages:'3–16',
  ideas:[
   ['Open, write, and read','Include <fstream>. ofstream writes, ifstream reads, and fstream can do both. Check that opening succeeded. Ordinary output opening truncates old contents; ios::app appends. ios::in and ios::out select reading and writing, ios::binary avoids text translation, and ios::ate initially seeks to the end. Combine modes with | when needed.'],
   ['Read only successful results','while (input >> value) processes only successful extractions. Do not use !input.eof() as the loop condition: EOF becomes known only after a read encounters it. fail indicates a failed operation, bad indicates a serious I/O problem, and good means no state flags are set. clear resets flags but does not remove bad input; ignore can discard characters.'],
   ['Lines and characters','std::getline(input, line) reads a line including spaces and removes the delimiter. Include <string> for this overload. After formatted input, account for the remaining newline. input.get(ch) reads a character, input.peek() inspects without consuming, and output.put(ch) writes one. Use the int result of parameterless get/peek when comparing with EOF.'],
   ['Throw and catch','throw transfers control to a matching catch and skips the remaining statements in the try block. Catch std::exception or std::runtime_error by const reference and use what() for its message. runtime_error is in <stdexcept>; allocation failure can throw std::bad_alloc. Most ordinary stream failures set flags rather than automatically throwing. Local stream objects close their files when their scope ends, including during exception unwinding.'],
   ['First look at the STL','Containers such as vector store values, iterators identify positions, and algorithms such as sort operate on ranges. The dynamic-array example demonstrates the same range idea using pointers. More containers and templates are available in the existing later lessons.']
  ],examples:[
   {id:'file-total',title:'Write, append, and total a text file',expected:'Total: 60\nEOF: 1\n',output:['scores.txt'],try:'Append another number. Then append a word to see the non-numeric-data error.',code:String.raw`#include <fstream>
#include <iostream>
int main() {
    {
        std::ofstream output("scores.txt");
        if (!output) return 1;
        output << "10 20\n";
        output.close();
        if (!output) return 1;
    }
    {
        std::ofstream output("scores.txt", std::ios::app);
        if (!output) return 1;
        output << "30\n";
        output.close();
        if (!output) return 1;
    }
    std::ifstream input("scores.txt");
    if (!input) return 1;
    int value = 0, total = 0;
    while (input >> value) total += value;
    if (input.bad() || !input.eof()) {
        std::cout << "Read error or non-numeric data.\n";
        return 1;
    }
    std::cout << "Total: " << total << "\nEOF: " << input.eof() << '\n';
}
`},
   {id:'exceptions',title:'Handle division by zero and keep going',expected:'Result: 4\nCannot divide by zero\nProgram continues\n',try:'Change the second denominator to 2. Which statements are now reached?',code:String.raw`#include <iostream>
#include <stdexcept>
double quotient(double numerator, double denominator) {
    if (denominator == 0) throw std::runtime_error("Cannot divide by zero");
    return numerator / denominator;
}
int main() {
    try {
        std::cout << "Result: " << quotient(8, 2) << '\n';
        double answer = quotient(8, 0);
        std::cout << answer << '\n'; // Skipped when quotient throws.
    } catch (const std::exception& error) {
        std::cout << error.what() << '\n';
    }
    std::cout << "Program continues\n";
}
`}
  ],check:['Why should a file-reading loop test the extraction itself?','It prevents processing a stale value when the next extraction fails, whether from EOF or malformed input.'],related:[12,13,14]}
];
module.exports=lessons;
