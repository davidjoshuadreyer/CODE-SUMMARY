/*
 * TwoDArrayUsingVector.cpp
 *
 *  Created on: Feb 20, 2022
 *      Author: mao
 */

#include <iostream>
#include <vector>
using namespace std;

/*
 * error: a space is required between consecutive right angle brackets (use '> >')
 * Solution: Project -> Properties -> C/C++ Build -> Settings -> Tool Settings ->
 * GCC C++ Compiler -> Dialect -> ISO C++11 (from drop down list)
 */

int sumOf2DVector(const vector<vector<int>>& matrix)
{
	int total = 0;
	for (unsigned row = 0; row < matrix.size(); row++)
	{
		for (unsigned column = 0; column < matrix[row].size(); column++)
		{
			total += matrix[row][column];
		}
	}

	return total;
}

int testTwoDArrayUsingVector()
{
	vector<vector<int>> matrix(4); // Four rows

	for (unsigned i = 0; i < 4; i++)
		matrix[i] = vector<int>(3); // Each row has three columns

	matrix[0][0] = 1; matrix[0][1] = 2; matrix[0][2] = 3;
	matrix[1][0] = 4; matrix[1][1] = 5; matrix[1][2] = 6;
	matrix[2][0] = 7; matrix[2][1] = 8; matrix[2][2] = 9;
	matrix[3][0] = 10; matrix[3][1] = 11; matrix[3][2] = 12;

	cout << "Sum of all elements is " << sumOf2DVector(matrix) << endl;

	return 0;
}


