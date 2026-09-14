// Code snippet for allocating a chunk of memory having the 
// right size at RUN time.
// (since we don't know how much we need when writing the program.
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#define PREFIX "Result_"

int main(int argc, char *argv[]) 
{
  int nChar = strlen(PREFIX) + strlen(argv[1]) + 1; // Length of output string array
  char *outName = (char *) malloc(nChar);  // Request a chunk of memory
  snprintf(outName, nChar, "%s%s", PREFIX, argv[1]); //Concatenate PREFIX and argv[1]
  printf("%s", outName);
  // outName is now ready to use in fopen()

  // After we are done with the chunk, we can give it back:
  free(outName);
}


// NOTES:
// malloc() returns the starting address of the block of memory.
// It returns NULL if it fails, but no need to check in this lab.
// The chunk of memory is persistent, i.e., it remains until our
// program finishes (or until we free() it), 
// even if it was allocated in a function.
