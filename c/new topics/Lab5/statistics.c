#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "statistics.h"

//Compute mean from sum and count
double mean(const double sum, const int count)
{
    double result;
    
    result = sum / count;
    
    return result;
}


//Compute sample standard deviation from sum, sum of squares, and count
double ssdev(const double sum, const double sumsq, const int count)

{
    double result;
    
    result = sqrt(((count * sumsq) - (sum * sum)) / (count * (count - 1)));
    
    return result;
}