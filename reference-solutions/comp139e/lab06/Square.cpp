#include "Square.hpp"
#include <iostream>
Square::Square(double side,int x,int y):Rectangle(side,side,x,y){}
void Square::draw() const {printMe(std::cout);std::cout<<'\n';}
void Square::printMe(std::ostream& os) const {os<<"Square side="<<getLength()<<" at ("<<getX()<<", "<<getY()<<")";}
