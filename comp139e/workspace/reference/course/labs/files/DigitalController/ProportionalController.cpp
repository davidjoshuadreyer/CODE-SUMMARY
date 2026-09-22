//
//  ProportionalController.cpp
//  DigitalController
//
//  Created by Dale Shpak on 2019-09-02.
//  Copyright © 2019 Dale Shpak. All rights reserved.
//

#include "ProportionalController.hpp"

// Implementation of controlStep()
double ProportionalController::controlStep (const double plantOutput, double setpoint) {
    return setpoint + kc * (setpoint - plantOutput);
}
