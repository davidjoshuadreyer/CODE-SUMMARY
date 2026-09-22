/*
 * LESSON 9: Function templates and class templates.
 * Prerequisite: 3 and 7. Run: main.exe tutorial 9
 * Expect: 7, 4.5, then stored value = 12.
 * Try: make a Box<string> (include <string>) and store your name.
 * Connects to Lab 6. T is a placeholder for the type chosen by the caller.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

namespace tutorial09 {
template <typename T>
T larger(T first, T second)
{
    if (first > second) return first;
    return second;
}

template <typename T>
class Box {
private:
    T value;
public:
    Box(T initialValue) : value(initialValue) {}
    T get() const { return value; }
};
// Templates normally go in headers when shared between source files, because
// the compiler needs their definitions to generate code for each chosen type.
}

int tutorials::templates()
{
    cout << tutorial09::larger(3, 7) << endl;
    cout << tutorial09::larger(2.5, 4.5) << endl;
    tutorial09::Box<int> box(12);
    cout << "Stored value = " << box.get() << endl;
    return 0;
}
