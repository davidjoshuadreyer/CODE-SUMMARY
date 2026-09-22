#include "Geometry.hpp"
#include <cmath>
using namespace std;

namespace tutorial06 {
Point polarPoint(double radius, double angleRadians)
{
    Point point;
    point.x = radius * cos(angleRadians);
    point.y = radius * sin(angleRadians);
    return point; // Returning a struct by value is safe.
}
}
