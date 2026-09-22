/*
 * Circle.h
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#ifndef OBJECTS_AND_CLASSES_CIRCLE_H_
#define OBJECTS_AND_CLASSES_CIRCLE_H_


class Circle
{
public:
	// The radius of this circle
	double radius;

	// Construct a default circle object
	Circle();
	// Construct a circle object
	Circle(double);

	// Return the area of this circle
	double getArea();
};


#endif /* OBJECTS_AND_CLASSES_CIRCLE_H_ */
