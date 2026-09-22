/*
 * TestVoidFunction.cpp
 *
 *  Created on: Jan 4, 2022
 *      Author: mao
 */


#include <iostream>
#include <cstdlib>
using namespace std;

// Print grade for the score
void printGrade(double score)
{
	if (score < 0 || score > 100)
	{
		cout << "X" << endl;
		//return;
		exit(1);
	}

	if (score >= 90.0)
		cout << 'A' << endl;
	else if (score >= 80.0)
		cout << 'B' << endl;
	else if (score >= 70.0)
		cout << 'C' << endl;
	else if (score >= 60.0)
		cout << 'D' << endl;
	else
		cout << 'F' << endl;
}

int testVoidFunction()
{
	cout << "Enter a score: ";
	double score;
	cin >> score;

	cout << "The grade is: ";
	printGrade(score);

	cout << endl <<"return instead of exit() is used!"<< endl;

	return 0;
}

