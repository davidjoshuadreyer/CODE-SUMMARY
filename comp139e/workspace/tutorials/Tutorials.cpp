// Runner plumbing. Start reading the numbered lesson files, not this file.
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

void tutorials::printList()
{
    cout << "Tutorials (run: main tutorial NUMBER)\n"
         << " 1  Variables, arithmetic, and output\n"
         << " 2  Input, decisions, and loops (interactive)\n"
         << " 3  Functions, references, defaults, and overloads\n"
         << " 4  Arrays and strings\n"
         << " 5  Pointers and dynamic memory\n"
         << " 6  Modules, structs, trigonometry, and tests\n"
         << " 7  Classes, constructors, copying, and static data\n"
         << " 8  Inheritance and polymorphism\n"
         << " 9  Function and class templates\n"
         << "10  Singly and doubly linked lists\n"
         << "11  Stacks and queues\n"
         << "12  Files and text processing [input.txt output.txt]\n"
         << "13  Exceptions and stream recovery\n"
         << "14  Vectors, iterators, sorting, and 2-D data\n"
         << "15  Feedback and controller state\n"
         << "16  Harmonic motion (C++ preview; MATLAB practice supplied)\n"
         << "17  Numerical integration (C++ preview; MATLAB practice supplied)\n"
         << "18  Using the original CircleX reference demo\n";
}

int tutorials::run(int number)
{
    cout << "Tutorial " << number << endl;
    switch (number)
    {
    case 1: return basics();
    case 2: return inputAndDecisions();
    case 3: return functions();
    case 4: return arraysAndStrings();
    case 5: return pointers();
    case 6: return modulesAndTesting();
    case 7: return classes();
    case 8: return inheritance();
    case 9: return templates();
    case 10: return linkedLists();
    case 11: return stacksAndQueues();
    case 12: return files();
    case 13: return exceptions();
    case 14: return vectors();
    case 15: return control();
    case 16: return harmonicMotion();
    case 17: return integration();
    case 18: return referenceDemo();
    default:
        cerr << "Choose a tutorial from 1 to 18." << endl;
        return 1;
    }
}
