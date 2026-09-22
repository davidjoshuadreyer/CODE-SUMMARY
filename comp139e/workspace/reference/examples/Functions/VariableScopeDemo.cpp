/*
 * VariableScopeDemo.cpp
 *
 *  Created on: Jan 4, 2022
 *      Author: mao
 */


#include <iostream>
using namespace std;

void t1(); // Function prototype
void t2(); // Function prototype

int variableScopeDemo()
{
	t1();
	t2();

	return 0;
}

int y; // Global variable, default to 0

void t1()
{
	int x = 1;
	cout << "x is " << x << endl;
	cout << "y is " << y << endl;
	x++;
	y++;
}

void t2()
{
	int x = 1;
	cout << "x is " << x << endl;
	cout << "y is " << y << endl;
}

