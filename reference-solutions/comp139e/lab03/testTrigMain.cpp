/**
 * Test driver for the module spherical.cpp
 *
 * Dale Shpak
 * October 18, 2009
 * October 15, 2014 - Individual tests now continue after first failure.
 */

#include <cstdlib>
#include <iostream>
#include <cmath>
#include "spherical.hpp"

using namespace std;

const double TEST_EPS = 1.0e-12;

static void errorMessage (double expected, double result, int line);

bool testGetRadius1 (void) {
    bool success = true;
    cout << __FUNCTION__;

    double result = getRadius (1.0, 2.0, 3.0);

    double expected = sqrt(14.0);
    if (abs(result - expected) > TEST_EPS){
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    return success;
}

// Test default arguments
bool testGetRadius2 (void) {
    bool success = true;
    cout << __FUNCTION__;

    double result = getRadius (1.0, 1.5);

    double expected = sqrt(3.25);
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    return success;
}

bool testRectangularToSpherical1 (void) {
    bool success = true;
    cout << __FUNCTION__;

    SphericalCoords spherical = rectangularToSpherical(-2.0, -1.0, -2.0);

    double expected = 3.0;
    double result = spherical.radius;
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = -2.677945044588987;
    result = spherical.azimuth;
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = 2.300523983021863;
    result = spherical.inclination;
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    return success;
}

// Test default arguments
bool testRectangularToSpherical2 (void) {
    bool success = true;
    cout << __FUNCTION__;

    SphericalCoords spherical = rectangularToSpherical(1.0, -2.0);

    double expected = sqrt(5.0);
    double result = spherical.radius;
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = -1.10714871779409;
    result = spherical.azimuth;
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

     spherical = rectangularToSpherical(-1.0, -2.0);
     expected = 0.5 * M_PI;
     result = spherical.inclination;
     if (abs(result - expected) > TEST_EPS) {
         errorMessage (expected, result, __LINE__);
         success = false;
     }

     return success;
}

bool testSphericalToRectangular1(void) {
    bool success = true;
    cout << __FUNCTION__;

    double *cart = sphericalToRectangular (5.0, -5.0*M_PI/6.0, M_PI/8.0);

    double expected = -1.657067870177959;
    double result = cart[0];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = -0.9567085809127243;
    result = cart[1];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = 4.6193976625564335;
    result = cart[2];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    };

    // I should delete the array cart, but I won't in case you
    // did your code incorrectly!
    // I'll catch you later if you did...
    // delete[] cart;

    return success;
}

// Test default arguments
bool testSphericalToRectangular2(void) {
    bool success = true;
    cout << __FUNCTION__;

    double *cart = sphericalToRectangular (2.0, 0.1*M_PI);

    double expected = 1.902113032590307;
    double result = cart[0];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = 0.6180339887498948;
    result = cart[1];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = 0.0;  // Should be a 2-D vector
    result = cart[2];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    // I should delete the array cart, but I won't in case you
    // did your code incorrectly!
    // I'll catch you later if you did...
    delete[] cart;

    return success;
}

// Test if your function used local, static local, or global array
bool testSphericalToRectangular3(void) {
    bool success = true;
    cout << __FUNCTION__;

    double *cart = sphericalToRectangular (2.0, 0.1*M_PI);
    double *evilCart = sphericalToRectangular (1.0, 2.0, 3.0);

    double expected = 1.902113032590307;
    double result = cart[0];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = 0.6180339887498948;
    result = cart[1];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    expected = 0.0;  // Should be a 2-D vector
    result = cart[2];
    if (abs(result - expected) > TEST_EPS) {
        errorMessage (expected, result, __LINE__);
        success = false;
    }

    // I should delete the array cart, but I won't in case you
    // did your code incorrectly!
    delete[] cart;
    delete[] evilCart;

    return success;
}

/*********************************************************************
 *  END OF TESTS
 *********************************************************************/

static void errorMessage (double expected, double result, int line) {
    cerr << " Line " << line << ": Expected " << expected << " got " << result << endl;
}

// The following variables are known from this point onward and ONLY in this file
static bool testSuitePassed = true;
static int nTests = 0;
static const string results[] = {"Failed", "Passed" };

string compileResults (bool result) {
    if (result == false) {
        testSuitePassed = false;
    }
    ++nTests;

    cout << " ";

    return results[result];
}

int main(int argc, char *argv[]) {
    cerr.precision(16);
    cout << compileResults(testGetRadius1()) << endl;
    cout << compileResults(testGetRadius2()) << endl;
    cout << compileResults(testRectangularToSpherical1()) << endl;
    cout << compileResults(testRectangularToSpherical2()) << endl;
    cout << compileResults(testSphericalToRectangular1()) << endl;
    cout << compileResults(testSphericalToRectangular2()) << endl;
    cout << compileResults(testSphericalToRectangular3()) << endl;

    cout << endl << __FILE__ << ": Result for " << nTests << " tests = " << results[testSuitePassed] << endl;

    return EXIT_SUCCESS;
}
