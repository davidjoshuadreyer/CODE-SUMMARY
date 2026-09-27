/*
 * A Circle that is derived from Shape
 *
 * File:   Circle.hpp
 * Author: dale
 *
 * Created on October 31, 2011, 2:05 PM
 */

#ifndef CIRCLE_HPP
#define	CIRCLE_HPP
#include "Shape.hpp"

class Circle : public Shape {
private:
    double radius;
protected:
    void printMe(std::ostream& os) const override;  // Implicitly virtual because of Shape's declaration
public:

    /**
     * This constructor passes the x,y location to the base class constructor
     * in Shape and also initializes the Circle's radius.
     * 
     * We choose to make this an inline function.
     *
     * @param r Radius
     * @param xLoc Initial x coordinate
     * @param yLoc Initial y coordinate
     */
    Circle(double r, int xLoc, int yLoc) : Shape(xLoc, yLoc), radius(r) {
    }

    double getRadius(void) const {
        return radius;
    }


    /**
     * The Circle "draws" itself at its current location
     */
    void draw() const override;  // Implicitly virtual because of Shape's declaration
};


#endif	/* CIRCLE_HPP */

