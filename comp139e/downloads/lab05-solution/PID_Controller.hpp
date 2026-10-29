// Lab 5: PID controller declaration.
#ifndef PID_Controller_hpp
#define PID_Controller_hpp

#include "Controller.hpp"

// PID_Controller is a Controller, so a Controller* can refer to this object.
class PID_Controller : public Controller {
private:
    const double kc; // Proportional gain.
    const double tI; // Integration time constant (must be greater than zero).
    const double tD; // Derivative time constant.
    double q; // Leaky integral: remembered between calls.
    double previousOutput; // Plant output from the previous call.

public:
    PID_Controller(double gain, double integralTime, double derivativeTime);

    // Implements the function required by the abstract Controller class.
    double controlStep(double plantOutput, double setpoint) override;
};

#endif
