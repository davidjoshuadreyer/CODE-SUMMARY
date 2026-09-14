#include <stdio.h>
#include "vectorMath.h"

Vector *vectorMath(const Vector v1, const Vector v2,
                   Vector *resultPtr, const char op)
{
    // 3: return NULL if vectors are not the same size
    if (v1.size != v2.size) {
        return NULL;
    }

    resultPtr->size = v1.size;

    // 3: use switch for op
    switch (op) {
        case '+':
            for (int i = 0; i < v1.size; i++) {
                resultPtr->data[i] = v1.data[i] + v2.data[i];
            }
            break;

        case '-':
            for (int i = 0; i < v1.size; i++) {
                resultPtr->data[i] = v1.data[i] - v2.data[i];
            }
            break;

        case '*':
            for (int i = 0; i < v1.size; i++) {
                resultPtr->data[i] = v1.data[i] * v2.data[i];
            }
            break;

        case '/':
            for (int i = 0; i < v1.size; i++) {
                
                //check we aren't dividing by 0.
                if (v2.data[i] == 0){
                    return NULL;  
                } 
                resultPtr->data[i] = v1.data[i] / v2.data[i];
            }
            break;

        default: // 3: return NULL if operator is invalid
            return NULL;
    }

    return resultPtr;
}

// 4: pointer notation with post-increment
void printVector(const Vector v, FILE *stream)
{
    const WORD *ptr = v.data;

    for (int i = 0; i < v.size; i++) {
        fprintf(stream, WORD_FORMAT, *ptr++);
    }
    fprintf(stream, "\n");
}
