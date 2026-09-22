/*
 * LESSON 2: cin, bool, if/else, while, and named limits.
 * Run: main.exe tutorial 2. Enter -1, then 25, then q.
 * Expect: retry for -1, "Comfortable" for 25, then "Input finished".
 * Try: enter 10, 20, and 30. Check the boundaries of the if statements.
 * Connects to Lab 2. This uses temperatures, not the course's grading rules.
 */
#include "Tutorials.hpp"
#include <iostream>
#include <limits>
using namespace std;

int tutorials::inputAndDecisions()
{
    const double MIN_TEMP = 0.0;
    const double MAX_TEMP = 40.0;
    double temperature = 0.0;
    bool reading = true;

    while (reading)
    {
        cout << "Enter temperature from 0 to 40 (q to finish): ";
        cin >> temperature;
        if (!cin)
        {
            // A non-number or end of input ends this example.
            // clear resets the failure flag; ignore discards the rest of the line.
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            reading = false;
        }
        else if (temperature < MIN_TEMP || temperature > MAX_TEMP)
        {
            cout << "Out of range. Try again." << endl;
        }
        else if (temperature < 20.0)
        {
            cout << "Cool" << endl;
        }
        else
        {
            cout << "Comfortable" << endl;
        }
    }
    cout << "Input finished" << endl;
    return 0;
}
