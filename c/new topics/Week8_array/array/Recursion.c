
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int fac();

int main(void)
{
   
    fac(9);
    
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