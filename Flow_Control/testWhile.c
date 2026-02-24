/*
 ============================================================================
 Name        : testWhile.c
 Author      : Mao
 Version     :
 Copyright   : @Mao
 Description : Compute the sum of all integers from 1 to 10
 ============================================================================
 */

#include <stdio.h>

int main(void) {


	int i = 1;
	int sum = 0;

	while(i < 11)
	{

		sum = sum + i;
		i++;
	}

	printf("The total is: %d", sum);
	return 0;

}
