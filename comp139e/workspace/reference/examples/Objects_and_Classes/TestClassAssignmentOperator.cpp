/*
 * TestClassAssignmentOperator.cpp
 *
 *  Created on: Jan. 21, 2022
 *      Author: mao
 */

#include <iostream>
using namespace std;

class SimpleCircle{

public:
	double radius;
	SimpleCircle(): radius(0.5){
		// Extra statements
	}
	SimpleCircle(double r): radius(5.0){
		// Extra statements
	}
};

int testClassAssignmentOperator ()
{

	SimpleCircle circle1(5.0);
	SimpleCircle circle2;
	circle2 = circle1;
	cout<< circle1.radius << endl;
	cout<< circle2.radius << endl;

	return 0;

}
