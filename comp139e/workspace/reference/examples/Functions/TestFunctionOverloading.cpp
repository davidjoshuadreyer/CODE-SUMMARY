/*
 * TestFunctionOverloading.cpp
 *
 *  Created on: Jan 4, 2022
 *      Author: mao
 */


#include <iostream>
using namespace std;

// Return the max between two int values
int max(int num1, int num2)
{
	if (num1 > num2)
		return num1;
	else
		return num2;
}

int max(int num1, double num2)
{
	cout << "----";
	if (num1 > num2)
		return num1;
	else
		return num2;
}


// Find the max between two double values
double max(double num1, double num2)
{
	if (num1 > num2)
		return num1;
	else
		return num2;
}

// Return the max among three double values
double max(double num1, double num2, double num3)
{
	return max(max(num1, num2), num3);
}

int testFunctionOverloading()
{
	// Invoke the max function with int parameters
	cout << "The maximum between 3 and 4 is " << max(3, 4) << endl;
	cout << "The maximum between 3 and 4 is " << max(3, 4.0) << endl;

	// Invoke the max function with the double parameters
	cout << "The maximum between 3.0 and 5.4 is "
			<< max(3.0, 5.4) << endl;

	// Invoke the max function with three double parameters
	cout << "The maximum between 3.0, 5.4, and 10.14 is "
			<< max(3.0, 5.4, 10.14) << endl;

	return 0;
}
