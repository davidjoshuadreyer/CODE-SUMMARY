/*
 * TestQuotientWithException.cpp
 *
 *  Created on: Dec 29, 2021
 *      Author: mao
 */



#include <iostream>
using namespace std;

int testQuotientWithException()
{
	// Read two integers
	cout << "Enter two integers: ";
	int number1, number2;
	cin >> number1 >> number2;

	try
	{
		if (number2 == 0)
			throw number1;

		cout << number1 << " / " << number2 << " is "
				<< (number1 / number2) << endl;
	}
	catch (int ex)
	{
		cout << "Exception: an integer " << ex <<
				" cannot be divided by zero" << endl;
	}

	cout << "Execution continues ..." << endl;

	return 0;
}
