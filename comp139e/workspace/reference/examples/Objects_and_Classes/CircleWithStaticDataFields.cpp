/*
 * CircleWithStaticDataFields.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#include "CircleWithStaticDataFields.h"

int CircleS::numberOfObjects = 0;

// Construct a circle object
CircleS::CircleS()
{
	radius = 1;
	numberOfObjects++;
}

// Construct a circle object
CircleS::CircleS(double newRadius)
{
	radius = newRadius;
	numberOfObjects++;
}

// Return the area of this circle
double CircleS::getArea() const // adding const is a must
{
	//radius = 0.5;// error, changing members is not allow
	double i = 0;
	i++; // local variable can be changed
	return i * radius * radius * 3.14159;
}

// Return the radius of this circle
double CircleS::getRadius()
{
	return radius;
}

// Set a new radius
void CircleS::setRadius(double newRadius)
{
	radius = (newRadius >= 0) ? newRadius : 0;
}

// Return the number of circle objects
int CircleS::getNumberOfObjects()
{
	return numberOfObjects;
}


