/*
 * C11 MIDTERM SUMMARY (OPEN-BOOK QUICK REFERENCE)
 * Source basis: your labs (1-4), in-class examples, and unit outlines.
 *
 * How to use this file during the exam:
 * 1) Search by section title.
 * 2) Copy the nearest template/snippet.
 * 3) Rename variables/functions for your question.
 *
 * Compile reminders:
 *   gcc file.c -std=c11 -Wall -Wextra -pedantic
 *   gcc file.c -std=c11 -Wall -Wextra -pedantic -lm    // if using math.h funcs
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>

#define LEN(arr) (sizeof(arr) / sizeof((arr)[0]))

/* ------------------------------ SECTION 1 ------------------------------
 * BASIC PROGRAM STRUCTURE
 * ---------------------------------------------------------------------- */

/*
#include <stdio.h>

int main(void)
{
    // declarations
    // statements
    return 0;
}
*/

/* Notes:
 * - #include brings function prototypes into scope.
 * - main(void) means "no parameters."
 * - return 0 means success (same idea as EXIT_SUCCESS).
 */

/* ------------------------------ SECTION 2 ------------------------------
 * FUNDAMENTALS: TYPES, CONSTANTS, OPERATORS, PRINTF/SCANF
 * ---------------------------------------------------------------------- */

/* Common types:
 * int, long, long long, char, float, double, long double, bool
 */

/* Constants:
 * #define PI 3.14159      // preprocessor constant
 * const double g = 9.81;  // typed constant
 */

/* Base display (from bases.c):
 * printf("%d %o %x\n", x, x, x);   // dec, octal, hex
 * printf("%#o %#x\n", x, x);       // include 0 / 0x prefix
 */

/* Character code:
 * char ch = 'A';
 * printf("%c -> %d\n", ch, ch);    // letter and ASCII code
 */

/* Useful format specifiers:
 * int:          %d
 * unsigned:     %u
 * long:         %ld
 * long long:    %lld
 * char:         %c
 * string:       %s
 * float/double: %f
 * sci notation: %e or %E
 * hex float:    %a
 * pointer:      %p
 * size_t:       %zu
 */

/* Width/precision examples:
 * printf("%8.2f", x);   // width=8, 2 decimals
 * printf("%010.2f", x); // zero-padded
 * printf("%+8.2f", x);  // force sign
 */

/* scanf rules:
 * - use & for scalar variables: int, double, char
 * - do NOT use & for char arrays (strings)
 */
/*
int age;
double money;
char pet[30];
scanf("%d %lf", &age, &money);
scanf("%29s", pet); // safe width for string input
*/

/* strlen vs sizeof:
 * strlen(str)  -> character count up to '\0'
 * sizeof(str)  -> bytes in object (for arrays, includes capacity)
 */

/* Increment/decrement:
 * a++ uses old value, then increments
 * ++a increments first, then uses new value
 */

/* ------------------------------ SECTION 3 ------------------------------
 * FLOW CONTROL
 * ---------------------------------------------------------------------- */

/* if / else if / else */
/*
if (x < 0) {
    printf("negative\n");
} else if (x == 0) {
    printf("zero\n");
} else {
    printf("positive\n");
}
*/

/* switch */
/*
switch (choice) {
    case 1:
        puts("Option 1");
        break;
    case 2:
        puts("Option 2");
        break;
    default:
        puts("Invalid");
        break;
}
*/

/* switch with multiple labels (vowel counter pattern) */
/*
switch (ch) {
    case 'a':
    case 'A': a_ct++; break;
    case 'e':
    case 'E': e_ct++; break;
    default: break;
}
*/

/* Piecewise if/else (tax bracket style) */
/*
double tax = 0.0;
if (income <= b1) {
    tax = income * r1;
} else if (income <= b2) {
    tax = b1 * r1 + (income - b1) * r2;
} else {
    tax = b1 * r1 + (b2 - b1) * r2 + (income - b2) * r3;
}
*/

/* while loop */
/*
int i = 1, sum = 0;
while (i <= 10) {
    sum += i;
    i++;
}
*/

/* for loop (including nested loop pattern) */
/*
for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
        putchar(symbol);
    }
    putchar('\n');
}
*/

/* Conditional (ternary) operator */
/*
int min = (a < b) ? a : b;
*/

/* bool (C11 via stdbool.h) */
/*
bool ok = true;
if (!ok) { ... }
*/

/* ------------------------------ SECTION 4 ------------------------------
 * FUNCTIONS, PROTOTYPES, HEADERS, PASS-BY-VALUE
 * ---------------------------------------------------------------------- */

/* Prototype */
int imin(int a, int b);

/* Definition */
int imin(int a, int b)
{
    return (a < b) ? a : b;
}

/* IMPORTANT: C passes arguments by value.
 * Changing parameters inside a function does not change caller vars.
 */

