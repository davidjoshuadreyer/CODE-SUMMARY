
/* 
 * File:   main.c
 * Author: david
 *
 * Created on February 25, 2026, 12:38 p.m.
 */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int sum(void);
/*
 * 
 */
int main(int argc, char** argv) {

    
    
    sum();
    
    return (EXIT_SUCCESS);
}


int sum()
{
    int a;
    int b;
    int result;
    printf("enter first number: ");
    scanf("%d", &a);
    printf("enter second number: ");
    scanf("%d", &b);
    result = a + b;
    printf("%d + %d = %d\n", a, b, result);
    
    
}
