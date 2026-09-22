/*
 * LESSON 1: Variables, arithmetic, and output. Start here.
 * Run: main.exe tutorial 1
 * Learn: int counts whole items; double keeps fractions; const names a fixed value.
 * Expect: 3 / 2 = 1, 3.0 / 2 = 1.5, circle area = 12.5664 (approximately).
 * Try: change radius to 3. Predict the new area before running again.
 * Connects to Lab 1. Read tutorials/README.md for the learning path.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

int tutorials::basics()
{
    const double PI = 3.141592653589793;
    double radius = 2.0;
    double area = PI * radius * radius;
    int numberOfCircles = 3;

    cout << "3 / 2 = " << 3 / 2 << endl;       // Both operands are integers.
    cout << "3.0 / 2 = " << 3.0 / 2 << endl;   // A double preserves the fraction.
    cout << "Circle area = " << area << endl;
    cout << "Total area = " << numberOfCircles * area << endl;
    // << sends each value to the output stream. endl ends the line.
    return 0; // Tell the runner that this lesson finished successfully.
}
