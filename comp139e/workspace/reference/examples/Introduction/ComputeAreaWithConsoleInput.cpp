/*
 * ComputeAreaWithConsoleInput.cpp
 *
 *  Created on: Jan 1, 2022
 *      Author: mao
 */


#include <iostream>
using namespace std;

int computeAreaWithConsoleInput()
{
	// Step 1: Read in radius
	double radius;
	//double radius = 2.0; // radius is initialized with 2.0.

	cout << "Enter a radius: ";
	cin >> radius;

	// Step 2: Compute area
	double area = radius * radius * 3.14159;

	// Step 3: Display the area
	cout << "The area is " << area << endl;

	return 0;
}

