/*
 * LESSON 16: Time samples, radians, and damping classification.
 * Prerequisite: 1, 4, 6. Run: main.exe tutorial 16
 * Expect: undamped positions 1, 0, -1, 0, 1 (near-zero rounding is normal).
 * Try: double k. The oscillation becomes faster because omega = sqrt(k/m).
 * Connects to Lab 8. Run matlab/learnMotion.m in MATLAB for vectors and plots.
 */
#include "Tutorials.hpp"
#include <cmath>
#include <iostream>
using namespace std;

int tutorials::harmonicMotion()
{
    const double PI = 3.141592653589793;
    double mass = 1.0;
    double spring = 4.0;
    double omega = sqrt(spring / mass);
    // For x(0)=1 and v(0)=0, undamped displacement is cos(omega*t).
    for (int i = 0; i <= 4; i++)
    {
        double time = i * PI / 4.0;
        double position = cos(omega * time);
        cout << "t=" << time << ", x=" << position << endl;
    }
    double dampingValues[4] = {0.0, 1.0, 4.0, 6.0};
    for (int i = 0; i < 4; i++)
    {
        double damping = dampingValues[i];
        double discriminant = damping * damping - 4.0 * mass * spring;
        cout << "b=" << damping << ": ";
        if (damping == 0.0) cout << "undamped";
        else if (abs(discriminant) < 0.000001) cout << "critical";
        else if (discriminant < 0.0) cout << "underdamped";
        else cout << "overdamped";
        cout << endl;
    }
    return 0;
}
