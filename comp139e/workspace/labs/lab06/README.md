# Lab 06: Linked stacks and shapes

Implement `push`, `pop`, and `top` in `Stack.hpp`; these are templates and must stay in the header. Replace the temporary TODO exceptions with real operations, using StackException for empty-stack errors. Implement the Square display functions in `Square.cpp`; its constructor already forwards equal dimensions to Rectangle. Write the driver in `lab.cpp` using `Stack<Shape*>`, exercise every operation, and demonstrate a caught exception. Shared shapes are in `../common/shapes/`. The original `shapeMain.cpp` is in the course reference files. Drain allocated nodes and manage shape lifetimes; the starter stack, like the supplied one, does not clean up remaining nodes or define copying.

[Original handout](../../reference/course/labs/139E%20-%20Lab%206.html)

[Project workflow](../../README.md)
