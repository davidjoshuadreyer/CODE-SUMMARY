#include <stdio.h>
#include <stdlib.h>

int main(void) {
    // Declare variables and constants.
    double inputTemp;
    char line[11];
    char type;
    const double kOffset = 273.15;

    // Prompt for input and read the value and unit.
    printf("Enter a temperature followed by F, C, or K. e.g., 24.5F :");
    scanf("%lf%10s", &inputTemp, line);

    // Use the first character as the unit.
    type = line[0];

    // Convert based on the unit and print results.
    if (type == 'F' || type == 'f') {
        double c = (inputTemp - 32.0) * 5.0 / 9.0;
        double k = c + kOffset;
        printf("%8.3fK = %8.3fC = %8.3fF\n", k, c, inputTemp);
    } else if (type == 'C' || type == 'c') {
        double k = inputTemp + kOffset;
        double f = inputTemp * 9.0 / 5.0 + 32.0;
        printf("%8.3fK = %8.3fC = %8.3fF\n", k, inputTemp, f);
    } else if (type == 'K' || type == 'k') {
        double c = inputTemp - kOffset;
        double f = c * 9.0 / 5.0 + 32.0;
        printf("%8.3fK = %8.3fC = %8.3fF\n", inputTemp, c, f);
    } else {
        // Handle an unknown unit.
        printf("Unknown temperature type '%c'\n", type);
    }

    return EXIT_SUCCESS;
}