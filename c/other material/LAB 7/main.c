#include <stdio.h>

// data type for each element
typedef int WORD;       
// printf format
#define WORD_FORMAT "%d "
// number of elements in the array
#define N_NUMS      10  
// first value in the consecutive sequence
const WORD START = 1011;        

//functions
void swap(WORD *x, WORD *y);
void printVector(const WORD *vec, const int N);
void printBytes(const WORD *vec, const int N);
void printBytesReverseEndian(const WORD *vec, const int N);

//main loop
int main(void)
{
    // Declare and initialize the array with N_NUMS consecutive values
    WORD nums[N_NUMS];
    for (int i = 0; i < N_NUMS; i++) {
        nums[i] = START + (WORD)i;
    }

    // 5a) Print original array
    printf("Original Vector:\n");
    printVector(nums, N_NUMS);


    // 5b) Swap adjacent pairs using pointer notation (no square brackets)
    for (int i = 0; i < N_NUMS - 1; i += 2) {
        swap((nums + i), (nums + i + 1));
    }
    printf("Adjacent words swapped:\n");
    
    // 5c) Print the contents of the array using printVector()
    printVector(nums, N_NUMS);
 

    // 5d) Swap back using array notation (square brackets)
    for (int i = 0; i < N_NUMS - 1; i += 2) {
        swap(&nums[i], &nums[i + 1]);
    }
    printf("Words swapped back:\n");
    
    // 5e)  Print the contents of the array using printVector()
    printVector(nums, N_NUMS);


    // 5f) Print raw bytes
    printf("Data Bytes:\n");
    printBytes(nums, N_NUMS);


    // 5g) Print bytes in reverse-endian order
    printf("Word bytes with endian reversal:\n");
    printBytesReverseEndian(nums, N_NUMS);


    return 0;
}


// Swap the two values pointed at by x and y (no loop).
void swap(WORD *x, WORD *y)
{
    WORD tmp = *x;
    *x = *y;
    *y = tmp;
}


// Print all values in a 1-D array of size N using pointer post-increment.
void printVector(const WORD *vec, const int N)
{
    const WORD *p = vec;
    for (int i = 0; i < N; i++) {
        printf(WORD_FORMAT, *p++);
    }
    printf("\n");
}


// Print each element one byte at a time
// Prints an extra space after each word using pointer post-increment.
void printBytes(const WORD *vec, const int N)
{
    const WORD *p = vec;
    for (int i = 0; i < N; i++) {
        const unsigned char *byte = (const unsigned char *)p++;
        for (int j = 0; j < (int)sizeof(WORD); j++) {
            printf("%hhu ", *byte++);
        }
        printf(" "); // extra space after each WORD
    }
    printf("\n");
}


// Print each element one byte at a time in reverse order.
// Prints an extra space after each word using pointer notation
void printBytesReverseEndian(const WORD *vec, const int N)
{
    const WORD *p = vec;
    for (int i = 0; i < N; i++) {
        // Point to the last byte of the current WORD, then walk backwards
        const unsigned char *byte = (const unsigned char *)p + sizeof(WORD) - 1;
        for (int j = 0; j < (int)sizeof(WORD); j++) {
            printf("%hhu ", *byte--);
        }
        printf(" "); // extra space after each WORD
        p++;
    }
    printf("\n");
}
