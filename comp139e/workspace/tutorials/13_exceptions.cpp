/*
 * LESSON 13: throw, try, catch, and stream error flags.
 * Prerequisite: 2-3. Run: main.exe tutorial 13
 * Expect: quotient = 4; caught divide-by-zero; stream recovered = 42.
 * Try: remove input.clear() and see why ignore alone cannot fix a failed stream.
 * Connects to Labs 2, 4, 6, and 7.
 */
#include "Tutorials.hpp"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <limits>
using namespace std;

namespace tutorial13 {
double divide(double numerator, double denominator)
{
    if (denominator == 0.0) throw invalid_argument("Cannot divide by zero");
    return numerator / denominator;
}
}

int tutorials::exceptions()
{
    try
    {
        cout << "Quotient = " << tutorial13::divide(12.0, 3.0) << endl;
        tutorial13::divide(12.0, 0.0);
        cout << "This line is skipped after the throw." << endl;
    }
    catch (const invalid_argument& error)
    {
        cout << "Caught: " << error.what() << endl;
    }

    // A string stream reads saved text like cin reads keyboard input.
    // This lets us test invalid input without typing it every time.
    istringstream input("oops\n42\n");
    int number = 0;
    input >> number;
    if (!input)
    {
        input.clear();
        input.ignore(numeric_limits<streamsize>::max(), '\n');
    }
    input >> number;
    cout << "Stream recovered = " << number << endl;
    return 0;
}
