/*
 * GeometricObject.h
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 *     Comment: A "const function", denoted with the keyword
 *     const after a function declaration, makes it a compiler error
 *     for this class function to change a member variable of the class.
 *     However, reading of a class variables is okay inside of the function,
 *     but writing inside of this function will generate a compiler error.
 */

#ifndef GEOMETRICOBJECT_H
#define GEOMETRICOBJECT_H
#include <string>
using namespace std;

class GeometricObject
{
public:
	GeometricObject();
	GeometricObject(const string& color, bool filled);
	string getColor() const;
	void setColor(const string& color);
	bool isFilled() const;
	void setFilled(bool filled);
	string toString() const;

private:
	string color;
	bool filled;
}; // Must place semicolon here

#endif
