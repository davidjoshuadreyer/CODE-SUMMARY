/*
 * TestCircleWithPrivateDataFields.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#include <iostream>
#include "CircleWithPrivateDataFields.h"
using namespace std;

int testCircleWithPrivateDataFields()
{
	CircleP circle1;
	CircleP circle2(5.0);

	cout << "The area of the circle of radius "
			<< circle1.getRadius() << " is " << circle1.getArea() << endl;
	cout << "The area of the circle of radius "
			<< circle2.getRadius() << " is " << circle2.getArea() << endl;

	// Modify circle radius
	circle2.setRadius(100);
	cout << "The area of the circle of radius "
			<< circle2.getRadius() << " is " << circle2.getArea() << endl;

	return 0;
}


