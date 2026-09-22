#pragma once
#include <stdexcept>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
struct SphericalCoords {
    double radius;
    double azimuth;
    double inclination;
};
// Inline functions must be defined in the header for every caller to see them.
inline double getRadius(double x, double y, double z = 0.0) {
    // TODO: Compute radius; use this function in rectangularToSpherical.
    throw std::logic_error("TODO: getRadius in spherical.hpp");
}
// Return a fresh new double[3]; the caller owns it and must delete[] it.
double* sphericalToRectangular(double r, double azimuth, double inclination = M_PI / 2.0);
SphericalCoords rectangularToSpherical(double x, double y, double z = 0.0);
