/*
 * TestArrayPointer.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#include <iostream>
using namespace std;

int testArrayPointer()
{
	int list[6] = {11, 12, 13, 14, 15, 16};

	cout << "Using list: " << endl;

	for (int i = 0; i < 6; i++)
		cout << "address: " << (list + i) <<
		" value: " << *(list + i) << " " <<
		" value: " << list[i] << endl;

	int* p = list;

	cout << "Using pointer: " << endl;

	for (int i = 0; i < 6; i++)
		cout << "address: " << (list + i) <<
		" value: " << *(list + i) << " " <<
		" value: " << list[i] << " " <<
		" value: " << *(p + i) << " " <<
		" value: " << p[i] << endl;

	return 0;
}
