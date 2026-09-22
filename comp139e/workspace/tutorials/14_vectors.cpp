/*
 * LESSON 14: vector operations, iterators, sorting, and a 2-D vector.
 * Prerequisite: 4, 8-9, 13. Run: main.exe tutorial 14
 * Expect: sorted = 10 20 30; catch an out-of-range access; grid value = 7.
 * Capacity and max_size depend on the implementation; don't expect fixed values.
 * Try: insert 15 at begin() + 1. Watch how the contents and size change.
 * Connects to Lab 7. Its vector holds Shape*; this example starts with int.
 */
#include "Tutorials.hpp"
#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <vector>
using namespace std;

int tutorials::vectors()
{
    try
    {
        vector<int> values;
        values.push_back(30);
        values.push_back(10);
        values.insert(values.begin() + 1, 20);
        cout << "First = " << values.front() << ", last = " << values.back() << endl;
        cout << "Index 1 = " << values[1] << endl; // [] does not check the index.
        cout << "Size = " << values.size() << ", capacity = " << values.capacity() << endl;
        cout << "Maximum possible size = " << values.max_size() << endl;
        values.push_back(99);
        values.pop_back(); // Removes 99; it does not return the value.
        sort(values.begin(), values.end());

        cout << "Sorted = ";
        for (vector<int>::iterator it = values.begin(); it != values.end(); it++)
        {
            cout << *it << " "; // * reads the item at this iterator.
        }
        cout << endl;
        // Insertions can invalidate iterators; we obtained ours after inserting.
        cout << "Checked index 0 = " << values.at(0) << endl;
        int missing = values.at(100); // at checks bounds. Never try values[100].
        cout << missing << endl; // Not reached: the previous line throws.
    }
    catch (const out_of_range& error)
    {
        cout << "Caught out-of-range access: " << error.what() << endl;
    }
    vector<vector<int>> grid(2, vector<int>(3, 0)); // 2 rows, 3 columns.
    grid[1][2] = 7;
    cout << "Grid value = " << grid[1][2] << endl;
    return 0;
}
