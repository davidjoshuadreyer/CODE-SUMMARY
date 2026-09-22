/*
 * LESSON 4: Fixed arrays, indexing, loops, strings, and weighted arithmetic.
 * Prerequisite: 1-3. Run: main.exe tutorial 4
 * Expect: total = 60, word length = 6, weighted result = 85.
 * Try: add another array element AND update SIZE. Why must they agree?
 * Connects to Labs 1 and 4. Lab 2 explicitly forbids arrays: use running totals there.
 */
#include "Tutorials.hpp"
#include <iostream>
#include <string>
using namespace std;

int tutorials::arraysAndStrings()
{
    const int SIZE = 3;
    int readings[SIZE] = {10, 20, 30};
    int total = 0;
    for (int i = 0; i < SIZE; i++) // Valid indices are 0, 1, and 2.
    {
        cout << "readings[" << i << "] = " << readings[i] << endl;
        total += readings[i]; // Same as total = total + readings[i].
    }
    cout << "Total = " << total << endl;

    string word = "circle";
    cout << "Word length = " << word.size() << endl;
    cout << "First letter = " << word[0] << endl;
    cout << "First three letters = " << word.substr(0, 3) << endl;

    double weightedTotal = 0.0;
    weightedTotal += 70.0 * 25.0;
    weightedTotal += 90.0 * 75.0;
    cout << "Weighted result = " << weightedTotal / 100.0 << endl;
    return 0;
}
