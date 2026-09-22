/*
 * TestPointer.cpp
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 */


#include <iostream>
using namespace std;

int testPointer()
{
	int count = 5;
	int* pCount = &count;

	cout << "The value of count is " << count << endl;
	cout << "The address of count is " << &count << endl;
	cout << "The address after count is " << pCount++ << endl;
	cout << "The value after count is " << *pCount << endl;

	pCount = nullptr;
	delete pCount;
	//cout<< "If there is no "pCount = nullptr", after executing delete pCount, pointer pCount will still keep the address: " << pCount << endl;

	return 0;
}
