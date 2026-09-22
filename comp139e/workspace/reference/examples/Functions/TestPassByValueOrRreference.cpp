/*
 * TestPassByValueOrRreference.cpp
 *
 *  Created on: Jan 4, 2022
 *      Author: mao
 */

#include <iostream>
using namespace std;


//Pass by value:
void maxValueV(int value1, int value2, int max)
{
	if (value1 > value2)
		max = value1;
	else
		max = value2;
}

//Pass by reference:
void maxValueR(int value1, int value2, int& max)
{
	if (value1 > value2)
		max = value1;
	else
		max = value2;
}



int testPassByValueOrRreference()
{
	int max = 0;
	maxValueV(1, 2, max);
	cout << "Pass by value: max is " << max << endl;

	max = 0;
	maxValueR(1, 2, max);
	cout << "Pass by reference: max is " << max << endl;

	return 0;
}


