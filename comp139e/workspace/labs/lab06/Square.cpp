#include "Square.hpp"
#include <stdexcept>

using namespace std;

Square::Square(double side, int x, int y) : Rectangle(side, side, x, y) {}
void Square::draw() const {
    // TODO: Display this square's size and location.
    throw logic_error("TODO: Square::draw");
}
void Square::printMe(ostream& os) const {
    // TODO: Write a description of this square to os.
    throw logic_error("TODO: Square::printMe");
}
