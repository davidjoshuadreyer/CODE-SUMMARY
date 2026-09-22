# Practice from the covered lecture slides

Each .cpp is a standalone C++17 program with its own main function. Compile one at a time, for example:

```sh
g++ -std=c++17 strings.cpp -o strings
./strings
```

The file example writes scores.txt in its working directory.

## C++ basics: input, numbers, and expressions

Source: 0-1_Introduction_to_C++.pdf (pages 7–28).

- area.cpp: Read a radius and calculate area
- numbers.cpp: Integer division and increment

## Functions: values, references, and scope

Source: 1-1_Functions.pdf (pages 4–18).

- references.cpp: Compare copying with changing the original
- overloads.cpp: Defaults, overloads, and a remembered counter

## Pointers, arrays, and dynamic memory

Source: 1-2_Pointers_and_Dynamic_Memory_Management.pdf (pages 3–28).

- pointer-alias.cpp: Change a value and redirect a pointer
- dynamic-array.cpp: Allocate, sort, find, and free an array

## Objects, classes, and string methods

Source: 1-3_Objects_and_Classes.pdf (pages 4–40).

- strings.cpp: Explore a string with dot methods
- objects.cpp: Construct, copy, and inspect simple objects

## Files, stream states, and exceptions

Source: 1-4_Files_and_Exception_Handling.pdf (pages 3–16).

- file-total.cpp: Write, append, and total a text file
- exceptions.cpp: Handle division by zero and keep going
