/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cFiles/main.c to edit this template
 */

/* 
 * File:   main.c
 * Author: david
 *
 * Created on February 25, 2026, 1:05 p.m.
 */

#include <stdio.h>
#include <stdlib.h>

float average(int *scores, int n);

/*
 * 
 */
int main(int argc, char** argv) {

    int n;
    
    printf("how many students? ");
    scanf("%d", &n);
    
    int scores[n];
    
    for (int i = 0; i < n; i++) {
        printf("Score %d: ", i + 1);
        scanf("%d", &scores[i]);
    }
    
    float avg = average(scores, n);
    printf("average: %.2f\n", avg);
    
    int above = 0;
    for (int i = 0; i < n; i++)
        if (scores[i] > avg) above++;

    printf("%d student(s) scored above average\n", above);
    
    return (EXIT_SUCCESS);
}

float average(int *scores, int n)
{
    int sum = 0;
    for (int i = 0; i <n; i++)
    {
        sum += scores[i];  
    }
    
    return(float)sum / n;
    
}