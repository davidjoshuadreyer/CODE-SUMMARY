/*
 * LESSON 12: ifstream, ofstream, append, strings, whitespace, peek, and argv.
 * Prerequisite: 2-4. Run from the project root: main.exe tutorial 12
 * Or: main.exe tutorial 12 input.txt output.txt
 * Expect: apple (5 letters), 12, pear (4 letters), -3, 7, plum (4 letters).
 * Appends a fresh report to tutorials/output/words-and-numbers.txt by default.
 * Try: edit tutorials/data/mixed.txt, then run again and inspect the output file.
 * Connects to Lab 4. Data here consists of words and valid signed integers.
 */
#include "Tutorials.hpp"
#include <fstream>
#include <iostream>
#include <string>
using namespace std;

int tutorials::files(const string& inputPath, const string& outputPath)
{
    ifstream input(inputPath);
    if (!input)
    {
        cerr << "Cannot open input: " << inputPath << endl;
        return 1;
    }
    // ios::app adds to the end instead of replacing previous output.
    ofstream output(outputPath, ios::app);
    if (!output)
    {
        cerr << "Cannot open output: " << outputPath << endl;
        return 1;
    }
    output << "New tutorial run" << endl;
    while (input >> ws) // ws consumes spaces, tabs, and newlines.
    {
        int first = input.peek(); // Look at ONE character without removing it.
        if (first == char_traits<char>::eof()) break;
        bool startsNumber = (first >= '0' && first <= '9') || first == '-' || first == '+';
        if (startsNumber)
        {
            int number;
            if (!(input >> number))
            {
                cerr << "Expected an integer." << endl;
                return 1;
            }
            output << "Integer: " << number << endl;
            cout << "Integer: " << number << endl;
        }
        else
        {
            string word;
            input >> word;
            output << "Word: " << word << " (" << word.size() << " letters)" << endl;
            cout << "Word: " << word << " (" << word.size() << " letters)" << endl;
        }
    }
    if (input.bad() || !output)
    {
        cerr << "A file read or write failed." << endl;
        return 1;
    }
    // Stream objects close their files automatically when this function ends.
    return 0;
}
