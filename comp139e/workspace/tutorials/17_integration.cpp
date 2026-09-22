/*
 * LESSON 17: Approximate area using trapezoids and Simpson weights.
 * Prerequisite: 3-4, 6. Run: main.exe tutorial 17
 * Expect for x*x from 0 to 1: trapezoid = 0.34375, Simpson = 0.333333.
 * Try: increase intervals from 4 to 8. Which approximation changes?
 * Connects to Lab 9. Compare matlab/learnIntegration.m for sum and loop forms.
 */
#include "Tutorials.hpp"
#include <cmath>
#include <iostream>
using namespace std;

int tutorials::integration()
{
    const int INTERVALS = 4; // Simpson's rule needs a positive EVEN count.
    const double START = 0.0;
    const double END = 1.0;
    double width = (END - START) / INTERVALS;
    double trapezoidSum = START * START + END * END;
    double simpsonSum = START * START + END * END;
    for (int i = 1; i < INTERVALS; i++)
    {
        double x = START + i * width;
        double y = x * x;
        trapezoidSum += 2.0 * y;
        if (i % 2 == 1) simpsonSum += 4.0 * y; // % gives the integer remainder.
        else simpsonSum += 2.0 * y;
    }
    double trapezoidArea = width * trapezoidSum / 2.0;
    double simpsonArea = width * simpsonSum / 3.0;
    double exact = 1.0 / 3.0;
    cout << "Trapezoid = " << trapezoidArea << endl;
    cout << "Simpson = " << simpsonArea << endl;
    cout << "Trapezoid error = " << abs(trapezoidArea - exact) << endl;
    cout << "Simpson error = " << abs(simpsonArea - exact) << endl;
    return 0;
}
