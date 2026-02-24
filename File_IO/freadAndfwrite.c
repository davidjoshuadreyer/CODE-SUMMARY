/*
 ============================================================================
 Name        : freadAndfwite.c
 Author      : Mao
 Version     :
 Copyright   : @Mao
 Description : Demo of using fread and fwrite 
 ============================================================================
 */

#include <stdio.h>
#include <stdlib.h>

#define SIZE  5

int main(void)
{
    const double a[SIZE] = {1.0, 2.0, 3.0, 4.0, 5.0};
    printf("Array has size %ld bytes, element size: %ld\n", sizeof(a), sizeof(a[0]));
    FILE *outFile = fopen("test.dat", "wb"); // must use binary mode
    fwrite(a, sizeof (a[0]), SIZE, outFile); // writes an array of doubles
    fclose(outFile);
    
    FILE *inFile;
    inFile = fopen("test.dat","rb");
    int arraySize = SIZE; 
    // If the size of an array is unknown before compiling, use malloc to create an array 
    double *numbers = (double *) malloc (arraySize * sizeof(double));
    if (numbers == NULL) {
        fprintf(stderr, "malloc failure");
        return EXIT_FAILURE;
    }
  
    //size_t is an unsigned integer data type which can assign only 0 and greater than 0 integer values.
    const size_t ret_code = fread(numbers, sizeof (numbers[0]), arraySize , inFile); // reads an array of doubles
    if (ret_code == arraySize)
    {
        printf("File content: \n");
        for (int i = 0; i < arraySize ; i++)
            printf("%f ", numbers[i]);
        putchar('\n');
    }
    else // error handling
    {
        if (feof(inFile))
            printf("Error reading test.dat: unexpected end of file\n");
        else if (ferror(inFile))
            perror("Error reading test.dat");
    }
 
    fclose(inFile);
    return 0;
}

