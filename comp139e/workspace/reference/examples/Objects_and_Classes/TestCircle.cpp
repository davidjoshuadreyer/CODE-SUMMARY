/*
 * TestBasicCircle.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#include <iostream>
using namespace std;

// by default class, it's private
// by default struct, it's 
class Rectangle
{
public:
    
};

class BasicCircle
{
public:
	// The radius of this circle
	double radius;

	// Construct a default circle object
	BasicCircle()
	{
		radius = 1;
	}

	// Construct a circle object
	BasicCircle(double newRadius)
	{
		radius = newRadius;
	}

	// Return the area of this circle
	double getArea()
	{
		return radius * radius * 3.14159;
	}
}; // Must place a semicolon here

int testCircle()
{
	BasicCircle circle1(1.0);
	BasicCircle circle2(25);
	BasicCircle circle3(125);

	cout << "The area of the circle of radius "
			<< circle1.radius << " is " << circle1.getArea() << endl;
	cout << "The area of the circle of radius "
			<< circle2.radius << " is " << circle2.getArea() << endl;
	cout << "The area of the circle of radius "
			<< circle3.radius << " is " << circle3.getArea() << endl;

	// Modify circle radius
	circle2.radius = 100;
	cout << "The area of the circle of radius "
			<< circle2.radius << " is " << circle2.getArea() << endl;

	return 0;
}


