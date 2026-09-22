/*
 * AppendFile.cpp
 *
 *  Created on: Feb 21, 2022
 *      Author: mao
 */

#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int appendFile()
{
	fstream inout;

	// Create a file
	inout.open("src/Files_and_Exception_Handling/Files/city.txt", ios::out);

	if (inout.fail())
	{
		cout << "File cannot be opened" << endl;
		cout << "Exit program" << endl;
		return -1;
	}
	else
	{
		// Write cities
		inout << "Dallas" << " " << "Houston" << " " << "Atlanta" << " ";

		inout.close();
	}

	// Append to the file
	inout.open("src/Files_and_Exception_Handling/Files/city.txt", ios::out | ios::app);

	if (inout.fail())
	{
		cout << "File cannot be opened" << endl;
		cout << "Exit program" << endl;
		return -1;
	}
	else
	{
		// Write cities
		inout << "Savannah" << " " << "Austin" << " " << "Chicago";
		inout.close();
	}

	string city;

	// Open the file
	inout.open("src/Files_and_Exception_Handling/Files/city.txt", ios::in);
	if (inout.fail())
	{
		cout << "File cannot be opened" << endl;
		cout << "Exit program" << endl;
		return -1;
	}
	else
	{
		while (!inout.eof()) // Continue if not end of file
		{
			inout >> city;
			cout << city << " ";
		}

		inout.close();
	}

	return 0;
}


