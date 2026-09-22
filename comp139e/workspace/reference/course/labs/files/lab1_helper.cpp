#include <iostream>
#include <cmath>
#include <cstdlib>
 
using namespace std;

// Function prototypes for forward-referenced functions
void getUserInput (double &radius, double &pegDist, double &spacing);
void outputResults (const double angles[], const double distances[], const int numLights);

/*
 * Prints the result to standard output - command-line interface
 *
 * @param angles Array of angles, referenced to the baseline chord (radians)
 * @param distances Array of distances to the streetlights
 * @param numLights Number of streetlights
 *
 */
void outputResults (const double angles[], const double distances[], const int numLights) {
    cout << numLights << " streetlights are required." << endl;
    
    for (int i=0; i < numLights; i++) {
        cout << "Light " << (i+1) << ": Distance=" << distances[i];
        if (distances[i] > 1.0e-6) {
	    double angle = (abs(angles[i]) < 1.0e-6) ? 0.0 : angles[i];
            cout << " Angle=" << angle * 180.0/M_PI << " degrees";
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
    if (pegDist > 2.0 * radius) {
        cerr << "The distance between pegs cannot be more than twice the radius!";
        exit (EXIT_FAILURE);
    }
    cout << "Enter the maximum streetlight spacing along the arc: ";
    cin >> spacing;
}