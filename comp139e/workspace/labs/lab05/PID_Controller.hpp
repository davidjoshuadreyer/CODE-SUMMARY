#pragma once
#include "Controller.hpp"
class PID_Controller : public Controller {
public:
    PID_Controller(double propGain, double integralTime, double derivativeTime);
    double controlStep(double plantOutput, double setpoint) override;
private:
    double kc, ti, td;
    double q = 0.0;
    double previousOutput = 0.0;
};
