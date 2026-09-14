
/* 
 * File:   main.c
 * Author: david
 *
 * Created on February 22, 2026, 10:48 a.m.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "statistics.h"
#define PREFIX "Result_"

//declare printStats function (defined under main)
static void printStats (FILE *dest, const int count, const double
theMean, const double stddev);

/*
 * 
 */
int main(int argc, char** argv) {

    // check for correct number of arguments
    
    if (argc != 2)
    {
        printf("Usage: %s dataFileName\n", argv[0]);
        return 1;
    }
    
    //open input file
    
    FILE *inFile;
    
    
    if ((inFile = fopen(argv[1], "r")) == NULL)
    {
        printf("%s: Unable to open input file \"%s\"\n", argv[0], argv[1]);
        return 1;
    }
    
    //Read values, don't use array
    
    double x, sum = 0.0, sumsq = 0.0;
    int count = 0;
    
    while(fscanf(inFile, "%lf", &x) == 1)
    {
        sum += x;
        sumsq += x * x;
        count++;
    }
    
    //Close file
    fclose(inFile);
    
    //Check for at least two values
    
    if (count < 2) {
        printf("Error: Need at least 2 values.\n");
        return 1;
    }
    
    //Define variables
    double theMean = mean(sum, count);
    double stddev = ssdev(sum, sumsq, count);
    
    //Print to console
    
    printStats(stdout, count, theMean, stddev);
    
    //Output file using malloc
    int nChar = strlen(PREFIX) + strlen(argv[1]) + 1;
    char *outName = (char *) malloc(nChar);
    snprintf(outName, nChar, "%s%s", PREFIX, argv[1]);
    
    
    
    FILE *outFile;
    
    if ((outFile = fopen(outName, "w")) == NULL)
    {
        printf("Unable to open output file \"%s\"\n", outName);
        free(outName);
        return 1;
    }
    
    //write to output file
    printStats(outFile, count, theMean, stddev);
    
    //close output file
    fclose(outFile);
    free(outName);
    
    return 0;
    
}

//printStats Function
static void printStats(FILE *dest, const int count, const double theMean, const double stddev)
{
    fprintf(dest, "%d Values, Mean = %g, Sample Standard Deviation = %g\n", count, theMean, stddev);
}
