/*
 * DerivedCircle.h
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 *     Comment: A "const function", denoted with the keyword
 *     const after a function declaration, makes it a compiler error
 *     for this class function to change a member variable of the class.
 *     However, reading of a class variables is okay inside of the function,
 *     but writing inside of this function will generate a compiler error.
 */

#ifndef CIRCLE_H
#define CIRCLE_H
#include "../Object-Oriented_Programming/GeometricObject.h"

class CircleD: public GeometricObject
{
public:
	CircleD();
	CircleD(double);
	CircleD(double radius, const string& color, bool filled);
	double getRadius() const;
	void setRadius(double);
	double getArea() const;
	double getPerimeter() const;
	double getDiameter() const;
	string toString() const;

private:
	double radius;
}; // Must place semicolon here

#endif
