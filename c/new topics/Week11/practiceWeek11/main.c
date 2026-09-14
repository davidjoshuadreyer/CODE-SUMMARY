
#include <stdio.h>
#include <stdlib.h>

void printB();


int main() {
    
    int a = 10;
    printB(a);

    return (EXIT_SUCCESS);
}

void printB(int num)
{
    
    char array[33];
    array[32] = '\0';
    for(int i = 31; i >= 0; i--)
    {
        if(num & 1 == 1)
        {
            array[i] = '1';
        }
        else
        {
            array[i] = '0';
        }
        num >>= 1;
        
    }
    printf("%s\n", array);
}
