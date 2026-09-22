/*
 * TestGeometricObject.cpp
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 */

#include <iostream>

#include "../Object-Oriented_Programming/DerivedCircle.h"
#include "../Object-Oriented_Programming/DerivedRectangle.h"
#include "../Object-Oriented_Programming/GeometricObject.h"
using namespace std;

int testGeometricObject()
{
	GeometricObject shape;
	cout << shape.toString() << endl
			<<" default color: " << shape.getColor()<<endl;

	shape.setColor("red");
	shape.setFilled(true);
	cout << shape.toString() << endl
			<< " color: " << shape.getColor()
			<< " filled: " << (shape.isFilled() ? "true" : "false") << endl;

	CircleD circle(5);
	circle.setColor("black");
	circle.setFilled(false);
	cout << circle.toString()<< endl
			<< " color: " << circle.getColor()
			<< " filled: " << (circle.isFilled() ? "true" : "false")
			<< " radius: " << circle.getRadius()
			<< " area: " << circle.getArea()
			<< " perimeter: " << circle.getPerimeter() << endl;

	Rectangle rectangle(2, 3);
	rectangle.setColor("orange");
	rectangle.setFilled(true);
	cout << rectangle.toString()<< endl
			<< " color: " << circle.getColor()
			<< " filled: " << (circle.isFilled() ? "true" : "false")
			<< " width: " << rectangle.getWidth()
			<< " height: " << rectangle.getHeight()
			<< " area: " << rectangle.getArea()
			<< " perimeter: " << rectangle.getPerimeter() << endl;

	return 0;
}


