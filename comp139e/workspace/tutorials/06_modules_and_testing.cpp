/*
 * LESSON 6: Headers, source files, structs, radians, defaults, and testing.
 * Prerequisite: 3-5. Run: main.exe tutorial 6
 * Read support/Geometry.hpp (declarations) and Geometry.cpp (definitions).
 * Expect: three PASS lines. Try: intentionally change a formula and rerun.
 * Connects to Lab 3. This smaller 2-D example is not its 3-D implementation.
 */
#include "Tutorials.hpp"
#include "support/Geometry.hpp"
#include <cmath>
#include <iostream>
using namespace std;

int tutorials::modulesAndTesting()
{
    const double PI = 3.141592653589793;
    const double TOLERANCE = 0.000001;
    double angleRadians = 90.0 * PI / 180.0;
    tutorial06::Point point = tutorial06::polarPoint(2.0, angleRadians);
    bool pointPassed = abs(point.x) < TOLERANCE && abs(point.y - 2.0) < TOLERANCE;
    bool lengthPassed = abs(tutorial06::length(3.0, 4.0) - 5.0) < TOLERANCE;
    bool defaultPassed = abs(tutorial06::length(3.0) - 3.0) < TOLERANCE;

    // Compare floating-point results with a tolerance, not exact equality.
    if (pointPassed) cout << "PASS: 90 degrees gives (0, 2)" << endl;
    else cout << "FAIL: polar point" << endl;
    if (lengthPassed) cout << "PASS: 3-4-5 triangle" << endl;
    else cout << "FAIL: length" << endl;
    if (defaultPassed) cout << "PASS: default y = 0" << endl;
    else cout << "FAIL: default argument" << endl;

    if (pointPassed && lengthPassed && defaultPassed) return 0;
    return 1; // A failed test should also report failure to the runner.
}
