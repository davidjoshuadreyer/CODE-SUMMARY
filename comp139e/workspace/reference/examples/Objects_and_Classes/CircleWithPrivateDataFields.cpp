/*
 * CircleWithPrivateDataFields.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */


#include "CircleWithPrivateDataFields.h"

// Construct a default circle object
CircleP::CircleP()
{
	radius = 1;
}

// Construct a circle object
CircleP::CircleP(double newRadius)
{
	radius = newRadius;
}

// Return the area of this circle
double CircleP::getArea()
{
	return radius * radius * 3.14159;
}

// Return the radius of this circle
double CircleP::getRadius()
{
	return radius;
}

// Set a new radius
void CircleP::setRadius(double newRadius)
{
	radius = (newRadius >= 0) ? newRadius : 0;
}
