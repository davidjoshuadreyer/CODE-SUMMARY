/*
 * TestEndOfFile.cpp
 *
 *  Created on: Feb 21, 2022
 *      Author: mao
 */


#include <iostream>
#include <fstream>
using namespace std;

int testEndOfFile()
{
	// Open a file
	ifstream input("src/Files_and_Exception_Handling/Files/EOF.txt");
	if (input.fail())
	{
		cout << "File does not exist" << endl;
		cout << "Exit program" << endl;
		return 0;
	}

	double sum = 0;
	double number;
	while (input >> number) // Continue if not end of file
	{
		cout << number << " "; // Display data
		sum += number;
	}

	input.close();

	cout << "\nSum is " << sum << endl;


	ifstream input1("src/Files_and_Exception_Handling/Files/EOF.txt");
	if (input1.fail())
	{
		cout << "File does not exist" << endl;
		cout << "Exit program" << endl;
		return 0;
	}

	double sum1 = 0;
	double number1;
	while (!input1.eof()) // Continue if not end of file
	{
		input1 >> number1; // Read data
		cout << number1 << " "; // Display data
		sum1 += number1;
	}

	input1.close();

	cout << "\nWrong sum is " << sum1 << endl;

	return 0;
}
