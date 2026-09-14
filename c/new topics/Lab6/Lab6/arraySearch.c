#include "arraySearch.h"

// Search an array for a given value.
// A linear search is used, so the data need not be sorted
// Returns: the zero-based index of the number (if found)
//          otherwise -1
int linearSearch(const int value, const int numbers[], const int nNumbers)
{
    for (int i = 0; i < nNumbers; i++) {
        if (numbers[i] == value)
            return i;
    }
    return -1;
}
