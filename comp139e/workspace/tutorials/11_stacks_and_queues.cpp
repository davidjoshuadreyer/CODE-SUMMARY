/*
 * LESSON 11: Stack = last in, first out; queue = first in, first out.
 * Prerequisite: 5, 7, 9-10. Run: main.exe tutorial 11
 * Read support/LearningStack.hpp to see push, pop, top, new, delete, and cleanup.
 * Expect: stack = 30 20 10; queue = 10 20 30; caught empty-stack error.
 * Try: use LearningStack<double> instead of LearningStack<int>.
 * Connects to Lab 6 and the Stacks_and_Queues references.
 */
#include "Tutorials.hpp"
#include "support/LearningStack.hpp"
#include <iostream>
#include <queue>
#include <stdexcept>
using namespace std;

int tutorials::stacksAndQueues()
{
    tutorial11::LearningStack<int> plates;
    queue<int> line; // The standard library supplies this queue implementation.
    for (int value = 10; value <= 30; value += 10)
    {
        plates.push(value);
        line.push(value);
    }
    cout << "Stack = ";
    while (!plates.empty())
    {
        cout << plates.top() << " ";
        plates.pop();
    }
    cout << "\nQueue = ";
    while (!line.empty())
    {
        cout << line.front() << " ";
        line.pop();
    }
    cout << endl;
    try
    {
        plates.pop(); // Intentionally demonstrate an error on an empty stack.
    }
    catch (const runtime_error& error)
    {
        cout << "Caught: " << error.what() << endl;
    }
    return 0;
}
