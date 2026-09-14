/*
 * C11 template
 * Build: cc -std=c11 -Wall -Wextra -Wpedantic -O2 -o app main.c
 */

#include <stdio.h>
#include <stdlib.h>

static int run(int argc, char **argv);

int main(int argc, char **argv)
{
    int rc = run(argc, argv);
    if (rc != 0) {
        return rc;
    }
    return 0;
}

static int run(int argc, char **argv)
{
    (void)argc;
    (void)argv;

    double percent = 0.0;
    const char *grade = "F";

    printf("Enter grade percent: ");
    if (scanf("%lf", &percent) != 1) {
        fprintf(stderr, "Invalid input.\n");
        return 1;
    }

    if (percent < 0.0 || percent > 100.0) {
        fprintf(stderr, "Percent must be between 0 and 100.\n");
        return 1;
    }

    if (percent >= 90.0) {
        grade = "A+";
    } else if (percent >= 85.0) {
        grade = "A";
    } else if (percent >= 80.0) {
        grade = "A-";
    } else if (percent >= 77.0) {
        grade = "B+";
    } else if (percent >= 73.0) {
        grade = "B";
    } else if (percent >= 70.0) {
        grade = "B-";
    } else if (percent >= 65.0) {
        grade = "C+";
    } else if (percent >= 60.0) {
        grade = "C";
    } else if (percent >= 50.0) {
        grade = "D";
    } else {
        grade = "F";
    }

    printf("Letter grade: %s\n", grade);
    return 0;
}
