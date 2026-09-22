/*
 * TestStack.cpp
 *
 *  Created on: Dec 31, 2021
 *      Author: mao
 *      Testing different stacks.
 */
#include <iostream>
#include "GenArrayStack.h"
#include "GenSinglyLinkedStack.h"
#include "GenVectorStack.h"
#include "GenListStack.h"

using namespace std;

int testArrayStack()
{
	cout << "Testing an array stack ..." << endl;
	ArrayStack<int> A; // A = [ ], size = 0
	A.push(7); // A = [7*], size = 1
	A.push(13); // A = [7, 13*], sizecout = 2
	cout << A.top() << endl;
	cout << A.pop() << " from pop()" << endl; // A = [7*], outputs: 13
	A.push(9); // A = [7, 9*], size = 2
	cout << A.top() << endl; // A = [7, 9*], outputs: 9
	cout << A.top() << endl;
	cout << A.pop() << " from pop()" << endl; // A = [7*], outputs: 9
	ArrayStack<string> B(10); // B = [ ], size = 0
	B.push("Bob"); // B = [Bob*], size = 1
	B.push("Alice"); // B = [Bob, Alice*], size = 2
	cout << B.top() << endl;
	cout << B.pop() << " from pop()" << endl; // B = [Bob*], outputs: Alice
	B.push("Eve"); // B = [Bob, Eve*], size = a

	return 0;
}

int testSinglyLinkedStack()
{
	cout << "Testing a singly linked stack ..." << endl;
	SLinkedStack<int> A; // A = [ ], size = 0
	A.push(7); // A = [7*], size = 1
	A.push(13); // A = [7, 13*], sizecout = 2
	cout << A.top() << endl;
	cout << A.pop() << " from pop()" << endl; // A = [7*], outputs: 13
	A.push(9); // A = [7, 9*], size = 2
	cout << A.top() << endl; // A = [7, 9*], outputs: 9
	cout << A.top() << endl;
	cout << A.pop() << " from pop()" << endl; // A = [7*], outputs: 9

	SLinkedStack<string> B; // B = [ ], size = 0
	B.push("Bob"); // B = [Bob*], size = 1
	B.push("Alice"); // B = [Bob, Alice*], size = 2
	cout << B.top() << endl;
	cout << B.pop() << " from pop()" << endl; // B = [Bob*], outputs: Alice
	B.push("Eve"); // B = [Bob, Eve*], size = a

	return 0;
}


int testVectorStack()
{
	cout << "Testing a vector stack ..." << endl;
	VectorStack<int, 10> A; // A = [ ], size = 0
	A.push(7); // A = [7*], size = 1
	A.push(13); // A = [7, 13*], sizecout = 2
	cout << A.top() << endl;
	A.pop(); // A = [7*], outputs: 13
	A.push(9); // A = [7, 9*], size = 2
	cout << A.top() << endl; // A = [7, 9*], outputs: 9
	cout << A.top() << endl;
	A.pop(); // A = [7*], outputs: 9

	VectorStack<string, 10> B; // B = [ ], size = 0
	B.push("Bob"); // B = [Bob*], size = 1
	B.push("Alice"); // B = [Bob, Alice*], size = 2
	cout << B.top() << endl;
	B.pop(); // B = [Bob*], outputs: Alice
	B.push("Eve"); // B = [Bob, Eve*], size = a

	return 0;

}

int testListStack()
{
	cout << "Testing a list stack ..." << endl;
	ListStack<int> A; // A = [ ], size = 0
	A.push(7); // A = [7*], size = 1
	A.push(13); // A = [7, 13*], sizecout = 2
	cout << A.top() << endl;
	A.pop(); // A = [7*], outputs: 13
	A.push(9); // A = [7, 9*], size = 2
	cout << A.top() << endl; // A = [7, 9*], outputs: 9
	cout << A.top() << endl;
	A.pop(); // A = [7*], outputs: 9

	ListStack<string> B; // B = [ ], size = 0
	B.push("Bob"); // B = [Bob*], size = 1
	B.push("Alice"); // B = [Bob, Alice*], size = 2
	cout << B.top() << endl;
	B.pop(); // B = [Bob*], outputs: Alice
	B.push("Eve"); // B = [Bob, Eve*], size = a

	return 0;

}
