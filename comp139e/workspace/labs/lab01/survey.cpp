#include "survey.hpp"
#include <iostream>
#include <cmath>
 
using namespace std;

namespace lab01 {
const double PI = 3.14159265358979323846;

void outputResults (const double angles[], const double distances[], const int numLights) {
    cout << numLights << " streetlights are required." << endl;
    
    for (int i = 0; i < numLights; i++) {
        cout << "Light " << (i + 1) << ": Distance=" << distances[i];
        // Follow the supplied helper: omit direction at (or very near) peg1.
        if (distances[i] > 1.0e-6) {
            double angle = angles[i];
            // Treat tiny rounding errors as zero.
            if (abs(angle) < 1.0e-6) {
                angle = 0.0;
            }
            double angleDegrees = angle * 180.0 / PI;
            cout << " Angle=" << angleDegrees << " degrees";
        }
        cout << endl;
    }
}

/**
 * Gets input values from the user via a command-line prompt:
 * radius of curvature, distance between pegs, and maximum streetlight spacing
 *
 * @param radius Reference to the radius of curvature
 * @param pegDist Reference to the distance between arc endpoints
 * @param spacing Reference to maximum streetlight spacing
 * 
 */
void getUserInput (double &radius, double &pegDist, double &spacing) {
    cout << "Enter the radius of curvature: ";
    cin >> radius;
    cout << "Enter the distance between the survey pegs at the endpoints: ";
    cin >> pegDist;
    cout << "Enter the maximum streetlight spacing along the arc: ";
    cin >> spacing;
}
// Find the fewest lights that satisfy the maximum arc spacing, including pegs.
int getNumberOfLights(double radius, double pegDist, double spacing) 
{
    // The arc angle is in radians. Arc length = radius * arc angle.
    double arcAngle = 2.0 * asin(pegDist / (2.0 * radius));
    double arcLength = radius * arcAngle;

    // Round up so the gaps are no larger than the maximum spacing.
    int numGaps = static_cast<int>(ceil(arcLength / spacing));
    return numGaps + 1; // There is a light at both ends of every gap.
}
// Store distances from peg1 and angles from the baseline chord (in radians).
// The caller provides arrays with numLights entries; normally numLights >= 2.
void calculateLightPositions(double radius, double pegDist, int numLights, double angles[], double distances[]) 
{
    if (numLights <= 0) 
    {
        return;
    }

    // The first light is at the peg where the transit is standing.
    angles[0] = 0.0;
    distances[0] = 0.0;
    if (numLights == 1) 
    {
        return;
    }

    double diameter = 2.0 * radius;
    double halfArcAngle = asin(pegDist / diameter);
    double angleStep = halfArcAngle / (numLights - 1);

    // Equal angle steps give equal spacing along the road's arc.
    for (int i = 1; i < numLights - 1; i++) 
    {
        double halfCentralAngle = i * angleStep;
        // Use the isosceles triangle between the centre, peg1, and light.
        angles[i] = halfArcAngle - halfCentralAngle;
        distances[i] = diameter * sin(halfCentralAngle);
    }

    // The last light is at the other peg, directly along the baseline.
    angles[numLights - 1] = 0.0;
    distances[numLights - 1] = pegDist;
}
} // namespace lab01
