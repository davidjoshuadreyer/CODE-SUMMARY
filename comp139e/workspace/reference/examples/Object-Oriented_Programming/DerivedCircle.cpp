/*
 * DerivedCircle.cpp
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 */

#include "../Object-Oriented_Programming/DerivedCircle.h"

// Construct a default circle object
CircleD::CircleD()
{
	radius = 1;
}

// Construct a circle object with specified radius
CircleD::CircleD(double radius)
{
	setRadius(radius);
}

// Construct a circle object with specified radius,
// color and filled values
CircleD::CircleD(double radius, const string& color, bool filled)
{
	setRadius(radius);
	setColor(color);
	setFilled(filled);
}

// Return the radius of this circle
double CircleD::getRadius() const
{
	return radius;

}

// Set a new radius
void CircleD::setRadius(double radius)
{
	this->radius = (radius >= 0) ? radius : 0;
}

// Return the area of this circle
double CircleD::getArea() const
{
	return radius * radius * 3.14159;
}

// Return the perimeter of this circle
double CircleD::getPerimeter() const
{
	return 2 * radius * 3.14159;
}

// Return the diameter of this circle
double CircleD::getDiameter() const
{
	return 2 * radius;
}

// Redefine the toString function
string CircleD::toString() const
{
	return "Circle object";
}


