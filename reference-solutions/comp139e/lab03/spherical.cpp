#include "spherical.hpp"
#include <algorithm>
#include <stdexcept>
double* sphericalToRectangular(double r,double azimuth,double inclination) {
    if(r<0) throw std::invalid_argument("Radius must be nonnegative");
    return new double[3]{r*std::sin(inclination)*std::cos(azimuth),r*std::sin(inclination)*std::sin(azimuth),r*std::cos(inclination)};
}
SphericalCoords rectangularToSpherical(double x,double y,double z) {
    const double r=getRadius(x,y,z);
    // Direction is undefined at the origin; choose zero angles by convention.
    if(r==0) return {0,0,0};
    return {r,std::atan2(y,x),std::acos(std::max(-1.0,std::min(1.0,z/r)))};
}
