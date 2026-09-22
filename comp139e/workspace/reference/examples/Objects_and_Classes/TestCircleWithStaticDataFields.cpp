/*
 * TestCircleWithStaticDataFields.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#include <iostream>
#include "CircleWithStaticDataFields.h"
using namespace std;

int testCircleWithStaticDataFields()
{
	cout << "Number of circle objects created: "
			<< CircleS::getNumberOfObjects() << endl;

	CircleS circle1;
	cout << "The area of the circle of radius "
			<< circle1.getRadius() << " is " << circle1.getArea() << endl;
	cout << "Number of circle objects created: "
			<< CircleS::getNumberOfObjects() << endl;

	CircleS circle2(5.0);
	cout << "The area of the circle of radius "
			<< circle2.getRadius() << " is " << circle2.getArea() << endl;
	cout << "Number of circle objects created: "
			<< CircleS::getNumberOfObjects() << endl;

	circle1.setRadius(3.3);
	cout << "The area of the circle of radius "
			<< circle1.getRadius() << " is " << circle1.getArea() << endl;

	cout << "circle1.getNumberOfObjects() returns "
			<< circle1.getNumberOfObjects() << endl;
	cout << "circle2.getNumberOfObjects() returns "
			<< circle2.getNumberOfObjects() << endl;

	return 0;
}


