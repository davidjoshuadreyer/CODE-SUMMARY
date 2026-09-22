// Compare copying with changing the original
// Lecture: 1-1_Functions.pdf, pages 4–18
// Try: Call byReference twice. Explain why the result changes but byValue does not.
#include <iostream>
#include <string>
void byValue(int number);
void byReference(int& number);
void greet(const std::string& name) { std::cout << "Hello " << name << '\n'; }
int main() {
    int score = 5;
    byValue(score);
    std::cout << "After value: " << score << '\n';
    byReference(score);
    std::cout << "After reference: " << score << '\n';
    greet("Ada");
}
void byValue(int number) { ++number; }
void byReference(int& number) { ++number; }
