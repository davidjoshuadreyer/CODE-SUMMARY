/*
 * CheckFile.cpp
 *
 *  Created on: Feb 21, 2022
 *      Author: mao
 */

#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int checkFile()
{
	string path = "src/Files_and_Exception_Handling/Files/";
	string filename;
	cout << "Enter a file name: ";
	cin >> filename;
	path = path + filename;
	cout << "The path of the file is: " << path << endl;
	ifstream input(path.c_str());
	//The file name passed to the input and output stream constructor
	// or to the open function must be a C-string in the standard C++.

	if (input.fail())
		cout << filename << " does not exist" << endl;
	else
		cout << filename << " exists" << endl;

	return 0;
}


