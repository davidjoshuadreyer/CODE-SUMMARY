/*
 * TestPolymorphism.cpp
 *
 *  Created on: Dec 28, 2021
 *      Author: mao
 *      A virtual function is a member function
 *      you may redefine for other derived classes,
 *      and can ensure that the compiler will call
 *      the redefined virtual function for an object
 *      of the corresponding derived class, even if
 *      you call that function with a pointer or
 *      reference to a base class of the object.
 */

#include <iostream>
using namespace std;

class Class1 {
public:
	virtual void f() {
		cout << "Function f() in Class1\n";
	}
	void g() {
		cout << "Function g() in Class1\n";
	}
};

class Class2 : public Class1{
public:
	virtual void f() {
		cout << "Function f() in Class2\n";
	}
	void g() {
		cout << "Function g() in Class2\n";
	}
};

class Class3 : public Class2 {
public:
	virtual void h() {
		cout << "Function h() in Class3\n";
	}
};

int testPolymorphism() {
	Class1 object1, *p;
	Class2 object2;
	Class3 object3;
	p = &object1;
	p->f();
	p->g();
	p = (Class1*) &object2;
	p->f();
	p->g();
	p = (Class1*) &object3;
	p->f(); 
	p->g();
	// p->h(); // h() is not a member of Class1;
	return 0;
}
