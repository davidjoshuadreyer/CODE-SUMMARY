/*
 * TextFileInput.cpp
 *
 *  Created on: Feb 21, 2022
 *      Author: mao
 */


#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int textFileInput()
{
        //fstream input("test.txt");
	ifstream input("src/Files_and_Exception_Handling/Files/scores.txt");

	if (input.fail())
	{
		cout << "File does not exist" << endl;
		cout << "Exit program" << endl;
		return -1;
	}
	else{
		// Read data
		string firstName;
		char mi;
		string lastName;
		int score;
		input >> firstName >> mi >> lastName >> score;
		cout << firstName << " " << mi << " " << lastName << " "
				<< score << endl;

		input >> firstName >> mi >> lastName >> score;
		cout << firstName << " " << mi << " " << lastName << " "
				<< score << endl;

		input.close();

		cout << "Done" << endl;

		return 0;
	}
}

