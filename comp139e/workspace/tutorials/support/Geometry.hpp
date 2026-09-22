#pragma once
#include <cmath>

namespace tutorial06 {
// A struct groups related values and gives each one a meaningful name.
struct Point {
    double x;
    double y;
};
Point polarPoint(double radius, double angleRadians);

// Default arguments belong in the declaration visible to the caller.
// inline permits this definition in a shared header. It does not force
// the compiler to replace every call with the function's instructions.
inline double length(double x, double y = 0.0)
{
    return std::sqrt(x * x + y * y);
}
}
