/*
 * CircleWithStaticDataFields.h
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */

#ifndef CIRCLEWITHSTATICDATAFIELDS_H_
#define CIRCLEWITHSTATICDATAFIELDS_H_

class CircleS
{
public:
	CircleS();
	CircleS(double);
	double getArea() const;
	double getRadius();
	void setRadius(double);
	static int getNumberOfObjects();

private:
	double radius;
	static int numberOfObjects;
};

#endif /* CIRCLEWITHSTATICDATAFIELDS_H_ */
