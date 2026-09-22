// Change a value and redirect a pointer
// Lecture: 1-2_Pointers_and_Dynamic_Memory_Management.pdf, pages 3–28
// Try: Change redirect to take int* instead of int*&. Predict the second printed number.
#include <iostream>
void setValue(int* p) { *p = 7; }
void redirect(int*& p, int* target) { p = target; }
int main() {
    int first = 3;
    int second = 9;
    int* p = &first;
    setValue(p);
    redirect(p, &second);
    std::cout << first << ' ' << *p << '\n';
    const char* word = "Hi"; // Literal characters must not be modified.
    std::cout << word << '\n';
}
