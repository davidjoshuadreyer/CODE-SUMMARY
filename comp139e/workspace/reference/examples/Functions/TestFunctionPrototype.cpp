/*
 * TestFunctionPrototype.cpp
 *
 *  Created on: Jan 4, 2022
 *      Author: mao
 */


#include <iostream>
using namespace std;

// Function prototype
int FPMax(int num1, int num2);
//int FPMax(int, int); // This style also works.
double FPMax(double num1, double num2);
double FPMax(double num1, double num2, double num3);

int testFunctionPrototype()
{
	// Invoke the max function with int parameters
	cout << "The maximum between 3 and 4 is " <<
			FPMax(3, 4) << endl;

	// Invoke the max function with the double parameters
	cout << "The maximum between 3.0 and 5.4 is "
			<< FPMax(3.0, 5.4) << endl;

	// Invoke the max function with three double parameters
	cout << "The maximum between 3.0, 5.4, and 10.14 is "
			<< FPMax(3.0, 5.4, 10.14) << endl;

	return 0;
}

// Return the max between two int values
int FPMax(int num1, int num2)
{
	if (num1 > num2)
		return num1;
	else
		return num2;
}

// Find the max between two double values
double FPMax(double num1, double num2)
{
	if (num1 > num2)
		return num1;
	else
		return num2;
}

// Return the max among three double values
double FPMax(double num1, double num2, double num3)
{
	return FPMax(FPMax(num1, num2), num3);
}

