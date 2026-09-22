// Launch each reference in its own process: their class names can overlap.
#include "Examples.hpp"
#include <cerrno>
#include <cstring>
#include <filesystem>
#include <iostream>
#include <string>
#ifdef _WIN32
#include <process.h>
#else
#include <sys/wait.h>
#include <unistd.h>
#endif
using namespace std;

namespace {
struct Example {
    const char* function;
    const char* filename;
    const char* source;
    const char* executable;
};
// CMake generates this from the actual example functions and dependencies.
#include "ExampleCatalog.inc"
}

void examples::printList()
{
    cout << "Reference examples: main example NAME\n"
         << "Use a filename (with or without .cpp) or one of these function names.\n";
    for (const Example& example : catalog)
    {
        cout << "  " << example.function << "  --  " << example.source << endl;
    }
    cout << "TestStack and TestQueue contain multiple demos: select a function name.\n"
         << "File examples use build/reference-work/src/Files_and_Exception_Handling/Files.\n";
}

int examples::run(const string& selection)
{
    string name = filesystem::path(selection).filename().string();
    if (filesystem::path(name).extension() == ".cpp")
        name = filesystem::path(name).stem().string();

    const Example* chosen = nullptr;
    int matches = 0;
    // Prefer an exact function name, even if another example shares a filename.
    for (const Example& example : catalog)
    {
        if (selection == example.function)
        {
            chosen = &example;
            matches = 1;
            break;
        }
    }
    if (!chosen)
    {
        for (const Example& example : catalog)
        {
            if (name == example.filename)
            {
                chosen = &example;
                matches++;
            }
        }
    }
    if (matches != 1)
    {
        if (matches == 0) cerr << "Unknown example: " << selection << endl;
        else
        {
            cerr << "This file contains several examples. Choose a function:\n";
            for (const Example& example : catalog)
                if (name == example.filename) cerr << "  " << example.function << endl;
        }
        cerr << "Run main example --list to see the available examples.\n";
        return 1;
    }

    filesystem::path executable(chosen->executable);
    if (!filesystem::exists(executable))
    {
        cerr << "Example executable is missing. Build the project with Ctrl+Shift+B.\n";
        return 1;
    }
    cout << "Running " << chosen->source << " (" << chosen->function << ")" << endl;
#ifdef _WIN32
    // No shell command is constructed. Paths containing spaces work directly.
    wstring path = executable.wstring();
    const wchar_t* arguments[] = {path.c_str(), nullptr};
    intptr_t result = _wspawnv(_P_WAIT, path.c_str(), arguments);
    if (result == -1)
    {
        cerr << "Cannot start example: " << strerror(errno) << endl;
        return 1;
    }
    return static_cast<int>(result);
#else
    pid_t child = fork();
    if (child == 0)
    {
        execl(executable.c_str(), executable.c_str(), static_cast<char*>(nullptr));
        _exit(127);
    }
    if (child < 0) return 1;
    int status = 0;
    while (waitpid(child, &status, 0) == -1)
        if (errno != EINTR) return 1;
    if (WIFEXITED(status)) return WEXITSTATUS(status);
    return 1;
#endif
}
