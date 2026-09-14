/*
 ============================================================================
 Name        : stringArrayDemo.c
 Author      : Mao
 Version     :
 Copyright   : 
 Description : Demo of using a string array for Lab 4
 ============================================================================
 */
#include <stdio.h>
#include <string.h>

int printBill(char *str)
{
    printf("%s\n", str);
    return strlen(str);
}

int main(void)
{
    char *bills[] = {"Twenties", "Tens", "Fives"};
    for(int i = 0; i < 3; i++)
    {
        printf("The string length is: %d\n", printBill(bills[i]));
    }
 
    return 0;
}