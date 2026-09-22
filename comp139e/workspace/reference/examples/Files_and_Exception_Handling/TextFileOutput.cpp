/*
 * TextFileOutput.cpp
 *
 *  Created on: Feb 21, 2022
 *      Author: mao
 */

#include <iostream>
#include <fstream>
using namespace std;

int textFileOutput()
{
	ofstream output;

	// Create a file John T Smith 90
	output.open("src/Files_and_Exception_Handling/Files/scores.txt");

	if (output.fail())
	{
		cout << "File cannot be opened" << endl;
		cout << "Exit program" << endl;
		return -1;
	}
	else
	{
		// Write two lines
		output << "John" << " " << "T" << " " << "Smith"
				<< " " << 90 << endl;
		output << "Eric" << " " << "K" << " " << "Jones"
				<< " " << 85 << endl;

		output.close();

		cout << "Done" << endl;

		return 0;
	}
}

