# Lab 5 Report: Searching Data Read from a File of Binary Numbers

## Student Information
- Student ID: `C0561419`
- Lab: `Lab 5`
- Date: `2026-03-08`

## Objective
Implement a C program that:
- Reads binary integers from a file using one `fread()` call.
- Stores values in an array.
- Repeatedly searches for user-entered values using a linear search function.
- Handles required error cases exactly as specified.

## Files Submitted
- `searchMain.c`
- `arraySearch.c`
- `arraySearch.h`

## Program Design
- `main()` in `searchMain.c` handles:
  - command-line parsing,
  - file opening/reading/closing,
  - dynamic memory allocation,
  - user prompt loop,
  - all console output.
- `linearSearch()` is implemented in `arraySearch.c` and returns:
  - index of first match, or
  - `-1` if not found.
- `arraySearch.h` declares the function and uses include guards.

## Requirement Checklist
1. Correct argument count (`argc == 3`) checked.
2. Input filename read from command line and opened with `"rb"`.
3. File-open failure handled with an error message.
4. Count argument converted with `sscanf()` and validated.
5. Array allocated with `malloc()` using parsed size.
6. All values read using a single `fread()` call.
7. Read count verified; unexpected EOF/read error handled.
8. Program repeatedly prompts for search values.
9. Uses `linearSearch()` and prints found index or not-found message.
10. Input file is closed after reading data.
11. Three required files are used; `linearSearch()` is in `arraySearch.c`.
12. Header file uses `#ifndef` include guard.

## Build Command
```bash
gcc -std=c11 -Wall -Wextra -pedantic searchMain.c arraySearch.c -o search.exe
```

## Functional Test (Sample Run)
Command:
```bash
search.exe binaryNumbers.dat 1000
```

Input:
```text
675
312
q
```

Observed output:
```text
Enter the integer value to find ('q' to quit): 675 was found at position 21
Enter the integer value to find ('q' to quit): 312 was not found
Enter the integer value to find ('q' to quit): Bye
```

## Error-Handling Tests
1. Missing arguments:
```text
Usage: search numberFileName nNumbers
```

2. Missing input file:
```text
search: Unable to open "cabbageNumbers.dat"
```

3. Non-integer count:
```text
search: Unable to convert "potato" into an integer value.
```

4. Wrong file type/insufficient binary data:
```text
search: Unable to read 1000 numbers from file "arraySearch.h": unexpected end of file
```

## Complexity
- Time complexity of `linearSearch`: `O(n)`
- Space complexity (search function only): `O(1)`

## Conclusion
The Lab 5 program meets all required functionality:
- correct binary-file reading,
- correct linear search behavior,
- required loop structure in `main()`,
- required file structure and include guards,
- required error handling and user interaction.
