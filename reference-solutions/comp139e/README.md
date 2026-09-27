# COMP 139E worked reference copies

The original workspace starters are unchanged. These are study references for Labs 3–9.

C++ commands (run from this folder):

    c++ -std=c++17 lab03/testTrigMain.cpp lab03/spherical.cpp -o lab3
    c++ -std=c++17 lab04/*.cpp -o lab4
    c++ -std=c++17 lab05/*.cpp -o lab5
    c++ -std=c++17 lab06/*.cpp common/shapes/*.cpp -o lab6
    c++ -std=c++17 lab07/*.cpp common/shapes/*.cpp -o lab7

Run lab4 with input and output filenames. Its output file uses append mode. Use the provided lab.cpp together with main.cpp; those implement the workspace run function and standalone entry point respectively.

Labs 3–7 were compiled and exercised. Lab 3 passed the seven provided tests. Labs 8–9 were reviewed mathematically but not executed in MATLAB. Open their folders in MATLAB, inspect the code, then run harmonicScript or integrationError. The original integrationError script can allocate large arrays at N=10^7; start with smaller N when checking.

The shared class and test files retain their original instructor attribution. The handwritten reference implementations are study aids, not official instructor answer keys.
