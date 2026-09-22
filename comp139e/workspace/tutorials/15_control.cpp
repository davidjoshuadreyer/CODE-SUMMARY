/*
 * LESSON 15: Feedback error, proportional action, and saved controller state.
 * Prerequisite: 7-8. Run: main.exe tutorial 15
 * Expect: first error = 10, integral = 10, derivative = 0, command = 6.
 * Try: set integral gain to zero. Compare the final output after 5 steps.
 * Connects to Lab 5. This is a small teaching model, NOT the supplied plant
 * or the lab's particular PID equation. Compare that handout before coding it.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

int tutorials::control()
{
    const double TARGET = 10.0;
    const double DT = 1.0;
    const double KP = 0.5;
    const double KI = 0.1;
    const double KD = 0.05;
    double output = 0.0;
    double integral = 0.0;      // Accumulates error over time.
    double previousError = 0.0;

    for (int step = 0; step < 5; step++)
    {
        double error = TARGET - output;
        integral += error * DT;
        double derivative = 0.0;
        if (step > 0) derivative = (error - previousError) / DT;
        double command = KP * error + KI * integral + KD * derivative;
        // A simple model: output moves a quarter of the way toward command.
        output += 0.25 * (command - output);
        cout << "Step " << step << ": error=" << error << " integral=" << integral
             << " derivative=" << derivative << " command=" << command
             << " output=" << output << endl;
        previousError = error; // Save state for the NEXT call or iteration.
    }
    return 0;
}
