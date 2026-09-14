#ifndef VECTORMATH_H
#define VECTORMATH_H

#include <stdio.h>

// 8: WORD and WORD_FORMAT as optional compiler defines via -D flags
#ifndef WORD
  #define WORD double
#endif

#ifndef WORD_FORMAT
  #define WORD_FORMAT "%.4f "
  //#error You must define WORD_FORMAT as a compile-time option

#endif

// 1: fixed max length #defined in header
#define MAX_VECTOR_SIZE 20

// 1: typedef struct to create Vector data type; WORD type defined above
typedef struct {
    int    size;
    WORD   data[MAX_VECTOR_SIZE];
} Vector;

// 2: function declarations in vectorMath.h
Vector *vectorMath(const Vector v1, const Vector v2,
                   Vector *resultPtr, const char op);

void printVector(const Vector v, FILE *stream);

#endif // VECTORMATH_H
