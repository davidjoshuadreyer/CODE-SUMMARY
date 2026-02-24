/*
 ============================================================================
 Name        : computeBCTax.c
 Author      : Mao
 Version     :
 Copyright   : @Mao
 Description : Compute BC tax
 ============================================================================
 */

#include <stdio.h>

int main(void) {

	// Prompt the user to enter taxable income
	printf("Enter the BC Personal taxable income: ");
	fflush(stdout); //  force outputs
	double income;
	scanf("%lf", &income);

	// Compute tax
	double tax = 0;


	if (income <= 42184)
		tax = income * 0.0506;
	else if (income <= 84369)
		tax = 42184 * 0.0506 +
		(income - 42184) * 0.0770;
	else if (income <= 96866)
		tax = 42184 * 0.0506 + (84369 - 42184) * 0.0770 +
		(income - 84369) * 0.1050;
	else if (income <= 117623)
		tax = 42184 * 0.0506 + (84369 - 42184) * 0.0770 + (96866-84369) * 0.1050 +
		(income  - 96866) * 0.1229;
	else if (income <= 159483)
		tax = 42184 * 0.0506 + (84369 - 42184) * 0.0770 + (96866-84369) * 0.1050 +
		(117623 - 96866) * 0.1229 +
		(income  - 117623) * 0.1470;
	else if (income <= 222420)
		tax = 42184 * 0.0506 + (84369 - 42184) * 0.0770 + (96866-84369) * 0.1050 +
		(117623 - 96866) * 0.1229 + (159483 - 117623) * 0.1470 +
		(income  - 159483) * 0.1680;
	else
		tax = 42184 * 0.0506 + (84369 - 42184) * 0.0770 + (96866-84369) * 0.1050 +
		(117623 - 96866) * 0.1229 + (159483 - 117623) * 0.1470 + (222420 - 159483) * 0.1680 +
		(income  - 222420) * 0.2050;

	// Display the result
	printf("Tax is %lf \n",  (int)(tax * 100) / 100.0);

	return 0;
}
