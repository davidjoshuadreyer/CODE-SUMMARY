// File:   searchMain.c
// Author: C0561419
//
// Created on March 2, 2026, 11:00 AM

#include <stdio.h>
#include <stdlib.h>
#include "arraySearch.h"

int main(int argc, char *argv[])
{
    // 1) Check for exactly three command-line arguments
    if (argc != 3) {
        printf("Usage: search numberFileName nNumbers\n");
        return 1;
    }

    // 2) Get filename from command line and open with "rb"
    FILE *fp = fopen(argv[1], "rb");

    // 3) Check that the file opened successfully
    if (fp == NULL) {
        printf("search: Unable to open \"%s\"\n", argv[1]);
        return 1;
    }

    // 4) Get the number count from command line using sscanf
    int nNumbers;
    if (sscanf(argv[2], "%d", &nNumbers) != 1) {
        printf("search: Unable to convert \"%s\" into an integer value.\n", argv[2]);
        fclose(fp);
        return 1;
    }

    // 5) Allocate memory for the array now that we know the size
    int *numbers = (int *) malloc((size_t)nNumbers * sizeof(int));
    if (numbers == NULL) {
        fprintf(stderr, "malloc failed\n");
        fclose(fp);
        return EXIT_FAILURE;
    }

    // 6) Read all values from the file using a single fread
    size_t count = fread(numbers, sizeof(numbers[0]), nNumbers, fp);

    // 7) Check that the requested number of values was actually read.
    // feof/ferror must be called BEFORE fclose, otherwise fp is invalid.
    if (count != (size_t)nNumbers) {
        if (feof(fp))
            printf("search: Unable to read %d numbers from file \"%s\": unexpected end of file\n", nNumbers, argv[1]);
        else if (ferror(fp))
            printf("search: Unable to read %d numbers from file \"%s\": read error\n", nNumbers, argv[1]);
        fclose(fp);
        free(numbers);
        return 1;
    }

    // 10) Close the file now that we are done reading
    fclose(fp);

    // 8) Repeatedly prompt the user for a number to search
    char input[20];
    printf("Enter the integer value to find ('q' to quit): ");
    while (scanf("%19s", input) == 1 && input[0] != 'q') {
        int target;
        if (sscanf(input, "%d", &target) == 1) {
            // 9) Search and print the result
            int index = linearSearch(target, numbers, nNumbers);
            if (index >= 0)
                printf("%d was found at position %d\n", target, index);
            else
                printf("%d was not found\n", target);
        }
        printf("Enter the integer value to find ('q' to quit): ");
    }
    printf("Bye\n");

    free(numbers);
    return EXIT_SUCCESS;
}
