/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cFiles/main.c to edit this template
 */

/* 
 * File:   main.c
 * Author: C0561419
 *
 * Created on January 7, 2026, 2:38 PM
 */

#include <stdio.h>
#include <stdlib.h>

/*
 * 
 */
int main(int argc, char** argv) {
    
    /*define variables*/
    int numofChangeItems;
    
    double price, tendered, changeDue;
    
    /*prompt for purchase cost*/
    printf("Enter the amount of the purchase: ");
    scanf("%lf", &price);
    
    /*prompt for tendered amount*/
    printf("Enter the amount tendered: ");
    scanf("%lf", &tendered);
    
    /*Calculate change due*/
    changeDue = tendered - price;
    
    printf("Change Due is $%.2lf\n", changeDue);
    
    /*round to the nearest nickel*/
    changeDue = round(20*changeDue)/20;
            
    printf("Rounded to the nearest nickel $%.2lf\n", changeDue);
    
    /*denomination of change*/
    
    /*Twenties*/
    numofChangeItems = changeDue / 20;
    
    printf("%d Twenties\n", numofChangeItems);
    
    changeDue = changeDue - numofChangeItems * 20;
    
    /*Tens*/
    numofChangeItems = changeDue / 10;
    
    printf("%d Tens\n", numofChangeItems);
    
    changeDue = changeDue - numofChangeItems * 10;
    
    /*Fives*/
    numofChangeItems = changeDue / 5;
    
    printf("%d Fives\n", numofChangeItems);
    
    changeDue = changeDue - numofChangeItems * 5;
    
    /*Toonies*/
    numofChangeItems = changeDue / 2;
    
    printf("%d Toonies\n", numofChangeItems);
    
    changeDue = changeDue - numofChangeItems * 2;
    
    /*Loonies*/
    numofChangeItems = changeDue / 1;
    
    printf("%d Loonies\n", numofChangeItems);
    
    changeDue = changeDue - numofChangeItems * 1;
    
    /*Quarters*/
    numofChangeItems = changeDue / 0.25;
    
    printf("%d Quarters\n", numofChangeItems);
    
    changeDue = changeDue - numofChangeItems * 0.25;
    
    /*Dimes*/
    numofChangeItems = changeDue / 0.10;
    
    printf("%d Dimes\n", numofChangeItems);
    
    changeDue = changeDue - numofChangeItems * 0.10;
       
    /*Nickels*/

    numofChangeItems = round(changeDue / 0.05);
    
    
    printf("%d Nickels\n", numofChangeItems);
            
    return (EXIT_SUCCESS);
}

