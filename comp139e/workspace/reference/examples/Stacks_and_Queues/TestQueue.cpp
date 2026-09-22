/*
 * TestQueue.cpp
 *
 *  Created on: Dec 31, 2021
 *      Author: mao
 */

#include <iostream>
#include "GenArrayQueue.h"
#include "GenListQueue.h"

using namespace std;

int testArrayQueue()
{
	cout << "Testing an array queue ..." << endl;
	ArrayQueue<int> A;
	A.enqueue(10);
	A.enqueue(5);
	cout << "Dequeuing: " << A.dequeue()<<endl;

	A.enqueue(15);
	A.enqueue(7);
	cout << "Dequeuing: " << A.dequeue()<<endl;

	while(!A.isEmpty())
		cout << "Dequeuing: " << A.dequeue()<<endl;

	return 0;
}

int testListQueue()
{
	cout << "Testing a list queue ..." << endl;
	ListQueue<int> A;
	A.enqueue(10);
	A.enqueue(5);
	cout << "Dequeuing: " << A.dequeue()<<endl;

	A.enqueue(15);
	A.enqueue(7);
	cout << "Dequeuing: " << A.dequeue()<<endl;

	while(!A.isEmpty())
		cout << "Dequeuing: " << A.dequeue()<<endl;

	return 0;
}
