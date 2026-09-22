/*
 * StaticVariableDemo.cpp
 *
 *  Created on: Jan 4, 2022
 *      Author: mao
 */

#include <iostream>
using namespace std;

void s1(); // Function prototype

int staticVariableDemo()
{
	s1();
	s1();

	return 0;
}

void s1()
{
	static int x = 1;
	int y = 1;
	x++;
	y++;
	cout << "x is " << x << endl;
	cout << "y is " << y << endl;
}


