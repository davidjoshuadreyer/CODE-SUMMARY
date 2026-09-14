
#include <stdio.h>
#include <stdlib.h>

#define N_NUMS 10
#define WORD_FORMAT "%d "

typedef int WORD;
const WORD START = 1011; 

void printVector(const WORD *vec, int n);
void reverseVector(WORD *vec, int p1, int p2);


int main(void) 
{

    //define array
    WORD nums[N_NUMS];
    for(int i = 0; i < N_NUMS; i++)
    {
        nums[i]= START + i;
    };
    
    //3 a) print the contents of the array using printVector
    printf("Original Vector:\n");
    printVector(nums, N_NUMS);
    printf("Vector Reversed:\n");
    reverseVector(nums, 0, N_NUMS - 1);
    printVector(nums, N_NUMS);
    printf("Vector Reversed Back:\n");
    reverseVector(nums, 0, N_NUMS - 1);
    printVector(nums, N_NUMS);
    
    
    return (EXIT_SUCCESS);
}



void printVector(const WORD *vec, int n)
{
    
    if (n == 0)
    {
        printf("\n");
        return;
    }
    printf(WORD_FORMAT, *vec);
    printVector(vec + 1, n-1);
}


void reverseVector(WORD *vec, int p1, int p2)
{
    //base case
    if (p1 >= p2) 
    {
        return;
    }
    //swap elements with temp
    WORD temp = vec[p1];     
    vec[p1] = vec[p2];
    vec[p2] = temp;
    
    reverseVector(vec, p1 + 1, p2 - 1);  
}


