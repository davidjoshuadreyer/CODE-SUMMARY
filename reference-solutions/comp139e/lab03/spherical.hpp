#pragma once
#include <cmath>
struct SphericalCoords { double radius, azimuth, inclination; };
inline double getRadius(double x,double y,double z=0.0) { return std::hypot(std::hypot(x,y),z); }
double* sphericalToRectangular(double r,double azimuth,double inclination=1.57079632679489661923);
SphericalCoords rectangularToSpherical(double x,double y,double z=0.0);
