/*
 * DerivedRectangle.h
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 */

#ifndef RECTANGLE_H
#define RECTANGLE_H
#include "../Object-Oriented_Programming/GeometricObject.h"

class Rectangle: public GeometricObject
{
public:
	Rectangle();
	Rectangle(double width, double height);
	Rectangle(double width, double height,
			const string& color, bool filled);
	double getWidth() const;
	void setWidth(double);
	double getHeight() const;
	void setHeight(double);
	double getArea() const;
	double getPerimeter() const;
	string toString() const;

private:
	double width;
	double height;
}; // Must place semicolon here

#endif



