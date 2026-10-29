// Lab 5: PID controller implementation.
#include "PID_Controller.hpp"

PID_Controller::PID_Controller(double gain, double integralTime, double derivativeTime)
    : kc(gain), tI(integralTime), tD(derivativeTime), q(0.0), previousOutput(0.0) {
    // The supplied plant starts at rest, so its previous output is zero.
}

double PID_Controller::controlStep(double plantOutput, double setpoint) {
    // 1. Find the difference between the target and the current output.
    double error = setpoint - plantOutput;

    // 2. Update the leaky integral exactly as specified in the lab.
    q = 0.9 * q + 0.1 * error;

    // 3. Calculate the next plant input. deltaT is inherited from Controller.
    // The derivative uses the CHANGE IN PLANT OUTPUT, with a minus sign.
    double plantInput = setpoint + kc * (error + (deltaT / tI) * q
        - (tD / deltaT) * (plantOutput - previousOutput));

    // 4. Save this output for the NEXT call, after using the old value above.
    previousOutput = plantOutput;
    return plantInput;
}
