/*
 * LESSON 8: Inheritance, abstract base classes, virtual calls, and base pointers.
 * Prerequisite: 5 and 7. Run: main.exe tutorial 8
 * Expect: Beep followed by Ding, using the same base-pointer call.
 * Try: add a third class that overrides play().
 * Connects to Controllers in Lab 5 and Shapes in Labs 6-7.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

namespace tutorial08 {
class Sound {
public:
    virtual void play() const = 0; // Pure virtual: Sound itself is abstract.
    virtual ~Sound() = default;   // Safe destruction through a Sound*.
};
class Buzzer : public Sound {
public:
    void play() const override { cout << "Beep" << endl; }
};
class Bell : public Sound {
public:
    void play() const override { cout << "Ding" << endl; }
};
}

int tutorials::inheritance()
{
    tutorial08::Buzzer buzzer;
    tutorial08::Bell bell;
    tutorial08::Sound* sounds[2] = {&buzzer, &bell};
    for (int i = 0; i < 2; i++)
    {
        sounds[i]->play(); // -> calls a member through a pointer.
    }
    // These pointers borrow local objects. No new was used, so do not delete them.
    return 0;
}
