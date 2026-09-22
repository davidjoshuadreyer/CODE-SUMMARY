// Read a radius and calculate area
// Lecture: 0-1_Introduction_to_C++.pdf, pages 7–28
// Try: Change the input to 3. Predict why the area grows by more than one half.
#include <iostream>
#include <iomanip>
int main() {
    const double pi = 3.141592653589793;
    double radius = 0;
    // Check the read before using the measurement.
    if (!(std::cin >> radius) || radius < 0) {
        std::cout << "Enter a non-negative radius.\n";
        return 1;
    }
    std::cout << std::fixed << std::setprecision(2)
              << "Area: " << pi * radius * radius << '\n';
}
