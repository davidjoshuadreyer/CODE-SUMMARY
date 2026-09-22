/*
 * Implementation of the Rectangle class
 *
 * File:   Rectangle.cpp
 * Author: dale
 *
 * Created on November 7, 2011, 2:05 PM
 */
#include "Rectangle.hpp"

/**
 * The draw() member function
 */
void Rectangle::draw() const {
    std::cout << "Rectangle of size [" << length << " " << width << "] drawn at " << getX() << " " << getY() << std::endl;
}

void Rectangle::printMe(std::ostream& os) const {
    os << "Rectangle of size [" << getWidth() << " " << getLength() << "] at " << getX() << " " << getY();
}
