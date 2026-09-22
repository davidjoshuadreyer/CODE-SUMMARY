/*
 * Base class for all Shapes.
 *
 * Shape is an abstract class because draw() is a pure virtual function
 *
 * File:   Shape.hpp
 * Author: dale
 *
 * Created on October 31, 2011, 2:02 PM
 */

#ifndef SHAPE_HPP
#define	SHAPE_HPP
#include <iostream>

class Shape {
private:
    int x;
    int y;
protected:
    /**
     * This pure virtual function is supplied so that we can use
     * polymorphism with the stream insertion operator <<
     *
     * @param os The output stream
     */
    virtual void printMe(std::ostream& os) const = 0;
public:

    /* Note that:
     * "A function defined entirely inside a class/struct/union definition,
     * whether it's a member function or a non-member friend function, 
     * is implicitly an inline function."
     * Therefore, the constructor, moveTo, getX, and getY are inlined.
     */
    Shape (int xLoc, int yLoc) : x(xLoc), y(yLoc) {    }

    /**
     * Sets new values for the coordinates
     *
     * @param x New position
     * @param y New position
     */
    void moveTo (int x, int y) {
        this->x = x;  // Using this-> resolves the member x from the parameter x
        this->y = y;
    }

    /**
     *
     * @return The current x coordinate
     */
    const int getX() const {
        return x;
    }
    /**
     *
     * @return The current y coordinate
     */
    const int getY() const {
        return y;
    }

    /**
     * The shape draws itself
     *
     * Since this is a pure virtual function, it MUST be overridden
     * in any derived concrete class
     */
    virtual void draw() const = 0;


    /**
     * Overload the stream insertion operator so that we
     * can print a Shape in its entirety.
     * The implementation uses the virtual member function printMe()
     * so that polymorphism will work.
     */
    friend std::ostream& operator<< (std::ostream &out, Shape &shape) {
	shape.printMe(out);
	return out;
    }
};

#endif	/* SHAPE_H */

