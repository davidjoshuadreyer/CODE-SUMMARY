/*
 * ReverseArrayUsingPointer.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#include <iostream>
using namespace std;

int* reverse(int* list, int size)
{
	for (int i = 0, j = size - 1; i < j; i++, j--)
	{
		// Swap list[i] with list[j]
		int temp = list[j];
		list[j] = list[i];
		list[i] = temp;
	}

	return list;
}

int* reverseWithANewArray(const int* list, int size)
{
	//int result1[size]; // Wrong way
	int* result = new int[size];

	for (int i = 0, j = size - 1; i < size; i++, j--)
	{
		result[j] = list[i];
	}

	return result;
}

void printElementsOfArray(const int* list, int size)
{
	for (int i = 0; i < size; i++)
		cout << list[i] << " ";
}

int reverseArrayUsingPointer()
{
	cout << "Return the original address of an array." << endl;
	int list1[] = {1, 2, 3, 4, 5, 6};
	int* p1 = reverse(list1, 6);
	cout << "p1: " << endl;
	printElementsOfArray(p1, 6);
	cout << endl << "list1: " << endl;
	printElementsOfArray(list1, 6);


	cout << endl << endl << "Return a new array." << endl;
	int list2[] = {1, 2, 3, 4, 5, 6};
	int* p2 = reverseWithANewArray(list2, 6);
	cout << "p2: " << endl;
	printElementsOfArray(p2, 6);
	cout << endl << "list2: " << endl;
	printElementsOfArray(list2, 6);

	return 0;
}


