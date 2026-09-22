/*
 * WriteFormattedData.cpp
 *
 *  Created on: Feb 21, 2022
 *      Author: mao
 */

#include <iostream>
#include <iomanip>
#include <fstream>
using namespace std;

int writeFormattedData()
{
	ofstream output;

	// Create a file
	output.open("src/Files_and_Exception_Handling/Files/formattedscores.txt");

	if (output.fail())
	{
		cout << "File cannot be opened" << endl;
		cout << "Exit program" << endl;
		return -1;
	}
	else
	{
		// Write two lines
		output << setw(6) << "John" << setw(2) << "T" << setw(6) << "Smith"
				<< " " << setw(4) << 90 << endl;
		output << setw(6) << "Eric" << setw(2) << "K" << setw(6) << "Jones"
				<< " " << setw(4) << 85;

		output.close();

		cout << "Done" << endl;

		return 0;
	}
}

