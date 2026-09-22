#pragma once
namespace lab01 {
void getUserInput(double& radius, double& pegDist, double& spacing);
void outputResults(const double angles[], const double distances[], int numLights);

int getNumberOfLights(double radius, double pegDist, double spacing);
void calculateLightPositions(double radius, double pegDist, int numLights,
                             double angles[], double distances[]);
}
