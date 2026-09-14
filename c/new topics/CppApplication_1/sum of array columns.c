/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cFiles/main.c to edit this template
 */

/* 
 * File:   main.c
 * Author: david
 *
 * Created on February 11, 2026, 1:38 p.m.
 */

#include <stdio.h>
#include <stdlib.h>

double computeSum(double *arr, double arrSize);



/*
 * 
 * 
 */
int main(int argc, char** argv) {
    
//    char array1[3] = "ab";
//    
//    double array2[10] = {3.4, [5] = 3.5, 6.5};
//    
//    
//    double sum = computeSum(array2,sizeof(array2) / sizeof(array2[0]));
//    
//    
//    
//    printf("%lf", sum);
    
    
    int array[3][2] = {{10,20},{30,40},{50,30}};
    
    printf("array = %p\n", array);
    printf("array[0][0] = %p\n", &array[0][0]);
    printf("array[0][1] = %p\n", &array[0][0]);
    printf("array[1] = %p\n", array[1]);
    printf("&array[1] = %p\n", &array[1]);
    printf("*(array[1]+1) = %d\n", *(array[1]+1));
    printf("*(array[1]+2) = %d\n", *(array[1]+2));
    printf("*(array[2]+1) = %d\n", *(array[2]+1));
    
    printf("*array = %p\n", *array);
    printf("**array = %d\n", *(*(array+2)+1));
    
   // int *p = array;
    
    //printf("%d ",*(p+2));
    
    int sum = 0.0;
    for(int i =0; i < 3; i++)
    {
        for(int j =0; j < 2; j++)
        {
            //printf("%d ", array[i][j]);
            //printf("%d ", *(array[i]+j));
            //printf("%d ", *(*(array+i)+j));
            
            //printf("%d ", *(*(p+i)+j));
            
            sum += array[i][j];
        }
        putchar('\n');
          
    }
    printf("%d",sum);
    return(EXIT_SUCCESS);
}



double computeSum(double *arr, double arrSize)
{
    double sum = 0.0;
    printf("In local: %lf\n", arr[0]);
    for (int i = 0; i < arrSize; i++)
    {
        printf("%d\n", i);
        sum += arr[i];
    }
    return sum;
}
