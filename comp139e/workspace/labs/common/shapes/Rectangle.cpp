/*
 * Implementation of the Rectangle class
 *
 * File:   Rectangle.cpp
 * Author: dale
 *
 * Created on November 7, 2011, 2:05 PM
 */
#include "Rectangle.hpp"

using namespace std;


/**
 * The draw() member function
 */
void Rectangle::draw() const {
    cout << "Rectangle of size [" << length << " " << width << "] drawn at " << getX() << " " << getY() << endl;
}

void Rectangle::printMe(ostream& os) const {
    os << "Rectangle of size [" << getWidth() << " " << getLength() << "] at " << getX() << " " << getY();
}
