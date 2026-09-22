/*
 * Implementation of the Circle class
 *
 * File:   Circle.cpp
 * Author: dale
 *
 * Created on November 7, 2011, 2:05 PM
 */
#include "Circle.hpp"

/**
 * The draw() member function
 */
void Circle::draw() const {
    std::cout << "Circle with radius " << radius << " drawn at " << getX() << " " << getY() << std::endl;
}

void Circle::printMe(std::ostream& os) const {
        os << "Circle with radius " << getRadius() << " at " << getX() << " " << getY();
}
