// Construct, copy, and inspect simple objects
// Lecture: 1-3_Objects_and_Classes.pdf, pages 4–40
// Try: Change the side in setSide to 5. Explain why the copied object still prints 9.
#include <iostream>
class Square {
    double side;
    static int constructed;
public:
    Square(double side = 1) : side(side) { ++constructed; }
    void setSide(double side) { if (side >= 0) this->side = side; }
    double area() const { return side * side; }
    static int count() { return constructed; }
};
int Square::constructed = 0;
int main() {
    Square shapes[2] = {Square(2), Square(3)};
    Square copy;
    copy = shapes[1]; // Assignment copies the side; it calls no constructor.
    shapes[1].setSide(2);
    const Square& view = copy;
    std::cout << shapes[1].area() << ' ' << view.area() << '\n';
    std::cout << "Objects constructed: " << Square::count() << '\n';
}