/* static quick note:
 * - static local variable keeps value between calls.
 * - static file-scope function/variable has internal linkage.
 */

/* Swap that DOES NOT affect caller (pass-by-value) */
void swap_value_only(int a, int b)
{
    int temp = a;
    a = b;
    b = temp;
    (void)temp; /* silence unused warning in reference file */
}

/* Swap that DOES affect caller (pass pointers) */
void swap_with_pointers(int *a, int *b)
{
    int temp = *a;
    *a = *b;
    *b = temp;
}

/* Header/source split pattern (like hotel.h + hotel.c):
 * file.h
 *   #ifndef FILE_H
 *   #define FILE_H
 *   // constants + prototypes
 *   #endif
 *
 * file.c
 *   #include "file.h"
 *   // function definitions
 */

/* ------------------------------ SECTION 5 ------------------------------
 * ARRAYS
 * ---------------------------------------------------------------------- */

/* 1D array declaration/initialization */
/*
int days[12] = {31,28,31,30,31,30,31,31,30,31,30,31};
int partial[4] = {1492, 1066};  // remaining elements become 0
int designated[12] = {31,28,[4]=31,30,31,[1]=29};
*/

/* Array bounds:
 * valid indexes are 0 .. size-1
 * out-of-bounds access is undefined behavior
 * uninitialized local arrays contain garbage values
 */

/* 2D arrays */
/*
int m[4][2] = {{2,4},{6,8},{1,3},{5,7}};
printf("%d\n", m[2][1]); // 7
*/

/* Arrays in function parameters decay to pointers.
 * sizeof(array) in main gives total bytes;
 * sizeof(param_array) inside function gives pointer size.
 */
int sum_array(const int arr[], int n)
{
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += arr[i];
    }
    return total;
}

/* Pointer-range style array sum */
int sum_ptr_range(const int *start, const int *end)
{
    int total = 0;
    while (start < end) {
        total += *start;
        start++;
    }
    return total;
}

/* ------------------------------ SECTION 6 ------------------------------
 * POINTERS + STRINGS
 * ---------------------------------------------------------------------- */

/* Pointer basics:
 * int x = 5;
 * int *p = &x;   // address-of
 * *p = 10;       // dereference/write through pointer
 */

/* Pointer arithmetic moves by element size, not by 1 byte.
 * Example from short* vs double*: p+1 advances sizeof(type).
 */

/* Arrays and pointers relation:
 * arr acts like pointer to first element in many expressions.
 * arr[i] is equivalent to *(arr + i)
 */

/* String/char pointer caution:
 * char s[] = "abc";   // mutable array storage
 * char *p = "abc";    // points to string literal (do not modify)
 */

/* strlen() counts characters before '\0' (not including '\0'). */

/* const with pointers quick guide:
 * const int *p;   // data is read-only through p
 * int *const p2;  // pointer itself cannot change after init
 * const int *const p3; // both fixed
 */

/* ------------------------------ SECTION 7 ------------------------------
 * FILE I/O
 * ---------------------------------------------------------------------- */

/* Text modes:
 * "r"  read
 * "w"  write (truncate/create)
 * "a"  append (create if missing)
 * "a+" read + append
 *
 * Binary modes:
 * "rb", "wb", "ab", etc.
 */

/* Standard streams:
 * stdin  -> keyboard/input stream
 * stdout -> normal output stream
 * stderr -> error output stream
 */

/* Basic pattern */
/*
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("fopen");
    return EXIT_FAILURE;
}
// use fp...
if (fclose(fp) != 0) {
    perror("fclose");
}
*/

/* Character I/O loop */
/*
int ch;
while ((ch = getc(fp)) != EOF) {
    putc(ch, stdout);
}
*/

/* fscanf/fprintf + rewind */
/*
char word[41];
while (fscanf(stdin, "%40s", word) == 1 && word[0] != '#') {
    fprintf(fp, "%s\n", word);
}
rewind(fp);
*/

/* Binary I/O (fread/fwrite) */
/*
double a[5] = {1,2,3,4,5};
fwrite(a, sizeof(a[0]), LEN(a), outFile);

double b[5];
size_t got = fread(b, sizeof(b[0]), LEN(b), inFile);
if (got != LEN(b)) {
    if (feof(inFile)) puts("Unexpected EOF");
    else if (ferror(inFile)) perror("fread");
}
*/

/* ------------------------------ SECTION 8 ------------------------------
 * COMMAND-LINE ARGS + DYNAMIC MEMORY
 * ---------------------------------------------------------------------- */

/* argc/argv pattern */
/*
int main(int argc, char *argv[])
{
    if (argc != 2) {
        printf("Usage: %s filename\n", argv[0]);
        return EXIT_FAILURE;
    }
}
*/

