/*
 * GeometricObject.cpp
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 */

#include "../Object-Oriented_Programming/GeometricObject.h"

GeometricObject::GeometricObject()
{
	color = "white";
	filled = false;
}

GeometricObject::GeometricObject(const string& color, bool filled)
{
	this->color = color;
	this->filled = filled;
}

string GeometricObject::getColor() const
{
	return color;
}

void GeometricObject::setColor(const string& color)
{
	this->color = color;
}

bool GeometricObject::isFilled() const
{
	return filled;
}

void GeometricObject::setFilled(bool filled)
{
	this->filled = filled;
}

string GeometricObject::toString() const
{
	return "Geometric Object";
}




