#include "lab.hpp"
#include <cstddef>

using namespace std;

// CMake renames the instructor driver's main when compiling it for our runner.
// testTrigMain.cpp itself is kept unchanged and can be compiled standalone.
int lab03InstructorMain(int argc, char* argv[]);
int lab03::run(int argc, char* argv[]) {
    return lab03InstructorMain(argc, argv);
}
