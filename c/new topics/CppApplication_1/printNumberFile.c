/*
 * Print ASCII numbers contained in a file to the console.
 * The file name is a command-line argument.
 * 
 * File:   printNumberFile.c
 * Author: Dale
 *
 * Created on February 17, 2022
 */

#include <stdio.h>
#include <stdlib.h>
#include <libgen.h>
#include <string.h>
#include <errno.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s fileName\n", basename(argv[0]));
        return EXIT_FAILURE;
    }
    
    FILE *inFile;
    if ((inFile = fopen(argv[1], "r")) == NULL){
        fprintf(stderr, "%s: Unable to open %s because: %s\n",
		basename(argv[0]), argv[1], strerror(errno));
        return EXIT_FAILURE;
    }

    printf("Examples of two ways of reading from the file:\n");
    
    printf("Using the return value from fscanf\n");
    double x;
    while (fscanf(inFile, "%lf", &x) == 1) {
        printf("%lf ", x);
    }
    printf("\n");
    
    rewind(inFile);
    
    printf("Checking for end of file\n");
    while (!feof(inFile)) {
        double x;
        if (fscanf(inFile, "%lf", &x) != 1) {
            break;
        }
        printf("%lf ", x);
    }
    printf("\n");
    
    fclose(inFile);
    
    return (EXIT_SUCCESS);
}
