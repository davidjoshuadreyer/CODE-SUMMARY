#pragma once
#include "../common/shapes/Rectangle.hpp"
class Square : public Rectangle {
public:
    Square(double side, int x, int y);
    void draw() const override;
protected:
    void printMe(std::ostream& os) const override;
};
