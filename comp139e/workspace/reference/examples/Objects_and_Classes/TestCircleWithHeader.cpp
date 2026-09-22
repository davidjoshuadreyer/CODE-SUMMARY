/*
 * TestCircleWithHeader.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */


#include <iostream>
#include "Circle.h"
using namespace std;

/*
 * Replace this function name with int main()
 * to test: g++ Circle.cpp TestCircleWithHeader.cpp -o a.out
 */
int testCircleWithHeader()
{
	Circle circle1;
	Circle circle2(5.0);

	cout << "The area of the circle of radius "
			<< circle1.radius << " is " << circle1.getArea() << endl;
	cout << "The area of the circle of radius "
			<< circle2.radius << " is " << circle2.getArea() << endl;

	// Modify circle radius
	circle2.radius = 100;
	cout << "The area of the circle of radius "
			<< circle2.radius << " is " << circle2.getArea() << endl;

	return 0;
}

