// File:   main.c
// Author: C0561419
//
// Created on March 2, 2026, 11:00 AM

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "arraySearch.h"

// Number of integers stored in the binary data file
#define SIZE 1000

// Name of the binary file containing the integer data
#define FILENAME "binaryNumbers.dat"

// compareInts - comparison function required by qsort.
// qsort passes two void pointers; we cast them to int pointers
// and return negative, zero, or positive to indicate order.
// Using subtraction is avoided to prevent integer overflow on
// extreme values, so we use the (a > b) - (a < b) idiom instead.
static int compareInts(const void *a, const void *b)
{
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);
}

int main(void)
{
    // arr holds the original unsorted data read from the file.
    // sorted will hold a sorted copy used for binary search.
    int arr[SIZE];
    int sorted[SIZE];

    // --- Step 1: Open the binary file for reading ---
    // "rb" mode opens in binary (not text) mode, which is required
    // when reading raw integer bytes rather than formatted text.
    FILE *fp = fopen(FILENAME, "rb");
    if (fp == NULL) {
        fprintf(stderr, "Error: could not open %s\n", FILENAME);
        return EXIT_FAILURE;
    }

    // --- Step 2: Read all integers from the file into arr ---
    // fread reads SIZE elements, each sizeof(int) bytes wide,
    // and returns the number of elements successfully read.
    size_t count = fread(arr, sizeof(int), SIZE, fp);
    fclose(fp);  // Close the file as soon as we are done with it

    // Verify we got exactly the expected number of values
    if (count != SIZE) {
        fprintf(stderr, "Error: expected %d values, read %zu\n", SIZE, count);
        return EXIT_FAILURE;
    }

    // --- Step 3: Build a sorted copy of the array ---
    // Binary search requires a sorted array, but we keep the original
    // unsorted so linear search can work on the unmodified data.
    // memcpy copies every byte of arr into sorted.
    memcpy(sorted, arr, sizeof(arr));

    // qsort sorts sorted[] in-place in ascending order using compareInts
    qsort(sorted, SIZE, sizeof(int), compareInts);

    // --- Step 4: Get the search target from the user ---
    int target;
    printf("Enter the value to search for: ");
    if (scanf("%d", &target) != 1) {
        fprintf(stderr, "Error: invalid input\n");
        return EXIT_FAILURE;
    }

    // --- Step 5: Linear search on the original unsorted array ---
    // Scans from index 0 upward, stopping at the first match.
    // Returns the index where target was found, or -1 if not found.
    // linComparisons is set to the number of elements examined.
    size_t linComparisons;
    int linIndex = linearSearch(arr, SIZE, target, &linComparisons);

    if (linIndex >= 0)
        printf("Linear Search: %d found at index %d (%zu comparisons)\n",
               target, linIndex, linComparisons);
    else
        printf("Linear Search: %d not found (%zu comparisons)\n",
               target, linComparisons);

    // --- Step 6: Binary search on the sorted copy ---
    // Repeatedly halves the search range, so it needs far fewer
    // comparisons than linear search on large arrays.
    // Returns the index in sorted[] where target was found, or -1.
    size_t binComparisons;
    int binIndex = binarySearch(sorted, SIZE, target, &binComparisons);

    if (binIndex >= 0)
        printf("Binary Search: %d found at sorted index %d (%zu comparisons)\n",
               target, binIndex, binComparisons);
    else
        printf("Binary Search: %d not found (%zu comparisons)\n",
               target, binComparisons);

    return EXIT_SUCCESS;
}
