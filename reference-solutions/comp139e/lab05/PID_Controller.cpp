#include "PID_Controller.hpp"
#include <stdexcept>
#include <cmath>
PID_Controller::PID_Controller(double propGain,double integralTime,double derivativeTime)
:kc(propGain),ti(integralTime),td(derivativeTime) {
    if(!std::isfinite(kc)||!std::isfinite(ti)||!std::isfinite(td)||ti<=0||td<0)
        throw std::invalid_argument("Finite gains, ti>0 and td>=0 required");
}
double PID_Controller::controlStep(double plantOutput,double setpoint) {
    const double error=setpoint-plantOutput;
    q=0.9*q+0.1*error; // Handout specifies a leaky integral, not an accumulated sum.
    const double result=setpoint+kc*(error+deltaT/ti*q-td/deltaT*(plantOutput-previousOutput));
    previousOutput=plantOutput;return result;
}
