// Allocate, sort, find, and free an array
// Lecture: 1-2_Pointers_and_Dynamic_Memory_Management.pdf, pages 3–28
// Try: Search for 7. Keep the end check and explain why no Found line appears.
#include <algorithm>
#include <iostream>
int main() {
    const int size = 3;
    int* values = new int[size]{8, 2, 4};
    std::sort(values, values + size);
    std::cout << *values << ' ' << *(values + 1) << ' ' << values[2] << '\n';
    int* found = std::find(values, values + size, 4);
    if (found != values + size) std::cout << "Found: " << *found << '\n';
    delete[] values; // Matches array new. found is now dangling too.
    values = nullptr;
}