/* malloc pattern */
/*
int n = 100;
double *nums = malloc((size_t)n * sizeof(*nums));
if (nums == NULL) {
    fprintf(stderr, "malloc failed\n");
    return EXIT_FAILURE;
}
// use nums...
free(nums);
*/

/* ------------------------------ SECTION 9 ------------------------------
 * MATH.H FUNCTIONS SEEN IN LABS
 * ---------------------------------------------------------------------- */

/* round(x)   -> nearest integer as double
 * llround(x) -> nearest long long
 * pow(a,b)   -> a^b
 * sqrt(x)    -> square root
 * fabs(x)    -> absolute value for double
 */

/* Reminder: compile with -lm when using math functions. */

/* ------------------------------ SECTION 10 -----------------------------
 * LAB PATTERNS (COPY/PASTE READY)
 * ---------------------------------------------------------------------- */

/* LAB 1 / LAB 4: Making change robustly with integer cents */
double round_to_nearest_nickel(double amount)
{
    long long cents = llround(amount * 100.0);
    long long rounded = ((cents + 2) / 5) * 5; /* nearest 5 cents */
    return rounded / 100.0;
}

double change_item(double change, double item_value, const char *one, const char *many)
{
    long long change_cents = llround(change * 100.0);
    long long item_cents = llround(item_value * 100.0);
    long long count = 0;
    long long left = change_cents;

    if (item_cents > 0) {
        count = change_cents / item_cents;
        left = change_cents - count * item_cents;
    }

    if (count > 0) {
        printf("%lld %s\n", count, (count == 1) ? one : many);
    }

    return left / 100.0;
}

/* LAB 2: Temperature conversion skeleton */
void print_temp_conversions(double input, char unit)
{
    const double K_OFFSET = 273.15;

    if (unit == 'F' || unit == 'f') {
        double c = (input - 32.0) * 5.0 / 9.0;
        double k = c + K_OFFSET;
        printf("%8.3fK = %8.3fC = %8.3fF\n", k, c, input);
    } else if (unit == 'C' || unit == 'c') {
        double k = input + K_OFFSET;
        double f = input * 9.0 / 5.0 + 32.0;
        printf("%8.3fK = %8.3fC = %8.3fF\n", k, input, f);
    } else if (unit == 'K' || unit == 'k') {
        double c = input - K_OFFSET;
        double f = c * 9.0 / 5.0 + 32.0;
        printf("%8.3fK = %8.3fC = %8.3fF\n", input, c, f);
    } else {
        printf("Unknown temperature type '%c'\n", unit);
    }
}

/* LAB 3: Air density helper + Euler update pattern */
double density(double altitude_m)
{
    const double G = 9.80665;
    const double P0 = 101.325e3;
    const double T0 = 288.15;
    const double L = 0.0065;
    const double R = 8.31447;
    const double M = 0.0289644;

    double T = T0 - L * altitude_m;
    double P = P0 * pow((1.0 - (L * altitude_m) / T0), (G * M) / (R * L));
    return P * M / (R * T);
}

/* Euler step reminder (upward positive):
 * drag_force = 0.5 * rho * Cd * A * v * v
 * drag_accel = drag_force / mass
 * accel = -g + drag_accel
 * v = v + accel * dt
 * h = h + v * dt
 */

/* ------------------------------ SECTION 11 -----------------------------
 * COMMON EXAM PITFALLS (FROM YOUR COURSE WORK)
 * ---------------------------------------------------------------------- */

/* 1) scanf format mismatch causes wrong input behavior.
 * 2) Forgetting & in scanf for scalars.
 * 3) Modifying string literal through char *.
 * 4) Assuming arrays know their own size inside called function.
 * 5) Floating money math without cent rounding.
 * 6) Forgetting break in switch (unless fall-through is intentional).
 * 7) Not checking fopen/malloc for NULL.
 * 8) Using math functions without linking math library.
 */

/* ------------------------------ SECTION 12 -----------------------------
 * MINI DEMO MAIN (safe to edit/delete during exam)
 * ---------------------------------------------------------------------- */

int main(void)
{
    int a = 3, b = 5;
    int m = imin(a, b);
    printf("imin(%d, %d) = %d\n", a, b, m);

    int x = 10, y = 20;
    swap_with_pointers(&x, &y);
    printf("swapped: x=%d y=%d\n", x, y);

    int marbles[] = {20, 10, 5, 39, 4};
    printf("sum_array = %d\n", sum_array(marbles, (int)LEN(marbles)));
    printf("sum_ptr_range = %d\n", sum_ptr_range(marbles, marbles + LEN(marbles)));

    printf("Rounded $12.37 to nearest nickel: $%.2f\n", round_to_nearest_nickel(12.37));
    print_temp_conversions(24.5, 'F');

    return 0;
}
