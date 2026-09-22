/*
 * A main() to demonstrate inheritance, polymorphism, virtual functions,
 * and an abstract class.
 * Uses classes: Shape, Rectangle, and Circle.
 * 
 * File:   shapeMain.cpp
 * Author: dale
 *
 * Created on November 7, 2011, 2:27 PM
 */

#include <iostream>
#include <cstdlib>
#include "Rectangle.hpp"
#include "Circle.hpp"

int main(int argc, char* argv[]) {
    const int N_SHAPES = 3;
    Circle c1(20.5, 4, 10);
    Rectangle r1(10, 20.7, 8, 8);
    Circle c2(11, 10, 5);
    // Can't instantiate an object from Shape class because it is abstract
    // Shape s1(1, 2);  yields a compiler error

    /* Create an array of pointers to Shapes.
     * Since Shape is the base class, we can point to any derived object,
     * i.e., Shape is polymorphic
     */
    Shape *shapes[N_SHAPES];
    shapes[0] = &c1;
    shapes[1] = &r1;
    shapes[2] = &c2;

    c1.moveTo(27, 36);         // move the first circle
    shapes[2]->moveTo(17, 4);  // this will move the second circle

    /* Draw all of the Shapes.
     * Since draw() is a virtual function, binding to draw() will be
     * done at run-time, resulting in the correct draw() for each Shape
     */
    for (int i = 0; i < N_SHAPES; i++) {
      // Each shape knows how to draw itself
      shapes[i]->draw();
      // Each shape knows how to print itself using printMe
      // which was overloaded to get polymorphism from the
      // Non-member function <<
      std::cout << *shapes[i] << std::endl;
    }

    return EXIT_SUCCESS;
}

