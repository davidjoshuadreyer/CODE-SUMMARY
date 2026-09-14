
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int fac();
void printNumbers(int n);

int main(void)
{
   
    //fac(9);
    //printNumbers(10);
    return 0;
    
}

int fac(int n)
    
    {
     
    int f = 1;
    int i = n;
    while(i >= 1)
        {
            f *= i;
            i--;
        }
    printf("%d\n", f);
    return 0;
    }

void printNumbers(int n)
{
    int b = 0;
    b += 2;
    if(n < b)
    {
        return;
    }
    printf("%d ", b);
    printNumbers(n);
    //printf("%d ", b);
   
}