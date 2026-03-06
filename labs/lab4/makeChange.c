/* 
 * File:   main.c
 * Author: C0561419
 *
 * Created on January 29, 2026, 11:10 AM
 */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "changeItem.h"

const double kValues[] = {20.0, 10.0, 5.0, 2.0, 1.0, 0.25, 0.10, 0.05};
const char *kSingleNames[] = {"Twenty", "Ten", "Five", "Toonie",
                              "Loonie", "Quarter", "Dime", "Nickel"};
const char *kPluralNames[] = {"Twenties", "Tens", "Fives", "Toonies",
                              "Loonies", "Quarters", "Dimes", "Nickels"};


const size_t kDenomCount = sizeof(kValues) / sizeof(kValues[0]);

int main(void)
{
    double purchase = 0.0;
    double tendered = 0.0;

    printf("Enter the amount of the purchase: ");
    scanf("%lf", &purchase);

    printf("Enter the amount tendered: ");
    scanf("%lf", &tendered);

    if (purchase <= 0.0 || tendered <= 0.0) {
        printf("makeChange Error: The amounts must be positive numbers\n");
        return 1;
    }

    if (tendered <= purchase) {
        double needed = purchase - tendered;
        long long neededCents = llround(needed * 100.0);
        if (neededCents < 5) {
            neededCents = 5;
        }
        long long roundedNeededCents = ((neededCents + 2) / 5) * 5;
        needed = roundedNeededCents / 100.0;
        printf("makeChange Error: Please give me at least $%.2f more cash\n", needed);
        return 1;
    }

    double change = tendered - purchase;
    long long changeCents = llround(change * 100.0);
    double changeDollars = changeCents / 100.0;

    printf("Change Due is $%.2f\n", changeDollars);

    long long roundedCents = ((changeCents + 2) / 5) * 5;
    double roundedDollars = roundedCents / 100.0;

    printf("Rounded to the nearest nickel $%.2f\n", roundedDollars);

    double remaining = roundedDollars;
    for (size_t i = 0; i < kDenomCount; i++) {
        remaining = changeItem(remaining, kValues[i], kSingleNames[i],
                               kPluralNames[i]);
    }

    return EXIT_SUCCESS;
}