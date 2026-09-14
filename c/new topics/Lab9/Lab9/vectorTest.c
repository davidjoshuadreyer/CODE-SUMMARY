#include <stdio.h>
#include <stdlib.h>
#include "vectorMath.h"

int main (void) {
  Vector vec1 = {5, {1.0, 4.0, -7.2, -6.66, 1.23 }};
  Vector vec2 = {5, {-5.2, 11.1, 0.1, 9.9, 7.123 }};
  Vector vec3 = {7 };
  Vector result;

  // 5a: print the two input vectors
  printf("Vector #1  ");
  printVector(vec1, stdout);
  printf("Vector #2  ");
  printVector(vec2, stdout);

  // 5b: perform all four operations, print result or error message
  if (vectorMath(vec1, vec2, &result, '+') != NULL) {
    printf("Sum        ");
    printVector(result, stdout);
  } else {
    printf("Addition failed\n");
  }
  if (vectorMath(vec1, vec2, &result, '-') != NULL) {
    printf("Difference ");
    printVector(result, stdout);
  } else {
    printf("Subtraction failed\n");
  }
  if (vectorMath(vec1, vec2, &result, '*') != NULL) {
    printf("Product    ");
    printVector(result, stdout);
  } else {
    printf("Multiplication failed\n");
  }
  if (vectorMath(vec1, vec2, &result, '/') != NULL) {
    printf("Quotient   ");
    printVector(result, stdout);
  } else {
    printf("Division failed\n");
  }

  // 5c: demonstrate error checking - incompatible sizes
  if (vectorMath(vec1, vec3, &result, '/') != NULL) {
    printf("Quotient   ");
    printVector(result, stdout);
  } else {
    printf("Division failed\n");
  }
  // 5c: demonstrate error checking - invalid operator
  if (vectorMath(vec1, vec2, &result, '^') != NULL) {
    printf("Exponent   ");
    printVector(result, stdout);
  } else {
    printf("Exponentiation failed\n");
  }

  return EXIT_SUCCESS;
}
