/*
 * A Rectangle that is derived from Shape
 *
 * File:   Rectangle.hpp
 * Author: dale
 *
 * Created on October 31, 2011, 2:10 PM
 */

#ifndef RECTANGLE_HPP
#define	RECTANGLE_HPP
#include "Shape.hpp"

class Rectangle : public Shape {
private:
    double length, width;
protected:
    void printMe(std::ostream& os) const override;  // Implicitly virtual because of Shape's declaration
public:
    /**
     * This constructor passes the x,y location to the base class constructor
     * in Shape and also initializes the Rectangle's size.
     *
     * We choose to make this an inline function.
     *
     * @param l Length
     * @param l Width
     * @param xLoc Initial x coordinate
     * @param yLoc Initial y coordinate
     */
    Rectangle(double l, double w, int x, int y)
        : Shape(x, y), length(l), width(w) {
    }

    double getLength(void) const {
        return length;
    }
    
    double getWidth(void) const {
        return width;
    }

    /**
     * The Rectangle "draws" itself at its current location
     */
    void draw() const override;  // Implicitly virtual because of Shape's declaration
};


#endif	/* RECTANGLE_HPP */

