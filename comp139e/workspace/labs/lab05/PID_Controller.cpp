#include "PID_Controller.hpp"
#include <stdexcept>

using namespace std;

PID_Controller::PID_Controller(double propGain, double integralTime, double derivativeTime)
    : kc(propGain), ti(integralTime), td(derivativeTime) {}
double PID_Controller::controlStep(double plantOutput, double setpoint) {
    // TODO: Implement the handout's PID equation and update the saved state.
    throw logic_error("TODO: PID_Controller::controlStep");
}
