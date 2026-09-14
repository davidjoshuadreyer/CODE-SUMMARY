
/* 
 * File:   main.c
 * Author: david
 *
 * Created on February 23, 2026, 8:33 a.m.
 */

#include <stdio.h>
#include <stdlib.h>

/*
 * 
 */
int main(int argc, char** argv) {

    int array[2][3] = {{2,8,1},
                       {5,6,4}};
    
    printf("**array = %d\n", *((array[1])+2));
    
    printf("**array = %d\n", *(*(array+1)+2));
    
    int arrayS[3] = {0};
    
    
    
    
    for(int i =0; i < 3; i++)
    {
        for(int j =0; j < 2; j++)
        {
            //printf("%d ", array[i][j]);
            //printf("%d ", *(array[i]+j));
            //printf("%d ", *(*(array+i)+j));
            
            //printf("%d ", *(*(p+i)+j));
            
            arrayS[i] += array[j][i];
            
        }
        printf("%d",*(arrayS+i));
        putchar('\n');
          
    }
    
    //printf("%d %d %d",arrayS[0], arrayS[1], arrayS[2]);
    return (EXIT_SUCCESS);
}

