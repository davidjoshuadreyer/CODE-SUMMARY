#include "lab.hpp"
#include "survey.hpp"
#include <iostream>

using namespace std;

int lab01::run() {
    double radius = 0.0;
    double pegDist = 0.0;
    double spacing = 0.0;
    getUserInput(radius, pegDist, spacing);

    // Check the input before doing any calculations.
    if (!cin) 
    {
        cerr << "Enter numbers only." << endl;
        return 1;
    }
    if (radius <= 0.0 || pegDist <= 0.0 || spacing <= 0.0) 
    {
        cerr << "All values must be greater than zero." << endl;
        return 1;
    }
    if (pegDist / radius > 2.0) 
    {
        cerr << "The distance between pegs cannot be more than twice the radius!" << endl;
        return 1;
    }

    int numLights = getNumberOfLights(radius, pegDist, spacing);
    if (numLights < 2) 
    {
        cerr << "At least two endpoint lights are required." << endl;
        return 1;
    }

    // Make one array entry for each streetlight.
    double* angles = new double[numLights];
    double* distances = new double[numLights];
    calculateLightPositions(radius, pegDist, numLights, angles, distances);
    outputResults(angles, distances, numLights);

    // Release the memory that was allocated
    delete[] angles;
    delete[] distances;
    return 0;
}
