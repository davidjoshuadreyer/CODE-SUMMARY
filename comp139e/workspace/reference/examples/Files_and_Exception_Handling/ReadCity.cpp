/*
 * ReadCity.cpp
 *
 *  Created on: Feb 21, 2022
 *      Author: mao
 */


#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int readCity()
{
	// Open a file
	ifstream input("src/Files_and_Exception_Handling/Files/state.txt");

	if (input.fail())
	{
		cout << "File does not exist" << endl;
		cout << "Exit program" << endl;
		return 0;
	}

	// Read data
	string city;

	while (!input.eof()) // Continue if not end of file
	{
		getline(input, city, '#');
		cout << city << endl;
	}

	input.close();

	cout << "Done" << endl;

	return 0;
}

