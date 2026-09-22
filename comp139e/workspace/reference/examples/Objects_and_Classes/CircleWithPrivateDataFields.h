/*
 * CircleWithPrivateDataFields.h
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#ifndef CIRCLEWITHPRIVATEDATAFIELDS_H
#define CIRCLEWITHPRIVATEDATAFIELDS_H

class CircleP
{
public:
	CircleP();
	CircleP(double);
	double getArea();
	double getRadius();
	void setRadius(double);

private:
	double radius;
};

#endif
