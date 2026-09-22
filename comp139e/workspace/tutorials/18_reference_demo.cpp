/*
 * LESSON 18: Run an existing reference class from the project's main().
 * Prerequisite: 6-7. Run: main.exe tutorial 18
 * Expect: default circle area = 78.5; changing its public r to 2 gives 12.56.
 * Try: change circle.r and rerun. Compare this public field with lesson 7's setter.
 * The header declares CircleX; CricleX.cpp defines its member functions.
 * CMakeLists.txt adds that exact .cpp to the executable. Do not #include a .cpp.
 */
#include "Tutorials.hpp"
#include "reference/examples/Demo/AllTests.h"
#include <iostream>
using namespace std;

int tutorials::referenceDemo()
{
    CircleX circle;
    cout << "Default circle: ";
    circle.printArea();
    circle.r = 2.0;
    cout << "Changed circle: ";
    circle.printArea();
    return 0;
}
