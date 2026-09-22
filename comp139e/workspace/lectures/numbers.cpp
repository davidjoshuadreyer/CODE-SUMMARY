// Integer division and increment
// Lecture: 0-1_Introduction_to_C++.pdf, pages 7–28
// Try: Change 5 to 7 in both divisions. Then move ++count into its own statement.
#include <iostream>
int main() {
    std::cout << 5 / 2 << ' ' << static_cast<double>(5) / 2 << '\n';
    int count = 4;
    int old = count++; // old gets 4; count becomes 5.
    ++count;          // count becomes 6.
    std::cout << old << ' ' << count << '\n';
}
