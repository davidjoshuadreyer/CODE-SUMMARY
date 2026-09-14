/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cFiles/main.c to edit this template
 */

/* 
 * File:   main.c
 * Author: david
 *
 * Created on March 4, 2026, 2:04 p.m.
 */

#include <stdio.h>
#include <stdlib.h>

/*
 * 
 */

int searchNumbers(int a[], int key, int low, int high) 
{
	if (low > high) // The list has been exhausted without a match
		return -low - 1; // key not found, return the insertion point

	int mid = (low + high) / 2;
        if (key == a[mid])
		return mid;
	else if (key < a[mid])
		return searchNumbers(a, key, low, mid - 1);
	else
		return searchNumbers(a, key, mid + 1, high);
}

double power(double x, unsigned int n)
{
    if (n==0)
        return 1.0;
    
    return x * power(x, n-1);
}


int main(int argc, char** argv) {

    int array[6] = {3, 7, 9, 10, 13, 20};
    int result = searchNumbers(array, 9, 0, 5);
    printf("Result: %d\n", result);
    return (EXIT_SUCCESS);
}

