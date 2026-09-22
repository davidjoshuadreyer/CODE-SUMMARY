#include "AllTests.h"
    
#include <iostream>
using namespace std;

double CircleX::x = 5;

CircleX::CircleX()
{
    r = 5.0;
}

void CircleX::printArea()
{
    cout << "Area size is: "<< r*r*3.14 << endl;

}