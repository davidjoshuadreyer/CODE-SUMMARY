/*
 * GenericMaxValue.cpp
 *
 *  Created on: Feb 20, 2022
 *      Author: mao
 */



#include <iostream>
#include <string>
using namespace std;

template<typename T>
T maxValue(T value1, T value2)
{
	if (value1 > value2)
		return value1;
	else
		return value2;
}

int testMaxValue()
{
	cout << "Maximum between 1 and 3 is " << maxValue(1, 3) << endl;
	cout << "Maximum between 1.5 and 0.3 is "
			<< maxValue(1.5, 0.3) << endl;
	cout << "Maximum between 'A' and 'N' is "
			<< maxValue('A', 'N') << endl;
	cout << "Maximum between \"NBC\" and \"ABC\" is "
			<< maxValue(string("NBC"), string("ABC")) << endl;

	return 0;
}
