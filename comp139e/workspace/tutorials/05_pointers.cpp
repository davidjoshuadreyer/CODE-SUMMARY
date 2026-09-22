/*
 * LESSON 5: Addresses, dereferencing, dynamic arrays, and ownership.
 * Prerequisite: 3-4. Run: main.exe tutorial 5
 * Expect: value = 9, array = 0 2 4, independent second array starts at 0.
 * Try: change first[0]. Confirm second[0] does not change.
 * Connects to Labs 1 and 3. Never return the address of a local array.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

namespace tutorial05 {
double* makeReadings(int count)
{
    // new[] creates memory that remains valid after this function returns.
    double* readings = new double[count];
    for (int i = 0; i < count; i++)
    {
        readings[i] = 2.0 * i;
    }
    return readings; // The caller now owns this array and must delete[] it.
}
}

int tutorials::pointers()
{
    int value = 5;
    int* address = &value;
    *address = 9; // Change the original variable through its address.
    cout << "Value = " << value << endl;

    const int SIZE = 3;
    double* first = tutorial05::makeReadings(SIZE);
    double* second = tutorial05::makeReadings(SIZE);
    cout << "Array = ";
    for (int i = 0; i < SIZE; i++)
    {
        cout << first[i] << " ";
    }
    cout << endl;
    first[0] = 99.0;
    cout << "Independent second array starts at " << second[0] << endl;
    delete[] second;
    delete[] first; // Match new[] with delete[], not delete.
    first = nullptr; // Do not use deleted memory. nullptr means no object.
    second = nullptr;
    // address points to a local variable, so we must NOT delete it.
    return 0;
}
