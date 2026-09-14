#include <stdio.h>
#include <stdlib.h>

// The function for finding the solution to move n disks
// from fromTower to toTower with auxTower
void moveDisks(int n, char fromTower,
		char toTower, char auxTower)
{
	if (n == 1) // Stopping condition
		printf("Move disk %d from %c to %c\n", n, 
		fromTower, toTower);
	else
	{
		moveDisks(n - 1, fromTower, auxTower, toTower);
		printf("Move disk %d from %c to %c\n", n, fromTower, toTower);
		moveDisks(n - 1, auxTower, toTower, fromTower);
	}
}

int testTowersOfHanoi()
{
	// Read number of disks, n
	printf("Enter number of disks: ");
	int n;
	scanf("%d", &n);

	// Find the solution recursively
	printf("The moves are: \n");
	moveDisks(n, 'A', 'B', 'C');

	return 0;
}

int main(int argc, char** argv) {

    testTowersOfHanoi();
    return (EXIT_SUCCESS);
}