// Handle division by zero and keep going
// Lecture: 1-4_Files_and_Exception_Handling.pdf, pages 3–16
// Try: Change the second denominator to 2. Which statements are now reached?
#include <iostream>
#include <stdexcept>
double quotient(double numerator, double denominator) {
    if (denominator == 0) throw std::runtime_error("Cannot divide by zero");
    return numerator / denominator;
}
int main() {
    try {
        std::cout << "Result: " << quotient(8, 2) << '\n';
        double answer = quotient(8, 0);
        std::cout << answer << '\n'; // Skipped when quotient throws.
    } catch (const std::exception& error) {
        std::cout << error.what() << '\n';
    }
    std::cout << "Program continues\n";
}
