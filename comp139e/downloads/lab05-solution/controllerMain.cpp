// Lab 5 runner, adapted from Dale Shpak's supplied controllerMain.cpp.
#include <iostream>
#include "Plant.hpp"
#include "PID_Controller.hpp"
using namespace std;

const int N_STEPS = 50;

int main() {
    // Use the exact plant coefficients supplied with the lab.
    const double num[] = {0.023018459508916, 0.046036919017832, 0.023018459508916};
    const double den[] = {1.000000000000000, -1.618519638615533, 0.710593476651197};
    Plant plant(num, den, 2);

    // Lab settings: gain = 0.5, integral time = 25, derivative time = 2.5.
    PID_Controller pidController(0.5, 25, 2.5);
    Controller* controller = &pidController; // Polymorphism through the base class.

    double y = plant.plantResponse(0.0); // Start the plant at rest.
    const double setpoint = 1.0;

    cout << "Y = [" << endl; // Output can be pasted directly into MATLAB.
    for (int tStep = 0; tStep < N_STEPS; ++tStep) {
        double plantInput = controller->controlStep(y, setpoint);
        y = plant.plantResponse(plantInput);
        cout << plantInput << "  " << y << endl;
    }
    cout << "];" << endl;
    return 0;
}
