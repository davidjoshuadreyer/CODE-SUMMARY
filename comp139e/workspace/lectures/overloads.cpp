// Defaults, overloads, and a remembered counter
// Lecture: 1-1_Functions.pdf, pages 4–18
// Try: Call nextTicket a third time. Change the default factor to 3.
#include <iostream>
int scale(int value, int factor = 2) { return value * factor; }
double scale(double value) { return value * 1.5; }
int nextTicket() {
    static int issued = 0; // Initialized once; survives later calls.
    return ++issued;
}
int main() {
    std::cout << scale(3) << ' ' << scale(2, 5) << ' ' << scale(2.0) << '\n';
    int first = nextTicket();
    int second = nextTicket();
    std::cout << first << ' ' << second << '\n';
}
