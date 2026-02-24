/*
 ============================================================================
 Name        : displayPatterns.c
 Author      : Mao
 Version     :
 Copyright   : @Mao
 Description : Display patterns
 ============================================================================
 */

#include <stdio.h>

int main(void) {


	char ch;
	printf("Enter a symbol: ");
	fflush(stdout); // flush the output
	ch = getchar();

	for (int i = 0; i < 3; i++)
	{
		for (int j = 0; j < 3; j++)
		{

			putchar(ch);

		}
		printf("\n");

	}

	return 0;

}
