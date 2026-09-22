/*
 * LESSON 3: Functions, value/reference/pointer parameters, defaults, overloads.
 * Prerequisite: 1-2. Run: main.exe tutorial 3
 * Expect: after value = 10; after reference = 11; after pointer = 12.
 * Try: remove & from addByReference's parameter. What changes?
 * Connects to Labs 1-3 and reference/examples/Functions.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

namespace tutorial03 {
// A declaration (prototype) tells the compiler how to call a function.
double rectangleArea(double width, double height = 1.0);

void addByValue(int value)
{
    value++; // Changes a COPY. The caller's variable is unchanged.
}
void addByReference(int& value)
{
    value++; // & in this parameter makes value another name for the caller's int.
}
void addByPointer(int* value)
{
    (*value)++; // * follows the address. This example requires a valid pointer.
}
// Overloads share a name but have different parameter types.
int twice(int value) { return value * 2; }
double twice(double value) { return value * 2.0; }

double rectangleArea(double width, double height)
{
    return width * height; // Return a result; the caller chooses how to use it.
}
int countCalls()
{
    static int calls = 0; // Local name, but value survives between calls.
    calls++;
    return calls;
}
}

int tutorials::functions()
{
    int number = 10;
    tutorial03::addByValue(number);
    cout << "After value = " << number << endl;
    tutorial03::addByReference(number);
    cout << "After reference = " << number << endl;
    tutorial03::addByPointer(&number); // & here means "address of number".
    cout << "After pointer = " << number << endl;
    cout << "Default height: " << tutorial03::rectangleArea(4.0) << endl;
    cout << "Given height: " << tutorial03::rectangleArea(4.0, 3.0) << endl;
    cout << "Overloads: " << tutorial03::twice(3) << ", " << tutorial03::twice(2.5) << endl;
    cout << "Call counter: " << tutorial03::countCalls() << endl;
    cout << "Call counter: " << tutorial03::countCalls() << endl;
    // number exists only inside this function: this is its scope.
    return 0;
}
